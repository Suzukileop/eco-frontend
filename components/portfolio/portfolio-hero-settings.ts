import {
  DEFAULT_CUSTOM_MOTIF_POINTS,
  getRightMotifPresetPoints,
  motifPointsToClipPath,
  sanitizeMotifPoints,
  type MotifPoint,
  type RightMotifPresetShape,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  DEFAULT_RIGHT_MOTIF_POSITION,
  DEFAULT_RIGHT_MOTIF_SIZE,
  sanitizeMotifPanelPosition,
  sanitizeMotifPanelSize,
  normalizeRightMotifPositionForContentFrame,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import {
  DEFAULT_HERO_PROFILE_SETTINGS,
  mergeHeroProfileSettings,
  type PortfolioHeroProfileSettings,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_HERO_META_SETTINGS,
  mergeHeroMetaSettings,
  type PortfolioHeroMetaSettings,
} from '@/components/portfolio/portfolio-hero-meta-settings';
import {
  DEFAULT_HERO_LEFT_MOTIF_SETTINGS,
  mergeHeroLeftMotifSettings,
  type PortfolioHeroLeftMotifSettings,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';
import {
  DEFAULT_HERO_COPY_SETTINGS,
  mergeHeroCopySettings,
  type PortfolioHeroCopySettings,
} from '@/components/portfolio/portfolio-hero-copy-settings';
import {
  DEFAULT_HERO_HEADLINE_SETTINGS,
  mergeHeroHeadlineSettings,
  PORTFOLIO_HERO_HEADLINE_PREFIX_OPTIONS,
  PORTFOLIO_HERO_HEADLINE_VALUE_OPTIONS,
  type PortfolioHeroHeadlineSettings,
  type PortfolioHeroHeadlineValue,
} from '@/components/portfolio/portfolio-hero-headline-settings';
import {
  DEFAULT_HERO_BACKGROUND_SETTINGS,
  mergeHeroBackgroundSettings,
  PORTFOLIO_HERO_BACKGROUND_FILL_OPTIONS,
  PORTFOLIO_HERO_BACKGROUND_GRADIENT_TYPE_OPTIONS,
  type PortfolioHeroBackgroundSettings,
} from '@/components/portfolio/portfolio-hero-background-settings';

export {
  PORTFOLIO_HERO_HEADLINE_PREFIX_OPTIONS,
  PORTFOLIO_HERO_HEADLINE_VALUE_OPTIONS,
  PORTFOLIO_HERO_BACKGROUND_FILL_OPTIONS,
  PORTFOLIO_HERO_BACKGROUND_GRADIENT_TYPE_OPTIONS,
  type PortfolioHeroHeadlineValue,
};

export type {
  PortfolioHeroCreatorNameFont,
  PortfolioHeroCreatorNameSize,
  PortfolioHeroPortraitRadius,
  PortfolioHeroPortraitSize,
  PortfolioHeroProfileSettings,
  PortraitPosition,
} from '@/components/portfolio/portfolio-hero-profile-settings';

export type {
  MetaRowPosition,
  PortfolioHeroMetaCardPadding,
  PortfolioHeroMetaDisplayDesign,
  PortfolioHeroMetaFrameShape,
  PortfolioHeroMetaInnerLayout,
  PortfolioHeroMetaPlacementMode,
  PortfolioHeroMetaSettings,
  PortfolioHeroMetaSpread,
  PortfolioHeroMetaValueSize,
} from '@/components/portfolio/portfolio-hero-meta-settings';

export type {
  HeroCopyPlacementMode,
  HeroCopyPosition,
  PortfolioHeroCopySettings,
} from '@/components/portfolio/portfolio-hero-copy-settings';

export type {
  LeftMotifPosition,
  LeftMotifSize,
  PortfolioHeroLeftMotifPattern,
  PortfolioHeroLeftMotifSettings,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';

export type PortfolioHeroMotifShape =
  | 'diagonal'
  | 'triangle'
  | 'trapezoid'
  | 'block'
  | 'chevron'
  | 'prism'
  | 'custom';

export type { MotifPoint };

export type PortfolioHeroMotifLayout = 'centered' | 'full';

export const HERO_GEOM_CENTERED_MARGIN_VH = 12;
export const HERO_GEOM_CENTERED_PANEL_HEIGHT_VH = 76;

export type PortfolioHeroHeadlineFont =
  | 'sans'
  | 'serif'
  | 'display'
  | 'montserrat'
  | 'oswald'
  | 'bebas'
  | 'raleway'
  | 'anton'
  | 'righteous'
  | 'script';

const PORTFOLIO_HERO_HEADLINE_FONTS = new Set<PortfolioHeroHeadlineFont>([
  'sans',
  'serif',
  'display',
  'montserrat',
  'oswald',
  'bebas',
  'raleway',
  'anton',
  'righteous',
  'script',
]);

export function isPortfolioHeroHeadlineFont(value: unknown): value is PortfolioHeroHeadlineFont {
  return typeof value === 'string' && PORTFOLIO_HERO_HEADLINE_FONTS.has(value as PortfolioHeroHeadlineFont);
}

export type PortfolioHeroCtaDesign = 'pill-dark' | 'pill-outline' | 'pill-accent' | 'text-arrow';

export type PortfolioHeroCtaPlacement =
  | 'below-pitch'
  | 'after-headline'
  | 'with-tools'
  | 'below-tools';

export type PortfolioHeroAvailabilityDesign = 'pill-live' | 'pill-minimal' | 'bordered' | 'soft';

export type PortfolioHeroAvailabilityPlacement = 'above-headline' | 'top-right' | 'below-headline';

export type PortfolioHeroPresentationSettings = {
  heroLayoutFlipped: boolean;
  motifShape: PortfolioHeroMotifShape;
  motifLayout: PortfolioHeroMotifLayout;
  motifColor: string;
  customMotifPoints: MotifPoint[];
  motifPosition: MotifPanelPosition;
  motifPanelSize: MotifPanelSize;
  headlineFont: PortfolioHeroHeadlineFont;
  ctaDesign: PortfolioHeroCtaDesign;
  ctaPlacement: PortfolioHeroCtaPlacement;
  availabilityDesign: PortfolioHeroAvailabilityDesign;
  availabilityPlacement: PortfolioHeroAvailabilityPlacement;
  /** Append “ · replies …” on the availability badge. */
  showAvailabilityResponseTime: boolean;
  selectedTools: string[];
} & PortfolioHeroProfileSettings &
  PortfolioHeroMetaSettings &
  PortfolioHeroLeftMotifSettings &
  PortfolioHeroCopySettings &
  PortfolioHeroHeadlineSettings &
  PortfolioHeroBackgroundSettings;

export const DEFAULT_HERO_MOTIF_COLOR = '#E5E5E5';

export const DEFAULT_HERO_PRESENTATION: PortfolioHeroPresentationSettings = {
  heroLayoutFlipped: false,
  motifShape: 'diagonal',
  motifLayout: 'centered',
  motifColor: DEFAULT_HERO_MOTIF_COLOR,
  customMotifPoints: DEFAULT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point })),
  motifPosition: { ...DEFAULT_RIGHT_MOTIF_POSITION },
  motifPanelSize: { ...DEFAULT_RIGHT_MOTIF_SIZE },
  headlineFont: 'sans',
  ctaDesign: 'pill-dark',
  ctaPlacement: 'below-tools',
  availabilityDesign: 'pill-live',
  availabilityPlacement: 'above-headline',
  showAvailabilityResponseTime: false,
  selectedTools: [],
  ...DEFAULT_HERO_PROFILE_SETTINGS,
  ...DEFAULT_HERO_META_SETTINGS,
  ...DEFAULT_HERO_LEFT_MOTIF_SETTINGS,
  ...DEFAULT_HERO_COPY_SETTINGS,
  ...DEFAULT_HERO_HEADLINE_SETTINGS,
  ...DEFAULT_HERO_BACKGROUND_SETTINGS,
};

