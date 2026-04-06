import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BathEnvironment, BathRecommendation, HealthCondition, TripMemoryRecord } from '@/src/engine/types';
import { loadHistory } from '@/src/storage/history';
import { loadThemePreferenceWeights, loadTripMemoryHistory } from '@/src/storage/memory';
import { buildHistoryInsights } from '@/src/engine/historyInsights';
import { buildHomeStreakSummary } from '@/src/engine/streaks';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { THEME_BY_ID } from '@/src/data/themes';
import { copy } from '@/src/content/copy';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import {
  CATEGORY_CARD_EMOJI,
  TYPE_BODY,
  TYPE_CAPTION,
  TYPE_HEADING_MD,
  TYPE_TITLE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_ACCENT_TEXT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_BORDER,
  V2_MODAL_SURFACE,
  V2_SHADOW,
  V2_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { ui } from '@/src/theme/ui';

type MyTab = 'history' | 'settings';
type FilterMode = 'all' | 'care' | 'trip';

const FILTER_OPTIONS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'care', label: '케어' },
  { key: 'trip', label: '트립' },
];

const BATH_TYPE_LABELS: Record<string, string> = {
  full: '전신욕',
  half: '반신욕',
  foot: '족욕',
  shower: '샤워',
};

const MODE_LABELS = {
  care: copy.history.cardLabels.modeCare,
  trip: copy.history.cardLabels.modeTrip,
} as const;

const ENV_LABELS_HISTORY = {
  bathtub: '욕조',
  partial_bath: '부분입욕',
  footbath: '족욕',
  shower: '샤워',
} as const;

const ENV_LABELS_SETTINGS: Record<BathEnvironment, string> = {
  bathtub: '🛁 욕조',
  partial_bath: '🦶 부분입욕',
  footbath: '🦶 족욕',
  shower: '🚿 샤워',
};

const CONDITION_LABELS: Record<HealthCondition, string> = {
  hypertension_heart: '⚠️ 고혈압/심장',
  pregnant: '🤰 임신 중',
  diabetes: '🩸 당뇨',
  sensitive_skin: '🌵 민감성 피부',
  none: '✅ 해당 없음',
};

const SIDE_PAD = 18;
const COL_GAP = 10;
const CARD_HEADER_HEIGHT = 100;

