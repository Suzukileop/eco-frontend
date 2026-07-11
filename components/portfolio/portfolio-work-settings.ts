import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
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
  type PortfolioElementTextStyle,
  type PortfolioToolsIconSize,
} from '@/components/portfolio/portfolio-element-text-style';

export type PortfolioWorkTitlePreset = 'portfolio' | 'selected-work' | 'projects' | 'my-work' | 'custom';

export type PortfolioWorkSubtitlePreset = 'default' | 'short' | 'process' | 'minimal' | 'custom';

export type PortfolioWorkHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioWorkHeaderAlignment = 'left' | 'center';

export type PortfolioWorkContentPlacement = 'side' | 'side-reverse' | 'bottom';

export type PortfolioWorkCardDesign =
  | 'editorial'
  | 'minimal'
  | 'compact'
  | 'stacked'
  | 'overlay'
  | 'framed';

export type PortfolioWorkCardBorder = 'none' | 'soft' | 'solid' | 'accent';

export type PortfolioWorkGalleryLayout = 'stack' | 'grid' | 'list' | 'overlay' | 'accordion';

/** How many project cards per row (stack / grid / overlay). Mobile always collapses. */
export type PortfolioWorkItemsPerRow = 1 | 2 | 3 | 4;

export type PortfolioWorkCardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioWorkCardPadding = 'none' | 'sm' | 'md' | 'lg';

export type PortfolioWorkCardGap = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioWorkCardContentAlignment = 'left' | 'center' | 'right';

export type PortfolioWorkCtaAlignment = 'left' | 'center' | 'right';

export type PortfolioWorkToolsDisplay = 'icons' | 'list' | 'both';
export type PortfolioWorkCtaDesign =
  | 'pill-dark'
  | 'pill-outline'
  | 'pill-accent'
  | 'text-arrow'
  | 'circle-icon';

/** How categories appear above the work gallery. */
export type PortfolioWorkCategoryDesign = 'pills' | 'underline' | 'tabs' | 'minimal';

/** Filter chips, grouped sections, both, or hidden. */
export type PortfolioWorkCategoryMode = 'off' | 'filter' | 'group' | 'filter-and-group';

/** Which per-card text element can be styled independently. */
export type PortfolioWorkStyleTarget =
  | 'cardTitle'
  | 'cardDescription'
  | 'toolsLabel'
  | 'toolsList'
  | 'categoryOnCard'
  | 'cta';

export type PortfolioWorkElementStyles = Record<PortfolioWorkStyleTarget, PortfolioElementTextStyle>;

export const WORK_STYLE_TARGET_IDS: PortfolioWorkStyleTarget[] = [
  'cardTitle',
  'cardDescription',
  'toolsLabel',
  'toolsList',
  'categoryOnCard',
  'cta',
];

export const DEFAULT_WORK_ELEMENT_STYLES: PortfolioWorkElementStyles = {
  cardTitle: createElementTextStyle({ color: '#0a0a0a', size: 'xl', bold: true }),
  cardDescription: createElementTextStyle({ color: '#737373', size: 'md' }),
  toolsLabel: createElementTextStyle({ color: '#a3a3a3', size: 'sm', bold: true, uppercase: true }),
  toolsList: createElementTextStyle({ color: '#404040', size: 'md', bold: true }),
  categoryOnCard: createElementTextStyle({ color: '#0a0a0a', size: 'sm', bold: true, uppercase: true }),
  cta: createElementTextStyle({ color: '#ea580c', size: 'md', bold: true, uppercase: true }),
};

export const PORTFOLIO_WORK_STYLE_TARGET_OPTIONS: {
  value: PortfolioWorkStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'cardTitle', label: 'Project title', description: 'Title text on each project card.' },
  { value: 'cardDescription', label: 'Description', description: 'Body text under the title.' },
  { value: 'toolsLabel', label: 'Tools label', description: '“Tools to use” heading above the tool logos.' },
  { value: 'toolsList', label: 'Tools list', description: 'Text list of tool names.' },
  { value: 'categoryOnCard', label: 'Category on card', description: 'Category name shown above the title.' },
  { value: 'cta', label: 'CTA text', description: 'View project button text.' },
];

export function normalizeWorkElementStyles(raw: unknown): PortfolioWorkElementStyles {
  return normalizeElementStylesRecord(raw, DEFAULT_WORK_ELEMENT_STYLES, WORK_STYLE_TARGET_IDS);
}

export function patchWorkElementStyle(
  styles: PortfolioWorkElementStyles,
  target: PortfolioWorkStyleTarget,
  patch: Partial<PortfolioElementTextStyle>
): PortfolioWorkElementStyles {
  return patchElementStylesRecord(styles, target, patch, DEFAULT_WORK_ELEMENT_STYLES, WORK_STYLE_TARGET_IDS);
}

