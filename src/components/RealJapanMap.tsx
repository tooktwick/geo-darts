import React, { useRef, useState, useCallback } from 'react';
import { Prefecture, GameMode, Landmark } from '../types';
import { PREFECTURES, REGION_COLORS } from '../data/prefectures';
import { projectGeoToMap, unprojectMapToGeo, findNearestPrefecture } from '../utils/geo';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface RealJapanMapProps {
  currentTarget: Prefecture | null;
  activePrefectureId?: number;
  landmarks?: Landmark[];
  clearedLandmarkIds?: string[];
  visitedPrefIds: Set<number>;
  onPrefectureClick: (pref: Prefecture, point: { x: number; y: number; screenX: number; screenY: number }) => void;
  onMapClick: (point: { x: number; y: number; screenX: number; screenY: number }) => void;
  zoomScale: number;
  onZoomChange: (scale: number) => void;
  mode: GameMode;
}

const JAPAN_COASTLINE_GEO = [
  // 本州
  [
    [41.5, 140.9], [41.2, 141.4], [40.5, 141.5], [39.6, 142.0], [38.3, 141.5],
    [37.0, 140.9], [35.7, 140.8], [35.0, 139.9], [34.9, 139.1], [34.6, 138.2],
    [34.6, 137.0], [34.3, 136.8], [33.5, 135.9], [33.7, 135.3], [34.3, 135.1],
    [34.6, 134.5], [34.4, 133.5], [34.3, 132.5], [33.9, 131.0], [34.1, 130.9],
    [34.5, 131.5], [35.0, 132.3], [35.5, 133.3], [35.6, 134.4], [35.6, 135.3],
    [35.8, 136.0], [36.3, 136.3], [37.3, 136.9], [37.5, 137.3], [36.7, 137.1],
    [36.8, 137.8], [37.9, 139.1], [38.5, 139.8], [39.9, 139.9], [40.7, 139.9],
    [41.2, 140.3], [41.5, 140.9]
  ],
  // 北海道
  [
    [45.5, 141.9], [45.0, 142.5], [44.4, 143.5], [44.1, 145.2], [43.3, 145.8],
    [43.0, 145.0], [42.9, 144.0], [42.2, 143.3], [42.0, 142.0], [42.6, 141.0],
    [42.3, 140.4], [41.5, 140.0], [41.9, 140.0], [42.7, 140.3], [43.2, 140.8],
    [43.8, 141.4], [44.8, 141.7], [45.5, 141.9]
  ],
  // 四国
  [
    [34.4, 134.3], [34.1, 134.6], [33.8, 134.6], [33.5, 134.3], [33.2, 133.0],
    [32.7, 132.9], [33.0, 132.5], [33.5, 132.4], [33.9, 132.8], [34.1, 133.5],
    [34.4, 134.3]
  ],
  // 九州
  [
    [33.9, 131.0], [33.6, 131.7], [33.2, 131.9], [32.8, 131.9], [31.5, 131.4],
    [31.3, 131.1], [31.0, 130.7], [31.3, 130.4], [31.7, 130.2], [32.2, 130.4],
    [32.6, 130.5], [32.8, 130.1], [33.2, 129.8], [33.6, 130.2], [33.9, 131.0]
  ],
  // 沖縄本島
  [
    [26.8, 128.2], [26.5, 127.9], [26.1, 127.7], [26.2, 127.8], [26.6, 128.0], [26.8, 128.2]
  ]
];

