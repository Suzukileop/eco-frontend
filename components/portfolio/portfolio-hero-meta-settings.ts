import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

/** @deprecated Legacy — migrated on read into showMetaFrame + metaFrameShape. */
export type PortfolioHeroMetaFrameStyle =
  | 'circle-pill'
  | 'rounded-square'
  | 'square'
  | 'pill'
  | 'outline'
  | 'minimal';

export type PortfolioHeroMetaFrameShape = 'circle' | 'rounded' | 'square' | 'pill';

export type PortfolioHeroMetaDisplayDesign = 'elevated' | 'flat' | 'soft' | 'glass' | 'dark';

export type PortfolioHeroMetaPlacementMode = 'straddle-bottom' | 'free';

export type PortfolioHeroMetaSpread = 'compact' | 'standard' | 'wide';

export type PortfolioHeroMetaInnerLayout = 'stacked' | 'inline' | 'value-first' | 'icon-bottom';

export type PortfolioHeroMetaCardPadding = 'tight' | 'standard' | 'relaxed';

export type PortfolioHeroMetaValueSize = 'sm' | 'md' | 'lg';

export type MetaRowPosition = { x: number; y: number };

export type PortfolioHeroMetaSettings = {
  showYearsCard: boolean;
  showProjectsCard: boolean;
  showLocationCard: boolean;
  showMetaFrame: boolean;
  metaFrameShape: PortfolioHeroMetaFrameShape;
  metaFrameBorderWidth: number;
  metaDisplayDesign: PortfolioHeroMetaDisplayDesign;
  metaInnerLayout: PortfolioHeroMetaInnerLayout;
  metaCardPadding: PortfolioHeroMetaCardPadding;
  metaValueSize: PortfolioHeroMetaValueSize;
  metaShowLabels: boolean;
  metaPlacementMode: PortfolioHeroMetaPlacementMode;
  metaPosition: MetaRowPosition;
  metaSpread: PortfolioHeroMetaSpread;
  showMetaIcons: boolean;
  metaAccentColor: string;
  metaValueColor: string;
  metaLabelColor: string;
};

export const DEFAULT_META_ROW_POSITION: MetaRowPosition = { x: 80, y: 88 };

export const DEFAULT_HERO_META_SETTINGS: PortfolioHeroMetaSettings = {
  showYearsCard: true,
  showProjectsCard: true,
  showLocationCard: true,
  showMetaFrame: true,
  metaFrameShape: 'circle',
  metaFrameBorderWidth: 1,
  metaDisplayDesign: 'elevated',
  metaInnerLayout: 'stacked',
  metaCardPadding: 'standard',
  metaValueSize: 'md',
  metaShowLabels: true,
  metaPlacementMode: 'straddle-bottom',
  metaPosition: { ...DEFAULT_META_ROW_POSITION },
  metaSpread: 'standard',
  showMetaIcons: true,
  metaAccentColor: '#f97316',
  metaValueColor: '#171717',
  metaLabelColor: '#737373',
};

export const PORTFOLIO_HERO_META_FRAME_SHAPE_OPTIONS: {
  value: PortfolioHeroMetaFrameShape;
  label: string;
  description: string;
}[] = [
  { value: 'circle', label: 'Circle', description: 'Round stat chips — location stays wider.' },
  { value: 'rounded', label: 'Rounded', description: 'Soft rounded rectangles on every card.' },
  { value: 'square', label: 'Square', description: 'Sharp corners — graphic and bold.' },
  { value: 'pill', label: 'Pill', description: 'Capsule shapes — elongated location pill.' },
];

export const PORTFOLIO_HERO_META_BORDER_WIDTH_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Thin' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Bold' },
];

