import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { HomeSuggestion, SuggestionExplanation } from '@/src/engine/types';
import {
  TYPE_SCALE,
  V2_BG_OVERLAY,
  V2_BORDER,
  V2_MODAL_SURFACE,
  V2_MODAL_SURFACE_SUBTLE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { copy } from '@/src/content/copy';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

interface SuggestionDetailModalProps {
  visible: boolean;
  suggestion: HomeSuggestion | null;
  explanation: SuggestionExplanation | null;
  onClose: () => void;
  onStart: () => void;
}

export function SuggestionDetailModal({
  visible,
  suggestion,
  explanation,
  onClose,
  onStart,
}: SuggestionDetailModalProps) {
  if (!suggestion || !explanation) return null;
  const isTrip = suggestion.mode === 'trip';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.handle} />
          <Text style={styles.title}>
            {isTrip ? copy.suggestion.titleTrip : copy.suggestion.titleCare}
          </Text>
          <Text style={styles.subTitle}>{suggestion.title}</Text>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {isTrip ? (
              <>
                <Text style={styles.label}>{copy.suggestion.labels.narrative}</Text>
                <Text style={styles.value}>{explanation.narrativeHeadline ?? '오늘의 테마 분위기로 쉬어가는 루틴이에요.'}</Text>

                <Text style={styles.label}>{copy.suggestion.labels.atmosphere}</Text>
                <View style={styles.chipsRow}>
                  {(explanation.atmosphereChips ?? []).map((chip) => (
                    <View key={chip} style={styles.chip}>
                      <Text style={styles.chipText}>{chip}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>{copy.suggestion.labels.state}</Text>
                <Text style={styles.value}>{explanation.stateLabel}</Text>
              </>
            )}

            <Text style={styles.label}>{copy.suggestion.labels.why}</Text>
            <Text style={styles.value}>{explanation.whySummary}</Text>

            <Text style={styles.label}>{copy.suggestion.labels.params}</Text>
            <Text style={styles.value}>{explanation.routineParams}</Text>

            <Text style={styles.label}>{copy.suggestion.labels.goal}</Text>
            <Text style={styles.value}>{explanation.expectedGoal}</Text>

            <Text style={styles.label}>{copy.suggestion.labels.alternative}</Text>
            <Text style={styles.value}>{explanation.alternativeRoutine}</Text>
          </ScrollView>

          <View style={styles.buttonStack}>
            <Pressable style={ui.primaryButtonV2} onPress={onStart}>
              <Text style={styles.startText}>{copy.suggestion.cta.start}</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>{copy.suggestion.cta.close}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: V2_BG_OVERLAY,
    paddingTop: 48,
  },
  card: {
    maxHeight: '82%',
    backgroundColor: V2_MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(245,240,232,0.28)',
    marginBottom: 14,
  },
  title: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
    letterSpacing: luxuryTracking.label,
  },
  subTitle: {
    marginTop: 4,
    fontSize: TYPE_SCALE.title + 1,
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
  },
  body: {
    marginTop: 14,
  },
  bodyContent: {
    gap: 7,
    paddingBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: V2_MODAL_SURFACE_SUBTLE,
  },
  chipText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  label: {
    marginTop: 8,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: V2_TEXT_SECONDARY,
    fontFamily: luxuryFonts.sans,
  },
  value: {
    fontSize: TYPE_SCALE.body,
    color: V2_TEXT_PRIMARY,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  buttonStack: {
    marginTop: 16,
    gap: 12,
  },
  startText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  closeText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
});
