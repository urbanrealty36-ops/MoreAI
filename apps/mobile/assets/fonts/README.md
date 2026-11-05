# MoreAI brand font assets

The Web, Admin, Partner Portal, Captive Portal and Native Expo surfaces use the same pinned font binaries as the immutable MoreAI UI reference:

- Plus Jakarta Sans — Google Fonts Git blob `0cb13a998ed525ba226d911b10d6c4c4f923a961` (176,288 bytes)
- JetBrains Mono — Google Fonts Git blob `aa310be8b717fe3774f9444dd89d5f4101cc6d10` (187,208 bytes)

The font binaries are downloaded by `scripts/download-fonts.mjs` from immutable Google Fonts revision `fbe81817505e8aeadc53cc7a38a2b76fb57c333e`. The script verifies the upstream Git blob SHA-1 and byte size before writing the local TTF files. The generated binaries are ignored by Git; the reproducible downloader and pinned provenance are committed.

Next.js loads the local font files with `next/font/local`; Expo loads the same files with `expo-font` and bundles them through Metro. The build does not need a live Google Fonts request, and native apps do not need a network connection to render these fonts after installation.

Both font families are distributed under SIL Open Font License 1.1. Complete license and copyright notices are in `OFL.txt`.
