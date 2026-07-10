'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Target, Award, CheckCircle2, Circle, Sparkles, Trash2,
  Briefcase, BookOpen, Users, Heart, Coins, Compass, Trophy,
  Plus, GripVertical, Clock, PlayCircle, CheckCircle, ArrowRight, X,
  ExternalLink, GraduationCap, RefreshCw,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Flame, LayoutGrid, Check
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

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
  isCompleted: boolean;
  xpAwarded: number;
  createdAt: string;
}

const DOMAINS_LIST = [
  { id: 'CAREER', label: 'Kariyer & Mesleki', icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  { id: 'ACADEMIC', label: 'Akademik & Okul', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  { id: 'PERSONAL_DEV', label: 'Kişisel Gelişim', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  { id: 'SOCIAL', label: 'Sosyal & İlişkiler', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { id: 'HEALTH', label: 'Sağlık & Yaşam Tarzı', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
  { id: 'FINANCIAL', label: 'Finansal Farkındalık', icon: Coins, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' },
];

const COLUMNS = [
  { id: 'TODO', label: 'Plan Adımları', sub: 'Bekleyen Görevler', icon: Clock, color: 'text-indigo-400', border: 'border-indigo-500/30', bgHeader: 'bg-indigo-500/10' },
  { id: 'IN_PROGRESS', label: 'Yapılacaklar', sub: 'Bu Hafta Odaklanılanlar', icon: PlayCircle, color: 'text-amber-400', border: 'border-amber-500/30', bgHeader: 'bg-amber-500/10' },
  { id: 'DONE', label: 'Bitirildi', sub: 'Tamamlananlar (+25 XP)', icon: CheckCircle, color: 'text-emerald-400', border: 'border-emerald-500/30', bgHeader: 'bg-emerald-500/10' },
];

export function GoalsTrackerClient() {
  const [goals, setGoals] = useState<GoalPlanData[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState<string>('CAREER');
  const [xpCelebration, setXpCelebration] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'CALENDAR'>('KANBAN');

  const handleUpdateStepDate = async (
    goalId: string,
    stepId: string,
    dueDate: string | null,
    startDate?: string | null,
    timeRange?: string | null,
    startTime?: string | null,
    endTime?: string | null,
    isAllDay?: boolean,
    color?: string
  ) => {
    // 1. OPTIMISTIC UI UPDATE: Sıfır gecikme ile arayüzü anında güncelle
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          planSteps: (g.planSteps || []).map((s) => {
            if (s.id !== stepId) return s;
            return {
              ...s,
              dueDate: dueDate !== undefined ? dueDate : s.dueDate,
              startDate: startDate !== undefined ? startDate : s.startDate,
              timeRange: timeRange !== undefined ? timeRange : s.timeRange,
              startTime: startTime !== undefined ? startTime : s.startTime,
              endTime: endTime !== undefined ? endTime : s.endTime,
              isAllDay: isAllDay !== undefined ? isAllDay : s.isAllDay,
              color: color !== undefined ? color : s.color,
            };
          }),
        };
      })
    );

    // 2. Arka planda sunucuya kaydet
    try {
      await fetch('/api/student/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STEP_DATE',
          goalItemId: goalId,
          stepId,
          dueDate,
          startDate,
          timeRange,
          startTime,
          endTime,
          isAllDay,
          color,
        }),
      });
    } catch (err) {
      console.error('Tarih güncellenemedi:', err);
    }
  };

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
        if (data.xpDelta > 0) {
          setXpCelebration(`+${data.xpDelta} XP Kazandın! 🎉`);
          setTimeout(() => setXpCelebration(null), 2500);
          setXp(data.experiencePoints);
          setLevel(data.currentLevel);
        }
      }
    } catch (err) {
      console.error('Adım durumu değiştirilemedi:', err);
    }
  };

  // Yeni görev ekleme kutuları state
  const [addingCol, setAddingCol] = useState<string | null>(null);
  const [newStepText, setNewStepText] = useState('');
  const [addingGoalId, setAddingGoalId] = useState<string | null>(null);

  // 60 FPS akıcı sürükleme için DragOverlay state
  const [activeDragItem, setActiveDragItem] = useState<{
    id: string;
    step: PlanStepItem;
    goal: GoalPlanData;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    setLoading(true);
    try {
      const res = await fetch('/api/student/goals');
      const data = await res.json();
      if (res.ok) {
        const list: GoalPlanData[] = data.goals || [];
        setGoals(list);
        setXp(data.experiencePoints || 0);
        setLevel(data.currentLevel || 1);

        // İlk hedefi olan alanı varsayılan sekme yap
        const firstDomainWithGoals = DOMAINS_LIST.find((d) =>
          list.some((g) => g.domain === d.id)
        );
        if (firstDomainWithGoals) {
          setActiveDomain(firstDomainWithGoals.id);
        }
      }
    } catch (err) {
      console.error('Fetch goals error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Aktif kategorideki hedefler
  const domainGoals = goals.filter((g) => g.domain === activeDomain);

  // Bir adımın statüsünü bul (eğer status yoksa isCompleted değerine bak)
  function getStepStatus(step: PlanStepItem): 'TODO' | 'IN_PROGRESS' | 'DONE' {
    if (step.status) return step.status;
    return step.isCompleted ? 'DONE' : 'TODO';
  }

  // Drag Start işleyicisi (60 FPS pürüzsüz DragOverlay için)
  const handleDragStart = (event: DragStartEvent) => {
    const activeIdStr = String(event.active.id);
    const parts = activeIdStr.split('___');
    if (parts.length === 2) {
      const [goalId, stepId] = parts;
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        const step = goal.planSteps.find((s) => s.id === stepId);
        if (step) {
          setActiveDragItem({ id: activeIdStr, step, goal });
        }
      }
    }
  };

  // Drag End işleyicisi
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = String(active.id); // Örn: goalId___stepId
    const targetStatus = String(over.id) as 'TODO' | 'IN_PROGRESS' | 'DONE';

    if (!COLUMNS.some((c) => c.id === targetStatus)) return;

    const parts = activeIdStr.split('___');
    if (parts.length !== 2) return;

    const [goalId, stepId] = parts;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const step = goal.planSteps.find((s) => s.id === stepId);
    if (!step) return;

    const currentStatus = getStepStatus(step);
    if (currentStatus === targetStatus) return;

    // Optimistic Update
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          planSteps: g.planSteps.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  status: targetStatus,
                  isCompleted: targetStatus === 'DONE',
                }
              : s
          ),
        };
      })
    );

    if (currentStatus !== 'DONE' && targetStatus === 'DONE') {
      setXpCelebration('+25 XP Kazandın! 🎉');
      setTimeout(() => setXpCelebration(null), 2500);
    }

    try {
      const res = await fetch('/api/student/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STEP_STATUS',
          goalItemId: goalId,
          stepId,
          newStatus: targetStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setXp(data.experiencePoints);
        setLevel(data.currentLevel);
      }
    } catch (err) {
      console.error('Update step status error:', err);
    }
  };

  const handleAddStepSubmit = async (colId: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (!newStepText.trim()) return;

    let targetGoalId = addingGoalId;
    if (!targetGoalId && domainGoals.length > 0) {
      targetGoalId = domainGoals[0].id;
    }

    if (!targetGoalId) {
      alert('Lütfen önce bu alanda bir ana hedef oluşturun (Planlar & Hedefler Sihirbazı).');
      return;
    }

    try {
      const res = await fetch('/api/student/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_STEP',
          goalItemId: targetGoalId,
          stepText: newStepText.trim(),
          status: colId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === targetGoalId
              ? {
                  ...g,
                  planSteps: data.steps,
                }
              : g
          )
        );
        setNewStepText('');
        setAddingCol(null);

        if (colId === 'DONE') {
          setXpCelebration('+25 XP Kazandın! 🎉');
          setTimeout(() => setXpCelebration(null), 2500);
        }
      }
    } catch (err) {
      console.error('Add step error:', err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Bu hedefi ve altındaki tüm plan adımlarını silmek istediğinize emin misiniz?')) return;
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

  const currentLevelProgress = (xp % 200) / 2;

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Compass className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Hedef Takip Paneli ve Kanban Panosu Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Celebration Toast */}
      {xpCelebration && (
        <div className="fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm shadow-2xl flex items-center gap-3 animate-bounce">
          <Trophy className="w-6 h-6" />
          <span>{xpCelebration}</span>
        </div>
      )}

      {/* Level & XP Banner Card */}
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
              Kartları sürükleyip &apos;Bitirildi&apos; sütununa bıraktıkça +25 XP kazanırsın!
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

      {/* Görünüm Değiştirici: Kanban vs Takvim */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white/5 border border-white/10">
        <div>
          <h3 className="text-sm font-extrabold text-white">Çalışma Panosu Görünümü</h3>
          <p className="text-xs text-gray-400">
            Adımlarınızı Sürükle-Bırak sütunlarıyla veya Takvim tarih çizelgesiyle takip edin
          </p>
        </div>

        <div className="flex items-center p-1.5 rounded-2xl bg-black/40 border border-white/10 shrink-0">
          <button
            onClick={() => setViewMode('KANBAN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'KANBAN'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Panosu</span>
          </button>

          <button
            onClick={() => setViewMode('CALENDAR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'CALENDAR'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Etkileşimli Takvim</span>
          </button>
        </div>
      </div>

      {/* Domain Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Yaşam Alanı Kategorileri</h3>
          <span className="text-xs text-gray-400">Kategori seçip altındaki Kanban panosunda adımları yönetin</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DOMAINS_LIST.map((domain) => {
            const Icon = domain.icon;
            const isActive = activeDomain === domain.id;
            const stepCount = goals
              .filter((g) => g.domain === domain.id)
              .reduce((acc, g) => acc + (g.planSteps?.length || 0), 0);

            return (
              <button
                key={domain.id}
                onClick={() => setActiveDomain(domain.id)}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 relative ${
                  isActive
                    ? `${domain.bg} ring-2 ring-white/20 shadow-lg scale-[1.02]`
                    : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-75 hover:opacity-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-white/5'} ${domain.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {domain.label}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {stepCount} Adım
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Domain Goals Info Bar */}
      {domainGoals.length > 0 && (
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Bu Kategorideki Ana Hedefleriniz
            </span>
            <div className="flex flex-wrap gap-2">
              {domainGoals.map((g) => (
                <div
                  key={g.id}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 flex items-center gap-2"
                >
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold line-clamp-1 max-w-[280px]">{g.selectedGoal}</span>
                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    className="text-gray-400 hover:text-rose-400 transition-colors ml-1"
                    title="Bu hedefi sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KANBAN BOARD veya TAKVİM GÖRÜNÜMÜ */}
      {viewMode === 'CALENDAR' ? (
        <GoalsCalendarView
          goals={goals}
          onUpdateStepDate={handleUpdateStepDate}
          onToggleStep={handleToggleStep}
        />
      ) : domainGoals.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Target className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Bu Kategoride Kayıtlı Hedefiniz Yok</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Planlar ve Hedefler Sihirbazı üzerinden bu alana özel SMART hedefler ve eylem planı oluşturabilirsiniz.
            </p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragItem(null)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((col) => {
              const ColIcon = col.icon;
              const stepsInCol: Array<{ step: PlanStepItem; goal: GoalPlanData }> = [];

              domainGoals.forEach((g) => {
                (g.planSteps || []).forEach((s) => {
                  if (getStepStatus(s) === col.id) {
                    stepsInCol.push({ step: s, goal: g });
                  }
                });
              });

              return (
                <KanbanDroppableColumn
                  key={col.id}
                  col={col}
                  stepsCount={stepsInCol.length}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${col.bgHeader} ${col.color}`}>
                        <ColIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{col.label}</h4>
                        <p className="text-[10px] text-gray-400">{col.sub}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/10 text-white">
                      {stepsInCol.length}
                    </span>
                  </div>

                  {/* Sütun İçeriği */}
                  <div className="space-y-3 min-h-[220px]">
                    {stepsInCol.length === 0 ? (
                      <div className="h-44 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-4">
                        <p className="text-xs text-gray-500">Bu sütunda görev bulunmuyor</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">Görevleri buraya sürükleyip bırakın</p>
                      </div>
                    ) : (
                      stepsInCol.map(({ step, goal }) => (
                        <DraggableStepCard
                          key={`${goal.id}___${step.id}`}
                          id={`${goal.id}___${step.id}`}
                          step={step}
                          goal={goal}
                        />
                      ))
                    )}
                  </div>

                  {/* Görev Ekle Butonu */}
                  <div className="pt-2">
                    {addingCol === col.id ? (
                      <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                        {domainGoals.length > 1 && (
                          <select
                            value={addingGoalId || domainGoals[0].id}
                            onChange={(e) => setAddingGoalId(e.target.value)}
                            className="w-full text-xs bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-gray-200"
                          >
                            {domainGoals.map((g) => (
                              <option key={g.id} value={g.id}>
                                Hedef: {g.selectedGoal.slice(0, 45)}...
                              </option>
                            ))}
                          </select>
                        )}
                        <input
                          type="text"
                          placeholder="Yeni adım açıklamasını yazın..."
                          value={newStepText}
                          onChange={(e) => setNewStepText(e.target.value)}
                          className="w-full text-xs bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setAddingCol(null);
                              setNewStepText('');
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] text-gray-400 hover:text-white transition-colors"
                          >
                            İptal
                          </button>
                          <button
                            onClick={() => handleAddStepSubmit(col.id as any)}
                            className="px-3 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                          >
                            Ekle
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingCol(col.id);
                          setAddingGoalId(domainGoals[0]?.id || null);
                        }}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Yeni Görev Ekle</span>
                      </button>
                    )}
                  </div>
                </KanbanDroppableColumn>
              );
            })}
          </div>

          {/* 60 FPS GPU Hızlandırmalı Yüzen DragOverlay */}
          <DragOverlay
            dropAnimation={{
              duration: 220,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {activeDragItem ? (
              <StepCardPreview step={activeDragItem.step} goal={activeDragItem.goal} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Yapılacaklar & Plan Adımlarınız İçin Akıllı Kurs ve Kaynak Önerileri */}
      <CourseRecommendationsSection activeDomain={activeDomain} domainGoals={domainGoals} />
    </div>
  );
}

// Droppable Sütun Bileşeni
function KanbanDroppableColumn({
  col,
  children,
}: {
  col: any;
  stepsCount: number;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`glass-panel p-4 rounded-3xl border flex flex-col space-y-4 transition-all ${
        isOver
          ? 'ring-2 ring-indigo-500/60 bg-white/10 border-indigo-500/40 scale-[1.01]'
          : 'border-white/10 bg-white/5'
      }`}
    >
      {children}
    </div>
  );
}

// Draggable Kart Bileşeni (Listede kalır veya sürüklenirken yarı saydam hayalet olur)
function DraggableStepCard({
  id,
  step,
  goal,
}: {
  id: string;
  step: PlanStepItem;
  goal: GoalPlanData;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  });

  const isDone = step.status === 'DONE' || step.isCompleted;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`p-3.5 rounded-2xl border cursor-grab active:cursor-grabbing relative group ${
        isDragging
          ? 'opacity-30 border-dashed border-indigo-400/50 bg-indigo-500/10 scale-95'
          : isDone
          ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 transition-colors'
          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 transition-colors'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 pr-4">
          <p className={`text-xs leading-relaxed font-medium ${isDone ? 'text-emerald-200 line-through' : 'text-gray-200'}`}>
            {step.text}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <Target className="w-3 h-3 text-amber-400" />
            <span className="line-clamp-1 max-w-[190px]">{goal.selectedGoal}</span>
          </div>
        </div>

        <div className="text-gray-500 group-hover:text-gray-300 transition-colors pt-0.5">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// 60 FPS Ekran Üzerinde Yüzen DragOverlay Önizleme Kartı
function StepCardPreview({
  step,
  goal,
  isOverlay = false,
}: {
  step: PlanStepItem;
  goal: GoalPlanData;
  isOverlay?: boolean;
}) {
  const isDone = step.status === 'DONE' || step.isCompleted;

  return (
    <div
      className={`p-3.5 rounded-2xl border cursor-grabbing relative ${
        isOverlay
          ? 'shadow-2xl shadow-indigo-500/30 border-indigo-400/80 bg-slate-900/95 backdrop-blur-xl scale-105 ring-2 ring-indigo-500/50'
          : 'bg-white/10 border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 pr-4">
          <p className={`text-xs leading-relaxed font-medium ${isDone ? 'text-emerald-200 line-through' : 'text-gray-100'}`}>
            {step.text}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <Target className="w-3 h-3 text-amber-400" />
            <span className="line-clamp-1 max-w-[190px]">{goal.selectedGoal}</span>
          </div>
        </div>

        <div className="text-indigo-400 pt-0.5">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Yapılacaklar & Plan Adımları İçin Akıllı Kurs ve Kaynak Önerileri Bileşeni
// -----------------------------------------------------------------------------
interface CourseRecommendation {
  id: string;
  title: string;
  platform: string;
  level: string;
  duration: string;
  relatedStep: string;
  reason: string;
  url: string;
}

function CourseRecommendationsSection({
  activeDomain,
  domainGoals,
}: {
  activeDomain: string;
  domainGoals: GoalPlanData[];
}) {
  const [recs, setRecs] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const domainInfo = DOMAINS_LIST.find((d) => d.id === activeDomain);

  const inProgressSteps: string[] = [];
  const todoSteps: string[] = [];

  domainGoals.forEach((goal) => {
    (goal.planSteps || []).forEach((step) => {
      const status = step.status || (step.isCompleted ? 'DONE' : 'TODO');
      if (status === 'IN_PROGRESS') inProgressSteps.push(step.text);
      else if (status === 'TODO') todoSteps.push(step.text);
    });
  });

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/ai/course-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: activeDomain,
          domainLabel: domainInfo?.label || activeDomain,
          inProgressSteps,
          todoSteps,
        }),
      });
      const data = await res.json();
      if (res.ok && data.recommendations) {
        setRecs(data.recommendations);
      }
    } catch (err) {
      console.error('Kurs önerileri alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeDomain, domainGoals.length]);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden mt-10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Başlık ve AI Yenileme Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Yapılacaklar & Planlarına Özel
              </span>
              <span className="text-[11px] font-medium text-gray-400">
                {domainInfo?.label}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              Akıllı Kurs & Eğitim Kaynağı Önerileri
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Kanban panonuzdaki &apos;Yapılacaklar&apos; sütununuzu hızlandıracak seçilmiş ücretsiz ve sertifikalı eğitimler
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all shrink-0 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'AI Önerileri Hazırlanıyor...' : 'AI ile Öneri Yenile'}</span>
        </button>
      </div>

      {/* Öneriler Listesi Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
          <p className="text-xs text-gray-400 animate-pulse">
            Yapılacaklar listeniz analiz ediliyor ve size en uygun kurslar seçiliyor...
          </p>
        </div>
      ) : recs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xs text-gray-500">Bu alan için henüz bir kurs önerisi bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {recs.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Platform ve Seviye Etiketleri */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {rec.platform}
                  </span>
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {rec.level}
                  </span>
                </div>

                {/* Kurs Başlığı */}
                <h4 className="text-sm font-extrabold text-white leading-snug group-hover:text-indigo-200 transition-colors">
                  {rec.title}
                </h4>

                {/* İlişkili Görev */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                  <Target className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 block">İlişkili Yapılacak Görev:</span>
                    <p className="text-[11px] text-gray-200 font-medium line-clamp-2 mt-0.5">
                      {rec.relatedStep}
                    </p>
                  </div>
                </div>

                {/* Açıklama */}
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                  {rec.reason}
                </p>
              </div>

              {/* Alt Bilgi ve Kursa Git Butonu */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate max-w-[120px]">{rec.duration}</span>
                </div>

                <a
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>İncele</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// SEÇENEK A: HEDEF TAKİBİ SAYFASI ETKİLEŞİMLİ & OYUNLAŞTIRILMIŞ TAKVİM GÖRÜNÜMÜ
// -----------------------------------------------------------------------------
function GoalsCalendarView({
  goals,
  onUpdateStepDate,
  onToggleStep,
}: {
  goals: GoalPlanData[];
  onUpdateStepDate: (
    goalId: string,
    stepId: string,
    dueDate: string | null,
    startDate?: string | null,
    timeRange?: string | null,
    startTime?: string | null,
    endTime?: string | null,
    isAllDay?: boolean,
    color?: string
  ) => Promise<void>;
  onToggleStep: (goalId: string, stepId: string) => Promise<void>;
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK'>('MONTH');
  const [trayTab, setTrayTab] = useState<'UNSCHEDULED' | 'SELECTED_DAY'>('UNSCHEDULED');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  // Google Takvim Etkinlik Düzenleme Modalı için state
  const [gcalModalStep, setGcalModalStep] = useState<{
    goalId: string;
    step: PlanStepItem;
  } | null>(null);

  const [formStartDate, setFormStartDate] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formIsAllDay, setFormIsAllDay] = useState(true);
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formColor, setFormColor] = useState('bg-indigo-600');

  const [updatingStepIds, setUpdatingStepIds] = useState<Record<string, boolean>>({});

  const triggerStepUpdate = async (
    goalId: string,
    stepId: string,
    dueDate: string | null,
    startDate?: string | null,
    timeRange?: string | null,
    startTime?: string | null,
    endTime?: string | null,
    isAllDay?: boolean,
    color?: string
  ) => {
    if (updatingStepIds[stepId]) return; // Zaten atanıyor! Çift tıklama / lag kopyalarını engelle!
    setUpdatingStepIds((prev) => ({ ...prev, [stepId]: true }));
    try {
      await onUpdateStepDate(
        goalId,
        stepId,
        dueDate,
        startDate,
        timeRange,
        startTime,
        endTime,
        isAllDay,
        color
      );
    } finally {
      setUpdatingStepIds((prev) => ({ ...prev, [stepId]: false }));
    }
  };

  const colorPalettes = [
    { name: 'İndigo', class: 'bg-indigo-600', text: 'text-indigo-200', border: 'border-indigo-500/50' },
    { name: 'Zümrüt', class: 'bg-emerald-600', text: 'text-emerald-200', border: 'border-emerald-500/50' },
    { name: 'Kehribar', class: 'bg-amber-600', text: 'text-amber-200', border: 'border-amber-500/50' },
    { name: 'Gül Pembe', class: 'bg-rose-600', text: 'text-rose-200', border: 'border-rose-500/50' },
    { name: 'Mor', class: 'bg-purple-600', text: 'text-purple-200', border: 'border-purple-500/50' },
  ];

  const timeSlots = useMemo(() => [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
  ], []);

  // Tüm hedeflerdeki adımları useMemo ile önbellekle
  const allStepsWithContext = useMemo(() => {
    const list: Array<{
      step: PlanStepItem;
      goal: GoalPlanData;
      domainColor: string;
      domainBadgeBg: string;
    }> = [];

    goals.forEach((goal) => {
      const domainDef = DOMAINS_LIST.find((d) => d.id === goal.domain);
      const domainColor = domainDef ? domainDef.color : 'text-indigo-400';
      const domainBadgeBg = domainDef ? domainDef.bg : 'bg-indigo-500/10';

      (goal.planSteps || []).forEach((step) => {
        list.push({
          step,
          goal,
          domainColor,
          domainBadgeBg,
        });
      });
    });

    return list;
  }, [goals]);

  // Tarihi atanmamış görevler
  const unscheduledSteps = useMemo(
    () =>
      allStepsWithContext.filter(
        (item) => !item.step.dueDate && !item.step.startDate && !(item.step.status === 'DONE' || item.step.isCompleted)
      ),
    [allStepsWithContext]
  );

  // Google Takvim tarzı gün kontrolü: Bir görevin o gün içinde olup olmadığını hesapla
  const isDateInStepRange = (dateStr: string, step: PlanStepItem) => {
    const sDate = step.startDate || step.dueDate;
    const eDate = step.dueDate || step.startDate;
    if (!sDate && !eDate) return false;
    if (sDate && eDate) {
      return dateStr >= sDate && dateStr <= eDate;
    }
    return dateStr === sDate || dateStr === eDate;
  };

  // Seçili güne ait planlanan adımlar
  const selectedDaySteps = useMemo(
    () => allStepsWithContext.filter((item) => isDateInStepRange(selectedDateStr, item.step)),
    [allStepsWithContext, selectedDateStr]
  );

  // Bugünün görevleri
  const todaysSteps = useMemo(
    () => allStepsWithContext.filter((item) => isDateInStepRange(todayStr, item.step)),
    [allStepsWithContext, todayStr]
  );
  const todaysCompletedCount = useMemo(
    () =>
      todaysSteps.filter((item) => item.step.status === 'DONE' || item.step.isCompleted).length,
    [todaysSteps]
  );

  // Gezinti Fonksiyonları
  const handlePrev = () => {
    const newD = new Date(currentDate);
    if (viewMode === 'MONTH') {
      newD.setMonth(newD.getMonth() - 1);
    } else {
      newD.setDate(newD.getDate() - 7);
    }
    setCurrentDate(newD);
  };

  const handleNext = () => {
    const newD = new Date(currentDate);
    if (viewMode === 'MONTH') {
      newD.setMonth(newD.getMonth() + 1);
    } else {
      newD.setDate(newD.getDate() + 7);
    }
    setCurrentDate(newD);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDateStr(todayStr);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: Array<{ dayNum: number | null; dateStr: string | null }> = [];
    for (let i = 0; i < firstDayWeekday; i++) {
      grid.push({ dayNum: null, dateStr: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      grid.push({ dayNum: d, dateStr: `${year}-${mStr}-${dStr}` });
    }
    return grid;
  }, [year, month]);

  const monthNamesTr = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];

  const openGcalModal = (goalId: string, step: PlanStepItem) => {
    setGcalModalStep({ goalId, step });
    setFormStartDate(step.startDate || selectedDateStr);
    setFormDueDate(step.dueDate || step.startDate || selectedDateStr);
    setFormIsAllDay(step.isAllDay !== undefined ? step.isAllDay : true);
    setFormStartTime(step.startTime || '10:00');
    setFormEndTime(step.endTime || '11:00');
    setFormColor(step.color || 'bg-indigo-600');
  };

  const handleSaveGcalEvent = async () => {
    if (!gcalModalStep) return;
    const formattedTimeRange = formIsAllDay ? 'Tüm Gün' : `${formStartTime} - ${formEndTime}`;
    await triggerStepUpdate(
      gcalModalStep.goalId,
      gcalModalStep.step.id,
      formDueDate || null,
      formStartDate || null,
      formattedTimeRange,
      formStartTime,
      formEndTime,
      formIsAllDay,
      formColor
    );
    setGcalModalStep(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* GOOGLE TAKVİM TARZI ETKİNLİK & ARALIK DÜZENLEME MODALI */}
      {gcalModalStep ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel p-6 rounded-3xl border border-white/20 max-w-lg w-full space-y-6 shadow-2xl">
            {/* Üst Başlık */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">Etkinlik & Tarih Aralığı Düzenle</h4>
                  <p className="text-[11px] text-gray-400">Gelişmiş etkinlik ve zaman aralığı planlayıcı</p>
                </div>
              </div>
              <button
                onClick={() => setGcalModalStep(null)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* İçerik */}
            <div className="space-y-4 text-left">
              {/* Görev Adı */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Planlanan Görev</span>
                <p className="text-sm font-bold text-white mt-0.5">{gcalModalStep.step.text}</p>
              </div>

              {/* Tarih Aralığı Seçimi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <span>📅 Tarih Aralığı (Başlangıç - Bitiş)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block mb-1">Başlangıç Tarihi</span>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => {
                        setFormStartDate(e.target.value);
                        if (e.target.value > formDueDate) setFormDueDate(e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-medium focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block mb-1">Bitiş Tarihi</span>
                    <input
                      type="date"
                      value={formDueDate}
                      min={formStartDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-medium focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Tüm Gün / Saat Aralığı */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Tüm Gün Etkinliği</span>
                    <span className="text-[11px] text-gray-400">Belirli saat aralığı girmeden tüm güne ata</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsAllDay(!formIsAllDay)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      formIsAllDay ? 'bg-indigo-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        formIsAllDay ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {!formIsAllDay ? (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 block mb-1">Başlangıç Saati</span>
                      <select
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium"
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 block mb-1">Bitiş Saati</span>
                      <select
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium"
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Etkinlik Rengi Paleti */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">🎨 Etkinlik Kartı Rengi</label>
                <div className="flex items-center gap-2.5">
                  {colorPalettes.map((item) => (
                    <button
                      key={item.class}
                      type="button"
                      onClick={() => setFormColor(item.class)}
                      className={`h-8 px-3 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all ${
                        item.class
                      } ${
                        formColor === item.class ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Alt Butonlar */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={async () => {
                  await triggerStepUpdate(gcalModalStep.goalId, gcalModalStep.step.id, null, null, null, null, null, true, '');
                  setGcalModalStep(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Takvimden Çıkar</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setGcalModalStep(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleSaveGcalEvent}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  Etkinliği Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 1. Oyunlaştırılmış Zinciri Kırma (Streak) Şeridi */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-amber-300">GÜNLÜK ODAK & SERİ TAKİBİ</span>
              {todaysSteps.length > 0 && todaysCompletedCount === todaysSteps.length ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🔥 Bugünkü Zincir Sağlam!
                </span>
              ) : null}
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Bugün planlanan <strong className="text-white">{todaysSteps.length}</strong> görevin{' '}
              <strong className="text-amber-300">{todaysCompletedCount}</strong> tanesi tamamlandı. Günlük adımlarını bitir zinciri kırma!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToday}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          >
            Bugüne Dön
          </button>
        </div>
      </div>

      {/* 2. Takvim Ana Konteyner ve Kenar Tepsisi */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SOL/ORTA: Takvim Panosu (3 Kolon Kaplar) */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          {/* Gezinti Başlığı */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-extrabold text-white">
                {monthNamesTr[month]} {year}
              </h3>
              <p className="text-xs text-gray-400">
                Google Takvim tarzı çok günlük etkinlikler ve saat aralıkları
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
              >
                Bugün
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Haftanın Günleri Başlıkları */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((dayName, idx) => (
              <div key={idx} className="py-2 text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                {dayName}
              </div>
            ))}
          </div>

          {/* Takvim Izgarası (Google Takvim Tarzı Çok Günlük Şeritler) */}
          <div className="grid grid-cols-7 gap-2.5">
            {daysGrid.map((dayItem, index) => {
              if (!dayItem.dayNum || !dayItem.dateStr) {
                return (
                  <div key={index} className="min-h-[125px] rounded-2xl bg-white/[0.02] border border-white/5" />
                );
              }

              const isToday = dayItem.dateStr === todayStr;
              const isSelected = dayItem.dateStr === selectedDateStr;
              const daySteps = allStepsWithContext.filter((s) => isDateInStepRange(dayItem.dateStr!, s.step));

              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDateStr(dayItem.dateStr!);
                    setTrayTab('SELECTED_DAY');
                  }}
                  className={`min-h-[125px] p-2.5 rounded-2xl border transition-colors duration-150 cursor-pointer flex flex-col justify-between group relative hover:z-50 ${
                    isToday
                      ? 'bg-indigo-500/15 border-indigo-500/60 ring-2 ring-indigo-500/30'
                      : isSelected
                      ? 'bg-white/10 border-white/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                  }`}
                >
                  {/* HOVER OVERVIEW POPOVER KARTI (Günde görev varsa üzerine gelindiğinde görünür) */}
                  {daySteps.length > 0 ? (
                    <div
                      className={`hidden group-hover:block absolute z-50 w-64 p-3.5 rounded-2xl glass-panel bg-gray-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-xl pointer-events-none animate-in fade-in duration-150 ${
                        index % 7 >= 4 ? 'right-0' : 'left-0'
                      } ${
                        index < 14 ? 'top-full mt-2' : 'bottom-full mb-2'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div>
                          <h5 className="text-xs font-extrabold text-white">
                            {dayItem.dayNum} {monthNamesTr[month]} Özeti
                          </h5>
                          <span className="text-[10px] text-gray-400">
                            {daySteps.filter((s) => s.step.status === 'DONE' || s.step.isCompleted).length} / {daySteps.length} Tamamlandı
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          % {Math.round((daySteps.filter((s) => s.step.status === 'DONE' || s.step.isCompleted).length / daySteps.length) * 100 || 0)}
                        </span>
                      </div>

                      {/* Mini İlerleme Çubuğu */}
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden my-2.5">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                          style={{
                            width: `${Math.round((daySteps.filter((s) => s.step.status === 'DONE' || s.step.isCompleted).length / daySteps.length) * 100 || 0)}%`,
                          }}
                        />
                      </div>

                      {/* Görev Listesi Özeti */}
                      <div className="space-y-1.5 max-h-[160px] overflow-hidden">
                        {daySteps.map(({ step, goal }) => {
                          const isDone = step.status === 'DONE' || step.isCompleted;
                          const stepColorClass = step.color || 'bg-indigo-600';
                          return (
                            <div
                              key={`hover___${goal.id}___${step.id}`}
                              className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[10px]"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${stepColorClass}`} />
                                <span className={`font-bold truncate ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                                  {step.text}
                                </span>
                              </div>
                              <span className="text-[9px] font-extrabold text-indigo-300 shrink-0 ml-1">
                                {step.timeRange || 'Tüm Gün'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold ${
                        isToday ? 'text-indigo-300' : 'text-gray-300'
                      }`}
                    >
                      {dayItem.dayNum}
                    </span>
                    {daySteps.length > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-gray-300">
                        {daySteps.length}
                      </span>
                    ) : null}
                  </div>

                  {/* Günün Adımları - Renkli Etkinlik Çubukları */}
                  <div className="space-y-1.5 mt-2 overflow-y-auto max-h-[85px]">
                    {daySteps.map(({ step, goal }) => {
                      const isDone = step.status === 'DONE' || step.isCompleted;
                      const stepColorClass = step.color || 'bg-indigo-600/80';
                      const isMultiDay = step.startDate && step.dueDate && step.startDate !== step.dueDate;

                      return (
                        <div
                          key={`${goal.id}___${step.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openGcalModal(goal.id, step);
                          }}
                          className={`p-1.5 rounded-lg text-[10px] flex items-center justify-between transition-colors shadow-sm ${
                            isDone
                              ? 'bg-emerald-600/40 text-emerald-100 line-through opacity-75 border border-emerald-400/30'
                              : `${stepColorClass} text-white hover:brightness-110`
                          }`}
                          title={`${step.text} - Tarih ve Saat Düzenleyiciyi Aç`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStep(goal.id, step.id);
                              }}
                              className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border border-white/60 hover:bg-white/20"
                            >
                              {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                            </div>
                            <span className="font-bold truncate">{step.text}</span>
                          </div>

                          {/* Zaman rozeti ya da Çok Günlük Şerit işareti */}
                          <span className="text-[9px] font-extrabold px-1 py-0.5 rounded bg-black/20 shrink-0">
                            {isMultiDay ? 'Çok Günlük' : step.timeRange || 'Tüm Gün'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ KENAR ÇUBUĞU: Çift Sekmeli Tepsi */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 flex flex-col space-y-4">
          {/* Sekme Değiştirici */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-black/40 border border-white/10">
            <button
              onClick={() => setTrayTab('UNSCHEDULED')}
              className={`py-1.5 text-[11px] font-extrabold rounded-xl transition-all ${
                trayTab === 'UNSCHEDULED'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bekleyenler ({unscheduledSteps.length})
            </button>
            <button
              onClick={() => setTrayTab('SELECTED_DAY')}
              className={`py-1.5 text-[11px] font-extrabold rounded-xl transition-all ${
                trayTab === 'SELECTED_DAY'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Seçili Gün ({selectedDaySteps.length})
            </button>
          </div>

          <div className="pb-2 border-b border-white/10">
            <h4 className="text-xs font-extrabold text-white">
              {trayTab === 'SELECTED_DAY'
                ? `${selectedDateStr} Gününün Etkinlikleri`
                : 'Planlanmamış Görevler'}
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {trayTab === 'SELECTED_DAY'
                ? 'Günün etkinliklerini tamamlayın veya tıkla/düzenle ile tarih aralığı değiştirin.'
                : `Görevlere tıklayarak Google Takvim tarzı aralık veya saat atayabilirsiniz.`}
            </p>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[460px]">
            {trayTab === 'SELECTED_DAY' ? (
              selectedDaySteps.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center">
                  <p className="text-xs text-gray-500">
                    {selectedDateStr} tarihinde planlanmış etkinlik yok.
                  </p>
                </div>
              ) : (
                selectedDaySteps.map(({ step, goal }) => {
                  const isDone = step.status === 'DONE' || step.isCompleted;
                  return (
                    <div
                      key={`${goal.id}___${step.id}`}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          onClick={() => onToggleStep(goal.id, step.id)}
                          className="flex items-start gap-2.5 cursor-pointer flex-1"
                        >
                          <div
                            className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border ${
                              isDone ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/30'
                            }`}
                          >
                            {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold leading-snug ${
                                isDone ? 'text-emerald-300 line-through' : 'text-white'
                              }`}
                            >
                              {step.text}
                            </p>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {step.startDate && step.dueDate && step.startDate !== step.dueDate
                                ? `📅 ${step.startDate} -> ${step.dueDate}`
                                : `📅 ${step.dueDate || step.startDate}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-indigo-300">
                          {step.timeRange || 'Tüm Gün'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openGcalModal(goal.id, step)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 text-[10px] font-bold transition-colors"
                          >
                            ✏️ Düzenle / Aralık
                          </button>
                          <button
                            onClick={() => triggerStepUpdate(goal.id, step.id, null)}
                            disabled={updatingStepIds[step.id]}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-50 text-rose-300 transition-colors"
                            title="Takvimden Çıkar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : unscheduledSteps.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center">
                <p className="text-xs text-gray-500">Tüm açık görevlerinize tarih atanmış 🎉</p>
              </div>
            ) : (
              unscheduledSteps.map(({ step, goal }) => (
                <div
                  key={`${goal.id}___${step.id}`}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-colors space-y-2.5 group"
                >
                  <p className="text-xs font-bold text-white leading-snug">
                    {step.text}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <button
                      onClick={() => openGcalModal(goal.id, step)}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-bold transition-colors flex items-center gap-1"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>📅 Tarih & Saat Ayarla</span>
                    </button>
                    <button
                      onClick={() => triggerStepUpdate(goal.id, step.id, selectedDateStr)}
                      disabled={updatingStepIds[step.id]}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-[11px] font-bold transition-all shadow flex items-center gap-1"
                    >
                      {updatingStepIds[step.id] ? '⏳ Atanıyor...' : 'Seçili Tarihe Ata'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
