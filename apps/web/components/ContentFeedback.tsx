'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Heart, WarningCircle } from '@phosphor-icons/react';
import {
  type ContentFeedbackReason,
  type ContentFeedbackType,
  removeContentFeedback,
  saveContentFeedback,
} from '@web/lib/userContent';

const reasonOptions: { value: ContentFeedbackReason; label: string }[] = [
  { value: 'missing_info', label: '정보가 부족해요' },
  { value: 'needs_images', label: '사진이 더 필요해요' },
  { value: 'conditions_unclear', label: '이용 조건이 궁금해요' },
  { value: 'needs_more_candidates', label: '후보가 더 필요해요' },
  { value: 'tone_unclear', label: '문장이 잘 안 와닿아요' },
  { value: 'other', label: '다른 점이 아쉬워요' },
];

function storageKey(contentId: string): string {
  return `bathtime:content-feedback:${contentId}`;
}

function getStoredFeedback(contentId: string): ContentFeedbackType | null {
  try {
    const value = window.localStorage.getItem(storageKey(contentId));
    return value === 'helpful' || value === 'needs_improvement' ? value : null;
  } catch {
    return null;
  }
}

function setStoredFeedback(contentId: string, type: ContentFeedbackType): void {
  try {
    window.localStorage.setItem(storageKey(contentId), type);
  } catch {
    // localStorage can be unavailable in private browsing. The server-side record is enough.
  }
}

function clearStoredFeedback(contentId: string): void {
  try {
    window.localStorage.removeItem(storageKey(contentId));
  } catch {
    // localStorage can be unavailable in private browsing. The server-side record is enough.
  }
}

export function ContentFeedback({ contentId }: { contentId: string }) {
  const [selectedType, setSelectedType] = useState<ContentFeedbackType | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedType(getStoredFeedback(contentId));
  }, [contentId]);

  const statusText = useMemo(() => {
    if (selectedType === 'helpful') return '도움이 됐다는 의견을 남겼어요.';
    if (selectedType === 'needs_improvement') return '아쉬운 점을 남겼어요. 다음 보강에 참고할게요.';
    return null;
  }, [selectedType]);

  async function submit(type: ContentFeedbackType, reason?: ContentFeedbackReason) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (selectedType && selectedType !== type) {
        await removeContentFeedback(contentId);
      }
      await saveContentFeedback({ contentId, type, reason });
      setStoredFeedback(contentId, type);
      setSelectedType(type);
      setReasonOpen(false);
    } catch (submitError) {
      console.error('Failed to submit content feedback', submitError);
      setError('의견 저장에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelFeedback() {
    if (!selectedType || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await removeContentFeedback(contentId);
      clearStoredFeedback(contentId);
      setSelectedType(null);
      setReasonOpen(false);
    } catch (removeError) {
      console.error('Failed to remove content feedback', removeError);
      setError('의견 취소에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="content-feedback" aria-labelledby="content-feedback-title">
      <div>
        <p className="kicker">FEEDBACK</p>
        <h2 id="content-feedback-title">이 기록이 도움이 되었나요?</h2>
        <p>남겨주신 반응은 다음 기록을 보강할 때만 참고합니다.</p>
      </div>

      <div className="content-feedback-actions">
        <button
          type="button"
          className={selectedType === 'helpful' ? 'selected' : ''}
          disabled={submitting}
          aria-pressed={selectedType === 'helpful'}
          onClick={() => {
            if (selectedType === 'helpful') {
              void cancelFeedback();
              return;
            }
            void submit('helpful');
          }}
        >
          <Heart className="content-feedback-heart" size={17} weight={selectedType === 'helpful' ? 'fill' : 'regular'} aria-hidden="true" />
          도움이 됐어요
        </button>
        <button
          type="button"
          className={selectedType === 'needs_improvement' ? 'selected' : ''}
          disabled={submitting}
          aria-pressed={selectedType === 'needs_improvement'}
          onClick={() => {
            if (selectedType === 'needs_improvement') {
              void cancelFeedback();
              return;
            }
            setReasonOpen((open) => !open);
          }}
        >
          <WarningCircle size={17} weight={selectedType === 'needs_improvement' ? 'fill' : 'regular'} aria-hidden="true" />
          조금 아쉬워요
        </button>
      </div>

      {reasonOpen && selectedType !== 'needs_improvement' ? (
        <div className="content-feedback-reasons" aria-label="아쉬운 이유">
          {reasonOptions.map((reason) => (
            <button
              key={reason.value}
              type="button"
              disabled={submitting}
              onClick={() => void submit('needs_improvement', reason.value)}
            >
              {reason.label}
            </button>
          ))}
        </div>
      ) : null}

      {statusText ? (
        <p className="content-feedback-status">
          <CheckCircle size={16} weight="fill" aria-hidden="true" />
          {statusText}
        </p>
      ) : null}
      {error ? <p className="content-feedback-error">{error}</p> : null}
    </section>
  );
}
