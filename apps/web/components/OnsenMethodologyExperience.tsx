'use client';

import {
  ArrowDown,
  ArrowRight,
  CheckCircle,
  ClipboardText,
  MagnifyingGlass,
  SealCheck,
  WarningCircle,
} from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type MethodologyTotals = {
  experiencesRead: number;
  publishedCount: number;
  platformCount: number;
};

const processSteps = [
  {
    title: '공식 정보부터 읽습니다',
    shortTitle: '읽습니다',
    image: '/images/onsen/regions/atami.jpg',
    alt: '바다와 온천 마을이 함께 보이는 아타미 풍경',
    description: '숙소와 시설의 공식 안내를 먼저 확인해 탕의 위치, 온천수 사용 범위, 예약·입장 방식을 구조화합니다.',
    rows: [
      ['공식 확인', '객실탕, 대절탕, 공용탕'],
      ['조건 확인', '객실 타입, 입장 범위, 이용 시간'],
      ['방식 확인', '순수직수, 직수, 순환식 온천'],
    ],
  },
  {
    title: '같은 기준으로 분류합니다',
    shortTitle: '분류합니다',
    image: '/images/onsen/regions/ureshino.jpg',
    alt: '녹음 사이로 온천 건물이 보이는 우레시노 풍경',
    description: '후기 원문은 게시하지 않습니다. 선택에 영향을 주는 항목만 같은 기준표에 따라 분류합니다.',
    rows: [
      ['탕 경험', '프라이빗함, 혼잡, 동선'],
      ['물의 감촉', '매끈함, 염분감, 유황감'],
      ['주의 항목', '수온, 예약 혼선, 계절 변수'],
    ],
  },
  {
    title: '좋은 말과 불편한 말을 함께 셉니다',
    shortTitle: '셉니다',
    image: '/images/onsen/regions/gero.jpg',
    alt: '강과 산으로 둘러싸인 게로 온천 마을 풍경',
    description: '긍정적인 언급만 골라내지 않습니다. 반복된 장점과 부정 신호를 같은 분모 안에서 함께 집계합니다.',
    rows: [
      ['직접 읽은 후기', '234건'],
      ['객실탕 관련 언급', '187건'],
      ['수온 관련 부정 언급', '4건'],
    ],
  },
  {
    title: '숫자와 조건을 한 문장으로 판정합니다',
    shortTitle: '판정합니다',
    image: '/images/onsen/regions/beppu.jpg',
    alt: '증기가 피어오르는 벳푸 온천 풍경',
    description: '몇 건을 읽었는지, 어떤 조건이 남아 있는지 밝힌 뒤 바스타임의 결론으로 정리합니다.',
    rows: [
      ['확인됨', '공식 정보로 검증한 사실'],
      ['후기 기준', '반복 언급을 세어 내린 판단'],
      ['이용 전 확인', '조건에 따라 달라지는 항목'],
    ],
  },
] as const;

