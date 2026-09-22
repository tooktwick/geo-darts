const fs = require('fs');
const content = fs.readFileSync('src/data/landmarksData.ts', 'utf8');

const targetIds = [
  'aomori_sannai_maruyama',
  'aomori_tsurunomai',
  'iwate_hanamaki_spa',
  'fukushima_inawashiroko',
  'fukushima_jododaira',
  'fukushima_shirakawa_komine',
  'tochigi_chuzenjiko',
  'tochigi_kinugawa_spa',
  'gunma_ikaho_steps',
  'gunma_shima_spa',
  'chiba_kamogawa_seaworld',
  'chiba_yoro_ravine',
  'fukui_echizen_matsushima_aqua',
  'yamanashi_oshino_hakkai',
  'hyogo_arima_onsen',
  'hiroshima_genbaku_dome',
  'tokushima_otsukamuseum',
  'nagasaki_peace_park'
];

targetIds.forEach((id) => {
  const needle = `id: '${id}'`;
  const idx = content.indexOf(needle);
  if (idx !== -1) {
    const linesBefore = content.substring(0, idx).split('\n').length;
    console.log(`${id} -> line ${linesBefore}`);
  } else {
    console.log(`${id} -> NOT FOUND`);
  }
});
