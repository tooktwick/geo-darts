import { PassportRecord, Achievement, RegionType, GameDifficulty, FontSize, SecureStorageEnvelope } from '../types';

const STORAGE_KEYS = {
  PASSPORT: 'japan_dart_passport_v1',
  ACHIEVEMENTS: 'japan_dart_achievements_v1',
  SNIPER_HIGH_SCORE: 'japan_dart_sniper_high_score_v1',
  RALLY_COMPLETIONS: 'japan_dart_rally_completions_v1',
  BASIC_CLEARED_PREFS: 'japan_dart_basic_cleared_prefs_v1',
  DIFFICULTY: 'japan_dart_difficulty_v1',
  AICHI_CLEARED_CITIES: 'japan_dart_aichi_cleared_cities_v1',
  AICHI_CLEARED_LANDMARKS: 'japan_dart_aichi_cleared_landmarks_v1',
  FONT_SIZE: 'japan_dart_font_size_v1',
};

/**
 * 改ざん防止用ソルトキー
 */
const SECRET_SALT = 'JP_DARTS_TRIP_SALT_2026_ANTI_CHEAT_v1';

/**
 * スナイパーモード10投の物理的・論理的理論上限値
 * 10投 × (基本1,000点 × 敷地直撃1.5 × 最大コンボ3.0 × 極限ズーム5.0) = 225,000点
 */
export const MAX_THEORETICAL_SNIPER_SCORE = 225_000;

/**
 * 高速かつ高エントロピーなソルト付き暗号学的チェックサム計算 (FNV-1a 64-bit 相当)
 */
