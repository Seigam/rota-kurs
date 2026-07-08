import { PrismaClient } from '@prisma/client';

export interface MbtiScore {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export interface EnneagramScore {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
}

export interface PersonalityCalculationResult {
  mbtiType: string;
  mbtiScores: {
    EI: { type: 'E' | 'I'; percent: number };
    SN: { type: 'S' | 'N'; percent: number };
    TF: { type: 'T' | 'F'; percent: number };
    JP: { type: 'J' | 'P'; percent: number };
  };
  dominantEnneagram: string;
  wingEnneagram: string;
  fullEnneagramCode: string; // e.g. "Tip 3w4"
  enneagramScores: Record<string, number>;
  summary: string;
  strengths: string[];
  blindSpots: string[];
  recommendedTrack: string; // Sayısal, Eşit Ağırlık, Sözel, Dil, Sanat
  studyHabits: string | string[];
}

const MBTI_DESCRIPTIONS: Record<string, { name: string; track: string; strengths: string[]; blindSpots: string[]; studyHabits: string | string[] }> = {
  INTJ: {
    name: 'Mimar / Stratejist',
    track: 'Sayısal / Eşit Ağırlık',
    strengths: ['Yüksek analitik düşünme', 'Uzun vadeli vizyon', 'Bağımsız çalışma becerisi', 'Karmaşık sistemleri çözme'],
    blindSpots: ['Aşırı mükemmeliyetçilik', 'Duygusal tepkileri göz ardı etme', 'Esneklik eksikliği'],
    studyHabits: ['Kavramsal haritalar çıkararak ve sessiz ortamlarda tek başına derinlemesine çalışmayı tercih eder.'],
  },
  INTP: {
    name: 'Mantıkçı / Kaşif',
    track: 'Sayısal',
    strengths: ['Soyut ve teorik düşünme', 'Meraklı ve yenilikçi yaklaşım', 'Problem çözme ve hata bulma'],
    blindSpots: ['Rutin işlerde sıkılma', 'Zaman yönetimi zorlukları', 'Detayları erteleme'],
    studyHabits: ['Kendi hızında, merak ettiği konuların kökenine inerek ve neden-sonuç ilişkilerini sorgulayarak öğrenir.'],
  },
  ENTJ: {
    name: 'Komutan / Lider',
    track: 'Eşit Ağırlık / Sayısal',
    strengths: ['Doğuştan liderlik ve organizasyon', 'Kararlılık ve verimlilik', 'Hedef odaklı strateji kurma'],
    blindSpots: ['Sabırsızlık', 'Başkalarının hızına tahammülsüzlük', 'Duygusal ihtiyaçları atlama'],
    studyHabits: ['Net hedefler koyar, zaman çizelgeleri oluşturur ve rekabetçi deneme sınavlarıyla kendini test eder.'],
  },
  ENTP: {
    name: 'Tartışmacı / Yenilikçi',
    track: 'Eşit Ağırlık / Sayısal',
    strengths: ['Hızlı zeka ve pratik düşünme', 'Yaratıcı beyin fırtınası', 'Geleneksel kalıpları yıkma'],
    blindSpots: ['Projeleri yarım bırakma eğilimi', 'Odak dağılması', 'Tartışmalarda aşırı ısrarcılık'],
    studyHabits: ['İnteraktif tartışmalar, grup çalışmaları ve farklı konuları birbirine bağlayarak dinamik şekilde çalışır.'],
  },
  INFJ: {
    name: 'Savunucu / Vizyoner',
    track: 'Eşit Ağırlık / Sözel',
    strengths: ['Derin empati ve sezgi', 'İdealizm ve yüksek ahlaki değerler', 'Yaratıcı problem çözme'],
    blindSpots: ['Tükenmişlik (burnout) riski', 'Eleştiriyi fazla kişisel alma', 'Gerçekleri ideallere feda etme'],
    studyHabits: ['Anlamlı bulduğu konulara derinlemesine odaklanır, sessiz ve düzenli bir ortamda not çıkararak öğrenir.'],
  },
  INFP: {
    name: 'Arabulucu / İdealist',
    track: 'Sözel / Dil / Sanat',
    strengths: ['Yüksek yaratıcılık ve özgünlük', 'İnsan doğasını anlama', 'Değerlerine bağlılık'],
    blindSpots: ['Aşırı duygusal hassasiyet', 'Pratik detaylarda kaybolma', 'Kararsızlık'],
    studyHabits: ['Hikayeleştirme, görsel materyaller ve sanatsal ifadelerle kendi iç dünyasında bağ kurarak çalışır.'],
  },
  ENFJ: {
    name: 'Önder / Mentor',
    track: 'Eşit Ağırlık / Sözel',
    strengths: ['İnsanları motive etme ve geliştirme', 'Güçlü iletişim becerileri', 'Empatik liderlik'],
    blindSpots: ['Başkalarının sorunlarını fazla üstlenme', 'Onay alma ihtiyacı', 'Kendi ihtiyaçlarını ihmal etme'],
    studyHabits: ['Grup arkadaşlarına anlatarak, ortak çalışma grupları kurarak ve sosyal bağlamı olan konulara odaklanarak öğrenir.'],
  },
  ENFP: {
    name: 'KAMPÜS ELÇİSİ / İlham Verici',
    track: 'Eşit Ağırlık / Dil / Sözel',
    strengths: ['Bitmek bilmeyen enerji ve coşku', 'Yüksek sosyal zeka', 'Olaylar arası esnek bağlantı kurma'],
    blindSpots: ['Rutin ve tekrara dayalı işlerde sıkılma', 'Odaklanma süresinin kısalığı', 'Aşırı iyimserlik'],
    studyHabits: ['Eğlenceli kartlar (flashcards), renkli zihin haritaları ve sık ara vererek çeşitli dersler arasında geçiş yaparak çalışır.'],
  },
  ISTJ: {
    name: 'Lojistikçi / Denetçi',
    track: 'Sayısal / Eşit Ağırlık',
    strengths: ['Yüksek sorumluluk bilinci', 'Detaylara sadakat ve düzen', 'Güvenilirlik ve dakiklik'],
    blindSpots: ['Değişime karşı direnç', 'Yeni yöntemlere şüpheyle yaklaşma', 'Aşırı kuralcılık'],
    studyHabits: ['Günlük çalışma programına sadık kalarak, düzenli özetler çıkararak ve geçmiş yıl sorularını çözerek çalışır.'],
  },
  ISFJ: {
    name: 'Koruyucu / Destekçi',
    track: 'Eşit Ağırlık / Sözel',
    strengths: ['Sabır, özen ve şefkat', 'Güçlü hafıza ve sadakat', 'Uyumlu ve çalışkan takım oyuncusu'],
    blindSpots: ['Hayır diyememe', 'Değişimden huzursuz olma', 'Kendi başarılarını küçümseme'],
    studyHabits: ['Düzenli not defterleri tutar, sakin ve samimi bir ortamda tekrar yaparak öğrendiklerini pekiştirir.'],
  },
  ESTJ: {
    name: 'Yönetici / Düzenleyici',
    track: 'Eşit Ağırlık / Sayısal',
    strengths: ['Pratik organizasyon gücü', 'Sonuç odaklı kararlılık', 'Kural ve prosedürleri uygulama'],
    blindSpots: ['Esnek olmayan katı tutum', 'Farklı görüşlere sabırsızlık', 'Duygusal ihtiyaçları görememe'],
    studyHabits: ['Net hedefler, zaman kronometreleri (Pomodoro) ve adım adım ilerleyen planlı test programlarıyla çalışır.'],
  },
  ESFJ: {
    name: 'Konsolos / Sosyal Bağlayıcı',
    track: 'Eşit Ağırlık / Sözel',
    strengths: ['İnsan ilişkilerinde ustalık', 'Yardımseverlik ve takım ruhu', 'Düzen ve uyum yaratma'],
    blindSpots: ['Sosyal statüye ve onaya fazla önem verme', 'Eleştiriden çabuk incinme', 'Çatışmadan aşırı kaçınma'],
    studyHabits: ['Arkadaşlarıyla birbirine soru sorarak, öğretmenleriyle iletişimde kalarak ve pratik örnekler üzerinden öğrenir.'],
  },
  ISTP: {
    name: 'Zanaatkar / Analizci',
    track: 'Sayısal / Mesleki Teknik',
    strengths: ['Kriz anında sakin ve pratik müdahale', 'Mekanik ve teknik konularda ustalık', 'Gerçekçi ve mantıklı analiz'],
    blindSpots: ['Uzun vadeli planlamadan sıkılma', 'Duygularını ifade etmekte zorlanma', 'Risk alma eğilimi'],
    studyHabits: ['Yaparak yaşayarak, laboratuvar deneyleri, simülasyonlar ve pratik uygulama sorularıyla öğrenir.'],
  },
  ISFP: {
    name: 'Maceracı / Sanatçı',
    track: 'Sanat / Dil / Sözel',
    strengths: ['Gelişmiş estetik algı', 'Anı yaşama ve esneklik', 'Sakin ve önyargısız empati'],
    blindSpots: ['Gelecek planlamasında kararsızlık', 'Rekabetçi ortamlardan stres olma', 'Kendi kabuğuna çekilme'],
    studyHabits: ['Görsel estetiği olan notlar, sakin ve baskısız bir ortam, kendi ilgi alanıyla bağdaşan pratik projelerle çalışır.'],
  },
  ESTP: {
    name: 'Girişimci / Aksiyon Adamı',
    track: 'Eşit Ağırlık / Sayısal',
    strengths: ['Girişimcilik ve ikna kabiliyeti', 'Enerjik ve eylem odaklı yapı', 'Hızlı karar alma ve kriz yönetimi'],
    blindSpots: ['Teorik derslerden çabuk sıkılma', 'İmpulsif (dürtüsel) kararlar alma', 'Kuralları esnetme'],
    studyHabits: ['Kısa ve yoğun çalışma seansları, oyunlaştırılmış testler ve gerçek hayat örneklerine dayalı interaktif yöntemlerle çalışır.'],
  },
  ESFP: {
    name: 'Eğlendirici / Sahne Işığı',
    track: 'Sanat / Eşit Ağırlık / Sözel',
    strengths: ['Yüksek yaşama sevinci ve coşku', 'Sosyal adaptasyon ve çekicilik', 'Pratik ve gözlemci yaklaşım'],
    blindSpots: ['Sıkıcı ve uzun teorik metinlerden kaçma', 'Anlık zevkler için geleceği erteleme', 'Odak dağınıklığı'],
    studyHabits: ['Grup çalışmaları, görsel videolar, canlandırmalar ve sosyal etkileşim içeren dinamik ortamlarda çalışır.'],
  },
};

const ENNEAGRAM_NAMES: Record<number, string> = {
  1: 'Tip 1: Mükemmeliyetçi / Reformcu',
  2: 'Tip 2: Yardımsever / Gönül İnsanı',
  3: 'Tip 3: Başarı Odaklı / Performansçı',
  4: 'Tip 4: Özgün / Bireyci Sanatçı',
  5: 'Tip 5: Araştırmacı / Gözlemci Bilge',
  6: 'Tip 6: Sadık / Güvenlik Odaklı Sorgulayıcı',
  7: 'Tip 7: Coşkulu / Kaşif ve Maceracı',
  8: 'Tip 8: Meydan Okuyan / Güçlü Koruyucu',
  9: 'Tip 9: Barışçı / Uzlaşmacı Arabulucu',
};

export function calculatePersonalityFromAnswers(answers: Array<{ choice: any }>): PersonalityCalculationResult {
  const mbti: MbtiScore = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const enneagram: EnneagramScore = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

  for (const item of answers) {
    if (!item.choice) continue;

    const mbtiRaw = item.choice.mbtiEffect || item.choice.mbtiWeights;
    const enneagramRaw = item.choice.enneagramEffect || item.choice.enneagramWeights;

    // Parse MBTI effect
    if (mbtiRaw) {
      try {
        const parsedMbti = typeof mbtiRaw === 'string' ? JSON.parse(mbtiRaw) : mbtiRaw;
        for (const [key, val] of Object.entries(parsedMbti)) {
          if (key in mbti) {
            mbti[key as keyof MbtiScore] += Number(val) || 0;
          }
        }
      } catch (e) {
        console.error('Error parsing mbtiEffect/weights:', e);
      }
    }

    // Parse Enneagram effect
    if (enneagramRaw) {
      try {
        const parsedEnn = typeof enneagramRaw === 'string' ? JSON.parse(enneagramRaw) : enneagramRaw;
        for (const [key, val] of Object.entries(parsedEnn)) {
          const numKey = Number(key) as keyof EnneagramScore;
          if (numKey >= 1 && numKey <= 9) {
            enneagram[numKey] += Number(val) || 0;
          }
        }
      } catch (e) {
        console.error('Error parsing enneagramEffect/weights:', e);
      }
    }
  }

  // Calculate MBTI Dimensions
  const calcPercent = (a: number, b: number) => {
    const total = a + b;
    if (total === 0) return 50;
    return Math.round((a / total) * 100);
  };

  const EI_type = mbti.E >= mbti.I ? 'E' : 'I';
  const EI_percent = calcPercent(mbti[EI_type], mbti[EI_type === 'E' ? 'I' : 'E']);

  const SN_type = mbti.N >= mbti.S ? 'N' : 'S';
  const SN_percent = calcPercent(mbti[SN_type], mbti[SN_type === 'N' ? 'S' : 'N']);

  const TF_type = mbti.T >= mbti.F ? 'T' : 'F';
  const TF_percent = calcPercent(mbti[TF_type], mbti[TF_type === 'T' ? 'F' : 'T']);

  const JP_type = mbti.J >= mbti.P ? 'J' : 'P';
  const JP_percent = calcPercent(mbti[JP_type], mbti[JP_type === 'J' ? 'P' : 'J']);

  const mbtiCode = `${EI_type}${SN_type}${TF_type}${JP_type}`;

  // Calculate Enneagram Dominant & Wing
  let maxScore = -1;
  let domType = 5; // Default

  for (let i = 1; i <= 9; i++) {
    const sc = enneagram[i as keyof EnneagramScore];
    if (sc > maxScore) {
      maxScore = sc;
      domType = i;
    }
  }

  // Calculate Wing (Adjacent types: for tip 1 -> 9 and 2; for tip 9 -> 8 and 1)
  const leftAdj = domType === 1 ? 9 : domType - 1;
  const rightAdj = domType === 9 ? 1 : domType + 1;

  const leftScore = enneagram[leftAdj as keyof EnneagramScore];
  const rightScore = enneagram[rightAdj as keyof EnneagramScore];

  const wingType = leftScore >= rightScore ? leftAdj : rightAdj;

  const dominantEnneagramName = ENNEAGRAM_NAMES[domType] || `Tip ${domType}`;
  const wingEnneagramName = ENNEAGRAM_NAMES[wingType] || `Tip ${wingType}`;
  const fullEnneagramCode = `Tip ${domType}w${wingType}`;

  // Build Final Report details
  const mbtiInfo = MBTI_DESCRIPTIONS[mbtiCode] || MBTI_DESCRIPTIONS['INTJ'];

  const summary = `Seçimlerinizin analizine göre kişilik profiliniz ${mbtiCode} (${mbtiInfo.name}) ve temel Enneagram motivasyonunuz ${fullEnneagramCode} (${dominantEnneagramName}) olarak belirlenmiştir. Bu kombinasyon, sizin hem düşünsel stratejilerinizde hem de içsel motivasyonlarınızda özgün ve güçlü bir potansiyele sahip olduğunuzu gösterir.`;

  return {
    mbtiType: `${mbtiCode} (${mbtiInfo.name})`,
    mbtiScores: {
      EI: { type: EI_type, percent: EI_percent },
      SN: { type: SN_type, percent: SN_percent },
      TF: { type: TF_type, percent: TF_percent },
      JP: { type: JP_type, percent: JP_percent },
    },
    dominantEnneagram: dominantEnneagramName,
    wingEnneagram: wingEnneagramName,
    fullEnneagramCode,
    enneagramScores: enneagram as unknown as Record<string, number>,
    summary,
    strengths: mbtiInfo.strengths,
    blindSpots: mbtiInfo.blindSpots,
    recommendedTrack: mbtiInfo.track,
    studyHabits: mbtiInfo.studyHabits,
  };
}
