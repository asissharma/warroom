Here's the full text scraped from the SVG:

---

# Wardroom — System Architecture

---

## Next.js Frontend — 3 Screens

**Daily**
- Carry-forward banner
- 6 block cards
- Session chat panel
- Command buttons
- Capture field
- Auto-save on each block
- Momentum at close

**Syllabus Pitt**
- All → Tech Spine
- Questions → Projects
- Soft Skills → Payable
- Survival / Gap Tracker
- Cross-track filter
- AI analysis panel
- Capture search

**Settings**
- Questions / day
- Gap thresholds
- AI provider per task
- Phase + day override
- Carry-forward toggle
- SM-2 toggle
- Program length

---

## Next.js API Routes — Session Engine

**Context Builder**
- Reads DB → builds ~200 line JSON
- Today's topic only
- 9 Qs via query
- Gap summary pre-calc
- Last 3 sessions

**Session Engine**
- Auto-create on open
- Block-by-block save
- Drift detection
- Momentum formula
- Carry-forward logic
- Capture auto-tag

**AI Router**
- Groq → teaching
- Claude → survival
- Gemini → analysis
- OpenRouter → fallback
- Per-task config from settings doc

**Cron (Nightly)**
- SM-2 update
- nextReviewDate per Q
- Gap severity auto-calc

---

## MongoDB — Persistent Source of Truth

**sessions**
- dayNumber, phase
- blocks{} per type
- momentumScore
- gapsFlagged[]
- captures{}
- honestNote

**gapTracker ★**
- concept, sourceType
- sourceId (any track)
- flagCount, severity: low / medium / critical
- depthReached 1-3
- status: open / closed

**techSpine**
- topic, phase
- dayRange{start, end}
- Surface / Solid / Mastered
- domainSkill
- notes[], gaps[]
- dependencies[]

**questions**
- 1,510 docs
- difficulty 1-3
- easeFactor (SM-2)
- nextReviewDate
- timesStruggled
- status: active / retired

**projects**
- dayAssigned
- Done / Partial / Skipped
- carryForwardCount
- doneMeansCriteria[]
- buildNotes[]

**skills**
- type: soft / payable
- source, chapter
- completionPercent
- microPracticePrompt
- lastDoneDay

**captures**
- note / insight / bookmark / connection
- tags[], topicId
- sessionDay
- full-text search

**settings**
- questionsPerDay
- gapThresholds
- aiProviders{}
- programLength
- currentPhase

---

↑ all 6 tracks feed gapTracker

---

## Gap Auto-Escalation (API logic, not LLM)

- **flagCount 1–2** → low → weave into teaching
- **flagCount 3** → medium → address before new content
- **flagCount 4+** → critical → dedicate full survival block, flag in honestNote
- **Source:** spine / question / project / softSkill / payableSkill / survival

---

## Build Sequence

- **Phase 1:** schema + seed + daily screen + auto-save
- **Phase 2:** AI integration + context builder + commands
- **Phase 3:** Syllabus Pitt all 6 tracks + capture search
- **Phase 4:** SM-2 cron + Gemini reports + momentum chart

---

## What This Replaces

11k file → ~200 line context JSON · manual log.json → auto-saved · LLM momentum calc → API formula · gaps as strings → gapTracker collection



# Screen 1 — Daily | Session Interface

**ON LOAD**

---

## Auto session creation
- Creates today's session doc on open
- Calculates day number from start date
- Auto-assigns sprint topic, project, skills
- Restores in-progress session if one exists

## Carry-forward banner
- Shows yesterday's Partial / Skipped blocks
- Carry-forward banner listing what's outstanding
- Dismissible — or never added if perfect
- Blocks cascade: skipped project increments counter

## Gap-date alert
- Pulls missed gap dates from DB
- Red banner if any critical gaps exist
- Shows concept + flagCount
- Links to Syllabus Pin gap detail

---

## 4 BLOCK CARDS (IN ORDER)

