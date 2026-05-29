import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCallback } from '@web/components/AuthCallback';

export const metadata: Metadata = {
  title: '로그인 처리 중',
  description: '바스타임 로그인을 처리하고 있습니다.',
};

export default function AuthCallbackPage() {
  return (
    <div className="page-stack">
      <header className="page-header compact">
        <p className="kicker">LOGIN</p>
        <h1>로그인 처리 중입니다.</h1>
        <Suspense fallback={<p className="auth-note">로그인 상태를 확인하고 있어요.</p>}>
          <AuthCallback />
        </Suspense>
      </header>
    </div>
  );
}
