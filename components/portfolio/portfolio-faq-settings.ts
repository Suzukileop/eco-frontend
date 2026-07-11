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
import {
  createElementTextStyle,
  normalizeElementStylesRecord,
  patchElementStylesRecord,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';

export type PortfolioFaqTitlePreset = 'faq' | 'questions' | 'common-questions' | 'q-and-a' | 'custom';

export type PortfolioFaqSubtitlePreset = 'default' | 'short' | 'reassurance' | 'minimal' | 'custom';

export type PortfolioFaqHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioFaqHeaderAlignment = 'left' | 'center' | 'right';

export type PortfolioFaqItemDesign =
  | 'editorial'
  | 'minimal'
  | 'bordered'
  | 'accent'
  | 'pill'
  | 'compact'
  | 'two-column'
  | 'numbered-rail';

export type PortfolioFaqItemGap = 'sm' | 'md' | 'lg';

export type PortfolioFaqListMaxWidth = 'narrow' | 'default' | 'wide' | 'full';
export type PortfolioFaqListPlacement = 'left' | 'center' | 'right';

export type PortfolioFaqTextSize = 'sm' | 'md' | 'lg';

export type PortfolioFaqExpandIconStyle = 'plus' | 'chevron';

export type PortfolioFaqContentAlign = 'left' | 'center' | 'right';

/** Which FAQ text element can be styled independently (color, font, size, weight). */
export type PortfolioFaqStyleTarget = 'question' | 'answer' | 'number';

export type PortfolioFaqElementStyles = Record<PortfolioFaqStyleTarget, PortfolioElementTextStyle>;

export type PortfolioFaqPresentationSettings = PortfolioSectionBackgroundSettings &
  PortfolioServicesCardBackgroundSettings & {
  titlePreset: PortfolioFaqTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioFaqSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioFaqHeaderFont;
  subtitleFont: PortfolioFaqHeaderFont;
  titleColor: string;
  subtitleColor: string;
  titleUppercase: boolean;
  subtitleUppercase: boolean;
  headerAlignment: PortfolioFaqHeaderAlignment;
  itemDesign: PortfolioFaqItemDesign;
  itemGap: PortfolioFaqItemGap;
  listMaxWidth: PortfolioFaqListMaxWidth;
  listPlacement: PortfolioFaqListPlacement;
  itemAlign: PortfolioFaqContentAlign;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  accentColor: string;
  questionFont: PortfolioFaqHeaderFont;
  answerFont: PortfolioFaqHeaderFont;
  questionColor: string;
  answerColor: string;
  questionSize: PortfolioFaqTextSize;
  answerSize: PortfolioFaqTextSize;
  numberColor: string;
  expandIconStyle: PortfolioFaqExpandIconStyle;
  expandIconColor: string;
  answerAccentBorderColor: string;
  showItemNumbers: boolean;
  showAnswerAccentBorder: boolean;
  showExpandIcon: boolean;
  /** Per-element color, font, size, and weight for question, answer, and item number. */
  elementStyles: PortfolioFaqElementStyles;
};

export type PortfolioFaqSectionSettings = PortfolioSectionCopy & PortfolioFaqPresentationSettings;

export const DEFAULT_FAQ_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_FAQ_SUBTITLE_COLOR = '#737373';
export const DEFAULT_FAQ_ACCENT_COLOR = '#f97316';
export const DEFAULT_FAQ_QUESTION_COLOR = '#0a0a0a';
export const DEFAULT_FAQ_ANSWER_COLOR = '#525252';
export const DEFAULT_FAQ_NUMBER_COLOR = '#f97316';
export const DEFAULT_FAQ_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_FAQ_CARD_BACKGROUND_COLOR = '#ffffff';

const FAQ_ITEM_DESIGNS = [
  'editorial',
  'minimal',
  'bordered',
  'accent',
  'pill',
  'compact',
  'two-column',
  'numbered-rail',
] as const;

export const FAQ_STYLE_TARGET_IDS: PortfolioFaqStyleTarget[] = ['question', 'answer', 'number'];

export const DEFAULT_FAQ_ELEMENT_STYLES: PortfolioFaqElementStyles = {
  question: createElementTextStyle({
    color: DEFAULT_FAQ_QUESTION_COLOR,
    font: 'serif',
    size: 'md',
    bold: true,
  }),
  answer: createElementTextStyle({
    color: DEFAULT_FAQ_ANSWER_COLOR,
    font: 'sans',
    size: 'md',
  }),
  number: createElementTextStyle({
    color: DEFAULT_FAQ_NUMBER_COLOR,
    font: 'sans',
    size: 'sm',
    bold: true,
  }),
};

export const PORTFOLIO_FAQ_STYLE_TARGET_OPTIONS: {
  value: PortfolioFaqStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'question', label: 'Question', description: 'The question text in each FAQ row.' },
  { value: 'answer', label: 'Answer', description: 'The expanded answer paragraph.' },
  { value: 'number', label: 'Item number', description: 'The numbered label before each question.' },
];

