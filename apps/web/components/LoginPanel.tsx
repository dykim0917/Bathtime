'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { buildRedirectTo, getSupabaseClient } from '@web/lib/auth';

function normalizeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/')) return '/saved';
  if (value.startsWith('//')) return '/saved';
  return value;
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
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: buildRedirectTo(),
            },
          });
          if (error) {
            setStatus('error');
            setMessage(error.message);
          }
        }}
      >
        <span>G</span>
        Google로 계속하기
      </button>
    </section>
  );
}
