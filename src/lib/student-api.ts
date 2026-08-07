import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type StudentApiContext = {
  userId: string;
  profileId: string;
  grade: number | null;
};

export async function requireStudentApi(): Promise<
  { context: StudentApiContext; response?: never } | { context?: never; response: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { response: NextResponse.json({ code: 'UNAUTHORIZED', error: 'Oturum açmanız gerekiyor.' }, { status: 401 }) };
  }
  if (session.user.role !== 'STUDENT') {
    return { response: NextResponse.json({ code: 'FORBIDDEN', error: 'Bu işlem yalnız öğrencilere açıktır.' }, { status: 403 }) };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grade: true },
  });
  if (!profile) {
    return { response: NextResponse.json({ code: 'PROFILE_NOT_FOUND', error: 'Öğrenci profili bulunamadı.' }, { status: 404 }) };
  }

  return { context: { userId: session.user.id, profileId: profile.id, grade: profile.grade } };
}

export function hasValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function rejectInvalidOrigin(request: NextRequest): NextResponse | null {
  return hasValidOrigin(request)
    ? null
    : NextResponse.json({ code: 'FORBIDDEN', error: 'Geçersiz istek kaynağı.' }, { status: 403 });
}
