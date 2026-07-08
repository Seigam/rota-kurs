import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Award, Sparkles, Compass, Target, Star, Heart, ArrowRight, 
  CheckCircle2, BookOpen, ExternalLink, Printer, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { Role } from '@prisma/client';

export default async function StudentResultsPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      personalityResult: true,
      valueRankings: {
        orderBy: { rankOrder: 'asc' },
        take: 3,
      },
      domainPlans: true,
      recommendations: {
        include: { program: true },
        orderBy: { matchScore: 'desc' },
        take: 4,
      },
      counselorNotes: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!profile) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center">
        <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Profil Bulunamadı</h2>
          <p className="text-xs text-gray-400">Raporunuzun oluşması için önce profilinizi ve RPG testini tamamlayın.</p>
          <Link href="/student/dashboard" className="glow-button px-6 py-2.5 rounded-xl text-white font-bold text-xs inline-block">
            Panele Dön
          </Link>
        </div>
      </div>
    );
  }

  const pRes = profile.personalityResult;
  const careerPlan = profile.domainPlans.find((d) => d.domain === 'CAREER' && d.columnType === 'GOAL')?.contentText;
  const academicPlan = profile.domainPlans.find((d) => d.domain === 'ACADEMIC' && d.columnType === 'GOAL')?.contentText;
  const latestNote = profile.counselorNotes[0];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Lights */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Top Header & Print CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                Resmi Rehberlik Özet Raporu
              </span>
              <span className="text-xs text-gray-400 font-semibold">• Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Bütüncül Gelecek & <span className="text-gradient">Kariyer Pusulası</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Sayın <span className="text-white font-bold">{user.name}</span> ({profile.grade}. Sınıf) için yapay zeka ve rehberlik sentezi ile hazırlanmış kapsamlı rapor.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rpg/results"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Detaylı MBTI Analizi</span>
            </Link>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="glow-button px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Raporu Yazdır / PDF</span>
            </button>
          </div>
        </div>

        {/* Section 1: Personality Summary & Top Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MBTI & Enneagram Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 bg-gradient-to-br from-indigo-950/20 to-black/40 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Kişilik Kodunuz</span>
                  <h3 className="text-xl font-extrabold text-white">
                    {pRes ? `${pRes.mbtiType} • ${pRes.dominantEnneagram}` : 'Test Henüz Yapılmadı'}
                  </h3>
                </div>
              </div>
              {pRes && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {pRes.enneagramWing}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {pRes?.summary || 'Gizemli Akademi RPG macerasına katılarak kişisel güç alanlarınızı ve kariyer motivasyonlarınızı keşfedin.'}
            </p>

            {pRes && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Öne Çıkan Güçlü Yönler:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(((Array.isArray(pRes.strengths) 
                    ? pRes.strengths 
                    : typeof pRes.strengths === 'string' && pRes.strengths.startsWith('[') 
                      ? JSON.parse(pRes.strengths) 
                      : [pRes.strengths || 'Gelişim Açık']
                  )) as string[]).slice(0, 4).map((s: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top 3 Core Values Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 bg-gradient-to-br from-amber-950/20 to-black/40 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-300">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">İçsel Motivasyon</span>
                  <h3 className="text-xl font-extrabold text-white">En Öncelikli 3 Değeriniz</h3>
                </div>
              </div>
              <Link href="/student/values" className="text-xs text-amber-400 hover:underline font-bold">
                Düzenle →
              </Link>
            </div>

            {profile.valueRankings.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/5 text-center space-y-2">
                <p className="text-xs text-gray-400">Değerler çalışma kağıdını henüz sıralamadınız.</p>
                <Link href="/student/values" className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs inline-block">
                  Sıralamayı Yap
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {profile.valueRankings.map((v, idx) => (
                  <div key={v.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </div>
                    <span className="text-sm font-bold text-white">{v.valueName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Goals & Counselor Note */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Life Domains Goals Highlights */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/40 text-purple-300">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Kariyer & Akademik Hedef Özeti</h3>
              </div>
              <Link href="/student/domains" className="text-xs text-purple-400 hover:underline font-bold">
                Tüm Matris →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">💼 Kariyer Hedefim:</span>
                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {careerPlan || 'Henüz kariyer hedefini yazmadınız. Matrise giderek ekleyin.'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">🎓 Akademik Hedefim:</span>
                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {academicPlan || 'Sınav veya üniversite hedefi belirtilmedi.'}
                </p>
              </div>
            </div>
          </div>

          {/* Counselor Note Preview */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl bg-gradient-to-br from-emerald-950/20 to-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 flex items-center justify-center border border-emerald-500/40 text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Rehber Öğretmen Notu</span>
                <h3 className="text-base font-bold text-white">Son Görüşme Özetiniz</h3>
              </div>
            </div>

            {latestNote ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-300 leading-relaxed italic bg-black/40 p-3.5 rounded-xl border border-emerald-500/20">
                  &ldquo;{latestNote.content}&rdquo;
                </p>
                <span className="text-[10px] text-gray-500 block text-right">
                  Tarih: {new Date(latestNote.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <p className="text-xs text-gray-400">Rehber öğretmeniniz henüz görüşme notu eklemedi.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: AI Recommended Programs Top Highlights */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Yapay Zeka Sentezi</span>
                <h3 className="text-xl font-extrabold text-white">Sizin İçin En Yüksek Eşleşmeli 4 Program</h3>
              </div>
            </div>
            <Link
              href="/student/programs"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <span>Tüm Rotaları İncele</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {profile.recommendations.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 text-center space-y-3">
              <p className="text-sm text-gray-300">Öneri rotalarınız henüz hesaplanmadı.</p>
              <Link href="/student/programs" className="glow-button px-6 py-2.5 rounded-xl text-white font-bold text-xs inline-block">
                Öneri Motorunu Çalıştır
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.recommendations.map((rec) => {
                const prog = rec.program || (rec as any).careerProgram;
                if (!prog) return null;
                return (
                  <div key={prog.id} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-extrabold text-xs">
                        %{rec.matchScore} Eşleşme
                      </span>
                      <span className="text-[11px] font-bold text-purple-400">{prog.provider}</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{prog.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{prog.description}</p>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                      <span>Süre: {prog.duration}</span>
                      <a href={prog.url || '#'} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-bold flex items-center gap-1">
                        <span>İncele</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
