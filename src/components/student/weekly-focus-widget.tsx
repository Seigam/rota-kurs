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

  useEffect(() => {
    let cancelled = false;

    const loadGoals = async () => {
      try {
        const res = await fetch('/api/student/goals');
        const data = await res.json();
        if (!cancelled && res.ok && data.goals) {
          setGoals(data.goals);
        }
      } catch (err) {
        console.error('Haftalık widget hedef yükleme hatası:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadGoals();
    return () => {
      cancelled = true;
    };
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
    <div className="paper-card relative space-y-6 overflow-hidden rounded-[28px] p-5 sm:p-7">
      <div className="pointer-events-none absolute right-0 top-0 size-80 rounded-full bg-amber-200/20 blur-3xl" />

      {/* Başlık ve Tam Ekran Takvime Geçiş Linki */}
      <div className="relative flex flex-col justify-between gap-4 border-b border-[#e6e1d8] pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#f1d4a8] bg-[#fff4df] text-[#a45a08]">
            <CalendarIcon className="size-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#fff4df] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#8a4b06]">
                HAFTALIK AJANDA & TAKVİM
              </span>
              {todaysSteps.length > 0 && todaysCompleted === todaysSteps.length ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#24633b]">
                  <Flame className="size-3.5 fill-[#e96852] text-[#e96852]" aria-hidden="true" /> Bugün tamamlandı
                </span>
              ) : null}
            </div>
            <h3 className="mt-1 text-lg font-black text-[#172033]">
              Bu haftanın planı
            </h3>
          </div>
        </div>

        <Link
          href="/student/goals"
          className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8d2c8] bg-white px-4 text-xs font-extrabold text-[#4338ca] hover:border-[#aaa2e9]"
        >
          <span>Tüm planı aç</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
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
              type="button"
              key={dayItem.dateStr}
              onClick={() => setSelectedDateStr(dayItem.dateStr)}
              aria-pressed={isSelected}
              aria-label={`${dayItem.dayName}, ${dayItem.dateNum}: ${dayStepCount} görev`}
              className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-between min-h-[82px] relative ${
                isToday
                  ? 'bg-[#eeecff] border-[#8e86dd] ring-2 ring-[#c9c5f8]'
                  : isSelected
                  ? 'bg-[#f6f2eb] border-[#9f978a]'
                  : 'bg-white border-[#e6e1d8] hover:border-[#aaa2e9] hover:bg-[#faf9ff]'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#777e8b]">
                {dayItem.dayName}
              </span>
              <span
                className={`text-base sm:text-lg font-extrabold my-0.5 ${
                  isToday ? 'text-[#4338ca]' : 'text-[#172033]'
                }`}
              >
                {dayItem.dateNum}
              </span>

              {dayStepCount > 0 ? (
                <span className="rounded-full bg-[#fff4df] px-2 py-0.5 text-[9px] font-extrabold text-[#8a4b06]">
                  {dayStepCount} Görev
                </span>
              ) : (
                <span className="text-[9px] font-medium text-[#9ca3af]">—</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Seçili Günün Görev Listesi */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#303849]">
            {selectedDateStr === todayStr ? 'Bugün İçin Planlanan Adımlar' : `${selectedDateStr} Tarihli Planlanan Adımlar`}
          </span>
          <span className="text-[11px] font-bold text-[#777e8b]">
            {selectedDaySteps.length} görev
          </span>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-[#686f7d]">Takvim planı yükleniyor...</div>
        ) : selectedDaySteps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d8d2c8] bg-[#f9f6f0] p-5 text-center">
            <p className="text-xs text-[#686f7d]">
              Bu güne planlanmış görev yok.{' '}
              <Link href="/student/goals" className="font-extrabold text-[#4338ca] hover:underline">
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
                <button
                  type="button"
                  key={`${goal.id}___${step.id}`}
                  onClick={() => handleToggleStep(goal.id, step.id)}
                  aria-pressed={isDone}
                  className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                    isDone
                      ? 'border-[#b9d6c1] bg-[#eaf3ec] hover:border-[#75ad84]'
                      : 'border-[#e1dcd3] bg-white hover:border-[#aaa2e9] hover:bg-[#faf9ff]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg shrink-0 flex items-center justify-center border mt-0.5 transition-all ${
                        isDone
                          ? 'border-[#2f7047] bg-[#2f7047] text-white'
                          : 'border-[#a8a19a] bg-white'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                    </div>
                    <div className="space-y-1.5">
                      <p className={`text-xs font-bold leading-snug ${isDone ? 'text-[#477455] line-through' : 'text-[#303849]'}`}>
                        {step.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#777e8b]">
                        <span className="flex items-center gap-1 rounded-md bg-[#fff4df] px-2 py-0.5 font-bold text-[#8a4b06]">
                          <Clock className="w-3 h-3" />
                          {isMultiDay ? 'Çok Günlük' : step.timeRange || 'Tüm Gün'}
                        </span>
                        <div className="flex items-center gap-1 text-[#777e8b]">
                          <Target className="size-3 text-[#4f46e5]" aria-hidden="true" />
                          <span className="line-clamp-1 max-w-[170px]">{goal.selectedGoal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
