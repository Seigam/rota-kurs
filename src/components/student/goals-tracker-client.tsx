'use client';

import { useState, useEffect } from 'react';
import {
  Target, Award, CheckCircle2, Circle, Sparkles, Trash2,
  Briefcase, BookOpen, Users, Heart, Coins, Compass, Trophy,
  Plus, GripVertical, Clock, PlayCircle, CheckCircle, ArrowRight, X
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

      {/* KANBAN BOARD */}
      {domainGoals.length === 0 ? (
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
