import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioNavPlacement = PortfolioNavSettings['placement'];
export type PortfolioNavMode = PortfolioNavSettings['navMode'];
export type PortfolioNavBarDesign = PortfolioNavSettings['barDesign'];
export type PortfolioNavContentMode = PortfolioNavSettings['contentMode'];
export type PortfolioNavButtonDesign = PortfolioNavSettings['buttonDesign'];
export type PortfolioNavActiveStyle = PortfolioNavSettings['activeStyle'];
export type PortfolioNavDisplayMode = PortfolioNavSettings['displayMode'];
export type PortfolioNavLabelCase = PortfolioNavSettings['labelCase'];
export type PortfolioNavBarWidth = PortfolioNavSettings['barWidth'];
export type PortfolioNavBarThickness = PortfolioNavSettings['barThickness'];
export type PortfolioNavBarPadding = PortfolioNavSettings['barPadding'];
export type PortfolioNavEdgeOffset = PortfolioNavSettings['edgeOffset'];
export type PortfolioNavItemGap = PortfolioNavSettings['itemGap'];

export const PORTFOLIO_NAV_MODE_OPTIONS: {
  value: PortfolioNavMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'default',
    label: 'Default',
    description: 'Floating menu — scroll the page and jump with the nav bar.',
  },
  {
    value: 'per-page',
    label: 'Per page',
    description: 'Dots + previous / next — still scrolls between sections.',
  },
  {
    value: 'pages',
    label: 'Pages',
    description: 'Each section is its own page — switch only with the nav bar (no scroll between sections).',
  },
];

export const PORTFOLIO_NAV_PLACEMENT_OPTIONS: {
  value: PortfolioNavPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'top-center', label: 'Top center', description: 'Horizontal pill centered at the top.' },
  { value: 'top-left', label: 'Top left', description: 'Items align to the left inside the bar.' },
  { value: 'top-right', label: 'Top right', description: 'Items align to the right inside the bar.' },
  { value: 'bottom-center', label: 'Bottom center', description: 'Horizontal bar centered above the bottom edge.' },
  { value: 'bottom-left', label: 'Bottom left', description: 'Items align to the left at the bottom.' },
  { value: 'bottom-right', label: 'Bottom right', description: 'Items align to the right at the bottom.' },
  { value: 'left-center', label: 'Left center', description: 'Vertical stack on the left, centered on screen.' },
  { value: 'right-center', label: 'Right center', description: 'Vertical stack on the right, centered on screen.' },
];

export const PORTFOLIO_NAV_BAR_DESIGN_OPTIONS: {
  value: PortfolioNavBarDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'classic',
    label: 'Classic pill',
    description: 'Soft floating capsule — polished editorial default.',
  },
  {
    value: 'rail',
    label: 'Editorial rail',
    description: 'Structured panel with dividers and a slim accent on the active item.',
  },
  {
    value: 'dock',
    label: 'Icon dock',
    description: 'Individual circular buttons — minimal and tactile.',
  },
];

export const PORTFOLIO_NAV_CONTENT_MODE_OPTIONS: {
  value: PortfolioNavContentMode;
  label: string;
  description: string;
}[] = [
  { value: 'icons', label: 'Icons only', description: 'Compact section icons with accessible labels.' },
  { value: 'text', label: 'Text buttons', description: 'Uppercase or styled text labels per section.' },
  {
    value: 'both',
    label: 'Icons + text',
    description: 'Icon and label together on each button.',
  },
];

export const PORTFOLIO_NAV_BUTTON_DESIGN_OPTIONS: {
  value: PortfolioNavButtonDesign;
  label: string;
  description: string;
}[] = [
  { value: 'clean', label: 'Clean', description: 'Flat buttons — shape comes from the bar design only.' },
  { value: 'outlined', label: 'Outlined', description: 'Crisp border around every button.' },
  { value: 'soft', label: 'Soft fill', description: 'Light tinted background on each item.' },
  { value: 'glow', label: 'Glow', description: 'Soft shadow with warm accent when active.' },
];

export const PORTFOLIO_NAV_ACTIVE_OPTIONS: {
  value: PortfolioNavActiveStyle;
  label: string;
  description: string;
}[] = [
  { value: 'filled-pill', label: 'Filled pill', description: 'Solid dark capsule behind the active link.' },
  { value: 'underline', label: 'Underline', description: 'Accent underline beneath the active item.' },
  { value: 'outline', label: 'Outline', description: 'Border ring around the active link.' },
  { value: 'accent-text', label: 'Accent text', description: 'Colored bold text — no background shape.' },
];

