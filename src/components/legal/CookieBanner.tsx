import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useSegments } from 'expo-router';
import { loadCookieNoticeAck, saveCookieNoticeAck } from '@/src/storage/legal';
import {
  TYPE_BODY,
  TYPE_CAPTION,
  V2_BORDER,
  V2_MODAL_SURFACE_ELEVATED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const segments = useSegments();
  const isOnboardingRoute = segments[0] === 'onboarding';

  useEffect(() => {
    loadCookieNoticeAck()
      .then((acked) => setVisible(!acked))
      .catch(() => setVisible(true));
  }, []);

  if (!visible || isOnboardingRoute) return null;

  const handleConfirm = async () => {
    await saveCookieNoticeAck();
    setVisible(false);
  };

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={[ui.glassCardV2, styles.banner]}>
        <Text style={styles.title}>쿠키 및 접속정보 안내</Text>
        <Text style={styles.body}>
          바스타임은 접속 상태 유지와 서비스 안정성 확인을 위해 필수 쿠키와 접속기록을 사용할 수 있습니다.
          현재 광고 추적 쿠키는 사용하지 않습니다.
        </Text>
        <View style={styles.actions}>
          <Pressable style={[ui.secondaryButtonV2, styles.linkButton]} onPress={() => router.push('/legal/privacy' as any)}>
            <Text style={ui.secondaryButtonTextV2}>처리방침 보기</Text>
          </Pressable>
          <Pressable style={[ui.primaryButtonV2, styles.confirmButton]} onPress={() => void handleConfirm()}>
            <Text style={ui.primaryButtonTextV2}>확인</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.select({ web: 20, default: 12 }),
    paddingHorizontal: 16,
    paddingBottom: Platform.select({ web: 0, default: 8 }),
  },
  banner: {
    backgroundColor: V2_MODAL_SURFACE_ELEVATED,
    borderColor: V2_BORDER,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_BODY,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  body: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  linkButton: {
    flex: 1,
    minHeight: 42,
  },
  confirmButton: {
    flex: 1,
    minHeight: 42,
  },
});
