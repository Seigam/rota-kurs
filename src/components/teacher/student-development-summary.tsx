'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, MessageCircle, Send } from 'lucide-react';
import type { DevelopmentArea, DevelopmentConfidence } from '@prisma/client';

import { getAreaLabel } from '@/lib/development-assessment';

type SummaryProps = {
  assessment: {
    id: string;
    completedAt: string | Date | null;
    areaScores: Array<{ area: DevelopmentArea; statusAverage: number; priorityScore: number; confidence: DevelopmentConfidence; rank: number }>;
    comments: Array<{ id: string; content: string; createdAt: string | Date; author: { name: string | null } }>;
  } | null;
};

const confidenceLabel = { HIGH: 'Yüksek güven', MEDIUM: 'Orta güven', LOW: 'Düşük güven' } as const;

export function StudentDevelopmentSummary({ assessment }: SummaryProps) {
  const [comments, setComments] = useState(assessment?.comments ?? []);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!assessment) return <section className="glass-panel rounded-3xl border border-white/10 p-6"><h2 className="text-lg font-bold text-white">Gelişim nabzı</h2><p className="mt-2 text-xs text-gray-400">Öğrenci henüz gelişim değerlendirmesini tamamlamadı.</p></section>;
  const wellbeing = assessment.areaScores.find((score) => score.area === 'SELF_DEVELOPMENT_WELLBEING');
  const needsConversation = Boolean(wellbeing && wellbeing.statusAverage > 0 && wellbeing.statusAverage <= 2);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setSaving(true); setMessage(''); setError('');
    try {
      const response = await fetch(`/api/teacher/development-assessments/${assessment!.id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: content.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Yorum kaydedilemedi.');
      setComments((current) => [{ ...data.comment, author: { name: data.comment.authorName } }, ...current]);
      setContent(''); setMessage('Yorum öğrenciyle paylaşıldı.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Yorum kaydedilemedi.'); }
    finally { setSaving(false); }
  }

  return (
    <section className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8" aria-labelledby="development-summary-heading">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Son gelişim değerlendirmesi</p><h2 id="development-summary-heading" className="mt-1 text-xl font-extrabold text-white">Üç alandaki gelişim nabzı</h2></div>{assessment.completedAt && <p className="text-xs font-semibold text-gray-400">{new Date(assessment.completedAt).toLocaleDateString('tr-TR')}</p>}</div>
      {needsConversation && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-5 text-amber-100"><AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-300" /><div><strong className="block text-amber-200">Görüşme önerilir</strong>Kendini Geliştirme ve İyi Yaşam yanıtları için kısa, yargılamayan bir görüşme yararlı olabilir. Bu işaret tanı veya acil durum değerlendirmesi değildir.</div></div>}
      <div className="mt-5 grid gap-3 md:grid-cols-3">{assessment.areaScores.map((score) => <article key={score.area} className={`rounded-2xl border p-4 ${score.rank === 1 ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10 bg-black/20'}`}><div className="flex items-center justify-between"><span className="text-xs font-black text-indigo-300">#{score.rank}</span><span className="text-[10px] font-bold text-gray-400">{confidenceLabel[score.confidence]}</span></div><h3 className="mt-3 text-sm font-black text-white">{getAreaLabel(score.area)}</h3><div className="mt-3 flex gap-3 text-xs"><span className="text-gray-300">Durum <strong className="text-white">{score.statusAverage.toFixed(1)}/5</strong></span><span className="text-gray-300">Öncelik <strong className="text-white">{score.priorityScore}</strong></span></div></article>)}</div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><form onSubmit={submit} className="rounded-2xl border border-white/10 bg-black/20 p-4"><label className="text-sm font-black text-white">Öğrenciye görünür koçluk yorumu<textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={1200} rows={4} required placeholder="Öğrencinin güçlü yönünü fark eden, küçük ve uygulanabilir bir sonraki adım öneren yorum yazın…" className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-white placeholder:text-gray-500" /></label><button type="submit" disabled={saving || content.trim().length < 3} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-black text-white disabled:opacity-50">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} Öğrenciyle paylaş</button><div className="mt-3 min-h-5" aria-live="polite">{message && <p className="flex items-center gap-2 text-xs font-bold text-emerald-300"><CheckCircle2 className="size-4" />{message}</p>}{error && <p className="text-xs font-bold text-red-300">{error}</p>}</div></form><div><h3 className="flex items-center gap-2 text-sm font-black text-white"><MessageCircle className="size-4 text-emerald-300" /> Paylaşılan yorumlar ({comments.length})</h3><div className="mt-3 space-y-3">{comments.length === 0 ? <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-gray-400">Henüz görünür yorum yok.</p> : comments.map((comment) => <blockquote key={comment.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs leading-5 text-gray-200">“{comment.content}”</p><footer className="mt-2 text-[11px] font-bold text-emerald-300">{comment.author.name ?? 'Rehber öğretmen'}</footer></blockquote>)}</div></div></div>
    </section>
  );
}
