import { BathEnvironment } from '@/src/engine/types';
import {
  getImageVariantForEnvironment,
  RoutineImageVariant,
} from '@/src/data/routineImageVariants';

export type CareImageVariant = RoutineImageVariant;

export const CARE_CARD_IMAGES: Record<string, { lite: any; deep: any }> = {
  muscle_relief: {
    lite: require('../../assets/images/care/muscle_relief_lite.jpg'),
    deep: require('../../assets/images/care/muscle_relief_deep.jpg'),
  },
  sleep_ready: {
    lite: require('../../assets/images/care/sleep_ready_lite.jpg'),
    deep: require('../../assets/images/care/sleep_ready_deep.jpg'),
  },
  hangover_relief: {
    lite: require('../../assets/images/care/hangover_relief_lite.jpg'),
    deep: require('../../assets/images/care/hangover_relief_deep.jpg'),
  },
  edema_relief: {
    lite: require('../../assets/images/care/edema_relief_lite.jpg'),
    deep: require('../../assets/images/care/edema_relief_deep.jpg'),
  },
  cold_relief: {
    lite: require('../../assets/images/care/cold_relief_lite.jpg'),
    deep: require('../../assets/images/care/cold_relief_deep.jpg'),
  },
  menstrual_relief: {
    lite: require('../../assets/images/care/menstrual_relief_lite.jpg'),
    deep: require('../../assets/images/care/menstrual_relief_deep.jpg'),
  },
  stress_relief: {
    lite: require('../../assets/images/care/stress_relief_lite.jpg'),
    deep: require('../../assets/images/care/stress_relief_deep.jpg'),
  },
  mood_lift: {
    lite: require('../../assets/images/care/mood_lift_lite.jpg'),
    deep: require('../../assets/images/care/mood_lift_deep.jpg'),
  },
};

export const CARE_GUIDE_IMAGES: Record<string, any> = {
  muscle_relief: require('../../assets/images/care/muscle_relief_guide.png'),
  sleep_ready: require('../../assets/images/care/sleep_ready_guide.png'),
  hangover_relief: require('../../assets/images/care/hangover_relief_guide.png'),
  edema_relief: require('../../assets/images/care/edema_relief_guide.png'),
  cold_relief: require('../../assets/images/care/cold_relief_guide.png'),
  menstrual_relief: require('../../assets/images/care/menstrual_relief_guide.png'),
  stress_relief: require('../../assets/images/care/stress_relief_guide.png'),
  mood_lift: require('../../assets/images/care/mood_lift_guide.png'),
};

export const CARE_HERO_IMAGES: Record<string, any> = {
  muscle_relief: require('../../assets/images/care/muscle_relief_hero.png'),
  sleep_ready: require('../../assets/images/care/sleep_ready_hero.png'),
  hangover_relief: require('../../assets/images/care/hangover_relief_hero.png'),
  edema_relief: require('../../assets/images/care/edema_relief_hero.png'),
  cold_relief: require('../../assets/images/care/cold_relief_hero.png'),
  menstrual_relief: require('../../assets/images/care/menstrual_relief_hero.png'),
  stress_relief: require('../../assets/images/care/stress_relief_hero.png'),
  mood_lift: require('../../assets/images/care/mood_lift_hero.png'),
};

export function getCareCardImage(intentId: string, variant: CareImageVariant) {
  return CARE_CARD_IMAGES[intentId]?.[variant] ?? null;
}

export function getCareGuideImage(intentId: string) {
  return CARE_GUIDE_IMAGES[intentId] ?? null;
}

export function getCareHeroImage(intentId: string) {
  return CARE_HERO_IMAGES[intentId] ?? null;
}

export function getCareCardImageForEnvironment(
  intentId: string,
  environment: BathEnvironment
) {
  return getCareCardImage(intentId, getImageVariantForEnvironment(environment));
}
