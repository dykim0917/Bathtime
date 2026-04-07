import { Platform } from 'react-native';

export const luxuryFonts = {
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, Times New Roman, serif',
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
  card: 24,
  cardLg: 30,
  button: 18,
  pill: 999,
} as const;

export const luxurySpacing = {
  section: 24,
  block: 18,
  compact: 10,
} as const;

export const luxuryTracking = {
  eyebrow: 1.4,
  label: 0.6,
  hero: 0.2,
} as const;