export const PORTFOLIO_HERO_MOTIF_OPTIONS: {
  value: PortfolioHeroMotifShape;
  label: string;
  description: string;
}[] = [
  { value: 'diagonal', label: 'Diagonal', description: 'Classic editorial slash from center-bottom to top-right.' },
  { value: 'triangle', label: 'Triangle', description: 'Bold right triangle — graphic and minimal.' },
  { value: 'trapezoid', label: 'Trapezoid', description: 'Angled top edge with a stable base.' },
  { value: 'block', label: 'Vertical block', description: 'Clean rectangular panel on the right half.' },
  { value: 'chevron', label: 'Chevron', description: 'Layered V-shape pointing into the content.' },
  { value: 'prism', label: 'Prism', description: 'Two-angle facet — dynamic and modern.' },
  {
    value: 'custom',
    label: 'Custom editor',
    description: 'Draw freely — drag points on the border to create any shape.',
  },
];

export const PORTFOLIO_HERO_MOTIF_LAYOUT_OPTIONS: {
  value: PortfolioHeroMotifLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'centered',
    label: 'Centered with margins',
    description: 'Motif band vertically centered — white space above and below (12vh each).',
  },
  {
    value: 'full',
    label: 'Full viewport',
    description: 'Motif fills 100vh from the top — edge-to-edge editorial impact.',
  },
];

