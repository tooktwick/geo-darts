import { Prefecture, Landmark, GameDifficulty } from '../types';

// 地球の半径 (km)
const EARTH_RADIUS_KM = 6371.0;

/**
 * 2つの緯度経度間の球面距離 (Haversineの公式) を計算 (km)
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * 日本の緯度経度範囲の定義
 */
export const GEO_BOUNDS = {
  minLat: 24.0,
  maxLat: 46.0,
  minLng: 122.5,
  maxLng: 146.5,
};

/**
 * 緯度経度を正規化マップ座標 (0〜1000, 0〜1000) に投影
 */
export function projectGeoToMap(lat: number, lng: number, width = 1000, height = 1000): { x: number; y: number } {
  const normX = (lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng);
  const normY = (GEO_BOUNDS.maxLat - lat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat);

  return {
    x: normX * width,
    y: normY * height,
  };
}

/**
 * マップ座標から緯度経度に逆変換
 */
export function unprojectMapToGeo(x: number, y: number, width = 1000, height = 1000): { lat: number; lng: number } {
  const normX = Math.max(0, Math.min(1, x / width));
  const normY = Math.max(0, Math.min(1, y / height));

  const lng = GEO_BOUNDS.minLng + normX * (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng);
  const lat = GEO_BOUNDS.maxLat - normY * (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat);

  return { lat, lng };
}

/**
 * 指定した座標 (lat, lng) に最も近い都道府県を検索
 */
export function findNearestPrefecture(
  lat: number,
  lng: number,
  prefectures: Prefecture[]
): { prefecture: Prefecture; distanceKm: number } | null {
  if (!prefectures || prefectures.length === 0) return null;

  let nearestPref = prefectures[0];
  let minDistance = Infinity;

  for (const pref of prefectures) {
    const dist = calculateHaversineDistance(
      lat,
      lng,
      pref.coordinates.lat,
      pref.coordinates.lng
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearestPref = pref;
    }
  }

  return {
    prefecture: nearestPref,
    distanceKm: minDistance,
  };
}

/**
 * スタイライズドマップ上での名所ターゲット座標 [x, y] を取得
 */
export function getLandmarkSvgPosition(pref: Prefecture, landmark: Landmark): [number, number] {
  const center = pref.mapCenter || [500, 500];
  const offset = landmark.mapOffset || [0, 0];
  return [center[0] + offset[0], center[1] + offset[1]];
}

/**
 * 難易度およびゲームモードに応じたニアピン許容距離 (km)
 * 全国モード:
 *  - easy: 20km, normal: 10km, hard: 5km
 * 愛知県詳細限定版 (市街地スケール):
 *  - easy: 10km, normal: 5km (ユーザー指定), hard: 2.5km
 */
export function getNearPinThresholdKm(difficulty: GameDifficulty, isAichiDetail = false): number {
  if (isAichiDetail) {
    switch (difficulty) {
      case 'hard':
        return 2.5;
      case 'normal':
        return 5.0; // 愛知モード: normal 5kmから
      case 'easy':
      default:
        return 10.0;
    }
  }

  switch (difficulty) {
    case 'hard':
      return 5;
    case 'normal':
      return 10;
    case 'easy':
    default:
      return 20;
  }
}

/**
 * 難易度に応じたピンポイント直撃 (Bull) 許容距離 (km)
 */
export function getPinpointThresholdKm(difficulty: GameDifficulty, isAichiDetail = false): number {
  if (isAichiDetail) {
    switch (difficulty) {
      case 'hard':
        return 0.5;
      case 'normal':
        return 1.0;
      case 'easy':
      default:
        return 1.5;
    }
  }

  switch (difficulty) {
    case 'hard':
      return 1.0;
    case 'normal':
      return 2.0;
    case 'easy':
    default:
      return 3.0;
  }
}

/**
 * 名所ニアピン判定 (リアル地理マップ用: 緯度経度ベース)
 */
