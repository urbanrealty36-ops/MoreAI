# Phase 00 — Source & Architecture Audit Report

**Project:** MoreAI  
**Audit date:** 2 November 2026  
**Status:** PASSED — audit artifacts complete; source migration NOT STARTED  
**Authority:** `docs/MoreAI_Master_PRD_v1.0_ID.md`, especially §§0, 3, 4, 20–22, 26, 28–31; repository `AGENTS.md`.

## 1. Executive result

The exact upstream refs were inspected and recursive Git trees were read with `truncated=false`. The destination repository `urbanrealty36-ops/MoreAI` contained only `README.md` before this audit. The two upstreams contain **164 tracked blobs** in total:

| Source | Branch | Commit SHA (branch head) | Tracked blobs | Tree bytes (sum of blob sizes) |
|---|---|---|---:|---:|
| `YunQiAI/OpenManusWeb` | `dev_web_app` | `3ceaa9182b39bbb9898ddda0a4b1c50c2758ab5f` | 111 | 1,201,688 |
| `urbanrealty36-ops/Front-End-UI-MoreAI` | `main` | `89bccc184dc8f2e6dac20627d5c7d50ef3e4a8f4` | 53 | 8,708,522 |
| **Total** | | | **164** | **9,910,210** |

The recursive trees reported 131 entries (111 blobs + 20 directories) for OpenManusWeb and 70 entries (53 blobs + 17 directories) for the UI repo. No tree truncation was reported.

The full per-file path, blob SHA, byte size, file kind and proposed target mapping are recorded in `source-inventory-v1.csv`. This is an inventory/mapping artifact, **not evidence that the files have already been copied**.

## 2. Baseline repository inspection

Destination: `urbanrealty36-ops/MoreAI`, default branch `main`. At the start of this audit its tree consisted only of `README.md`. No pre-existing source tree, migrations, tests, app configuration, CI workflows or `AGENTS.md` existed there before the docs commits from this project. The audit did not alter Supabase, deploy any service, or copy application source.

Current documentation commits added the PRD, phase plan and engineering rules; the inventory and audit report are documentation-only additions. No app source was migrated in Phase 00.

## 3. Upstream snapshots and coverage

### 3.1 OpenManusWeb

- URL: https://github.com/YunQiAI/OpenManusWeb
- Branch: `dev_web_app`
- Commit: `3ceaa9182b39bbb9898ddda0a4b1c50c2758ab5f`
- Recursive inventory: 111 blobs, 20 directory entries, not truncated.
- File-type counts: 50 Python, 20 JavaScript, 14 HTML, 9 Markdown, 5 YAML, 2 CSS, 2 TXT, 1 TOML, 1 INI, 1 JPG, 3 PNG, 1 .gitattributes, 1 .gitignore, 1 extensionless file.
- Main source areas: `app/agent`, `app/flow`, `app/tool`, `app/prompt`, `app/web`, `app/utils`, `config`, `assets`, `examples`, `tools`, `.github/workflows`, root scripts and package metadata.
- The source includes agent base/planning/ReAct/SWE/tool-call classes, LLM wrappers, flow planner/factory, tool implementations, FastAPI app, WebSocket, session tracking, log parsing, thinking tracker, templates and static UI.
- Upstream `LICENSE` is MIT and contains `Copyright (c) 2025 manna_and_poem`. Preserve exact license and attribution in the vendor snapshot and root third-party notices.

### 3.2 Front-End-UI-MoreAI

- URL: https://github.com/urbanrealty36-ops/Front-End-UI-MoreAI
- Branch: `main`
- Commit: `89bccc184dc8f2e6dac20627d5c7d50ef3e4a8f4`
- Recursive inventory: 53 blobs, 17 directory entries, not truncated.
- File-type counts: 31 TSX, 7 TS, 4 JSON, 4 PNG, 2 MJS, 1 CSS, 1 SVG, 1 Markdown, 1 .env.example, 1 .gitignore.
- Framework/dependencies from `package.json`: Next.js 15.4.9, React/React DOM 19.2.1, Tailwind CSS 4.1.11, TypeScript 5.9.3, lucide-react, motion, class-variance-authority, clsx, tailwind-merge, PostCSS, ESLint, Google GenAI SDK and supporting packages.
- UI areas include customer screens, account/chat/agents/tools/wallet/subscriptions/partner access/memory/history/notifications/settings, files modal, onboarding/login/register/access choice, captive portal, Super Admin, Partner Portal, network access experience, mascot/character, PWA install banner, hooks and app shell.
- The four PNG files are in `public/assets/aistudio/`; one is a PRD markdown asset and three are image references (the inventory includes all four PNG/asset entries as Git blobs by exact path; the PRD itself is Markdown). No `.glb` or `.gltf` files were found in this upstream tree. Therefore 3D/GLB assets are **not present in this source snapshot** and must be sourced from an explicitly approved project asset source if the Master PRD requires them; do not fabricate or silently omit them.
- No React Native / Expo app is present in the 53 tracked files. Native application implementation is a separate client workstream and must achieve visual/interaction parity without replacing the Web PWA.

