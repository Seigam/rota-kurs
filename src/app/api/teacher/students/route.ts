import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.TEACHER && user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Bu işlem için öğretmen veya yönetici yetkisi gereklidir.' }, { status: 403 });
    }

    const students = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: {
          include: {
            personalityResult: true,
            valueRankings: {
              orderBy: { rankOrder: 'asc' },
              take: 3,
            },
            domainPlans: true,
            counselorNotes: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // İstatistikler
    const totalStudents = students.length;
    const completedOnboarding = students.filter((s) => s.profile?.completedOnboarding).length;
    const completedTest = students.filter((s) => s.profile?.personalityResult).length;
    const totalXpSum = students.reduce((sum, s) => sum + (s.profile?.experiencePoints || 0), 0);

    return NextResponse.json({
      students,
      stats: {
        totalStudents,
        completedOnboarding,
        completedTest,
        avgXp: totalStudents > 0 ? Math.round(totalXpSum / totalStudents) : 0,
      },
    });
  } catch (error) {
    console.error('GET Teacher Students Error:', error);
    return NextResponse.json({ error: 'Öğrenci listesi alınamadı.' }, { status: 500 });
  }
}
