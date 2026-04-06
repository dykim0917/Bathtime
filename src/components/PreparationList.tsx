import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet, Platform } from 'react-native';
import { Ingredient } from '@/src/engine/types';
import { SURFACE, GLASS_BORDER, GLASS_SHADOW, TEXT_PRIMARY, TEXT_SECONDARY } from '@/src/data/colors';

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
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    ...Platform.select({
      web: {
        boxShadow: `0px 2px 8px ${GLASS_SHADOW}`,
      },
      default: {
        shadowColor: GLASS_SHADOW,
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
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  desc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
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
    fontSize: 12,
    fontWeight: '600',
  },
});
