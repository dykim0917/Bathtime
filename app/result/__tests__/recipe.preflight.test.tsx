import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RecipeScreen from '../recipe/[id]';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockUseLocalSearchParams = jest.fn(() => ({ id: 'rec_1' }));
const mockGetRecommendationById = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
    push: (...args: unknown[]) => mockPush(...args),
    back: (...args: unknown[]) => mockBack(...args),
  },
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
  };
});

jest.mock('@expo/vector-icons/FontAwesome', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ name }: { name: string }) => React.createElement(Text, null, name);
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { ScrollView, View } = require('react-native');
  return {
    __esModule: true,
    default: {
      ScrollView,
      View,
    },
    FadeIn: { duration: () => ({}) },
    FadeInDown: { duration: () => ({ delay: () => ({}) }) },
  };
});

jest.mock('@/src/storage/history', () => ({
  getRecommendationById: (...args: unknown[]) => mockGetRecommendationById(...args),
}));

jest.mock('@/src/components/ProductMatchingModal', () => ({
  ProductMatchingModal: () => null,
}));

jest.mock('@/src/components/ProductDetailModal', () => ({
  ProductDetailModal: () => null,
}));

jest.mock('@/src/engine/productMatching', () => ({
  buildProductMatchingSlots: () => [],
}));

jest.mock('@/src/data/catalogRuntime', () => ({
  useCatalogHydration: () => undefined,
}));

jest.mock('@/src/data/tripImages', () => ({
  getTripCardImage: () => null,
}));

jest.mock('@/src/engine/explainability', () => ({
  buildRecipeEvidenceLines: () => ({
    reasonLines: ['긴장을 낮추는 루틴이에요.', '39°C · 12분으로 진행해요.'],
    safetyLine: '권장 수온과 시간을 지키고, 불편하면 바로 중단하세요.',
  }),
}));

jest.mock('@/src/components/AnimatedModalShell', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    AnimatedModalShell: ({
      visible,
      children,
    }: {
      visible: boolean;
      children: React.ReactNode | ((requestClose: () => void) => React.ReactNode);
    }) => {
      if (!visible) return null;
      const content =
        typeof children === 'function' ? children(() => undefined) : children;
      return React.createElement(View, null, content);
    },
  };
});

const baseRecommendation = {
  id: 'rec_1',
  mode: 'care' as const,
  intentId: 'stress_relief',
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

describe('RecipeScreen pre-bath gate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-20T20:00:00+09:00'));
    mockReplace.mockReset();
    mockPush.mockReset();
    mockBack.mockReset();
    mockUseLocalSearchParams.mockReturnValue({ id: 'rec_1' });
    mockGetRecommendationById.mockResolvedValue(baseRecommendation);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('starts immediately for a standard routine without opening the gate', async () => {
    const screen = render(React.createElement(RecipeScreen));

    await waitFor(() => expect(screen.getByText('목욕 시작하기')).toBeTruthy());

    fireEvent.press(screen.getByText('목욕 시작하기'));
    expect(mockReplace).toHaveBeenCalledWith('/result/timer/rec_1');
  });

  test('shows a calculated sleep timing card for sleep preparation routines', async () => {
    mockGetRecommendationById.mockResolvedValue({
      ...baseRecommendation,
      intentId: 'sleep_ready',
    });

    const screen = render(React.createElement(RecipeScreen));

    await waitFor(() =>
      expect(screen.getByText('잠들기 90분 전까지 끝내는 편이 좋아요')).toBeTruthy()
    );

    expect(
      screen.getByText('오후 9:18쯤 시작해 오후 9:30 전에 마치는 흐름을 추천해요.')
    ).toBeTruthy();
    expect(screen.getByText('기본 취침 시각 23:00 기준')).toBeTruthy();
  });

  test('blocks timer start until every risky checklist item is checked', async () => {
    mockGetRecommendationById.mockResolvedValue({
      ...baseRecommendation,
      safetyWarnings: ['음주 후 입욕은 위험합니다. 미온수 족욕만 가능합니다.'],
    });

    const screen = render(React.createElement(RecipeScreen));

    await waitFor(() =>
      expect(screen.getByText('목욕 시작하기')).toBeTruthy()
    );

    expect(screen.queryByText('시작 전 꼭 확인하세요')).toBeNull();

    fireEvent.press(screen.getByText('목욕 시작하기'));

    await waitFor(() =>
      expect(screen.getByText('시작 전 꼭 확인하세요')).toBeTruthy()
    );

    const confirmButton = screen.getByTestId('prebath-confirm-button');
    expect(confirmButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByTestId('prebath-item-warning-0'));
    expect(screen.getByTestId('prebath-confirm-button').props.accessibilityState.disabled).toBe(
      true
    );

    fireEvent.press(screen.getByTestId('prebath-item-warning-1'));
    expect(screen.getByTestId('prebath-confirm-button').props.accessibilityState.disabled).toBe(
      false
    );

    fireEvent.press(screen.getByTestId('prebath-confirm-button'));
    expect(mockReplace).toHaveBeenCalledWith('/result/timer/rec_1');
  });

  test('shows replay context for risky history routes without a second restart alert', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'rec_1', source: 'history' } as any);
    mockGetRecommendationById.mockResolvedValue({
      ...baseRecommendation,
      safetyWarnings: ['고혈압/심장 질환이 있으시므로 수온이 38°C로 제한됩니다.'],
    });

    const screen = render(React.createElement(RecipeScreen));

    await waitFor(() =>
      expect(screen.getByText('다시 시작하기')).toBeTruthy()
    );

    expect(
      screen.queryByText(
        '이전에 저장한 루틴입니다. 오늘도 같은 제약을 지킬 수 있는지 확인한 뒤 다시 시작해주세요.'
      )
    ).toBeNull();

    fireEvent.press(screen.getByText('다시 시작하기'));

    await waitFor(() =>
      expect(screen.getByText('이전에 저장한 루틴입니다. 오늘도 같은 제약을 지킬 수 있는지 확인한 뒤 다시 시작해주세요.')).toBeTruthy()
    );

    expect(screen.getAllByText('다시 시작하기').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('prebath-item-history-replay')).toBeTruthy();
  });
});
