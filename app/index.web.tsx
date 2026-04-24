import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandMark } from '@/src/components/BrandMark';
import {
  TYPE_CAPTION,
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_ACCENT_TEXT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_BORDER,
  V2_BORDER_STRONG,
  V2_SURFACE,
  V2_SURFACE_SOFT,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';

const heroShot = require('../output/screenshots/ui-states/home-with-history.png');
const careShot = require('../output/screenshots/ui-states/care-default.png');
const recipeShot = require('../output/screenshots/ui-states/recipe-care.png');
const timerShot = require('../output/screenshots/ui-states/timer-running.png');
const completionShot = require('../output/screenshots/ui-states/completion-default.png');
const tripShot = require('../output/screenshots/ui-states/trip-default.png');
const PHONE_RATIO = 390 / 844;

const proofPoints = [
  {
    title: '오늘의 상태를 먼저 묻습니다',
    body: '건강 상태와 목욕 환경을 먼저 보고, 무리 없는 루틴만 추천합니다.',
  },
  {
    title: '추천에서 끝나지 않습니다',
    body: '레시피, 타이머, 마무리 화면까지 이어져 실제로 쉬는 시간을 완성합니다.',
  },
  {
    title: '집에 있는 방식으로 시작합니다',
    body: '욕조, 샤워, 족욕 상황에 맞춰 온도와 시간을 다르게 안내합니다.',
  },
] as const;

const flowSteps = [
  {
    eyebrow: 'STEP 1',
    title: '레시피 확인',
    body: '온도와 시간, 준비물을 바로 이해할 수 있게 정리해 보여줍니다.',
    image: recipeShot,
  },
  {
    eyebrow: 'STEP 2',
    title: '타이머로 따라가기',
    body: '시작한 뒤에는 화면을 읽기보다 흐름을 따라가며 쉬면 됩니다.',
    image: timerShot,
  },
  {
    eyebrow: 'STEP 3',
    title: '잔잔하게 마무리',
    body: '끝난 뒤에는 수분 보충과 보습 같은 다음 행동을 안내합니다.',
    image: completionShot,
  },
] as const;

const modeCards = [
  {
    title: 'Condition Routine',
    body: '몸 상태와 안전 기준에 맞춘 기본 루틴.',
    image: careShot,
  },
  {
    title: 'Mood Routine',
    body: '분위기를 바꾸고 싶은 날을 위한 테마 루틴.',
    image: tripShot,
  },
] as const;

export default function WebLanding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 1080;
  const wide = width >= 1280;
  const railWidth = desktop ? (wide ? 1180 : 1040) : Math.min(width - 32, 720);

  const heroTitle = useMemo(() => {
    if (desktop) return '오늘 상태에 맞는 목욕 루틴을,\n무리 없는 순서로.';
    return '오늘 상태에 맞는 목욕 루틴을\n무리 없는 순서로.';
  }, [desktop]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <View style={styles.backdropTop} />
      <View style={styles.backdropGlow} />

      <View style={[styles.rail, { width: railWidth }]}>
        <View style={[styles.hero, desktop ? styles.heroRow : styles.heroColumn]}>
          <View style={[styles.heroCopy, desktop ? styles.heroCopyDesktop : styles.heroCopyMobile]}>
            <View style={styles.brandRow}>
              <BrandMark size={32} framed />
              <Text style={styles.eyebrow}>BATH TIME</Text>
            </View>

            <Text style={[styles.heroTitle, desktop && styles.heroTitleDesktop]}>{heroTitle}</Text>
            <Text style={styles.heroBody}>
              욕조, 샤워, 족욕 환경과 건강 상태를 함께 보고, 오늘 가장 편안하게 쉬기 좋은 바스타임을
              준비합니다.
            </Text>

            <View style={[styles.heroActions, !desktop && styles.heroActionsStack]}>
              <PrimaryButton label="온보딩 시작하기" onPress={() => router.push('/onboarding/welcome')} />
              <SecondaryButton label="컨디션 루틴 보기" onPress={() => router.push('/(tabs)')} />
            </View>

            <View style={[styles.metricRow, !desktop && styles.metricColumn]}>
              <Metric label="입욕 환경" value="욕조, 샤워, 족욕" />
              <Metric label="가이드 흐름" value="레시피 → 타이머 → 완료" />
              <Metric label="추천 원칙" value="개인화 + 안전 중심" />
            </View>
          </View>

          <View style={[styles.heroVisual, desktop ? styles.heroVisualDesktop : styles.heroVisualMobile]}>
            <View style={styles.heroShotFrame}>
              <Image source={heroShot} style={styles.heroShot} resizeMode="cover" />
            </View>

            <View style={styles.heroMiniCardTop}>
              <Text style={styles.miniEyebrow}>CARE</Text>
              <Text style={styles.miniTitle}>오늘 루틴을 바로 제안</Text>
              <Text style={styles.miniBody}>홈에서 가장 맞는 컨디션 루틴을 먼저 보여줍니다.</Text>
            </View>

            <View style={styles.heroMiniCardBottom}>
              <Text style={styles.miniEyebrow}>SAFE START</Text>
              <Text style={styles.miniTitle}>건강 상태를 먼저 확인</Text>
              <Text style={styles.miniBody}>무리 없는 온도와 시간을 고르는 구조를 전면에 둡니다.</Text>
            </View>
          </View>
        </View>

        <View style={[styles.proofGrid, desktop ? styles.proofGridDesktop : styles.proofGridMobile]}>
          {proofPoints.map((point) => (
            <View key={point.title} style={styles.proofCard}>
              <Text style={styles.proofTitle}>{point.title}</Text>
              <Text style={styles.proofBody}>{point.body}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, styles.personalSection, desktop ? styles.sectionRow : styles.sectionColumn]}>
          <View style={[styles.sectionCopy, desktop && styles.sectionCopyWide]}>
            <Text style={styles.sectionEyebrow}>DAILY SELF-CARE</Text>
            <Text style={styles.sectionTitle}>오늘 쉬는 방법을, 내 몸 상태에 맞는 루틴으로 번역합니다.</Text>
            <Text style={styles.sectionBody}>
              바스타임은 긴 설명보다 지금 가능한 행동을 먼저 정리합니다. 컨디션과 환경에 맞춘
              실행 가능한 루틴으로 바로 연결합니다.
            </Text>
            <View style={styles.bulletList}>
              <Bullet text="환경이 바뀌면 루틴도 달라집니다." />
              <Bullet text="건강 상태를 반영해 안전한 기준으로 조정합니다." />
              <Bullet text="추천 뒤에는 실제 타이머 가이드가 이어집니다." />
            </View>
          </View>

          <View style={[styles.dualVisuals, desktop ? styles.dualVisualsRow : styles.dualVisualsColumn]}>
            <PreviewCard
              title="Care"
              caption="몸 상태에 맞춘 기본 루틴"
              image={careShot}
            />
            <PreviewCard
              title="Guide"
              caption="바로 실행할 수 있는 레시피 화면"
              image={recipeShot}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionEyebrow}>GUIDED FLOW</Text>
              <Text style={styles.sectionTitle}>추천만 하지 않고, 바스타임이 끝날 때까지 함께 갑니다.</Text>
            </View>
            <Text style={styles.sectionAside}>
              랜딩에서는 이 플로우가 가장 강한 제품 증거입니다. 긴 설명보다 실제 화면이 먼저 보이게
              잡습니다.
            </Text>
          </View>

          <View style={[styles.flowGrid, desktop ? styles.flowGridDesktop : styles.flowGridMobile]}>
            {flowSteps.map((step) => (
              <View key={step.title} style={styles.flowCard}>
                <View style={styles.flowPreview}>
                  <Image source={step.image} style={styles.flowImage} resizeMode="cover" />
                </View>
                <Text style={styles.flowEyebrow}>{step.eyebrow}</Text>
                <Text style={styles.flowTitle}>{step.title}</Text>
                <Text style={styles.flowBody}>{step.body}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.modeSection, desktop ? styles.sectionRow : styles.sectionColumn]}>
          <View style={[styles.sectionCopy, desktop && styles.sectionCopyWide]}>
            <Text style={styles.sectionEyebrow}>SAFE, STILL SIMPLE</Text>
            <Text style={styles.sectionTitle}>안전을 앞에 두되, 화면은 계속 쉽게.</Text>
            <Text style={styles.sectionBody}>
              건강 상태를 묻는 이유는 더 강한 추천이 아니라 무리한 루틴을 피하기 위해서입니다.
              그래서 안내 문구도 조용하지만 분명하게 유지합니다.
            </Text>
          </View>

          <View style={[styles.modeGrid, desktop ? styles.modeGridDesktop : styles.modeGridMobile]}>
            {modeCards.map((card) => (
              <View key={card.title} style={styles.modeCard}>
                <Image source={card.image} style={styles.modeImage} resizeMode="cover" />
                <View style={styles.modeCopy}>
                  <Text style={styles.modeTitle}>{card.title}</Text>
                  <Text style={styles.modeBody}>{card.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.ctaPanel}>
          <View style={styles.ctaCopy}>
            <Text style={styles.sectionEyebrow}>START TODAY</Text>
            <Text style={styles.ctaTitle}>오늘 가능한 방식으로, 무리 없이 시작하는 바스타임.</Text>
            <Text style={styles.ctaBody}>
              분위기보다 먼저 온도와 시간, 안전 기준을 확인하고 바로 따라갈 수 있게 안내합니다.
            </Text>
          </View>
          <View style={[styles.heroActions, !desktop && styles.heroActionsStack]}>
            <PrimaryButton label="지금 시작하기" onPress={() => router.push('/onboarding/welcome')} />
            <SecondaryButton label="앱 둘러보기" onPress={() => router.push('/(tabs)')} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function PreviewCard({
  title,
  caption,
  image,
}: {
  title: string;
  caption: string;
  image: number;
}) {
  return (
    <View style={styles.previewCard}>
      <View style={styles.previewFrame}>
        <Image source={image} style={styles.previewImage} resizeMode="cover" />
      </View>
      <View style={styles.previewCopy}>
        <Text style={styles.previewTitle}>{title}</Text>
        <Text style={styles.previewCaption}>{caption}</Text>
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
      <Text style={styles.primaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
      <Text style={styles.secondaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: V2_BG_BASE,
  },
  pageContent: {
    paddingVertical: 40,
    paddingBottom: 72,
  },
  backdropTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    backgroundColor: V2_BG_TOP,
  },
  backdropGlow: {
    position: 'absolute',
    top: 120,
    right: 80,
    width: 420,
    height: 420,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 210, 191, 0.1)',
  },
  rail: {
    alignSelf: 'center',
    gap: 24,
  },
  hero: {
    backgroundColor: V2_SURFACE_SOFT,
    borderRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER,
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    minHeight: 560,
  },
  heroColumn: {
    flexDirection: 'column',
  },
  heroCopy: {
    padding: 36,
    gap: 18,
  },
  heroCopyDesktop: {
    flex: 0.94,
  },
  heroCopyMobile: {
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eyebrow: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_CAPTION,
    fontFamily: luxuryFonts.sans,
    letterSpacing: luxuryTracking.eyebrow,
  },
  heroTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: 38,
    lineHeight: 48,
    fontFamily: luxuryFonts.display,
    letterSpacing: -0.3,
  },
  heroTitleDesktop: {
    fontSize: 50,
    lineHeight: 60,
  },
  heroBody: {
    maxWidth: 520,
    color: V2_TEXT_SECONDARY,
    fontSize: 17,
    lineHeight: 28,
    fontFamily: luxuryFonts.sans,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  heroActionsStack: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metricColumn: {
    flexDirection: 'column',
  },
  metricCard: {
    flex: 1,
    minHeight: 84,
    padding: 16,
    borderRadius: luxuryRadii.card,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: V2_BORDER,
    gap: 8,
  },
  metricLabel: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_CAPTION,
    fontFamily: luxuryFonts.sans,
  },
  metricValue: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
  },
  heroVisual: {
    backgroundColor: V2_BG_BOTTOM,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  heroVisualDesktop: {
    flex: 1.06,
    minHeight: 560,
  },
  heroVisualMobile: {
    paddingTop: 0,
  },
  heroShotFrame: {
    width: '72%',
    maxWidth: 272,
    aspectRatio: PHONE_RATIO,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: '#0A1117',
  },
  heroShot: {
    width: '100%',
    height: '100%',
  },
  heroMiniCardTop: {
    position: 'absolute',
    top: 56,
    right: 24,
    width: 220,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(12, 18, 24, 0.92)',
    borderWidth: 1,
    borderColor: V2_BORDER,
    gap: 6,
  },
  heroMiniCardBottom: {
    position: 'absolute',
    left: 24,
    bottom: 42,
    width: 220,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(12, 18, 24, 0.94)',
    borderWidth: 1,
    borderColor: V2_BORDER,
    gap: 6,
  },
  miniEyebrow: {
    color: V2_TEXT_MUTED,
    fontSize: 11,
    fontFamily: luxuryFonts.sans,
    letterSpacing: 0,
  },
  miniTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
    fontWeight: '600',
  },
  miniBody: {
    color: V2_TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  proofGrid: {
    gap: 16,
  },
  proofGridDesktop: {
    flexDirection: 'row',
  },
  proofGridMobile: {
    flexDirection: 'column',
  },
  proofCard: {
    flex: 1,
    padding: 22,
    borderRadius: luxuryRadii.card,
    backgroundColor: V2_SURFACE,
    borderWidth: 1,
    borderColor: V2_BORDER,
    gap: 8,
  },
  proofTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: luxuryFonts.display,
  },
  proofBody: {
    color: V2_TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
  },
  section: {
    padding: 30,
    borderRadius: luxuryRadii.cardLg,
    backgroundColor: V2_SURFACE,
    borderWidth: 1,
    borderColor: V2_BORDER,
    gap: 20,
  },
  personalSection: {
    backgroundColor: 'rgba(16, 25, 32, 0.88)',
  },
  modeSection: {
    backgroundColor: 'rgba(15, 22, 29, 0.92)',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionColumn: {
    flexDirection: 'column',
  },
  sectionCopy: {
    gap: 14,
  },
  sectionCopyWide: {
    flex: 0.95,
    paddingRight: 10,
  },
  sectionEyebrow: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_CAPTION,
    fontFamily: luxuryFonts.sans,
    letterSpacing: luxuryTracking.eyebrow,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: 34,
    lineHeight: 44,
    fontFamily: luxuryFonts.display,
  },
  sectionBody: {
    color: V2_TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: luxuryFonts.sans,
    maxWidth: 520,
  },
  bulletList: {
    gap: 10,
    marginTop: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: V2_ACCENT,
  },
  bulletText: {
    color: V2_TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
  },
  dualVisuals: {
    gap: 16,
  },
  dualVisualsRow: {
    flex: 1.05,
    flexDirection: 'row',
  },
  dualVisualsColumn: {
    flexDirection: 'column',
  },
  previewCard: {
    flex: 1,
    borderRadius: luxuryRadii.card,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: V2_BORDER,
    padding: 18,
    gap: 14,
    alignItems: 'center',
  },
  previewFrame: {
    width: '100%',
    maxWidth: 220,
    aspectRatio: PHONE_RATIO,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0A1117',
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewCopy: {
    gap: 6,
    width: '100%',
  },
  previewTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: luxuryFonts.display,
  },
  previewCaption: {
    color: V2_TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
  },
  sectionHeaderCopy: {
    flex: 1,
    minWidth: 280,
    gap: 12,
  },
  sectionAside: {
    width: 320,
    color: V2_TEXT_MUTED,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  flowGrid: {
    gap: 16,
  },
  flowGridDesktop: {
    flexDirection: 'row',
  },
  flowGridMobile: {
    flexDirection: 'column',
  },
  flowCard: {
    flex: 1,
    padding: 18,
    borderRadius: luxuryRadii.card,
    backgroundColor: V2_SURFACE_SOFT,
    borderWidth: 1,
    borderColor: V2_BORDER,
    gap: 12,
    alignItems: 'center',
  },
  flowPreview: {
    width: '100%',
    maxWidth: 220,
    aspectRatio: PHONE_RATIO,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0A1117',
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  flowImage: {
    width: '100%',
    height: '100%',
  },
  flowEyebrow: {
    color: V2_TEXT_MUTED,
    fontSize: 11,
    fontFamily: luxuryFonts.sans,
    letterSpacing: 0,
  },
  flowTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: luxuryFonts.display,
  },
  flowBody: {
    color: V2_TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
    width: '100%',
  },
  modeGrid: {
    gap: 16,
  },
  modeGridDesktop: {
    flex: 1.08,
    flexDirection: 'row',
  },
  modeGridMobile: {
    flexDirection: 'column',
  },
  modeCard: {
    flex: 1,
    borderRadius: luxuryRadii.card,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: V2_BORDER,
    padding: 18,
    gap: 14,
    alignItems: 'center',
  },
  modeImage: {
    width: '100%',
    maxWidth: 220,
    aspectRatio: PHONE_RATIO,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: '#0A1117',
  },
  modeCopy: {
    gap: 8,
    width: '100%',
  },
  modeTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: luxuryFonts.display,
  },
  modeBody: {
    color: V2_TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  ctaPanel: {
    padding: 32,
    borderRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER_STRONG,
    backgroundColor: 'rgba(148, 210, 191, 0.1)',
    gap: 20,
  },
  ctaCopy: {
    gap: 12,
  },
  ctaTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: 36,
    lineHeight: 46,
    fontFamily: luxuryFonts.display,
  },
  ctaBody: {
    color: V2_TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: luxuryFonts.sans,
    maxWidth: 620,
  },
  primaryButton: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: luxuryRadii.button,
    backgroundColor: V2_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: V2_ACCENT_TEXT,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  secondaryButton: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: luxuryRadii.button,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: V2_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonLabel: {
    color: V2_TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
