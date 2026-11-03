# ADR-0005 — Defer Live Network Provider and Device Validation

- Status: Accepted by explicit project-owner instruction, 3 November 2026.
- Scope: Phase 02 code completion for network verification adapters and related Partner/Admin/Captive Portal API integration.

## Decision

1. Phase 02 engineering prioritizes implementation code, FastAPI contracts, typed API clients, UI wiring, persistence integration, authorization, audit paths and application-level error handling.
2. Live validation against MikroTik RouterOS devices, RADIUS servers, GPS runtime environments, gateway/controller appliances and ISP provider APIs is deferred and is not a blocker for completing the code integration workstream.
3. No live network method may be marked operational or adapter-ready solely because its code or endpoint exists.
4. Until an actual provider/device is provisioned and separately validated, the corresponding network method remains unavailable or fail-closed. The UI and API must report that state honestly.
5. Code-level validation remains required: lint, format, typecheck, unit/contract tests, build, security scans and CI checks for the changed code. This decision does not waive repository quality gates.
6. No staging environment is created. No production credentials or device secrets are required for this code-only workstream.

## Rationale

The project owner has directed engineering to stop spending time on external hardware/provider testing and focus on completing the application code, integrations and connected endpoints. Live provider readiness is an operational activation concern, separate from code implementation.

## Consequences

- Phase 02 code integration can be reviewed without live MikroTik/RADIUS/GPS/ISP access.
- Production network access and sponsored entitlement remain disabled until the relevant adapter is independently provisioned and validated.
- Reports must distinguish implemented API contracts from externally verified provider integrations.