**Block 1 — Universal behaviour**
- Status bar: Project in Progress / Paused / Skipped
- Status changes auto-saved to DB immediately
- Completion % updates counter on block
- Time estimate badge per block
- Left border colour changes by status
- "Start" opens the panel for its blocks
- Skipping increments gapTracker if threshold met

**Block 2 — Soft skill**
- Shows skill name, micro-practice prompt
- Mark done → updates lastDoneDay
- Gap auto-created if not done in 7 days
- Rotates through skill list (least recently done first)

**Block 3 — Payable skill**
- Shows topic name, current chapter, micro-practice prompt
- Mark done → updates completedChapters + completionCount
- Gap auto-created if not done in 7 days
- Chapter progress bar inline

**Block 4 — Survival skill**
- Auto-selected: highest severity open gap from DB
- Shows gap name, severity, flagCount, daysSinceOpen
- Opens AI chat panel with survival system prompt
- daysSinceOpen increments after each addressed session
- If addressed 3+ times: opens at +1 difficulty automatically
- Gap data updated in progress / closedBased on outcome

**Block 5 — Questions**
- 9 questions in 3 batches of 3
- Self-mark: Correct or Struggled per question
- SM-2 update on each mark (interval, easeFactor, repetition)
- Struggled → GapTracker entry created / incremented
- Correct x2 consecutive → question retired
- Hint buttons sends block to that panel
- Progress bar: Questions N of 9

**Block 6 — Project** (Basic)
- Shows project name, description
- Order metrics (delta) as a checklist
- Mark Done / Partial / Skipped

**AI CHAT PANEL (SLIDES IN PER BLOCK)**

**Commands — depth and pace**
- /expand — edges cases, production patterns
- /simplify — restart from zero, challenge next
- /qa line — 3 Socratic questions, concept strategy
- /challenge — real-world scenario to solve
- /wait — 5 level hint before answer revealed
- All rendered as Ul buttons, not typed

**Drift detection**
- Turn counter per chat session
- Left edge turns → "Back to [Block]?" warning
- Drift events logged to session doc
- Each drift event → -0.5 momentum penalty
- All logs of topic responses with drift marker

**Capture section**
- /note — free text, auto-tagged in session
- /insight — catalogued discovery
- /link — URL + note
- /connection — link concept A to concept B
- All saved to captures collection + session log
- Tags auto-generated from topic context

**SESSION CLONE**

**Honest note area**
- Required field, min 20 chars
- Cannot clone session without it
- Blocks "Clone Session" if area empty
- Saved to session.honestNote

**Momentum score**
- Project: Done=5, Partial=2, Skipped=0
- Questions: (correctTotal) × 3
- Skills: soft+payable done = +2
- Drift: -0.5 per event
- Below +5.0 for trapped in (pjx use case)
- Calculated in API, not by AI
- Animated count-up on display

**Tomorrow focus**
- Auto-generated: next day's spine
- topic + block
- Highest open gap surfaced as focus
- recommendation
- Displayed after clone, saved to tomorrowFocus
- Short session mode: drops survivor + cuts to 5 Qs

---

# Screen 2 — Syllabus Pins | Dev/tested

**1 TAB — Navigation**
All Overview | Tech Spine | Questions | Projects | Soft Skills | Payable | Survival / Gaps |

**All tab — cross track overview**
- Summary card per track: progress stat + gap count
- Gap Data Vision: total open critical gaps (always visible)
- Gross Error Banner: "More everything flagged this week"
- Data range filter across all tracks
- Phase filter (Foundation / Intermediate / Advanced)

**Tech Spine tab**
- All topics ordered by dayRange-start
- Status badge per topic (NotStarted/Active/InProgress/Mastered)
- Open gap count badge per topic
- Session count per topic
- Click → detail panel: sessions, captures, gaps, notes, deps
- Manual status update from detail panel
- Inline notes/gap editing

**Questions tab**
- All SM2 questions paginated
- Filters: status, difficulty, phase, theme, search text
- Per-question review cards with struggle count, last review date
- Overdue questions highlighted amber
- Retired questions grayed out
- Add + Edit (data → full data + history entry per question)

