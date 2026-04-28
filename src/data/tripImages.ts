import { BathEnvironment } from '@/src/engine/types';
import {
  getImageVariantForEnvironment,
  RoutineImageVariant,
} from '@/src/data/routineImageVariants';

export type TripImageVariant = RoutineImageVariant;

export const TRIP_CARD_IMAGES: Record<string, { lite: any; deep: any }> = {
  kyoto_forest: {
    lite: require('../../assets/images/trip/kyoto_forest_lite.jpg'),
    deep: require('../../assets/images/trip/kyoto_forest_deep.jpg'),
  },
  nordic_sauna: {
    lite: require('../../assets/images/trip/nordic_sauna_lite.jpg'),
    deep: require('../../assets/images/trip/nordic_sauna_deep.jpg'),
  },
  rainy_camping: {
    lite: require('../../assets/images/trip/rainy_camping_lite.jpg'),
    deep: require('../../assets/images/trip/rainy_camping_deep.jpg'),
  },
  snow_cabin: {
    lite: require('../../assets/images/trip/snow_cabin_lite.jpg'),
    deep: require('../../assets/images/trip/snow_cabin_deep.jpg'),
  },
  busan_harbor_blue: {
    lite: require('../../assets/images/trip/busan_harbor_blue_lite.jpg'),
    deep: require('../../assets/images/trip/busan_harbor_blue_deep.jpg'),
  },
  moss_temple_kyoto: {
    lite: require('../../assets/images/trip/moss_temple_kyoto_lite.jpg'),
    deep: require('../../assets/images/trip/moss_temple_kyoto_deep.jpg'),
  },
  white_silence_sapporo: {
    lite: require('../../assets/images/trip/white_silence_sapporo_lite.jpg'),
    deep: require('../../assets/images/trip/white_silence_sapporo_deep.jpg'),
  },
  seoul_afterglow_seoul: {
    lite: require('../../assets/images/trip/seoul_afterglow_seoul_lite.jpg'),
    deep: require('../../assets/images/trip/seoul_afterglow_seoul_deep.jpg'),
  },
  fireside_library_fireside_library: {
    lite: require('../../assets/images/trip/fireside_library_fireside_library_lite.jpg'),
    deep: require('../../assets/images/trip/fireside_library_fireside_library_deep.jpg'),
  },
  lantern_rain_karuizawa: {
    lite: require('../../assets/images/trip/lantern_rain_karuizawa_lite.jpg'),
    deep: require('../../assets/images/trip/lantern_rain_karuizawa_deep.jpg'),
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
