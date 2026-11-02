# Phase 02 — Source Migration & Runtime Integration

**Status:** IN PROGRESS — provenance and foundation are evidenced; expanded product/runtime acceptance is still open.  
**Last audited:** 2026-11-02  
**Branch:** `phase-02-source-migration`  
**Phase 01 integration:** merged into `main` at `ca4c29186104787e8c0539e796fbc27da565ee8b`; this branch was synchronized with main by merge commit `2334c165f5458e60fb88f6ab71f1e26555d769e2`.

## 1. Source integrity

- OpenManusWeb and Front-End UI reference snapshots are preserved under `vendor/`.
- Source manifest verification: **164/164 files match** pinned upstream blob SHA and byte size on the latest successful provenance job.
- Original upstream source is retained as vendor/reference material; active MoreAI routes do not mount source demo state as live operations.
- Three exact historical fingerprints for expired GitHub private-video embed JWTs are listed in `.gitleaksignore`. No broad secret type, repository path, or unrelated commit is ignored.
- License, attribution and source mapping remain part of the source acceptance record.

## 2. Supabase state — live read-only audit

Connected project: `uunfgimtokhucegqbpce` (`MoreAIdb`), PostgreSQL 17.11, region `ap-southeast-2`, status `ACTIVE_HEALTHY`.

Observed on 2026-11-02:
- **14 migrations** are recorded as applied, covering identity/partner/network foundation, permission seed, tenant read RLS, server-only deny policies, agent/billing/campaign domains, atomic credit reservation/settlement, durable worker lifecycle/leases/recovery/cancellation/dead-letter, and durable LLM idempotency/settlement.
- SQL catalog audit counted **48 public tables**; all 48 had RLS enabled and at least one policy.
- The audit found **zero** SECURITY DEFINER public functions executable by `anon`.
- Supabase Security Advisor returned **zero lint findings**.
- Seed data observed was limited to platform RBAC reference records in `roles`, `permissions`, and `role_permissions`; partner, customer, network, agent and wallet business records were empty at audit time.
- No production database writes were made during this audit.

These are point-in-time observations, not a substitute for migration replay, tenant-negative tests, or production acceptance.

## 3. API, identity and runtime integration

Implemented:
- FastAPI JWT verification using Supabase JWKS and server-side database access.
- Typed API client used by Web, Admin, Partner Portal and Native application code.
- LLM provider routing and server-side provider credentials; browser/mobile clients do not call LLM providers directly.
- Durable agent run tables, worker lease/heartbeat/checkpoint/cancel/resume/recovery/dead-letter RPCs.
- Worker Dockerfile based on pinned Python/uv images, non-root runtime user and read-only application tree. The CI pipeline builds this image.
- Credit reservation and settlement RPCs with immutable ledger protections.
- Partner, network and admin read contracts with server-side membership/permission checks.
- Agent-run idempotency key validation, request-payload binding, and recovery from concurrent unique-key conflicts; regression tests cover replay, payload mismatch, invalid keys and create races.
- Environment-based FastAPI CORS allowlist. Production rejects missing origins, wildcard and non-HTTPS origins.
- Browser/Python tool execution remains disabled until isolated runtimes and SSRF/resource controls are deployed.

## 4. Product surfaces

