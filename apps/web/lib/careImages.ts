import type { StaticImageData } from 'next/image';
import coldReliefGuide from '@/assets/images/care/cold_relief_guide.png';
import coldReliefHero from '@/assets/images/care/cold_relief_hero.png';
import edemaReliefGuide from '@/assets/images/care/edema_relief_guide.png';
import edemaReliefHero from '@/assets/images/care/edema_relief_hero.png';
import hangoverReliefGuide from '@/assets/images/care/hangover_relief_guide.png';
import hangoverReliefHero from '@/assets/images/care/hangover_relief_hero.png';
import menstrualReliefGuide from '@/assets/images/care/menstrual_relief_guide.png';
import menstrualReliefHero from '@/assets/images/care/menstrual_relief_hero.png';
import moodLiftGuide from '@/assets/images/care/mood_lift_guide.png';
import moodLiftHero from '@/assets/images/care/mood_lift_hero.png';
import muscleReliefGuide from '@/assets/images/care/muscle_relief_guide.png';
import muscleReliefHero from '@/assets/images/care/muscle_relief_hero.png';
import sleepReadyGuide from '@/assets/images/care/sleep_ready_guide.png';
import sleepReadyHero from '@/assets/images/care/sleep_ready_hero.png';
import stressReliefGuide from '@/assets/images/care/stress_relief_guide.png';
import stressReliefHero from '@/assets/images/care/stress_relief_hero.png';

const careHeroImages: Record<string, StaticImageData> = {
  cold_relief: coldReliefHero,
  edema_relief: edemaReliefHero,
  hangover_relief: hangoverReliefHero,
  menstrual_relief: menstrualReliefHero,
  mood_lift: moodLiftHero,
  muscle_relief: muscleReliefHero,
  sleep_ready: sleepReadyHero,
  stress_relief: stressReliefHero,
};

const careGuideImages: Record<string, StaticImageData> = {
  cold_relief: coldReliefGuide,
  edema_relief: edemaReliefGuide,
  hangover_relief: hangoverReliefGuide,
  menstrual_relief: menstrualReliefGuide,
  mood_lift: moodLiftGuide,
  muscle_relief: muscleReliefGuide,
  sleep_ready: sleepReadyGuide,
  stress_relief: stressReliefGuide,
};

export const careGuideAspectRatios: Record<string, number> = {
  cold_relief: 1448 / 1086,
  edema_relief: 1672 / 941,
  hangover_relief: 1672 / 941,
  menstrual_relief: 1672 / 941,
  mood_lift: 1536 / 1024,
  muscle_relief: 1672 / 941,
  sleep_ready: 1491 / 1055,
  stress_relief: 1672 / 941,
};

function imageSrc(image: StaticImageData | undefined): string | null {
  return image?.src ?? null;
}

export function getCareHeroImageSrc(intentId: string): string | null {
  return imageSrc(careHeroImages[intentId]);
}

export function getCareGuideImageSrc(intentId: string): string | null {
  return imageSrc(careGuideImages[intentId]);
}
