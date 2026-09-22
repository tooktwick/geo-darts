const fs = require('fs');

const replacements = [
  {
    oldId: 'quiz_nikko',
    newObj: {
      id: 'quiz_kegon',
      landmarkId: 'tochigi_kegon',
      prefId: 9,
      category: 'nature',
      title: '落差97メートルの大瀑布・日本三大名瀑',
      prompt: '中禅寺湖の水が高さ97メートルの断崖を一気に落下する、轟音と水煙が圧倒的な日本三名瀑の一つはどこ？',
      hints: [
        'エレベーターで岩盤を100メートル下りた観瀑台から、滝壺の迫力を間近で体感できます。',
        '初夏の新緑、秋の鮮やかな紅葉、そして冬には細い滝が凍結してブルーアイスとなる景観で知られます。',
        '栃木県日光市中宮祠に位置する「華厳の滝（けごんのたき）」。奥日光の入り口にあります。'
      ],
      explanation: '華厳の滝は那智の滝、袋田の滝とともに日本三名瀑に数えられます。勝道上人が発見したと伝えられ、仏教経典の華厳経から名付けられました。'
    }
  },
  {
    oldId: 'quiz_kusatsu',
    newObj: {
      id: 'quiz_tomioka',
      landmarkId: 'gunma_tomioka',
      prefId: 10,
      category: 'heritage',
      title: '日本の近代化とシルク産業を支えた官営模範製糸場',
      prompt: '明治5年に明治政府が設立した日本初の本格的な機械製糸工場。木骨煉瓦造の巨大な繭倉庫や繰糸場が良好に保存された世界文化遺産はどこ？',
      hints: [
        'フランス人技術者ポール・ブリュナの指導のもと建設され、全国から集まった工女たちが技術を学びました。',
        '高品質な生糸を大量生産して外貨を獲得し、日本の産業革命と近代化の礎を築きました。',
        '群馬県富岡市富岡に位置する「富岡製糸場（とみおかせいしじょう）」。'
      ],
      explanation: '富岡製糸場は2014年に「富岡製糸場と絹産業遺産群」として世界文化遺産に登録されました。ほぼ完全な形で創業当時の建物群が残る貴重な産業遺産です。'
    }
  },
  {
    oldId: 'quiz_kawagoe',
    newObj: {
      id: 'quiz_nagatoro',
      landmarkId: 'saitama_nagatoro',
      prefId: 11,
      category: 'nature',
      title: '荒川の清流と畳を敷き詰めたような結晶片岩',
      prompt: '幅80m・長さ500mにわたり薄い板状の岩層が何段にも重なる国指定特別天然記念物。船頭が巧みに竿を操る川下りが名物の景勝地はどこ？',
      hints: [
        '「地球の窓」とも称され、地質学上極めて貴重な岩石露出地として日本地質学発祥の地の一つに挙げられます。',
        '春には桜並木、秋には紅葉が荒川の両岸を彩り、秩父鉄道の長瀞駅から徒歩圏内に広がります。',
        '埼玉県秩父郡長瀞町にある「長瀞岩畳（ながとろいわだたみ）」。荒川ライン下りで有名です。'
      ],
      explanation: '長瀞岩畳は荒川の浸食によってできた河岸段丘と結晶片岩の景勝地です。平らな岩が畳を敷き詰めたように広がることから「岩畳」と呼ばれます。'
    }
  },
  {
    oldId: 'quiz_sadogold',
    newObj: {
      id: 'quiz_kiyotsukyo',
      landmarkId: 'niigata_kiyotsukyo',
      prefId: 15,
      category: 'nature',
      title: '水鏡が映す柱状節理のパノラマアート',
      prompt: '黒部峡谷・大杉谷とともに日本三大峡谷の一つ。全長750mのトンネル最奥部で水面に外の景色が映り込むアート作品が世界的人気となった場所はどこ？',
      hints: [
        '中国の建築家集団MADアーキテクツがリニューアルを手がけた「Tunnel of Light」が「大地の芸術祭」で誕生しました。',
        '清津川の清流を挟んで巨大な柱状節理の岩壁がV字型に切り立ち、国の名勝・天然記念物に指定されています。',
        '新潟県十日町市小出に位置する「清津峡渓谷トンネル（きよつきょう）」。'
      ],
      explanation: '清津峡は柱状節理の岸壁が連なる壮大な峡谷です。トンネル先端のパノラマステーションでは、床一面に張られた水が水鏡となり、自然の渓谷美と人が一体となる絶景を生み出します。'
    }
  },
  {
    oldId: 'quiz_nagoya_castle',
    newObj: {
      id: 'quiz_atsuta',
      landmarkId: 'aichi_atsuta',
      prefId: 23,
      category: 'shrine_temple',
      title: '三種の神器「草薙神剣」を祀る熱田の杜',
      prompt: '三種の神器の一つである「草薙神剣（くさなぎのみつるぎ）」を御神体として奉斎し、織田信長が桶狭間の戦い前に戦勝祈願した古社はどこ？',
      hints: [
        '「熱田さま」と親しまれ、信長が勝利の御礼に奉納した瓦屋根の土塀「信長塀（のぶながべい）」が現存しています。',
        '名物の宮きしめんや、神剣をモチーフにした刀剣展示施設「剣の宝庫 草薙館」も見どころです。',
        '愛知県名古屋市熱田区神宮に鎮座する「熱田神宮（あつたじんぐう）」。'
      ],
      explanation: '熱田神宮は景行天皇43年創建と伝わる由緒ある大社です。年間700万人以上の参拝者が訪れ、伊勢神宮に次ぐ格式の高い神社として崇敬されています。'
    }
  },
  {
    oldId: 'quiz_sensoji',
    newObj: {
      id: 'quiz_meijijingu',
      landmarkId: 'tokyo_meijijingu',
      prefId: 13,
      category: 'shrine_temple',
      title: '都心の広大な鎮守の杜と初詣日本一の大社',
      prompt: '明治天皇と昭憲皇太后を祀り、全国から献木された約10万本の樹木で100年かけて造成された人工の原生林に抱かれる神社はどこ？',
      hints: [
        '例年の初詣参拝者数は約300万人と日本一を記録し、原宿駅や代々木駅のすぐ隣に位置しながら静寂に包まれています。',
        '南参道と北参道が合流する場所には、台湾産ヒノキを使用した高さ12mの日本最大の木造明神鳥居（大鳥居）がそびえます。',
        '東京都渋谷区代々木神園町に鎮座する「明治神宮（めいじじんぐう）」。'
      ],
      explanation: '明治神宮は1920年に創建されました。約70ヘクタールの境内地は、全国の青年団の勤労奉仕と全国からの献木により、永遠に続く自然林を目指して計画された人工林です。'
    }
  }
];

