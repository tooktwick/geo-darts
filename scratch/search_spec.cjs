const fs = require('fs');
const content = fs.readFileSync('docs/SYSTEM_SPECIFICATION.md', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('landmarksData') || l.includes('クイズ') || l.includes('470') || l.includes('940') || l.includes('fameLevel')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
}

