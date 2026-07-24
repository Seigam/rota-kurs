export interface CompulsoryGradeLevel {
  grade: string;
  focus: string;
  flowStep: string;
  description: string;
  badgeColor: string;
  courses: Array<{
    title: string;
    description: string;
    skills: string[];
  }>;
}

export interface ElectiveCategory {
  id: string;
  title: string;
  iconName: string;
  color: string;
  description: string;
  courses: Array<{
    title: string;
    level: string;
    duration: string;
    description: string;
    tags: string[];
  }>;
}

export const COMPULSORY_GRADE_LEVELS: CompulsoryGradeLevel[] = [
  {
    grade: 'Hazırlık Sınıfı',
    focus: 'Okuryazarlık ve Dijital Temel',
    flowStep: 'Temel Kademe',
    description: 'Akademik yolculuğa güçlü bir başlangıç yapmak için temel okuryazarlık ve dijital beceriler kazandırır.',
    badgeColor: 'from-blue-500 to-cyan-500',
    courses: [
      {
        title: 'Matematik Okuryazarlığı',
        description: 'Günlük yaşam durumlarını matematiksel olarak modelleme, mantıksal akıl yürütme ve problem çözme becerileri.',
        skills: ['Analitik Düşünme', 'Veri Yorumlama', 'Mantık'],
      },
      {
        title: 'Fen Okuryazarlığı',
        description: 'Bilimsel süreç becerileri, doğa olaylarını sorgulama, hipotez kurma ve kanıta dayalı çıkarım yapma.',
        skills: ['Bilimsel Metot', 'Gözlem', 'Sorgulama'],
      },
      {
        title: 'Hızlı Okuma Teknikleri',
        description: 'Göz kaslarını geliştirme, odaklanma süresini artırma ve anlama kapasitesini yükselterek hızlı okuma.',
        skills: ['Odaklanma', 'Bilişsel Hız', 'Kavrama'],
      },
      {
        title: 'Dijital Okuryazarlık',
        description: 'Güvenli internet kullanımı, dijital içerik doğrulama, temel dosya yönetimi ve dijital araçlar.',
        skills: ['Dijital Güvenlik', 'Arama Becerileri', 'Veri Yönetimi'],
      },
    ],
  },
  {
    grade: '9. Sınıf',
    focus: 'Öğrenme, İletişim, Finans, AI',
    flowStep: 'Öz Farkındalık',
    description: 'Lise hayatına uyum sağlarken bireysel öğrenme stillerini keşfetme ve yapay zeka çağına ilk adımı atma.',
    badgeColor: 'from-indigo-500 to-purple-500',
    courses: [
      {
        title: 'Öğrenmeyi Öğrenme',
        description: 'Bireysel öğrenme stillerini tespit etme, verimli not tutma (Cornell, zihin haritası) ve bellek teknikleri.',
        skills: ['Metabiliş', 'Hafıza Teknikleri', 'Zaman Yönetimi'],
      },
      {
        title: 'Etkili Sunum ve İletişim Teknikleri',
        description: 'Topluluk önünde konuşma, beden dili kullanımı, ikna edici sunum slaytları hazırlama.',
        skills: ['Hitabet', 'Beden Dili', 'Hikaye Anlatımı'],
      },
      {
        title: 'Finansal Okuryazarlık',
        description: 'Kişisel bütçe yapma, tasarruf bilinci, harcama alışkanlıklarını yönetme ve para kavramı.',
        skills: ['Bütçe Yönetimi', 'Tasarruf', 'Ekonomi Temelleri'],
      },
      {
        title: 'Yapay Zeka Okuryazarlığı',
        description: 'Yapay zekanın çalışma mantığı, LLM yapıları, yapay zeka araçlarını öğrenme sürecine entegre etme.',
        skills: ['Yapay Zeka Mantığı', 'Prompt Temelleri', 'Dijital Etik'],
      },
    ],
  },
  {
    grade: '10. Sınıf',
    focus: 'Araştırma, Girişimcilik, Liderlik',
    flowStep: 'Üretim ve Proje',
    description: 'Fikirleri somut projelere dönüştürme, bilimsel araştırma metodolojisi ve liderlik pratikleri.',
    badgeColor: 'from-purple-500 to-pink-500',
    courses: [
      {
        title: 'Bilimsel Proje Hazırlama Teknikleri',
        description: 'TÜBİTAK ve uluslararası yarışmalar için hipotez testi, literatür taraması ve raporlama.',
        skills: ['Araştırma Metodu', 'Raporlama', 'Hipotez Testi'],
      },
      {
        title: 'Girişimcilik Temelleri',
        description: 'Problem tespiti, iş fikri geliştirme, Canvas modeli ve müşteri doğrulaması.',
        skills: ['Problem Çözme', 'İş Modeli', 'İnovasyon'],
      },
      {
        title: 'Küresel Liderlik',
        description: 'Takım çalışması, ortak hedef etrafında birleşme, kriz yönetimi ve delegasyon becerileri.',
        skills: ['Takım Yönetimi', 'Empatik Liderlik', 'Kriz Yönetimi'],
      },
      {
        title: 'Portfolyo Hazırlama Teknikleri',
        description: 'Akademik ve kişisel projeleri uluslararası standartlarda dijital portfolyoya dönüştürme.',
        skills: ['Sunum', 'Kişisel Markalaşma', 'Belgeleme'],
      },
    ],
  },
  {
    grade: '11. Sınıf',
    focus: 'Kariyer, Dünya Vatandaşlığı, Tasarım Odaklı Düşünme',
    flowStep: 'Dünyaya Açılma',
    description: 'Geleceğin mesleklerini keşfetme, küresel meselelere duyarlılık ve insan odaklı tasarım.',
    badgeColor: 'from-emerald-500 to-teal-500',
    courses: [
      {
        title: 'Kariyer Planlama & Hedef Belirleme',
        description: 'Üniversite ve bölüm araştırmaları, staj/proje fırsatları, SMART hedef metodolojisi.',
        skills: ['Kariyer Stratejisi', 'SMART Hedef', 'Sektör Analizi'],
      },
      {
        title: 'Dünya Vatandaşlığı & Sürdürülebilirlik',
        description: 'Birleşmiş Milletler 17 Sürdürülebilir Kalkınma Amacı, küresel çevre bilinci ve kültürel çeşitlilik.',
        skills: ['Küresel Farkındalık', 'Sürdürülebilirlik', 'Sosyal Sorumluluk'],
      },
      {
        title: 'Tasarım Odaklı Düşünme (Design Thinking)',
        description: 'Empati kurma, problemi tanımlama, fikir üretme, prototipleme ve test etme süreçleri.',
        skills: ['Design Thinking', 'Prototipleme', 'Empati'],
      },
      {
        title: 'İlk Yardım & Yaşam Egzersizleri',
        description: 'Temel ilk yardım müdahaleleri, afet bilinci, fiziksel duruş ve egzersiz rutinleri.',
        skills: ['İlk Yardım', 'Sağlıklı Yaşam', 'Ergonomi'],
      },
    ],
  },
  {
    grade: '12. Sınıf',
    focus: 'Startup, İyi Oluş, Yaşam Becerileri',
    flowStep: 'Geçiş ve Kariyer',
    description: 'Üniversiteye ve yetişkinlik hayatına geçişte sınav stresi yönetimi, ruh sağlığı ve girişimci zihniyet.',
    badgeColor: 'from-amber-500 to-orange-500',
    courses: [
      {
        title: 'Start Up Oluşturma & Yatırımcı Ekosistemi',
        description: 'Bir fikri şirkete dönüştürme, melek yatırımcılar, fonlama süreçleri ve lansman stratejileri.',
        skills: ['Girişimcilik', 'Fonlama', 'Lansman'],
      },
      {
        title: 'Ruh Sağlığı, Mindfulness & Well-Being',
        description: 'Sınav stresi ve kaygı yönetimi, duygusal dayanıklılık (resilience), öz şefkat ve farkındalık.',
        skills: ['Stres Yönetimi', 'Duygusal Dayanıklılık', 'Mindfulness'],
      },
    ],
  },
];