let content = fs.readFileSync('src/data/quizData.ts', 'utf8');

// 最初の36問はそのままにし、37問目以降の重複IDを置換
for (const rep of replacements) {
  // 37問目以降にある oldId のブロックを見つけて置換
  // 最初の oldId は飛ばす
  const firstPos = content.indexOf(`id: '${rep.oldId}'`);
  if (firstPos === -1) continue;
  
  const secondPos = content.indexOf(`id: '${rep.oldId}'`, firstPos + 10);
  if (secondPos === -1) {
    console.log(`Only 1 instance of ${rep.oldId}, skipping replacement`);
    continue;
  }

  // secondPos を含むオブジェクトブロックを置き換える
  // { から } までの範囲
  const blockStart = content.lastIndexOf('{', secondPos);
  const blockEnd = content.indexOf('}', secondPos) + 1;

  const newBlock = `{\n    id: '${rep.newObj.id}',\n    landmarkId: '${rep.newObj.landmarkId}',\n    prefId: ${rep.newObj.prefId},\n    category: '${rep.newObj.category}',\n    title: '${rep.newObj.title}',\n    prompt: '${rep.newObj.prompt}',\n    hints: [\n      '${rep.newObj.hints[0]}',\n      '${rep.newObj.hints[1]}',\n      '${rep.newObj.hints[2]}'\n    ],\n    explanation: '${rep.newObj.explanation}'\n  }`;

  content = content.substring(0, blockStart) + newBlock + content.substring(blockEnd);
  console.log(`Replaced second instance of ${rep.oldId} -> ${rep.newObj.id}`);
}

fs.writeFileSync('src/data/quizData.ts', content, 'utf8');
console.log('Finished fixing duplicate quiz entries.');

