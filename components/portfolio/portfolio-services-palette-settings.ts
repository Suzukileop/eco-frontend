/**
 * Services & Skills palette — same 8 semantic tokens as Hero / Work / Nav.
 * Concrete hex fields still drive render; bindings choose which token paints each slot.
 */

import {
  computeLightPalette,
  DEFAULT_HERO_PALETTE,
  HERO_PALETTE_TOKEN_IDS,
  mergeHeroPalette,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';

/** Local mirrors — avoid importing portfolio-services-settings (circular TDZ). */
export type ServicesElementStyleTarget =
  | 'blockSubheading'
  | 'cardTitle'
  | 'cardBody'
  | 'price'
  | 'delivery'
  | 'skillTitle'
  | 'skillBody';

type ServicesElementStyles = Record<ServicesElementStyleTarget, PortfolioElementTextStyle>;

export type PortfolioServicesPalette = PortfolioHeroPalette;

export type ServicesColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'title'
  | 'subtitle'
  | 'cardBorder'
  | 'cardBackground'
  | 'cardAccent'
  | 'stageBackground'
  | 'stageBorder'
  | 'stagePattern'
  | 'blockSubheading'
  | 'cardTitle'
  | 'cardBody'
  | 'price'
  | 'delivery'
  | 'skillTitle'
  | 'skillBody';

export type PortfolioServicesColorBindings = Record<ServicesColorSlot, HeroPaletteTokenId>;

type ServicesPresentationColorFields = {
  sectionBackgroundColor?: string;
  sectionBackgroundGradientFrom?: string;
  sectionBackgroundGradientTo?: string;
  sectionBackgroundColorA?: string;
  sectionBackgroundColorB?: string;
  sectionBackgroundDividerColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  cardBorderColor?: string;
  cardBackgroundColor?: string;
  cardBackgroundEnabled?: boolean;
  cardBackgroundFill?: 'solid' | 'split';
  cardAccentColor?: string;
  stageBackgroundColor?: string;
  stageBorderColor?: string;
  stagePatternColor?: string;
  useHeroPalette?: boolean;
  servicesPalette?: PortfolioServicesPalette;
  servicesColorBindings?: PortfolioServicesColorBindings;
  elementStyles?: ServicesElementStyles;
  skillsHeader?: { titleColor?: string; subtitleColor?: string };
  servicesHeader?: { titleColor?: string; subtitleColor?: string };
};

export const SERVICES_COLOR_SLOT_IDS: ServicesColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'title',
  'subtitle',
  'cardBorder',
  'cardBackground',
  'cardAccent',
  'stageBackground',
  'stageBorder',
  'stagePattern',
  'blockSubheading',
  'cardTitle',
  'cardBody',
  'price',
  'delivery',
  'skillTitle',
  'skillBody',
];

export const PORTFOLIO_SERVICES_COLOR_SLOT_OPTIONS: {
  value: ServicesColorSlot;
  label: string;
  description: string;
}[] = [
  { value: 'sectionBackground', label: 'Section background', description: 'Solid section fill.' },
  { value: 'sectionGradientFrom', label: 'Gradient start', description: 'Start of the section gradient.' },
  { value: 'sectionGradientTo', label: 'Gradient end', description: 'End of the section gradient.' },
  { value: 'sectionSplitA', label: 'Split zone A', description: 'First split background zone.' },
  { value: 'sectionSplitB', label: 'Split zone B', description: 'Second split background zone.' },
  { value: 'sectionDivider', label: 'Split divider', description: 'Line between split zones.' },
  { value: 'title', label: 'Section title', description: 'Services & Skills heading.' },
  { value: 'subtitle', label: 'Section subtitle', description: 'Intro under the title.' },
  { value: 'cardBorder', label: 'Card border', description: 'Outline around skill / service cards.' },
  { value: 'cardBackground', label: 'Card background', description: 'Fill behind card content.' },
  { value: 'cardAccent', label: 'Card accent', description: 'Accent bars, checks, price emphasis.' },
  { value: 'stageBackground', label: 'Stage background', description: 'Outer framed stage fill.' },
  { value: 'stageBorder', label: 'Stage border', description: 'Outer framed stage outline.' },
  { value: 'stagePattern', label: 'Stage pattern', description: 'Decorative stage pattern ink.' },
  { value: 'blockSubheading', label: 'Block subheading', description: '“Tools” / “Services” labels.' },
  { value: 'cardTitle', label: 'Service title', description: 'Title on service / pricing cards.' },
  { value: 'cardBody', label: 'Service body', description: 'Description on service cards.' },
  { value: 'price', label: 'Price', description: 'Price / “from” amount.' },
  { value: 'delivery', label: 'Delivery', description: 'Delivery line on service cards.' },
  { value: 'skillTitle', label: 'Skill title', description: 'Tool name on skill cards.' },
  { value: 'skillBody', label: 'Skill body', description: 'Description on skill cards.' },
];

