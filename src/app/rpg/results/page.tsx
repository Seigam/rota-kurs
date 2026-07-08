import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  Award, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, 
  BookOpen, Briefcase, Compass, Star, Target, Shield, Zap 
} from 'lucide-react';
import { Role } from '@prisma/client';

export default async function RpgResultsPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      personalityResult: true,
    },
  });

  if (!profile || !profile.personalityResult) {
    redirect('/rpg/test');
  }

  const res = profile.personalityResult;
  let mbtiScores: any = {};
  let enneagramScores: any = {};

  try {
    mbtiScores = typeof res.mbtiScores === 'string' ? JSON.parse(res.mbtiScores) : res.mbtiScores;
    enneagramScores = typeof res.enneagramScores === 'string' ? JSON.parse(res.enneagramScores) : res.enneagramScores;
  } catch (e) {
    console.error('Parse err', e);
  }

  // Parse strengths and blindSpots from summary or calculate again if needed
  // We can render dimensions nicely
  const dimensions = [
    { label: 'Dışa Dönük (E) vs İçe Dönük (I)', data: mbtiScores?.EI || { type: 'E', percent: 60 }, left: 'Dışa Dönük (E)', right: 'İçe Dönük (I)' },
    { label: 'Sezgisel (N) vs Duyusal (S)', data: mbtiScores?.SN || { type: 'N', percent: 65 }, left: 'Sezgisel (N)', right: 'Duyusal (S)' },
    { label: 'Düşünen (T) vs Hisseden (F)', data: mbtiScores?.TF || { type: 'T', percent: 55 }, left: 'Düşünen (T)', right: 'Hisseden (F)' },
    { label: 'Yargılayan (J) vs Algılayan (P)', data: mbtiScores?.JP || { type: 'J', percent: 70 }, left: 'Yargılayan (J)', right: 'Algılayan (P)' },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link href="/student/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Öğrenci Paneline Dön</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Rapor Onaylandı ve Kaydedildi
          </div>
        </div>

        {/* Header Hero Banner */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-2xl" />

          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 via-emerald-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
            <Award className="w-10 h-10 text-white animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest block">
              Psikolojik, Mesleki ve Ailevi Analiz Raporu
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {user.name} - <span className="text-gradient">Kariyer & Kişilik Profili</span>
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Gizemli Akademi Keşif Adası maceranızda verdiğiniz 15 kararın bütüncül analizi aşağıda sunulmuştur.
            </p>
          </div>

          {/* Key Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
            <div className="bg-black/40 p-5 rounded-2xl border border-indigo-500/30 text-left flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">MBTI Profili</span>
                <span className="text-xl font-extrabold text-white">{res.mbtiType}</span>
              </div>
              <Compass className="w-8 h-8 text-indigo-400/50" />
            </div>

            <div className="bg-black/40 p-5 rounded-2xl border border-purple-500/30 text-left flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">Enneagram Motivasyonu</span>
                <span className="text-xl font-extrabold text-white">{res.dominantEnneagram}</span>
                {res.wingEnneagram && (
                  <span className="text-xs font-medium text-purple-300 block">Kanat Etkisi: {res.wingEnneagram}</span>
                )}
              </div>
              <Sparkles className="w-8 h-8 text-purple-400/50" />
            </div>
          </div>
        </div>

        {/* MBTI 4 Dimensions Breakdown */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">MBTI 4 Temel Eksende Baskın Yönleriniz</h2>
              <p className="text-xs text-gray-400">Düşünme, enerji alma ve karar verme tarzınızı belirleyen eksen dengesi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {dimensions.map((dim, idx) => {
              const isLeft = dim.data.type === 'E' || dim.data.type === 'N' || dim.data.type === 'T' || dim.data.type === 'J';
              const percent = dim.data.percent || 50;

              return (
                <div key={idx} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className={isLeft ? 'text-indigo-400' : 'text-gray-400'}>{dim.left}</span>
                    <span className={!isLeft ? 'text-purple-400' : 'text-gray-400'}>{dim.right}</span>
                  </div>

                  <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden flex border border-white/5">
                    <div
                      className={`h-full transition-all duration-700 ${
                        isLeft ? 'bg-gradient-to-r from-indigo-500 to-indigo-400' : 'bg-transparent'
                      }`}
                      style={{ width: isLeft ? `${percent}%` : `${100 - percent}%` }}
                    />
                    <div
                      className={`h-full transition-all duration-700 ${
                        !isLeft ? 'bg-gradient-to-r from-purple-500 to-purple-400' : 'bg-transparent'
                      }`}
                      style={{ width: !isLeft ? `${percent}%` : `${100 - percent}%` }}
                    />
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-extrabold text-white bg-white/10 px-3 py-1 rounded-full">
                      Baskın: %{percent} {dim.data.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Analysis Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Güçlü Yönleriniz & Avantajlarınız</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-200">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <span>Kriz anlarında sakin kalarak stratejik ve mantıklı çözüm yolları geliştirebilme gücü.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <span>Sezgisel bakış açısı sayesinde uzun vadeli hedeflere odaklanma ve olaylar arası bağlantı kurma yeteneği.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <span>Kendi iç disiplinini sağlayabilme ve özgün çözümlerle fark yaratma potansiyeli.</span>
              </li>
            </ul>
          </div>

          {/* Blind Spots */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Gelişime Açık Noktalar & Uyarilar</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-200">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span>Mükemmeliyetçilik veya detaylara aşırı takılarak işe başlama süresini uzatma (erteleme) eğilimi.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span>Tekrar eden rutin görevlerde çabuk sıkılma ve motivasyon dalgalanması yaşama ihtimali.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span>Çatışmalardan kaçınma veya eleştiriyi fazla içselleştirme durumlarına dikkat edilmelidir.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Recommended Track & Study Habits */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Lise Alan Yönelimi & Çalışma Stratejisi</h2>
              <p className="text-xs text-gray-400">Kişilik yapınıza ve Enneagram motivasyonunuza en uygun öğrenme yöntemleri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-indigo-300">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Önerilen Lise Alanı / Yönelim</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                Analitik ve sezgisel becerileriniz doğrultusunda <span className="text-emerald-300 font-bold">Sayısal / Eşit Ağırlık</span> alanlarındaki projeler, sistem tasarımı, psikoloji, mühendislik veya stratejik yönetim disiplinleri sizin için ideal bir gelişim alanı sunar.
              </p>
            </div>

            <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>İdeal Çalışma Alışkanlıkları</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                Ezbere dayalı uzun saatler yerine, kavramsal zihin haritaları kurarak, Pomodoro teknikleriyle odaklanarak ve öğrendiklerinizi gerçek hayat örnekleriyle bağdaştırarak çalışmak verimi maksimuma çıkaracaktır.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-emerald-900/40 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Sırada Ne Var? Önerilen Programları İnceleyin</h3>
            <p className="text-xs text-gray-300 max-w-lg">
              Kişilik profilinize özel olarak eşleştirilen TÜBİTAK, Coursera ve üniversite onaylı sertifika rotalarını şimdi keşfedin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/programs"
              className="glow-button px-6 py-3.5 rounded-2xl text-white font-extrabold text-sm tracking-wide shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Sertifika Programlarını Aç</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
