import { DevelopmentAssessmentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { saveDevelopmentResponseSchema } from '@/lib/development-assessment-contracts';
import { BASELINE_QUESTIONS, FOLLOW_UP_QUESTIONS, MONTHLY_QUESTIONS, getEnabledFollowUps, getQuestionByKey } from '@/lib/development-assessment';
import { prisma } from '@/lib/prisma';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = saveDevelopmentResponseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', error: 'Yanıt geçersiz.' }, { status: 400 });

  const assessment = await prisma.developmentAssessment.findFirst({
    where: { id, profileId: auth.context.profileId, status: DevelopmentAssessmentStatus.DRAFT },
    include: { responses: true },
  });
  if (!assessment) return NextResponse.json({ error: 'Aktif değerlendirme bulunamadı.' }, { status: 404 });
  const question = getQuestionByKey(parsed.data.questionKey);
  if (!question) return NextResponse.json({ error: 'Soru bulunamadı.' }, { status: 400 });
  const baseQuestions = assessment.kind === 'BASELINE' ? BASELINE_QUESTIONS : MONTHLY_QUESTIONS;
  const existingInputs = assessment.responses.map((response) => ({
    questionKey: response.questionKey, area: response.area, domain: response.domain,
    statusScore: response.statusScore, importanceScore: response.importanceScore,
    uncertain: response.uncertain, isFollowUp: response.isFollowUp,
  }));
  const currentlyEnabled = assessment.kind === 'BASELINE' ? getEnabledFollowUps(existingInputs) : [];
  const allowedKeys = new Set([...baseQuestions, ...currentlyEnabled].map((item) => item.key));
  if (!allowedKeys.has(question.key) && FOLLOW_UP_QUESTIONS.some((item) => item.key === question.key)) {
    return NextResponse.json({ error: 'Bu takip sorusu henüz etkin değil.' }, { status: 400 });
  }

  const response = await prisma.developmentAssessmentResponse.upsert({
    where: { assessmentId_questionKey: { assessmentId: assessment.id, questionKey: question.key } },
    update: {
      statusScore: parsed.data.uncertain ? null : parsed.data.statusScore,
      importanceScore: parsed.data.uncertain ? null : parsed.data.importanceScore,
      uncertain: parsed.data.uncertain,
    },
    create: {
      assessmentId: assessment.id,
      questionKey: question.key,
      area: question.area,
      domain: question.domain,
      isFollowUp: question.isFollowUp,
      statusScore: parsed.data.uncertain ? null : parsed.data.statusScore,
      importanceScore: parsed.data.uncertain ? null : parsed.data.importanceScore,
      uncertain: parsed.data.uncertain,
    },
  });
  const mergedInputs = [...existingInputs.filter((item) => item.questionKey !== response.questionKey), {
    questionKey: response.questionKey, area: response.area, domain: response.domain,
    statusScore: response.statusScore, importanceScore: response.importanceScore,
    uncertain: response.uncertain, isFollowUp: response.isFollowUp,
  }];
  const enabledFollowUps = assessment.kind === 'BASELINE' ? getEnabledFollowUps(mergedInputs) : [];
  return NextResponse.json({ response, questions: [...baseQuestions, ...enabledFollowUps] });
}
