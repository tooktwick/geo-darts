const fs = require('fs');

const content = fs.readFileSync('src/data/landmarksData.ts', 'utf8');

// landmarksData内の全要素をパース
const entries = [];
const regex = /id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*prefId:\s*(\d+),[\s\S]*?category:\s*'([^']+)',\s*fameLevel:\s*'([^']+)'/g;
let match;
while ((match = regex.exec(content)) !== null) {
  entries.push({
    id: match[1],
    name: match[2],
    prefId: parseInt(match[3], 10),
    category: match[4],
    fameLevel: match[5],
  });
}

console.log('Total parsed landmarks:', entries.length);
if (entries.length !== 940) {
  console.error(`Error: Expected 940 landmarks, but parsed ${entries.length}`);
  process.exit(1);
}

console.log('\n=== 1. 都道府県別 名所名の一意性検証 (同一県内重複ゼロ) ===');
const prefMap = {};
for (const lm of entries) {
  if (!prefMap[lm.prefId]) prefMap[lm.prefId] = [];
  prefMap[lm.prefId].push(lm);
}

let duplicateNamesCount = 0;
for (let pId = 1; pId <= 47; pId++) {
  const list = prefMap[pId] || [];
  if (list.length !== 20) {
    console.error(`Prefecture ${pId} has ${list.length} landmarks (expected 20)`);
  }
  const seen = new Set();
  for (const lm of list) {
    if (seen.has(lm.name)) {
      console.error(`Duplicate name in pref ${pId}: ${lm.name} (id: ${lm.id})`);
      duplicateNamesCount++;
    }
    seen.add(lm.name);
  }
}
console.log(`Prefecture landmark duplicates: ${duplicateNamesCount} (Target: 0)`);

console.log('\n=== 2. ランダム選出シミュレーション (同一名所重複完全ゼロ検証) ===');
function filterLandmarksByDifficulty(landmarks, difficulty = 'easy') {
  if (difficulty === 'easy') {
    const nationals = landmarks.filter((lm) => lm.fameLevel === 'national');
    return nationals.length >= 3 ? nationals : landmarks.filter((lm) => lm.fameLevel !== 'minor');
  }
  if (difficulty === 'normal') {
    return landmarks.filter((lm) => lm.fameLevel === 'national' || lm.fameLevel === 'regional');
  }
  return landmarks; // hard: すべて
}

function getRandomLandmarksForPrefecture(prefId, count = 3, difficulty = 'easy', excludeIds = []) {
  const allCandidates = prefMap[prefId] || [];
  const filteredCandidates = filterLandmarksByDifficulty(allCandidates, difficulty);

  let primaryPool = filteredCandidates.filter((lm) => !excludeIds.includes(lm.id));
  if (primaryPool.length < count) {
    primaryPool = filteredCandidates.length >= count ? filteredCandidates : allCandidates;
  }

  const shuffled = [...primaryPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = [];
  const seenNames = new Set();
  for (const lm of shuffled) {
    if (!seenNames.has(lm.name)) {
      selected.push(lm);
      seenNames.add(lm.name);
      if (selected.length >= count) break;
    }
  }

  if (selected.length < count) {
    for (const lm of shuffled) {
      if (!selected.some((s) => s.id === lm.id)) {
        selected.push(lm);
        if (selected.length >= count) break;
      }
    }
  }

  return selected;
}

const difficulties = ['easy', 'normal', 'hard'];
let electionDuplicateCount = 0;

for (const diff of difficulties) {
  for (let pId = 1; pId <= 47; pId++) {
    for (let sim = 0; sim < 100; sim++) {
      const selected = getRandomLandmarksForPrefecture(pId, 3, diff);
      const names = selected.map((s) => s.name);
      const uniqueNames = new Set(names);
      if (uniqueNames.size !== 3) {
        console.error(`Duplicate selected in pref ${pId} (${diff}):`, names);
        electionDuplicateCount++;
      }
    }
  }
}
console.log(`Total 3-landmark duplicate election occurrences: ${electionDuplicateCount} (Target: 0)`);

console.log('\n=== 3. リロール (名所チェンジ) 時の直前名所除外検証 ===');
let rerollSuccessCount = 0;
let rerollTestCount = 0;

for (let pId = 1; pId <= 47; pId++) {
  const first = getRandomLandmarksForPrefecture(pId, 3, 'normal');
  const firstIds = first.map((l) => l.id);

  // リロール実行 (firstIds を excludeIds として渡す)
  const rerolled = getRandomLandmarksForPrefecture(pId, 3, 'normal', firstIds);
  rerollTestCount++;

  // 候補数が十分ある場合（normalは通常10件以上）、直前3件とは異なる名所が選ばれるはず
  const overlap = rerolled.filter((l) => firstIds.includes(l.id));
  if (overlap.length === 0) {
    rerollSuccessCount++;
  }
}
console.log(`Reroll fresh selection: ${rerollSuccessCount} / ${rerollTestCount}`);

if (duplicateNamesCount === 0 && electionDuplicateCount === 0 && rerollSuccessCount >= 45) {
  console.log('\n>>> ALL DUPLICATE ELIMINATION TESTS PASSED PERFECTLY! <<<');
} else {
  console.error('\n>>> TESTS FAILED! <<<');
  process.exit(1);
}
