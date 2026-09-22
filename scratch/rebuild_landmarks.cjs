const fs = require('fs');
const path = require('path');

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

// 都道府県ごとに新規名所をマップ
const newByPref = {};
for (const lm of allNewLandmarks) {
  if (!newByPref[lm.prefId]) newByPref[lm.prefId] = [];
  newByPref[lm.prefId].push(lm);
}

for (let p = 1; p <= 47; p++) {
  if (!newByPref[p] || newByPref[p].length !== 10) {
    console.error(`ERROR: New landmarks for pref ${p} has count: ${newByPref[p] ? newByPref[p].length : 0}`);
    process.exit(1);
  }
}

// 既存の landmarksData.ts から各県の元祖10件をパース
const content = fs.readFileSync('src/data/landmarksData.ts', 'utf8');

// 都道府県コメントで分割
const sections = content.split(/\/\/\s*都道府県\s*(\d+)/);
// sections[0] はヘッダー
// sections[1] = "1", sections[2] = 都道府県1の中身
// sections[3] = "2", sections[4] = 都道府県2の中身 ...
const originalByPref = {};

for (let i = 1; i < sections.length; i += 2) {
  const prefId = Number(sections[i]);
  const blockText = sections[i + 1];

  // オブジェクトのブロックを抽出
  // { id: '...', ... }
  const itemMatches = [...blockText.matchAll(/\{[\s\S]*?fameLevel:\s*'(?:national|regional|minor)',?\s*\}/g)];
  if (itemMatches.length < 10) {
    console.error(`ERROR: Could not parse at least 10 items for pref ${prefId}, found: ${itemMatches.length}`);
    process.exit(1);
  }

  // 最初の10件が元祖
  const orig10 = itemMatches.slice(0, 10).map(m => m[0].trim());
  originalByPref[prefId] = orig10;
}

console.log('Parsed original landmarks for prefectures:', Object.keys(originalByPref).length);

// 出力を組み立て
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

const allIds = new Set();
const duplicateIds = [];

for (let p = 1; p <= 47; p++) {
  output += `  // 都道府県 ${p}\n`;
  const origList = originalByPref[p];
  const newList = newByPref[p];

  for (const itemStr of origList) {
    // IDをチェック
    const idMatch = itemStr.match(/id:\s*'([^']+)'/);
    if (idMatch) {
      if (allIds.has(idMatch[1])) {
        duplicateIds.push(idMatch[1]);
      }
      allIds.add(idMatch[1]);
    }
    // インデント調整して追加
    const indented = itemStr.split('\n').map(line => '  ' + line).join('\n');
    output += `${indented},\n`;
  }

  for (const nw of newList) {
    if (allIds.has(nw.id)) {
      duplicateIds.push(nw.id);
    }
    allIds.add(nw.id);

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

if (duplicateIds.length > 0) {
  console.error('ERROR: Duplicate IDs detected:', duplicateIds);
  process.exit(1);
}

fs.writeFileSync('src/data/landmarksData.ts', output, 'utf8');
console.log(`SUCCESS: src/data/landmarksData.ts written with ${allIds.size} unique landmarks!`);

