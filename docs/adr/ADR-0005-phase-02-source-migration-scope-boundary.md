# ADR-0005 — Phase 02 Source Migration Scope Boundary

- Status: Accepted by explicit project-owner instruction in the MoreAI project conversation, 5 November 2026.
- Supersedes: The expanded implementation scope in ADR-0002 where it would pull work from later official phases into Phase 02.

## Decision

Phase 02 is limited to complete upstream source migration, immutable provenance, source-to-target mapping, additive compatibility integration, and source-migration quality gates.

The work must not implement or expand product domains assigned to Phase 03 and later in the canonical Phase Implementation Plan. In particular, do not use Phase 02 as authorization to complete design-system work, identity/product-domain expansion, wallet, subscription, partner operations, network verification, campaign/reward, admin operations, captive gateway, or full native parity.

## Allowed Phase 02 work

1. Preserve complete pinned OpenManusWeb and Front-End-UI-MoreAI source snapshots under `vendor/`.
2. Preserve source assets, dependency metadata, license notices, copyright and owner authorization evidence.
3. Maintain file-level source manifests and SHA/byte-size verification.
4. Map source files to canonical `apps/`, `engine/`, and `packages/` target boundaries.
5. Add only compatibility adapters required to connect source safely to the existing MoreAI API/worker boundary; do not activate unsafe upstream tools or expose legacy routes.
6. Integrate source UI into the existing app shells without redesign or visual changes.
7. Run source provenance, build/import, dependency/security and license checks that are appropriate to this migration.
8. Update this phase report, master continuation context and commit.

## Constraints

- `vendor/` snapshots are immutable. All adaptation occurs outside the snapshots.
- FastAPI remains the single business API boundary; Supabase remains the canonical data plane.
- LLM provider credentials remain server-side. Legacy direct-provider browser routes are not mounted.
- Bash, Python execution and browser automation from upstream remain disabled unless a separately approved isolated runtime exists.
- No mock business data, production deployment, staging environment, or real-device/network test is introduced by this phase.
- The canonical phase order remains authoritative. Phase 03 begins only after this Phase 02 gate is accepted.

## Rationale

The owner clarified that this work must finish the source migration itself without taking on product-domain work belonging to later phases. This decision restores a clean phase boundary and prevents a source-migration PR from becoming an unreviewable cross-domain implementation.
