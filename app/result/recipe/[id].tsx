import React, { useState, useEffect, useMemo } from 'react';
import { Alert, ImageBackground, Linking, View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BathRecommendation } from '@/src/engine/types';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { getRecommendationById } from '@/src/storage/history';
import { copy } from '@/src/content/copy';
import { ProductMatchingModal } from '@/src/components/ProductMatchingModal';
import { ProductDetailModal } from '@/src/components/ProductDetailModal';
import { ProductMatchItem, buildProductMatchingSlots } from '@/src/engine/productMatching';
import {
  CatalogProduct,
  getCatalogProductForIngredient,
  isBeginnerFriendlyProduct,
} from '@/src/data/catalog';
import { getTripCardImage } from '@/src/data/tripImages';
import { useCatalogHydration } from '@/src/data/catalogRuntime';
import { formatTemperature } from '@/src/utils/temperature';
import { formatDuration } from '@/src/utils/time';
import { buildRecipeEvidenceLines } from '@/src/engine/explainability';
import { buildPreBathChecklist } from '@/src/engine/preBathChecklist';
import { PreBathGateModal } from '@/src/components/PreBathGateModal';
import { TYPE_BODY, TYPE_CAPTION, TYPE_HEADING_LG, TYPE_TITLE, V2_ACCENT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_TOP, V2_BORDER, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

const BATH_TYPE_LABELS: Record<string, string> = { full: '전신욕', half: '반신욕', foot: '족욕', shower: '샤워' };
const ENV_LABELS: Record<string, string> = { bathtub: '욕조', partial_bath: '부분입욕', footbath: '족욕', shower: '샤워' };
const HERO_HEIGHT = 268;
const HERO_HEIGHT_TRIP = 356;

export default function RecipeScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const [recommendation, setRecommendation] = useState<BathRecommendation | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [isPreBathGateVisible, setIsPreBathGateVisible] = useState(false);
  useCatalogHydration();

  useEffect(() => {
    if (!id) return;
    setIsPreBathGateVisible(false);
    getRecommendationById(id).then((rec) => {
      if (rec) {
        setRecommendation(rec);
        setIsPreBathGateVisible(true);
      }
    });
  }, [id]);
  const handleStartBath = () => {
    setIsPreBathGateVisible(true);
  };

  const preBathItems = useMemo(
    () => (recommendation ? buildPreBathChecklist(recommendation, { source }) : []),
    [recommendation, source]
  );

  if (!recommendation) return <View style={[ui.screenShellV2, styles.centered]}><Text style={{ color: V2_TEXT_SECONDARY }}>{copy.completion.loading}</Text></View>;

  const persona = PERSONA_DEFINITIONS.find((p) => p.code === recommendation.persona);
  const recipeTitle = recommendation.mode === 'trip' ? (recommendation.themeTitle ?? '트립 테마') : (persona?.nameKo ?? '맞춤 케어');
  const isTripRecipe = recommendation.mode === 'trip';
  const modeLabel =
    recommendation.mode === 'trip'
      ? copy.routine.recipe.tripModeLabel
      : copy.routine.recipe.careModeLabel;
  const bathTypeLabel = BATH_TYPE_LABELS[recommendation.bathType];
  const environmentLabel = ENV_LABELS[recommendation.environmentUsed] ?? '욕조';
  const durationLabel = formatDuration(recommendation.durationMinutes);
  const temperatureLabel = formatTemperature(recommendation.temperature);
  const heroGradient: [string, string] = [recommendation.colorHex, `${recommendation.colorHex}99`];
  const tripHeroImage = isTripRecipe
    ? getTripCardImage(recommendation.themeId ?? recommendation.intentId ?? '', 'deep')
    : null;
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
      label: copy.routine.recipe.requiredLabel,
      title: requiredPreparation ? requiredPreparation.name : copy.routine.recipe.noneTitle,
      body: requiredPreparation
        ? copy.routine.recipe.requiredBody(requiredPreparation.name)
        : recommendation.environmentUsed === 'shower'
          ? copy.routine.recipe.showerNoRequiredBody
          : copy.routine.recipe.noRequiredBody,
    },
    {
      id: 'optional',
      label: copy.routine.recipe.optionalLabel,
      title: optionalPreparation
        ? optionalPreparation.name
        : recommendation.environmentUsed === 'shower'
          ? copy.routine.recipe.showerOptionalTitle
          : copy.routine.recipe.noOptionalTitle,
      body: optionalPreparation
        ? copy.routine.recipe.optionalBody(requiredPreparation?.name ?? '기본 준비물')
        : recommendation.environmentUsed === 'shower'
          ? copy.routine.recipe.showerOptionalBody
          : copy.routine.recipe.noOptionalBody,
    },
  ].filter((item) => item.id !== 'optional' || optionalPreparation) as Array<{
    id: string;
    label: string;
    title: string;
    body: string;
  }>;
  const routineSteps = [
    {
      id: 'bath',
      label: copy.routine.recipe.waterStepLabel,
      body: `${temperatureLabel}로 맞추고 ${recommendation.environmentHints[0] ?? `${environmentLabel} 환경에 맞게 편안한 높이로 물을 준비해주세요.`}`,
    },
    {
      id: 'ingredient',
      label: copy.routine.recipe.ingredientStepLabel,
      body: requiredPreparation
        ? copy.routine.recipe.ingredientStepBody(requiredPreparation.name)
        : copy.routine.recipe.noIngredientStepBody,
    },
  ] as const;

  const handleProductDetail = (item: ProductMatchItem) => {
    setShowProductModal(false);
    setSelectedProduct(item.product);
  };

  const handleProductPurchase = async (item: ProductMatchItem) => {
    const purchaseUrl = item.product.purchaseUrl ?? item.ingredient.purchaseUrl;
    if (!purchaseUrl) {
      Alert.alert(copy.alerts.purchaseUnavailableTitle, copy.alerts.purchaseUnavailableBody);
      return;
    }

    const supported = await Linking.canOpenURL(purchaseUrl);
    if (!supported) {
      Alert.alert(copy.alerts.openLinkFailedTitle, copy.alerts.openLinkFailedBody);
      return;
    }

    await Linking.openURL(purchaseUrl);
  };

  const handleDetailPurchase = async (product: CatalogProduct) => {
    if (!product.purchaseUrl) {
      Alert.alert(copy.alerts.purchaseUnavailableTitle, copy.alerts.purchaseUnavailableBody);
      return;
    }

    const supported = await Linking.canOpenURL(product.purchaseUrl);
    if (!supported) {
      Alert.alert(copy.alerts.openLinkFailedTitle, copy.alerts.openLinkFailedBody);
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

  const handleConfirmPreBath = () => {
    router.replace(`/result/timer/${id}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroWrapper, isTripRecipe && styles.heroWrapperTrip]}>
          <LinearGradient
            colors={heroGradient}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.92, y: 1 }}
            style={[styles.hero, isTripRecipe && styles.heroTrip]}
          >
            {tripHeroImage ? (
              <ImageBackground source={tripHeroImage} style={StyleSheet.absoluteFillObject} imageStyle={styles.heroImage}>
                <View style={styles.heroImageOverlay} />
              </ImageBackground>
            ) : null}
            {isTripRecipe ? (
              <LinearGradient
                colors={['rgba(6, 12, 24, 0.08)', 'rgba(6, 12, 24, 0.18)', 'rgba(8, 14, 26, 0.46)', V2_BG_BASE]}
                locations={[0, 0.32, 0.7, 1]}
                style={styles.heroImageGradient}
              />
            ) : null}
            {!isTripRecipe ? <View style={styles.heroGlowLarge} /> : null}
            {!isTripRecipe ? <View style={styles.heroGlowSmall} /> : null}
            <View style={styles.heroNavRow}>
              <Pressable style={styles.navButton} onPress={() => router.back()}>
                <FontAwesome name="angle-left" size={24} color={V2_TEXT_PRIMARY} />
              </Pressable>
              <View style={styles.heroTopMetaRow}>
                <View style={styles.heroInfoBadge}>
                  <Text style={styles.heroInfoBadgeText}>{copy.routine.recipe.environmentLabel}: {environmentLabel}</Text>
                </View>
                {recommendation.safetyWarnings.length > 0 ? (
                  <View style={styles.heroSafetyBadge}>
                    <Text style={styles.heroSafetyBadgeText}>{copy.home.safetyPriorityBadge}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Animated.View entering={FadeIn.duration(450)} style={[styles.heroContent, isTripRecipe && styles.heroContentTrip]}>
              <View style={[styles.heroTitleBlock, isTripRecipe && styles.heroTitleBlockTrip]}>
                <Text style={styles.heroEyebrow}>{modeLabel}</Text>
                <Text style={styles.heroTitle}>{recipeTitle}</Text>
                <Text style={styles.heroLead}>{evidence.reasonLines[0]}</Text>
              </View>
              <View style={styles.heroPlaque}>
                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricLabel}>{copy.routine.recipe.bathLabel}</Text>
                  <Text style={styles.heroMetricValue}>{bathTypeLabel}</Text>
                </View>
                <View style={styles.heroMetricDivider} />
                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricLabel}>{copy.routine.recipe.temperatureLabel}</Text>
                  <Text style={styles.heroMetricValue}>{temperatureLabel}</Text>
                </View>
                <View style={styles.heroMetricDivider} />
                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricLabel}>{copy.routine.recipe.durationLabel}</Text>
                  <Text style={styles.heroMetricValue}>{durationLabel}</Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={[ui.glassCardV2, styles.stepsCard]}>
          <Text style={styles.sectionTitle}>{copy.routine.recipe.prepTitle}</Text>
          <Text style={styles.sectionSubtitle}>{copy.routine.recipe.prepSubtitle}</Text>
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
          <Text style={styles.sectionTitle}>{copy.routine.recipe.guideTitle}</Text>
          <Text style={styles.sectionSubtitle}>{copy.routine.recipe.guideSubtitle}</Text>
          <View style={[ui.glassCardV2, styles.ingredientsCard]}>
            {preparationRows.map((item, index) => (
              <View key={item.id} style={[styles.trackRow, index === preparationRows.length - 1 && styles.trackRowLast]}>
                <View style={[styles.trackCircle, { backgroundColor: `${recommendation.colorHex}20`, borderColor: `${recommendation.colorHex}55` }]}>
                  <Text style={styles.trackBadgeText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
                <View style={styles.trackInfo}><Text style={styles.trackName}>{item.title}</Text><Text style={styles.trackDesc}>{item.body}</Text></View>
                <Text style={styles.trackIndex}>{item.label}</Text>
              </View>
            ))}
            {productSlots.length > 0 ? (
              <View style={styles.ingredientsPairingWrap}>
                <View style={styles.ingredientsPairingDivider} />
                <Text style={styles.productBridgeEyebrow}>{copy.routine.recipe.bridgeEyebrow}</Text>
                <Text style={styles.productBridgeTitle}>{copy.routine.recipe.bridgeTitle}</Text>
                <Text style={styles.productBridgeBody}>{copy.routine.recipe.bridgeBody}</Text>
                <Pressable
                  style={[ui.secondaryButtonV2, styles.productBridgeButton]}
                  onPress={() => setShowProductModal(true)}
                >
                  <Text style={ui.secondaryButtonTextV2}>{copy.routine.recipe.bridgeButton}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={[ui.glassCardV2, styles.safetyBlock]}>
          <Text style={styles.safetyEyebrow}>{copy.routine.recipe.safetyEyebrow}</Text>
          <Text style={styles.safetyTitle}>{copy.routine.safetyTitle}</Text>
          <Text style={styles.safetyLead}>{primarySafetyLine}</Text>
          {copy.routine.safetyLines.map((line) => <Text key={line} style={styles.safetyText}>• {line}</Text>)}
        </Animated.View>

      </Animated.ScrollView>

      <View style={styles.bottomCTA}><Pressable style={[ui.primaryButtonV2, styles.startButton]} onPress={handleStartBath}><Text style={ui.primaryButtonTextV2}>{source === 'history' ? copy.routine.preBath.historyReviewCta : copy.routine.preBath.reviewCta}</Text></Pressable></View>
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
      <PreBathGateModal
        visible={isPreBathGateVisible}
        title={copy.routine.preBath.title}
        subtitle={source === 'history' ? copy.routine.preBath.historySubtitle : copy.routine.preBath.subtitle}
        items={preBathItems}
        confirmLabel={source === 'history' ? copy.routine.preBath.historyStartCta : copy.routine.startCta}
        onClose={() => setIsPreBathGateVisible(false)}
        onConfirm={handleConfirmPreBath}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_BG_BASE },
  centered: { justifyContent: 'center', alignItems: 'center' },
  heroWrapper: { paddingHorizontal: 18, paddingTop: 14 },
  heroWrapperTrip: { paddingHorizontal: 0, paddingTop: 0, marginTop: -18, marginHorizontal: -20 },
  hero: { height: HERO_HEIGHT, borderRadius: luxuryRadii.cardLg, overflow: 'hidden', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, justifyContent: 'space-between' },
  heroTrip: {
    height: HERO_HEIGHT_TRIP,
    borderRadius: 0,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 34,
    justifyContent: 'flex-start',
  },
  heroImage: {
    width: '100%',
    height: '118%',
    resizeMode: 'cover',
  },
  heroImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 9, 23, 0.14)',
  },
  heroImageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGlowLarge: { position: 'absolute', width: 220, height: 220, borderRadius: 999, backgroundColor: 'rgba(245,240,232,0.08)', top: -110, right: -20 },
  heroGlowSmall: { position: 'absolute', width: 132, height: 132, borderRadius: 999, backgroundColor: 'rgba(8,22,54,0.16)', bottom: 52, left: -24 },
  heroNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'flex-start' },
  heroTopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flexWrap: 'wrap',
    maxWidth: '84%',
  },
  heroContent: { gap: 12, alignItems: 'flex-start' },
  heroContentTrip: { width: '100%', marginTop: 'auto' },
  heroInfoBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: 'rgba(8,22,54,0.26)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  heroInfoBadgeText: { fontSize: TYPE_CAPTION - 1, color: V2_TEXT_PRIMARY, fontWeight: '700', fontFamily: luxuryFonts.sans },
  heroSafetyBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: 'rgba(201,164,91,0.22)', borderWidth: 1, borderColor: 'rgba(201,164,91,0.36)' },
  heroSafetyBadgeText: { fontSize: TYPE_CAPTION - 1, color: V2_TEXT_PRIMARY, fontWeight: '800', fontFamily: luxuryFonts.sans },
  heroTitleBlock: { gap: 8, maxWidth: '82%' },
  heroTitleBlockTrip: { maxWidth: '100%' },
  heroEyebrow: { fontSize: TYPE_CAPTION - 1, color: 'rgba(255,255,255,0.74)', fontWeight: '700', letterSpacing: 1.2, fontFamily: luxuryFonts.sans },
  heroTitle: { fontSize: TYPE_HEADING_LG + 2, lineHeight: 42, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display, maxWidth: '100%' },
  heroLead: { fontSize: TYPE_BODY, color: 'rgba(255,255,255,0.86)', lineHeight: 21, fontFamily: luxuryFonts.sans, maxWidth: '100%' },
  heroPlaque: {
    marginTop: 6,
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: luxuryRadii.card,
    backgroundColor: 'rgba(8,22,54,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMetric: { flex: 1, gap: 3 },
  heroMetricLabel: { fontSize: TYPE_CAPTION - 1, color: 'rgba(255,255,255,0.62)', fontFamily: luxuryFonts.sans },
  heroMetricValue: { fontSize: TYPE_BODY, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  heroMetricDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 10 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18 },
  stepsCard: { paddingHorizontal: 16, paddingVertical: 16, marginBottom: 20, marginTop: 14 },
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
  trackBadgeText: { fontSize: TYPE_CAPTION, color: V2_TEXT_PRIMARY, fontWeight: '700', letterSpacing: 0.8, fontVariant: ['tabular-nums'], fontFamily: luxuryFonts.mono },
  trackInfo: { flex: 1 },
  trackName: { fontSize: TYPE_BODY + 1, color: V2_TEXT_PRIMARY, marginBottom: 2, fontFamily: luxuryFonts.display },
  trackDesc: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontFamily: luxuryFonts.sans },
  trackIndex: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontWeight: '600', fontVariant: ['tabular-nums'], fontFamily: luxuryFonts.mono },
  safetyBlock: { marginTop: 20, marginBottom: 18, padding: 14, gap: 4 },
  safetyEyebrow: { fontSize: TYPE_CAPTION - 1, fontWeight: '800', color: V2_ACCENT, letterSpacing: 1, marginBottom: 4, fontFamily: luxuryFonts.sans },
  safetyTitle: { fontSize: TYPE_TITLE, color: V2_TEXT_PRIMARY, marginBottom: 2, fontFamily: luxuryFonts.display },
  safetyLead: { fontSize: TYPE_BODY, color: V2_TEXT_PRIMARY, lineHeight: 20, marginBottom: 6, fontFamily: luxuryFonts.sans, fontWeight: '700' },
  safetyText: { fontSize: TYPE_CAPTION, color: V2_TEXT_SECONDARY, lineHeight: 18, fontFamily: luxuryFonts.sans },
  bottomCTA: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: V2_BORDER,
    backgroundColor: V2_BG_BASE,
  },
  startButton: { width: '100%' },
});
