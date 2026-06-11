import type { Metadata } from 'next';
import Link from 'next/link';
import { BookmarkSimple, Compass, DeviceMobile, NotePencil, PaperPlaneTilt } from '@phosphor-icons/react/ssr';

export const metadata: Metadata = {
  title: '바스타임이란',
  description: '바스타임이 어떤 기준으로 씻고 쉬는 시간을 기록하고, 저장하고, 의식으로 이어가는지 소개합니다.',
};

const principles = [
  {
    title: '발견하기 쉽게',
    body: '사우나, 홈케어, 족욕, 욕실 아이템처럼 흩어져 있던 정보를 바스타임 관점으로 다시 정리합니다.',
    icon: Compass,
  },
  {
    title: '다시 찾기 쉽게',
    body: '한 번 읽고 지나가는 글이 아니라, 필요할 때 꺼내볼 수 있는 기록으로 남깁니다.',
    icon: BookmarkSimple,
  },
  {
    title: '실행하기 쉽게',
    body: '앱에서는 저장한 기록을 바탕으로 오늘 가능한 샤워, 족욕, 입욕 의식으로 이어갑니다.',
    icon: DeviceMobile,
  },
];

const archiveRules = [
  '실제 이용 가능 여부와 조건을 확인합니다.',
  '가격, 예약, 위치처럼 판단에 필요한 정보를 함께 봅니다.',
  '제품은 추천 순위보다 비교해볼 만한 후보로 다룹니다.',
  '과장된 효능보다 생활에서 써볼 수 있는 맥락을 우선합니다.',
];

export default function AboutPage() {
  return (
    <div className="page-stack about-page">
      <section className="about-hero">
        <div className="about-hero-visual">
          <img
            src="/images/about/bathtime-about-hero.jpg"
            alt="사우나 공간과 집 욕실 홈케어가 하나의 장면으로 이어진 바스타임 이미지"
            width={1280}
            height={702}
          />
        </div>
        <div className="about-hero-copy">
          <p className="kicker">ABOUT BATH TIME</p>
          <h1>바스타임은 씻고 쉬는 시간을 발견하고 저장하는 아카이브입니다.</h1>
          <p>
            사우나부터 홈케어까지, 오늘의 몸과 공간에 맞는 바스타임을 찾고 필요할 때 다시 꺼내 의식으로 이어갈 수 있게 기록합니다.
          </p>
          <div className="about-hero-actions">
            <Link className="button-primary" href="/explore">
              <Compass size={16} weight="bold" aria-hidden="true" />
              아카이브 보기
            </Link>
            <Link className="button-secondary" href="/submit">
              <PaperPlaneTilt size={16} weight="bold" aria-hidden="true" />
              좋은 공간 제보하기
            </Link>
          </div>
        </div>
      </section>

      <section className="about-statement">
        <div>
          <p className="kicker">CORE VALUE</p>
          <h2>씻는 시간을 의식으로.</h2>
        </div>
        <p>
          바스타임이 말하는 의식은 거창한 의례가 아닙니다. 매일 반복되는 샤워, 족욕, 입욕, 사우나의 시간을 조금 더 의도적으로 준비하고,
          몸과 마음을 전환하는 작은 회복의 방식입니다.
        </p>
      </section>

      <section className="section">
        <h2>바스타임이 하는 일</h2>
        <div className="about-principle-grid">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="about-principle-card">
                <span aria-hidden="true">
                  <Icon size={22} weight="bold" />
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-archive-section">
        <div className="about-archive-copy">
          <p className="kicker">ARCHIVE STANDARD</p>
          <h2>좋아 보이는 것에서 끝나지 않도록 기록합니다.</h2>
          <p>
            바스타임은 감상만 남기는 콘텐츠보다, 실제로 가볼 수 있는지, 내 욕실에서 해볼 수 있는지, 나중에 다시 참고할 수 있는지를
            더 중요하게 봅니다.
          </p>
        </div>
        <ul className="about-rule-list">
          {archiveRules.map((rule) => (
            <li key={rule}>
              <NotePencil size={17} weight="bold" aria-hidden="true" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
