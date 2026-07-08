'use client';

import { useState, useEffect } from 'react';
import {
  Target, Award, CheckCircle2, Circle, Sparkles, Trash2,
  Briefcase, BookOpen, Users, Heart, Coins, Compass, Trophy
} from 'lucide-react';
import { LifeDomain } from '@prisma/client';

interface PlanStepItem {
  id: string;
  text: string;
  isCompleted?: boolean;
}

interface GoalPlanData {
  id: string;
  domain: string;
  wishText: string;
  selectedGoal: string;
  planSteps: PlanStepItem[];
  isCompleted: boolean;
  xpAwarded: number;
  createdAt: string;
}

const DOMAIN_LABELS: Record<string, { label: string; colorClass: string; bgClass: string; icon: any }> = {
  CAREER: { label: 'Kariyer & Mesleki', colorClass: 'text-indigo-400', bgClass: 'bg-indigo-500/10 border-indigo-500/30', icon: Briefcase },
  ACADEMIC: { label: 'Akademik & Okul', colorClass: 'text-purple-400', bgClass: 'bg-purple-500/10 border-purple-500/30', icon: BookOpen },
  PERSONAL_DEV: { label: 'Kişisel Gelişim', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/30', icon: Sparkles },
  SOCIAL: { label: 'Sosyal & İlişkiler', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/30', icon: Users },
  HEALTH: { label: 'Sağlık & Yaşam Tarzı', colorClass: 'text-rose-400', bgClass: 'bg-rose-500/10 border-rose-500/30', icon: Heart },
  FINANCIAL: { label: 'Finansal Farkındalık', colorClass: 'text-teal-400', bgClass: 'bg-teal-500/10 border-teal-500/30', icon: Coins },
};

export function GoalsTrackerClient() {
  const [goals, setGoals] = useState<GoalPlanData[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [xpCelebration, setXpCelebration] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    setLoading(true);
    try {
      const res = await fetch('/api/student/goals');
      const data = await res.json();
      if (res.ok) {
        setGoals(data.goals || []);
        setXp(data.experiencePoints || 0);
        setLevel(data.currentLevel || 1);
      }
    } catch (err) {
      console.error('Fetch goals error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStep = async (goalId: string, stepId: string) => {
    try {
      const res = await fetch('/api/student/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_STEP',
          goalItemId: goalId,
          stepId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Güncel XP ve Level
        setXp(data.experiencePoints);
        setLevel(data.currentLevel);

        // İlgili hedefi yerel stateta güncelle
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  planSteps: data.steps,
                  isCompleted: data.isCompleted,
                }
              : g
          )
        );

        if (data.xpDelta > 0) {
          setXpCelebration(`+${data.xpDelta} XP Kazandın!`);
          setTimeout(() => setXpCelebration(null), 2500);
        }
      }
    } catch (err) {
      console.error('Toggle step error:', err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Bu hedefi ve altındaki tüm plan maddelerini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/student/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', goalItemId: goalId }),
      });
      if (res.ok) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
      }
    } catch (err) {
      console.error('Delete goal error:', err);
    }
  };

  const currentLevelProgress = (xp % 200) / 2; // 0-200 XP per level -> 0-100%

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Compass className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Hedef ve Plan Takip Paneli Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Celebration Banner */}
      {xpCelebration && (
        <div className="fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm shadow-2xl flex items-center gap-3 animate-bounce">
          <Trophy className="w-6 h-6" />
          <span>{xpCelebration}</span>
        </div>
      )}

      {/* Level & XP Progress Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-400 flex items-center justify-center shadow-xl shadow-amber-500/20 text-black font-black text-2xl">
            L{level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Gelecek Tasarımcısı Seviye {level}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Toplam <span className="text-amber-400">{xp} Deneyim Puanı (XP)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Her tamamladığın plan adımı sana +25 XP, tamamladığın her hedef ekstra +100 XP kazandırır.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-72 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-400">Sonraki Seviye ({level + 1})</span>
            <span className="text-amber-300">{xp % 200} / 200 XP</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500 rounded-full"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Target className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Henüz Kayıtlı Bir Hedefiniz Yok</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Planlar, Hedefler ve İstekler Çalışma Matrisi üzerinden yapay zeka ile hedeflerinizi ve planlarınızı oluşturabilirsiniz.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goalItem) => {
            const domInfo = DOMAIN_LABELS[goalItem.domain] || {
              label: goalItem.domain,
              colorClass: 'text-gray-300',
              bgClass: 'bg-white/5 border-white/10',
              icon: Target,
            };
            const DomIcon = domInfo.icon;
            const completedCount = goalItem.planSteps.filter((s) => s.isCompleted).length;
            const totalCount = goalItem.planSteps.length;

            return (
              <div
                key={goalItem.id}
                className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-6 ${
                  goalItem.isCompleted
                    ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-900/15 via-black/40 to-black/40'
                    : 'border-white/10'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${domInfo.bgClass} ${domInfo.colorClass}`}>
                      <DomIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {domInfo.label}
                      </span>
                      <h3 className="text-base font-extrabold text-white leading-snug">
                        {goalItem.selectedGoal}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goalItem.id)}
                    className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                    title="Hedefi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Wish Reference */}
                {goalItem.wishText && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 italic">
                    <span className="text-amber-300 font-semibold not-italic">Çıkış Hayaliniz: </span>
                    &ldquo;{goalItem.wishText}&rdquo;
                  </div>
                )}

                {/* Action Steps Checklist */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400">Eylem Planı Adımları</span>
                    <span className={completedCount === totalCount && totalCount > 0 ? 'text-emerald-400' : 'text-indigo-300'}>
                      {completedCount} / {totalCount} Tamamlandı
                    </span>
                  </div>

                  <div className="space-y-2">
                    {goalItem.planSteps.length === 0 ? (
                      <p className="text-xs text-gray-500">Bu hedef için adım tanımlanmadı.</p>
                    ) : (
                      goalItem.planSteps.map((step) => {
                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => handleToggleStep(goalItem.id, step.id)}
                            className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                              step.isCompleted
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through opacity-80'
                                : 'bg-black/30 border-white/10 hover:border-white/25 text-white'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {step.isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium leading-relaxed">
                              {step.text}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Completion Status Badge */}
                {goalItem.isCompleted && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Tebrikler! Bu hedefin tüm adımları tamamlandı (+100 XP Bonus Kazanıldı)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
