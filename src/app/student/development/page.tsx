import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Role } from '@prisma/client';

import { DevelopmentAssessmentClient } from '@/components/student/development-assessment-client';
import { requireRole } from '@/lib/auth-utils';

export default async function DevelopmentAssessmentPage() {
  await requireRole([Role.STUDENT]);
  return (
    <main className="paper-shell flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link href="/student/dashboard" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl font-black text-[#4338ca] hover:underline"><ArrowLeft className="size-4" /> Öğrenci paneline dön</Link>
        <header className="mb-8 max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#e05d48]">Kişisel pusulan</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#172033] sm:text-5xl">Gelişim Nabzım</h1><p className="mt-3 text-base leading-7 text-[#626a79]">Üç ana alandaki durumunu ve önceliklerini görünür hale getir; bu ay için sahiplenebileceğin küçük bir hedef seç.</p></header>
        <DevelopmentAssessmentClient />
      </div>
    </main>
  );
}
