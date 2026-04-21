import { PersonaCode } from '@/src/engine/types';

export const TYPE_SCALE = {
  headingLg: 34,
  headingMd: 20,
  title: 18,
  body: 14,
  caption: 12,
} as const;

export const TYPE_HEADING_LG = TYPE_SCALE.headingLg;
export const TYPE_HEADING_MD = TYPE_SCALE.headingMd;
export const TYPE_TITLE = TYPE_SCALE.title;
export const TYPE_BODY = TYPE_SCALE.body;
export const TYPE_CAPTION = TYPE_SCALE.caption;

export const SPA_IVORY = '#F5F0E8';
export const SPA_IVORY_SOFT = '#EDE5D8';
export const SPA_STONE = '#CFC4B3';
export const SPA_STONE_MUTED = '#9F9486';
export const SPA_NAVY = '#1A2430';
export const SPA_NAVY_DEEP = '#0E171F';
export const SPA_NAVY_MID = '#24323E';
export const SPA_MIST = '#D8DDE0';

export const V2_BG_BASE = '#101920';
export const V2_BG_TOP = '#1A252E';
export const V2_BG_BOTTOM = '#0A1117';
export const V2_BG_OVERLAY = 'rgba(8, 11, 14, 0.42)';

export const V2_SURFACE = 'rgba(23, 33, 42, 0.88)';
export const V2_SURFACE_ELEVATED = 'rgba(28, 39, 49, 0.94)';
export const V2_SURFACE_DEEP = 'rgba(7, 12, 20, 0.96)';
export const V2_SURFACE_SOFT = 'rgba(19, 28, 36, 0.76)';
export const V2_SURFACE_GHOST = 'rgba(255,255,255,0.08)';
export const V2_BORDER = 'rgba(245, 240, 232, 0.12)';
export const V2_BORDER_STRONG = 'rgba(176, 141, 87, 0.38)';
export const V2_SHADOW = 'rgba(3, 5, 8, 0.42)';
export const V2_MODAL_SURFACE = '#17212B';
export const V2_MODAL_SURFACE_ELEVATED = 'rgba(23, 33, 43, 0.98)';
export const V2_MODAL_SURFACE_SUBTLE = '#1B2731';
export const V2_MODAL_HANDLE = 'rgba(245,240,232,0.28)';

export const V2_TEXT_PRIMARY = '#F5F0E8';
export const V2_TEXT_SECONDARY = '#D7CCBC';
export const V2_TEXT_MUTED = '#9E9488';

export const V2_ACCENT = '#B08D57';
export const V2_ACCENT_SOFT = 'rgba(176, 141, 87, 0.14)';
export const V2_ACCENT_TEXT = '#1A2430';
export const V2_WARNING = '#CAA071';
export const V2_DANGER = '#C28676';

export const V2_PILL_BG = 'rgba(255,255,255,0.06)';
export const V2_PILL_BORDER = V2_BORDER;
export const V2_PILL_ACTIVE_BG = 'rgba(176, 141, 87, 0.16)';

export const PERSONA_COLORS: Record<PersonaCode, string> = {
  P1_SAFETY: '#7FAE97',
  P2_CIRCULATION: '#C08D60',
  P3_MUSCLE: '#6E93C0',
  P4_SLEEP: '#8F80C7',
} as const;

export const PERSONA_GRADIENTS: Record<PersonaCode, [string, string]> = {
  P1_SAFETY: ['#132822', '#295345'],
  P2_CIRCULATION: ['#2A1D15', '#6D4D35'],
  P3_MUSCLE: ['#142436', '#36597A'],
  P4_SLEEP: ['#1A1730', '#4C427A'],
} as const;

export const CATEGORY_CARD_COLORS: Record<string, string> = {
  muscle_relief: '#547A67',
  sleep_ready: '#62598F',
  hangover_relief: '#A8764E',
  edema_relief: '#4F7892',
  cold_relief: '#4A7288',
  menstrual_relief: '#9C6472',
  stress_relief: '#6A8660',
  mood_lift: '#9D8650',
  kyoto_forest: '#476B55',
  nordic_sauna: '#8A6A4A',
  rainy_camping: '#496984',
  snow_cabin: '#5A7084',
} as const;

export const CATEGORY_CARD_EMOJI: Record<string, string> = {
  muscle_relief: 'MU',
  sleep_ready: 'SL',
  hangover_relief: 'HG',
  edema_relief: 'ED',
  cold_relief: 'CL',
  menstrual_relief: 'MN',
  stress_relief: 'ST',
  mood_lift: 'ML',
  kyoto_forest: 'KY',
  nordic_sauna: 'ND',
  rainy_camping: 'RN',
  snow_cabin: 'SN',
};
