'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Kayıt olurken bir hata oluştu.');
        setLoading(false);
        return;
      }

      setSuccess('Hesabın hazır. Şimdi giriş yapıp başlangıç rotanı tamamlayabilirsin.');
      window.setTimeout(() => router.push('/login?registered=1'), 900);
    } catch {
      setError('Sunucu ile bağlantı kurulamadı. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="paper-shell flex flex-1 items-center px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-app-border bg-app-surface shadow-[0_24px_70px_var(--shadow-color)] lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative overflow-hidden bg-app-brand p-7 text-white sm:p-10">
          <div className="absolute -right-16 -top-16 size-48 rounded-full border-[30px] border-white/10" aria-hidden="true" />
          <div className="relative">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/95 shadow-md">
              <LogoMark className="size-8" />
            </span>
            <div className="mt-8">
              <LogoWordmark className="h-6 w-auto" inverted />
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Kendi rotanı oluşturmaya başla.</h1>
            <p className="mt-4 max-w-sm leading-7 text-indigo-100">
              İlk girişte seni kısa bir başlangıç rotası karşılayacak. Profil, değerler ve hedefler adım adım tamamlanacak.
            </p>

            <ol className="mt-8 space-y-3" aria-label="Kayıt sonrası adımlar">
              {['Temel profilini tamamla', 'Önceliklerini ve hedeflerini seç', 'Sana özel önerilerini gör'].map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-sm font-bold text-white">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 text-xs">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <section className="p-6 sm:p-10" aria-labelledby="registration-form-title">
          <div className="flex items-start gap-3 rounded-2xl border border-app-border bg-app-surface-muted p-4">
            <GraduationCap className="mt-0.5 size-5 shrink-0 text-app-brand" aria-hidden="true" />
            <div>
              <h2 id="registration-form-title" className="font-black text-app-text">Ücretsiz öğrenci kaydı</h2>
              <p className="mt-1 text-sm leading-6 text-app-muted">Öğretmen ve yönetici hesapları güvenlik nedeniyle okul yönetimi tarafından oluşturulur.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-2xl border border-app-danger/30 bg-app-danger-soft p-4 text-sm font-semibold text-app-danger">
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div role="status" className="flex items-start gap-2 rounded-2xl border border-app-accent/30 bg-app-accent-soft p-4 text-sm font-semibold text-app-accent">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label htmlFor="register-name" className="mb-2 block text-sm font-extrabold text-app-text">Ad soyad</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-app-subtle" aria-hidden="true" />
                <input id="register-name" name="name" autoComplete="name" type="text" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ali Yılmaz" className="min-h-12 w-full rounded-xl border border-app-border bg-app-surface pl-11 pr-4 text-sm text-app-text" />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="mb-2 block text-sm font-extrabold text-app-text">E-posta adresi</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-app-subtle" aria-hidden="true" />
                <input id="register-email" name="email" autoComplete="email" inputMode="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ogrenci@okul.edu.tr" className="min-h-12 w-full rounded-xl border border-app-border bg-app-surface pl-11 pr-4 text-sm text-app-text" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between gap-4">
                <label htmlFor="register-password" className="text-sm font-extrabold text-app-text">Şifre</label>
                <span id="password-help" className="text-xs font-semibold text-app-muted">En az 6 karakter</span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-app-subtle" aria-hidden="true" />
                <input id="register-password" name="password" autoComplete="new-password" aria-describedby="password-help" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-app-border bg-app-surface pl-11 pr-4 text-sm text-app-text" />
              </div>
            </div>

            <button type="submit" disabled={loading || Boolean(success)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-app-brand px-5 font-extrabold text-white shadow-[0_6px_0_var(--primary-shadow)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Hesabın hazırlanıyor…' : 'Öğrenci hesabı oluştur'}
              {!loading && <ArrowRight className="size-5" aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 text-sm text-app-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-app-accent" aria-hidden="true" />
            <p>Kaydolarak yalnızca öğrenci hesabı oluşturursun. Yetkili personel rolleri bu formdan verilemez.</p>
          </div>

          <p className="mt-6 border-t border-app-border pt-5 text-center text-sm text-app-muted">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="font-extrabold text-app-brand-ink hover:underline">Giriş yap</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