## 4. UI/UX preservation baseline

The source stylesheet `app/globals.css` establishes Tailwind CSS 4 import, dark variant, Plus Jakarta Sans and JetBrains Mono font variables, warm canvas `#F7F4EC`, ink `#171717`, neo borders, offset hard shadows, neo-card/neo-btn and mobile safe-area utilities. Individual screens also use explicit pastel colors, borders, radii, spacing and motion classes.

The source app shell `app/page.tsx` includes multiple surface switchers and mounts the customer experience, Captive Portal, onboarding, login/register, post-auth access choice, Super Admin, Partner Portal and network-flow experience. Preserve the actual component source and styles; do not use screenshots as substitutes.

The audit did not execute a browser screenshot run, so visual pixel-baseline status remains **not yet measured**. It is a required Phase 02/03 acceptance activity before/after integration.

## 5. Architecture and security findings

### 5.1 UI source — demo state must not become production data

Inspection identified demonstrative client state and flows, including:
- `app/page.tsx`: hard-coded sample user name, credit balance, partner-active state and partner venue; local credit deduction/top-up handlers.
- `app/api/gemini/generate/route.ts`: direct provider invocation through `@google/genai`; if key is absent it returns a fabricated success-style response. This must not be wired as a production integration.
- `components/partner/PartnerPortalView.tsx`: prefilled example partner details and campaign rows/statistics in component state.
- `components/screens/CaptivePortalScreen.tsx`: sample venues/network metadata, local state and chained timeouts that produce a success callback without real gateway proof.
- `components/admin/SuperAdminView.tsx`: example admin identity, default configuration state and a local save notice.
- `components/network-flow/NetworkAccessExperience.tsx`: explicitly labelled 9-step simulation.

These components are valuable UI source and must be preserved. Phase 02+ should replace only their demo data/action adapters with FastAPI-backed real state while keeping the UI layout/style and explicit simulation-only labeling. Do not present their demo metrics, balances, sessions, claims or success as live production data.

### 5.2 OpenManusWeb — backend integration/security gaps

Inspected upstream source shows:
- `app/web/app.py` stores active sessions and cancellation events in process-local dictionaries; task state is not durable across restart or multi-worker deployment.
- The inspected chat/session/stop routes have no visible JWT/tenant authorization layer; WebSocket accepts the connection before checking session existence and has no visible authenticated ownership binding in the inspected handler.
- Workspaces and logs are written to local filesystem paths. This is not a multi-tenant Supabase-backed workspace or durable job store.
- `app/tool/bash.py` launches a shell subprocess with `create_subprocess_shell`; it is privileged arbitrary command execution if exposed without a hardened sandbox.
- `app/tool/python_execute.py` calls Python `exec()` in a thread. Restricting the globals dictionary is not an isolation boundary.
- Browser tool includes browser navigation and JavaScript execution operations. It must run in a dedicated isolated browser worker with strict egress/SSRF and session controls.
- The web app starts Uvicorn and can auto-open a local browser; local development behavior must not be inherited into production container defaults.
- API endpoint catalogue in upstream README includes chat create/read/stop, WebSocket session stream, files, logs, parsed logs, latest log, system logs, thinking and progress endpoints. These are source capabilities, not yet MoreAI-secured API contracts.

These are not reasons to discard source code. Keep original source in vendor snapshot and wrap/adapt it behind MoreAI authorization, durable task model, API contracts and isolated runtime. Do not expose these upstream endpoints directly to public clients.

## 6. Configuration, secrets and supply chain

### UI
- `.env.example` contains `GEMINI_API_KEY` and `APP_URL` placeholders, not actual secret values.
- `package.json` includes `@google/genai` and a Gemini API route; production model calls must go through the server-side MoreAI LLM Gateway/Model Router.
- `next.config.ts` sets standalone output, permits `picsum.photos` remote images and can disable HMR through an environment variable. Remote placeholder image usage must be reviewed before production; it is not a production asset source.
- No npm/pnpm lockfile is present in the tracked UI tree. Exact transitive dependency versions are therefore not frozen by this repository snapshot.

