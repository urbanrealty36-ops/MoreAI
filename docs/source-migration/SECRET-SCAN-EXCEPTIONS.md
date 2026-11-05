# Phase 02 secret-scan exceptions

This file documents narrow, fingerprint-specific Gitleaks exceptions. No whole file, directory, or rule is globally ignored.

## Expired upstream demo-video JWT

- Source: OpenManusWeb upstream commit `3ceaa9182b39bbb9898ddda0a4b1c50c2758ab5f`, `README.md:32` and `README_zh.md:32`.
- Purpose: signed GitHub raw-content URL for the public demo MP4 embedded in the upstream README.
- Decoded JWT header: `HS256`.
- Decoded claims: issuer `github.com`, audience `raw.githubusercontent.com`, `nbf=1741317759`, `exp=1741318059` (expired 7 March 2025 UTC).
- The token is expired and is not an API key or signing secret. It is retained unchanged to preserve the exact upstream source snapshot.
- Fingerprints are ignored only for these two README lines in the source-migration commit.

## Git object IDs flagged as generic API keys

The remaining generic-api-key findings are 40-character Git blob SHA values in the file-level source-to-target manifest and a Git commit SHA in the report. They are public content-addressed identifiers, not credentials. Their fingerprints are ignored individually; the values remain necessary for source provenance and integrity verification.

## Review rule

If an upstream snapshot is refreshed, re-evaluate every new Gitleaks finding. Do not extend these exceptions to new tokens, API keys, credentials, or other files without verifying the exact value and documenting its origin and expiry.
