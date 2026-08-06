'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  Compass,
  Crown,
  Flag,
  Flame,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  Lightbulb,
  LockKeyhole,
  Map,
  Medal,
  Play,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import styles from './lesson-path-design.module.css';
import { completeLessonStep } from '@/app/actions/lesson-path-actions';
import { useRouter } from 'next/navigation';

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).map((name) => styles[name as string]).join(' ');
}

type Step = { id: string; text: string; isCompleted: boolean };

export function LessonPathDesign({
  studentId,
  studentName,
  experiencePoints,
  level,
  streakDays,
  dailyXp,
  goals,
}: {
  studentId: string;
  studentName: string;
  experiencePoints: number;
  level: number;
  streakDays: number;
  dailyXp: number;
  goals: any[];
}) {
  const router = useRouter();
  const [lessonOpen, setLessonOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<{ goalId: string; step: Step; unitTitle: string } | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedScreen, setCompletedScreen] = useState<{ xpEarned: number } | null>(null);

  const firstName = studentName.trim().split(/\s+/)[0] || 'Öğrenci';
  const initial = firstName.charAt(0).toLocaleUpperCase('tr-TR');

  useEffect(() => {
    if (!lessonOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLesson();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [lessonOpen]);

  const closeLesson = () => {
    setLessonOpen(false);
    setActiveStep(null);
    setCompletedScreen(null);
  };

  const openLesson = (goalId: string, step: Step, unitTitle: string) => {
    setActiveStep({ goalId, step, unitTitle });
    setCompletedScreen(null);
    setLessonOpen(true);
  };

  const handleComplete = async () => {
    if (!activeStep || isCompleting) return;
    setIsCompleting(true);
    try {
      const res = await completeLessonStep(studentId, activeStep.goalId, activeStep.step.id, 30);
      if (res.success) {
        setCompletedScreen({ xpEarned: res.xpEarned || 30 });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompleting(false);
    }
  };

  // Parse goals into units
  const units = goals.map(g => {
    let steps: Step[] = [];
    try {
      steps = JSON.parse(g.planSteps);
    } catch (e) {}
    return { ...g, steps };
  }).filter(g => g.steps.length > 0);

  const totalSteps = units.reduce((acc, u) => acc + u.steps.length, 0);
  const completedStepsCount = units.reduce((acc, u) => acc + u.steps.filter((s: Step) => s.isCompleted).length, 0);
  const progressPercent = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  // Determine active unit (first one that is not fully completed)
  const activeUnitIndex = units.findIndex(u => !u.steps.every((s: Step) => s.isCompleted));
  
  return (
    <main className={cx('page-shell')}>
      <section className={cx('route-view')} aria-labelledby="lesson-route-title">
        <div className={cx('route-intro-card')}>
          <div className={cx('route-intro-copy')}>
            <div className={cx('route-kicker')}><Map size={15} /> Hedef Rotası</div>
            <h1 id="lesson-route-title">Kendini keşfet.<br /><em>Geleceğini adım adım kur.</em></h1>
            <p>Seçtiğin hedefler ve adımlar seni ideal kariyerine yaklaştırır.</p>
          </div>
          <div className={cx('route-progress-summary')}>
            <div className={cx('route-ring')}><div><strong>%{progressPercent}</strong><span>tamamlandı</span></div></div>
            <div className={cx('route-summary-copy')}>
              <span>TOPLAM İLERLEME</span>
              <strong>{completedStepsCount} / {totalSteps} Adım</strong>
            </div>
          </div>
          <div className={cx('route-intro-stars')} aria-hidden="true">✦</div>
        </div>

        <div className={cx('learning-layout')}>
          <div className={cx('path-container')} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {units.length === 0 && (
              <div className={cx('path-card')} style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                Henüz bir hedef rotası oluşturulmamış. Hedeflerim sayfasından hedef ekleyin.
              </div>
            )}
            
            {units.map((unit, uIdx) => {
              const isLocked = activeUnitIndex !== -1 && uIdx > activeUnitIndex;
              const isCompleted = uIdx < activeUnitIndex || (activeUnitIndex === -1 && units.length > 0);
              const isCurrent = uIdx === activeUnitIndex;

              const completedInUnit = unit.steps.filter((s: Step) => s.isCompleted).length;

              // Generate zigzag offsets
              const nodePositions = [0, 60, -40, 80, -20, 40, -60];
              const icons = [Compass, ShieldCheck, BrainCircuit, Flame, Lightbulb, Gift, GraduationCap];

              return (
                <div key={unit.id} className={cx('path-card')} style={{ opacity: isLocked ? 0.6 : 1 }}>
                  <header className={cx('unit-banner')} style={isLocked ? { filter: 'grayscale(100%)' } : {}}>
                    <div className={cx('unit-number')}><span>ÜNİTE</span><strong>{String(uIdx + 1).padStart(2, '0')}</strong></div>
                    <div><p>{unit.domain.toUpperCase()} HEDEFİ</p><h2>{unit.selectedGoal}</h2><span>{unit.wishText}</span></div>
                    <div className={cx('unit-score')}><Crown size={19} /><strong>{completedInUnit} / {unit.steps.length}</strong><span>adım</span></div>
                  </header>

                  <div className={cx('skill-path')} aria-label="Ders yolu" style={{ minHeight: `${Math.max(300, unit.steps.length * 130)}px` }}>
                    {unit.steps.map((step: Step, sIdx: number) => {
                      const nextStep = unit.steps[sIdx + 1];
                      const offset = nodePositions[sIdx % nodePositions.length];
                      const nextOffset = nextStep ? nodePositions[(sIdx + 1) % nodePositions.length] : 0;
                      
                      const dx = nextStep ? nextOffset - offset : 0;
                      const connectorLength = Math.sqrt(dx * dx + 128 * 128);
                      const connectorAngle = Math.atan2(128, dx) * 180 / Math.PI;
                      
                      const Icon = icons[sIdx % icons.length];
                      const variables = {
                        '--node-x': `${offset}px`,
                        '--link-length': `${connectorLength}px`,
                        '--link-angle': `${connectorAngle}deg`,
                      } as CSSProperties;

                      // Determine state
                      let state = 'locked';
                      if (isCompleted || step.isCompleted) {
                        state = 'done';
                      } else if (isCurrent) {
                        // find first uncompleted step
                        const firstUncompletedIdx = unit.steps.findIndex((s: Step) => !s.isCompleted);
                        if (sIdx === firstUncompletedIdx) state = 'active';
                        else if (sIdx === firstUncompletedIdx + 1) state = 'next';
                      }

                      return (
                        <div className={cx('lesson-stop', state)} style={variables} key={step.id}>
                          {nextStep && <span className={cx('lesson-connector')} aria-hidden="true" />}
                          <div className={cx('lesson-node-wrap')}>
                            {state === 'active' && (
                              <div className={cx('active-lesson-popover')}>
                                <span>SIRADAKİ ADIM</span>
                                <strong>{step.text.substring(0, 30)}...</strong>
                                <small>+30 XP</small>
                                <button type="button" onClick={() => openLesson(unit.id, step, unit.selectedGoal)}>İncele <Play size={13} fill="currentColor" /></button>
                              </div>
                            )}
                            <button
                              className={cx('lesson-node')}
                              type="button"
                              disabled={state === 'locked' || state === 'next'}
                              onClick={() => (state === 'active' || state === 'done') && openLesson(unit.id, step, unit.selectedGoal)}
                              aria-label={step.text}
                            >
                              {state === 'done' ? <Check size={28} strokeWidth={3.2} /> : <Icon size={27} />}
                              {state === 'active' && <span className={cx('lesson-pulse')} />}
                              {state === 'done' && <span className={cx('lesson-crown')}><Crown size={12} fill="currentColor" /></span>}
                            </button>
                            <strong className={cx('lesson-label')} style={{ maxWidth: '120px' }}>{step.text}</strong>
                            <small className={cx('lesson-reward')}>{state === 'done' ? 'Tamamlandı' : '+30 XP'}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className={cx('route-sidebar')} aria-label="Ders yolu ilerlemesi">
            <section className={cx('route-side-card', 'energy-card')}>
              <div className={cx('route-side-title')}><div><p className={cx('eyebrow')}>ÖĞRENME SERİN</p><h2>Ritmi koru!</h2></div><span className={cx('energy-flame')}><Flame size={22} fill="currentColor" /></span></div>
              <div className={cx('week-strip')}>
                {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((day, index) => (
                  <div className={cx(index < 5 ? 'checked' : index === 5 ? 'today' : null)} key={`${day}-${index}`}>
                    <span>{index < 5 ? <Check size={12} /> : day}</span><small>{index + 1}</small>
                  </div>
                ))}
              </div>
              <p><strong>{streakDays} günlük seri</strong> — Bugünkü dersi bitir ve serini sürdür.</p>
            </section>

            <section className={cx('route-side-card', 'league-card')}>
              <div className={cx('league-heading')}><span className={cx('league-gem')}><Gem size={20} /></span><div><p className={cx('eyebrow')}>KİŞİSEL SEVİYE</p><h2>Kristal Lig</h2></div><strong>#{level}</strong></div>
              <div className={cx('league-list')}>
                <div className={cx('me')}><b>1</b><span className={cx('tiny-avatar')}>{initial}</span><p>{firstName}</p><strong>{experiencePoints} XP</strong></div>
              </div>
              <div className={cx('league-safe')}><Medal size={14} /> Her adım rotanı biraz daha güçlendirir</div>
            </section>

            <section className={cx('route-side-card', 'daily-xp-card')}>
              <div className={cx('route-side-title')}><div><p className={cx('eyebrow')}>GÜNLÜK HEDEF</p><h2>30 XP kazan</h2></div><strong>{dailyXp} / 30</strong></div>
              <div className={cx('daily-xp-track')}><span style={{ width: `${Math.min(100, (dailyXp / 30) * 100)}%` }} /></div>
              <small>{dailyXp >= 30 ? 'Günlük hedef tamam!' : 'Bir ders daha ve hedef tamam!'}</small>
            </section>
          </aside>
        </div>
      </section>

      {lessonOpen && activeStep && (
        <div
          className={cx('lesson-overlay')}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lesson-title"
          onMouseDown={(event) => event.target === event.currentTarget && closeLesson()}
        >
          <div className={cx('lesson-modal')}>
            <div className={cx('lesson-modal-top')} style={{ gridTemplateColumns: '36px 1fr' }}>
              <button type="button" onClick={closeLesson} aria-label="Kapat"><X size={20} /></button>
              <div className={cx('lesson-modal-progress')}><span style={{ width: completedScreen ? '100%' : '50%' }} /></div>
            </div>

            {!completedScreen ? (
              <div className={cx('lesson-intro')}>
                <div className={cx('lesson-hero-icon')}><Compass size={38} fill="currentColor" /></div>
                <p className={cx('eyebrow')}>{activeStep.unitTitle}</p>
                <h2 id="lesson-title" style={{ fontSize: '20px' }}>{activeStep.step.text}</h2>
                <p style={{ marginTop: '12px' }}>Bu adımı tamamlamak için kurs platformundaki ilgili içeriğe göz atabilirsin. Tamamlandığında hedefine bir adım daha yaklaşacaksın.</p>
                
                <div className={cx('lesson-facts')}>
                  <span><Clock3 size={17} /><strong>Serbest</strong><small>Kendi hızında</small></span>
                  <span><Zap size={17} /><strong>+30 XP</strong><small>Ödül</small></span>
                  <span><Flag size={17} /><strong>1 Görev</strong><small>Hedefe ulaş</small></span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                  <button className={cx('lesson-main-button')} type="button" style={{ background: '#333' }} onClick={() => router.push('/student/courses')}>
                    Kursa Git <ArrowRight size={18} />
                  </button>
                  <button 
                    className={cx('lesson-main-button')} 
                    type="button" 
                    onClick={handleComplete}
                    disabled={isCompleting || activeStep.step.isCompleted}
                  >
                    {activeStep.step.isCompleted ? 'Zaten Tamamlandı' : isCompleting ? 'Kaydediliyor...' : 'Göşrevi Tamamla'} <Check size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={cx('lesson-complete')}>
                <div className={cx('complete-burst')}><Crown size={43} fill="currentColor" /></div>
                <p className={cx('eyebrow')}>ADIM TAMAMLANDI</p>
                <h2 id="lesson-title">Haritan şekilleniyor!</h2>
                <p>Bir hedefi daha geride bıraktın. Rotanda ilerlemeye devam et!</p>
                <div className={cx('xp-earned')}><Sparkles size={21} /><div><span>KAZANILAN</span><strong>+{completedScreen.xpEarned} XP</strong></div></div>
                <button className={cx('lesson-main-button')} type="button" onClick={closeLesson}>Ders yoluna dön <Check size={18} /></button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