export const PORTFOLIO_HERO_HEADLINE_FONT_OPTIONS: {
  value: PortfolioHeroHeadlineFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans — current default.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine headline feel.' },
  { value: 'display', label: 'Display caps', description: 'Tight uppercase sans — poster-like impact.' },
  { value: 'montserrat', label: 'Montserrat', description: 'Clean modern sans — versatile and sharp.' },
  { value: 'oswald', label: 'Oswald', description: 'Condensed uppercase — strong editorial punch.' },
  { value: 'bebas', label: 'Bebas Neue', description: 'Tall display caps — billboard presence.' },
  { value: 'raleway', label: 'Raleway', description: 'Elegant geometric sans — refined and light.' },
  { value: 'anton', label: 'Anton', description: 'Heavy impact caps — loud and confident.' },
  { value: 'righteous', label: 'Righteous', description: 'Retro display — rounded poster energy.' },
  { value: 'script', label: 'Dancing Script', description: 'Handwritten script — creative and personal.' },
];

export const PORTFOLIO_HERO_CTA_DESIGN_OPTIONS: {
  value: PortfolioHeroCtaDesign;
  label: string;
  description: string;
}[] = [
  { value: 'pill-dark', label: 'Dark pill', description: 'Solid black capsule — primary CTA.' },
  { value: 'pill-outline', label: 'Outline pill', description: 'Bordered capsule on white.' },
  { value: 'pill-accent', label: 'Accent pill', description: 'Theme accent fill — warm or monochrome.' },
  { value: 'text-arrow', label: 'Text + arrow', description: 'Minimal linked text with arrow.' },
];

export const PORTFOLIO_HERO_CTA_PLACEMENT_OPTIONS: {
  value: PortfolioHeroCtaPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'below-tools', label: 'Below tools', description: 'Under the software icons — default.' },
  { value: 'below-pitch', label: 'Below pitch', description: 'Under the description paragraph.' },
  { value: 'after-headline', label: 'After headline', description: 'Directly under the main title.' },
  { value: 'with-tools', label: 'With tools', description: 'Same row as software icons on desktop.' },
];

export const PORTFOLIO_HERO_AVAILABILITY_DESIGN_OPTIONS: {
  value: PortfolioHeroAvailabilityDesign;
  label: string;
  description: string;
}[] = [
  { value: 'pill-live', label: 'Live pill', description: 'Green pulse dot in a rounded capsule.' },
  { value: 'pill-minimal', label: 'Minimal dot', description: 'Small dot and text — ultra light.' },
  { value: 'bordered', label: 'Bordered', description: 'Square corners with crisp border.' },
  { value: 'soft', label: 'Soft gray', description: 'Muted neutral chip — understated.' },
];

export const PORTFOLIO_HERO_AVAILABILITY_PLACEMENT_OPTIONS: {
  value: PortfolioHeroAvailabilityPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'above-headline', label: 'Above headline', description: 'Default — before the main title.' },
  { value: 'top-right', label: 'Top right', description: 'Pinned to the upper-right of the hero.' },
  { value: 'below-headline', label: 'Below headline', description: 'Between title and description.' },
];

export function resolveMotifPoints(
  shape: PortfolioHeroMotifShape,
  customMotifPoints: MotifPoint[]
): MotifPoint[] {
  if (shape === 'custom') {
    return sanitizeMotifPoints(customMotifPoints);
  }
  return getRightMotifPresetPoints(shape as RightMotifPresetShape);
}

export function getHeroMotifClipPath(shape: Exclude<PortfolioHeroMotifShape, 'custom'>): string {
  return motifPointsToClipPath(getRightMotifPresetPoints(shape));
}

export function resolveMotifClipPath(
  shape: PortfolioHeroMotifShape,
  customMotifPoints: MotifPoint[]
): string {
  return motifPointsToClipPath(resolveMotifPoints(shape, customMotifPoints));
}

export function isValidHeroMotifColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
}

export function heroHeadlineUsesSplitLayout(font: PortfolioHeroHeadlineFont): boolean {
  return font === 'display' || font === 'bebas' || font === 'anton' || font === 'oswald';
}

export function heroHeadlineSizeClass(font: PortfolioHeroHeadlineFont): string {
  switch (font) {
    case 'display':
    case 'bebas':
    case 'anton':
      return 'text-[3rem] sm:text-[3.75rem] lg:text-[4.5rem] xl:text-[5rem]';
    case 'script':
      return 'text-[3.25rem] sm:text-[4rem] lg:text-[4.75rem] xl:text-[5.5rem]';
    case 'oswald':
    case 'righteous':
      return 'text-[3.25rem] sm:text-[4rem] lg:text-[5rem] xl:text-[5.25rem]';
    default:
      return 'text-[3.5rem] sm:text-[4.25rem] lg:text-[5rem] xl:text-[5.5rem]';
  }
}

