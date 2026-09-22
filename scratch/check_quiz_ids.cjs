const fs = require('fs');
const content = fs.readFileSync('src/data/landmarksData.ts', 'utf8');
const testIds = [
  'hokkaido_goryokaku', 'hokkaido_bluepond',
  'aomori_hirosakijo', 'iwate_chusonji', 'miyagi_matsushima', 'akita_nyuto', 'yamagata_yamadera', 'fukushima_ouchijuku',
  'tochigi_nikko', 'gunma_kusatsu', 'saitama_kawagoe', 'tokyo_sensoji', 'tokyo_tokyotower', 'kanagawa_tsurugaoka', 'kanagawa_hakone',
  'niigata_sado_gold', 'ishikawa_kenrokuen', 'fukui_tojinbo', 'yamanashi_kawaguchiko', 'nagano_matsumoto', 'gifu_shirakawago', 'shizuoka_fujisan', 'aichi_nagoyajo',
  'shiga_hikone', 'kyoto_kinkakuji', 'kyoto_kiyomizudera', 'osaka_osakajo', 'hyogo_himejijo', 'nara_todaiji', 'wakayama_nachifalls',
  'tottori_sakyu', 'shimane_izumotaisha', 'okayama_korakuen', 'hiroshima_itsukushima', 'yamaguchi_tsunoshima',
  'tokushima_naruto', 'kagawa_ritsurin', 'ehime_dogo', 'kochi_katsurahama',
  'fukuoka_dazaifu', 'saga_yoshinogari', 'nagasaki_gunkanjima', 'kumamoto_kumamotojo', 'oita_beppu', 'miyazaki_takachiho', 'kagoshima_sakurajima', 'okinawa_shurijo'
];
const missing = testIds.filter(id => !content.includes(`'${id}'`));
console.log('Missing count:', missing.length);
if (missing.length > 0) {
  console.log('Missing IDs:', missing);
} else {
  console.log('All 47 test landmark IDs exist in landmarksData.ts!');
}

