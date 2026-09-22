const fs = require('fs');
const quizText = fs.readFileSync('src/data/quizData.ts', 'utf8');
const lmText = fs.readFileSync('src/data/landmarksData.ts', 'utf8');

const qIds = [...quizText.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
console.log('Total quiz questions:', qIds.length);
const qIdSet = new Set(qIds);
if (qIdSet.size !== qIds.length) {
  console.error('Duplicate quiz IDs detected!');
} else {
  console.log('All quiz question IDs are UNIQUE!');
}

const landmarkMatches = [...quizText.matchAll(/landmarkId:\s*'([^']+)'/g)].map(m => m[1]);
console.log('Total landmark references in quiz:', landmarkMatches.length);
const missingLm = [];
for (const lmId of landmarkMatches) {
  if (!lmText.includes(`id: '${lmId}'`)) {
    missingLm.push(lmId);
  }
}
console.log('Missing landmarks count:', missingLm.length, missingLm);

const prefIds = [...quizText.matchAll(/prefId:\s*(\d+)/g)].map(m => Number(m[1]));
const prefSet = new Set(prefIds);
console.log('Covered prefectures count:', prefSet.size);

