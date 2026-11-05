# ADR-0008 — Expo SDK 54 Metro Runtime Compatibility

- Status: Accepted for Phase 03.
- Date: 5 November 2026.
- Scope: mobile bundler dependency alignment and an explicit runtime dependency required by Expo Router.
- Authorization: implementation of the Phase 03 Android/iOS Expo Metro acceptance gate under the project owner's instruction to fix every failing acceptance gate.

## Context

The hosted runtime smoke test showed two independent bundling failures:

1. Metro 0.83.3 passed an asset path string into `image-size@2.0.4`. The latter expects binary input, so the BMP dimension parser called `TextDecoder.decode` with an unsupported argument and aborted while processing the Expo Router asset.
2. `@react-navigation/elements` imports the optional peer `@react-native-masked-view/masked-view`, but the mobile workspace did not install that peer, so Metro could not resolve it.

Node 22 is the repository's declared runtime and was already selected in CI; changing Node alone did not correct either dependency-graph defect.

## Decision

1. Align the complete 14-package Metro cohort to upstream `0.83.8` through workspace overrides. Do not mix Metro patch versions.
2. Use the upstream Metro 0.83.8 asset-dimension implementation, which removes the incompatible `image-size` parser from the Metro dependency graph. Keep the existing security override policy; do not downgrade `image-size` to an older vulnerable release.
3. Add `@react-native-masked-view/masked-view@0.3.2` as a direct mobile dependency. This is the version listed by Expo SDK 54's `bundledNativeModules.json`.
4. Add `scripts/check-metro-runtime.mjs` to verify all 14 Metro packages resolve only to 0.83.8, the Expo Metro snapshot is aligned, `image-size` is absent from the lock graph, and the mobile masked-view dependency is present.
5. Keep Android and iOS `expo export` as local CI bundle checks. This does not authorize an EAS build, native device test, staging deployment, or production deployment.

## Consequences

- The Metro image-size/TextDecoder incompatibility is removed at its upstream source rather than hidden or bypassed.
- Expo Router's optional masked-view import is resolvable from the mobile workspace.
- The lockfile guard prevents a future partial Metro downgrade or reintroduction of the vulnerable parser into the mobile bundle graph.
- Phase 03 remains In Progress until both Android and iOS exports succeed and the full browser QA evidence is inspected.

## Rollback

Do not roll back to Metro 0.83.3 while retaining the `image-size@2.0.4` override. If the Metro cohort must change, select and validate one complete upstream Metro cohort, regenerate the lockfile, update the guard and rerun both Expo platform exports.
