'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookmarkSimple, Compass, House, List, MagnifyingGlass, PlusSquare, UserCircle, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import brandSymbol from '@/assets/images/bathtime.svg';
import logoImage from '@/assets/images/logo.png';
import { getSupabaseClient } from '@web/lib/auth';

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
  { href: '/submit', label: '제보', icon: 'plus', requiresAuth: true },
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

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [appShell, setAppShell] = useState(false);
  const [authGate, setAuthGate] = useState<{ source: string; next: string; message: string; cancelHref?: string } | null>(null);

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
    window.localStorage.setItem(sidebarCollapsedStorageKey, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isAppShell =
      searchParams.get('appShell') === '1' ||
      Boolean((window as any).ReactNativeWebView) ||
      window.navigator.userAgent.includes('BathtimeApp');

    setAppShell(isAppShell);
    if (!isAppShell) return;

    document.documentElement.dataset.bathtimeSurface = 'app';
    document.body.classList.add('bathtime-app-shell');
  }, [pathname]);

  useEffect(() => {
    if (!appShell || !authReady || signedIn || authGate) return;

    const protectedItem = navItems.find((item) => item.requiresAuth && item.href === pathname);
    if (!protectedItem) return;

    setAuthGate({
      source: protectedItem.href === '/submit' ? 'submit' : 'saved',
      next: protectedItem.href,
      cancelHref: '/',
      message: protectedItem.href === '/submit' ? '제보를 남기려면 로그인해주세요.' : '저장한 기록을 보려면 로그인해주세요.',
    });
  }, [appShell, authGate, authReady, pathname, signedIn]);

  const shellClassName = useMemo(() => (collapsed ? 'site-shell sidebar-collapsed' : 'site-shell'), [collapsed]);
  const closeAuthGate = () => {
    const cancelHref = authGate?.cancelHref;
    setAuthGate(null);
    if (cancelHref) router.replace(cancelHref);
  };

  const handleProtectedNav = (event: MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    if (!item.requiresAuth || signedIn) return;

    event.preventDefault();
    setAuthGate({
      source: item.href === '/submit' ? 'submit' : 'saved',
      next: item.href,
      message: item.href === '/submit' ? '제보를 남기려면 로그인해주세요.' : '저장한 기록을 보려면 로그인해주세요.',
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
                <img src={brandSymbol.src} alt="" aria-hidden="true" />
              </span>
            ) : (
              <img className="brand-logo" src={logoImage.src} alt="Bathtime" />
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
          <Link href="/legal/privacy">개인정보처리방침</Link>
          <Link href="/legal/terms">이용약관</Link>
        </div>
      </aside>
      <div className="content-area">
        <header className="top-bar">
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
            />
          </form>
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
            <button className="modal-icon-button" type="button" aria-label="닫기" onClick={closeAuthGate}>
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
              <button className="button-secondary" type="button" onClick={closeAuthGate}>
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
