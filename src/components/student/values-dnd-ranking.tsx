'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GripVertical, ArrowUp, ArrowDown, Save, CheckCircle2, 
  AlertCircle, Award, Sparkles, Star, Compass, HelpCircle 
} from 'lucide-react';

interface ValueItem {
  id: string;
  valueName: string;
  rankOrder: number;
  desc: string;
}

export function ValuesDndRanking() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<ValueItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchValues() {
      setLoading(true);
      try {
        const res = await fetch('/api/student/values');
        const data = await res.json();
        if (res.ok && data.values) {
          setItems(data.values);
        }
      } catch (err) {
        console.error('Fetch values error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchValues();
  }, []);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // Re-assign ranks
    const reRanked = updated.map((item, idx) => ({
      ...item,
      rankOrder: idx + 1,
    }));

    setItems(reRanked);
    setSuccessMsg('');
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    moveItem(draggedIdx, idx);
    setDraggedIdx(idx);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/student/values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rankings: items }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Değer sıralamanız kaydedildi! Kişilik testine yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/rpg/test');
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Kaydedilirken hata oluştu.');
      }
    } catch (err) {
      setErrorMsg('Sunucu ile bağlantı kurulamadı.');
    } finally {
      setSaving(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/30">
          #1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-400 to-gray-200 text-black font-black text-sm flex items-center justify-center shadow-md">
          #2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-700 to-orange-400 text-white font-black text-sm flex items-center justify-center shadow-md">
          #3
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-gray-300 font-bold text-xs flex items-center justify-center">
        #{rank}
      </div>
    );
  };

  const getTierLabel = (rank: number) => {
    if (rank === 1) return { text: 'Çekirdek Kariyer Değeri (En Öncelikli)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (rank <= 3) return { text: 'Ana Yönlendirici Değer', color: 'text-purple-300 bg-purple-500/10 border-purple-500/30' };
    if (rank <= 7) return { text: 'Destekleyici Değer', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30' };
    return { text: 'Daha Az Öncelikli', color: 'text-gray-400 bg-white/5 border-white/10' };
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Compass className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Değerler Çalışma Kağıdınız Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Control */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Nasıl Sıralayacaksınız?</h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
              Kartları fareyle tutup sürükleyerek veya <span className="text-indigo-300 font-semibold">Yukarı/Aşağı ok butonlarını</span> kullanarak sizin için en önemli olan değeri en tepeye (#1) taşıyın.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="glow-button px-6 py-3 rounded-xl text-white font-extrabold text-xs tracking-wide shadow-lg flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Sıralamayı Kaydet (+30 XP)</span>
            </>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Values Cards List */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const tier = getTierLabel(index + 1);
          const isTop3 = index < 3;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`glass-card p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing select-none ${
                isTop3
                  ? 'border-indigo-500/40 bg-gradient-to-r from-indigo-900/20 via-black/40 to-black/40 shadow-lg'
                  : 'border-white/10 hover:border-white/20'
              } ${draggedIdx === index ? 'opacity-40 scale-95 border-amber-400' : ''}`}
            >
              <div className="flex items-center gap-4">
                {/* Drag handle icon */}
                <div className="text-gray-500 hover:text-white transition-colors cursor-grab flex-shrink-0" title="Tut ve Sürükle">
                  <GripVertical className="w-6 h-6" />
                </div>

                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  {getRankBadge(index + 1)}
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white leading-snug">{item.valueName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.color}`}>
                      {tier.text}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              {/* Up / Down Action Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveItem(index, index - 1)}
                  disabled={index === 0}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 disabled:opacity-20 disabled:hover:bg-white/5 transition-all"
                  title="Yukarı Taşı"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(index, index + 1)}
                  disabled={index === items.length - 1}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 disabled:opacity-20 disabled:hover:bg-white/5 transition-all"
                  title="Aşağı Taşı"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="glow-button px-8 py-3.5 rounded-2xl text-white font-extrabold text-sm tracking-wide shadow-xl flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>Değer Sıralamasını Kaydet (+30 XP)</span>
        </button>
      </div>
    </div>
  );
}
