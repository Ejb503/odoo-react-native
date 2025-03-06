import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const colors = {
  primary: '#4c5a67',
  accent: '#714b67',
  background: '#ffffff',
  surface: '#f7f7f7',
  text: '#2b2b2b',
  error: '#d9534f',
  success: '#5cb85c',
  warning: '#f0ad4e',
  info: '#5bc0de',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
  },
};