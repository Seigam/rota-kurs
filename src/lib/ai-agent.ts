/**
 * FutuRoute Platformu - Merkezi AI Agent Servisi
 * 
 * Tüm yapay zeka işlemleri (SMART Hedef Üretimi, Eylem Planı Oluşturma,
 * Kişiselleştirilmiş Kurs/Kaynak Önerileri) bu agent mimarisi üzerinden yürütülür.
 * 
 * Varsayılan API Endpoint: https://dipping-flatterer-enjoyable.ngrok-free.dev/v1
 * Varsayılan Model: qwen/qwen3.5-9b
 */

const DEFAULT_AI_BASE_URL = 'https://dipping-flatterer-enjoyable.ngrok-free.dev/v1';
const DEFAULT_AI_MODEL = 'qwen/qwen3.5-9b';

export interface AgentTaskOptions {
  taskName: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

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

export interface ActionStep {
  id: string;
  text: string;
}

/**
 * Temel AI Agent Motoru: Ngrok/OpenAI uyumlu endpoint'e istek gönderir ve yanıtı işler.
 */
export async function runAgentTask<T = any>(options: AgentTaskOptions): Promise<T> {
  // Eğer .env dosyasında tam API URL'si tanımlıysa onu kullan,
  // tanımlı değilse geriye dönük uyumluluk için BASE_URL üzerinden hesapla.
  let endpoint = process.env.AI_API_URL;
  
  if (!endpoint) {
    const baseUrl = (process.env.AI_API_BASE_URL || DEFAULT_AI_BASE_URL).replace(/\/+$/, '');
    endpoint = `${baseUrl}/chat/completions`;
  }
  
  const model = process.env.AI_MODEL || DEFAULT_AI_MODEL;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  if (process.env.AI_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.AI_API_KEY}`;
  }

  const payload = {
    model,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 3072,
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt },
    ],
  };

  console.log(`[AI Agent - ${options.taskName}] Model: ${model} | Endpoint: ${endpoint}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`AI Agent API hatası (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const messageObj = data?.choices?.[0]?.message;
  let rawContent = String(messageObj?.content || '').trim();

  // Eğer content boşsa ama reasoning_content içeriyorsa oradan metin al
  if (!rawContent && messageObj?.reasoning_content) {
    rawContent = String(messageObj.reasoning_content).trim();
  }

  if (!rawContent) {
    throw new Error(`[AI Agent - ${options.taskName}] Model boş yanıt döndürdü.`);
  }

  // DeepSeek-R1 gibi reasoning modellerinin <think> ... </think> veya 'Thinking Process:' bloklarını temizle
  let cleanedContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  cleanedContent = cleanedContent.replace(/^Thinking Process:[\s\S]*?(?=\[|\{)/i, '').trim();

  // Markdown kod bloklarını temizle (```json ... ``` veya ``` ... ```)
  cleanedContent = cleanedContent
    .replace(/^```[a-z]*\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // 1. Doğrudan JSON parse dene
  try {
    return JSON.parse(cleanedContent) as T;
  } catch (err) {
    // 2. Metin içinde JSON array [...] veya JSON object {...} ara
    const arrayMatch = cleanedContent.match(/\[\s*[\s\S]*\s*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch (e) {
        // Devam et
      }
    }

    const objectMatch = cleanedContent.match(/\{\s*[\s\S]*\s*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
      } catch (e) {
        // Devam et
      }
    }

    throw new Error(`[AI Agent - ${options.taskName}] Yanıt geçerli bir JSON'a dönüştürülemedi: ${cleanedContent.slice(0, 300)}...`);
  }
}

import { prisma } from '@/lib/prisma';

export interface StudentContext {
  grade?: number;
  schoolName?: string;
  targetCareer?: string;
  hobbies?: string;
  favoriteSubjects?: string;
  mbtiType?: string;
  enneagramType?: string | number;
  enneagramWing?: string | number;
  personalitySummary?: string;
  strengths?: string;
  recommendedTrack?: string;
  topValues?: string[];
}

export async function fetchStudentContext(userId: string): Promise<StudentContext | undefined> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        personalityResult: true,
        valueRankings: {
          include: { valueItem: true },
          orderBy: { rankOrder: 'asc' },
          take: 5,
        },
      },
    });

    if (!profile) return undefined;

    const topValues = profile.valueRankings
      ?.map((vr: any) => vr.valueItem?.title || vr.valueItemId)
      .filter(Boolean);

    return {
      grade: profile.grade ?? undefined,
      schoolName: profile.schoolName ?? undefined,
      targetCareer: profile.targetCareer ?? undefined,
      hobbies: profile.hobbies ?? undefined,
      favoriteSubjects: profile.favoriteSubjects ?? undefined,
      mbtiType: profile.personalityResult?.mbtiType ?? undefined,
      enneagramType: profile.personalityResult?.dominantEnneagram || profile.personalityResult?.enneagramType || undefined,
      enneagramWing: profile.personalityResult?.wingEnneagram || profile.personalityResult?.enneagramWing || undefined,
      personalitySummary: profile.personalityResult?.summary ?? undefined,
      strengths: profile.personalityResult?.strengths ?? undefined,
      recommendedTrack: profile.personalityResult?.recommendedTrack ?? undefined,
      topValues: topValues?.length ? topValues : undefined,
    };
  } catch (err) {
    console.error('fetchStudentContext hatası:', err);
    return undefined;
  }
}