export function heroHeadlineClassName(font: PortfolioHeroHeadlineFont): string {
  switch (font) {
    case 'serif':
      return 'font-serif font-bold tracking-[-0.03em]';
    case 'display':
      return 'font-black uppercase tracking-[-0.05em]';
    case 'montserrat':
      return 'font-bold tracking-[-0.04em]';
    case 'oswald':
      return 'font-bold uppercase tracking-[0.03em]';
    case 'bebas':
      return 'font-normal uppercase tracking-[0.08em]';
    case 'raleway':
      return 'font-extrabold tracking-[-0.03em]';
    case 'anton':
      return 'font-normal uppercase tracking-[0.05em]';
    case 'righteous':
      return 'font-normal tracking-[0.02em]';
    case 'script':
      return 'font-normal normal-case tracking-normal';
    default:
      return 'font-extrabold tracking-[-0.04em]';
  }
}

export function heroHeadlineFontStyle(font: PortfolioHeroHeadlineFont): import('react').CSSProperties | undefined {
  switch (font) {
    case 'serif':
      return { fontFamily: "'Playfair Display', serif" };
    case 'montserrat':
      return { fontFamily: "'Montserrat', sans-serif" };
    case 'oswald':
      return { fontFamily: "'Oswald', sans-serif" };
    case 'bebas':
      return { fontFamily: "'Bebas Neue', sans-serif" };
    case 'raleway':
      return { fontFamily: "'Raleway', sans-serif" };
    case 'anton':
      return { fontFamily: "'Anton', sans-serif" };
    case 'righteous':
      return { fontFamily: "'Righteous', sans-serif" };
    case 'script':
      return { fontFamily: "'Dancing Script', cursive" };
    default:
      return undefined;
  }
}

/** @deprecated Use heroHeadlineFontStyle */
export function heroHeadlineSerifStyle(font: PortfolioHeroHeadlineFont): import('react').CSSProperties | undefined {
  return heroHeadlineFontStyle(font);
}

export function heroCtaClassName(design: PortfolioHeroCtaDesign): string {
  const base = 'inline-flex items-center gap-2 text-sm font-bold transition';
  switch (design) {
    case 'pill-outline':
      return `${base} rounded-full border-2 border-neutral-900 bg-transparent px-9 py-4 text-neutral-950 hover:bg-neutral-50 dark:border-white dark:text-white dark:hover:bg-neutral-900`;
    case 'pill-accent':
      return `${base} rounded-full bg-orange-600 px-9 py-4 text-white hover:bg-orange-700`;
    case 'text-arrow':
      return `${base} px-0 py-2 text-neutral-950 underline-offset-4 hover:underline dark:text-white`;
    default:
      return `${base} rounded-full bg-neutral-950 px-9 py-4 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200`;
  }
}

export function resolveHeroTools(allTools: string[], selectedTools: string[], max = 6): string[] {
  const normalized = Array.from(new Set(allTools.map((item) => item.trim()).filter(Boolean)));
  if (selectedTools.length === 0) return normalized.slice(0, max);
  const picked = selectedTools
    .map((item) => item.trim())
    .filter((item) => normalized.includes(item));
  return (picked.length > 0 ? picked : normalized).slice(0, max);
}

export function getHeroGeomMetrics(layout: PortfolioHeroMotifLayout = 'centered') {
  if (layout === 'full') {
    return {
      marginVh: 0,
      panelHeightVh: 100,
      motifBottom: '100vh',
    };
  }

  return {
    marginVh: HERO_GEOM_CENTERED_MARGIN_VH,
    panelHeightVh: HERO_GEOM_CENTERED_PANEL_HEIGHT_VH,
    motifBottom: `${HERO_GEOM_CENTERED_MARGIN_VH + HERO_GEOM_CENTERED_PANEL_HEIGHT_VH}vh`,
  };
}

/** Desktop hero must be tall enough for motif + stat cards (positioned in vh from the top). */
export const HERO_SECTION_DESKTOP_MIN_HEIGHT_VH = 100;

export function resolveHeroSectionMinHeightVh(
  presentation: Pick<PortfolioHeroPresentationSettings, 'motifPosition' | 'motifPanelSize' | 'metaPosition'>
): number {
  const motifBottom = presentation.motifPosition.y + presentation.motifPanelSize.height / 2;
  const metaBottom = presentation.metaPosition.y + 8;
  return Math.ceil(Math.max(HERO_SECTION_DESKTOP_MIN_HEIGHT_VH, motifBottom + 2, metaBottom));
}

