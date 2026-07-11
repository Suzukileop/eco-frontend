import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';

/**
 * Three footer layouts (mockups):
 * - editorial: columns with separators — Networks | Contact | meta
 * - compact: SaaS utility bar — brand + icons, contact line, bottom meta
 * - minimal: contact CTA band + bottom utility row
 */
export type PortfolioFooterDesign = 'editorial' | 'minimal' | 'compact';

export type PortfolioFooterAlignment = 'split' | 'center' | 'left';

export type PortfolioFooterDescriptionSource = 'bio' | 'whyMe' | 'custom';

export type PortfolioFooterPattern = 'none' | 'dots' | 'grid' | 'diagonal' | 'crosshatch';

export type PortfolioFooterCtaButtonBorder = 'none' | 'soft' | 'solid';

export type PortfolioFooterCtaButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type PortfolioFooterCtaButtonPadding = 'sm' | 'md' | 'lg';

export type PortfolioFooterPresentationSettings = PortfolioSectionBackgroundSettings & {
  design: PortfolioFooterDesign;
  alignment: PortfolioFooterAlignment;
  showBrand: boolean;
  showAvatar: boolean;
  showDescription: boolean;
  descriptionSource: PortfolioFooterDescriptionSource;
  descriptionCustom: string;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showHours: boolean;
  showCopyright: boolean;
  showMarketplaceLink: boolean;
  showProfileVisits: boolean;
  showContactLinks: boolean;
  showDesignCredit: boolean;
  showTopBorder: boolean;
  /** Design 3 — CTA band (“Have a project in mind?”). */
  showContactCta: boolean;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonLabel: string;
  /** CTA band title color (minimal design). */
  ctaTitleColor: string;
  /** CTA band subtitle color (minimal design). */
  ctaSubtitleColor: string;
  /** Contact me button fill. */
  ctaButtonBackgroundColor: string;
  /** Contact me button label color. */
  ctaButtonTextColor: string;
  ctaButtonBorder: PortfolioFooterCtaButtonBorder;
  ctaButtonBorderColor: string;
  ctaButtonRadius: PortfolioFooterCtaButtonRadius;
  ctaButtonPadding: PortfolioFooterCtaButtonPadding;
  /** Muted labels / meta (NETWORKS, copyright, hours). */
  textColor: string;
  /** Primary values (contact lines, social labels, brand). */
  primaryColor: string;
  /** Contact row icons (phone, email, pin, clock). */
  iconColor: string;
  /** Marketplace profile link + CTA band fill. */
  accentColor: string;
  pattern: PortfolioFooterPattern;
  patternColor: string;
  patternOpacity: number;
};

const LEGACY_FR_CTA_TITLES = new Set(['Un projet en tête ?', 'Un projet en tete ?']);
const LEGACY_FR_CTA_BUTTONS = new Set(['Me contacter']);
const LEGACY_FR_CTA_SUBTITLES = new Set([
  'Disponible cette semaine · réponse sous 24h',
  'Disponible cette semaine · reponse sous 24h',
]);

export type PortfolioFooterSectionSettings = {
  enabled: boolean;
} & PortfolioFooterPresentationSettings;

export const DEFAULT_FOOTER_TEXT_COLOR = '#a3a3a3';
export const DEFAULT_FOOTER_PRIMARY_COLOR = '#fafafa';
export const DEFAULT_FOOTER_PRIMARY_ON_LIGHT = '#0a0a0a';
export const DEFAULT_FOOTER_ICON_COLOR = '#737373';
export const DEFAULT_FOOTER_ACCENT_COLOR = '#ea580c';
export const DEFAULT_FOOTER_BACKGROUND_COLOR = '#0a0a0a';
export const DEFAULT_FOOTER_PATTERN_COLOR = '#a3a3a3';
export const DEFAULT_FOOTER_CTA_TITLE = 'Have a project in mind?';
export const DEFAULT_FOOTER_CTA_SUBTITLE = 'Available this week · response within 24h';
export const DEFAULT_FOOTER_CTA_BUTTON = 'Contact me';
export const DEFAULT_FOOTER_CTA_TITLE_COLOR = '#ffffff';
export const DEFAULT_FOOTER_CTA_SUBTITLE_COLOR = '#ffffff';
export const DEFAULT_FOOTER_CTA_BUTTON_BG = '#ffffff';
export const DEFAULT_FOOTER_CTA_BUTTON_TEXT = '#0a0a0a';
export const DEFAULT_FOOTER_CTA_BUTTON_BORDER = '#e5e5e5';

