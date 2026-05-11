import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { ArchiveContentCard } from '@/src/components/web/ArchiveContentCard';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import {
  Bathtub,
  BookOpen,
  CheckCircle,
  HouseLine,
  Lock,
  MapPin,
  MapTrifold,
  Moon,
  Package,
  Shower,
  SquaresFour,
  Timer,
  Umbrella,
  Wind,
  type PhosphorIcon,
} from '@/src/components/web/phosphorIcons';
import { CATEGORY_LABELS, P0_ARCHIVE_TAGS } from '@/src/archive/labels';
import { searchContents } from '@/src/archive/selectors';
import { ContentCategory } from '@/src/archive/types';
import { trackArchiveEvent } from '@/src/analytics/events';
import { useAuth } from '@/src/auth/AuthProvider';
import { setPendingAuthAction } from '@/src/auth/pendingActions';
import { getSavedContentStorage, toggleSavedContent } from '@/src/storage/savedContent';
import { archiveColors } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';

const CATEGORIES: Array<ContentCategory | 'ALL'> = ['ALL', 'HOME_BATH', 'BATH_PLACES', 'BATH_ITEMS', 'TIPS_CULTURE'];

const CATEGORY_ICONS: Record<ContentCategory | 'ALL', PhosphorIcon> = {
  ALL: SquaresFour,
  HOME_BATH: Bathtub,
  BATH_PLACES: MapTrifold,
  BATH_ITEMS: Package,
  TIPS_CULTURE: BookOpen,
};

const TAG_ICONS: Record<(typeof P0_ARCHIVE_TAGS)[number], PhosphorIcon> = {
  '욕조 없음': Shower,
  '수면 전': Moon,
  '운동 후': Wind,
  '혼자 쉬기': HouseLine,
  '외부인 이용 가능': CheckCircle,
  프라이빗: Lock,
  서울: MapPin,
  '비 오는 날': Umbrella,
  '짧은 의식': Timer,
};

const CATEGORY_TAGS: Record<ContentCategory | 'ALL', Array<(typeof P0_ARCHIVE_TAGS)[number]>> = {
  ALL: [...P0_ARCHIVE_TAGS],
  HOME_BATH: ['욕조 없음', '수면 전', '운동 후', '혼자 쉬기', '비 오는 날', '짧은 의식'],
  BATH_PLACES: ['서울', '외부인 이용 가능', '프라이빗', '혼자 쉬기'],
  BATH_ITEMS: ['욕조 없음', '수면 전', '프라이빗', '혼자 쉬기'],
  TIPS_CULTURE: ['비 오는 날', '수면 전', '혼자 쉬기', '짧은 의식'],
};

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function FilterToken({
  label,
  icon: IconComponent,
  selected,
  onPress,
}: {
  label: string;
  icon: PhosphorIcon;
  selected: boolean;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      style={[
        styles.filterToken,
        hovered && !selected && styles.filterTokenHover,
        selected && styles.filterTokenActive,
        styles.webTransition,
      ]}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
    >
      <IconComponent
        size={12}
        color={selected ? archiveColors.primaryActive : archiveColors.muted}
        weight={selected ? 'bold' : 'regular'}
      />
      <Text style={[styles.filterTokenText, selected && styles.filterTokenTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function ExplorePage() {
  const params = useLocalSearchParams<{ category?: ContentCategory; query?: string | string[] }>();
  const [category, setCategory] = useState<ContentCategory | 'ALL'>(params.category ?? 'ALL');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const query = normalizeParam(params.query);
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

  const results = useMemo(() => {
    const baseResults = searchContents({ category, query });
    if (selectedTags.length === 0) return baseResults;
    return baseResults.filter((content) => selectedTags.some((tag) => content.tags.includes(tag)));
  }, [category, query, selectedTags]);
  const visibleTags = CATEGORY_TAGS[category];

  const handleCategory = (next: ContentCategory | 'ALL') => {
    setCategory(next);
    setSelectedTags((current) => current.filter((tag): tag is (typeof P0_ARCHIVE_TAGS)[number] => CATEGORY_TAGS[next].includes(tag as (typeof P0_ARCHIVE_TAGS)[number])));
    trackArchiveEvent('explore_filter_used', { category: next, source: 'category', platform: 'web' });
  };

  const handleTag = (next: string) => {
    setSelectedTags((current) => {
      const selected = current.includes(next) ? current.filter((tag) => tag !== next) : [...current, next];
      trackArchiveEvent('explore_filter_used', { tags: selected, source: 'tag', platform: 'web' });
      return selected;
    });
  };

  const handleSave = async (id: string) => {
    if (!isAuthenticated) {
      const returnTo = query ? `/explore?query=${encodeURIComponent(query)}` : '/explore';
      setPendingAuthAction({ type: 'save_content', contentId: id, returnTo, source: 'explore' });
      trackArchiveEvent('saved_login_required', { contentId: id, source: 'explore', platform: 'web' });
      trackArchiveEvent('auth_prompt_shown', { contentId: id, source: 'explore', pendingAction: 'save_content', platform: 'web' });
      router.push(`/auth/login?source=save&next=${encodeURIComponent(returnTo)}` as Href);
      return;
    }

    const next = await toggleSavedContent(id);
    setSavedIds(next);
    trackArchiveEvent(next.includes(id) ? 'content_saved' : 'content_unsaved', { contentId: id, source: 'explore', platform: 'web' });
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
          {CATEGORIES.map((item) => {
            const IconComponent = CATEGORY_ICONS[item];
            const selected = category === item;

            return (
            <Pressable key={item} style={[styles.chip, selected && styles.chipActive]} onPress={() => handleCategory(item)}>
              <IconComponent
                size={15}
                color={selected ? archiveColors.onPrimary : archiveColors.body}
                weight={selected ? 'fill' : 'regular'}
              />
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>{item === 'ALL' ? copy.archive.meta.all : CATEGORY_LABELS[item]}</Text>
            </Pressable>
            );
          })}
        </View>

        <View style={styles.chipGroup}>
          {visibleTags.map((item) => (
            <FilterToken key={item} label={item} icon={TAG_ICONS[item]} selected={selectedTags.includes(item)} onPress={() => handleTag(item)} />
          ))}
        </View>

        <View style={styles.cardGrid}>
          {results.map((content) => (
            <View key={content.id} style={[styles.cardTile, isDesktopGrid && styles.cardTileDesktop]}>
              <ArchiveContentCard
                content={content}
                saved={savedIds.includes(content.id)}
                onSavePress={isLoading ? undefined : () => handleSave(content.id)}
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
    flexDirection: 'row',
    gap: 7,
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
    minHeight: 28,
    paddingHorizontal: 11,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  filterTokenActive: {
    backgroundColor: archiveColors.primarySoft,
    borderColor: archiveColors.primaryDisabled,
  },
  filterTokenHover: {
    borderColor: archiveColors.borderStrong,
    backgroundColor: archiveColors.surface,
  },
  filterTokenText: {
    color: archiveColors.muted,
    fontSize: 12,
    fontWeight: '500',
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
  webTransition: {
    transitionDuration: '150ms',
    transitionProperty: 'background-color, border-color, color',
    transitionTimingFunction: 'ease-out',
  } as any,
});
