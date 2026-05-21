import React, { useEffect, useState } from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ArchiveStructuredInfo } from '@/src/components/web/ArchiveStructuredInfo';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { ArchiveVisual } from '@/src/components/web/ArchiveVisual';
import { ContentBodyRenderer } from '@/src/components/web/ContentBodyRenderer';
import { RoutinePresetCard } from '@/src/components/web/RoutinePresetCard';
import { SaveButton } from '@/src/components/web/SaveButton';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { NativeScreen } from '@/src/components/native/NativeScreen';
import { CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@/src/archive/labels';
import { getRelatedRoutinePresets } from '@/src/archive/selectors';
import { useArchiveContentHydration } from '@/src/archive/runtime';
import { ArchiveContent, CareCTA } from '@/src/archive/types';
import { trackArchiveEvent } from '@/src/analytics/events';
import { useAuth } from '@/src/auth/AuthProvider';
import { setPendingAuthAction } from '@/src/auth/pendingActions';
import { getSavedContentStorage, getStorageErrorMessage, toggleSavedContent } from '@/src/storage/savedContent';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';

type PreviewStatus = 'idle' | 'loading' | 'ready' | 'error';

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function getArchivePreviewApiBase(): string {
  return process.env.EXPO_PUBLIC_ARCHIVE_PREVIEW_API_BASE?.trim() || 'https://admin.getbathtime.com';
}

async function fetchArchivePreviewContent(id: string, token: string): Promise<ArchiveContent> {
  const url = new URL(`/api/archive-preview/${id}`, getArchivePreviewApiBase());
  url.searchParams.set('token', token);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Archive preview request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    schema_version?: string;
    content?: ArchiveContent;
  };

  if (payload.schema_version !== 'archive-content-preview.v1' || !payload.content) {
    throw new Error('Invalid archive preview response');
  }

  return payload.content;
}

