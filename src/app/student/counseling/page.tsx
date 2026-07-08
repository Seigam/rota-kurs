import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { HeartHandshake, ArrowLeft, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function StudentCounselingPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      counselorNotes: {
        include: { counselor: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div>
          <Link href="/student/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Panele Dön
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Rehberlik & Danışmanlık Notlarım</h1>
          <p className="text-sm text-gray-400">Rehber öğretmeniniz tarafından paylaşılan değerlendirme ve tavsiye notları</p>
        </div>

        <div className="space-y-4">
          {profile?.counselorNotes?.length ? (
            profile.counselorNotes.map((note) => (
              <div key={note.id} className="glass-card p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span>{note.counselor?.name || 'Rehber Öğretmen'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(note.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">{note.noteText}</p>
              </div>
            ))
          ) : (
            <div className="glass-panel p-10 rounded-3xl border border-white/10 text-center space-y-3">
              <HeartHandshake className="w-12 h-12 text-gray-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Henüz Paylaşılmış Bir Not Yok</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Rehber öğretmeniniz RPG test sonuçlarınızı ve aile profilinizi inceledikten sonra buraya size özel tavsiye ve yönlendirme notları ekleyecektir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