export type PortfolioWorkPresentationSettings = PortfolioSectionBackgroundSettings & {
  titlePreset: PortfolioWorkTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioWorkSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioWorkHeaderFont;
  subtitleFont: PortfolioWorkHeaderFont;
  titleColor: string;
  subtitleColor: string;
  headerAlignment: PortfolioWorkHeaderAlignment;
  contentPlacement: PortfolioWorkContentPlacement;
  galleryLayout: PortfolioWorkGalleryLayout;
  /** Cards per row on large screens (stack / grid / overlay). */
  itemsPerRow: PortfolioWorkItemsPerRow;
  cardDesign: PortfolioWorkCardDesign;
  cardBorder: PortfolioWorkCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioWorkCardRadius;
  cardPadding: PortfolioWorkCardPadding;
  cardGap: PortfolioWorkCardGap;
  cardContentAlignment: PortfolioWorkCardContentAlignment;
  ctaAlignment: PortfolioWorkCtaAlignment;
  mediaRatio: number;
  showMarketplaceLink: boolean;
  showCardTitle: boolean;
  showCardDescription: boolean;
  showCardTools: boolean;
  showCardToolIcons: boolean;
  showCardToolList: boolean;
  showToolsLabel: boolean;
  /** Custom "Tools to use" label text (empty = default English label). */
  toolsLabelText: string;
  toolsIconSize: PortfolioToolsIconSize;
  showCardCta: boolean;
  ctaDesign: PortfolioWorkCtaDesign;
  ctaLabel: string;
  ctaColor: string;
  toolsDisplay: PortfolioWorkToolsDisplay;
  maxToolsShown: number;
  /** Category (content `genre`) filter / grouping. */
  categoryMode: PortfolioWorkCategoryMode;
  categoryDesign: PortfolioWorkCategoryDesign;
  showCategoryOnCard: boolean;
  categoryAllLabel: string;
  categoryUncategorizedLabel: string;
  categoryActiveColor: string;
  categoryMutedColor: string;
  /** Per-element color, font, size, and weight for card text. */
  elementStyles: PortfolioWorkElementStyles;
};

export type PortfolioWorkSectionSettings = PortfolioSectionCopy & PortfolioWorkPresentationSettings;

export const DEFAULT_WORK_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_WORK_SUBTITLE_COLOR = '#737373';
export const DEFAULT_WORK_CTA_COLOR = '#ea580c';
export const DEFAULT_WORK_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_WORK_CARD_BACKGROUND_COLOR = '#fafafa';
export const DEFAULT_WORK_CATEGORY_ACTIVE_COLOR = '#0a0a0a';
export const DEFAULT_WORK_CATEGORY_MUTED_COLOR = '#737373';
export const DEFAULT_WORK_CATEGORY_ALL_LABEL = 'All';
export const DEFAULT_WORK_CATEGORY_UNCATEGORIZED_LABEL = 'Other';

export const DEFAULT_WORK_PRESENTATION: PortfolioWorkPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  titlePreset: 'portfolio',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'sans',
  titleColor: DEFAULT_WORK_TITLE_COLOR,
  subtitleColor: DEFAULT_WORK_SUBTITLE_COLOR,
  headerAlignment: 'left',
  contentPlacement: 'side',
  galleryLayout: 'stack',
  itemsPerRow: 1,
  cardDesign: 'editorial',
  cardBorder: 'none',
  cardBorderColor: DEFAULT_WORK_CARD_BORDER_COLOR,
  cardBackgroundEnabled: false,
  cardBackgroundColor: DEFAULT_WORK_CARD_BACKGROUND_COLOR,
  cardBorderRadius: 'lg',
  cardPadding: 'md',
  cardGap: 'lg',
  cardContentAlignment: 'left',
  ctaAlignment: 'left',
  mediaRatio: 53,
  showMarketplaceLink: true,
  showCardTitle: true,
  showCardDescription: true,
  showCardTools: true,
  showCardToolIcons: true,
  showCardToolList: true,
  showToolsLabel: true,
  toolsLabelText: '',
  toolsIconSize: 'md',
  showCardCta: true,
  ctaDesign: 'circle-icon',
  ctaLabel: 'View project',
  ctaColor: DEFAULT_WORK_CTA_COLOR,
  toolsDisplay: 'both',
  maxToolsShown: 12,
  categoryMode: 'filter',
  categoryDesign: 'pills',
  showCategoryOnCard: true,
  categoryAllLabel: DEFAULT_WORK_CATEGORY_ALL_LABEL,
  categoryUncategorizedLabel: DEFAULT_WORK_CATEGORY_UNCATEGORIZED_LABEL,
  categoryActiveColor: DEFAULT_WORK_CATEGORY_ACTIVE_COLOR,
  categoryMutedColor: DEFAULT_WORK_CATEGORY_MUTED_COLOR,
  elementStyles: DEFAULT_WORK_ELEMENT_STYLES,
};

export const PORTFOLIO_WORK_TITLE_PRESET_OPTIONS: {
  value: PortfolioWorkTitlePreset;
  label: string;
  description: string;
  preview: string;
}[] = [
  { value: 'portfolio', label: 'Portfolio', description: 'Classic editorial label.', preview: 'PORTFOLIO' },
  { value: 'selected-work', label: 'Selected work', description: 'Curated projects tone.', preview: 'SELECTED WORK' },
  { value: 'projects', label: 'Projects', description: 'Short and direct.', preview: 'PROJECTS' },
  { value: 'my-work', label: 'My work', description: 'Personal and approachable.', preview: 'MY WORK' },
  { value: 'custom', label: 'Custom', description: 'Your own section title text.', preview: 'Custom' },
];

