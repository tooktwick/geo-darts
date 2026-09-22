import React, { useState } from 'react';
import { Prefecture, Landmark, ZoomRiskInfo, GameDifficulty, DartHit } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { CheckCircle2, Navigation, Target, Trophy, Shuffle, Sparkles, Zap, ZoomIn, Eye, EyeOff, Compass, ChevronDown, ChevronUp, Dices } from 'lucide-react';
import { calculateHaversineDistance, calculateBearing, formatDistanceString, getNearPinThresholdKm } from '../utils/geo';

interface BasicTourMissionBarProps {
  currentPref: Prefecture;
  landmarks: Landmark[];
  clearedLandmarkIds: string[];
  totalClearedCount: number;
  attempts: number;
  zoomRisk?: ZoomRiskInfo;
  difficulty?: GameDifficulty;
  latestHit?: DartHit | null;
  onSkipPrefecture: () => void;
  onRerollLandmarks?: () => void;
  onFocusLandmark?: (lm: Landmark) => void;
}

export const BasicTourMissionBar: React.FC<BasicTourMissionBarProps> = ({
  currentPref,
  landmarks,
  clearedLandmarkIds,
  totalClearedCount,
  attempts,
  zoomRisk,
  difficulty = 'easy',
  latestHit,
  onSkipPrefecture,
  onRerollLandmarks,
  onFocusLandmark,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const clearedCount = clearedLandmarkIds.length;
  const progressPercent = Math.round((clearedCount / 3) * 100);
  const thresholdKm = getNearPinThresholdKm(difficulty);

  // 県が変わった際に前の県の命中メッセージや距離情報が残らないよう厳格にチェック
  const isValidHitForCurrentPref =
    latestHit &&
    ((latestHit.prefecture && latestHit.prefecture.id === currentPref.id) ||
      (latestHit.hitLandmark && latestHit.hitLandmark.prefId === currentPref.id));
  const activeHit = isValidHitForCurrentPref ? latestHit : null;

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex justify-center">
      {isCollapsed ? (
        /* 最小化時: 地図を最大限広く見せるスリムバー */
        <div className="max-w-xl w-full glass-panel-gold rounded-2xl px-3.5 py-2 pointer-events-auto border-amber-500/50 shadow-2xl flex items-center justify-between gap-2.5 transition-all">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xl">📍</span>
            <span className="text-sm font-black text-amber-300 font-calligraphy tracking-wider whitespace-nowrap">
              {currentPref.name}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
              {clearedCount} / 3 制覇
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-sky-500/40 whitespace-nowrap hidden sm:inline">
              🎯 判定: {thresholdKm}km
            </span>
            {activeHit && activeHit.distanceToTargetKm !== undefined && difficulty !== 'hard' && (
              <span className="text-[10px] text-sky-300 font-mono hidden sm:inline truncate">
                直近: {activeHit.nearestLandmarkName || '目標'}まで {activeHit.distanceToTargetKm < 1 ? `${Math.round(activeHit.distanceToTargetKm * 1000)}m` : `${activeHit.distanceToTargetKm.toFixed(1)}km`}{activeHit.targetBearing ? ` (${activeHit.targetBearing})` : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onRerollLandmarks && (
              <button
                onClick={onRerollLandmarks}
                className="px-2 py-1 rounded-xl text-amber-200 hover:text-white bg-amber-950/80 hover:bg-amber-900/80 text-[10px] font-bold border border-amber-500/40 transition-all flex items-center gap-1 active:scale-95"
                title="この県の候補（全20箇所）から別の名所3箇所を引き直す"
              >
                <Dices className="w-3 h-3 text-amber-400" />
                <span>チェンジ</span>
              </button>
            )}
            <button
              onClick={onSkipPrefecture}
              className="px-2 py-1 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 text-[10px] font-bold border border-slate-600 transition-all flex items-center gap-1"
              title="別の都道府県に切り替える"
            >
              <Shuffle className="w-3 h-3 text-amber-400" />
              <span>別県</span>
            </button>
            <button
              onClick={() => setIsCollapsed(false)}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-400/50 flex items-center gap-1 transition-all shadow-md"
              title="名所一覧パネルを展開"
            >
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>目標詳細</span>
            </button>
          </div>
        </div>
      ) : (
        /* 展開時: 詳細ミッションパネル */
        <div className="max-w-4xl w-full glass-panel-gold rounded-3xl p-3 md:p-3.5 pointer-events-auto border-amber-500/50 shadow-2xl transition-all">
        
        {/* 上段: 現在の都道府県 & 全国制覇メーター & スキップボタン */}
        <div className="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce">📍</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider">
                  現在探索中
                </span>
                <h3 className="text-lg md:text-xl font-black text-amber-300 font-calligraphy tracking-wider">
                  {currentPref.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  ({currentPref.capital})
                </span>
                {/* 難易度バッジ */}
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    difficulty === 'easy'
                      ? 'border-emerald-500/50 text-emerald-300 bg-emerald-950/60'
                      : difficulty === 'normal'
                      ? 'border-amber-500/50 text-amber-300 bg-amber-950/60'
                      : 'border-red-500/50 text-red-300 bg-red-950/60'
                  }`}
                  title={
                    difficulty === 'easy'
                      ? 'Easy: 目標表示ON (判定: 20km以内)'
                      : difficulty === 'normal'
                      ? 'Normal: 目標表示OFF・投てき後距離表示 (判定: 10km以内)'
                      : 'Hard: 目標表示OFF・距離なし (判定: 5km以内)'
                  }
                >
                  {difficulty === 'easy' ? (
                    <>
                      <Eye className="w-3 h-3" /> 目標ON
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" /> 目標OFF
                      {difficulty === 'normal' && ' (距離表示)'}
                    </>
                  )}
                </span>
                {/* ニアピン判定基準バッジ */}
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-400/50 flex items-center gap-1 shadow-sm">
                  <Target className="w-3 h-3 text-sky-400" />
                  ニアピン: {thresholdKm}km以内
                </span>
                {/* 難易度連動候補プールバッジ */}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/90 border border-amber-500/30 flex items-center gap-1 hidden sm:inline-flex">
                  <Dices className="w-3 h-3 text-amber-400" />
                  {difficulty === 'easy'
                    ? '全国レベル候補から3箇所選出'
                    : difficulty === 'normal'
                    ? '全国・地域候補から3箇所選出'
                    : '全20候補から3箇所選出'}
                </span>
                {zoomRisk && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${zoomRisk.colorClass}`}>
                    <Zap className="w-3 h-3" /> 倍率 {zoomRisk.multiplier.toFixed(1)}x
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 hidden md:flex items-center gap-1 mt-0.5">
                {difficulty === 'normal' ? (
                  <span className="text-amber-300 font-semibold">
                    🎯 【Normal】目標ピン非表示・ニアピン判定10km以内！投げた後に目標までの直線距離と方角が表示されます。
                  </span>
                ) : difficulty === 'hard' ? (
                  <span className="text-red-300 font-semibold">
                    🔥 【Hard】目標ピンも距離表示も一切なし・ニアピン判定5km以内！己の地理知識だけで挑む極限モード。
                  </span>
                ) : (
                  <span>【Easy】目標ピン表示・ニアピン判定20km以内！名所敷地直撃でピンポイントボーナス獲得。</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* 全国制覇数 */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold">全国制覇</span>
              <span className="text-sm md:text-base font-black text-amber-400 font-mono">
                {totalClearedCount} <span className="text-xs text-slate-400">/ 47県</span>
              </span>
            </div>

            {/* 名所チェンジ (リロール) ボタン */}
            {onRerollLandmarks && (
              <button
                onClick={onRerollLandmarks}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                title="この県の候補（全20箇所）の中から別の名所3箇所を引き直す"
              >
                <Dices className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline">名所チェンジ</span>
              </button>
            )}

            {/* スキップボタン */}
            <button
              onClick={onSkipPrefecture}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
              title="別の未制覇の県へ切り替える"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">別の県</span>
            </button>

            {/* 最小化ボタン */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="パネルを折りたたんで地図を広く表示"
            >
              <ChevronDown className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">折りたたむ</span>
            </button>
          </div>
        </div>

        {/* 直近投てきフィードバックバー (Hard以外で直近投てきがある場合) */}
        {difficulty !== 'hard' && activeHit && (
          <div className="mb-2.5 px-3 py-1.5 rounded-2xl bg-sky-950/90 border border-sky-400/60 shadow-lg shadow-sky-500/20 flex items-center justify-between gap-2 flex-wrap animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-base animate-pulse">🎯</span>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="font-bold text-sky-200">直近の一投:</span>
                {activeHit.isCorrect ? (
                  <span className="font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                    🎉 【{activeHit.hitLandmark?.name || '名所'}】に命中クリア！
                  </span>
                ) : activeHit.distanceToTargetKm !== undefined ? (
                  <>
                    <span className="font-black text-amber-300">
                      【{activeHit.nearestLandmarkName || '最寄り目標'}】まで
                    </span>
                    <span className="font-mono font-black text-white bg-sky-500/40 px-2 py-0.5 rounded-full border border-sky-400/60 shadow-inner">
                      あと {activeHit.distanceToTargetKm < 1
                        ? `${Math.max(10, Math.round(activeHit.distanceToTargetKm * 1000))}m`
                        : `${activeHit.distanceToTargetKm.toFixed(1)}km`}
                    </span>
                    {activeHit.targetBearing && (
                      <span className="font-black text-sky-200 bg-slate-900/80 px-2 py-0.5 rounded-full text-[11px] border border-sky-500/40 flex items-center gap-1">
                        🧭 {activeHit.targetBearing} 方向
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-300">着弾地点から目標へ寄せていきましょう</span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-sky-300 font-bold hidden sm:inline">
              {difficulty === 'normal' ? '※距離と方角を手がかりに狙おう！' : '※目標ピンも参考に狙おう！'}
            </span>
          </div>
        )}

        {/* 中段: 3大名所ターゲットカード一覧 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {landmarks.map((lm, idx) => {
            const isCleared = clearedLandmarkIds.includes(lm.id);

            // 直近の着弾点から各名所への個別距離と方角
            let singleDistText: string | null = null;
            let singleBearing: string | null = null;
            if (difficulty !== 'hard' && !isCleared && activeHit?.lat && activeHit?.lng) {
              const km = calculateHaversineDistance(activeHit.lat, activeHit.lng, lm.coordinates.lat, lm.coordinates.lng);
              singleDistText = formatDistanceString(km);
              const b = calculateBearing(activeHit.lat, activeHit.lng, lm.coordinates.lat, lm.coordinates.lng);
              singleBearing = b.direction;
            }

            return (
              <div
                key={lm.id}
                onClick={() => onFocusLandmark && onFocusLandmark(lm)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isCleared
                    ? 'border-emerald-500/60 bg-emerald-950/70 text-emerald-200 shadow-md shadow-emerald-500/10'
                    : 'border-amber-400/50 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold p-1 ${
                      isCleared
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 text-amber-300 border border-amber-500/40 shadow-inner'
                    }`}
                  >
                    {isCleared ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <CategoryIcon category={lm.category} size={22} withGlow />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-amber-400/80">#{idx + 1}</span>
                      <h4 className="text-xs md:text-sm font-bold truncate">
                        {lm.name}
                      </h4>
                      {lm.fameLevel && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold border flex-shrink-0 ${
                            lm.fameLevel === 'national'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : lm.fameLevel === 'regional'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                          title={
                            lm.fameLevel === 'national'
                              ? '全国レベル名所'
                              : lm.fameLevel === 'regional'
                              ? '地域レベル名所'
                              : 'マイナー・穴場名所'
                          }
                        >
                          {lm.fameLevel === 'national' ? '🌟全国' : lm.fameLevel === 'regional' ? '🗺️地域' : '🌿穴場'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {lm.description}
                    </p>
                    {lm.localGourmet && (
                      <div className="flex items-center gap-1 text-[9px] text-orange-300/90 truncate mt-0.5">
                        <span className="flex-shrink-0">🍜</span>
                        <span className="truncate">{lm.localGourmet}</span>
                      </div>
                    )}
                    {/* 直近着弾からの個別距離表示 */}
                    {singleDistText && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-sky-300 font-mono font-bold">
                        <span className="bg-sky-950/90 px-1.5 py-0.5 rounded border border-sky-400/40 shadow-sm">
                          📍 あと {singleDistText} ({singleBearing})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isCleared ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold">
                      達成!
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse font-bold flex items-center gap-1">
                      <Target className="w-3 h-3" /> 狙え
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 下段: 進捗バー */}
        <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-amber-500/10">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>進捗:</span>
            <span className="text-amber-300 font-bold">{clearedCount} / 3 箇所クリア</span>
            <span>({attempts}投目)</span>
          </div>

          <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
