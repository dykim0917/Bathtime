import { Platform } from 'react-native';

export const luxuryFonts = {
  display: Platform.select({
    web: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  }),
} as const;

export const luxuryRadii = {
  card: 12,
  cardLg: 16,
  button: 14,
  pill: 999,
} as const;

export const luxurySpacing = {
  section: 24,
  block: 18,
  compact: 10,
} as const;

export const luxuryTracking = {
  eyebrow: 0,
  label: 0,
  hero: 0,
} as const;
