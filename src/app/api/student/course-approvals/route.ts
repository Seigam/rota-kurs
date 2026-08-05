import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/student/course-approvals
 * Öğrencinin gönderdiği tüm onay taleplerini getirir
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    const requests = await prisma.courseApprovalRequest.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (err) {
    console.error('GET course-approvals error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/**
 * POST /api/student/course-approvals
 * Yeni bir ders onay talebi gönderir
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    const body = await request.json();
    const { courseTitle, coursePlatform, courseLevel, courseDuration, courseUrl, courseReason, domain } = body;

    if (!courseTitle) {
      return NextResponse.json({ error: 'Kurs başlığı zorunludur' }, { status: 400 });
    }

    // Aynı kurs için daha önce PENDING/APPROVED talep var mı kontrol et
    const existing = await prisma.courseApprovalRequest.findFirst({
      where: {
        studentId: profile.id,
        courseTitle,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Bu ders için zaten bir onay talebiniz mevcut', existingStatus: existing.status },
        { status: 409 }
      );
    }

    const approvalRequest = await prisma.courseApprovalRequest.create({
      data: {
        studentId: profile.id,
        courseTitle,
        coursePlatform: coursePlatform || 'Rota Kurs Platformu',
        courseLevel: courseLevel || null,
        courseDuration: courseDuration || null,
        courseUrl: courseUrl || null,
        courseReason: courseReason || null,
        domain: domain || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, request: approvalRequest }, { status: 201 });
  } catch (err) {
    console.error('POST course-approvals error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
