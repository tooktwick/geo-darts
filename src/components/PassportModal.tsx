import React, { useState } from 'react';
import { PassportRecord, Achievement, RegionType, Language } from '../types';
import { PREFECTURES, REGION_NAMES, REGION_COLORS } from '../data/prefectures';
import { t, getPrefectureName, getRegionName } from '../utils/i18n';
import { X, BookOpen, Award, CheckCircle2, Star, Calendar, Trophy, ChevronRight } from 'lucide-react';

interface PassportModalProps {
  passportRecords: Record<number, PassportRecord>;
  achievements: Achievement[];
  language?: Language;
  onClose: () => void;
  onSelectPrefecture?: (prefId: number) => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  passportRecords,
  achievements,
  language = 'ja',
  onClose,
  onSelectPrefecture,
}) => {
  const [activeTab, setActiveTab] = useState<'stamps' | 'achievements'>('stamps');
  const [selectedRegion, setSelectedRegion] = useState<RegionType | 'all'>('all');

  const visitedCount = Object.keys(passportRecords).length;
  const progressPercent = ((visitedCount / 47) * 100).toFixed(1);

  // 地方別達成数集計
  const regions: RegionType[] = ['hokkaido', 'tohoku', 'kanto', 'chubu', 'kinki', 'chugoku', 'shikoku', 'kyushu'];
  const regionStats = regions.map((reg) => {
    const prefsInRegion = PREFECTURES.filter((p) => p.region === reg);
    const visitedInRegion = prefsInRegion.filter((p) => !!passportRecords[p.id]);
    return {
      region: reg,
      name: getRegionName(reg, language),
      total: prefsInRegion.length,
      visited: visitedInRegion.length,
      percent: Math.round((visitedInRegion.length / prefsInRegion.length) * 100),
    };
  });

  // フィルタリングされた都道府県リスト
  const filteredPrefectures = selectedRegion === 'all'
    ? PREFECTURES
    : PREFECTURES.filter((p) => p.region === selectedRegion);

  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl w-[95vw] max-h-[90vh] glass-panel rounded-3xl border-amber-500/40 shadow-2xl flex flex-col overflow-hidden">
        
        {/* モーダルヘッダー */}
        <div className="p-5 md:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-amber-300 font-calligraphy flex items-center gap-2">
                {t('passport_heading', language)}
              </h2>
              <p className="text-xs text-slate-400">
                {t('passport_subheading', language)}
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

        {/* サマリーバー: 全国制覇率 & タブ切り替え */}
        <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 全国制覇メーター */}
          <div className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-300">{t('conquest_rate', language)}</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {language === 'en'
                  ? `${visitedCount} / 47 Prefectures (${progressPercent}%)`
                  : `${visitedCount} / 47 都道府県 (${progressPercent}%)`}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* タブ切り替え */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('stamps')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'stamps'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{t('stamps_tab', language)}</span>
              <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded-full font-mono">
                {visitedCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'achievements'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{t('achievements_tab', language)}</span>
              <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded-full font-mono">
                {unlockedAchievementsCount}/{achievements.length}
              </span>
            </button>
          </div>
        </div>

        {/* メインコンテンツスクロールエリア */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 scrollbar-thin">
          {activeTab === 'stamps' ? (
            <div>
              {/* 地方別プログレスバー一覧 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {regionStats.map((stat) => (
                  <div
                    key={stat.region}
                    onClick={() => setSelectedRegion(selectedRegion === stat.region ? 'all' : stat.region)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedRegion === stat.region
                        ? 'border-amber-400 bg-amber-500/15'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-200">{stat.name.replace('地方', '')}</span>
                      <span className="text-amber-400 font-mono">{stat.visited}/{stat.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${stat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 都道府県スタンプグリッド */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredPrefectures.map((pref) => {
                  const record = passportRecords[pref.id];
                  const isVisited = !!record;
                  const regionColor = REGION_COLORS[pref.region];

                  return (
                    <div
                      key={pref.id}
                      onClick={() => onSelectPrefecture && onSelectPrefecture(pref.id)}
                      className={`relative p-3 rounded-2xl border transition-all ${
                        isVisited
                          ? 'border-amber-500/40 bg-slate-900/90 hover:scale-102 hover:border-amber-400 cursor-pointer shadow-lg'
                          : 'border-slate-800/80 bg-slate-950/40 opacity-45'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">
                          No.{pref.id.toString().padStart(2, '0')}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                          style={{ backgroundColor: regionColor.light, color: regionColor.base }}
                        >
                          {getRegionName(pref.region, language).replace('地方', '')}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mb-1">
                        <h4 className="text-base font-bold text-slate-100 font-calligraphy truncate">
                          {getPrefectureName(pref, language)}
                        </h4>
                        {isVisited && (
                          <span className="text-xs font-mono font-bold text-amber-400 flex-shrink-0 ml-1">
                            {language === 'en' ? `${record.visitCount}x` : `${record.visitCount}回`}
                          </span>
                        )}
                      </div>

                      {isVisited ? (
                        <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5 mt-1.5">
                          <span>{t('high_score', language)}</span>
                          <span className="font-mono font-bold text-slate-200">
                            {record.highScore > 0 ? `${record.highScore}pt` : '-'}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 text-center py-1 font-mono">
                          {language === 'en' ? 'Unvisited' : '未到達'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 実績一覧タブ */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                    ach.unlocked
                      ? 'border-amber-500/50 bg-slate-900/90 shadow-lg shadow-amber-500/10'
                      : 'border-slate-800 bg-slate-950/40 opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      ach.unlocked
                        ? 'bg-amber-500/20 border border-amber-500/40'
                        : 'bg-slate-800/40 border border-slate-700'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-100 font-calligraphy">
                        {ach.title}
                      </h4>
                      {ach.unlocked && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {language === 'en' ? 'Unlocked' : '達成'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                    {ach.unlocked && ach.unlockedAt && (
                      <div className="text-[10px] text-slate-500 mt-2 font-mono">
                        {language === 'en' ? 'Date: ' : '達成日: '}
                        {new Date(ach.unlockedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ja-JP')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
