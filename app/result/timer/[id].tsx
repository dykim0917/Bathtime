import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BathRecommendation } from '@/src/engine/types';
import { getRecommendationById } from '@/src/storage/history';
import { saveSession, updateSessionCompletion } from '@/src/storage/session';
import { WaterAnimation } from '@/src/components/WaterAnimation';
import { SteamAnimation } from '@/src/components/SteamAnimation';
import { AudioMixer } from '@/src/components/AudioMixer';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { buildDisclosureLines } from '@/src/engine/disclosures';
import { useDualAudioPlayer } from '@/src/hooks/useDualAudioPlayer';
import { copy } from '@/src/content/copy';
import { TYPE_CAPTION, V2_ACCENT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_OVERLAY, V2_BG_TOP, V2_BORDER, V2_SURFACE, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

export default function TimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recommendation, setRecommendation] = useState<BathRecommendation | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<string>(new Date().toISOString());
  const hasSessionStartedRef = useRef(false);
  const isCompletingRef = useRef(false);
  const targetEndAtMsRef = useRef<number | null>(null);
  const pausedAtMsRef = useRef<number | null>(null);
  const accumulatedPausedMsRef = useRef(0);
  const isPausedRef = useRef(false);

  const audio = useDualAudioPlayer(recommendation?.music ?? null, recommendation?.ambience ?? null);
  const { play: playAudio, pause: pauseAudio, stop: stopAudio, setMusicVolume, setAmbienceVolume } = audio;
  const controlsOpacity = useSharedValue(1);
  const controlsStyle = useAnimatedStyle(() => ({ opacity: controlsOpacity.value }));

  useEffect(() => {
    if (!id) return;
    hasSessionStartedRef.current = false; isCompletingRef.current = false; targetEndAtMsRef.current = null; pausedAtMsRef.current = null; accumulatedPausedMsRef.current = 0; isPausedRef.current = false;
    setIsPaused(false); setRemainingSeconds(0); setTotalSeconds(0);
    getRecommendationById(id).then((rec) => { if (rec) { setRecommendation(rec); const secs = (rec.durationMinutes ?? 15) * 60; setRemainingSeconds(secs); setTotalSeconds(secs); } });
  }, [id]);

  const clearTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);
  const computeRemainingSeconds = useCallback(() => {
    if (!targetEndAtMsRef.current) return remainingSeconds;
    const now = Date.now();
    const effectiveNow = isPausedRef.current && pausedAtMsRef.current ? pausedAtMsRef.current : now;
    const msLeft = targetEndAtMsRef.current - effectiveNow - accumulatedPausedMsRef.current;
    return Math.max(0, Math.ceil(msLeft / 1000));
  }, [remainingSeconds]);
  const handleComplete = useCallback(async (remainingAtComplete?: number) => {
    if (!id || isCompletingRef.current) return;
    isCompletingRef.current = true; clearTimer(); stopAudio();
    const completedAt = new Date().toISOString();
    const derivedRemaining = remainingAtComplete ?? computeRemainingSeconds();
    const actualDurationSeconds = Math.max(0, totalSeconds - derivedRemaining);
    await updateSessionCompletion(id, completedAt, actualDurationSeconds);
    router.replace(`/result/completion/${id}`);
  }, [id, clearTimer, stopAudio, totalSeconds, computeRemainingSeconds]);
  const startTicking = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      const nextRemaining = computeRemainingSeconds();
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); handleComplete(0); }
    }, 250);
  }, [clearTimer, computeRemainingSeconds, handleComplete]);

  useEffect(() => {
    if (!id || !recommendation || totalSeconds <= 0 || hasSessionStartedRef.current) return;
    const now = Date.now();
    targetEndAtMsRef.current = now + totalSeconds * 1000; accumulatedPausedMsRef.current = 0; pausedAtMsRef.current = null; isPausedRef.current = false; hasSessionStartedRef.current = true; startedAtRef.current = new Date(now).toISOString();
    setRemainingSeconds(totalSeconds); saveSession({ recommendationId: id, startedAt: startedAtRef.current }); playAudio(); startTicking();
  }, [id, recommendation, totalSeconds, playAudio, startTicking]);

  useEffect(() => () => { clearTimer(); stopAudio(); }, [clearTimer, stopAudio]);

  const toggleControls = () => { const newVal = !showControls; setShowControls(newVal); controlsOpacity.value = withTiming(newVal ? 1 : 0, { duration: 300 }); };
  const togglePause = () => {
    if (isPausedRef.current) {
      const now = Date.now(); if (pausedAtMsRef.current) accumulatedPausedMsRef.current += now - pausedAtMsRef.current;
      pausedAtMsRef.current = null; isPausedRef.current = false; setIsPaused(false); playAudio(); startTicking();
    } else {
      pausedAtMsRef.current = Date.now(); isPausedRef.current = true; setIsPaused(true); setRemainingSeconds(computeRemainingSeconds()); clearTimer(); pauseAudio();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const confirmFinish = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(copy.alerts.finishRoutineBody);
      if (confirmed) handleComplete();
      return;
    }
    Alert.alert(copy.alerts.finishRoutineTitle, copy.alerts.finishRoutineBody, [{ text: copy.alerts.cancel, style: 'cancel' }, { text: copy.alerts.finish, style: 'destructive', onPress: () => handleComplete() }]);
  };

  if (!recommendation) return <View style={[ui.screenShellV2, styles.centered]}><Text style={{ color: V2_TEXT_SECONDARY }}>{copy.completion.loading}</Text></View>;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const elapsedStr = (() => { const elapsed = totalSeconds - remainingSeconds; const m = Math.floor(elapsed / 60); const s = elapsed % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; })();
  const totalStr = (() => { const m = Math.floor(totalSeconds / 60); const s = totalSeconds % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; })();
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  const isShowerImmersive = recommendation.environmentUsed === 'shower' || recommendation.bathType === 'shower';
  const timerDisclosureLines = buildDisclosureLines({
    fallbackStrategy: 'none',
    selectedMode: recommendation.mode === 'trip' ? 'recovery' : recommendation.persona === 'P4_SLEEP' ? 'sleep' : 'recovery',
    healthConditions: [],
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.overlay} />
      {isShowerImmersive ? <SteamAnimation colorHex={recommendation.colorHex} /> : <WaterAnimation progress={progress} colorHex={recommendation.colorHex} />}

      <Pressable style={StyleSheet.absoluteFill} onPress={toggleControls}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.finishPill} onPress={confirmFinish} activeOpacity={0.85}><Text style={styles.finishPillText}>{copy.routine.timerFinish}</Text></TouchableOpacity>
          </View>

          <View style={styles.centerSection}>
            <Text style={styles.recipeName}>{recommendation.mode === 'trip' ? (recommendation.themeTitle ?? '트립 테마') : copy.routine.stepRun}</Text>
            <Text style={styles.timerText}>{timeStr}</Text>
            {isPaused && <Animated.Text entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.pausedLabel}>{copy.routine.timerPaused}</Animated.Text>}
          </View>

          <Animated.View style={[styles.controlsArea, controlsStyle]}>
            {showControls && (
              <>
                <View style={styles.playRow}><TouchableOpacity style={styles.playButton} onPress={togglePause} activeOpacity={0.85}><FontAwesome name={isPaused ? 'play' : 'pause'} size={28} color={V2_ACCENT} /></TouchableOpacity></View>
                <View style={[ui.glassCardV2, styles.progressSection]}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, progress * 100)}%` as `${number}%`, backgroundColor: recommendation.colorHex }]} />
                    <View style={[styles.progressThumb, { left: `${Math.min(100, progress * 100)}%` as `${number}%`, backgroundColor: recommendation.colorHex }]} />
                  </View>
                  <View style={styles.progressLabels}><Text style={styles.progressTime}>{elapsedStr}</Text><Text style={styles.progressTime}>{totalStr}</Text></View>
                </View>
                <View style={styles.mixerContainer}><AudioMixer music={recommendation.music} ambience={recommendation.ambience} accentColor={recommendation.colorHex} onMusicVolumeChange={setMusicVolume} onAmbienceVolumeChange={setAmbienceVolume} /></View>
              </>
            )}
          </Animated.View>

          <View style={styles.disclosureWrap}><PersistentDisclosure lines={timerDisclosureLines} variant="v2" /></View>
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  finishPill: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: V2_SURFACE, borderWidth: 1, borderColor: V2_BORDER },
  finishPillText: { fontSize: 14, fontWeight: '700', color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.sans },
  centerSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
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
  disclosureWrap: { paddingHorizontal: 14, paddingBottom: 8 },
});
