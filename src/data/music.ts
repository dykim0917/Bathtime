import { MusicTrack, AmbienceTrack, PersonaCode, ThemeId } from '@/src/engine/types';

// Audio assets - require() calls must remain static for Metro bundler.
// These generated placeholder loops can be swapped later with mastered production files
// as long as the filenames/keys stay the same.
export const AUDIO_ASSETS: Record<string, any> = {
  care_muscle_relief: require('../../assets/audio/care/care_muscle_relief.m4a'),
  care_sleep_ready: require('../../assets/audio/care/care_sleep_ready.m4a'),
  care_hangover_relief: require('../../assets/audio/care/care_hangover_relief.m4a'),
  care_edema_relief: require('../../assets/audio/care/care_edema_relief.m4a'),
  care_cold_relief: require('../../assets/audio/care/care_cold_relief.m4a'),
  care_menstrual_relief: require('../../assets/audio/care/care_menstrual_relief.m4a'),
  care_stress_relief: require('../../assets/audio/care/care_stress_relief.m4a'),
  care_mood_lift: require('../../assets/audio/care/care_mood_lift.m4a'),
  trip_kyoto_forest: require('../../assets/audio/trip/trip_kyoto_forest.m4a'),
  trip_rainy_camping: require('../../assets/audio/trip/trip_rainy_camping.m4a'),
  trip_midnight_paris: require('../../assets/audio/trip/trip_midnight_paris.m4a'),
  trip_nordic_sauna: require('../../assets/audio/trip/trip_nordic_sauna.m4a'),
  trip_desert_onsen: require('../../assets/audio/trip/trip_desert_onsen.m4a'),
  trip_ocean_dawn: require('../../assets/audio/trip/trip_ocean_dawn.m4a'),
  trip_tea_house: require('../../assets/audio/trip/trip_tea_house.m4a'),
  trip_snow_cabin: require('../../assets/audio/trip/trip_snow_cabin.m4a'),
  rain: require('../../assets/audio/ambience/rain.m4a'),
  ocean: require('../../assets/audio/ambience/ocean.m4a'),
  forest: require('../../assets/audio/ambience/forest.m4a'),
  hotspring: require('../../assets/audio/ambience/hotspring.m4a'),
  fireplace: require('../../assets/audio/ambience/fireplace.m4a'),
};

// --- Music (instrumental, persona-matched) ---
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'care_muscle_relief',
    title: '근육 케어 사운드',
    filename: 'care_muscle_relief',
    durationSeconds: 260,
    persona: ['P3_MUSCLE'],
  },
  {
    id: 'care_sleep_ready',
    title: '수면 준비 케어 사운드',
    filename: 'care_sleep_ready',
    durationSeconds: 300,
    persona: ['P4_SLEEP'],
  },
  {
    id: 'care_hangover_relief',
    title: '숙취 케어 사운드',
    filename: 'care_hangover_relief',
    durationSeconds: 220,
    persona: ['P1_SAFETY'],
  },
  {
    id: 'care_edema_relief',
    title: '붓기 케어 사운드',
    filename: 'care_edema_relief',
    durationSeconds: 250,
    persona: ['P2_CIRCULATION'],
  },
  {
    id: 'care_cold_relief',
    title: '냉감 케어 사운드',
    filename: 'care_cold_relief',
    durationSeconds: 250,
    persona: ['P2_CIRCULATION'],
  },
  {
    id: 'care_menstrual_relief',
    title: '생리통 케어 사운드',
    filename: 'care_menstrual_relief',
    durationSeconds: 270,
    persona: ['P2_CIRCULATION'],
  },
  {
    id: 'care_stress_relief',
    title: '스트레스 케어 사운드',
    filename: 'care_stress_relief',
    durationSeconds: 280,
    persona: ['P4_SLEEP'],
  },
  {
    id: 'care_mood_lift',
    title: '기분 전환 케어 사운드',
    filename: 'care_mood_lift',
    durationSeconds: 260,
    persona: ['P4_SLEEP'],
  },
  {
    id: 'trip_kyoto_forest',
    title: 'Kyoto Forest OST',
    filename: 'trip_kyoto_forest',
    durationSeconds: 240,
    persona: ['P1_SAFETY'],
  },
  {
    id: 'trip_rainy_camping',
    title: 'Rainy Camping OST',
    filename: 'trip_rainy_camping',
    durationSeconds: 240,
    persona: ['P4_SLEEP'],
  },
  {
    id: 'trip_midnight_paris',
    title: 'Midnight Paris OST',
    filename: 'trip_midnight_paris',
    durationSeconds: 260,
    persona: ['P4_SLEEP'],
  },
  {
    id: 'trip_nordic_sauna',
    title: 'Nordic Sauna OST',
    filename: 'trip_nordic_sauna',
    durationSeconds: 250,
    persona: ['P2_CIRCULATION'],
  },
  {
    id: 'trip_desert_onsen',
    title: 'Desert Onsen OST',
    filename: 'trip_desert_onsen',
    durationSeconds: 250,
    persona: ['P3_MUSCLE'],
  },
  {
    id: 'trip_ocean_dawn',
    title: 'Ocean Dawn OST',
    filename: 'trip_ocean_dawn',
    durationSeconds: 260,
    persona: ['P2_CIRCULATION'],
  },
  {
    id: 'trip_tea_house',
    title: 'Tea House OST',
    filename: 'trip_tea_house',
    durationSeconds: 245,
    persona: ['P4_SLEEP'],
  },
  {
    id: 'trip_snow_cabin',
    title: 'Snow Cabin OST',
    filename: 'trip_snow_cabin',
    durationSeconds: 255,
    persona: ['P1_SAFETY'],
  },
];

