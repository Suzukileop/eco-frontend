import {
  normalizeHeroElementStyles,
  syncHeroLegacyTypographyFromElementStyles,
  type PortfolioHeroElementStyles,
  type PortfolioHeroStyleTarget,
} from '@/components/portfolio/portfolio-hero-element-styles';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import type { PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';

/** Semantic color roles for the Hero section palette. */
export type HeroPaletteTokenId =
  | 'principal'
  | 'secondaire'
  | 'texteFort'
  | 'texteMuted'
  | 'texteFaint'
  | 'neutre'
  | 'fond'
  | 'bordure';

export type PortfolioHeroPalette = Record<HeroPaletteTokenId, string>;

/** Slots that can bind to a palette token (resolved into concrete hex fields). */
export type HeroColorSlot =
  | 'headline'
  | 'headlinePrefix'
  | 'headlineAccent'
  | 'description'
  | 'availabilityText'
  | 'availabilityBackground'
  | 'availabilityBorder'
  | 'availabilityDot'
  | 'ctaText'
  | 'ctaBackground'
  | 'ctaBorder'
  | 'toolsLabel'
  | 'toolsIconBackground'
  | 'toolsIconBorder'
  | 'creatorName'
  | 'metaValue'
  | 'metaLabel'
  | 'metaCardBackground'
  | 'metaFrameBorder'
  | 'metaAccentYears'
  | 'metaAccentProjects'
  | 'metaAccentLocation'
  | 'sectionBackground'
  | 'motif'
  | 'portraitFrame'
  | 'portraitMat'
  | 'portraitCaptionBar';

export type PortfolioHeroColorBindings = Record<HeroColorSlot, HeroPaletteTokenId>;

export const HERO_PALETTE_TOKEN_IDS: HeroPaletteTokenId[] = [
  'principal',
  'secondaire',
  'texteFort',
  'texteMuted',
  'texteFaint',
  'neutre',
  'fond',
  'bordure',
];

export const HERO_COLOR_SLOT_IDS: HeroColorSlot[] = [
  'headline',
  'headlinePrefix',
  'headlineAccent',
  'description',
  'availabilityText',
  'availabilityBackground',
  'availabilityBorder',
  'availabilityDot',
  'ctaText',
  'ctaBackground',
  'ctaBorder',
  'toolsLabel',
  'toolsIconBackground',
  'toolsIconBorder',
  'creatorName',
  'metaValue',
  'metaLabel',
  'metaCardBackground',
  'metaFrameBorder',
  'metaAccentYears',
  'metaAccentProjects',
  'metaAccentLocation',
  'sectionBackground',
  'motif',
  'portraitFrame',
  'portraitMat',
  'portraitCaptionBar',
];

export const PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS: {
  value: HeroPaletteTokenId;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: 'Principal', description: 'Primary accent (headline specialty, CTAs).' },
  { value: 'secondaire', label: 'Secondaire', description: 'Secondary accent (stats, badges).' },
  { value: 'texteFort', label: 'Texte fort', description: 'Strong body / titles.' },
  { value: 'texteMuted', label: 'Texte muted', description: 'Secondary copy and captions.' },
  { value: 'texteFaint', label: 'Texte faint', description: 'Quiet labels and hints.' },
  { value: 'neutre', label: 'Neutre', description: 'Neutral surfaces and chips.' },
  { value: 'fond', label: 'Fond', description: 'Section / panel background.' },
  { value: 'bordure', label: 'Bordure', description: 'Borders and hairlines.' },
];

/**
 * Defaults follow the validated dark design (site on black background):
 * exact brand orange / teal accents, light text tokens, dark surfaces.
 */
export const DEFAULT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#ff5a1f',
  secondaire: '#00e5a0',
  texteFort: '#f4f3ef',
  texteMuted: '#9a9aa2',
  texteFaint: '#5c5c63',
  neutre: '#17171b',
  fond: '#0b0b0d',
  bordure: '#2a2a30',
};

/**
 * Validated light-mode palette: same hue family as the dark hero, but accents
 * darkened to stay readable on white — not a plain lightness inversion.
 */
export const LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  /** Same orange, darkened for contrast on a light background. */
  principal: '#c2410c',
  /** Same teal, darkened — the original bright teal is unreadable on white. */
  secondaire: '#00875f',
  /** Near-black (not pure #000) — headings and strong text. */
  texteFort: '#15151a',
  /** Body copy and captions. */
  texteMuted: '#65656d',
  /** Subtle labels and hints. */
  texteFaint: '#9c9ca4',
  /** Neutral surfaces and chips — slightly grayer than the page fill. */
  neutre: '#f1f0ed',
  /** Off-white page fill, not pure white. */
  fond: '#fafaf8',
  /** Borders and separators. */
  bordure: '#e2e1dd',
};

