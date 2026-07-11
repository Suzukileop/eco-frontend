import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_MOTION_PROFILE,
  mergeMotionProfile,
  resolveMotionProfileFromStorage,
  type PortfolioGlobalMotionProfile,
} from '@/components/portfolio/portfolio-motion-settings';
import type { PortfolioNavSectionKey } from '@/components/portfolio/portfolio-nav-items';
import {
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

export type PortfolioGlobalTitleAlignment = 'section' | 'left' | 'center' | 'right';

export type PortfolioGlobalContentWidth = 'standard' | 'wide' | 'full';

export type { PortfolioContentGutter };
export type PortfolioGlobalContentGutter = PortfolioContentGutter;

export type PortfolioGlobalTitleScroll = 'sticky' | 'static';

export type { PortfolioGlobalMotionProfile };

export type PortfolioGlobalTitleOrientation = 'horizontal' | 'vertical';

export type PortfolioGlobalTitleOrientationTargets = Record<PortfolioNavSectionKey, boolean>;

export type PortfolioGlobalSectionTitleTopSpacing = 'compact' | 'standard' | 'comfortable' | 'spacious';

export type PortfolioGlobalTypographyScope = 'section' | 'global';

export type PortfolioGlobalHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioGlobalTitleSize = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioGlobalSubtitleSize = 'sm' | 'md' | 'lg';

export type PortfolioGlobalTextDecoration = 'none' | 'underline' | 'highlight';

export type PortfolioGlobalTitleChromePadding = 'none' | 'compact' | 'standard' | 'comfortable';

export type PortfolioGlobalTitleChromeRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type PortfolioGlobalTitleChromeBorderWidth = 'none' | 'thin' | 'medium' | 'thick';

export type PortfolioGlobalTitleChrome = {
  scope: PortfolioGlobalTypographyScope;
  backgroundEnabled: boolean;
  backgroundColor: string;
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: PortfolioGlobalTitleChromeBorderWidth;
  borderRadius: PortfolioGlobalTitleChromeRadius;
  padding: PortfolioGlobalTitleChromePadding;
};

export type PortfolioGlobalTitleTypography = {
  scope: PortfolioGlobalTypographyScope;
  font: PortfolioGlobalHeaderFont;
  size: PortfolioGlobalTitleSize;
  color: string;
  decoration: PortfolioGlobalTextDecoration;
  highlightColor: string;
  italic: boolean;
  uppercase: boolean;
};

export type PortfolioGlobalSubtitleTypography = {
  scope: PortfolioGlobalTypographyScope;
  font: PortfolioGlobalHeaderFont;
  size: PortfolioGlobalSubtitleSize;
  color: string;
  decoration: PortfolioGlobalTextDecoration;
  highlightColor: string;
  italic: boolean;
  uppercase: boolean;
};

export type PortfolioGlobalBackgroundImageSize = 'cover' | 'contain' | 'fill';

export type PortfolioGlobalBackgroundImagePosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type PortfolioGlobalSettings = {
  backgroundEnabled: boolean;
  backgroundColor: string;
  /** Fixed viewport background image (stays put while scrolling). */
  backgroundImageEnabled: boolean;
  backgroundImageUrl: string;
  backgroundImageSize: PortfolioGlobalBackgroundImageSize;
  backgroundImagePosition: PortfolioGlobalBackgroundImagePosition;
  /** Image layer opacity 0–100. */
  backgroundImageOpacity: number;
  /** Insets from each viewport edge in px (0–240). */
  backgroundImageInsetTop: number;
  backgroundImageInsetRight: number;
  backgroundImageInsetBottom: number;
  backgroundImageInsetLeft: number;
  /**
   * When true, keep social brands + hardcoded accent utilities monochrome.
   * Set by Noir / Blanc and preserved on duplicates so images/icons don’t flip on edit.
   */
  monochromeUi: boolean;
  titleAlignment: PortfolioGlobalTitleAlignment;
  titleOrientation: PortfolioGlobalTitleOrientation;
  titleOrientationTargets: PortfolioGlobalTitleOrientationTargets;
  contentWidth: PortfolioGlobalContentWidth;
  /** Left/right page gutters for hero + sections. */
  contentGutter: PortfolioGlobalContentGutter;
  titleScroll: PortfolioGlobalTitleScroll;
  motionProfile: PortfolioGlobalMotionProfile;
  sectionTitleTopSpacing: PortfolioGlobalSectionTitleTopSpacing;
  sectionOrder: PortfolioNavSectionKey[];
  titleTypography: PortfolioGlobalTitleTypography;
  subtitleTypography: PortfolioGlobalSubtitleTypography;
  titleChrome: PortfolioGlobalTitleChrome;
};

/** Partial patch accepted by updateGlobal — nested objects merge deeply via mergeGlobalSettings. */
export type PortfolioGlobalSettingsPatch = Partial<PortfolioGlobalSettings>;

export const DEFAULT_GLOBAL_BACKGROUND_COLOR = '#ffffff';

export const DEFAULT_GLOBAL_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_GLOBAL_SUBTITLE_COLOR = '#737373';
export const DEFAULT_GLOBAL_HIGHLIGHT_COLOR = '#fde68a';

export const DEFAULT_GLOBAL_TITLE_TYPOGRAPHY: PortfolioGlobalTitleTypography = {
  scope: 'section',
  font: 'sans',
  size: 'lg',
  color: DEFAULT_GLOBAL_TITLE_COLOR,
  decoration: 'none',
  highlightColor: DEFAULT_GLOBAL_HIGHLIGHT_COLOR,
  italic: false,
  uppercase: false,
};

export const DEFAULT_GLOBAL_SUBTITLE_TYPOGRAPHY: PortfolioGlobalSubtitleTypography = {
  scope: 'section',
  font: 'sans',
  size: 'md',
  color: DEFAULT_GLOBAL_SUBTITLE_COLOR,
  decoration: 'none',
  highlightColor: '#fef3c7',
  italic: false,
  uppercase: false,
};

export const DEFAULT_GLOBAL_TITLE_CHROME: PortfolioGlobalTitleChrome = {
  scope: 'section',
  backgroundEnabled: false,
  backgroundColor: '#f5f5f5',
  borderEnabled: false,
  borderColor: '#d4d4d4',
  borderWidth: 'thin',
  borderRadius: 'md',
  padding: 'none',
};

export const DEFAULT_GLOBAL_TITLE_ORIENTATION_TARGETS: PortfolioGlobalTitleOrientationTargets = {
  work: false,
  services: false,
  skills: false,
  about: false,
  experience: false,
  faq: false,
  contact: false,
};

export const DEFAULT_CONTENT_SECTION_ORDER: PortfolioNavSectionKey[] = [
  'work',
  'services',
  'about',
  'experience',
  'faq',
  'contact',
];

const CONTENT_SECTION_ORDER_KEYS = new Set<PortfolioNavSectionKey>([
  ...DEFAULT_CONTENT_SECTION_ORDER,
  'skills',
]);

/** Normalizes stored order: dedupes, drops unknown keys, appends any missing sections. */
export function resolveSectionOrder(order: PortfolioNavSectionKey[] | undefined): PortfolioNavSectionKey[] {
  if (!order?.length) return [...DEFAULT_CONTENT_SECTION_ORDER];

  const seen = new Set<PortfolioNavSectionKey>();
  const next: PortfolioNavSectionKey[] = [];

  for (const key of order) {
    if (!CONTENT_SECTION_ORDER_KEYS.has(key) || seen.has(key)) continue;
    seen.add(key);
    next.push(key);
  }

  for (const key of DEFAULT_CONTENT_SECTION_ORDER) {
    if (seen.has(key)) continue;
    if (key === 'experience') {
      const aboutIdx = next.indexOf('about');
      if (aboutIdx >= 0) {
        next.splice(aboutIdx + 1, 0, 'experience');
      } else {
        next.push('experience');
      }
      seen.add('experience');
      continue;
    }
    next.push(key);
    seen.add(key);
  }

  return next;
}

export function moveSectionInOrder(
  order: PortfolioNavSectionKey[],
  key: PortfolioNavSectionKey,
  direction: 'up' | 'down'
): PortfolioNavSectionKey[] {
  const resolved = resolveSectionOrder(order);
  const index = resolved.indexOf(key);
  if (index === -1) return resolved;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= resolved.length) return resolved;

  const next = [...resolved];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export const DEFAULT_GLOBAL_BACKGROUND_IMAGE_OPACITY = 100;
export const DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET = 0;

export const DEFAULT_GLOBAL_SETTINGS: PortfolioGlobalSettings = {
  backgroundEnabled: false,
  backgroundColor: DEFAULT_GLOBAL_BACKGROUND_COLOR,
  backgroundImageEnabled: false,
  backgroundImageUrl: '',
  backgroundImageSize: 'cover',
  backgroundImagePosition: 'center',
  backgroundImageOpacity: DEFAULT_GLOBAL_BACKGROUND_IMAGE_OPACITY,
  backgroundImageInsetTop: DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET,
  backgroundImageInsetRight: DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET,
  backgroundImageInsetBottom: DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET,
  backgroundImageInsetLeft: DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET,
  monochromeUi: false,
  titleAlignment: 'section',
  titleOrientation: 'horizontal',
  titleOrientationTargets: { ...DEFAULT_GLOBAL_TITLE_ORIENTATION_TARGETS },
  contentWidth: 'standard',
  contentGutter: DEFAULT_CONTENT_GUTTER,
  titleScroll: 'sticky',
  motionProfile: DEFAULT_MOTION_PROFILE,
  sectionTitleTopSpacing: 'standard',
  sectionOrder: [...DEFAULT_CONTENT_SECTION_ORDER],
  titleTypography: { ...DEFAULT_GLOBAL_TITLE_TYPOGRAPHY },
  subtitleTypography: { ...DEFAULT_GLOBAL_SUBTITLE_TYPOGRAPHY },
  titleChrome: { ...DEFAULT_GLOBAL_TITLE_CHROME },
};

export const PORTFOLIO_GLOBAL_TITLE_ALIGNMENT_OPTIONS: {
  value: PortfolioGlobalTitleAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'section', label: 'Per section', description: 'Each section keeps its own alignment.' },
  { value: 'left', label: 'Left', description: 'Force every section title to the left.' },
  { value: 'center', label: 'Center', description: 'Center every section title.' },
  { value: 'right', label: 'Right', description: 'Align every section title to the right.' },
];

