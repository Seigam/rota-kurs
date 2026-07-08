import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient, Role, FamilyRelation, EntryType, LifeDomain } from '@prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Veritabanı tohumlama (seed) işlemi başlatılıyor...');

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

  // 5. RPG Senaryosu ve Sahneleri Oluştur (Gizemli Akademi / Keşif Adası)
  const scenario = await prisma.rpgScenario.create({
    data: {
      title: 'Gizemli Akademi: Keşif Adası Yolculuğu',
      version: '1.0',
      isActive: true,
      description: 'Kendini bilinmeyen bir adadaki kadim bir akademide buluyorsun. Karşılaştığın 15 farklı olayda aldığın kararlar senin kim olduğunu ve gelecekte hangi yolu seçmen gerektiğini fısıldıyor.',
    },
  });

  const scenesData = [
    {
      order: 1,
      title: 'Kıyıya Varış ve Gizemli Mektup',
      narrativeText: 'Sislerin arasından yükselen Keşif Adası görünüyor. Limana adım attığın anda antik bir taş sütunun üzerinde sana özel bırakılmış, mühürlü bir parşömen görüyorsun. Mektupta "Akademiye hoş geldin. İlk sınavın kendi rotanı seçmek" yazıyor.',
      sceneType: 'STORY',
      choices: [
        {
          choiceText: 'Mektubu hemen açıp detayları analiz ederim ve mantıklı bir strateji kurarım.',
          mbtiWeights: JSON.stringify({ T: 2, J: 2, I: 1 }),
          enneagramWeights: JSON.stringify({ '5': 2, '1': 1 }),
        },
        {
          choiceText: 'Etrafımdaki diğer yeni gelen öğrencilerle sesli düşünerek birlikte ne yapacağımızı tartışırım.',
          mbtiWeights: JSON.stringify({ E: 2, F: 1, P: 1 }),
          enneagramWeights: JSON.stringify({ '2': 2, '7': 1 }),
        },
        {
          choiceText: 'Hiç beklemeden adanın derinliklerine doğru sezgilerime güvenerek koşmaya başlarım.',
          mbtiWeights: JSON.stringify({ N: 2, P: 2, E: 1 }),
          enneagramWeights: JSON.stringify({ '8': 2, '7': 2 }),
        },
      ],
    },
    {
      order: 2,
      title: 'Kilitli Kütüphane Kapısı',
      narrativeText: 'Akademinin devasa kütüphanesine ulaştığında kapının şifreli bir mekanizma ile kilitlendiğini görüyorsun. Kapının üzerinde geometrik semboller ve kadim bir bilmece yer alıyor.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Sembollerin mantıksal örüntüsünü çıkararak şifreyi kendi başıma çözmeye odaklanırım.',
          mbtiWeights: JSON.stringify({ I: 2, T: 2, N: 1 }),
          enneagramWeights: JSON.stringify({ '5': 3, '3': 1 }),
        },
        {
          choiceText: 'Yüksek sesle bilmeceyi okur ve etraftakilerin fikirlerini birleştirerek takımla kapıyı açarım.',
          mbtiWeights: JSON.stringify({ E: 2, F: 1, S: 1 }),
          enneagramWeights: JSON.stringify({ '6': 2, '2': 1 }),
        },
        {
          choiceText: 'Şifre yerine kapının menteşelerini veya pencere kenarlarını inceleyerek pratik ve alternatif bir giriş ararım.',
          mbtiWeights: JSON.stringify({ S: 2, P: 2, T: 1 }),
          enneagramWeights: JSON.stringify({ '8': 2, '3': 1 }),
        },
      ],
    },
    {
      order: 3,
      title: 'İki Yol Ayrımı',
      narrativeText: 'Kütüphaneyi geçtikten sonra koridor ikiye ayrılıyor. Soldaki koridordan hareketli müzik sesleri ve kahkahalar gelirken, sağdaki koridordan hafif bir rüzgar sesi ve sakinlik yayılıyor.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Kahkaha ve müziğin geldiği sol koridora gider, yeni insanlarla tanışmayı seçerim.',
          mbtiWeights: JSON.stringify({ E: 3, F: 1, P: 1 }),
          enneagramWeights: JSON.stringify({ '7': 3, '2': 1 }),
        },
        {
          choiceText: 'Sakin ve sessiz olan sağ koridora geçerek kendi düşüncelerimle baş başa kalmayı tercih ederim.',
          mbtiWeights: JSON.stringify({ I: 3, N: 1, J: 1 }),
          enneagramWeights: JSON.stringify({ '4': 2, '5': 2 }),
        },
        {
          choiceText: 'Her iki koridorun da haritasını çıkarır, hangisinin hedefe daha kısa ulaştıracağını hesaplarım.',
          mbtiWeights: JSON.stringify({ T: 2, J: 2, S: 1 }),
          enneagramWeights: JSON.stringify({ '1': 2, '3': 2 }),
        },
      ],
    },
    {
      order: 4,
      title: 'Kayıp Harita ve Telaşlı Öğrenci',
      narrativeText: 'Koridorda ağlamaklı bir şekilde elindeki yırtık haritaya bakan bir öğrenciyle karşılaşıyorsun. Önemli bir oryantasyon sınavına geç kalmak üzere olduğunu söylüyor.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Kendi planımı durdurup onunla birlikte doğru yolu bulana kadar ona rehberlik ederim.',
          mbtiWeights: JSON.stringify({ F: 3, E: 1, P: 1 }),
          enneagramWeights: JSON.stringify({ '2': 3, '9': 1 }),
        },
        {
          choiceText: 'Haritanın yırtık parçalarını hızlıca birleştirip ona pratik ve net talimatlar vererek kendi yoluma devam ederim.',
          mbtiWeights: JSON.stringify({ T: 2, J: 2, S: 1 }),
          enneagramWeights: JSON.stringify({ '3': 2, '1': 1 }),
        },
        {
          choiceText: 'Akademinin bu tür engelleri birer test olarak koyduğunu hatırlatıp, kendi çözümünü bulması için onu cesaretlendiririm.',
          mbtiWeights: JSON.stringify({ N: 2, T: 1, J: 1 }),
          enneagramWeights: JSON.stringify({ '8': 2, '5': 1 }),
        },
      ],
    },
    {
      order: 5,
      title: 'Laboratuvardaki Patlama Riski',
      narrativeText: 'Simya ve teknoloji laboratuvarının yanından geçerken renkli bir sıvının kaynadığını ve alarm ışıklarının yanıp söndüğünü fark ediyorsun. İçeride kimse yok ve sistem aşırı ısınmış.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Hemen kontrol paneline gidip acil durum protokollerini ve soğutma vanalarını mantık sırasına göre çalıştırırım.',
          mbtiWeights: JSON.stringify({ T: 3, S: 2, J: 1 }),
          enneagramWeights: JSON.stringify({ '1': 2, '6': 2 }),
        },
        {
          choiceText: 'Risk alarak yepyeni bir kimyasal karışım döküp reaksiyonu deneysel ve yaratıcı bir yöntemle durdurmayı denerim.',
          mbtiWeights: JSON.stringify({ N: 3, P: 2, T: 1 }),
          enneagramWeights: JSON.stringify({ '7': 2, '4': 2 }),
        },
        {
          choiceText: 'Güvenli mesafeye çekilip anında güvenlik görevlilerini ve nöbetçi öğretmenleri alarma geçiririm.',
          mbtiWeights: JSON.stringify({ S: 2, J: 2, I: 1 }),
          enneagramWeights: JSON.stringify({ '6': 3, '9': 1 }),
        },
      ],
    },
    {
      order: 6,
      title: 'Sanat Galerisindeki Boş Tuval',
      narrativeText: 'Akademinin Yaratıcılık Salonunda, ortada bomboş duran dev bir tuval ve binlerce farklı renk/malzeme görüyorsun. Duvarda "İzini Bırak" yazıyor.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'İç dünyamdaki karmaşık duyguları ve soyut hayalleri canlı, alışılmadık fırça darbeleriyle yansıtırım.',
          mbtiWeights: JSON.stringify({ N: 3, F: 2, P: 2 }),
          enneagramWeights: JSON.stringify({ '4': 3, '7': 1 }),
        },
        {
          choiceText: 'Akademinin mimarisini ve adanın gerçeğe birebir uygun, kusursuz bir teknik resmini çizerim.',
          mbtiWeights: JSON.stringify({ S: 3, T: 2, J: 2 }),
          enneagramWeights: JSON.stringify({ '1': 3, '5': 1 }),
        },
        {
          choiceText: 'Diğer öğrencileri davet edip herkesin bir sembol çizdiği devasa bir ortak sanat eseri başlatırım.',
          mbtiWeights: JSON.stringify({ E: 3, F: 2, J: 1 }),
          enneagramWeights: JSON.stringify({ '2': 2, '9': 2 }),
        },
      ],
    },
    {
      order: 7,
      title: 'Münzara Salonunda Büyük Tartışma',
      narrativeText: 'Büyük Amfi\'de öğrenciler iki gruba ayrılmış hararetli bir şekilde tartışıyor: "Yapay zeka insan yaratıcılığını yok mu ediyor, yoksa onu evrimleştiriyor mu?"',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'İstatistikler, algoritmik gerçekler ve felsefi verilerle sahneye çıkıp keskin bir mantık savunması yaparım.',
          mbtiWeights: JSON.stringify({ T: 3, N: 2, J: 1 }),
          enneagramWeights: JSON.stringify({ '3': 2, '8': 2, '5': 1 }),
        },
        {
          choiceText: 'Her iki tarafın da haklı yönlerini vurgulayarak gerginliği yumuşatır ve uzlaşmacı bir orta yol öneririm.',
          mbtiWeights: JSON.stringify({ F: 3, I: 1, P: 1 }),
          enneagramWeights: JSON.stringify({ '9': 3, '2': 1 }),
        },
        {
          choiceText: 'Tartışmaya katılmak yerine seyircilerin tepkilerini ve konuşmacıların vücut dilini analiz ederek gözlem yaparım.',
          mbtiWeights: JSON.stringify({ I: 3, T: 1, P: 2 }),
          enneagramWeights: JSON.stringify({ '5': 3, '4': 1 }),
        },
      ],
    },
    {
      order: 8,
      title: 'Sürpriz Proje Görevi',
      narrativeText: 'Akademi yönetimi aniden 48 saat içinde tamamlanması gereken bir grup projesi duyuruyor. Ekibini seçme ve rol dağılımı yapma şansın var.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Liderliği üstlenir, görev dağılımını yapar ve net bir zaman çizelgesiyle ekibi hedefe kilitlerim.',
          mbtiWeights: JSON.stringify({ E: 2, T: 2, J: 3 }),
          enneagramWeights: JSON.stringify({ '3': 3, '8': 2 }),
        },
        {
          choiceText: 'Ekibin motivasyonunu ve neşesini yüksek tutan, fikir fırtınalarını tetikleyen vizyoner kişi olurum.',
          mbtiWeights: JSON.stringify({ E: 2, N: 3, P: 2 }),
          enneagramWeights: JSON.stringify({ '7': 3, '2': 1 }),
        },
        {
          choiceText: 'Arka planda kalıp projenin teknik, yazılım veya araştırma kısmını kusursuz şekilde tek başıma yürütürüm.',
          mbtiWeights: JSON.stringify({ I: 3, T: 2, J: 1 }),
          enneagramWeights: JSON.stringify({ '5': 3, '1': 1 }),
        },
      ],
    },
    {
      order: 9,
      title: 'Gece Yarısı Gizemli Sesler',
      narrativeText: 'Gece yarısı yurt odanda dinlenirken pencereden adanın yasaklı botanik bahçesinden tuhaf, melodik fısıltılar geldiğini duyuyorsun.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Merakıma yenik düşüp gizlice dışarı çıkar, bu gizemli fenomenin kaynağını keşfetmek için maceraya atılırım.',
          mbtiWeights: JSON.stringify({ N: 3, P: 3, E: 1 }),
          enneagramWeights: JSON.stringify({ '7': 2, '4': 2, '8': 1 }),
        },
        {
          choiceText: 'Yasak kurallarını ihlal etmenin riske değmeyeceğini düşünüp uykuya döner ve sabah ilk iş yetkililere sorarım.',
          mbtiWeights: JSON.stringify({ S: 3, J: 3, I: 1 }),
          enneagramWeights: JSON.stringify({ '6': 3, '1': 2 }),
        },
        {
          choiceText: 'Sesleri odamdan ses kayıt cihazına veya uygulama ile kaydedip frekans analizini yaparım.',
          mbtiWeights: JSON.stringify({ I: 2, T: 3, J: 1 }),
          enneagramWeights: JSON.stringify({ '5': 3, '3': 1 }),
        },
      ],
    },
    {
      order: 10,
      title: 'Ekip Arkadaşının Hatası',
      narrativeText: 'Proje teslimine saatler kala, ekip arkadaşının çok kritik bir hesaplama veya kodlama hatası yaptığını ve projenin çökmek üzere olduğunu fark ediyorsun.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Onu suçlamadan sakinleştirir, moralini bozmamamasını söyleyip birlikte sabaha kadar hatayı düzeltiriz.',
          mbtiWeights: JSON.stringify({ F: 3, J: 1, E: 1 }),
          enneagramWeights: JSON.stringify({ '2': 2, '9': 2, '1': 1 }),
        },
        {
          choiceText: 'Durumu derhal ele alır, hatalı bölümü silip kendi profesyonel çözümümle saniyeler içinde yeniden yazarım.',
          mbtiWeights: JSON.stringify({ T: 3, J: 2, I: 1 }),
          enneagramWeights: JSON.stringify({ '3': 3, '8': 2 }),
        },
        {
          choiceText: 'Hatanın neden kaynaklandığını kök nedene inerek analiz eder, gelecekte tekrarlanmaması için sistem kurarım.',
          mbtiWeights: JSON.stringify({ T: 2, N: 2, J: 2 }),
          enneagramWeights: JSON.stringify({ '1': 3, '5': 2 }),
        },
      ],
    },
    {
      order: 11,
      title: 'Büyük Keşif Fuarı Sunumu',
      narrativeText: 'Akademinin yıllık Keşif Fuarı\'nda projenizi jüriye ve yüzlerce ziyaretçiye tanıtacağınız an geldi çattı.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Sahneye çıkıp coşkulu, beden dilini etkili kullanan ve herkesi büyüleyen ana sunumu ben yaparım.',
          mbtiWeights: JSON.stringify({ E: 3, N: 2, F: 1 }),
          enneagramWeights: JSON.stringify({ '3': 3, '7': 2 }),
        },
        {
          choiceText: 'Sunum yerine ziyaretçilere birebir standda demo yaptırıp detaylı soruları yanıtlamayı tercih ederim.',
          mbtiWeights: JSON.stringify({ I: 2, S: 2, T: 2 }),
          enneagramWeights: JSON.stringify({ '5': 2, '6': 2 }),
        },
        {
          choiceText: 'Standın görsel tasarımını, broşürlerini ve estetik düzenini mükemmelleştirerek ilk izlenimin kusursuz olmasını sağlarım.',
          mbtiWeights: JSON.stringify({ F: 2, S: 2, J: 2 }),
          enneagramWeights: JSON.stringify({ '4': 2, '1': 2 }),
        },
      ],
    },
    {
      order: 12,
      title: 'Zorlu Burs ve Fon Kararı',
      narrativeText: 'Jüri projenize büyük bir fon desteği teklif etti; ancak bir şartları var: Projenin sosyal fayda kısmını çıkarıp tamamen ticari kazanca odaklanmanız gerekiyor.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Teklifi kesinlikle reddederim; projemizin toplumsal fayda ve etik değerleri paradan çok daha önemlidir.',
          mbtiWeights: JSON.stringify({ F: 3, I: 1, J: 2 }),
          enneagramWeights: JSON.stringify({ '1': 3, '4': 2 }),
        },
        {
          choiceText: 'Ticari fonu kabul eder, elde ettiğimiz yüksek finansal güçle daha sonra daha büyük sosyal projeler fonlarım.',
          mbtiWeights: JSON.stringify({ T: 3, E: 1, J: 2 }),
          enneagramWeights: JSON.stringify({ '3': 3, '8': 2 }),
        },
        {
          choiceText: 'Jüriyle pazarlığa oturup, hem ticari hem de sosyal faydayı koruyacak yenilikçi bir hibrit model kabul ettiririm.',
          mbtiWeights: JSON.stringify({ N: 3, T: 1, P: 2 }),
          enneagramWeights: JSON.stringify({ '7': 2, '3': 2, '8': 1 }),
        },
      ],
    },
    {
      order: 13,
      title: 'Fırtınalı Gece ve Kesinti',
      narrativeText: 'Adayı vuran şiddetli bir fırtına nedeniyle akademinin tüm elektrik ve iletişim ağları çöktü. Kampüste kısa süreli bir panik havası hakim.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Soğukkanlılıkla liderliği alıp arkadaşları güvenli alanlara yönlendirir ve kriz masası kurarım.',
          mbtiWeights: JSON.stringify({ E: 2, T: 2, J: 3 }),
          enneagramWeights: JSON.stringify({ '8': 3, '1': 2 }),
        },
        {
          choiceText: 'Jeneratör odasına koşup temel fizik ve elektrik bilgimle arızayı gidermeye çalışırım.',
          mbtiWeights: JSON.stringify({ I: 2, T: 3, S: 2 }),
          enneagramWeights: JSON.stringify({ '5': 3, '6': 1 }),
        },
        {
          choiceText: 'Karanlıkta korkan ve endişelenen öğrencilerin yanına gidip onlara moral vererek hikayeler anlatırım.',
          mbtiWeights: JSON.stringify({ F: 3, E: 2, P: 1 }),
          enneagramWeights: JSON.stringify({ '2': 3, '9': 2 }),
        },
      ],
    },
    {
      order: 14,
      title: 'Akademi Kütüphanesindeki Gizli Arşiv',
      narrativeText: 'Fırtına dindikten sonra kütüphanede açılan gizli bir bölme görüyorsun. İçeride geleceğin mesleklerine ve insanlığın kaderine dair kadim öngörüler var.',
      sceneType: 'DECISION',
      choices: [
        {
          choiceText: 'Gelecekte insanlığı uzaya taşıyacak teknolojik ve bilimsel gelişmeleri anlatan tomarlara odaklanırım.',
          mbtiWeights: JSON.stringify({ N: 3, T: 2, P: 1 }),
          enneagramWeights: JSON.stringify({ '5': 3, '7': 2 }),
        },
        {
          choiceText: 'İnsan ruhunun, sanatın ve psikolojinin derinliklerini inceleyen felsefi ve sanatsal eserleri okurum.',
          mbtiWeights: JSON.stringify({ N: 3, F: 3, I: 2 }),
          enneagramWeights: JSON.stringify({ '4': 3, '9': 2 }),
        },
        {
          choiceText: 'Toplumların adil yönetimi, ekolojik denge ve küresel ekonomi stratejilerini içeren planları incelerim.',
          mbtiWeights: JSON.stringify({ S: 2, J: 3, T: 2 }),
          enneagramWeights: JSON.stringify({ '1': 3, '3': 2, '8': 1 }),
        },
      ],
    },
    {
      order: 15,
      title: 'Mezuniyet ve Nişan Seçimi',
      narrativeText: 'Akademideki yolculuğun sona eriyor. Büyük Avlu\'da Baş Üstat sana üç farklı sembolik nişan sunuyor. Bu nişan, senin hayat boyu taşıyacağın ana pusulan olacak.',
      sceneType: 'STORY',
      choices: [
        {
          choiceText: 'Bilginin, analitik zekanın ve sürekli gerçeği arayışın sembolü olan "BİLGELİK MEŞALESİ" nişanını seçerim.',
          mbtiWeights: JSON.stringify({ I: 2, T: 3, N: 2 }),
          enneagramWeights: JSON.stringify({ '5': 3, '1': 2 }),
        },
        {
          choiceText: 'Cesaretin, liderliğin, büyük hedeflerin ve eyleme geçmenin sembolü olan "ZAFER KANATLARI" nişanını seçerim.',
          mbtiWeights: JSON.stringify({ E: 3, T: 2, J: 2 }),
          enneagramWeights: JSON.stringify({ '3': 3, '8': 3 }),
        },
        {
          choiceText: 'İnsan sevgisinin, yaratıcılığın, uyumun ve toplumsal faydanın sembolü olan "YAŞAM AĞACI" nişanını seçerim.',
          mbtiWeights: JSON.stringify({ F: 3, N: 2, P: 2 }),
          enneagramWeights: JSON.stringify({ '2': 3, '4': 2, '9': 2 }),
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
