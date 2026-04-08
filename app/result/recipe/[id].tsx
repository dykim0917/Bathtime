import React, { useState, useEffect } from 'react';
import { Alert, Linking, View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BathRecommendation } from '@/src/engine/types';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { getRecommendationById } from '@/src/storage/history';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { copy } from '@/src/content/copy';
import { ProductMatchingModal } from '@/src/components/ProductMatchingModal';
import { ProductDetailModal } from '@/src/components/ProductDetailModal';
import { ProductMatchItem, buildProductMatchingSlots } from '@/src/engine/productMatching';
import {
  CatalogProduct,
  getCatalogProductForIngredient,
  isBeginnerFriendlyProduct,
} from '@/src/data/catalog';
import { useCatalogHydration } from '@/src/data/catalogRuntime';
import { formatTemperature } from '@/src/utils/temperature';
import { formatDuration } from '@/src/utils/time';
import { buildRecipeEvidenceLines } from '@/src/engine/explainability';
import { TYPE_BODY, TYPE_CAPTION, TYPE_HEADING_LG, TYPE_TITLE, V2_ACCENT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_TOP, V2_BORDER, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

const BATH_TYPE_LABELS: Record<string, string> = { full: '전신욕', half: '반신욕', foot: '족욕', shower: '샤워' };
const ENV_LABELS: Record<string, string> = { bathtub: '욕조', partial_bath: '부분입욕', footbath: '족욕', shower: '샤워' };
const HERO_HEIGHT = 268;

export default function RecipeScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const [recommendation, setRecommendation] = useState<BathRecommendation | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  useCatalogHydration();

  useEffect(() => { if (!id) return; getRecommendationById(id).then((rec) => { if (rec) setRecommendation(rec); }); }, [id]);
  if (!recommendation) return <View style={[ui.screenShellV2, styles.centered]}><Text style={{ color: V2_TEXT_SECONDARY }}>{copy.completion.loading}</Text></View>;

  const handleStartBath = () => {
    const navigateToTimer = () => router.replace(`/result/timer/${id}`);
    if (source === 'history') {
      Alert.alert('루틴 다시 시작', '이 루틴을 다시 시작하면 새 기록이 추가됩니다. 진행할까요?', [{ text: '취소', style: 'cancel' }, { text: '진행', style: 'default', onPress: navigateToTimer }]);
      return;
    }
    navigateToTimer();
  };

  const persona = PERSONA_DEFINITIONS.find((p) => p.code === recommendation.persona);
  const recipeTitle = recommendation.mode === 'trip' ? (recommendation.themeTitle ?? 'Trip 테마') : (persona?.nameKo ?? '맞춤 케어');
  const modeLabel = recommendation.mode === 'trip' ? '트립 · 분위기 전환 루틴' : '케어 · 몸 상태에 맞춘 루틴';
  const bathTypeLabel = BATH_TYPE_LABELS[recommendation.bathType];
  const environmentLabel = ENV_LABELS[recommendation.environmentUsed] ?? '욕조';
  const durationLabel = formatDuration(recommendation.durationMinutes);
  const temperatureLabel = formatTemperature(recommendation.temperature);
  const heroGradient: [string, string] = [recommendation.colorHex, `${recommendation.colorHex}99`];
  const evidence = buildRecipeEvidenceLines(recommendation);
  const productSlots = buildProductMatchingSlots(recommendation, recommendation.environmentUsed);
  const primarySafetyLine = recommendation.safetyWarnings[0] ?? copy.routine.evidence.defaultSafety;
  const beginnerPreparationProducts = recommendation.ingredients
    .map((ingredient) => getCatalogProductForIngredient(ingredient.id, recommendation.environmentUsed))
    .filter((item): item is CatalogProduct => item !== undefined && isBeginnerFriendlyProduct(item))
    .filter(
      (item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index
    );
  const requiredPreparation = beginnerPreparationProducts[0];
  const optionalPreparation = beginnerPreparationProducts[1];
  const preparationRows = [
    {
      id: 'required',
      label: '필수 준비물',
      title: requiredPreparation ? requiredPreparation.name : '없음',
      body: requiredPreparation
        ? `${requiredPreparation.name} 하나만 있으면 충분해요.`
        : recommendation.environmentUsed === 'shower'
          ? '새로 사지 않아도 괜찮아요. 집에 있는 바디워시나 샤워타월 정도면 시작할 수 있어요.'
          : '새로 준비물을 사지 않아도 지금 바로 시작할 수 있어요.',
      emoji: requiredPreparation?.emoji ?? '🫧',
    },
    {
      id: 'optional',
      label: '있으면 좋아요',
      title: optionalPreparation
        ? optionalPreparation.name
        : recommendation.environmentUsed === 'shower'
          ? '바디워시 또는 샤워타월'
          : '추가 준비물 없음',
      body: optionalPreparation
        ? `${requiredPreparation?.name ?? '기본 준비물'} 대신 고르거나 함께 보기 좋은 완제품이에요.`
        : recommendation.environmentUsed === 'shower'
          ? '향이 있는 바디워시나 샤워타월 정도만 더해도 충분해요.'
          : '이번 루틴은 추가 준비물 없이도 충분해요.',
      emoji: optionalPreparation?.emoji ?? '🧴',
    },
  ].filter((item) => item.id !== 'optional' || optionalPreparation) as Array<{
    id: string;
    label: string;
    title: string;
    body: string;
    emoji: string;
  }>;
  const routineSteps = [
    {
      id: 'bath',
      label: '물 준비',
      body: `${temperatureLabel}로 맞추고 ${recommendation.environmentHints[0] ?? `${environmentLabel} 환경에 맞게 편안한 높이로 물을 준비해주세요.`}`,
    },
    {
      id: 'ingredient',
      label: '재료 넣기',
      body: requiredPreparation
        ? `${requiredPreparation.name} 하나만 준비하면 바로 시작할 수 있어요.`
        : '필수 준비물 없이도 괜찮아요. 집에 있는 것만으로 먼저 시작해보세요.',
    },
    {
      id: 'mood',
      label: '분위기 정리',
      body: recommendation.lighting,
    },
  ] as const;

  const handleProductDetail = (item: ProductMatchItem) => {
    setShowProductModal(false);
    setSelectedProduct(item.product);
  };

  const handleProductPurchase = async (item: ProductMatchItem) => {
    const purchaseUrl = item.product.purchaseUrl ?? item.ingredient.purchaseUrl;
    if (!purchaseUrl) {
      Alert.alert('구매 링크 없음', '아직 연결된 구매 링크가 없어요.');
      return;
    }

    const supported = await Linking.canOpenURL(purchaseUrl);
    if (!supported) {
      Alert.alert('링크 열기 실패', '지금은 구매 링크를 열 수 없어요.');
      return;
    }

    await Linking.openURL(purchaseUrl);
  };

  const handleDetailPurchase = async (product: CatalogProduct) => {
    if (!product.purchaseUrl) {
      Alert.alert('구매 링크 없음', '아직 연결된 구매 링크가 없어요.');
      return;
    }

    const supported = await Linking.canOpenURL(product.purchaseUrl);
    if (!supported) {
      Alert.alert('링크 열기 실패', '지금은 구매 링크를 열 수 없어요.');
      return;
    }

    await Linking.openURL(product.purchaseUrl);
  };

  const handleOpenCatalogFromDetail = (product: CatalogProduct) => {
    setSelectedProduct(null);
    router.push({
      pathname: '/(tabs)/product',
      params: { highlight: product.id },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrapper}>
          <LinearGradient colors={heroGradient} start={{ x: 0.16, y: 0 }} end={{ x: 0.92, y: 1 }} style={styles.hero}>
            <View style={styles.heroGlowLarge} />
            <View style={styles.heroGlowSmall} />
            <View style={styles.heroNavRow}>
              <Pressable style={styles.navButton} onPress={() => router.back()}><FontAwesome name="angle-left" size={22} color={V2_TEXT_PRIMARY} /></Pressable>
              <Text style={styles.heroTopLabel}>{copy.routine.stepPrep}</Text>
            </View>
            <Animated.View entering={FadeIn.duration(450)} style={styles.heroContent}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroInfoBadge}><Text style={styles.heroInfoBadgeText}>환경 적합: {environmentLabel}</Text></View>
                {recommendation.safetyWarnings.length > 0 ? <View style={styles.heroSafetyBadge}><Text style={styles.heroSafetyBadgeText}>{copy.home.safetyPriorityBadge}</Text></View> : null}
              </View>
              <View style={styles.heroTitleBlock}>
                <Text style={styles.heroEyebrow}>{modeLabel}</Text>
                <Text style={styles.heroTitle}>{recipeTitle}</Text>
                <Text style={styles.heroLead}>{evidence.reasonLines[0]}</Text>
              </View>
              <View style={styles.heroPlaque}>
                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricLabel}>입욕</Text>
                  <Text style={styles.heroMetricValue}>{bathTypeLabel}</Text>
                </View>
                <View style={styles.heroMetricDivider} />
                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricLabel}>수온</Text>
                  <Text style={styles.heroMetricValue}>{temperatureLabel}</Text>
                </View>
                <View style={styles.heroMetricDivider} />
                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricLabel}>시간</Text>
                  <Text style={styles.heroMetricValue}>{durationLabel}</Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        <Animated.View entering={FadeInDown.duration(380).delay(40)} style={[ui.glassCardV2, styles.summaryCard]}>
          <Text style={styles.summaryEyebrow}>루틴 요약</Text>
          <Text style={styles.summaryTitle}>이번 루틴은 이렇게 진행돼요</Text>
          <Text style={styles.summaryBody}>{evidence.reasonLines[0]}</Text>
          <View style={styles.summaryPillRow}>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryPillLabel}>환경</Text>
              <Text style={styles.summaryPillValue}>{environmentLabel}</Text>
            </View>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryPillLabel}>입욕</Text>
              <Text style={styles.summaryPillValue}>{bathTypeLabel}</Text>
            </View>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryPillLabel}>시간</Text>
              <Text style={styles.summaryPillValue}>{durationLabel}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={[ui.glassCardV2, styles.stepsCard]}>
          <Text style={styles.sectionTitle}>시작 전에 이렇게 준비하세요</Text>
          <Text style={styles.sectionSubtitle}>루틴의 핵심만 먼저 읽고 바로 시작할 수 있게 정리했어요</Text>
          <View style={styles.stepList}>
            {routineSteps.map((step, index) => (
              <View key={step.id} style={[styles.stepRow, index === routineSteps.length - 1 && styles.stepRowLast]}>
                <View style={[styles.stepIndexBadge, { backgroundColor: `${recommendation.colorHex}18`, borderColor: `${recommendation.colorHex}45` }]}>
                  <Text style={styles.stepIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(180)}>
          <Text style={styles.sectionTitle}>준비물 가이드</Text>
          <Text style={styles.sectionSubtitle}>없음 또는 완제품 한 개만 준비하면 되도록 정리했어요</Text>
          <View style={[ui.glassCardV2, styles.ingredientsCard]}>
            {preparationRows.map((item, index) => (
              <View key={item.id} style={[styles.trackRow, index === preparationRows.length - 1 && styles.trackRowLast]}>
                <View style={[styles.trackCircle, { backgroundColor: `${recommendation.colorHex}20`, borderColor: `${recommendation.colorHex}55` }]}><Text style={styles.trackEmoji}>{item.emoji}</Text></View>
                <View style={styles.trackInfo}><Text style={styles.trackName}>{item.title}</Text><Text style={styles.trackDesc}>{item.body}</Text></View>
                <Text style={styles.trackIndex}>{item.label}</Text>
              </View>
            ))}
            {productSlots.length > 0 ? (
              <View style={styles.ingredientsPairingWrap}>
                <View style={styles.ingredientsPairingDivider} />
                <Text style={styles.productBridgeEyebrow}>준비물 제품</Text>
                <Text style={styles.productBridgeTitle}>준비물로 볼 제품</Text>
                <Text style={styles.productBridgeBody}>
                  이번 루틴 준비물로 보기 좋은 같은 카테고리 제품만 따로 골라봤어요.
                </Text>
                <Pressable
                  style={[ui.secondaryButtonV2, styles.productBridgeButton]}
                  onPress={() => setShowProductModal(true)}
                >
                  <Text style={ui.secondaryButtonTextV2}>준비물 보기</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={[ui.glassCardV2, styles.safetyBlock]}>
          <Text style={styles.safetyEyebrow}>안전 먼저</Text>
          <Text style={styles.safetyTitle}>{copy.routine.safetyTitle}</Text>
          <Text style={styles.safetyLead}>{primarySafetyLine}</Text>
          {copy.routine.safetyLines.map((line) => <Text key={line} style={styles.safetyText}>• {line}</Text>)}
        </Animated.View>

        <View style={styles.disclosureWrap}><PersistentDisclosure variant="v2" /></View>
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      <View style={styles.bottomCTA}><Pressable style={[ui.primaryButtonV2, styles.startButton]} onPress={handleStartBath}><Text style={ui.primaryButtonTextV2}>{source === 'history' ? '다시 시작하기' : copy.routine.startCta}</Text></Pressable></View>
      <ProductMatchingModal
        visible={showProductModal}
        items={productSlots}
        onClose={() => setShowProductModal(false)}
        onProductPress={handleProductDetail}
        onPurchasePress={handleProductPurchase}
      />
      <ProductDetailModal
        visible={selectedProduct !== null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenCatalog={handleOpenCatalogFromDetail}
        onPurchasePress={handleDetailPurchase}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_BG_BASE },
  centered: { justifyContent: 'center', alignItems: 'center' },
  heroWrapper: { paddingHorizontal: 18, paddingTop: 14 },
  hero: { height: HERO_HEIGHT, borderRadius: luxuryRadii.cardLg, overflow: 'hidden', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, justifyContent: 'space-between' },
  heroGlowLarge: { position: 'absolute', width: 220, height: 220, borderRadius: 999, backgroundColor: 'rgba(245,240,232,0.08)', top: -110, right: -20 },
  heroGlowSmall: { position: 'absolute', width: 132, height: 132, borderRadius: 999, backgroundColor: 'rgba(8,22,54,0.16)', bottom: 52, left: -24 },
  heroNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(8,22,54,0.24)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  heroTopLabel: { fontSize: TYPE_CAPTION - 1, color: 'rgba(255,255,255,0.68)', fontWeight: '700', letterSpacing: 1, fontFamily: luxuryFonts.sans, paddingRight: 2 },
  heroContent: { gap: 12, alignItems: 'flex-start' },
  heroBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, maxWidth: '84%' },
  heroInfoBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: 'rgba(8,22,54,0.26)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  heroInfoBadgeText: { fontSize: TYPE_CAPTION - 1, color: V2_TEXT_PRIMARY, fontWeight: '700', fontFamily: luxuryFonts.sans },
  heroSafetyBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: 'rgba(201,164,91,0.22)', borderWidth: 1, borderColor: 'rgba(201,164,91,0.36)' },
  heroSafetyBadgeText: { fontSize: TYPE_CAPTION - 1, color: V2_TEXT_PRIMARY, fontWeight: '800', fontFamily: luxuryFonts.sans },
  heroTitleBlock: { gap: 8, maxWidth: '82%' },
  heroEyebrow: { fontSize: TYPE_CAPTION - 1, color: 'rgba(255,255,255,0.74)', fontWeight: '700', letterSpacing: 1.2, fontFamily: luxuryFonts.sans },
  heroTitle: { fontSize: TYPE_HEADING_LG + 2, lineHeight: 42, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display, maxWidth: '100%' },
  heroLead: { fontSize: TYPE_BODY, color: 'rgba(255,255,255,0.86)', lineHeight: 21, fontFamily: luxuryFonts.sans, maxWidth: '100%' },
  heroPlaque: { marginTop: 2, width: '84%', borderRadius: luxuryRadii.card, backgroundColor: 'rgba(8,22,54,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center' },
  heroMetric: { flex: 1, gap: 3 },
  heroMetricLabel: { fontSize: TYPE_CAPTION - 1, color: 'rgba(255,255,255,0.62)', fontFamily: luxuryFonts.sans },
  heroMetricValue: { fontSize: TYPE_BODY, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  heroMetricDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 10 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18 },
  summaryCard: { paddingVertical: 16, paddingHorizontal: 16, marginBottom: 12, gap: 10 },
  summaryEyebrow: { fontSize: TYPE_CAPTION - 1, fontWeight: '800', color: V2_ACCENT, letterSpacing: 1, fontFamily: luxuryFonts.sans },
  summaryTitle: { fontSize: TYPE_TITLE + 1, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  summaryBody: { fontSize: TYPE_BODY, color: V2_TEXT_SECONDARY, lineHeight: 21, fontFamily: luxuryFonts.sans },
  summaryPillRow: { flexDirection: 'row', gap: 10 },
  summaryPill: { flex: 1, borderRadius: luxuryRadii.card, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: V2_BORDER, gap: 3 },
  summaryPillLabel: { fontSize: TYPE_CAPTION - 1, color: V2_TEXT_MUTED, fontFamily: luxuryFonts.sans },
  summaryPillValue: { fontSize: TYPE_BODY, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  stepsCard: { paddingHorizontal: 16, paddingVertical: 16, marginBottom: 20 },
  stepList: { marginTop: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: V2_BORDER },
  stepRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  stepIndexBadge: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  stepIndexText: { fontSize: TYPE_CAPTION, color: V2_TEXT_PRIMARY, fontWeight: '700', fontFamily: luxuryFonts.mono },
  stepCopy: { flex: 1, gap: 4 },
  stepLabel: { fontSize: TYPE_BODY, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  stepBody: { fontSize: TYPE_CAPTION, color: V2_TEXT_SECONDARY, lineHeight: 19, fontFamily: luxuryFonts.sans },
  sectionTitle: { fontSize: TYPE_TITLE + 2, color: V2_TEXT_PRIMARY, marginBottom: 4, fontFamily: luxuryFonts.display },
  sectionSubtitle: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, marginBottom: 14, fontFamily: luxuryFonts.sans },
  ingredientsCard: { paddingHorizontal: 14, paddingVertical: 4 },
  ingredientsPairingWrap: { paddingTop: 14, paddingBottom: 12, gap: 8 },
  ingredientsPairingDivider: { height: 1, backgroundColor: V2_BORDER, marginBottom: 2 },
  productBridgeEyebrow: {
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '800',
    color: V2_ACCENT,
    letterSpacing: 1,
    fontFamily: luxuryFonts.sans,
  },
  productBridgeTitle: { fontSize: TYPE_TITLE, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  productBridgeBody: { fontSize: TYPE_CAPTION, lineHeight: 18, color: V2_TEXT_SECONDARY, fontFamily: luxuryFonts.sans },
  productBridgeButton: { marginTop: 4 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: V2_BORDER, gap: 14 },
  trackRowLast: { borderBottomWidth: 0 },
  trackCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  trackEmoji: { fontSize: 20 },
  trackInfo: { flex: 1 },
  trackName: { fontSize: TYPE_BODY + 1, color: V2_TEXT_PRIMARY, marginBottom: 2, fontFamily: luxuryFonts.display },
  trackDesc: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontFamily: luxuryFonts.sans },
  trackIndex: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontWeight: '600', fontVariant: ['tabular-nums'], fontFamily: luxuryFonts.mono },
  safetyBlock: { marginTop: 20, padding: 14, gap: 4 },
  safetyEyebrow: { fontSize: TYPE_CAPTION - 1, fontWeight: '800', color: V2_ACCENT, letterSpacing: 1, marginBottom: 4, fontFamily: luxuryFonts.sans },
  safetyTitle: { fontSize: TYPE_TITLE, color: V2_TEXT_PRIMARY, marginBottom: 2, fontFamily: luxuryFonts.display },
  safetyLead: { fontSize: TYPE_BODY, color: V2_TEXT_PRIMARY, lineHeight: 20, marginBottom: 6, fontFamily: luxuryFonts.sans, fontWeight: '700' },
  safetyText: { fontSize: TYPE_CAPTION, color: V2_TEXT_SECONDARY, lineHeight: 18, fontFamily: luxuryFonts.sans },
  disclosureWrap: { marginTop: 16 },
  bottomSpacer: { height: 16 },
  bottomCTA: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10, borderTopWidth: 1, borderTopColor: V2_BORDER, backgroundColor: 'rgba(8,22,54,0.96)' },
  startButton: { width: '100%' },
});
