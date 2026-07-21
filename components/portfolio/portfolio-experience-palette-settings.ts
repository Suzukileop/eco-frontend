/**
 * Experience palette — same 8 semantic tokens as Hero / Work / Services.
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

/** Local mirrors — avoid importing portfolio-experience-settings (circular TDZ). */
export type ExperienceElementStyleTarget =
  | 'title'
  | 'organization'
  | 'meta'
  | 'description'
  | 'blockLabel'
  | 'tasks'
  | 'proof'
  | 'note'
  | 'skills'
  | 'tools';

type ExperienceTextStyle = {
  color: string;
  font: 'sans' | 'serif' | 'display';
  size: 'sm' | 'md' | 'lg' | 'xl';
  italic: boolean;
  bold: boolean;
  uppercase: boolean;
};

type ExperienceElementStyles = Record<ExperienceElementStyleTarget, ExperienceTextStyle>;

type ExperienceLayerFrame = {
  enabled?: boolean;
  cardBorderColor?: string;
  cardBackgroundColor?: string;
  cardBackgroundColorA?: string;
  cardBackgroundColorB?: string;
  cardDividerColor?: string;
  cardBackgroundEnabled?: boolean;
};

export type PortfolioExperiencePalette = PortfolioHeroPalette;

export type ExperienceColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'title'
  | 'subtitle'
  | 'accent'
  | 'years'
  | 'yearsHighlight'
  | 'entryBorder'
  | 'entryBackground'
  | 'entryBackgroundA'
  | 'entryBackgroundB'
  | 'entryDivider'
  | 'storyBorder'
  | 'storyBackground'
  | 'storyBackgroundA'
  | 'storyBackgroundB'
  | 'storyDivider'
  | 'detailsBorder'
  | 'detailsBackground'
  | 'detailsBackgroundA'
  | 'detailsBackgroundB'
  | 'detailsDivider'
  | 'entryTitle'
  | 'entryOrganization'
  | 'entryMeta'
  | 'entryDescription'
  | 'entryBlockLabel'
  | 'entryTasks'
  | 'entryProof'
  | 'entryNote'
  | 'entrySkills'
  | 'entryTools';

export type PortfolioExperienceColorBindings = Record<ExperienceColorSlot, HeroPaletteTokenId>;

type ExperiencePresentationColorFields = {
  sectionBackgroundColor?: string;
  sectionBackgroundGradientFrom?: string;
  sectionBackgroundGradientTo?: string;
  sectionBackgroundColorA?: string;
  sectionBackgroundColorB?: string;
  sectionBackgroundDividerColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  yearsColor?: string;
  yearsHighlightColor?: string;
  useHeroPalette?: boolean;
  experiencePalette?: PortfolioExperiencePalette;
  experienceColorBindings?: PortfolioExperienceColorBindings;
  elementStyles?: ExperienceElementStyles;
  entryFrame?: ExperienceLayerFrame;
  storyFrame?: ExperienceLayerFrame;
  detailsFrame?: ExperienceLayerFrame;
};

export const EXPERIENCE_COLOR_SLOT_IDS: ExperienceColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'title',
  'subtitle',
  'accent',
  'years',
  'yearsHighlight',
  'entryBorder',
  'entryBackground',
  'entryBackgroundA',
  'entryBackgroundB',
  'entryDivider',
  'storyBorder',
  'storyBackground',
  'storyBackgroundA',
  'storyBackgroundB',
  'storyDivider',
  'detailsBorder',
  'detailsBackground',
  'detailsBackgroundA',
  'detailsBackgroundB',
  'detailsDivider',
  'entryTitle',
  'entryOrganization',
  'entryMeta',
  'entryDescription',
  'entryBlockLabel',
  'entryTasks',
  'entryProof',
  'entryNote',
  'entrySkills',
  'entryTools',
];

