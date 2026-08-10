import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';

const feedbackSchema = z.object({
  requestId: z.string().uuid(),
  helpful: z.boolean(),
  reasonCode: z.enum(['NOT_RELEVANT', 'TOO_GENERIC', 'UNSAFE', 'HARD_TO_FOLLOW', 'OTHER']).optional(),
}).strict();

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const parsed = feedbackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', error: 'Geri bildirim alanları geçersiz.' }, { status: 400 });

  const generation = await prisma.aiGeneration.findFirst({ where: { requestId: parsed.data.requestId, profileId: auth.context.profileId }, select: { id: true } });
  if (!generation) return NextResponse.json({ code: 'NOT_FOUND', error: 'AI üretimi bulunamadı.' }, { status: 404 });
  await prisma.aiFeedback.upsert({
    where: { generationId: generation.id },
    create: { generationId: generation.id, profileId: auth.context.profileId, helpful: parsed.data.helpful, reasonCode: parsed.data.reasonCode },
    update: { helpful: parsed.data.helpful, reasonCode: parsed.data.reasonCode },
  });
  return NextResponse.json({ success: true });
}
