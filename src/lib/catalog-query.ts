/**
 * Platform İçi Katalog Sorgulama Servisi
 *
 * Öğrencinin sınıf seviyesi, hedef alanı ve kişilik profiline göre
 * hem zorunlu mikroyeterlilikleri hem de seçmeli kursları filtreleyip
 * AI Agent prompt'una enjekte edilecek bir bağlam metni üretir.
 */

import {
  COMPULSORY_GRADE_LEVELS,
  ELECTIVE_CATEGORIES,
} from '@/lib/data/micro-credentials-data';
import { prisma } from '@/lib/prisma';

// Domain → ilgili seçmeli kategori eşlemeleri
const DOMAIN_TO_ELECTIVE_CATEGORY: Record<string, string[]> = {
  CAREER:       ['career', 'ai', 'entrepreneurship', 'leadership'],
  ACADEMIC:     ['research', 'tech', 'ai', 'digital'],
  PERSONAL_DEV: ['leadership', 'health', 'media', 'design'],
  SOCIAL:       ['citizenship', 'leadership', 'media'],
  HEALTH:       ['health', 'leadership'],
  FINANCIAL:    ['finance', 'entrepreneurship', 'career'],
};

// Sınıf numarasını metin karşılığına çevir
function gradeLabel(grade?: number | null): string | null {
  if (!grade) return null;
  const MAP: Record<number, string> = {
    8: 'Hazırlık Sınıfı',
    9: '9. Sınıf',
    10: '10. Sınıf',
    11: '11. Sınıf',
    12: '12. Sınıf',
  };
  return MAP[grade] ?? null;
}

/**
 * Öğrenciye özel platform katalog bağlamını oluşturur.
 * Döndürülen metin doğrudan AI prompt'una eklenir.
 */
export async function buildCatalogContext(params: {
  grade?: number | null;
  domain?: string | null;
  targetCareer?: string | null;
  profileId?: string | null;
}): Promise<string> {
  const { grade, domain, targetCareer, profileId } = params;
  const sections: string[] = [];

  // 1. Zorunlu Mikroyeterlilikler (Sınıf bazlı)
  const gradeKey = gradeLabel(grade);
  if (gradeKey) {
    const compLevel = COMPULSORY_GRADE_LEVELS.find((g) => g.grade === gradeKey);
    if (compLevel) {
      const lines = compLevel.courses.map(
        (c) => `  • ${c.title} — ${c.description} [Beceriler: ${c.skills.join(', ')}]`
      );
      sections.push(
        `[ZORUNLU MİKROYETERLİLİKLER — ${compLevel.grade} | Odak: ${compLevel.focus}]\n${lines.join('\n')}`
      );
    }
  }

  // 2. Seçmeli Kurslar (Domain bazlı)
  const electiveCatIds = domain ? (DOMAIN_TO_ELECTIVE_CATEGORY[domain] ?? []) : [];
  const relevantCategories = ELECTIVE_CATEGORIES.filter((cat) =>
    electiveCatIds.includes(cat.id)
  );

  for (const cat of relevantCategories) {
    const lines = cat.courses.map(
      (c) =>
        `  • ${c.title} | ${c.level} | ${c.duration} — ${c.description} [Etiketler: ${c.tags.join(', ')}]`
    );
    sections.push(
      `[SEÇMELİ KURSLAR — ${cat.title}]\n${lines.join('\n')}`
    );
  }

  // 3. DB'deki Kariyer Programları (profileId varsa en yüksek matchScore'lu 10 tanesi)
  if (profileId) {
    try {
      const recs = await prisma.recommendation.findMany({
        where: { profileId },
        orderBy: { matchScore: 'desc' },
        take: 10,
        include: { program: true },
      });

      if (recs.length > 0) {
        const lines = recs.map(
          (r) =>
            `  • ${r.program.title} | ${r.program.category ?? ''} | ${r.program.durationInfo ?? ''} — ${r.program.description ?? ''} [Eşleşme Skoru: ${r.matchScore}]`
        );
        sections.push(`[PLATFORMA ÖZEL KARİYER PROGRAMLARI — Sana Göre Sıralandı]\n${lines.join('\n')}`);
      }
    } catch (err) {
      console.error('[CatalogQuery] DB sorgusu hatası:', err);
    }
  }

  if (sections.length === 0) return '';

  return (
    `\n\n--- PLATFORM DERS VE MİKROYETERLİLİK KATALOĞU ---\n` +
    `Aşağıdaki listeler platformumuzun gerçek ders ve kaynak kataloğunu göstermektedir.\n` +
    sections.join('\n\n') +
    `\n---`
  );
}
