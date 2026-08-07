import { LifeDomain } from '@prisma/client';

import type { GoalSuggestion, PlanStep } from '@/lib/ai/contracts';
import { getGoalTimeHorizon, type GoalTimeHorizonValue } from '@/lib/goal-time-horizon';

const domainLabels: Partial<Record<LifeDomain, string>> = {
  CAREER: 'kariyer',
  ACADEMIC: 'akademik gelişim',
  PERSONAL_DEV: 'kişisel gelişim',
  SOCIAL: 'sosyal gelişim',
  HEALTH: 'sağlıklı yaşam alışkanlıkları',
  FINANCIAL: 'finansal okuryazarlık',
};

export function safeGoalTemplate(domain: LifeDomain, timeHorizon: GoalTimeHorizonValue): GoalSuggestion[] {
  const label = domainLabels[domain] ?? 'kişisel gelişim';
  const range = getGoalTimeHorizon(timeHorizon).rangeLabel;
  if (timeHorizon === 'SHORT_TERM') {
    return [
      { id: 'goal_1', text: `Önümüzdeki 2 hafta boyunca ${label} alanında haftada üç kısa çalışma oturumu tamamlamak.`, whyItFits: `Seçilen ${range} aralığında düzenli ve ölçülebilir bir başlangıç sunar.` },
      { id: 'goal_2', text: `${label} alanında 4 hafta içinde küçük bir somut çıktı hazırlayıp rehber öğretmenden geri bildirim almak.`, whyItFits: 'Yakın vadede tamamlanabilir bir sonuç üretir ve insan gözetimini sürece dahil eder.' },
      { id: 'goal_3', text: `${label} alanındaki ilerlemeyi 4 hafta boyunca her hafta değerlendirip bir sonraki küçük adımı belirlemek.`, whyItFits: 'Kısa vadeli ilerlemeyi görünür ve yönetilebilir tutar.' },
    ];
  }
  if (timeHorizon === 'LONG_TERM') {
    return [
      { id: 'goal_1', text: `İlk 3 ayda ${label} alanındaki temel becerileri tamamlayıp 12 ay içinde iki aşamalı bir proje üretmek.`, whyItFits: `Seçilen ${range} aralığını temel öğrenme ve uygulama aşamalarına böler.` },
      { id: 'goal_2', text: `${label} alanında 18 ay içinde gelişimi gösteren bir portfolyo hazırlayıp her 3 ayda bir rehber öğretmenle değerlendirmek.`, whyItFits: 'Uzun vadeli ilerlemeyi düzenli kontrol noktaları ve somut kanıtlarla izler.' },
      { id: 'goal_3', text: `${label} alanındaki 24 aylık ana hedefi altı aylık dört kilometre taşına bölerek her aşama sonunda planı güncellemek.`, whyItFits: 'Büyük hedefi sürdürülebilir, ölçülebilir ve gerektiğinde düzenlenebilir hale getirir.' },
    ];
  }
  return [
    { id: 'goal_1', text: `İlk ay ${label} alanında düzenli çalışma rutini kurup 3 ay boyunca haftalık ilerlemeyi kaydetmek.`, whyItFits: `Seçilen ${range} aralığında sürdürülebilir bir çalışma düzeni oluşturur.` },
    { id: 'goal_2', text: `${label} alanında 3 ay içinde somut bir çıktı hazırlayıp rehber öğretmenden geri bildirim almak.`, whyItFits: 'Bir dönem içinde görünür bir sonuç üretir ve insan gözetimini sürece dahil eder.' },
    { id: 'goal_3', text: `${label} alanındaki gelişimi 6 ay boyunca aylık kontrol noktalarıyla izleyip her ay bir sonraki adımı belirlemek.`, whyItFits: 'Orta vadeli hedefi küçük ve ölçülebilir parçalara ayırır.' },
  ];
}

