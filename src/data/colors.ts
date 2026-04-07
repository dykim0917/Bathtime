import { PersonaCode } from '@/src/engine/types';

// === v3.2 Reference UI Palette ===
export const APP_BG_BASE = '#F6FAFF';
export const APP_BG_TOP = '#F2F7FF';
export const APP_BG_BOTTOM = '#F8EFF6';
export const APP_BLOOM_BLUE = 'rgba(120, 149, 207, 0.25)';
export const APP_BLOOM_PINK = 'rgba(248, 208, 208, 0.22)';

// === Cards / Surfaces ===
export const CARD_SURFACE = 'rgba(255,255,255,0.82)';
export const CARD_SURFACE_SOFT = 'rgba(255,255,255,0.74)';
export const CARD_BORDER = 'rgba(150, 170, 205, 0.28)';
export const CARD_BORDER_STRONG = 'rgba(103, 133, 184, 0.42)';
export const CARD_SHADOW = 'rgba(39, 62, 102, 0.12)';
export const MODAL_SURFACE = '#FFFFFF';
export const MODAL_SUB_SURFACE = '#F7F9FC';
export const MODAL_ACCENT_SURFACE = '#EAF1FF';

// === Typography scale ===
export const TYPE_HEADING_LG = 30;
export const TYPE_HEADING_MD = 22;
export const TYPE_TITLE = 18;
export const TYPE_BODY = 14;
export const TYPE_CAPTION = 12;

export const TYPE_SCALE = {
  headingLg: TYPE_HEADING_LG,
  headingMd: TYPE_HEADING_MD,
  title: TYPE_TITLE,
  body: TYPE_BODY,
  caption: TYPE_CAPTION,
} as const;

// === Text ===
export const TEXT_PRIMARY = '#2A3E64';
export const TEXT_SECONDARY = '#617493';
export const TEXT_MUTED = '#8FA0BA';

// === Controls ===
export const BTN_PRIMARY = '#7895CF';
export const BTN_PRIMARY_TEXT = '#FDFEFF';
export const BTN_DISABLED = '#C8D4EA';
export const PILL_BG = 'rgba(255,255,255,0.78)';
export const PILL_BORDER = 'rgba(120,149,207,0.35)';
export const PILL_ACTIVE_BG = '#E6EEFB';

// === Accent / Semantic ===
export const ACCENT = '#7895CF';
export const ACCENT_LIGHT = '#ECF1FC';
export const WARNING_COLOR = '#F0A55C';
export const DANGER_COLOR = '#E96F7F';

// === Figma Style Guide v2 (Deep Navy / Gold / Glass) ===
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
export const V2_SURFACE_SOFT = 'rgba(19, 28, 36, 0.76)';
export const V2_BORDER = 'rgba(245, 240, 232, 0.12)';
export const V2_BORDER_STRONG = 'rgba(176, 141, 87, 0.38)';
export const V2_SHADOW = 'rgba(3, 5, 8, 0.42)';
export const V2_MODAL_SURFACE = '#17212B';

export const V2_TEXT_PRIMARY = '#F5F0E8';
export const V2_TEXT_SECONDARY = '#D7CCBC';
export const V2_TEXT_MUTED = '#9E9488';

export const V2_ACCENT = '#B08D57';
export const V2_ACCENT_SOFT = 'rgba(176, 141, 87, 0.14)';
export const V2_ACCENT_TEXT = '#1A2430';
export const V2_WARNING = '#CAA071';
export const V2_DANGER = '#C28676';

// === Persona Colors (Pastel compatible) ===
export const PERSONA_COLORS: Record<PersonaCode, string> = {
  P1_SAFETY: '#8CB59C',
  P2_CIRCULATION: '#D6A77A',
  P3_MUSCLE: '#7FA0D8',
  P4_SLEEP: '#A89DDB',
} as const;

export const PERSONA_GRADIENTS: Record<PersonaCode, [string, string]> = {
  P1_SAFETY: ['#D8ECDE', '#A4C9B1'],
  P2_CIRCULATION: ['#F0D5BC', '#D7AD85'],
  P3_MUSCLE: ['#DCE6F8', '#9AB5E5'],
  P4_SLEEP: ['#E8E1F9', '#B9ACE6'],
} as const;

// === Category Card Colors (intent_id → soft pastel background) ===
export const CATEGORY_CARD_COLORS: Record<string, string> = {
  // Care routines
  muscle_relief:   '#B5D5C0',   // soft green — recovery, muscle
  sleep_ready:     '#C5BEED',   // soft lavender — sleep, calm
  hangover_relief: '#F5C5A3',   // soft peach — reset, warmth
  edema_relief:    '#AECDE0',   // soft blue — circulation, water
  // Care routines (extended)
  cold_relief:     '#B8D9E8',   // cool mint-blue — 감기, 해열
  menstrual_relief:'#F0C5CC',   // warm rose — 생리통, 온기
  stress_relief:   '#C5D9B8',   // calm sage green — 스트레스, 이완
  mood_lift:       '#F5E5A3',   // warm yellow — 기분, 활력
  // Trip routines
  kyoto_forest:    '#A8C5A0',   // muted forest green
  nordic_sauna:    '#D9C4A5',   // warm sandy beige
  rainy_camping:   '#9DBBC8',   // steel blue
  snow_cabin:      '#B8C5D8',   // icy blue-grey
};

export const CATEGORY_CARD_EMOJI: Record<string, string> = {
  muscle_relief:   '💪',
  sleep_ready:     '🌙',
  hangover_relief: '✨',
  edema_relief:    '💧',
  cold_relief:     '🤧',
  menstrual_relief:'🌸',
  stress_relief:   '🍃',
  mood_lift:       '☀️',
  kyoto_forest:    '🌿',
  nordic_sauna:    '🔥',
  rainy_camping:   '🌧️',
  snow_cabin:      '❄️',
};

// === Compatibility aliases (keep old imports stable) ===
export const BG = APP_BG_BASE;
export const SURFACE = CARD_SURFACE;
export const GLASS_BORDER = CARD_BORDER;
export const GLASS_SHADOW = CARD_SHADOW;
export const OVERLAY = CARD_SURFACE_SOFT;

export const CARD_GLASS = CARD_SURFACE;
export const CARD_BORDER_SOFT = CARD_BORDER;
export const CARD_SHADOW_SOFT = CARD_SHADOW;

export const PASTEL_BG_TOP = APP_BG_TOP;
export const PASTEL_BG_BOTTOM = APP_BG_BOTTOM;
export const PASTEL_BLOOM_BLUE = APP_BLOOM_BLUE;
export const PASTEL_BLOOM_PINK = APP_BLOOM_PINK;

export const DARK_BG = APP_BG_BASE;
export const DARK_SURFACE = CARD_SURFACE;
export const DARK_CARD = CARD_SURFACE;
