import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BORDER,
  V2_SURFACE_GHOST,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';
import { getTripCardImage, TripImageVariant } from '@/src/data/tripImages';
import { AppIconBadge, getTripIntentBadgeTone } from '@/src/components/AppIconBadge';

interface TripThemeCardProps {
  intentId: string;
  title: string;
  subtitle: string;
  fitLabel?: string;
  safetyBadge?: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
  width: number;
  minHeight?: number;
  variant?: 'default' | 'v2';
  imageVariant?: TripImageVariant;
}

const TRIP_VISUALS: Record<string, { gradient: [string, string]; bloom: string }> = {
  kyoto_forest: { gradient: ['#4D7C68', '#7DAF93'], bloom: 'rgba(205, 238, 214, 0.34)' },
  nordic_sauna: { gradient: ['#8A6A4A', '#C9A26D'], bloom: 'rgba(255, 228, 190, 0.3)' },
  rainy_camping: { gradient: ['#3E5E80', '#6F94B4'], bloom: 'rgba(203, 226, 244, 0.28)' },
  snow_cabin: { gradient: ['#53667C', '#8CA1B7'], bloom: 'rgba(226, 237, 247, 0.3)' },
};

const TRIP_VISUALS_V2: Record<string, { gradient: [string, string]; bloom: string }> = {
  kyoto_forest: { gradient: ['#102C26', '#285243'], bloom: 'rgba(119, 185, 146, 0.24)' },
  nordic_sauna: { gradient: ['#33251A', '#6C4C2D'], bloom: 'rgba(201, 164, 91, 0.24)' },
  rainy_camping: { gradient: ['#0F2336', '#234B68'], bloom: 'rgba(100, 153, 189, 0.22)' },
  snow_cabin: { gradient: ['#122033', '#314A65'], bloom: 'rgba(181, 203, 229, 0.18)' },
};

export function TripThemeCard({
  intentId,
  title,
  subtitle,
  fitLabel,
  safetyBadge,
  disabled = false,
  disabledText,
  onPress,
  width,
  minHeight = 148,
  variant = 'default',
  imageVariant = 'deep',
}: TripThemeCardProps) {
  const isV2 = variant === 'v2';
  const visual = (isV2 ? TRIP_VISUALS_V2 : TRIP_VISUALS)[intentId] ?? (isV2 ? TRIP_VISUALS_V2.kyoto_forest : TRIP_VISUALS.kyoto_forest);
  const imageSource = getTripCardImage(intentId, imageVariant);
  const tripTone = getTripIntentBadgeTone(intentId, isV2);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, isV2 && styles.cardV2, { width, minHeight }]}
    >
      {imageSource ? (
        <ImageBackground source={imageSource} style={StyleSheet.absoluteFillObject} imageStyle={styles.image}>
          <View style={styles.imageOverlay} />
        </ImageBackground>
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: visual.gradient[0] }]} />
      )}
      <View style={[styles.scrim, isV2 && styles.scrimV2]} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <AppIconBadge
            spec={tripTone.spec}
            size={34}
            iconSize={16}
            color={tripTone.color}
            backgroundColor={tripTone.backgroundColor}
            borderColor={tripTone.borderColor}
          />
          {(fitLabel || safetyBadge) ? (
            <View style={styles.badgeRow}>
            {fitLabel ? <Text style={[styles.fitBadge, isV2 && styles.fitBadgeV2]}>{fitLabel}</Text> : null}
            {safetyBadge ? <Text style={[styles.safetyBadge, isV2 && styles.safetyBadgeV2]}>{safetyBadge}</Text> : null}
            </View>
          ) : <View />}
        </View>
        <Text style={[styles.title, disabled && styles.titleDisabled, isV2 && styles.titleV2]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.subtitle, disabled && styles.subtitleDisabled, isV2 && styles.subtitleV2]} numberOfLines={2}>
          {subtitle}
        </Text>
        {disabled && disabledText ? (
          <Text style={[styles.disabledText, isV2 && styles.disabledTextV2]} numberOfLines={2}>
            {disabledText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: luxuryRadii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V2_BORDER,
    justifyContent: 'flex-end',
  },
  cardV2: {
    borderColor: V2_BORDER,
  },
  bloom: {
    position: 'absolute',
    top: -26,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  bloomSmall: {
    position: 'absolute',
    bottom: 16,
    left: -16,
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  image: {
    borderRadius: luxuryRadii.card,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '118%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 11, 22, 0.12)',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 20, 36, 0.18)',
  },
  scrimV2: {
    backgroundColor: 'rgba(4, 9, 23, 0.28)',
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    flex: 1,
  },
  fitBadge: {
    fontSize: TYPE_SCALE.caption - 1,
    lineHeight: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    color: '#F2F7FF',
    backgroundColor: 'rgba(15, 31, 53, 0.4)',
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  fitBadgeV2: {
    color: V2_TEXT_PRIMARY,
    backgroundColor: V2_SURFACE_GHOST,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  safetyBadge: {
    fontSize: TYPE_SCALE.caption - 1,
    lineHeight: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    color: '#3B2000',
    backgroundColor: 'rgba(255, 226, 191, 0.95)',
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  safetyBadgeV2: {
    color: V2_WARNING,
    backgroundColor: V2_ACCENT_SOFT,
    borderWidth: 1,
    borderColor: 'rgba(215, 168, 94, 0.3)',
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title + 1,
    lineHeight: 24,
    fontFamily: luxuryFonts.display,
  },
  titleV2: {
    color: V2_TEXT_PRIMARY,
  },
  titleDisabled: {
    color: '#E5E7EB',
  },
  subtitle: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  subtitleV2: {
    color: V2_TEXT_SECONDARY,
  },
  subtitleDisabled: {
    color: '#D1D5DB',
  },
  disabledText: {
    marginTop: 1,
    color: V2_ACCENT,
    fontWeight: '700',
    fontSize: TYPE_SCALE.caption,
    lineHeight: 16,
    fontFamily: luxuryFonts.sans,
  },
  disabledTextV2: {
    color: V2_ACCENT,
  },
});