export const DEFAULT_FAQ_PRESENTATION: PortfolioFaqPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  titlePreset: 'faq',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'sans',
  titleColor: DEFAULT_FAQ_TITLE_COLOR,
  subtitleColor: DEFAULT_FAQ_SUBTITLE_COLOR,
  titleUppercase: false,
  subtitleUppercase: false,
  headerAlignment: 'center',
  itemDesign: 'editorial',
  itemGap: 'md',
  listMaxWidth: 'default',
  listPlacement: 'center',
  itemAlign: 'left',
  cardBorder: 'soft',
  cardBorderColor: DEFAULT_FAQ_CARD_BORDER_COLOR,
  cardBackgroundEnabled: true,
  cardBackgroundColor: DEFAULT_FAQ_CARD_BACKGROUND_COLOR,
  cardBorderRadius: 'md',
  cardPadding: 'none',
  accentColor: DEFAULT_FAQ_ACCENT_COLOR,
  questionFont: 'serif',
  answerFont: 'sans',
  questionColor: DEFAULT_FAQ_QUESTION_COLOR,
  answerColor: DEFAULT_FAQ_ANSWER_COLOR,
  questionSize: 'md',
  answerSize: 'md',
  numberColor: DEFAULT_FAQ_NUMBER_COLOR,
  expandIconStyle: 'plus',
  expandIconColor: '#737373',
  answerAccentBorderColor: DEFAULT_FAQ_ACCENT_COLOR,
  showItemNumbers: true,
  showAnswerAccentBorder: true,
  showExpandIcon: true,
  elementStyles: DEFAULT_FAQ_ELEMENT_STYLES,
};

export const PORTFOLIO_FAQ_TITLE_PRESET_OPTIONS: {
  value: PortfolioFaqTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'faq', label: 'FAQ', description: 'Classic short label.' },
  { value: 'questions', label: 'Questions', description: 'Simple and direct.' },
  { value: 'common-questions', label: 'Common questions', description: 'Client-friendly wording.' },
  { value: 'q-and-a', label: 'Q & A', description: 'Compact editorial style.' },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_FAQ_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioFaqSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One concise supporting line.' },
  { value: 'reassurance', label: 'Reassurance', description: 'Builds trust before contact.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_FAQ_HEADER_FONT_OPTIONS: {
  value: PortfolioFaqHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_FAQ_ITEM_DESIGN_OPTIONS: {
  value: PortfolioFaqItemDesign;
  label: string;
  description: string;
}[] = [
  { value: 'editorial', label: 'Editorial', description: 'Framed list with soft panel — default.' },
  { value: 'pill', label: 'Soft pills', description: 'Standalone rounded rows with light fill.' },
  { value: 'minimal', label: 'Minimal', description: 'Clean dividers, no outer frame.' },
  { value: 'bordered', label: 'Bordered cards', description: 'Each question in its own card.' },
  { value: 'accent', label: 'Accent edge', description: 'Warm left border on each item.' },
  { value: 'numbered-rail', label: 'Numbered rail', description: 'Accent step numbers with connector line.' },
  { value: 'two-column', label: 'Two columns', description: 'Grid layout on large screens.' },
  { value: 'compact', label: 'Compact', description: 'Dense spacing and smaller type.' },
];

export const PORTFOLIO_FAQ_ITEM_GAP_OPTIONS: {
  value: PortfolioFaqItemGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Tight', description: 'Minimal space between items.' },
  { value: 'md', label: 'Standard', description: 'Balanced spacing.' },
  { value: 'lg', label: 'Relaxed', description: 'Generous space between items.' },
];

export const PORTFOLIO_FAQ_LIST_MAX_WIDTH_OPTIONS: {
  value: PortfolioFaqListMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'narrow', label: 'Narrow', description: 'Compact reading column.' },
  { value: 'default', label: 'Default', description: 'Standard FAQ width.' },
  { value: 'wide', label: 'Wide', description: 'Roomier layout.' },
  { value: 'full', label: 'Full', description: 'Use the full section width.' },
];