export const DEFAULT_FOOTER_PRESENTATION: PortfolioFooterPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  sectionBackgroundEnabled: true,
  sectionBackgroundFill: 'solid',
  sectionBackgroundColor: DEFAULT_FOOTER_BACKGROUND_COLOR,
  sectionBackgroundOpacity: 100,
  design: 'editorial',
  alignment: 'split',
  showBrand: true,
  showAvatar: false,
  showDescription: false,
  descriptionSource: 'bio',
  descriptionCustom: '',
  showEmail: true,
  showPhone: true,
  showLocation: true,
  showHours: true,
  showCopyright: true,
  showMarketplaceLink: true,
  showProfileVisits: true,
  showContactLinks: true,
  showDesignCredit: true,
  showTopBorder: false,
  showContactCta: true,
  ctaTitle: DEFAULT_FOOTER_CTA_TITLE,
  ctaSubtitle: DEFAULT_FOOTER_CTA_SUBTITLE,
  ctaButtonLabel: DEFAULT_FOOTER_CTA_BUTTON,
  ctaTitleColor: DEFAULT_FOOTER_CTA_TITLE_COLOR,
  ctaSubtitleColor: DEFAULT_FOOTER_CTA_SUBTITLE_COLOR,
  ctaButtonBackgroundColor: DEFAULT_FOOTER_CTA_BUTTON_BG,
  ctaButtonTextColor: DEFAULT_FOOTER_CTA_BUTTON_TEXT,
  ctaButtonBorder: 'none',
  ctaButtonBorderColor: DEFAULT_FOOTER_CTA_BUTTON_BORDER,
  ctaButtonRadius: 'md',
  ctaButtonPadding: 'md',
  textColor: DEFAULT_FOOTER_TEXT_COLOR,
  primaryColor: DEFAULT_FOOTER_PRIMARY_COLOR,
  iconColor: DEFAULT_FOOTER_ICON_COLOR,
  accentColor: DEFAULT_FOOTER_ACCENT_COLOR,
  pattern: 'none',
  patternColor: DEFAULT_FOOTER_PATTERN_COLOR,
  patternOpacity: 18,
};

export const PORTFOLIO_FOOTER_PATTERN_OPTIONS: {
  value: PortfolioFooterPattern;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Solid or gradient fill only.' },
  { value: 'dots', label: 'Dots', description: 'Soft dotted texture.' },
  { value: 'grid', label: 'Grid', description: 'Fine editorial grid lines.' },
  { value: 'diagonal', label: 'Diagonal', description: '45° stripe hatching.' },
  { value: 'crosshatch', label: 'Crosshatch', description: 'Intersecting diagonal weave.' },
];

export const PORTFOLIO_FOOTER_DESIGN_OPTIONS: {
  value: PortfolioFooterDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: 'Separated columns',
    description: 'Networks | Contact | copyright — columns with separators.',
  },
  {
    value: 'compact',
    label: 'Compact SaaS',
    description: 'Brand + icons, contact line, copyright bar below.',
  },
  {
    value: 'minimal',
    label: 'Contact CTA',
    description: '“Have a project in mind?” band + utility row below.',
  },
];

export const PORTFOLIO_FOOTER_CTA_BUTTON_BORDER_OPTIONS: {
  value: PortfolioFooterCtaButtonBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No outline around the button.' },
  { value: 'soft', label: 'Soft', description: 'Light 1px border.' },
  { value: 'solid', label: 'Solid', description: 'Clear 1.5px border.' },
];

export const PORTFOLIO_FOOTER_CTA_BUTTON_RADIUS_OPTIONS: {
  value: PortfolioFooterCtaButtonRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Square', description: 'No rounding.' },
  { value: 'sm', label: 'S', description: 'Slightly rounded.' },
  { value: 'md', label: 'M', description: 'Default rounded rectangle.' },
  { value: 'lg', label: 'L', description: 'Softer corners.' },
  { value: 'full', label: 'Pill', description: 'Fully rounded capsule.' },
];

