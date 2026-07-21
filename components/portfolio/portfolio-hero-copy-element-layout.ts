/**
 * Per-element vertical layout for hero copy units:
 * - margins (top / bottom px)
 * - stats side (stay in copy stack, or sit above / below the stats chips)
 */

import type { CSSProperties } from 'react';

export type HeroCopyElementId =
  | 'availability'
  | 'headline'
  | 'description'
  | 'tools'
  | 'cta';

/**
 * Where a copy element renders in a vertical division:
 * - in-copy: normal text column
 * - above-stats / below-stats: glued to the stats chips (same cell)
 * - free-zone: moved into the *other* frame (visual part), anchored by the
 *   3×3 "free zone" cell — lets copy elements fill empty visual space.
 */
export type HeroCopyStatsSide = 'in-copy' | 'above-stats' | 'below-stats' | 'free-zone';

export type HeroCopyElementLayout = {
  statsSide: HeroCopyStatsSide;
  marginTopPx: number;
  marginBottomPx: number;
  backgroundEnabled: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundPaddingPx: number;
  backgroundRadiusPx: number;
};

export type HeroCopyElementsLayout = Record<HeroCopyElementId, HeroCopyElementLayout>;

export const HERO_COPY_ELEMENT_MARGIN_PX_MIN = 0;
export const HERO_COPY_ELEMENT_MARGIN_PX_MAX = 96;
export const HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MIN = 0;
export const HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MAX = 100;
export const HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MIN = 0;
export const HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MAX = 64;
export const HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MIN = 0;
export const HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MAX = 64;

export const PORTFOLIO_HERO_COPY_STATS_SIDE_OPTIONS: {
  value: HeroCopyStatsSide;
  label: string;
  description: string;
}[] = [
  {
    value: 'in-copy',
    label: 'In copy stack',
    description: 'Normal position in the text / tools column.',
  },
  {
    value: 'above-stats',
    label: 'Above stats',
    description: 'Directly above the stats chips (same cell).',
  },
  {
    value: 'below-stats',
    label: 'Below stats',
    description: 'Directly under the stats chips (same cell).',
  },
  {
    value: 'free-zone',
    label: 'Free zone (other part)',
    description: 'Moves into the empty area of the visual part — position it with the "Free zone position" 3×3 picker (Section › General).',
  },
];

const DEFAULT_LAYOUT: HeroCopyElementLayout = {
  statsSide: 'in-copy',
  marginTopPx: 0,
  marginBottomPx: 0,
  backgroundEnabled: false,
  backgroundColor: '#ffffff',
  backgroundOpacity: 100,
  backgroundPaddingPx: 12,
  backgroundRadiusPx: 12,
};

export const DEFAULT_HERO_COPY_ELEMENTS_LAYOUT: HeroCopyElementsLayout = {
  availability: { ...DEFAULT_LAYOUT },
  headline: { ...DEFAULT_LAYOUT },
  description: { ...DEFAULT_LAYOUT },
  tools: { ...DEFAULT_LAYOUT },
  cta: { ...DEFAULT_LAYOUT },
};

export function sanitizeHeroCopyElementMarginPx(
  value: unknown,
  fallback: number = 0
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    HERO_COPY_ELEMENT_MARGIN_PX_MAX,
    Math.max(HERO_COPY_ELEMENT_MARGIN_PX_MIN, Math.round(n))
  );
}

export function sanitizeHeroCopyStatsSide(
  value: unknown,
  fallback: HeroCopyStatsSide = 'in-copy'
): HeroCopyStatsSide {
  if (
    value === 'in-copy' ||
    value === 'above-stats' ||
    value === 'below-stats' ||
    value === 'free-zone'
  ) {
    return value;
  }
  return fallback;
}

