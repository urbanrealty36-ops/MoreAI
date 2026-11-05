# ADR-0006 — MoreAI Shared Design Token Source of Truth

- Status: Accepted for Phase 03 foundation.
- Date: 5 November 2026.
- Scope: shared token data and CSS/native theme exports only; no approved visual redesign.

## Context

The MoreAI Master PRD §16 defines the brand palette, semantic colors, typography, spacing, radius, borders, shadows, motion and cross-platform token architecture. The pinned UI source at `vendor/reference-ui/app/globals.css` contains the actual rendered baseline values. Before this decision, `packages/design-tokens/src/index.ts` was only a placeholder and each active web app carried a copy of the source CSS.

## Decision

1. `packages/design-tokens/tokens.json` is the canonical token data source.
2. `packages/design-tokens/src/tokens.css` is generated from that JSON by `scripts/generate-css.mjs`; package build runs the deterministic `--check`.
3. `packages/design-tokens/src/index.ts` exports shared typed web and native theme values.
4. Web, Admin, Partner Portal and Captive Portal consume the generated CSS custom properties. Native consumes the shared TypeScript theme values.
5. Preserve the pinned UI source's computed visual output. If a PRD recommended value differs from a source value, the source value takes precedence for visual fidelity and the difference is documented.
6. Do not replace source components or introduce a second component visual system in this foundation phase.
7. Native platform font loading is not fabricated. Source font metadata remains in the token contract; native font assets/loading require a separately verified asset and runtime plan.

## Fidelity note

Master PRD §16 recommends a 4px hard card shadow. The pinned UI source uses 3.5px for cards and 3px for buttons. The token set preserves the source measurements to avoid unapproved visual drift.

## Consequences

- Shared semantic values are available to all clients from one token source.
- CSS token drift is caught by the package build's deterministic check.
- Native and web layouts share numeric scales while retaining platform-specific rendering.
- Screenshot comparison, accessibility verification and native font strategy remain acceptance gates; this ADR does not claim those checks have passed.