export const CARE_MUSIC_BY_INTENT_ID: Record<string, MusicTrack> = {
  muscle_relief: MUSIC_TRACKS.find((track) => track.id === 'care_muscle_relief')!,
  sleep_ready: MUSIC_TRACKS.find((track) => track.id === 'care_sleep_ready')!,
  hangover_relief: MUSIC_TRACKS.find((track) => track.id === 'care_hangover_relief')!,
  edema_relief: MUSIC_TRACKS.find((track) => track.id === 'care_edema_relief')!,
  cold_relief: MUSIC_TRACKS.find((track) => track.id === 'care_cold_relief')!,
  menstrual_relief: MUSIC_TRACKS.find((track) => track.id === 'care_menstrual_relief')!,
  stress_relief: MUSIC_TRACKS.find((track) => track.id === 'care_stress_relief')!,
  mood_lift: MUSIC_TRACKS.find((track) => track.id === 'care_mood_lift')!,
};

export const CARE_MUSIC_BY_PERSONA: Record<PersonaCode, MusicTrack> = {
  P1_SAFETY: CARE_MUSIC_BY_INTENT_ID.hangover_relief,
  P2_CIRCULATION: CARE_MUSIC_BY_INTENT_ID.edema_relief,
  P3_MUSCLE: CARE_MUSIC_BY_INTENT_ID.muscle_relief,
  P4_SLEEP: CARE_MUSIC_BY_INTENT_ID.sleep_ready,
};

export const TRIP_MUSIC_BY_THEME_ID: Record<ThemeId, MusicTrack> = {
  kyoto_forest: MUSIC_TRACKS.find((track) => track.id === 'trip_kyoto_forest')!,
  rainy_camping: MUSIC_TRACKS.find((track) => track.id === 'trip_rainy_camping')!,
  midnight_paris: MUSIC_TRACKS.find((track) => track.id === 'trip_midnight_paris')!,
  nordic_sauna: MUSIC_TRACKS.find((track) => track.id === 'trip_nordic_sauna')!,
  desert_onsen: MUSIC_TRACKS.find((track) => track.id === 'trip_desert_onsen')!,
  ocean_dawn: MUSIC_TRACKS.find((track) => track.id === 'trip_ocean_dawn')!,
  tea_house: MUSIC_TRACKS.find((track) => track.id === 'trip_tea_house')!,
  snow_cabin: MUSIC_TRACKS.find((track) => track.id === 'trip_snow_cabin')!,
};

// --- Ambience (nature sounds / ASMR) ---
export const AMBIENCE_TRACKS: AmbienceTrack[] = [
  {
    id: 'rain',
    title: '빗소리',
    filename: 'rain',
    durationSeconds: 240,
    persona: ['P4_SLEEP'],
  },
  {
    id: 'ocean',
    title: '파도 소리',
    filename: 'ocean',
    durationSeconds: 300,
    persona: ['P2_CIRCULATION'],
  },
  {
    id: 'forest',
    title: '숲 소리',
    filename: 'forest',
    durationSeconds: 280,
    persona: ['P1_SAFETY'],
  },
  {
    id: 'hotspring',
    title: '온천수 소리',
    filename: 'hotspring',
    durationSeconds: 260,
    persona: ['P3_MUSCLE'],
  },
  {
    id: 'fireplace',
    title: '벽난로',
    filename: 'fireplace',
    durationSeconds: 300,
    persona: ['P4_SLEEP', 'P1_SAFETY'],
  },
];
