import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

const DEFAULT_ARCHIVE_WEB_BASE_URL = 'https://www.getbathtime.com';
const BATHTIME_HOSTS = new Set(['getbathtime.com', 'www.getbathtime.com']);

function getArchiveWebBaseUrl() {
  return (process.env.EXPO_PUBLIC_ARCHIVE_WEB_BASE_URL?.trim() || DEFAULT_ARCHIVE_WEB_BASE_URL).replace(/\/$/, '');
}

function buildArchiveUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${getArchiveWebBaseUrl()}${normalizedPath}`);
  url.searchParams.set('appShell', '1');
  return url.toString();
}

function isConfiguredArchiveHost(hostname: string) {
  try {
    return hostname === new URL(getArchiveWebBaseUrl()).hostname;
  } catch {
    return false;
  }
}

function isArchiveHost(hostname: string) {
  return BATHTIME_HOSTS.has(hostname) || isConfiguredArchiveHost(hostname);
}

function getRoutineIntent(url: string) {
  try {
    const parsed = new URL(url);
    if (!isArchiveHost(parsed.hostname)) return null;
    if (parsed.pathname !== '/app') return null;
    return parsed.searchParams.get('routine') || 'recommended';
  } catch {
    return null;
  }
}

function isInternalArchiveUrl(url: string) {
  try {
    const parsed = new URL(url);
    return isArchiveHost(parsed.hostname);
  } catch {
    return false;
  }
}

export function ArchiveWebViewScreen({ path }: { path: string }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const uri = useMemo(() => buildArchiveUrl(path), [path]);

  const handleShouldStartLoad = useCallback((request: { url: string }) => {
    const routineIntent = getRoutineIntent(request.url);
    if (routineIntent) {
      router.push('/(tabs)/routines' as any);
      return false;
    }

    if (isInternalArchiveUrl(request.url)) return true;

    if (request.url.startsWith('about:') || request.url.startsWith('data:')) return true;

    void Linking.openURL(request.url).catch(() => undefined);
    return false;
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <WebView
        source={{ uri }}
        style={styles.webView}
        startInLoadingState={false}
        onLoadStart={() => {
          setLoading(true);
          setFailed(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        setSupportMultipleWindows={false}
      />
      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={archiveColors.primaryActive} />
        </View>
      ) : null}
      {failed ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>아카이브를 불러오지 못했습니다.</Text>
          <Text style={styles.errorBody}>네트워크 상태를 확인한 뒤 다시 시도해주세요.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: archiveColors.canvas,
  },
  webView: {
    flex: 1,
    backgroundColor: archiveColors.canvas,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 247, 241, 0.72)',
  },
  errorCard: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 82,
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 6,
  },
  errorTitle: {
    color: archiveColors.ink,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  errorBody: {
    color: archiveColors.body,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: luxuryFonts.sans,
  },
});
