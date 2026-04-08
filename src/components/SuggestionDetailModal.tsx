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
  BTN_PRIMARY,
  BTN_PRIMARY_TEXT,
  CARD_BORDER,
  MODAL_SUB_SURFACE,
  MODAL_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
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
                <Text style={styles.value}>{explanation.narrativeHeadline ?? '오늘의 테마 몰입 루틴입니다.'}</Text>

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
    backgroundColor: 'rgba(17,29,48,0.3)',
    paddingTop: 48,
  },
  card: {
    maxHeight: '82%',
    backgroundColor: MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: CARD_BORDER,
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
    color: TEXT_SECONDARY,
    fontFamily: luxuryFonts.sans,
    letterSpacing: luxuryTracking.label,
  },
  subTitle: {
    marginTop: 4,
    fontSize: TYPE_SCALE.title + 1,
    color: TEXT_PRIMARY,
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
    borderColor: CARD_BORDER,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: MODAL_SUB_SURFACE,
  },
  chipText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  label: {
    marginTop: 8,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    fontFamily: luxuryFonts.sans,
  },
  value: {
    fontSize: TYPE_SCALE.body,
    color: TEXT_PRIMARY,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  buttonStack: {
    marginTop: 16,
    gap: 12,
  },
  startText: {
    color: BTN_PRIMARY_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  closeText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
});
