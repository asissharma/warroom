# INTEL·OS — LLM Build Brief
## Version 2.0 Upgrade Spec

> You are building improvements to INTEL·OS — a personal 180-day engineering training OS built on Next.js 16, React 18, MongoDB (Mongoose), Zustand, TailwindCSS 3, and Three.js (R3F). The stack already exists. You are NOT starting from scratch. You are making targeted, high-leverage changes to a working codebase. Every instruction below is exact. Do not invent architecture. Do not add complexity that isn't specified. Ship what's here, nothing more.

---

## 0. CLEANUP FIRST — Run these before touching anything else

These are blockers. Do them in this order.

### 0A. Kill dead dependencies
```bash
npm remove @xyflow/react
```
Then delete every file that imports from `@xyflow/react`. The `WorkNode.tsx` component is dead. Delete it. If `BrainCanvasHost.tsx` references it, remove that import.

### 0B. Delete IntelRecord model
- Open `lib/models/` and delete `IntelRecord.ts` (or whatever file defines the `IntelRecord` mongoose model).
- Search the entire codebase for `IntelRecord` and remove every import and usage.
- The replacement is `IntelNode`. Everything that was reading from `IntelRecord` should now read from `IntelNode`.

### 0C. Seed-and-drop JSON mirror models
The following Mongoose models are exact mirrors of static JSON files and serve no additional purpose:
`Project`, `Question`, `SpineEntry`, `BasicSkill`, `PayableSkill`, `SurvivalArea`, `Course`

Do this:
1. Create `lib/seedDb.ts` — a function that, on server startup, checks if MongoDB collections are empty and seeds them from the corresponding JSON files in `data/`.
2. Call `seedDb()` inside `lib/dbConnect.ts` after connection is established.
3. Once seeded, all API routes and engines that currently read from static JSON must read from MongoDB instead. Update `dayEngine.ts` to use `await Model.find()` instead of `import data from '../data/x.json'`.
4. After confirming seed works, delete the 7 JSON files from `data/`. They are now in MongoDB.

### 0D. Fix TypeScript errors
Open `tsc-errors.txt`. Fix every error in it. After fixing, delete the file. Run `tsc --noEmit` and confirm zero errors before proceeding.

---

## 1. AUTO-WIRE THE SHADOW ENGINE — Priority 1, highest leverage

Right now `shadowEngine.ts` has 4 AI functions that never fire automatically. That's the biggest gap in the product. Fix it.

### What to build:
Inside `/api/task/route.ts` (the POST handler that marks a task complete), after the task is saved to MongoDB and the carry-forward is resolved, add this logic:

```typescript
// After task is saved:
const shouldRunShadow = await shouldTriggerShadow(dayRecord);
if (shouldRunShadow) {
  // Non-blocking — don't await, don't fail the request if this fails
  synthesizeIntel(dayN, completedTaskIds).catch(console.error);
}
```

`shouldTriggerShadow(dayRecord)` returns `true` when:
- The user has just completed their 5th, 10th, or 17th task of the day (milestone moments), OR
- A TechSmith task was just completed (those are the learning-dense ones)

### Also wire `enrichTask()`:
Inside `/api/day/route.ts`, after `buildDayPayload()` runs, call:
```typescript
const enrichedPayload = await enrichTasksWithContext(payload, recentLogRecords);
```

`enrichTasksWithContext` calls `shadowEngine.enrichTask()` for the top 2 tasks of the day (PROJECT tasks only) and patches their descriptions with personalized context from past blockers. Cache the result in MongoDB as `DayRecord.enrichedTasks` so it doesn't re-run on page refresh.

### `generateWeeklyDigest()` trigger:
On every day that `isReviewDay(dayN)` returns true, AND the user marks the day complete, call `generateWeeklyDigest()` and store the result in a new MongoDB document:

**New model: `WeeklyDigest`**
```typescript
{
  weekNumber: Number, // Math.ceil(dayN / 7)
  dayN: Number,
  generatedAt: Date,
  mastered: [String],   // Topics AI says are solid
  fragile: [String],    // Topics AI says need review
  skipRisk: [String],   // Topics at risk of being forgotten
  rawText: String       // Full AI response
}
```

