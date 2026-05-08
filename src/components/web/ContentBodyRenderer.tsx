import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ContentBodyBlock } from '@/src/archive/types';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

export function ContentBodyRenderer({ blocks }: { blocks: ContentBodyBlock[] }) {
  return (
    <View style={styles.stack}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return <Text key={index} style={styles.heading}>{block.text}</Text>;
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
          return (
            <View key={index} style={styles.imageFallback}>
              <Text style={styles.paragraph}>{block.caption ?? '이미지'}</Text>
            </View>
          );
        }
        return <Text key={index} style={styles.paragraph}>{block.text}</Text>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 18,
  },
  heading: {
    color: archiveColors.ink,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
    fontFamily: luxuryFonts.display,
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
  divider: {
    height: 1,
    backgroundColor: archiveColors.hairline,
  },
  list: {
    gap: 6,
  },
  imageFallback: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