### OpenManusWeb
- `config/config.example.toml` contains placeholder API key text such as `sk-...`; this is an example, not a credential. Keep example placeholders only; never copy actual secret files.
- `requirements.txt` contains a mixture of pinned/compatible and unpinned dependencies (for example `numpy` and several minimum-version requirements); no `uv.lock`, `poetry.lock` or `requirements lock` file appears in the tracked tree.
- `.github/workflows/build-package.yaml` publishes to PyPI using `secrets.PYPI_API_TOKEN`; it is upstream release automation, not automatically appropriate for MoreAI CI. Preserve it in the source snapshot; create a separate reviewed MoreAI workflow rather than enabling a publish action by accident.
- GitHub Actions in the upstream tree use version tags (for example checkout/setup-python tags), not immutable commit SHA pinning. Review and pin actions in the MoreAI workflow before enabling.
- The inspected tracked tree did not contain a file named `.env`, a browser profile or obvious private credential file. This is a path/name inspection plus selected configuration review, not a full secret scanner result.

### Licensing
- OpenManusWeb MIT license verified. Preserve the exact `LICENSE` and copyright notice.
- UI repo has no root LICENSE file in the inspected tracked tree. Its licensing status is **unverified**; obtain explicit permission/license confirmation before redistribution/derivative copying into the destination repository. Do not assume that repository visibility grants a license.
- Dependencies, fonts, icons, imagery, mascots, logos, models and any future GLB assets require separate license/provenance review. No complete dependency-license scan is claimed because lockfiles are absent.

## 7. Master PRD alignment and corrections

The Master PRD §4.2 target tree includes `apps/api`, `apps/worker`, and a single `apps/sandbox` root, with `engine/agents`, `engine/orchestration`, `engine/tools`, `engine/llm`, `engine/memory`, `engine/credits`, `engine/entitlements`, `engine/subscriptions`, and `engine/network_partnership`. The previously published Phase Plan and AGENTS root had introduced `apps/browser-worker` and `apps/python-sandbox` and omitted the Master PRD's `apps/sandbox` naming. This audit treats the Master PRD as authoritative and corrects those documentation rules: browser and Python isolation must be sub-services/images under `apps/sandbox` unless a later approved ADR changes the tree.

The PRD's exact target tree also places `vendor/openmanusweb` as source snapshot and does not list `vendor/reference-ui` in the original §4.2. The later AGENTS rule requires `vendor/reference-ui` to preserve UI source provenance. This is an additive documentation extension that does not replace any PRD directory. The target should contain both snapshots.

The UI repository has no Expo app; the Master PRD's `apps/mobile` must be implemented as a distinct Native React Native + Expo client, with parity based on source UI behavior and tokens.

## 8. Source migration plan and target mapping

All 164 tracked files are recorded in the CSV manifest. The migration will use two layers:

1. **Immutable provenance snapshots:** exact source files under `vendor/openmanusweb/` and `vendor/reference-ui/`, preserving source paths and license notices. Exclude only verified secrets/private runtime artifacts, with each exclusion documented.
2. **Active integration:** source files copied to target app/engine paths as needed, with adapters around them. Never mutate the vendor snapshot to integrate it.

### OpenManusWeb mapping
- `app/agent/**` → `engine/agents/**`; preserve source substructure in vendor.
- `app/flow/**` → `engine/orchestration/**`.
- `app/tool/**` → `engine/tools/**`, with browser/Python implementations invoked only by isolated sandbox workers.
- `app/llm.py`, `app/agent/llm_wrapper.py`, `app/config.py` → `engine/llm/**` and API config adapters; direct provider config must be replaced at the integration boundary by MoreAI gateway policy, not in vendor snapshot.
- `app/prompt/**` → `engine/agents/prompts/**`.
- `app/web/**` → source compatibility layer in `apps/api`; extract endpoint contracts and migrate them into versioned FastAPI routers with auth/tenant policy, durable state and API event streaming. Keep old static UI as vendor source only, not the active customer UI.
- `app/schema.py`, `app/logger.py`, `app/exceptions.py`, `app/utils/**` → shared backend modules under `apps/api` / engine adapters according to dependency analysis.
- root scripts, docs, tests, config, workflows, examples, assets and LICENSE → `vendor/openmanusweb/**` plus selected reviewed MoreAI docs/tooling. Do not enable upstream publishing workflow without approval.

