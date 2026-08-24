import { LifeDomain } from '@prisma/client';

export type PlanningDomainGroupKey =
  | 'LEARNING_FUTURE'
  | 'SELF_DEVELOPMENT_WELLBEING'
  | 'RELATIONSHIPS_PARTICIPATION';

export const PLANNING_DOMAIN_GROUPS = [
  {
    key: 'LEARNING_FUTURE',
    label: 'Öğrenme ve Gelecek',
    shortLabel: 'Gelecek',
    description: 'Okul, kariyer, beceriler ve geleceğe hazırlanma hedeflerin.',
    includes: 'Akademik · Kariyer · Finansal farkındalık',
    domains: [LifeDomain.ACADEMIC, LifeDomain.CAREER, LifeDomain.FINANCIAL],
    defaultDomain: LifeDomain.CAREER,
  },
  {
    key: 'SELF_DEVELOPMENT_WELLBEING',
    label: 'Kendini Geliştirme ve İyi Yaşam',
    shortLabel: 'İyi yaşam',
    description: 'Alışkanlıkların, becerilerin, enerjin ve günlük iyi oluşun.',
    includes: 'Kişisel gelişim · Sağlık · Yaşam düzeni',
    domains: [LifeDomain.PERSONAL_DEV, LifeDomain.HEALTH, LifeDomain.HEALTH_LIFESTYLE, LifeDomain.HOBBIES_LEISURE],
    defaultDomain: LifeDomain.PERSONAL_DEV,
  },
  {
    key: 'RELATIONSHIPS_PARTICIPATION',
    label: 'İlişkiler ve Katılım',
    shortLabel: 'İlişkiler',
    description: 'İletişim, destek ağı, birlikte üretme ve topluma katılım hedeflerin.',
    includes: 'İlişkiler · Sosyal-duygusal gelişim · Etkinlikler',
    domains: [LifeDomain.SOCIAL, LifeDomain.SOCIAL_EMOTIONAL, LifeDomain.ACTIVITIES],
    defaultDomain: LifeDomain.SOCIAL,
  },
] as const;

export function getPlanningDomainGroup(domain: LifeDomain) {
  return PLANNING_DOMAIN_GROUPS.find((group) => (group.domains as readonly LifeDomain[]).includes(domain));
}

export function resolvePlanningDomain(
  groupKey: PlanningDomainGroupKey,
  text: string,
  existingDomain?: LifeDomain,
): LifeDomain {
  const normalized = text.toLocaleLowerCase('tr-TR');
  const group = PLANNING_DOMAIN_GROUPS.find((item) => item.key === groupKey)!;

  if (groupKey === 'LEARNING_FUTURE') {
    if (/finans|bütçe|burs|para|harcama|birikim|tasarruf|yatırım|kripto|hisse|borç|maddi/.test(normalized)) {
      return LifeDomain.FINANCIAL;
    }
    if (/akadem|ders|sınav|okul|üniversite|not |net |ödev|araştırma|dil öğren|matematik|fen/.test(normalized)) {
      return LifeDomain.ACADEMIC;
    }
    if (/kariyer|meslek|staj|portfolyo|iş |sektör|girişim|mülakat/.test(normalized)) {
      return LifeDomain.CAREER;
    }
  }

  if (groupKey === 'SELF_DEVELOPMENT_WELLBEING') {
    if (/sağlık|uyku|spor|beslen|enerji|hareket|egzersiz|ilaç|tedavi|doktor|depres|kaygı|kendime zarar|yaşamak istem/.test(normalized)) {
      return LifeDomain.HEALTH;
    }
    if (/alışkanlık|özgüven|zaman yönet|kişisel|beceri|hobi|sanat|müzik|yaratıcı/.test(normalized)) {
      return LifeDomain.PERSONAL_DEV;
    }
  }

  if (existingDomain && (group.domains as readonly LifeDomain[]).includes(existingDomain)) {
    return existingDomain;
  }
  return group.defaultDomain;
}