export const DEFAULT_HERO_COLOR_BINDINGS: PortfolioHeroColorBindings = {
  headline: 'texteFort',
  headlinePrefix: 'texteMuted',
  headlineAccent: 'principal',
  description: 'texteMuted',
  /** Follows the blinking availability dot (Secondaire). */
  availabilityText: 'secondaire',
  availabilityBackground: 'neutre',
  availabilityBorder: 'bordure',
  availabilityDot: 'secondaire',
  ctaText: 'neutre',
  /** Follows the headline specialty accent (Principal). */
  ctaBackground: 'principal',
  ctaBorder: 'bordure',
  toolsLabel: 'texteFaint',
  toolsIconBackground: 'neutre',
  toolsIconBorder: 'bordure',
  creatorName: 'texteFort',
  metaValue: 'texteFort',
  metaLabel: 'texteMuted',
  metaCardBackground: 'neutre',
  metaFrameBorder: 'bordure',
  metaAccentYears: 'principal',
  metaAccentProjects: 'secondaire',
  metaAccentLocation: 'principal',
  sectionBackground: 'fond',
  /** Motif, portrait frame/mat/caption, and stats borders each have their own
   * binding (all default to Bordure — change a slot’s token to detach it). */
  motif: 'bordure',
  portraitFrame: 'bordure',
  portraitMat: 'bordure',
  portraitCaptionBar: 'bordure',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

type Hsl = { h: number; s: number; l: number };

function hexToHsl(hex: string): Hsl {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h, s, l };
}

