import type { CSSProperties } from 'react';
import {
  DEFAULT_CUSTOM_MOTIF_POINTS,
  DEFAULT_LEFT_CUSTOM_MOTIF_POINTS,
  ensureLeftColumnMotifPoints,
  ensureRightColumnMotifPoints,
  getRightMotifPresetPoints,
  motifPointsToClipPath,
  sanitizeMotifPoints,
  type MotifPoint,
  type RightMotifPresetShape,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  clampMotifPanelPosition,
  clampMotifPanelSize,
  motifPanelContainerStyle,
  normalizeMotifPositionForContentFrame,
  sanitizeMotifPanelPosition,
  sanitizeMotifPanelSize,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import {
  DEFAULT_HERO_LEFT_MOTIF_SETTINGS,
  leftMotifInnerStyle,
  type PortfolioHeroLeftMotifPattern,
  type PortfolioHeroLeftMotifSettings,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  heroMotifPanelFillStyle,
  type PortfolioHeroBackgroundSettings,
} from '@/components/portfolio/portfolio-hero-background-settings';

/** Mirrors PortfolioHeroMotifShape without importing hero-settings (avoids cycles). */
export type HeroMotifShape =
  | 'diagonal'
  | 'triangle'
  | 'trapezoid'
  | 'block'
  | 'chevron'
  | 'prism'
  | 'custom';

export type HeroMotifKind = 'geometric' | 'pattern';

/** Breakpoint split matches hero layout: stacked below xl, dual-column at xl+. */
export type HeroMotifVisibility = {
  /** Mobile + tablet (below xl). */
  mobile: boolean;
  /** Desktop (xl and up). */
  desktop: boolean;
};

export type HeroMotifInstance = {
  id: string;
  label: string;
  enabled: boolean;
  kind: HeroMotifKind;
  visibility: HeroMotifVisibility;
  position: MotifPanelPosition;
  size: MotifPanelSize;
  color: string;
  opacity: number;
  zIndex: number;
  shape: HeroMotifShape;
  points: MotifPoint[];
  pattern: Exclude<PortfolioHeroLeftMotifPattern, 'none'>;
};

export const MAX_HERO_MOTIFS = 8;
export const DEFAULT_MOTIF_COLOR = '#E5E5E5';

export const DEFAULT_HERO_MOTIF_VISIBILITY: HeroMotifVisibility = {
  mobile: false,
  desktop: true,
};

export const DEFAULT_MOBILE_HERO_MOTIF_VISIBILITY: HeroMotifVisibility = {
  mobile: true,
  desktop: true,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function newMotifId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createGeometricMotif(
  partial?: Partial<HeroMotifInstance>
): HeroMotifInstance {
  return {
    id: partial?.id ?? newMotifId('geo'),
    label: partial?.label ?? 'Shape',
    enabled: partial?.enabled ?? true,
    kind: 'geometric',
    visibility: partial?.visibility ?? { ...DEFAULT_MOBILE_HERO_MOTIF_VISIBILITY },
    position: partial?.position ?? { x: 78, y: 48 },
    size: partial?.size ?? { width: 42, height: 56 },
    color: partial?.color ?? DEFAULT_MOTIF_COLOR,
    opacity: partial?.opacity ?? 100,
    zIndex: partial?.zIndex ?? 0,
    shape: partial?.shape ?? 'diagonal',
    points: (partial?.points ?? DEFAULT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
    pattern: partial?.pattern ?? 'dots',
  };
}

export function createPatternMotif(partial?: Partial<HeroMotifInstance>): HeroMotifInstance {
  return {
    id: partial?.id ?? newMotifId('pat'),
    label: partial?.label ?? 'Pattern',
    enabled: partial?.enabled ?? true,
    kind: 'pattern',
    visibility: partial?.visibility ?? { ...DEFAULT_MOBILE_HERO_MOTIF_VISIBILITY },
    position: partial?.position ?? { x: 22, y: 78 },
    size: partial?.size ?? { width: 48, height: 42 },
    color: partial?.color ?? DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifColor,
    opacity: partial?.opacity ?? 35,
    zIndex: partial?.zIndex ?? 0,
    shape: partial?.shape ?? 'block',
    points: (partial?.points ?? DEFAULT_LEFT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
    pattern: partial?.pattern ?? 'dots',
  };
}

export function motifVisibilityClass(visibility: HeroMotifVisibility): string {
  if (visibility.mobile && visibility.desktop) return 'block';
  if (visibility.mobile && !visibility.desktop) return 'block xl:hidden';
  if (!visibility.mobile && visibility.desktop) return 'hidden xl:block';
  return 'hidden';
}

export function sanitizeHeroMotifVisibility(
  value: unknown,
  base: HeroMotifVisibility = DEFAULT_HERO_MOTIF_VISIBILITY
): HeroMotifVisibility {
  if (!value || typeof value !== 'object') return { ...base };
  const record = value as Record<string, unknown>;
  return {
    mobile: typeof record.mobile === 'boolean' ? record.mobile : base.mobile,
    desktop: typeof record.desktop === 'boolean' ? record.desktop : base.desktop,
  };
}

function sanitizeHeroMotifKind(value: unknown, base: HeroMotifKind): HeroMotifKind {
  return value === 'geometric' || value === 'pattern' ? value : base;
}

function sanitizeHeroMotifShape(value: unknown, base: HeroMotifShape): HeroMotifShape {
  return value === 'diagonal' ||
    value === 'triangle' ||
    value === 'trapezoid' ||
    value === 'block' ||
    value === 'chevron' ||
    value === 'prism' ||
    value === 'custom'
    ? value
    : base;
}

function sanitizeHeroMotifPattern(
  value: unknown,
  base: Exclude<PortfolioHeroLeftMotifPattern, 'none'>
): Exclude<PortfolioHeroLeftMotifPattern, 'none'> {
  return value === 'dots' ||
    value === 'grid' ||
    value === 'diagonal' ||
    value === 'waves' ||
    value === 'crosshatch' ||
    value === 'circles' ||
    value === 'hexagons' ||
    value === 'custom'
    ? value
    : base;
}

export function sanitizeHeroMotifInstance(
  value: unknown,
  fallback?: HeroMotifInstance
): HeroMotifInstance | null {
  const base = fallback ?? createGeometricMotif();
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const kind = sanitizeHeroMotifKind(record.kind, base.kind);
  const size = sanitizeMotifPanelSize(record.size, base.size, kind === 'geometric' ? 'right' : 'left');
  const position = sanitizeMotifPanelPosition(
    record.position,
    base.position,
    kind === 'geometric' ? 'right' : 'left',
    size
  );
  const color =
    typeof record.color === 'string' && isValidProfileHexColor(record.color)
      ? record.color.trim()
      : base.color;
  const opacity =
    typeof record.opacity === 'number' ? clamp(record.opacity, 0, 100) : base.opacity;
  const zIndex = typeof record.zIndex === 'number' ? clamp(record.zIndex, 0, 40) : base.zIndex;
  const id = typeof record.id === 'string' && record.id.trim() ? record.id.trim() : base.id;
  const label = typeof record.label === 'string' && record.label.trim() ? record.label.trim() : base.label;

  const shape = sanitizeHeroMotifShape(record.shape, base.shape);
  const rawPoints = sanitizeMotifPoints(
    record.points !== undefined ? record.points : base.points,
    kind === 'pattern' ? DEFAULT_LEFT_CUSTOM_MOTIF_POINTS : DEFAULT_CUSTOM_MOTIF_POINTS
  );
  // Geometric motifs on the right must hug the right frame edge (classic slash).
  // Auto-fix inverted left-edge silhouettes left over from layout flips.
  const points =
    kind === 'geometric'
      ? position.x < 50
        ? ensureLeftColumnMotifPoints(rawPoints)
        : ensureRightColumnMotifPoints(rawPoints)
      : rawPoints;

  return {
    id,
    label,
    enabled: typeof record.enabled === 'boolean' ? record.enabled : base.enabled,
    kind,
    visibility: sanitizeHeroMotifVisibility(record.visibility, base.visibility),
    position,
    size,
    color,
    opacity,
    zIndex,
    shape,
    points,
    pattern: sanitizeHeroMotifPattern(record.pattern, base.pattern),
  };
}

export function sanitizeHeroMotifs(value: unknown, base: HeroMotifInstance[]): HeroMotifInstance[] {
  if (!Array.isArray(value)) return base.map((m) => ({ ...m, points: m.points.map((p) => ({ ...p })) }));
  const next: HeroMotifInstance[] = [];
  for (const item of value) {
    if (next.length >= MAX_HERO_MOTIFS) break;
    const sanitized = sanitizeHeroMotifInstance(item);
    if (sanitized) next.push(sanitized);
  }
  return next.length > 0
    ? next
    : base.map((m) => ({ ...m, points: m.points.map((p) => ({ ...p })) }));
}

/** Build motifs from legacy single right + left fields when `heroMotifs` is absent. */
export function migrateLegacyHeroMotifs(legacy: {
  motifShape: HeroMotifShape;
  motifColor: string;
  customMotifPoints: MotifPoint[];
  motifPosition: MotifPanelPosition;
  motifPanelSize: MotifPanelSize;
  heroMotifOpacity?: number;
  leftMotifEnabled: boolean;
  leftMotifPattern: PortfolioHeroLeftMotifPattern;
  leftMotifColor: string;
  leftMotifOpacity: number;
  leftMotifPosition: MotifPanelPosition;
  leftMotifSize: MotifPanelSize;
  leftCustomMotifPoints: MotifPoint[];
}): HeroMotifInstance[] {
  const motifs: HeroMotifInstance[] = [
    createGeometricMotif({
      id: 'legacy-right',
      label: 'Right shape',
      enabled: true,
      visibility: { ...DEFAULT_HERO_MOTIF_VISIBILITY },
      position: legacy.motifPosition,
      size: legacy.motifPanelSize,
      color: legacy.motifColor,
      opacity: typeof legacy.heroMotifOpacity === 'number' ? legacy.heroMotifOpacity : 100,
      shape: legacy.motifShape,
      points: legacy.customMotifPoints.map((p) => ({ ...p })),
      zIndex: 0,
    }),
  ];

  if (legacy.leftMotifEnabled && legacy.leftMotifPattern !== 'none') {
    motifs.push(
      createPatternMotif({
        id: 'legacy-left',
        label: 'Left pattern',
        enabled: true,
        visibility: { ...DEFAULT_HERO_MOTIF_VISIBILITY },
        position: legacy.leftMotifPosition,
        size: legacy.leftMotifSize,
        color: legacy.leftMotifColor,
        opacity: legacy.leftMotifOpacity,
        pattern: legacy.leftMotifPattern as Exclude<PortfolioHeroLeftMotifPattern, 'none'>,
        points: legacy.leftCustomMotifPoints.map((p) => ({ ...p })),
        zIndex: 0,
      })
    );
  }

  return motifs;
}

export function mergeHeroMotifsSettings(
  base: HeroMotifInstance[],
  patch: unknown,
  legacyFallback: Parameters<typeof migrateLegacyHeroMotifs>[0]
): HeroMotifInstance[] {
  if (!patch || typeof patch !== 'object') {
    return base.length > 0 ? base : migrateLegacyHeroMotifs(legacyFallback);
  }
  const record = patch as Record<string, unknown>;
  if (Array.isArray(record.heroMotifs)) {
    const sanitized = sanitizeHeroMotifs(record.heroMotifs, base);
    if (sanitized.length > 0) return sanitized;
  }
  if (base.length > 0) return base;
  return migrateLegacyHeroMotifs(legacyFallback);
}

/** Keep legacy scalar fields in sync so flip / older paths still work. */
export function syncLegacyFieldsFromHeroMotifs(motifs: HeroMotifInstance[]): {
  motifShape: HeroMotifShape;
  motifColor: string;
  customMotifPoints: MotifPoint[];
  motifPosition: MotifPanelPosition;
  motifPanelSize: MotifPanelSize;
  leftMotifEnabled: boolean;
  leftMotifPattern: PortfolioHeroLeftMotifPattern;
  leftMotifColor: string;
  leftMotifOpacity: number;
  leftMotifPosition: MotifPanelPosition;
  leftMotifSize: MotifPanelSize;
  leftCustomMotifPoints: MotifPoint[];
} {
  const geo =
    motifs.find((m) => m.kind === 'geometric' && m.enabled) ??
    motifs.find((m) => m.kind === 'geometric');
  const pat =
    motifs.find((m) => m.kind === 'pattern' && m.enabled) ??
    motifs.find((m) => m.kind === 'pattern');

  return {
    motifShape: geo?.shape ?? 'diagonal',
    motifColor: geo?.color ?? DEFAULT_MOTIF_COLOR,
    customMotifPoints: (geo?.points ?? DEFAULT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
    motifPosition: geo?.position ?? { x: 75, y: 50 },
    motifPanelSize: geo?.size ?? { width: 50, height: 76 },
    leftMotifEnabled: Boolean(pat?.enabled),
    leftMotifPattern: pat?.enabled ? pat.pattern : 'none',
    leftMotifColor: pat?.color ?? DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifColor,
    leftMotifOpacity: pat?.opacity ?? DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifOpacity,
    leftMotifPosition: pat?.position ?? { ...DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifPosition },
    leftMotifSize: pat?.size ?? { ...DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifSize },
    leftCustomMotifPoints: (pat?.points ?? DEFAULT_LEFT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
  };
}

export function updateHeroMotifInList(
  motifs: HeroMotifInstance[],
  id: string,
  patch: Partial<HeroMotifInstance>
): HeroMotifInstance[] {
  return motifs.map((motif) => {
    if (motif.id !== id) return motif;
    const kind = patch.kind ?? motif.kind;
    const size = patch.size
      ? clampMotifPanelSize(patch.size, kind === 'geometric' ? 'right' : 'left')
      : motif.size;
    const position = patch.position
      ? clampMotifPanelPosition(patch.position, kind === 'geometric' ? 'right' : 'left', size)
      : motif.position;
    return {
      ...motif,
      ...patch,
      kind,
      size,
      position,
      visibility: patch.visibility
        ? sanitizeHeroMotifVisibility(patch.visibility, motif.visibility)
        : motif.visibility,
      opacity:
        typeof patch.opacity === 'number' ? clamp(patch.opacity, 0, 100) : motif.opacity,
      points: patch.points ? patch.points.map((p) => ({ ...p })) : motif.points,
    };
  });
}

export function heroMotifShellStyle(
  motif: HeroMotifInstance,
  fadeOpacity = 1
): CSSProperties {
  const size = clampMotifPanelSize(
    motif.size,
    motif.kind === 'geometric' ? 'right' : 'left'
  );
  const position = clampMotifPanelPosition(
    motif.position,
    motif.kind === 'geometric' ? 'right' : 'left',
    size
  );
  const opacity = (clamp(motif.opacity, 0, 100) / 100) * fadeOpacity;

  // Free placement relative to the hero section (works on mobile + desktop).
  return {
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${size.width}%`,
    height: `${size.height}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: motif.zIndex,
    ...(opacity >= 1 ? {} : { opacity, willChange: 'opacity' as const }),
  };
}

export function heroMotifInnerStyle(
  motif: HeroMotifInstance,
  background?: PortfolioHeroBackgroundSettings,
  /** Copy/visual column edge — aligns repeating pattern tiles flush to Contact. */
  frameEdge: 'left' | 'right' = 'left'
): CSSProperties {
  if (motif.kind === 'pattern') {
    const asLeft: PortfolioHeroLeftMotifSettings = {
      leftMotifEnabled: true,
      leftMotifPattern: motif.pattern,
      leftMotifColor: motif.color,
      leftMotifOpacity: 100,
      leftMotifPosition: motif.position,
      leftMotifSize: motif.size,
      leftCustomMotifPoints: motif.points,
    };
    return leftMotifInnerStyle(asLeft, frameEdge);
  }

  const rawPoints =
    motif.shape === 'custom'
      ? motif.points
      : getRightMotifPresetPoints(motif.shape as RightMotifPresetShape);
  const points =
    motif.position.x < 50
      ? ensureLeftColumnMotifPoints(rawPoints)
      : ensureRightColumnMotifPoints(rawPoints);

  return {
    clipPath: motifPointsToClipPath(points),
    ...(background
      ? heroMotifPanelFillStyle(background, motif.color)
      : { backgroundColor: motif.color }),
  };
}

/** Prefer free % placement; keep content-frame helper available for overlays. */
export function heroMotifContentFrameStyle(
  motif: HeroMotifInstance,
  fadeOpacity = 1,
  edge: 'left' | 'right' = 'right'
): CSSProperties {
  const size = clampMotifPanelSize(
    motif.size,
    motif.kind === 'geometric' ? 'right' : 'left'
  );
  const position = normalizeMotifPositionForContentFrame(motif.position, size, edge);
  // Same as heroMotifShellStyle: the per-motif opacity slider multiplies the scroll fade.
  const opacity = (clamp(motif.opacity, 0, 100) / 100) * fadeOpacity;

  return motifPanelContainerStyle(position, size, opacity, '%');
}
