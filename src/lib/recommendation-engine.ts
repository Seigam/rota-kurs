import { CareerInterestResult, CareerProgram, Profile, PersonalityResult, ValueRanking } from '@prisma/client';

export interface ScoredProgram {
  program: CareerProgram;
  matchScore: number;
  explanation: string;
}

export function generateRecommendations(
  profile: Profile,
  personality: PersonalityResult | null,
  values: ValueRanking[],
  allPrograms: CareerProgram[],
  interestResult?: CareerInterestResult | null,
): ScoredProgram[] {
  const scoredList: ScoredProgram[] = [];

  // Öğrencinin temel bilgileri
  const studentGrade = profile.grade || 9;
  const targetCareer = (profile.targetCareer || '').toLowerCase();
  const hobbies = (profile.hobbies || '').toLowerCase();
  const subjects = (profile.favoriteSubjects || '').toLowerCase();
  
  // MBTI/Enneagram yalnız öz-farkındalık deneyiminde kullanılır; eşleşme puanını etkilemez.
  void personality;
  const riasecScores = interestResult ? {
    R: interestResult.realistic, I: interestResult.investigative, A: interestResult.artistic,
    S: interestResult.social, E: interestResult.enterprising, C: interestResult.conventional,
  } : null;
  const topRiasec = riasecScores
    ? Object.entries(riasecScores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([code]) => code)
    : [];

  // En önemli 3 değer
  const topValues = values.slice(0, 3).map((v) => v.valueName.toLowerCase());

  for (const prog of allPrograms) {
    let score = 55; // Başlangıç temel puanı
    const matchReasons: string[] = [];

    // 1. Sınıf Kontrolü
    if (studentGrade < prog.minGrade) {
      // Sınıfı yetmiyorsa puanı düşür
      score -= 25;
    } else {
      score += 5;
    }

    // 2. RIASEC ilgi eşleşmesi
    const riasecText = `${prog.title} ${prog.description} ${prog.category}`.toLocaleLowerCase('tr-TR');
    const programCodes = new Set<string>();
    if (/mühendis|üretim|robot|elektronik|spor|tarım/.test(riasecText)) programCodes.add('R');
    if (/bilim|araştır|veri|matematik|sağlık|analiz/.test(riasecText)) programCodes.add('I');
    if (/sanat|tasarım|müzik|medya|yaratıcı/.test(riasecText)) programCodes.add('A');
    if (/eğitim|rehber|sosyal|iletişim|sağlık/.test(riasecText)) programCodes.add('S');
    if (/girişim|lider|yönetim|pazar|iş dünyası/.test(riasecText)) programCodes.add('E');
    if (/finans|istatistik|plan|operasyon|kayıt/.test(riasecText)) programCodes.add('C');
    const matchingCodes = topRiasec.filter((code) => programCodes.has(code));
    if (matchingCodes.length > 0) {
      score += matchingCodes.length * 8;
      matchReasons.push(`RIASEC ilgi profilinizdeki ${matchingCodes.join('-')} alanlarıyla örtüşüyor`);
    }

    // 3. Hedef Meslek & İlgi Alanları Eşleşmesi
    const progTitle = prog.title.toLowerCase();
    const progDesc = prog.description.toLowerCase();
    const progCat = prog.category.toLowerCase();

    if (targetCareer && (progTitle.includes(targetCareer) || progDesc.includes(targetCareer) || progCat.includes(targetCareer) || targetCareer.includes(progCat))) {
      score += 15;
      matchReasons.push(`Hedeflediğiniz kariyer rotasıyla bağlantılı pratik beceriler sunuyor`);
    } else if (hobbies && (progTitle.includes('yazılım') || progTitle.includes('tasarım') || progTitle.includes('robotik') || progCat.includes('inovasyon'))) {
      if (hobbies.includes('kod') || hobbies.includes('bilgisayar') || hobbies.includes('teknoloji') || hobbies.includes('sanat')) {
        score += 10;
        matchReasons.push(`Hobileriniz ve kişisel ilgi alanlarınızla paralellik gösteriyor`);
      }
    }

    // 4. Değerler Eşleşmesi
    for (const val of topValues) {
      if (val.includes('akademik') || val.includes('öğrenme')) {
        if ((prog.provider || '').includes('TÜBİTAK') || (prog.provider || '').includes('Üniversite') || prog.category.includes('Bilim')) {
          score += 8;
          matchReasons.push(`'Akademik Gelişim' önceliğinize uygun nitelikli bir sertifika sağlıyor`);
          break;
        }
      }
      if (val.includes('yaratıcılık') || val.includes('özgünlük')) {
        if (progCat.includes('tasarım') || progCat.includes('sanat') || progCat.includes('inovasyon')) {
          score += 8;
          matchReasons.push(`'Yaratıcılık' değerinizi ön plana çıkaracak projeler içeriyor`);
          break;
        }
      }
      if (val.includes('liderlik') || val.includes('güç')) {
        if (progCat.includes('yönetim') || progCat.includes('liderlik') || progCat.includes('girişimcilik')) {
          score += 8;
          matchReasons.push(`'Liderlik & Güç' motivasyonunuzu güçlendirecek yetkinlikler kazandırıyor`);
          break;
        }
      }
    }

    // Puanı sınırla
    score = Math.min(99, Math.max(45, score));

    // Eğer hiç sebep eklenmediyse genel açıklama koy
    if (matchReasons.length === 0) {
      matchReasons.push(`${prog.provider} onaylı olup ${studentGrade}. sınıf düzeyinize ve mesleki yöneliminize katkı sağlayacak temel bir gelişim fırsatıdır.`);
    }

    const explanation = `Bu program, ${matchReasons.join(', ')}. Toplam eşleşme oranınız %${score}!`;

    scoredList.push({
      program: prog,
      matchScore: score,
      explanation,
    });
  }

  // Puanlara göre yüksekten düşüğe sırala
  scoredList.sort((a, b) => b.matchScore - a.matchScore);

  return scoredList;
}
