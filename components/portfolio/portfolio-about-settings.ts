import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  mergeServicesCardBackgroundSettings,
  type PortfolioServicesCardBackgroundSettings,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  mergeServicesCardDecorSettings,
  type PortfolioServicesCardDecorSettings,
} from '@/components/portfolio/portfolio-services-card-decor-settings';
import type { PortfolioCardFrameSettings } from '@/components/portfolio/portfolio-card-frame-settings-fields';
import {
  servicesCardPaddingClass,
  servicesCardRadiusClass,
  type PortfolioServicesCardBorder,
  type PortfolioServicesCardPadding,
  type PortfolioServicesCardRadius,
} from '@/components/portfolio/portfolio-services-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import {
  createElementTextStyle,
  normalizeElementStylesRecord,
  patchElementStylesRecord,
  DEFAULT_ELEMENT_BODY_COLOR,
  DEFAULT_ELEMENT_MUTED_COLOR,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';

export type PortfolioAboutTitlePreset = 'about' | 'my-story' | 'who-i-am' | 'behind-the-work' | 'custom';

export type PortfolioAboutSubtitlePreset = 'default' | 'short' | 'personal' | 'minimal' | 'custom';

export type PortfolioAboutHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioAboutHeaderAlignment = 'left' | 'center';

export type PortfolioAboutLayoutMode = 'sidebar-right' | 'sidebar-left' | 'full-width';

export type PortfolioAboutFullWidthPanelPlacement = 'above-stats' | 'below-stats' | 'below-content';

export type PortfolioAboutStatsDesign = 'unified-band' | 'featured' | 'editorial-list';

export type PortfolioAboutStatsGroupMode = 'unified' | 'separated';

export type PortfolioAboutSidePanelDesign = 'framed' | 'cards' | 'minimal';

export type PortfolioAboutSidePanelFullWidthLayout =
  | 'stacked'
  | 'grid-2'
  | 'grid-3'
  | 'horizontal'
  | 'inline-band';

export type PortfolioAboutWhyMeDesign = 'editorial' | 'compact' | 'minimal' | 'grid' | 'stacked';

export type PortfolioAboutWhyMeMediaPlacement =
  | 'alternate'
  | 'media-left'
  | 'media-right'
  | 'media-top'
  | 'text-only';

export type PortfolioAboutWhyMeContentAlign = 'left' | 'center' | 'right';

export type PortfolioAboutWhyMeHeadingPreset =
  | 'default'
  | 'why-work-with-me'
  | 'my-approach'
  | 'strengths'
  | 'value'
  | 'custom';

export type PortfolioAboutWhyMeHeadingSize = 'sm' | 'md' | 'lg';

export type PortfolioAboutWhyMeGap = 'sm' | 'md' | 'lg';

export type PortfolioAboutStatsFont = PortfolioAboutHeaderFont;

export type PortfolioAboutStatsValueSize = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioAboutStatsLabelSize = 'xs' | 'sm' | 'md';

export type PortfolioAboutStatsValueWeight = 'semibold' | 'bold' | 'extrabold' | 'black';

export type PortfolioAboutStatsLabelWeight = 'medium' | 'semibold' | 'bold';

export type PortfolioAboutStatsLabelTracking = 'tight' | 'normal' | 'wide' | 'extra';

export type PortfolioAboutStatsIconSize = 'sm' | 'md' | 'lg';

export type AboutStatValueSizeContext = 'featured' | 'bar' | 'band' | 'editorial';

/** Which about text element can be styled independently (color, font, size, weight). */
export type PortfolioAboutStyleTarget =
  | 'whyMeBody'
  | 'whyMeBullet'
  | 'sideLabel'
  | 'sideTitle'
  | 'sideSubtitle';

export type PortfolioAboutElementStyles = Record<PortfolioAboutStyleTarget, PortfolioElementTextStyle>;

export type PortfolioAboutPresentationSettings = PortfolioSectionBackgroundSettings &
  PortfolioServicesCardBackgroundSettings & {
  titlePreset: PortfolioAboutTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioAboutSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioAboutHeaderFont;
  subtitleFont: PortfolioAboutHeaderFont;
  titleColor: string;
  subtitleColor: string;
  subtitleSerif: boolean;
  headerAlignment: PortfolioAboutHeaderAlignment;
  layoutMode: PortfolioAboutLayoutMode;
  fullWidthPanelPlacement: PortfolioAboutFullWidthPanelPlacement;
  statsDesign: PortfolioAboutStatsDesign;
  statsGroupMode: PortfolioAboutStatsGroupMode;
  statsGap: number;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  statsValueColor: string;
  statsLabelColor: string;
  statsIconColor: string;
  statsUseAccentForRating: boolean;
  statsValueFont: PortfolioAboutStatsFont;
  statsLabelFont: PortfolioAboutStatsFont;
  statsValueSize: PortfolioAboutStatsValueSize;
  statsLabelSize: PortfolioAboutStatsLabelSize;
  statsValueWeight: PortfolioAboutStatsValueWeight;
  statsLabelWeight: PortfolioAboutStatsLabelWeight;
  statsLabelUppercase: boolean;
  statsLabelTracking: PortfolioAboutStatsLabelTracking;
  statsIconSize: PortfolioAboutStatsIconSize;
  showStatYears: boolean;
  showStatContent: boolean;
  showStatLanguages: boolean;
  showStatRating: boolean;
  statsAutoCenter: boolean;
  sidePanelDesign: PortfolioAboutSidePanelDesign;
  sidePanelFullWidthLayout: PortfolioAboutSidePanelFullWidthLayout;
  sidePanelBorder: PortfolioServicesCardBorder;
  sidePanelBorderColor: string;
  /** Bumps when factory side-panel defaults change (borderless profile card, etc.). */
  sidePanelSettingsRevision: number;
  sidePanelBackgroundEnabled: boolean;
  sidePanelBackgroundColor: string;
  sidePanelBorderRadius: PortfolioServicesCardRadius;
  sidePanelPadding: PortfolioServicesCardPadding;
  sidePanelBackgroundFill: PortfolioServicesCardBackgroundSettings['cardBackgroundFill'];
  sidePanelBackgroundColorA: string;
  sidePanelBackgroundColorB: string;
  sidePanelBackgroundSplitAxis: PortfolioServicesCardBackgroundSettings['cardBackgroundSplitAxis'];
  sidePanelBackgroundSplitPosition: number;
  sidePanelDividerEnabled: boolean;
  sidePanelDividerShape: PortfolioServicesCardBackgroundSettings['cardDividerShape'];
  sidePanelDividerAngle: number;
  sidePanelDividerCurveDepth: number;
  sidePanelDividerColor: string;
  sidePanelDividerThickness: number;
  sidePanelDividerOpacity: number;
  showSidePanelLocation: boolean;
  showSidePanelLanguages: boolean;
  showSidePanelGender: boolean;
  showSidePanelMemberSince: boolean;
  showSidePanelAvailability: boolean;
  /** Reply / response-time line under availability in the side panel. */
  showSidePanelResponseTime: boolean;
  sidePanelAutoCenter: boolean;
  whyMeMediaPlacement: PortfolioAboutWhyMeMediaPlacement;
  whyMeContentAlign: PortfolioAboutWhyMeContentAlign;
  whyMeGap: PortfolioAboutWhyMeGap;
  whyMeBorder: PortfolioServicesCardBorder;
  whyMeBorderColor: string;
  whyMeBackgroundEnabled: boolean;
  whyMeBackgroundColor: string;
  whyMeBorderRadius: PortfolioServicesCardRadius;
  whyMePadding: PortfolioServicesCardPadding;
  whyMeBackgroundFill: PortfolioServicesCardBackgroundSettings['cardBackgroundFill'];
  whyMeBackgroundColorA: string;
  whyMeBackgroundColorB: string;
  whyMeBackgroundSplitAxis: PortfolioServicesCardBackgroundSettings['cardBackgroundSplitAxis'];
  whyMeBackgroundSplitPosition: number;
  whyMeDividerEnabled: boolean;
  whyMeDividerShape: PortfolioServicesCardBackgroundSettings['cardDividerShape'];
  whyMeDividerAngle: number;
  whyMeDividerCurveDepth: number;
  whyMeDividerColor: string;
  whyMeDividerThickness: number;
  whyMeDividerOpacity: number;
  whyMeDecorEnabled: boolean;
  whyMeDecorShape: PortfolioServicesCardDecorSettings['cardDecorShape'];
  whyMeDecorColor: string;
  whyMeDecorOpacity: number;
  whyMeDecorSize: number;
  whyMeDecorX: number;
  whyMeDecorY: number;
  whyMeDecorRotation: number;
  whyMeDecorAlternation: PortfolioServicesCardDecorSettings['cardDecorAlternation'];
  whyMeDesign: PortfolioAboutWhyMeDesign;
  whyMeHeadingPreset: PortfolioAboutWhyMeHeadingPreset;
  whyMeHeadingCustom: string;
  whyMeHeadingAlignment: PortfolioAboutWhyMeContentAlign;
  whyMeHeadingFont: PortfolioAboutHeaderFont;
  whyMeHeadingColor: string;
  whyMeHeadingSize: PortfolioAboutWhyMeHeadingSize;
  whyMeHeadingUppercase: boolean;
  accentColor: string;
  showStats: boolean;
  showSidePanel: boolean;
  showWhyMe: boolean;
  showWhyMeHeading: boolean;
  whyMeHeading: string;
  /** Per-element color, font, size, and weight for Why me text and side panel rows. */
  elementStyles: PortfolioAboutElementStyles;
};

export type PortfolioAboutSectionSettings = PortfolioSectionCopy & PortfolioAboutPresentationSettings;

