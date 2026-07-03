import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  Drop,
  Info,
  MagnifyingGlass,
  SealCheck,
  ThermometerSimple,
  Warning,
} from '@phosphor-icons/react/ssr';

export const metadata: Metadata = {
  title: '디자인 시스템',
  description: '바스타임의 색, 타이포그래피, 컴포넌트, 온천 검색기 UI 기준을 정리한 내부 디자인 시스템입니다.',
  robots: {
    index: false,
    follow: false,
  },
};

const colorTokens = [
  { name: 'Canvas', token: '--bt-color-canvas', value: '#fbfaf6', usage: '페이지 전체 배경' },
  { name: 'Surface', token: '--bt-color-surface', value: '#fffdf8', usage: '카드와 패널' },
  { name: 'Soft Surface', token: '--bt-color-surface-soft', value: '#f1efe8', usage: '보조 영역' },
  { name: 'Ink', token: '--bt-color-ink', value: '#1f2b28', usage: '제목과 핵심 문장' },
  { name: 'Body', token: '--bt-color-body', value: '#43504b', usage: '본문' },
  { name: 'Muted', token: '--bt-color-muted', value: '#6f7a75', usage: '메타 정보' },
  { name: 'Primary', token: '--bt-color-primary', value: '#2f7871', usage: '주요 액션' },
  { name: 'Primary Soft', token: '--bt-color-primary-soft', value: '#d8ebe5', usage: '선택 상태 배경' },
  { name: 'Accent', token: '--bt-color-accent', value: '#e7dcc1', usage: '온기와 보조 강조' },
  { name: 'Border', token: '--bt-color-border', value: '#ded8ca', usage: '기본 경계선' },
];

const typeRows = [
  { name: 'Page title', className: 'bt-page-title', sample: '온천 검색기' },
  { name: 'Section title', className: 'bt-section-title', sample: '예약 전에 확인할 온천 포인트' },
  { name: 'Body', className: 'bt-body-copy', sample: '객실탕, 가족탕, 대욕장 중 어디에서 온천 경험이 분명한지 먼저 확인합니다.' },
  { name: 'Meta', className: 'bt-meta', sample: '업데이트 2026-07-01 · 바스타임 정리' },
  { name: 'Data', className: 'bt-data', sample: '41.5°C · 10분 · 2026-07-01' },
];

const statusItems = [
  { label: '확인됨', body: '공식 안내나 바스타임 기준으로 확인한 정보', status: 'confirmed', icon: SealCheck },
  { label: '확인 필요', body: '객실 타입, 시즌, 플랜에 따라 달라질 수 있는 정보', status: 'needs_check', icon: Info },
  { label: '참고', body: '판단을 보조하는 이용 정보', status: 'review_signal', icon: Drop },
  { label: '주의', body: '예약 전에 반드시 확인해야 하는 정보', status: 'attention', icon: Warning },
];

const systemRows = [
  { name: 'Surface', body: 'default, subtle, raised, overlay, sunken으로 표면 레벨을 구분합니다.' },
  { name: 'Interaction', body: 'hover, pressed, focused, disabled 상태는 전역 토큰을 먼저 씁니다.' },
  { name: 'Form', body: '입력창은 border, focus ring, invalid, disabled 토큰을 공유합니다.' },
  { name: 'Motion', body: '100ms, 150ms, 220ms와 shared easing만 사용합니다.' },
];

