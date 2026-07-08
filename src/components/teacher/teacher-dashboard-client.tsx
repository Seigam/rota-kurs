'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Search, Filter, CheckCircle2, AlertCircle, Award, 
  Sparkles, ArrowRight, BookOpen, ChevronRight, Target, ShieldCheck 
} from 'lucide-react';

interface StudentItem {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  profile: {
    id: string;
    grade: number | null;
    targetCareer: string | null;
    experiencePoints: number;
    currentLevel: number;
    completedOnboarding: boolean;
    personalityResult: {
      mbtiType: string;
      dominantEnneagram: string;
    } | null;
    valueRankings: Array<{ valueName: string }>;
    counselorNotes: Array<{ content: string; createdAt: string }>;
  } | null;
}

interface StatsData {
  totalStudents: number;
  completedOnboarding: number;
  completedTest: number;
  avgXp: number;
}

export function TeacherDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [stats, setStats] = useState<StatsData>({ totalStudents: 0, completedOnboarding: 0, completedTest: 0, avgXp: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [testFilter, setTestFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const res = await fetch('/api/teacher/students');
        const data = await res.json();
        if (res.ok && data.students) {
          setStudents(data.students);
          setStats(data.stats || stats);
        }
      } catch (err) {
        console.error('Fetch teacher students error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    // Grade filter
    if (selectedGrade !== 'ALL') {
      const gradeNum = parseInt(selectedGrade, 10);
      if (s.profile?.grade !== gradeNum) return false;
    }

    // Test status filter
    if (testFilter === 'COMPLETED' && !s.profile?.personalityResult) return false;
    if (testFilter === 'PENDING' && s.profile?.personalityResult) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = s.name?.toLowerCase().includes(q) || false;
      const matchEmail = s.email?.toLowerCase().includes(q) || false;
      const matchCareer = s.profile?.targetCareer?.toLowerCase().includes(q) || false;
      const matchMbti = s.profile?.personalityResult?.mbtiType?.toLowerCase().includes(q) || false;
      if (!matchName && !matchEmail && !matchCareer && !matchMbti) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Users className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Sınıf Listesi ve Öğrenci Analizleri Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 shadow-xl bg-gradient-to-br from-indigo-950/20 to-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Toplam Öğrenci</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 flex items-center justify-center text-indigo-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalStudents}</div>
          <p className="text-[11px] text-gray-400">Rehberlik sistemine kayıtlı</p>
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 shadow-xl bg-gradient-to-br from-emerald-950/20 to-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profil Tamamlayan</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {stats.completedOnboarding} <span className="text-sm text-gray-400 font-normal">/ {stats.totalStudents}</span>
          </div>
          <p className="text-[11px] text-gray-400">Kişisel ve aile formunu bitirenler</p>
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 shadow-xl bg-gradient-to-br from-purple-950/20 to-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">RPG Testini Bitiren</span>
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-400">
            {stats.completedTest} <span className="text-sm text-gray-400 font-normal">/ {stats.totalStudents}</span>
          </div>
          <p className="text-[11px] text-gray-400">MBTI & Enneagram sonucu olanlar</p>
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 shadow-xl bg-gradient-to-br from-amber-950/20 to-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ortalama Öğrenci XP</span>
            <div className="w-9 h-9 rounded-xl bg-amber-600/30 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300">{stats.avgXp} XP</div>
          <p className="text-[11px] text-gray-400">Aktif etkileşim ve oyunlaştırma ort.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Öğrenci adı, e-posta, meslek veya MBTI tipi ara..."
              className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-2xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Grade Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            <span className="text-xs text-gray-400 font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Sınıf:
            </span>
            {['ALL', '9', '10', '11', '12'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGrade === g
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {g === 'ALL' ? 'Tümü' : `${g}. Sınıf`}
              </button>
            ))}
          </div>
        </div>

        {/* Test Status Filter */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/10 text-xs">
          <span className="text-gray-400 font-bold">Test Durumu:</span>
          <button
            onClick={() => setTestFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${testFilter === 'ALL' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Tüm Öğrenciler ({students.length})
          </button>
          <button
            onClick={() => setTestFilter('COMPLETED')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${testFilter === 'COMPLETED' ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'text-gray-400 hover:text-white'}`}
          >
            ✓ Testi Tamamlayanlar ({stats.completedTest})
          </button>
          <button
            onClick={() => setTestFilter('PENDING')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${testFilter === 'PENDING' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'text-gray-400 hover:text-white'}`}
          >
            ⏳ Bekleyenler ({stats.totalStudents - stats.completedTest})
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider text-left">
                <th className="p-4 pl-6">ÖĞRENCİ</th>
                <th className="p-4">SINIF & HEDEF MESLEK</th>
                <th className="p-4">KİŞİLİK & ENNEagram</th>
                <th className="p-4">SEVİYE & XP</th>
                <th className="p-4">SON REHBERLİK NOTU</th>
                <th className="p-4 pr-6 text-right">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    Kriterlerinize uygun öğrenci bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const prof = s.profile;
                  const pRes = prof?.personalityResult;
                  const latestNote = prof?.counselorNotes?.[0];

                  return (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                      {/* Name & Avatar */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-sm text-white shadow-md">
                            {s.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-extrabold text-white group-hover:text-indigo-300 transition-colors text-sm">
                              {s.name || 'İsimsiz Öğrenci'}
                            </div>
                            <div className="text-[11px] text-gray-400">{s.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Grade & Target Career */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 font-bold text-gray-200 text-[11px]">
                            {prof?.grade ? `${prof.grade}. Sınıf` : 'Lise'}
                          </span>
                          <div className="font-semibold text-indigo-300 flex items-center gap-1">
                            <Target className="w-3 h-3 text-indigo-400" />
                            <span>{prof?.targetCareer || 'Belirtilmedi'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Personality Badge */}
                      <td className="p-4">
                        {pRes ? (
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black text-xs">
                              {pRes.mbtiType}
                            </span>
                            <div className="text-[11px] text-gray-400">{pRes.dominantEnneagram}</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold">
                            <AlertCircle className="w-3 h-3" /> Test Bekliyor
                          </span>
                        )}
                      </td>

                      {/* Level & XP */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-bold text-emerald-400">Seviye {prof?.currentLevel || 1}</div>
                          <div className="text-[11px] text-gray-400">{prof?.experiencePoints || 0} XP</div>
                        </div>
                      </td>

                      {/* Latest Note */}
                      <td className="p-4 max-w-xs">
                        {latestNote ? (
                          <div className="text-[11px] text-gray-300 line-clamp-2 italic">
                            &ldquo;{latestNote.content}&rdquo;
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500">Not eklenmemiş</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <Link
                          href={`/teacher/student/${prof?.id || s.id}`}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md group/btn"
                        >
                          <span>İncele & Not Ekle</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
