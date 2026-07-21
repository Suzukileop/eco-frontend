import type { CSSProperties } from 'react';
import {
  DEFAULT_CUSTOM_MOTIF_POINTS,
  ensureLeftColumnMotifPoints,
  ensureRightColumnMotifPoints,
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
  normalizeMotifPositionForContentFrame,
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
  mergeHeroMotifsSettings,
  migrateLegacyHeroMotifs,
  syncLegacyFieldsFromHeroMotifs,
  type HeroMotifInstance,
} from '@/components/portfolio/portfolio-hero-motifs-settings';
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
import {
  DEFAULT_HERO_ELEMENT_STYLES,
  normalizeHeroElementStyles,
  syncHeroElementStylesFromLegacyPatch,
  syncHeroLegacyTypographyFromElementStyles,
  type PortfolioHeroElementStyles,
} from '@/components/portfolio/portfolio-hero-element-styles';

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
  | 'below-tools'
  | 'below-stats'
  | 'above-stats'
  | 'free-zone';

/** Sections the secondary hero button can point to. */
export type PortfolioHeroSecondaryCtaTarget =
  | 'work'
  | 'services'
  | 'skills'
  | 'about'
  | 'experience'
  | 'faq'
  | 'contact';

export const PORTFOLIO_HERO_SECONDARY_CTA_TARGET_OPTIONS: {
  value: PortfolioHeroSecondaryCtaTarget;
  label: string;
  description: string;
}[] = [
  { value: 'work', label: 'Work', description: 'Projects / portfolio grid.' },
  { value: 'services', label: 'Services', description: 'Services & offers section.' },
  { value: 'skills', label: 'Skills', description: 'Skills section.' },
  { value: 'about', label: 'About', description: 'About / bio section.' },
  { value: 'experience', label: 'Experience', description: 'Experience timeline.' },
  { value: 'faq', label: 'FAQ', description: 'Frequently asked questions.' },
  { value: 'contact', label: 'Contact', description: 'Contact section.' },
];

export function isPortfolioHeroSecondaryCtaTarget(
  value: unknown
): value is PortfolioHeroSecondaryCtaTarget {
  return (
    value === 'work' ||
    value === 'services' ||
    value === 'skills' ||
    value === 'about' ||
    value === 'experience' ||
    value === 'faq' ||
    value === 'contact'
  );
}

export const DEFAULT_HERO_SECONDARY_CTA_LABEL = 'View my work';

export function resolveShowSecondaryCta(presentation: {
  showSecondaryCta?: boolean;
}): boolean {
  return presentation.showSecondaryCta === true;
}

export function resolveSecondaryCtaLabel(presentation: {
  secondaryCtaLabel?: string;
}): string {
  const label = presentation.secondaryCtaLabel?.trim();
  return label || DEFAULT_HERO_SECONDARY_CTA_LABEL;
}

export function resolveSecondaryCtaTarget(presentation: {
  secondaryCtaTarget?: PortfolioHeroSecondaryCtaTarget;
}): PortfolioHeroSecondaryCtaTarget {
  return isPortfolioHeroSecondaryCtaTarget(presentation.secondaryCtaTarget)
    ? presentation.secondaryCtaTarget
    : 'work';
}

export function resolveSecondaryCtaDesign(presentation: {
  secondaryCtaDesign?: PortfolioHeroCtaDesign;
}): PortfolioHeroCtaDesign {
  const design = presentation.secondaryCtaDesign;
  if (
    design === 'pill-dark' ||
    design === 'pill-outline' ||
    design === 'pill-accent' ||
    design === 'text-arrow'
  ) {
    return design;
  }
  return 'text-arrow';
}

export type PortfolioHeroAvailabilityDesign = 'pill-live' | 'pill-minimal' | 'bordered' | 'soft';

export type PortfolioHeroAvailabilityPlacement =
  | 'above-headline'
  | 'below-headline'
  | 'below-description'
  | 'above-tools'
  | 'below-tools'
  | 'top-left'
  | 'top-center'
  | 'top-right';

/** Horizontal align for hero copy elements on mobile & tablet (below xl). Desktop follows layout flip. */
export type PortfolioHeroMobileAlign = 'left' | 'center' | 'right';

/**
 * Horizontal align for hero copy elements on desktop (xl+).
 * 'auto' follows the layout: left (or right when copy sits on the right side),
 * and the mobile choice for vertical divisions.
 */
export type PortfolioHeroDesktopAlign = 'auto' | PortfolioHeroMobileAlign;

export type PortfolioHeroAvailabilityBorderWidth = 'none' | 'thin' | 'medium' | 'thick';

export type PortfolioHeroAvailabilityBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type PortfolioHeroAvailabilityDotSize = 'sm' | 'md' | 'lg';

export type PortfolioHeroAvailabilityChromeSettings = {
  availabilityLabel: string;
  availabilityUnavailableLabel: string;
  availabilityTextColor: string;
  availabilityBackgroundColor: string;
  availabilityBorderColor: string;
  availabilityBorderWidth: PortfolioHeroAvailabilityBorderWidth;
  availabilityBorderRadius: PortfolioHeroAvailabilityBorderRadius;
  availabilityShowDot: boolean;
  availabilityDotColor: string;
  availabilityDotSize: PortfolioHeroAvailabilityDotSize;
  availabilityDotPulse: boolean;
  availabilityUnavailableTextColor: string;
  availabilityUnavailableBackgroundColor: string;
  availabilityUnavailableBorderColor: string;
  availabilityUnavailableDotColor: string;
  /** Extra space above the availability badge (px). */
  availabilityMarginTopPx: number;
  /** Extra space below the availability badge (px). */
  availabilityMarginBottomPx: number;
};

export const DEFAULT_AVAILABILITY_LABEL = 'Available for work';
export const DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL = 'Currently unavailable';
export const DEFAULT_AVAILABILITY_TEXT_COLOR = '#065f46';
export const DEFAULT_AVAILABILITY_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_AVAILABILITY_BORDER_COLOR = '#a7f3d0';
export const DEFAULT_AVAILABILITY_DOT_COLOR = '#10b981';
export const DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR = '#92400e';
export const DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR = '#fffbeb';
export const DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR = '#fcd34d';
export const DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR = '#f59e0b';
export const DEFAULT_AVAILABILITY_MARGIN_TOP_PX = 0;
export const DEFAULT_AVAILABILITY_MARGIN_BOTTOM_PX = 0;
export const AVAILABILITY_MARGIN_PX_MIN = 0;
export const AVAILABILITY_MARGIN_PX_MAX = 96;

export function sanitizeAvailabilityMarginPx(
  value: unknown,
  fallback: number = 0
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(AVAILABILITY_MARGIN_PX_MAX, Math.max(AVAILABILITY_MARGIN_PX_MIN, Math.round(n)));
}