export const PORTFOLIO_GLOBAL_CONTENT_WIDTH_OPTIONS: {
  value: PortfolioGlobalContentWidth;
  label: string;
  description: string;
}[] = [
  { value: 'standard', label: 'Standard', description: 'Default editorial reading width.' },
  { value: 'wide', label: 'Wide', description: 'Roomier layout on large screens.' },
  { value: 'full', label: 'Full', description: 'Maximize horizontal space.' },
];

export const PORTFOLIO_GLOBAL_CONTENT_GUTTER_OPTIONS: {
  value: PortfolioGlobalContentGutter;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No left/right margins — edge to edge.' },
  { value: 'wide', label: 'Wider', description: 'Slightly less margin — content a bit wider.' },
  { value: 'medium', label: 'Medium', description: 'Current editorial side margins.' },
  { value: 'narrow', label: 'Narrower', description: 'Slightly more margin — content a bit tighter.' },
];

export const PORTFOLIO_GLOBAL_TITLE_SCROLL_OPTIONS: {
  value: PortfolioGlobalTitleScroll;
  label: string;
  description: string;
}[] = [
  {
    value: 'sticky',
    label: 'Sticky pill',
    description: 'Title shrinks into a floating pill at the top-left while scrolling.',
  },
  {
    value: 'static',
    label: 'Simple',
    description: 'No animation — the title scrolls away with the content.',
  },
];

