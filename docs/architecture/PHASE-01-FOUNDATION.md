# Phase 01 — Monorepo Foundation

## Implemented baseline

- pnpm workspace and Turborepo task graph.
- Python uv workspace with API, worker and sandbox members.
- App entrypoints for Web, Admin, Partner Portal, Captive Portal and Expo Native.
- Shared package boundaries for web/native UI, design tokens, icons, API client, types, validation and localization.
- FastAPI health/readiness/OpenAPI foundation and environment settings.
- Supabase CLI project configuration targeting the existing MoreAI project.
- CI, CodeQL, dependency review, Gitleaks and Dependabot workflows.

## Service boundaries

All business data/operations flow through FastAPI versioned endpoints. Approved Supabase Auth SDK flows are the only client exception. Supabase Postgres remains canonical. LLM credentials and Supabase privileged keys are server-only. Browser/Python execution must be isolated from the API process.

## Explicit non-goals

This phase does not migrate upstream UI/backend source, implement product domains, create Supabase schema, configure production secrets, deploy services, or claim runtime security for the sandbox. UI shells are placeholders until Phase 02 source migration; visual source components must remain unchanged during integration.

## Quality gate status

Not passed until pnpm and uv lockfiles are committed, all apps/packages resolve, all CI jobs pass, Python tests pass, frontend typecheck/build pass, and repository scans are green. CI can generate lockfiles in its runner and publish them as artifacts, but artifacts are not a substitute for committing reviewed lockfiles to the repository.
