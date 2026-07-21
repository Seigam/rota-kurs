import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { StudentProfileHubClient } from '@/components/student/student-profile-hub-client';

export default async function StudentProfilePage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      familyMembers: true,
      personalityResult: true,
      testAnswers: true,
      goalPlanItems: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Akademik İstatistikler ve Performans Özetini Hesapla
  let totalGoals = 0;
  let completedGoals = 0;
  let totalSteps = 0;
  let completedSteps = 0;

  (profile?.goalPlanItems || []).forEach((goal) => {
    totalGoals++;
    if (goal.isCompleted) completedGoals++;

    try {
      const steps = JSON.parse(goal.planSteps || '[]');
      if (Array.isArray(steps)) {
        steps.forEach((step: any) => {
          totalSteps++;
          if (step.status === 'DONE' || step.isCompleted) {
            completedSteps++;
          }
        });
      }
    } catch {
      // parse hatası olursa yok say
    }
  });

  const completionRate =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const stats = {
    totalGoals,
    completedGoals,
    totalSteps,
    completedSteps,
    completionRate,
    hasPersonalityTest: !!profile?.personalityResult,
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <StudentProfileHubClient
          user={{
            name: user.name || 'Öğrenci',
            email: user.email || '',
          }}
          profile={profile}
          stats={stats}
        />
      </div>
    </div>
  );
}
