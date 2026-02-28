# THE SOUL OF INTEL·OS

## WHY THIS EXISTS
AI can write code. GitHub Copilot ships boilerplate in seconds. 
So what does a software engineer actually need to be? 
This project is the answer to that question, made into a system.

We are watching a fundamental shift in software engineering right now. Grinding LeetCode, memorizing syntax, or watching endless tutorials is the wrong response to an AI-accelerated world. The baseline has moved. If a machine can write the code faster, the human's job is no longer to be the typist.

What actually matters now is system design judgment, debugging AI code, infrastructure security, domain knowledge, and communication. We need engineers who can architect the system, not just write its functions. 

But adopting these high-level skills requires discipline over an extended period. Willpower is fragile. You can't rely on it for 6 months. That's why a structured 180-day operating system beats willpower. INTEL·OS enforces the repetition required to become the architect.

## THE PHILOSOPHY
Three principles drove every design decision:

### 1. COMMANDS, NOT SUGGESTIONS
Most productivity systems ask "what do you want to do today?" INTEL·OS doesn't ask. It tells you. The mission is pre-loaded. The questions are assigned. The project is chosen. You execute. Remove the decision fatigue. Preserve energy for the actual work.

### 2. REAL DATA, NOT GENERATED CONTENT
Every project name comes from PROJECT_DANCE_150. Every question comes from the 1510-question bank. Every course URL is a real link that works. The system is only as good as its data. The data is real, manually curated, and designed to push actual growth.

### 3. CARRY-FORWARD AS A FEATURE
Life interrupts. Days get skipped. This is expected. Unchecked tasks don't disappear — they follow you. The system remembers. You close the loop when you're ready. No shame. Just carry-forward.

## THE 8 PHASES
1. Foundation (Days 1–30)
   Primary focus: Core language syntax, basic algorithms, data structures.
   Projects: Simple CLI tools, script automation, basic full-stack CRUD apps.
   Result: The engineer stops fighting syntax and learns to read errors cleanly.

2. Distributed Systems (Days 31–50)
   Primary focus: Microservices, message queues, state synchronization.
   Projects: Simple message brokers, load-balancer simulators, caching layers.
   Result: The engineer thinks in terms of multiple machines failing, not one machine working.

3. Cloud Infrastructure (Days 51–70)
   Primary focus: Docker, Kubernetes, AWS/GCP, CI/CD.
   Projects: Containerized deploy pipelines, terraform state management, serverless APIs.
   Result: The engineer stops "working on my machine" and understands deployment architecture.

4. Security (Days 71–90)
   Primary focus: Auth flows (OAuth, JWT), common vulnerabilities (OWASP), encryption.
   Projects: Hand-rolling JWT verifiers, simulating SQL injection and patching it, RBAC implementations.
   Result: The engineer assumes everything is compromised and designs defensively by default.

5. ML/AI Engineering (Days 91–110)
   Primary focus: RAG pipelines, LLM integration, embedding generation, vector databases.
   Projects: Custom chatbots, semantic search engines over PDFs, local model deployments.
   Result: The engineer knows how to wield AI as a tool rather than seeing it as magic.

6. Frontend & Real-Time (Days 111–130)
   Primary focus: WebSockets, state management, UI performance, WebRTC.
   Projects: Real-time dashboards, collaborative whiteboards, chat unread-state synchronizers.
   Result: The engineer unblocks UX bottlenecks and understands event-driven frontends.

7. Mastery Integration (Days 131–140)
   Primary focus: Connecting all pieces into coherent distributed platforms.
   Projects: Re-architecting old projects with full auth, queues, and containerization.
   Result: The engineer sees the whole chessboard from DB index to UI paint.

8. Capstone (Days 141–180)
   Primary focus: Launch-ready, production-grade systems.
   Projects: Open-source contributions or massive scale-simulated clones.
   Result: The engineer is battle-tested, AI-resilient, and capable of shipping anything.

## THE 22 TECH SPINE AREAS
1. Algorithms (Days 1-7) · Unlocks logical thinking for complex data manipulation.
2. Data Structures (Days 8-14) · Unlocks efficient state storage.
3. System Design (Days 15-21) · Unlocks mapping parts to a whole.
4. Databases (SQL) (Days 22-28) · Unlocks rigid relational permanence.
5. NoSQL & Caching (Days 29-35) · Unlocks flexible, high-speed read/writes.
6. APIs & Networking (Days 36-42) · Unlocks system-to-system communication.
7. Microservices (Days 43-49) · Unlocks decoupled scaling.
8. Event-Driven Architecture (Days 50-56) · Unlocks async resilience.
9. Containers (Docker) (Days 57-63) · Unlocks portable environments.
10. Kubernetes (Days 64-70) · Unlocks container orchestration.
11. CI/CD Pipelines (Days 71-77) · Unlocks reliable, automated delivery.
12. Identity & Auth (Days 78-84) · Unlocks user security and access control.
13. App Security & Crypto (Days 85-91) · Unlocks data protection.
14. Cloud Native Dev (Days 92-98) · Unlocks AWS/GCP hyperscaling primitives.
15. Machine Learning Basics (Days 99-105) · Unlocks understanding AI tooling.
16. LLMs & Prompt Eng (Days 106-112) · Unlocks leveraging modern intelligence.
17. Vector Search & RAG (Days 113-119) · Unlocks providing context to AI.
18. React & Modern UI (Days 120-126) · Unlocks building user interfaces.
19. WebSockets & Real-Time (Days 127-133) · Unlocks live data connections.
20. Web Performance (Days 134-140) · Unlocks fast UX metrics.
21. Monitoring & Observability (Days 141-147) · Unlocks knowing when things break.
22. Advanced Engineering Patterns (Days 148-180) · Unlocks architect-level thinking.

