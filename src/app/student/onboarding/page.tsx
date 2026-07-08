import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { OnboardingProfileForm } from '@/components/student/onboarding-profile-form';
import { Compass, GraduationCap } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function OnboardingPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      familyMembers: true,
    },
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative Lights */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            Öğrenci Tanıma & Karar Ağı Formu
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Hoş Geldiniz, <span className="text-gradient">{user.name}</span>!
          </h1>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            RPG temelli kariyer keşif adasına adım atmadan önce sizi ve sosyal destek ağınızı tanıyalım.
          </p>
        </div>

        <OnboardingProfileForm initialData={profile} />
      </div>
    </div>
  );
}
