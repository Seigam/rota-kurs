import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { calculatePersonalityFromAnswers } from '@/lib/personality-calculator';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const scenario = await prisma.rpgScenario.findFirst({
      where: { isActive: true },
      include: {
        scenes: {
          orderBy: { sceneNumber: 'asc' },
          include: {
            choices: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!scenario || scenario.scenes.length === 0) {
      return NextResponse.json({ error: 'Aktif bir RPG senaryosu bulunamadı.' }, { status: 404 });
    }

    const answers = await prisma.testAnswer.findMany({
      where: { userId: user.id },
      include: { choice: true },
      orderBy: { chosenAt: 'asc' },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { personalityResult: true },
    });

    const isCompleted = answers.length >= scenario.scenes.length || !!profile?.personalityResult;
    const currentSceneIndex = Math.min(answers.length, scenario.scenes.length - 1);

    return NextResponse.json({
      scenario,
      scenes: scenario.scenes,
      answers,
      currentSceneIndex,
      isCompleted,
      personalityResult: profile?.personalityResult || null,
      xp: profile?.experiencePoints || 0,
      level: profile?.currentLevel || 1,
    });
  } catch (error) {
    console.error('GET RPG Test Error:', error);
    return NextResponse.json({ error: 'RPG oyun verileri alınamadı.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { action, sceneId, choiceId } = body;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Önce öğrenci profili oluşturulmalıdır.' }, { status: 400 });
    }

    // Seçimi Geri Alma İşlemi (UNDO)
    if (action === 'UNDO') {
      const lastAnswer = await prisma.testAnswer.findFirst({
        where: { userId: user.id },
        orderBy: { chosenAt: 'desc' },
      });

      if (lastAnswer) {
        await prisma.testAnswer.delete({
          where: { id: lastAnswer.id },
        });

        const newXp = Math.max(0, profile.experiencePoints - 10);
        const newLevel = Math.max(1, Math.floor(newXp / 100) + 1);

        await prisma.profile.update({
          where: { id: profile.id },
          data: { experiencePoints: newXp, currentLevel: newLevel },
        });

        // Eğer sonuç oluşmuşsa silmeyebilir veya sıfırlayabiliriz ama şimdilik devam etsin
      }

      return NextResponse.json({ success: true, message: 'Son seçim geri alındı.' });
    }

    // Normal Seçim Kaydı
    if (!sceneId || !choiceId) {
      return NextResponse.json({ error: 'Sahne ve seçim ID zorunludur.' }, { status: 400 });
    }

    // Mevcut bir cevap var mı kontrol et
    const existingAnswer = await prisma.testAnswer.findFirst({
      where: { userId: user.id, sceneId },
    });

    if (existingAnswer) {
      await prisma.testAnswer.update({
        where: { id: existingAnswer.id },
        data: { choiceId, chosenAt: new Date() },
      });
    } else {
      await prisma.testAnswer.create({
        data: {
          userId: user.id,
          sceneId,
          choiceId,
        },
      });

      // Her yeni sahne için +10 XP
      const newXp = profile.experiencePoints + 10;
      const newLevel = Math.floor(newXp / 100) + 1;

      await prisma.profile.update({
        where: { id: profile.id },
        data: { experiencePoints: newXp, currentLevel: newLevel },
      });
    }

    // Tüm cevapları ve sahneleri kontrol edelim
    const allAnswers = await prisma.testAnswer.findMany({
      where: { userId: user.id },
      include: { choice: true },
    });

    const activeScenario = await prisma.rpgScenario.findFirst({
      where: { isActive: true },
      include: { scenes: true },
    });

    const totalScenesCount = activeScenario?.scenes.length || 15;

    // Eğer tüm sahneler tamamlandıysa kişilik analizini hesapla ve kaydet
    if (allAnswers.length >= totalScenesCount) {
      const calcResult = calculatePersonalityFromAnswers(allAnswers.filter((a: any) => a && a.choice) as any);

      const existingResult = await prisma.personalityResult.findUnique({
        where: { profileId: profile.id },
      });

      let savedResult;
      if (existingResult) {
        savedResult = await prisma.personalityResult.update({
          where: { id: existingResult.id },
          data: {
            mbtiType: calcResult.mbtiType,
            mbtiScores: JSON.stringify(calcResult.mbtiScores),
            dominantEnneagram: calcResult.dominantEnneagram,
            wingEnneagram: calcResult.wingEnneagram,
            enneagramScores: JSON.stringify(calcResult.enneagramScores),
            summary: calcResult.summary,
          },
        });
      } else {
        savedResult = await prisma.personalityResult.create({
          data: {
            profileId: profile.id,
            mbtiType: calcResult.mbtiType,
            mbtiScores: JSON.stringify(calcResult.mbtiScores),
            dominantEnneagram: calcResult.dominantEnneagram,
            wingEnneagram: calcResult.wingEnneagram,
            enneagramScores: JSON.stringify(calcResult.enneagramScores),
            summary: calcResult.summary,
          },
        });

        // Testi ilk tamamlama bonusu +100 XP
        const bonusXp = profile.experiencePoints + 10 + 100;
        const bonusLevel = Math.floor(bonusXp / 100) + 1;
        await prisma.profile.update({
          where: { id: profile.id },
          data: { experiencePoints: bonusXp, currentLevel: bonusLevel },
        });
      }

      return NextResponse.json({
        success: true,
        isCompleted: true,
        personalityResult: savedResult,
        calcDetails: calcResult,
        message: 'Tebrikler! Keşif Adasını tamamladınız. +100 XP bonus kazandınız ve kişilik raporunuz hazırlandı!',
      });
    }

    return NextResponse.json({
      success: true,
      isCompleted: false,
      nextSceneIndex: allAnswers.length,
      message: '+10 XP kazanıldı!',
    });
  } catch (error: any) {
    console.error('POST RPG Test Error:', error);
    return NextResponse.json({ error: 'Seçim kaydedilirken sunucu hatası oluştu.' }, { status: 500 });
  }
}
