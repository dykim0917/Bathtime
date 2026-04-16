import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BathEnvironment, HealthCondition } from '@/src/engine/types';
import { CustomIcon, CustomIconName } from '@/src/components/CustomIcon';

type FontAwesomeName = ComponentProps<typeof FontAwesome>['name'];

export type AppIconSpec =
  | { kind: 'custom'; name: CustomIconName }
  | { kind: 'fa'; name: FontAwesomeName };

export interface AppIconTone {
  spec: AppIconSpec;
  color: string;
  backgroundColor: string;
  borderColor: string;
}

export function getHealthConditionIconSpec(condition: HealthCondition): AppIconSpec {
  switch (condition) {
    case 'hypertension_heart':
      return { kind: 'fa', name: 'heart-o' };
    case 'pregnant':
      return { kind: 'fa', name: 'female' };
    case 'diabetes':
      return { kind: 'fa', name: 'tint' };
    case 'sensitive_skin':
      return { kind: 'fa', name: 'hand-paper-o' };
    case 'none':
    default:
      return { kind: 'fa', name: 'check-circle-o' };
  }
}

export function getHealthConditionBadgeTone(condition: HealthCondition, selected: boolean): AppIconTone {
  switch (condition) {
    case 'hypertension_heart':
      return {
        spec: getHealthConditionIconSpec(condition),
        color: selected ? '#D7948A' : '#C28676',
        backgroundColor: selected ? 'rgba(194, 134, 118, 0.18)' : 'rgba(194, 134, 118, 0.08)',
        borderColor: selected ? 'rgba(194, 134, 118, 0.34)' : 'rgba(194, 134, 118, 0.18)',
      };
    case 'pregnant':
      return {
        spec: getHealthConditionIconSpec(condition),
        color: selected ? '#D5B073' : '#CAA071',
        backgroundColor: selected ? 'rgba(202, 160, 113, 0.18)' : 'rgba(202, 160, 113, 0.08)',
        borderColor: selected ? 'rgba(202, 160, 113, 0.34)' : 'rgba(202, 160, 113, 0.18)',
      };
    case 'diabetes':
      return {
        spec: getHealthConditionIconSpec(condition),
        color: selected ? '#7CA4C7' : '#6B93B8',
        backgroundColor: selected ? 'rgba(107, 147, 184, 0.18)' : 'rgba(107, 147, 184, 0.08)',
        borderColor: selected ? 'rgba(107, 147, 184, 0.34)' : 'rgba(107, 147, 184, 0.18)',
      };
    case 'sensitive_skin':
      return {
        spec: getHealthConditionIconSpec(condition),
        color: selected ? '#7FAF9A' : '#6E9E89',
        backgroundColor: selected ? 'rgba(110, 158, 137, 0.18)' : 'rgba(110, 158, 137, 0.08)',
        borderColor: selected ? 'rgba(110, 158, 137, 0.34)' : 'rgba(110, 158, 137, 0.18)',
      };
    case 'none':
    default:
      return {
        spec: getHealthConditionIconSpec(condition),
        color: selected ? '#CBB68F' : '#B8A684',
        backgroundColor: selected ? 'rgba(184, 166, 132, 0.18)' : 'rgba(184, 166, 132, 0.08)',
        borderColor: selected ? 'rgba(184, 166, 132, 0.34)' : 'rgba(184, 166, 132, 0.18)',
      };
  }
}

export function getEnvironmentIconSpec(environment: BathEnvironment): AppIconSpec {
  switch (environment) {
    case 'bathtub':
      return { kind: 'custom', name: 'care' };
    case 'footbath':
      return { kind: 'custom', name: 'footbath' };
    case 'shower':
    default:
      return { kind: 'custom', name: 'shower' };
  }
}

