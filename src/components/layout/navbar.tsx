'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, User, LogOut, Shield, GraduationCap, Users, Sparkles } from 'lucide-react';

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <GraduationCap className="w-3.5 h-3.5" /> Öğrenci
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Users className="w-3.5 h-3.5" /> Rehber Öğretmen
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5" /> Yönetici
          </span>
        );
      default:
        return null;
    }
  };

  // Landing page'de navbar'ı gizle
  if (pathname === '/') return null;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                <span className="text-gradient">ROTA</span>
              </span>
              <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                Kariyer Keşif Platformu
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
                pathname === '/' ? 'text-indigo-400 font-semibold' : 'text-gray-300'
              }`}
            >
              Ana Sayfa
            </Link>

            {status === 'authenticated' && session?.user && (
              <>
                {session.user.role === 'STUDENT' && (
                  <>
                    <Link
                      href="/student/dashboard"
                      className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
                        pathname.startsWith('/student/dashboard') ? 'text-indigo-400 font-semibold' : 'text-gray-300'
                      }`}
                    >
                      Öğrenci Paneli
                    </Link>
                    <Link
                      href="/student/onboarding"
                      className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
                        pathname.startsWith('/student/onboarding') ? 'text-indigo-400 font-semibold' : 'text-gray-300'
                      }`}
                    >
                      Profil Bilgileri
                    </Link>
                    <Link
                      href="/rpg/test"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      RPG Keşif Adası
                    </Link>
                  </>
                )}

                {session.user.role === 'TEACHER' && (
                  <Link
                    href="/teacher/dashboard"
                    className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                      pathname.startsWith('/teacher') ? 'text-purple-400 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    Danışmanlık Paneli
                  </Link>
                )}

                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                      pathname.startsWith('/admin') ? 'text-emerald-400 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    Yönetici Paneli
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-24 h-8 bg-white/5 animate-pulse rounded-lg" />
            ) : status === 'authenticated' && session?.user ? (
              <div className="flex items-center gap-3 bg-white/5 py-1.5 px-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40">
                  <User className="w-4 h-4 text-indigo-300" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {session.user.name || session.user.email}
                  </div>
                  <div className="mt-0.5">{getRoleBadge(session.user.role)}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-all"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="glow-button px-4 py-2 rounded-xl text-sm font-semibold text-white tracking-wide"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