export const PORTFOLIO_EXPERIENCE_COLOR_SLOT_OPTIONS: {
  value: ExperienceColorSlot;
  label: string;
  description: string;
}[] = [
  { value: 'sectionBackground', label: 'Section background', description: 'Solid section fill.' },
  { value: 'sectionGradientFrom', label: 'Gradient start', description: 'Start of the section gradient.' },
  { value: 'sectionGradientTo', label: 'Gradient end', description: 'End of the section gradient.' },
  { value: 'sectionSplitA', label: 'Split zone A', description: 'First split background zone.' },
  { value: 'sectionSplitB', label: 'Split zone B', description: 'Second split background zone.' },
  { value: 'sectionDivider', label: 'Split divider', description: 'Line between split zones.' },
  { value: 'title', label: 'Section title', description: 'Experience heading.' },
  { value: 'subtitle', label: 'Section subtitle', description: 'Intro under the title.' },
  { value: 'accent', label: 'Accent', description: 'Organization and timeline accents.' },
  { value: 'years', label: 'Years phrase', description: 'Years summary body text.' },
  { value: 'yearsHighlight', label: 'Years highlight', description: 'Emphasized years count.' },
  { value: 'entryBorder', label: 'Entry border', description: 'Outer entry shell outline.' },
  { value: 'entryBackground', label: 'Entry background', description: 'Outer entry shell fill.' },
  { value: 'entryBackgroundA', label: 'Entry split A', description: 'First split on entry shell.' },
  { value: 'entryBackgroundB', label: 'Entry split B', description: 'Second split on entry shell.' },
  { value: 'entryDivider', label: 'Entry divider', description: 'Divider on entry shell.' },
  { value: 'storyBorder', label: 'Story border', description: 'Story card outline.' },
  { value: 'storyBackground', label: 'Story background', description: 'Story card fill.' },
  { value: 'storyBackgroundA', label: 'Story split A', description: 'First split on story card.' },
  { value: 'storyBackgroundB', label: 'Story split B', description: 'Second split on story card.' },
  { value: 'storyDivider', label: 'Story divider', description: 'Divider on story card.' },
  { value: 'detailsBorder', label: 'Details border', description: 'Details card outline.' },
  { value: 'detailsBackground', label: 'Details background', description: 'Details card fill.' },
  { value: 'detailsBackgroundA', label: 'Details split A', description: 'First split on details card.' },
  { value: 'detailsBackgroundB', label: 'Details split B', description: 'Second split on details card.' },
  { value: 'detailsDivider', label: 'Details divider', description: 'Divider on details card.' },
  { value: 'entryTitle', label: 'Job title', description: 'Role title on each entry.' },
  { value: 'entryOrganization', label: 'Organization', description: 'Company / client name.' },
  { value: 'entryMeta', label: 'Meta chips', description: 'Status, employment, location.' },
  { value: 'entryDescription', label: 'Description', description: 'Role summary paragraph.' },
  { value: 'entryBlockLabel', label: 'Block labels', description: 'TASKS / PROOF headings.' },
  { value: 'entryTasks', label: 'Tasks', description: 'Bullet list items.' },
  { value: 'entryProof', label: 'Proof links', description: 'Proof pill labels.' },
  { value: 'entryNote', label: 'Note', description: 'Remarks / italic note.' },
  { value: 'entrySkills', label: 'Skills tags', description: 'Skill tag text.' },
  { value: 'entryTools', label: 'Tools text', description: 'Tool chip labels.' },
];

export const DARK_EXPERIENCE_PALETTE: PortfolioExperiencePalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_EXPERIENCE_PALETTE: PortfolioExperiencePalette = { ...DARK_EXPERIENCE_PALETTE };

export function computeLightExperiencePalette(
  dark: Partial<PortfolioExperiencePalette>
): PortfolioExperiencePalette {
  return computeLightPalette(mergeHeroPalette(DARK_EXPERIENCE_PALETTE, dark));
}

export const DEFAULT_EXPERIENCE_COLOR_BINDINGS: PortfolioExperienceColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  title: 'texteFort',
  subtitle: 'texteMuted',
  accent: 'principal',
  years: 'texteFort',
  yearsHighlight: 'principal',
  entryBorder: 'bordure',
  entryBackground: 'neutre',
  entryBackgroundA: 'neutre',
  entryBackgroundB: 'fond',
  entryDivider: 'bordure',
  storyBorder: 'bordure',
  storyBackground: 'neutre',
  storyBackgroundA: 'neutre',
  storyBackgroundB: 'fond',
  storyDivider: 'bordure',
  detailsBorder: 'bordure',
  detailsBackground: 'neutre',
  detailsBackgroundA: 'neutre',
  detailsBackgroundB: 'fond',
  detailsDivider: 'bordure',
  entryTitle: 'texteFort',
  entryOrganization: 'principal',
  entryMeta: 'texteMuted',
  entryDescription: 'texteMuted',
  entryBlockLabel: 'texteFaint',
  entryTasks: 'texteMuted',
  entryProof: 'texteMuted',
  entryNote: 'texteMuted',
  entrySkills: 'texteMuted',
  entryTools: 'texteMuted',
};

const EXPERIENCE_ELEMENT_STYLE_SLOT: Record<
  ExperienceElementStyleTarget,
  ExperienceColorSlot
> = {
  title: 'entryTitle',
  organization: 'entryOrganization',
  meta: 'entryMeta',
  description: 'entryDescription',
  blockLabel: 'entryBlockLabel',
  tasks: 'entryTasks',
  proof: 'entryProof',
  note: 'entryNote',
  skills: 'entrySkills',
  tools: 'entryTools',
};

