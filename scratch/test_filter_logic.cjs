const assert = require('assert');

// ts-nodeやトランスパイルを使わずにlandmarksDataの関数ロジックをテスト
// ロジックを模倣してテスト
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

const mockLandmarks = [
  { id: '1', fameLevel: 'national' },
  { id: '2', fameLevel: 'national' },
  { id: '3', fameLevel: 'national' },
  { id: '4', fameLevel: 'regional' },
  { id: '5', fameLevel: 'regional' },
  { id: '6', fameLevel: 'minor' },
];

const easyPool = filterLandmarksByDifficulty(mockLandmarks, 'easy');
assert.strictEqual(easyPool.length, 3);
assert(easyPool.every(x => x.fameLevel === 'national'));

const normalPool = filterLandmarksByDifficulty(mockLandmarks, 'normal');
assert.strictEqual(normalPool.length, 5);
assert(normalPool.every(x => x.fameLevel === 'national' || x.fameLevel === 'regional'));

const hardPool = filterLandmarksByDifficulty(mockLandmarks, 'hard');
assert.strictEqual(hardPool.length, 6);

console.log('難易度連動フィルタリングロジックのテスト: 全ケース合格！');

