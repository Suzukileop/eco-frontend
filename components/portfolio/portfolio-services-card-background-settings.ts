import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

export type PortfolioServicesCardBackgroundFill = 'solid' | 'split';

export type PortfolioServicesCardSplitAxis = 'x' | 'y';

export type PortfolioServicesCardDividerShape = 'straight' | 'diagonal' | 'curve' | 'wave';

export type PortfolioServicesCardBackgroundSettings = {
  cardBackgroundFill: PortfolioServicesCardBackgroundFill;
  cardBackgroundColorA: string;
  cardBackgroundColorB: string;
  cardBackgroundSplitAxis: PortfolioServicesCardSplitAxis;
  cardBackgroundSplitPosition: number;
  cardDividerEnabled: boolean;
  cardDividerShape: PortfolioServicesCardDividerShape;
  cardDividerAngle: number;
  cardDividerCurveDepth: number;
  cardDividerColor: string;
  cardDividerThickness: number;
  cardDividerOpacity: number;
};

export const DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_A = '#ffffff';
export const DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B = '#f5f5f5';
export const DEFAULT_SERVICES_CARD_DIVIDER_COLOR = '#d4d4d4';

/** Default card fill is solid — the old white/gray diagonal is opt-in via “Divisé”. */
export const DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS: PortfolioServicesCardBackgroundSettings = {
  cardBackgroundFill: 'solid',
  cardBackgroundColorA: DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_A,
  cardBackgroundColorB: DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B,
  cardBackgroundSplitAxis: 'y',
  cardBackgroundSplitPosition: 50,
  cardDividerEnabled: false,
  cardDividerShape: 'straight',
  cardDividerAngle: 135,
  cardDividerCurveDepth: 14,
  cardDividerColor: DEFAULT_SERVICES_CARD_DIVIDER_COLOR,
  cardDividerThickness: 2,
  cardDividerOpacity: 85,
};

/** Solid white card fill — used by FAQ / contact / about so they don’t inherit a split. */
export const DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS: PortfolioServicesCardBackgroundSettings = {
  ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
};