export function checkNearPinReal(
  hitLat: number,
  hitLng: number,
  landmarks: Landmark[],
  clearedIds: string[],
  difficulty: GameDifficulty = 'normal',
  bonusThresholdKm: number = 0,
  pinpointMultiplier: number = 1.0,
  isAichiDetail = false
): { landmark: Landmark; distanceKm: number; isPinpoint: boolean } | null {
  let nearest: Landmark | null = null;
  let minDistance = Infinity;

  for (const lm of landmarks) {
    if (clearedIds.includes(lm.id)) continue;

    const dist = calculateHaversineDistance(
      hitLat,
      hitLng,
      lm.coordinates.lat,
      lm.coordinates.lng
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearest = lm;
    }
  }

  const thresholdKm = getNearPinThresholdKm(difficulty, isAichiDetail) + bonusThresholdKm;
  const pinpointThresholdKm = getPinpointThresholdKm(difficulty, isAichiDetail) * pinpointMultiplier;

  // 難易度および加護ボーナスごとの閾値以内ならニアピン判定
  if (nearest && minDistance <= thresholdKm) {
    return {
      landmark: nearest,
      distanceKm: Math.round(minDistance * 10) / 10,
      isPinpoint: minDistance <= pinpointThresholdKm,
    };
  }

  return null;
}

/**
 * 名所ニアピン判定 (スタイライズドSVGマップ用: SVG座標ベース)
 * ニアピン基準: 50px以内ならヒット
 */
export function checkNearPinSvg(
  svgX: number,
  svgY: number,
  pref: Prefecture,
  landmarks: Landmark[],
  clearedIds: string[]
): { landmark: Landmark; distancePx: number } | null {
  let nearest: Landmark | null = null;
  let minDistance = Infinity;

  for (const lm of landmarks) {
    if (clearedIds.includes(lm.id)) continue;

    const [lmX, lmY] = getLandmarkSvgPosition(pref, lm);
    const dist = Math.hypot(svgX - lmX, svgY - lmY);

    if (dist < minDistance) {
      minDistance = dist;
      nearest = lm;
    }
  }

  // 50px以内ならニアピンクリア
  if (nearest && minDistance <= 50) {
    return { landmark: nearest, distancePx: Math.round(minDistance) };
  }

  return null;
}

/**
 * 2地点間の方位角（度: 0〜360）と8方位文字列を計算
 */
export function calculateBearing(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): { angleDeg: number; direction: string } {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const y = Math.sin(toRad(toLng - fromLng)) * Math.cos(toRad(toLat));
  const x =
    Math.cos(toRad(fromLat)) * Math.sin(toRad(toLat)) -
    Math.sin(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.cos(toRad(toLng - fromLng));

  let angle = toDeg(Math.atan2(y, x));
  angle = (angle + 360) % 360;

  const directions = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
  const index = Math.round(angle / 45) % 8;

  return {
    angleDeg: Math.round(angle),
    direction: directions[index],
  };
}

/**
 * 距離数値を人間が見やすい文字列 (kmまたはm) にフォーマット
 */
export function formatDistanceString(distanceKm: number): string {
  if (distanceKm < 1.0) {
    const meters = Math.max(10, Math.round(distanceKm * 1000));
    return `${meters}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * 着弾点から未クリア名所への最短距離・方角情報を算出
 */
export function getNearestLandmarkInfo(
  hitLat: number,
  hitLng: number,
  landmarks: Landmark[],
  clearedIds: string[]
): { landmark: Landmark; distanceKm: number; distanceText: string; direction: string } | null {
  const activeLandmarks = landmarks.filter((lm) => !clearedIds.includes(lm.id));
  if (activeLandmarks.length === 0) return null;

  let nearest = activeLandmarks[0];
  let minKm = calculateHaversineDistance(hitLat, hitLng, nearest.coordinates.lat, nearest.coordinates.lng);

  for (let i = 1; i < activeLandmarks.length; i++) {
    const lm = activeLandmarks[i];
    const km = calculateHaversineDistance(hitLat, hitLng, lm.coordinates.lat, lm.coordinates.lng);
    if (km < minKm) {
      minKm = km;
      nearest = lm;
    }
  }

  const { direction } = calculateBearing(hitLat, hitLng, nearest.coordinates.lat, nearest.coordinates.lng);

  return {
    landmark: nearest,
    distanceKm: Number(minKm.toFixed(2)),
    distanceText: formatDistanceString(minKm),
    direction,
  };
}

