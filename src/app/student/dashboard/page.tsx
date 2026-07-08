import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Sparkles, GraduationCap, Compass, BookOpen, Award, ArrowRight, 
  Users, CheckCircle2, AlertTriangle, Star, Shield, HeartHandshake, Target 
} from 'lucide-react';
import { Role } from '@prisma/client';

export default async function StudentDashboardPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      familyMembers: true,
      personalityResult: true,
      testAnswers: true,
    },
  });

  const xp = profile?.experiencePoints || 0;
  const level = profile?.currentLevel || 1;
  const nextLevelXp = level * 100;
  const xpPercentage = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Ambient Lights */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Top Profile Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 font-extrabold text-2xl text-white">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {profile?.grade ? `${profile.grade}. Sınıf Öğrencisi` : 'Lise Öğrencisi'}
                </span>
                {profile?.completedOnboarding ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Profil Tamamlandı
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> Eksik Profil
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Merhaba, <span className="text-gradient">{user.name}</span>!
              </h1>
              <p className="text-sm text-gray-400">
                Hedef Meslek: <span className="text-indigo-300 font-semibold">{profile?.targetCareer || 'Belirtilmedi'}</span>
              </p>
            </div>
          </div>

          {/* Level & XP Widget */}
          <div className="w-full md:w-auto min-w-[240px] bg-black/40 p-5 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seviye & XP</span>
              <span className="text-sm font-extrabold text-emerald-400">Seviye {level}</span>
            </div>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 font-medium">
              <span>{xp} XP</span>
              <span>Sonraki Seviye: {nextLevelXp} XP</span>
            </div>
          </div>
        </div>

        {/* Onboarding Alert if not completed */}
        {!profile?.completedOnboarding && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-500/30 flex-shrink-0">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Öncelikli Adım: Kişisel ve Aile Profilinizi Tamamlayın!</h3>
                <p className="text-xs text-gray-300">
                  Size en uygun RPG senaryosunu hazırlamamız için 3 adımlı kısa formu doldurun ve anında <span className="text-amber-300 font-bold">+50 XP kazanın</span>.
                </p>
              </div>
            </div>
            <Link
              href="/student/onboarding"
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-sm whitespace-nowrap shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
            >
              <span>Formu Doldur</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Main Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: RPG Keşif Adası */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-300 shadow-lg">
                <Compass className="w-8 h-8 animate-spin-slow" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider mb-2">
                  15 Sahneli Oyunlaştırılmış Test
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Gizemli Akademi / Keşif Adası
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  İnteraktif senaryolarla seçimlerinizi yapın. MBTI kişilik profilinizi ve Enneagram motivasyonlarınızı keşfedin.
                </p>
              </div>
            </div>

            <Link
              href="/rpg/test"
              className="w-full glow-button py-3 px-4 rounded-xl text-white font-bold text-sm text-center flex items-center justify-center gap-2 group relative z-10"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{profile?.personalityResult ? 'Sonuçları / Macerayı İncele' : 'Keşif Adasına Başla'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Yaşam Alanları Çalışma Matrisi */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-600/30 flex items-center justify-center border border-amber-500/40 text-amber-300 shadow-lg">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider mb-2">
                  6 Yaşam Alanı × 3 Sütun
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  Planlar & Hedefler Matrisi
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Kariyer, akademi, sağlık ve sosyal yaşam alanlarında somut planlarınızı, hedeflerinizi ve hayallerinizi yapılandırın.
                </p>
              </div>
            </div>

            <Link
              href="/student/domains"
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition-all relative z-10"
            >
              <span>Matrisi Doldur (+30 XP)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: Kariyer & Sertifika Programları */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/30 flex items-center justify-center border border-purple-500/40 text-purple-300 shadow-lg">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider mb-2">
                  25+ Önerilen Program
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  Kariyer & Sertifika Rotaları
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Kişilik analizinize uygun TÜBİTAK, Coursera, MEB ve üniversite sertifika programları listesi.
                </p>
              </div>
            </div>

            <Link
              href="/student/programs"
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition-all relative z-10"
            >
              <span>Programları İncele</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 4: Aile İletişimi & Rehber Öğretmen */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 flex items-center justify-center border border-emerald-500/40 text-emerald-300 shadow-lg">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider mb-2">
                  Çatışma Çözümü & İletişim
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Danışmanlık & Aile Uyumu
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Ailenizin beklentileri ile kendi hayalleriniz arasındaki dengeyi kurun. Rehber öğretmen notlarını görüntüleyin.
                </p>
              </div>
            </div>

            <Link
              href="/student/counseling"
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition-all relative z-10"
            >
              <span>Rehberlik Raporumu Gör</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Secondary Modules Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-300 flex-shrink-0">
                <Star className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Sürükle-Bırak Sıralama</span>
                <h3 className="text-lg font-bold text-white">Temel Kariyer Değerleri Haritası</h3>
                <p className="text-xs text-gray-400 mt-0.5">Sizin için en önemli 12 iş ve yaşam değerini önceliklendirin.</p>
              </div>
            </div>
            <Link
              href="/student/values"
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs whitespace-nowrap shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
            >
              <span>Sırala (+30 XP)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-300 flex-shrink-0">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Yapay Zeka Destekli</span>
                <h3 className="text-lg font-bold text-white">Kişiselleştirilmiş Öneri Rotaları</h3>
                <p className="text-xs text-gray-400 mt-0.5">MBTI, Enneagram ve Yaşam Alanlarınıza göre filtrelenmiş eşleşmeler.</p>
              </div>
            </div>
            <Link
              href="/student/programs"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs whitespace-nowrap shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
            >
              <span>Akıllı Eşleşmeler</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs text-gray-400 font-medium">Toplam XP</span>
            <div className="text-2xl font-extrabold text-white">{xp} XP</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs text-gray-400 font-medium">Tamamlanan RPG Sahne</span>
            <div className="text-2xl font-extrabold text-indigo-400">{profile?.testAnswers?.length || 0} / 15</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs text-gray-400 font-medium">Kişilik Profili</span>
            <div className="text-2xl font-extrabold text-purple-400">
              {profile?.personalityResult?.mbtiType || 'Eksik'}
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs text-gray-400 font-medium">Sosyal Destek Ağınız</span>
            <div className="text-2xl font-extrabold text-emerald-400">{profile?.familyMembers?.length || 0} Kişi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