export const DARK_SERVICES_PALETTE: PortfolioServicesPalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_SERVICES_PALETTE: PortfolioServicesPalette = { ...DARK_SERVICES_PALETTE };

export function computeLightServicesPalette(
  dark: Partial<PortfolioServicesPalette>
): PortfolioServicesPalette {
  return computeLightPalette(mergeHeroPalette(DARK_SERVICES_PALETTE, dark));
}

/**
 * Card-surface text binds to texteFort/Muted; paint path also applies luminance
 * contrast so light cards never receive near-white ink from a dark palette.
 */
export const DEFAULT_SERVICES_COLOR_BINDINGS: PortfolioServicesColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  title: 'principal',
  subtitle: 'texteMuted',
  cardBorder: 'bordure',
  cardBackground: 'neutre',
  cardAccent: 'principal',
  stageBackground: 'neutre',
  stageBorder: 'bordure',
  stagePattern: 'texteFaint',
  blockSubheading: 'texteFaint',
  cardTitle: 'texteFort',
  cardBody: 'texteMuted',
  price: 'texteFort',
  delivery: 'texteMuted',
  skillTitle: 'texteFort',
  skillBody: 'texteMuted',
};

const SERVICES_SLOT_TO_FIELD: Record<ServicesColorSlot, string> = {
  sectionBackground: 'sectionBackgroundColor',
  sectionGradientFrom: 'sectionBackgroundGradientFrom',
  sectionGradientTo: 'sectionBackgroundGradientTo',
  sectionSplitA: 'sectionBackgroundColorA',
  sectionSplitB: 'sectionBackgroundColorB',
  sectionDivider: 'sectionBackgroundDividerColor',
  title: 'titleColor',
  subtitle: 'subtitleColor',
  cardBorder: 'cardBorderColor',
  cardBackground: 'cardBackgroundColor',
  cardAccent: 'cardAccentColor',
  stageBackground: 'stageBackgroundColor',
  stageBorder: 'stageBorderColor',
  stagePattern: 'stagePatternColor',
  blockSubheading: 'elementStyles.blockSubheading.color',
  cardTitle: 'elementStyles.cardTitle.color',
  cardBody: 'elementStyles.cardBody.color',
  price: 'elementStyles.price.color',
  delivery: 'elementStyles.delivery.color',
  skillTitle: 'elementStyles.skillTitle.color',
  skillBody: 'elementStyles.skillBody.color',
};

const SERVICES_ELEMENT_STYLE_SLOT: Partial<Record<ServicesColorSlot, ServicesElementStyleTarget>> = {
  blockSubheading: 'blockSubheading',
  cardTitle: 'cardTitle',
  cardBody: 'cardBody',
  price: 'price',
  delivery: 'delivery',
  skillTitle: 'skillTitle',
  skillBody: 'skillBody',
};

type ServicesPaletteHost = {
  servicesPalette?: Partial<PortfolioServicesPalette>;
  servicesColorBindings?: Partial<PortfolioServicesColorBindings>;
  elementStyles?: ServicesElementStyles;
  skillsHeader?: { titleColor?: string; subtitleColor?: string };
  servicesHeader?: { titleColor?: string; subtitleColor?: string };
};

type ServicesPalettePatch = ServicesPresentationColorFields;

