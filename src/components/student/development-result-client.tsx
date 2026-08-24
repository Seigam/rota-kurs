'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, BookOpenCheck, CheckCircle2, ExternalLink, HeartHandshake,
  LoaderCircle, MessageCircle, ShieldCheck, Sparkles, Target, Users,
} from 'lucide-react';
import type { CatalogFitBand, DevelopmentArea, DevelopmentConfidence, LifeDomain } from '@prisma/client';

import { getAreaLabel } from '@/lib/development-assessment';

type Result = {
  id: string;
  scores: Array<{ area: DevelopmentArea; statusAverage: number; importanceAverage: number; priorityScore: number; confidence: DevelopmentConfidence; rank: number; dominantDomain: LifeDomain; statusChange: number | null }>;
  goalDomain: LifeDomain | null;
  goalSuggestions: Array<{ id: string; text: string; whyItFits: string }>;
  needsSupportPrompt: boolean;
  recommendations: Array<{ id: string; fitBand: CatalogFitBand; confidence: DevelopmentConfidence; reasons: string[]; item: { id: string; title: string; description: string; provider: string; url: string | null; level: string | null; duration: string | null } }>;
  comments: Array<{ id: string; content: string; createdAt: string | Date; authorName: string }>;
};

const areaIcons = { LEARNING_FUTURE: BookOpenCheck, SELF_DEVELOPMENT_WELLBEING: Sparkles, RELATIONSHIPS_PARTICIPATION: Users } as const;
const fitLabels = { STRONG: 'Güçlü uyum', SUITABLE: 'Uygun', EXPLORE: 'Keşfetmeye değer' } as const;
const confidenceLabels = { HIGH: 'Yüksek güven', MEDIUM: 'Orta güven', LOW: 'Düşük güven' } as const;

