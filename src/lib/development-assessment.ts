import {
  CatalogFitBand,
  DevelopmentArea,
  DevelopmentConfidence,
  LifeDomain,
  type CatalogItem,
} from '@prisma/client';

export const DEVELOPMENT_QUESTIONNAIRE_VERSION = 'development-pulse-v1';
export const DEVELOPMENT_SCORING_VERSION = 'development-priority-v1';

export type DevelopmentQuestion = {
  key: string;
  area: DevelopmentArea;
  domain: LifeDomain;
  prompt: string;
  helper: string;
  isFollowUp: boolean;
};

export type DevelopmentResponseInput = {
  questionKey: string;
  area: DevelopmentArea;
  domain: LifeDomain;
  statusScore: number | null;
  importanceScore: number | null;
  uncertain: boolean;
  isFollowUp: boolean;
};

export function isDevelopmentResponseAnswered(
  response: Pick<DevelopmentResponseInput, 'statusScore' | 'importanceScore' | 'uncertain'> | null | undefined,
): boolean {
  return Boolean(
    response
    && (response.uncertain || (response.statusScore !== null && response.importanceScore !== null)),
  );
}

export const DEVELOPMENT_AREAS = [
  {
    key: DevelopmentArea.LEARNING_FUTURE,
    label: 'Öğrenme ve Gelecek',
    shortLabel: 'Gelecek',
    description: 'Okul, kariyer, beceriler ve geleceğe hazırlanma biçimin.',
    accent: 'indigo',
  },
  {
    key: DevelopmentArea.SELF_DEVELOPMENT_WELLBEING,
    label: 'Kendini Geliştirme ve İyi Yaşam',
    shortLabel: 'İyi yaşam',
    description: 'Enerjin, alışkanlıkların, öz güvenin ve kendini yönetme becerilerin.',
    accent: 'coral',
  },
  {
    key: DevelopmentArea.RELATIONSHIPS_PARTICIPATION,
    label: 'İlişkiler ve Katılım',
    shortLabel: 'İlişkiler',
    description: 'İletişim, destek ağı, birlikte üretme ve topluma katılım biçimin.',
    accent: 'sage',
  },
] as const;

