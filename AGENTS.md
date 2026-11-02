# AGENTS.md — MoreAI Engineering Constitution

Dokumen ini wajib dibaca sebelum setiap perubahan code, konfigurasi, migration, workflow, asset atau deployment. Berlaku untuk seluruh repository `urbanrealty36-ops/MoreAI` dan semua subfolder. Instruksi subfolder boleh menambah aturan, tetapi tidak boleh melemahkan aturan root.

## 1. Sumber kebenaran
1. `docs/MoreAI_Master_PRD_v1.0_ID.md` — visi, arsitektur, struktur folder, domain, security, UI/UX, acceptance.
2. `docs/MoreAI_Phase_Implementation_Plan_v1.0_ID.md` — urutan phase, workstream paralel, gate, DoD.
3. `AGENTS.md` ini — aturan operasional engineering.
4. ADR disetujui di `docs/adr/` — keputusan detail.
5. Source snapshots di `vendor/` dan source manifest — kebenaran source asli.

Jika ada konflik, jangan menebak. Hentikan bagian yang konflik, buat ADR/permintaan keputusan, dan jangan melanggar Master PRD.

## 2. Wajib sebelum mulai
- Baca Master PRD, Phase Plan, AGENTS.md dan ADR terkait.
- Periksa folder aktual, git status, branch, commit, CI, tests dan file yang akan disentuh.
- Periksa source snapshots, migration manifest, upstream SHA, lisensi dan mapping sebelum mengubah hasil migrasi.
- Periksa schema/migrations/RLS Supabase sebelum menyentuh database.
- Jangan menganggap endpoint, tabel, secrets, deployment atau integrasi tersedia sebelum diverifikasi.

## 3. Struktur folder wajib
Ikuti Bab 4.2 Master PRD: `apps/{web,mobile,admin,partner-portal,captive-portal,api,worker,browser-worker,python-sandbox}/`; `engine/{agents,orchestration,tools,memory,llm,credits,entitlements,subscriptions,network_partnership}/`; `packages/{ui-web,ui-native,design-tokens,icons,api-client,types,validation,localization}/`; `supabase/{migrations,functions,tests}/`; `vendor/{openmanusweb,reference-ui}/`; `docs/{architecture,adr,api,runbooks,source-migration}/`. Jangan membuat struktur alternatif atau database baru tanpa ADR disetujui.

## 4. Source migration — copy first, adapt around it

### 4.1 OpenManusWeb backend
Upstream: https://github.com/YunQiAI/OpenManusWeb.git, audited branch `dev_web_app`. Migrasikan seluruh source relevan: agent, planning, flow, orchestration, tools, LLM, prompts, schemas, config, web/API, WebSocket, session, progress/logging, tests, scripts, docs, assets, workflows dan dependency files. Pertahankan snapshot asli di `vendor/openmanusweb/`. Jangan mengganti engine sumber dengan implementasi tiruan. Buat integration adapters MoreAI secara additive dan dokumentasikan mapping.

### 4.2 MoreAI UI reference
Upstream: https://github.com/urbanrealty36-ops/Front-End-UI-MoreAI.git, branch `main`. Salin seluruh halaman, layout, components, hooks, CSS/framework/config, PWA, icons, fonts, assets, 3D/GLB/spatial assets jika ada, Admin, Partner, Captive dan semua screen/domain. Pertahankan snapshot asli di `vendor/reference-ui/`; integrasikan file sumber ke app target tanpa mengganti source component dengan tiruan.

### 4.3 Provenance and completeness
Simpan upstream URL, branch/tag, commit SHA, tree SHA, manifest seluruh tracked files (path, blob SHA, size, type), tanggal migrasi, target mapping, excluded files + reason, license/NOTICE. Bandingkan manifest sebelum/sesudah. Jangan klaim 100% sebelum coverage dibuktikan. Pertahankan MIT LICENSE/copyright OpenManusWeb dan seluruh attribution. Audit lisensi aset, font, model, icon dan dependencies secara terpisah.

