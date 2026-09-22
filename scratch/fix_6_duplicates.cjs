const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'hokkaido_tohoku.cjs',
    oldId: 'miyagi_zuihoden',
    newData: {
      id: 'miyagi_oosakihachiman',
      name: '国宝 大崎八幡宮',
      prefId: 4,
      description: '伊達政宗が造営した仙台総鎮守。桃山文化の粋を結集した壮麗な国宝社殿。',
      coordinates: { lat: 38.2736, lng: 140.8406 },
      mapOffset: [-2, 8],
      category: 'heritage',
      fameLevel: 'regional',
    }
  },
  {
    file: 'hokkaido_tohoku.cjs',
    oldId: 'fukushima_aquamarine',
    newData: {
      id: 'fukushima_jododaira',
      name: '磐梯吾妻スカイライン・浄土平',
      prefId: 7,
      description: '荒涼とした火山火口や高山植物が広がる絶景山岳ロードのハイライト。',
      coordinates: { lat: 37.7297, lng: 140.2522 },
      mapOffset: [-5, -15],
      category: 'nature',
      fameLevel: 'regional',
    }
  },
  {
    file: 'kanto.cjs',
    oldId: 'ibaraki_aquaworld',
    newData: {
      id: 'ibaraki_kasamainari',
      name: '笠間稲荷神社',
      prefId: 8,
      description: '日本三大稲荷の一つ。五穀豊穣・商売繁盛の神として年間350万人が参拝。',
      coordinates: { lat: 36.3853, lng: 140.2592 },
      mapOffset: [-5, -8],
      category: 'heritage',
      fameLevel: 'regional',
    }
  },
  {
    file: 'chubu.cjs',
    oldId: 'yamanashi_seisenryo',
    newData: {
      id: 'yamanashi_hottarakashi',
      name: 'ほったらかし温泉',
      prefId: 19,
      description: '甲府盆地の夜景と雄大な富士山を望みながら入浴できる絶景の天然温泉。',
      coordinates: { lat: 35.7119, lng: 138.6756 },
      mapOffset: [8, -5],
      category: 'nature',
      fameLevel: 'national',
    }
  },
  {
    file: 'kinki.cjs',
    oldId: 'wakayama_engetsujima',
    newData: {
      id: 'wakayama_sandanbeki',
      name: '三段壁・三段壁洞窟',
      prefId: 30,
      description: '南紀白浜の海にそそり立つ高さ50mの断崖絶壁。地下には熊野水軍の洞窟が広がる。',
      coordinates: { lat: 33.6669, lng: 135.3353 },
      mapOffset: [-32, 5],
      category: 'nature',
      fameLevel: 'regional',
    }
  },
  {
    file: 'kyushu_okinawa.cjs',
    oldId: 'nagasaki_meganebashi',
    newData: {
      id: 'nagasaki_dejima',
      name: '出島（出島和蘭商館跡）',
      prefId: 42,
      description: '鎖国期に日本で唯一西欧に開かれていた人工島。復元された建物群が連なる。',
      coordinates: { lat: 32.7431, lng: 129.8731 },
      mapOffset: [2, 7],
      category: 'heritage',
      fameLevel: 'national',
    }
  },
];

for (const rep of replacements) {
  const filePath = path.join(__dirname, 'data_expansion', rep.file);
  let list = require(filePath);
  const idx = list.findIndex(item => item.id === rep.oldId);
  if (idx !== -1) {
    list[idx] = rep.newData;
    const fileContent = `module.exports = ${JSON.stringify(list, null, 2)};\n`;
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`Replaced ${rep.oldId} -> ${rep.newData.id} in ${rep.file}`);
  } else {
    console.warn(`Could not find ${rep.oldId} in ${rep.file}`);
  }
}

