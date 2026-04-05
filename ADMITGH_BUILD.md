# AdmitGH — Complete Build Guide

> Drop this file into your `admitgh1/` project root. Also drop `admitgh-prototype.jsx` next to it.
> In Claude Code, say: "Read ADMITGH_BUILD.md and admitgh-prototype.jsx, then start Phase 1."
> After each phase, Claude Code will stop. Review the files, test them, then say "Continue to Phase X."

> **VS CODE TIP:** If files don't appear in the sidebar after creation, press `Ctrl+Shift+E` to open Explorer, or click the refresh icon at the top of the file explorer. You can also right-click the folder and select "Refresh."

> **DEV SERVER:** Always use `npm run dev -- --webpack` (Turbopack doesn't work on this machine).

---

## PROJECT OVERVIEW

**AdmitGH** helps Ghanaian SHS graduates navigate university admissions.

**Flow:** Landing → Sign In → Dashboard (enter program, electives, grades) → See aggregate → Browse matching universities → Track applications → Get AI advice → Find scholarships → Contact counselors.

**Rules:**
1. **Scalability** — reusable components, typed data, no hardcoded logic
2. **Quality** — strict TypeScript, error/loading states, validation
3. **Speed** — Server Components default, `"use client"` only for interactive parts, lazy load chatbot

---

## DESIGN SYSTEM

**Colors (add to tailwind.config.ts as custom colors):**
- bg-app: #0f0d0b
- bg-sidebar: #16130f  
- gold: #fbbf24
- gold-dark: #d97706
- text-main: #faf5ef
- text-sub: #a09080
- text-muted: #666666
- success: #4ade80
- warning: #f97316
- error: #ef4444

**Fonts:** Playfair Display (headings), DM Sans (body) — import from Google Fonts in layout.tsx.

**Brand:** Gold gradient rounded square with letter "A", app name "AdmitGH" in gold bold.

---

## DATA — Types & Constants

The prototype file (`admitgh-prototype.jsx`) contains all data. Extract it into:

### `lib/types.ts`
```typescript
export interface Profile {
  name: string;
  program: string | null;
  electives: string[];
  grades: Record<string, string>; // { "English Language": "B2", ... }
  applied: Record<number, string | null>; // { 1: "Applied", 2: "Accepted" }
}

export interface University {
  id: number;
  name: string;
  abbr: string;
  city: string;
  founded: number;
  size: string;
  email: string;
  phone: string;
  site: string;
  apply: string;
  window: string;
  motto: string;
  deadlineDate: string;
  courses: Program[];
}

export interface Program {
  title: string;
  cutoff: number;
  needs: string[];
  dept: string;
  careers: string;
}

export interface Scholarship {
  name: string;
  provider: string;
  type: string;
  eligibility: string;
  deadline: string;
  link: string;
  aggReq: number | null;
}

export interface Counselor {
  name: string;
  area: string;
  tel: string;
  mail: string;
  city: string;
  about: string;
  photo: string; // initials like "AS"
}
```

### `lib/data.ts`
Copy ALL data arrays from the prototype: GRADES, GV, CORE, SHS_PROGRAMS, UNIVERSITIES, SCHOLARSHIPS, COUNSELORS. Type them properly using the interfaces above.

### `lib/helpers.ts`
Copy these functions from the prototype:
- `calcAgg(grades, electives)` → returns number | null
- `aggColor(agg)` → returns hex string
- `aggLabel(agg)` → returns string
- `countMatches(agg, electives)` → returns number
- `daysUntil(dateStr)` → returns number

---

## PHASE 1: Foundation (do this first, stop after)

1. Configure `tailwind.config.ts` with custom colors above
2. Set up `app/layout.tsx` with Google Fonts (Playfair Display + DM Sans), dark background, metadata
3. Create `lib/types.ts`, `lib/data.ts`, `lib/helpers.ts` from prototype data
4. Create reusable UI components in `components/ui/`:
   - `Tag.tsx` — colored badge/pill (see prototype's Tag component)
   - `Card.tsx` — dark card with border (see prototype's Box component)  
   - `GoldButton.tsx` — gradient gold button
   - `SectionTitle.tsx` — section header with optional action button
   - `GradeSelect.tsx` — grade dropdown for a single subject
5. Verify: `npm run dev -- --webpack` runs without errors

**Test:** Open localhost:3000, should show default Next.js page but with dark background and fonts loaded.

---

## PHASE 2: Landing Page + Auth Page

1. Build `app/page.tsx` (landing page) — Server Component, no "use client"
   - Nav bar with logo + "Get Started" button
   - Hero: "Find Your Perfect University Match" with Playfair Display
   - Stats row: 6+ Universities, 50+ Programs, AI Advisor, Free
   - "Get Started" links to /auth
2. Build `app/auth/page.tsx` — simple name input for now (Supabase auth comes in Phase 6)
   - On submit, store name in localStorage and redirect to /dashboard
3. Create a `lib/useProfile.ts` custom hook:
   - Reads/writes profile to localStorage
   - Returns { profile, setProfile, isLoaded }
   - All components use this hook for profile state

**Test:** Landing page renders. Click "Get Started" → enter name → redirected to /dashboard.

---

## PHASE 3: App Layout + Dashboard

1. Build `components/layout/AppShell.tsx` ("use client"):
   - Desktop: fixed sidebar (210px) + main content
   - Mobile: hamburger header + slide-in sidebar with overlay
   - Sidebar contains: logo, user greeting, nav items, aggregate display, sign out
   - Uses CSS media queries or Tailwind responsive classes
2. Build `app/dashboard/layout.tsx` — wraps all app pages in AppShell
3. Build `app/dashboard/page.tsx` — the merged dashboard + profile:
   - Stats row (aggregate, matches, applied count) — `components/home/StatsRow.tsx`
   - Program selector — `components/home/ProgramSelector.tsx`
   - Elective picker — `components/home/ElectivePicker.tsx`
   - Grade entry (collapsible) — `components/home/GradeEntry.tsx`
   - Applications list — `components/home/ApplicationsList.tsx`
   - Quick action cards — `components/home/QuickActions.tsx`

**Test:** Full dashboard works. Select program, pick 4 electives, enter grades, see aggregate calculate.

---

## PHASE 4: Universities

1. Build `app/dashboard/universities/page.tsx` — university list
   - Uses `components/universities/UniCard.tsx`
   - Shows monogram, abbr, city, program count, match count, deadline badge
   - Clicking a card navigates to detail page
2. Build `app/dashboard/universities/[id]/page.tsx` — university detail
   - Header card with monogram, name, motto, city, est. year
   - Stats row: students, programs, admissions window, eligible count
   - Contact card with clickable email/phone/website links
   - AI Insight card (hardcoded logic for now, Claude API in Phase 7)
   - Apply Now link + application status buttons (Applied/Pending/Accepted/Rejected)
   - Program list with eligibility badges, required electives, career paths
   - Deadline countdown (X days left to apply)
   - Compare button (basic version)

**Test:** Browse universities. Click one. See all details. Mark as "Applied". Go back to dashboard, see it in applications list.

---

## PHASE 5: Scholarships + Counselors + What-If + Compare

1. Build `app/dashboard/scholarships/page.tsx`
   - List of scholarships with eligibility based on aggregate
   - Green badge if student may qualify, orange if not
2. Build `app/dashboard/counselors/page.tsx`
   - Expandable cards with bio
   - Clickable WhatsApp (wa.me/), Email (mailto:), Call (tel:) links
3. Add What-If Simulator to dashboard:
   - `components/home/WhatIfSimulator.tsx`
   - Temporary grade changes, shows current vs what-if aggregate + match diff
4. Add University Comparison:
   - `components/universities/UniComparison.tsx`
   - Side-by-side stats for two universities

**Test:** All four features working. What-If shows new matches when grades change. Scholarships match to aggregate. Counselor links open correctly. Comparison shows two unis side by side.

---

## PHASE 6: Supabase Auth + Database

1. Install Supabase: `npm install @supabase/supabase-js @supabase/ssr`
2. Create Supabase project at supabase.com
3. Add env vars to `.env.local`: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Create `lib/supabase.ts` — client initialization
5. Replace localStorage with Supabase:
   - Auth: email/password sign up + sign in
   - profiles table: stores name, program, electives, grades
   - applications table: stores university applications with status
6. Add middleware for protected routes (redirect to /auth if not signed in)

**Test:** Sign up, sign in, data persists across browser refreshes and devices.

---

## PHASE 7: Claude AI Chatbot

1. Get API key from console.anthropic.com
2. Add to `.env.local`: ANTHROPIC_API_KEY
3. Build `app/api/chat/route.ts`:
   - POST endpoint
   - Receives { message, profile }
   - Calls Claude API with system prompt (see below)
   - Streams response back
4. Build `components/chat/ChatBubble.tsx` ("use client", lazy loaded):
   - Floating gold circle at bottom-right with robot emoji
   - Expands to chat window
   - Quick question buttons
   - Message input
   - Supports receiving initial message from "Ask AI more" buttons
5. Lazy load ChatBubble in AppShell: `const ChatBubble = dynamic(() => import(...), { ssr: false })`

### Claude System Prompt:
```
You are AdmitGH AI Advisor — a friendly, knowledgeable Ghanaian university admissions counselor. 

Student profile:
- Name: {name}
- SHS Program: {program}
- Electives: {electives}
- Grades: {grades}
- Aggregate: {aggregate}

You know about Ghanaian universities, programs, cut-offs, scholarships, and career paths.

Rules:
1. Be encouraging but honest about chances
2. Reference specific programs and universities
3. Suggest remarking if aggregate is 18+
4. Recommend scholarships when relevant
5. Keep responses concise (2-4 sentences unless asked for detail)
6. Use simple language for 17-18 year old users
7. Never invent university data
```

**Test:** Chatbot opens, sends message, gets real AI response based on student profile.

---

## PHASE 8: Polish + Deploy

1. Add loading skeletons for all pages
2. Add error boundaries
3. Test mobile responsiveness thoroughly
4. Add page metadata (titles, descriptions) for SEO
5. Deploy to Vercel: `npx vercel`
6. Set environment variables in Vercel dashboard
7. Test production build

---

## SHS DATA REFERENCE

**Core subjects (everyone takes these 4):**
English Language, Core Mathematics, Integrated Science, Social Studies

**Elective pools (student picks 4 from their program):**

| Program | Electives |
|---------|-----------|
| General Science | Physics, Chemistry, Biology, Elective Mathematics, ICT, Geography, Computing |
| General Arts | Literature in English, Government, History, Economics, Geography, French, Christian Religious Studies, Ghanaian Language |
| Business | Financial Accounting, Business Management, Economics, Cost Accounting, Elective Mathematics, ICT |
| Visual Arts | Graphic Design, Picture Making, Sculpture, Textiles, Ceramics, Leatherwork |
| Home Economics | Food & Nutrition, Management in Living, Textiles, Chemistry, Biology |
| Agricultural Science | General Agriculture, Animal Husbandry, Chemistry, Physics, Biology, Elective Mathematics |
| Technical | Technical Drawing, Auto Mechanics, Building Construction, Woodwork, Metalwork, Applied Electricity |

**Aggregate calculation:**
Best 3 core grades + Best 3 elective grades. A1=1, B2=2...F9=9. Range: 6 (perfect) to 54. Lower is better.

---

## QUICK REFERENCE — What to tell Claude Code at each phase:

- **Phase 1:** "Read ADMITGH_BUILD.md and admitgh-prototype.jsx. Start Phase 1 — set up the foundation: tailwind config, fonts, types, data, helpers, and reusable UI components."
- **Phase 2:** "Continue to Phase 2 — build the landing page and auth page with localStorage profile."
- **Phase 3:** "Continue to Phase 3 — build the AppShell layout with sidebar and the full dashboard page."
- **Phase 4:** "Continue to Phase 4 — build university list and detail pages with all features."
- **Phase 5:** "Continue to Phase 5 — add scholarships, counselors, what-if simulator, and comparison."
- **Phase 6:** "Continue to Phase 6 — add Supabase auth and database, replace localStorage."
- **Phase 7:** "Continue to Phase 7 — add Claude API chatbot with streaming responses."
- **Phase 8:** "Continue to Phase 8 — polish, add loading states, error handling, and deploy."
