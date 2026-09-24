import React, { useState, useEffect } from 'react';
import { DartHit, GameDifficulty, Language } from '../types';
import confetti from 'canvas-confetti';

interface DartOverlayProps {
  currentHits: DartHit[];
  activeDart: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    progress: number; // 0 to 1
    windDriftX?: number;
    windDriftY?: number;
    zoomLevel?: number;
  } | null;
  pullBackState: {
    isPulling: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null;
  onLauncherPointerDown: (e: React.PointerEvent) => void;
  onLauncherPointerMove: (e: React.PointerEvent) => void;
  onLauncherPointerUp: (e: React.PointerEvent) => void;
  difficulty?: GameDifficulty;
  language?: Language;
}

export const DartOverlay: React.FC<DartOverlayProps> = ({
  currentHits,
  activeDart,
  pullBackState,
  onLauncherPointerDown,
  onLauncherPointerMove,
  onLauncherPointerUp,
  difficulty = 'easy',
  language = 'ja',
}) => {
  // 着弾エフェクト用 (衝撃波・スパーク)
  const [shockwaves, setShockwaves] = useState<Array<{ id: string; x: number; y: number; isCorrect: boolean; isPinpointBull?: boolean; isOb?: boolean }>>([]);
  // ポップアップバナー用 (PINPOINT BULL / OB / CLEAR / DISTANCE)
  const [activeBanner, setActiveBanner] = useState<{ id: string; text: string; subText?: string; x: number; y: number; type: 'bull' | 'ob' | 'clear' | 'distance' | 'normal' } | null>(null);

  // 直近の着弾があった場合にエフェクトをトリガー
  useEffect(() => {
    if (currentHits.length > 0) {
      const latest = currentHits[currentHits.length - 1];
      const newShockwave = {
        id: latest.id,
        x: latest.screenX,
        y: latest.screenY,
        isCorrect: !!latest.isCorrect,
        isPinpointBull: !!latest.isPinpointBull,
        isOb: !!latest.isOb,
      };

      setShockwaves((prev) => [...prev, newShockwave]);

      // ピンポイント直撃 (PINPOINT BULL)
      if (latest.isPinpointBull) {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: {
            x: latest.screenX / window.innerWidth,
            y: latest.screenY / window.innerHeight,
          },
          colors: ['#fbbf24', '#f59e0b', '#ef4444', '#ffffff', '#38bdf8'],
        });
        setActiveBanner({
          id: latest.id,
          text: '🎯 PINPOINT BULL!!',
          subText: `敷地直撃ボーナス! +${latest.score.toLocaleString()}pt (x${(latest.zoomMultiplier || 5.0).toFixed(1)})`,
          x: latest.screenX,
          y: latest.screenY,
          type: 'bull',
        });
      } else if (latest.isOb) {
        // 高ズームOB (枠外流され)
        setActiveBanner({
          id: latest.id,
          text: '⚠️ OUT OF BOUNDS (OB!)',
          subText: '強風で目標敷地から流された！風上を狙おう',
          x: latest.screenX,
          y: latest.screenY,
          type: 'ob',
        });
      } else if (latest.isNearPin) {
        // 通常ニアピン
        confetti({
          particleCount: 60,
          spread: 70,
          origin: {
            x: latest.screenX / window.innerWidth,
            y: latest.screenY / window.innerHeight,
          },
          colors: ['#eab308', '#f59e0b', '#38bdf8', '#ffffff'],
        });
        setActiveBanner({
          id: latest.id,
          text: '🎯 NEAR PIN CLEAR!',
          subText: `${latest.hitLandmark?.name || '名所制覇'} +${latest.score.toLocaleString()}pt`,
          x: latest.screenX,
          y: latest.screenY,
          type: 'clear',
        });
      } else if (difficulty !== 'hard' && latest.distanceToTargetKm !== undefined) {
        // Normal / Easyモード: 目標までの距離・方角フィードバック！
        const distStr = latest.distanceToTargetKm < 1
          ? `${Math.max(10, Math.round(latest.distanceToTargetKm * 1000))}m`
          : `${latest.distanceToTargetKm.toFixed(1)}km`;

        setActiveBanner({
          id: latest.id,
          text: `🎯 目標まで あと ${distStr}`,
          subText: `【${latest.nearestLandmarkName || '目標名所'}】は ${latest.targetBearing || ''} 方向`,
          x: latest.screenX,
          y: latest.screenY,
          type: 'distance',
        });
      }

      const shockwaveTimer = setTimeout(() => {
        setShockwaves((prev) => prev.filter((s) => s.id !== latest.id));
      }, 1200);

      const bannerTimer = setTimeout(() => {
        setActiveBanner((prev) => (prev?.id === latest.id ? null : prev));
      }, 3000);

      return () => {
        clearTimeout(shockwaveTimer);
        clearTimeout(bannerTimer);
      };
    }
  }, [currentHits, difficulty]);

  // -------------------------------------------------------------
  // 放物線（Ballistic Parabola）弾道物理計算
  // -------------------------------------------------------------
  const ballistic = activeDart ? (() => {
    const p = activeDart.progress;
    const fromX = activeDart.fromX;
    const fromY = activeDart.fromY;
    const toX = activeDart.toX;
    const toY = activeDart.toY;
    const windDriftX = activeDart.windDriftX || 0;
    const windDriftY = activeDart.windDriftY || 0;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy);

    // 山なり放物線の最大跳躍高度（手前から奥へ舞い上がる高さ）
    const arcHeight = Math.min(240, Math.max(90, dist * 0.28));

    // 高度曲線 h(p): 0 -> 1 -> 0
    const h = Math.sin(p * Math.PI);

    // 風による空中ドリフト（飛翔が進むにつれて風下へ湾曲）
    const driftFactor = Math.pow(p, 1.4);
    const driftX = windDriftX * driftFactor;
    const driftY = windDriftY * driftFactor;

    // 地面（シャドウ）位置
    const groundX = fromX + dx * p + driftX;
    const groundY = fromY + dy * p + driftY;

    // ダーツ本体の空中位置（山なりに浮き上がる）
    const dartX = groundX;
    const dartY = groundY - h * arcHeight;

    // 地面の影のオフセットと不透明度
    const shadowX = groundX + 8 * (1 - p);
    const shadowY = groundY + 12 * h;
    const shadowOpacity = 0.18 + 0.65 * (1 - h);
    const shadowBlur = 2 + 10 * h;
    const shadowScale = 0.6 + 0.4 * (1 - h);

    // 姿勢角 (ピッチ変化: 投げ出し時の仰角 -> 頂点の水平 -> 突入時の急降下俯角)
    const baseAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 45;
    const pitchOffset = (p - 0.45) * 45; // -20deg 〜 +25deg
    const rotation = baseAngle + pitchOffset;

    // パースペクティブスケール (手前 2.4x -> 奥 1.0x + 空中浮遊感)
    const scale = 2.4 - p * 1.4 + h * 0.25;

    return {
      dartX,
      dartY,
      shadowX,
      shadowY,
      shadowOpacity,
      shadowBlur,
      shadowScale,
      rotation,
      scale,
      h,
      p,
    };
  })() : null;

  return (
    <>
      {/* 1. 全画面オーバーレイ (ポインターイベントは基本透過し、描画のみ担当) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        
        {/* プルバック投てきガイドライン */}
        {pullBackState && pullBackState.isPulling && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            <defs>
              <linearGradient id="pullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>

            {/* 引っ張りライン */}
            <line
              x1={pullBackState.startX}
              y1={pullBackState.startY}
              x2={pullBackState.currentX}
              y2={pullBackState.currentY}
              stroke="url(#pullGrad)"
              strokeWidth="4"
              strokeDasharray="6,4"
            />

            {/* 投てき目標予測ライン */}
            {(() => {
              const dx = pullBackState.startX - pullBackState.currentX;
              const dy = pullBackState.startY - pullBackState.currentY;
              const targetX = pullBackState.startX + dx * 2.8;
              const targetY = pullBackState.startY + dy * 2.8;

              return (
                <g>
                  <line
                    x1={pullBackState.startX}
                    y1={pullBackState.startY}
                    x2={targetX}
                    y2={targetY}
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="5,5"
                    opacity="0.85"
                  />
                  {/* 予測着弾マーカー */}
                  <circle
                    cx={targetX}
                    cy={targetY}
                    r="14"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="animate-ping"
                  />
                  <circle
                    cx={targetX}
                    cy={targetY}
                    r="5"
                    fill="#38bdf8"
                  />
                </g>
              );
            })()}

            {/* 引っ張り支点 */}
            <circle
              cx={pullBackState.startX}
              cy={pullBackState.startY}
              r="14"
              fill="rgba(239, 68, 68, 0.4)"
              stroke="#ef4444"
              strokeWidth="2.5"
            />
          </svg>
        )}

        {/* 2. 飛翔中のダーツ放物線 & 地面の影 */}
        {ballistic && (
          <>
            {/* A. 地面に落ちるリアルタイムの影 (ダーツの真下の地面を追従し、着弾で合流) */}
            <div
              className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${ballistic.shadowX}px`,
                top: `${ballistic.shadowY}px`,
                opacity: ballistic.shadowOpacity,
                filter: `blur(${ballistic.shadowBlur}px)`,
                transform: `translate(-50%, -50%) scale(${ballistic.shadowScale}) rotate(${ballistic.rotation}deg)`,
              }}
            >
              <div className="w-10 h-3 bg-black rounded-full" />
            </div>

            {/* B. 空中を山なりに飛ぶダーツ本体 (放物線弾道 + スピードトレイル) */}
            <div
              className="absolute pointer-events-none z-40 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${ballistic.dartX}px`,
                top: `${ballistic.dartY}px`,
                transform: `translate(-50%, -50%) scale(${ballistic.scale}) rotate(${ballistic.rotation}deg)`,
              }}
            >
              {/* 尾翼のスピード風切りライン */}
              {ballistic.p > 0.1 && ballistic.p < 0.95 && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gradient-to-t from-transparent via-sky-300/40 to-transparent pointer-events-none filter blur-[1px]" />
              )}

              <svg
                width="64"
                height="64"
                viewBox="0 0 100 100"
                className="filter drop-shadow-[0_16px_20px_rgba(0,0,0,0.6)]"
              >
                {/* 針 (スチールポイント) */}
                <line x1="20" y1="80" x2="45" y2="55" stroke="#f1f5f9" strokeWidth="4.5" strokeLinecap="round" />
                {/* バレル (真鍮/タングステンゴールド) */}
                <polygon points="42,58 55,45 61,51 48,64" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                {/* シャフト */}
                <line x1="54" y1="48" x2="76" y2="26" stroke="#475569" strokeWidth="3.8" />
                {/* フライト (赤羽フェザー) */}
                <polygon points="71,31 93,9 78,9 66,21" fill="#dc2626" />
                <polygon points="71,31 93,53 88,38 76,26" fill="#ef4444" />
                {/* ハイライト */}
                <line x1="72" y1="28" x2="88" y2="12" stroke="#fca5a5" strokeWidth="1.5" />
              </svg>
            </div>
          </>
        )}



        {/* 4. 着弾瞬間の衝撃波リング & スパーク */}
        {shockwaves.map((sw) => (
          <div
            key={`shockwave-${sw.id}`}
            className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${sw.x}px`, top: `${sw.y}px` }}
          >
            <div
              className={`rounded-full border-2 animate-ripple ${
                sw.isPinpointBull
                  ? 'w-24 h-24 border-amber-400 bg-amber-400/30 shadow-[0_0_25px_rgba(251,191,36,0.8)]'
                  : sw.isOb
                  ? 'w-20 h-20 border-red-500 bg-red-500/20'
                  : sw.isCorrect
                  ? 'w-16 h-16 border-amber-400 bg-amber-400/20'
                  : 'w-16 h-16 border-slate-400 bg-slate-500/10'
              }`}
            />
            <div
              className={`absolute top-1/2 left-1/2 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                sw.isPinpointBull
                  ? 'w-6 h-6 bg-amber-300 animate-ping shadow-[0_0_15px_#fde047]'
                  : sw.isOb
                  ? 'w-4 h-4 bg-red-500 animate-ping'
                  : sw.isCorrect
                  ? 'w-4 h-4 bg-amber-300 animate-ping'
                  : 'w-3 h-3 bg-slate-400'
              }`}
            />
          </div>
        ))}

        {/* 5. 特別着弾バナー (PINPOINT BULL / OB / CLEAR / DISTANCE) */}
        {activeBanner && (
          <div
            className="absolute pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full transition-all animate-bounce"
            style={{
              left: `${Math.max(140, Math.min(window.innerWidth - 140, activeBanner.x))}px`,
              top: `${Math.max(80, activeBanner.y - 45)}px`,
            }}
          >
            <div
              className={`px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col items-center border ${
                activeBanner.type === 'bull'
                  ? 'bg-gradient-to-r from-amber-500/90 via-red-500/90 to-amber-500/90 border-amber-300 text-white ring-4 ring-amber-400/50'
                  : activeBanner.type === 'ob'
                  ? 'bg-slate-950/95 border-red-500 text-red-400 ring-2 ring-red-500/40'
                  : activeBanner.type === 'clear'
                  ? 'bg-slate-900/95 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                  : activeBanner.type === 'distance'
                  ? 'bg-sky-950/95 border-sky-400 text-sky-200 ring-2 ring-sky-400/60 shadow-sky-500/30'
                  : 'bg-slate-900/95 border-slate-700 text-slate-200'
              }`}
            >
              <span className="text-base md:text-lg font-black tracking-wider uppercase drop-shadow-md">
                {activeBanner.text}
              </span>
              {activeBanner.subText && (
                <span className="text-xs font-bold text-slate-100/90 mt-0.5 whitespace-nowrap">
                  {activeBanner.subText}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. 画面左下の「プルバック投てきランチャー」 (中央パネルと被らない位置) */}
      <div className="absolute bottom-3 left-4 md:left-6 z-30 pointer-events-auto flex flex-col items-start select-none">
        <div
          onPointerDown={onLauncherPointerDown}
          onPointerMove={onLauncherPointerMove}
          onPointerUp={onLauncherPointerUp}
          onPointerCancel={onLauncherPointerUp}
          className={`relative group cursor-grab active:cursor-grabbing px-4 py-2 rounded-2xl glass-panel-gold border-amber-400/50 shadow-2xl flex items-center gap-2.5 transition-transform active:scale-95 touch-none ${
            pullBackState?.isPulling ? 'ring-4 ring-amber-400/60 bg-amber-500/30' : ''
          }`}
          title={
            language === 'en'
              ? 'Pull & release to throw! You can also click or tap the map directly.'
              : 'ここを引いて放すとプルバック投てき！マップ直接クリックでも投げられます。'
          }
        >
          <span className="text-2xl animate-pulse">🏹</span>
          <div className="text-left">
            <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
              {pullBackState?.isPulling
                ? (language === 'en' ? 'RELEASE NOW!' : '引っ張って放せ！')
                : 'PULL & RELEASE'}
            </span>
            <span className="text-xs font-bold text-slate-100 block">
              {language === 'en' ? 'Pull & Release Launcher' : '引いて放つ投てき台'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline border-l border-slate-700 pl-2">
            {language === 'en' ? '(Or click map directly)' : '（地図クリックでも即投てき可）'}
          </span>
        </div>
      </div>
    </>
  );
};
