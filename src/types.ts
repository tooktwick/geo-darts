// 言語型 (日本語 / 英語)
export type Language = 'ja' | 'en';

// 地域区分型
export type RegionType = 
  | 'hokkaido' 
  | 'tohoku' 
  | 'kanto' 
  | 'chubu' 
  | 'kinki' 
  | 'chugoku' 
  | 'shikoku' 
  | 'kyushu';

// 都道府県マスター型
export interface Prefecture {
  id: number;              // 1〜47
  name: string;            // 例: "東京都"
  englishName: string;     // 例: "Tokyo"
  region: RegionType;      // "kanto" 等
  capital: string;         // 県庁所在地
  population: string;      // 人口表示文字列
  areaKm2: number;         // 面積 (km²)
  specialties: string[];   // 特産品
  trivia: string;          // 豆知識
  coordinates: {
    lat: number;           // 緯度
    lng: number;           // 経度
  };
  svgPath?: string;        // SVGパスデータ
  mapCenter?: [number, number]; // スタイライズドマップ上の中心座標 [x, y]
  color?: string;          // 地域テーマ色
}

// 名所の8大種類（カテゴリー）型
export type LandmarkCategory = 
  | 'castle'         // 🏯 城郭・名城 (天守・城跡・武家屋敷)
  | 'shrine_temple'  // ⛩️ 寺社仏閣 (神社・寺院・大仏・霊場)
  | 'nature'         // 🗻 自然・絶景 (山岳・渓谷・湖沼・海岸・滝)
  | 'hotspring'      // ♨️ 名湯・温泉 (温泉街・湯畑・露天風呂)
  | 'gourmet'        // 🍜 美味・食文化 (郷土料理・市場・名物)
  | 'heritage'       // 📜 歴史・世界遺産 (史跡・集落・近代化遺産)
  | 'modern_spot'    // 🗼 近代名所・タワー (タワー・展望台・橋梁・施設)
  | 'garden'         // 🌸 名園・景勝地 (日本庭園・花畑・名勝公園)
  | 'culture'        // 🎭 文化・伝統 (旧互換)
  | 'spot';          // 📍 観光名所 (旧互換)

// 名所命中時に発動する「旅の加護（属性ボーナス）」
export interface LandmarkBlessing {
  type: LandmarkCategory;
  title: string;       // 加護名称 (例: "城郭の加護【鉄壁】")
  description: string; // 効果説明 (例: "次の1投は風の影響が50%軽減されます")
  icon: string;        // アイコン
  appliedAt: number;   // 発動時刻
  durationThrows: number; // 有効投数 (通常1投)
}

// 名所の有名度・認知度3段階レベル型
// national: 全国レベル (誰もが知る超有名名所)
// regional: 地域レベル (その地方・県内では定番の名所)
// minor: マイナー (知る人ぞ知る穴場・秘境・ディープスポット)
export type LandmarkFameLevel = 'national' | 'regional' | 'minor';

// ランドマークデータ型 (名所)
export interface Landmark {
  id: string;
  name: string;
  englishName?: string;
  prefId: number;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapOffset?: [number, number];
  category: LandmarkCategory;
  imageUrl?: string;
  fameLevel?: LandmarkFameLevel; // 有名度: 'national' | 'regional' | 'minor'
  localGourmet?: string;         // 名物グルメ・郷土の味 (例: "函館塩ラーメン・活イカ刺し")
  episode?: string;              // 歴史エピソード・深掘り豆知識 (例: "榎本武揚と土方歳三が最後の砦とした星形要塞")
}