export const DEFAULT_ABOUT_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_ABOUT_SUBTITLE_COLOR = '#737373';
export const DEFAULT_ABOUT_ACCENT_COLOR = '#ea580c';
export const DEFAULT_ABOUT_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_ABOUT_CARD_BACKGROUND_COLOR = '#f5f5f5';
export const DEFAULT_ABOUT_STATS_VALUE_COLOR = '#0a0a0a';
export const DEFAULT_ABOUT_STATS_LABEL_COLOR = '#525252';
export const DEFAULT_ABOUT_STATS_ICON_COLOR = '#525252';
export const DEFAULT_ABOUT_SIDE_PANEL_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR = '#f5f5f5';
/** v2: profile side panel is borderless by default. */
export const ABOUT_SIDE_PANEL_SETTINGS_REVISION = 2;
export const DEFAULT_ABOUT_WHY_ME_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_ABOUT_WHY_ME_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_ABOUT_WHY_ME_HEADING_COLOR = '#a3a3a3';
/** Previous factory default (soft accent circle on every card) — migrate off. */
const LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR: Pick<
  PortfolioAboutPresentationSettings,
  | 'whyMeDecorEnabled'
  | 'whyMeDecorShape'
  | 'whyMeDecorColor'
  | 'whyMeDecorOpacity'
  | 'whyMeDecorSize'
  | 'whyMeDecorX'
  | 'whyMeDecorY'
  | 'whyMeDecorRotation'
  | 'whyMeDecorAlternation'
> = {
  whyMeDecorEnabled: true,
  whyMeDecorShape: 'circle',
  whyMeDecorColor: DEFAULT_ABOUT_ACCENT_COLOR,
  whyMeDecorOpacity: 8,
  whyMeDecorSize: 48,
  whyMeDecorX: 92,
  whyMeDecorY: 8,
  whyMeDecorRotation: 0,
  whyMeDecorAlternation: 'none',
};

const DEFAULT_ABOUT_WHY_ME_DECOR: typeof LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR = {
  ...LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR,
  whyMeDecorEnabled: false,
};

function isLegacyDefaultWhyMeDecor(
  p: Pick<
    PortfolioAboutPresentationSettings,
    | 'whyMeDecorEnabled'
    | 'whyMeDecorShape'
    | 'whyMeDecorColor'
    | 'whyMeDecorOpacity'
    | 'whyMeDecorSize'
    | 'whyMeDecorX'
    | 'whyMeDecorY'
    | 'whyMeDecorRotation'
    | 'whyMeDecorAlternation'
  >
): boolean {
  const hex = (value: string) => value.trim().toLowerCase();
  return (
    p.whyMeDecorEnabled === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorEnabled &&
    p.whyMeDecorShape === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorShape &&
    hex(p.whyMeDecorColor) === hex(LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorColor) &&
    p.whyMeDecorOpacity === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorOpacity &&
    p.whyMeDecorSize === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorSize &&
    p.whyMeDecorX === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorX &&
    p.whyMeDecorY === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorY &&
    p.whyMeDecorRotation === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorRotation &&
    p.whyMeDecorAlternation === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorAlternation
  );
}

const DEFAULT_ABOUT_WHY_ME_BACKGROUND: Pick<
  PortfolioAboutPresentationSettings,
  | 'whyMeBackgroundFill'
  | 'whyMeBackgroundColorA'
  | 'whyMeBackgroundColorB'
  | 'whyMeBackgroundSplitAxis'
  | 'whyMeBackgroundSplitPosition'
  | 'whyMeDividerEnabled'
  | 'whyMeDividerShape'
  | 'whyMeDividerAngle'
  | 'whyMeDividerCurveDepth'
  | 'whyMeDividerColor'
  | 'whyMeDividerThickness'
  | 'whyMeDividerOpacity'
> = {
  whyMeBackgroundFill: 'solid',
  whyMeBackgroundColorA: '#ffffff',
  whyMeBackgroundColorB: '#fafafa',
  whyMeBackgroundSplitAxis: 'y',
  whyMeBackgroundSplitPosition: 55,
  whyMeDividerEnabled: false,
  whyMeDividerShape: 'straight',
  whyMeDividerAngle: 165,
  whyMeDividerCurveDepth: 14,
  whyMeDividerColor: '#e5e5e5',
  whyMeDividerThickness: 1,
  whyMeDividerOpacity: 70,
};

const DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND: Pick<
  PortfolioAboutPresentationSettings,
  | 'sidePanelBackgroundFill'
  | 'sidePanelBackgroundColorA'
  | 'sidePanelBackgroundColorB'
  | 'sidePanelBackgroundSplitAxis'
  | 'sidePanelBackgroundSplitPosition'
  | 'sidePanelDividerEnabled'
  | 'sidePanelDividerShape'
  | 'sidePanelDividerAngle'
  | 'sidePanelDividerCurveDepth'
  | 'sidePanelDividerColor'
  | 'sidePanelDividerThickness'
  | 'sidePanelDividerOpacity'
> = {
  sidePanelBackgroundFill: 'solid',
  sidePanelBackgroundColorA: '#f5f5f5',
  sidePanelBackgroundColorB: '#f5f5f5',
  sidePanelBackgroundSplitAxis: 'x',
  sidePanelBackgroundSplitPosition: 62,
  sidePanelDividerEnabled: false,
  sidePanelDividerShape: 'diagonal',
  sidePanelDividerAngle: 155,
  sidePanelDividerCurveDepth: 14,
  sidePanelDividerColor: '#e5e5e5',
  sidePanelDividerThickness: 1,
  sidePanelDividerOpacity: 70,
};

/** Previous factory default (white / gray diagonal split) — migrate to solid gray. */
function isLegacyDefaultSidePanelBackground(
  p: Pick<
    PortfolioAboutPresentationSettings,
    | 'sidePanelBackgroundFill'
    | 'sidePanelBackgroundColorA'
    | 'sidePanelBackgroundColorB'
    | 'sidePanelBackgroundSplitPosition'
    | 'sidePanelDividerEnabled'
    | 'sidePanelDividerShape'
    | 'sidePanelDividerAngle'
  >
): boolean {
  const hex = (value: string) => value.trim().toLowerCase();
  return (
    p.sidePanelBackgroundFill === 'split' &&
    hex(p.sidePanelBackgroundColorA) === '#ffffff' &&
    hex(p.sidePanelBackgroundColorB) === '#f5f5f5' &&
    p.sidePanelBackgroundSplitPosition === 62 &&
    p.sidePanelDividerEnabled === true &&
    p.sidePanelDividerShape === 'diagonal' &&
    p.sidePanelDividerAngle === 155
  );
}

const DEFAULT_ABOUT_STATS_CARD_BACKGROUND: PortfolioServicesCardBackgroundSettings = {
  ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  cardBackgroundColorA: '#f5f5f5',
  cardBackgroundColorB: '#f5f5f5',
  cardDividerColor: '#e5e5e5',
  cardDividerEnabled: false,
};

/** Previous factory default (black cards + white values) — migrate to gray + black text. */
export function isLegacyDefaultAboutStatsCard(
  p: Pick<PortfolioAboutPresentationSettings, 'cardBackgroundColor' | 'statsValueColor'>
): boolean {
  const hex = (value: string) => value.trim().toLowerCase();
  return hex(p.cardBackgroundColor) === '#0a0a0a' && hex(p.statsValueColor) === '#ffffff';
}

export function withDefaultAboutStatsCardColors<T extends PortfolioAboutPresentationSettings>(
  p: T
): T {
  return {
    ...p,
    ...DEFAULT_ABOUT_STATS_CARD_BACKGROUND,
    cardBorderColor: DEFAULT_ABOUT_CARD_BORDER_COLOR,
    cardBackgroundColor: DEFAULT_ABOUT_CARD_BACKGROUND_COLOR,
    statsValueColor: DEFAULT_ABOUT_STATS_VALUE_COLOR,
    statsLabelColor: DEFAULT_ABOUT_STATS_LABEL_COLOR,
    statsIconColor: DEFAULT_ABOUT_STATS_ICON_COLOR,
  };
}

/** Restore light stats text on dark ink cards (Noir / Blanc contrast). */
export function withNoirReadableAboutStatsColors<T extends PortfolioAboutPresentationSettings>(
  p: T
): T {
  return {
    ...p,
    statsValueColor: '#ffffff',
    statsLabelColor: '#a3a3a3',
    statsIconColor: '#a3a3a3',
    statsUseAccentForRating: false,
  };
}

