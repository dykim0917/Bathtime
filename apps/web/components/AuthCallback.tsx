'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@web/lib/auth';

function normalizeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/')) return '/saved';
  if (value.startsWith('//')) return '/saved';
  return value;
}

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('로그인 상태를 확인하고 있어요.');

  useEffect(() => {
    let cancelled = false;

    async function completeLogin() {
      const supabase = getSupabaseClient();
      const nextPath = normalizeNextPath(searchParams.get('next'));
      const code = searchParams.get('code');

      if (!supabase) {
        router.replace(`/auth/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      const { error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.getSession().then(({ error: sessionError }) => ({ error: sessionError }));

      if (cancelled) return;
      if (error) {
        setMessage('로그인을 완료하지 못했어요. 다시 시도해주세요.');
        router.replace(`/auth/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      setMessage('로그인이 완료됐어요. 이동하고 있어요.');
      router.replace(nextPath);
    }

    void completeLogin();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="auth-status">
      <span className="auth-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
