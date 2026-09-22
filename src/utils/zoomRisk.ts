import { ZoomRiskInfo } from '../types';

/**
 * ズームレベル（Leafletの5〜16、またはSVGスケール）から
 * 難易度・得点倍率・風のピクセル変位係数・OBリスク情報を算出する
 */
export function getZoomRiskInfo(zoom: number, isSvg = false): ZoomRiskInfo {
  // SVGモードの場合は 1.0〜3.0 を 6〜14 相当に正規化換算
  const effectiveZoom = isSvg
    ? 6 + (zoom - 1.0) * 4.0
    : zoom;

  if (effectiveZoom <= 6.5) {
    return {
      zoomLevel: Number(effectiveZoom.toFixed(1)),
      multiplier: 1.0,
      tierName: '日本全図 (広域)',
      riskTitle: '安全 (低素点 1.0x)',
      riskLevel: 'safe',
      driftFactor: 0.8,
      nearPinRadiusPx: 60,
      pinpointRadiusPx: 20,
      colorClass: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/50',
    };
  }

  if (effectiveZoom <= 8.5) {
    return {
      zoomLevel: Number(effectiveZoom.toFixed(1)),
      multiplier: 1.8,
      tierName: '地方広域',
      riskTitle: '低リスク (倍率 1.8x)',
      riskLevel: 'low',
      driftFactor: 2.0,
      nearPinRadiusPx: 52,
      pinpointRadiusPx: 22,
      colorClass: 'border-teal-500/40 text-teal-300 bg-teal-950/50',
    };
  }

  if (effectiveZoom <= 11.5) {
    return {
      zoomLevel: Number(effectiveZoom.toFixed(1)),
      multiplier: 2.8,
      tierName: '都市市街',
      riskTitle: '中難度・風変位注意 (倍率 2.8x)',
      riskLevel: 'medium',
      driftFactor: 4.2,
      nearPinRadiusPx: 45,
      pinpointRadiusPx: 24,
      colorClass: 'border-amber-500/60 text-amber-300 bg-amber-950/50',
    };
  }

  if (effectiveZoom <= 14.2) {
    return {
      zoomLevel: Number(effectiveZoom.toFixed(1)),
      multiplier: 4.0,
      tierName: '市区町村・駅前',
      riskTitle: '高倍率・即OB危険! (倍率 4.0x)',
      riskLevel: 'high',
      driftFactor: 7.2,
      nearPinRadiusPx: 40,
      pinpointRadiusPx: 25,
      colorClass: 'border-orange-500/70 text-orange-300 bg-orange-950/60',
    };
  }

  // Zoom 14.3以上: 敷地ピンポイント（サーキット場、神社境内、駅前広場など）
  return {
    zoomLevel: Number(effectiveZoom.toFixed(1)),
    multiplier: 5.0,
    tierName: '敷地ピンポイント',
    riskTitle: '超高倍率・極限OBリスク! (倍率 5.0x)',
    riskLevel: 'extreme',
    driftFactor: 11.0,
    nearPinRadiusPx: 36,
    pinpointRadiusPx: 25,
    colorClass: 'border-red-500/90 text-red-300 bg-red-950/70 ring-1 ring-red-400 animate-pulse',
  };
}
