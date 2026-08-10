'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase, BookOpen, Sparkles, Users, Heart, Coins, Save,
  CheckCircle2, AlertCircle, Sparkle, Plus, Trash2, ArrowRight, Compass, Clock
} from 'lucide-react';
import { LifeDomain } from '@prisma/client';
import type { LucideIcon } from 'lucide-react';
import { AiFeedback } from '@/components/student/ai-feedback';
import { GOAL_TIME_HORIZONS, getGoalTimeHorizon, type GoalTimeHorizonValue } from '@/lib/goal-time-horizon';

interface PlanStepItem {
  id: string;
  text: string;
  phase?: 'PREPARE' | 'START' | 'PRACTICE' | 'REVIEW';
  isCompleted?: boolean;
}

interface GoalSuggestion {
  id: string;
  text: string;
  whyItFits: string;
}

interface AiResultMeta {
  requestId: string;
  sourceMode: 'model' | 'template' | 'rule';
  warnings: string[];
}

interface DomainPlanState {
  timeHorizon: GoalTimeHorizonValue | '';
  wishText: string;
  selectedGoal: string;
  planSteps: PlanStepItem[];
  savedId?: string;
}

const DOMAINS_INFO: Array<{
  key: LifeDomain;
  label: string;
  desc: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}> = [
  {
    key: 'CAREER',
    label: 'Kariyer & Mesleki',
    desc: 'Hangi sektör, meslek veya stajları hedefliyorsunuz?',
    icon: Briefcase,
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/10 border-indigo-500/30',
  },
  {
    key: 'ACADEMIC',
    label: 'Akademik & Okul',
    desc: 'Sınav netleri, yabancı dil veya üniversite hedefleriniz neler?',
    icon: BookOpen,
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10 border-purple-500/30',
  },
  {
    key: 'PERSONAL_DEV',
    label: 'Kişisel Gelişim',
    desc: 'Hangi yazılım, sanat, müzik veya liderlik becerisini kazanacaksınız?',
    icon: Sparkles,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/30',
  },
  {
    key: 'SOCIAL',
    label: 'Sosyal & İlişkiler',
    desc: 'Aile, arkadaşlık, kulüpler ve sosyal sorumluluk ağınız nasıl olsun?',
    icon: Users,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30',
  },
  {
    key: 'HEALTH',
    label: 'Sağlık & Yaşam Tarzı',
    desc: 'Spor, beslenme, uyku düzeni ve zihinsel esenlik adımlarınız neler?',
    icon: Heart,
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10 border-rose-500/30',
  },
  {
    key: 'FINANCIAL',
    label: 'Finansal Farkındalık',
    desc: 'Burs, bütçe yönetimi, birikim ve gelecekteki maddi hedefleriniz?',
    icon: Coins,
    colorClass: 'text-teal-400',
    bgClass: 'bg-teal-500/10 border-teal-500/30',
  },
];

