import Link from 'next/link';

const navItems = [
  { href: '/', label: '지금' },
  { href: '/explore', label: '탐색' },
  { href: '/routines', label: '의식' },
  { href: '/submit', label: '제보' },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span>BATH TIME</span>
          <strong>ARCHIVE</strong>
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
      <main className="main">{children}</main>
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
