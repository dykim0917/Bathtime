'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Bed, ChatCircleDots, MapTrifold, Package, Sparkle, type Icon } from '@phosphor-icons/react';
import type { Submission } from '@/src/archive/types';
import { getSupabaseClient } from '@web/lib/auth';
import { AuthRequiredError, redirectToLogin, saveSubmission } from '@web/lib/userContent';

type SubmissionType = Submission['type'];

const submissionTypes: Array<{ value: SubmissionType; label: string; icon: Icon }> = [
  { value: 'sauna_spa', label: '목욕 공간', icon: MapTrifold },
  { value: 'bathtub_stay', label: '욕조 숙소', icon: Bed },
  { value: 'home_spa', label: '홈스파 루틴', icon: Sparkle },
  { value: 'item', label: '욕실 아이템', icon: Package },
  { value: 'topic', label: '다뤘으면 하는 주제', icon: ChatCircleDots },
];

export function SubmitForm() {
  const [type, setType] = useState<SubmissionType>('sauna_spa');
  const [linkOrImage, setLinkOrImage] = useState('');
  const [comment, setComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [canPublish, setCanPublish] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setIsSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setIsSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedComment = comment.trim();
    if (trimmedComment.length < 5) {
      setStatus('error');
      setMessage('제보 내용을 조금만 더 적어주세요.');
      return;
    }

    setStatus('submitting');
    setMessage('');
    try {
      await saveSubmission({
        type,
        linkOrImage: linkOrImage.trim() || undefined,
        comment: trimmedComment,
        nickname: nickname.trim() || undefined,
        canPublish,
      });
      setStatus('success');
      setMessage('제보가 접수됐어요. 확인 후 아카이브에 반영할게요.');
      setLinkOrImage('');
      setComment('');
      setNickname('');
      setCanPublish(false);
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        redirectToLogin('submit');
        return;
      }
      setStatus('error');
      setMessage('제보를 저장하지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  }

  return (
    <form className="submit-form body-panel" onSubmit={onSubmit}>
      <div className="submit-form-heading">
        <h2>제보 남기기</h2>
        <p>필수 입력은 제보 내용 하나예요. 이름이나 링크는 알고 있는 만큼만 적어도 됩니다.</p>
      </div>

      {!isSignedIn ? (
        <p className="auth-note">제보는 로그인 후 계정에 연결됩니다. 제출하면 Google 로그인으로 이동합니다.</p>
      ) : null}

      <fieldset className="submit-type-field">
        <legend>제보 유형</legend>
        <div className="submit-type-grid">
          {submissionTypes.map((item) => {
            const active = type === item.value;
            const TypeIcon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                className={active ? 'active' : undefined}
                aria-pressed={active}
                onClick={() => setType(item.value)}
              >
                <TypeIcon size={16} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label>
        <span>이름 또는 링크</span>
        <input
          value={linkOrImage}
          onChange={(event) => setLinkOrImage(event.target.value)}
          placeholder="공간명, 제품명, 공식 페이지나 지도 링크"
        />
      </label>

      <label>
        <span>제보 내용</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="직접 경험인지, 공개 정보인지, 어떤 점이 좋았는지 알려주세요."
          rows={7}
          required
        />
      </label>

      <label>
        <span>닉네임</span>
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="선택 사항"
        />
      </label>

      <label className="checkbox-row">
        <input type="checkbox" checked={canPublish} onChange={(event) => setCanPublish(event.target.checked)} />
        <span>제보 내용을 바스타임 콘텐츠에 참고하거나 일부 인용해도 괜찮아요.</span>
      </label>

      {message ? <p className={status === 'error' ? 'auth-warning' : 'auth-note'}>{message}</p> : null}

      <button className="button-primary" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? '제보 저장 중' : '제보 보내기'}
      </button>
    </form>
  );
}
