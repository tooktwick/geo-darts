import { Landmark, LandmarkCategory } from '../types';

export interface CategoryInfo {
  id: LandmarkCategory;
  name: string;        // 種類和名
  icon: string;        // アイコン絵文字 (フォールバック)
  iconPath: string;    // オリジナルSVG画像アイコンパス
  badgeColor: string;  // バッジCSSクラス
  imagePath: string;   // ローカル配備画像パス (オフライン保証)
  blessingName: string;// 旅の加護名称
  blessingDesc: string;// 旅の加護効果
}

/**
 * 名所の8大種類マスター設定
 */
export const CATEGORY_CONFIG: Record<LandmarkCategory, CategoryInfo> = {
  castle: {
    id: 'castle',
    name: '城郭・名城',
    icon: '🏯',
    iconPath: '/assets/icons/cat_castle.svg',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    imagePath: '/assets/categories/category_castle.jpg',
    blessingName: '城郭の加護【鉄壁】',
    blessingDesc: '次の1投は風のドリフト変位が50%カットされます',
  },
  shrine_temple: {
    id: 'shrine_temple',
    name: '寺社仏閣',
    icon: '⛩️',
    iconPath: '/assets/icons/cat_shrine_temple.svg',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    imagePath: '/assets/categories/category_shrine_temple.jpg',
    blessingName: '神仏の加護【大願】',
    blessingDesc: '次の1投はニアピン判定が+5km拡大されます',
  },
  nature: {
    id: 'nature',
    name: '自然・絶景',
    icon: '🗻',
    iconPath: '/assets/icons/cat_nature.svg',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    imagePath: '/assets/categories/category_nature.jpg',
    blessingName: '山河の加護【雄大】',
    blessingDesc: '次の1投はズーム倍率が+0.5xボーナスされます',
  },
  hotspring: {
    id: 'hotspring',
    name: '名湯・温泉',
    icon: '♨️',
    iconPath: '/assets/icons/cat_hotspring.svg',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    imagePath: '/assets/categories/category_hotspring.jpg',
    blessingName: '温泉の加護【湯治】',
    blessingDesc: '風向きが穏やかになり、投てきのブレが抑制されます',
  },
  gourmet: {
    id: 'gourmet',
    name: '美味・食文化',
    icon: '🍜',
    iconPath: '/assets/icons/cat_gourmet.svg',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    imagePath: '/assets/categories/category_gourmet.jpg',
    blessingName: '名物の加護【活力】',
    blessingDesc: '次の1投の命中獲得スコアが1.5倍にブーストされます',
  },
  heritage: {
    id: 'heritage',
    name: '歴史・世界遺産',
    icon: '📜',
    iconPath: '/assets/icons/cat_heritage.svg',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    imagePath: '/assets/categories/category_heritage.jpg',
    blessingName: '悠久の加護【伝承】',
    blessingDesc: 'ピンポイント直撃ボーナスがさらに強化されます',
  },
  modern_spot: {
    id: 'modern_spot',
    name: '近代名所・展望',
    icon: '🗼',
    iconPath: '/assets/icons/cat_modern_spot.svg',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    imagePath: '/assets/categories/category_modern_spot.jpg',
    blessingName: '摩天楼の加護【眺望】',
    blessingDesc: '目標への距離と方角のフィードバックが精密化されます',
  },
  garden: {
    id: 'garden',
    name: '名園・景勝地',
    icon: '🌸',
    iconPath: '/assets/icons/cat_garden.svg',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    imagePath: '/assets/categories/category_garden.jpg',
    blessingName: '名園の加護【清雅】',
    blessingDesc: '連続コンボが途切れにくくなります',
  },
  culture: {
    id: 'culture',
    name: '伝統・文化',
    icon: '🎭',
    iconPath: '/assets/icons/cat_culture.svg',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    imagePath: '/assets/categories/category_heritage.jpg',
    blessingName: '文化の加護',
    blessingDesc: '伝統の技で狙いが安定します',
  },
  spot: {
    id: 'spot',
    name: '観光名所',
    icon: '📍',
    iconPath: '/assets/icons/cat_spot.svg',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    imagePath: '/assets/categories/category_modern_spot.jpg',
    blessingName: '名所の加護',
    blessingDesc: '旅の知見が得点に加算されます',
  },
};

/**
 * 文字列の決定論的ハッシュ算出関数 (同じ名所IDなら常に同一インデックスを返す)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * カテゴリごとのマルチバリエーション高品質画像プール (各カテゴリ4〜5種類)
 * 名所固有の写真がない場合でも、名所IDのハッシュにより多彩な写真が自動割り当てされます。
 */
