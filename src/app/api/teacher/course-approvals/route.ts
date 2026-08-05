import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { Role } from '@prisma/client';

/**
 * GET /api/teacher/course-approvals
 * Rehber öğretmenin sınıfındaki öğrencilerin tüm taleplerini getirir
 * (PENDING olanlar önce)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.TEACHER && user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Bu işlem için rehber öğretmen yetkisi gereklidir.' }, { status: 403 });
    }

    // TEACHER ise kendi sınıflarındaki öğrencilerin taleplerini getir
    // ADMIN ise tüm talepleri getir
    let requests;

    if (user.role === Role.ADMIN) {
      requests = await prisma.courseApprovalRequest.findMany({
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      });
    } else {
      // Öğretmenin sınıflarındaki öğrencileri bul
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
        include: {
          classGroups: {
            include: {
              students: { select: { id: true } },
            },
          },
        },
      });

      const studentIds = teacherProfile?.classGroups.flatMap((cg) =>
        cg.students.map((s) => s.id)
      ) ?? [];

      requests = await prisma.courseApprovalRequest.findMany({
        where: { studentId: { in: studentIds } },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      });
    }

    // PENDING önce gelsin
    const sorted = [
      ...requests.filter((r: any) => r.status === 'PENDING'),
      ...requests.filter((r: any) => r.status !== 'PENDING'),
    ];

    return NextResponse.json({ requests: sorted });
  } catch (err) {
    console.error('GET teacher/course-approvals error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