export const BASELINE_QUESTIONS: DevelopmentQuestion[] = [
  { key: 'learning-study-routine', area: DevelopmentArea.LEARNING_FUTURE, domain: LifeDomain.ACADEMIC, prompt: 'Ders çalışma düzenimi sürdürebiliyorum.', helper: 'Planlama, odaklanma ve başladığın işi tamamlama durumunu düşün.', isFollowUp: false },
  { key: 'learning-academic-direction', area: DevelopmentArea.LEARNING_FUTURE, domain: LifeDomain.ACADEMIC, prompt: 'Akademik olarak hangi yönde ilerlemek istediğimi biliyorum.', helper: 'Ders, alan veya sınav hedeflerinin ne kadar net olduğunu düşün.', isFollowUp: false },
  { key: 'learning-career-direction', area: DevelopmentArea.LEARNING_FUTURE, domain: LifeDomain.CAREER, prompt: 'İlgimi çeken meslekleri ve çalışma alanlarını tanıyorum.', helper: 'Tek bir meslek seçmiş olman gerekmez; seçeneklerini tanıman yeterli.', isFollowUp: false },
  { key: 'learning-financial-awareness', area: DevelopmentArea.LEARNING_FUTURE, domain: LifeDomain.FINANCIAL, prompt: 'Eğitim ve kariyer kararlarının maddi yönlerini araştırabiliyorum.', helper: 'Burs, eğitim maliyeti, bütçe ve fırsatları karşılaştırmayı düşün.', isFollowUp: false },

  { key: 'wellbeing-energy', area: DevelopmentArea.SELF_DEVELOPMENT_WELLBEING, domain: LifeDomain.HEALTH, prompt: 'Günlük enerjimi destekleyen bir uyku ve yaşam düzenim var.', helper: 'Tıbbi bir değerlendirme değil; günlük deneyimini düşün.', isFollowUp: false },
  { key: 'wellbeing-balance', area: DevelopmentArea.SELF_DEVELOPMENT_WELLBEING, domain: LifeDomain.HEALTH, prompt: 'Zorlandığımda dengemi yeniden kurabilecek yöntemler kullanabiliyorum.', helper: 'Mola verme, destek isteme ve duygularını fark etme gibi yöntemleri düşün.', isFollowUp: false },
  { key: 'wellbeing-confidence', area: DevelopmentArea.SELF_DEVELOPMENT_WELLBEING, domain: LifeDomain.PERSONAL_DEV, prompt: 'Yeni bir şeyi öğrenebileceğime ve gelişebileceğime inanıyorum.', helper: 'Hata yaptıktan sonra yeniden deneme isteğini düşün.', isFollowUp: false },
  { key: 'wellbeing-self-management', area: DevelopmentArea.SELF_DEVELOPMENT_WELLBEING, domain: LifeDomain.PERSONAL_DEV, prompt: 'Zamanımı ve alışkanlıklarımı hedeflerime göre yönetebiliyorum.', helper: 'Küçük rutinler kurma ve dikkat dağıtıcıları yönetme durumunu düşün.', isFollowUp: false },

  { key: 'relationships-support', area: DevelopmentArea.RELATIONSHIPS_PARTICIPATION, domain: LifeDomain.SOCIAL, prompt: 'İhtiyaç duyduğumda destek isteyebileceğim kişiler var.', helper: 'Aile, arkadaş, öğretmen veya güvendiğin bir yetişkini düşün.', isFollowUp: false },
  { key: 'relationships-communication', area: DevelopmentArea.RELATIONSHIPS_PARTICIPATION, domain: LifeDomain.SOCIAL, prompt: 'Düşüncelerimi saygılı ve anlaşılır biçimde ifade edebiliyorum.', helper: 'Dinleme, kendini anlatma ve anlaşmazlık çözme durumlarını düşün.', isFollowUp: false },
  { key: 'relationships-empathy', area: DevelopmentArea.RELATIONSHIPS_PARTICIPATION, domain: LifeDomain.SOCIAL, prompt: 'Farklı bakış açılarını anlamaya çalışıyorum.', helper: 'Aynı fikirde olmasan da karşı tarafı dinleyebilmeni düşün.', isFollowUp: false },
  { key: 'relationships-participation', area: DevelopmentArea.RELATIONSHIPS_PARTICIPATION, domain: LifeDomain.SOCIAL, prompt: 'Bir grup, kulüp veya topluluk içinde katkı sunabiliyorum.', helper: 'Okul kulübü, ekip çalışması, gönüllülük veya ortak projeleri düşün.', isFollowUp: false },
];

export const MONTHLY_QUESTIONS: DevelopmentQuestion[] = DEVELOPMENT_AREAS.map((area) => ({
  key: `monthly-${area.key.toLocaleLowerCase('en-US')}`,
  area: area.key,
  domain: area.key === DevelopmentArea.LEARNING_FUTURE
    ? LifeDomain.ACADEMIC
    : area.key === DevelopmentArea.SELF_DEVELOPMENT_WELLBEING
      ? LifeDomain.PERSONAL_DEV
      : LifeDomain.SOCIAL,
  prompt: `${area.label} alanında bu ay nasıl gidiyor?`,
  helper: area.description,
  isFollowUp: false,
}));