export const DEFAULT_HERO_AVAILABILITY_CHROME: PortfolioHeroAvailabilityChromeSettings = {
  availabilityLabel: DEFAULT_AVAILABILITY_LABEL,
  availabilityUnavailableLabel: DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL,
  availabilityTextColor: DEFAULT_AVAILABILITY_TEXT_COLOR,
  availabilityBackgroundColor: DEFAULT_AVAILABILITY_BACKGROUND_COLOR,
  availabilityBorderColor: DEFAULT_AVAILABILITY_BORDER_COLOR,
  availabilityBorderWidth: 'thin',
  availabilityBorderRadius: 'full',
  availabilityShowDot: true,
  availabilityDotColor: DEFAULT_AVAILABILITY_DOT_COLOR,
  availabilityDotSize: 'md',
  availabilityDotPulse: true,
  availabilityUnavailableTextColor: DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR,
  availabilityUnavailableBackgroundColor: DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR,
  availabilityUnavailableBorderColor: DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR,
  availabilityUnavailableDotColor: DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR,
  availabilityMarginTopPx: DEFAULT_AVAILABILITY_MARGIN_TOP_PX,
  availabilityMarginBottomPx: DEFAULT_AVAILABILITY_MARGIN_BOTTOM_PX,
};

export type {
  PortfolioHeroElementStyles,
  PortfolioHeroStyleTarget,
} from '@/components/portfolio/portfolio-hero-element-styles';

export {
  DEFAULT_HERO_ELEMENT_STYLES,
  HERO_STYLE_TARGET_IDS,
  PORTFOLIO_HERO_STYLE_TARGET_OPTIONS,
  patchHeroElementStyle,
} from '@/components/portfolio/portfolio-hero-element-styles';
import {
  applyHeroPaletteToPresentation,
  DEFAULT_HERO_COLOR_BINDINGS,
  DEFAULT_HERO_PALETTE,
  mergeHeroColorBindings,
  mergeHeroPalette,
  type PortfolioHeroColorBindings,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_HERO_LAYOUT_DIVISION,
  DEFAULT_HERO_VERTICAL_FRAME_GAP_PX,
  sanitizeHeroLayoutDivision,
  sanitizeHeroVerticalFrameGapPx,
  type HeroLayoutDivision,
} from '@/components/portfolio/portfolio-hero-layout-division';
import {
  DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT,
  sanitizeHeroUltraWideColumnLayout,
  type HeroUltraWideColumnLayout,
} from '@/components/portfolio/portfolio-hero-ultrawide-columns';
import {
  DEFAULT_HERO_COPY_ELEMENTS_LAYOUT,
  sanitizeHeroCopyElementsLayout,
  type HeroCopyElementsLayout,
} from '@/components/portfolio/portfolio-hero-copy-element-layout';
import {
  sanitizeHeroVerticalCellPlacement,
  type HeroVerticalCellPlacement,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';

export const DEFAULT_HERO_VISUAL_FREE_CELL: HeroVerticalCellPlacement = 'top-right';

/** 3×3 anchor of the "free zone" — where copy elements sent to the other part land. */
export function resolveHeroVisualFreeCell(presentation: {
  heroVisualFreeCell?: HeroVerticalCellPlacement;
}): HeroVerticalCellPlacement {
  return sanitizeHeroVerticalCellPlacement(
    presentation.heroVisualFreeCell,
    DEFAULT_HERO_VISUAL_FREE_CELL
  );
}

export type PortfolioHeroPresentationSettings = {
  heroLayoutFlipped: boolean;
  /** How the copy group and visual group share the hero screen. */
  heroLayoutDivision: HeroLayoutDivision;
  /**
   * Vertical divisions only: space in px between the top block and the bottom block.
   */
  heroVerticalFrameGapPx: number;
  /**
   * Vertical divisions only: 1–3 columns on xl+ screens,
   * with per-element column slots for copy / visual units.
   */
  heroUltraWideColumns: HeroUltraWideColumnLayout;
  /**
   * Per copy element: margin top/bottom + above/below stats (vertical).
   */
  heroCopyElementsLayout: HeroCopyElementsLayout;
  /**
   * Vertical divisions only: 3×3 anchor of the free zone inside the visual
   * frame, hosting copy elements whose statsSide is 'free-zone'.
   */
  heroVisualFreeCell: HeroVerticalCellPlacement;
  motifShape: PortfolioHeroMotifShape;
  motifLayout: PortfolioHeroMotifLayout;
  motifColor: string;
  customMotifPoints: MotifPoint[];
  motifPosition: MotifPanelPosition;
  motifPanelSize: MotifPanelSize;
  headlineFont: PortfolioHeroHeadlineFont;
  ctaDesign: PortfolioHeroCtaDesign;
  ctaPlacement: PortfolioHeroCtaPlacement;
  /** Secondary button next to the contact CTA, pointing to a selectable section. */
  showSecondaryCta: boolean;
  secondaryCtaLabel: string;
  secondaryCtaTarget: PortfolioHeroSecondaryCtaTarget;
  secondaryCtaDesign: PortfolioHeroCtaDesign;
  availabilityDesign: PortfolioHeroAvailabilityDesign;
  availabilityPlacement: PortfolioHeroAvailabilityPlacement;
  /** When false, the availability badge is hidden on all breakpoints. */
  showAvailabilityBadge: boolean;
  /** Append “ · replies …” on the availability badge. */
  showAvailabilityResponseTime: boolean;
  /** Mobile/tablet (below xl) placement — independent from desktop. */
  mobileAvailabilityPlacement: PortfolioHeroAvailabilityPlacement;
  /** Mobile/tablet (below xl) alignment for the availability badge. */
  mobileAvailabilityAlign: PortfolioHeroMobileAlign;
  /** Mobile/tablet (below xl) alignment for the headline. */
  mobileAlignHeadline: PortfolioHeroMobileAlign;
  /** Mobile/tablet (below xl) alignment for the pitch / description. */
  mobileAlignDescription: PortfolioHeroMobileAlign;
  /** Mobile/tablet (below xl) alignment for the tools icon row. */
  mobileAlignTools: PortfolioHeroMobileAlign;
  /** Mobile/tablet (below xl) alignment for the contact CTA. */
  mobileAlignCta: PortfolioHeroMobileAlign;
  /** Desktop (xl+) alignment for the availability badge — 'auto' follows the layout. */
  desktopAvailabilityAlign: PortfolioHeroDesktopAlign;
  /** Desktop (xl+) alignment for the headline — 'auto' follows the layout. */
  desktopAlignHeadline: PortfolioHeroDesktopAlign;
  /** Desktop (xl+) alignment for the pitch / description — 'auto' follows the layout. */
  desktopAlignDescription: PortfolioHeroDesktopAlign;
  /** Desktop (xl+) alignment for the tools icon row — 'auto' follows the layout. */
  desktopAlignTools: PortfolioHeroDesktopAlign;
  /** Desktop (xl+) alignment for the contact CTA — 'auto' follows the layout. */
  desktopAlignCta: PortfolioHeroDesktopAlign;
  /** One-time migration marker — bumped when the stacked-align defaults change. */
  mobileAlignSettingsRevision: number;
  selectedTools: string[];
  /** Show a caption above the software icon row. */
  showToolsLabel: boolean;
  /** Custom tools caption — empty falls back to “Preferred tools”. */
  toolsLabelText: string;
  /** Contact CTA surface (background + border) — editable under Typography. */
  ctaBackgroundEnabled: boolean;
  ctaBackgroundColor: string;
  ctaBorderEnabled: boolean;
  ctaBorderColor: string;
  ctaBorderWidth: PortfolioHeroAvailabilityBorderWidth;
  ctaBorderRadius: PortfolioHeroAvailabilityBorderRadius;
  /** Tools icon chip surface — editable under Typography. */
  toolsIconBackgroundColor: string;
  toolsIconBorderColor: string;
  toolsIconBorderWidth: PortfolioHeroAvailabilityBorderWidth;
  toolsIconBorderRadius: PortfolioHeroAvailabilityBorderRadius;
  /** Multi-motif layers (shapes + patterns) with mobile/desktop visibility. */
  heroMotifs: HeroMotifInstance[];
} & PortfolioHeroAvailabilityChromeSettings &
  PortfolioHeroProfileSettings &
  PortfolioHeroMetaSettings &
  PortfolioHeroLeftMotifSettings &
  PortfolioHeroCopySettings &
  PortfolioHeroHeadlineSettings &
  PortfolioHeroBackgroundSettings & {
    /** Unified typography for hero text elements (no duplicate scalar color/size fields). */
    elementStyles: PortfolioHeroElementStyles;
    /** Semantic Hero color tokens — elements bind via colorBindings. */
    palette: PortfolioHeroPalette;
    /** Which palette token each Hero color slot uses. */
    colorBindings: PortfolioHeroColorBindings;
    /**
     * When true (default), Hero hex fields stay synced from the semantic palette.
     * When false, color pickers edit hex values directly (manual mode).
     */
    useHeroPalette: boolean;
  };

/** Matches DEFAULT_HERO_PALETTE.bordure (default Motif token). */
export const DEFAULT_HERO_MOTIF_COLOR = '#2a2a30';

/**
 * v1: stacked hero copy (below xl) centers every element by default.
 * Bump when the stacked-align defaults change to re-run the one-time reset.
 */
export const HERO_MOBILE_ALIGN_SETTINGS_REVISION = 1;

export const DEFAULT_HERO_MOTIFS: HeroMotifInstance[] = migrateLegacyHeroMotifs({
  motifShape: 'diagonal',
  motifColor: DEFAULT_HERO_MOTIF_COLOR,
  customMotifPoints: DEFAULT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point })),
  motifPosition: { ...DEFAULT_RIGHT_MOTIF_POSITION },
  motifPanelSize: { ...DEFAULT_RIGHT_MOTIF_SIZE },
  heroMotifOpacity: 100,
  ...DEFAULT_HERO_LEFT_MOTIF_SETTINGS,
});