export const PORTFOLIO_GLOBAL_TITLE_ORIENTATION_OPTIONS: {
  value: PortfolioGlobalTitleOrientation;
  label: string;
  description: string;
}[] = [
  { value: 'horizontal', label: 'Horizontal', description: 'Standard title reading left to right.' },
  { value: 'vertical', label: 'Vertical', description: 'Rotate the title to run down the side rail.' },
];

export const PORTFOLIO_GLOBAL_SECTION_TOP_SPACING_OPTIONS: {
  value: PortfolioGlobalSectionTitleTopSpacing;
  label: string;
  description: string;
}[] = [
  { value: 'compact', label: 'Compact', description: 'Tighter space above every section title.' },
  { value: 'standard', label: 'Standard', description: 'Default editorial spacing above titles.' },
  { value: 'comfortable', label: 'Comfortable', description: 'More breathing room above titles.' },
  { value: 'spacious', label: 'Spacious', description: 'Maximum space above section titles.' },
];

export const PORTFOLIO_GLOBAL_TYPOGRAPHY_SCOPE_OPTIONS: {
  value: PortfolioGlobalTypographyScope;
  label: string;
  description: string;
}[] = [
  { value: 'section', label: 'Per section', description: 'Each section keeps its own title or subtitle style.' },
  { value: 'global', label: 'Global', description: 'Apply one shared style to every section.' },
];

