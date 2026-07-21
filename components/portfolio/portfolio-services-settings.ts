import type { CSSProperties } from 'react';
import {
  DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
  DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B,
  mergeServicesCardBackgroundSettings,
  withMigratedServicesCardBackground,
  type PortfolioServicesCardBackgroundSettings,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  DEFAULT_SERVICES_CARD_DECOR_SETTINGS,
  mergeServicesCardDecorSettings,
  type PortfolioServicesCardDecorSettings,
} from '@/components/portfolio/portfolio-services-card-decor-settings';
import {
  createElementTextStyle,
  normalizeElementStylesRecord,
  patchElementStylesRecord,
  type PortfolioElementTextStyle,
  type PortfolioToolsIconSize,
} from '@/components/portfolio/portfolio-element-text-style';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  DEFAULT_SERVICES_COLOR_BINDINGS,
  DEFAULT_SERVICES_PALETTE,
  applyServicesPaletteToSettings,
  mergeServicesColorBindings,
  mergeServicesPalette,
  type PortfolioServicesColorBindings,
  type PortfolioServicesPalette,
} from '@/components/portfolio/portfolio-services-palette-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioServicesTitlePreset =
  | 'services-skills'
  | 'expertise'
  | 'what-i-offer'
  | 'skills-services'
  | 'custom';

export type PortfolioServicesSubtitlePreset =
  | 'default'
  | 'short'
  | 'collaboration'
  | 'craft'
  | 'minimal'
  | 'custom';

export type PortfolioServicesHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioServicesHeaderAlignment = 'left' | 'center';

export type PortfolioServicesLayoutMode = 'combined' | 'separated';

export type PortfolioServicesSectionOrganization = 'combined' | 'separated' | 'distinct';

export type PortfolioServicesBlockScope = 'skills' | 'services';

export type PortfolioServicesBlockSettings = PortfolioServicesCardBackgroundSettings &
  PortfolioServicesCardDecorSettings & {
  galleryLayout: PortfolioServicesGalleryLayout;
  columns: PortfolioServicesCardColumns;
  displayMode: PortfolioServicesDisplayMode;
  contentAlignment: PortfolioServicesContentAlignment;
  pricePlacement: PortfolioServicesPricePlacement;
  iconPlacement: PortfolioServicesIconPlacement;
  cardDesign: PortfolioServicesCardDesign;
  cardDesignIntensities: PortfolioServicesCardDesignIntensities;
  cardDesignTints: PortfolioServicesCardDesignTints;
  cardAccentColor: string;
  stageDesign: PortfolioServicesStageDesign;
} & PortfolioServicesStageChromeSettings & {
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  cardBackgroundAlternation: PortfolioServicesCardBackgroundAlternation;
};

export type PortfolioServicesDistinctHeaderSettings = {
  titlePreset: PortfolioServicesTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioServicesSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioServicesHeaderFont;
  subtitleFont: PortfolioServicesHeaderFont;
  titleColor: string;
  subtitleColor: string;
  headerAlignment: PortfolioServicesHeaderAlignment;
};

export type PortfolioServicesDisplayMode = 'marquee' | 'grid' | 'stack';

export type PortfolioServicesGalleryLayout = 'card' | 'list' | 'pricing-hero' | 'accordion';

export type PortfolioServicesCardDesign = 'editorial' | 'minimal' | 'compact' | 'glass' | 'frost' | 'accent';

export type PortfolioServicesCardDesignIntensities = Record<PortfolioServicesCardDesign, number>;

export type PortfolioServicesCardDesignTints = Record<PortfolioServicesCardDesign, number>;

export type PortfolioServicesStageDesign = 'framed' | 'open' | 'soft' | 'none';

export type PortfolioServicesStageBorder = 'none' | 'soft' | 'solid';

export type PortfolioServicesStageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioServicesStagePadding = 'none' | 'sm' | 'md' | 'lg';

export type PortfolioServicesStagePattern = 'none' | 'dots' | 'grid' | 'diagonal';

/** Chrome controls for the outer stage wrapper (framed / soft). */
export type PortfolioServicesStageChromeSettings = {
  stageBackgroundEnabled: boolean;
  stageBackgroundColor: string;
  stageBackgroundOpacity: number;
  stageBorder: PortfolioServicesStageBorder;
  stageBorderColor: string;
  stageBorderRadius: PortfolioServicesStageRadius;
  stagePadding: PortfolioServicesStagePadding;
  stagePattern: PortfolioServicesStagePattern;
  stagePatternColor: string;
  stagePatternOpacity: number;
};

export type PortfolioServicesStackOrder = 'skills-first' | 'services-first';

export type PortfolioServicesCardBorder = 'none' | 'soft' | 'solid' | 'accent';

export type PortfolioServicesCardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/** Alternate light / muted card surfaces across the gallery. */
export type PortfolioServicesCardBackgroundAlternation = 'uniform' | 'alternate';

export type PortfolioServicesCardPadding = 'none' | 'sm' | 'md' | 'lg';

export type PortfolioServicesCardColumns = 1 | 2 | 3 | 4;

export type PortfolioServicesContentAlignment = 'left' | 'center' | 'right';

export type PortfolioServicesPricePlacement = 'end' | 'below' | 'top';

export type PortfolioServicesIconPlacement = 'start' | 'top';

/** Which text element inside the skills / services section can be styled independently. */
export type PortfolioServicesStyleTarget =
  | 'blockSubheading'
  | 'cardTitle'
  | 'cardBody'
  | 'price'
  | 'delivery'
  | 'skillTitle'
  | 'skillBody';

export type PortfolioServicesElementStyles = Record<PortfolioServicesStyleTarget, PortfolioElementTextStyle>;

export type PortfolioServicesPresentationSettings = PortfolioSectionBackgroundSettings &
  PortfolioServicesCardBackgroundSettings &
  PortfolioServicesCardDecorSettings & {
  titlePreset: PortfolioServicesTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioServicesSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioServicesHeaderFont;
  subtitleFont: PortfolioServicesHeaderFont;
  titleColor: string;
  subtitleColor: string;
  headerAlignment: PortfolioServicesHeaderAlignment;
  sectionOrganization: PortfolioServicesSectionOrganization;
  layoutMode: PortfolioServicesLayoutMode;
  displayMode: PortfolioServicesDisplayMode;
  servicesGalleryLayout: PortfolioServicesGalleryLayout;
  skillsGalleryLayout: PortfolioServicesGalleryLayout;
  stackOrder: PortfolioServicesStackOrder;
  cardDesign: PortfolioServicesCardDesign;
  cardDesignIntensities: PortfolioServicesCardDesignIntensities;
  cardDesignTints: PortfolioServicesCardDesignTints;
  stageDesign: PortfolioServicesStageDesign;
  cardAccentColor: string;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  cardBackgroundAlternation: PortfolioServicesCardBackgroundAlternation;
  stageBackgroundEnabled: boolean;
  stageBackgroundColor: string;
  stageBackgroundOpacity: number;
  stageBorder: PortfolioServicesStageBorder;
  stageBorderColor: string;
  stageBorderRadius: PortfolioServicesStageRadius;
  stagePadding: PortfolioServicesStagePadding;
  stagePattern: PortfolioServicesStagePattern;
  stagePatternColor: string;
  stagePatternOpacity: number;
  servicesColumns: PortfolioServicesCardColumns;
  skillsColumns: PortfolioServicesCardColumns;
  servicesContentAlignment: PortfolioServicesContentAlignment;
  skillsContentAlignment: PortfolioServicesContentAlignment;
  servicesPricePlacement: PortfolioServicesPricePlacement;
  skillsIconPlacement: PortfolioServicesIconPlacement;
  showSkills: boolean;
  showServices: boolean;
  showSkillIcon: boolean;
  showSkillTitle: boolean;
  showSkillDescription: boolean;
  showServiceTitle: boolean;
  showServiceDescription: boolean;
  showServicePrice: boolean;
  showServiceDelivery: boolean;
  showResponseTime: boolean;
  showSkillsSubheading: boolean;
  showServicesSubheading: boolean;
  /** Custom subheading labels (empty = default English labels). */
  skillsSubheadingLabel: string;
  servicesSubheadingLabel: string;
  /** Tool / skill icon size — independent from the card design typography. */
  skillsIconSize: PortfolioToolsIconSize;
  /** When true, section colors follow the Hero semantic palette. */
  useHeroPalette: boolean;
  /** Services-owned palette copy (same 8 tokens as Hero). */
  servicesPalette?: PortfolioServicesPalette;
  /** Which token each services color slot uses. */
  servicesColorBindings?: PortfolioServicesColorBindings;
  /** Per-element color, font, size, and weight for card text. */
  elementStyles: PortfolioServicesElementStyles;
  skillsBlock: PortfolioServicesBlockSettings;
  servicesBlock: PortfolioServicesBlockSettings;
  skillsHeader: PortfolioServicesDistinctHeaderSettings;
  servicesHeader: PortfolioServicesDistinctHeaderSettings;
};

export type PortfolioServicesSectionSettings = PortfolioSectionCopy & PortfolioServicesPresentationSettings;

export const DEFAULT_SERVICES_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_SERVICES_SUBTITLE_COLOR = '#737373';
export const DEFAULT_SERVICES_ACCENT_COLOR = '#f97316';
export const DEFAULT_SERVICES_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_SERVICES_STAGE_BACKGROUND_COLOR = '#fafafa';
export const DEFAULT_SERVICES_STAGE_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_SERVICES_STAGE_PATTERN_COLOR = '#a3a3a3';

/** Defaults matching the previous hardcoded framed stage shell. */
export const DEFAULT_SERVICES_STAGE_CHROME: PortfolioServicesStageChromeSettings = {
  stageBackgroundEnabled: false,
  stageBackgroundColor: DEFAULT_SERVICES_STAGE_BACKGROUND_COLOR,
  stageBackgroundOpacity: 80,
  stageBorder: 'soft',
  stageBorderColor: DEFAULT_SERVICES_STAGE_BORDER_COLOR,
  stageBorderRadius: 'xl',
  stagePadding: 'md',
  stagePattern: 'none',
  stagePatternColor: DEFAULT_SERVICES_STAGE_PATTERN_COLOR,
  stagePatternOpacity: 18,
};

