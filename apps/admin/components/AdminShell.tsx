import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/care', label: 'Care Routines' },
  { href: '/trip', label: 'Mood Routines' },
  { href: '/audio', label: 'Audio' },
];

export function AdminShell({
  activePath,
  children,
}: Readonly<{
  activePath: string;
  children: React.ReactNode;
}>) {
  return (
    <main className="shell">
      <aside className="sidebar" aria-label="관리자 메뉴">
        <div>
          <p className="eyebrow">BATH SOMMELIER</p>
          <h1>Content Admin</h1>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link
              className={item.href === activePath ? 'navItem active' : 'navItem'}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {children}
    </main>
  );
}
