const fs = require('fs');
const content = fs.readFileSync('src/data/landmarksData.ts', 'utf8');
const test = ['tokyo_sensoji', 'osaka_dotonbori', 'kyoto_fushimi', 'nagano_zenkoji', 'shizuoka_miho', 'okinawa_churaumi', 'kanagawa_kamakura'];
for (const t of test) {
  const m = [...content.matchAll(new RegExp(`id:\\s*'(${t}[^']*?)'`, 'g'))].map(x => x[1]);
  console.log(t, '->', m);
}

