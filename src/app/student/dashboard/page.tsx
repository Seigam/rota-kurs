import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  ArrowRight,
  Activity,
  Award,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  HeartHandshake,
  Route,
  Sparkles,
  Star,
  Target,
} from 'lucide-react';
import { Role } from '@prisma/client';
import { WeeklyFocusWidget } from '@/components/student/weekly-focus-widget';
import { GettingStartedGuide, type GettingStartedStep } from '@/components/student/getting-started-guide';

const quickActions = [
  {
    href: '/student/roadmap',
    title: 'Yol haritam',
    description: 'Büyük resmi ve sıradaki adımı gör',
    icon: Route,
  },
  {
    href: '/student/goals',
    title: 'Hedeflerim',
    description: 'Haftalık planını güncelle',
    icon: Target,
  },
  {
    href: '/student/lesson-path',
    title: 'Ders rotam',
    description: 'Ders ve kaynak önerilerini aç',
    icon: BookOpenCheck,
  },
];

const tools = [
  {
    href: '/student/development',
    title: 'Gelişim nabzım',
    description: 'Üç ana alandaki durumunu değerlendir',
    icon: Activity,
  },
  {
    href: '/rpg/test',
    title: 'Rehberlik envanteri',
    description: 'İlgi ve öğrenme profilini keşfet',
    icon: Compass,
  },
  {
    href: '/student/programs',
    title: 'Program önerileri',
    description: 'Sana uygun programları karşılaştır',
    icon: Award,
  },
  {
    href: '/student/values',
    title: 'Değerlerim',
    description: 'Senin için önemli olanları sırala',
    icon: Star,
  },
  {
    href: '/student/counseling',
    title: 'Rehberlik desteği',
    description: 'Notlarını ve görüşme özetini gör',
    icon: HeartHandshake,
  },
];

