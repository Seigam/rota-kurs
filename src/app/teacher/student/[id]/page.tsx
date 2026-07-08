import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { StudentCounselorNotes } from '@/components/teacher/student-counselor-notes';
import Link from 'next/link';
import { 
  Users, ArrowLeft, Sparkles, Target, Star, ShieldCheck, 
  Award, HeartHandshake, Compass, CheckCircle2, AlertCircle, BookOpen, ExternalLink 
} from 'lucide-react';
import { Role } from '@prisma/client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherStudentDetailPage({ params }: PageProps) {
  await requireRole([Role.TEACHER, Role.ADMIN]);
  const { id } = await params;

  // id hhem profile.id hem user.id olabilir
  const profile = await prisma.profile.findFirst({
    where: {
      OR: [{ id }, { userId: id }],
    },
    include: {
      user: true,
      familyMembers: true,
      personalityResult: true,
      valueRankings: {
        orderBy: { rankOrder: 'asc' },
        take: 3,
      },
      domainPlans: true,
      recommendations: {
        include: { program: true },
        orderBy: { matchScore: 'desc' },
        take: 3,
      },
      counselorNotes: {
        include: { counselor: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!profile || !profile.user) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center">
        <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Öğrenci Profili Bulunamadı</h2>
          <p className="text-xs text-gray-400">Belirtilen ID ile eşleşen aktif bir öğrenci kaydı yok.</p>
          <Link href="/teacher/dashboard" className="glow-button px-6 py-2.5 rounded-xl text-white font-bold text-xs inline-block">
            Sınıf Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  const pRes = profile.personalityResult;
  const student = profile.user;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Lights */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <Link href="/teacher/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Sınıf Yönetim Paneline Dön</span>
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                Bütüncül Öğrenci Dosyası
              </span>
              <span className="text-xs text-gray-400 font-semibold">• Seviye {profile.currentLevel} ({profile.experiencePoints} XP)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {student.name || 'İsimsiz Öğrenci'} <span className="text-gradient">({profile.grade || 'Lise'}. Sınıf)</span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              E-posta: {student.email} • Hedef Meslek: <span className="text-white font-bold">{profile.targetCareer || 'Belirtilmedi'}</span>
            </p>
          </div>
        </div>

        {/* Top 3 Profile Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MBTI Personality Box */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl bg-gradient-to-br from-indigo-950/20 to-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">KİŞİLİK & MOTİVASYON</span>
                <h3 className="text-lg font-extrabold text-white">
                  {pRes ? `${pRes.mbtiType} (${pRes.dominantEnneagram})` : 'Test Bekliyor'}
                </h3>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {pRes?.summary || 'Öğrenci henüz Gizemli Akademi RPG testini tamamlamadı.'}
            </p>
            {pRes && (
              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1">
                {(((Array.isArray(pRes.strengths) 
                  ? pRes.strengths 
                  : typeof pRes.strengths === 'string' && pRes.strengths.startsWith('[') 
                    ? JSON.parse(pRes.strengths) 
                    : [pRes.strengths || 'Gelişim Açık']
                )) as string[]).slice(0, 3).map((s: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold">
                    ✓ {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Top 3 Values Box */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl bg-gradient-to-br from-amber-950/20 to-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/30 flex items-center justify-center border border-amber-500/40 text-amber-300">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">TEMEL DEĞERLER</span>
                <h3 className="text-lg font-extrabold text-white">İlk 3 Kariyer Önceliği</h3>
              </div>
            </div>
            {profile.valueRankings.length === 0 ? (
              <p className="text-xs text-gray-400">Değer sıralaması henüz yapılmadı.</p>
            ) : (
              <div className="space-y-2">
                {profile.valueRankings.map((v, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-xs font-bold text-white">
                    <span className="text-amber-400 font-black">#{idx + 1}</span> {v.valueName}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Family & Support Box */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl bg-gradient-to-br from-emerald-950/20 to-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 flex items-center justify-center border border-emerald-500/40 text-emerald-300">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">AİLE VE DESTEK AĞI</span>
                <h3 className="text-lg font-extrabold text-white">{profile.familyMembers.length} Aile Üyesi Kayıtlı</h3>
              </div>
            </div>
            {profile.familyMembers.length === 0 ? (
              <p className="text-xs text-gray-400">Aile bilgisi girilmedi.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {profile.familyMembers.map((fm) => (
                  <div key={fm.id} className="p-2 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-200 flex justify-between">
                    <span className="font-bold">{fm.relationType} ({fm.occupation || 'Belirtilmedi'})</span>
                    <span className="text-emerald-400 font-semibold">{fm.supportLevel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Counselor Notes Section */}
        <StudentCounselorNotes
          studentProfileId={profile.id}
          initialNotes={profile.counselorNotes.map((n) => ({
            id: n.id,
            content: n.content,
            isPrivate: n.isPrivate,
            createdAt: n.createdAt,
            counselor: n.counselor,
          }))}
        />

        {/* AI Recommendations Summary */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/40 text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Yapay Zeka Rotaları</span>
              <h3 className="text-lg font-bold text-white">Öğrenciye Önerilen İlk 3 Program</h3>
            </div>
          </div>

          {profile.recommendations.length === 0 ? (
            <p className="text-xs text-gray-400">Öğrenci henüz program önerisi hesaplamadı.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.recommendations.map((rec) => {
                const prog = rec.program || (rec as any).careerProgram;
                if (!prog) return null;
                return (
                  <div key={prog.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[11px]">
                        %{rec.matchScore} Eşleşme
                      </span>
                      <span className="text-[10px] text-purple-400 font-bold">{prog.provider}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{prog.title}</h4>
                    <p className="text-[11px] text-gray-400 line-clamp-2">{rec.explanation}</p>
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
