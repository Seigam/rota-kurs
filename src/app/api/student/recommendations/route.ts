import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { generateRecommendations } from '@/lib/recommendation-engine';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        personalityResult: true,
        valueRankings: {
          orderBy: { rankOrder: 'asc' },
        },
        recommendations: {
          include: { program: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Önce öğrenci profili oluşturulmalıdır.' }, { status: 400 });
    }

    const allPrograms = await prisma.careerProgram.findMany();

    // Öneri motorunu çalıştır
    const scoredList = generateRecommendations(
      profile,
      profile.personalityResult,
      profile.valueRankings,
      allPrograms
    );

    // Veritabanındaki Recommendation tablosuna upsert edelim
    for (const item of scoredList) {
      await prisma.recommendation.upsert({
        where: {
          profileId_programId: {
            profileId: profile.id,
            programId: item.program.id,
          },
        },
        update: {
          matchScore: item.matchScore,
          explanation: item.explanation,
        },
        create: {
          profileId: profile.id,
          programId: item.program.id,
          matchScore: item.matchScore,
          explanation: item.explanation,
          isFavorite: false,
        },
      });
    }

    // Güncel listeyi favoriler bilgisiyle beraber çekelim
    const updatedRecs = await prisma.recommendation.findMany({
      where: { profileId: profile.id },
      include: { program: true },
      orderBy: { matchScore: 'desc' },
    });

    return NextResponse.json({
      recommendations: updatedRecs,
      xp: profile.experiencePoints,
    });
  } catch (error) {
    console.error('GET Recommendations Error:', error);
    return NextResponse.json({ error: 'Öneriler hesaplanırken hata oluştu.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { programId, isFavorite } = body;

    if (!programId || typeof isFavorite !== 'boolean') {
      return NextResponse.json({ error: 'Geçersiz parametreler.' }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profil bulunamadı.' }, { status: 400 });
    }

    const rec = await prisma.recommendation.update({
      where: {
        profileId_programId: {
          profileId: profile.id,
          programId,
        },
      },
      data: { isFavorite },
      include: { program: true },
    });

    let goalCreated = false;

    // Favori eklendiğinde otomatik GoalPlanItem oluştur
    if (isFavorite && rec.program) {
      const prog = rec.program;

      // Aynı programdan zaten hedef var mı kontrol et
      const existingGoal = await prisma.goalPlanItem.findFirst({
        where: {
          studentId: profile.id,
          wishText: { contains: prog.title },
        },
      });

      if (!existingGoal) {
        // Program kategorisine göre domain belirle
        const domainMap: Record<string, string> = {
          'Yazılım': 'CAREER', 'Teknoloji': 'CAREER', 'Kariyer': 'CAREER',
          'Matematik': 'ACADEMIC', 'Fen': 'ACADEMIC', 'Bilim': 'ACADEMIC',
          'Kişisel': 'PERSONAL_DEV', 'Liderlik': 'PERSONAL_DEV', 'Girişimcilik': 'PERSONAL_DEV',
          'Tasarım': 'HOBBIES_LEISURE', 'Sanat': 'HOBBIES_LEISURE',
          'Sağlık': 'HEALTH_LIFESTYLE', 'Spor': 'HEALTH_LIFESTYLE',
        };
        let domain = 'CAREER';
        for (const [key, val] of Object.entries(domainMap)) {
          if (prog.category?.includes(key) || prog.title?.includes(key)) {
            domain = val;
            break;
          }
        }

        const planSteps = [
          { id: `step_1_${Date.now()}`, text: `Programa kayıt ol ve içerikleri incele`, status: 'TODO', isCompleted: false },
          { id: `step_2_${Date.now()}`, text: `İlk modülü tamamla ve notlar çıkar`, status: 'TODO', isCompleted: false },
          { id: `step_3_${Date.now()}`, text: `Öğrendiklerini bir mini projede uygula`, status: 'TODO', isCompleted: false },
          { id: `step_4_${Date.now()}`, text: `Sertifikayı tamamla ve profiline ekle`, status: 'TODO', isCompleted: false },
        ];

        await prisma.goalPlanItem.create({
          data: {
            studentId: profile.id,
            domain,
            wishText: `${prog.title} programını tamamlamak`,
            selectedGoal: `${prog.provider ? prog.provider + ' - ' : ''}${prog.title} ${prog.duration ? '(' + prog.duration + ')' : ''} programını başarıyla bitirip sertifika kazanmak`,
            planSteps: JSON.stringify(planSteps),
            xpAwarded: 100,
          },
        });
        goalCreated = true;
      }
    }

    return NextResponse.json({
      success: true,
      isFavorite: rec.isFavorite,
      goalCreated,
      message: rec.isFavorite
        ? goalCreated
          ? `"${rec.program.title}" favorilerinize eklendi ve Hedef Takip Merkezi'nde planınız oluşturuldu! 🎯`
          : 'Program favorilerinize eklendi!'
        : 'Program favorilerden çıkarıldı.',
    });
  } catch (error) {
    console.error('POST Favorite Error:', error);
    return NextResponse.json({ error: 'Favori durumu güncellenemedi.' }, { status: 500 });
  }
}