export const FOLLOW_UP_QUESTIONS: DevelopmentQuestion[] = [
  { key: 'follow-learning-next-step', area: DevelopmentArea.LEARNING_FUTURE, domain: LifeDomain.CAREER, prompt: 'Geleceğim için atabileceğim bir sonraki küçük adımı biliyorum.', helper: 'Araştırma, deneme veya biriyle konuşma gibi küçük bir adım olabilir.', isFollowUp: true },
  { key: 'follow-learning-resource', area: DevelopmentArea.LEARNING_FUTURE, domain: LifeDomain.ACADEMIC, prompt: 'İlerlemek için hangi kaynağa veya desteğe ihtiyacım olduğunu biliyorum.', helper: 'Ders kaynağı, öğretmen desteği veya çalışma ortamını düşün.', isFollowUp: true },
  { key: 'follow-wellbeing-recovery', area: DevelopmentArea.SELF_DEVELOPMENT_WELLBEING, domain: LifeDomain.HEALTH, prompt: 'Yoğun bir günün ardından kendimi toparlayabiliyorum.', helper: 'Dinlenme, hareket, uyku ve destek isteme alışkanlıklarını düşün.', isFollowUp: true },
  { key: 'follow-wellbeing-small-habit', area: DevelopmentArea.SELF_DEVELOPMENT_WELLBEING, domain: LifeDomain.PERSONAL_DEV, prompt: 'Küçük bir alışkanlığı en az iki hafta sürdürebiliyorum.', helper: 'Mükemmel olmayı değil, yeniden başlayabilmeyi düşün.', isFollowUp: true },
  { key: 'follow-relationships-boundaries', area: DevelopmentArea.RELATIONSHIPS_PARTICIPATION, domain: LifeDomain.SOCIAL, prompt: 'İlişkilerimde ihtiyaçlarımı ve sınırlarımı ifade edebiliyorum.', helper: 'Saygılı biçimde hayır diyebilme ve yardım isteyebilmeyi düşün.', isFollowUp: true },
  { key: 'follow-relationships-contribution', area: DevelopmentArea.RELATIONSHIPS_PARTICIPATION, domain: LifeDomain.SOCIAL, prompt: 'Birlikte yapılan işlerde sorumluluk alıp katkımı tamamlayabiliyorum.', helper: 'Ekip çalışması ve ortak sorumlulukları düşün.', isFollowUp: true },
];

export function getAreaLabel(area: DevelopmentArea): string {
  return DEVELOPMENT_AREAS.find((item) => item.key === area)?.label ?? area;
}

export function getQuestionByKey(key: string): DevelopmentQuestion | undefined {
  return [...BASELINE_QUESTIONS, ...MONTHLY_QUESTIONS, ...FOLLOW_UP_QUESTIONS].find((question) => question.key === key);
}

export function getEnabledFollowUps(responses: DevelopmentResponseInput[]): DevelopmentQuestion[] {
  const enabledAreas = new Set<DevelopmentArea>();
  for (const area of DEVELOPMENT_AREAS) {
    const areaResponses = responses.filter((response) => response.area === area.key && !response.isFollowUp);
    const scored = areaResponses.filter((response) => !response.uncertain && response.statusScore !== null && response.importanceScore !== null);
    const statuses = scored.map((response) => response.statusScore as number);
    const hasPriorityNeed = scored.some((response) => (response.importanceScore as number) >= 4 && (response.statusScore as number) <= 3);
    const hasUncertainty = areaResponses.some((response) => response.uncertain);
    const hasSpread = statuses.length >= 2 && Math.max(...statuses) - Math.min(...statuses) >= 2;
    if (hasPriorityNeed || hasUncertainty || hasSpread) enabledAreas.add(area.key);
  }
  return FOLLOW_UP_QUESTIONS.filter((question) => enabledAreas.has(question.area)).slice(0, 8);
}

export type CalculatedAreaScore = {
  area: DevelopmentArea;
  statusAverage: number;
  importanceAverage: number;
  priorityScore: number;
  confidence: DevelopmentConfidence;
  rank: number;
  dominantDomain: LifeDomain;
};