function hslToHex({ h, s, l }: Hsl): string {
  const hueToRgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  const toHex = (channel: number) =>
    Math.round(Math.min(1, Math.max(0, channel)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const PALETTE_ACCENT_TOKENS: HeroPaletteTokenId[] = ['principal', 'secondaire'];

/**
 * Auto-derive the light-mode palette from a dark palette:
 * - accents keep their hue / saturation, lightness clamped so they stay
 *   readable on a white background;
 * - text, surface, and border tokens invert their lightness (light text on
 *   dark becomes dark text on light, dark surfaces become light surfaces).
 */
export function computeLightPalette(dark: Partial<PortfolioHeroPalette>): PortfolioHeroPalette {
  const source = mergeHeroPalette(DEFAULT_HERO_PALETTE, dark);
  const next = { ...source };
  for (const token of HERO_PALETTE_TOKEN_IDS) {
    const hsl = hexToHsl(source[token]);
    if (PALETTE_ACCENT_TOKENS.includes(token)) {
      next[token] = hslToHex({ ...hsl, l: Math.min(hsl.l, 0.46) });
    } else {
      next[token] = hslToHex({ ...hsl, l: 1 - hsl.l });
    }
  }
  return next;
}

export function mergeHeroPalette(base: PortfolioHeroPalette, patch: unknown): PortfolioHeroPalette {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const id of HERO_PALETTE_TOKEN_IDS) {
    next[id] = sanitizeHex(record[id], base[id]);
  }
  return next;
}

export function mergeHeroColorBindings(
  base: PortfolioHeroColorBindings,
  patch: unknown
): PortfolioHeroColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of HERO_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

export function resolveHeroPaletteColor(
  palette: PortfolioHeroPalette,
  token: HeroPaletteTokenId
): string {
  return sanitizeHex(palette[token], DEFAULT_HERO_PALETTE[token]);
}

const ELEMENT_STYLE_SLOTS: Partial<Record<HeroColorSlot, PortfolioHeroStyleTarget>> = {
  headline: 'headline',
  headlinePrefix: 'headlinePrefix',
  headlineAccent: 'headlineAccent',
  description: 'description',
  availabilityText: 'availabilityText',
  ctaText: 'cta',
  toolsLabel: 'toolsLabel',
  creatorName: 'creatorName',
  metaValue: 'metaValue',
  metaLabel: 'metaLabel',
};

/** Reverse of ELEMENT_STYLE_SLOTS — typography color pickers → palette slot. */
const STYLE_TARGET_COLOR_SLOTS: Partial<Record<PortfolioHeroStyleTarget, HeroColorSlot>> = {
  headline: 'headline',
  headlinePrefix: 'headlinePrefix',
  headlineAccent: 'headlineAccent',
  description: 'description',
  availabilityText: 'availabilityText',
  cta: 'ctaText',
  toolsLabel: 'toolsLabel',
  creatorName: 'creatorName',
  metaValue: 'metaValue',
  metaLabel: 'metaLabel',
};

export function heroStyleTargetColorSlot(
  target: PortfolioHeroStyleTarget
): HeroColorSlot | null {
  return STYLE_TARGET_COLOR_SLOTS[target] ?? null;
}

/**
 * Push palette + bindings into concrete hero hex fields / elementStyles.
 * Render paths keep reading hex — no runtime token lookup required.
 */
export function applyHeroPaletteToPresentation(
  presentation: PortfolioHeroPresentationSettings
): Partial<PortfolioHeroPresentationSettings> {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, presentation.palette);
  const bindings = mergeHeroColorBindings(DEFAULT_HERO_COLOR_BINDINGS, presentation.colorBindings);
  const color = (slot: HeroColorSlot) => resolveHeroPaletteColor(palette, bindings[slot]);

  const styles = normalizeHeroElementStyles(presentation.elementStyles, presentation);
  const nextStyles = { ...styles } as PortfolioHeroElementStyles;
  for (const [slot, target] of Object.entries(ELEMENT_STYLE_SLOTS) as [
    HeroColorSlot,
    PortfolioHeroStyleTarget,
  ][]) {
    nextStyles[target] = { ...nextStyles[target], color: color(slot) };
  }

  // The rendered motifs live in heroMotifs[] (each instance stores its own hex):
  // repaint every layer (right shape + left pattern) from the shared motif token,
  // otherwise palette / light-dark switches leave them on their stale colors.
  const motifHex = color('motif');
  const heroMotifs =
    presentation.heroMotifs && presentation.heroMotifs.length > 0
      ? presentation.heroMotifs.map((motif) => ({ ...motif, color: motifHex }))
      : undefined;

  return {
    palette,
    colorBindings: bindings,
    elementStyles: nextStyles,
    ...(heroMotifs ? { heroMotifs } : {}),
    leftMotifColor: motifHex,
    ...syncHeroLegacyTypographyFromElementStyles(nextStyles),
    availabilityTextColor: color('availabilityText'),
    availabilityBackgroundColor: color('availabilityBackground'),
    availabilityBorderColor: color('availabilityBorder'),
    availabilityDotColor: color('availabilityDot'),
    ctaBackgroundColor: color('ctaBackground'),
    ctaBorderColor: color('ctaBorder'),
    toolsIconBackgroundColor: color('toolsIconBackground'),
    toolsIconBorderColor: color('toolsIconBorder'),
    metaCardBackgroundColor: color('metaCardBackground'),
    metaFrameBorderColor: color('metaFrameBorder'),
    metaYearsAccentColor: color('metaAccentYears'),
    metaProjectsAccentColor: color('metaAccentProjects'),
    metaLocationAccentColor: color('metaAccentLocation'),
    metaAccentColor: color('metaAccentYears'),
    heroSectionBackgroundColor: color('sectionBackground'),
    motifColor: color('motif'),
    portraitFrameColor: color('portraitFrame'),
    portraitFrameBackgroundColor: color('portraitMat'),
    portraitCaptionBarColor: color('portraitCaptionBar'),
  };
}

/** Patch palette tokens, then sync bound hex fields. */
export function patchHeroPalette(
  presentation: PortfolioHeroPresentationSettings,
  palettePatch: Partial<PortfolioHeroPalette>
): Partial<PortfolioHeroPresentationSettings> {
  const palette = mergeHeroPalette(presentation.palette ?? DEFAULT_HERO_PALETTE, {
    ...presentation.palette,
    ...palettePatch,
  });
  return applyHeroPaletteToPresentation({
    ...presentation,
    palette,
  });
}

/** Change which token a slot uses, then sync that slot’s hex. */
export function patchHeroColorBinding(
  presentation: PortfolioHeroPresentationSettings,
  slot: HeroColorSlot,
  token: HeroPaletteTokenId
): Partial<PortfolioHeroPresentationSettings> {
  const colorBindings = mergeHeroColorBindings(
    presentation.colorBindings ?? DEFAULT_HERO_COLOR_BINDINGS,
    {
      ...(presentation.colorBindings ?? DEFAULT_HERO_COLOR_BINDINGS),
      [slot]: token,
    }
  );
  return applyHeroPaletteToPresentation({
    ...presentation,
    colorBindings,
  });
}

/**
 * Change the palette token a single slot is bound to, then sync hex fields.
 * Prefer this over locking several slots onto one token.
 */
export function patchHeroSlotColor(
  presentation: PortfolioHeroPresentationSettings,
  slot: HeroColorSlot,
  hex: string
): Partial<PortfolioHeroPresentationSettings> {
  const bindings = mergeHeroColorBindings(
    DEFAULT_HERO_COLOR_BINDINGS,
    presentation.colorBindings
  );
  return patchHeroPalette(presentation, { [bindings[slot]]: hex });
}
