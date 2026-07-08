import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import logoImage from '@/assets/images/logo.png';
import { LoginPanel } from '@web/components/LoginPanel';

export const metadata: Metadata = {
  title: '로그인',
  description: '바스타임 로그인',
};

export default function LoginPage() {
  return (
    <div className="page-stack auth-page">
      <header className="auth-page-header">
        <Link className="auth-logo" href="/" aria-label="Bathtime 홈">
          <img className="auth-logo-wordmark" src={logoImage.src} alt="바스타임" width={236} height={45} />
        </Link>
      </header>

      <div className="auth-layout">
        <Suspense fallback={<p className="auth-note">준비 중</p>}>
          <LoginPanel />
        </Suspense>
      </div>
    </div>
  );
}
