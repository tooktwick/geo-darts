import React, { useEffect } from 'react';
import { Prefecture, Landmark } from '../types';
import { Trophy, Award, CheckCircle2, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audio } from '../utils/audio';

interface PrefectureClearModalProps {
  prefecture: Prefecture;
  landmarks: Landmark[];
  totalClearedCount: number; // 制覇数 (1〜47)
  onNextPrefecture: () => void;
}

export const PrefectureClearModal: React.FC<PrefectureClearModalProps> = ({
  prefecture,
  landmarks,
  totalClearedCount,
  onNextPrefecture,
}) => {
  const isGrandComplete = totalClearedCount >= 47;

  useEffect(() => {
    confetti({
      particleCount: isGrandComplete ? 150 : 80,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#eab308', '#ef4444', '#38bdf8', '#10b981', '#ffffff'],
    });
    audio.playSuccessSound();
    audio.playCheerSound();
  }, [isGrandComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl w-[92vw] max-h-[90vh] overflow-y-auto glass-panel-gold rounded-3xl p-5 md:p-8 border-amber-500/60 shadow-2xl text-center">
        
        {/* 背景の装飾 */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border-8 border-amber-500/10 pointer-events-none" />

        {/* トロフィー・王冠アイコン */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-lg mb-3 animate-bounce">
          <span className="text-4xl">{isGrandComplete ? '👑' : '🏆'}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {isGrandComplete ? 'ALL 47 PREFECTURES CLEARED!' : 'MISSION COMPLETE!'}
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-amber-300 font-calligraphy mb-1">
          {prefecture.name} 制覇！
        </h2>
        <p className="text-xs text-slate-300 mb-5">
          {prefecture.name}の3大名所すべてにニアピン直撃を達成しました！
        </p>

        {/* 来訪記念印 (スタンプ) */}
        <div className="animate-stamp inline-block mb-5">
          <div className="border-4 border-red-600 text-red-500 px-5 py-2 rounded-2xl text-center font-calligraphy transform rotate-6 bg-red-950/30 shadow-2xl">
            <span className="text-[11px] block tracking-widest font-sans font-bold">日本列島名所巡り</span>
            <span className="text-xl md:text-2xl font-black block tracking-wider">
              {prefecture.name} 完歩之印
            </span>
          </div>
        </div>

        {/* 3つの名所リスト */}
        <div className="space-y-2 mb-6 text-left">
          {landmarks.map((lm) => (
            <div
              key={lm.id}
              className="bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-bold text-slate-200">{lm.name}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ニアピン達成
              </span>
            </div>
          ))}
        </div>

        {/* 全国進捗状況 */}
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 mb-6">
          <div className="flex items-center justify-between text-xs mb-1 font-bold">
            <span className="text-slate-400">全国制覇カウント</span>
            <span className="text-amber-400 font-mono text-sm">{totalClearedCount} / 47 都道府県</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
              style={{ width: `${(totalClearedCount / 47) * 100}%` }}
            />
          </div>
        </div>

        {/* 次の県へ進むボタン */}
        <button
          onClick={onNextPrefecture}
          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/30 active:scale-98 flex items-center justify-center gap-2"
        >
          <span>{isGrandComplete ? '日本一周を称える' : '次の県へ旅立つ'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
