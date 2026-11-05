# Phase 03 — Design System & UI Foundations

**Status:** IN PROGRESS — shared design-token foundation implemented; visual regression and cross-platform acceptance remain open.  
**Branch:** `main`  
**Phase 02 merge:** `407a3cbe1a9b5dbafbb14536ab0930f2271e0626` (PR #9).  
**Scope authority:** Master PRD §16 and official Phase Implementation Plan §6, Phase 03; root `AGENTS.md`.

## 1. Source of truth

- Immutable visual source: `vendor/reference-ui/app/globals.css`.
- Pinned UI source commit: `89bccc184dc8f2e6dac20627d5c7d50ef3e4a8f4`.
- Product design specification: `docs/MoreAI_Master_PRD_v1.0_ID.md`, §16.
- Where the PRD recommends a value that differs from the actual reference implementation, preserve the reference output and document the difference. No redesign or re-theme is authorized by this phase.

## 2. Implemented foundations

- `packages/design-tokens/tokens.json` is the canonical token source for core/accent/semantic/dark colors, typography metadata and scale, spacing, radius, border widths, source-compatible shadows, motion and interaction targets.
- `packages/design-tokens/src/index.ts` exports typed shared web and native theme objects.
- `packages/design-tokens/src/tokens.css` exposes CSS custom properties for the web surfaces.
- `packages/design-tokens/scripts/generate-css.mjs` generates the CSS from the canonical JSON and supports deterministic `--check`.
- `packages/design-tokens/test/tokens.test.mjs` validates the palette, layout scales, source-specific shadow measurements and CSS variable contract.
- Web, Admin, Partner Portal and Captive Portal global styles import the shared CSS tokens and consume the shared values for foundational typography, color, border, radius and shadow utilities.
- Native foundation imports the same TypeScript token source for layout, color and type-scale values. Expo uses `expo-font` with local TTF assets downloaded from a pinned Google Fonts revision by `apps/mobile/scripts/download-fonts.mjs`; the script verifies upstream Git blob SHA and byte size before bundling. Native fonts are available offline after the app is built.
- All four web surfaces include visible keyboard focus styling and a `prefers-reduced-motion` baseline. Browser zoom is enabled; source font families are restored through `next/font/google`.
- CI now includes a Playwright visual regression comparison against the immutable vendor reference in light/dark themes at all five required viewports, plus Axe WCAG 2.2 AA scans, overflow checks, keyboard focus, dark-token and reduced-motion checks. The test-only `/__visual` route is gated by `MOREAI_VISUAL_QA=1` and returns 404 otherwise.
- Token tests calculate WCAG AA contrast for semantic foreground/background pairs and core light/dark text surfaces.

## 3. Source fidelity decisions

The source reference uses a 3.5px hard card shadow and 3px button shadow. Master PRD §16 recommends a 4px card shadow. The implementation preserves the pinned source's 3.5px / 3px values to avoid visual drift. This is intentional, not an accidental token mismatch.

Existing source UI components and layouts are not replaced. This phase establishes shared tokens and styling foundations; it does not activate business workflows or promote preview/sample data.

## 4. Scope and boundaries

- No Supabase schema or RLS changes.
- No FastAPI endpoint or business-rule changes.
- No authentication, wallet, entitlement, partner CRUD, network verification, campaign or captive gateway activation.
- No new provider, payment or ISP integration.
- No production deployment or live/staging test.
- Immutable `vendor/` snapshots remain untouched.

## 5. Verification status

| Check | Status | Evidence |
|---|---|---|
| Phase 02 merged to main | PASS | Merge commit `407a3cbe1a9b5dbafbb14536ab0930f2271e0626` |
| Shared token source created | PASS | `packages/design-tokens/tokens.json` |
| Web/native token exports | PASS — source added | `packages/design-tokens/src/index.ts` |
| CSS generation/check | PENDING CI | `generate-css.mjs --check` wired into package build |
| Token contract and static contrast tests | PENDING CI | `test/tokens.test.mjs` |
| Web/Admin/Partner/Captive styles wired | PASS — source added | Four app `globals.css` files |
| Native token baseline wired | PASS — source added | `apps/mobile/app/index.tsx` |
| Lint/typecheck/build | PENDING CI | Must be verified on resulting main head |
| Light/dark screenshot comparison at 360/390/768/1024/1440 | PENDING CI | Playwright compares `ReferenceWorkspace` against immutable `vendor/reference-ui` and uploads source/target/diff artifacts |
| Static semantic contrast and reduced-motion CSS baseline | PASS — source added | Token tests and four global styles; CI pending |
| Automated Axe WCAG 2.2 AA browser audit | PENDING CI | 390px and 1440px scans for Web, Admin, Partner Portal and Captive Portal |
| Browser zoom, keyboard focus and reduced-motion checks | PENDING CI | Playwright browser checks across all four web surfaces |
| Touch target audit (44px PRD target) | PENDING CI | Browser report records all visible interactive targets under 44px for review |
| Native font asset parity | PENDING CI | Pinned TTF download verifies Git blob SHA/size; Expo Metro export bundles local fonts |

## 6. Remaining Phase 03 acceptance work

1. Confirm CI passes on the final main commit, including token CSS deterministic check and token contract tests.
2. Run screenshot/visual regression for all four web surfaces at 360, 390, 768, 1024 and 1440 px against the pinned reference; investigate every unintended difference.
3. Validate focus, contrast, labels, touch targets and reduced-motion behavior against WCAG 2.2 AA; resolve every Axe violation and every 44px touch-target exception or document an approved source-preserving exception.
4. Confirm Expo/Metro resolves the shared token module and local licensed font assets in a clean install/export.
5. Update this report and Master Continuation Context with final evidence before marking Phase 03 Passed.

## 7. Next phase

**Phase 04 — Identity & Access** is the next official phase in the canonical roadmap, but it must not start until Phase 03's visual, accessibility, native baseline and CI gates are accepted. No Phase 04 work is included in this commit series.
