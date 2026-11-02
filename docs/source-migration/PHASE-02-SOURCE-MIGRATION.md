# Phase 02 — Source Migration

**Status:** IN PROGRESS — acceptance gate belum terpenuhi  
**Branch:** `phase-02-source-migration`  
**Pull request:** [#2 — Phase 02 Source Migration](https://github.com/urbanrealty36-ops/MoreAI/pull/2)  
**Commit saat pembaruan:** `d95279bd3992027d13e60f10edaf9607a0ad2a62`

## Implementasi yang telah masuk

### Source migration dan provenance
- OpenManusWeb dan Front-End-UI-MoreAI telah dimaterialisasi ke `vendor/` sebagai snapshot file-level immutable.
- Manifest 164 file diverifikasi terhadap Git blob SHA dan ukuran byte; 164/164 cocok.
- OpenManus MIT LICENSE dan copyright notice dipertahankan.
- Kepemilikan/izin penggunaan UI source dicatat tanpa mengklaim lisensi OSS yang tidak tersedia.

### UI source integration
- Source halaman, layout, CSS, PWA manifest, komponen, hooks, utilitas dan aset UI referensi telah disalin ke `apps/web/src` dan `apps/web/public`.
- Web PWA menggunakan source UI asli sebagai preview non-produksi. Default route tidak menampilkan saldo, session, campaign, atau hasil agent contoh sebagai data live.
- Super Admin dan Partner Portal memuat komponen asli melalui preview yang ditutup secara default dan diberi label non-produksi.
- Captive Portal memiliki state default `NETWORK_GATEWAY_NOT_CONFIGURED`; source screen asli hanya tersedia pada preview non-produksi.
- CSS, font, layout dan source component tidak di-redesign.
- Native Expo belum memiliki source UI React Native pada upstream UI repository; parity Native tetap belum dikerjakan.

### FastAPI dan client
- `POST /api/v1/llm/generate` memvalidasi JWT Supabase JWKS dan memanggil Gemini dari sisi server.
- Web Chat mengarah ke FastAPI LLM Gateway, membutuhkan session Supabase dan API base URL; tidak ada lagi direct Gemini route di app aktif.
- Saldo tidak dikurangi dari UI sebelum server mengotorisasi penggunaan. Demo chat awal dan hasil workflow palsu dihapus dari komponen chat aktif.
- Typed API client tersedia untuk LLM request.
- Partner, Network Access dan Super Admin router skeleton telah ditambahkan. Endpoint mengembalikan 503 dengan stable error code sampai persistence/gateway/tenant authorization tersedia. Admin endpoint menolak role yang tidak berasal dari server-controlled `app_metadata`.

### Runtime security
- Sandbox policy fail-closed: arbitrary shell ditolak, Python dan browser dinonaktifkan sampai isolated runtime tersedia.
- OpenManus security mapping mendokumentasikan batas API, worker, WebSocket, filesystem, browser egress, dan Python isolation.
- **OpenManus agent/planning/flow runtime belum diintegrasikan sebagai durable worker.** Snapshot vendor tidak disamakan dengan runtime aktif.

## Database discovery

Supabase project MoreAI `uunfgimtokhucegqbpce` diperiksa melalui connector: schema `public` tidak memiliki tabel domain. Master PRD §12.2 menyebut table domains sebagai proposal, bukan schema yang telah ada. Tidak ada DDL diterapkan. Partner, network, credit, entitlement, agent-run, audit dan admin persistence harus melalui schema review, migration, RLS dan tests sebelum endpoint menjadi live.

## CI / verifikasi

- Source manifest: 164/164 cocok dengan upstream Git blob SHA dan ukuran byte.
- Source provenance CI telah lulus pada beberapa commit.
- Python lint dan test lulus pada commit `009fcc608728f6e8094c3e9b7be06dcebb8d93fa`; perubahan contract terbaru sedang diverifikasi pada run CI terkini.
- Web lint sebelumnya gagal karena path alias portal; konfigurasi alias telah ditambahkan di commit berikutnya. Hasil lint/typecheck/test/build setelah perubahan portal dan source UI masih menunggu CI terbaru.
- Security scan pada perubahan terbaru masih berjalan.
- Screenshot visual regression belum dijalankan; tidak ada baseline-vs-actual screenshot evidence.

## Acceptance yang masih terbuka

1. Implementasikan domain persistence yang direview untuk identity/workspace/conversation, agent runs/events, LLM usage/metering, partner/location/network, verification, network sessions, campaigns, entitlements, credit ledger, audit dan outbox.
2. Buat migration Supabase, RLS, FK/unique/check constraints, indexes, transactional/idempotent operations, dan test cross-tenant.
3. Implementasikan real Partner Portal APIs dan ganti seluruh preview/demo metrics, sample campaigns, sample branches dan fake save actions dengan server state; unavailable/error/empty states wajib dipakai sampai API siap.
4. Implementasikan captive gateway adapter dan signed evidence verification; hilangkan timeout-success simulation dari production path.
5. Implementasikan Super Admin RBAC/permission matrix dan audit-backed mutations; semua contoh config dan metrics harus diganti data server.
6. Implementasikan Supabase Auth flows pada Web/Admin/Partner/Captive dan secure session handling; hanya Auth SDK boleh berkomunikasi langsung dengan Supabase.
7. Implementasikan durable OpenManus runtime mapping: agent/planner/flow/tool adapters, worker lease, checkpoint, retry/cancel/resume, outbox events, ownership-bound WebSocket/SSE, and recovery.
8. Implementasikan Python sandbox dan browser worker isolation; arbitrary shell tetap disabled.
9. Lengkapi dependency/license/asset/font/icon audit serta supply-chain scan.
10. Jalankan clean install, lint, typecheck, tests, build per app, OpenAPI contract tests, authz/tenant negative tests, dan screenshot visual regression pada 360/390/768/1024/1440 px.

**Phase 02 tidak PASSED dan Phase 03 tidak dimulai sampai seluruh acceptance di atas terpenuhi.**
