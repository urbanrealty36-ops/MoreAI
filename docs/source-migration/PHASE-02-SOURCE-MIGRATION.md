# Phase 02 — Source Migration

**Status:** IN PROGRESS  
**Baseline:** Phase 01 commit `881688f5db9e5c6c41275d21424de3e141fdb898` (CI green)  
**Migration branch:** `phase-02-source-migration`

## Pinned upstream sources

| Source | Ref | Commit | Tree | Tracked files | Bytes |
|---|---|---|---|---:|---:|
| OpenManusWeb | `dev_web_app` | `3ceaa9182b39bbb9898ddda0a4b1c50c2758ab5f` | `41258ca11d4299beab17e4172fbcf8303eac1a6b` | 111 | 1,201,688 |
| Front-End-UI-MoreAI | `main` | `89bccc184dc8f2e6dac20627d5c7d50ef3e4a8f4` | `30922c1ab21de3b60947cae5448e0a58222466be` | 53 | 8,708,522 |

Both upstream recursive trees were verified with `truncated=false`. Exact source pins are represented as Git submodules under `vendor/openmanusweb` and `vendor/reference-ui`, avoiding a lossy reimplementation and preserving upstream commit identity. The submodule gitlinks are immutable at the reviewed commits; branch names in .gitmodules are informational update targets only.

## Integrity and provenance

- OpenManusWeb source remains under its MIT license and retains the original LICENSE and copyright notice.
- UI source is owned by the MoreAI project owner, who confirmed ownership and authorized use in this project conversation. No root LICENSE exists upstream; do not infer an OSI license from this authorization.
- Keep source changes additive in MoreAI integration layers. Do not modify upstream source or upstream history.
- UI CSS, typography, colors, spacing, assets, animation, navigation, PWA behavior, and responsive layout must remain unchanged unless an approved ADR explicitly allows a visual change.
- Demo data and direct browser-side provider calls are not production integrations. Replace only active integration seams through FastAPI adapters; retain the upstream snapshot unchanged.
- Audit every dependency and asset license independently. No 3D/GLB/GLTF files were found in the UI source inventory.

## Known integration seams requiring follow-up

- UI `app/api/gemini/generate/route.ts` directly invokes Gemini and has a fabricated fallback; replace active production flow with the server-side FastAPI LLM Gateway.
- UI `app/page.tsx` owns demo user, balance, partner state, and local credit mutations.
- `components/partner/PartnerPortalView.tsx` contains prefilled sample partner details/campaigns/statistics.
- `components/screens/CaptivePortalScreen.tsx` contains sample networks/venues and timeout-based simulated success.
- `components/admin/SuperAdminView.tsx` contains hard-coded identity/configuration state and local save feedback.
- `components/network-flow/NetworkAccessExperience.tsx` is a nine-step simulation, not a real network verification backend.
- OpenManus session state, WebSocket ownership, filesystem workspace, shell, Python execution and browser tooling require security isolation and authenticated ownership checks before exposure.

## Current completion boundary

This commit establishes pinned source references, provenance, and the integration risk register. It does **not** claim the application source has been copied into active app directories, that demo seams are wired, or that the Phase 02 acceptance gate has passed. Those are remaining Phase 02 work items.
