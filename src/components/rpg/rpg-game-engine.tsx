'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Compass, Sparkles, Award, ArrowRight, ArrowLeft, RotateCcw, 
  CheckCircle2, Shield, Flame, BookOpen, Star, HelpCircle, User, Zap 
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

  const progressPercent = Math.round(((currentIndex) / scenes.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Game Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-extrabold text-indigo-300">
              #{currentScene.sceneNumber}
            </span>
            <div>
              <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                {scenario?.title || 'Gizemli Akademi / Keşif Adası'}
              </div>
              <div className="text-xs font-bold text-white">
                Sahne {currentIndex + 1} / {scenes.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:hidden">
            {answers.length > 0 && (
              <button
                onClick={handleUndo}
                disabled={submitting}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-all"
                title="Son Seçimi Geri Al"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs">
              {xp} XP
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-48 bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {answers.length > 0 && (
            <button
              onClick={handleUndo}
              disabled={submitting}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Son Seçimi Geri Al"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Geri Al</span>
            </button>
          )}

          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 relative">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{xp} XP</span>
            {xpAnimation && (
              <span className="absolute -top-6 right-0 text-amber-300 font-black text-xs animate-bounce bg-black/80 px-2 py-0.5 rounded-md border border-amber-500/40 shadow-lg">
                {xpAnimation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Story Box */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden space-y-6">
        {/* Ambient background glow based on scene number */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="flex items-center gap-4 relative z-10 border-b border-white/10 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
            {getSceneIcon(currentScene.sceneNumber)}
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-0.5">
              Sahne #{currentScene.sceneNumber}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentScene.title}
            </h2>
          </div>
        </div>

        {/* Story Text Box */}
        <div className="bg-black/40 p-6 sm:p-8 rounded-2xl border border-white/5 relative z-10 shadow-inner">
          <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-normal whitespace-pre-line">
            {currentScene.narrativeText || currentScene.description || ''}
          </p>
        </div>

        {/* Choices Section */}
        <div className="space-y-3.5 pt-2 relative z-10">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            Karar Anı: Nasıl Bir Yol İzleyeceksiniz?
          </label>

          <div className="grid grid-cols-1 gap-3.5">
            {currentScene.choices.map((choice, idx) => (
              <button
                key={choice.id}
                type="button"
                disabled={submitting}
                onClick={() => handleSelectChoice(choice.id, currentScene.id)}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-indigo-500/50 text-left transition-all flex items-center justify-between gap-4 group hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20 disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-indigo-500/30 flex items-center justify-center text-xs font-extrabold text-gray-400 group-hover:text-white transition-colors flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-gray-200 group-hover:text-white transition-colors leading-snug">
                    {choice.choiceText || choice.text || ''}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-indigo-600 flex items-center justify-center text-gray-400 group-hover:text-white transition-all flex-shrink-0 group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
