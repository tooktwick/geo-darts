import React from 'react';
import { RallyCourse, Prefecture, Landmark } from '../types';
import { getPrefectureById } from '../data/prefectures';
import { getLandmarkById } from '../data/landmarksData';
import { CheckCircle2, ChevronRight, Flag, Navigation, Trophy, MapPin } from 'lucide-react';

interface RallyStatusBarProps {
  course: RallyCourse;
  currentStepIndex: number;
  totalAttempts: number;
  score: number;
  onSelectAnotherCourse: () => void;
  onThrowTargetPref?: (pref: Prefecture) => void;
}

export const RallyStatusBar: React.FC<RallyStatusBarProps> = ({
  course,
  currentStepIndex,
  totalAttempts,
  score,
  onSelectAnotherCourse,
}) => {
  const currentTargetId = course.checkpoints[currentStepIndex];
  const currentTargetLm = getLandmarkById(currentTargetId);
  const currentTargetPref = currentTargetLm ? getPrefectureById(currentTargetLm.prefId) : null;
  const progressPercent = Math.round((currentStepIndex / course.checkpoints.length) * 100);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
      <div className="max-w-4xl w-full glass-panel-gold rounded-2xl p-3 md:p-4 pointer-events-auto border-amber-500/40 shadow-2xl">
        {/* 上段: コース情報 & 進捗率 */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{course.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-amber-300 font-calligraphy">
                  {course.title}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {course.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                {course.subTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">達成度</span>
              <span className="text-sm md:text-base font-black text-amber-400 font-mono">
                {currentStepIndex} / {course.checkpoints.length} ({progressPercent}%)
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">投てき数</span>
              <span className="text-sm md:text-base font-black text-white font-mono">
                {totalAttempts}投
              </span>
            </div>

            <button
              onClick={onSelectAnotherCourse}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/60 transition-all"
            >
              コース変更
            </button>
          </div>
        </div>

        {/* 中段: 名所チェックポイント一覧 (横スクロール対応ステップバー) */}
        <div className="relative py-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {course.checkpoints.map((lmId, idx) => {
              const lm = getLandmarkById(lmId);
              const pref = lm ? getPrefectureById(lm.prefId) : null;
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <React.Fragment key={lmId}>
                  <div
                    className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 ring-2 ring-amber-300 scale-105 animate-pulse-fast'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <Navigation className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
                    ) : (
                      <span className="text-[10px] w-3.5 text-center font-mono opacity-60">
                        {idx + 1}
                      </span>
                    )}
                    <span className="whitespace-nowrap">{lm?.name || lmId}</span>
                    {pref && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                        isCurrent ? 'bg-slate-900/20 text-slate-950' : 'text-slate-500'
                      }`}>
                        ({pref.name})
                      </span>
                    )}
                  </div>

                  {idx < course.checkpoints.length - 1 && (
                    <ChevronRight
                      className={`w-3 h-3 flex-shrink-0 ${
                        isPast ? 'text-emerald-500' : 'text-slate-600'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 下段: 次の目標名所アナウンス */}
        {currentTargetLm && (
          <div className="mt-1 flex items-center justify-between text-xs bg-black/40 px-3 py-1.5 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 animate-ping">●</span>
              <span className="text-slate-400">NEXT TARGET:</span>
              <span className="font-black text-amber-300 text-sm">{currentTargetLm.name}</span>
              {currentTargetPref && (
                <span className="text-slate-400 font-bold">（{currentTargetPref.name}）</span>
              )}
            </div>
            <div className="text-slate-300 text-[11px] hidden md:block truncate max-w-md">
              {currentTargetLm.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
