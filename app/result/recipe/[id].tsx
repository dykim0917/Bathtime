import React, { useState, useEffect } from 'react';
import { Alert, Linking, View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
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
import { CatalogProduct } from '@/src/data/catalog';
import { useCatalogHydration } from '@/src/data/catalogRuntime';
import { formatTemperature } from '@/src/utils/temperature';
import { formatDuration } from '@/src/utils/time';
import { buildRecipeEvidenceLines } from '@/src/engine/explainability';
import { TYPE_BODY, TYPE_CAPTION, TYPE_TITLE, V2_ACCENT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_TOP, V2_BORDER, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { ui } from '@/src/theme/ui';

const BATH_TYPE_LABELS: Record<string, string> = { full: '전신욕', half: '반신욕', foot: '족욕', shower: '샤워' };
const ENV_LABELS: Record<string, string> = { bathtub: '욕조', partial_bath: '부분입욕', footbath: '족욕', shower: '샤워' };
const HERO_HEIGHT = 180;

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
  const heroGradient: [string, string] = [recommendation.colorHex, `${recommendation.colorHex}99`];
  const evidence = buildRecipeEvidenceLines(recommendation);
  const productSlots = buildProductMatchingSlots(recommendation, recommendation.environmentUsed);

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
      <View style={styles.heroWrapper}>
        <LinearGradient colors={heroGradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.hero}>
          <SafeAreaView style={styles.heroSafeArea}>
            <View style={styles.heroNavRow}>
              <Pressable style={styles.navButton} onPress={() => router.back()}><FontAwesome name="angle-left" size={22} color={V2_TEXT_PRIMARY} /></Pressable>
              <Text style={styles.navCenterTitle} numberOfLines={1}>{recipeTitle}</Text>
              <View style={styles.modeChip}><Text style={styles.modeChipText}>{copy.routine.stepPrep}</Text></View>
            </View>
          </SafeAreaView>
          <Animated.View entering={FadeIn.duration(450)} style={styles.heroContent}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroInfoBadge}><Text style={styles.heroInfoBadgeText}>환경 적합: {ENV_LABELS[recommendation.environmentUsed] ?? '욕조'}</Text></View>
              {recommendation.safetyWarnings.length > 0 ? <View style={styles.heroSafetyBadge}><Text style={styles.heroSafetyBadgeText}>{copy.home.safetyPriorityBadge}</Text></View> : null}
            </View>
            <Text style={styles.heroModeLabel}>{modeLabel}</Text>
          </Animated.View>
        </LinearGradient>
      </View>

      <Animated.ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(380).delay(40)} style={[ui.glassCardV2, styles.evidenceCard]}>
          <Text style={styles.evidenceTitle}>{copy.routine.evidence.title}</Text>
          {evidence.reasonLines.map((line) => <Text key={line} style={styles.evidenceText}>{'\u2022'} {line}</Text>)}
          <Text style={styles.evidenceSafetyText}>{'\u2022'} {evidence.safetyLine}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={[ui.glassCardV2, styles.statsCard]}>
          <View style={styles.statItem}><Text style={styles.statValue}>{formatTemperature(recommendation.temperature)}</Text><Text style={styles.statLabel}>수온</Text></View>
          <View style={[styles.statDivider, { backgroundColor: `${recommendation.colorHex}40` }]} />
          <View style={styles.statItem}><Text style={styles.statValue}>{formatDuration(recommendation.durationMinutes)}</Text><Text style={styles.statLabel}>시간</Text></View>
          <View style={[styles.statDivider, { backgroundColor: `${recommendation.colorHex}40` }]} />
          <View style={styles.statItem}><Text style={styles.statValue}>{BATH_TYPE_LABELS[recommendation.bathType]}</Text><Text style={styles.statLabel}>입욕 방법</Text></View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(130)} style={[ui.glassCardV2, styles.lightingRow]}>
          <Text style={styles.lightingLabel}>💡 조명</Text>
          <Text style={styles.lightingValue}>{recommendation.lighting}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(180)}>
          <Text style={styles.sectionTitle}>준비물</Text>
          <Text style={styles.sectionSubtitle}>{recommendation.ingredients.length}가지 재료를 준비해주세요</Text>
          <View style={[ui.glassCardV2, styles.ingredientsCard]}>
            {recommendation.ingredients.map((ingredient, index) => (
              <View key={ingredient.id} style={[styles.trackRow, index === recommendation.ingredients.length - 1 && styles.trackRowLast]}>
                <View style={[styles.trackCircle, { backgroundColor: `${recommendation.colorHex}20`, borderColor: `${recommendation.colorHex}55` }]}><Text style={styles.trackEmoji}>🧴</Text></View>
                <View style={styles.trackInfo}><Text style={styles.trackName}>{ingredient.nameKo}</Text><Text style={styles.trackDesc} numberOfLines={1}>{ingredient.description}</Text></View>
                <Text style={styles.trackIndex}>{String(index + 1).padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {productSlots.length > 0 ? (
          <Animated.View entering={FadeInDown.duration(400).delay(210)} style={[ui.glassCardV2, styles.productBridgeCard]}>
            <Text style={styles.productBridgeEyebrow}>PRODUCT PAIRING</Text>
            <Text style={styles.productBridgeTitle}>이 루틴에 맞는 제품 추천이 준비돼 있어요</Text>
            <Text style={styles.productBridgeBody}>
              현재 환경에 맞는 추천만 추려서 바로 볼 수 있어요.
            </Text>
            <Pressable
              style={[ui.secondaryButtonV2, styles.productBridgeButton]}
              onPress={() => setShowProductModal(true)}
            >
              <Text style={ui.secondaryButtonTextV2}>추천 제품 보기</Text>
            </Pressable>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={[ui.glassCardV2, styles.safetyBlock]}>
          <Text style={styles.safetyTitle}>⚠️ {copy.routine.safetyTitle}</Text>
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
        onContinue={() => setShowProductModal(false)}
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
  heroWrapper: { overflow: 'hidden' },
  hero: { height: HERO_HEIGHT, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  heroSafeArea: { paddingHorizontal: 22, paddingTop: 6 },
  heroNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(8,22,54,0.24)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  navCenterTitle: { flex: 1, textAlign: 'center', fontSize: TYPE_BODY, fontWeight: '700', color: V2_TEXT_PRIMARY, paddingHorizontal: 4 },
  modeChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(8,22,54,0.26)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  modeChipText: { fontSize: TYPE_CAPTION, fontWeight: '700', color: V2_TEXT_PRIMARY },
  heroContent: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 14 },
  heroBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 6 },
  heroInfoBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: 'rgba(8,22,54,0.26)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  heroInfoBadgeText: { fontSize: TYPE_CAPTION - 1, color: V2_TEXT_PRIMARY, fontWeight: '700' },
  heroSafetyBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: 'rgba(201,164,91,0.22)', borderWidth: 1, borderColor: 'rgba(201,164,91,0.36)' },
  heroSafetyBadgeText: { fontSize: TYPE_CAPTION - 1, color: V2_TEXT_PRIMARY, fontWeight: '800' },
  heroModeLabel: { fontSize: TYPE_CAPTION, color: 'rgba(255,255,255,0.88)', textAlign: 'center', fontWeight: '600', letterSpacing: 0.4 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 14 },
  evidenceCard: { paddingVertical: 12, paddingHorizontal: 14, marginBottom: 12, gap: 6 },
  evidenceTitle: { fontSize: TYPE_CAPTION, fontWeight: '800', color: V2_ACCENT, letterSpacing: 0.3 },
  evidenceText: { fontSize: TYPE_CAPTION, color: V2_TEXT_PRIMARY, lineHeight: 18 },
  evidenceSafetyText: { marginTop: 1, fontSize: TYPE_CAPTION, color: V2_TEXT_SECONDARY, lineHeight: 18, fontWeight: '700' },
  statsCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 10, marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: TYPE_TITLE, fontWeight: '700', color: V2_TEXT_PRIMARY, marginBottom: 2 },
  statLabel: { fontSize: TYPE_CAPTION, color: V2_TEXT_SECONDARY },
  statDivider: { width: 1, height: 38 },
  lightingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, marginBottom: 20, gap: 8 },
  lightingLabel: { fontSize: TYPE_BODY, fontWeight: '600', color: V2_TEXT_SECONDARY },
  lightingValue: { fontSize: TYPE_BODY, color: V2_TEXT_PRIMARY, flex: 1 },
  sectionTitle: { fontSize: TYPE_TITLE, fontWeight: '700', color: V2_TEXT_PRIMARY, marginBottom: 4 },
  sectionSubtitle: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, marginBottom: 14 },
  ingredientsCard: { paddingHorizontal: 14, paddingVertical: 4 },
  productBridgeCard: { marginTop: 18, padding: 16, gap: 8 },
  productBridgeEyebrow: {
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '800',
    color: V2_ACCENT,
    letterSpacing: 1,
  },
  productBridgeTitle: { fontSize: TYPE_BODY, fontWeight: '700', color: V2_TEXT_PRIMARY },
  productBridgeBody: { fontSize: TYPE_CAPTION, lineHeight: 18, color: V2_TEXT_SECONDARY },
  productBridgeButton: { marginTop: 4 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: V2_BORDER, gap: 14 },
  trackRowLast: { borderBottomWidth: 0 },
  trackCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  trackEmoji: { fontSize: 20 },
  trackInfo: { flex: 1 },
  trackName: { fontSize: TYPE_BODY, fontWeight: '600', color: V2_TEXT_PRIMARY, marginBottom: 2 },
  trackDesc: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED },
  trackIndex: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontWeight: '600', fontVariant: ['tabular-nums'] },
  safetyBlock: { marginTop: 20, padding: 14, gap: 4 },
  safetyTitle: { fontSize: TYPE_BODY, fontWeight: '700', color: V2_TEXT_PRIMARY, marginBottom: 6 },
  safetyText: { fontSize: TYPE_CAPTION, color: V2_TEXT_SECONDARY, lineHeight: 18 },
  disclosureWrap: { marginTop: 16 },
  bottomSpacer: { height: 16 },
  bottomCTA: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10, borderTopWidth: 1, borderTopColor: V2_BORDER, backgroundColor: 'rgba(8,22,54,0.96)' },
  startButton: { width: '100%' },
});
