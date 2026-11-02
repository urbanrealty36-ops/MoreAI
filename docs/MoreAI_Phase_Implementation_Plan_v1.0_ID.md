# MOREAI — PHASE IMPLEMENTATION PLAN

**Versi:** 1.0  
**Tanggal:** 2 November 2026  
**Status:** Baseline eksekusi turunan Master PRD v1.0  
**Master specification:** [docs/MoreAI_Master_PRD_v1.0_ID.md](./MoreAI_Master_PRD_v1.0_ID.md)

## 1. Tujuan dan otoritas

Dokumen ini memecah roadmap Bab 22 Master PRD menjadi paket implementasi yang dapat dikerjakan dan diverifikasi. Master PRD tetap menjadi sumber kebenaran untuk visi, arsitektur, struktur folder, domain, keamanan, UI/UX, dan acceptance. Jika terjadi konflik, Master PRD menang; keputusan baru harus dicatat sebagai ADR.

Setiap phase mengintegrasikan secara paralel workstream Web PWA, Native React Native + Expo, Super Admin, Partner Portal, Captive Portal, FastAPI/API, engine/worker, Supabase, QA dan dokumentasi. Paralel dilakukan setelah dependency dan kontrak disepakati; bukan memaksakan fitur selesai sebelum fondasi backend tersedia.

## 2. Aturan migrasi source dan UI

### 2.1 Backend OpenManusWeb
Upstream: https://github.com/YunQiAI/OpenManusWeb.git, baseline branch audit: `dev_web_app`. Inventarisasi dan migrasikan seluruh source relevan: agent hierarchy, planning, flow, orchestration, tool calling, LLM wrapper, config, prompt, schema, web/API, WebSocket, session, progress/logging, static assets, tests, scripts, docs, workflows, dan dependency metadata. Pertahankan mirror/snapshot di `vendor/openmanusweb/`, upstream commit/tree SHA, manifest path/blob SHA/size, LICENSE, attribution, dan mapping ke target. Adaptasi MoreAI dilakukan secara additive di integration layer, bukan menghapus atau menimpa source asli.

### 2.2 UI MoreAI
Upstream: https://github.com/urbanrealty36-ops/Front-End-UI-MoreAI.git, branch `main`. Salin seluruh halaman, layout, komponen, hooks, CSS, framework/config, assets publik, icon, font, ilustrasi, PWA files, Super Admin, Partner Portal, Captive Portal, seluruh screen/domain, serta 3D/GLB/spatial assets jika tersedia. Pertahankan snapshot immutable di `vendor/reference-ui/` dan integrasikan source asli ke aplikasi aktif.

### 2.3 Larangan perubahan visual
Dilarang redesign, re-theme, mengganti CSS framework, mengubah layout/hierarchy, warna, font, spacing, radius, shadow, button/card/modal/container, navigation, icon, animation, responsive behavior, PWA shell atau menghapus screen/domain. Dilarang mengganti komponen sumber dengan tiruan yang hanya mirip. Wiring data/API, state, security, bugfix dan error handling diperbolehkan sepanjang output visual dan interaction contract tetap sama. Perubahan visual memerlukan persetujuan tertulis dan ADR.

### 2.4 Native parity
Web tetap Next.js PWA. Android/iOS tetap React Native + Expo. React DOM tidak dipaksakan berjalan di native. Porting native mengikuti pixel/behavior parity: aset, typography, palette, hierarchy, semantics, navigation, states, interactions. Jangan mengarang desain baru; catat perbedaan platform yang tak terhindarkan.

### 2.5 Data demo
Saldo, postingan, transaksi, riwayat, metrik, tool success atau sesi demo upstream tidak boleh menjadi data produksi. Data bisnis berasal dari Supabase melalui API. Fixture hanya untuk test terisolasi, tidak boleh tampil sebagai live/production data.

## 3. Struktur target

Ikuti Bab 4.2 Master PRD. Domain inti:
```text
apps/{web,mobile,admin,partner-portal,captive-portal,api,worker,sandbox}/
engine/{agents,orchestration,tools,memory,llm,credits,entitlements,subscriptions,network_partnership}/
packages/{ui-web,ui-native,design-tokens,icons,api-client,types,validation,localization}/
supabase/{migrations,functions,tests}/
vendor/{openmanusweb,reference-ui}/
docs/{architecture,adr,api,runbooks,source-migration}/
```
Penempatan persis mengikuti tree lengkap PRD; jangan membuat struktur alternatif tanpa ADR.