export default async function StudentDashboardPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      familyMembers: true,
      personalityResult: true,
      testAnswers: true,
      valueRankings: { take: 1 },
      profileRankings: { take: 1 },
      lifeDomainEntries: { take: 1 },
      recommendations: { take: 1 },
      developmentAssessments: {
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 1,
      },
    },
  });

  const xp = profile?.experiencePoints || 0;
  const level = profile?.currentLevel || 1;
  const nextLevelXp = level * 100;
  const xpPercentage = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  const hasValues = Boolean(profile?.valueRankings.length || profile?.profileRankings.length);
  const hasDomainPlan = Boolean(profile?.lifeDomainEntries.length);
  const hasDevelopmentAssessment = Boolean(profile?.developmentAssessments.length);

  const gettingStartedSteps: GettingStartedStep[] = [
    {
      title: 'Seni tanıyalım',
      description: 'Sınıf ve hedef bilgilerini ekle.',
      href: '/student/onboarding',
      completed: Boolean(profile?.completedOnboarding),
      icon: ClipboardCheck,
    },
    {
      title: 'Önceliklerini seç',
      description: 'Senin için önemli değerleri sırala.',
      href: '/student/values',
      completed: hasValues,
      icon: Star,
    },
    {
      title: 'Gelişim nabzını çıkar',
      description: 'Üç ana alandaki durumunu ve önceliğini değerlendir.',
      href: '/student/development',
      completed: hasDevelopmentAssessment,
      icon: Activity,
    },
    {
      title: 'İlk hedefini kur',
      description: 'Yaşam alanlarında bir yön belirle.',
      href: '/student/domains',
      completed: hasDomainPlan,
      icon: Target,
    },
    {
      title: 'Profilini keşfet',
      description: 'Kısa rehberlik envanterini tamamla.',
      href: '/rpg/test',
      completed: Boolean(profile?.personalityResult),
      icon: Compass,
    },
    {
      title: 'Önerilerini gör',
      description: 'Sana uygun programları karşılaştır.',
      href: '/student/programs',
      completed: Boolean(profile?.recommendations.length),
      icon: Award,
    },
  ];

  const nextAction = !profile?.completedOnboarding
    ? {
        eyebrow: 'Önce bunu tamamla',
        title: 'Kişisel profilini oluştur',
        description: 'Sınıfına ve hedeflerine uygun öneriler alabilmemiz için temel bilgilerini tamamla.',
        duration: 'Yaklaşık 4 dakika',
        href: '/student/onboarding',
        cta: 'Profili tamamla',
        icon: ClipboardCheck,
      }
    : !hasValues
      ? {
          eyebrow: 'Sıradaki kısa adım',
          title: 'Sana yön veren değerleri seç',
          description: 'Karar verirken senin için vazgeçilmez olan değerleri sıralayarak önerilerini kişiselleştir.',
          duration: 'Yaklaşık 3 dakika',
          href: '/student/values',
          cta: 'Değerlerimi seç',
          icon: Star,
        }
    : !hasDevelopmentAssessment
      ? {
          eyebrow: 'Sıradaki kısa adım',
          title: 'Üç alandaki gelişim nabzını çıkar',
          description: 'Öğrenme ve Gelecek, Kendini Geliştirme ve İyi Yaşam, İlişkiler ve Katılım alanlarında bu ayki önceliğini keşfet.',
          duration: 'Yaklaşık 5 dakika',
          href: '/student/development',
          cta: 'Gelişim nabzımı başlat',
          icon: Activity,
        }
    : !hasDomainPlan
      ? {
          eyebrow: 'Sıradaki kısa adım',
          title: 'İlk hedefini görünür hale getir',
          description: 'Akademik, kariyer veya kişisel gelişim alanlarından birinde isteğini somut bir hedefe dönüştür.',
          duration: 'Yaklaşık 5 dakika',
          href: '/student/domains',
          cta: 'Hedefimi oluştur',
          icon: Target,
        }
    : !profile.personalityResult
      ? {
          eyebrow: 'Sıradaki keşif',
          title: 'İlgi ve öğrenme profilini keşfet',
          description: 'Oyunlaştırılmış envanteri tamamla; güçlü yönlerini ve sana uygun çalışma yaklaşımını gör.',
          duration: 'Yaklaşık 8 dakika',
          href: '/rpg/test',
          cta: 'Envanteri başlat',
          icon: Compass,
        }
    : !profile.recommendations.length
      ? {
          eyebrow: 'Rotanı tamamla',
          title: 'Sana uygun programları karşılaştır',
          description: 'Profilin ve hedeflerin hazır. Şimdi eşleşen programları gör ve ilk favorini kaydet.',
          duration: 'Yaklaşık 4 dakika',
          href: '/student/programs',
          cta: 'Önerilerimi gör',
          icon: Award,
        }
      : {
          eyebrow: 'Bugünkü önerin',
          title: 'Yol haritandaki sıradaki adıma geç',
          description: 'Hedeflerin, ders planın ve gelişim programların tek bir sırada hazır.',
          duration: 'Kaldığın yerden devam et',
          href: '/student/roadmap',
          cta: 'Yol haritamı aç',
          icon: Route,
        };

  const NextActionIcon = nextAction.icon;

  return (
    <div className="paper-shell flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-[#ded9cf] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eeecff] px-3 py-1 text-xs font-extrabold text-[#4338ca]">
                {profile?.grade ? `${profile.grade}. sınıf` : 'Lise öğrencisi'}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${profile?.completedOnboarding ? 'bg-[#dce9df] text-[#24633b]' : 'bg-[#fff0d9] text-[#8a4b06]'}`}>
                {profile?.completedOnboarding && <CheckCircle2 className="size-3.5" aria-hidden="true" />}
                {profile?.completedOnboarding ? 'Profil hazır' : 'Profil tamamlanmadı'}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#172033] sm:text-5xl">
              Merhaba, {user.name?.split(' ')[0] || 'öğrenci'}.
            </h1>
            <p className="mt-2 text-lg text-[#626a79]">Bugün yalnızca sıradaki adıma odaklanalım.</p>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-[#ded9cf] bg-white p-4" aria-label={`Seviye ${level}, ${xp} deneyim puanı`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-extrabold text-[#303849]">Seviye {level}</span>
              <span className="font-bold text-[#626a79]">{xp} / {nextLevelXp} XP</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#ebe7df]" role="progressbar" aria-valuemin={0} aria-valuemax={nextLevelXp} aria-valuenow={Math.min(xp, nextLevelXp)} aria-label="Seviye ilerlemesi">
              <div className="h-full rounded-full bg-[#4f46e5]" style={{ width: `${xpPercentage}%` }} />
            </div>
          </div>
        </header>

        <GettingStartedGuide steps={gettingStartedSteps} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <section aria-labelledby="next-action-title" className="relative overflow-hidden rounded-[32px] bg-[#4f46e5] p-7 text-white shadow-[0_20px_45px_rgba(79,70,229,0.22)] sm:p-9">
            <div className="absolute -right-16 -top-16 size-52 rounded-full border-[32px] border-white/10" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
                <NextActionIcon className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-100">{nextAction.eyebrow}</p>
              <h2 id="next-action-title" className="mt-2 text-3xl font-black tracking-[-0.03em] sm:text-4xl">{nextAction.title}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-indigo-100">{nextAction.description}</p>
              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href={nextAction.href} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-white px-6 font-extrabold text-[#3730a3] shadow-[0_6px_0_#c9c5f8] hover:-translate-y-0.5">
                  {nextAction.cta}
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
                <span className="text-sm font-bold text-indigo-100">{nextAction.duration}</span>
              </div>
            </div>
          </section>

          <aside className="paper-card rounded-[32px] p-6" aria-labelledby="profile-summary-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#777e8b]">Kısa özet</p>
                <h2 id="profile-summary-title" className="mt-1 text-xl font-black text-[#172033]">Profilin</h2>
              </div>
              <Sparkles className="size-6 text-[#e96852]" aria-hidden="true" />
            </div>
            <dl className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-[#f6f2eb] p-4">
                <dt className="text-xs font-bold text-[#777e8b]">Hedef meslek</dt>
                <dd className="mt-1 font-extrabold text-[#172033]">{profile?.targetCareer || 'Henüz belirlenmedi'}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#eeecff] p-4">
                  <dt className="text-xs font-bold text-[#625ab3]">Kişilik profili</dt>
                  <dd className="mt-1 text-lg font-black text-[#3730a3]">{profile?.personalityResult?.mbtiType || '—'}</dd>
                </div>
                <div className="rounded-2xl bg-[#eaf3ec] p-4">
                  <dt className="text-xs font-bold text-[#4c765b]">Destek ağı</dt>
                  <dd className="mt-1 text-lg font-black text-[#24633b]">{profile?.familyMembers?.length || 0} kişi</dd>
                </div>
              </div>
            </dl>
            <Link href="/student/profile" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl font-extrabold text-[#4338ca] hover:underline">
              Profil ayrıntılarını gör
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>

        <section className="mt-12" aria-labelledby="quick-actions-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#4f46e5]">Hızlı erişim</p>
              <h2 id="quick-actions-title" className="mt-2 text-2xl font-black tracking-tight text-[#172033]">En sık kullandıkların</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="paper-card group flex min-h-32 items-start gap-4 rounded-3xl p-5 transition-transform hover:-translate-y-1">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eeecff] text-[#4f46e5]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-black text-[#172033]">{action.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-[#686f7d]">{action.description}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="weekly-focus-title">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#fff0ed] text-[#c44d3b]">
              <ClipboardCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#e05d48]">Bu hafta</p>
              <h2 id="weekly-focus-title" className="text-2xl font-black tracking-tight text-[#172033]">Haftalık odağın</h2>
            </div>
          </div>
          <WeeklyFocusWidget />
        </section>

        <section className="mt-12 border-t border-[#ded9cf] pt-10" aria-labelledby="all-tools-title">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#777e8b]">İhtiyacın olduğunda</p>
            <h2 id="all-tools-title" className="mt-2 text-2xl font-black tracking-tight text-[#172033]">Diğer araçlar</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-[#ded9cf] bg-white/75 p-5 hover:border-[#aaa2e9] hover:bg-white">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-[#4f46e5]" aria-hidden="true" />
                    <ArrowRight className="size-4 text-[#9ca3af] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-black text-[#172033]">{tool.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#686f7d]">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
