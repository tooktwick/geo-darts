import { Language, Prefecture, Landmark, LandmarkCategory, GameDifficulty, GameMode } from '../types';
import { CATEGORY_CONFIG } from './landmarkImages';

/**
 * 主要名所の英語名称マッピング辞書 (全47都道府県の代表名所)
 */
export const LANDMARK_ENGLISH_NAMES: Record<string, string> = {
  // === 北海道 ===
  hokkaido_goryokaku: 'Goryokaku Fort',
  hokkaido_bluepond: 'Shirogane Blue Pond (Biei)',
  hokkaido_shiretoko: 'Shiretoko Five Lakes',
  hokkaido_tokeidai: 'Sapporo Clock Tower',
  hokkaido_otaru: 'Otaru Canal',
  hokkaido_hakodateyama: 'Mt. Hakodate Observatory',
  hokkaido_farmtomita: 'Farm Tomita (Furano)',
  hokkaido_asahiyama: 'Asahiyama Zoo',
  hokkaido_soyamisaki: 'Cape Soya (Northernmost Point)',
  hokkaido_mashuko: 'Lake Mashu',
  hokkaido_erimomisaki: 'Cape Erimo',
  hokkaido_niseko: 'Niseko Annupuri',

  // === 東北 ===
  aomori_hirosaki: 'Hirosaki Castle',
  aomori_oirase: 'Oirase Mountain Stream',
  aomori_sannaimaruyama: 'Sannai-Maruyama Historical Site',
  aomori_warasse: 'Nebuta Museum WA-RASSE',
  aomori_towadako: 'Lake Towada',
  aomori_shirakami: 'Shirakami-Sanchi (Aoike Pond)',
  iwate_chusonji: 'Chuson-ji Konjikido (Golden Hall)',
  iwate_genbikei: 'Genbikei Gorge',
  iwate_ryusendo: 'Ryusendo Limestone Cave',
  iwate_koiwai: 'Koiwai Farm',
  iwate_jodogahama: 'Jodogahama Beach',
  miyagi_matsushima: 'Matsushima Bay Islands',
  miyagi_sendai_castle: 'Sendai Castle Ruins (Aoba Castle)',
  miyagi_zuihoden: 'Zuihoden Mausoleum',
  miyagi_narukokyo: 'Naruko Gorge',
  miyagi_zaookama: 'Zao Okama Crater Lake',
  akita_kakunodate: 'Kakunodate Samurai District',
  akita_nyuto: 'Nyuto Onsen Village',
  akita_namahage: 'Namahage Museum (Oga)',
  yamagata_ginzan: 'Ginzan Onsen',
  yamagata_zao: 'Zao Snow Monsters (Frost Trees)',
  yamagata_hagurosan: 'Mt. Haguro Five-Story Pagoda',
  yamagata_kamokurage: 'Kamo Jellyfish Aquarium',
  fukushima_tsurugajo: 'Tsuruga Castle (Aizu-Wakamatsu)',
  fukushima_ouchijuku: 'Ouchi-juku Post Town',
  fukushima_inawashiro: 'Lake Inawashiro',
  fukushima_hawaiians: 'Spa Resort Hawaiians',

  // === 関東 ===
  ibaraki_kairakuen: 'Kairakuen Garden',
  ibaraki_fukuroda: 'Fukuroda Falls',
  ibaraki_ushikudaibutsu: 'Ushiku Daibutsu (Great Buddha)',
  ibaraki_aquaworld: 'Aqua World Oarai Aquarium',
  ibaraki_hitachi_seaside: 'Hitachi Seaside Park',
  ibaraki_oaraiisosaki: 'Oarai Isosaki Shrine (Kamiiso Torii)',
  tochigi_nikko: 'Nikko Toshogu Shrine',
  tochigi_kegon: 'Kegon Falls',
  tochigi_chuzenji: 'Lake Chuzenji',
  tochigi_edowonderland: 'EDO WONDERLAND Nikko Edomura',
  gunma_kusatsu: 'Kusatsu Onsen Yubatake',
  gunma_ikaho: 'Ikaho Onsen Stone Steps',
  gunma_tomioka: 'Tomioka Silk Mill (World Heritage)',
  gunma_fukiware: 'Fukiware Falls',
  gunma_ozegahara: 'Ozegahara Marshland',
  saitama_kawagoe: 'Kawagoe Little Edo (Kurazukuri)',
  saitama_nagatoro: 'Nagatoro River Boating & Iwadatami',
  saitama_chichibu: 'Chichibu Shrine',
  saitama_hitsujiyama: 'Hitsujiyama Park Moss Phlox Hill',
  chiba_naritasan: 'Naritasan Shinshoji Temple',
  chiba_nokogiriyama: 'Mt. Nokogiri (Hell Peak View)',
  chiba_inubosaki: 'Inubosaki Lighthouse',
  chiba_seaworld: 'Kamogawa Sea World',
  tokyo_tower: 'Tokyo Tower',
  tokyo_sensoji: 'Senso-ji Temple (Asakusa)',
  tokyo_skytree: 'Tokyo Skytree',
  tokyo_meijijingu: 'Meiji Jingu Shrine',
  tokyo_shinjuku_gyoen: 'Shinjuku Gyoen National Garden',
  tokyo_odaiba: 'Odaiba Seaside',
  kanagawa_kamakura: 'Kamakura Great Buddha (Kotoku-in)',
  kanagawa_hakone_shrine: 'Hakone Shrine (Torii on Lake Ashi)',
  kanagawa_redbrick: 'Yokohama Red Brick Warehouse',
  kanagawa_enoshima: 'Enoshima Island',

  // === 中部・北陸 ===
  niigata_kiyotsukyo: 'Kiyotsu Gorge Tunnel of Light',
  niigata_sadogold: 'Sado Gold Mine',
  niigata_yahiko: 'Yahiko Shrine',
  toyama_kurobedam: 'Kurobe Dam',
  toyama_alpen: 'Tateyama Kurobe Alpine Snow Wall',
  toyama_amaharashi: 'Amaharashi Coast & Mt. Tateyama',
  ishikawa_kenrokuen: 'Kenroku-en Garden',
  ishikawa_21st: '21st Century Museum of Contemporary Art',
  ishikawa_higashichaya: 'Higashi Chaya Geisha District',
  fukui_tojinbo: 'Tojinbo Cliffs',
  fukui_eiheiji: 'Eihei-ji Temple',
  fukui_dinosaur: 'Fukui Prefectural Dinosaur Museum',
  yamanashi_kawaguchiko: 'Lake Kawaguchiko & Mt. Fuji',
  yamanashi_arakurayama: 'Arakurayama Sengen Park (Chureito Pagoda)',
  yamanashi_fuji_5th_station: 'Mt. Fuji 5th Station',
  yamanashi_oshino: 'Oshino Hakkai Springs',
  nagano_matsumoto_castle: 'National Treasure Matsumoto Castle',
  nagano_kamikochi: 'Kamikochi & Kappabashi Bridge',
  nagano_zenkoji: 'Zenko-ji Temple',
  gifu_shirakawago: 'Shirakawa-go Historic Village',
  gifu_takayama: 'Takayama Old Town (Sanmachi Suji)',
  gifu_gero_onsen: 'Gero Onsen',
  shizuoka_miho: 'Miho no Matsubara (Pine Tree Grove)',
  shizuoka_shiraito: 'Shiraito Falls',
  shizuoka_sumata: 'Sumatakyo Suspension Bridge of Dreams',
  aichi_nagoya_castle: 'Nagoya Castle & Golden Shachihoko',
  aichi_atsuta: 'Atsuta Jingu Shrine',
  aichi_inuyama: 'Inuyama Castle (National Treasure)',
  mie_ise: 'Ise Jingu Shrine (Naiku)',
  mie_toba_aquarium: 'Toba Aquarium',
  mie_onigajo: 'Kumano Kodo & Onigajo Coast',

  // === 近畿 ===
  shiga_hikone: 'Hikone Castle (National Treasure)',
  shiga_biwako_valley: 'Biwako Terrace (Lake Biwa)',
  shiga_enryakuji: 'Hieizan Enryaku-ji Temple',
  kyoto_kinkakuji: 'Kinkaku-ji (Golden Pavilion)',
  kyoto_kiyomizudera: 'Kiyomizu-dera Temple',
  kyoto_fushimi: 'Fushimi Inari Taisha (1000 Torii)',
  kyoto_arashiyama_bamboo: 'Arashiyama Bamboo Grove',
  kyoto_amanohashidate: 'Amanohashidate Sandbar',
  osaka_castle: 'Osaka Castle Tower',
  osaka_dotonbori: 'Dotonbori Glico Running Man',
  osaka_tsutenkaku: 'Tsutenkaku Tower',
  hyogo_himejijo: 'Himeji Castle (White Heron)',
  hyogo_arima: 'Arima Onsen',
  hyogo_akashi_bridge: 'Akashi Kaikyo Bridge',
  hyogo_takeda: 'Takeda Castle Ruins (Castle in the Sky)',
  nara_todaiji: 'Todai-ji Great Buddha Hall',
  nara_horyuji: 'Horyu-ji (World Oldest Wooden Temple)',
  nara_kasuga: 'Kasuga Taisha Shrine',
  wakayama_nachi: 'Kumano Nachi Taisha & Nachi Falls',
  wakayama_koyasan: 'Mt. Koya Danjo Garan',
  wakayama_shirahama: 'Shirahama White Sand Beach',

  // === 中国・四国 ===
  tottori_sakyu: 'Tottori Sand Dunes',
  tottori_mizuki: 'Mizuki Shigeru Road (Yokai)',
  tottori_daisen: 'Mt. Daisen',
  shimane_izumo: 'Izumo Taisha Grand Shrine',
  shimane_adachi: 'Adachi Museum of Art & Garden',
  shimane_matsue_castle: 'Matsue Castle (National Treasure)',
  okayama_kurashiki: 'Kurashiki Bikan Historical Quarter',
  okayama_korakuen: 'Okayama Korakuen Garden',
  okayama_bitchu_matsuyama: 'Bitchu Matsuyama Mountain Castle',
  hiroshima_itsukushima: 'Itsukushima Shrine Floating Torii',
  hiroshima_atomic_dome: 'Hiroshima Peace Memorial (Atomic Bomb Dome)',
  hiroshima_onomichi: 'Onomichi Senkoji Hill',
  yamaguchi_tsunoshima: 'Tsunoshima Ocean Bridge',
  yamaguchi_motonosumi: 'Motonosumi Shrine 123 Torii Gates',
  yamaguchi_akiyoshido: 'Akiyoshido Cave & Akiyoshidai Karst',
  tokushima_naruto: 'Naruto Whirlpools',
  tokushima_kazurabashi: 'Iya Vine Suspension Bridge',
  tokushima_otsuka: 'Otsuka Museum of Art',
  kagawa_kotohira: 'Kotohira-gu Shrine (Konpira-san)',
  kagawa_ritsurin: 'Ritsurin Garden',
  kagawa_shodoshima: 'Shodoshima Olive Park',
  ehime_dogo: 'Dogo Onsen Main Building',
  ehime_matsuyama_castle: 'Matsuyama Castle',
  ehime_shimanami: 'Shimanami Kaido Kurushima Bridge',
  kochi_katsurahama: 'Katsurahama Beach & Ryoma Statue',
  kochi_kochi_castle: 'Kochi Castle',
  kochi_shimanto: 'Shimanto River Chinkabashi Bridge',

  // === 九州・沖縄 ===
  fukuoka_dazaifu: 'Dazaifu Tenmangu Shrine',
  fukuoka_itoshima: 'Itoshima Sakurai Futamigaura Torii',
  fukuoka_mojiko: 'Mojiko Retro District',
  saga_yoshinogari: 'Yoshinogari Historical Park',
  saga_takeo_kusunoki: 'Takeo Great Sacred Camphor Tree',
  saga_yobuko: 'Yobuko Morning Squid Market',
  nagasaki_glover: 'Glover Garden (Historic Mansion)',
  nagasaki_gunkanjima: 'Battleship Island (Hashima Coal Mine)',
  nagasaki_huistenbosch: 'Huis Ten Bosch Theme Park',
  kumamoto_castle: 'Kumamoto Castle',
  kumamoto_kusasenri: 'Aso Kusasenri-ga-hama Grassland',
  kumamoto_nabegataki: 'Nabegataki Water Curtain Falls',
  oita_umijigoku: 'Beppu Umi Jigoku (Sea Hell Spring)',
  oita_kinrinko: 'Yufuin Lake Kinrin',
  oita_harajiri: 'Harajiri Falls (Niagara of the East)',
  miyazaki_takachiho: 'Takachiho Gorge & Manai Falls',
  miyazaki_aoshima: 'Aoshima Shrine & Devil Washboard',
  miyazaki_sunmesse: 'Sunmesse Nichinan Moai Statues',
  kagoshima_sakurajima: 'Sakurajima Active Volcano',
  kagoshima_yakushima: 'Yakushima Jomon Cedar Ancient Forest',
  kagoshima_kirishima: 'Kirishima Jingu Shrine',
  okinawa_shurijo: 'Shurijo Castle Ruins (World Heritage)',
  okinawa_churaumi: 'Okinawa Churaumi Aquarium',
  okinawa_manzamo: 'Cape Manzamo (Elephant Rock Cliff)',
};

