'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Send, CheckCircle2, AlertCircle, Lock, 
  MessageSquare, UserCheck, Calendar 
} from 'lucide-react';

interface NoteItem {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: string | Date;
  counselor?: {
    name: string | null;
    email: string | null;
  } | null;
}

interface StudentCounselorNotesProps {
  studentProfileId: string;
  initialNotes: NoteItem[];
}

export function StudentCounselorNotes({ studentProfileId, initialNotes }: StudentCounselorNotesProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    setErrorMsg('');
    setToastMsg('');

    try {
      const res = await fetch('/api/teacher/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentProfileId,
          content: content.trim(),
          isPrivate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setContent('');
        setIsPrivate(false);
        setToastMsg(data.message || 'Not eklendi.');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Not eklenemedi.');
      }
    } catch (err) {
      setErrorMsg('Sunucu bağlantısı kurulamadı.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* New Note Form */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl bg-gradient-to-br from-indigo-950/20 via-black/40 to-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Yeni Rehberlik Yönlendirme Notu Ekle</h3>
              <p className="text-xs text-gray-400">Öğrencinin kariyer gelişimi veya görüşme çıktısıyla ilgili notlarınızı kaydedin.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Örn: Öğrencinin INTJ analitik yönü yazılım mühendisliği için çok uygun. Ailesiyle tıp tercihi konusunda bir denge görüşmesi yapıldı, TÜBİTAK yapay zeka kampına yönlendirildi..."
            className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-y leading-relaxed"
            required
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-0 bg-black/40"
              />
              <span className="flex items-center gap-1 font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Sadece Öğretmenler Görebilsin (Gizli Not)
              </span>
            </label>

            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="glow-button px-6 py-2.5 rounded-xl text-white font-bold text-xs tracking-wide shadow-lg flex items-center gap-2 disabled:opacity-50 self-end sm:self-auto"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Notu Kaydet</span>
                </>
              )}
            </button>
          </div>

          {toastMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Notes Feed */}
      <div className="space-y-4">
        <h4 className="text-sm font-extrabold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Görüşme Geçmişi & Rehberlik Notları ({notes.length})</span>
        </h4>

        {notes.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center text-xs text-gray-400">
            Bu öğrenci için henüz rehberlik notu kaydedilmemiş.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-indigo-300">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>{note.counselor?.name || 'Rehber Öğretmen'}</span>
                    {note.isPrivate && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Gizli
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-gray-200 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/5">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