const informationStates = [
  {
    id: 'confirmed',
    label: '확인됨',
    title: '공식 정보로 검증한 사실',
    body: '숙소·시설 공식 안내나 구조화된 예약·입장 정보로 확인한 항목입니다. 탕의 위치, 원천 방식, 객실별·욕장별 이용 범위처럼 구조적인 사실이 여기에 해당합니다.',
    example: '당일입욕으로 이용할 수 있는 공용탕 범위가 확인됐습니다.',
    icon: CheckCircle,
  },
  {
    id: 'experience',
    label: '후기 기준',
    title: '반복 언급을 세어 도출한 판단',
    body: '직접 읽은 후기에서 같은 항목이 얼마나 반복됐는지 집계한 결과입니다. 판정에는 몇 건 중 몇 건인지 분모를 함께 표시합니다.',
    example: '온천 관련 234건 중 141건이 물의 매끈함을 언급합니다.',
    icon: ClipboardText,
  },
  {
    id: 'check',
    label: '이용 전 확인',
    title: '시기와 예약·입장 방식에 따라 달라지는 조건',
    body: '객실 타입, 입장 대상, 계절, 운영 시간처럼 예약·방문 시점에 달라질 수 있는 항목입니다. 막연한 주의 대신 무엇을 확인해야 하는지 함께 적습니다.',
    example: '대절탕 예약 방식과 당일입욕 마감 시간을 공식 안내에서 확인하세요.',
    icon: WarningCircle,
  },
] as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function OnsenMethodologyExperience({ totals, platforms }: { totals: MethodologyTotals; platforms: string[] }) {
  const [activeStep, setActiveStep] = useState(0);
  const [activeState, setActiveState] = useState<(typeof informationStates)[number]['id']>('confirmed');
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-method-step]'));
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-method-reveal]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stepObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActiveStep(Number((visible.target as HTMLElement).dataset.methodStep ?? 0));
      },
      { rootMargin: '-30% 0px -45% 0px', threshold: [0, 0.15, 0.4, 0.7] }
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    steps.forEach((step) => stepObserver.observe(step));
    reveals.forEach((item) => {
      if (reduceMotion) item.classList.add('is-visible');
      else revealObserver.observe(item);
    });

    let ticking = false;
    const updateProgress = () => {
      const page = document.documentElement;
      const distance = page.scrollHeight - page.clientHeight;
      const progress = distance > 0 ? Math.min(1, page.scrollTop / distance) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      ticking = false;
    };
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      stepObserver.disconnect();
      revealObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const selectedState = informationStates.find((state) => state.id === activeState) ?? informationStates[0];
  const SelectedStateIcon = selectedState.icon;

  return (
    <article className="onsen-method-page">
      <div className="onsen-method-scroll-progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>

      <header className="onsen-method-hero-v2">
        <Image
          className="onsen-method-hero-image"
          src="/images/onsen/regions/hakone.jpg"
          alt="산과 계곡 사이에 자리한 하코네 온천 마을"
          fill
          priority
          sizes="100vw"
        />
        <div className="onsen-method-hero-shade" aria-hidden="true" />
        <div className="onsen-method-hero-copy">
          <p className="onsen-method-label">바스타임의 확인 기준</p>
          <h1>인용하지 않고,<br />판정합니다.</h1>
          <p className="onsen-method-hero-lede">
            홍보 문구나 후기 원문을 옮기지 않습니다. 직접 읽고, 세고, 분류한 뒤 어떤 온천인지
            바스타임의 기준으로 정리합니다.
          </p>
          <dl className="onsen-method-hero-stats" aria-label="온천 판정 현황">
            <div>
              <dt>{formatNumber(totals.experiencesRead)}</dt>
              <dd>직접 읽은 후기</dd>
            </div>
            <div>
              <dt>{formatNumber(totals.publishedCount)}</dt>
              <dd>확인한 온천</dd>
            </div>
            <div>
              <dt>{formatNumber(totals.platformCount)}</dt>
              <dd>확인 표면</dd>
            </div>
          </dl>
        </div>
        <a className="onsen-method-scroll-cue" href="#method-intro" aria-label="판정 방법 읽기">
          <span>판정 방법 읽기</span>
          <ArrowDown size={18} weight="bold" aria-hidden="true" />
        </a>
      </header>

      <section className="onsen-method-intro-v2" id="method-intro">
        <div className="onsen-method-intro-copy" data-method-reveal>
          <p className="onsen-method-label">한 곳의 온천을 읽는 일</p>
          <h2>하나의 답으로 줄이기 전에,<br />서로 다른 장면을 오래 봅니다.</h2>
          <p>
            같은 지역 안에서도 온천수 방식과 탕의 위치, 계절에 따른 체감은 다릅니다. 바스타임은 분위기만으로
            묶지 않고, 예약이나 방문 전에 실제로 달라지는 조건을 따로 확인합니다.
          </p>
        </div>
        <div className="onsen-method-opening-gallery" data-method-reveal>
          <figure className="is-wide">
            <Image src="/images/onsen/regions/yufuin.jpg" alt="산 아래 자리한 유후인 온천 마을" fill sizes="(max-width: 740px) 92vw, 52vw" />
            <figcaption>유후인</figcaption>
          </figure>
          <figure>
            <Image src="/images/onsen/regions/noboribetsu.jpg" alt="눈 덮인 노보리베츠 지옥계곡" fill sizes="(max-width: 740px) 48vw, 24vw" />
            <figcaption>노보리베츠</figcaption>
          </figure>
          <figure className="is-lower">
            <Image src="/images/onsen/regions/kurokawa.jpg" alt="숲과 수로를 따라 이어지는 쿠로카와 온천 마을" fill sizes="(max-width: 740px) 48vw, 24vw" />
            <figcaption>쿠로카와</figcaption>
          </figure>
        </div>
      </section>

      <section className="onsen-method-process-v2" aria-labelledby="method-process-title">
        <div className="onsen-method-section-head" data-method-reveal>
          <p className="onsen-method-label">판정이 만들어지는 과정</p>
          <h2 id="method-process-title">읽은 것은 숫자가 되고,<br />숫자는 선택 기준이 됩니다.</h2>
          <p>오른쪽 내용을 따라 내려가면 사진과 판정 단계가 함께 바뀝니다.</p>
        </div>

        <div className="onsen-method-process-layout">
          <aside className="onsen-method-stage" aria-live="polite">
            <div className="onsen-method-stage-media">
              {processSteps.map((step, index) => (
                <Image
                  key={step.image}
                  className={index === activeStep ? 'is-active' : undefined}
                  src={step.image}
                  alt={index === activeStep ? step.alt : ''}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 900px) 100vw, 48vw"
                />
              ))}
            </div>
            <div className="onsen-method-stage-caption">
              <strong>{processSteps[activeStep].shortTitle}</strong>
              <span>판정 과정 예시</span>
              <div className="onsen-method-stage-dots" aria-hidden="true">
                {processSteps.map((step, index) => <i key={step.shortTitle} className={index === activeStep ? 'is-active' : undefined} />)}
              </div>
            </div>
          </aside>

          <ol className="onsen-method-process-steps">
            {processSteps.map((step, index) => (
              <li key={step.title} data-method-step={index}>
                <div className="onsen-method-step-icon" aria-hidden="true">
                  {index === 0 ? <MagnifyingGlass size={24} /> : null}
                  {index === 1 ? <ClipboardText size={24} /> : null}
                  {index === 2 ? <CheckCircle size={24} /> : null}
                  {index === 3 ? <SealCheck size={24} /> : null}
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <dl>
                  {step.rows.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="onsen-method-principles-v2" aria-labelledby="method-principles-title">
        <div className="onsen-method-section-head" data-method-reveal>
          <p className="onsen-method-label">판정의 원칙</p>
          <h2 id="method-principles-title">좋아 보이는 말보다,<br />다시 확인할 수 있는 근거를 남깁니다.</h2>
        </div>
        <div className="onsen-method-principle-list">
          <article data-method-reveal>
            <strong>원문은 옮기지 않습니다</strong>
            <p>외부 후기의 문장과 말투는 사용자 화면에 재게시하지 않습니다.</p>
          </article>
          <article data-method-reveal>
            <strong>부정 신호도 똑같이 셉니다</strong>
            <p>수온, 혼잡, 예약 혼선처럼 선택을 바꿀 수 있는 불편도 같은 기준으로 집계합니다.</p>
          </article>
          <article data-method-reveal>
            <strong>근거 없는 문장은 싣지 않습니다</strong>
            <p>카운트나 공식 확인으로 뒷받침되지 않는 표현은 판정문에서 제외합니다.</p>
          </article>
        </div>
        <div className="onsen-method-principle-gallery" data-method-reveal>
          <figure><Image src="/images/onsen/regions/ibusuki.jpg" alt="바다와 모래찜질 풍경이 보이는 이부스키" fill sizes="38vw" /></figure>
          <figure><Image src="/images/onsen/regions/tokachigawa.jpg" alt="넓은 평야의 도카치가와 온천 풍경" fill sizes="26vw" /></figure>
          <figure><Image src="/images/onsen/regions/jozankei.jpg" alt="계곡과 숲이 어우러진 조잔케이 풍경" fill sizes="34vw" /></figure>
        </div>
      </section>

      <section className="onsen-method-states-v2" aria-labelledby="method-states-title">
        <div className="onsen-method-states-image" data-method-reveal>
          <Image src="/images/onsen/regions/takeo.jpg" alt="숲과 전통 건물이 보이는 다케오 온천 풍경" fill sizes="(max-width: 900px) 100vw, 46vw" />
        </div>
        <div className="onsen-method-states-copy" data-method-reveal>
          <p className="onsen-method-label">정보 상태</p>
          <h2 id="method-states-title">같은 문장처럼 보여도,<br />근거의 성격은 다릅니다.</h2>
          <div className="onsen-method-state-tabs" role="tablist" aria-label="정보 상태 선택">
            {informationStates.map((state) => (
              <button
                key={state.id}
                type="button"
                role="tab"
                id={`method-tab-${state.id}`}
                aria-controls={`method-panel-${state.id}`}
                aria-selected={activeState === state.id}
                onClick={() => setActiveState(state.id)}
              >
                {state.label}
              </button>
            ))}
          </div>
          <div
            className="onsen-method-state-panel"
            id={`method-panel-${selectedState.id}`}
            role="tabpanel"
            aria-labelledby={`method-tab-${selectedState.id}`}
          >
            <SelectedStateIcon size={26} weight="regular" aria-hidden="true" />
            <h3>{selectedState.title}</h3>
            <p>{selectedState.body}</p>
            <blockquote>{selectedState.example}</blockquote>
          </div>
        </div>
      </section>

      <section className="onsen-method-sources-v2" aria-labelledby="method-sources-title">
        <div className="onsen-method-sources-copy" data-method-reveal>
          <p className="onsen-method-label">확인하는 표면</p>
          <h2 id="method-sources-title">어디를 읽었는지도<br />판정의 일부입니다.</h2>
          <p>
            공개적으로 확인 가능한 플랫폼과 공개 표면을 숙소·시설별로 나눠 읽습니다. 각 판정 페이지에는 직접 읽은 후기 수와
            확인한 플랫폼 수, 기준일을 함께 표시합니다.
          </p>
          <ol className="onsen-method-platform-list" aria-label="주요 확인 표면">
            {platforms.map((platform, index) => (
              <li key={platform}><span>{String(index + 1).padStart(2, '0')}</span>{platform}</li>
            ))}
          </ol>
        </div>
        <div className="onsen-method-sources-gallery" data-method-reveal>
          <figure>
            <Image src="/images/onsen/regions/fujiyoshida.jpg" alt="후지산 아래 온천 마을 풍경" fill sizes="(max-width: 900px) 92vw, 38vw" />
          </figure>
          <figure>
            <Image src="/images/onsen/regions/kawaguchiko.jpg" alt="호수와 후지산이 보이는 가와구치코 풍경" fill sizes="(max-width: 900px) 72vw, 28vw" />
          </figure>
          <p><strong>판정에는 기준일이 있습니다.</strong> 데이터가 갱신되면 판정도 함께 갱신됩니다.</p>
        </div>
      </section>

      <footer className="onsen-method-finale-v2">
        <Image src="/images/onsen/regions/kurokawa.jpg" alt="증기와 숲이 어우러진 쿠로카와 온천 마을" fill sizes="100vw" />
        <div className="onsen-method-finale-shade" aria-hidden="true" />
        <div className="onsen-method-finale-copy" data-method-reveal>
          <SealCheck size={34} weight="regular" aria-hidden="true" />
          <h2>읽고, 세고,<br />판정했습니다.</h2>
          <p>바스타임 판정이 붙은 온천은 이 과정을 통과했다는 뜻입니다.</p>
          <Link href="/onsen">
            온천 검색기로 돌아가기
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
