import tokenSource from "../tokens.json";

export const designTokens = tokenSource;

export const webTheme = {
  colors: designTokens.colors,
  typography: designTokens.typography,
  spacing: designTokens.spacing,
  radius: designTokens.radius,
  border: designTokens.border,
  shadow: designTokens.shadow,
  motion: designTokens.motion,
} as const;

/**
 * Native tokens intentionally expose numeric layout values separately from
 * source font metadata. The reference contains web font loading but no
 * bundled native font files; native font loading is not falsely simulated.
 */
export const nativeTheme = {
  colors: {
    ...designTokens.colors.core,
    accent: designTokens.colors.accent,
    semantic: designTokens.colors.semantic,
    dark: designTokens.colors.dark,
  },
  typography: {
    sourceFontFamily: designTokens.typography.fontFamily,
    fontFamily: {
      sans: "MoreAIPlusJakartaSans",
      mono: "MoreAIJetBrainsMono",
    },
    size: designTokens.typography.scale,
    weight: designTokens.typography.weight,
  },
  spacing: designTokens.spacing,
  radius: designTokens.radius,
  border: designTokens.border,
  motion: designTokens.motion,
  interaction: designTokens.interaction,
} as const;

export type MoreAIDesignTokens = typeof designTokens;
export type MoreAINativeTheme = typeof nativeTheme;
