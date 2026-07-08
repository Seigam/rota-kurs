'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass, Mail, Lock, ArrowRight, AlertCircle, Sparkles,
  GraduationCap, Users, ShieldCheck, ChevronLeft
} from 'lucide-react';

type RoleChoice = 'student' | 'teacher' | null;

export function LandingLoginSection() {
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
      const res = await signIn('credentials', { redirect: false, email, password });
      if (res?.error) {
        setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
        setLoading(false);
      } else {
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

  // ── Adım 1: Rol seçimi ──────────────────────────────────────────────────────
  if (!roleChoice) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl mx-auto">
        {/* Öğrenci */}
        <button
          type="button"
          onClick={() => { setRoleChoice('student'); setError(''); }}
          className="group relative glass-panel p-8 rounded-3xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/10 group-hover:to-purple-600/10 transition-all duration-500 rounded-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white group-hover:text-indigo-300 transition-colors">Öğrenci Girişi</h3>
              <p className="text-xs text-gray-400 leading-relaxed">RPG testi, kariyer rotası, TÜBİTAK programları ve kişilik profili.</p>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
              <span>Öğrenci Olarak Devam Et</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Öğretmen / Admin */}
        <button
          type="button"
          onClick={() => { setRoleChoice('teacher'); setError(''); }}
          className="group relative glass-panel p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500 rounded-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors">Öğretmen / Yönetici</h3>
              <p className="text-xs text-gray-400 leading-relaxed">360° öğrenci takip paneli, danışmanlık notları ve okul analitiği.</p>
            </div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
              <span>Öğretmen Olarak Devam Et</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
      </div>
    );
  }

  // ── Adım 2: Giriş Formu ─────────────────────────────────────────────────────
  const isStudent = roleChoice === 'student';

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Geri butonu */}
      <button
        type="button"
        onClick={() => { setRoleChoice(null); setEmail(''); setPassword(''); setError(''); }}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Rol seçimine geri dön</span>
      </button>

      {/* Kart */}
      <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/10">
        {/* Kart başlığı */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isStudent ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' : 'bg-gradient-to-tr from-purple-600 to-pink-600'}`}>
            {isStudent ? <GraduationCap className="w-6 h-6 text-white" /> : <Users className="w-6 h-6 text-white" />}
          </div>
          <div>
            <div className="text-base font-extrabold text-white">{isStudent ? 'Öğrenci Girişi' : 'Öğretmen / Yönetici'}</div>
            <div className="text-xs text-gray-400">{isStudent ? 'Kariyer yolculuğuna başla' : 'Öğrenci takip paneli'}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">E-posta</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isStudent ? 'ogrenci@okul.edu.tr' : 'ogretmen@okul.edu.tr'}
                className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">Şifre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glow-button py-3 px-4 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
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

        {/* Hızlı Giriş */}
        <div className="mt-5 pt-5 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Hızlı Test Girişleri</span>
          </div>
          <div className="grid gap-2">
            {isStudent ? (
              <>
                <button type="button" onClick={() => handleQuickFill('ogrenci@okul.edu.tr', 'ogrenci123')} className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-all text-left">
                  <GraduationCap className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                  <div><div className="font-semibold">Ali Yılmaz</div><div className="text-[10px] text-gray-400">Öğrenci · ogrenci123</div></div>
                </button>
                <button type="button" onClick={() => handleQuickFill('zeynep@okul.edu.tr', 'zeynep123')} className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-all text-left">
                  <GraduationCap className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                  <div><div className="font-semibold">Zeynep Kaya</div><div className="text-[10px] text-gray-400">Öğrenci · zeynep123</div></div>
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => handleQuickFill('ogretmen@okul.edu.tr', 'ogretmen123')} className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all text-left">
                  <Users className="w-4 h-4 flex-shrink-0 text-purple-400" />
                  <div><div className="font-semibold">Ayşe Rehber</div><div className="text-[10px] text-gray-400">Rehber Öğretmen · ogretmen123</div></div>
                </button>
                <button type="button" onClick={() => handleQuickFill('admin@okul.edu.tr', 'admin123')} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-all text-left">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <div><div className="font-semibold">Yönetici</div><div className="text-[10px] text-gray-400">Admin · admin123</div></div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isStudent && (
        <p className="text-center text-sm text-gray-400">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Ücretsiz Kayıt Olun
          </Link>
        </p>
      )}
    </div>
  );
}