## 4. Aturan integrasi lintas-layer

1. Semua client mengakses business data/operations melalui FastAPI versioned endpoints.
2. Pengecualian terbatas: Supabase Auth SDK untuk alur autentikasi yang disetujui PRD; setelah mendapat JWT/session, aplikasi menggunakan FastAPI.
3. Tidak ada query Supabase langsung dari client ke business tables (wallet, ledger, agent runs, files metadata, partner, campaign, network, entitlement, payment, admin).
4. Realtime tidak boleh menjadi jalur bypass API. Kanal/event harus memiliki authorization backend dan contract.
5. FastAPI memvalidasi JWT, role/permission, tenant membership, ownership, schema, rate limit, idempotency dan policy sebelum akses database.
6. Supabase Postgres adalah canonical data store; RLS defense-in-depth. Storage memakai signed URL/policy setelah authorization.
7. Semua LLM dipanggil melalui server-side LLM Gateway + Model Router; tidak ada provider key di client.
8. Agent runs durable dengan state/checkpoint, event, cancellation, retry dan recovery.
9. Browser automation dan Python execution berjalan pada runtime terisolasi, bukan proses API.
10. Credit ledger immutable; reservation/settlement/refund atomik, idempotent dan auditable.
11. Network verification fail-closed; fallback tidak boleh diam-diam melemahkan bukti.

## 5. Workstream paralel wajib per phase

- **Web PWA:** source UI, routes/screens, responsive behavior, PWA, real API integration, UI states.
- **Native Expo:** parity screens, navigation, secure session, permissions, deep links bila relevan.
- **Super Admin:** domain controls, policy, audit, RBAC, operational views.
- **Partner Portal:** tenant/branch/network/campaign/member workflows.
- **Captive Portal:** multi-tenant guest access, branding/config, gateway handoff.
- **FastAPI:** schemas, versioned endpoints, authz, validation, idempotency, OpenAPI, events.
- **Engine/Worker:** domain logic, orchestration, task processing, retries/checkpoints.
- **Supabase:** migrations, constraints, indexes, RLS, storage policies, test-only fixtures.
- **QA/Security/Docs:** unit/integration/contract tests, evidence, threat review, runbooks, ADR.

Sebelum coding, sepakati API contract, DB contract, event schema, source/UI mapping, permission, ownership dan acceptance. Typed stubs hanya untuk compile/test; jangan menyajikannya sebagai live integration.

## 6. Phase-by-phase implementation

### Phase 00 — Source & Architecture Audit
Audit upstream refs/commits, source tree, every tracked blob, AGENTS, licenses, dependencies, secrets, UI screen inventory, assets/3D, API/runtime assumptions, Supabase schema/RLS dan deployment assumptions. Buat manifest path/blob SHA/size, mapping source→target, exclusion register, license notices, risk register dan ADR index. **Gate:** kedua repo referensi tree telah diperiksa; seluruh blobs terhitung; pengecualian sensitif beralasan; baseline commit/tree tersimpan. Pada audit 2 Nov 2026, tidak ditemukan `AGENTS.md` pada tree kedua repo referensi.

### Phase 01 — Monorepo Foundation
Bentuk pnpm/Turborepo untuk TS apps/packages dan uv/Python workspace untuk backend; seluruh folder PRD, root scripts, lint/typecheck/format/test, CI, CODEOWNERS, secret/dependency scan, .env.example placeholder, package boundaries, API types, token pipeline, Docker/runtime configs. Pisahkan Web PWA dan Expo. Setup FastAPI health/readiness, OpenAPI baseline, structured logs/correlation IDs. **Gate:** clean checkout install/build/typecheck/tests, apps boot, CI green, no secrets.

### Phase 02 — Source Migration
Mirror OpenManusWeb dan snapshot UI lengkap ke vendor; pertahankan LICENSE/NOTICE/copyright. Integrasikan source backend secara additive ke engine/API; integrasikan UI ke apps web/admin/partner/captive menurut fungsi. Buat mapping/provenance dan compatibility adapters. Redirect direct Gemini/provider route ke FastAPI/LLM Gateway; jangan menimpa source snapshot. **Gate:** manifest/hash comparison, license audit, source coverage 100% atau exception disetujui, build/import tests, tidak ada demo business data.

### Phase 03 — Design System & UI Foundations
Tokens mengikuti Master PRD dan detail aktual source UI; source UI menang untuk visual spesifik. CSS variables dan RN theme diturunkan dari shared tokens tanpa mengubah nilai visual. Pertahankan fonts/icons/assets asli. Responsive checks 360/390/768/1024/1440. **Gate:** screenshot comparison, no unapproved visual drift, accessibility/reduced-motion, native parity baseline.