export const PORTFOLIO_WORK_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioWorkSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  {
    value: 'short',
    label: 'Short',
    description: 'A concise line about your featured projects.',
  },
  {
    value: 'process',
    label: 'Process focus',
    description: 'Highlights craft, tools, and how you work.',
  },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle entirely.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_WORK_HEADER_FONT_OPTIONS: {
  value: PortfolioWorkHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_WORK_GALLERY_LAYOUT_OPTIONS: {
  value: PortfolioWorkGalleryLayout;
  label: string;
  description: string;
}[] = [
  { value: 'stack', label: 'Grille portfolio', description: 'Grandes cartes — colonnes réglables ci-dessous.' },
  { value: 'grid', label: 'Grille compacte', description: 'Cartes compactes, media au-dessus — colonnes réglables.' },
  { value: 'list', label: 'Liste compacte', description: 'Lignes fines avec vignette, titre et flèche.' },
  { value: 'overlay', label: 'Overlay immersif', description: 'Media plein avec texte superposé — colonnes réglables.' },
  { value: 'accordion', label: 'Accordéon', description: 'Lignes dépliables révélant les détails du projet.' },
];

export const PORTFOLIO_WORK_ITEMS_PER_ROW_OPTIONS: {
  value: '1' | '2' | '3' | '4';
  label: string;
  description: string;
}[] = [
  { value: '1', label: '1 par ligne', description: 'Pleine largeur — idéal mobile et grands projets.' },
  { value: '2', label: '2 par ligne', description: '2 colonnes dès tablette (md).' },
  { value: '3', label: '3 par ligne', description: '2 dès sm, 3 dès xl — dense sur grand écran.' },
  { value: '4', label: '4 par ligne', description: 'Jusqu’à 4 sur très grand écran — très compact.' },
];

export const PORTFOLIO_WORK_CATEGORY_MODE_OPTIONS: {
  value: PortfolioWorkCategoryMode;
  label: string;
  description: string;
}[] = [
  { value: 'off', label: 'Off', description: 'No category filter or grouping.' },
  { value: 'filter', label: 'Filter', description: 'Chip bar to filter projects by category.' },
  { value: 'group', label: 'Group', description: 'Projects listed under category headings.' },
  {
    value: 'filter-and-group',
    label: 'Filter + group',
    description: 'Filter chips and section headings together.',
  },
];

export const PORTFOLIO_WORK_CATEGORY_DESIGN_OPTIONS: {
  value: PortfolioWorkCategoryDesign;
  label: string;
  description: string;
}[] = [
  { value: 'pills', label: 'Pills', description: 'Rounded chips — clear and tap-friendly.' },
  { value: 'underline', label: 'Underline', description: 'Text links with an active underline.' },
  { value: 'tabs', label: 'Tabs', description: 'Segmented control in a soft tray.' },
  { value: 'minimal', label: 'Minimal', description: 'Plain text row, no chrome.' },
];

export const PORTFOLIO_WORK_CARD_RADIUS_OPTIONS: {
  value: PortfolioWorkCardRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Carré', description: 'Coins droits.' },
  { value: 'sm', label: 'Léger', description: 'Arrondi subtil.' },
  { value: 'md', label: 'Moyen', description: 'Arrondi équilibré.' },
  { value: 'lg', label: 'Large', description: 'Coins bien arrondis (défaut).' },
  { value: 'xl', label: 'Très large', description: 'Arrondi prononcé.' },
];

export const PORTFOLIO_WORK_CARD_PADDING_OPTIONS: {
  value: PortfolioWorkCardPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de marge intérieure.' },
  { value: 'sm', label: 'Compact', description: 'Marge intérieure réduite.' },
  { value: 'md', label: 'Standard', description: 'Marge intérieure équilibrée.' },
  { value: 'lg', label: 'Confortable', description: 'Marge intérieure généreuse.' },
];

export const PORTFOLIO_WORK_CARD_GAP_OPTIONS: {
  value: PortfolioWorkCardGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Serré', description: 'Peu d’espace entre les projets.' },
  { value: 'md', label: 'Moyen', description: 'Espacement modéré entre les projets.' },
  { value: 'lg', label: 'Large', description: 'Espacement généreux (défaut).' },
  { value: 'xl', label: 'Très large', description: 'Espacement maximal entre les projets.' },
];

export const PORTFOLIO_WORK_CARD_CONTENT_ALIGNMENT_OPTIONS: {
  value: PortfolioWorkCardContentAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Titre, texte et outils alignés à gauche.' },
  { value: 'center', label: 'Centre', description: 'Contenu centré dans la carte.' },
  { value: 'right', label: 'Droite', description: 'Contenu aligné à droite.' },
];

export const PORTFOLIO_WORK_CTA_ALIGNMENT_OPTIONS: {
  value: PortfolioWorkCtaAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Bouton aligné à gauche.' },
  { value: 'center', label: 'Centre', description: 'Bouton centré.' },
  { value: 'right', label: 'Droite', description: 'Bouton aligné à droite.' },
];

export const PORTFOLIO_WORK_CARD_DESIGN_OPTIONS: {
  value: PortfolioWorkCardDesign;
  label: string;
  description: string;
}[] = [
  { value: 'editorial', label: 'Editorial', description: 'Rounded media, roomy typography — the default.' },
  { value: 'minimal', label: 'Minimal', description: 'Flat sharp media, mono CTA, thin content divider.' },
  { value: 'compact', label: 'Compact', description: 'Smaller preview and tighter content stack.' },
  { value: 'stacked', label: 'Stacked', description: 'Full-width media with content underneath.' },
  { value: 'overlay', label: 'Overlay', description: 'Text layered over media with a dark gradient.' },
  { value: 'framed', label: 'Framed', description: 'Bordered panel wrapping media and content.' },
];

export const PORTFOLIO_WORK_CONTENT_PLACEMENT_OPTIONS: {
  value: PortfolioWorkContentPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'side', label: 'Media left', description: 'Media left, content and extras on the right.' },
  { value: 'side-reverse', label: 'Media right', description: 'Content and extras left, media on the right.' },
  { value: 'bottom', label: 'Content below', description: 'Media on top, text and CTA underneath.' },
];

