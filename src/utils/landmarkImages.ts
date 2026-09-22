import { Landmark, LandmarkCategory } from '../types';

export interface CategoryInfo {
  id: LandmarkCategory;
  name: string;        // 種類和名
  icon: string;        // アイコン絵文字 (フォールバック)
  iconPath: string;    // オリジナルSVG画像アイコンパス
  badgeColor: string;  // バッジCSSクラス
  imagePath: string;   // ローカル配備画像パス
  blessingName: string;// 旅の加護名称
  blessingDesc: string;// 旅の加護効果
}

/**
 * 名所の8大種類マスター設定
 */
export const CATEGORY_CONFIG: Record<LandmarkCategory, CategoryInfo> = {
  castle: {
    id: 'castle',
    name: '城郭・名城',
    icon: '🏯',
    iconPath: '/assets/icons/cat_castle.svg',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    imagePath: '/assets/categories/category_castle.jpg',
    blessingName: '城郭の加護【鉄壁】',
    blessingDesc: '次の1投は風のドリフト変位が50%カットされます',
  },
  shrine_temple: {
    id: 'shrine_temple',
    name: '寺社仏閣',
    icon: '⛩️',
    iconPath: '/assets/icons/cat_shrine_temple.svg',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    imagePath: '/assets/categories/category_shrine_temple.jpg',
    blessingName: '神仏の加護【大願】',
    blessingDesc: '次の1投はニアピン判定が+5km拡大されます',
  },
  nature: {
    id: 'nature',
    name: '自然・絶景',
    icon: '🗻',
    iconPath: '/assets/icons/cat_nature.svg',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    imagePath: '/assets/categories/category_nature.jpg',
    blessingName: '山河の加護【雄大】',
    blessingDesc: '次の1投はズーム倍率が+0.5xボーナスされます',
  },
  hotspring: {
    id: 'hotspring',
    name: '名湯・温泉',
    icon: '♨️',
    iconPath: '/assets/icons/cat_hotspring.svg',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    imagePath: '/assets/categories/category_hotspring.jpg',
    blessingName: '温泉の加護【湯治】',
    blessingDesc: '風向きが穏やかになり、投てきのブレが抑制されます',
  },
  gourmet: {
    id: 'gourmet',
    name: '美味・食文化',
    icon: '🍜',
    iconPath: '/assets/icons/cat_gourmet.svg',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    imagePath: '/assets/categories/category_gourmet.jpg',
    blessingName: '名物の加護【活力】',
    blessingDesc: '次の1投の命中獲得スコアが1.5倍にブーストされます',
  },
  heritage: {
    id: 'heritage',
    name: '歴史・世界遺産',
    icon: '📜',
    iconPath: '/assets/icons/cat_heritage.svg',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    imagePath: '/assets/categories/category_heritage.jpg',
    blessingName: '悠久の加護【伝承】',
    blessingDesc: 'ピンポイント直撃ボーナスがさらに強化されます',
  },
  modern_spot: {
    id: 'modern_spot',
    name: '近代名所・展望',
    icon: '🗼',
    iconPath: '/assets/icons/cat_modern_spot.svg',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    imagePath: '/assets/categories/category_modern_spot.jpg',
    blessingName: '摩天楼の加護【眺望】',
    blessingDesc: '目標への距離と方角のフィードバックが精密化されます',
  },
  garden: {
    id: 'garden',
    name: '名園・景勝地',
    icon: '🌸',
    iconPath: '/assets/icons/cat_garden.svg',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    imagePath: '/assets/categories/category_garden.jpg',
    blessingName: '名園の加護【清雅】',
    blessingDesc: '連続コンボが途切れにくくなります',
  },
  culture: {
    id: 'culture',
    name: '伝統・文化',
    icon: '🎭',
    iconPath: '/assets/icons/cat_culture.svg',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    imagePath: '/assets/categories/category_heritage.jpg',
    blessingName: '文化の加護',
    blessingDesc: '伝統の技で狙いが安定します',
  },
  spot: {
    id: 'spot',
    name: '観光名所',
    icon: '📍',
    iconPath: '/assets/icons/cat_spot.svg',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    imagePath: '/assets/categories/category_modern_spot.jpg',
    blessingName: '名所の加護',
    blessingDesc: '旅の知見が得点に加算されます',
  },
};

/**
 * 実在の名所IDに紐づいた美麗なオープン画像URLマッピング (全国主要名所)
 */
const LANDMARK_SPECIFIC_IMAGES: Record<string, string> = {
  tokyo_tower: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80',
  hokkaido_goryokaku: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80',
  hokkaido_otaru: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  hokkaido_bluepond: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
  miyagi_matsushima: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
  tochigi_nikko: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80',
  gunma_kusatsu: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  saitama_kawagoe: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  tokyo_sensoji: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
  kanagawa_kamakura: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  kanagawa_hakone_shrine: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80',
  ishikawa_kenrokuen: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  yamanashi_kawaguchiko: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80',
  nagano_matsumoto_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  gifu_shirakawago: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
  shizuoka_miho: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80',
  aichi_nagoya_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  mie_ise: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80',
  kyoto_kinkakuji: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  kyoto_kiyomizudera: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  kyoto_fushimi: 'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80',
  osaka_castle: 'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80',
  osaka_dotonbori: 'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80',
  hyogo_himejijo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  nara_todaiji: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80',
  tottori_sakyu: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  shimane_izumo: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80',
  okayama_kurashiki: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  hiroshima_itsukushima: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
  hiroshima_atomic_dome: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  yamaguchi_tsunoshima: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  kagawa_kotohira: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80',
  ehime_dogo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  kochi_katsurahama: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
  fukuoka_dazaifu: 'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80',
  kumamoto_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  kagoshima_sakurajima: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80',
  ibaraki_aquaworld: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  ibaraki_hitachi_seaside: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80',
  okinawa_shurijo: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
  okinawa_churaumi: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
};

/**
 * 名所に対応する最適な画像URLを取得する関数
 * 1. 個別指定があればそれを返却
 * 2. 種類ごとに作成されたローカル高品質画像を返却 (完全オフライン対応・即時表示)
 */
export const getLandmarkImageUrl = (landmark: Landmark): string => {
  if (landmark.imageUrl) {
    return landmark.imageUrl;
  }
  if (LANDMARK_SPECIFIC_IMAGES[landmark.id]) {
    return LANDMARK_SPECIFIC_IMAGES[landmark.id];
  }
  const config = CATEGORY_CONFIG[landmark.category] || CATEGORY_CONFIG.spot;
  return config.imagePath;
};

/**
 * 名所の種類情報を取得
 */
export const getCategoryInfo = (category: LandmarkCategory): CategoryInfo => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.spot;
};