export function heroGeomLayerPositionStyle(
  layout: PortfolioHeroMotifLayout = 'centered'
): import('react').CSSProperties {
  const { marginVh, panelHeightVh } = getHeroGeomMetrics(layout);
  return {
    top: `${marginVh}vh`,
    height: `${panelHeightVh}vh`,
    maxHeight: `${panelHeightVh}vh`,
  };
}

/** Build a complete presentation object from stored hero settings (avoids omitting new fields). */
export function pickHeroPresentationSettings(
  hero: Partial<PortfolioHeroPresentationSettings> | unknown
): PortfolioHeroPresentationSettings {
  return mergeHeroPresentation(DEFAULT_HERO_PRESENTATION, hero);
}

export function mergeHeroPresentation(
  base: PortfolioHeroPresentationSettings,
  patch: unknown
): PortfolioHeroPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const shape = record.motifShape;
  const motifLayout = record.motifLayout;
  const headlineFont = record.headlineFont;
  const ctaDesign = record.ctaDesign;
  const ctaPlacement = record.ctaPlacement;
  const availabilityDesign = record.availabilityDesign;
  const availabilityPlacement = record.availabilityPlacement;
  const motifColor =
    typeof record.motifColor === 'string' && isValidHeroMotifColor(record.motifColor)
      ? record.motifColor.trim()
      : base.motifColor;

  let selectedTools = base.selectedTools;
  if (Array.isArray(record.selectedTools)) {
    selectedTools = record.selectedTools.filter((item): item is string => typeof item === 'string');
  }

  const motifPanelSize = sanitizeMotifPanelSize(record.motifPanelSize, base.motifPanelSize, 'right');
  const motifPosition = normalizeRightMotifPositionForContentFrame(
    sanitizeMotifPanelPosition(record.motifPosition, base.motifPosition, 'right', motifPanelSize),
    motifPanelSize
  );

  return {
    heroLayoutFlipped:
      typeof record.heroLayoutFlipped === 'boolean' ? record.heroLayoutFlipped : base.heroLayoutFlipped,
    motifShape:
      shape === 'diagonal' ||
      shape === 'triangle' ||
      shape === 'trapezoid' ||
      shape === 'block' ||
      shape === 'chevron' ||
      shape === 'prism' ||
      shape === 'custom'
        ? shape
        : base.motifShape,
    motifLayout:
      motifLayout === 'centered' || motifLayout === 'full' ? motifLayout : base.motifLayout,
    motifColor,
    customMotifPoints: sanitizeMotifPoints(
      record.customMotifPoints !== undefined ? record.customMotifPoints : base.customMotifPoints
    ),
    headlineFont: isPortfolioHeroHeadlineFont(headlineFont) ? headlineFont : base.headlineFont,
    ctaDesign:
      ctaDesign === 'pill-dark' ||
      ctaDesign === 'pill-outline' ||
      ctaDesign === 'pill-accent' ||
      ctaDesign === 'text-arrow'
        ? ctaDesign
        : base.ctaDesign,
    ctaPlacement:
      ctaPlacement === 'below-pitch' ||
      ctaPlacement === 'after-headline' ||
      ctaPlacement === 'with-tools' ||
      ctaPlacement === 'below-tools'
        ? ctaPlacement
        : base.ctaPlacement,
    availabilityDesign:
      availabilityDesign === 'pill-live' ||
      availabilityDesign === 'pill-minimal' ||
      availabilityDesign === 'bordered' ||
      availabilityDesign === 'soft'
        ? availabilityDesign
        : base.availabilityDesign,
    availabilityPlacement:
      availabilityPlacement === 'above-headline' ||
      availabilityPlacement === 'top-right' ||
      availabilityPlacement === 'below-headline'
        ? availabilityPlacement
        : base.availabilityPlacement,
    showAvailabilityResponseTime:
      typeof record.showAvailabilityResponseTime === 'boolean'
        ? record.showAvailabilityResponseTime
        : base.showAvailabilityResponseTime,
    selectedTools,
    motifPosition,
    motifPanelSize,
    ...mergeHeroProfileSettings(base, patch),
    ...mergeHeroMetaSettings(base, patch),
    ...mergeHeroLeftMotifSettings(base, patch),
    ...mergeHeroCopySettings(base, patch),
    ...mergeHeroHeadlineSettings(base, patch),
    ...mergeHeroBackgroundSettings(base, patch),
  };
}
