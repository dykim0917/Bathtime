'use client';

import { ArrowLeft, ArrowRight, ImagesSquare } from '@phosphor-icons/react';
import { useState } from 'react';
import styles from './page.module.css';

export type OnsenDetailGalleryItem = {
  src?: string;
  alt?: string;
  label: string;
};

type OnsenDetailGalleryProps = {
  name: string;
  items: OnsenDetailGalleryItem[];
};

export function OnsenDetailGallery({ name, items }: OnsenDetailGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = items[currentIndex] ?? items[0];
  const hasMultipleItems = items.length > 1;

  const move = (direction: -1 | 1) => {
    setCurrentIndex((index) => (index + direction + items.length) % items.length);
  };

  return (
    <section className={styles.gallery} aria-label={`${name} 사진 갤러리`}>
      <div className={styles.galleryMain}>
        <figure key={`${currentIndex}-${currentItem?.src ?? 'placeholder'}`} className={styles.galleryFigure}>
          {currentItem?.src ? (
            <img className={styles.galleryImage} src={currentItem.src} alt={currentItem.alt ?? `${name} 사진 ${currentIndex + 1}`} />
          ) : (
            <div className={styles.galleryPlaceholder}>
              <ImagesSquare size={32} weight="bold" aria-hidden="true" />
              <strong>사진 준비 중</strong>
            </div>
          )}
        </figure>

        {hasMultipleItems ? (
          <>
            <button
              className={styles.galleryArrow}
              data-direction="previous"
              type="button"
              aria-label="이전 사진"
              title="이전 사진"
              onClick={() => move(-1)}
            >
              <ArrowLeft size={18} weight="bold" aria-hidden="true" />
            </button>
            <button
              className={styles.galleryArrow}
              data-direction="next"
              type="button"
              aria-label="다음 사진"
              title="다음 사진"
              onClick={() => move(1)}
            >
              <ArrowRight size={18} weight="bold" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <span className={styles.galleryCounter} aria-live="polite">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {hasMultipleItems ? (
        <div className={styles.thumbnailRail} aria-label="사진 선택">
          {items.map((item, index) => (
            <button
              key={`${item.src ?? 'placeholder'}-${index}`}
              className={styles.thumbnail}
              type="button"
              aria-label={`${index + 1}번째 사진 보기`}
              aria-current={index === currentIndex ? 'true' : undefined}
              onClick={() => setCurrentIndex(index)}
            >
              {item.src ? (
                <img src={item.src} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
              ) : (
                <span className={styles.thumbnailPlaceholder}>
                  <ImagesSquare size={18} weight="bold" aria-hidden="true" />
                </span>
              )}
              <small>{String(index + 1).padStart(2, '0')}</small>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
