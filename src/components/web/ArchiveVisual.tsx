import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ArchiveContent, ContentCategory } from '@/src/archive/types';
import { CATEGORY_LABELS } from '@/src/archive/labels';
import { getCareHeroImage } from '@/src/data/careImages';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

const CATEGORY_IMAGES: Record<ContentCategory, number> = {
  HOME_BATH: require('@/assets/images/care/sleep_ready_lite.jpg'),
  BATH_PLACES: require('@/assets/images/trip/nordic_sauna_lite.jpg'),
  BATH_ITEMS: require('@/assets/images/products/bs_v1_003.jpg'),
  TIPS_CULTURE: require('@/assets/images/trip/rainy_camping_lite.jpg'),
};

function getImageSource(content: ArchiveContent) {
  const uri = content.heroImage?.uri;
  if (!uri || uri.startsWith('category-')) return CATEGORY_IMAGES[content.category];
  if (uri.startsWith('care-hero:')) {
    return getCareHeroImage(uri.replace('care-hero:', '')) ?? CATEGORY_IMAGES[content.category];
  }
  return { uri };
}

export function ArchiveVisual({
  content,
  height = 172,
  showBadge = true,
  radius = archiveRadius.lg,
  roundBottom = true,
}: {
  content: ArchiveContent;
  height?: number;
  showBadge?: boolean;
  radius?: number;
  roundBottom?: boolean;
}) {
  const radiusStyle = roundBottom
    ? { borderRadius: radius }
    : {
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      };

  return (
    <View style={[styles.visual, { height }, radiusStyle]}>
      <Image
        source={getImageSource(content)}
        resizeMode="cover"
        style={[StyleSheet.absoluteFillObject, styles.absoluteImage, styles.image, radiusStyle]}
      />
      {showBadge ? (
        <View style={styles.badge}>
          <Text style={styles.label}>{CATEGORY_LABELS[content.category]}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  visual: {
    width: '100%',
    borderRadius: archiveRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surfaceSoft,
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: archiveRadius.lg,
  },
  absoluteImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    alignSelf: 'flex-start',
    margin: 12,
    borderRadius: archiveRadius.full,
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    color: archiveColors.primary,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
});
