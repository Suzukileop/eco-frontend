import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  mergeServicesCardBackgroundSettings,
  type PortfolioServicesCardBackgroundSettings,
} from '@/components/portfolio/portfolio-services-card-background-settings';
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

export type PortfolioContactTitlePreset = 'contact' | 'get-in-touch' | 'lets-talk' | 'start-a-project' | 'custom';

export type PortfolioContactSubtitlePreset = 'default' | 'short' | 'response-time' | 'minimal' | 'custom';

export type PortfolioContactHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioContactHeaderAlignment = 'left' | 'center';

export type PortfolioContactCardDesign = 'editorial' | 'minimal' | 'split' | 'stacked';

export type PortfolioContactCtaDesign = 'pill-dark' | 'pill-outline' | 'pill-accent' | 'full-width';

export type PortfolioContactBlockOrder = 'primary-first' | 'links-first';

export type PortfolioContactCardMaxWidth = 'md' | 'lg' | 'xl' | 'full';

export type PortfolioContactCardPlacement = 'left' | 'center' | 'right';

export type PortfolioContactPresentationSettings = PortfolioSectionBackgroundSettings &
  PortfolioServicesCardBackgroundSettings & {
  titlePreset: PortfolioContactTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioContactSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioContactHeaderFont;
  subtitleFont: PortfolioContactHeaderFont;
  titleColor: string;
  subtitleColor: string;
  subtitleSerif: boolean;
  headerAlignment: PortfolioContactHeaderAlignment;
  cardDesign: PortfolioContactCardDesign;
  ctaDesign: PortfolioContactCtaDesign;
  ctaLabel: string;
  ctaColor: string;
  blockOrder: PortfolioContactBlockOrder;
  cardMaxWidth: PortfolioContactCardMaxWidth;
  cardPlacement: PortfolioContactCardPlacement;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showSocialLinks: boolean;
  showCta: boolean;
  showResponseTimeInSubtitle: boolean;
};

export type PortfolioContactSectionSettings = PortfolioSectionCopy & PortfolioContactPresentationSettings;

export const DEFAULT_CONTACT_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_CONTACT_SUBTITLE_COLOR = '#737373';
export const DEFAULT_CONTACT_CTA_COLOR = '#ea580c';
export const DEFAULT_CONTACT_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_CONTACT_CARD_BACKGROUND_COLOR = '#ffffff';

export const DEFAULT_CONTACT_PRESENTATION: PortfolioContactPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  titlePreset: 'contact',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'serif',
  titleColor: DEFAULT_CONTACT_TITLE_COLOR,
  subtitleColor: DEFAULT_CONTACT_SUBTITLE_COLOR,
  subtitleSerif: true,
  headerAlignment: 'center',
  cardDesign: 'editorial',
  ctaDesign: 'pill-dark',
  ctaLabel: 'Start a project',
  ctaColor: DEFAULT_CONTACT_CTA_COLOR,
  blockOrder: 'primary-first',
  cardMaxWidth: 'xl',
  cardPlacement: 'center',
  cardBorder: 'soft',
  cardBorderColor: DEFAULT_CONTACT_CARD_BORDER_COLOR,
  cardBackgroundEnabled: false,
  cardBackgroundColor: DEFAULT_CONTACT_CARD_BACKGROUND_COLOR,
  cardBorderRadius: 'md',
  cardPadding: 'none',
  showEmail: true,
  showPhone: true,
  showLocation: false,
  showSocialLinks: true,
  showCta: true,
  showResponseTimeInSubtitle: true,
};

export const PORTFOLIO_CONTACT_TITLE_PRESET_OPTIONS: {
  value: PortfolioContactTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'contact', label: 'Contact', description: 'Classic professional label.' },
  { value: 'get-in-touch', label: 'Get in touch', description: 'Friendly and open.' },
  { value: 'lets-talk', label: "Let's talk", description: 'Conversational tone.' },
  { value: 'start-a-project', label: 'Start a project', description: 'Action-oriented CTA feel.' },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_CONTACT_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioContactSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One concise supporting line.' },
  { value: 'response-time', label: 'Response time', description: 'Mentions typical reply speed.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_CONTACT_HEADER_FONT_OPTIONS: {
  value: PortfolioContactHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS: {
  value: PortfolioContactCardDesign;
  label: string;
  description: string;
}[] = [
  { value: 'editorial', label: 'Editorial', description: 'Rounded panel with split channels — default.' },
  { value: 'minimal', label: 'Minimal', description: 'Light borders, airy spacing.' },
  { value: 'split', label: 'Split columns', description: 'Two-column channel grid.' },
  { value: 'stacked', label: 'Stacked', description: 'Full-width rows top to bottom.' },
];

export const PORTFOLIO_CONTACT_CTA_DESIGN_OPTIONS: {
  value: PortfolioContactCtaDesign;
  label: string;
  description: string;
}[] = [
  { value: 'pill-dark', label: 'Dark pill', description: 'Solid dark button — default.' },
  { value: 'pill-outline', label: 'Outline pill', description: 'Bordered button on white.' },
  { value: 'pill-accent', label: 'Accent pill', description: 'Warm accent fill.' },
  { value: 'full-width', label: 'Full width', description: 'Wide CTA bar below channels.' },
];

export const PORTFOLIO_CONTACT_BLOCK_ORDER_OPTIONS: {
  value: PortfolioContactBlockOrder;
  label: string;
  description: string;
}[] = [
  { value: 'primary-first', label: 'Channels first', description: 'Email / phone / location block appears first.' },
  { value: 'links-first', label: 'Links first', description: 'Social links block appears above primary channels.' },
];

export const PORTFOLIO_CONTACT_CARD_MAX_WIDTH_OPTIONS: {
  value: PortfolioContactCardMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'md', label: 'Medium', description: 'Compact centered card.' },
  { value: 'lg', label: 'Large', description: 'Balanced width.' },
  { value: 'xl', label: 'XL', description: 'Default wide card.' },
  { value: 'full', label: 'Full width', description: 'Stretches to section width.' },
];

