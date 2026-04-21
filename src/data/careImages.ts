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

export function getCareCardImage(intentId: string, variant: CareImageVariant) {
  return CARE_CARD_IMAGES[intentId]?.[variant] ?? null;
}

export function getCareCardImageForEnvironment(
  intentId: string,
  environment: BathEnvironment
) {
  return getCareCardImage(intentId, getImageVariantForEnvironment(environment));
}
