import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useHaptic } from '@/src/hooks/useHaptic';
import { formatTimer } from '@/src/utils/time';
import { TYPE_SCALE, V2_BORDER, V2_SURFACE, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';

interface BathTimerProps {
  durationMinutes: number | null;
  accentColor: string;
  onComplete?: () => void;
}

export function BathTimer({
  durationMinutes,
  accentColor,
  onComplete,
}: BathTimerProps) {
  const totalSeconds = durationMinutes ? durationMinutes * 60 : 0;
  const isCountdown = durationMinutes !== null;

  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const haptic = useHaptic();

  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const tick = useCallback(() => {
    if (isCountdown) {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false);
          haptic.success();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    } else {
      setElapsedSeconds((prev) => prev + 1);
    }
  }, [isCountdown, haptic, onComplete]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  useEffect(() => {
    if (isCountdown && totalSeconds > 0) {
      const currentProgress = 1 - remainingSeconds / totalSeconds;
      progress.value = withTiming(currentProgress, {
        duration: 950,
        easing: Easing.linear,
      });
    }
  }, [remainingSeconds, totalSeconds, isCountdown, progress]);

  const handleStart = () => {
    haptic.light();
    if (isCountdown && remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
      progress.value = 0;
    }
    setRunning(true);
  };

  const handlePause = () => {
    haptic.light();
    setRunning(false);
  };

  const handleReset = () => {
    haptic.light();
    setRunning(false);
    setRemainingSeconds(totalSeconds);
    setElapsedSeconds(0);
    progress.value = withTiming(0, { duration: 300 });
  };

  const displayTime = isCountdown
    ? formatTimer(remainingSeconds)
    : formatTimer(elapsedSeconds);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {isCountdown ? '남은 시간' : '경과 시간'}
      </Text>
      <Text style={[styles.time, { color: accentColor }]}>{displayTime}</Text>

      {isCountdown && (
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { backgroundColor: accentColor },
              progressStyle,
            ]}
          />
        </View>
      )}

      <View style={styles.buttons}>
        {!running ? (
          <Pressable
            style={[styles.button, { backgroundColor: accentColor }]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>
              {isCountdown && remainingSeconds === 0 ? '다시 시작' : '시작'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.button, styles.pauseButton]}
            onPress={handlePause}
          >
            <Text style={styles.buttonText}>일시정지</Text>
          </Pressable>
        )}
        <Pressable style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={[styles.buttonText, { color: V2_TEXT_SECONDARY }]}>
            초기화
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  label: {
    fontSize: TYPE_SCALE.body,
    color: V2_TEXT_SECONDARY,
    marginBottom: 4,
  },
  time: {
    fontSize: 48,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginBottom: 16,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: V2_SURFACE,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  buttonText: {
    fontSize: TYPE_SCALE.body + 1,
    fontWeight: '600',
    color: V2_TEXT_PRIMARY,
  },
});
