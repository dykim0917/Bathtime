import type { Metadata } from 'next';
import Link from 'next/link';

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
        <p>저장과 개인화 루틴은 앱에서 계정으로 이어집니다. 웹에서는 콘텐츠를 먼저 둘러볼 수 있어요.</p>
        <div className="cta-row">
          <Link className="button-primary" href="/app?from=web_login">앱에서 로그인하기</Link>
          <Link className="button-secondary" href="/explore">둘러보기</Link>
        </div>
      </header>
    </div>
  );
}
