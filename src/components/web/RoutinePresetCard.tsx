import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RoutinePreset } from '@/src/archive/types';
import { ROUTINE_ENVIRONMENT_LABELS } from '@/src/archive/labels';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';

export function RoutinePresetCard({ routine, onStart }: { routine: RoutinePreset; onStart: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.timerBadge}>
          <Text style={styles.timerNumber}>{routine.durationMinutes}</Text>
          <Text style={styles.timerUnit}>min</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{routine.title}</Text>
          <Text style={styles.meta}>{ROUTINE_ENVIRONMENT_LABELS[routine.environment]} · {routine.situationTags.join(', ')}</Text>
        </View>
      </View>
      {routine.description ? <Text style={styles.description}>{routine.description}</Text> : null}
      <View style={styles.steps}>
        {routine.steps.map((step, index) => (
          <Text key={step} style={styles.step}>{index + 1}. {step}</Text>
        ))}
      </View>
      <Pressable style={styles.button} onPress={onStart}>
        <FontAwesome name="play" size={14} color={archiveColors.onPrimary} />
        <Text style={styles.buttonText}>{copy.archive.actions.startRitual}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    padding: 16,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  timerBadge: {
    width: 58,
    height: 58,
    borderRadius: archiveRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: archiveColors.primary,
  },
  timerNumber: {
    color: archiveColors.onPrimary,
    fontSize: 21,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  timerUnit: {
    color: archiveColors.onPrimary,
    fontSize: 10,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: archiveColors.ink,
    fontSize: 19,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  meta: {
    color: archiveColors.muted,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  description: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  steps: {
    gap: 5,
  },
  step: {
    color: archiveColors.body,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  button: {
    minHeight: 46,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    color: archiveColors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
});
