import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Role } from '@prisma/client';

import { DevelopmentResultClient } from '@/components/student/development-result-client';
import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { getDevelopmentAssessmentResult } from '@/lib/development-assessment-service';

type PageProps = { params: Promise<{ id: string }> };

export default async function DevelopmentResultPage({ params }: PageProps) {
  const user = await requireRole([Role.STUDENT]);
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
  const { id } = await params;
  if (!profile) notFound();
  const result = await getDevelopmentAssessmentResult(id, profile.id);
  if (!result) notFound();
  return <main className="paper-shell flex-1"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"><Link href="/student/development" className="inline-flex min-h-11 items-center gap-2 font-black text-[#4338ca] hover:underline"><ArrowLeft className="size-4" /> Gelişim nabzına dön</Link><header className="mt-5 border-b border-[#ded9cf] pb-8"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#e05d48]">Sonucun hazır</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#172033] sm:text-5xl">Bu ayın kişisel pusulası</h1><p className="mt-3 max-w-3xl text-base leading-7 text-[#626a79]">Yanıtların gelişim alanlarını konuşmak ve küçük bir sonraki adım seçmek için kullanılır; tanı, başarı notu veya kesin kariyer kararı değildir.</p></header><div className="mt-8"><DevelopmentResultClient result={result} /></div></div></main>;
}
