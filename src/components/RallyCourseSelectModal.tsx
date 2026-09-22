import React from 'react';
import { RallyCourse } from '../types';
import { RALLY_COURSES } from '../rallyData';
import { X, Map, Award, ChevronRight } from 'lucide-react';
import { PREFECTURES, getPrefectureById } from '../data/prefectures';
import { getLandmarkById } from '../data/landmarksData';

interface RallyCourseSelectModalProps {
  completedCourses: string[];
  onSelectCourse: (course: RallyCourse) => void;
  onClose: () => void;
}

export const RallyCourseSelectModal: React.FC<RallyCourseSelectModalProps> = ({
  completedCourses,
  onSelectCourse,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel-gold rounded-3xl p-5 md:p-7 border-amber-500/50 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-amber-300 font-calligraphy">
                  地域ラリーコース選択
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  全8大コース
                </span>
              </div>
              <p className="text-xs text-slate-400">
                テーマに沿って日本全国の指定チェックポイントを順に巡ろう
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コース一覧 */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin pr-1">
          {RALLY_COURSES.map((course) => {
            const isCompleted = completedCourses.includes(course.id);
            const firstLm = getLandmarkById(course.checkpoints[0]);
            const lastLm = getLandmarkById(course.checkpoints[course.checkpoints.length - 1]);

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="group p-4 rounded-2xl border border-slate-800 hover:border-amber-400/80 bg-slate-900/80 hover:bg-slate-800/90 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/10 active:scale-99"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800">
                      {course.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors font-calligraphy">
                          {course.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {course.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                            🏆 完走済み
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-200/80 mb-2">
                        {course.subTitle}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {course.description}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-amber-300/80 font-mono flex-wrap">
                        <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                          全 {course.checkpoints.length} 名所走破
                        </span>
                        <span>•</span>
                        <span className="text-slate-300">
                          【{firstLm?.name || 'スタート'}】発 ➔ 【{lastLm?.name || 'ゴール'}】着
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400 group-hover:text-amber-300 group-hover:bg-amber-500/20 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