export const DEFAULT_HERO_PRESENTATION: PortfolioHeroPresentationSettings = {
  heroLayoutFlipped: false,
  heroLayoutDivision: DEFAULT_HERO_LAYOUT_DIVISION,
  heroVerticalFrameGapPx: DEFAULT_HERO_VERTICAL_FRAME_GAP_PX,
  heroUltraWideColumns: {
    ...DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT,
    copySlots: { ...DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT.copySlots },
    visualSlots: { ...DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT.visualSlots },
  },
  heroCopyElementsLayout: {
    availability: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.availability },
    headline: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.headline },
    description: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.description },
    tools: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.tools },
    cta: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.cta },
  },
  heroVisualFreeCell: DEFAULT_HERO_VISUAL_FREE_CELL,
  motifShape: 'diagonal',
  motifLayout: 'centered',
  motifColor: DEFAULT_HERO_MOTIF_COLOR,
  customMotifPoints: DEFAULT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point })),
  motifPosition: { ...DEFAULT_RIGHT_MOTIF_POSITION },
  motifPanelSize: { ...DEFAULT_RIGHT_MOTIF_SIZE },
  headlineFont: 'sans',
  ctaDesign: 'pill-dark',
  ctaPlacement: 'below-tools',
  showSecondaryCta: true,
  secondaryCtaLabel: DEFAULT_HERO_SECONDARY_CTA_LABEL,
  secondaryCtaTarget: 'work',
  secondaryCtaDesign: 'text-arrow',
  availabilityDesign: 'pill-live',
  availabilityPlacement: 'above-headline',
  showAvailabilityBadge: true,
  showAvailabilityResponseTime: false,
  mobileAvailabilityPlacement: 'above-headline',
  mobileAvailabilityAlign: 'center',
  mobileAlignHeadline: 'center',
  mobileAlignDescription: 'center',
  mobileAlignTools: 'center',
  mobileAlignCta: 'center',
  desktopAvailabilityAlign: 'auto',
  desktopAlignHeadline: 'auto',
  desktopAlignDescription: 'auto',
  desktopAlignTools: 'auto',
  desktopAlignCta: 'auto',
  mobileAlignSettingsRevision: HERO_MOBILE_ALIGN_SETTINGS_REVISION,
  ...DEFAULT_HERO_AVAILABILITY_CHROME,
  selectedTools: [],
  showToolsLabel: false,
  toolsLabelText: '',
  ctaBackgroundEnabled: false,
  ctaBackgroundColor: '#0a0a0a',
  ctaBorderEnabled: false,
  ctaBorderColor: '#ffffff',
  ctaBorderWidth: 'thin',
  ctaBorderRadius: 'full',
  toolsIconBackgroundColor: '#ffffff',
  toolsIconBorderColor: '#e5e5e5',
  toolsIconBorderWidth: 'thin',
  toolsIconBorderRadius: 'full',
  heroMotifs: DEFAULT_HERO_MOTIFS.map((motif) => ({
    ...motif,
    points: motif.points.map((point) => ({ ...point })),
    visibility: { ...motif.visibility },
  })),
  ...DEFAULT_HERO_PROFILE_SETTINGS,
  ...DEFAULT_HERO_META_SETTINGS,
  ...DEFAULT_HERO_LEFT_MOTIF_SETTINGS,
  ...DEFAULT_HERO_COPY_SETTINGS,
  ...DEFAULT_HERO_HEADLINE_SETTINGS,
  ...DEFAULT_HERO_BACKGROUND_SETTINGS,
  elementStyles: DEFAULT_HERO_ELEMENT_STYLES,
  palette: { ...DEFAULT_HERO_PALETTE },
  colorBindings: { ...DEFAULT_HERO_COLOR_BINDINGS },
  useHeroPalette: true,
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
  {
    value: 'above-stats',
    label: 'Above stats',
    description: 'Directly above the stats chips (same column) — still links to contact.',
  },
  {
    value: 'below-stats',
    label: 'Below stats',
    description: 'Directly under the stats chips (same column) — still links to contact.',
  },
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
  { value: 'above-headline', label: 'Above headline', description: 'Before the main title.' },
  { value: 'below-headline', label: 'Below headline', description: 'Between title and description.' },
  { value: 'below-description', label: 'Below description', description: 'After the pitch paragraph.' },
  { value: 'above-tools', label: 'Above tools', description: 'Just before the tools row.' },
  { value: 'below-tools', label: 'Below tools', description: 'After tools / near the CTA area.' },
  { value: 'top-left', label: 'Top left', description: 'Start of the hero copy column.' },
  { value: 'top-center', label: 'Top center', description: 'Centered at the top — all screen sizes.' },
  { value: 'top-right', label: 'Top right', description: 'End of the hero copy column.' },
];

