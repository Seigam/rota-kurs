import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { LifeDomain, PlanColumn } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { domainPlans: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Önce öğrenci profili oluşturulmalıdır.' }, { status: 400 });
    }

    return NextResponse.json({
      domainPlans: profile.domainPlans,
      xp: profile.experiencePoints,
    });
  } catch (error) {
    console.error('GET Domain Plans Error:', error);
    return NextResponse.json({ error: 'Çalışma diyagramı alınamadı.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { plans } = body; // Array of { domain: LifeDomain, columnType: PlanColumn, contentText: string }

    if (!Array.isArray(plans)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı.' }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Önce öğrenci profili oluşturulmalıdır.' }, { status: 400 });
    }

    // Mevcut kayıtları temizleyelim ve yenilerini ekleyelim
    await prisma.domainPlan.deleteMany({
      where: { studentId: profile.id },
    });

    const validPlans = plans.filter((p: any) => p.contentText && p.contentText.trim() !== '');

    if (validPlans.length > 0) {
      await prisma.domainPlan.createMany({
        data: validPlans.map((p: any) => ({
          studentId: profile.id,
          domain: p.domain as LifeDomain,
          columnType: p.columnType as PlanColumn,
          contentText: p.contentText.trim(),
        })),
      });
    }

    // İlk kez veya verimli doldurma için +30 XP ödülü (eğer 3'ten fazla hücre doldurulduysa)
    let addedXp = 0;
    if (validPlans.length >= 3) {
      addedXp = 30;
      const newXp = profile.experiencePoints + 30;
      const newLevel = Math.floor(newXp / 100) + 1;

      await prisma.profile.update({
        where: { id: profile.id },
        data: { experiencePoints: newXp, currentLevel: newLevel },
      });
    }

    return NextResponse.json({
      success: true,
      savedCount: validPlans.length,
      addedXp,
      message: addedXp > 0 ? `Yaşam diyagramı kaydedildi. +30 XP kazandınız!` : 'Yaşam diyagramı başarıyla güncellendi.',
    });
  } catch (error) {
    console.error('POST Domain Plans Error:', error);
    return NextResponse.json({ error: 'Kaydedilirken sunucu hatası oluştu.' }, { status: 500 });
  }
}
