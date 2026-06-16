'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BookmarkSimple, Compass, House, List, MagnifyingGlass, PlusSquare, UserCircle, X } from '@phosphor-icons/react';
import { Suspense, useEffect, useMemo, useState, type MouseEvent } from 'react';
import brandSymbol from '@/assets/images/bathtime.svg';
import logoImage from '@/assets/images/logo.png';
import { getSupabaseClient } from '@web/lib/auth';

type NativeAuthSessionMessage = {
  source?: string;
  type?: string;
  accessToken?: string;
  refreshToken?: string;
};

type IconName = 'bookmark' | 'compass' | 'house' | 'list' | 'plus' | 'search' | 'user';
type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
type PhosphorIcon = React.ComponentType<{
  size?: number;
  weight?: IconWeight;
  'aria-hidden'?: boolean;
}>;

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  requiresAuth?: boolean;
};

const navItems: NavItem[] = [
  { href: '/', label: '지금', icon: 'house' },
  { href: '/explore', label: '탐색', icon: 'compass' },
  { href: '/submit', label: '제보', icon: 'plus' },
  { href: '/saved', label: '보관함', icon: 'bookmark', requiresAuth: true },
];

const sidebarCollapsedStorageKey = 'bathtime:web-sidebar-collapsed';

const icons: Record<IconName, PhosphorIcon> = {
  bookmark: BookmarkSimple,
  compass: Compass,
  house: House,
  list: List,
  plus: PlusSquare,
  search: MagnifyingGlass,
  user: UserCircle,
};

function Icon({ name, size = 20, active = false }: { name: IconName; size?: number; active?: boolean }) {
  const IconComponent = icons[name];
  return <IconComponent size={size} weight={active ? 'fill' : 'regular'} aria-hidden />;
}

function isActive(pathname: string, href: string): boolean {
  const activePath = pathname.startsWith('/content/') ? '/explore' : pathname;
  if (href === '/') return activePath === '/';
  return activePath.startsWith(href);
}

function getStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(sidebarCollapsedStorageKey) === 'true';
}

function AccountButton({ signedIn, ready, onSignedOut }: { signedIn: boolean; ready: boolean; onSignedOut: () => void }) {
  if (!ready || !signedIn) {
    return (
      <Link className="account-button" href="/auth/login">
        <Icon name="user" size={16} />
        <span>로그인</span>
      </Link>
    );
  }

  return (
    <button
      className="account-button"
      type="button"
      onClick={async () => {
        const supabase = getSupabaseClient();
        await supabase?.auth.signOut();
        window.dispatchEvent(new CustomEvent('bathtime:saved-content-changed'));
        onSignedOut();
      }}
    >
      <Icon name="user" size={16} />
      <span>로그아웃</span>
    </button>
  );
}

function TopSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery(searchParams.get('query') ?? '');
  }, [searchKey, searchParams]);

  return (
    <form
      className="top-search"
      action="/explore"
      onSubmit={(event) => {
        event.preventDefault();
        const value = query.trim();
        router.push(value ? `/explore?query=${encodeURIComponent(value)}` : '/explore');
      }}
    >
      <Icon name="search" size={17} />
      <input
        name="query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="의식, 재료 또는 장소를 입력해주세요..."
        aria-label="아카이브 검색어"
      />
      {query ? (
        <button
          className="top-search-clear"
          type="button"
          aria-label="검색어 지우기"
          onClick={() => {
            setQuery('');
            if (pathname === '/explore') router.push('/explore');
          }}
        >
          <X size={14} weight="bold" aria-hidden />
        </button>
      ) : null}
    </form>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authGate, setAuthGate] = useState<{ source: string; next: string; message: string } | null>(null);

  useEffect(() => {
    setCollapsed(getStoredCollapsed());
  }, []);

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
    window.localStorage.setItem(sidebarCollapsedStorageKey, String(collapsed));
  }, [collapsed]);

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

  const shellClassName = useMemo(() => (collapsed ? 'site-shell sidebar-collapsed' : 'site-shell'), [collapsed]);
  const handleProtectedNav = (event: MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    if (!item.requiresAuth || signedIn) return;

    event.preventDefault();
    setAuthGate({
      source: 'saved',
      next: item.href,
      message: '저장한 기록을 보려면 로그인해주세요.',
    });
  };

  return (
    <div className={shellClassName}>
      <aside className="sidebar">
        <div className="brand-block">
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
            onClick={() => setCollapsed((current) => !current)}
          >
            <Icon name="list" size={21} />
          </button>
          <Link className="brand" href="/" aria-label="Bathtime 홈">
            {collapsed ? (
              <span className="brand-symbol">
                <img src={brandSymbol.src} alt="" width={34} height={34} aria-hidden="true" />
              </span>
            ) : (
              <img className="brand-logo" src={logoImage.src} alt="바스타임" width={158} height={30} />
            )}
          </Link>
        </div>
        <nav className="nav-list" aria-label="주요 메뉴">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                className={active ? 'nav-link active' : 'nav-link'}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={(event) => handleProtectedNav(event, item)}
              >
                <Icon name={item.icon} active={active} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <Link href="/about">바스타임이란</Link>
          <Link href="/legal/privacy">개인정보처리방침</Link>
          <Link href="/legal/terms">이용약관</Link>
        </div>
      </aside>
      <div className="content-area">
        <header className="top-bar">
          <Suspense fallback={<div className="top-search" aria-hidden="true" />}>
            <TopSearch />
          </Suspense>
          <AccountButton signedIn={signedIn} ready={authReady} onSignedOut={() => setSignedIn(false)} />
        </header>
        <main className={pathname.startsWith('/content/') ? 'main content-route-main' : 'main'}>{children}</main>
      </div>
      <nav className="bottom-nav" aria-label="모바일 메뉴">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} className={active ? 'active' : ''} href={item.href} onClick={(event) => handleProtectedNav(event, item)}>
              <Icon name={item.icon} size={24} active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
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
