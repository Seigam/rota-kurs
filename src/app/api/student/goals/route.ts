import { EntryType, LifeDomain } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { goalTimeHorizonSchema } from '@/lib/ai/contracts';
import { rejectInvalidOrigin, requireStudentApi } from '@/lib/student-api';

type PlanStep = {
  id: string;
  text: string;
  phase?: string;
  isCompleted?: boolean;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string | null;
  startDate?: string | null;
  timeRange?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isAllDay?: boolean;
  color?: string;
};

const stepSchema = z.object({
  id: z.string().trim().min(1).max(120),
  text: z.string().trim().min(1).max(600),
  phase: z.string().max(30).optional(),
  isCompleted: z.boolean().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  dueDate: z.string().max(40).nullable().optional(),
  startDate: z.string().max(40).nullable().optional(),
  timeRange: z.string().max(80).nullable().optional(),
  startTime: z.string().max(20).nullable().optional(),
  endTime: z.string().max(20).nullable().optional(),
  isAllDay: z.boolean().optional(),
  color: z.string().max(30).optional(),
}).passthrough();

const saveGoalSchema = z.object({
  id: z.string().uuid().optional(),
  domain: z.nativeEnum(LifeDomain),
  timeHorizon: goalTimeHorizonSchema,
  wishText: z.string().trim().min(3).max(500),
  selectedGoal: z.string().trim().min(3).max(600),
  planSteps: z.array(stepSchema).max(30).default([]),
}).strict();

const patchGoalSchema = z.object({
  action: z.enum(['DELETE', 'TOGGLE_STEP', 'UPDATE_STEP_STATUS', 'UPDATE_STEP_DATE', 'ADD_STEP']),
  goalItemId: z.string().uuid(),
  stepId: z.string().max(120).optional(),
  newStatus: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  stepText: z.string().trim().min(1).max(600).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  dueDate: z.string().max(40).nullable().optional(),
  startDate: z.string().max(40).nullable().optional(),
  timeRange: z.string().max(80).nullable().optional(),
  startTime: z.string().max(20).nullable().optional(),
  endTime: z.string().max(20).nullable().optional(),
  isAllDay: z.boolean().optional(),
  color: z.string().max(30).optional(),
}).strict();

function parseSteps(raw: string): PlanStep[] {
  try {
    const result = z.array(stepSchema).safeParse(JSON.parse(raw || '[]'));
    return result.success ? result.data : [];
  } catch { return []; }
}

export async function GET() {
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const profile = await prisma.profile.findUnique({
    where: { id: auth.context.profileId },
    select: { experiencePoints: true, currentLevel: true, goalPlanItems: { orderBy: { createdAt: 'desc' } } },
  });
  if (!profile) return NextResponse.json({ error: 'Öğrenci profili bulunamadı.' }, { status: 404 });
  return NextResponse.json({
    goals: profile.goalPlanItems.map((item) => ({ ...item, planSteps: parseSteps(item.planSteps) })),
    experiencePoints: profile.experiencePoints,
    currentLevel: profile.currentLevel,
  });
}

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const parsed = saveGoalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', error: 'Hedef alanları geçersiz.', details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const payload = parsed.data;
  if (payload.id) {
    const result = await prisma.goalPlanItem.updateMany({
      where: { id: payload.id, studentId: auth.context.profileId },
      data: { domain: payload.domain, timeHorizon: payload.timeHorizon, wishText: payload.wishText, selectedGoal: payload.selectedGoal, planSteps: JSON.stringify(payload.planSteps) },
    });
    if (result.count === 0) return NextResponse.json({ error: 'Hedef bulunamadı.' }, { status: 404 });
  } else {
    await prisma.goalPlanItem.create({ data: {
      studentId: auth.context.profileId, domain: payload.domain, timeHorizon: payload.timeHorizon, wishText: payload.wishText,
      selectedGoal: payload.selectedGoal, planSteps: JSON.stringify(payload.planSteps), xpAwarded: 100,
    } });
  }

  await prisma.lifeDomainEntry.upsert({
    where: { studentId_domain_entryType: { studentId: auth.context.profileId, domain: payload.domain, entryType: EntryType.GOAL } },
    update: { text: payload.selectedGoal },
    create: { studentId: auth.context.profileId, domain: payload.domain, entryType: EntryType.GOAL, text: payload.selectedGoal },
  });
  const goal = await prisma.goalPlanItem.findFirst({
    where: payload.id ? { id: payload.id, studentId: auth.context.profileId } : { studentId: auth.context.profileId, domain: payload.domain, selectedGoal: payload.selectedGoal },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, goal: goal ? { ...goal, planSteps: parseSteps(goal.planSteps) } : null });
}

