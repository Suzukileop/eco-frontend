import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

export type PortfolioElementFont = 'sans' | 'serif' | 'display';

export type PortfolioElementTextSize = 'sm' | 'md' | 'lg' | 'xl';

/** Shared color / font / size / weight controls for portfolio section text. */
export type PortfolioElementTextStyle = {
  color: string;
  font: PortfolioElementFont;
  size: PortfolioElementTextSize;
  italic: boolean;
  bold: boolean;
  uppercase: boolean;
};

export const DEFAULT_ELEMENT_BODY_COLOR = '#525252';
export const DEFAULT_ELEMENT_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_ELEMENT_MUTED_COLOR = '#a3a3a3';

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

export function createElementTextStyle(
  overrides: Partial<PortfolioElementTextStyle> = {}
): PortfolioElementTextStyle {
  return {
    color: DEFAULT_ELEMENT_BODY_COLOR,
    font: 'sans',
    size: 'md',
    italic: false,
    bold: false,
    uppercase: false,
    ...overrides,
  };
}

export function normalizeElementTextStyle(
  raw: unknown,
  fallback: PortfolioElementTextStyle
): PortfolioElementTextStyle {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...fallback };
  const record = raw as Record<string, unknown>;
  const font =
    record.font === 'sans' || record.font === 'serif' || record.font === 'display'
      ? record.font
      : fallback.font;
  const size =
    record.size === 'sm' || record.size === 'md' || record.size === 'lg' || record.size === 'xl'
      ? record.size
      : fallback.size;
  return {
    color: sanitizeHex(record.color, fallback.color),
    font,
    size,
    italic: typeof record.italic === 'boolean' ? record.italic : fallback.italic,
    bold: typeof record.bold === 'boolean' ? record.bold : fallback.bold,
    uppercase: typeof record.uppercase === 'boolean' ? record.uppercase : fallback.uppercase,
  };
}

export function normalizeElementStylesRecord<T extends string>(
  raw: unknown,
  defaults: Record<T, PortfolioElementTextStyle>,
  ids: readonly T[]
): Record<T, PortfolioElementTextStyle> {
  const next = {} as Record<T, PortfolioElementTextStyle>;
  for (const id of ids) {
    next[id] = { ...defaults[id] };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return next;
  const record = raw as Record<string, unknown>;
  for (const id of ids) {
    next[id] = normalizeElementTextStyle(record[id], defaults[id]);
  }
  return next;
}

export function patchElementStylesRecord<T extends string>(
  styles: Record<T, PortfolioElementTextStyle>,
  target: T,
  patch: Partial<PortfolioElementTextStyle>,
  defaults: Record<T, PortfolioElementTextStyle>,
  ids: readonly T[]
): Record<T, PortfolioElementTextStyle> {
  return normalizeElementStylesRecord(
    { ...styles, [target]: { ...styles[target], ...patch } },
    defaults,
    ids
  );
}

export function elementTextSizeClass(
  size: PortfolioElementTextSize,
  role: 'title' | 'body' | 'label' = 'body'
): string {
  if (role === 'title') {
    switch (size) {
      case 'sm':
        return 'text-xl sm:text-2xl';
      case 'lg':
        return 'text-3xl sm:text-4xl';
      case 'xl':
        return 'text-3xl font-bold sm:text-4xl lg:text-[2.6rem]';
      default:
        return 'text-2xl sm:text-3xl';
    }
  }
  if (role === 'label') {
    switch (size) {
      case 'sm':
        return 'text-[11px]';
      case 'lg':
        return 'text-sm';
      case 'xl':
        return 'text-base';
      default:
        return 'text-xs';
    }
  }
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'lg':
      return 'text-lg';
    case 'xl':
      return 'text-xl';
    default:
      return 'text-base';
  }
}

export function elementTextStyleClass(
  style: PortfolioElementTextStyle,
  role: 'title' | 'body' | 'label' = 'body'
): string {
  const parts = [elementTextSizeClass(style.size, role)];
  if (style.font === 'serif') parts.push('font-serif');
  if (style.italic) parts.push('italic');
  if (style.bold) {
    parts.push(role === 'title' ? 'font-bold' : 'font-semibold');
  } else {
    parts.push('font-normal');
  }
  if (style.uppercase) {
    parts.push(role === 'label' ? 'uppercase tracking-[0.16em]' : 'uppercase tracking-[0.08em]');
  }
  return parts.join(' ');
}

export function elementTextInlineStyle(style: PortfolioElementTextStyle): CSSProperties {
  const base: CSSProperties = {
    color: sanitizeHex(style.color, DEFAULT_ELEMENT_BODY_COLOR),
  };
  if (style.font === 'serif') {
    base.fontFamily = "'Playfair Display', Georgia, serif";
  } else if (style.font === 'display') {
    base.fontFamily = "'Playfair Display', Georgia, serif";
    base.letterSpacing = '-0.02em';
  }
  return base;
}

export const PORTFOLIO_ELEMENT_TEXT_SIZE_OPTIONS: {
  value: PortfolioElementTextSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact body text.' },
  { value: 'md', label: 'Medium', description: 'Default readable size.' },
  { value: 'lg', label: 'Large', description: 'More prominent.' },
  { value: 'xl', label: 'Extra large', description: 'Hero-level emphasis.' },
];

export const PORTFOLIO_ELEMENT_FONT_OPTIONS: {
  value: PortfolioElementFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Sans', description: 'Clean modern sans-serif.' },
  { value: 'serif', label: 'Serif', description: 'Editorial serif.' },
  { value: 'display', label: 'Display', description: 'Strong display weight.' },
];

export type PortfolioToolsIconSize = 'sm' | 'md' | 'lg' | 'xl';

export function toolsIconPixelSize(size: PortfolioToolsIconSize): number {
  switch (size) {
    case 'sm':
      return 20;
    case 'lg':
      return 32;
    case 'xl':
      return 40;
    default:
      return 26;
  }
}

export function toolsIconShellClass(size: PortfolioToolsIconSize): string {
  switch (size) {
    case 'sm':
      return 'h-9 w-9';
    case 'lg':
      return 'h-12 w-12';
    case 'xl':
      return 'h-16 w-16';
    default:
      return 'h-11 w-11 sm:h-14 sm:w-14';
  }
}

export const PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS: {
  value: PortfolioToolsIconSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact logos.' },
  { value: 'md', label: 'Medium', description: 'Default size.' },
  { value: 'lg', label: 'Large', description: 'More visible logos.' },
  { value: 'xl', label: 'Extra large', description: 'Hero-sized tool icons.' },
];