export const PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS: {
  value: PortfolioGlobalHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_GLOBAL_TITLE_SIZE_OPTIONS: {
  value: PortfolioGlobalTitleSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact section titles.' },
  { value: 'md', label: 'Medium', description: 'Balanced editorial scale.' },
  { value: 'lg', label: 'Large', description: 'Default hero-style headings.' },
  { value: 'xl', label: 'Extra large', description: 'Maximum impact headlines.' },
];

export const PORTFOLIO_GLOBAL_SUBTITLE_SIZE_OPTIONS: {
  value: PortfolioGlobalSubtitleSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact descriptive text.' },
  { value: 'md', label: 'Medium', description: 'Default reading size.' },
  { value: 'lg', label: 'Large', description: 'Roomier lead paragraph.' },
];

export const PORTFOLIO_GLOBAL_TEXT_DECORATION_OPTIONS: {
  value: PortfolioGlobalTextDecoration;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Plain text without extra emphasis.' },
  { value: 'underline', label: 'Underline', description: 'Underline the text.' },
  { value: 'highlight', label: 'Highlight', description: 'Marker-style background behind the text.' },
];

export const PORTFOLIO_GLOBAL_TITLE_CHROME_PADDING_OPTIONS: {
  value: PortfolioGlobalTitleChromePadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No extra space around the title.' },
  { value: 'compact', label: 'Compact', description: 'Tight padding around the title.' },
  { value: 'standard', label: 'Standard', description: 'Balanced padding.' },
  { value: 'comfortable', label: 'Comfortable', description: 'Roomier padding.' },
];

export const PORTFOLIO_GLOBAL_TITLE_CHROME_RADIUS_OPTIONS: {
  value: PortfolioGlobalTitleChromeRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Square corners.' },
  { value: 'sm', label: 'Small', description: 'Subtle rounding.' },
  { value: 'md', label: 'Medium', description: 'Default rounded corners.' },
  { value: 'lg', label: 'Large', description: 'Softer corners.' },
  { value: 'full', label: 'Pill', description: 'Fully rounded capsule shape.' },
];

export const PORTFOLIO_GLOBAL_TITLE_CHROME_BORDER_WIDTH_OPTIONS: {
  value: PortfolioGlobalTitleChromeBorderWidth;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No border stroke.' },
  { value: 'thin', label: 'Thin', description: '1px border.' },
  { value: 'medium', label: 'Medium', description: '2px border.' },
  { value: 'thick', label: 'Thick', description: '3px border.' },
];

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

/** Resolves the effective title alignment for a section given the global override. */
export function resolveSectionHeaderAlign(
  global: PortfolioGlobalSettings,
  sectionAlignment: 'left' | 'center'
): { centered: boolean; alignRight: boolean; alwaysCentered: boolean } {
  if (global.titleAlignment === 'section') {
    return {
      centered: sectionAlignment === 'center',
      alignRight: false,
      alwaysCentered: sectionAlignment === 'center',
    };
  }
  const align = global.titleAlignment;
  return {
    centered: align === 'center',
    alignRight: align === 'right',
    alwaysCentered: true,
  };
}

/** Resolves vertical orientation for a single section (only when globally enabled and targeted). */
export function resolveSectionTitleOrientation(
  global: PortfolioGlobalSettings,
  section: PortfolioNavSectionKey
): PortfolioGlobalTitleOrientation {
  if (global.titleOrientation !== 'vertical') return 'horizontal';
  return global.titleOrientationTargets[section] ? 'vertical' : 'horizontal';
}

function globalTitleChromePaddingClass(padding: PortfolioGlobalTitleChromePadding): string {
  switch (padding) {
    case 'compact':
      return 'px-2 py-1 sm:px-2.5 sm:py-1.5';
    case 'comfortable':
      return 'px-5 py-3 sm:px-6 sm:py-4';
    case 'standard':
      return 'px-3 py-2 sm:px-4 sm:py-2.5';
    default:
      return '';
  }
}

function globalTitleChromeRadiusClass(radius: PortfolioGlobalTitleChromeRadius): string {
  switch (radius) {
    case 'sm':
      return 'rounded-md';
    case 'md':
      return 'rounded-xl';
    case 'lg':
      return 'rounded-2xl';
    case 'full':
      return 'rounded-full';
    default:
      return '';
  }
}

function globalTitleChromeBorderWidthClass(width: PortfolioGlobalTitleChromeBorderWidth): string {
  switch (width) {
    case 'thin':
      return 'border';
    case 'medium':
      return 'border-2';
    case 'thick':
      return 'border-[3px]';
    default:
      return '';
  }
}

export type ResolvedGlobalTitleChrome = {
  className: string;
  style: CSSProperties;
};

/** Box background, border, and padding around section titles when global chrome is active. */
export function resolveGlobalSectionTitleChrome(
  global: PortfolioGlobalSettings
): ResolvedGlobalTitleChrome {
  const chrome = global.titleChrome;
  if (chrome.scope !== 'global') return { className: '', style: {} };

  const hasChrome =
    chrome.backgroundEnabled ||
    chrome.borderEnabled ||
    chrome.padding !== 'none' ||
    chrome.borderRadius !== 'none';

  if (!hasChrome) return { className: '', style: {} };

  const className = [
    'inline-block w-fit',
    globalTitleChromePaddingClass(chrome.padding),
    globalTitleChromeRadiusClass(chrome.borderRadius),
    chrome.borderEnabled ? globalTitleChromeBorderWidthClass(chrome.borderWidth) : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style: CSSProperties = {};
  if (chrome.backgroundEnabled) {
    style.backgroundColor = sanitizeHex(chrome.backgroundColor, DEFAULT_GLOBAL_TITLE_CHROME.backgroundColor);
  }
  if (chrome.borderEnabled && chrome.borderWidth !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(chrome.borderColor, DEFAULT_GLOBAL_TITLE_CHROME.borderColor);
  }

  return { className, style };
}

export const PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS: {
  value: PortfolioGlobalBackgroundImageSize;
  label: string;
  description: string;
}[] = [
  { value: 'cover', label: 'Cover', description: 'Fill the area — may crop the image.' },
  { value: 'contain', label: 'Contain', description: 'Fit the whole image — may leave gaps.' },
  { value: 'fill', label: 'Stretch', description: 'Stretch to every edge, ignoring aspect ratio.' },
];

export const PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS: {
  value: PortfolioGlobalBackgroundImagePosition;
  label: string;
  description: string;
}[] = [
  { value: 'center', label: 'Center', description: 'Anchor the image in the middle.' },
  { value: 'top', label: 'Top', description: 'Pin to the top edge.' },
  { value: 'bottom', label: 'Bottom', description: 'Pin to the bottom edge.' },
  { value: 'left', label: 'Left', description: 'Pin to the left edge.' },
  { value: 'right', label: 'Right', description: 'Pin to the right edge.' },
  { value: 'top-left', label: 'Top left', description: 'Pin to the top-left corner.' },
  { value: 'top-right', label: 'Top right', description: 'Pin to the top-right corner.' },
  { value: 'bottom-left', label: 'Bottom left', description: 'Pin to the bottom-left corner.' },
  { value: 'bottom-right', label: 'Bottom right', description: 'Pin to the bottom-right corner.' },
];

function sanitizeBackgroundImageUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return trimmed;
  } catch {
    return '';
  }
  return '';
}

