'use client';

import { useEffect, useId, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Activity,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Shield,
  Target,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

type NavItem = {
  href: string;
  label: string;
  icon?: typeof Compass;
};

const publicItems: NavItem[] = [
  { href: '/#nasil-calisir', label: 'Nasıl çalışır?' },
  { href: '/mikro-yeterlilikler', label: 'Program kataloğu' },
];

const studentItems: NavItem[] = [
  { href: '/student/dashboard', label: 'Genel bakış', icon: LayoutDashboard },
  { href: '/student/development', label: 'Gelişim nabzım', icon: Activity },
  { href: '/student/roadmap', label: 'Yol haritam', icon: Route },
  { href: '/student/goals', label: 'Hedeflerim', icon: Target },
  { href: '/student/lesson-path', label: 'Ders rotam', icon: GraduationCap },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  const role = session?.user?.role;
  const dashboardHref =
    role === 'TEACHER'
      ? '/teacher/dashboard'
      : role === 'ADMIN'
        ? '/admin/dashboard'
        : '/student/dashboard';

  const items =
    status === 'authenticated'
      ? role === 'STUDENT'
        ? studentItems
        : [{ href: dashboardHref, label: role === 'ADMIN' ? 'Yönetici paneli' : 'Danışmanlık paneli', icon: role === 'ADMIN' ? Shield : Users }]
      : publicItems;

  return (
    <header className="sticky top-0 z-50 border-b border-app-border bg-background/95 text-app-text shadow-[0_1px_0_rgba(23,32,51,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={status === 'authenticated' ? dashboardHref : '/'}
          className="group flex min-h-12 items-center gap-3 rounded-xl"
          aria-label="FutuRoute ana sayfa"
        >
          <span className="grid size-10 place-items-center rounded-[14px] bg-app-brand text-white shadow-[0_7px_0_var(--primary-shadow)] transition-transform group-hover:-translate-y-0.5">
            <Compass className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-[-0.03em]">FutuRoute</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-app-muted">
              Gelecek pusulan
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`min-h-11 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                  active
                    ? 'bg-app-brand-soft text-app-brand-ink'
                    : 'text-app-muted hover:bg-app-surface hover:text-app-text'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === 'loading' ? (
            <div className="h-11 w-28 animate-pulse rounded-xl bg-app-surface-muted" aria-label="Oturum yükleniyor" />
          ) : status === 'authenticated' && session?.user ? (
            <>
              <Link
                href={role === 'STUDENT' ? '/student/profile' : dashboardHref}
                className="hidden min-h-11 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-bold text-app-text hover:border-app-brand sm:flex"
                aria-label="Profilimi aç"
              >
                <UserRound className="size-4 text-app-brand" aria-hidden="true" />
                <span className="max-w-28 truncate">{session.user.name || 'Profilim'}</span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hidden size-11 place-items-center rounded-xl text-app-muted hover:bg-app-danger-soft hover:text-app-danger sm:grid"
                aria-label="Çıkış yap"
                title="Çıkış yap"
              >
                <LogOut className="size-5" aria-hidden="true" />
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="grid min-h-11 place-items-center rounded-xl px-4 text-sm font-bold text-app-text hover:bg-app-surface">
                Giriş yap
              </Link>
              <Link href="/register" className="grid min-h-11 place-items-center rounded-xl bg-app-brand px-4 text-sm font-extrabold text-white shadow-[0_5px_0_var(--primary-shadow)] hover:bg-app-brand-hover">
                Ücretsiz başla
              </Link>
            </div>
          )}

          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl border border-app-border bg-app-surface text-app-text lg:hidden"
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id={menuId} className="border-t border-app-border bg-background px-4 py-4 lg:hidden" aria-label="Mobil menü">
          <div className="mx-auto grid max-w-7xl gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold ${
                    active ? 'bg-app-brand-soft text-app-brand-ink' : 'bg-app-surface text-app-text'
                  }`}
                >
                  {Icon && <Icon className="size-5" aria-hidden="true" />}
                  {item.label}
                </Link>
              );
            })}

            {status === 'authenticated' && session?.user ? (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-app-border pt-4">
                <Link onClick={() => setMenuOpen(false)} href={role === 'STUDENT' ? '/student/profile' : dashboardHref} className="grid min-h-12 place-items-center rounded-xl bg-app-surface text-sm font-bold text-app-text">
                  Profilim
                </Link>
                <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="min-h-12 rounded-xl bg-app-danger-soft text-sm font-bold text-app-danger">
                  Çıkış yap
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-app-border pt-4">
                <Link onClick={() => setMenuOpen(false)} href="/login" className="grid min-h-12 place-items-center rounded-xl bg-app-surface text-sm font-bold text-app-text">
                  Giriş yap
                </Link>
                <Link onClick={() => setMenuOpen(false)} href="/register" className="grid min-h-12 place-items-center rounded-xl bg-app-brand text-sm font-extrabold text-white">
                  Ücretsiz başla
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
