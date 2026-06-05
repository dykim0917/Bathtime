'use client';

import { useEffect, useState } from 'react';
import { BellSimple, ClockCounterClockwise, Gear, SignOut, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@web/lib/auth';
import {
  deactivatePushTokens,
  getNotificationPreference,
  sendTestPushNotification,
  setNotificationPreference,
  upsertPushToken,
} from '@web/lib/userContent';

type PushBridgeResult = {
  source?: string;
  type?: string;
  enabled?: boolean;
  token?: string | null;
  platform?: 'android' | 'ios';
  error?: string | null;
};

function isNativeAppShell(): boolean {
  if (typeof window === 'undefined') return false;
  if ((window as any).ReactNativeWebView) return true;
  if (window.navigator.userAgent.includes('BathtimeApp')) return true;
  return new URLSearchParams(window.location.search).get('appShell') === '1';
}

function postNativeMessage(payload: Record<string, unknown>): boolean {
  const bridge = (window as any).ReactNativeWebView;
  if (!bridge?.postMessage) return false;
  bridge.postMessage(JSON.stringify(payload));
  return true;
}

export function SavedSettingsButton() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [pushMessage, setPushMessage] = useState('');
  const [nativeAppShell, setNativeAppShell] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setReady(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setNativeAppShell(isNativeAppShell());
  }, []);

  useEffect(() => {
    if (!signedIn) return;

    let mounted = true;
    getNotificationPreference()
      .then((enabled) => {
        if (mounted) setPushEnabled(enabled);
      })
      .catch(() => {
        if (mounted) setPushMessage('알림 설정을 불러오지 못했어요.');
      });

    return () => {
      mounted = false;
    };
  }, [signedIn]);

  useEffect(() => {
    function handlePushResult(event: MessageEvent) {
      let data: PushBridgeResult | null = null;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data?.source !== 'bathtime-native' || data.type !== 'bathtime:push:registration-result') return;

      if (!data.enabled || !data.token || !data.platform) {
        setPushStatus('error');
        setPushMessage(data.error ?? '푸시 알림을 켜지 못했어요.');
        setPushEnabled(false);
        void setNotificationPreference(false).catch(() => undefined);
        return;
      }

      setPushStatus('loading');
      upsertPushToken({ token: data.token, platform: data.platform })
        .then(() => setNotificationPreference(true))
        .then(() => {
          setPushEnabled(true);
          setPushStatus('idle');
          setPushMessage('앱 푸시 알림이 켜졌어요.');
        })
        .catch(() => {
          setPushStatus('error');
          setPushMessage('푸시 토큰을 저장하지 못했어요.');
          setPushEnabled(false);
        });
    }

    window.addEventListener('message', handlePushResult);
    document.addEventListener('message', handlePushResult as EventListener);
    return () => {
      window.removeEventListener('message', handlePushResult);
      document.removeEventListener('message', handlePushResult as EventListener);
    };
  }, []);

  async function togglePush() {
    if (pushStatus === 'loading') return;

    setPushStatus('loading');
    setPushMessage('');

    if (pushEnabled) {
      try {
        await deactivatePushTokens();
        postNativeMessage({ type: 'bathtime:push:disable' });
        setPushEnabled(false);
        setPushStatus('idle');
        setPushMessage('앱 푸시 알림이 꺼졌어요.');
      } catch {
        setPushStatus('error');
        setPushMessage('푸시 알림을 끄지 못했어요.');
      }
      return;
    }

    if (!nativeAppShell) {
      setPushStatus('error');
      setPushMessage('푸시 알림은 바스타임 앱에서 켤 수 있어요.');
      return;
    }

    const posted = postNativeMessage({ type: 'bathtime:push:enable' });
    if (!posted) {
      setPushStatus('error');
      setPushMessage('앱 푸시 연결을 찾지 못했어요.');
      return;
    }

    setPushMessage('앱 알림 권한을 확인하고 있어요.');
  }

  async function sendTestPush() {
    if (pushStatus === 'loading') return;

    setPushStatus('loading');
    setPushMessage('');

    try {
      await sendTestPushNotification();
      setPushStatus('idle');
      setPushMessage('테스트 알림을 보냈어요.');
    } catch {
      setPushStatus('error');
      setPushMessage('테스트 알림을 보내지 못했어요.');
    }
  }

  if (!ready || !signedIn) return null;

  return (
    <>
      <button className="saved-settings-button" type="button" aria-label="보관함 설정" onClick={() => setOpen(true)}>
        <Gear size={27} weight="bold" aria-hidden />
      </button>
      {open ? (
        <div className="modal-backdrop" role="presentation">
          <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
            <button className="modal-icon-button" type="button" aria-label="닫기" onClick={() => setOpen(false)}>
              <X size={18} weight="bold" aria-hidden />
            </button>
            <header className="settings-modal-header">
              <p className="kicker">ACCOUNT</p>
              <h2 id="settings-modal-title">보관함 설정</h2>
            </header>
            <div className="settings-list">
              {nativeAppShell ? (
                <button
                  className="settings-row"
                  type="button"
                  onClick={() => {
                    const posted = postNativeMessage({ type: 'bathtime:navigate', target: 'history' });
                    if (posted) setOpen(false);
                  }}
                >
                  <span className="settings-row-icon">
                    <ClockCounterClockwise size={19} weight="bold" aria-hidden />
                  </span>
                  <span>
                    <strong>의식 기록 보기</strong>
                    <small>완료했거나 저장했던 바스타임 기록을 다시 확인합니다.</small>
                  </span>
                </button>
              ) : null}
              <button
                className={pushEnabled ? 'settings-row active' : 'settings-row'}
                type="button"
                aria-pressed={pushEnabled}
                disabled={pushStatus === 'loading'}
                onClick={togglePush}
              >
                <span className="settings-row-icon">
                  <BellSimple size={19} weight={pushEnabled ? 'fill' : 'bold'} aria-hidden />
                </span>
                <span>
                  <strong>푸시 알림 {pushEnabled ? '켜짐' : '꺼짐'}</strong>
                  <small>{nativeAppShell ? '새 콘텐츠와 의식 안내를 앱에서 받습니다.' : '바스타임 앱에서 켤 수 있어요.'}</small>
                </span>
              </button>
              {pushMessage ? <p className={pushStatus === 'error' ? 'auth-warning' : 'auth-note'}>{pushMessage}</p> : null}
              {pushEnabled ? (
                <button className="settings-row" type="button" disabled={pushStatus === 'loading'} onClick={sendTestPush}>
                  <span className="settings-row-icon">
                    <BellSimple size={19} weight="bold" aria-hidden />
                  </span>
                  <span>
                    <strong>테스트 알림 보내기</strong>
                    <small>앱에서 알림 수신 상태를 바로 확인합니다.</small>
                  </span>
                </button>
              ) : null}
              <button
                className="settings-row danger"
                type="button"
                onClick={async () => {
                  const supabase = getSupabaseClient();
                  await supabase?.auth.signOut();
                  window.dispatchEvent(new CustomEvent('bathtime:saved-content-changed'));
                  setOpen(false);
                  router.replace('/');
                }}
              >
                <span className="settings-row-icon">
                  <SignOut size={19} weight="bold" aria-hidden />
                </span>
                <span>
                  <strong>로그아웃</strong>
                  <small>현재 계정 연결을 종료합니다.</small>
                </span>
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
