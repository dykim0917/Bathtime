import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  TYPE_CAPTION,
  TYPE_SCALE,
  V2_ACCENT,
  V2_WARNING,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';
import { getTripCardImage, TripImageVariant } from '@/src/data/tripImages';

interface HomeTripEditorialCardProps {
  intentId: string;
  title: string;
  subtitle: string;
  destination: string;
  accent: [string, string];
  fitLabel?: string;
  safetyBadge?: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
  width?: number;
  imageVariant?: TripImageVariant;
}

export function HomeTripEditorialCard({
  intentId,
  title,
  subtitle,
  destination,
  accent,
  fitLabel,
  safetyBadge,
  disabled = false,
  disabledText,
  onPress,
  width = 274,
  imageVariant = 'deep',
}: HomeTripEditorialCardProps) {
  const imageSource = getTripCardImage(intentId, imageVariant);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, disabled && styles.cardDisabled, { width }]}
    >
      <View style={[styles.imageArea, { backgroundColor: accent[0] }]}>
        {imageSource ? (
          <ImageBackground source={imageSource} style={StyleSheet.absoluteFillObject} imageStyle={styles.image}>
            <View style={styles.imagePhotoOverlay} />
          </ImageBackground>
        ) : null}
        <View style={styles.imageScrim} />
        <View style={styles.imageTopRow}>
          <Text style={styles.destination}>{destination}</Text>
          {fitLabel ? <Text style={styles.fitBadge}>{fitLabel}</Text> : null}
        </View>
        <View style={styles.imageBottom}>
          <Text style={styles.imageTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.imageSubtitle} numberOfLines={2}>{subtitle}</Text>
          {safetyBadge ? <Text style={styles.safetyBadge}>{safetyBadge}</Text> : null}
          {disabled && disabledText ? (
            <Text style={styles.disabledText} numberOfLines={2}>{disabledText}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: luxuryRadii.card,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 17, 30, 0.96)',
  },
  cardDisabled: {
    opacity: 0.76,
  },
  imageArea: {
    height: 228,
    justifyContent: 'space-between',
    padding: 18,
  },
  image: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '122%',
    borderTopLeftRadius: luxuryRadii.card,
    borderTopRightRadius: luxuryRadii.card,
    resizeMode: 'cover',
  },
  imagePhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 9, 23, 0.06)',
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 24, 0.18)',
  },
  imageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  destination: {
    color: '#F3F6FF',
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: luxuryFonts.sans,
    textTransform: 'uppercase',
  },
  fitBadge: {
    color: '#F3F6FF',
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    fontFamily: luxuryFonts.sans,
  },
  imageBottom: {
    gap: 7,
    marginTop: 'auto',
    paddingTop: 56,
  },
  imageTitle: {
    color: '#FFFFFF',
    fontSize: TYPE_SCALE.title + 5,
    lineHeight: 28,
    fontFamily: luxuryFonts.display,
  },
  imageSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: TYPE_CAPTION,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  safetyBadge: {
    color: V2_WARNING,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    fontFamily: luxuryFonts.sans,
  },
  disabledText: {
    color: '#E5E7EB',
    fontSize: TYPE_CAPTION,
    lineHeight: 17,
    fontFamily: luxuryFonts.sans,
  },
});
