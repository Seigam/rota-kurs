import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // 1. Eğer selectedGoal gönderildiyse bu hedef için adım adım Eylem Planı (Plan Steps) üret
    if (selectedGoal) {
      const steps = generateActionSteps(domain, selectedGoal);
      return NextResponse.json({ steps });
    }

    // 2. Eğer sadece wishText gönderildiyse bu istek için 3 adet SMART Hedef (Goal Options) üret
    const goals = generateSmartGoals(domain, wishText);
    return NextResponse.json({ goals });
  } catch (err) {
    console.error('AI Goals Planner error:', err);
    return NextResponse.json({ error: 'Yapay zeka önerileri oluşturulurken hata oluştu.' }, { status: 500 });
  }
}

function generateSmartGoals(domain: string, wish: string): string[] {
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

function generateActionSteps(domain: string, goal: string): Array<{ id: string; text: string }> {
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
