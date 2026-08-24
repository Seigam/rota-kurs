'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Layers,
  Cpu,
  Globe,
  Briefcase,
  Palette,
  Rocket,
  TrendingUp,
  Shield,
  Users,
  Code,
  Activity,
  Video,
  Award,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  COMPULSORY_GRADE_LEVELS,
  ELECTIVE_CATEGORIES,
  ElectiveCategory,
} from '@/lib/data/micro-credentials-data';

export default function MicroCredentialsPage() {
  const [activeTab, setActiveTab] = useState<'compulsory' | 'elective'>('compulsory');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Icon mapper helper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Search':
        return <Search className="w-5 h-5" />;
      case 'Code':
        return <Code className="w-5 h-5" />;
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  // Filter electives
  const filteredElectiveCategories = ELECTIVE_CATEGORIES.map((cat) => {
    if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
      return null;
    }

    const filteredCourses = cat.courses.filter((course) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    if (filteredCourses.length === 0) return null;

    return {
      ...cat,
      courses: filteredCourses,
    };
  }).filter(Boolean) as ElectiveCategory[];

  const totalElectiveCoursesCount = ELECTIVE_CATEGORIES.reduce(
    (acc, cat) => acc + cat.courses.length,
    0
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[140px] pointer-events-none" />



      {/* Hero Section */}
      <section className="relative z-20 pt-8 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="flex justify-start pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-all"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Ana Sayfa&apos;ya Dön</span>
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-teal-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest shadow-xl">
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>2026-2027 ROTA GELECEK MÜFREDATI</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
          Geleceğin Yetkinlikleri: <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400">
            Mikro Yeterlilikler Kataloğu
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Zorunlu gelişim akışı ve 13 farklı alanda 80+ seçmeli mikro ders ile lise ve üniversite yolculuğunuzda fark yaratacak becerileri inceleyin.
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-400">5 Sınıf</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Zorunlu Kademe Akışı</div>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-purple-400">13 Kategori</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Seçmeli Tematik Alan</div>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-teal-400">80+ Ders</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mikro Kurs İçeriği</div>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">Sertifikalı</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mikro Yeterlilik Rozeti</div>
          </div>
        </div>

        {/* Main Tab Switcher */}
        <div className="pt-6 flex justify-center">
          <div className="p-1.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-2 backdrop-blur-md shadow-2xl">
            <button
              onClick={() => setActiveTab('compulsory')}
              className={`px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2.5 ${
                activeTab === 'compulsory'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Zorunlu Mikro Dersler (Sınıf Akışı)</span>
            </button>

            <button
              onClick={() => setActiveTab('elective')}
              className={`px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2.5 ${
                activeTab === 'elective'
                  ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-lg shadow-teal-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Seçmeli Mikro Dersler ({totalElectiveCoursesCount})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="relative z-20 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* TAB 1: ZORUNLU MİKRO DERSLER */}
        {activeTab === 'compulsory' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Pedagogical Flow Banner */}
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/60 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
                    Pedagojik Gelişim Haritası
                  </span>
                  <h3 className="text-lg font-extrabold text-white">
                    Adım Adım Geleceğe Hazırlayan Müfredat
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kademeli Yetkinlik İnşası</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {COMPULSORY_GRADE_LEVELS.map((g, idx) => (
                  <div
                    key={g.grade}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 relative"
                  >
                    <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                      {idx + 1}. AŞAMA
                    </div>
                    <div className="text-xs font-extrabold text-white">{g.grade}</div>
                    <div className="text-[11px] font-semibold text-gray-400">{g.flowStep}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compulsory Grade Level Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {COMPULSORY_GRADE_LEVELS.map((gradeData) => (
                <div
                  key={gradeData.grade}
                  className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-indigo-500/40 transition-all space-y-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    {/* Grade Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold text-white bg-gradient-to-r ${gradeData.badgeColor} uppercase tracking-wider mb-1.5 shadow-md`}
                        >
                          {gradeData.flowStep}
                        </span>
                        <h3 className="text-2xl font-black text-white tracking-tight">
                          {gradeData.grade}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-400 block">Ders Odak Alanı:</span>
                        <span className="text-xs font-extrabold text-indigo-300">
                          {gradeData.focus}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                      {gradeData.description}
                    </p>

                    {/* Courses List */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span>Zorunlu Mikro Kurslar ({gradeData.courses.length})</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-3">
                        {gradeData.courses.map((course) => (
                          <div
                            key={course.title}
                            className="bg-black/40 hover:bg-black/60 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-sm font-extrabold text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                                {course.title}
                              </h5>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Zorunlu
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {course.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {course.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5"
                                >
                                  #{skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SEÇMELİ MİKRO DERSLER */}
        {activeTab === 'elective' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Search & Filter Bar */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 bg-black/50 backdrop-blur-md shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Mikro ders adı, yetkinlik veya etiket ara (ör: Python, AI, Finans, Canva...)"
                    className="w-full bg-black/60 border border-white/10 focus:border-teal-500 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-400 focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-white"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === 'all'
                      ? 'bg-teal-500 text-black font-black shadow-lg shadow-teal-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Tüm Kategoriler ({ELECTIVE_CATEGORIES.length})</span>
                </button>

                {ELECTIVE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-lg'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {getCategoryIcon(cat.iconName)}
                    <span>{cat.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Elective Categories Grid */}
            {filteredElectiveCategories.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto">
                <Search className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">Sonuç Bulunamadı</h3>
                <p className="text-xs text-gray-400">
                  Aradığınız kriterlere uygun seçmeli mikro ders bulunamadı. Lütfen arama terimini veya filtreyi değiştirin.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="glow-button px-5 py-2.5 rounded-xl text-white font-bold text-xs"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {filteredElectiveCategories.map((category) => (
                  <div key={category.id} className="space-y-5">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-white shadow-lg`}
                      >
                        {getCategoryIcon(category.iconName)}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-white">{category.title}</h3>
                        <p className="text-xs text-gray-400 font-normal">{category.description}</p>
                      </div>
                    </div>

                    {/* Courses Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {category.courses.map((course) => (
                        <div
                          key={course.title}
                          className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-teal-500/40 transition-all space-y-4 flex flex-col justify-between group hover:-translate-y-1 bg-black/40 shadow-xl"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {course.duration}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                {course.level}
                              </span>
                            </div>

                            <h4 className="text-base font-extrabold text-white group-hover:text-teal-300 transition-colors leading-snug">
                              {course.title}
                            </h4>

                            <p className="text-xs text-gray-300 leading-relaxed font-normal">
                              {course.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                            {course.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <footer className="relative z-20 border-t border-white/10 bg-black/60 py-12 px-4 text-center space-y-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <h3 className="text-2xl font-extrabold text-white">
            Kendi Yetkinlik Rotanı Oluşturmaya Hazır mısın?
          </h3>
          <p className="text-xs sm:text-sm text-gray-400">
            Hemen ücretsiz ROTA öğrenci hesabını aç, MBTI & Enneagram kişilik keşif adasına katıl ve sana özel mikro ders önerilerini al!
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/#giris"
              className="glow-button px-8 py-3.5 rounded-2xl text-white font-extrabold text-xs tracking-wide shadow-xl flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              <span>Giriş Yap / Hesabına Eriş</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
