import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { LifeDomainsMatrix } from '@/components/student/life-domains-matrix';
import Link from 'next/link';
import { Target, ArrowLeft, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function StudentDomainsPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { completedOnboarding: true },
  });

  const isOnboardingFlow = profile?.completedOnboarding === true;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative Lights */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Akış adım göstergesi */}
        {isOnboardingFlow && (
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3 overflow-x-auto">
            {/* Adım 1 — Tamamlandı */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">Profil & Aile</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            {/* Adım 2 — Tamamlandı */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">Değer Sıralaması</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            {/* Adım 3 — Aktif */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-indigo-500/30 border border-indigo-500/50 flex items-center justify-center animate-pulse">
                <span className="text-xs font-black text-indigo-300">3</span>
              </div>
              <span className="text-xs font-bold text-indigo-300">Hedef & Plan Matrisi</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            {/* Adım 4 — Bekliyor */}
            <div className="flex items-center gap-2 flex-shrink-0 opacity-40">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-xs font-black text-gray-400">4</span>
              </div>
              <span className="text-xs font-semibold text-gray-400">Kişilik Testi</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 opacity-40" />
            {/* Adım 5 — Bekliyor */}
            <div className="flex items-center gap-2 flex-shrink-0 opacity-40">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-xs font-black text-gray-400">5</span>
              </div>
              <span className="text-xs font-semibold text-gray-400">Test Sonuçları</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 opacity-40" />
            {/* Adım 6 — Bekliyor */}
            <div className="flex items-center gap-2 flex-shrink-0 opacity-40">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-xs font-black text-gray-400">6</span>
              </div>
              <span className="text-xs font-semibold text-gray-400">Önerilen Kurslar</span>
            </div>
          </div>
        )}

        <div>
          <Link href="/student/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Öğrenci Paneline Dön</span>
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Adım 3 / 6 — Bütüncül Gelecek & Yapay Zeka Planlayıcı
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Yapay Zeka Destekli <span className="text-gradient">Hedef ve Eylem Planı</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mt-1">
            İsteklerinizi yazın, yapay zeka sizin için SMART hedefler ve adım adım eylem planları oluştursun! Hazırladığınız planları kaydedip görevleri tamamladıkça Deneyim Puanı (XP) kazanın.
          </p>
        </div>

        <LifeDomainsMatrix />
      </div>
    </div>
  );
}
