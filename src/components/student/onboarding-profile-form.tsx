'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Users, Sparkles, Plus, Trash2, CheckCircle2, ArrowRight, 
  ArrowLeft, School, Heart, Award, HelpCircle, BookOpen, Briefcase, Star 
} from 'lucide-react';
import { FamilyRelation } from '@prisma/client';

interface FamilyMemberForm {
  id?: string;
  relation: FamilyRelation;
  occupation: string;
  educationLevel: string;
  closenessScore: number;
  influenceScore: number;
  notes: string;
}

export function OnboardingProfileForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [grade, setGrade] = useState<number>(initialData?.grade || 9);
  const [birthYear, setBirthYear] = useState<number>(initialData?.birthYear || 2008);
  const [schoolName, setSchoolName] = useState<string>(initialData?.schoolName || '');
  const [targetCareer, setTargetCareer] = useState<string>(initialData?.targetCareer || '');
  const [hobbies, setHobbies] = useState<string>(initialData?.hobbies || '');
  const [favoriteSubjects, setFavoriteSubjects] = useState<string>(initialData?.favoriteSubjects || '');

  // Family Members State
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberForm[]>(
    initialData?.familyMembers?.length
      ? initialData.familyMembers.map((m: any) => ({
          id: m.id,
          relation: m.relation,
          occupation: m.occupation || '',
          educationLevel: m.educationLevel || '',
          closenessScore: m.closenessScore || 3,
          influenceScore: m.influenceScore || 3,
          notes: m.notes || '',
        }))
      : [
          { relation: 'MOTHER', occupation: '', educationLevel: 'Lise', closenessScore: 4, influenceScore: 4, notes: '' },
          { relation: 'FATHER', occupation: '', educationLevel: 'Lise', closenessScore: 4, influenceScore: 4, notes: '' },
        ]
  );

  const addFamilyMember = () => {
    setFamilyMembers([
      ...familyMembers,
      { relation: 'SIBLING', occupation: 'Öğrenci', educationLevel: 'Ortaokul/Lise', closenessScore: 4, influenceScore: 3, notes: '' },
    ]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMemberForm, value: any) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/student/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: Number(grade),
          birthYear: Number(birthYear),
          schoolName,
          targetCareer,
          hobbies,
          favoriteSubjects,
          familyMembers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Bilgiler kaydedilirken hata oluştu.');
        setLoading(false);
      } else {
        setSuccessMsg(data.message || 'Profil başarıyla kaydedildi! Kişilik testi başlatılıyor...');
        setTimeout(() => {
          router.push('/rpg/test');
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setError('Sunucu bağlantısı sırasında hata oluştu.');
      setLoading(false);
    }
  };

  const getRelationLabel = (rel: FamilyRelation) => {
    switch (rel) {
      case 'MOTHER': return 'Anne';
      case 'FATHER': return 'Baba';
      case 'SIBLING': return 'Kardeş';
      case 'GUARDIAN': return 'Vasi / Bakıcı';
      case 'OTHER': return 'Diğer Akraba';
      default: return rel;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-white/10">
        <div 
          onClick={() => setStep(1)} 
          className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all ${
            step === 1 ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">1</div>
          <span className="text-sm">Kişisel Bilgiler & Hedefler</span>
        </div>

        <div className="w-8 h-0.5 bg-white/10 hidden sm:block" />

        <div 
          onClick={() => setStep(2)} 
          className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all ${
            step === 2 ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/30' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">2</div>
          <span className="text-sm">Aile & Sosyal Destek Ağınız</span>
        </div>

        <div className="w-8 h-0.5 bg-white/10 hidden sm:block" />

        <div 
          onClick={() => setStep(3)} 
          className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all ${
            step === 3 ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">3</div>
          <span className="text-sm">Özet & XP Ödülü</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <span className="font-semibold">Hata:</span> {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: PERSONAL INFO */}
        {step === 1 && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Kişisel Profil Bilgileri</h2>
                <p className="text-xs text-gray-400">Okul durumunuzu ve ilgi alanlarınızı tanıyıp size özel RPG senaryosu üreteceğiz.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Grade Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Kaçıncı Sınıfta Okuyorsunuz?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[9, 10, 11, 12].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                        grade === g
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-105'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {g}. Sınıf
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Year */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Doğum Yılınız
                </label>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
                >
                  {Array.from({ length: 9 }, (_, i) => 2005 + i).map((y) => (
                    <option key={y} value={y} className="bg-gray-900 text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* School Name */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-indigo-400" /> Okulunuzun Adı
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Örn: Atatürk Anadolu Lisesi"
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Target Career */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Hedeflediğiniz veya Hayalinizdeki Meslek
                </label>
                <input
                  type="text"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                  placeholder="Örn: Yazılım Mühendisi, Psikolog, Mimar, Bilim İnsanı vb."
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Hobbies */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" /> Hobileriniz ve İlgi Alanlarınız
                </label>
                <textarea
                  rows={3}
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  placeholder="Kitap okumak, kod yazmak, gitar çalmak, satranç, resim yapmak..."
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                />
              </div>

              {/* Favorite Subjects */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" /> En Sevdiğiniz ve Başarılı Olduğunuz Dersler
                </label>
                <textarea
                  rows={3}
                  value={favoriteSubjects}
                  onChange={(e) => setFavoriteSubjects(e.target.value)}
                  placeholder="Matematik, Fizik, Edebiyat, Tarih, İngilizce..."
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="glow-button px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2"
              >
                <span>İleri: Aile ve Destek Sistemi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FAMILY & SOCIAL SUPPORT */}
        {step === 2 && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Aile & Sosyal Destek Ağınız</h2>
                  <p className="text-xs text-gray-400">Kariyer kararlarınızda ailenizin beklentilerini ve desteğini anlamamıza yardımcı olun.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addFamilyMember}
                className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Satır Ekle
              </button>
            </div>

            <div className="space-y-4">
              {familyMembers.map((member, index) => (
                <div key={index} className="glass-card p-5 rounded-2xl border border-white/10 space-y-4 relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs">
                        #{index + 1}
                      </span>
                      <span>{getRelationLabel(member.relation)}</span>
                    </div>
                    {familyMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Bu kişiyi sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Relation Select */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase">Yakınlık</label>
                      <select
                        value={member.relation}
                        onChange={(e) => updateFamilyMember(index, 'relation', e.target.value as FamilyRelation)}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                      >
                        <option value="MOTHER" className="bg-gray-900">Anne</option>
                        <option value="FATHER" className="bg-gray-900">Baba</option>
                        <option value="SIBLING" className="bg-gray-900">Kardeş</option>
                        <option value="GUARDIAN" className="bg-gray-900">Vasi / Bakıcı</option>
                        <option value="OTHER" className="bg-gray-900">Diğer Akraba</option>
                      </select>
                    </div>

                    {/* Occupation */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase">Mesleği / İşi</label>
                      <input
                        type="text"
                        value={member.occupation}
                        onChange={(e) => updateFamilyMember(index, 'occupation', e.target.value)}
                        placeholder="Örn: Öğretmen, Esnaf, Emekli vb."
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Education */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase">Eğitim Düzeyi</label>
                      <select
                        value={member.educationLevel}
                        onChange={(e) => updateFamilyMember(index, 'educationLevel', e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                      >
                        <option value="İlkokul" className="bg-gray-900">İlkokul / Ortaokul</option>
                        <option value="Lise" className="bg-gray-900">Lise</option>
                        <option value="Ön Lisans" className="bg-gray-900">Ön Lisans (2 Yıllık)</option>
                        <option value="Lisans" className="bg-gray-900">Lisans (4 Yıllık Üniversite)</option>
                        <option value="Yüksek Lisans/Doktora" className="bg-gray-900">Yüksek Lisans / Doktora</option>
                      </select>
                    </div>

                    {/* Closeness Score */}
                    <div className="space-y-1 sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase flex items-center justify-between">
                        <span>Yakınlık & İletişim (1-5)</span>
                        <span className="text-purple-300 font-bold">{member.closenessScore} Yıldız</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={member.closenessScore}
                        onChange={(e) => updateFamilyMember(index, 'closenessScore', Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-black/40 rounded-lg"
                      />
                    </div>

                    {/* Influence Score */}
                    <div className="space-y-1 sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase flex items-center justify-between">
                        <span>Kariyer Kararınıza Etkisi (1-5)</span>
                        <span className="text-emerald-300 font-bold">{member.influenceScore} / 5</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={member.influenceScore}
                        onChange={(e) => updateFamilyMember(index, 'influenceScore', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-2 bg-black/40 rounded-lg"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1 sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase">Özel Not / Beklenti</label>
                      <input
                        type="text"
                        value={member.notes}
                        onChange={(e) => updateFamilyMember(index, 'notes', e.target.value)}
                        placeholder="Örn: Tıp okumamı istiyor..."
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="glow-button px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2"
              >
                <span>İleri: Özet ve Tamamlama</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUMMARY & XP REWARD */}
        {step === 3 && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-fadeIn text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 via-emerald-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 animate-pulse">
              <Award className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Harika! Profiliniz Hazır</h2>
              <p className="text-sm text-gray-300 max-w-md mx-auto">
                Kişisel ve aile bilgilerinizi başarıyla girdiniz. Bu adımı kaydettiğinizde profiliniz aktif olacak ve doğrudan <span className="text-emerald-400 font-bold">+50 Deneyim Puanı (XP)</span> kazanacaksınız!
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 text-left max-w-md mx-auto space-y-3">
              <div className="flex justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
                <span>Sınıf / Doğum Yılı</span>
                <span className="text-white font-semibold">{grade}. Sınıf ({birthYear})</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
                <span>Hedef Meslek</span>
                <span className="text-indigo-300 font-semibold">{targetCareer || 'Henüz Belirtilmedi'}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Eklenen Aile Üyesi Sayısı</span>
                <span className="text-purple-300 font-semibold">{familyMembers.length} Kişi</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="glow-button px-8 py-3.5 rounded-2xl text-white font-extrabold text-sm tracking-wide shadow-xl flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
                    <span>Kaydet ve +50 XP Kazan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
