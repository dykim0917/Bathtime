import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet, Platform } from 'react-native';
import { Ingredient } from '@/src/engine/types';
import { TYPE_SCALE, V2_BORDER, V2_SHADOW, V2_SURFACE, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';

interface PreparationListProps {
  ingredients: Ingredient[];
  accentColor: string;
}

export function PreparationList({
  ingredients,
  accentColor,
}: PreparationListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>준비물</Text>
      {ingredients.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.nameKo}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
          {item.purchaseUrl && (
            <Pressable
              style={[styles.linkButton, { borderColor: accentColor }]}
              onPress={() => Linking.openURL(item.purchaseUrl!)}
            >
              <Text style={[styles.linkText, { color: accentColor }]}>
                구매
              </Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    color: V2_TEXT_PRIMARY,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: V2_SURFACE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: V2_BORDER,
    ...Platform.select({
      web: {
        boxShadow: `0px 2px 8px ${V2_SHADOW}`,
      },
      default: {
        shadowColor: V2_SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: TYPE_SCALE.body + 1,
    fontWeight: '600',
    color: V2_TEXT_PRIMARY,
    marginBottom: 2,
  },
  desc: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_SECONDARY,
    lineHeight: 16,
  },
  linkButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  linkText: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '600',
  },
});
