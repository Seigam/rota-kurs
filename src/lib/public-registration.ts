import { Role } from '@prisma/client';
import { z } from 'zod';

export const publicStudentRegisterSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  role: z.literal(Role.STUDENT, {
    error: 'Bu form yalnızca öğrenci hesabı oluşturabilir.',
  }).optional().default(Role.STUDENT),
});
