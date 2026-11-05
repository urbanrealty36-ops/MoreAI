# MoreAI — Master Continuation Context

**Updated:** 5 November 2026  
**Repository:** `urbanrealty36-ops/MoreAI`  
**Active phase:** Phase 03 — Design System & UI Foundations (shared token foundation implemented; acceptance in progress)  
**Active branch:** `main`  
**Phase 02 merge:** `407a3cbe1a9b5dbafbb14536ab0930f2271e0626` (PR #9 merged)

## Canonical project references
- Master PRD: `docs/MoreAI_Master_PRD_v1.0_ID.md`
- Official Phase Plan: `docs/MoreAI_Phase_Implementation_Plan_v1.0_ID.md`
- Engineering rules: `AGENTS.md`
- Phase 02 report: `docs/source-migration/PHASE-02-SOURCE-MIGRATION.md`  
- Phase 03 report: `docs/design-system/PHASE-03-DESIGN-SYSTEM-FOUNDATIONS.md`  
- Design token ADR: `docs/adr/ADR-0006-moreai-shared-design-token-source-of-truth.md`
- Phase boundary: `docs/adr/ADR-0005-phase-02-source-migration-scope-boundary.md`

## Pinned source references
- OpenManusWeb `dev_web_app`: commit `3ceaa9182b39bbb9898ddda0a4b1c50c2758ab5f`, upstream tree `41258ca11d4299beab17e4172fbcf8303eac1a6b`, 111 tracked files, 1,201,688 bytes.
- Front-End-UI-MoreAI `main`: commit `89bccc184dc8f2e6dac20627d5c7d50ef3e4a8f4`, upstream tree `30922c1ab21de3b60947cae5448e0a58222466be`, 53 tracked files, 8,708,522 bytes.
- The user confirmed personal ownership and authorization for MoreAI use of Front-End-UI-MoreAI on 5 November 2026. Its upstream root has no LICENSE. This does not grant rights over third-party dependencies/assets; those remain subject to their own terms.

## Phase 02 deliverables
- Immutable, complete snapshots: `vendor/openmanusweb/` and `vendor/reference-ui/`.
- Total mirrored source: 164 tracked files, 9,910,210 bytes.
- File inventory: `docs/source-migration/source-inventory-v1.csv`.
- Source pins and legal/provenance notes: `docs/source-migration/source-pins-v1.json`.
- Snapshot verification: `docs/source-migration/source-mirror-verification.json`.
- Per-file source-to-target mapping: `docs/source-migration/source-target-map-v2.csv` (164 rows with upstream path, blob SHA, size, vendor target, integration target and migration status).
- Third-party attribution: `THIRD_PARTY_NOTICES.md`.
- Secret scan exceptions: `docs/source-migration/SECRET-SCAN-EXCEPTIONS.md` and `.gitleaksignore` (exact fingerprints only).
- CodeQL legacy source review and narrow path config: `docs/source-migration/CODEQL-LEGACY-SNAPSHOT-REVIEW.md`, `.github/codeql/codeql-config.yml`.
- OpenManus execution security boundary: `docs/source-migration/OPENMANUS-SECURITY-MAPPING.md`.
- Scope boundary ADR: `docs/adr/ADR-0005-phase-02-source-migration-scope-boundary.md`.

## Integration boundaries
- Upstream snapshots are immutable; integration and compatibility code is additive outside `vendor/`.
- One FastAPI business API boundary; Supabase remains the canonical data plane.
- The bounded OpenManus adapter overrides the upstream default tool collection; only `Terminate` is available and `tool_choices` is disabled. Shell, Python, browser and legacy web/WebSocket routes are not activated.
- Legacy UI screens/components are integrated as non-operational source previews. LLM/Agent API surfaces fail closed and make no direct client-side provider calls.
- No new product domains from Phase 03+ were implemented in Phase 02.
- No staging environment, production deployment, live device/network validation, or production DB mutation was performed.

## Final acceptance evidence
- Source integrity/provenance: 164/164 upstream files verified by Git blob SHA and byte size; source-provenance CI passed.
- License/attribution: OpenManus MIT license and copyright preserved; UI owner authorization recorded; third-party rights caveat retained.
- CI: final implementation CI run `42016827710` passed on commit `3b819439ff0a6dd20e252e29cf0219ad827a5741`; lockfile, source provenance, Python quality/tests, Web lint/typecheck/tests/build, CodeQL, pnpm audit, pip audit, Gitleaks and runtime smoke/Expo configuration all passed.
- CodeQL exclusions are limited to seven exact non-mounted upstream legacy web files. The 24 upstream alerts remain documented and quarantined, not remediated. Any future activation requires remediation and re-review.
- Phase 02 report: `docs/source-migration/PHASE-02-SOURCE-MIGRATION.md`.

## Phase 03 implementation status
- Phase 02 PR #9 was merged to `main`; merge commit `407a3cbe1a9b5dbafbb14536ab0930f2271e0626`.
- Canonical tokens: `packages/design-tokens/tokens.json`.
- Typed exports: `packages/design-tokens/src/index.ts` (web and native theme).
- Generated CSS: `packages/design-tokens/src/tokens.css`; deterministic generator/check: `packages/design-tokens/scripts/generate-css.mjs`.
- Token tests: `packages/design-tokens/test/tokens.test.mjs`.
- Web/Admin/Partner/Captive global styles import shared token CSS; Native foundation consumes the shared token object.
- Four web surfaces include keyboard focus-visible and reduced-motion CSS foundations; browser zoom remains enabled for text scaling.
- Web fonts use the source reference's `next/font/google` families. Native fonts are downloaded at build/development startup by `apps/mobile/scripts/download-fonts.mjs`, verified by Git blob SHA/size, and bundled through Expo Metro; font binaries remain ignored generated assets.
- CI includes Playwright light/dark pixel comparison against the immutable reference at 360/390/768/1024/1440, Axe WCAG 2.2 AA scans, responsive overflow, keyboard focus, reduced-motion and dark-token checks. Test-only route `/__visual` is gated by `MOREAI_VISUAL_QA=1`.
- Latest acceptance status remains pending until the browser QA and Expo Metro jobs complete successfully and screenshot artifacts are inspected.
- No Supabase migrations, FastAPI business endpoints, or production deployments were introduced.
- Phase 03 remains In Progress until final CI, screenshot comparison at 360/390/768/1024/1440, WCAG 2.2 AA/reduced-motion checks, and native font/runtime review are evidenced.

## Engineering constraints for all future work
- Read `AGENTS.md`, Master PRD, official Phase Plan and relevant ADRs before implementation.
- Preserve immutable vendor snapshots; add integrations outside vendor paths.
- FastAPI is the only business API boundary; no duplicate backend or DB engine.
- No frontend service-role keys, direct business-table writes, or provider secrets in client bundles.
- Keep unimplemented features fail-closed; no dummy production data.
- Do not begin later-phase domains before the official phase boundary.
- Do not claim live/staging/production verification from CI smoke tests.

## Phase status and next phase
- Phase 00 — Source & Architecture Audit: Passed.
- Phase 01 — Monorepo Foundation: Passed.
- Phase 02 — Source Migration: **Passed; PR #9 merged to `main`** (`407a3cbe1a9b5dbafbb14536ab0930f2271e0626`).
- Phase 03 — Design System & UI Foundations: **In Progress**; shared token foundation committed directly to `main`; light/dark screenshot regression, Axe/accessibility and touch-target review, Expo Metro font bundling, and final CI evidence remain open.
- Next official phase after Phase 03 acceptance: **Phase 04 — Identity & Access.**

