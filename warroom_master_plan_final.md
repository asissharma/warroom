# Warroom — Master Implementation Plan (Final)

> **Rule:** Every task is designed for one AI agent call. No task touches more than 3 files.
> Complete each task fully before starting the next. Do not skip steps.

---

## Tool Setup — Antigravity

Use **Google Antigravity** as your primary agent. It handles every task in this plan.

**Recommended Antigravity configuration:**
- Terminal policy: `Agent Decides` — lets the agent run `tsc --noEmit`, `ts-node`, and `curl` without blocking you at every step.
- Review policy: `Review-driven development` — agent proposes a Plan Artifact before acting. Read it. If it looks wrong, annotate and redirect before it writes code.
- Model: `Gemini 3.1 Pro` — 2M context window handles the full codebase comfortably.

**How to feed tasks to Antigravity:**
Copy each task's `What to do` block verbatim as your agent directive. The `Done when` block is your verification criteria — paste it into the agent as "verify this before marking done." The agent will generate an Implementation Plan Artifact; check the file list matches the `Files` section before approving execution.

**When Antigravity loses context mid-task** (known stability issue as of April 2026): stop, undo changes to that point using the rollback option, split the task manually if needed, and restart. The 3-file limit per task is your primary defence against this.

**Gemini CLI:** Not required. Use it only if you want to run seed scripts or `curl` tests from a pure terminal outside Antigravity. Install with `npm install -g @google/gemini-cli` if needed for Phase 1 verification.

---

## Quick Reference

| Stat | Value |
|---|---|
| Total phases | 7 |
| Total atomic tasks | 61 |
| Auth required | None |
| Free DB cap | MongoDB Atlas M0 — 512 MB |
| Syllabuses | 7 (all seeded from existing JSON files) |
| Deployment | Vercel Hobby (free) |
| AI provider | Ollama Cloud (free tier, API key from ollama.com/settings) |

---

## Corrections Applied to This Version

The following issues from the previous draft were fixed inline. Each affected task is marked with `[CORRECTED]`.

| # | Location | Issue Fixed |
|---|---|---|
| 1 | P0.3 | Added compound index `{syllabusSlug:1, title:1}` to support `$regex` search without full collection scan |
| 2 | P0.5 | Settings singleton filter changed from `{}` to `{_id:'singleton'}` to prevent matching wrong document |
| 3 | P2.3 | Added `if (results.length === 0) return 0` guard — formula produced NaN on empty results |
| 4 | P3.1 | Replaced full in-memory item load (2000+ docs) with targeted DB-level queries. Added missed-day gap detection. Added carry-forward detection for incomplete sessions. |
| 5 | P3.3 | Reversed save order — session.results written first, then item SM2 update. Prevents data loss if second write fails. |
| 6 | P4.10 | Session GET response now populates full item documents. Eliminates N+1 per-card fetches in the daily screen. |
| 7 | P5.1 | Replaced 7 parallel `countDocuments` with single aggregation pipeline. One DB round-trip instead of seven. |

---

## Standardized Schema (core architectural decision)

Every syllabus shares the same two collections. Adding a new syllabus in the future means uploading one JSON file — nothing else changes.

### `syllabuses` collection — one document per syllabus

```
slug              string — unique key, e.g. "system-design-questions"
name              string
itemType          'question' | 'topic' | 'project' | 'skill' | 'resource' | 'gap'
daily.enabled     boolean
daily.weight      1–10 (how much of daily budget comes from this syllabus)
daily.strategy    'sm2' | 'sequential' | 'priority' | 'random'
daily.maxPerSession  number
totalItems        number (denormalized for display)
```

### `syllabusitems` collection — all items from all syllabuses

```
syllabusSlug      string — indexed, denormalized
title             string
difficulty        1 | 2 | 3
phase             string (e.g. 'foundation', 'intermediate', 'advanced')
orderIndex        number — for sequential strategies
status            'not_started' | 'in_progress' | 'done' | 'skipped' | 'retired'
completedCount    number
skippedCount      number
lastTouchedAt     Date | null

sm2               object | null
  easeFactor        number (default 2.5)
  interval          number (days)
  repetition        number
  nextReviewDate    Date
  timesStruggled    number

gap               object | null
  isFlagged         boolean
  flagCount         number
  severity          'low' | 'medium' | 'critical'
  lastAddressedAt   Date | null

meta              Mixed — type-specific payload
  -- questions:    hint?, answer?, theme?
  -- topics:       domain?, dependencies[], resources[]
  -- projects:     criteria[], buildNotes[], carryForwardCount?
  -- skills:       microPracticePrompt?, chapter?, completionPercent?, source?
  -- resources:    author?, url?, totalChapters?, currentChapter?
  -- gaps:         conceptName?, sourceType?, notes?
```

### `sessions` collection — one document per day

```
date              'YYYY-MM-DD' — unique index
dayNumber         number (calculated from settings.startDate)
plannedMinutes    15 | 30 | 60 | 90
plannedItems      ObjectId[] — ordered queue for the session
populatedItems    SyllabusItem[] — full item docs embedded at session creation (no per-card fetches)
status            'planned' | 'in_progress' | 'completed'
startedAt         Date | null
completedAt       Date | null
results           [{itemId, syllabusSlug, result, timestamp}]
score             number | null (0–100)
itemsDone         number
itemsStruggled    number
itemsSkipped      number
honestNote        string
tomorrowFocus     {topGap, nextTopic, overdueCount} | null
gapAlert          {days: number, severity: 'low'|'critical'} | null
carryForward      ObjectId[] | null — items from yesterday's incomplete session
```

### `settings` collection — single document (singleton)

```
_id                     'singleton' — fixed ID, never changes
startDate               Date
defaultSessionMinutes   30
syllabusConfig          [{slug, enabled, weight, maxPerSession}]
sm2.mediumThreshold     number (default 3)
sm2.criticalThreshold   number (default 5)
ai.enabled              boolean
ai.teachModel           string (e.g. 'gemini-3-flash-preview')
ai.analyseModel         string (e.g. 'deepseek-v3.1:671b')
ai.practiceModel        string
ai.summaryModel         string
ai.fallbackModel        string (e.g. 'gpt-oss:120b')
```

---

## Session Budget (items by time)

| Session length | Item budget |
|---|---|
| 15 min | 5 items |
| 30 min | 10 items |
| 60 min | 18 items |
| 90 min | 28 items |

