import { describe, expect, it } from 'vitest';
import { Role } from '@prisma/client';
import { publicStudentRegisterSchema } from '@/lib/public-registration';

const validRegistration = {
  name: 'Yeni Öğrenci',
  email: 'yeni@okul.edu.tr',
  password: 'guvenli123',
};

describe('public student registration', () => {
  it('assigns the student role when no role is supplied', () => {
    expect(publicStudentRegisterSchema.parse(validRegistration).role).toBe(Role.STUDENT);
  });

  it.each([Role.TEACHER, Role.ADMIN])('rejects privilege escalation to %s', (role) => {
    expect(() => publicStudentRegisterSchema.parse({ ...validRegistration, role })).toThrow(
      'Bu form yalnızca öğrenci hesabı oluşturabilir.',
    );
  });
});
