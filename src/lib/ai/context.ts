import { LifeDomain } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import type { z } from 'zod';
import { minimizedStudentContextSchema } from '@/lib/ai/contracts';
import { getGoalTimeHorizon, type GoalTimeHorizonValue } from '@/lib/goal-time-horizon';

type MinimizedStudentContext = z.infer<typeof minimizedStudentContextSchema>;

function controlledTags(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,;|\n]/)
    .map((item) => item.trim().replace(/[^\p{L}\p{N}\s+#.-]/gu, '').slice(0, 40))
    .filter((item) => item.length > 1)
    .slice(0, 6);
}

export async function buildMinimizedStudentContext(
  profileId: string,
  domain: LifeDomain,
  explicitGoalText: string,
  timeHorizon: GoalTimeHorizonValue,
): Promise<MinimizedStudentContext> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: {
      grade: true,
      targetCareer: true,
      hobbies: true,
      favoriteSubjects: true,
      valueRankings: { orderBy: { rankOrder: 'asc' }, take: 4, select: { valueName: true } },
      careerInterestResult: true,
    },
  });

  const gradeBand = profile?.grade
    ? profile.grade <= 10 ? '9-10' : '11-12'
    : 'unknown';
  const interestTags = [
    ...controlledTags(profile?.targetCareer),
    ...controlledTags(profile?.hobbies),
    ...controlledTags(profile?.favoriteSubjects),
  ].slice(0, 12);
  const valueTags = (profile?.valueRankings ?? [])
    .map((ranking) => controlledTags(ranking.valueName)[0])
    .filter((value): value is string => Boolean(value));
  const result = profile?.careerInterestResult;
  const horizon = getGoalTimeHorizon(timeHorizon);

  return minimizedStudentContextSchema.parse({
    gradeBand,
    domain,
    timeHorizon,
    timeRange: horizon.rangeLabel,
    interestTags,
    valueTags,
    riasec: result ? {
      R: result.realistic,
      I: result.investigative,
      A: result.artistic,
      S: result.social,
      E: result.enterprising,
      C: result.conventional,
    } : null,
    explicitGoalText,
  });
}
