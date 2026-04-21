import { BathEnvironment } from '@/src/engine/types';
import {
  getImageVariantForEnvironment,
  RoutineImageVariant,
} from '@/src/data/routineImageVariants';

export type TripImageVariant = RoutineImageVariant;

export const TRIP_CARD_IMAGES: Record<string, { lite: any; deep: any }> = {
  kyoto_forest: {
    lite: require('../../assets/images/trip/kyoto_forest_lite.png'),
    deep: require('../../assets/images/trip/kyoto_forest_deep.png'),
  },
  nordic_sauna: {
    lite: require('../../assets/images/trip/nordic_sauna_lite.png'),
    deep: require('../../assets/images/trip/nordic_sauna_deep.png'),
  },
  rainy_camping: {
    lite: require('../../assets/images/trip/rainy_camping_lite.png'),
    deep: require('../../assets/images/trip/rainy_camping_deep.png'),
  },
  snow_cabin: {
    lite: require('../../assets/images/trip/snow_cabin_lite.png'),
    deep: require('../../assets/images/trip/snow_cabin_deep.png'),
  },
  busan_harbor_blue: {
    lite: require('../../assets/images/trip/busan_harbor_blue_lite.png'),
    deep: require('../../assets/images/trip/busan_harbor_blue_deep.png'),
  },
  moss_temple_kyoto: {
    lite: require('../../assets/images/trip/moss_temple_kyoto_lite.png'),
    deep: require('../../assets/images/trip/moss_temple_kyoto_deep.png'),
  },
  white_silence_sapporo: {
    lite: require('../../assets/images/trip/white_silence_sapporo_lite.png'),
    deep: require('../../assets/images/trip/white_silence_sapporo_deep.png'),
  },
  seoul_afterglow_seoul: {
    lite: require('../../assets/images/trip/seoul_afterglow_seoul_lite.png'),
    deep: require('../../assets/images/trip/seoul_afterglow_seoul_deep.png'),
  },
  fireside_library_fireside_library: {
    lite: require('../../assets/images/trip/fireside_library_fireside_library_lite.png'),
    deep: require('../../assets/images/trip/fireside_library_fireside_library_deep.png'),
  },
  lantern_rain_karuizawa: {
    lite: require('../../assets/images/trip/lantern_rain_karuizawa_lite.png'),
    deep: require('../../assets/images/trip/lantern_rain_karuizawa_deep.png'),
  },
};

export function getTripCardImage(intentId: string, variant: TripImageVariant) {
  return TRIP_CARD_IMAGES[intentId]?.[variant] ?? null;
}

export function getTripCardImageForEnvironment(
  intentId: string,
  environment: BathEnvironment
) {
  return getTripCardImage(intentId, getImageVariantForEnvironment(environment));
}