export const PORTFOLIO_HERO_META_INNER_LAYOUT_OPTIONS: {
  value: PortfolioHeroMetaInnerLayout;
  label: string;
  description: string;
}[] = [
  { value: 'stacked', label: 'Stacked', description: 'Icon on top, value, then label — classic layout.' },
  { value: 'inline', label: 'Inline', description: 'Icon beside the value — compact horizontal row.' },
  { value: 'value-first', label: 'Value first', description: 'Number prominent, label below, icon last.' },
  { value: 'icon-bottom', label: 'Icon bottom', description: 'Value and label first, icon anchored below.' },
];

export const PORTFOLIO_HERO_META_PADDING_OPTIONS: {
  value: PortfolioHeroMetaCardPadding;
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Tight', description: 'Compact card — less padding and smaller footprint.' },
  { value: 'standard', label: 'Standard', description: 'Default editorial proportions.' },
  { value: 'relaxed', label: 'Relaxed', description: 'More breathing room inside each card.' },
];

export const PORTFOLIO_HERO_META_VALUE_SIZE_OPTIONS: {
  value: PortfolioHeroMetaValueSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

export const PORTFOLIO_HERO_META_DISPLAY_OPTIONS: {
  value: PortfolioHeroMetaDisplayDesign;
  label: string;
  description: string;
}[] = [
  { value: 'elevated', label: 'Elevated', description: 'White cards with shadow — current default.' },
  { value: 'flat', label: 'Flat', description: 'Clean white surface, thin border, no shadow.' },
  { value: 'soft', label: 'Soft gray', description: 'Neutral fill — subtle on white.' },
  { value: 'glass', label: 'Glass', description: 'Frosted translucent cards.' },
  { value: 'dark', label: 'Dark', description: 'Dark cards with light text on the motif.' },
];

export const PORTFOLIO_HERO_META_PLACEMENT_OPTIONS: {
  value: PortfolioHeroMetaPlacementMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'straddle-bottom',
    label: 'Straddle motif edge',
    description: 'Half on motif, half on white — classic editorial look.',
  },
  { value: 'free', label: 'Free placement', description: 'Drag anywhere on the hero panel.' },
];

export const PORTFOLIO_HERO_META_SPREAD_OPTIONS: {
  value: PortfolioHeroMetaSpread;
  label: string;
}[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'wide', label: 'Wide' },
];

export const PORTFOLIO_HERO_META_POSITION_PRESETS: {
  id: string;
  label: string;
  position: MetaRowPosition;
}[] = [
  { id: 'default', label: 'Motif edge', position: { x: 75, y: 88 } },
  { id: 'center', label: 'Motif center', position: { x: 79, y: 55 } },
  { id: 'lower-right', label: 'Lower right', position: { x: 85, y: 92 } },
  { id: 'upper-right', label: 'Upper right', position: { x: 82, y: 35 } },
];

function clampAxis(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampMetaRowPosition(position: MetaRowPosition): MetaRowPosition {
  return {
    x: clampAxis(position.x, 4, 96),
    y: clampAxis(position.y, 20, 98),
  };
}

export function sanitizeMetaRowPosition(value: unknown, base: MetaRowPosition): MetaRowPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampMetaRowPosition({ x, y });
}

export function metaRowPositionStyle(position: MetaRowPosition): CSSProperties {
  const clamped = clampMetaRowPosition(position);
  return {
    left: `${clamped.x}%`,
    top: `${clamped.y}vh`,
    transform: 'translate(-50%, -50%)',
  };
}

export function resolveMetaCardAnchors(
  count: number,
  centerX: number,
  spread: PortfolioHeroMetaSpread
): number[] {
  const gap = spread === 'compact' ? 12 : spread === 'wide' ? 22 : 17;
  if (count <= 1) return [centerX];
  if (count === 2) return [centerX - gap, centerX + gap];
  return [centerX - gap, centerX, centerX + gap];
}

