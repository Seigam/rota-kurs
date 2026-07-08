import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@prisma/client';

const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  role: z.nativeEnum(Role).default(Role.STUDENT),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle zaten bir hesap mevcut.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        role: validatedData.role,
      },
    });

    // Eğer öğrenciyse, hemen bos bir Profile kaydı olusturabiliriz
    if (newUser.role === Role.STUDENT) {
      await prisma.profile.create({
        data: {
          userId: newUser.id,
          completedOnboarding: false,
          currentLevel: 1,
          experiencePoints: 0,
        },
      });
    }

    return NextResponse.json(
      { message: 'Kayıt başarılı', user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: 'Kayıt olurken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
