'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BookmarkSimple, CaretDown, SignOut, UserCircle, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import brandSymbol from '@/assets/images/bathtime.svg';
import logoImage from '@/assets/images/logo.png';
import { OnsenSearchForm } from '@web/components/OnsenSearchForm';
import { getSupabaseClient } from '@web/lib/auth';
import { onsenCandidates } from '@web/lib/onsenCatalog';
import { buildOnsenSearchSuggestions, popularOnsenSearches, recommendedOnsenPlaces } from '@web/lib/onsenSearch';

type NativeAuthSessionMessage = {
  source?: string;
  type?: string;
  nonce?: string;
  accessToken?: string;
  refreshToken?: string;
};

type IconName = 'bookmark' | 'user';
type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
type PhosphorIcon = React.ComponentType<{
  size?: number;
  weight?: IconWeight;
  'aria-hidden'?: boolean;
}>;

const icons: Record<IconName, PhosphorIcon> = {
  bookmark: BookmarkSimple,
  user: UserCircle,
};

function Icon({ name, size = 20, active = false }: { name: IconName; size?: number; active?: boolean }) {
  const IconComponent = icons[name];
  return <IconComponent size={size} weight={active ? 'fill' : 'regular'} aria-hidden />;
}

function AccountButton({ signedIn, ready, onSignedOut }: { signedIn: boolean; ready: boolean; onSignedOut: () => void }) {
  const [open, setOpen] = useState(false);

  if (!ready || !signedIn) {
    return (
      <Link className="account-button" href="/auth/login">
        <Icon name="user" size={16} />
        <span>로그인</span>
      </Link>
    );
  }

  return (
    <div className={open ? 'account-menu-wrap is-open' : 'account-menu-wrap'}>
      <button className="account-button" type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name="user" size={17} />
        <span>프로필</span>
        <CaretDown size={13} weight="bold" aria-hidden />
      </button>
      <div className="account-menu" role="menu">
        <Link href="/saved" role="menuitem" onClick={() => setOpen(false)}>
          <BookmarkSimple size={17} aria-hidden />
          찜한 온천
        </Link>
        <button
          type="button"
          role="menuitem"
          onClick={async () => {
            const supabase = getSupabaseClient();
            await supabase?.auth.signOut();
            window.dispatchEvent(new CustomEvent('bathtime:saved-content-changed'));
            setOpen(false);
            onSignedOut();
          }}
        >
          <SignOut size={17} aria-hidden />
          로그아웃
        </button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnsenRoute = pathname === '/' || pathname.startsWith('/onsen');
  const showOnsenHeaderSearch = pathname.startsWith('/onsen') && pathname !== '/onsen';
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authGate, setAuthGate] = useState<{ source: string; next: string; message: string } | null>(null);
  const onsenSearchSuggestions = useMemo(() => buildOnsenSearchSuggestions(onsenCandidates), []);
  const onsenQuery = searchParams.get('query') ?? '';

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setAuthReady(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleNativeAuthSession = (event: MessageEvent) => {
      const nativeNonce = (window as any).__BATHTIME_NATIVE_NONCE__;
      const isNativeAppShell =
        (window as any).__BATHTIME_NATIVE_AUTH__ === true &&
        (Boolean((window as any).ReactNativeWebView) || window.navigator.userAgent.includes('BathtimeApp'));

      if (!isNativeAppShell || typeof nativeNonce !== 'string') return;

      let payload: NativeAuthSessionMessage | null = null;

      if (typeof event.data === 'string') {
        try {
          payload = JSON.parse(event.data) as NativeAuthSessionMessage;
        } catch {
          return;
        }
      } else if (event.data && typeof event.data === 'object') {
        payload = event.data as NativeAuthSessionMessage;
      }

      if (
        payload?.source !== 'bathtime-native' ||
        payload.type !== 'bathtime:auth:session' ||
        payload.nonce !== nativeNonce ||
        !payload.accessToken ||
        !payload.refreshToken
      ) {
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) return;

      void supabase.auth
        .setSession({
          access_token: payload.accessToken,
          refresh_token: payload.refreshToken,
        })
        .then(({ data }) => {
          setSignedIn(Boolean(data.session));
          setAuthReady(true);
          window.dispatchEvent(new CustomEvent('bathtime:saved-content-changed'));
        })
        .catch(() => undefined);
    };

    window.addEventListener('message', handleNativeAuthSession);
    return () => window.removeEventListener('message', handleNativeAuthSession);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isAppShell =
      searchParams.get('appShell') === '1' ||
      Boolean((window as any).ReactNativeWebView) ||
      window.navigator.userAgent.includes('BathtimeApp');

    if (!isAppShell) return;

    document.documentElement.dataset.bathtimeSurface = 'app';
    document.body.classList.add('bathtime-app-shell');
  }, [pathname]);

  const shellClassName = useMemo(() => {
    const classes = ['site-shell'];
    if (isOnsenRoute) classes.push('onsen-shell');
    return classes.join(' ');
  }, [isOnsenRoute]);
  return (
    <div className={shellClassName}>
      <aside className="sidebar">
        <div className="brand-block">
          <Link className="brand" href="/" aria-label="Bathtime 홈">
            <span className="brand-symbol">
              <img src={brandSymbol.src} alt="" width={30} height={30} aria-hidden="true" />
            </span>
            <img className="brand-logo" src={logoImage.src} alt="바스타임" width={158} height={30} />
          </Link>
        </div>
        {showOnsenHeaderSearch ? (
          <div className="onsen-header-search-slot">
            <OnsenSearchForm
              suggestions={onsenSearchSuggestions}
              recommendedPlaces={recommendedOnsenPlaces}
              popularSearches={popularOnsenSearches}
              initialQuery={onsenQuery}
              variant="header"
            />
          </div>
        ) : null}
        <div className="header-actions">
          <AccountButton signedIn={signedIn} ready={authReady} onSignedOut={() => setSignedIn(false)} />
        </div>
      </aside>
      <div className="content-area">
        <main className={pathname.startsWith('/content/') ? 'main content-route-main' : isOnsenRoute ? 'main onsen-route-main' : 'main'}>
          {children}
        </main>
        <footer className="site-footer" aria-label="서비스 정보">
          <div>
            <span>© 2026 Bathtime</span>
          </div>
          <nav aria-label="정책 링크">
            <Link href="/legal/privacy">개인정보처리방침</Link>
            <Link href="/legal/terms">이용약관</Link>
          </nav>
        </footer>
      </div>
      {authGate ? (
        <div className="modal-backdrop" role="presentation">
          <section className="auth-gate-modal" role="alertdialog" aria-modal="true" aria-labelledby="auth-gate-title">
            <button className="modal-icon-button" type="button" aria-label="닫기" onClick={() => setAuthGate(null)}>
              <X size={18} weight="bold" aria-hidden />
            </button>
            <div className="auth-gate-icon" aria-hidden="true">
              <UserCircle size={24} weight="fill" />
            </div>
            <div className="auth-gate-copy">
              <h2 id="auth-gate-title">{authGate.message}</h2>
              <p>Google 계정으로 로그인한 뒤 이어서 사용할 수 있어요.</p>
            </div>
            <div className="modal-actions">
              <button className="button-secondary" type="button" onClick={() => setAuthGate(null)}>
                취소
              </button>
              <button
                className="button-primary"
                type="button"
                onClick={() => {
                  const next = encodeURIComponent(authGate.next);
                  router.push(`/auth/login?source=${encodeURIComponent(authGate.source)}&next=${next}`);
                  setAuthGate(null);
                }}
              >
                확인
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