export function formatStudentContextPrompt(studentContext?: StudentContext): string {
  if (!studentContext) return '';

  const parts: string[] = [];

  if (studentContext.grade) parts.push(`- Sınıf Seviyesi: ${studentContext.grade}. Sınıf`);
  if (studentContext.targetCareer) parts.push(`- Hedef Kariyer / Meslek: ${studentContext.targetCareer}`);
  if (studentContext.favoriteSubjects) parts.push(`- Sevdiği Dersler: ${studentContext.favoriteSubjects}`);
  if (studentContext.hobbies) parts.push(`- İlgi Alanları & Hobiler: ${studentContext.hobbies}`);

  if (studentContext.mbtiType || studentContext.enneagramType) {
    let personalityStr = '- Kişilik Testi Analizi: ';
    if (studentContext.mbtiType) personalityStr += `MBTI Tipi: ${studentContext.mbtiType} `;
    if (studentContext.enneagramType) {
      personalityStr += `| Enneagram Tipi: ${studentContext.enneagramType}`;
      if (studentContext.enneagramWing) personalityStr += `w${studentContext.enneagramWing}`;
    }
    parts.push(personalityStr);
  }

  if (studentContext.personalitySummary) {
    parts.push(`- Kişilik Mizacı ve Karakter Özeti: "${studentContext.personalitySummary}"`);
  }
  if (studentContext.strengths) {
    parts.push(`- Güçlü Yönleri: ${studentContext.strengths}`);
  }
  if (studentContext.recommendedTrack) {
    parts.push(`- Önerilen Çalışma Yolu: ${studentContext.recommendedTrack}`);
  }

  if (studentContext.topValues && studentContext.topValues.length > 0) {
    parts.push(`- Önem Verdiği Temel Değerler: ${studentContext.topValues.join(', ')}`);
  }

  if (parts.length === 0) return '';

  return `\n\n--- ÖĞRENCİ PROFIİLİ VE KİŞİLİK ANALİZİ ---\n${parts.join('\n')}\nÖNEMLİ: Yukarıdaki kişilik yapısını (MBTI/Enneagram), öğrenme mizaçlarını ve kişisel değerlerini göz önüne alarak, doğrudan bu öğrencinin karakterine ve seviyesine özel uyarlanmış öneriler üret.`;
}

/**
 * Gelişim ve Yol Haritası Hedef Ajanı:
 * Öğrencinin genel hayalini; mizaç, kişilik analizi (MBTI/Enneagram), değerler ve sınıf seviyesine uygun 3 somut gelişim hedefine dönüştürür.
 */