export const PORTFOLIO_FAQ_LIST_PLACEMENT_OPTIONS: {
  value: PortfolioFaqListPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Align FAQ block to the left.' },
  { value: 'center', label: 'Center', description: 'Center FAQ block (default).' },
  { value: 'right', label: 'Right', description: 'Align FAQ block to the right.' },
];

export const PORTFOLIO_FAQ_TEXT_SIZE_OPTIONS: {
  value: PortfolioFaqTextSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

export const PORTFOLIO_FAQ_CONTENT_ALIGN_OPTIONS: {
  value: PortfolioFaqContentAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Default left alignment for rows and answers.' },
  { value: 'center', label: 'Center', description: 'Center question, icon, and answer content.' },
  { value: 'right', label: 'Right', description: 'Right-aligned FAQ content.' },
];

export const PORTFOLIO_FAQ_EXPAND_ICON_OPTIONS: {
  value: PortfolioFaqExpandIconStyle;
  label: string;
  description: string;
}[] = [
  { value: 'plus', label: 'Plus', description: 'Rotates 45° when open.' },
  { value: 'chevron', label: 'Chevron', description: 'Rotates downward when open.' },
];

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioFaqSubtitlePreset, 'default' | 'custom' | 'minimal'>,
  string
> = {
  short: 'Quick answers to common questions before we start working together.',
  reassurance: 'Everything you need to know — clear, honest, and upfront.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

export function resolveFaqSectionTitle(
  settings: Pick<PortfolioFaqSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  switch (settings.titlePreset) {
    case 'questions':
      return 'QUESTIONS';
    case 'common-questions':
      return 'COMMON QUESTIONS';
    case 'q-and-a':
      return 'Q & A';
    case 'custom':
      return settings.titleCustom.trim() || settings.title.trim() || 'FAQ';
    default:
      return 'FAQ';
  }
}

export function resolveFaqSectionSubtitle(
  settings: Pick<PortfolioFaqSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'reassurance':
      return SUBTITLE_PRESET_COPY.reassurance;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function faqHeaderFontClass(font: PortfolioFaqHeaderFont, kind: 'title' | 'subtitle'): string {
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

export function faqHeaderFontStyle(font: PortfolioFaqHeaderFont): CSSProperties | undefined {
  if (font === 'serif') return { fontFamily: "'Playfair Display', serif" };
  return undefined;
}

export function faqTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FAQ_TITLE_COLOR) };
}

export function faqSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FAQ_SUBTITLE_COLOR) };
}

export function faqListMaxWidthClass(width: PortfolioFaqListMaxWidth): string {
  switch (width) {
    case 'narrow':
      return 'max-w-2xl';
    case 'wide':
      return 'max-w-5xl';
    case 'full':
      return 'max-w-none';
    default:
      return 'max-w-3xl';
  }
}

