import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { requestExpoPushTokenAsync } from '@/src/notifications/pushNotifications';

WebBrowser.maybeCompleteAuthSession();

const DEFAULT_ARCHIVE_WEB_BASE_URL = 'https://www.getbathtime.com';
const BATHTIME_HOSTS = new Set(['getbathtime.com', 'www.getbathtime.com']);
const APP_SHELL_STYLE_ID = 'bathtime-app-shell-style';
const APP_SHELL_INJECTION = `
(function () {
  var css = [
    '.bottom-nav{display:none!important;}',
    '.app-bridge{display:none!important;}',
    '@media(max-width:767px){.main{padding-bottom:28px!important;}}'
  ].join('');

  function injectAppShellStyle() {
    if (document.getElementById('${APP_SHELL_STYLE_ID}')) return;
    var style = document.createElement('style');
    style.id = '${APP_SHELL_STYLE_ID}';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  function markAppShell() {
    window.__BATHTIME_NATIVE_AUTH__ = true;
    document.documentElement.dataset.bathtimeSurface = 'app';
    if (document.body) document.body.classList.add('bathtime-app-shell');
    injectAppShellStyle();
  }

  injectAppShellStyle();
  markAppShell();
  document.addEventListener('DOMContentLoaded', markAppShell);
})();
true;
`;

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

function normalizeNextPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return '/saved';
  if (value.startsWith('//')) return '/saved';
  return value;
}

function buildWebAuthCallbackUrl(nativeCallbackUrl: string, nextPath: string) {
  const nativeUrl = new URL(nativeCallbackUrl);
  const webUrl = new URL(`${getArchiveWebBaseUrl()}/auth/callback`);
  nativeUrl.searchParams.forEach((value, key) => {
    webUrl.searchParams.set(key, value);
  });
  webUrl.searchParams.set('next', normalizeNextPath(nextPath));
  webUrl.searchParams.set('appShell', '1');
  return webUrl.toString();
}

export function ArchiveWebViewScreen({ path }: { path: string }) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const uri = useMemo(() => buildArchiveUrl(path), [path]);

  const handleShouldStartLoad = useCallback((request: { url: string }) => {
    const routineIntent = getRoutineIntent(request.url);
    if (routineIntent) {
      setLoading(false);
      router.push('/(tabs)/routines' as any);
      return false;
    }

    if (isInternalArchiveUrl(request.url)) return true;

    if (request.url.startsWith('about:') || request.url.startsWith('data:')) return true;

    void Linking.openURL(request.url).catch(() => undefined);
    return false;
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), 12000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const postBridgeMessage = useCallback((payload: Record<string, unknown>) => {
    webViewRef.current?.postMessage(JSON.stringify({ source: 'bathtime-native', ...payload }));
  }, []);

  const openOAuthSession = useCallback(
    async (payload: { url?: unknown; nextPath?: unknown }) => {
      if (typeof payload.url !== 'string' || !payload.url) {
        postBridgeMessage({
          type: 'bathtime:auth:oauth-result',
          status: 'error',
          error: 'missing_oauth_url',
        });
        return;
      }

      const callbackUrl = 'getbathtime://auth/callback';
      const nextPath = normalizeNextPath(payload.nextPath);
      const result = await WebBrowser.openAuthSessionAsync(payload.url, callbackUrl).catch((error: unknown) => {
        postBridgeMessage({
          type: 'bathtime:auth:oauth-result',
          status: 'error',
          error: error instanceof Error ? error.message : 'oauth_session_failed',
        });
        return null;
      });

      if (!result) return;

      if (result.type !== 'success') {
        postBridgeMessage({
          type: 'bathtime:auth:oauth-result',
          status: result.type,
        });
        return;
      }

      let webCallbackUrl: string;
      try {
        webCallbackUrl = buildWebAuthCallbackUrl(result.url, nextPath);
      } catch {
        postBridgeMessage({
          type: 'bathtime:auth:oauth-result',
          status: 'error',
          error: 'invalid_callback_url',
        });
        return;
      }

      webViewRef.current?.injectJavaScript(`window.location.href = ${JSON.stringify(webCallbackUrl)}; true;`);
    },
    [postBridgeMessage]
  );

  const handleWebViewMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      let payload: { type?: string; url?: unknown; nextPath?: unknown; target?: unknown } | null = null;
      try {
        payload = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (payload?.type === 'bathtime:auth:oauth') {
        await openOAuthSession(payload);
      }

      if (payload?.type === 'bathtime:navigate' && payload.target === 'history') {
        router.push('/(tabs)/history' as any);
      }

      if (payload?.type === 'bathtime:push:enable') {
        const result = await requestExpoPushTokenAsync();
        postBridgeMessage({
          type: 'bathtime:push:registration-result',
          enabled: result.ok,
          platform: 'android',
          token: result.ok ? result.token : null,
          error: result.ok ? null : result.message,
          reason: result.ok ? null : result.reason,
        });
      }

      if (payload?.type === 'bathtime:push:disable') {
        postBridgeMessage({
          type: 'bathtime:push:registration-result',
          enabled: false,
          platform: 'android',
          token: null,
          error: null,
          reason: 'disabled',
        });
      }
    },
    [openOAuthSession, postBridgeMessage]
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        style={styles.webView}
        startInLoadingState={false}
        onLoadStart={() => {
          setLoading(true);
          setFailed(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onLoadProgress={({ nativeEvent }) => {
          if (nativeEvent.progress >= 0.96) setLoading(false);
        }}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        injectedJavaScriptBeforeContentLoaded={APP_SHELL_INJECTION}
        injectedJavaScript={APP_SHELL_INJECTION}
        applicationNameForUserAgent="BathtimeApp"
        onMessage={handleWebViewMessage}
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
