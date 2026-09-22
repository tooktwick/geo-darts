const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('getRandomLandmarksForPrefecture') || l.includes('handleRerollLandmarks') || l.includes('setDifficulty')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
}

