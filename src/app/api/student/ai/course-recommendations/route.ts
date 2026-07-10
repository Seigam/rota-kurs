import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface CourseRecommendation {
  id: string;
  title: string;
  platform: string;
  level: string;
  duration: string;
  relatedStep: string;
  reason: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { domain, domainLabel, inProgressSteps = [], todoSteps = [] } = await request.json();

    const activeStepsCount = inProgressSteps.length + todoSteps.length;
    if (activeStepsCount === 0) {
      return NextResponse.json({
        recommendations: generateFallbackRecommendations(domain, domainLabel, []),
      });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey) {
      try {
        const aiRecs = await generateCourseRecsWithGroq(
          groqApiKey,
          domain,
          domainLabel,
          inProgressSteps,
          todoSteps
        );
        if (aiRecs && aiRecs.length > 0) {
          return NextResponse.json({ recommendations: aiRecs });
        }
      } catch (err) {
        console.error('Groq course recommendation error, fallback applied:', err);
      }
    }

    const fallbackRecs = generateFallbackRecommendations(
      domain,
      domainLabel,
      [...inProgressSteps, ...todoSteps]
    );

    return NextResponse.json({ recommendations: fallbackRecs });
  } catch (err) {
    console.error('POST course-recommendations error:', err);
    return NextResponse.json({ error: 'Kurs önerileri alınırken hata oluştu' }, { status: 500 });
  }
}

async function generateCourseRecsWithGroq(
  apiKey: string,
  domain: string,
  domainLabel: string,
  inProgressSteps: string[],
  todoSteps: string[]
): Promise<CourseRecommendation[] | null> {
  const stepsPrompt = [
    inProgressSteps.length > 0
      ? `Yapılacaklar (Şu an üzerinde çalıştıkları): ${inProgressSteps.join(', ')}`
      : '',
    todoSteps.length > 0
      ? `Plan Adımları (Yakında başlayacakları): ${todoSteps.join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `Sen Türkiye'deki lise ve üniversite öğrencilerine kariyer ve kişisel gelişim rehberliği yapan uzman bir eğitim danışmanısın.
Öğrencinin ilgilendiği Yaşam Alanı: "${domainLabel || domain}"
Öğrencinin Kanban Panosundaki Görevleri:
${stepsPrompt}

Bu öğrencinin özellikle "Yapılacaklar" listesinde yer alan hedeflerini tamamlamasına doğrudan katkı sağlayacak, Türkiye'den veya dünyadan erişilebilecek (BTK Akademi, Udemy, YouTube Eğitim Serileri, Coursera, MEB EBA, Khan Academy, freeCodeCamp vb.) TAM OLARAK 3 adet pratik, nitelikli kurs veya kaynak önerisi oluştur.

Lütfen yanıtını SADECE geçerli bir JSON dizisi olarak döndür. JSON yapısı şu şekilde olmalıdır:
[
  {
    "title": "Kurs veya Kaynak Başlığı",
    "platform": "Platform Adı (örn: BTK Akademi • Ücretsiz Sertifikalı)",
    "level": "Seviye (örn: Başlangıç / Orta Seviye)",
    "duration": "Tahmini Süre (örn: 10 Saat)",
    "relatedStep": "Öğrencinin listedeki hangi göreviyle ilişkili olduğu",
    "reason": "Bu kursun öğrencinin görevini tamamlamasına neden fayda sağlayacağını anlatan 1-2 cümlelik motive edici açıklama",
    "url": "https://www.btkakademi.gov.tr"
  }
]
Başka hiçbir ek metin, markdown açıklama yazma, sadece JSON dizisini döndür.`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content:
            'Sen yalnızca geçerli bir JSON dizisi döndüren ve asla markdown blokları veya sohbet metni yazmayan bir asistansın.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API returned status ${response.status}`);
  }

  const data = await response.json();
  const rawContent = String(data?.choices?.[0]?.message?.content || '').trim();
  const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(cleaned);

  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((item, index) => ({
      id: `ai_course_${index + 1}_${Date.now()}`,
      title: String(item.title || 'Gelişim Rehberi ve Uygulamalı Kurs'),
      platform: String(item.platform || 'BTK Akademi & YouTube'),
      level: String(item.level || 'Her Seviye'),
      duration: String(item.duration || 'Esnek Hızlı Eğitim'),
      relatedStep: String(item.relatedStep || inProgressSteps[0] || todoSteps[0] || 'Genel Hedefin'),
      reason: String(
        item.reason || 'Hedefini daha hızlı ve sağlam adımlarla gerçekleştirmeni sağlar.'
      ),
      url: String(item.url || 'https://www.btkakademi.gov.tr'),
    }));
  }

  return null;
}

