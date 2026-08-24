import Link from 'next/link';
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  Compass,
  GraduationCap,
  HeartHandshake,
  Route,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Kendini tanı',
    description: 'Kısa ve oyunlaştırılmış envanterle ilgi alanlarını, güçlü yönlerini ve öğrenme biçimini keşfet.',
    icon: Compass,
  },
  {
    number: '02',
    title: 'Rotanı oluştur',
    description: 'Sana uygun hedefleri, dersleri ve gelişim programlarını tek bir yol haritasında gör.',
    icon: Route,
  },
  {
    number: '03',
    title: 'Adım adım ilerle',
    description: 'Her hafta tek bir önceliğe odaklan; ilerlemeni rehber öğretmeninle birlikte takip et.',
    icon: Target,
  },
];

const audiences = [
  {
    title: 'Öğrenciler için',
    description: 'Karar kalabalığını azaltan, her girişte sıradaki adımı gösteren kişisel bir rehberlik alanı.',
    icon: GraduationCap,
    items: ['Kişisel yol haritası', 'Haftalık hedef takibi', 'Uygun program önerileri'],
  },
  {
    title: 'Rehber öğretmenler için',
    description: 'Öğrencinin ihtiyacını daha hızlı fark etmeyi ve görüşmeleri somut verilerle planlamayı kolaylaştırır.',
    icon: Users,
    items: ['Öğrenci gelişim özeti', 'Danışmanlık notları', 'Öncelik ve risk görünümü'],
  },
];

export default function HomePage() {
  return (
    <div className="paper-shell flex-1 overflow-hidden">
      <section className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-28">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-7 inline-flex min-h-9 items-center gap-2 rounded-full border border-[#d9d3c8] bg-white/80 px-3.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#4f46e5]">
            <Sparkles className="size-4" aria-hidden="true" />
            Lise öğrencileri için kişisel rehber
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.03] tracking-[-0.045em] text-[#172033] sm:text-6xl lg:text-7xl">
            Geleceğini düşünmek
            <span className="relative mx-2 inline-block text-[#4f46e5]">
              karmaşık
              <span className="route-rail absolute -bottom-1 left-0 h-1.5 w-full rounded-full" aria-hidden="true" />
            </span>
            olmak zorunda değil.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#555d6d] sm:text-xl">
            FutuRoute, kendini tanımaktan doğru programa ulaşmaya kadar tüm kariyer yolculuğunu sade, anlaşılır ve uygulanabilir adımlara dönüştürür.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#4f46e5] px-6 py-3.5 text-base font-extrabold text-white shadow-[0_7px_0_#c9c5f8] transition-transform hover:-translate-y-0.5 hover:bg-[#4338ca]">
              Ücretsiz yolculuğa başla
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link href="/login" className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-[#cfc8bc] bg-white px-6 py-3.5 text-base font-extrabold text-[#303849] hover:border-[#9f978a]">
              Zaten hesabım var
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#626a79]" aria-label="Platform özellikleri">
            {['Tek bir sonraki adım', 'Kişiselleştirilmiş rota', 'Rehber öğretmen desteği'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-[#dce9df] text-[#24633b]">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-xl" aria-label="Örnek öğrenci rotası">
          <div className="soft-grid absolute -inset-10 -z-0 rotate-2 rounded-[40px] border border-[#ded9cf]" aria-hidden="true" />
          <div className="paper-card relative z-10 overflow-hidden rounded-[32px] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-[#e6e1d8] pb-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#777e8b]">Bugünkü rotan</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-[#172033]">Merhaba, Ali 👋</h2>
              </div>
              <div className="rounded-2xl bg-[#eeecff] px-3 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#625ab3]">İlerleme</p>
                <p className="text-sm font-black text-[#3730a3]">%65</p>
              </div>
            </div>

            <div className="my-7 rounded-3xl bg-[#4f46e5] p-6 text-white shadow-[0_12px_30px_rgba(79,70,229,0.22)]">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15">
                  <Target className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-100">Sıradaki tek adım</p>
                  <h3 className="mt-1 text-xl font-black">İlgi profilini tamamla</h3>
                  <p className="mt-2 text-sm leading-6 text-indigo-100">Yaklaşık 8 dakika sürer. Sonucunda sana uygun üç alan göreceksin.</p>
                </div>
              </div>
              <div className="mt-5 flex min-h-11 items-center justify-between rounded-xl bg-white px-4 text-sm font-extrabold text-[#3730a3]">
                Başla
                <ArrowRight className="size-4" aria-hidden="true" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ['3', 'Hedef'],
                ['2', 'Program'],
                ['1', 'Görüşme'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-[#f6f2eb] px-2 py-4">
                  <p className="text-xl font-black text-[#172033]">{value}</p>
                  <p className="mt-0.5 text-xs font-bold text-[#6b7280]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="border-y border-[#ded9cf] bg-white/75 py-20 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#4f46e5]">Üç sade adım</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#172033] sm:text-5xl">Nereden başlayacağını hep bil.</h2>
            <p className="mt-4 text-lg leading-8 text-[#626a79]">Tüm araçları aynı anda göstermek yerine, ihtiyaç duyduğun bilgiyi doğru zamanda önüne getiririz.</p>
          </div>

          <ol className="mt-12 grid gap-5 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.number} className="paper-card relative rounded-[28px] p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#eeecff] text-[#4f46e5]">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <span className="text-3xl font-black text-[#ded9cf]" aria-hidden="true">{step.number}</span>
                  </div>
                  <h3 className="mt-7 text-xl font-black text-[#172033]">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[#626a79]">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#e05d48]">Aynı amaç, farklı görünüm</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#172033] sm:text-5xl">Herkese ihtiyacı kadar bilgi.</h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <article key={audience.title} className={`rounded-[32px] border p-7 sm:p-9 ${index === 0 ? 'border-[#cbc6fb] bg-[#eeecff]' : 'border-[#c8ddce] bg-[#eaf3ec]'}`}>
                <Icon className={`size-9 ${index === 0 ? 'text-[#4f46e5]' : 'text-[#2f7047]'}`} aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-black text-[#172033]">{audience.title}</h3>
                <p className="mt-3 max-w-xl leading-7 text-[#555d6d]">{audience.description}</p>
                <ul className="mt-6 grid gap-3">
                  {audience.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-[#303849]">
                      <Check className="size-4 shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] bg-[#172033] px-6 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="absolute right-0 top-0 size-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#e96852]/25 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <HeartHandshake className="size-8 text-[#f2a99c]" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-black tracking-[-0.03em] sm:text-4xl">Bugün tek bir adımla başla.</h2>
            <p className="mt-3 text-lg leading-8 text-slate-300">Profilini oluştur; FutuRoute sana önce ne yapacağını göstersin.</p>
          </div>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link href="/register" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#e96852] px-6 font-extrabold text-white hover:bg-[#d85843]">
              Ücretsiz başla
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link href="/mikro-yeterlilikler" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-white/25 px-6 font-extrabold text-white hover:bg-white/10">
              <BookOpenCheck className="size-5" aria-hidden="true" />
              Kataloğu incele
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#ded9cf] bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-[#686f7d] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-bold text-[#303849]">FutuRoute · Gelecek pusulan</p>
          <p>Öğrenci, aile ve rehber öğretmen arasında daha anlaşılır bir yol.</p>
        </div>
      </footer>
    </div>
  );
}
