import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NativeScreen } from '@/src/components/native/NativeScreen';

const mockBack = jest.fn();
const mockCanGoBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    canGoBack: (...args: unknown[]) => mockCanGoBack(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons/FontAwesome', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockFontAwesome({ name }: { name: string }) {
    return <Text>{name}</Text>;
  };
});

describe('NativeScreen', () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockCanGoBack.mockReset();
    mockReplace.mockReset();
  });

  it('does not render a back button without backHref', () => {
    const { queryByLabelText } = render(<NativeScreen title="탐색">content</NativeScreen>);

    expect(queryByLabelText('뒤로가기')).toBeNull();
  });

  it('goes back when navigation history exists', () => {
    mockCanGoBack.mockReturnValue(true);
    const { getByLabelText } = render(
      <NativeScreen title="콘텐츠" backHref="/(tabs)/explore">
        content
      </NativeScreen>
    );

    fireEvent.press(getByLabelText('뒤로가기'));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('replaces to the fallback href when navigation history is empty', () => {
    mockCanGoBack.mockReturnValue(false);
    const { getByLabelText } = render(
      <NativeScreen title="콘텐츠" backHref="/(tabs)/explore">
        content
      </NativeScreen>
    );

    fireEvent.press(getByLabelText('뒤로가기'));

    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/explore');
  });
});
