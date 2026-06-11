import type { Metadata } from 'next';
import { AppHandoffPanel } from '@web/components/AppHandoffPanel';

export const metadata: Metadata = {
  title: '앱에서 열기',
  description: '바스타임 앱을 열거나 Play Store에서 설치합니다.',
  robots: { index: false, follow: false },
};

type AppHandoffPageProps = {
  searchParams?: Promise<{
    from?: string;
    routine?: string;
  }>;
};

export default async function AppHandoffPage({ searchParams }: AppHandoffPageProps) {
  const params = await searchParams;

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <p className="kicker">BATH TIME APP</p>
        <h1>앱에서 이어가기</h1>
        <p>저장한 기록을 꺼내 타이머와 보관함으로 의식을 이어갈 수 있습니다.</p>
      </header>
      <AppHandoffPanel from={params?.from} routine={params?.routine} />
    </div>
  );
}
