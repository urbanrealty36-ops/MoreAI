# ADR-0003 — Production-Only Release Strategy (No Staging)

- Status: Accepted by explicit project-owner instruction, 2 November 2026.
- Scope: MoreAI application services, worker and Supabase-backed production integration.

## Context

The project owner has instructed that MoreAI must not introduce or operate a separate staging environment. Changes are intended for the canonical `main` branch and production services.

The repository engineering constitution still requires isolated work branches, reviewable changes and PR-based integration. The Master PRD also requires equivalent safe integration verification and rollback controls when staging is omitted.

## Decision

1. No dedicated staging environment will be created or used for this workstream.
2. Code changes remain on an isolated implementation branch and are integrated into `main) through a PR after required quality gates pass. This preserves the mandatory repository change-control rules while keeping `main` as the production source of truth.
3. Production deployment occurs from the merged `main` commit only.
4. Before production deployment, CI must provide isolated ephemeral verification for build, contract, integration, migration replay, RLS/tenant-negative, security, runtime and visual-regression tests. Ephemeral test resources must not be connected to or mutate the live production database.
5. Production schema changes must be forward-only, additive/backward-compatible where possible, explicitly reviewed, and accompanied by a tested rollback or compensating procedure. No destructive reset, fixture seeding, tenant-negative mutation test or migration replay may run against live production data.
6. Production smoke checks are read-only or use explicitly provisioned synthetic test identities and resources that are isolated, reversible and clearly marked. No demo business data may be exposed as real customer or partner data.
7. If a required integration depends on an unselected gateway, RADIUS topology, ISP, payment provider, production credential or external approval, the capability remains unavailable/fail-closed until the owner supplies the decision and the integration is verified. A generic interface is not evidence of a live provider integration.
8. Deployments must have health checks, structured telemetry, a known-good image/version and a documented rollback path. If rollback could be data-destructive or unsafe, deployment is blocked pending a safe migration/compensation plan.

## Consequences

- No staging infrastructure or staging credentials are required.
- CI ephemeral environments and isolated test fixtures remain mandatory; they are test mechanisms, not staging deployments.
- The team may deploy directly from merged `main` to production only after all relevant gates pass.
- This ADR does not waive the Master PRD, AGENTS.md, security controls, PR review, or production acceptance evidence.
