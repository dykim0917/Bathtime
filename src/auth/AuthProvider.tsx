import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { AuthProvider as ProviderName, AuthState, BathtimeUser } from '@/src/auth/types';
import { getSupabaseClient } from '@/src/auth/supabase';
import { mapSupabaseUser, upsertCurrentUserProfile } from '@/src/auth/session';
import { trackArchiveEvent } from '@/src/analytics/events';

type AuthContextValue = AuthState & {
  loginWithProvider: (provider: ProviderName, nextPath?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildRedirectTo(nextPath?: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const url = new URL('/auth/callback', window.location.origin);
  if (nextPath) url.searchParams.set('next', nextPath);
  return url.toString();
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
          platform: 'web',
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

      trackArchiveEvent('auth_provider_clicked', { provider, platform: 'web' });
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: buildRedirectTo(nextPath),
        },
      });

      if (error) {
        trackArchiveEvent('auth_login_failed', { provider, errorCode: error.message, platform: 'web' });
      }
    },
    [supabase]
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
