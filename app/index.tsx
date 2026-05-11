import React, { useCallback, useEffect, useState } from 'react';
import { Href, Redirect, router, useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ArchiveContentCard } from '@/src/components/web/ArchiveContentCard';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { ArchiveVisual } from '@/src/components/web/ArchiveVisual';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { RoutinePresetCard } from '@/src/components/web/RoutinePresetCard';
import { AppHandoffCard } from '@/src/components/web/AppHandoffCard';
import { CATEGORY_LABELS } from '@/src/archive/labels';
import { archiveContents, routinePresets } from '@/src/archive/seed';
import { getContentsByCategory, getFeaturedContent, getLatestContents } from '@/src/archive/selectors';
import { ContentCategory } from '@/src/archive/types';
import { trackArchiveEvent } from '@/src/analytics/events';
import { useAuth } from '@/src/auth/AuthProvider';
import { setPendingAuthAction } from '@/src/auth/pendingActions';
import { getSavedContentStorage, getStorageErrorMessage, toggleSavedContent } from '@/src/storage/savedContent';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';
import { brand } from '@/src/content/brand';

const CATEGORIES: ContentCategory[] = ['HOME_BATH', 'BATH_PLACES', 'BATH_ITEMS', 'TIPS_CULTURE'];

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function WebHomePage() {
  if (Platform.OS !== 'web') {
    return <Redirect href={'/(tabs)' as any} />;
  }

  const params = useLocalSearchParams<{ code?: string | string[]; next?: string | string[] }>();
  const code = firstParam(params.code);
  const next = firstParam(params.next);
  if (code) {
    const callbackPath = `/auth/callback?code=${encodeURIComponent(code)}${next ? `&next=${encodeURIComponent(next)}` : ''}`;
    return <Redirect href={callbackPath as Href} />;
  }

  return <WebHomeContent />;
}

