# OpenManus Runtime Security Mapping

**Status:** bounded compatibility adapter only; legacy web server is not mounted or exposed.

| Upstream source seam | MoreAI target | Required control | Current boundary |
|---|---|---|---|
| `app/web/app.py`, templates, archived browser scripts | No MoreAI runtime target in Phase 02 | Treat as archival reference. Before any future reuse: fix CodeQL XSS, path traversal and exception disclosure findings; authenticate every route and validate paths. | Not imported by the adapter, not mounted by FastAPI, and not started as a web server. Exact affected files are excluded from CodeQL analysis only because they are immutable, non-runtime vendor snapshot files; see `CODEQL-LEGACY-SNAPSHOT-REVIEW.md`. |
| WebSocket session/progress routes | No MoreAI runtime target in Phase 02 | Before future reuse: authenticate before accepting sockets; validate run ownership on every subscription; tenant-filter events and bound connections. | Legacy WebSocket is not exposed. |
| `app/tool/bash.py` | No Phase 02 runtime target | Arbitrary shell must remain disabled; any future command tool requires explicit allowlisted operations in an isolated container. | Not added to the adapter tool collection. |
| `app/tool/python_execute.py` | No Phase 02 runtime target | Before future use: isolated process/container, no API-process exec, no network by default, CPU/memory/time quotas, workspace boundary and cleanup. | Not instantiated by the bounded adapter. |
| Browser tool / page navigation / JS execution | No Phase 02 runtime target | Before future use: dedicated egress proxy, domain allowlist, DNS/IP validation, block loopback/private/link-local/metadata IPs, redirect revalidation, per-run profile and resource limits. | Not instantiated by the bounded adapter. |
| Local workspace and log files | Future FastAPI workspace service + Supabase metadata | Owner/tenant-scoped paths, signed URLs after authorization, retention and audit; no shared host path. | Legacy local filesystem is not a MoreAI production data plane. |
| Provider wrappers and prompts | Injected LLM interface in bounded adapter | Future server-only credentials, model allowlist, policy and usage metering; no browser/mobile provider calls. | No provider is activated in Phase 02; UI API adapter fails closed. |

## Enforced Phase 02 defaults

- `BoundedManus` overrides the upstream default tool factory before instantiation.
- Only `Terminate` is present in the adapter tool collection.
- `tool_choices` is set to `none`.
- Shell, Python, browser and search tools are not instantiated or executed by the adapter.
- No worker queue, durable run lifecycle, checkpoint persistence, Supabase write, or public OpenManus route is activated.
- The UI LLM/Agent API client returns `PHASE_NOT_ACTIVE` and does not call a provider.
- These are source-integration guardrails, **not** proof of sandbox isolation or future tool safety.

## Required before enabling any legacy tool or web route

1. Remediate the upstream CodeQL findings before reusing the affected web files.
2. Move execution out of FastAPI into a worker-owned isolated runtime.
3. Add signed run identity and tenant/owner authorization before session, file, WebSocket or cancellation operations.
4. Add SSRF tests for IPv4/IPv6 private, loopback, link-local, metadata endpoints, DNS rebinding, redirects and mixed DNS answers.
5. Add sandbox escape, filesystem boundary, resource exhaustion, cancellation, timeout and cleanup tests.
6. Persist run state and audit records; prove recovery after worker restart.
7. Keep shell disabled unless a separately reviewed, narrowly scoped command capability is approved.

Do not infer that an upstream tool is safe merely because it is reachable from a trusted backend network.
