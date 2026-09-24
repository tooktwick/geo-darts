import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Landmark, Prefecture, GameDifficulty, Language } from '../types';
import { getLandmarkImageUrl, getCategoryInfo } from '../utils/landmarkImages';
import { t, getLandmarkName, getPrefectureName, getCategoryName } from '../utils/i18n';
import { CategoryIcon } from './CategoryIcon';
import { MapPin, Image as ImageIcon, X, Zap, ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LandmarkHitModalProps {
  landmark: Landmark;
  prefecture: Prefecture;
  hitScore: number;
  isPinpoint?: boolean;
  difficulty?: GameDifficulty;
  isPrefectureCleared?: boolean; // 3箇所目達成で県制覇か
  clearedCount: number;          // 今回で何箇所目か (1〜3)
  language?: Language;
  onClose: () => void;
  onProceedToPrefClear?: () => void; // 県制覇モーダルへの遷移
  autoCloseDurationMs?: number;      // 自動消去までの時間 (デフォルト3800ms)
}

/**
 * 名所ニアピン命中通知カード (コンパクト・HUD回避・最小化トグル・ドラッグ移動対応)
 */
export const LandmarkHitModal: React.FC<LandmarkHitModalProps> = ({
  landmark,
  prefecture,
  hitScore,
  isPinpoint = false,
  difficulty = 'easy',
  isPrefectureCleared = false,
  clearedCount,
  language = 'ja',
  onClose,
  onProceedToPrefClear,
  autoCloseDurationMs = 3800,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ドラッグ移動ステート
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });
  const containerRef = useRef<HTMLElement>(null);

  const imageUrl = getLandmarkImageUrl(landmark);
  const catInfo = getCategoryInfo(landmark.category);

  // タイマー管理 (ホバー中は一時停止)
  const remainingTimeRef = useRef(autoCloseDurationMs);
  const lastStartTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFinish = useCallback(() => {
    if (isPrefectureCleared && onProceedToPrefClear) {
      onProceedToPrefClear();
    } else {
      onClose();
    }
  }, [isPrefectureCleared, onClose, onProceedToPrefClear]);

  // 初回表示時のコンフェッティ
  useEffect(() => {
    confetti({
      particleCount: isPinpoint ? 45 : 25,
      spread: 45,
      origin: { x: 0.85, y: 0.25 },
      colors: ['#f59e0b', '#38bdf8', '#10b981', '#ffffff'],
    });
  }, [isPinpoint]);

  // タイマーの開始・停止制御
  useEffect(() => {
    if (isHovered) {
      // ホバー中: タイマー一時停止し、残り時間を保存
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const elapsed = Date.now() - lastStartTimeRef.current;
      remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed);
    } else {
      // ホバー解除: 残り時間でタイマー再開
      lastStartTimeRef.current = Date.now();
      timerRef.current = setTimeout(handleFinish, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered, handleFinish]);

  // ドラッグ移動ハンドラー
  const handlePointerDown = (e: React.PointerEvent) => {
    // 閉じるボタンや最小化ボタンをクリックしたときはドラッグを開始しない
    if ((e.target as HTMLElement).closest('button')) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position ? position.x : rect.left,
      initY: position ? position.y : rect.top,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.initX + deltaX));
    const newY = Math.max(60, Math.min(window.innerHeight - 80, dragStartRef.current.initY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <aside
      ref={containerRef}
      aria-label={isPinpoint ? t('pinpoint_hit', language) : t('near_pin_hit', language)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: 'auto',
              bottom: 'auto',
            }
          : undefined
      }
      className={`fixed z-40 transition-shadow duration-200 pointer-events-none ${
        position ? '' : 'top-44 sm:top-48 right-3 sm:right-5'
      } max-w-xs sm:max-w-sm w-[calc(100vw-1.5rem)] sm:w-80`}
    >
      <div className="pointer-events-auto relative w-full glass-panel-gold rounded-2xl overflow-hidden border-amber-500/50 shadow-2xl backdrop-blur-md group animate-in fade-in slide-in-from-right-4 duration-200">
        
        {/* 上部ヘッダーバー (ドラッグハンドル) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="bg-gradient-to-r from-amber-600/50 via-amber-500/40 to-amber-600/50 px-2.5 py-1.5 border-b border-amber-500/30 flex items-center justify-between cursor-move select-none"
          title={t('drag_hint', language)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <GripHorizontal className="w-3.5 h-3.5 text-amber-300/60 flex-shrink-0" />
            <CategoryIcon category={landmark.category} size={18} withGlow />
            <span className="text-[11px] font-black text-amber-200 tracking-wide truncate">
              {isPinpoint ? t('pinpoint_hit', language) : t('near_pin_hit', language)}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[11px] font-black text-amber-300 font-mono bg-slate-950/80 px-1.5 py-0.5 rounded-lg border border-amber-500/40">
              +{hitScore.toLocaleString()}pt
            </span>

            {/* 最小化 / 展開ボタン */}
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isMinimized ? t('expand_card', language) : t('minimize', language)}
            >
              {isMinimized ? <ChevronDown className="w-3.5 h-3.5 text-amber-300" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-300" />}
            </button>

            {/* 即時クローズボタン */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 transition-colors"
              title={t('close', language)}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 展開時: 詳細コンテンツ */}
        {!isMinimized ? (
          <>
            {/* 種類別・個別名所 写真エリア (高さを h-24〜28 にコンパクト化) */}
            <div className="relative w-full h-24 sm:h-28 bg-slate-900 overflow-hidden border-b border-amber-500/20">
              {!imageError ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 animate-pulse gap-1">
                      <ImageIcon className="w-5 h-5 text-amber-400/60" />
                      <span className="text-[10px]">{t('loading_photo', language, { category: getCategoryName(landmark.category, language) })}</span>
                    </div>
                  )}
                  <img
                    data-landmark-photo="true"
                    src={imageUrl}
                    alt={`${getLandmarkName(landmark, language)} (${getCategoryName(landmark.category, language)})`}
                    crossOrigin="anonymous"
                    loading="eager"
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.endsWith(catInfo.imagePath)) {
                        target.src = catInfo.imagePath;
                      } else {
                        setImageError(true);
                      }
                    }}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 p-2 text-center">
                  <CategoryIcon category={landmark.category} size={28} withGlow className="mb-1" />
                  <span className="text-xs font-bold text-amber-300 font-calligraphy">
                    {getPrefectureName(prefecture, language)} 【{getCategoryName(landmark.category, language)}】
                  </span>
                </div>
              )}

              {/* 写真上のバッジ & 名所名 */}
              <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-end justify-between pointer-events-none">
                <div className="w-full">
                  <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-950/80 text-amber-300 border border-amber-500/40 backdrop-blur-sm flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-red-400" />
                      {getPrefectureName(prefecture, language)}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border backdrop-blur-sm ${catInfo.badgeColor} flex items-center gap-0.5`}>
                      <CategoryIcon category={landmark.category} size={11} />
                      <span>{getCategoryName(landmark.category, language)}</span>
                    </span>
                    {landmark.fameLevel && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border backdrop-blur-sm ${
                          landmark.fameLevel === 'national'
                            ? 'bg-amber-500/30 text-amber-200 border-amber-400/50'
                            : landmark.fameLevel === 'regional'
                            ? 'bg-sky-500/30 text-sky-200 border-sky-400/50'
                            : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50'
                        }`}
                      >
                        {landmark.fameLevel === 'national' ? t('fame_national', language) : landmark.fameLevel === 'regional' ? t('fame_regional', language) : t('fame_minor', language)}
                      </span>
                    )}
                    {isPrefectureCleared && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/40 text-emerald-300 border border-emerald-400">
                        {t('spots_cleared', language)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-white font-calligraphy drop-shadow-md tracking-wider truncate">
                    {getLandmarkName(landmark, language)}
                  </h3>
                </div>
              </div>
            </div>

            {/* 本文エリア (コンパクト＆スクロール対応) */}
            <div className="p-2.5 bg-slate-900/95 space-y-1.5 max-h-44 overflow-y-auto">
              <p className="text-[11px] text-slate-200 leading-relaxed font-sans line-clamp-2 hover:line-clamp-none transition-all">
                {landmark.description}
              </p>

              {/* 名物グルメバッジ */}
              {landmark.localGourmet && (
                <div className="px-2 py-1 rounded-lg bg-orange-950/60 border border-orange-500/40 flex items-center gap-1.5 text-[10px] shadow-sm">
                  <span className="text-xs flex-shrink-0">🍜</span>
                  <div className="text-left overflow-hidden truncate">
                    <span className="font-bold text-orange-300 mr-1 flex-shrink-0">{t('gourmet_tag', language)}:</span>
                    <span className="text-orange-100 font-medium">{landmark.localGourmet}</span>
                  </div>
                </div>
              )}

              {/* 歴史・観光エピソード */}
              {landmark.episode && (
                <div className="px-2 py-1 rounded-lg bg-slate-800/80 border border-amber-500/30 flex items-start gap-1.5 text-[10px] text-slate-300">
                  <span className="text-xs flex-shrink-0 mt-0.5">📜</span>
                  <div className="text-left leading-relaxed">
                    <span className="font-bold text-amber-300 block text-[10px]">{t('episode_tag', language)}:</span>
                    <span>{landmark.episode}</span>
                  </div>
                </div>
              )}

              {/* 属性ボーナス（旅の加護）通知 */}
              <div className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 text-[10px]">
                <Zap className="w-3 h-3 text-amber-400 flex-shrink-0 animate-pulse" />
                <div className="text-left overflow-hidden truncate">
                  <span className="font-bold text-amber-300 mr-1">{t('blessing_tag', language)}:</span>
                  <span className="text-slate-300">{catInfo.blessingName} - {catInfo.blessingDesc}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* 最小化時: 1行のスマートピル表示 */
          <div className="px-2.5 py-1.5 bg-slate-900/95 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-amber-400">📍</span>
              <span className="font-bold text-white truncate">{getLandmarkName(landmark, language)}</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">({getPrefectureName(prefecture, language)})</span>
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="text-[10px] font-bold text-amber-300 hover:text-amber-200 underline ml-2 flex-shrink-0"
            >
              {t('open_details', language)}
            </button>
          </div>
        )}

        {/* 自動フェードアウト進行バー (ホバー中はアニメーション一時停止) */}
        <div className="w-full h-1 bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all ease-linear"
            style={{
              width: '100%',
              animation: `shrinkWidth ${autoCloseDurationMs}ms linear forwards`,
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </aside>
  );
};
