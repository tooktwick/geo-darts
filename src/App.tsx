import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameMode,
  MapType,
  Prefecture,
  DartHit,
  WindState,
  WindDirection,
  PassportRecord,
  Achievement,
  BasicTourState,
  SniperGameState,
  RallyGameState,
  RallyCourse,
  Landmark,
  GameDifficulty,
  LandmarkBlessing,
  AichiCity,
  AichiDetailState,
  FontSize,
  GeoQuizQuestion,
  QuizGameState,
  QuizQuestionResult,
  Language,
} from './types';
import { PREFECTURES, getPrefectureById } from './data/prefectures';
import {
  getLandmarksByPrefectureId,
  getRandomLandmarksForPrefecture,
  getCandidateLandmarksByPrefectureId,
  getRandomNationalLandmark,
  getLandmarkById,
} from './data/landmarksData';
import { AICHI_CITIES } from './data/aichiData';
import { RALLY_COURSES } from './rallyData';
import { getRandomQuizSet } from './data/quizData';
import { audio } from './utils/audio';
import {
  getPassportData,
  savePassportRecord,
  getAchievements,
  unlockAchievement,
  getSniperHighScore,
  saveSniperHighScore,
  getCompletedRallies,
  recordRallyCompleted,
  getBasicClearedPrefIds,
  saveBasicClearedPrefId,
  getGameDifficulty,
  saveGameDifficulty,
  getAichiClearedCityIds,
  saveAichiClearedCityId,
  removeAichiClearedCity,
  getAichiClearedLandmarkIds,
  saveAichiClearedLandmarkId,
  removeAichiClearedLandmarks,
  resetAllAichiClearedData,
  getFontSize,
  saveFontSize,
  getLanguage,
  saveLanguage,
} from './utils/storage';
import { t } from './utils/i18n';
import {
  calculateHaversineDistance,
  unprojectMapToGeo,
  findNearestPrefecture,
  checkNearPinReal,
  checkNearPinSvg,
  getNearestLandmarkInfo,
  getNearPinThresholdKm,
  getPinpointThresholdKm,
} from './utils/geo';
import { getZoomRiskInfo } from './utils/zoomRisk';
import { getCategoryInfo } from './utils/landmarkImages';

// コンポーネント群
import { GameHUD } from './components/GameHUD';
import { GsiJapanMap, GsiJapanMapHandle } from './components/GsiJapanMap';
import { JapanMap } from './components/JapanMap';
import { DartOverlay } from './components/DartOverlay';
import { BasicTourMissionBar } from './components/BasicTourMissionBar';
import { PrefectureClearModal } from './components/PrefectureClearModal';
import { LandmarkHitModal } from './components/LandmarkHitModal';
import { RallyStatusBar } from './components/RallyStatusBar';
import { PrefectureModal } from './components/PrefectureModal';
import { PassportModal } from './components/PassportModal';
import { GameOverModal } from './components/GameOverModal';
import { RallyGameOverModal } from './components/RallyGameOverModal';
import { RallyCourseSelectModal } from './components/RallyCourseSelectModal';
import { HelpModal } from './components/HelpModal';
import { AichiCitySelectModal } from './components/AichiCitySelectModal';
import { AichiMissionBar } from './components/AichiMissionBar';
import { CityClearModal } from './components/CityClearModal';
import { QuizMissionBar } from './components/QuizMissionBar';
import { QuizResultModal } from './components/QuizResultModal';
import { QuizGameOverModal } from './components/QuizGameOverModal';

// 8方位定義
const WIND_DIRECTIONS: Array<{ dir: WindDirection; angle: number; dx: number; dy: number }> = [
  { dir: '北', angle: 0, dx: 0, dy: 1 },
  { dir: '北東', angle: 45, dx: -0.7, dy: 0.7 },
  { dir: '東', angle: 90, dx: -1, dy: 0 },
  { dir: '南東', angle: 135, dx: -0.7, dy: -0.7 },
  { dir: '南', angle: 180, dx: 0, dy: -1 },
  { dir: '南西', angle: 225, dx: 0.7, dy: -0.7 },
  { dir: '西', angle: 270, dx: 1, dy: 0 },
  { dir: '北西', angle: 315, dx: 0.7, dy: 0.7 },
];