type ExperiencePaletteHost = {
  experiencePalette?: Partial<PortfolioExperiencePalette>;
  experienceColorBindings?: Partial<PortfolioExperienceColorBindings>;
  elementStyles?: ExperienceElementStyles;
  entryFrame?: ExperienceLayerFrame;
  storyFrame?: ExperienceLayerFrame;
  detailsFrame?: ExperienceLayerFrame;
};

type ExperiencePalettePatch = ExperiencePresentationColorFields;

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

function paintExperienceElementColor(
  styles: ExperienceElementStyles | undefined,
  target: ExperienceElementStyleTarget,
  color: string
): ExperienceElementStyles | undefined {
  if (!styles?.[target]) return styles;
  return {
    ...styles,
    [target]: { ...styles[target], color },
  };
}

function paintFrameChrome(
  frame: ExperienceLayerFrame | undefined,
  border: string,
  background: string,
  backgroundA: string,
  backgroundB: string,
  divider: string
): ExperienceLayerFrame | undefined {
  if (!frame) return frame;
  return {
    ...frame,
    cardBorderColor: border,
    cardBackgroundColor: background,
    cardBackgroundColorA: backgroundA,
    cardBackgroundColorB: backgroundB,
    cardDividerColor: divider,
    cardBackgroundEnabled: true,
  };
}

export function mergeExperiencePalette(
  base: PortfolioExperiencePalette,
  patch: unknown
): PortfolioExperiencePalette {
  return mergeHeroPalette(base, patch);
}

export function mergeExperienceColorBindings(
  base: PortfolioExperienceColorBindings,
  patch: unknown
): PortfolioExperienceColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of EXPERIENCE_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

/** Push palette + bindings into every bound concrete experience hex field. */
export function applyExperiencePaletteToSettings(
  experience: ExperiencePaletteHost
): ExperiencePalettePatch {
  const palette = mergeExperiencePalette(DEFAULT_EXPERIENCE_PALETTE, experience.experiencePalette);
  const bindings = mergeExperienceColorBindings(
    DEFAULT_EXPERIENCE_COLOR_BINDINGS,
    experience.experienceColorBindings
  );
  let elementStyles = experience.elementStyles ? { ...experience.elementStyles } : undefined;

  const resolve = (slot: ExperienceColorSlot) => resolveHeroPaletteColor(palette, bindings[slot]);
  const cardSurface = resolve('detailsBackground');
  const onCard = inkOnCard(cardSurface, resolve('entryTitle'), resolve('entryDescription'));

  const patch: ExperiencePalettePatch = {
    experiencePalette: palette,
    experienceColorBindings: bindings,
    sectionBackgroundColor: resolve('sectionBackground'),
    sectionBackgroundGradientFrom: resolve('sectionGradientFrom'),
    sectionBackgroundGradientTo: resolve('sectionGradientTo'),
    sectionBackgroundColorA: resolve('sectionSplitA'),
    sectionBackgroundColorB: resolve('sectionSplitB'),
    sectionBackgroundDividerColor: resolve('sectionDivider'),
    titleColor: resolve('title'),
    subtitleColor: resolve('subtitle'),
    accentColor: resolve('accent'),
    yearsColor: resolve('years'),
    yearsHighlightColor: resolve('yearsHighlight'),
    entryFrame: paintFrameChrome(
      experience.entryFrame,
      resolve('entryBorder'),
      resolve('entryBackground'),
      resolve('entryBackgroundA'),
      resolve('entryBackgroundB'),
      resolve('entryDivider')
    ),
    storyFrame: paintFrameChrome(
      experience.storyFrame,
      resolve('storyBorder'),
      resolve('storyBackground'),
      resolve('storyBackgroundA'),
      resolve('storyBackgroundB'),
      resolve('storyDivider')
    ),
    detailsFrame: paintFrameChrome(
      experience.detailsFrame,
      resolve('detailsBorder'),
      resolve('detailsBackground'),
      resolve('detailsBackgroundA'),
      resolve('detailsBackgroundB'),
      resolve('detailsDivider')
    ),
  };

  for (const [target, slot] of Object.entries(EXPERIENCE_ELEMENT_STYLE_SLOT) as [
    ExperienceElementStyleTarget,
    ExperienceColorSlot,
  ][]) {
    const hex = resolve(slot);
    const cardText =
      target === 'title'
        ? onCard.strong
        : target === 'organization' || target === 'blockLabel'
          ? hex
          : onCard.muted;
    elementStyles = paintExperienceElementColor(elementStyles, target, cardText);
  }

  if (elementStyles) patch.elementStyles = elementStyles;

  return patch;
}

export function patchExperiencePalette(
  experience: ExperiencePaletteHost,
  palettePatch: Partial<PortfolioExperiencePalette>
): ExperiencePalettePatch {
  const palette = mergeExperiencePalette(DEFAULT_EXPERIENCE_PALETTE, {
    ...experience.experiencePalette,
    ...palettePatch,
  });
  return applyExperiencePaletteToSettings({ ...experience, experiencePalette: palette });
}

