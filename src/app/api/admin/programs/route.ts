import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Yönetici rolü gereklidir.' }, { status: 403 });
    }

    const programs = await prisma.careerProgram.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('GET Admin Programs Error:', error);
    return NextResponse.json({ error: 'Program listesi alınamadı.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      provider,
      category,
      description,
      duration = '4 Hafta',
      minGrade = 9,
      mbtiFit = '',
      enneagramFit = '',
      url = null,
      isFree = true,
    } = body;

    if (!title || !provider || !category || !description) {
      return NextResponse.json({ error: 'Lütfen zorunlu alanları (Başlık, Kurum, Kategori, Açıklama) doldurun.' }, { status: 400 });
    }

    const newProg = await prisma.careerProgram.create({
      data: {
        title: title.trim(),
        provider: provider.trim(),
        category: category.trim(),
        description: description.trim(),
        duration,
        minGrade: Number(minGrade) || 9,
        mbtiFit,
        enneagramFit,
        url,
        isFree: Boolean(isFree),
      },
    });

    return NextResponse.json({
      success: true,
      program: newProg,
      message: 'Kariyer ve sertifika programı başarıyla eklendi.',
    });
  } catch (error) {
    console.error('POST Admin Program Error:', error);
    return NextResponse.json({ error: 'Program eklenirken hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Geçersiz program ID.' }, { status: 400 });
    }

    await prisma.careerProgram.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Program başarıyla silindi.',
    });
  } catch (error) {
    console.error('DELETE Admin Program Error:', error);
    return NextResponse.json({ error: 'Program silinirken hata oluştu.' }, { status: 500 });
  }
}
