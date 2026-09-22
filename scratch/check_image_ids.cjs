const fs = require('fs');
const content = fs.readFileSync('src/data/landmarksData.ts', 'utf8');
const testList = [
  'hokkaido_goryokaku', 'hokkaido_bluepond', 'hokkaido_otaru', 'hokkaido_asahiyama',
  'aomori_hirosaki', 'aomori_oirase', 'iwate_chusonji', 'miyagi_matsushima',
  'akita_nyuto', 'yamagata_yamadera', 'fukushima_ouchijuku', 'ibaraki_hitachi',
  'ibaraki_ushikudaibutsu', 'tochigi_nikko', 'tochigi_kegon', 'gunma_kusatsu',
  'saitama_kawagoe', 'chiba_naritasan', 'tokyo_tower', 'tokyo_sensoji',
  'tokyo_meijijingu', 'kanagawa_kamakura', 'kanagawa_hakone', 'niigata_sadogold',
  'niigata_kiyotsukyo', 'toyama_kurobedam', 'ishikawa_kenrokuen', 'fukui_tojinbo',
  'yamanashi_fuji', 'yamanashi_kawaguchiko', 'nagano_matsumoto', 'nagano_zenkoji',
  'gifu_shirakawago', 'shizuoka_miho', 'aichi_nagoya_castle', 'aichi_inuyama',
  'mie_ise', 'shiga_hikone', 'kyoto_kinkakuji', 'kyoto_kiyomizudera',
  'kyoto_fushimi', 'osaka_osakajo', 'osaka_dotonbori', 'hyogo_himejijo',
  'nara_todaiji', 'wakayama_nachi', 'tottori_sakyu', 'shimane_izumo',
  'okayama_kurashiki', 'hiroshima_itsukushima', 'hiroshima_genbaku',
  'yamaguchi_tsunoshima', 'yamaguchi_kintaikyo', 'tokushima_naruto',
  'kagawa_kotohira', 'ehime_dogo', 'kochi_katsurahama', 'fukuoka_dazaifu',
  'saga_yoshinogari', 'nagasaki_glover', 'kumamoto_kumamotojo', 'oita_beppu',
  'miyazaki_takachiho', 'kagoshima_sakurajima', 'okinawa_shurijo', 'okinawa_churaumi'
];

for (const id of testList) {
  if (!content.includes(`id: '${id}'`)) {
    const pref = id.split('_')[0];
    const similar = [...content.matchAll(new RegExp(`id: '(${pref}[^']*?)'`, 'g'))].map(m => m[1]);
    console.log('Not found:', id, '-> Candidates:', similar.slice(0, 3));
  }
}
console.log('Checked.');
