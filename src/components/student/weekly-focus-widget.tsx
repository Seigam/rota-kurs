'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Check, Flame, ArrowRight, Clock, Target } from 'lucide-react';

interface PlanStepItem {
  id: string;
  text: string;
  isCompleted?: boolean;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string | null;
  startDate?: string | null;
  timeRange?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isAllDay?: boolean;
  color?: string;
}

interface GoalPlanData {
  id: string;
  domain: string;
  wishText: string;
  selectedGoal: string;
  planSteps: PlanStepItem[];
  isCompleted?: boolean;
}

export function WeeklyFocusWidget() {
  const [goals, setGoals] = useState<GoalPlanData[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  // Bu haftanın pazartesisini bul
  const currentDayOfWeek = (today.getDay() + 6) % 7; // Pzt=0 ... Paz=6
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - currentDayOfWeek);

  const weekDays: Array<{ dayName: string; dateNum: number; dateStr: string }> = [];
  const dayNamesTr = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    weekDays.push({
      dayName: dayNamesTr[i],
      dateNum: d.getDate(),
      dateStr: `${yStr}-${mStr}-${dayStr}`,
    });
  }

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/student/goals');
      const data = await res.json();
      if (res.ok && data.goals) {
        setGoals(data.goals);
      }
    } catch (err) {
      console.error('Haftalık widget hedef yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Tüm hedeflerdeki adımları toplayalım
  const allSteps: Array<{
    step: PlanStepItem;
    goal: GoalPlanData;
  }> = [];

  goals.forEach((goal) => {
    (goal.planSteps || []).forEach((step) => {
      allSteps.push({ step, goal });
    });
  });

  // Bir görevin belirli bir gün içinde olup olmadığını hesapla
  const isDateInStepRange = (dateStr: string, step: PlanStepItem) => {
    const sDate = step.startDate || step.dueDate;
    const eDate = step.dueDate || step.startDate;
    if (!sDate && !eDate) return false;
    if (sDate && eDate) {
      return dateStr >= sDate && dateStr <= eDate;
    }
    return dateStr === sDate || dateStr === eDate;
  };

  const selectedDaySteps = allSteps.filter((item) => isDateInStepRange(selectedDateStr, item.step));
  const todaysSteps = allSteps.filter((item) => isDateInStepRange(todayStr, item.step));
  const todaysCompleted = todaysSteps.filter(
    (item) => item.step.status === 'DONE' || item.step.isCompleted
  ).length;

  const handleToggleStep = async (goalId: string, stepId: string) => {
    try {
      const res = await fetch('/api/student/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_STEP', goalItemId: goalId, stepId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id !== goalId) return g;
            return {
              ...g,
              planSteps: data.steps,
              isCompleted: data.isCompleted,
            };
          })
        );
      }
    } catch (err) {
      console.error('Adım durumu değiştirilemedi:', err);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Başlık ve Tam Ekran Takvime Geçiş Linki */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                HAFTALIK AJANDA & TAKVİM
              </span>
              {todaysSteps.length > 0 && todaysCompleted === todaysSteps.length ? (
                <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Bugün Tamamlandı!
                </span>
              ) : null}
            </div>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              Bu Haftanın Odak ve Görev Takvimi
            </h3>
          </div>
        </div>

        <Link
          href="/student/goals"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 border border-white/10"
        >
          <span>Tüm Takvimi & Panoyu Aç</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 7 Günlük Yatay Takvim Şeridi */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {weekDays.map((dayItem) => {
          const isToday = dayItem.dateStr === todayStr;
          const isSelected = dayItem.dateStr === selectedDateStr;
          const dayStepCount = allSteps.filter((s) => isDateInStepRange(dayItem.dateStr, s.step)).length;

          return (
            <button
              key={dayItem.dateStr}
              onClick={() => setSelectedDateStr(dayItem.dateStr)}
              className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-between min-h-[82px] relative ${
                isToday
                  ? 'bg-gradient-to-b from-indigo-600/30 to-purple-600/30 border-indigo-400/80 ring-2 ring-indigo-500/40 shadow-lg'
                  : isSelected
                  ? 'bg-white/15 border-white/40'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                {dayItem.dayName}
              </span>
              <span
                className={`text-base sm:text-lg font-extrabold my-0.5 ${
                  isToday ? 'text-indigo-300' : 'text-white'
                }`}
              >
                {dayItem.dateNum}
              </span>

              {dayStepCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {dayStepCount} Görev
                </span>
              ) : (
                <span className="text-[9px] text-gray-500 font-medium">-</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Seçili Günün Görev Listesi */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-300">
            {selectedDateStr === todayStr ? 'Bugün İçin Planlanan Adımlar' : `${selectedDateStr} Tarihli Planlanan Adımlar`}
          </span>
          <span className="text-[11px] text-gray-400">
            {selectedDaySteps.length} görev
          </span>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-gray-400">Takvim planı yükleniyor...</div>
        ) : selectedDaySteps.length === 0 ? (
          <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
            <p className="text-xs text-gray-400">
              Bu güne planlanmış görev yok.{' '}
              <Link href="/student/goals" className="text-indigo-400 hover:underline font-semibold">
                Takvime görev atamak için tıklayın.
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedDaySteps.map(({ step, goal }) => {
              const isDone = step.status === 'DONE' || step.isCompleted;
              const isMultiDay = step.startDate && step.dueDate && step.startDate !== step.dueDate;
              return (
                <div
                  key={`${goal.id}___${step.id}`}
                  onClick={() => handleToggleStep(goal.id, step.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                      : 'bg-white/5 border-white/10 hover:border-indigo-400/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg shrink-0 flex items-center justify-center border mt-0.5 transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-white/30 bg-black/40'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                    </div>
                    <div className="space-y-1.5">
                      <p className={`text-xs font-semibold leading-snug ${isDone ? 'text-emerald-200 line-through' : 'text-gray-100'}`}>
                        {step.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md font-bold">
                          <Clock className="w-3 h-3" />
                          {isMultiDay ? 'Çok Günlük' : step.timeRange || 'Tüm Gün'}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Target className="w-3 h-3 text-indigo-400" />
                          <span className="line-clamp-1 max-w-[170px]">{goal.selectedGoal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
