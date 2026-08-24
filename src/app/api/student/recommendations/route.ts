import { DevelopmentAssessmentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';

const favoriteSchema = z.object({ catalogItemId: z.string().trim().min(1).max(160), isFavorite: z.boolean() }).strict();

function safeReasons(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 3) : [];
  } catch { return []; }
}

export async function GET() {
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const assessment = await prisma.developmentAssessment.findFirst({
    where: { profileId: auth.context.profileId, status: DevelopmentAssessmentStatus.COMPLETED },
    orderBy: { completedAt: 'desc' },
    include: { recommendations: { orderBy: { rank: 'asc' }, include: { catalogItem: true } } },
  });
  const favorites = await prisma.catalogFavorite.findMany({ where: { profileId: auth.context.profileId }, select: { catalogItemId: true } });
  const favoriteIds = new Set(favorites.map((favorite) => favorite.catalogItemId));
  return NextResponse.json({
    assessmentId: assessment?.id ?? null,
    recommendations: (assessment?.recommendations ?? []).map((recommendation) => ({
      id: recommendation.id,
      fitBand: recommendation.fitBand,
      confidence: recommendation.confidence,
      reasons: safeReasons(recommendation.reasonBreakdown),
      isFavorite: favoriteIds.has(recommendation.catalogItemId),
      item: recommendation.catalogItem,
    })),
  });
}

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const parsed = favoriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Favori isteği geçersiz.' }, { status: 400 });
  const item = await prisma.catalogItem.findFirst({ where: { id: parsed.data.catalogItemId, verificationStatus: 'VERIFIED', isActive: true } });
  if (!item) return NextResponse.json({ error: 'Doğrulanmış katalog kaydı bulunamadı.' }, { status: 404 });
  if (parsed.data.isFavorite) {
    await prisma.catalogFavorite.upsert({
      where: { profileId_catalogItemId: { profileId: auth.context.profileId, catalogItemId: item.id } },
      update: {}, create: { profileId: auth.context.profileId, catalogItemId: item.id },
    });
  } else {
    await prisma.catalogFavorite.deleteMany({ where: { profileId: auth.context.profileId, catalogItemId: item.id } });
  }
  return NextResponse.json({ success: true, isFavorite: parsed.data.isFavorite, message: parsed.data.isFavorite ? 'Program favorilerine eklendi.' : 'Program favorilerden çıkarıldı.' });
}
