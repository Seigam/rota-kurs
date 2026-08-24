# FutuRoute UX denetimi ve geliştirme yol haritası

Son güncelleme: 11 Ağustos 2026

## Ürün ilkesi

FutuRoute'un ana işi, öğrenciye bütün özellikleri göstermek değil; belirsizlik içindeyken güvenli ve anlaşılır bir sonraki adımı göstermektir. Yeni kullanıcı akışı bu nedenle şu sıraya bağlandı:

1. Öğrenci hesabı oluştur
2. Temel profili tamamla
3. Değerleri sırala
4. İlk hedefi oluştur
5. Rehberlik envanterini tamamla
6. Kişisel önerileri karşılaştır

## Tamamlanan yüksek öncelikli geliştirmeler

- Herkese açık kayıttan öğretmen ve yönetici rolü alma açığı kapatıldı; kayıt yalnızca öğrenci hesabı oluşturuyor.
- Girişteki gereksiz rol seçimi kaldırıldı. Hesap rolü güvenli biçimde sunucudan belirleniyor.
- Genel bakışa, yalnızca eksik adımları öne çıkaran beş aşamalı “Başlangıç rotası” eklendi.
- Profil kaydından sonra programlara atlayan akış düzeltildi; yeni öğrenci artık değerler adımına gidiyor.
- Profil formunun adım göstergesi klavye dışı tıklanabilir kutular olmaktan çıkarıldı; ileri/geri düğmeleri ayrıldı.
- Kayıt, giriş ve profil alanlarında açık etiketler, alan kimlikleri, `role=alert/status`, `fieldset/legend` ilişkileri eklendi.
- Aile ve destek ağı bilgisi açıkça isteğe bağlı hale getirildi.
- `/student/results` sunucu bileşenindeki istemci `onClick` hatası ayrıştırıldı; sayfa yeniden çalışıyor.
- Favoriler ayrı bir kopya sayfa olmaktan çıkarıldı; `/student/programs?tab=favorites` görünümüne birleştirildi.
- Rehberlik notları profil rapor merkezine alındı; eski danışmanlık adresi bu sekmeye yönleniyor.
- Yönetim program ve kullanıcı adresleri doğru sekmeyi URL üzerinden açıyor.
- Açık yol haritası ve ders rotası, açık tema için kağıt paletine; mevcut derin renkler koyu temaya bağlandı.
- Öğretmen öğrenci tablosu mobilde ana eylemi görünür kartlara dönüştürüldü.
- İç içe `main` bölgeleri kaldırıldı ve ana içerik yapısı sadeleştirildi.

## Birleştirilen veya kaldırılan gereksiz yüzeyler

| Önceki yüzey | Karar | Yeni konum |
|---|---|---|
| Favoriler sayfası | Program listesinin sekmesiyle yineleniyordu | `/student/programs?tab=favorites` |
| Rehberlik notları sayfası | Profil raporlarıyla aynı bilgiyi taşıyordu | `/student/profile?tab=reports` |
| Yönetim programları ve kullanıcıları | Aynı paneli varsayılan sekmeyle açıyordu | URL ile seçili yönetim sekmesi |
| Giriş rolü seçimi | Rol zaten hesaptan biliniyor | Tek giriş formu |

## Kalan geliştirme alanları

### P1 — bileşen ve tasarım sistemi borcu

- Yüzlerce sabit renk değerini semantik tasarım değişkenlerine taşımak.
- `goals-tracker-client.tsx`, `life-domains-matrix.tsx` ve yol haritası gibi büyük bileşenleri görev odaklı alt bileşenlere bölmek.
- 12 pikselin altındaki anlam taşıyan metinleri sistematik olarak büyütmek.
- Genel `transition-all`, sürekli `pulse/bounce` animasyonlarını yalnızca geri bildirim gereken durumlarla sınırlamak.
- Ortak `Button`, `Field`, `Notice`, `EmptyState`, `Tabs` ve `Card` bileşenlerini oluşturmak.

### P2 — ürün doğrulaması

- İlk kez kayıt olan öğrencilerle “ilk kişisel öneriye ulaşma süresi” kullanılabilirlik testi yapmak.
- Başlangıç rotasında terk edilen adımları anonim ürün analitiğiyle ölçmek.
- Öğretmenlerin mobil kartlarda en çok kullandığı bilgi ve eylemleri gözlemlemek.
- Klavye, ekran okuyucu ve %200 yakınlaştırma ile tam WCAG 2.2 AA denetimi yapmak.

## Doğrulama ölçütleri

- Üretim derlemesi başarılı.
- 22 otomatik test başarılı; herkese açık kayıtta rol yükseltme için üç yeni güvenlik testi var.
- ESLint: hata yok.
- Chromium ile kayıt, giriş, öğrenci yönlendirmesi, sonuç raporu, favori sekmesi, profil rapor sekmesi, açık/koyu tema ve 375 px mobil görünüm doğrulandı.
- Test edilen öğrenci sayfalarında yatay sayfa taşması veya tarayıcı konsol hatası görülmedi.

## Uygulanan kaynak ilkeleri

- W3C WAI, uzun formları mantıksal küçük adımlara ayırmayı, ilerlemeyi göstermeyi ve isteğe bağlı adımları açıkça belirtmeyi önerir: https://www.w3.org/WAI/tutorials/forms/multi-page/
- USWDS, adım göstergesinin gezinmenin kendisi değil, ayrı ileri/geri kontrollerini tamamlayan bir ilerleme göstergesi olması gerektiğini belirtir: https://designsystem.digital.gov/components/step-indicator/
- W3C WAI, görünen etiketlerin `for` ve `id` ile kontrollere bağlanmasını ve dinamik hata bildirimlerinin belirgin olmasını önerir: https://www.w3.org/WAI/tutorials/forms/labels/ ve https://www.w3.org/WAI/tutorials/forms/notifications/
- GOV.UK Design System, kullanıcının odağını korumak için her adımda tek karar veya tek bilgi grubuna odaklanmayı önerir: https://design-system.service.gov.uk/get-started/labels-legends-headings/