### Phase 04 — Identity & Access
Supabase Auth signup/login/refresh/recovery; profile provisioning hanya untuk Auth identity valid dan idempotent. Role/permission server-controlled, bukan user_metadata. FastAPI JWT verification, RBAC, tenant isolation, audit. RLS defense-in-depth. **Gate:** ownership/tenant tests, JWT negative tests, RLS tests, duplicate provisioning, role escalation blocked.

### Phase 05 — AI Agent Engine
Migrasikan agent registry/base/state, planner, executor, step loop, tool-call contracts, prompt system dan evaluation hooks. Run lifecycle, cancel/retry/checkpoint/resume, concurrency/timeout/token budgets. FastAPI endpoints create/status/stop/events; worker durable. **Gate:** state transition, idempotent run creation, cancellation, recovery, ownership; no fabricated completion.

### Phase 06 — FastAPI Core
Versioned `/api/v1`; centralized auth/tenant/permission/validation/idempotency/pagination/error envelope. OpenAPI, typed API client, authenticated WebSocket/SSE. Domains identity, workspace, conversations, agent runs, files, wallet, subscription, partner/network, admin. Hilangkan direct provider calls dan business-table client queries. **Gate:** contract tests, auth matrix, rate limit, CORS, correlation, integration tests.

### Phase 07 — LLM Gateway & Model Router
Provider adapters, model registry/capability, routing/fallback/retry/timeout/streaming/cost. Server-only secrets, per-user/tenant policies and budgets. Meter usage tied to runs and credit reservation; retries tidak double-charge. **Gate:** provider contracts, routing policy, metering reconciliation, secret scan, telemetry.

### Phase 08 — Tool Runtime
Tool registry/permissions/schema validation/audit. Browser worker isolated with egress/SSRF controls. Python sandbox isolated with resource/network/filesystem limits. File tools workspace-scoped and signed. **Gate:** sandbox escape, SSRF, resource quota, audit, cancellation/cleanup.

### Phase 09 — Workspace & Memory
Workspace/artifacts/file metadata/storage policies/versioning/retention; memory consent/CRUD/deletion/embeddings pgvector/retrieval filters/provenance. FastAPI file/memory endpoints; signed URLs only after authorization. **Gate:** cross-tenant retrieval blocked, deletion propagation, vector filters, URL expiry.

### Phase 10 — Credit & Wallet
Wallet accounts, immutable ledger, reservation, consumption, settlement, refund, adjustments, idempotency. Meter LLM/tool cost, atomic transaction and reconciliation. Client never writes balance. **Gate:** concurrent debit/overspend, retry idempotency, ledger immutability, reconciliation.

### Phase 11 — Entitlement & Subscription
Resolve General Free, Partner Free, paid access and subscriptions separately. Payment lifecycle/webhook signature/renewal/cancel/refund. Open business parameters stay configurable (quota, reset, stacking, provider, pricing). UI uses backend state only. **Gate:** precedence matrix, expiry, webhook replay, state machine, entitlement spoofing blocked.

### Phase 12 — Partner Core
Organizations, locations/branches, Wi-Fi networks, members, roles and gateway metadata. Partner Portal CRUD/onboarding; Admin governance. **Gate:** tenant isolation, membership revocation, duplicate validation, audit.

### Phase 13 — Geo-WiFi Verification
Unified Verification Engine normalizes network proof, consented geolocation, access code and evidence. Configurable policy, TTL, heartbeat, radius, anti-replay. Do not claim browser can read SSID universally; IP geolocation is not GPS. Fail closed if evidence insufficient. Session expiry/revocation and all UI states. **Gate:** forged/replay/out-of-radius/permission-denied/expiry/fallback/privacy tests.

### Phase 14 — Campaign & Reward
Campaign schedule, eligibility, budget, quota, reward claims/redemption, anti-abuse. Partner Portal authoring/statistics, Admin approval, user claim flow. Partner quota distinct from paid credits. **Gate:** atomic budget exhaustion, duplicate claim, eligibility/timezone/audit.

### Phase 15 — Super Admin Partnership
Partner approval/suspension, locations, network policies, verification methods, campaign governance, access/audit/support. Server-side permission matrix and approval controls. Reuse source Super Admin UI. **Gate:** RBAC matrix, privileged audit, cross-tenant denial, approval workflow.

