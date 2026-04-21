import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import CompletionScreen from '../completion/[id]';

const mockReplace = jest.fn();
const mockGetRecommendationById = jest.fn();
const mockGetMonthlyCount = jest.fn();
const mockUpdateRecommendationFeedback = jest.fn();
const mockLoadSession = jest.fn();
const mockClearSession = jest.fn();
const mockPatchSessionRecord = jest.fn();
const mockSaveCompletionMemory = jest.fn();
const mockApplyFeedbackToThemePreference = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
  },
  useLocalSearchParams: () => ({ id: 'rec_1' }),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
    },
    FadeIn: { duration: () => ({ delay: () => ({}) }) },
    BounceIn: { duration: () => ({}) },
  };
});

jest.mock('@/src/storage/history', () => ({
  getRecommendationById: (...args: unknown[]) => mockGetRecommendationById(...args),
  getMonthlyCount: (...args: unknown[]) => mockGetMonthlyCount(...args),
  updateRecommendationFeedback: (...args: unknown[]) => mockUpdateRecommendationFeedback(...args),
}));

jest.mock('@/src/storage/session', () => ({
  loadSession: (...args: unknown[]) => mockLoadSession(...args),
  clearSession: (...args: unknown[]) => mockClearSession(...args),
}));

jest.mock('@/src/storage/sessionLog', () => ({
  patchSessionRecord: (...args: unknown[]) => mockPatchSessionRecord(...args),
}));

jest.mock('@/src/storage/memory', () => ({
  saveCompletionMemory: (...args: unknown[]) => mockSaveCompletionMemory(...args),
  applyFeedbackToThemePreference: (...args: unknown[]) =>
    mockApplyFeedbackToThemePreference(...args),
}));

jest.mock('@/src/engine/feeling', () => ({
  mapFeedbackToFeelingAfter: () => 4,
}));

jest.mock('@/src/utils/messages', () => ({
  getTimeBasedMessage: () => '오늘도 잘 마무리했어요',
}));

const recommendation = {
  id: 'rec_1',
  mode: 'care' as const,
  intentId: 'sleep_ready',
  persona: 'P4_SLEEP' as const,
  environmentUsed: 'bathtub' as const,
  bathType: 'full' as const,
  temperature: { min: 38, max: 40, recommended: 39 },
  durationMinutes: 12,
  ingredients: [],
  music: {
    id: 'music_1',
    title: 'm',
    filename: 'm.mp3',
    durationSeconds: 60,
    persona: ['P4_SLEEP' as const],
  },
  ambience: {
    id: 'ambience_1',
    title: 'a',
    filename: 'a.mp3',
    durationSeconds: 60,
    persona: ['P4_SLEEP' as const],
  },
  lighting: 'soft',
  safetyWarnings: [],
  environmentHints: [],
  colorHex: '#123456',
  createdAt: '2026-04-20T00:00:00.000Z',
};

describe('CompletionScreen', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockGetRecommendationById.mockResolvedValue(recommendation);
    mockGetMonthlyCount.mockResolvedValue(3);
    mockUpdateRecommendationFeedback.mockResolvedValue(undefined);
    mockLoadSession.mockResolvedValue(null);
    mockClearSession.mockResolvedValue(undefined);
    mockPatchSessionRecord.mockResolvedValue(undefined);
    mockApplyFeedbackToThemePreference.mockResolvedValue(0);
    mockSaveCompletionMemory.mockResolvedValue({
      themeId: null,
      themePreferenceWeight: 0,
      narrativeRecallCard: '몸이 한결 가벼워졌어요.',
      completionSnapshot: {
        recommendationId: 'rec_1',
        completedAt: '2026-04-20T12:10:00.000Z',
        mode: 'care',
        environment: 'bathtub',
        temperatureRecommended: 39,
        durationMinutes: 12,
      },
    });
  });

  test('moves from feedback step to summary step after rating the routine', async () => {
    const screen = render(React.createElement(CompletionScreen));

    await waitFor(() =>
      expect(screen.getByText('오늘 루틴은 어떠셨나요?')).toBeTruthy()
    );

    expect(screen.queryByText('지금 바로 이 세 가지만 챙겨주세요')).toBeNull();

    fireEvent.press(screen.getByText('좋아요'));

    await waitFor(() =>
      expect(screen.getByText('이번 루틴을 이렇게 정리했어요')).toBeTruthy()
    );

    expect(mockUpdateRecommendationFeedback).toHaveBeenCalledWith('rec_1', 'good');
    expect(screen.getByText('• 물 한 잔으로 수분을 먼저 보충하세요.')).toBeTruthy();
    expect(screen.getByText('• 물기가 완전히 마르기 전에 보습제를 가볍게 발라주세요.')).toBeTruthy();
    expect(screen.getByText('• 어지럽거나 심장이 빨리 뛰면 바로 앉아서 쉬세요.')).toBeTruthy();
  });

  test('opens directly on summary step when feedback already exists', async () => {
    mockGetRecommendationById.mockResolvedValue({
      ...recommendation,
      feedback: 'bad',
    });

    const screen = render(React.createElement(CompletionScreen));

    await waitFor(() =>
      expect(screen.getByText('이번 루틴을 이렇게 정리했어요')).toBeTruthy()
    );

    expect(screen.queryByText('오늘 루틴은 어떠셨나요?')).toBeNull();
  });
});