export async function runSmartGoalsAgent(
  domain: string,
  wishText: string,
  userIdOrContext?: string | StudentContext
): Promise<string[]> {
  let contextObj: StudentContext | undefined;
  if (typeof userIdOrContext === 'string') {
    contextObj = await fetchStudentContext(userIdOrContext);
  } else {
    contextObj = userIdOrContext;
  }

  const contextPrompt = formatStudentContextPrompt(contextObj);

  const systemPrompt = `Sen Türkiye'deki lise ve üniversite gençlerine psikolojik, pedagojik ve kariyer gelişim danışmanlığı sunan kıdemli bir Uzman Öğrenci ve Kariyer Danışmanısın.

GÖREVİN:
Öğrencinin ifade ettiği genel arzuları ve hayalleri; öğrencinin akademik arka planına, kişilik mizaç yapısına (MBTI ve Enneagram analizi), ilgi alanlarına ve değerler sıralamasına tam uyumlu, somut, net, zamana bağlı ve motive edici 3 adet gelişim hedefine dönüştürmektir.

UZMANLIK VE REHBERLİK İLKELERİN:
1. "SMART hedef" veya jargon terimler kullanma. Hedefler son derece anlaşılır, ilham verici ve net Türkçe ile kaleme alınmalıdır.
2. Öğrencinin mizaç özelliklerini (Analitik, Sosyal, Uygulamacı, Araştırmacı vb.) dikkate alarak onun içsel motivasyonunu artıracak özgün ifadeler seç.
3. Sınıf seviyesine uygun gerçekçi beklentiler belirle.

ÇIKTI KURALI:
- Düşünme sürecini (thinking process) yanıta yazma.
- SADECE ve SADECE geçerli bir JSON dizisi (Array of strings) döndür. Asla açıklama metni veya markdown kod bloğu ekleme.
Örnek Format:
[
  "Önümüzdeki 3 ay boyunca haftada 5 saat odaklı çalışarak Python dilinde 2 pratik portfolyo projesi tamamlamak.",
  "Bu dönem sonına kadar matematik netlerimi haftalık branş etütleriyle kademeli olarak 4 net artırmak.",
  "6 ay içerisinde hedef yabancı dilde B2 seviyesine ulaşarak 3 tematik eser okumak."
]`;

  const userPrompt = `Öğrencinin Odaklandığı Yaşam Alanı: ${domain}
Öğrencinin İfade Ettiği Arzu / Hayal: "${wishText}"${contextPrompt}

Bu istek ve öğrenci kişilik profili için tam olarak 3 adet motive edici, net, ölçülebilir ve öğrencinin karakter yapısına uygun gelişim hedefi seçeneği oluştur.
SADECE ["hedef 1", "hedef 2", "hedef 3"] biçiminde geçerli bir JSON dizisi döndür.`;

  const result = await runAgentTask<string[]>({
    taskName: 'GoalsPlannerAgent',
    systemPrompt,
    userPrompt,
    temperature: 0.7,
    maxTokens: 3072,
  });

  if (Array.isArray(result) && result.length > 0) {
    return result.map((item) => String(item));
  }

  throw new Error('GoalsPlannerAgent geçerli bir hedef dizisi üretemedi.');
}

/**
 * Eylem ve Rutin Planlayıcı Ajan:
 * Seçilen gelişim hedefi için öğrencinin kişiliğine ve mizaç yapısına uygun 4 adımlı kronolojik eylem planı üretir.
 */
