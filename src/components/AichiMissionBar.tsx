import React, { useState } from 'react';
import { AichiCity, Landmark, ZoomRiskInfo, GameDifficulty, DartHit } from '../types';
import { AICHI_REGION_NAMES } from '../data/aichiData';
import { getCategoryInfo } from '../utils/landmarkImages';
import { CategoryIcon } from './CategoryIcon';
import { MapPin, CheckCircle2, ChevronRight, ChevronUp, ChevronDown, Compass, Building2, Eye, EyeOff, Target } from 'lucide-react';
import { getNearPinThresholdKm } from '../utils/geo';

interface AichiMissionBarProps {
  currentCity: AichiCity;
  landmarks: Landmark[];
  clearedLandmarkIds: string[];
  totalClearedCitiesCount: number;
  attempts: number;
  zoomRisk?: ZoomRiskInfo;
  difficulty?: GameDifficulty;
  latestHit?: DartHit | null;
  onOpenCitySelect: () => void;
  onNextCity?: () => void;
}

export const AichiMissionBar: React.FC<AichiMissionBarProps> = ({
  currentCity,
  landmarks,
  clearedLandmarkIds,
  totalClearedCitiesCount,
  attempts,
  zoomRisk,
  difficulty = 'easy',
  latestHit,
  onOpenCitySelect,
  onNextCity,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAllCleared = landmarks.every((lm) => clearedLandmarkIds.includes(lm.id));
  const clearedCount = landmarks.filter((lm) => clearedLandmarkIds.includes(lm.id)).length;
  const thresholdKm = getNearPinThresholdKm(difficulty, true);

  // 市が変わった際に前の市の命中メッセージや距離情報が残らないよう厳格にチェック
  const isValidHitForCurrentCity =
    latestHit &&
    ((latestHit.hitLandmark && landmarks.some((lm) => lm.id === latestHit.hitLandmark?.id)) ||
      (latestHit.nearestLandmarkName && landmarks.some((lm) => lm.name === latestHit.nearestLandmarkName)));
  const activeHit = isValidHitForCurrentCity ? latestHit : null;

  return (
    <footer
      aria-label="愛知詳細ミッション進行バー"
      className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 z-30 pointer-events-none"
    >
      <div className="max-w-6xl w-full mx-auto glass-panel border border-amber-500/40 rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur-xl pointer-events-auto bg-slate-950/85">
        
        {/* 上部: 現在の市情報 & 市変更ボタン & 直前投擲フィードバック */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏯</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {AICHI_REGION_NAMES[currentCity.region]}
                </span>
                <span className="text-sm md:text-base font-black text-white font-calligraphy tracking-wider">
                  愛知県 {currentCity.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({currentCity.reading})
                </span>
              </div>
            </div>

            {/* 市切り替えボタン */}
            <button
              onClick={onOpenCitySelect}
              className="ml-2 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1 active:scale-95 shadow-md"
              title="別の市を選択する"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>市を変更</span>
            </button>

            {/* 難易度 & 目標表示バッジ */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${
                difficulty === 'easy'
                  ? 'border-emerald-500/50 text-emerald-300 bg-emerald-950/60'
                  : difficulty === 'normal'
                  ? 'border-amber-500/50 text-amber-300 bg-amber-950/60'
                  : 'border-red-500/50 text-red-300 bg-red-950/60'
              }`}
              title={
                difficulty === 'easy'
                  ? 'Easy: 目標ピン表示ON (愛知ニアピン: 10km以内)'
                  : difficulty === 'normal'
                  ? 'Normal: 目標ピン表示OFF・距離表示 (愛知ニアピン: 5km以内)'
                  : 'Hard: 目標ピン表示OFF・距離なし (愛知ニアピン: 2.5km以内)'
              }
            >
              {difficulty === 'easy' ? (
                <>
                  <Eye className="w-3 h-3 text-emerald-400" /> 目標ON
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 text-amber-400" /> 目標OFF
                  {difficulty === 'normal' && ' (距離表示)'}
                </>
              )}
            </span>

            {/* ニアピン判定基準バッジ (愛知モード: Normal 5km) */}
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-400/50 flex items-center gap-1 shadow-sm">
              <Target className="w-3 h-3 text-sky-400" />
              ニアピン: {thresholdKm}km以内
            </span>
          </div>

          {/* 直前の投擲フィードバック (直近外れ時の距離・方角など) */}
          {activeHit && !activeHit.isCorrect && activeHit.distanceToTargetKm !== undefined && (
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-amber-500/30 text-xs animate-fade-in">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">
                最寄り【{activeHit.nearestLandmarkName}】まで
              </span>
              <span className="font-mono font-black text-amber-300">
                約{Math.round(activeHit.distanceToTargetKm * 10) / 10} km
              </span>
              {activeHit.targetBearing && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950 text-amber-200 font-bold border border-amber-500/30">
                  {activeHit.targetBearing}方向
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* 全市制覇状況 */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">愛知制覇:</span>
              <span className="font-mono font-black text-amber-300">
                {totalClearedCitiesCount} / 38 市
              </span>
            </div>

            {/* 折りたたみ / 展開トグルボタン */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title={isCollapsed ? '名所一覧を展開' : 'ミッションバーを折りたたむ'}
            >
              {isCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[11px]">{isCollapsed ? '詳細展開' : '折りたたむ'}</span>
            </button>
          </div>
        </div>

        {/* 下部: 3つの名所カード一覧 (展開時のみ表示) */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
          {landmarks.map((lm, idx) => {
            const isCleared = clearedLandmarkIds.includes(lm.id);
            const catInfo = getCategoryInfo(lm.category);

            return (
              <div
                key={lm.id}
                className={`relative p-2.5 md:p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
                  isCleared
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40'
                }`}
              >
                {/* 状態アイコン */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 p-1 ${
                    isCleared
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-950 text-amber-300 border border-amber-500/40 shadow-inner'
                  }`}
                >
                  {isCleared ? (
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  ) : (
                    <CategoryIcon category={lm.category} size={20} withGlow />
                  )}
                </div>

                {/* 名所詳細 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-amber-400/80">#{idx + 1}</span>
                    <span className="text-xs font-black text-white font-calligraphy truncate">
                      {lm.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {lm.description}
                  </p>
                </div>

                {/* 済バッジ */}
                {isCleared && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                    制覇
                  </span>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </footer>
  );
};