/**
 * 日本語・英語のUI文言辞書
 */
export const TRANSLATIONS = {
  ja: {
    appTitle: 'Geo Darts Japan',
    appSubtitle: 'ジオダーツ 日本列島',
    browserTitle: 'Geo Darts Japan - ジオダーツ 日本列島',
    
    // モード
    mode_basic: '基本 (県別名所)',
    mode_basic_desc: '基本モード: 県ごとの名所3箇所をニアピンで狙い、47都道府県完全制覇を目指す',
    mode_sniper: 'スナイパー',
    mode_sniper_desc: 'スナイパーモード: 全国940名所からランダムに1箇所指定！10投の合計スコアを競う',
    mode_rally: 'ラリー',
    mode_rally_desc: 'ラリーモード: 新幹線沿線や世界遺産など、テーマ別名所を順番に走破！',
    mode_quiz: '推理クイズ',
    mode_quiz_desc: '推理クイズモード: 地図上のピンなし！歴史・地理ヒントから正解地点を推理して狙撃！',
    mode_aichi: '愛知限定',
    mode_aichi_desc: '愛知県詳細モード: 全38市×各3名所（計114名所）の地域深掘り特化モード',
    mode_free: '自由探索',
    mode_free_desc: '自由探索モード: 任意の場所へ投擲し、都道府県情報や特産品を閲覧',

    // 難易度
    difficulty: '難易度',
    diff_easy: 'Easy',
    diff_easy_title: 'Easy: 目標ピン常時表示・ニアピン判定20km以内（全国有名名所から選出）',
    diff_normal: 'Normal',
    diff_normal_title: 'Normal: 目標ピン非表示（方角・距離ガイドあり）・判定10km以内（全国+地域名所）',
    diff_hard: 'Hard',
    diff_hard_title: 'Hard: 完全ノーヒント・判定5km以内（全国・地域・マイナー全20名所から選出）',

    // マップ
    map_gsi: '地理院地図',
    map_gsi_title: '国土地理院タイル地図 (精密な地形・地名・等高線・道路網)',
    map_svg: 'スタイル地図',
    map_svg_title: 'スタイライズド地図 (軽量・和モダンベクターSVG表示)',

    // 風況
    wind: '風向',
    wind_calm: '無風',
    dir_N: '北',
    dir_NE: '北東',
    dir_E: '東',
    dir_SE: '南東',
    dir_S: '南',
    dir_SW: '南西',
    dir_W: '西',
    dir_NW: '北西',

    // HUDボタン
    passport: 'パスポート',
    passport_title: '御朱印帳・制覇記録を開く',
    font_size: '文字: 大',
    font_size_title: '文字サイズ調整 (Ctrl+ホイールでも拡大縮小可能)',
    sound: '音響',
    sound_title: '音響効果・和風琴BGM切り替え',
    help: '遊び方',
    help_title: '遊び方・採点ルール・ガイドを開く',
    lang_btn: 'English',
    lang_btn_title: 'Switch to English (英語表示に切り替え)',

    // 基本モードミッションバー
    now_exploring: '現在探索中',
    target_spots: '目標名所',
    reroll_spots: '名所チェンジ',
    other_pref: '別の県',
    fold: '折りたたむ',
    expand: '展開',
    cleared_badge: '制覇！',
    aim_btn: '狙え',
    last_shot: '直近の一投',
    near_pin_hint: 'ニアピン: {km}km以内',
    national_selection: '全国レベル候補から3箇所選出',
    national_regional_selection: '全国+地域候補から3箇所選出',
    all_selection: '全20箇所から3箇所選出',
    pull_and_release: '引いて放つ投てき台',
    click_to_throw: '（地図クリックでも即投てき可）',
    conquest_count: '全国制覇',
    total_47: '/ 47県',

    // 命中通知カード
    near_pin_hit: '🎉 ニアピン命中！',
    pinpoint_hit: '✨ ピンポイント直撃！',
    center_bull: '中心直撃！BULLSEYE!',
    fame_national: '🌟全国',
    fame_regional: '🗺️地域',
    fame_minor: '🌿穴場',
    spots_cleared: '🏆 3箇所制覇！',
    drag_hint: 'ドラッグして好きな場所に移動できます',
    open_details: '詳細を開く',
    loading_photo: '{category}を読込中...',
    gourmet_tag: '名物',
    episode_tag: 'エピソード',
    blessing_tag: '旅の加護',
    minimize: 'カードを最小化',
    expand_card: 'カードを展開',
    close: '閉じる',

    // 都道府県詳細
    visit_stamp: '来訪記念印',
    visit_count_label: '{count}回目来訪',
    capital: '県庁所在地',
    population: '人口',
    area: '面積',
    high_score: 'ハイスコア',
    no_record: '未記録',
    specialties: '特産品・名物',
    trivia: 'ご当地トリビア',
    landmarks_list_title: '🏯 厳選名所一覧（全{count}箇所）',
    scroll_hint: '※スクロールで全件閲覧可',
    continue_exploring: '探索を続ける',

    // パスポート
    passport_heading: '日本列島 踏破パスポート',
    passport_subheading: 'ダーツで巡った日本全国の軌跡と獲得した名誉',
    stamps_tab: '御朱印・訪問記録',
    achievements_tab: '称号・実績',
    conquest_rate: '全国制覇率',
    all_regions: '全地域',
    visited_stamp_count: '達成: {visited} / {total} 箇所 ({percent}%)',
    unlocked_count: '解放済み: {unlocked} / {total}',

    // 共通・その他
    retry: 'もう一度挑戦',
    next: '次へ',
  },
  en: {
    appTitle: 'Geo Darts Japan',
    appSubtitle: 'Japan Archipelago',
    browserTitle: 'Geo Darts Japan - Explore Japan',

    // Modes
    mode_basic: 'Basic (Spots)',
    mode_basic_desc: 'Basic Mode: Hit 3 famous spots in each prefecture to complete all 47 prefectures',
    mode_sniper: 'Sniper',
    mode_sniper_desc: 'Sniper Mode: 1 target chosen from 940 spots! Compete for high score in 10 throws',
    mode_rally: 'Rally',
    mode_rally_desc: 'Rally Mode: Travel along thematic routes like Shinkansen lines and World Heritage sites',
    mode_quiz: 'Geo Quiz',
    mode_quiz_desc: 'Geo Quiz Mode: No pins! Deduce the landmark location from historical clues and snipe!',
    mode_aichi: 'Aichi Special',
    mode_aichi_desc: 'Aichi Deep Dive: Explore all 38 cities × 3 landmarks (114 spots)',
    mode_free: 'Free Roam',
    mode_free_desc: 'Free Roam Mode: Throw freely across Japan to explore local culture and food',

    // Difficulty
    difficulty: 'Difficulty',
    diff_easy: 'Easy',
    diff_easy_title: 'Easy: Pins ON / 20km Near Pin tolerance (Famous national landmarks)',
    diff_normal: 'Normal',
    diff_normal_title: 'Normal: Pins OFF / Dist & Direction ON / 10km tolerance (National + Regional)',
    diff_hard: 'Hard',
    diff_hard_title: 'Hard: No Hints / 5km tolerance (Selected from all 20 local spots)',

    // Maps
    map_gsi: 'GSI Tile Map',
    map_gsi_title: 'Official Geospatial Info Authority of Japan Tile Map (Detailed terrain & roads)',
    map_svg: 'Style Map',
    map_svg_title: 'Stylized Japanese Modern Vector Map',

    // Wind
    wind: 'Wind',
    wind_calm: 'Calm',
    dir_N: 'N',
    dir_NE: 'NE',
    dir_E: 'E',
    dir_SE: 'SE',
    dir_S: 'S',
    dir_SW: 'SW',
    dir_W: 'W',
    dir_NW: 'NW',

    // HUD Buttons
    passport: 'Passport',
    passport_title: 'Open Travel Passport & Stamps',
    font_size: 'Font: L',
    font_size_title: 'Adjust text size (Ctrl + Wheel to zoom)',
    sound: 'Audio',
    sound_title: 'Toggle sound effects & Koto BGM',
    help: 'Guide',
    help_title: 'How to Play, Rules, and Scoring Guide',
    lang_btn: '日本語',
    lang_btn_title: 'Switch to Japanese (日本語表示に切り替え)',

    // Basic Mode Mission Bar
    now_exploring: 'Now Exploring',
    target_spots: 'Targets',
    reroll_spots: 'Reroll Spots',
    other_pref: 'Other Pref',
    fold: 'Collapse',
    expand: 'Expand',
    cleared_badge: 'CLEARED!',
    aim_btn: 'Target',
    last_shot: 'Last Shot',
    near_pin_hint: 'Near Pin: within {km}km',
    national_selection: '3 Famous National Spots Selected',
    national_regional_selection: '3 National & Regional Spots Selected',
    all_selection: '3 Spots Selected from all 20 Candidates',
    pull_and_release: 'Pull & Release Launcher',
    click_to_throw: '(Or click map directly)',
    conquest_count: 'Conquest',
    total_47: '/ 47 Prefs',

    // Hit Card
    near_pin_hit: '🎉 NEAR PIN HIT!',
    pinpoint_hit: '✨ PINPOINT BULLSEYE!',
    center_bull: 'CENTER BULLSEYE!',
    fame_national: '🌟National',
    fame_regional: '🗺️Regional',
    fame_minor: '🌿Hidden',
    spots_cleared: '🏆 3 Spots Cleared!',
    drag_hint: 'Drag to reposition card freely',
    open_details: 'Open Details',
    loading_photo: 'Loading {category}...',
    gourmet_tag: 'Gourmet',
    episode_tag: 'History',
    blessing_tag: 'Blessing',
    minimize: 'Minimize',
    expand_card: 'Expand Card',
    close: 'Close',

    // Pref Modal
    visit_stamp: 'Visit Stamp',
    visit_count_label: 'Visit #{count}',
    capital: 'Capital',
    population: 'Population',
    area: 'Area',
    high_score: 'High Score',
    no_record: 'No Record',
    specialties: 'Specialties & Foods',
    trivia: 'Local Trivia',
    landmarks_list_title: '🏯 Selected Landmarks (All {count})',
    scroll_hint: '* Scroll to view all',
    continue_exploring: 'Continue Exploring',

    // Passport
    passport_heading: 'Japan Travel Passport & Stamps',
    passport_subheading: 'Record of your travels and achievements across Japan',
    stamps_tab: 'Stamps & Visits',
    achievements_tab: 'Achievements',
    conquest_rate: 'Japan Completion Rate',
    all_regions: 'All Regions',
    visited_stamp_count: 'Progress: {visited} / {total} ({percent}%)',
    unlocked_count: 'Unlocked: {unlocked} / {total}',

    // Common
    retry: 'Play Again',
    next: 'Next',
  },
};