function hexLuminance(hex: string): number {
  const body = hex.replace('#', '').trim();
  const full =
    body.length === 3
      ? body
          .split('')
          .map((ch) => `${ch}${ch}`)
          .join('')
      : body.slice(0, 6);
  if (full.length < 6) return 1;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;
  if (![r, g, b].every(Number.isFinite)) return 1;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Dark card + dark value text — illegible on Noir ink stats. */
export function isIllegibleDarkAboutStatsCard(
  p: Pick<PortfolioAboutPresentationSettings, 'cardBackgroundColor' | 'statsValueColor' | 'accentColor' | 'statsUseAccentForRating'>
): boolean {
  const bg = hexLuminance(p.cardBackgroundColor);
  if (bg >= 0.28) return false;
  const value = hexLuminance(p.statsValueColor);
  if (value < 0.4) return true;
  if (p.statsUseAccentForRating && hexLuminance(p.accentColor) < 0.35) return true;
  return false;
}

export const ABOUT_STYLE_TARGET_IDS: PortfolioAboutStyleTarget[] = [
  'whyMeBody',
  'whyMeBullet',
  'sideLabel',
  'sideTitle',
  'sideSubtitle',
];

export const DEFAULT_ABOUT_ELEMENT_STYLES: PortfolioAboutElementStyles = {
  whyMeBody: createElementTextStyle({ color: DEFAULT_ELEMENT_BODY_COLOR, size: 'md' }),
  whyMeBullet: createElementTextStyle({ color: DEFAULT_ELEMENT_BODY_COLOR, size: 'sm' }),
  sideLabel: createElementTextStyle({
    color: DEFAULT_ABOUT_ACCENT_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  sideTitle: createElementTextStyle({ color: DEFAULT_ABOUT_TITLE_COLOR, size: 'md', bold: true }),
  sideSubtitle: createElementTextStyle({ color: DEFAULT_ELEMENT_MUTED_COLOR, size: 'sm' }),
};

export const PORTFOLIO_ABOUT_STYLE_TARGET_OPTIONS: {
  value: PortfolioAboutStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'whyMeBody', label: 'Why me text', description: 'Paragraph text inside each Why me block.' },
  { value: 'whyMeBullet', label: 'Why me bullets', description: 'Bullet list items inside Why me blocks.' },
  {
    value: 'sideLabel',
    label: 'Side panel label',
    description: 'Small caption above each profile side panel item (LOCATION, LANGUAGES…).',
  },
  {
    value: 'sideTitle',
    label: 'Side panel title',
    description: 'Main value line in the profile side panel.',
  },
  {
    value: 'sideSubtitle',
    label: 'Side panel subtitle',
    description: 'Secondary line under the side panel title.',
  },
];

export const DEFAULT_ABOUT_PRESENTATION: PortfolioAboutPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  ...DEFAULT_ABOUT_STATS_CARD_BACKGROUND,
  titlePreset: 'about',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'serif',
  titleColor: DEFAULT_ABOUT_TITLE_COLOR,
  subtitleColor: DEFAULT_ABOUT_SUBTITLE_COLOR,
  subtitleSerif: true,
  headerAlignment: 'left',
  layoutMode: 'sidebar-right',
  fullWidthPanelPlacement: 'below-content',
  statsDesign: 'unified-band',
  statsGroupMode: 'separated',
  statsGap: 20,
  cardBorder: 'soft',
  cardBorderColor: DEFAULT_ABOUT_CARD_BORDER_COLOR,
  cardBackgroundEnabled: true,
  cardBackgroundColor: DEFAULT_ABOUT_CARD_BACKGROUND_COLOR,
  cardBorderRadius: 'md',
  cardPadding: 'md',
  statsValueColor: DEFAULT_ABOUT_STATS_VALUE_COLOR,
  statsLabelColor: DEFAULT_ABOUT_STATS_LABEL_COLOR,
  statsIconColor: DEFAULT_ABOUT_STATS_ICON_COLOR,
  statsUseAccentForRating: true,
  statsValueFont: 'sans',
  statsLabelFont: 'sans',
  statsValueSize: 'lg',
  statsLabelSize: 'xs',
  statsValueWeight: 'extrabold',
  statsLabelWeight: 'bold',
  statsLabelUppercase: true,
  statsLabelTracking: 'extra',
  statsIconSize: 'md',
  showStatYears: true,
  showStatContent: true,
  showStatLanguages: true,
  showStatRating: true,
  statsAutoCenter: false,
  sidePanelDesign: 'framed',
  sidePanelFullWidthLayout: 'stacked',
  sidePanelBorder: 'none',
  sidePanelBorderColor: DEFAULT_ABOUT_SIDE_PANEL_BORDER_COLOR,
  sidePanelSettingsRevision: ABOUT_SIDE_PANEL_SETTINGS_REVISION,
  sidePanelBackgroundEnabled: true,
  sidePanelBackgroundColor: DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR,
  sidePanelBorderRadius: 'lg',
  sidePanelPadding: 'md',
  ...DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND,
  showSidePanelLocation: true,
  showSidePanelLanguages: true,
  showSidePanelGender: true,
  showSidePanelMemberSince: true,
  showSidePanelAvailability: true,
  showSidePanelResponseTime: false,
  sidePanelAutoCenter: false,
  whyMeMediaPlacement: 'alternate',
  whyMeContentAlign: 'left',
  whyMeGap: 'md',
  whyMeBorder: 'soft',
  whyMeBorderColor: DEFAULT_ABOUT_WHY_ME_BORDER_COLOR,
  whyMeBackgroundEnabled: true,
  whyMeBackgroundColor: DEFAULT_ABOUT_WHY_ME_BACKGROUND_COLOR,
  whyMeBorderRadius: 'lg',
  whyMePadding: 'lg',
  ...DEFAULT_ABOUT_WHY_ME_BACKGROUND,
  ...DEFAULT_ABOUT_WHY_ME_DECOR,
  whyMeDesign: 'editorial',
  whyMeHeadingPreset: 'default',
  whyMeHeadingCustom: '',
  whyMeHeadingAlignment: 'left',
  whyMeHeadingFont: 'sans',
  whyMeHeadingColor: DEFAULT_ABOUT_WHY_ME_HEADING_COLOR,
  whyMeHeadingSize: 'sm',
  whyMeHeadingUppercase: true,
  accentColor: DEFAULT_ABOUT_ACCENT_COLOR,
  showStats: false,
  showSidePanel: true,
  showWhyMe: true,
  showWhyMeHeading: true,
  whyMeHeading: 'Why work with me',
  elementStyles: DEFAULT_ABOUT_ELEMENT_STYLES,
};

export const PORTFOLIO_ABOUT_TITLE_PRESET_OPTIONS: {
  value: PortfolioAboutTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'about', label: 'About', description: 'Classic section label.' },
  { value: 'my-story', label: 'My story', description: 'Personal narrative tone.' },
  { value: 'who-i-am', label: 'Who I am', description: 'Human and approachable.' },
  { value: 'behind-the-work', label: 'Behind the work', description: 'Process and background focus.' },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_ABOUT_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioAboutSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One line about approach and background.' },
  { value: 'personal', label: 'Personal', description: 'Warmer, relationship-focused line.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_ABOUT_HEADER_FONT_OPTIONS: {
  value: PortfolioAboutHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_ABOUT_LAYOUT_MODE_OPTIONS: {
  value: PortfolioAboutLayoutMode;
  label: string;
  description: string;
}[] = [
  { value: 'sidebar-right', label: 'Sidebar right', description: 'Main content left, profile panel right.' },
  { value: 'sidebar-left', label: 'Sidebar left', description: 'Profile panel on the left.' },
  { value: 'full-width', label: 'Full width', description: 'No sidebar column — panel stacks below.' },
];

export const PORTFOLIO_ABOUT_FULL_WIDTH_PANEL_PLACEMENT_OPTIONS: {
  value: PortfolioAboutFullWidthPanelPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'above-stats',
    label: 'Au-dessus des stats',
    description: 'Panneau profil placé entre le titre et la rangée de stats.',
  },
  {
    value: 'below-stats',
    label: 'Sous les stats',
    description: 'Juste après les stats, avant Why me.',
  },
  {
    value: 'below-content',
    label: 'Après le contenu',
    description: 'Sous Why me — position par défaut en pleine largeur.',
  },
];

export const PORTFOLIO_ABOUT_STATS_DESIGN_OPTIONS: {
  value: PortfolioAboutStatsDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'unified-band',
    label: 'Bande unifiée',
    description: 'Une seule barre avec séparateurs verticaux — 4 stats alignées.',
  },
  {
    value: 'featured',
    label: 'Stat en vedette',
    description: 'Note / rating mise en avant à gauche, autres stats en barres à droite.',
  },
  {
    value: 'editorial-list',
    label: 'Liste éditoriale',
    description: 'Icônes et libellés inline, sans grands cadres.',
  },
];

export const PORTFOLIO_ABOUT_STATS_GROUP_MODE_OPTIONS: {
  value: PortfolioAboutStatsGroupMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'unified',
    label: 'Bande unifiée',
    description: 'Cartes rapprochées — même style séparé, espacement plus serré.',
  },
  {
    value: 'separated',
    label: 'Cartes séparées',
    description: 'Chaque stat dans son propre cadre — espacement réglable (défaut).',
  },
];

export const PORTFOLIO_ABOUT_STATS_VALUE_SIZE_OPTIONS: {
  value: PortfolioAboutStatsValueSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'S', description: 'Chiffres compacts.' },
  { value: 'md', label: 'M', description: 'Taille équilibrée.' },
  { value: 'lg', label: 'L', description: 'Valeurs bien visibles — défaut.' },
  { value: 'xl', label: 'XL', description: 'Très grand — idéal stat en vedette.' },
];

export const PORTFOLIO_ABOUT_STATS_LABEL_SIZE_OPTIONS: {
  value: PortfolioAboutStatsLabelSize;
  label: string;
  description: string;
}[] = [
  { value: 'xs', label: 'XS', description: 'Petit libellé uppercase — défaut.' },
  { value: 'sm', label: 'S', description: 'Libellé légèrement plus grand.' },
  { value: 'md', label: 'M', description: 'Libellé lisible, style phrase.' },
];

export const PORTFOLIO_ABOUT_STATS_VALUE_WEIGHT_OPTIONS: {
  value: PortfolioAboutStatsValueWeight;
  label: string;
}[] = [
  { value: 'semibold', label: 'Semi-bold' },
  { value: 'bold', label: 'Bold' },
  { value: 'extrabold', label: 'Extra-bold' },
  { value: 'black', label: 'Black' },
];

export const PORTFOLIO_ABOUT_STATS_LABEL_WEIGHT_OPTIONS: {
  value: PortfolioAboutStatsLabelWeight;
  label: string;
}[] = [
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semi-bold' },
  { value: 'bold', label: 'Bold' },
];

export const PORTFOLIO_ABOUT_STATS_LABEL_TRACKING_OPTIONS: {
  value: PortfolioAboutStatsLabelTracking;
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Serré', description: 'Lettres rapprochées.' },
  { value: 'normal', label: 'Normal', description: 'Espacement standard.' },
  { value: 'wide', label: 'Large', description: 'Tracking modéré.' },
  { value: 'extra', label: 'Très large', description: 'Style uppercase éditorial.' },
];

