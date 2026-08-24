import { NextResponse } from 'next/server';

import { getDevelopmentAssessmentResult } from '@/lib/development-assessment-service';
import { requireStudentApi } from '@/lib/student-api';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const { id } = await params;
  const result = await getDevelopmentAssessmentResult(id, auth.context.profileId);
  return result ? NextResponse.json({ result }) : NextResponse.json({ error: 'Tamamlanmış sonuç bulunamadı.' }, { status: 404 });
}