function responsePriority(response: DevelopmentResponseInput): number {
  if (response.uncertain || response.statusScore === null || response.importanceScore === null) return 0;
  const need = (5 - response.statusScore) / 4;
  const importance = (response.importanceScore - 1) / 4;
  return Math.round(100 * (0.65 * importance + 0.35 * need));
}

export function calculateAreaScores(responses: DevelopmentResponseInput[]): CalculatedAreaScore[] {
  const raw = DEVELOPMENT_AREAS.map((area) => {
    const areaResponses = responses.filter((response) => response.area === area.key);
    const scored = areaResponses.filter((response) => !response.uncertain && response.statusScore !== null && response.importanceScore !== null);
    const statusAverage = scored.length ? scored.reduce((sum, response) => sum + (response.statusScore as number), 0) / scored.length : 0;
    const importanceAverage = scored.length ? scored.reduce((sum, response) => sum + (response.importanceScore as number), 0) / scored.length : 0;
    const priorities = scored.map((response) => ({ response, score: responsePriority(response) })).sort((a, b) => b.score - a.score);
    const topPriorities = priorities.slice(0, 3);
    const priorityScore = topPriorities.length ? Math.round(topPriorities.reduce((sum, item) => sum + item.score, 0) / topPriorities.length) : 0;
    const hasUncertain = areaResponses.some((response) => response.uncertain);
    const confidence = hasUncertain || scored.length < 2
      ? DevelopmentConfidence.LOW
      : scored.length >= 3
        ? DevelopmentConfidence.HIGH
        : DevelopmentConfidence.MEDIUM;
    return {
      area: area.key,
      statusAverage: Number(statusAverage.toFixed(2)),
      importanceAverage: Number(importanceAverage.toFixed(2)),
      priorityScore,
      confidence,
      dominantDomain: priorities[0]?.response.domain ?? LifeDomain.PERSONAL_DEV,
      rank: 0,
    };
  });
  return raw.sort((a, b) => b.priorityScore - a.priorityScore).map((item, index) => ({ ...item, rank: index + 1 }));
}

export type CatalogRecommendationContext = {
  areaScores: CalculatedAreaScore[];
  riasecTopCodes: string[];
  interestTags: string[];
  goalDomains: LifeDomain[];
  valueTags: string[];
};

