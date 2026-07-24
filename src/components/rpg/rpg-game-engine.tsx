'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Compass, Sparkles, Award, ArrowRight, ArrowLeft, RotateCcw, 
  CheckCircle2, Shield, Flame, BookOpen, Star, HelpCircle, User, Zap, Heart 
} from 'lucide-react';

interface Choice {
  id: string;
  order: number;
  text?: string;
  choiceText?: string;
  mbtiEffect: string | null;
  enneagramEffect: string | null;
}

interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  description?: string;
  narrativeText?: string;
  bgImage?: string | null;
  choices: Choice[];
}

export function RpgGameEngine() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [scenario, setScenario] = useState<any>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [personalityResult, setPersonalityResult] = useState<any>(null);
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [xpAnimation, setXpAnimation] = useState<string>('');

  const fetchGameData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/test/rpg');
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Oyun verileri yüklenemedi.');
      } else {
        setScenario(data.scenario);
        setScenes(data.scenes || []);
        setAnswers(data.answers || []);
        setCurrentIndex(data.currentSceneIndex || 0);
        setIsCompleted(data.isCompleted || false);
        setPersonalityResult(data.personalityResult || null);
        setXp(data.xp || 0);
        setLevel(data.level || 1);
      }
    } catch (err) {
      setError('Sunucu ile iletişim kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  const handleSelectChoice = async (choiceId: string, sceneId: string) => {
    if (submitting) return;
    setSubmitting(true);
    setXpAnimation('+10 XP!');

    try {
      const res = await fetch('/api/student/test/rpg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId, choiceId }),
      });

      const data = await res.json();

      if (res.ok) {
        setXp((prev) => prev + 10);
        
        // Animasyonu 1 saniye sonra temizle
        setTimeout(() => setXpAnimation(''), 1200);

        if (data.isCompleted) {
          setIsCompleted(true);
          setPersonalityResult(data.personalityResult);
          if (data.message) {
            // Tamamlama bonusu eklendiğinde
            setXp((prev) => prev + 100);
          }
        } else {
          setCurrentIndex((prev) => Math.min(prev + 1, scenes.length - 1));
          setAnswers((prev) => [...prev, { sceneId, choiceId }]);
        }
      } else {
        setError(data.error || 'Seçim kaydedilemedi.');
      }
    } catch (err) {
      setError('Seçim gönderilirken bağlantı hatası oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (submitting || currentIndex === 0 && answers.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/student/test/rpg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UNDO' }),
      });

      if (res.ok) {
        setXp((prev) => Math.max(0, prev - 10));
        setIsCompleted(false);
        setCurrentIndex((prev) => Math.max(0, prev - 1));
        setAnswers((prev) => prev.slice(0, -1));
      }
    } catch (err) {
      console.error('Undo error', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getSceneIcon = (num: number) => {
    const icons = [Compass, Sparkles, BookOpen, Shield, Flame, Star, Award, Zap];
    const IconComponent = icons[num % icons.length] || Compass;
    return <IconComponent className="w-8 h-8 text-white animate-pulse" />;
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
          <Compass className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-gray-400 animate-pulse">Gizemli Akademi Sahneleri Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-red-500/20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-400">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Bir Hata Oluştu</h3>
        <p className="text-xs text-gray-400">{error}</p>
        <button
          onClick={fetchGameData}
          className="glow-button px-5 py-2.5 rounded-xl text-white font-bold text-xs"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  // Eğer oyun tamamlandıysa Kutlama ve Sonuç Raporu Ekranı
  if (isCompleted && personalityResult) {
    let mbtiScoresObj: any = null;
    try {
      mbtiScoresObj = typeof personalityResult.mbtiScores === 'string'
        ? JSON.parse(personalityResult.mbtiScores)
        : personalityResult.mbtiScores;
    } catch (e) {
      console.error('Parse err', e);
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Celebration Header */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 via-emerald-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 animate-bounce">
            <Award className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-2 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
              Keşif Adası Başarıyla Tamamlandı!
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tebrikler, Kişilik Raporunuz Hazır!
            </h1>
            <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Gizemli Akademi&apos;deki tüm seçimleriniz analiz edildi. +100 XP tamamlama ödülü hesabınıza eklendi!
            </p>
          </div>

          {/* Personality Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto relative z-10 pt-4">
            <div className="bg-black/40 p-5 rounded-2xl border border-indigo-500/30 text-left space-y-1">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">MBTI Kişilik Profiliniz</span>
              <div className="text-xl font-extrabold text-white">{personalityResult.mbtiType}</div>
            </div>
            <div className="bg-black/40 p-5 rounded-2xl border border-purple-500/30 text-left space-y-1">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Enneagram Motivasyonunuz</span>
              <div className="text-xl font-extrabold text-white">
                {personalityResult.dominantEnneagram} <span className="text-xs text-purple-300">({personalityResult.wingEnneagram ? `Kanat: ${personalityResult.wingEnneagram}` : ''})</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => {
                setIsCompleted(false);
                setCurrentIndex(scenes.length - 1);
              }}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Son Seçimlere Göz At / Geri Al</span>
            </button>

            <button
              onClick={() => router.push('/rpg/results')}
              className="glow-button px-8 py-3.5 rounded-2xl text-white font-extrabold text-sm tracking-wide shadow-xl flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Detaylı Psikolojik & Kariyer Raporunu Aç</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Preview of Summary */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            <span>Özet Değerlendirme</span>
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed bg-black/30 p-5 rounded-2xl border border-white/5">
            {personalityResult.summary}
          </p>
        </div>
      </div>
    );
  }

  // Aktif Sahne
  const currentScene = scenes[currentIndex];

  if (!currentScene) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-white">Sahne Bulunamadı</h3>
        <p className="text-xs text-gray-400">Tüm sahneleri tamamlamış olabilirsiniz.</p>
        <button
          onClick={() => setIsCompleted(true)}
          className="glow-button px-6 py-3 rounded-xl text-white font-bold text-xs"
        >
          Sonuçları Göster
        </button>
      </div>
    );
  }

  const progressPercent = Math.round((currentIndex / scenes.length) * 100);

  // Kısa başlık ve açıklama ayırıcı yardımcı fonksiyon
  const parseChoiceText = (fullText: string) => {
    if (!fullText) return { title: 'Seçenek', desc: '', tag: 'Karar Odaklı' };

    const colonIdx = fullText.indexOf(':');
    if (colonIdx !== -1) {
      const title = fullText.substring(0, colonIdx).trim();
      const desc = fullText.substring(colonIdx + 1).trim();
      let tag = `${title} Odak`;
      if (title.toLowerCase().includes('odak')) tag = title;
      return { title, desc, tag };
    }

    return { title: fullText, desc: '', tag: 'Karar Odaklı' };
  };

  const getChoiceIcon = (title: string, index: number) => {
    const t = title.toLowerCase();
    if (t.includes('sız') || t.includes('analiz') || t.includes('somut') || t.includes('bilgisizlik')) return <Zap className="w-5 h-5 text-teal-400" />;
    if (t.includes('tahliye') || t.includes('liderlik') || t.includes('sosyal') || t.includes('fayda')) return <User className="w-5 h-5 text-indigo-400" />;
    if (t.includes('risk') || t.includes('aksiyon') || t.includes('esnek') || t.includes('tehlike')) return <Flame className="w-5 h-5 text-amber-400" />;
    if (t.includes('empati') || t.includes('sevgi') || t.includes('huzur')) return <Heart className="w-5 h-5 text-rose-400" />;
    if (t.includes('özgün') || t.includes('yaratıcı') || t.includes('resim')) return <Sparkles className="w-5 h-5 text-purple-400" />;
    if (t.includes('plan') || t.includes('dürüstlük') || t.includes('güven')) return <Shield className="w-5 h-5 text-emerald-400" />;
    
    const fallbackIcons = [Compass, BookOpen, Star, Award];
    const Icon = fallbackIcons[index % fallbackIcons.length];
    return <Icon className="w-5 h-5 text-teal-400" />;
  };

  const sceneImage = currentScene.bgImage || `/images/rpg/soru${currentIndex + 1}.png`;

  const choiceCount = currentScene.choices.length;
  let gridColsClass = 'grid-cols-1 md:grid-cols-3 gap-4';
  if (choiceCount === 2) gridColsClass = 'grid-cols-1 md:grid-cols-2 gap-5';
  else if (choiceCount === 4) gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
  else if (choiceCount > 4) gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Game Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl bg-[#0b101d]/90">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-xs font-black text-teal-300 shadow-lg shadow-teal-500/10">
              #{currentScene.sceneNumber}
            </span>
            <div>
              <div className="text-[11px] font-extrabold text-teal-400 uppercase tracking-widest">
                {scenario?.title || 'GELECEĞE DÖNÜŞ: ZAMAN YOLCULUĞU'}
              </div>
              <div className="text-xs font-bold text-slate-200">
                Sahne {currentIndex + 1} / {scenes.length} - {currentScene.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:hidden">
            {answers.length > 0 && (
              <button
                onClick={handleUndo}
                disabled={submitting}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-all"
                title="Son Seçimi Geri Al"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-xs">
              {xp} XP
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-56 bg-black/50 h-2.5 rounded-full overflow-hidden border border-teal-500/20">
          <div
            className="bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-teal-400/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {answers.length > 0 && (
            <button
              onClick={handleUndo}
              disabled={submitting}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/5"
              title="Son Seçimi Geri Al"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Geri Al</span>
            </button>
          )}

          <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-xs flex items-center gap-1.5 relative shadow-md">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
            <span>{xp} XP</span>
            {xpAnimation && (
              <span className="absolute -top-7 right-0 text-amber-300 font-black text-xs bg-black/90 px-2 py-0.5 rounded-md border border-amber-500/50 shadow-xl animate-bounce">
                {xpAnimation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Story Container Card */}
      <div className="rounded-3xl border border-teal-500/30 bg-[#0c1322]/95 p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Image Frame with Sci-Fi HUD Overlays */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-teal-500/30 shadow-2xl group max-h-[380px] bg-black/70">
          {/* Top Left HUD Badge */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-950/80 border border-teal-500/50 text-teal-300 font-extrabold text-[11px] tracking-widest backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              ACİL DURUM
            </span>
            <span className="text-[10px] font-bold text-teal-400/90 tracking-widest bg-black/60 px-2.5 py-0.5 rounded-md backdrop-blur-sm w-fit border border-teal-500/20">
              SEKTÖR: YÖRÜNGE İSTASYONU 0{currentScene.sceneNumber}
            </span>
          </div>

          {/* Top Right HUD Mission Frame */}
          <div className="absolute top-4 right-4 z-20 hidden sm:flex flex-col items-end pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-black/75 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] tracking-wider backdrop-blur-md shadow-md text-right">
              MISSION: &quot;STELLAR CARTOGRAPHY&quot; - SECTOR 0{currentScene.sceneNumber}
              <div className="text-[8px] text-cyan-400/70 font-mono tracking-widest uppercase mt-0.5">
                FUTUROUTE 7045 - INTERFACE VER. 4.2
              </div>
            </div>
          </div>

          {/* Scene Background Image */}
          <img
            src={sceneImage}
            alt={currentScene.title}
            className="w-full h-full object-cover object-center max-h-[380px] transition-transform duration-700 group-hover:scale-105"
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Scene Title & Narrative Description */}
        <div className="text-center space-y-3 pt-2 max-w-3xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            {currentScene.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal whitespace-pre-line max-w-2xl mx-auto">
            {currentScene.narrativeText || currentScene.description || ''}
          </p>
        </div>
      </div>

      {/* Choice Options Cards Grid (Placed below main card) */}
      <div className={`grid ${gridColsClass}`}>
        {currentScene.choices.map((choice, idx) => {
          const fullText = choice.choiceText || choice.text || '';
          const { title, desc, tag } = parseChoiceText(fullText);
          const icon = getChoiceIcon(title, idx);

          return (
            <button
              key={choice.id}
              type="button"
              disabled={submitting}
              onClick={() => handleSelectChoice(choice.id, currentScene.id)}
              className="bg-[#0f1728]/95 hover:bg-[#162138] border border-teal-500/20 hover:border-teal-400/60 rounded-2xl p-5 text-left transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer shadow-xl hover:shadow-teal-500/10 disabled:opacity-50 relative overflow-hidden"
            >
              {/* Top Row: Icon & Short Title */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 group-hover:bg-teal-500/20 group-hover:border-teal-400 transition-colors flex-shrink-0">
                    {icon}
                  </div>
                  <h4 className="text-base font-extrabold text-white group-hover:text-teal-300 transition-colors leading-tight">
                    {title}
                  </h4>
                </div>

                {/* Description Text */}
                {desc && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 font-normal">
                    {desc}
                  </p>
                )}
              </div>


            </button>
          );
        })}
      </div>
    </div>
  );
}