export function patchExperienceSlotColor(
  experience: ExperiencePaletteHost,
  slot: ExperienceColorSlot,
  hex: string
): ExperiencePalettePatch {
  const bindings = mergeExperienceColorBindings(
    DEFAULT_EXPERIENCE_COLOR_BINDINGS,
    experience.experienceColorBindings
  );
  return patchExperiencePalette(experience, { [bindings[slot]]: hex });
}

export function patchExperienceColorBinding(
  experience: ExperiencePaletteHost,
  slot: ExperienceColorSlot,
  token: HeroPaletteTokenId
): ExperiencePalettePatch {
  const bindings = mergeExperienceColorBindings(DEFAULT_EXPERIENCE_COLOR_BINDINGS, {
    ...experience.experienceColorBindings,
    [slot]: token,
  });
  return applyExperiencePaletteToSettings({ ...experience, experienceColorBindings: bindings });
}

export function patchExperienceColorFieldManual(
  experience: ExperiencePaletteHost,
  slot: ExperienceColorSlot,
  hex: string
): ExperiencePalettePatch {
  const elementTarget = (Object.entries(EXPERIENCE_ELEMENT_STYLE_SLOT) as [ExperienceElementStyleTarget, ExperienceColorSlot][]).find(
    ([, value]) => value === slot
  )?.[0];
  if (elementTarget) {
    const elementStyles = paintExperienceElementColor(experience.elementStyles, elementTarget, hex);
    return elementStyles ? { elementStyles } : {};
  }

  const sectionFields: Partial<Record<ExperienceColorSlot, keyof ExperiencePresentationColorFields>> = {
    title: 'titleColor',
    subtitle: 'subtitleColor',
    accent: 'accentColor',
    years: 'yearsColor',
    yearsHighlight: 'yearsHighlightColor',
  };
  const sectionField = sectionFields[slot];
  if (sectionField) return { [sectionField]: hex };

  const frameMap: Partial<
    Record<
      ExperienceColorSlot,
      { layer: 'entryFrame' | 'storyFrame' | 'detailsFrame'; field: keyof ExperienceLayerFrame }
    >
  > = {
    entryBorder: { layer: 'entryFrame', field: 'cardBorderColor' },
    entryBackground: { layer: 'entryFrame', field: 'cardBackgroundColor' },
    entryBackgroundA: { layer: 'entryFrame', field: 'cardBackgroundColorA' },
    entryBackgroundB: { layer: 'entryFrame', field: 'cardBackgroundColorB' },
    entryDivider: { layer: 'entryFrame', field: 'cardDividerColor' },
    storyBorder: { layer: 'storyFrame', field: 'cardBorderColor' },
    storyBackground: { layer: 'storyFrame', field: 'cardBackgroundColor' },
    storyBackgroundA: { layer: 'storyFrame', field: 'cardBackgroundColorA' },
    storyBackgroundB: { layer: 'storyFrame', field: 'cardBackgroundColorB' },
    storyDivider: { layer: 'storyFrame', field: 'cardDividerColor' },
    detailsBorder: { layer: 'detailsFrame', field: 'cardBorderColor' },
    detailsBackground: { layer: 'detailsFrame', field: 'cardBackgroundColor' },
    detailsBackgroundA: { layer: 'detailsFrame', field: 'cardBackgroundColorA' },
    detailsBackgroundB: { layer: 'detailsFrame', field: 'cardBackgroundColorB' },
    detailsDivider: { layer: 'detailsFrame', field: 'cardDividerColor' },
  };
  const frameTarget = frameMap[slot];
  if (frameTarget) {
    const frame = experience[frameTarget.layer] ?? {};
    return {
      [frameTarget.layer]: { ...frame, [frameTarget.field]: hex },
    };
  }

  return {};
}

export function patchExperienceColorField(
  experience: ExperiencePaletteHost & { useHeroPalette?: boolean },
  slot: ExperienceColorSlot,
  hex: string
): ExperiencePalettePatch {
  if (experience.useHeroPalette === false) {
    return patchExperienceColorFieldManual(experience, slot, hex);
  }
  return patchExperienceSlotColor(experience, slot, hex);
}

export const EXPERIENCE_STYLE_TARGET_COLOR_SLOT: Record<
  ExperienceElementStyleTarget,
  ExperienceColorSlot
> = EXPERIENCE_ELEMENT_STYLE_SLOT;

export const EXPERIENCE_ENTRY_STYLE_TARGETS: ExperienceElementStyleTarget[] = [
  'title',
  'organization',
  'meta',
  'description',
];

export const EXPERIENCE_BLOCK_STYLE_TARGETS: ExperienceElementStyleTarget[] = [
  'blockLabel',
  'tasks',
  'proof',
  'note',
  'skills',
  'tools',
];
