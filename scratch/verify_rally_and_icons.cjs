const fs = require('fs');
const path = require('path');

console.log('=== 『日本列島 ダーツの旅』新機能 自動検証テスト ===\n');

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

// -------------------------------------------------------------
// 1. ラリーコース（全8コース）およびチェックポイント整合性テスト
// -------------------------------------------------------------
console.log('1. ラリーコース拡張 & データ整合性テスト:');

const rallyFile = fs.readFileSync(path.join(__dirname, '../src/rallyData.ts'), 'utf8');
const landmarksFile = fs.readFileSync(path.join(__dirname, '../src/data/landmarksData.ts'), 'utf8');

// LANDMARKS からすべての名所IDを抽出
const landmarkIdRegex = /id:\s*['"]([a-zA-Z0-9_-]+)['"]/g;
const allLandmarkIds = new Set();
let match;
while ((match = landmarkIdRegex.exec(landmarksFile)) !== null) {
  allLandmarkIds.add(match[1]);
}

assert(allLandmarkIds.size >= 470, `landmarksData.ts に 470箇所以上の名所が存在すること (実測: ${allLandmarkIds.size}箇所)`);

// RALLY_COURSES のコース定義を検証
const expectedCourses = [
  'shinkansen_route',
  'world_heritage',
  'gourmet_trail',
  'traverse_japan',
  'hotspring_tour',
  'national_castles',
  'three_gardens',
  'michinoku_trail'
];

expectedCourses.forEach((courseId) => {
  assert(rallyFile.includes(`id: '${courseId}'`), `ラリーコース '${courseId}' が定義されていること`);
});

// 各コースのチェックポイントIDが実在するか検証
const courseBlocks = rallyFile.split(/\{\s*id:\s*['"]/g).slice(1);
assert(courseBlocks.length === 8, `RALLY_COURSES に計8コースが定義されていること (実測: ${courseBlocks.length}コース)`);

courseBlocks.forEach((block) => {
  const idMatch = block.match(/^([a-zA-Z0-9_-]+)['"]/);
  const courseId = idMatch ? idMatch[1] : 'unknown';
  
  const checkpointsMatch = block.match(/checkpoints:\s*\[([\s\S]*?)\]/);
  if (checkpointsMatch) {
    const rawCheckpoints = checkpointsMatch[1];
    const cpIds = [...rawCheckpoints.matchAll(/['"]([a-zA-Z0-9_-]+)['"]/g)].map((m) => m[1]);
    
    assert(cpIds.length >= 5, `コース '${courseId}' に5箇所以上の名所が設定されていること (実測: ${cpIds.length}箇所)`);
    
    let allExist = true;
    const missing = [];
    cpIds.forEach((cpId) => {
      if (!allLandmarkIds.has(cpId)) {
        allExist = false;
        missing.push(cpId);
      }
    });
    assert(allExist, `コース '${courseId}' の全チェックポイントが名所マスターに実在すること${missing.length > 0 ? ` (未存在: ${missing.join(', ')})` : ''}`);
  } else {
    assert(false, `コース '${courseId}' に checkpoints 配列が定義されていること`);
  }
});

// -------------------------------------------------------------
// 2. 名所種類別オリジナル画像アイコン (SVG) テスト
// -------------------------------------------------------------
console.log('\n2. 名所種類別オリジナル画像アイコン (SVG) テスト:');

const expectedCategories = [
  'cat_castle.svg',
  'cat_shrine_temple.svg',
  'cat_nature.svg',
  'cat_hotspring.svg',
  'cat_gourmet.svg',
  'cat_heritage.svg',
  'cat_modern_spot.svg',
  'cat_garden.svg',
  'cat_culture.svg',
  'cat_spot.svg',
];

const iconsDir = path.join(__dirname, '../public/assets/icons');
assert(fs.existsSync(iconsDir), `public/assets/icons ディレクトリが存在すること`);

expectedCategories.forEach((svgFile) => {
  const filePath = path.join(iconsDir, svgFile);
  const exists = fs.existsSync(filePath);
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    const isValidSvg = content.includes('<svg') && content.includes('</svg>') && content.length > 200;
    assert(isValidSvg, `SVGファイル '${svgFile}' が有効なXML/SVG構造を持つこと (${content.length} bytes)`);
  } else {
    assert(false, `SVGファイル '${svgFile}' が存在すること`);
  }
});

// -------------------------------------------------------------
// 3. CategoryIcon コンポーネントおよび設定テスト
// -------------------------------------------------------------
console.log('\n3. CategoryIcon コンポーネント & 設定テスト:');

const categoryIconPath = path.join(__dirname, '../src/components/CategoryIcon.tsx');
assert(fs.existsSync(categoryIconPath), `CategoryIcon.tsx が作成されていること`);

const categoryIconContent = fs.readFileSync(categoryIconPath, 'utf8');
assert(categoryIconContent.includes('export const CategoryIcon'), `CategoryIcon がエクスポートされていること`);
assert(categoryIconContent.includes('CATEGORY_ICON_PATHS'), `CATEGORY_ICON_PATHS マッピングが定義されていること`);

const landmarkImagesPath = path.join(__dirname, '../src/utils/landmarkImages.ts');
const landmarkImagesContent = fs.readFileSync(landmarkImagesPath, 'utf8');
assert(landmarkImagesContent.includes('iconPath: string;'), `CategoryInfo 型に iconPath が定義されていること`);

const catConfigs = [
  'castle', 'shrine_temple', 'nature', 'hotspring', 'gourmet',
  'heritage', 'modern_spot', 'garden', 'culture', 'spot'
];
catConfigs.forEach((cat) => {
  assert(landmarkImagesContent.includes(`iconPath: '/assets/icons/cat_${cat}.svg'`), `CATEGORY_CONFIG.${cat} に正しい iconPath が設定されていること`);
});

// -------------------------------------------------------------
// 4. UIコンポーネント統合テスト
// -------------------------------------------------------------
console.log('\n4. UIコンポーネント統合テスト:');

const gsiMapContent = fs.readFileSync(path.join(__dirname, '../src/components/GsiJapanMap.tsx'), 'utf8');
assert(gsiMapContent.includes('catInfo.iconPath'), `GsiJapanMap.tsx で名所マーカーにオリジナルアイコン画像 (iconPath) が組み込まれていること`);

const basicBarContent = fs.readFileSync(path.join(__dirname, '../src/components/BasicTourMissionBar.tsx'), 'utf8');
assert(basicBarContent.includes('<CategoryIcon category={lm.category}'), `BasicTourMissionBar.tsx の名所カードで CategoryIcon が使用されていること`);

const aichiBarContent = fs.readFileSync(path.join(__dirname, '../src/components/AichiMissionBar.tsx'), 'utf8');
assert(aichiBarContent.includes('<CategoryIcon category={lm.category}'), `AichiMissionBar.tsx の名所カードで CategoryIcon が使用されていること`);

const hitModalContent = fs.readFileSync(path.join(__dirname, '../src/components/LandmarkHitModal.tsx'), 'utf8');
assert(hitModalContent.includes('<CategoryIcon category={landmark.category}'), `LandmarkHitModal.tsx で CategoryIcon が使用されていること`);

const rallyModalContent = fs.readFileSync(path.join(__dirname, '../src/components/RallyCourseSelectModal.tsx'), 'utf8');
assert(rallyModalContent.includes('全8大コース'), `RallyCourseSelectModal.tsx に全8大コース表記が反映されていること`);

// -------------------------------------------------------------
// 5. 仕様書ドキュメント整合性テスト
// -------------------------------------------------------------
console.log('\n5. 仕様書ドキュメント整合性テスト:');

const specContent = fs.readFileSync(path.join(__dirname, '../docs/SYSTEM_SPECIFICATION.md'), 'utf8');
assert(specContent.includes('8大ラリーコース仕様'), `SYSTEM_SPECIFICATION.md に 8大ラリーコース仕様が記載されていること`);
assert(specContent.includes('名所種類別オリジナル画像アイコン'), `SYSTEM_SPECIFICATION.md に名所種類別オリジナル画像アイコン仕様が記載されていること`);
assert(specContent.includes('国宝五城・名城覇王ラリー'), `SYSTEM_SPECIFICATION.md に国宝五城ラリーが記載されていること`);

// -------------------------------------------------------------
// テスト結果サマリー
// -------------------------------------------------------------
console.log('\n=============================================');
console.log(`テスト実行完了: 合計 ${totalTests} 件`);
console.log(`  成功: ${passedTests} 件`);
console.log(`  失敗: ${failedTests} 件`);
console.log('=============================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 全ての自動検証テストに合格しました！');
}

