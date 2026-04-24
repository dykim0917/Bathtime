import { Linking } from 'react-native';

const WEB_URL_PATTERN = /^https?:\/\//i;

export async function openExternalUrl(url: string): Promise<boolean> {
  const nextUrl = url.trim();
  if (!nextUrl) return false;

  if (typeof window !== 'undefined' && WEB_URL_PATTERN.test(nextUrl)) {
    if (typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = nextUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      return true;
    }

    const openedWindow = window.open(nextUrl, '_blank', 'noopener,noreferrer');
    if (openedWindow) openedWindow.opener = null;
    return true;
  }

  const supported = await Linking.canOpenURL(nextUrl);
  if (!supported) return false;

  await Linking.openURL(nextUrl);
  return true;
}
