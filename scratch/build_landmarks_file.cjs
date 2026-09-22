const fs = require('fs');

const hokkaidoTohoku = require('./data_expansion/hokkaido_tohoku.cjs');
const kanto = require('./data_expansion/kanto.cjs');
const chubu = require('./data_expansion/chubu.cjs');
const kinki = require('./data_expansion/kinki.cjs');
const chugokuShikoku = require('./data_expansion/chugoku_shikoku.cjs');
const kyushuOkinawa = require('./data_expansion/kyushu_okinawa.cjs');

const allNewLandmarks = [
  ...hokkaidoTohoku,
  ...kanto,
  ...chubu,
  ...kinki,
  ...chugokuShikoku,
  ...kyushuOkinawa,
];

console.log('Total new landmarks loaded:', allNewLandmarks.length);
if (allNewLandmarks.length !== 470) {
  console.error('ERROR: New landmarks count is not 470! Found:', allNewLandmarks.length);
  process.exit(1);
}

// 既存ファイルを読み込む
const rawContent = fs.readFileSync('src/data/landmarksData.ts', 'utf8');

// 既存名所のパース
// 既存の LANDMARKS 配列部分を抽出
const startIndex = rawContent.indexOf('export const LANDMARKS: Landmark[] = [');
const endIndex = rawContent.indexOf('/**\n * 指定した都道府県の候補名所');

if (startIndex === -1 || endIndex === -1) {
  console.error('ERROR: Could not locate LANDMARKS array boundaries in landmarksData.ts');
  process.exit(1);
}

// 都道府県ごとに分割して処理
// 都道府県番号 1〜47 でグループ分け
const newLandmarksByPref = {};
for (const lm of allNewLandmarks) {
  if (!newLandmarksByPref[lm.prefId]) newLandmarksByPref[lm.prefId] = [];
  newLandmarksByPref[lm.prefId].push(lm);
}

// 47県それぞれ10件あるかチェック
for (let p = 1; p <= 47; p++) {
  const count = newLandmarksByPref[p] ? newLandmarksByPref[p].length : 0;
  if (count !== 10) {
    console.error(`ERROR: Pref ${p} has ${count} new landmarks instead of 10!`);
    process.exit(1);
  }
}

// 既存の LANDMARKS 配列テキストを行ごとに処理し、既存名所に fameLevel を追加
const arrayBody = rawContent.substring(startIndex, endIndex);

// 既存の名所オブジェクトを正規表現で抽出
// { id: '...', name: '...', ... }
const landmarkBlockRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*prefId:\s*(\d+),[\s\S]*?category:\s*'([^']+)',\s*(?:imageUrl:[^}]+)?\}/g;

const existingLandmarksByPref = {};
let match;
while ((match = landmarkBlockRegex.exec(arrayBody)) !== null) {
  const fullBlock = match[0];
  const id = match[1];
  const name = match[2];
  const prefId = Number(match[3]);
  const category = match[4];

  if (!existingLandmarksByPref[prefId]) existingLandmarksByPref[prefId] = [];

  // 既存の10件のうち、先頭5件を national、後半5件を regional に設定
  const indexInPref = existingLandmarksByPref[prefId].length;
  const fameLevel = indexInPref < 5 ? 'national' : 'regional';

  // fullBlock に fameLevel を注入
  let updatedBlock = fullBlock;
  if (!updatedBlock.includes('fameLevel:')) {
    updatedBlock = updatedBlock.replace(
      new RegExp(`category:\\s*'${category}',`),
      `category: '${category}',\n    fameLevel: '${fameLevel}',`
    );
  }

  existingLandmarksByPref[prefId].push({
    id,
    name,
    prefId,
    blockText: updatedBlock,
  });
}

console.log('Existing landmarks parsed for prefectures:', Object.keys(existingLandmarksByPref).length);
for (let p = 1; p <= 47; p++) {
  const count = existingLandmarksByPref[p] ? existingLandmarksByPref[p].length : 0;
  if (count !== 10) {
    console.error(`ERROR: Existing pref ${p} has ${count} landmarks instead of 10!`);
    process.exit(1);
  }
}

