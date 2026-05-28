import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '보관함',
  description: '앱에서 저장한 바스타임 콘텐츠를 이어서 확인합니다.',
};

export default function SavedPage() {
  return (
    <div className="page-stack">
      <header className="page-header compact">
        <p className="kicker">SAVED</p>
        <h1>보관함은 앱에서 이어서 볼 수 있어요.</h1>
        <p>저장한 콘텐츠와 루틴은 앱에서 더 안정적으로 관리됩니다.</p>
        <Link className="button-primary" href="/app">앱 열기</Link>
      </header>
    </div>
  );
}
