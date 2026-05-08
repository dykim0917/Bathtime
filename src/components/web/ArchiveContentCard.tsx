import React from 'react';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArchiveContent } from '@/src/archive/types';
import { CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@/src/archive/labels';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { ArchiveVisual } from '@/src/components/web/ArchiveVisual';
import { MetaRow } from '@/src/components/web/MetaRow';
import { SaveButton } from '@/src/components/web/SaveButton';

type Props = {
  content: ArchiveContent;
  saved?: boolean;
  onSavePress?: () => void;
  source?: string;
};

function summaryMeta(content: ArchiveContent) {
  const info = content.structuredInfo;
  if ('durationMinutes' in info) {
    return [
      { icon: 'clock-o' as const, label: `${info.durationMinutes ?? '-'}분` },
      { icon: 'bath' as const, label: info.bathRequired ? '욕조 필요' : '욕조 없음' },
    ];
  }
  if ('publicAccess' in info) {
    return [
      { icon: 'map-marker' as const, label: info.region ?? '지역 미정' },
      { icon: 'check-circle-o' as const, label: info.publicAccess === 'available' ? '외부인 가능' : '이용 조건 확인' },
    ];
  }
  if ('itemType' in info) {
    return [
      { icon: 'shopping-bag' as const, label: info.itemType ?? '아이템' },
      { icon: 'tag' as const, label: info.priceRange ?? '가격대 미정' },
    ];
  }
  return [{ icon: 'file-text-o' as const, label: '정리 글' }];
}

export function ArchiveContentCard({ content, saved = false, onSavePress }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/content/${content.id}` as Href)}>
      <View style={styles.visualWrap}>
        <ArchiveVisual content={content} height={194} showBadge={false} radius={archiveRadius.lg} />
        {onSavePress ? (
          <View style={styles.saveWrap}>
            <SaveButton saved={saved} onPress={onSavePress} />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.kicker} numberOfLines={1}>{CATEGORY_LABELS[content.category]} · {CONTENT_TYPE_LABELS[content.contentType]}</Text>
        <Text style={styles.title} numberOfLines={2}>{content.title}</Text>
        <MetaRow items={summaryMeta(content)} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    overflow: 'hidden',
  },
  visualWrap: {
    position: 'relative',
  },
  saveWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 30,
    gap: 10,
  },
  kicker: {
    color: archiveColors.primary,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: archiveColors.ink,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: archiveColors.surfaceSoft,
    borderWidth: 1,
    borderColor: archiveColors.hairlineSoft,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tagText: {
    color: archiveColors.body,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
});
