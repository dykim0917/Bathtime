import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import {
  V2_ACCENT,
  V2_ACCENT_TEXT,
  V2_BG_OVERLAY,
  V2_BORDER,
  V2_MODAL_SURFACE,
  V2_SHADOW,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { buildSafetyChecklist } from '@/src/engine/safetyChecklist';
import { copy } from '@/src/content/copy';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';

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
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{copy.routine.checklist.title}</Text>
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
          <Pressable style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: V2_BG_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: V2_MODAL_SURFACE,
    borderRadius: luxuryRadii.card,
    borderWidth: 2,
    borderColor: V2_WARNING,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    ...Platform.select({
      web: {
        boxShadow: `0px 16px 32px ${V2_SHADOW}`,
      },
      default: {
        shadowColor: V2_SHADOW,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 1,
        shadowRadius: 32,
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 20,
    color: V2_WARNING,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: luxuryFonts.display,
  },
  warningsList: {
    maxHeight: 200,
    marginBottom: 20,
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
    marginTop: 4,
    fontFamily: luxuryFonts.sans,
  },
  button: {
    backgroundColor: V2_ACCENT,
    borderRadius: luxuryRadii.button,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: V2_ACCENT_TEXT,
    fontFamily: luxuryFonts.sans,
  },
});
