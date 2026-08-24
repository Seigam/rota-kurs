import { DevelopmentAssessmentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { courseRecommendationInputSchema } from '@/lib/ai/contracts';
import { prisma } from '@/lib/prisma';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';

function safeReasons(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch { return []; }
}

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const parsed = courseRecommendationInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', error: 'Yalnız geçerli bir domain gönderin.' }, { status: 400 });

  const assessment = await prisma.developmentAssessment.findFirst({
    where: { profileId: auth.context.profileId, status: DevelopmentAssessmentStatus.COMPLETED },
    orderBy: { completedAt: 'desc' },
    include: { recommendations: { orderBy: { rank: 'asc' }, include: { catalogItem: true } } },
  });
  if (!assessment) return NextResponse.json({ requestId: null, sourceMode: 'rule', data: { recommendations: [] }, warnings: ['Önce gelişim nabzınızı tamamlayın.'] });

  const matching = assessment.recommendations.filter((recommendation) => {
    try {
      const domains = JSON.parse(recommendation.catalogItem.domainTags) as unknown;
      return Array.isArray(domains) && domains.some((domain) => domain === parsed.data.domain || (parsed.data.domain === 'PERSONAL_DEV' && domain === 'PERSONAL'));
    } catch { return false; }
  }).slice(0, 5);

  return NextResponse.json({
    requestId: assessment.id,
    sourceMode: 'rule',
    data: { recommendations: matching.map((recommendation) => ({
      id: recommendation.catalogItem.id,
      catalogItemId: recommendation.catalogItem.id,
      title: recommendation.catalogItem.title,
      platform: recommendation.catalogItem.provider,
      level: recommendation.catalogItem.level ?? 'Belirtilmedi',
      duration: recommendation.catalogItem.duration ?? 'Belirtilmedi',
      url: recommendation.catalogItem.url,
      reason: safeReasons(recommendation.reasonBreakdown).join(' • '),
      fitBand: recommendation.fitBand,
      confidence: recommendation.confidence,
      verificationStatus: recommendation.catalogItem.verificationStatus,
      sourceMode: 'verified_catalog',
    })) },
    warnings: matching.length ? [] : ['Bu alan için yeterli uyuma sahip doğrulanmış katalog kaydı bulunamadı.'],
  });
}