export default function DesignSystemPage() {
  return (
    <div className="page-stack design-system-page">
      <section className="design-system-hero">
        <p className="bt-eyebrow">BATH TIME DESIGN SYSTEM</p>
        <h1 className="bt-page-title">차분하게 읽히고, 빠르게 판단되는 바스타임 UI.</h1>
        <p className="bt-body-copy">
          콘텐츠, 온천 검색기, 제보, 저장 화면이 같은 결을 유지하도록 색, 글자, 카드, 데이터 패널의 기준을 정리합니다.
        </p>
        <div className="ds-toolbar" aria-label="디자인 시스템 빠른 이동">
          <a href="#tokens">토큰</a>
          <a href="#typography">타이포그래피</a>
          <a href="#semantic">의미 토큰</a>
          <a href="#components">컴포넌트</a>
          <a href="#onsen">온천 검색기</a>
        </div>
      </section>

      <section id="semantic" className="ds-section">
        <div className="ds-section-heading">
          <p className="bt-eyebrow">SEMANTIC SYSTEM</p>
          <h2 className="bt-section-title">상태, 표면, 인터랙션 토큰</h2>
          <p className="bt-body-copy">새 기능은 색을 직접 고르지 않고 의미 토큰을 먼저 선택합니다.</p>
        </div>
        <div className="ds-semantic-grid">
          <article className="bt-card ds-preview-panel">
            <span className="bt-eyebrow">STATUS</span>
            <div className="ds-status-token-row">
              {statusItems.map((item) => (
                <span key={item.label} className="onsen-status-badge" data-status={item.status}>
                  {item.label}
                </span>
              ))}
            </div>
          </article>
          <article className="bt-card ds-preview-panel">
            <span className="bt-eyebrow">SYSTEM</span>
            <div className="ds-system-list">
              {systemRows.map((item) => (
                <div key={item.name}>
                  <strong>{item.name}</strong>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="tokens" className="ds-section">
        <div className="ds-section-heading">
          <p className="bt-eyebrow">FOUNDATION</p>
          <h2 className="bt-section-title">색상 토큰</h2>
          <p className="bt-body-copy">따뜻한 캔버스 위에 흰 표면, 청록색 액션, 황동빛 보조 강조를 얹습니다.</p>
        </div>
        <div className="ds-color-grid">
          {colorTokens.map((item) => (
            <article key={item.token} className="bt-card ds-color-card">
              <span className="ds-swatch" style={{ background: item.value }} aria-hidden="true" />
              <strong>{item.name}</strong>
              <code className="bt-data">{item.token}</code>
              <span className="bt-meta">{item.usage}</span>
            </article>
          ))}
        </div>
      </section>

      <section id="typography" className="ds-section">
        <div className="ds-section-heading">
          <p className="bt-eyebrow">TYPE</p>
          <h2 className="bt-section-title">글자 위계</h2>
          <p className="bt-body-copy">기본은 Pretendard 계열을 유지하고, 굵기보다 크기와 간격으로 위계를 만듭니다.</p>
        </div>
        <div className="bt-card ds-type-list">
          {typeRows.map((row) => (
            <div key={row.name} className="ds-type-row">
              <span className="bt-meta">{row.name}</span>
              <p className={row.className}>{row.sample}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="components" className="ds-section">
        <div className="ds-section-heading">
          <p className="bt-eyebrow">COMPONENTS</p>
          <h2 className="bt-section-title">기본 컴포넌트</h2>
          <p className="bt-body-copy">새 기능은 여기 있는 기본 단위를 조합해서 먼저 만들고, 필요한 경우에만 확장합니다.</p>
        </div>
        <div className="ds-component-grid">
          <article className="bt-card ds-preview-panel">
            <span className="bt-eyebrow">BUTTONS</span>
            <div className="ds-button-row">
              <Link className="button-primary" href="/explore">
                <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
                아카이브 보기
              </Link>
              <button className="button-secondary" type="button">
                저장하기
              </button>
            </div>
          </article>

          <article className="bt-card ds-preview-panel">
            <span className="bt-eyebrow">CHIPS</span>
            <div className="ds-chip-row">
              <span className="bt-chip" data-size="lg" data-tone="soft">
                유후인
              </span>
              <span className="bt-chip" data-size="lg" data-tone="soft">
                벳푸
              </span>
              <span className="bt-chip" data-size="md" data-tone="point">
                <Drop size={16} weight="bold" aria-hidden="true" />
                가족탕/대절탕 있음
              </span>
            </div>
          </article>

          <article className="bt-card bt-card-interactive ds-archive-sample">
            <span className="bt-eyebrow">ARCHIVE CARD</span>
            <h3>조용히 쉬고 싶은 날의 온천 숙소</h3>
            <p>객실탕과 대욕장 중 어디에서 온천 경험이 또렷한지 먼저 확인합니다.</p>
            <div className="ds-card-meta">
              <span className="bt-data">바스타임 정리</span>
              <span className="bt-chip">확인 필요</span>
            </div>
          </article>

          <article className="bt-callout ds-callout-sample">
            <span className="bt-eyebrow">CALLOUT</span>
            <p>객실 노천탕이 있어도 모든 객실에 온천수가 들어오는 것은 아닙니다. 예약 전 객실 타입을 먼저 확인하세요.</p>
          </article>
        </div>
      </section>

      <section id="onsen" className="ds-section">
        <div className="ds-section-heading">
          <p className="bt-eyebrow">ONSEN SEARCH</p>
          <h2 className="bt-section-title">온천 검색기 데이터 패턴</h2>
          <p className="bt-body-copy">숙소 소개가 아니라 예약 전 확인 도구로 보이도록 상태, 근거, 주의할 점을 분리합니다.</p>
        </div>
        <div className="ds-onsen-layout">
          <article className="bt-card ds-onsen-card">
            <div className="ds-onsen-card-head">
              <div>
                <p className="bt-eyebrow">YUFUIN · RYOKAN</p>
                <h3>객실탕 중심 온천 경험</h3>
              </div>
              <span className="bt-chip" data-state="active">
                확인됨
              </span>
            </div>
            <dl className="ds-signal-list">
              <div>
                <dt>
                  <Drop size={17} weight="bold" aria-hidden="true" />
                  온천수
                </dt>
                <dd>객실탕 온천수 확인 필요</dd>
              </div>
              <div>
                <dt>
                  <ThermometerSimple size={17} weight="bold" aria-hidden="true" />
                  온도
                </dt>
                <dd>뜨거운 원천과 조절 가능성 함께 확인</dd>
              </div>
              <div>
                <dt>
                  <Clock size={17} weight="bold" aria-hidden="true" />
                  이용 조건
                </dt>
                <dd>객실 타입별 차이 확인 필요</dd>
              </div>
            </dl>
          </article>

          <div className="ds-status-grid">
            {statusItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="bt-card ds-status-card">
                  <span aria-hidden="true">
                    <Icon size={19} weight="bold" />
                  </span>
                  <strong>{item.label}</strong>
                  <span className="onsen-status-badge" data-status={item.status}>
                    {item.label}
                  </span>
                  <p>{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
