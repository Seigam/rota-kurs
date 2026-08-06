import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { LessonPathDesign } from './lesson-path-design';

export const metadata: Metadata = {
  title: 'Ders Yolu Tasarımı | FutuRoute',
  description: 'FutuRoute için oyunlaştırılmış, Duolingo tarzı bağımsız ders yolu tasarımı.',
};

export default async function StudentLessonPathPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { 
      id: true,
      experiencePoints: true, 
      currentLevel: true,
      streakDays: true,
      dailyXp: true,
    },
  });

  const goals = profile ? await prisma.goalPlanItem.findMany({
    where: { studentId: profile.id },
    orderBy: { createdAt: 'asc' },
  }) : [];

  return (
    <LessonPathDesign
      studentId={user.id}
      studentName={user.name || 'Öğrenci'}
      experiencePoints={profile?.experiencePoints ?? 0}
      level={profile?.currentLevel ?? 1}
      streakDays={profile?.streakDays ?? 0}
      dailyXp={profile?.dailyXp ?? 0}
      goals={goals}
    />
  );
}