function generateFallbackRecommendations(
  domain: string,
  domainLabel: string,
  steps: string[]
): CourseRecommendation[] {
  const stepText = steps.length > 0 ? steps[0] : `${domainLabel} Gelişim Adımı`;

  switch (domain) {
    case 'CAREER':
      return [
        {
          id: 'fb_career_1',
          title: 'Sıfırdan İleri Seviye Yazılım ve Kariyer Gelişim Patikası',
          platform: 'BTK Akademi • Ücretsiz Sertifikalı',
          level: 'Başlangıç / Orta',
          duration: '24 Saat Uygulamalı',
          relatedStep: stepText,
          reason:
            'Kanban listenizdeki mesleki hazırlık adımını profesyonel sektör standartlarıyla desteklemek için ideal portfolyo odaklı eğitim.',
          url: 'https://www.btkakademi.gov.tr',
        },
        {
          id: 'fb_career_2',
          title: 'Etkili CV Hazırlama, LinkedIn Optimizasyonu ve Mülakat Teknikleri',
          platform: 'YouTube • Rehberlik Akademisi',
          level: 'Her Seviye',
          duration: '3 Saat Masterclass',
          relatedStep: stepText,
          reason:
            'Özgeçmişinizi öne çıkarmak, mülakat simülasyonlarında özgüven kazanmak ve staj/iş başvurularında fark yaratmak için rehber.',
          url: 'https://www.youtube.com',
        },
        {
          id: 'fb_career_3',
          title: 'Proje Yönetimi ve Çevik Çalışma (Agile & Kanban Temelleri)',
          platform: 'Coursera / Google Career',
          level: 'Orta Seviye',
          duration: '8 Saat',
          relatedStep: stepText,
          reason:
            'Hem kendi görevlerinizi yönetmek hem de modern teknoloji ekosistemindeki proje akışlarını öğrenmek için uygulamalı sertifika programı.',
          url: 'https://www.coursera.org',
        },
      ];

    case 'ACADEMIC':
      return [
        {
          id: 'fb_acad_1',
          title: 'Pomodoro, Hızlı Okuma ve Süper Hafıza Teknikleri',
          platform: 'MEB EBA & YouTube Eğitim Serisi',
          level: 'Tüm Öğrenciler',
          duration: '4 Saat Uygulamalı',
          relatedStep: stepText,
          reason:
            'Ders çalışma veriminizi 2 katına çıkarmak, sınav kaygısını yönetmek ve bilgileri kalıcı hafızaya aktarmak için pratik teknikler.',
          url: 'https://www.eba.gov.tr',
        },
        {
          id: 'fb_acad_2',
          title: 'Matematik & Fen Bilimlerinde Soru Çözüm ve Analiz Stratejileri',
          platform: 'Khan Academy • Ücretsiz',
          level: 'Lise & Üniversite Hazırlık',
          duration: 'Konu Bazlı Esnek',
          relatedStep: stepText,
          reason:
            'Eksik olduğunuz kazanımlarda adım adım videolu anlatımlar ve interaktif alıştırmalarla akademik başarınını garanti altına alır.',
          url: 'https://tr.khanacademy.org',
        },
        {
          id: 'fb_acad_3',
          title: 'Akademik İngilizce ve Makale Okuma/Yazma Temelleri',
          platform: 'Udemy • Dil Akademisi',
          level: 'B1 / B2 Seviye',
          duration: '12 Saat',
          relatedStep: stepText,
          reason:
            'Global kaynakları rahatça okuyabilmeniz ve uluslararası burs/proje imkanlarına hazırlanmanız için dil gelişim rehberi.',
          url: 'https://www.udemy.com',
        },
      ];

    case 'PERSONAL':
      return [
        {
          id: 'fb_pers_1',
          title: 'Duygusal Zeka (EQ), İletişim Sanatı ve Topluluk Önünde Konuşma',
          platform: 'BTK Akademi • Kişisel Gelişim',
          level: 'Her Seviye',
          duration: '8 Saat',
          relatedStep: stepText,
          reason:
            'Kendinizi daha akıcı ifade etmenizi, sosyal ortamlarda liderlik vasıflarınızı ve empati becerinizi güçlendirir.',
          url: 'https://www.btkakademi.gov.tr',
        },
        {
          id: 'fb_pers_2',
          title: 'Atomik Alışkanlıklar ve Kişisel Zaman Yönetimi Ustalığı',
          platform: 'YouTube • Verimlilik Serisi',
          level: 'Her Seviye',
          duration: '2.5 Saat',
          relatedStep: stepText,
          reason:
            'Erteleme huyunu yenmek, günlük rutinleri otomatik hale getirmek ve sürdürülebilir bir disiplin kurmak için rehber.',
          url: 'https://www.youtube.com',
        },
      ];

    case 'FINANCIAL':
      return [
        {
          id: 'fb_fin_1',
          title: 'Gençler İçin Finansal Okuryazarlık, Bütçe ve Birikim Temelleri',
          platform: 'FODER • Ücretsiz Eğitim',
          level: 'Başlangıç',
          duration: '5 Saat',
          relatedStep: stepText,
          reason:
            'Harçlık ve burs yönetimi, tasarruf planlama, enflasyon farkındalığı ve geleceğin akıllı yatırım kararları için temel başucu kursu.',
          url: 'https://www.fo-der.org',
        },
      ];

    default:
      return [
        {
          id: 'fb_gen_1',
          title: `${domainLabel || 'Yaşam Alanı'} Hedeflerinde İlerleme ve Verimlilik Rehberi`,
          platform: 'BTK Akademi & EBA Platformu',
          level: 'Her Seviye',
          duration: '6 Saat Uygulamalı',
          relatedStep: stepText,
          reason:
            'Kanban panonuzdaki adımları eksiksiz tamamlamanız için alanında uzman eğitmenlerden uygulamalı taktik ve rehberlik sağlar.',
          url: 'https://www.btkakademi.gov.tr',
        },
        {
          id: 'fb_gen_2',
          title: 'Hedef Odaklı Zihin Yapısı (Growth Mindset) ve Motivasyon Programı',
          platform: 'YouTube • Eğitim Kampüsü',
          level: 'Her Seviye',
          duration: '3 Saat',
          relatedStep: stepText,
          reason:
            'Zorluklar karşısında pes etmeden istikrarlı ilerlemenizi sağlayan bilimsel motivasyon ve odaklanma yöntemleri.',
          url: 'https://www.youtube.com',
        },
      ];
  }
}