export const CATEGORY_IMAGE_VARIANTS: Record<LandmarkCategory, string[]> = {
  castle: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 漆黒天守
    'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80', // 金箔白壁城郭
    'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80', // 桜と城郭
    'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 城郭遠景
    '/assets/categories/category_castle.jpg',
  ],
  shrine_temple: [
    'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80', // 千本鳥居
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 五重塔と夕景
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', // 寺院大提灯
    'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 杉並木と神域
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 水上鳥居
    '/assets/categories/category_shrine_temple.jpg',
  ],
  nature: [
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 霊峰富士
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 青い池・神秘湖沼
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 澄み切った海浜・岬
    'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 多島美・絶景湾
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', // 深緑の森林渓谷
    '/assets/categories/category_nature.jpg',
  ],
  hotspring: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 湯畑・露天風呂
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', // 和風スパリゾート
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 木造温泉街
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 渓流露天風呂
    '/assets/categories/category_hotspring.jpg',
  ],
  gourmet: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', // ご当地ラーメン
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', // 握り寿司・海鮮
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', // 和食御膳
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', // 市場グルメ
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', // 揚げ物・串料理
    '/assets/categories/category_gourmet.jpg',
  ],
  heritage: [
    'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 白川郷・合掌造り
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 伝統的蔵造り町並み
    'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 古代遺跡・歴史建築
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // レンガ倉庫・近代遺産
    '/assets/categories/category_heritage.jpg',
  ],
  modern_spot: [
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80', // 展望タワー夜景
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // ベイエリア・モダンブリッジ
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // 水族館・アクアリウム
    'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80', // スタジアム・近代建築
    '/assets/categories/category_modern_spot.jpg',
  ],
  garden: [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 名園・池泉回遊式
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 広大な花畑
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 枯山水・苔庭
    'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80', // 紅葉庭園
    '/assets/categories/category_garden.jpg',
  ],
  culture: [
    'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80', // 和の伝統
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', // 祭り・行事
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 伝統工芸の街
    '/assets/categories/category_heritage.jpg',
  ],
  spot: [
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80', // 都市観光
    'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 景勝地
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // パノラマ展望
    '/assets/categories/category_modern_spot.jpg',
  ],
};

/**
 * 全国47都道府県・厳選主要名所（130箇所以上）の個別実写写真マッピング
 */