export function getEnvironmentBadgeTone(environment: BathEnvironment, selected: boolean): AppIconTone {
  switch (environment) {
    case 'bathtub':
      return {
        spec: getEnvironmentIconSpec(environment),
        color: selected ? '#DABB88' : '#C2A877',
        backgroundColor: selected ? 'rgba(194, 168, 119, 0.18)' : 'rgba(194, 168, 119, 0.08)',
        borderColor: selected ? 'rgba(194, 168, 119, 0.34)' : 'rgba(194, 168, 119, 0.18)',
      };
    case 'footbath':
      return {
        spec: getEnvironmentIconSpec(environment),
        color: selected ? '#8DB4A4' : '#7DA192',
        backgroundColor: selected ? 'rgba(125, 161, 146, 0.18)' : 'rgba(125, 161, 146, 0.08)',
        borderColor: selected ? 'rgba(125, 161, 146, 0.34)' : 'rgba(125, 161, 146, 0.18)',
      };
    case 'shower':
    default:
      return {
        spec: getEnvironmentIconSpec(environment),
        color: selected ? '#86A8CB' : '#7598BC',
        backgroundColor: selected ? 'rgba(117, 152, 188, 0.18)' : 'rgba(117, 152, 188, 0.08)',
        borderColor: selected ? 'rgba(117, 152, 188, 0.34)' : 'rgba(117, 152, 188, 0.18)',
      };
  }
}

export function getProductCategoryIconSpec(category: string): AppIconSpec {
  switch (category) {
    case 'essential_oil':
      return { kind: 'fa', name: 'tint' };
    case 'bath_salt':
      return { kind: 'fa', name: 'diamond' };
    case 'bath_item':
      return { kind: 'fa', name: 'cube' };
    case 'body_wash':
      return { kind: 'custom', name: 'shower' };
    case 'herb':
      return { kind: 'fa', name: 'leaf' };
    default:
      return { kind: 'custom', name: 'care' };
  }
}

export function getProductCategoryBadgeTone(category: string): AppIconTone {
  switch (category) {
    case 'essential_oil':
      return {
        spec: getProductCategoryIconSpec(category),
        color: '#6E6FAE',
        backgroundColor: 'rgba(110, 111, 174, 0.14)',
        borderColor: 'rgba(110, 111, 174, 0.22)',
      };
    case 'bath_salt':
      return {
        spec: getProductCategoryIconSpec(category),
        color: '#6C95BB',
        backgroundColor: 'rgba(108, 149, 187, 0.14)',
        borderColor: 'rgba(108, 149, 187, 0.22)',
      };
    case 'bath_item':
      return {
        spec: getProductCategoryIconSpec(category),
        color: '#A98A63',
        backgroundColor: 'rgba(169, 138, 99, 0.14)',
        borderColor: 'rgba(169, 138, 99, 0.22)',
      };
    case 'body_wash':
      return {
        spec: getProductCategoryIconSpec(category),
        color: '#6D9C9A',
        backgroundColor: 'rgba(109, 156, 154, 0.14)',
        borderColor: 'rgba(109, 156, 154, 0.22)',
      };
    case 'herb':
      return {
        spec: getProductCategoryIconSpec(category),
        color: '#769A73',
        backgroundColor: 'rgba(118, 154, 115, 0.14)',
        borderColor: 'rgba(118, 154, 115, 0.22)',
      };
    default:
      return {
        spec: getProductCategoryIconSpec(category),
        color: '#B08D57',
        backgroundColor: 'rgba(176, 141, 87, 0.14)',
        borderColor: 'rgba(176, 141, 87, 0.22)',
      };
  }
}

export function getTripIntentIconSpec(intentId: string): AppIconSpec {
  switch (intentId) {
    case 'kyoto_forest':
    case 'moss_temple_kyoto':
      return { kind: 'fa', name: 'leaf' };
    case 'nordic_sauna':
    case 'fireside_library_fireside_library':
      return { kind: 'fa', name: 'fire' };
    case 'rainy_camping':
    case 'lantern_rain_karuizawa':
      return { kind: 'fa', name: 'umbrella' };
    case 'snow_cabin':
    case 'white_silence_sapporo':
      return { kind: 'fa', name: 'snowflake-o' };
    case 'busan_harbor_blue':
      return { kind: 'fa', name: 'anchor' };
    case 'seoul_afterglow_seoul':
      return { kind: 'fa', name: 'moon-o' };
    default:
      return { kind: 'fa', name: 'compass' };
  }
}

