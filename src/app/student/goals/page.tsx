import { requireRole } from '@/lib/auth-utils';
import { GoalsTrackerClient } from '@/components/student/goals-tracker-client';
import Link from 'next/link';
import { ArrowLeft, Target, Award, Sparkles } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function StudentGoalsPage() {
  await requireRole([Role.STUDENT, Role.ADMIN]);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative Lights */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/student/dashboard"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Öğrenci Paneline Dön</span>
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Canlı İlerleme & XP Kazanımı
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hedef ve Eylem Planı <span className="text-gradient">Takip Merkezi</span>
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mt-1">
              Belirlediğiniz hedeflere ait adım adım eylem planlarını tamamlayın, maddeleri işaretleyerek Deneyim Puanı (XP) kazanın ve seviyenizi yükseltin!
            </p>
          </div>

          <Link
            href="/student/domains"
            className="glow-button px-5 py-3 rounded-2xl text-white font-extrabold text-xs tracking-wide shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Yeni Hedef & Plan Ekle</span>
          </Link>
        </div>

        <GoalsTrackerClient />
      </div>
    </div>
  );
}
