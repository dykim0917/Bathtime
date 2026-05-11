import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Href, router, useFocusEffect } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeArchiveCard } from '@/src/components/native/NativeArchiveCard';
import { NativeScreen } from '@/src/components/native/NativeScreen';
import { CATEGORY_LABELS } from '@/src/archive/labels';
import { ContentCategory } from '@/src/archive/types';
import { searchContents } from '@/src/archive/selectors';
import { trackArchiveEvent } from '@/src/analytics/events';
import { useAuth } from '@/src/auth/AuthProvider';
import { setPendingAuthAction } from '@/src/auth/pendingActions';
import { getSavedContentStorage, toggleSavedContent } from '@/src/storage/savedContent';
import { luxuryFonts } from '@/src/theme/luxury';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';

const CATEGORIES: Array<ContentCategory | 'ALL'> = ['ALL', 'HOME_BATH', 'BATH_PLACES', 'BATH_ITEMS', 'TIPS_CULTURE'];

export default function NativeExploreScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ContentCategory | 'ALL'>('ALL');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { isAuthenticated, isLoading } = useAuth();

  const refreshSaved = useCallback(() => {
    if (!isAuthenticated) {
      setSavedIds([]);
      return;
    }
    getSavedContentStorage().getSavedIds().then(setSavedIds).catch(() => setSavedIds([]));
  }, [isAuthenticated]);

  useFocusEffect(refreshSaved);

  const results = useMemo(() => searchContents({ category, query }), [category, query]);

  useEffect(() => {
    trackArchiveEvent('archive_home_viewed', { source: 'native_explore', platform: 'native' });
  }, []);

  const handleSave = async (id: string) => {
    if (!isAuthenticated) {
      await setPendingAuthAction({ type: 'save_content', contentId: id, returnTo: '/(tabs)/explore', source: 'native_explore' });
      trackArchiveEvent('saved_login_required', { contentId: id, source: 'native_explore', platform: 'native' });
      router.push('/auth/login?source=save&next=/(tabs)/explore' as Href);
      return;
    }

    try {
      const next = await toggleSavedContent(id);
      setSavedIds(next);
      trackArchiveEvent(next.includes(id) ? 'content_saved' : 'content_unsaved', { contentId: id, source: 'native_explore', platform: 'native' });
    } catch (error) {
      console.warn('Failed to toggle saved content', error);
      Alert.alert('저장에 실패했어요', '잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <NativeScreen eyebrow="EXPLORE" title="바스타임 아카이브" subtitle="웹에서 발견하던 콘텐츠를 앱에서도 저장하고 다시 꺼내보세요.">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="의식, 장소, 아이템 검색"
        placeholderTextColor={archiveColors.muted}
        style={styles.searchInput}
      />
      <View style={styles.chipRow}>
        {CATEGORIES.map((item) => {
          const selected = category === item;
          return (
            <Pressable key={item} style={[styles.chip, selected && styles.chipActive]} onPress={() => setCategory(item)}>
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {item === 'ALL' ? '전체' : CATEGORY_LABELS[item]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.list}>
        {results.map((content) => (
          <NativeArchiveCard
            key={content.id}
            content={content}
            saved={savedIds.includes(content.id)}
            onSavePress={isLoading ? undefined : () => handleSave(content.id)}
          />
        ))}
      </View>
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    minHeight: 48,
    borderRadius: archiveRadius.md,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    color: archiveColors.ink,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: luxuryFonts.sans,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: archiveColors.primary,
    borderColor: archiveColors.primary,
  },
  chipText: {
    color: archiveColors.body,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  chipTextActive: {
    color: archiveColors.onPrimary,
  },
  list: {
    gap: 12,
  },
});