export function isHeroAvailabilityPlacement(
  value: unknown
): value is PortfolioHeroAvailabilityPlacement {
  return (
    value === 'above-headline' ||
    value === 'below-headline' ||
    value === 'below-description' ||
    value === 'above-tools' ||
    value === 'below-tools' ||
    value === 'top-left' ||
    value === 'top-center' ||
    value === 'top-right'
  );
}

export const PORTFOLIO_HERO_MOBILE_ALIGN_OPTIONS: {
  value: PortfolioHeroMobileAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Align to the left edge.' },
  { value: 'center', label: 'Center', description: 'Center horizontally.' },
  { value: 'right', label: 'Right', description: 'Align to the right edge.' },
];

function isHeroMobileAlign(value: unknown): value is PortfolioHeroMobileAlign {
  return value === 'left' || value === 'center' || value === 'right';
}

export const PORTFOLIO_HERO_DESKTOP_ALIGN_OPTIONS: {
  value: PortfolioHeroDesktopAlign;
  label: string;
  description: string;
}[] = [
  { value: 'auto', label: 'Auto', description: 'Follows the layout side.' },
  { value: 'left', label: 'Left', description: 'Align to the left edge.' },
  { value: 'center', label: 'Center', description: 'Center horizontally.' },
  { value: 'right', label: 'Right', description: 'Align to the right edge.' },
];

function isHeroDesktopAlign(value: unknown): value is PortfolioHeroDesktopAlign {
  return value === 'auto' || isHeroMobileAlign(value);
}

export type HeroAlignClassOptions = {
  /**
   * When true, left/center/right applies at every breakpoint (vertical division).
   * When false (default), xl+ follows the horizontal layout flip instead.
   */
  respectAlignOnDesktop?: boolean;
  /** Explicit desktop (xl+) alignment — anything but 'auto' wins over the layout side. */
  desktopAlign?: PortfolioHeroDesktopAlign;
};

/** Explicit (non-auto) desktop alignment from options, if any. */
function explicitDesktopAlign(
  options?: HeroAlignClassOptions
): PortfolioHeroMobileAlign | null {
  return options?.desktopAlign && options.desktopAlign !== 'auto' ? options.desktopAlign : null;
}

export function heroAlignTextClass(align: PortfolioHeroMobileAlign): string {
  return align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
}

export function heroAlignJustifyClass(align: PortfolioHeroMobileAlign): string {
  return align === 'center'
    ? 'justify-center'
    : align === 'right'
      ? 'justify-end'
      : 'justify-start';
}

export function heroAlignSelfClass(align: PortfolioHeroMobileAlign): string {
  return align === 'center' ? 'self-center' : align === 'right' ? 'self-end' : 'self-start';
}

function heroAlignTextXlClass(align: PortfolioHeroMobileAlign): string {
  return align === 'center' ? 'xl:text-center' : align === 'right' ? 'xl:text-right' : 'xl:text-left';
}

function heroAlignJustifyXlClass(align: PortfolioHeroMobileAlign): string {
  return align === 'center'
    ? 'xl:justify-center'
    : align === 'right'
      ? 'xl:justify-end'
      : 'xl:justify-start';
}

function heroAlignSelfXlClass(align: PortfolioHeroMobileAlign): string {
  return align === 'center' ? 'xl:self-center' : align === 'right' ? 'xl:self-end' : 'xl:self-start';
}

/** Text-align classes: stacked/mobile value below xl; xl+ uses the explicit desktop align, else the layout flip (or the chosen align for vertical divisions). */
export function heroMobileTextAlignClass(
  align: PortfolioHeroMobileAlign,
  desktopEnd: boolean,
  options?: HeroAlignClassOptions
): string {
  const desktop = explicitDesktopAlign(options);
  /** Vertical division: tablet/mobile auto-centers, the chosen align already drives desktop. */
  if (options?.respectAlignOnDesktop) {
    return `text-center ${heroAlignTextXlClass(align)}`;
  }
  const base = heroAlignTextClass(align);
  const xl = desktop
    ? heroAlignTextXlClass(desktop)
    : desktopEnd
      ? 'xl:text-right'
      : 'xl:text-left';
  return `${base} ${xl}`;
}

/** Flex justify for rows (badge, tools): stacked/mobile value below xl; xl+ uses the explicit desktop align, else the layout flip (or the chosen align for vertical divisions). */
export function heroMobileJustifyClass(
  align: PortfolioHeroMobileAlign,
  desktopEnd: boolean,
  options?: HeroAlignClassOptions
): string {
  const desktop = explicitDesktopAlign(options);
  if (options?.respectAlignOnDesktop) {
    return `justify-center ${heroAlignJustifyXlClass(align)}`;
  }
  const base = heroAlignJustifyClass(align);
  const xl = desktop
    ? heroAlignJustifyXlClass(desktop)
    : desktopEnd
      ? 'xl:justify-end'
      : 'xl:justify-start';
  return `${base} ${xl}`;
}

/** Self-alignment for hug-content items (CTA): stacked/mobile value below xl; xl+ uses the explicit desktop align, else the layout flip (or the chosen align for vertical divisions). */
export function heroMobileSelfAlignClass(
  align: PortfolioHeroMobileAlign,
  desktopEnd: boolean,
  options?: HeroAlignClassOptions
): string {
  const desktop = explicitDesktopAlign(options);
  if (options?.respectAlignOnDesktop) {
    return `self-center ${heroAlignSelfXlClass(align)}`;
  }
  const base = heroAlignSelfClass(align);
  const xl = desktop
    ? heroAlignSelfXlClass(desktop)
    : desktopEnd
      ? 'xl:self-end'
      : 'xl:self-start';
  return `${base} ${xl}`;
}

/** Block alignment for capped-width copy (description) so center isn't stuck to the left edge. */
export function heroMobileBlockAlignClass(
  align: PortfolioHeroMobileAlign,
  desktopEnd: boolean,
  options?: HeroAlignClassOptions
): string {
  return heroMobileSelfAlignClass(align, desktopEnd, options);
}

/** Flex justify for the availability row based on pin placement + mobile align. */
export function availabilityPlacementJustifyClass(
  placement: PortfolioHeroAvailabilityPlacement,
  mobileAlign: PortfolioHeroMobileAlign,
  desktopEnd: boolean,
  options?: HeroAlignClassOptions
): string {
  if (placement === 'top-center') {
    return 'justify-center';
  }

  const base = heroAlignJustifyClass(mobileAlign);
  const desktop = explicitDesktopAlign(options);

  if (options?.respectAlignOnDesktop) {
    return `justify-center ${heroAlignJustifyXlClass(mobileAlign)}`;
  }

  // An explicit desktop align wins over the corner pin on xl+.
  if (placement === 'top-right') {
    return `${base} ${desktop ? heroAlignJustifyXlClass(desktop) : desktopEnd ? 'xl:justify-start' : 'xl:justify-end'}`;
  }
  if (placement === 'top-left') {
    return `${base} ${desktop ? heroAlignJustifyXlClass(desktop) : desktopEnd ? 'xl:justify-end' : 'xl:justify-start'}`;
  }
  return heroMobileJustifyClass(mobileAlign, desktopEnd, options);
}

