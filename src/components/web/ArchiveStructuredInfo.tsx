import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Bathtub,
  BookOpen,
  Buildings,
  CalendarCheck,
  CheckCircle,
  Clock,
  ClockClockwise,
  CurrencyDollar,
  Gauge,
  HouseLine,
  ListChecks,
  Lock,
  MapPin,
  Package,
  SlidersHorizontal,
  Sparkle,
  SquaresFour,
  User,
  Wrench,
  XCircle,
  type PhosphorIcon,
} from '@/src/components/web/phosphorIcons';
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

const ROW_ICONS: Record<string, PhosphorIcon> = {
  '소요 시간': Clock,
  '욕조 필요': Bathtub,
  '필요 아이템': Package,
  난이도: Gauge,
  '추천 상황': Sparkle,
  환경: HouseLine,
  지역: MapPin,
  '외부인 이용': CheckCircle,
  가격대: CurrencyDollar,
  '예약 필요': CalendarCheck,
  '혼자 이용': User,
  프라이빗: Lock,
  시설: Buildings,
  업데이트: ClockClockwise,
  '아이템 유형': Package,
  '사용 상황': ListChecks,
  '보관 난이도': SlidersHorizontal,
  '관리 난이도': Wrench,
  '추천 대상': Sparkle,
  '비추천 대상': XCircle,
  주제: BookOpen,
  '관련 카테고리': SquaresFour,
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
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>구조화 정보</Text>
      </View>
      <View style={styles.grid}>
        {getRows(content).map(([label, value]) => {
          const IconComponent = ROW_ICONS[label];

          return (
            <View style={styles.row} key={label}>
              <View style={styles.iconBox}>
                {IconComponent ? <IconComponent size={16} color={archiveColors.primaryActive} weight="regular" /> : null}
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{formatValue(value)}</Text>
              </View>
            </View>
          );
        })}
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
    overflow: 'hidden',
  },
  panelHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: archiveColors.hairline,
  },
  panelTitle: {
    color: archiveColors.ink,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  grid: {
    gap: 0,
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 217, 204, 0.56)',
    paddingVertical: 14,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: archiveColors.primarySoft,
    marginTop: 1,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },
  label: {
    color: archiveColors.muted,
    fontSize: 12,
    fontWeight: '500',
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
