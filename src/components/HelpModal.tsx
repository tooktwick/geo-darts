import React from 'react';
import { X, Target, Compass, Award, ZoomIn, Flame, HelpCircle, MapPin, Sparkles } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl w-[92vw] max-h-[88vh] glass-panel-gold rounded-3xl p-5 md:p-8 border-amber-500/50 shadow-2xl flex flex-col overflow-hidden">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-amber-300 font-calligraphy">
                遊び方 & 投てき・採点ガイド
              </h2>
              <p className="text-xs text-slate-400">
                『日本列島 ダーツの旅』の操作方法と新・基本モードのルール
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

        {/* ガイドコンテンツ */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 scrollbar-thin text-slate-200">
          
          {/* 1. 基本モードのルール */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-400/50 shadow-lg">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-2 font-calligraphy">
              <MapPin className="w-5 h-5 text-amber-400" />
              1. 基本モード：県内3大名所ニアピン巡り
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-400 font-mono text-sm">①</span>
                <div>
                  <strong className="text-slate-100">未制覇の県がランダム選定:</strong>
                  <span className="text-slate-400 block">
                    まだクリアしていない都道府県の中から1つが自動選ばれます。
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-400 font-mono text-sm">②</span>
                <div>
                  <strong className="text-slate-100">県内3大名所ターゲット:</strong>
                  <span className="text-slate-400 block">
                    その県を代表する有名な観光地・世界遺産・絶景スポット3箇所がマップ上に登場！
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-400 font-mono text-sm">③</span>
                <div>
                  <strong className="text-slate-100">ニアピンで目標クリア:</strong>
                  <span className="text-slate-400 block">
                    名所の近く（35km/至近距離）に着弾させると「ニアピン成功！」となり目標達成。
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-400 font-mono text-sm">④</span>
                <div>
                  <strong className="text-slate-100">県制覇 ＆ 未クリア県へループ:</strong>
                  <span className="text-slate-400 block">
                    3箇所すべてクリアすると「県制覇！」となり記念朱印を捺印。次の未制覇の県へと自動で旅が続きます。
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 1.5 難易度設定 (Easy / Normal / Hard) */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-sky-500/40 shadow-lg">
            <h3 className="text-base font-bold text-sky-300 flex items-center gap-2 mb-2 font-calligraphy">
              <Sparkles className="w-5 h-5 text-sky-400" />
              難易度設定（目標の地図表示 & 距離ヒント）
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex-shrink-0">
                  Easy (初級)
                </span>
                <div>
                  <strong className="text-emerald-200 block">目標の地図表示：ON（常時表示）</strong>
                  <span className="text-slate-300 text-[11px] leading-relaxed block">
                    マップ上に名所ピンやピンポイント同心円リングが常に見えています。初心者でも迷わず直感的に狙えます（スコア倍率 1.0x）。
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex-shrink-0">
                  Normal (中級)
                </span>
                <div>
                  <strong className="text-amber-200 block">目標の地図表示：OFF ＆ 投げた後の距離を表示</strong>
                  <span className="text-slate-300 text-[11px] leading-relaxed block">
                    目標ピンは地図上から非表示！ダーツを着弾させると「【兼六園】まで あと 4.2 km (南東へ)」の距離と方角が表示され、修正しながら寄せていく本格ブラインドニアピン（スコア倍率 1.3x）。
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-2">
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] flex-shrink-0">
                  Hard (上級)
                </span>
                <div>
                  <strong className="text-red-200 block">目標の地図表示：OFF（距離ヒントなし）</strong>
                  <span className="text-slate-300 text-[11px] leading-relaxed block">
                    目標ピンも距離表示も一切なし！己の地理知識と地形観察眼だけで挑む究極の達人モード（スコア倍率 1.8x）。
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 投てきアクション */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-2 font-calligraphy">
              <Target className="w-5 h-5 text-amber-400" />
              2. 2通りの投てき操作
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-black/30 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-sky-400 block mb-1">① タップ / クリック投てき</span>
                <p className="text-slate-400 leading-relaxed">
                  マップ上の名所や狙いたい地点をクリックするだけで、即座にその地点を目がけてダーツが飛翔します。
                </p>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">② プルバック投てき (引っ張り)</span>
                <p className="text-slate-400 leading-relaxed">
                  画面下部の投てき台を後ろに引っ張って放つと、リアルな力加減と角度でダーツを射出できます。
                </p>
              </div>
            </div>
          </div>

          {/* 3. 放物線弾道と風のシミュレーション */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-2 font-calligraphy">
              <Compass className="w-5 h-5 text-sky-400" />
              3. ダーツの立体「放物線」弾道 & 風の影響
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              手前下から奥の目標へ向かって、ダーツが上空へ山なりに弧を描いて舞い上がります。地面に落ちるリアルタイムの「影」が空中で離れ、着弾瞬間にピタリと合流して突き刺さる立体物理を再現！
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              風向きと風速によって、空中で風下側へ徐々に弾道が湾曲して吹き流されます。風向計を見て風上側に偏差を合わせましょう。
            </p>
          </div>

          {/* 4. ズーム連動リスク＆リターン (広域 vs 拡大) */}
          <div className="bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 p-4 rounded-2xl border border-amber-500/40 shadow-xl">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-2 font-calligraphy">
              <Sparkles className="w-5 h-5 text-amber-400" />
              4. ズーム連動リスク＆リターン（広域 vs 拡大）
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="font-bold text-emerald-300 block mb-0.5">
                  🗺️ 広域（日本全体・地方）: 倍率 1.0x 〜 1.8x
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  狙いやすく風の影響（画面上のピクセル変位）も最小。安全ですが獲得素点は基本点上限のローリスク・ローリターン設計です。
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40">
                <span className="font-bold text-red-300 block mb-0.5">
                  🔍 拡大（市区町村・駅前・敷地ピンポイント）: 倍率 4.0x 〜 最大5.0x！
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  駅前広場やランドマーク敷地中心の同心円ターゲットを直撃すると「<strong>PINPOINT BULL!!</strong>」が発動し超高得点！<br />
                  ただし、風による画面ピクセル変位が激増し、少しでも目標から流されると即「<strong>OB（枠外外れ）</strong>」になるハイリスク・ハイリターン！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 閉じる */}
        <div className="pt-4 border-t border-amber-500/30">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg active:scale-98"
          >
            旅をはじめる
          </button>
        </div>
      </div>
    </div>
  );
};
