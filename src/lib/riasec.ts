export type RiasecCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export type RiasecItem = { id: number; code: RiasecCode; text: string };

// O*NET Mini Interest Profiler v2.0 maddelerinin FutuRoute tarafından yapılmış Türkçe uyarlamasıdır.
// Pilot kullanımdan önce rehberlik uzmanının dil ve yaş uygunluğu doğrulaması zorunludur.
export const RIASEC_ITEMS: RiasecItem[] = [
  { id: 1, code: 'R', text: 'Mutfak dolapları yapmak' },
  { id: 2, code: 'I', text: 'Yeni bir ilaç geliştirmek' },
  { id: 3, code: 'A', text: 'Kitap veya tiyatro oyunu yazmak' },
  { id: 4, code: 'S', text: 'Kişisel ya da duygusal sorunlar yaşayan insanlara yardımcı olmak' },
  { id: 5, code: 'E', text: 'Büyük bir şirkette bir departmanı yönetmek' },
  { id: 6, code: 'C', text: 'Büyük bir ağdaki bilgisayarlara yazılım kurmak' },
  { id: 7, code: 'R', text: 'Ev aletlerini onarmak' },
  { id: 8, code: 'I', text: 'Su kirliliğini azaltmanın yollarını araştırmak' },
  { id: 9, code: 'A', text: 'Müzik bestelemek veya düzenlemek' },
  { id: 10, code: 'S', text: 'İnsanlara kariyer rehberliği yapmak' },
  { id: 11, code: 'E', text: 'Kendi işini kurmak' },
  { id: 12, code: 'C', text: 'Hesap makinesiyle sayısal işlemler yapmak' },
  { id: 13, code: 'R', text: 'Elektronik parçaları birleştirmek' },
  { id: 14, code: 'I', text: 'Kimya deneyleri yapmak' },
  { id: 15, code: 'A', text: 'Filmler için özel efektler tasarlamak' },
  { id: 16, code: 'S', text: 'Rehabilitasyon çalışmalarında insanlara destek olmak' },
  { id: 17, code: 'E', text: 'İş sözleşmeleri üzerine görüşme ve pazarlık yapmak' },
  { id: 18, code: 'C', text: 'Sevkiyat ve teslim alma kayıtlarını tutmak' },
  { id: 19, code: 'R', text: 'Ofislere ve evlere paket teslim etmek için kamyon kullanmak' },
  { id: 20, code: 'I', text: 'Kan örneklerini mikroskopla incelemek' },
  { id: 21, code: 'A', text: 'Tiyatro oyunları için sahne dekorlarını boyamak' },
  { id: 22, code: 'S', text: 'Kâr amacı gütmeyen bir kuruluşta gönüllü çalışmak' },
  { id: 23, code: 'E', text: 'Yeni bir giyim ürün grubunu pazarlamak' },
  { id: 24, code: 'C', text: 'El bilgisayarıyla malzeme envanteri tutmak' },
  { id: 25, code: 'R', text: 'Ürün parçalarının sevkiyat öncesi kalitesini test etmek' },
  { id: 26, code: 'I', text: 'Hava durumunu daha iyi tahmin edecek bir yöntem geliştirmek' },
  { id: 27, code: 'A', text: 'Film veya televizyon programları için senaryo yazmak' },
  { id: 28, code: 'S', text: 'Bir lise sınıfında ders vermek' },
  { id: 29, code: 'E', text: 'Bir mağazada ürün satmak' },
  { id: 30, code: 'C', text: 'Bir kurumda postaları damgalamak, ayırmak ve dağıtmak' },
];

export const RIASEC_VERSION = 'futuroute-tr-mini-ip-2.0-provisional-2026-08';
export const RIASEC_LICENSE_URL = 'https://www.onetcenter.org/license_toolsdev.html';

export function scoreRiasec(answers: number[]) {
  if (answers.length !== RIASEC_ITEMS.length || answers.some((value) => !Number.isInteger(value) || value < 1 || value > 5)) {
    throw new Error('RIASEC yanıtları 30 adet ve 1–5 aralığında olmalıdır.');
  }
  const scores: Record<RiasecCode, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  RIASEC_ITEMS.forEach((item, index) => { scores[item.code] += answers[index]; });
  const topCodes = (Object.entries(scores) as Array<[RiasecCode, number]>)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3).map(([code]) => code);
  return { scores, topCodes };
}
