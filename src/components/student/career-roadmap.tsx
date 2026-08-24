import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CircleDot,
  Compass,
  Flag,
  GraduationCap,
  Heart,
  LockKeyhole,
  Map,
  Rocket,
  Sparkles,
  Star,
  Target,
  Telescope,
  Trophy,
  CalendarDays,
} from 'lucide-react';
import styles from './career-roadmap.module.css';

type RoadmapStatus = 'COMPLETED' | 'CURRENT' | 'UPCOMING';

export interface RoadmapSnapshot {
  studentName: string;
  grade: number | null;
  targetCareer: string | null;
  mbtiType: string | null;
  experiencePoints: number;
  level: number;
  goalsCount: number;
  completedGoalsCount: number;
  completedStepsCount: number;
  totalStepsCount: number;
  valuesCount: number;
  favoritesCount: number;
  profileCompleted: boolean;
  personalityCompleted: boolean;
  nextGoalTitle: string | null;
  nextStepText: string | null;
}

type RoadmapTask = {
  label: string;
  isComplete: boolean;
  href: string;
  action: string;
};

type RoadmapStage = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  color: 'indigo' | 'violet' | 'emerald' | 'amber';
  icon: typeof Compass;
  tasks: RoadmapTask[];
  reward: string;
};

const statusContent: Record<RoadmapStatus, { label: string; icon: typeof CheckCircle2 }> = {
  COMPLETED: { label: 'Tamamlandı', icon: CheckCircle2 },
  CURRENT: { label: 'Şimdi buradasın', icon: CircleDot },
  UPCOMING: { label: 'Sırada', icon: LockKeyhole },
};

function getStageStatus(isComplete: boolean, isCurrent: boolean): RoadmapStatus {
  if (isComplete) return 'COMPLETED';
  if (isCurrent) return 'CURRENT';
  return 'UPCOMING';
}

function getGreetingName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || 'Gezgin';
}

