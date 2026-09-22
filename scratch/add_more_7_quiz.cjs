const fs = require('fs');

const more7 = [
  // 74. 東京都: 浅草寺・雷門
  {
    id: 'quiz_sensoji',
    landmarkId: 'tokyo_sensoji',
    prefId: 13,
    category: 'shrine_temple',
    title: '都内最古の寺院と「雷門」の赤提灯',
    prompt: '推古天皇の時代に宮戸川（現・隅田川）から引き上げられた聖観世音菩薩を本尊とし、「雷門」の大提灯が象徴的な都内最古の寺院はどこ？',
    hints: [
      '雷門の正式名称は「風雷神門」であり、松下幸之助が寄進した重さ約700kgの巨大な赤提灯が掲げられています。',
      '雷門から宝蔵門へと続く「仲見世通り」には、人形焼や雷おこしなど伝統的な江戸の下町銘菓が並びます。',
      '東京都台東区浅草二丁目に位置する「浅草寺（せんそうじ）」。国内外から年間約3000万人が訪れます。'
    ],
    explanation: '浅草寺は628年に創建された都内最古の寺です。江戸時代には徳川家康によって幕府の祈願所に指定され、下町文化の中心として栄えました。'
  },
  // 75. 神奈川県: 鎌倉大仏・高徳院
  {
    id: 'quiz_kamakura_daibutsu',
    landmarkId: 'kanagawa_kamakura',
    prefId: 14,
    category: 'shrine_temple',
    title: '青空の下に静座する国宝の露座大仏',
    prompt: 'かつては大仏殿の中に安置されていたものの、津波や台風で堂宇が倒壊し、以来500年以上も露座（屋外）のまま鎮座する国宝の大仏はどこ？',
    hints: [
      '像高約11.3m（台座含め約13.35m）、重量約121トンを誇る阿弥陀如来坐像で、胎内に入って内側を見学することもできます。',
      '与謝野晶子が「美男におわす」と歌ったことでも知られ、江ノ島電鉄（江ノ電）の長谷駅から徒歩約7分です。',
      '神奈川県鎌倉市長谷に位置する高徳院境内の「鎌倉大仏（国宝銅造阿弥陀如来坐像）」。'
    ],
    explanation: '鎌倉大仏は1252年頃から造立が開始されたと伝わります。大仏殿は明応7年（1498年）の大地震と大津波で流失し、現在の露座の姿となりました。'
  },
  // 76. 大阪府: 道頓堀
  {
    id: 'quiz_dotonbori',
    landmarkId: 'osaka_dotonbori',
    prefId: 27,
    category: 'modern_spot',
    title: '巨大立体看板がひしめく天下の台所・ミナミの象徴',
    prompt: '両手を挙げてゴールインするランナーのネオンサインや、動く巨大カニなどユーモラスな立体看板が運河沿いに並ぶ大阪の歓楽街はどこ？',
    hints: [
      '江戸時代初期に安井道頓らが私財を投じて開削した運河が名前の由来で、芝居町として大いに栄えました。',
      'たこ焼き、お好み焼き、串かつなどの「食い倒れ」グルメが集結し、戎橋（えびすばし、通称ひっかけ橋）は記念撮影の定番です。',
      '大阪府大阪市中央区のミナミを代表する繁華街「道頓堀（どうとんぼり）」。'
    ],
    explanation: '道頓堀は江戸時代に劇場街として開発され、現在は大阪グルメと独自のネオンサイン看板が連なる世界的な観光名所となっています。'
  },
  // 77. 京都府: 伏見稲荷大社
  {
    id: 'quiz_fushimiinari',
    landmarkId: 'kyoto_fushimi',
    prefId: 26,
    category: 'shrine_temple',
    title: '朱色の鳥居が果てしなく続く「千本鳥居」の聖地',
    prompt: '稲荷山の山頂まで朱塗りの鳥居が隙間なく連なる「千本鳥居」が世界中の観光客を魅了する、全国約3万社の稲荷神社の総本宮はどこ？',
    hints: [
      '五穀豊穣、商売繁昌、家内安全の神として信仰され、神の使いとされるキツネ（白狐）の像が境内の至る所に鎮座しています。',
      '願掛けの成否を占う「おもかる石」があり、奥社奉拝所から山頂の一ノ峰までのお山巡りは約2時間の参拝登山コースです。',
      '京都府京都市伏見区深草に鎮座する「伏見稲荷大社（ふしみいなりたいしゃ）」。JR奈良線の稲荷駅すぐ。'
    ],
    explanation: '伏見稲荷大社は711年に創建されました。千本鳥居は江戸時代から明治以降に祈願や感謝の印として信者から奉納されたもので、山全体で約1万基の鳥居が並びます。'
  },
  // 78. 長野県: 信州善光寺
  {
    id: 'quiz_zenkoji',
    landmarkId: 'nagano_zenkoji',
    prefId: 20,
    category: 'shrine_temple',
    title: '「牛に引かれて善光寺参り」と暗闇のお戒壇巡り',
    prompt: '特定の宗派に属さない無宗派の寺院として古くから全国の庶民の信仰を集め、真っ暗な地下通路を手探りで進む「お戒壇巡り」で知られる名刹はどこ？',
    hints: [
      '本尊の一光三尊阿弥陀如来は日本最古の仏像とされ、絶対の秘仏となっています。数え年で7年に一度「御開帳」が行われます。',
      '国宝の本堂は木造建築として東日本最大級の規模を誇り、撞木造り（しゅもくづくり）と呼ばれる独特の屋根形状を持ちます。',
      '長野県長野市元善町に位置する「信州善光寺（ぜんこうじ）」。長野駅から表参道が一直線に伸びています。'
    ],
    explanation: '善光寺は「一生に一度は善光寺参り」と言われ、宗派を問わず誰でも極楽往生できるとして平安時代から篤い信仰を集めています。お戒壇巡りでは「極楽のお錠前」に触れることで御本尊と結縁できるとされます。'
  },
  // 79. 静岡県: 三保松原
  {
    id: 'quiz_miho',
    landmarkId: 'shizuoka_miho',
    prefId: 22,
    category: 'nature',
    title: '白砂青松の海岸越しに富士山を仰ぐ「羽衣伝説」の地',
    prompt: '約3万本の松が茂る約5kmの海岸線から、駿河湾の波越しに雄大な富士山を望む絶景地。天女が羽衣を松に掛けたという伝説が残る名勝はどこ？',
    hints: [
      '歌川広重の浮世絵をはじめ多くの絵画や和歌の題材となり、2013年に富士山世界文化遺産の構成資産に登録されました。',
      '境内には樹齢650年とされる「羽衣の松」があり、御穂神社へと続く松並木の参道「神の道」が整備されています。',
      '静岡県静岡市清水区の三保半島に位置する「三保松原（みほのまつばら）」。'
    ],
    explanation: '三保松原は日本新三景や日本三大松原の一つに数えられます。天女と地元の漁師の交流を描いた「羽衣伝説」は能の演目としても有名です。'
  },
  // 80. 沖縄県: 沖縄美ら海水族館
  {
    id: 'quiz_churaumi',
    landmarkId: 'okinawa_churaumi',
    prefId: 47,
    category: 'modern_spot',
    title: '巨大アクリルパネル越しに泳ぐジンベエザメとナンヨウマンタ',
    prompt: '高さ8.2m・幅22.5mの巨大水槽「黒潮の海」で、複数の巨大なジンベエザメやナンヨウマンタが群れ泳ぐ姿で世界中を魅了する水族館はどこ？',
    hints: [
      '海洋博公園内に位置し、沖縄のサンゴ礁から深海までを再現した世界屈指の大規模水族館です。',
      '屋外の「オキちゃん劇場」ではイルカたちの楽しいショーが無料で楽しめ、エメラルドグリーンの東シナ海を一望できます。',
      '沖縄県国頭郡本部町に位置する「沖縄美ら海水族館（ちゅらうみすいぞくかん）」。那覇空港から車で約2時間です。'
    ],
    explanation: '沖縄美ら海水族館は世界最大の魚類ジンベエザメの長期飼育や繁殖に世界で初めて成功するなど、学術的にも世界最高水準の展示技術を誇る人気スポットです。'
  }
];

const content = fs.readFileSync('src/data/quizData.ts', 'utf8');
const endIdx = content.lastIndexOf('];');
const before = content.substring(0, endIdx);
const after = content.substring(endIdx);

let additions = '\n';
for (let i = 0; i < more7.length; i++) {
  const q = more7[i];
  additions += `  // ${74 + i}. prefId ${q.prefId}: ${q.title}\n`;
  additions += `  {\n`;
  additions += `    id: '${q.id}',\n`;
  additions += `    landmarkId: '${q.landmarkId}',\n`;
  additions += `    prefId: ${q.prefId},\n`;
  additions += `    category: '${q.category}',\n`;
  additions += `    title: '${q.title}',\n`;
  additions += `    prompt: '${q.prompt}',\n`;
  additions += `    hints: [\n`;
  additions += `      '${q.hints[0]}',\n`;
  additions += `      '${q.hints[1]}',\n`;
  additions += `      '${q.hints[2]}'\n`;
  additions += `    ],\n`;
  additions += `    explanation: '${q.explanation}'\n`;
  additions += `  },\n`;
}

fs.writeFileSync('src/data/quizData.ts', before + additions + after, 'utf8');
console.log('SUCCESS: Added 7 more questions! Total 80 questions.');

