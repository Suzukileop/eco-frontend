import type { CSSProperties } from 'react';

export type PortfolioHeroPortraitSize = 'compact' | 'standard' | 'large';

export type PortfolioHeroPortraitRadius = 'square' | 'soft' | 'round' | 'pill';

export type PortfolioHeroCreatorNameSize = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioHeroCreatorNameFont = 'sans' | 'serif' | 'display';

/** Content-box X (%) + panel height Y (%) — matches the inset hero portrait layer. */
export type PortraitPosition = { x: number; y: number };

export const DEFAULT_PORTRAIT_POSITION: PortraitPosition = { x: 80, y: 44 };

export type PortfolioHeroProfileSettings = {
  showPortraitFrame: boolean;
  portraitFrameColor: string;
  portraitFrameWidth: number;
  portraitSize: PortfolioHeroPortraitSize;
  portraitRadius: PortfolioHeroPortraitRadius;
  portraitPosition: PortraitPosition;
  showCreatorName: boolean;
  creatorNameColor: string;
  creatorNameSize: PortfolioHeroCreatorNameSize;
  creatorNameFont: PortfolioHeroCreatorNameFont;
};

export const DEFAULT_HERO_PROFILE_SETTINGS: PortfolioHeroProfileSettings = {
  showPortraitFrame: true,
  portraitFrameColor: '#ffffff',
  portraitFrameWidth: 14,
  portraitSize: 'standard',
  portraitRadius: 'round',
  portraitPosition: { ...DEFAULT_PORTRAIT_POSITION },
  showCreatorName: true,
  creatorNameColor: '#0a0a0a',
  creatorNameSize: 'md',
  creatorNameFont: 'sans',
};

export const PORTFOLIO_HERO_PORTRAIT_SIZE_OPTIONS: {
  value: PortfolioHeroPortraitSize;
  label: string;
  description: string;
}[] = [
  { value: 'compact', label: 'Compact', description: 'Smaller portrait — subtle presence.' },
  { value: 'standard', label: 'Standard', description: 'Default editorial size.' },
  { value: 'large', label: 'Large', description: 'Bigger portrait for stronger focus.' },
];

export const PORTFOLIO_HERO_PORTRAIT_RADIUS_OPTIONS: {
  value: PortfolioHeroPortraitRadius;
  label: string;
  description: string;
}[] = [
  { value: 'square', label: 'Square', description: 'Sharp corners — graphic look.' },
  { value: 'soft', label: 'Soft', description: 'Moderate rounded corners.' },
  { value: 'round', label: 'Round', description: 'Editorial default radius.' },
  { value: 'pill', label: 'Pill', description: 'Extra-rounded capsule shape.' },
];

export const PORTFOLIO_HERO_FRAME_WIDTH_OPTIONS: {
  value: number;
  label: string;
}[] = [
  { value: 0, label: 'No border' },
  { value: 6, label: 'Thin' },
  { value: 10, label: 'Medium' },
  { value: 14, label: 'Bold' },
  { value: 20, label: 'Thick' },
];

export const PORTFOLIO_HERO_CREATOR_NAME_SIZE_OPTIONS: {
  value: PortfolioHeroCreatorNameSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

export const PORTFOLIO_HERO_CREATOR_NAME_FONT_OPTIONS: {
  value: PortfolioHeroCreatorNameFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Sans', description: 'Clean geometric sans-serif.' },
  { value: 'serif', label: 'Serif', description: 'Playfair Display — editorial.' },
  { value: 'display', label: 'Display caps', description: 'Bold uppercase poster style.' },
];

export const PORTFOLIO_HERO_PORTRAIT_POSITION_PRESETS: {
  id: string;
  label: string;
  position: PortraitPosition;
}[] = [
  { id: 'default', label: 'Default', position: { x: 80, y: 44 } },
  { id: 'center', label: 'Motif center', position: { x: 82, y: 50 } },
  { id: 'upper', label: 'Upper', position: { x: 80, y: 28 } },
  { id: 'lower', label: 'Lower', position: { x: 80, y: 68 } },
  { id: 'left', label: 'Left edge', position: { x: 62, y: 44 } },
  { id: 'right', label: 'Right edge', position: { x: 90, y: 44 } },
];

function clampPortraitAxis(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampPortraitPosition(position: PortraitPosition): PortraitPosition {
  return {
    x: clampPortraitAxis(position.x, 2, 98),
    y: clampPortraitAxis(position.y, 8, 92),
  };
}

export function sanitizePortraitPosition(value: unknown, base: PortraitPosition): PortraitPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampPortraitPosition({ x, y });
}

export function portraitPositionStyle(position: PortraitPosition): CSSProperties {
  const clamped = clampPortraitPosition(position);
  return {
    left: `${clamped.x}%`,
    top: `${clamped.y}%`,
    transform: 'translate(-50%, -50%)',
  };
}

export function isValidProfileHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
}

