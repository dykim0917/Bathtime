import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { TagChip } from './TagChip';
import { TagDefinition } from '@/src/data/tags';
import { useHaptic } from '@/src/hooks/useHaptic';
import { V2_BORDER, V2_SHADOW, V2_SURFACE, V2_TEXT_PRIMARY } from '@/src/data/colors';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';

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
    backgroundColor: V2_SURFACE,
    borderWidth: 1,
    borderColor: V2_BORDER,
    borderRadius: luxuryRadii.card,
    padding: 14,
    ...Platform.select({
      web: {
        boxShadow: `0px 10px 20px ${V2_SHADOW}`,
      },
      default: {
        shadowColor: V2_SHADOW,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 15,
    color: V2_TEXT_PRIMARY,
    marginBottom: 10,
    letterSpacing: 0.2,
    fontFamily: luxuryFonts.display,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