Priority fill order: carry-forward items (yesterday's incomplete session) → SM-2 overdue (by days overdue DESC) → critical gaps → medium gaps → in-progress items → new items by syllabus weight.

---

## The 7 Syllabuses

| Slug | Source file | Strategy | SM-2 |
|---|---|---|---|
| `system-design-questions` | `data/questions.json` | sm2 | yes |
| `tech-spine` | `data/tech-spine.json` | sequential | no |
| `projects` | `data/projects.json` | sequential | no |
| `soft-skills` | `data/skills.json` (type=soft) | random | no |
| `payable-skills` | `data/skills.json` (type=payable) | sequential | no |
| `survival-gaps` | `data/survival-areas.json` | priority | no |
| `courses` | `data/courses.json` | sequential | no |

---

## Key Design Decisions

**Procrastination solution.** The daily screen asks one question first: how long do you have? Pick 15 min → 5 items, one at a time, Duolingo-style. No list, no decisions, no overwhelm. The engine prioritizes the queue so you never choose what to do next — you just do the card in front of you.

**Extensible syllabus format.** To add any future syllabus (DSA, behavioral, books, anything), write one JSON file and POST it to `/api/syllabus/upload`. The daily engine, Syllabus Pit, and Settings all pick it up automatically. No code changes needed.

**No auth.** Single user, no login, no Clerk. Removes an entire layer of complexity.

**No cron.** SM-2 updates happen at item mark time (P3.3). Gap detection and carry-forward detection happen at session open (P3.1). Vercel Hobby compatible. Zero cost.

**AI is gated.** Phase 7 doesn't start until the full session loop is working end-to-end. AI only appears where it genuinely adds value. Ollama Cloud rate limit (429) triggers silent fallback to `fallbackModel`.

**Phase 0–2 produce zero UI.** Intentional. Schema, seed scripts, and pure engine functions are the foundation. Building UI before these are solid is exactly the mistake the original codebase made.

---

---

## Phase 0 — Wipe and Schema

> Goal: Delete everything old, write every model correctly. No features, no UI.

---

### P0.1 — Delete all old models

**Files to delete:**
- `app/lib/models/Edge.ts`
- `app/lib/models/Intel.ts`
- `app/lib/models/Log.ts`
- `app/lib/models/Node.ts`
- `app/lib/models/Task.ts`
- `app/lib/models/Topic.ts`

**What to do:**
Delete these 6 files. They belong to the old architecture and contradict the new schema design. Remove any imports of these models from any other file.

**Done when:**
Files are gone. Running `grep -r "Edge\|Intel\|Log\|Node\|Task\|Topic" app/lib/models` returns nothing.

**Dependencies:** None
**Type:** Pure cleanup — no DB, no API

---

### P0.2 — Write `Syllabus.ts` model

**Files:**
- `app/lib/models/Syllabus.ts`

**What to do:**
Create the Syllabus mongoose schema matching the standardized schema above. Add a unique index on `slug`. Export as `SyllabusModel`.

**Done when:**
File exports a valid mongoose model. `tsc --noEmit` passes. Unique index on `slug` is defined.

**Dependencies:** P0.1
**Type:** Pure — no DB calls, no API

---

### P0.3 — Write `SyllabusItem.ts` model [CORRECTED]

**Files:**
- `app/lib/models/SyllabusItem.ts`

**What to do:**
Create mongoose schema. Define compound indexes:
- `{syllabusSlug: 1, status: 1}` — for filtering by slug + status
- `{syllabusSlug: 1, 'sm2.nextReviewDate': 1}` — for SM-2 queue queries
- `{syllabusSlug: 1, title: 1}` — for `$regex` title search (prevents full collection scan)
- `{'gap.severity': 1}` — for gap escalation queries

The `meta` field is `Schema.Types.Mixed`. Export as `SyllabusItemModel`.

**Done when:**
File exports a valid mongoose model. All four indexes are defined. `tsc --noEmit` passes.

**Dependencies:** P0.1
**Type:** Pure — no DB calls, no API

---

### P0.4 — Rewrite `Session.ts` model

**Files:**
- `app/lib/models/Session.ts`

**What to do:**
Replace the old schema entirely with the new one defined in the standardized schema section above. Keep the filename identical for import compatibility. Add a unique index on `date`. The `populatedItems` field is `Schema.Types.Mixed` (stores full item snapshots). The `gapAlert` field is optional. The `carryForward` field is an array of ObjectIds. Migration safety: old documents without new fields return `null` or `[]` — do not use `required: true` on new fields.

**Done when:**
Old schema is gone. New schema exports `SessionModel`. Re-running with old DB documents does not throw errors.

**Dependencies:** P0.1
**Type:** Pure — no DB calls, no API

---

### P0.5 — Write `Settings.ts` model [CORRECTED]

**Files:**
- `app/lib/models/Settings.ts`

**What to do:**
Singleton pattern — only one document will ever exist. Define the schema as above. Set `_id` to `String` type (not ObjectId) so you can use a fixed string as the identifier. Add a static method `getSingleton()` that does:

```ts
SettingsModel.findOneAndUpdate(
  { _id: 'singleton' },
  { $setOnInsert: defaultSettings },
  { upsert: true, new: true, setDefaultsOnInsert: true }
)
```

Using `{ _id: 'singleton' }` as the filter — not `{}` — guarantees you always target the same document even if a second settings doc somehow exists.

**Done when:**
File exports `SettingsModel` with `getSingleton()`. Calling it twice returns the same document with `_id === 'singleton'`.

**Dependencies:** P0.1
**Type:** Pure — no DB calls, no API

---

### P0.6 — Update `db.ts` for serverless connection caching

**Files:**
- `app/lib/db.ts`

**What to do:**
Add global connection caching using `global._mongoose` so Vercel serverless functions reuse the existing MongoDB connection instead of opening a new one per request. This is the standard Next.js + Mongoose serverless pattern. Export a single `connectDB()` async function.

**Done when:**
`connectDB()` returns a connection. Calling it twice logs "using cached connection" not "connecting". No memory leak on hot reload.

**Dependencies:** P0.1
**Type:** Vercel free tier safe

---

---

## Phase 1 — Data Pipeline: Seed All 7 Syllabuses

> Goal: Transform all existing JSON files into the standardized SyllabusItem format and load them into MongoDB. After this phase, `GET /api/health` should return real counts.

---

### P1.1 — Write syllabus definitions file

**Files:**
- `scripts/syllabuses.ts`

**What to do:**
Export a `SYLLABUSES` array containing one object per syllabus (all 7). Each object must match the Syllabus schema: `slug`, `name`, `itemType`, `daily` config (strategy, weight, maxPerSession, enabled=true). Use the table in "The 7 Syllabuses" section above as the source of truth.

**Done when:**
File exports `SYLLABUSES` array with exactly 7 entries. No DB calls. `tsc --noEmit` passes.

**Dependencies:** P0.2
**Type:** Pure — no DB calls, no API

---

### P1.2 — Write questions seed transformer

**Files:**
- `scripts/transformers/questions.ts`

**What to do:**
Read `data/questions.json`. Export `transformQuestions()` which maps each question to a `SyllabusItem`-shaped object: `syllabusSlug="system-design-questions"`, `sm2={easeFactor:2.5, interval:1, repetition:0, nextReviewDate:new Date(), timesStruggled:0}`, `meta={hint, answer, theme}`, `difficulty` mapped from source, `status="not_started"`.

**Done when:**
Function returns an array. `console.log(transformQuestions().length)` outputs `1510`. No DB calls.

**Dependencies:** P0.3
**Type:** Pure — no DB calls, no API

---

### P1.3 — Write tech-spine seed transformer

**Files:**
- `scripts/transformers/techSpine.ts`

**What to do:**
Read `data/tech-spine.json`. Export `transformTechSpine()`. Map each topic to SyllabusItem: `syllabusSlug="tech-spine"`, `sm2=null`, `meta={domain, dependencies, resources}`. Preserve `orderIndex` from source array position if not present in source data.

**Done when:**
Function returns array. No DB calls.

**Dependencies:** P0.3
**Type:** Pure — no DB calls, no API

---

### P1.4 — Write projects seed transformer

**Files:**
- `scripts/transformers/projects.ts`

**What to do:**
Read `data/projects.json`. Export `transformProjects()`. Map: `syllabusSlug="projects"`, `sm2=null`, `meta={criteria:[], buildNotes:[], carryForwardCount:0}`. Status starts as `not_started`.

**Done when:**
Function returns array. No DB calls.

**Dependencies:** P0.3
**Type:** Pure — no DB calls, no API

---

### P1.5 — Write soft-skills seed transformer

**Files:**
- `scripts/transformers/softSkills.ts`

**What to do:**
Read `data/skills.json`. Filter where `type === "soft"`. Export `transformSoftSkills()`. Map: `syllabusSlug="soft-skills"`, `sm2=null`, `meta={microPracticePrompt, source}`. `lastTouchedAt` defaults to `null`.

**Done when:**
Function returns array of only soft skills. No DB calls.

**Dependencies:** P0.3
**Type:** Pure — no DB calls, no API

---

### P1.6 — Write payable-skills seed transformer

**Files:**
- `scripts/transformers/payableSkills.ts`

**What to do:**
Read `data/skills.json`. Filter where `type === "payable"`. Export `transformPayableSkills()`. Map: `syllabusSlug="payable-skills"`, `sm2=null`, `meta={chapter, completionPercent:0, source}`.

**Done when:**
Function returns array of only payable skills. No DB calls.

**Dependencies:** P0.3
**Type:** Pure — no DB calls, no API

---

### P1.7 — Write survival-gaps seed transformer

**Files:**
- `scripts/transformers/survivalGaps.ts`

**What to do:**
Read `data/survival-areas.json`. Export `transformSurvivalGaps()`. Map: `syllabusSlug="survival-gaps"`, `sm2=null`, `gap={isFlagged:true, flagCount:1, severity:"low", lastAddressedAt:null}`, `status="not_started"`.

**Done when:**
Function returns array. No DB calls.

**Dependencies:** P0.3
**Type:** Pure — no DB calls, no API

---

### P1.8 — Write courses seed transformer

**Files:**
- `scripts/transformers/courses.ts`

**What to do:**
Read `data/courses.json`. Export `transformCourses()`. Map: `syllabusSlug="courses"`, `sm2=null`, `meta={author, url, totalChapters, currentChapter:0}`, `status="not_started"`.

**Done when:**
Function returns array. No DB calls.

**Dependencies:** P0.3
**Type:** Pure — no DB calls, no API

---

### P1.9 — Write master seed script

**Files:**
- `scripts/seed.ts`

**What to do:**
Import all 7 transformers and `SYLLABUSES`. Connect to DB using `connectDB()`. For each syllabus: upsert the Syllabus doc using `slug` as the unique key. BulkWrite all SyllabusItems using `upsert` on `{title, syllabusSlug}` as the unique key. After all inserts, update each Syllabus doc's `totalItems` count using `SyllabusItemModel.countDocuments({syllabusSlug})`. Log counts per syllabus at the end.

**Done when:**
`ts-node scripts/seed.ts` runs without errors and logs:
```
system-design-questions: 1510 items
tech-spine: N items
...
Seed complete.
```
Running it again (idempotent) produces the same counts with no duplicates.

**Dependencies:** P0.2, P0.3, P0.6, P1.1–P1.8
**Type:** Vercel free tier safe (run locally only, not a route)

---

---

## Phase 2 — Pure Engine Logic

> Goal: Write all the intelligence as pure functions with zero DB calls and zero UI. These are the brain. Test them in isolation before wiring to anything.

---

### P2.1 — Write SM-2 engine

**Files:**
- `app/lib/engine/sm2.ts`

**What to do:**
Export one pure function: `updateSM2(current: SM2Fields, result: "done" | "struggled"): SM2Fields`.

Logic:
- If `done`: increment `repetition`, multiply `interval` by `easeFactor` (round up), increase `easeFactor` by `+0.1`, clamp `easeFactor` max `4.0`. Set `nextReviewDate = today + interval days`.
- If `struggled`: reset `interval = 1`, reset `repetition = 0`, decrease `easeFactor` by `0.2`, clamp `easeFactor` min `1.3`. Set `nextReviewDate = tomorrow`. Increment `timesStruggled`.

**Done when:**
Function is pure. No imports except `Date`. 25 lines max. `updateSM2({easeFactor:2.5, interval:1, repetition:0, nextReviewDate:now, timesStruggled:0}, "done")` returns `interval:3`.

**Dependencies:** None
**Type:** Pure — no DB, no API

---

### P2.2 — Write priority engine

**Files:**
- `app/lib/engine/priority.ts`

**What to do:**
Export one pure function: `buildQueue(buckets: PriorityBuckets, settings: Settings, sessionMinutes: number): ObjectId[]`.

`PriorityBuckets` is the pre-fetched data passed in from the DB layer (not the full item list):
```ts
type PriorityBuckets = {
  carryForward: SyllabusItem[]     // yesterday's unfinished items
  overdueItems: SyllabusItem[]     // sm2.nextReviewDate <= today
  criticalGaps: SyllabusItem[]     // gap.severity === 'critical'
  mediumGaps: SyllabusItem[]       // gap.severity === 'medium'
  inProgress: SyllabusItem[]       // status === 'in_progress'
  newItems: SyllabusItem[]         // status === 'not_started', ordered by weight + orderIndex
}
```

Sort order: carryForward → overdueItems (most overdue first) → criticalGaps → mediumGaps → inProgress → newItems.

Apply session budget: 15min→5, 30min→10, 60min→18, 90min→28. Slice to budget. Respect each syllabus's `maxPerSession` cap from settings.

Returns array of ObjectIds in priority order.

**Done when:**
Function is pure. Deterministic given same inputs. carryForward items always appear first. Critical gap items always appear before new items.

**Dependencies:** None
**Type:** Pure — no DB, no API

---

### P2.3 — Write session score formula [CORRECTED]

**Files:**
- `app/lib/engine/score.ts`

**What to do:**
Export one pure function: `calcScore(results: SessionResult[]): number`.

```ts
export function calcScore(results: SessionResult[]): number {
  if (results.length === 0) return 0  // guard: prevents NaN on empty session
  const total = results.length
  const done = results.filter(r => r.result === 'done').length
  const struggled = results.filter(r => r.result === 'struggled').length
  const skipped = results.filter(r => r.result === 'skipped').length
  return Math.floor(Math.min(100, Math.max(0, (done * 10 + struggled * 5 - skipped * 3) / total * 10)))
}
```

Edge cases: empty results → 0 (not NaN). All done → 100. All skipped → 0.

**Done when:**
Pure function. Returns integer 0–100 for all inputs including empty array. Manually testable without DB.

**Dependencies:** None
**Type:** Pure — no DB, no API

---

### P2.4 — Write tomorrow focus calculator

**Files:**
- `app/lib/engine/tomorrowFocus.ts`

**What to do:**
Export one pure function: `calcTomorrowFocus(sessions: Session[], allItems: SyllabusItem[]): TomorrowFocus`.

Returns `{topGap: string | null, nextTopic: string | null, overdueCount: number}`.
- `topGap`: title of the highest-severity unflagged gap item (critical > medium > low)
- `nextTopic`: title of the next `not_started` or `in_progress` tech-spine item by `orderIndex`
- `overdueCount`: count of items where `sm2.nextReviewDate <= tomorrow`

**Done when:**
Pure function. Returns `{topGap: null, nextTopic: null, overdueCount: 0}` if no data, never throws.

**Dependencies:** None
**Type:** Pure — no DB, no API

---

### P2.5 — Write gap escalation logic

**Files:**
- `app/lib/engine/gapEngine.ts`

**What to do:**
Export one pure function: `escalateGap(item: SyllabusItem, result: "done" | "struggled", settings: Settings): Partial<SyllabusItem>`.

Logic:
- If `result === "struggled"`: increment `gap.flagCount` (create gap object if null, with `flagCount:1, severity:"low", isFlagged:true`).
- Apply thresholds from settings: if `flagCount >= settings.sm2.criticalThreshold` → `severity="critical"`. If `flagCount >= settings.sm2.mediumThreshold` → `severity="medium"`. Below → `severity="low"`.
- If `result === "done"` and item is a survival/gap item: set `gap.lastAddressedAt = today`.

Returns only the changed fields (partial), not the full item.

**Done when:**
Pure function. `escalateGap({gap: null, ...}, "struggled", settings)` returns `{gap: {flagCount:1, severity:"low", isFlagged:true}}`.

**Dependencies:** None
**Type:** Pure — no DB, no API

---

---

## Phase 3 — Session API Routes

> Goal: Build all server-side routes. Every route must work correctly before any UI touches it. Test each route with curl before moving to the next task.

---

### P3.1 — GET `/api/session/today` [CORRECTED]

**Files:**
- `app/api/session/today/route.ts`

**What to do:**
GET handler. Steps:

1. Call `connectDB()`
2. Fetch `settings = await SettingsModel.getSingleton()`
3. Find session where `date === today` (format `YYYY-MM-DD`)
4. If session exists and `status !== "planned"`: return it as-is (already started or completed)
5. If no session: run the priority query pipeline below to build the session

**Priority query pipeline (DB-level, NOT in-memory):**
```ts
const enabledSlugs = settings.syllabusConfig.filter(s => s.enabled).map(s => s.slug)
const today = new Date(); today.setHours(0,0,0,0)
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)

// Fetch yesterday's incomplete session for carry-forward
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
const yesterdayStr = yesterday.toISOString().slice(0,10)
const prevSession = await SessionModel.findOne({ date: yesterdayStr, status: { $ne: 'completed' } })
const carryForwardIds = prevSession
  ? prevSession.plannedItems.filter(id => !prevSession.results.find(r => r.itemId.equals(id)))
  : []

const buckets = {
  carryForward: carryForwardIds.length
    ? await SyllabusItemModel.find({ _id: { $in: carryForwardIds } }).limit(5)
    : [],
  overdueItems: await SyllabusItemModel
    .find({ syllabusSlug: { $in: enabledSlugs }, 'sm2.nextReviewDate': { $lte: today } })
    .sort({ 'sm2.nextReviewDate': 1 }).limit(20),
  criticalGaps: await SyllabusItemModel
    .find({ syllabusSlug: { $in: enabledSlugs }, 'gap.severity': 'critical' }).limit(10),
  mediumGaps: await SyllabusItemModel
    .find({ syllabusSlug: { $in: enabledSlugs }, 'gap.severity': 'medium' }).limit(10),
  inProgress: await SyllabusItemModel
    .find({ syllabusSlug: { $in: enabledSlugs }, status: 'in_progress' }).limit(10),
  newItems: await SyllabusItemModel
    .find({ syllabusSlug: { $in: enabledSlugs }, status: 'not_started' })
    .sort({ orderIndex: 1 }).limit(50)
}
```

Run `buildQueue(buckets, settings, settings.defaultSessionMinutes)` → get ordered `ObjectId[]`.

Fetch the full item documents for the queue: `const populatedItems = await SyllabusItemModel.find({ _id: { $in: queueIds } })`

**Missed-day gap detection:**
```ts
const lastSession = await SessionModel.findOne({}, {}, { sort: { date: -1 } })
let gapAlert = null
if (lastSession) {
  const lastDate = new Date(lastSession.date)
  const gapDays = Math.floor((today.getTime() - lastDate.getTime()) / 86400000)
  if (gapDays >= 1) {
    gapAlert = { days: gapDays, severity: gapDays > 3 ? 'critical' : 'low' }
  }
}
```

Create new Session doc: `date=today`, `plannedItems=queueIds`, `populatedItems=populatedItems`, `status="planned"`, `dayNumber=daysSince(settings.startDate)`, `gapAlert=gapAlert`, `carryForward=carryForwardIds`.

Return the session (including `populatedItems`).

**Done when:**
`curl GET /api/session/today` returns a valid session JSON with a `populatedItems` array containing full item documents. Calling it a second time returns the same session (not a new one). After missing 2 days, response includes `gapAlert: {days:2, severity:'low'}`.

**Dependencies:** P0.2–P0.6, P2.2
**Type:** Vercel free tier safe

---

### P3.2 — PATCH `/api/session/today`

**Files:**
- `app/api/session/today/route.ts` (add PATCH handler to same file)

**What to do:**
PATCH handler. Accepts `{plannedMinutes: 15 | 30 | 60 | 90}`. Re-runs the priority bucket queries with new minutes. Updates session's `plannedItems`, `populatedItems`, and `plannedMinutes`. Returns updated session.

**Done when:**
`curl -X PATCH /api/session/today -d '{"plannedMinutes":15}'` returns session with 5 items in `populatedItems`. PATCH with 90 returns 28 items.

**Dependencies:** P3.1
**Type:** Vercel free tier safe

---

### P3.3 — PATCH `/api/session/item/[id]` [CORRECTED]

**Files:**
- `app/api/session/item/[id]/route.ts`

**What to do:**
Accepts `{result: "done" | "struggled" | "skipped", sessionDate: string}`.

Steps (in this order — session write first to prevent inconsistency if item write fails):
1. Find `SyllabusItem` by `id`
2. Find session by `sessionDate`
3. **Push `{itemId, syllabusSlug, result, timestamp: now}` to `session.results` and save session first**
4. Set `session.status = "in_progress"` if not already. Save.
5. If `result !== "skipped"` and item has `sm2`: call `updateSM2(item.sm2, result)`, save updated sm2 to item
6. If `result === "struggled"`: call `escalateGap(item, "struggled", settings)`, merge result into item, save
7. Return updated item

If step 5 or 6 fails: log the error but do not return an error to the client — the session record is already written, which is the important part.

**Done when:**
Marking a question as "struggled" updates its `sm2.nextReviewDate` to tomorrow and increments `gap.flagCount`. Session `results` array grows by one entry even if the item save fails.

**Dependencies:** P3.1, P2.1, P2.5
**Type:** Vercel free tier safe

---

### P3.4 — POST `/api/session/close`

**Files:**
- `app/api/session/close/route.ts`

**What to do:**
Accepts `{honestNote: string, sessionDate: string}`.

Steps:
1. Find session by `sessionDate`
2. Validate `honestNote` is present and at least 10 chars (return 400 if not)
3. Call `calcScore(session.results)` → set `session.score`
4. Count `itemsDone`, `itemsStruggled`, `itemsSkipped` from `session.results`
5. Fetch last 10 sessions + top 20 items by overdueCount for `calcTomorrowFocus()` → set `session.tomorrowFocus`
6. Set `session.honestNote`, `session.status = "completed"`, `session.completedAt = now`
7. Save and return full session doc

**Done when:**
POST to close returns session with `score` as an integer 0–100, `status: "completed"`, and `tomorrowFocus` populated. Posting without `honestNote` returns 400.

**Dependencies:** P3.3, P2.3, P2.4
**Type:** Vercel free tier safe

---

### P3.5 — Update `GET /api/health`

**Files:**
- `app/api/health/route.ts`

**What to do:**
Update the existing health route. Return DB connection status plus document counts: `{db: "ok", counts: {syllabuses: N, items: N, sessions: N}}`. Use `Promise.all` for the three count queries.

**Done when:**
After seed runs, `GET /api/health` returns `{db: "ok", counts: {syllabuses: 7, items: ~2000+, sessions: 0}}`.

**Dependencies:** P0.6
**Type:** Vercel free tier safe

---

### P3.6 — GET and PATCH `/api/settings`

**Files:**
- `app/api/settings/route.ts`

**What to do:**
GET handler: call `SettingsModel.getSingleton()` and return.
PATCH handler: accept a partial settings object, use `findOneAndUpdate({_id: 'singleton'}, {$set: flattenedBody}, {new: true})` to merge. Return updated settings.

**Done when:**
GET returns settings doc. PATCH with `{defaultSessionMinutes: 15}` updates and returns the changed doc. Second GET reflects the change.

**Dependencies:** P0.5, P0.6
**Type:** Vercel free tier safe

---

---

## Phase 4 — Daily Screen UI Components

> Goal: Build every UI component as a standalone piece with no API calls inside it (API calls happen in `dailyScreen.tsx` only). Build and visually verify each component before wiring.

---

### P4.1 — `SessionLengthPicker` component

**Files:**
- `app/components/daily/SessionLengthPicker.tsx`

**What to do:**
Four buttons: `15 min (5 cards)` / `30 min (10 cards)` / `60 min (18 cards)` / `90 min (28 cards)`. Active state highlights the selected option. Props: `selected: number`, `onSelect: (minutes: number) => void`. No API calls inside.

**Done when:**
Renders 4 buttons. Active state works on click. `onSelect` fires with correct value.

**Dependencies:** None
**Type:** Pure UI component

---

### P4.2 — `GapAlertBanner` component

**Files:**
- `app/components/daily/GapAlertBanner.tsx`

**What to do:**
Props: `gapAlert: {days: number, severity: 'low' | 'critical'} | null`. If `null`, renders nothing. If `severity === 'critical'`: red banner. If `low`: amber banner. Text: "You've been away for N days. Let's get back on track." Dismissible with an X button (local state only — does not call an API).

**Done when:**
Renders nothing when prop is null. Red banner for critical. Amber for low. X button hides it.

**Dependencies:** None
**Type:** Pure UI component

---

### P4.3 — `ProgressDots` component

**Files:**
- `app/components/daily/ProgressDots.tsx`

**What to do:**
Props: `total: number`, `current: number`, `results: {result: string}[]`. Render one dot per item. Color by result: done=green, struggled=amber, skipped=gray, current=blue (pulsing outline), future=empty. Show text: "3 of 10". For sessions over 10 items, show dots as a thin progress bar instead.

**Done when:**
Renders correctly at 5, 10, 18, 28 items. Colors map to results. "X of Y" text is accurate.

**Dependencies:** None
**Type:** Pure UI component

---

### P4.4 — `BaseCard` component

**Files:**
- `app/components/daily/BaseCard.tsx`

**What to do:**
Shell card all item cards share. Props: `syllabusSlug: string` (drives left border color), `title: string`, `badge?: string`, `children: ReactNode`, `onDone?: () => void`, `onStruggled?: () => void`, `onSkip?: () => void`, `isLoading?: boolean`. Action buttons at bottom. While `isLoading` is true, disable all buttons and show a spinner.

Left border color map:
- `system-design-questions` → blue
- `tech-spine` → teal
- `projects` → amber
- `soft-skills` → purple
- `payable-skills` → coral
- `survival-gaps` → red
- `courses` → green

**Done when:**
Renders with correct border color per slug. Buttons disable during loading. Children render between content and buttons.

**Dependencies:** None
**Type:** Pure UI component

---

### P4.5 — `QuestionCard` component

**Files:**
- `app/components/daily/QuestionCard.tsx`

**What to do:**
Wraps `BaseCard` with `syllabusSlug="system-design-questions"`. Props: `item: SyllabusItem`, `onResult: (result: string) => void`, `aiEnabled: boolean`. Shows question `title`. Toggle button "Show hint" reveals `item.meta.hint` (if present). Difficulty badge (1=easy, 2=medium, 3=hard). If `aiEnabled`: show a "Teach me" button (wired in Phase 7; for now renders the button with an `onTeach` prop that defaults to a no-op). Passes `onDone`, `onStruggled`, `onSkip` through to BaseCard.

**Done when:**
Hint toggle works (show/hide). Difficulty badge renders. `onResult` fires correctly. "Teach me" button appears when `aiEnabled=true`, does nothing (no-op).

**Dependencies:** P4.4
**Type:** Pure UI component

---

### P4.6 — `TopicCard` component

**Files:**
- `app/components/daily/TopicCard.tsx`

**What to do:**
Wraps `BaseCard` with `syllabusSlug="tech-spine"`. Shows topic title + `meta.domain` as a badge. If `meta.dependencies` is non-empty, show them as small pills labeled "Depends on:". Actions: Done / Skip (no Struggled for topics).

**Done when:**
Renders correctly. Dependencies pills show if present. onDone and onSkip fire.

**Dependencies:** P4.4
**Type:** Pure UI component

---

### P4.7 — `ProjectCard` component

**Files:**
- `app/components/daily/ProjectCard.tsx`

**What to do:**
Wraps `BaseCard` with `syllabusSlug="projects"`. Shows project name. Renders `meta.criteria` as a checklist with local-state checkboxes (local state only — not persisted to DB). Actions: Done / Partial / Skip. "Partial" fires `onStruggled`.

**Done when:**
Checklist renders. Checkbox toggles locally. All three action buttons fire.

**Dependencies:** P4.4
**Type:** Pure UI component

---

### P4.8 — `SkillCard` component

**Files:**
- `app/components/daily/SkillCard.tsx`

**What to do:**
Works for both `soft-skills` and `payable-skills` (driven by `item.syllabusSlug`). Shows skill name + `meta.microPracticePrompt` in a highlighted box. For payable skills: show a progress bar using `meta.completionPercent`. Actions: Done / Skip.

**Done when:**
Renders correctly for both skill types. Progress bar shows only for payable skills.

**Dependencies:** P4.4
**Type:** Pure UI component

---

### P4.9 — `SurvivalCard` component

**Files:**
- `app/components/daily/SurvivalCard.tsx`

**What to do:**
For `syllabusSlug="survival-gaps"`. Shows gap name, severity badge (critical=red, medium=amber, low=gray), and `gap.flagCount` ("Flagged 4 times"). If `meta.notes` present, show it. Actions: Addressed (fires onDone) / Skip (fires onSkip).

**Done when:**
Severity badge renders with correct color. flagCount shows. Both actions fire.

**Dependencies:** P4.4
**Type:** Pure UI component

---

### P4.10 — `SessionSummary` component

**Files:**
- `app/components/daily/SessionSummary.tsx`

**What to do:**
Props: `score: number`, `itemsDone: number`, `itemsStruggled: number`, `itemsSkipped: number`, `tomorrowFocus: TomorrowFocus | null`. Animated score count-up using `requestAnimationFrame` (not a library). Show three stat pills: done/struggled/skipped. If `tomorrowFocus` is present, show a "Tomorrow's focus" section. No API calls inside.

**Done when:**
Score animates 0 → final value over 1 second. Tomorrow focus section appears when data is present, hidden when null.

**Dependencies:** None
**Type:** Pure UI component

---

### P4.11 — Wire `dailyScreen.tsx` — load and first card render [CORRECTED]

**Files:**
- `app/dailyScreen.tsx`

**What to do:**
On mount: call `GET /api/session/today`. Store `session.populatedItems` in local state as `items[]` — these are the full item documents, no further fetches needed. If `session.gapAlert` is non-null: render `<GapAlertBanner gapAlert={session.gapAlert} />` above everything.

If session `status === "planned"`: show `<SessionLengthPicker />`. On length pick: call `PATCH /api/session/today` with selected minutes. Store updated `populatedItems` in state.

Set `currentIndex = 0`. Read `items[currentIndex]` from local state — no per-card API call. Render the correct card component based on `item.syllabusSlug`. Show `<ProgressDots />` above the card.

Pass `aiEnabled={settings.ai.enabled}` from the session response to card components.

**Done when:**
Page loads. GapAlertBanner appears when gap exists. Length picker appears. Picking a length shows first card with correct component type. ProgressDots shows "1 of N". No per-card network requests after initial load.

**Dependencies:** P4.1–P4.10, P3.1, P3.2
**Type:** Vercel free tier safe

---

### P4.12 — Wire `dailyScreen.tsx` — actions, advance, and close

**Files:**
- `app/dailyScreen.tsx`

**What to do:**
On any action (done/struggled/skip): call `PATCH /api/session/item/[id]` with result. On success: advance `currentIndex` by 1. Re-render next card from `items[currentIndex]` (local state — no fetch). When `currentIndex >= items.length`: hide cards, show `honestNote` textarea (required, min 10 chars, show character count) + "Close Session" button. On close: call `POST /api/session/close` with `{honestNote, sessionDate}`. On success: hide textarea, show `<SessionSummary />` with data from response.

**Done when:**
Full session flow works end-to-end in browser. Score appears in SessionSummary after closing. ProgressDots updates on each action. Close button is disabled until honestNote has 10+ chars.

**Dependencies:** P4.11, P3.3, P3.4
**Type:** Vercel free tier safe

---

---

## Phase 5 — Syllabus Pit

> Goal: A browsable view of all syllabuses and all items, with the ability to add new syllabuses via JSON upload.

---

### P5.1 — GET `/api/syllabus` [CORRECTED]

**Files:**
- `app/api/syllabus/route.ts`

**What to do:**
Return all Syllabus documents sorted by `daily.weight` descending. Use a single aggregation pipeline to get `doneCount` per syllabus in one DB round-trip (not 7 parallel countDocuments):

```ts
const doneCounts = await SyllabusItemModel.aggregate([
  { $match: { status: 'done' } },
  { $group: { _id: '$syllabusSlug', doneCount: { $sum: 1 } } }
])
const doneMap = Object.fromEntries(doneCounts.map(d => [d._id, d.doneCount]))
const syllabuses = await SyllabusModel.find({}).sort({ 'daily.weight': -1 })
return syllabuses.map(s => ({ ...s.toObject(), doneCount: doneMap[s.slug] ?? 0 }))
```

**Done when:**
Returns array of 7 syllabuses each with `{slug, name, totalItems, doneCount}`. Only 2 DB queries total (aggregation + find).

**Dependencies:** P0.2, P0.3, P0.6
**Type:** Vercel free tier safe

---

### P5.2 — GET `/api/syllabus/[slug]/items`

**Files:**
- `app/api/syllabus/[slug]/items/route.ts`

**What to do:**
Paginated query: `page` (default 1), `limit` (default 20). Query params: `status` (filter), `difficulty` (filter), `phase` (filter), `search` (regex on `title`, case-insensitive using the `{syllabusSlug, title}` index from P0.3). Return `{items, total, page, pages}`.

**Done when:**
`GET /api/syllabus/system-design-questions/items?status=not_started&limit=20` returns 20 items. `?search=redis` returns only items with "redis" in title.

**Dependencies:** P0.3, P0.6
**Type:** Vercel free tier safe

---

### P5.3 — PATCH `/api/syllabus/[slug]/items/[id]`

**Files:**
- `app/api/syllabus/[slug]/items/[id]/route.ts`

**What to do:**
Accept `{status?, gap?: {severity?}}`. Update the SyllabusItem by id. Return updated item. Validate that `status` is a valid enum value before saving.

**Done when:**
PATCH `{status: "done"}` updates item and returns it. Invalid status returns 400.

**Dependencies:** P5.2
**Type:** Vercel free tier safe

---

### P5.4 — POST `/api/syllabus/upload`

**Files:**
- `app/api/syllabus/upload/route.ts`

**What to do:**
Accept JSON body: `{syllabus: SyllabusDefinition, items: RawItem[]}`. Validate:
- `syllabus.slug` must be present
- `syllabus.itemType` must be a valid enum value
- Each item must have at least `title`

On valid: upsert Syllabus doc by slug. BulkWrite items with upsert on `{title, syllabusSlug}`. Update `totalItems`. Return `{slug, inserted, updated}`.

**Done when:**
Uploading valid JSON creates or updates a syllabus and its items. Re-uploading same JSON produces 0 inserts, N updates (idempotent). Invalid JSON returns 400 with field-level error messages.

**Dependencies:** P0.2, P0.3, P0.6
**Type:** Vercel free tier safe

---

### P5.5 — `SyllabusNav` component

**Files:**
- `app/components/syllabus/SyllabusNav.tsx`

**What to do:**
Fetches `GET /api/syllabus` on mount. Renders a horizontal scrollable tab bar. Each tab: syllabus name + `doneCount/totalItems`. Active tab has bottom border highlight. Props: `onSelect: (slug: string) => void`. Shows loading skeleton while fetching.

**Done when:**
All 7 tabs render with counts. Clicking a tab fires `onSelect`. Active tab is visually distinct.

**Dependencies:** P5.1
**Type:** Vercel free tier safe

---

### P5.6 — `SyllabusItemList` component

**Files:**
- `app/components/syllabus/SyllabusItemList.tsx`

**What to do:**
Props: `slug: string`, `filters: {status?, difficulty?, phase?, search?}`. Fetches `GET /api/syllabus/[slug]/items` with filters. Renders rows: title, status badge, difficulty badge, `lastTouchedAt` date. Clicking a row expands it inline to show full `meta` fields (rendered generically as key: value pairs). Pagination controls at bottom. Shows "showing 20 of N".

**Done when:**
List renders for any slug. Filters update the list. Row expand shows meta. Pagination works.

**Dependencies:** P5.2
**Type:** Vercel free tier safe

---

### P5.7 — `SyllabusUpload` component

**Files:**
- `app/components/syllabus/SyllabusUpload.tsx`

**What to do:**
File input (JSON files only). On file select: parse JSON in browser. Validate client-side: check `syllabus.slug` present, `syllabus.itemType` valid, `items` is array with at least one entry with `title`. Show validation errors before submitting. If valid: enable Submit button. On submit: POST to `/api/syllabus/upload`, show `{inserted, updated}` counts on success.

**Done when:**
Uploading a valid JSON shows success with counts. Uploading JSON missing `syllabus.slug` shows a clear error before the network call is made.

**Dependencies:** P5.4
**Type:** Vercel free tier safe

---

### P5.8 — Wire `syllabusPitt.tsx`

**Files:**
- `app/syllabusPitt.tsx`

**What to do:**
Compose: `SyllabusNav` at top (drives `activeSlug` state). Filter bar below nav (status, difficulty, search). `SyllabusItemList` for `activeSlug` with current filters. "Add Syllabus" button top-right opens `SyllabusUpload` in a panel. Header shows overall `totalDone / totalItems` across all syllabuses.

**Done when:**
Full Syllabus Pit renders. Tab switching shows correct items. Filters work. Upload flow adds new syllabus and tab appears.

**Dependencies:** P5.5, P5.6, P5.7
**Type:** Vercel free tier safe

---

---

## Phase 6 — Settings Screen

> Goal: A real settings page where changes actually affect behavior. Every change auto-saves with a debounce.

---

### P6.1 — `SessionConfig` section

**Files:**
- `app/components/settings/SessionConfig.tsx`

**What to do:**
Fetches current settings on mount. Shows: default session length as radio buttons (15/30/60/90), start date as a date input. On any change: debounce 800ms then call `PATCH /api/settings`. Show a "Saved" tick that fades after 2s.

**Done when:**
Changing default session length saves to DB within 1 second. Refreshing the page shows the saved value.

**Dependencies:** P3.6
**Type:** Vercel free tier safe

---

### P6.2 — `SyllabusConfig` section

**Files:**
- `app/components/settings/SyllabusConfig.tsx`

**What to do:**
Fetches current settings + syllabus list on mount. For each of the 7 syllabuses, render a row: syllabus name, enabled toggle, weight slider (1–10, step 1), max-per-session number input. On any change: debounce 800ms then PATCH settings with updated `syllabusConfig` array.

**Done when:**
Disabling a syllabus via toggle saves. Next session open does not include items from that syllabus.

**Dependencies:** P3.6, P5.1
**Type:** Vercel free tier safe

---

### P6.3 — `SM2Config` section

**Files:**
- `app/components/settings/SM2Config.tsx`

**What to do:**
Two number inputs: "Medium gap threshold — flag count" (default 3) and "Critical gap threshold — flag count" (default 5). Include one sentence of explanation below each input explaining what the threshold triggers. Auto-save with debounce.

**Done when:**
Values save. Increasing critical threshold to 10 means no items escalate to critical until flagged 10 times.

**Dependencies:** P3.6
**Type:** Vercel free tier safe

---

### P6.4 — `AIConfig` section

**Files:**
- `app/components/settings/AIConfig.tsx`

**What to do:**
Toggle: AI enabled / disabled. When enabled, show 4 dropdowns:
- **Teach model** (real-time, latency-sensitive): `gemini-3-flash-preview`, `gpt-oss:20b`
- **Analyse model** (async, large context): `deepseek-v3.1:671b`, `gemini-3-flash-preview`
- **Practice model**: `gpt-oss:120b`, `gemini-3-flash-preview`
- **Fallback model** (rate limit failover): `gpt-oss:120b`, `gpt-oss:20b`

All model strings are valid Ollama Cloud model identifiers. Auto-save on change.

**Done when:**
Toggle AI off → model dropdowns hide. Toggle on → they reappear. Selection saves to DB.

**Dependencies:** P3.6
**Type:** Requires OLLAMA_API_KEY in env

---

### P6.5 — Wire `setting.tsx`

**Files:**
- `app/setting.tsx`

**What to do:**
Compose all 4 sections vertically with section headings. Fetch settings once on mount and pass initial values to each section as props. Show a last-saved timestamp in the page header ("Last saved: 2 minutes ago").

**Done when:**
Settings page loads with current values. Changes in any section auto-save. Timestamp updates after save.

**Dependencies:** P6.1–P6.4
**Type:** Vercel free tier safe

---

---

## Phase 7 — AI Integration (Genuine Only)

> **Rule:** Do not start this phase until Phase 4 (daily loop) is fully working end-to-end.
> Every AI feature here reads real data and produces genuinely useful output. No fake buttons.

---

### P7.1 — Write Ollama Cloud client

**Files:**
- `app/lib/ai/client.ts`

**What to do:**
Export `ollamaChat(model: string, messages: Message[], stream?: boolean): Promise<string | ReadableStream>`.

Use the `ollama` npm package with `host` set to `"https://ollama.com"` and `Authorization: Bearer ${process.env.OLLAMA_API_KEY}`:

```ts
import { Ollama } from 'ollama'

const client = new Ollama({
  host: 'https://ollama.com',
  headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` }
})