export function DevelopmentResultClient({ result }: { result: Result }) {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState(result.goalSuggestions[0]?.id ?? '');
  const [goalText, setGoalText] = useState(result.goalSuggestions[0]?.text ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function chooseGoal(id: string) {
    const goal = result.goalSuggestions.find((item) => item.id === id);
    if (!goal) return;
    setSelectedGoal(id); setGoalText(goal.text); setMessage(''); setError('');
  }

  async function saveGoal() {
    if (!result.goalDomain || goalText.trim().length < 3) return;
    setSaving(true); setMessage(''); setError('');
    try {
      const response = await fetch('/api/student/goals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: result.goalDomain,
          timeHorizon: 'SHORT_TERM',
          wishText: `${getAreaLabel(result.scores[0].area)} alanında bu ay ilerlemek`,
          selectedGoal: goalText.trim(),
          planSteps: [
            { id: crypto.randomUUID(), phase: 'PREPARE', text: 'Bugün hedefin başarı ölçütünü ve kullanacağın kaynağı yaz.', status: 'TODO', isCompleted: false },
            { id: crypto.randomUUID(), phase: 'START', text: 'İlk hafta 20 dakikalık küçük bir başlangıç adımını tamamla.', status: 'TODO', isCompleted: false },
            { id: crypto.randomUUID(), phase: 'PRACTICE', text: 'İkinci ve üçüncü hafta düzenli pratik yapıp kısa not tut.', status: 'TODO', isCompleted: false },
            { id: crypto.randomUUID(), phase: 'REVIEW', text: 'Dördüncü hafta ilerlemeyi değerlendirip sonraki adımı belirle.', status: 'TODO', isCompleted: false },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Hedef kaydedilemedi.');
      setMessage('Hedefin planına eklendi.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Hedef kaydedilemedi.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-8">
      {result.needsSupportPrompt && (
        <aside className="rounded-[28px] border border-[#f1d4a8] bg-[#fff4df] p-6" aria-labelledby="support-title">
          <div className="flex items-start gap-4"><HeartHandshake className="mt-1 size-7 shrink-0 text-[#8a4b06]" /><div><h2 id="support-title" className="text-lg font-black text-[#172033]">Bunu tek başına taşımak zorunda değilsin</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#626a79]">Kendini Geliştirme ve İyi Yaşam alanındaki yanıtların, güvendiğin bir yetişkin veya okul rehberlik servisiyle kısa bir görüşmenin yararlı olabileceğini gösteriyor. Bu bir tanı veya acil durum değerlendirmesi değildir.</p><Link href="/student/counseling" className="mt-4 inline-flex min-h-11 items-center gap-2 font-black text-[#8a4b06] hover:underline">Rehberlik desteğini aç <ArrowRight className="size-4" /></Link></div></div>
        </aside>
      )}

      <section aria-labelledby="scores-heading"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#4f46e5]">Kişisel özet</p><h2 id="scores-heading" className="mt-2 text-2xl font-black text-[#172033] sm:text-3xl">Üç alandaki gelişim nabzın</h2><p className="mt-2 text-sm leading-6 text-[#626a79]">Öncelik puanı yalnız sıralama içindir; başarı notu veya kişilik etiketi değildir.</p></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">{result.scores.map((score) => { const Icon = areaIcons[score.area]; return <article key={score.area} className={`paper-card rounded-[28px] p-6 ${score.rank === 1 ? 'ring-2 ring-[#8e86dd]' : ''}`}><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-[#eeecff] text-[#4f46e5]"><Icon className="size-5" /></span><span className="rounded-full bg-[#f6f2eb] px-3 py-1 text-xs font-black text-[#626a79]">#{score.rank}</span></div><h3 className="mt-5 text-lg font-black text-[#172033]">{getAreaLabel(score.area)}</h3><dl className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f6f2eb] p-3"><dt className="text-[11px] font-bold text-[#777e8b]">Şu an</dt><dd className="mt-1 text-xl font-black text-[#172033]">{score.statusAverage.toFixed(1)} / 5</dd>{score.statusChange !== null && <span className={`mt-1 block text-[11px] font-black ${score.statusChange > 0 ? 'text-[#2f7047]' : score.statusChange < 0 ? 'text-[#a83b2c]' : 'text-[#777e8b]'}`}>{score.statusChange > 0 ? '+' : ''}{score.statusChange.toFixed(1)} önceki nabza göre</span>}</div><div className="rounded-2xl bg-[#eeecff] p-3"><dt className="text-[11px] font-bold text-[#625ab3]">Öncelik</dt><dd className="mt-1 text-xl font-black text-[#3730a3]">{score.priorityScore}</dd></div></dl><p className="mt-4 text-xs font-bold text-[#626a79]">{confidenceLabels[score.confidence]}</p>{score.rank === 1 && <p className="mt-3 rounded-xl bg-[#eaf3ec] px-3 py-2 text-xs font-black text-[#24633b]">Bu ayın birincil odak alanı</p>}</article>; })}</div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" aria-labelledby="goal-heading">
        <div className="rounded-[30px] bg-[#4f46e5] p-7 text-white"><Target className="size-8" /><p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-indigo-100">Sıra sende</p><h2 id="goal-heading" className="mt-2 text-3xl font-black tracking-tight">Bu ay hangi küçük adımı sahiplenmek istersin?</h2><p className="mt-3 text-sm leading-6 text-indigo-100">Üç seçenekten birini seç, kendi cümlenle düzenle ve hazır olduğunda planına ekle.</p></div>
        <div className="paper-card rounded-[30px] p-6"><div className="space-y-3">{result.goalSuggestions.map((goal) => <label key={goal.id} className={`block cursor-pointer rounded-2xl border p-4 ${selectedGoal === goal.id ? 'border-[#4f46e5] bg-[#eeecff]' : 'border-[#ded9cf] bg-white'}`}><div className="flex items-start gap-3"><input type="radio" name="goal" checked={selectedGoal === goal.id} onChange={() => chooseGoal(goal.id)} className="mt-1 size-5 accent-[#4f46e5]" /><div><span className="block text-sm font-black leading-6 text-[#172033]">{goal.text}</span><span className="mt-1 block text-xs leading-5 text-[#626a79]">{goal.whyItFits}</span></div></div></label>)}</div><label className="mt-5 block text-sm font-black text-[#303849]">Hedefini düzenle<textarea value={goalText} onChange={(event) => setGoalText(event.target.value)} rows={3} maxLength={600} className="mt-2 w-full rounded-2xl border border-[#ded9cf] bg-white p-4 font-medium leading-6 text-[#172033]" /></label><button onClick={saveGoal} disabled={saving || goalText.trim().length < 3} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7047] px-5 font-black text-white shadow-[0_5px_0_#b9d6c1] disabled:opacity-50">{saving ? <LoaderCircle className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />} Planıma ekle</button><div className="mt-3 min-h-6" aria-live="polite">{message && <p className="text-sm font-bold text-[#2f7047]">{message} <button onClick={() => router.push('/student/goals')} className="underline">Planımı gör</button></p>}{error && <p className="text-sm font-bold text-[#a83b2c]">{error}</p>}</div></div>
      </section>

      <section aria-labelledby="recommendations-heading"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#e05d48]">Doğrulanmış katalog</p><h2 id="recommendations-heading" className="mt-2 text-2xl font-black text-[#172033]">Bu odağa eşlik edebilecek programlar</h2></div><ShieldCheck className="size-7 text-[#2f7047]" aria-label="Doğrulanmış katalog" /></div>{result.recommendations.length === 0 ? <div className="mt-5 rounded-2xl border border-[#ded9cf] bg-white p-6 text-sm text-[#626a79]">Bu profil için yeterli uyuma sahip doğrulanmış bir katalog kaydı bulunamadı. Dış kaynak veya uydurma program gösterilmedi.</div> : <div className="mt-5 grid gap-4 lg:grid-cols-2">{result.recommendations.map((recommendation) => <article key={recommendation.id} className="paper-card rounded-[26px] p-6"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${recommendation.fitBand === 'STRONG' ? 'bg-[#dce9df] text-[#24633b]' : recommendation.fitBand === 'SUITABLE' ? 'bg-[#eeecff] text-[#3730a3]' : 'bg-[#fff4df] text-[#8a4b06]'}`}>{fitLabels[recommendation.fitBand]}</span><span className="text-xs font-bold text-[#777e8b]">{confidenceLabels[recommendation.confidence]}</span></div><p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#4f46e5]">{recommendation.item.provider}</p><h3 className="mt-1 text-xl font-black text-[#172033]">{recommendation.item.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#626a79]">{recommendation.item.description}</p><ul className="mt-4 space-y-2">{recommendation.reasons.map((reason) => <li key={reason} className="flex gap-2 text-sm text-[#303849]"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#2f7047]" />{reason}</li>)}</ul>{recommendation.item.url && <a href={recommendation.item.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 font-black text-[#4338ca] hover:underline">Programı incele <ExternalLink className="size-4" /></a>}</article>)}</div>}</section>

      {result.comments.length > 0 && <section className="rounded-[28px] border border-[#c8ddce] bg-[#eaf3ec] p-6" aria-labelledby="comments-heading"><div className="flex items-center gap-3"><MessageCircle className="size-6 text-[#2f7047]" /><h2 id="comments-heading" className="text-xl font-black text-[#172033]">Rehberinden yorumlar</h2></div><div className="mt-4 space-y-3">{result.comments.map((comment) => <blockquote key={comment.id} className="rounded-2xl bg-white p-4"><p className="text-sm leading-6 text-[#303849]">“{comment.content}”</p><footer className="mt-2 text-xs font-black text-[#477455]">{comment.authorName}</footer></blockquote>)}</div></section>}
    </div>
  );
}
