import React, { useEffect } from 'react';
import { SniperGameState, Language } from '../types';
import { Trophy, RotateCcw, Award, CheckCircle, Crosshair, ArrowRight, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audio } from '../utils/audio';

interface GameOverModalProps {
  state: SniperGameState;
  highScore: number;
  isNewRecord: boolean;
  language?: Language;
  onRestart: () => void;
  onGoFreeMode: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  state,
  highScore,
  isNewRecord,
  language = 'ja',
  onRestart,
  onGoFreeMode,
}) => {
  const isEn = language === 'en';

  // ランク判定
  let rank = 'C';
  let rankColor = 'text-slate-400';
  let rankTitle = isEn ? 'Novice Sniper' : '見習いスナイパー';
  let rankComment = isEn
    ? 'Check the map carefully and challenge yourself again!'
    : '日本地図をじっくり確認してもう一度挑戦してみましょう！';

  if (state.score >= 12000) {
    rank = 'S';
    rankColor = 'text-amber-300 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]';
    rankTitle = isEn ? 'Mythic Sniper' : '神話級スナイパー';
    rankComment = isEn
      ? 'Unbelievable spatial sense! A legendary master of Japan geography!'
      : '驚異の空間把握能力！日本列島の隅々まで熟知した至高の名手です！';
  } else if (state.score >= 8000) {
    rank = 'A';
    rankColor = 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]';
    rankTitle = isEn ? 'Veteran Sniper' : '熟練スナイパー';
    rankComment = isEn
      ? 'Outstanding accuracy! Aim for consecutive combos for S rank!'
      : '素晴らしい精度です！広域ボーナスや連続コンボを狙えばSランクも目前！';
  } else if (state.score >= 4000) {
    rank = 'B';
    rankColor = 'text-sky-400';
    rankTitle = isEn ? 'Skilled Sniper' : '一人前スナイパー';
    rankComment = isEn
      ? 'Solid fundamentals! Master the wind and distance to score higher!'
      : '基本はバッチリ！風の向きや距離感をさらに掴んで得点を伸ばそう！';
  }

  const accuracy = Math.round((state.correctHits / state.totalThrows) * 100);

  useEffect(() => {
    if (rank === 'S' || rank === 'A') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      audio.playSuccessSound();
      audio.playCheerSound();
    }
  }, [rank]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl w-[92vw] max-h-[90vh] overflow-y-auto glass-panel-gold rounded-3xl p-5 md:p-8 border-amber-500/60 shadow-2xl text-center">
        
        {/* 新記録バナー */}
        {isNewRecord && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/40 mb-3 animate-bounce">
            <Trophy className="w-3.5 h-3.5" />
            {isEn ? 'NEW RECORD!' : 'NEW RECORD 更新！'}
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-bold text-slate-200 font-calligraphy mb-1">
          {isEn ? 'Sniper Mode Results' : 'スナイパーモード結果発表'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {isEn
            ? '10 rounds completed! Your sniper evaluation is ready:'
            : '10投の激闘を終え、あなたの狙撃ランクが判定されました'}
        </p>

        {/* 巨大ランクバッジ */}
        <div className="relative inline-block mb-4">
          <div className="w-28 h-28 mx-auto rounded-3xl bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center shadow-inner">
            <span className={`text-7xl font-black font-calligraphy ${rankColor}`}>
              {rank}
            </span>
          </div>
          <span className="text-xs font-bold text-amber-300 mt-2 block tracking-wider font-calligraphy">
            {rankTitle}
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-6 px-4">
          {rankComment}
        </p>

        {/* スタッツグリッド */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">
              {isEn ? 'Final Score' : '最終スコア'}
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {state.score.toLocaleString()} <span className="text-xs font-normal text-slate-400">pt</span>
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">
              {isEn ? 'Personal Best' : '自己ベスト'}
            </span>
            <span className="text-2xl font-black text-slate-200 font-mono">
              {Math.max(highScore, state.score).toLocaleString()} <span className="text-xs font-normal text-slate-400">pt</span>
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">
              {isEn ? 'Hit Accuracy' : '正解命中率'}
            </span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {state.correctHits} / {state.totalThrows} ({accuracy}%)
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">
              {isEn ? 'Max Combo' : '最大コンボ'}
            </span>
            <span className="text-xl font-bold text-red-400 font-mono">
              {state.maxCombo} {isEn ? 'Streak' : '連続正解'}
            </span>
          </div>
        </div>

        {/* アクションボタン群 */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-98 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {isEn ? 'Play Again' : 'もう一度挑戦する'}
          </button>

          <button
            onClick={onGoFreeMode}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all border border-slate-700 active:scale-98"
          >
            {isEn ? 'Free Roam' : 'フリー探索へ'}
          </button>
        </div>
      </div>
    </div>
  );
};
