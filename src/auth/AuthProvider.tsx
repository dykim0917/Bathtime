import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { AuthProvider as ProviderName, AuthState, BathtimeUser } from '@/src/auth/types';
import { getSupabaseClient } from '@/src/auth/supabase';
import { mapSupabaseUser, upsertCurrentUserProfile } from '@/src/auth/session';
import { trackArchiveEvent } from '@/src/analytics/events';
import { completePendingAuthAction } from '@/src/auth/pendingActions';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = AuthState & {
  loginWithProvider: (provider: ProviderName, nextPath?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function buildRedirectTo(nextPath?: string): string | undefined {
  if (Platform.OS !== 'web') {
    return Linking.createURL('auth/callback', {
      scheme: 'getbathtime',
    });
  }
  if (typeof window === 'undefined') return undefined;
  const origin = window.location.origin === 'https://www.getbathtime.com' ? 'https://getbathtime.com' : window.location.origin;
  return new URL('/auth/callback', origin).toString();
}

function readUrlParam(url: string, key: string): string {
  const parsed = Linking.parse(url);
  const value = parsed.queryParams?.[key];
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
}

function userFromSession(session: Session | null): BathtimeUser | null {
  return session?.user ? mapSupabaseUser(session.user) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  const [user, setUser] = useState<BathtimeUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  const syncSession = useCallback(
    async (session: Session | null) => {
      const nextUser = userFromSession(session);
      setUser(nextUser);
      if (nextUser) {
        try {
          await upsertCurrentUserProfile(nextUser);
        } catch (error) {
          trackArchiveEvent('auth_login_failed', {
            errorCode: error instanceof Error ? error.message : 'profile_upsert_failed',
            platform: 'web',
          });
        }
      }
    },
    []
  );

  const refreshUser = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data } = await supabase.auth.getSession();
    await syncSession(data.session);
    setIsLoading(false);
  }, [supabase, syncSession]);

  useEffect(() => {
    if (!supabase) return;

    void refreshUser();
    const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      void syncSession(session);
      if (event === 'SIGNED_IN') {
        trackArchiveEvent('auth_login_succeeded', {
          provider: session?.user ? mapSupabaseUser(session.user).provider : undefined,
          platform: Platform.OS === 'web' ? 'web' : 'native',
        });
      }
    });

    return () => data.subscription.unsubscribe();
  }, [refreshUser, supabase, syncSession]);

  const loginWithProvider = useCallback(
    async (provider: ProviderName, nextPath?: string) => {
      if (!supabase) {
        trackArchiveEvent('auth_login_failed', { provider, errorCode: 'auth_not_configured', platform: 'web' });
        return;
      }

      const platform = Platform.OS === 'web' ? 'web' : 'native';
      trackArchiveEvent('auth_provider_clicked', { provider, platform });
      const redirectTo = buildRedirectTo(nextPath);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        trackArchiveEvent('auth_login_failed', { provider, errorCode: error.message, platform });
        return;
      }

      if (Platform.OS !== 'web') {
        if (!data.url) return;
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== 'success') return;
        const code = readUrlParam(result.url, 'code');
        if (!code) return;
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          trackArchiveEvent('auth_login_failed', { provider, errorCode: exchangeError.message, platform: 'native' });
          return;
        }
        await refreshUser();
        await completePendingAuthAction();
      }
    },
    [refreshUser, supabase]
  );

  const logout = useCallback(async () => {
    if (!supabase) return;
    trackArchiveEvent('auth_logout_clicked', { platform: 'web' });
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isConfigured: Boolean(supabase),
      loginWithProvider,
      logout,
      refreshUser,
    }),
    [isLoading, loginWithProvider, logout, refreshUser, supabase, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
