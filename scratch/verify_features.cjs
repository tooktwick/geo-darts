const fs = require('fs');
const path = require('path');

// 1. landmarksData.ts の読み込みとパース検証
const landmarksFile = fs.readFileSync(path.join(__dirname, '../src/data/landmarksData.ts'), 'utf8');
const landmarksMatch = landmarksFile.match(/export const LANDMARKS:\s*Landmark\[\]\s*=\s*(\[[\s\S]*?\]);/);

if (!landmarksMatch) {
  console.error('LANDMARKS not found in landmarksData.ts');
  process.exit(1);
}

// 2. types.ts の Landmark 定義に imageUrl が存在することを確認
const typesFile = fs.readFileSync(path.join(__dirname, '../src/types.ts'), 'utf8');
if (!typesFile.includes('imageUrl?: string;')) {
  console.error('imageUrl?: string; not found in types.ts');
  process.exit(1);
}
console.log('✓ types.ts has imageUrl field in Landmark interface');

// 3. BasicTourMissionBar.tsx に activeHit によるガードが存在することを確認
const barFile = fs.readFileSync(path.join(__dirname, '../src/components/BasicTourMissionBar.tsx'), 'utf8');
if (!barFile.includes('isValidHitForCurrentPref') || !barFile.includes('activeHit')) {
  console.error('activeHit guard not found in BasicTourMissionBar.tsx');
  process.exit(1);
}
console.log('✓ BasicTourMissionBar.tsx has activeHit guard for current prefecture');

// 4. App.tsx に LandmarkHitModal が統合されていることを確認
const appFile = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
if (!appFile.includes('LandmarkHitModal') || !appFile.includes('hitLandmarkModalData')) {
  console.error('LandmarkHitModal or hitLandmarkModalData not found in App.tsx');
  process.exit(1);
}
if (!appFile.includes('prevPrefIdRef') || !appFile.includes('setCurrentHits([])')) {
  console.error('Prefecture reset logic not properly implemented in App.tsx');
  process.exit(1);
}
console.log('✓ App.tsx has LandmarkHitModal integration and pref-change hit clearing');

// 5. landmarkImages.ts の存在確認
const imgFile = fs.readFileSync(path.join(__dirname, '../src/utils/landmarkImages.ts'), 'utf8');
if (!imgFile.includes('getLandmarkImageUrl')) {
  console.error('getLandmarkImageUrl not found in landmarkImages.ts');
  process.exit(1);
}
console.log('✓ landmarkImages.ts contains getLandmarkImageUrl');

console.log('\nAll static feature verifications passed successfully!');
