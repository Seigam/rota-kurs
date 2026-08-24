'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, BookOpenCheck, Check, CheckCircle2, CircleHelp,
  Compass, LoaderCircle, RefreshCw, Save, Sparkles, Target, Users,
} from 'lucide-react';

import {
  DEVELOPMENT_AREAS,
  isDevelopmentResponseAnswered,
  type DevelopmentQuestion,
} from '@/lib/development-assessment';

type ResponseState = { statusScore: number | null; importanceScore: number | null; uncertain: boolean };
type AssessmentKind = 'BASELINE' | 'MONTHLY';
type Draft = {
  id: string;
  kind: AssessmentKind;
  questions: DevelopmentQuestion[];
  responses: Array<ResponseState & { questionKey: string }>;
};

const statusLabels = ['Çok zorlanıyorum', 'Zorlanıyorum', 'Değişken', 'İyi gidiyor', 'Çok iyi gidiyor'];
const importanceLabels = ['Önceliğim değil', 'Düşük öncelik', 'Orta', 'Önemli', 'Çok önemli'];
const areaIcons = { LEARNING_FUTURE: BookOpenCheck, SELF_DEVELOPMENT_WELLBEING: Sparkles, RELATIONSHIPS_PARTICIPATION: Users } as const;

function Scale({ name, label, value, labels, disabled, onChange }: {
  name: string; label: string; value: number | null; labels: string[]; disabled: boolean; onChange: (value: number) => void;
}) {
  return (
    <fieldset disabled={disabled} className="mt-5">
      <legend className="text-sm font-black text-[#303849]">{label}</legend>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {labels.map((option, index) => {
          const score = index + 1;
          return (
            <label key={score} className={`group flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-2xl border px-1 py-2 text-center transition ${value === score ? 'border-[#4f46e5] bg-[#eeecff] text-[#3730a3] shadow-[0_4px_0_#c9c5f8]' : 'border-[#ded9cf] bg-white text-[#626a79] hover:border-[#aaa2e9]'}`}>
              <input className="sr-only" type="radio" name={name} value={score} checked={value === score} onChange={() => onChange(score)} />
              <span className="text-base font-black" aria-hidden="true">{score}</span>
              <span className="mt-1 hidden text-[10px] font-bold leading-tight sm:block">{option}</span>
            </label>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-bold text-[#777e8b] sm:hidden"><span>{labels[0]}</span><span>{labels[4]}</span></div>
    </fieldset>
  );
}

export function DevelopmentAssessmentClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [latestResultId, setLatestResultId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, ResponseState>>({});
  const [activeAreaIndex, setActiveAreaIndex] = useState(0);
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/student/development-assessment').then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Değerlendirme yüklenemedi.');
      if (data.draft) {
        setDraft(data.draft);
        setResponses(Object.fromEntries(data.draft.responses.map((item: ResponseState & { questionKey: string }) => [item.questionKey, {
          statusScore: item.statusScore, importanceScore: item.importanceScore, uncertain: item.uncertain,
        }])));
      }
      setLatestResultId(data.latestResult?.id ?? null);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Değerlendirme yüklenemedi.')).finally(() => setLoading(false));
  }, []);

  const activeArea = DEVELOPMENT_AREAS[activeAreaIndex];
  const areaQuestions = useMemo(() => draft?.questions.filter((question) => question.area === activeArea.key) ?? [], [draft, activeArea.key]);
  const visibleRequiredKeys = draft?.questions.map((question) => question.key) ?? [];
  const answeredCount = visibleRequiredKeys.filter((key) => isDevelopmentResponseAnswered(responses[key])).length;
  const progressPercentage = visibleRequiredKeys.length > 0
    ? Math.round((answeredCount / visibleRequiredKeys.length) * 100)
    : 0;
  const complete = Boolean(draft && answeredCount === visibleRequiredKeys.length && visibleRequiredKeys.length > 0);

  async function start(kind: AssessmentKind) {
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/student/development-assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }) });
      const data = await response.json();
      if (!response.ok) {
        if (data.assessmentId) router.push(`/student/development/result/${data.assessmentId}`);
        else throw new Error(data.error ?? 'Değerlendirme başlatılamadı.');
        return;
      }
      setDraft(data.assessment); setResponses({}); setActiveAreaIndex(0);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Değerlendirme başlatılamadı.'); }
    finally { setLoading(false); }
  }

  async function saveResponse(question: DevelopmentQuestion, next: ResponseState) {
    if (!draft) return;
    setResponses((current) => ({ ...current, [question.key]: next }));
    if (!next.uncertain && (next.statusScore === null || next.importanceScore === null)) return;
    setSavingKeys((current) => new Set(current).add(question.key));
    setError('');
    try {
      const response = await fetch(`/api/student/development-assessment/${draft.id}/responses`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionKey: question.key, ...next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Yanıt kaydedilemedi.');
      setDraft((current) => current ? { ...current, questions: data.questions } : current);
      setMessage('Yanıtların otomatik kaydedildi.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Yanıt kaydedilemedi.'); }
    finally { setSavingKeys((current) => { const nextSet = new Set(current); nextSet.delete(question.key); return nextSet; }); }
  }

  async function finish() {
    if (!draft || !complete) return;
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/student/development-assessment/${draft.id}/complete`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Değerlendirme tamamlanamadı.');
      router.push(`/student/development/result/${data.assessmentId}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Değerlendirme tamamlanamadı.'); setLoading(false); }
  }

  if (loading && !draft) return <div className="grid min-h-[420px] place-items-center"><LoaderCircle className="size-10 animate-spin text-[#4f46e5]" aria-label="Yükleniyor" /></div>;

  if (!draft) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="relative overflow-hidden rounded-[32px] bg-[#4f46e5] p-8 text-white shadow-[0_20px_45px_rgba(79,70,229,0.22)] sm:p-10">
          <div className="absolute -right-12 -top-12 size-48 rounded-full border-[28px] border-white/10" aria-hidden="true" />
          <Compass className="size-10" aria-hidden="true" />
          <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-indigo-100">Gelişim nabzı</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">Nerede olduğunu gör, bu ayın küçük adımını seç.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100">Üç ana alandaki durumunu ve senin için önemini değerlendir. Sonuç bir tanı veya kesin karar değil; hedeflerini konuşmak için kişisel bir pusuladır.</p>
          <button onClick={() => start(latestResultId ? 'MONTHLY' : 'BASELINE')} className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-2xl bg-white px-6 font-black text-[#3730a3] shadow-[0_6px_0_#c9c5f8] hover:-translate-y-0.5">
            {latestResultId ? 'Bu ayın nabzını güncelle' : 'Başlangıç değerlendirmesini başlat'} <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </section>
        <aside className="paper-card rounded-[32px] p-7">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e05d48]">3 ana alan</p>
          <div className="mt-5 space-y-4">
            {DEVELOPMENT_AREAS.map((area, index) => {
              const Icon = areaIcons[area.key];
              return <div key={area.key} className="rounded-2xl border border-[#ded9cf] bg-white p-4"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eeecff] text-[#4f46e5]"><Icon className="size-5" aria-hidden="true" /></span><div><p className="font-black text-[#172033]">{index + 1}. {area.label}</p><p className="mt-1 text-sm leading-6 text-[#686f7d]">{area.description}</p></div></div></div>;
            })}
          </div>
          {latestResultId && <button onClick={() => router.push(`/student/development/result/${latestResultId}`)} className="mt-5 inline-flex min-h-11 items-center gap-2 font-black text-[#4338ca] hover:underline"><RefreshCw className="size-4" /> Son sonucumu gör</button>}
        </aside>
      </div>
    );
  }

  const AreaIcon = areaIcons[activeArea.key];
  return (
    <div className="grid gap-7 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-[28px] border border-[#ded9cf] bg-white p-4 lg:sticky lg:top-24" aria-label="Değerlendirme alanları">
        <div className="px-2 pb-4"><p className="text-xs font-black uppercase tracking-[0.15em] text-[#777e8b]">İlerleme</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ebe7df]" role="progressbar" aria-label="Değerlendirme ilerlemesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercentage}><div className="h-full rounded-full bg-[#4f46e5] transition-all" style={{ width: `${progressPercentage}%` }} /></div><p className="mt-2 text-sm font-bold text-[#626a79]">{answeredCount} / {visibleRequiredKeys.length} yanıtlandı</p></div>
        <div className="grid gap-2">
          {DEVELOPMENT_AREAS.map((area, index) => { const Icon = areaIcons[area.key]; const areaKeys = draft.questions.filter((question) => question.area === area.key).map((question) => question.key); const areaDone = areaKeys.length > 0 && areaKeys.every((key) => isDevelopmentResponseAnswered(responses[key])); return <button key={area.key} type="button" onClick={() => setActiveAreaIndex(index)} aria-current={index === activeAreaIndex ? 'step' : undefined} className={`flex min-h-14 items-center gap-3 rounded-2xl px-3 text-left text-sm font-black ${index === activeAreaIndex ? 'bg-[#eeecff] text-[#3730a3]' : 'text-[#626a79] hover:bg-[#f6f2eb]'}`}><Icon className="size-5 shrink-0" aria-hidden="true" /><span className="flex-1">{area.shortLabel}</span>{areaDone && <Check className="size-4 text-[#2f7047]" aria-label="Tamamlandı" />}</button>; })}
        </div>
      </aside>

      <section aria-labelledby="area-heading">
        <header className="rounded-[28px] border border-[#ded9cf] bg-[#f6f2eb] p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#4f46e5] text-white"><AreaIcon className="size-6" /></span><div><p className="text-xs font-black uppercase tracking-[0.15em] text-[#4f46e5]">Alan {activeAreaIndex + 1} / 3</p><h2 id="area-heading" className="mt-1 text-2xl font-black tracking-tight text-[#172033] sm:text-3xl">{activeArea.label}</h2><p className="mt-2 text-sm leading-6 text-[#686f7d]">{activeArea.description}</p></div></div></header>
        <div className="mt-5 space-y-5">
          {areaQuestions.map((question, index) => {
            const value = responses[question.key] ?? { statusScore: null, importanceScore: null, uncertain: false };
            return <article key={question.key} className="paper-card rounded-[28px] p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-[#777e8b]">{question.isFollowUp ? 'Kısa takip' : `Gösterge ${index + 1}`}</p><h3 className="mt-2 text-lg font-black leading-7 text-[#172033]">{question.prompt}</h3><p className="mt-1 text-sm leading-6 text-[#686f7d]">{question.helper}</p></div>{savingKeys.has(question.key) ? <LoaderCircle className="size-5 shrink-0 animate-spin text-[#4f46e5]" aria-label="Kaydediliyor" /> : (value.uncertain || (value.statusScore !== null && value.importanceScore !== null)) ? <CheckCircle2 className="size-5 shrink-0 text-[#2f7047]" aria-label="Kaydedildi" /> : null}</div>
              <Scale name={`${question.key}-status`} label="Şu an bu konuda nasılım?" value={value.statusScore} labels={statusLabels} disabled={value.uncertain} onChange={(score) => saveResponse(question, { ...value, statusScore: score, uncertain: false })} />
              <Scale name={`${question.key}-importance`} label="Bu konu benim için ne kadar önemli?" value={value.importanceScore} labels={importanceLabels} disabled={value.uncertain} onChange={(score) => saveResponse(question, { ...value, importanceScore: score, uncertain: false })} />
              <label className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-bold text-app-muted transition-colors hover:bg-app-surface-muted hover:text-app-text focus-within:bg-app-surface-muted focus-within:text-app-text"><input type="checkbox" checked={value.uncertain} onChange={(event) => saveResponse(question, { statusScore: null, importanceScore: null, uncertain: event.target.checked })} className="size-5 accent-[#4f46e5]" /><CircleHelp className="size-4" aria-hidden="true" />Bu sorudan emin değilim</label>
            </article>;
          })}
        </div>

        <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-[#ded9cf] pt-6 sm:flex-row">
          <button type="button" disabled={activeAreaIndex === 0} onClick={() => setActiveAreaIndex((index) => Math.max(0, index - 1))} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#ded9cf] bg-white px-5 font-black text-[#303849] disabled:opacity-40"><ArrowLeft className="size-5" /> Önceki alan</button>
          {activeAreaIndex < DEVELOPMENT_AREAS.length - 1 ? <button type="button" onClick={() => setActiveAreaIndex((index) => Math.min(DEVELOPMENT_AREAS.length - 1, index + 1))} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#4f46e5] px-6 font-black text-white shadow-[0_5px_0_#c9c5f8]">Sonraki alan <ArrowRight className="size-5" /></button> : <button type="button" disabled={!complete || loading || savingKeys.size > 0} onClick={finish} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#2f7047] px-6 font-black text-white shadow-[0_5px_0_#b9d6c1] disabled:opacity-45"><Target className="size-5" /> Sonucumu hazırla</button>}
        </div>
        <div className="mt-4 min-h-6" aria-live="polite">{error ? <p className="font-bold text-[#a83b2c]">{error}</p> : message ? <p className="flex items-center gap-2 text-sm font-bold text-[#2f7047]"><Save className="size-4" />{message}</p> : null}</div>
      </section>
    </div>
  );
}
