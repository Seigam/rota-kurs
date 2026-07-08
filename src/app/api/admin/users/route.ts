import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            grade: true,
            targetCareer: true,
            experiencePoints: true,
            currentLevel: true,
            completedOnboarding: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET Admin Users Error:', error);
    return NextResponse.json({ error: 'Kullanıcı listesi alınamadı.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role || !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'Geçersiz parametreler.' }, { status: 400 });
    }

    if (userId === user.id && role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Kendi yönetici rolünüzü kaldıramazsınız.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Kullanıcı rolü başarıyla ${role} olarak güncellendi.`,
    });
  } catch (error) {
    console.error('PATCH Admin User Error:', error);
    return NextResponse.json({ error: 'Rol güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID.' }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ error: 'Kendi hesabınızı bu ekrandan silemezsiniz.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı hesabı başarıyla silindi.',
    });
  } catch (error) {
    console.error('DELETE Admin User Error:', error);
    return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu.' }, { status: 500 });
  }
}