export const PORTFOLIO_HERO_AVAILABILITY_BORDER_WIDTH_OPTIONS: {
  value: PortfolioHeroAvailabilityBorderWidth;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No outline around the badge.' },
  { value: 'thin', label: 'Thin', description: 'Subtle 1px border.' },
  { value: 'medium', label: 'Medium', description: 'Clear 2px border.' },
  { value: 'thick', label: 'Thick', description: 'Bold 3px border.' },
];

export const PORTFOLIO_HERO_AVAILABILITY_BORDER_RADIUS_OPTIONS: {
  value: PortfolioHeroAvailabilityBorderRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Square', description: 'Sharp corners.' },
  { value: 'sm', label: 'Slight', description: 'Soft small radius.' },
  { value: 'md', label: 'Rounded', description: 'Comfortable medium radius.' },
  { value: 'lg', label: 'Soft', description: 'Larger rounded corners.' },
  { value: 'full', label: 'Pill', description: 'Fully rounded capsule.' },
];

export const PORTFOLIO_HERO_AVAILABILITY_DOT_SIZE_OPTIONS: {
  value: PortfolioHeroAvailabilityDotSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact status dot.' },
  { value: 'md', label: 'Medium', description: 'Default status dot.' },
  { value: 'lg', label: 'Large', description: 'More visible status dot.' },
];

function sanitizeAvailabilityHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim())) {
    return value.trim();
  }
  return fallback;
}

function mergeHeroAvailabilityChrome(
  base: PortfolioHeroAvailabilityChromeSettings,
  record: Record<string, unknown>
): PortfolioHeroAvailabilityChromeSettings {
  const borderWidth = record.availabilityBorderWidth;
  const borderRadius = record.availabilityBorderRadius;
  const dotSize = record.availabilityDotSize;

  return {
    availabilityLabel:
      typeof record.availabilityLabel === 'string' && record.availabilityLabel.trim()
        ? record.availabilityLabel.trim()
        : base.availabilityLabel,
    availabilityUnavailableLabel:
      typeof record.availabilityUnavailableLabel === 'string' &&
      record.availabilityUnavailableLabel.trim()
        ? record.availabilityUnavailableLabel.trim()
        : base.availabilityUnavailableLabel,
    availabilityTextColor: sanitizeAvailabilityHex(
      record.availabilityTextColor,
      base.availabilityTextColor
    ),
    availabilityBackgroundColor: sanitizeAvailabilityHex(
      record.availabilityBackgroundColor,
      base.availabilityBackgroundColor
    ),
    availabilityBorderColor: sanitizeAvailabilityHex(
      record.availabilityBorderColor,
      base.availabilityBorderColor
    ),
    availabilityBorderWidth:
      borderWidth === 'none' ||
      borderWidth === 'thin' ||
      borderWidth === 'medium' ||
      borderWidth === 'thick'
        ? borderWidth
        : base.availabilityBorderWidth,
    availabilityBorderRadius:
      borderRadius === 'none' ||
      borderRadius === 'sm' ||
      borderRadius === 'md' ||
      borderRadius === 'lg' ||
      borderRadius === 'full'
        ? borderRadius
        : base.availabilityBorderRadius,
    availabilityShowDot:
      typeof record.availabilityShowDot === 'boolean'
        ? record.availabilityShowDot
        : base.availabilityShowDot,
    availabilityDotColor: sanitizeAvailabilityHex(
      record.availabilityDotColor,
      base.availabilityDotColor
    ),
    availabilityDotSize:
      dotSize === 'sm' || dotSize === 'md' || dotSize === 'lg' ? dotSize : base.availabilityDotSize,
    availabilityDotPulse:
      typeof record.availabilityDotPulse === 'boolean'
        ? record.availabilityDotPulse
        : base.availabilityDotPulse,
    availabilityUnavailableTextColor: sanitizeAvailabilityHex(
      record.availabilityUnavailableTextColor,
      base.availabilityUnavailableTextColor ?? DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR
    ),
    availabilityUnavailableBackgroundColor: sanitizeAvailabilityHex(
      record.availabilityUnavailableBackgroundColor,
      base.availabilityUnavailableBackgroundColor ?? DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR
    ),
    availabilityUnavailableBorderColor: sanitizeAvailabilityHex(
      record.availabilityUnavailableBorderColor,
      base.availabilityUnavailableBorderColor ?? DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR
    ),
    availabilityUnavailableDotColor: sanitizeAvailabilityHex(
      record.availabilityUnavailableDotColor,
      base.availabilityUnavailableDotColor ?? DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR
    ),
    availabilityMarginTopPx: sanitizeAvailabilityMarginPx(
      record.availabilityMarginTopPx !== undefined
        ? record.availabilityMarginTopPx
        : base.availabilityMarginTopPx,
      DEFAULT_AVAILABILITY_MARGIN_TOP_PX
    ),
    availabilityMarginBottomPx: sanitizeAvailabilityMarginPx(
      record.availabilityMarginBottomPx !== undefined
        ? record.availabilityMarginBottomPx
        : base.availabilityMarginBottomPx,
      DEFAULT_AVAILABILITY_MARGIN_BOTTOM_PX
    ),
  };
}

export function pickHeroAvailabilityBadgeProps(presentation: PortfolioHeroPresentationSettings) {
  return {
    design: presentation.availabilityDesign,
    placement: presentation.availabilityPlacement,
    showResponseTime: presentation.showAvailabilityResponseTime,
    label: presentation.availabilityLabel,
    unavailableLabel: presentation.availabilityUnavailableLabel,
    textColor: presentation.availabilityTextColor,
    backgroundColor: presentation.availabilityBackgroundColor,
    borderColor: presentation.availabilityBorderColor,
    borderWidth: presentation.availabilityBorderWidth,
    borderRadius: presentation.availabilityBorderRadius,
    showDot: presentation.availabilityShowDot,
    dotColor: presentation.availabilityDotColor,
    dotSize: presentation.availabilityDotSize,
    dotPulse: presentation.availabilityDotPulse,
    unavailableTextColor: presentation.availabilityUnavailableTextColor,
    unavailableBackgroundColor: presentation.availabilityUnavailableBackgroundColor,
    unavailableBorderColor: presentation.availabilityUnavailableBorderColor,
    unavailableDotColor: presentation.availabilityUnavailableDotColor,
    marginTopPx: presentation.availabilityMarginTopPx,
    marginBottomPx: presentation.availabilityMarginBottomPx,
  };
}

export function resolveMotifPoints(
  shape: PortfolioHeroMotifShape,
  customMotifPoints: MotifPoint[],
  /** Which content-frame column the geometric motif sits on. */
  column: 'left' | 'right' = 'right'
): MotifPoint[] {
  const raw =
    shape === 'custom'
      ? sanitizeMotifPoints(customMotifPoints)
      : getRightMotifPresetPoints(shape as RightMotifPresetShape);
  return column === 'left'
    ? ensureLeftColumnMotifPoints(raw)
    : ensureRightColumnMotifPoints(raw);
}

