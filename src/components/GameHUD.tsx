import { GameMode, MapType, WindState, Prefecture, Landmark, ZoomRiskInfo, GameDifficulty, FontSize } from '../types';
import { Compass, Volume2, VolumeX, Music, BookOpen, HelpCircle, RotateCcw, Map as MapIcon, Globe, MapPin, Zap, Eye, EyeOff, Target, Brain } from 'lucide-react';

interface GameHUDProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  mapType: MapType;
  onToggleMapType: () => void;
  difficulty?: GameDifficulty;
  onChangeDifficulty?: (diff: GameDifficulty) => void;
  fontSize?: FontSize;
  onToggleFontSize?: () => void;
  wind: WindState;
  score: number;
  combo: number;
  remainingThrows: number;
  totalThrows: number;
  currentTarget?: Prefecture | null;
  currentLandmarkTarget?: Landmark | null;
  currentTargetPref?: Prefecture | null;
  zoomScale: number;
  zoomRisk?: ZoomRiskInfo;
  isMuted: boolean;
  onToggleMute: () => void;
  isBgmPlaying: boolean;
  onToggleBGM: () => void;
  onOpenPassport: () => void;
  onOpenHelp: () => void;
  onRestartSniper?: () => void;
  passportCount: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  onSelectMode,
  mapType,
  onToggleMapType,
  difficulty = 'easy',
  onChangeDifficulty,
  fontSize = 'large',
  onToggleFontSize,
  wind,
  score,
  combo,
  remainingThrows,
  totalThrows,
  currentTarget,
  currentLandmarkTarget,
  currentTargetPref,
  zoomScale,
  zoomRisk,
  isMuted,
  onToggleMute,
  isBgmPlaying,
  onToggleBGM,
  onOpenPassport,
  onOpenHelp,
  onRestartSniper,
  passportCount,
}) => {
  const isWideBonus = zoomScale <= 1.05;
  const zoomBonusMultiplier = isWideBonus ? 2.0 : Number(Math.max(1.0, 2.0 - (zoomScale - 1.0) * 0.8).toFixed(1));

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-2 sm:p-2.5 md:p-3">
      <div className="max-w-[98vw] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        
        {/* 左側: タイトル & モード切り替え & マップ種別 */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* メインロゴ */}
          <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 border-amber-500/30 shadow-lg">
            <span className="text-2xl animate-bounce">🎯</span>
            <div>
              <h1 className="font-calligraphy text-lg md:text-xl font-bold tracking-wider text-amber-300 drop-shadow-sm flex items-center gap-1.5">
                日本列島 ダーツの旅
              </h1>
              <span className="text-[10px] text-slate-400 tracking-widest block -mt-1 font-mono uppercase">
                Japan Dart Trip
              </span>
            </div>
          </div>

          {/* モード選択タブ (基本: 県ごとの名所 / スナイパー: 全国からランダム1名所 / ラリー: テーマ別名所ラリー) */}
          <div className="glass-panel p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => onSelectMode('basic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'basic'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="基本モード: 県ごとの名所3箇所をニアピンで狙い、47都道府県完全制覇を目指す"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>基本 (県別名所)</span>
            </button>
            <button
              onClick={() => onSelectMode('sniper')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                mode === 'sniper'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="スナイパーモード: 全国470名所からランダムに指定される目標を10投で連続射貫く"
            >
              <Target className="w-3.5 h-3.5" />
              <span>スナイパー (全国ランダム)</span>
            </button>
            <button
              onClick={() => onSelectMode('rally')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'rally'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="地域ラリーモード: テーマ（新幹線・世界遺産・グルメ・大縦断）に沿った名所を順番にラリー走破"
            >
              <span>ラリー (テーマ別名所)</span>
            </button>
            <button
              onClick={() => onSelectMode('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'quiz'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 font-black ring-1 ring-purple-300'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/30'
              }`}
              title="ご当地クイズ推理モード: 歴史や地理のヒントを手がかりに全国の名所を推理して射貫く！"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>推理クイズ</span>
            </button>
            <button
              onClick={() => onSelectMode('aichi_detail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'aichi_detail'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                  : 'text-amber-300 hover:text-amber-100 hover:bg-amber-950/40 border border-amber-500/30'
              }`}
              title="愛知県詳細限定版: 愛知県の市を選択して、市ごとに3つの厳選名所を狙い全市完全制覇を目指す！"
            >
              <span>🏯</span>
              <span>愛知限定 (市別名所)</span>
            </button>
            <button
              onClick={() => onSelectMode('free')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'free'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="自由探索モード: 制約なく日本全国を自由に巡る"
            >
              <span>自由探索</span>
            </button>
          </div>

          {/* マップ切り替え */}
          <button
            onClick={onToggleMapType}
            className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:border-amber-400/40 transition-all active:scale-95"
            title="マップエンジン切り替え (国土地理院マップ / SVGマップ)"
          >
            {mapType === 'gsi' ? (
              <>
                <Globe className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">地理院地図</span>
              </>
            ) : (
              <>
                <MapIcon className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">SVGマップ</span>
              </>
            )}
          </button>

          {/* 難易度切り替えタブ (Easy: 表示ON / Normal: 表示OFF・距離表示 / Hard: 表示OFF) */}
          <div className="glass-panel p-1 rounded-xl flex items-center gap-0.5" title="目標表示と難易度設定">
            <button
              onClick={() => onChangeDifficulty?.('easy')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                difficulty === 'easy'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20 ring-1 ring-emerald-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Easy: 目標の地図表示 ON（常時表示で狙いやすい）"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-300" />
              <span>Easy</span>
            </button>
            <button
              onClick={() => onChangeDifficulty?.('normal')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                difficulty === 'normal'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 ring-1 ring-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Normal: 目標の地図表示 OFF（投げた後に目標までの距離・方角を表示）"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-300" />
              <span>Normal</span>
            </button>
            <button
              onClick={() => onChangeDifficulty?.('hard')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                difficulty === 'hard'
                  ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/30 ring-1 ring-red-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Hard: 目標の地図表示 OFF（距離ヒントなしの完全実力モード）"
            >
              <EyeOff className="w-3.5 h-3.5 text-red-300" />
              <span>Hard</span>
            </button>
          </div>
        </div>

        {/* 中央: スナイパーモード時のターゲット表示 (全国からランダムに1つの名所を狙う) */}
        {mode === 'sniper' && (currentLandmarkTarget || currentTarget) && (
          <div className="pointer-events-auto flex items-center justify-center">
            <div className="glass-panel-gold px-4 py-2 rounded-2xl flex items-center gap-4 border border-amber-400/60 animate-target-glow shadow-xl shadow-amber-500/10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-950/70 px-1.5 py-0.2 rounded border border-red-500/40">
                    🎯 SNIPER TARGET
                  </span>
                  {currentTargetPref && (
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                      📍 {currentTargetPref.name}
                    </span>
                  )}
                </div>
                <span className="text-lg md:text-2xl font-black text-white font-calligraphy tracking-widest drop-shadow-md block">
                  {currentLandmarkTarget ? currentLandmarkTarget.name : currentTarget?.name}
                </span>
                <span className="text-[10px] text-amber-200/80 block -mt-0.5 font-sans truncate max-w-[200px] md:max-w-xs">
                  {currentLandmarkTarget ? currentLandmarkTarget.description : currentTarget?.capital}
                </span>
              </div>

              <div className="h-8 w-px bg-amber-500/40" />

              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">残投数</span>
                  <span className="text-lg font-black text-amber-400">
                    {remainingThrows}<span className="text-xs text-slate-400">/{totalThrows}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">SCORE</span>
                  <span className="text-lg font-black text-white font-mono">
                    {score.toLocaleString()}
                  </span>
                </div>

                {combo > 1 && (
                  <div className="bg-red-500/20 border border-red-500/50 px-2 py-0.5 rounded-lg text-center animate-bounce">
                    <span className="text-[10px] text-red-400 font-bold block leading-none">COMBO</span>
                    <span className="text-sm font-black text-red-400 leading-none">
                      x{(1 + (combo - 1) * 0.2).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 右側: 風向風速計 & ユーティリティ群 */}
        <div className="flex items-center justify-end gap-2 pointer-events-auto">
          {/* 風向風速計 */}
          <div
            className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 border-slate-700/50"
            title={`風向: ${wind.direction}, 風速: ${wind.speed.toFixed(1)} m/s`}
          >
            <div className="relative w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <Compass
                className="w-5 h-5 text-sky-400 transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${wind.angleDeg}deg)` }}
              />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 leading-tight">
                風向 <span className="text-slate-200 font-bold">{wind.direction}</span>
              </div>
              <div className="text-xs font-mono font-bold text-sky-300 leading-tight">
                {wind.speed.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">m/s</span>
              </div>
            </div>
          </div>

          {/* ズーム連動リスク＆リターン・インジケーター */}
          <div
            className={`glass-panel px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-lg transition-all ${
              zoomRisk ? zoomRisk.colorClass : 'border-slate-700 text-slate-300'
            }`}
            title="拡大するほど駅前・敷地ピンポイント高倍率(最大5.0x)！ただし風ドリフト急増＆即OBリスク！広域は安全だが1.0x。"
          >
            <Zap className={`w-4 h-4 ${zoomRisk && zoomRisk.multiplier >= 4 ? 'text-amber-300 animate-bounce' : 'text-sky-400'}`} />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold block leading-none">
                  {zoomRisk ? zoomRisk.tierName : '日本全図'}
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-black/40 font-mono font-bold leading-none">
                  {zoomRisk ? zoomRisk.riskTitle : '1.0x'}
                </span>
              </div>
              <div className="text-xs font-mono font-black mt-0.5 leading-none">
                倍率: <span className="text-sm font-black text-white">{zoomRisk ? zoomRisk.multiplier.toFixed(1) : '1.0'}x</span>
              </div>
            </div>
          </div>

          {/* サウンド & BGM */}
          <div className="glass-panel p-1 rounded-xl flex items-center gap-0.5">
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-lg transition-all ${
                isMuted ? 'text-red-400 bg-red-950/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title={isMuted ? 'ミュート解除' : '消音 (ミュート)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onToggleBGM}
              className={`p-1.5 rounded-lg transition-all ${
                isBgmPlaying ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title={isBgmPlaying ? '和風BGM停止' : '和風BGM再生'}
            >
              <Music className="w-4 h-4" />
            </button>
          </div>

          {/* 文字サイズ切り替え (Ctrl+ホイール微調整対応) */}
          {onToggleFontSize && (() => {
            const scaleNum = typeof fontSize === 'number' ? fontSize : (fontSize === 'large' ? 115 : 100);
            const isLarge = scaleNum > 105;
            const labelText = scaleNum === 100 ? '標準' : scaleNum === 115 ? '大' : `${scaleNum}%`;

            return (
              <button
                onClick={onToggleFontSize}
                className={`glass-panel px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 border ${
                  isLarge
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800/60'
                }`}
                title={`文字サイズ: ${labelText} (${scaleNum}%)。クリックで切替 / Ctrl＋マウスホイールで微調整`}
              >
                <span className="text-sm font-black font-mono">Aa</span>
                <span className="hidden sm:inline font-bold">
                  文字:{labelText}
                </span>
              </button>
            );
          })()}

          {/* パスポート */}
          <button
            onClick={onOpenPassport}
            className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/10 hover:border-amber-400/50 transition-all active:scale-95 border-amber-500/30"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">パスポート</span>
            <span className="bg-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
              {passportCount}/47
            </span>
          </button>

          {/* ヘルプ */}
          <button
            onClick={onOpenHelp}
            className="glass-panel p-2 rounded-xl text-slate-300 hover:text-white hover:border-slate-500 transition-all active:scale-95"
            title="遊び方・採点ルール"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* スナイパーリスタート */}
          {mode === 'sniper' && onRestartSniper && (
            <button
              onClick={onRestartSniper}
              className="glass-panel p-2 rounded-xl text-red-400 hover:text-red-300 hover:border-red-500/50 transition-all active:scale-95"
              title="リスタート"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
