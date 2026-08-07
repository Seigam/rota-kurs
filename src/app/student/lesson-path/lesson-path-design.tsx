'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Clock3,
  Coins,
  ExternalLink,
  Flame,
  Gem,
  GraduationCap,
  HeartPulse,
  Map,
  Medal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import styles from './lesson-path-design.module.css';

export type LessonPathCourse = {
  id: string;
  title: string;
  provider: string;
  level: string | null;
  duration: string | null;
  url: string | null;
  description: string | null;
  counselorNote: string | null;
  status: 'APPROVED' | 'PENDING';
};

export type LessonPathUnit = {
  id: string;
  title: string;
  goalCount: number;
  courses: LessonPathCourse[];
};

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).map((name) => styles[name as string]).join(' ');
}

const DOMAIN_ICONS = {
  CAREER: BriefcaseBusiness,
  ACADEMIC: GraduationCap,
  PERSONAL_DEV: Sparkles,
  SOCIAL: Users,
  HEALTH: HeartPulse,
  FINANCIAL: Coins,
} as const;

const NODE_OFFSETS = [0, 58, -42, 72, -28, 46, -58];

export function LessonPathDesign({
  studentName,
  experiencePoints,
  level,
  streakDays,
  dailyXp,
  units,
}: {
  studentName: string;
  experiencePoints: number;
  level: number;
  streakDays: number;
  dailyXp: number;
  units: LessonPathUnit[];
}) {
  const [activeCourse, setActiveCourse] = useState<(LessonPathCourse & { unitTitle: string }) | null>(null);
  const firstName = studentName.trim().split(/\s+/)[0] || 'Öğrenci';
  const initial = firstName.charAt(0).toLocaleUpperCase('tr-TR');
  const totalCourses = units.reduce((total, unit) => total + unit.courses.length, 0);
  const approvedCourses = units.reduce(
    (total, unit) => total + unit.courses.filter((course) => course.status === 'APPROVED').length,
    0,
  );
  const pendingCourses = totalCourses - approvedCourses;
  const approvalPercent = totalCourses > 0 ? Math.round((approvedCourses / totalCourses) * 100) : 0;

  useEffect(() => {
    if (!activeCourse) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveCourse(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [activeCourse]);

  return (
    <main className={cx('page-shell')}>
      <section className={cx('route-view')} aria-labelledby="lesson-route-title">
        <div className={cx('route-intro-card')}>
          <div className={cx('route-intro-copy')}>
            <div className={cx('route-kicker')}><Map size={15} /> Kişisel ders rotan</div>
            <h1 id="lesson-route-title">Hedeflerine uygun dersler,<br /><em>tek bir rotada.</em></h1>
            <p>Seçtiğin hedef kategorileri için aldığın ve rehber onayında olan dersleri burada takip edebilirsin.</p>
          </div>
          <div className={cx('route-progress-summary')}>
            <div className={cx('route-ring')} style={{ '--progress': `${approvalPercent}%` } as CSSProperties}>
              <div><strong>{approvedCourses}</strong><span>onaylı ders</span></div>
            </div>
            <div className={cx('route-summary-copy')}>
              <span>DERS DURUMU</span>
              <strong>{totalCourses} ders rotada</strong>
              <small>{pendingCourses > 0 ? `${pendingCourses} ders rehber onayında` : 'Tüm dersler onaylandı'}</small>
            </div>
          </div>
          <div className={cx('route-intro-stars')} aria-hidden="true">✦</div>
        </div>

        <div className={cx('learning-layout')}>
          <div className={cx('path-container')}>
            {units.length === 0 ? (
              <div className={cx('empty-state')}>
                <span><BookOpen size={26} /></span>
                <h2>Ders rotan henüz boş</h2>
                <p>Önce bir hedef kategorisi belirle, ardından önerilen derslerden rotana ekle.</p>
                <a href="/student/goals">Hedef kategorisi oluştur <ArrowRight size={15} /></a>
              </div>
            ) : units.map((unit, unitIndex) => {
              const UnitIcon = DOMAIN_ICONS[unit.id as keyof typeof DOMAIN_ICONS] ?? BookOpen;
              const approvedInUnit = unit.courses.filter((course) => course.status === 'APPROVED').length;

              return (
                <article key={unit.id} className={cx('path-card')}>
                  <header className={cx('unit-banner')}>
                    <div className={cx('unit-number')}><span>ROTA</span><strong>{String(unitIndex + 1).padStart(2, '0')}</strong></div>
                    <div className={cx('unit-heading')}>
                      <p><UnitIcon size={13} /> HEDEF KATEGORİSİ</p>
                      <h2>{unit.title}</h2>
                      <span>{unit.goalCount > 0 ? `${unit.goalCount} hedef bu alanı besliyor` : 'Ders kategorisi'}</span>
                    </div>
                    <div className={cx('unit-score')}><Check size={18} /><strong>{approvedInUnit} / {unit.courses.length}</strong><span>onaylı</span></div>
                  </header>

                  {unit.courses.length === 0 ? (
                    <div className={cx('unit-empty')}>
                      <BookOpen size={22} />
                      <div><strong>Bu kategoriye henüz ders eklenmedi.</strong><span>Önerilerden bir ders seçerek rotanı başlatabilirsin.</span></div>
                      <a href="/student/programs">Dersleri incele <ArrowRight size={14} /></a>
                    </div>
                  ) : (
                    <div
                      className={cx('skill-path')}
                      aria-label={`${unit.title} ders yolu`}
                      style={{ minHeight: `${Math.max(250, unit.courses.length * 126 + 38)}px` }}
                    >
                      {unit.courses.map((course, courseIndex) => {
                        const nextCourse = unit.courses[courseIndex + 1];
                        const offset = NODE_OFFSETS[courseIndex % NODE_OFFSETS.length];
                        const nextOffset = nextCourse ? NODE_OFFSETS[(courseIndex + 1) % NODE_OFFSETS.length] : 0;
                        const dx = nextCourse ? nextOffset - offset : 0;
                        const connectorLength = Math.sqrt(dx * dx + 126 * 126);
                        const connectorAngle = Math.atan2(126, dx) * 180 / Math.PI;
                        const variables = {
                          '--node-x': `${offset}px`,
                          '--link-length': `${connectorLength}px`,
                          '--link-angle': `${connectorAngle}deg`,
                        } as CSSProperties;
                        const isApproved = course.status === 'APPROVED';

                        return (
                          <div className={cx('lesson-stop', isApproved ? 'approved' : 'pending')} style={variables} key={course.id}>
                            {nextCourse && <span className={cx('lesson-connector')} aria-hidden="true" />}
                            <div className={cx('lesson-node-wrap')}>
                              <button
                                className={cx('lesson-node')}
                                type="button"
                                onClick={() => setActiveCourse({ ...course, unitTitle: unit.title })}
                                aria-label={`${course.title} dersinin ayrıntılarını aç`}
                                title={course.title}
                              >
                                {isApproved ? <BookOpen size={27} /> : <Clock3 size={25} />}
                              </button>
                              <strong className={cx('lesson-label')}>{course.title}</strong>
                              <small className={cx('lesson-status')}>
                                {isApproved ? <><Check size={11} /> Rotana eklendi</> : <><Clock3 size={11} /> Onay bekliyor</>}
                              </small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <aside className={cx('route-sidebar')} aria-label="Ders rotası özeti">
            <section className={cx('route-side-card')}>
              <div className={cx('route-side-title')}><div><p className={cx('eyebrow')}>ÖĞRENME SERİN</p><h2>Ritmi koru</h2></div><span className={cx('energy-flame')}><Flame size={22} fill="currentColor" /></span></div>
              <p className={cx('side-description')}><strong>{streakDays} günlük seri.</strong> Rotandaki bir derse bugün yeniden uğra.</p>
            </section>

            <section className={cx('route-side-card')}>
              <div className={cx('league-heading')}><span className={cx('league-gem')}><Gem size={20} /></span><div><p className={cx('eyebrow')}>KİŞİSEL SEVİYE</p><h2>Seviye {level}</h2></div></div>
              <div className={cx('student-row')}><span className={cx('tiny-avatar')}>{initial}</span><p>{firstName}</p><strong>{experiencePoints} XP</strong></div>
              <div className={cx('league-safe')}><Medal size={14} /> Derslerin hedef alanlarına göre gruplanır</div>
            </section>

            <section className={cx('route-side-card')}>
              <div className={cx('route-side-title')}><div><p className={cx('eyebrow')}>GÜNLÜK HEDEF</p><h2>30 XP kazan</h2></div><strong className={cx('xp-count')}>{dailyXp} / 30</strong></div>
              <div className={cx('daily-xp-track')}><span style={{ width: `${Math.min(100, (dailyXp / 30) * 100)}%` }} /></div>
              <small className={cx('muted-copy')}>{dailyXp >= 30 ? 'Günlük hedef tamamlandı.' : 'Bugün biraz daha ilerleyebilirsin.'}</small>
            </section>
          </aside>
        </div>
      </section>

      {activeCourse && (
        <div
          className={cx('lesson-overlay')}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lesson-title"
          onMouseDown={(event) => event.target === event.currentTarget && setActiveCourse(null)}
        >
          <div className={cx('lesson-modal')}>
            <div className={cx('lesson-modal-top')}>
              <span className={cx('modal-kicker')}><BookOpen size={15} /> {activeCourse.unitTitle}</span>
              <button type="button" onClick={() => setActiveCourse(null)} aria-label="Ders ayrıntılarını kapat"><X size={20} /></button>
            </div>
            <div className={cx('lesson-intro')}>
              <span className={cx('course-state', activeCourse.status === 'APPROVED' ? 'approved-state' : 'pending-state')}>
                {activeCourse.status === 'APPROVED' ? <><Check size={14} /> Rotana eklendi</> : <><Clock3 size={14} /> Rehber onayı bekliyor</>}
              </span>
              <h2 id="lesson-title">{activeCourse.title}</h2>
              {activeCourse.description && <p>{activeCourse.description}</p>}
              <dl className={cx('lesson-facts')}>
                <div><dt>Kurum</dt><dd>{activeCourse.provider}</dd></div>
                <div><dt>Seviye</dt><dd>{activeCourse.level || 'Belirtilmedi'}</dd></div>
                <div><dt>Süre</dt><dd>{activeCourse.duration || 'Kendi hızında'}</dd></div>
              </dl>
              {activeCourse.counselorNote && (
                <div className={cx('counselor-note')}><strong>Rehber notu</strong><p>{activeCourse.counselorNote}</p></div>
              )}
              <div className={cx('modal-actions')}>
                <button type="button" className={cx('secondary-button')} onClick={() => setActiveCourse(null)}>Rotaya dön</button>
                {activeCourse.url && activeCourse.status === 'APPROVED' && (
                  <a
                    className={cx('primary-button')}
                    href={activeCourse.url}
                    target={activeCourse.url.startsWith('http') ? '_blank' : undefined}
                    rel={activeCourse.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    Derse git {activeCourse.url.startsWith('http') ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
