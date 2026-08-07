import { CatalogItem, LifeDomain } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const DOMAIN_ALIASES: Record<string, LifeDomain> = {
  PERSONAL: LifeDomain.PERSONAL_DEV,
  PERSONAL_DEV: LifeDomain.PERSONAL_DEV,
  CAREER: LifeDomain.CAREER,
  ACADEMIC: LifeDomain.ACADEMIC,
  SOCIAL: LifeDomain.SOCIAL,
  HEALTH: LifeDomain.HEALTH,
  FINANCIAL: LifeDomain.FINANCIAL,
};

function stringArray(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch { return []; }
}

export function normalizeCatalogDomain(domain: string): LifeDomain {
  return DOMAIN_ALIASES[domain] ?? LifeDomain.PERSONAL_DEV;
}

export function scoreCatalogItem(item: CatalogItem, args: {
  domain: LifeDomain; grade: number; riasecTopCodes: string[]; interestTags: string[];
}): number {
  if (item.verificationStatus !== 'VERIFIED' || !item.isActive) return Number.NEGATIVE_INFINITY;
  if (args.grade < item.minGrade || args.grade > item.maxGrade) return Number.NEGATIVE_INFINITY;
  const domains = stringArray(item.domainTags).map(normalizeCatalogDomain);
  const riasec = stringArray(item.riasecTags).map((tag) => tag.toUpperCase());
  const skills = stringArray(item.skillTags).map((tag) => tag.toLocaleLowerCase('tr-TR'));
  let score = domains.includes(args.domain) ? 50 : 0;
  score += args.riasecTopCodes.filter((code) => riasec.includes(code)).length * 12;
  score += args.interestTags.filter((tag) => skills.some((skill) => skill.includes(tag.toLocaleLowerCase('tr-TR')))).length * 4;
  return score;
}

export async function selectVerifiedCatalogCandidates(args: {
  profileId: string; domain: LifeDomain; grade: number;
}): Promise<CatalogItem[]> {
  const [items, profile] = await Promise.all([
    prisma.catalogItem.findMany({ where: { verificationStatus: 'VERIFIED', isActive: true, minGrade: { lte: args.grade }, maxGrade: { gte: args.grade } }, take: 200 }),
    prisma.profile.findUnique({ where: { id: args.profileId }, select: { targetCareer: true, favoriteSubjects: true, hobbies: true, careerInterestResult: true } }),
  ]);
  const result = profile?.careerInterestResult;
  const scores = result ? { R: result.realistic, I: result.investigative, A: result.artistic, S: result.social, E: result.enterprising, C: result.conventional } : null;
  const riasecTopCodes = scores
    ? Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([code]) => code)
    : [];
  const interestTags = [profile?.targetCareer, profile?.favoriteSubjects, profile?.hobbies]
    .flatMap((value) => value?.split(/[,;|]/) ?? []).map((value) => value.trim()).filter(Boolean).slice(0, 10);

  return items
    .map((item) => ({ item, score: scoreCatalogItem(item, { domain: args.domain, grade: args.grade, riasecTopCodes, interestTags }) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'tr'))
    .slice(0, 20)
    .map(({ item }) => item);
}