export const PORTFOLIO_ABOUT_STATS_ICON_SIZE_OPTIONS: {
  value: PortfolioAboutStatsIconSize;
  label: string;
}[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

export const PORTFOLIO_ABOUT_SIDE_PANEL_DESIGN_OPTIONS: {
  value: PortfolioAboutSidePanelDesign;
  label: string;
  description: string;
}[] = [
  { value: 'framed', label: 'Framed panel', description: 'Single muted panel — current default.' },
  { value: 'cards', label: 'Separate cards', description: 'Each detail in its own card.' },
  { value: 'minimal', label: 'Minimal', description: 'Light dividers, no heavy surface.' },
];

export const PORTFOLIO_ABOUT_SIDE_PANEL_FULL_WIDTH_LAYOUT_OPTIONS: {
  value: PortfolioAboutSidePanelFullWidthLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Liste verticale',
    description: 'Infos empilées dans un seul cadre — idéal pleine largeur.',
  },
  {
    value: 'grid-2',
    label: 'Grille 2 colonnes',
    description: 'Deux colonnes équilibrées sur grand écran.',
  },
  {
    value: 'grid-3',
    label: 'Grille 3 colonnes',
    description: 'Disposition compacte sur toute la largeur.',
  },
  {
    value: 'horizontal',
    label: 'Ligne souple',
    description: 'Items côte à côte avec retour à la ligne.',
  },
  {
    value: 'inline-band',
    label: 'Bande horizontale',
    description: 'Une seule ligne avec séparateurs verticaux entre items.',
  },
];

export const PORTFOLIO_ABOUT_WHY_ME_DESIGN_OPTIONS: {
  value: PortfolioAboutWhyMeDesign;
  label: string;
  description: string;
}[] = [
  { value: 'editorial', label: 'Editorial', description: 'Numbered blocks with icons and media.' },
  { value: 'compact', label: 'Compact', description: 'Tighter cards, less decoration.' },
  { value: 'minimal', label: 'Minimal', description: 'Simple bordered blocks — text first.' },
  {
    value: 'grid',
    label: 'Grille portfolio',
    description: 'Cartes en grille 2 colonnes — média au-dessus du texte.',
  },
  {
    value: 'stacked',
    label: 'Stack portfolio',
    description: 'Grand visuel pleine largeur avec contenu en dessous.',
  },
];

export const PORTFOLIO_ABOUT_WHY_ME_MEDIA_PLACEMENT_OPTIONS: {
  value: PortfolioAboutWhyMeMediaPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'alternate', label: 'Alterné', description: 'Média à droite puis à gauche — défaut éditorial.' },
  { value: 'media-left', label: 'Média à gauche', description: 'Image toujours à gauche du texte.' },
  { value: 'media-right', label: 'Média à droite', description: 'Image toujours à droite du texte.' },
  { value: 'media-top', label: 'Média au-dessus', description: 'Image au-dessus du texte dans chaque carte.' },
  { value: 'text-only', label: 'Texte seul', description: 'Masquer les médias — texte et icônes uniquement.' },
];

export const PORTFOLIO_ABOUT_WHY_ME_CONTENT_ALIGN_OPTIONS: {
  value: PortfolioAboutWhyMeContentAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Texte aligné à gauche.' },
  { value: 'center', label: 'Centre', description: 'Contenu centré dans la carte.' },
  { value: 'right', label: 'Droite', description: 'Texte aligné à droite.' },
];

export const PORTFOLIO_ABOUT_WHY_ME_GAP_OPTIONS: {
  value: PortfolioAboutWhyMeGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Serré', description: 'Peu d’espace entre les blocs.' },
  { value: 'md', label: 'Moyen', description: 'Espacement équilibré.' },
  { value: 'lg', label: 'Large', description: 'Espacement généreux.' },
];

export const PORTFOLIO_ABOUT_WHY_ME_HEADING_PRESET_OPTIONS: {
  value: PortfolioAboutWhyMeHeadingPreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Personnalisé', description: 'Utilise le titre saisi ci-dessous.' },
  { value: 'why-work-with-me', label: 'Why work with me', description: 'Libellé par défaut en anglais.' },
  { value: 'my-approach', label: 'My approach', description: 'Approche et méthode.' },
  { value: 'strengths', label: 'Strengths', description: 'Points forts.' },
  { value: 'value', label: 'The value I bring', description: 'Valeur apportée au client.' },
  { value: 'custom', label: 'Custom', description: 'Votre propre titre.' },
];

export const PORTFOLIO_ABOUT_WHY_ME_HEADING_SIZE_OPTIONS: {
  value: PortfolioAboutWhyMeHeadingSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Petit' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Grand' },
];

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioAboutSubtitlePreset, 'default' | 'custom' | 'minimal'>,
  string
> = {
  short: 'Strengths, approach, and how I work with clients.',
  personal: 'A bit about me, how I work, and what you can expect when we collaborate.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function clampStatsGap(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(48, Math.max(0, Math.round(n)));
}

export function aboutStatsGapStyle(gap: number): CSSProperties | undefined {
  const px = clampStatsGap(gap, 0);
  if (px <= 0) return undefined;
  return { gap: `${px}px` };
}

export function resolveAboutSectionTitle(
  settings: Pick<PortfolioAboutSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  switch (settings.titlePreset) {
    case 'my-story':
      return 'MY STORY';
    case 'who-i-am':
      return 'WHO I AM';
    case 'behind-the-work':
      return 'BEHIND THE WORK';
    case 'custom':
      return settings.titleCustom.trim() || settings.title.trim() || 'About';
    default:
      return settings.title.trim() || 'About';
  }
}

export function resolveAboutSectionSubtitle(
  settings: Pick<PortfolioAboutSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'personal':
      return SUBTITLE_PRESET_COPY.personal;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function aboutHeaderFontClass(font: PortfolioAboutHeaderFont, kind: 'title' | 'subtitle'): string {
  if (kind === 'title') {
    switch (font) {
      case 'serif':
        return 'font-serif font-bold tracking-[-0.03em]';
      case 'display':
        return 'font-black uppercase tracking-[0.08em]';
      default:
        return 'font-extrabold tracking-[-0.04em]';
    }
  }
  switch (font) {
    case 'serif':
      return 'font-serif leading-relaxed';
    case 'display':
      return 'font-bold uppercase tracking-[0.1em]';
    default:
      return 'leading-relaxed';
  }
}

export function aboutHeaderFontStyle(
  font: PortfolioAboutHeaderFont,
  subtitleSerif: boolean,
  kind: 'title' | 'subtitle'
): CSSProperties | undefined {
  if (kind === 'subtitle' && subtitleSerif) return { fontFamily: "'Playfair Display', serif" };
  if (font === 'serif') return { fontFamily: "'Playfair Display', serif" };
  return undefined;
}

export function aboutTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_ABOUT_TITLE_COLOR) };
}

export function aboutSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_ABOUT_SUBTITLE_COLOR) };
}

export function aboutAccentColor(accent: string): string {
  return sanitizeHex(accent, DEFAULT_ABOUT_ACCENT_COLOR);
}

export function aboutMainGridClass(
  layoutMode: PortfolioAboutLayoutMode,
  hasSidebar: boolean
): string {
  if (!hasSidebar || layoutMode === 'full-width') return '';
  if (layoutMode === 'sidebar-left') {
    return 'lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-14';
  }
  return 'lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-14';
}

export function aboutStatEditorialSuffix(label: string): string {
  switch (label.toLowerCase()) {
    case 'years':
    case 'years exp.':
      return 'années';
    case 'content':
    case 'projects':
      return 'contenus';
    case 'languages':
      return 'langues';
    case 'rating':
      return 'note';
    case 'followers':
      return 'abonnés';
    default:
      return label.toLowerCase();
  }
}

export function isAboutRatingStat(label: string): boolean {
  return label.toLowerCase() === 'rating';
}

function aboutCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
  switch (border) {
    case 'soft':
      return 'border';
    case 'solid':
    case 'accent':
      return 'border-2';
    default:
      return 'border-0';
  }
}

export function aboutStatCardFrameClass(
  p: Pick<PortfolioAboutPresentationSettings, 'cardBorder' | 'cardBorderRadius' | 'cardPadding'>,
  options?: { includePadding?: boolean }
): string {
  const parts = [servicesCardRadiusClass(p.cardBorderRadius)];
  if (options?.includePadding !== false) {
    parts.push(servicesCardPaddingClass(p.cardPadding));
  }
  if (p.cardBorder !== 'none') {
    parts.push(aboutCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function aboutStatCardFrameStyle(p: PortfolioAboutPresentationSettings): CSSProperties {
  const style: CSSProperties = {};

  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_ABOUT_CARD_BACKGROUND_COLOR);
  }

  if (p.cardBorder === 'accent') {
    style.borderColor = sanitizeHex(p.accentColor, DEFAULT_ABOUT_ACCENT_COLOR);
  } else if (p.cardBorder === 'soft' || p.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.cardBorderColor, DEFAULT_ABOUT_CARD_BORDER_COLOR);
  }

  return style;
}

export function aboutStatFontStyle(font: PortfolioAboutStatsFont): CSSProperties | undefined {
  if (font === 'serif') return { fontFamily: "'Playfair Display', serif" };
  return undefined;
}

export function aboutStatFontClass(font: PortfolioAboutStatsFont, kind: 'value' | 'label'): string {
  if (font === 'display') return 'uppercase';
  if (font === 'serif' && kind === 'label') return 'leading-snug';
  return '';
}

export function aboutStatValueSizeClass(
  size: PortfolioAboutStatsValueSize,
  context: AboutStatValueSizeContext
): string {
  const featured = {
    sm: 'text-3xl sm:text-4xl',
    md: 'text-4xl sm:text-5xl',
    lg: 'text-5xl sm:text-6xl',
    xl: 'text-6xl sm:text-7xl',
  };
  const bar = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };
  const band = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-[2rem]',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };
  const editorial = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const map = { featured, bar, band, editorial }[context];
  return `${map[size]} leading-none tracking-[-0.04em]`;
}

export function aboutStatLabelSizeClass(size: PortfolioAboutStatsLabelSize): string {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-sm';
    default:
      return 'text-[10px]';
  }
}

export function aboutStatValueWeightClass(weight: PortfolioAboutStatsValueWeight): string {
  switch (weight) {
    case 'semibold':
      return 'font-semibold';
    case 'bold':
      return 'font-bold';
    case 'black':
      return 'font-black';
    default:
      return 'font-extrabold';
  }
}

export function aboutStatLabelWeightClass(weight: PortfolioAboutStatsLabelWeight): string {
  switch (weight) {
    case 'medium':
      return 'font-medium';
    case 'semibold':
      return 'font-semibold';
    default:
      return 'font-bold';
  }
}

