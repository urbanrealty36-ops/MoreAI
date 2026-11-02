# Phase 02 — Source Migration

**Status:** IN PROGRESS — acceptance gate belum terpenuhi  
**Branch:** `phase-02-source-migration`  
**Pull request:** [#2 — Phase 02 Source Migration](https://github.com/urbanrealty36-ops/MoreAI/pull/2)  
**Last implementation commit at report update:** `9070376a4204a4b13a633c1fbcf8e36c1ba2199d`

## 1. Pinned upstream sources

| Source | Ref | Commit | Tree | Tracked files | Bytes |
|---|---|---|---|---:|---:|
| OpenManusWeb | `dev_web_app` | `3ceaa9182b39bbb9898ddda0a4b1c50c2758ab5f` | `41258ca11d4299beab17e4172fbcf8303eac1a6b` | 111 | 1,201,688 |
| Front-End-UI-MoreAI | `main` | `89bccc184dc8f2e6dac20627d5c7d50ef3e4a8f4` | `30922c1ab21de3b60947cae5448e0a58222466be` | 53 | 8,708,522 |

## 2. Source snapshot and provenance — implemented

- Kedua source telah dimaterialisasi sebagai file Git biasa di `vendor/openmanusweb/` dan `vendor/reference-ui/`; tidak lagi hanya berupa gitlink submodule.
- Manifest file-level `source-inventory-v1.csv` memuat 164 file, termasuk upstream path, blob SHA, ukuran byte, tipe, target mapping, dan disposition.
- Pemeriksaan independen pada Git tree target membuktikan **164/164 file vendor cocok dengan upstream blob SHA dan ukuran byte**; recursive tree target tidak terpotong.
- `scripts/verify-source-pins.py` memeriksa object SHA dan ukuran blob yang benar-benar tersimpan pada commit target, bukan hanya file working tree.
- `scripts/materialize-source-mirrors.py` menyimpan prosedur reproduksi snapshot dari commit upstream yang dipin.
- OpenManus MIT LICENSE dan copyright notice dipertahankan. UI MoreAI tetap dicatat sebagai source milik project owner yang pengguna nyatakan dan izinkan; tidak ada klaim lisensi open-source yang tidak tersedia.
- Tidak ditemukan file GLB/GLTF pada inventaris UI upstream.

## 3. FastAPI LLM gateway — adapter awal tersedia

- Ditambahkan `POST /api/v1/llm/generate` di FastAPI.
- Endpoint memvalidasi Supabase access token melalui JWKS, issuer, audience `authenticated`, expiry, subject, dan algoritma ES256/RS256.
- Provider Gemini dipanggil server-side menggunakan `LLM_PROVIDER_API_KEY`; secret tidak diletakkan di browser.
- Request membatasi panjang prompt, model identifier, output token, dan timeout; error provider tidak memantulkan credential atau payload sensitif.
- `packages/api-client` menyediakan metode typed `llm.generate()` yang mengirim Bearer token melalui shared request client.
- Ini adalah adapter awal untuk migrasi provider call, **belum** merupakan Model Router lengkap: metering, cost reconciliation, policy per tenant, streaming, quota/credit reservation, retry policy, serta durable run lifecycle tetap menjadi scope fase terkait.
- Source snapshot UI tetap tidak diubah. UI aktif belum seluruhnya dialihkan ke typed client.

## 4. Masih wajib sebelum Phase 02 dapat dinyatakan PASSED

1. Integrasikan source UI asli ke Web PWA, Super Admin, Partner Portal, dan Captive Portal sebagai komponen aktif; pertahankan visual, PWA, responsive behavior, assets, dan interaksi referensi.
2. Ganti demo state, sample venue/partner/campaign/statistics, fake credit mutation, timeout success, serta fake admin save dengan state loading/empty/error/unavailable dan endpoint backend nyata.
3. Sambungkan semua aksi bisnis yang tersedia ke FastAPI versioned endpoints. Jangan menyatakan integrasi live jika domain endpoint atau schema belum tersedia.
4. Migrasikan OpenManus source secara additive ke engine/API/worker; jangan expose legacy API/session/tool route secara langsung.
5. Terapkan autentikasi ownership pada session dan WebSocket; workspace/file access tenant-scoped; cancellation dan lifecycle durable.
6. Shell arbitrary tetap disabled. Python hanya boleh dijalankan lewat isolated sandbox; browser hanya lewat isolated worker dengan SSRF/egress allowlist, resource quota, audit, cancellation, dan cleanup.
7. Lengkapi dependency dan license audit untuk seluruh dependency upstream serta fonts/icons/assets/model; hasil scan keamanan saat ini bukan pengganti license review.
8. Jalankan build/import/contract tests untuk setiap app yang telah terintegrasi, negative authz/tenant tests, dan visual regression screenshot pada viewport 360, 390, 768, 1024, dan 1440 px.
9. Verifikasi seluruh endpoint memakai Supabase project MoreAI yang benar melalui FastAPI. Tidak ada schema migration atau deployment pada pekerjaan ini.

## 5. Batas perubahan dan status verifikasi

- UI source upstream tidak dimodifikasi; perubahan integrasi dibuat di MoreAI layer.
- Belum ada perubahan schema Supabase, RLS, atau deployment.
- Source provenance CI telah lulus pada commit sebelumnya; CI penuh untuk perubahan gateway dan source snapshot sedang berjalan saat laporan ini disusun.
- Belum ada bukti screenshot visual regression karena UI source belum diintegrasikan ke seluruh app target.
- Tidak ada fake business data yang ditambahkan sebagai data produksi.
- **Phase 02 tetap IN PROGRESS.** Phase 03 tidak dimulai sebelum seluruh acceptance gate Phase 02 lulus.

