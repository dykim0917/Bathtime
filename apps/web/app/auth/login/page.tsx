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
    <div className="page-stack auth-page">
      <header className="page-header compact auth-page-header">
        <p className="kicker">ACCOUNT</p>
        <h1>내 바스타임을 이어서 보기</h1>
        <p>저장한 콘텐츠와 제보를 Google 계정에 연결해두면, 다음에도 같은 흐름에서 이어볼 수 있어요.</p>
      </header>

      <div className="auth-layout">
        <Suspense fallback={<p className="auth-note">로그인 정보를 준비하고 있어요.</p>}>
          <LoginPanel />
        </Suspense>

        <aside className="auth-side-note">
          <strong>로그인하면 가능한 것</strong>
          <ul>
            <li>관심 있는 콘텐츠 저장</li>
            <li>제보 내용 계정 연결</li>
            <li>나중에 앱 루틴과 이어보기</li>
          </ul>
        </aside>
      </div>

      <div className="auth-footer-row">
        <div className="cta-row">
          <Link className="button-secondary" href="/explore">둘러보기</Link>
        </div>
      </div>
    </div>
  );
}
