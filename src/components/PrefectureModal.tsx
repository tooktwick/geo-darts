import React from 'react';
import { Prefecture } from '../types';
import { REGION_NAMES, REGION_COLORS } from '../data/prefectures';
import { LANDMARKS } from '../data/landmarksData';
import { X, MapPin, Users, Maximize2, Sparkles, Award, Utensils } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface PrefectureModalProps {
  prefecture: Prefecture;
  visitCount: number;
  highScore: number;
  onClose: () => void;
}

export const PrefectureModal: React.FC<PrefectureModalProps> = ({
  prefecture,
  visitCount,
  highScore,
  onClose,
}) => {
  const landmarks = LANDMARKS.filter((lm) => lm.prefId === prefecture.id);
  const regionColor = REGION_COLORS[prefecture.region];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col glass-panel-gold rounded-3xl p-6 md:p-8 border-amber-500/50 shadow-2xl overflow-hidden">
        
        {/* 背景の和風家紋・サークル飾り */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border-8 border-amber-500/10 pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full border-2 border-dashed border-amber-500/20 pointer-events-none" />

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-600 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ヘッダー部: 地方名バッジ & 都道府県名 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: regionColor.light, color: regionColor.base }}
            >
              {REGION_NAMES[prefecture.region]}
            </span>
            <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">
              {prefecture.englishName}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl md:text-4xl font-black text-amber-300 font-calligraphy tracking-wider drop-shadow-md">
              {prefecture.name}
            </h2>

            {/* 訪問スタンプ印影 (朱印風) */}
            <div className="animate-stamp">
              <div className="border-2 border-red-500 text-red-500 px-2.5 py-1 rounded-lg text-center font-calligraphy transform rotate-6 bg-red-950/20 shadow-lg">
                <span className="text-[10px] block leading-tight font-sans">来訪記念印</span>
                <span className="text-sm font-bold block leading-tight">
                  {visitCount}回目来訪
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 基本情報グリッド */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">県庁所在地</span>
              <span className="text-sm font-bold text-slate-100">{prefecture.capital}</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">人口</span>
              <span className="text-sm font-bold text-slate-100">{prefecture.population}</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">面積</span>
              <span className="text-sm font-bold text-slate-100">{prefecture.areaKm2.toLocaleString()} km²</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">ハイスコア</span>
              <span className="text-sm font-bold text-amber-400 font-mono">{highScore > 0 ? `${highScore.toLocaleString()} pt` : '未記録'}</span>
            </div>
          </div>
        </div>

        {/* 特産品・名物 */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>特産品・名物</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {prefecture.specialties.map((item, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-xl bg-amber-500/15 text-amber-200 border border-amber-500/30 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 豆知識・トリビア */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/20 mb-5">
          <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase block mb-1">
            💡 ご当地トリビア
          </span>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {prefecture.trivia}
          </p>
        </div>

        {/* 代表ランドマーク (全20名所) */}
        {landmarks.length > 0 && (
          <div className="mb-5 flex-1 min-h-0 flex flex-col">
            <span className="text-xs font-bold text-amber-300 block mb-2 flex items-center justify-between">
              <span>🏯 厳選名所一覧（全{landmarks.length}箇所）</span>
              <span className="text-[10px] text-slate-400 font-normal">※スクロールで全件閲覧可</span>
            </span>
            <div className="space-y-2 overflow-y-auto max-h-52 pr-1 custom-scrollbar">
              {landmarks.map((lm) => (
                <div
                  key={lm.id}
                  className="bg-black/40 p-2.5 rounded-xl border border-slate-800/80 hover:border-amber-500/40 transition-all flex items-start gap-2.5"
                >
                  <div className="p-1 rounded-lg bg-slate-900 border border-slate-700/60 flex-shrink-0 mt-0.5">
                    <CategoryIcon category={lm.category} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <h4 className="text-xs font-bold text-slate-200">{lm.name}</h4>
                      {lm.fameLevel && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                            lm.fameLevel === 'national'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : lm.fameLevel === 'regional'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {lm.fameLevel === 'national' ? '🌟全国' : lm.fameLevel === 'regional' ? '🗺️地域' : '🌿穴場'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{lm.description}</p>
                    {lm.localGourmet && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-orange-300">
                        <span>🍜 名物:</span>
                        <span className="text-orange-200 truncate">{lm.localGourmet}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-98"
        >
          探索を続ける
        </button>
      </div>
    </div>
  );
};