export function faqListPlacementClass(placement: PortfolioFaqListPlacement): string {
  switch (placement) {
    case 'left':
      return 'mr-auto ml-0';
    case 'right':
      return 'ml-auto mr-0';
    default:
      return 'mx-auto';
  }
}

export function faqItemGapClass(gap: PortfolioFaqItemGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-2';
    case 'lg':
      return 'gap-5';
    default:
      return 'gap-3';
  }
}

function faqCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
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

export function faqFrameClass(p: PortfolioFaqPresentationSettings): string {
  const parts = [servicesCardRadiusClass(p.cardBorderRadius), servicesCardPaddingClass(p.cardPadding)];
  if (p.cardBorder !== 'none') {
    parts.push(faqCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function faqFrameStyle(p: PortfolioFaqPresentationSettings): CSSProperties {
  const style: CSSProperties = {};
  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_FAQ_CARD_BACKGROUND_COLOR);
  }
  if (p.cardBorder === 'accent') {
    style.borderColor = sanitizeHex(p.accentColor, DEFAULT_FAQ_ACCENT_COLOR);
  } else if (p.cardBorder === 'soft' || p.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.cardBorderColor, DEFAULT_FAQ_CARD_BORDER_COLOR);
  }
  return style;
}

export function faqContentAlignClass(align: PortfolioFaqContentAlign): {
  text: string;
  row: string;
  items: string;
} {
  switch (align) {
    case 'center':
      return { text: 'text-center', row: 'justify-center', items: 'items-center' };
    case 'right':
      return { text: 'text-right', row: 'justify-end', items: 'items-end' };
    default:
      return { text: 'text-left', row: 'justify-start', items: 'items-start' };
  }
}

export function faqListShellClass(
  design: PortfolioFaqItemDesign,
  gap: PortfolioFaqItemGap = 'md'
): string {
  const gapClass = faqItemGapClass(gap);

  switch (design) {
    case 'minimal':
      return 'overflow-hidden';
    case 'bordered':
    case 'pill':
    case 'accent':
    case 'numbered-rail':
      return `flex flex-col ${gapClass}`;
    case 'two-column':
      return `grid gap-4 lg:grid-cols-2 ${gapClass}`;
    case 'compact':
      return 'overflow-hidden divide-y divide-neutral-200/80';
    default:
      return 'overflow-hidden rounded-[1.35rem] border border-neutral-200/80 bg-transparent px-5 shadow-sm sm:px-7';
  }
}

export function faqItemShellClass(design: PortfolioFaqItemDesign): string {
  switch (design) {
    case 'bordered':
      return 'overflow-hidden rounded-[1.25rem] border border-neutral-200/80 bg-transparent shadow-sm';
    case 'accent':
      return 'overflow-hidden rounded-[1.25rem] border border-neutral-200/80 bg-transparent shadow-sm';
    case 'pill':
      return 'overflow-hidden rounded-[1.75rem] bg-transparent';
    case 'numbered-rail':
      return '';
    case 'minimal':
      return 'border-b border-neutral-200/80 last:border-b-0';
    case 'compact':
      return '';
    case 'two-column':
      return 'overflow-hidden rounded-[1.25rem] border border-neutral-200/80 bg-transparent shadow-sm h-fit';
    default:
      return 'border-b border-neutral-200/80 last:border-b-0';
  }
}

export function faqItemAccentStyle(
  design: PortfolioFaqItemDesign,
  accentColor: string
): CSSProperties | undefined {
  if (design !== 'accent') return undefined;
  const accent = sanitizeHex(accentColor, DEFAULT_FAQ_ACCENT_COLOR);
  return {
    borderLeftWidth: '4px',
    borderLeftColor: accent,
    backgroundImage: `linear-gradient(90deg, ${accent}10 0%, transparent 40%)`,
  };
}