/** Apply stage-design presets so Soft / Framed keep expected looks when switching. */
export function stageChromePresetForDesign(
  design: PortfolioServicesStageDesign
): Partial<PortfolioServicesStageChromeSettings> {
  switch (design) {
    case 'soft':
      return {
        stageBackgroundEnabled: true,
        stageBackgroundColor: DEFAULT_SERVICES_STAGE_BACKGROUND_COLOR,
        stageBackgroundOpacity: 80,
        stageBorder: 'none',
        stageBorderRadius: 'xl',
        stagePadding: 'md',
        stagePattern: 'none',
      };
    case 'framed':
      return {
        stageBackgroundEnabled: false,
        stageBorder: 'soft',
        stageBorderColor: DEFAULT_SERVICES_STAGE_BORDER_COLOR,
        stageBorderRadius: 'xl',
        stagePadding: 'md',
        stagePattern: 'none',
      };
    case 'open':
    case 'none':
      return {
        stageBackgroundEnabled: false,
        stageBorder: 'none',
        stagePadding: 'none',
        stagePattern: 'none',
        stageBorderRadius: 'none',
      };
  }
}

export function servicesStageChromeIsActive(chrome: PortfolioServicesStageChromeSettings): boolean {
  return (
    chrome.stageBackgroundEnabled ||
    chrome.stageBorder !== 'none' ||
    chrome.stagePattern !== 'none' ||
    chrome.stagePadding !== 'none'
  );
}
export const DEFAULT_SERVICES_CARD_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_SERVICES_BODY_COLOR = '#737373';
export const DEFAULT_SERVICES_SUBHEADING_COLOR = '#a3a3a3';

