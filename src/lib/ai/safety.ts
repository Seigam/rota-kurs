import { LifeDomain } from '@prisma/client';

export type SafetyDecision = {
  blocked: boolean;
  category: 'none' | 'prompt_injection' | 'crisis' | 'health_advice' | 'financial_advice';
  warning?: string;
};

const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

export function evaluateStudentSafety(domain: LifeDomain, text: string): SafetyDecision {
  const normalized = text.toLocaleLowerCase('tr-TR');

  if (includesAny(normalized, ['önceki talimatları unut', 'sistem mesajı', 'system prompt', 'ignore previous', 'jailbreak'])) {
    return { blocked: true, category: 'prompt_injection', warning: 'İstek güvenli öğrenci rehberliği kapsamına yönlendirildi.' };
  }
  if (includesAny(normalized, ['intihar', 'kendime zarar', 'yaşamak istemiyorum', 'self harm', 'suicide'])) {
    return { blocked: true, category: 'crisis', warning: 'Acil destek gerektirebilecek içerik algılandı; bir yetişkin ve uzman desteğine yönlendirme yapıldı.' };
  }
  if (
    domain === LifeDomain.HEALTH &&
    includesAny(normalized, ['teşhis', 'tanı koy', 'ilaç', 'doz', 'tedavi', 'kilo ver', 'kalori', 'yeme bozukluğu'])
  ) {
    return { blocked: true, category: 'health_advice', warning: 'Tıbbi veya kilo/kalori odaklı öneri yerine güvenli eğitim desteği sunuldu.' };
  }
  if (
    domain === LifeDomain.FINANCIAL &&
    includesAny(normalized, ['yatırım', 'hisse', 'kripto', 'kredi çek', 'borç al', 'kaldıraç', 'getiri garantisi'])
  ) {
    return { blocked: true, category: 'financial_advice', warning: 'Yatırım veya borç önerisi yerine finansal okuryazarlık desteği sunuldu.' };
  }
  return { blocked: false, category: 'none' };
}
