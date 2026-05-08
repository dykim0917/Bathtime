import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ArchiveContentCard } from '@/src/components/web/ArchiveContentCard';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { CATEGORY_LABELS, P0_ARCHIVE_TAGS } from '@/src/archive/labels';
import { searchContents } from '@/src/archive/selectors';
import { ContentCategory } from '@/src/archive/types';
import { trackArchiveEvent } from '@/src/analytics/events';
import { getSavedContentStorage, toggleSavedContent } from '@/src/storage/savedContent';
import { archiveColors } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';

const CATEGORIES: Array<ContentCategory | 'ALL'> = ['ALL', 'HOME_BATH', 'BATH_PLACES', 'BATH_ITEMS', 'TIPS_CULTURE'];

export default function ExplorePage() {
  const params = useLocalSearchParams<{ category?: ContentCategory; query?: string }>();
  const [category, setCategory] = useState<ContentCategory | 'ALL'>(params.category ?? 'ALL');
  const [tag, setTag] = useState<string | null>(null);
  const query = params.query ?? '';
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { width } = useWindowDimensions();
  const isDesktopGrid = width >= 980;

  useEffect(() => {
    getSavedContentStorage().getSavedIds().then(setSavedIds);
  }, []);

  const results = useMemo(() => searchContents({ category, tag, query }), [category, query, tag]);

  const handleCategory = (next: ContentCategory | 'ALL') => {
    setCategory(next);
    trackArchiveEvent('explore_filter_used', { category: next, source: 'category', platform: 'web' });
  };

  const handleTag = (next: string) => {
    const selected = tag === next ? null : next;
    setTag(selected);
    trackArchiveEvent('explore_filter_used', { tags: selected ? [selected] : [], source: 'tag', platform: 'web' });
  };

  const handleSave = async (id: string) => {
    const next = await toggleSavedContent(id);
    setSavedIds(next);
  };

  return (
    <WebShell>
      <SeoMetadata title={`${copy.archive.nav.explore} - 바스타임`} description="카테고리와 태그로 바스타임 아카이브를 탐색합니다." />
      <ArchivePageContainer variant="grid">
      <View style={webStyles.pageStack}>
        <View style={webStyles.header}>
          <Text style={webStyles.title}>아카이브 탐색</Text>
        </View>

        <View style={styles.chipGroup}>
          {CATEGORIES.map((item) => (
            <Pressable key={item} style={[styles.chip, category === item && styles.chipActive]} onPress={() => handleCategory(item)}>
              <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item === 'ALL' ? copy.archive.meta.all : CATEGORY_LABELS[item]}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.chipGroup}>
          {P0_ARCHIVE_TAGS.map((item) => (
            <Pressable key={item} style={[styles.filterToken, tag === item && styles.filterTokenActive]} onPress={() => handleTag(item)}>
              <Text style={[styles.filterTokenText, tag === item && styles.filterTokenTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.cardGrid}>
          {results.map((content) => (
            <View key={content.id} style={[styles.cardTile, isDesktopGrid && styles.cardTileDesktop]}>
              <ArchiveContentCard
                content={content}
                saved={savedIds.includes(content.id)}
                onSavePress={() => handleSave(content.id)}
              />
            </View>
          ))}
        </View>
      </View>
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minHeight: 34,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: archiveColors.primary,
  },
  chipText: {
    color: archiveColors.body,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  chipTextActive: {
    color: archiveColors.onPrimary,
  },
  filterToken: {
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTokenActive: {
    backgroundColor: archiveColors.primarySoft,
    borderColor: archiveColors.primaryDisabled,
  },
  filterTokenText: {
    color: archiveColors.muted,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  filterTokenTextActive: {
    color: archiveColors.primaryActive,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  cardTile: {
    width: '100%',
  },
  cardTileDesktop: {
    width: '31.5%',
  },
});
