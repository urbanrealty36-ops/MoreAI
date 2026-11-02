# Phase 02 — Source Migration & Runtime Integration

**Status:** IN PROGRESS — source provenance is verified; runtime, product workflows and visual acceptance remain open.  
**Last audited:** 2026-11-02  
**Branch:** `phase-02-source-migration`

## 1. Source integrity

- OpenManusWeb and Front-End UI reference snapshots are preserved under `vendor/`.
- Source manifest verification: **164/164 files match** the pinned upstream blob SHA and byte size on the latest successful provenance job.
- Original upstream files are not edited to silence security findings. The historical expired GitHub private-video embed JWTs are scoped to exact fingerprints in `.gitleaksignore`; the allowlist is limited to the two vendor README files and their exact historical commits.
- The upstream source remains reference/vendor material; active MoreAI application routes must not expose upstream demo data as live operations.
- License, attribution and source mapping remain part of the source acceptance record.

## 2. Supabase state — live read-only audit

Connected project: `uunfgimtokhucegqbpce` (`MoreAIdb`), PostgreSQL 17.11, region `ap-southeast-2`, status `ACTIVE_HEALTHY`.

Observed on 2026-11-02:
- **14 migrations** are recorded as applied, including identity/partner/network foundation, permission seed, tenant read RLS, server-only deny policies, agent/billing/campaign domains, atomic credit reservation/settlement, durable worker lifecycle/leases/recovery/cancellation/dead-letter, and durable LLM idempotency/settlement.
- SQL catalog audit counted **48 public tables**; all 48 had RLS enabled and at least one policy.
- The same audit found **zero** SECURITY DEFINER public functions executable by `anon`.
- Supabase Security Advisor returned **zero lint findings**.
- Seed data is limited to platform RBAC reference records observed in `roles`, `permissions`, and `role_permissions`; partner, customer, network, agent and wallet business records were empty at audit time.
- No production database writes were made during this audit.

These are point-in-time observations, not a substitute for migration replay, tenant-negative tests, or production acceptance.

## 3. Runtime and API status

Implemented baseline:
- FastAPI JWT verification using Supabase JWKS and server-side database access.
- Typed API client used by Web, Admin, Partner Portal and Native application code.
- LLM provider routing and server-side provider credentials; provider calls are not made directly from browser/mobile.
- Durable agent run tables, worker lease/heartbeat/checkpoint/cancel/resume/recovery/dead-letter RPCs.
- Credit reservation and settlement RPCs with immutable ledger protections.
- Partner, network and admin read contracts with server-side membership/permission checks.
- Captive Portal default route fails closed when gateway proof/configuration is unavailable.
- Shell is denied; Python/browser tool execution remains disabled until isolated runtimes and SSRF/resource controls are deployed.

Latest source changes include:
- Python workspace formatting in CI before lint/test.
- Agent-run idempotency key validation, request-payload binding, and recovery from concurrent unique-key conflicts.
- Regression tests for duplicate replay, mismatched payload reuse, invalid idempotency keys, and concurrent create races.

## 4. Product surfaces

| Surface | Current state | Remaining work |
|---|---|---|
| Customer Web PWA | Production route clearly reports API integration in progress; reference UI is behind an explicitly labelled non-production preview | Supabase Auth production flow, real workspace/chat/agent/task/file/wallet APIs, all UI states, responsive screenshot regression |
| Native Expo | Real Supabase password sign-in/session and FastAPI agent list/create/cancel/resume client path | Complete parity, secure token storage review, deep links, camera/files, push, offline/reconnect, device/permission coverage |
| Super Admin | FastAPI-backed overview/users/models/audit read path; visual reference is explicitly non-operational | Mutations, server permission matrix, approval workflows, audit verification, operational states and screenshots |
| Partner Portal | FastAPI-backed partner membership/branch/network/campaign/reward/analytics read path; visual reference is explicitly non-operational | Registration/onboarding, CRUD, role-specific actions, branch/network configuration, campaign/reward operations, audit and screenshots |
| Shared Captive Portal | Default route does not claim Wi-Fi connection or reward success without gateway proof | Signed gateway context, nonce/replay protection, real gateway adapter, verification/session/reward lifecycle, real provider credentials and hardware integration |

## 5. Acceptance blockers

1. **Durable OpenManus runtime:** the worker currently instantiates the upstream Manus agent through the MoreAI LLM gateway, but the tool collection is intentionally restricted to termination. Full planning/tool execution, durable per-step event/checkpoint semantics, restart recovery proof, and isolated execution are not yet accepted.
2. **Sandbox:** browser/Python remain disabled. No claim of sandbox isolation or SSRF resistance is made.
3. **Auth and client parity:** Native has a real password-auth path; Customer Web/Admin/Partner production login and recovery flows are not yet fully integrated. API authorization is enforced server-side, but end-to-end UI workflows are incomplete.
4. **Partner/Admin operations:** current operational API coverage is predominantly read-only. Create/update/approve/suspend/revoke/campaign/reward actions and transactional audit paths remain.
5. **Network integration:** no gateway/provider has been selected and provisioned with verified credentials. Captive Portal must remain fail-closed; no access or sponsored benefit can be claimed.
6. **Visual regression:** screenshot evidence at 360, 390, 768, 1024 and 1440 widths, with loading/empty/error/permission/success states, is still outstanding.
7. **CI/security:** all checks must pass on the latest branch commit. Python formatting was added to CI because the imported Python source contained Ruff E701/E702 findings. The latest run is the acceptance source of truth; earlier green runs do not certify a newer commit.
8. **Migration reproducibility:** applied production migrations must be reconciled with checked-in migration files and replayed in a disposable Supabase branch/local environment before claiming clean-install acceptance.

## 6. Production data and fail-closed policy

- No example partner, venue, SSID, reward, credit balance, user, campaign or network session may be returned by a production API.
- Preview-only reference screens must remain visibly labelled as non-production and must not be mounted as the production operational surface.
- Missing provider credentials, gateway configuration, proof, or database connectivity must return explicit unavailable/error states; never fabricate a success state.
- Business operations and privileged mutations must pass through FastAPI and transactional server-side database functions. Supabase Auth SDK is permitted only for authentication/session lifecycle.
- Supabase service-role credentials and LLM keys remain server-only.

## 7. Gate decision

**Phase 02 is NOT PASSED.** Source provenance and foundational database/security controls are evidenced, but the product/runtime integrations, isolated execution, operations, and visual regression criteria above are incomplete. Phase 03 must not start until these blockers have evidence-backed closure.
