# CLAUDE.md

## Git Workflow

**Never commit directly to `main`.** Always:
1. Create a feature branch from `main` (e.g., `feat/theme-system`, `feat/home-page`)
2. Make commits on the feature branch
3. Push the branch and open a PR against `main`
4. PRs require at least one approving review before merging

## Tech Stack

- **Frontend**: Next.js 14+ (App Router, TypeScript)
- **Backend/DB**: Supabase (Postgres, Auth, Realtime, Storage)
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Data Source**: API-Sport for tennis match data
- **State**: Zustand for client state
- **Icons**: Lucide React

## Project Structure

- `src/app/` — Next.js App Router pages
- `src/components/` — React components (layout, match, feed, profile, settings, ui)
- `src/lib/` — Supabase clients, API-Sport client, theme system, utilities
- `src/hooks/` — Custom React hooks
- `src/stores/` — Zustand stores
- `src/styles/` — Global CSS including theme definitions
- `supabase/` — Migrations, edge functions, seed data

## Conventions

- Use `uv` or venvs for any Python tooling — never system Python
- Run `npm run build` and `npm run lint` before opening a PR
- Keep components focused — one component per file
- Use server components by default; add `'use client'` only when needed
- All theme colors use CSS variables (e.g., `bg-[var(--bg-primary)]`)

## Plan

The full implementation plan is in [`CLAUDE_PLAN.md`](./CLAUDE_PLAN.md).
