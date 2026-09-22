import React, { useEffect } from 'react';
import { RallyGameState } from '../types';
import { Trophy, Award, CheckCircle2, RotateCcw, Map, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audio } from '../utils/audio';

interface RallyGameOverModalProps {
  state: RallyGameState;
  onSelectCourse: () => void;
  onRestartCourse: () => void;
  onGoFreeMode: () => void;
}

export const RallyGameOverModal: React.FC<RallyGameOverModalProps> = ({
  state,
  onSelectCourse,
  onRestartCourse,
  onGoFreeMode,
}) => {
  const course = state.currentCourse;
  if (!course) return null;

  const totalCheckpoints = course.checkpoints.length;
  const isCompleted = state.completed;
  const accuracy = Math.round((totalCheckpoints / Math.max(state.totalAttempts, 1)) * 100);

  useEffect(() => {
    if (isCompleted) {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
      });
      audio.playSuccessSound();
      audio.playCheerSound();
    }
  }, [isCompleted]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg glass-panel-gold rounded-3xl p-6 md:p-8 border-amber-500/60 shadow-2xl text-center overflow-hidden">
        
        {/* トロフィーアニメーション */}
        <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-lg mb-4 animate-bounce">
          <span className="text-5xl">🏆</span>
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-2">
          COURSE COMPLETED!
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-amber-300 font-calligraphy mb-1">
          {course.title} 完走！
        </h2>
        <p className="text-xs text-slate-300 mb-6">
          すべてのチェックポイントをダーツで見事に踏破しました！
        </p>

        {/* スタッツ */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">踏破数</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {totalCheckpoints} / {totalCheckpoints} 箇所
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">総投てき数</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {state.totalAttempts} 投
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">命中精度</span>
            <span className="text-xl font-bold text-sky-400 font-mono">
              {accuracy}%
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">獲得スコア</span>
            <span className="text-xl font-bold text-white font-mono">
              {state.score.toLocaleString()} pt
            </span>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onSelectCourse}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-98 flex items-center justify-center gap-2"
          >
            <Map className="w-4 h-4" />
            他のラリーコースへ
          </button>

          <button
            onClick={onRestartCourse}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all border border-slate-700 active:scale-98 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            再挑戦する
          </button>
        </div>
      </div>
    </div>
  );
};