export function faqQuestionClass(size: PortfolioFaqTextSize, font: PortfolioFaqHeaderFont): string {
  const parts = ['min-w-0 flex-1 font-semibold leading-snug', faqHeaderFontClass(font, 'title')];

  switch (size) {
    case 'sm':
      parts.push('text-sm sm:text-base');
      break;
    case 'lg':
      parts.push('text-lg sm:text-xl');
      break;
    default:
      parts.push('text-base sm:text-lg');
  }

  return parts.join(' ');
}

export function faqQuestionStyle(
  color: string,
  font: PortfolioFaqHeaderFont
): CSSProperties {
  return {
    color: sanitizeHex(color, DEFAULT_FAQ_QUESTION_COLOR),
    ...faqHeaderFontStyle(font),
  };
}

export function faqAnswerClass(size: PortfolioFaqTextSize, font: PortfolioFaqHeaderFont): string {
  const parts = ['whitespace-pre-line leading-relaxed', faqHeaderFontClass(font, 'subtitle')];

  switch (size) {
    case 'sm':
      parts.push('text-sm');
      break;
    case 'lg':
      parts.push('text-base sm:text-lg');
      break;
    default:
      parts.push('text-base');
  }

  return parts.join(' ');
}

export function faqAnswerStyle(color: string, font: PortfolioFaqHeaderFont): CSSProperties {
  return {
    color: sanitizeHex(color, DEFAULT_FAQ_ANSWER_COLOR),
    ...faqHeaderFontStyle(font),
  };
}

export function faqNumberStyle(numberColor: string): CSSProperties {
  return { color: sanitizeHex(numberColor, DEFAULT_FAQ_NUMBER_COLOR) };
}

export function faqAnswerBorderStyle(borderColor: string): CSSProperties {
  return {
    borderLeftWidth: '2px',
    borderLeftStyle: 'solid',
    borderLeftColor: sanitizeHex(borderColor, DEFAULT_FAQ_ACCENT_COLOR),
  };
}

export function faqExpandIconStyle(
  iconColor: string,
  accentColor: string
): { base: CSSProperties; open: CSSProperties } {
  const muted = sanitizeHex(iconColor, '#737373');
  const accent = sanitizeHex(accentColor, DEFAULT_FAQ_ACCENT_COLOR);
  return {
    base: { color: muted, borderColor: '#e5e5e5' },
    open: { color: accent, borderColor: `${accent}55`, backgroundColor: `${accent}12` },
  };
}

export function faqSummaryPaddingClass(design: PortfolioFaqItemDesign): string {
  if (design === 'compact') return 'py-4 sm:py-5';
  if (design === 'pill') return 'px-5 py-4 sm:px-6 sm:py-5';
  if (design === 'bordered' || design === 'accent' || design === 'two-column') {
    return 'px-5 py-5 sm:px-6 sm:py-6';
  }
  if (design === 'numbered-rail') return 'py-2';
  return 'py-6 sm:py-7';
}

export function faqIsCardDesign(design: PortfolioFaqItemDesign): boolean {
  return design === 'bordered' || design === 'accent' || design === 'pill' || design === 'two-column';
}

export function pickFaqPresentationSettings(faq: unknown): PortfolioFaqPresentationSettings {
  return mergeFaqPresentation(DEFAULT_FAQ_PRESENTATION, faq);
}

