import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { TagChip } from './TagChip';
import { TagDefinition } from '@/src/data/tags';
import { useHaptic } from '@/src/hooks/useHaptic';
import { CARD_BORDER, CARD_SHADOW, CARD_SURFACE, TEXT_PRIMARY, TEXT_SECONDARY } from '@/src/data/colors';

interface TagSelectorProps {
  title: string;
  tags: TagDefinition[];
  selectedIds: Set<string>;
  onToggle: (tagId: string) => void;
  accentColor?: string;
}

export function TagSelector({
  title,
  tags,
  selectedIds,
  onToggle,
  accentColor,
}: TagSelectorProps) {
  const haptic = useHaptic();

  const handleToggle = (tagId: string) => {
    haptic.light();
    onToggle(tagId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            label={tag.labelKo}
            emoji={tag.emoji}
            selected={selectedIds.has(tag.id)}
            accentColor={accentColor}
            onPress={() => handleToggle(tag.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: CARD_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 18,
    padding: 14,
    ...Platform.select({
      web: {
        boxShadow: `0px 3px 9px ${CARD_SHADOW}`,
      },
      default: {
        shadowColor: CARD_SHADOW,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 9,
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
