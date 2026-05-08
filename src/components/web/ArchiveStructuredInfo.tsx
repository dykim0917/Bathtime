import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArchiveContent } from '@/src/archive/types';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

const VALUE_LABELS: Record<string, string> = {
  available: '외부인 이용 가능',
  restricted: '조건부 이용',
  members_only: '회원 전용',
  unknown: '확인 필요',
  public: '공용',
  semi_private: '반개별',
  private: '프라이빗',
  low: '쉬움',
  medium: '보통',
  high: '어려움',
  shower: '샤워',
  footbath: '족욕',
  bath: '입욕',
  home_spa: '홈스파',
  HOME_BATH: '홈케어',
  BATH_PLACES: '목욕 공간',
  BATH_ITEMS: '욕실 아이템',
  TIPS_CULTURE: '읽을거리 / 문화',
};

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).join(', ');
  if (typeof value === 'boolean') return value ? '예' : '아니오';
  if (value === undefined || value === null || value === '') return '미정';
  const text = String(value);
  return VALUE_LABELS[text] ?? text;
}

function getRows(content: ArchiveContent): Array<[string, unknown]> {
  const info = content.structuredInfo;
  if (content.category === 'BATH_PLACES') {
    return [
      ['지역', 'region' in info ? info.region : undefined],
      ['외부인 이용', 'publicAccess' in info ? info.publicAccess : undefined],
      ['가격대', 'priceRange' in info ? info.priceRange : undefined],
      ['예약 필요', 'reservationRequired' in info ? info.reservationRequired : undefined],
      ['혼자 이용', 'suitableForSolo' in info ? info.suitableForSolo : undefined],
      ['프라이빗', 'privateLevel' in info ? info.privateLevel : undefined],
      ['시설', 'facilityTypes' in info ? info.facilityTypes : undefined],
      ['업데이트', 'lastCheckedAt' in info ? info.lastCheckedAt : undefined],
    ];
  }
  if (content.category === 'BATH_ITEMS') {
    return [
      ['아이템 유형', 'itemType' in info ? info.itemType : undefined],
      ['사용 상황', 'useCases' in info ? info.useCases : undefined],
      ['욕조 필요', 'bathRequired' in info ? info.bathRequired : undefined],
      ['보관 난이도', 'storageDifficulty' in info ? info.storageDifficulty : undefined],
      ['관리 난이도', 'maintenanceDifficulty' in info ? info.maintenanceDifficulty : undefined],
      ['가격대', 'priceRange' in info ? info.priceRange : undefined],
      ['추천 대상', 'recommendedFor' in info ? info.recommendedFor : undefined],
      ['비추천 대상', 'notRecommendedFor' in info ? info.notRecommendedFor : undefined],
    ];
  }
  if (content.category === 'TIPS_CULTURE') {
    return [
      ['주제', 'topic' in info ? info.topic : undefined],
      ['관련 카테고리', 'relatedCategories' in info ? info.relatedCategories : undefined],
      ['난이도', 'difficulty' in info ? info.difficulty : undefined],
    ];
  }
  return [
    ['소요 시간', 'durationMinutes' in info ? `${info.durationMinutes}분` : undefined],
    ['욕조 필요', 'bathRequired' in info ? info.bathRequired : undefined],
    ['필요 아이템', 'requiredItems' in info ? info.requiredItems : undefined],
    ['난이도', 'difficulty' in info ? info.difficulty : undefined],
    ['추천 상황', 'recommendedSituations' in info ? info.recommendedSituations : undefined],
    ['환경', 'environment' in info ? info.environment : undefined],
  ];
}

export function ArchiveStructuredInfo({ content }: { content: ArchiveContent }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>구조화 정보</Text>
      <View style={styles.grid}>
        {getRows(content).map(([label, value]) => (
          <View style={styles.row} key={label}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{formatValue(value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    padding: 24,
    gap: 18,
  },
  panelTitle: {
    color: archiveColors.ink,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  grid: {
    gap: 0,
  },
  row: {
    gap: 7,
    borderBottomWidth: 1,
    borderBottomColor: archiveColors.hairline,
    paddingVertical: 14,
  },
  label: {
    color: archiveColors.muted,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  value: {
    color: archiveColors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
});
