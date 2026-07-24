/**
 * ROTA Platformu - Merkezi AI Agent Servisi
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
  const baseUrl = (process.env.AI_API_BASE_URL || DEFAULT_AI_BASE_URL).replace(/\/+$/, '');
  const model = process.env.AI_MODEL || DEFAULT_AI_MODEL;
  const endpoint = `${baseUrl}/chat/completions`;

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

  // Markdown kod bloklarını temizle (```json ... ``` veya ``` ... ```)
  let cleanedContent = rawContent
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

/**
 * SMART Hedef Üretim Agent'ı: Öğrencinin isteğini 3 adet somut SMART hedefe dönüştürür.
 */
export async function runSmartGoalsAgent(domain: string, wishText: string): Promise<string[]> {
  const systemPrompt = `Sen Türkiye'deki lise ve üniversite öğrencilerine rehberlik eden uzman bir kariyer ve gelişim koçusun.
Görevin, öğrencinin hayallerini 3 adet SMART hedefe dönüştürmektir.

KURAL:
- Düşünme sürecini (thinking process) yazma veya çok kısa tut.
- SADECE geçerli bir JSON dizisi döndür. Asla ek metin veya markdown yazma.
Örnek Format:
[
  "Önümüzdeki 3 ay boyunca haftada 5 saat çalışarak Python dilinde 2 pratik proje tamamlamak.",
  "Bu dönem sonuna kadar matematik netlerini haftalık etütlerle 4 net artırmak.",
  "6 ay içerisinde hedef yabancı dilde B2 seviyesine ulaşarak 3 kitap okumak."
]`;

  const userPrompt = `Öğrencinin Yaşam Alanı: ${domain}
Öğrencinin İsteği / Hayali: "${wishText}"

Bu istek için tam olarak 3 adet motive edici, ölçülebilir SMART hedef seçeneği oluştur.
SADECE ["hedef 1", "hedef 2", "hedef 3"] biçiminde geçerli bir JSON dizisi döndür.`;

  const result = await runAgentTask<string[]>({
    taskName: 'SmartGoalsPlannerAgent',
    systemPrompt,
    userPrompt,
    temperature: 0.7,
    maxTokens: 4096,
  });

  if (Array.isArray(result) && result.length > 0) {
    return result.map((item) => String(item));
  }

  throw new Error('SmartGoalsPlannerAgent geçerli bir hedef dizisi üretemedi.');
}

/**
 * Eylem Planı Agent'ı: Seçilen SMART hedef için 4 adımlı kronolojik eylem planı üretir.
 */
export async function runActionPlanAgent(domain: string, selectedGoal: string): Promise<ActionStep[]> {
  const systemPrompt = `Sen uzman bir öğrenci koçusun. Öğrencinin seçtiği SMART hedefe ulaşması için 4 adımlı somut ve kronolojik bir eylem planı hazırlarsın.

KURAL:
- Düşünme sürecini (thinking process) yazma veya çok kısa tut.
- SADECE geçerli bir JSON dizisi döndür. Asla ek metin veya açıklama yazma.
Örnek Format:
[
  { "id": "step_1", "text": "Ön Hazırlık: Gerekli kaynakları ve haftalık takvimi oluşturmak." },
  { "id": "step_2", "text": "İlk Adım (1. Hafta): Odaklı çalışma rutinine başlamak." },
  { "id": "step_3", "text": "Gelişim ve Pratik (2.-4. Hafta): İlerlemeyi kaydetmek ve eksikleri gidermek." },
  { "id": "step_4", "text": "Değerlendirme ve Tamamlama: Hedef çıktısını kontrol edip tamamlamak." }
]`;

  const userPrompt = `Yaşam Alanı: ${domain}
Seçilen SMART Hedef: "${selectedGoal}"

Bu hedefe ulaşmak için 4 adımlı kronolojik eylem planı oluştur. Her adım somut ve lise/üniversite öğrencisi için uygulanabilir olsun.
SADECE JSON dizisini döndür.`;

  const result = await runAgentTask<Array<{ id?: string; text: string }>>({
    taskName: 'ActionStepsPlannerAgent',
    systemPrompt,
    userPrompt,
    temperature: 0.7,
    maxTokens: 4096,
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
 * Kurs ve Kaynak Önerileri Agent'ı: Öğrencinin Kanban panosundaki adımlara özel 3 adet kurs/kaynak önerir.
 */
export async function runCourseRecommendationAgent(
  domain: string,
  domainLabel: string,
  inProgressSteps: string[],
  todoSteps: string[]
): Promise<CourseRecommendation[]> {
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

  const systemPrompt = `Sen Türkiye'deki öğrencilere kariyer ve kişisel gelişim rehberliği yapan uzman bir eğitim danışmanısın.
Öğrencinin hedeflerine doğrudan katkı sağlayacak pratik, ücretsiz veya erişilebilir 3 adet kurs/kaynak önerisi sunarsın.

KURAL:
- Düşünme sürecini (thinking process) yazma veya çok kısa tut.
- SADECE geçerli bir JSON dizisi döndür. Başka hiçbir açıklama yazma.
JSON Formatı:
[
  {
    "title": "Kurs veya Kaynak Başlığı",
    "platform": "Platform Adı (örn: BTK Akademi • Ücretsiz Sertifikalı)",
    "level": "Seviye (örn: Başlangıç / Orta Seviye)",
    "duration": "Tahmini Süre (örn: 10 Saat)",
    "relatedStep": "İlişkili Görev",
    "reason": "Bu kursun öğrenciye sağlayacağı faydayı anlatan 1-2 cümlelik açıklama",
    "url": "https://www.btkakademi.gov.tr"
  }
]`;

  const userPrompt = `Öğrencinin Yaşam Alanı: "${domainLabel || domain}"
Öğrencinin Kanban Panosundaki Görevleri:
${stepsPrompt}

Bu öğrenci için TAM OLARAK 3 adet pratik, nitelikli kurs veya kaynak önerisi oluştur.
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
      platform: String(item.platform || 'BTK Akademi & YouTube'),
      level: String(item.level || 'Her Seviye'),
      duration: String(item.duration || 'Esnek Hızlı Eğitim'),
      relatedStep: String(item.relatedStep || inProgressSteps[0] || todoSteps[0] || 'Genel Hedefin'),
      reason: String(item.reason || 'Hedefini daha hızlı gerçekleştirmene katkı sağlar.'),
      url: String(item.url || 'https://www.btkakademi.gov.tr'),
    }));
  }

  throw new Error('CourseRecommendationAgent geçerli bir kurs dizisi üretemedi.');
}
