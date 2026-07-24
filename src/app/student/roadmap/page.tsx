import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { CareerRoadmap, type RoadmapSnapshot } from '@/components/student/career-roadmap';
import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Kişisel Yol Haritam | FutuRoute',
  description: 'Kendini tanımadan kariyer hedeflerine uzanan kişiselleştirilmiş öğrenci yol haritası.',
};

type PlanStep = {
  text?: string;
  isCompleted?: boolean;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
};

function readPlanSteps(value: string): PlanStep[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? (parsed as PlanStep[]) : [];
  } catch {
    return [];
  }
}

export default async function StudentRoadmapPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      personalityResult: true,
      goalPlanItems: {
        orderBy: { createdAt: 'desc' },
      },
      valueRankings: true,
      favorites: true,
    },
  });

  const goalItems = profile?.goalPlanItems ?? [];
  const allSteps = goalItems.flatMap((goal) => readPlanSteps(goal.planSteps));
  const completedSteps = allSteps.filter(
    (step) => step.isCompleted || step.status === 'DONE',
  );
  const activeGoal =
    goalItems.find((goal) => !goal.isCompleted) ??
    goalItems[0] ??
    null;
  const activeGoalSteps = activeGoal ? readPlanSteps(activeGoal.planSteps) : [];
  const nextStep =
    activeGoalSteps.find(
      (step) => !step.isCompleted && step.status !== 'DONE',
    ) ?? null;

  const snapshot: RoadmapSnapshot = {
    studentName: user.name || 'Öğrenci',
    grade: profile?.grade ?? null,
    targetCareer: profile?.targetCareer ?? null,
    mbtiType: profile?.personalityResult?.mbtiType ?? null,
    experiencePoints: profile?.experiencePoints ?? 0,
    level: profile?.currentLevel ?? 1,
    goalsCount: goalItems.length,
    completedGoalsCount: goalItems.filter((goal) => goal.isCompleted).length,
    completedStepsCount: completedSteps.length,
    totalStepsCount: allSteps.length,
    valuesCount: profile?.valueRankings.length ?? 0,
    favoritesCount: profile?.favorites.length ?? 0,
    profileCompleted: profile?.completedOnboarding ?? false,
    personalityCompleted: Boolean(profile?.personalityResult),
    nextGoalTitle: activeGoal?.selectedGoal ?? null,
    nextStepText: nextStep?.text ?? null,
  };

  return <CareerRoadmap snapshot={snapshot} />;
}
