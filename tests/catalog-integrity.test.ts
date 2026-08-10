import { describe, expect, it } from 'vitest';
import { CatalogItemType, CatalogVerificationStatus, LifeDomain, type CatalogItem } from '@prisma/client';

import { normalizeCatalogDomain, scoreCatalogItem } from '@/lib/catalog-service';

const item: CatalogItem = {
  id: 'verified-1', type: CatalogItemType.COURSE, title: 'Veri Bilimi', description: 'Analiz', provider: 'FutuRoute',
  url: '/student/programs', level: 'Başlangıç', duration: '8 saat', minGrade: 9, maxGrade: 12,
  domainTags: '["CAREER"]', skillTags: '["veri"]', riasecTags: '["I","C"]',
  verificationStatus: CatalogVerificationStatus.VERIFIED, verifiedAt: new Date(), verifiedBy: 'test', isActive: true,
  createdAt: new Date(), updatedAt: new Date(),
};

describe('doğrulanmış katalog', () => {
  it('PERSONAL alanını tek enum eşlemesine dönüştürür', () => expect(normalizeCatalogDomain('PERSONAL')).toBe(LifeDomain.PERSONAL_DEV));
  it('doğrulanmış ve sınıfa uygun kaydı puanlar', () => expect(scoreCatalogItem(item, { domain: LifeDomain.CAREER, grade: 11, riasecTopCodes: ['I'], interestTags: ['veri'] })).toBeGreaterThan(60));
  it('doğrulanmamış veya sınıf dışı kaydı kesin olarak eler', () => {
    expect(scoreCatalogItem({ ...item, verificationStatus: CatalogVerificationStatus.PENDING }, { domain: LifeDomain.CAREER, grade: 11, riasecTopCodes: [], interestTags: [] })).toBe(Number.NEGATIVE_INFINITY);
    expect(scoreCatalogItem(item, { domain: LifeDomain.CAREER, grade: 8, riasecTopCodes: [], interestTags: [] })).toBe(Number.NEGATIVE_INFINITY);
  });
});
