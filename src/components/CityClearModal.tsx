import React, { useEffect } from 'react';
import { AichiCity, Landmark } from '../types';
import { AICHI_REGION_NAMES } from '../data/aichiData';
import { Trophy, CheckCircle2, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audio } from '../utils/audio';

interface CityClearModalProps {
  city: AichiCity;
  landmarks: Landmark[];
  totalClearedCitiesCount: number; // 制覇市数 (1〜38)
  onNextCity: () => void;
  onOpenCitySelect: () => void;
}

export const CityClearModal: React.FC<CityClearModalProps> = ({
  city,
  landmarks,
  totalClearedCitiesCount,
  onNextCity,
  onOpenCitySelect,
}) => {
  const isAichiComplete = totalClearedCitiesCount >= 38;

  useEffect(() => {
    confetti({
      particleCount: isAichiComplete ? 160 : 90,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#eab308', '#ef4444', '#38bdf8', '#10b981', '#ffffff'],
    });
    audio.playSuccessSound();
    audio.playCheerSound();
  }, [isAichiComplete]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-clear-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl w-[92vw] max-h-[90vh] overflow-y-auto glass-panel-gold rounded-3xl p-5 md:p-8 border border-amber-400/60 shadow-2xl text-center bg-slate-900/95">
        
        {/* 背景装飾 */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border-8 border-amber-500/10 pointer-events-none" />

        {/* アイコン */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center shadow-lg mb-3 animate-bounce">
          <span className="text-4xl">{isAichiComplete ? '👑' : '🏯'}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {isAichiComplete ? 'AICHI 38 CITIES GRAND SLAM!' : 'CITY MISSION COMPLETE!'}
        </div>

        <h2 id="city-clear-title" className="text-2xl md:text-3xl font-black text-amber-300 font-calligraphy mb-1">
          {city.name} 完全制覇！
        </h2>
        <p className="text-xs text-slate-300 mb-5">
          {AICHI_REGION_NAMES[city.region]}・{city.name}の3大名所すべてを射貫きました！
        </p>

        {/* 来訪記念スタンプ */}
        <div className="animate-stamp inline-block mb-5">
          <div className="border-4 border-red-600 text-red-500 px-5 py-2 rounded-2xl text-center font-calligraphy transform rotate-6 bg-red-950/30 shadow-2xl">
            <span className="text-[11px] block tracking-widest font-sans font-bold">愛知県名所めぐり</span>
            <span className="text-lg font-black">{city.name} 踏破印</span>
          </div>
        </div>

        {/* 3名所制覇一覧 */}
        <div className="space-y-2 mb-6 text-left">
          <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
            制覇した市内の名所 (3/3)
          </span>
          {landmarks.map((lm) => (
            <div
              key={lm.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/40"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate">{lm.name}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                100% 直撃
              </span>
            </div>
          ))}
        </div>

        {/* 全市制覇進捗メーター */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-semibold">愛知県 全市制覇進捗</span>
            <span className="font-mono font-black text-amber-300">
              {totalClearedCitiesCount} / 38 市 ({Math.round((totalClearedCitiesCount / 38) * 100)}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(totalClearedCitiesCount / 38) * 100}%` }}
            />
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={onNextCity}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>次の市へ進む</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCitySelect}
            className="w-full sm:w-auto py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>市一覧から選ぶ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
