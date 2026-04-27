import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Animated as RNAnimated, ImageBackground, View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, router } from 'expo-router';
import Reanimated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BathRecommendation } from '@/src/engine/types';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { getRecommendationById } from '@/src/storage/history';
import { copy } from '@/src/content/copy';
import { AppAlertDialog } from '@/src/components/AppAlertDialog';
import { ProductMatchingModal } from '@/src/components/ProductMatchingModal';
import { ProductDetailModal } from '@/src/components/ProductDetailModal';
import { ProductMatchItem, buildProductMatchingSlots } from '@/src/engine/productMatching';
import {
  CatalogProduct,
  getCatalogProductForIngredient,
  isBeginnerFriendlyProduct,
} from '@/src/data/catalog';
import { getCareCardImageForEnvironment } from '@/src/data/careImages';
import { getTripCardImageForEnvironment } from '@/src/data/tripImages';
import { useCatalogHydration } from '@/src/data/catalogRuntime';
import { formatTemperature } from '@/src/utils/temperature';
import { formatDuration } from '@/src/utils/time';
import { buildSleepPreparationPlan, formatSleepPlanTime } from '@/src/utils/sleepWindow';
import { buildRecipeEvidenceLines } from '@/src/engine/explainability';
import { buildPreBathChecklist, shouldRequirePreBathGate } from '@/src/engine/preBathChecklist';
import { PreBathGateModal } from '@/src/components/PreBathGateModal';
import { TYPE_BODY, TYPE_CAPTION, TYPE_HEADING_LG, TYPE_TITLE, V2_ACCENT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_TOP, V2_BORDER, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { openExternalUrl } from '@/src/utils/externalLinks';

const BATH_TYPE_LABELS: Record<string, string> = { full: '전신욕', half: '반신욕', foot: '족욕', shower: '샤워' };
const ENV_LABELS: Record<string, string> = { bathtub: '욕조', partial_bath: '족욕', footbath: '족욕', shower: '샤워' };
const HERO_HEIGHT = 268;
const HERO_HEIGHT_TRIP = 356;
const STICKY_HEADER_HEIGHT = 54;

export default function RecipeScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const [recommendation, setRecommendation] = useState<BathRecommendation | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [isPreBathGateVisible, setIsPreBathGateVisible] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; body: string } | null>(null);
  useCatalogHydration();

  useEffect(() => {
    if (!id) return;
    setIsPreBathGateVisible(false);
    getRecommendationById(id).then((rec) => {
      if (rec) {
        setRecommendation(rec);
      }
    });
  }, [id]);

  const shouldGateStart = useMemo(
    () => (recommendation ? shouldRequirePreBathGate(recommendation) : false),
    [recommendation]
  );

  const handleStartBath = () => {
    if (!recommendation) return;
    if (shouldGateStart) {
      setIsPreBathGateVisible(true);
      return;
    }
    router.replace(`/result/timer/${id}`);
  };

  const preBathItems = useMemo(
    () => (recommendation ? buildPreBathChecklist(recommendation, { source }) : []),
    [recommendation, source]
  );
  const sleepPreparationPlan = useMemo(() => {
    if (!recommendation || recommendation.intentId !== 'sleep_ready') {
      return null;
    }

    return buildSleepPreparationPlan(new Date(), recommendation.durationMinutes ?? 10);
  }, [recommendation]);

  if (!recommendation) return <View style={[ui.screenShellV2, styles.centered]}><Text style={{ color: V2_TEXT_SECONDARY }}>{copy.completion.loading}</Text></View>;

  const persona = PERSONA_DEFINITIONS.find((p) => p.code === recommendation.persona);
  const recipeTitle = recommendation.mode === 'trip' ? (recommendation.themeTitle ?? '무드 테마') : (persona?.nameKo ?? '맞춤 루틴');
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
  const heroImage = isTripRecipe
    ? getTripCardImageForEnvironment(
      recommendation.themeId ?? recommendation.intentId ?? '',
      recommendation.environmentUsed
    )
    : getCareCardImageForEnvironment(recommendation.intentId ?? '', recommendation.environmentUsed);
  const isImageHeroRecipe = Boolean(heroImage);
  const titleFadeStart = isImageHeroRecipe ? 72 : 46;
  const titleFadeEnd = isImageHeroRecipe ? 158 : 118;
  const heroTitleOpacity = scrollY.interpolate({
    inputRange: [titleFadeStart, titleFadeEnd],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const stickyTitleOpacity = scrollY.interpolate({
    inputRange: [titleFadeStart + 12, titleFadeEnd],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const stickyTitleTranslateY = scrollY.interpolate({
    inputRange: [titleFadeStart + 12, titleFadeEnd],
    outputRange: [4, 0],
    extrapolate: 'clamp',
  });
  const stickyBackdropOpacity = scrollY.interpolate({
    inputRange: [24, titleFadeEnd],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
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
      title: requiredPreparation ? requiredPreparation.name : copy.routine.recipe.noneTitle,
      body: requiredPreparation
        ? copy.routine.recipe.requiredBody(requiredPreparation.name)
        : recommendation.environmentUsed === 'shower'
          ? copy.routine.recipe.showerNoRequiredBody
          : copy.routine.recipe.noRequiredBody,
    },
    {
      id: 'optional',
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
    title: string;
    body: string;
  }>;
  const routineSteps = [
    {
      id: 'bath',
      label: copy.routine.recipe.waterStepLabel,
      body: `${temperatureLabel}로 맞추고 ${recommendation.environmentHints[0] ?? `${environmentLabel} 방식에 맞게 편안한 높이로 물을 준비해주세요.`}`,
    },
    {
      id: 'ingredient',
      label: copy.routine.recipe.ingredientStepLabel,
      body: requiredPreparation
        ? copy.routine.recipe.ingredientStepBody(requiredPreparation.name)
        : copy.routine.recipe.noIngredientStepBody,
    },
  ] as const;
  const quickSummarySteps = (() => {
    if (recommendation.environmentUsed === 'shower') {
      return ['물 온도 맞추기', '목과 어깨부터 천천히', '마지막엔 물 온도 살짝 낮추기'];
    }
    if (recommendation.environmentUsed === 'footbath' || recommendation.environmentUsed === 'partial_bath') {
      return ['발목까지 물 준비하기', `${durationLabel}만 가볍게 담그기`, '끝나면 천천히 일어나기'];
    }
    return ['물 온도 맞추기', `${durationLabel}만 몸 담그기`, '끝나면 물 한 잔'];
  })();

  const handleProductDetail = (item: ProductMatchItem) => {
    setShowProductModal(false);
    setSelectedProduct(item.product);
  };

  const handleProductPurchase = async (item: ProductMatchItem) => {
    const purchaseUrl = item.product.purchaseUrl ?? item.ingredient.purchaseUrl;
    if (!purchaseUrl) {
      setAlertDialog({
        title: copy.alerts.purchaseUnavailableTitle,
        body: copy.alerts.purchaseUnavailableBody,
      });
      return;
    }

    const didOpen = await openExternalUrl(purchaseUrl);
    if (!didOpen) {
      setAlertDialog({
        title: copy.alerts.openLinkFailedTitle,
        body: copy.alerts.openLinkFailedBody,
      });
    }
  };

  const handleDetailPurchase = async (product: CatalogProduct) => {
    if (!product.purchaseUrl) {
      setAlertDialog({
        title: copy.alerts.purchaseUnavailableTitle,
        body: copy.alerts.purchaseUnavailableBody,
      });
      return;
    }

    const didOpen = await openExternalUrl(product.purchaseUrl);
    if (!didOpen) {
      setAlertDialog({
        title: copy.alerts.openLinkFailedTitle,
        body: copy.alerts.openLinkFailedBody,
      });
    }
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
      <RNAnimated.View
        pointerEvents="box-none"
        style={[
          styles.stickyHeader,
          {
            height: insets.top + STICKY_HEADER_HEIGHT,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <RNAnimated.View
          pointerEvents="none"
          style={[styles.stickyHeaderBackdrop, { opacity: stickyBackdropOpacity }]}
        />
        <View style={styles.stickyHeaderContent}>
          <Pressable style={styles.navButton} onPress={() => router.back()}>
            <FontAwesome name="angle-left" size={24} color={V2_TEXT_PRIMARY} />
          </Pressable>
          <RNAnimated.View
            pointerEvents="none"
            style={[
              styles.stickyHeaderTitleWrap,
              {
                opacity: stickyTitleOpacity,
                transform: [{ translateY: stickyTitleTranslateY }],
              },
            ]}
          >
            <Text numberOfLines={1} style={styles.stickyHeaderTitle}>
              {recipeTitle}
            </Text>
            <Text numberOfLines={1} style={styles.stickyHeaderMeta}>
              {temperatureLabel} · {durationLabel}
            </Text>
          </RNAnimated.View>
          <View style={styles.stickyMetaRow}>
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
      </RNAnimated.View>
      <RNAnimated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={[styles.heroWrapper, isImageHeroRecipe && styles.heroWrapperImage]}>
          <LinearGradient
            colors={heroGradient}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.92, y: 1 }}
            style={[styles.hero, isImageHeroRecipe && styles.heroImageRecipe]}
          >
            {heroImage ? (
              <ImageBackground source={heroImage} style={StyleSheet.absoluteFillObject} imageStyle={styles.heroImage}>
                <View style={styles.heroImageOverlay} />
              </ImageBackground>
            ) : null}
            {isImageHeroRecipe ? (
              <LinearGradient
                colors={['rgba(6, 12, 24, 0.08)', 'rgba(6, 12, 24, 0.18)', 'rgba(8, 14, 26, 0.46)', V2_BG_BASE]}
                locations={[0, 0.32, 0.7, 1]}
                style={styles.heroImageGradient}
              />
            ) : null}
            {!isImageHeroRecipe ? <View style={styles.heroGlowLarge} /> : null}
            {!isImageHeroRecipe ? <View style={styles.heroGlowSmall} /> : null}
            <View style={styles.heroNavSpacer} />
            <Reanimated.View entering={FadeIn.duration(450)} style={[styles.heroContent, isImageHeroRecipe && styles.heroContentImage]}>
              <RNAnimated.View style={[styles.heroTitleBlock, isImageHeroRecipe && styles.heroTitleBlockImage, { opacity: heroTitleOpacity }]}>
                <Text style={styles.heroEyebrow}>{modeLabel}</Text>
                <Text style={styles.heroTitle}>{recipeTitle}</Text>
                <Text style={styles.heroLead}>{evidence.reasonLines[0]}</Text>
              </RNAnimated.View>
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
            </Reanimated.View>
          </LinearGradient>
        </View>

        <Reanimated.View entering={FadeInDown.duration(400).delay(80)} style={[ui.glassCardV2, styles.quickSummaryCard]}>
          <Text style={styles.quickSummaryEyebrow}>{copy.routine.recipe.summaryEyebrow}</Text>
          <Text style={styles.quickSummaryTitle}>{copy.routine.recipe.summaryTitle}</Text>
          <View style={styles.quickMetricRow}>
            <Text style={styles.quickMetricText}>{temperatureLabel}</Text>
            <View style={styles.quickMetricDot} />
            <Text style={styles.quickMetricText}>{durationLabel}</Text>
            <View style={styles.quickMetricDot} />
            <Text style={styles.quickMetricText}>{environmentLabel}</Text>
          </View>
          <View style={styles.quickStepList}>
            {quickSummarySteps.map((step, index) => (
              <View key={step} style={styles.quickStepRow}>
                <View style={[styles.stepIndexBadge, { backgroundColor: `${recommendation.colorHex}18`, borderColor: `${recommendation.colorHex}45` }]}>
                  <Text style={styles.stepIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.quickStepText}>{step}</Text>
              </View>
            ))}
          </View>
          <View style={styles.quickActionRow}>
            <Pressable style={[ui.primaryButtonV2, styles.quickPrimaryButton]} onPress={handleStartBath}>
              <Text style={ui.primaryButtonTextV2}>{source === 'history' ? copy.routine.preBath.historyStartCta : copy.routine.startCta}</Text>
            </Pressable>
            <Pressable
              style={[ui.secondaryButtonV2, styles.quickSecondaryButton]}
              onPress={() => setDetailsExpanded((current) => !current)}
            >
              <Text style={ui.secondaryButtonTextV2}>
                {detailsExpanded ? '접어두기' : copy.routine.detailCta}
              </Text>
            </Pressable>
          </View>
        </Reanimated.View>

        {detailsExpanded ? (
          <>
            <Reanimated.View entering={FadeInDown.duration(400)} style={[ui.glassCardV2, styles.stepsCard]}>
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
            </Reanimated.View>

            <Reanimated.View entering={FadeInDown.duration(400).delay(80)}>
              <Text style={styles.sectionTitle}>{copy.routine.recipe.guideTitle}</Text>
              <Text style={styles.sectionSubtitle}>{copy.routine.recipe.guideSubtitle}</Text>
              <View style={[ui.glassCardV2, styles.ingredientsCard]}>
                {preparationRows.map((item, index) => (
                  <View key={item.id} style={[styles.trackRow, index === preparationRows.length - 1 && styles.trackRowLast]}>
                    <View style={[styles.trackCircle, { backgroundColor: `${recommendation.colorHex}20`, borderColor: `${recommendation.colorHex}55` }]}>
                      <Text style={styles.trackBadgeText}>{String(index + 1).padStart(2, '0')}</Text>
                    </View>
                    <View style={styles.trackInfo}><Text style={styles.trackName}>{item.title}</Text><Text style={styles.trackDesc}>{item.body}</Text></View>
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
            </Reanimated.View>
          </>
        ) : (
          <Pressable
            style={[ui.glassCardV2, styles.detailCollapsedCard]}
            onPress={() => setDetailsExpanded(true)}
          >
            <View style={styles.detailCollapsedCopy}>
              <Text style={styles.detailCollapsedTitle}>{copy.routine.detailCta}</Text>
              <Text style={styles.detailCollapsedText}>추천 이유와 준비물은 필요할 때만 확인해요.</Text>
            </View>
            <FontAwesome name="angle-down" size={18} color={V2_ACCENT} />
          </Pressable>
        )}

        <Reanimated.View entering={FadeInDown.duration(400).delay(160)} style={[ui.glassCardV2, styles.safetyBlock]}>
          <Text style={styles.safetyEyebrow}>{copy.routine.recipe.safetyEyebrow}</Text>
          <Text style={styles.safetyTitle}>{copy.routine.safetyTitle}</Text>
          <Text style={styles.safetyLead}>{primarySafetyLine}</Text>
          {copy.routine.safetyLines.map((line) => <Text key={line} style={styles.safetyText}>• {line}</Text>)}
        </Reanimated.View>

      </RNAnimated.ScrollView>

      <View style={styles.bottomCTA}>
        {sleepPreparationPlan ? (
          <View style={[ui.glassCardV2, styles.sleepWindowCard]}>
            <Text style={styles.sleepWindowEyebrow}>{copy.routine.recipe.sleepWindow.eyebrow}</Text>
            <Text style={styles.sleepWindowTitle}>{copy.routine.recipe.sleepWindow.title}</Text>
            <Text style={styles.sleepWindowBody}>
              {sleepPreparationPlan.state === 'scheduled'
                ? copy.routine.recipe.sleepWindow.scheduledSummary(
                    formatSleepPlanTime(sleepPreparationPlan.recommendedStart),
                    formatSleepPlanTime(sleepPreparationPlan.recommendedEnd)
                  )
                : copy.routine.recipe.sleepWindow.startNowSummary(
                    formatSleepPlanTime(sleepPreparationPlan.earliestBedtimeIfStartingNow)
                  )}
            </Text>
            <Text style={styles.sleepWindowHint}>{copy.routine.recipe.sleepWindow.defaultBedtimeHint}</Text>
          </View>
        ) : null}
        <Pressable style={[ui.primaryButtonV2, styles.startButton]} onPress={handleStartBath}>
          <Text style={ui.primaryButtonTextV2}>{source === 'history' ? copy.routine.preBath.historyStartCta : copy.routine.startCta}</Text>
        </Pressable>
      </View>
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
      <AppAlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        body={alertDialog?.body ?? ''}
        onClose={() => setAlertDialog(null)}
        eyebrow="SHOP"
        iconName="shopping-bag"
      />
      {shouldGateStart ? (
        <PreBathGateModal
          visible={isPreBathGateVisible}
          title={copy.routine.preBath.title}
          subtitle={source === 'history' ? copy.routine.preBath.historySubtitle : copy.routine.preBath.subtitle}
          items={preBathItems}
          confirmLabel={source === 'history' ? copy.routine.preBath.historyStartCta : copy.routine.startCta}
          onClose={() => setIsPreBathGateVisible(false)}
          onConfirm={handleConfirmPreBath}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_BG_BASE },
  centered: { justifyContent: 'center', alignItems: 'center' },
  stickyHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 20,
    paddingHorizontal: 20,
  },
  stickyHeaderBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 13, 24, 0.76)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  stickyHeaderContent: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stickyHeaderTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 96,
  },
  stickyHeaderTitle: {
    maxWidth: '100%',
    textAlign: 'center',
    color: V2_TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: luxuryFonts.display,
  },
  stickyHeaderMeta: {
    marginTop: 1,
    color: V2_TEXT_MUTED,
    fontSize: 10,
    fontWeight: '400',
    fontFamily: luxuryFonts.sans,
  },
  stickyMetaRow: {
    minWidth: 76,
    maxWidth: 118,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flexWrap: 'wrap',
  },
  heroWrapper: { paddingHorizontal: 18, paddingTop: 14 },
  heroWrapperImage: { paddingHorizontal: 0, paddingTop: 0, marginTop: -18, marginHorizontal: -20 },
  hero: { height: HERO_HEIGHT, borderRadius: luxuryRadii.cardLg, overflow: 'hidden', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, justifyContent: 'space-between' },
  heroImageRecipe: {
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
  navButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'flex-start' },
  heroNavSpacer: { height: 32 },
  heroContent: { gap: 12, alignItems: 'flex-start' },
  heroContentImage: { width: '100%', marginTop: 'auto' },
  heroInfoBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: 'rgba(8,22,54,0.26)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  heroInfoBadgeText: { fontSize: TYPE_CAPTION - 1, color: V2_TEXT_PRIMARY, fontWeight: '700', fontFamily: luxuryFonts.sans },
  heroSafetyBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: 'rgba(201,164,91,0.22)', borderWidth: 1, borderColor: 'rgba(201,164,91,0.36)' },
  heroSafetyBadgeText: { fontSize: TYPE_CAPTION - 1, color: V2_TEXT_PRIMARY, fontWeight: '700', fontFamily: luxuryFonts.sans },
  heroTitleBlock: { gap: 8, maxWidth: '82%' },
  heroTitleBlockImage: { maxWidth: '100%' },
  heroEyebrow: { fontSize: TYPE_CAPTION - 1, color: 'rgba(255,255,255,0.74)', fontWeight: '700', letterSpacing: 0, fontFamily: luxuryFonts.sans },
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  quickSummaryCard: { paddingHorizontal: 16, paddingVertical: 16, marginBottom: 14, marginTop: 14 },
  quickSummaryEyebrow: {
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: 0,
    fontFamily: luxuryFonts.sans,
    marginBottom: 4,
  },
  quickSummaryTitle: {
    fontSize: TYPE_TITLE + 4,
    color: V2_TEXT_PRIMARY,
    lineHeight: 30,
    fontFamily: luxuryFonts.display,
  },
  quickMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  quickMetricText: {
    fontSize: TYPE_BODY,
    color: V2_TEXT_PRIMARY,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  quickMetricDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: V2_ACCENT,
    opacity: 0.68,
  },
  quickStepList: { gap: 8 },
  quickStepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quickStepText: { flex: 1, fontSize: TYPE_BODY, color: V2_TEXT_PRIMARY, lineHeight: 21, fontFamily: luxuryFonts.sans },
  quickActionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  quickPrimaryButton: { flex: 1, minHeight: 48 },
  quickSecondaryButton: { flex: 1, minHeight: 48 },
  detailCollapsedCard: {
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailCollapsedCopy: { flex: 1, gap: 4 },
  detailCollapsedTitle: { fontSize: TYPE_BODY, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  detailCollapsedText: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, lineHeight: 18, fontFamily: luxuryFonts.sans },
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
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: 0,
    fontFamily: luxuryFonts.sans,
  },
  productBridgeTitle: { fontSize: TYPE_TITLE, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  productBridgeBody: { fontSize: TYPE_CAPTION, lineHeight: 18, color: V2_TEXT_SECONDARY, fontFamily: luxuryFonts.sans },
  productBridgeButton: { marginTop: 4 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: V2_BORDER, gap: 14 },
  trackRowLast: { borderBottomWidth: 0 },
  trackCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  trackBadgeText: { fontSize: TYPE_CAPTION, color: V2_TEXT_PRIMARY, fontWeight: '700', letterSpacing: 0, fontVariant: ['tabular-nums'], fontFamily: luxuryFonts.mono },
  trackInfo: { flex: 1 },
  trackName: { fontSize: TYPE_BODY + 1, color: V2_TEXT_PRIMARY, marginBottom: 2, fontFamily: luxuryFonts.display },
  trackDesc: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontFamily: luxuryFonts.sans },
  safetyBlock: { marginTop: 20, marginBottom: 18, padding: 14, gap: 4 },
  safetyEyebrow: { fontSize: TYPE_CAPTION - 1, fontWeight: '700', color: V2_ACCENT, letterSpacing: 0, marginBottom: 4, fontFamily: luxuryFonts.sans },
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
  sleepWindowCard: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 4,
  },
  sleepWindowEyebrow: {
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: 0,
    fontFamily: luxuryFonts.sans,
  },
  sleepWindowTitle: {
    fontSize: TYPE_BODY + 1,
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
  },
  sleepWindowBody: {
    fontSize: TYPE_CAPTION,
    color: V2_TEXT_SECONDARY,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  sleepWindowHint: {
    fontSize: TYPE_CAPTION - 1,
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
  },
  startButton: { width: '100%' },
});
