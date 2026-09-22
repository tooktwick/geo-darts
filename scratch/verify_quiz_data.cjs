const fs = require('fs');
const quizContent = fs.readFileSync('src/data/quizData.ts', 'utf8');
const lmContent = fs.readFileSync('src/data/landmarksData.ts', 'utf8');

const idMatches = [...quizContent.matchAll(/landmarkId:\s*'([^']+)'/g)];
console.log('Total questions defined:', idMatches.length);

const missing = [];
for (const m of idMatches) {
  const id = m[1];
  if (!lmContent.includes(`'${id}'`)) {
    missing.push(id);
  }
}

if (missing.length === 0) {
  console.log('SUCCESS: All', idMatches.length, 'quiz questions map to valid LANDMARKS!');
} else {
  console.error('ERROR: Missing landmark IDs:', missing);
  process.exit(1);
}

