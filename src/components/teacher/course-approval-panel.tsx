'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Clock, BookOpen, User, Calendar,
  ChevronDown, ChevronUp, MessageSquare, AlertTriangle, Sparkles
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  courseTitle: string;
  coursePlatform: string;
  courseLevel?: string;
  courseDuration?: string;
  courseReason?: string;
  domain?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  counselorNote?: string;
  reviewedAt?: string;
  createdAt: string;
  student: {
    id: string;
    grade?: number;
    user: { name?: string; email: string };
  };
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Onay Bekliyor',
    color: 'text-amber-300',
    bg: 'bg-amber-500/15 border-amber-500/30',
    icon: Clock,
  },
  APPROVED: {
    label: 'Onaylandı',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Reddedildi',
    color: 'text-red-300',
    bg: 'bg-red-500/15 border-red-500/30',
    icon: XCircle,
  },
};

export function CourseApprovalPanel() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher/course-approvals');
      const data = await res.json();
      if (res.ok) setRequests(data.requests ?? []);
    } catch (err) {
      console.error('fetchRequests error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/teacher/course-approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          counselorNote: noteInputs[id] || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast(data.message);
        setTimeout(() => setToast(''), 4000);
        // Listeyi güncelle
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', counselorNote: noteInputs[id] }
              : r
          )
        );
        setExpandedId(null);
      }
    } catch (err) {
      console.error('handleAction error:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-white/10 flex items-center justify-center gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
        <span className="text-sm text-gray-400">Onay talepleri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Başlık */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white">Ders Onay Talepleri</h2>
            <p className="text-xs text-gray-400">
              {pendingCount > 0
                ? `${pendingCount} yeni talep bekliyor`
                : 'Bekleyen talep yok'}
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black rounded-full animate-pulse">
            {pendingCount} BEKLEYEN
          </span>
        )}
      </div>

      {/* Liste */}
      {requests.length === 0 ? (
        <div className="glass-panel p-10 rounded-3xl border border-white/10 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto" />
          <p className="text-sm font-bold text-white">Henüz onay talebi yok</p>
          <p className="text-xs text-gray-400">Öğrenciler program seçtikçe burada görünecek.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === req.id;
            const isLoading = actionLoading[req.id];

            return (
              <div
                key={req.id}
                className={`glass-panel rounded-2xl border overflow-hidden transition-all ${
                  req.status === 'PENDING'
                    ? 'border-amber-500/20 bg-amber-950/10'
                    : 'border-white/10'
                }`}
              >
                {/* Kart Başlığı */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{req.courseTitle}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {req.student.user.name || req.student.user.email}
                        {req.student.grade ? ` • ${req.student.grade}. Sınıf` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Genişletilmiş Detay */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-4 space-y-4 bg-black/20">
                    {/* Ders Detayları */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white/5 p-2.5 rounded-xl">
                        <p className="text-gray-400 font-medium mb-0.5">Platform</p>
                        <p className="text-white font-bold">{req.coursePlatform}</p>
                      </div>
                      {req.courseLevel && (
                        <div className="bg-white/5 p-2.5 rounded-xl">
                          <p className="text-gray-400 font-medium mb-0.5">Seviye</p>
                          <p className="text-white font-bold">{req.courseLevel}</p>
                        </div>
                      )}
                      {req.courseDuration && (
                        <div className="bg-white/5 p-2.5 rounded-xl">
                          <p className="text-gray-400 font-medium mb-0.5">Süre</p>
                          <p className="text-white font-bold">{req.courseDuration}</p>
                        </div>
                      )}
                    </div>

                    {/* Talep Tarihi */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Gönderildi: {new Date(req.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Mevcut Rehber Notu (onaylanmış/reddedilmişse) */}
                    {req.counselorNote && req.status !== 'PENDING' && (
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
                        <p className="text-gray-400 font-semibold mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Rehber Notu
                        </p>
                        <p className="text-gray-200 italic">&ldquo;{req.counselorNote}&rdquo;</p>
                      </div>
                    )}

                    {/* PENDING ise Aksiyon Alanı */}
                    {req.status === 'PENDING' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-2">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Öğrenciye Notunuz (isteğe bağlı)
                          </label>
                          <textarea
                            value={noteInputs[req.id] || ''}
                            onChange={(e) =>
                              setNoteInputs((prev) => ({ ...prev, [req.id]: e.target.value }))
                            }
                            placeholder="Onaylama veya red kararınızla birlikte öğrenciye iletmek istediğiniz notu buraya yazın..."
                            rows={2}
                            className="w-full px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(req.id, 'APPROVE')}
                            disabled={isLoading}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20"
                          >
                            {isLoading ? (
                              <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Onayla — Plana Ekle</span>
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'REJECT')}
                            disabled={isLoading}
                            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-gray-300 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reddet</span>
                          </button>
                        </div>

                        <div className="flex items-start gap-1.5 text-[10px] text-gray-500">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>Onaylandığında ders, öğrencinin hedef planına otomatik eklenir ve öğrenci detayları belirleyebilir.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
