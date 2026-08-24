import {
  DevelopmentAssessmentKind,
  DevelopmentAssessmentStatus,
  type DevelopmentAssessmentResponse,
  type LifeDomain,
} from '@prisma/client';

import {
  BASELINE_QUESTIONS,
  DEVELOPMENT_QUESTIONNAIRE_VERSION,
  DEVELOPMENT_SCORING_VERSION,
  MONTHLY_QUESTIONS,
  calculateAreaScores,
  developmentGoalSuggestions,
  getEnabledFollowUps,
  isLowWellbeingScore,
  scoreDevelopmentCatalogItem,
  type DevelopmentResponseInput,
} from '@/lib/development-assessment';
import { prisma } from '@/lib/prisma';

export function istanbulPeriodKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  return `${year}-${month}`;
}

export function assessmentPeriodKey(kind: DevelopmentAssessmentKind, date = new Date()): string {
  return kind === DevelopmentAssessmentKind.BASELINE ? 'baseline' : istanbulPeriodKey(date);
}

function toResponseInput(response: DevelopmentAssessmentResponse): DevelopmentResponseInput {
  return {
    questionKey: response.questionKey,
    area: response.area,
    domain: response.domain,
    statusScore: response.statusScore,
    importanceScore: response.importanceScore,
    uncertain: response.uncertain,
    isFollowUp: response.isFollowUp,
  };
}

function controlledTags(...values: Array<string | null | undefined>): string[] {
  return values
    .flatMap((value) => value?.split(/[,;|\n]/) ?? [])
    .map((value) => value.trim().toLocaleLowerCase('tr-TR'))
    .filter((value) => value.length > 1)
    .slice(0, 12);
}

function parseTopRiasec(result: {
  realistic: number; investigative: number; artistic: number;
  social: number; enterprising: number; conventional: number;
} | null): string[] {
  if (!result) return [];
  return Object.entries({
    R: result.realistic, I: result.investigative, A: result.artistic,
    S: result.social, E: result.enterprising, C: result.conventional,
  }).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([code]) => code);
}

export async function startDevelopmentAssessment(profileId: string, kind: DevelopmentAssessmentKind) {
  return prisma.developmentAssessment.upsert({
    where: { profileId_kind_periodKey: { profileId, kind, periodKey: assessmentPeriodKey(kind) } },
    update: {},
    create: {
      profileId,
      kind,
      periodKey: assessmentPeriodKey(kind),
      questionnaireVersion: DEVELOPMENT_QUESTIONNAIRE_VERSION,
      scoringVersion: DEVELOPMENT_SCORING_VERSION,
    },
    include: { responses: true },
  });
}

