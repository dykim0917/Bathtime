'use client';

import { ArrowDown, ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import styles from './OnsenLanding.module.css';

const scenes = [
  {
    label: '일본 온천을 고르는 새로운 기준',
    title: <>이번 여행엔,<br />온천이 목적이어도 좋으니까.</>,
    description: '숙소를 먼저 정하지 않아도 됩니다. 오래 머물고 싶은 탕의 순간부터 골라보세요.',
    linkLabel: '어떤 순간을 원하세요?',
    href: '#moments',
    image: '/images/about/bathtime-about-hero.jpg',
    imageAlt: '김이 오르는 조용한 실내 온천탕',
    controlLabel: '온천이 목적',
    alignment: 'left',
    imagePosition: 'center',
  },
  {
    label: '설경 속 프라이빗탕',
    title: <>눈이 내리는 동안,<br />아무것도 하지 않아도 좋으니까.</>,
    description: '하루의 계획을 비워두고, 눈과 김이 겹치는 시간을 오래 바라보세요.',
    linkLabel: '눈과 숲이 있는 온천',
    href: '#scenic-moment',
    image: '/images/onsen/discovery/snow-private-bath.jpg',
    imageAlt: '눈 덮인 숲속의 프라이빗 노천탕',
    controlLabel: '눈 내리는 탕',
    alignment: 'right',
    imagePosition: 'center 68%',
  },
  {
    label: '비와 숲의 온천',
    title: <>비가 오는 날엔,<br />탕이 여행의 장면이 됩니다.</>,
    description: '젖은 숲과 따뜻한 물 사이에서, 여행의 속도가 자연스럽게 느려집니다.',
    linkLabel: '조용한 노천탕 보기',
    href: '#scenic-moment',
    image: '/images/onsen/discovery/rain-forest-bath.jpg',
    imageAlt: '비 내리는 숲속의 따뜻한 노천탕',
    controlLabel: '비 오는 숲',
    alignment: 'left',
    imagePosition: 'center 74%',
  },
  {
    label: '온천마을을 걷는 여행',
    title: <>온천 하나를 위해,<br />마을을 고르는 여행.</>,
    description: '한 곳의 탕을 오래 기억하게 되면, 그 마을 전체가 여행의 목적지가 됩니다.',
    linkLabel: '지역별 온천 보기',
    href: '#regions',
    image: '/images/onsen/regions/kurokawa.jpg',
    imageAlt: '숲과 오래된 숙소가 이어지는 구로카와 온천마을',
    controlLabel: '온천마을',
    alignment: 'right',
    imagePosition: 'center 48%',
  },
  {
    label: '원천에서 시작하는 여행',
    title: <>물이 솟는 풍경까지,<br />여행이 됩니다.</>,
    description: '물이 어디서 시작되는지 알고 나면, 온천은 조금 다르게 보입니다.',
    linkLabel: '온천수 방식으로 찾기',
    href: '#water',
    image: '/images/onsen/regions/noboribetsu.jpg',
    imageAlt: '눈 덮인 계곡에서 수증기가 피어오르는 노보리베츠 원천 지대',
    controlLabel: '원천의 풍경',
    alignment: 'left',
    imagePosition: 'center',
  },
] as const;

export function OnsenDiscoveryHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<number | null>(null);

  const selectScene = (index: number) => {
    setActiveIndex((index + scenes.length) % scenes.length);
  };

  return (
    <section
      className={styles.heroCarousel}
      aria-label={`${scenes[activeIndex].controlLabel} 온천 여행 장면`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        selectScene(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }}
      onPointerDown={(event) => {
        pointerStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(distance) >= 48) selectScene(activeIndex + (distance < 0 ? 1 : -1));
      }}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
    >
      <div className={styles.heroSlides}>
        {scenes.map((scene, index) => {
          const selected = index === activeIndex;

          return (
            <article
              key={scene.controlLabel}
              className={`${styles.heroSlide}${selected ? ` ${styles.heroSlideActive}` : ''}`}
              aria-hidden={!selected}
            >
              <img src={scene.image} alt={scene.imageAlt} style={{ objectPosition: scene.imagePosition }} />
              <span className={styles.heroShade} aria-hidden="true" />
              <div className={`${styles.heroCopy}${scene.alignment === 'right' ? ` ${styles.heroCopyRight}` : ''}`}>
                <span className={styles.heroLabel}>{scene.label}</span>
                {index === 0 ? <h1>{scene.title}</h1> : <h2>{scene.title}</h2>}
                <p>{scene.description}</p>
                <a href={scene.href} tabIndex={selected ? 0 : -1}>
                  {scene.linkLabel} <ArrowDown size={16} weight="bold" aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <button className={`${styles.heroArrow} ${styles.heroArrowPrevious}`} type="button" aria-label="이전 장면" onClick={() => selectScene(activeIndex - 1)}>
        <ArrowLeft size={20} aria-hidden="true" />
      </button>
      <button className={`${styles.heroArrow} ${styles.heroArrowNext}`} type="button" aria-label="다음 장면" onClick={() => selectScene(activeIndex + 1)}>
        <ArrowRight size={20} aria-hidden="true" />
      </button>

      <nav className={styles.heroControls} aria-label="온천 여행 장면 선택">
        {scenes.map((scene, index) => (
          <button
            key={scene.controlLabel}
            type="button"
            aria-label={`${scene.controlLabel} 장면`}
            title={scene.controlLabel}
            aria-pressed={index === activeIndex}
            onClick={() => selectScene(index)}
            onKeyDown={(event) => {
              let nextIndex = index;
              if (event.key === 'ArrowRight') nextIndex = (index + 1) % scenes.length;
              if (event.key === 'ArrowLeft') nextIndex = (index - 1 + scenes.length) % scenes.length;
              if (event.key === 'Home') nextIndex = 0;
              if (event.key === 'End') nextIndex = scenes.length - 1;
              if (nextIndex === index) return;
              event.preventDefault();
              selectScene(nextIndex);
              event.currentTarget.parentElement?.querySelectorAll('button')[nextIndex]?.focus();
            }}
          >
            <span>{scene.controlLabel}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
