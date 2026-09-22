import React from 'react';
import { QuizGameState, GameMode } from '../types';
import { Trophy, RotateCcw, Award, CheckCircle2, XCircle, AlertCircle, Compass, Sparkles, MapPin } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface QuizGameOverModalProps {
  quizState: QuizGameState;
  onRestart: () => void;
  onSelectMode: (mode: GameMode) => void;
}

export const QuizGameOverModal: React.FC<QuizGameOverModalProps> = ({
  quizState,
  onRestart,
  onSelectMode,
}) => {
  const { correctCount, score, results, questions } = quizState;
  const totalQuestions = questions.length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  // 称号・ランク判定
  const getRankInfo = () => {
    if (correctCount === 5 && score >= 12000) {
      return {
        rank: 'S',
        title: '🗾 日本地理神',
        desc: '驚異的な地理知識と精密な射撃！全国の津々浦々を知り尽くした生き字引です！',
        color: 'from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-amber-300 shadow-amber-500/50',
      };
    } else if (correctCount >= 4) {
      return {
        rank: 'A',
        title: '🌟 旅の達人',
        desc: '素晴らしい推理力！日本各地の名所や文化に非常に精通しています！',
        color: 'from-sky-400 to-blue-500 text-white border-sky-300 shadow-sky-500/40',
      };
    } else if (correctCount >= 2) {
      return {
        rank: 'B',
        title: '🎒 一人前の旅人',
        desc: '確かな知識で着実に正解！さらなる高みを目指して日本を旅しましょう！',
        color: 'from-emerald-500 to-teal-500 text-white border-emerald-300 shadow-emerald-500/30',
      };
    } else {
      return {
        rank: 'C',
        title: '🌱 見習い旅人',
        desc: 'ナイスファイト！クイズの解説をヒントに、日本の魅力をもっと発見しましょう！',
        color: 'from-slate-500 to-slate-600 text-slate-100 border-slate-400 shadow-slate-500/30',
      };
    }
  };

  const rankInfo = getRankInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-2xl w-full glass-panel-gold rounded-3xl p-4 sm:p-6 border-amber-500/60 shadow-2xl flex flex-col gap-4 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* 背景装飾 */}
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ヘッダー */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 font-calligraphy tracking-wider drop-shadow-md">
              推理クイズ 総合結果
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            5問のご当地推理ダーツが終了しました！
          </p>
        </div>

        {/* ランク＆称号バナー */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${rankInfo.color} border shadow-xl flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-950/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-black text-3xl font-mono shadow-inner">
              {rankInfo.rank}
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black tracking-wide flex items-center gap-1.5 font-calligraphy">
                <span>{rankInfo.title}</span>
              </div>
              <p className="text-xs opacity-90 font-medium mt-0.5 max-w-sm">
                {rankInfo.desc}
              </p>
            </div>
          </div>
        </div>

        {/* 主要スタッツ */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">正解数</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-amber-300">
              {correctCount} <span className="text-xs text-slate-400 font-normal">/ {totalQuestions}</span>
            </span>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">正解率</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-sky-400">
              {accuracy}%
            </span>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">総スコア</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
              {score.toLocaleString()} <span className="text-xs text-slate-400 font-normal">pt</span>
            </span>
          </div>
        </div>

        {/* 各問題の振り返りリスト */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 px-1">
            <Compass className="w-3.5 h-3.5" />
            <span>今回の出題振り返り</span>
          </h3>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {results.map((r, idx) => {
              const distStr = r.distanceKm < 1 ? `${Math.round(r.distanceKm * 1000)}m` : `${r.distanceKm.toFixed(1)}km`;
              const isBull = r.judgment === 'bull';
              const isHit = r.judgment === 'hit';

              return (
                <div
                  key={idx}
                  className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-slate-400 font-bold w-4">#{idx + 1}</span>
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon category={r.targetLandmark.category} className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 truncate">
                      <span className="font-bold text-white block truncate">{r.targetLandmark.name}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{r.question.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0 text-right font-mono">
                    <div className="text-[11px]">
                      <span className="text-slate-400 text-[10px] block">誤差</span>
                      <span className={r.isCorrect ? 'text-amber-300 font-bold' : 'text-slate-400'}>{distStr}</span>
                    </div>
                    <div className="text-[11px] min-w-[60px]">
                      <span className="text-slate-400 text-[10px] block">スコア</span>
                      <span className={r.pointsAwarded > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        +{r.pointsAwarded.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      {isBull ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                          直撃
                        </span>
                      ) : isHit ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                          正解
                        </span>
                      ) : r.judgment === 'near_miss' ? (
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-black">
                          惜しい
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black">
                          外れ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => onSelectMode('basic')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 transition-all active:scale-95"
          >
            基本モードに戻る
          </button>
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 border border-amber-300 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>もう一度挑戦する (新しい5問)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