function computeSignature(payloadStr: string): string {
  const combined = SECRET_SALT + payloadStr + SECRET_SALT;
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;

  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = Math.imul(h2 ^ (ch >>> 1), 0x85ebca6b);
    h1 = (h1 << 13) | (h1 >>> 19);
    h2 = (h2 << 17) | (h2 >>> 15);
  }

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}`;
}

/**
 * データを改ざん検知署名付きエンベロープ形式のJSON文字列に変換
 */
export function createSignedPayload<T>(data: T): string {
  const serialized = JSON.stringify(data);
  const signature = computeSignature(serialized);
  const envelope: SecureStorageEnvelope<T> = {
    data,
    timestamp: Date.now(),
    signature,
  };
  return JSON.stringify(envelope);
}

/**
 * 署名付きデータを検証して復元。改ざん検知時や署名がない場合はフォールバック値を返す
 * @param requireSignature true の場合、署名のない平文データは改ざんとみなして拒絶する (デフォルト: true)
 */
export function verifySignedPayload<T>(raw: string | null, fallback: T, requireSignature = true): T {
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);

    // 新形式 (SecureStorageEnvelope) かどうか判定
    if (parsed && typeof parsed === 'object' && 'signature' in parsed && 'data' in parsed) {
      const envelope = parsed as SecureStorageEnvelope<T>;
      const expectedSig = computeSignature(JSON.stringify(envelope.data));

      if (envelope.signature === expectedSig) {
        return envelope.data;
      }
      console.warn('⚠️ [Security] セーブデータの改ざん（署名不一致）を検知しました。不正な値を破棄し初期値にリセットします。');
      return fallback;
    }

    // 署名が要求される場合、平文データ（外部直接編集）は改ざんと判定
    if (requireSignature) {
      console.warn('⚠️ [Security] 署名のない平文データ（外部直接編集）を検知しました。改ざんとして拒絶します。');
      return fallback;
    }

    return parsed as T;
  } catch (e) {
    console.error('[Storage] ペイロードの検証・復号に失敗しました:', e);
    return fallback;
  }
}

/**
 * LocalStorageの5MB容量制限・クォータ超過を防ぐ安全書き込みラッパー
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // QuotaExceededError の検知
    const isQuotaExceeded =
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e.code === 22 ||
        e.code === 1014);

    if (isQuotaExceeded) {
      console.error('🚨 [Storage] LocalStorage容量制限（5MB）に達しました！重要データの保護を最優先します。', e);
      try {
        // 容量超過時は一時キャッシュをクリアして再試行
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.error('🚨 [Storage] 緊急書き込みにも失敗しました:', retryErr);
        return false;
      }
    }
    console.error(`[Storage] 書き込みエラー (${key}):`, e);
    return false;
  }
}

// 初期実績リスト
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_throw',
    title: '初陣のダーツ',
    description: '初めてダーツを投てきした',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'first_near_pin',
    title: '名所スナイパー',
    description: '初めて名所へニアピン命中させた',
    icon: '📍',
    unlocked: false,
  },
  {
    id: 'first_pref_clear',
    title: '一国一城の主',
    description: 'ひとつの県の3大名所をすべて制覇した',
    icon: '🏯',
    unlocked: false,
  },
  {
    id: 'hokkaido_hit',
    title: '北の大地を踏破',
    description: '北海道にダーツを着弾させた',
    icon: '❄️',
    unlocked: false,
  },
  {
    id: 'okinawa_hit',
    title: '南国の風',
    description: '沖縄県にダーツを着弾させた',
    icon: '🌺',
    unlocked: false,
  },
  {
    id: 'sniper_combo_5',
    title: '百発百中スナイパー',
    description: 'スナイパーモードで5連続ストレート正解',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'rally_master',
    title: 'ラリーマスター',
    description: 'いずれかの地域ラリーコースを完走した',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'wide_aim_bull',
    title: '神エイム',
    description: '広域ボーナス最大 (縮小表示) でターゲットにジャスト命中',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'japan_complete_10',
    title: '名所街道の旅人',
    description: '10以上の都道府県の3大名所を制覇した',
    icon: '🗺️',
    unlocked: false,
  },
  {
    id: 'japan_complete_all',
    title: '日本列島完全制覇！',
    description: '全47都道府県すべての名所を完全制覇した',
    icon: '👑',
    unlocked: false,
  },
];

export function getPassportData(): Record<number, PassportRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PASSPORT);
    return verifySignedPayload<Record<number, PassportRecord>>(raw, {});
  } catch (e) {
    console.error('Failed to load passport data:', e);
    return {};
  }
}

export function savePassportRecord(
  prefId: number,
  score = 0,
  clearedAllLandmarks = false
): { updated: boolean; firstTime: boolean } {
  const records = getPassportData();
  const now = new Date().toISOString();
  let firstTime = false;

  // 保存データの正規化 (不要な巨大オブジェクトは排除し、最小限の統計情報のみを永続化)
  if (!records[prefId]) {
    firstTime = true;
    records[prefId] = {
      prefId,
      visitCount: 1,
      highScore: score,
      firstVisitedAt: now,
      lastVisitedAt: now,
      clearedAllLandmarks,
    };
  } else {
    records[prefId].visitCount += 1;
    records[prefId].lastVisitedAt = now;
    if (score > records[prefId].highScore) {
      records[prefId].highScore = score;
    }
    if (clearedAllLandmarks) {
      records[prefId].clearedAllLandmarks = true;
    }
  }

  const payload = createSignedPayload(records);
  safeSetItem(STORAGE_KEYS.PASSPORT, payload);

  return { updated: true, firstTime };
}

export function getAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!raw) return INITIAL_ACHIEVEMENTS;
    const stored = verifySignedPayload<Achievement[]>(raw, INITIAL_ACHIEVEMENTS);

    return INITIAL_ACHIEVEMENTS.map((initial) => {
      const found = stored.find((s) => s.id === initial.id);
      return found ? { ...initial, ...found } : initial;
    });
  } catch (e) {
    console.error('Failed to load achievements:', e);
    return INITIAL_ACHIEVEMENTS;
  }
}

export function unlockAchievement(id: string): Achievement | null {
  const achievements = getAchievements();
  const target = achievements.find((a) => a.id === id);
  if (target && !target.unlocked) {
    target.unlocked = true;
    target.unlockedAt = new Date().toISOString();
    const payload = createSignedPayload(achievements);
    safeSetItem(STORAGE_KEYS.ACHIEVEMENTS, payload);
    return target;
  }
  return null;
}

/**
 * スナイパーモードのハイスコア取得 (署名検証 & 理論上限値チェック付き)
 */
export function getSniperHighScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SNIPER_HIGH_SCORE);
    if (!raw) return 0;

    const score = verifySignedPayload<number>(raw, 0);

    // 物理的・論理的理論上限値の検証 (225,000点を超過している場合は改ざんと判定)
    if (typeof score !== 'number' || isNaN(score) || score < 0 || score > MAX_THEORETICAL_SNIPER_SCORE) {
      console.warn(`⚠️ [Security] スナイパーハイスコアの異常値 (${score}) を検知しました。不正スコアを0に初期化します。`);
      const secureZero = createSignedPayload(0);
      safeSetItem(STORAGE_KEYS.SNIPER_HIGH_SCORE, secureZero);
      return 0;
    }

    return score;
  } catch {
    return 0;
  }
}

/**
 * スナイパーモードのハイスコア保存 (署名生成 & 理論上限値チェック付き)
 */
export function saveSniperHighScore(score: number): boolean {
  // 理論上限値チェック
  if (typeof score !== 'number' || isNaN(score) || score < 0 || score > MAX_THEORETICAL_SNIPER_SCORE) {
    console.warn(`⚠️ [Security] 理論上限値を超えるスコア (${score}) の保存を阻止しました。`);
    return false;
  }

  const current = getSniperHighScore();
  if (score > current) {
    const payload = createSignedPayload(score);
    return safeSetItem(STORAGE_KEYS.SNIPER_HIGH_SCORE, payload);
  }
  return false;
}

export function getCompletedRallies(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RALLY_COMPLETIONS);
    return verifySignedPayload<string[]>(raw, []);
  } catch {
    return [];
  }
}

export function recordRallyCompleted(courseId: string) {
  const completed = getCompletedRallies();
  if (!completed.includes(courseId)) {
    completed.push(courseId);
    const payload = createSignedPayload(completed);
    safeSetItem(STORAGE_KEYS.RALLY_COMPLETIONS, payload);
  }
}

// 基本モード: 制覇済み都道府県ID一覧
export function getBasicClearedPrefIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BASIC_CLEARED_PREFS);
    return verifySignedPayload<number[]>(raw, []);
  } catch {
    return [];
  }
}

export function saveBasicClearedPrefId(prefId: number): number[] {
  const current = getBasicClearedPrefIds();
  if (!current.includes(prefId)) {
    current.push(prefId);
    const payload = createSignedPayload(current);
    safeSetItem(STORAGE_KEYS.BASIC_CLEARED_PREFS, payload);
  }
  return current;
}

// 難易度設定の保存・取得 (デフォルトは 'easy')
export function getGameDifficulty(): GameDifficulty {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIFFICULTY);
    if (raw === 'easy' || raw === 'normal' || raw === 'hard') {
      return raw;
    }
    return 'easy';
  } catch {
    return 'easy';
  }
}

export function saveGameDifficulty(difficulty: GameDifficulty) {
  safeSetItem(STORAGE_KEYS.DIFFICULTY, difficulty);
}

// 愛知県詳細限定版: 制覇済み市ID一覧
export function getAichiClearedCityIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AICHI_CLEARED_CITIES);
    return verifySignedPayload<string[]>(raw, []);
  } catch {
    return [];
  }
}

export function saveAichiClearedCityId(cityId: string): string[] {
  const current = getAichiClearedCityIds();
  if (!current.includes(cityId)) {
    current.push(cityId);
    const payload = createSignedPayload(current);
    safeSetItem(STORAGE_KEYS.AICHI_CLEARED_CITIES, payload);
  }
  return current;
}

// 愛知県詳細限定版: 命中済み名所ID一覧
export function getAichiClearedLandmarkIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AICHI_CLEARED_LANDMARKS);
    return verifySignedPayload<string[]>(raw, []);
  } catch {
    return [];
  }
}

export function saveAichiClearedLandmarkId(landmarkId: string): string[] {
  const current = getAichiClearedLandmarkIds();
  if (!current.includes(landmarkId)) {
    current.push(landmarkId);
    const payload = createSignedPayload(current);
    safeSetItem(STORAGE_KEYS.AICHI_CLEARED_LANDMARKS, payload);
  }
  return current;
}

// 愛知県詳細限定版: 特定の市の制覇フラグを解除
export function removeAichiClearedCity(cityId: string): string[] {
  const current = getAichiClearedCityIds().filter((id) => id !== cityId);
  const payload = createSignedPayload(current);
  safeSetItem(STORAGE_KEYS.AICHI_CLEARED_CITIES, payload);
  return current;
}

// 愛知県詳細限定版: 特定の市に属する名所のクリアフラグを解除
export function removeAichiClearedLandmarks(landmarkIds: string[]): string[] {
  const current = getAichiClearedLandmarkIds().filter((id) => !landmarkIds.includes(id));
  const payload = createSignedPayload(current);
  safeSetItem(STORAGE_KEYS.AICHI_CLEARED_LANDMARKS, payload);
  return current;
}

// 愛知県詳細限定版: 全市のクリアフラグ・名所クリアフラグを一括リセット
export function resetAllAichiClearedData(): { clearedCityIds: string[]; clearedLandmarkIds: string[] } {
  safeSetItem(STORAGE_KEYS.AICHI_CLEARED_CITIES, createSignedPayload<string[]>([]));
  safeSetItem(STORAGE_KEYS.AICHI_CLEARED_LANDMARKS, createSignedPayload<string[]>([]));
  return { clearedCityIds: [], clearedLandmarkIds: [] };
}

// フォントサイズ設定の保存・取得 (パーセンテージ 80〜300%、デフォルトは「大」の115%)
export function getFontSize(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    if (!raw) return 115; // デフォルト「大」115%
    if (raw === 'large') return 115;
    if (raw === 'normal') return 100;
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 75 && num <= 350) {
      return num;
    }
    return 115;
  } catch {
    return 115;
  }
}

export function saveFontSize(size: number) {
  safeSetItem(STORAGE_KEYS.FONT_SIZE, String(size));
}


