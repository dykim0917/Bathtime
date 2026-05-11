import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { NativeScreen } from '@/src/components/native/NativeScreen';
import { BathRecommendation } from '@/src/engine/types';
import { loadHistory } from '@/src/storage/history';
import { luxuryFonts } from '@/src/theme/luxury';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';

export default function HistoryScreen() {
  const [items, setItems] = useState<BathRecommendation[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setItems).catch(() => setItems([]));
    }, [])
  );

  return (
    <NativeScreen eyebrow="HISTORY" title="의식 기록" subtitle="완료했거나 저장했던 바스타임 추천을 다시 확인합니다.">
      {items.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.title}>아직 기록이 없습니다.</Text>
          <Text style={styles.body}>의식을 실행하면 이곳에 기록이 쌓입니다.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.meta}>{item.mode === 'trip' ? '무드' : '컨디션'} · {item.temperature.recommended}°C</Text>
              <Text style={styles.title}>{item.themeTitle ?? item.intentId ?? '바스타임 의식'}</Text>
              <Text style={styles.body} numberOfLines={2}>
                {item.durationMinutes ? `${item.durationMinutes}분` : '자유 시간'} · {item.environmentUsed}
              </Text>
            </View>
          ))}
        </View>
      )}
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 8,
  },
  meta: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: archiveColors.ink,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  body: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
});
