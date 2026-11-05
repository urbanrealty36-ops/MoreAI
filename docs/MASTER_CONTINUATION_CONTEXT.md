# MoreAI — Master Continuation Context

**Updated:** 5 November 2026  
**Repository:** `urbanrealty36-ops/MoreAI`  
**Active phase:** Phase 02 — Source Migration  
**Implementation branch:** `phase-02-source-migration-final`  
**Status:** Source migration implemented; final scoped-branch CI acceptance pending.

## Canonical project references
- Master PRD: `docs/MoreAI_Master_PRD_v1.0_ID.md`
- Phase Plan: `docs/MoreAI_Phase_Implementation_Plan_v1.0_ID.md`
- Engineering rules: `AGENTS.md`
- Phase 02 report: `docs/source-migration/PHASE-02-SOURCE-MIGRATION.md`
- Phase 02 scope boundary: `docs/adr/ADR-0005-phase-02-source-migration-scope-boundary.md`

## Pinned source references
- OpenManusWeb `dev_web_app`: `3ceaa9182b39bbb9898ddda0a4b1c50c2758ab5f`, tree `41258ca11d4299beab17e4172fbcf8303eac1a6b`, 111 files, 1,201,688 bytes.
- Front-End-UI-MoreAI `main`: `89bccc184dc8f2e6dac20627d5c7d50ef3e4a8f4`, tree `30922c1ab21de3b60947cae5448e0a58222466be`, 53 files, 8,708,522 bytes.
- UI owner personally confirmed ownership and permission for MoreAI use on 5 November 2026; the upstream UI repository has no root LICENSE. Third-party dependency and asset rights remain separate.

## Phase 02 artifacts
- Immutable snapshots: `vendor/openmanusweb/`, `vendor/reference-ui/`.
- File inventory: `docs/source-migration/source-inventory-v1.csv`.
- Source pins: `docs/source-migration/source-pins-v1.json`.
- Snapshot verification: `docs/source-migration/source-mirror-verification.json`.
- Source-to-target mapping: `docs/source-migration/source-target-map-v2.csv`.
- Third-party notices: `THIRD_PARTY_NOTICES.md`.
- OpenManus security boundary: `docs/source-migration/OPENMANUS-SECURITY-MAPPING.md`.
- Scope ADR: `docs/adr/ADR-0005-phase-02-source-migration-scope-boundary.md`.

## Engineering constraints
- Read `AGENTS.md` and phase documentation before every implementation change.
- Preserve vendor snapshots; integrate only outside vendor paths.
- FastAPI is the only business API boundary. Supabase remains canonical data plane.
- No direct provider calls from browser/mobile; no provider secrets in client bundles.
- Shell, browser and Python tools remain disabled until approved isolated runtimes exist.
- No demo business data as production data; fail closed for unavailable integrations.
- No staging environment or production deployment in this phase.
- Do not implement domains assigned to Phase 03 or later under Phase 02.
- No claim of build/test/CI success without a verifiable run tied to the final commit.

## Phase status and next work
Phase 00 — Source & Architecture Audit: Passed.  
Phase 01 — Monorepo Foundation: Passed.  
Phase 02 — Source Migration: implementation complete; awaiting final scoped-branch CI and PR review.  
Next after Phase 02 acceptance: **Phase 03 — Design System & UI Foundations**.

## Current implementation commit
To be filled with the final Phase 02 commit SHA after the scoped branch commit is created.
