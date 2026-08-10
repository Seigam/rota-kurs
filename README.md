# 🧭 FutuRoute - Öğrenci Kariyer ve Rehberlik Platformu

FutuRoute, lise öğrencilerinin akademik hedeflerini belirlemelerini, öğrenme tarzlarını keşfetmelerini, kişisel/akademik profillerini yönetmelerini ve rehberlik süreçlerini takip etmelerini sağlayan yeni nesil bir **Rehberlik ve Kariyer Planlama Platformudur**.

Uygulama, öğrencilerin "Şimdi ne yapmalıyım?" sorusuna akıllı yönlendirmelerle cevap verirken, rehber öğretmenlerin de öğrencilerin akademik gelişimini, hedeflerini ve çözdüğü envanterleri canlı olarak izlemesine olanak tanır.

---

## 🚀 Öne Çıkan Modüller ve Özellikler

### 1. 🗺️ Kariyer Yol Haritası (Career Roadmap) (`/student/roadmap`)
*   **Dinamik Kariyer Adımları:** Öğrencilerin kariyer yolculuğunu oyunlaştırılmış, etkileşimli bir yol haritası arayüzü ile sunan gelişmiş modül.
*   **Merkezi Öğrenci Deneyimi:** Öğrencilerin gelişimlerini görsel olarak takip etmeleri için ana pano deneyimi Yol Haritası etrafında kurgulanmıştır.

### 2. 🎯 Akıllı Öğrenci Paneli (`/student/dashboard`)
*   **Next Best Action (Akıllı Yönlendirme Banner'ı):** Öğrencinin profilindeki eksikleri (Onboarding formu, Kişilik/Öğrenme testi veya haftalık hedef planı) arka planda analiz ederek en kritik adıma yönlendiren dinamik sistem.
*   **Hızlı Erişim Tepsisi (Quick Actions Dock):** Sık kullanılan sayfalara (Görev Takvimi, Profil/İstatistikler, Hedef Sihirbazı, Envanterler) tek tıkla ulaşım sağlayan pratik erişim kartları.
*   **Haftalık Odak ve Ajanda Widget'ı (`WeeklyFocusWidget`):** 7 günlük yatay takvim şeridi, çok günlük veya saat aralıklı görev gösterimleri, ilerleme yüzdesi ve günlük seri (Streak) takibi.

### 3. 👤 Profil & İstatistik Merkezi (`/student/profile`)
Gelişmiş kullanıcı deneyimi için tasarlanmış **3 Sekmeli (Tabbed)** birleşik arayüz:
*   **Sekme 1 - Akademik İstatistikler & Performans:** Toplam planlanan/tamamlanan adımlar, genel başarı oranı (%) grafikleri, kazanılan deneyim puanı (XP) ve seviye bilgisi.
*   **Sekme 2 - Kişisel & Akademik Profilim:** Onboarding sürecinde girilen kişisel bilgilerin dilediği zaman güncellenebildiği canlı form alanı.
*   **Sekme 3 - Rehberlik & Envanter Raporlarım:** MBTI Kişilik Raporu, Değerler Envanteri sonuçları ve rehber öğretmenin paylaştığı yönlendirme notlarının saklandığı profesyonel akademik arşiv.

### 4. 🗓️ Gelişmiş Zaman Planlama & Takvim Arayüzü (`/student/goals`)
*   **Google Takvim Deneyimi:** Başlangıç/bitiş tarihleri, saat seçimi, renk etiketleri ve çok günlük şeritler içeren gelişmiş takvim yerleşimi.
*   **Optimistic UI & Debounce Kilit Sistemi:** Zaman atama işlemlerinde gecikme (lag) hissini sıfırlayan anında arayüz güncellemesi ve çift tıklamaları önleyen buton kilit mekanizması.
*   **Günlük Hover Overview (Özet Popover):** Takvim üzerindeki günlerin üzerine gelindiğinde detayları gösteren şık popover kartları.

### 5. 🧠 Yapay Zeka Destekli Hedef Sihirbazı ve Yaşam Alanları (`/student/domains`)
*   **Yaşam Alanları Matrisi (Life Domains Matrix):** Öğrencinin mevcut durumunu analiz etmek için yenilenmiş, interaktif grid tasarımlı yaşam alanları değerlendirme modülü.
*   **SMART Hedefler:** Öğrencinin yaşam alanlarına ve dileklerine göre Groq API (`llama-3.3-70b-versatile`) entegrasyonu ile otomatik üretilen eylem planları.
*   **Deneyim Puanı (XP) & Seviye:** Tamamlanan hedefler ve adımlar karşılığında kazanılan XP'ler, seviye atlama (Level Up) ve kullanıcıya özel başarı rozetleri.

---

## 🛠️ Teknolojiler ve Altyapı
- **Framework:** Next.js 16 (App Router)
- **Veritabanı ORM:** Prisma 7 + PostgreSQL / SQLite (Yerel geliştirme için)
- **Kimlik Doğrulama:** NextAuth.js (Session & Role tabanlı yetkilendirme)
- **Styling:** Tailwind CSS + Custom Glassmorphism UI
- **Yapay Zeka:** Groq API (`llama-3.3-70b-versatile`)

---

## 👥 Ekip Arkadaşları İçin Kurulum Rehberi (Çok Önemli!)

Git depolarında (`GitHub`) güvenlik gereği `.env` (ortam değişkenleri ve şifreler) ve yerel veritabanı dosyaları (`*.db`) yer almaz. Projeyi klonlayan bir ekip arkadaşınızın yerel bilgisayarında projeyi çalıştırabilmesi için aşağıdaki **4 adımı** uygulaması gerekir:

### 1. Projeyi Klonlayın ve Bağımlılıkları Yükleyin
```bash
git clone https://github.com/Seigam/rota-kurs.git
cd rota-kurs
npm install
```

### 2. Ortam Değişkeni (`.env`) Dosyasını Oluşturun
Proje kök dizininde bulunan şablon **`.env.example`** dosyasını kopyalayarak yeni bir **`.env`** dosyası oluşturun:

- **Windows PowerShell:**
  ```powershell
  Copy-Item .env.example .env
  ```
- **Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

Daha sonra `.env` dosyasını açıp kendi anahtarlarınızı girin (Ekip olarak aynı canlı veritabanını kullanıyorsanız, ortak veritabanı bağlantı linkini `.env` içindeki `DATABASE_URL` alanına yapıştırın):
```env
DATABASE_URL="postgresql://kullanici:sifre@host:5432/veritabani?sslmode=require"
NEXTAUTH_SECRET="uzun-ve-rastgele-bir-deger-uretin"
NEXTAUTH_URL="http://localhost:3000"
AI_API_URL="https://yz.gamehost.dev/v1"
AI_MODEL="Qwen3.5-9B-servis-model-kimligi"
AI_API_KEY="yalniz-sunucuda-saklanan-bearer-token"
```

### 3. Veritabanını Kurun ve Başlangıç Verilerini Yükleyin
`.env` dosyanızı oluşturduktan sonra sırasıyla şu komutları çalıştırın:

```bash
# 1) Prisma Client tiplerini oluşturun
npx prisma generate

# 2) Sürüm kontrollü migration'ları uygulayın
npm run db:migrate:deploy

# 3) Başlangıç verilerini ayrı deployment işi olarak yükleyin
npm run db:seed
```

### 4. Sunucuyu Başlatın
```bash
npm run dev
```
Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışmaya başlayacaktır.
