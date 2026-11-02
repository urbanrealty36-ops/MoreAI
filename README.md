# MoreAI

MoreAI is an AI workspace and agent platform with Web PWA, Native Expo, Super Admin, Partner Portal, Captive Portal, FastAPI, worker and isolated sandbox.

## Workspace

- Node.js 22+, pnpm 10.20.0, Turborepo
- Python 3.12+, uv workspace
- Supabase PostgreSQL is the canonical database; no alternate database is introduced.
- All business operations are routed through FastAPI. Supabase Auth SDK is the only client-side exception for approved auth flows.

## Applications

| Path | Purpose | Local port |
|---|---|---:|
| `apps/web` | Customer Web PWA | 3000 |
| `apps/admin` | Super Admin | 3001 |
| `apps/partner-portal` | Partner operations | 3002 |
| `apps/captive-portal` | Shared multi-tenant captive portal | 3003 |
| `apps/mobile` | React Native + Expo | Expo |
| `apps/api` | FastAPI business API | 8000 |
| `apps/worker` | Background jobs | n/a |
| `apps/sandbox` | Isolated execution boundary | n/a |

## Commands

```bash
corepack enable
pnpm install
pnpm dev
pnpm lint && pnpm typecheck && pnpm test && pnpm build
uv sync --all-packages --all-extras
uv run ruff check apps
uv run pytest
```

Copy `.env.example` to `.env` and populate server secrets in the deployment secret manager. Never expose service-role, JWT, LLM or provider credentials in client variables.

## Phase status

Phase 01 foundation is under implementation. The app shells here are bootstrap entrypoints, not production feature implementations. See `docs/architecture/PHASE-01-FOUNDATION.md` and the Phase Plan for scope and gates.