function sanitizeInsetPx(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(240, Math.max(0, Math.round(value)));
}

function sanitizeOpacityPercent(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function backgroundImagePositionCss(position: PortfolioGlobalBackgroundImagePosition): string {
  switch (position) {
    case 'top':
      return 'center top';
    case 'bottom':
      return 'center bottom';
    case 'left':
      return 'left center';
    case 'right':
      return 'right center';
    case 'top-left':
      return 'left top';
    case 'top-right':
      return 'right top';
    case 'bottom-left':
      return 'left bottom';
    case 'bottom-right':
      return 'right bottom';
    default:
      return 'center center';
  }
}

function backgroundImageSizeCss(size: PortfolioGlobalBackgroundImageSize): string {
  switch (size) {
    case 'contain':
      return 'contain';
    case 'fill':
      return '100% 100%';
    default:
      return 'cover';
  }
}

/** True when a solid color and/or fixed image should replace default white page chrome. */
export function hasGlobalPageBackground(global: PortfolioGlobalSettings): boolean {
  if (global.backgroundEnabled) return true;
  return (
    global.backgroundImageEnabled && Boolean(sanitizeBackgroundImageUrl(global.backgroundImageUrl))
  );
}

/** Solid page color only — when true, section fills are suppressed so the global color shows through. */
export function hasGlobalSolidBackground(global: PortfolioGlobalSettings): boolean {
  return global.backgroundEnabled;
}

export function globalBackgroundStyle(global: PortfolioGlobalSettings): CSSProperties | undefined {
  if (!global.backgroundEnabled) return undefined;
  return { backgroundColor: sanitizeHex(global.backgroundColor, DEFAULT_GLOBAL_BACKGROUND_COLOR) };
}

/** Fixed layer style for the viewport background image (insets from all sides). */
export function globalFixedBackgroundImageStyle(
  global: PortfolioGlobalSettings
): CSSProperties | undefined {
  if (!global.backgroundImageEnabled) return undefined;
  const url = sanitizeBackgroundImageUrl(global.backgroundImageUrl);
  if (!url) return undefined;

  const opacity = sanitizeOpacityPercent(
    global.backgroundImageOpacity,
    DEFAULT_GLOBAL_BACKGROUND_IMAGE_OPACITY
  );

  return {
    top: sanitizeInsetPx(global.backgroundImageInsetTop, DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET),
    right: sanitizeInsetPx(global.backgroundImageInsetRight, DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET),
    bottom: sanitizeInsetPx(global.backgroundImageInsetBottom, DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET),
    left: sanitizeInsetPx(global.backgroundImageInsetLeft, DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET),
    backgroundImage: `url(${JSON.stringify(url)})`,
    backgroundSize: backgroundImageSizeCss(global.backgroundImageSize),
    backgroundPosition: backgroundImagePositionCss(global.backgroundImagePosition),
    backgroundRepeat: 'no-repeat',
    opacity: opacity / 100,
  };
}

export function globalContentWidthClass(width: PortfolioGlobalContentWidth): string | undefined {
  switch (width) {
    case 'wide':
      return 'max-w-[92rem]';
    case 'full':
      return 'max-w-none';
    default:
      return undefined;
  }
}

/** Uniform padding-top above section titles (Portfolio → Footer). */
export function globalSectionTitleTopClass(
  spacing: PortfolioGlobalSectionTitleTopSpacing
): string {
  switch (spacing) {
    case 'compact':
      return 'pt-8 sm:pt-10 lg:pt-12';
    case 'comfortable':
      return 'pt-16 sm:pt-20 lg:pt-24';
    case 'spacious':
      return 'pt-20 sm:pt-28 lg:pt-36';
    default:
      return 'pt-12 sm:pt-16 lg:pt-20';
  }
}

function globalHeaderFontClass(font: PortfolioGlobalHeaderFont, kind: 'title' | 'subtitle'): string {
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

function globalHeaderFontStyle(font: PortfolioGlobalHeaderFont): CSSProperties | undefined {
  if (font === 'serif') return { fontFamily: "'Playfair Display', serif" };
  return undefined;
}

function globalTitleSizeClass(size: PortfolioGlobalTitleSize): string {
  switch (size) {
    case 'sm':
      return 'text-3xl sm:text-4xl lg:text-5xl lg:leading-[0.95]';
    case 'md':
      return 'text-4xl sm:text-5xl lg:text-6xl lg:leading-[0.95]';
    case 'xl':
      return 'text-6xl sm:text-7xl lg:text-8xl lg:leading-[0.92]';
    default:
      return 'text-5xl sm:text-6xl lg:text-7xl lg:leading-[0.95]';
  }
}

function globalSubtitleSizeClass(size: PortfolioGlobalSubtitleSize): string {
  switch (size) {
    case 'sm':
      return 'text-sm sm:text-base';
    case 'lg':
      return 'text-lg sm:text-xl';
    default:
      return 'text-base sm:text-lg';
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const trimmed = hex.trim();
  const short = /^#([0-9A-Fa-f]{3})$/.exec(trimmed);
  const long = /^#([0-9A-Fa-f]{6})$/.exec(trimmed);
  const h = short ? short[1].split('').map((c) => c + c).join('') : long ? long[1] : null;
  if (!h) return `rgba(253, 230, 138, ${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function globalTextDecorationStyle(
  decoration: PortfolioGlobalTextDecoration,
  highlightColor: string
): CSSProperties {
  switch (decoration) {
    case 'underline':
      return {
        textDecoration: 'underline',
        textDecorationThickness: '2px',
        textUnderlineOffset: '0.18em',
      };
    case 'highlight':
      return {
        display: 'inline',
        backgroundImage: `linear-gradient(transparent 58%, ${hexToRgba(highlightColor, 0.55)} 58%)`,
        backgroundRepeat: 'no-repeat',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
        padding: '0 0.08em',
        margin: '0 -0.08em',
      };
    default:
      return {};
  }
}

export type ResolvedGlobalHeaderTypography = {
  className: string;
  style: CSSProperties;
  /** Applied to an inline span wrapping the text so highlight/underline hug the glyphs. */
  decorationStyle: CSSProperties;
  customSizing: boolean;
};

export function resolveGlobalSectionTitleTypography(
  global: PortfolioGlobalSettings,
  section: {
    fontClass: string;
    fontStyle?: CSSProperties;
    colorStyle?: CSSProperties;
  }
): ResolvedGlobalHeaderTypography {
  if (global.titleTypography.scope === 'section') {
    return {
      className: section.fontClass,
      style: { ...section.fontStyle, ...section.colorStyle },
      decorationStyle: {},
      customSizing: false,
    };
  }

  const typo = global.titleTypography;
  const className = [
    globalHeaderFontClass(typo.font, 'title'),
    globalTitleSizeClass(typo.size),
    typo.italic ? 'italic' : '',
    typo.uppercase && typo.font !== 'display' ? 'uppercase' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    className,
    style: {
      ...globalHeaderFontStyle(typo.font),
      color: sanitizeHex(typo.color, DEFAULT_GLOBAL_TITLE_COLOR),
    },
    decorationStyle: globalTextDecorationStyle(typo.decoration, typo.highlightColor),
    customSizing: true,
  };
}

export function resolveGlobalSectionSubtitleTypography(
  global: PortfolioGlobalSettings,
  section: {
    fontClass: string;
    fontStyle?: CSSProperties;
    colorStyle?: CSSProperties;
  }
): ResolvedGlobalHeaderTypography {
  if (global.subtitleTypography.scope === 'section') {
    return {
      className: section.fontClass,
      style: { ...section.fontStyle, ...section.colorStyle },
      decorationStyle: {},
      customSizing: false,
    };
  }

  const typo = global.subtitleTypography;
  const className = [
    globalHeaderFontClass(typo.font, 'subtitle'),
    globalSubtitleSizeClass(typo.size),
    typo.italic ? 'italic' : '',
    typo.uppercase && typo.font !== 'display' ? 'uppercase' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    className,
    style: {
      ...globalHeaderFontStyle(typo.font),
      color: sanitizeHex(typo.color, DEFAULT_GLOBAL_SUBTITLE_COLOR),
    },
    decorationStyle: globalTextDecorationStyle(typo.decoration, typo.highlightColor),
    customSizing: true,
  };
}

function mergeTitleTypography(
  base: PortfolioGlobalTitleTypography,
  patch: unknown
): PortfolioGlobalTitleTypography {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const scope = record.scope;
  const font = record.font;
  const size = record.size;
  const decoration = record.decoration;

  return {
    scope: scope === 'section' || scope === 'global' ? scope : base.scope,
    font: font === 'sans' || font === 'serif' || font === 'display' ? font : base.font,
    size: size === 'sm' || size === 'md' || size === 'lg' || size === 'xl' ? size : base.size,
    color: sanitizeHex(record.color, base.color),
    decoration:
      decoration === 'none' || decoration === 'underline' || decoration === 'highlight'
        ? decoration
        : base.decoration,
    highlightColor: sanitizeHex(record.highlightColor, base.highlightColor),
    italic: typeof record.italic === 'boolean' ? record.italic : base.italic,
    uppercase: typeof record.uppercase === 'boolean' ? record.uppercase : base.uppercase,
  };
}

function mergeSubtitleTypography(
  base: PortfolioGlobalSubtitleTypography,
  patch: unknown
): PortfolioGlobalSubtitleTypography {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const scope = record.scope;
  const font = record.font;
  const size = record.size;
  const decoration = record.decoration;

  return {
    scope: scope === 'section' || scope === 'global' ? scope : base.scope,
    font: font === 'sans' || font === 'serif' || font === 'display' ? font : base.font,
    size: size === 'sm' || size === 'md' || size === 'lg' ? size : base.size,
    color: sanitizeHex(record.color, base.color),
    decoration:
      decoration === 'none' || decoration === 'underline' || decoration === 'highlight'
        ? decoration
        : base.decoration,
    highlightColor: sanitizeHex(record.highlightColor, base.highlightColor),
    italic: typeof record.italic === 'boolean' ? record.italic : base.italic,
    uppercase: typeof record.uppercase === 'boolean' ? record.uppercase : base.uppercase,
  };
}

const ORIENTATION_TARGET_KEYS: PortfolioNavSectionKey[] = [...DEFAULT_CONTENT_SECTION_ORDER, 'skills'];

function mergeSectionOrder(base: PortfolioNavSectionKey[], patch: unknown): PortfolioNavSectionKey[] {
  if (!Array.isArray(patch)) return resolveSectionOrder(base);
  return resolveSectionOrder(patch as PortfolioNavSectionKey[]);
}

function mergeTitleOrientationTargets(
  base: PortfolioGlobalTitleOrientationTargets,
  patch: unknown
): PortfolioGlobalTitleOrientationTargets {
  if (!patch || typeof patch !== 'object') return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const key of ORIENTATION_TARGET_KEYS) {
    if (typeof record[key] === 'boolean') next[key] = record[key];
  }
  return next;
}

function mergeTitleChrome(
  base: PortfolioGlobalTitleChrome,
  patch: unknown
): PortfolioGlobalTitleChrome {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const scope = record.scope;
  const borderWidth = record.borderWidth;
  const borderRadius = record.borderRadius;
  const padding = record.padding;

  return {
    scope: scope === 'section' || scope === 'global' ? scope : base.scope,
    backgroundEnabled:
      typeof record.backgroundEnabled === 'boolean' ? record.backgroundEnabled : base.backgroundEnabled,
    backgroundColor: sanitizeHex(record.backgroundColor, base.backgroundColor),
    borderEnabled: typeof record.borderEnabled === 'boolean' ? record.borderEnabled : base.borderEnabled,
    borderColor: sanitizeHex(record.borderColor, base.borderColor),
    borderWidth:
      borderWidth === 'none' ||
      borderWidth === 'thin' ||
      borderWidth === 'medium' ||
      borderWidth === 'thick'
        ? borderWidth
        : base.borderWidth,
    borderRadius:
      borderRadius === 'none' ||
      borderRadius === 'sm' ||
      borderRadius === 'md' ||
      borderRadius === 'lg' ||
      borderRadius === 'full'
        ? borderRadius
        : base.borderRadius,
    padding:
      padding === 'none' ||
      padding === 'compact' ||
      padding === 'standard' ||
      padding === 'comfortable'
        ? padding
        : base.padding,
  };
}

export function mergeGlobalSettings(base: PortfolioGlobalSettings, patch: unknown): PortfolioGlobalSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const titleAlignment = record.titleAlignment;
  const contentWidth = record.contentWidth;
  const contentGutter = record.contentGutter;
  const titleScroll = record.titleScroll;
  const sectionTitleTopSpacing = record.sectionTitleTopSpacing;
  const titleOrientation =
    record.titleOrientation === 'horizontal' || record.titleOrientation === 'vertical'
      ? record.titleOrientation
      : base.titleOrientation;

  const titleOrientationTargets = mergeTitleOrientationTargets(
    base.titleOrientationTargets,
    record.titleOrientationTargets
  );

  // Partial patches omit titleOrientationTargets — keep the current selection, never reset it.
  const backgroundImageSize = record.backgroundImageSize;
  const backgroundImagePosition = record.backgroundImagePosition;

  return {
    backgroundEnabled:
      typeof record.backgroundEnabled === 'boolean' ? record.backgroundEnabled : base.backgroundEnabled,
    backgroundColor: sanitizeHex(record.backgroundColor, base.backgroundColor),
    backgroundImageEnabled:
      typeof record.backgroundImageEnabled === 'boolean'
        ? record.backgroundImageEnabled
        : base.backgroundImageEnabled,
    backgroundImageUrl:
      typeof record.backgroundImageUrl === 'string'
        ? record.backgroundImageUrl.trim()
        : base.backgroundImageUrl,
    backgroundImageSize:
      backgroundImageSize === 'cover' ||
      backgroundImageSize === 'contain' ||
      backgroundImageSize === 'fill'
        ? backgroundImageSize
        : base.backgroundImageSize,
    backgroundImagePosition:
      backgroundImagePosition === 'center' ||
      backgroundImagePosition === 'top' ||
      backgroundImagePosition === 'bottom' ||
      backgroundImagePosition === 'left' ||
      backgroundImagePosition === 'right' ||
      backgroundImagePosition === 'top-left' ||
      backgroundImagePosition === 'top-right' ||
      backgroundImagePosition === 'bottom-left' ||
      backgroundImagePosition === 'bottom-right'
        ? backgroundImagePosition
        : base.backgroundImagePosition,
    backgroundImageOpacity: sanitizeOpacityPercent(
      record.backgroundImageOpacity,
      base.backgroundImageOpacity
    ),
    backgroundImageInsetTop: sanitizeInsetPx(
      record.backgroundImageInsetTop,
      base.backgroundImageInsetTop
    ),
    backgroundImageInsetRight: sanitizeInsetPx(
      record.backgroundImageInsetRight,
      base.backgroundImageInsetRight
    ),
    backgroundImageInsetBottom: sanitizeInsetPx(
      record.backgroundImageInsetBottom,
      base.backgroundImageInsetBottom
    ),
    backgroundImageInsetLeft: sanitizeInsetPx(
      record.backgroundImageInsetLeft,
      base.backgroundImageInsetLeft
    ),
    monochromeUi:
      typeof record.monochromeUi === 'boolean' ? record.monochromeUi : base.monochromeUi,
    titleAlignment:
      titleAlignment === 'section' ||
      titleAlignment === 'left' ||
      titleAlignment === 'center' ||
      titleAlignment === 'right'
        ? titleAlignment
        : base.titleAlignment,
    titleOrientation,
    titleOrientationTargets,
    contentWidth:
      contentWidth === 'standard' || contentWidth === 'wide' || contentWidth === 'full'
        ? contentWidth
        : base.contentWidth,
    contentGutter:
      contentGutter === 'none' ||
      contentGutter === 'wide' ||
      contentGutter === 'medium' ||
      contentGutter === 'narrow'
        ? contentGutter
        : base.contentGutter,
    titleScroll:
      titleScroll === 'sticky' || titleScroll === 'static' ? titleScroll : base.titleScroll,
    motionProfile: resolveMotionProfileFromStorage(
      record,
      mergeMotionProfile(base.motionProfile, record.motionProfile)
    ),
    sectionTitleTopSpacing:
      sectionTitleTopSpacing === 'compact' ||
      sectionTitleTopSpacing === 'standard' ||
      sectionTitleTopSpacing === 'comfortable' ||
      sectionTitleTopSpacing === 'spacious'
        ? sectionTitleTopSpacing
        : base.sectionTitleTopSpacing,
    sectionOrder: mergeSectionOrder(base.sectionOrder, record.sectionOrder),
    titleTypography: mergeTitleTypography(base.titleTypography, record.titleTypography),
    subtitleTypography: mergeSubtitleTypography(base.subtitleTypography, record.subtitleTypography),
    titleChrome: mergeTitleChrome(base.titleChrome, record.titleChrome),
  };
}
