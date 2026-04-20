import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { BathRecommendation } from '@/src/engine/types';
import { getRecommendationById } from '@/src/storage/history';
import { saveSession, updateSessionCompletion } from '@/src/storage/session';
import { WaterAnimation } from '@/src/components/WaterAnimation';
import { SteamAnimation } from '@/src/components/SteamAnimation';
import { AudioMixer } from '@/src/components/AudioMixer';
import { useDualAudioPlayer } from '@/src/hooks/useDualAudioPlayer';
import { useHaptic } from '@/src/hooks/useHaptic';
import { copy } from '@/src/content/copy';
import { TYPE_BODY, TYPE_CAPTION, V2_ACCENT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_OVERLAY, V2_BG_TOP, V2_BORDER, V2_SURFACE, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { buildRoutineIntroDetail, getRoutineFillLevel, INTRO_DURATION_MS, RoutineTimerPhase } from '@/src/utils/routineTimer';

export default function TimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recommendation, setRecommendation] = useState<BathRecommendation | null>(null);
  const [phase, setPhase] = useState<RoutineTimerPhase>('intro');
  const [introRemainingMs, setIntroRemainingMs] = useState(INTRO_DURATION_MS);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
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
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(copy.alerts.finishRoutineBody);
      if (confirmed) void handleComplete();
      return;
    }

    Alert.alert(copy.alerts.finishRoutineTitle, copy.alerts.finishRoutineBody, [
      { text: copy.alerts.cancel, style: 'cancel' },
      { text: copy.alerts.finish, style: 'destructive', onPress: () => void handleComplete() },
    ]);
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
  const isShowerImmersive = recommendation.environmentUsed === 'shower' || recommendation.bathType === 'shower';
  const routineName = recommendation.mode === 'trip'
    ? (recommendation.themeTitle ?? '트립 테마')
    : '맞춤 루틴';
  const introDetail = buildRoutineIntroDetail(routineName);
  const fillLevel = getRoutineFillLevel({
    phase,
    introRemainingMs,
    remainingSeconds,
    totalSeconds,
  });
  return (
    <View style={styles.container}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.overlay} />
      {isShowerImmersive ? (
        <SteamAnimation colorHex={recommendation.colorHex} />
      ) : (
        <WaterAnimation fillLevel={fillLevel} colorHex={recommendation.colorHex} />
      )}

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
              <>
                <Text style={styles.recipeName}>{recommendation.mode === 'trip' ? (recommendation.themeTitle ?? '트립 테마') : copy.routine.stepRun}</Text>
                <Text style={styles.timerText}>{timeStr}</Text>
                {isPaused ? (
                  <Animated.Text entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.pausedLabel}>
                    {copy.routine.timerPaused}
                  </Animated.Text>
                ) : null}
              </>
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
                  </View>
                  <View style={[ui.glassCardV2, styles.progressSection]}>
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
                  <View style={styles.mixerContainer}>
                    <AudioMixer
                      music={recommendation.music}
                      ambience={recommendation.ambience}
                      accentColor={recommendation.colorHex}
                      onMusicVolumeChange={setMusicVolume}
                      onAmbienceVolumeChange={setAmbienceVolume}
                    />
                  </View>
                </>
              ) : null}
            </Animated.View>
          )}
        </SafeAreaView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: V2_BG_BASE },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: V2_BG_OVERLAY },
  centered: { justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, minHeight: 56 },
  finishPill: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: V2_SURFACE, borderWidth: 1, borderColor: V2_BORDER },
  finishPillText: { fontSize: 14, fontWeight: '700', color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.sans },
  centerSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  introBlock: { alignItems: 'center', maxWidth: 320 },
  introLead: { fontSize: 24, lineHeight: 34, color: V2_TEXT_PRIMARY, textAlign: 'center', fontFamily: luxuryFonts.display, marginBottom: 14 },
  introDetail: { fontSize: TYPE_BODY + 2, lineHeight: 26, color: V2_TEXT_SECONDARY, textAlign: 'center', fontFamily: luxuryFonts.sans, letterSpacing: luxuryTracking.label },
  introFooter: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 10 },
  introHint: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontFamily: luxuryFonts.sans, letterSpacing: luxuryTracking.label },
  recipeName: { fontSize: 24, color: V2_TEXT_PRIMARY, marginBottom: 18, textAlign: 'center', fontFamily: luxuryFonts.display },
  timerText: { fontSize: 72, fontWeight: '200', color: V2_TEXT_PRIMARY, letterSpacing: 4, fontVariant: ['tabular-nums'], fontFamily: luxuryFonts.mono },
  pausedLabel: { fontSize: 14, color: V2_TEXT_SECONDARY, marginTop: 10, letterSpacing: 2, fontFamily: luxuryFonts.sans },
  controlsArea: { paddingHorizontal: 24, paddingBottom: 8 },
  playRow: { alignItems: 'center', marginBottom: 28 },
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
  progressSection: { marginBottom: 20, padding: 14 },
  progressTrack: { height: 4, backgroundColor: V2_BORDER, borderRadius: 2, position: 'relative', marginBottom: 8 },
  progressFill: { position: 'absolute', left: 0, top: 0, height: 4, borderRadius: 2 },
  progressThumb: { position: 'absolute', top: -5, width: 14, height: 14, borderRadius: 7, marginLeft: -7 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTime: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontVariant: ['tabular-nums'], fontFamily: luxuryFonts.mono },
  mixerContainer: { marginBottom: 8 },
});
