import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

export type HeroBackgroundFill = 'solid' | 'gradient' | 'image';

export type HeroBackgroundGradientType = 'linear' | 'radial';

export type PortfolioHeroBackgroundSettings = {
  heroSectionBackgroundFill: HeroBackgroundFill;
  heroSectionBackgroundColor: string;
  heroSectionBackgroundOpacity: number;
  heroSectionBackgroundGradientType: HeroBackgroundGradientType;
  heroSectionBackgroundGradientFrom: string;
  heroSectionBackgroundGradientTo: string;
  heroSectionBackgroundGradientAngle: number;
  heroSectionBackgroundImageUrl: string;
  heroSectionBackgroundImageSize: 'cover' | 'contain' | 'fill';
  heroSectionBackgroundImagePosition:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  heroMotifFill: Exclude<HeroBackgroundFill, 'image'>;
  heroMotifOpacity: number;
  heroMotifGradientType: HeroBackgroundGradientType;
  heroMotifGradientTo: string;
  heroMotifGradientAngle: number;
};

export const DEFAULT_HERO_SECTION_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_HERO_MOTIF_GRADIENT_TO = '#0a0a0a';

export const DEFAULT_HERO_BACKGROUND_SETTINGS: PortfolioHeroBackgroundSettings = {
  heroSectionBackgroundFill: 'solid',
  heroSectionBackgroundColor: DEFAULT_HERO_SECTION_BACKGROUND_COLOR,
  heroSectionBackgroundOpacity: 100,
  heroSectionBackgroundGradientType: 'linear',
  heroSectionBackgroundGradientFrom: '#ffffff',
  heroSectionBackgroundGradientTo: '#f5f5f5',
  heroSectionBackgroundGradientAngle: 160,
  heroSectionBackgroundImageUrl: '',
  heroSectionBackgroundImageSize: 'cover',
  heroSectionBackgroundImagePosition: 'center',
  heroMotifFill: 'solid',
  heroMotifOpacity: 100,
  heroMotifGradientType: 'linear',
  heroMotifGradientTo: DEFAULT_HERO_MOTIF_GRADIENT_TO,
  heroMotifGradientAngle: 135,
};

export const PORTFOLIO_HERO_BACKGROUND_FILL_OPTIONS: {
  value: Exclude<HeroBackgroundFill, 'image'>;
  label: string;
  description: string;
}[] = [
  { value: 'solid', label: 'Solid', description: 'Single flat color across the area.' },
  { value: 'gradient', label: 'Gradient', description: 'Blend two colors — linear or radial.' },
];

export const PORTFOLIO_HERO_SECTION_BACKGROUND_FILL_OPTIONS: {
  value: HeroBackgroundFill;
  label: string;
  description: string;
}[] = [
  ...PORTFOLIO_HERO_BACKGROUND_FILL_OPTIONS,
  { value: 'image', label: 'Image', description: 'Upload a photo as the hero backdrop.' },
];

