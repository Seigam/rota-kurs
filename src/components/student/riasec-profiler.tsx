'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { RIASEC_ITEMS, RIASEC_LICENSE_URL, type RiasecCode } from '@/lib/riasec';

const labels: Record<RiasecCode, string> = { R: 'Gerçekçi', I: 'Araştırmacı', A: 'Sanatsal', S: 'Sosyal', E: 'Girişimci', C: 'Düzenli' };
const choices = ['Hiç hoşlanmam', 'Hoşlanmam', 'Kararsızım', 'Hoşlanırım', 'Çok hoşlanırım'];

export function RiasecProfiler() {
  const [answers, setAnswers] = useState<number[]>(Array(30).fill(0));
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ topCodes: string; [key: string]: string | number } | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/student/riasec').then((response) => response.json()).then((data) => setResult(data.result ?? null)).catch(() => undefined);
  }, []);

  async function submit() {
    if (answers.some((answer) => answer === 0)) { setMessage('Lütfen 30 maddenin tamamını yanıtlayın.'); return; }
    setSaving(true); setMessage('');
    const response = await fetch('/api/student/riasec', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) });
    const data = await response.json();
    if (response.ok) { setResult(data.result); setMessage('İlgi profiliniz kaydedildi.'); }
    else setMessage(data.error ?? 'Sonuç kaydedilemedi.');
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-100">
        Bu Türkçe sürüm FutuRoute tarafından O*NET® Career Exploration Tools içeriği temel alınarak uyarlanmıştır. USDOL/ETA uyarlamayı onaylamamış, desteklememiş veya test etmemiştir. Pilot öncesinde rehberlik uzmanının dil ve yaş uygunluğu doğrulaması zorunludur.{' '}
        <a href={RIASEC_LICENSE_URL} target="_blank" rel="noopener noreferrer" className="underline">O*NET Tools Developer License</a>
      </div>
      {result && (
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5">
          <p className="text-xs uppercase tracking-wider text-indigo-300">Son ilgi kodunuz</p>
          <p className="mt-1 text-3xl font-black text-white">{result.topCodes}</p>
          <p className="mt-2 text-xs text-gray-300">Bu sonuç kariyer seçeneklerini keşfetmek için kullanılır; kişilik etiketi veya kesin meslek kararı değildir.</p>
        </div>
      )}
      <div className="space-y-4">
        {RIASEC_ITEMS.map((item, index) => (
          <fieldset key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <legend className="px-1 text-sm font-semibold text-white">{item.id}. {item.text}</legend>
            <p className="mt-1 text-[11px] text-gray-500">{labels[item.code]}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5">
              {choices.map((choice, choiceIndex) => {
                const value = choiceIndex + 1;
                return <label key={choice} className={`cursor-pointer rounded-xl border p-2 text-center text-[11px] ${answers[index] === value ? 'border-indigo-400 bg-indigo-500/20 text-white' : 'border-white/10 text-gray-400'}`}>
                  <input className="sr-only" type="radio" name={`item-${item.id}`} value={value} checked={answers[index] === value}
                    onChange={() => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? value : answer))} />
                  {choice}
                </label>;
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <button type="button" onClick={submit} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
        <CheckCircle2 className="h-4 w-4" /> {saving ? 'Kaydediliyor…' : 'İlgi Profilimi Kaydet'}
      </button>
      {message && <p role="status" className="text-center text-sm text-indigo-200">{message}</p>}
    </div>
  );
}
