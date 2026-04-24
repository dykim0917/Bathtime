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

export const SPA_IVORY = '#F7F3EA';
export const SPA_IVORY_SOFT = '#EAE4D6';
export const SPA_STONE = '#C8D7D0';
export const SPA_STONE_MUTED = '#93A7A1';
export const SPA_NAVY = '#153236';
export const SPA_NAVY_DEEP = '#0B1F22';
export const SPA_NAVY_MID = '#21464A';
export const SPA_MIST = '#D9ECE6';

export const V2_BG_BASE = '#102629';
export const V2_BG_TOP = '#193A3E';
export const V2_BG_BOTTOM = '#07191B';
export const V2_BG_OVERLAY = 'rgba(5, 18, 20, 0.42)';

export const V2_SURFACE = 'rgba(22, 45, 48, 0.9)';
export const V2_SURFACE_ELEVATED = 'rgba(28, 55, 58, 0.94)';
export const V2_SURFACE_DEEP = 'rgba(6, 22, 24, 0.96)';
export const V2_SURFACE_SOFT = 'rgba(18, 39, 42, 0.76)';
export const V2_SURFACE_GHOST = 'rgba(255,255,255,0.08)';
export const V2_BORDER = 'rgba(230, 246, 239, 0.14)';
export const V2_BORDER_STRONG = 'rgba(148, 210, 191, 0.42)';
export const V2_SHADOW = 'rgba(3, 12, 14, 0.36)';
export const V2_MODAL_SURFACE = '#18363A';
export const V2_MODAL_SURFACE_ELEVATED = 'rgba(22, 47, 51, 0.98)';
export const V2_MODAL_SURFACE_SUBTLE = '#1E4448';
export const V2_MODAL_HANDLE = 'rgba(230,246,239,0.3)';

export const V2_TEXT_PRIMARY = '#F7F3EA';
export const V2_TEXT_SECONDARY = '#D7E1DC';
export const V2_TEXT_MUTED = '#9FB5AF';

export const V2_ACCENT = '#94D2BF';
export const V2_ACCENT_SOFT = 'rgba(148, 210, 191, 0.16)';
export const V2_ACCENT_TEXT = '#0D292B';
export const V2_WARNING = '#D7B873';
export const V2_DANGER = '#C28676';

export const V2_PILL_BG = 'rgba(255,255,255,0.06)';
export const V2_PILL_BORDER = V2_BORDER;
export const V2_PILL_ACTIVE_BG = 'rgba(148, 210, 191, 0.18)';

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
