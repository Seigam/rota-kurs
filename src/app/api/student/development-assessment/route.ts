import { DevelopmentAssessmentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { startDevelopmentAssessmentSchema } from '@/lib/development-assessment-contracts';
import { BASELINE_QUESTIONS, MONTHLY_QUESTIONS, getEnabledFollowUps } from '@/lib/development-assessment';
import { getDevelopmentAssessmentResult, startDevelopmentAssessment } from '@/lib/development-assessment-service';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { prisma } from '@/lib/prisma';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';

export async function GET() {
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  if (!isFeatureEnabled('DEVELOPMENT_ASSESSMENT_ENABLED')) {
    return NextResponse.json({ code: 'FEATURE_DISABLED', error: 'Gelişim nabzı şu anda kullanıma kapalı.' }, { status: 404 });
  }

  const [draft, latestCompleted] = await Promise.all([
    prisma.developmentAssessment.findFirst({
      where: { profileId: auth.context.profileId, status: DevelopmentAssessmentStatus.DRAFT },
      orderBy: { startedAt: 'desc' },
      include: { responses: true },
    }),
    prisma.developmentAssessment.findFirst({
      where: { profileId: auth.context.profileId, status: DevelopmentAssessmentStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
      select: { id: true },
    }),
  ]);
  const latestResult = latestCompleted ? await getDevelopmentAssessmentResult(latestCompleted.id, auth.context.profileId) : null;
  if (!draft) return NextResponse.json({ draft: null, latestResult });

  const responseInputs = draft.responses.map((response) => ({
    questionKey: response.questionKey, area: response.area, domain: response.domain,
    statusScore: response.statusScore, importanceScore: response.importanceScore,
    uncertain: response.uncertain, isFollowUp: response.isFollowUp,
  }));
  const baseQuestions = draft.kind === 'BASELINE' ? BASELINE_QUESTIONS : MONTHLY_QUESTIONS;
  const followUps = draft.kind === 'BASELINE' ? getEnabledFollowUps(responseInputs) : [];
  return NextResponse.json({
    draft: { id: draft.id, kind: draft.kind, startedAt: draft.startedAt, responses: draft.responses, questions: [...baseQuestions, ...followUps] },
    latestResult,
  });
}

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  if (!isFeatureEnabled('DEVELOPMENT_ASSESSMENT_ENABLED')) return NextResponse.json({ error: 'Özellik kullanıma kapalı.' }, { status: 404 });
  const parsed = startDevelopmentAssessmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', error: 'Değerlendirme türü geçersiz.' }, { status: 400 });
  const assessment = await startDevelopmentAssessment(auth.context.profileId, parsed.data.kind);
  if (assessment.status === DevelopmentAssessmentStatus.COMPLETED) {
    return NextResponse.json({ code: 'ALREADY_COMPLETED', error: 'Bu değerlendirme daha önce tamamlandı.', assessmentId: assessment.id }, { status: 409 });
  }
  const questions = assessment.kind === 'BASELINE' ? BASELINE_QUESTIONS : MONTHLY_QUESTIONS;
  return NextResponse.json({ assessment: { ...assessment, questions } }, { status: 201 });
}