// ダーツ着弾データ型
export interface DartHit {
  id: string;
  x: number;              // マップ内ローカルX / lng
  y: number;              // マップ内ローカルY / lat
  screenX: number;        // スクリーン表示X
  screenY: number;        // スクリーン表示Y
  lat?: number;           // 緯度
  lng?: number;           // 経度
  prefecture: Prefecture | null;
  targetPrefecture?: Prefecture | null;
  hitLandmark?: Landmark | null; // ニアピン命中した名所
  timestamp: number;
  score: number;
  isCorrect?: boolean;
  distanceKm?: number;    // ターゲット中心または着弾からの距離(km)
  combo?: number;         // この投てき時のコンボ
  zoomMultiplier?: number;// この投てき時の広域ボーナス倍率
  isBull?: boolean;       // 中心直撃フラグ
  isNearPin?: boolean;    // 名所ニアピンフラグ
  isPinpointBull?: boolean; // 高ズーム敷地ピンポイント直撃フラグ
  isOb?: boolean;         // 高ズーム時の目標枠外 (OB) フラグ
  zoomLevel?: number;     // 投てき時のズームレベル
  distanceToTargetKm?: number; // 目標名所までの直線距離(km)
  targetBearing?: string;      // 目標名所への方角 ('北東', '南西' 等)
  nearestLandmarkName?: string;// 最寄り目標名所名
  aimLat?: number;             // プレイヤーが狙って投げた緯度 (投擲位置)
  aimLng?: number;             // プレイヤーが狙って投げた経度 (投擲位置)
  aimScreenX?: number;         // 狙って投げたスクリーンX
  aimScreenY?: number;         // 狙って投げたスクリーンY
}

// 難易度設定型
// easy: 目標表示ON
// normal: 目標表示OFF・投てき後距離表示
// hard: 目標表示OFF・距離なし
export type GameDifficulty = 'easy' | 'normal' | 'hard';

// フォントサイズ設定型 (パーセンテージ 80〜160、または旧キーワード)
export type FontSize = 'normal' | 'large' | number;

// ズーム連動リスク＆リターン情報型
export interface ZoomRiskInfo {
  zoomLevel: number;
  multiplier: number;       // 得点倍率 (1.0x 〜 5.0x)
  tierName: string;         // '日本全図' | '地方広域' | '都市市街' | '市区町村・敷地'
  riskTitle: string;        // '安全 (低素点)' | '低リスク' | '中リスク' | '即OB注意!' | '超極限 (即OB!)'
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'extreme';
  driftFactor: number;      // 画面上での風のピクセル変位係数
  nearPinRadiusPx: number;  // ニアピン判定ピクセル半径
  pinpointRadiusPx: number; // ピンポイント直撃ピクセル半径
  colorClass: string;       // バッジ用カラー
}

// ゲームモード: 'basic' (名所ニアピン巡り), 'sniper' (全国ランダム狙い), 'rally' (指定ルート走破), 'free' (自由探索), 'aichi_detail' (愛知県詳細限定版: 市別名所巡り), 'quiz' (ご当地クイズ推理モード)
export type GameMode = 'basic' | 'free' | 'sniper' | 'rally' | 'aichi_detail' | 'quiz';

// マップエンジンタイプ
export type MapType = 'gsi' | 'stylized';

// 国土地理院タイル種別
export type GsiTileType = 'pale' | 'std' | 'photo' | 'osm';

// 風向きと風速
export type WindDirection = '北' | '北東' | '東' | '南東' | '南' | '南西' | '西' | '北西';

export interface WindState {
  speed: number;          // 0〜12 m/s
  direction: WindDirection;
  angleDeg: number;       // 0〜360度 (北: 0, 東: 90...)
  dx: number;             // X方向の風ベクトル
  dy: number;             // Y方向の風ベクトル
}

// 都道府県訪問記録 (パスポート)
export interface PassportRecord {
  prefId: number;
  visitCount: number;
  highScore: number;
  firstVisitedAt: string;
  lastVisitedAt: string;
  clearedAllLandmarks?: boolean; // 3大名所制覇フラグ
}

// 実績バッジ
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

// ラリーコース定義
export interface RallyCourse {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  icon: string;
  color: string;
  checkpoints: string[];  // 名所ID (Landmark.id) の配列
  difficulty: '初級' | '中級' | '上級';
}

// 新「基本モード (名所ニアピン巡り)」進行状態
export interface BasicTourState {
  currentPref: Prefecture | null;
  landmarks: Landmark[];           // 現在の県の3大名所
  clearedLandmarkIds: string[];    // 現在の県でクリア済みの名所ID一覧
  clearedPrefIds: number[];        // 全3名所を完全制覇した都道府県ID一覧
  totalClearedCount: number;       // 制覇した都道府県数 (0〜47)
  justClearedLandmark: Landmark | null; // 直前にニアピンクリアした名所
  attemptsForCurrentPref: number;  // 現在の県での投てき回数
}

