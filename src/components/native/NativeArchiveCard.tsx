import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Href, router } from 'expo-router';
import { ArchiveContent } from '@/src/archive/types';
import { CONTENT_TYPE_LABELS } from '@/src/archive/labels';
import { ArchiveVisual } from '@/src/components/web/ArchiveVisual';
import { SaveButton } from '@/src/components/web/SaveButton';
import { luxuryFonts } from '@/src/theme/luxury';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';

type Props = {
  content: ArchiveContent;
  saved?: boolean;
  onSavePress?: () => void;
};

export function NativeArchiveCard({ content, saved = false, onSavePress }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/content/${content.id}` as Href)}>
      <View style={styles.visualWrap}>
        <ArchiveVisual content={content} height={154} showBadge={false} radius={archiveRadius.lg} roundBottom={false} />
        {onSavePress ? (
          <View style={styles.saveWrap}>
            <SaveButton
              saved={saved}
              onPress={() => {
                onSavePress();
              }}
            />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.kicker}>{CONTENT_TYPE_LABELS[content.contentType]}</Text>
        <Text style={styles.title} numberOfLines={2}>{content.title}</Text>
        {content.subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{content.subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
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
    padding: 14,
    gap: 8,
  },
  kicker: {
    color: archiveColors.muted,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: archiveColors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
});