// 新しい landmarksData.ts の内容を生成
let output = `import { Landmark, GameDifficulty } from '../types';

/**
 * 日本全国47都道府県の厳選名所マスターデータ (各県20箇所・全国計940箇所)
 * 
 * 各名所には有名度レベル (fameLevel) が設定されています：
 * - national: 全国レベル (誰もが知る超有名名所)
 * - regional: 地域レベル (その地方・県内では定番の名所)
 * - minor: マイナー (知る人ぞ知る穴場・秘境・ディープスポット)
 * 
 * 難易度設定 (GameDifficulty) 連動：
 * - Easy: 全国レベル (national) のみから3箇所選出
 * - Normal: 全国レベル (national) + 地域レベル (regional) から3箇所選出
 * - Hard: 全20箇所 (national + regional + minor) から3箇所選出
 */
export const LANDMARKS: Landmark[] = [
`;

for (let p = 1; p <= 47; p++) {
  output += `  // 都道府県 ${p}\n`;
  // 既存の10件
  for (const ex of existingLandmarksByPref[p]) {
    output += `  ${ex.blockText},\n`;
  }
  // 新規の10件
  for (const nw of newLandmarksByPref[p]) {
    output += `  {\n`;
    output += `    id: '${nw.id}',\n`;
    output += `    name: '${nw.name}',\n`;
    output += `    prefId: ${nw.prefId},\n`;
    output += `    description: '${nw.description}',\n`;
    output += `    coordinates: { lat: ${nw.coordinates.lat}, lng: ${nw.coordinates.lng} },\n`;
    output += `    mapOffset: [${nw.mapOffset[0]}, ${nw.mapOffset[1]}],\n`;
    output += `    category: '${nw.category}',\n`;
    output += `    fameLevel: '${nw.fameLevel}',\n`;
    output += `  },\n`;
  }
  output += `\n`;
}

output += `];

/**
 * 指定した都道府県の候補名所（全20箇所）をすべて取得する
 */
export function getCandidateLandmarksByPrefectureId(prefId: number): Landmark[] {
  return LANDMARKS.filter((lm) => lm.prefId === prefId);
}

/**
 * 難易度設定に応じて候補名所をフィルタリングする
 * - easy: 全国レベル (national) のみ
 * - normal: 全国レベル (national) + 地域レベル (regional)
 * - hard: 全有名度 (national + regional + minor)
 */
export function filterLandmarksByDifficulty(landmarks: Landmark[], difficulty: GameDifficulty = 'easy'): Landmark[] {
  if (difficulty === 'easy') {
    const nationals = landmarks.filter((lm) => lm.fameLevel === 'national');
    // もし全国レベルが3件未満の場合は地域レベルも含めてフォールバック
    return nationals.length >= 3 ? nationals : landmarks.filter((lm) => lm.fameLevel !== 'minor');
  }
  if (difficulty === 'normal') {
    return landmarks.filter((lm) => lm.fameLevel === 'national' || lm.fameLevel === 'regional');
  }
  return landmarks; // hard: すべて
}

/**
 * 指定した都道府県の候補名所（20箇所）の中から、難易度連動で指定個数（デフォルト3箇所）をランダム選出する
 * @param prefId 都道府県ID (1〜47)
 * @param count 選出数 (デフォルト3)
 * @param difficulty 難易度 ('easy' | 'normal' | 'hard')
 */
export function getRandomLandmarksForPrefecture(
  prefId: number,
  count: number = 3,
  difficulty: GameDifficulty = 'easy'
): Landmark[] {
  const allCandidates = getCandidateLandmarksByPrefectureId(prefId);
  const filteredCandidates = filterLandmarksByDifficulty(allCandidates, difficulty);

  const pool = filteredCandidates.length >= count ? filteredCandidates : allCandidates;

  // Fisher-Yates シャッフルで公平にランダム抽出
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * 互換用関数: 指定都道府県のランダムな名所3箇所を取得する
 */
export function getLandmarksByPrefectureId(prefId: number, difficulty: GameDifficulty = 'easy'): Landmark[] {
  return getRandomLandmarksForPrefecture(prefId, 3, difficulty);
}

/**
 * 名所IDからランドマークを取得する
 */
export function getLandmarkById(id: string): Landmark | undefined {
  return LANDMARKS.find((lm) => lm.id === id);
}

/**
 * 全国940名所の中から完全にランダムに1箇所を取得する (スナイパーモード用)
 */
export function getRandomNationalLandmark(): Landmark {
  return LANDMARKS[Math.floor(Math.random() * LANDMARKS.length)];
}
`;

fs.writeFileSync('src/data/landmarksData.ts', output, 'utf8');
console.log('SUCCESS: src/data/landmarksData.ts written with 940 landmarks!');

