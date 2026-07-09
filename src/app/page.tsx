import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { 
  Compass, Sparkles, ArrowRight, Zap, 
  Brain, Target, Users, Star, Rocket,
  ChevronRight, HeartHandshake, Layers, ChevronDown
} from 'lucide-react';
import { LandingLoginSection } from '@/components/landing/landing-login-section';

export default async function HomePage() {
  // If already logged in, smart-redirect to correct page
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const { role, id } = session.user;
    if (role === Role.TEACHER) redirect('/teacher/dashboard');
    if (role === Role.ADMIN) redirect('/admin/dashboard');
    if (role === Role.STUDENT) {
      const profile = await prisma.profile.findUnique({
        where: { userId: id },
        include: {
          personalityResult: true,
          valueRankings: { take: 1 },
          profileRankings: { take: 1 },
          lifeDomainEntries: { take: 1 },
        },
      });
      if (!profile || !profile.completedOnboarding) redirect('/student/onboarding');

      const hasValues =
        (profile.valueRankings && profile.valueRankings.length > 0) ||
        (profile.profileRankings && profile.profileRankings.length > 0);
      if (!hasValues) redirect('/student/values');
      if (!profile.lifeDomainEntries || profile.lifeDomainEntries.length === 0) redirect('/student/domains');
      if (!profile.personalityResult) redirect('/rpg/test');
      redirect('/student/dashboard');
    }
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-black text-white selection:bg-indigo-500 selection:text-white">
      {/* Ambient Cyber Glow Backgrounds */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold text-indigo-300 backdrop-blur-md shadow-xl hover:border-indigo-500/40 transition-all cursor-default animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
          <span>Yapay Zeka & RPG Destekli Lise Rehberlik ve Kariyer Devrimi</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-none sm:leading-tight">
          Geleceğini Şansa Bırakma, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            Kendi Hikayeni Keşfet!
          </span>
        </h1>

        <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Gizemli Akademi&apos;de 15 sahneli bir serüvene çık, MBTI ve Enneagram motivasyon tipini öğren, sana en uygun TÜBİTAK bursları ve üniversite gelişim programlarıyla kariyer haritanı oluştur.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {/* Scroll to login section */}
          <a
            href="#giris"
            className="w-full sm:w-auto glow-button px-8 py-4 rounded-2xl text-white font-extrabold text-base tracking-wide shadow-2xl flex items-center justify-center gap-3 group"
          >
            <Compass className="w-5 h-5 text-amber-300 group-hover:rotate-45 transition-transform" />
            <span>Hemen Başlat / Giriş Yap</span>
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </a>

          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white font-bold text-base border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5 text-indigo-400" />
            <span>Yeni Öğrenci Hesabı Aç</span>
          </Link>
        </div>

        {/* Quick Test Notice Box */}
        <div className="pt-8 max-w-xl mx-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-black/60 border border-indigo-500/30 text-left flex items-start gap-3.5 backdrop-blur-md shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-300 mt-0.5">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Tek Tıkla Hızlı Deneme</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-extrabold uppercase">Hazır Seed</span>
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Hesap oluşturmadan sistemi denemek mi istiyorsunuz? Aşağıdaki <a href="#giris" className="text-indigo-400 font-bold hover:underline">Giriş Bölümüne</a> giderek “Ali Yılmaz (Öğrenci)”, “Ayşe Rehber (Öğretmen)” veya “Yönetici” butonlarına tek tıkla basarak anında oturum açabilirsiniz!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative z-10 py-12 border-y border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              16 MBTI
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">Kişilik Tipi Analizi</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              9 Enneagram
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">Motivasyon & Kanat Tipi</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400">
              12 Alan
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">360° Yaşam Matrisi</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">
              +100 XP
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">Oyunlaştırılmış Ödül</div>
          </div>
        </div>
      </section>

      {/* Features Showcase Grid */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            SİSTEM ÖZELLİKLERİ
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Geleneksel Rehberliğin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
              Oyunlaştırılmış Geleceği
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-normal">
            Öğrencileri yoran, sıkıcı testler yerine; kendilerini bir hikayenin kahramanı olarak hissettiren psikometrik ölçüm ve kariyer eşleştirme altyapısı.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-indigo-500/40 transition-all duration-300 space-y-5 group hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white group-hover:text-indigo-300 transition-colors">
              RPG Kişilik & Motivasyon Keşfi
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              15 sahneli "Gizemli Akademi" macerasında verdiğin kararlarla arka planda MBTI boyutları ve Enneagram kanat tiplerini hesaplar.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
              <span>Keşif Adasını İncele</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all duration-300 space-y-5 group hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
              12 Yaşam Alanı & Değerler Matrisi
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Akademik, Kariyer, Sağlık, Finansal ve Sosyal hedeflerini 360° yönet. Sürükle-bırak arayüzü ile hayattaki en temel değerlerini sırala.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Hedef Matrisini Keşfet</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/40 transition-all duration-300 space-y-5 group hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
              <Star className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
              Yapay Zeka Rotaları & TÜBİTAK
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Öğrencinin profil skoruna göre en uygun TÜBİTAK bursları, üniversite kampları ve sertifika programlarını % eşleşme oranıyla önerir.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Akıllı Önerilere Göz At</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-pink-500/40 transition-all duration-300 space-y-5 group hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white group-hover:text-pink-300 transition-colors">
              Aile Destek Ağı & Etki Analizi
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Anne, baba ve kardeşlerin meslekleri, eğitim seviyeleri ve öğrencinin kariyer kararlarındaki yakınlık/etki puanlarını ölçümleyen modül.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-pink-400 group-hover:text-pink-300">
              <span>Aile Analizi Yap</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 5 */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-amber-500/40 transition-all duration-300 space-y-5 group hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors">
              Rehber Öğretmen 360° Takibi
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sorumlu olunan sınıflar, kararsız öğrenciler ve risk durumları. Tek ekrandan öğrenci raporunu inceleyip özel danışmanlık notu iletme.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:text-amber-300">
              <span>Öğretmen Panelini Gör</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 6 */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 space-y-5 group hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
              Yönetici (Admin) Görsel Analitiği
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Okul genelindeki MBTI dağılımları, Enneagram oranları ve hedef meslek trendleri. Yeni burs ve gelişim programı ekleme (CRUD) ekranları.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
              <span>Yönetim Kontrol Merkezi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-t border-white/10">
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-indigo-500/30 relative overflow-hidden space-y-6 shadow-2xl bg-gradient-to-b from-indigo-950/20 to-black/60">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Kariyer Yolculuğuna <span className="text-gradient">ROTA</span> Çiz!
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            İster öğrenci olarak kişilik tipini keşfet, ister rehber öğretmen olarak öğrencilerinin gelişimini 360 derece takip et.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#giris"
              className="w-full sm:w-auto glow-button px-8 py-3.5 rounded-xl text-white font-extrabold text-sm shadow-xl"
            >
              Hemen Giriş Yap
            </a>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all"
            >
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* GİRİŞ BÖLÜMÜ — #giris anchor                               */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section id="giris" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-10">
          {/* Başlık */}
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              GİRİŞ YAP
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Kariyerin İçin{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
                ROTA'yı Çiz
              </span>
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Kim olduğunu seç ve hemen başla. Öğretmen mi, öğrenci mi?
            </p>
          </div>

          {/* Giriş formu (Client Component) */}
          <LandingLoginSection />
        </div>
      </section>
    </div>
  );
}
