'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Compass,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const demoAccounts = [
  { label: 'Öğrenci demosu', email: 'ogrenci@okul.edu.tr', password: 'ogrenci123', icon: GraduationCap },
  { label: 'Öğretmen demosu', email: 'ogretmen@okul.edu.tr', password: 'ogretmen123', icon: ShieldCheck },
  { label: 'Yönetici demosu', email: 'admin@okul.edu.tr', password: 'admin123', icon: ShieldCheck },
];

export default function LoginPage() {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      const redirectResponse = await fetch('/api/auth/redirect');
      const redirectData = await redirectResponse.json();
      router.push(redirectData.redirectTo || '/');
      router.refresh();
    } catch {
      setError('Giriş yapılırken beklenmeyen bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <div className="paper-shell flex flex-1 items-center px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-app-border bg-app-surface shadow-[0_24px_70px_var(--shadow-color)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-app-brand p-7 text-white sm:p-10">
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full border-[38px] border-white/10" aria-hidden="true" />
          <div className="relative flex h-full flex-col">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/15"><Compass className="size-6" aria-hidden="true" /></span>
            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-100">FutuRoute</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Kaldığın yerden devam et.</h1>
            <p className="mt-4 max-w-sm leading-7 text-indigo-100">Hesabın rolünü otomatik tanır; öğrenci, öğretmen ve yönetici için tek ve güvenli giriş.</p>
            <div className="mt-auto pt-10 text-sm font-bold text-indigo-100">Sıradaki adımın girişten sonra hazır olacak.</div>
          </div>
        </aside>

        <section className="p-6 sm:p-10" aria-labelledby="login-form-title">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-app-brand">Hesabına giriş yap</p>
            <h2 id="login-form-title" className="mt-2 text-3xl font-black tracking-tight text-app-text">Hoş geldin</h2>
            <p className="mt-2 text-sm text-app-muted">Rol seçmene gerek yok; e-posta ve şifren yeterli.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-2xl border border-app-danger/30 bg-app-danger-soft p-4 text-sm font-semibold text-app-danger">
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-extrabold text-app-text">E-posta adresi</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-app-subtle" aria-hidden="true" />
                <input id="login-email" name="email" autoComplete="email" inputMode="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="adiniz@okul.edu.tr" className="min-h-12 w-full rounded-xl border border-app-border bg-app-surface pl-11 pr-4 text-sm text-app-text" />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-extrabold text-app-text">Şifre</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-app-subtle" aria-hidden="true" />
                <input id="login-password" name="password" autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-app-border bg-app-surface pl-11 pr-4 text-sm text-app-text" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-app-brand px-5 font-extrabold text-white shadow-[0_6px_0_var(--primary-shadow)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
              {!loading && <ArrowRight className="size-5" aria-hidden="true" />}
            </button>
          </form>

          <details className="mt-6 rounded-2xl border border-app-border bg-app-surface-muted p-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-extrabold text-app-text">
              <Sparkles className="size-4 text-app-warning" aria-hidden="true" />
              Test hesaplarını göster
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button key={account.email} type="button" onClick={() => handleQuickFill(account.email, account.password)} className="min-h-11 rounded-xl border border-app-border bg-app-surface p-3 text-left text-xs font-bold text-app-text hover:border-app-brand">
                    <Icon className="mb-2 size-4 text-app-brand" aria-hidden="true" />
                    {account.label}
                  </button>
                );
              })}
            </div>
          </details>

          <p className="mt-6 border-t border-app-border pt-5 text-center text-sm text-app-muted">
            Öğrenci hesabın yok mu?{' '}
            <Link href="/register" className="font-extrabold text-app-brand-ink hover:underline">Ücretsiz kayıt ol</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