### 4.4 Exclusions
Jangan menyalin secret, API key, .env privat, credentials, browser profile, personal data, runtime logs berisi data pengguna, cache/build output yang tidak dibutuhkan atau file berbahaya. `.env.example` hanya nama variabel dan placeholder. Catat setiap pengecualian; jangan hilangkan diam-diam.

## 5. UI/UX — larangan redesign
- Source UI referensi adalah baseline visual otoritatif.
- DILARANG redesign/re-theme, mengganti CSS framework, mengubah layout/hierarchy, warna, font, typography, spacing, radius, border, shadow, button, card, modal, container, navigation, icon, animation, responsive breakpoints, PWA shell atau screen inventory tanpa persetujuan tertulis dan ADR.
- DILARANG mengganti source component dengan komponen baru yang hanya mirip.
- DILARANG menghapus fitur/domain lama atau baru, 3D Universe, GLB, spatial assets, atau mengubah tampilan demi menyesuaikan halaman lama.
- Wiring data/API, state, security, bugfix dan error handling diperbolehkan jika visual output dan interaction contract tetap sama. Perubahan visual wajib minta persetujuan.
- Gunakan screenshot baseline dan visual regression pada viewport 360, 390, 768, 1024, 1440 px; jelaskan setiap perbedaan.
- Web tetap Next.js PWA. Native tetap React Native + Expo. Native parity mengikuti desain referensi; jangan memaksakan DOM component ke native atau menciptakan gaya baru.

## 6. Frontend/backend boundary
- Semua business data dan operasi dari Web, Native, Admin, Partner dan Captive harus melewati FastAPI versioned endpoints sebelum Supabase.
- Pengecualian terbatas: Supabase Auth client SDK untuk alur Auth yang ditetapkan PRD. Setelah session/JWT diperoleh, request aplikasi menuju FastAPI.
- Dilarang query Supabase langsung dari client ke business tables: wallet, ledger, agent runs, file metadata, partner, campaign, entitlement, payment, network dan admin.
- Dilarang bypass FastAPI melalui Realtime. Event stream wajib memiliki authorization backend dan contract terdokumentasi.
- Gunakan typed API client dari `packages/api-client`; hindari endpoint URL/response shape ad hoc di banyak komponen.
- UI tidak boleh menjadi otoritas business rules, pricing/credit, entitlement, role, network verification atau metering.
- Jangan menaruh service-role key, secret, LLM key, payment secret atau gateway credential di client bundle.

## 7. FastAPI, engine, worker dan LLM
- FastAPI adalah trust boundary: verifikasi JWT, role/permission, tenant membership, ownership, schema, rate limit, idempotency, policy dan audit sebelum akses data.
- API versioned, OpenAPI typed, consistent error envelope, correlation ID dan structured logging.
- Agent execution durable: persisted state, checkpoints, retry/cancel/resume, timeout, concurrency limits, event trace dan recovery.
- Worker, browser automation dan Python sandbox berjalan terpisah dari API. Dilarang menjalankan arbitrary shell/Python pada API server.
- Semua model invocation melalui server-side LLM Gateway + Model Router. Tidak ada direct provider call dari browser/mobile. Token/cost usage dicatat dan dikaitkan ke run/tenant/user.
- Tool permissions least privilege; browser egress/SSRF controls; sandbox resource/network/filesystem limits.
- Jangan menyatakan task sukses sebelum tool/output benar-benar diverifikasi.

## 8. Supabase dan data integrity
- Supabase project MoreAI adalah canonical Postgres/Auth/Storage/Realtime/pgvector. Dilarang membuat database kedua atau mengganti source of truth tanpa approval.
- Setiap exposed table wajib RLS aktif dengan ownership/tenant policy. RLS defense-in-depth, bukan pengganti API authorization.
- Role tidak boleh bersumber dari user-editable `user_metadata`. Hindari unsafe `SECURITY DEFINER`. UPDATE policy harus benar pada `USING` dan `WITH CHECK`.
- Migrations versioned dan diuji terhadap schema diketahui. Jangan mengubah production schema secara ad hoc.
- Saldo, ledger, quota, entitlement, subscription, payment dan campaign reward harus atomic, idempotent dan auditable.
- Ledger immutable; koreksi memakai compensating entries, bukan edit/hapus transaksi historis.
- Tidak ada fake/mock/demo data di production. Fixture hanya untuk test terisolasi, tidak boleh disajikan sebagai live data.
- Jangan mempromosikan demo balances, posts, sessions, transactions, artifacts atau fake success dari repo referensi.

