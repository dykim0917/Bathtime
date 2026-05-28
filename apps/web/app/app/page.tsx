import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '앱에서 열기',
  description: '바스타임 앱에서 의식과 보관함을 이어서 사용할 수 있습니다.',
  robots: { index: false, follow: false },
};

export default function AppHandoffPage() {
  return (
    <div className="page-stack">
      <header className="page-header compact">
        <p className="kicker">BATH TIME APP</p>
        <h1>앱에서 이어가기</h1>
        <p>웹에서는 콘텐츠를 읽고, 앱에서는 타이머와 보관함으로 의식을 이어갈 수 있습니다.</p>
        <a className="button-primary" href="getbathtime://profile?saved=1">바스타임 앱 열기</a>
      </header>
    </div>
  );
}
