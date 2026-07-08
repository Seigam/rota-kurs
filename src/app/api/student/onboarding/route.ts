import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { z } from 'zod';
import { FamilyRelation } from '@prisma/client';

const familyMemberSchema = z.object({
  id: z.string().optional(),
  relation: z.nativeEnum(FamilyRelation),
  occupation: z.string().optional(),
  educationLevel: z.string().optional(),
  closenessScore: z.number().min(1).max(5).default(3),
  influenceScore: z.number().min(1).max(5).default(3),
  notes: z.string().optional(),
});

const onboardingSchema = z.object({
  grade: z.number().min(9).max(12),
  birthYear: z.number().min(2005).max(2013).optional(),
  schoolName: z.string().optional(),
  targetCareer: z.string().optional(),
  hobbies: z.string().optional(),
  favoriteSubjects: z.string().optional(),
  familyMembers: z.array(familyMemberSchema).default([]),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        familyMembers: true,
        personalityResult: true,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get Onboarding Error:', error);
    return NextResponse.json({ error: 'Profil bilgileri alınamadı' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = onboardingSchema.parse(body);

    // Profile kaydını bul veya oluştur
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    let profileId = existingProfile?.id;

    if (existingProfile) {
      // Mevcut profili güncelle
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: {
          grade: validatedData.grade,
          birthYear: validatedData.birthYear,
          schoolName: validatedData.schoolName,
          targetCareer: validatedData.targetCareer,
          hobbies: validatedData.hobbies,
          favoriteSubjects: validatedData.favoriteSubjects,
          completedOnboarding: true,
          experiencePoints: existingProfile.experiencePoints === 0 ? 50 : existingProfile.experiencePoints,
        },
      });
    } else {
      // Yeni profil oluştur
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          grade: validatedData.grade,
          birthYear: validatedData.birthYear,
          schoolName: validatedData.schoolName,
          targetCareer: validatedData.targetCareer,
          hobbies: validatedData.hobbies,
          favoriteSubjects: validatedData.favoriteSubjects,
          completedOnboarding: true,
          currentLevel: 1,
          experiencePoints: 50, // Onboarding tamamlama ödülü
        },
      });
      profileId = newProfile.id;
    }

    if (profileId) {
      // Eski aile üyelerini silip yenilerini ekleyelim
      await prisma.familyMember.deleteMany({
        where: { studentId: profileId },
      });

      if (validatedData.familyMembers.length > 0) {
        await prisma.familyMember.createMany({
          data: validatedData.familyMembers.map((m) => ({
            studentId: profileId!,
            relation: m.relation,
            occupation: m.occupation || '',
            educationLevel: m.educationLevel || '',
            closenessScore: Number(m.closenessScore) || 3,
            influenceScore: Number(m.influenceScore) || 3,
            notes: m.notes || '',
          })),
        });
      }
    }

    return NextResponse.json({
      message: 'Onboarding başarıyla tamamlandı. +50 XP kazanıldı!',
      success: true,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Post Onboarding Error:', error);
    return NextResponse.json({ error: 'Onboarding kaydedilirken hata oluştu' }, { status: 500 });
  }
}
