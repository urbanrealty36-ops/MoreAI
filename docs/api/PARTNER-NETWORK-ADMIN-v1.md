# MoreAI API Contracts — Partner, Network Access, Super Admin

**Contract version:** v1  
**Status:** OpenAPI route skeletons published; persistence and live gateway adapters intentionally unavailable  
**Source of target endpoint map:** Master PRD v1.0 §13.3  
**Rule:** All business requests are authenticated and go through FastAPI. No client-side Supabase business-table queries.

## Common conventions

- Base path: `/api/v1`
- Authentication: `Authorization: Bearer <Supabase access token>`
- JWT: signature validated against Supabase JWKS; issuer, audience `authenticated`, expiry and subject required.
- IDs: UUID once domain schema is provisioned.
- Time: UTC ISO-8601.
- Mutations: require `Idempotency-Key` when they create or alter business state.
- Error body uses FastAPI detail object with stable `code` and safe `message`.
- No user-supplied role field is trusted. Super Admin role is read only from server-controlled `app_metadata`; `user_metadata` is never authorization input.
- Tenant ownership must be resolved from persisted membership before any partner record access.
- Current MoreAI Supabase project has no public domain tables. Therefore the route skeletons return explicit 503 and do not synthesize data.

## Partner Portal

| Method | Path | Permission boundary | Current behavior |
|---|---|---|---|
| GET | `/partner/me` | authenticated + active partner membership | 503 `PARTNER_DOMAIN_NOT_CONFIGURED` |
| GET | `/partner/branches` | organization-scoped member | 503 |
| POST | `/partner/branches` | organization admin; idempotent | 503 |
| GET | `/partner/networks` | organization/location scope | 503 |
| POST | `/partner/networks` | organization admin; ownership validated | 503 |
| GET | `/partner/verification-methods` | organization/location scope | 503 |
| GET | `/partner/campaigns` | organization scope | 503 |
| POST | `/partner/campaigns` | organization admin; review/policy checks | 503 |
| GET | `/partner/rewards` | organization scope | 503 |
| GET | `/partner/analytics` | organization/location scope | 503 |

Future response shapes are to be generated from reviewed database schema; no sample tenant IDs or fake statistics are defined here.

## Captive Portal and Network Access

| Method | Path | Contract | Current behavior |
|---|---|---|---|
| GET | `/network/portal-context` | resolves venue/network from signed gateway context | 503 `NETWORK_GATEWAY_NOT_CONFIGURED` |
| POST | `/network/access/verify` | network_id, verification_method, optional access_code and gateway_session_id | 503 |
| GET | `/network/access/session` | returns verified current session and entitlement | 503 |
| POST | `/network/access/session/refresh` | signed gateway heartbeat; idempotent | 503 |
| POST | `/network/access/session/end` | close session; reevaluate entitlement | 503 |

### Verification security requirements

- Captive gateway evidence must be signed and bound to a gateway session and network.
- Never trust a client-provided SSID or IP geolocation as proof of association.
- Verification method must be enabled for the resolved network.
- Fail closed if signature, freshness, network binding, session binding, or policy checks fail.
- Partner Free entitlement is granted only after verified evidence and campaign/quota policy pass.
- Paid entitlement is independent and must not be revoked when partner Wi-Fi ends.
- Access session expiry and gateway heartbeat are server-authoritative.
- Credit/reward issuance must be atomic, idempotent and recorded in immutable ledger/event records.

## Super Admin

| Method | Path | Permission boundary | Current behavior |
|---|---|---|---|
| GET | `/admin/overview` | platform_admin/super_admin | 403 unless server role; 503 if authorized but domain not provisioned |
| GET | `/admin/users` | user.read | same |
| GET | `/admin/agents` | agent.read | same |
| GET | `/admin/models` | llm.read | same |
| GET | `/admin/audit` | audit.read | same |
| GET | `/admin/network-policies` | network.policy.read | same |

Additional Master PRD routes such as role assignment, partner provisioning, campaign mutation, verification-attempt review, session revocation, provider policy mutation and finance ledger are not exposed until their permission matrix, DB schema, audit and transactional behavior are implemented.

## Required persistence (proposed names from Master PRD §12.2)

Partner/network domains: `partner_organizations`, `partner_members`, `partner_locations`, `network_providers`, `provider_partnerships`, `partner_networks`, `network_verification_configs`, `network_verification_attempts`, `network_verification_evidence`, `network_verification_sessions`, `network_sessions`, `network_session_events`, `network_campaigns`, `network_campaign_rules`, `network_campaign_codes`, `network_campaign_claims`, `user_entitlements`, `entitlement_policies`, `partner_usage_daily`, `partner_cost_allocations`, `partnership_audit_logs`.

Agent runtime domains: `agent_runs`, `agent_run_steps`, `agent_run_events`, `agent_approvals`, `tool_execution_records`, `task_artifacts`, `outbox_events`, `idempotency_keys`, `security_events`.

These names are conceptual proposals, not existing tables. Before migration, define columns, FK, indexes, constraints, retention, RLS, tenant membership semantics and transactional functions. No DDL is applied by this contract document.

## Current implementation files

- `apps/api/src/moreai_api/routers/partner.py`
- `apps/api/src/moreai_api/routers/network.py`
- `apps/api/src/moreai_api/routers/admin.py`
- `apps/api/tests/test_domain_contracts.py`

The endpoints deliberately return unavailable responses until data and gateway integrations are real. A 503 is a truthful blocker, not a completed business feature.