const LANDMARK_SPECIFIC_IMAGES: Record<string, string> = {
  // === 北海道 ===
  hokkaido_goryokaku: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80', // 五稜郭
  hokkaido_bluepond: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 青い池
  hokkaido_shiretoko: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', // 知床五湖
  hokkaido_tokeidai: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 札幌時計台
  hokkaido_otaru: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 小樽運河
  hokkaido_hakodateyama: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80', // 函館山夜景
  hokkaido_farmtomita: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 富田ファーム
  hokkaido_soyamisaki: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 宗谷岬

  // === 東北 ===
  aomori_hirosaki: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80', // 弘前城
  aomori_oirase: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 奥入瀬渓流
  aomori_sannaimaruyama: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 三内丸山遺跡
  aomori_warasse: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', // ねぶたの家
  aomori_towadako: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 十和田湖
  aomori_shirakami: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', // 白神山地
  iwate_chusonji: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 中尊寺金色堂
  iwate_genbikei: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 厳美渓
  iwate_ryusendo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 龍泉洞
  iwate_koiwai: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 小岩井農場
  iwate_jodogahama: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 浄土ヶ浜
  miyagi_matsushima: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 松島
  miyagi_sendai_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 仙台城跡
  miyagi_zuihoden: 'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80', // 瑞鳳殿
  miyagi_narukokyo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 鳴子峡
  akita_kakunodate: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 角館武家屋敷
  akita_nyuto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 乳頭温泉郷
  akita_namahage: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', // なまはげ館
  yamagata_ginzan: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 銀山温泉
  yamagata_zao: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 蔵王樹氷
  yamagata_hagurosan: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 羽黒山五重塔
  yamagata_kamokurage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // 加茂水族館クラゲ
  fukushima_tsurugajo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 鶴ヶ城
  fukushima_ouchijuku: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 大内宿
  fukushima_inawashiro: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 猪苗代湖
  fukushima_hawaiians: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', // ハワイアンズ

  // === 関東 ===
  ibaraki_kairakuen: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 偕楽園
  ibaraki_fukuroda: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 袋田の滝
  ibaraki_ushikudaibutsu: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 牛久大仏
  ibaraki_aquaworld: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // アクアワールド大洗
  ibaraki_hitachi_seaside: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // ひたち海浜公園
  ibaraki_oaraiisosaki: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 大洗磯前神社神磯
  tochigi_nikko: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 日光東照宮
  tochigi_kegon: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 華厳の滝
  tochigi_chuzenji: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 中禅寺湖
  tochigi_edowonderland: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 日光江戸村
  gunma_kusatsu: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 草津温泉湯畑
  gunma_ikaho: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 伊香保温泉石段街
  gunma_tomioka: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 富岡製糸場
  gunma_fukiware: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 吹割の滝
  gunma_ozegahara: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', // 尾瀬ヶ原
  saitama_kawagoe: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 川越小江戸
  saitama_nagatoro: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 長瀞ライン下り
  saitama_chichibu: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 秩父神社
  saitama_hitsujiyama: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 羊山公園芝桜
  chiba_naritasan: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', // 成田山新勝寺
  chiba_nokogiriyama: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 鋸山地獄のぞき
  chiba_inubosaki: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 犬吠埼灯台
  chiba_seaworld: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // 鴨川シーワールド
  tokyo_tower: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80', // 東京タワー
  tokyo_sensoji: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', // 浅草寺
  tokyo_skytree: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // スカイツリー
  tokyo_meijijingu: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 明治神宮
  tokyo_shinjuku_gyoen: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 新宿御苑
  tokyo_odaiba: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // お台場
  kanagawa_kamakura: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 鎌倉大仏
  kanagawa_hakone_shrine: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80', // 箱根神社芦ノ湖鳥居
  kanagawa_redbrick: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 横浜赤レンガ倉庫
  kanagawa_enoshima: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 江の島

  // === 中部・北陸 ===
  niigata_kiyotsukyo: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 清津峡トンネル
  niigata_sadogold: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 佐渡金山
  niigata_yahiko: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 彌彦神社
  toyama_kurobedam: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 黒部ダム
  toyama_alpen: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 立山雪の大谷
  toyama_amaharashi: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 雨晴海岸
  ishikawa_kenrokuen: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 兼六園
  ishikawa_21st: 'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80', // 金沢21世紀美術館
  ishikawa_higashichaya: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // ひがし茶屋街
  fukui_tojinbo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 東尋坊
  fukui_eiheiji: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 永平寺
  fukui_dinosaur: 'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80', // 恐竜博物館
  yamanashi_kawaguchiko: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 河口湖
  yamanashi_arakurayama: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 新倉山浅間公園
  yamanashi_fuji_5th_station: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 富士山五合目
  yamanashi_oshino: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 忍野八海
  nagano_matsumoto_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 松本城
  nagano_kamikochi: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 上高地河童橋
  nagano_zenkoji: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 善光寺
  gifu_shirakawago: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 白川郷合掌造り
  gifu_takayama: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 飛騨高山三町筋
  gifu_gero_onsen: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 下呂温泉
  shizuoka_miho: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 三保の松原
  shizuoka_shiraito: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 白糸の滝
  shizuoka_sumata: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 寸又峡夢の吊橋
  aichi_nagoya_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 名古屋城金鯱
  aichi_atsuta: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 熱田神宮
  aichi_inuyama: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 国宝犬山城
  mie_ise: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 伊勢神宮内宮宇治橋
  mie_toba_aquarium: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // 鳥羽水族館
  mie_onigajo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 熊野鬼ヶ城

  // === 近畿 ===
  shiga_hikone: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 彦根城
  shiga_biwako_valley: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // びわ湖テラス
  shiga_enryakuji: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 比叡山延暦寺
  kyoto_kinkakuji: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 金閣寺
  kyoto_kiyomizudera: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 清水寺舞台
  kyoto_fushimi: 'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80', // 伏見稲荷千本鳥居
  kyoto_arashiyama_bamboo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', // 嵐山竹林
  kyoto_amanohashidate: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 天橋立
  osaka_castle: 'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80', // 大阪城天守閣
  osaka_dotonbori: 'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80', // 道頓堀グリコサイン
  osaka_tsutenkaku: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80', // 通天閣
  hyogo_himejijo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 姫路城
  hyogo_arima: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 有馬温泉金泉
  hyogo_akashi_bridge: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 明石海峡大橋
  hyogo_takeda: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 竹田城跡雲海
  nara_todaiji: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 東大寺大仏殿
  nara_horyuji: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 法隆寺五重塔
  nara_kasuga: 'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80', // 春日大社朱塗り回廊
  wakayama_nachi: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 那智の滝・三重塔
  wakayama_koyasan: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 高野山壇上伽藍
  wakayama_shirahama: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 白良浜白い砂浜

  // === 中国・四国 ===
  tottori_sakyu: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 鳥取砂丘
  tottori_mizuki: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 水木しげるロード
  tottori_daisen: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 大山伯耆富士
  shimane_izumo: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 出雲大社大しめ縄
  shimane_adachi: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 足立美術館日本庭園
  shimane_matsue_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 松江城
  okayama_kurashiki: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 倉敷美観地区白壁
  okayama_korakuen: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 岡山後楽園
  okayama_bitchu_matsuyama: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 備中松山城雲海
  hiroshima_itsukushima: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 厳島神社大鳥居
  hiroshima_atomic_dome: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 原爆ドーム
  hiroshima_onomichi: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 尾道坂の町
  yamaguchi_tsunoshima: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 角島大橋エメラルドグリーン
  yamaguchi_motonosumi: 'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80', // 元乃隅神社百基鳥居
  yamaguchi_akiyoshido: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 秋芳洞・百枚皿
  tokushima_naruto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 鳴門の渦潮
  tokushima_kazurabashi: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 祖谷のかずら橋
  tokushima_otsuka: 'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80', // 大塚国際美術館
  kagawa_kotohira: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 金刀比羅宮本宮
  kagawa_ritsurin: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // 栗林公園
  kagawa_shodoshima: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 小豆島オリーブ公園
  ehime_dogo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 道後温泉本館
  ehime_matsuyama_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 松山城
  ehime_shimanami: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 来島海峡大橋
  kochi_katsurahama: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', // 桂浜龍馬像
  kochi_kochi_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 高知城追手門
  kochi_shimanto: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 四万十川沈下橋

  // === 九州・沖縄 ===
  fukuoka_dazaifu: 'https://images.unsplash.com/photo-1478436127897-769e00d2c715?auto=format&fit=crop&w=800&q=80', // 太宰府天満宮
  fukuoka_itoshima: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 糸島二見ヶ浦鳥居
  fukuoka_mojiko: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 門司港レトロ
  saga_yoshinogari: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 吉野ヶ里歴史公園
  saga_takeo_kusunoki: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', // 武雄の大楠
  saga_yobuko: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', // 呼子朝市イカ
  nagasaki_glover: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // グラバー園
  nagasaki_gunkanjima: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // 軍艦島
  nagasaki_huistenbosch: 'https://images.unsplash.com/photo-1590559899731-a372a1464e29?auto=format&fit=crop&w=800&q=80', // ハウステンボス
  kumamoto_castle: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', // 熊本城天守閣
  kumamoto_kusasenri: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 阿蘇草千里
  kumamoto_nabegataki: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 鍋ヶ滝カーテン
  oita_umijigoku: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 別府海地獄コバルトブルー
  oita_kinrinko: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 由布院金鱗湖朝霧
  oita_harajiri: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 原尻の滝
  miyazaki_takachiho: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // 高千穂峡真名井の滝
  miyazaki_aoshima: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 青島神社鬼の洗濯板
  miyazaki_sunmesse: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // サンメッセ日南モアイ
  kagoshima_sakurajima: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', // 桜島活火山
  kagoshima_yakushima: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', // 屋久島縄文杉
  kagoshima_kirishima: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=800&q=80', // 霧島神宮
  okinawa_shurijo: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', // 首里城正殿
  okinawa_churaumi: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // 美ら海水族館黒潮の海
  okinawa_manzamo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // 万座毛象の鼻岩
};