export const PORTFOLIO_FOOTER_CTA_BUTTON_PADDING_OPTIONS: {
  value: PortfolioFooterCtaButtonPadding;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Compact', description: 'Tighter hit area.' },
  { value: 'md', label: 'Medium', description: 'Balanced padding.' },
  { value: 'lg', label: 'Large', description: 'Roomier button.' },
];

export const PORTFOLIO_FOOTER_ALIGNMENT_OPTIONS: {
  value: PortfolioFooterAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'split', label: 'Split', description: 'Columns spread across the width.' },
  { value: 'center', label: 'Center', description: 'Centered content.' },
  { value: 'left', label: 'Left', description: 'Everything left-aligned.' },
];

export const PORTFOLIO_FOOTER_DESCRIPTION_SOURCE_OPTIONS: {
  value: PortfolioFooterDescriptionSource;
  label: string;
  description: string;
}[] = [
  { value: 'bio', label: 'Bio', description: 'Uses your profile bio.' },
  { value: 'whyMe', label: 'Why me', description: 'First “Why work with me” block.' },
  { value: 'custom', label: 'Custom', description: 'Write a short footer blurb.' },
];

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Relative luminance 0–1 (WCAG). */
export function footerColorLuminance(hex: string): number {
  const rgb = parseHexRgb(hex);
  if (!rgb) return 0;
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLin(rgb.r) + 0.7152 * toLin(rgb.g) + 0.0722 * toLin(rgb.b);
}

export function isFooterBackgroundLight(
  settings: Pick<
    PortfolioSectionBackgroundSettings,
    | 'sectionBackgroundEnabled'
    | 'sectionBackgroundFill'
    | 'sectionBackgroundColor'
    | 'sectionBackgroundGradientFrom'
  >
): boolean {
  if (!settings.sectionBackgroundEnabled) return true;
  const sample =
    settings.sectionBackgroundFill === 'gradient'
      ? settings.sectionBackgroundGradientFrom
      : settings.sectionBackgroundColor;
  return footerColorLuminance(sample) > 0.55;
}

export function footerContrastingPrimary(settings: PortfolioSectionBackgroundSettings): string {
  return isFooterBackgroundLight(settings)
    ? DEFAULT_FOOTER_PRIMARY_ON_LIGHT
    : DEFAULT_FOOTER_PRIMARY_COLOR;
}

function isNearWhite(hex: string): boolean {
  return footerColorLuminance(hex) > 0.85;
}

function isNearBlack(hex: string): boolean {
  return footerColorLuminance(hex) < 0.12;
}

/** Keep primary text readable when the section fill is light/dark. */
export function resolveFooterPrimaryColor(
  settings: Pick<
    PortfolioFooterPresentationSettings,
    | 'primaryColor'
    | 'sectionBackgroundEnabled'
    | 'sectionBackgroundFill'
    | 'sectionBackgroundColor'
    | 'sectionBackgroundGradientFrom'
  >
): string {
  const primary = sanitizeHex(settings.primaryColor, DEFAULT_FOOTER_PRIMARY_COLOR);
  const light = isFooterBackgroundLight(settings);
  if (light && isNearWhite(primary)) return DEFAULT_FOOTER_PRIMARY_ON_LIGHT;
  if (!light && isNearBlack(primary)) return DEFAULT_FOOTER_PRIMARY_COLOR;
  return primary;
}

export function footerShellClass(
  design: PortfolioFooterDesign,
  showTopBorder: boolean,
  lightBackground = false
): string {
  const border = showTopBorder
    ? lightBackground
      ? 'border-t border-neutral-200/90'
      : 'border-t border-white/10'
    : '';
  switch (design) {
    case 'minimal':
      return `py-10 sm:py-12 ${border}`;
    case 'compact':
      return `py-8 sm:py-10 ${border}`;
    default:
      return `py-12 sm:py-14 ${border}`;
  }
}