function sanitizeElementLayout(
  value: unknown,
  fallback: HeroCopyElementLayout
): HeroCopyElementLayout {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    statsSide: sanitizeHeroCopyStatsSide(record.statsSide, fallback.statsSide),
    marginTopPx: sanitizeHeroCopyElementMarginPx(record.marginTopPx, fallback.marginTopPx),
    marginBottomPx: sanitizeHeroCopyElementMarginPx(
      record.marginBottomPx,
      fallback.marginBottomPx
    ),
    backgroundEnabled:
      typeof record.backgroundEnabled === 'boolean'
        ? record.backgroundEnabled
        : fallback.backgroundEnabled,
    backgroundColor:
      typeof record.backgroundColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(record.backgroundColor)
        ? record.backgroundColor
        : fallback.backgroundColor,
    backgroundOpacity: sanitizeRange(
      record.backgroundOpacity,
      HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MIN,
      HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MAX,
      fallback.backgroundOpacity
    ),
    backgroundPaddingPx: sanitizeRange(
      record.backgroundPaddingPx,
      HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MIN,
      HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MAX,
      fallback.backgroundPaddingPx
    ),
    backgroundRadiusPx: sanitizeRange(
      record.backgroundRadiusPx,
      HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MIN,
      HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MAX,
      fallback.backgroundRadiusPx
    ),
  };
}

function sanitizeRange(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function sanitizeHeroCopyElementsLayout(
  value: unknown,
  fallback: HeroCopyElementsLayout = DEFAULT_HERO_COPY_ELEMENTS_LAYOUT
): HeroCopyElementsLayout {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    availability: sanitizeElementLayout(record.availability, fallback.availability),
    headline: sanitizeElementLayout(record.headline, fallback.headline),
    description: sanitizeElementLayout(record.description, fallback.description),
    tools: sanitizeElementLayout(record.tools, fallback.tools),
    cta: sanitizeElementLayout(record.cta, fallback.cta),
  };
}

export function resolveHeroCopyElementsLayout(presentation: {
  heroCopyElementsLayout?: HeroCopyElementsLayout;
  availabilityMarginTopPx?: number;
  availabilityMarginBottomPx?: number;
  ctaPlacement?: string;
}): HeroCopyElementsLayout {
  const base = sanitizeHeroCopyElementsLayout(presentation.heroCopyElementsLayout);

  const availability: HeroCopyElementLayout = {
    ...base.availability,
    marginTopPx: sanitizeHeroCopyElementMarginPx(
      presentation.heroCopyElementsLayout?.availability?.marginTopPx ??
        presentation.availabilityMarginTopPx,
      base.availability.marginTopPx
    ),
    marginBottomPx: sanitizeHeroCopyElementMarginPx(
      presentation.heroCopyElementsLayout?.availability?.marginBottomPx ??
        presentation.availabilityMarginBottomPx,
      base.availability.marginBottomPx
    ),
  };

  let cta = base.cta;
  if (presentation.ctaPlacement === 'above-stats') {
    cta = { ...cta, statsSide: 'above-stats' };
  } else if (presentation.ctaPlacement === 'below-stats') {
    cta = { ...cta, statsSide: 'below-stats' };
  } else if (presentation.ctaPlacement === 'free-zone') {
    cta = { ...cta, statsSide: 'free-zone' };
  } else if (
    presentation.ctaPlacement === 'below-tools' ||
    presentation.ctaPlacement === 'below-pitch' ||
    presentation.ctaPlacement === 'after-headline' ||
    presentation.ctaPlacement === 'with-tools'
  ) {
    cta = { ...cta, statsSide: 'in-copy' };
  }

  return {
    ...base,
    availability,
    cta,
  };
}

export function heroCopyElementMarginStyle(layout: HeroCopyElementLayout): CSSProperties {
  const style: CSSProperties = {};
  if (layout.marginTopPx > 0) style.marginTop = layout.marginTopPx;
  if (layout.marginBottomPx > 0) style.marginBottom = layout.marginBottomPx;
  return style;
}

/** Background surface owned by one copy element; opacity never fades its content. */
export function heroCopyElementSurfaceStyle(layout: HeroCopyElementLayout): CSSProperties {
  const style = heroCopyElementMarginStyle(layout);
  if (!layout.backgroundEnabled) return style;

  const hex = layout.backgroundColor.slice(1);
  const alpha = Math.round((layout.backgroundOpacity / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  return {
    ...style,
    backgroundColor: `#${hex}${alpha}`,
    padding: layout.backgroundPaddingPx,
    borderRadius: layout.backgroundRadiusPx,
  };
}

export function patchHeroCopyElementLayout(
  current: HeroCopyElementsLayout | undefined,
  id: HeroCopyElementId,
  patch: Partial<HeroCopyElementLayout>
): HeroCopyElementsLayout {
  const base = sanitizeHeroCopyElementsLayout(current);
  return {
    ...base,
    [id]: sanitizeElementLayout({ ...base[id], ...patch }, base[id]),
  };
}
