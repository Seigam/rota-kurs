import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { LessonPathDesign, type LessonPathCourse, type LessonPathUnit } from './lesson-path-design';

export const metadata: Metadata = {
  title: 'Ders Rotam | FutuRoute',
  description: 'Hedef alanlarına göre düzenlenen kişisel ders rotası.',
};

const DOMAIN_LABELS: Record<string, string> = {
  CAREER: 'Kariyer & Mesleki',
  ACADEMIC: 'Akademik & Okul',
  PERSONAL_DEV: 'Kişisel Gelişim',
  SOCIAL: 'Sosyal & İlişkiler',
  HEALTH: 'Sağlık & Yaşam Tarzı',
  FINANCIAL: 'Finansal Farkındalık',
};

const DOMAIN_KEYS = Object.keys(DOMAIN_LABELS);

function parseDomainTags(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === 'string') : [];
  } catch {
    return [];
  }
}

function normalizeTitle(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR');
}

function inferredDomains(value: string | null) {
  const normalized = (value ?? '').toLocaleLowerCase('tr-TR');
  const domains: string[] = [];

  if (/finans|bütçe|yatırım|iş dünyası/.test(normalized)) domains.push('FINANCIAL');
  if (/sağlık|yaşam bilim|spor|beslen/.test(normalized)) domains.push('HEALTH');
  if (/sosyal|beşeri|iletişim|vatandaşlık/.test(normalized)) domains.push('SOCIAL');
  if (/sanat|tasarım|yaratıcı|kişisel/.test(normalized)) domains.push('PERSONAL_DEV');
  if (/akadem|bilim|araştır|çevre|tarım/.test(normalized)) domains.push('ACADEMIC');
  if (/kariyer|yazılım|teknoloji|mühendis|üretim|girişim/.test(normalized)) domains.push('CAREER');

  return domains;
}

export default async function StudentLessonPathPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      experiencePoints: true,
      currentLevel: true,
      streakDays: true,
      dailyXp: true,
      goalPlanItems: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, domain: true, selectedGoal: true, wishText: true },
      },
      courseApprovals: {
        where: { status: { in: ['APPROVED', 'PENDING'] } },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          courseTitle: true,
          coursePlatform: true,
          courseLevel: true,
          courseDuration: true,
          courseUrl: true,
          courseReason: true,
          counselorNote: true,
          domain: true,
          status: true,
        },
      },
    },
  });

  const approvals = profile?.courseApprovals ?? [];
  const programTitles = approvals.map((course) => course.courseTitle);
  const programMetadata = programTitles.length > 0
    ? await prisma.careerProgram.findMany({
        where: { title: { in: programTitles } },
        select: { title: true, description: true, relatedDomainTags: true, link: true, url: true },
      })
    : [];
  const metadataByTitle = new Map(programMetadata.map((program) => [normalizeTitle(program.title), program]));

  const goalDomains = Array.from(new Set(
    (profile?.goalPlanItems ?? []).map((goal) => goal.domain).filter((domain) => DOMAIN_KEYS.includes(domain)),
  ));

  const coursesByDomain = new Map<string, LessonPathCourse[]>();

  for (const approval of approvals) {
    const normalizedCourseTitle = normalizeTitle(approval.courseTitle);
    const matchingGoal = profile?.goalPlanItems.find(
      (goal) => normalizeTitle(goal.wishText) === normalizedCourseTitle && DOMAIN_KEYS.includes(goal.domain),
    );
    const program = metadataByTitle.get(normalizedCourseTitle);
    const candidates = [
      matchingGoal?.domain,
      DOMAIN_KEYS.includes(approval.domain ?? '') ? approval.domain : undefined,
      ...parseDomainTags(program?.relatedDomainTags),
      ...inferredDomains(approval.domain),
    ].filter((domain): domain is string => typeof domain === 'string' && DOMAIN_KEYS.includes(domain));

    const domain = candidates.find((candidate) => goalDomains.includes(candidate))
      ?? candidates[0]
      ?? (goalDomains.length === 1 ? goalDomains[0] : 'CAREER');

    const course: LessonPathCourse = {
      id: approval.id,
      title: approval.courseTitle,
      provider: approval.coursePlatform,
      level: approval.courseLevel,
      duration: approval.courseDuration,
      url: approval.courseUrl ?? program?.url ?? program?.link ?? null,
      description: approval.courseReason ?? program?.description ?? null,
      counselorNote: approval.counselorNote,
      status: approval.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
    };

    coursesByDomain.set(domain, [...(coursesByDomain.get(domain) ?? []), course]);
  }

  const orderedDomains = Array.from(new Set([...goalDomains, ...coursesByDomain.keys()]));
  const units: LessonPathUnit[] = orderedDomains.map((domain) => ({
    id: domain,
    title: DOMAIN_LABELS[domain] ?? 'Diğer Dersler',
    goalCount: profile?.goalPlanItems.filter((goal) => goal.domain === domain).length ?? 0,
    courses: coursesByDomain.get(domain) ?? [],
  }));

  return (
    <LessonPathDesign
      studentName={user.name || 'Öğrenci'}
      experiencePoints={profile?.experiencePoints ?? 0}
      level={profile?.currentLevel ?? 1}
      streakDays={profile?.streakDays ?? 0}
      dailyXp={profile?.dailyXp ?? 0}
      units={units}
    />
  );
}
