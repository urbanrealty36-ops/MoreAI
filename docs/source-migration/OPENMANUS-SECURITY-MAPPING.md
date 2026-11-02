# OpenManus Runtime Security Mapping

**Status:** design and fail-closed policy guardrails added; isolated runtime is not yet deployed.

| Upstream source seam | MoreAI target | Required control | Current boundary |
|---|---|---|---|
| `app/web/app.py` chat/session/stop routes | FastAPI routes + durable run service + worker | JWT validation, owner/tenant checks, idempotent create/cancel, persisted state/checkpoints | Legacy route is not exposed as a public MoreAI API |
| WebSocket session/progress routes | Authenticated API event gateway | Authenticate before accepting socket; validate run ownership on every subscription; bounded connections; tenant-filtered events | Legacy WebSocket is not exposed |
| `app/tool/bash.py` | No direct API mapping | Arbitrary shell disabled; any future command tool requires explicit allowlisted operations in an isolated container | Denied by `SandboxPolicy` |
| `app/tool/python_execute.py` | `apps/sandbox` behind worker | Isolated process/container, no API-process exec, no network by default, CPU/memory/time quotas, filesystem workspace, cleanup | Disabled until runtime isolation is configured |
| Browser tool / page navigation and JS execution | Dedicated browser worker under sandbox boundary | Egress proxy, domain allowlist, DNS/IP validation, block loopback/private/link-local/metadata IPs, redirect revalidation, per-run profile, resource/time limits | Disabled until isolated egress is configured |
| Local workspace and log files | FastAPI workspace service + Supabase Storage/Postgres metadata | Owner/tenant-scoped paths, signed URLs after authorization, retention and audit; no shared host path | Legacy local filesystem is not a production data plane |
| Provider wrappers and prompt/config | Engine LLM adapters + FastAPI gateway | Server-only credentials, model allowlist, policy and usage metering; no browser/mobile provider calls | Authenticated Gemini gateway adapter exists; full router/metering remains pending |

## Enforced defaults

- Shell is always denied by the sandbox policy.
- Python and browser tools are denied until their isolated runtime controls are explicitly configured.
- Browser access requires a dedicated egress proxy and non-empty domain allowlist.
- Resource budgets are bounded; unknown tool names are denied.
- These policy checks are guardrails, **not** proof of container isolation or sandbox escape resistance.

## Required before enabling any legacy tool

1. Move execution out of FastAPI process into a worker-owned isolated runtime.
2. Add signed run identity and tenant/owner authorization before session, file, WebSocket, or cancellation operations.
3. Add SSRF tests for IPv4/IPv6 private, loopback, link-local, metadata endpoints, DNS rebinding, redirects, and mixed DNS answers.
4. Add sandbox escape, filesystem boundary, resource exhaustion, cancellation, timeout, and cleanup tests.
5. Persist run state and audit records; prove recovery after worker restart.
6. Keep shell disabled unless a separately reviewed, narrowly scoped command capability is approved.

Do not infer that an upstream tool is safe merely because it is reachable from a trusted backend network.
