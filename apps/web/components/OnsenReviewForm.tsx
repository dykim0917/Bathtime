'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bathtub,
  BookOpenText,
  CalendarBlank,
  CheckCircle,
  Drop,
  PencilSimpleLine,
  Sparkle,
  Thermometer,
  Users,
  X,
} from '@phosphor-icons/react';
import { AuthRequiredError, redirectToLogin, saveOnsenReview } from '@web/lib/userContent';
import {
  bathAreaLabels,
  cleanlinessLabels,
  crowdingLabels,
  revisitLabels,
  temperatureLabels,
  waterColorLabels,
  waterTextureLabels,
  type OnsenPassportEntry,
  type OnsenReviewBathArea,
  type OnsenReviewCleanliness,
  type OnsenReviewCrowding,
  type OnsenReviewRevisitIntent,
  type OnsenReviewTargetType,
  type OnsenReviewTemperature,
  type OnsenReviewWaterColor,
  type OnsenReviewWaterTexture,
} from '@web/lib/onsenPassport';
import type { OnsenReview } from '@web/lib/onsenReviews';

const bathAreaOptions: OnsenReviewBathArea[] = [
  'room_bath',
  'private_bath',
  'public_bath',
  'open_air_public_bath',
  'family_bath',
  'sand_bath',
  'steam_bath',
  'sauna',
  'stone_sauna',
  'other',
];
const waterTextureOptions: OnsenReviewWaterTexture[] = ['slippery', 'soft', 'distinctive', 'neutral', 'dry', 'unclear'];
const waterColorOptions: OnsenReviewWaterColor[] = ['clear', 'white', 'brown', 'green', 'other', 'unclear'];
const temperatureOptions: OnsenReviewTemperature[] = ['cool', 'lukewarm', 'comfortable', 'hot', 'mixed', 'unclear'];
const crowdingOptions: OnsenReviewCrowding[] = ['quiet', 'comfortable', 'busy', 'packed', 'unclear'];
const cleanlinessOptions: OnsenReviewCleanliness[] = ['good', 'neutral', 'concern', 'unclear'];
const revisitOptions: OnsenReviewRevisitIntent[] = ['yes', 'maybe', 'no', 'unsure'];
const stepLabels = ['방문', '온천수', '이용 경험'];

function formatLocalDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ChoiceButton({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button className="onsen-review-choice" type="button" aria-pressed={selected} data-selected={selected} onClick={onClick}>
      <span aria-hidden="true" />
      {label}
    </button>
  );
}

