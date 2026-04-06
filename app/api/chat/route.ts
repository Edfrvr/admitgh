import Groq from "groq-sdk";
import { calcAggregate, aggregateLabel } from "@/lib/helpers";
import type { GradeMap } from "@/lib/types";
import type { NextRequest } from "next/server";

// ─── Models ───────────────────────────────────────────────────────────────────

const PRIMARY_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

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

  return `You are AdmitGH AI Advisor, a friendly Ghanaian university admissions counselor helping SHS graduates. Student profile: Name: ${profile.name || "Student"}, Program: ${profile.program ?? "Not selected"}, Electives: ${profile.electives.length > 0 ? profile.electives.join(", ") : "None selected"}, Grades:\n${gradesLines}\nAggregate: ${aggLine}. Be concise (2-4 sentences). Be encouraging but honest. Never invent data. Suggest remarking if aggregate is 18+.`;
}

// ─── Stream builder ───────────────────────────────────────────────────────────

async function createStreamResponse(
  groq: Groq,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<Response> {
  const stream = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    max_tokens: 500,
    stream: true,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: "AI advisor is not configured. Add GROQ_API_KEY to .env.local." },
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

  for (const msg of messages) {
    if (
      typeof msg.content !== "string" ||
      (msg.role !== "user" && msg.role !== "assistant")
    ) {
      return Response.json({ error: "Invalid message format." }, { status: 400 });
    }
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const systemPrompt = buildSystemPrompt(profile);

  try {
    return await createStreamResponse(groq, PRIMARY_MODEL, systemPrompt, messages);
  } catch (primaryErr) {
    const isRateLimit =
      primaryErr instanceof Groq.APIError && primaryErr.status === 429;

    if (isRateLimit) {
      try {
        return await createStreamResponse(groq, FALLBACK_MODEL, systemPrompt, messages);
      } catch (fallbackErr) {
        console.error("Groq fallback model error:", fallbackErr);
        return Response.json(
          { error: "AI service is currently rate limited. Please try again in a moment." },
          { status: 429 }
        );
      }
    }

    console.error("Groq API error:", primaryErr);
    return Response.json(
      { error: "AI service error. Please try again." },
      { status: 502 }
    );
  }
}
