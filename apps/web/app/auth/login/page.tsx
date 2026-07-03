import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LoginPanel } from '@web/components/LoginPanel';

export const metadata: Metadata = {
  title: '로그인',
  description: '바스타임 계정으로 찜한 온천을 이어서 확인합니다.',
};

export default function LoginPage() {
  return (
    <div className="page-stack auth-page">
      <header className="page-header compact auth-page-header">
        <p className="kicker">바스타임 계정</p>
        <h1>찜한 온천을 다시 확인하세요.</h1>
        <p>관심 있는 온천 숙소와 시설을 계정에 저장해두고, 다음 탐색에서 이어서 볼 수 있어요.</p>
      </header>

      <div className="auth-layout">
        <Suspense fallback={<p className="auth-note">로그인 정보를 준비하고 있어요.</p>}>
          <LoginPanel />
        </Suspense>

        <aside className="auth-side-note">
          <strong>로그인하면 가능한 것</strong>
          <ul>
            <li>관심 온천 찜하기</li>
            <li>숙소 후보 다시 보기</li>
            <li>다음 검색에서 이어서 비교하기</li>
          </ul>
        </aside>
      </div>

      <div className="auth-footer-row">
        <div className="cta-row">
          <Link className="button-secondary" href="/onsen">온천 검색으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}
