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
  GLASS_SHADOW,
  MODAL_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WARNING_COLOR,
  V2_ACCENT,
  V2_ACCENT_TEXT,
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
      <View style={[styles.overlay, isV2 && styles.overlayV2]}>
        <View style={[styles.card, isV2 && styles.cardV2]}>
          <Text style={[styles.title, isV2 && styles.titleV2]}>{copy.routine.checklist.title}</Text>
          <ScrollView style={styles.warningsList}>
            <Text style={[styles.sectionTitle, isV2 && styles.sectionTitleV2]}>주의사항</Text>
            {warnings.map((item, index) => (
              <Text key={`${item}-${index}`} style={[styles.warningText, isV2 && styles.warningTextV2]}>
                {'\u2022'} {item}
              </Text>
            ))}
            <Text style={[styles.sectionTitle, isV2 && styles.sectionTitleV2]}>실천 체크리스트</Text>
            {checklist.map((item) => (
              <Text key={item} style={[styles.warningText, isV2 && styles.warningTextV2]}>
                {'\u2022'} {item}
              </Text>
            ))}
          </ScrollView>
          <Pressable style={[styles.button, isV2 && styles.buttonV2]} onPress={onDismiss}>
            <Text style={[styles.buttonText, isV2 && styles.buttonTextV2]}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlayV2: {
    backgroundColor: 'rgba(3, 8, 21, 0.68)',
  },
  card: {
    backgroundColor: MODAL_SURFACE,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WARNING_COLOR,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    ...Platform.select({
      web: {
        boxShadow: `0px 8px 24px ${GLASS_SHADOW}`,
      },
      default: {
        shadowColor: GLASS_SHADOW,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 24,
        elevation: 5,
      },
    }),
  },
  cardV2: {
    backgroundColor: V2_MODAL_SURFACE,
    borderColor: V2_WARNING,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: WARNING_COLOR,
    textAlign: 'center',
    marginBottom: 16,
  },
  titleV2: {
    color: V2_WARNING,
  },
  warningsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    lineHeight: 22,
    marginBottom: 11,
  },
  warningTextV2: {
    color: V2_TEXT_PRIMARY,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitleV2: {
    color: V2_TEXT_MUTED,
  },
  button: {
    backgroundColor: WARNING_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonV2: {
    backgroundColor: V2_ACCENT,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  buttonTextV2: {
    color: V2_ACCENT_TEXT,
  },
});