export async function completeDevelopmentAssessment(assessmentId: string, profileId: string) {
  const assessment = await prisma.developmentAssessment.findFirst({
    where: { id: assessmentId, profileId },
    include: { responses: true },
  });
  if (!assessment) return { ok: false as const, status: 404, error: 'Değerlendirme bulunamadı.' };
  if (assessment.status === DevelopmentAssessmentStatus.COMPLETED) {
    return { ok: true as const, assessmentId: assessment.id };
  }

  const responses = assessment.responses.map(toResponseInput);
  const requiredBase = assessment.kind === DevelopmentAssessmentKind.BASELINE ? BASELINE_QUESTIONS : MONTHLY_QUESTIONS;
  const enabledFollowUps = assessment.kind === DevelopmentAssessmentKind.BASELINE ? getEnabledFollowUps(responses) : [];
  const requiredKeys = [...requiredBase, ...enabledFollowUps].map((question) => question.key);
  const answeredKeys = new Set(responses.filter((response) => response.uncertain || (response.statusScore !== null && response.importanceScore !== null)).map((response) => response.questionKey));
  const missing = requiredKeys.filter((key) => !answeredKeys.has(key));
  if (missing.length > 0) {
    return { ok: false as const, status: 400, error: 'Değerlendirmeyi tamamlamak için tüm görünen soruları yanıtlayın.', missing };
  }

  const scores = calculateAreaScores(responses);
  const [profile, catalogItems] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        grade: true, targetCareer: true, hobbies: true, favoriteSubjects: true,
        careerInterestResult: true,
        valueRankings: { orderBy: { rankOrder: 'asc' }, take: 5, select: { valueName: true } },
        goalPlanItems: { where: { isCompleted: false }, take: 20, select: { domain: true } },
      },
    }),
    prisma.catalogItem.findMany({
      where: { verificationStatus: 'VERIFIED', isActive: true },
      take: 250,
    }),
  ]);
  if (!profile) return { ok: false as const, status: 404, error: 'Öğrenci profili bulunamadı.' };

  const eligibleItems = catalogItems.filter((item) => {
    const grade = profile.grade ?? 9;
    return grade >= item.minGrade && grade <= item.maxGrade;
  });
  const context = {
    areaScores: scores,
    riasecTopCodes: parseTopRiasec(profile.careerInterestResult),
    interestTags: controlledTags(profile.targetCareer, profile.hobbies, profile.favoriteSubjects),
    goalDomains: profile.goalPlanItems.map((goal) => goal.domain as LifeDomain),
    valueTags: controlledTags(...profile.valueRankings.map((ranking) => ranking.valueName)),
  };
  const recommendations = eligibleItems
    .map((item) => ({ item, ...scoreDevelopmentCatalogItem(item, context) }))
    .filter((item) => item.internalScore >= 35)
    .sort((a, b) => b.internalScore - a.internalScore || a.item.title.localeCompare(b.item.title, 'tr'))
    .slice(0, 5);

  await prisma.$transaction(async (tx) => {
    await tx.developmentAreaScore.deleteMany({ where: { assessmentId } });
    await tx.developmentCatalogRecommendation.deleteMany({ where: { assessmentId } });
    await tx.developmentAreaScore.createMany({
      data: scores.map((score) => ({ ...score, assessmentId })),
    });
    if (recommendations.length > 0) {
      await tx.developmentCatalogRecommendation.createMany({
        data: recommendations.map((recommendation, index) => ({
          assessmentId,
          catalogItemId: recommendation.item.id,
          internalScore: recommendation.internalScore,
          fitBand: recommendation.fitBand,
          confidence: recommendation.confidence,
          reasonBreakdown: JSON.stringify(recommendation.reasons),
          rank: index + 1,
        })),
      });
    }
    await tx.developmentAssessment.update({
      where: { id: assessmentId },
      data: { status: DevelopmentAssessmentStatus.COMPLETED, completedAt: new Date() },
    });
  });

  return { ok: true as const, assessmentId };
}

function safeReasons(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 3) : [];
  } catch {
    return [];
  }
}

export async function getDevelopmentAssessmentResult(assessmentId: string, profileId?: string) {
  const assessment = await prisma.developmentAssessment.findFirst({
    where: { id: assessmentId, ...(profileId ? { profileId } : {}) },
    include: {
      areaScores: { orderBy: { rank: 'asc' } },
      recommendations: { orderBy: { rank: 'asc' }, include: { catalogItem: true } },
      comments: { orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } },
    },
  });
  if (!assessment || assessment.status !== DevelopmentAssessmentStatus.COMPLETED) return null;
  const previousAssessment = assessment.completedAt ? await prisma.developmentAssessment.findFirst({
    where: {
      profileId: assessment.profileId,
      status: DevelopmentAssessmentStatus.COMPLETED,
      completedAt: { lt: assessment.completedAt },
    },
    orderBy: { completedAt: 'desc' },
    include: { areaScores: true },
  }) : null;
  const previousScoreMap = new Map(previousAssessment?.areaScores.map((score) => [score.area, score]) ?? []);
  const primaryScore = assessment.areaScores[0];
  return {
    id: assessment.id,
    kind: assessment.kind,
    periodKey: assessment.periodKey,
    completedAt: assessment.completedAt,
    scores: assessment.areaScores.map((score) => ({
      ...score,
      statusChange: previousScoreMap.has(score.area)
        ? Number((score.statusAverage - previousScoreMap.get(score.area)!.statusAverage).toFixed(1))
        : null,
    })),
    goalSuggestions: primaryScore ? developmentGoalSuggestions(primaryScore) : [],
    goalDomain: primaryScore?.dominantDomain ?? null,
    needsSupportPrompt: isLowWellbeingScore(assessment.areaScores),
    recommendations: assessment.recommendations.map((recommendation) => ({
      id: recommendation.id,
      fitBand: recommendation.fitBand,
      confidence: recommendation.confidence,
      reasons: safeReasons(recommendation.reasonBreakdown),
      item: recommendation.catalogItem,
    })),
    comments: assessment.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      authorName: comment.author.name ?? 'Rehber öğretmen',
    })),
  };
}
