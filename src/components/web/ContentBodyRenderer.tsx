import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CareCTA, ContentBodyBlock } from '@/src/archive/types';
import { getCareGuideImage } from '@/src/data/careImages';
import { FileText } from '@/src/components/web/phosphorIcons';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

function getBodyImageSource(uri: string) {
  if (uri.startsWith('care-guide:')) {
    return getCareGuideImage(uri.replace('care-guide:', ''));
  }
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return { uri };
  }
  return null;
}

const GUIDE_IMAGE_ASPECT_RATIOS: Record<string, number> = {
  cold_relief: 1448 / 1086,
  edema_relief: 1672 / 941,
  hangover_relief: 1672 / 941,
  menstrual_relief: 1672 / 941,
  mood_lift: 1536 / 1024,
  muscle_relief: 1672 / 941,
  sleep_ready: 1491 / 1055,
  stress_relief: 1672 / 941,
};

function getImageAspectRatio(uri: string, explicitAspectRatio?: number): number {
  if (typeof explicitAspectRatio === 'number' && Number.isFinite(explicitAspectRatio) && explicitAspectRatio > 0) {
    return explicitAspectRatio;
  }
  if (uri.startsWith('care-guide:')) {
    return GUIDE_IMAGE_ASPECT_RATIOS[uri.replace('care-guide:', '')] ?? 4 / 3;
  }
  return 4 / 3;
}

function getImageBackgroundColor(uri: string): string {
  if (uri.startsWith('care-guide:')) return '#F5EFE7';
  return archiveColors.canvas;
}

