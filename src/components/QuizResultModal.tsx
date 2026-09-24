import React from 'react';
import { QuizQuestionResult, Prefecture, Language } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { CheckCircle2, AlertCircle, Sparkles, MapPin, Award, ArrowRight, Trophy } from 'lucide-react';
import { getLandmarkImageUrl, getCategoryFallbackImage } from '../utils/landmarkImages';
import { getLandmarkName, getPrefectureName } from '../utils/i18n';

interface QuizResultModalProps {
  result: QuizQuestionResult;
  prefecture?: Prefecture | null;
  isLastQuestion: boolean;
  language?: Language;
  onNextQuestion: () => void;
}

export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  result,
  prefecture,
  isLastQuestion,
  language = 'ja',
  onNextQuestion,
}) => {
  const isEn = language === 'en';
  const { question, targetLandmark, isCorrect, distanceKm, pointsAwarded, judgment, hintMultiplier, zoomMultiplier } = result;

  // 正解画像またはカテゴリー別デフォルト画像
  const imageUrl = getLandmarkImageUrl(targetLandmark);

  // 判定に応じた装飾
  const getBadgeInfo = () => {
    switch (judgment) {
      case 'bull':
        return {
          title: isEn ? '🎯 Pinpoint Bullseye!' : '🎯 神の眼！ピンポイント直撃！',
          color: 'from-amber-400 to-yellow-500 text-slate-950 border-amber-300 ring-2 ring-amber-300 shadow-amber-500/50',
          sub: isEn ? 'Phenomenal geographic sense! Direct hit!' : '驚異の地理感覚！ドンピシャの着弾です！',
        };
      case 'hit':
        return {
          title: isEn ? '⭕ Correct! Great Deduction!' : '⭕ 正解！見事な推理！',
          color: 'from-emerald-500 to-teal-500 text-white border-emerald-300 ring-2 ring-emerald-400 shadow-emerald-500/40',
          sub: isEn ? 'Well done! You pinpointed the location!' : 'お見事！名所の所在地を正確に捉えました！',
        };
      case 'near_miss':
        return {
          title: isEn ? '⚠️ Near Miss! So Close!' : '⚠️ ニアミス！惜しい！',
          color: 'from-blue-600 to-indigo-600 text-white border-sky-300 ring-1 ring-sky-400 shadow-blue-500/30',
          sub: isEn ? 'Right region, but slightly off target.' : '地域は合っています！あと少しでした！',
        };
      case 'miss':
      default:
        return {
          title: isEn ? '❌ Missed!' : '❌ 外れ！',
          color: 'from-rose-600 to-red-700 text-white border-rose-400 ring-1 ring-rose-400 shadow-rose-500/30',
          sub: isEn ? 'Too bad! The target was elsewhere.' : '残念！正解地点は別の場所でした。',
        };
    }
  };

  const badge = getBadgeInfo();
  const distanceStr = distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="max-w-xl w-full glass-panel-gold rounded-3xl p-4 sm:p-6 border-amber-500/60 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
        
        {/* 背景の装飾光彩 */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 判定ヘッダー */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className={`px-4 py-1.5 rounded-2xl bg-gradient-to-r ${badge.color} font-black text-sm sm:text-base shadow-lg flex items-center gap-2`}>
            <span>{badge.title}</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            {badge.sub}
          </p>
        </div>

        {/* スコア・誤差距離バッジ */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">
              {isEn ? 'Distance Error' : '目標との誤差'}
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-amber-300">
              {distanceStr}
            </span>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">
              {isEn ? 'Points Earned' : '獲得スコア'}
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-emerald-400">
              +{pointsAwarded.toLocaleString()} pt
            </span>
            {pointsAwarded > 0 && (
              <span className="text-[10px] text-slate-400 block font-mono">
                ({hintMultiplier}x × {zoomMultiplier}x)
              </span>
            )}
          </div>
        </div>

        {/* 正解名所カード */}
        <div className="bg-slate-900/90 rounded-2xl p-3 sm:p-4 border border-amber-500/30 flex flex-col sm:flex-row gap-3 items-center">
          <div className="w-full sm:w-36 h-28 sm:h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex-shrink-0 relative">
            <img
              src={imageUrl}
              alt={getLandmarkName(targetLandmark, language)}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 画像フォールバック: ローカル画像へ切替
                const target = e.currentTarget;
                const fallback = getCategoryFallbackImage(targetLandmark.category);
                if (!target.src.endsWith(fallback)) {
                  target.src = fallback;
                } else {
                  target.style.display = 'none';
                }
              }}
            />
            <div className="absolute top-1.5 left-1.5 w-7 h-7 rounded-lg bg-slate-950/80 border border-amber-500/40 flex items-center justify-center">
              <CategoryIcon category={targetLandmark.category} className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {isEn ? 'Answer: ' : '正解: '}
                {getPrefectureName(prefecture, language) || (isEn ? 'Japan' : '日本')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-calligraphy tracking-wide">
              {getLandmarkName(targetLandmark, language)}
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
              {targetLandmark.description}
            </p>
          </div>
        </div>

        {/* 歴史・地理の解説文 */}
        <div className="bg-amber-950/30 rounded-2xl p-3 border border-amber-500/30">
          <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEn ? 'History & Trivia' : '名所と歴史の豆知識'}</span>
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed">
            {question.explanation}
          </p>
        </div>

        {/* 次へ進むボタン */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onNextQuestion}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 border border-amber-300 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>
              {isLastQuestion
                ? (isEn ? 'See Final Results' : '総合結果を見る')
                : (isEn ? 'Next Question' : '次の問題へ進む')}
            </span>
            {isLastQuestion ? <Trophy className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
