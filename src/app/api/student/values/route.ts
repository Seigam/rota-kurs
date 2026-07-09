import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

const DEFAULT_VALUES = [
  { valueName: 'Yaratıcılık & Özgünlük', desc: 'Yeni fikirler üretmek, sanat veya inovasyonla kendi izini bırakmak' },
  { valueName: 'Finansal Güvenlik & Yüksek Gelir', desc: 'Maddi refah, yüksek kazanç ve ekonomik özgürlüğe sahip olmak' },
  { valueName: 'Yardımseverlik & Toplumsal Katkı', desc: 'İnsanlara yardım etmek, toplumu ve dünyayı daha iyi bir yer yapmak' },
  { valueName: 'Liderlik & Güç', desc: 'Yönetmek, organizasyonlara yön vermek ve insanlara liderlik etmek' },
  { valueName: 'Bağımsızlık & Özgürlük', desc: 'Kendi kararlarını alabilmek, esnek çalışma saatleri ve otonomi' },
  { valueName: 'Öğrenme & Akademik Gelişim', desc: 'Her gün yeni bir şey öğrenmek, bilimsel veya teorik derinliğe ulaşmak' },
  { valueName: 'İş-Yaşam Dengesi & Huzur', desc: 'Stresten uzak, kişisel hayatla uyumlu ve sakin bir kariyere sahip olmak' },
  { valueName: 'İtibar & Toplumsal Statü', desc: 'Saygı duyulan, tanınan ve prestijli bir konumda bulunmak' },
  { valueName: 'Macera, Keşif & Değişim', desc: 'Rutinlerden uzak, dinamik, seyahat ve heyecan dolu deneyimler yaşamak' },
  { valueName: 'Sadakat & Güvenilirlik', desc: 'Sabit, öngörülebilir ve güvenli bir iş ortamında uzun yıllar kalmak' },
  { valueName: 'Adalet & Dürüstlük', desc: 'Etik kurallara tam bağlılık, eşitlik ve hakkaniyet doğrultusunda çalışmak' },
  { valueName: 'Takım Çalışması & Sosyal Uyumluluk', desc: 'Samimi, destekleyici ve uyumlu bir ekiple birlikte üretmek' },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        valueRankings: {
          orderBy: { rankOrder: 'asc' },
        },
        profileRankings: {
          orderBy: { rankOrder: 'asc' },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Önce öğrenci profili oluşturulmalıdır.' }, { status: 400 });
    }

    const rawRankings =
      profile.valueRankings && profile.valueRankings.length > 0
        ? profile.valueRankings
        : profile.profileRankings || [];

    let valuesList = rawRankings.map((v) => ({
      id: v.id,
      valueName: v.valueName,
      rankOrder: v.rankOrder,
      desc: DEFAULT_VALUES.find((d) => d.valueName === v.valueName)?.desc || 'Kişisel kariyer değeri',
    }));

    if (valuesList.length === 0) {
      valuesList = DEFAULT_VALUES.map((d, index) => ({
        id: `default-${index}`,
        valueName: d.valueName,
        rankOrder: index + 1,
        desc: d.desc,
      }));
    }

    return NextResponse.json({
      values: valuesList,
      xp: profile.experiencePoints,
    });
  } catch (error) {
    console.error('GET Values Error:', error);
    return NextResponse.json({ error: 'Değer sıralaması alınamadı.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { rankings } = body; // Array of { valueName: string, rankOrder: number }

    if (!Array.isArray(rankings) || rankings.length === 0) {
      return NextResponse.json({ error: 'Geçersiz sıralama verisi.' }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Önce öğrenci profili oluşturulmalıdır.' }, { status: 400 });
    }

    // Eski sıralamayı sil
    await prisma.valueRanking.deleteMany({
      where: {
        OR: [{ profileId: profile.id }, { studentId: profile.id }],
      },
    });

    // Yeni sıralamayı kaydet
    await prisma.valueRanking.createMany({
      data: rankings.map((r: any, idx: number) => ({
        profileId: profile.id,
        studentId: profile.id,
        valueName: r.valueName,
        rankOrder: idx + 1,
      })),
    });

    // +30 XP Ödülü verelim
    const newXp = profile.experiencePoints + 30;
    const newLevel = Math.floor(newXp / 100) + 1;

    await prisma.profile.update({
      where: { id: profile.id },
      data: { experiencePoints: newXp, currentLevel: newLevel },
    });

    return NextResponse.json({
      success: true,
      addedXp: 30,
      message: 'Değer sıralamanız kaydedildi. +30 XP kazandınız!',
    });
  } catch (error) {
    console.error('POST Values Error:', error);
    return NextResponse.json({ error: 'Değerler kaydedilirken sunucu hatası oluştu.' }, { status: 500 });
  }
}