export function ContentBodyRenderer({
  blocks,
  onCtaPress,
  inlineCta,
}: {
  blocks: ContentBodyBlock[];
  onCtaPress?: (cta: CareCTA) => void;
  inlineCta?: CareCTA;
}) {
  let inlineCtaRendered = false;

  return (
    <View style={styles.stack}>
      {blocks.map((block, index) => {
        if ('legacyFallback' in block && block.legacyFallback) {
          return null;
        }
        if (block.type === 'heroIntro') {
          return (
            <View key={index} style={styles.heroIntro}>
              <Text style={styles.eyebrow}>{block.eyebrow}</Text>
              <Text style={styles.heroTitle}>{block.title}</Text>
              <View style={styles.cardStack}>
                {block.intro.map((text) => <Text key={text} style={styles.paragraph}>{text}</Text>)}
              </View>
            </View>
          );
        }
        if (block.type === 'aha') {
          return (
            <View key={index} style={styles.ahaBox}>
              <Text style={styles.cardTitle}>{block.title}</Text>
              <Text style={styles.ahaText}>{block.text}</Text>
            </View>
          );
        }
        if (block.type === 'mechanism') {
          return (
            <View key={index} style={styles.panel}>
              <Text style={styles.cardTitle}>{block.title}</Text>
              {block.subtitle ? <Text style={styles.cardSubtitle}>{block.subtitle}</Text> : null}
              <View style={styles.cardStack}>
                {block.steps.map((step, stepIndex) => (
                  <View key={`${step.label}-${stepIndex}`} style={styles.stepRow}>
                    <Text style={styles.stepNumber}>{stepIndex + 1}</Text>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepLabel}>{step.label}</Text>
                      <Text style={styles.paragraph}>{step.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        }
        if (block.type === 'evidenceCard') {
          return (
            <View key={index} style={styles.panel}>
              <Text style={styles.cardTitle}>{block.title}</Text>
              {block.intro ? <Text style={styles.cardSubtitle}>{block.intro}</Text> : null}
              <View style={styles.cardStack}>
                {block.items.map((item) => (
                  <Pressable
                    key={`${item.sourceName}-${item.year ?? ''}`}
                    disabled={!item.url}
                    onPress={() => item.url ? Linking.openURL(item.url) : undefined}
                    style={styles.evidenceLinkCard}
                  >
                    <View style={styles.evidenceLinkHeader}>
                      <View style={styles.evidenceIconBox}>
                        <FileText size={16} color={archiveColors.primaryActive} weight="regular" />
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={styles.stepLabel}>{item.sourceName}{item.year ? ` · ${item.year}` : ''}</Text>
                        <Text style={styles.evidenceSummary}>{item.bathtimeTakeaway}</Text>
                      </View>
                      {item.url ? <Text style={styles.externalMark}>↗</Text> : null}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        }
        if (block.type === 'ritualTimer') {
          return (
            <View key={index} style={styles.timerBox}>
              <Text style={styles.cardTitle}>{block.title}</Text>
              {block.description ? <Text style={styles.cardSubtitle}>{block.description}</Text> : null}
              <Text style={styles.timerMeta}>{block.durationMinutes}분 · {block.environment ?? 'timer'} · {block.timerId}</Text>
              <View style={styles.cardStack}>
                {block.steps.map((step) => (
                  <View key={`${step.timeLabel}-${step.title}`} style={styles.timerStep}>
                    <Text style={styles.timeLabel}>{step.timeLabel}</Text>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepLabel}>{step.title}</Text>
                      <Text style={styles.paragraph}>{step.instruction}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Pressable
                disabled={!onCtaPress}
                onPress={() => onCtaPress?.({
                  label: block.ctaLabel,
                  action: 'start_timer',
                  targetId: block.timerId,
                  emphasis: 'primary',
                })}
                style={styles.primaryCta}
              >
                <Text style={styles.primaryCtaText}>{block.ctaLabel}</Text>
              </Pressable>
            </View>
          );
        }
        if (block.type === 'safetyBox') {
          return (
            <View key={index} style={styles.safetyBox}>
              <Text style={styles.cardTitle}>{block.title}</Text>
              <View style={styles.list}>
                {block.items.map((item) => <Text key={item} style={styles.paragraph}>- {item}</Text>)}
              </View>
              {block.note ? <Text style={styles.safetyNote}>{block.note}</Text> : null}
            </View>
          );
        }
        if (block.type === 'ctaGroup') {
          return (
            <View key={index} style={styles.panel}>
              {block.title ? <Text style={styles.cardTitle}>{block.title}</Text> : null}
              <View style={styles.ctaList}>
                {block.items.map((item) => (
                  <Pressable
                    key={`${item.action}-${item.targetId ?? item.label}`}
                    disabled={!onCtaPress}
                    onPress={() => onCtaPress?.(item)}
                    style={item.emphasis === 'primary' ? styles.primaryCta : styles.secondaryCta}
                  >
                  <Text style={item.emphasis === 'primary' ? styles.primaryCtaText : styles.secondaryCtaText}>
                    {item.label}
                  </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        }
        if (block.type === 'heading') {
          return <Text key={index} style={styles.heading}>{block.text}</Text>;
        }
        if (block.type === 'paragraph') {
          const shouldRenderInlineCta = Boolean(
            inlineCta &&
            !inlineCtaRendered &&
            block.text.includes('배스타임의 결론')
          );

          if (shouldRenderInlineCta) {
            inlineCtaRendered = true;
          }
          const renderedInlineCta = shouldRenderInlineCta ? inlineCta : undefined;

          return (
            <React.Fragment key={index}>
              <Text style={styles.paragraph}>{block.text}</Text>
              {renderedInlineCta ? (
                <Pressable
                  disabled={!onCtaPress}
                  onPress={() => onCtaPress?.(renderedInlineCta)}
                  style={styles.inlineCta}
                >
                  <Text style={styles.primaryCtaText}>{renderedInlineCta.label}</Text>
                </Pressable>
              ) : null}
            </React.Fragment>
          );
        }
        if (block.type === 'list') {
          return (
            <View key={index} style={styles.list}>
              {block.items.map((item) => <Text key={item} style={styles.paragraph}>- {item}</Text>)}
            </View>
          );
        }
        if (block.type === 'quote') {
          return <Text key={index} style={styles.quote}>{block.text}</Text>;
        }
        if (block.type === 'divider') {
          return <View key={index} style={styles.divider} />;
        }
        if (block.type === 'image') {
          const imageSource = getBodyImageSource(block.uri);
          const backgroundColor = getImageBackgroundColor(block.uri);

          return (
            <View key={index} style={[styles.imageBlock, { backgroundColor }]}>
              {imageSource ? (
                <View style={[styles.bodyImageFrame, { aspectRatio: getImageAspectRatio(block.uri, block.aspectRatio), backgroundColor }]}>
                  <Image source={imageSource} style={[StyleSheet.absoluteFillObject, styles.absoluteImage]} resizeMode="cover" />
                </View>
              ) : (
                <View style={styles.imageFallback}>
                  <Text style={styles.paragraph}>{block.caption ?? '이미지'}</Text>
                </View>
              )}
              {block.caption ? <Text style={[styles.imageCaption, { backgroundColor }]}>{block.caption}</Text> : null}
            </View>
          );
        }
        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 18,
  },
  heroIntro: {
    gap: 14,
  },
  eyebrow: {
    color: archiveColors.primaryActive,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  heroTitle: {
    color: archiveColors.ink,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    fontFamily: luxuryFonts.display,
  },
  heading: {
    color: archiveColors.ink,
    fontSize: 22,
    lineHeight: 31,
    fontWeight: '500',
    fontFamily: luxuryFonts.display,
    marginTop: 34,
    marginBottom: 2,
  },
  paragraph: {
    color: archiveColors.body,
    fontSize: 16,
    lineHeight: 28,
    fontFamily: luxuryFonts.sans,
  },
  quote: {
    color: archiveColors.ink,
    fontSize: 15,
    lineHeight: 23,
    backgroundColor: archiveColors.primarySoft,
    borderRadius: archiveRadius.md,
    padding: 14,
    fontFamily: luxuryFonts.sans,
  },
  panel: {
    gap: 14,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    backgroundColor: archiveColors.surface,
    padding: 18,
  },
  ahaBox: {
    gap: 8,
    borderWidth: 1,
    borderColor: archiveColors.brassSoft,
    borderRadius: archiveRadius.lg,
    backgroundColor: archiveColors.brassSoft,
    padding: 14,
  },
  ahaText: {
    color: archiveColors.ink,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  timerBox: {
    gap: 14,
    borderWidth: 1,
    borderColor: archiveColors.primaryDisabled,
    borderRadius: archiveRadius.lg,
    backgroundColor: archiveColors.primarySoft,
    padding: 18,
  },
  safetyBox: {
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(185, 74, 58, 0.26)',
    borderRadius: archiveRadius.lg,
    backgroundColor: 'rgba(185, 74, 58, 0.08)',
    padding: 18,
  },
  cardTitle: {
    color: archiveColors.ink,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  cardSubtitle: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
  },
  cardStack: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: archiveColors.primarySoft,
    color: archiveColors.primaryActive,
    fontSize: 13,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  stepContent: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  stepLabel: {
    color: archiveColors.ink,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  evidenceItem: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: archiveColors.hairlineSoft,
    paddingTop: 12,
  },
  evidenceLinkCard: {
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.canvas,
    padding: 12,
  },
  evidenceLinkHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  evidenceIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: archiveColors.primarySoft,
  },
  evidenceSummary: {
    color: archiveColors.body,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  externalMark: {
    color: archiveColors.primaryActive,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  takeaway: {
    color: archiveColors.primaryActive,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  timerMeta: {
    color: archiveColors.primaryActive,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  timerStep: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 102, 98, 0.14)',
    paddingTop: 12,
  },
  timeLabel: {
    width: 44,
    color: archiveColors.primaryActive,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  ctaList: {
    gap: 10,
  },
  primaryCta: {
    backgroundColor: archiveColors.primaryActive,
    borderRadius: archiveRadius.sm,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: luxuryFonts.sans,
  },
  inlineCta: {
    backgroundColor: archiveColors.primaryActive,
    borderRadius: archiveRadius.sm,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  secondaryCta: {
    borderWidth: 1,
    borderColor: archiveColors.primaryDisabled,
    borderRadius: archiveRadius.sm,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: luxuryFonts.sans,
  },
  primaryCtaText: {
    color: archiveColors.onPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: luxuryFonts.sans,
  },
  secondaryCtaText: {
    color: archiveColors.primaryActive,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: luxuryFonts.sans,
  },
  safetyNote: {
    color: archiveColors.body,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  divider: {
    height: 1,
    backgroundColor: archiveColors.hairline,
  },
  list: {
    gap: 6,
  },
  imageBlock: {
    overflow: 'hidden',
    borderRadius: archiveRadius.lg,
  },
  bodyImageFrame: {
    width: '100%',
    position: 'relative',
  },
  absoluteImage: {
    width: '100%',
    height: '100%',
  },
  imageCaption: {
    color: archiveColors.muted,
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingBottom: 14,
    fontFamily: luxuryFonts.sans,
  },
  imageFallback: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