export const PORTFOLIO_NAV_DISPLAY_OPTIONS: {
  value: PortfolioNavDisplayMode;
  label: string;
  description: string;
}[] = [
  { value: 'always', label: 'Always visible', description: 'Shown as soon as the page loads.' },
  { value: 'on-scroll', label: 'After scrolling', description: 'Appears once the visitor scrolls down.' },
  { value: 'after-hero', label: 'After hero', description: 'Hidden until the hero section is passed.' },
];

export const PORTFOLIO_NAV_LABEL_CASE_OPTIONS: {
  value: PortfolioNavLabelCase;
  label: string;
  description: string;
}[] = [
  { value: 'uppercase', label: 'Uppercase', description: 'Bold caps with wide letter-spacing.' },
  { value: 'titlecase', label: 'Title case', description: 'Capitalized words — editorial feel.' },
  { value: 'normal', label: 'Sentence case', description: 'Natural casing as written in labels.' },
];

export const PORTFOLIO_NAV_BAR_WIDTH_OPTIONS: {
  value: PortfolioNavBarWidth;
  label: string;
  description: string;
}[] = [
  {
    value: 'hug',
    label: 'Hug content',
    description: 'Current pill — only as wide as the icons.',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Slightly wider background, still compact.',
  },
  {
    value: 'wide',
    label: 'Wide',
    description: 'Stretches across a large portion of the screen.',
  },
  {
    value: 'full',
    label: 'Full width',
    description: 'Edge-to-edge bar (no left/right gap).',
  },
];

export const PORTFOLIO_NAV_BAR_THICKNESS_OPTIONS: {
  value: PortfolioNavBarThickness;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Thin', description: 'Smaller icons and hit targets.' },
  { value: 'md', label: 'Medium', description: 'Default balanced icon size.' },
  { value: 'lg', label: 'Thick', description: 'Larger icons and buttons.' },
  { value: 'xl', label: 'Extra thick', description: 'Bold, oversized icons.' },
];

export const PORTFOLIO_NAV_BAR_PADDING_OPTIONS: {
  value: PortfolioNavBarPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No inner padding — items flush to the bar edge.' },
  { value: 'sm', label: 'Small', description: 'Tight padding around the items.' },
  { value: 'md', label: 'Medium', description: 'Default balanced padding.' },
  { value: 'lg', label: 'Large', description: 'Roomy space inside the bar.' },
  { value: 'xl', label: 'Extra large', description: 'Very spacious padding around items.' },
];

export const PORTFOLIO_NAV_EDGE_OFFSET_OPTIONS: {
  value: PortfolioNavEdgeOffset;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Close', description: 'Flush against the viewport edge.' },
  { value: 'md', label: 'Default', description: 'Comfortable gap from the edge.' },
  { value: 'lg', label: 'Spacious', description: 'More breathing room from the top/edge.' },
  { value: 'xl', label: 'Far', description: 'Pushed further into the page.' },
];

export const PORTFOLIO_NAV_ITEM_GAP_OPTIONS: {
  value: PortfolioNavItemGap;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No gap — items touch.' },
  { value: 'sm', label: 'Small', description: 'Tight — about 8px between items.' },
  { value: 'md', label: 'Medium', description: 'Clear gap — about 20px between items.' },
  { value: 'lg', label: 'Large', description: 'Roomy — about 40px between items.' },
  { value: 'xl', label: 'Extra large', description: 'Wide — about 64px between items.' },
  {
    value: 'spread',
    label: 'Spread',
    description: 'Distribute items evenly across the full bar width.',
  },
];

export function portfolioNavIsVertical(placement: PortfolioNavPlacement): boolean {
  return placement === 'left-center' || placement === 'right-center';
}

function edgeOffsetClass(offset: PortfolioNavEdgeOffset, axis: 'top' | 'bottom' | 'left' | 'right'): string {
  const map: Record<PortfolioNavEdgeOffset, Record<'top' | 'bottom' | 'left' | 'right', string>> = {
    sm: { top: 'top-0', bottom: 'bottom-0', left: 'left-0', right: 'right-0' },
    md: { top: 'top-4 sm:top-5', bottom: 'bottom-4 sm:bottom-5', left: 'left-4 sm:left-6', right: 'right-4 sm:right-6' },
    lg: { top: 'top-6 sm:top-8', bottom: 'bottom-6 sm:bottom-8', left: 'left-5 sm:left-8', right: 'right-5 sm:right-8' },
    xl: { top: 'top-10 sm:top-14', bottom: 'bottom-10 sm:bottom-14', left: 'left-6 sm:left-10', right: 'right-6 sm:right-10' },
  };
  return map[offset][axis];
}

