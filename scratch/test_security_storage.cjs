const fs = require('fs');
const path = require('path');

// LocalStorageのモック環境構築
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new LocalStorageMock();

// storage.ts の関数と定数をテスト
// Node環境でTypeScriptソースを直接動的コンパイルまたはトランスパイルして実行
const storageCode = fs.readFileSync(path.join(__dirname, '../src/utils/storage.ts'), 'utf8');

// TypeScriptの型注釈とimport文を簡易除去して実行コンテキスト作成
const cleanCode = storageCode
  .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '')
  .replace(/export\s+/g, '')
  .replace(/:\s*[A-Za-z0-9_<>\[\]|&\s]+/g, (match) => {
    // オブジェクトリテラルのコロンと型注釈を安全に区別
    if (match.includes('{') || match.includes('}')) return match;
    return '';
  });

// 実行用モジュールとして評価
const mod = {};
const testFn = new Function('exports', cleanCode + '\n' + `
  exports.MAX_THEORETICAL_SNIPER_SCORE = MAX_THEORETICAL_SNIPER_SCORE;
  exports.getSniperHighScore = getSniperHighScore;
  exports.saveSniperHighScore = saveSniperHighScore;
  exports.createSignedPayload = createSignedPayload;
  exports.verifySignedPayload = verifySignedPayload;
  exports.safeSetItem = safeSetItem;
  exports.getPassportData = getPassportData;
  exports.savePassportRecord = savePassportRecord;
`);

testFn(mod);

console.log('--- [TEST START: LocalStorage セキュリティ・改ざん防止・容量保護検証] ---');

// 1. 正常系テスト
console.log('\n[TEST 1] 正常なハイスコア保存と署名付きエンベロープ確認');
const initialSaved = mod.saveSniperHighScore(15000);
console.log('saveSniperHighScore(15000) result:', initialSaved);
const retrieved = mod.getSniperHighScore();
console.log('getSniperHighScore() retrieved:', retrieved);

const rawStored = global.localStorage.getItem('japan_dart_sniper_high_score_v1');
console.log('Raw localStorage content:', rawStored);

if (retrieved === 15000 && rawStored.includes('signature') && rawStored.includes('15000')) {
  console.log('✓ TEST 1 PASSED: 署名付きエンベロープで正常に保存・復元されました。');
} else {
  console.error('✗ TEST 1 FAILED!');
  process.exit(1);
}

// 2. 改ざん検知テスト A (平文で直接書き換えられた場合)
console.log('\n[TEST 2] 開発者ツールから平文で "99999" に改ざんされたケースの検知');
global.localStorage.setItem('japan_dart_sniper_high_score_v1', '99999');
const temperedScoreA = mod.getSniperHighScore();
console.log('Retrieved score after plain tampering:', temperedScoreA);

if (temperedScoreA === 0) {
  console.log('✓ TEST 2 PASSED: 署名のない平文の直接改ざんを無効化（0リセット）しました。');
} else {
  console.error('✗ TEST 2 FAILED: Tampered plain score was accepted!');
  process.exit(1);
}

// 3. 改ざん検知テスト B (JSONエンベロープ内のdataだけ書き換えられた場合)
console.log('\n[TEST 3] エンベロープ内の data だけを 50000 に改ざんされたケースの検知');
const validEnvelope = JSON.parse(mod.createSignedPayload(12000));
validEnvelope.data = 50000; // 署名は12000のまま、データだけ50000に改ざん
global.localStorage.setItem('japan_dart_sniper_high_score_v1', JSON.stringify(validEnvelope));

const temperedScoreB = mod.getSniperHighScore();
console.log('Retrieved score after signature mismatch tampering:', temperedScoreB);

if (temperedScoreB === 0) {
  console.log('✓ TEST 3 PASSED: 署名不一致による改ざんを検知し、安全にブロック・リセットしました。');
} else {
  console.error('✗ TEST 3 FAILED: Signature mismatch was not detected!');
  process.exit(1);
}

// 4. 理論上限値バリデーションテスト
console.log('\n[TEST 4] 理論限界値 (225,000点) を超える不正スコアの保存防止');
console.log('MAX_THEORETICAL_SNIPER_SCORE:', mod.MAX_THEORETICAL_SNIPER_SCORE);
const overLimitResult = mod.saveSniperHighScore(9999999);
console.log('saveSniperHighScore(9999999) result:', overLimitResult);

if (overLimitResult === false) {
  console.log('✓ TEST 4 PASSED: 理論上限値（225,000点）を超える不正スコアの保存を拒絶しました。');
} else {
  console.error('✗ TEST 4 FAILED: Over-limit score was accepted!');
  process.exit(1);
}

// 5. 容量枯渇・クォータエラーハンドリングテスト
console.log('\n[TEST 5] 容量枯渇・QuotaExceededError 時の安全防御');
const originalSetItem = global.localStorage.setItem;
global.localStorage.setItem = () => {
  const err = new Error('QuotaExceededError');
  err.name = 'QuotaExceededError';
  throw err;
};

const safeResult = mod.safeSetItem('test_quota', 'some_value');
console.log('safeSetItem under QuotaExceededError returned:', safeResult);
global.localStorage.setItem = originalSetItem;

if (safeResult === false) {
  console.log('✓ TEST 5 PASSED: 容量枯渇時でも例外クラッシュせず安全にフォールバックしました。');
} else {
  console.error('✗ TEST 5 FAILED: Quota exception handling failed!');
  process.exit(1);
}

console.log('\n🎉 ALL SECURITY & STORAGE TESTS PASSED SUCCESSFULLY!');
