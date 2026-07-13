'use client';

import { ArrowDown, ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import type { BathtimeLocale } from '@web/lib/i18n';
import styles from './OnsenLanding.module.css';

const scenesKo = [
  {
    label: '일본 온천을 고르는 새로운 기준',
    title: <>이번 여행엔,<br />온천이 목적이어도 좋으니까.</>,
    description: '숙소를 먼저 정하지 않아도 됩니다. 오래 머물고 싶은 탕의 순간부터 골라보세요.',
    linkLabel: '어떤 순간을 원하세요?',
    href: '#moments',
    image: '/images/onsen/discovery/hero-onsen-purpose.jpg',
    imageAlt: '가을 숲을 마주한 조용한 노천탕',
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
    image: '/images/onsen/discovery/hero-snow-private.jpg',
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
    image: '/images/onsen/discovery/hero-rain-forest.jpg',
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
    image: '/images/onsen/discovery/hero-onsen-town.jpg',
    imageAlt: '숲과 오래된 숙소가 개울을 따라 이어지는 온천마을',
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
    image: '/images/onsen/discovery/hero-geothermal-source.jpg',
    imageAlt: '눈 덮인 화산 계곡에서 수증기가 피어오르는 원천 지대',
    controlLabel: '원천의 풍경',
    alignment: 'left',
    imagePosition: 'center',
  },
] as const;

const scenesEn = [
  {
    label: 'A new way to choose onsen in Japan',
    title: <>This trip,<br />let the onsen be the destination.</>,
    description: 'You do not have to choose a hotel first. Start with the kind of bathing moment you want to stay in.',
    linkLabel: 'What kind of moment do you want?',
    href: '#moments',
    image: '/images/onsen/discovery/hero-onsen-purpose.jpg',
    imageAlt: 'A quiet open-air onsen facing an autumn forest',
    controlLabel: 'Onsen as the destination',
    alignment: 'left',
    imagePosition: 'center',
  },
  {
    label: 'A private bath in the snow',
    title: <>While the snow falls,<br />it is enough to do nothing.</>,
    description: 'Leave the day unplanned and stay with the moment where snow and steam meet.',
    linkLabel: 'Find onsen with snow and forest views',
    href: '#scenic-moment',
    image: '/images/onsen/discovery/hero-snow-private.jpg',
    imageAlt: 'A private open-air onsen in a snowy cedar forest',
    controlLabel: 'Bathing in snowfall',
    alignment: 'right',
    imagePosition: 'center 68%',
  },
  {
    label: 'Rain, forest, and warm water',
    title: <>On a rainy day,<br />the bath becomes the journey.</>,
    description: 'Between the wet forest and warm water, the pace of the trip naturally slows.',
    linkLabel: 'Find quiet open-air baths',
    href: '#scenic-moment',
    image: '/images/onsen/discovery/hero-rain-forest.jpg',
    imageAlt: 'A warm open-air onsen in a rain-soaked forest',
    controlLabel: 'A rainy forest bath',
    alignment: 'left',
    imagePosition: 'center 74%',
  },
  {
    label: 'A journey through an onsen town',
    title: <>Choose the whole town<br />for a single onsen.</>,
    description: 'When one bath stays with you, the town around it becomes part of the destination.',
    linkLabel: 'Browse by onsen area',
    href: '#regions',
    image: '/images/onsen/discovery/hero-onsen-town.jpg',
    imageAlt: 'Traditional ryokan lining a stream in a mountain onsen town',
    controlLabel: 'An onsen town',
    alignment: 'right',
    imagePosition: 'center 48%',
  },
  {
    label: 'Where the water begins',
    title: <>Even the source of the water<br />can become the journey.</>,
    description: 'Once you know where the water begins, the onsen starts to look different.',
    linkLabel: 'Search by water system',
    href: '#water',
    image: '/images/onsen/discovery/hero-geothermal-source.jpg',
    imageAlt: 'Steam rising from a snowy volcanic hot spring valley',
    controlLabel: 'The geothermal source',
    alignment: 'left',
    imagePosition: 'center',
  },
] as const;

export function OnsenDiscoveryHero({ locale = 'ko' }: { locale?: BathtimeLocale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const scenes = locale === 'en' ? scenesEn : scenesKo;

  const selectScene = (index: number) => {
    setActiveIndex((index + scenes.length) % scenes.length);
  };

  return (
    <section
      className={styles.heroCarousel}
      aria-label={locale === 'en' ? `${scenes[activeIndex].controlLabel} travel scene` : `${scenes[activeIndex].controlLabel} 온천 여행 장면`}
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

      <button className={`${styles.heroArrow} ${styles.heroArrowPrevious}`} type="button" aria-label={locale === 'en' ? 'Previous scene' : '이전 장면'} onClick={() => selectScene(activeIndex - 1)}>
        <ArrowLeft size={20} aria-hidden="true" />
      </button>
      <button className={`${styles.heroArrow} ${styles.heroArrowNext}`} type="button" aria-label={locale === 'en' ? 'Next scene' : '다음 장면'} onClick={() => selectScene(activeIndex + 1)}>
        <ArrowRight size={20} aria-hidden="true" />
      </button>

      <nav className={styles.heroControls} aria-label={locale === 'en' ? 'Choose an onsen travel scene' : '온천 여행 장면 선택'}>
        {scenes.map((scene, index) => (
          <button
            key={scene.controlLabel}
            type="button"
            aria-label={locale === 'en' ? scene.controlLabel : `${scene.controlLabel} 장면`}
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