export function CareerRoadmap({ snapshot }: { snapshot: RoadmapSnapshot }) {
  const hasCareerDirection = Boolean(snapshot.targetCareer);
  const hasActionPlan = snapshot.goalsCount > 0;
  const hasMomentum = snapshot.completedStepsCount > 0;
  const hasValues = snapshot.valuesCount > 0;
  const hasSavedProgram = snapshot.favoritesCount > 0;

  const stageCompletions = [
    snapshot.profileCompleted && snapshot.personalityCompleted,
    hasCareerDirection && hasValues,
    hasActionPlan && hasMomentum,
    snapshot.completedGoalsCount > 0 && hasSavedProgram,
  ];
  const currentStageIndex = stageCompletions.findIndex((isComplete) => !isComplete);

  const stages: RoadmapStage[] = [
    {
      number: '01',
      eyebrow: 'Başlangıç · Kendini tanı',
      title: 'Pusulanı ayarla',
      description:
        'Güçlü yönlerini, öğrenme biçimini ve seni harekete geçiren değerleri görünür kıl.',
      status: getStageStatus(stageCompletions[0], currentStageIndex === 0),
      color: 'indigo',
      icon: Compass,
      reward: '+150 XP · Kâşif rozeti',
      tasks: [
        {
          label: 'Kişisel ve akademik profilini tamamla',
          isComplete: snapshot.profileCompleted,
          href: '/student/profile',
          action: 'Profili aç',
        },
        {
          label: 'Rehberlik envanterini tamamla',
          isComplete: snapshot.personalityCompleted,
          href: '/rpg/test',
          action: 'Envantere git',
        },
      ],
    },
    {
      number: '02',
      eyebrow: 'Yön · Rotanı netleştir',
      title: 'Kuzey yıldızını seç',
      description:
        'Hedef mesleğini değerlerinle eşleştir; kararlarını taşıyacak kişisel ölçütlerini belirle.',
      status: getStageStatus(stageCompletions[1], currentStageIndex === 1),
      color: 'violet',
      icon: Telescope,
      reward: '+200 XP · Rota kurucu rozeti',
      tasks: [
        {
          label: 'Hedef kariyer alanını belirle',
          isComplete: hasCareerDirection,
          href: '/student/profile',
          action: 'Hedefini yaz',
        },
        {
          label: 'Öncelikli yaşam ve kariyer değerlerini sırala',
          isComplete: hasValues,
          href: '/student/values',
          action: 'Değerleri sırala',
        },
      ],
    },
    {
      number: '03',
      eyebrow: 'İvme · Bu dönem',
      title: 'Rotayı eyleme çevir',
      description:
        'Büyük hedefini ölçülebilir adımlara böl ve her hafta küçük ama görünür bir ilerleme üret.',
      status: getStageStatus(stageCompletions[2], currentStageIndex === 2),
      color: 'emerald',
      icon: Rocket,
      reward: '+300 XP · İvme rozeti',
      tasks: [
        {
          label: 'En az bir SMART hedef ve eylem planı oluştur',
          isComplete: hasActionPlan,
          href: '/student/domains',
          action: 'Plan oluştur',
        },
        {
          label: 'İlk plan adımını tamamla',
          isComplete: hasMomentum,
          href: '/student/goals',
          action: 'Görevlere git',
        },
      ],
    },
    {
      number: '04',
      eyebrow: 'Varış · Geleceğe hazırlan',
      title: 'Bir sonraki kapıyı aç',
      description:
        'İlerlemeni kanıta dönüştür; sana uyan programları kaydet ve tamamladığın bir hedefi vitrinin yap.',
      status: getStageStatus(stageCompletions[3], currentStageIndex === 3),
      color: 'amber',
      icon: Trophy,
      reward: '+500 XP · Gelecek hazır rozeti',
      tasks: [
        {
          label: 'Bir hedef rotasını tamamen bitir',
          isComplete: snapshot.completedGoalsCount > 0,
          href: '/student/goals',
          action: 'İlerlemeyi aç',
        },
        {
          label: 'Sana uygun bir programı favorilerine ekle',
          isComplete: hasSavedProgram,
          href: '/student/programs',
          action: 'Program keşfet',
        },
      ],
    },
  ];

  const allTasks = stages.flatMap((stage) => stage.tasks);
  const completedTaskCount = allTasks.filter((task) => task.isComplete).length;
  const roadmapProgress = Math.round((completedTaskCount / allTasks.length) * 100);
  const safeCurrentIndex = currentStageIndex === -1 ? stages.length - 1 : currentStageIndex;
  const currentStage = stages[safeCurrentIndex];
  const nextTask =
    currentStage.tasks.find((task) => !task.isComplete) ??
    stages.flatMap((stage) => stage.tasks).find((task) => !task.isComplete);
  const weeklyProgress =
    snapshot.totalStepsCount > 0
      ? Math.round((snapshot.completedStepsCount / snapshot.totalStepsCount) * 100)
      : 0;

  return (
    <div className={`${styles.roadmapShell} roadmap-theme min-h-full`}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.gridTexture} aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link
            href="/student/dashboard"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-bold text-slate-300 transition hover:border-indigo-400/40 hover:bg-indigo-400/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            <Map className="h-4 w-4 text-indigo-300 transition-transform group-hover:-rotate-6" />
            Öğrenci paneli
          </Link>
          <div className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:flex">
            <span className={styles.liveDot} />
            Yol haritan canlı verilerle güncelleniyor
          </div>
        </div>

        <header className={`${styles.hero} overflow-hidden rounded-[32px] border border-white/10`}>
          <div className="relative z-10 grid gap-10 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-12">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Kişisel gelecek rotan
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {snapshot.grade ? `${snapshot.grade}. sınıf` : 'Lise yolculuğu'}
                </span>
              </div>

              <p className="mb-2 text-sm font-semibold text-emerald-300">
                Hazırsan devam edelim, {getGreetingName(snapshot.studentName)}.
              </p>
              <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Geleceğin bir çizgi değil,
                <span className={styles.heroGradient}> keşfederek kurduğun bir rota.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Kendini tanımaktan ilk başvuruna kadar bütün adımların burada.
                Her durak, bir sonraki kararını daha net ve daha uygulanabilir hale getirir.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {nextTask ? (
                  <Link
                    href={nextTask.href}
                    className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-white px-5 text-sm font-black text-slate-950 shadow-[0_14px_35px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                  >
                    Sıradaki adıma başla
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <Link
                    href="/student/programs"
                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-white px-5 text-sm font-black text-slate-950"
                  >
                    Yeni bir rota keşfet
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <a
                  href="#rota"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  Rotanın tamamını gör
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div
                className={styles.progressOrbit}
                style={{ '--roadmap-progress': `${roadmapProgress * 3.6}deg` } as React.CSSProperties}
                aria-label={`Yol haritasının yüzde ${roadmapProgress} kadarı tamamlandı`}
              >
                <div className={styles.progressCore}>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Rota ilerlemesi
                  </span>
                  <strong className="mt-1 text-5xl font-black tracking-[-0.06em] text-white">
                    %{roadmapProgress}
                  </strong>
                  <span className="mt-1 text-xs font-semibold text-emerald-300">
                    {completedTaskCount}/{allTasks.length} durak
                  </span>
                </div>
                <Star className={`${styles.orbitStar} h-5 w-5 text-amber-300`} aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="relative z-10 grid border-t border-white/10 bg-black/20 sm:grid-cols-3">
            <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4 sm:border-b-0 sm:border-r">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-400/10 text-indigo-300">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Hedef yön
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-white">
                  {snapshot.targetCareer || 'Henüz belirlenmedi'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4 sm:border-b-0 sm:border-r">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Öğrenme profili
                </p>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {snapshot.mbtiType || 'Keşfedilmeyi bekliyor'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Rota seviyesi
                </p>
                <p className="mt-0.5 text-sm font-bold text-white">
                  Seviye {snapshot.level} · {snapshot.experiencePoints} XP
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section id="rota" className="scroll-mt-24" aria-labelledby="roadmap-stages-title">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300">
                  Rota günlüğü
                </p>
                <h2 id="roadmap-stages-title" className="mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                  Dört durakta geleceğe hazırlan
                </h2>
              </div>
              <span className="hidden text-xs font-semibold text-slate-500 sm:block">
                Duraklar sırayla açılır
              </span>
            </div>

            <ol className={styles.routeList}>
              {stages.map((stage, index) => {
                const StageIcon = stage.icon;
                const StatusIcon = statusContent[stage.status].icon;

                return (
                  <li
                    key={stage.number}
                    className={`${styles.routeItem} ${styles[`routeItem_${stage.color}`]} ${styles[`routeItem_${stage.status.toLowerCase()}`]}`}
                    style={{ '--stage-delay': `${index * 90}ms` } as React.CSSProperties}
                  >
                    <div className={styles.routeMarker} aria-hidden="true">
                      <span>{stage.number}</span>
                    </div>

                    <article className={styles.stageCard}>
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                          <div className={styles.stageIcon}>
                            <StageIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                              {stage.eyebrow}
                            </p>
                            <h3 className="mt-1.5 text-xl font-black tracking-[-0.025em] text-white sm:text-2xl">
                              {stage.title}
                            </h3>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                              {stage.description}
                            </p>
                          </div>
                        </div>
                        <span className={styles.statusPill}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusContent[stage.status].label}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-3">
                        {stage.tasks.map((task) => (
                          <Link
                            key={task.label}
                            href={task.href}
                            className={`${styles.taskRow} group ${task.isComplete ? styles.taskRowComplete : ''}`}
                          >
                            <span className={styles.taskCheck}>
                              {task.isComplete ? (
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-semibold">
                              {task.label}
                            </span>
                            <span className="hidden items-center gap-1 text-[11px] font-bold text-slate-500 transition-colors group-hover:text-white sm:flex">
                              {task.isComplete ? 'İncele' : task.action}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </Link>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                        <span className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          <Trophy className="h-3.5 w-3.5 text-amber-300/80" />
                          {stage.reward}
                        </span>
                        <span className="font-mono text-[10px] text-slate-600">
                          {stage.tasks.filter((task) => task.isComplete).length}/{stage.tasks.length}
                        </span>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>

            <div className={styles.finishLine}>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-300 text-slate-950 shadow-[0_0_30px_rgba(110,231,183,0.24)]">
                <Flag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Burası bitiş değil, yeni başlangıç.</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Rotanı tamamladığında yeni hedeflerin için yeniden şekillenir.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-24" aria-label="Yol haritası özeti">
            <section className={`${styles.planCard} rounded-[28px] p-6 text-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 mx-auto mb-4 relative z-10">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-black text-white relative z-10">Takvim & Planlama</h2>
              <p className="mt-2 text-xs leading-5 text-slate-400 mb-5 relative z-10">
                Takvim üzerinde eylemlerini planla, adımlarını takip et ve hedeflerine ulaş.
              </p>
              <Link
                href="/student/goals"
                className="group flex min-h-12 w-full items-center justify-between rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 relative z-10"
              >
                Planlamaya Geç
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/20 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </section>

            <section className={`${styles.focusCard} rounded-[28px] p-6`}>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  <span className={styles.liveDot} />
                  Bu haftanın pusulası
                </span>
                <Target className="h-5 w-5 text-emerald-300" />
              </div>

              <p className="mt-7 text-xs font-semibold text-slate-500">AKTİF ODAK</p>
              <h2 className="mt-2 text-xl font-black leading-tight text-white">
                {snapshot.nextGoalTitle || currentStage.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {snapshot.nextStepText ||
                  nextTask?.label ||
                  'Yeni bir hedef seçerek bir sonraki rotanı başlat.'}
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Plan adımları</span>
                  <span className="text-emerald-300">%{weeklyProgress}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/40">
                  <div
                    className={styles.focusProgress}
                    style={{ width: `${weeklyProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  {snapshot.completedStepsCount} / {snapshot.totalStepsCount || 0} adım tamamlandı
                </p>
              </div>

              <Link
                href={snapshot.nextStepText ? '/student/goals' : nextTask?.href || '/student/domains'}
                className="group mt-6 flex min-h-12 w-full items-center justify-between rounded-2xl bg-emerald-300 px-4 text-sm font-black text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Odağa devam et
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950/10 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
                    Rota sinyalleri
                  </p>
                  <h2 className="mt-1.5 text-lg font-black text-white">Hazırlık göstergeleri</h2>
                </div>
                <BookOpenCheck className="h-5 w-5 text-violet-300" />
              </div>

              <div className="mt-6 space-y-5">
                <Signal
                  icon={Heart}
                  label="Kendini tanıma"
                  value={[snapshot.profileCompleted, snapshot.personalityCompleted, hasValues].filter(Boolean).length}
                  total={3}
                  color="indigo"
                />
                <Signal
                  icon={BriefcaseBusiness}
                  label="Kariyer netliği"
                  value={[hasCareerDirection, hasSavedProgram].filter(Boolean).length}
                  total={2}
                  color="violet"
                />
                <Signal
                  icon={Rocket}
                  label="Eylem ivmesi"
                  value={[hasActionPlan, hasMomentum, snapshot.completedGoalsCount > 0].filter(Boolean).length}
                  total={3}
                  color="emerald"
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-amber-300/15 bg-gradient-to-br from-amber-300/[0.09] to-transparent p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-300/15 text-amber-200">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
                    Mini hatırlatma
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                    İyi bir rota kusursuz değil, düzenli güncellenen rotadır.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Signal({
  icon: Icon,
  label,
  value,
  total,
  color,
}: {
  icon: typeof Heart;
  label: string;
  value: number;
  total: number;
  color: 'indigo' | 'violet' | 'emerald';
}) {
  const percent = Math.round((value / total) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-300">
          <Icon className={`h-3.5 w-3.5 ${styles[`signal_${color}`]}`} />
          {label}
        </span>
        <span className="font-mono text-[10px] text-slate-500">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`${styles.signalBar} ${styles[`signalBar_${color}`]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
