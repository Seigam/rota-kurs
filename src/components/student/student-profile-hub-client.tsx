'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  User,
  FileText,
  Award,
  CheckCircle2,
  Target,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Compass,
  AlertCircle
} from 'lucide-react';
import { OnboardingProfileForm } from '@/components/student/onboarding-profile-form';

interface StudentProfileHubProps {
  user: {
    name: string | null;
    email: string | null;
  };
  profile: any;
  stats: {
    totalGoals: number;
    completedGoals: number;
    totalSteps: number;
    completedSteps: number;
    completionRate: number;
    hasPersonalityTest: boolean;
  };
}

export function StudentProfileHubClient({
  user,
  profile,
  stats,
}: StudentProfileHubProps) {
  const [activeTab, setActiveTab] = useState<'STATS' | 'PROFILE' | 'REPORTS'>('STATS');

  return (
    <div className="space-y-8">
      {/* Üst Profil Künyesi */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl text-white font-extrabold text-2xl">
            {user.name?.charAt(0).toUpperCase() || 'Ö'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {profile?.grade ? `${profile.grade}. Sınıf Öğrencisi` : 'Lise Öğrencisi'}
              </span>
              {profile?.completedOnboarding ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Profil Güncel
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Profil Eksik
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {user.name}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Hedef Kariyer / Alan: <span className="text-indigo-300 font-semibold">{profile?.targetCareer || 'Henüz Belirtilmedi'}</span>
            </p>
          </div>
        </div>

        {/* Hızlı Bilgi Özeti */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">GÖREV BAŞARISI</span>
            <span className="text-lg font-extrabold text-emerald-400">%{stats.completionRate}</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">ENVANTER DURUMU</span>
            <span className="text-lg font-extrabold text-indigo-300">
              {stats.hasPersonalityTest ? 'Tamamlandı' : 'Bekliyor'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Ana Sekme Gezinti Çubuğu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
        <button
          onClick={() => setActiveTab('STATS')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all ${
            activeTab === 'STATS'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Akademik İstatistikler & Performans</span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all ${
            activeTab === 'PROFILE'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Kişisel & Akademik Profilim</span>
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all ${
            activeTab === 'REPORTS'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Rehberlik & Envanter Raporlarım</span>
        </button>
      </div>

      {/* SEKME 1: AKADEMİK İSTATİSTİKLER & PERFORMANS */}
      {activeTab === 'STATS' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>Planlanan Adımlar</span>
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">{stats.totalSteps}</p>
              <p className="text-[11px] text-gray-400">Takvim üzerinde oluşturulan görev</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>Tamamlanan Adımlar</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400">{stats.completedSteps}</p>
              <p className="text-[11px] text-gray-400">Başarıyla bitirilen adım sayısı</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>Genel Başarı Oranı</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-amber-400">%{stats.completionRate}</p>
              <p className="text-[11px] text-gray-400">Hedef gerçekleştirme yüzdesi</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>Rehberlik Envanteri</span>
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-extrabold text-purple-300">
                {stats.hasPersonalityTest ? 'Tamamlandı' : 'Bekliyor'}
              </p>
              <p className="text-[11px] text-gray-400">Öğrenme tarzı ve eğilim analizi</p>
            </div>
          </div>

          {/* İstatistik Detay Kartı */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Akademik İlerleyiş ve Hedef Durumu
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Bu ekranda haftalık hedeflerinizin gerçekleşme oranlarını, ajandanızdaki tamamlanmış görevlerinizi ve
              akademik gelişim sürecinizi takip edebilirsiniz. Haftalık görev planlamalarınızı düzenli olarak 
              Hedef Takibi sayfasından güncelleyerek ilerleme oranınızı artırabilirsiniz.
            </p>
            <div className="pt-2">
              <Link
                href="/student/goals"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
              >
                <span>Haftalık Takvime Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SEKME 2: KİŞİSEL & AKADEMİK PROFİLİM */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-indigo-500/10 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Öğrenci Bilgi ve Karar Ağı Formu</h4>
              <p className="text-xs text-gray-300 mt-0.5">
                Onboarding sürecinde girdiğiniz kişisel, aile ve hedef meslek bilgilerinizi aşağıdan güncelleyebilirsiniz.
              </p>
            </div>
          </div>

          <OnboardingProfileForm initialData={profile} />
        </div>
      )}

      {/* SEKME 3: REHBERLİK & ENVANTER RAPORLARIM */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Rehberlik & Envanter Değerlendirme Raporları</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Çözdüğünüz rehberlik envanterlerinin detaylı raporlarına ve danışmanlık özetlerine buradan erişebilirsiniz.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Akademik Rehberlik Arşivi
              </span>
            </div>

            {profile?.personalityResult ? (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-extrabold text-lg">
                      {profile.personalityResult.mbtiType || 'RP'}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        Öğrenme Tarzı ve Kişilik Eğilim Raporu
                      </h4>
                      <p className="text-xs text-gray-400">
                        {profile.personalityResult.title || 'Akademik Eğilim Değerlendirmesi'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/rpg/results"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                  >
                    Detaylı Raporu İncele
                  </Link>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {profile.personalityResult.description ||
                    'Envanter sonucunuza göre güçlü akademik becerileriniz ve gelişime açık yönleriniz analiz edilmiştir.'}
                </p>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-3">
                <Compass className="w-10 h-10 text-indigo-400 mx-auto opacity-75" />
                <div>
                  <h4 className="text-sm font-bold text-white">Henüz Envanter Raporu Bulunmuyor</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    Öğrenme tarzınızı ve güçlü yönlerinizi belirlemek için rehberlik envanterini çözerek rapor oluşturabilirsiniz.
                  </p>
                </div>
                <Link
                  href="/rpg/test"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-block"
                >
                  Envanteri Çöz
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