// スナイパーモード進行状態 (全国470名所からランダムに1箇所を狙う)
export interface SniperGameState {
  currentTarget: Landmark | null;       // 全国から選ばれた目標名所
  currentTargetPref: Prefecture | null; // 目標名所が所在する都道府県
  remainingThrows: number;
  totalThrows: number;
  score: number;
  combo: number;
  maxCombo: number;
  correctHits: number;
  history: DartHit[];
  isFinished: boolean;
  timeStarted: number;
}

// ラリーモード進行状態
export interface RallyGameState {
  currentCourse: RallyCourse | null;
  currentStepIndex: number;
  totalAttempts: number;
  score: number;
  completed: boolean;
  history: DartHit[];
  startedAt: number;
}

// 改ざん検知セキュアストレージエンベロープ型
export interface SecureStorageEnvelope<T> {
  data: T;
  timestamp: number;
  signature: string;
}

// 愛知県の4大地域区分 (尾張・知多・西三河・東三河)
export type AichiRegion = 'owari' | 'chita' | 'nishimikawa' | 'higashimikawa';

// 愛知県の市マスター型
export interface AichiCity {
  id: string;              // 市の一意ID (例: "nagoya", "okazaki", "toyota")
  name: string;            // 市名 (例: "名古屋市")
  reading: string;         // ふりがな (例: "なごやし")
  region: AichiRegion;     // 地域区分
  coordinates: {
    lat: number;           // 市中心の緯度
    lng: number;           // 市中心の経度
  };
  zoomLevel: number;       // 推奨ズームレベル (通常 11〜13)
  description: string;     // 市の特徴・魅力
  landmarks: Landmark[];   // 市ごとの3つの名所！
}

// 愛知県詳細限定版のゲーム状態
export interface AichiDetailState {
  currentCity: AichiCity;
  clearedLandmarkIdsForCity: string[]; // 現在の市で命中した名所IDリスト (最大3つ)
  clearedCityIds: string[];            // 完全制覇した市IDリスト
  totalClearedCitiesCount: number;     // 完全制覇市数
  attemptsForCurrentCity: number;      // 現在の市での投擲数
  justClearedLandmark: Landmark | null;// 直前に命中した名所
}

// ご当地クイズ推理モード問題データ型
export interface GeoQuizQuestion {
  id: string;               // 問題一意ID (例: "quiz_kinkakuji")
  landmarkId: string;       // 正解となる名所ID (Landmark.id)
  prefId: number;           // 所在都道府県ID (1〜47)
  category: LandmarkCategory; // ジャンル
  title: string;            // 問題の見出し (例: "金箔に輝く北山文化の至宝")
  prompt: string;           // クイズの導入・問題文
  hints: [string, string, string]; // 3段階ヒント [ヒント1 (難: 3.0x), ヒント2 (中: 2.0x), ヒント3 (易: 1.2x)]
  explanation: string;      // 正解発表時の解説・歴史エピソード
}

// クイズの1問ごとの回答結果
export interface QuizQuestionResult {
  question: GeoQuizQuestion;
  targetLandmark: Landmark;
  isCorrect: boolean;
  distanceKm: number;
  pointsAwarded: number;
  unlockedHintLevel: number;
  hintMultiplier: number;
  zoomMultiplier: number;
  judgment: 'bull' | 'hit' | 'near_miss' | 'miss'; // 直撃 / 正解 / ニアミス / 外れ
  feedbackMessage: string;
}

// ご当地クイズ推理モード進行状態
export interface QuizGameState {
  questions: GeoQuizQuestion[]; // 今回の5問
  currentIndex: number;         // 現在の問題番号 (0〜4)
  unlockedHintLevel: number;    // 現在解放しているヒントレベル (1, 2, 3)
  score: number;                // 累計スコア
  correctCount: number;         // 正解数 (0〜5)
  results: QuizQuestionResult[]; // 各問の結果履歴
  isFinished: boolean;          // 5問終了フラグ
  lastResult: QuizQuestionResult | null; // 直前の投擲結果モーダル表示用
  startedAt: number;            // 開始時刻
}



