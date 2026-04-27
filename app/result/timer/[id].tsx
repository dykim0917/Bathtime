import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Platform, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { BathRecommendation } from '@/src/engine/types';
import { getRecommendationById } from '@/src/storage/history';
import { saveSession, updateSessionCompletion } from '@/src/storage/session';
import { AudioMixer } from '@/src/components/AudioMixer';
import { AnimatedModalShell } from '@/src/components/AnimatedModalShell';
import { useDualAudioPlayer } from '@/src/hooks/useDualAudioPlayer';
import { useHaptic } from '@/src/hooks/useHaptic';
import { copy } from '@/src/content/copy';
import { CARE_INTENT_CARDS, TRIP_INTENT_CARDS } from '@/src/data/intents';
import { getCareCardImageForEnvironment } from '@/src/data/careImages';
import { getTripCardImageForEnvironment } from '@/src/data/tripImages';
import { TYPE_BODY, TYPE_CAPTION, V2_ACCENT, V2_ACCENT_SOFT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_OVERLAY, V2_BG_TOP, V2_BORDER, V2_DANGER, V2_MODAL_HANDLE, V2_MODAL_SURFACE_ELEVATED, V2_SURFACE, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { buildRoutineIntroDetail, getRoutineFillLevel, INTRO_DURATION_MS, RoutineTimerPhase } from '@/src/utils/routineTimer';

function withAlpha(hex: string, alpha: string): string {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  return `#${normalized}${alpha}`;
}

function getTimerRoutineName(recommendation: BathRecommendation): string {
  if (recommendation.mode === 'trip') {
    return (
      recommendation.themeTitle ??
      TRIP_INTENT_CARDS.find((card) => card.intent_id === recommendation.intentId)?.copy_title ??
      '무드 루틴'
    );
  }

  return (
    CARE_INTENT_CARDS.find((card) => card.intent_id === recommendation.intentId)?.copy_title ??
    '컨디션 루틴'
  );
}

export default function TimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recommendation, setRecommendation] = useState<BathRecommendation | null>(null);
  const [phase, setPhase] = useState<RoutineTimerPhase>('intro');
  const [introRemainingMs, setIntroRemainingMs] = useState(INTRO_DURATION_MS);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const introTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const introCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<string>(new Date().toISOString());
  const hasRoutineStartedRef = useRef(false);
  const isCompletingRef = useRef(false);
  const targetEndAtMsRef = useRef<number | null>(null);
  const pausedAtMsRef = useRef<number | null>(null);
  const accumulatedPausedMsRef = useRef(0);
  const isPausedRef = useRef(false);
  const haptic = useHaptic();
  const { light: triggerLightHaptic, success: triggerSuccessHaptic } = haptic;
  const recommendationRef = useRef<BathRecommendation | null>(null);
  const totalSecondsRef = useRef(0);

  const audio = useDualAudioPlayer(recommendation?.music ?? null, recommendation?.ambience ?? null);
  const { play: playAudio, pause: pauseAudio, stop: stopAudio, setMusicVolume, setAmbienceVolume } = audio;
  const controlsOpacity = useSharedValue(1);
  const controlsStyle = useAnimatedStyle(() => ({ opacity: controlsOpacity.value }));

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearIntroTimer = useCallback(() => {
    if (introTimerRef.current) {
      clearInterval(introTimerRef.current);
      introTimerRef.current = null;
    }
    if (introCompleteTimeoutRef.current) {
      clearTimeout(introCompleteTimeoutRef.current);
      introCompleteTimeoutRef.current = null;
    }
  }, []);

  const computeRemainingSeconds = useCallback(() => {
    if (!targetEndAtMsRef.current) return remainingSeconds;
    const now = Date.now();
    const effectiveNow = isPausedRef.current && pausedAtMsRef.current ? pausedAtMsRef.current : now;
    const msLeft = targetEndAtMsRef.current - effectiveNow - accumulatedPausedMsRef.current;
    return Math.max(0, Math.ceil(msLeft / 1000));
  }, [remainingSeconds]);

  const handleComplete = useCallback(async (remainingAtComplete?: number) => {
    if (!id || isCompletingRef.current) return;
    isCompletingRef.current = true;
    clearIntroTimer();
    clearTimer();
    stopAudio();
    const completedAt = new Date().toISOString();
    const derivedRemaining = remainingAtComplete ?? computeRemainingSeconds();
    const actualDurationSeconds = Math.max(0, totalSeconds - derivedRemaining);
    await updateSessionCompletion(id, completedAt, actualDurationSeconds);
    router.replace(`/result/completion/${id}`);
  }, [id, clearIntroTimer, clearTimer, stopAudio, totalSeconds, computeRemainingSeconds]);

  const startTicking = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      const nextRemaining = computeRemainingSeconds();
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0) {
        triggerSuccessHaptic();
        void handleComplete(0);
      }
    }, 250);
  }, [clearTimer, computeRemainingSeconds, triggerSuccessHaptic, handleComplete]);

  const startRoutine = useCallback(() => {
    const currentRecommendation = recommendationRef.current;
    const currentTotalSeconds = totalSecondsRef.current;
    if (!id || !currentRecommendation || currentTotalSeconds <= 0 || hasRoutineStartedRef.current) return;

    clearIntroTimer();
    const now = Date.now();
    targetEndAtMsRef.current = now + currentTotalSeconds * 1000;
    accumulatedPausedMsRef.current = 0;
    pausedAtMsRef.current = null;
    isPausedRef.current = false;
    hasRoutineStartedRef.current = true;
    startedAtRef.current = new Date(now).toISOString();

    setPhase('active');
    setIntroRemainingMs(0);
    setIsPaused(false);
    setRemainingSeconds(currentTotalSeconds);

    triggerLightHaptic();
    void saveSession({ recommendationId: id, startedAt: startedAtRef.current });
    playAudio();
    startTicking();
  }, [id, clearIntroTimer, triggerLightHaptic, playAudio, startTicking]);

  useEffect(() => {
    recommendationRef.current = recommendation;
  }, [recommendation]);

  useEffect(() => {
    totalSecondsRef.current = totalSeconds;
  }, [totalSeconds]);

  useEffect(() => {
    if (!id) return;

    clearIntroTimer();
    clearTimer();
    stopAudio();

    hasRoutineStartedRef.current = false;
    isCompletingRef.current = false;
    targetEndAtMsRef.current = null;
    pausedAtMsRef.current = null;
    accumulatedPausedMsRef.current = 0;
    isPausedRef.current = false;

    setRecommendation(null);
    setPhase('intro');
    setIntroRemainingMs(INTRO_DURATION_MS);
    setIsPaused(false);
    setShowControls(true);
    setShowSoundModal(false);
    setShowFinishConfirmModal(false);
    controlsOpacity.value = 1;
    setRemainingSeconds(0);
    setTotalSeconds(0);

    getRecommendationById(id).then((rec) => {
      if (!rec) return;
      setRecommendation(rec);
      const secs = (rec.durationMinutes ?? 15) * 60;
      setRemainingSeconds(secs);
      setTotalSeconds(secs);
    });
  }, [id, clearIntroTimer, clearTimer, stopAudio, controlsOpacity]);

  useEffect(() => {
    if (!recommendation || totalSeconds <= 0 || phase !== 'intro' || hasRoutineStartedRef.current) return;

    const introStartedAt = Date.now();
    clearIntroTimer();
    setIntroRemainingMs(INTRO_DURATION_MS);

    introTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - introStartedAt;
      const nextRemainingMs = Math.max(0, INTRO_DURATION_MS - elapsed);
      setIntroRemainingMs(nextRemainingMs);
    }, 50);
    introCompleteTimeoutRef.current = setTimeout(() => {
      setIntroRemainingMs(0);
      startRoutine();
    }, INTRO_DURATION_MS);

    return clearIntroTimer;
  }, [recommendation, totalSeconds, phase, clearIntroTimer, startRoutine]);

  useEffect(() => () => {
    clearIntroTimer();
    clearTimer();
    stopAudio();
  }, [clearIntroTimer, clearTimer, stopAudio]);

  const handleScreenPress = () => {
    if (phase === 'intro') {
      startRoutine();
      return;
    }

    const newVal = !showControls;
    setShowControls(newVal);
    controlsOpacity.value = withTiming(newVal ? 1 : 0, { duration: 300 });
  };

  const togglePause = () => {
    if (phase !== 'active') return;

    if (isPausedRef.current) {
      const now = Date.now();
      if (pausedAtMsRef.current) accumulatedPausedMsRef.current += now - pausedAtMsRef.current;
      pausedAtMsRef.current = null;
      isPausedRef.current = false;
      setIsPaused(false);
      playAudio();
      startTicking();
    } else {
      pausedAtMsRef.current = Date.now();
      isPausedRef.current = true;
      setIsPaused(true);
      setRemainingSeconds(computeRemainingSeconds());
      clearTimer();
      pauseAudio();
    }

    triggerLightHaptic();
  };

  const confirmFinish = () => {
    if (phase !== 'active') return;
    setShowFinishConfirmModal(true);
  };

  if (!recommendation) {
    return (
      <View style={[ui.screenShellV2, styles.centered]}>
        <Text style={{ color: V2_TEXT_SECONDARY }}>{copy.completion.loading}</Text>
      </View>
    );
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const elapsedStr = (() => {
    const elapsed = totalSeconds - remainingSeconds;
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  })();
  const totalStr = (() => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  })();
  const progressPercent = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  const routineName = getTimerRoutineName(recommendation);
  const modeLabel = recommendation.mode === 'trip' ? '무드 루틴' : '컨디션 루틴';
  const audioSummary = `${recommendation.music.title} · ${recommendation.ambience.title}`;
  const introDetail = buildRoutineIntroDetail();
  const fillLevel = getRoutineFillLevel({
    phase,
    introRemainingMs,
    remainingSeconds,
    totalSeconds,
  });
  const backgroundImage = recommendation.mode === 'trip'
    ? getTripCardImageForEnvironment(
      recommendation.themeId ?? recommendation.intentId ?? '',
      recommendation.environmentUsed
    )
    : getCareCardImageForEnvironment(recommendation.intentId ?? '', recommendation.environmentUsed);
  const fillHeight = `${Math.round(fillLevel * 100)}%` as `${number}%`;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      {backgroundImage ? (
        <Image
          source={backgroundImage}
          blurRadius={1.5}
          resizeMode="cover"
          style={styles.backgroundImage}
        />
      ) : null}
      <View style={[styles.colorAuraTop, { backgroundColor: withAlpha(recommendation.colorHex, '38') }]} />
      <View style={[styles.colorAuraBottom, { backgroundColor: withAlpha(recommendation.colorHex, '2E') }]} />
      <View style={styles.timerFillMask}>
        <LinearGradient
          colors={[
            withAlpha(recommendation.colorHex, '08'),
            withAlpha(recommendation.colorHex, '28'),
            withAlpha(recommendation.colorHex, '4A'),
          ]}
          style={[styles.timerFillLayer, { height: fillHeight }]}
        />
      </View>
      <LinearGradient
        colors={['rgba(4, 8, 13, 0.28)', 'rgba(6, 10, 16, 0.76)', 'rgba(4, 8, 13, 0.92)']}
        locations={[0, 0.54, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay} />

      <Pressable style={StyleSheet.absoluteFill} onPress={handleScreenPress}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            {phase === 'active' ? (
              <TouchableOpacity style={styles.finishPill} onPress={confirmFinish} activeOpacity={0.85}>
                <Text style={styles.finishPillText}>{copy.routine.timerFinish}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.centerSection}>
            {phase === 'intro' ? (
              <Animated.View entering={FadeIn.duration(500)} style={styles.introBlock}>
                <Text style={styles.introLead}>{copy.routine.introLead}</Text>
                <Text style={styles.introDetail}>{introDetail}</Text>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn.duration(420)} style={styles.timerStack}>
                <View style={styles.routineStatus}>
                  <Text style={styles.routineStatusMeta}>{modeLabel}</Text>
                  <Text style={styles.routineStatusTitle}>{routineName}</Text>
                  <Text style={styles.routineStatusAudio} numberOfLines={1}>{audioSummary}</Text>
                </View>
                <Text style={styles.timerText}>{timeStr}</Text>
                {isPaused ? (
                  <Animated.Text entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.pausedLabel}>
                    {copy.routine.timerPaused}
                  </Animated.Text>
                ) : null}
              </Animated.View>
            )}
          </View>

          {phase === 'intro' ? (
            <View style={styles.introFooter}>
              <Text style={styles.introHint}>{copy.routine.introHint}</Text>
            </View>
          ) : (
            <Animated.View style={[styles.controlsArea, controlsStyle]}>
              {showControls ? (
                <>
                  <View style={styles.playRow}>
                    <TouchableOpacity style={styles.playButton} onPress={togglePause} activeOpacity={0.85}>
                      <FontAwesome name={isPaused ? 'play' : 'pause'} size={28} color={V2_ACCENT} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.soundButton} onPress={() => setShowSoundModal(true)} activeOpacity={0.85}>
                      <FontAwesome name="volume-up" size={22} color={V2_TEXT_PRIMARY} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.progressSection}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, progressPercent * 100)}%` as `${number}%`,
                            backgroundColor: recommendation.colorHex,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.progressThumb,
                          {
                            left: `${Math.min(100, progressPercent * 100)}%` as `${number}%`,
                            backgroundColor: recommendation.colorHex,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressTime}>{elapsedStr}</Text>
                      <Text style={styles.progressTime}>{totalStr}</Text>
                    </View>
                  </View>
                </>
              ) : null}
            </Animated.View>
          )}
        </SafeAreaView>
      </Pressable>
      <AnimatedModalShell
        visible={showFinishConfirmModal}
        onClose={() => setShowFinishConfirmModal(false)}
        align="center"
        layoutStyle={styles.finishModalOverlay}
        backdropStyle={styles.finishBackdrop}
        containerStyle={styles.finishModalContainer}
      >
        {(requestClose) => (
          <View style={styles.finishCard}>
            <View style={styles.finishIconBadge}>
              <FontAwesome name="exclamation-triangle" size={18} color={V2_DANGER} />
            </View>
            <Text style={styles.finishModalEyebrow}>타이머</Text>
            <Text style={styles.finishModalTitle}>{copy.alerts.finishRoutineTitle}</Text>
            <Text style={styles.finishModalBody}>{copy.alerts.finishRoutineBody}</Text>
            <View style={styles.finishSummaryCard}>
              <Text style={styles.finishSummaryRoutine} numberOfLines={1}>{routineName}</Text>
              <Text style={styles.finishSummaryTime}>{elapsedStr}</Text>
            </View>
            <View style={styles.finishButtonStack}>
              <Pressable style={ui.primaryButtonV2} onPress={requestClose}>
                <Text style={ui.primaryButtonTextV2}>{copy.alerts.cancel}</Text>
              </Pressable>
              <Pressable
                style={[ui.secondaryButtonV2, styles.finishDestructiveButton]}
                onPress={() => {
                  setShowFinishConfirmModal(false);
                  void handleComplete();
                }}
              >
                <Text style={[ui.secondaryButtonTextV2, styles.finishDestructiveText]}>{copy.alerts.finish}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </AnimatedModalShell>
      <AnimatedModalShell
        visible={showSoundModal}
        onClose={() => setShowSoundModal(false)}
        layoutStyle={styles.soundModalOverlay}
        backdropStyle={styles.soundBackdrop}
        containerStyle={styles.soundModalContainer}
      >
        {(requestClose) => (
          <View style={styles.soundSheet}>
            <View style={styles.soundHandle} />
            <Text style={styles.soundEyebrow}>사운드</Text>
            <Text style={styles.soundTitle}>배경 소리 조절</Text>
            <Text style={styles.soundDescription}>{audioSummary}</Text>
            <AudioMixer
              music={recommendation.music}
              ambience={recommendation.ambience}
              accentColor={recommendation.colorHex}
              onMusicVolumeChange={setMusicVolume}
              onAmbienceVolumeChange={setAmbienceVolume}
            />
            <Pressable style={styles.soundCloseButton} onPress={requestClose}>
              <Text style={styles.soundCloseText}>닫기</Text>
            </Pressable>
          </View>
        )}
      </AnimatedModalShell>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: V2_BG_BASE },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  colorAuraTop: {
    position: 'absolute',
    top: -110,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 999,
    opacity: 0.72,
  },
  colorAuraBottom: {
    position: 'absolute',
    right: -90,
    bottom: 80,
    width: 310,
    height: 310,
    borderRadius: 999,
    opacity: 0.84,
  },
  timerFillMask: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  timerFillLayer: {
    width: '100%',
  },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: V2_BG_OVERLAY },
  centered: { justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 4, minHeight: 68 },
  routineStatus: { alignItems: 'center', gap: 4, marginBottom: 14, maxWidth: '92%' },
  routineStatusMeta: { fontSize: TYPE_CAPTION - 1, color: V2_ACCENT, fontWeight: '700', letterSpacing: 0, fontFamily: luxuryFonts.sans },
  routineStatusTitle: { fontSize: TYPE_BODY + 3, color: V2_TEXT_PRIMARY, textAlign: 'center', fontFamily: luxuryFonts.display },
  routineStatusAudio: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, textAlign: 'center', fontFamily: luxuryFonts.sans },
  finishPill: { paddingHorizontal: 2, paddingVertical: 8 },
  finishPillText: { fontSize: 13, fontWeight: '700', color: V2_TEXT_SECONDARY, fontFamily: luxuryFonts.sans },
  centerSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  introBlock: { alignItems: 'center', maxWidth: 320 },
  introLead: { fontSize: 24, lineHeight: 34, color: V2_TEXT_PRIMARY, textAlign: 'center', fontFamily: luxuryFonts.display, marginBottom: 14 },
  introDetail: { fontSize: TYPE_BODY + 2, lineHeight: 26, color: V2_TEXT_SECONDARY, textAlign: 'center', fontFamily: luxuryFonts.sans, letterSpacing: luxuryTracking.label },
  introFooter: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 10 },
  introHint: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontFamily: luxuryFonts.sans, letterSpacing: luxuryTracking.label },
  timerStack: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  timerText: {
    fontSize: 84,
    lineHeight: 98,
    fontWeight: '400',
    color: V2_TEXT_PRIMARY,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
    fontFamily: luxuryFonts.display,
  },
  pausedLabel: { fontSize: 13, color: V2_TEXT_SECONDARY, marginTop: 10, letterSpacing: 0, fontWeight: '700', fontFamily: luxuryFonts.sans },
  controlsArea: { paddingHorizontal: 24, paddingBottom: 8 },
  playRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 26 },
  playButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: V2_TEXT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(238, 243, 255, 0.18)',
      },
      default: {
        shadowColor: V2_TEXT_PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  soundButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 232, 0.16)',
    backgroundColor: 'rgba(245, 240, 232, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: { marginBottom: 18 },
  progressTrack: { height: 3, backgroundColor: 'rgba(245, 240, 232, 0.18)', borderRadius: 999, position: 'relative', marginBottom: 10 },
  progressFill: { position: 'absolute', left: 0, top: 0, height: 3, borderRadius: 999 },
  progressThumb: { position: 'absolute', top: -5, width: 14, height: 14, borderRadius: 7, marginLeft: -7 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTime: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontVariant: ['tabular-nums'], fontWeight: '600', fontFamily: luxuryFonts.sans },
  finishModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  finishBackdrop: {
    backgroundColor: 'rgba(4, 8, 13, 0.76)',
  },
  finishModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  finishCard: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(194, 134, 118, 0.26)',
    backgroundColor: V2_MODAL_SURFACE_ELEVATED,
    gap: 10,
  },
  finishIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194, 134, 118, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(194, 134, 118, 0.2)',
    marginBottom: 2,
  },
  finishModalEyebrow: {
    fontSize: TYPE_CAPTION - 1,
    color: V2_ACCENT,
    fontWeight: '700',
    letterSpacing: 0,
    fontFamily: luxuryFonts.sans,
  },
  finishModalTitle: {
    fontSize: 24,
    lineHeight: 32,
    color: V2_TEXT_PRIMARY,
    textAlign: 'center',
    fontFamily: luxuryFonts.display,
  },
  finishModalBody: {
    fontSize: TYPE_BODY,
    lineHeight: 21,
    color: V2_TEXT_SECONDARY,
    textAlign: 'center',
    fontFamily: luxuryFonts.sans,
    marginBottom: 4,
  },
  finishSummaryCard: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: V2_ACCENT_SOFT,
    gap: 4,
  },
  finishSummaryRoutine: {
    fontSize: TYPE_CAPTION,
    color: V2_TEXT_MUTED,
    textAlign: 'center',
    fontFamily: luxuryFonts.sans,
  },
  finishSummaryTime: {
    fontSize: 28,
    lineHeight: 34,
    color: V2_TEXT_PRIMARY,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    fontFamily: luxuryFonts.display,
  },
  finishButtonStack: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  finishDestructiveButton: {
    backgroundColor: 'rgba(194, 134, 118, 0.08)',
    borderColor: 'rgba(194, 134, 118, 0.26)',
  },
  finishDestructiveText: {
    color: V2_DANGER,
  },
  soundModalOverlay: { flex: 1, justifyContent: 'flex-end', paddingTop: 36 },
  soundBackdrop: { backgroundColor: 'rgba(4, 8, 13, 0.68)' },
  soundModalContainer: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  soundSheet: {
    width: '100%',
    backgroundColor: V2_MODAL_SURFACE_ELEVATED,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 26,
    gap: 10,
  },
  soundHandle: { alignSelf: 'center', width: 44, height: 4, borderRadius: 999, backgroundColor: V2_MODAL_HANDLE, marginBottom: 6 },
  soundEyebrow: { fontSize: TYPE_CAPTION - 1, color: V2_ACCENT, fontWeight: '700', letterSpacing: 0, fontFamily: luxuryFonts.sans },
  soundTitle: { fontSize: 22, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  soundDescription: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontFamily: luxuryFonts.sans, marginBottom: 4 },
  soundCloseButton: { alignItems: 'center', paddingVertical: 8 },
  soundCloseText: { color: V2_TEXT_SECONDARY, fontSize: TYPE_BODY, fontWeight: '700', fontFamily: luxuryFonts.sans },
});
