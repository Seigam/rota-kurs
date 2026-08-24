import { NextRequest, NextResponse } from 'next/server';

import { completeDevelopmentAssessment } from '@/lib/development-assessment-service';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const { id } = await params;
  const result = await completeDevelopmentAssessment(id, auth.context.profileId);
  if (!result.ok) return NextResponse.json({ error: result.error, missing: result.missing }, { status: result.status });
  return NextResponse.json({ success: true, assessmentId: result.assessmentId });
}
