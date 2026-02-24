# App Flow / User Journey

## 1. Authentication & Onboarding
- **Sign Up / Login**: Standard email/password or OAuth (GitHub preferred to seamlessly link projects).
- **The Commitment Protocol**: A mandatory onboarding sequence where the user agrees to the 6-month timeline, 4-hour daily deep work rule, and the "no faking" mastery gates.
- **Initial Setup**: User configures their timezone, preferred deep work hours, and baseline skill levels.

## 2. Main Dashboard (The Command Center)
- **Hero Section**: Shows "Days Remaining" (out of 150), current daily streak, and today's primary objective.
- **Quick Actions**: 
  - "Start Deep Work" (Launches the focus timer).
  - "Daily Log" (Opens today's reflection modal).
- **Telemetry Modules**:
  - Phase Progress (Donut charts for Foundation, Distributed, Cloud, etc.).
  - Recent Activity Feed (Commits, completed projects, unlocked skills).

## 3. Deep Work Workspace
- **Timer & Focus UI**: A fullscreen, distraction-free view showing the current project details, key skills to learn, and difficulty level.
- **Checklist**: Sub-tasks for the current project.
- **Submission**: Input field for GitHub PR/Repository link and a markdown editor for "Key Learnings".
- **AI Code Review (Optional)**: User requests an automated AI review of their linked repository.

## 4. The Project Matrix (Master Tracker)
- **List/Board View**: Displays all 150 projects categorized by phase.
- **Filtering**: By status (To Do, In Progress, Completed), difficulty (⭐ to ⭐⭐⭐⭐⭐), or category (Databases, Event-Driven, Advanced Frontend).
- **Detail View**: Clicking a project shows the architectural goals, why it matters (impact), estimated hours, and associated resources ("Tech Smith" mapped topics).

## 5. Verification Gates (The Crucible)
- **Gate Unlock**: Triggered when a specific subset of projects is completed.
- **Testing Interface**: A timed, proctored-feeling environment where the user is presented with 3-5 randomized complex engineering questions (from the 100+ Final Questions bank).
- **Submission & Grading**: The user writes a structured architectural response. The system (via LLM) provides a pass/fail grade with detailed feedback on what was missed (e.g., "Forgot to account for race conditions in Redis").

## 6. Skills Hub (Human & Payable Skills)
- **Parallel Tracks**: Separate tabs for "Basic Skills" (Cognitive, Emotional Resilience) and "Payable Skills" (Negotiation, Sales, Money Management).
- **Resource Grid**: Links to YouTube exercises, books (e.g., *Never Split the Difference*), and podcasts.
- **Action Items**: Checkboxes to verify completion of real-world exercises (e.g., "Completed weekly resilience journal", "Practiced assertive handshake").

## 7. Weekly Review & Analytics
- **Weekly Check-in Modal**: Prompts the user every Sunday to fill out: Top Win, Biggest Challenge, Skills Learned, Engagement, Revenue (if applicable), and Next Week's Goal.
- **Analytics Page**: Charts showing average hours/day, difficulty curve progression, and skill proficiency mapped against the 6-month goal.
