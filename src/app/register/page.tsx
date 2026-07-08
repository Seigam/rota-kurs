'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, GraduationCap, Users, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Kayıt olurken bir hata oluştu.');
        setLoading(false);
      } else {
        setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err) {
      setError('Sunucu ile bağlantı kurulamadı.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 shadow-xl shadow-indigo-500/20 mb-2">
            <Compass className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Yeni Hesap <span className="text-gradient">Oluştur</span>
          </h1>
          <p className="text-sm text-gray-400">
            Kariyer ve keşif yolculuğuna başlamak için rolünüzü seçin ve kaydolun.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Role Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Giriş Rolünüzü Seçiniz
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    role === 'STUDENT'
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <GraduationCap className={`w-6 h-6 ${role === 'STUDENT' ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <span className="text-xs font-bold">Öğrenci</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('TEACHER')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    role === 'TEACHER'
                      ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Users className={`w-6 h-6 ${role === 'TEACHER' ? 'text-purple-400' : 'text-gray-500'}`} />
                  <span className="text-xs font-bold">Öğretmen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    role === 'ADMIN'
                      ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Shield className={`w-6 h-6 ${role === 'ADMIN' ? 'text-emerald-400' : 'text-gray-500'}`} />
                  <span className="text-xs font-bold">Yönetici</span>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Ad Soyad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ali Yılmaz"
                  className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Email Input */}
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
                  placeholder="ogrenci@okul.edu.tr"
                  className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glow-button py-3 px-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Kayıt Ol ve Başla</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400">
          Zaten bir hesabınız var mı?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
