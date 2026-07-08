'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass, Mail, Lock, ArrowRight, AlertCircle, Sparkles,
  GraduationCap, Users, ShieldCheck, ChevronLeft, BookOpen
} from 'lucide-react';

type RoleChoice = 'student' | 'teacher' | null;

export default function LoginPage() {
  const [roleChoice, setRoleChoice] = useState<RoleChoice>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleQuickFill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
        setLoading(false);
      } else {
        // Smart redirect based on role & onboarding status
        const redirectRes = await fetch('/api/auth/redirect');
        const redirectData = await redirectRes.json();
        router.push(redirectData.redirectTo || '/');
        router.refresh();
      }
    } catch {
      setError('Giriş yapılırken beklenmeyen bir hata oluştu.');
      setLoading(false);
    }
  };

  // ─── Step 1: Role Selection ────────────────────────────────────────────────
  if (!roleChoice) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

        <div className="w-full max-w-2xl space-y-10 relative z-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-3.5 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 shadow-2xl shadow-indigo-500/30 mb-2">
              <Compass className="w-10 h-10 text-white animate-spin-slow" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              <span className="text-gradient">ROTA</span>'ya Hoş Geldiniz!
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto">
              Lise rehberlik ve RPG kariyer keşif platformuna giriş yapmak için kim olduğunuzu seçin.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Student Card */}
            <button
              type="button"
              onClick={() => { setRoleChoice('student'); setError(''); }}
              className="group relative glass-panel p-8 rounded-3xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/10 group-hover:to-purple-600/10 transition-all duration-500 rounded-3xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                    Öğrenci Girişi
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Kişilik testine gir, kariyer rotanı keşfet, TÜBİTAK burslarını ve önerilen programları gör.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-[11px] font-bold border border-indigo-500/20">RPG Testi</span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 text-[11px] font-bold border border-purple-500/20">MBTI & Enneagram</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/20">Kariyer Haritası</span>
                </div>

                <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 font-bold text-sm">
                  <span>Öğrenci Olarak Giriş Yap</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* Teacher / Admin Card */}
            <button
              type="button"
              onClick={() => { setRoleChoice('teacher'); setError(''); }}
              className="group relative glass-panel p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500 rounded-3xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                    Öğretmen / Yönetici Girişi
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Öğrencilerin gelişimini 360° takip et, danışmanlık notları yaz, okul analitiğini görüntüle.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 text-[11px] font-bold border border-purple-500/20">Rehber Öğretmen</span>
                  <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-300 text-[11px] font-bold border border-pink-500/20">360° Takip</span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-[11px] font-bold border border-amber-500/20">Yönetici Paneli</span>
                </div>

                <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 font-bold text-sm">
                  <span>Öğretmen / Yönetici Olarak Giriş Yap</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-400">
            Henüz bir öğrenci hesabınız yok mu?{' '}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Ücretsiz Kayıt Olun
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ─── Step 2: Login Form ────────────────────────────────────────────────────
  const isStudent = roleChoice === 'student';
  const accentColor = isStudent ? 'indigo' : 'purple';

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-${accentColor}-600/10 rounded-full blur-3xl pointer-events-none animate-pulse`} />
      <div className={`absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse`} />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => { setRoleChoice(null); setEmail(''); setPassword(''); setError(''); }}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Geri Dön / Rol Değiştir</span>
        </button>

        {/* Card Header */}
        <div className="text-center space-y-3">
          <div className={`inline-flex p-3 rounded-2xl ${isStudent ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' : 'bg-gradient-to-tr from-purple-600 to-pink-600'} shadow-xl mb-2`}>
            {isStudent ? <GraduationCap className="w-8 h-8 text-white" /> : <Users className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isStudent ? 'Öğrenci Girişi' : 'Öğretmen / Yönetici Girişi'}
          </h1>
          <p className="text-sm text-gray-400">
            {isStudent
              ? 'Kariyer yolculuğuna devam etmek için giriş yap.'
              : 'Öğrenci takip paneline erişmek için giriş yap.'}
          </p>
        </div>

        {/* Glass Card Form */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isStudent ? 'ogrenci@okul.edu.tr' : 'ogretmen@okul.edu.tr'}
                  className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glow-button py-3 px-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hızlı Test Girişleri</span>
            </div>
            <div className={`grid gap-2.5 ${isStudent ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {isStudent ? (
                // Student demo accounts
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('ogrenci@okul.edu.tr', 'ogrenci123')}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-all text-left"
                  >
                    <GraduationCap className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                    <div>
                      <div className="font-semibold">Ali Yılmaz</div>
                      <div className="text-[10px] text-gray-400">Öğrenci · ogrenci123</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('zeynep@okul.edu.tr', 'zeynep123')}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-all text-left"
                  >
                    <GraduationCap className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                    <div>
                      <div className="font-semibold">Zeynep Kaya</div>
                      <div className="text-[10px] text-gray-400">Öğrenci · zeynep123</div>
                    </div>
                  </button>
                </>
              ) : (
                // Teacher/Admin demo accounts
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('ogretmen@okul.edu.tr', 'ogretmen123')}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all text-left"
                  >
                    <Users className="w-4 h-4 flex-shrink-0 text-purple-400" />
                    <div>
                      <div className="font-semibold">Ayşe Rehber</div>
                      <div className="text-[10px] text-gray-400">Rehber Öğretmen · ogretmen123</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@okul.edu.tr', 'admin123')}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-all text-left"
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <div>
                      <div className="font-semibold">Yönetici</div>
                      <div className="text-[10px] text-gray-400">Admin Paneli · admin123</div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Register / back links */}
        {isStudent && (
          <p className="text-center text-sm text-gray-400">
            Henüz bir hesabınız yok mu?{' '}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Ücretsiz Kayıt Olun
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