export default function ContentDetailPage() {
  const params = useLocalSearchParams<{ id: string; previewToken?: string | string[] }>();
  const id = params.id;
  const previewToken = normalizeParam(params.previewToken);
  const { contents, status } = useArchiveContentHydration();
  const [previewContent, setPreviewContent] = useState<ArchiveContent | null>(null);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('idle');
  const content = previewContent ?? (id ? contents.find((item) => item.id === id) : undefined);
  const [saved, setSaved] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktopDetail = width >= 980;
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!id || !previewToken || Platform.OS !== 'web') {
      setPreviewContent(null);
      setPreviewStatus('idle');
      return;
    }

    let cancelled = false;
    setPreviewStatus('loading');

    fetchArchivePreviewContent(id, previewToken)
      .then((nextContent) => {
        if (cancelled) return;
        setPreviewContent(nextContent);
        setPreviewStatus('ready');
      })
      .catch((error) => {
        console.warn('Failed to load archive preview content', error);
        if (cancelled) return;
        setPreviewContent(null);
        setPreviewStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id, previewToken]);

  useEffect(() => {
    if (!content) return;
    if (isAuthenticated) {
      getSavedContentStorage().isSaved(content.id).then(setSaved);
    } else {
      setSaved(false);
    }
    trackArchiveEvent('content_detail_viewed', {
      contentId: content.id,
      category: content.category,
      contentType: content.contentType,
      tags: content.tags,
      source: 'detail',
      platform: Platform.OS === 'web' ? 'web' : 'native',
    });
  }, [content, isAuthenticated]);

  if (!content) {
    return (
      <WebShell>
        <View style={webStyles.pageStack}>
          <Text style={webStyles.title}>
            {status === 'loading' || previewStatus === 'loading'
              ? '콘텐츠를 불러오는 중입니다.'
              : '콘텐츠를 찾을 수 없습니다.'}
          </Text>
          <Pressable onPress={() => router.push('/explore' as Href)}><Text style={styles.textLink}>{copy.archive.actions.backToExplore}</Text></Pressable>
        </View>
      </WebShell>
    );
  }

  const routines = getRelatedRoutinePresets(content);
  const description = content.seo?.seoDescription ?? content.subtitle ?? content.body.find((block) => block.type === 'paragraph')?.text;

  const handleToggleSaved = async () => {
    if (!isAuthenticated) {
      const returnTo = `/content/${content.id}`;
      await setPendingAuthAction({ type: 'save_content', contentId: content.id, returnTo, source: 'detail' });
      trackArchiveEvent('saved_login_required', { contentId: content.id, source: 'detail', platform: 'web' });
      trackArchiveEvent('auth_prompt_shown', { contentId: content.id, source: 'detail', pendingAction: 'save_content', platform: 'web' });
      router.push(`/auth/login?source=save&next=${encodeURIComponent(returnTo)}` as Href);
      return;
    }

    try {
      const next = await toggleSavedContent(content.id);
      const isSaved = next.includes(content.id);
      setSaved(isSaved);
      trackArchiveEvent(isSaved ? 'content_saved' : 'content_unsaved', {
        contentId: content.id,
        category: content.category,
        platform: Platform.OS === 'web' ? 'web' : 'native',
      });
    } catch (error) {
      console.warn('Failed to toggle saved content', error);
      if (typeof window !== 'undefined') window.alert(`저장에 실패했어요.\n${getStorageErrorMessage(error)}`);
    }
  };

  const handleBodyCtaPress = async (cta: CareCTA) => {
    if (cta.action === 'start_timer' && cta.targetId) {
      trackArchiveEvent('routine_cta_clicked', { contentId: content.id, routineId: cta.targetId, platform: 'web' });
      router.push(`/app?from=care_archive&routine=${encodeURIComponent(cta.targetId)}` as Href);
      return;
    }

    if (cta.action === 'save') {
      await handleToggleSaved();
      return;
    }

    if (cta.action === 'view_related' && cta.targetId) {
      router.push(`/explore?query=${encodeURIComponent(cta.targetId)}` as Href);
      return;
    }

    if (cta.action === 'open_article' && cta.targetId) {
      router.push(`/content/${cta.targetId}` as Href);
      return;
    }

    if (cta.action === 'open_item' && cta.targetId) {
      router.push(`/explore?query=${encodeURIComponent(cta.targetId)}` as Href);
      return;
    }

    if (cta.action === 'submit') {
      router.push('/app?from=care_archive_submit' as Href);
    }
  };

  const headerBlock = (
    <View style={webStyles.header}>
      <Text style={webStyles.eyebrow}>{CATEGORY_LABELS[content.category]} · {CONTENT_TYPE_LABELS[content.contentType]}</Text>
      <Text style={webStyles.title}>{content.title}</Text>
      {content.subtitle ? <Text style={webStyles.lede}>{content.subtitle}</Text> : null}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>요약</Text>
        <Text style={styles.summaryText}>{content.summary}</Text>
      </View>
    </View>
  );

  if (Platform.OS !== 'web') {
    return (
      <NativeScreen
        eyebrow={`${CATEGORY_LABELS[content.category]} · ${CONTENT_TYPE_LABELS[content.contentType]}`}
        title={content.title}
        subtitle={content.subtitle}
        backHref="/(tabs)/explore"
        hero={<ArchiveVisual content={content} height={330} showBadge={false} radius={0} />}
        heroAccessory={<SaveButton saved={saved} onPress={handleToggleSaved} disabled={isLoading} size={42} />}
      >
        <View style={styles.nativeBodyCard}>
          {content.body.map((block, index) => {
            if (block.type === 'heading') return <Text key={index} style={styles.nativeBodyHeading}>{block.text}</Text>;
            if (block.type === 'paragraph') return <Text key={index} style={styles.nativeBodyText}>{block.text}</Text>;
            if (block.type === 'quote') return <Text key={index} style={styles.nativeBodyQuote}>{block.text}</Text>;
            if (block.type === 'list') {
              return block.items.map((item) => <Text key={`${index}-${item}`} style={styles.nativeBodyText}>• {item}</Text>);
            }
            return null;
          })}
        </View>
        {routines.length > 0 ? (
          <View style={styles.nativeRoutineList}>
            <Text style={styles.nativeSectionTitle}>연결된 의식</Text>
            {routines.map((routine) => (
              <RoutinePresetCard
                key={routine.id}
                routine={routine}
                ctaLabel="의식 보기"
                onStart={() => router.push('/(tabs)/routines' as Href)}
              />
            ))}
          </View>
        ) : null}
      </NativeScreen>
    );
  }

  return (
    <WebShell desktopContentPaddingTop={0} mobileContentPaddingTop={0}>
      <SeoMetadata
        title={content.seo?.seoTitle ?? `${content.title} - 바스타임`}
        description={description}
        image={content.seo?.ogImage ?? content.heroImage?.uri}
        canonicalUrl={content.seo?.canonicalUrl}
      />
      <ArchivePageContainer variant="detail">
      <View style={[webStyles.pageStack, styles.detailFrame]}>
        <View style={[styles.heroWrap, !isDesktopDetail && styles.heroWrapMobileFull]}>
          <ArchiveVisual content={content} height={390} showBadge={false} radius={0} />
          <View style={styles.heroSaveButton}>
            <SaveButton saved={saved} onPress={handleToggleSaved} disabled={isLoading} size={42} />
          </View>
          <View style={styles.heroPills}>
            <Text style={styles.heroPill}>{CATEGORY_LABELS[content.category]}</Text>
            <Text style={[styles.heroPill, styles.heroPillDark]}>{CONTENT_TYPE_LABELS[content.contentType]}</Text>
          </View>
        </View>

        <View style={[styles.detailContent, isDesktopDetail && styles.detailContentDesktop]}>
          {isDesktopDetail ? (
            <View style={[styles.detailColumns, styles.detailColumnsDesktop]}>
              <View style={styles.contentColumn}>
                {headerBlock}
                <View style={styles.bodyColumn}>
                  <ContentBodyRenderer blocks={content.body} onCtaPress={handleBodyCtaPress} />
                </View>
              </View>
              {React.createElement(
                'div',
                { className: 'bath-detail-sticky-info' },
                <ArchiveStructuredInfo content={content} />,
              )}
            </View>
          ) : (
            <>
              {headerBlock}
              <View style={styles.detailColumns}>
                <View style={styles.infoColumn}>
                  <ArchiveStructuredInfo content={content} />
                </View>
                <View style={styles.bodyColumn}>
                  <ContentBodyRenderer blocks={content.body} onCtaPress={handleBodyCtaPress} />
                </View>
              </View>
            </>
          )}

          {routines.length > 0 ? (
            <View style={webStyles.section}>
              <Text style={webStyles.sectionTitle}>연결된 의식</Text>
              <View style={styles.cardList}>
                {routines.map((routine) => (
                  <RoutinePresetCard
                    key={routine.id}
                    routine={routine}
                    ctaLabel="앱에서 이 의식 따라 하기"
                    onStart={() => {
                      trackArchiveEvent('routine_cta_clicked', { contentId: content.id, routineId: routine.id, platform: 'web' });
                      router.push(`/app?from=routine_preview&routine=${routine.id}` as Href);
                    }}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </View>
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: archiveColors.hairline,
    backgroundColor: archiveColors.surfaceSoft,
  },
  heroWrapMobileFull: {
    marginHorizontal: -16,
  },
  heroPills: {
    position: 'absolute',
    left: 30,
    bottom: 30,
    flexDirection: 'row',
    gap: 8,
  },
  heroPill: {
    overflow: 'hidden',
    borderRadius: archiveRadius.xs,
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: archiveColors.primary,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  heroPillDark: {
    color: archiveColors.surface,
    backgroundColor: 'rgba(37, 42, 42, 0.54)',
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  heroSaveButton: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  detailContent: {
    paddingHorizontal: 8,
    gap: 28,
  },
  detailContentDesktop: {
    width: '100%',
    maxWidth: 1120,
    paddingHorizontal: 30,
    alignSelf: 'center',
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.primarySoft,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 7,
  },
  summaryLabel: {
    color: archiveColors.primary,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  summaryText: {
    color: archiveColors.ink,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: luxuryFonts.sans,
  },
  textLink: {
    color: archiveColors.primary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  nativeBodyCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(230, 246, 239, 0.14)',
    backgroundColor: 'rgba(22, 45, 48, 0.9)',
    padding: 16,
    gap: 10,
  },
  nativeBodyHeading: {
    color: '#F7F3EA',
    fontSize: 17,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  nativeBodyText: {
    color: '#D7E1DC',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
  },
  nativeBodyQuote: {
    color: '#94D2BF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  nativeRoutineList: {
    gap: 12,
  },
  nativeSectionTitle: {
    color: '#F7F3EA',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  disabledButton: {
    opacity: 0.45,
  },
  cardList: {
    gap: 14,
  },
  detailColumns: {
    gap: 18,
  },
  detailColumnsDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 48,
  },
  contentColumn: {
    flex: 1,
    gap: 0,
  },
  bodyColumn: {
    flex: 1,
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: archiveColors.hairline,
    paddingTop: 28,
  },
  infoColumn: {
    width: '100%',
  },
  infoColumnDesktop: {
    width: '32%',
  },
  detailFrame: {
    width: '100%',
  },
});
