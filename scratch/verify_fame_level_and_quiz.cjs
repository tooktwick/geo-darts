const fs = require('fs');
const assert = require('assert');

console.log('=== [1] 名所マスターデータ (landmarksData) の検証 ===');
const lmContent = fs.readFileSync('src/data/landmarksData.ts', 'utf8');

// 名所ID抽出
const idMatches = [...lmContent.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
console.log('総名所数:', idMatches.length);
assert.strictEqual(idMatches.length, 940, '名所総数が940件であること');

// ID一意性チェック
const idSet = new Set(idMatches);
assert.strictEqual(idSet.size, 940, '名所IDに重複がないこと');
console.log('ID重複: 0件 (完全一意)');

// 都道府県別の件数チェック (1〜47)
const prefIdMatches = [...lmContent.matchAll(/prefId:\s*(\d+)/g)].map(m => Number(m[1]));
const prefCounts = {};
for (const pid of prefIdMatches) {
  prefCounts[pid] = (prefCounts[pid] || 0) + 1;
}
for (let p = 1; p <= 47; p++) {
  assert.strictEqual(prefCounts[p], 20, `都道府県 ${p} の名所数が20件であること`);
}
console.log('全47都道府県: 各県厳密に20箇所登録確認');

// 有名度 (fameLevel) の付与チェック
const fameLevelMatches = [...lmContent.matchAll(/fameLevel:\s*'(national|regional|minor)'/g)].map(m => m[1]);
assert.strictEqual(fameLevelMatches.length, 940, '全940件にfameLevelが設定されていること');

const fameCounts = { national: 0, regional: 0, minor: 0 };
for (const fl of fameLevelMatches) {
  fameCounts[fl]++;
}
console.log('有名度内訳:', fameCounts);
assert(fameCounts.national > 300, 'nationalが十分な数あること');
assert(fameCounts.regional > 300, 'regionalが十分な数あること');
assert(fameCounts.minor > 50, 'minorが十分な数あること');

console.log('=== [2] ご当地推理クイズデータ (quizData) の検証 ===');
const quizContent = fs.readFileSync('src/data/quizData.ts', 'utf8');

// クイズ問題ID抽出
const qIdMatches = [...quizContent.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
console.log('クイズ総問題数:', qIdMatches.length);
assert(qIdMatches.length >= 70, 'クイズ問題数が70問以上であること');
const qIdSet = new Set(qIdMatches);
assert.strictEqual(qIdSet.size, qIdMatches.length, 'クイズIDに重複がないこと');
console.log('クイズID重複: 0件 (完全一意)');

// クイズの都道府県カバーチェック
const qPrefMatches = [...quizContent.matchAll(/prefId:\s*(\d+)/g)].map(m => Number(m[1]));
const qPrefSet = new Set(qPrefMatches);
console.log('クイズ出題対象都道府県数:', qPrefSet.size);
assert.strictEqual(qPrefSet.size, 47, '全47都道府県すべてが1問以上網羅されていること');

// クイズ対象名所IDの実在性チェック
const qLandmarkMatches = [...quizContent.matchAll(/landmarkId:\s*'([^']+)'/g)].map(m => m[1]);
for (const lmId of qLandmarkMatches) {
  assert(idSet.has(lmId), `クイズ対象名所ID "${lmId}" がlandmarksDataに実在すること`);
}
console.log('クイズ対象名所の実在性: 全問合致');

console.log('\n>>> すべてのデータモデル検証に合格しました！ <<<');

