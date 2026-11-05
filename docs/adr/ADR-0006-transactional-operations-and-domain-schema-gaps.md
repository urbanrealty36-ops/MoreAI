# ADR-0006 — Transactional Operations and Remaining Domain Schema

- Status: Accepted
- Date: 2026-11-03
- Owners: MoreAI project owner and engineering
- Scope: Customer Workspace, Super Admin, Partner Portal, Captive Portal, and agent runtime

## Context

The live MoreAI Supabase schema was inspected directly. It contains persisted conversations, conversation messages, agent runs/events/steps/checkpoints, artifacts, wallet and immutable credit ledger, user entitlements, partner organizations/members/locations/networks/campaigns/rewards, verification attempts/sessions, RBAC, LLM models/routing policies, and audit logs.

The current live schema does not contain dedicated memory persistence/embedding tables, subscription lifecycle/catalog/payment tables, or QR/access-code issuance and redemption tables. Atomic audited RPCs now exist for partner application creation/review, platform role assignment/revocation, role-permission changes, and LLM provider/model/routing mutations.

## Decision

1. All multi-row privileged operations that require audit must be performed by one Postgres transaction/RPC. Do not implement the business mutation and audit insert as independent calls and then report the operation as atomic.
2. Partner onboarding must create the organization and its owner membership atomically, with a pending status and an immutable audit event.
3. Super Admin approval, model/provider registry changes, routing changes, role assignment/revocation, and role-permission changes must validate permission/scope and write their audit record in the same transaction. All implemented privileged mutation RPCs are callable only by service_role and use SECURITY INVOKER.
4. Memory persistence must have explicit retention, deletion, embedding model, vector dimension, tenant isolation, and consent policy before schema or UI controls are enabled.
5. Subscription lifecycle must have approved plan catalog, billing period, payment provider, webhook signature policy, refund/cancellation rules, and entitlement mapping before a purchase action is exposed.
6. QR/access codes must be stored as hashes, have expiry, single-use/replay protection, scope, issuance audit, and atomic redemption. Plaintext access codes must never be stored or returned after issuance.
7. Captive Portal remains fail-closed: gateway proof verification does not itself activate partner benefit or internet access. Network session creation/refresh/end and Free/Paid fallback require explicit entitlement and gateway lifecycle rules.
8. Storage downloads must use server-issued short-lived signed URLs after owner/scope checks. A storage path is not a public download URL.
9. No live MikroTik/RADIUS/GPS/gateway/ISP tests are required in the current code-first workstream; code-level security, contract, unit, lint, typecheck, build and CI gates remain mandatory.

## Implementation evidence

- Supabase migration `20261103100442_single_active_network_verification_method` was applied to the existing MoreAI project. It adds the platform verification-method catalog, the selected method field, one-enabled-method guard, server-only replay nonce storage, and atomic method selection. Every adapter remains `adapter_ready=false`; the migration does not activate any hardware integration.
- Customer Workspace chat/history, wallet/entitlement read APIs, and owner-scoped agent run event/step APIs are being wired through FastAPI.
- Super Admin permission matrix now supports guarded transactional role-permission changes; partner approval/rejection, platform role assignment/revocation, and provider/model/routing create/update/disable are backed by atomic audit RPCs.
- Memory and subscription endpoints explicitly return unavailable rather than inventing data.
- Captive Portal now verifies only signed gateway context and does not claim that internet access or partner benefits are active.
- Partner onboarding creates organization + owner membership + audit atomically. Super Admin partner review locks the organization and records the status transition in the same transaction.
- LLM provider/model/routing mutations write the data change and audit record atomically. Provider credentials are read only from server environment variables; model and routing entries default to disabled. The live provider/model/routing tables are currently empty.

## Consequences

Some requested controls intentionally remain unavailable until the schema and policy dependencies are implemented. This is preferable to exposing fake data, partial transactions, unsafe QR redemption, or false access-success states.


## Additional implementation evidence — 2026-11-03

- Platform role-permission changes use `moreai_admin_set_role_permission`, an invoker-security RPC callable only by `service_role`. It requires an active Super Admin holding both `platform.roles.assign` and `platform.security.manage`, writes the RBAC mutation and audit record in one transaction, prevents editing the `super_admin` role, and prevents delegating those two escalation permissions.
- Workspace chat now uses atomic idempotency claims and response finalization. In-flight duplicate requests are rejected, completed responses replay from the idempotency table, and request-key reuse with a different payload is rejected.
- Artifact listing now follows the actual `artifacts.storage_path` schema. Signed downloads are owner-scoped and 5-minute, but remain unavailable because the connected Supabase project currently has no Storage bucket; configure a private bucket and `WORKSPACE_ARTIFACTS_BUCKET` before enabling downloads.



## Security hardening — 2026-11-03

- Converted the seven newly introduced partner/admin RPCs from `SECURITY DEFINER` to `SECURITY INVOKER`: partner application submit/review, LLM provider/model/route mutations, and platform role assign/revoke.
- Verified `service_role` retains EXECUTE and the `authenticated` role has no EXECUTE on these RPCs. Verified `prosecdef=false` for all seven.
- `service_role` has the required table privileges for the underlying mutations and audit inserts; no privilege elevation through SECURITY DEFINER is required.
- The live project currently has zero platform role assignments. The initial Super Admin bootstrap must be explicitly bound to the project owner's confirmed Auth user; no user was guessed or granted the role.
