import React, { useRef, useState, useCallback } from 'react';
import { Prefecture, RegionType, GameMode, Landmark, GameDifficulty, DartHit } from '../types';
import { PREFECTURES, REGION_COLORS } from '../data/prefectures';
import { getLandmarkSvgPosition, projectGeoToMap } from '../utils/geo';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface JapanMapProps {
  currentTarget: Prefecture | null;
  activePrefectureId?: number;
  landmarks?: Landmark[];
  clearedLandmarkIds?: string[];
  visitedPrefIds: Set<number>;
  currentHits?: DartHit[];
  onPrefectureClick: (pref: Prefecture, point: { x: number; y: number; screenX: number; screenY: number }) => void;
  onMapClick: (point: { x: number; y: number; screenX: number; screenY: number }) => void;
  zoomScale: number;
  onZoomChange: (scale: number) => void;
  mode: GameMode;
  difficulty?: GameDifficulty;
}

export const JapanMap: React.FC<JapanMapProps> = ({
  currentTarget,
  activePrefectureId,
  landmarks = [],
  clearedLandmarkIds = [],
  visitedPrefIds,
  currentHits = [],
  onPrefectureClick,
  onMapClick,
  zoomScale,
  onZoomChange,
  mode,
  difficulty = 'easy',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPref, setHoveredPref] = useState<Prefecture | null>(null);

  // マウスホイールズーム
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.min(3.5, Math.max(0.85, zoomScale * zoomFactor));
    onZoomChange(newScale);
  }, [zoomScale, onZoomChange]);

  // パン操作
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2 || e.shiftKey) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    onZoomChange(1.0);
    setPan({ x: 0, y: 0 });
  };

  const zoomIn = () => onZoomChange(Math.min(3.5, zoomScale * 1.25));
  const zoomOut = () => onZoomChange(Math.max(0.85, zoomScale * 0.8));

  // クリック時の座標計算 (getScreenCTMによる数学的に完全なSVG座標逆変換)
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) return;
    const svg = e.currentTarget;
    let svgX = 0;
    let svgY = 0;

    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const transformed = pt.matrixTransform(ctm.inverse());
      svgX = transformed.x;
      svgY = transformed.y;
    } else {
      const rect = svg.getBoundingClientRect();
      svgX = ((e.clientX - rect.left) / rect.width) * 1000;
      svgY = ((e.clientY - rect.top) / rect.height) * 950;
    }

    // クリックされた要素または親に data-landmark-id または data-pref-id があるか確認
    const targetElem = e.target as SVGElement;
    
    // 名所要素がクリックされた場合
    const landmarkElem = targetElem.closest('[data-landmark-id]');
    if (landmarkElem && activePref) {
      onPrefectureClick(activePref, {
        x: svgX,
        y: svgY,
        screenX: e.clientX,
        screenY: e.clientY,
      });
      return;
    }

    // 都道府県がクリックされた場合
    const prefElem = targetElem.closest('[data-pref-id]');
    if (prefElem) {
      const prefIdAttr = prefElem.getAttribute('data-pref-id');
      if (prefIdAttr) {
        const prefId = parseInt(prefIdAttr, 10);
        const pref = PREFECTURES.find((p) => p.id === prefId);
        if (pref) {
          onPrefectureClick(pref, {
            x: svgX,
            y: svgY,
            screenX: e.clientX,
            screenY: e.clientY,
          });
          return;
        }
      }
    }

    onMapClick({
      x: svgX,
      y: svgY,
      screenX: e.clientX,
      screenY: e.clientY,
    });
  };

  // 現在フォーカス中の都道府県
  const activePref = activePrefectureId
    ? PREFECTURES.find((p) => p.id === activePrefectureId)
    : currentTarget;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full overflow-hidden bg-slate-950 cursor-crosshair select-none"
    >
      {/* ズーム & リセット */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={zoomIn}
          className="glass-panel p-2.5 rounded-xl text-slate-200 hover:text-white hover:border-amber-400/50 transition-all shadow-lg active:scale-95"
          title="ズームイン (+)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={zoomOut}
          className="glass-panel p-2.5 rounded-xl text-slate-200 hover:text-white hover:border-amber-400/50 transition-all shadow-lg active:scale-95"
          title="ズームアウト (-)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={resetView}
          className="glass-panel p-2.5 rounded-xl text-slate-200 hover:text-amber-400 hover:border-amber-400/50 transition-all shadow-lg active:scale-95"
          title="リセット"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* ホバーチップ */}
      {hoveredPref && (
        <div
          className="absolute pointer-events-none z-30 glass-panel-gold px-3 py-1.5 rounded-xl text-xs shadow-2xl border-amber-400/50 transition-all transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(hoveredPref.mapCenter ? hoveredPref.mapCenter[0] / 1000 : 0.5) * 100}%`,
            top: `${(hoveredPref.mapCenter ? hoveredPref.mapCenter[1] / 950 : 0.5) * 100}%`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-300 font-calligraphy text-sm">{hoveredPref.name}</span>
            <span className="text-[10px] text-slate-300">({hoveredPref.capital})</span>
          </div>
          <div className="text-[10px] text-slate-400">
            特産: {hoveredPref.specialties.slice(0, 2).join('・')}
          </div>
        </div>
      )}

      {/* メインSVG地図 */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 1000 950"
          className="w-full h-full max-w-[1200px] max-h-[900px] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
          onClick={handleSvgClick}
        >
          <defs>
            <radialGradient id="oceanGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            <filter id="targetGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 背景グリッド */}
          <g opacity="0.12" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="4,4">
            <circle cx="500" cy="500" r="380" fill="none" stroke="#38bdf8" strokeWidth="0.75" />
            <circle cx="500" cy="500" r="220" fill="none" stroke="#38bdf8" strokeWidth="0.75" />
          </g>

          {/* 沖縄囲み */}
          <g stroke="#475569" strokeWidth="1" strokeDasharray="3,3" opacity="0.5">
            <rect x="140" y="855" width="165" height="85" rx="8" fill="rgba(15, 23, 42, 0.4)" />
            <text x="148" y="870" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">沖縄諸島</text>
          </g>

          {/* 47都道府県パス */}
          <g id="prefectures-layer">
            {PREFECTURES.map((pref) => {
              const isTarget = activePref?.id === pref.id;
              const isVisited = visitedPrefIds.has(pref.id);
              const isHovered = hoveredPref?.id === pref.id;
              const regionColor = REGION_COLORS[pref.region];

              let fillColor = isVisited ? regionColor.base : '#1e293b';
              let strokeColor = isVisited ? regionColor.stroke : '#334155';
              let strokeWidth = 1.2;

              if (isTarget) {
                fillColor = '#eab308';
                strokeColor = '#fef08a';
                strokeWidth = 2.8;
              } else if (isHovered) {
                fillColor = regionColor.hover;
                strokeColor = '#f8fafc';
                strokeWidth = 2.0;
              }

              return (
                <g key={pref.id} className="cursor-pointer group">
                  <path
                    d={pref.svgPath}
                    data-pref-id={pref.id}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter={isTarget ? 'url(#targetGlowFilter)' : undefined}
                    className={`transition-all duration-200 ${
                      isTarget ? 'animate-pulse' : 'hover:brightness-125'
                    }`}
                    onMouseEnter={() => setHoveredPref(pref)}
                    onMouseLeave={() => setHoveredPref(null)}
                  />

                  {/* 都道府県名 */}
                  {pref.mapCenter && (
                    <text
                      x={pref.mapCenter[0]}
                      y={pref.mapCenter[1]}
                      textAnchor="middle"
                      dominantBaseline="central"
                      pointerEvents="none"
                      fill={isTarget ? '#1e1b4b' : isVisited ? '#ffffff' : '#94a3b8'}
                      fontSize={pref.id === 1 ? 16 : 10.5}
                      fontWeight={isTarget || isVisited ? 'bold' : 'normal'}
                      fontFamily="'M PLUS Rounded 1c', sans-serif"
                    >
                      {pref.name.replace(/(都|府|県)$/, '')}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 基本モード・愛知詳細モード: 名所ターゲットピン */}
          {(mode === 'basic' || mode === 'aichi_detail') && activePref && landmarks.length > 0 && (
            <g id="landmarks-targets-layer">
              {landmarks.map((lm) => {
                const [lmX, lmY] = getLandmarkSvgPosition(activePref, lm);
                const isCleared = clearedLandmarkIds.includes(lm.id);

                // Easy 以外（Normal / Hard）は未クリア目標を描画しない
                if (!isCleared && difficulty !== 'easy') {
                  return null;
                }

                return (
                  <g
                    key={lm.id}
                    id={`landmark-target-${lm.id}`}
                    data-landmark-id={lm.id}
                    transform={`translate(${lmX}, ${lmY})`}
                    className="cursor-pointer"
                  >
                    {/* ニアピン判定サークル (見た目の円) */}
                    <circle
                      r={isCleared ? 12 : 20}
                      fill={isCleared ? 'rgba(16, 185, 129, 0.45)' : 'rgba(234, 179, 8, 0.4)'}
                      stroke={isCleared ? '#10b981' : '#f59e0b'}
                      strokeWidth={isCleared ? 2 : 2.5}
                      className={isCleared ? '' : 'animate-ping origin-center'}
                      strokeDasharray={isCleared ? 'none' : '4,3'}
                    />

                    {/* 中心ピン */}
                    <circle
                      r={isCleared ? 6 : 7}
                      fill={isCleared ? '#10b981' : '#eab308'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* ラベルバッジ */}
                    <g transform="translate(0, -22)">
                      <rect
                        x="-42"
                        y="-12"
                        width="84"
                        height="18"
                        rx="9"
                        fill={isCleared ? '#064e3b' : '#1e1b4b'}
                        stroke={isCleared ? '#10b981' : '#eab308'}
                        strokeWidth="1.5"
                        opacity="0.95"
                        className="filter drop-shadow-md"
                      />
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={isCleared ? '#6ee7b7' : '#fef08a'}
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="'M PLUS Rounded 1c', sans-serif"
                      >
                        {isCleared ? '✓ ' : ''}{lm.name.slice(0, 6)}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* 着弾ピン & 投擲位置マーカーレイヤー */}
          {currentHits.length > 0 && (
            <g id="dart-hits-layer">
              {currentHits.map((hit, idx) => {
                const isLatest = idx === currentHits.length - 1;

                // 投擲位置 (SVG座標)
                let aimX: number | undefined;
                let aimY: number | undefined;
                if (hit.aimLat !== undefined && hit.aimLng !== undefined) {
                  const aimSvg = projectGeoToMap(hit.aimLat, hit.aimLng);
                  aimX = aimSvg.x;
                  aimY = aimSvg.y;
                }

                let label = hit.hitLandmark
                  ? `🎯 ${hit.hitLandmark.name}${hit.score > 0 ? ` +${hit.score}` : ''}`
                  : hit.prefecture
                  ? `${hit.prefecture.name}${hit.score > 0 ? ` +${hit.score}` : ''}`
                  : '外れ';

                if (difficulty !== 'hard' && !hit.isCorrect && hit.distanceToTargetKm !== undefined) {
                  const distStr = hit.distanceToTargetKm < 1
                    ? `${Math.max(10, Math.round(hit.distanceToTargetKm * 1000))}m`
                    : `${hit.distanceToTargetKm.toFixed(1)}km`;
                  label = `🎯 ${hit.nearestLandmarkName || '目標'}まで ${distStr}`;
                }

                return (
                  <g key={`hit-svg-${hit.id}`} opacity={isLatest ? 1 : 0.85}>
                    {/* A. 投擲位置マーカー & 風ドリフト軌跡 */}
                    {aimX !== undefined && aimY !== undefined && (
                      <g>
                        {/* ドリフト点線 */}
                        <line
                          x1={aimX}
                          y1={aimY}
                          x2={hit.x}
                          y2={hit.y}
                          stroke={isLatest ? '#22d3ee' : '#94a3b8'}
                          strokeWidth={isLatest ? 2 : 1.2}
                          strokeDasharray="4 3"
                          opacity={isLatest ? 0.9 : 0.5}
                        />
                        {/* 投擲照準 */}
                        <circle cx={aimX} cy={aimY} r={isLatest ? 7 : 5} fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                        <circle cx={aimX} cy={aimY} r="2.5" fill="#22d3ee" />
                      </g>
                    )}

                    {/* B. 刺さったリアルなダーツ矢本体 */}
                    <g transform={`translate(${hit.x}, ${hit.y})`}>
                      {/* 地面の着弾影 */}
                      <ellipse cx="4" cy="0" rx="9" ry="3" fill="rgba(0,0,0,0.45)" />
                      {/* 着弾穴 */}
                      <circle cx="0" cy="0" r="2" fill="#020617" stroke="#ffffff" strokeWidth="0.6" />
                      <circle cx="0" cy="0" r="3.5" fill="none" stroke={hit.isCorrect ? '#f59e0b' : '#ef4444'} strokeWidth="1" opacity="0.8" />

                      {/* ダーツ矢 (針先 0, 0 から右上へ) */}
                      <line x1="0" y1="0" x2="4" y2="-10" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
                      <polygon points="2,-9 5,-11 9,-20 6,-18" fill="#fbbf24" stroke="#d97706" strokeWidth="0.7" />
                      <line x1="7.5" y1="-19" x2="11" y2="-28" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
                      <polygon points="10,-26 19,-37 14,-39 7,-29" fill="#dc2626" />
                      <polygon points="10,-26 20,-24 18,-34 11,-28" fill="#ef4444" />
                      <polygon points="11,-28 14,-39 9,-36 7,-29" fill="#b91c1c" />

                      {/* 上部バッジ */}
                      <g transform="translate(0, -48)">
                        <rect
                          x="-50"
                          y="-10"
                          width="100"
                          height="18"
                          rx="9"
                          fill="#0f172a"
                          stroke={hit.isCorrect ? '#f59e0b' : isLatest ? '#38bdf8' : '#64748b'}
                          strokeWidth={isLatest ? 1.5 : 1}
                          opacity="0.95"
                        />
                        <text
                          x="0"
                          y="0"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          {!isLatest ? `#${idx + 1} ` : ''}{label}
                        </text>
                      </g>
                    </g>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
