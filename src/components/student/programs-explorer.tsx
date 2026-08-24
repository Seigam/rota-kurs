'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, ExternalLink, Heart, LoaderCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';
import type { CatalogFitBand, DevelopmentConfidence } from '@prisma/client';

type Recommendation = {
  id: string; fitBand: CatalogFitBand; confidence: DevelopmentConfidence; reasons: string[]; isFavorite: boolean;
  item: { id: string; title: string; description: string; provider: string; url: string | null; level: string | null; duration: string | null };
};

const fitLabels = { STRONG: 'Güçlü uyum', SUITABLE: 'Uygun', EXPLORE: 'Keşfetmeye değer' } as const;
const confidenceLabels = { HIGH: 'Yüksek güven', MEDIUM: 'Orta güven', LOW: 'Düşük güven' } as const;

export function ProgramsExplorer({ initialTab = 'ALL' }: { initialTab?: 'ALL' | 'FAVORITES' }) {
  const [loading, setLoading] = useState(true);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(initialTab === 'FAVORITES');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/student/recommendations').then((response) => response.json()).then((data) => {
      setAssessmentId(data.assessmentId ?? null);
      setRecommendations(data.recommendations ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => recommendations.filter((recommendation) => {
    if (favoritesOnly && !recommendation.isFavorite) return false;
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    return !normalized || `${recommendation.item.title} ${recommendation.item.description} ${recommendation.item.provider}`.toLocaleLowerCase('tr-TR').includes(normalized);
  }), [favoritesOnly, query, recommendations]);

  async function toggleFavorite(recommendation: Recommendation) {
    const next = !recommendation.isFavorite;
    setRecommendations((current) => current.map((item) => item.item.id === recommendation.item.id ? { ...item, isFavorite: next } : item));
    const response = await fetch('/api/student/recommendations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catalogItemId: recommendation.item.id, isFavorite: next }),
    });
    const data = await response.json();
    if (!response.ok) setRecommendations((current) => current.map((item) => item.item.id === recommendation.item.id ? { ...item, isFavorite: !next } : item));
    setMessage(data.message ?? data.error ?? 'Favori durumu güncellenemedi.');
  }

  if (loading) return <div className="grid min-h-[360px] place-items-center"><LoaderCircle className="size-10 animate-spin text-[#4f46e5]" aria-label="Öneriler yükleniyor" /></div>;
  if (!assessmentId) return <div className="paper-card rounded-[30px] p-8 text-center"><Sparkles className="mx-auto size-10 text-[#4f46e5]" /><h2 className="mt-4 text-2xl font-black text-[#172033]">Önce gelişim nabzını çıkar</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#626a79]">Programları yüzdeyle tahmin etmek yerine güncel önceliklerin, RIASEC ilgin, hedeflerin ve değerlerin birlikte kullanılır.</p><Link href="/student/development" className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-[#4f46e5] px-6 font-black text-white">Gelişim nabzımı başlat</Link></div>;

  return <div className="space-y-6"><div className="paper-card flex flex-col gap-4 rounded-[28px] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-2"><button onClick={() => setFavoritesOnly(false)} className={`min-h-11 rounded-xl px-4 text-sm font-black ${!favoritesOnly ? 'bg-[#4f46e5] text-white' : 'bg-[#f6f2eb] text-[#626a79]'}`}>Tüm öneriler</button><button onClick={() => setFavoritesOnly(true)} className={`min-h-11 rounded-xl px-4 text-sm font-black ${favoritesOnly ? 'bg-[#e96852] text-white' : 'bg-[#f6f2eb] text-[#626a79]'}`}>Favorilerim</button></div><label className="relative block"><span className="sr-only">Programlarda ara</span><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[#777e8b]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Program veya kurum ara" className="min-h-11 rounded-xl border border-[#ded9cf] bg-white pl-10 pr-4 text-sm text-[#172033]" /></label></div>
    {message && <p className="flex items-center gap-2 rounded-xl bg-[#eaf3ec] p-3 text-sm font-bold text-[#24633b]" aria-live="polite"><CheckCircle2 className="size-4" />{message}</p>}
    {filtered.length === 0 ? <div className="rounded-[28px] border border-[#ded9cf] bg-white p-10 text-center"><BookOpen className="mx-auto size-10 text-[#777e8b]" /><p className="mt-3 font-black text-[#172033]">Bu görünümde program bulunamadı.</p></div> : <div className="grid gap-5 lg:grid-cols-2">{filtered.map((recommendation) => <article key={recommendation.id} className="paper-card rounded-[28px] p-6"><div className="flex items-start justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${recommendation.fitBand === 'STRONG' ? 'bg-[#dce9df] text-[#24633b]' : recommendation.fitBand === 'SUITABLE' ? 'bg-[#eeecff] text-[#3730a3]' : 'bg-[#fff4df] text-[#8a4b06]'}`}>{fitLabels[recommendation.fitBand]}</span><span className="text-xs font-bold text-[#777e8b]">{confidenceLabels[recommendation.confidence]}</span></div><button onClick={() => toggleFavorite(recommendation)} className={`grid size-11 shrink-0 place-items-center rounded-xl border ${recommendation.isFavorite ? 'border-[#e96852] bg-[#fff0ed] text-[#c44d3b]' : 'border-[#ded9cf] bg-white text-[#777e8b]'}`} aria-label={recommendation.isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}><Heart className={`size-5 ${recommendation.isFavorite ? 'fill-current' : ''}`} /></button></div><p className="mt-5 text-xs font-black uppercase tracking-[0.12em] text-[#4f46e5]">{recommendation.item.provider}</p><h2 className="mt-1 text-xl font-black text-[#172033]">{recommendation.item.title}</h2><p className="mt-2 text-sm leading-6 text-[#626a79]">{recommendation.item.description}</p><ul className="mt-4 space-y-2">{recommendation.reasons.map((reason) => <li key={reason} className="flex gap-2 text-sm text-[#303849]"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#2f7047]" />{reason}</li>)}</ul><div className="mt-5 flex items-center justify-between border-t border-[#ded9cf] pt-4 text-xs font-bold text-[#626a79]"><span>{recommendation.item.duration ?? recommendation.item.level ?? 'Süre belirtilmedi'}</span>{recommendation.item.url && <a href={recommendation.item.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-black text-[#4338ca]">İncele <ExternalLink className="size-4" /></a>}</div></article>)}</div>}</div>;
}
