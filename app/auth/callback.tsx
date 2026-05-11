import React, { useEffect, useState } from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { getSupabaseClient } from '@/src/auth/supabase';
import { completePendingAuthAction, readPendingAuthActionAsync } from '@/src/auth/pendingActions';
import { archiveColors } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { trackArchiveEvent } from '@/src/analytics/events';

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default function AuthCallbackPage() {
  const params = useLocalSearchParams<{ next?: string | string[]; code?: string | string[] }>();
  const [message, setMessage] = useState('로그인 상태를 확인하고 있어요.');

  useEffect(() => {
    let mounted = true;

    async function completeLogin() {
      const supabase = getSupabaseClient();
      const pendingAction = await readPendingAuthActionAsync();
      const defaultPath = Platform.OS === 'web' ? '/saved' : '/(tabs)/my?saved=1';
      const nextPath = normalizeParam(params.next) || pendingAction?.returnTo || defaultPath;
      const code = normalizeParam(params.code);

      if (!supabase) {
        router.replace(`/auth/login?next=${encodeURIComponent(nextPath)}&error=auth_not_configured` as Href);
        return;
      }

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          await supabase.auth.getSession();
        }

        if (mounted) setMessage('요청하신 작업을 이어서 처리하고 있어요.');
        await completePendingAuthAction();
        router.replace(nextPath as Href);
      } catch (error) {
        trackArchiveEvent('auth_login_failed', {
          errorCode: error instanceof Error ? error.message : 'callback_failed',
          platform: Platform.OS === 'web' ? 'web' : 'native',
        });
        router.replace(`/auth/login?next=${encodeURIComponent(nextPath)}` as Href);
      }
    }

    void completeLogin();
    return () => {
      mounted = false;
    };
  }, [params.code, params.next]);

  const status = (
    <View style={styles.statusBox}>
      <ActivityIndicator color={archiveColors.primary} />
      <Text style={styles.statusText}>{message}</Text>
    </View>
  );

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.nativeRoot}>
        {status}
      </View>
    );
  }

  return (
    <WebShell>
      <SeoMetadata title="로그인 처리 중 - 바스타임" description="로그인을 처리하고 있습니다." />
      <ArchivePageContainer variant="narrow">
        <View style={webStyles.pageStack}>
          {status}
        </View>
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  statusBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 60,
  },
  statusText: {
    color: archiveColors.body,
    fontSize: 15,
    fontFamily: luxuryFonts.sans,
  },
  nativeRoot: {
    flex: 1,
    backgroundColor: archiveColors.canvas,
    justifyContent: 'center',
  },
});
