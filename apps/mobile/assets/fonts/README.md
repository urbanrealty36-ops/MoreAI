# MoreAI native font assets

The native theme uses the same font families as the pinned MoreAI UI reference:

- Plus Jakarta Sans — Google Fonts upstream blob `0cb13a998ed525ba226d911b10d6c4c4f923a961`
- JetBrains Mono — Google Fonts upstream blob `aa310be8b717fe3774f9444dd89d5f4101cc6d10`

The Expo app loads the variable TTF files from the immutable Google Fonts repository revision `fbe81817505e8aeadc53cc7a38a2b76fb57c333e` using `expo-font`. This keeps the native family/weight contract aligned with the source reference without copying or modifying the font software.

**Runtime note:** first launch requires network access to fetch the two font files. If loading fails, the app renders with the platform system-font fallback rather than blocking the app. Offline-first bundling of the font binaries remains a packaging improvement and is not claimed as completed here.

Both font families are distributed under SIL Open Font License 1.1. The complete license and copyright notices are in `OFL.txt`.