/**
 * 翻訳取得ヘルパー関数
 */
export const t = (key: keyof typeof TRANSLATIONS.ja, lang: Language = 'ja', params?: Record<string, string | number>): string => {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.ja;
  let text = (dict as any)[key] || TRANSLATIONS.ja[key] || String(key);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
};

/**
 * 都道府県名のバイリンガル表示取得
 */
export const getPrefectureName = (pref: Prefecture | null | undefined, lang: Language): string => {
  if (!pref) return '';
  return lang === 'en' ? pref.englishName : pref.name;
};

/**
 * 名所名のバイリンガル表示取得
 */
export const getLandmarkName = (landmark: Landmark | null | undefined, lang: Language): string => {
  if (!landmark) return '';
  if (lang === 'en') {
    if (landmark.englishName) return landmark.englishName;
    if (LANDMARK_ENGLISH_NAMES[landmark.id]) return LANDMARK_ENGLISH_NAMES[landmark.id];
  }
  return landmark.name;
};

/**
 * 名所カテゴリのバイリンガル表示取得
 */
export const getCategoryName = (category: LandmarkCategory, lang: Language): string => {
  if (lang === 'ja') {
    return CATEGORY_CONFIG[category]?.name || '観光名所';
  }
  const enMap: Record<LandmarkCategory, string> = {
    castle: 'Castle',
    shrine_temple: 'Shrine & Temple',
    nature: 'Scenic Nature',
    hotspring: 'Hot Spring',
    gourmet: 'Local Gourmet',
    heritage: 'World Heritage',
    modern_spot: 'Modern Landmark',
    garden: 'Japanese Garden',
    culture: 'Culture & Arts',
    spot: 'Famous Spot',
  };
  return enMap[category] || 'Landmark';
};