export const ELECTIVE_CATEGORIES: ElectiveCategory[] = [
  {
    id: 'ai',
    title: 'Yapay Zeka (AI)',
    iconName: 'Cpu',
    color: 'from-cyan-500 to-blue-600',
    description: 'Yapay zeka araçlarını etkin kullanma, istem mühendisliği (prompting) ve içerik/veri üretimi.',
    courses: [
      {
        title: 'ChatGPT İleri Seviye Kullanımı',
        level: 'Başlangıç - Orta',
        duration: '6 Saat',
        description: 'Eğitim ve günlük çalışmalarda ChatGPT’yi kişisel asistana dönüştürme yöntemleri.',
        tags: ['ChatGPT', 'AI Asistan', 'Verimlilik'],
      },
      {
        title: 'Prompt Engineering (İstem Mühendisliği)',
        level: 'Orta',
        duration: '8 Saat',
        description: 'Yapay zeka modellerinden kusursuz ve doğru yanıtlar almak için istem yazma teknikleri.',
        tags: ['Prompting', 'LLM', 'Mühendislik'],
      },
      {
        title: 'AI Etiği ve Sorumlu Kullanım',
        level: 'Her Seviye',
        duration: '4 Saat',
        description: 'Telif hakları, halüsinasyon riski, veri gizliliği ve yapay zekanın etik boyutları.',
        tags: ['Etik', 'Veri Gizliliği', 'Sorumluluk'],
      },
      {
        title: 'AI ile Görsel ve İçerik Üretme',
        level: 'Başlangıç',
        duration: '6 Saat',
        description: 'Midjourney, DALL-E ve Canva AI araçlarıyla kreatif görsel ve metin tasarımı.',
        tags: ['Görsel Tasarım', 'Kreatif', 'Midjourney'],
      },
      {
        title: 'AI ile Veri Analizi ve Modelleme',
        level: 'İleri',
        duration: '10 Saat',
        description: 'Büyük veri kümesini yapay zeka araçları ve Python kütüphaneleri ile anlamlandırma.',
        tags: ['Veri Analizi', 'Python', 'Machine Learning'],
      },
      {
        title: 'Popüler AI Araçları & Uygulamaları',
        level: 'Başlangıç',
        duration: '5 Saat',
        description: 'Notion AI, Perplexity, Claude ve Suno gibi güncel yapay zeka araçlarının incelemesi.',
        tags: ['AI Tools', 'Perplexity', 'Notion AI'],
      },
    ],
  },
  {
    id: 'citizenship',
    title: 'Dünya Vatandaşlığı',
    iconName: 'Globe',
    color: 'from-blue-500 to-indigo-600',
    description: 'Küresel sorunlara çözüm üreten, kültürlerarası iletişim gücüne sahip bireyler olma.',
    courses: [
      {
        title: 'Birleşmiş Milletler & Model UN (MUN)',
        level: 'Başlangıç',
        duration: '8 Saat',
        description: 'MUN konferanslarına hazırlık, konuşma taslakları ve diplomatik müzakere usulleri.',
        tags: ['MUN', 'Diplomasi', 'BM'],
      },
      {
        title: 'Sürdürülebilir Kalkınma Amaçları (SDG)',
        level: 'Her Seviye',
        duration: '5 Saat',
        description: 'BM 17 Sürdürülebilir Kalkınma Hedefi etrafında sosyal sorumluluk projesi geliştirme.',
        tags: ['SDG', 'Sosyal Etki', 'Sürdürülebilirlik'],
      },
      {
        title: 'Kültürlerarası İletişim',
        level: 'Her Seviye',
        duration: '4 Saat',
        description: 'Farklı kültürlerden insanlarla önyargısız, empatik ve etkili iletişim kurma.',
        tags: ['Kültür', 'İletişim', 'Empati'],
      },
      {
        title: 'İklim Değişikliği & Ekolojik Okuryazarlık',
        level: 'Her Seviye',
        duration: '6 Saat',
        description: 'Karbon ayak izi hesaplama, yeşil enerji, sıfır atık ve sürdürülebilir yaşam.',
        tags: ['İklim Krizi', 'Karbon İz', 'Yeşil Enerji'],
      },
      {
        title: 'İnsan Hakları & Evrensel Hukuk',
        level: 'Orta',
        duration: '5 Saat',
        description: 'Temel hak ve özgürlükler, dijital haklar ve küresel adalet ilkeleri.',
        tags: ['İnsan Hakları', 'Hukuk', 'Adalet'],
      },
      {
        title: 'Sivil Toplum & Gönüllülük Yönetimi',
        level: 'Başlangıç',
        duration: '6 Saat',
        description: 'STK projesinde rol alma, gönüllü organizasyonları yönetme ve sosyal fayda.',
        tags: ['STK', 'Gönüllülük', 'Sosyal Fayda'],
      },
    ],
  },
  {
    id: 'career',
    title: 'Kariyer & Gelecek Planlama',
    iconName: 'Briefcase',
    color: 'from-purple-500 to-pink-600',
    description: 'Özgeçmiş hazırlamadan mülakatlara, LinkedIn ağından yurt dışı eğitim burslarına.',
    courses: [
      {
        title: 'Profesyonel CV Hazırlama',
        level: 'Her Seviye',
        duration: '3 Saat',
        description: 'ATS uyumlu, dikkat çeken modern özgeçmiş ve ön niyet mektubu (Cover Letter) hazırlama.',
        tags: ['CV', 'ATS', 'Özgeçmiş'],
      },
      {
        title: 'LinkedIn Profil Optimizasyonu & Networking',
        level: 'Başlangıç - Orta',
        duration: '5 Saat',
        description: 'LinkedIn’de doğru kişilere ulaşma, içerik paylaşma ve profesyonel ağ kurma.',
        tags: ['LinkedIn', 'Networking', 'Kişisel Marka'],
      },
      {
        title: 'Üniversite Başvuruları & Niyet Mektubu',
        level: 'Orta - İleri',
        duration: '6 Saat',
        description: 'Yurt içi ve yurt dışı üniversite başvurularında öne çıkacak niyet mektubu yazımı.',
        tags: ['Üniversite', 'Niyet Mektubu', 'Başvuru'],
      },
      {
        title: 'Erasmus & Yurt Dışı Fırsatları',
        level: 'Her Seviye',
        duration: '4 Saat',
        description: 'Avrupa Dayanışma Programı (ESC), gençlik değişimleri ve burs kanalları.',
        tags: ['Erasmus', 'ESC', 'Burs'],
      },
      {
        title: 'Mülakat Teknikleri & Beden Dili',
        level: 'Orta',
        duration: '5 Saat',
        description: 'İş ve burs mülakatlarında zorlu sorulara verilen yanıtlar ve simülasyonlar.',
        tags: ['Mülakat', 'STAR Metodu', 'Beden Dili'],
      },
      {
        title: 'Stratejik Networking & İlişki Yönetimi',
        level: 'Orta',
        duration: '4 Saat',
        description: 'Akademik ve profesyonel dünyada mentör bulma ve kalıcı bağlar inşa etme.',
        tags: ['Mentörlük', 'Networking', 'Kariyer'],
      },
    ],
  },
  {
    id: 'design',
    title: 'Tasarım & Yaratıcılık',
    iconName: 'Palette',
    color: 'from-pink-500 to-rose-600',
    description: 'Grafik tasarım, UI/UX, 3D modelleme, video kurgu ve içerik üretimi.',
    courses: [
      {
        title: 'Canva ile Profesyonel Görsel Tasarım',
        level: 'Başlangıç',
        duration: '4 Saat',
        description: 'Sosyal medya görselleri, poster, sunum ve afiş tasarlamanın pratik yolları.',
        tags: ['Canva', 'Grafik', 'Sosyal Medya'],
      },
      {
        title: 'Photoshop Temelleri & Görsel Düzenleme',
        level: 'Orta',
        duration: '10 Saat',
        description: 'Katman mantığı, dekupe yapma, renk ayarları ve manipülasyon teknikleri.',
        tags: ['Photoshop', 'Adobe', 'Görsel'],
      },
      {
        title: 'UI/UX Tasarımına Giriş (Figma)',
        level: 'Orta',
        duration: '12 Saat',
        description: 'Web ve mobil uygulama arayüz tasarımı, wireframe çıkarma ve Figma prototipleme.',
        tags: ['Figma', 'UI/UX', 'Arayüz Tasarımı'],
      },
      {
        title: '3D Tasarım & Blender Temelleri',
        level: 'Orta - İleri',
        duration: '15 Saat',
        description: 'Blender ile 3 boyutlu obje modelleme, kaplama ve ışıklandırma teknikleri.',
        tags: ['Blender', '3D', 'Modelleme'],
      },
      {
        title: 'Video Kurgu & Montaj (CapCut / Premiere)',
        level: 'Başlangıç - Orta',
        duration: '8 Saat',
        description: 'Video kesme, geçiş efektleri, ses düzenleme ve sosyal medya kurgusu.',
        tags: ['Video Edit', 'CapCut', 'Premiere Pro'],
      },
    ],
  },
  {
    id: 'entrepreneurship',
    title: 'Girişimcilik & İnovasyon',
    iconName: 'Rocket',
    color: 'from-orange-500 to-amber-600',
    description: 'Fikirden ürüne, şirket kurmaktan yatırımcı sunumuna kadar girişimcilik yolculuğu.',
    courses: [
      {
        title: 'Fikir Bulma & Problem Tespiti',
        level: 'Başlangıç',
        duration: '4 Saat',
        description: 'Pazardaki boşlukları görme, müşteri görüşmeleri yapma ve fikir doğrulama.',
        tags: ['İnovasyon', 'Fikir', 'Pazar Araştırması'],
      },
      {
        title: 'MVP (Minimum Viable Product) Hazırlama',
        level: 'Orta',
        duration: '8 Saat',
        description: 'En az maliyetle çalışan ilk prototipi geliştirme ve kullanıcı testleri.',
        tags: ['MVP', 'Prototip', 'Agile'],
      },
      {
        title: 'İş Modeli Kanvası (Business Model Canvas)',
        level: 'Orta',
        duration: '5 Saat',
        description: 'Bir girişimin 9 temel yapı taşını (değer önerisi, gelir modeli vb.) haritalama.',
        tags: ['BMC', 'Gelir Modeli', 'Strateji'],
      },
      {
        title: 'Pitch Deck & Yatırımcı Sunumu',
        level: 'İleri',
        duration: '6 Saat',
        description: 'Etkileyici 10 slaytlık yatırımcı sunumu hazırlama ve sunum teknikleri.',
        tags: ['Pitch Deck', 'Yatırımcı', 'Sunum'],
      },
      {
        title: 'Startup Kurma & Hukuki Süreçler',
        level: 'İleri',
        duration: '6 Saat',
        description: 'Şirket türleri, ortaklık sözleşmeleri ve girişim hukuku temelleri.',
        tags: ['Startup', 'Hukuk', 'Şirketleşme'],
      },
      {
        title: 'Patent, Marka & Telif Hakları',
        level: 'Orta',
        duration: '4 Saat',
        description: 'Fikri mülkiyet haklarını koruma, marka tescili ve patent başvurusu.',
        tags: ['Patent', 'Marka', 'Telif'],
      },
    ],
  },
  {
    id: 'finance',
    title: 'Finans & Yatırım',
    iconName: 'TrendingUp',
    color: 'from-emerald-500 to-green-600',
    description: 'Bütçe yönetiminden borsaya, kripto varlıklardan girişim finansmanına.',
    courses: [
      {
        title: 'Kişisel Bütçe Yönetimi & Tasarruf',
        level: 'Başlangıç',
        duration: '3 Saat',
        description: 'Gelir-gider takibi, 50/30/20 kuralı ve finansal disiplin kazanma.',
        tags: ['Bütçe', 'Tasarruf', 'Kişisel Finans'],
      },
      {
        title: 'Borsa & Yatırım Temelleri',
        level: 'Orta',
        duration: '8 Saat',
        description: 'Hisse senetleri, finansal okuryazarlık, şirket bilançoları okuma.',
        tags: ['Borsa', 'Hisse', 'Yatırım'],
      },
      {
        title: 'Yatırım Fonları & BES',
        level: 'Orta',
        duration: '5 Saat',
        description: 'TEFAS fonları, Bireysel Emeklilik Sistemi (BES) ve uzun vadeli birikim.',
        tags: ['Fonlar', 'BES', 'Portföy'],
      },
      {
        title: 'Kripto Varlıklar & Blockchain Riskleri',
        level: 'Orta',
        duration: '6 Saat',
        description: 'Kripto paraların mantığı, cüzdan güvenliği ve piyasa risklerinin analizi.',
        tags: ['Kripto', 'Risk Analizi', 'Bitcoin'],
      },
      {
        title: 'Girişim Finansmanı & Değerleme',
        level: 'İleri',
        duration: '7 Saat',
        description: 'Startup değerleme yöntemleri, cap table oluşturma ve yatırım turları.',
        tags: ['Finansman', 'Değerleme', 'Cap Table'],
      },
      {
        title: 'Temel Vergi & Sigorta Okuryazarlığı',
        level: 'Başlangıç',
        duration: '4 Saat',
        description: 'KDV, gelir vergisi, SGK ve finansal yasal sorumluluklar.',
        tags: ['Vergi', 'Sigorta', 'Mevzuat'],
      },
    ],
  },
  {
    id: 'digital',
    title: 'Dijital Dünya & Güvenlik',
    iconName: 'Shield',
    color: 'from-teal-500 to-emerald-600',
    description: 'Siber güvenlik, veri gizliliği, blockchain ve bulut teknolojileri.',
    courses: [
      {
        title: 'Siber Güvenlik Temelleri & Oltalama Koruması',
        level: 'Başlangıç',
        duration: '6 Saat',
        description: 'Güçlü şifre yönetimi, 2FA, oltalama (phishing) saldırılarını tespit etme.',
        tags: ['Siber Güvenlik', 'Phishing', 'Şifre'],
      },
      {
        title: 'Dijital Ayak İzi & Veri Gizliliği (KVKK/GDPR)',
        level: 'Her Seviye',
        duration: '4 Saat',
        description: 'Sosyal medyada bırakılan dijital izler ve kişisel verilerin korunması.',
        tags: ['Veri Gizliliği', 'KVKK', 'Dijital İz'],
      },
      {
        title: 'Blockchain Teknolojisi Nasıl Çalışır?',
        level: 'Orta',
        duration: '7 Saat',
        description: 'Merkeziyetsizlik, akıllı sözleşmeler ve blockchain altyapısı.',
        tags: ['Blockchain', 'Smart Contracts', 'Web3'],
      },
      {
        title: 'Bulut Teknolojileri (AWS / Google Cloud)',
        level: 'Orta',
        duration: '8 Saat',
        description: 'Cloud computing temelleri, veri depolama ve sunucu yönetimi.',
        tags: ['Cloud', 'AWS', 'Google Cloud'],
      },
    ],
  },
  {
    id: 'leadership',
    title: 'Liderlik & Yönetim',
    iconName: 'Users',
    color: 'from-indigo-500 to-blue-600',
    description: 'Takım yönetimi, müzakere, karar verme ve duygusal zeka becerileri.',
    courses: [
      {
        title: 'Liderlik Stilleri & Takım Yönetimi',
        level: 'Orta',
        duration: '6 Saat',
        description: 'Çeşitli liderlik modelleri, takımı motive etme ve performans takibi.',
        tags: ['Liderlik', 'Takım', 'Yönetim'],
      },
      {
        title: 'İkna & Müzakere Teknikleri',
        level: 'Orta - İleri',
        duration: '6 Saat',
        description: 'Win-win müzakere stratejileri, zor durumları yönetme ve ikna sanatı.',
        tags: ['Müzakere', 'İkna', 'Anlaşma'],
      },
      {
        title: 'Duygusal Zeka (EQ) & Öz Yönetim',
        level: 'Her Seviye',
        duration: '5 Saat',
        description: 'Öz farkındalık, empati kurma ve stres altında doğru kararlar alma.',
        tags: ['Duygusal Zeka', 'EQ', 'Farkındalık'],
      },
      {
        title: 'Karmaşık Problem Çözme (Complex Problem Solving)',
        level: 'Orta',
        duration: '6 Saat',
        description: 'Kök neden analizi, Balık Kılçığı ve 5 Neden yöntemiyle çözüm üretme.',
        tags: ['Problem Çözme', 'Kök Neden', 'Mantık'],
      },
    ],
  },
  {
    id: 'research',
    title: 'Araştırma & Bilim',
    iconName: 'Search',
    color: 'from-violet-500 to-purple-600',
    description: 'Bilimsel araştırma metodolojisi, akademik yazım ve TÜBİTAK projeleri.',
    courses: [
      {
        title: 'Bilimsel Araştırma Yöntemleri',
        level: 'Orta',
        duration: '8 Saat',
        description: 'Nitel ve nicel araştırma yöntemleri, anket tasarımı ve örneklem seçimi.',
        tags: ['Bilimsel Araştırma', 'Metodoloji', 'Veri'],
      },
      {
        title: 'Akademik Makale Yazımı & Kaynak Gösterme',
        level: 'İleri',
        duration: '8 Saat',
        description: 'APA, MLA formatında kaynak gösterme, intihal (plagiarism) kontrolü.',
        tags: ['Akademik Yazım', 'APA', 'Referans'],
      },
      {
        title: 'TÜBİTAK Lise Projeleri Rehberi',
        level: 'Orta',
        duration: '6 Saat',
        description: '2204-A ve 2204-B TÜBİTAK yarışmalarına derece getiren proje hazırlama.',
        tags: ['TÜBİTAK', '2204', 'Proje'],
      },
      {
        title: 'Temel İstatistik & Veri Analizi (SPSS / Excel)',
        level: 'Orta',
        duration: '10 Saat',
        description: 'Excel ve SPSS ile veri temizleme, korelasyon ve hipotez testleri.',
        tags: ['İstatistik', 'Excel', 'SPSS'],
      },
    ],
  },
  {
    id: 'tech',
    title: 'Teknoloji & Kodlama',
    iconName: 'Code',
    color: 'from-blue-600 to-indigo-700',
    description: 'Robotik, IoT, yazılım geliştirme, oyun yapımı ve veri bilimi.',
    courses: [
      {
        title: 'Robotik & Arduino ile Kodlama',
        level: 'Başlangıç',
        duration: '12 Saat',
        description: 'Sensörler, motorlar ve Arduino mikrodenetleyici ile robot projeleri.',
        tags: ['Arduino', 'Robotik', 'Sensör'],
      },
      {
        title: 'IoT (Nesnelerin İnterneti) ve Raspberry Pi',
        level: 'Orta',
        duration: '14 Saat',
        description: 'Akıllı ev ve akıllı tarım sistemleri için akıllı cihazlar tasarlama.',
        tags: ['IoT', 'Raspberry Pi', 'Akıllı Cihazlar'],
      },
      {
        title: 'Unity ile 2D/3D Oyun Geliştirme',
        level: 'Orta',
        duration: '18 Saat',
        description: 'C# dili ve Unity motoru ile kendi bilgisayar/mobil oyununu yapma.',
        tags: ['Unity', 'C#', 'Oyun Yapımı'],
      },
      {
        title: 'Python ile Mobil ve Web Tasarım Temelleri',
        level: 'Başlangıç - Orta',
        duration: '15 Saat',
        description: 'HTML, CSS, JavaScript ve Python ile modern web siteleri inşa etme.',
        tags: ['Web Tasarım', 'Python', 'Frontend'],
      },
      {
        title: 'Veri Bilimi ve Makine Öğrenmesine Giriş',
        level: 'İleri',
        duration: '20 Saat',
        description: 'Pandas, NumPy ve Scikit-learn kütüphaneleri ile yapay zeka modelleri.',
        tags: ['Veri Bilimi', 'Machine Learning', 'Python'],
      },
    ],
  },
  {
    id: 'health',
    title: 'Sağlık & İnsan Bilimleri',
    iconName: 'Activity',
    color: 'from-rose-500 to-red-600',
    description: 'Genetik, nörobilim, psikoloji, biyoteknoloji ve insan fizyolojisi.',
    courses: [
      {
        title: 'Genetik & CRISPR Biyoteknolojisi',
        level: 'Orta',
        duration: '8 Saat',
        description: 'DNA yapısı, gen düzenleme teknolojisi CRISPR ve geleceğin tıp çözümleri.',
        tags: ['Genetik', 'CRISPR', 'Biyoteknoloji'],
      },
      {
        title: 'Nörobilim: Beyin Nasıl Öğrenir?',
        level: 'Her Seviye',
        duration: '6 Saat',
        description: 'Nöroplastisite, hafıza mekanizmaları ve odaklanmanın nörolojik temelleri.',
        tags: ['Nörobilim', 'Beyin', 'Hafıza'],
      },
      {
        title: 'Gelişim Psikolojisi & İnsan Davranışı',
        level: 'Her Seviye',
        duration: '6 Saat',
        description: 'İnsan davranışlarının ardındaki psikolojik dinamikler ve zihin kuramı.',
        tags: ['Psikoloji', 'İnsan Davranışı', 'Zihin'],
      },
      {
        title: 'Spor Bilimi & Beslenme Fizyolojisi',
        level: 'Başlangıç',
        duration: '5 Saat',
        description: 'Makro besinler, kas fizyolojisi ve sporcu performans yönetimi.',
        tags: ['Spor', 'Beslenme', 'Sağlık'],
      },
    ],
  },
  {
    id: 'media',
    title: 'Medya & Dijital İçerik',
    iconName: 'Video',
    color: 'from-amber-500 to-yellow-600',
    description: 'Podcast yayımcılığı, YouTube içerik stratejisi, dijital pazarlama ve yayıncılık.',
    courses: [
      {
        title: 'Podcast Yayıncılığı & Ses Prodüksiyonu',
        level: 'Başlangıç',
        duration: '6 Saat',
        description: 'Mikrofon seçimi, Audacity ile ses kaydı/kurgusu ve Spotify lansmanı.',
        tags: ['Podcast', 'Ses Kaydı', 'Spotify'],
      },
      {
        title: 'YouTube İçerik Stratejisi & Algoritma',
        level: 'Başlangıç - Orta',
        duration: '8 Saat',
        description: 'Thumbnail tasarımı, SEO uyumlu başlıklar ve izlenme artırma teknikleri.',
        tags: ['YouTube', 'SEO', 'İçerik'],
      },
      {
        title: 'Dijital Pazarlama & Sosyal Medya Yönetimi',
        level: 'Orta',
        duration: '10 Saat',
        description: 'Meta reklamları, hedef kitle analizi, organik büyüme stratejileri.',
        tags: ['Dijital Pazarlama', 'Sosyal Medya', 'Meta Ads'],
      },
      {
        title: 'Fotoğrafçılık & Işık Kullanımı',
        level: 'Başlangıç',
        duration: '6 Saat',
        description: 'Kompozisyon kuralları, mobil ve DSLR makine ile doğru ışık kullanımı.',
        tags: ['Fotoğrafçılık', 'Işık', 'Kompozisyon'],
      },
    ],
  },
  {
    id: 'quantum',
    title: 'Kuantum & Geleceğin Meslekleri',
    iconName: 'Sparkles',
    color: 'from-cyan-400 to-teal-500',
    description: 'Kuantum bilgisayarları, süperpozisyon ve 2030+ geleceğin uzmanlık alanları.',
    courses: [
      {
        title: 'Kuantum Fiziği & Bilgisayarlarına Giriş',
        level: 'Orta - İleri',
        duration: '8 Saat',
        description: 'Qubit, süperpozisyon, dolaşıklık (entanglement) kavramlarının temelleri.',
        tags: ['Kuantum', 'Qubit', 'Fizik'],
      },
      {
        title: 'IBM Qiskit ile Kuantum Algoritmaları',
        level: 'İleri',
        duration: '12 Saat',
        description: 'IBM Quantum platformunda Python kullanarak kuantum devresi kodlama.',
        tags: ['Qiskit', 'IBM Quantum', 'Python'],
      },
      {
        title: '2030+ Geleceğin Meslekleri & Beceri Haritası',
        level: 'Her Seviye',
        duration: '5 Saat',
        description: 'Yapay zeka etiği uzmanlığı, veri mimarlığı, biyoinformatik gibi yükselen alanlar.',
        tags: ['Geleceğin Meslekleri', 'Trendler', 'Kariyer Haritası'],
      },
    ],
  },
];