export async function runActionPlanAgent(
  domain: string,
  selectedGoal: string,
  userIdOrContext?: string | StudentContext
): Promise<ActionStep[]> {
  let contextObj: StudentContext | undefined;
  if (typeof userIdOrContext === 'string') {
    contextObj = await fetchStudentContext(userIdOrContext);
  } else {
    contextObj = userIdOrContext;
  }

  const contextPrompt = formatStudentContextPrompt(contextObj);

  const systemPrompt = `Sen gençlerin hedeflerine ulaşmasında alışkanlık kazandırma, zaman yönetimi ve öğrenme stratejileri uzmanı olan Kıdemli Öğrenci Koçusun.

GÖREVİN:
Öğrencinin seçtiği gelişim hedefini, onun öğrenme stiline, mizaç özelliklerine (MBTI/Enneagram) ve seviyesine uygun 4 adımlı, mantıksal ve kronolojik bir uygulama planına bölmektir.

UZMANLIK VE REHBERLİK İLKELERİN:
1. Adımlar sırasıyla şu mantıksal Akışı izlemelidir:
   - 1. Adım: Ön Hazırlık & Planlama (Kaynak tespiti, takvim oluşturma, altyapı hazırlığı)
   - 2. Adım: İlk Eylem & Rutin Kurma (Haftalık çalışma alışkanlığı başlatma)
   - 3. Adım: Derinleşme & Pratik (Konu taramaları, proje geliştirme, eksik giderme)
   - 4. Adım: Ölçüm, Değerlendirme & Tamamlama (Çıktıyı test etme, başarıyı tescilleme)
2. Öğrencinin kişilik analizinde öne çıkan güçlü yönlerini adımlara yansıt.
3. Metinler net, heyecan verici ve öğrenciyi doğrudan eyleme geçiren bir dille yazılmalıdır.

ÇIKTI KURALI:
- Düşünme sürecini yanıta dahil etme.
- SADECE ve SADECE geçerli bir JSON dizisi döndür. Asla ek açıklama yapma.
Örnek Format:
[
  { "id": "step_1", "text": "Ön Hazırlık: Çalışma kaynaklarını ve haftalık odak takvimini netleştirmek." },
  { "id": "step_2", "text": "İlk Eylem (1. Hafta): Odaklı çalışma rutinine düzenli periyotlarla başlamak." },
  { "id": "step_3", "text": "Gelişim ve Pratik (2.-4. Hafta): İlerlemeyi kaydedip eksik noktaları pekiştirmek." },
  { "id": "step_4", "text": "Ölçüm ve Tamamlama: Hedef çıktısını değerlendirip başarıyı tescil etmek." }
]`;

  const userPrompt = `Odak Yaşam Alanı: ${domain}
Seçilen Gelişim Hedefi: "${selectedGoal}"${contextPrompt}

Bu hedefe ulaşmak için öğrenciye özel 4 adımlı kronolojik eylem planı oluştur. Her adım somut, motive edici ve uygulanabilir olsun.
SADECE JSON dizisini döndür.`;

  const result = await runAgentTask<Array<{ id?: string; text: string }>>({
    taskName: 'ActionStepsPlannerAgent',
    systemPrompt,
    userPrompt,
    temperature: 0.7,
    maxTokens: 3072,
  });

  if (Array.isArray(result) && result.length > 0) {
    return result.map((item, idx) => ({
      id: item.id || `step_${idx + 1}`,
      text: String(item.text),
    }));
  }

  throw new Error('ActionStepsPlannerAgent geçerli eylem adımları dizisi üretemedi.');
}

/**
 * Kişiselleştirilmiş Eğitim ve Kaynak Öneri Ajanı:
 * Platformun gerçek ders ve mikroyeterlilik kataloğundan öğrencinin
 * gelişim adımlarına, kişilik yapısına ve hedef alanına en uygun
 * kaynakları seçip eşleştirme gerekçesiyle birlikte sunar.
 */