export function getTripIntentBadgeTone(intentId: string, isElevated = false): AppIconTone {
  switch (intentId) {
    case 'kyoto_forest':
    case 'moss_temple_kyoto':
      return {
        spec: getTripIntentIconSpec(intentId),
        color: '#BFE2CD',
        backgroundColor: isElevated ? 'rgba(56, 102, 83, 0.28)' : 'rgba(78, 132, 108, 0.18)',
        borderColor: isElevated ? 'rgba(164, 210, 184, 0.26)' : 'rgba(164, 210, 184, 0.18)',
      };
    case 'nordic_sauna':
    case 'fireside_library_fireside_library':
      return {
        spec: getTripIntentIconSpec(intentId),
        color: '#E0BE89',
        backgroundColor: isElevated ? 'rgba(112, 78, 43, 0.28)' : 'rgba(155, 112, 69, 0.18)',
        borderColor: isElevated ? 'rgba(224, 190, 137, 0.24)' : 'rgba(224, 190, 137, 0.18)',
      };
    case 'rainy_camping':
    case 'lantern_rain_karuizawa':
      return {
        spec: getTripIntentIconSpec(intentId),
        color: '#B8D5EC',
        backgroundColor: isElevated ? 'rgba(35, 75, 104, 0.28)' : 'rgba(70, 113, 146, 0.18)',
        borderColor: isElevated ? 'rgba(184, 213, 236, 0.24)' : 'rgba(184, 213, 236, 0.18)',
      };
    case 'snow_cabin':
    case 'white_silence_sapporo':
      return {
        spec: getTripIntentIconSpec(intentId),
        color: '#D7E4F2',
        backgroundColor: isElevated ? 'rgba(60, 83, 112, 0.28)' : 'rgba(108, 134, 161, 0.18)',
        borderColor: isElevated ? 'rgba(215, 228, 242, 0.24)' : 'rgba(215, 228, 242, 0.18)',
      };
    case 'busan_harbor_blue':
      return {
        spec: getTripIntentIconSpec(intentId),
        color: '#B3D7E8',
        backgroundColor: isElevated ? 'rgba(29, 82, 109, 0.28)' : 'rgba(75, 129, 156, 0.18)',
        borderColor: isElevated ? 'rgba(179, 215, 232, 0.24)' : 'rgba(179, 215, 232, 0.18)',
      };
    case 'seoul_afterglow_seoul':
      return {
        spec: getTripIntentIconSpec(intentId),
        color: '#D9C9E8',
        backgroundColor: isElevated ? 'rgba(75, 58, 95, 0.28)' : 'rgba(123, 98, 151, 0.18)',
        borderColor: isElevated ? 'rgba(217, 201, 232, 0.24)' : 'rgba(217, 201, 232, 0.18)',
      };
    default:
      return {
        spec: getTripIntentIconSpec(intentId),
        color: '#E0C48F',
        backgroundColor: isElevated ? 'rgba(91, 74, 44, 0.28)' : 'rgba(176, 141, 87, 0.18)',
        borderColor: isElevated ? 'rgba(224, 196, 143, 0.24)' : 'rgba(224, 196, 143, 0.18)',
      };
  }
}

export function AppIconBadge({
  spec,
  size = 36,
  iconSize = 18,
  color,
  backgroundColor,
  borderColor,
  style,
}: {
  spec: AppIconSpec;
  size?: number;
  iconSize?: number;
  color: string;
  backgroundColor: string;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size / 2),
          backgroundColor,
          borderColor: borderColor ?? 'transparent',
        },
        style,
      ]}
    >
      {spec.kind === 'custom' ? (
        <CustomIcon
          name={spec.name}
          size={iconSize}
          color={color}
          fillColor={color}
          strokeColor={color}
        />
      ) : (
        <FontAwesome name={spec.name} size={iconSize} color={color} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
