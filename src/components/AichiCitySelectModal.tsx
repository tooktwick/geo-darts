import React, { useState } from 'react';
import { AichiCity, AichiRegion } from '../types';
import { AICHI_CITIES, AICHI_REGION_NAMES } from '../data/aichiData';
import { X, Search, CheckCircle2, MapPin, Award } from 'lucide-react';

interface AichiCitySelectModalProps {
  currentCityId: string;
  clearedCityIds: string[];
  clearedLandmarkIds: string[];
  onSelectCity: (city: AichiCity) => void;
  onResetAll?: () => void;
  onClose: () => void;
}

export const AichiCitySelectModal: React.FC<AichiCitySelectModalProps> = ({
  currentCityId,
  clearedCityIds,
  clearedLandmarkIds,
  onSelectCity,
  onResetAll,
  onClose,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<AichiRegion | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタリング
  const filteredCities = AICHI_CITIES.filter((city) => {
    const matchesRegion = selectedRegion === 'all' || city.region === selectedRegion;
    const matchesQuery =
      city.name.includes(searchQuery) ||
      city.reading.includes(searchQuery) ||
      city.landmarks.some((lm) => lm.name.includes(searchQuery));
    return matchesRegion && matchesQuery;
  });

  const totalClearedCount = clearedCityIds.length;
  const progressPercent = Math.round((totalClearedCount / AICHI_CITIES.length) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aichi-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-6xl w-[95vw] max-h-[90vh] flex flex-col bg-slate-900/95 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* ヘッダー */}
        <div className="p-4 md:p-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🏯</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="aichi-modal-title" className="text-lg md:text-2xl font-black font-calligraphy text-amber-300 tracking-wider">
                  愛知県詳細限定版 市選択
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  全38市
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                巡りたい市を選択してください（市を選ぶと過去のクリアフラグを解除して0から再挑戦できます）。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 全クリア解除ボタン */}
            {onResetAll && totalClearedCount > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('愛知県の全市・全名所のクリア記録をリセットしますか？')) {
                    onResetAll();
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                title="愛知県の全市のクリアフラグを一括解除"
              >
                <span>全クリア解除</span>
              </button>
            )}

            {/* 制覇進捗バッジ */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block leading-tight font-semibold">愛知県全市制覇</span>
                <span className="text-xs font-mono font-black text-amber-300">
                  {totalClearedCount} / {AICHI_CITIES.length} 市 ({progressPercent}%)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="閉じる"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* コントロールバー: 地域タブ & 検索 */}
        <div className="p-3 md:p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* 地域切り替えタブ */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRegion === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              全38市 ({AICHI_CITIES.length})
            </button>
            {(Object.keys(AICHI_REGION_NAMES) as AichiRegion[]).map((reg) => {
              const count = AICHI_CITIES.filter((c) => c.region === reg).length;
              return (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedRegion === reg
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {AICHI_REGION_NAMES[reg]} ({count})
                </button>
              );
            })}
          </div>

          {/* インクリメンタル検索 */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="市名・名所名で検索..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* 市一覧グリッド */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 custom-scrollbar">
          {filteredCities.map((city) => {
            const isCurrent = city.id === currentCityId;
            const isCleared = clearedCityIds.includes(city.id);
            const cityClearedLms = city.landmarks.filter((lm) => clearedLandmarkIds.includes(lm.id));
            const clearedCount = cityClearedLms.length;

            return (
              <div
                key={city.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCity(city);
                    onClose();
                  }
                }}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group outline-none focus:ring-2 focus:ring-amber-400 ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                    : isCleared
                    ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-slate-950/40 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  {/* ヘッダー: 市名 & 地域 & 制覇バッジ */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block leading-none">
                        {city.reading}
                      </span>
                      <h3 className="text-lg font-black text-white font-calligraphy flex items-center gap-1.5 mt-0.5">
                        {city.name}
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-sans font-black">
                            選択中
                          </span>
                        )}
                      </h3>
                    </div>

                    {isCleared ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        制覇済
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                        {clearedCount}/3
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {city.description}
                  </p>
                </div>

                {/* 3名所リスト */}
                <div className="pt-2.5 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-amber-400/90 block mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    市内の名所 (3箇所)
                  </span>
                  <div className="space-y-1">
                    {city.landmarks.map((lm) => {
                      const isLmCleared = clearedLandmarkIds.includes(lm.id);
                      return (
                        <div
                          key={lm.id}
                          className={`flex items-center justify-between text-[11px] px-2 py-0.5 rounded ${
                            isLmCleared
                              ? 'text-emerald-300 bg-emerald-950/40 font-bold'
                              : 'text-slate-300 bg-slate-900/60'
                          }`}
                        >
                          <span className="truncate">{lm.name}</span>
                          {isLmCleared ? (
                            <span className="text-[10px] text-emerald-400 font-bold">✓ 制覇</span>
                          ) : (
                            <span className="text-[10px] text-slate-500">未達成</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* フッター */}
        <div className="p-3 md:p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            表示中: <strong className="text-white">{filteredCities.length}</strong> 市
          </span>
          <span className="text-[11px]">
            ※ 市を選択すると地図が自動的にその市街へズームフォーカスします
          </span>
        </div>
      </div>
    </div>
  );
};
