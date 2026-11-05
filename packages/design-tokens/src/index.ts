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
 * Platform-neutral React Native theme values.
 * Native components apply platform-specific elevation and shadow rendering.
 */
export const nativeTheme = {
  colors: {
    ...designTokens.colors.core,
    accent: designTokens.colors.accent,
    semantic: designTokens.colors.semantic,
    dark: designTokens.colors.dark,
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily,
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
