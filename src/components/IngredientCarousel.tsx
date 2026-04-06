import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Linking,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ingredient } from '@/src/engine/types';
import {
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/src/data/colors';

interface IngredientCarouselProps {
  ingredients: Ingredient[];
  accentColor: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.max(160, SCREEN_WIDTH * 0.54);
const CARD_SPACING = 10;

export function IngredientCarousel({
  ingredients,
  accentColor,
}: IngredientCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleOpenPurchase = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      // no-op for invalid/blocked external links in test environments
    }
  };

  const renderItem = ({ item }: { item: Ingredient }) => (
    <View style={[styles.card, { width: CARD_WIDTH }]}> 
      <View style={[styles.iconArea, { backgroundColor: accentColor + '15' }]}> 
        <Text style={styles.iconEmoji}>🧴</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.nameKo}>{item.nameKo}</Text>
        <Text style={styles.nameEn}>{item.nameEn}</Text>
        <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
      </View>

      <TouchableOpacity
        style={[styles.purchaseButton, { backgroundColor: accentColor }]}
        onPress={() => handleOpenPurchase(item.purchaseUrl)}
        activeOpacity={0.7}
      >
        <Text style={styles.purchaseText}>구매하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>준비물</Text>
      <Text style={styles.subtitle}>{ingredients.length}가지 재료를 준비해주세요</Text>

      <FlatList
        data={ingredients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
      />

      {ingredients.length > 1 && (
        <View style={styles.dots}>
          {ingredients.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? accentColor : accentColor + '30',
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: CARD_SURFACE,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    ...Platform.select({
      web: {
        boxShadow: `0px 4px 12px ${CARD_SHADOW}`,
      },
      default: {
        shadowColor: CARD_SHADOW,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
  iconArea: {
    width: 56,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconEmoji: {
    fontSize: 26,
  },
  cardContent: {
    flex: 1,
  },
  nameKo: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 1,
  },
  nameEn: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 16,
  },
  purchaseButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  purchaseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