### Phase 16 — Partner Portal
Registration, verification, branches, Wi-Fi networks, verification methods, QR/access codes, campaigns/rewards, analytics, staff roles. All via FastAPI, real tenant data. **Gate:** onboarding end-to-end, branch isolation, campaign publish/revoke, analytics definitions/audit.

### Phase 17 — Customer Web PWA
Onboarding/auth, workspace/chat, agents/tools, task monitor, files, memory, wallet/subscription, partner access, notifications/settings. Preserve source UI. PWA install/update/offline fallback/mobile-first. **Gate:** full screen inventory, every button wired, UI states, PWA, viewport/screenshot regression, no fake data.

### Phase 18 — Native Mobile
Expo Android/iOS customer parity, secure session, deep links, permission prompts, camera/file picker, push where approved. Same API contract as Web; no business Supabase access. **Gate:** Android/iOS builds, auth refresh, offline/reconnect, permission denial, session lifecycle and parity.

### Phase 19 — Shared Captive Portal
Multi-tenant portal, partner branding, access/verification, terms/privacy, session success/denied/expired. Gateway adapter interface, signed one-time handoff, callback validation, anti-replay. **Gate:** tenant separation, signature/handoff, replay/expiry/open redirect/fallback.

### Phase 20 — RADIUS & Gateway Adapters
Adapter interface for RADIUS auth/accounting, gateway/controller, heartbeat/disconnect. Vendor selection by explicit decision (MikroTik remains candidate until approved). Secret rotation, signed callbacks, idempotent accounting and health. **Gate:** adapter contract, duplicate accounting, disconnect, timeout, credential isolation.

### Phase 21 — Central ISP Integrations
Provider adapter framework and first approved ISP; venue-first model remains provider-independent. Contract mapping, consent, eligibility, quota/session reconciliation, outage behavior. **Gate:** provider contract, reconciliation, outage/fallback, security/legal review.

### Phase 22 — Production Hardening
Threat model, security/penetration, load/performance, DR/backup restore, observability/alerts/runbooks/incident response/cost controls. Release readiness across all apps, API, workers, sandbox and Supabase; feature flags, migration rollback, canary and support readiness. **Gate:** signed release checklist, critical risks closed/accepted, restore evidence, SLO baseline, no critical vulnerabilities, production smoke tests.

## 7. Universal Definition of Done

Phase hanya Passed bila: (1) scope/dependencies/decisions/source mapping terdokumentasi; (2) source relevan dimigrasikan dengan provenance/attribution; (3) API contract dan DB migrations versioned; (4) semua UI actions terhubung dan memiliki state; (5) frontend→FastAPI→Supabase flow diverifikasi, Auth exception terdokumentasi; (6) unit/integration/contract/RLS/security/regression tests lulus; (7) build/typecheck/lint lulus; (8) visual regression tanpa drift tak disetujui; (9) tidak ada demo/mock business data atau fake success; (10) bukti commit/PR/CI/test/screenshots/migration/deployment tersedia; (11) limitations dan rollback tercatat; (12) laporan menyebut phase berikutnya.

## 8. Status report wajib

Cantumkan status (Not started/In progress/Blocked/Passed), commit/PR, source coverage, files changed, endpoints, migrations/RLS, clients affected, test evidence, visual diff, security review, open decisions, limitations, rollback dan **Next phase**. Jangan mark Passed tanpa evidence.

## 9. Dependencies and sequencing

Urutan canonical: 00 → 01 → 02 → 03/04 (sebagian paralel) → 05/06/07/08/09/10/11 → 12/13/14/15/16 → 17/18/19 → 20/21 → 22. UI, Native parity, Admin dan Partner dapat berjalan paralel setelah API schema, roles dan data contract disepakati. Screen boleh diintegrasikan di balik feature flag lebih awal, tetapi tidak Passed sebelum backend/domain gates terpenuhi.

## 10. Open decisions

Bawa seluruh open decisions dari Master PRD Bab 26: General Free quota/reset; Partner quota/duration/stacking; konsumsi partner vs paid credits; subscription benefits; credit pricing/currency; payment provider/method; refund/expiry; geofence radius; heartbeat/proof TTL/grace; gateway/controller; RADIUS topology; ISP pertama; campaign stacking/budget exhaustion; native IAP; memory retention/consent/deletion/embedding; region/data residency/RPO/RTO; upstream baseline SHA/tag. Jangan mengarang nilai final; konfigurasi dan approval harus tercatat di ADR.