## THE 1510 QUESTIONS
The questions are curated to force recall on edge cases and deep concepts, bypassing generic tutorial trivia. They’re categorized into 10 key themes (Syntax, Architecture, DevSecOps, DB Design, etc.). 
We distribute 8–9 questions per day. Why? 8 questions × average 5 minutes each = 40 minutes of mastery work. That's the upper bound of what you can meaningfully digest before question fatigue sets in. 9 is the maximum.
We use an offset/wrap approach instead of random selection to guarantee structured progression. You do not skip concepts; you march through them.

## THE CARRY-FORWARD SYSTEM — detailed
The exact flow:
  Day N ends → Mark Complete pressed →
  createCarryForwardsFromDay() runs →
  For each taskId NOT in completedTaskIds →
  CarryForward document created with toDayN = N+1

  Day N+1 loads → /api/day queries CarryForward →
  { userId, toDayN: N+1, resolved: false } →
  CarriedTasks prepended to payload →
  Frontend renders with orange "↩ CARRIED FROM DAY N" badge

  User checks carried task →
  POST /api/task with carryId →
  resolveCarryForward() called →
  CarryForward.resolved = true

  Edge case: user skips Day N+1 entirely →
  On Day N+2 load, advance all carries pointing to days < today to today

Why this design: tasks that aren't done don't vanish. The system is honest about what was skipped.

## THE DYNAMIC DAY ENGINE
Full explanation of lib/dayEngine.ts:
- getDayN(): how timezone-safe calculation works using Date diffs
- getSpineForDay(): how 22 areas map to 180 days by week scaling
- getQuestionsForDay(): the offset/wrap algorithm (e.g., offset = (completedDaysCount * questionsPerDay) % pool.length). If the slice reaches the end of the pool, it concats from index 0 safely
- buildDayPayload(): it assembles all stats dynamically. It's a pure function (no DB calls — all DB state is passed in), making it highly testable and robust

## MONGODB SCHEMA
- User: Stores configuration (userId, startDate). Essential for differential timeline calculation.
- DayRecord: Stores completedTaskIds and the day's boolean status. Reconstructs checkbox state.
- SkillProgress: Multi-dimensional skill metric tracker for the learn tab UI.
- LogRecord: Journal entries. Appends the developer records generated on the log tab.
- CarryForward: Tracks trailed items between days. `{ userId, taskId, toDayN, resolved }` structure explicitly models the loop-closing lifecycle.

## API ROUTE REFERENCE
| Method | Route | What it does | Called by |
|---|---|---|---|
| GET | `/api/day` | Builds and returns Day N state payload | Today tab |
| POST | `/api/day/complete` | Calculates carries and marks Day complete | Today tab submit |
| POST | `/api/task` | Toggles standard tasks/resolves carries | Task items |
| GET | `/api/dashboard` | Aggregates full system metrics | Dashboard page |
| GET | `/api/user` | Fetches active User config | Root layouts |
| POST | `/api/user` | Updates User configurables | Config page |
| POST | `/api/user/reset` | Purges DB records entirely | Config reset |
| GET | `/api/carryforward` | Retrieves pending carries manually | Edge checks |
| GET/POST | `/api/log` | Reads or writes daily developer logs | Log page |
| POST | `/api/skill` | Modifies active skill points/level | Learn page buttons |

## DESIGN DECISIONS
Why no daily-plan.json?
  Static plan files go stale. If you change your start date, or the questions change, or you add a phase — the static file is wrong. Computing at runtime means the plan is always derived from truth.

Why MongoDB instead of SQLite/Postgres?
  Flexible schema during development. The carry-forward edge cases required brutal schema iteration. MongoDB's upsert patterns handle the "create if not exists, update if exists" flows cleanly. No migrations. For a single-user app dashboard, it's the right tradeoff.

Why carry-forward as MongoDB documents instead of re-rendering from incomplete days?
  Re-rendering from incomplete days requires loading every previous day's layout payload — which requires knowing which days were incomplete — which is a full table scan. CarryForward documents are pre-computed at "Mark Complete" time, making the next day's `/api/day` query fast: one indexed fetch.

Why 8–9 questions and not more?
  8 questions × average 5 minutes each = 40 minutes of mastery work. That's the upper bound of what you can meaningfully engage with before question fatigue sets in. 9 is the maximum. The toggle exists because some days you have more bandwidth.

Why Bebas Neue + JetBrains Mono + Outfit?
  Bebas Neue: numbers need to feel like data on a dashboard, not text.
  JetBrains Mono: tasks are code. Treat them like code.
  Outfit: body text needs to breathe. It's the contrast against the mono.

## KNOWN LIMITATIONS
- Single user only (userId hardcoded as "default") — no auth system
- questions.json is large (~180KB) — initial page load pays this cost once
- No offline support — MongoDB required
- Timezone handling is best-effort — extreme timezone changes on the same calendar day could cause day N to calculate incorrectly

## WHAT TO BUILD NEXT
Short-term (days):
- Export to PDF: day-by-day plan as a printable doc
- Webhook: POST to Discord/Slack when a day completes
- GitHub integration: auto-create an issue for each day's project

Medium-term (weeks):
- Multi-user support (add auth, replace hardcoded userId)
- Progress comparison: see what Day 47 looked like vs Day 47 for someone else
- Adaptive questions: if mastery rate < 70%, repeat questions from that theme

Long-term (months):
- CLI version: run intel-os from terminal, check tasks with keyboard
- Mobile app: React Native with offline-first storage
- AI feedback: paste your Day N git diff, get feedback on code quality relative to the project's doneMeans