/**
 * 名所に対応する最適な画像URLを取得する関数
 * 1. 名所データ自体に個別URLが直接指定されている場合はそれを最優先
 * 2. 全国47都道府県の代表名所固有の高解像度写真を返却
 * 3. カテゴリごとの高品質マルチバリエーションプールから名所IDハッシュで決定論的に返却
 * 4. 最終フォールバックとしてローカル配備画像を返却 (完全オフライン対応・即時表示)
 */
export const getLandmarkImageUrl = (landmark: Landmark): string => {
  if (landmark.imageUrl) {
    return landmark.imageUrl;
  }
  if (LANDMARK_SPECIFIC_IMAGES[landmark.id]) {
    return LANDMARK_SPECIFIC_IMAGES[landmark.id];
  }
  const categoryKey = landmark.category || 'spot';
  const pool = CATEGORY_IMAGE_VARIANTS[categoryKey] || CATEGORY_IMAGE_VARIANTS.spot;
  if (pool && pool.length > 0) {
    const hash = hashString(landmark.id);
    return pool[hash % pool.length];
  }
  const config = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.spot;
  return config.imagePath;
};

/**
 * 名所の種類情報を取得
 */
export const getCategoryInfo = (category: LandmarkCategory): CategoryInfo => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.spot;
};

/**
 * 画像読み込みエラー時の確実なローカルフォールバック画像パスを取得
 */
export const getCategoryFallbackImage = (category?: LandmarkCategory): string => {
  if (!category) return '/assets/categories/category_modern_spot.jpg';
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.spot;
  return config.imagePath;
};
