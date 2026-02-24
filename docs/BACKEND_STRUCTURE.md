# Backend Structure

## 1. Base Architecture

The backend will be built as a RESTful JSON API using Node.js (and ideally deployed alongside the Next.js app using API Routes, or as a standalone Express/NestJS service).

### Preferred Structure (Modular / Domain-Driven)

```
server/ (or src/api/)
├── controllers/          # Request parsing, response formatting
├── services/             # Core business logic (Platform rules, Timer logic)
├── models/               # Database schemas and interactions (Mongoose schemas)
├── routes/               # API endpoint definitions mapped to controllers
├── middlewares/          # Auth guards, Rate limiters, Error handlers
├── utils/                # Helper functions (e.g., AI prompt generators)
└── config/               # Environment variables, DB connection setups
```

## 2. Core Domains & Services

- **User & Auth Service**: Handles registration, GitHub OAuth flow, role management, and session validation.
- **Project Tracking Service**: CRUD operations for the 150 projects. Logic for calculating phase completion percentages.
- **Timer / Deep Work Service**: Validates time entries, updates streaks, and prevents retroactively altering "Deep Work" logs.
- **Evaluation Service (AI Integration)**:
  - Takes user-submitted code/answers.
  - Retrieves the associated rubric from the database.
  - Calls OpenAI/Claude via secure backend prompts to grade the submission.
  - Returns pass/fail and feedback to the client.

## 3. Database Schema Overview (MongoDB / NoSQL)

- **User**: _id, email, github_id, current_streak, created_at.
- **Project**: _id, phase, title, description, difficulty, estimated_hours.
- **UserProject**: _id, user_id, project_id, status (todo/in-progress/completed), github_link, started_at, completed_at.
- **DailyLog / TimeEntry**: _id, user_id, date, duration_minutes, notes.
- **VerificationGate**: _id, phase, questions (Array of objects).
- **GateAttempt**: _id, user_id, gate_id, AI_score, feedback, passed (boolean).

## 4. Security & Middlewares

- **Authentication Guard**: All routes (except login/webhook) must verify a JWT or secure session cookie.
- **Rate Limiting**: Strictly limit AI evaluation endpoints to prevent cost overruns (e.g., max 5 evaluations per day per user).
- **Validation**: Every incoming API payload must be strictly validated using Zod before any business logic is executed. Never trust client input, especially for Time Tracking entries.

## 5. API Design Conventions

- Standardized JSON responses: `{ "success": true, "data": { ... } }` or `{ "success": false, "error": { "code": 404, "message": "Project not found" } }`.
- Use correct HTTP methods (GET for reads, POST for creates, PATCH for partial updates, DELETE for removals).
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- Pagination for list endpoints (e.g., `/api/projects?phase=3&page=1&limit=10`).
