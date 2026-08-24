import { DevelopmentAssessmentKind } from '@prisma/client';
import { z } from 'zod';

export const startDevelopmentAssessmentSchema = z.object({
  kind: z.nativeEnum(DevelopmentAssessmentKind),
}).strict();

export const saveDevelopmentResponseSchema = z.object({
  questionKey: z.string().trim().min(3).max(120),
  statusScore: z.number().int().min(1).max(5).nullable(),
  importanceScore: z.number().int().min(1).max(5).nullable(),
  uncertain: z.boolean().default(false),
}).strict().refine((value) => value.uncertain || value.statusScore !== null || value.importanceScore !== null, {
  message: 'En az bir puan veya emin değilim seçimi gereklidir.',
});

export const createAssessmentCommentSchema = z.object({
  content: z.string().trim().min(3).max(1200),
}).strict();