export function aboutStatLabelTrackingClass(tracking: PortfolioAboutStatsLabelTracking): string {
  switch (tracking) {
    case 'tight':
      return 'tracking-tight';
    case 'normal':
      return 'tracking-normal';
    case 'wide':
      return 'tracking-[0.12em]';
    default:
      return 'tracking-[0.2em]';
  }
}

export function aboutStatIconSizeClass(size: PortfolioAboutStatsIconSize): string {
  switch (size) {
    case 'sm':
      return 'h-4 w-4';
    case 'lg':
      return 'h-7 w-7';
    default:
      return 'h-6 w-6';
  }
}

export function aboutStatValueColorStyle(
  settings: Pick<PortfolioAboutPresentationSettings, 'statsValueColor' | 'statsUseAccentForRating'>,
  statLabel: string,
  accent: string
): CSSProperties {
  const valueColor = sanitizeHex(settings.statsValueColor, DEFAULT_ABOUT_STATS_VALUE_COLOR);
  if (isAboutRatingStat(statLabel) && settings.statsUseAccentForRating) {
    const accentHex = sanitizeHex(accent, DEFAULT_ABOUT_ACCENT_COLOR);
    // Near-black accent on ink cards (Noir) is unreadable — fall back to value color.
    if (hexLuminance(accentHex) >= 0.35) {
      return { color: accentHex };
    }
  }
  return { color: valueColor };
}

export function aboutStatLabelColorStyle(labelColor: string): CSSProperties {
  return { color: sanitizeHex(labelColor, DEFAULT_ABOUT_STATS_LABEL_COLOR) };
}

export function aboutStatIconColorStyle(iconColor: string): CSSProperties {
  return { color: sanitizeHex(iconColor, DEFAULT_ABOUT_STATS_ICON_COLOR) };
}

export function aboutSidePanelCardBackgroundSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioServicesCardBackgroundSettings {
  if (isLegacyDefaultSidePanelBackground(p)) {
    return {
      cardBackgroundFill: 'solid',
      cardBackgroundColorA: DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR,
      cardBackgroundColorB: DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR,
      cardBackgroundSplitAxis: p.sidePanelBackgroundSplitAxis,
      cardBackgroundSplitPosition: p.sidePanelBackgroundSplitPosition,
      cardDividerEnabled: false,
      cardDividerShape: p.sidePanelDividerShape,
      cardDividerAngle: p.sidePanelDividerAngle,
      cardDividerCurveDepth: p.sidePanelDividerCurveDepth,
      cardDividerColor: p.sidePanelDividerColor,
      cardDividerThickness: p.sidePanelDividerThickness,
      cardDividerOpacity: p.sidePanelDividerOpacity,
    };
  }

  return {
    cardBackgroundFill: p.sidePanelBackgroundFill,
    cardBackgroundColorA: p.sidePanelBackgroundColorA,
    cardBackgroundColorB: p.sidePanelBackgroundColorB,
    cardBackgroundSplitAxis: p.sidePanelBackgroundSplitAxis,
    cardBackgroundSplitPosition: p.sidePanelBackgroundSplitPosition,
    cardDividerEnabled: p.sidePanelDividerEnabled,
    cardDividerShape: p.sidePanelDividerShape,
    cardDividerAngle: p.sidePanelDividerAngle,
    cardDividerCurveDepth: p.sidePanelDividerCurveDepth,
    cardDividerColor: p.sidePanelDividerColor,
    cardDividerThickness: p.sidePanelDividerThickness,
    cardDividerOpacity: p.sidePanelDividerOpacity,
  };
}

export function aboutSidePanelToCardFrameSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioCardFrameSettings {
  return {
    ...aboutSidePanelCardBackgroundSettings(p),
    cardBorder: p.sidePanelBorder,
    cardBorderColor: p.sidePanelBorderColor,
    cardBackgroundEnabled: p.sidePanelBackgroundEnabled,
    cardBackgroundColor: p.sidePanelBackgroundColor,
    cardBorderRadius: p.sidePanelBorderRadius,
    cardPadding: p.sidePanelPadding,
  };
}

export function patchAboutSidePanelFromCardFrame(
  patch: Partial<PortfolioCardFrameSettings>
): Partial<PortfolioAboutPresentationSettings> {
  const next: Partial<PortfolioAboutPresentationSettings> = {};
  if (patch.cardBorder !== undefined) next.sidePanelBorder = patch.cardBorder;
  if (patch.cardBorderColor !== undefined) next.sidePanelBorderColor = patch.cardBorderColor;
  if (patch.cardBackgroundEnabled !== undefined) next.sidePanelBackgroundEnabled = patch.cardBackgroundEnabled;
  if (patch.cardBackgroundColor !== undefined) next.sidePanelBackgroundColor = patch.cardBackgroundColor;
  if (patch.cardBorderRadius !== undefined) next.sidePanelBorderRadius = patch.cardBorderRadius;
  if (patch.cardPadding !== undefined) next.sidePanelPadding = patch.cardPadding;
  if (patch.cardBackgroundFill !== undefined) next.sidePanelBackgroundFill = patch.cardBackgroundFill;
  if (patch.cardBackgroundColorA !== undefined) next.sidePanelBackgroundColorA = patch.cardBackgroundColorA;
  if (patch.cardBackgroundColorB !== undefined) next.sidePanelBackgroundColorB = patch.cardBackgroundColorB;
  if (patch.cardBackgroundSplitAxis !== undefined) next.sidePanelBackgroundSplitAxis = patch.cardBackgroundSplitAxis;
  if (patch.cardBackgroundSplitPosition !== undefined) {
    next.sidePanelBackgroundSplitPosition = patch.cardBackgroundSplitPosition;
  }
  if (patch.cardDividerEnabled !== undefined) next.sidePanelDividerEnabled = patch.cardDividerEnabled;
  if (patch.cardDividerShape !== undefined) next.sidePanelDividerShape = patch.cardDividerShape;
  if (patch.cardDividerAngle !== undefined) next.sidePanelDividerAngle = patch.cardDividerAngle;
  if (patch.cardDividerCurveDepth !== undefined) next.sidePanelDividerCurveDepth = patch.cardDividerCurveDepth;
  if (patch.cardDividerColor !== undefined) next.sidePanelDividerColor = patch.cardDividerColor;
  if (patch.cardDividerThickness !== undefined) next.sidePanelDividerThickness = patch.cardDividerThickness;
  if (patch.cardDividerOpacity !== undefined) next.sidePanelDividerOpacity = patch.cardDividerOpacity;
  return next;
}

function mergeSidePanelBackgroundFields(
  base: PortfolioAboutPresentationSettings,
  record: Record<string, unknown>
): Pick<
  PortfolioAboutPresentationSettings,
  | 'sidePanelBackgroundFill'
  | 'sidePanelBackgroundColorA'
  | 'sidePanelBackgroundColorB'
  | 'sidePanelBackgroundSplitAxis'
  | 'sidePanelBackgroundSplitPosition'
  | 'sidePanelDividerEnabled'
  | 'sidePanelDividerShape'
  | 'sidePanelDividerAngle'
  | 'sidePanelDividerCurveDepth'
  | 'sidePanelDividerColor'
  | 'sidePanelDividerThickness'
  | 'sidePanelDividerOpacity'
> {
  const merged = mergeServicesCardBackgroundSettings(aboutSidePanelCardBackgroundSettings(base), {
    cardBackgroundFill: record.sidePanelBackgroundFill,
    cardBackgroundColorA: record.sidePanelBackgroundColorA,
    cardBackgroundColorB: record.sidePanelBackgroundColorB,
    cardBackgroundSplitAxis: record.sidePanelBackgroundSplitAxis,
    cardBackgroundSplitPosition: record.sidePanelBackgroundSplitPosition,
    cardDividerEnabled: record.sidePanelDividerEnabled,
    cardDividerShape: record.sidePanelDividerShape,
    cardDividerAngle: record.sidePanelDividerAngle,
    cardDividerCurveDepth: record.sidePanelDividerCurveDepth,
    cardDividerColor: record.sidePanelDividerColor,
    cardDividerThickness: record.sidePanelDividerThickness,
    cardDividerOpacity: record.sidePanelDividerOpacity,
  });

  return {
    sidePanelBackgroundFill: merged.cardBackgroundFill,
    sidePanelBackgroundColorA: merged.cardBackgroundColorA,
    sidePanelBackgroundColorB: merged.cardBackgroundColorB,
    sidePanelBackgroundSplitAxis: merged.cardBackgroundSplitAxis,
    sidePanelBackgroundSplitPosition: merged.cardBackgroundSplitPosition,
    sidePanelDividerEnabled: merged.cardDividerEnabled,
    sidePanelDividerShape: merged.cardDividerShape,
    sidePanelDividerAngle: merged.cardDividerAngle,
    sidePanelDividerCurveDepth: merged.cardDividerCurveDepth,
    sidePanelDividerColor: merged.cardDividerColor,
    sidePanelDividerThickness: merged.cardDividerThickness,
    sidePanelDividerOpacity: merged.cardDividerOpacity,
  };
}

