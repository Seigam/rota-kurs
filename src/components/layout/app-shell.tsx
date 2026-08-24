'use client';

import { Suspense, useEffect, useId, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  Sparkles,
  Star,
  Target,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Navbar } from '@/components/layout/navbar';
import { ThemeToggle } from '@/components/layout/theme-toggle';

type AppRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  activePaths?: string[];
  exact?: boolean;
};

type SidebarGroup = {
  label: string;
  items: SidebarItem[];
};

const studentGroups: SidebarGroup[] = [
  {
    label: 'Rotam',
    items: [
      { href: '/student/dashboard', label: 'Genel bakış', icon: LayoutDashboard, exact: true },
      { href: '/student/roadmap', label: 'Yol haritam', icon: Route },
      { href: '/student/goals', label: 'Hedeflerim', icon: Target },
      { href: '/student/lesson-path', label: 'Ders rotam', icon: BookOpenCheck },
    ],
  },
  {
    label: 'Keşif',
    items: [
      { href: '/rpg/test', label: 'Rehberlik envanteri', icon: Sparkles, activePaths: ['/rpg/test', '/rpg/results'] },
      { href: '/student/interests', label: 'İlgi profilim', icon: Compass },
      { href: '/student/programs', label: 'Program önerileri', icon: GraduationCap, activePaths: ['/student/programs', '/student/favorites'] },
      { href: '/student/values', label: 'Değerlerim', icon: Star },
    ],
  },
  {
    label: 'Ben',
    items: [
      {
        href: '/student/profile',
        label: 'Profil ve raporlar',
        icon: UserRound,
        activePaths: ['/student/profile', '/student/onboarding', '/student/results', '/student/counseling'],
      },
    ],
  },
];

const teacherGroups: SidebarGroup[] = [
  {
    label: 'Danışmanlık',
    items: [
      {
        href: '/teacher/dashboard',
        label: 'Öğrenci takibi',
        icon: Users,
        activePaths: ['/teacher/dashboard', '/teacher/student'],
      },
    ],
  },
];

const adminGroups: SidebarGroup[] = [
  {
    label: 'Yönetim merkezi',
    items: [
      { href: '/admin/dashboard', label: 'Okul analitiği', icon: BarChart3, exact: true },
      { href: '/admin/dashboard?tab=programs', label: 'Programlar', icon: GraduationCap },
      { href: '/admin/dashboard?tab=users', label: 'Kullanıcılar', icon: Users },
      { href: '/admin/dashboard?tab=approvals', label: 'Onay talepleri', icon: ClipboardCheck },
    ],
  },
];

const workspacePrefixes = ['/student', '/teacher', '/admin', '/rpg'];

function groupsForRole(role?: AppRole) {
  if (role === 'ADMIN') return adminGroups;
  if (role === 'TEACHER') return teacherGroups;
  return studentGroups;
}

function dashboardForRole(role?: AppRole) {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'TEACHER') return '/teacher/dashboard';
  return '/student/dashboard';
}

function roleLabel(role?: AppRole) {
  if (role === 'ADMIN') return 'Yönetici alanı';
  if (role === 'TEACHER') return 'Danışman alanı';
  return 'Öğrenci rotası';
}

function itemIsActive(
  pathname: string,
  item: SidebarItem,
  searchParams?: { get(name: string): string | null } | null,
) {
  const [hrefPath, queryString] = item.href.split('?');

  if (queryString) {
    const expectedTab = new URLSearchParams(queryString).get('tab');
    return pathname === hrefPath && searchParams?.get('tab') === expectedTab;
  }

  if (item.href === '/admin/dashboard') {
    const tab = searchParams?.get('tab');
    return pathname === item.href && (!tab || tab === 'analytics');
  }

  if (item.activePaths?.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return true;
  if (item.exact) return pathname === hrefPath;
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

function Brand({ compact = false, href }: { compact?: boolean; href: string }) {
  return (
    <Link href={href} className={`group flex min-h-12 items-center rounded-xl ${compact ? 'justify-center' : 'gap-3'}`} aria-label="FutuRoute ana sayfa">
      <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-app-brand text-white shadow-[0_6px_0_var(--primary-shadow)] transition-transform group-hover:-translate-y-0.5">
        <Compass className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block text-lg font-black tracking-[-0.03em] text-app-text">FutuRoute</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-app-muted">Gelecek pusulan</span>
        </span>
      )}
    </Link>
  );
}

