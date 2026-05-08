import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { RoutinePresetCard } from '@/src/components/web/RoutinePresetCard';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { routinePresets } from '@/src/archive/seed';
import { RoutinePreset } from '@/src/archive/types';
import { trackArchiveEvent } from '@/src/analytics/events';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';

function formatRemaining(seconds: number): string {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export default function RoutinesPage() {
  const [activeRoutine, setActiveRoutine] = useState<RoutinePreset | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = useMemo(() => (activeRoutine?.durationMinutes ?? 0) * 60, [activeRoutine]);

  useEffect(() => {
    if (!activeRoutine || completed) return;
    timerRef.current = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCompleted(true);
          trackArchiveEvent('routine_completed', { routineId: activeRoutine.id, platform: 'web' });
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeRoutine, completed]);

  const handleStart = (routine: RoutinePreset) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveRoutine(routine);
    setRemainingSeconds(routine.durationMinutes * 60);
    setCompleted(false);
    trackArchiveEvent('routine_started', { routineId: routine.id, source: 'routines', platform: 'web' });
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveRoutine(null);
    setRemainingSeconds(0);
    setCompleted(false);
  };

  return (
    <WebShell>
      <SeoMetadata title={`${copy.archive.nav.routines} - 바스타임`} description="샤워, 족욕, 입욕 의식을 바로 실행합니다." />
      <ArchivePageContainer variant="narrow">
      <View style={webStyles.pageStack}>
        <View style={webStyles.header}>
          <Text style={webStyles.eyebrow}>{copy.archive.nav.routines}</Text>
          <Text style={webStyles.title}>콘텐츠를 행동으로 옮기는 짧은 의식</Text>
          <Text style={webStyles.lede}>P0에서는 프리셋 중심으로 실행합니다. 타이머는 의식 안에 포함된 도구입니다.</Text>
        </View>

        {activeRoutine ? (
          <View style={styles.timerPanel}>
            <Text style={styles.timerLabel}>{activeRoutine.title}</Text>
            <Text style={styles.timerText}>{completed ? '완료' : formatRemaining(remainingSeconds)}</Text>
            <Text style={styles.timerMeta}>{activeRoutine.steps[Math.min(activeRoutine.steps.length - 1, Math.floor((totalSeconds - remainingSeconds) / Math.max(1, totalSeconds / activeRoutine.steps.length)))]}</Text>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>{completed ? copy.archive.actions.backToRituals : copy.archive.actions.stop}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.cardList}>
          {routinePresets.filter((routine) => routine.isPublished).map((routine) => (
            <RoutinePresetCard key={routine.id} routine={routine} onStart={() => handleStart(routine)} />
          ))}
        </View>
      </View>
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  timerPanel: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.xl,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  timerLabel: {
    color: archiveColors.primary,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  timerText: {
    color: archiveColors.ink,
    fontSize: 58,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  timerMeta: {
    color: archiveColors.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  resetButton: {
    minHeight: 44,
    borderRadius: archiveRadius.md,
    paddingHorizontal: 18,
    backgroundColor: archiveColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: archiveColors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  cardList: {
    gap: 14,
  },
});
