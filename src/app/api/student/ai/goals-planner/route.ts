import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { domain, wishText, selectedGoal } = await request.json();

    if (!wishText && !selectedGoal) {
      return NextResponse.json({ error: 'İstek veya hedef metni gereklidir' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    // 1. Eğer selectedGoal gönderildiyse bu hedef için adım adım Eylem Planı (Plan Steps) üret
    if (selectedGoal) {
      if (groqApiKey) {
        try {
          const aiSteps = await generateActionStepsWithGroq(groqApiKey, domain, selectedGoal);
          if (aiSteps && aiSteps.length > 0) {
            return NextResponse.json({ steps: aiSteps });
          }
        } catch (groqErr) {
          console.error('Groq Action Steps Error, fallback to rule engine:', groqErr);
        }
      }
      const steps = generateActionStepsFallback(domain, selectedGoal);
      return NextResponse.json({ steps });
    }

    // 2. Eğer sadece wishText gönderildiyse bu istek için 3 adet SMART Hedef (Goal Options) üret
    if (groqApiKey) {
      try {
        const aiGoals = await generateSmartGoalsWithGroq(groqApiKey, domain, wishText);
        if (aiGoals && aiGoals.length > 0) {
          return NextResponse.json({ goals: aiGoals });
        }
      } catch (groqErr) {
        console.error('Groq SMART Goals Error, fallback to rule engine:', groqErr);
      }
    }

    const goals = generateSmartGoalsFallback(domain, wishText);
    return NextResponse.json({ goals });
  } catch (err) {
    console.error('AI Goals Planner error:', err);
    return NextResponse.json({ error: 'Yapay zeka önerileri oluşturulurken hata oluştu.' }, { status: 500 });
  }
}

async function generateSmartGoalsWithGroq(apiKey: string, domain: string, wishText: string): Promise<string[]> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: 'Sen uzman bir lise rehberlik ve kariyer koçusun. Öğrencilerin genel hayallerini ve isteklerini SMART (Spesifik, Ölçülebilir, Ulaşılabilir, İlgili, Zaman Sınırlı) hedeflere dönüştürürsün.\nSADECE geçerli bir JSON dizisi (JSON array string[]) döndüreceksin. Kesinlikle markdown kodu veya açıklama yazma.\nÖrnek format:\n[\n  "Önümüzdeki 3 ay boyunca haftada 5 saat çalışarak hedef alanda 2 pratik proje tamamlamak.",\n  "Bu dönem sonuna kadar deneme sınavlarında matematik netlerini 5 net artırmak.",\n  "6 ay içerisinde hedef yabancı dilde B2 seviyesine ulaşarak 3 kitap okumak."\n]',
        },
        {
          role: 'user',
          content: `Öğrencinin seçtiği yaşam alanı: ${domain}\nÖğrencinin hayali/isteği: "${wishText}"\n\nBu öğrenci için tam olarak 3 adet SMART hedef seçeneği üret. Türkçe olarak, lise öğrencisinin seviyesine uygun, motivasyon sağlayıcı, zaman periyodu ve ölçülebilir kriter barındıran 3 farklı hedef cümlesi olsun.\nSADECE JSON dizisini ["hedef 1", "hedef 2", "hedef 3"] biçiminde döndür.`,
        },
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
    return parsed.map((item) => String(item));
  }

  throw new Error('Groq did not return a valid JSON array');
}

async function generateActionStepsWithGroq(
  apiKey: string,
  domain: string,
  selectedGoal: string
): Promise<Array<{ id: string; text: string }>> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: 'Sen uzman bir lise rehberlik ve kariyer koçusun. Öğrencinin seçtiği SMART hedefe ulaşması için 4 adımlı somut ve uygulanabilir bir eylem planı oluşturursun.\nSADECE geçerli bir JSON dizisi döndüreceksin. Kesinlikle markdown kodu veya açıklama yazma.\nÖrnek format:\n[\n  { "id": "step_1", "text": "Ön Hazırlık: Kaynakları ve haftalık takvimi oluşturmak." },\n  { "id": "step_2", "text": "İlk Adım (1. Hafta): Haftada 3 gün odaklı çalışma rutinine başlamak." },\n  { "id": "step_3", "text": "Gelişim ve Uygulama (2.-4. Hafta): İlerlemeyi kaydetmek ve eksik konuları gidermek." },\n  { "id": "step_4", "text": "Değerlendirme ve Tamamlama: Hedef çıktısını tamamlayıp rehber öğretmene sunmak." }\n]',
        },
        {
          role: 'user',
          content: `Yaşam alanı: ${domain}\nSeçilen SMART Hedef: "${selectedGoal}"\n\nBu hedefe ulaşmak için tam olarak 4 adımlı kronolojik eylem planı oluştur. Her adım lise öğrencisinin uygulayabileceği somut bir görev olsun.\nSADECE JSON dizisini döndür.`,
        },
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
    return parsed.map((item, idx) => ({
      id: item.id || `step_${idx + 1}`,
      text: String(item.text),
    }));
  }

  throw new Error('Groq did not return valid steps JSON array');
}