export function LifeDomainsMatrix() {
  const router = useRouter();
  const [activeDomain, setActiveDomain] = useState<LifeDomain>('CAREER');
  const [loading, setLoading] = useState(true);
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const [generatingSteps, setGeneratingSteps] = useState(false);
  const [saving, setSaving] = useState(false);

  const [aiGoalsMap, setAiGoalsMap] = useState<Record<string, GoalSuggestion[]>>({});
  const [aiMetaMap, setAiMetaMap] = useState<Record<string, AiResultMeta>>({});
  const [domainStates, setDomainStates] = useState<Record<string, DomainPlanState>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchSavedGoals() {
      setLoading(true);
      try {
        const res = await fetch('/api/student/goals');
        const data = await res.json();
        const stateMap: Record<string, DomainPlanState> = {};

        if (res.ok && data.goals) {
          data.goals.forEach((item: any) => {
            stateMap[item.domain] = {
              savedId: item.id,
              timeHorizon: item.timeHorizon || '',
              wishText: item.wishText || '',
              selectedGoal: item.selectedGoal || '',
              planSteps: item.planSteps || [],
            };
          });
        }
        setDomainStates(stateMap);
      } catch (err) {
        console.error('Fetch saved goals error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSavedGoals();
  }, []);

  const currentDomainState = domainStates[activeDomain] || {
    timeHorizon: '',
    wishText: '',
    selectedGoal: '',
    planSteps: [],
  };

  const updateCurrentState = (
    updates: Partial<DomainPlanState> | ((prevDomainState: DomainPlanState) => Partial<DomainPlanState>)
  ) => {
    setDomainStates((prev) => {
      const existing: DomainPlanState = prev[activeDomain] || {
        timeHorizon: '',
        wishText: '',
        selectedGoal: '',
        planSteps: [],
      };
      const resolvedUpdates = typeof updates === 'function' ? updates(existing) : updates;
      return {
        ...prev,
        [activeDomain]: {
          ...existing,
          ...resolvedUpdates,
        },
      };
    });
  };

  const handleTimeHorizonChange = (timeHorizon: GoalTimeHorizonValue) => {
    if (currentDomainState.timeHorizon === timeHorizon) return;
    updateCurrentState({ timeHorizon, selectedGoal: '', planSteps: [] });
    setAiGoalsMap((prev) => ({ ...prev, [activeDomain]: [] }));
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleGenerateGoals = async () => {
    if (!currentDomainState.timeHorizon) {
      setErrorMsg('Lütfen önce hedefiniz için kısa, orta veya uzun vade seçin.');
      return;
    }
    if (!currentDomainState.wishText.trim()) {
      setErrorMsg('Lütfen önce bu alanda ne istediğinizi (hayalinizi) yazın!');
      return;
    }

    setErrorMsg('');
    setGeneratingGoals(true);
    try {
      const res = await fetch('/api/student/ai/goals-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_goals',
          domain: activeDomain,
          timeHorizon: currentDomainState.timeHorizon,
          wishText: currentDomainState.wishText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data?.goals) {
        setAiGoalsMap((prev) => ({
          ...prev,
          [activeDomain]: data.data.goals,
        }));
        setAiMetaMap((prev) => ({ ...prev, [activeDomain]: { requestId: data.requestId, sourceMode: data.sourceMode, warnings: data.warnings ?? [] } }));
      } else {
        setErrorMsg(data.error || 'Hedef önerisi alınamadı.');
      }
    } catch (err) {
      setErrorMsg('Sunucu hatası oluştu.');
    } finally {
      setGeneratingGoals(false);
    }
  };

  const handleSelectGoal = async (goalText: string) => {
    if (!currentDomainState.timeHorizon) return;
    updateCurrentState({ selectedGoal: goalText });
    setGeneratingSteps(true);
    try {
      const res = await fetch('/api/student/ai/goals-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'plan_steps',
          domain: activeDomain,
          timeHorizon: currentDomainState.timeHorizon,
          selectedGoal: goalText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data?.steps) {
        updateCurrentState({ selectedGoal: goalText, planSteps: data.data.steps });
        setAiMetaMap((prev) => ({ ...prev, [`${activeDomain}:plan`]: { requestId: data.requestId, sourceMode: data.sourceMode, warnings: data.warnings ?? [] } }));
      }
    } catch (err) {
      console.error('Generate steps error:', err);
    } finally {
      setGeneratingSteps(false);
    }
  };

  const handleAddStep = () => {
    const newStep: PlanStepItem = {
      id: `step_${Date.now()}`,
      text: '',
    };
    updateCurrentState((prev) => ({
      planSteps: [...(prev.planSteps || []), newStep],
    }));
  };

  const handleRemoveStep = (id: string) => {
    updateCurrentState((prev) => ({
      planSteps: (prev.planSteps || []).filter((s) => s.id !== id),
    }));
  };

  const handleStepTextChange = (id: string, text: string) => {
    updateCurrentState((prev) => ({
      planSteps: (prev.planSteps || []).map((s) => (s.id === id ? { ...s, text } : s)),
    }));
  };

  const handleSaveDomain = async () => {
    if (!currentDomainState.timeHorizon) {
      setErrorMsg('Kaydetmeden önce hedefin zaman aralığını seçmelisiniz.');
      return;
    }
    if (!currentDomainState.wishText.trim() || !currentDomainState.selectedGoal.trim()) {
      setErrorMsg('Kaydetmek için istek ve hedef alanlarını doldurmalısınız.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/student/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentDomainState.savedId,
          domain: activeDomain,
          timeHorizon: currentDomainState.timeHorizon,
          wishText: currentDomainState.wishText,
          selectedGoal: currentDomainState.selectedGoal,
          planSteps: currentDomainState.planSteps.filter((s) => s.text.trim() !== ''),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Bu alan için hedefleriniz ve eylem planınız kaydedildi!');
        if (data.goal?.id) {
          updateCurrentState({ savedId: data.goal.id });
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Kaydedilemedi.');
      }
    } catch (err) {
      setErrorMsg('Bağlantı hatası.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinishAndProceed = () => {
    router.push('/rpg/test');
    router.refresh();
  };

  const activeInfo = DOMAINS_INFO.find((d) => d.key === activeDomain)!;
  const ActiveIcon = activeInfo.icon;
  const aiGoals = aiGoalsMap[activeDomain] || [];
  const goalMeta = aiMetaMap[activeDomain];

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Compass className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Hedef ve Plan Haritanız Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-300 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Domain Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {DOMAINS_INFO.map((dom) => {
          const Icon = dom.icon;
          const isSelected = activeDomain === dom.key;
          const isSaved = !!domainStates[dom.key]?.savedId;

          return (
            <button
              key={dom.key}
              type="button"
              onClick={() => {
                setActiveDomain(dom.key);
                setErrorMsg('');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 relative ${
                isSelected
                  ? `${dom.bgClass} shadow-lg ring-1 ring-indigo-400/50`
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/15' : 'bg-white/5'} ${dom.colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSaved && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Kaydedildi" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">{dom.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Domain Workspace */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl border ${activeInfo.bgClass} ${activeInfo.colorClass}`}>
              <ActiveIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{activeInfo.label}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{activeInfo.desc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinishAndProceed}
            className="w-full sm:w-auto glow-button px-5 py-2.5 rounded-xl text-white font-extrabold text-xs tracking-wide shadow-xl flex items-center justify-center gap-2"
          >
            <span>Kişilik Testine Geç (Adım 4)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Time Horizon */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>1. Hedefinizin Zaman Aralığını Seçin</span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Hedef zaman aralığı">
            {GOAL_TIME_HORIZONS.map((option) => {
              const isSelected = currentDomainState.timeHorizon === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleTimeHorizonChange(option.value)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-lg ring-1 ring-cyan-400'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-cyan-500/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold">{option.label}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-cyan-300" />}
                  </div>
                  <p className="mt-1 text-xs font-bold text-cyan-200">{option.rangeLabel}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-gray-400">{option.description}</p>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-500">Vade değiştirildiğinde önceki vadeye göre üretilmiş hedef ve adımlar temizlenir.</p>
        </div>

        {/* STEP 2: Wish / İstek */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <span>2. Neyi İstiyorsunuz / Hayal Ediyorsunuz?</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              rows={2}
              value={currentDomainState.wishText}
              onChange={(e) => updateCurrentState({ wishText: e.target.value })}
              placeholder="Örn: İngilizcemi geliştirmek, yazılım alanında üniversite kazanmak veya düzenli spor yapmak istiyorum..."
              className="flex-1 px-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400 transition-all placeholder:text-gray-600 resize-none"
            />
            <button
              type="button"
              onClick={handleGenerateGoals}
              disabled={generatingGoals || !currentDomainState.timeHorizon}
              className="glow-button px-6 py-3 rounded-2xl text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 whitespace-nowrap self-start sm:self-center"
            >
              {generatingGoals ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI ile Hedef Öner</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* STEP 3: AI Suggested Goals */}
        {aiGoals.length > 0 && (
          <div className="space-y-3 animate-fadeIn">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <Sparkle className="w-4 h-4" />
              <span>3. Önerilen SMART Hedeflerden Birini Seçin (veya Aşağıda Düzenleyin)</span>
            </label>
            {goalMeta && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] text-indigo-200">
                  {goalMeta.sourceMode === 'model' ? 'AI önerisi' : goalMeta.sourceMode === 'template' ? 'Hazır şablon' : 'Kural tabanlı eşleşme'}
                </span>
                <AiFeedback requestId={goalMeta.requestId} />
                {goalMeta.warnings.map((warning) => <p key={warning} className="w-full text-[11px] text-amber-300">{warning}</p>)}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiGoals.map((goal, idx) => {
                const isSelected = currentDomainState.selectedGoal === goal.text;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleSelectGoal(goal.text)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 text-xs leading-relaxed ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-lg ring-1 ring-indigo-400'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200">
                        Seçenek #{idx + 1}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="font-medium">{goal.text}</p>
                    <p className="text-[11px] text-gray-400">{goal.whyItFits}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Selected SMART Goal */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <span>4. Seçilen / Düzenlenen SMART Hedefiniz</span>
          </label>
          {currentDomainState.timeHorizon && (
            <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-200">
              {getGoalTimeHorizon(currentDomainState.timeHorizon).label} · {getGoalTimeHorizon(currentDomainState.timeHorizon).rangeLabel}
            </span>
          )}
          <input
            type="text"
            value={currentDomainState.selectedGoal}
            onChange={(e) => updateCurrentState({ selectedGoal: e.target.value })}
            placeholder="Yukarıdan bir hedef seçin veya buraya kendi somut hedefinizi yazın..."
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-purple-500/30 text-white text-sm font-semibold focus:outline-none focus:border-purple-400 transition-all placeholder:text-gray-600"
          />
        </div>

        {/* STEP 5: Action Plan Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <span>5. Bu Hedefe Ulaşmak İçin Adım Adım Eylem Planınız</span>
              {generatingSteps && (
                <span className="text-[10px] text-gray-400 font-normal animate-pulse">
                  (AI Adımlar Üretiyor...)
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={handleAddStep}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Adım Ekle</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {currentDomainState.planSteps.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-gray-500">
                Henüz adım eklenmedi. Yukarıdan bir hedef seçince yapay zeka otomatik adımlar oluşturacak veya kendiniz ekleyebilirsiniz.
              </div>
            ) : (
              currentDomainState.planSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) => handleStepTextChange(step.id, e.target.value)}
                    placeholder="Eylem adımı açıklamasını girin..."
                    className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(step.id)}
                    className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Adımı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleSaveDomain}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{activeInfo.label} Planını Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