Expose this via `/api/digest?week=N`. The frontend will display it (see Section 4).

---

## 2. DASHBOARD PAGE — `/dashboard`

Create `app/dashboard/page.tsx`. This is a stats and progress page. It must be fast — use `SWR` for all data fetching, same pattern as the rest of the app.

### Layout:
Single-column, no sidebar. Dark-mode-first. Uses the existing design system (Bebas Neue for numbers, Outfit for labels, existing color tokens).

### Sections to build, in order top to bottom:

**Section A: Mission Header**
```
DAY 9 / 180        5% COMPLETE        PHASE: FOUNDATION
[progress bar — full width, shows 9/180 filled, color matches phase]
```

**Section B: Streak Card**
```
[Large number] 3   CURRENT STREAK
[Small number] 12  LONGEST STREAK
[Small text]   Last active: yesterday
```
Read from `User.streak` and compute `longestStreak` by querying `DayRecord` for the longest consecutive run of `isComplete: true`.

**Section C: This Week snapshot**
```
WEEK 2  (Days 8–14)
[7 day dots — each dot is colored if complete, gray if not, pulsing if today]
Completed: 6/7  |  Tasks done: 89  |  Carried: 3
```

**Section D: Carry-Forward Health**
Show a small table:
```
Task                         Carried N times    Status
Build: JWT Auth System       ×3                 Overdue
git commit — explain why     ×1                 Active
```
Source: `CarryForward` collection, `resolved: false`. Sort by times carried descending. Cap at 5 rows. Add a "Resolve" button per row that calls `PATCH /api/carry/:id` to mark it resolved.

**Section E: Latest Weekly Digest** (only shows if `WeeklyDigest` exists for current or previous week)
```
WEEK 1 COACHING REPORT
✓ Mastered: Python loops, Git basics, HTTP fundamentals
⚠ Fragile: Async/await patterns, decorator syntax
✗ Skip risk: Big-O notation, regex
```
If no digest exists yet, show: "Complete a review day to unlock your AI coaching report."

**Section F: Phase Timeline mini-map**
8 horizontal blocks, one per phase. Current phase is highlighted. Each block shows `X% done`. Read from `DayRecord` count vs expected days in that phase.

### API routes to create:
- `GET /api/stats` — returns: `{ dayN, streak, longestStreak, weekSummary, carryItems, phaseProgress[] }`
- `GET /api/digest?week=N` — returns latest `WeeklyDigest` document

---

## 3. PROGRESS RIBBON — Persistent across all views

In `CommandHUD.tsx`, directly below the existing header strip (the one with INTEL·OS branding + Day N/180 + Enter Brain), add a new thin ribbon:

```
DAY 9 · 5% COMPLETE · ████░░░░░░░░░░░░░░░░░ · PHASE: FOUNDATION · 3-DAY STREAK 🔥
```

Implementation:
- It's a single `<div>` with `flex` + `justify-between`, height 28px, `bg-surface2` background, 12px font size, `font-mono`.
- Progress bar: a `<div>` with `w-[5%] bg-accent` inside a `w-full bg-surface` wrapper, height 4px.
- Streak: only show the flame emoji and count if streak ≥ 2. Below 2 it's noise.
- Data: read `dayN` from existing `useDayData` hook. Compute `progressPct = Math.round((dayN / 180) * 100)`.

Do NOT add a new API call for this. Derive everything from data already loaded by the page.

---

## 4. DAY COMPLETION CELEBRATION

When the user clicks "Mark Day Complete" and the API returns success, trigger this sequence in `CommandHUD.tsx`:

1. The task counter (e.g. `17/17`) turns `text-emerald-400` with a 300ms transition.
2. After 200ms delay: show a temporary overlay banner at the top of the task list (not full screen, not a modal):
   ```
   ✓ DAY 9 COMPLETE — 171 days remaining
   [If review day]: WEEK 2 COACHING REPORT GENERATING...
   ```
   Banner appears with `animate-in fade-in slide-in-from-top-2`, disappears after 3 seconds with `animate-out fade-out`.
3. The "Mark Day Complete" button changes to `DAY COMPLETE ✓` and becomes disabled/green.

