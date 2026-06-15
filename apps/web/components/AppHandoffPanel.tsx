'use client';

import { useEffect, useMemo, useState } from 'react';
import { BATHTIME_PLAY_STORE_URL, buildBathtimeAndroidIntent, buildBathtimeDeepLink } from '@web/lib/appLinks';
import { trackWebEvent } from '@web/lib/analytics';

type Props = {
  from?: string;
  routine?: string;
};

function isAndroidUserAgent() {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
}

export function AppHandoffPanel({ from, routine }: Props) {
  const [isAndroid, setIsAndroid] = useState(false);
  const androidIntentUrl = useMemo(() => buildBathtimeAndroidIntent({ from, routine }), [from, routine]);
  const deepLinkUrl = useMemo(() => buildBathtimeDeepLink({ from, routine }), [from, routine]);

  useEffect(() => {
    const android = isAndroidUserAgent();
    setIsAndroid(android);
    if (!android) return;

    window.location.href = androidIntentUrl;
  }, [androidIntentUrl]);

  return (
    <section className="app-handoff-card">
      <div>
        <p className="kicker">BATHTIME APP</p>
        <h2>{routine ? '앱에서 타이머로 이어가기' : '앱에서 저장하고 실행하기'}</h2>
        <p>
          {routine
            ? '설치된 앱이 있으면 바로 의식 화면으로 이동합니다. 설치되어 있지 않으면 Play Store에서 바스타임을 받을 수 있어요.'
            : '웹에서 발견한 기록을 앱에서 꺼내고, 오늘 가능한 의식으로 이어가세요.'}
        </p>
      </div>
      <div className="app-handoff-actions">
        <a
          className="button-primary"
          href={isAndroid ? androidIntentUrl : deepLinkUrl}
          onClick={() => trackWebEvent('app_cta_clicked', { source: from, routine_id: routine })}
        >
          앱 열기
        </a>
        <a
          className="button-secondary"
          href={BATHTIME_PLAY_STORE_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackWebEvent('app_store_clicked', { source: from, routine_id: routine })}
        >
          Play Store에서 보기
        </a>
      </div>
    </section>
  );
}
