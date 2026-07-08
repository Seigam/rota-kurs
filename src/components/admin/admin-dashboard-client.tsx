'use client';

import { useState, useEffect } from 'react';
import { AnalyticsCharts } from '@/components/admin/analytics-charts';
import { 
  ShieldAlert, Users, BookOpen, Sparkles, Plus, Trash2, 
  CheckCircle2, AlertCircle, BarChart2, Shield, RefreshCw, ExternalLink 
} from 'lucide-react';

interface StatsData {
  totalUsers: number;
  studentsCount: number;
  teachersCount: number;
  adminsCount: number;
  programsCount: number;
  rpgScenesCount: number;
  recommendationsCount: number;
}

interface ProgramItem {
  id: string;
  title: string;
  provider: string;
  category: string;
  description: string;
  duration: string;
  minGrade: number;
  isFree: boolean;
  url: string | null;
}

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}

export function AdminDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PROGRAMS' | 'USERS'>('ANALYTICS');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [charts, setCharts] = useState<{ mbti: any[]; enneagram: any[]; careers: any[] }>({ mbti: [], enneagram: [], careers: [] });
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // New Program form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProvider, setNewProvider] = useState('TÜBİTAK');
  const [newCategory, setNewCategory] = useState('Yapay Zeka & Bilim');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState('4 Hafta');
  const [newMinGrade, setNewMinGrade] = useState(9);
  const [newIsFree, setNewIsFree] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [addingProg, setAddingProg] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setCharts(data.charts);
      }
    } catch (err) {
      console.error('Fetch admin stats err:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/admin/programs');
      const data = await res.json();
      if (res.ok) setPrograms(data.programs || []);
    } catch (err) {
      console.error('Fetch programs err:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch (err) {
      console.error('Fetch users err:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPrograms();
    fetchUsers();
  }, []);

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingProg(true);
    setErrorMsg('');
    setToastMsg('');

    try {
      const res = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          provider: newProvider,
          category: newCategory,
          description: newDesc,
          duration: newDuration,
          minGrade: newMinGrade,
          isFree: newIsFree,
          url: newUrl || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMsg(data.message);
        setShowAddModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchPrograms();
        fetchStats();
      } else {
        setErrorMsg(data.error || 'Eklenemedi.');
      }
    } catch (err) {
      setErrorMsg('Sunucu hatası.');
    } finally {
      setAddingProg(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Bu programı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/programs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setToastMsg('Program silindi.');
        fetchPrograms();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setToastMsg(data.message);
        fetchUsers();
        fetchStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Bu kullanıcıyı ve tüm profil verilerini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setToastMsg(data.message);
        fetchUsers();
        fetchStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Sistem İstatistikleri ve Analizler Hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce border border-indigo-400/30 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top System Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 shadow-xl bg-gradient-to-br from-indigo-950/20 to-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Toplam Kullanıcı</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 flex items-center justify-center text-indigo-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalUsers}</div>
          <p className="text-[11px] text-gray-400">
            {stats.studentsCount} Öğr. • {stats.teachersCount} Öğr. • {stats.adminsCount} Yön.
          </p>
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 shadow-xl bg-gradient-to-br from-purple-950/20 to-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kariyer Programı</span>
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-400">{stats.programsCount}</div>
          <p className="text-[11px] text-gray-400">TÜBİTAK, Coursera, MEB vb.</p>
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 shadow-xl bg-gradient-to-br from-amber-950/20 to-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">RPG Senaryoları</span>
            <div className="w-9 h-9 rounded-xl bg-amber-600/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300">{stats.rpgScenesCount}</div>
          <p className="text-[11px] text-gray-400">İnteraktif test sahneleri</p>
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 shadow-xl bg-gradient-to-br from-emerald-950/20 to-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Yapılan AI Eşleşme</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 flex items-center justify-center text-emerald-300">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.recommendationsCount}</div>
          <p className="text-[11px] text-gray-400">Kişiye özel üretilen öneriler</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4 flex-wrap">
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ANALYTICS' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Grafikler & Okul Geneli Analizi</span>
        </button>

        <button
          onClick={() => setActiveTab('PROGRAMS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PROGRAMS' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kariyer Programları Yönetimi ({programs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'USERS' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kullanıcı & Rol Yetkilendirme ({users.length})</span>
        </button>
      </div>

      {/* Tab 1: Analytics & Charts */}
      {activeTab === 'ANALYTICS' && (
        <AnalyticsCharts mbtiData={charts.mbti} enneagramData={charts.enneagram} careersData={charts.careers} />
      )}

      {/* Tab 2: Program CRUD */}
      {activeTab === 'PROGRAMS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Aktif Sertifika & Kariyer Programları</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="glow-button px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Program Ekle</span>
            </button>
          </div>

          {/* Add Program Modal / Form */}
          {showAddModal && (
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 space-y-4 shadow-2xl bg-black/90">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-bold text-purple-300">Yeni Kariyer & Sertifika Programı Tanımla</h4>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <form onSubmit={handleAddProgram} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Program Başlığı</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Örn: TÜBİTAK Lise Yapay Zeka Kampı" className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Kurum / Sağlayıcı</label>
                  <select value={newProvider} onChange={(e) => setNewProvider(e.target.value)} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white">
                    <option value="TÜBİTAK">TÜBİTAK</option>
                    <option value="Coursera">Coursera</option>
                    <option value="MEB">MEB / BİLSEM</option>
                    <option value="Üniversite">Üniversite / Boğaziçi / ODTÜ</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Kategori</label>
                  <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Yapay Zeka, Yazılım, Liderlik..." className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Süre</label>
                  <input type="text" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} placeholder="4 Hafta, 10 Saat vb." className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-gray-300 font-semibold block mb-1">Açıklama</label>
                  <textarea rows={2} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Programın içeriği ve öğrenciye kazanımları..." className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Minimum Sınıf</label>
                  <select value={newMinGrade} onChange={(e) => setNewMinGrade(Number(e.target.value))} className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white">
                    <option value={9}>9. Sınıf ve üzeri</option>
                    <option value={10}>10. Sınıf ve üzeri</option>
                    <option value={11}>11. Sınıf ve üzeri</option>
                    <option value={12}>12. Sınıf</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-white font-bold">
                    <input type="checkbox" checked={newIsFree} onChange={(e) => setNewIsFree(e.target.checked)} className="w-4 h-4 rounded text-purple-600" />
                    <span>Tamamen Ücretsiz Program</span>
                  </label>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-xl bg-white/10 text-white font-bold">İptal</button>
                  <button type="submit" disabled={addingProg} className="glow-button px-6 py-2 rounded-xl text-white font-bold">{addingProg ? 'Ekleniyor...' : 'Programı Kaydet'}</button>
                </div>
              </form>
            </div>
          )}

          {/* Programs Table */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 font-extrabold text-gray-400 uppercase">
                  <th className="p-4 pl-6">PROGRAM BAŞLIĞI</th>
                  <th className="p-4">KURUM & KATEGORİ</th>
                  <th className="p-4">SÜRE & MİN. SINIF</th>
                  <th className="p-4">ÜCRETSİZ Mİ?</th>
                  <th className="p-4 pr-6 text-right">İŞLEMLER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {programs.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 font-extrabold text-white">{p.title}</td>
                    <td className="p-4 text-purple-300 font-bold">{p.provider} • <span className="text-gray-300 font-normal">{p.category}</span></td>
                    <td className="p-4">{p.duration} • <span className="text-amber-300 font-bold">{p.minGrade}. Sınıf+</span></td>
                    <td className="p-4">{p.isFree ? <span className="text-emerald-400 font-bold">✓ Ücretsiz</span> : <span className="text-gray-400">Ücretli</span>}</td>
                    <td className="p-4 pr-6 text-right">
                      <button onClick={() => handleDeleteProgram(p.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Programı Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Role Management */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Sistem Kullanıcıları ve Yetkilendirme</h3>
            <span className="text-xs text-gray-400">Rol değişikliği anında uygulanır ve veritabanına işlenir.</span>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 font-extrabold text-gray-400 uppercase">
                  <th className="p-4 pl-6">KULLANICI ADI & E-POSTA</th>
                  <th className="p-4">KAYIT TARİHİ</th>
                  <th className="p-4">MEVCUT ROL</th>
                  <th className="p-4">ROL DEĞİŞTİR</th>
                  <th className="p-4 pr-6 text-right">SİL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-extrabold text-white text-sm">{u.name || 'İsimsiz'}</div>
                      <div className="text-[11px] text-gray-400">{u.email}</div>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        u.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        u.role === 'TEACHER' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {u.role === 'ADMIN' ? 'Yönetici' : u.role === 'TEACHER' ? 'Rehber Öğretmen' : 'Öğrenci'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="p-1.5 bg-black/60 border border-white/20 rounded-lg text-white text-[11px] font-bold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="STUDENT">Öğrenci</option>
                        <option value="TEACHER">Rehber Öğretmen</option>
                        <option value="ADMIN">Yönetici (Admin)</option>
                      </select>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Kullanıcıyı Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
