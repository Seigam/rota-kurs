import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const deleteMany = vi.fn().mockResolvedValue({ count: 0 });
vi.mock('@/lib/prisma', () => ({ prisma: { goalPlanItem: { deleteMany }, profile: {}, $transaction: vi.fn() } }));
vi.mock('@/lib/student-api', () => ({
  rejectInvalidOrigin: vi.fn().mockReturnValue(null),
  requireStudentApi: vi.fn().mockResolvedValue({ context: { userId: 'user-a', profileId: 'student-a', grade: 11 } }),
}));

describe('hedef sahipliği', () => {
  it('silme sorgusunu id + studentId ile sınırlar ve yabancı kaydı 404 sayar', async () => {
    const { PATCH } = await import('@/app/api/student/goals/route');
    const request = new NextRequest('http://localhost/api/student/goals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE', goalItemId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }) });
    const response = await PATCH(request);
    expect(response.status).toBe(404);
    expect(deleteMany).toHaveBeenCalledWith({ where: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', studentId: 'student-a' } });
  });
});