export const PORTFOLIO_WORK_CARD_BORDER_OPTIONS: {
  value: PortfolioWorkCardBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No frame around the whole card.' },
  { value: 'soft', label: 'Soft', description: 'Light hairline border with padding.' },
  { value: 'solid', label: 'Solid', description: 'Bold dark border around the card.' },
  { value: 'accent', label: 'Accent', description: 'Border tinted with your accent color.' },
];

export const PORTFOLIO_WORK_CTA_DESIGN_OPTIONS: {
  value: PortfolioWorkCtaDesign;
  label: string;
  description: string;
}[] = [
  { value: 'circle-icon', label: 'Circle icon', description: 'Orange text with circular arrow button.' },
  { value: 'pill-dark', label: 'Dark pill', description: 'Solid black capsule CTA.' },
  { value: 'pill-outline', label: 'Outline pill', description: 'Bordered capsule on white.' },
  { value: 'pill-accent', label: 'Accent pill', description: 'Filled accent capsule.' },
  { value: 'text-arrow', label: 'Text + arrow', description: 'Minimal linked text with arrow.' },
];

export const PORTFOLIO_WORK_TOOLS_DISPLAY_OPTIONS: {
  value: PortfolioWorkToolsDisplay;
  label: string;
  description: string;
}[] = [
  { value: 'both', label: 'Icons + list', description: 'Logos when available, plus text list.' },
  { value: 'icons', label: 'Icons only', description: 'Compact logo chips from your tool library.' },
  { value: 'list', label: 'List only', description: 'Text list without icon row.' },
];

const SUBTITLE_PRESET_COPY: Record<Exclude<PortfolioWorkSubtitlePreset, 'default' | 'custom' | 'minimal'>, string> = {
  short: 'A selection of recent projects and client work.',
  process: 'Process, tools, and outcomes behind each featured project.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function sanitizeMaxTools(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(24, Math.max(1, Math.round(value)));
}

function sanitizeMediaRatio(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(70, Math.max(30, Math.round(value)));
}

export function resolveWorkSectionTitle(settings: Pick<PortfolioWorkSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>): string {
  switch (settings.titlePreset) {
    case 'selected-work':
      return 'SELECTED WORK';
    case 'projects':
      return 'PROJECTS';
    case 'my-work':
      return 'MY WORK';
    case 'custom':
      return settings.titleCustom.trim() || settings.title.trim() || 'PORTFOLIO';
    case 'portfolio':
      return 'PORTFOLIO';
    default:
      return settings.title.trim() || 'PORTFOLIO';
  }
}

export function resolveWorkSectionSubtitle(
  settings: Pick<PortfolioWorkSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'process':
      return SUBTITLE_PRESET_COPY.process;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function workHeaderFontClass(font: PortfolioWorkHeaderFont, kind: 'title' | 'subtitle'): string {
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
      return 'font-bold uppercase tracking-[0.12em]';
    default:
      return 'leading-relaxed';
  }
}

export function workHeaderFontStyle(font: PortfolioWorkHeaderFont): CSSProperties | undefined {
  if (font === 'serif') return { fontFamily: "'Playfair Display', serif" };
  return undefined;
}

export function workTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_WORK_TITLE_COLOR) };
}

export function workSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_WORK_SUBTITLE_COLOR) };
}

export function workCardIsStacked(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement
): boolean {
  return placement === 'bottom' || design === 'stacked' || design === 'overlay';
}

export function workCardMediaFr(mediaRatio: number): number {
  const clamped = Math.min(70, Math.max(30, Math.round(mediaRatio)));
  return Number((clamped / (100 - clamped)).toFixed(3));
}

export function workCardShellClass(design: PortfolioWorkCardDesign, placement: PortfolioWorkContentPlacement): string {
  if (workCardIsStacked(design, placement)) return 'group flex flex-col gap-6 sm:gap-8';
  const gapClass =
    design === 'compact'
      ? 'gap-5 lg:gap-8'
      : design === 'minimal'
        ? 'gap-6 lg:gap-10'
        : 'gap-8 lg:gap-12 xl:gap-16';
  return `group grid items-start ${gapClass} lg:[grid-template-columns:var(--pf-work-grid)]`;
}

export function workCardGridStyle(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement,
  mediaRatio: number
): CSSProperties | undefined {
  if (workCardIsStacked(design, placement)) return undefined;
  const fr = workCardMediaFr(mediaRatio);
  const cols =
    placement === 'side-reverse'
      ? `minmax(0,1fr) minmax(0,${fr}fr)`
      : `minmax(0,${fr}fr) minmax(0,1fr)`;
  return { ['--pf-work-grid' as string]: cols };
}

export function workCardMediaOrderClass(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement
): string {
  if (workCardIsStacked(design, placement)) return '';
  return placement === 'side-reverse' ? 'lg:order-2' : '';
}

export function workCardContentOrderClass(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement
): string {
  if (workCardIsStacked(design, placement)) return '';
  return placement === 'side-reverse' ? 'lg:order-1' : '';
}

export function workCardRadiusClass(radius: PortfolioWorkCardRadius): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-xl';
    case 'md':
      return 'rounded-2xl';
    case 'xl':
      return 'rounded-[2.5rem]';
    default:
      return 'rounded-[1.85rem]';
  }
}