export const PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS: {
  value: PortfolioContactCardPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Align the contact card to the left.' },
  { value: 'center', label: 'Center', description: 'Center the card in the section.' },
  { value: 'right', label: 'Right', description: 'Align the contact card to the right.' },
];

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioContactSubtitlePreset, 'default' | 'custom' | 'minimal' | 'response-time'>,
  string
> = {
  short: 'Reach out to discuss your project — I would be glad to hear from you.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

export function resolveContactSectionTitle(
  settings: Pick<PortfolioContactSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  switch (settings.titlePreset) {
    case 'get-in-touch':
      return 'GET IN TOUCH';
    case 'lets-talk':
      return "LET'S TALK";
    case 'start-a-project':
      return 'START A PROJECT';
    case 'custom':
      return settings.titleCustom.trim() || settings.title.trim() || 'CONTACT';
    default:
      return 'CONTACT';
  }
}

export function resolveContactSectionSubtitle(
  settings: Pick<PortfolioContactSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>,
  responseTimeLabel?: string | null
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'response-time':
      if (responseTimeLabel?.trim()) {
        return `I typically reply ${responseTimeLabel.toLowerCase()} — share your brief and we can take it from there.`;
      }
      return settings.subtitle.trim() || SUBTITLE_PRESET_COPY.short;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function contactHeaderFontClass(font: PortfolioContactHeaderFont, kind: 'title' | 'subtitle'): string {
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

export function contactHeaderFontStyle(
  font: PortfolioContactHeaderFont,
  subtitleSerif: boolean,
  kind: 'title' | 'subtitle'
): CSSProperties | undefined {
  if (kind === 'subtitle' && subtitleSerif) return { fontFamily: "'Playfair Display', serif" };
  if (kind === 'title' && font === 'serif') return { fontFamily: "'Playfair Display', serif" };
  return undefined;
}

export function contactTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_CONTACT_TITLE_COLOR) };
}

export function contactSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_CONTACT_SUBTITLE_COLOR) };
}

export function contactCardShellClass(design: PortfolioContactCardDesign): string {
  switch (design) {
    case 'stacked':
      return 'flex flex-col gap-3';
    default:
      return 'overflow-hidden';
  }
}

export function contactCardPlacementClass(placement: PortfolioContactCardPlacement): string {
  switch (placement) {
    case 'left':
      return 'mr-auto ml-0';
    case 'right':
      return 'ml-auto mr-0';
    default:
      return 'mx-auto';
  }
}

function contactCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
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

export function contactCardFrameClass(p: PortfolioContactPresentationSettings): string {
  const parts = [servicesCardRadiusClass(p.cardBorderRadius), servicesCardPaddingClass(p.cardPadding)];
  if (p.cardBorder !== 'none') {
    parts.push(contactCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function contactCardFrameStyle(p: PortfolioContactPresentationSettings): CSSProperties {
  const style: CSSProperties = {};
  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_CONTACT_CARD_BACKGROUND_COLOR);
  }

  if (p.cardBorder === 'accent') {
    style.borderColor = sanitizeHex(p.ctaColor, DEFAULT_CONTACT_CTA_COLOR);
  } else if (p.cardBorder === 'soft' || p.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.cardBorderColor, DEFAULT_CONTACT_CARD_BORDER_COLOR);
  }
  return style;
}

export function contactCardMaxWidthClass(maxWidth: PortfolioContactCardMaxWidth): string {
  switch (maxWidth) {
    case 'md':
      return 'max-w-2xl';
    case 'lg':
      return 'max-w-3xl';
    case 'full':
      return 'max-w-none';
    default:
      return 'max-w-4xl';
  }
}