export function portfolioNavPlacementClass(
  placement: PortfolioNavPlacement,
  edgeOffset: PortfolioNavEdgeOffset = 'md',
  barWidth: PortfolioNavBarWidth = 'hug'
): string {
  const top = edgeOffsetClass(edgeOffset, 'top');
  const bottom = edgeOffsetClass(edgeOffset, 'bottom');
  const left = edgeOffsetClass(edgeOffset, 'left');
  const right = edgeOffsetClass(edgeOffset, 'right');
  /** Full width spans the viewport; left/right placement only shifts items inside. */
  const stretch = barWidth === 'full' && !portfolioNavIsVertical(placement);
  const sideL = stretch ? 'left-0' : left;
  const sideR = stretch ? 'right-0' : right;
  const resetX = 'translate-x-0';
  const resetY = 'translate-y-0';

  switch (placement) {
    case 'top-left':
      return stretch
        ? `bottom-auto ${resetX} ${resetY} ${sideL} ${sideR} ${top}`
        : `right-auto bottom-auto ${resetX} ${resetY} ${left} ${top}`;
    case 'top-right':
      return stretch
        ? `bottom-auto ${resetX} ${resetY} ${sideL} ${sideR} ${top}`
        : `left-auto bottom-auto ${resetX} ${resetY} ${right} ${top}`;
    case 'bottom-center':
      return stretch
        ? `top-auto ${resetX} ${resetY} ${sideL} ${sideR} ${bottom}`
        : `top-auto left-1/2 right-auto ${resetY} -translate-x-1/2 ${bottom}`;
    case 'bottom-left':
      return stretch
        ? `top-auto ${resetX} ${resetY} ${sideL} ${sideR} ${bottom}`
        : `top-auto right-auto ${resetX} ${resetY} ${bottom} ${left}`;
    case 'bottom-right':
      return stretch
        ? `top-auto ${resetX} ${resetY} ${sideL} ${sideR} ${bottom}`
        : `top-auto left-auto ${resetX} ${resetY} ${bottom} ${right}`;
    case 'left-center':
      return `right-auto bottom-auto ${resetX} -translate-y-1/2 ${left} top-1/2`;
    case 'right-center':
      return `left-auto bottom-auto ${resetX} -translate-y-1/2 ${right} top-1/2`;
    default:
      // top-center
      return stretch
        ? `bottom-auto ${resetX} ${resetY} ${sideL} ${sideR} ${top}`
        : `right-auto bottom-auto ${resetY} left-1/2 ${top} -translate-x-1/2`;
  }
}

/** How items align inside the bar — left/right placement shifts content, not bar width. */
export function portfolioNavItemsAlignClass(
  placement: PortfolioNavPlacement,
  itemGap: PortfolioNavItemGap,
  vertical: boolean
): string {
  if (itemGap === 'spread') return 'justify-evenly';
  if (vertical) return 'justify-center';
  switch (placement) {
    case 'top-left':
    case 'bottom-left':
      return 'justify-start';
    case 'top-right':
    case 'bottom-right':
      return 'justify-end';
    default:
      return 'justify-center';
  }
}

export function portfolioNavBarWidthClass(
  barWidth: PortfolioNavBarWidth,
  vertical: boolean
): string {
  if (vertical) return 'w-fit';
  switch (barWidth) {
    case 'medium':
      return 'w-[min(calc(100vw-1.5rem),22rem)] sm:w-[min(calc(100vw-2rem),28rem)]';
    case 'wide':
      return 'w-[min(calc(100vw-1.5rem),36rem)] sm:w-[min(calc(100vw-2rem),48rem)]';
    case 'full':
      return 'w-full';
    default:
      return 'w-fit';
  }
}

export function portfolioNavBarInnerClass(
  barWidth: PortfolioNavBarWidth,
  vertical: boolean,
  itemGap: PortfolioNavItemGap = 'sm',
  placement: PortfolioNavPlacement = 'top-center'
): string {
  const gapClass = portfolioNavItemGapClass(itemGap, vertical);
  const alignClass = portfolioNavItemsAlignClass(placement, itemGap, vertical);
  if (vertical) {
    return `flex w-fit max-w-[calc(100vw-1.5rem)] flex-col ${alignClass} ${gapClass}`;
  }
  if (barWidth === 'hug') {
    return `flex w-fit max-w-[calc(100vw-1.5rem)] flex-row ${alignClass} ${gapClass}`;
  }
  return `flex w-full flex-row ${alignClass} ${gapClass}`;
}

