import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LoginPanel } from '@web/components/LoginPanel';

export const metadata: Metadata = {
  title: '로그인',
  description: '바스타임 계정으로 저장과 제보를 이어갑니다.',
};

export default function LoginPage() {
  return (
    <div className="page-stack">
      <header className="page-header compact">
        <p className="kicker">ACCOUNT</p>
        <h1>내 바스타임을 이어서 보기</h1>
        <p>Google 계정으로 저장한 콘텐츠와 제보를 연결합니다.</p>
        <Suspense fallback={<p className="auth-note">로그인 정보를 준비하고 있어요.</p>}>
          <LoginPanel />
        </Suspense>
        <div className="cta-row">
          <Link className="button-secondary" href="/explore">둘러보기</Link>
        </div>
      </header>
    </div>
  );
}
