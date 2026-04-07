import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BathRecommendation } from '@/src/engine/types';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { formatTemperature, formatTemperatureRange } from '@/src/utils/temperature';
import { formatDuration } from '@/src/utils/time';
import {
  TYPE_CAPTION,
  TYPE_TITLE,
  V2_BORDER,
  V2_SHADOW,
  V2_SURFACE,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';

interface PersonaCardProps {
  recommendation: BathRecommendation;
}

const BATH_TYPE_LABELS: Record<string, string> = {
  full: '전신욕',
  half: '반신욕',
  foot: '족욕',
  shower: '샤워',
};

export function PersonaCard({ recommendation }: PersonaCardProps) {
  const persona = PERSONA_DEFINITIONS.find(
    (p) => p.code === recommendation.persona
  );

  const title = recommendation.mode === 'trip'
    ? recommendation.themeTitle ?? 'Trip 테마'
    : persona?.nameKo ?? '맞춤 케어';

  return (
    <View style={styles.container}>
      <Text style={[styles.personaName, { color: recommendation.colorHex }]}>{title}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatTemperature(recommendation.temperature)}</Text>
          <Text style={styles.statLabel}>수온</Text>
          <Text style={styles.statSub}>({formatTemperatureRange(recommendation.temperature)})</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: recommendation.colorHex + '40' }]} />

        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(recommendation.durationMinutes)}</Text>
          <Text style={styles.statLabel}>시간</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: recommendation.colorHex + '40' }]} />

        <View style={styles.stat}>
          <Text style={styles.statValue}>{BATH_TYPE_LABELS[recommendation.bathType]}</Text>
          <Text style={styles.statLabel}>입욕 방법</Text>
        </View>
      </View>

      <View style={styles.lightingRow}>
        <Text style={styles.lightingLabel}>조명</Text>
        <Text style={styles.lightingValue}>{recommendation.lighting}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  personaName: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.8,
    fontFamily: luxuryFonts.display,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V2_SURFACE,
    borderRadius: luxuryRadii.card,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: V2_BORDER,
    ...Platform.select({
      web: {
        boxShadow: `0px 12px 24px ${V2_SHADOW}`,
      },
      default: {
        shadowColor: V2_SHADOW,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 6,
      },
    }),
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPE_TITLE,
    color: V2_TEXT_PRIMARY,
    marginBottom: 2,
    textAlign: 'center',
    fontFamily: luxuryFonts.display,
  },
  statLabel: {
    fontSize: TYPE_CAPTION,
    color: V2_TEXT_SECONDARY,
    fontFamily: luxuryFonts.sans,
  },
  statSub: {
    fontSize: 10,
    color: V2_TEXT_SECONDARY,
    marginTop: 2,
    fontFamily: luxuryFonts.sans,
  },
  divider: {
    width: 1,
    height: 38,
  },
  lightingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: V2_SURFACE,
    borderRadius: luxuryRadii.button,
    padding: 12,
    borderWidth: 1,
    borderColor: V2_BORDER,
    ...Platform.select({
      web: {
        boxShadow: `0px 8px 16px ${V2_SHADOW}`,
      },
      default: {
        shadowColor: V2_SHADOW,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 14,
        elevation: 4,
      },
    }),
  },
  lightingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: V2_TEXT_SECONDARY,
    marginRight: 8,
    fontFamily: luxuryFonts.sans,
  },
  lightingValue: {
    fontSize: 14,
    color: V2_TEXT_PRIMARY,
    flex: 1,
    fontFamily: luxuryFonts.sans,
  },
});
