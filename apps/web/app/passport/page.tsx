import type { Metadata } from 'next';
import { OnsenPassport } from '@web/components/OnsenPassport';

export const metadata: Metadata = {
  title: '내 온천여권',
  description: '다녀온 온천과 작성한 후기, 물의 감촉을 온천여권에서 확인합니다.',
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
        <p>다녀온 온천과 작성한 후기를 모아 내 물 취향을 확인합니다.</p>
      </header>
      <OnsenPassport />
    </div>
  );
}
