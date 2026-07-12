'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle, Eye, FloppyDisk, LockKey } from '@phosphor-icons/react';
import type { FormEvent } from 'react';
import type { OnsenPublicProfile } from '@web/lib/onsenPassport';
import { PublicHandleTakenError, saveMyOnsenPublicProfile } from '@web/lib/userContent';

export function OnsenPassportPublicSettings({
  profile,
  onSaved,
}: {
  profile: OnsenPublicProfile | null;
  onSaved: (profile: OnsenPublicProfile) => void;
}) {
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [passportIsPublic, setPassportIsPublic] = useState(false);
  const [showVisitMonth, setShowVisitMonth] = useState(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    setHandle(profile?.handle ?? '');
    setDisplayName(profile?.displayName ?? '');
    setBio(profile?.bio ?? '');
    setPassportIsPublic(profile?.passportIsPublic ?? false);
    setShowVisitMonth(profile?.showVisitMonth ?? true);
  }, [profile]);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedHandle = handle.trim().toLowerCase();
    const normalizedName = displayName.trim();

    if (!/^[a-z0-9][a-z0-9_-]{2,23}$/.test(normalizedHandle)) {
      setStatus('error');
      setError('공개 주소는 영문 소문자, 숫자, 밑줄, 하이픈으로 3~24자까지 입력해 주세요.');
      return;
    }
    if (normalizedName.length < 2 || normalizedName.length > 24) {
      setStatus('error');
      setError('공개 닉네임은 2~24자로 입력해 주세요.');
      return;
    }

    setStatus('saving');
    setError('');
    try {
      const savedProfile = await saveMyOnsenPublicProfile({
        handle: normalizedHandle,
        displayName: normalizedName,
        bio,
        passportIsPublic,
        showVisitMonth,
      });
      onSaved(savedProfile);
      setStatus('saved');
    } catch (saveError) {
      setStatus('error');
      setError(saveError instanceof PublicHandleTakenError ? '이미 사용 중인 공개 주소입니다.' : '공개 설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  return (
    <section id="passport-public-settings" className="passport-public-settings" aria-labelledby="passport-public-settings-title">
      <header className="passport-section-head">
        <div>
          <span className="onsen-filter-label">공개 범위</span>
          <h2 id="passport-public-settings-title">온천여권 공개 설정</h2>
          <p>공개한 후기에는 설정한 닉네임과 방문 연월만 표시됩니다. Google 계정 이름과 정확한 방문일은 공개되지 않습니다.</p>
        </div>
        <LockKey size={26} weight="duotone" aria-hidden="true" />
      </header>

      <form className="passport-public-form" onSubmit={saveSettings}>
        <div className="passport-public-fields">
          <label>
            공개 닉네임
            <input required minLength={2} maxLength={24} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="예: 느린목욕" />
          </label>
          <label>
            공개 주소
            <span className="passport-handle-field"><small>getbathtime.com/passport/</small><input required minLength={3} maxLength={24} pattern="[a-z0-9][a-z0-9_-]{2,23}" value={handle} onChange={(event) => setHandle(event.target.value.toLowerCase())} placeholder="slow-bather" /></span>
          </label>
          <label className="passport-public-bio">
            한 줄 소개 <span>선택</span>
            <textarea maxLength={160} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="좋아하는 탕과 물의 취향을 적어보세요." />
            <small>{bio.length}/160</small>
          </label>
        </div>

        <div className="passport-public-toggles">
          <label>
            <input type="checkbox" checked={passportIsPublic} onChange={(event) => setPassportIsPublic(event.target.checked)} />
            <span><strong>온천여권 공개</strong><small>비공개로 바꿔도 작성한 후기와 방문 기록은 삭제되지 않습니다.</small></span>
          </label>
          <label>
            <input type="checkbox" checked={showVisitMonth} onChange={(event) => setShowVisitMonth(event.target.checked)} />
            <span><strong>방문한 월 표시</strong><small>날짜는 공개하지 않고 연도와 월만 보여줍니다.</small></span>
          </label>
        </div>

        <div className="passport-public-actions">
          <button type="submit" disabled={status === 'saving'}><FloppyDisk size={17} weight="bold" aria-hidden="true" />{status === 'saving' ? '저장 중' : '공개 설정 저장'}</button>
          {status === 'saved' ? <span role="status"><CheckCircle size={17} weight="fill" aria-hidden="true" />저장했습니다</span> : null}
          {error ? <p role="alert">{error}</p> : null}
          {profile?.passportIsPublic ? <Link href={`/passport/${profile.handle}`}><Eye size={17} weight="bold" aria-hidden="true" />공개 온천여권 보기</Link> : null}
        </div>
      </form>
    </section>
  );
}