Implementation: use a local `useState` boolean `dayCompleted`. No new component needed — inline in `CommandHUD.tsx`.

---

## 5. SURFACE courses.json — Wire it into the UI

Right now `courses.json` has 20+ external course references and nothing shows them. Fix this.

### Where to surface it:

**In CommandHUD.tsx**, inside each TechSmith task that has a `resource` URL attached, check if any `Course` in the database matches by URL or provider name. If a match exists, show a small badge next to the external link icon:
```
Read & understand: Loops (for/while/break/continue) [→] [CS50 · 4h]
```
The badge is `text-xs bg-surface2 text-muted px-1.5 py-0.5 rounded`. Pull the course name and estimated hours from the matched `Course` document.

**In WorkCanvas.tsx**, add a new collapsible section below "All Projects" called:
```
📚 RECOMMENDED COURSES
20 COURSES · 8 PROVIDERS
```
Inside, group courses by `provider`. Each course shows: title, provider, estimated hours, and a clickable external link. Style: same amber theme as the existing sections, simple list layout.

**New API route**: `GET /api/courses` — returns all `Course` documents from MongoDB. Use SWR in WorkCanvas to fetch this.

---

## 6. SURVIVAL AREAS — Add temporal framing

Right now Survival Areas show 7 critical domains with `CRITICAL`/`HIGH` badges and no context for when to tackle them. Add this:

In `WorkCanvas.tsx`, inside the Survival Areas section, above the list of domains, add a new "THIS WEEK'S FOCUS" callout:

```
THIS WEEK'S FOCUS  (Days 8–14, Phase 1)
→ System Design   — 2 drills remaining this week
→ Advanced Security — Review checkpoint in 5 days
```

Logic:
- Call `getSurvivalForDay(dayN)` for each day in the current week (days `weekStart` to `weekStart+6`).
- Aggregate which survival areas appear most in that window.
- Show the top 2.
- "drills remaining" = count of days in current week that include this survival area and aren't yet complete.

