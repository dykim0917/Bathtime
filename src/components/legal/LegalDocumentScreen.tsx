import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TYPE_BODY,
  TYPE_CAPTION,
  TYPE_TITLE,
  V2_ACCENT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import type { LegalBulletSection } from '@/src/legal/legalContent';

export function LegalDocumentScreen({
  title,
  subtitle,
  effectiveDate,
  labels,
  sections,
}: {
  title: string;
  subtitle: string;
  effectiveDate: string;
  labels?: readonly { title: string; value: string }[];
  sections: LegalBulletSection[];
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>BATH TIME LEGAL</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.meta}>시행일 {effectiveDate}</Text>
        </View>

        {labels ? (
          <View style={styles.labelGrid}>
            {labels.map((label) => (
              <View key={label.title} style={[ui.glassCardV2, styles.labelCard]}>
                <Text style={styles.labelTitle}>{label.title}</Text>
                <Text style={styles.labelValue}>{label.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.sections}>
          {sections.map((section) => (
            <View key={section.title} style={[ui.glassCardV2, styles.sectionCard]}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.body ? <Text style={styles.sectionBody}>{section.body}</Text> : null}
              {section.bullets?.map((bullet) => (
                <View key={bullet} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 16,
  },
  hero: {
    paddingTop: 14,
    gap: 8,
  },
  eyebrow: {
    color: V2_ACCENT,
    fontSize: TYPE_CAPTION,
    fontFamily: luxuryFonts.sans,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_BODY,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
  },
  meta: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_CAPTION,
    fontFamily: luxuryFonts.sans,
  },
  labelGrid: {
    gap: 10,
  },
  labelCard: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 6,
  },
  labelTitle: {
    color: V2_ACCENT,
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  labelValue: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_BODY,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  sections: {
    gap: 12,
  },
  sectionCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 10,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_TITLE,
    lineHeight: 24,
    fontFamily: luxuryFonts.display,
  },
  sectionBody: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_BODY,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: V2_ACCENT,
    marginTop: 8,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_BODY,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
  },
});
