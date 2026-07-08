import { requireRole } from '@/lib/auth-utils';
import { LifeDomainsMatrix } from '@/components/student/life-domains-matrix';
import Link from 'next/link';
import { Target, ArrowLeft, Sparkles } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function StudentDomainsPage() {
  await requireRole([Role.STUDENT, Role.ADMIN]);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative Lights */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div>
          <Link href="/student/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Öğrenci Paneline Dön</span>
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Bütüncül Gelecek Haritası
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Planlar, Hedefler ve İstekler <span className="text-gradient">Çalışma Matrisi</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mt-1">
            Sadece okul veya kariyer değil; sağlığınızdan sosyal ağlarınıza kadar 6 temel yaşam boyutunu 3 zaman/niyet ekseninde yapılandırın.
          </p>
        </div>

        <LifeDomainsMatrix />
      </div>
    </div>
  );
}
