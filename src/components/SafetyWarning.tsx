import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  V2_ACCENT_TEXT,
  V2_BG_OVERLAY,
  V2_BORDER,
  V2_MODAL_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { buildSafetyChecklist } from '@/src/engine/safetyChecklist';
import { copy } from '@/src/content/copy';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

interface SafetyWarningProps {
  visible: boolean;
  warnings: string[];
  onDismiss: () => void;
  variant?: 'default' | 'v2';
}

export function SafetyWarning({
  visible,
  warnings,
  onDismiss,
  variant = 'default',
}: SafetyWarningProps) {
  if (warnings.length === 0) return null;
  const checklist = buildSafetyChecklist(warnings);
  const isV2 = variant === 'v2';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss} />
        <View style={styles.card}>
          <View style={styles.handle} />
          <Text style={styles.title}>{copy.routine.checklist.title}</Text>
          <Text style={styles.subTitle}>루틴을 시작하기 전에 아래 내용을 한 번만 확인해주세요.</Text>
          <ScrollView style={styles.warningsList}>
            <Text style={styles.sectionTitle}>주의사항</Text>
            {warnings.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.warningText}>
                {'\u2022'} {item}
              </Text>
            ))}
            <Text style={styles.sectionTitle}>실천 체크리스트</Text>
            {checklist.map((item) => (
              <Text key={item} style={styles.warningText}>
                {'\u2022'} {item}
              </Text>
            ))}
          </ScrollView>
          <View style={styles.buttonStack}>
            <Pressable style={ui.primaryButtonV2} onPress={onDismiss}>
              <Text style={styles.buttonText}>이해했어요</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onDismiss}>
              <Text style={styles.closeText}>닫기</Text>
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
    backgroundColor: V2_BG_OVERLAY,
    justifyContent: 'flex-end',
    paddingTop: 48,
  },
  card: {
    backgroundColor: V2_MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
    width: '100%',
    maxHeight: '80%',
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
    fontSize: 12,
    color: V2_WARNING,
    marginBottom: 4,
    letterSpacing: luxuryTracking.label,
    fontFamily: luxuryFonts.sans,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: 22,
    color: V2_TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: luxuryFonts.display,
  },
  warningsList: {
    maxHeight: 280,
  },
  warningText: {
    fontSize: 15,
    color: V2_TEXT_PRIMARY,
    lineHeight: 22,
    marginBottom: 11,
    fontFamily: luxuryFonts.sans,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: V2_TEXT_MUTED,
    marginBottom: 8,
    marginTop: 8,
    fontFamily: luxuryFonts.sans,
  },
  buttonStack: {
    marginTop: 16,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: V2_ACCENT_TEXT,
    fontFamily: luxuryFonts.sans,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
  },
});
