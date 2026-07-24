import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, FamilyRelation, EntryType, LifeDomain } from '@prisma/client';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Veritabanı tohumlama (seed) işlemi başlatılıyor...');

  // Eğer veritabanı doluysa ve FORCE_SEED istenmemişse seed işlemini atla (Vercel deploy'larda verileri koru)
  const userCount = await prisma.user.count();
  if (userCount > 0 && process.env.FORCE_SEED !== 'true') {
    console.log('✅ Veritabanında zaten veriler mevcut. Seed işlemi atlanıyor. (Yeniden kurmak için FORCE_SEED=true yapabilirsiniz)');
    return;
  }

  // 1. Temel Verileri Temizle
  await prisma.testAnswer.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.rpgChoice.deleteMany();
  await prisma.rpgScene.deleteMany();
  await prisma.rpgScenario.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.favoriteProgram.deleteMany();
  await prisma.careerProgram.deleteMany();
  await prisma.valueRanking.deleteMany();
  await prisma.valueItem.deleteMany();
  await prisma.lifeDomainEntry.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.counselorNote.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();

  // 2. Okul ve Sınıf Gruplarını Oluştur
  const school = await prisma.school.create({
    data: {
      name: 'Atatürk Fen Lisesi',
      city: 'İstanbul',
    },
  });

  const class11A = await prisma.classGroup.create({
    data: {
      schoolId: school.id,
      grade: 11,
      section: 'A',
    },
  });

  const class11B = await prisma.classGroup.create({
    data: {
      schoolId: school.id,
      grade: 11,
      section: 'B',
    },
  });

  // 3. Kullanıcıları (Admin, Öğretmen, Öğrenciler) Oluştur
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const teacherPasswordHash = await bcrypt.hash('ogretmen123', 10);
  const student1PasswordHash = await bcrypt.hash('ogrenci123', 10);
  const student2PasswordHash = await bcrypt.hash('zeynep123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@okul.edu.tr',
      name: 'Sistem Yöneticisi',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: 'ogretmen@okul.edu.tr',
      name: 'Ayşe Rehber',
      passwordHash: teacherPasswordHash,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          classGroups: {
            connect: [{ id: class11A.id }, { id: class11B.id }],
          },
        },
      },
    },
  });

  const studentUser1 = await prisma.user.create({
    data: {
      email: 'ogrenci@okul.edu.tr',
      name: 'Ali Yılmaz',
      passwordHash: student1PasswordHash,
      role: Role.STUDENT,
      profile: {
        create: {
          classGroupId: class11A.id,
          birthYear: 2008,
          familyMembers: {
            create: [
              { relation: FamilyRelation.ANNE, age: 43, occupation: 'Öğretmen', note: 'Eğitime çok önem veriyor' },
              { relation: FamilyRelation.BABA, age: 46, occupation: 'Mühendis', note: 'Teknolojiye meraklı' },
              { relation: FamilyRelation.KARDES, age: 14, occupation: 'Öğrenci', note: 'Lise 1' },
            ],
          },
          lifeDomainEntries: {
            create: [
              { domain: LifeDomain.ACTIVITIES, entryType: EntryType.PLAN, text: 'Bu dönem robotik kulübünün projesini bitirmek.' },
              { domain: LifeDomain.ACTIVITIES, entryType: EntryType.HEDEF, text: 'Ulusal bilim yarışmasında dereceye girmek.' },
              { domain: LifeDomain.FINANCIAL, entryType: EntryType.ISTEK, text: 'Üniversitede tam burslu okuyabilmek ve kendi girişimimi kurmak.' },
              { domain: LifeDomain.HEALTH, entryType: EntryType.PLAN, text: 'Haftada en az 3 gün koşu ve fitness yapmak.' },
              { domain: LifeDomain.SOCIAL, entryType: EntryType.HEDEF, text: 'İngilizce ve İspanyolcayı akıcı şekilde konuşarak uluslararası arkadaşlıklar kurmak.' },
            ],
          },
        },
      },
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'zeynep@okul.edu.tr',
      name: 'Zeynep Kaya',
      passwordHash: student2PasswordHash,
      role: Role.STUDENT,
      profile: {
        create: {
          classGroupId: class11A.id,
          birthYear: 2008,
        },
      },
    },
  });

  // 4. Değerler Havuzunu (ValueItem) Oluştur
  const valuesData = [
    { label: 'Kariyer / meslekte başarı', description: 'Seçtiğim alanda en iyisi olmak ve yüksek uzmanlık kazanmak.', displayOrder: 1 },
    { label: 'Gelir ve maddi güvence', description: 'Gelecekte ekonomik kaygı duymadan konforlu bir yaşam sürmek.', displayOrder: 2 },
    { label: 'Aile', description: 'Aileme zaman ayırmak ve onların gurur duyacağı bir hayat kurmak.', displayOrder: 3 },
    { label: 'Arkadaşlık ve sosyal ilişkiler', description: 'Güçlü sosyal bağlar, samimi dostluklar ve takım ruhu yaşamak.', displayOrder: 4 },
    { label: 'Tanınma / takdir edilme', description: 'Yaptığım işlerle toplumsal takdir ve saygınlık kazanmak.', displayOrder: 5 },
    { label: 'Bağımsızlık', description: 'Kendi kararlarımı alabilmek, esnek çalışma biçimlerine sahip olmak.', displayOrder: 6 },
    { label: 'Başkalarına katkı sağlama', description: 'Topluma, çevreye ve ihtiyaç sahiplerine doğrudan yardım etmek.', displayOrder: 7 },
    { label: 'Etikler / ilkeler', description: 'Adalet, dürüstlük ve ahlaki değerlerden ödün vermeden yaşamak.', displayOrder: 8 },
    { label: 'Mücadele ve risk almak', description: 'Zorluklarla yüzleşmek, girişimcilik ve yeni sınırlar keşfetmek.', displayOrder: 9 },
    { label: 'Yaratıcılık', description: 'Sanat, tasarım veya inovasyon ile yepyeni fikirler hayata geçirmek.', displayOrder: 10 },
    { label: 'İstikrar / güvenlik', description: 'Öngörülebilir, düzenli ve riski düşük bir kariyer rotasında ilerlemek.', displayOrder: 11 },
    { label: 'Coğrafi yerleşim', description: 'İstediğim şehirde, doğayla iç içe veya yurtdışında yaşama özgürlüğü.', displayOrder: 12 },
  ];

  for (const v of valuesData) {
    await prisma.valueItem.create({ data: v });
  }

  // 5. RPG Senaryosu ve Sahneleri Oluştur (Geleceğe Dönüş: Zaman Yolculuğu Kişilik Tanıma)
  const scenario = await prisma.rpgScenario.create({
    data: {
      title: 'Geleceğe Dönüş: Zaman Yolculuğu Kişilik Tanıma Senaryosu',
      version: '2.0',
      isActive: true,
      description: 'Zaman makinesi CHRON-X 3000 ile 8 aşamalı bir zaman yolculuğuna çıkıyorsun. Kriz ve karar anlarında verdiğin yanıtlar senin MBTI kişilik tipini ve Enneagram temel motivasyonunu ortaya çıkarıyor.',
    },
  });

  const scenesData = [
    {
      order: 1,
      title: 'Laboratuvar Çağrısı',
      narrativeText: 'Gecenin karanlığında, eski bir garajın önündesin. Kapının altından sızan turuncu ışık ve elektrik vızıltısı eşliğinde Profesör sesleniyor:\n"Gelecek tehlikede! Onu kurtarabilecek tek kişi sensin. Bugün çok yorucu bir gün geçirdin, zihnin dolu ve enerjin tükenmiş. Akşamı nasıl geçirirdin?"',
      sceneType: 'STORY',
      bgImage: '/images/rpg/soru1.png',
      choices: [
        {
          choiceText: 'Sosyal Odak: Arkadaşlarımı arardım - birlikte bir şeyler yapalım ya da vakit geçirelim. İnsanlar arasında olmak bana enerji verir.',
          mbtiWeights: JSON.stringify({ E: 3 }),
          enneagramWeights: JSON.stringify({ '2': 1, '7': 1 }),
        },
        {
          choiceText: 'İçsel Odak: Oturduğum yerde kalır, müzik açar, okur ya da sessizlikte dinlenirdim. Kendi başıma olmak beni şarj eder.',
          mbtiWeights: JSON.stringify({ I: 3 }),
          enneagramWeights: JSON.stringify({ '5': 1, '9': 1 }),
        },
      ],
    },
    {
      order: 2,
      title: 'Kontrol Paneli',
      narrativeText: 'Profesör seni CHRON-X 3000 zaman makinesinin yanına çekiyor. Kontrol panelindeki hologram haritada olasılıklar ve zaman çizgileri parıldıyor:\n"Geleceğini anlamak için bu haritayı okuman gerekecek. Sana bu haritayı ilk kez gösteriyorum, gözlerin nereye gidiyor?"',
      sceneType: 'DECISION',
      bgImage: '/images/rpg/soru2.png',
      choices: [
        {
          choiceText: 'Somut Veriler: "2031 - %73 - 4.2 yıl" gibi rakamlar ve tarihleri teker teker çözer, net verileri okumaya çalışırdım.',
          mbtiWeights: JSON.stringify({ S: 3 }),
          enneagramWeights: JSON.stringify({ '1': 1, '6': 1 }),
        },
        {
          choiceText: 'Büyük Resim: Tüm noktaların birbirine nasıl bağlandığına, genel örüntüye ve "bu bana ne söylüyor" sorusuna bakardım.',
          mbtiWeights: JSON.stringify({ N: 3 }),
          enneagramWeights: JSON.stringify({ '4': 1, '7': 1 }),
        },
      ],
    },
    {
      order: 3,
      title: 'İki Yol Ayrımı',
      narrativeText: 'Makinenin içinde iki büyük ekran açılıyor: Sol ekranda istatistikler ve hesaplamalar, sağ ekranda ise gerçek insanların hikayeleri ve duygusal anları var:\n"Gelecekteki bir anda seçim yapman gerekiyor: Çok daha fazla insana fayda sağlayan ama sana yakın birini üzecek bir karar mı, yoksa yakınındakini mutlu eden ama genel faydası daha az bir karar mı? Hangi soru aklına ilk geliyor?"',
      sceneType: 'DECISION',
      bgImage: '/images/rpg/soru3.png',
      choices: [
        {
          choiceText: 'Analitik Analiz: "Rakamlar ne diyor? Hangisi gerçekten daha fazla kişiye fayda sağlıyor, bunu objektif olarak analiz etmem gerekir."',
          mbtiWeights: JSON.stringify({ T: 3 }),
          enneagramWeights: JSON.stringify({ '5': 1, '3': 1 }),
        },
        {
          choiceText: 'Empati ve Değerler: "Bu kararı verecek olan insanlar nasıl hissedecek? Kim ne kadar etkilenecek, ilişkilerim ve değerlerim ne diyor?"',
          mbtiWeights: JSON.stringify({ F: 3 }),
          enneagramWeights: JSON.stringify({ '2': 1, '9': 1 }),
        },
      ],
    },
    {
      order: 4,
      title: 'Kalkış Anı',
      narrativeText: 'Makine ısınmaya başlıyor, geri sayım sayacı çalışıyor: 2:47... 2:46...\nProfesör sana bir Görev Kiti uzatarak soruyor:\n"Kalkışa az kaldı! Sana bu kit verildi; yola çıkmadan önce her adımı planlar mısın, yoksa kiti alıp yola çıkıp yolda ne çıkarsa ona göre mi hareket edersin?"',
      sceneType: 'DECISION',
      bgImage: '/images/rpg/soru4.png',
      choices: [
        {
          choiceText: 'Sistematik Plan: "Önce planlamam gerekiyor." Bir kağıt çıkarır, gideceğim noktaları, zamanlamaları ve olası sorunları listeler, sonra yola çıkardım.',
          mbtiWeights: JSON.stringify({ J: 3 }),
          enneagramWeights: JSON.stringify({ '1': 1, '6': 1 }),
        },
        {
          choiceText: 'Esnek Adaptasyon: "Yolda çözerim." Kiti alır, makinenin içine atlardım - doğru soru, gidince ortaya çıkar zaten.',
          mbtiWeights: JSON.stringify({ P: 3 }),
          enneagramWeights: JSON.stringify({ '7': 1, '8': 1 }),
        },
      ],
    },
    {
      order: 5,
      title: 'Zaman Tünelinde',
      narrativeText: 'Makine zaman tünelinde hızlanıyor. Etrafın parlak ışıklarla kaplanıyor.\nProfesörün sesi yankılanıyor:\n"Geleceğe baktığında - yıllar sonrasına - seni en çok rahatsız eden, derinlerde çekindiğin durum hangisidir?"',
      sceneType: 'DECISION',
      bgImage: '/images/rpg/soru5.png',
      choices: [
        {
          choiceText: 'Dürüstlük Kaygısı: Yanlış bir şey yapıp pişman olmak ya da başkaları tarafından yanlış / ilkesiz bulunmak.',
          mbtiWeights: JSON.stringify({ J: 1 }),
          enneagramWeights: JSON.stringify({ '1': 3, '6': 1 }),
        },
        {
          choiceText: 'Bilgisizlik Kaygısı: Anlayamadığım, hazırlıksız olduğum ve kontrol edemediğim karmaşık şeylerle baş başa kalmak.',
          mbtiWeights: JSON.stringify({ T: 1 }),
          enneagramWeights: JSON.stringify({ '5': 3, '6': 2 }),
        },
        {
          choiceText: 'Çatışma Kaygısı: Çatışma, gerilim ya da çevremdeki huzurun ve dengenin bozulması.',
          mbtiWeights: JSON.stringify({ F: 1 }),
          enneagramWeights: JSON.stringify({ '9': 3, '2': 1 }),
        },
        {
          choiceText: 'Başarısızlık Kaygısı: Başarısız olmak, sıradan kalmak ya da çabalarımın karşılıksız kalması.',
          mbtiWeights: JSON.stringify({ E: 1 }),
          enneagramWeights: JSON.stringify({ '3': 3, '8': 1 }),
        },
      ],
    },
    {
      order: 6,
      title: 'İlk Durak: Geleceğin Şehri',
      narrativeText: '2035 yılına vardın! Yüksek binalar, ışıklar ve hareketli bir şehir.\nProfesör telefondan bağlanıyor:\n"Bu şehirde 1 saat boyunca tamamen özgürsün. Hiçbir kural veya görev yok. Bir saatin sonunda seni en çok tatmin edecek şey ne olurdu?"',
      sceneType: 'DECISION',
      bgImage: '/images/rpg/soru6.png',
      choices: [
        {
          choiceText: 'Özgün Keşif: Bir köşeye çekilir, bu şehrin kendime özgü bir yanını, kimsenin fark etmediği bir detayı keşfeder, kendi deneyimimi yaşardım.',
          mbtiWeights: JSON.stringify({ I: 1, N: 1 }),
          enneagramWeights: JSON.stringify({ '4': 3 }),
        },
        {
          choiceText: 'Fayda ve Yardım: Birinin yardıma ihtiyacı olup olmadığına bakardım - biri için faydalı olmak beni en çok tatmin eder.',
          mbtiWeights: JSON.stringify({ F: 1 }),
          enneagramWeights: JSON.stringify({ '2': 3 }),
        },
        {
          choiceText: 'Başarı ve Hedef: Burada ne yapılabilir, neye ulaşılabilir diye düşünür, bir şeyi başarmak için planlamaya başlardım.',
          mbtiWeights: JSON.stringify({ T: 1, J: 1 }),
          enneagramWeights: JSON.stringify({ '3': 3 }),
        },
        {
          choiceText: 'Serüven ve Deneyim: Her yere girer, her şeyi dener, bu şehrin sunduğu tüm renkli deneyimleri yaşamaya çalışırdım.',
          mbtiWeights: JSON.stringify({ E: 1, P: 1 }),
          enneagramWeights: JSON.stringify({ '7': 3 }),
        },
      ],
    },
    {
      order: 7,
      title: 'Tehlike Anı',
      narrativeText: 'Aniden alarm sesleri yükseliyor! CHRON-X\'te bir devre yandı.\nProfesör gergin bir sesle söylüyor:\n"Seni 2026\'ya döndüremeyebilirim! Sakin ol ve bana söyle: Böyle beklenmedik, kontrolden çıkan bir kriz anında içgüdüsel olarak ne yaparsın?"',
      sceneType: 'DECISION',
      bgImage: '/images/rpg/soru7.png',
      choices: [
        {
          choiceText: 'Liderlik ve İnisiyatif: Kontrolü ele alırım. Durumu anlamak için harekete geçer, kimin ne yapması gerektiğini belirler, çözümü üstlenirim.',
          mbtiWeights: JSON.stringify({ E: 1, J: 1 }),
          enneagramWeights: JSON.stringify({ '8': 3, '3': 1 }),
        },
        {
          choiceText: 'Analitik Soğukkanlılık: Analiz ederim. Sessizce düşünür, tüm bilgileri toplar, çözümü kafamda şekillendirir - harekete o zaman geçerim.',
          mbtiWeights: JSON.stringify({ I: 1, T: 1 }),
          enneagramWeights: JSON.stringify({ '5': 3, '1': 1 }),
        },
        {
          choiceText: 'Dayanışma ve Destek: Destek ararım. Yalnız kalmak istemezdim - birinin yanımda olması, birlikte düşünmek beni güçlendirirdi.',
          mbtiWeights: JSON.stringify({ F: 1 }),
          enneagramWeights: JSON.stringify({ '6': 3, '2': 1 }),
        },
        {
          choiceText: 'Yaratıcı Adaptasyon: Farklı bir yol ararım. Standart çözüm işe yaramazsa başka bir şey denerim - beklenmedik durumlar yaratıcılığımı açar.',
          mbtiWeights: JSON.stringify({ N: 1, P: 1 }),
          enneagramWeights: JSON.stringify({ '7': 3, '4': 1 }),
        },
      ],
    },
    {
      order: 8,
      title: 'Geri Dönüş Kapısı',
      narrativeText: 'Makine tekrar çalıştı! Geri dönüş kapısı yeşil ışıkla açılıyor.\nProfesör son soruyla veda ediyor:\n"Zaman yolculuğunu tamamlamak üzeresin. Eve gitmeden önce söyler misin: Hayatının sonuna baktığında \'İyi ki bir hayat yaşadım\' diyebilmek için ne olmuş olması gerekirdi?"',
      sceneType: 'STORY',
      bgImage: '/images/rpg/soru8.png',
      choices: [
        {
          choiceText: 'Dürüstlük ve İlke: Dürüst, ilkeli ve doğru bir hayat sürmüş olmak. Kendimle barışık olmak.',
          mbtiWeights: JSON.stringify({ J: 1 }),
          enneagramWeights: JSON.stringify({ '1': 5 }),
        },
        {
          choiceText: 'Sevgi ve Katkı: Sevdiklerim için gerçekten orada olmuş olmak. Fark yaratmış olmak.',
          mbtiWeights: JSON.stringify({ F: 1 }),
          enneagramWeights: JSON.stringify({ '2': 5 }),
        },
        {
          choiceText: 'Başarı ve İz Bırakmak: Bir şeyler başarmış, iz bırakmış, hatırlanmış olmak.',
          mbtiWeights: JSON.stringify({ T: 1 }),
          enneagramWeights: JSON.stringify({ '3': 5 }),
        },
        {
          choiceText: 'Özgünlük ve Derinlik: Kendim olmuş olmak - özgün, derin, hayatı tam anlamıyla hissetmiş olmak.',
          mbtiWeights: JSON.stringify({ I: 1, N: 1 }),
          enneagramWeights: JSON.stringify({ '4': 5 }),
        },
        {
          choiceText: 'Bilgelik ve Anlam: Anlamış, öğrenmiş ve bilgelik kazanmış olmak.',
          mbtiWeights: JSON.stringify({ T: 1, N: 1 }),
          enneagramWeights: JSON.stringify({ '5': 5 }),
        },
        {
          choiceText: 'Güvenilirlik ve Sadakat: Güvenli, sadık ve çevremdeki insanlara güvenilir biri olmuş olmak.',
          mbtiWeights: JSON.stringify({ S: 1, J: 1 }),
          enneagramWeights: JSON.stringify({ '6': 5 }),
        },
        {
          choiceText: 'Coşku ve Serüven: Hayatın güzelliklerini, serüvenlerini, mutluluklarını dolu dolu yaşamış olmak.',
          mbtiWeights: JSON.stringify({ E: 1, P: 1 }),
          enneagramWeights: JSON.stringify({ '7': 5 }),
        },
        {
          choiceText: 'Güç ve Mücadele: Önemli şeyler için mücadele etmiş, güçlü ve etkili olmuş olmak.',
          mbtiWeights: JSON.stringify({ E: 1, T: 1 }),
          enneagramWeights: JSON.stringify({ '8': 5 }),
        },
        {
          choiceText: 'Huzur ve Uyum: Huzurlu, çatışmasız, çevremdeki herkesle uyum içinde yaşamış olmak.',
          mbtiWeights: JSON.stringify({ F: 1, P: 1 }),
          enneagramWeights: JSON.stringify({ '9': 5 }),
        },
      ],
    },
  ];

  for (const s of scenesData) {
    const scene = await prisma.rpgScene.create({
      data: {
        scenarioId: scenario.id,
        order: s.order,
        title: s.title,
        narrativeText: s.narrativeText,
        sceneType: s.sceneType,
      },
    });

    for (const c of s.choices) {
      await prisma.rpgChoice.create({
        data: {
          sceneId: scene.id,
          choiceText: c.choiceText,
          mbtiWeights: c.mbtiWeights,
          enneagramWeights: c.enneagramWeights,
          mbtiEffect: c.mbtiWeights,
          enneagramEffect: c.enneagramWeights,
        },
      });
    }
  }

  // 6. Kariyer & Sertifika Programları Havuzunu Oluştur (25+ Program)
  const programsData = [
    {
      title: 'Yapay Zeka ve Veri Bilimi Bootcamp',
      description: 'Python, makine öğrenmesi algoritmaları ve büyük veri analizleri ile geleceğin en çok talep gören teknolojilerinde uzmanlaş.',
      category: 'Yazılım & Teknoloji',
      requiredSkills: JSON.stringify(['Python', 'Matematiksal Düşünme', 'Veri Analizi', 'Algoritma']),
      relatedMbtiTypes: JSON.stringify(['INTJ', 'INTP', 'ENTJ', 'ENTP', 'ISTJ']),
      relatedEnneagramTypes: JSON.stringify([5, 3, 1, 8]),
      relatedDomainTags: JSON.stringify(['teknoloji', 'yazılım', 'yapay zeka', 'analitik', 'mali']),
      relatedValueTags: JSON.stringify(['Kariyer / meslekte başarı', 'Gelir ve maddi güvence', 'Yaratıcılık']),
      provider: 'Coursera / Google akredite',
      durationInfo: '16 Hafta (Online)',
      costInfo: 'Burslu / Ücretsiz',
      link: 'https://www.coursera.org',
    },
    {
      title: 'Full-Stack Web ve Mobil Geliştirme Sertifikası',
      description: 'Modern JavaScript, React, Next.js ve bulut teknolojileri ile sıfırdan ölçeklenebilir dijital uygulamalar geliştir.',
      category: 'Yazılım & Teknoloji',
      requiredSkills: JSON.stringify(['JavaScript', 'React', 'Problem Çözme', 'Görsel Tasarım']),
      relatedMbtiTypes: JSON.stringify(['INTP', 'ENTP', 'INTJ', 'ENFP', 'ISTP']),
      relatedEnneagramTypes: JSON.stringify([3, 5, 7, 1]),
      relatedDomainTags: JSON.stringify(['teknoloji', 'web', 'girişimcilik', 'bağımsız çalışma']),
      relatedValueTags: JSON.stringify(['Bağımsızlık', 'Gelir ve maddi güvence', 'Yaratıcılık']),
      provider: 'Patika.dev / MEB',
      durationInfo: '12 Hafta',
      costInfo: 'Ücretsiz',
      link: 'https://www.patika.dev',
    },
    {
      title: 'Siber Güvenlik ve Beyaz Şapkalı Hacker Akademisi',
      description: 'Ağ güvenliği, penetrasyon testleri, kriptografi ve siber savunma stratejileri ile dijital dünyayı korumayı öğren.',
      category: 'Yazılım & Teknoloji',
      requiredSkills: JSON.stringify(['Ağ Bilgisi', 'Linux', 'Analitik Zeka', 'Risk Yönetimi']),
      relatedMbtiTypes: JSON.stringify(['ISTJ', 'INTJ', 'INTP', 'ISTP', 'ESTJ']),
      relatedEnneagramTypes: JSON.stringify([5, 6, 1, 8]),
      relatedDomainTags: JSON.stringify(['güvenlik', 'teknoloji', 'analiz', 'istikrar']),
      relatedValueTags: JSON.stringify(['İstikrar / güvenlik', 'Gelir ve maddi güvence', 'Mücadele ve risk almak']),
      provider: 'BTK Akademi',
      durationInfo: '10 Hafta',
      costInfo: 'Ücretsiz',
      link: 'https://www.btkakademi.gov.tr',
    },
    {
      title: 'Oyun Tasarımı ve 3D Motor Geliştirme Atölyesi',
      description: 'Unity ve Unreal Engine kullanarak dijital oyun kurgusu, bölüm tasarımı, karakter modelleme ve interaktif hikaye yazımı.',
      category: 'Sanat & Tasarım',
      requiredSkills: JSON.stringify(['Oyun Tasarımı', 'C#', 'Yaratıcı Kurgu', '3D Modelleme']),
      relatedMbtiTypes: JSON.stringify(['INFP', 'ENFP', 'INTP', 'ISFP', 'ENTP']),
      relatedEnneagramTypes: JSON.stringify([4, 7, 5, 3]),
      relatedDomainTags: JSON.stringify(['oyun', 'sanat', 'yaratıcı', 'teknoloji', 'aktiviteler']),
      relatedValueTags: JSON.stringify(['Yaratıcılık', 'Bağımsızlık', 'Mücadele ve risk almak']),
      provider: 'Üniversite Kuluçka Merkezi',
      durationInfo: '8 Hafta',
      costInfo: 'Kısmi Burslu',
      link: '#',
    },
    {
      title: 'UI/UX ve Dijital Ürün Tasarımı Programı',
      description: 'Figma ile kullanıcı deneyimi araştırması, arayüz tasarımı, prototipleme ve kullanılabilirlik testleri alanında uzmanlık.',
      category: 'Sanat & Tasarım',
      requiredSkills: JSON.stringify(['Figma', 'Empati', 'Estetik Görüş', 'Kullanıcı Araştırması']),
      relatedMbtiTypes: JSON.stringify(['INFJ', 'INFP', 'ENFJ', 'ISFP', 'ENTP']),
      relatedEnneagramTypes: JSON.stringify([4, 2, 3, 7]),
      relatedDomainTags: JSON.stringify(['tasarım', 'estetik', 'psikoloji', 'teknoloji']),
      relatedValueTags: JSON.stringify(['Yaratıcılık', 'Başkalarına katkı sağlama', 'Kariyer / meslekte başarı']),
      provider: 'Google UX Certificate',
      durationInfo: '6 Ay',
      costInfo: 'Burslu / Ücretli',
      link: '#',
    },
    {
      title: 'Girişimcilik ve Yeni Nesil İş Kuluçka Okulu',
      description: 'İş fikri bulma, melek yatırımcı sunumları, iş modeli kanvası, çevik yönetim ve pazar stratejileri eğitimi.',
      category: 'Finans & İş Dünyası',
      requiredSkills: JSON.stringify(['Liderlik', 'İkna Kabiliyeti', 'Finansal Analiz', 'Strateji']),
      relatedMbtiTypes: JSON.stringify(['ENTJ', 'ESTJ', 'ENTP', 'ENFP', 'ESTP']),
      relatedEnneagramTypes: JSON.stringify([3, 8, 7, 1]),
      relatedDomainTags: JSON.stringify(['girişimcilik', 'yönetim', 'mali', 'sosyal']),
      relatedValueTags: JSON.stringify(['Gelir ve maddi güvence', 'Bağımsızlık', 'Mücadele ve risk almak', 'Tanınma / takdir edilme']),
      provider: 'TÜBİTAK BİGG / KOSGEB',
      durationInfo: '4 Hafta Kamp + Mentörlük',
      costInfo: 'Ücretsiz / Hibe Destekli',
      link: '#',
    },
    {
      title: 'Finansal Okuryazarlık ve Portföy Yönetimi Kursu',
      description: 'Borsa, yatırım enstrümanları, risk analizi, makroekonomi ve kişisel finans yönetimi temelleri.',
      category: 'Finans & İş Dünyası',
      requiredSkills: JSON.stringify(['Finansal Analiz', 'Matematik', 'Risk Yönetimi', 'Ekonomi']),
      relatedMbtiTypes: JSON.stringify(['ISTJ', 'ESTJ', 'INTJ', 'ENTJ', 'ISTP']),
      relatedEnneagramTypes: JSON.stringify([3, 1, 5, 6]),
      relatedDomainTags: JSON.stringify(['mali', 'ekonomi', 'yatırım', 'güvence']),
      relatedValueTags: JSON.stringify(['Gelir ve maddi güvence', 'İstikrar / güvenlik', 'Kariyer / meslekte başarı']),
      provider: 'Borsa İstanbul Akademi',
      durationInfo: '6 Hafta',
      costInfo: 'Ücretsiz',
      link: '#',
    },
    {
      title: 'Dijital Pazarlama, SEO ve Sosyal Medya Stratejileri',
      description: 'Google Ads, sosyal medya reklamcılığı, veri takibi, marka yönetimi ve içerik pazarlaması teknikleri.',
      category: 'Finans & İş Dünyası',
      requiredSkills: JSON.stringify(['İletişim', 'Veri Analizi', 'Metin Yazarlığı', 'Strateji']),
      relatedMbtiTypes: JSON.stringify(['ENFP', 'ENTP', 'ESFJ', 'ESTP', 'ENFJ']),
      relatedEnneagramTypes: JSON.stringify([3, 7, 2, 8]),
      relatedDomainTags: JSON.stringify(['pazarlama', 'sosyal medya', 'iletişim', 'ticaret']),
      relatedValueTags: JSON.stringify(['Tanınma / takdir edilme', 'Gelir ve maddi güvence', 'Yaratıcılık']),
      provider: 'HubSpot Academy',
      durationInfo: '8 Hafta',
      costInfo: 'Ücretsiz Sertifikalı',
      link: '#',
    },
    {
      title: 'Tıp, Biyomedikal ve Kök Hücre Araştırma Kampı',
      description: 'Genetik mühendisliği, insan anatomisi, biyomedikal cihaz teknolojileri ve klinik laboratuvar uygulamaları.',
      category: 'Sağlık & Yaşam Bilimleri',
      requiredSkills: JSON.stringify(['Biyoloji', 'Kimya', 'Gözlem yeteneği', 'Akademik disiplin']),
      relatedMbtiTypes: JSON.stringify(['INTJ', 'INFJ', 'ISTJ', 'INTP', 'ISFJ']),
      relatedEnneagramTypes: JSON.stringify([1, 5, 2, 6]),
      relatedDomainTags: JSON.stringify(['sağlık', 'bilim', 'araştırma', 'yardım']),
      relatedValueTags: JSON.stringify(['Başkalarına katkı sağlama', 'Kariyer / meslekte başarı', 'Etikler / ilkeler']),
      provider: 'Tıp Fakültesi Yaz Okulu',
      durationInfo: '4 Hafta (Yazılı & Uygulamalı)',
      costInfo: 'Burslu / Özel',
      link: '#',
    },
    {
      title: 'Psikoloji, Davranış Bilimleri ve Nörobilim Semineri',
      description: 'İnsan zihninin işleyişi, bilişsel psikoloji, duygusal zeka, danışmanlık teknikleri ve beyin araştırmaları.',
      category: 'Sağlık & Yaşam Bilimleri',
      requiredSkills: JSON.stringify(['Empati', 'Aktif Dinleme', 'Analiz', 'İletişim']),
      relatedMbtiTypes: JSON.stringify(['INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISFJ']),
      relatedEnneagramTypes: JSON.stringify([2, 4, 9, 5]),
      relatedDomainTags: JSON.stringify(['psikoloji', 'sağlık', 'insan', 'danışmanlık', 'sosyal']),
      relatedValueTags: JSON.stringify(['Başkalarına katkı sağlama', 'Arkadaşlık ve sosyal ilişkiler', 'Etikler / ilkeler']),
      provider: 'Türk Psikologlar Derneği Gençlik Programı',
      durationInfo: '8 Hafta',
      costInfo: 'Ücretsiz',
      link: '#',
    },
    {
      title: 'Hukuk, Adalet ve Uluslararası Diplomasi Akademisi',
      description: 'Anayasa hukuku temelleri, uluslararası ilişkiler, müzakere teknikleri, münazara ve diplomatik yazışma kuralları.',
      category: 'Sosyal & Beşeri Bilimler',
      requiredSkills: JSON.stringify(['Hitap Yeteneği', 'Analitik Düşünme', 'Adalet Duygusu', 'Araştırma']),
      relatedMbtiTypes: JSON.stringify(['INTJ', 'ENTJ', 'INFJ', 'ENFJ', 'ESTJ']),
      relatedEnneagramTypes: JSON.stringify([1, 8, 3, 6]),
      relatedDomainTags: JSON.stringify(['hukuk', 'adalet', 'yönetim', 'diplomasi', 'sosyal']),
      relatedValueTags: JSON.stringify(['Etikler / ilkeler', 'Tanınma / takdir edilme', 'Kariyer / meslekte başarı']),
      provider: 'Hukuk ve Diplomasi Enstitüsü',
      durationInfo: '10 Hafta',
      costInfo: 'Burslu',
      link: '#',
    },
    {
      title: 'Yaratıcı Yazarlık, Senaryo ve İçerik Editörlüğü Atölyesi',
      description: 'Roman kurgusu, film senaryosu yazımı, karakter gelişimi, gazetecilik ve dijital metin üretimi sanatları.',
      category: 'Sosyal & Beşeri Bilimler',
      requiredSkills: JSON.stringify(['Yaratıcı Yazarlık', 'Dil Bilgisi', 'Gözlem', 'Hikaye Kurgusu']),
      relatedMbtiTypes: JSON.stringify(['INFP', 'INFJ', 'ENFP', 'INTP', 'ISFP']),
      relatedEnneagramTypes: JSON.stringify([4, 5, 9, 7]),
      relatedDomainTags: JSON.stringify(['edebiyat', 'sanat', 'yaratıcı', 'yazarlık']),
      relatedValueTags: JSON.stringify(['Yaratıcılık', 'Bağımsızlık', 'Tanınma / takdir edilme']),
      provider: 'Yazarlar Kulübüsü',
      durationInfo: '12 Hafta',
      costInfo: 'Ücretsiz',
      link: '#',
    },
    {
      title: 'Mekatronik, Robotik ve Otonom Araç Yarışma Takımı',
      description: 'Arduino, ROS, sensör sistemleri, motor kontrolü ve yapay zeka destekli otonom robot tasarımı.',
      category: 'Mühendislik & Üretim',
      requiredSkills: JSON.stringify(['Elektronik', 'Kodlama', 'Mekanik Tasarım', 'Takım Çalışması']),
      relatedMbtiTypes: JSON.stringify(['ISTP', 'INTP', 'INTJ', 'ESTP', 'ENTJ']),
      relatedEnneagramTypes: JSON.stringify([5, 3, 8, 1]),
      relatedDomainTags: JSON.stringify(['mühendislik', 'robotik', 'teknoloji', 'üretim']),
      relatedValueTags: JSON.stringify(['Mücadele ve risk almak', 'Kariyer / meslekte başarı', 'Yaratıcılık']),
      provider: 'TEKNOFEST Akademi',
      durationInfo: '6 Ay Proje Odaklı',
      costInfo: 'Tamamıyla Hibe Destekli',
      link: '#',
    },
    {
      title: 'Yenilenebilir Enerji ve Çevre Mühendisliği Stajı',
      description: 'Güneş, rüzgar ve hidrojen enerjisi sistemleri, karbon ayak izi analizi, sürdürülebilir mimari ve ekolojik tasarım.',
      category: 'Çevre & Tarım',
      requiredSkills: JSON.stringify(['Çevre Bilinci', 'Fizik', 'Proje Tasarımı', 'Sürdürülebilirlik']),
      relatedMbtiTypes: JSON.stringify(['INFJ', 'INTJ', 'ISTJ', 'ENFJ', 'ISFJ']),
      relatedEnneagramTypes: JSON.stringify([1, 5, 2, 9]),
      relatedDomainTags: JSON.stringify(['çevre', 'enerji', 'doğa', 'sağlık', 'barınma']),
      relatedValueTags: JSON.stringify(['Başkalarına katkı sağlama', 'Etikler / ilkeler', 'İstikrar / güvenlik']),
      provider: 'Sürdürülebilirlik Vakfı',
      durationInfo: '8 Hafta',
      costInfo: 'Ücretsiz / Staj İmkanlı',
      link: '#',
    },
    {
      title: 'Mimari Tasarım, İç Mimarlık ve Akıllı Şehirler Okulu',
      description: 'AutoCAD ve SketchUp ile mekan tasarımı, ergonomi, estetik planlama, depreme dayanıklı ve akıllı bina modellemesi.',
      category: 'Sanat & Tasarım',
      requiredSkills: JSON.stringify(['Uzamsal Düşünme', '3D Tasarım', 'Mimari Çizim', 'Estetik']),
      relatedMbtiTypes: JSON.stringify(['INTJ', 'INFJ', 'ISTP', 'ISFP', 'ENTP']),
      relatedEnneagramTypes: JSON.stringify([4, 1, 3, 5]),
      relatedDomainTags: JSON.stringify(['mimarlık', 'barınma', 'tasarım', 'şehir', 'teknoloji']),
      relatedValueTags: JSON.stringify(['Yaratıcılık', 'Coğrafi yerleşim', 'Kariyer / meslekte başarı']),
      provider: 'Mimarlar Odası Gençlik Atölyesi',
      durationInfo: '10 Hafta',
      costInfo: 'Burslu',
      link: '#',
    },
    {
      title: 'Küresel Lojistik, Tedarik Zinciri ve Dış Ticaret Kursu',
      description: 'Uluslararası taşımacılık, gümrük mevzuatı, depo otomasyonu, tedarik optimizasyonu ve e-ticaret operasyonları.',
      category: 'Finans & İş Dünyası',
      requiredSkills: JSON.stringify(['Organizasyon', 'Planlama', 'İletişim', 'Lojistik']),
      relatedMbtiTypes: JSON.stringify(['ESTJ', 'ISTJ', 'ENTJ', 'ESFJ', 'ISTP']),
      relatedEnneagramTypes: JSON.stringify([6, 3, 1, 8]),
      relatedDomainTags: JSON.stringify(['ulaşım', 'ticaret', 'planlama', 'finans', 'küresel']),
      relatedValueTags: JSON.stringify(['İstikrar / güvenlik', 'Gelir ve maddi güvence', 'Coğrafi yerleşim']),
      provider: 'Lojistik Derneği Eğitim Merkezi',
      durationInfo: '6 Hafta',
      costInfo: 'Ücretsiz',
      link: '#',
    },
    {
      title: 'Sosyal Sorumluluk, Gönüllülük ve STK Liderlik Programı',
      description: 'Toplumsal projeler yönetme, fon geliştirme, kriz dönemlerinde yardım koordinasyonu ve insan hakları savunuculuğu.',
      category: 'Sosyal & Beşeri Bilimler',
      requiredSkills: JSON.stringify(['Topluluk Yönetimi', 'Empati', 'İletişim', 'Organizasyon']),
      relatedMbtiTypes: JSON.stringify(['ENFJ', 'INFJ', 'ESFJ', 'ENFP', 'ISFJ']),
      relatedEnneagramTypes: JSON.stringify([2, 1, 9, 6]),
      relatedDomainTags: JSON.stringify(['sosyal', 'yardım', 'liderlik', 'toplum', 'aktiviteler']),
      relatedValueTags: JSON.stringify(['Başkalarına katkı sağlama', 'Arkadaşlık ve sosyal ilişkiler', 'Etikler / ilkeler']),
      provider: 'BM Gençlik Liderleri Kampı',
      durationInfo: '4 Hafta Intensive',
      costInfo: 'Ücretsiz',
      link: '#',
    },
    {
      title: 'Spor Bilimleri, Beslenme ve Atletik Performans Sertifikası',
      description: 'Egzersiz fizyolojisi, sporcu beslenmesi, fitness antrenörlüğü, spor psikolojisi ve sağlıklı yaşam koçluğu.',
      category: 'Sağlık & Yaşam Bilimleri',
      requiredSkills: JSON.stringify(['Fiziksel Kondisyon', 'Beslenme Bilgisi', 'Disiplin', 'İletişim']),
      relatedMbtiTypes: JSON.stringify(['ESTP', 'ESFP', 'ISTP', 'ISFP', 'ENFJ']),
      relatedEnneagramTypes: JSON.stringify([8, 3, 7, 2]),
      relatedDomainTags: JSON.stringify(['sağlık', 'spor', 'aktiviteler', 'yaşam', 'koçluk']),
      relatedValueTags: JSON.stringify(['Mücadele ve risk almak', 'Başkalarına katkı sağlama', 'Tanınma / takdir edilme']),
      provider: 'Spor Bilimleri Fakültesi',
      durationInfo: '8 Hafta',
      costInfo: 'Ücretsiz',
      link: '#',
    },
    {
      title: 'Akıllı Tarım, Biyoteknoloji ve Gıda Mühendisliği',
      description: 'Topraksız tarım (hidroponik), drone ile arazi takibi, tohum genetiği, gıda güvenliği ve sürdürülebilir üretim teknolojileri.',
      category: 'Çevre & Tarım',
      requiredSkills: JSON.stringify(['Biyoloji', 'Teknoloji Kullanımı', 'Doğa Sevgisi', 'Araştırma']),
      relatedMbtiTypes: JSON.stringify(['ISTJ', 'INTP', 'INTJ', 'ISFJ', 'ISTP']),
      relatedEnneagramTypes: JSON.stringify([5, 1, 9, 6]),
      relatedDomainTags: JSON.stringify(['tarım', 'sağlık', 'doğa', 'teknoloji', 'üretim']),
      relatedValueTags: JSON.stringify(['İstikrar / güvenlik', 'Başkalarına katkı sağlama', 'Coğrafi yerleşim']),
      provider: 'Tarım ve Orman Bakanlığı Genç Çiftçi Projesi',
      durationInfo: '6 Hafta',
      costInfo: 'Hibe ve Burs Destekli',
      link: '#',
    },
    {
      title: 'Havacılık, Uzay Mühendisliği ve İHA/SİHA Pilotluğu',
      description: 'Aerodinamik, uçuş mekaniği, uydu sistemleri, roket itki motorları ve insansız hava aracı otonom rota planlaması.',
      category: 'Mühendislik & Üretim',
      requiredSkills: JSON.stringify(['Fizik & Matematik', 'Mekanik', 'Havacılık Merakı', 'Simülasyon']),
      relatedMbtiTypes: JSON.stringify(['ISTP', 'INTJ', 'INTP', 'ESTP', 'ENTJ']),
      relatedEnneagramTypes: JSON.stringify([5, 8, 3, 1]),
      relatedDomainTags: JSON.stringify(['havacılık', 'teknoloji', 'mühendislik', 'ulaşım', 'uzay']),
      relatedValueTags: JSON.stringify(['Mücadele ve risk almak', 'Kariyer / meslekte başarı', 'Yaratıcılık']),
      provider: 'TUSAŞ & Türk Hava Kurumu Akademisi',
      durationInfo: '12 Hafta',
      costInfo: 'Tam Burslu',
      link: '#',
    },
    {
      title: 'Otomotiv Mühendisliği ve Elektrikli Araç Teknolojileri',
      description: 'Batarya yönetim sistemleri, elektrik motorları, otonom sürüş sensörleri ve araç içi gömülü yazılımlar.',
      category: 'Mühendislik & Üretim',
      requiredSkills: JSON.stringify(['Elektronik', 'Mekanik', 'Gömülü Yazılım', 'Fizik']),
      relatedMbtiTypes: JSON.stringify(['ISTP', 'ESTJ', 'INTJ', 'ISTJ', 'ENTP']),
      relatedEnneagramTypes: JSON.stringify([5, 1, 3, 6]),
      relatedDomainTags: JSON.stringify(['otomotiv', 'ulaşım', 'mühendislik', 'enerji', 'teknoloji']),
      relatedValueTags: JSON.stringify(['Gelir ve maddi güvence', 'Kariyer / meslekte başarı', 'İstikrar / güvenlik']),
      provider: 'TOGG Akademik İşbirliği Programı',
      durationInfo: '10 Hafta',
      costInfo: 'Burslu',
      link: '#',
    },
    {
      title: 'İçerik Üreticiliği, Dijital Medya ve Video Prodüksiyonu',
      description: 'YouTube ve podcast yayıncılığı, Premiere Pro & DaVinci Resolve ile kurgu, ışık-ses tasarımı, hikaye anlatıcılığı.',
      category: 'Sanat & Tasarım',
      requiredSkills: JSON.stringify(['Video Kurgu', 'İletişim', 'Hikaye Anlatımı', 'Sosyal Medya']),
      relatedMbtiTypes: JSON.stringify(['ENFP', 'ESFP', 'INFP', 'ENTP', 'ENFJ']),
      relatedEnneagramTypes: JSON.stringify([4, 7, 3, 2]),
      relatedDomainTags: JSON.stringify(['medya', 'sanat', 'yaratıcı', 'sosyal', 'iletişim']),
      relatedValueTags: JSON.stringify(['Tanınma / takdir edilme', 'Yaratıcılık', 'Bağımsızlık']),
      provider: 'YouTube Creators Institute',
      durationInfo: '6 Hafta',
      costInfo: 'Ücretsiz',
      link: '#',
    },
    {
      title: 'Dilbilim, Mütercim-Tercümanlık ve Kültürlerarası İletişim',
      description: 'İleri düzey yabancı dil edinimi, eşzamanlı çeviri teknikleri, uluslararası edebiyat analizi ve küresel rehberlik.',
      category: 'Sosyal & Beşeri Bilimler',
      requiredSkills: JSON.stringify(['Yabancı Dil', 'Sözel Zeka', 'Kültürel Merak', 'İletişim']),
      relatedMbtiTypes: JSON.stringify(['INFP', 'ENFJ', 'INFJ', 'ENFP', 'ISFJ']),
      relatedEnneagramTypes: JSON.stringify([4, 9, 2, 5]),
      relatedDomainTags: JSON.stringify(['dil', 'kültür', 'uluslararası', 'sosyal', 'seyahat']),
      relatedValueTags: JSON.stringify(['Coğrafi yerleşim', 'Arkadaşlık ve sosyal ilişkiler', 'Başkalarına katkı sağlama']),
      provider: 'Uluslararası Çevirmenler Birligi',
      durationInfo: '12 Hafta',
      costInfo: 'Ücretsiz',
      link: '#',
    },
    {
      title: 'Aktüerya Bilimleri, İstatistik ve Finansal Risk Analitiği',
      description: 'Sigortacılık modelleri, olasılık hesaplamaları, finansal kriz tahminleri ve kurumsal risk analistliği.',
      category: 'Finans & İş Dünyası',
      requiredSkills: JSON.stringify(['İleri Matematik', 'İstatistik', 'R / Python', 'Analitik Zeka']),
      relatedMbtiTypes: JSON.stringify(['INTJ', 'ISTJ', 'INTP', 'ENTJ', 'ESTJ']),
      relatedEnneagramTypes: JSON.stringify([5, 1, 6, 3]),
      relatedDomainTags: JSON.stringify(['mali', 'analitik', 'sayısal', 'güvence', 'finans']),
      relatedValueTags: JSON.stringify(['Gelir ve maddi güvence', 'İstikrar / güvenlik', 'Kariyer / meslekte başarı']),
      provider: 'Aktüerler Derneği Eğitim Programı',
      durationInfo: '8 Hafta',
      costInfo: 'Burslu',
      link: '#',
    },
    {
      title: 'Turizm Yönetimi, Etkinlik Organizasyonu ve Hospitality',
      description: 'Oteller, uluslararası kongreler, festivaller ve eko-turizm rotalarının yönetimi, misafir ilişkileri ve turizm pazarlaması.',
      category: 'Finans & İş Dünyası',
      requiredSkills: JSON.stringify(['İletişim', 'Organizasyon', 'Müşteri İlişkileri', 'Esneklik']),
      relatedMbtiTypes: JSON.stringify(['ESFJ', 'ENFJ', 'ESFP', 'ESTP', 'ENFP']),
      relatedEnneagramTypes: JSON.stringify([2, 7, 3, 9]),
      relatedDomainTags: JSON.stringify(['sosyal', 'turizm', 'etkinlik', 'ulaşım', 'coğrafya']),
      relatedValueTags: JSON.stringify(['Arkadaşlık ve sosyal ilişkiler', 'Coğrafi yerleşim', 'Tanınma / takdir edilme']),
      provider: 'Turizm Bakanlığı Sertifika Programı',
      durationInfo: '6 Hafta',
      costInfo: 'Ücretsiz Staj Garantili',
      link: '#',
    },
  ];

  for (const p of programsData) {
    await prisma.careerProgram.create({ data: p });
  }

  console.log('✅ Tohumlama (seed) işlemi başarıyla tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
