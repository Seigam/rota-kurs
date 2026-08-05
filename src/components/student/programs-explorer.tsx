'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, Sparkles, Heart, Search, ExternalLink, Filter, 
  CheckCircle2, AlertCircle, Compass, Zap, BookOpen, Star, Target, ArrowRight,
  Clock, XCircle, Send
} from 'lucide-react';

interface RecItem {
  id: string;
  matchScore: number;
  explanation: string;
  isFavorite: boolean;
  program: {
    id: string;
    title: string;
    provider: string;
    category: string;
    description: string;
    duration: string;
    minGrade: number;
    url: string | null;
    isFree: boolean;
  };
}

export function ProgramsExplorer() {
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState<RecItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'FAVORITES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('TÜMÜ');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastIsGoal, setToastIsGoal] = useState(false);
  // programId -> onay durumu: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined
  const [approvalMap, setApprovalMap] = useState<Record<string, string>>({});
  const [approvalLoading, setApprovalLoading] = useState<Record<string, boolean>>({});

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const [recsRes, approvalsRes] = await Promise.all([
        fetch('/api/student/recommendations'),
        fetch('/api/student/course-approvals'),
      ]);
      const recsData = await recsRes.json();
      if (recsRes.ok && recsData.recommendations) {
        setRecs(recsData.recommendations);
      }
      if (approvalsRes.ok) {
        const appData = await approvalsRes.json();
        const map: Record<string, string> = {};
        for (const req of appData.requests ?? []) {
          // program başlığı anahtar olarak kullan
          map[req.courseTitle] = req.status;
        }
        setApprovalMap(map);
      }
    } catch (err) {
      console.error('Fetch recs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const toggleFavorite = async (programId: string, currentFav: boolean) => {
    // Optimistic update
    setRecs((prev) =>
      prev.map((item) =>
        item.program.id === programId ? { ...item, isFavorite: !currentFav } : item
      )
    );

    try {
      const res = await fetch('/api/student/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, isFavorite: !currentFav }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMsg(data.message);
        setToastIsGoal(!!data.goalCreated);
        setTimeout(() => { setToastMsg(''); setToastIsGoal(false); }, 4000);
      } else {
        // Revert on err
        fetchRecs();
      }
    } catch (err) {
      fetchRecs();
    }
  };

  const sendApprovalRequest = async (prog: RecItem['program']) => {
    setApprovalLoading((prev) => ({ ...prev, [prog.id]: true }));
    try {
      const res = await fetch('/api/student/course-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: prog.title,
          coursePlatform: prog.provider || 'Rota Kurs Platformu',
          courseLevel: undefined,
          courseDuration: prog.duration,
          courseUrl: prog.url || '/student/programs',
          domain: prog.category,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApprovalMap((prev) => ({ ...prev, [prog.title]: 'PENDING' }));
        setToastMsg('✅ Onay talebiniz rehber öğretmeninize iletildi.');
        setToastIsGoal(false);
        setTimeout(() => setToastMsg(''), 4000);
      } else if (res.status === 409) {
        setApprovalMap((prev) => ({ ...prev, [prog.title]: data.existingStatus }));
        setToastMsg('ℹ️ Bu ders için zaten bir onay talebiniz var.');
        setToastIsGoal(false);
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (err) {
      console.error('sendApprovalRequest error:', err);
    } finally {
      setApprovalLoading((prev) => ({ ...prev, [prog.id]: false }));
    }
  };

  const providers = ['TÜMÜ', 'TÜBİTAK', 'Coursera', 'MEB', 'Üniversite'];

  const filteredList = recs.filter((item) => {
    if (activeTab === 'FAVORITES' && !item.isFavorite) return false;
    if (freeOnly && !item.program.isFree) return false;
    if (selectedProvider !== 'TÜMÜ' && !item.program.provider.toLowerCase().includes(selectedProvider.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.program.title.toLowerCase().includes(q);
      const matchDesc = item.program.description.toLowerCase().includes(q);
      const matchCat = item.program.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const favCount = recs.filter((i) => i.isFavorite).length;

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Yapay Zeka Öneri Motoru Rotalarınızı Hesaplıyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-bold transition-all ${
          toastIsGoal
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/30 shadow-emerald-500/20'
            : 'bg-indigo-600 border-indigo-400/30 animate-bounce'
        }`}>
          {toastIsGoal ? <Target className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{toastMsg}</span>
          {toastIsGoal && (
            <Link
              href="/student/goals"
              className="ml-2 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-extrabold text-[10px] flex items-center gap-1 whitespace-nowrap transition-all"
            >
              Planı Gör <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* Controls Box */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs: All vs Favorites */}
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Önerilen Rotalar ({recs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('FAVORITES')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'FAVORITES'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favCount > 0 ? 'fill-white' : ''}`} />
              <span>Favorilerim ({favCount})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Program adı, konu veya kategori ara..."
              className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 font-semibold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Kurum:
            </span>
            {providers.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedProvider(p)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  selectedProvider === p
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFreeOnly(!freeOnly)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                freeOnly
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${freeOnly ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
              <span>Sadece Ücretsizler</span>
            </button>
          </div>
        </div>
      </div>

      {/* Programs Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Kriterlerinize Uygun Program Bulunamadı</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Filtreleri veya arama kelimenizi değiştirerek diğer TÜBİTAK, Coursera ve MEB rotalarını inceleyebilirsiniz.
          </p>
          <button
            onClick={() => {
              setSelectedProvider('TÜMÜ');
              setFreeOnly(false);
              setSearchQuery('');
              setActiveTab('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Filtreleri Sıfırlayıp Tümünü Göster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const prog = item.program;
            const isTopMatch = item.matchScore >= 80;

            return (
              <div
                key={prog.id}
                className={`glass-card p-6 rounded-3xl border flex flex-col justify-between space-y-5 transition-all relative overflow-hidden group ${
                  isTopMatch
                    ? 'border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 via-black/40 to-black/40 shadow-xl'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-4">
                  {/* Top line: Match Score & Favorite Heart */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1 shadow-md ${
                          item.matchScore >= 85
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-emerald-500/20'
                            : item.matchScore >= 70
                            ? 'bg-gradient-to-tr from-indigo-500 to-purple-400 text-white'
                            : 'bg-white/10 text-gray-300'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        %{item.matchScore} Eşleşme
                      </span>
                      {prog.isFree && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Ücretsiz
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleFavorite(prog.id, item.isFavorite)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        item.isFavorite
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 scale-110 shadow-lg shadow-rose-500/20'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                      title={item.isFavorite ? 'Favorilerden Çıkar' : 'Favorilerime Ekle'}
                    >
                      <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-400' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Provider */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                      {prog.provider} • {prog.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mt-1">
                      {prog.description}
                    </p>
                  </div>

                  {/* Why recommended? AI explanation box */}
                  <div className="bg-black/50 p-3.5 rounded-2xl border border-indigo-500/20 space-y-1">
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Neden Bu Program?
                    </span>
                    <p className="text-[11px] text-gray-300 leading-relaxed italic">
                      &ldquo;{item.explanation}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Bottom line: Duration, Add to Goals & Link */}
                <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Süre: {prog.duration}</span>
                    <a
                      href={prog.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold flex items-center gap-1.5 transition-all group/btn"
                    >
                      <span>İncele</span>
                      <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                  {/* Onaya Gönder Butonu */}
                  {(() => {
                    const approvalStatus = approvalMap[prog.title];
                    const isLoadingApproval = approvalLoading[prog.id];

                    if (approvalStatus === 'APPROVED') {
                      return (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>✅ Rehber Onayladı — Plan Sayfanda Bekliyor</span>
                        </div>
                      );
                    }

                    if (approvalStatus === 'PENDING') {
                      return (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>⏳ Rehber Onayı Bekleniyor</span>
                        </div>
                      );
                    }

                    if (approvalStatus === 'REJECTED') {
                      return (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-2">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>❌ Rehber Onaylamadı</span>
                        </div>
                      );
                    }

                    return (
                      <button
                        onClick={() => sendApprovalRequest(prog)}
                        disabled={isLoadingApproval}
                        className="w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-violet-600/80 to-indigo-600/80 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10 disabled:opacity-60"
                      >
                        {isLoadingApproval
                          ? <><Sparkles className="w-3.5 h-3.5 animate-spin" /> <span>Gönderiliyor...</span></>
                          : <><Send className="w-3.5 h-3.5" /> <span>Rehber Onaylı Plana Ekle</span></>}
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
