# Phase 01 — Monorepo Foundation

**Status:** Acceptance verification in progress.  
**Last audited:** 2026-11-02

## Implemented baseline

- pnpm workspace and Turborepo task graph.
- Python uv workspace with API, worker and sandbox members.
- App entrypoints for Web, Admin, Partner Portal, Captive Portal and Expo Native.
- Shared package boundaries for web/native UI, design tokens, icons, API client, types, validation and localization.
- FastAPI health/readiness/OpenAPI foundation and environment settings.
- Supabase CLI project configuration targeting the existing MoreAI project.
- CI, CodeQL, dependency review, Gitleaks and Dependabot workflows.
- Both `pnpm-lock.yaml` and `uv.lock` are committed on this branch.

## Service boundaries

All business data/operations flow through FastAPI versioned endpoints. Approved Supabase Auth SDK flows are the only client exception. Supabase Postgres remains canonical. LLM credentials and Supabase privileged keys are server-only. Browser/Python execution must be isolated from the API process.

## Acceptance evidence

- A GitHub Actions CI run for commit `881688f5db9e5c6c41275d21424de3e141fdb898` completed successfully with lockfile generation, Web lint/typecheck/test/build, Python Ruff/pytest, CodeQL, dependency audit and Gitleaks in the CI workflow.
- The lockfile bot subsequently committed generated lockfiles as `bacec70741b6294cde07f58f42398d41cfaf34ff`.
- The separate `.github/workflows/security.yml` run on the prior head reported failure. A narrow `.gitleaksignore` now lists only three exact historical fingerprints for expired upstream video embed JWTs; it does not ignore other commits, paths or secret types.
- New CI and Security workflow runs on the latest branch head must complete successfully before the Phase 01 gate is accepted.
- No Supabase schema change, production secret provisioning or deployment is part of Phase 01.

## Explicit non-goals

This phase does not migrate upstream UI/backend source, implement product domains, create Supabase schema, configure production secrets, deploy services, or claim runtime security for the sandbox. UI shells are scaffolding until Phase 02 source migration; visual source components must remain unchanged during integration.

## Quality gate

**NOT PASSED YET.** The monorepo foundation and lockfiles are implemented, but acceptance requires successful CI and security scans on the latest branch commit, a clean checkout resolving all workspaces, and the reviewed report/commit evidence. Do not merge this PR until the latest checks are green.