**Projects tab**
- Status badge + carryForward count
- Per-project criteria (checklist, build notes, deps)
- Click → edit completion, criteria checklist, build notes, deps
- Collapse build notes (persistent)
- Estimate build times (persistent)

**Skills tabs (Soft + Payable)**
- All skills in list, ordered by severity × 1
- Shows last done, % days practice-gap, completion %
- Click → info/practice/prompt, notes, session history
- "Create format-Session?" → queues gap for tomorrow

**Survival / Gap Tracker tab**
- All gaps from all tracks in one view
- Severity: Low (grey) / Medium (amber) / Critical (red)
- Filters: severity, status, source topic, sort
- GapCount, flagToggle/Inc, lastAddressedDay per gap
- Click → full timeline, source link, notes, status updates
- Click "Close?" inline status
- "Create Survival Session?" → queues gap for tomorrow

---

# Screen 2 — Settings | Config

**Program config**
- Start date, program length (W1)
- W1 label
- Current phase selector
- Session override override (manual correction)
- Topics per day

**Gap thresholds**
- Medium trigger (default: FlagCount = 2)
- Critical trigger (default: FlagCount = 3)
- Max critical → medium
- Changes take effect next session open

**AI provider config**
- Teaching mode: greg / gemini / claude / optimised
- Analysis model (Syllabus Pin)
- Chat model (daily)
- Deep dive model (Survival skill)
- Fallback model if main model fails
- All inline reload (no full reload)

---

## Intelligence layer | Background systems

**SM-2 spaced repetition engine**
- easeFactor per question (starts 2.5, adjusts per result)
- Interval schedule: 1→3→4→8→a interval + easeFactory
- Interval resets to 1 on struggled
- nextReviewDate per question: used to order/suggest per question
- Questions pull is a pure DB query, 0 seen LLM dependency
- Questions put is a pure DB query, 0 sent LLM

**Gap auto-creation (all 6 tracks)**
- Spike tracking: All tags entry if gap entry created
- Block skipped N times → gap entry
- Project Skipped N times → gap entry
- Soft skill not done 7 days → gap entry
- Payable skill not done 7+ days → gap entry
- Survival not addressed N with (after session) → gap persists
- Gap tracker (collection): severity, source, full history, flagcount
- All gap auto created if not done, increment flag

**Momentum trend chart**
- Line chart: last 10 sessions, 1-10 scale
- Shows momentum at 0 point (green / grey)
- Trend indicator: Trending up / down / stable
- Last 3 sessions table with session, context scores
- Collapsed by default on Daily screen

**Offline / PWA**
- Installable on mobile (manifest.json)
- IndexedDB cache: session data, changes queue to sync on reconnect
- Sync on reconnect: queued offline changes synced to API (about 1min)
- Conflict detection: earliest write wins if timestamp gap
- API failures return graceful offline fallback JSON

---

## Gap tracker — escalation logic | Dev/tested

**GapCount 1-2** → severity: low → link: www.link/teaching
**GapCount 3** → severity: by-medium → add: address before new content
**GapCount 4+** → severity: critical → full Survival skill → flag morphisms

---

## What replaces the current system

**Current — Broken:**
- 12,000 line file parsed by LLM every session
- Manual logging of questions — LLM memory → unreliable
- Question selection is random, no SM2, no question rotation
- Gaps as late strings — no severity, no history
- No true mechanism for carrying forward blocks

**App — Actually:**
- 200 line context JSON built from DB per session
- SM2 drives all question selection, retirement, difficulty
- Question display is pure MongoDB query
- Gap tracker (collection): severity, full history
- Dashboard is a pure Svelte UI with filters and fillers
- 0 tokens for all — no file pulling

---

## That's the full feature map. Every section, every capability, every option — no code, no prompts.

---

**Here's what it covers:**

**Daily screen** — session auto-creation, carry-forward detection, gap-date alert, all 6 block cards with their individual behaviours, the AI chat panel with all commands + drift detection, session clone with note type, session closes with momentum formula on final note, gap tag auto-writing.

