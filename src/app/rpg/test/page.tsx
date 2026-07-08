import { requireRole } from '@/lib/auth-utils';
import { RpgGameEngine } from '@/components/rpg/rpg-game-engine';
import { Compass, Sparkles } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function RpgTestPage() {
  await requireRole([Role.STUDENT, Role.ADMIN]);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative Lights */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            İnteraktif Kişilik & Motivasyon Keşif Adası
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Gizemli Akademi: <span className="text-gradient">Kariyer Yolculuğu</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            15 sahneli macerada kararlar alın, kendi yolunuzu çizin ve her sahnede +10 XP kazanın!
          </p>
        </div>

        <RpgGameEngine />
      </div>
    </div>
  );
}