| Surface | Current implementation | Remaining acceptance |
|---|---|---|
| Customer Web PWA | Supabase Auth sign-in, registration, OAuth callback, password recovery and password update are wired to migrated source Login/Register screens. Remember-email is opt-in. | Authenticated workspace is intentionally not activated yet; chat/history, agents, files, wallet, partner access, notifications and settings must be connected to FastAPI and persisted before production use. |
| Native Expo | Supabase password sign-in/session and FastAPI agent list/create/cancel/resume client path. | Complete parity, secure token storage review, deep links, camera/files, push, offline/reconnect, permission and device coverage. |
| Super Admin | Supabase Auth gate; overview/users/models/audit reads come from FastAPI; reference UI is explicitly non-operational. | Mutations, full server permission matrix, approvals, audit verification and operational state coverage. |
| Partner Portal | Supabase Auth gate; partner membership/branch/network/campaign/reward/analytics reads come from FastAPI; reference UI is explicitly non-operational. | Registration/onboarding, CRUD, role-specific actions, branch/network configuration, campaign/reward operations and audit. |
| Shared Captive Portal | Default route fails closed without gateway proof/configuration; simulation is available only in a clearly labelled non-production preview. | Signed gateway context, nonce/replay protection, real gateway adapter, verification/session/reward lifecycle and provider credentials. |

## 5. CI and security

The current CI definition is read-only with respect to the repository and includes:
- frozen pnpm and uv lockfile validation;
- source pin/provenance verification;
- Web lint/typecheck/test/build;
- Python Ruff format/lint and pytest;
- CodeQL, pnpm audit, pip-audit and Gitleaks;
- worker container build;
- runtime smoke for FastAPI, Web, Admin, Partner Portal and Captive Portal;
- Expo configuration validation.

The latest CI run on merge commit `2334c165f5458e60fb88f6ab71f1e26555d769e2` is queued/in progress. Earlier runs found and fixed Ruff formatting/import findings and a brittle decimal string assertion; only the latest run can certify the current head.

## 6. Production data and fail-closed policy

- No example partner, venue, SSID, reward, credit balance, user, campaign or network session may be returned by a production API.
- Reference screens with sample values are only available in visibly labelled non-production preview sections.
- Missing provider credentials, gateway configuration, proof, or database connectivity must return explicit unavailable/error states; never fabricate success.
- Business operations and privileged mutations must pass through FastAPI and transactional server-side database functions. Supabase Auth SDK is permitted only for authentication/session lifecycle.
- Supabase service-role credentials and LLM keys remain server-only.
- Production CORS requires explicit HTTPS client origins.

## 7. Acceptance blockers

1. **Customer workspace:** Auth is integrated, but authenticated chat history, workspace, agent task monitor, files, memory, wallet, subscription and partner access are not yet fully connected to real FastAPI persistence.
2. **Durable OpenManus runtime:** the worker instantiates the upstream Manus agent through the MoreAI LLM gateway, but the tool collection is intentionally restricted to termination. Full planning/tool execution, durable per-step event/checkpoint semantics and restart recovery proof remain open.
3. **Sandbox:** browser/Python execution remains disabled. No claim of sandbox isolation or SSRF resistance is made.
4. **Partner/Admin operations:** current API coverage is predominantly read-only. Create/update/approve/suspend/revoke/campaign/reward actions and transactional audit paths remain.
5. **Captive Portal/network:** no gateway/provider has been selected and provisioned with verified credentials. Captive Portal remains fail-closed; no Wi-Fi access or sponsored benefit is claimed.
6. **Native parity:** push, deep links, offline/reconnect and complete customer workflow parity remain.
7. **Visual regression:** screenshot evidence at 360, 390, 768, 1024 and 1440 widths, including loading/empty/error/permission/success states, has not been completed. Runtime HTTP smoke is not visual regression evidence.
8. **Database acceptance:** applied production migrations must be reconciled with checked-in migration files and replayed in a disposable Supabase branch/local environment. Tenant-negative RLS tests and transactional mutation tests are still outstanding.
9. **Deployment:** the worker image is defined for CI build, but no worker deployment target or production runtime credentials have been configured or verified.

## 8. Gate decision

**PHASE 02 IS NOT PASSED.** Source provenance, database/RLS posture, API foundations, Auth entry flows, and some runtime/security gates are evidenced, but the expanded product/runtime integrations, isolated execution, transactional partner/admin operations, Captive Portal gateway integration, Native parity, and visual regression criteria remain incomplete. Phase 03 must not start until these blockers have evidence-backed closure.
