import { Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth-utils';
import { createAssessmentCommentSchema } from '@/lib/development-assessment-contracts';
import { prisma } from '@/lib/prisma';
import { rejectInvalidOrigin } from '@/lib/student-api';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const user = await getCurrentUser();
  if (!user || (user.role !== Role.TEACHER && user.role !== Role.ADMIN)) {
    return NextResponse.json({ error: 'Rehber öğretmen veya yönetici yetkisi gereklidir.' }, { status: 403 });
  }
  const { id } = await params;
  const parsed = createAssessmentCommentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Yorum 3–1200 karakter arasında olmalıdır.' }, { status: 400 });

  const assessment = await prisma.developmentAssessment.findUnique({
    where: { id },
    select: { id: true, profile: { select: { classGroupId: true } } },
  });
  if (!assessment) return NextResponse.json({ error: 'Değerlendirme bulunamadı.' }, { status: 404 });
  if (user.role === Role.TEACHER) {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { classGroups: { select: { id: true } } },
    });
    const allowedGroups = new Set(teacher?.classGroups.map((group) => group.id) ?? []);
    if (!assessment.profile.classGroupId || !allowedGroups.has(assessment.profile.classGroupId)) {
      return NextResponse.json({ error: 'Bu öğrenci için yorum ekleme yetkiniz yok.' }, { status: 403 });
    }
  }

  const comment = await prisma.assessmentComment.create({
    data: { assessmentId: assessment.id, authorId: user.id, content: parsed.data.content },
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json({
    success: true,
    comment: { id: comment.id, content: comment.content, createdAt: comment.createdAt, authorName: comment.author.name ?? 'Rehber öğretmen' },
  }, { status: 201 });
}