export function workCardPaddingClass(padding: PortfolioWorkCardPadding): string {
  switch (padding) {
    case 'none':
      return '';
    case 'sm':
      return 'p-4 sm:p-5';
    case 'lg':
      return 'p-7 sm:p-9 lg:p-11';
    default:
      return 'p-5 sm:p-6 lg:p-7';
  }
}

export function workCardGapClass(gap: PortfolioWorkCardGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-6 lg:gap-8';
    case 'md':
      return 'gap-10 lg:gap-12';
    case 'xl':
      return 'gap-20 lg:gap-28';
    default:
      return 'gap-14 lg:gap-20';
  }
}

export function workGallerySupportsItemsPerRow(layout: PortfolioWorkGalleryLayout): boolean {
  return layout === 'stack' || layout === 'grid' || layout === 'overlay';
}

export function resolveWorkItemsPerRow(
  layout: PortfolioWorkGalleryLayout,
  itemsPerRow: PortfolioWorkItemsPerRow | undefined
): PortfolioWorkItemsPerRow {
  if (!workGallerySupportsItemsPerRow(layout)) return 1;
  if (itemsPerRow === 1 || itemsPerRow === 2 || itemsPerRow === 3 || itemsPerRow === 4) {
    return itemsPerRow;
  }
  return layout === 'stack' ? 1 : 2;
}

/**
 * Responsive grid for work cards.
 * Mobile always stays 1 column; higher counts unlock only from tablet / desktop up.
 */
export function workItemsPerRowGridClass(
  itemsPerRow: PortfolioWorkItemsPerRow,
  cardGap: PortfolioWorkCardGap = 'lg'
): string {
  const gap = workCardGapClass(cardGap);
  switch (itemsPerRow) {
    case 2:
      return `grid grid-cols-1 ${gap} md:grid-cols-2`;
    case 3:
      return `grid grid-cols-1 ${gap} sm:grid-cols-2 xl:grid-cols-3`;
    case 4:
      return `grid grid-cols-1 ${gap} sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`;
    default:
      return `grid grid-cols-1 ${gap}`;
  }
}

export function workItemsPerRowResponsiveHint(itemsPerRow: PortfolioWorkItemsPerRow): string | null {
  switch (itemsPerRow) {
    case 2:
      return 'Sur mobile, les cartes restent sur 1 colonne. 2 colonnes à partir des tablettes.';
    case 3:
      return 'Sur mobile : 1 colonne. Tablette : 2. Grand écran (xl) : 3. Les textes et médias seront plus serrés.';
    case 4:
      return 'Attention : 4 colonnes uniquement sur très grand écran (2xl). Sur laptop, max 3 ; tablette 2 ; mobile 1. Peu adapté aux cartes riches (long texte, gros média).';
    default:
      return null;
  }
}