export function aboutSidePanelFrameClass(
  p: Pick<
    PortfolioAboutPresentationSettings,
    'sidePanelBorder' | 'sidePanelBorderRadius' | 'sidePanelPadding'
  >,
  options?: { includePadding?: boolean }
): string {
  const parts = [servicesCardRadiusClass(p.sidePanelBorderRadius)];
  if (options?.includePadding !== false) {
    parts.push(servicesCardPaddingClass(p.sidePanelPadding));
  }
  if (p.sidePanelBorder !== 'none') {
    parts.push(aboutCardBorderWidthClass(p.sidePanelBorder));
    if (p.sidePanelBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function aboutSidePanelFrameStyle(p: PortfolioAboutPresentationSettings): CSSProperties {
  const style: CSSProperties = {};
  const legacySplit = isLegacyDefaultSidePanelBackground(p);
  const solidFill = p.sidePanelBackgroundFill === 'solid' || legacySplit;

  if (solidFill && p.sidePanelBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(
      legacySplit ? DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR : p.sidePanelBackgroundColor,
      DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR
    );
  }

  if (p.sidePanelBorder === 'accent') {
    style.borderColor = sanitizeHex(p.accentColor, DEFAULT_ABOUT_ACCENT_COLOR);
  } else if (p.sidePanelBorder === 'soft' || p.sidePanelBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.sidePanelBorderColor, DEFAULT_ABOUT_SIDE_PANEL_BORDER_COLOR);
  }

  return style;
}

export function aboutSidePanelFullWidthLayoutClass(
  layout: PortfolioAboutSidePanelFullWidthLayout
): string {
  switch (layout) {
    case 'grid-2':
      return 'grid gap-6 sm:grid-cols-2';
    case 'grid-3':
      return 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';
    case 'horizontal':
      return 'flex flex-wrap gap-x-10 gap-y-6';
    case 'inline-band':
      return 'flex flex-col divide-neutral-200/80 sm:flex-row sm:divide-x sm:divide-y-0';
    default:
      return 'flex flex-col';
  }
}

export function aboutSidePanelItemCellClass(
  layout: PortfolioAboutSidePanelFullWidthLayout,
  design: PortfolioAboutSidePanelDesign
): string {
  if (layout === 'inline-band') {
    return 'px-5 py-4 sm:flex-1 sm:px-6 sm:py-5';
  }
  if (layout !== 'stacked' && design !== 'minimal') {
    return 'min-w-0';
  }
  if (design === 'minimal') {
    return 'px-5 py-4';
  }
  return 'px-5 py-5 sm:px-6 sm:py-5';
}

export function aboutStatsAutoCenterClass(autoCenter: boolean): string {
  return autoCenter ? 'mx-auto w-fit max-w-full' : 'w-full';
}

export function aboutSidePanelAutoCenterClass(autoCenter: boolean, layout: PortfolioAboutSidePanelFullWidthLayout): string {
  if (!autoCenter) return '';
  if (layout === 'stacked') return 'mx-auto w-full max-w-2xl';
  return 'mx-auto w-fit max-w-full justify-items-center justify-center';
}

export function filterAboutStats(
  stats: Array<{ value: string; label: string }>,
  settings: Pick<
    PortfolioAboutPresentationSettings,
    'showStatYears' | 'showStatContent' | 'showStatLanguages' | 'showStatRating'
  >
): Array<{ value: string; label: string }> {
  return stats.filter((stat) => {
    switch (stat.label.toLowerCase()) {
      case 'years':
        return settings.showStatYears;
      case 'content':
        return settings.showStatContent;
      case 'languages':
        return settings.showStatLanguages;
      case 'rating':
        return settings.showStatRating;
      default:
        return true;
    }
  });
}

export type AboutSideInfoItemId = 'location' | 'languages' | 'gender' | 'member-since' | 'availability';

export function isAboutSideInfoItemVisible(
  id: AboutSideInfoItemId,
  settings: Pick<
    PortfolioAboutPresentationSettings,
    | 'showSidePanelLocation'
    | 'showSidePanelLanguages'
    | 'showSidePanelGender'
    | 'showSidePanelMemberSince'
    | 'showSidePanelAvailability'
  >
): boolean {
  switch (id) {
    case 'location':
      return settings.showSidePanelLocation;
    case 'languages':
      return settings.showSidePanelLanguages;
    case 'gender':
      return settings.showSidePanelGender;
    case 'member-since':
      return settings.showSidePanelMemberSince;
    case 'availability':
      return settings.showSidePanelAvailability;
    default:
      return true;
  }
}

export function aboutSidePanelShellClass(design: PortfolioAboutSidePanelDesign): string {
  switch (design) {
    case 'cards':
      return 'space-y-3';
    case 'minimal':
      return 'divide-y divide-neutral-200/80 rounded-2xl border border-neutral-200/60 bg-white/50';
    default:
      return 'overflow-hidden rounded-[1.35rem] border border-neutral-200/80 pf-muted-card-gradient shadow-sm';
  }
}

export function aboutWhyMeBlockClass(design: PortfolioAboutWhyMeDesign): string {
  switch (design) {
    case 'grid':
    case 'stacked':
      return 'group relative h-full transition duration-200';
    default:
      return 'group relative transition duration-200';
  }
}

const WHY_ME_HEADING_PRESET_COPY: Record<
  Exclude<PortfolioAboutWhyMeHeadingPreset, 'default' | 'custom'>,
  string
> = {
  'why-work-with-me': 'Why work with me',
  'my-approach': 'My approach',
  strengths: 'Strengths',
  value: 'The value I bring',
};

export function resolveWhyMeHeading(
  settings: Pick<
    PortfolioAboutPresentationSettings,
    'whyMeHeadingPreset' | 'whyMeHeadingCustom' | 'whyMeHeading'
  >
): string {
  switch (settings.whyMeHeadingPreset) {
    case 'custom':
      return settings.whyMeHeadingCustom.trim() || settings.whyMeHeading.trim() || 'Why work with me';
    case 'why-work-with-me':
    case 'my-approach':
    case 'strengths':
    case 'value':
      return WHY_ME_HEADING_PRESET_COPY[settings.whyMeHeadingPreset];
    default:
      return settings.whyMeHeading.trim() || 'Why work with me';
  }
}

export function whyMeHeadingClass(
  settings: Pick<
    PortfolioAboutPresentationSettings,
    'whyMeHeadingAlignment' | 'whyMeHeadingFont' | 'whyMeHeadingSize' | 'whyMeHeadingUppercase'
  >
): string {
  const parts = ['font-bold tracking-[0.18em]', aboutHeaderFontClass(settings.whyMeHeadingFont, 'title')];

  switch (settings.whyMeHeadingSize) {
    case 'lg':
      parts.push('text-sm sm:text-base');
      break;
    case 'md':
      parts.push('text-xs sm:text-sm');
      break;
    default:
      parts.push('text-[10px] sm:text-xs');
  }

  if (settings.whyMeHeadingUppercase) parts.push('uppercase');

  switch (settings.whyMeHeadingAlignment) {
    case 'center':
      parts.push('text-center');
      break;
    case 'right':
      parts.push('text-right');
      break;
    default:
      parts.push('text-left');
  }

  return parts.join(' ');
}

export function whyMeHeadingStyle(
  settings: Pick<PortfolioAboutPresentationSettings, 'whyMeHeadingColor' | 'whyMeHeadingFont'>
): CSSProperties {
  return {
    color: sanitizeHex(settings.whyMeHeadingColor, DEFAULT_ABOUT_WHY_ME_HEADING_COLOR),
    ...aboutHeaderFontStyle(settings.whyMeHeadingFont, false, 'title'),
  };
}

export function whyMeContentAlignClass(align: PortfolioAboutWhyMeContentAlign): {
  text: string;
  items: string;
  header: string;
} {
  switch (align) {
    case 'center':
      return { text: 'text-center', items: 'items-center', header: 'justify-center' };
    case 'right':
      return { text: 'text-right', items: 'items-end', header: 'justify-end' };
    default:
      return { text: 'text-left', items: 'items-start', header: 'justify-start' };
  }
}

export function whyMeGapClass(gap: PortfolioAboutWhyMeGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-4';
    case 'lg':
      return 'gap-8';
    default:
      return 'gap-6';
  }
}

export function resolveWhyMeMediaLayout(
  placement: PortfolioAboutWhyMeMediaPlacement,
  index: number
): 'left' | 'right' | 'top' | 'hidden' {
  switch (placement) {
    case 'media-left':
      return 'left';
    case 'media-right':
      return 'right';
    case 'media-top':
      return 'top';
    case 'text-only':
      return 'hidden';
    default:
      return index % 2 === 0 ? 'right' : 'left';
  }
}

export function aboutWhyMeCardBackgroundSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioServicesCardBackgroundSettings {
  return {
    cardBackgroundFill: p.whyMeBackgroundFill,
    cardBackgroundColorA: p.whyMeBackgroundColorA,
    cardBackgroundColorB: p.whyMeBackgroundColorB,
    cardBackgroundSplitAxis: p.whyMeBackgroundSplitAxis,
    cardBackgroundSplitPosition: p.whyMeBackgroundSplitPosition,
    cardDividerEnabled: p.whyMeDividerEnabled,
    cardDividerShape: p.whyMeDividerShape,
    cardDividerAngle: p.whyMeDividerAngle,
    cardDividerCurveDepth: p.whyMeDividerCurveDepth,
    cardDividerColor: p.whyMeDividerColor,
    cardDividerThickness: p.whyMeDividerThickness,
    cardDividerOpacity: p.whyMeDividerOpacity,
  };
}

export function aboutWhyMeCardDecorSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioServicesCardDecorSettings {
  return {
    cardDecorEnabled: p.whyMeDecorEnabled,
    cardDecorShape: p.whyMeDecorShape,
    cardDecorColor: p.whyMeDecorColor,
    cardDecorOpacity: p.whyMeDecorOpacity,
    cardDecorSize: p.whyMeDecorSize,
    cardDecorX: p.whyMeDecorX,
    cardDecorY: p.whyMeDecorY,
    cardDecorRotation: p.whyMeDecorRotation,
    cardDecorAlternation: p.whyMeDecorAlternation,
  };
}

export function aboutWhyMeLayersSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioServicesCardBackgroundSettings & PortfolioServicesCardDecorSettings {
  return {
    ...aboutWhyMeCardBackgroundSettings(p),
    ...aboutWhyMeCardDecorSettings(p),
  };
}

export function aboutWhyMeToCardFrameSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioCardFrameSettings {
  return {
    ...aboutWhyMeCardBackgroundSettings(p),
    cardBorder: p.whyMeBorder,
    cardBorderColor: p.whyMeBorderColor,
    cardBackgroundEnabled: p.whyMeBackgroundEnabled,
    cardBackgroundColor: p.whyMeBackgroundColor,
    cardBorderRadius: p.whyMeBorderRadius,
    cardPadding: p.whyMePadding,
  };
}

export function patchAboutWhyMeFromCardFrame(
  patch: Partial<PortfolioCardFrameSettings>
): Partial<PortfolioAboutPresentationSettings> {
  const next: Partial<PortfolioAboutPresentationSettings> = {};
  if (patch.cardBorder !== undefined) next.whyMeBorder = patch.cardBorder;
  if (patch.cardBorderColor !== undefined) next.whyMeBorderColor = patch.cardBorderColor;
  if (patch.cardBackgroundEnabled !== undefined) next.whyMeBackgroundEnabled = patch.cardBackgroundEnabled;
  if (patch.cardBackgroundColor !== undefined) next.whyMeBackgroundColor = patch.cardBackgroundColor;
  if (patch.cardBorderRadius !== undefined) next.whyMeBorderRadius = patch.cardBorderRadius;
  if (patch.cardPadding !== undefined) next.whyMePadding = patch.cardPadding;
  if (patch.cardBackgroundFill !== undefined) next.whyMeBackgroundFill = patch.cardBackgroundFill;
  if (patch.cardBackgroundColorA !== undefined) next.whyMeBackgroundColorA = patch.cardBackgroundColorA;
  if (patch.cardBackgroundColorB !== undefined) next.whyMeBackgroundColorB = patch.cardBackgroundColorB;
  if (patch.cardBackgroundSplitAxis !== undefined) next.whyMeBackgroundSplitAxis = patch.cardBackgroundSplitAxis;
  if (patch.cardBackgroundSplitPosition !== undefined) {
    next.whyMeBackgroundSplitPosition = patch.cardBackgroundSplitPosition;
  }
  if (patch.cardDividerEnabled !== undefined) next.whyMeDividerEnabled = patch.cardDividerEnabled;
  if (patch.cardDividerShape !== undefined) next.whyMeDividerShape = patch.cardDividerShape;
  if (patch.cardDividerAngle !== undefined) next.whyMeDividerAngle = patch.cardDividerAngle;
  if (patch.cardDividerCurveDepth !== undefined) next.whyMeDividerCurveDepth = patch.cardDividerCurveDepth;
  if (patch.cardDividerColor !== undefined) next.whyMeDividerColor = patch.cardDividerColor;
  if (patch.cardDividerThickness !== undefined) next.whyMeDividerThickness = patch.cardDividerThickness;
  if (patch.cardDividerOpacity !== undefined) next.whyMeDividerOpacity = patch.cardDividerOpacity;
  return next;
}

function mergeWhyMeBackgroundFields(
  base: PortfolioAboutPresentationSettings,
  record: Record<string, unknown>
): Pick<
  PortfolioAboutPresentationSettings,
  | 'whyMeBackgroundFill'
  | 'whyMeBackgroundColorA'
  | 'whyMeBackgroundColorB'
  | 'whyMeBackgroundSplitAxis'
  | 'whyMeBackgroundSplitPosition'
  | 'whyMeDividerEnabled'
  | 'whyMeDividerShape'
  | 'whyMeDividerAngle'
  | 'whyMeDividerCurveDepth'
  | 'whyMeDividerColor'
  | 'whyMeDividerThickness'
  | 'whyMeDividerOpacity'
> {
  const merged = mergeServicesCardBackgroundSettings(aboutWhyMeCardBackgroundSettings(base), {
    cardBackgroundFill: record.whyMeBackgroundFill,
    cardBackgroundColorA: record.whyMeBackgroundColorA,
    cardBackgroundColorB: record.whyMeBackgroundColorB,
    cardBackgroundSplitAxis: record.whyMeBackgroundSplitAxis,
    cardBackgroundSplitPosition: record.whyMeBackgroundSplitPosition,
    cardDividerEnabled: record.whyMeDividerEnabled,
    cardDividerShape: record.whyMeDividerShape,
    cardDividerAngle: record.whyMeDividerAngle,
    cardDividerCurveDepth: record.whyMeDividerCurveDepth,
    cardDividerColor: record.whyMeDividerColor,
    cardDividerThickness: record.whyMeDividerThickness,
    cardDividerOpacity: record.whyMeDividerOpacity,
  });

  return {
    whyMeBackgroundFill: merged.cardBackgroundFill,
    whyMeBackgroundColorA: merged.cardBackgroundColorA,
    whyMeBackgroundColorB: merged.cardBackgroundColorB,
    whyMeBackgroundSplitAxis: merged.cardBackgroundSplitAxis,
    whyMeBackgroundSplitPosition: merged.cardBackgroundSplitPosition,
    whyMeDividerEnabled: merged.cardDividerEnabled,
    whyMeDividerShape: merged.cardDividerShape,
    whyMeDividerAngle: merged.cardDividerAngle,
    whyMeDividerCurveDepth: merged.cardDividerCurveDepth,
    whyMeDividerColor: merged.cardDividerColor,
    whyMeDividerThickness: merged.cardDividerThickness,
    whyMeDividerOpacity: merged.cardDividerOpacity,
  };
}

function mergeWhyMeDecorFields(
  base: PortfolioAboutPresentationSettings,
  record: Record<string, unknown>
): Pick<
  PortfolioAboutPresentationSettings,
  | 'whyMeDecorEnabled'
  | 'whyMeDecorShape'
  | 'whyMeDecorColor'
  | 'whyMeDecorOpacity'
  | 'whyMeDecorSize'
  | 'whyMeDecorX'
  | 'whyMeDecorY'
  | 'whyMeDecorRotation'
  | 'whyMeDecorAlternation'
> {
  const merged = mergeServicesCardDecorSettings(aboutWhyMeCardDecorSettings(base), {
    cardDecorEnabled: record.whyMeDecorEnabled,
    cardDecorShape: record.whyMeDecorShape,
    cardDecorColor: record.whyMeDecorColor,
    cardDecorOpacity: record.whyMeDecorOpacity,
    cardDecorSize: record.whyMeDecorSize,
    cardDecorX: record.whyMeDecorX,
    cardDecorY: record.whyMeDecorY,
    cardDecorRotation: record.whyMeDecorRotation,
    cardDecorAlternation: record.whyMeDecorAlternation,
  });

  return {
    whyMeDecorEnabled: merged.cardDecorEnabled,
    whyMeDecorShape: merged.cardDecorShape,
    whyMeDecorColor: merged.cardDecorColor,
    whyMeDecorOpacity: merged.cardDecorOpacity,
    whyMeDecorSize: merged.cardDecorSize,
    whyMeDecorX: merged.cardDecorX,
    whyMeDecorY: merged.cardDecorY,
    whyMeDecorRotation: merged.cardDecorRotation,
    whyMeDecorAlternation: merged.cardDecorAlternation,
  };
}

export function aboutWhyMeFrameClass(
  p: Pick<PortfolioAboutPresentationSettings, 'whyMeBorder' | 'whyMeBorderRadius' | 'whyMePadding'>,
  options?: { includePadding?: boolean }
): string {
  const parts = [servicesCardRadiusClass(p.whyMeBorderRadius)];
  if (options?.includePadding !== false) {
    parts.push(servicesCardPaddingClass(p.whyMePadding));
  }
  if (p.whyMeBorder !== 'none') {
    parts.push(aboutCardBorderWidthClass(p.whyMeBorder));
    if (p.whyMeBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function aboutWhyMeFrameStyle(p: PortfolioAboutPresentationSettings): CSSProperties {
  const style: CSSProperties = {};

  if (p.whyMeBackgroundFill === 'solid' && p.whyMeBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.whyMeBackgroundColor, DEFAULT_ABOUT_WHY_ME_BACKGROUND_COLOR);
  }

  if (p.whyMeBorder === 'accent') {
    style.borderColor = sanitizeHex(p.accentColor, DEFAULT_ABOUT_ACCENT_COLOR);
  } else if (p.whyMeBorder === 'soft' || p.whyMeBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.whyMeBorderColor, DEFAULT_ABOUT_WHY_ME_BORDER_COLOR);
  }

  return style;
}

export function patchAboutElementStyle(
  styles: PortfolioAboutElementStyles,
  target: PortfolioAboutStyleTarget,
  patch: Partial<PortfolioElementTextStyle>
): PortfolioAboutElementStyles {
  return patchElementStylesRecord(styles, target, patch, DEFAULT_ABOUT_ELEMENT_STYLES, ABOUT_STYLE_TARGET_IDS);
}

export function pickAboutPresentationSettings(about: unknown): PortfolioAboutPresentationSettings {
  return mergeAboutPresentation(DEFAULT_ABOUT_PRESENTATION, about);
}

export function mergeAboutPresentation(
  base: PortfolioAboutPresentationSettings,
  patch: unknown
): PortfolioAboutPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);
  const cardBackground = mergeServicesCardBackgroundSettings(base, patch);

  const merged: PortfolioAboutPresentationSettings = {
    ...background,
    ...cardBackground,
    titlePreset: pick(
      record.titlePreset,
      ['about', 'my-story', 'who-i-am', 'behind-the-work', 'custom'],
      base.titlePreset
    ),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'personal', 'minimal', 'custom'],
      base.subtitlePreset
    ),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    subtitleSerif: typeof record.subtitleSerif === 'boolean' ? record.subtitleSerif : base.subtitleSerif,
    headerAlignment: pick(record.headerAlignment, ['left', 'center'], base.headerAlignment),
    layoutMode: pick(record.layoutMode, ['sidebar-right', 'sidebar-left', 'full-width'], base.layoutMode),
    fullWidthPanelPlacement: pick(
      record.fullWidthPanelPlacement,
      ['above-stats', 'below-stats', 'below-content'],
      base.fullWidthPanelPlacement
    ),
    statsDesign: (() => {
      const raw = record.statsDesign;
      if (raw === 'unified-band' || raw === 'featured' || raw === 'editorial-list') {
        return raw;
      }
      if (raw === 'grid') return 'unified-band';
      if (raw === 'inline') return 'featured';
      if (raw === 'minimal') return 'editorial-list';
      return base.statsDesign;
    })(),
    statsGroupMode: pick(record.statsGroupMode, ['unified', 'separated'], base.statsGroupMode),
    statsGap: clampStatsGap(record.statsGap, base.statsGap),
    cardBorder: pick(record.cardBorder, ['none', 'soft', 'solid', 'accent'], base.cardBorder),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean' ? record.cardBackgroundEnabled : base.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderRadius: pick(record.cardBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardBorderRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    statsValueColor: sanitizeHex(record.statsValueColor, base.statsValueColor),
    statsLabelColor: sanitizeHex(record.statsLabelColor, base.statsLabelColor),
    statsIconColor: sanitizeHex(record.statsIconColor, base.statsIconColor),
    statsUseAccentForRating:
      typeof record.statsUseAccentForRating === 'boolean'
        ? record.statsUseAccentForRating
        : base.statsUseAccentForRating,
    statsValueFont: pick(record.statsValueFont, ['sans', 'serif', 'display'], base.statsValueFont),
    statsLabelFont: pick(record.statsLabelFont, ['sans', 'serif', 'display'], base.statsLabelFont),
    statsValueSize: pick(record.statsValueSize, ['sm', 'md', 'lg', 'xl'], base.statsValueSize),
    statsLabelSize: pick(record.statsLabelSize, ['xs', 'sm', 'md'], base.statsLabelSize),
    statsValueWeight: pick(
      record.statsValueWeight,
      ['semibold', 'bold', 'extrabold', 'black'],
      base.statsValueWeight
    ),
    statsLabelWeight: pick(record.statsLabelWeight, ['medium', 'semibold', 'bold'], base.statsLabelWeight),
    statsLabelUppercase:
      typeof record.statsLabelUppercase === 'boolean' ? record.statsLabelUppercase : base.statsLabelUppercase,
    statsLabelTracking: pick(
      record.statsLabelTracking,
      ['tight', 'normal', 'wide', 'extra'],
      base.statsLabelTracking
    ),
    statsIconSize: pick(record.statsIconSize, ['sm', 'md', 'lg'], base.statsIconSize),
    showStatYears: typeof record.showStatYears === 'boolean' ? record.showStatYears : base.showStatYears,
    showStatContent:
      typeof record.showStatContent === 'boolean' ? record.showStatContent : base.showStatContent,
    showStatLanguages:
      typeof record.showStatLanguages === 'boolean' ? record.showStatLanguages : base.showStatLanguages,
    showStatRating:
      typeof record.showStatRating === 'boolean' ? record.showStatRating : base.showStatRating,
    statsAutoCenter:
      typeof record.statsAutoCenter === 'boolean' ? record.statsAutoCenter : base.statsAutoCenter,
    sidePanelDesign: pick(record.sidePanelDesign, ['framed', 'cards', 'minimal'], base.sidePanelDesign),
    sidePanelFullWidthLayout: pick(
      record.sidePanelFullWidthLayout,
      ['stacked', 'grid-2', 'grid-3', 'horizontal', 'inline-band'],
      base.sidePanelFullWidthLayout
    ),
    sidePanelBorder: pick(record.sidePanelBorder, ['none', 'soft', 'solid', 'accent'], base.sidePanelBorder),
    sidePanelBorderColor: sanitizeHex(record.sidePanelBorderColor, base.sidePanelBorderColor),
    sidePanelSettingsRevision:
      typeof record.sidePanelSettingsRevision === 'number' && Number.isFinite(record.sidePanelSettingsRevision)
        ? Math.max(0, Math.floor(record.sidePanelSettingsRevision))
        : 0,
    sidePanelBackgroundEnabled:
      typeof record.sidePanelBackgroundEnabled === 'boolean'
        ? record.sidePanelBackgroundEnabled
        : base.sidePanelBackgroundEnabled,
    sidePanelBackgroundColor: sanitizeHex(record.sidePanelBackgroundColor, base.sidePanelBackgroundColor),
    sidePanelBorderRadius: pick(
      record.sidePanelBorderRadius,
      ['none', 'sm', 'md', 'lg', 'xl'],
      base.sidePanelBorderRadius
    ),
    sidePanelPadding: pick(record.sidePanelPadding, ['none', 'sm', 'md', 'lg'], base.sidePanelPadding),
    ...mergeSidePanelBackgroundFields(base, record),
    showSidePanelLocation: (() => {
      if (typeof record.showSidePanelLocation !== 'boolean') return base.showSidePanelLocation;
      // Pre-responseTime-flag saves briefly hid location by default — restore show-by-default.
      if (
        record.showSidePanelLocation === false &&
        typeof record.showSidePanelResponseTime !== 'boolean'
      ) {
        return true;
      }
      return record.showSidePanelLocation;
    })(),
    showSidePanelLanguages:
      typeof record.showSidePanelLanguages === 'boolean'
        ? record.showSidePanelLanguages
        : base.showSidePanelLanguages,
    showSidePanelGender:
      typeof record.showSidePanelGender === 'boolean' ? record.showSidePanelGender : base.showSidePanelGender,
    showSidePanelMemberSince:
      typeof record.showSidePanelMemberSince === 'boolean'
        ? record.showSidePanelMemberSince
        : base.showSidePanelMemberSince,
    showSidePanelAvailability:
      typeof record.showSidePanelAvailability === 'boolean'
        ? record.showSidePanelAvailability
        : base.showSidePanelAvailability,
    showSidePanelResponseTime:
      typeof record.showSidePanelResponseTime === 'boolean'
        ? record.showSidePanelResponseTime
        : base.showSidePanelResponseTime,
    sidePanelAutoCenter:
      typeof record.sidePanelAutoCenter === 'boolean' ? record.sidePanelAutoCenter : base.sidePanelAutoCenter,
    whyMeMediaPlacement: pick(
      record.whyMeMediaPlacement,
      ['alternate', 'media-left', 'media-right', 'media-top', 'text-only'],
      base.whyMeMediaPlacement
    ),
    whyMeContentAlign: pick(record.whyMeContentAlign, ['left', 'center', 'right'], base.whyMeContentAlign),
    whyMeGap: pick(record.whyMeGap, ['sm', 'md', 'lg'], base.whyMeGap),
    whyMeBorder: pick(record.whyMeBorder, ['none', 'soft', 'solid', 'accent'], base.whyMeBorder),
    whyMeBorderColor: sanitizeHex(record.whyMeBorderColor, base.whyMeBorderColor),
    whyMeBackgroundEnabled:
      typeof record.whyMeBackgroundEnabled === 'boolean'
        ? record.whyMeBackgroundEnabled
        : base.whyMeBackgroundEnabled,
    whyMeBackgroundColor: sanitizeHex(record.whyMeBackgroundColor, base.whyMeBackgroundColor),
    whyMeBorderRadius: pick(record.whyMeBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.whyMeBorderRadius),
    whyMePadding: pick(record.whyMePadding, ['none', 'sm', 'md', 'lg'], base.whyMePadding),
    ...mergeWhyMeBackgroundFields(base, record),
    ...mergeWhyMeDecorFields(base, record),
    whyMeDesign: pick(
      record.whyMeDesign,
      ['editorial', 'compact', 'minimal', 'grid', 'stacked'],
      base.whyMeDesign
    ),
    whyMeHeadingPreset: pick(
      record.whyMeHeadingPreset,
      ['default', 'why-work-with-me', 'my-approach', 'strengths', 'value', 'custom'],
      base.whyMeHeadingPreset
    ),
    whyMeHeadingCustom:
      typeof record.whyMeHeadingCustom === 'string' ? record.whyMeHeadingCustom : base.whyMeHeadingCustom,
    whyMeHeadingAlignment: pick(record.whyMeHeadingAlignment, ['left', 'center', 'right'], base.whyMeHeadingAlignment),
    whyMeHeadingFont: pick(record.whyMeHeadingFont, ['sans', 'serif', 'display'], base.whyMeHeadingFont),
    whyMeHeadingColor: sanitizeHex(record.whyMeHeadingColor, base.whyMeHeadingColor),
    whyMeHeadingSize: pick(record.whyMeHeadingSize, ['sm', 'md', 'lg'], base.whyMeHeadingSize),
    whyMeHeadingUppercase:
      typeof record.whyMeHeadingUppercase === 'boolean'
        ? record.whyMeHeadingUppercase
        : base.whyMeHeadingUppercase,
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    showStats: false,
    showSidePanel: typeof record.showSidePanel === 'boolean' ? record.showSidePanel : base.showSidePanel,
    showWhyMe: typeof record.showWhyMe === 'boolean' ? record.showWhyMe : base.showWhyMe,
    showWhyMeHeading:
      typeof record.showWhyMeHeading === 'boolean' ? record.showWhyMeHeading : base.showWhyMeHeading,
    whyMeHeading:
      typeof record.whyMeHeading === 'string' && record.whyMeHeading.trim()
        ? record.whyMeHeading.trim()
        : base.whyMeHeading,
    elementStyles: normalizeElementStylesRecord(
      record.elementStyles ?? base.elementStyles,
      DEFAULT_ABOUT_ELEMENT_STYLES,
      ABOUT_STYLE_TARGET_IDS
    ),
  };

  let next = merged;

  if (next.sidePanelSettingsRevision < ABOUT_SIDE_PANEL_SETTINGS_REVISION) {
    next = {
      ...next,
      ...(next.sidePanelBorder === 'soft' || typeof record.sidePanelBorder !== 'string'
        ? { sidePanelBorder: 'none' as const }
        : {}),
      sidePanelSettingsRevision: ABOUT_SIDE_PANEL_SETTINGS_REVISION,
    };
  }

  if (isLegacyDefaultSidePanelBackground(next)) {
    next = {
      ...next,
      ...DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND,
      sidePanelBackgroundColor: DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR,
      showSidePanelLocation: true,
      showSidePanelResponseTime: false,
    };
  }

  if (isLegacyDefaultWhyMeDecor(next)) {
    next = {
      ...next,
      ...DEFAULT_ABOUT_WHY_ME_DECOR,
    };
  }

  return next;
}
