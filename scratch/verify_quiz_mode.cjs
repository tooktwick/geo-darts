const fs = require('fs');
const assert = require('assert');

console.log('=== ご当地クイズ推理モード (GeoQuiz Mode) 包括的自動検証 ===\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}\n   Error: ${err.message}`);
    failCount++;
  }
}

// 1. types.ts の検証
test('types.ts に quiz モードおよびクイズ関連の型定義が存在すること', () => {
  const content = fs.readFileSync('src/types.ts', 'utf8');
  assert(content.includes("'quiz'"), "GameMode に 'quiz' が含まれていません");
  assert(content.includes('export interface GeoQuizQuestion'), 'GeoQuizQuestion 型が定義されていません');
  assert(content.includes('export interface QuizQuestionResult'), 'QuizQuestionResult 型が定義されていません');
  assert(content.includes('export interface QuizGameState'), 'QuizGameState 型が定義されていません');
});

// 2. quizData.ts の検証
test('quizData.ts の全問題が完全な構造を持ち、実在する名所に紐づいていること', () => {
  const quizContent = fs.readFileSync('src/data/quizData.ts', 'utf8');
  const lmContent = fs.readFileSync('src/data/landmarksData.ts', 'utf8');

  // 問題数チェック
  const idMatches = [...quizContent.matchAll(/id:\s*'([^']+)'/g)];
  assert(idMatches.length >= 30, `問題数が少なすぎます: ${idMatches.length}`);

  // 各問題の landmarkId が landmarksData.ts に実在すること
  const lmIdMatches = [...quizContent.matchAll(/landmarkId:\s*'([^']+)'/g)];
  assert(lmIdMatches.length === idMatches.length, '問題IDとlandmarkIdの数が一致しません');

  for (const match of lmIdMatches) {
    const lmId = match[1];
    assert(lmContent.includes(`'${lmId}'`), `landmarkId '${lmId}' が landmarksData.ts に存在しません`);
  }

  // 3段階ヒントと解説の存在チェック
  assert(quizContent.includes('hints: ['), 'hints 配列が定義されていません');
  assert(quizContent.includes('explanation:'), 'explanation プロパティが定義されていません');
  assert(quizContent.includes('getRandomQuizSet'), 'getRandomQuizSet 関数が定義されていません');
});

// 3. QuizMissionBar.tsx の検証
test('QuizMissionBar.tsx が正しく実装されていること', () => {
  const content = fs.readFileSync('src/components/QuizMissionBar.tsx', 'utf8');
  assert(content.includes('export const QuizMissionBar'), 'QuizMissionBar がエクスポートされていません');
  assert(content.includes('CategoryIcon'), 'CategoryIcon が使用されていません');
  assert(content.includes('currentMultiplier'), '倍率計算が含まれていません');
  assert(content.includes('onUnlockHint'), 'ヒント解放コールバックが含まれていません');
  assert(content.includes('ヒント①'), 'ヒント1表示が含まれていません');
});

// 4. QuizResultModal.tsx の検証
test('QuizResultModal.tsx が正しく実装されていること', () => {
  const content = fs.readFileSync('src/components/QuizResultModal.tsx', 'utf8');
  assert(content.includes('export const QuizResultModal'), 'QuizResultModal がエクスポートされていません');
  assert(content.includes('getLandmarkImageUrl'), 'getLandmarkImageUrl が使用されていません');
  assert(content.includes('targetLandmark'), 'targetLandmark が参照されていません');
  assert(content.includes('onNextQuestion'), 'onNextQuestion コールバックが含まれていません');
  assert(content.includes('🎯 神の眼'), '直撃バッジ定義が含まれていません');
});

// 5. QuizGameOverModal.tsx の検証
test('QuizGameOverModal.tsx が正しく実装されていること', () => {
  const content = fs.readFileSync('src/components/QuizGameOverModal.tsx', 'utf8');
  assert(content.includes('export const QuizGameOverModal'), 'QuizGameOverModal がエクスポートされていません');
  assert(content.includes('日本地理神'), 'Sランク称号が含まれていません');
  assert(content.includes('旅の達人'), 'Aランク称号が含まれていません');
  assert(content.includes('一人前の旅人'), 'Bランク称号が含まれていません');
  assert(content.includes('見習い旅人'), 'Cランク称号が含まれていません');
  assert(content.includes('onRestart'), 'onRestart コールバックが含まれていません');
});

// 6. GameHUD.tsx の検証
test('GameHUD.tsx に「推理クイズ」タブが配置されていること', () => {
  const content = fs.readFileSync('src/components/GameHUD.tsx', 'utf8');
  assert(content.includes("onSelectMode('quiz')"), "GameHUD に 'quiz' モード選択ボタンがありません");
  assert(content.includes('推理クイズ'), "GameHUD に '推理クイズ' のテキストがありません");
  assert(content.includes('Brain'), 'GameHUD に Brain アイコンがインポート・配置されていません');
});

// 7. App.tsx の統合検証
test('App.tsx にクイズステート・投擲着弾判定・モーダル統合が実装されていること', () => {
  const content = fs.readFileSync('src/App.tsx', 'utf8');
  assert(content.includes('quizState'), 'quizState が定義されていません');
  assert(content.includes('handleRestartQuiz'), 'handleRestartQuiz が定義されていません');
  assert(content.includes('handleUnlockQuizHint'), 'handleUnlockQuizHint が定義されていません');
  assert(content.includes('handleNextQuizQuestion'), 'handleNextQuizQuestion が定義されていません');
  assert(content.includes("mode === 'quiz'"), "App.tsx に mode === 'quiz' の判定がありません");
  assert(content.includes('QuizMissionBar'), 'QuizMissionBar が描画されていません');
  assert(content.includes('QuizResultModal'), 'QuizResultModal が描画されていません');
  assert(content.includes('QuizGameOverModal'), 'QuizGameOverModal が描画されていません');
  assert(content.includes('flyToLatLng'), '正解地点へのカメラ飛行処理が含まれていません');
});

// 8. SYSTEM_SPECIFICATION.md の検証
test('SYSTEM_SPECIFICATION.md に第4.5節 ご当地クイズ推理モードが記載されていること', () => {
  const content = fs.readFileSync('docs/SYSTEM_SPECIFICATION.md', 'utf8');
  assert(content.includes('4.5 ご当地クイズ推理モード'), '仕様書に第4.5節が追記されていません');
  assert(content.includes('GeoQuiz Mode'), '仕様書に GeoQuiz Mode の記述がありません');
  assert(content.includes('神の眼直撃'), '仕様書に着弾判定仕様がありません');
});

console.log(`\n================================`);
console.log(`テスト結果: 全 ${passCount + failCount} 項目中 ${passCount} 項目合格 (${failCount} 項目失敗)`);
console.log(`================================`);

if (failCount > 0) {
  process.exit(1);
}

