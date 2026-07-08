import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.TEACHER && user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Bu işlem için rehber öğretmen yetkisi gereklidir.' }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, content, isPrivate = false } = body;

    if (!studentId || !content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Lütfen geçerli bir öğrenci ID ve not içeriği girin.' }, { status: 400 });
    }

    // studentId, User ID mi yoksa Profile ID mi kontrol edelim
    let profile = await prisma.profile.findFirst({
      where: {
        OR: [{ id: studentId }, { userId: studentId }],
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Öğrenci profili bulunamadı.' }, { status: 404 });
    }

    const newNote = await prisma.counselorNote.create({
      data: {
        studentId: profile.id,
        counselorId: user.id,
        content: content.trim(),
        isPrivate: Boolean(isPrivate),
      },
      include: {
        counselor: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      note: newNote,
      message: 'Rehberlik notu başarıyla eklendi.',
    });
  } catch (error) {
    console.error('POST Teacher Note Error:', error);
    return NextResponse.json({ error: 'Rehberlik notu kaydedilirken hata oluştu.' }, { status: 500 });
  }
}
