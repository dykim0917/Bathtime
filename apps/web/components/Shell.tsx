import Link from 'next/link';
import logoImage from '@/assets/images/logo.png';

const navItems = [
  { href: '/', label: '지금' },
  { href: '/explore', label: '탐색' },
  { href: '/submit', label: '제보' },
  { href: '/saved', label: '보관함' },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <img src={logoImage.src} alt="Bathtime" />
        </Link>
        <nav className="nav-list" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link key={item.href} className="nav-link" href={item.href}>
              {item.label}
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
          <form className="top-search" action="/explore">
            <span aria-hidden="true">⌕</span>
            <input name="query" placeholder="의식, 재료 또는 장소를 입력해주세요..." />
          </form>
          <Link className="account-button" href="/app">앱 열기</Link>
        </header>
        <main className="main">{children}</main>
      </div>
      <nav className="bottom-nav" aria-label="모바일 메뉴">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
