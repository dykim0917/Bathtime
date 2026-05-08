import React, { useEffect, useState } from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BookmarkSimple, PlusSquare } from '@/src/components/web/phosphorIcons';
import { ArchiveStructuredInfo } from '@/src/components/web/ArchiveStructuredInfo';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { ArchiveVisual } from '@/src/components/web/ArchiveVisual';
import { ContentBodyRenderer } from '@/src/components/web/ContentBodyRenderer';
import { RoutinePresetCard } from '@/src/components/web/RoutinePresetCard';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@/src/archive/labels';
import { getContentById, getRelatedRoutinePresets } from '@/src/archive/selectors';
import { trackArchiveEvent } from '@/src/analytics/events';
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

  useEffect(() => {
    if (!content) return;
    getSavedContentStorage().isSaved(content.id).then(setSaved);
    trackArchiveEvent('content_detail_viewed', {
      contentId: content.id,
      category: content.category,
      contentType: content.contentType,
      tags: content.tags,
      source: 'detail',
      platform: 'web',
    });
  }, [content]);

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
    const next = await toggleSavedContent(content.id);
    const isSaved = next.includes(content.id);
    setSaved(isSaved);
    trackArchiveEvent(isSaved ? 'content_saved' : 'content_unsaved', { contentId: content.id, category: content.category, platform: 'web' });
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
      <Pressable style={styles.secondaryButton} onPress={handleToggleSaved}>
        <BookmarkSimple size={17} color={archiveColors.ink} weight={saved ? 'fill' : 'regular'} />
        <Text style={styles.secondaryButtonText}>{saved ? copy.archive.actions.saved : copy.archive.actions.save}</Text>
      </Pressable>
      <Pressable style={styles.primaryButton} onPress={() => router.push('/submit' as Href)}>
        <PlusSquare size={17} color={archiveColors.onPrimary} weight="regular" />
        <Text style={styles.primaryButtonText}>{copy.archive.actions.submit}</Text>
      </Pressable>
    </View>
  );

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
                    onStart={() => {
                      trackArchiveEvent('routine_cta_clicked', { contentId: content.id, routineId: routine.id, platform: 'web' });
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
