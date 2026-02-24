# Product Requirements Document (PRD)

## 1. Product Overview
The **WarRoom Unified Intelligence Platform** is a 6-month intensive learning management and execution system. It is designed to transform developers into elite "Unified Intelligences"—engineers capable of system architecture, AI integration, infrastructure security, and high-level behavioral/soft skills. The platform enforces a rigorous 4-hour daily deep work protocol, tracking 150 hands-on projects, verifying mastery through complex architectural questions, and parallel-tracking basic and payable human skills.

## 2. Target Audience
- Ambitious software engineers aiming for staff/principal levels or founder capabilities.
- Developers transitioning into the modern AI-first, secure-by-design infrastructure era.
- Individuals committed to a high-discipline 6-month protocol (12-hour work shifts, 4 hours deep work).

## 3. Core Features & Functionality

### 3.1. Unified Dashboard
- **Progress Overview**: High-level telemetry of the 150-project journey across 8 phases (Foundation, Distributed Systems, Cloud, Security, Advanced Frontend, Mastery, Capstone).
- **Streak & Time Tracking**: Monitors the 4-hour daily deep-work commitment, current streak, and total hours invested.
- **Phase Breakdown**: Visual indicators of completion percentages for each strategic phase.

### 3.2. Project Execution Engine (The Spine)
- **Master Tracker**: A Kanban or List view of the 150 core projects.
- **Deep Work Workspace**: A focus mode timer (Pomodoro/Flow state) that locks out distractions and tracks time spent on specific projects.
- **Project Submission & GitHub Integration**: Ability to link repository PRs and commits.
- **Automated AI Review**: LLM integration to review submitted code against project requirements.

### 3.3. Verification Gates (Final Questions)
- **Mastery Verification**: To pass a phase, users must answer complex, scenario-based architecture and engineering questions (e.g., "Design a WebSocket gateway that supports millions of connections").
- **AI-Evaluated Responses**: Written answers are evaluated by an LLM trained on senior engineering standards to prevent "faking" knowledge.

### 3.4. Skills Matrix (Basic & Payable)
- **Human / Soft Skills Tracking**: Tracks progress on critical thinking, emotional intelligence, negotiation, and time management.
- **Resource Integration**: Links to required reading, podcasts, and exercises.
- **Reflection Journaling**: Daily prompts to record lessons learned, energy levels, and psychological state, directly mapped back to the "Daily Log".

## 4. User Journey
1. **Onboarding**: User commits to the 6-month timeline, links their GitHub, sets up their daily schedule (e.g., carving out the 4 hours).
2. **Daily Routine**: User logs in, reviews the Daily Log, launches the Deep Work Workspace for today's project.
3. **Execution**: User builds the project locally, commits code, and pastes the GitHub link into the platform.
4. **Verification**: After completing a cluster of projects, the user unlocks a "Verification Gate" and must answer randomized architectural questions.
5. **Review**: Weekly reviews to assess streak, top wins, bottlenecks, and adjust the next week's goals.

## 5. Non-Functional Requirements
- **Performance**: The app must be heavily optimized, serving as a shining example of the web performance taught in the curriculum. Perfect Lighthouse scores required.
- **Aesthetics**: A dark-mode, command-center/terminal aesthetic ("WarRoom"). Should feel elite, distraction-free, and high-stakes.
- **Security**: Robust auth, CSRF, and XSS protection, demonstrating the infrastructure security principles of the protocol.
