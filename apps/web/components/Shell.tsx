'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookmarkSimple, Compass, House, List, MagnifyingGlass, PlusSquare, UserCircle } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
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
};

const navItems: NavItem[] = [
  { href: '/', label: '지금', icon: 'house' },
  { href: '/explore', label: '탐색', icon: 'compass' },
  { href: '/submit', label: '제보', icon: 'plus' },
  { href: '/saved', label: '보관함', icon: 'bookmark' },
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

function AccountButton() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

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

  useEffect(() => {
    setCollapsed(getStoredCollapsed());
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
          <AccountButton />
        </header>
        <main className={pathname.startsWith('/content/') ? 'main content-route-main' : 'main'}>{children}</main>
      </div>
      <nav className="bottom-nav" aria-label="모바일 메뉴">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} className={active ? 'active' : ''} href={item.href}>
              <Icon name={item.icon} size={24} active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