/** Defaults tuned to match the current editorial card look (title/body/price/delivery). */
export const DEFAULT_SERVICES_ELEMENT_STYLES: PortfolioServicesElementStyles = {
  blockSubheading: createElementTextStyle({
    color: DEFAULT_SERVICES_SUBHEADING_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  cardTitle: createElementTextStyle({
    color: DEFAULT_SERVICES_TITLE_COLOR,
    size: 'sm',
    bold: true,
  }),
  cardBody: createElementTextStyle({
    color: DEFAULT_SERVICES_BODY_COLOR,
    size: 'md',
  }),
  price: createElementTextStyle({
    color: DEFAULT_SERVICES_TITLE_COLOR,
    size: 'sm',
    bold: true,
  }),
  delivery: createElementTextStyle({
    color: DEFAULT_SERVICES_BODY_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  skillTitle: createElementTextStyle({
    color: DEFAULT_SERVICES_TITLE_COLOR,
    size: 'sm',
    bold: true,
  }),
  skillBody: createElementTextStyle({
    color: DEFAULT_SERVICES_BODY_COLOR,
    size: 'md',
  }),
};

export const SERVICES_STYLE_TARGET_IDS: PortfolioServicesStyleTarget[] = [
  'blockSubheading',
  'cardTitle',
  'cardBody',
  'price',
  'delivery',
  'skillTitle',
  'skillBody',
];

export const PORTFOLIO_SERVICES_STYLE_TARGET_OPTIONS: {
  value: PortfolioServicesStyleTarget;
  label: string;
  description: string;
}[] = [
  {
    value: 'blockSubheading',
    label: 'Block subheading',
    description: '“Skills & tools” / “Services” small label above each block.',
  },
  { value: 'cardTitle', label: 'Service title', description: 'Title text on service cards.' },
  { value: 'cardBody', label: 'Service description', description: 'Description text on service cards.' },
  { value: 'price', label: 'Price', description: 'Price amount shown on service cards.' },
  { value: 'delivery', label: 'Delivery', description: 'Delivery time badge on service cards.' },
  { value: 'skillTitle', label: 'Skill title', description: 'Title text on skill / tool cards.' },
  { value: 'skillBody', label: 'Skill description', description: 'Description text on skill / tool cards.' },
];

export function normalizeServicesElementStyles(raw: unknown): PortfolioServicesElementStyles {
  return normalizeElementStylesRecord(raw, DEFAULT_SERVICES_ELEMENT_STYLES, SERVICES_STYLE_TARGET_IDS);
}

export function patchServicesElementStyle(
  styles: PortfolioServicesElementStyles,
  target: PortfolioServicesStyleTarget,
  patch: Partial<PortfolioElementTextStyle>
): PortfolioServicesElementStyles {
  return patchElementStylesRecord(
    styles,
    target,
    patch,
    DEFAULT_SERVICES_ELEMENT_STYLES,
    SERVICES_STYLE_TARGET_IDS
  );
}

export function resolveServicesSkillsSubheadingLabel(
  settings: Pick<PortfolioServicesPresentationSettings, 'skillsSubheadingLabel'>
): string {
  return settings.skillsSubheadingLabel.trim() || 'Skills & tools';
}

export function resolveServicesServicesSubheadingLabel(
  settings: Pick<PortfolioServicesPresentationSettings, 'servicesSubheadingLabel'>
): string {
  return settings.servicesSubheadingLabel.trim() || 'Services';
}

export const DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES: PortfolioServicesCardDesignIntensities = {
  editorial: 65,
  minimal: 55,
  compact: 60,
  glass: 70,
  frost: 70,
  accent: 65,
};

export const DEFAULT_SERVICES_CARD_DESIGN_TINTS: PortfolioServicesCardDesignTints = {
  editorial: 100,
  minimal: 0,
  compact: 0,
  glass: 75,
  frost: 0,
  accent: 80,
};

function createDefaultServicesBlockSettings(
  kind: PortfolioServicesBlockScope,
  source: Pick<
    PortfolioServicesPresentationSettings,
    | 'skillsGalleryLayout'
    | 'servicesGalleryLayout'
    | 'skillsColumns'
    | 'servicesColumns'
    | 'displayMode'
    | 'skillsContentAlignment'
    | 'servicesContentAlignment'
    | 'servicesPricePlacement'
    | 'skillsIconPlacement'
    | 'cardDesign'
    | 'cardDesignIntensities'
    | 'cardDesignTints'
    | 'cardAccentColor'
    | 'stageDesign'
    | 'stageBackgroundEnabled'
    | 'stageBackgroundColor'
    | 'stageBackgroundOpacity'
    | 'stageBorder'
    | 'stageBorderColor'
    | 'stageBorderRadius'
    | 'stagePadding'
    | 'stagePattern'
    | 'stagePatternColor'
    | 'stagePatternOpacity'
    | 'cardBorder'
    | 'cardBorderColor'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundColor'
    | 'cardBorderRadius'
    | 'cardPadding'
    | 'cardBackgroundAlternation'
    | 'cardDecorEnabled'
    | 'cardDecorShape'
    | 'cardDecorColor'
    | 'cardDecorOpacity'
    | 'cardDecorSize'
    | 'cardDecorX'
    | 'cardDecorY'
    | 'cardDecorRotation'
    | 'cardDecorAlternation'
  > &
    PortfolioServicesCardBackgroundSettings &
    PortfolioServicesCardDecorSettings
): PortfolioServicesBlockSettings {
  return {
    ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
    ...DEFAULT_SERVICES_CARD_DECOR_SETTINGS,
    cardBackgroundFill: source.cardBackgroundFill,
    cardBackgroundColorA: source.cardBackgroundColorA,
    cardBackgroundColorB: source.cardBackgroundColorB,
    cardBackgroundSplitAxis: source.cardBackgroundSplitAxis,
    cardBackgroundSplitPosition: source.cardBackgroundSplitPosition,
    cardDividerEnabled: source.cardDividerEnabled,
    cardDividerShape: source.cardDividerShape,
    cardDividerAngle: source.cardDividerAngle,
    cardDividerCurveDepth: source.cardDividerCurveDepth,
    cardDividerColor: source.cardDividerColor,
    cardDividerThickness: source.cardDividerThickness,
    cardDividerOpacity: source.cardDividerOpacity,
    cardDecorEnabled: source.cardDecorEnabled,
    cardDecorShape: source.cardDecorShape,
    cardDecorColor: source.cardDecorColor,
    cardDecorOpacity: source.cardDecorOpacity,
    cardDecorSize: source.cardDecorSize,
    cardDecorX: source.cardDecorX,
    cardDecorY: source.cardDecorY,
    cardDecorRotation: source.cardDecorRotation,
    cardDecorAlternation: source.cardDecorAlternation,
    galleryLayout: kind === 'skills' ? source.skillsGalleryLayout : source.servicesGalleryLayout,
    columns: kind === 'skills' ? source.skillsColumns : source.servicesColumns,
    displayMode: source.displayMode,
    contentAlignment:
      kind === 'skills' ? source.skillsContentAlignment : source.servicesContentAlignment,
    pricePlacement: source.servicesPricePlacement,
    iconPlacement: source.skillsIconPlacement,
    cardDesign: source.cardDesign,
    cardDesignIntensities: { ...source.cardDesignIntensities },
    cardDesignTints: { ...source.cardDesignTints },
    cardAccentColor: source.cardAccentColor,
    stageDesign: source.stageDesign,
    stageBackgroundEnabled: source.stageBackgroundEnabled,
    stageBackgroundColor: source.stageBackgroundColor,
    stageBackgroundOpacity: source.stageBackgroundOpacity,
    stageBorder: source.stageBorder,
    stageBorderColor: source.stageBorderColor,
    stageBorderRadius: source.stageBorderRadius,
    stagePadding: source.stagePadding,
    stagePattern: source.stagePattern,
    stagePatternColor: source.stagePatternColor,
    stagePatternOpacity: source.stagePatternOpacity,
    cardBorder: source.cardBorder,
    cardBorderColor: source.cardBorderColor,
    cardBackgroundEnabled: source.cardBackgroundEnabled,
    cardBackgroundColor: source.cardBackgroundColor,
    cardBorderRadius: source.cardBorderRadius,
    cardPadding: source.cardPadding,
    cardBackgroundAlternation: source.cardBackgroundAlternation,
  };
}

export function snapshotServicesBlocksFromSection(
  services: PortfolioServicesSectionSettings
): Pick<PortfolioServicesSectionSettings, 'skillsBlock' | 'servicesBlock'> {
  return {
    skillsBlock: createDefaultServicesBlockSettings('skills', services),
    servicesBlock: createDefaultServicesBlockSettings('services', services),
  };
}

function mapCombinedTitleToSkillsPreset(
  preset: PortfolioServicesTitlePreset
): PortfolioServicesTitlePreset {
  switch (preset) {
    case 'skills-services':
      return 'skills-services';
    case 'expertise':
      return 'expertise';
    case 'what-i-offer':
      return 'expertise';
    default:
      return 'services-skills';
  }
}

function mapCombinedTitleToServicesPreset(
  preset: PortfolioServicesTitlePreset
): PortfolioServicesTitlePreset {
  switch (preset) {
    case 'what-i-offer':
      return 'what-i-offer';
    case 'expertise':
      return 'expertise';
    case 'skills-services':
      return 'services-skills';
    default:
      return 'services-skills';
  }
}

function mapCombinedSubtitleToSkillsPreset(
  preset: PortfolioServicesSubtitlePreset
): PortfolioServicesSubtitlePreset {
  if (preset === 'collaboration') return 'short';
  if (preset === 'default') return 'craft';
  return preset === 'custom' || preset === 'minimal' || preset === 'short' || preset === 'craft'
    ? preset
    : 'craft';
}

function mapCombinedSubtitleToServicesPreset(
  preset: PortfolioServicesSubtitlePreset
): PortfolioServicesSubtitlePreset {
  if (preset === 'craft') return 'collaboration';
  if (preset === 'default') return 'collaboration';
  return preset === 'custom' || preset === 'minimal' || preset === 'short' || preset === 'collaboration'
    ? preset
    : 'collaboration';
}

export function snapshotServicesHeadersFromSection(
  services: PortfolioServicesSectionSettings
): Pick<
  PortfolioServicesSectionSettings,
  'skillsHeader' | 'servicesHeader' | 'showSkillsSubheading' | 'showServicesSubheading'
> {
  return {
    skillsHeader: {
      ...createDefaultDistinctHeaderSettings('skills'),
      titlePreset: mapCombinedTitleToSkillsPreset(services.titlePreset),
      titleCustom: services.titlePreset === 'custom' ? services.titleCustom : '',
      subtitlePreset: mapCombinedSubtitleToSkillsPreset(services.subtitlePreset),
      subtitleCustom: services.subtitlePreset === 'custom' ? services.subtitleCustom : '',
      titleFont: services.titleFont,
      subtitleFont: services.subtitleFont,
      titleColor: services.titleColor,
      subtitleColor: services.subtitleColor,
      headerAlignment: services.headerAlignment,
    },
    servicesHeader: {
      ...createDefaultDistinctHeaderSettings('services'),
      titlePreset: mapCombinedTitleToServicesPreset(services.titlePreset),
      titleCustom: services.titlePreset === 'custom' ? services.titleCustom : '',
      subtitlePreset: mapCombinedSubtitleToServicesPreset(services.subtitlePreset),
      subtitleCustom: services.subtitlePreset === 'custom' ? services.subtitleCustom : '',
      titleFont: services.titleFont,
      subtitleFont: services.subtitleFont,
      titleColor: services.titleColor,
      subtitleColor: services.subtitleColor,
      headerAlignment: services.headerAlignment,
    },
    showSkillsSubheading: false,
    showServicesSubheading: false,
  };
}

function createDefaultDistinctHeaderSettings(
  kind: PortfolioServicesBlockScope
): PortfolioServicesDistinctHeaderSettings {
  return {
    titlePreset: kind === 'skills' ? 'services-skills' : 'what-i-offer',
    titleCustom: '',
    subtitlePreset: kind === 'skills' ? 'craft' : 'collaboration',
    subtitleCustom: '',
    titleFont: 'sans',
    subtitleFont: 'sans',
    titleColor: DEFAULT_SERVICES_TITLE_COLOR,
    subtitleColor: DEFAULT_SERVICES_SUBTITLE_COLOR,
    headerAlignment: 'left',
  };
}

const DEFAULT_SERVICES_PRESENTATION_BASE = {
  ...DEFAULT_SECTION_BACKGROUND,
  ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
  ...DEFAULT_SERVICES_CARD_DECOR_SETTINGS,
  titlePreset: 'services-skills' as const,
  titleCustom: '',
  subtitlePreset: 'default' as const,
  subtitleCustom: '',
  titleFont: 'sans' as const,
  subtitleFont: 'sans' as const,
  titleColor: DEFAULT_SERVICES_TITLE_COLOR,
  subtitleColor: DEFAULT_SERVICES_SUBTITLE_COLOR,
  headerAlignment: 'left' as const,
  sectionOrganization: 'combined' as const,
  layoutMode: 'combined' as const,
  displayMode: 'marquee' as const,
  servicesGalleryLayout: 'card' as const,
  skillsGalleryLayout: 'card' as const,
  stackOrder: 'skills-first' as const,
  cardDesign: 'editorial' as const,
  cardDesignIntensities: { ...DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES },
  cardDesignTints: { ...DEFAULT_SERVICES_CARD_DESIGN_TINTS },
  stageDesign: 'framed' as const,
  ...DEFAULT_SERVICES_STAGE_CHROME,
  cardAccentColor: DEFAULT_SERVICES_ACCENT_COLOR,
  cardBorder: 'soft' as const,
  cardBorderColor: DEFAULT_SERVICES_CARD_BORDER_COLOR,
  cardBackgroundEnabled: true,
  cardBackgroundColor: DEFAULT_SERVICES_CARD_BACKGROUND_COLOR,
  cardBorderRadius: 'lg' as const,
  cardPadding: 'md' as const,
  cardBackgroundAlternation: 'alternate' as const,
  servicesColumns: 3 as const,
  skillsColumns: 3 as const,
  servicesContentAlignment: 'left' as const,
  skillsContentAlignment: 'left' as const,
  servicesPricePlacement: 'end' as const,
  skillsIconPlacement: 'start' as const,
  showSkills: true,
  showServices: true,
  showSkillIcon: true,
  showSkillTitle: true,
  showSkillDescription: true,
  showServiceTitle: true,
  showServiceDescription: true,
  showServicePrice: true,
  showServiceDelivery: true,
  showResponseTime: false,
  showSkillsSubheading: true,
  showServicesSubheading: true,
  skillsSubheadingLabel: '',
  servicesSubheadingLabel: '',
  skillsIconSize: 'md' as const,
};

export const DEFAULT_SERVICES_PRESENTATION: PortfolioServicesPresentationSettings = {
  ...DEFAULT_SERVICES_PRESENTATION_BASE,
  skillsBlock: createDefaultServicesBlockSettings('skills', {
    ...DEFAULT_SERVICES_PRESENTATION_BASE,
    ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
  }),
  servicesBlock: createDefaultServicesBlockSettings('services', {
    ...DEFAULT_SERVICES_PRESENTATION_BASE,
    ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
  }),
  skillsHeader: createDefaultDistinctHeaderSettings('skills'),
  servicesHeader: createDefaultDistinctHeaderSettings('services'),
  useHeroPalette: true,
  servicesPalette: { ...DEFAULT_SERVICES_PALETTE },
  servicesColorBindings: { ...DEFAULT_SERVICES_COLOR_BINDINGS },
  elementStyles: DEFAULT_SERVICES_ELEMENT_STYLES,
};

// Sync hex fields from the default palette without circular init.
Object.assign(
  DEFAULT_SERVICES_PRESENTATION,
  applyServicesPaletteToSettings({
    servicesPalette: DEFAULT_SERVICES_PALETTE,
    servicesColorBindings: DEFAULT_SERVICES_COLOR_BINDINGS,
    elementStyles: DEFAULT_SERVICES_ELEMENT_STYLES,
  })
);

export const PORTFOLIO_SERVICES_TITLE_PRESET_OPTIONS: {
  value: PortfolioServicesTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'services-skills', label: 'Services & skills', description: 'Default balanced label.' },
  { value: 'expertise', label: 'Expertise', description: 'Short and professional.' },
  { value: 'what-i-offer', label: 'What I offer', description: 'Client-friendly wording.' },
  { value: 'skills-services', label: 'Skills & services', description: 'Tools first, services second.' },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_SERVICES_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioServicesSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One concise supporting line.' },
  { value: 'collaboration', label: 'Collaboration', description: 'Emphasizes partnership and delivery.' },
  { value: 'craft', label: 'Craft focus', description: 'Highlights tools, process, and quality.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_SERVICES_DISTINCT_SKILLS_TITLE_PRESET_OPTIONS: {
  value: PortfolioServicesTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'services-skills', label: 'Skills & tools', description: 'Titre affiché : SKILLS & TOOLS' },
  { value: 'expertise', label: 'Expertise', description: 'Titre affiché : EXPERTISE' },
  { value: 'skills-services', label: 'Stack technique', description: 'Titre affiché : SKILLS & SERVICES' },
  { value: 'custom', label: 'Personnalisé', description: 'Écrivez le titre principal vous-même.' },
];

export const PORTFOLIO_SERVICES_DISTINCT_SERVICES_TITLE_PRESET_OPTIONS: {
  value: PortfolioServicesTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'services-skills', label: 'Services', description: 'Titre affiché : SERVICES' },
  { value: 'what-i-offer', label: 'What I offer', description: 'Titre affiché : WHAT I OFFER' },
  { value: 'expertise', label: 'Expertise', description: 'Titre affiché : EXPERTISE' },
  { value: 'custom', label: 'Personnalisé', description: 'Écrivez le titre principal vous-même.' },
];

export const PORTFOLIO_SERVICES_DISTINCT_SKILLS_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioServicesSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'craft', label: 'Focus outils', description: 'Sous-titre sur votre stack et vos outils.' },
  { value: 'short', label: 'Court', description: 'Une ligne courte sous le titre.' },
  { value: 'minimal', label: 'Aucun sous-titre', description: 'Masquer le sous-titre de section.' },
  { value: 'custom', label: 'Personnalisé', description: 'Écrivez le sous-titre vous-même.' },
];

export const PORTFOLIO_SERVICES_DISTINCT_SERVICES_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioServicesSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'collaboration', label: 'Collaboration', description: 'Sous-titre orienté accompagnement client.' },
  { value: 'short', label: 'Court', description: 'Une ligne courte sous le titre.' },
  { value: 'minimal', label: 'Aucun sous-titre', description: 'Masquer le sous-titre de section.' },
  { value: 'custom', label: 'Personnalisé', description: 'Écrivez le sous-titre vous-même.' },
];