function stringArray(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

const AREA_DOMAINS: Record<DevelopmentArea, LifeDomain[]> = {
  LEARNING_FUTURE: [LifeDomain.ACADEMIC, LifeDomain.CAREER, LifeDomain.FINANCIAL],
  SELF_DEVELOPMENT_WELLBEING: [LifeDomain.PERSONAL_DEV, LifeDomain.HEALTH, LifeDomain.HEALTH_LIFESTYLE],
  RELATIONSHIPS_PARTICIPATION: [LifeDomain.SOCIAL, LifeDomain.SOCIAL_EMOTIONAL, LifeDomain.ACTIVITIES],
};

export function scoreDevelopmentCatalogItem(item: CatalogItem, context: CatalogRecommendationContext) {
  const domains = stringArray(item.domainTags).map((domain) => domain === 'PERSONAL' ? LifeDomain.PERSONAL_DEV : domain as LifeDomain);
  const riasec = stringArray(item.riasecTags).map((tag) => tag.toUpperCase());
  const searchable = `${item.title} ${item.description} ${item.skillTags}`.toLocaleLowerCase('tr-TR');
  const matchingArea = context.areaScores.find((score) => AREA_DOMAINS[score.area].some((domain) => domains.includes(domain)));
  const domainContribution = matchingArea ? Math.round(35 * matchingArea.priorityScore / 100) : 0;
  const matchingRiasec = context.riasecTopCodes.filter((code) => riasec.includes(code)).length;
  const riasecContribution = Math.round(25 * Math.min(1, matchingRiasec / 2));
  const interestContribution = context.interestTags.some((tag) => searchable.includes(tag.toLocaleLowerCase('tr-TR'))) ? 15 : 0;
  const goalContribution = context.goalDomains.some((domain) => domains.includes(domain)) ? 15 : 0;
  const valueContribution = context.valueTags.some((tag) => searchable.includes(tag.toLocaleLowerCase('tr-TR'))) ? 10 : 0;
  const internalScore = domainContribution + riasecContribution + interestContribution + goalContribution + valueContribution;
  const fitBand = internalScore >= 75 ? CatalogFitBand.STRONG : internalScore >= 55 ? CatalogFitBand.SUITABLE : CatalogFitBand.EXPLORE;
  const signals = [domainContribution > 0, riasecContribution > 0, interestContribution > 0, goalContribution > 0, valueContribution > 0].filter(Boolean).length;
  const confidence = signals >= 4 ? DevelopmentConfidence.HIGH : signals >= 2 ? DevelopmentConfidence.MEDIUM : DevelopmentConfidence.LOW;
  const reasons = [
    domainContribution > 0 ? `${getAreaLabel(matchingArea!.area)} önceliğinle bağlantılı` : null,
    riasecContribution > 0 ? `RIASEC ilgi kodlarından ${context.riasecTopCodes.filter((code) => riasec.includes(code)).join(', ')} ile örtüşüyor` : null,
    interestContribution > 0 ? 'Belirttiğin ders, hobi veya kariyer ilgilerinden biriyle eşleşiyor' : null,
    goalContribution > 0 ? 'Aktif hedeflerinden biriyle aynı gelişim alanında' : null,
    valueContribution > 0 ? 'Öne çıkan değerlerinden biriyle bağlantılı' : null,
  ].filter((reason): reason is string => Boolean(reason)).slice(0, 3);
  return { internalScore, fitBand, confidence, reasons };
}

const DOMAIN_GOAL_LABELS: Partial<Record<LifeDomain, string>> = {
  ACADEMIC: 'ders çalışma düzeni', CAREER: 'kariyer keşfi', FINANCIAL: 'finansal farkındalık',
  PERSONAL_DEV: 'kişisel gelişim', HEALTH: 'günlük iyi oluş', HEALTH_LIFESTYLE: 'sağlıklı yaşam düzeni',
  SOCIAL: 'iletişim ve ilişkiler', SOCIAL_EMOTIONAL: 'sosyal-duygusal gelişim', ACTIVITIES: 'toplumsal katılım',
};

export function developmentGoalSuggestions(score: CalculatedAreaScore) {
  const label = DOMAIN_GOAL_LABELS[score.dominantDomain] ?? getAreaLabel(score.area).toLocaleLowerCase('tr-TR');
  return [
    { id: 'goal_1', text: `Önümüzdeki 2 hafta ${label} alanında haftada üç kez 20 dakikalık küçük bir çalışma yapmak.`, whyItFits: 'Kısa, ölçülebilir ve yeniden başlanabilir bir rutin oluşturur.' },
    { id: 'goal_2', text: `${label} alanında 4 hafta içinde küçük bir somut çıktı hazırlayıp güvendiğim bir yetişkinden geri bildirim almak.`, whyItFits: 'Gelişimi görünür bir çıktıya ve insan desteğine bağlar.' },
    { id: 'goal_3', text: `${label} alanındaki ilerlememi 4 hafta boyunca haftada bir kez değerlendirip sonraki küçük adımı yazmak.`, whyItFits: 'İlerlemeyi yargılamadan izlemeyi ve planı gerektiğinde değiştirmeyi sağlar.' },
  ];
}

export function isLowWellbeingScore(scores: CalculatedAreaScore[]): boolean {
  const wellbeing = scores.find((score) => score.area === DevelopmentArea.SELF_DEVELOPMENT_WELLBEING);
  return Boolean(wellbeing && wellbeing.statusAverage > 0 && wellbeing.statusAverage <= 2);
}