export function portraitWrapperSizeClass(size: PortfolioHeroPortraitSize): string {
  switch (size) {
    case 'compact':
      return 'w-full max-w-[14rem] sm:max-w-[15rem] lg:max-w-[16rem]';
    case 'large':
      return 'w-full max-w-[20rem] sm:max-w-[22rem] lg:max-w-[24rem]';
    default:
      return 'w-full max-w-[17rem] sm:max-w-[19rem] lg:max-w-[20rem]';
  }
}

export function portraitRadiusClass(radius: PortfolioHeroPortraitRadius): string {
  switch (radius) {
    case 'square':
      return 'rounded-none';
    case 'soft':
      return 'rounded-2xl';
    case 'pill':
      return 'rounded-[2.5rem]';
    default:
      return 'rounded-[2rem]';
  }
}

export function creatorNameSizeClass(size: PortfolioHeroCreatorNameSize): string {
  switch (size) {
    case 'sm':
      return 'text-sm sm:text-base';
    case 'lg':
      return 'text-lg sm:text-xl';
    case 'xl':
      return 'text-xl sm:text-2xl';
    default:
      return 'text-base sm:text-lg';
  }
}

export function creatorNameFontClass(font: PortfolioHeroCreatorNameFont): string {
  switch (font) {
    case 'serif':
      return 'font-serif font-semibold tracking-[-0.02em]';
    case 'display':
      return 'font-black uppercase tracking-[0.08em]';
    default:
      return 'font-bold tracking-tight';
  }
}

export function creatorNameFontStyle(font: PortfolioHeroCreatorNameFont): CSSProperties | undefined {
  if (font !== 'serif') return undefined;
  return { fontFamily: "'Playfair Display', serif" };
}

export function mergeHeroProfileSettings(
  base: PortfolioHeroProfileSettings,
  patch: unknown
): PortfolioHeroProfileSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const portraitSize = record.portraitSize;
  const portraitRadius = record.portraitRadius;
  const creatorNameSize = record.creatorNameSize;
  const creatorNameFont = record.creatorNameFont;
  const frameWidth = record.portraitFrameWidth;

  const portraitFrameColor =
    typeof record.portraitFrameColor === 'string' && isValidProfileHexColor(record.portraitFrameColor)
      ? record.portraitFrameColor.trim()
      : base.portraitFrameColor;

  const creatorNameColorRaw =
    typeof record.creatorNameColor === 'string' && isValidProfileHexColor(record.creatorNameColor)
      ? record.creatorNameColor.trim()
      : base.creatorNameColor;
  const nameHex = creatorNameColorRaw.toLowerCase();
  const frameHex = portraitFrameColor.toLowerCase();
  const nameIsWhite = nameHex === '#ffffff' || nameHex === '#fff';
  const frameIsLight =
    frameHex === '#ffffff' ||
    frameHex === '#fff' ||
    frameHex === '#f5f5f5' ||
    frameHex === '#fafafa';
  // Previous editorial factory: white name on white/light frame — migrate to black for contrast.
  // Keep white names on dark frames (e.g. Noir).
  const creatorNameColor = nameIsWhite && frameIsLight ? base.creatorNameColor : creatorNameColorRaw;

  let portraitFrameWidth = base.portraitFrameWidth;
  if (typeof frameWidth === 'number' && frameWidth >= 0 && frameWidth <= 24) {
    portraitFrameWidth = frameWidth;
  }

  return {
    showPortraitFrame:
      typeof record.showPortraitFrame === 'boolean' ? record.showPortraitFrame : base.showPortraitFrame,
    portraitFrameColor,
    portraitFrameWidth,
    portraitSize:
      portraitSize === 'compact' || portraitSize === 'standard' || portraitSize === 'large'
        ? portraitSize
        : base.portraitSize,
    portraitRadius:
      portraitRadius === 'square' ||
      portraitRadius === 'soft' ||
      portraitRadius === 'round' ||
      portraitRadius === 'pill'
        ? portraitRadius
        : base.portraitRadius,
    portraitPosition: sanitizePortraitPosition(record.portraitPosition, base.portraitPosition),
    showCreatorName:
      typeof record.showCreatorName === 'boolean' ? record.showCreatorName : base.showCreatorName,
    creatorNameColor,
    creatorNameSize:
      creatorNameSize === 'sm' ||
      creatorNameSize === 'md' ||
      creatorNameSize === 'lg' ||
      creatorNameSize === 'xl'
        ? creatorNameSize
        : base.creatorNameSize,
    creatorNameFont:
      creatorNameFont === 'sans' || creatorNameFont === 'serif' || creatorNameFont === 'display'
        ? creatorNameFont
        : base.creatorNameFont,
  };
}