function migrateLegacyFrameStyle(
  legacy: unknown,
  base: PortfolioHeroMetaSettings
): Pick<PortfolioHeroMetaSettings, 'showMetaFrame' | 'metaFrameShape' | 'metaFrameBorderWidth'> {
  if (legacy === 'minimal') {
    return { showMetaFrame: false, metaFrameShape: base.metaFrameShape, metaFrameBorderWidth: 0 };
  }
  if (legacy === 'outline') {
    return { showMetaFrame: true, metaFrameShape: 'rounded', metaFrameBorderWidth: 2 };
  }
  if (legacy === 'rounded-square') {
    return { showMetaFrame: true, metaFrameShape: 'rounded', metaFrameBorderWidth: base.metaFrameBorderWidth };
  }
  if (legacy === 'square') {
    return { showMetaFrame: true, metaFrameShape: 'square', metaFrameBorderWidth: base.metaFrameBorderWidth };
  }
  if (legacy === 'pill') {
    return { showMetaFrame: true, metaFrameShape: 'pill', metaFrameBorderWidth: base.metaFrameBorderWidth };
  }
  if (legacy === 'circle-pill') {
    return { showMetaFrame: true, metaFrameShape: 'circle', metaFrameBorderWidth: base.metaFrameBorderWidth };
  }
  return {
    showMetaFrame: base.showMetaFrame,
    metaFrameShape: base.metaFrameShape,
    metaFrameBorderWidth: base.metaFrameBorderWidth,
  };
}

function metaCardShapeClass(shape: PortfolioHeroMetaFrameShape, isLocation: boolean): string {
  switch (shape) {
    case 'square':
      return 'rounded-none';
    case 'rounded':
      return 'rounded-2xl';
    case 'pill':
      return 'rounded-full';
    default:
      return isLocation ? 'rounded-2xl' : 'rounded-full';
  }
}

function metaCardSurfaceClass(displayDesign: PortfolioHeroMetaDisplayDesign): string {
  switch (displayDesign) {
    case 'flat':
      return 'bg-white shadow-none ring-0';
    case 'soft':
      return 'bg-neutral-100 shadow-none ring-0';
    case 'glass':
      return 'bg-white/75 shadow-md ring-0 backdrop-blur-md';
    case 'dark':
      return 'bg-neutral-950 shadow-lg ring-0';
    default:
      return 'bg-white shadow-[0_16px_48px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06]';
  }
}

function metaCardDimensions(padding: PortfolioHeroMetaCardPadding, isLocation: boolean): string {
  if (isLocation) {
    switch (padding) {
      case 'tight':
        return 'h-[4.75rem] min-w-[7rem] shrink-0 px-2.5 sm:h-[5.5rem] sm:min-w-[8rem] sm:px-3';
      case 'relaxed':
        return 'h-[6.5rem] min-w-[9.5rem] shrink-0 px-4 sm:h-[7.5rem] sm:min-w-[10.5rem] sm:px-5';
      default:
        return 'h-[5.75rem] min-w-[8rem] shrink-0 px-3 sm:h-[6.75rem] sm:min-w-[9.5rem] sm:px-4';
    }
  }

  switch (padding) {
    case 'tight':
      return 'h-[4.75rem] w-[4.75rem] shrink-0 px-1 sm:h-[5.5rem] sm:w-[5.5rem]';
    case 'relaxed':
      return 'h-[6.5rem] w-[6.5rem] shrink-0 px-2 sm:h-[7.5rem] sm:w-[7.5rem]';
    default:
      return 'h-[5.75rem] w-[5.75rem] shrink-0 px-1 sm:h-[6.75rem] sm:w-[6.75rem]';
  }
}

export function metaCardShellClass(meta: PortfolioHeroMetaSettings, isLocation: boolean): string {
  const dimensions = metaCardDimensions(meta.metaCardPadding, isLocation);
  const shape = metaCardShapeClass(meta.metaFrameShape, isLocation);

  if (!meta.showMetaFrame) {
    return `relative flex ${dimensions} flex-col items-center justify-center overflow-visible text-center`;
  }

  const surface = metaCardSurfaceClass(meta.metaDisplayDesign);
  return `relative flex ${dimensions} flex-col items-center justify-center overflow-hidden text-center ${shape} ${surface}`;
}

