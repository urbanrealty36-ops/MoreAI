# Phase 01 — Monorepo Foundation

- pnpm/Turborepo owns TypeScript apps and packages; uv owns API, worker and sandbox.
- FastAPI is the only business API boundary. Supabase client SDK is reserved for approved Auth flows.
- Canonical Supabase project: uunfgimtokhucegqbpce. This phase only configures local CLI; no remote schema changes.
- API, worker and sandbox are isolated processes; sandbox must not execute inside API.
- Client-safe env: app origins, API URL, Supabase URL and publishable key (Auth only). Server-only: secret/database credentials, JWT and LLM provider keys.
- FastAPI OpenAPI: /openapi.json, docs: /docs. No business endpoints invented.
- No production mock data, UI migration, redesign, business migrations or deployment in this phase.
