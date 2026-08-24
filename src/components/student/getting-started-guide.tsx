import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Check } from 'lucide-react';

export type GettingStartedStep = {
  title: string;
  description: string;
  href: string;
  completed: boolean;
  icon: LucideIcon;
};

export function GettingStartedGuide({ steps }: { steps: GettingStartedStep[] }) {
  const completedCount = steps.filter((step) => step.completed).length;
  const currentIndex = steps.findIndex((step) => !step.completed);
  const progress = Math.round((completedCount / steps.length) * 100);

  if (completedCount === steps.length) return null;

  return (
    <section className="paper-card mt-8 rounded-[28px] p-5 sm:p-7" aria-labelledby="getting-started-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-app-brand">Yeni başlayanlar için</p>
          <h2 id="getting-started-title" className="mt-1 text-2xl font-black tracking-tight text-app-text">Başlangıç rotan</h2>
          <p className="mt-1 text-sm text-app-muted">Her adım, sonraki önerileri biraz daha kişisel hale getirir.</p>
        </div>
        <p className="text-sm font-extrabold text-app-text">{completedCount}/{steps.length} tamamlandı</p>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-app-surface-muted" role="progressbar" aria-label="Başlangıç rotası ilerlemesi" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completedCount}>
        <div className="h-full rounded-full bg-app-brand transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      <ol className="mt-5 grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.href}>
              <Link
                href={step.href}
                aria-current={isCurrent ? 'step' : undefined}
                className={`group flex h-full min-h-36 flex-col rounded-2xl border p-4 ${isCurrent ? 'border-app-brand bg-app-brand-soft shadow-[inset_0_-3px_0_var(--primary)]' : 'border-app-border bg-app-surface hover:border-app-brand'}`}
              >
                <span className={`grid size-9 place-items-center rounded-xl ${step.completed ? 'bg-app-accent-soft text-app-accent' : isCurrent ? 'bg-app-brand text-white' : 'bg-app-surface-muted text-app-subtle'}`}>
                  {step.completed ? <Check className="size-5" aria-hidden="true" /> : <Icon className="size-5" aria-hidden="true" />}
                </span>
                <span className="mt-3 text-sm font-black text-app-text">{index + 1}. {step.title}</span>
                <span className="mt-1 text-xs leading-5 text-app-muted">{step.description}</span>
                {isCurrent && (
                  <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-extrabold text-app-brand-ink">
                    Buradan devam et <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
