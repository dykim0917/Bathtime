import React from 'react';
import { BathEnvironment } from '@/src/engine/types';
import CareIcon from '@/assets/icons/custom/care.svg';
import ColdReliefIcon from '@/assets/icons/custom/cold_relief.svg';
import EdemaReliefIcon from '@/assets/icons/custom/edema_relief.svg';
import FootbathIcon from '@/assets/icons/custom/footbath.svg';
import HangoverReliefIcon from '@/assets/icons/custom/hangover_relief.svg';
import HourglassIcon from '@/assets/icons/custom/hourglass.svg';
import MenstrualReliefIcon from '@/assets/icons/custom/menstrual_relief.svg';
import MuscleReliefIcon from '@/assets/icons/custom/muscle_relief.svg';
import ShowerIcon from '@/assets/icons/custom/shower.svg';
import SleepReadyIcon from '@/assets/icons/custom/sleep_ready.svg';
import StressReliefIcon from '@/assets/icons/custom/stress_relief.svg';
import TemperatureIcon from '@/assets/icons/custom/temperature.svg';

export type CustomIconName =
  | 'care'
  | 'cold_relief'
  | 'edema_relief'
  | 'footbath'
  | 'hangover_relief'
  | 'hourglass'
  | 'menstrual_relief'
  | 'muscle_relief'
  | 'shower'
  | 'sleep_ready'
  | 'stress_relief'
  | 'temperature';

const ICON_MAP = {
  care: CareIcon,
  cold_relief: ColdReliefIcon,
  edema_relief: EdemaReliefIcon,
  footbath: FootbathIcon,
  hangover_relief: HangoverReliefIcon,
  hourglass: HourglassIcon,
  menstrual_relief: MenstrualReliefIcon,
  muscle_relief: MuscleReliefIcon,
  shower: ShowerIcon,
  sleep_ready: SleepReadyIcon,
  stress_relief: StressReliefIcon,
  temperature: TemperatureIcon,
} as const;

export function getIntentIconName(intentId?: string | null): CustomIconName | null {
  switch (intentId) {
    case 'muscle_relief':
    case 'sleep_ready':
    case 'hangover_relief':
    case 'edema_relief':
    case 'cold_relief':
    case 'menstrual_relief':
    case 'stress_relief':
      return intentId;
    case 'mood_lift':
      return 'care';
    default:
      return null;
  }
}

export function getEnvironmentIconName(environment: BathEnvironment): CustomIconName {
  if (environment === 'shower') return 'shower';
  if (environment === 'footbath' || environment === 'partial_bath') return 'footbath';
  return 'care';
}

export function getProductCategoryIconName(category: string): CustomIconName {
  switch (category) {
    case 'body_wash':
      return 'shower';
    case 'bath_item':
      return 'footbath';
    case 'bath_salt':
    case 'essential_oil':
    case 'herb':
    default:
      return 'care';
  }
}

export function CustomIcon({
  name,
  size = 20,
  color = '#F4EFE6',
  strokeColor,
  fillColor,
}: {
  name: CustomIconName;
  size?: number;
  color?: string;
  strokeColor?: string;
  fillColor?: string;
}) {
  const IconComponent = ICON_MAP[name];
  const ResolvedIcon = (IconComponent as React.FC<{ width?: number; height?: number; color?: string }> & {
    default?: React.FC<{ width?: number; height?: number; color?: string }>;
  }).default ?? IconComponent;

  return (
    <ResolvedIcon
      width={size}
      height={size}
      color={color}
      stroke={strokeColor ?? color}
      fill={fillColor ?? color}
    />
  );
}