export function metaCardBorderStyle(meta: PortfolioHeroMetaSettings): CSSProperties | undefined {
  if (!meta.showMetaFrame || meta.metaFrameBorderWidth <= 0) {
    return meta.showMetaFrame ? { borderWidth: 0, borderStyle: 'solid', borderColor: 'transparent' } : undefined;
  }

  const color =
    meta.metaDisplayDesign === 'dark'
      ? '#404040'
      : meta.metaDisplayDesign === 'glass'
        ? 'rgba(255,255,255,0.5)'
        : '#e5e5e5';

  return {
    borderWidth: meta.metaFrameBorderWidth,
    borderStyle: 'solid',
    borderColor: color,
  };
}

export function metaCardInnerClass(layout: PortfolioHeroMetaInnerLayout): string {
  switch (layout) {
    case 'inline':
      return 'flex flex-row items-center gap-2.5 text-left';
    case 'value-first':
      return 'flex flex-col items-center justify-center gap-0.5';
    case 'icon-bottom':
      return 'flex flex-col items-center justify-center gap-1';
    default:
      return 'flex flex-col items-center justify-center';
  }
}

export function metaValueSizeClass(size: PortfolioHeroMetaValueSize, isLocation: boolean): string {
  if (isLocation) {
    switch (size) {
      case 'sm':
        return 'text-[10px] leading-snug sm:text-[11px]';
      case 'lg':
        return 'text-sm leading-snug sm:text-base';
      default:
        return 'text-[11px] leading-snug sm:text-xs';
    }
  }

  switch (size) {
    case 'sm':
      return 'text-sm leading-tight sm:text-base';
    case 'lg':
      return 'text-xl leading-tight sm:text-2xl';
    default:
      return 'text-base leading-tight sm:text-lg';
  }
}

export function metaLabelSizeClass(size: PortfolioHeroMetaValueSize): string {
  switch (size) {
    case 'sm':
      return 'text-[7px] sm:text-[8px]';
    case 'lg':
      return 'text-[9px] sm:text-[10px]';
    default:
      return 'text-[8px] sm:text-[9px]';
  }
}

export function metaCardValueClass(displayDesign: PortfolioHeroMetaDisplayDesign): string {
  return displayDesign === 'dark' ? 'text-white' : 'text-neutral-950';
}

export function metaCardLabelClass(displayDesign: PortfolioHeroMetaDisplayDesign): string {
  return displayDesign === 'dark' ? 'text-neutral-400' : 'text-neutral-500';
}

export function metaValueTextStyle(valueColor: string): CSSProperties {
  return isValidProfileHexColor(valueColor) ? { color: valueColor.trim() } : { color: '#171717' };
}

export function metaLabelTextStyle(labelColor: string): CSSProperties {
  return isValidProfileHexColor(labelColor) ? { color: labelColor.trim() } : { color: '#737373' };
}

export function metaCardIconStyle(accentColor: string): CSSProperties | undefined {
  if (!isValidProfileHexColor(accentColor) || accentColor === '#f97316') return undefined;
  return { color: accentColor };
}

