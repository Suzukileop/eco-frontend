import type { CSSProperties } from 'react';
import {
  buildGradientBackground,
  colorWithOpacity,
  type HeroBackgroundGradientType,
} from '@/components/portfolio/portfolio-hero-background-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import type {
  PortfolioGlobalBackgroundImagePosition,
  PortfolioGlobalBackgroundImageSize,
} from '@/components/portfolio/portfolio-global-settings';

export type PortfolioSectionBackgroundFill = 'solid' | 'gradient' | 'image';

export type PortfolioSectionBackgroundSettings = {
  sectionBackgroundEnabled: boolean;
  sectionBackgroundFill: PortfolioSectionBackgroundFill;
  sectionBackgroundColor: string;
  sectionBackgroundOpacity: number;
  sectionBackgroundGradientType: HeroBackgroundGradientType;
  sectionBackgroundGradientFrom: string;
  sectionBackgroundGradientTo: string;
  sectionBackgroundGradientAngle: number;
  sectionBackgroundImageUrl: string;
  sectionBackgroundImageSize: PortfolioGlobalBackgroundImageSize;
  sectionBackgroundImagePosition: PortfolioGlobalBackgroundImagePosition;
};

export const DEFAULT_SECTION_BACKGROUND_COLOR = '#ffffff';

export const DEFAULT_SECTION_BACKGROUND: PortfolioSectionBackgroundSettings = {
  sectionBackgroundEnabled: false,
  sectionBackgroundFill: 'solid',
  sectionBackgroundColor: DEFAULT_SECTION_BACKGROUND_COLOR,
  sectionBackgroundOpacity: 100,
  sectionBackgroundGradientType: 'linear',
  sectionBackgroundGradientFrom: '#ffffff',
  sectionBackgroundGradientTo: '#f5f5f5',
  sectionBackgroundGradientAngle: 160,
  sectionBackgroundImageUrl: '',
  sectionBackgroundImageSize: 'cover',
  sectionBackgroundImagePosition: 'center',
};

export const PORTFOLIO_SECTION_BACKGROUND_FILL_OPTIONS: {
  value: PortfolioSectionBackgroundFill;
  label: string;
  description: string;
}[] = [
  { value: 'solid', label: 'Solid', description: 'Single flat color across the section.' },
  { value: 'gradient', label: 'Gradient', description: 'Blend two colors — linear or radial.' },
  { value: 'image', label: 'Image', description: 'Upload a photo as the section backdrop.' },
];

export const PORTFOLIO_SECTION_BACKGROUND_GRADIENT_TYPE_OPTIONS: {
  value: HeroBackgroundGradientType;
  label: string;
  description: string;
}[] = [
  { value: 'linear', label: 'Linear', description: 'Directional fade — angle controls rotation.' },
  { value: 'radial', label: 'Radial', description: 'Circular glow from the center outward.' },
];

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function sanitizeOpacity(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : fallback;
}

function clampAngle(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function sanitizeImageUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return trimmed;
  } catch {
    return '';
  }
  return '';
}

function imagePositionCss(position: PortfolioGlobalBackgroundImagePosition): string {
  switch (position) {
    case 'top':
      return 'center top';
    case 'bottom':
      return 'center bottom';
    case 'left':
      return 'left center';
    case 'right':
      return 'right center';
    case 'top-left':
      return 'left top';
    case 'top-right':
      return 'right top';
    case 'bottom-left':
      return 'left bottom';
    case 'bottom-right':
      return 'right bottom';
    default:
      return 'center center';
  }
}

function imageSizeCss(size: PortfolioGlobalBackgroundImageSize): string {
  switch (size) {
    case 'contain':
      return 'contain';
    case 'fill':
      return '100% 100%';
    default:
      return 'cover';
  }
}

export function sectionBackgroundStyle(
  settings: PortfolioSectionBackgroundSettings
): CSSProperties | undefined {
  if (!settings.sectionBackgroundEnabled) return undefined;

  const opacity = settings.sectionBackgroundOpacity;

  if (settings.sectionBackgroundFill === 'image') {
    const url = sanitizeImageUrl(settings.sectionBackgroundImageUrl);
    if (!url) return undefined;
    return {
      backgroundImage: `url(${JSON.stringify(url)})`,
      backgroundSize: imageSizeCss(settings.sectionBackgroundImageSize),
      backgroundPosition: imagePositionCss(settings.sectionBackgroundImagePosition),
      backgroundRepeat: 'no-repeat',
      opacity: opacity / 100,
    };
  }

  if (settings.sectionBackgroundFill === 'gradient') {
    return {
      background: buildGradientBackground({
        type: settings.sectionBackgroundGradientType,
        from: settings.sectionBackgroundGradientFrom,
        to: settings.sectionBackgroundGradientTo,
        angle: settings.sectionBackgroundGradientAngle,
        opacityPercent: opacity,
      }),
    };
  }

  return {
    backgroundColor: colorWithOpacity(settings.sectionBackgroundColor, opacity),
  };
}

export function mergeSectionBackground(
  base: PortfolioSectionBackgroundSettings,
  patch: unknown
): PortfolioSectionBackgroundSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const fill = record.sectionBackgroundFill;
  const gradientType = record.sectionBackgroundGradientType;
  const imageSize = record.sectionBackgroundImageSize;
  const imagePosition = record.sectionBackgroundImagePosition;

  return {
    sectionBackgroundEnabled:
      typeof record.sectionBackgroundEnabled === 'boolean'
        ? record.sectionBackgroundEnabled
        : base.sectionBackgroundEnabled,
    sectionBackgroundFill:
      fill === 'solid' || fill === 'gradient' || fill === 'image' ? fill : base.sectionBackgroundFill,
    sectionBackgroundColor: sanitizeHex(record.sectionBackgroundColor, base.sectionBackgroundColor),
    sectionBackgroundOpacity: sanitizeOpacity(record.sectionBackgroundOpacity, base.sectionBackgroundOpacity),
    sectionBackgroundGradientType:
      gradientType === 'linear' || gradientType === 'radial'
        ? gradientType
        : base.sectionBackgroundGradientType,
    sectionBackgroundGradientFrom: sanitizeHex(
      record.sectionBackgroundGradientFrom,
      base.sectionBackgroundGradientFrom
    ),
    sectionBackgroundGradientTo: sanitizeHex(record.sectionBackgroundGradientTo, base.sectionBackgroundGradientTo),
    sectionBackgroundGradientAngle:
      typeof record.sectionBackgroundGradientAngle === 'number'
        ? clampAngle(record.sectionBackgroundGradientAngle)
        : base.sectionBackgroundGradientAngle,
    sectionBackgroundImageUrl:
      typeof record.sectionBackgroundImageUrl === 'string'
        ? record.sectionBackgroundImageUrl.trim()
        : base.sectionBackgroundImageUrl,
    sectionBackgroundImageSize:
      imageSize === 'cover' || imageSize === 'contain' || imageSize === 'fill'
        ? imageSize
        : base.sectionBackgroundImageSize,
    sectionBackgroundImagePosition:
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
        : base.sectionBackgroundImagePosition,
  };
}

export function pickSectionBackgroundSettings(source: unknown): PortfolioSectionBackgroundSettings {
  return mergeSectionBackground(DEFAULT_SECTION_BACKGROUND, source);
}
