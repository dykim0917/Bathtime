import Link from 'next/link';
import { signOut } from '../lib/auth/actions';
import { getCurrentAdminEmail } from '../lib/auth/server';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/care', label: 'Care Routines' },
  { href: '/trip', label: 'Mood Routines' },
  { href: '/audio', label: 'Audio' },
  { href: '/publish', label: 'Publish' },
];

export async function AdminShell({
  activePath,
  children,
}: Readonly<{
  activePath: string;
  children: React.ReactNode;
}>) {
  const adminEmail = await getCurrentAdminEmail();

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
        <div className="sessionBox">
          <span>Signed in</span>
          <strong>{adminEmail ?? 'Local scaffold'}</strong>
          {adminEmail ? (
            <form action={signOut}>
              <button type="submit">Sign out</button>
            </form>
          ) : null}
        </div>
      </aside>
      {children}
    </main>
  );
}
