import { LifeDomain } from '@prisma/client';
import { z } from 'zod';

import { GOAL_TIME_HORIZON_VALUES } from '@/lib/goal-time-horizon';

export const aiSourceModeSchema = z.enum(['model', 'template', 'rule']);
export type AiSourceModeValue = z.infer<typeof aiSourceModeSchema>;

export const controlledTagsSchema = z.array(z.string().trim().min(1).max(40)).max(12);
export const riasecScoresSchema = z.object({
  R: z.number().int().min(0).max(25),
  I: z.number().int().min(0).max(25),
  A: z.number().int().min(0).max(25),
  S: z.number().int().min(0).max(25),
  E: z.number().int().min(0).max(25),
  C: z.number().int().min(0).max(25),
});

export const goalTimeHorizonSchema = z.enum(GOAL_TIME_HORIZON_VALUES);

export const minimizedStudentContextSchema = z.object({
  gradeBand: z.enum(['9-10', '11-12', 'unknown']),
  domain: z.nativeEnum(LifeDomain),
  timeHorizon: goalTimeHorizonSchema,
  timeRange: z.enum(['1–4 hafta', '1–6 ay', '6–24 ay']),
  interestTags: controlledTagsSchema,
  valueTags: controlledTagsSchema,
  riasec: riasecScoresSchema.nullable(),
  explicitGoalText: z.string().trim().max(600),
}).strict();

export const suggestGoalsInputSchema = z.object({
  action: z.literal('suggest_goals'),
  domain: z.nativeEnum(LifeDomain),
  timeHorizon: goalTimeHorizonSchema,
  wishText: z.string().trim().min(3).max(500),
});

export const planStepsInputSchema = z.object({
  action: z.literal('plan_steps'),
  domain: z.nativeEnum(LifeDomain),
  timeHorizon: goalTimeHorizonSchema,
  selectedGoal: z.string().trim().min(3).max(600),
});

export const goalsPlannerInputSchema = z.discriminatedUnion('action', [suggestGoalsInputSchema, planStepsInputSchema]);
export const courseRecommendationInputSchema = z.object({ domain: z.nativeEnum(LifeDomain) }).strict();

export const goalSuggestionSchema = z.object({
  id: z.string().regex(/^goal_[1-3]$/),
  text: z.string().trim().min(12).max(420),
  whyItFits: z.string().trim().min(8).max(260),
});
export const suggestGoalsOutputSchema = z.object({ goals: z.array(goalSuggestionSchema).length(3) }).strict();

export const planStepSchema = z.object({
  id: z.string().regex(/^step_[1-4]$/),
  phase: z.enum(['PREPARE', 'START', 'PRACTICE', 'REVIEW']),
  text: z.string().trim().min(10).max(360),
});
export const planStepsOutputSchema = z.object({ steps: z.array(planStepSchema).length(4) }).strict();

export const catalogRankingSchema = z.object({
  catalogItemId: z.string().trim().min(1).max(120),
  relatedStepId: z.string().trim().max(120).optional(),
  reason: z.string().trim().min(8).max(300),
});
export const rankCatalogOutputSchema = z.object({ rankings: z.array(catalogRankingSchema).min(1).max(5) }).strict();

export type GoalSuggestion = z.infer<typeof goalSuggestionSchema>;
export type PlanStep = z.infer<typeof planStepSchema>;
export type CatalogRanking = z.infer<typeof catalogRankingSchema>;

export type AiEnvelope<T> = {
  requestId: string;
  sourceMode: AiSourceModeValue;
  data: T;
  warnings: string[];
};

export const AI_ERROR_CODES = ['INVALID_INPUT', 'RATE_LIMITED', 'AI_UNAVAILABLE', 'SAFETY_REDIRECT'] as const;
