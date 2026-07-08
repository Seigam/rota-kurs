'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, BookOpen, Sparkles, Users, Heart, Coins, Save, 
  CheckCircle2, AlertCircle, ArrowLeft, Target, Award, Compass 
} from 'lucide-react';
import { LifeDomain, PlanColumn } from '@prisma/client';

interface DomainPlanItem {
  domain: LifeDomain;
  columnType: PlanColumn;
  contentText: string;
}

const DOMAINS_INFO: Array<{ key: LifeDomain; label: string; desc: string; icon: any; colorClass: string; bgClass: string }> = [
  {
    key: 'CAREER',
    label: 'Kariyer & Mesleki',
    desc: 'Hangi sektör, meslek veya stajları hedefliyorsunuz?',
    icon: Briefcase,
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    key: 'ACADEMIC',
    label: 'Akademik & Okul',
    desc: 'Sınav netleri, yabancı dil veya üniversite hedefleriniz neler?',
    icon: BookOpen,
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    key: 'PERSONAL_DEV',
    label: 'Kişisel Gelişim',
    desc: 'Hangi yazılım, sanat, müzik veya liderlik becerisini kazanacaksınız?',
    icon: Sparkles,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    key: 'SOCIAL',
    label: 'Sosyal & İlişkiler',
    desc: 'Aile, arkadaşlık, kulüpler ve sosyal sorumluluk ağınız nasıl olsun?',
    icon: Users,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    key: 'HEALTH',
    label: 'Sağlık & Yaşam Tarzı',
    desc: 'Spor, beslenme, uyku düzeni ve zihinsel esenlik adımlarınız neler?',
    icon: Heart,
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10 border-rose-500/20',
  },
  {
    key: 'FINANCIAL',
    label: 'Finansal Farkındalık',
    desc: 'Burs, bütçe yönetimi, birikim ve gelecekteki maddi hedefleriniz?',
    icon: Coins,
    colorClass: 'text-teal-400',
    bgClass: 'bg-teal-500/10 border-teal-500/20',
  },
];

const COLUMNS_INFO: Array<{ key: PlanColumn; label: string; sub: string; borderClass: string }> = [
  {
    key: 'PLAN',
    label: 'PLANLARIM',
    sub: 'Ne yapmayı planlıyorum? (Adım adım eylemler)',
    borderClass: 'border-indigo-500/30',
  },
  {
    key: 'GOAL',
    label: 'HEDEFLERİM',
    sub: 'Neyi başarmak istiyorum? (Net ve ölçülebilir sonuçlar)',
    borderClass: 'border-purple-500/30',
  },
  {
    key: 'WISH',
    label: 'İSTEKLERİM / HAYALLERİM',
    sub: 'Neyi hayal ediyorum? (Sınır tanımayan uzun vadeli arzular)',
    borderClass: 'border-emerald-500/30',
  },
];

export function LifeDomainsMatrix() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrixData, setMatrixData] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchMatrix() {
      setLoading(true);
      try {
        const res = await fetch('/api/student/domains');
        const data = await res.json();
        if (res.ok && data.domainPlans) {
          const map: Record<string, string> = {};
          data.domainPlans.forEach((item: any) => {
            const key = `${item.domain}_${item.columnType}`;
            map[key] = item.contentText;
          });
          setMatrixData(map);
        }
      } catch (err) {
        console.error('Fetch matrix error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatrix();
  }, []);

  const handleTextChange = (domain: LifeDomain, col: PlanColumn, val: string) => {
    const key = `${domain}_${col}`;
    setMatrixData((prev) => ({ ...prev, [key]: val }));
    setSuccessMsg('');
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const plans: DomainPlanItem[] = [];
    Object.entries(matrixData).forEach(([key, val]) => {
      if (val && val.trim() !== '') {
        const [domain, columnType] = key.split('_') as [LifeDomain, PlanColumn];
        plans.push({ domain, columnType, contentText: val.trim() });
      }
    });

    try {
      const res = await fetch('/api/student/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Yaşam diyagramı başarıyla kaydedildi!');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Kaydedilirken hata oluştu.');
      }
    } catch (err) {
      setErrorMsg('Sunucu bağlantısı kurulamadı.');
    } finally {
      setSaving(false);
    }
  };

  const filledCount = Object.values(matrixData).filter((v) => v && v.trim() !== '').length;

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Compass className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Yaşam Alanı Çalışma Matrisiniz Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Control */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-300">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Yaşam Alanları Doluluk Durumu:</span>
              <span className="text-emerald-400 font-extrabold">{filledCount} / 18 Hücre</span>
            </div>
            <p className="text-xs text-gray-400">
              En az 3 hücre doldurarak matrisi kaydettiğinizde anında <span className="text-amber-300 font-bold">+30 XP</span> kazanırsınız!
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
              <span>Diyagramı Kaydet (+30 XP)</span>
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

      {/* Matrix Table / Grid */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black/40 border-b border-white/10">
                <th className="p-4 text-left w-1/4 min-w-[220px]">
                  <span className="text-xs font-extrabold text-gray-300 uppercase tracking-wider block">YAŞAM ALANI</span>
                  <span className="text-[10px] text-gray-500 font-normal">Odaklanılacak 6 temel boyut</span>
                </th>
                {COLUMNS_INFO.map((col) => (
                  <th key={col.key} className="p-4 text-left w-1/4">
                    <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider block">{col.label}</span>
                    <span className="text-[10px] text-gray-400 font-normal block leading-tight mt-0.5">{col.sub}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {DOMAINS_INFO.map((dom) => {
                const IconComp = dom.icon;
                return (
                  <tr key={dom.key} className="hover:bg-white/5 transition-colors">
                    {/* Domain Name */}
                    <td className="p-4 align-top">
                      <div className={`p-3.5 rounded-2xl border ${dom.bgClass} space-y-1.5`}>
                        <div className="flex items-center gap-2">
                          <IconComp className={`w-5 h-5 ${dom.colorClass}`} />
                          <span className="text-sm font-bold text-white">{dom.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{dom.desc}</p>
                      </div>
                    </td>

                    {/* 3 Textareas */}
                    {COLUMNS_INFO.map((col) => {
                      const key = `${dom.key}_${col.key}`;
                      const val = matrixData[key] || '';
                      return (
                        <td key={col.key} className="p-3 align-top">
                          <textarea
                            rows={3}
                            value={val}
                            onChange={(e) => handleTextChange(dom.key, col.key, e.target.value)}
                            placeholder={`${dom.label} alanında ${col.label.toLowerCase()} buraya yazın...`}
                            className="w-full h-full min-h-[90px] p-3 bg-black/30 border border-white/10 rounded-xl text-white text-xs placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:bg-black/50 transition-all resize-y leading-relaxed"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="glow-button px-8 py-3.5 rounded-2xl text-white font-extrabold text-sm tracking-wide shadow-xl flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>Tüm Değişiklikleri Kaydet (+30 XP)</span>
        </button>
      </div>
    </div>
  );
}