function HistorySection() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - SIDE_PAD * 2 - COL_GAP) / 2;

  const [history, setHistory] = useState<BathRecommendation[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<TripMemoryRecord[]>([]);
  const [themeWeights, setThemeWeights] = useState<Record<string, number>>({});
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        loadHistory(),
        loadTripMemoryHistory(),
        loadThemePreferenceWeights(),
      ]).then(([historyData, memoryData, weightData]) => {
        setHistory(historyData);
        setMemoryHistory(memoryData);
        setThemeWeights(weightData);
      });
    }, [])
  );

  const memoryByRecommendation = useMemo(() => {
    return Object.fromEntries(
      memoryHistory.map((record) => [record.recommendationId, record])
    ) as Record<string, TripMemoryRecord>;
  }, [memoryHistory]);

  const topThemeInsight = useMemo(() => {
    const sorted = Object.entries(themeWeights).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;
    const [themeId, weight] = sorted[0];
    const themeTitle = THEME_BY_ID[themeId as keyof typeof THEME_BY_ID]?.title ?? themeId;
    return { themeTitle, weight };
  }, [themeWeights]);

  const insights = useMemo(
    () => buildHistoryInsights(history, memoryHistory),
    [history, memoryHistory]
  );
  const streakSummary = useMemo(
    () => buildHomeStreakSummary(memoryHistory.map((memory) => memory.completionSnapshot.completedAt)),
    [memoryHistory]
  );

  const filteredHistory = useMemo(() => {
    if (filterMode === 'all') return history;
    return history.filter((item) => item.mode === filterMode);
  }, [history, filterMode]);

  const renderCard = ({ item, index }: { item: BathRecommendation; index: number }) => {
    const persona = PERSONA_DEFINITIONS.find((p) => p.code === item.persona);
    const title = item.themeTitle ?? persona?.nameKo ?? copy.history.cardLabels.defaultTitle;
    const emoji = CATEGORY_CARD_EMOJI[item.intentId ?? ''] ?? '🛁';
    const date = new Date(item.createdAt);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    const memory = memoryByRecommendation[item.id];
    const isLeft = index % 2 === 0;

    return (
      <Pressable
        style={[styles.gridCard, { width: cardWidth, marginRight: isLeft ? COL_GAP : 0 }]}
        onPress={() =>
          router.push({
            pathname: '/result/recipe/[id]',
            params: { id: item.id, source: 'history' },
          })
        }
      >
        <View style={[styles.gridCardHeader, { backgroundColor: `${item.colorHex}22` }]}> 
          <View style={styles.gridCardGlow} />
          <Text style={styles.gridCardEmoji}>{emoji}</Text>
          <View style={[styles.modePill, { backgroundColor: `${item.colorHex}33` }]}> 
            <Text style={styles.modePillText}>{MODE_LABELS[item.mode]}</Text>
          </View>
        </View>
        <View style={styles.gridCardFooter}>
          <Text style={styles.gridCardTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.gridCardMeta}>
            {item.temperature.recommended}°C · {BATH_TYPE_LABELS[item.bathType]}
          </Text>
          <View style={styles.gridCardBottom}>
            <Text style={styles.gridCardDate}>{dateStr}</Text>
            {memory?.narrativeRecallCard ? (
              <FontAwesome name="comment-o" size={10} color={V2_TEXT_MUTED} />
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <View style={[ui.glassCardV2, styles.heroCard]}>
        <Text style={styles.eyebrow}>MY ARCHIVE</Text>
        <Text style={styles.pageTitle}>기록</Text>
        <Text style={styles.pageSubtitle}>
          {history.length > 0
            ? `총 ${history.length}개의 루틴을 완료했어요`
            : '첫 루틴을 시작해보세요'}
        </Text>
      </View>

      <View style={[ui.glassCardV2, styles.streakCard]}>
        <Text style={styles.streakTitle}>{copy.home.streakTitle}</Text>
        <Text style={styles.streakTodayText}>
          {streakSummary.todayDone ? copy.home.todayDone : copy.home.todayPending}
        </Text>
        <View style={styles.streakWeekRow}>
          {streakSummary.dailyCheck.map((item) => (
            <View key={item.dateKey} style={styles.streakDayItem}>
              <Text style={[styles.streakDayLabel, item.isToday && styles.streakTodayLabel]}>
                {item.weekdayLabel}
              </Text>
              <Text style={[styles.streakDayMark, item.done && styles.streakDayMarkDone]}>
                {item.done ? '✔' : '-'}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.streakCountText}>
          {copy.home.weeklyCount(streakSummary.weeklyBathCount, streakSummary.weeklyGoal)}
        </Text>
        <Text style={styles.streakMetaText}>
          {copy.home.dailyStreak(streakSummary.dailyStreakDays)} {'\u00b7'}{' '}
          {copy.home.weeklyStreak(streakSummary.weeklyStreakWeeks)}
        </Text>
      </View>

      {history.length > 0 && (
        <View style={[ui.glassCardV2, styles.insightBanner]}>
          <View style={styles.insightBannerLeft}>
            <Text style={styles.insightBannerLabel}>MONTHLY SUMMARY</Text>
            <Text style={styles.insightBannerMain}>{insights.totalSessions}회 완료</Text>
            {insights.avgDurationMinutes > 0 && (
              <Text style={styles.insightBannerSub}>
                평균 {insights.avgDurationMinutes}분
                {insights.topEnvironment ? ` · ${ENV_LABELS_HISTORY[insights.topEnvironment]}` : ''}
              </Text>
            )}
            {topThemeInsight && (
              <Text style={styles.insightBannerTheme}>
                자주 찾은 테마: {topThemeInsight.themeTitle} · {topThemeInsight.weight}
              </Text>
            )}
          </View>
          <View style={styles.insightBannerIcon}>
            <Text style={styles.insightBannerEmoji}>🛁</Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[ui.pillButtonV2, styles.filterPill, filterMode === opt.key && ui.pillButtonV2Active]}
            onPress={() => setFilterMode(opt.key)}
          >
            <Text style={[styles.filterPillText, filterMode === opt.key && styles.filterPillTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {filteredHistory.length > 0 && (
        <Text style={styles.gridSectionLabel}>{filteredHistory.length}개의 루틴</Text>
      )}
    </View>
  );

  return (
    <View style={styles.historyContainer}>
      {filteredHistory.length === 0 && history.length === 0 ? (
        <>
          <ListHeader />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>{copy.history.empty.title}</Text>
            <Text style={styles.emptySubtext}>{copy.history.empty.subtitle}</Text>
          </View>
        </>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          numColumns={2}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={
            <View style={styles.filterEmptyContainer}>
              <Text style={styles.filterEmptyText}>
                {filterMode === 'care' ? '케어' : '트립'} 루틴 기록이 없어요
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function SettingsSection() {
  const { profile, loading, update, clear } = useUserProfile();
  const haptic = useHaptic();
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      router.replace('/onboarding');
    }
  }, [loading, profile]);

  const handleEnvironmentChange = async (environment: BathEnvironment) => {
    if (!profile) return;
    if (profile.bathEnvironment === environment) return;
    haptic.light();
    await update({ bathEnvironment: environment });
  };

  const handleHealthToggle = async (condition: HealthCondition) => {
    if (!profile) return;
    const next = new Set(profile.healthConditions);
    if (condition === 'none') {
      next.clear();
      next.add('none');
    } else {
      next.delete('none');
      if (next.has(condition)) {
        next.delete(condition);
      } else {
        next.add(condition);
      }
      if (next.size === 0) {
        next.add('none');
      }
    }
    haptic.light();
    await update({ healthConditions: Array.from(next) });
  };

  const runReset = async () => {
    if (isResetting) return;
    try {
      setIsResetting(true);
      haptic.warning();
      await clear();
      setResetModalVisible(false);
      router.replace('/onboarding');
    } catch {
      Alert.alert('오류', '프로필 초기화 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetOnboarding = () => {
    haptic.light();
    setResetModalVisible(true);
  };

  if (loading || !profile) {
    return (
      <View style={[styles.settingsContainer, styles.settingsCentered]}>
        <Text style={{ color: V2_TEXT_SECONDARY }}>{copy.settings.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.settingsContainer}>
      <ScrollView contentContainerStyle={styles.settingsContent} showsVerticalScrollIndicator={false}>
        <View style={[ui.glassCardV2, styles.settingsHeroCard]}>
          <Text style={styles.eyebrow}>PROFILE SETTINGS</Text>
          <Text style={styles.pageTitle}>설정</Text>
          <Text style={styles.pageSubtitle}>환경과 건강 상태를 현재 기준에 맞게 바로 저장합니다.</Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>{copy.settings.sectionProfile}</Text>
          <View style={[ui.glassCardV2, styles.infoCard]}>
            <Text style={styles.infoLabel}>{copy.settings.environmentLabel}</Text>
            <Text style={styles.infoValue}>{ENV_LABELS_SETTINGS[profile.bathEnvironment]}</Text>
          </View>
          <View style={styles.environmentList}>
            {(Object.keys(ENV_LABELS_SETTINGS) as BathEnvironment[]).map((env) => (
              <TouchableOpacity
                key={env}
                style={[
                  ui.pillButtonV2,
                  styles.conditionTagButton,
                  profile.bathEnvironment === env && ui.pillButtonV2Active,
                ]}
                onPress={() => handleEnvironmentChange(env)}
                activeOpacity={0.78}
              >
                <Text style={[styles.conditionTag, profile.bathEnvironment === env && styles.conditionTagActiveText]}>
                  {ENV_LABELS_SETTINGS[env]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[ui.glassCardV2, styles.infoCardColumn]}>
            <Text style={styles.infoLabel}>{copy.settings.healthLabel}</Text>
            <View style={styles.conditionsList}>
              {(Object.keys(CONDITION_LABELS) as HealthCondition[]).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    ui.pillButtonV2,
                    styles.conditionTagButton,
                    profile.healthConditions.includes(c) && ui.pillButtonV2Active,
                  ]}
                  onPress={() => handleHealthToggle(c)}
                  activeOpacity={0.78}
                >
                  <Text style={[styles.conditionTag, profile.healthConditions.includes(c) && styles.conditionTagActiveText]}>
                    {CONDITION_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helperText}>항목을 탭하면 바로 저장됩니다.</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>{copy.settings.sectionActions}</Text>
          <TouchableOpacity style={[ui.glassCardV2, styles.actionCard]} onPress={handleResetOnboarding} activeOpacity={0.78}>
            <Text style={styles.actionText}>{copy.settings.resetProfile}</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>{copy.settings.sectionApp}</Text>
          <View style={[ui.glassCardV2, styles.infoCard]}>
            <Text style={styles.infoLabel}>{copy.settings.versionLabel}</Text>
            <Text style={styles.infoValue}>3.12.0</Text>
          </View>
          <View style={[ui.glassCardV2, styles.infoCard]}>
            <Text style={styles.infoLabel}>{copy.settings.nameLabel}</Text>
            <Text style={styles.infoValue}>Bath Sommelier</Text>
          </View>
          <PersistentDisclosure style={styles.disclosureInline} showColdWarning variant="v2" />
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={resetModalVisible}
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{copy.settings.resetDialogTitle}</Text>
            <Text style={styles.modalBody}>{copy.settings.resetDialogBody}</Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setResetModalVisible(false)}
                disabled={isResetting}
              >
                <Text style={styles.modalCancelText}>{copy.settings.resetCancel}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalConfirmButton, isResetting && styles.modalButtonDisabled]}
                onPress={() => {
                  void runReset();
                }}
                disabled={isResetting}
              >
                <Text style={styles.modalConfirmText}>
                  {isResetting ? '초기화 중...' : copy.settings.resetConfirm}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function MyScreen() {
  const [activeTab, setActiveTab] = useState<MyTab>('history');
  const insets = useSafeAreaInsets();

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}> 
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.subTabRow}>
        {(['history', 'settings'] as MyTab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[ui.pillButtonV2, styles.subTabPill, activeTab === tab && ui.pillButtonV2Active]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.subTabText, activeTab === tab && styles.subTabTextActive]}>
              {tab === 'history' ? '기록' : '설정'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'history' ? <HistorySection /> : <SettingsSection />}
    </View>
  );
}

const styles = StyleSheet.create({
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: V2_BORDER,
  },
  subTabPill: {
    minHeight: 42,
  },
  subTabText: {
    fontSize: TYPE_BODY,
    fontWeight: '600',
    color: V2_TEXT_SECONDARY,
  },
  subTabTextActive: {
    color: V2_ACCENT,
  },
  historyContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 32,
  },
  listHeader: {
    paddingTop: 12,
    marginBottom: 16,
    gap: 14,
  },
  heroCard: {
    padding: 18,
    gap: 6,
  },
  settingsHeroCard: {
    padding: 18,
    gap: 6,
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: 1.2,
  },
  pageTitle: {
    fontSize: TYPE_HEADING_MD,
    fontWeight: '800',
    color: V2_TEXT_PRIMARY,
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: TYPE_BODY,
    color: V2_TEXT_SECONDARY,
  },
  streakCard: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  streakTitle: {
    color: V2_TEXT_PRIMARY,
    fontWeight: '800',
    fontSize: TYPE_BODY,
  },
  streakTodayText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION,
    fontWeight: '600',
  },
  streakWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 6,
  },
  streakDayItem: {
    alignItems: 'center',
    gap: 2,
    minWidth: 35,
  },
  streakDayLabel: {
    color: V2_TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
  },
  streakTodayLabel: {
    color: V2_ACCENT,
    fontWeight: '700',
  },
  streakDayMark: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
  },
  streakDayMarkDone: {
    color: V2_ACCENT,
  },
  streakCountText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_BODY,
    fontWeight: '700',
  },
  streakMetaText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION,
    fontWeight: '600',
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  insightBannerLeft: {
    flex: 1,
  },
  insightBannerLabel: {
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  insightBannerMain: {
    fontSize: TYPE_TITLE,
    fontWeight: '800',
    color: V2_TEXT_PRIMARY,
    marginBottom: 4,
  },
  insightBannerSub: {
    fontSize: TYPE_CAPTION,
    color: V2_TEXT_SECONDARY,
    lineHeight: 18,
  },
  insightBannerTheme: {
    fontSize: TYPE_CAPTION,
    color: V2_TEXT_MUTED,
    marginTop: 4,
  },
  insightBannerIcon: {
    marginLeft: 16,
  },
  insightBannerEmoji: {
    fontSize: 40,
  },
  filterScroll: {
    marginBottom: 4,
  },
  filterContent: {
    gap: 8,
    paddingRight: 4,
  },
  filterPill: {
    minHeight: 42,
  },
  filterPillText: {
    fontSize: TYPE_BODY,
    fontWeight: '600',
    color: V2_TEXT_SECONDARY,
  },
  filterPillTextActive: {
    color: V2_ACCENT,
  },
  gridSectionLabel: {
    fontSize: TYPE_CAPTION,
    color: V2_TEXT_MUTED,
    marginBottom: 2,
    fontWeight: '600',
  },
  gridCard: {
    backgroundColor: V2_SURFACE,
    borderRadius: 18,
    marginBottom: COL_GAP,
    borderWidth: 1,
    borderColor: V2_BORDER,
    shadowColor: V2_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  gridCardHeader: {
    height: CARD_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  gridCardGlow: {
    position: 'absolute',
    top: -18,
    right: -10,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  gridCardEmoji: {
    fontSize: 36,
  },
  modePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: V2_TEXT_PRIMARY,
  },
  gridCardFooter: {
    padding: 10,
  },
  gridCardTitle: {
    fontSize: TYPE_BODY,
    fontWeight: '700',
    color: V2_TEXT_PRIMARY,
    marginBottom: 2,
    lineHeight: 19,
  },
  gridCardMeta: {
    fontSize: TYPE_CAPTION,
    color: V2_TEXT_SECONDARY,
    marginBottom: 6,
  },
  gridCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridCardDate: {
    fontSize: TYPE_CAPTION,
    color: V2_TEXT_MUTED,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: V2_TEXT_PRIMARY,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: TYPE_BODY,
    color: V2_TEXT_SECONDARY,
    textAlign: 'center',
  },
  filterEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  filterEmptyText: {
    fontSize: TYPE_BODY,
    color: V2_TEXT_MUTED,
  },
  settingsContainer: {
    flex: 1,
  },
  settingsCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    paddingHorizontal: SIDE_PAD,
    paddingTop: 12,
    paddingBottom: 28,
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingsSectionTitle: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: V2_TEXT_PRIMARY,
    marginBottom: 10,
  },
  infoCard: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoCardColumn: {
    padding: 15,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: TYPE_BODY,
    color: V2_TEXT_SECONDARY,
    marginBottom: 10,
  },
  infoValue: {
    fontSize: TYPE_BODY,
    fontWeight: '600',
    color: V2_TEXT_PRIMARY,
  },
  environmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  conditionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionTagButton: {
    minHeight: 40,
  },
  conditionTag: {
    fontSize: 12,
    color: V2_TEXT_PRIMARY,
    paddingHorizontal: 2,
  },
  conditionTagActiveText: {
    color: V2_ACCENT,
    fontWeight: '700',
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: V2_TEXT_MUTED,
  },
  actionCard: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: TYPE_BODY,
    color: V2_TEXT_PRIMARY,
    fontWeight: '600',
  },
  actionArrow: {
    fontSize: 18,
    color: V2_ACCENT,
  },
  disclosureInline: {
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 8, 21, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: V2_MODAL_SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: V2_BORDER,
    padding: 18,
    shadowColor: V2_SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  modalTitle: {
    fontSize: TYPE_TITLE,
    fontWeight: '800',
    color: V2_TEXT_PRIMARY,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: TYPE_BODY,
    color: V2_TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  modalCancelButton: {
    borderColor: V2_BORDER,
    backgroundColor: V2_SURFACE,
  },
  modalConfirmButton: {
    borderColor: V2_ACCENT,
    backgroundColor: V2_ACCENT,
  },
  modalCancelText: {
    color: V2_TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: TYPE_CAPTION,
  },
  modalConfirmText: {
    color: V2_ACCENT_TEXT,
    fontWeight: '800',
    fontSize: TYPE_CAPTION,
  },
  modalButtonDisabled: {
    opacity: 0.72,
  },
});