## 9. Network Partnership
- Model venue-first dan provider-independent; partner boleh memakai ISP berbeda.
- Partner Free aktif hanya selama syarat jaringan/sesi terverifikasi. Saat meninggalkan jaringan, entitlement dievaluasi ulang menurut policy General Free/Paid.
- Paid access/credit tidak hilang akibat perpindahan Wi-Fi.
- Verification methods configurable per network; evidence dinormalisasi Unified Verification Engine.
- Jangan klaim browser dapat membaca SSID universal. IP geolocation bukan GPS. Geolocation perlu consent. Captive gateway proof diterima hanya jika signature/session binding valid.
- Fail closed jika evidence tidak cukup; fallback eksplisit, tercatat, tidak melemahkan policy diam-diam.
- Partner quota berbeda dari paid credits. Parameter bisnis belum final harus configurable dan ditandai Open Decision.

## 10. UI states dan kelengkapan fitur
Setiap screen/feature memiliki wired actions dan state loading, empty, error, success, permission denied, offline/reconnect, expired/revoked sesuai konteks. Tombol tidak boleh inert. Jangan gunakan static counters atau fabricated responses untuk menyamarkan endpoint yang belum ada. Jika API belum tersedia, tampilkan state unavailable/feature flag dan catat blocker.

## 11. Quality gates
Sebelum menyelesaikan perubahan:
- Jalankan lint, format, typecheck, unit tests dan build app terdampak.
- Jalankan API contract/integration tests serta migration/RLS tests untuk domain terkait.
- Uji authz negative cases, cross-tenant access, idempotency, retry dan concurrency sesuai risiko.
- Jalankan visual regression untuk perubahan UI; tidak boleh ada drift tak disetujui.
- Scan secret/dependency/license; pastikan logs tidak membocorkan token/PII.
- Verifikasi endpoint benar-benar mengakses backend dan Supabase yang dituju, bukan mock adapter.
- Simpan bukti CI/test/screenshots/commit/deployment di phase report.

Jangan klaim build/test/endpoint/deployment berhasil jika tidak dijalankan atau tidak ada hasil yang bisa diperiksa.

## 12. Git and change management
- Kerjakan per phase dan branch terisolasi; gunakan commit kecil dan bermakna.
- Jangan force-push, rewrite history, menghapus upstream remote atau mengubah repo referensi.
- Jangan menimpa file yang ada sebelum membaca isi dan memahami kepemilikannya.
- Perubahan schema, API contract, visual behavior, dependency besar, security boundary atau business policy memerlukan ADR.
- Jangan commit .env, credentials, private keys, production dumps, personal data atau generated secrets.
- PR menyebut phase, scope, source mapping, API/DB impacts, tests, visual diff, security, rollback dan next phase.

## 13. Phase execution dan reporting
Ikuti Phase Implementation Plan. Setiap phase mengelola workstream Web PWA, Native Expo, Super Admin, Partner Portal, Captive Portal, FastAPI, engine/worker, Supabase dan QA secara paralel setelah kontrak disepakati. Jangan menandai Passed sebelum seluruh gate relevan lulus.

Laporan wajib: status, commit/PR, file coverage, endpoint, migrations/RLS, client terdampak, tests/CI evidence, screenshot diff, security review, unresolved decisions, limitations, rollback, serta phase selanjutnya.

## 14. Stop conditions
Hentikan dan minta keputusan jika source provenance hilang; file/license tidak jelas; perubahan akan mengubah desain referensi; diperlukan demo data untuk membuat flow tampak berhasil; frontend perlu bypass FastAPI; ada permintaan memasukkan secret ke repo/client; schema/RLS berpotensi membuka tenant lain; business rule belum diputuskan; atau instruksi bertentangan dengan Master PRD.
