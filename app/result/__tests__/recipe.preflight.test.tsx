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
    mockReplace.mockReset();
    mockPush.mockReset();
    mockBack.mockReset();
    mockUseLocalSearchParams.mockReturnValue({ id: 'rec_1' });
    mockGetRecommendationById.mockResolvedValue(baseRecommendation);
  });

  test('blocks timer start until every checklist item is checked', async () => {
    const screen = render(React.createElement(RecipeScreen));

    await waitFor(() =>
      expect(screen.getByText('시작 전에 확인할 항목')).toBeTruthy()
    );

    const confirmButton = screen.getByTestId('prebath-confirm-button');
    expect(confirmButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByTestId('prebath-item-temperature-duration'));
    fireEvent.press(screen.getByTestId('prebath-item-environment-ready'));
    expect(screen.getByTestId('prebath-confirm-button').props.accessibilityState.disabled).toBe(
      true
    );

    fireEvent.press(screen.getByTestId('prebath-item-hydration-ready'));
    expect(screen.getByTestId('prebath-confirm-button').props.accessibilityState.disabled).toBe(
      false
    );

    fireEvent.press(screen.getByTestId('prebath-confirm-button'));
    expect(mockReplace).toHaveBeenCalledWith('/result/timer/rec_1');
  });

  test('shows replay context for history routes without a second restart alert', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'rec_1', source: 'history' } as any);

    const screen = render(React.createElement(RecipeScreen));

    await waitFor(() =>
      expect(screen.getByText('이전에 저장한 루틴입니다. 오늘 컨디션과 환경에도 무리 없는지 확인한 뒤 다시 시작해주세요.')).toBeTruthy()
    );

    expect(screen.getByText('다시 시작하기')).toBeTruthy();
    expect(screen.getByTestId('prebath-item-history-replay')).toBeTruthy();
  });
});
