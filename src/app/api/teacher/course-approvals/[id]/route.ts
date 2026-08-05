import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { Role } from '@prisma/client';

/**
 * PATCH /api/teacher/course-approvals/[id]
 * Bir talebi onaylar veya reddeder.
 * Onaylanırsa öğrencinin GoalPlanItem'ına "planlama bekleniyor" durumunda eklenir.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.TEACHER && user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Bu işlem için rehber öğretmen yetkisi gereklidir.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, counselorNote } = body; // action: 'APPROVE' | 'REJECT'

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Geçersiz işlem. "APPROVE" veya "REJECT" gönderin.' }, { status: 400 });
    }

    const approvalRequest = await prisma.courseApprovalRequest.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!approvalRequest) {
      return NextResponse.json({ error: 'Onay talebi bulunamadı.' }, { status: 404 });
    }

    if (approvalRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Bu talep zaten işleme alınmış.' }, { status: 409 });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    // Talebi güncelle
    const updated = await prisma.courseApprovalRequest.update({
      where: { id },
      data: {
        status: newStatus,
        counselorNote: counselorNote || null,
        reviewedAt: new Date(),
      },
    });

    // Onaylanmışsa → GoalPlanItem oluştur (planlama bekleniyor durumunda)
    if (action === 'APPROVE') {
      const domainMap: Record<string, string> = {
        CAREER: 'CAREER',
        ACADEMIC: 'ACADEMIC',
        PERSONAL_DEV: 'PERSONAL_DEV',
        SOCIAL: 'SOCIAL',
        HEALTH: 'HEALTH',
        FINANCIAL: 'FINANCIAL',
      };

      const domain = approvalRequest.domain && domainMap[approvalRequest.domain]
        ? approvalRequest.domain
        : 'CAREER';

      // Rehber notu varsa onu da wishText'e ekle
      const wishText = approvalRequest.courseTitle;
      const selectedGoal = counselorNote
        ? `Rehber Önerim: "${approvalRequest.courseTitle}" dersini tamamlaman için sana özel bir plan hazırladım. ${counselorNote}`
        : `"${approvalRequest.courseTitle}" dersini tamamlayarak bu alanda yetkinlik kazan.`;

      // Başlangıç planı — öğrenci burada kendi detaylarını belirleyecek
      const initialSteps = JSON.stringify([
        {
          id: 'step_1',
          text: `📋 Hedef Planlamayı Tamamla: Bu dersin hedeflerini ve çalışma programını belirle.`,
          isCompleted: false,
        },
        {
          id: 'step_2',
          text: `📚 "${approvalRequest.courseTitle}" dersine kayıt ol ve içerikleri incele.`,
          isCompleted: false,
        },
        {
          id: 'step_3',
          text: `🎯 Müfredatı tamamla ve öğrendiklerini uygula.`,
          isCompleted: false,
        },
        {
          id: 'step_4',
          text: `✅ Kursu bitir ve sertifikası varsa rehber öğretmenine göster.`,
          isCompleted: false,
        },
      ]);

      await prisma.goalPlanItem.create({
        data: {
          studentId: approvalRequest.studentId,
          domain,
          wishText,
          selectedGoal,
          planSteps: initialSteps,
          isCompleted: false,
          xpAwarded: 100,
        },
      });
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      request: updated,
      message:
        action === 'APPROVE'
          ? 'Ders onaylandı ve öğrencinin plan sayfasına eklendi.'
          : 'Ders talebi reddedildi.',
    });
  } catch (err) {
    console.error('PATCH teacher/course-approvals/[id] error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
