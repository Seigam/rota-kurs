export const GOAL_TIME_HORIZON_VALUES = ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'] as const;

export type GoalTimeHorizonValue = (typeof GOAL_TIME_HORIZON_VALUES)[number];

export const GOAL_TIME_HORIZONS: ReadonlyArray<{
  value: GoalTimeHorizonValue;
  label: string;
  rangeLabel: string;
  description: string;
}> = [
  {
    value: 'SHORT_TERM',
    label: 'Kısa vade',
    rangeLabel: '1–4 hafta',
    description: 'Hızlı başlayıp yakın zamanda ölçülebilecek hedefler.',
  },
  {
    value: 'MEDIUM_TERM',
    label: 'Orta vade',
    rangeLabel: '1–6 ay',
    description: 'Bir dönem içinde düzenli çalışmayla tamamlanacak hedefler.',
  },
  {
    value: 'LONG_TERM',
    label: 'Uzun vade',
    rangeLabel: '6–24 ay',
    description: 'Birden fazla aşamaya bölünmesi gereken gelişim hedefleri.',
  },
];

export function getGoalTimeHorizon(value: GoalTimeHorizonValue) {
  return GOAL_TIME_HORIZONS.find((option) => option.value === value) ?? GOAL_TIME_HORIZONS[1];
}