export async function ollamaChat(model: string, messages: Message[], stream = false) {
  try {
    if (stream) {
      return await client.chat({ model, messages, stream: true })
    }
    const response = await client.chat({ model, messages, stream: false })
    return response.message.content
  } catch (err: any) {
    if (err?.status === 429) {
      // Rate limit hit — retry once with fallback model from settings
      const settings = await SettingsModel.getSingleton()
      const fallback = settings.ai.fallbackModel
      await new Promise(r => setTimeout(r, 500))
      const response = await client.chat({ model: fallback, messages, stream: false })
      return response.message.content
    }
    throw new Error(`Ollama Cloud error: ${err.message}`)
  }
}
```

**Done when:**
Calling with `gpt-oss:120b` and a valid messages array returns text. HTTP 429 triggers fallback retry with `fallbackModel`. Invalid model throws a clear error, not a crash.

**Dependencies:** P0.5 (for fallback model lookup)
**Type:** Requires `OLLAMA_API_KEY` env var. Install: `npm install ollama`

---

### P7.2 — Write teach prompt builder

**Files:**
- `app/lib/ai/prompts/teach.ts`

**What to do:**
Export pure function: `buildTeachPrompt(item: SyllabusItem): Message[]`. System message: `"You are a concise technical teacher. Explain in under 200 words. No filler, no preamble. Use a concrete example."`. User message: `"Teach me: [item.title]. Difficulty: [difficulty]. Context: [item.meta.theme or item.syllabusSlug]"`. Do NOT include `meta.answer` in the prompt.

**Done when:**
Pure function. Returns `[{role:"system",...}, {role:"user",...}]`. No API calls.

**Dependencies:** None
**Type:** Pure — no DB, no API

---

### P7.3 — POST `/api/ai/teach/[itemId]`

**Files:**
- `app/api/ai/teach/[itemId]/route.ts`

**What to do:**
Steps:
1. Check `settings.ai.enabled` — return 403 with `{error: "AI disabled in settings"}` if false
2. Fetch `SyllabusItem` by `itemId`
3. Get `settings.ai.teachModel`
4. Call `buildTeachPrompt(item)` → call `ollamaChat(teachModel, messages, stream=true)`
5. Return a `Response` with the stream and `Content-Type: text/event-stream`

**Done when:**
`curl -X POST /api/ai/teach/[validId]` streams text back. Returns 403 if AI disabled.

**Dependencies:** P7.1, P7.2, P3.6
**Type:** Requires OLLAMA_API_KEY in env

---

### P7.4 — Wire "Teach me" button to `QuestionCard` and `TopicCard`

**Files:**
- `app/components/daily/QuestionCard.tsx`
- `app/components/daily/TopicCard.tsx`

**What to do:**
The "Teach me" button (already rendered as no-op in P4.5) now gets wired: on click fetch `POST /api/ai/teach/[item._id]` and read stream using `fetch` + `ReadableStream` reader. Append streamed tokens to a text panel that slides in below the card content. Show a loading spinner until first token arrives. If error: show "AI unavailable, try again" — not a blank screen.

**Done when:**
Clicking "Teach me" on a question streams a response below the card. Error state shows graceful message. Button does not appear when AI is disabled in settings.

**Dependencies:** P7.3, P4.5, P4.6
**Type:** Requires OLLAMA_API_KEY in env

---

### P7.5 — Write analyse prompt builder

**Files:**
- `app/lib/ai/prompts/analyse.ts`

**What to do:**
Export pure function: `buildAnalysePrompt(sessions: Session[], struggledItems: SyllabusItem[]): Message[]`. System: `"You are a learning coach. Be direct and specific. No filler."`. User message includes: last 10 session scores as a list, top 5 most-struggled item titles, syllabus slugs with most skips. Ask: `"Identify my 3 biggest weak spots and give me one specific action for each."`.

**Done when:**
Pure function. Returns valid messages array. No API calls.

**Dependencies:** None
**Type:** Pure — no DB, no API

---

### P7.6 — POST `/api/ai/analyse`

**Files:**
- `app/api/ai/analyse/route.ts`

**What to do:**
Steps:
1. Check `settings.ai.enabled` — return 403 if false
2. Fetch last 10 sessions from DB, sorted by `date` DESC
3. Fetch top 10 SyllabusItems where `gap.flagCount` is highest
4. Call `buildAnalysePrompt(sessions, items)` → call `ollamaChat(analyseModel, messages, stream=false)`
5. Return `{analysis: string, generatedAt: Date}`

Not streamed — analysis takes a few seconds and that is acceptable.

**Done when:**
POST returns JSON with `analysis` as a non-empty string. Takes 5–15 seconds — expected. Returns 403 if AI disabled.

**Dependencies:** P7.1, P7.5, P3.6
**Type:** Requires OLLAMA_API_KEY in env

---

### P7.7 — Wire analysis to Syllabus Pit

**Files:**
- `app/syllabusPitt.tsx`

**What to do:**
Add "Analyse my gaps" button in the Syllabus Pit header. Button only renders if `settings.ai.enabled`. On click: show loading state ("Analysing..."), POST to `/api/ai/analyse`, display result in a card below the nav bar. Card shows the analysis text + "Generated at [time]". Include "Refresh" button to re-run. Cache result in component state — do not auto-fire on page load.

**Done when:**
Button appears only when AI enabled. Clicking shows loading then result. Refresh re-runs.

**Dependencies:** P7.6, P5.8
**Type:** Requires OLLAMA_API_KEY in env

---

### P7.8 — Wire AI observation to `SessionSummary`

**Files:**
- `app/components/daily/SessionSummary.tsx`

**What to do:**
After session close, if `settings.ai.enabled`: fire `POST /api/ai/analyse` in the background (non-blocking). When response arrives, append a clearly labeled "AI observation" section at the bottom of the summary. Label it visibly so the user knows it is AI-generated, not a computed fact. If AI call fails or takes more than 20 seconds: show nothing — not an error.

**Done when:**
With AI enabled: summary shows score and stats immediately, AI observation appears a few seconds later. With AI disabled: summary shows score and stats only, no missing section, no error.

**Dependencies:** P7.6, P4.10
**Type:** Requires OLLAMA_API_KEY in env

---

---

## Appendix: Free Tier Constraints Checklist

| Constraint | Limit | How this plan stays within it |
|---|---|---|
| MongoDB Atlas M0 storage | 512 MB | ~2,000 items × 1KB + sessions × 2KB/day = well under 50MB/year |
| MongoDB M0 connections | 100 max | Connection caching in `db.ts` (P0.6) prevents connection storms |
| MongoDB M0 features | No text search, no Atlas Search | All search uses `$regex` on indexed `{syllabusSlug, title}` field (P0.3) |
| Vercel Hobby function timeout | 10 seconds | P3.1 uses targeted queries not full collection scans. AI routes use streaming (P7.3) or async (P7.6). All routes complete well within 10s. |
| Vercel Hobby cron | 1 cron job | Not used — SM-2 updates at mark time (P3.3). Gap detection at session open (P3.1). |
| Ollama Cloud rate limit | Hourly + weekly caps | Teach is the only real-time AI call. Analyse is on-demand. Fallback model configured in settings for 429 retries. |
| Vercel Hobby bandwidth | 100 GB/month | Not a concern for personal use |

---

## Appendix: Syllabus JSON Upload Format

When adding a new syllabus in the future, the upload JSON must follow this shape:

```json
{
  "syllabus": {
    "slug": "your-unique-slug",
    "name": "Display Name",
    "itemType": "question",
    "daily": {
      "enabled": true,
      "weight": 5,
      "strategy": "sm2",
      "maxPerSession": 3
    }
  },
  "items": [
    {
      "title": "Item title",
      "description": "Optional description",
      "difficulty": 2,
      "phase": "intermediate",
      "tags": ["tag1", "tag2"],
      "meta": {
        "hint": "Optional hint",
        "theme": "Optional theme"
      }
    }
  ]
}
```

Valid `itemType` values: `question`, `topic`, `project`, `skill`, `resource`, `gap`
Valid `strategy` values: `sm2`, `sequential`, `priority`, `random`
Valid `difficulty` values: `1`, `2`, `3`

---

## Appendix: Antigravity Task Feed Format

For each task, feed Antigravity this exact prompt structure:

```
Task: [P-number] — [Task name]

Files: [list exactly as shown in the task]

Do this:
[paste the "What to do" block verbatim]

Verify when done:
[paste the "Done when" block verbatim]

Constraints:
- Do not touch any file not listed above
- Run tsc --noEmit after writing TypeScript files
- Do not start the next task until verification passes
```

If Antigravity's Plan Artifact lists files not in the task's `Files` section, reject the plan and ask it to constrain to only the listed files before proceeding.

---

*Final plan. 7 phases. 61 atomic tasks. Start at P0.1. Do not skip steps.*
