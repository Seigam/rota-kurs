import { requireRole } from '@/lib/auth-utils';
import { TeacherDashboardClient } from '@/components/teacher/teacher-dashboard-client';
import { Role } from '@prisma/client';
import { ShieldCheck, Users } from 'lucide-react';

export default async function TeacherDashboardPage() {
  const user = await requireRole([Role.TEACHER, Role.ADMIN]);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Lights */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Rehber Danışmanı Portalı
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Öğretmen / Danışman <span className="text-gradient">Yönetim Paneli</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Sınıfınızdaki öğrencilerin kariyer yönelimlerini, test tamamlama oranlarını ve kişiselleştirilmiş raporlarını buradan izleyebilirsiniz.
            </p>
          </div>
        </div>

        <TeacherDashboardClient />
      </div>
    </div>
  );
}
