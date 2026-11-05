# Phase 02 — Source Migration

**Status:** SOURCE MIGRATION COMPLETE — CI acceptance pending on the scoped final branch.  
**Scope authority:** Official Phase Implementation Plan + owner scope clarification recorded in ADR-0005.  
**Implementation branch:** `phase-02-source-migration-final`  
**No production deployment, staging environment, live network/device test, or production database mutation was performed.**

## 1. Scope and boundary

This report closes only the Phase 02 source-migration scope: immutable upstream snapshots, provenance, file-level manifest, source-to-target mapping, additive compatibility integration, and migration quality gates.

It does **not** claim completion of product domains assigned to Phase 03 and later. Design-system expansion, full identity/product workflows, credit/wallet, subscription, partner CRUD, campaign/reward, network verification, gateway provisioning, full native parity, and production operations remain outside this phase. ADR-0005 supersedes the earlier Phase 02 scope expansion wherever it conflicts with this boundary.

## 2. Pinned upstream snapshots

| Source | Pinned ref | Commit | Upstream tree | Tracked files | Bytes | Target |
|---|---|---|---|---:|---:|---|
| OpenManusWeb | `dev_web_app` | `3ceaa9182b39bbb9898ddda0a4b1c50c2758ab5f` | `41258ca11d4299beab17e4172fbcf8303eac1a6b` | 111 | 1,201,688 | `vendor/openmanusweb/` |
| Front-End-UI-MoreAI | `main` | `89bccc184dc8f2e6dac20627d5c7d50ef3e4a8f4` | `30922c1ab21de3b60947cae5448e0a58222466be` | 53 | 8,708,522 | `vendor/reference-ui/` |

**Total:** 164 tracked files; 9,910,210 bytes.

All source files, binary assets, dependency metadata, configuration examples, documentation, workflows, scripts, and source examples are retained in the vendor snapshots. Upstream snapshot files are not edited by MoreAI integration work.

## 3. Integrity and provenance

- Direct upstream-to-vendor comparison: **164/164 file paths, Git blob SHA values, and byte sizes matched** on the inspected source-migration branch.
- Verification records are retained in:
  - `docs/source-migration/source-inventory-v1.csv`
  - `docs/source-migration/source-pins-v1.json`
  - `docs/source-migration/source-mirror-verification.json`
  - `docs/source-migration/source-target-map-v2.csv`
- The scoped final branch reuses the exact same immutable Git blobs and is checked by the CI source-provenance job before acceptance.
- No upstream file was silently omitted. No source snapshot was modified to make an integration fit.

## 4. License, rights and attribution

### OpenManusWeb
- Upstream MIT `LICENSE` is preserved at `vendor/openmanusweb/LICENSE`.
- Copyright notice is preserved: Copyright (c) 2025 manna_and_poem.
- Attribution is recorded in `THIRD_PARTY_NOTICES.md`.

### Front-End-UI-MoreAI
- The upstream repository has no root `LICENSE`.
- The project owner confirmed in the MoreAI project conversation on 5 November 2026 that the repository is personally owned and authorized for use in MoreAI.
- This owner authorization is recorded in `THIRD_PARTY_NOTICES.md` and the source pin metadata. It is not presented as an open-source license for unrelated third-party dependencies/assets.
- Original dependency manifests and asset files are retained. Third-party package/font/icon/asset licensing remains subject to their own upstream terms; do not infer that owner authorization grants rights over third-party material.
- No GLB/GLTF files were present in the audited UI upstream tree.

## 5. Source-to-target integration

The detailed row-level map is `docs/source-migration/source-target-map-v2.csv`. It records repository, pinned commit, source path, upstream blob SHA, byte size, immutable vendor path, integration target(s), and integration status for every one of the 164 source files.