export function footerTopMarginClass(design: PortfolioFooterDesign): string {
  switch (design) {
    case 'minimal':
      return 'mt-12 sm:mt-16';
    case 'compact':
      return 'mt-10 sm:mt-12';
    default:
      return 'mt-16 sm:mt-20';
  }
}

export function footerLayoutClass(
  design: PortfolioFooterDesign,
  _alignment: PortfolioFooterAlignment
): string {
  void _alignment;
  switch (design) {
    case 'compact':
      return 'flex flex-col gap-6 sm:gap-7';
    case 'minimal':
      return 'flex flex-col gap-8 sm:gap-10';
    default:
      return 'grid gap-8 sm:gap-10 lg:grid-cols-3 lg:gap-0';
  }
}

export function footerTextStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_TEXT_COLOR) };
}

export function footerPrimaryStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_PRIMARY_COLOR) };
}

export function footerCtaTitleStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_CTA_TITLE_COLOR) };
}

export function footerCtaSubtitleStyle(color: string): CSSProperties {
  const hex = sanitizeHex(color, DEFAULT_FOOTER_CTA_SUBTITLE_COLOR);
  return { color: hex === DEFAULT_FOOTER_CTA_SUBTITLE_COLOR ? 'rgba(255,255,255,0.85)' : hex };
}

export function footerCtaButtonRadiusClass(radius: PortfolioFooterCtaButtonRadius): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-lg';
    case 'lg':
      return 'rounded-2xl';
    case 'full':
      return 'rounded-full';
    default:
      return 'rounded-xl';
  }
}

export function footerCtaButtonPaddingClass(padding: PortfolioFooterCtaButtonPadding): string {
  switch (padding) {
    case 'sm':
      return 'px-4 py-2 text-xs';
    case 'lg':
      return 'px-8 py-3.5 text-sm';
    default:
      return 'px-6 py-3 text-sm';
  }
}

export function footerCtaButtonClass(
  border: PortfolioFooterCtaButtonBorder,
  radius: PortfolioFooterCtaButtonRadius,
  padding: PortfolioFooterCtaButtonPadding
): string {
  const borderClass =
    border === 'soft' ? 'border' : border === 'solid' ? 'border-[1.5px]' : 'border border-transparent';
  return `inline-flex shrink-0 items-center justify-center font-bold transition ${borderClass} ${footerCtaButtonRadiusClass(radius)} ${footerCtaButtonPaddingClass(padding)}`;
}

export function footerCtaButtonStyle(
  backgroundColor: string,
  textColor: string,
  border: PortfolioFooterCtaButtonBorder,
  borderColor: string
): CSSProperties {
  const style: CSSProperties = {
    backgroundColor: sanitizeHex(backgroundColor, DEFAULT_FOOTER_CTA_BUTTON_BG),
    color: sanitizeHex(textColor, DEFAULT_FOOTER_CTA_BUTTON_TEXT),
  };
  if (border !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(borderColor, DEFAULT_FOOTER_CTA_BUTTON_BORDER);
  }
  return style;
}

export function footerIconStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_ICON_COLOR) };
}

export function footerAccentStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_ACCENT_COLOR) };
}

export function footerDividerClass(lightBackground: boolean): string {
  return lightBackground ? 'border-neutral-200/90' : 'border-white/10';
}

function svgDataUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function buildFooterPatternSvg(pattern: Exclude<PortfolioFooterPattern, 'none'>, color: string): string {
  switch (pattern) {
    case 'grid':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M32 0H0V32" fill="none" stroke="${color}" stroke-width="1"/></svg>`;
    case 'diagonal':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M-2 14L14 -2M2 18L18 2M6 22L22 6" fill="none" stroke="${color}" stroke-width="1.2"/></svg>`;
    case 'crosshatch':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M0 20L20 0M-2 2L2 -2M18 22L22 18" fill="none" stroke="${color}" stroke-width="1"/></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="4" cy="4" r="2.5" fill="${color}"/></svg>`;
  }
}