export const RealJapanMap: React.FC<RealJapanMapProps> = ({
  currentTarget,
  activePrefectureId,
  landmarks = [],
  clearedLandmarkIds = [],
  visitedPrefIds,
  onPrefectureClick,
  onMapClick,
  zoomScale,
  onZoomChange,
  mode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPref, setHoveredPref] = useState<{ pref: Prefecture; distance: number } | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.min(4.0, Math.max(0.85, zoomScale * zoomFactor));
    onZoomChange(newScale);
  }, [zoomScale, onZoomChange]);

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
      return;
    }

    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

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
      svgY = ((e.clientY - rect.top) / rect.height) * 1000;
    }

    const geo = unprojectMapToGeo(svgX, svgY);
    const nearest = findNearestPrefecture(geo.lat, geo.lng, PREFECTURES);
    if (nearest && nearest.distanceKm < 120) {
      setHoveredPref({ pref: nearest.prefecture, distance: Math.round(nearest.distanceKm) });
    } else {
      setHoveredPref(null);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    onZoomChange(1.0);
    setPan({ x: 0, y: 0 });
  };

  const zoomIn = () => onZoomChange(Math.min(4.0, zoomScale * 1.25));
  const zoomOut = () => onZoomChange(Math.max(0.85, zoomScale * 0.8));

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
      svgY = ((e.clientY - rect.top) / rect.height) * 1000;
    }

    const targetElem = e.target as SVGElement;
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

    const geo = unprojectMapToGeo(svgX, svgY);
    const nearest = findNearestPrefecture(geo.lat, geo.lng, PREFECTURES);

    if (nearest && nearest.distanceKm <= 130) {
      onPrefectureClick(nearest.prefecture, {
        x: svgX,
        y: svgY,
        screenX: e.clientX,
        screenY: e.clientY,
      });
    } else {
      onMapClick({
        x: svgX,
        y: svgY,
        screenX: e.clientX,
        screenY: e.clientY,
      });
    }
  };

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
          className="glass-panel p-2.5 rounded-xl text-slate-200 hover:text-white hover:border-sky-400/50 transition-all shadow-lg active:scale-95"
          title="ズームイン (+)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={zoomOut}
          className="glass-panel p-2.5 rounded-xl text-slate-200 hover:text-white hover:border-sky-400/50 transition-all shadow-lg active:scale-95"
          title="ズームアウト (-)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={resetView}
          className="glass-panel p-2.5 rounded-xl text-slate-200 hover:text-sky-400 hover:border-sky-400/50 transition-all shadow-lg active:scale-95"
          title="リセット"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* ホバー情報 */}
      {hoveredPref && (
        <div className="absolute top-20 left-6 z-30 pointer-events-none glass-panel px-3.5 py-2 rounded-xl text-xs shadow-2xl border-sky-500/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="font-bold text-white text-sm font-calligraphy">
              {hoveredPref.pref.name}
            </span>
          </div>
        </div>
      )}

      {/* 地図トランスフォーム領域 */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full max-w-[1200px] max-h-[900px] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
          onClick={handleSvgClick}
        >
          <defs>
            <filter id="realTargetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 海岸線ポリゴン */}
          <g id="coastlines">
            {JAPAN_COASTLINE_GEO.map((island, idx) => {
              const pathStr = island
                .map((coord, i) => {
                  const pt = projectGeoToMap(coord[0], coord[1]);
                  return `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                })
                .join(' ') + ' Z';

              return (
                <path
                  key={`island-${idx}`}
                  d={pathStr}
                  fill="#1e293b"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              );
            })}
          </g>

          {/* 47都道府県マーカー */}
          <g id="prefecture-points">
            {PREFECTURES.map((pref) => {
              const pt = projectGeoToMap(pref.coordinates.lat, pref.coordinates.lng);
              const isTarget = activePref?.id === pref.id;
              const isVisited = visitedPrefIds.has(pref.id);
              const regionColor = REGION_COLORS[pref.region];

              return (
                <g key={`real-pref-${pref.id}`} className="cursor-pointer group">
                  {isTarget && (
                    <g filter="url(#realTargetGlow)">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="24"
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="2"
                        className="animate-ping origin-center"
                        opacity="0.75"
                      />
                    </g>
                  )}

                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isTarget ? 7 : isVisited ? 5 : 3.5}
                    fill={isTarget ? '#eab308' : isVisited ? regionColor.base : '#64748b'}
                    stroke={isTarget ? '#ffffff' : '#0f172a'}
                    strokeWidth={isTarget ? 2 : 1}
                  />

                  <text
                    x={pt.x}
                    y={pt.y - 9}
                    textAnchor="middle"
                    fill={isTarget ? '#fef08a' : isVisited ? '#ffffff' : '#94a3b8'}
                    fontSize={isTarget ? 13 : 9}
                    fontWeight={isTarget ? '900' : isVisited ? 'bold' : 'normal'}
                    pointerEvents="none"
                    fontFamily="'M PLUS Rounded 1c', sans-serif"
                  >
                    {pref.name.replace(/(都|府|県)$/, '')}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 基本モード専用: リアルマップ上での3大名所ターゲットピン */}
          {mode === 'basic' && landmarks.length > 0 && (
            <g id="real-landmarks-targets">
              {landmarks.map((lm) => {
                const pt = projectGeoToMap(lm.coordinates.lat, lm.coordinates.lng);
                const isCleared = clearedLandmarkIds.includes(lm.id);

                return (
                  <g
                    key={`real-lm-${lm.id}`}
                    id={`landmark-target-${lm.id}`}
                    data-landmark-id={lm.id}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer"
                  >
                    {/* ニアピンサークル */}
                    <circle
                      r={isCleared ? 12 : 20}
                      fill={isCleared ? 'rgba(16, 185, 129, 0.45)' : 'rgba(234, 179, 8, 0.4)'}
                      stroke={isCleared ? '#10b981' : '#f59e0b'}
                      strokeWidth={isCleared ? 2 : 2.5}
                      className={isCleared ? '' : 'animate-ping origin-center'}
                      strokeDasharray={isCleared ? 'none' : '4,3'}
                    />
                    <circle
                      r={isCleared ? 6 : 7}
                      fill={isCleared ? '#10b981' : '#eab308'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    {/* 名所ラベル */}
                    <g transform="translate(0, -20)">
                      <rect
                        x="-40"
                        y="-12"
                        width="80"
                        height="18"
                        rx="9"
                        fill={isCleared ? '#064e3b' : '#1e1b4b'}
                        stroke={isCleared ? '#10b981' : '#eab308'}
                        strokeWidth="1.5"
                        opacity="0.95"
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
        </svg>
      </div>
    </div>
  );
};