export async function runCourseRecommendationAgent(
  domain: string,
  domainLabel: string,
  inProgressSteps: string[],
  todoSteps: string[],
  userIdOrContext?: string | StudentContext,
  catalogContext?: string
): Promise<CourseRecommendation[]> {
  let contextObj: StudentContext | undefined;
  if (typeof userIdOrContext === 'string') {
    contextObj = await fetchStudentContext(userIdOrContext);
  } else {
    contextObj = userIdOrContext;
  }

  const contextPrompt = formatStudentContextPrompt(contextObj);

  const stepsPrompt = [
    inProgressSteps.length > 0
      ? `Şu An Odaklanılan Adımlar: ${inProgressSteps.join(', ')}`
      : '',
    todoSteps.length > 0
      ? `Gelecek Plan Adımları: ${todoSteps.join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const hasCatalog = catalogContext && catalogContext.trim().length > 0;

  const systemPrompt = `Sen öğrencilerin ilgi alanları, kişilik yapıları ve öğrenme gereksinimlerine göre en doğru eğitim kaynaklarını eşleştiren Kıdemli Eğitim Teknolojileri ve Kaynak Danışmanısın.

GÖREVİN:
${hasCatalog
      ? `Sana verilen platform ders ve mikroyeterlilik kataloğundan, öğrencinin üzerinde çalıştığı gelişim adımlarına ve kişilik mizacına (MBTI/Enneagram) en uygun kaynakları seç ve eşleştirme gerekçesini yaz. Katalogda yer alan dersleri önceliklendir; yalnızca hiçbir ders uygun değilse dışarıdan öneri yapabilirsin.`
      : `Öğrencinin üzerinde çalıştığı gelişim adımlarına ve kişilik mizacına (MBTI/Enneagram) doğrudan katkı sunacak pratik, nitelikli ve erişilebilir eğitim/kurs kaynakları öner.`
    }

UZMANLIK VE REHBERLİK İLKELERİN:
1. Önerilen her kaynak için "reason" alanında, kaynağın öğrencinin mizaç özelliklerine ve mevcut gelişim adımına nasıl destek sağlayacağını 1-2 samimi cümle ile açıkla.
2. Seviye ve süre bilgilerini öğrencinin sınıf düzeyine uygun şekilde belirle.
3. Gerekli gördüğün kadar kaynak sun — sayı konusunda bir kısıtlama yoktur; öğrencinin gerçekten faydalanabileceği her kaynağı dahil et.
${hasCatalog ? '4. Platforma ait dersler için "platform" alanına "Rota Kurs Platformu" yaz.' : ''}

ÇIKTI KURALI:
- Düşünme sürecini yanıta dahil etme.
- SADECE geçerli bir JSON dizisi döndür. Başka hiçbir açıklama veya metin yazma.
JSON Formatı:
[
  {
    "title": "Ders veya Kaynak Başlığı",
    "platform": "Platform Adı (örn: Rota Kurs Platformu veya BTK Akademi • Ücretsiz)",
    "level": "Seviye (örn: Başlangıç / Orta Seviye)",
    "duration": "Tahmini Süre (örn: 8 Saat)",
    "relatedStep": "İlişkili Gelişim Adımı",
    "reason": "Bu kaynağın öğrencinin kişilik yapısına ve hedefine sağlayacağı faydayı anlatan 1-2 cümle",
    "url": "/student/programs"
  }
]`;

  const catalogSection = hasCatalog
    ? `${catalogContext}\n\nYukarıdaki katalogdan uygun dersleri seç. Katalogda bulunmayan ancak kritik öneme sahip bir kaynak varsa onu da ekleyebilirsin.`
    : '';

  const userPrompt = `Öğrencinin Yaşam Alanı: "${domainLabel || domain}"
Öğrencinin Gelişim Panosundaki Görevleri:
${stepsPrompt}${contextPrompt}
${catalogSection}

Öğrencinin hedeflerine ve kişilik yapısına en uygun ders ve kaynakları seç. Kaç tane gerekli görüyorsan o kadar öner.
SADECE geçerli JSON dizisini döndür.`;

  const result = await runAgentTask<any[]>({
    taskName: 'CourseRecommendationAgent',
    systemPrompt,
    userPrompt,
    temperature: 0.7,
    maxTokens: 4096,
  });

  if (Array.isArray(result) && result.length > 0) {
    return result.map((item, index) => ({
      id: `ai_course_${index + 1}_${Date.now()}`,
      title: String(item.title || 'Gelişim Rehberi ve Uygulamalı Kurs'),
      platform: String(item.platform || 'Rota Kurs Platformu'),
      level: String(item.level || 'Her Seviye'),
      duration: String(item.duration || 'Esnek'),
      relatedStep: String(item.relatedStep || inProgressSteps[0] || todoSteps[0] || 'Genel Hedefin'),
      reason: String(item.reason || 'Hedefine ulaşmana destek sağlar.'),
      url: String(item.url || '/student/programs'),
    }));
  }

  throw new Error('CourseRecommendationAgent geçerli bir kurs dizisi üretemedi.');
}
