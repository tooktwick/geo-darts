import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import { Prefecture, GameMode, Landmark, DartHit, GsiTileType, GameDifficulty } from '../types';
import { PREFECTURES } from '../data/prefectures';
import { findNearestPrefecture } from '../utils/geo';
import { getCategoryInfo } from '../utils/landmarkImages';
import { Layers, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export interface GsiJapanMapHandle {
  screenPointToLatLng: (screenX: number, screenY: number) => { lat: number; lng: number } | null;
  flyToLatLng: (lat: number, lng: number, zoomLevel?: number) => void;
}

interface GsiJapanMapProps {
  currentTarget: Prefecture | null;
  activePrefectureId?: number;
  landmarks?: Landmark[];
  clearedLandmarkIds?: string[];
  visitedPrefIds: Set<number>;
  currentHits: DartHit[];
  onPrefectureClick: (
    pref: Prefecture,
    point: { x: number; y: number; screenX: number; screenY: number; lat: number; lng: number }
  ) => void;
  onMapClick: (
    point: { x: number; y: number; screenX: number; screenY: number; lat: number; lng: number }
  ) => void;
  onZoomChange?: (zoom: number) => void;
  mode: GameMode;
  difficulty?: GameDifficulty;
}

// タイルURL定義
const TILES: Record<GsiTileType, { url: string; attribution: string; maxZoom: number; name: string }> = {
  pale: {
    url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a> (淡色地図)',
    maxZoom: 18,
    name: '地理院 淡色',
  },
  std: {
    url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a> (標準地図)',
    maxZoom: 18,
    name: '地理院 標準',
  },
  photo: {
    url: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a> (航空写真)',
    maxZoom: 18,
    name: '地理院 写真',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 19,
    name: 'OpenStreetMap',
  },
};

export const GsiJapanMap = forwardRef<GsiJapanMapHandle, GsiJapanMapProps>(({
  currentTarget,
  activePrefectureId,
  landmarks = [],
  clearedLandmarkIds = [],
  visitedPrefIds,
  currentHits,
  onPrefectureClick,
  onMapClick,
  onZoomChange,
  mode,
  difficulty = 'easy',
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const landmarkMarkersRef = useRef<L.Marker[]>([]);
  const hitMarkersRef = useRef<L.Marker[]>([]);
  const aimMarkersRef = useRef<L.Marker[]>([]);
  const driftLinesRef = useRef<L.Polyline[]>([]);

  const [currentTileType, setCurrentTileType] = useState<GsiTileType>('pale');
  const [showTileSelector, setShowTileSelector] = useState(false);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(6);

  const activePref = activePrefectureId
    ? PREFECTURES.find((p) => p.id === activePrefectureId)
    : currentTarget;

  const onPrefectureClickRef = useRef(onPrefectureClick);
  onPrefectureClickRef.current = onPrefectureClick;
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  // 1. Leaflet マップの初期化
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // 日本列島全体を中心とした初期ビュー
    const map = L.map(mapContainerRef.current, {
      center: [36.2048, 138.2529],
      zoom: 6,
      minZoom: 5,
      maxZoom: 16,
      zoomControl: false,
    });

    const tileDef = TILES[currentTileType];
    const layer = L.tileLayer(tileDef.url, {
      attribution: tileDef.attribution,
      maxZoom: tileDef.maxZoom,
    }).addTo(map);

    tileLayerRef.current = layer;
    mapInstanceRef.current = map;

    // ズームイベントリスナー
    const handleZoom = () => {
      const z = map.getZoom();
      setCurrentZoomLevel(z);
      onZoomChange?.(z);
    };
    map.on('zoomend', handleZoom);
    // 初期ズーム通知
    handleZoom();

    // 地図クリックイベント
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const point = map.latLngToContainerPoint(e.latlng);
      const containerRect = mapContainerRef.current?.getBoundingClientRect();
      const screenX = (containerRect?.left || 0) + point.x;
      const screenY = (containerRect?.top || 0) + point.y;

      const nearest = findNearestPrefecture(lat, lng, PREFECTURES);
      if (nearest && nearest.distanceKm <= 120) {
        onPrefectureClickRef.current(nearest.prefecture, {
          x: lng,
          y: lat,
          screenX,
          screenY,
          lat,
          lng,
        });
      } else {
        onMapClickRef.current({
          x: lng,
          y: lat,
          screenX,
          screenY,
          lat,
          lng,
        });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. タイルレイヤーの切り替え
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileDef = TILES[currentTileType];
    const newLayer = L.tileLayer(tileDef.url, {
      attribution: tileDef.attribution,
      maxZoom: tileDef.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [currentTileType]);

  // 3. 現在の挑戦県への自動フォーカス (県が切り替わった時)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activePref) return;

    map.flyTo([activePref.coordinates.lat, activePref.coordinates.lng], 8, {
      duration: 1.2,
    });
  }, [activePref?.id]);

  // 4. 名所ターゲットマーカーの描画 (HTML DivIcon)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 既存マーカーを削除
    landmarkMarkersRef.current.forEach((m) => map.removeLayer(m));
    landmarkMarkersRef.current = [];

    if ((mode === 'basic' || mode === 'aichi_detail') && landmarks.length > 0) {
      landmarks.forEach((lm) => {
        const isCleared = clearedLandmarkIds.includes(lm.id);

        // 難易度 Easy 以外（Normal / Hard）は、未クリア目標は地図上に表示しない！
        if (!isCleared && difficulty !== 'easy') {
          return;
        }

        const isHighZoom = currentZoomLevel >= 12;
        const catInfo = getCategoryInfo(lm.category);

        const html = `
          <div id="landmark-target-${lm.id}" data-landmark-id="${lm.id}" class="relative cursor-pointer select-none group">
            ${
              isHighZoom && !isCleared
                ? `
                {/* 高ズーム時のピンポイント直撃ターゲット同心円 */}
                <div class="absolute -top-7 -left-7 w-14 h-14 rounded-full border border-red-500/40 bg-red-500/10 pointer-events-none animate-pulse"></div>
                <div class="absolute -top-5 -left-5 w-10 h-10 rounded-full border border-amber-400/60 pointer-events-none"></div>
                <div class="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600/90 text-white shadow-lg pointer-events-none ring-1 ring-red-400 animate-bounce">
                  🎯 敷地中心 (x5.0)
                </div>
                `
                : ''
            }
            <div class="absolute -top-3 -left-3 w-7 h-7 rounded-full ${
              isCleared ? 'bg-emerald-500/40 border-2 border-emerald-400' : 'bg-amber-400/40 border-2 border-amber-400 animate-ping'
            }"></div>
            <div class="relative w-7 h-7 rounded-full flex items-center justify-center ${
              isCleared ? 'bg-emerald-600 text-white border-2 border-white' : 'bg-slate-950/95 text-amber-300 border-2 border-amber-400 shadow-amber-500/40'
            } shadow-xl font-bold text-xs p-0.5">
              ${
                isCleared
                  ? '✓'
                  : `<img src="${catInfo.iconPath}" alt="${catInfo.name}" class="w-4 h-4 object-contain pointer-events-none" />`
              }
            </div>
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-black ${
              isCleared ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50' : 'bg-slate-900/90 text-amber-300 border border-amber-400/60'
            } shadow-md pointer-events-none flex items-center gap-1">
              ${isCleared ? '✓ ' : ''}${lm.name}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html,
          className: 'custom-landmark-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([lm.coordinates.lat, lm.coordinates.lng], { icon }).addTo(map);

        // マーカー直接クリック時の投てき処理
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          const point = map.latLngToContainerPoint(e.latlng);
          const containerRect = mapContainerRef.current?.getBoundingClientRect();
          const screenX = (containerRect?.left || 0) + point.x;
          const screenY = (containerRect?.top || 0) + point.y;

          if (activePref) {
            onPrefectureClick(activePref, {
              x: lm.coordinates.lng,
              y: lm.coordinates.lat,
              screenX,
              screenY,
              lat: lm.coordinates.lat,
              lng: lm.coordinates.lng,
            });
          }
        });

        landmarkMarkersRef.current.push(marker);
      });
    }
  }, [landmarks, clearedLandmarkIds, mode, activePref, currentZoomLevel, difficulty]);

  // 外部からのスクリーン座標->緯度経度変換API & カメラ移動API
  useImperativeHandle(ref, () => ({
    screenPointToLatLng: (screenX: number, screenY: number) => {
      const map = mapInstanceRef.current;
      const container = mapContainerRef.current;
      if (!map || !container) return null;

      const rect = container.getBoundingClientRect();
      const localX = screenX - rect.left;
      const localY = screenY - rect.top;
      const latLng = map.containerPointToLatLng(L.point(localX, localY));
      return { lat: latLng.lat, lng: latLng.lng };
    },
    flyToLatLng: (lat: number, lng: number, zoomLevel: number = 12) => {
      const map = mapInstanceRef.current;
      if (!map) return;
      map.flyTo([lat, lng], zoomLevel, { duration: 1.2 });
    },
  }));

  // 5. 着弾したダーツピンマーカー & 投擲位置マーカー & 風ドリフト軌跡 (地図上に追従)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 既存マーカー & ラインのクリーンアップ
    hitMarkersRef.current.forEach((m) => map.removeLayer(m));
    hitMarkersRef.current = [];
    aimMarkersRef.current.forEach((m) => map.removeLayer(m));
    aimMarkersRef.current = [];
    driftLinesRef.current.forEach((l) => map.removeLayer(l));
    driftLinesRef.current = [];

    currentHits.forEach((hit, idx) => {
      const isLatest = idx === currentHits.length - 1;

      // A. プレイヤーが狙って投げた位置 (投擲位置: Aim Point)
      const aimLat = hit.aimLat ?? hit.lat;
      const aimLng = hit.aimLng ?? hit.lng;

      if (aimLat !== undefined && aimLng !== undefined && !isNaN(aimLat) && !isNaN(aimLng)) {
        const aimHtml = `
          <div style="width: 120px; height: 54px; display: flex; flex-direction: column; align-items: center; pointer-events: none; user-select: none;">
            <div style="padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 900; background: rgba(8, 51, 68, 0.95); color: #67e8f9; border: 1px solid #22d3ee; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); white-space: nowrap; margin-bottom: 2px;">
              ${!isLatest ? `<span style="opacity: 0.7; margin-right: 3px;">#${idx + 1}</span>` : ''}🎯 投擲位置
            </div>
            <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; inset: 0; border-radius: 9999px; border: 2px solid #22d3ee; background: rgba(34, 211, 238, 0.25);"></div>
              <div style="width: 7px; height: 7px; border-radius: 9999px; background: #22d3ee; border: 1.5px solid #ffffff; box-shadow: 0 0 8px #22d3ee;"></div>
            </div>
          </div>
        `;

        const aimIcon = L.divIcon({
          html: aimHtml,
          className: 'custom-dart-aim-marker',
          iconSize: [120, 54],
          iconAnchor: [60, 38],
        });

        const aimMarker = L.marker([aimLat, aimLng], {
          icon: aimIcon,
          zIndexOffset: isLatest ? 1500 : 800 + idx,
        }).addTo(map);
        aimMarkersRef.current.push(aimMarker);

        // B. 投擲位置から着弾位置への風ドリフト軌跡ライン (全件点線で描画、最新を強調)
        if (hit.lat !== undefined && hit.lng !== undefined && !isNaN(hit.lat) && !isNaN(hit.lng)) {
          const driftLine = L.polyline(
            [
              [aimLat, aimLng],
              [hit.lat, hit.lng],
            ],
            {
              color: isLatest ? '#22d3ee' : '#94a3b8',
              weight: isLatest ? 2.5 : 1.2,
              dashArray: '5, 5',
              opacity: isLatest ? 0.9 : 0.4,
            }
          ).addTo(map);
          driftLinesRef.current.push(driftLine);
        }
      }

      // C. 実際に刺さった着弾位置 (刺さったダーツの矢本体)
      if (hit.lat === undefined || hit.lng === undefined || isNaN(hit.lat) || isNaN(hit.lng)) return;

      let labelContent = hit.hitLandmark
        ? `🎯 ${hit.hitLandmark.name}${hit.score > 0 ? ` +${hit.score}` : ''}`
        : hit.prefecture
        ? `${hit.prefecture.name}${hit.score > 0 ? ` +${hit.score}` : ''}`
        : '外れ';

      const showDistance = difficulty !== 'hard' && !hit.isCorrect && hit.distanceToTargetKm !== undefined;

      if (showDistance) {
        const distStr = hit.distanceToTargetKm! < 1
          ? `${Math.max(10, Math.round(hit.distanceToTargetKm! * 1000))}m`
          : `${hit.distanceToTargetKm!.toFixed(1)}km`;
        labelContent = `🎯 ${hit.nearestLandmarkName || '目標'}まで ${distStr}${hit.targetBearing ? ` (${hit.targetBearing})` : ''}`;
      }

      // バッジのスタイル
      let badgeStyle = 'background: rgba(15, 23, 42, 0.95); color: #e2e8f0; border: 1px solid #475569;';
      if (hit.isCorrect) {
        badgeStyle = 'background: #f59e0b; color: #020617; border: 2px solid #fde68a; box-shadow: 0 0 14px rgba(245, 158, 11, 0.6);';
      } else if (showDistance) {
        badgeStyle = 'background: rgba(8, 47, 73, 0.95); color: #bae6fd; border: 1.5px solid #38bdf8; box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);';
      }

      // リアルな突き刺さったダーツ矢 (SVG)
      const html = `
        <div style="width: 160px; height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: none; user-select: none; opacity: ${isLatest ? '1' : '0.85'};">
          <!-- 上部情報バッジ -->
          <div style="padding: 2px 8px; border-radius: 9999px; font-size: ${isLatest ? '10.5px' : '9.5px'}; font-weight: 900; white-space: nowrap; margin-bottom: 2px; ${badgeStyle}">
            ${!isLatest ? `<span style="opacity: 0.75; margin-right: 3px;">#${idx + 1}</span>` : ''}${labelContent}
          </div>

          <!-- 刺さったダーツ矢本体 (リアルSVG) -->
          <svg width="48" height="52" viewBox="0 0 48 52" style="overflow: visible; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.55));">
            <!-- 地面の着弾影 -->
            <ellipse cx="28" cy="49" rx="12" ry="3.5" fill="rgba(0,0,0,0.4)" />
            <!-- 着弾点ホール -->
            <circle cx="24" cy="49" r="2.5" fill="#020617" stroke="#ffffff" stroke-width="0.8" />
            <circle cx="24" cy="49" r="4.5" fill="none" stroke="${hit.isCorrect ? '#f59e0b' : '#ef4444'}" stroke-width="1.2" opacity="0.85" />

            <!-- ダーツ本体 (針先: 24, 49 から右上へ突き刺さり) -->
            <!-- スチール針 -->
            <line x1="24" y1="49" x2="28" y2="38" stroke="#f1f5f9" stroke-width="2.8" stroke-linecap="round" />
            <!-- バレル (金属ゴールド) -->
            <polygon points="26,39 30,37 34,25 30,27" fill="#fbbf24" stroke="#d97706" stroke-width="0.8" />
            <line x1="28" y1="33" x2="32" y2="31" stroke="#b45309" stroke-width="1" />
            <!-- シャフト -->
            <line x1="32" y1="26" x2="37" y2="15" stroke="#334155" stroke-width="2.2" stroke-linecap="round" />
            <!-- フライト (赤羽フェザー) -->
            <polygon points="36,17 46,4 40,2 32,12" fill="#dc2626" />
            <polygon points="36,17 47,19 45,8 37,14" fill="#ef4444" />
            <polygon points="37,14 40,2 34,5 32,12" fill="#b91c1c" />
            <line x1="37" y1="14" x2="43" y2="5" stroke="#fca5a5" stroke-width="1" opacity="0.8" />
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'custom-dart-hit-marker',
        iconSize: [160, 80],
        iconAnchor: [80, 77],
      });

      const marker = L.marker([hit.lat, hit.lng], {
        icon,
        zIndexOffset: isLatest ? 3000 : 2000 + idx,
      }).addTo(map);
      hitMarkersRef.current.push(marker);
    });
  }, [currentHits, difficulty]);

  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetView = () => mapInstanceRef.current?.flyTo([36.2048, 138.2529], 6);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* Leaflet マップコンテナ */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 右下: ズーム & リセット & タイル切替 */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* タイル切替ポップオーバー */}
        <div className="relative">
          <button
            onClick={() => setShowTileSelector(!showTileSelector)}
            className="glass-panel p-2.5 rounded-xl text-slate-200 hover:text-white hover:border-amber-400/50 transition-all shadow-lg active:scale-95 flex items-center justify-center"
            title="地図レイヤー切り替え (国土地理院 / 航空写真等)"
          >
            <Layers className="w-5 h-5 text-sky-400" />
          </button>

          {showTileSelector && (
            <div className="absolute bottom-full right-0 mb-2 glass-panel p-2 rounded-2xl shadow-2xl border-slate-700 min-w-[160px] flex flex-col gap-1 z-30">
              <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider block">
                地図タイル選択
              </span>
              {(Object.keys(TILES) as GsiTileType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setCurrentTileType(type);
                    setShowTileSelector(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all ${
                    currentTileType === type
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {TILES[type].name}
                </button>
              ))}
            </div>
          )}
        </div>

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
          title="日本全体表示に戻す"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* 左上: 現在のマップ情報バッジ */}
      <div className="absolute top-20 left-4 z-20 pointer-events-none glass-panel px-3 py-1.5 rounded-xl text-xs border-sky-500/30">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-bold">地図:</span>
          <span className="text-sky-300 font-mono font-bold">
            {TILES[currentTileType].name}
          </span>
        </div>
      </div>
    </div>
  );
});

GsiJapanMap.displayName = 'GsiJapanMap';
