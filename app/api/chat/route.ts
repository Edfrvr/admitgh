import { calcAggregate, aggregateLabel } from "@/lib/helpers";
import type { GradeMap } from "@/lib/types";
import type { NextRequest } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  profile: {
    name: string;
    program: string | null;
    electives: string[];
    grades: GradeMap;
  };
}

interface AnthropicTextDelta {
  type: "text_delta";
  text: string;
}

interface AnthropicContentBlockDeltaEvent {
  type: "content_block_delta";
  index: number;
  delta: AnthropicTextDelta | { type: string };
}

type AnthropicEvent = AnthropicContentBlockDeltaEvent | { type: string };

// ─── System prompt builder ─────────────────────────────────────────────────────

function buildSystemPrompt(profile: ChatRequestBody["profile"]): string {
  const agg = calcAggregate(profile.grades, profile.electives);
  const aggLine =
    agg !== null
      ? `${agg} / 54 — ${aggregateLabel(agg)}`
      : "Not yet computed (grades not entered)";

  const gradesLines =
    Object.keys(profile.grades).length > 0
      ? Object.entries(profile.grades)
          .map(([subj, grade]) => `  - ${subj}: ${grade}`)
          .join("\n")
      : "  (none entered yet)";

  return `You are AdmitGH AI Advisor — a friendly, knowledgeable Ghanaian university admissions counselor.

Student profile:
- Name: ${profile.name || "Student"}
- SHS Program: ${profile.program ?? "Not selected"}
- Electives: ${profile.electives.length > 0 ? profile.electives.join(", ") : "None selected"}
- WASSCE Grades:
${gradesLines}
- Aggregate: ${aggLine}

You know about Ghanaian universities, programs, WASSCE cut-offs, scholarships, and career paths.

Rules:
1. Be encouraging but honest about chances — never give false hope
2. Reference specific programs and universities when relevant
3. Suggest remarking (re-sitting exams) if aggregate is 18 or higher
4. Recommend relevant scholarships when appropriate
5. Keep responses concise — 2 to 4 sentences unless the student asks for detail
6. Use simple, clear language appropriate for 17–18 year old users
7. Never invent university data or fabricate cut-off scores
8. If grades are not entered, encourage the student to add them for personalised advice`;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "AI advisor is not configured. Add ANTHROPIC_API_KEY to .env.local." },
      { status: 503 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, profile } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array is required." }, { status: 400 });
  }

  // Validate each message has the expected shape
  for (const msg of messages) {
    if (
      typeof msg.content !== "string" ||
      (msg.role !== "user" && msg.role !== "assistant")
    ) {
      return Response.json({ error: "Invalid message format." }, { status: 400 });
    }
  }

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: buildSystemPrompt(profile),
      messages,
      stream: true,
    }),
  });

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    console.error("Anthropic API error:", anthropicResponse.status, errorText);
    return Response.json({ error: "AI service error. Please try again." }, { status: 502 });
  }

  // Transform the Anthropic SSE stream into a plain text stream.
  // Each chunk sent to the client is the raw text delta — no SSE overhead.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicResponse.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split on newlines but keep the last (possibly incomplete) line in the buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const event = JSON.parse(data) as AnthropicEvent;
              if (
                event.type === "content_block_delta" &&
                "delta" in event &&
                event.delta.type === "text_delta"
              ) {
                controller.enqueue(
                  encoder.encode((event.delta as AnthropicTextDelta).text)
                );
              }
            } catch {
              // Skip malformed JSON — Anthropic occasionally sends non-data lines
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
      "X-Accel-Buffering": "no", // Disable nginx buffering so chunks arrive immediately
    },
  });
}
