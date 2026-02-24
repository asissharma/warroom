# Tech Stack

## 1. Guiding Principles
The tech stack is selected to be modern, scalable, and fully aligned with the advanced curriculum taught in the platform. It must support real-time features, secure authentication, and AI integrations.

## 2. Frontend
- **Framework**: Next.js (React) for server-side rendering, SEO, and optimal core web vitals.
- **Styling**: Tailwind CSS for rapid, maintainable styling. Dark-mode first, command-line aesthetic (monospaced fonts, neon accents, high contrast).
- **State Management**: Zustand for global state (lightweight and unopinionated); React Query for server-state caching and synchronization.
- **UI Components**: Radix UI or shadcn/ui for accessible, unstyled primitives customized to the "WarRoom" aesthetic.
- **Animations**: Framer Motion for subtle, premium micro-interactions and transitions between focus modes.

## 3. Backend (API Layer)
- **Runtime**: Node.js with TypeScript.
- **Framework**: Express or NestJS depending on desired architectural rigidity. (Express for flexibility and speed of iteration, NestJS for enterprise-pattern mapping).
- **Architecture**: RESTful APIs as the baseline, with tRPC or GraphQL considered if high relational data fetching is needed for the dashboard.
- **Real-Time**: Socket.io or native WebSockets for the live timer sync, presence indicators, and real-time AI feedback streaming.

## 4. Database & Storage
- **Primary Database**: MongoDB (NoSQL) via Mongoose or the native MongoDB driver. Ideal for flexible document storage like Users, Daily Logs, and Projects, allowing for rapid iteration.
- **Caching & Timers**: Redis. Used for managing the state of active Deep Work timers, rate limiting, and session management.
- **Search / Vector Store (Optional)**: MongoDB Atlas Vector Search for storing embeddings of the user's responses and project code to run semantic comparisons against the correct architectural answers.

## 5. AI Integration
- **LLM Provider**: OpenAI (GPT-4o) or Anthropic (Claude 3.5 Sonnet).
- **Use Cases**:
  - Grading "Verification Gate" architectural answers.
  - Analyzing linked GitHub code for adherence to project requirements.
  - Generating dynamic "Daily Reflection" summaries.
- **Integration Tooling**: Vercel AI SDK or LangChain for managing prompt chains, streaming responses, and structured outputs.

## 6. Infrastructure & DevOps
- **Hosting / Compute**: Vercel for the Next.js frontend; Railway or Render for the backend Node.js server and PostgreSQL/Redis instances. Wait, if using Next.js API routes exclusively, Vercel can host full-stack. Let's aim for a unified Next.js full-stack deploy on Vercel for simplicity.
- **Authentication**: NextAuth.js (Auth.js) supporting GitHub OAuth and traditional Email/Magic Link.
- **CI/CD**: GitHub Actions for automated linting, type-checking, and deploying.
- **Observability**: Sentry for error tracking; PostHog for product analytics and telemetry.

## 7. Security Measures
- **Rate Limiting**: Redis-backed rate limiting to prevent API abuse, especially on expensive LLM evaluation routes.
- **Input Validation**: Zod for end-to-end type safety and sanitation.
- **Protections**: Helmet.js (if Express) or Next.js security headers config for CSP, CSRF, and XSS prevention.
