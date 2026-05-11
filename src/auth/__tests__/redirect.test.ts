import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { buildRedirectTo } from '@/src/auth/AuthProvider';

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path: string, options?: { scheme?: string; queryParams?: Record<string, string> }) => {
    const params = new URLSearchParams(options?.queryParams).toString();
    return `${options?.scheme ?? 'getbathtime'}://${path}${params ? `?${params}` : ''}`;
  }),
  parse: jest.fn(() => ({ queryParams: {} })),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('OAuth redirect URL', () => {
  const originalOS = Platform.OS;
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    Object.defineProperty(global, 'window', { configurable: true, value: originalWindow });
    jest.restoreAllMocks();
  });

  it('uses the native app callback URL for mobile OAuth', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });

    expect(buildRedirectTo('/(tabs)/explore')).toBe('getbathtime://auth/callback');
    expect(Linking.createURL).toHaveBeenCalledWith('auth/callback', {
      scheme: 'getbathtime',
    });
  });

  it('uses the callback path on the production apex domain when opened on www', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    Object.defineProperty(global, 'window', {
      configurable: true,
      value: { location: { origin: 'https://www.getbathtime.com' } },
    });

    expect(buildRedirectTo('/explore')).toBe('https://getbathtime.com/auth/callback');
  });

  it('keeps localhost web callbacks on the current origin', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    Object.defineProperty(global, 'window', {
      configurable: true,
      value: { location: { origin: 'http://localhost:8098' } },
    });

    expect(buildRedirectTo('/explore')).toBe('http://localhost:8098/auth/callback');
  });
});
