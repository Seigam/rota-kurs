import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    if (user.role === Role.STUDENT) redirect('/student/dashboard');
    if (user.role === Role.TEACHER) redirect('/teacher/dashboard');
    if (user.role === Role.ADMIN) redirect('/admin/dashboard');
    redirect('/');
  }
  return user;
}
