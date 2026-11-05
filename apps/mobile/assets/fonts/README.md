# MoreAI native font assets

The native theme uses the same font families as the pinned MoreAI UI reference:

- Plus Jakarta Sans — Google Fonts Git blob `0cb13a998ed525ba226d911b10d6c4c4f923a961` (176,288 bytes)
- JetBrains Mono — Google Fonts Git blob `aa310be8b717fe3774f9444dd89d5f4101cc6d10` (187,208 bytes)

The font binaries are downloaded at build/development startup by `scripts/download-fonts.mjs` from immutable Google Fonts revision `fbe81817505e8aeadc53cc7a38a2b76fb57c333e`. The script verifies the upstream Git blob SHA-1 and byte size before writing the local TTF files. The generated binaries are ignored by Git; the reproducible downloader and pinned provenance are committed.

The TTF files are bundled into the native app by Expo Metro, so the app does not need a network connection to render these fonts after the build. If a font cannot be loaded, the root layout renders the app with the platform fallback rather than blocking startup.

Both font families are distributed under SIL Open Font License 1.1. Complete license and copyright notices are in `OFL.txt`.
