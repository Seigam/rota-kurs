'use client';

import { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

const reasons = [
  ['NOT_RELEVANT', 'İlgili değil'],
  ['TOO_GENERIC', 'Çok genel'],
  ['UNSAFE', 'Güvenli değil'],
  ['HARD_TO_FOLLOW', 'Takip etmesi zor'],
  ['OTHER', 'Diğer'],
] as const;

export function AiFeedback({ requestId }: { requestId?: string }) {
  const [sent, setSent] = useState(false);
  const [showReasons, setShowReasons] = useState(false);

  if (!requestId || sent) return sent ? <span className="text-[11px] text-emerald-400">Geri bildiriminiz alındı.</span> : null;

  async function submit(helpful: boolean, reasonCode?: string) {
    const response = await fetch('/api/student/ai/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, helpful, reasonCode }),
    });
    if (response.ok) setSent(true);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
      <span>Bu sonuç faydalı mıydı?</span>
      <button type="button" onClick={() => submit(true)} aria-label="Faydalı" className="rounded-lg border border-white/10 p-1.5 hover:text-emerald-300">
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => setShowReasons(true)} aria-label="Faydasız" className="rounded-lg border border-white/10 p-1.5 hover:text-rose-300">
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
      {showReasons && reasons.map(([code, label]) => (
        <button key={code} type="button" onClick={() => submit(false, code)} className="rounded-full border border-white/10 px-2 py-1 hover:border-rose-400/50">
          {label}
        </button>
      ))}
    </div>
  );
}
