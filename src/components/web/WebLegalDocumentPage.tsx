import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import type { LegalBulletSection } from '@/src/legal/legalContent';

type Props = {
  title: string;
  subtitle: string;
  effectiveDate: string;
  labels?: readonly { title: string; value: string }[];
  sections: LegalBulletSection[];
};

export function WebLegalDocumentPage({ title, subtitle, effectiveDate, labels, sections }: Props) {
  return (
    <WebShell>
      <SeoMetadata title={`${title} - 바스타임`} description={subtitle} />
      <ArchivePageContainer variant="narrow">
        <View style={webStyles.pageStack}>
          <View style={webStyles.header}>
            <Text style={webStyles.eyebrow}>BATH TIME LEGAL</Text>
            <Text style={webStyles.title}>{title}</Text>
            <Text style={webStyles.lede}>{subtitle}</Text>
            <Text style={styles.effectiveDate}>시행일 {effectiveDate}</Text>
          </View>

          {labels ? (
            <View style={styles.labelGrid}>
              {labels.map((label) => (
                <View key={label.title} style={styles.labelItem}>
                  <Text style={styles.labelTitle}>{label.title}</Text>
                  <Text style={styles.labelValue}>{label.value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.sectionList}>
            {sections.map((section) => (
              <View key={section.title} style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.body ? <Text style={styles.sectionBody}>{section.body}</Text> : null}
                {section.bullets?.map((bullet) => (
                  <View key={bullet} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>-</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  effectiveDate: {
    color: archiveColors.muted,
    fontSize: 13,
    fontFamily: luxuryFonts.sans,
  },
  labelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  labelItem: {
    width: '31.8%',
    minWidth: 180,
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 6,
  },
  labelTitle: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  labelValue: {
    color: archiveColors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  sectionList: {
    gap: 14,
  },
  sectionCard: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 10,
  },
  sectionTitle: {
    color: archiveColors.ink,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '800',
    fontFamily: luxuryFonts.display,
  },
  sectionBody: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 23,
    fontFamily: luxuryFonts.sans,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletMark: {
    color: archiveColors.primary,
    fontSize: 14,
    lineHeight: 23,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  bulletText: {
    flex: 1,
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 23,
    fontFamily: luxuryFonts.sans,
  },
});
