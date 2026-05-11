import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Href, router } from 'expo-router';
import { ArchiveContent } from '@/src/archive/types';
import { CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@/src/archive/labels';
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
      <View style={styles.visual}>
        <Text style={styles.visualText}>{CATEGORY_LABELS[content.category]}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.kicker}>{CONTENT_TYPE_LABELS[content.contentType]}</Text>
        <Text style={styles.title} numberOfLines={2}>{content.title}</Text>
        {content.subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{content.subtitle}</Text> : null}
        {onSavePress ? (
          <Pressable
            style={[styles.saveButton, saved && styles.saveButtonActive]}
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              onSavePress();
            }}
          >
            <Text style={[styles.saveButtonText, saved && styles.saveButtonTextActive]}>{saved ? '저장됨' : '저장하기'}</Text>
          </Pressable>
        ) : null}
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
  visual: {
    minHeight: 112,
    justifyContent: 'flex-end',
    padding: 14,
    backgroundColor: archiveColors.primarySoft,
  },
  visualText: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
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
  saveButton: {
    minHeight: 40,
    borderRadius: archiveRadius.md,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonActive: {
    backgroundColor: archiveColors.primary,
    borderColor: archiveColors.primary,
  },
  saveButtonText: {
    color: archiveColors.ink,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  saveButtonTextActive: {
    color: archiveColors.onPrimary,
  },
});