function generateSmartGoalsFallback(domain: string, wish: string): string[] {
  const w = wish.toLowerCase();

  if (domain === 'CAREER' || domain === 'ACADEMIC') {
    if (w.includes('yazılım') || w.includes('mühendis') || w.includes('bilgisayar') || w.includes('kod')) {
      return [
        'Önümüzdeki 3 ay boyunca haftada 5 saat Python/JavaScript eğitimi alarak 2 pratik portfolyo projesi tamamlamak.',
        'Bu eğitim yılı sonuna kadar SAYISAL puan türünde ilk %15 dilime girmek için matematik netlerini ayda 4 net artırmak.',
        'Bu yaz döneminde teknoloji sektöründeki profesyonellerle veya üniversite kulüpleriyle görüşüp staj/gözlem imkanı bulmak.'
      ];
    }
    if (w.includes('dil') || w.includes('ingilizce') || w.includes('almanca') || w.includes('toefl') || w.includes('ielts')) {
      return [
        '6 ay içinde İngilizce seviyemi B2 düzeyine çıkarmak için her gün 25 kelime öğrenip haftada 2 pratik konuşma yapmak.',
        '3 ay içinde yabancı dilde 3 adet kitap okumak ve İngilizce haber takibini günlük rutine dönüştürmek.',
        'Sömestr tatili sonuna kadar hedef yabancı dil sınavı denemesinde 80+ puan barajına ulaşmak.'
      ];
    }
    if (w.includes('tıp') || w.includes('doktor') || w.includes('sağlık')) {
      return [
        'AYT Fen (Fizik/Kimya/Biyoloji) netlerini 3 ay içinde %20 artırmak amacıyla haftalık 3 branş denemesi çözmek.',
        'YKS çalışma takvimine göre haftalık etüt süresini 24 saat üzerinde sabit tutmak ve düzenli hata defteri tutmak.',
        'Tıp fakültesi hedefine uygun öğrenci koçluğu sisteminde haftalık konu tarama testlerinde %90 başarı yakalamak.'
      ];
    }
    return [
      `Hedefimle ilgili (${wish}) önümüzdeki 6 hafta boyunca haftada en az 8 saat odaklı çalışma gerçekleştirerek ilk ara hedefimi tamamlamak.`,
      `Sezon sonuna kadar hedef alanımda 3 adet kaynak kitabı bitirip haftalık deneme netlerimi kademeli olarak yükseltmek.`,
      `Alanımda uzman 2 kişiyle veya rehber öğretmenimle görüşerek 1 ay içinde kişiye özel yol haritamı somutlaştırmak.`
    ];
  }

  if (domain === 'PERSONAL_DEV') {
    return [
      `3 ay boyunca her sabah 20 dakika okuma yaparak toplamda 6 kişisel gelişim/kültür kitabı tamamlamak.`,
      `Seçtiğim beceri alanında (${wish}) 60 günlük tematik bir çevrimiçi kursu sertifikasıyla tamamlamak.`,
      `Topluluk önünde konuşma ve özgüven becerilerini geliştirmek için okul kulübünde etkin görev üstlenmek.`
    ];
  }

  if (domain === 'SOCIAL') {
    return [
      `İletişim ve sosyal ağları güçlendirmek adına bu dönem 2 yeni sosyal sorumluluk veya öğrenci kulübü projesinde yer almak.`,
      `Haftada en az 1 günü dijital ekrandan uzak aile ve yakın arkadaş iletişimine ayırarak nitelikli sosyal zaman yaratmak.`,
      `Sosyal becerilerimi geliştirmek için ekip çalışmaları gerektiren bir aktiviteye düzenli katılım sağlamak.`
    ];
  }

  if (domain === 'HEALTH') {
    return [
      `Önümüzdeki 3 ay boyunca haftada en az 3 gün 45 dakikalık egzersiz (yürüyüş, spor vb.) rutini uygulamak.`,
      `Günlük uyku süresini en az 7.5 saatte sabitleyerek gece 23:30 öncesi dijital ekranı kapatma alışkanlığı kazanmak.`,
      `Günlük su tüketimini 2.5 litreye çıkarmak ve şekerli atıştırmalıkları haftada 1 günle sınırlamak.`
    ];
  }

  if (domain === 'FINANCIAL') {
    return [
      `Öğrenci bütçemi düzenlemek için aylık harcama tablosu oluşturmak ve her ay harçlığımdan %15 tasarruf etmek.`,
      `Finansal okuryazarlık alanında 2 temel kitap okuyarak birikim ve bütçe yönetimi stratejilerini öğrenmek.`,
      `Üniversite hayatına hazırlık amacıyla aylık sabit gider ile esnek gider dağılımımı optimize etmek.`
    ];
  }

  return [
    `Bu konuda önümüzdeki 30 gün boyunca her gün 25 dakikalık odaklı çalışma periyodu tamamlamak.`,
    `Hedefimle ilgili 3 ay içerisinde net ve ölçülebilir bir çıktı (proje, deneme skoru veya sertifika) elde etmek.`,
    `Rehber öğretmenimle aylık değerlendirme yaparak ilerlememi 4 hafta boyunca kesintisiz raporlamak.`
  ];
}

function generateActionStepsFallback(domain: string, goal: string): Array<{ id: string; text: string }> {
  return [
    {
      id: 'step_1',
      text: `Ön Hazırlık: ${goal.slice(0, 45)}... için gerekli kaynakları, çalışma planını ve zaman çizelgesini netleştir.`
    },
    {
      id: 'step_2',
      text: `İlk Eylem (1. Hafta): Günlük rutine haftada en az 3 periyotluk odaklı çalışma block'u ekleyerek başlangıç yap.`
    },
    {
      id: 'step_3',
      text: `Gelişim ve Pratik (2.-4. Hafta): Hedefteki kilometre taşlarını uygula, oluşan eksikleri tespit et ve not al.`
    },
    {
      id: 'step_4',
      text: `Ölçüm ve Tamamlama: Hedefe ulaşıldığını test et, çıktıyı kontrol ettir ve başarıyı tescil ederek Deneyim Puanını (XP) topla!`
    }
  ];
}
