import { Linking } from 'react-native';
import { openExternalUrl } from '../externalLinks';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
}));

const mockedLinking = Linking as jest.Mocked<typeof Linking>;

describe('openExternalUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens https URLs directly on native without canOpenURL preflight', async () => {
    mockedLinking.openURL.mockResolvedValue(undefined);

    await expect(openExternalUrl('https://www.coupang.com/vp/products/123')).resolves.toBe(true);

    expect(mockedLinking.canOpenURL).not.toHaveBeenCalled();
    expect(mockedLinking.openURL).toHaveBeenCalledWith('https://www.coupang.com/vp/products/123');
  });

  test('returns false when native https open fails', async () => {
    mockedLinking.openURL.mockRejectedValue(new Error('No browser'));

    await expect(openExternalUrl('https://www.kurly.com/goods/123')).resolves.toBe(false);
  });

  test('keeps canOpenURL preflight for custom schemes', async () => {
    mockedLinking.canOpenURL.mockResolvedValue(true);
    mockedLinking.openURL.mockResolvedValue(undefined);

    await expect(openExternalUrl('market://details?id=com.example')).resolves.toBe(true);

    expect(mockedLinking.canOpenURL).toHaveBeenCalledWith('market://details?id=com.example');
    expect(mockedLinking.openURL).toHaveBeenCalledWith('market://details?id=com.example');
  });
});
