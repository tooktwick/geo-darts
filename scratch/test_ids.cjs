const fs = require('fs');
const content = fs.readFileSync('src/data/landmarksData.ts', 'utf8');
const testIds = [
  'ibaraki_hitachi', 'ibaraki_ushikudaibutsu',
  'chiba_naritasan', 'chiba_nokogiriyama',
  'toyama_kurobedam', 'toyama_amaharashi',
  'mie_ise', 'mie_toba_aquarium',
  'okayama_kurashiki', 'okayama_bitchu_matsuyama',
  'yamaguchi_tsunoshima', 'yamaguchi_akiyoshido',
  'tokushima_naruto', 'tokushima_kazurabashi',
  'kagawa_kotohira', 'kagawa_chichibugahama',
  'kochi_katsurahama', 'kochi_shimanto',
  'fukuoka_dazaifu', 'fukuoka_mojiko',
  'saga_yoshinogari', 'saga_takeo_kusunoki',
  'nagasaki_gunkanjima', 'nagasaki_glover',
  'miyazaki_takachiho', 'miyazaki_sunmesse',
  'kagoshima_sakurajima', 'kagoshima_yakushima',
  'hokkaido_asahiyama', 'aomori_oirase', 'iwate_ryusendo',
  'miyagi_zaookama', 'tochigi_toshogu', 'gunma_kusatsu_yubatake',
  'saitama_tokinokane', 'tokyo_sensoji', 'kanagawa_kamakura_daibutsu',
  'niigata_sadokinzang', 'ishikawa_kenrokuen', 'fukui_tojinbo',
  'aichi_nagoyajo', 'osaka_dotonbori', 'hyogo_himejijo', 'okinawa_shurijo'
];

for (const id of testIds) {
  if (!content.includes(`id: '${id}'`)) {
    console.log('NOT FOUND:', id);
  }
}
console.log('Test complete.');

