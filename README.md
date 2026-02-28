# INTEL·OS

> An operating system for engineers to build systematic mastery over 6 months, not willpower.

## WHAT THIS IS
AI is changing what engineers need to know. The value of writing boilerplate is crashing to zero, while the value of system design, debugging, infrastructure, and domain knowledge is compounding. INTEL·OS is the operating system for staying ahead of that curve.

Instead of answering "what should I learn today?", INTEL·OS takes away the decision fatigue. It gives you daily combat missions, assigns real code challenges from a 1510-question bank, tracks carry-forward tasks, and runs you through a 6-month arc. 

Unlike Notion, Obsidian, Anki, or any other productivity tool, INTEL·OS doesn't ask you what to do — it tells you. You just execute.

## THE SYSTEM
The 6-month sequence is highly structured to build progressive mastery:
- **150 projects** across 8 phases (Foundation, Distributed Systems, Cloud Infrastructure, Security, ML/AI Engineering, Frontend & Real-Time, Mastery Integration, Capstone)
- **22 tech spine areas** defining the exact learning sequence
- **1,510 mastery questions** precisely themed to each area
- **10 payable skills syllabi** running parallel (18 days each)
- **100+ human skills** rotating daily
- **Carry-forward**: unchecked tasks don't vanish. They follow you until the loop is closed.

## SCREENSHOTS
![Today Tab](docs/today.png)
*The cockpit for your current day's mission, tasks, and carries.*

![Dashboard](docs/dashboard.png)
*A single-view summary of your progress across all 8 phases.*

![Learn Tab](docs/learn.png)
*Deep-dive into the 1510-question bank and specific learning tracks.*

![Config](docs/config.png)
*System configuration and timeline control.*

## STACK
**Frontend:** Next.js 14 App Router · TypeScript · Tailwind CSS
**Backend:** Next.js API Routes · MongoDB (Mongoose)
**Data:** 6 JSON files (projects, spine, skills, courses, survival areas, questions)

*No external auth. No paid services. Runs locally or on Vercel + Atlas free tier.*

## QUICK START
Prerequisites:
  Node.js 18+
  MongoDB (local or Atlas free tier)

```bash
git clone https://github.com/yourusername/intel-os
cd intel-os
npm install
cp .env.example .env.local
# Add your MONGODB_URI to .env.local
npm run dev
```
Open http://localhost:3000
Set your start date in /config
Day 1 begins.

## ENVIRONMENT VARIABLES
| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGODB_URI` | Yes | Connection string for MongoDB database | `mongodb+srv://...` |
| `NEXT_PUBLIC_APP_NAME` | No | Overrides application display name | `INTEL·OS` |

## PROJECT STRUCTURE
- `app/` - Next.js 14 App Router, pages, and API routes.
- `components/` - Reusable UI components (Nav, TaskItem, etc.)
- `lib/` - Engine logic (`dayEngine.ts`, `carryEngine.ts`), Mongoose models, and types.
- `data/` - Static JSON files powering the entire curriculum.
  - `projects.json` - 150 build missions, PROJECT_DANCE
  - `questions.json` - 1510 mastery questions themed by area
  - `tech-spine.json` - The 22 tech learning areas mapped to 180 days
  - `skills.json` - 70+ basic human skills, 10 payable syllabi
  - `courses.json` - 50+ free cert courses
  - `survival-areas.json` - 7 critical skills for the AI era
- `hooks/` - Custom React hooks for data fetching.

## DATA FILES
| File | Contents | Count |
|---|---|---|
| `projects.json` | PROJECT_DANCE 150 build missions | 150 |
| `questions.json` | Mastery questions with themes | 1510 |
| `tech-spine.json` | 22 learning areas with day ranges | 22 |
| `skills.json` | Basic skills + 10 payable syllabi | 70+ basic, 10 payable |
| `courses.json` | Free certification courses with URLs | 50+ |
| `survival-areas.json` | 7 critical skills for AI era | 7 |

## HOW IT WORKS
- **No daily-plan.json**: Everything is computed at runtime from `/api/day`.
- **Timezone Safety**: Day N is calculated purely from your configured start date, safely handling timezone shifts.
- **Mastery Rotation**: Questions rotate through the theme pool dynamically and sequentially. Offset is calculated as `(completedDays × questionsPerDay) % poolSize`, guaranteeing no repeats until exhausted.
- **Carry-forward Engine**: Unchecked tasks at day completion spawn `CarryForward` docs pointing to day N+1.
- **MongoDB Stores**: The single source of mutable truth tracking `User`, `DayRecord`, `SkillProgress`, `LogRecord`, and `CarryForward`.

## CONTRIBUTING
Pull Requests are welcome. Focus on adding high-quality projects, resolving curriculum bugs, or optimizing UI performance for cockpit use.

## LICENSE
MIT