export async function PATCH(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;
  const auth = await requireStudentApi();
  if (auth.response) return auth.response;
  const parsed = patchGoalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', error: 'Güncelleme alanları geçersiz.' }, { status: 400 });
  const input = parsed.data;

  if (input.action === 'DELETE') {
    const result = await prisma.goalPlanItem.deleteMany({ where: { id: input.goalItemId, studentId: auth.context.profileId } });
    return result.count === 0
      ? NextResponse.json({ error: 'Hedef bulunamadı.' }, { status: 404 })
      : NextResponse.json({ success: true, message: 'Hedef silindi.' });
  }

  const goalItem = await prisma.goalPlanItem.findFirst({ where: { id: input.goalItemId, studentId: auth.context.profileId } });
  if (!goalItem) return NextResponse.json({ error: 'Hedef bulunamadı.' }, { status: 404 });
  const steps = parseSteps(goalItem.planSteps);

  if (input.action === 'UPDATE_STEP_DATE' && input.stepId) {
    const updatedSteps = steps.map((step) => step.id === input.stepId ? {
      ...step,
      dueDate: input.dueDate !== undefined ? input.dueDate : step.dueDate,
      startDate: input.startDate !== undefined ? input.startDate : step.startDate,
      timeRange: input.timeRange !== undefined ? input.timeRange : step.timeRange,
      startTime: input.startTime !== undefined ? input.startTime : step.startTime,
      endTime: input.endTime !== undefined ? input.endTime : step.endTime,
      isAllDay: input.isAllDay !== undefined ? input.isAllDay : step.isAllDay,
      color: input.color !== undefined ? input.color : step.color,
    } : step);
    await prisma.goalPlanItem.updateMany({ where: { id: input.goalItemId, studentId: auth.context.profileId }, data: { planSteps: JSON.stringify(updatedSteps) } });
    return NextResponse.json({ success: true, steps: updatedSteps });
  }

  let xpDelta = 0;
  let updatedSteps = steps;
  if (input.action === 'TOGGLE_STEP' && input.stepId) {
    updatedSteps = steps.map((step) => {
      if (step.id !== input.stepId) return step;
      const done = !(step.status === 'DONE' || step.isCompleted);
      xpDelta = done ? 25 : -25;
      return { ...step, status: done ? 'DONE' : 'TODO', isCompleted: done };
    });
  } else if (input.action === 'UPDATE_STEP_STATUS' && input.stepId && input.newStatus) {
    updatedSteps = steps.map((step) => {
      if (step.id !== input.stepId) return step;
      const wasDone = step.status === 'DONE' || step.isCompleted === true;
      const isDone = input.newStatus === 'DONE';
      xpDelta = wasDone === isDone ? 0 : isDone ? 25 : -25;
      return { ...step, status: input.newStatus, isCompleted: isDone };
    });
  } else if (input.action === 'ADD_STEP' && input.stepText) {
    const status = input.status ?? 'TODO';
    const newStep: PlanStep = { id: `step_${crypto.randomUUID()}`, text: input.stepText, status, isCompleted: status === 'DONE' };
    updatedSteps = [...steps, newStep];
    xpDelta = status === 'DONE' ? 25 : 0;
  } else {
    return NextResponse.json({ code: 'INVALID_INPUT', error: 'İşlem için gerekli alanlar eksik.' }, { status: 400 });
  }

  const allCompleted = updatedSteps.length > 0 && updatedSteps.every((step) => step.status === 'DONE' || step.isCompleted);
  if (allCompleted && !goalItem.isCompleted) xpDelta += 100;
  if (!allCompleted && goalItem.isCompleted) xpDelta -= 100;
  const profile = await prisma.profile.findUnique({ where: { id: auth.context.profileId }, select: { experiencePoints: true } });
  if (!profile) return NextResponse.json({ error: 'Öğrenci profili bulunamadı.' }, { status: 404 });
  const newXp = Math.max(0, profile.experiencePoints + xpDelta);
  const newLevel = Math.floor(newXp / 200) + 1;
  await prisma.$transaction([
    prisma.goalPlanItem.updateMany({ where: { id: input.goalItemId, studentId: auth.context.profileId }, data: { planSteps: JSON.stringify(updatedSteps), isCompleted: allCompleted } }),
    prisma.profile.update({ where: { id: auth.context.profileId }, data: { experiencePoints: newXp, currentLevel: newLevel } }),
  ]);
  return NextResponse.json({ success: true, steps: updatedSteps, isCompleted: allCompleted, xpDelta,
    experiencePoints: newXp, currentLevel: newLevel });
}