function surfaceLuminance(hex: string): number {
  const raw = hex.replace('#', '').trim();
  if (raw.length !== 6 || !/^[0-9a-fA-F]+$/.test(raw)) return 0;
  const channel = (start: number) => {
    const c = parseInt(raw.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function inkOnCard(surfaceHex: string, strong: string, muted: string): { strong: string; muted: string } {
  if (surfaceLuminance(surfaceHex) > 0.55) {
    return { strong: '#15151a', muted: '#65656d' };
  }
  return { strong, muted };
}

function paintServicesElementColor(
  styles: ServicesElementStyles | undefined,
  target: ServicesElementStyleTarget,
  color: string
): ServicesElementStyles | undefined {
  if (!styles?.[target]) return styles;
  return {
    ...styles,
    [target]: { ...styles[target], color },
  };
}

export function mergeServicesPalette(
  base: PortfolioServicesPalette,
  patch: unknown
): PortfolioServicesPalette {
  return mergeHeroPalette(base, patch);
}

export function mergeServicesColorBindings(
  base: PortfolioServicesColorBindings,
  patch: unknown
): PortfolioServicesColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of SERVICES_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

/** Push palette + bindings into every bound concrete services hex field. */
export function applyServicesPaletteToSettings(services: ServicesPaletteHost): ServicesPalettePatch {
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  const bindings = mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, services.servicesColorBindings);
  let elementStyles = services.elementStyles ? { ...services.elementStyles } : undefined;

  const patch: Record<string, unknown> = {
    servicesPalette: palette,
    servicesColorBindings: bindings,
    cardBackgroundEnabled: true,
  };

  const resolve = (slot: ServicesColorSlot) => resolveHeroPaletteColor(palette, bindings[slot]);
  const cardSurface = resolve('cardBackground');
  const onCard = inkOnCard(cardSurface, resolve('skillTitle'), resolve('skillBody'));

  for (const slot of SERVICES_COLOR_SLOT_IDS) {
    const hex = resolve(slot);
    const elementTarget = SERVICES_ELEMENT_STYLE_SLOT[slot];
    if (elementTarget) {
      const cardText =
        elementTarget === 'skillTitle' ||
        elementTarget === 'cardTitle' ||
        elementTarget === 'price'
          ? onCard.strong
          : elementTarget === 'skillBody' ||
              elementTarget === 'cardBody' ||
              elementTarget === 'delivery'
            ? onCard.muted
            : hex;
      elementStyles = paintServicesElementColor(elementStyles, elementTarget, cardText);
    } else {
      patch[SERVICES_SLOT_TO_FIELD[slot]] = hex;
    }
  }

  if (elementStyles) patch.elementStyles = elementStyles;

  // Keep split / alternate / divider / decor chrome in sync with bound card tokens.
  patch.cardBackgroundColorA = resolve('cardBackground');
  patch.cardBackgroundColorB = resolve('cardAccent');
  patch.cardDividerColor = resolve('cardBorder');
  patch.cardDecorColor = resolve('cardAccent');

  // Keep distinct-section headers in sync with section title / subtitle slots.
  if (services.skillsHeader) {
    patch.skillsHeader = {
      ...services.skillsHeader,
      titleColor: resolve('title'),
      subtitleColor: resolve('subtitle'),
    };
  }
  if (services.servicesHeader) {
    patch.servicesHeader = {
      ...services.servicesHeader,
      titleColor: resolve('title'),
      subtitleColor: resolve('subtitle'),
    };
  }

  return patch as ServicesPalettePatch;
}

export function patchServicesPalette(
  services: ServicesPaletteHost,
  palettePatch: Partial<PortfolioServicesPalette>
): ServicesPalettePatch {
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, {
    ...services.servicesPalette,
    ...palettePatch,
  });
  return applyServicesPaletteToSettings({ ...services, servicesPalette: palette });
}

export function patchServicesSlotColor(
  services: ServicesPaletteHost,
  slot: ServicesColorSlot,
  hex: string
): ServicesPalettePatch {
  const bindings = mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, services.servicesColorBindings);
  return patchServicesPalette(services, { [bindings[slot]]: hex });
}

export function patchServicesColorBinding(
  services: ServicesPaletteHost,
  slot: ServicesColorSlot,
  token: HeroPaletteTokenId
): ServicesPalettePatch {
  const bindings = mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, {
    ...services.servicesColorBindings,
    [slot]: token,
  });
  return applyServicesPaletteToSettings({ ...services, servicesColorBindings: bindings });
}

export function patchServicesColorFieldManual(
  services: ServicesPaletteHost,
  slot: ServicesColorSlot,
  hex: string
): ServicesPalettePatch {
  const elementTarget = SERVICES_ELEMENT_STYLE_SLOT[slot];
  if (elementTarget) {
    const elementStyles = paintServicesElementColor(services.elementStyles, elementTarget, hex);
    return elementStyles ? { elementStyles } : {};
  }
  return { [SERVICES_SLOT_TO_FIELD[slot]]: hex } as ServicesPalettePatch;
}

export function patchServicesColorField(
  services: ServicesPaletteHost & { useHeroPalette?: boolean },
  slot: ServicesColorSlot,
  hex: string
): ServicesPalettePatch {
  if (services.useHeroPalette === false) {
    return patchServicesColorFieldManual(services, slot, hex);
  }
  return patchServicesSlotColor(services, slot, hex);
}

export const SERVICES_STYLE_TARGET_COLOR_SLOT: Record<ServicesElementStyleTarget, ServicesColorSlot> = {
  blockSubheading: 'blockSubheading',
  cardTitle: 'cardTitle',
  cardBody: 'cardBody',
  price: 'price',
  delivery: 'delivery',
  skillTitle: 'skillTitle',
  skillBody: 'skillBody',
};
