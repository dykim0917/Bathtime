import React from 'react';
import { Href, router } from 'expo-router';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
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
      { icon: 'clock' as const, label: `${info.durationMinutes ?? '-'}분` },
      { icon: 'bathtub' as const, label: info.bathRequired ? '욕조 필요' : '욕조 없음' },
    ];
  }
  if ('publicAccess' in info) {
    return [
      { icon: 'map-pin' as const, label: info.region ?? '지역 미정' },
      { icon: 'check-circle' as const, label: info.publicAccess === 'available' ? '외부인 가능' : '이용 조건 확인' },
    ];
  }
  if ('itemType' in info) {
    return [
      { icon: 'shopping-bag' as const, label: info.itemType ?? '아이템' },
      { icon: 'tag' as const, label: info.priceRange ?? '가격대 미정' },
    ];
  }
  return [{ icon: 'file-text' as const, label: '정리 글' }];
}

export function ArchiveContentCard({ content, saved = false, onSavePress }: Props) {
  const hoverProgress = React.useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(hoverProgress, {
      toValue: hovered ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [hoverProgress, hovered]);

  const imageScale = hoverProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={() => router.push(`/content/${content.id}` as Href)}
    >
    {({ pressed }) => (
    <Animated.View style={[styles.card, pressed && styles.cardPressed]}>
      <View style={styles.visualWrap}>
        <Animated.View style={{ transform: [{ scale: imageScale }] }}>
          <ArchiveVisual content={content} height={194} showBadge={false} radius={archiveRadius.lg} roundBottom={false} />
        </Animated.View>
        {onSavePress ? (
          <View style={styles.saveWrap}>
            <SaveButton saved={saved} onPress={onSavePress} />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <View style={styles.titleArea}>
          <Text style={styles.kicker} numberOfLines={1}>{CATEGORY_LABELS[content.category]} · {CONTENT_TYPE_LABELS[content.contentType]}</Text>
          <Text style={styles.title} numberOfLines={2}>{content.title}</Text>
        </View>
        <View style={styles.contentDivider} />
        <View style={styles.metaArea}>
          <MetaRow items={summaryMeta(content)} />
        </View>
      </View>
    </Animated.View>
    )}
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
  cardPressed: {
    opacity: 0.96,
  },
  visualWrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  saveWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  body: {
    backgroundColor: archiveColors.surface,
  },
  titleArea: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 12,
  },
  contentDivider: {
    height: 1,
    marginHorizontal: 18,
    backgroundColor: archiveColors.hairline,
  },
  metaArea: {
    paddingHorizontal: 18,
    paddingVertical: 13,
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
});
