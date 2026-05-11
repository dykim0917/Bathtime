import React, { useCallback, useMemo, useState } from 'react';
import { Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeArchiveCard } from '@/src/components/native/NativeArchiveCard';
import { NativeScreen } from '@/src/components/native/NativeScreen';
import { AuthPrompt } from '@/src/components/auth/AuthPrompt';
import { archiveContents } from '@/src/archive/seed';
import { useAuth } from '@/src/auth/AuthProvider';
import { getSavedContentStorage, getStorageErrorMessage, toggleSavedContent } from '@/src/storage/savedContent';
import { luxuryFonts } from '@/src/theme/luxury';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';

export default function ProfileScreen() {
  const params = useLocalSearchParams<{ saved?: string }>();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const refreshSaved = useCallback(() => {
    if (!isAuthenticated) {
      setSavedIds([]);
      return;
    }
    getSavedContentStorage().getSavedIds().then(setSavedIds).catch(() => setSavedIds([]));
  }, [isAuthenticated]);

  useFocusEffect(refreshSaved);

  const savedContents = useMemo(
    () => savedIds.map((id) => archiveContents.find((content) => content.id === id)).filter(Boolean),
    [savedIds]
  );

  const handleSave = async (id: string) => {
    try {
      const next = await toggleSavedContent(id);
      setSavedIds(next);
    } catch (error) {
      console.warn('Failed to toggle saved content', error);
      Alert.alert('저장 변경에 실패했어요', getStorageErrorMessage(error));
    }
  };

  return (
    <NativeScreen eyebrow="PROFILE" title="프로필" subtitle="계정, 보관함, 기록과 설정을 한곳에서 관리합니다.">
      {!isAuthenticated && !isLoading ? (
        <AuthPrompt source="saved" nextPath="/(tabs)/my?saved=1" />
      ) : (
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.nickname?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? 'B'}</Text>
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountName}>{user?.nickname ?? '내 계정'}</Text>
            {user?.email ? <Text style={styles.accountEmail}>{user.email}</Text> : null}
          </View>
          <Pressable style={styles.logoutButton} onPress={() => void logout()}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>내 보관함</Text>
        <Text style={styles.sectionMeta}>{savedIds.length}개 저장</Text>
      </View>
      {isAuthenticated ? (
        savedContents.length > 0 ? (
          <View style={styles.list}>
            {savedContents.map((content) => content ? (
              <NativeArchiveCard
                key={content.id}
                content={content}
                saved
                onSavePress={() => handleSave(content.id)}
              />
            ) : null)}
          </View>
        ) : (
          <View style={[styles.emptyCard, params.saved === '1' && styles.emptyCardActive]}>
            <Text style={styles.emptyTitle}>아직 저장한 콘텐츠가 없습니다.</Text>
            <Text style={styles.emptyBody}>탐색에서 나중에 다시 보고 싶은 바스타임을 저장해보세요.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/explore' as Href)}>
              <Text style={styles.primaryButtonText}>탐색으로 이동</Text>
            </Pressable>
          </View>
        )
      ) : null}

      <View style={styles.linkGroup}>
        <Pressable style={styles.linkCard} onPress={() => router.push('/(tabs)/history' as Href)}>
          <View>
            <Text style={styles.linkTitle}>의식 기록</Text>
            <Text style={styles.linkBody}>완료한 루틴과 지난 바스타임을 확인합니다.</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Pressable style={styles.linkCard} onPress={() => router.push('/(tabs)/settings' as Href)}>
          <View>
            <Text style={styles.linkTitle}>설정</Text>
            <Text style={styles.linkBody}>목욕 환경, 법적 문서, 앱 정보를 확인합니다.</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: archiveColors.primary,
  },
  avatarText: {
    color: archiveColors.onPrimary,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  accountText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  accountName: {
    color: archiveColors.ink,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  accountEmail: {
    color: archiveColors.muted,
    fontSize: 12,
    fontFamily: luxuryFonts.sans,
  },
  logoutButton: {
    minHeight: 38,
    borderRadius: archiveRadius.md,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: archiveColors.ink,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: archiveColors.ink,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  sectionMeta: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  list: {
    gap: 12,
  },
  emptyCard: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 10,
  },
  emptyCardActive: {
    borderColor: archiveColors.primary,
  },
  emptyTitle: {
    color: archiveColors.ink,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  emptyBody: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: archiveColors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  linkGroup: {
    gap: 10,
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
    color: archiveColors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  arrow: {
    color: archiveColors.primary,
    fontSize: 18,
  },
});
