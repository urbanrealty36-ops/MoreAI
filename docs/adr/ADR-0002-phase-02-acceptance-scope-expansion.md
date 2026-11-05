# ADR-0002 — Phase 02 Acceptance Scope Expansion

- Status: Accepted by explicit project-owner instruction in the MoreAI project conversation, 2 November 2026.
- Scope: Extend Phase 02 completion work beyond the original source-migration gate to include the ordered foundation and integration sequence explicitly requested by the project owner.

## Decision

The Phase 02 workstream remains open until all of the following are complete and evidenced:

1. Supabase schema, versioned migrations, RLS, tenant membership, permission matrix and audit.
2. FastAPI contracts backed by real persistence for Partner, Admin, Captive Portal, entitlements and network verification.
3. Web, Native, Admin, Partner Portal and Captive Portal wired to typed FastAPI contracts, including loading, empty, error, permission-denied, expired and offline states.
4. OpenManus engine integrated through durable worker lifecycle and isolated Python/browser execution.
5. LLM Model Router, usage metering, cost accounting, quota, credit reservation and settlement.
6. Full build, contract, security, tenant-isolation, dependency/license and visual-regression quality gates.
7. Formal Phase 02 acceptance review.

## Constraints

- The Master PRD remains the product and security authority.
- Supabase Postgres remains the only canonical business database.
- All business data and operations pass through FastAPI; only approved Supabase Auth SDK flows are client-side.
- UI source snapshots and visual design remain immutable; no redesign without approval.
- No mock/demo business data in production. Fail closed when provider, gateway or isolated runtime dependencies are unavailable.
- Phase 03 cannot start until this expanded Phase 02 gate passes.

## Rationale

The original phase plan places identity, agent engine, FastAPI core and LLM gateway in later numbered phases. The project owner explicitly requested these dependencies as prerequisites to close Phase 02. This ADR records that scope change rather than silently changing the phase plan.
