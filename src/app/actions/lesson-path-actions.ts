'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { startOfDay, differenceInDays } from 'date-fns';

export async function completeLessonStep(studentId: string, goalPlanItemId: string, stepId: string, xpReward: number = 30) {
  const profile = await prisma.profile.findUnique({
    where: { userId: studentId },
  });

  if (!profile) throw new Error('Profile not found');

  const goalItem = await prisma.goalPlanItem.findUnique({
    where: { id: goalPlanItemId },
  });

  if (!goalItem) throw new Error('GoalPlanItem not found');

  // Update the step in JSON
  let steps = [];
  try {
    steps = JSON.parse(goalItem.planSteps);
  } catch (e) {
    // ignore parse error
  }

  let stepFound = false;
  const updatedSteps = steps.map((step: any) => {
    if (step.id === stepId) {
      if (step.isCompleted) return step; // Already completed
      stepFound = true;
      return { ...step, isCompleted: true };
    }
    return step;
  });

  if (!stepFound) {
    return { success: false, message: 'Step not found or already completed' };
  }

  const allCompleted = updatedSteps.every((s: any) => s.isCompleted);

  // Calculate Streak & Daily XP
  const now = new Date();
  const today = startOfDay(now);
  
  let newStreak = profile.streakDays || 0;
  let newDailyXp = profile.dailyXp || 0;
  
  const lastLessonDay = profile.lastLessonDate ? startOfDay(profile.lastLessonDate) : null;
  const lastXpDay = profile.dailyXpDate ? startOfDay(profile.dailyXpDate) : null;

  if (!lastLessonDay) {
    newStreak = 1;
  } else {
    const diff = differenceInDays(today, lastLessonDay);
    if (diff === 1) {
      newStreak += 1;
    } else if (diff > 1) {
      newStreak = 1;
    }
    // if diff === 0, streak remains same
  }

  if (!lastXpDay || differenceInDays(today, lastXpDay) > 0) {
    newDailyXp = xpReward;
  } else {
    newDailyXp += xpReward;
  }

  // Calculate new level if needed (e.g. 1 level per 500 XP)
  const totalXp = profile.experiencePoints + xpReward;
  const newLevel = Math.floor(totalXp / 500) + 1;

  await prisma.$transaction([
    prisma.goalPlanItem.update({
      where: { id: goalPlanItemId },
      data: {
        planSteps: JSON.stringify(updatedSteps),
        isCompleted: allCompleted,
      },
    }),
    prisma.profile.update({
      where: { userId: studentId },
      data: {
        experiencePoints: totalXp,
        currentLevel: newLevel > profile.currentLevel ? newLevel : profile.currentLevel,
        streakDays: newStreak,
        dailyXp: newDailyXp,
        lastLessonDate: now,
        dailyXpDate: now,
      },
    }),
  ]);

  revalidatePath('/student/lesson-path');
  return { success: true, xpEarned: xpReward, newTotalXp: totalXp, newStreak };
}
