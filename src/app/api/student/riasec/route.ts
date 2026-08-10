import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { RIASEC_ITEMS, RIASEC_VERSION, scoreRiasec } from '@/lib/riasec';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';
import { isFeatureEnabled } from '@/lib/feature-flags';

const answersSchema = z.object({ answers: z.array(z.number().int().min(1).max(5)).length(30) }).strict();

export async function GET() {
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  if (!isFeatureEnabled('RIASEC_FEATURE_ENABLED')) return NextResponse.json({ error: 'RIASEC özelliği bu ortamda kapalı.' }, { status: 404 });
  const result = await prisma.careerInterestResult.findUnique({ where: { profileId: auth.context.profileId } });
  return NextResponse.json({ items: RIASEC_ITEMS, version: RIASEC_VERSION, result });
}

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  if (!isFeatureEnabled('RIASEC_FEATURE_ENABLED')) return NextResponse.json({ error: 'RIASEC özelliği bu ortamda kapalı.' }, { status: 404 });
  const parsed = answersSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', error: '30 maddenin tamamını 1–5 arasında yanıtlayın.' }, { status: 400 });
  const { scores, topCodes } = scoreRiasec(parsed.data.answers);
  const result = await prisma.careerInterestResult.upsert({
    where: { profileId: auth.context.profileId },
    create: { profileId: auth.context.profileId, realistic: scores.R, investigative: scores.I, artistic: scores.A,
      social: scores.S, enterprising: scores.E, conventional: scores.C, topCodes: topCodes.join(''), version: RIASEC_VERSION },
    update: { realistic: scores.R, investigative: scores.I, artistic: scores.A, social: scores.S,
      enterprising: scores.E, conventional: scores.C, topCodes: topCodes.join(''), version: RIASEC_VERSION, completedAt: new Date() },
  });
  return NextResponse.json({ success: true, result });
}
