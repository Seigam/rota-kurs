import { prisma } from '@/lib/prisma';

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

function bucketKey(profileId: string, type: 'ten-minute' | 'daily', date: Date): { key: string; expiresAt: Date } {
  if (type === 'ten-minute') {
    const startMs = Math.floor(date.getTime() / 600_000) * 600_000;
    return { key: `${profileId}:10m:${startMs}`, expiresAt: new Date(startMs + 600_000) };
  }
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return { key: `${profileId}:day:${start.toISOString().slice(0, 10)}`, expiresAt: new Date(start.getTime() + 86_400_000) };
}

export async function consumeAiRateLimit(profileId: string, now = new Date()): Promise<RateLimitResult> {
  const tenMinute = bucketKey(profileId, 'ten-minute', now);
  const daily = bucketKey(profileId, 'daily', now);
  const [shortBucket, dayBucket] = await prisma.$transaction([
    prisma.aiRateLimitBucket.upsert({
      where: { key: tenMinute.key },
      create: { key: tenMinute.key, profileId, bucketType: 'TEN_MINUTE', count: 1, expiresAt: tenMinute.expiresAt },
      update: { count: { increment: 1 } },
      select: { count: true, expiresAt: true },
    }),
    prisma.aiRateLimitBucket.upsert({
      where: { key: daily.key },
      create: { key: daily.key, profileId, bucketType: 'DAILY', count: 1, expiresAt: daily.expiresAt },
      update: { count: { increment: 1 } },
      select: { count: true, expiresAt: true },
    }),
  ]);

  if (shortBucket.count > 12 || dayBucket.count > 60) {
    const expiry = shortBucket.count > 12 ? shortBucket.expiresAt : dayBucket.expiresAt;
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((expiry.getTime() - now.getTime()) / 1000)) };
  }
  return { allowed: true };
}
