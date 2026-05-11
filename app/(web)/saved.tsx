import React, { useEffect, useMemo, useState } from 'react';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ArchiveContentCard } from '@/src/components/web/ArchiveContentCard';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { AuthPrompt } from '@/src/components/auth/AuthPrompt';
import { AppHandoffCard } from '@/src/components/web/AppHandoffCard';
import { archiveContents } from '@/src/archive/seed';
import { useAuth } from '@/src/auth/AuthProvider';
import { getSavedContentStorage, toggleSavedContent } from '@/src/storage/savedContent';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { width } = useWindowDimensions();
  const isDesktopGrid = width >= 980;
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedIds([]);
      return;
    }
    getSavedContentStorage().getSavedIds().then(setSavedIds);
  }, [isAuthenticated]);

  const savedContents = useMemo(
    () => savedIds.map((id) => archiveContents.find((content) => content.id === id)).filter(Boolean),
    [savedIds]
  );

  const handleSave = async (id: string) => {
    try {
      setSavedIds(await toggleSavedContent(id));
    } catch (error) {
      console.warn('Failed to toggle saved content', error);
    }
  };

  return (
    <WebShell>
      <SeoMetadata title={`${copy.archive.nav.saved} - 바스타임`} description="나중에 다시 보고 싶은 바스타임 콘텐츠를 보관합니다." />
      <ArchivePageContainer variant={savedIds.length > 0 ? 'grid' : 'narrow'}>
      <View style={webStyles.pageStack}>
        <View style={webStyles.header}>
          <Text style={webStyles.eyebrow}>{copy.archive.nav.saved}</Text>
          <Text style={webStyles.title}>내 바스타임 보관함</Text>
          <Text style={webStyles.lede}>저장한 콘텐츠를 계정에 연결해 다시 꺼내봅니다.</Text>
        </View>

        {!isAuthenticated && !isLoading ? (
          <>
            <AuthPrompt source="saved" nextPath="/saved" />
            <AppHandoffCard
              source="saved"
              title="앱에서는 보관함이 프로필 안에 있어요"
              body="로그인하면 웹에서 저장한 콘텐츠를 앱 프로필의 내 보관함에서 이어서 볼 수 있습니다."
              ctaLabel="앱 프로필 열기"
              deepLink="getbathtime://profile?saved=1"
              ctaType="saved_gate"
            />
          </>
        ) : savedContents.length > 0 ? (
          <View style={styles.cardGrid}>
            {savedContents.map((content) => content ? (
              <View key={content.id} style={[styles.cardTile, isDesktopGrid && styles.cardTileDesktop]}>
                <ArchiveContentCard
                  content={content}
                  saved
                  onSavePress={() => handleSave(content.id)}
                />
              </View>
            ) : null)}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>아직 저장한 콘텐츠가 없습니다.</Text>
            <Text style={webStyles.muted}>탐색에서 나중에 다시 보고 싶은 기록을 저장해보세요.</Text>
            <AppHandoffCard
              source="saved"
              title="앱에서 내 바스타임을 모아두기"
              body="웹에서 발견한 기록을 저장하고, 앱 프로필의 내 보관함에서 다시 꺼내볼 수 있어요."
              ctaLabel="앱 프로필 열기"
              deepLink="getbathtime://profile?saved=1"
              ctaType="saved_empty"
            />
            <Pressable style={styles.primaryButton} onPress={() => router.push('/explore' as Href)}>
              <Text style={styles.primaryButtonText}>{copy.archive.actions.goExplore}</Text>
            </Pressable>
          </View>
        )}
      </View>
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardTile: {
    width: '100%',
  },
  cardTileDesktop: {
    width: '31.8%',
  },
  empty: {
    gap: 12,
  },
  emptyTitle: {
    color: archiveColors.primary,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  primaryButton: {
    minHeight: 46,
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
});
