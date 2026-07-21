import {
  clampMotifPanelPosition,
  clampMotifPanelSize,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import type { PortfolioHeroSectionSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  flipHeroLayoutPresentation,
  mirrorMotifPanelPosition,
} from '@/components/portfolio/portfolio-hero-layout-flip';
import { DEFAULT_HERO_COPY_POSITION } from '@/components/portfolio/portfolio-hero-copy-settings';
import type {
  HeroMotifInstance,
  HeroMotifKind,
} from '@/components/portfolio/portfolio-hero-motifs-settings';
import {
  getRightMotifPresetPoints,
  mirrorMotifPointsHorizontally,
  ensureRightColumnMotifPoints,
  ensureLeftColumnMotifPoints,
  type RightMotifPresetShape,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import { heroVerticalCellFromPosition } from '@/components/portfolio/portfolio-hero-vertical-cell-placement';

/**
 * Screen division for the two hero groups:
 * - Copy group (gauche): headline, description, tools, CTA, availability
 * - Visual group (droite): portrait, motif, stats
 *
 * Matches the four layouts: L|R, R|L, top/bottom, bottom/top.
 */
export type HeroLayoutDivision =
  | 'horizontal-copy-left'
  | 'horizontal-copy-right'
  | 'vertical-copy-top'
  | 'vertical-copy-bottom';

export const DEFAULT_HERO_LAYOUT_DIVISION: HeroLayoutDivision = 'horizontal-copy-left';

/** Pixel gap between copy and visual frames in vertical screen division. */
export const DEFAULT_HERO_VERTICAL_FRAME_GAP_PX = 16;
export const HERO_VERTICAL_FRAME_GAP_PX_MIN = 0;
export const HERO_VERTICAL_FRAME_GAP_PX_MAX = 120;

export function sanitizeHeroVerticalFrameGapPx(
  value: unknown,
  fallback: number = DEFAULT_HERO_VERTICAL_FRAME_GAP_PX
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    HERO_VERTICAL_FRAME_GAP_PX_MAX,
    Math.max(HERO_VERTICAL_FRAME_GAP_PX_MIN, Math.round(n))
  );
}

export function resolveHeroVerticalFrameGapPx(presentation: {
  heroVerticalFrameGapPx?: number;
}): number {
  return sanitizeHeroVerticalFrameGapPx(
    presentation.heroVerticalFrameGapPx,
    DEFAULT_HERO_VERTICAL_FRAME_GAP_PX
  );
}

export const PORTFOLIO_HERO_LAYOUT_DIVISION_OPTIONS: {
  value: HeroLayoutDivision;
  label: string;
  description: string;
}[] = [
  {
    value: 'horizontal-copy-left',
    label: 'Copy | Visual',
    description: 'Text on the left, portrait & stats on the right.',
  },
  {
    value: 'horizontal-copy-right',
    label: 'Visual | Copy',
    description: 'Portrait & stats on the left, text on the right.',
  },
  {
    value: 'vertical-copy-top',
    label: 'Copy / Visual',
    description: 'Text on top, portrait & stats below.',
  },
  {
    value: 'vertical-copy-bottom',
    label: 'Visual / Copy',
    description: 'Portrait & stats on top, text below.',
  },
];

export function isHorizontalHeroDivision(division: HeroLayoutDivision): boolean {
  return (
    division === 'horizontal-copy-left' || division === 'horizontal-copy-right'
  );
}

export function isVerticalHeroDivision(division: HeroLayoutDivision): boolean {
  return !isHorizontalHeroDivision(division);
}

/** True when copy sits on the end side (right in LTR, or bottom in vertical). */
export function isHeroCopyOnEnd(division: HeroLayoutDivision): boolean {
  return (
    division === 'horizontal-copy-right' || division === 'vertical-copy-bottom'
  );
}

/** Legacy boolean flip ↔ horizontal division. */
export function heroLayoutFlippedFromDivision(division: HeroLayoutDivision): boolean {
  return division === 'horizontal-copy-right';
}

export function heroLayoutDivisionFromFlipped(flipped: boolean): HeroLayoutDivision {
  return flipped ? 'horizontal-copy-right' : 'horizontal-copy-left';
}

export function resolveHeroLayoutDivision(
  presentation: Pick<PortfolioHeroSectionSettings, 'heroLayoutDivision' | 'heroLayoutFlipped'>
): HeroLayoutDivision {
  if (
    presentation.heroLayoutDivision === 'horizontal-copy-left' ||
    presentation.heroLayoutDivision === 'horizontal-copy-right' ||
    presentation.heroLayoutDivision === 'vertical-copy-top' ||
    presentation.heroLayoutDivision === 'vertical-copy-bottom'
  ) {
    return presentation.heroLayoutDivision;
  }
  return heroLayoutDivisionFromFlipped(Boolean(presentation.heroLayoutFlipped));
}

export function sanitizeHeroLayoutDivision(
  value: unknown,
  fallback: HeroLayoutDivision = DEFAULT_HERO_LAYOUT_DIVISION
): HeroLayoutDivision {
  if (
    value === 'horizontal-copy-left' ||
    value === 'horizontal-copy-right' ||
    value === 'vertical-copy-top' ||
    value === 'vertical-copy-bottom'
  ) {
    return value;
  }
  return fallback;
}

function mirrorVerticalAxis(y: number): number {
  return 100 - y;
}

/**
 * Default motif box inside the content-width frame (after global side margins).
 * Vertical: span the frame from its start (no outer gutter waste).
 * Horizontal: hug the visual column (right or left).
 */
export function defaultHeroMotifTransformForDivision(
  division: HeroLayoutDivision,
  kind: HeroMotifKind
): { position: MotifPanelPosition; size: MotifPanelSize } {
  if (isVerticalHeroDivision(division)) {
    if (kind === 'geometric') {
      return { position: { x: 50, y: 52 }, size: { width: 100, height: 78 } };
    }
    return { position: { x: 50, y: 58 }, size: { width: 80, height: 50 } };
  }

  if (division === 'horizontal-copy-right') {
    if (kind === 'geometric') {
      return { position: { x: 25, y: 50 }, size: { width: 50, height: 76 } };
    }
    return { position: { x: 78, y: 78 }, size: { width: 48, height: 42 } };
  }

  if (kind === 'geometric') {
    return { position: { x: 75, y: 50 }, size: { width: 50, height: 76 } };
  }
  return { position: { x: 22, y: 78 }, size: { width: 48, height: 42 } };
}

const RIGHT_MOTIF_PRESET_SHAPES: RightMotifPresetShape[] = [
  'diagonal',
  'triangle',
  'trapezoid',
  'block',
  'chevron',
  'prism',
];

function isRightMotifPresetShape(shape: string): shape is RightMotifPresetShape {
  return (RIGHT_MOTIF_PRESET_SHAPES as string[]).includes(shape);
}

function motifPointsSkewLeft(points: { x: number; y: number }[]): boolean {
  if (points.length < 3) return false;
  const avgX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  return avgX < 48;
}

/**
 * Keep geometric clip paths oriented for the visual column.
 * Copy | Visual → right-edge slash (vertical on the frame’s right).
 * Visual | Copy → mirrored left-edge slash.
 */
function orientGeometricMotifForDivision(
  motif: HeroMotifInstance,
  division: HeroLayoutDivision,
  previousPositionX: number
): Pick<HeroMotifInstance, 'points' | 'shape'> {
  if (motif.kind !== 'geometric' || !isHorizontalHeroDivision(division)) {
    return {
      points: motif.points.map((point) => ({ ...point })),
      shape: motif.shape,
    };
  }

  const targetOnLeft = division === 'horizontal-copy-right';
  const wasOnLeft = previousPositionX < 50;

  if (motif.shape !== 'custom' && isRightMotifPresetShape(motif.shape)) {
    const preset = getRightMotifPresetPoints(motif.shape);
    if (targetOnLeft) {
      return {
        points: ensureLeftColumnMotifPoints(mirrorMotifPointsHorizontally(preset)),
        shape: 'custom',
      };
    }
    return {
      points: ensureRightColumnMotifPoints(preset),
      shape: motif.shape,
    };
  }

  const sideChanged = wasOnLeft !== targetOnLeft;
  let points = motif.points.map((point) => ({ ...point }));
  if (sideChanged) {
    points = mirrorMotifPointsHorizontally(points);
  }

  points = targetOnLeft
    ? ensureLeftColumnMotifPoints(points)
    : ensureRightColumnMotifPoints(points);

  // If still left-skewed on the right column, force one more mirror.
  if (!targetOnLeft && motifPointsSkewLeft(points)) {
    points = mirrorMotifPointsHorizontally(points);
  }

  return {
    points,
    shape: 'custom',
  };
}

/** Reset one motif to the division’s default frame placement + correct side orientation. */
export function resetHeroMotifToDivisionDefault(
  motif: HeroMotifInstance,
  division: HeroLayoutDivision
): HeroMotifInstance {
  const next = defaultHeroMotifTransformForDivision(division, motif.kind);
  const size = clampMotifPanelSize(
    next.size,
    motif.kind === 'geometric' ? 'right' : 'left'
  );

  if (motif.kind === 'geometric' && isHorizontalHeroDivision(division)) {
    const shape =
      motif.shape !== 'custom' && isRightMotifPresetShape(motif.shape)
        ? motif.shape
        : 'diagonal';
    const preset = getRightMotifPresetPoints(shape);
    const targetOnLeft = division === 'horizontal-copy-right';
    return {
      ...motif,
      position: next.position,
      size,
      shape: targetOnLeft ? 'custom' : shape,
      points: targetOnLeft
        ? ensureLeftColumnMotifPoints(mirrorMotifPointsHorizontally(preset))
        : ensureRightColumnMotifPoints(preset),
    };
  }

  const oriented = orientGeometricMotifForDivision(motif, division, motif.position.x);
  return {
    ...motif,
    position: next.position,
    size,
    ...oriented,
  };
}

/**
 * When entering vertical stack: hide left/right side motifs by default.
 * Keep position + size + shape so a round-trip back to horizontal restores them.
 * When leaving vertical: restore visibility only — never rewrite motif size or position.
 */
export function syncHeroMotifsToLayoutDivision(
  motifs: HeroMotifInstance[],
  division: HeroLayoutDivision,
  phase: 'enter-vertical' | 'leave-vertical' | 'apply-defaults'
): HeroMotifInstance[] {
  return motifs.map((motif) => {
    if (phase === 'enter-vertical') {
      // Hide only — size/position must survive vertical (even while invisible).
      return {
        ...motif,
        enabled: false,
        visibility: { mobile: false, desktop: false },
      };
    }

    if (phase === 'leave-vertical') {
      // Re-show with the same box the user had before vertical.
      const oriented = orientGeometricMotifForDivision(motif, division, motif.position.x);
      return {
        ...motif,
        enabled: true,
        visibility: { mobile: false, desktop: true },
        ...oriented,
      };
    }

    // apply-defaults: keep size; only refresh orientation for named presets.
    const oriented = orientGeometricMotifForDivision(motif, division, motif.position.x);
    return {
      ...motif,
      ...oriented,
    };
  });
}

/** Presets for each division — groups stay together; free placement can refine later. */
export function defaultPositionsForHeroDivision(division: HeroLayoutDivision): {
  heroCopyPosition: { x: number; y: number };
  portraitPosition: { x: number; y: number };
  metaPosition: { x: number; y: number };
  motifPosition: { x: number; y: number };
} {
  switch (division) {
    case 'horizontal-copy-right':
      return {
        heroCopyPosition: { x: 78, y: 42 },
        portraitPosition: { x: 22, y: 44 },
        metaPosition: { x: 22, y: 88 },
        motifPosition: { x: 25, y: 50 },
      };
    case 'vertical-copy-top':
      return {
        heroCopyPosition: { x: 50, y: 28 },
        portraitPosition: { x: 50, y: 72 },
        metaPosition: { x: 50, y: 92 },
        motifPosition: { x: 50, y: 52 },
      };
    case 'vertical-copy-bottom':
      return {
        heroCopyPosition: { x: 50, y: 72 },
        portraitPosition: { x: 50, y: 28 },
        metaPosition: { x: 50, y: 48 },
        motifPosition: { x: 50, y: 52 },
      };
    default:
      return {
        heroCopyPosition: { ...DEFAULT_HERO_COPY_POSITION },
        portraitPosition: { x: 80, y: 44 },
        metaPosition: { x: 75, y: 88 },
        motifPosition: { x: 75, y: 50 },
      };
  }
}

/**
 * Apply a screen division mode: sync legacy flip flag, remount group positions,
 * and mirror shapes when swapping horizontal sides.
 */
export function applyHeroLayoutDivision(
  settings: PortfolioHeroSectionSettings,
  next: HeroLayoutDivision
): PortfolioHeroSectionSettings {
  const current = resolveHeroLayoutDivision(settings);
  if (current === next) {
    return {
      ...settings,
      heroLayoutDivision: next,
      heroLayoutFlipped: heroLayoutFlippedFromDivision(next),
    };
  }

  // Horizontal L ↔ R: reuse proven flip (mirrors placements + motif shapes).
  if (
    isHorizontalHeroDivision(current) &&
    isHorizontalHeroDivision(next) &&
    current !== next
  ) {
    const flipped = flipHeroLayoutPresentation(settings);
    return {
      ...flipped,
      heroLayoutDivision: next,
      heroLayoutFlipped: heroLayoutFlippedFromDivision(next),
    };
  }

  // Vertical top ↔ bottom: mirror Y for both groups; keep motifs hidden policy as-is.
  if (
    isVerticalHeroDivision(current) &&
    isVerticalHeroDivision(next) &&
    current !== next
  ) {
    const rightMotifSize = clampMotifPanelSize(settings.motifPanelSize, 'right');
    const leftMotifSize = clampMotifPanelSize(settings.leftMotifSize, 'left');
    const heroMotifs = (settings.heroMotifs ?? []).map((motif) => {
      const size = clampMotifPanelSize(
        motif.size,
        motif.kind === 'geometric' ? 'right' : 'left'
      );
      return {
        ...motif,
        position: clampMotifPanelPosition(
          { x: motif.position.x, y: mirrorVerticalAxis(motif.position.y) },
          motif.kind === 'geometric' ? 'right' : 'left',
          size
        ),
        size,
      };
    });

    return {
      ...settings,
      heroLayoutDivision: next,
      heroLayoutFlipped: false,
      leftMotifEnabled: false,
      portraitPosition: {
        x: settings.portraitPosition.x,
        y: mirrorVerticalAxis(settings.portraitPosition.y),
      },
      portraitPositionVertical: (() => {
        const nextPos = {
          x: (settings.portraitPositionVertical ?? settings.portraitPosition).x,
          y: mirrorVerticalAxis((settings.portraitPositionVertical ?? settings.portraitPosition).y),
        };
        return nextPos;
      })(),
      portraitVerticalCell: heroVerticalCellFromPosition({
        x: (settings.portraitPositionVertical ?? settings.portraitPosition).x,
        y: mirrorVerticalAxis((settings.portraitPositionVertical ?? settings.portraitPosition).y),
      }),
      metaPosition: {
        x: settings.metaPosition.x,
        y: mirrorVerticalAxis(settings.metaPosition.y),
      },
      metaPositionVertical: {
        x: (settings.metaPositionVertical ?? settings.metaPosition).x,
        y: mirrorVerticalAxis((settings.metaPositionVertical ?? settings.metaPosition).y),
      },
      metaVerticalCell: heroVerticalCellFromPosition({
        x: (settings.metaPositionVertical ?? settings.metaPosition).x,
        y: mirrorVerticalAxis((settings.metaPositionVertical ?? settings.metaPosition).y),
      }),
      heroCopyPosition: {
        x: settings.heroCopyPosition.x,
        y: mirrorVerticalAxis(settings.heroCopyPosition.y),
      },
      motifPosition: mirrorMotifPanelPosition(
        {
          x: settings.motifPosition.x,
          y: mirrorVerticalAxis(settings.motifPosition.y),
        },
        'right',
        rightMotifSize
      ),
      leftMotifPosition: mirrorMotifPanelPosition(
        {
          x: settings.leftMotifPosition.x,
          y: mirrorVerticalAxis(settings.leftMotifPosition.y),
        },
        'left',
        leftMotifSize
      ),
      heroMotifs,
    };
  }

  // Crossing axis (horizontal ↔ vertical): apply division presets for both groups.
  // Do NOT flip presentation first — that mirrored motif points and left them inverted
  // after returning to Copy | Visual.
  const presets = defaultPositionsForHeroDivision(next);

  const enteringVertical =
    isHorizontalHeroDivision(current) && isVerticalHeroDivision(next);
  const leavingVertical =
    isVerticalHeroDivision(current) && isHorizontalHeroDivision(next);

  const heroMotifs = syncHeroMotifsToLayoutDivision(
    settings.heroMotifs ?? [],
    next,
    enteringVertical ? 'enter-vertical' : leavingVertical ? 'leave-vertical' : 'apply-defaults'
  );

  const hadPatternMotif = (settings.heroMotifs ?? []).some((motif) => motif.kind === 'pattern');

  // Motif size/position are preserved across horizontal ↔ vertical. Vertical only
  // hides them by default — returning to horizontal must not redimension them.
  return {
    ...settings,
    heroLayoutDivision: next,
    heroLayoutFlipped: heroLayoutFlippedFromDivision(next),
    heroCopyPosition: presets.heroCopyPosition,
    // Keep portrait/stats free-placement coords — horizontal and vertical stores are separate.
    leftMotifEnabled: enteringVertical
      ? false
      : leavingVertical
        ? hadPatternMotif
        : settings.leftMotifEnabled,
    heroMotifs,
  };
}
