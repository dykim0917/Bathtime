'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import logoImage from '@/assets/images/logo.png';

type IconName = 'bookmark' | 'compass' | 'house' | 'list' | 'plus' | 'search' | 'user';

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

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  };

  if (name === 'house') {
    return (
      <svg {...common}>
        <path d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'compass') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'plus') {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'bookmark') {
    return (
      <svg {...common}>
        <path d="M7 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16l-5-3-5 3V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'list') {
    return (
      <svg {...common}>
        <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'search') {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 21a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
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
          <Link className="brand" href="/">
            {collapsed ? <span className="brand-symbol">B</span> : <img src={logoImage.src} alt="Bathtime" />}
          </Link>
        </div>
        <nav className="nav-list" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={isActive(pathname, item.href) ? 'nav-link active' : 'nav-link'}
              href={item.href}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
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
          <Link className="account-button" href="/auth/login">
            <Icon name="user" size={16} />
            <span>로그인</span>
          </Link>
        </header>
        <main className="main">{children}</main>
      </div>
      <nav className="bottom-nav" aria-label="모바일 메뉴">
        {navItems.map((item) => (
          <Link key={item.href} className={isActive(pathname, item.href) ? 'active' : ''} href={item.href}>
            <Icon name={item.icon} size={24} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