function WebHomeContent() {
  const featured = getFeaturedContent();
  const latest = getLatestContents(4);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { width } = useWindowDimensions();
  const isDesktopGrid = width >= 980;
  const { isAuthenticated, isLoading } = useAuth();

  const refreshSaved = useCallback(() => {
    if (!isAuthenticated) {
      setSavedIds([]);
      return;
    }
    getSavedContentStorage().getSavedIds().then(setSavedIds);
  }, [isAuthenticated]);

  useEffect(() => {
    refreshSaved();
    trackArchiveEvent('archive_home_viewed', { source: 'home', platform: 'web' });
  }, [refreshSaved]);

  const handleSave = async (id: string) => {
    if (!isAuthenticated) {
      await setPendingAuthAction({ type: 'save_content', contentId: id, returnTo: '/', source: 'home' });
      trackArchiveEvent('saved_login_required', { contentId: id, source: 'home', platform: 'web' });
      trackArchiveEvent('auth_prompt_shown', { contentId: id, source: 'home', pendingAction: 'save_content', platform: 'web' });
      router.push('/auth/login?source=save&next=/' as Href);
      return;
    }

    try {
      const next = await toggleSavedContent(id);
      setSavedIds(next);
      trackArchiveEvent(next.includes(id) ? 'content_saved' : 'content_unsaved', { contentId: id, source: 'home', platform: 'web' });
    } catch (error) {
      console.warn('Failed to toggle saved content', error);
      if (typeof window !== 'undefined') window.alert(`저장에 실패했어요.\n${getStorageErrorMessage(error)}`);
    }
  };

  return (
    <WebShell>
      <SeoMetadata
        title={`${brand.displayName} - 좋은 바스타임을 발견하고 저장하는 아카이브`}
        description="집 안팎의 씻고 쉬는 시간을 더 좋게 만드는 콘텐츠, 장소, 아이템, 의식을 정리합니다."
      />
      <ArchivePageContainer variant="grid">
      <View style={webStyles.pageStack}>
        <View style={webStyles.header}>
          <Text style={webStyles.eyebrow}>{copy.archive.meta.archiveEyebrow}</Text>
          <Text style={webStyles.title}>좋은 바스타임을 발견하고, 저장하고, 바로 따라 해보세요.</Text>
          <Text style={webStyles.lede}>
            사우나, 스파, 홈스파 세팅, 욕실 아이템, 짧은 의식을 같은 기준으로 정리하는 웹 아카이브입니다.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroVisual}>
            <ArchiveVisual content={featured} height={250} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>{copy.archive.sections.featured}</Text>
            <Text style={styles.heroTitle}>{featured.title}</Text>
            <Text style={styles.heroSubtitle}>{featured.subtitle}</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push(`/content/${featured.id}` as Href)}>
              <Text style={styles.primaryButtonText}>{copy.archive.actions.viewRecord}</Text>
            </Pressable>
          </View>
        </View>

        <View style={webStyles.section}>
          <Text style={webStyles.sectionTitle}>{copy.archive.sections.categories}</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <Pressable key={category} style={styles.categoryCard} onPress={() => router.push(`/explore?category=${category}` as Href)}>
                <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
                <Text style={styles.categoryMeta}>{copy.archive.meta.records(getContentsByCategory(category).length)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={webStyles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={webStyles.sectionTitle}>{copy.archive.sections.latest}</Text>
            <Pressable onPress={() => router.push('/explore' as Href)}><Text style={styles.textLink}>{copy.archive.actions.viewAll}</Text></Pressable>
          </View>
          <View style={styles.cardGrid}>
            {latest.map((content) => (
              <View key={content.id} style={[styles.cardTile, isDesktopGrid && styles.cardTileDesktop]}>
                <ArchiveContentCard
                  content={content}
                  saved={savedIds.includes(content.id)}
                  source="home"
                  onSavePress={isLoading ? undefined : () => handleSave(content.id)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={webStyles.section}>
          <Text style={webStyles.sectionTitle}>{copy.archive.sections.rituals}</Text>
          <View style={styles.cardGrid}>
            {routinePresets.slice(0, 2).map((routine) => (
              <View key={routine.id} style={[styles.cardTile, isDesktopGrid && styles.cardTileHalf]}>
                <RoutinePresetCard
                  routine={routine}
                  ctaLabel="앱에서 의식 열기"
                  onStart={() => {
                    trackArchiveEvent('routine_cta_clicked', { routineId: routine.id, source: 'home', platform: 'web' });
                    router.push(`/app?from=routine_preview&routine=${routine.id}` as Href);
                  }}
                />
              </View>
            ))}
          </View>
          <AppHandoffCard
            source="routine_preview"
            title="앱에서 루틴으로 저장하고 실행하기"
            body="웹에서는 의식을 미리 보고, 앱에서는 타이머와 보관함으로 이어갈 수 있어요."
            ctaLabel="앱에서 루틴 열기"
            deepLink="getbathtime://profile?saved=1"
            ctaType="routine_preview"
          />
        </View>
      </View>
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.xl,
    padding: 14,
    gap: 20,
    overflow: 'hidden',
  },
  heroVisual: {
    width: '100%',
  },
  heroText: {
    gap: 12,
    justifyContent: 'center',
    padding: 8,
  },
  heroLabel: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  heroTitle: {
    color: archiveColors.ink,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    fontFamily: luxuryFonts.display,
  },
  heroSubtitle: {
    color: archiveColors.body,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: luxuryFonts.sans,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: archiveColors.onPrimary,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    padding: 15,
    gap: 5,
    flexGrow: 1,
    flexBasis: 150,
  },
  categoryTitle: {
    color: archiveColors.ink,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  categoryMeta: {
    color: archiveColors.body,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textLink: {
    color: archiveColors.primary,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardTile: {
    width: '100%',
  },
  cardTileDesktop: {
    width: '48.6%',
  },
  cardTileHalf: {
    width: '48.6%',
  },
});