### OpenManusWeb
- Original agent and flow source is preserved and connected through the MoreAI worker compatibility boundary.
- Provider calls are routed through the server-side FastAPI LLM gateway; provider credentials are not placed in the client.
- Legacy OpenManus web routes and WebSocket endpoints are not exposed as public MoreAI routes.
- Shell, Python execution, and browser automation remain denied/disabled unless separately approved isolated runtimes and controls exist.
- Canonical future target mapping is documented under `engine/agents`, `engine/orchestration`, `engine/tools`, and `engine/llm`; current runtime boundary remains `apps/worker`, `apps/api`, and `apps/sandbox` without introducing a duplicate backend.

### MoreAI UI reference
- Source screens, components, CSS, hooks, PWA assets, and portal surfaces are integrated additively into the existing Web, Admin, Partner Portal, and Captive Portal app source trees.
- The active app copies are kept separate from the immutable `vendor/reference-ui` snapshot.
- Customer, Admin, Partner, and Captive Portal screens are mounted as clearly labelled source previews only; Phase 02 does not activate identity, partner, admin, or network business workflows.
- The source Gemini route remains preserved only in the vendor snapshot. Active app surfaces are non-operational previews and do not make provider calls or direct browser-to-provider requests.
- Reference-only Admin/Partner/Captive surfaces remain explicitly non-operational or fail-closed where the corresponding later product domain is not in scope.
- No redesign, re-theme, or intentional visual-system replacement is part of this phase.

## 6. Dependencies and configuration

- Upstream `package.json`, `requirements.txt`, `setup.py`, configuration examples, workflow files, and `.env.example` are preserved in their respective vendor snapshots.
- Workspace dependency integration is recorded in root and app manifests/lockfiles.
- No private `.env`, API key, credential bundle, browser profile, runtime log, or personal data is intentionally migrated.
- Secret scanning and dependency vulnerability scanning are included in CI. These checks do not replace a per-asset/per-font third-party rights review.

## 7. Acceptance evidence

| Gate | Evidence | Status |
|---|---|---|
| Complete source inventory | 111 OpenManusWeb + 53 UI files | PASS |
| Vendor snapshot integrity | Direct Git blob SHA and byte-size comparison, 164/164 | PASS on inspected migration branch; final branch CI re-check required |
| License and attribution | MIT license retained; owner authorization recorded; notices present | PASS with third-party rights caveat above |
| Source-to-target mapping | 164-row `source-target-map-v2.csv` | PASS |
| Additive app/engine boundary integration | Worker/API compatibility and active app source copies; vendor snapshots unchanged | Implemented; CI build/import verification pending |
| Dependency and secret checks | CI lockfile, audit, CodeQL and Gitleaks jobs | Pending final scoped-branch CI |
| No later-phase domain expansion | ADR-0005 scope boundary; later-domain changes excluded from this scoped branch | PASS |

**CI status at report authoring:** pending. Do not treat this report as final acceptance until the final scoped branch's CI run is green. If any CI job fails, record the failure, repair only Phase 02 scope, and rerun.

## 8. Explicit exclusions and deferred work

The following are intentionally not implemented or activated by this Phase 02 migration:
- Design-system and token redesign/normalization (Phase 03).
- Full identity and access product workflows (Phase 04).
- Full Agent Engine lifecycle and product-level task workflows beyond the bounded compatibility adapter (Phase 05).
- Full FastAPI product domain expansion (Phase 06).
- Full LLM model catalog/router/metering product (Phase 07).
- Tool execution activation and isolated browser/Python runtime (Phase 08).
- Full workspace/memory product integration (Phase 09).
- Credit, wallet, subscription and entitlement operations (Phase 10–11).
- Partner, network verification, campaign/reward, Super Admin operations and Captive Portal gateway activation (Phase 12–21).
- Production hardening and deployment (Phase 22).

These are not Phase 02 blockers under the current owner-approved scope boundary. They remain subject to their official phase order and acceptance criteria.

## 9. Gate decision

**SOURCE MIGRATION IMPLEMENTATION: COMPLETE.**  
**PHASE 02 ACCEPTANCE: PENDING final scoped-branch CI verification and review.**

The next official phase after acceptance is **Phase 03 — Design System & UI Foundations**. Do not begin it before the final Phase 02 CI and review gates pass.