export const App: React.FC = () => {
  // 国土地理院マップインスタンスAPI ref
  const gsiMapRef = useRef<GsiJapanMapHandle>(null);

  // ゲームモード: 初期状態は「基本モード」、マップは「国土地理院マップ (gsi)」
  const [mode, setMode] = useState<GameMode>('basic');
  const [mapType, setMapType] = useState<MapType>('gsi');
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [zoomLevel, setZoomLevel] = useState<number>(6); // Leafletズーム (5〜16)
  // 難易度設定: easy (目標表示ON) / normal (目標表示OFF・距離表示) / hard (目標表示OFF・距離なし)
  const [difficulty, setDifficulty] = useState<GameDifficulty>(() => getGameDifficulty());
  const difficultyRef = useRef<GameDifficulty>(getGameDifficulty());
  difficultyRef.current = difficulty;
  // 言語設定: ja (日本語) / en (英語)
  const [language, setLanguage] = useState<Language>(() => getLanguage());
  
  // HUDボタンクリック時の言語切り替え
  const handleToggleLanguage = useCallback(() => {
    audio.playClickSound();
    setLanguage((prev) => {
      const next: Language = prev === 'ja' ? 'en' : 'ja';
      saveLanguage(next);
      return next;
    });
  }, []);

  // 言語変更時にブラウザタイトルを動的更新
  useEffect(() => {
    document.title = t('browserTitle', language);
  }, [language]);

  // フォントサイズ設定: パーセンテージ数値 80〜160 (デフォルト 115%「大」)
  const [fontSize, setFontSize] = useState<number>(() => getFontSize());
  const [showFontToast, setShowFontToast] = useState(false);
  const fontToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedWheelDeltaRef = useRef<number>(0);
  const lastWheelStepTimeRef = useRef<number>(0);

  // HUDボタンクリック時の段階切り替え
  const handleToggleFontSize = () => {
    audio.playClickSound();
    setFontSize((prev) => {
      let next = 100;
      if (prev < 105) next = 115;      // 標準(100%) -> 大(115%)
      else if (prev < 135) next = 150; // 大(115%) -> 特大(150%)
      else if (prev < 185) next = 200; // 特大(150%) -> 超大(200%)
      else if (prev < 260) next = 300; // 超大(200%) -> 極大(300% 最大)
      else if (prev >= 260) next = 85; // 極大(300%) -> 小(85%)
      else next = 100;                 // 小(85%) -> 標準(100%)

      saveFontSize(next);
      return next;
    });

    setShowFontToast(true);
    if (fontToastTimerRef.current) clearTimeout(fontToastTimerRef.current);
    fontToastTimerRef.current = setTimeout(() => setShowFontToast(false), 1200);
  };

  // Ctrl + マウスホイールによる無段階/段階フォントサイズ変更 (上限300%)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;

      // ブラウザ既定のページズーム（およびLeaflet等の地図ズーム）を防止
      e.preventDefault();
      e.stopPropagation();

      accumulatedWheelDeltaRef.current += e.deltaY;
      const now = Date.now();

      // 感度調整: 累積デルタまたは一定時間経過で1ステップ (5%) 変更
      if (Math.abs(accumulatedWheelDeltaRef.current) >= 40 || now - lastWheelStepTimeRef.current > 100) {
        const isEnlarge = accumulatedWheelDeltaRef.current < 0;
        accumulatedWheelDeltaRef.current = 0;
        lastWheelStepTimeRef.current = now;

        setFontSize((prev) => {
          const step = 5;
          const next = isEnlarge
            ? Math.min(300, Math.round((prev + step) / step) * step) // 上限300%
            : Math.max(80, Math.round((prev - step) / step) * step);
          saveFontSize(next);
          return next;
        });

        // 変更をユーザーに分かりやすくトースト通知
        setShowFontToast(true);
        if (fontToastTimerRef.current) clearTimeout(fontToastTimerRef.current);
        fontToastTimerRef.current = setTimeout(() => {
          setShowFontToast(false);
        }, 1200);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      if (fontToastTimerRef.current) clearTimeout(fontToastTimerRef.current);
    };
  }, []);

  // ズーム連動リスク＆リターン情報の即時算出
  const currentZoomRisk = getZoomRiskInfo(zoomLevel, mapType === 'stylized');

  // 風シミュレーション
  const [wind, setWind] = useState<WindState>({
    speed: 3.2,
    direction: '北西',
    angleDeg: 315,
    dx: 0.7,
    dy: 0.7,
  });

  // 音響設定
  const [isMuted, setIsMuted] = useState(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  // パスポート & 実績 & 永続データ
  const [passportRecords, setPassportRecords] = useState<Record<number, PassportRecord>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [completedRallies, setCompletedRallies] = useState<string[]>([]);
  const [sniperHighScore, setSniperHighScore] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // ダーツ投てき・物理
  const [currentHits, setCurrentHits] = useState<DartHit[]>([]);
  const [activeDart, setActiveDart] = useState<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    progress: number;
    windDriftX?: number;
    windDriftY?: number;
    zoomLevel?: number;
  } | null>(null);

  // プルバック投てきドラッグ状態
  const [pullBackState, setPullBackState] = useState<{
    isPulling: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // 名所命中によって発動する「旅の加護（属性ボーナス）」ステート
  const [activeBlessing, setActiveBlessing] = useState<LandmarkBlessing | null>(null);

  // -------------------------------------------------------------
  // 1. 新「基本モード (名所ニアピン巡り)」ステート
  // -------------------------------------------------------------
  const [basicTourState, setBasicTourState] = useState<BasicTourState>(() => {
    const basicCleared = getBasicClearedPrefIds();
    const uncleared = PREFECTURES.filter((p) => !basicCleared.includes(p.id));
    const initialPref = uncleared.length > 0
      ? uncleared[Math.floor(Math.random() * uncleared.length)]
      : PREFECTURES[0];
    const currentDiff = getGameDifficulty();
    const initialLandmarks = getRandomLandmarksForPrefecture(initialPref.id, 3, currentDiff);

    return {
      currentPref: initialPref,
      landmarks: initialLandmarks,
      clearedLandmarkIds: [],
      clearedPrefIds: basicCleared,
      totalClearedCount: basicCleared.length,
      justClearedLandmark: null,
      attemptsForCurrentPref: 0,
    };
  });

  const basicTourStateRef = useRef(basicTourState);
  basicTourStateRef.current = basicTourState;

  // 2. スナイパーモードステート (全国からランダム名所を1つ指定)
  const [sniperState, setSniperState] = useState<SniperGameState>(() => {
    const initialTarget = getRandomNationalLandmark();
    const initialPref = getPrefectureById(initialTarget.prefId) || null;
    return {
      currentTarget: initialTarget,
      currentTargetPref: initialPref,
      remainingThrows: 10,
      totalThrows: 10,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctHits: 0,
      history: [],
      isFinished: false,
      timeStarted: Date.now(),
    };
  });

  // 3. ラリーモードステート
  const [rallyState, setRallyState] = useState<RallyGameState>({
    currentCourse: RALLY_COURSES[0],
    currentStepIndex: 0,
    totalAttempts: 0,
    score: 0,
    completed: false,
    history: [],
    startedAt: Date.now(),
  });

  // 4. 愛知県詳細限定版ステート (市ごとに3名所)
  const [aichiState, setAichiState] = useState<AichiDetailState>(() => {
    const clearedCities = getAichiClearedCityIds();
    const initialCity = AICHI_CITIES[0]; // 名古屋市

    return {
      currentCity: initialCity,
      clearedLandmarkIdsForCity: [], // 常に0/3から挑戦スタート
      clearedCityIds: clearedCities,
      totalClearedCitiesCount: clearedCities.length,
      attemptsForCurrentCity: 0,
      justClearedLandmark: null,
    };
  });
  const aichiStateRef = useRef(aichiState);
  aichiStateRef.current = aichiState;

  // ご当地クイズ推理モード進行状態
  const [quizState, setQuizState] = useState<QuizGameState>(() => ({
    questions: getRandomQuizSet(5),
    currentIndex: 0,
    unlockedHintLevel: 1,
    score: 0,
    correctCount: 0,
    results: [],
    isFinished: false,
    lastResult: null,
    startedAt: Date.now(),
  }));
  const quizStateRef = useRef(quizState);
  quizStateRef.current = quizState;

  // クイズリスタート
  const handleRestartQuiz = useCallback(() => {
    audio.playClickSound();
    const newQuestions = getRandomQuizSet(5);
    setQuizState({
      questions: newQuestions,
      currentIndex: 0,
      unlockedHintLevel: 1,
      score: 0,
      correctCount: 0,
      results: [],
      isFinished: false,
      lastResult: null,
      startedAt: Date.now(),
    });
    setCurrentHits([]);
    if (mapType === 'gsi') {
      gsiMapRef.current?.flyToLatLng(36.5, 137.5, 6);
    }
  }, [mapType]);

  // ヒント解放
  const handleUnlockQuizHint = useCallback((level: number) => {
    audio.playClickSound();
    setQuizState((prev) => ({
      ...prev,
      unlockedHintLevel: Math.max(prev.unlockedHintLevel, level),
    }));
  }, []);

  // 次のクイズ問題へ進む
  const handleNextQuizQuestion = useCallback(() => {
    audio.playClickSound();
    setQuizState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      const isFinished = nextIndex >= prev.questions.length;
      if (isFinished) {
        audio.playCheerSound();
      }
      return {
        ...prev,
        currentIndex: isFinished ? prev.currentIndex : nextIndex,
        unlockedHintLevel: 1,
        lastResult: null,
        isFinished,
      };
    });
    setCurrentHits([]);
    if (mapType === 'gsi') {
      gsiMapRef.current?.flyToLatLng(36.5, 137.5, 6);
    }
  }, [mapType]);

  // モーダル表示状態
  const [selectedPrefectureForModal, setSelectedPrefectureForModal] = useState<Prefecture | null>(null);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showRallyGameOverModal, setShowRallyGameOverModal] = useState(false);
  const [showRallySelectModal, setShowRallySelectModal] = useState(false);
  const [showPrefClearModal, setShowPrefClearModal] = useState(false);
  const [showAichiCitySelectModal, setShowAichiCitySelectModal] = useState(false);
  const [showCityClearModal, setShowCityClearModal] = useState(false);

  // 名所命中時の画像ポップアップモーダル用ステート
  const [hitLandmarkModalData, setHitLandmarkModalData] = useState<{
    landmark: Landmark;
    prefecture: Prefecture;
    score: number;
    isPinpoint: boolean;
    isPrefCleared: boolean;
    clearedCount: number;
  } | null>(null);

  // E2Eテスト・検証用グローバル関数
  useEffect(() => {
    (window as unknown as { __triggerHitModalForTest?: (id?: string) => void }).__triggerHitModalForTest = (landmarkId?: string) => {
      const lm = getLandmarkById(landmarkId || 'tokyo_tower') || getLandmarksByPrefectureId(13)[0];
      const pref = getPrefectureById(lm.prefId) || PREFECTURES[0];
      setHitLandmarkModalData({
        landmark: lm,
        prefecture: pref,
        score: 1500,
        isPinpoint: true,
        isPrefCleared: false,
        clearedCount: 1,
      });
    };
    (window as unknown as { __openPrefectureModalForTest?: (id?: number) => void }).__openPrefectureModalForTest = (prefId: number = 13) => {
      const pref = getPrefectureById(prefId) || PREFECTURES[0];
      setSelectedPrefectureForModal(pref);
    };
  }, []);

  // 未クリア都道府県のランダム選定 (県が変わったら着弾・メッセージを完全リセット)
  const pickNextUnclearedPrefecture = useCallback((clearedIds: number[]) => {
    setCurrentHits([]);
    setHitLandmarkModalData(null);
    const currentDiff = difficultyRef.current;
    const uncleared = PREFECTURES.filter((p) => !clearedIds.includes(p.id));
    if (uncleared.length === 0) {
      const randomPref = PREFECTURES[Math.floor(Math.random() * PREFECTURES.length)];
      const landmarks = getRandomLandmarksForPrefecture(randomPref.id, 3, currentDiff);
      setBasicTourState((prev) => ({
        ...prev,
        currentPref: randomPref,
        landmarks,
        clearedLandmarkIds: [],
        attemptsForCurrentPref: 0,
        justClearedLandmark: null,
      }));
      return;
    }

    const nextPref = uncleared[Math.floor(Math.random() * uncleared.length)];
    const landmarks = getRandomLandmarksForPrefecture(nextPref.id, 3, currentDiff);

    setBasicTourState((prev) => ({
      ...prev,
      currentPref: nextPref,
      landmarks,
      clearedLandmarkIds: [],
      attemptsForCurrentPref: 0,
      justClearedLandmark: null,
    }));
  }, []);

  // 県が変わった際に前の県の着弾データやクリアメッセージを確実に消去する安全監視
  const prevPrefIdRef = useRef<number | null>(null);
  useEffect(() => {
    const currentPrefId = basicTourState.currentPref?.id;
    if (prevPrefIdRef.current !== null && prevPrefIdRef.current !== currentPrefId) {
      setCurrentHits([]);
      setHitLandmarkModalData(null);
    }
    prevPrefIdRef.current = currentPrefId ?? null;
  }, [basicTourState.currentPref?.id]);

  // 基本モード: 現在の県の候補（全20箇所）から難易度連動で名所3箇所を引き直す (シャッフル・直前の名所を除外)
  const handleRerollLandmarks = useCallback(() => {
    audio.playClickSound();
    const currentPref = basicTourStateRef.current.currentPref;
    if (!currentPref) return;

    const currentIds = basicTourStateRef.current.landmarks.map((l) => l.id);
    const newLandmarks = getRandomLandmarksForPrefecture(currentPref.id, 3, difficultyRef.current, currentIds);
    setCurrentHits([]);
    setBasicTourState((prev) => ({
      ...prev,
      landmarks: newLandmarks,
      clearedLandmarkIds: [],
      attemptsForCurrentPref: 0,
      justClearedLandmark: null,
    }));
  }, []);

  // 愛知限定モード: 市の切り替えハンドラー (市を選んだら名所クリアフラグを0/3に解除して挑戦開始、制覇済み市はしっかり保持)
  const handleSelectAichiCity = useCallback((city: AichiCity) => {
    audio.playClickSound();
    setCurrentHits([]);
    setHitLandmarkModalData(null);

    // 最新の制覇済み市リストを取得 (制覇済み市は保持！)
    const currentClearedCities = getAichiClearedCityIds();

    setAichiState((prev) => ({
      ...prev,
      currentCity: city,
      clearedLandmarkIdsForCity: [], // 選んだ市は常に名所クリアフラグ解除 (0/3) から新鮮にスタート
      clearedCityIds: currentClearedCities,
      totalClearedCitiesCount: currentClearedCities.length,
      attemptsForCurrentCity: 0,
      justClearedLandmark: null,
    }));

    // 地図をその市にスムーズフォーカス
    if (mapType === 'gsi') {
      gsiMapRef.current?.flyToLatLng(city.coordinates.lat, city.coordinates.lng, city.zoomLevel);
    }
  }, [mapType]);

  // 愛知限定モード: 全市のクリアフラグを一括リセット
  const handleResetAllAichiCities = useCallback(() => {
    audio.playClickSound();
    resetAllAichiClearedData();
    setCurrentHits([]);
    setHitLandmarkModalData(null);

    setAichiState((prev) => ({
      ...prev,
      clearedLandmarkIdsForCity: [],
      clearedCityIds: [],
      totalClearedCitiesCount: 0,
      attemptsForCurrentCity: 0,
      justClearedLandmark: null,
    }));
  }, []);

  // 愛知限定モード: 次の未制覇の市へ進むハンドラー
  const handleAdvanceToNextAichiCity = useCallback(() => {
    setShowCityClearModal(false);
    setCurrentHits([]);
    const clearedCities = aichiStateRef.current.clearedCityIds;
    const uncleared = AICHI_CITIES.filter((c) => !clearedCities.includes(c.id));
    const nextCity = uncleared.length > 0 ? uncleared[0] : AICHI_CITIES[0];
    handleSelectAichiCity(nextCity);
  }, [handleSelectAichiCity]);

  // 初回データ読み込み
  useEffect(() => {
    const passport = getPassportData();
    const achs = getAchievements();
    const rallies = getCompletedRallies();
    const sniperScore = getSniperHighScore();
    const basicCleared = getBasicClearedPrefIds();
    const savedDifficulty = getGameDifficulty();

    setPassportRecords(passport);
    setAchievements(achs);
    setCompletedRallies(rallies);
    setSniperHighScore(sniperScore);
    setDifficulty(savedDifficulty);
    difficultyRef.current = savedDifficulty;

    const uncleared = PREFECTURES.filter((p) => !basicCleared.includes(p.id));
    const initialPref = uncleared.length > 0
      ? uncleared[Math.floor(Math.random() * uncleared.length)]
      : PREFECTURES[0];
    const initialLandmarks = getRandomLandmarksForPrefecture(initialPref.id, 3, savedDifficulty);

    setBasicTourState({
      currentPref: initialPref,
      landmarks: initialLandmarks,
      clearedLandmarkIds: [],
      clearedPrefIds: basicCleared,
      totalClearedCount: basicCleared.length,
      justClearedLandmark: null,
      attemptsForCurrentPref: 0,
    });

    const initialSniperTarget = getRandomNationalLandmark();
    const initialSniperPref = getPrefectureById(initialSniperTarget.prefId) || null;
    setSniperState((prev) => ({
      ...prev,
      currentTarget: initialSniperTarget,
      currentTargetPref: initialSniperPref,
    }));
  }, []);

  // 難易度変更ハンドラー (難易度に応じて基本モードの名所プールも即座に更新)
  const handleDifficultyChange = (newDiff: GameDifficulty) => {
    audio.playClickSound();
    setDifficulty(newDiff);
    difficultyRef.current = newDiff;
    saveGameDifficulty(newDiff);

    // 基本モードの場合、現在探索中の都道府県の名所を新しい難易度の名所プールから再選出 (直前名所を除外)
    const currentPref = basicTourStateRef.current.currentPref;
    if (currentPref) {
      const currentIds = basicTourStateRef.current.landmarks.map((l) => l.id);
      const newLandmarks = getRandomLandmarksForPrefecture(currentPref.id, 3, newDiff, currentIds);
      setCurrentHits([]);
      setBasicTourState((prev) => ({
        ...prev,
        landmarks: newLandmarks,
        clearedLandmarkIds: [],
        attemptsForCurrentPref: 0,
        justClearedLandmark: null,
      }));
    }
  };

  // 風の定期的な変化
  useEffect(() => {
    const timer = setInterval(() => {
      const randomWindItem = WIND_DIRECTIONS[Math.floor(Math.random() * WIND_DIRECTIONS.length)];
      const randomSpeed = Math.random() * 9.5 + Math.random() * 2.5;

      setWind({
        speed: Number(randomSpeed.toFixed(1)),
        direction: randomWindItem.dir,
        angleDeg: randomWindItem.angle,
        dx: randomWindItem.dx,
        dy: randomWindItem.dy,
      });
    }, 9000);

    return () => clearInterval(timer);
  }, []);

  // スナイパーリスタート (全国から名所をランダム選定)
  const handleRestartSniper = () => {
    audio.playClickSound();
    const target = getRandomNationalLandmark();
    const targetPref = getPrefectureById(target.prefId) || null;
    setSniperState({
      currentTarget: target,
      currentTargetPref: targetPref,
      remainingThrows: 10,
      totalThrows: 10,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctHits: 0,
      history: [],
      isFinished: false,
      timeStarted: Date.now(),
    });
    setCurrentHits([]);
    setShowGameOverModal(false);
    setIsNewHighScore(false);
  };

  // モード選択
  const handleSelectMode = (newMode: GameMode) => {
    audio.playClickSound();
    setMode(newMode);
    setCurrentHits([]);

    if (newMode === 'sniper') {
      handleRestartSniper();
    } else if (newMode === 'rally') {
      if (!rallyState.currentCourse) {
        setRallyState({
          currentCourse: RALLY_COURSES[0],
          currentStepIndex: 0,
          totalAttempts: 0,
          score: 0,
          completed: false,
          history: [],
          startedAt: Date.now(),
        });
      }
    } else if (newMode === 'aichi_detail') {
      const city = aichiStateRef.current.currentCity;
      if (mapType === 'gsi') {
        gsiMapRef.current?.flyToLatLng(city.coordinates.lat, city.coordinates.lng, city.zoomLevel);
      }
    } else if (newMode === 'quiz') {
      if (mapType === 'gsi') {
        gsiMapRef.current?.flyToLatLng(36.5, 137.5, 6);
      }
      if (quizStateRef.current.isFinished || quizStateRef.current.questions.length === 0) {
        handleRestartQuiz();
      }
    }
  };

  // ダーツ投てき実行
  const executeThrow = (
    screenTargetX: number,
    screenTargetY: number,
    mapLocalX: number,
    mapLocalY: number,
    hitPrefecture: Prefecture | null,
    targetLat?: number,
    targetLng?: number
  ) => {
    // 投てき開始時に前の名所通知が残っていれば即座に閉じる (連射・テンポ重視)
    setHitLandmarkModalData(null);

    // 発動中の加護をキャプチャし、今回の投擲に適用後に消費
    const currentBlessing = activeBlessing;
    if (activeBlessing) {
      setActiveBlessing(null);
    }

    // 加護による風変位の軽減計算
    let driftMultiplier = 1.0;
    let windSpeedMultiplier = 1.0;

    if (currentBlessing) {
      switch (currentBlessing.type) {
        case 'castle':
          // 城郭: 風の変位50%カット
          driftMultiplier = 0.5;
          break;
        case 'hotspring':
          // 温泉: 風速が和らぎブレ抑制
          windSpeedMultiplier = 0.4;
          driftMultiplier = 0.6;
          break;
        case 'modern_spot':
          // 近代名所: 風変位30%カット
          driftMultiplier = 0.7;
          break;
        case 'garden':
          // 名園: 風変位30%カット
          driftMultiplier = 0.7;
          break;
        case 'nature':
          // 自然: 風変位20%カット
          driftMultiplier = 0.8;
          break;
        default:
          break;
      }
    }

    const startX = window.innerWidth * 0.5;
    const startY = window.innerHeight * 0.95;

    // ズームレベルに応じた風のピクセル変位 (広域＝小さく安定、拡大＝激しく吹き流される)
    const effectiveWindSpeed = wind.speed * windSpeedMultiplier;
    const driftFactor = currentZoomRisk.driftFactor * driftMultiplier;
    const driftX = wind.dx * effectiveWindSpeed * driftFactor;
    const driftY = wind.dy * effectiveWindSpeed * driftFactor;

    const finalScreenX = screenTargetX + driftX;
    const finalScreenY = screenTargetY + driftY;

    audio.playThrowSound();

    const startTime = performance.now();
    const duration = 440; // 放物線弾道の自然な滞空時間

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      setActiveDart({
        fromX: startX,
        fromY: startY,
        toX: screenTargetX,
        toY: screenTargetY,
        progress,
        windDriftX: driftX,
        windDriftY: driftY,
        zoomLevel: currentZoomRisk.zoomLevel,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setActiveDart(null);
        // 狙った位置の緯度経度（投擲位置）
        let aimLat = targetLat;
        let aimLng = targetLng;
        if ((aimLat === undefined || aimLng === undefined) && mapType === 'gsi') {
          const aimGeo = gsiMapRef.current?.screenPointToLatLng(screenTargetX, screenTargetY);
          if (aimGeo) {
            aimLat = aimGeo.lat;
            aimLng = aimGeo.lng;
          }
        }

        // 着弾予定位置の緯度経度（風ドリフト後）
        let expectedFinalLat: number | undefined;
        let expectedFinalLng: number | undefined;
        if (mapType === 'gsi') {
          const finalGeo = gsiMapRef.current?.screenPointToLatLng(finalScreenX, finalScreenY);
          if (finalGeo) {
            expectedFinalLat = finalGeo.lat;
            expectedFinalLng = finalGeo.lng;
          }
        }

        handleHitArrival(
          finalScreenX,
          finalScreenY,
          mapLocalX,
          mapLocalY,
          hitPrefecture,
          expectedFinalLat ?? aimLat,
          expectedFinalLng ?? aimLng,
          screenTargetX,
          screenTargetY,
          aimLat,
          aimLng,
          currentBlessing
        );
      }
    };

    requestAnimationFrame(animate);
  };

  // -------------------------------------------------------------
  // 着弾判定ロジック
  // -------------------------------------------------------------
  const handleHitArrival = (
    screenX: number,
    screenY: number,
    mapX: number,
    mapY: number,
    prefecture: Prefecture | null,
    hitLat?: number,
    hitLng?: number,
    aimScreenX?: number,
    aimScreenY?: number,
    aimLat?: number,
    aimLng?: number,
    usedBlessing?: LandmarkBlessing | null
  ) => {
    const firstThrowAch = unlockAchievement('first_throw');
    if (firstThrowAch) setAchievements(getAchievements());

    // 発動中だった「旅の加護（属性ボーナス）」を展開
    let bonusThresholdKm = 0;
    let pinpointMultiplier = 1.0;
    let scoreMultiplier = 1.0;
    let bonusZoomMultiplier = 0.0;

    if (usedBlessing) {
      switch (usedBlessing.type) {
        case 'shrine_temple':
          // 寺社仏閣: ニアピン判定 +5km 拡大
          bonusThresholdKm = 5;
          break;
        case 'garden':
          // 名園: ニアピン判定 +3km 拡大
          bonusThresholdKm = 3;
          break;
        case 'heritage':
          // 歴史遺産: ピンポイント直撃判定 2倍拡大
          pinpointMultiplier = 2.0;
          break;
        case 'gourmet':
          // 美味・食文化: 獲得スコア 1.5倍ブースト
          scoreMultiplier = 1.5;
          break;
        case 'nature':
          // 自然・絶景: ズーム倍率 +0.5x ボーナス
          bonusZoomMultiplier = 0.5;
          break;
        default:
          break;
      }
    }

    // 最終着弾地点の精密な緯度経度を逆算 (風ドリフトやプルバック投てき対応)
    let finalLat = hitLat;
    let finalLng = hitLng;
    if (mapType === 'gsi') {
      const geo = gsiMapRef.current?.screenPointToLatLng(screenX, screenY);
      if (geo && !isNaN(geo.lat) && !isNaN(geo.lng)) {
        finalLat = geo.lat;
        finalLng = geo.lng;
      }
    } else if (mapType === 'stylized' && (!finalLat || !finalLng)) {
      const geo = unprojectMapToGeo(mapX, mapY);
      finalLat = geo.lat;
      finalLng = geo.lng;
    }

    // 万一緯度経度が未定・NaNの場合の確実なフォールバック
    const fallbackPref = basicTourState.currentPref || PREFECTURES[0];
    if (finalLat === undefined || isNaN(finalLat)) {
      finalLat = aimLat ?? fallbackPref.coordinates.lat;
    }
    if (finalLng === undefined || isNaN(finalLng)) {
      finalLng = aimLng ?? fallbackPref.coordinates.lng;
    }

    const effectiveAimLat = aimLat ?? finalLat;
    const effectiveAimLng = aimLng ?? finalLng;

    const hitPrefecture = (finalLat && finalLng)
      ? (findNearestPrefecture(finalLat, finalLng, PREFECTURES)?.prefecture || prefecture)
      : prefecture;

    // -----------------------------------------------------------
    // A. 新「基本モード (名所ニアピン巡り)」
    // -----------------------------------------------------------
    if (mode === 'basic') {
      const liveState = basicTourStateRef.current;
      const currentPref = liveState.currentPref || hitPrefecture || PREFECTURES[0];
      const landmarks = liveState.landmarks.length > 0 ? liveState.landmarks : getLandmarksByPrefectureId(currentPref.id);
      const clearedLandmarkIds = liveState.clearedLandmarkIds;

      let nearPinResult: { landmark: Landmark; distancePx: number; isPinpoint: boolean } | null = null;
      let minDistanceToAnyTarget = 9999;

      // 1. 緯度経度による精密大圏距離判定 (地理院マップ時 / 難易度連動 & 加護ボーナス連動)
      if (finalLat !== undefined && finalLng !== undefined) {
        const res = checkNearPinReal(
          finalLat,
          finalLng,
          landmarks,
          clearedLandmarkIds,
          difficulty,
          bonusThresholdKm,
          pinpointMultiplier
        );
        if (res) {
          nearPinResult = {
            landmark: res.landmark,
            distancePx: Math.round(res.distanceKm * 10),
            isPinpoint: res.isPinpoint,
          };
        }
      }

      // 2. 画面上の実測座標判定 (Easyモード等で目標アイコンが表示されている場合)
      if (!nearPinResult) {
        for (const lm of landmarks) {
          if (clearedLandmarkIds.includes(lm.id)) continue;
          const elem = document.getElementById(`landmark-target-${lm.id}`);
          if (elem) {
            const rect = elem.getBoundingClientRect();
            const lmCenterX = rect.left + rect.width / 2;
            const lmCenterY = rect.top + rect.height / 2;
            const distPx = Math.hypot(screenX - lmCenterX, screenY - lmCenterY);

            if (distPx < minDistanceToAnyTarget) {
              minDistanceToAnyTarget = distPx;
            }

            // ズームに応じたニアピン許容半径
            const effectiveNearPinRadius = currentZoomRisk.nearPinRadiusPx + (bonusThresholdKm > 0 ? 15 : 0);
            const effectivePinpointRadius = currentZoomRisk.pinpointRadiusPx * pinpointMultiplier;

            if (distPx <= effectiveNearPinRadius) {
              const isPinpoint = distPx <= effectivePinpointRadius;
              nearPinResult = { landmark: lm, distancePx: Math.round(distPx), isPinpoint };
              break;
            }
          }
        }
      }

      // 3. SVG座標フォールバック判定
      if (!nearPinResult && mapType === 'stylized') {
        const res = checkNearPinSvg(
          mapX,
          mapY,
          currentPref,
          landmarks,
          clearedLandmarkIds
        );
        if (res) {
          const isPinpoint = res.distancePx <= currentZoomRisk.pinpointRadiusPx * pinpointMultiplier;
          nearPinResult = { landmark: res.landmark, distancePx: Math.round(res.distancePx), isPinpoint };
        }
      }

      // ニアピン命中！
      if (nearPinResult) {
        const hitLm = nearPinResult.landmark;
        const isPinpoint = nearPinResult.isPinpoint;
        const nextClearedIds = [...clearedLandmarkIds, hitLm.id];

        // スコア計算: 基本点 1000 × 有効ズーム倍率 × ピンポイントボーナス × 難易度ボーナス × グルメ加護
        const baseScore = 1000;
        const pinpointBonus = isPinpoint ? 1.5 : 1.0;
        const difficultyMultiplier = difficulty === 'hard' ? 1.8 : difficulty === 'normal' ? 1.3 : 1.0;
        const effectiveZoomMultiplier = currentZoomRisk.multiplier + bonusZoomMultiplier;
        const earnedScore = Math.round(
          baseScore * effectiveZoomMultiplier * pinpointBonus * difficultyMultiplier * scoreMultiplier
        );

        if (isPinpoint) {
          audio.playPinpointBullSound();
        } else {
          audio.playSuccessSound();
        }
        unlockAchievement('first_near_pin');

        // 名所の属性に応じた「旅の加護」を発動（次の1投で有効）
        const catInfo = getCategoryInfo(hitLm.category);
        setActiveBlessing({
          type: hitLm.category,
          title: catInfo.blessingName,
          description: catInfo.blessingDesc,
          icon: catInfo.icon,
          appliedAt: Date.now(),
          durationThrows: 1,
        });

        const hitData: DartHit = {
          id: `hit-${Date.now()}`,
          x: mapX,
          y: mapY,
          screenX,
          screenY,
          lat: finalLat || hitLm.coordinates.lat,
          lng: finalLng || hitLm.coordinates.lng,
          prefecture: currentPref,
          hitLandmark: hitLm,
          timestamp: Date.now(),
          score: earnedScore,
          isCorrect: true,
          isNearPin: true,
          isPinpointBull: isPinpoint,
          distanceToTargetKm: 0,
          nearestLandmarkName: hitLm.name,
          aimLat: effectiveAimLat,
          aimLng: effectiveAimLng,
          aimScreenX,
          aimScreenY,
          zoomMultiplier: currentZoomRisk.multiplier,
          zoomLevel: currentZoomRisk.zoomLevel,
        };
        setCurrentHits((prev) => [...prev, hitData]);

        const isPrefCleared = nextClearedIds.length >= 3;

        console.log('[DEBUG] Setting hitLandmarkModalData for:', hitLm.name, 'isPrefCleared:', isPrefCleared);

        // 名所画像ポップアップモーダルを表示
        setHitLandmarkModalData({
          landmark: hitLm,
          prefecture: currentPref,
          score: earnedScore,
          isPinpoint,
          isPrefCleared,
          clearedCount: nextClearedIds.length,
        });

        // 3箇所すべて制覇判定！
        if (isPrefCleared) {
          const updatedClearedPrefs = saveBasicClearedPrefId(currentPref.id);
          savePassportRecord(currentPref.id, earnedScore, true);
          setPassportRecords(getPassportData());

          unlockAchievement('first_pref_clear');
          if (updatedClearedPrefs.length >= 10) unlockAchievement('japan_complete_10');
          if (updatedClearedPrefs.length >= 47) unlockAchievement('japan_complete_all');
          setAchievements(getAchievements());

          setBasicTourState((prev) => ({
            ...prev,
            clearedLandmarkIds: nextClearedIds,
            clearedPrefIds: updatedClearedPrefs,
            totalClearedCount: updatedClearedPrefs.length,
            attemptsForCurrentPref: prev.attemptsForCurrentPref + 1,
            justClearedLandmark: hitLm,
          }));
        } else {
          setBasicTourState((prev) => ({
            ...prev,
            clearedLandmarkIds: nextClearedIds,
            attemptsForCurrentPref: prev.attemptsForCurrentPref + 1,
            justClearedLandmark: hitLm,
          }));
        }
      } else {
        // 外れ判定
        // 高ズーム（市区町村・敷地単位）で、目標近郊から流された場合は OB（枠外）と判定！
        const isHighZoom = currentZoomRisk.riskLevel === 'high' || currentZoomRisk.riskLevel === 'extreme';
        const isOb = isHighZoom && minDistanceToAnyTarget <= 180;

        if (isOb) {
          audio.playObSound();
        } else {
          audio.playMissSound();
        }

        // 最寄りの未クリア目標名所への距離と方角を計算 (Hard以外でのフィードバック用)
        const effectiveLat = finalLat ?? currentPref.coordinates.lat;
        const effectiveLng = finalLng ?? currentPref.coordinates.lng;
        const nearestInfo = getNearestLandmarkInfo(
          effectiveLat,
          effectiveLng,
          landmarks,
          clearedLandmarkIds
        );

        const hitData: DartHit = {
          id: `hit-${Date.now()}`,
          x: mapX,
          y: mapY,
          screenX,
          screenY,
          lat: finalLat,
          lng: finalLng,
          prefecture: hitPrefecture,
          timestamp: Date.now(),
          score: 0,
          isCorrect: false,
          isOb,
          distanceToTargetKm: nearestInfo?.distanceKm,
          targetBearing: nearestInfo?.direction,
          nearestLandmarkName: nearestInfo?.landmark.name,
          aimLat: effectiveAimLat,
          aimLng: effectiveAimLng,
          aimScreenX,
          aimScreenY,
          zoomMultiplier: currentZoomRisk.multiplier,
          zoomLevel: currentZoomRisk.zoomLevel,
        };
        setCurrentHits((prev) => [...prev, hitData]);
        setBasicTourState((prev) => ({
          ...prev,
          attemptsForCurrentPref: prev.attemptsForCurrentPref + 1,
        }));
      }
      return;
    }

    // -----------------------------------------------------------
    // A2. 愛知県詳細限定版 (市ごとに3つの厳選名所を狙う)
    // -----------------------------------------------------------
    if (mode === 'aichi_detail') {
      const liveState = aichiStateRef.current;
      const currentCity = liveState.currentCity;
      const aichiPref = PREFECTURES.find((p) => p.id === 23) || PREFECTURES[22];
      const landmarks = currentCity.landmarks;
      const clearedLandmarkIds = liveState.clearedLandmarkIdsForCity;

      let nearPinResult: { landmark: Landmark; distancePx: number; isPinpoint: boolean } | null = null;
      let minDistanceToAnyTarget = 9999;

      // 1. 緯度経度による精密大圏距離判定 (地理院マップ時 / 難易度連動 & 加護ボーナス連動)
      if (finalLat !== undefined && finalLng !== undefined) {
        const res = checkNearPinReal(
          finalLat,
          finalLng,
          landmarks,
          clearedLandmarkIds,
          difficulty,
          bonusThresholdKm,
          pinpointMultiplier,
          true // 愛知モード専用判定 (normal: 5km, easy: 10km, hard: 2.5km)
        );
        if (res) {
          nearPinResult = {
            landmark: res.landmark,
            distancePx: Math.round(res.distanceKm * 10),
            isPinpoint: res.isPinpoint,
          };
        }
      }

      // 2. 画面上の実測座標判定 (Easyモード等で目標アイコンが表示されている場合)
      if (!nearPinResult) {
        for (const lm of landmarks) {
          if (clearedLandmarkIds.includes(lm.id)) continue;
          const elem = document.getElementById(`landmark-target-${lm.id}`);
          if (elem) {
            const rect = elem.getBoundingClientRect();
            const lmCenterX = rect.left + rect.width / 2;
            const lmCenterY = rect.top + rect.height / 2;
            const distPx = Math.hypot(screenX - lmCenterX, screenY - lmCenterY);

            if (distPx < minDistanceToAnyTarget) {
              minDistanceToAnyTarget = distPx;
            }

            const effectiveNearPinRadius = currentZoomRisk.nearPinRadiusPx + (bonusThresholdKm > 0 ? 15 : 0);
            const effectivePinpointRadius = currentZoomRisk.pinpointRadiusPx * pinpointMultiplier;

            if (distPx <= effectiveNearPinRadius) {
              const isPinpoint = distPx <= effectivePinpointRadius;
              nearPinResult = { landmark: lm, distancePx: Math.round(distPx), isPinpoint };
              break;
            }
          }
        }
      }

      // 3. SVG座標フォールバック判定
      if (!nearPinResult && mapType === 'stylized') {
        const res = checkNearPinSvg(
          mapX,
          mapY,
          aichiPref,
          landmarks,
          clearedLandmarkIds
        );
        if (res) {
          const isPinpoint = res.distancePx <= currentZoomRisk.pinpointRadiusPx * pinpointMultiplier;
          nearPinResult = { landmark: res.landmark, distancePx: Math.round(res.distancePx), isPinpoint };
        }
      }

      // ニアピン命中！
      if (nearPinResult) {
        const hitLm = nearPinResult.landmark;
        const isPinpoint = nearPinResult.isPinpoint;
        const nextClearedIds = [...clearedLandmarkIds, hitLm.id];

        // スコア計算: 基本点 1200 × ズーム倍率 × ピンポイントボーナス × 難易度ボーナス × グルメ加護
        const baseScore = 1200;
        const pinpointBonus = isPinpoint ? 1.5 : 1.0;
        const difficultyMultiplier = difficulty === 'hard' ? 1.8 : difficulty === 'normal' ? 1.3 : 1.0;
        const effectiveZoomMultiplier = currentZoomRisk.multiplier + bonusZoomMultiplier;
        const earnedScore = Math.round(
          baseScore * effectiveZoomMultiplier * pinpointBonus * difficultyMultiplier * scoreMultiplier
        );

        if (isPinpoint) {
          audio.playPinpointBullSound();
        } else {
          audio.playSuccessSound();
        }
        unlockAchievement('first_near_pin');

        // 名所の属性に応じた「旅の加護」を発動
        const catInfo = getCategoryInfo(hitLm.category);
        setActiveBlessing({
          type: hitLm.category,
          title: catInfo.blessingName,
          description: catInfo.blessingDesc,
          icon: catInfo.icon,
          appliedAt: Date.now(),
          durationThrows: 1,
        });

        // 永続化
        saveAichiClearedLandmarkId(hitLm.id);

        const hitData: DartHit = {
          id: `hit-${Date.now()}`,
          x: mapX,
          y: mapY,
          screenX,
          screenY,
          lat: finalLat || hitLm.coordinates.lat,
          lng: finalLng || hitLm.coordinates.lng,
          prefecture: aichiPref,
          hitLandmark: hitLm,
          timestamp: Date.now(),
          score: earnedScore,
          isCorrect: true,
          isNearPin: true,
          isPinpointBull: isPinpoint,
          distanceToTargetKm: 0,
          nearestLandmarkName: hitLm.name,
          aimLat: effectiveAimLat,
          aimLng: effectiveAimLng,
          aimScreenX,
          aimScreenY,
          zoomMultiplier: currentZoomRisk.multiplier,
          zoomLevel: currentZoomRisk.zoomLevel,
        };
        setCurrentHits((prev) => [...prev, hitData]);

        const isCityCleared = nextClearedIds.length >= 3;

        // 名所ポップアップモーダルを表示
        setHitLandmarkModalData({
          landmark: hitLm,
          prefecture: aichiPref,
          score: earnedScore,
          isPinpoint,
          isPrefCleared: isCityCleared,
          clearedCount: nextClearedIds.length,
        });

        // 市の全3名所制覇判定！
        if (isCityCleared) {
          const updatedClearedCities = saveAichiClearedCityId(currentCity.id);
          savePassportRecord(23, earnedScore, true);
          setPassportRecords(getPassportData());

          setAichiState((prev) => ({
            ...prev,
            clearedLandmarkIdsForCity: nextClearedIds,
            clearedCityIds: updatedClearedCities,
            totalClearedCitiesCount: updatedClearedCities.length,
            attemptsForCurrentCity: prev.attemptsForCurrentCity + 1,
            justClearedLandmark: hitLm,
          }));
        } else {
          setAichiState((prev) => ({
            ...prev,
            clearedLandmarkIdsForCity: nextClearedIds,
            attemptsForCurrentCity: prev.attemptsForCurrentCity + 1,
            justClearedLandmark: hitLm,
          }));
        }
      } else {
        // 外れ判定
        const isHighZoom = currentZoomRisk.riskLevel === 'high' || currentZoomRisk.riskLevel === 'extreme';
        const isOb = isHighZoom && minDistanceToAnyTarget <= 180;

        if (isOb) {
          audio.playObSound();
        } else {
          audio.playMissSound();
        }

        const effectiveLat = finalLat ?? currentCity.coordinates.lat;
        const effectiveLng = finalLng ?? currentCity.coordinates.lng;
        const nearestInfo = getNearestLandmarkInfo(
          effectiveLat,
          effectiveLng,
          landmarks,
          clearedLandmarkIds
        );

        const hitData: DartHit = {
          id: `hit-${Date.now()}`,
          x: mapX,
          y: mapY,
          screenX,
          screenY,
          lat: finalLat,
          lng: finalLng,
          prefecture: aichiPref,
          timestamp: Date.now(),
          score: 0,
          isCorrect: false,
          isOb,
          distanceToTargetKm: nearestInfo?.distanceKm,
          targetBearing: nearestInfo?.direction,
          nearestLandmarkName: nearestInfo?.landmark.name,
          aimLat: effectiveAimLat,
          aimLng: effectiveAimLng,
          aimScreenX,
          aimScreenY,
          zoomMultiplier: currentZoomRisk.multiplier,
          zoomLevel: currentZoomRisk.zoomLevel,
        };
        setCurrentHits((prev) => [...prev, hitData]);
        setAichiState((prev) => ({
          ...prev,
          attemptsForCurrentCity: prev.attemptsForCurrentCity + 1,
        }));
      }
      return;
    }

    // -----------------------------------------------------------
    // B. スナイパーモード (全国470名所からランダムに1つ指定して狙う)
    // -----------------------------------------------------------
    if (mode === 'sniper') {
      const target = sniperState.currentTarget;
      const targetPref = sniperState.currentTargetPref;
      let isCorrect = false;
      let isBull = false;
      let isPinpointBull = false;
      let isOb = false;
      let currentScore = 0;
      let newCombo = sniperState.combo;
      let distKm = 9999;

      // ズーム倍率 (1.0x 〜 5.0x)
      const zoomMultiplier = currentZoomRisk.multiplier;

      if (target && finalLat !== undefined && finalLng !== undefined) {
        distKm = calculateHaversineDistance(
          target.coordinates.lat,
          target.coordinates.lng,
          finalLat,
          finalLng
        );

        const nearPinThresholdKm = getNearPinThresholdKm(difficulty) + bonusThresholdKm; // 加護で拡大
        const pinpointThresholdKm = getPinpointThresholdKm(difficulty) * pinpointMultiplier;

        if (distKm <= nearPinThresholdKm) {
          isCorrect = true;
          newCombo += 1;
          isPinpointBull = distKm <= pinpointThresholdKm;
          isBull = isPinpointBull || distKm <= 5.0;

          const accuracyMultiplier = isPinpointBull ? 2.0 : isBull ? 1.5 : 1.0;
          const comboMultiplier = Math.min(3.0, 1.0 + (newCombo - 1) * 0.2);
          const difficultyMultiplier = difficulty === 'hard' ? 1.8 : difficulty === 'normal' ? 1.3 : 1.0;
          const effectiveZoomMultiplier = zoomMultiplier + bonusZoomMultiplier;
          currentScore = Math.round(
            1000 * accuracyMultiplier * comboMultiplier * effectiveZoomMultiplier * difficultyMultiplier * scoreMultiplier
          );

          if (isPinpointBull) {
            audio.playPinpointBullSound();
          } else {
            audio.playSuccessSound();
          }

          if (newCombo >= 5) unlockAchievement('sniper_combo_5');
          if (isPinpointBull) unlockAchievement('wide_aim_bull');

          // スナイパー目標命中時にも「旅の加護」を発動
          const catInfo = getCategoryInfo(target.category);
          setActiveBlessing({
            type: target.category,
            title: catInfo.blessingName,
            description: catInfo.blessingDesc,
            icon: catInfo.icon,
            appliedAt: Date.now(),
            durationThrows: 1,
          });

          // 名所画像ポップアップモーダルを表示
          setHitLandmarkModalData({
            landmark: target,
            prefecture: targetPref || PREFECTURES[0],
            score: currentScore,
            isPinpoint: isPinpointBull,
            isPrefCleared: false,
            clearedCount: sniperState.correctHits + 1,
          });
        } else {
          isCorrect = false;
          newCombo = 0;
          // 高ズーム時の外れは OB
          const isHighZoom = currentZoomRisk.riskLevel === 'high' || currentZoomRisk.riskLevel === 'extreme';
          isOb = isHighZoom && distKm > 30;
          if (isOb) {
            audio.playObSound();
          } else {
            audio.playMissSound();
          }
        }
      }

      const updatedCorrectHits = sniperState.correctHits + (isCorrect ? 1 : 0);
      const updatedScore = sniperState.score + currentScore;
      const updatedMaxCombo = Math.max(sniperState.maxCombo, newCombo);
      const updatedRemaining = sniperState.remainingThrows - 1;

      const hitData: DartHit = {
        id: `hit-${Date.now()}`,
        x: mapX,
        y: mapY,
        screenX,
        screenY,
        lat: finalLat,
        lng: finalLng,
        prefecture: hitPrefecture,
        targetPrefecture: targetPref,
        hitLandmark: isCorrect && target ? target : undefined,
        timestamp: Date.now(),
        score: currentScore,
        isCorrect,
        isNearPin: isCorrect,
        isBull,
        isPinpointBull,
        isOb,
        combo: newCombo,
        distanceToTargetKm: distKm < 9000 ? distKm : undefined,
        nearestLandmarkName: target?.name,
        aimLat: effectiveAimLat,
        aimLng: effectiveAimLng,
        aimScreenX,
        aimScreenY,
        zoomMultiplier,
        zoomLevel: currentZoomRisk.zoomLevel,
      };

      setCurrentHits((prev) => [...prev, hitData]);

      if (updatedRemaining <= 0) {
        const isNewRecord = saveSniperHighScore(updatedScore);
        setIsNewHighScore(isNewRecord);
        setSniperHighScore(getSniperHighScore());

        setSniperState({
          ...sniperState,
          score: updatedScore,
          combo: newCombo,
          maxCombo: updatedMaxCombo,
          correctHits: updatedCorrectHits,
          remainingThrows: 0,
          isFinished: true,
          history: [...sniperState.history, hitData],
        });

        setTimeout(() => {
          setShowGameOverModal(true);
        }, 600);
      } else {
        const nextTarget = getRandomNationalLandmark();
        const nextPref = getPrefectureById(nextTarget.prefId) || null;
        setSniperState({
          ...sniperState,
          currentTarget: nextTarget,
          currentTargetPref: nextPref,
          score: updatedScore,
          combo: newCombo,
          maxCombo: updatedMaxCombo,
          correctHits: updatedCorrectHits,
          remainingThrows: updatedRemaining,
          history: [...sniperState.history, hitData],
        });
      }
      return;
    }

    // -----------------------------------------------------------
    // C. テーマ別名所ラリーモード
    // -----------------------------------------------------------
    if (mode === 'rally') {
      const course = rallyState.currentCourse;
      if (course) {
        const currentLmId = course.checkpoints[rallyState.currentStepIndex];
        const currentTargetLm = getLandmarkById(currentLmId);
        const targetPref = currentTargetLm ? getPrefectureById(currentTargetLm.prefId) : null;

        let isCorrect = false;
        let isPinpointBull = false;
        let distKm = 9999;
        let currentScore = 0;

        if (currentTargetLm && finalLat !== undefined && finalLng !== undefined) {
          distKm = calculateHaversineDistance(
            currentTargetLm.coordinates.lat,
            currentTargetLm.coordinates.lng,
            finalLat,
            finalLng
          );

          const nearPinThresholdKm = getNearPinThresholdKm(difficulty) + bonusThresholdKm; // 加護で拡大
          const pinpointThresholdKm = getPinpointThresholdKm(difficulty) * pinpointMultiplier;

          if (distKm <= nearPinThresholdKm) {
            isCorrect = true;
            isPinpointBull = distKm <= pinpointThresholdKm;

            const pinpointBonus = isPinpointBull ? 1.5 : 1.0;
            const difficultyMultiplier = difficulty === 'hard' ? 1.8 : difficulty === 'normal' ? 1.3 : 1.0;
            const effectiveZoomMultiplier = currentZoomRisk.multiplier + bonusZoomMultiplier;
            currentScore = Math.round(
              1500 * pinpointBonus * effectiveZoomMultiplier * difficultyMultiplier * scoreMultiplier
            );

            if (isPinpointBull) {
              audio.playPinpointBullSound();
            } else {
              audio.playSuccessSound();
            }

            // ラリーチェックポイント命中時にも「旅の加護」を発動
            const catInfo = getCategoryInfo(currentTargetLm.category);
            setActiveBlessing({
              type: currentTargetLm.category,
              title: catInfo.blessingName,
              description: catInfo.blessingDesc,
              icon: catInfo.icon,
              appliedAt: Date.now(),
              durationThrows: 1,
            });

            const nextIndex = rallyState.currentStepIndex + 1;
            const isCourseCompleted = nextIndex >= course.checkpoints.length;

            // 名所画像ポップアップモーダルを表示
            setHitLandmarkModalData({
              landmark: currentTargetLm,
              prefecture: targetPref || PREFECTURES[0],
              score: currentScore,
              isPinpoint: isPinpointBull,
              isPrefCleared: isCourseCompleted,
              clearedCount: nextIndex,
            });

            if (isCourseCompleted) {
              recordRallyCompleted(course.id);
              unlockAchievement('rally_master');
              setCompletedRallies(getCompletedRallies());
              setAchievements(getAchievements());
            }

            setRallyState((prev) => ({
              ...prev,
              currentStepIndex: nextIndex,
              totalAttempts: prev.totalAttempts + 1,
              score: prev.score + currentScore,
              completed: isCourseCompleted,
            }));
          } else {
            audio.playMissSound();
            setRallyState((prev) => ({
              ...prev,
              totalAttempts: prev.totalAttempts + 1,
            }));
          }
        }

        const hitData: DartHit = {
          id: `hit-${Date.now()}`,
          x: mapX,
          y: mapY,
          screenX,
          screenY,
          lat: finalLat,
          lng: finalLng,
          prefecture: hitPrefecture,
          targetPrefecture: targetPref,
          hitLandmark: isCorrect && currentTargetLm ? currentTargetLm : undefined,
          nearestLandmarkName: currentTargetLm?.name,
          distanceToTargetKm: distKm < 9000 ? distKm : undefined,
          timestamp: Date.now(),
          score: currentScore,
          isCorrect,
          isNearPin: isCorrect,
          isPinpointBull,
          aimLat: effectiveAimLat,
          aimLng: effectiveAimLng,
          aimScreenX,
          aimScreenY,
          zoomMultiplier: currentZoomRisk.multiplier,
          zoomLevel: currentZoomRisk.zoomLevel,
        };
        setCurrentHits((prev) => [...prev, hitData]);
      }
      return;
    }

    // -----------------------------------------------------------
    // E. ご当地クイズ推理モード (GeoQuiz Mode)
    // -----------------------------------------------------------
    if (mode === 'quiz') {
      const liveQuizState = quizStateRef.current;
      const currentQ = liveQuizState.questions[liveQuizState.currentIndex];

      if (!currentQ) return;

      const targetLm = getLandmarkById(currentQ.landmarkId);
      if (!targetLm) return;

      const targetPref = getPrefectureById(targetLm.prefId) || null;

      // 距離計算 (着弾緯度経度と目標名所の緯度経度)
      let distKm = 9999;
      if (finalLat !== undefined && finalLng !== undefined) {
        distKm = calculateHaversineDistance(
          targetLm.coordinates.lat,
          targetLm.coordinates.lng,
          finalLat,
          finalLng
        );
      }

      // 判定ロジック
      // bull: 1.5km以内 (直撃・神の眼)
      // hit: 15km以内 (正解)
      // near_miss: 40km以内 (惜しい)
      // miss: 40km超 (外れ)
      let judgment: 'bull' | 'hit' | 'near_miss' | 'miss' = 'miss';
      let isCorrect = false;

      if (distKm <= 1.5) {
        judgment = 'bull';
        isCorrect = true;
      } else if (distKm <= 15.0) {
        judgment = 'hit';
        isCorrect = true;
      } else if (distKm <= 40.0) {
        judgment = 'near_miss';
        isCorrect = false;
      } else {
        judgment = 'miss';
        isCorrect = false;
      }

      // スコア計算
      // ヒント倍率: ヒント1=3.0x, ヒント2=2.0x, ヒント3=1.2x
      const hintMultiplier = liveQuizState.unlockedHintLevel === 1 ? 3.0 : liveQuizState.unlockedHintLevel === 2 ? 2.0 : 1.2;
      const effectiveZoomMultiplier = currentZoomRisk.multiplier + bonusZoomMultiplier;

      let baseScore = 0;
      if (judgment === 'bull') {
        baseScore = 3000;
      } else if (judgment === 'hit') {
        baseScore = 1500;
      } else if (judgment === 'near_miss') {
        baseScore = 500;
      } else {
        baseScore = 0;
      }

      const pointsAwarded = judgment === 'near_miss'
        ? 500
        : Math.round(baseScore * hintMultiplier * effectiveZoomMultiplier * scoreMultiplier);

      // 音響演出
      if (judgment === 'bull') {
        audio.playPinpointBullSound();
        unlockAchievement('wide_aim_bull');
      } else if (judgment === 'hit') {
        audio.playSuccessSound();
      } else {
        audio.playHitSound(false);
      }

      // ダーツ着弾ピンの記録
      const hitData: DartHit = {
        id: `hit-${Date.now()}`,
        x: mapX,
        y: mapY,
        screenX,
        screenY,
        lat: finalLat,
        lng: finalLng,
        prefecture: hitPrefecture || targetPref,
        targetPrefecture: targetPref,
        hitLandmark: targetLm,
        timestamp: Date.now(),
        score: pointsAwarded,
        isCorrect,
        isBull: judgment === 'bull',
        isPinpointBull: judgment === 'bull',
        isNearPin: isCorrect,
        distanceToTargetKm: distKm < 9000 ? distKm : undefined,
        nearestLandmarkName: targetLm.name,
        aimLat: effectiveAimLat,
        aimLng: effectiveAimLng,
        aimScreenX,
        aimScreenY,
        zoomMultiplier: currentZoomRisk.multiplier,
        zoomLevel: currentZoomRisk.zoomLevel,
      };

      setCurrentHits((prev) => [...prev, hitData]);

      // 結果オブジェクト
      const questionResult: QuizQuestionResult = {
        question: currentQ,
        targetLandmark: targetLm,
        isCorrect,
        distanceKm: distKm,
        pointsAwarded,
        unlockedHintLevel: liveQuizState.unlockedHintLevel,
        hintMultiplier,
        zoomMultiplier: Number(effectiveZoomMultiplier.toFixed(1)),
        judgment,
        feedbackMessage:
          judgment === 'bull'
            ? '神の眼！ピンポイント直撃！'
            : judgment === 'hit'
            ? '正解！見事な推理です！'
            : judgment === 'near_miss'
            ? 'ニアミス！惜しい！'
            : '外れ！',
      };

      // 正解地点へカメラが滑らかにズーム飛行 (学習演出)
      if (mapType === 'gsi') {
        setTimeout(() => {
          gsiMapRef.current?.flyToLatLng(targetLm.coordinates.lat, targetLm.coordinates.lng, 12);
        }, 300);
      }

      // カメラ飛行後、正解・解説モーダルを展開
      setTimeout(() => {
        setQuizState((prev) => ({
          ...prev,
          score: prev.score + pointsAwarded,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          results: [...prev.results, questionResult],
          lastResult: questionResult,
        }));
      }, 700);

      return;
    }

    // -----------------------------------------------------------
    // F. 自由探索モード
    // -----------------------------------------------------------
    if (hitPrefecture) {
      audio.playHitSound(false);
      const hitData: DartHit = {
        id: `hit-${Date.now()}`,
        x: mapX,
        y: mapY,
        screenX,
        screenY,
        lat: finalLat,
        lng: finalLng,
        prefecture: hitPrefecture,
        timestamp: Date.now(),
        score: 500,
        isCorrect: true,
        aimLat: effectiveAimLat,
        aimLng: effectiveAimLng,
        aimScreenX,
        aimScreenY,
      };
      setCurrentHits((prev) => [...prev, hitData]);

      savePassportRecord(hitPrefecture.id, 500);
      setPassportRecords(getPassportData());

      if (hitPrefecture.id === 1) unlockAchievement('hokkaido_hit');
      if (hitPrefecture.id === 47) unlockAchievement('okinawa_hit');
      setAchievements(getAchievements());

      setTimeout(() => {
        setSelectedPrefectureForModal(hitPrefecture);
      }, 500);
    } else {
      audio.playMissSound();
      // 海など範囲外でも着弾位置を記録してピンを残す
      const hitData: DartHit = {
        id: `hit-${Date.now()}`,
        x: mapX,
        y: mapY,
        screenX,
        screenY,
        lat: finalLat,
        lng: finalLng,
        prefecture: null,
        timestamp: Date.now(),
        score: 0,
        isCorrect: false,
        aimLat: effectiveAimLat,
        aimLng: effectiveAimLng,
        aimScreenX,
        aimScreenY,
      };
      setCurrentHits((prev) => [...prev, hitData]);
    }
  };

  // マップクリック投てき
  const handlePrefectureClick = (
    pref: Prefecture,
    point: { x: number; y: number; screenX: number; screenY: number; lat?: number; lng?: number }
  ) => {
    executeThrow(point.screenX, point.screenY, point.x, point.y, pref, point.lat, point.lng);
  };

  const handleMapClick = (
    point: { x: number; y: number; screenX: number; screenY: number; lat?: number; lng?: number }
  ) => {
    executeThrow(point.screenX, point.screenY, point.x, point.y, null, point.lat, point.lng);
  };

  // プルバックランチャー用
  const handleLauncherPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setPullBackState({
      isPulling: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
  };

  const handleLauncherPointerMove = (e: React.PointerEvent) => {
    if (pullBackState && pullBackState.isPulling) {
      setPullBackState((prev) => (prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null));
    }
  };

  const handleLauncherPointerUp = (e: React.PointerEvent) => {
    if (!pullBackState || !pullBackState.isPulling) return;

    const dx = pullBackState.startX - pullBackState.currentX;
    const dy = pullBackState.startY - pullBackState.currentY;
    const dragDistance = Math.hypot(dx, dy);

    if (dragDistance > 25) {
      const targetScreenX = pullBackState.startX + dx * 3.0;
      const targetScreenY = pullBackState.startY + dy * 3.0;

      let targetLat: number | undefined;
      let targetLng: number | undefined;
      let hitPref: Prefecture | null = null;

      if (mapType === 'gsi') {
        const geo = gsiMapRef.current?.screenPointToLatLng(targetScreenX, targetScreenY);
        if (geo) {
          targetLat = geo.lat;
          targetLng = geo.lng;
          hitPref = findNearestPrefecture(geo.lat, geo.lng, PREFECTURES)?.prefecture || null;
        }
      }

      if (!hitPref) {
        const elem = document.elementFromPoint(targetScreenX, targetScreenY) as HTMLElement | null;
        const lmElem = elem?.closest('[data-landmark-id]');
        const prefElem = elem?.closest('[data-pref-id]');

        if (lmElem && basicTourState.currentPref) {
          hitPref = basicTourState.currentPref;
        } else if (prefElem) {
          const id = parseInt(prefElem.getAttribute('data-pref-id')!, 10);
          hitPref = getPrefectureById(id) || null;
        }
      }

      executeThrow(targetScreenX, targetScreenY, targetScreenX, targetScreenY, hitPref, targetLat, targetLng);
    }

    setPullBackState(null);
  };

  // 基本モード: 県制覇後に次の県へ進む
  const handleAdvanceToNextPrefecture = () => {
    setShowPrefClearModal(false);
    setCurrentHits([]);
    pickNextUnclearedPrefecture(basicTourState.clearedPrefIds);
  };

  // 基本モード: 別の県へスキップ
  const handleSkipPrefecture = () => {
    audio.playClickSound();
    setCurrentHits([]);
    pickNextUnclearedPrefecture(basicTourState.clearedPrefIds);
  };

  const visitedPrefIds = new Set<number>(
    Object.keys(passportRecords).map((k) => parseInt(k, 10))
  );

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none font-scaled"
      style={{
        '--font-scale': fontSize / 100,
      } as React.CSSProperties}
    >
      
      {/* 1. 上部 HUD */}
      <GameHUD
        mode={mode}
        onSelectMode={handleSelectMode}
        mapType={mapType}
        onToggleMapType={() => {
          audio.playClickSound();
          setMapType((prev) => (prev === 'gsi' ? 'stylized' : 'gsi'));
        }}
        difficulty={difficulty}
        onChangeDifficulty={handleDifficultyChange}
        fontSize={fontSize}
        onToggleFontSize={handleToggleFontSize}
        wind={wind}
        score={mode === 'sniper' ? sniperState.score : mode === 'quiz' ? quizState.score : rallyState.score}
        combo={sniperState.combo}
        remainingThrows={sniperState.remainingThrows}
        totalThrows={sniperState.totalThrows}
        currentTarget={mode === 'sniper' ? sniperState.currentTargetPref : null}
        currentLandmarkTarget={mode === 'sniper' ? sniperState.currentTarget : null}
        currentTargetPref={mode === 'sniper' ? sniperState.currentTargetPref : null}
        zoomScale={zoomScale}
        zoomRisk={currentZoomRisk}
        isMuted={isMuted}
        onToggleMute={() => {
          const muted = audio.toggleMute();
          setIsMuted(muted);
        }}
        isBgmPlaying={isBgmPlaying}
        onToggleBGM={() => {
          const playing = audio.toggleBGM();
          setIsBgmPlaying(playing);
        }}
        onOpenPassport={() => setShowPassportModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        onRestartSniper={handleRestartSniper}
        passportCount={visitedPrefIds.size}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* 1.1 Ctrl + ホイール操作時の文字サイズ変更トーストインジケーター */}
      {showFontToast && (
        <aside
          aria-label="文字サイズ変更インジケーター"
          className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in"
        >
          <div className="glass-panel px-5 py-2.5 rounded-2xl border border-amber-400/80 shadow-2xl shadow-amber-500/20 bg-slate-950/90 flex items-center gap-3 backdrop-blur-xl">
            <span className="text-xl animate-pulse">🔤</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">文字サイズ (Ctrl＋ホイール)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 font-mono font-black border border-amber-400/40">
                  {fontSize}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {fontSize === 100 ? '標準' : fontSize === 115 ? '大 (初期値)' : fontSize >= 280 ? '極大 (最大300%)' : fontSize > 115 ? '拡大' : '縮小'}
                </span>
              </div>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-100"
                  style={{ width: `${Math.max(0, Math.min(100, ((fontSize - 80) / (300 - 80)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 発動中の「旅の加護（属性ボーナス）」通知バッジ */}
      {activeBlessing && (
        <aside
          aria-label="発動中の旅の加護"
          className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
        >
          <div className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2.5 border border-amber-400/80 shadow-xl shadow-amber-500/20 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <span className="text-lg animate-pulse drop-shadow">{activeBlessing.icon}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-black text-amber-300 font-calligraphy tracking-wider drop-shadow-sm">
                {activeBlessing.title}
              </span>
              <span className="text-[11px] md:text-xs text-amber-100 font-medium">
                {activeBlessing.description}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-mono font-bold border border-amber-400/40">
                次の1投有効
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* 2. マップエンジン描画 (国土地理院マップ または スタイライズドSVG) */}
      <main className="w-full h-full">
        {mapType === 'gsi' ? (
          <GsiJapanMap
            ref={gsiMapRef}
            currentTarget={
              mode === 'sniper'
                ? sniperState.currentTargetPref
                : mode === 'rally' && rallyState.currentCourse
                ? getPrefectureById(getLandmarkById(rallyState.currentCourse.checkpoints[rallyState.currentStepIndex])?.prefId || 0) || null
                : null
            }
            activePrefectureId={
              mode === 'basic'
                ? basicTourState.currentPref?.id
                : mode === 'aichi_detail'
                ? 23
                : mode === 'sniper'
                ? sniperState.currentTargetPref?.id
                : mode === 'rally' && rallyState.currentCourse
                ? getLandmarkById(rallyState.currentCourse.checkpoints[rallyState.currentStepIndex])?.prefId
                : undefined
            }
            landmarks={
              mode === 'basic'
                ? basicTourState.landmarks
                : mode === 'aichi_detail'
                ? aichiState.currentCity.landmarks
                : mode === 'sniper' && sniperState.currentTarget
                ? [sniperState.currentTarget]
                : mode === 'rally' && rallyState.currentCourse
                ? (() => {
                    const lm = getLandmarkById(rallyState.currentCourse.checkpoints[rallyState.currentStepIndex]);
                    return lm ? [lm] : [];
                  })()
                : []
            }
            clearedLandmarkIds={
              mode === 'basic'
                ? basicTourState.clearedLandmarkIds
                : mode === 'aichi_detail'
                ? aichiState.clearedLandmarkIdsForCity
                : []
            }
            visitedPrefIds={visitedPrefIds}
            currentHits={currentHits}
            onPrefectureClick={handlePrefectureClick}
            onMapClick={handleMapClick}
            onZoomChange={setZoomLevel}
            mode={mode}
            difficulty={difficulty}
          />
        ) : (
          <JapanMap
            currentTarget={
              mode === 'sniper'
                ? sniperState.currentTargetPref
                : mode === 'rally' && rallyState.currentCourse
                ? getPrefectureById(getLandmarkById(rallyState.currentCourse.checkpoints[rallyState.currentStepIndex])?.prefId || 0) || null
                : null
            }
            activePrefectureId={
              mode === 'basic'
                ? basicTourState.currentPref?.id
                : mode === 'aichi_detail'
                ? 23
                : mode === 'sniper'
                ? sniperState.currentTargetPref?.id
                : mode === 'rally' && rallyState.currentCourse
                ? getLandmarkById(rallyState.currentCourse.checkpoints[rallyState.currentStepIndex])?.prefId
                : undefined
            }
            landmarks={
              mode === 'basic'
                ? basicTourState.landmarks
                : mode === 'aichi_detail'
                ? aichiState.currentCity.landmarks
                : mode === 'sniper' && sniperState.currentTarget
                ? [sniperState.currentTarget]
                : mode === 'rally' && rallyState.currentCourse
                ? (() => {
                    const lm = getLandmarkById(rallyState.currentCourse.checkpoints[rallyState.currentStepIndex]);
                    return lm ? [lm] : [];
                  })()
                : []
            }
            clearedLandmarkIds={
              mode === 'basic'
                ? basicTourState.clearedLandmarkIds
                : mode === 'aichi_detail'
                ? aichiState.clearedLandmarkIdsForCity
                : []
            }
            visitedPrefIds={visitedPrefIds}
            currentHits={currentHits}
            onPrefectureClick={handlePrefectureClick}
            onMapClick={handleMapClick}
            zoomScale={zoomScale}
            onZoomChange={(scale) => {
              setZoomScale(scale);
              setZoomLevel(6 + (scale - 1.0) * 4.0);
            }}
            mode={mode}
            difficulty={difficulty}
          />
        )}
      </main>

      {/* 3. ダーツ投てき・放物線・着弾エフェクトオーバーレイ */}
      <DartOverlay
        currentHits={currentHits}
        activeDart={activeDart}
        pullBackState={pullBackState}
        onLauncherPointerDown={handleLauncherPointerDown}
        onLauncherPointerMove={handleLauncherPointerMove}
        onLauncherPointerUp={handleLauncherPointerUp}
        difficulty={difficulty}
        language={language}
      />

      {/* 4. 基本モード専用ミッションバー */}
      {mode === 'basic' && basicTourState.currentPref && (
        <BasicTourMissionBar
          currentPref={basicTourState.currentPref}
          landmarks={basicTourState.landmarks}
          clearedLandmarkIds={basicTourState.clearedLandmarkIds}
          totalClearedCount={basicTourState.totalClearedCount}
          attempts={basicTourState.attemptsForCurrentPref}
          zoomRisk={currentZoomRisk}
          difficulty={difficulty}
          language={language}
          latestHit={currentHits.length > 0 ? currentHits[currentHits.length - 1] : null}
          onSkipPrefecture={handleSkipPrefecture}
          onRerollLandmarks={handleRerollLandmarks}
        />
      )}

      {/* 5. ラリーモード用ステータスバー */}
      {mode === 'rally' && rallyState.currentCourse && (
        <RallyStatusBar
          course={rallyState.currentCourse}
          currentStepIndex={rallyState.currentStepIndex}
          totalAttempts={rallyState.totalAttempts}
          score={rallyState.score}
          onSelectAnotherCourse={() => setShowRallySelectModal(true)}
        />
      )}

      {/* 5.2 愛知県詳細限定版ミッションバー */}
      {mode === 'aichi_detail' && aichiState.currentCity && (
        <AichiMissionBar
          currentCity={aichiState.currentCity}
          landmarks={aichiState.currentCity.landmarks}
          clearedLandmarkIds={aichiState.clearedLandmarkIdsForCity}
          totalClearedCitiesCount={aichiState.totalClearedCitiesCount}
          attempts={aichiState.attemptsForCurrentCity}
          zoomRisk={currentZoomRisk}
          difficulty={difficulty}
          latestHit={currentHits.length > 0 ? currentHits[currentHits.length - 1] : null}
          onOpenCitySelect={() => setShowAichiCitySelectModal(true)}
          onNextCity={handleAdvanceToNextAichiCity}
        />
      )}

      {/* 5.3 ご当地クイズ推理モードミッションバー */}
      {mode === 'quiz' && !quizState.isFinished && (
        <QuizMissionBar
          quizState={quizState}
          language={language}
          onUnlockHint={handleUnlockQuizHint}
          onRestartQuiz={handleRestartQuiz}
        />
      )}

      {/* 6. モーダル群 */}
      {/* 名所命中時の画像ポップアップモーダル */}
      {hitLandmarkModalData && (
        <LandmarkHitModal
          landmark={hitLandmarkModalData.landmark}
          prefecture={hitLandmarkModalData.prefecture}
          hitScore={hitLandmarkModalData.score}
          isPinpoint={hitLandmarkModalData.isPinpoint}
          difficulty={difficulty}
          isPrefectureCleared={hitLandmarkModalData.isPrefCleared}
          clearedCount={hitLandmarkModalData.clearedCount}
          language={language}
          onClose={() => {
            const isCleared = hitLandmarkModalData.isPrefCleared;
            setHitLandmarkModalData(null);
            if (isCleared) {
              if (mode === 'rally') {
                setShowRallyGameOverModal(true);
              } else if (mode === 'aichi_detail') {
                setShowCityClearModal(true);
              } else {
                setShowPrefClearModal(true);
              }
            }
          }}
          onProceedToPrefClear={() => {
            const isCleared = hitLandmarkModalData.isPrefCleared;
            setHitLandmarkModalData(null);
            if (isCleared) {
              if (mode === 'rally') {
                setShowRallyGameOverModal(true);
              } else if (mode === 'aichi_detail') {
                setShowCityClearModal(true);
              } else {
                setShowPrefClearModal(true);
              }
            }
          }}
        />
      )}

      {/* 愛知県詳細限定版 市選択モーダル */}
      {showAichiCitySelectModal && (
        <AichiCitySelectModal
          currentCityId={aichiState.currentCity.id}
          clearedCityIds={aichiState.clearedCityIds}
          clearedLandmarkIds={getAichiClearedLandmarkIds()}
          onSelectCity={handleSelectAichiCity}
          onResetAll={handleResetAllAichiCities}
          onClose={() => setShowAichiCitySelectModal(false)}
        />
      )}

      {/* 愛知県 市制覇モーダル */}
      {showCityClearModal && aichiState.currentCity && (
        <CityClearModal
          city={aichiState.currentCity}
          landmarks={aichiState.currentCity.landmarks}
          totalClearedCitiesCount={aichiState.totalClearedCitiesCount}
          onNextCity={handleAdvanceToNextAichiCity}
          onOpenCitySelect={() => {
            setShowCityClearModal(false);
            setShowAichiCitySelectModal(true);
          }}
        />
      )}

      {showPrefClearModal && basicTourState.currentPref && (
        <PrefectureClearModal
          prefecture={basicTourState.currentPref}
          landmarks={basicTourState.landmarks}
          totalClearedCount={basicTourState.totalClearedCount}
          onNextPrefecture={handleAdvanceToNextPrefecture}
        />
      )}

      {selectedPrefectureForModal && (
        <PrefectureModal
          prefecture={selectedPrefectureForModal}
          visitCount={passportRecords[selectedPrefectureForModal.id]?.visitCount || 1}
          highScore={passportRecords[selectedPrefectureForModal.id]?.highScore || 0}
          language={language}
          onClose={() => setSelectedPrefectureForModal(null)}
        />
      )}

      {showPassportModal && (
        <PassportModal
          passportRecords={passportRecords}
          achievements={achievements}
          language={language}
          onClose={() => setShowPassportModal(false)}
          onSelectPrefecture={(prefId) => {
            const pref = getPrefectureById(prefId);
            if (pref) setSelectedPrefectureForModal(pref);
          }}
        />
      )}

      {showHelpModal && (
        <HelpModal language={language} onClose={() => setShowHelpModal(false)} />
      )}

      {showGameOverModal && (
        <GameOverModal
          state={sniperState}
          highScore={sniperHighScore}
          isNewRecord={isNewHighScore}
          language={language}
          onRestart={handleRestartSniper}
          onGoFreeMode={() => {
            setShowGameOverModal(false);
            handleSelectMode('free');
          }}
        />
      )}

      {showRallyGameOverModal && (
        <RallyGameOverModal
          state={rallyState}
          onSelectCourse={() => {
            setShowRallyGameOverModal(false);
            setShowRallySelectModal(true);
          }}
          onRestartCourse={() => {
            setShowRallyGameOverModal(false);
            if (rallyState.currentCourse) {
              setRallyState({
                currentCourse: rallyState.currentCourse,
                currentStepIndex: 0,
                totalAttempts: 0,
                score: 0,
                completed: false,
                history: [],
                startedAt: Date.now(),
              });
              setCurrentHits([]);
            }
          }}
          onGoFreeMode={() => {
            setShowRallyGameOverModal(false);
            handleSelectMode('free');
          }}
        />
      )}

      {showRallySelectModal && (
        <RallyCourseSelectModal
          completedCourses={completedRallies}
          onSelectCourse={(course) => {
            setRallyState({
              currentCourse: course,
              currentStepIndex: 0,
              totalAttempts: 0,
              score: 0,
              completed: false,
              history: [],
              startedAt: Date.now(),
            });
            setCurrentHits([]);
            setShowRallySelectModal(false);
          }}
          onClose={() => setShowRallySelectModal(false)}
        />
      )}

      {/* 7. ご当地クイズ推理モード: 正解・解説モーダル */}
      {quizState.lastResult && (
        <QuizResultModal
          result={quizState.lastResult}
          prefecture={getPrefectureById(quizState.lastResult.targetLandmark.prefId)}
          isLastQuestion={quizState.currentIndex >= quizState.questions.length - 1}
          language={language}
          onNextQuestion={handleNextQuizQuestion}
        />
      )}

      {/* 8. ご当地クイズ推理モード: 総合リザルトモーダル */}
      {quizState.isFinished && (
        <QuizGameOverModal
          quizState={quizState}
          onRestart={handleRestartQuiz}
          onSelectMode={handleSelectMode}
        />
      )}
    </div>
  );
};

export default App;
