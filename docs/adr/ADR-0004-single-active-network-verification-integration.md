# ADR-0004 — Single Active Network Verification Integration

- Status: Accepted by explicit project-owner decision, 2 November 2026.
- Scope: Partner network onboarding, Super Admin integration catalog, Captive Portal, verification engine, gateway/RADIUS/ISP adapters and related FastAPI contracts.

## Context

The Master PRD defines multiple verification options and an adapter-based architecture. The project owner clarified that these are alternatives, not a stack of integrations that each partner must configure. MikroTik Hotspot is the first gateway/controller adapter target, but it is not mandatory for all partners.

## Decision

1. MoreAI supports a catalog of selectable network verification integration methods, including:
   - GPS / geolocation verification;
   - Captive Portal gateway integration, initially MikroTik Hotspot;
   - RADIUS;
   - Gateway/controller adapters other than MikroTik, when implemented;
   - ISP API integration, when supported and contractually available.
2. Super Admin manages which integration methods are available, their operational status, adapter capabilities, setup requirements and platform-level policy. Super Admin may disable an option globally or for a tenant/network where operationally required.
3. A partner selects exactly **one active verification method per network configuration**. The selected method is the sole method used to verify that network's partner-benefit access. The partner is not required to configure or select another method.
4. A network configuration stores one authoritative `active_method` and only the method-specific configuration required by that adapter. Inactive adapter configuration must not be treated as a fallback.
5. If a partner changes the method, the change is an explicit configuration transition: validate the new adapter configuration, record who changed it and when, then atomically activate the new method. Do not run both methods in parallel as an implicit hybrid.
6. The verification engine dispatches only to the selected adapter. It must reject unknown, disabled, incomplete, expired or invalid configurations and fail closed. It must never silently downgrade, substitute another method, or grant Partner Free/benefit access after failed verification.
7. If the selected adapter is unavailable, MoreAI reports a clear unavailable/error state and records an auditable failure. General Free access may remain available under the independent platform access policy, but must not be represented as verified partner access.
8. The initial gateway implementation target is MikroTik Hotspot. It requires signed gateway/session context, timestamp/expiry validation, nonce or equivalent replay prevention, partner/network binding, server-side proof validation and idempotent session lifecycle events.
9. GPS is a distinct verification adapter and does not require a gateway controller. RADIUS and ISP integrations are separate adapters with their own credentials, protocol/security requirements, tenant binding and provider-specific acceptance.
10. All configuration and business operations pass through versioned FastAPI endpoints. Clients may use Supabase Auth only for approved authentication/session flows; business data remains server-mediated and persisted in Supabase Postgres with tenant-scoped RLS and audit.
11. The database must enforce one active method per network configuration (for example, a constrained enum/discriminator and one method-specific configuration relation). API validation alone is insufficient. Migration and RLS changes must be forward-only and production-safe.
12. No provider/gateway integration is considered live until real credentials, protocol behavior, security verification and an operational smoke test have been confirmed. No demo adapter or synthetic success may be presented as production verification.

## Consequences

- MikroTik Hotspot is the first gateway adapter to implement, not a mandatory partner choice.
- Partner onboarding presents a single-choice selection of enabled verification methods.
- The Super Admin integration catalog controls availability; partner choice controls the active method for its network.
- Hybrid/multi-method verification is not the default behavior and must not be activated implicitly. Any future explicit multi-factor/hybrid mode requires a separate owner-approved ADR and product contract.
- Phase 02 acceptance includes tests proving single-method enforcement, method switching audit, tenant isolation, fail-closed behavior and absence of implicit fallback.
