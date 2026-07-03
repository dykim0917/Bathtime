'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle, PencilSimpleLine, X } from '@phosphor-icons/react';
import {
  AuthRequiredError,
  type OnsenReviewBathType,
  type OnsenReviewWaterFeel,
  redirectToLogin,
  saveOnsenReview,
} from '@web/lib/userContent';
import type { OnsenReview } from '@web/lib/onsenReviews';

const bathTypeOptions: { value: OnsenReviewBathType; label: string }[] = [
  { value: 'room_bath', label: '객실탕' },
  { value: 'private_bath', label: '가족탕/대절탕' },
  { value: 'public_bath', label: '대욕장' },
  { value: 'other', label: '그 외' },
];

const waterFeelOptions: { value: OnsenReviewWaterFeel; label: string }[] = [
  { value: 'soft', label: '부드러웠어요' },
  { value: 'strong', label: '온천감이 뚜렷했어요' },
  { value: 'clear', label: '깔끔했어요' },
  { value: 'unclear', label: '잘 모르겠어요' },
];

const bathTypeLabels: Record<OnsenReview['bathType'], string> = {
  room_bath: '객실탕',
  private_bath: '가족탕/대절탕',
  public_bath: '대욕장',
  other: '그 외',
};

const waterFeelLabels: Record<OnsenReview['waterFeel'], string> = {
  clear: '깔끔한 물 느낌',
  soft: '부드러운 물 느낌',
  strong: '온천감 뚜렷함',
  unclear: '체감 미확인',
};

export function OnsenReviewForm({
  accommodationSlug,
  accommodationName,
  reviewCount,
  reviews = [],
}: {
  accommodationSlug: string;
  accommodationName: string;
  reviewCount: number;
  reviews?: OnsenReview[];
}) {
  const [open, setOpen] = useState(false);
  const [bathType, setBathType] = useState<OnsenReviewBathType>('room_bath');
  const [waterFeel, setWaterFeel] = useState<OnsenReviewWaterFeel>('soft');
  const [visitSeason, setVisitSeason] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setError('');

    try {
      await saveOnsenReview({
        accommodationSlug,
        bathType,
        waterFeel,
        visitSeason,
        body,
      });
      setBody('');
      setVisitSeason('');
      setStatus('submitted');
      setOpen(false);
    } catch (submitError) {
      if (submitError instanceof AuthRequiredError) {
        redirectToLogin('onsen_review');
        return;
      }
      console.error('Failed to submit onsen review', submitError);
      setError('리뷰 저장에 실패했어요. 잠시 후 다시 시도해주세요.');
      setStatus('error');
    }
  }

  return (
    <section className="onsen-review-box" aria-labelledby="onsen-review-title">
      <div className="onsen-review-panel-head">
        <div>
          <span className="onsen-filter-label">바스타임 리뷰</span>
          <div className="onsen-review-title-row">
            <h2 id="onsen-review-title">온천 리뷰</h2>
            <span>{reviewCount}</span>
          </div>
        </div>
        <button className="onsen-review-open-button" type="button" onClick={() => setOpen(true)}>
          <PencilSimpleLine size={17} weight="bold" aria-hidden="true" />
          리뷰 쓰기
        </button>
      </div>

      <div className="onsen-review-list">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            const isSample = review.body.startsWith('[샘플]');
            const body = isSample ? review.body.replace(/^\[샘플\]\s*/, '') : review.body;

            return (
              <article className="onsen-review-card" key={review.id}>
                <div className="onsen-review-card-meta">
                  {isSample ? <span data-tone="sample">샘플</span> : null}
                  <span>{bathTypeLabels[review.bathType]}</span>
                  <span>{waterFeelLabels[review.waterFeel]}</span>
                  {review.visitSeason ? <span>{review.visitSeason}</span> : null}
                </div>
                <p>{body}</p>
              </article>
            );
          })
        ) : (
          <p>아직 등록된 리뷰가 없습니다. 이 온천을 다녀왔다면 첫 리뷰를 남겨주세요.</p>
        )}
      </div>

      {status === 'submitted' ? (
        <p className="onsen-review-status">
          <CheckCircle size={16} weight="fill" aria-hidden="true" />
          리뷰를 받았어요. 검수 후 반영할게요.
        </p>
      ) : null}

      {open ? (
        <div className="onsen-review-modal-backdrop" role="presentation">
          <div className="onsen-review-modal" role="dialog" aria-modal="true" aria-labelledby="onsen-review-modal-title">
            <div className="onsen-review-modal-head">
              <div>
                <span className="onsen-filter-label">바스타임 리뷰</span>
                <h3 id="onsen-review-modal-title">{accommodationName} 온천 리뷰 쓰기</h3>
              </div>
              <button type="button" aria-label="리뷰 작성 닫기" onClick={() => setOpen(false)}>
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <form className="onsen-review-form" onSubmit={submitReview}>
              <div className="onsen-review-choice-grid">
                <label>
                  이용한 탕
                  <select value={bathType} onChange={(event) => setBathType(event.target.value as OnsenReviewBathType)}>
                    {bathTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  온천수 체감
                  <select value={waterFeel} onChange={(event) => setWaterFeel(event.target.value as OnsenReviewWaterFeel)}>
                    {waterFeelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  방문 시기
                  <input value={visitSeason} onChange={(event) => setVisitSeason(event.target.value)} placeholder="예: 2026년 겨울, 5월 평일" />
                </label>
              </div>

              <label>
                온천 중심 리뷰
                <textarea
                  required
                  minLength={12}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="탕의 온도, 물 느낌, 객실탕과 대욕장 차이, 다음 사람이 알면 좋을 점을 적어주세요."
                />
              </label>

              <div className="onsen-review-actions">
                <button type="submit" disabled={status === 'submitting' || body.trim().length < 12}>
                  <PencilSimpleLine size={17} weight="bold" aria-hidden="true" />
                  리뷰 남기기
                </button>
                {error ? <p className="onsen-review-error">{error}</p> : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