/** Previous factory default used solid white / gray zone colors without an explicit fill mode. */
function hexEq(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function isLegacyDefaultServicesCardBackground(
  p: PortfolioServicesCardBackgroundSettings
): boolean {
  return (
    p.cardBackgroundFill === 'solid' &&
    hexEq(p.cardBackgroundColorA, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_A) &&
    hexEq(p.cardBackgroundColorB, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B)
  );
}

/** Factory diagonal white / gray split that users keep seeing as an unwanted default. */
export function isFactoryDiagonalServicesCardBackground(
  p: PortfolioServicesCardBackgroundSettings
): boolean {
  return (
    p.cardBackgroundFill === 'split' &&
    p.cardDividerShape === 'diagonal' &&
    hexEq(p.cardBackgroundColorA, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_A) &&
    hexEq(p.cardBackgroundColorB, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B)
  );
}

/** Earlier diagonal default (165° / 52%) — same unwanted factory look. */
export function isLegacyServicesDiagonalBackground(
  p: PortfolioServicesCardBackgroundSettings
): boolean {
  return (
    p.cardBackgroundFill === 'split' &&
    p.cardDividerShape === 'diagonal' &&
    hexEq(p.cardBackgroundColorA, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_A) &&
    hexEq(p.cardBackgroundColorB, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B) &&
    (p.cardDividerAngle === 165 || p.cardBackgroundSplitPosition === 52)
  );
}

export const PORTFOLIO_SERVICES_CARD_BACKGROUND_FILL_OPTIONS: {
  value: PortfolioServicesCardBackgroundFill;
  label: string;
  description: string;
}[] = [
  { value: 'solid', label: 'Uni', description: 'Une seule couleur de fond sur toute la carte.' },
  {
    value: 'split',
    label: 'Divisé X / Y',
    description: 'Deux zones de couleur séparées par une ligne géométrique.',
  },
];

export const PORTFOLIO_SERVICES_CARD_SPLIT_AXIS_OPTIONS: {
  value: PortfolioServicesCardSplitAxis;
  label: string;
  description: string;
}[] = [
  { value: 'y', label: 'Axe Y (horizontal)', description: 'Zone haut / zone bas — idéal titre + prix.' },
  { value: 'x', label: 'Axe X (vertical)', description: 'Zone gauche / zone droite.' },
];

export const PORTFOLIO_SERVICES_CARD_DIVIDER_SHAPE_OPTIONS: {
  value: PortfolioServicesCardDividerShape;
  label: string;
  description: string;
}[] = [
  { value: 'straight', label: 'Droite', description: 'Ligne droite horizontale ou verticale.' },
  { value: 'diagonal', label: 'Diagonale', description: 'Séparation inclinée — angle réglable.' },
  { value: 'curve', label: 'Courbe', description: 'Arc doux entre les deux zones.' },
  { value: 'wave', label: 'Vague', description: 'Ligne ondulée pour un rendu organique.' },
];

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function clampPercent(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function clampDividerThickness(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(8, Math.max(1, Math.round(n)));
}

function clampAngle(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  const normalized = Math.round(n) % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function clampCurveDepth(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(40, Math.max(0, Math.round(n)));
}

export function shouldRenderCardSplitBackground(
  settings: Pick<PortfolioServicesCardBackgroundSettings, 'cardBackgroundFill'>
): boolean {
  return settings.cardBackgroundFill === 'split';
}

type ZonePaths = {
  pathA: string;
  pathB: string;
  dividerPath: string;
};

function buildZonePaths(settings: PortfolioServicesCardBackgroundSettings): ZonePaths | null {
  const pos = clampPercent(settings.cardBackgroundSplitPosition, 58);
  const depth = clampCurveDepth(settings.cardDividerCurveDepth, 14);
  const axis = settings.cardBackgroundSplitAxis;
  const shape = settings.cardDividerShape;

  if (shape === 'diagonal') {
    return null;
  }

  if (axis === 'y') {
    switch (shape) {
      case 'curve': {
        const dividerPath = `M 0 ${pos} Q 50 ${pos + depth} 100 ${pos}`;
        return {
          pathA: `M 0 0 H 100 V ${pos} Q 50 ${pos + depth} 0 ${pos} Z`,
          pathB: `M 0 ${pos} Q 50 ${pos + depth} 100 ${pos} V 100 H 0 Z`,
          dividerPath,
        };
      }
      case 'wave': {
        const dividerPath = `M 0 ${pos} C 22 ${pos - depth} 28 ${pos + depth} 50 ${pos} S 78 ${pos - depth} 100 ${pos}`;
        return {
          pathA: `M 0 0 H 100 V ${pos} C 78 ${pos + depth} 72 ${pos - depth} 50 ${pos} C 28 ${pos + depth} 22 ${pos - depth} 0 ${pos} Z`,
          pathB: `M 0 ${pos} C 22 ${pos - depth} 28 ${pos + depth} 50 ${pos} S 78 ${pos - depth} 100 ${pos} V 100 H 0 Z`,
          dividerPath,
        };
      }
      default: {
        const dividerPath = `M 0 ${pos} H 100`;
        return {
          pathA: `M 0 0 H 100 V ${pos} H 0 Z`,
          pathB: `M 0 ${pos} H 100 V 100 H 0 Z`,
          dividerPath,
        };
      }
    }
  }

  switch (shape) {
    case 'curve': {
      const dividerPath = `M ${pos} 0 Q ${pos + depth} 50 ${pos} 100`;
      return {
        pathA: `M 0 0 H ${pos} Q ${pos + depth} 50 ${pos} 100 V 100 H 0 Z`,
        pathB: `M ${pos} 0 H 100 V 100 H ${pos} Q ${pos + depth} 50 ${pos} 0 Z`,
        dividerPath,
      };
    }
    case 'wave': {
      const dividerPath = `M ${pos} 0 C ${pos - depth} 22 ${pos + depth} 28 ${pos} 50 S ${pos - depth} 78 ${pos} 100`;
      return {
        pathA: `M 0 0 H ${pos} C ${pos - depth} 22 ${pos + depth} 28 ${pos} 50 S ${pos - depth} 78 ${pos} 100 V 100 H 0 Z`,
        pathB: `M ${pos} 0 H 100 V 100 H ${pos} C ${pos + depth} 78 ${pos - depth} 72 ${pos} 50 S ${pos + depth} 28 ${pos} 0 Z`,
        dividerPath,
      };
    }
    default: {
      const dividerPath = `M ${pos} 0 V 100`;
      return {
        pathA: `M 0 0 H ${pos} V 100 H 0 Z`,
        pathB: `M ${pos} 0 H 100 V 100 H ${pos} Z`,
        dividerPath,
      };
    }
  }
}

export function buildCardSplitBackgroundSvg(settings: PortfolioServicesCardBackgroundSettings): string | null {
  const colorA = sanitizeHex(settings.cardBackgroundColorA, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_A);
  const colorB = sanitizeHex(settings.cardBackgroundColorB, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B);
  const paths = buildZonePaths(settings);

  if (!paths) {
    return null;
  }

  const dividerColor = sanitizeHex(settings.cardDividerColor, DEFAULT_SERVICES_CARD_DIVIDER_COLOR);
  const thickness = clampDividerThickness(settings.cardDividerThickness, 2);
  const opacity = clampPercent(settings.cardDividerOpacity, 85) / 100;
  const dividerStroke = settings.cardDividerEnabled
    ? `<path d="${paths.dividerPath}" fill="none" stroke="${dividerColor}" stroke-width="${thickness}" stroke-opacity="${opacity}" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${paths.pathA}" fill="${colorA}"/><path d="${paths.pathB}" fill="${colorB}"/>${dividerStroke}</svg>`;
}

export function servicesCardSplitBackgroundLayerStyle(
  settings: PortfolioServicesCardBackgroundSettings
): CSSProperties | undefined {
  if (!shouldRenderCardSplitBackground(settings)) {
    return undefined;
  }

  const colorA = sanitizeHex(settings.cardBackgroundColorA, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_A);
  const colorB = sanitizeHex(settings.cardBackgroundColorB, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B);

  if (settings.cardDividerShape === 'diagonal') {
    // Corner-to-corner split (bottom-left ↔ top-right) so both extremities meet on any aspect ratio.
    // colorA = top-left (white), colorB = bottom-right (gray).
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="0,0 100,0 0,100" fill="${colorA}"/><polygon points="100,0 100,100 0,100" fill="${colorB}"/></svg>`;
    return {
      backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
    };
  }

  const svg = buildCardSplitBackgroundSvg(settings);
  if (!svg) {
    return undefined;
  }

  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  };
}

export function mergeServicesCardBackgroundSettings(
  base: PortfolioServicesCardBackgroundSettings,
  patch: unknown
): PortfolioServicesCardBackgroundSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const fill = record.cardBackgroundFill;
  const axis = record.cardBackgroundSplitAxis;
  const shape = record.cardDividerShape;

  return {
    cardBackgroundFill:
      fill === 'solid' || fill === 'split' ? fill : base.cardBackgroundFill,
    cardBackgroundColorA: sanitizeHex(record.cardBackgroundColorA, base.cardBackgroundColorA),
    cardBackgroundColorB: sanitizeHex(record.cardBackgroundColorB, base.cardBackgroundColorB),
    cardBackgroundSplitAxis: axis === 'x' || axis === 'y' ? axis : base.cardBackgroundSplitAxis,
    cardBackgroundSplitPosition: clampPercent(record.cardBackgroundSplitPosition, base.cardBackgroundSplitPosition),
    cardDividerEnabled:
      typeof record.cardDividerEnabled === 'boolean' ? record.cardDividerEnabled : base.cardDividerEnabled,
    cardDividerShape:
      shape === 'straight' || shape === 'diagonal' || shape === 'curve' || shape === 'wave'
        ? shape
        : base.cardDividerShape,
    cardDividerAngle: clampAngle(record.cardDividerAngle, base.cardDividerAngle),
    cardDividerCurveDepth: clampCurveDepth(record.cardDividerCurveDepth, base.cardDividerCurveDepth),
    cardDividerColor: sanitizeHex(record.cardDividerColor, base.cardDividerColor),
    cardDividerThickness: clampDividerThickness(record.cardDividerThickness, base.cardDividerThickness),
    cardDividerOpacity: clampPercent(record.cardDividerOpacity, base.cardDividerOpacity),
  };
}

/** Migrate factory diagonal white/gray split → solid fill (users expect a flat card). */
export function withMigratedServicesCardBackground(
  settings: PortfolioServicesCardBackgroundSettings
): PortfolioServicesCardBackgroundSettings {
  if (
    isFactoryDiagonalServicesCardBackground(settings) ||
    isLegacyServicesDiagonalBackground(settings)
  ) {
    return { ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS };
  }
  return settings;
}
