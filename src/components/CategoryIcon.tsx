import React from 'react';
import { LandmarkCategory } from '../types';

export interface CategoryIconProps {
  category: LandmarkCategory;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  withGlow?: boolean;
  showBadge?: boolean;
}

const SIZE_MAP: Record<string, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

// SVG画像パスのマッピング
export const CATEGORY_ICON_PATHS: Record<LandmarkCategory, string> = {
  castle: '/assets/icons/cat_castle.svg',
  shrine_temple: '/assets/icons/cat_shrine_temple.svg',
  nature: '/assets/icons/cat_nature.svg',
  hotspring: '/assets/icons/cat_hotspring.svg',
  gourmet: '/assets/icons/cat_gourmet.svg',
  heritage: '/assets/icons/cat_heritage.svg',
  modern_spot: '/assets/icons/cat_modern_spot.svg',
  garden: '/assets/icons/cat_garden.svg',
  culture: '/assets/icons/cat_culture.svg',
  spot: '/assets/icons/cat_spot.svg',
};

// カテゴリーごとのテーマ発光カラー
const GLOW_COLORS: Record<LandmarkCategory, string> = {
  castle: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  shrine_temple: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  nature: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  hotspring: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]',
  gourmet: 'drop-shadow-[0_0_8px_rgba(234,88,12,0.6)]',
  heritage: 'drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]',
  modern_spot: 'drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]',
  garden: 'drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]',
  culture: 'drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]',
  spot: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
};

/**
 * 名所種類（カテゴリー）別オリジナル画像アイコンコンポーネント
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'md',
  className = '',
  withGlow = false,
  showBadge = false,
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 24;
  const iconPath = CATEGORY_ICON_PATHS[category] || CATEGORY_ICON_PATHS.spot;
  const glowClass = withGlow ? GLOW_COLORS[category] || '' : '';

  const imageElement = (
    <img
      src={iconPath}
      alt={category}
      width={pixelSize}
      height={pixelSize}
      className={`inline-block select-none object-contain transition-transform duration-200 ${glowClass} ${className}`}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
      }}
      loading="eager"
    />
  );

  if (showBadge) {
    return (
      <div
        className="inline-flex items-center justify-center rounded-xl p-1 bg-slate-950/80 border border-amber-500/30 shadow-inner"
        style={{
          width: `${pixelSize + 8}px`,
          height: `${pixelSize + 8}px`,
        }}
      >
        {imageElement}
      </div>
    );
  }

  return imageElement;
};
