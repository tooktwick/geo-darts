import { RallyCourse, Landmark } from './types';
import { getLandmarkById } from './data/landmarksData';

export const RALLY_COURSES: RallyCourse[] = [
  {
    id: 'shinkansen_route',
    title: '東海道・山陽新幹線 名所ラリー',
    subTitle: '東京から博多へ！大動脈の名所を駆け抜ける旅',
    description: '東京を出発し、太平洋側・瀬戸内沿岸の主要都市を代表する名所を順番に射貫いて博多を目指す王道コースです。',
    icon: '🚅',
    color: '#0284c7',
    difficulty: '初級',
    // 11名所を順番にラリー走破
    checkpoints: [
      'tokyo_tower',                 // 東京: 東京タワー
      'kanagawa_kamakura',           // 神奈川: 鎌倉大仏 (高徳院)
      'shizuoka_miho',               // 静岡: 三保の松原
      'aichi_nagoya_castle',         // 愛知: 名古屋城・金鯱
      'kyoto_kinkakuji',             // 京都: 鹿苑寺 (金閣寺)
      'osaka_castle',                // 大阪: 大阪城天守閣
      'hyogo_himejijo',              // 兵庫: 国宝姫路城 (白鷺城)
      'okayama_kurashiki',           // 岡山: 倉敷美観地区
      'hiroshima_itsukushima',       // 広島: 厳島神社・大鳥居
      'yamaguchi_kintaikyo',         // 山口: 岩国・錦帯橋
      'fukuoka_dazaifu',             // 福岡: 太宰府天満宮
    ],
  },
  {
    id: 'world_heritage',
    title: '日本の世界遺産名所めぐり',
    subTitle: '悠久の歴史と雄大な自然の宝を体感',
    description: '日光東照宮、白川郷、古都京都、奈良の大仏、姫路城、厳島神社、屋久島、首里城など日本の世界遺産名所を巡ります。',
    icon: '⛩️',
    color: '#ca8a04',
    difficulty: '中級',
    // 8大世界遺産名所
    checkpoints: [
      'tochigi_nikko',               // 栃木: 日光東照宮
      'gifu_shirakawago',            // 岐阜: 白川郷合掌造り
      'kyoto_kiyomizudera',          // 京都: 清水寺・清水の舞台
      'nara_todaiji',                // 奈良: 東大寺大仏殿
      'hyogo_himejijo',              // 兵庫: 国宝姫路城 (白鷺城)
      'hiroshima_itsukushima',       // 広島: 厳島神社・大鳥居
      'kagoshima_yakushima',         // 鹿児島: 屋久島・縄文杉
      'okinawa_shurijo',             // 沖縄: 首里城跡
    ],
  },
  {
    id: 'gourmet_trail',
    title: '天下の絶品グルメ名所街道',
    subTitle: '日本列島うまかもん食べ歩きラリー',
    description: '小樽運河の海鮮から仙台牛たん、築地場外市場、名古屋めし、道頓堀粉もん、讃岐うどん、博多ラーメンまで名所を食べ歩き！',
    icon: '🍜',
    color: '#ea580c',
    difficulty: '中級',
    // 7大グルメ名所
    checkpoints: [
      'hokkaido_otaru',              // 北海道: 小樽運河
      'miyagi_matsushima',           // 宮城: 松島 (仙台)
      'tokyo_tsukiji',               // 東京: 築地場外市場
      'aichi_nagoya_castle',         // 愛知: 名古屋城・金鯱 (名古屋めし)
      'osaka_dotonbori',             // 大阪: 道頓堀・グリコサイン
      'kagawa_kotohira',             // 香川: 金刀比羅宮 (讃岐うどん)
      'fukuoka_dazaifu',             // 福岡: 太宰府天満宮 (博多屋台)
    ],
  },
  {
    id: 'traverse_japan',
    title: '日本列島大縦断 7大名所関門',
    subTitle: '南国の沖縄から北の果て北海道へ！',
    description: '首里城を皮切りに、桜島、桂浜、大阪城、善光寺、松島、五稜郭へと日本列島を南から北へ一気に縦断走破します。',
    icon: '🗾',
    color: '#dc2626',
    difficulty: '上級',
    // 7大関門名所
    checkpoints: [
      'okinawa_shurijo',             // 沖縄: 首里城跡
      'kagoshima_sakurajima',        // 鹿児島: 桜島
      'kochi_katsurahama',           // 高知: 桂浜・坂本龍馬像
      'osaka_castle',                // 大阪: 大阪城天守閣
      'nagano_zenkoji',              // 長野: 善光寺
      'miyagi_matsushima',           // 宮城: 日本三景・松島
      'hokkaido_goryokaku',          // 北海道: 五稜郭
    ],
  },
  {
    id: 'hotspring_tour',
    title: '日本列島 秘湯・名湯めぐり',
    subTitle: '湯煙たなびく極上の温泉郷を射抜く癒やしの旅',
    description: '北海道・登別の地獄谷から銀山温泉、天下の名湯草津、箱根、道後、別府・海地獄まで、日本の名湯6箇所を巡る温泉三昧ラリーです。',
    icon: '♨️',
    color: '#f43f5e',
    difficulty: '初級',
    checkpoints: [
      'hokkaido_jigokudani',         // 北海道: 登別地獄谷
      'yamagata_ginzan',             // 山形: 銀山温泉
      'gunma_kusatsu',               // 群馬: 草津温泉
      'kanagawa_hakone_shrine',      // 神奈川: 箱根神社・温泉郷
      'ehime_dogo',                  // 愛媛: 道後温泉
      'oita_umijigoku',              // 大分: 別府・海地獄
    ],
  },
  {
    id: 'national_castles',
    title: '国宝五城・名城覇王ラリー',
    subTitle: '天守を今に伝える至高の城郭と戦国ロマン',
    description: '国宝に指定された五大天守（松本城、犬山城、彦根城、姫路城、松江城）に名城・熊本城を加えた、城郭ファン垂涎の覇王コースです。',
    icon: '🏯',
    color: '#f59e0b',
    difficulty: '中級',
    checkpoints: [
      'nagano_matsumoto_castle',     // 長野: 国宝松本城
      'aichi_inuyama',               // 愛知: 国宝犬山城
      'shiga_hikone',                // 滋賀: 国宝彦根城
      'hyogo_himejijo',              // 兵庫: 国宝姫路城
      'shimane_matsue_castle',       // 島根: 国宝松江城
      'kumamoto_castle',             // 熊本: 熊本城
    ],
  },
  {
    id: 'three_gardens',
    title: '日本三名園・天下の名園周遊',
    subTitle: '四季の風雅と枯山水・花々が織りなす美の極致',
    description: '富良野の広大な花畑から、水戸・偕楽園、金沢・兼六園、岡山・後楽園の三名園、足立美術館、栗林公園を巡る風流な庭園街道です。',
    icon: '🌸',
    color: '#ec4899',
    difficulty: '初級',
    checkpoints: [
      'hokkaido_farmtomita',         // 北海道: ファーム富田
      'ibaraki_kairakuen',           // 茨城: 偕楽園
      'ishikawa_kenrokuen',          // 石川: 兼六園
      'okayama_korakuen',            // 岡山: 後楽園
      'shimane_adachi',              // 島根: 足立美術館
      'kagawa_ritsurin',             // 香川: 栗林公園
    ],
  },
  {
    id: 'michinoku_trail',
    title: 'みちのく奥の細道・東北探訪',
    subTitle: '松尾芭蕉の旅路と東北の豊かな自然・霊場',
    description: '会津の大内宿から松島、山寺・立石寺、世界遺産・平泉中尊寺、奥入瀬渓流へとみちのくの情景を北上しながら巡る探訪紀行です。',
    icon: '📜',
    color: '#8b5cf6',
    difficulty: '中級',
    checkpoints: [
      'fukushima_ouchijuku',         // 福島: 大内宿
      'miyagi_matsushima',           // 宮城: 日本三景・松島
      'yamagata_yamadera',           // 山形: 山寺・立石寺
      'iwate_chusonji',              // 岩手: 中尊寺金色堂
      'aomori_oirase',               // 青森: 奥入瀬渓流
    ],
  },
];

export function getRallyCourseById(id: string): RallyCourse | undefined {
  return RALLY_COURSES.find((c) => c.id === id);
}

/**
 * ラリーコースのチェックポイント名所リストを取得
 */
export function getCourseLandmarks(course: RallyCourse): Landmark[] {
  return course.checkpoints
    .map((id) => getLandmarkById(id))
    .filter((lm): lm is Landmark => lm !== undefined);
}