export const PORTFOLIO_HERO_BACKGROUND_GRADIENT_TYPE_OPTIONS: {
  value: HeroBackgroundGradientType;
  label: string;
  description: string;
}[] = [
  { value: 'linear', label: 'Linear', description: 'Directional fade — angle controls rotation.' },
  { value: 'radial', label: 'Radial', description: 'Circular glow from the center outward.' },
];

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function clampAngle(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const trimmed = hex.trim();
  const short = /^#([0-9A-Fa-f]{3})$/.exec(trimmed);
  if (short) {
    const h = short[1];
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  const long = /^#([0-9A-Fa-f]{6})$/.exec(trimmed);
  if (long) {
    const h = long[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

export function colorWithOpacity(hex: string, opacityPercent: number): string {
  const rgb = parseHexColor(hex);
  const alpha = clampPercent(opacityPercent) / 100;
  if (!rgb) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function buildGradientBackground(params: {
  type: HeroBackgroundGradientType;
  from: string;
  to: string;
  angle: number;
  opacityPercent: number;
}): string {
  const from = colorWithOpacity(params.from, params.opacityPercent);
  const to = colorWithOpacity(params.to, params.opacityPercent);
  if (params.type === 'radial') {
    return `radial-gradient(circle at center, ${from}, ${to})`;
  }
  return `linear-gradient(${clampAngle(params.angle)}deg, ${from}, ${to})`;
}

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function sanitizeOpacity(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? clampPercent(value) : fallback;
}

export function heroSectionBackgroundStyle(settings: PortfolioHeroBackgroundSettings): CSSProperties {
  const opacity = settings.heroSectionBackgroundOpacity;

  if (settings.heroSectionBackgroundFill === 'image') {
    const url =
      typeof settings.heroSectionBackgroundImageUrl === 'string'
        ? settings.heroSectionBackgroundImageUrl.trim()
        : '';
    if (!url) {
      return {
        backgroundColor: colorWithOpacity(settings.heroSectionBackgroundColor, opacity),
      };
    }
    const size =
      settings.heroSectionBackgroundImageSize === 'contain'
        ? 'contain'
        : settings.heroSectionBackgroundImageSize === 'fill'
          ? '100% 100%'
          : 'cover';
    const positionMap: Record<string, string> = {
      center: 'center center',
      top: 'center top',
      bottom: 'center bottom',
      left: 'left center',
      right: 'right center',
      'top-left': 'left top',
      'top-right': 'right top',
      'bottom-left': 'left bottom',
      'bottom-right': 'right bottom',
    };
    return {
      backgroundImage: `url(${JSON.stringify(url)})`,
      backgroundSize: size,
      backgroundPosition: positionMap[settings.heroSectionBackgroundImagePosition] ?? 'center center',
      backgroundRepeat: 'no-repeat',
      opacity: opacity / 100,
    };
  }

  if (settings.heroSectionBackgroundFill === 'gradient') {
    return {
      background: buildGradientBackground({
        type: settings.heroSectionBackgroundGradientType,
        from: settings.heroSectionBackgroundGradientFrom,
        to: settings.heroSectionBackgroundGradientTo,
        angle: settings.heroSectionBackgroundGradientAngle,
        opacityPercent: opacity,
      }),
    };
  }

  return {
    backgroundColor: colorWithOpacity(settings.heroSectionBackgroundColor, opacity),
  };
}

export function heroMotifPanelFillStyle(
  settings: PortfolioHeroBackgroundSettings,
  motifColor: string
): Pick<CSSProperties, 'background' | 'backgroundColor'> {
  const opacity = settings.heroMotifOpacity;

  if (settings.heroMotifFill === 'gradient') {
    return {
      background: buildGradientBackground({
        type: settings.heroMotifGradientType,
        from: motifColor,
        to: settings.heroMotifGradientTo,
        angle: settings.heroMotifGradientAngle,
        opacityPercent: opacity,
      }),
    };
  }

  return {
    backgroundColor: colorWithOpacity(motifColor, opacity),
  };
}

export function mergeHeroBackgroundSettings(
  base: PortfolioHeroBackgroundSettings,
  patch: unknown
): PortfolioHeroBackgroundSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const sectionFill = record.heroSectionBackgroundFill;
  const motifFill = record.heroMotifFill;
  const sectionGradientType = record.heroSectionBackgroundGradientType;
  const motifGradientType = record.heroMotifGradientType;
  const imageSize = record.heroSectionBackgroundImageSize;
  const imagePosition = record.heroSectionBackgroundImagePosition;

  return {
    heroSectionBackgroundFill:
      sectionFill === 'solid' || sectionFill === 'gradient' || sectionFill === 'image'
        ? sectionFill
        : base.heroSectionBackgroundFill,
    heroSectionBackgroundColor: sanitizeHex(record.heroSectionBackgroundColor, base.heroSectionBackgroundColor),
    heroSectionBackgroundOpacity: sanitizeOpacity(record.heroSectionBackgroundOpacity, base.heroSectionBackgroundOpacity),
    heroSectionBackgroundGradientType:
      sectionGradientType === 'linear' || sectionGradientType === 'radial'
        ? sectionGradientType
        : base.heroSectionBackgroundGradientType,
    heroSectionBackgroundGradientFrom: sanitizeHex(
      record.heroSectionBackgroundGradientFrom,
      base.heroSectionBackgroundGradientFrom
    ),
    heroSectionBackgroundGradientTo: sanitizeHex(
      record.heroSectionBackgroundGradientTo,
      base.heroSectionBackgroundGradientTo
    ),
    heroSectionBackgroundGradientAngle:
      typeof record.heroSectionBackgroundGradientAngle === 'number'
        ? clampAngle(record.heroSectionBackgroundGradientAngle)
        : base.heroSectionBackgroundGradientAngle,
    heroSectionBackgroundImageUrl:
      typeof record.heroSectionBackgroundImageUrl === 'string'
        ? record.heroSectionBackgroundImageUrl.trim()
        : base.heroSectionBackgroundImageUrl,
    heroSectionBackgroundImageSize:
      imageSize === 'cover' || imageSize === 'contain' || imageSize === 'fill'
        ? imageSize
        : base.heroSectionBackgroundImageSize,
    heroSectionBackgroundImagePosition:
      imagePosition === 'center' ||
      imagePosition === 'top' ||
      imagePosition === 'bottom' ||
      imagePosition === 'left' ||
      imagePosition === 'right' ||
      imagePosition === 'top-left' ||
      imagePosition === 'top-right' ||
      imagePosition === 'bottom-left' ||
      imagePosition === 'bottom-right'
        ? imagePosition
        : base.heroSectionBackgroundImagePosition,
    heroMotifFill: motifFill === 'solid' || motifFill === 'gradient' ? motifFill : base.heroMotifFill,
    heroMotifOpacity: sanitizeOpacity(record.heroMotifOpacity, base.heroMotifOpacity),
    heroMotifGradientType:
      motifGradientType === 'linear' || motifGradientType === 'radial'
        ? motifGradientType
        : base.heroMotifGradientType,
    heroMotifGradientTo: sanitizeHex(record.heroMotifGradientTo, base.heroMotifGradientTo),
    heroMotifGradientAngle:
      typeof record.heroMotifGradientAngle === 'number'
        ? clampAngle(record.heroMotifGradientAngle)
        : base.heroMotifGradientAngle,
  };
}
