import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ redirectTo: '/login' });
  }

  const { role, id } = session.user;

  if (role === Role.TEACHER) {
    return NextResponse.json({ redirectTo: '/teacher/dashboard' });
  }

  if (role === Role.ADMIN) {
    return NextResponse.json({ redirectTo: '/admin/dashboard' });
  }

  // STUDENT — check onboarding & test status
  if (role === Role.STUDENT) {
    const profile = await prisma.profile.findUnique({
      where: { userId: id },
      include: { personalityResult: true },
    });

    if (!profile || !profile.completedOnboarding) {
      return NextResponse.json({ redirectTo: '/student/onboarding' });
    }

    if (!profile.personalityResult) {
      return NextResponse.json({ redirectTo: '/rpg/test' });
    }

    return NextResponse.json({ redirectTo: '/student/dashboard' });
  }

  return NextResponse.json({ redirectTo: '/' });
}
