# Phase 01 — Monorepo Foundation

<badge>Acceptance gate: PASSED</badge>

**Last audited:** 2026-11-02  
**Accepted branch head:** `b9b9b5d63e498652522dec8a17a3a8fbbfc697b5`

## Implemented baseline

- pnpm workspace and Turborepo task graph.
- Python uv workspace with API, worker and sandbox members.
- App entrypoints for Web, Admin, Partner Portal, Captive Portal and Expo Native.
- Shared package boundaries for web/native UI, design tokens, icons, API client, types, validation and localization.
- FastAPI health/readiness/OpenAPI foundation and environment settings.
- Supabase CLI project configuration targeting the existing MoreAI project.
- CI, CodeQL, dependency audits, Gitleaks and Dependabot workflows.
- Both `pnpm-lock.yaml` and `uv.lock` are committed and checked in read-only CI mode.

## Service boundaries

All business data/operations flow through FastAPI versioned endpoints. Approved Supabase Auth SDK flows are the only client exception. Supabase Postgres remains canonical. LLM credentials and Supabase privileged keys are server-only. Browser/Python execution must be isolated from the API process.

## Acceptance evidence

GitHub Actions run **41421253694** on the accepted branch head completed successfully for all jobs:

| Job | Result |
|---|---|
| Workspace lockfile validation | PASS |
| Web lint, typecheck, tests and build | PASS |
| Python Ruff and pytest | PASS |
| CodeQL, pnpm audit, pip-audit and Gitleaks | PASS |
| Runtime smoke — FastAPI and Web/Admin/Partner/Captive apps | PASS |
| Expo Native configuration validation | PASS |

The runtime smoke starts FastAPI and all four web portals, verifies HTTP responses, and validates the Expo app configuration. Lockfile validation is read-only and no CI job writes generated changes back to the branch.

## Explicit non-goals

This phase does not migrate upstream UI/backend source, implement product domains, create Supabase schema, configure production secrets, deploy services, or claim runtime security for the sandbox. UI shells are scaffolding until Phase 02 source migration; visual source components must remain unchanged during integration.

## Gate decision

**PHASE 01 ACCEPTED.** The monorepo structure, workspace lockfiles, frontend and Python quality gates, security scans, runtime boot smoke tests, and Expo configuration validation are green on the accepted commit. This phase is ready for integration into `main`.
