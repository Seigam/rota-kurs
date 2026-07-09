import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { EntryType, LifeDomain } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        goalPlanItems: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Öğrenci profili bulunamadı' }, { status: 404 });
    }

    const goals = profile.goalPlanItems.map((item) => ({
      id: item.id,
      domain: item.domain,
      wishText: item.wishText,
      selectedGoal: item.selectedGoal,
      planSteps: JSON.parse(item.planSteps || '[]'),
      isCompleted: item.isCompleted,
      xpAwarded: item.xpAwarded,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      goals,
      experiencePoints: profile.experiencePoints || 0,
      currentLevel: profile.currentLevel || 1,
    });
  } catch (err) {
    console.error('GET goals error:', err);
    return NextResponse.json({ error: 'Hedefler alınırken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Öğrenci profili bulunamadı' }, { status: 404 });
    }

    const { id, domain, wishText, selectedGoal, planSteps } = await request.json();

    if (!domain || !wishText || !selectedGoal) {
      return NextResponse.json({ error: 'Eksik bilgi: Alan, istek ve hedef zorunludur' }, { status: 400 });
    }

    const stepsString = JSON.stringify(planSteps || []);

    let goalItem;
    if (id) {
      goalItem = await prisma.goalPlanItem.update({
        where: { id },
        data: {
          domain,
          wishText,
          selectedGoal,
          planSteps: stepsString,
        },
      });
    } else {
      goalItem = await prisma.goalPlanItem.create({
        data: {
          studentId: profile.id,
          domain,
          wishText,
          selectedGoal,
          planSteps: stepsString,
          xpAwarded: 100,
        },
      });
    }

    // Ayrıca yönlendirme kontrolünün (hasCompletedDomains) başarılı geçmesi için LifeDomainEntry kaydı da upsert edelim
    const domainEnum = domain as LifeDomain;
    if (Object.values(LifeDomain).includes(domainEnum)) {
      await prisma.lifeDomainEntry.upsert({
        where: {
          studentId_domain_entryType: {
            studentId: profile.id,
            domain: domainEnum,
            entryType: EntryType.GOAL,
          },
        },
        update: { text: selectedGoal },
        create: {
          studentId: profile.id,
          domain: domainEnum,
          entryType: EntryType.GOAL,
          text: selectedGoal,
        },
      });
    }

    return NextResponse.json({
      success: true,
      goal: {
        ...goalItem,
        planSteps: JSON.parse(goalItem.planSteps),
      },
    });
  } catch (err) {
    console.error('POST goals error:', err);
    return NextResponse.json(
      {
        error: 'Hedef kaydedilirken hata oluştu',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    const requestBody = await request.json();
    const { action, goalItemId, stepId } = requestBody;

    if (action === 'DELETE' && goalItemId) {
      await prisma.goalPlanItem.delete({
        where: { id: goalItemId },
      });
      return NextResponse.json({ success: true, message: 'Hedef silindi' });
    }

    if (action === 'TOGGLE_STEP' && goalItemId && stepId) {
      const goalItem = await prisma.goalPlanItem.findUnique({
        where: { id: goalItemId },
      });

      if (!goalItem) {
        return NextResponse.json({ error: 'Hedef bulunamadı' }, { status: 404 });
      }

      const steps: Array<{ id: string; text: string; isCompleted?: boolean }> = JSON.parse(goalItem.planSteps || '[]');
      let xpDelta = 0;

      const updatedSteps = steps.map((s) => {
        if (s.id === stepId) {
          const nextState = !s.isCompleted;
          xpDelta = nextState ? 25 : -25;
          return { ...s, isCompleted: nextState };
        }
        return s;
      });

      const allCompleted = updatedSteps.length > 0 && updatedSteps.every((s) => s.isCompleted);

      // Eğer tüm adımlar yeni bittiyse ekstra +100 XP
      if (allCompleted && !goalItem.isCompleted) {
        xpDelta += 100;
      }

      const newXp = Math.max(0, (profile.experiencePoints || 0) + xpDelta);
      const newLevel = Math.floor(newXp / 200) + 1;

      await prisma.$transaction([
        prisma.goalPlanItem.update({
          where: { id: goalItemId },
          data: {
            planSteps: JSON.stringify(updatedSteps),
            isCompleted: allCompleted,
          },
        }),
        prisma.profile.update({
          where: { id: profile.id },
          data: {
            experiencePoints: newXp,
            currentLevel: newLevel,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        steps: updatedSteps,
        isCompleted: allCompleted,
        xpDelta,
        experiencePoints: newXp,
        currentLevel: newLevel,
      });
    }

    if (action === 'UPDATE_STEP_STATUS' && goalItemId && stepId && requestBody.newStatus) {
      const { newStatus } = requestBody;
      const goalItem = await prisma.goalPlanItem.findUnique({
        where: { id: goalItemId },
      });

      if (!goalItem) {
        return NextResponse.json({ error: 'Hedef bulunamadı' }, { status: 404 });
      }

      const steps: Array<{ id: string; text: string; isCompleted?: boolean; status?: string }> = JSON.parse(
        goalItem.planSteps || '[]'
      );
      let xpDelta = 0;

      const updatedSteps = steps.map((s) => {
        if (s.id === stepId) {
          const wasDone = s.status === 'DONE' || s.isCompleted === true;
          const willBeDone = newStatus === 'DONE';
          if (!wasDone && willBeDone) {
            xpDelta += 25;
          } else if (wasDone && !willBeDone) {
            xpDelta -= 25;
          }
          return {
            ...s,
            status: newStatus,
            isCompleted: willBeDone,
          };
        }
        return s;
      });

      const allCompleted = updatedSteps.length > 0 && updatedSteps.every((s) => s.status === 'DONE' || s.isCompleted);

      if (allCompleted && !goalItem.isCompleted) {
        xpDelta += 100;
      }

      const newXp = Math.max(0, (profile.experiencePoints || 0) + xpDelta);
      const newLevel = Math.floor(newXp / 200) + 1;

      await prisma.$transaction([
        prisma.goalPlanItem.update({
          where: { id: goalItemId },
          data: {
            planSteps: JSON.stringify(updatedSteps),
            isCompleted: allCompleted,
          },
        }),
        prisma.profile.update({
          where: { id: profile.id },
          data: {
            experiencePoints: newXp,
            currentLevel: newLevel,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        steps: updatedSteps,
        isCompleted: allCompleted,
        experiencePoints: newXp,
        currentLevel: newLevel,
        xpDelta,
      });
    }

    if (action === 'ADD_STEP' && goalItemId && requestBody.stepText) {
      const { stepText, status = 'TODO' } = requestBody;
      const goalItem = await prisma.goalPlanItem.findUnique({
        where: { id: goalItemId },
      });

      if (!goalItem) {
        return NextResponse.json({ error: 'Hedef bulunamadı' }, { status: 404 });
      }

      const steps: Array<{ id: string; text: string; isCompleted?: boolean; status?: string }> = JSON.parse(
        goalItem.planSteps || '[]'
      );
      let xpDelta = status === 'DONE' ? 25 : 0;

      const newStepItem = {
        id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        text: stepText.trim(),
        status: status,
        isCompleted: status === 'DONE',
      };

      const updatedSteps = [...steps, newStepItem];
      const allCompleted = updatedSteps.length > 0 && updatedSteps.every((s) => s.status === 'DONE' || s.isCompleted);

      if (allCompleted && !goalItem.isCompleted) {
        xpDelta += 100;
      }

      const newXp = Math.max(0, (profile.experiencePoints || 0) + xpDelta);
      const newLevel = Math.floor(newXp / 200) + 1;

      await prisma.$transaction([
        prisma.goalPlanItem.update({
          where: { id: goalItemId },
          data: {
            planSteps: JSON.stringify(updatedSteps),
            isCompleted: allCompleted,
          },
        }),
        prisma.profile.update({
          where: { id: profile.id },
          data: {
            experiencePoints: newXp,
            currentLevel: newLevel,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        steps: updatedSteps,
        newStep: newStepItem,
        isCompleted: allCompleted,
        experiencePoints: newXp,
        currentLevel: newLevel,
        xpDelta,
      });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (err) {
    console.error('PATCH goals error:', err);
    return NextResponse.json({ error: 'Hedef güncellenirken hata oluştu' }, { status: 500 });
  }
}
