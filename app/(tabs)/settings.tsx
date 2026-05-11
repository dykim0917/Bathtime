import React from 'react';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeScreen } from '@/src/components/native/NativeScreen';
import { brand } from '@/src/content/brand';
import { luxuryFonts } from '@/src/theme/luxury';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';

export default function SettingsScreen() {
  return (
    <NativeScreen eyebrow="SETTINGS" title="설정" subtitle="앱 정보와 법적 문서를 확인합니다.">
      <View style={styles.card}>
        <Text style={styles.label}>앱 이름</Text>
        <Text style={styles.value}>{brand.displayName}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>버전</Text>
        <Text style={styles.value}>1.0.0</Text>
      </View>
      <Pressable style={styles.linkCard} onPress={() => router.push('/legal/privacy' as Href)}>
        <View>
          <Text style={styles.linkTitle}>개인정보 처리방침</Text>
          <Text style={styles.linkBody}>로그인, 저장 콘텐츠, 제보 정보 처리 안내</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </Pressable>
      <Pressable style={styles.linkCard} onPress={() => router.push('/legal/terms' as Href)}>
        <View>
          <Text style={styles.linkTitle}>이용약관</Text>
          <Text style={styles.linkBody}>서비스 이용 조건과 책임 범위 확인</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </Pressable>
      <Text style={styles.notice}>계정 및 저장 콘텐츠 삭제 요청은 getbathtime@gmail.com 으로 접수합니다.</Text>
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 6,
  },
  label: {
    color: archiveColors.muted,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  value: {
    color: archiveColors.ink,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 12,
  },
  linkTitle: {
    color: archiveColors.ink,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  linkBody: {
    color: archiveColors.body,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  arrow: {
    color: archiveColors.primary,
    fontSize: 18,
  },
  notice: {
    color: archiveColors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
});
