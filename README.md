# 🧭 ROTA - Öğrenci Kariyer ve Rehberlik Platformu

Bu proje, öğrencilerin kişilik tiplerini (MBTI & Enneagram tabanlı **RPG Keşif Adası**), kariyer değerlerini, yaşam alanlarındaki **SMART Hedeflerini (Yapay Zeka Destekli)** ve **4 Adımlı Eylem Planlarını (XP Gamification)** interaktif olarak yönettiği yeni nesil bir lise rehberlik platformudur.

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
NEXTAUTH_SECRET="rpg-kariyer-planlama-super-gizli-anahtar-2026"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="gsk_senin_groq_api_anahtarin"
```

### 3. Veritabanını Kurun ve Başlangıç Verilerini Yükleyin
`.env` dosyanızı oluşturduktan sonra sırasıyla şu komutları çalıştırın:

```bash
# 1) Prisma Client tiplerini oluşturun
npx prisma generate

# 2) Veritabanı tablolarını şemaya göre senkronize edin
npx prisma db push

# 3) Başlangıç verilerini (Admin hesabı, örnek sorular vb.) yükleyin
npx prisma db seed
```

### 4. Sunucuyu Başlatın
```bash
npm run dev
```
Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışmaya başlayacaktır.

---

## 🛠️ Teknolojiler
- **Framework:** Next.js 16 (App Router & Turbopack)
- **Veritabanı ORM:** Prisma 7 + PostgreSQL / `@prisma/adapter-pg`
- **Kimlik Doğrulama:** NextAuth.js
- **Yapay Zeka:** Groq API (`llama-3.3-70b-versatile`)
