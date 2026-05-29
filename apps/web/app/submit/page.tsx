import type { Metadata } from 'next';
import { SubmitForm } from '@web/components/SubmitForm';

export const metadata: Metadata = {
  title: '제보',
  description: '바스타임에서 다뤘으면 하는 목욕 공간, 욕실 아이템, 홈스파 주제를 제보해주세요.',
};

export default function SubmitPage() {
  return (
    <div className="page-stack">
      <header className="page-header compact">
        <p className="kicker">BATH TIME SUBMIT</p>
        <h1>좋은 바스타임을 알려주세요.</h1>
        <p>좋았던 목욕 공간, 욕실 아이템, 직접 해본 홈스파 루틴, 다뤘으면 하는 주제를 보내주세요.</p>
      </header>
      <section className="body-panel">
        <h2>제보 전에 알려주세요</h2>
        <ul>
          <li>공간이나 제품 이름, 링크가 있으면 함께 보내주세요.</li>
          <li>직접 경험인지, 공개 정보를 보고 알게 된 내용인지 알려주세요.</li>
          <li>사진은 직접 촬영했거나 사용 허락을 받은 것만 보내주세요.</li>
        </ul>
      </section>
      <SubmitForm />
    </div>
  );
}