export function portfolioNavItemGapClass(itemGap: PortfolioNavItemGap, vertical: boolean): string {
  if (itemGap === 'spread') return 'gap-0';
  const map: Record<Exclude<PortfolioNavItemGap, 'spread'>, string> = {
    none: 'gap-0',
    sm: vertical ? 'gap-1.5' : 'gap-2',
    md: vertical ? 'gap-4' : 'gap-5',
    lg: vertical ? 'gap-7' : 'gap-10',
    xl: vertical ? 'gap-10' : 'gap-16',
  };
  return map[itemGap];
}

function glassShell(glassEffect: boolean): string {
  return glassEffect
    ? 'border shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md'
    : 'border shadow-md';
}

function barPaddingClass(padding: PortfolioNavBarPadding): string {
  switch (padding) {
    case 'none':
      return 'p-0';
    case 'sm':
      return 'p-1';
    case 'lg':
      return 'p-3';
    case 'xl':
      return 'p-4 sm:p-5';
    default:
      return 'p-1.5 sm:p-2';
  }
}

function barRadiusClass(
  design: PortfolioNavBarDesign,
  vertical: boolean,
  barWidth: PortfolioNavBarWidth
): string {
  if (barWidth === 'full' && !vertical) return 'rounded-none';
  switch (design) {
    case 'rail':
      return 'rounded-2xl';
    case 'dock':
      return '';
    default:
      return vertical ? 'rounded-[1.75rem]' : 'rounded-full';
  }
}

export function portfolioNavBarContainerClass(
  design: PortfolioNavBarDesign,
  glassEffect: boolean,
  vertical: boolean,
  barPadding: PortfolioNavBarPadding = 'md',
  barWidth: PortfolioNavBarWidth = 'hug'
): string {
  const glass = glassShell(glassEffect);
  const pad = barPaddingClass(barPadding);
  const radius = barRadiusClass(design, vertical, barWidth);

  switch (design) {
    case 'rail':
      return vertical
        ? `flex flex-col overflow-hidden border ${radius} ${pad} ${glass}`
        : `flex flex-row overflow-hidden border ${radius} ${pad} ${glass}`;
    case 'dock':
      return vertical ? 'flex flex-col p-0' : 'flex flex-row p-0';
    default:
      return vertical
        ? `flex flex-col overflow-hidden border ${radius} ${pad} ${glass}`
        : `flex flex-row overflow-hidden border ${radius} ${pad} ${glass}`;
  }
}

export const DEFAULT_NAV_BAR_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_NAV_BAR_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_NAV_ITEM_ICON_COLOR = '#525252';
export const DEFAULT_NAV_ITEM_TEXT_COLOR = '#525252';
export const DEFAULT_NAV_ITEM_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_NAV_ITEM_BORDER_COLOR = '#e5e5e5';

