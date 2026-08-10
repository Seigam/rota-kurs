import { randomUUID } from 'node:crypto';

import { NextRequest, NextResponse } from 'next/server';

import { courseRecommendationInputSchema, rankCatalogOutputSchema } from '@/lib/ai/contracts';
import { AiGatewayError, AI_TASKS, recordAiFallback, runAiTask } from '@/lib/ai/gateway';
import { consumeAiRateLimit } from '@/lib/ai/rate-limit';
import { selectVerifiedCatalogCandidates } from '@/lib/catalog-service';
import { prisma } from '@/lib/prisma';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';
import { isFeatureEnabled } from '@/lib/feature-flags';

export const maxDuration = 240;

type StoredStep = { id: string; text: string; status?: string };

function parseSteps(raw: string): StoredStep[] {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter((step): step is StoredStep => Boolean(step) && typeof step === 'object' &&
      typeof (step as StoredStep).id === 'string' && typeof (step as StoredStep).text === 'string');
  } catch { return []; }
}

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;

  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ code: 'INVALID_INPUT', error: 'Geçerli bir JSON gövdesi gönderin.' }, { status: 400 }); }
  const parsed = courseRecommendationInputSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', error: 'Yalnız geçerli bir domain gönderin.' }, { status: 400 });

  const rate = await consumeAiRateLimit(auth.context.profileId);
  if (!rate.allowed) return NextResponse.json({ code: 'RATE_LIMITED', error: 'AI istek sınırına ulaştınız.', retryAfterSeconds: rate.retryAfterSeconds },
    { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } });

  const [candidates, ownedGoals] = await Promise.all([
    selectVerifiedCatalogCandidates({ profileId: auth.context.profileId, domain: parsed.data.domain, grade: auth.context.grade ?? 9 }),
    prisma.goalPlanItem.findMany({ where: { studentId: auth.context.profileId, domain: parsed.data.domain }, select: { id: true, selectedGoal: true, planSteps: true } }),
  ]);
  const steps = ownedGoals.flatMap((goal) => parseSteps(goal.planSteps).map((step) => ({ id: step.id, text: step.text.slice(0, 240) }))).slice(0, 20);
  const definition = AI_TASKS.rankCatalog(rankCatalogOutputSchema);

  const hydrate = (rankings: Array<{ catalogItemId: string; relatedStepId?: string; reason: string }>) => {
    const itemMap = new Map(candidates.map((item) => [item.id, item]));
    const stepMap = new Map(steps.map((step) => [step.id, step.text]));
    return rankings.flatMap((ranking) => {
      const item = itemMap.get(ranking.catalogItemId);
      if (!item) return [];
      return [{
        id: item.id, catalogItemId: item.id, title: item.title, platform: item.provider,
        level: item.level ?? 'Belirtilmedi', duration: item.duration ?? 'Belirtilmedi', url: item.url,
        relatedStep: ranking.relatedStepId ? stepMap.get(ranking.relatedStepId) : undefined,
        reason: ranking.reason, verificationStatus: item.verificationStatus, sourceMode: 'verified_catalog',
      }];
    });
  };

  const ruleRankings = candidates.slice(0, 5).map((item, index) => ({
    catalogItemId: item.id,
    relatedStepId: steps[index % Math.max(steps.length, 1)]?.id,
    reason: 'Sınıf düzeyi, seçilen yaşam alanı ve mevcut ilgi sinyalleriyle eşleşen doğrulanmış katalog kaydı.',
  }));

  if (candidates.length === 0) {
    const requestId = await recordAiFallback({ profileId: auth.context.profileId, definition, input: parsed.data, reason: 'no_verified_candidates' });
    return NextResponse.json({ requestId, sourceMode: 'rule', data: { recommendations: [] },
      warnings: ['Bu alan için doğrulanmış katalog kaydı bulunamadı; dış kaynak üretilmedi.'] });
  }

  if (!isFeatureEnabled('AI_FEATURE_ENABLED')) {
    const requestId = await recordAiFallback({ profileId: auth.context.profileId, definition, input: parsed.data, reason: 'feature_disabled' });
    return NextResponse.json({ requestId, sourceMode: 'rule', data: { recommendations: hydrate(ruleRankings) },
      warnings: ['AI özelliği bu ortamda kapalı; doğrulanmış katalog kural tabanlı sıralandı.'] });
  }

  const modelInput = {
    domain: parsed.data.domain,
    goals: ownedGoals.map((goal) => ({ id: goal.id, text: goal.selectedGoal.slice(0, 300) })),
    steps,
    candidates: candidates.map((item) => ({ id: item.id, description: item.description.slice(0, 300), level: item.level, duration: item.duration, domainTags: item.domainTags, skillTags: item.skillTags, riasecTags: item.riasecTags })),
  };
  try {
    const result = await runAiTask({ definition, profileId: auth.context.profileId, input: modelInput });
    const recommendations = hydrate(result.data.rankings);
    if (recommendations.length === 0) throw new AiGatewayError('Katalog dışı kimlikler reddedildi.', 'schema', result.requestId);
    return NextResponse.json({ requestId: result.requestId, sourceMode: 'model', data: { recommendations }, warnings: [] });
  } catch (error) {
    const requestId = error instanceof AiGatewayError ? error.requestId : randomUUID();
    if (!(error instanceof AiGatewayError)) await recordAiFallback({ requestId, profileId: auth.context.profileId, definition, input: modelInput, reason: 'catalog_fallback' });
    return NextResponse.json({ requestId, sourceMode: 'rule', data: { recommendations: hydrate(ruleRankings) },
      warnings: ['Model sıralaması kullanılamadı; doğrulanmış katalog adayları kural tabanlı sıralandı.'], code: 'AI_UNAVAILABLE' });
  }
}