This requires no new API. Use `dayEngine.getSurvivalForDay()` client-side (import directly, it's a pure function).

---

## 7. HUMAN SKILLS — Fix the visual hierarchy

The current 2-column flat grid of 119 skills is unreadable. Redesign it in `WorkCanvas.tsx`.

### Current: flat 2-column grid of all 119 skills
### New: grouped by category, collapsible per category

Each of the 18 categories becomes its own collapsible row:
```
▶ COGNITION (13 skills)
▶ COMMUNICATION (8 skills)
▶ LEADERSHIP (7 skills)
...
```

When expanded:
```
▼ COGNITION (13 skills)
  Critical thinking     Analytical thinking
  Decision-making       Working memory
  ...
```

Implementation:
- Replace the existing `skills.map(...)` flat render with a `groupBy(skills, 'category')` approach.
- Add `useState<Set<string>>` for `expandedCategories`. Default: first category is expanded, rest collapsed.
- Each category header is a `<button>` with `flex justify-between`. Chevron rotates on expand.
- The 2-column grid only renders for expanded categories. Use `max-h-0 overflow-hidden` → `max-h-screen` with `transition-all duration-200` for the expand animation.
- No new API calls. Data is already loaded.

---

## 8. QUICK CAPTURE — Keyboard shortcut log entry

The most friction-full moment in any learning session is when you have a realization and need to log it. Right now you have to open the Intel Panel, go to Manual Input, fill a form. That's 5 steps.

Build a global keyboard shortcut: `Cmd+K` (or `Ctrl+K`) opens a floating capture bar.

### Component: `QuickCapture.tsx`

```
[  What did you just learn or realize?  _________________________ ] [LOG IT]
```

- Position: `fixed bottom-6 left-1/2 -translate-x-1/2`, `w-[560px]`, `z-50`
- Appears/disappears with `animate-in fade-in slide-in-from-bottom-4`
- `Escape` closes it. `Enter` submits.
- On submit: POST to `/api/intel` with `{ type: 'insight', title: input, source: 'quick-capture', dayN, phase }`. Auto-tag with current day and phase.
- After successful POST: show a 1-second toast in the same position: `✓ Logged to Brain` then dismiss.
- Register the keyboard listener in `app/layout.tsx` or `app/page.tsx` so it works globally across all views.

---

## 9. SMART CARRY-FORWARD DISPLAY

Right now the carry-forward section in `CommandHUD.tsx` shows all carried tasks equally. Make it smarter.

### Changes:

**Sort by urgency:**
```typescript
// Urgency score = (timesCarried * 2) + (daysSinceOriginal * 0.5)
```
Highest score floats to top.

**Add a "skip" action:**
Each carry-forward item gets a `Skip today →` button (small, text-only, `text-muted hover:text-danger`). Clicking it calls `PATCH /api/carry/:id` with `{ action: 'skip' }` which increments a `timesSkipped` counter on the `CarryForward` document but does NOT resolve it. It just removes it from today's visible list.

**Add a warning threshold:**
If any carry-forward has been carried 5+ times, show it with a red left border and the text:
```
⚠ Carried 5 times — consider dropping or rescheduling
```

---

## 10. INTEL NODE — Connection viewer

When a user clicks an `IntelNode` in the `IntelFeed.tsx`, the current `NodeDetailCard.tsx` shows the node's details. Add a "Connections" tab to that card.

### In `NodeDetailCard.tsx`:

Add two tabs at the top of the card: `Details` | `Connections`

In the Connections tab:
- Show a list of connected nodes (from `node.connections[]`).
- Each connected node shows: title, type badge, and day it was created.
- Each is clickable — clicking loads that node's detail card (replace current card content).
- If `node.connections` is empty: show "No connections yet. The brain will auto-link related nodes as you learn more."

**New API call**: `GET /api/intel/:id/connections` — returns the full `IntelNode` documents for all IDs in `node.connections[]`.

---

## FINAL CHECKLIST — Before you consider this done

Run through every item:

- [ ] `@xyflow/react` removed from `package.json` and `node_modules`
- [ ] `IntelRecord` model deleted, all references removed
- [ ] JSON mirror models seeded to MongoDB and JSON files deleted
- [ ] `tsc --noEmit` returns zero errors
- [ ] Shadow engine auto-fires on task 5, 10, 17 completion and on TechSmith task completion
- [ ] `enrichTask()` called on page load for PROJECT tasks, result cached in `DayRecord.enrichedTasks`
- [ ] `generateWeeklyDigest()` fires on review day completion, stores `WeeklyDigest` document
- [ ] `/dashboard` page exists with all 6 sections (header, streak, week snapshot, carry health, digest, phase map)
- [ ] Progress ribbon shows below header in CommandHUD
- [ ] Day completion banner fires and auto-dismisses after 3 seconds
- [ ] `courses.json` data seeded to MongoDB, courses surfaced in TechSmith task badges + WorkCanvas section
- [ ] Survival Areas shows "This Week's Focus" callout
- [ ] Human Skills renders as grouped, collapsible categories (not flat grid)
- [ ] `Cmd+K` / `Ctrl+K` opens QuickCapture globally, logs to `/api/intel`, shows success toast
- [ ] Carry-forward items sorted by urgency score, have skip action, show ×5 warning
- [ ] Intel node detail card has Details | Connections tabs

Do not ship with any of these unchecked.

---

## CONSTRAINTS — Do not violate these

1. **No new dependencies** except if strictly required. Prefer using what's already installed (SWR, Zustand, TailwindCSS, Mongoose).
2. **Design system is frozen.** Use existing color tokens (`bg`, `surface`, `surface2`, `accent`, `muted`, `danger`, `success`). Use existing fonts (`--font-bebas`, `--font-body`, `--font-mono`). Do not introduce new color values.
3. **All new API routes follow the existing pattern** — `app/api/[route]/route.ts`, connect via `dbConnect()`, return `NextResponse.json()`.
4. **No full-page loading states.** Use SWR's `isLoading` for skeleton states only where data is slow. Fast reads should render immediately.
5. **Mobile is not a priority** but don't break it. Use responsive Tailwind classes where it's trivial.
6. **The Shadow Engine is slow (AI calls).** Every call to it must be non-blocking. Never `await` a shadow engine call inside a request handler that the user is waiting on. Use `.catch(console.error)` and fire-and-forget.