function navHex(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

export function portfolioNavBarShellStyle(
  backgroundColor: string,
  borderColor: string,
  glassEffect: boolean
): { backgroundColor: string; borderColor: string } {
  const bg = navHex(backgroundColor, DEFAULT_NAV_BAR_BACKGROUND_COLOR);
  const border = navHex(borderColor, DEFAULT_NAV_BAR_BORDER_COLOR);
  return {
    backgroundColor: glassEffect ? `${bg}e6` : bg,
    borderColor: border,
  };
}

/** Inactive item colors — skipped when active so active styles can win. */
export function portfolioNavItemColorStyles(
  iconColor: string,
  textColor: string,
  backgroundColor: string,
  borderColor: string,
  active: boolean
): {
  shell?: { backgroundColor: string; borderColor: string; borderWidth: number; borderStyle: 'solid' };
  icon?: { color: string };
  text?: { color: string };
} {
  if (active) return {};
  return {
    shell: {
      backgroundColor: navHex(backgroundColor, DEFAULT_NAV_ITEM_BACKGROUND_COLOR),
      borderColor: navHex(borderColor, DEFAULT_NAV_ITEM_BORDER_COLOR),
      borderWidth: 1,
      borderStyle: 'solid',
    },
    icon: { color: navHex(iconColor, DEFAULT_NAV_ITEM_ICON_COLOR) },
    text: { color: navHex(textColor, DEFAULT_NAV_ITEM_TEXT_COLOR) },
  };
}

function iconSizeClass(thickness: PortfolioNavBarThickness, compactOnMobile: boolean): string {
  switch (thickness) {
    case 'sm':
      return compactOnMobile
        ? 'h-8 w-8 sm:h-9 sm:w-9'
        : 'h-9 w-9';
    case 'lg':
      return compactOnMobile
        ? 'h-11 w-11 sm:h-12 sm:w-12'
        : 'h-12 w-12';
    case 'xl':
      return compactOnMobile
        ? 'h-12 w-12 sm:h-14 sm:w-14'
        : 'h-14 w-14';
    default:
      return compactOnMobile
        ? 'h-10 w-10 sm:h-11 sm:w-11'
        : 'h-10 w-10 sm:h-11 sm:w-11';
  }
}

export function portfolioNavIconGlyphClass(thickness: PortfolioNavBarThickness): string {
  switch (thickness) {
    case 'sm':
      return 'h-4 w-4';
    case 'lg':
      return 'h-5 w-5 sm:h-6 sm:w-6';
    case 'xl':
      return 'h-6 w-6';
    default:
      return 'h-5 w-5';
  }
}

export function portfolioNavItemBaseClass(
  design: PortfolioNavBarDesign,
  contentMode: PortfolioNavContentMode,
  buttonDesign: PortfolioNavButtonDesign,
  labelCase: PortfolioNavLabelCase,
  compactOnMobile: boolean,
  vertical: boolean,
  thickness: PortfolioNavBarThickness = 'md'
): string {
  const textSize =
    thickness === 'sm'
      ? compactOnMobile
        ? 'text-[9px] sm:text-[10px]'
        : 'text-[10px]'
      : thickness === 'lg' || thickness === 'xl'
        ? compactOnMobile
          ? 'text-[11px] sm:text-xs'
          : 'text-xs'
        : compactOnMobile
          ? 'text-[10px] sm:text-[11px]'
          : 'text-[11px]';
  const textPad =
    thickness === 'sm'
      ? compactOnMobile
        ? 'px-2.5 py-1 sm:px-3 sm:py-1.5'
        : 'px-3 py-1.5'
      : thickness === 'lg'
        ? compactOnMobile
          ? 'px-3.5 py-2 sm:px-5 sm:py-2.5'
          : 'px-5 py-2.5'
        : thickness === 'xl'
          ? 'px-5 py-3 sm:px-6 sm:py-3.5'
          : compactOnMobile
            ? 'px-3 py-1.5 sm:px-4 sm:py-2'
            : 'px-4 py-2';
  const casing =
    labelCase === 'uppercase'
      ? 'font-bold uppercase tracking-[0.14em]'
      : labelCase === 'titlecase'
        ? 'font-semibold capitalize tracking-[0.04em]'
        : 'font-medium tracking-normal normal-case';

  const decor = portfolioNavButtonDesignBaseClass(buttonDesign);
  const iconBox = iconSizeClass(thickness, compactOnMobile);

  if (contentMode === 'icons') {
    switch (design) {
      case 'dock':
        return `flex ${iconBox} shrink-0 items-center justify-center rounded-full border border-neutral-200/90 bg-white shadow-sm transition dark:border-neutral-700 dark:bg-neutral-900 ${decor}`;
      case 'rail':
        return vertical
          ? `flex ${iconBox} shrink-0 items-center justify-center rounded-xl transition ${decor}`
          : `flex ${iconBox} shrink-0 items-center justify-center rounded-xl transition ${decor}`;
      default:
        return `flex ${iconBox} shrink-0 items-center justify-center rounded-full transition ${decor}`;
    }
  }

  const bothLayout =
    contentMode === 'both'
      ? vertical
        ? 'inline-flex flex-col gap-1'
        : 'inline-flex flex-row gap-1.5'
      : '';

  switch (design) {
    case 'rail':
      return vertical
        ? `flex w-full items-center justify-center rounded-xl ${textPad} ${textSize} ${casing} ${bothLayout} transition ${decor}`
        : `shrink-0 items-center justify-center rounded-xl ${textPad} ${textSize} ${casing} ${bothLayout || 'inline-flex'} transition ${decor}`;
    case 'dock':
      return `inline-flex shrink-0 items-center justify-center rounded-full ${textPad} ${textSize} ${casing} ${bothLayout} border border-neutral-200/90 bg-white shadow-sm transition ${decor}`;
    default:
      return `shrink-0 items-center justify-center rounded-full ${textPad} ${textSize} ${casing} ${bothLayout || 'inline-flex'} transition ${decor}`;
  }
}

function portfolioNavButtonDesignBaseClass(buttonDesign: PortfolioNavButtonDesign): string {
  switch (buttonDesign) {
    case 'outlined':
      return 'border border-neutral-200/90 bg-white/90 dark:border-neutral-700 dark:bg-neutral-900/90';
    case 'soft':
      return 'border border-transparent bg-neutral-100/90 dark:bg-neutral-800/80';
    case 'glow':
      return 'border border-white/70 bg-white/95 shadow-[0_2px_14px_rgba(0,0,0,0.07)] dark:border-neutral-700 dark:bg-neutral-900/95';
    default:
      return '';
  }
}

function portfolioNavButtonDesignActiveClass(
  buttonDesign: PortfolioNavButtonDesign,
  vertical: boolean
): string {
  switch (buttonDesign) {
    case 'outlined':
      return 'border-neutral-900 dark:border-white';
    case 'soft':
      return 'border-orange-200/80 bg-orange-50 text-neutral-950 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-white';
    case 'glow':
      return vertical
        ? 'border-orange-200/90 shadow-[0_4px_22px_rgba(249,115,22,0.28)] ring-2 ring-orange-200/50'
        : 'border-orange-200/90 shadow-[0_4px_22px_rgba(249,115,22,0.28)] ring-2 ring-orange-200/50';
    default:
      return '';
  }
}

export function portfolioNavItemActiveClass(
  design: PortfolioNavBarDesign,
  buttonDesign: PortfolioNavButtonDesign,
  activeStyle: PortfolioNavActiveStyle,
  active: boolean,
  vertical: boolean
): string {
  if (!active) {
    const inactive =
      design === 'dock'
        ? 'text-neutral-600 hover:border-neutral-300 hover:text-neutral-950 dark:text-neutral-400'
        : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white';

    if (buttonDesign === 'soft') {
      return `${inactive} hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80`;
    }
    if (buttonDesign === 'glow') {
      return `${inactive} hover:shadow-[0_4px_18px_rgba(0,0,0,0.1)]`;
    }
    return inactive;
  }

  const decorActive = portfolioNavButtonDesignActiveClass(buttonDesign, vertical);

  if (design === 'rail') {
    const railActive = vertical
      ? 'bg-neutral-100 font-semibold text-neutral-950 ring-2 ring-inset ring-orange-500/35 dark:bg-neutral-800 dark:text-white'
      : 'bg-neutral-100 font-semibold text-neutral-950 shadow-inner ring-1 ring-orange-500/30 dark:bg-neutral-800 dark:text-white';
    return decorActive ? `${railActive} ${decorActive}` : railActive;
  }

  if (design === 'dock') {
    const dockActive =
      'border-neutral-900 bg-neutral-950 text-white shadow-md dark:border-white dark:bg-white dark:text-neutral-950';
    return decorActive ? `${dockActive} ${decorActive}` : dockActive;
  }

  let classicActive: string;
  switch (activeStyle) {
    case 'underline':
      classicActive = vertical
        ? 'rounded-none border-l-2 border-orange-500 bg-transparent font-bold text-neutral-950 dark:text-white'
        : 'rounded-none border-b-2 border-orange-500 pb-1.5 font-bold text-neutral-950 dark:text-white';
      break;
    case 'outline':
      classicActive = 'border border-neutral-900 font-bold text-neutral-950 dark:border-white dark:text-white';
      break;
    case 'accent-text':
      classicActive = 'font-bold text-orange-600 dark:text-orange-400';
      break;
    default:
      classicActive = 'bg-neutral-950 font-bold text-white dark:bg-white dark:text-neutral-950';
  }

  return decorActive ? `${classicActive} ${decorActive}` : classicActive;
}

export function portfolioNavRailDividerClass(vertical: boolean): string {
  return vertical
    ? 'mx-auto h-px w-6 bg-neutral-200/90 dark:bg-neutral-700'
    : 'my-auto h-5 w-px bg-neutral-200/90 dark:bg-neutral-700';
}

export function formatNavLabel(label: string, labelCase: PortfolioNavLabelCase): string {
  if (labelCase === 'uppercase') return label.toUpperCase();
  if (labelCase === 'titlecase') {
    return label.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return label;
}