### UI mapping
- `app/**`, `components/client/**`, `components/screens/**`, `components/manus/**`, `components/network-flow/**`, `components/shared/**`, `hooks/**`, `lib/**`, styles and public assets → `apps/web/**` preserving relative source organization where possible.
- `components/admin/**` → `apps/admin/**` with source component preserved.
- `components/partner/**` → `apps/partner-portal/**`.
- `components/screens/CaptivePortalScreen.tsx` → `apps/captive-portal/**`.
- Root Next.js configs/dependencies → `apps/web/**` or workspace configuration after dependency conflict review.
- UI source API route is preserved in vendor but its production behavior is replaced by a FastAPI API client adapter; no direct Gemini provider calls and no fabricated success fallback.
- The PWA manifest/install hook and CSS remain source baseline; preserve exact visual classes/tokens.

### Native
- No source file mapping exists for a native app in the upstream UI repository. Create `apps/mobile` as a separate Expo app in a later phase; derive component behavior and design parity from the preserved Web UI and Master PRD, not from a redesign.

## 9. Acceptance criteria before source copy/integration

### Audit gate (Phase 00)
- [x] Master PRD and current AGENTS reviewed.
- [x] Destination repo and initial tree inspected.
- [x] Both upstream branch heads and recursive trees inspected.
- [x] Tree responses are not truncated.
- [x] Per-file manifest generated with path, blob SHA, byte size, type and proposed target.
- [x] Key UI, API, tool runtime, configuration, dependency, workflow and license files sampled and reviewed.
- [x] Security/data-demo risks and license gaps documented.
- [x] Source migration plan and target mapping documented.
- [x] Acceptance criteria for Phase 02/03 source migration defined.
- [ ] Full source blobs downloaded into a reproducible local audit workspace and content-hash compared (deferred to Phase 02 source migration; Git tree/blob SHA manifest is the current immutable reference).
- [ ] UI browser screenshot baseline and viewport regression run (deferred to Phase 03 visual baseline).

### Phase 02 source migration gate
- [ ] Full mirror/snapshot copied to `vendor/openmanusweb/` and `vendor/reference-ui/`.
- [ ] Exact 111 + 53 tracked files accounted for; each missing/excluded path has approved reason.
- [ ] Compare source path/blob hashes or equivalent content hashes against pinned commits.
- [ ] MIT LICENSE/copyright and UI license permission resolved; root `THIRD_PARTY_NOTICES.md` created.
- [ ] No secrets/private credentials/runtime PII copied; secret scan evidence attached.
- [ ] Dependency locks and license report produced; unresolved licenses are blockers for redistribution.
- [ ] Active mapping document links each source path to integration target or explicitly snapshot-only.
- [ ] Source import/build/test baseline recorded; incompatible dependencies isolated, not silently removed.
- [ ] No app UI redesign or replacement components.
- [ ] Demo balances/posts/sessions/campaign metrics/fake success are not exposed as production data.

### Phase 03 design/UI gate
- [ ] Source screenshots captured at 360, 390, 768, 1024 and 1440 px.
- [ ] Visual comparison shows no unapproved changes to layout, CSS, font, color, component, modal, button, card, container, icon, motion or responsive behavior.
- [ ] PWA install/manifest/offline fallback retained.
- [ ] Assets/fonts/icons provenance and license reviewed.
- [ ] 3D/GLB requirement resolved from an authorized asset source; current UI upstream contains no GLB/GLTF.

## 10. Known blockers / decisions

1. UI repository has no root license file. Permission/license must be confirmed before copying into a public MoreAI repository.
2. OpenManusWeb includes unrestricted Bash/Python execution patterns and unauthenticated in-memory web session handling; these must remain isolated and wrapped.
3. UI includes demo data and simulated Captive Portal success; replace data/actions, not visual components.
4. No UI Expo source; Native app is a distinct implementation stream.
5. No GLB/GLTF files in inspected UI tree; obtain approved asset repository/storage references if 3D source assets are expected.
6. No lockfiles in either upstream; dependency reproducibility/license audit is pending.
7. Screenshot baseline was not captured in this audit; required before active UI migration.
8. Open decisions in Master PRD §26 remain open and must not be silently hard-coded.

## 11. Phase 00 exit decision

**Phase 00: PASSED.** The Phase 00 deliverables are complete: upstream refs/tree audit, full tracked-file inventory, per-file mapping, configuration/dependency/license/security findings, migration plan and downstream acceptance gates. Source migration is intentionally not part of Phase 00.

Completed: branch/tree audit, 164-file manifest, source mapping, key architecture/security/config/license review, migration plan, and acceptance criteria.

Deferred to their correct downstream gates: full blob snapshot/hash verification and redistribution permission check during Phase 02; visual screenshot baseline during Phase 03. Source copy/integration intentionally has not started.

**Next phase:** Phase 01 — Monorepo Foundation. Phase 02 source migration may not redistribute the UI repository until its license/permission is confirmed. Resolve that permission in parallel with Phase 01; Phase 01 can proceed without copying UI assets.
