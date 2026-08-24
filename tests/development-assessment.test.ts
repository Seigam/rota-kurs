import {
  CatalogFitBand,
  CatalogItemType,
  CatalogVerificationStatus,
  DevelopmentArea,
  DevelopmentConfidence,
  LifeDomain,
  type CatalogItem,
} from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  BASELINE_QUESTIONS,
  calculateAreaScores,
  getEnabledFollowUps,
  isDevelopmentResponseAnswered,
  scoreDevelopmentCatalogItem,
  type DevelopmentResponseInput,
} from '@/lib/development-assessment';

function response(questionKey: string, statusScore: number, importanceScore: number): DevelopmentResponseInput {
  const question = BASELINE_QUESTIONS.find((item) => item.key === questionKey)!;
  return { questionKey, area: question.area, domain: question.domain, statusScore, importanceScore, uncertain: false, isFollowUp: false };
}

describe('gelişim önceliği', () => {
  it('yanıtı olmayan soruyu ilerlemeye dahil etmez', () => {
    expect(isDevelopmentResponseAnswered(undefined)).toBe(false);
    expect(isDevelopmentResponseAnswered({ statusScore: null, importanceScore: null, uncertain: false })).toBe(false);
    expect(isDevelopmentResponseAnswered({ statusScore: 3, importanceScore: null, uncertain: false })).toBe(false);
    expect(isDevelopmentResponseAnswered({ statusScore: 3, importanceScore: 4, uncertain: false })).toBe(true);
    expect(isDevelopmentResponseAnswered({ statusScore: null, importanceScore: null, uncertain: true })).toBe(true);
  });

  it('durum ile önemi ayrı sinyaller olarak hesaplar', () => {
    const inputs = BASELINE_QUESTIONS.map((question) => ({
      questionKey: question.key, area: question.area, domain: question.domain,
      statusScore: question.area === DevelopmentArea.LEARNING_FUTURE ? 2 : 4,
      importanceScore: question.area === DevelopmentArea.LEARNING_FUTURE ? 5 : 2,
      uncertain: false, isFollowUp: false,
    }));
    const scores = calculateAreaScores(inputs);
    expect(scores[0]).toMatchObject({ area: DevelopmentArea.LEARNING_FUTURE, rank: 1, confidence: DevelopmentConfidence.HIGH });
    expect(scores[0].priorityScore).toBeGreaterThan(scores[1].priorityScore);
  });

  it('yüksek önem/düşük durum veya yanıt farkında takip sorusu açar', () => {
    const inputs = [
      response('learning-study-routine', 2, 5),
      response('learning-academic-direction', 4, 3),
    ];
    const followUps = getEnabledFollowUps(inputs);
    expect(followUps.filter((question) => question.area === DevelopmentArea.LEARNING_FUTURE)).toHaveLength(2);
    expect(followUps.length).toBeLessThanOrEqual(8);
  });

  it('belirsiz yanıtı ortalamaya katmaz ve güveni düşürür', () => {
    const first = BASELINE_QUESTIONS[0];
    const scores = calculateAreaScores([{ questionKey: first.key, area: first.area, domain: first.domain, statusScore: null, importanceScore: null, uncertain: true, isFollowUp: false }]);
    const learning = scores.find((score) => score.area === DevelopmentArea.LEARNING_FUTURE)!;
    expect(learning.statusAverage).toBe(0);
    expect(learning.confidence).toBe(DevelopmentConfidence.LOW);
  });
});

describe('doğrulanmış katalog uyumu', () => {
  const item: CatalogItem = {
    id: 'verified-course', type: CatalogItemType.COURSE, title: 'Veri Bilimine Giriş', description: 'Analiz ve araştırma projesi',
    provider: 'FutuRoute', url: '/student/programs', level: 'Başlangıç', duration: '4 hafta', minGrade: 9, maxGrade: 12,
    domainTags: '["ACADEMIC","CAREER"]', skillTags: '["veri","analiz"]', riasecTags: '["I","C"]',
    verificationStatus: CatalogVerificationStatus.VERIFIED, verifiedAt: new Date(), verifiedBy: 'test', isActive: true,
    createdAt: new Date(), updatedAt: new Date(),
  };

  it('uyum bandını açıklanabilir sinyallerden üretir', () => {
    const result = scoreDevelopmentCatalogItem(item, {
      areaScores: [{ area: DevelopmentArea.LEARNING_FUTURE, statusAverage: 2, importanceAverage: 5, priorityScore: 90, confidence: DevelopmentConfidence.HIGH, rank: 1, dominantDomain: LifeDomain.ACADEMIC }],
      riasecTopCodes: ['I', 'C'], interestTags: ['veri'], goalDomains: [LifeDomain.ACADEMIC], valueTags: ['araştırma'],
    });
    expect(result.fitBand).toBe(CatalogFitBand.STRONG);
    expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    expect(result.reasons.length).toBeLessThanOrEqual(3);
  });

  it('eksik sinyallerde sahte yüksek puan üretmez', () => {
    const result = scoreDevelopmentCatalogItem(item, {
      areaScores: [{ area: DevelopmentArea.RELATIONSHIPS_PARTICIPATION, statusAverage: 3, importanceAverage: 3, priorityScore: 50, confidence: DevelopmentConfidence.LOW, rank: 1, dominantDomain: LifeDomain.SOCIAL }],
      riasecTopCodes: [], interestTags: [], goalDomains: [], valueTags: [],
    });
    expect(result.internalScore).toBe(0);
    expect(result.confidence).toBe(DevelopmentConfidence.LOW);
  });
});