export function OnsenReviewForm({
  targetType = 'accommodation',
  targetSlug,
  targetName,
  reviewCount,
  reviews = [],
}: {
  targetType?: OnsenReviewTargetType;
  targetSlug: string;
  targetName: string;
  reviewCount: number;
  reviews?: OnsenReview[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [bathAreas, setBathAreas] = useState<OnsenReviewBathArea[]>([]);
  const [visitedOn, setVisitedOn] = useState('');
  const [waterTexture, setWaterTexture] = useState<OnsenReviewWaterTexture[]>([]);
  const [waterColor, setWaterColor] = useState<OnsenReviewWaterColor | null>(null);
  const [temperatureExperience, setTemperatureExperience] = useState<OnsenReviewTemperature | null>(null);
  const [crowdingLevel, setCrowdingLevel] = useState<OnsenReviewCrowding | null>(null);
  const [cleanlinessLevel, setCleanlinessLevel] = useState<OnsenReviewCleanliness | null>(null);
  const [revisitIntent, setRevisitIntent] = useState<OnsenReviewRevisitIntent | null>(null);
  const [cautionText, setCautionText] = useState('');
  const [body, setBody] = useState('');
  const [savedEntry, setSavedEntry] = useState<OnsenPassportEntry | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [error, setError] = useState('');
  const [today, setToday] = useState('');
  const availableBathAreas = targetType === 'facility'
    ? bathAreaOptions.filter((value) => value !== 'room_bath')
    : bathAreaOptions;

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && status !== 'submitting') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('bt-modal-open');
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('bt-modal-open');
    };
  }, [open, status]);

  useEffect(() => {
    setToday(formatLocalDateInput(new Date()));
  }, []);

  const canContinue = step === 0
    ? bathAreas.length > 0
    : step === 1
      ? waterTexture.length > 0 && waterColor !== null && temperatureExperience !== null
      : crowdingLevel !== null && cleanlinessLevel !== null && revisitIntent !== null && body.trim().length >= 12;

  function toggleBathArea(value: OnsenReviewBathArea) {
    setBathAreas((current) => {
      if (value === 'other') return current.includes('other') ? [] : ['other'];
      const withoutOther = current.filter((item) => item !== 'other');
      return withoutOther.includes(value) ? withoutOther.filter((item) => item !== value) : [...withoutOther, value];
    });
  }

  function toggleWaterTexture(value: OnsenReviewWaterTexture) {
    setWaterTexture((current) => {
      if (value === 'unclear') return current.includes('unclear') ? [] : ['unclear'];
      const withoutUnclear = current.filter((item) => item !== 'unclear');
      if (withoutUnclear.includes(value)) return withoutUnclear.filter((item) => item !== value);
      return withoutUnclear.length >= 2 ? withoutUnclear : [...withoutUnclear, value];
    });
  }

  function openReviewForm() {
    if (status === 'submitted') {
      setStep(0);
      setBathAreas([]);
      setVisitedOn('');
      setWaterTexture([]);
      setWaterColor(null);
      setTemperatureExperience(null);
      setCrowdingLevel(null);
      setCleanlinessLevel(null);
      setRevisitIntent(null);
      setCautionText('');
      setBody('');
      setSavedEntry(null);
      setStatus('idle');
      setError('');
    }
    setOpen(true);
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting' || !canContinue || !waterColor || !temperatureExperience || !crowdingLevel || !cleanlinessLevel || !revisitIntent) return;

    setStatus('submitting');
    setError('');
    try {
      const entry = await saveOnsenReview({
        targetType,
        targetSlug,
        targetName,
        bathAreas,
        visitedOn,
        waterTexture,
        waterColor,
        temperatureExperience,
        crowdingLevel,
        cleanlinessLevel,
        revisitIntent,
        cautionText,
        body,
      });
      setSavedEntry(entry);
      setStatus('submitted');
    } catch (submitError) {
      if (submitError instanceof AuthRequiredError) {
        redirectToLogin('onsen_review');
        return;
      }
      console.error('Failed to submit onsen review', submitError);
      setError('기록을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.');
      setStatus('error');
    }
  }

  return (
    <section className="onsen-review-box" aria-labelledby="onsen-review-title">
      <div className="onsen-review-panel-head">
        <div>
          <span className="onsen-filter-label">바스타임 자체 리뷰</span>
          <div className="onsen-review-title-row">
            <h2 id="onsen-review-title">다녀온 기록</h2>
            <span>{reviewCount}</span>
          </div>
        </div>
        <button className="onsen-review-open-button" type="button" onClick={openReviewForm}>
          <PencilSimpleLine size={17} weight="bold" aria-hidden="true" />
          기록하기
        </button>
      </div>

      <div className="onsen-review-benefit">
        <BookOpenText size={22} weight="duotone" aria-hidden="true" />
        <div>
          <strong>리뷰가 내 온천여권에 남습니다</strong>
          <p>물의 감촉과 이용 경험이 쌓이면 내 취향을 더 정확히 알 수 있습니다.</p>
        </div>
        <Link href="/passport">온천여권 보기</Link>
      </div>

      <div className="onsen-review-list">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            const isSample = review.body.startsWith('[샘플]');
            const reviewBody = isSample ? review.body.replace(/^\[샘플\]\s*/, '') : review.body;
            return (
              <article className="onsen-review-card" key={review.id}>
                <div className="onsen-review-card-meta">
                  {isSample ? <span data-tone="sample">샘플</span> : null}
                  <span>{bathAreaLabels[review.bathType]}</span>
                  {review.waterTexture[0] ? <span>{waterTextureLabels[review.waterTexture[0]]}</span> : null}
                  {review.visitedOn ?? review.visitSeason ? <span>{review.visitedOn ?? review.visitSeason}</span> : null}
                </div>
                <p>{reviewBody}</p>
              </article>
            );
          })
        ) : (
          <p>아직 바스타임 자체 리뷰가 없습니다. 다녀왔다면 첫 기록을 남겨주세요.</p>
        )}
      </div>

      {open ? (
        <div className="onsen-review-modal-backdrop" role="presentation">
          <div className="onsen-review-modal" role="dialog" aria-modal="true" aria-labelledby="onsen-review-modal-title">
            <div className="onsen-review-modal-head">
              <div>
                <span className="onsen-filter-label">온천여권에 기록</span>
                <h3 id="onsen-review-modal-title">{targetName}</h3>
              </div>
              <button type="button" aria-label="기록 작성 닫기" autoFocus onClick={() => setOpen(false)} disabled={status === 'submitting'}>
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>

            {status === 'submitted' && savedEntry ? (
              <div className="onsen-review-success" role="status">
                <CheckCircle size={38} weight="duotone" aria-hidden="true" />
                <div>
                  <span className="onsen-filter-label">기록 완료</span>
                  <h4>온천여권에 한 곳이 더해졌습니다</h4>
                  <p>검수 중에도 내 기록에서는 바로 확인할 수 있습니다. 같은 감촉의 온천이 쌓이면 취향도 함께 정리됩니다.</p>
                </div>
                <div className="onsen-review-success-facts" aria-label="저장된 기록 요약">
                  <span>{bathAreaLabels[savedEntry.bathAreas[0]]}</span>
                  <span>{waterTextureLabels[savedEntry.waterTexture[0]]}</span>
                  <span>{revisitLabels[savedEntry.revisitIntent]}</span>
                </div>
                <div className="onsen-review-success-actions">
                  <Link href="/passport">내 온천여권 보기</Link>
                  <button type="button" onClick={() => setOpen(false)}>닫기</button>
                </div>
              </div>
            ) : (
              <form className="onsen-review-form" onSubmit={submitReview}>
                <ol className="onsen-review-progress" aria-label="기록 작성 단계">
                  {stepLabels.map((label, index) => (
                    <li key={label} data-current={step === index} data-complete={step > index}>
                      <span>{index + 1}</span>
                      {label}
                    </li>
                  ))}
                </ol>

                <div className="onsen-review-step">
                  {step === 0 ? (
                    <div className="onsen-review-question-group">
                      <div className="onsen-review-question-head">
                        <Bathtub size={24} weight="duotone" aria-hidden="true" />
                        <div><h4>어떤 공간을 이용했나요?</h4><p>여러 곳을 이용했다면 모두 선택할 수 있습니다.</p></div>
                      </div>
                      <div className="onsen-review-choice-list">
                        {availableBathAreas.map((value) => <ChoiceButton key={value} selected={bathAreas.includes(value)} label={bathAreaLabels[value]} onClick={() => toggleBathArea(value)} />)}
                      </div>
                      <label className="onsen-review-date-field">
                        <span><CalendarBlank size={18} aria-hidden="true" /> 방문일 <small>선택</small></span>
                        <input type="date" value={visitedOn} max={today || undefined} onChange={(event) => setVisitedOn(event.target.value)} />
                      </label>
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div className="onsen-review-question-group">
                      <div className="onsen-review-question-head">
                        <Drop size={24} weight="duotone" aria-hidden="true" />
                        <div><h4>물은 어떻게 느껴졌나요?</h4><p>감촉은 두 개까지 선택할 수 있습니다. 방식 판정에는 사용하지 않습니다.</p></div>
                      </div>
                      <fieldset><legend>물의 감촉</legend><div className="onsen-review-choice-list">{waterTextureOptions.map((value) => <ChoiceButton key={value} selected={waterTexture.includes(value)} label={waterTextureLabels[value]} onClick={() => toggleWaterTexture(value)} />)}</div></fieldset>
                      <fieldset><legend><Sparkle size={17} aria-hidden="true" /> 물의 색</legend><div className="onsen-review-choice-list">{waterColorOptions.map((value) => <ChoiceButton key={value} selected={waterColor === value} label={waterColorLabels[value]} onClick={() => setWaterColor(value)} />)}</div></fieldset>
                      <fieldset><legend><Thermometer size={17} aria-hidden="true" /> 체감 온도</legend><div className="onsen-review-choice-list">{temperatureOptions.map((value) => <ChoiceButton key={value} selected={temperatureExperience === value} label={temperatureLabels[value]} onClick={() => setTemperatureExperience(value)} />)}</div></fieldset>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="onsen-review-question-group">
                      <div className="onsen-review-question-head">
                        <Users size={24} weight="duotone" aria-hidden="true" />
                        <div><h4>이용하기는 어땠나요?</h4><p>혼잡과 청결은 방문 시점의 경험으로 저장됩니다.</p></div>
                      </div>
                      <fieldset><legend>혼잡도</legend><div className="onsen-review-choice-list">{crowdingOptions.map((value) => <ChoiceButton key={value} selected={crowdingLevel === value} label={crowdingLabels[value]} onClick={() => setCrowdingLevel(value)} />)}</div></fieldset>
                      <fieldset><legend>청결 상태</legend><div className="onsen-review-choice-list">{cleanlinessOptions.map((value) => <ChoiceButton key={value} selected={cleanlinessLevel === value} label={cleanlinessLabels[value]} onClick={() => setCleanlinessLevel(value)} />)}</div></fieldset>
                      <fieldset><legend>다시 방문한다면</legend><div className="onsen-review-choice-list">{revisitOptions.map((value) => <ChoiceButton key={value} selected={revisitIntent === value} label={revisitLabels[value]} onClick={() => setRevisitIntent(value)} />)}</div></fieldset>
                      <label>온천 중심 한 줄 기록<textarea required minLength={12} maxLength={1200} value={body} onChange={(event) => setBody(event.target.value)} placeholder="물의 느낌, 좋았던 점, 다음 방문자가 알면 좋은 내용을 적어주세요." /><small>{body.trim().length}/12자 이상</small></label>
                      <label>미리 알면 좋은 점 <span>선택</span><input maxLength={300} value={cautionText} onChange={(event) => setCautionText(event.target.value)} placeholder="예: 주말 오후에는 입장 대기가 있었어요." /></label>
                    </div>
                  ) : null}
                </div>

                <div className="onsen-review-actions">
                  {step > 0 ? <button className="onsen-review-back-button" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={17} weight="bold" aria-hidden="true" /> 이전</button> : <span />}
                  {step < 2 ? (
                    <button type="button" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>다음 <ArrowRight size={17} weight="bold" aria-hidden="true" /></button>
                  ) : (
                    <button type="submit" disabled={status === 'submitting' || !canContinue}><BookOpenText size={17} weight="bold" aria-hidden="true" />{status === 'submitting' ? '기록 중' : '온천여권에 기록'}</button>
                  )}
                </div>
                {error ? <p className="onsen-review-error" role="alert">{error}</p> : null}
              </form>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