export const PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS: {
  value: PortfolioServicesHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_SERVICES_LAYOUT_MODE_OPTIONS: {
  value: PortfolioServicesLayoutMode;
  label: string;
  description: string;
}[] = [
  { value: 'combined', label: 'Combined frame', description: 'Skills and services inside one panel.' },
  { value: 'separated', label: 'Separated blocks', description: 'Distinct skills and services areas.' },
];

export const PORTFOLIO_SERVICES_SECTION_ORGANIZATION_OPTIONS: {
  value: PortfolioServicesSectionOrganization;
  label: string;
  description: string;
}[] = [
  {
    value: 'combined',
    label: 'Cadre combiné',
    description: 'Skills et services dans un même panneau — réglages partagés.',
  },
  {
    value: 'separated',
    label: 'Blocs séparés',
    description: 'Deux zones, un titre combiné — cadre et design indépendants par bloc.',
  },
  {
    value: 'distinct',
    label: 'Sections distinctes',
    description: 'Deux sections avec titres séparés (Skills / Services) — nav et fonds indépendants.',
  },
];

export const PORTFOLIO_SERVICES_DISPLAY_MODE_OPTIONS: {
  value: PortfolioServicesDisplayMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'marquee',
    label: 'Carrousel infini',
    description: 'Défilement automatique fluide — nécessite le design « Carte verticale ».',
  },
  { value: 'grid', label: 'Grille statique', description: 'Grille responsive sans animation.' },
  { value: 'stack', label: 'Pile verticale', description: 'Cartes pleine largeur empilées.' },
];

export const PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS: {
  value: PortfolioServicesGalleryLayout;
  label: string;
  description: string;
}[] = [
  { value: 'card', label: 'Carte verticale', description: 'Carte classique avec titre, description et prix.' },
  { value: 'list', label: 'Liste / menu', description: 'Lignes compactes type menu de prix.' },
  { value: 'pricing-hero', label: 'Pricing hero', description: 'Prix mis en avant avec CTA de conversion.' },
  { value: 'accordion', label: 'Accordéon', description: 'Lignes repliables avec détails au clic.' },
];

export const PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS: {
  value: PortfolioServicesCardBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Sans bordure.' },
  { value: 'soft', label: 'Douce', description: 'Liseré fin + ombre légère.' },
  { value: 'solid', label: 'Solide', description: 'Bordure nette configurable.' },
  { value: 'accent', label: 'Accent', description: 'Bordure teintée avec la couleur accent.' },
];

export const PORTFOLIO_SERVICES_CARD_BACKGROUND_ALTERNATION_OPTIONS: {
  value: PortfolioServicesCardBackgroundAlternation;
  label: string;
  description: string;
}[] = [
  {
    value: 'uniform',
    label: 'Uniforme',
    description: 'Toutes les cartes utilisent la même couleur de fond.',
  },
  {
    value: 'alternate',
    label: 'Alterné',
    description: 'Alterne deux couleurs (A / B) d’une carte à l’autre. Nécessite un fond uni.',
  },
];

export const PORTFOLIO_SERVICES_CARD_RADIUS_OPTIONS: {
  value: PortfolioServicesCardRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Coins droits.' },
  { value: 'sm', label: 'S', description: 'Léger arrondi.' },
  { value: 'md', label: 'M', description: 'Arrondi moyen.' },
  { value: 'lg', label: 'L', description: 'Arrondi généreux.' },
  { value: 'xl', label: 'XL', description: 'Très arrondi.' },
];

export const PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS: {
  value: PortfolioServicesCardPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Contenu collé au bord.' },
  { value: 'sm', label: 'S', description: 'Padding serré.' },
  { value: 'md', label: 'M', description: 'Padding équilibré.' },
  { value: 'lg', label: 'L', description: 'Padding généreux.' },
];

export const PORTFOLIO_SERVICES_COLUMNS_OPTIONS: {
  value: PortfolioServicesCardColumns;
  label: string;
  description: string;
}[] = [
  { value: 1, label: '1', description: 'Une colonne — pleine largeur.' },
  { value: 2, label: '2', description: 'Deux colonnes sur grand écran.' },
  { value: 3, label: '3', description: 'Trois colonnes — dense et équilibré.' },
  { value: 4, label: '4', description: 'Quatre colonnes — très compact.' },
];

export const PORTFOLIO_SERVICES_CONTENT_ALIGNMENT_OPTIONS: {
  value: PortfolioServicesContentAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Éléments alignés à gauche.' },
  { value: 'center', label: 'Centre', description: 'Éléments centrés.' },
  { value: 'right', label: 'Droite', description: 'Éléments alignés à droite.' },
];

export const PORTFOLIO_SERVICES_PRICE_PLACEMENT_OPTIONS: {
  value: PortfolioServicesPricePlacement;
  label: string;
  description: string;
}[] = [
  { value: 'end', label: 'À droite', description: 'Prix / livraison à côté du titre.' },
  { value: 'below', label: 'En dessous', description: 'Prix sous le texte principal.' },
  { value: 'top', label: 'En haut', description: 'Prix mis en avant avant le titre.' },
];

export const PORTFOLIO_SERVICES_ICON_PLACEMENT_OPTIONS: {
  value: PortfolioServicesIconPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'start', label: 'À gauche', description: 'Icône avant le titre (ligne).' },
  { value: 'top', label: 'Au-dessus', description: 'Icône centrée au-dessus du texte.' },
];

export const PORTFOLIO_SERVICES_CARD_DESIGN_OPTIONS: {
  value: PortfolioServicesCardDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Ombre portée et hover chaleureux — laisse voir le fond diagonal.',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Plat et épuré — fin liseré gris, sans ombre.',
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Fond gris clair, typo serrée — idéal en grille dense.',
  },
  {
    value: 'glass',
    label: 'Glass',
    description: 'Verre dépoli, transparence et reflet teinté accent.',
  },
  {
    value: 'frost',
    label: 'Frost',
    description: 'Verre dépoli neutre — blanc pur, sans teinte chaude.',
  },
  {
    value: 'accent',
    label: 'Accent edge',
    description: 'Bandeau coloré à gauche + fond teinté accent.',
  },
];

export const PORTFOLIO_SERVICES_CARD_DESIGN_INTENSITY_HINTS: Record<
  PortfolioServicesCardDesign,
  { label: string; low: string; high: string }
> = {
  editorial: {
    label: 'Intensité du dégradé & ombre',
    low: 'Ombre légère, wash discret',
    high: 'Dégradé orange marqué, ombre profonde',
  },
  minimal: {
    label: 'Intensité du liseré',
    low: 'Bordure très fine et pâle',
    high: 'Liseré net et visible',
  },
  compact: {
    label: 'Intensité du fond gris',
    low: 'Fond presque blanc',
    high: 'Contraste gris plus fort',
  },
  glass: {
    label: 'Intensité du verre dépoli',
    low: 'Léger flou et transparence',
    high: 'Flou épais, reflet lumineux fort',
  },
  frost: {
    label: 'Intensité du verre neutre',
    low: 'Léger flou et transparence',
    high: 'Flou épais, reflet blanc fort',
  },
  accent: {
    label: 'Intensité du bandeau accent',
    low: 'Bandeau fin, teinte légère',
    high: 'Bandeau large, fond teinté marqué',
  },
};

export const PORTFOLIO_SERVICES_CARD_DESIGN_TINT_HINTS: Record<
  PortfolioServicesCardDesign,
  { label: string; low: string; high: string }
> = {
  editorial: {
    label: 'Teinte du dégradé',
    low: 'Sans wash coloré',
    high: 'Wash accent saturé',
  },
  minimal: {
    label: 'Teinte',
    low: '—',
    high: '—',
  },
  compact: {
    label: 'Teinte',
    low: '—',
    high: '—',
  },
  glass: {
    label: 'Teinte du reflet',
    low: 'Blanc pur',
    high: 'Reflet accent marqué',
  },
  frost: {
    label: 'Teinte optionnelle',
    low: 'Verre 100 % neutre',
    high: 'Légère teinte accent',
  },
  accent: {
    label: 'Teinte du fond',
    low: 'Fond presque blanc',
    high: 'Fond accent prononcé',
  },
};

export const PORTFOLIO_SERVICES_STAGE_DESIGN_OPTIONS: {
  value: PortfolioServicesStageDesign;
  label: string;
  description: string;
}[] = [
  { value: 'framed', label: 'Framed panel', description: 'Bordered container around the content.' },
  { value: 'soft', label: 'Soft panel', description: 'Light background padding without hard border.' },
  { value: 'open', label: 'Open', description: 'No outer wrapper — cards float freely.' },
  { value: 'none', label: 'None', description: 'Same as open — maximum air.' },
];

export const PORTFOLIO_SERVICES_STAGE_BORDER_OPTIONS: {
  value: PortfolioServicesStageBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Sans bordure autour du stage.' },
  { value: 'soft', label: 'Douce', description: 'Liseré fin autour du panneau.' },
  { value: 'solid', label: 'Solide', description: 'Bordure nette configurable.' },
];

export const PORTFOLIO_SERVICES_STAGE_RADIUS_OPTIONS: {
  value: PortfolioServicesStageRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Coins droits.' },
  { value: 'sm', label: 'S', description: 'Léger arrondi.' },
  { value: 'md', label: 'M', description: 'Arrondi moyen.' },
  { value: 'lg', label: 'L', description: 'Arrondi généreux.' },
  { value: 'xl', label: 'XL', description: 'Très arrondi (défaut Soft / Framed).' },
];

export const PORTFOLIO_SERVICES_STAGE_PADDING_OPTIONS: {
  value: PortfolioServicesStagePadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Contenu collé au bord du stage.' },
  { value: 'sm', label: 'S', description: 'Padding serré.' },
  { value: 'md', label: 'M', description: 'Padding équilibré (défaut).' },
  { value: 'lg', label: 'L', description: 'Padding généreux.' },
];

export const PORTFOLIO_SERVICES_STAGE_PATTERN_OPTIONS: {
  value: PortfolioServicesStagePattern;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Fond uni uniquement.' },
  { value: 'dots', label: 'Points', description: 'Trame de points discrète.' },
  { value: 'grid', label: 'Grille', description: 'Quadrillage léger sur le fond.' },
  { value: 'diagonal', label: 'Diagonale', description: 'Hachures diagonales.' },
];

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioServicesSubtitlePreset, 'default' | 'custom' | 'minimal'>,
  string