export function workCardContentAlignClass(alignment: PortfolioWorkCardContentAlignment): {
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

export function workCtaAlignClass(alignment: PortfolioWorkCtaAlignment): string {
  switch (alignment) {
    case 'center':
      return 'justify-center';
    case 'right':
      return 'justify-end';
    default:
      return 'justify-start';
  }
}

function workCardBorderWidthClass(border: PortfolioWorkCardBorder): string {
  switch (border) {
    case 'soft':
      return 'border';
    case 'solid':
    case 'accent':
      return 'border-2';
    default:
      return '';
  }
}

/** Combined frame (border + radius + padding) around the whole card. */
export function workCardFrameClass(p: PortfolioWorkPresentationSettings): string {
  const hasBorder = p.cardBorder !== 'none';
  const hasPadding = p.cardPadding !== 'none';
  const hasBackground = p.cardBackgroundEnabled;
  if (!hasBorder && !hasPadding && !hasBackground) return '';

  const parts = [workCardRadiusClass(p.cardBorderRadius)];
  if (hasPadding) parts.push(workCardPaddingClass(p.cardPadding));
  if (hasBorder) {
    parts.push(workCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function workCardFrameStyle(
  p: PortfolioWorkPresentationSettings
): CSSProperties | undefined {
  const style: CSSProperties = {};

  if (p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_WORK_CARD_BACKGROUND_COLOR);
  }

  if (p.cardBorder === 'accent') {
    const accent = sanitizeHex(p.ctaColor, DEFAULT_WORK_CTA_COLOR);
    style.borderColor = accent;
    if (!p.cardBackgroundEnabled) {
      style.backgroundImage = `linear-gradient(180deg, ${accent}0a 0%, transparent 40%)`;
    }
  } else if (p.cardBorder !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.cardBorderColor, DEFAULT_WORK_CARD_BORDER_COLOR);
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

export function workCardMediaClass(design: PortfolioWorkCardDesign): string {
  switch (design) {
    case 'minimal':
      return 'relative block overflow-hidden rounded-lg border border-neutral-200/90 bg-neutral-50 transition duration-300 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900';
    case 'compact':
      return 'relative block overflow-hidden rounded-[1.25rem] bg-neutral-100 shadow-sm transition duration-300 hover:shadow-md dark:bg-neutral-900';
    case 'stacked':
      return 'relative block overflow-hidden rounded-[1.75rem] bg-neutral-100 shadow-sm transition duration-300 hover:shadow-lg dark:bg-neutral-900';
    case 'overlay':
      return 'relative block overflow-hidden rounded-[2rem] bg-neutral-900 shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-xl';
    case 'framed':
      return 'relative block overflow-hidden rounded-[1.25rem] border border-neutral-200/80 bg-neutral-100 shadow-sm transition duration-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900';
    default:
      return 'relative block overflow-hidden rounded-[2rem] bg-neutral-100 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-neutral-900';
  }
}

export function workCardMediaAspectClass(
  design: PortfolioWorkCardDesign,
  placement?: PortfolioWorkContentPlacement,
  mediaRatio?: number
): string {
  if (
    placement !== undefined &&
    mediaRatio !== undefined &&
    workCardIsStacked(design, placement)
  ) {
    return '';
  }
  switch (design) {
    case 'compact':
      return 'aspect-[16/11]';
    case 'overlay':
      return 'aspect-[4/5] sm:aspect-[3/4]';
    case 'stacked':
      return 'aspect-[16/9]';
    default:
      return 'aspect-[16/10]';
  }
}

/** Maps mediaRatio (30–70) to aspect ratio for stacked layouts — lower = shorter, higher = taller. */
export function workCardMediaAspectStyle(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement,
  mediaRatio: number
): CSSProperties | undefined {
  if (!workCardIsStacked(design, placement)) return undefined;
  const clamped = Math.min(70, Math.max(30, Math.round(mediaRatio)));
  const minAspect = design === 'overlay' ? 0.7 : 0.85;
  const maxAspect = design === 'compact' ? 2.1 : 2.35;
  const aspect = maxAspect - ((clamped - 30) / 40) * (maxAspect - minAspect);
  return { aspectRatio: `${aspect}` };
}

export function workCardTitleClass(design: PortfolioWorkCardDesign): string {
  switch (design) {
    case 'compact':
      return 'text-xl font-extrabold leading-tight tracking-[-0.02em] sm:text-2xl';
    case 'minimal':
      return 'text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-[1.75rem]';
    case 'overlay':
      return 'text-2xl font-extrabold leading-tight tracking-[-0.02em] sm:text-3xl';
    default:
      return 'text-2xl font-extrabold leading-tight tracking-[-0.02em] sm:text-3xl lg:text-[2rem]';
  }
}

export function workCtaClassName(design: PortfolioWorkCtaDesign): string {
  const base = 'inline-flex items-center gap-2 text-base font-bold transition';
  switch (design) {
    case 'pill-dark':
      return `${base} rounded-full bg-neutral-950 px-6 py-3 uppercase tracking-[0.1em] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950`;
    case 'pill-outline':
      return `${base} rounded-full border-2 border-neutral-900 px-6 py-3 uppercase tracking-[0.1em] text-neutral-950 hover:bg-neutral-50 dark:border-white dark:text-white`;
    case 'pill-accent':
      return `${base} rounded-full px-6 py-3 uppercase tracking-[0.1em] text-white hover:opacity-90`;
    case 'text-arrow':
      return `${base} px-0 py-1 uppercase tracking-[0.12em] underline-offset-4 hover:underline`;
    default:
      return `${base} uppercase tracking-[0.12em] hover:opacity-90`;
  }
}

export function workCtaStyle(design: PortfolioWorkCtaDesign, accentColor: string): CSSProperties | undefined {
  const accent = sanitizeHex(accentColor, DEFAULT_WORK_CTA_COLOR);
  if (design === 'pill-accent') return { backgroundColor: accent };
  if (design === 'circle-icon' || design === 'text-arrow') return { color: accent };
  return undefined;
}

export function workCtaIconShellClass(design: PortfolioWorkCtaDesign): string {
  if (design !== 'circle-icon') return 'flex h-4 w-4 items-center justify-center';
  return 'flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-orange-50 transition hover:border-orange-300 hover:bg-orange-100 dark:border-orange-500/40 dark:bg-orange-500/10';
}

export function pickWorkPresentationSettings(work: unknown): PortfolioWorkPresentationSettings {
  return mergeWorkPresentation(DEFAULT_WORK_PRESENTATION, work);
}

export function mergeWorkPresentation(
  base: PortfolioWorkPresentationSettings,
  patch: unknown
): PortfolioWorkPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const titlePreset = record.titlePreset;
  const subtitlePreset = record.subtitlePreset;
  const titleFont = record.titleFont;
  const subtitleFont = record.subtitleFont;
  const headerAlignment = record.headerAlignment;
  const contentPlacement = record.contentPlacement;
  const galleryLayout = record.galleryLayout;
  const cardDesign = record.cardDesign;
  const cardBorder = record.cardBorder;
  const cardBorderRadius = record.cardBorderRadius;
  const cardPadding = record.cardPadding;
  const cardGap = record.cardGap;
  const cardContentAlignment = record.cardContentAlignment;
  const ctaAlignment = record.ctaAlignment;
  const ctaDesign = record.ctaDesign;
  const toolsDisplay = record.toolsDisplay;
  const categoryMode = record.categoryMode;
  const categoryDesign = record.categoryDesign;
  const background = mergeSectionBackground(base, patch);

  const resolvedCardContentAlignment =
    cardContentAlignment === 'left' ||
    cardContentAlignment === 'center' ||
    cardContentAlignment === 'right'
      ? cardContentAlignment
      : base.cardContentAlignment;

  const resolvedCtaAlignment =
    ctaAlignment === 'left' || ctaAlignment === 'center' || ctaAlignment === 'right'
      ? ctaAlignment
      : record.ctaAlignment === undefined
        ? resolvedCardContentAlignment
        : base.ctaAlignment;

  return {
    ...background,
    titlePreset:
      titlePreset === 'portfolio' ||
      titlePreset === 'selected-work' ||
      titlePreset === 'projects' ||
      titlePreset === 'my-work' ||
      titlePreset === 'custom'
        ? titlePreset
        : base.titlePreset,
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset:
      subtitlePreset === 'default' ||
      subtitlePreset === 'short' ||
      subtitlePreset === 'process' ||
      subtitlePreset === 'minimal' ||
      subtitlePreset === 'custom'
        ? subtitlePreset
        : base.subtitlePreset,
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont:
      titleFont === 'sans' || titleFont === 'serif' || titleFont === 'display' ? titleFont : base.titleFont,
    subtitleFont:
      subtitleFont === 'sans' || subtitleFont === 'serif' || subtitleFont === 'display'
        ? subtitleFont
        : base.subtitleFont,
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    headerAlignment:
      headerAlignment === 'left' || headerAlignment === 'center' ? headerAlignment : base.headerAlignment,
    contentPlacement:
      contentPlacement === 'side' || contentPlacement === 'side-reverse' || contentPlacement === 'bottom'
        ? contentPlacement
        : base.contentPlacement,
    cardDesign:
      cardDesign === 'editorial' ||
      cardDesign === 'minimal' ||
      cardDesign === 'compact' ||
      cardDesign === 'stacked' ||
      cardDesign === 'overlay' ||
      cardDesign === 'framed'
        ? cardDesign
        : base.cardDesign,
    galleryLayout:
      galleryLayout === 'stack' ||
      galleryLayout === 'grid' ||
      galleryLayout === 'list' ||
      galleryLayout === 'overlay' ||
      galleryLayout === 'accordion'
        ? galleryLayout
        : base.galleryLayout,
    itemsPerRow: (() => {
      const resolvedLayout =
        galleryLayout === 'stack' ||
        galleryLayout === 'grid' ||
        galleryLayout === 'list' ||
        galleryLayout === 'overlay' ||
        galleryLayout === 'accordion'
          ? galleryLayout
          : base.galleryLayout;
      if (!('itemsPerRow' in record)) {
        // Preserve legacy grid/overlay two-column behavior for older saves.
        if (resolvedLayout === 'grid' || resolvedLayout === 'overlay') return 2;
        return base.itemsPerRow;
      }
      const raw = record.itemsPerRow;
      if (raw === 1 || raw === 2 || raw === 3 || raw === 4) return raw;
      if (raw === '1' || raw === '2' || raw === '3' || raw === '4') {
        return Number(raw) as PortfolioWorkItemsPerRow;
      }
      return base.itemsPerRow;
    })(),
    cardBorder:
      cardBorder === 'none' ||
      cardBorder === 'soft' ||
      cardBorder === 'solid' ||
      cardBorder === 'accent'
        ? cardBorder
        : base.cardBorder,
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean'
        ? record.cardBackgroundEnabled
        : base.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderRadius:
      cardBorderRadius === 'none' ||
      cardBorderRadius === 'sm' ||
      cardBorderRadius === 'md' ||
      cardBorderRadius === 'lg' ||
      cardBorderRadius === 'xl'
        ? cardBorderRadius
        : base.cardBorderRadius,
    cardPadding:
      cardPadding === 'none' ||
      cardPadding === 'sm' ||
      cardPadding === 'md' ||
      cardPadding === 'lg'
        ? cardPadding
        : base.cardPadding,
    cardGap:
      cardGap === 'sm' || cardGap === 'md' || cardGap === 'lg' || cardGap === 'xl'
        ? cardGap
        : base.cardGap,
    cardContentAlignment: resolvedCardContentAlignment,
    ctaAlignment: resolvedCtaAlignment,
    mediaRatio: sanitizeMediaRatio(record.mediaRatio, base.mediaRatio),
    showMarketplaceLink:
      typeof record.showMarketplaceLink === 'boolean' ? record.showMarketplaceLink : base.showMarketplaceLink,
    showCardTitle: typeof record.showCardTitle === 'boolean' ? record.showCardTitle : base.showCardTitle,
    showCardDescription:
      typeof record.showCardDescription === 'boolean' ? record.showCardDescription : base.showCardDescription,
    showCardTools: typeof record.showCardTools === 'boolean' ? record.showCardTools : base.showCardTools,
    showCardToolIcons:
      typeof record.showCardToolIcons === 'boolean' ? record.showCardToolIcons : base.showCardToolIcons,
    showCardToolList:
      typeof record.showCardToolList === 'boolean' ? record.showCardToolList : base.showCardToolList,
    showToolsLabel: typeof record.showToolsLabel === 'boolean' ? record.showToolsLabel : base.showToolsLabel,
    toolsLabelText: typeof record.toolsLabelText === 'string' ? record.toolsLabelText : base.toolsLabelText,
    toolsIconSize:
      record.toolsIconSize === 'sm' ||
      record.toolsIconSize === 'md' ||
      record.toolsIconSize === 'lg' ||
      record.toolsIconSize === 'xl'
        ? record.toolsIconSize
        : base.toolsIconSize,
    showCardCta: typeof record.showCardCta === 'boolean' ? record.showCardCta : base.showCardCta,
    ctaDesign:
      ctaDesign === 'pill-dark' ||
      ctaDesign === 'pill-outline' ||
      ctaDesign === 'pill-accent' ||
      ctaDesign === 'text-arrow' ||
      ctaDesign === 'circle-icon'
        ? ctaDesign
        : base.ctaDesign,
    ctaLabel: typeof record.ctaLabel === 'string' && record.ctaLabel.trim() ? record.ctaLabel.trim() : base.ctaLabel,
    ctaColor: sanitizeHex(record.ctaColor, base.ctaColor),
    toolsDisplay:
      toolsDisplay === 'icons' || toolsDisplay === 'list' || toolsDisplay === 'both'
        ? toolsDisplay
        : base.toolsDisplay,
    maxToolsShown: sanitizeMaxTools(record.maxToolsShown, base.maxToolsShown),
    categoryMode:
      categoryMode === 'off' ||
      categoryMode === 'filter' ||
      categoryMode === 'group' ||
      categoryMode === 'filter-and-group'
        ? categoryMode
        : base.categoryMode,
    categoryDesign:
      categoryDesign === 'pills' ||
      categoryDesign === 'underline' ||
      categoryDesign === 'tabs' ||
      categoryDesign === 'minimal'
        ? categoryDesign
        : base.categoryDesign,
    showCategoryOnCard:
      typeof record.showCategoryOnCard === 'boolean' ? record.showCategoryOnCard : base.showCategoryOnCard,
    categoryAllLabel:
      typeof record.categoryAllLabel === 'string' && record.categoryAllLabel.trim()
        ? record.categoryAllLabel.trim()
        : base.categoryAllLabel,
    categoryUncategorizedLabel:
      typeof record.categoryUncategorizedLabel === 'string' && record.categoryUncategorizedLabel.trim()
        ? record.categoryUncategorizedLabel.trim()
        : base.categoryUncategorizedLabel,
    categoryActiveColor: sanitizeHex(record.categoryActiveColor, base.categoryActiveColor),
    categoryMutedColor: sanitizeHex(record.categoryMutedColor, base.categoryMutedColor),
    elementStyles: normalizeWorkElementStyles(record.elementStyles ?? base.elementStyles),
  };
}

export const WORK_CATEGORY_ALL_KEY = '__all__';
export const WORK_CATEGORY_UNCATEGORIZED_KEY = '__uncategorized__';

export function resolveWorkItemCategoryKey(genre: string | null | undefined): string {
  const trimmed = genre?.trim();
  return trimmed ? trimmed : WORK_CATEGORY_UNCATEGORIZED_KEY;
}

export function resolveWorkItemCategoryLabel(
  genre: string | null | undefined,
  uncategorizedLabel: string
): string {
  const trimmed = genre?.trim();
  return trimmed || uncategorizedLabel;
}

export function collectWorkCategories(
  items: { genre?: string | null }[],
  uncategorizedLabel: string
): { key: string; label: string; count: number }[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const item of items) {
    const key = resolveWorkItemCategoryKey(item.genre);
    const label = resolveWorkItemCategoryLabel(item.genre, uncategorizedLabel);
    const prev = counts.get(key);
    if (prev) prev.count += 1;
    else counts.set(key, { label, count: 1 });
  }
  return Array.from(counts.entries())
    .map(([key, value]) => ({ key, label: value.label, count: value.count }))
    .sort((a, b) => {
      if (a.key === WORK_CATEGORY_UNCATEGORIZED_KEY) return 1;
      if (b.key === WORK_CATEGORY_UNCATEGORIZED_KEY) return -1;
      return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
    });
}

export function filterWorkItemsByCategory<T extends { genre?: string | null }>(
  items: T[],
  activeKey: string
): T[] {
  if (!activeKey || activeKey === WORK_CATEGORY_ALL_KEY) return items;
  return items.filter((item) => resolveWorkItemCategoryKey(item.genre) === activeKey);
}

export function groupWorkItemsByCategory<T extends { genre?: string | null }>(
  items: T[],
  uncategorizedLabel: string
): { key: string; label: string; items: T[] }[] {
  const categories = collectWorkCategories(items, uncategorizedLabel);
  return categories.map((category) => ({
    key: category.key,
    label: category.label,
    items: items.filter((item) => resolveWorkItemCategoryKey(item.genre) === category.key),
  }));
}

export function workCategoryNavClass(design: PortfolioWorkCategoryDesign): string {
  switch (design) {
    case 'tabs':
      return 'inline-flex flex-wrap gap-1 rounded-2xl bg-neutral-100/90 p-1.5 dark:bg-neutral-900';
    case 'underline':
      return 'flex flex-wrap gap-x-5 gap-y-2 border-b border-neutral-200/80 dark:border-neutral-800';
    case 'minimal':
      return 'flex flex-wrap items-center gap-x-4 gap-y-2';
    default:
      return 'flex flex-wrap gap-2';
  }
}

export function workCategoryChipClass(
  design: PortfolioWorkCategoryDesign,
  active: boolean
): string {
  const base = 'text-sm font-semibold transition';
  switch (design) {
    case 'tabs':
      return `${base} rounded-xl px-3.5 py-2 ${active ? 'bg-white shadow-sm dark:bg-neutral-800' : 'hover:bg-white/60 dark:hover:bg-neutral-800/60'}`;
    case 'underline':
      return `${base} border-b-2 pb-2.5 ${active ? 'border-current' : 'border-transparent opacity-70 hover:opacity-100'}`;
    case 'minimal':
      return `${base} ${active ? '' : 'opacity-55 hover:opacity-100'}`;
    default:
      return `${base} rounded-full px-3.5 py-1.5 ${
        active
          ? 'text-white'
          : 'border border-neutral-200/90 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
      }`;
  }
}
