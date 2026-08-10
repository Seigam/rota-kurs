import { randomUUID } from 'node:crypto';

import { NextRequest, NextResponse } from 'next/server';

import { buildMinimizedStudentContext } from '@/lib/ai/context';
import { goalsPlannerInputSchema, planStepsOutputSchema, suggestGoalsOutputSchema } from '@/lib/ai/contracts';
import { safeGoalTemplate, safePlanTemplate, safetyGoalTemplate } from '@/lib/ai/fallbacks';
import { AiGatewayError, AI_TASKS, recordAiFallback, runAiTask } from '@/lib/ai/gateway';
import { consumeAiRateLimit } from '@/lib/ai/rate-limit';
import { evaluateStudentSafety } from '@/lib/ai/safety';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';
import { isFeatureEnabled } from '@/lib/feature-flags';

export const maxDuration = 240;

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;

  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ code: 'INVALID_INPUT', error: 'Geçerli bir JSON gövdesi gönderin.' }, { status: 400 }); }
  const parsed = goalsPlannerInputSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ code: 'INVALID_INPUT', error: 'İstek alanları geçersiz.', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const rate = await consumeAiRateLimit(auth.context.profileId);
  if (!rate.allowed) {
    return NextResponse.json({ code: 'RATE_LIMITED', error: 'AI istek sınırına ulaştınız.', retryAfterSeconds: rate.retryAfterSeconds },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } });
  }

  const text = parsed.data.action === 'suggest_goals' ? parsed.data.wishText : parsed.data.selectedGoal;
  const safety = evaluateStudentSafety(parsed.data.domain, text);
  const definition = parsed.data.action === 'suggest_goals'
    ? AI_TASKS.suggestGoals(suggestGoalsOutputSchema)
    : AI_TASKS.planSteps(planStepsOutputSchema);

  if (!isFeatureEnabled('AI_FEATURE_ENABLED')) {
    const requestId = await recordAiFallback({ profileId: auth.context.profileId, definition, input: parsed.data, reason: 'feature_disabled' });
    const data = parsed.data.action === 'suggest_goals'
      ? { goals: safeGoalTemplate(parsed.data.domain, parsed.data.timeHorizon) }
      : { steps: safePlanTemplate(parsed.data.timeHorizon) };
    return NextResponse.json({ requestId, sourceMode: 'template', data, warnings: ['AI özelliği bu ortamda kapalı; hazır şablon gösteriliyor.'] });
  }

  if (safety.blocked) {
    const requestId = await recordAiFallback({ profileId: auth.context.profileId, definition, input: parsed.data,
      reason: 'safety_redirect', safetyCategory: safety.category });
    const data = parsed.data.action === 'suggest_goals'
      ? { goals: safetyGoalTemplate(parsed.data.domain, parsed.data.timeHorizon) }
      : { steps: safePlanTemplate(parsed.data.timeHorizon) };
    return NextResponse.json({ requestId, sourceMode: 'template', data, warnings: [safety.warning ?? 'Güvenli şablona yönlendirildi.'], code: 'SAFETY_REDIRECT' });
  }

  const minimizedContext = await buildMinimizedStudentContext(
    auth.context.profileId,
    parsed.data.domain,
    text,
    parsed.data.timeHorizon,
  );
  try {
    const result = parsed.data.action === 'suggest_goals'
      ? await runAiTask({ definition: AI_TASKS.suggestGoals(suggestGoalsOutputSchema), profileId: auth.context.profileId, input: minimizedContext })
      : await runAiTask({ definition: AI_TASKS.planSteps(planStepsOutputSchema), profileId: auth.context.profileId, input: minimizedContext });
    return NextResponse.json({ requestId: result.requestId, sourceMode: 'model', data: result.data, warnings: [] });
  } catch (error) {
    const requestId = error instanceof AiGatewayError ? error.requestId : randomUUID();
    const reason = error instanceof AiGatewayError ? error.reason : 'upstream';
    if (!(error instanceof AiGatewayError) || !['schema', 'upstream', 'transport', 'timeout'].includes(error.reason)) {
      await recordAiFallback({ requestId, profileId: auth.context.profileId, definition, input: minimizedContext, reason });
    }
    const data = parsed.data.action === 'suggest_goals'
      ? { goals: safeGoalTemplate(parsed.data.domain, parsed.data.timeHorizon) }
      : { steps: safePlanTemplate(parsed.data.timeHorizon) };
    return NextResponse.json({ requestId, sourceMode: 'template', data,
      warnings: ['Model yanıtı kullanılamadı; düzenleyebileceğiniz güvenli hazır şablon gösteriliyor.'], code: 'AI_UNAVAILABLE' });
  }
}
