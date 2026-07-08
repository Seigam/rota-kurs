import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Yönetici rolü gereklidir.' }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();
    const studentsCount = await prisma.user.count({ where: { role: Role.STUDENT } });
    const teachersCount = await prisma.user.count({ where: { role: Role.TEACHER } });
    const adminsCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    
    const programsCount = await prisma.careerProgram.count();
    const rpgScenesCount = await prisma.rpgScene.count();
    const recommendationsCount = await prisma.recommendation.count();

    // MBTI dağılımı
    const personalityResults = await prisma.personalityResult.findMany({
      select: { mbtiType: true, dominantEnneagram: true },
    });

    const mbtiMap: Record<string, number> = {};
    const enneagramMap: Record<string, number> = {};

    personalityResults.forEach((p) => {
      const mKey = p.mbtiType || 'Belirtilmedi';
      const eKey = p.dominantEnneagram || 'Belirtilmedi';
      mbtiMap[mKey] = (mbtiMap[mKey] || 0) + 1;
      enneagramMap[eKey] = (enneagramMap[eKey] || 0) + 1;
    });

    const mbtiChartData = Object.entries(mbtiMap).map(([name, value]) => ({ name, value }));
    const enneagramChartData = Object.entries(enneagramMap).map(([name, value]) => ({ name, value }));

    // Hedef meslek dağılımı
    const profiles = await prisma.profile.findMany({
      where: { targetCareer: { not: null } },
      select: { targetCareer: true },
    });

    const careerMap: Record<string, number> = {};
    profiles.forEach((pr) => {
      if (pr.targetCareer) {
        const c = pr.targetCareer.trim();
        careerMap[c] = (careerMap[c] || 0) + 1;
      }
    });

    const careerChartData = Object.entries(careerMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);

    return NextResponse.json({
      stats: {
        totalUsers,
        studentsCount,
        teachersCount,
        adminsCount,
        programsCount,
        rpgScenesCount,
        recommendationsCount,
      },
      charts: {
        mbti: mbtiChartData,
        enneagram: enneagramChartData,
        careers: careerChartData,
      },
    });
  } catch (error) {
    console.error('GET Admin Stats Error:', error);
    return NextResponse.json({ error: 'Yönetici istatistikleri alınamadı.' }, { status: 500 });
  }
}
