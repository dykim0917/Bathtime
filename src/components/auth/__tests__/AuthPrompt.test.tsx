import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AuthPrompt } from '@/src/components/auth/AuthPrompt';
import { useAuth } from '@/src/auth/AuthProvider';

jest.mock('@/src/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;

describe('AuthPrompt', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      isConfigured: true,
      loginWithProvider: jest.fn(),
    });
  });

  it('shows Google login only', () => {
    const { queryByText, getByText } = render(<AuthPrompt source="saved" nextPath="/saved" />);

    expect(getByText('Google로 계속하기')).toBeTruthy();
    expect(queryByText('카카오로 계속하기')).toBeNull();
  });

  it('starts Google OAuth with the provided next path', () => {
    const loginWithProvider = jest.fn();
    mockedUseAuth.mockReturnValue({
      isConfigured: true,
      loginWithProvider,
    });

    const { getByText } = render(<AuthPrompt source="save" nextPath="/content/content-a" />);
    fireEvent.press(getByText('Google로 계속하기'));

    expect(loginWithProvider).toHaveBeenCalledWith('google', '/content/content-a');
  });
});
