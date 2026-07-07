import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '바스타임이 온천을 확인하는 방법',
  description: '바스타임 온천 검색기가 이용 경험과 공식 정보를 읽고 온천 숙소를 판정하는 기준을 설명합니다.',
  alternates: {
    canonical: '/onsen/methodology',
  },
};

export default function OnsenMethodologyPage() {
  return (
    <article className="onsen-method-page">
      <header className="onsen-method-hero">
        <p className="onsen-kicker">Method</p>
        <h1>바스타임은 인용하지 않고 판정합니다.</h1>
        <p>
          숙소 홍보 문구나 이용 경험 원문을 옮기지 않습니다. 직접 읽고, 세고, 분류한 뒤 바스타임의 기준으로
          어떤 온천 경험인지 정리합니다.
        </p>
      </header>

      <section className="onsen-method-section" aria-labelledby="onsen-method-steps-title">
        <h2 id="onsen-method-steps-title">판정의 3단계</h2>
        <div className="onsen-method-grid">
          <div>
            <span>01</span>
            <strong>원문은 옮기지 않습니다</strong>
            <p>외부 이용 경험의 문장과 말투는 사용자 화면에 재게시하지 않습니다.</p>
          </div>
          <div>
            <span>02</span>
            <strong>반복되는 항목을 셉니다</strong>
            <p>객실 내 프라이빗탕, 대절탕, 대욕장, 수온, 계절 변수처럼 선택에 영향을 주는 항목을 분류합니다.</p>
          </div>
          <div>
            <span>03</span>
            <strong>바스타임의 결론으로 씁니다</strong>
            <p>몇 건을 읽었고, 어떤 플랫폼을 확인했는지 밝힌 뒤 숙소별 판정을 냅니다.</p>
          </div>
        </div>
      </section>

      <section className="onsen-method-section" aria-labelledby="onsen-method-status-title">
        <h2 id="onsen-method-status-title">정보 상태</h2>
        <dl className="onsen-method-status-list">
          <div>
            <dt>확인됨</dt>
            <dd>공식 안내나 구조화된 정보로 해당 항목을 확인한 상태입니다.</dd>
          </div>
          <div>
            <dt>이용 경험 기준</dt>
            <dd>공식 확정은 아니지만 직접 읽은 이용 경험에서 반복적으로 확인한 항목입니다.</dd>
          </div>
          <div>
            <dt>예약 시 확인</dt>
            <dd>객실 타입, 계절, 플랜, 운영 시간에 따라 달라질 수 있어 예약 단계에서 다시 봐야 하는 항목입니다.</dd>
          </div>
        </dl>
      </section>

      <section className="onsen-method-section" aria-labelledby="onsen-method-source-title">
        <h2 id="onsen-method-source-title">확인하는 표면</h2>
        <p>
          자란, 라쿠텐, 구글 지도, 트립어드바이저, 아고다, 야후 트래블, 리럭스 등 공개적으로 확인 가능한 표면을
          숙소별로 나눠 읽습니다. 플랫폼 수와 이용 경험 수는 판정 페이지에 함께 표시합니다.
        </p>
      </section>

      <footer className="onsen-method-footer">
        <Link href="/onsen">온천 검색기로 돌아가기</Link>
      </footer>
    </article>
  );
}
