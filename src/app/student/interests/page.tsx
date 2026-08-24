import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Role } from '@prisma/client';

import { RiasecProfiler } from '@/components/student/riasec-profiler';
import { requireRole } from '@/lib/auth-utils';

export default async function InterestsPage() {
  await requireRole([Role.STUDENT]);
  return (
    <section className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8" aria-labelledby="interests-title">
      <Link href="/student/dashboard" className="flex items-center gap-2 text-xs font-semibold text-indigo-300"><ArrowLeft className="h-4 w-4" /> Öğrenci paneline dön</Link>
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Kariyer ilgi keşfi</p>
        <h1 id="interests-title" className="mt-2 text-3xl font-black text-white">RIASEC İlgi Profili</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-400">30 etkinliği ne kadar yapmak istediğinizi değerlendirin. Sonuç, doğrulanmış program kataloğunu ilgi alanlarınıza göre sıralamaya yardımcı olur; MBTI ve Enneagram puanları bu eşleşmeyi artırmaz veya azaltmaz.</p>
      </header>
      <RiasecProfiler />
    </section>
  );
}