> = {
  short: 'Tools, services, and how I can help on your next project.',
  collaboration: 'Tailored support from brief to delivery — built around your goals.',
  craft: 'Hands-on expertise across tools and services you can rely on.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

const PORTFOLIO_SERVICES_CARD_DESIGNS: PortfolioServicesCardDesign[] = [
  'editorial',
  'minimal',
  'compact',
  'glass',
  'frost',
  'accent',
];

function clampCardDesignIntensity(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function hexWithAlpha(hex: string, alpha: number): string {
  const channel = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${sanitizeHex(hex, DEFAULT_SERVICES_ACCENT_COLOR)}${channel}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = sanitizeHex(hex, DEFAULT_SERVICES_ACCENT_COLOR).replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function servicesCardDesignSupportsTint(design: PortfolioServicesCardDesign): boolean {
  return design === 'editorial' || design === 'glass' || design === 'frost' || design === 'accent';
}

export function resolveCardDesignIntensity(
  intensities: PortfolioServicesCardDesignIntensities,
  design: PortfolioServicesCardDesign
): number {
  return clampCardDesignIntensity(intensities[design], DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES[design]);
}

function mergeCardDesignIntensities(
  base: PortfolioServicesCardDesignIntensities,
  patch: unknown
): PortfolioServicesCardDesignIntensities {
  if (!patch || typeof patch !== 'object') return { ...DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES, ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES, ...base };
  for (const design of PORTFOLIO_SERVICES_CARD_DESIGNS) {
    if (record[design] !== undefined) {
      next[design] = clampCardDesignIntensity(record[design], base[design] ?? DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES[design]);
    }
  }
  return next;
}

function mergeCardDesignTints(
  base: PortfolioServicesCardDesignTints,
  patch: unknown
): PortfolioServicesCardDesignTints {
  if (!patch || typeof patch !== 'object') return { ...DEFAULT_SERVICES_CARD_DESIGN_TINTS, ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...DEFAULT_SERVICES_CARD_DESIGN_TINTS, ...base };
  for (const design of PORTFOLIO_SERVICES_CARD_DESIGNS) {
    if (record[design] !== undefined) {
      next[design] = clampCardDesignIntensity(record[design], base[design] ?? DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]);
    }
  }
  return next;
}

export function resolveCardDesignTint(
  tints: PortfolioServicesCardDesignTints,
  design: PortfolioServicesCardDesign
): number {
  return clampCardDesignIntensity(tints[design], DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]);
}

function glassSurfaceStyle(intensity: number): {
  borderColor: string;
  borderWidth: string;
  borderStyle: 'solid';
  backdropFilter: string;
  WebkitBackdropFilter: string;
  boxShadow: string;
} {
  const t = intensity / 100;
  return {
    borderColor: `rgba(255,255,255,${0.45 + t * 0.45})`,
    borderWidth: '1px',
    borderStyle: 'solid',
    backdropFilter: `blur(${Math.round(4 + t * 22)}px)`,
    WebkitBackdropFilter: `blur(${Math.round(4 + t * 22)}px)`,
    boxShadow: `0 ${Math.round(6 + t * 10)}px ${Math.round(16 + t * 20)}px -${Math.round(4 + t * 8)}px rgba(15,23,42,${0.04 + t * 0.1})`,
  };
}

export function servicesCardDesignIntensityStyle(
  design: PortfolioServicesCardDesign,
  intensity: number,
  accentColor: string,
  tint = DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]
): CSSProperties {
  const t = clampCardDesignIntensity(intensity, DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES[design]) / 100;
  const tintMix = clampCardDesignIntensity(tint, DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]) / 100;
  const accent = sanitizeHex(accentColor, DEFAULT_SERVICES_ACCENT_COLOR);
  const { r, g, b } = hexToRgb(accent);

  switch (design) {
    case 'editorial': {
      const wash = tintMix * (0.04 + t * 0.2);
      return {
        boxShadow: `0 ${Math.round(4 + t * 14)}px ${Math.round(10 + t * 22)}px -${Math.round(2 + t * 6)}px rgba(15,23,42,${0.05 + t * 0.14})`,
        ...(wash > 0
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(${r},${g},${b},${wash}) 0%, transparent 58%)`,
            }
          : {}),
      };
    }
    case 'minimal': {
      const alpha = 0.08 + t * 0.35;
      const width = 1 + Math.round(t * 2);
      return {
        boxShadow: 'none',
        outline: `${width}px solid rgba(163,163,163,${alpha})`,
        outlineOffset: '-1px',
      };
    }
    case 'compact': {
      const gray = Math.round(250 - t * 38);
      return {
        backgroundColor: `rgb(${gray},${gray},${Math.min(255, gray + 2)})`,
      };
    }
    case 'glass': {
      const warmAlpha = tintMix * (0.08 + t * 0.22);
      return {
        backgroundImage:
          warmAlpha > 0
            ? `linear-gradient(135deg, rgba(255,255,255,${0.35 + t * 0.45}) 0%, rgba(${r},${g},${b},${warmAlpha}) 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,${0.35 + t * 0.45}) 0%, rgba(255,255,255,${0.15 + t * 0.25}) 100%)`,
        ...glassSurfaceStyle(t * 100),
      };
    }
    case 'frost': {
      const optionalTint = tintMix * (0.05 + t * 0.16);
      return {
        backgroundImage:
          optionalTint > 0
            ? `linear-gradient(135deg, rgba(255,255,255,${0.35 + t * 0.45}) 0%, rgba(248,250,252,${0.18 + t * 0.28}) 55%, rgba(${r},${g},${b},${optionalTint}) 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,${0.35 + t * 0.45}) 0%, rgba(248,250,252,${0.2 + t * 0.35}) 100%)`,
        ...glassSurfaceStyle(t * 100),
      };
    }
    case 'accent': {
      const borderW = Math.round(2 + t * 6);
      const wash = tintMix * (0.05 + t * 0.28);
      return {
        borderLeftWidth: `${borderW}px`,
        borderLeftStyle: 'solid',
        borderLeftColor: accent,
        ...(wash > 0
          ? {
              backgroundImage: `linear-gradient(90deg, ${hexWithAlpha(accent, wash)} 0%, transparent ${Math.round(38 + t * 28)}%)`,
            }
          : {}),
      };
    }
    default:
      return {};
  }
}

export function resolveServicesSectionTitle(
  settings: Pick<PortfolioServicesSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  switch (settings.titlePreset) {
    case 'expertise':
      return 'EXPERTISE';
    case 'what-i-offer':
      return 'WHAT I OFFER';
    case 'skills-services':
      return 'SKILLS & SERVICES';
    case 'custom':
      return settings.titleCustom.trim() || settings.title.trim() || 'SERVICES & SKILLS';
    default:
      return 'SERVICES & SKILLS';
  }
}

export function resolveServicesSectionSubtitle(
  settings: Pick<PortfolioServicesSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'collaboration':
      return SUBTITLE_PRESET_COPY.collaboration;
    case 'craft':
      return SUBTITLE_PRESET_COPY.craft;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function servicesHeaderFontClass(font: PortfolioServicesHeaderFont, kind: 'title' | 'subtitle'): string {
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

export function servicesHeaderFontStyle(font: PortfolioServicesHeaderFont): CSSProperties | undefined {
  if (font === 'serif') return { fontFamily: "'Playfair Display', serif" };
  return undefined;
}

export function servicesTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_SERVICES_TITLE_COLOR) };
}

export function servicesSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_SERVICES_SUBTITLE_COLOR) };
}

function servicesStageRadiusClass(radius: PortfolioServicesStageRadius): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-xl sm:rounded-2xl';
    case 'md':
      return 'rounded-2xl sm:rounded-[1.5rem]';
    case 'lg':
      return 'rounded-[1.5rem] sm:rounded-[1.75rem]';
    default:
      return 'rounded-[1.75rem] sm:rounded-[2rem]';
  }
}

function servicesStagePaddingClass(padding: PortfolioServicesStagePadding): string {
  switch (padding) {
    case 'none':
      return '';
    case 'sm':
      return 'px-1.5 py-2 sm:px-2 sm:py-3';
    case 'lg':
      return 'px-3 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-8';
    default:
      return 'px-2 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6';
  }
}

function servicesStageBorderWidthClass(border: PortfolioServicesStageBorder): string {
  switch (border) {
    case 'soft':
      return 'border';
    case 'solid':
      return 'border-2';
    default:
      return 'border-0';
  }
}

function servicesStagePatternImage(
  pattern: PortfolioServicesStagePattern,
  color: string,
  opacity: number
): string | undefined {
  if (pattern === 'none') return undefined;
  const { r, g, b } = hexToRgb(sanitizeHex(color, DEFAULT_SERVICES_STAGE_PATTERN_COLOR));
  const a = Math.min(1, Math.max(0, opacity / 100));
  const ink = `rgba(${r}, ${g}, ${b}, ${a})`;
  switch (pattern) {
    case 'dots':
      return `radial-gradient(circle at 1px 1px, ${ink} 1px, transparent 0)`;
    case 'grid':
      return `linear-gradient(to right, ${ink} 1px, transparent 1px), linear-gradient(to bottom, ${ink} 1px, transparent 1px)`;
    case 'diagonal':
      return `repeating-linear-gradient(135deg, ${ink} 0 1px, transparent 1px 10px)`;
    default:
      return undefined;
  }
}

function servicesStagePatternSize(pattern: PortfolioServicesStagePattern): string | undefined {
  switch (pattern) {
    case 'dots':
      return '14px 14px';
    case 'grid':
      return '18px 18px, 18px 18px';
    case 'diagonal':
      return undefined;
    default:
      return undefined;
  }
}

/** Whether the stage needs a DOM wrapper for the chosen design + chrome. */
export function servicesStageNeedsShell(
  design: PortfolioServicesStageDesign,
  chrome: PortfolioServicesStageChromeSettings = DEFAULT_SERVICES_STAGE_CHROME
): boolean {
  if (design === 'soft' || design === 'framed') return true;
  return servicesStageChromeIsActive(chrome);
}

export function servicesStageShellClass(
  design: PortfolioServicesStageDesign,
  chrome: PortfolioServicesStageChromeSettings = DEFAULT_SERVICES_STAGE_CHROME
): string {
  if (!servicesStageNeedsShell(design, chrome)) return '';

  const parts = [
    'relative overflow-hidden',
    servicesStageRadiusClass(chrome.stageBorderRadius),
    servicesStagePaddingClass(chrome.stagePadding),
  ];
  if (chrome.stageBorder !== 'none') {
    parts.push(servicesStageBorderWidthClass(chrome.stageBorder));
  }
  return parts.filter(Boolean).join(' ');
}

export function servicesStageShellStyle(
  chrome: PortfolioServicesStageChromeSettings = DEFAULT_SERVICES_STAGE_CHROME
): CSSProperties {
  const style: CSSProperties = {};

  if (chrome.stageBackgroundEnabled) {
    style.backgroundColor = hexWithAlpha(
      sanitizeHex(chrome.stageBackgroundColor, DEFAULT_SERVICES_STAGE_BACKGROUND_COLOR),
      chrome.stageBackgroundOpacity / 100
    );
  }

  if (chrome.stageBorder !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(chrome.stageBorderColor, DEFAULT_SERVICES_STAGE_BORDER_COLOR);
  }

  const patternImage = servicesStagePatternImage(
    chrome.stagePattern,
    chrome.stagePatternColor,
    chrome.stagePatternOpacity
  );
  if (patternImage) {
    style.backgroundImage = patternImage;
    const size = servicesStagePatternSize(chrome.stagePattern);
    if (size) style.backgroundSize = size;
  }

  return style;
}

export function pickServicesStageChrome(
  source: PortfolioServicesStageChromeSettings
): PortfolioServicesStageChromeSettings {
  return {
    stageBackgroundEnabled: source.stageBackgroundEnabled,
    stageBackgroundColor: source.stageBackgroundColor,
    stageBackgroundOpacity: source.stageBackgroundOpacity,
    stageBorder: source.stageBorder,
    stageBorderColor: source.stageBorderColor,
    stageBorderRadius: source.stageBorderRadius,
    stagePadding: source.stagePadding,
    stagePattern: source.stagePattern,
    stagePatternColor: source.stagePatternColor,
    stagePatternOpacity: source.stagePatternOpacity,
  };
}

function mergeServicesStageChrome(
  base: PortfolioServicesStageChromeSettings,
  record: Record<string, unknown>
): PortfolioServicesStageChromeSettings {
  const pickStage = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  return {
    stageBackgroundEnabled:
      typeof record.stageBackgroundEnabled === 'boolean'
        ? record.stageBackgroundEnabled
        : base.stageBackgroundEnabled,
    stageBackgroundColor: sanitizeHex(record.stageBackgroundColor, base.stageBackgroundColor),
    stageBackgroundOpacity: clampCardDesignIntensity(
      record.stageBackgroundOpacity,
      base.stageBackgroundOpacity
    ),
    stageBorder: pickStage(record.stageBorder, ['none', 'soft', 'solid'] as const, base.stageBorder),
    stageBorderColor: sanitizeHex(record.stageBorderColor, base.stageBorderColor),
    stageBorderRadius: pickStage(
      record.stageBorderRadius,
      ['none', 'sm', 'md', 'lg', 'xl'] as const,
      base.stageBorderRadius
    ),
    stagePadding: pickStage(
      record.stagePadding,
      ['none', 'sm', 'md', 'lg'] as const,
      base.stagePadding
    ),
    stagePattern: pickStage(
      record.stagePattern,
      ['none', 'dots', 'grid', 'diagonal'] as const,
      base.stagePattern
    ),
    stagePatternColor: sanitizeHex(record.stagePatternColor, base.stagePatternColor),
    stagePatternOpacity: clampCardDesignIntensity(
      record.stagePatternOpacity,
      base.stagePatternOpacity
    ),
  };
}

export function servicesCardDesignShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted' = 'light',
  options?: { applyMutedClass?: boolean; omitDefaultFill?: boolean }
): string {
  const base = 'pf-services-card group relative h-full overflow-hidden transition';
  const applyMuted = options?.applyMutedClass !== false && tone === 'muted';
  const muted = applyMuted ? 'pf-muted-card-gradient' : '';
  const omitFill = options?.omitDefaultFill === true;
  // Default Tailwind fills fight palette / custom hex — omit when surface style owns the fill.
  const lightFill = omitFill ? '' : 'bg-white';
  const darkFill = omitFill ? '' : 'dark:bg-neutral-900';
  switch (design) {
    case 'minimal':
      return `${base} ${lightFill} shadow-none ${darkFill} ${muted}`.trim();
    case 'compact':
      return `${base} ${omitFill ? '' : 'dark:bg-neutral-900/80'} ${muted}`.trim();
    case 'glass':
    case 'frost':
      return `${base} ${muted}`.trim();
    case 'accent':
      return `${base} ${lightFill} shadow-none ${darkFill} ${muted}`.trim();
    default:
      return `${base} ${lightFill} ${darkFill} hover:border-orange-200/80 ${muted}`.trim();
  }
}

export function resolveServicesCardTone(
  index: number,
  alternation: PortfolioServicesCardBackgroundAlternation = 'uniform',
  rowOffset: 0 | 1 = 0
): 'light' | 'muted' {
  if (alternation !== 'alternate') return 'light';
  return (index + rowOffset) % 2 === 0 ? 'light' : 'muted';
}

/** Compact / glass paint their own fill — they win over the diagonal split layer.
 *  Frost stays translucent so the default diagonal theme remains visible. */
export function servicesCardDesignOwnsBackground(design: PortfolioServicesCardDesign): boolean {
  return design === 'compact' || design === 'glass';
}

/** True when the user-controlled card fill should win over theme/design defaults. */
export function servicesCardHasCustomFill(
  p: Pick<
    PortfolioServicesPresentationSettings,
    'cardDesign' | 'cardBackgroundFill' | 'cardBackgroundEnabled' | 'cardBackgroundAlternation'
  >
): boolean {
  if (servicesCardDesignOwnsBackground(p.cardDesign)) return false;
  if (p.cardBackgroundFill === 'split') return true;
  if (p.cardBackgroundAlternation === 'alternate') return true;
  return p.cardBackgroundEnabled;
}

export function servicesCardFillDataAttrs(
  p: Pick<
    PortfolioServicesPresentationSettings,
    'cardDesign' | 'cardBackgroundFill' | 'cardBackgroundEnabled' | 'cardBackgroundAlternation'
  >
): { 'data-pf-card-fill'?: 'custom' } {
  return servicesCardHasCustomFill(p) ? { 'data-pf-card-fill': 'custom' } : {};
}

export function servicesCardDesignStyle(
  design: PortfolioServicesCardDesign,
  accentColor: string,
  intensity = DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES[design],
  tint = DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]
): CSSProperties {
  return servicesCardDesignIntensityStyle(design, intensity, accentColor, tint);
}

/** @deprecated Use servicesCardDesignStyle — kept for callers during migration */
export function servicesCardAccentStyle(
  design: PortfolioServicesCardDesign,
  accentColor: string
): CSSProperties | undefined {
  return servicesCardDesignStyle(design, accentColor);
}

export function servicesCardTypographyClass(design: PortfolioServicesCardDesign): {
  title: string;
  body: string;
  icon: number;
  iconShell: string;
} {
  if (design === 'compact') {
    return {
      title: 'text-base font-bold sm:text-lg',
      body: 'text-xs sm:text-sm',
      icon: 24,
      iconShell: 'h-10 w-10',
    };
  }
  if (design === 'minimal') {
    return {
      title: 'text-lg font-semibold sm:text-xl',
      body: 'text-sm',
      icon: 28,
      iconShell: 'h-12 w-12',
    };
  }
  if (design === 'glass' || design === 'frost') {
    return {
      title: 'text-lg font-bold sm:text-xl',
      body: 'text-sm',
      icon: 30,
      iconShell: 'h-12 w-12',
    };
  }
  return {
    title: 'text-xl font-extrabold sm:text-2xl',
    body: 'text-base sm:text-[1.05rem]',
    icon: 34,
    iconShell: 'h-14 w-14 sm:h-16 sm:w-16',
  };
}

export function servicesListIconShellClass(design: PortfolioServicesCardDesign): string {
  switch (design) {
    case 'minimal':
      return 'text-neutral-700 dark:text-neutral-200';
    case 'compact':
      return 'text-neutral-800 dark:text-neutral-100';
    case 'glass':
    case 'frost':
      return 'text-neutral-800 dark:text-white';
    case 'accent':
      return 'text-white';
    default:
      return 'text-white';
  }
}

export function servicesListIconShellStyle(
  design: PortfolioServicesCardDesign,
  intensities: PortfolioServicesCardDesignIntensities,
  accentColor: string,
  tints?: PortfolioServicesCardDesignTints
): CSSProperties | undefined {
  const intensity = resolveCardDesignIntensity(intensities, design);
  const t = intensity / 100;
  const accent = sanitizeHex(accentColor, DEFAULT_SERVICES_ACCENT_COLOR);
  const tintMix = tints ? resolveCardDesignTint(tints, design) / 100 : 0;
  const { r, g, b } = hexToRgb(accent);

  switch (design) {
    case 'minimal': {
      const gray = Math.round(245 - t * 50);
      return { backgroundColor: `rgb(${gray},${gray},${gray})` };
    }
    case 'compact': {
      const gray = Math.round(229 - t * 45);
      return { backgroundColor: `rgb(${gray},${gray},${Math.min(255, gray + 2)})` };
    }
    case 'glass':
      return {
        backgroundColor:
          tintMix > 0
            ? `rgba(${Math.round(255 * (1 - tintMix * 0.35) + r * tintMix * 0.35)},${Math.round(255 * (1 - tintMix * 0.35) + g * tintMix * 0.35)},${Math.round(255 * (1 - tintMix * 0.35) + b * tintMix * 0.35)},${0.2 + t * 0.55})`
            : `rgba(255,255,255,${0.2 + t * 0.55})`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: `rgba(255,255,255,${0.4 + t * 0.45})`,
        backdropFilter: `blur(${Math.round(2 + t * 10)}px)`,
        WebkitBackdropFilter: `blur(${Math.round(2 + t * 10)}px)`,
      };
    case 'frost':
      return {
        backgroundColor:
          tintMix > 0
            ? `rgba(${Math.round(248 * (1 - tintMix) + r * tintMix)},${Math.round(250 * (1 - tintMix) + g * tintMix)},${Math.round(252 * (1 - tintMix) + b * tintMix)},${0.22 + t * 0.5})`
            : `rgba(248,250,252,${0.22 + t * 0.5})`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: `rgba(255,255,255,${0.45 + t * 0.4})`,
        backdropFilter: `blur(${Math.round(2 + t * 10)}px)`,
        WebkitBackdropFilter: `blur(${Math.round(2 + t * 10)}px)`,
      };
    case 'accent':
      return { backgroundColor: accent, opacity: 0.75 + t * 0.25 };
    default: {
      const dark = Math.round(10 + (1 - t) * 15);
      return { backgroundColor: `rgb(${dark},${dark},${dark})` };
    }
  }
}

export function servicesCardShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted',
  presentation?: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'useHeroPalette'
  >
): string {
  const custom = presentation ? servicesCardHasCustomFill(presentation) : false;
  const omitDefaultFill = custom || presentation?.useHeroPalette !== false;
  return `${servicesCardDesignShellClass(design, tone, {
    applyMutedClass: !custom,
    omitDefaultFill,
  })} flex flex-col`;
}

export function servicesServiceCardMinHeight(design: PortfolioServicesCardDesign): string {
  return design === 'compact' ? 'min-h-[18rem]' : design === 'minimal' ? 'min-h-[20rem]' : 'min-h-[22rem] sm:min-h-[23rem]';
}

export function servicesSkillCardMinHeight(design: PortfolioServicesCardDesign): string {
  return design === 'compact' ? 'min-h-[12rem]' : design === 'minimal' ? 'min-h-[13rem]' : 'min-h-[14rem] sm:min-h-[15rem]';
}

export function servicesGallerySupportsMarquee(layout: PortfolioServicesGalleryLayout): boolean {
  return layout === 'card';
}

export function servicesMarqueeActiveFor(
  presentation: Pick<
    PortfolioServicesPresentationSettings,
    'displayMode' | 'servicesGalleryLayout' | 'skillsGalleryLayout'
  >,
  kind: 'services' | 'skills'
): boolean {
  if (presentation.displayMode !== 'marquee') return false;
  const layout =
    kind === 'services' ? presentation.servicesGalleryLayout : presentation.skillsGalleryLayout;
  return servicesGallerySupportsMarquee(layout);
}

function servicesColumnsGridClass(columns: PortfolioServicesCardColumns, gapClass = 'gap-3'): string {
  switch (columns) {
    case 1:
      return `mx-auto flex w-full max-w-2xl flex-col ${gapClass}`;
    case 2:
      return `grid items-stretch ${gapClass} grid-cols-1 sm:grid-cols-2`;
    case 4:
      return `grid items-stretch ${gapClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
    default:
      // 3 columns: single on phone, 2 on tablet, 3 from lg (not only xl).
      return `grid items-stretch ${gapClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
  }
}

export function servicesGalleryContainerClass(
  layout: PortfolioServicesGalleryLayout,
  displayMode: PortfolioServicesDisplayMode,
  kind: 'services' | 'skills' = 'services',
  columns?: PortfolioServicesCardColumns
): string {
  const cols =
    columns ??
    (kind === 'skills'
      ? DEFAULT_SERVICES_PRESENTATION.skillsColumns
      : DEFAULT_SERVICES_PRESENTATION.servicesColumns);

  if (layout === 'list' || layout === 'accordion' || layout === 'pricing-hero') {
    return servicesColumnsGridClass(cols, layout === 'pricing-hero' ? 'gap-5' : 'gap-3');
  }

  if (displayMode === 'stack') {
    return servicesColumnsGridClass(1, 'gap-5');
  }

  return servicesColumnsGridClass(cols, 'gap-5');
}

export function servicesCardRadiusClass(radius: PortfolioServicesCardRadius): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-xl';
    case 'md':
      return 'rounded-2xl';
    case 'xl':
      return 'rounded-[2.25rem]';
    default:
      return 'rounded-[1.5rem]';
  }
}

export function servicesCardPaddingClass(padding: PortfolioServicesCardPadding): string {
  switch (padding) {
    case 'none':
      return 'p-0';
    case 'sm':
      return 'p-3 sm:p-3.5';
    case 'lg':
      return 'p-6 sm:p-7';
    default:
      return 'p-4 sm:p-5';
  }
}

function servicesCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
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

/** Frame override applied on top of design shells (border / radius / padding / bg). */
export function servicesCardFrameClass(p: PortfolioServicesPresentationSettings): string {
  const parts = [servicesCardRadiusClass(p.cardBorderRadius), servicesCardPaddingClass(p.cardPadding)];
  if (p.cardBorder !== 'none') {
    parts.push(servicesCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function servicesCardFrameStyle(p: PortfolioServicesPresentationSettings): CSSProperties {
  const style: CSSProperties = {};

  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_SERVICES_CARD_BACKGROUND_COLOR);
  }

  if (p.cardBorder === 'accent') {
    const accent = sanitizeHex(p.cardAccentColor, DEFAULT_SERVICES_ACCENT_COLOR);
    style.borderColor = accent;
  } else if (p.cardBorder === 'soft' || p.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.cardBorderColor, DEFAULT_SERVICES_CARD_BORDER_COLOR);
  }

  return style;
}

/** Merges design-specific surface (accent bar, glass blur) with user frame overrides. */
export function servicesCardSurfaceStyle(
  p: PortfolioServicesPresentationSettings,
  tone: 'light' | 'muted' = 'light'
): CSSProperties {
  const intensity = resolveCardDesignIntensity(p.cardDesignIntensities, p.cardDesign);
  const tint = resolveCardDesignTint(p.cardDesignTints, p.cardDesign);
  const designStyle = servicesCardDesignIntensityStyle(p.cardDesign, intensity, p.cardAccentColor, tint);
  const frameStyle = servicesCardFrameStyle(p);
  const designOwnsBackground = servicesCardDesignOwnsBackground(p.cardDesign);
  const lightColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_SERVICES_CARD_BACKGROUND_COLOR);
  const mutedColor = sanitizeHex(p.cardBackgroundColorB, DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B);

  // Alternating solid fills — do not require the "enable fill" toggle (alternation implies fill).
  if (p.cardBackgroundAlternation === 'alternate' && p.cardBackgroundFill !== 'split' && !designOwnsBackground) {
    return {
      ...designStyle,
      ...frameStyle,
      backgroundImage: 'none',
      backgroundColor: tone === 'muted' ? mutedColor : lightColor,
      ['--pf-card-muted-bg' as string]: mutedColor,
    };
  }

  // Diagonal / geometric split is drawn in ServicesCardBackgroundLayers.
  if (p.cardBackgroundFill === 'split' && !designOwnsBackground) {
    const { backgroundColor: _bg, backgroundImage: _img, ...restDesign } = designStyle as CSSProperties & {
      backgroundColor?: string;
      backgroundImage?: string;
    };
    void _bg;
    void _img;
    return {
      ...restDesign,
      ...frameStyle,
      backgroundColor: 'transparent',
      backgroundImage: 'none',
    };
  }

  // Uniform solid fill when enabled — clear design backgroundImage so the color is visible.
  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled && !designOwnsBackground) {
    return {
      ...designStyle,
      ...frameStyle,
      backgroundImage: 'none',
      backgroundColor: lightColor,
    };
  }

  return {
    ...designStyle,
    ...frameStyle,
  };
}

export function servicesContentAlignClass(alignment: PortfolioServicesContentAlignment): {
  container: string;
  text: string;
  row: string;
  block: string;
} {
  switch (alignment) {
    case 'center':
      return {
        container: 'items-center',
        text: 'text-center',
        row: 'justify-center',
        block: 'mx-auto',
      };
    case 'right':
      return {
        container: 'items-end',
        text: 'text-right',
        row: 'justify-end',
        block: 'ml-auto',
      };
    default:
      return {
        container: 'items-start',
        text: 'text-left',
        row: 'justify-start',
        block: '',
      };
  }
}

export function servicesListRowShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted' = 'light',
  presentation?: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'useHeroPalette'
  >
): string {
  const custom = presentation ? servicesCardHasCustomFill(presentation) : false;
  const omitDefaultFill = custom || presentation?.useHeroPalette !== false;
  return servicesCardDesignShellClass(design, tone, {
    applyMutedClass: !custom,
    omitDefaultFill,
  });
}

export function servicesAccordionShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted' = 'light',
  presentation?: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'useHeroPalette'
  >
): string {
  return `${servicesListRowShellClass(design, tone, presentation)} overflow-hidden`;
}

export function servicesPricingHeroShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted' = 'light',
  presentation?: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'useHeroPalette'
  >
): string {
  return `${servicesListRowShellClass(design, tone, presentation)} flex flex-col`;
}

export function servicesGridClass(displayMode: PortfolioServicesDisplayMode): string {
  if (displayMode === 'stack') return 'flex flex-col gap-5';
  return 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3';
}

export function servicesCardWidthClass(displayMode: PortfolioServicesDisplayMode): string {
  if (displayMode === 'stack') return 'w-full';
  return 'w-[20.5rem] shrink-0 py-1 sm:w-[22rem] lg:w-[26rem]';
}

export function pickServicesPresentationSettings(services: unknown): PortfolioServicesPresentationSettings {
  return mergeServicesPresentation(DEFAULT_SERVICES_PRESENTATION, services);
}

/** Legacy `none` (old factory uniforme) → `alternate`. Explicit uniforme is now `uniform`. */
export function pickServicesCardBackgroundAlternation(
  value: unknown,
  fallback: PortfolioServicesCardBackgroundAlternation
): PortfolioServicesCardBackgroundAlternation {
  if (value === 'alternate' || value === 'uniform') return value;
  if (value === 'none') return 'alternate';
  return fallback;
}

export function mergeServicesPresentation(
  base: PortfolioServicesPresentationSettings,
  patch: unknown
): PortfolioServicesPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const pickColumns = (value: unknown, fallback: PortfolioServicesCardColumns): PortfolioServicesCardColumns => {
    const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    return n === 1 || n === 2 || n === 3 || n === 4 ? n : fallback;
  };

  const background = mergeSectionBackground(base, patch);
  const cardBackground = withMigratedServicesCardBackground(
    mergeServicesCardBackgroundSettings(base, patch)
  );
  const cardDecor = mergeServicesCardDecorSettings(base, patch);

  const organizationRaw = record.sectionOrganization;
  const layoutModeRaw = record.layoutMode;
  let sectionOrganization = base.sectionOrganization ?? 'combined';
  if (
    organizationRaw === 'combined' ||
    organizationRaw === 'separated' ||
    organizationRaw === 'distinct'
  ) {
    sectionOrganization = organizationRaw;
  } else if (layoutModeRaw === 'separated') {
    sectionOrganization = 'separated';
  } else if (layoutModeRaw === 'combined') {
    sectionOrganization = 'combined';
  }
  const layoutMode: PortfolioServicesLayoutMode =
    sectionOrganization === 'combined' ? 'combined' : 'separated';

  const mergedPresentation = {
    ...background,
    ...cardBackground,
    ...cardDecor,
    titlePreset: pick(record.titlePreset, ['services-skills', 'expertise', 'what-i-offer', 'skills-services', 'custom'], base.titlePreset),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'collaboration', 'craft', 'minimal', 'custom'],
      base.subtitlePreset
    ),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    headerAlignment: pick(record.headerAlignment, ['left', 'center'], base.headerAlignment),
    sectionOrganization,
    layoutMode,
    displayMode: pick(record.displayMode, ['marquee', 'grid', 'stack'], base.displayMode),
    servicesGalleryLayout: pick(
      record.servicesGalleryLayout,
      ['card', 'list', 'pricing-hero', 'accordion'],
      base.servicesGalleryLayout
    ),
    skillsGalleryLayout: pick(
      record.skillsGalleryLayout,
      ['card', 'list', 'pricing-hero', 'accordion'],
      base.skillsGalleryLayout
    ),
    stackOrder: pick(record.stackOrder, ['skills-first', 'services-first'], base.stackOrder),
    cardDesign: pick(record.cardDesign, ['editorial', 'minimal', 'compact', 'glass', 'frost', 'accent'], base.cardDesign),
    cardDesignIntensities: mergeCardDesignIntensities(base.cardDesignIntensities, record.cardDesignIntensities),
    cardDesignTints: mergeCardDesignTints(base.cardDesignTints, record.cardDesignTints),
    stageDesign: pick(record.stageDesign, ['framed', 'open', 'soft', 'none'], base.stageDesign),
    ...mergeServicesStageChrome(base, record),
    cardAccentColor: sanitizeHex(record.cardAccentColor, base.cardAccentColor),
    cardBorder: pick(record.cardBorder, ['none', 'soft', 'solid', 'accent'], base.cardBorder),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean'
        ? record.cardBackgroundEnabled
        : base.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderRadius: pick(record.cardBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardBorderRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    cardBackgroundAlternation: pickServicesCardBackgroundAlternation(
      record.cardBackgroundAlternation,
      base.cardBackgroundAlternation
    ),
    servicesColumns: pickColumns(record.servicesColumns, base.servicesColumns),
    skillsColumns: pickColumns(record.skillsColumns, base.skillsColumns),
    servicesContentAlignment: pick(
      record.servicesContentAlignment,
      ['left', 'center', 'right'],
      base.servicesContentAlignment
    ),
    skillsContentAlignment: pick(
      record.skillsContentAlignment,
      ['left', 'center', 'right'],
      base.skillsContentAlignment
    ),
    servicesPricePlacement: pick(
      record.servicesPricePlacement,
      ['end', 'below', 'top'],
      base.servicesPricePlacement
    ),
    skillsIconPlacement: pick(record.skillsIconPlacement, ['start', 'top'], base.skillsIconPlacement),
    showSkills: typeof record.showSkills === 'boolean' ? record.showSkills : base.showSkills,
    showServices: typeof record.showServices === 'boolean' ? record.showServices : base.showServices,
    showSkillIcon: typeof record.showSkillIcon === 'boolean' ? record.showSkillIcon : base.showSkillIcon,
    showSkillTitle: typeof record.showSkillTitle === 'boolean' ? record.showSkillTitle : base.showSkillTitle,
    showSkillDescription:
      typeof record.showSkillDescription === 'boolean' ? record.showSkillDescription : base.showSkillDescription,
    showServiceTitle: typeof record.showServiceTitle === 'boolean' ? record.showServiceTitle : base.showServiceTitle,
    showServiceDescription:
      typeof record.showServiceDescription === 'boolean' ? record.showServiceDescription : base.showServiceDescription,
    showServicePrice: typeof record.showServicePrice === 'boolean' ? record.showServicePrice : base.showServicePrice,
    showServiceDelivery:
      typeof record.showServiceDelivery === 'boolean' ? record.showServiceDelivery : base.showServiceDelivery,
    // Previous factory default was true — hide the “Typically replies…” line by default.
    showResponseTime: false,
    showSkillsSubheading:
      sectionOrganization === 'combined' &&
      (typeof record.showSkillsSubheading === 'boolean'
        ? record.showSkillsSubheading
        : base.showSkillsSubheading),
    showServicesSubheading:
      sectionOrganization === 'combined' &&
      (typeof record.showServicesSubheading === 'boolean'
        ? record.showServicesSubheading
        : base.showServicesSubheading),
    skillsSubheadingLabel:
      typeof record.skillsSubheadingLabel === 'string' ? record.skillsSubheadingLabel : base.skillsSubheadingLabel,
    servicesSubheadingLabel:
      typeof record.servicesSubheadingLabel === 'string'
        ? record.servicesSubheadingLabel
        : base.servicesSubheadingLabel,
    skillsIconSize: pick(record.skillsIconSize, ['sm', 'md', 'lg', 'xl'], base.skillsIconSize),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    servicesPalette: mergeServicesPalette(
      mergeServicesPalette(DEFAULT_SERVICES_PALETTE, base.servicesPalette),
      record.servicesPalette
    ),
    servicesColorBindings: mergeServicesColorBindings(
      mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, base.servicesColorBindings),
      record.servicesColorBindings
    ),
    elementStyles: normalizeServicesElementStyles(record.elementStyles ?? base.elementStyles),
  } satisfies Omit<
    PortfolioServicesPresentationSettings,
    'skillsBlock' | 'servicesBlock' | 'skillsHeader' | 'servicesHeader'
  >;

  const mergeBlock = (
    blockBase: PortfolioServicesBlockSettings,
    blockPatch: unknown,
    kind: PortfolioServicesBlockScope
  ): PortfolioServicesBlockSettings => {
    const fallback = createDefaultServicesBlockSettings(kind, {
      ...mergedPresentation,
      ...cardBackground,
    });
    if (!blockPatch || typeof blockPatch !== 'object') {
      const withoutPatch = {
        ...fallback,
        ...blockBase,
        cardBackgroundAlternation: pickServicesCardBackgroundAlternation(
          blockBase.cardBackgroundAlternation,
          fallback.cardBackgroundAlternation
        ),
      };
      return {
        ...withoutPatch,
        ...withMigratedServicesCardBackground(
          mergeServicesCardBackgroundSettings(fallback, withoutPatch)
        ),
      };
    }
    const blockRecord = blockPatch as Partial<PortfolioServicesBlockSettings>;
    const mergedBlock = { ...fallback, ...blockBase, ...blockRecord };
    return {
      ...mergedBlock,
      ...withMigratedServicesCardBackground(
        mergeServicesCardBackgroundSettings(fallback, mergedBlock)
      ),
      cardBackgroundAlternation: pickServicesCardBackgroundAlternation(
        blockRecord.cardBackgroundAlternation ?? blockBase.cardBackgroundAlternation,
        fallback.cardBackgroundAlternation
      ),
    };
  };

  const mergeDistinctHeader = (
    headerBase: PortfolioServicesDistinctHeaderSettings,
    headerPatch: unknown
  ): PortfolioServicesDistinctHeaderSettings => {
    if (!headerPatch || typeof headerPatch !== 'object') return headerBase;
    const headerRecord = headerPatch as Record<string, unknown>;
    return {
      titlePreset: pick(
        headerRecord.titlePreset,
        ['services-skills', 'expertise', 'what-i-offer', 'skills-services', 'custom'],
        headerBase.titlePreset
      ),
      titleCustom:
        typeof headerRecord.titleCustom === 'string' ? headerRecord.titleCustom : headerBase.titleCustom,
      subtitlePreset: pick(
        headerRecord.subtitlePreset,
        ['default', 'short', 'collaboration', 'craft', 'minimal', 'custom'],
        headerBase.subtitlePreset
      ),
      subtitleCustom:
        typeof headerRecord.subtitleCustom === 'string'
          ? headerRecord.subtitleCustom
          : headerBase.subtitleCustom,
      titleFont: pick(headerRecord.titleFont, ['sans', 'serif', 'display'], headerBase.titleFont),
      subtitleFont: pick(headerRecord.subtitleFont, ['sans', 'serif', 'display'], headerBase.subtitleFont),
      titleColor: sanitizeHex(headerRecord.titleColor, headerBase.titleColor),
      subtitleColor: sanitizeHex(headerRecord.subtitleColor, headerBase.subtitleColor),
      headerAlignment: pick(headerRecord.headerAlignment, ['left', 'center'], headerBase.headerAlignment),
    };
  };

  const merged: PortfolioServicesPresentationSettings = {
    ...mergedPresentation,
    skillsBlock: mergeBlock(base.skillsBlock, record.skillsBlock, 'skills'),
    servicesBlock: mergeBlock(base.servicesBlock, record.servicesBlock, 'services'),
    skillsHeader: mergeDistinctHeader(
      base.skillsHeader ?? createDefaultDistinctHeaderSettings('skills'),
      record.skillsHeader
    ),
    servicesHeader: mergeDistinctHeader(
      base.servicesHeader ?? createDefaultDistinctHeaderSettings('services'),
      record.servicesHeader
    ),
  };

  if (merged.useHeroPalette === false) {
    return merged;
  }

  return {
    ...merged,
    ...(applyServicesPaletteToSettings(merged) as Partial<PortfolioServicesPresentationSettings>),
    useHeroPalette: true,
  };
}
