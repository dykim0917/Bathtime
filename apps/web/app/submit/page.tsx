import type { Metadata } from 'next';
import { Camera, LinkSimple, ShieldCheck } from '@phosphor-icons/react/ssr';
import { SubmitForm } from '@web/components/SubmitForm';

export const metadata: Metadata = {
  title: '제보',
  description: '바스타임에서 다뤘으면 하는 목욕 공간, 욕실 아이템, 홈스파 주제를 제보해주세요.',
};

export default function SubmitPage() {
  return (
    <div className="page-stack submit-page">
      <section className="submit-hero">
        <header className="page-header compact">
          <p className="kicker">BATH TIME SUBMIT</p>
          <h1>좋은 바스타임을 알려주세요.</h1>
          <p>좋았던 목욕 공간, 욕실 아이템, 직접 해본 홈스파 루틴, 다뤘으면 하는 주제를 보내주세요.</p>
        </header>
      </section>

      <div className="submit-layout">
        <aside className="submit-guide">
          <div>
            <ShieldCheck size={22} weight="bold" aria-hidden="true" />
            <strong>확인하는 방식</strong>
            <p>제보는 바로 공개하지 않고, 공개 정보와 직접 경험 여부를 나눠 확인한 뒤 아카이브에 반영합니다.</p>
          </div>
          <div>
            <LinkSimple size={22} weight="bold" aria-hidden="true" />
            <strong>같이 보내면 좋은 것</strong>
            <p>공간명, 제품명, 공식 페이지, 지도 링크처럼 출처를 확인할 수 있는 단서가 있으면 좋아요.</p>
          </div>
          <div>
            <Camera size={22} weight="bold" aria-hidden="true" />
            <strong>사진 기준</strong>
            <p>직접 촬영했거나 사용 허락을 받은 사진만 보내주세요. 외부 이미지는 링크로 남겨주면 됩니다.</p>
          </div>
        </aside>

        <SubmitForm />
      </div>
    </div>
  );
}
