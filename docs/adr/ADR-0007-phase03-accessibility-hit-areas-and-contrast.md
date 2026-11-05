# ADR-0007 — Phase 03 Accessibility Hit Areas and Contrast

- Status: Accepted for Phase 03.
- Date: 5 November 2026.
- Scope: narrow WCAG 2.2 AA and 44×44px interaction corrections in the migrated app surfaces.
- Authorization: the project owner explicitly instructed the implementation to fix every Phase 03 acceptance failure and to complete the browser, accessibility and native gates (conversation instruction, 5 November 2026).

## Context

The immutable UI source is the visual authority under ADR-0006 and root `AGENTS.md`. The first hosted Phase 03 browser QA run nevertheless identified concrete acceptance failures: visible controls below the PRD's 44×44px mobile target, small semantic text with insufficient contrast, and narrow-screen horizontal overflow. The PRD §16 requires accessibility, responsive behavior and mobile target sizing. The source UI's small controls cannot meet the 44px interaction target through visual resizing without introducing wider visual drift.

## Decision

1. Preserve `vendor/reference-ui/` byte-for-byte. Do not replace source components or re-theme the product.
2. Add transparent 44×44px pointer hit areas to mobile buttons, links, role-buttons and summaries. Verify the actual browser hit-testing at the expanded target's corners and center; a computed CSS size alone is not sufficient evidence.
3. Preserve visible control dimensions. Where two 32px icon targets would overlap after expansion, introduce the minimum 6px mobile separation needed to keep their 44px hit areas independently actionable. Desktop spacing is unchanged. On narrow mobile headers, compact the two status pills and spacing; hide only the greeting text at widths of 380px or less so all controls remain within the available frame.
4. Make the mobile composer input a 44px target while reducing its wrapper's vertical padding so the outer composer geometry remains source-compatible. Associate captive consent input with a 44px label target.
5. Add a high-contrast success foreground token (`#14532D`) for small semantic text on light accent surfaces. Keep the existing semantic success foreground (`#217A50`) unchanged for its defined token pair. Use the canonical muted token for secondary text; use the dark theme's text/muted tokens in dark mode.
6. Constrain horizontal navigation scrollers and provide vertical hit-area room within their scroll clip. Preserve the original visible button position and outer flow height where possible. The responsive header adjustment is limited to the mobile breakpoint and is normalized in the source screenshot comparison.
7. Run Axe WCAG 2.2 AA in both light and dark themes at mobile and desktop viewports. Run full keyboard traversal and verify a visible focus indicator on each focus stop.
8. Normalize only the documented accessibility changes in the source-side screenshot harness (same pinned local font assets, semantic contrast, and mobile hit-area spacing). Do not lower the existing 1% visual-diff threshold or suppress screenshots. The immutable vendor snapshot remains unchanged.
9. The changes apply only to Phase 03 UI foundations. They do not activate business flows or authorize API, Supabase, payment, gateway, ISP, staging or production changes.

## Consequences

- Mobile controls retain their original visual size while exposing a real, independently hit-testable 44×44px target.
- Small success and secondary text use contrast-safe tokens; semantic status remains identifiable through text/icon, not color alone.
- The source screenshot comparison excludes only the approved accessibility token/layout normalization; all remaining visual drift continues to fail the original threshold.
- Phase 03 remains In Progress until the complete hosted CI run, browser screenshots/report, Axe, keyboard, responsive, reduced-motion, and Android/iOS Expo Metro evidence all pass.
- Phase 04 remains blocked until Phase 03 is formally accepted and its report/context documents are updated.

## Rollback

If the product owner later changes the 44px or contrast requirements, revert the mobile hit-area/spacing rules and the high-contrast token as one reviewed change, then rerun the full Phase 03 visual/accessibility suite. Do not roll back only the QA assertion while leaving the interaction behavior unverified.
