# Local development

1. Install Node.js 22+, enable Corepack, and activate pnpm 10.20.0.
2. Install Python 3.12+ and uv.
3. Copy `.env.example` to `.env`; use only non-production credentials locally.
4. Run `pnpm install` and `uv sync --all-packages --all-extras`.
5. Start API with `uv run --directory apps/api uvicorn moreai_api.main:app --reload --port 8000`.
6. Start client apps individually with `pnpm --filter @moreai/web dev` (or the matching workspace name).

Do not expose Supabase service-role keys or provider credentials to client apps. No production DB schema changes are part of Phase 01.
