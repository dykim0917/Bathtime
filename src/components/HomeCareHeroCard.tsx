import React from 'react';
import { ImageBackground, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TYPE_CAPTION,
  TYPE_SCALE,
  V2_ACCENT,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { CustomIcon, CustomIconName } from '@/src/components/CustomIcon';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';

interface MetaChip {
  iconName: CustomIconName;
  label: string;
}

interface HomeCareHeroCardProps {
  badge?: string;
  eyebrow: string;
  title: string;
  description: string;
  visualLabel: string;
  metaChips: MetaChip[];
  accent: [string, string];
  backgroundSource?: ImageSourcePropType | null;
  fitLabel?: string;
  safetyBadge?: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
}

export function HomeCareHeroCard({
  badge,
  eyebrow,
  title,
  description,
  visualLabel,
  metaChips,
  accent,
  backgroundSource,
  fitLabel,
  safetyBadge,
  disabled = false,
  disabledText,
  onPress,
}: HomeCareHeroCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, disabled && styles.cardDisabled]}
    >
      <LinearGradient
        colors={[`${accent[0]}D9`, `${accent[1]}A6`, 'rgba(8, 11, 18, 0.96)']}
        start={{ x: 0.08, y: 0.08 }}
        end={{ x: 1, y: 1 }}
        style={styles.visualStage}
      >
        {backgroundSource ? (
          <ImageBackground source={backgroundSource} style={StyleSheet.absoluteFillObject} imageStyle={styles.backgroundImage}>
            <View style={styles.imagePhotoOverlay} />
          </ImageBackground>
        ) : null}
        <View style={[styles.visualGlowLarge, { backgroundColor: `${accent[1]}30` }]} />
        <View style={[styles.visualGlowSmall, { backgroundColor: `${accent[0]}22` }]} />
        <View style={styles.visualScrim} />

        <View style={styles.heroTopRow}>
          {visualLabel ? (
            <View style={styles.visualLabelWrap}>
              <Text style={styles.visualLabel}>{visualLabel}</Text>
            </View>
          ) : null}
          <View style={styles.topBadgeStack}>
            {fitLabel ? <Text style={styles.fitBadge}>{fitLabel}</Text> : null}
            {safetyBadge ? <Text style={styles.safetyBadge}>{safetyBadge}</Text> : null}
          </View>
        </View>

        <View style={styles.copyBlock}>
          {badge ? <Text style={styles.heroBadge}>{badge}</Text> : null}
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.metaRow}>
            {metaChips.map((chip) => (
              <View key={`${chip.iconName}-${chip.label}`} style={styles.metaChip}>
                <CustomIcon name={chip.iconName} size={13} color={V2_ACCENT} fillColor={V2_ACCENT} strokeColor={V2_ACCENT} />
                <Text style={styles.metaChipText}>{chip.label}</Text>
              </View>
            ))}
          </View>
          {disabled && disabledText ? (
            <Text style={styles.disabledText}>{disabledText}</Text>
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 336,
  },
  cardDisabled: {
    opacity: 0.76,
  },
  backgroundImage: {
    width: '100%',
    height: '118%',
    resizeMode: 'cover',
  },
  imagePhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 7, 16, 0.18)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  topBadgeStack: {
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 1,
  },
  heroBadge: {
    color: V2_ACCENT,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '800',
    letterSpacing: luxuryTracking.eyebrow,
    fontFamily: luxuryFonts.sans,
  },
  fitBadge: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    fontFamily: luxuryFonts.sans,
  },
  safetyBadge: {
    color: V2_WARNING,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 16, 24, 0.42)',
    fontFamily: luxuryFonts.sans,
  },
  visualStage: {
    minHeight: 336,
    borderRadius: luxuryRadii.card,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 20,
  },
  visualGlowLarge: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -48,
    right: -18,
  },
  visualGlowSmall: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    left: -10,
    bottom: 22,
  },
  visualScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 6, 12, 0.34)',
  },
  visualLabelWrap: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(12, 16, 26, 0.46)',
  },
  visualLabel: {
    color: '#F7F2EA',
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: luxuryFonts.sans,
  },
  copyBlock: {
    gap: 8,
    marginTop: 'auto',
    paddingTop: 76,
  },
  eyebrow: {
    color: V2_ACCENT,
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.headingMd,
    lineHeight: 32,
    fontFamily: luxuryFonts.display,
  },
  description: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(7, 10, 18, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metaChipText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  disabledText: {
    marginTop: 2,
    color: V2_TEXT_MUTED,
    fontSize: TYPE_CAPTION,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
});
