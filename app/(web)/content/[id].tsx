import React, { useEffect, useState } from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BookmarkSimple, PlusSquare } from '@/src/components/web/phosphorIcons';
import { ArchiveStructuredInfo } from '@/src/components/web/ArchiveStructuredInfo';
import { AppHandoffCard } from '@/src/components/web/AppHandoffCard';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { ArchiveVisual } from '@/src/components/web/ArchiveVisual';
import { ContentBodyRenderer } from '@/src/components/web/ContentBodyRenderer';
import { RoutinePresetCard } from '@/src/components/web/RoutinePresetCard';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { NativeScreen } from '@/src/components/native/NativeScreen';
import { CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@/src/archive/labels';
import { getContentById, getRelatedRoutinePresets } from '@/src/archive/selectors';
import { trackArchiveEvent } from '@/src/analytics/events';
import { useAuth } from '@/src/auth/AuthProvider';
import { setPendingAuthAction } from '@/src/auth/pendingActions';
import { getSavedContentStorage, toggleSavedContent } from '@/src/storage/savedContent';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';

export default function ContentDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const content = id ? getContentById(id) : undefined;
  const [saved, setSaved] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktopDetail = width >= 980;
  const { isAuthenticated, isLoading } = useAuth();

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
      platform: 'web',
    });
  }, [content, isAuthenticated]);

  if (!content) {
    return (
      <WebShell>
        <View style={webStyles.pageStack}>
          <Text style={webStyles.title}>콘텐츠를 찾을 수 없습니다.</Text>
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
      trackArchiveEvent(isSaved ? 'content_saved' : 'content_unsaved', { contentId: content.id, category: content.category, platform: 'web' });
    } catch (error) {
      console.warn('Failed to toggle saved content', error);
    }
  };

  const headerBlock = (
    <View style={webStyles.header}>
      <Text style={webStyles.eyebrow}>{CATEGORY_LABELS[content.category]} · {CONTENT_TYPE_LABELS[content.contentType]}</Text>
      <Text style={webStyles.title}>{content.title}</Text>
      {content.subtitle ? <Text style={webStyles.lede}>{content.subtitle}</Text> : null}
    </View>
  );

  const actionBlock = (
    <View style={styles.actionRow}>
      <Pressable style={[styles.secondaryButton, isLoading && styles.disabledButton]} onPress={handleToggleSaved} disabled={isLoading}>
        <BookmarkSimple size={17} color={archiveColors.ink} weight={saved ? 'fill' : 'regular'} />
        <Text style={styles.secondaryButtonText}>{saved ? copy.archive.actions.saved : copy.archive.actions.save}</Text>
      </Pressable>
      <Pressable style={styles.primaryButton} onPress={() => router.push('/submit' as Href)}>
        <PlusSquare size={17} color={archiveColors.onPrimary} weight="regular" />
        <Text style={styles.primaryButtonText}>{copy.archive.actions.submit}</Text>
      </Pressable>
    </View>
  );

  if (Platform.OS !== 'web') {
    return (
      <NativeScreen eyebrow={`${CATEGORY_LABELS[content.category]} · ${CONTENT_TYPE_LABELS[content.contentType]}`} title={content.title} subtitle={content.subtitle}>
        <View style={styles.nativeActionRow}>{actionBlock}</View>
        <View style={styles.nativeInfoCard}>
          <Text style={styles.nativeInfoTitle}>앱에서 이어가기</Text>
          <Text style={styles.nativeInfoBody}>이 콘텐츠를 저장하면 프로필의 내 보관함에서 다시 꺼내볼 수 있어요.</Text>
        </View>
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
    <WebShell>
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
                {actionBlock}
                <View style={styles.bodyColumn}>
                  <ContentBodyRenderer blocks={content.body} />
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
              {actionBlock}
              <View style={styles.detailColumns}>
                <View style={styles.infoColumn}>
                  <ArchiveStructuredInfo content={content} />
                </View>
                <View style={styles.bodyColumn}>
                  <ContentBodyRenderer blocks={content.body} />
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
          <AppHandoffCard
            source="content"
            title="앱에서 내 바스타임으로 이어가기"
            body="저장하고, 나중에 다시 꺼내보고, 연결된 의식을 타이머로 실행할 수 있어요."
            ctaLabel="앱에서 열기"
            deepLink={`getbathtime://content/${content.id}`}
            contentId={content.id}
            contentCategory={content.category}
            ctaType="content_detail"
          />
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
  detailContent: {
    paddingHorizontal: 30,
    gap: 28,
  },
  detailContentDesktop: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    minWidth: 104,
    minHeight: 46,
    borderRadius: archiveRadius.md,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: {
    color: archiveColors.ink,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  primaryButton: {
    minWidth: 128,
    minHeight: 46,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.primary,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: archiveColors.onPrimary,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  textLink: {
    color: archiveColors.primary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  nativeActionRow: {
    gap: 10,
  },
  nativeInfoCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(230, 246, 239, 0.14)',
    backgroundColor: 'rgba(22, 45, 48, 0.9)',
    padding: 16,
    gap: 8,
  },
  nativeInfoTitle: {
    color: '#F7F3EA',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  nativeInfoBody: {
    color: '#D7E1DC',
    fontSize: 14,
    lineHeight: 20,
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
    gap: 28,
  },
  bodyColumn: {
    flex: 1,
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
