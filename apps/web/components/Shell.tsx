'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BookOpenText, BookmarkSimple, CaretDown, CaretLeft, SignOut, UserCircle, X } from '@phosphor-icons/react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import brandSymbol from '@/assets/images/bathtime.svg';
import logoImage from '@/assets/images/logo.png';
import { OnsenSearchForm } from '@web/components/OnsenSearchForm';
import { getSupabaseClient } from '@web/lib/auth';
import { isEnglishLocalePath, localizedPath, stripLocalePath, type BathtimeLocale } from '@web/lib/i18n';
import { buildOnsenSearchSuggestions, getPopularOnsenSearches, getRecommendedOnsenPlaces } from '@web/lib/onsenSearch';

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

function AccountButton({
  signedIn,
  ready,
  iconOnly = false,
  locale,
  onSignedOut,
}: {
  signedIn: boolean;
  ready: boolean;
  iconOnly?: boolean;
  locale: BathtimeLocale;
  onSignedOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonClassName = iconOnly ? 'account-button account-button-icon' : 'account-button';

  if (!ready || !signedIn) {
    return (
      <Link className={buttonClassName} href="/auth/login" aria-label={iconOnly ? (locale === 'en' ? 'Log in' : '로그인') : undefined} title={iconOnly ? (locale === 'en' ? 'Log in' : '로그인') : undefined}>
        <Icon name="user" size={iconOnly ? 20 : 16} />
        {iconOnly ? null : <span>{locale === 'en' ? 'Log in' : '로그인'}</span>}
      </Link>
    );
  }

  return (
    <div className={open ? 'account-menu-wrap is-open' : 'account-menu-wrap'}>
      <button
        className={buttonClassName}
        type="button"
        aria-label={iconOnly ? (locale === 'en' ? 'Account menu' : '계정 메뉴') : undefined}
        title={iconOnly ? (locale === 'en' ? 'Account menu' : '계정 메뉴') : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="user" size={iconOnly ? 20 : 17} />
        {iconOnly ? null : <span>{locale === 'en' ? 'Profile' : '프로필'}</span>}
        {iconOnly ? null : <CaretDown size={13} weight="bold" aria-hidden />}
      </button>
      <div className="account-menu" role="menu">
        <Link href="/passport" role="menuitem" onClick={() => setOpen(false)}>
          <BookOpenText size={17} aria-hidden />
          {locale === 'en' ? 'My onsen passport' : '내 온천여권'}
        </Link>
        <Link href="/saved" role="menuitem" onClick={() => setOpen(false)}>
          <BookmarkSimple size={17} aria-hidden />
          {locale === 'en' ? 'Saved onsen' : '찜한 온천'}
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
          {locale === 'en' ? 'Log out' : '로그아웃'}
        </button>
      </div>
    </div>
  );
}

function OnsenHeaderSearch({ suggestions, locale }: { suggestions: ReturnType<typeof buildOnsenSearchSuggestions>; locale: BathtimeLocale }) {
  const searchParams = useSearchParams();
  const onsenQuery = searchParams.get('query') ?? '';

  return (
    <div className="onsen-header-search-slot">
      <OnsenSearchForm
        suggestions={suggestions}
        recommendedPlaces={getRecommendedOnsenPlaces(locale)}
        popularSearches={getPopularOnsenSearches(locale)}
        initialQuery={onsenQuery}
        variant="header"
        panelMode="autocomplete"
        locale={locale}
      />
    </div>
  );
}

function getMobileBackTarget(pathname: string, locale: BathtimeLocale) {
  if (pathname === '/onsen/results') {
    return { href: localizedPath('/onsen', locale), label: locale === 'en' ? 'Back to onsen search' : '온천 검색기로 돌아가기' };
  }

  if (pathname === '/onsen/methodology') {
    return { href: localizedPath('/onsen', locale), label: locale === 'en' ? 'Back to onsen search' : '온천 검색기로 돌아가기' };
  }

  if (/^\/onsen\/[^/]+$/.test(pathname)) {
    return { href: localizedPath('/onsen/results', locale), label: locale === 'en' ? 'Back to onsen results' : '온천 검색 결과로 돌아가기' };
  }

  return null;
}

function LanguageSwitch({ locale }: { locale: BathtimeLocale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const targetLocale: BathtimeLocale = locale === 'en' ? 'ko' : 'en';
  const query = searchParams.toString();
  const href = `${localizedPath(pathname, targetLocale)}${query ? `?${query}` : ''}`;

  return (
    <Link className="header-language-link" href={href} hrefLang={targetLocale} lang={targetLocale}>
      {targetLocale === 'en' ? 'EN' : '한국어'}
    </Link>
  );
}

function getInternalPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function Shell({
  children,
  onsenSearchSuggestions,
  onsenSearchSuggestionsEn,
}: {
  children: React.ReactNode;
  onsenSearchSuggestions: ReturnType<typeof buildOnsenSearchSuggestions>;
  onsenSearchSuggestionsEn: ReturnType<typeof buildOnsenSearchSuggestions>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const locale: BathtimeLocale = isEnglishLocalePath(pathname) ? 'en' : 'ko';
  const routePathname = stripLocalePath(pathname);
  const isOnsenRoute = routePathname === '/' || routePathname.startsWith('/onsen');
  const isOnsenHomeRoute = routePathname === '/' || routePathname === '/onsen';
  const isAuthRoute = routePathname.startsWith('/auth');
  const showOnsenHeaderSearch = isOnsenRoute;
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authGate, setAuthGate] = useState<{ source: string; next: string; message: string } | null>(null);
  const mobileBackTarget = useMemo(() => getMobileBackTarget(routePathname, locale), [locale, routePathname]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
    if (isOnsenHomeRoute) classes.push('onsen-home-shell');
    if (isAuthRoute) classes.push('auth-shell');
    return classes.join(' ');
  }, [isAuthRoute, isOnsenHomeRoute, isOnsenRoute]);

  const handleMobileBack = () => {
    if (!mobileBackTarget) return;

    const from = getInternalPath(new URL(window.location.href).searchParams.get('from'));
    if (from) {
      router.push(from);
      return;
    }

    try {
      if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
        router.back();
        return;
      }
    } catch {
      // Fall through to the route-level fallback below.
    }

    router.push(mobileBackTarget.href);
  };

  return (
    <div className={shellClassName} lang={locale}>
      {!isAuthRoute ? (
        <aside className="sidebar">
          <div className="brand-block">
            {mobileBackTarget ? (
              <button className="mobile-back-button" type="button" aria-label={mobileBackTarget.label} title={mobileBackTarget.label} onClick={handleMobileBack}>
                <CaretLeft size={20} weight="bold" aria-hidden="true" />
              </button>
            ) : null}
            <Link className="brand" href={localizedPath('/', locale)} aria-label={locale === 'en' ? 'Bathtime home' : 'Bathtime 홈'}>
              <span className="brand-symbol">
                <img src={brandSymbol.src} alt="" width={30} height={30} aria-hidden="true" />
              </span>
              <img className="brand-logo" src={logoImage.src} alt={locale === 'en' ? 'Bathtime' : '바스타임'} width={158} height={30} />
            </Link>
          </div>
          {showOnsenHeaderSearch ? (
            <Suspense fallback={<div className="onsen-header-search-slot" aria-hidden="true" />}>
              <OnsenHeaderSearch suggestions={locale === 'en' ? onsenSearchSuggestionsEn : onsenSearchSuggestions} locale={locale} />
            </Suspense>
          ) : null}
          <div className="header-actions">
            {isOnsenRoute ? <Suspense fallback={null}><LanguageSwitch locale={locale} /></Suspense> : null}
            <AccountButton signedIn={signedIn} ready={authReady} iconOnly={isOnsenRoute} locale={locale} onSignedOut={() => setSignedIn(false)} />
          </div>
        </aside>
      ) : null}
      <div className="content-area">
        <main className={routePathname.startsWith('/content/') ? 'main content-route-main' : isOnsenRoute ? 'main onsen-route-main' : 'main'}>
          {children}
        </main>
        <footer className="site-footer" aria-label={locale === 'en' ? 'Service information' : '서비스 정보'}>
          <div>
            <span>© 2026 Bathtime</span>
          </div>
          <nav aria-label={locale === 'en' ? 'Policy links' : '정책 링크'}>
            <Link href="/legal/privacy">{locale === 'en' ? 'Privacy' : '개인정보처리방침'}</Link>
            <Link href="/legal/terms">{locale === 'en' ? 'Terms' : '이용약관'}</Link>
          </nav>
        </footer>
      </div>
      {authGate ? (
        <div className="modal-backdrop" role="presentation">
          <section className="auth-gate-modal" role="alertdialog" aria-modal="true" aria-labelledby="auth-gate-title">
            <button className="modal-icon-button" type="button" aria-label={locale === 'en' ? 'Close' : '닫기'} onClick={() => setAuthGate(null)}>
              <X size={18} weight="bold" aria-hidden />
            </button>
            <div className="auth-gate-icon" aria-hidden="true">
              <UserCircle size={24} weight="fill" />
            </div>
            <div className="auth-gate-copy">
              <h2 id="auth-gate-title">{authGate.message}</h2>
              <p>{locale === 'en' ? 'Log in with Google to continue.' : 'Google 계정으로 로그인한 뒤 이어서 사용할 수 있어요.'}</p>
            </div>
            <div className="modal-actions">
              <button className="button-secondary" type="button" onClick={() => setAuthGate(null)}>
                {locale === 'en' ? 'Cancel' : '취소'}
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
                {locale === 'en' ? 'Continue' : '확인'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
