'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { buildNativeAppRedirectTo, buildRedirectTo, getSupabaseClient } from '@web/lib/auth';

declare global {
  interface Window {
    __BATHTIME_NATIVE_AUTH__?: boolean;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

type NativeOAuthResult = {
  source?: string;
  type?: string;
  status?: string;
  error?: string | null;
};

function normalizeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/')) return '/saved';
  if (value.startsWith('//')) return '/saved';
  return value;
}

function isNativeAppShell(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.ReactNativeWebView) return true;
  if (window.navigator.userAgent.includes('BathtimeApp')) return true;
  return new URLSearchParams(window.location.search).get('appShell') === '1';
}

function postNativeOAuthRequest(url: string, nextPath: string): boolean {
  if (!window.ReactNativeWebView) return false;
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'bathtime:auth:oauth',
      provider: 'google',
      url,
      nextPath,
    })
  );
  return true;
}

function GoogleMark() {
  return (
    <svg className="google-mark" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.29h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.89c2.27-2.09 3.53-5.17 3.53-8.65Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3c-1.08.72-2.45 1.14-4.06 1.14-3.12 0-5.77-2.11-6.72-4.95H1.27v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.28 14.28A7.22 7.22 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l4.01-3.09Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.45-3.45C17.95 1.17 15.23 0 12 0A12 12 0 0 0 1.27 6.63l4.01 3.09C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  );
}

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const supabase = getSupabaseClient();
  const nextPath = useMemo(() => normalizeNextPath(searchParams.get('next')), [searchParams]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(nextPath);
    });
  }, [nextPath, router, supabase]);

  useEffect(() => {
    function handleNativeOAuthResult(event: MessageEvent) {
      let data: NativeOAuthResult | null = null;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data?.source !== 'bathtime-native' || data.type !== 'bathtime:auth:oauth-result') return;
      if (data.status === 'success') return;

      setStatus('error');
      setMessage(data.error ?? '로그인이 취소됐어요. 다시 시도해주세요.');
    }

    window.addEventListener('message', handleNativeOAuthResult);
    document.addEventListener('message', handleNativeOAuthResult as EventListener);
    return () => {
      window.removeEventListener('message', handleNativeOAuthResult);
      document.removeEventListener('message', handleNativeOAuthResult as EventListener);
    };
  }, []);

  return (
    <section className="auth-box">
      <div className="auth-copy">
        <h2>Google 계정으로 계속하기</h2>
        <p>저장한 콘텐츠와 제보를 계정에 연결합니다.</p>
      </div>
      {!supabase ? <p className="auth-warning">Supabase 로그인 환경변수가 필요합니다.</p> : null}
      {message ? <p className={status === 'error' ? 'auth-warning' : 'auth-note'}>{message}</p> : null}
      <button
        className="google-login-button"
        type="button"
        disabled={!supabase || status === 'loading'}
        onClick={async () => {
          if (!supabase) return;
          setStatus('loading');
          setMessage('Google 로그인으로 이동하고 있어요.');
          const nativeAppShell = isNativeAppShell() && Boolean(window.ReactNativeWebView) && window.__BATHTIME_NATIVE_AUTH__ === true;
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: nativeAppShell ? buildNativeAppRedirectTo() : buildRedirectTo(),
              skipBrowserRedirect: nativeAppShell,
            },
          });
          if (error) {
            setStatus('error');
            setMessage(error.message);
            return;
          }

          if (nativeAppShell) {
            if (!data.url || !postNativeOAuthRequest(data.url, nextPath)) {
              setStatus('error');
              setMessage('앱 로그인 연결을 시작하지 못했어요. 다시 시도해주세요.');
              return;
            }
            setMessage('Google 로그인 후 앱으로 돌아옵니다.');
          }
        }}
      >
        <span className="google-mark-frame">
          <GoogleMark />
        </span>
        Google로 계속하기
      </button>
    </section>
  );
}