export function contactChannelGridClass(design: PortfolioContactCardDesign, channelCount: number): string {
  if (design === 'stacked') return 'flex flex-col gap-3';
  if (channelCount <= 1) return '';

  const divideClass =
    design === 'minimal' ? 'divide-neutral-200/60 sm:divide-x divide-y sm:divide-y-0' : 'divide-neutral-200/80 sm:divide-x';

  if (design === 'split' || design === 'minimal') {
    return `grid sm:grid-cols-2 ${divideClass}`;
  }

  return `grid sm:grid-cols-2 ${divideClass}`;
}

export function contactLinksBlockClass(
  design: PortfolioContactCardDesign,
  blockOrder: PortfolioContactBlockOrder
): string {
  const base = 'bg-transparent p-3 sm:p-4';
  const borderColor = design === 'minimal' ? 'border-neutral-200/60' : 'border-neutral-200/80';

  if (blockOrder === 'links-first') {
    return `${base} border-b ${borderColor}`;
  }

  return `${base} border-t ${borderColor}`;
}

export function contactCtaClassName(design: PortfolioContactCtaDesign): string {
  const base = 'inline-flex items-center justify-center gap-2 font-bold transition';
  switch (design) {
    case 'pill-outline':
      return `${base} rounded-full border-2 border-neutral-900 px-8 py-3.5 text-sm text-neutral-900 hover:bg-neutral-900 hover:text-white`;
    case 'pill-accent':
      return `${base} rounded-full px-8 py-3.5 text-sm text-white shadow-sm hover:opacity-90`;
    case 'full-width':
      return `${base} w-full rounded-2xl px-8 py-4 text-sm text-white shadow-sm hover:opacity-90`;
    default:
      return `${base} rounded-full bg-neutral-950 px-8 py-3.5 text-sm text-white hover:bg-neutral-800`;
  }
}

export function contactCtaStyle(design: PortfolioContactCtaDesign, ctaColor: string): CSSProperties | undefined {
  const accent = sanitizeHex(ctaColor, DEFAULT_CONTACT_CTA_COLOR);
  if (design === 'pill-accent' || design === 'full-width') return { backgroundColor: accent };
  return undefined;
}

export function pickContactPresentationSettings(contact: unknown): PortfolioContactPresentationSettings {
  return mergeContactPresentation(DEFAULT_CONTACT_PRESENTATION, contact);
}

export function mergeContactPresentation(
  base: PortfolioContactPresentationSettings,
  patch: unknown
): PortfolioContactPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);
  const cardBackground = mergeServicesCardBackgroundSettings(base, patch);

  return {
    ...background,
    ...cardBackground,
    titlePreset: pick(
      record.titlePreset,
      ['contact', 'get-in-touch', 'lets-talk', 'start-a-project', 'custom'],
      base.titlePreset
    ),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'response-time', 'minimal', 'custom'],
      base.subtitlePreset
    ),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    subtitleSerif: typeof record.subtitleSerif === 'boolean' ? record.subtitleSerif : base.subtitleSerif,
    headerAlignment: pick(record.headerAlignment, ['left', 'center'], base.headerAlignment),
    cardDesign: pick(record.cardDesign, ['editorial', 'minimal', 'split', 'stacked'], base.cardDesign),
    ctaDesign: pick(record.ctaDesign, ['pill-dark', 'pill-outline', 'pill-accent', 'full-width'], base.ctaDesign),
    ctaLabel: typeof record.ctaLabel === 'string' ? record.ctaLabel : base.ctaLabel,
    ctaColor: sanitizeHex(record.ctaColor, base.ctaColor),
    blockOrder: pick(record.blockOrder, ['primary-first', 'links-first'], base.blockOrder),
    cardMaxWidth: pick(record.cardMaxWidth, ['md', 'lg', 'xl', 'full'], base.cardMaxWidth),
    cardPlacement: pick(record.cardPlacement, ['left', 'center', 'right'], base.cardPlacement),
    cardBorder: pick(record.cardBorder, ['none', 'soft', 'solid', 'accent'], base.cardBorder),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean' ? record.cardBackgroundEnabled : base.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderRadius: pick(record.cardBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardBorderRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    showEmail: typeof record.showEmail === 'boolean' ? record.showEmail : base.showEmail,
    showPhone: typeof record.showPhone === 'boolean' ? record.showPhone : base.showPhone,
    showLocation: typeof record.showLocation === 'boolean' ? record.showLocation : base.showLocation,
    showSocialLinks: typeof record.showSocialLinks === 'boolean' ? record.showSocialLinks : base.showSocialLinks,
    showCta: typeof record.showCta === 'boolean' ? record.showCta : base.showCta,
    showResponseTimeInSubtitle:
      typeof record.showResponseTimeInSubtitle === 'boolean'
        ? record.showResponseTimeInSubtitle
        : base.showResponseTimeInSubtitle,
  };
}
