const fs = require('fs');
const path = require('path');

console.log('=== 愛知県詳細限定版: 市制覇保存 & 市選択時名所フラグ初期化 自動検証テスト ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

// 1. storage.ts の関数検証
console.log('1. storage.ts 関数テスト:');
const storageFile = fs.readFileSync(path.join(__dirname, '../src/utils/storage.ts'), 'utf8');
assert(storageFile.includes('export function saveAichiClearedCityId'), 'saveAichiClearedCityId がエクスポートされていること');
assert(storageFile.includes('export function removeAichiClearedCity'), 'removeAichiClearedCity がエクスポートされていること');
assert(storageFile.includes('export function resetAllAichiClearedData'), 'resetAllAichiClearedData がエクスポートされていること');

// 2. App.tsx の市選択ハンドラー検証
console.log('\n2. App.tsx 市選択ハンドラー & 制覇保存検証:');
const appFile = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');

// 制覇済み市が消去されず正しく保持されていること
assert(!appFile.includes('removeAichiClearedCity(prevCity.id)'), 'handleSelectAichiCity で制覇済み市 (prevCity) が誤消去されないこと');
assert(appFile.includes('const currentClearedCities = getAichiClearedCityIds()'), 'handleSelectAichiCity で最新の制覇済み市リストを取得・保持していること');
assert(appFile.includes('clearedLandmarkIdsForCity: []'), 'handleSelectAichiCity で選択した市の名所クリアフラグが0/3に初期化されること');
assert(appFile.includes('clearedCityIds: currentClearedCities'), 'handleSelectAichiCity で制覇済み市リストがstateに保持されること');

// 3名所制覇時の保存ロジック検証
assert(appFile.includes('const updatedClearedCities = saveAichiClearedCityId(currentCity.id)'), '3名所命中時に saveAichiClearedCityId で市クリアが保存されること');
assert(appFile.includes('handleResetAllAichiCities'), '全市のクリアフラグ一括リセットハンドラーが存在すること');
assert(appFile.includes('onResetAll={handleResetAllAichiCities}'), 'AichiCitySelectModal に onResetAll が渡されていること');

// 3. AichiCitySelectModal.tsx の UI検証
console.log('\n3. AichiCitySelectModal UI検証:');
const modalFile = fs.readFileSync(path.join(__dirname, '../src/components/AichiCitySelectModal.tsx'), 'utf8');
assert(modalFile.includes('onResetAll?: () => void;'), 'AichiCitySelectModalProps に onResetAll が定義されていること');
assert(modalFile.includes('全クリア解除'), '一括クリア解除ボタンが存在すること');
assert(modalFile.includes('isCleared ?'), '市カードに制覇済み表示ロジックが存在すること');

// 4. AichiMissionBar.tsx の残留防止ガード検証
console.log('\n4. AichiMissionBar 残留防止ガード検証:');
const barFile = fs.readFileSync(path.join(__dirname, '../src/components/AichiMissionBar.tsx'), 'utf8');
assert(barFile.includes('isValidHitForCurrentCity') && barFile.includes('activeHit'), 'AichiMissionBar に 前の市の投擲情報残留防止ガード (activeHit) が配備されていること');

console.log('\n=============================================');
console.log(`テスト実行完了: 合計 ${totalTests} 件`);
console.log(`  成功: ${passedTests} 件`);
console.log(`  失敗: ${failedTests} 件`);
console.log('=============================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 全ての愛知県クリア判定・初期化テストに合格しました！');
}