/**
 * 風向き表示のバイリンガル変換
 */
export const getWindDirectionName = (dir: string, lang: Language): string => {
  if (lang === 'ja') return dir;
  const map: Record<string, string> = {
    '北': 'N',
    '北東': 'NE',
    '東': 'E',
    '南東': 'SE',
    '南': 'S',
    '南西': 'SW',
    '西': 'W',
    '北西': 'NW',
  };
  return map[dir] || dir;
};

/**
 * 地方名のバイリンガル表示取得
 */
export const getRegionName = (region: string, lang: Language): string => {
  const enRegionMap: Record<string, string> = {
    hokkaido: 'Hokkaido',
    tohoku: 'Tohoku',
    kanto: 'Kanto',
    chubu: 'Chubu',
    kinki: 'Kinki (Kansai)',
    chugoku: 'Chugoku',
    shikoku: 'Shikoku',
    kyushu: 'Kyushu & Okinawa',
  };
  const jaRegionMap: Record<string, string> = {
    hokkaido: '北海道',
    tohoku: '東北',
    kanto: '関東',
    chubu: '中部',
    kinki: '近畿',
    chugoku: '中国',
    shikoku: '四国',
    kyushu: '九州・沖縄',
  };
  if (lang === 'en') {
    return enRegionMap[region] || region;
  }
  return jaRegionMap[region] || region;
};