export function footerPatternStyle(
  settings: Pick<PortfolioFooterPresentationSettings, 'pattern' | 'patternColor' | 'patternOpacity'>
): CSSProperties | undefined {
  if (settings.pattern === 'none') return undefined;
  const color = sanitizeHex(settings.patternColor, DEFAULT_FOOTER_PATTERN_COLOR);
  const opacity = Math.min(100, Math.max(0, settings.patternOpacity)) / 100;
  const size =
    settings.pattern === 'grid'
      ? '32px 32px'
      : settings.pattern === 'diagonal' || settings.pattern === 'crosshatch'
        ? '20px 20px'
        : '24px 24px';
  return {
    backgroundImage: svgDataUrl(buildFooterPatternSvg(settings.pattern, color)),
    backgroundSize: size,
    backgroundRepeat: 'repeat',
    opacity,
  };
}

export function resolveFooterDescription(options: {
  source: PortfolioFooterDescriptionSource;
  custom: string;
  bio?: string | null;
  whyMeText?: string | null;
  maxLength?: number;
}): string | null {
  const max = options.maxLength ?? 220;
  const raw =
    options.source === 'custom'
      ? options.custom.trim()
      : options.source === 'whyMe'
        ? (options.whyMeText ?? '').trim()
        : (options.bio ?? '').trim();
  if (!raw) return null;
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1).trimEnd()}…`;
}

export function resolveFooterCtaSubtitle(options: {
  custom: string;
  isAvailable?: boolean | null;
  responseTimeLabel?: string | null;
  hoursLabel?: string | null;
}): string {
  if (options.custom.trim()) {
    const custom = options.custom.trim();
    if (LEGACY_FR_CTA_SUBTITLES.has(custom)) return DEFAULT_FOOTER_CTA_SUBTITLE;
    return custom;
  }
  const parts: string[] = [];
  if (options.isAvailable !== false) {
    parts.push('Available this week');
  } else {
    parts.push('Currently unavailable');
  }
  if (options.responseTimeLabel?.trim()) {
    parts.push(`response ${options.responseTimeLabel.trim().toLowerCase()}`);
  } else if (options.hoursLabel?.trim()) {
    parts.push(options.hoursLabel.trim());
  } else {
    parts.push('response within 24h');
  }
  return parts.join(' · ');
}

function migrateFooterCtaCopy(value: unknown, legacy: Set<string>, fallback: string): string {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const trimmed = value.trim();
  if (legacy.has(trimmed)) return fallback;
  return trimmed;
}

export function pickFooterPresentationSettings(footer: unknown): PortfolioFooterPresentationSettings {
  return mergeFooterPresentation(DEFAULT_FOOTER_PRESENTATION, footer);
}

export function mergeFooterPresentation(
  base: PortfolioFooterPresentationSettings,
  patch: unknown
): PortfolioFooterPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);

  // Old saves had no design + background off — migrate once to the dark mockup look.
  const needsDarkMigration =
    typeof record.design !== 'string' &&
    (typeof record.sectionBackgroundEnabled !== 'boolean' ||
      record.sectionBackgroundEnabled === false);

  const mergedBackground = {
    ...background,
    ...(needsDarkMigration
      ? {
          sectionBackgroundEnabled: true,
          sectionBackgroundFill: 'solid' as const,
          sectionBackgroundColor: DEFAULT_FOOTER_BACKGROUND_COLOR,
          sectionBackgroundOpacity: 100,
        }
      : {}),
  };

  const hasExplicitPrimary =
    typeof record.primaryColor === 'string' && isValidProfileHexColor(record.primaryColor);
  const rawPrimary = hasExplicitPrimary
    ? sanitizeHex(record.primaryColor, base.primaryColor)
    : footerContrastingPrimary(mergedBackground);
  const primaryColor = resolveFooterPrimaryColor({
    ...mergedBackground,
    primaryColor: rawPrimary,
  });

  const hasExplicitIcon =
    typeof record.iconColor === 'string' && isValidProfileHexColor(record.iconColor);
  const iconColor = hasExplicitIcon
    ? sanitizeHex(record.iconColor, base.iconColor)
    : isFooterBackgroundLight(mergedBackground)
      ? '#525252'
      : DEFAULT_FOOTER_ICON_COLOR;

  const hasExplicitMuted =
    typeof record.textColor === 'string' && isValidProfileHexColor(record.textColor);
  const textColor = hasExplicitMuted
    ? sanitizeHex(record.textColor, base.textColor)
    : isFooterBackgroundLight(mergedBackground)
      ? '#737373'
      : DEFAULT_FOOTER_TEXT_COLOR;

  return {
    ...mergedBackground,
    design: pick(record.design, ['editorial', 'minimal', 'compact'], base.design),
    alignment: pick(record.alignment, ['split', 'center', 'left'], base.alignment),
    showBrand: typeof record.showBrand === 'boolean' ? record.showBrand : base.showBrand,
    showAvatar: typeof record.showAvatar === 'boolean' ? record.showAvatar : base.showAvatar,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    descriptionSource: pick(record.descriptionSource, ['bio', 'whyMe', 'custom'], base.descriptionSource),
    descriptionCustom:
      typeof record.descriptionCustom === 'string' ? record.descriptionCustom : base.descriptionCustom,
    showEmail: typeof record.showEmail === 'boolean' ? record.showEmail : base.showEmail,
    showPhone: typeof record.showPhone === 'boolean' ? record.showPhone : base.showPhone,
    showLocation: typeof record.showLocation === 'boolean' ? record.showLocation : base.showLocation,
    showHours: typeof record.showHours === 'boolean' ? record.showHours : base.showHours,
    showCopyright: typeof record.showCopyright === 'boolean' ? record.showCopyright : base.showCopyright,
    showMarketplaceLink:
      typeof record.showMarketplaceLink === 'boolean' ? record.showMarketplaceLink : base.showMarketplaceLink,
    showProfileVisits:
      typeof record.showProfileVisits === 'boolean' ? record.showProfileVisits : base.showProfileVisits,
    showContactLinks:
      typeof record.showContactLinks === 'boolean' ? record.showContactLinks : base.showContactLinks,
    showDesignCredit:
      typeof record.showDesignCredit === 'boolean' ? record.showDesignCredit : base.showDesignCredit,
    showTopBorder: typeof record.showTopBorder === 'boolean' ? record.showTopBorder : base.showTopBorder,
    showContactCta:
      typeof record.showContactCta === 'boolean' ? record.showContactCta : base.showContactCta,
    ctaTitle: migrateFooterCtaCopy(record.ctaTitle, LEGACY_FR_CTA_TITLES, base.ctaTitle),
    ctaSubtitle:
      typeof record.ctaSubtitle === 'string'
        ? migrateFooterCtaCopy(record.ctaSubtitle, LEGACY_FR_CTA_SUBTITLES, '')
        : base.ctaSubtitle,
    ctaButtonLabel: migrateFooterCtaCopy(
      record.ctaButtonLabel,
      LEGACY_FR_CTA_BUTTONS,
      base.ctaButtonLabel
    ),
    ctaTitleColor: sanitizeHex(record.ctaTitleColor, base.ctaTitleColor),
    ctaSubtitleColor: sanitizeHex(record.ctaSubtitleColor, base.ctaSubtitleColor),
    ctaButtonBackgroundColor: sanitizeHex(
      record.ctaButtonBackgroundColor,
      base.ctaButtonBackgroundColor
    ),
    ctaButtonTextColor: sanitizeHex(record.ctaButtonTextColor, base.ctaButtonTextColor),
    ctaButtonBorder: pick(record.ctaButtonBorder, ['none', 'soft', 'solid'], base.ctaButtonBorder),
    ctaButtonBorderColor: sanitizeHex(record.ctaButtonBorderColor, base.ctaButtonBorderColor),
    ctaButtonRadius: pick(
      record.ctaButtonRadius,
      ['none', 'sm', 'md', 'lg', 'full'],
      base.ctaButtonRadius
    ),
    ctaButtonPadding: pick(record.ctaButtonPadding, ['sm', 'md', 'lg'], base.ctaButtonPadding),
    textColor,
    primaryColor,
    iconColor,
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    pattern: pick(record.pattern, ['none', 'dots', 'grid', 'diagonal', 'crosshatch'], base.pattern),
    patternColor: sanitizeHex(record.patternColor, base.patternColor),
    patternOpacity:
      typeof record.patternOpacity === 'number' && Number.isFinite(record.patternOpacity)
        ? Math.min(100, Math.max(0, record.patternOpacity))
        : base.patternOpacity,
  };
}
