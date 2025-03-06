import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Color palette based on theming.md
export const colors = {
  // Primary colors
  primary: '#6C63FF',
  secondary: '#3ABFF8',
  accent: '#36D399',
  
  // Background colors
  backgroundDark: '#0F172A',
  backgroundMedium: '#1E293B',
  backgroundLight: '#334155',
  
  // Text colors
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Status colors
  success: '#36D399',
  warning: '#FBBD23',
  error: '#F87272',
  info: '#3ABFF8',
};

// Spacing based on 8-point grid system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Typography
export const typography = {
  fontFamily: {
    regular: 'System',  // Will use Inter when added to the project
    monospace: 'monospace',  // Will use Fira Code when added
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Animation timing
export const timing = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
  stagger: 50,
};

// Component styling
export const components = {
  card: {
    borderRadius: 16,
    padding: spacing.lg,
    elevation: 4,
  },
  button: {
    height: 48,
    borderRadius: 12,
    compactHeight: 40,
  },
  input: {
    height: 56,
    borderRadius: 12,
  },
};

// Main theme object that extends React Native Paper's theme
export const theme: MD3Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.accent,
    background: colors.backgroundDark,
    surface: colors.backgroundMedium,
    surfaceVariant: colors.backgroundLight,
    error: colors.error,
    onPrimary: colors.textPrimary,
    onSecondary: colors.textPrimary,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onError: colors.textPrimary,
    // Override other react-native-paper colors as needed
  },
  fonts: {
    ...DefaultTheme.fonts,
    // Will customize when we add custom fonts
  },
  // Add other theme properties as needed
};

// Export a shadowGenerator function to create consistent shadows
export const createShadow = (elevation: number, color = 'rgba(108, 99, 255, 0.5)') => {
  return {
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.2 + elevation * 0.02,
    shadowRadius: elevation * 0.8,
    elevation: elevation,
  };
};

// Export animations timing functions
export const animationPresets = {
  spring: {
    damping: 10,
    stiffness: 100,
    mass: 1,
  },
  timing: {
    duration: timing.normal,
    easing: 'bezier(0.2, 0.0, 0.0, 1.0)',
  },
  slow: {
    duration: timing.slow,
    easing: 'bezier(0.2, 0.0, 0.0, 1.0)',
  },
};