export function getHeroMotifClipPath(shape: Exclude<PortfolioHeroMotifShape, 'custom'>): string {
  return motifPointsToClipPath(getRightMotifPresetPoints(shape));
}

export function resolveMotifClipPath(
  shape: PortfolioHeroMotifShape,
  customMotifPoints: MotifPoint[],
  column: 'left' | 'right' = 'right'
): string {
  return motifPointsToClipPath(resolveMotifPoints(shape, customMotifPoints, column));
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
      return 'text-[2.25rem] sm:text-[3.25rem] lg:text-[4.5rem] xl:text-[5rem]';
    case 'script':
      return 'text-[2.5rem] sm:text-[3.5rem] lg:text-[4.75rem] xl:text-[5.5rem]';
    case 'oswald':
    case 'righteous':
      return 'text-[2.35rem] sm:text-[3.5rem] lg:text-[5rem] xl:text-[5.25rem]';
    default:
      return 'text-[2.5rem] sm:text-[3.5rem] lg:text-[5rem] xl:text-[5.5rem]';
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

function heroSurfaceBorderWidthPx(width: PortfolioHeroAvailabilityBorderWidth): number {
  switch (width) {
    case 'none':
      return 0;
    case 'medium':
      return 2;
    case 'thick':
      return 3;
    default:
      return 1;
  }
}

function heroSurfaceBorderRadiusCss(radius: PortfolioHeroAvailabilityBorderRadius): string {
  switch (radius) {
    case 'none':
      return '0px';
    case 'sm':
      return '0.375rem';
    case 'md':
      return '0.75rem';
    case 'lg':
      return '1rem';
    default:
      return '9999px';
  }
}

/** Optional background / border overrides for the Contact me CTA (Typography panel). */
export function heroCtaSurfaceStyle(
  presentation: Pick<
    PortfolioHeroPresentationSettings,
    | 'ctaBackgroundEnabled'
    | 'ctaBackgroundColor'
    | 'ctaBorderEnabled'
    | 'ctaBorderColor'
    | 'ctaBorderWidth'
    | 'ctaBorderRadius'
  >
): CSSProperties {
  const style: CSSProperties = {
    borderRadius: heroSurfaceBorderRadiusCss(presentation.ctaBorderRadius ?? 'full'),
  };
  if (presentation.ctaBackgroundEnabled) {
    style.backgroundColor = sanitizeAvailabilityHex(
      presentation.ctaBackgroundColor,
      '#0a0a0a'
    );
  }
  if (presentation.ctaBorderEnabled) {
    const width = heroSurfaceBorderWidthPx(presentation.ctaBorderWidth ?? 'thin');
    style.borderStyle = 'solid';
    style.borderWidth = width;
    style.borderColor = sanitizeAvailabilityHex(presentation.ctaBorderColor, '#ffffff');
  }
  return style;
}

/** Extra padding when a text-arrow CTA gains a painted surface. */
export function heroCtaSurfacePaddingClass(
  presentation: Pick<
    PortfolioHeroPresentationSettings,
    'ctaDesign' | 'ctaBackgroundEnabled' | 'ctaBorderEnabled'
  >
): string {
  if (presentation.ctaDesign !== 'text-arrow') return '';
  if (!presentation.ctaBackgroundEnabled && !presentation.ctaBorderEnabled) return '';
  return 'px-6 py-3 no-underline hover:no-underline';
}

/** Background + border for each tools icon chip. */
export function heroToolsIconSurfaceStyle(
  presentation: Pick<
    PortfolioHeroPresentationSettings,
    | 'toolsIconBackgroundColor'
    | 'toolsIconBorderColor'
    | 'toolsIconBorderWidth'
    | 'toolsIconBorderRadius'
  >
): CSSProperties {
  const width = heroSurfaceBorderWidthPx(presentation.toolsIconBorderWidth ?? 'thin');
  return {
    backgroundColor: sanitizeAvailabilityHex(presentation.toolsIconBackgroundColor, '#ffffff'),
    borderStyle: 'solid',
    borderWidth: width,
    borderColor: sanitizeAvailabilityHex(presentation.toolsIconBorderColor, '#e5e5e5'),
    borderRadius: heroSurfaceBorderRadiusCss(presentation.toolsIconBorderRadius ?? 'full'),
  };
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
  const layoutDivision = sanitizeHeroLayoutDivision(
    record.heroLayoutDivision,
    typeof record.heroLayoutFlipped === 'boolean'
      ? record.heroLayoutFlipped
        ? 'horizontal-copy-right'
        : 'horizontal-copy-left'
      : base.heroLayoutDivision ?? DEFAULT_HERO_LAYOUT_DIVISION
  );
  const visualMotifEdge = layoutDivision === 'horizontal-copy-right' ? 'left' : 'right';
  const motifPosition = normalizeMotifPositionForContentFrame(
    sanitizeMotifPanelPosition(record.motifPosition, base.motifPosition, 'right', motifPanelSize),
    motifPanelSize,
    visualMotifEdge
  );

  const leftMerged = mergeHeroLeftMotifSettings(base, patch);
  const backgroundMerged = mergeHeroBackgroundSettings(base, patch);
  const profileMerged = mergeHeroProfileSettings(base, patch);
  const metaMerged = mergeHeroMetaSettings(base, patch);
  const availabilityMerged = mergeHeroAvailabilityChrome(base, record);
  const copyMerged = mergeHeroCopySettings(base, patch);
  const headlineMerged = mergeHeroHeadlineSettings(base, patch);

  const heroMotifs = mergeHeroMotifsSettings(base.heroMotifs ?? [], patch, {
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
    motifColor,
    customMotifPoints: sanitizeMotifPoints(
      record.customMotifPoints !== undefined ? record.customMotifPoints : base.customMotifPoints
    ),
    motifPosition,
    motifPanelSize,
    heroMotifOpacity: backgroundMerged.heroMotifOpacity,
    leftMotifEnabled: leftMerged.leftMotifEnabled,
    leftMotifPattern: leftMerged.leftMotifPattern,
    leftMotifColor: leftMerged.leftMotifColor,
    leftMotifOpacity: leftMerged.leftMotifOpacity,
    leftMotifPosition: leftMerged.leftMotifPosition,
    leftMotifSize: leftMerged.leftMotifSize,
    leftCustomMotifPoints: leftMerged.leftCustomMotifPoints,
  });

  const legacyFromMotifs = syncLegacyFieldsFromHeroMotifs(heroMotifs);
  // Prefer explicit motif array as source of truth when present; otherwise keep merged scalars.
  const hasMotifsPatch = Array.isArray((record as { heroMotifs?: unknown }).heroMotifs);
  const syncedLegacy = hasMotifsPatch
    ? legacyFromMotifs
    : {
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
        motifColor,
        customMotifPoints: sanitizeMotifPoints(
          record.customMotifPoints !== undefined ? record.customMotifPoints : base.customMotifPoints
        ),
        motifPosition,
        motifPanelSize,
        leftMotifEnabled: leftMerged.leftMotifEnabled,
        leftMotifPattern: leftMerged.leftMotifPattern,
        leftMotifColor: leftMerged.leftMotifColor,
        leftMotifOpacity: leftMerged.leftMotifOpacity,
        leftMotifPosition: leftMerged.leftMotifPosition,
        leftMotifSize: leftMerged.leftMotifSize,
        leftCustomMotifPoints: leftMerged.leftCustomMotifPoints,
      };

  const typographyContext = {
    creatorNameColor: profileMerged.creatorNameColor,
    creatorNameSize: profileMerged.creatorNameSize,
    creatorNameFont: profileMerged.creatorNameFont,
    metaValueColor: metaMerged.metaValueColor,
    metaLabelColor: metaMerged.metaLabelColor,
    metaValueSize: metaMerged.metaValueSize,
    availabilityTextColor: availabilityMerged.availabilityTextColor,
  };

  const hasElementStylesPatch = record.elementStyles !== undefined;
  const hasLegacyTypographyPatch =
    'creatorNameColor' in record ||
    'creatorNameSize' in record ||
    'creatorNameFont' in record ||
    'metaValueColor' in record ||
    'metaLabelColor' in record ||
    'metaValueSize' in record ||
    'availabilityTextColor' in record;

  let elementStyles = normalizeHeroElementStyles(
    hasElementStylesPatch ? record.elementStyles : base.elementStyles,
    typographyContext
  );

  if (hasLegacyTypographyPatch && !hasElementStylesPatch) {
    elementStyles = syncHeroElementStylesFromLegacyPatch(elementStyles, patch, {
      ...base,
      ...profileMerged,
      ...metaMerged,
      ...availabilityMerged,
      ...copyMerged,
      ...headlineMerged,
      elementStyles,
    });
  }

  const typographyLegacySync = hasElementStylesPatch
    ? syncHeroLegacyTypographyFromElementStyles(elementStyles)
    : {};

  const merged: PortfolioHeroPresentationSettings = {
    heroLayoutFlipped:
      typeof record.heroLayoutFlipped === 'boolean' ? record.heroLayoutFlipped : base.heroLayoutFlipped,
    heroLayoutDivision: sanitizeHeroLayoutDivision(
      record.heroLayoutDivision,
      typeof record.heroLayoutFlipped === 'boolean'
        ? record.heroLayoutFlipped
          ? 'horizontal-copy-right'
          : 'horizontal-copy-left'
        : base.heroLayoutDivision ?? DEFAULT_HERO_LAYOUT_DIVISION
    ),
    heroVerticalFrameGapPx: sanitizeHeroVerticalFrameGapPx(
      record.heroVerticalFrameGapPx !== undefined
        ? record.heroVerticalFrameGapPx
        : base.heroVerticalFrameGapPx,
      DEFAULT_HERO_VERTICAL_FRAME_GAP_PX
    ),
    heroUltraWideColumns: sanitizeHeroUltraWideColumnLayout(
      record.heroUltraWideColumns !== undefined
        ? record.heroUltraWideColumns
        : base.heroUltraWideColumns
    ),
    heroCopyElementsLayout: sanitizeHeroCopyElementsLayout(
      record.heroCopyElementsLayout !== undefined
        ? record.heroCopyElementsLayout
        : base.heroCopyElementsLayout
    ),
    heroVisualFreeCell: sanitizeHeroVerticalCellPlacement(
      record.heroVisualFreeCell !== undefined
        ? record.heroVisualFreeCell
        : base.heroVisualFreeCell,
      DEFAULT_HERO_VISUAL_FREE_CELL
    ),
    motifShape: syncedLegacy.motifShape,
    motifLayout:
      motifLayout === 'centered' || motifLayout === 'full' ? motifLayout : base.motifLayout,
    motifColor: syncedLegacy.motifColor,
    customMotifPoints: syncedLegacy.customMotifPoints,
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
      ctaPlacement === 'below-tools' ||
      ctaPlacement === 'below-stats' ||
      ctaPlacement === 'above-stats' ||
      ctaPlacement === 'free-zone'
        ? ctaPlacement
        : base.ctaPlacement,
    showSecondaryCta:
      typeof record.showSecondaryCta === 'boolean'
        ? record.showSecondaryCta
        : base.showSecondaryCta,
    secondaryCtaLabel:
      typeof record.secondaryCtaLabel === 'string'
        ? record.secondaryCtaLabel
        : base.secondaryCtaLabel ?? DEFAULT_HERO_SECONDARY_CTA_LABEL,
    secondaryCtaTarget: isPortfolioHeroSecondaryCtaTarget(record.secondaryCtaTarget)
      ? record.secondaryCtaTarget
      : base.secondaryCtaTarget ?? 'work',
    secondaryCtaDesign:
      record.secondaryCtaDesign === 'pill-dark' ||
      record.secondaryCtaDesign === 'pill-outline' ||
      record.secondaryCtaDesign === 'pill-accent' ||
      record.secondaryCtaDesign === 'text-arrow'
        ? record.secondaryCtaDesign
        : base.secondaryCtaDesign ?? 'text-arrow',
    availabilityDesign:
      availabilityDesign === 'pill-live' ||
      availabilityDesign === 'pill-minimal' ||
      availabilityDesign === 'bordered' ||
      availabilityDesign === 'soft'
        ? availabilityDesign
        : base.availabilityDesign,
    availabilityPlacement: isHeroAvailabilityPlacement(availabilityPlacement)
      ? availabilityPlacement
      : base.availabilityPlacement,
    showAvailabilityBadge:
      typeof record.showAvailabilityBadge === 'boolean'
        ? record.showAvailabilityBadge
        : base.showAvailabilityBadge,
    showAvailabilityResponseTime:
      typeof record.showAvailabilityResponseTime === 'boolean'
        ? record.showAvailabilityResponseTime
        : base.showAvailabilityResponseTime,
    mobileAvailabilityPlacement: isHeroAvailabilityPlacement(record.mobileAvailabilityPlacement)
      ? record.mobileAvailabilityPlacement
      : base.mobileAvailabilityPlacement ?? base.availabilityPlacement,
    mobileAvailabilityAlign: isHeroMobileAlign(record.mobileAvailabilityAlign)
      ? record.mobileAvailabilityAlign
      : base.mobileAvailabilityAlign,
    mobileAlignHeadline: isHeroMobileAlign(record.mobileAlignHeadline)
      ? record.mobileAlignHeadline
      : base.mobileAlignHeadline,
    mobileAlignDescription: isHeroMobileAlign(record.mobileAlignDescription)
      ? record.mobileAlignDescription
      : base.mobileAlignDescription,
    mobileAlignTools: isHeroMobileAlign(record.mobileAlignTools)
      ? record.mobileAlignTools
      : base.mobileAlignTools,
    mobileAlignCta: isHeroMobileAlign(record.mobileAlignCta)
      ? record.mobileAlignCta
      : base.mobileAlignCta,
    desktopAvailabilityAlign: isHeroDesktopAlign(record.desktopAvailabilityAlign)
      ? record.desktopAvailabilityAlign
      : base.desktopAvailabilityAlign ?? 'auto',
    desktopAlignHeadline: isHeroDesktopAlign(record.desktopAlignHeadline)
      ? record.desktopAlignHeadline
      : base.desktopAlignHeadline ?? 'auto',
    desktopAlignDescription: isHeroDesktopAlign(record.desktopAlignDescription)
      ? record.desktopAlignDescription
      : base.desktopAlignDescription ?? 'auto',
    desktopAlignTools: isHeroDesktopAlign(record.desktopAlignTools)
      ? record.desktopAlignTools
      : base.desktopAlignTools ?? 'auto',
    desktopAlignCta: isHeroDesktopAlign(record.desktopAlignCta)
      ? record.desktopAlignCta
      : base.desktopAlignCta ?? 'auto',
    // Saves that predate the marker report 0 so the centering migration runs once.
    mobileAlignSettingsRevision:
      typeof record.mobileAlignSettingsRevision === 'number' &&
      Number.isFinite(record.mobileAlignSettingsRevision)
        ? Math.max(0, Math.floor(record.mobileAlignSettingsRevision))
        : 0,
    ...mergeHeroAvailabilityChrome(base, record),
    selectedTools,
    showToolsLabel:
      typeof record.showToolsLabel === 'boolean' ? record.showToolsLabel : base.showToolsLabel,
    toolsLabelText:
      typeof record.toolsLabelText === 'string' ? record.toolsLabelText : base.toolsLabelText,
    ctaBackgroundEnabled:
      typeof record.ctaBackgroundEnabled === 'boolean'
        ? record.ctaBackgroundEnabled
        : base.ctaBackgroundEnabled,
    ctaBackgroundColor: sanitizeAvailabilityHex(
      record.ctaBackgroundColor,
      base.ctaBackgroundColor
    ),
    ctaBorderEnabled:
      typeof record.ctaBorderEnabled === 'boolean'
        ? record.ctaBorderEnabled
        : base.ctaBorderEnabled,
    ctaBorderColor: sanitizeAvailabilityHex(record.ctaBorderColor, base.ctaBorderColor),
    ctaBorderWidth:
      record.ctaBorderWidth === 'none' ||
      record.ctaBorderWidth === 'thin' ||
      record.ctaBorderWidth === 'medium' ||
      record.ctaBorderWidth === 'thick'
        ? record.ctaBorderWidth
        : base.ctaBorderWidth,
    ctaBorderRadius:
      record.ctaBorderRadius === 'none' ||
      record.ctaBorderRadius === 'sm' ||
      record.ctaBorderRadius === 'md' ||
      record.ctaBorderRadius === 'lg' ||
      record.ctaBorderRadius === 'full'
        ? record.ctaBorderRadius
        : base.ctaBorderRadius,
    toolsIconBackgroundColor: sanitizeAvailabilityHex(
      record.toolsIconBackgroundColor,
      base.toolsIconBackgroundColor
    ),
    toolsIconBorderColor: sanitizeAvailabilityHex(
      record.toolsIconBorderColor,
      base.toolsIconBorderColor
    ),
    toolsIconBorderWidth:
      record.toolsIconBorderWidth === 'none' ||
      record.toolsIconBorderWidth === 'thin' ||
      record.toolsIconBorderWidth === 'medium' ||
      record.toolsIconBorderWidth === 'thick'
        ? record.toolsIconBorderWidth
        : base.toolsIconBorderWidth,
    toolsIconBorderRadius:
      record.toolsIconBorderRadius === 'none' ||
      record.toolsIconBorderRadius === 'sm' ||
      record.toolsIconBorderRadius === 'md' ||
      record.toolsIconBorderRadius === 'lg' ||
      record.toolsIconBorderRadius === 'full'
        ? record.toolsIconBorderRadius
        : base.toolsIconBorderRadius,
    motifPosition: syncedLegacy.motifPosition,
    motifPanelSize: syncedLegacy.motifPanelSize,
    heroMotifs,
    ...profileMerged,
    ...metaMerged,
    ...availabilityMerged,
    ...typographyLegacySync,
    ...leftMerged,
    leftMotifEnabled: syncedLegacy.leftMotifEnabled,
    leftMotifPattern: syncedLegacy.leftMotifPattern,
    leftMotifColor: syncedLegacy.leftMotifColor,
    leftMotifOpacity: syncedLegacy.leftMotifOpacity,
    leftMotifPosition: syncedLegacy.leftMotifPosition,
    leftMotifSize: syncedLegacy.leftMotifSize,
    leftCustomMotifPoints: syncedLegacy.leftCustomMotifPoints,
    ...copyMerged,
    ...headlineMerged,
    ...backgroundMerged,
    elementStyles,
    palette: mergeHeroPalette(base.palette ?? DEFAULT_HERO_PALETTE, record.palette),
    colorBindings: mergeHeroColorBindings(
      base.colorBindings ?? DEFAULT_HERO_COLOR_BINDINGS,
      record.colorBindings
    ),
    useHeroPalette:
      typeof record.useHeroPalette === 'boolean' ? record.useHeroPalette : base.useHeroPalette,
  };

  // One-time migration: saves that predate the stacked-align revision kept
  // left-aligned mobile copy — the hero now centers every element on
  // tablet/mobile by default. The stamped revision persists with the next
  // save, so alignment choices made after this reset are kept.
  if (merged.mobileAlignSettingsRevision < HERO_MOBILE_ALIGN_SETTINGS_REVISION) {
    merged.mobileAvailabilityAlign = 'center';
    merged.mobileAlignHeadline = 'center';
    merged.mobileAlignDescription = 'center';
    merged.mobileAlignTools = 'center';
    merged.mobileAlignCta = 'center';
    merged.mobileAlignSettingsRevision = HERO_MOBILE_ALIGN_SETTINGS_REVISION;
  }

  // Stats keep a visible outline when the frame is on (toggle-off stores width 0).
  const metaFrameBorderWidth =
    merged.showMetaFrame && merged.metaFrameBorderWidth <= 0 ? 1 : merged.metaFrameBorderWidth;

  // Manual mode: keep stored hex fields — do not overwrite from palette tokens.
  if (!merged.useHeroPalette) {
    return {
      ...merged,
      metaFrameBorderWidth,
    };
  }

  // Palette-locked groups (pairing only — each slot keeps its own binding otherwise):
  // - Contact CTA fill follows the headline specialty accent;
  // - availability text follows the blinking dot color.
  // Motif / portrait frame / mat / caption / stats borders are independent.
  const syncedBindings = mergeHeroColorBindings(merged.colorBindings, {
    ctaBackground: merged.colorBindings.headlineAccent,
    availabilityText: merged.colorBindings.availabilityDot,
  });
  // Palette mode: push tokens into EVERY bound hex field (section background,
  // motif, portrait, stats, CTA, availability, element text colors). This also
  // repaints colors that were edited manually while the palette was off.
  const paletteSynced = applyHeroPaletteToPresentation({
    ...merged,
    colorBindings: syncedBindings,
  });

  return {
    ...merged,
    ...paletteSynced,
    metaFrameBorderWidth,
  };
}
