import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AccountControls } from '@/src/components/web/WebShell';
import { useAuth } from '@/src/auth/AuthProvider';

const mockPush = jest.fn();
const mockUsePathname = jest.fn(() => '/explore');

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/src/components/BrandMark', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    BrandMark: () => React.createElement(Text, null, 'BrandMark'),
  };
});

jest.mock('@/src/components/web/phosphorIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = ({ children }: { children?: React.ReactNode }) => React.createElement(Text, null, children ?? 'icon');
  return {
    BookmarkSimple: Icon,
    Compass: Icon,
    House: Icon,
    List: Icon,
    MagnifyingGlass: Icon,
    PlayCircle: Icon,
    PlusSquare: Icon,
    User: Icon,
  };
});

jest.mock('@/src/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;

describe('AccountControls', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUsePathname.mockReturnValue('/explore');
    mockedUseAuth.mockReset();
  });

  it('routes anonymous users to login', () => {
    mockedUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });

    const { getByText } = render(<AccountControls />);
    fireEvent.press(getByText('로그인'));

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('uses the fallback profile icon when no profile image exists', () => {
    mockedUseAuth.mockReturnValue({
      user: { nickname: '바스타임러', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      logout: jest.fn(),
    });

    const { getByTestId, queryByTestId } = render(<AccountControls />);

    expect(getByTestId('account-profile-fallback')).toBeTruthy();
    expect(queryByTestId('account-profile-image')).toBeNull();
  });

  it('opens a profile menu and logs out', () => {
    const logout = jest.fn();
    mockedUseAuth.mockReturnValue({
      user: { nickname: '바스타임러', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      logout,
    });

    const { getByTestId, getByText } = render(<AccountControls />);
    fireEvent.press(getByTestId('account-profile-button'));

    expect(getByTestId('account-profile-menu')).toBeTruthy();
    expect(getByText('user@example.com')).toBeTruthy();

    fireEvent.press(getByText('로그아웃'));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