function NavGroups({
  groups,
  pathname,
  collapsed,
  onNavigate,
  searchParams,
}: {
  groups: SidebarGroup[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
  searchParams?: { get(name: string): string | null } | null;
}) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          {collapsed ? (
            <div className="mx-3 mb-2 border-t border-app-border" aria-hidden="true" />
          ) : (
            <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-app-subtle">{group.label}</p>
          )}
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = itemIsActive(pathname, item, searchParams);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex min-h-11 items-center rounded-xl text-sm font-extrabold transition-[background-color,color,transform] active:scale-[0.98] ${
                      collapsed ? 'mx-auto size-11 justify-center' : 'gap-3 px-3'
                    } ${
                      active
                        ? 'bg-app-brand-soft text-app-brand-ink'
                        : 'text-app-muted hover:bg-app-surface-muted hover:text-app-text'
                    }`}
                  >
                    <span className={`absolute left-0 h-5 w-1 rounded-r-full bg-app-brand transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
                    <Icon className={`size-[19px] shrink-0 ${active ? 'text-app-brand' : 'text-app-subtle group-hover:text-app-brand'}`} aria-hidden="true" />
                    <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
                    {!collapsed && active && <span className="ml-auto size-1.5 rounded-full bg-app-brand" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function NavGroupsWithSearch(props: Omit<React.ComponentProps<typeof NavGroups>, 'searchParams'>) {
  const searchParams = useSearchParams();
  return <NavGroups {...props} searchParams={searchParams} />;
}

function SidebarNavigation(props: Omit<React.ComponentProps<typeof NavGroups>, 'searchParams'>) {
  return (
    <Suspense fallback={<NavGroups {...props} searchParams={null} />}>
      <NavGroupsWithSearch {...props} />
    </Suspense>
  );
}

function UserSummary({
  compact,
  name,
  role,
  profileHref,
}: {
  compact: boolean;
  name?: string | null;
  role?: AppRole;
  profileHref: string;
}) {
  return (
    <Link
      href={profileHref}
      className={`flex min-h-12 items-center rounded-xl border border-app-border bg-app-surface hover:border-app-brand ${compact ? 'justify-center' : 'gap-3 px-3'}`}
      aria-label="Profilimi aç"
      title={compact ? name || 'Profilim' : undefined}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-[11px] bg-app-brand-soft text-xs font-black text-app-brand-ink">
        {name?.charAt(0).toLocaleUpperCase('tr-TR') || <UserRound className="size-4" aria-hidden="true" />}
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-app-text">{name || 'Profilim'}</span>
          <span className="block text-[11px] font-semibold text-app-muted">{roleLabel(role)}</span>
        </span>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const role = session?.user?.role as AppRole | undefined;
  const groups = groupsForRole(role);
  const dashboardHref = dashboardForRole(role);
  const profileHref = role === 'STUDENT' ? '/student/profile' : dashboardHref;
  const isWorkspaceRoute = workspacePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const showWorkspaceShell = isWorkspaceRoute && status !== 'unauthenticated';

  useEffect(() => {
    if (!mobileOpen) return;

    const menuButton = menuButtonRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : menuButton;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) || []);
    focusables[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }

      if (event.key !== 'Tab' || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      (previousFocus || menuButton)?.focus();
    };
  }, [mobileOpen]);

  if (!showWorkspaceShell) {
    return (
      <>
        <Navbar />
        <main id="ana-icerik" tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </main>
      </>
    );
  }

  return (
    <div className={`grid min-h-svh flex-1 grid-cols-1 ${collapsed ? 'lg:grid-cols-[76px_minmax(0,1fr)]' : 'lg:grid-cols-[248px_minmax(0,1fr)]'}`}>
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-app-border bg-background lg:flex" aria-label="Uygulama menüsü">
        <div className={`flex min-h-20 items-center border-b border-app-border ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <Brand compact={collapsed} href={dashboardHref} />
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="grid size-10 place-items-center rounded-xl text-app-muted hover:bg-app-surface-muted hover:text-app-text"
              aria-label="Sidebarı daralt"
              title="Sidebarı daralt"
            >
              <PanelLeftClose className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 grid size-10 place-items-center rounded-xl text-app-muted hover:bg-app-surface-muted hover:text-app-text"
            aria-label="Sidebarı genişlet"
            title="Sidebarı genişlet"
          >
            <PanelLeftOpen className="size-5" aria-hidden="true" />
          </button>
        )}

        <nav className={`min-h-0 flex-1 overflow-y-auto py-5 ${collapsed ? 'px-1.5' : 'px-3'}`} aria-label="Çalışma alanı menüsü">
          {status === 'loading' ? (
            <div className="space-y-3" aria-label="Menü yükleniyor">
              {Array.from({ length: 6 }, (_, index) => <div key={index} className={`${collapsed ? 'mx-auto size-11' : 'h-11 w-full'} animate-pulse rounded-xl bg-app-surface-muted`} />)}
            </div>
          ) : (
            <SidebarNavigation groups={groups} pathname={pathname} collapsed={collapsed} />
          )}
        </nav>

        <div className={`space-y-2 border-t border-app-border py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
          <UserSummary compact={collapsed} name={session?.user?.name} role={role} profileHref={profileHref} />
          <div className={`flex ${collapsed ? 'flex-col' : ''} gap-2`}>
            <ThemeToggle showLabel={!collapsed} className={collapsed ? 'w-full' : 'flex-1 justify-start'} />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className={`grid min-h-11 place-items-center rounded-xl text-app-muted hover:bg-app-danger-soft hover:text-app-danger ${collapsed ? 'w-full' : 'size-11'}`}
              aria-label="Çıkış yap"
              title="Çıkış yap"
            >
              <LogOut className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-50 flex min-h-16 items-center justify-between border-b border-app-border bg-background/95 px-4 backdrop-blur-xl lg:hidden">
          <Brand href={dashboardHref} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-11 place-items-center rounded-xl border border-app-border bg-app-surface text-app-text"
              aria-label="Uygulama menüsünü aç"
              aria-expanded={mobileOpen}
              aria-controls={drawerId}
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main id="ana-icerik" tabIndex={-1} className="flex min-w-0 flex-1 flex-col">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} aria-label="Menüyü kapat" />
          <div
            ref={drawerRef}
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label="Uygulama menüsü"
            className="absolute inset-y-0 left-0 flex w-[min(88vw,340px)] flex-col border-r border-app-border bg-background shadow-2xl"
          >
            <div className="flex min-h-20 items-center justify-between border-b border-app-border px-4">
              <Brand href={dashboardHref} />
              <button type="button" onClick={() => setMobileOpen(false)} className="grid size-11 place-items-center rounded-xl text-app-muted hover:bg-app-surface-muted" aria-label="Menüyü kapat">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5" aria-label="Mobil çalışma alanı menüsü">
              <SidebarNavigation groups={groups} pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </nav>
            <div className="space-y-3 border-t border-app-border p-3">
              <UserSummary compact={false} name={session?.user?.name} role={role} profileHref={profileHref} />
              <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-app-danger-soft text-sm font-extrabold text-app-danger">
                <LogOut className="size-4" aria-hidden="true" /> Çıkış yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
