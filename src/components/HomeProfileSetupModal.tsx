import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BathEnvironment,
  UserProfile,
} from '@/src/engine/types';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_BG_OVERLAY,
  V2_BORDER,
  V2_MODAL_HANDLE,
  V2_MODAL_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { AnimatedModalShell } from '@/src/components/AnimatedModalShell';
import {
  AppIconBadge,
  getEnvironmentBadgeTone,
} from '@/src/components/AppIconBadge';

const ENVIRONMENTS: { id: BathEnvironment; label: string; description: string }[] = [
  { id: 'shower', label: '샤워', description: '가볍게 바로 시작할 수 있어요' },
  { id: 'partial_bath', label: '족욕', description: '대야나 족욕기로 진행해요' },
  { id: 'bathtub', label: '욕조', description: '전신욕이나 반신욕이 가능해요' },
];

interface HomeProfileSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (profile: UserProfile) => void;
}

export function HomeProfileSetupModal({
  visible,
  onClose,
  onComplete,
}: HomeProfileSetupModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [environment, setEnvironment] = useState<BathEnvironment | null>(null);

  useEffect(() => {
    if (!visible) return;
    setEnvironment(null);
  }, [visible]);

  const canComplete = Boolean(environment);
  const maxSheetHeight = Math.min(windowHeight - insets.top - 56, windowHeight * 0.86);
  const selectedConditions = useMemo<UserProfile['healthConditions']>(() => ['none'], []);

  const completeSetup = () => {
    if (!environment || !canComplete) return;
    const now = new Date().toISOString();
    onComplete({
      bathEnvironment: environment,
      healthConditions: selectedConditions,
      onboardingComplete: true,
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <AnimatedModalShell
      visible={visible}
      onClose={onClose}
      layoutStyle={styles.overlay}
      backdropStyle={styles.backdrop}
    >
      {(requestClose) => (
        <View style={[styles.sheet, { maxHeight: maxSheetHeight }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.eyebrow}>FIRST SETUP</Text>
            <Text style={styles.title}>오늘 가능한 방식만 알려주세요</Text>
            <Text style={styles.subtitle}>
              건강정보는 받지 않고, 가능한 방식에 맞춰 바로 의식을 준비할게요.
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>가능한 방식</Text>
              <View style={styles.environmentGrid}>
                {ENVIRONMENTS.map((option) => {
                  const selected = environment === option.id;
                  const tone = getEnvironmentBadgeTone(option.id, selected);
                  return (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.environmentCard,
                        selected && {
                          borderColor: tone.borderColor,
                          backgroundColor: tone.backgroundColor,
                        },
                      ]}
                      onPress={() => setEnvironment(option.id)}
                    >
                      <AppIconBadge
                        spec={tone.spec}
                        size={42}
                        iconSize={18}
                        color={tone.color}
                        backgroundColor={tone.backgroundColor}
                        borderColor={tone.borderColor}
                      />
                      <Text style={[styles.environmentLabel, selected && { color: tone.color }]}>
                        {option.label}
                      </Text>
                      <Text style={styles.environmentDescription}>{option.description}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Text style={styles.note}>
              의식 추천은 선택한 방식과 서비스의 기본 안전 기준을 바탕으로 구성됩니다.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[ui.primaryButtonV2, styles.completeButton, !canComplete && styles.completeButtonDisabled]}
              disabled={!canComplete}
              onPress={completeSetup}
            >
              <Text style={[ui.primaryButtonTextV2, !canComplete && styles.completeButtonTextDisabled]}>
                의식 준비하기
              </Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={requestClose}>
              <Text style={styles.closeText}>나중에 할게요</Text>
            </Pressable>
          </View>
        </View>
      )}
    </AnimatedModalShell>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 32,
  },
  backdrop: {
    backgroundColor: V2_BG_OVERLAY,
  },
  sheet: {
    width: '100%',
    backgroundColor: V2_MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: V2_MODAL_HANDLE,
    marginBottom: 16,
  },
  header: {
    gap: 7,
    marginBottom: 16,
  },
  eyebrow: {
    color: V2_ACCENT,
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.headingMd + 4,
    lineHeight: 30,
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 18,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title - 1,
    lineHeight: 22,
    fontFamily: luxuryFonts.display,
  },
  environmentGrid: {
    gap: 10,
  },
  environmentCard: {
    borderRadius: luxuryRadii.card,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 8,
  },
  environmentLabel: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    lineHeight: 20,
    fontFamily: luxuryFonts.display,
  },
  environmentDescription: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  note: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  footer: {
    gap: 10,
    paddingTop: 8,
  },
  completeButton: {
    width: '100%',
  },
  completeButtonDisabled: {
    opacity: 1,
    backgroundColor: 'rgba(148, 210, 191, 0.32)',
    borderWidth: 1,
    borderColor: 'rgba(148, 210, 191, 0.16)',
  },
  completeButtonTextDisabled: {
    color: 'rgba(13, 41, 43, 0.72)',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  closeText: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
});
