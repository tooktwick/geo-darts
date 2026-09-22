const fs = require('fs');
const content = fs.readFileSync('src/data/landmarksData.ts', 'utf8');
const searchWords = ['弘前', '東京タワー', '箱根', '佐渡', '松本城', '富士山', '名古屋城', '大阪城', '那智', '出雲大社', '熊本城', '別府'];
searchWords.forEach(w => {
  const reg = new RegExp(`id:\\s*'([^']+)',\\s*name:\\s*'([^']*${w}[^']*)'`, 'g');
  const matches = [...content.matchAll(reg)];
  if (matches.length > 0) {
    console.log(w, '=>', matches.map(m => `${m[1]} (${m[2]})`).join(', '));
  } else {
    console.log(w, '=> NOT FOUND');
  }
});

