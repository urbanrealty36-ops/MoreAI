# CodeQL review — upstream legacy web snapshot

**Review basis:** GitHub Advanced Security CodeQL check on the Phase 02 pull request.  
**Finding total:** 24 alerts (19 high, 5 medium).  
**Disposition:** known upstream-only findings; the affected legacy web surface is not imported by the bounded MoreAI adapter, not mounted by FastAPI, and not started by any MoreAI app.

## Findings by source file

| Upstream file | Alerts | Finding classes |
|---|---:|---|
| `vendor/openmanusweb/app/web/templates/index.html` | 1 | DOM text reinterpreted as HTML |
| `vendor/openmanusweb/app/web/templates/archive/index.html` | 1 | DOM text reinterpreted as HTML |
| `vendor/openmanusweb/app/web/static/archive/final_interface.html` | 2 | DOM text reinterpreted as HTML |
| `vendor/openmanusweb/app/web/static/archive/chatManager.js` | 2 | DOM text reinterpreted as HTML; client-side XSS |
| `vendor/openmanusweb/app/web/static/archive/apiManager.js` | 3 | Client-side XSS |
| `vendor/openmanusweb/app/web/log_parser.py` | 2 | Uncontrolled data in path expression |
| `vendor/openmanusweb/app/web/app.py` | 13 | Uncontrolled data in path expression; exception information exposure |
| **Total** | **24** | **19 high / 5 medium** |

## Why these files are not activated

- The exact upstream source is retained unchanged under `vendor/openmanusweb/` to preserve provenance and satisfy the complete source migration.
- Phase 02 imports the agent entry point only through `apps/worker/src/moreai_worker/openmanus_adapter.py`.
- The adapter overrides the upstream `Manus.available_tools` default factory before instantiation, provides only `Terminate`, and sets `tool_choices = "none"`.
- MoreAI does not mount `app/web/app.py`, its templates, static archive scripts, log parser or WebSocket routes.
- The legacy web files are not imported by the bounded adapter or the FastAPI foundation app.

## Narrow CodeQL configuration

`.github/codeql/codeql-config.yml` excludes only the seven exact files listed above from CodeQL path analysis. It does not exclude the vendor directory, agent runtime source, tools, LLM wrappers, UI app copies, or any MoreAI application code.

This is not a claim that the upstream files are safe. The findings remain documented as known upstream issues. If a future phase proposes activating any of these files, it must first remediate the findings in an integration overlay or reviewed fork, remove the corresponding path exclusions, and pass a fresh CodeQL analysis. The immutable source snapshot itself must not be patched.

## Phase decision

Phase 02 may proceed only with this legacy web surface quarantined and the remaining CodeQL scan green. Any future activation of the legacy web server is blocked until remediation and security review are complete.
