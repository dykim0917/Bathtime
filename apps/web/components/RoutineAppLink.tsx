'use client';

import { useEffect, useState } from 'react';
import { BATHTIME_PLAY_STORE_URL, buildBathtimeAndroidIntent } from '@web/lib/appLinks';

function isAndroidUserAgent() {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
}

export function RoutineAppLink({ routineId }: { routineId: string }) {
  const [isAndroid, setIsAndroid] = useState(false);
  const href = isAndroid
    ? buildBathtimeAndroidIntent({ from: 'related_routine', routine: routineId })
    : BATHTIME_PLAY_STORE_URL;

  useEffect(() => {
    setIsAndroid(isAndroidUserAgent());
  }, []);

  return (
    <a className="button-primary routine-card-cta" href={href} target={isAndroid ? undefined : '_blank'} rel={isAndroid ? undefined : 'noreferrer'}>
      앱에서 타이머로 이어가기
    </a>
  );
}
