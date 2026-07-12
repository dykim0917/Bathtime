import { ChatCircleText, ShieldCheck } from '@phosphor-icons/react/ssr';
import {
  waterTextureLabels,
  type OnsenReviewTargetType,
} from '@web/lib/onsenPassport';
import type { OnsenReview, OnsenReviewAggregate } from '@web/lib/onsenReviews';
import { OnsenReviewCard } from './OnsenReviewCard';
import { OnsenReviewDrawerButton } from './OnsenReviewDrawerButton';
import { OnsenReviewOpenButton } from './OnsenReviewOpenButton';
import styles from './OnsenReviewSection.module.css';

export function OnsenReviewSection({
  reviewCount,
  reviews,
  aggregate,
}: {
  targetType: OnsenReviewTargetType;
  reviewCount: number;
  reviews: OnsenReview[];
  aggregate: OnsenReviewAggregate;
}) {
  const topTexture = aggregate.topTexture && aggregate.topTexture.count >= 2 ? aggregate.topTexture : null;

  return (
    <section id="onsen-user-reviews" className={styles.section} aria-labelledby="onsen-user-reviews-title">
      <header className={styles.header}>
        <div>
          <span>회원 후기</span>
          <h2 id="onsen-user-reviews-title">온천 이용 후기 <em>{reviewCount}</em></h2>
          <p>물의 감촉과 방문 당시의 이용 환경을 회원이 기록한 후기입니다.</p>
        </div>
        <OnsenReviewOpenButton className={styles.writeButton} />
      </header>

      {aggregate.hasEnoughData ? (
        <div className={styles.signals} aria-label="회원 후기 요약">
          <div><strong>{aggregate.total}</strong><span>등록된 후기</span></div>
          <div><strong>{aggregate.calmCount}</strong><span>한산·여유 응답</span></div>
          <div>
            <strong>{aggregate.revisitPositiveCount}/{aggregate.revisitResponseCount}</strong>
            <span>재방문 의사 있음</span>
          </div>
          {topTexture ? <p><ChatCircleText size={18} weight="duotone" aria-hidden="true" />후기 {topTexture.count}건에서 <strong>{waterTextureLabels[topTexture.value]}</strong> 감촉이 공통으로 선택됐습니다.</p> : null}
        </div>
      ) : (
        <div className={styles.earlySignal}>
          <ChatCircleText size={20} weight="duotone" aria-hidden="true" />
          <p>후기 3건 이상부터 반복된 물의 감촉과 이용 환경을 집계합니다.</p>
        </div>
      )}

      {reviews.length > 0 ? (
        <div className={styles.previewBlock}>
          <div className={styles.previewHead}>
            <strong>최근 후기</strong>
            <OnsenReviewDrawerButton reviewCount={reviewCount} className={styles.allButton} />
          </div>
          <div className={styles.list}>{reviews.map((review) => <OnsenReviewCard key={review.id} review={review} />)}</div>
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.empty}>
            <strong>아직 공개된 후기가 없습니다</strong>
            <p>첫 후기는 온천여권에 저장되며, 공개 여부는 직접 선택할 수 있습니다.</p>
          </div>
        </div>
      )}

      <footer className={styles.note}>
        <ShieldCheck size={18} weight="duotone" aria-hidden="true" />
        <p><strong>회원 후기는 공식 정보와 별도로 집계합니다.</strong> 직수·순환식 같은 온천수 방식 판정에는 반영하지 않습니다.</p>
      </footer>
    </section>
  );
}