export function mergeHeroMetaSettings(
  base: PortfolioHeroMetaSettings,
  patch: unknown
): PortfolioHeroMetaSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const legacyFrame = record.metaFrameStyle;
  const legacyMigration =
    typeof legacyFrame === 'string'
      ? migrateLegacyFrameStyle(legacyFrame, base)
      : {
          showMetaFrame: base.showMetaFrame,
          metaFrameShape: base.metaFrameShape,
          metaFrameBorderWidth: base.metaFrameBorderWidth,
        };

  const metaFrameShape = record.metaFrameShape;
  const metaDisplayDesign = record.metaDisplayDesign;
  const metaPlacementMode = record.metaPlacementMode;
  const metaSpread = record.metaSpread;
  const metaInnerLayout = record.metaInnerLayout;
  const metaCardPadding = record.metaCardPadding;
  const metaValueSize = record.metaValueSize;
  const frameWidth = record.metaFrameBorderWidth;

  const metaAccentColor =
    typeof record.metaAccentColor === 'string' && isValidProfileHexColor(record.metaAccentColor)
      ? record.metaAccentColor.trim()
      : base.metaAccentColor;

  const metaValueColor =
    typeof record.metaValueColor === 'string' && isValidProfileHexColor(record.metaValueColor)
      ? record.metaValueColor.trim()
      : base.metaValueColor;

  const metaLabelColor =
    typeof record.metaLabelColor === 'string' && isValidProfileHexColor(record.metaLabelColor)
      ? record.metaLabelColor.trim()
      : base.metaLabelColor;

  let metaFrameBorderWidth = legacyMigration.metaFrameBorderWidth;
  if (typeof frameWidth === 'number' && frameWidth >= 0 && frameWidth <= 4) {
    metaFrameBorderWidth = frameWidth;
  }

  return {
    showYearsCard:
      typeof record.showYearsCard === 'boolean' ? record.showYearsCard : base.showYearsCard,
    showProjectsCard:
      typeof record.showProjectsCard === 'boolean' ? record.showProjectsCard : base.showProjectsCard,
    showLocationCard:
      typeof record.showLocationCard === 'boolean' ? record.showLocationCard : base.showLocationCard,
    showMetaFrame:
      typeof record.showMetaFrame === 'boolean'
        ? record.showMetaFrame
        : legacyMigration.showMetaFrame,
    metaFrameShape:
      metaFrameShape === 'circle' ||
      metaFrameShape === 'rounded' ||
      metaFrameShape === 'square' ||
      metaFrameShape === 'pill'
        ? metaFrameShape
        : legacyMigration.metaFrameShape,
    metaFrameBorderWidth,
    metaDisplayDesign:
      metaDisplayDesign === 'elevated' ||
      metaDisplayDesign === 'flat' ||
      metaDisplayDesign === 'soft' ||
      metaDisplayDesign === 'glass' ||
      metaDisplayDesign === 'dark'
        ? metaDisplayDesign
        : base.metaDisplayDesign,
    metaInnerLayout:
      metaInnerLayout === 'stacked' ||
      metaInnerLayout === 'inline' ||
      metaInnerLayout === 'value-first' ||
      metaInnerLayout === 'icon-bottom'
        ? metaInnerLayout
        : base.metaInnerLayout,
    metaCardPadding:
      metaCardPadding === 'tight' || metaCardPadding === 'standard' || metaCardPadding === 'relaxed'
        ? metaCardPadding
        : base.metaCardPadding,
    metaValueSize:
      metaValueSize === 'sm' || metaValueSize === 'md' || metaValueSize === 'lg'
        ? metaValueSize
        : base.metaValueSize,
    metaShowLabels:
      typeof record.metaShowLabels === 'boolean' ? record.metaShowLabels : base.metaShowLabels,
    metaPlacementMode:
      metaPlacementMode === 'straddle-bottom' || metaPlacementMode === 'free'
        ? metaPlacementMode
        : base.metaPlacementMode,
    metaPosition: sanitizeMetaRowPosition(record.metaPosition, base.metaPosition),
    metaSpread:
      metaSpread === 'compact' || metaSpread === 'standard' || metaSpread === 'wide'
        ? metaSpread
        : base.metaSpread,
    showMetaIcons:
      typeof record.showMetaIcons === 'boolean' ? record.showMetaIcons : base.showMetaIcons,
    metaAccentColor,
    metaValueColor,
    metaLabelColor,
  };
}
