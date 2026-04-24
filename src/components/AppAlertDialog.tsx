import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AnimatedModalShell } from '@/src/components/AnimatedModalShell';
import {
  TYPE_BODY,
  TYPE_CAPTION,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BG_OVERLAY,
  V2_BORDER,
  V2_DANGER,
  V2_MODAL_SURFACE_ELEVATED,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

interface AppAlertDialogProps {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
  confirmLabel?: string;
  onConfirm?: () => void;
  eyebrow?: string;
  iconName?: React.ComponentProps<typeof FontAwesome>['name'];
  tone?: 'default' | 'danger';
}

export function AppAlertDialog({
  visible,
  title,
  body,
  onClose,
  confirmLabel = '확인',
  onConfirm,
  eyebrow = 'NOTICE',
  iconName = 'info-circle',
  tone = 'default',
}: AppAlertDialogProps) {
  const accentColor = tone === 'danger' ? V2_DANGER : V2_ACCENT;
  const accentSurface = tone === 'danger' ? 'rgba(194, 134, 118, 0.12)' : V2_ACCENT_SOFT;
  const accentBorder = tone === 'danger' ? 'rgba(194, 134, 118, 0.22)' : 'rgba(176, 141, 87, 0.24)';

  return (
    <AnimatedModalShell
      visible={visible}
      onClose={onClose}
      align="center"
      layoutStyle={styles.overlay}
      backdropStyle={styles.backdrop}
      containerStyle={styles.container}
    >
      {(requestClose) => (
        <View style={styles.card}>
          <View style={[styles.iconBadge, { backgroundColor: accentSurface, borderColor: accentBorder }]}>
            <FontAwesome name={iconName} size={18} color={accentColor} />
          </View>
          <Text style={[styles.eyebrow, { color: accentColor }]}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <Pressable
            style={[ui.primaryButtonV2, styles.confirmButton]}
            onPress={() => {
              if (onConfirm) {
                onConfirm();
                return;
              }
              requestClose();
            }}
          >
            <Text style={ui.primaryButtonTextV2}>{confirmLabel}</Text>
          </Pressable>
        </View>
      )}
    </AnimatedModalShell>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  backdrop: {
    backgroundColor: V2_BG_OVERLAY,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: V2_MODAL_SURFACE_ELEVATED,
    gap: 10,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 2,
  },
  eyebrow: {
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    letterSpacing: 0,
    fontFamily: luxuryFonts.sans,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    color: V2_TEXT_PRIMARY,
    textAlign: 'center',
    fontFamily: luxuryFonts.display,
  },
  body: {
    fontSize: TYPE_BODY,
    lineHeight: 21,
    color: V2_TEXT_SECONDARY,
    textAlign: 'center',
    fontFamily: luxuryFonts.sans,
    marginBottom: 4,
  },
  confirmButton: {
    width: '100%',
    marginTop: 4,
  },
});