export function safetyGoalTemplate(domain: LifeDomain, timeHorizon: GoalTimeHorizonValue): GoalSuggestion[] {
  if (domain === LifeDomain.HEALTH) {
    return [
      { id: 'goal_1', text: 'Bugün güvendiğim bir yetişkin veya okul rehberlik servisiyle konuşmak.', whyItFits: 'Sağlık ve kriz konuları kişiselleştirilmiş insan desteği gerektirir.' },
      { id: 'goal_2', text: 'Genel iyi oluş alışkanlıklarımı bir hafta boyunca yargılamadan not etmek.', whyItFits: 'Tanı veya tedavi önermeden öz-farkındalığı destekler.' },
      { id: 'goal_3', text: 'Gerekirse veli desteğiyle uygun bir sağlık uzmanına başvuru planı oluşturmak.', whyItFits: 'Uzman değerlendirmesini güvenli biçimde sürece dahil eder.' },
    ];
  }
  if (domain === LifeDomain.FINANCIAL) {
    return [
      { id: 'goal_1', text: 'Bir hafta boyunca yalnız harcama kategorilerimi kaydedip bütçe farkındalığı kazanmak.', whyItFits: 'Yatırım veya borç önerisi vermeden temel finansal okuryazarlığı destekler.' },
      { id: 'goal_2', text: 'Veli veya rehber öğretmenle güvenli öğrenci bütçesi hakkında konuşmak.', whyItFits: 'Maddi kararları uygun yetişkin gözetimine taşır.' },
      { id: 'goal_3', text: 'Güvenilir bir eğitim kaynağından bütçe ve tasarruf kavramlarını öğrenmek.', whyItFits: 'Riskli getiri vaatleri yerine eğitimsel bilgiye odaklanır.' },
    ];
  }
  return safeGoalTemplate(domain, timeHorizon);
}

export function safePlanTemplate(timeHorizon: GoalTimeHorizonValue): PlanStep[] {
  if (timeHorizon === 'SHORT_TERM') {
    return [
      { id: 'step_1', phase: 'PREPARE', text: 'Bugün hedefin kapsamını, ihtiyaç duyulan kaynakları ve dört haftalık başarı ölçütünü netleştir.' },
      { id: 'step_2', phase: 'START', text: 'İlk hafta içinde 20–30 dakikalık küçük bir başlangıç adımını tamamla.' },
      { id: 'step_3', phase: 'PRACTICE', text: 'İkinci ve üçüncü haftada düzenli pratik yap; ilerlemeyi kısa notlarla takip et.' },
      { id: 'step_4', phase: 'REVIEW', text: 'Dördüncü haftada çıktıyı değerlendir, geri bildirim al ve sonraki hedefi belirle.' },
    ];
  }
  if (timeHorizon === 'LONG_TERM') {
    return [
      { id: 'step_1', phase: 'PREPARE', text: 'İlk ay içinde 6–24 aylık ana hedefi, kaynakları ve altı aylık kilometre taşlarını netleştir.' },
      { id: 'step_2', phase: 'START', text: 'İlk 3 ayda temel beceri veya hazırlık aşamasını tamamlayıp ilk küçük çıktıyı üret.' },
      { id: 'step_3', phase: 'PRACTICE', text: 'Dördüncü aydan itibaren düzenli uygulama yap ve her üç ayda bir ilerleme kanıtlarını kaydet.' },
      { id: 'step_4', phase: 'REVIEW', text: 'Her altı ayda bir rehber öğretmenle kilometre taşlarını değerlendirip 24 aya kadar planı güncelle.' },
    ];
  }
  return [
    { id: 'step_1', phase: 'PREPARE', text: 'İlk hafta hedefin kapsamını, gerekli kaynakları ve altı aylık başarı ölçütlerini netleştir.' },
    { id: 'step_2', phase: 'START', text: 'İlk ay içinde küçük bir başlangıç çıktısı tamamlayıp çalışma düzenini kur.' },
    { id: 'step_3', phase: 'PRACTICE', text: 'İkinci aydan beşinci aya kadar düzenli pratik yap ve ilerlemeyi aylık olarak kaydet.' },
    { id: 'step_4', phase: 'REVIEW', text: 'Altıncı ayın sonunda çıktıyı değerlendir, geri bildirim al ve hedefi güncelle.' },
  ];
}