**Syllabus Pins** — all 7 tabs and what each one shows, the detail panels per track, capture search, and all 6 AI analysis report types with what data each one reads.

**Program config** — a fully configurable option: program config, gap thresholds, AI provider per task type.

**Intelligence layer** — every configurable-option program need chart, PWA thresholds, AI provider per task type.

**Gap tracker escalation** — the three severity levels and what each one triggers, visually.

**Offline vs now** — exactly what the file-based system did wrong and what replaces it.



**File Structure** - 
wardroom/
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
│
├── data/                              ← static JSON curriculum data
│   ├── courses.json
│   ├── daily-plan.json
│   ├── projects.json
│   ├── questions.json
│   ├── skills.json
│   ├── survival-areas.json
│   └── tech-spine.json
│
├── files/                             ← source spreadsheets / PDFs
│   ├── FINALQUESTIONS.xlsx
│   ├── Free Courses.pdf
│   ├── PROJECT_DANCE_150_MASTER_TRACKER.xlsx
│   ├── Payable Skills.csv
│   ├── Things To Learn.pdf
│   ├── basic Skills.csv
│   └── tech smith.csv
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── dailyScreen.tsx                ← Screen 1 (flat file, no route group)
│   ├── syllabusPitt.tsx               ← Screen 2 (flat file, no route group)
│   ├── setting.tsx                    ← Screen 3 (flat file, no route group)
│   │
│   ├── api/
│   │   ├── health/route.ts           ← ✅ has code (967b)
│   │   ├── settings/route.ts         ← empty
│   │   ├── daily/
│   │   │   ├── session/route.ts      ← empty
│   │   │   ├── blocks/route.ts       ← empty
│   │   │   └── close/route.ts        ← empty
│   │   ├── syllabus/
│   │   │   ├── techspine/route.ts    ← empty
│   │   │   ├── questions/route.ts    ← empty
│   │   │   ├── projects/route.ts     ← empty
│   │   │   ├── skills/route.ts       ← empty
│   │   │   └── gaps/route.ts         ← empty
│   │   └── ai/
│   │       ├── context/route.ts      ← empty
│   │       ├── chat/route.ts         ← empty
│   │       └── analysis/route.ts     ← empty
│   │
│   ├── components/                    ← moved inside app/
│   │   ├── daily/
│   │   │   ├── BlockCard.tsx          ← empty
│   │   │   ├── ChatPanel.tsx          ← empty
│   │   │   ├── SessionClose.tsx       ← empty
│   │   │   └── CarryForwardBanner.tsx ← empty
│   │   └── syllabus/
│   │       ├── TechSpineTab.tsx       ← empty
│   │       ├── QuestionsTab.tsx       ← empty
│   │       ├── ProjectsTab.tsx        ← empty
│   │       ├── SkillsTab.tsx          ← empty
│   │       ├── GapTrackerTab.tsx      ← empty
│   │       └── DetailPanel.tsx        ← empty
│   │
│   └── lib/                           ← moved inside app/
│       ├── db.ts                      ← ✅ has code (703b)
│       ├── models/
│       │   ├── Settings.ts            ← empty
│       │   ├── Session.ts             ← ✅ has code (1261b, old)
│       │   ├── Question.ts            ← empty
│       │   ├── Project.ts             ← empty
│       │   ├── TechSpine.ts           ← empty
│       │   ├── GapTracker.ts          ← empty
│       │   ├── Skill.ts               ← empty
│       │   ├── Capture.ts             ← empty
│       │   ├── Edge.ts                ← old (730b)
│       │   ├── Intel.ts               ← old (1636b)
│       │   ├── Log.ts                 ← old (1019b)
│       │   ├── Node.ts                ← old (1690b)
│       │   ├── Task.ts                ← old (1277b)
│       │   └── Topic.ts               ← old (1193b)
│       └── engine/
│           ├── momentum.ts            ← empty
│           ├── sm2.ts                 ← empty
│           └── gapEngine.ts           ← empty
