import React, { useState } from 'react';
import { QuizGameState, GeoQuizQuestion, Language } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  Lightbulb,
  Brain,
  ChevronDown,
  ChevronUp,
  Award,
  Compass,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface QuizMissionBarProps {
  quizState: QuizGameState;
  language?: Language;
  onUnlockHint: (level: number) => void;
  onRestartQuiz?: () => void;
}

export const QuizMissionBar: React.FC<QuizMissionBarProps> = ({
  quizState,
  language = 'ja',
  onUnlockHint,
  onRestartQuiz,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentQuestion: GeoQuizQuestion | undefined = quizState.questions[quizState.currentIndex];

  if (!currentQuestion) {
    return null;
  }

  const hintLevel = quizState.unlockedHintLevel;
  const currentMultiplier = hintLevel === 1 ? 3.0 : hintLevel === 2 ? 2.0 : 1.2;
  const multiplierColor =
    hintLevel === 1
      ? 'from-amber-400 to-yellow-500 text-slate-950 ring-amber-300'
      : hintLevel === 2
      ? 'from-sky-400 to-blue-500 text-white ring-sky-300'
      : 'from-slate-600 to-slate-700 text-slate-200 ring-slate-400';

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex justify-center">
      {isCollapsed ? (
        /* 最小化時: 地図を最大限広く見せるスリムバー */
        <div className="max-w-xl w-full glass-panel-gold rounded-2xl px-3.5 py-2 pointer-events-auto border-amber-500/50 shadow-2xl flex items-center justify-between gap-2.5 transition-all">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xl">🧠</span>
            <span className="text-xs font-black text-amber-300 font-calligraphy tracking-wider whitespace-nowrap">
              第 {quizState.currentIndex + 1} / {quizState.questions.length} 問
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 border border-amber-500/40 whitespace-nowrap">
              {currentMultiplier}x 倍率
            </span>
            <span className="text-xs text-slate-200 font-bold truncate">
              {currentQuestion.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsCollapsed(false)}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-400/50 flex items-center gap-1 transition-all shadow-md"
              title="クイズパネルを展開"
            >
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>問題を見る</span>
            </button>
          </div>
        </div>
      ) : (
        /* 展開時: 和風クイズ巻物風パネル */
        <div className="max-w-4xl w-full glass-panel-gold rounded-3xl p-3 md:p-4 pointer-events-auto border-amber-500/50 shadow-2xl transition-all flex flex-col gap-2.5">
          {/* ヘッダー行: 問題番号・スコア・倍率バッジ・最小化ボタン */}
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-calligraphy font-bold text-sm">
                <Brain className="w-4 h-4 text-amber-400" />
                <span>第 {quizState.currentIndex + 1} 問 / 全 {quizState.questions.length} 問</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/60 border border-slate-700 text-xs font-mono">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">正解:</span>
                <span className="text-amber-300 font-bold">{quizState.correctCount} 問</span>
                <span className="text-slate-500 mx-0.5">|</span>
                <span className="text-slate-400">得点:</span>
                <span className="text-emerald-400 font-bold">{quizState.score.toLocaleString()} pt</span>
              </div>

              <div className={`px-2.5 py-1 rounded-xl bg-gradient-to-r ${multiplierColor} text-xs font-black shadow-md ring-1 flex items-center gap-1 animate-pulse`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>獲得倍率 {currentMultiplier}x</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 transition-all"
                title="パネルを最小化して地図を広く見る"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 問題エリア: ジャンル・見出し・クイズ問題文 */}
          <div className="bg-slate-950/70 rounded-2xl p-3 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner">
                <CategoryIcon category={currentQuestion.category} className="w-6 h-6" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-amber-300 font-bold text-base md:text-lg tracking-wide drop-shadow-sm flex items-center gap-2">
                <span>{currentQuestion.title}</span>
              </h2>
              <p className="text-slate-200 text-xs md:text-sm leading-relaxed mt-0.5 font-medium">
                {currentQuestion.prompt}
              </p>
            </div>
          </div>

          {/* 3段階ヒントエリア */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* ヒント1 (初期解放: 倍率 3.0x) */}
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-amber-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    ヒント①【歴史・逸話】
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    3.0x
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 leading-normal">
                  {currentQuestion.hints[0]}
                </p>
              </div>
            </div>

            {/* ヒント2 (中難度: 倍率 2.0x) */}
            <div className={`rounded-xl p-2.5 border flex flex-col justify-between transition-all ${
              hintLevel >= 2
                ? 'bg-slate-900/80 border-sky-500/40'
                : 'bg-slate-950/50 border-slate-800'
            }`}>
              {hintLevel >= 2 ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black text-sky-400 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      ヒント②【立地・地理】
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      2.0x
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-normal">
                    {currentQuestion.hints[1]}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-1.5 py-2">
                  <span className="text-[11px] text-slate-400 font-bold">ヒント②【立地・地理】</span>
                  <button
                    onClick={() => onUnlockHint(2)}
                    className="px-2.5 py-1 rounded-lg bg-sky-600/80 hover:bg-sky-500 text-white text-[11px] font-black border border-sky-400/50 shadow-md transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>解放する (倍率2.0x)</span>
                  </button>
                </div>
              )}
            </div>

            {/* ヒント3 (易・決定打: 倍率 1.2x) */}
            <div className={`rounded-xl p-2.5 border flex flex-col justify-between transition-all ${
              hintLevel >= 3
                ? 'bg-slate-900/80 border-purple-500/40'
                : 'bg-slate-950/50 border-slate-800'
            }`}>
              {hintLevel >= 3 ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      ヒント③【決定打・近隣】
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      1.2x
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-normal">
                    {currentQuestion.hints[2]}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-1.5 py-2">
                  <span className="text-[11px] text-slate-400 font-bold">ヒント③【決定打・近隣】</span>
                  <button
                    onClick={() => onUnlockHint(3)}
                    disabled={hintLevel < 2}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black border shadow-md transition-all flex items-center gap-1 ${
                      hintLevel >= 2
                        ? 'bg-purple-600/80 hover:bg-purple-500 text-white border-purple-400/50 active:scale-95'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>解放する (倍率1.2x)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* フッターナビゲーション */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1 border-t border-slate-800/60">
            <span className="flex items-center gap-1 text-amber-300/90 font-medium">
              <span>🎯</span>
              <span>地図上に目標ピンは表示されません。クイズの手がかりから場所を推理して投擲してください。</span>
            </span>
            <span className="hidden sm:inline text-slate-400 font-mono">
              直撃(1.5km) 3000pt | ニアピン(15km) 1500pt
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