export function mergeFaqPresentation(
  base: PortfolioFaqPresentationSettings,
  patch: unknown
): PortfolioFaqPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);
  const frameBackground = mergeServicesCardBackgroundSettings(base, patch);
  // FAQ must stay solid — never inherit the skills/services diagonal split.
  const faqFrameBackground =
    frameBackground.cardBackgroundFill === 'split'
      ? { ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS }
      : frameBackground;

  const questionFont = pick(record.questionFont, ['sans', 'serif', 'display'], base.questionFont);
  const answerFont = pick(record.answerFont, ['sans', 'serif', 'display'], base.answerFont);
  const questionColor = sanitizeHex(record.questionColor, base.questionColor);
  const answerColor = sanitizeHex(record.answerColor, base.answerColor);
  const questionSize = pick(record.questionSize, ['sm', 'md', 'lg'], base.questionSize);
  const answerSize = pick(record.answerSize, ['sm', 'md', 'lg'], base.answerSize);
  const numberColor = sanitizeHex(record.numberColor, base.numberColor);

  const elementStyles =
    record.elementStyles !== undefined
      ? normalizeElementStylesRecord(record.elementStyles, DEFAULT_FAQ_ELEMENT_STYLES, FAQ_STYLE_TARGET_IDS)
      : // Backward compat: no elementStyles saved yet — seed from the legacy per-field settings.
        normalizeElementStylesRecord(
          {
            question: createElementTextStyle({ color: questionColor, font: questionFont, size: questionSize, bold: true }),
            answer: createElementTextStyle({ color: answerColor, font: answerFont, size: answerSize }),
            number: createElementTextStyle({ color: numberColor, font: 'sans', size: 'sm', bold: true }),
          },
          DEFAULT_FAQ_ELEMENT_STYLES,
          FAQ_STYLE_TARGET_IDS
        );

  return {
    ...background,
    ...faqFrameBackground,
    titlePreset: pick(record.titlePreset, ['faq', 'questions', 'common-questions', 'q-and-a', 'custom'], base.titlePreset),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'reassurance', 'minimal', 'custom'],
      base.subtitlePreset
    ),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    titleUppercase: typeof record.titleUppercase === 'boolean' ? record.titleUppercase : base.titleUppercase,
    subtitleUppercase:
      typeof record.subtitleUppercase === 'boolean' ? record.subtitleUppercase : base.subtitleUppercase,
    headerAlignment: pick(record.headerAlignment, ['left', 'center', 'right'], base.headerAlignment),
    itemDesign: pick(record.itemDesign, FAQ_ITEM_DESIGNS, base.itemDesign),
    itemGap: pick(record.itemGap, ['sm', 'md', 'lg'], base.itemGap),
    listMaxWidth: pick(record.listMaxWidth, ['narrow', 'default', 'wide', 'full'], base.listMaxWidth),
    listPlacement: pick(record.listPlacement, ['left', 'center', 'right'], base.listPlacement),
    itemAlign: pick(record.itemAlign, ['left', 'center', 'right'], base.itemAlign),
    cardBorder: pick(record.cardBorder, ['none', 'soft', 'solid', 'accent'], base.cardBorder),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean' ? record.cardBackgroundEnabled : base.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderRadius: pick(record.cardBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardBorderRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    questionFont,
    answerFont,
    questionColor,
    answerColor,
    questionSize,
    answerSize,
    numberColor,
    expandIconStyle: pick(record.expandIconStyle, ['plus', 'chevron'], base.expandIconStyle),
    expandIconColor: sanitizeHex(record.expandIconColor, base.expandIconColor),
    answerAccentBorderColor: sanitizeHex(record.answerAccentBorderColor, base.answerAccentBorderColor),
    showItemNumbers: typeof record.showItemNumbers === 'boolean' ? record.showItemNumbers : base.showItemNumbers,
    showAnswerAccentBorder:
      typeof record.showAnswerAccentBorder === 'boolean'
        ? record.showAnswerAccentBorder
        : base.showAnswerAccentBorder,
    showExpandIcon: typeof record.showExpandIcon === 'boolean' ? record.showExpandIcon : base.showExpandIcon,
    elementStyles,
  };
}

export function patchFaqElementStyle(
  styles: PortfolioFaqElementStyles,
  target: PortfolioFaqStyleTarget,
  patch: Partial<PortfolioElementTextStyle>
): PortfolioFaqElementStyles {
  return patchElementStylesRecord(styles, target, patch, DEFAULT_FAQ_ELEMENT_STYLES, FAQ_STYLE_TARGET_IDS);
}
