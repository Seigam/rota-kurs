import { LifeDomain } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  getPlanningDomainGroup,
  PLANNING_DOMAIN_GROUPS,
  resolvePlanningDomain,
} from '@/lib/planning-domain-groups';

describe('üç ana hedef alanı', () => {
  it('arayüzü üç ana alanla sınırlar', () => {
    expect(PLANNING_DOMAIN_GROUPS).toHaveLength(3);
  });

  it('eski alt alanları doğru ana alanda tutar', () => {
    expect(getPlanningDomainGroup(LifeDomain.FINANCIAL)?.key).toBe('LEARNING_FUTURE');
    expect(getPlanningDomainGroup(LifeDomain.HEALTH)?.key).toBe('SELF_DEVELOPMENT_WELLBEING');
    expect(getPlanningDomainGroup(LifeDomain.SOCIAL)?.key).toBe('RELATIONSHIPS_PARTICIPATION');
  });

  it('sağlık ve finans metinlerini güvenlik kuralları için doğru teknik alana yönlendirir', () => {
    expect(resolvePlanningDomain('SELF_DEVELOPMENT_WELLBEING', 'Bana ilaç dozu ve tedavi öner')).toBe(LifeDomain.HEALTH);
    expect(resolvePlanningDomain('LEARNING_FUTURE', 'Kriptoda garanti getiri sağlayacak yatırım öner')).toBe(LifeDomain.FINANCIAL);
  });
});
