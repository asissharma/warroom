# Frontend Guidelines

## 1. Directory Structure

The frontend will reside within a Next.js App Router structure.

```
src/
├── app/
│   ├── (auth)/             # Login, Signup
│   ├── (dashboard)/        # Main user platform
│   │   ├── timer/          # Deep work workspace
│   │   ├── projects/       # Kanban / Master tracker
│   │   ├── verification/   # The Crucible gates
│   │   └── skills/         # Basic & Payable skills
│   ├── api/                # Next.js API routes (if used as fullstack)
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Reusable generic components (shadcn/ui)
│   ├── layout/             # Nav, Sidebar, Footers
│   └── features/           # Feature-specific components (e.g., TimerClock, ProjectCard)
├── lib/                    # Utility functions, API clients
├── hooks/                  # Custom React hooks (e.g., useTimer, useAuth)
├── store/                  # Global state management (Zustand)
└── types/                  # TypeScript interface definitions
```

## 2. Component Design & Styling

- **Tailwind CSS**: Used exclusively for styling. No inline styles or separate CSS modules unless strictly necessary for complex animations.
- **Atomic Design principles**: Keep components small, pure, and reusable. Group feature-specific components together.
- **The "WarRoom" Aesthetic**:
  - **Colors**: Deep blacks, dark grays, with stark contrasting neon accents (e.g., terminal green, alert red) to denote status.
  - **Typography**: Monospaced fonts for data/code, clean sans-serif (e.g., Inter or Roboto Mono) for UI text.
  - **Interactions**: Fast, snappy feedback. Focus states must be highly visible to support keyboard navigation.

## 3. State Management

- **Local State**: `useState` and `useReducer` for isolated component state (e.g., form inputs, toggle switches).
- **Global UI State**: Zustand for things like "Dark Mode toggle", "Sidebar Open/Close", or "Active Timer Data" that persists across navigation.
- **Server State**: React Query (TanStack Query) for fetching, caching, and mutating data from the backend. Absolutely no `useEffect` for basic data fetching.

## 4. Performance & UX

- **Client vs. Server Components**: Default to Server Components (`layout.tsx`, `page.tsx`) for fast initial load. Opt-in to Client Components (`"use client"`) only when interactivity (hooks, state, event listeners) is required.
- **Optimistic UI**: When a user marks a sub-task as complete, update the UI instantly while the API call resolves in the background to ensure the app feels blazingly fast.
- **Error Boundaries & Suspense**: Implement granular loading states (skeleton loaders) and error boundaries so one failed component doesn't crash the entire dashboard.

## 5. Testing

- Components with complex logic (e.g., the Focus Timer) must have unit tests.
- Critical user paths (Login -> Start Timer -> Submit Project) should have end-to-end tests using Playwright.
