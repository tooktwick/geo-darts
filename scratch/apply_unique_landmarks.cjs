const fs = require('fs');

const filePath = 'src/data/landmarksData.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 18件の置き換え定義
const replacements = [
  // 1. 青森県: aomori_sannai_maruyama
  {
    targetId: 'aomori_sannai_maruyama',
    newObj: `  {
    id: 'aomori_hasshoku_center',
    name: '八戸・八食センター',
    prefId: 2,
    description: '水揚げ日本一の八戸港から新鮮な魚介や乾物が集まる巨大市場。七輪村で海鮮焼きも堪能。',
    coordinates: { lat: 40.5286, lng: 141.4550 },
    mapOffset: [15, 30],
    category: 'gourmet',
    fameLevel: 'regional',
    localGourmet: '八戸せんべい汁・いちご煮・八戸前沖さば',
    episode: '全長170mの巨大屋内市場に約60店舗が並ぶ八戸の台所。買った新鮮な魚介をその場で七輪炭火焼きにして味わえる贅沢な体験が人気。',
  },`
  },
  // 2. 青森県: aomori_tsurunomai
  {
    targetId: 'aomori_tsurunomai',
    newObj: `  {
    id: 'aomori_aoni_onsen',
    name: '青荷温泉 (ランプの宿)',
    prefId: 2,
    description: '黒石の秘境・青荷渓谷に佇む電気のない温泉宿。石油ランプの灯りとせせらぎが幻想的。',
    coordinates: { lat: 40.5989, lng: 140.7853 },
    mapOffset: [-5, 15],
    category: 'hotspring',
    fameLevel: 'minor',
    localGourmet: '黒石つゆやきそば・津軽リンゴ',
    episode: '電波も通じない深山幽谷に湧く秘湯。夕暮れとともに灯される本物の石油ランプの淡い光が、現代人が忘れかけた郷愁と静寂をもたらす。',
  },`
  },
  // 3. 岩手県: iwate_hanamaki_spa
  {
    targetId: 'iwate_hanamaki_spa',
    newObj: `  {
    id: 'iwate_sanriku_railway',
    name: '三陸鉄道リアス線',
    prefId: 3,
    description: '太平洋のリアス海岸を縫うように走る絶景ローカル線。復興のシンボルとして全国に親しまれる。',
    coordinates: { lat: 39.6417, lng: 141.9547 },
    mapOffset: [35, -10],
    category: 'modern_spot',
    fameLevel: 'national',
    localGourmet: '三陸海鮮丼・宮古瓶ドン・南部煎餅',
    episode: '東日本大震災の甚大な被害を乗り越え全線開通を果たした奇跡の鉄路。太平洋の青い海原と断崖絶壁を車窓から望む絶景旅が楽しめる。',
  },`
  },
  // 4. 福島県: fukushima_inawashiroko
  {
    targetId: 'fukushima_inawashiroko',
    newObj: `  {
    id: 'fukushima_abukumado',
    name: 'あぶくま洞',
    prefId: 7,
    description: 'およそ8000万年という歳月をかけて創られた東洋屈指の鍾乳洞。神秘的な「滝根御殿」が圧巻。',
    coordinates: { lat: 37.3444, lng: 140.6728 },
    mapOffset: [20, 20],
    category: 'nature',
    fameLevel: 'national',
    localGourmet: '喜多方ラーメン・会津ソースカツ丼・円盤餃子',
    episode: '全長約600mの洞内には、巨大な石筍や鍾乳石が乱立。中でも高さ29mの「滝根御殿」や「月の世界」のイルミネーションは息をのむ美しさ。',
  },`
  },
  // 5. 福島県: fukushima_jododaira
  {
    targetId: 'fukushima_jododaira',
    newObj: `  {
    id: 'fukushima_iwaki_yumoto',
    name: 'いわき湯本温泉',
    prefId: 7,
    description: '奈良時代から続く日本三古湯の一つ。毎分5トンを誇る豊富な湯量と美肌効果で名高い温泉街。',
    coordinates: { lat: 36.9856, lng: 140.8525 },
    mapOffset: [35, 45],
    category: 'hotspring',
    fameLevel: 'regional',
    localGourmet: 'めひかり唐揚げ・いわき前浜海鮮',
    episode: '道後・有馬と並び「三函の湯」として古今和歌集にも詠まれた歴史ある名湯。炭鉱の町からフラガールの町へと再生した歴史も刻む。',
  },`
  },
  // 6. 福島県: fukushima_shirakawa_komine
  {
    targetId: 'fukushima_shirakawa_komine',
    newObj: `  {
    id: 'fukushima_ashinomaki',
    name: '会津・芦ノ牧温泉',
    prefId: 7,
    description: '大川渓谷の断崖に寄り添う開湯千二百年の秘湯。会津鉄道のねこ駅長で知られる芦ノ牧温泉駅も至近。',
    coordinates: { lat: 37.3886, lng: 139.9142 },
    mapOffset: [-25, 30],
    category: 'hotspring',
    fameLevel: 'minor',
    localGourmet: '会津名物ねぎそば・馬刺し',
    episode: '渓谷の深い緑と四季折々の紅葉、雪景色に包まれた絶壁の露天風呂が自慢の古湯。湯守の温かなもてなしと清流の音が旅情を誘う。',
  },`
  },
  // 7. 栃木県: tochigi_chuzenjiko
  {
    targetId: 'tochigi_chuzenjiko',
    newObj: `  {
    id: 'tochigi_edowonderland',
    name: '江戸ワンダーランド 日光江戸村',
    prefId: 9,
    description: '街道、宿場、商家街、忍者の里など江戸時代の町並みを忠実に再現したカルチャーパーク。',
    coordinates: { lat: 36.7906, lng: 139.7028 },
    mapOffset: [-10, -5],
    category: 'heritage',
    fameLevel: 'national',
    localGourmet: '日光湯波（ゆば）料理・宇都宮餃子',
    episode: 'ちょんまげの侍や着物姿の町人が行き交い、迫力の忍者活劇や花魁道中を体感できる。江戸情緒にタイムスリップしたような体験が国内外で大人気。',
  },`
  },
  // 8. 栃木県: tochigi_kinugawa_spa
  {
    targetId: 'tochigi_kinugawa_spa',
    newObj: `  {
    id: 'tochigi_nasu_animal_kingdom',
    name: '那須どうぶつ王国',
    prefId: 9,
    description: '那須高原の雄大な自然の中で、世界各地の動物たちと間近にふれあえる人気テーマパーク。',
    coordinates: { lat: 37.1350, lng: 140.0169 },
    mapOffset: [10, -45],
    category: 'spot',
    fameLevel: 'regional',
    localGourmet: '那須高原和牛・那須御養卵・宇都宮餃子',
    episode: 'カピバラやマヌルネコなど愛らしい動物たちの自然な生態を間近に観察でき、広大なドッグランやバードパフォーマンスショーが評判。',
  },`
  },
  // 9. 群馬県: gunma_ikaho_steps
  {
    targetId: 'gunma_ikaho_steps',
    newObj: `  {
    id: 'gunma_tanigawadake_ropeway',
    name: '谷川岳ロープウェイ・天神平',
    prefId: 10,
    description: '日本百名山・谷川岳の険しい岩壁と広大な雲海を一望できる絶景ロープウェイ。',
    coordinates: { lat: 36.8331, lng: 138.9669 },
    mapOffset: [15, -45],
    category: 'nature',
    fameLevel: 'regional',
    localGourmet: '水沢うどん・おっきりこみ・焼きまんじゅう',
    episode: '標高1,319mの天神平まで約10分で到達。春から秋の高山植物、秋の錦秋の紅葉、冬の極上パウダースノーと四季を通じてアルプスの絶景が広がる。',
  },`
  },
  // 10. 群馬県: gunma_shima_spa
  {
    targetId: 'gunma_shima_spa',
    newObj: `  {
    id: 'gunma_minakami_onsen',
    name: '水上温泉郷 (利根川源流)',
    prefId: 10,
    description: '利根川上流の渓谷沿いに広がる名湯。ラフティングやキャニオニングなどアウトドアの拠点としても活況。',
    coordinates: { lat: 36.7725, lng: 138.9972 },
    mapOffset: [20, -35],
    category: 'hotspring',
    fameLevel: 'regional',
    localGourmet: 'みなかみダムカレー・上州牛',
    episode: '諏訪峡や水上峡の奇岩・絶壁を望む露天風呂が点在。清流のせせらぎを聞きながら湯あみを楽しめる北関東屈指の温泉リゾート。',
  },`
  },
  // 11. 千葉県: chiba_kamogawa_seaworld
  {
    targetId: 'chiba_kamogawa_seaworld',
    newObj: `  {
    id: 'chiba_narita_airport_sakura',
    name: '成田国際空港・さくらの山公園',
    prefId: 12,
    description: '日本の表玄関・成田空港の滑走路脇に位置し、世界中の航空機が大迫力で離着陸する絶景ビュースポット。',
    coordinates: { lat: 35.7831, lng: 140.3886 },
    mapOffset: [25, -20],
    category: 'modern_spot',
    fameLevel: 'national',
    localGourmet: '成田山門前うなぎ・勝浦タンタンメン',
    episode: '春には約350本の桜が咲き誇り、満開の桜並木の上を巨大旅客機が轟音とともに飛び交う圧巻の情景は世界中の航空ファンや観光客を魅了する。',
  },`
  },
  // 12. 千葉県: chiba_yoro_ravine
  {
    targetId: 'chiba_yoro_ravine',
    newObj: `  {
    id: 'chiba_ichihara_elephant',
    name: '市原ぞうの国 (アニマルワンダーリゾウント)',
    prefId: 12,
    description: '日本最多の象が暮らす動物リゾート。象たちのダイナミックなショーやふれあいが人気。',
    coordinates: { lat: 35.3486, lng: 140.1650 },
    mapOffset: [5, 10],
    category: 'spot',
    fameLevel: 'regional',
    localGourmet: 'なめろう・さんが焼き・房総海鮮丼',
    episode: '象の背中に乗ったりおやつをあげたり、象がお絵かきやサッカーを披露するショーが名物。緑豊かな房総丘陵で動物たちと心を通わせる癒やしの楽園。',
  },`
  },
  // 13. 福井県: fukui_echizen_matsushima_aqua
  {
    targetId: 'fukui_echizen_matsushima_aqua',
    newObj: `  {
    id: 'fukui_tsuruga_redbrick',
    name: '敦賀赤レンガ倉庫・気比の松原',
    prefId: 18,
    description: '国際港として栄えた敦賀の明治期レンガ建築と、日本三大松原に数えられる白砂青松の名勝。',
    coordinates: { lat: 35.6603, lng: 136.0758 },
    mapOffset: [15, 30],
    category: 'heritage',
    fameLevel: 'regional',
    localGourmet: '越前ガニ・越前おろしそば・ソースカツ丼',
    episode: '日本海とロシア・ヨーロッパを結ぶ玄関口だった敦賀港。明治の赤レンガ倉庫内には巨大ジオラマが広がり、気比の松原の美しい海岸線とともに歴史を物語る。',
  },`
  },
  // 14. 山梨県: yamanashi_oshino_hakkai
  {
    targetId: 'yamanashi_oshino_hakkai',
    newObj: `  {
    id: 'yamanashi_fuji_5th_station',
    name: '富士山五合目・小御岳神社',
    prefId: 19,
    description: '標高2,305m、富士スバルライン終点に広がる天地の境。雲海の上に聳える霊峰富士を間近に仰ぐ。',
    coordinates: { lat: 35.3686, lng: 138.7308 },
    mapOffset: [5, 25],
    category: 'shrine_temple',
    fameLevel: 'national',
    localGourmet: '甲州ほうとう・吉田のうどん・鳥もつ煮',
    episode: '平安時代創建の小御岳神社が鎮座し、古くから富士講の行者たちが身を清めて山頂を目指した聖地。眼下に広がる広大な雲海と富士五湖の眺望は圧巻。',
  },`
  },
  // 15. 兵庫県: hyogo_arima_onsen
  {
    targetId: 'hyogo_arima_onsen',
    newObj: `  {
    id: 'hyogo_akashi_planetarium',
    name: '明石市立天文科学館 (子午線のまち)',
    prefId: 28,
    description: '東経135度日本標準時子午線上に建つ時計塔。日本最古の現役プラネタリウムが星空を届ける。',
    coordinates: { lat: 34.6494, lng: 135.0017 },
    mapOffset: [-10, 10],
    category: 'modern_spot',
    fameLevel: 'regional',
    localGourmet: '明石焼き（玉子焼）・神戸牛・播州赤穂塩',
    episode: '日本の「時」の基準となる東経135度子午線が館内を貫く。昭和35年から時を刻み続ける塔時計とツァイス製プラネタリウムは国の登録有形文化財。',
  },`
  },
  // 16. 広島県: hiroshima_genbaku_dome
  {
    targetId: 'hiroshima_genbaku_dome',
    newObj: `  {
    id: 'hiroshima_tomonoura_taichoro',
    name: '鞆の浦・福禅寺対潮楼',
    prefId: 34,
    description: '瀬戸内海の潮待ちの港町に建つ寺院。客殿「対潮楼」から望む弁天島や仙酔島の絶景は日東第一形勝と称えられた。',
    coordinates: { lat: 34.3822, lng: 133.3828 },
    mapOffset: [35, 15],
    category: 'heritage',
    fameLevel: 'regional',
    localGourmet: '広島お好み焼き・牡蠣の土手鍋・尾道ラーメン',
    episode: '江戸時代、朝鮮通信使の正使が「日東第一形勝（朝鮮より東で一番の景勝地）」と感嘆した座敷。柱を額縁に見立てて眺める瀬戸内海の多島美は息をのむ美しさ。',
  },`
  },
  // 17. 徳島県: tokushima_otsukamuseum
  {
    targetId: 'tokushima_otsukamuseum',
    newObj: `  {
    id: 'tokushima_bizan_ropeway',
    name: '眉山ロープウェイ・徳島市街展望',
    prefId: 36,
    description: '万葉集にも詠まれた徳島市のシンボル眉山。山頂からは徳島平野、吉野川河口、淡路島まで一望。',
    coordinates: { lat: 34.0700, lng: 134.5450 },
    mapOffset: [10, -5],
    category: 'modern_spot',
    fameLevel: 'regional',
    localGourmet: '徳島ラーメン・鳴門鯛・祖谷そば',
    episode: 'どの方向から眺めても眉の形に見えることから名付けられた霊峰。阿波おどり会館5階からロープウェイで約6分、夜には四国屈指の煌めく夜景が広がる。',
  },`
  },
  // 18. 長崎県: nagasaki_peace_park
  {
    targetId: 'nagasaki_peace_park',
    newObj: `  {
    id: 'nagasaki_unzen_fugendake',
    name: '雲仙・普賢岳・平成新山',
    prefId: 42,
    description: '平成の火山活動で誕生した長崎県最高峰（標高1,483m）。ダイナミックな溶岩ドームと大自然の息吹。',
    coordinates: { lat: 32.7614, lng: 130.2989 },
    mapOffset: [25, 25],
    category: 'nature',
    fameLevel: 'regional',
    localGourmet: '長崎ちゃんぽん・皿うどん・佐世保バーガー・カステラ',
    episode: '日本最初の国立公園・雲仙に聳える活火山。平成噴火で生じた巨大な平成新山の溶岩円頂丘は、地球の鼓動を間近に体感できる世界的ジオパーク。',
  },`
  },
];

let replacedCount = 0;
for (const r of replacements) {
  // id: 'targetId' を含むオブジェクト全体を正規表現で探して置換
  // パターン: \s*\{\s*id:\s*'targetId'[\s\S]*?\n\s*\},
  const regex = new RegExp(`\\s*\\{[\\s\\n]*id:\\s*'${r.targetId}'[\\s\\S]*?\\n\\s*\\},`, 'g');
  if (regex.test(content)) {
    content = content.replace(regex, '\n' + r.newObj);
    replacedCount++;
    console.log(`Replaced: ${r.targetId}`);
  } else {
    console.error(`FAILED to find: ${r.targetId}`);
  }
}

console.log(`Total replaced: ${replacedCount} / ${replacements.length}`);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully wrote updated landmarksData.ts');
