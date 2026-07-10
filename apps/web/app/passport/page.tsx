import type { Metadata } from 'next';
import { OnsenPassport } from '@web/components/OnsenPassport';

export const metadata: Metadata = {
  title: '내 온천여권',
  description: '다녀온 온천과 물의 감촉, 다시 가고 싶은 곳을 나만의 기록으로 확인합니다.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PassportPage() {
  return (
    <div className="page-stack passport-page">
      <header className="page-header compact">
        <p className="kicker">ONSEN PASSPORT</p>
        <h1>내 온천여권</h1>
        <p>다녀온 물의 감촉과 이용 경험을 기록하고, 내 취향을 천천히 알아갑니다.</p>
      </header>
      <OnsenPassport />
    </div>
  );
}
