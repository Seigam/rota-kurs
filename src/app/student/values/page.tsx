import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { ValuesDndRanking } from '@/components/student/values-dnd-ranking';
import { Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function StudentValuesPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { completedOnboarding: true },
  });

  // Onboarding tamamlanmamışsa oraya yönlendir (güvenlik)
  const isOnboardingFlow = profile?.completedOnboarding === true;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative Lights */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">

        {/* Akış adım göstergesi (sadece onboarding akışında yeni gelen öğrencilere) */}
        {isOnboardingFlow && (
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3 overflow-x-auto">
            {/* Adım 1 — Tamamlandı */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">Profil & Aile Bilgisi</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            {/* Adım 2 — Aktif */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-amber-500/30 border border-amber-500/50 flex items-center justify-center animate-pulse">
                <span className="text-xs font-black text-amber-300">2</span>
              </div>
              <span className="text-xs font-bold text-amber-300">Değer Sıralaması</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            {/* Adım 3 — Bekliyor */}
            <div className="flex items-center gap-2 flex-shrink-0 opacity-40">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-xs font-black text-gray-400">3</span>
              </div>
              <span className="text-xs font-semibold text-gray-400">Hedef & Plan Matrisi</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 opacity-40" />
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

        {/* Başlık */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Adım 2 / 6 — İçsel Pusula & Değerler Haritası
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Temel Değerler <span className="text-gradient">Sıralama Çalışması</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mt-1">
            Bir kariyer veya iş ortamında sizin için en vazgeçilmez olan nedir? Aşağıdaki 12 değeri sürükleyerek kendi öncelik sıranıza göre dizin. Kaydettikten sonra Planlar ve Hedefler matrisine geçeceksiniz.
          </p>
        </div>

        <ValuesDndRanking />
      </div>
    </div>
  );
}
