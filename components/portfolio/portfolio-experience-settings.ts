import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
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

export type PortfolioExperienceDesign =
  | 'timeline'
  | 'timeline-accent'
  | 'timeline-editorial'
  | 'timeline-stepped'
  | 'stacked'
  | 'compact'
  | 'large';

export type PortfolioExperienceTitlePreset =
  | 'experience'
  | 'career-path'
  | 'work-history'
  | 'professional-journey'
  | 'custom';

export type PortfolioExperienceSubtitlePreset = 'default' | 'short' | 'career' | 'minimal' | 'custom';

export type PortfolioExperienceHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioExperienceHeaderAlignment = 'left' | 'center' | 'right';

export type PortfolioExperienceYearsPreset =
  | 'default'
  | 'hands-on'
  | 'industry'
  | 'professional'
  | 'creative'
  | 'custom';

export type PortfolioExperienceYearsSize = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioExperienceContentAlign = 'left' | 'center' | 'right';

export type PortfolioExperienceListMaxWidth = 'narrow' | 'default' | 'wide' | 'full';

export type PortfolioExperienceListPlacement = 'left' | 'center' | 'right';

/** How many experience cards per row (card-style designs only). */
export type PortfolioExperienceItemsPerRow = 1 | 2 | 3;

export type PortfolioExperienceItemGap = 'sm' | 'md' | 'lg';

export type PortfolioExperienceItemDensity = 'comfortable' | 'compact';

/** Where the details column (tasks / tools / proof / …) sits relative to the story. */
export type PortfolioExperienceAsidePlacement = 'right' | 'left' | 'stacked' | 'inline';

/** Which column / layer the tools block belongs to. */
export type PortfolioExperienceToolsZone = 'story' | 'details' | 'entry';

/** When tools sit outside the cards, which side of the entry background. */
export type PortfolioExperienceToolsEntrySide = 'left' | 'right';

/** How tool chips are rendered. */
export type PortfolioExperienceToolsDisplay = 'icons-and-labels' | 'icons';

export type PortfolioExperienceToolsIconSize = 'sm' | 'md' | 'lg' | 'xl';

/** Visual style for skill tags inside an experience entry. */
export type PortfolioExperienceSkillsTagStyle = 'soft' | 'pill' | 'outline' | 'plain';

/** Font size scale for entry content elements. */
export type PortfolioExperienceTextSize = 'sm' | 'md' | 'lg' | 'xl';

/** Color / font / size / weight controls for one entry text element. */
export type PortfolioExperienceTextStyle = {
  color: string;
  font: PortfolioExperienceHeaderFont;
  size: PortfolioExperienceTextSize;
  italic: boolean;
  bold: boolean;
  uppercase: boolean;
};

/** Which entry text role can be styled independently. */
export type PortfolioExperienceStyleTarget =
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

export type PortfolioExperienceElementStyles = Record<
  PortfolioExperienceStyleTarget,
  PortfolioExperienceTextStyle
>;

/** Which of the two inner cards an element belongs to. */
export type PortfolioExperienceCardZone = 'story' | 'details';

/** Ordered content blocks inside an experience entry (all designs). */
export type PortfolioExperienceElementId =
  | 'title'
  | 'organization'
  | 'meta'
  | 'description'
  | 'tasks'
  | 'tools'
  | 'proof'
  | 'note'
  | 'skills';

/** Per-element assignment to the story card or details card. */
export type PortfolioExperienceElementZones = Record<
  PortfolioExperienceElementId,
  PortfolioExperienceCardZone
>;

/** Independent chrome for entry background, story column, or details column. */
export type PortfolioExperienceLayerFrame = PortfolioServicesCardBackgroundSettings & {
  /** When true, draw border / fill / radius / padding for this layer. */
  enabled: boolean;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
};

export type PortfolioExperiencePresentationSettings = PortfolioSectionBackgroundSettings & {
  titlePreset: PortfolioExperienceTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioExperienceSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioExperienceHeaderFont;
  subtitleFont: PortfolioExperienceHeaderFont;
  titleColor: string;
  subtitleColor: string;
  titleUppercase: boolean;
  subtitleUppercase: boolean;
  headerAlignment: PortfolioExperienceHeaderAlignment;
  experienceDesign: PortfolioExperienceDesign;
  listMaxWidth: PortfolioExperienceListMaxWidth;
  listPlacement: PortfolioExperienceListPlacement;
  itemsPerRow: PortfolioExperienceItemsPerRow;
  itemGap: PortfolioExperienceItemGap;
  itemDensity: PortfolioExperienceItemDensity;
  accentColor: string;
  yearsPreset: PortfolioExperienceYearsPreset;
  yearsCustom: string;
  yearsFont: PortfolioExperienceHeaderFont;
  yearsSize: PortfolioExperienceYearsSize;
  yearsColor: string;
  yearsHighlightColor: string;
  yearsBoldYears: boolean;
  yearsItalic: boolean;
  yearsAlignment: PortfolioExperienceContentAlign;
  showYears: boolean;
  /** Entry content visibility */
  showPeriod: boolean;
  showTitle: boolean;
  showOrganization: boolean;
  showDescription: boolean;
  showMeta: boolean;
  showTasks: boolean;
  showTools: boolean;
  showProof: boolean;
  showNote: boolean;
  showSkills: boolean;
  asidePlacement: PortfolioExperienceAsidePlacement;
  /** Display order of content elements (applies to every design). */
  elementOrder: PortfolioExperienceElementId[];
  /** Which inner card each element sits in (story ↔ details). */
  elementZones: PortfolioExperienceElementZones;
  /** Custom block headings (empty = default English labels). */
  tasksLabel: string;
  proofLabel: string;
  noteLabel: string;
  skillsLabel: string;
  toolsLabel: string;
  showBlockLabels: boolean;
  skillsTagStyle: PortfolioExperienceSkillsTagStyle;
  /** Which column / layer renders the tools block. */
  toolsZone: PortfolioExperienceToolsZone;
  /** When toolsZone is entry: bottom-left or bottom-right of the entry background. */
  toolsEntrySide: PortfolioExperienceToolsEntrySide;
  /** Icons only, or icons with labels. */
  toolsDisplay: PortfolioExperienceToolsDisplay;
  toolsIconSize: PortfolioExperienceToolsIconSize;
  /** Per-element color, font, size, and weight for entry content. */
  elementStyles: PortfolioExperienceElementStyles;
  /** Outer entry background (the gray shell around both columns). */
  entryFrame: PortfolioExperienceLayerFrame;
  /** Inner frame around title / org / meta / description. */
  storyFrame: PortfolioExperienceLayerFrame;
  /** Inner frame around tasks / tools / proof / note / skills. */
  detailsFrame: PortfolioExperienceLayerFrame;
};

export type PortfolioExperienceSectionSettings = PortfolioSectionCopy & PortfolioExperiencePresentationSettings;

export const DEFAULT_EXPERIENCE_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_EXPERIENCE_SUBTITLE_COLOR = '#737373';
export const DEFAULT_EXPERIENCE_ACCENT_COLOR = '#ea580c';
export const DEFAULT_EXPERIENCE_YEARS_COLOR = '#0a0a0a';
export const DEFAULT_EXPERIENCE_YEARS_HIGHLIGHT_COLOR = '#0a0a0a';
export const DEFAULT_EXPERIENCE_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_EXPERIENCE_ENTRY_BACKGROUND_COLOR = '#f5f5f5';
export const DEFAULT_EXPERIENCE_BODY_COLOR = '#525252';
export const DEFAULT_EXPERIENCE_MUTED_COLOR = '#a3a3a3';
export const DEFAULT_EXPERIENCE_NOTE_COLOR = '#737373';

function createExperienceTextStyle(
  overrides: Partial<PortfolioExperienceTextStyle> = {}
): PortfolioExperienceTextStyle {
  return {
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    font: 'sans',
    size: 'md',
    italic: false,
    bold: false,
    uppercase: false,
    ...overrides,
  };
}

export const DEFAULT_EXPERIENCE_ELEMENT_STYLES: PortfolioExperienceElementStyles = {
  title: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_TITLE_COLOR,
    font: 'serif',
    size: 'xl',
    bold: true,
  }),
  organization: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_ACCENT_COLOR,
    size: 'md',
    bold: true,
  }),
  meta: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  description: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    size: 'md',
  }),
  blockLabel: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_MUTED_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  tasks: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    size: 'md',
  }),
  proof: createExperienceTextStyle({
    color: '#404040',
    size: 'sm',
    bold: true,
  }),
  note: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_NOTE_COLOR,
    font: 'serif',
    size: 'md',
    italic: true,
  }),
  skills: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    size: 'sm',
    bold: true,
  }),
  tools: createExperienceTextStyle({
    color: '#404040',
    size: 'sm',
    bold: true,
  }),
};

export const EXPERIENCE_STYLE_TARGET_IDS: PortfolioExperienceStyleTarget[] = [
  'title',
  'organization',
  'meta',
  'description',
  'blockLabel',
  'tasks',
  'proof',
  'note',
  'skills',
  'tools',
];

export const EXPERIENCE_ELEMENT_IDS: PortfolioExperienceElementId[] = [
  'title',
  'organization',
  'meta',
  'description',
  'tasks',
  'tools',
  'proof',
  'note',
  'skills',
];

export const EXPERIENCE_STORY_ELEMENT_IDS: PortfolioExperienceElementId[] = [
  'title',
  'organization',
  'meta',
  'description',
];

export const EXPERIENCE_DETAILS_ELEMENT_IDS: PortfolioExperienceElementId[] = [
  'tasks',
  'tools',
  'proof',
  'note',
  'skills',
];

export const DEFAULT_EXPERIENCE_ELEMENT_ORDER: PortfolioExperienceElementId[] = [...EXPERIENCE_ELEMENT_IDS];

export const DEFAULT_EXPERIENCE_ELEMENT_ZONES: PortfolioExperienceElementZones = {
  title: 'story',
  organization: 'story',
  meta: 'story',
  description: 'story',
  tasks: 'details',
  tools: 'details',
  proof: 'details',
  note: 'details',
  skills: 'details',
};

export const PORTFOLIO_EXPERIENCE_ELEMENT_OPTIONS: {
  value: PortfolioExperienceElementId;
  label: string;
  zone: PortfolioExperienceCardZone;
}[] = [
  { value: 'title', label: 'Job title', zone: 'story' },
  { value: 'organization', label: 'Organization', zone: 'story' },
  { value: 'meta', label: 'Meta chips', zone: 'story' },
  { value: 'description', label: 'Description', zone: 'story' },
  { value: 'tasks', label: 'Tasks', zone: 'details' },
  { value: 'tools', label: 'Tools', zone: 'details' },
  { value: 'proof', label: 'Proof links', zone: 'details' },
  { value: 'note', label: 'Note', zone: 'details' },
  { value: 'skills', label: 'Skills tags', zone: 'details' },
];

function createExperienceLayerFrame(
  overrides: Partial<PortfolioExperienceLayerFrame> = {}
): PortfolioExperienceLayerFrame {
  return {
    ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
    enabled: true,
    cardBorder: 'soft',
    cardBorderColor: DEFAULT_EXPERIENCE_CARD_BORDER_COLOR,
    cardBackgroundEnabled: true,
    cardBackgroundColor: DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR,
    cardBorderRadius: 'lg',
    cardPadding: 'lg',
    ...overrides,
  };
}

const EXPERIENCE_DESIGNS = [
  'timeline',
  'timeline-accent',
  'timeline-editorial',
  'timeline-stepped',
  'stacked',
  'compact',
  'large',
] as const;

export const DEFAULT_EXPERIENCE_PRESENTATION: PortfolioExperiencePresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  titlePreset: 'experience',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'sans',
  titleColor: DEFAULT_EXPERIENCE_TITLE_COLOR,
  subtitleColor: DEFAULT_EXPERIENCE_SUBTITLE_COLOR,
  titleUppercase: false,
  subtitleUppercase: false,
  headerAlignment: 'left',
  experienceDesign: 'timeline-editorial',
  listMaxWidth: 'full',
  listPlacement: 'left',
  itemsPerRow: 1,
  itemGap: 'md',
  itemDensity: 'comfortable',
  accentColor: DEFAULT_EXPERIENCE_ACCENT_COLOR,
  yearsPreset: 'default',
  yearsCustom: '{years}+ years of hands-on experience in my field.',
  yearsFont: 'serif',
  yearsSize: 'md',
  yearsColor: DEFAULT_EXPERIENCE_YEARS_COLOR,
  yearsHighlightColor: DEFAULT_EXPERIENCE_YEARS_HIGHLIGHT_COLOR,
  yearsBoldYears: true,
  yearsItalic: false,
  yearsAlignment: 'left',
  showYears: true,
  showPeriod: true,
  showTitle: true,
  showOrganization: true,
  showDescription: true,
  showMeta: true,
  showTasks: true,
  showTools: true,
  showProof: true,
  showNote: true,
  showSkills: true,
  asidePlacement: 'right',
  elementOrder: DEFAULT_EXPERIENCE_ELEMENT_ORDER,
  elementZones: DEFAULT_EXPERIENCE_ELEMENT_ZONES,
  tasksLabel: '',
  proofLabel: '',
  noteLabel: '',
  skillsLabel: '',
  toolsLabel: '',
  showBlockLabels: true,
  skillsTagStyle: 'soft',
  toolsZone: 'details',
  toolsEntrySide: 'left',
  toolsDisplay: 'icons-and-labels',
  toolsIconSize: 'md',
  elementStyles: DEFAULT_EXPERIENCE_ELEMENT_STYLES,
  entryFrame: createExperienceLayerFrame({
    enabled: false,
    cardBackgroundColor: DEFAULT_EXPERIENCE_ENTRY_BACKGROUND_COLOR,
    cardPadding: 'lg',
  }),
  storyFrame: createExperienceLayerFrame({
    enabled: false,
    cardPadding: 'md',
  }),
  detailsFrame: createExperienceLayerFrame({
    enabled: true,
    cardBackgroundColor: DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR,
    cardPadding: 'md',
  }),
};

export const PORTFOLIO_EXPERIENCE_TITLE_PRESET_OPTIONS: {
  value: PortfolioExperienceTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'experience', label: 'Experience', description: 'Classic section label.' },
  { value: 'career-path', label: 'Career path', description: 'Journey-focused heading.' },
  { value: 'work-history', label: 'Work history', description: 'Professional track record.' },
  {
    value: 'professional-journey',
    label: 'Professional journey',
    description: 'Long-form career narrative tone.',
  },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_EXPERIENCE_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioExperienceSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One concise supporting line.' },
  { value: 'career', label: 'Career', description: 'Roles and milestones focus.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS: {
  value: PortfolioExperienceHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS: {
  value: PortfolioExperienceDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'timeline-editorial',
    label: 'Magazine',
    description: 'Wide editorial spread — story left, details right.',
  },
  {
    value: 'large',
    label: 'Bento',
    description: 'Full-bleed showcase with oversized type and zones.',
  },
  {
    value: 'timeline-accent',
    label: 'Accent rail',
    description: 'Bold timeline with a dual-column content panel.',
  },
  {
    value: 'timeline',
    label: 'Classic rail',
    description: 'Clean vertical rail using the full section width.',
  },
  {
    value: 'timeline-stepped',
    label: 'Stepped cards',
    description: 'Numbered full-width cards with split content.',
  },
  {
    value: 'stacked',
    label: 'Panel cards',
    description: 'Elevated panels with hover depth and wide grids.',
  },
  {
    value: 'compact',
    label: 'Dense rows',
    description: 'Horizontal meta row + two-column body — high density.',
  },
];

export const PORTFOLIO_EXPERIENCE_LIST_MAX_WIDTH_OPTIONS: {
  value: PortfolioExperienceListMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'narrow', label: 'Narrow', description: 'Focused column — best for 1 item per row.' },
  { value: 'default', label: 'Comfortable', description: 'Wide editorial measure on desktop.' },
  { value: 'wide', label: 'Wide', description: 'Near full-bleed — great for 2–3 columns.' },
  { value: 'full', label: 'Full', description: 'Entire section width on every breakpoint.' },
];

export const PORTFOLIO_EXPERIENCE_LIST_PLACEMENT_OPTIONS: {
  value: PortfolioExperienceListPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Align experience block to the left.' },
  { value: 'center', label: 'Center', description: 'Center experience block.' },
  { value: 'right', label: 'Right', description: 'Align experience block to the right.' },
];

export const PORTFOLIO_EXPERIENCE_ITEMS_PER_ROW_OPTIONS: {
  value: '1' | '2' | '3';
  label: string;
  description: string;
}[] = [
  { value: '1', label: '1 per row', description: 'Single full-width entry — maximum detail.' },
  { value: '2', label: '2 per row', description: 'Two cards side by side from tablet up.' },
  { value: '3', label: '3 per row', description: 'Three cards on large screens — denser gallery.' },
];

export const PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS: {
  value: PortfolioExperienceItemGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Tight', description: 'Minimal space between entries.' },
  { value: 'md', label: 'Standard', description: 'Balanced spacing.' },
  { value: 'lg', label: 'Relaxed', description: 'Generous space between entries.' },
];

export const PORTFOLIO_EXPERIENCE_ITEM_DENSITY_OPTIONS: {
  value: PortfolioExperienceItemDensity;
  label: string;
  description: string;
}[] = [
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: 'Roomy padding and section gaps inside each entry.',
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Tighter spacing for denser reading.',
  },
];

export const PORTFOLIO_EXPERIENCE_ASIDE_PLACEMENT_OPTIONS: {
  value: PortfolioExperienceAsidePlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'right',
    label: 'Details right',
    description: 'Story on the left, tasks / tools / proof on the right.',
  },
  {
    value: 'left',
    label: 'Details left',
    description: 'Details panel first, story on the right.',
  },
  {
    value: 'stacked',
    label: 'Stacked',
    description: 'Everything in one vertical column.',
  },
  {
    value: 'inline',
    label: 'Inline',
    description: 'Fold details into the story column — no side panel.',
  },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_ZONE_OPTIONS: {
  value: PortfolioExperienceToolsZone;
  label: string;
  description: string;
}[] = [
  {
    value: 'details',
    label: 'In details card',
    description: 'Tools stay with tasks, proof, and skills.',
  },
  {
    value: 'story',
    label: 'In story card',
    description: 'Tools sit under the description inside the story frame.',
  },
  {
    value: 'entry',
    label: 'Outside cards',
    description: 'Icons sit on the entry background, below both inner frames.',
  },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_ENTRY_SIDE_OPTIONS: {
  value: PortfolioExperienceToolsEntrySide;
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Bottom left',
    description: 'Just under the left card, on the entry background.',
  },
  {
    value: 'right',
    label: 'Bottom right',
    description: 'Just under the right card, on the entry background.',
  },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_DISPLAY_OPTIONS: {
  value: PortfolioExperienceToolsDisplay;
  label: string;
  description: string;
}[] = [
  {
    value: 'icons-and-labels',
    label: 'Icons + labels',
    description: 'Show tool logo and name.',
  },
  {
    value: 'icons',
    label: 'Icons only',
    description: 'Show logos without text labels.',
  },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_ICON_SIZE_OPTIONS: {
  value: PortfolioExperienceToolsIconSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact logos.' },
  { value: 'md', label: 'Medium', description: 'Default size.' },
  { value: 'lg', label: 'Large', description: 'More visible logos.' },
  { value: 'xl', label: 'Extra large', description: 'Hero-sized tool icons.' },
];

export const PORTFOLIO_EXPERIENCE_SKILLS_TAG_STYLE_OPTIONS: {
  value: PortfolioExperienceSkillsTagStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'soft',
    label: 'Soft chips',
    description: 'Muted gray pills — current default.',
  },
  {
    value: 'pill',
    label: 'Accent pills',
    description: 'White pills with accent dot — like Proof links.',
  },
  {
    value: 'outline',
    label: 'Outlined',
    description: 'Bordered white chips, similar to tool labels.',
  },
  {
    value: 'plain',
    label: 'Plain text',
    description: 'Minimal text tags without chrome.',
  },
];

export const PORTFOLIO_EXPERIENCE_TEXT_SIZE_OPTIONS: {
  value: PortfolioExperienceTextSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact body text.' },
  { value: 'md', label: 'Medium', description: 'Default readable size.' },
  { value: 'lg', label: 'Large', description: 'More prominent.' },
  { value: 'xl', label: 'Extra large', description: 'Hero-level emphasis.' },
];

export const PORTFOLIO_EXPERIENCE_STYLE_TARGET_OPTIONS: {
  value: PortfolioExperienceStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'title', label: 'Job title', description: 'Main role title in the entry.' },
  { value: 'organization', label: 'Organization', description: 'Company or freelance label.' },
  { value: 'meta', label: 'Meta chips', description: 'Status, employment, location.' },
  { value: 'description', label: 'Description', description: 'Role summary paragraph.' },
  { value: 'blockLabel', label: 'Block labels', description: 'TASKS, PROOF, NOTE, SKILLS, TOOLS headings.' },
  { value: 'tasks', label: 'Tasks', description: 'Bullet list items.' },
  { value: 'proof', label: 'Proof links', description: 'Proof pill labels.' },
  { value: 'note', label: 'Note', description: 'Remarks / italic note.' },
  { value: 'skills', label: 'Skills tags', description: 'Skill tag text.' },
  { value: 'tools', label: 'Tools text', description: 'Tool chip labels (when shown).' },
];

export function resolveExperienceBlockLabel(
  custom: string | undefined,
  fallback: string
): string {
  const trimmed = custom?.trim();
  return trimmed ? trimmed : fallback;
}

export function normalizeExperienceTextStyle(
  raw: unknown,
  fallback: PortfolioExperienceTextStyle
): PortfolioExperienceTextStyle {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...fallback };
  const record = raw as Record<string, unknown>;
  const font =
    record.font === 'sans' || record.font === 'serif' || record.font === 'display'
      ? record.font
      : fallback.font;
  const size =
    record.size === 'sm' || record.size === 'md' || record.size === 'lg' || record.size === 'xl'
      ? record.size
      : fallback.size;
  return {
    color: sanitizeHex(record.color, fallback.color),
    font,
    size,
    italic: typeof record.italic === 'boolean' ? record.italic : fallback.italic,
    bold: typeof record.bold === 'boolean' ? record.bold : fallback.bold,
    uppercase: typeof record.uppercase === 'boolean' ? record.uppercase : fallback.uppercase,
  };
}

export function normalizeExperienceElementStyles(raw: unknown): PortfolioExperienceElementStyles {
  const next: PortfolioExperienceElementStyles = {
    title: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.title },
    organization: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.organization },
    meta: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.meta },
    description: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.description },
    blockLabel: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.blockLabel },
    tasks: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.tasks },
    proof: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.proof },
    note: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.note },
    skills: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.skills },
    tools: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.tools },
  };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return next;
  const record = raw as Record<string, unknown>;
  for (const id of EXPERIENCE_STYLE_TARGET_IDS) {
    next[id] = normalizeExperienceTextStyle(record[id], DEFAULT_EXPERIENCE_ELEMENT_STYLES[id]);
  }
  return next;
}

export function patchExperienceElementStyle(
  styles: PortfolioExperienceElementStyles,
  target: PortfolioExperienceStyleTarget,
  patch: Partial<PortfolioExperienceTextStyle>
): PortfolioExperienceElementStyles {
  return normalizeExperienceElementStyles({
    ...styles,
    [target]: { ...styles[target], ...patch },
  });
}

export function experienceTextSizeClass(
  size: PortfolioExperienceTextSize,
  role: 'title' | 'body' | 'label' = 'body'
): string {
  if (role === 'title') {
    switch (size) {
      case 'sm':
        return 'text-xl sm:text-2xl';
      case 'lg':
        return 'text-3xl sm:text-4xl';
      case 'xl':
        return 'text-3xl font-bold sm:text-4xl lg:text-[2.6rem]';
      default:
        return 'text-2xl sm:text-3xl';
    }
  }
  if (role === 'label') {
    switch (size) {
      case 'sm':
        return 'text-[11px]';
      case 'lg':
        return 'text-sm';
      case 'xl':
        return 'text-base';
      default:
        return 'text-xs';
    }
  }
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'lg':
      return 'text-lg';
    case 'xl':
      return 'text-xl';
    default:
      return 'text-base';
  }
}

export function experienceTextStyleClass(
  style: PortfolioExperienceTextStyle,
  role: 'title' | 'body' | 'label' = 'body'
): string {
  const parts = [experienceTextSizeClass(style.size, role)];
  if (style.font === 'serif') parts.push('font-serif');
  if (style.italic) parts.push('italic');
  if (style.bold) {
    parts.push(role === 'title' ? 'font-bold' : 'font-semibold');
  } else {
    parts.push('font-normal');
  }
  if (style.uppercase) {
    parts.push(role === 'label' ? 'uppercase tracking-[0.16em]' : 'uppercase tracking-[0.08em]');
  }
  return parts.join(' ');
}

export function experienceTextInlineStyle(style: PortfolioExperienceTextStyle): CSSProperties {
  return {
    color: sanitizeHex(style.color, DEFAULT_EXPERIENCE_BODY_COLOR),
    ...experienceHeaderFontStyle(style.font),
  };
}

export function experienceToolsIconPixelSize(size: PortfolioExperienceToolsIconSize): number {
  switch (size) {
    case 'sm':
      return 20;
    case 'lg':
      return 32;
    case 'xl':
      return 40;
    default:
      return 26;
  }
}

export function experienceToolsIconShellClass(size: PortfolioExperienceToolsIconSize): string {
  switch (size) {
    case 'sm':
      return 'h-9 w-9';
    case 'lg':
      return 'h-12 w-12';
    case 'xl':
      return 'h-16 w-16';
    default:
      return 'h-11 w-11';
  }
}

/** Card-style designs that can sit in a multi-column grid. */
export function experienceDesignSupportsItemsPerRow(design: PortfolioExperienceDesign): boolean {
  return design === 'stacked' || design === 'timeline-stepped' || design === 'large';
}

/** Designs that already use an entry card shell by default. */
export function experienceDesignUsesEntryCard(design: PortfolioExperienceDesign): boolean {
  return design === 'stacked' || design === 'large' || design === 'timeline-stepped';
}

export function normalizeExperienceElementZones(raw: unknown): PortfolioExperienceElementZones {
  const next: PortfolioExperienceElementZones = { ...DEFAULT_EXPERIENCE_ELEMENT_ZONES };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return next;
  const record = raw as Record<string, unknown>;
  for (const id of EXPERIENCE_ELEMENT_IDS) {
    const value = record[id];
    if (value === 'story' || value === 'details') next[id] = value;
  }
  return next;
}

/** Resolved card/outside zone for one element (tools may sit outside via toolsZone). */
export function resolveExperienceElementZone(
  id: PortfolioExperienceElementId,
  zones: PortfolioExperienceElementZones,
  toolsZone: PortfolioExperienceToolsZone = 'details'
): PortfolioExperienceCardZone | 'entry' {
  if (id === 'tools') {
    if (toolsZone === 'entry') return 'entry';
    return toolsZone;
  }
  return zones[id] ?? DEFAULT_EXPERIENCE_ELEMENT_ZONES[id];
}

export function isExperienceStoryElement(
  id: PortfolioExperienceElementId,
  toolsZone: PortfolioExperienceToolsZone = 'details',
  zones: PortfolioExperienceElementZones = DEFAULT_EXPERIENCE_ELEMENT_ZONES
): boolean {
  return resolveExperienceElementZone(id, zones, toolsZone) === 'story';
}

export function isExperienceDetailsElement(
  id: PortfolioExperienceElementId,
  toolsZone: PortfolioExperienceToolsZone = 'details',
  zones: PortfolioExperienceElementZones = DEFAULT_EXPERIENCE_ELEMENT_ZONES
): boolean {
  return resolveExperienceElementZone(id, zones, toolsZone) === 'details';
}

export function isExperienceEntryToolsZone(toolsZone: PortfolioExperienceToolsZone): boolean {
  return toolsZone === 'entry';
}

export function normalizeExperienceElementOrder(raw: unknown): PortfolioExperienceElementId[] {
  const allowed = new Set<string>(EXPERIENCE_ELEMENT_IDS);
  const seen = new Set<string>();
  const ordered: PortfolioExperienceElementId[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item !== 'string' || !allowed.has(item) || seen.has(item)) continue;
      seen.add(item);
      ordered.push(item as PortfolioExperienceElementId);
    }
  }
  for (const id of EXPERIENCE_ELEMENT_IDS) {
    if (!seen.has(id)) ordered.push(id);
  }
  return ordered;
}

export function moveExperienceElementOrder(
  order: PortfolioExperienceElementId[],
  index: number,
  direction: -1 | 1
): PortfolioExperienceElementId[] {
  const next = normalizeExperienceElementOrder(order);
  const target = index + direction;
  if (index < 0 || index >= next.length || target < 0 || target >= next.length) return next;
  const copy = [...next];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  return copy;
}

/** Move an element to the other inner card (story ↔ details). Syncs toolsZone when needed. */
export function moveExperienceElementToCardZone(
  zones: PortfolioExperienceElementZones,
  id: PortfolioExperienceElementId,
  zone: PortfolioExperienceCardZone,
  toolsZone: PortfolioExperienceToolsZone
): { elementZones: PortfolioExperienceElementZones; toolsZone: PortfolioExperienceToolsZone } {
  const elementZones = normalizeExperienceElementZones({ ...zones, [id]: zone });
  if (id === 'tools') {
    return { elementZones, toolsZone: zone };
  }
  return { elementZones, toolsZone };
}

export const PORTFOLIO_EXPERIENCE_YEARS_PRESET_OPTIONS: {
  value: PortfolioExperienceYearsPreset;
  label: string;
  description: string;
}[] = [
  {
    value: 'default',
    label: 'Hands-on',
    description: '{years}+ years of hands-on experience in my field.',
  },
  {
    value: 'hands-on',
    label: 'Field expertise',
    description: '{years}+ years mastering my craft and delivering results.',
  },
  {
    value: 'industry',
    label: 'Industry',
    description: '{years}+ years building expertise across the industry.',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Over {years} years of professional experience.',
  },
  {
    value: 'creative',
    label: 'Creative',
    description: '{years}+ years crafting stories and content for clients worldwide.',
  },
  { value: 'custom', label: 'Custom', description: 'Write your own phrase — use {years} for the count.' },
];

export const PORTFOLIO_EXPERIENCE_YEARS_SIZE_OPTIONS: {
  value: PortfolioExperienceYearsSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

export const PORTFOLIO_EXPERIENCE_CONTENT_ALIGN_OPTIONS: {
  value: PortfolioExperienceContentAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Default left alignment.' },
  { value: 'center', label: 'Center', description: 'Center the years phrase.' },
  { value: 'right', label: 'Right', description: 'Right-aligned years phrase.' },
];

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioExperienceSubtitlePreset, 'default' | 'custom' | 'minimal'>,
  string
> = {
  short: 'Roles, milestones, and the path that shaped my craft.',
  career: 'A clear look at where I have worked and what I have built along the way.',
};

const TITLE_PRESET_COPY: Record<Exclude<PortfolioExperienceTitlePreset, 'custom'>, string> = {
  experience: 'EXPERIENCE',
  'career-path': 'CAREER PATH',
  'work-history': 'WORK HISTORY',
  'professional-journey': 'PROFESSIONAL JOURNEY',
};

const YEARS_PRESET_COPY: Record<
  Exclude<PortfolioExperienceYearsPreset, 'default' | 'custom'>,
  string
> = {
  'hands-on': '{years}+ years mastering my craft and delivering results.',
  industry: '{years}+ years building expertise across the industry.',
  professional: 'Over {years} years of professional experience.',
  creative: '{years}+ years crafting stories and content for clients worldwide.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

export function resolveExperienceSectionTitle(
  settings: Pick<PortfolioExperienceSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  switch (settings.titlePreset) {
    case 'custom':
      return settings.titleCustom.trim() || settings.title.trim() || 'Experience';
    case 'career-path':
    case 'work-history':
    case 'professional-journey':
    case 'experience':
      return TITLE_PRESET_COPY[settings.titlePreset];
    default:
      return settings.title.trim() || 'Experience';
  }
}

export function resolveExperienceSectionSubtitle(
  settings: Pick<PortfolioExperienceSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'career':
      return SUBTITLE_PRESET_COPY.career;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function experienceHeaderFontClass(
  font: PortfolioExperienceHeaderFont,
  kind: 'title' | 'subtitle'
): string {
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

export function experienceHeaderFontStyle(font: PortfolioExperienceHeaderFont): CSSProperties | undefined {
  if (font === 'serif') return { fontFamily: "'Playfair Display', serif" };
  return undefined;
}

export function experienceTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_EXPERIENCE_TITLE_COLOR) };
}

export function experienceSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_EXPERIENCE_SUBTITLE_COLOR) };
}

export function experienceAccentColor(accent: string): string {
  return sanitizeHex(accent, DEFAULT_EXPERIENCE_ACCENT_COLOR);
}

export function isExperienceTimelineDesign(design: PortfolioExperienceDesign): boolean {
  return design === 'timeline' || design.startsWith('timeline-');
}

export function resolveExperienceYearsTemplate(
  settings: Pick<PortfolioExperiencePresentationSettings, 'yearsPreset' | 'yearsCustom'>
): string {
  switch (settings.yearsPreset) {
    case 'custom':
      return settings.yearsCustom.trim() || '{years}+ years of hands-on experience in my field.';
    case 'hands-on':
    case 'industry':
    case 'professional':
    case 'creative':
      return YEARS_PRESET_COPY[settings.yearsPreset];
    default:
      return '{years}+ years of hands-on experience in my field.';
  }
}

export function experienceYearsClass(
  settings: Pick<
    PortfolioExperiencePresentationSettings,
    'yearsFont' | 'yearsSize' | 'yearsItalic' | 'yearsAlignment'
  >
): string {
  const parts = ['mb-10 max-w-2xl leading-relaxed', experienceHeaderFontClass(settings.yearsFont, 'title')];

  switch (settings.yearsSize) {
    case 'sm':
      parts.push('text-base sm:text-lg');
      break;
    case 'lg':
      parts.push('text-xl sm:text-2xl lg:text-3xl');
      break;
    case 'xl':
      parts.push('text-2xl sm:text-3xl lg:text-4xl');
      break;
    default:
      parts.push('text-lg sm:text-xl lg:text-2xl');
  }

  if (settings.yearsItalic) parts.push('italic');

  switch (settings.yearsAlignment) {
    case 'center':
      parts.push('mx-auto text-center');
      break;
    case 'right':
      parts.push('ml-auto text-right');
      break;
    default:
      parts.push('text-left');
  }

  return parts.join(' ');
}

export function experienceYearsStyle(
  settings: Pick<PortfolioExperiencePresentationSettings, 'yearsColor' | 'yearsFont'>
): CSSProperties {
  return {
    color: sanitizeHex(settings.yearsColor, DEFAULT_EXPERIENCE_YEARS_COLOR),
    ...experienceHeaderFontStyle(settings.yearsFont),
  };
}

export function experienceYearsHighlightStyle(
  settings: Pick<PortfolioExperiencePresentationSettings, 'yearsHighlightColor' | 'yearsFont'>
): CSSProperties {
  return {
    color: sanitizeHex(settings.yearsHighlightColor, DEFAULT_EXPERIENCE_YEARS_HIGHLIGHT_COLOR),
    ...experienceHeaderFontStyle(settings.yearsFont),
  };
}

export function experienceBlockClass(design: PortfolioExperienceDesign): string {
  switch (design) {
    case 'stacked':
      return 'group transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]';
    case 'compact':
      return 'border-b border-neutral-200/70 py-7 last:border-b-0 last:pb-0 first:pt-0';
    case 'large':
      return '';
    case 'timeline-stepped':
      return '';
    default:
      return '';
  }
}

function experienceCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
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

export function experienceLayerFrameClass(
  frame: PortfolioExperienceLayerFrame,
  density: PortfolioExperienceItemDensity = 'comfortable'
): string {
  if (!frame.enabled) {
    return density === 'compact' ? 'space-y-4' : 'space-y-6';
  }
  const padding =
    density === 'compact'
      ? servicesCardPaddingClass(frame.cardPadding === 'lg' ? 'md' : frame.cardPadding === 'md' ? 'sm' : frame.cardPadding)
      : servicesCardPaddingClass(frame.cardPadding);
  const parts = [servicesCardRadiusClass(frame.cardBorderRadius), padding];
  if (frame.cardBorder !== 'none') {
    parts.push(experienceCardBorderWidthClass(frame.cardBorder));
    if (frame.cardBorder === 'soft') parts.push('shadow-sm');
  }
  parts.push(density === 'compact' ? 'space-y-4' : 'space-y-6');
  return parts.filter(Boolean).join(' ');
}

export function experienceLayerFrameStyle(
  frame: PortfolioExperienceLayerFrame,
  accentColor: string
): CSSProperties | undefined {
  if (!frame.enabled) return undefined;
  const style: CSSProperties = {};
  if (frame.cardBackgroundFill === 'solid' && frame.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(frame.cardBackgroundColor, DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR);
  }
  if (frame.cardBorder === 'accent') {
    style.borderColor = sanitizeHex(accentColor, DEFAULT_EXPERIENCE_ACCENT_COLOR);
  } else if (frame.cardBorder === 'soft' || frame.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(frame.cardBorderColor, DEFAULT_EXPERIENCE_CARD_BORDER_COLOR);
  }
  return style;
}

export function experienceLayerToCardFrameSettings(
  frame: PortfolioExperienceLayerFrame
): import('@/components/portfolio/portfolio-card-frame-settings-fields').PortfolioCardFrameSettings {
  return {
    cardBorder: frame.cardBorder,
    cardBorderColor: frame.cardBorderColor,
    cardBackgroundEnabled: frame.cardBackgroundEnabled,
    cardBackgroundColor: frame.cardBackgroundColor,
    cardBorderRadius: frame.cardBorderRadius,
    cardPadding: frame.cardPadding,
    cardBackgroundFill: frame.cardBackgroundFill,
    cardBackgroundColorA: frame.cardBackgroundColorA,
    cardBackgroundColorB: frame.cardBackgroundColorB,
    cardBackgroundSplitAxis: frame.cardBackgroundSplitAxis,
    cardBackgroundSplitPosition: frame.cardBackgroundSplitPosition,
    cardDividerEnabled: frame.cardDividerEnabled,
    cardDividerShape: frame.cardDividerShape,
    cardDividerAngle: frame.cardDividerAngle,
    cardDividerCurveDepth: frame.cardDividerCurveDepth,
    cardDividerColor: frame.cardDividerColor,
    cardDividerThickness: frame.cardDividerThickness,
    cardDividerOpacity: frame.cardDividerOpacity,
  };
}

export function patchExperienceLayerFrame(
  frame: PortfolioExperienceLayerFrame,
  patch: Partial<PortfolioExperienceLayerFrame>
): PortfolioExperienceLayerFrame {
  const mergedBg = mergeServicesCardBackgroundSettings(frame, patch);
  const solidBg =
    mergedBg.cardBackgroundFill === 'split'
      ? { ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS }
      : mergedBg;
  return {
    ...frame,
    ...solidBg,
    enabled: typeof patch.enabled === 'boolean' ? patch.enabled : frame.enabled,
    cardBorder: patch.cardBorder ?? frame.cardBorder,
    cardBorderColor: patch.cardBorderColor ?? frame.cardBorderColor,
    cardBackgroundEnabled:
      typeof patch.cardBackgroundEnabled === 'boolean'
        ? patch.cardBackgroundEnabled
        : frame.cardBackgroundEnabled,
    cardBackgroundColor: patch.cardBackgroundColor ?? frame.cardBackgroundColor,
    cardBorderRadius: patch.cardBorderRadius ?? frame.cardBorderRadius,
    cardPadding: patch.cardPadding ?? frame.cardPadding,
  };
}

function mergeExperienceLayerFrame(
  base: PortfolioExperienceLayerFrame,
  raw: unknown,
  legacy?: Partial<PortfolioExperienceLayerFrame>
): PortfolioExperienceLayerFrame {
  const record =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : ({} as Record<string, unknown>);
  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const fromLegacy = legacy ?? {};
  const seed: PortfolioExperienceLayerFrame = {
    ...base,
    ...fromLegacy,
    enabled:
      typeof record.enabled === 'boolean'
        ? record.enabled
        : typeof fromLegacy.enabled === 'boolean'
          ? fromLegacy.enabled
          : base.enabled,
  };

  const bg = mergeServicesCardBackgroundSettings(seed, { ...fromLegacy, ...record });
  const solidBg = bg.cardBackgroundFill === 'split' ? { ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS } : bg;

  return {
    ...seed,
    ...solidBg,
    cardBorder: pick(
      record.cardBorder ?? fromLegacy.cardBorder,
      ['none', 'soft', 'solid', 'accent'],
      seed.cardBorder
    ),
    cardBorderColor: sanitizeHex(
      record.cardBorderColor ?? fromLegacy.cardBorderColor,
      seed.cardBorderColor
    ),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean'
        ? record.cardBackgroundEnabled
        : typeof fromLegacy.cardBackgroundEnabled === 'boolean'
          ? fromLegacy.cardBackgroundEnabled
          : seed.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(
      record.cardBackgroundColor ?? fromLegacy.cardBackgroundColor,
      seed.cardBackgroundColor
    ),
    cardBorderRadius: pick(
      record.cardBorderRadius ?? fromLegacy.cardBorderRadius,
      ['none', 'sm', 'md', 'lg', 'xl'],
      seed.cardBorderRadius
    ),
    cardPadding: pick(
      record.cardPadding ?? fromLegacy.cardPadding,
      ['none', 'sm', 'md', 'lg'],
      seed.cardPadding
    ),
  };
}

export function experienceEntryShellUsesFrame(
  p: Pick<PortfolioExperiencePresentationSettings, 'experienceDesign' | 'entryFrame'>
): boolean {
  const design = p.experienceDesign;
  if (design === 'compact' && !p.entryFrame.enabled) return false;
  if (p.entryFrame.enabled) return true;
  return experienceDesignUsesEntryCard(design) || design === 'large';
}

export function experienceEntryShellClass(
  p: Pick<PortfolioExperiencePresentationSettings, 'experienceDesign' | 'entryFrame' | 'itemDensity'>
): string {
  const designExtras = experienceBlockClass(p.experienceDesign);
  if (!experienceEntryShellUsesFrame(p)) return designExtras;
  const frameClass = experienceLayerFrameClass(
    { ...p.entryFrame, enabled: true },
    p.itemDensity
  );
  return [frameClass, designExtras].filter(Boolean).join(' ');
}

export function experienceEntryShellStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'experienceDesign' | 'entryFrame' | 'accentColor'>
): CSSProperties | undefined {
  if (!experienceEntryShellUsesFrame(p)) return undefined;
  return experienceLayerFrameStyle({ ...p.entryFrame, enabled: true }, p.accentColor);
}

export function experienceStoryPanelClass(
  p: Pick<PortfolioExperiencePresentationSettings, 'storyFrame' | 'itemDensity'>
): string {
  return experienceLayerFrameClass(p.storyFrame, p.itemDensity);
}

export function experienceStoryPanelStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'storyFrame' | 'accentColor'>
): CSSProperties | undefined {
  return experienceLayerFrameStyle(p.storyFrame, p.accentColor);
}

export function experienceDetailsPanelClass(
  p: Pick<PortfolioExperiencePresentationSettings, 'detailsFrame' | 'itemDensity' | 'asidePlacement'>
): string {
  if (p.asidePlacement === 'inline') {
    return p.itemDensity === 'compact' ? 'space-y-4' : 'space-y-6';
  }
  return experienceLayerFrameClass(p.detailsFrame, p.itemDensity);
}

export function experienceDetailsPanelStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'detailsFrame' | 'accentColor' | 'asidePlacement'>
): CSSProperties | undefined {
  if (p.asidePlacement === 'inline') return undefined;
  return experienceLayerFrameStyle(p.detailsFrame, p.accentColor);
}

export function experienceItemGapClass(gap: PortfolioExperienceItemGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-3 sm:gap-4';
    case 'lg':
      return 'gap-8 sm:gap-10';
    default:
      return 'gap-5 sm:gap-7';
  }
}

export function resolveExperienceBodyLayout(
  p: Pick<PortfolioExperiencePresentationSettings, 'asidePlacement' | 'experienceDesign'>,
  inMultiColumn: boolean
): 'stack' | 'split' | 'bento' | 'compact' {
  const design = p.experienceDesign;
  if (design === 'compact') return 'compact';
  if (design === 'large' && !inMultiColumn) return 'bento';
  if (inMultiColumn || p.asidePlacement === 'stacked' || p.asidePlacement === 'inline') {
    return 'stack';
  }
  return 'split';
}

export function experienceListMaxWidthClass(width: PortfolioExperienceListMaxWidth): string {
  switch (width) {
    case 'narrow':
      return 'w-full max-w-xl sm:max-w-2xl lg:max-w-3xl';
    case 'wide':
      return 'w-full max-w-4xl sm:max-w-6xl lg:max-w-[80rem] xl:max-w-[88rem]';
    case 'full':
      return 'w-full max-w-none';
    default:
      return 'w-full max-w-3xl sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl';
  }
}

export function experienceListPlacementClass(placement: PortfolioExperienceListPlacement): string {
  switch (placement) {
    case 'left':
      return 'mr-auto ml-0';
    case 'right':
      return 'ml-auto mr-0';
    default:
      return 'mx-auto';
  }
}

export function experienceItemsPerRowGridClass(
  itemsPerRow: PortfolioExperienceItemsPerRow,
  design: PortfolioExperienceDesign,
  itemGap: PortfolioExperienceItemGap = 'md'
): string {
  const gap = experienceItemGapClass(itemGap);
  if (!experienceDesignSupportsItemsPerRow(design) || itemsPerRow <= 1) {
    return `grid grid-cols-1 ${gap}`;
  }
  if (itemsPerRow === 3) {
    return `grid grid-cols-1 ${gap} sm:grid-cols-2 xl:grid-cols-3`;
  }
  return `grid grid-cols-1 ${gap} md:grid-cols-2`;
}

export function experienceListShellClass(
  maxWidth: PortfolioExperienceListMaxWidth,
  placement: PortfolioExperienceListPlacement
): string {
  return `w-full ${experienceListPlacementClass(placement)} ${experienceListMaxWidthClass(maxWidth)}`;
}

export function resolveExperienceItemsPerRow(
  design: PortfolioExperienceDesign,
  itemsPerRow: PortfolioExperienceItemsPerRow | undefined
): PortfolioExperienceItemsPerRow {
  if (!experienceDesignSupportsItemsPerRow(design)) return 1;
  return itemsPerRow === 2 || itemsPerRow === 3 ? itemsPerRow : 1;
}

export function pickExperiencePresentationSettings(experience: unknown): PortfolioExperiencePresentationSettings {
  return mergeExperiencePresentation(DEFAULT_EXPERIENCE_PRESENTATION, experience);
}

export function mergeExperiencePresentation(
  base: PortfolioExperiencePresentationSettings,
  patch: unknown
): PortfolioExperiencePresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);

  const legacyDetailsStyle = record.detailsPanelStyle;
  const legacyForceEntry = record.forceEntryFrame;
  const legacyCardPatch: Partial<PortfolioExperienceLayerFrame> = {
    cardBorder:
      record.cardBorder === 'none' ||
      record.cardBorder === 'soft' ||
      record.cardBorder === 'solid' ||
      record.cardBorder === 'accent'
        ? record.cardBorder
        : undefined,
    cardBorderColor: typeof record.cardBorderColor === 'string' ? record.cardBorderColor : undefined,
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean' ? record.cardBackgroundEnabled : undefined,
    cardBackgroundColor:
      typeof record.cardBackgroundColor === 'string' ? record.cardBackgroundColor : undefined,
    cardBorderRadius:
      record.cardBorderRadius === 'none' ||
      record.cardBorderRadius === 'sm' ||
      record.cardBorderRadius === 'md' ||
      record.cardBorderRadius === 'lg' ||
      record.cardBorderRadius === 'xl'
        ? record.cardBorderRadius
        : undefined,
    cardPadding:
      record.cardPadding === 'none' ||
      record.cardPadding === 'sm' ||
      record.cardPadding === 'md' ||
      record.cardPadding === 'lg'
        ? record.cardPadding
        : undefined,
  };

  let asidePlacement = pick(
    record.asidePlacement,
    ['right', 'left', 'stacked', 'inline'],
    base.asidePlacement
  );
  if (legacyDetailsStyle === 'inline' && record.asidePlacement == null) {
    asidePlacement = 'inline';
  }

  const entryFrame = mergeExperienceLayerFrame(base.entryFrame, record.entryFrame, {
    ...legacyCardPatch,
    ...(typeof legacyForceEntry === 'boolean' ? { enabled: legacyForceEntry } : {}),
  });

  const storyFrame = mergeExperienceLayerFrame(base.storyFrame, record.storyFrame);

  const detailsFrame = mergeExperienceLayerFrame(base.detailsFrame, record.detailsFrame, {
    ...(legacyDetailsStyle === 'plain'
      ? { enabled: false }
      : legacyDetailsStyle === 'card'
        ? { enabled: true }
        : {}),
    ...(!record.detailsFrame ? legacyCardPatch : {}),
  });

  return {
    ...background,
    titlePreset: pick(
      record.titlePreset,
      ['experience', 'career-path', 'work-history', 'professional-journey', 'custom'],
      base.titlePreset
    ),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'career', 'minimal', 'custom'],
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
    experienceDesign: pick(record.experienceDesign, EXPERIENCE_DESIGNS, base.experienceDesign),
    listMaxWidth: pick(record.listMaxWidth, ['narrow', 'default', 'wide', 'full'], base.listMaxWidth),
    listPlacement: pick(record.listPlacement, ['left', 'center', 'right'], base.listPlacement),
    itemsPerRow: (() => {
      const raw = record.itemsPerRow;
      if (raw === 1 || raw === 2 || raw === 3) return raw;
      if (raw === '1' || raw === '2' || raw === '3') return Number(raw) as PortfolioExperienceItemsPerRow;
      return base.itemsPerRow;
    })(),
    itemGap: pick(record.itemGap, ['sm', 'md', 'lg'], base.itemGap),
    itemDensity: pick(record.itemDensity, ['comfortable', 'compact'], base.itemDensity),
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    yearsPreset: pick(
      record.yearsPreset,
      ['default', 'hands-on', 'industry', 'professional', 'creative', 'custom'],
      base.yearsPreset
    ),
    yearsCustom: typeof record.yearsCustom === 'string' ? record.yearsCustom : base.yearsCustom,
    yearsFont: pick(record.yearsFont, ['sans', 'serif', 'display'], base.yearsFont),
    yearsSize: pick(record.yearsSize, ['sm', 'md', 'lg', 'xl'], base.yearsSize),
    yearsColor: sanitizeHex(record.yearsColor, base.yearsColor),
    yearsHighlightColor: sanitizeHex(record.yearsHighlightColor, base.yearsHighlightColor),
    yearsBoldYears: typeof record.yearsBoldYears === 'boolean' ? record.yearsBoldYears : base.yearsBoldYears,
    yearsItalic: typeof record.yearsItalic === 'boolean' ? record.yearsItalic : base.yearsItalic,
    yearsAlignment: pick(record.yearsAlignment, ['left', 'center', 'right'], base.yearsAlignment),
    showYears: typeof record.showYears === 'boolean' ? record.showYears : base.showYears,
    showPeriod: typeof record.showPeriod === 'boolean' ? record.showPeriod : base.showPeriod,
    showTitle: typeof record.showTitle === 'boolean' ? record.showTitle : base.showTitle,
    showOrganization:
      typeof record.showOrganization === 'boolean' ? record.showOrganization : base.showOrganization,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showMeta: typeof record.showMeta === 'boolean' ? record.showMeta : base.showMeta,
    showTasks: typeof record.showTasks === 'boolean' ? record.showTasks : base.showTasks,
    showTools: typeof record.showTools === 'boolean' ? record.showTools : base.showTools,
    showProof: typeof record.showProof === 'boolean' ? record.showProof : base.showProof,
    showNote: typeof record.showNote === 'boolean' ? record.showNote : base.showNote,
    showSkills: typeof record.showSkills === 'boolean' ? record.showSkills : base.showSkills,
    asidePlacement,
    elementOrder: normalizeExperienceElementOrder(record.elementOrder ?? base.elementOrder),
    elementZones: (() => {
      const zones = normalizeExperienceElementZones(record.elementZones ?? base.elementZones);
      const toolsZone = pick(record.toolsZone, ['story', 'details', 'entry'], base.toolsZone);
      if (toolsZone === 'story' || toolsZone === 'details') {
        zones.tools = toolsZone;
      }
      return zones;
    })(),
    tasksLabel: typeof record.tasksLabel === 'string' ? record.tasksLabel : base.tasksLabel,
    proofLabel: typeof record.proofLabel === 'string' ? record.proofLabel : base.proofLabel,
    noteLabel: typeof record.noteLabel === 'string' ? record.noteLabel : base.noteLabel,
    skillsLabel: typeof record.skillsLabel === 'string' ? record.skillsLabel : base.skillsLabel,
    toolsLabel: typeof record.toolsLabel === 'string' ? record.toolsLabel : base.toolsLabel,
    showBlockLabels:
      typeof record.showBlockLabels === 'boolean' ? record.showBlockLabels : base.showBlockLabels,
    skillsTagStyle: pick(
      record.skillsTagStyle,
      ['soft', 'pill', 'outline', 'plain'],
      base.skillsTagStyle
    ),
    toolsZone: pick(record.toolsZone, ['story', 'details', 'entry'], base.toolsZone),
    toolsEntrySide: pick(record.toolsEntrySide, ['left', 'right'], base.toolsEntrySide),
    toolsDisplay: pick(
      record.toolsDisplay,
      ['icons-and-labels', 'icons'],
      base.toolsDisplay
    ),
    toolsIconSize: pick(record.toolsIconSize, ['sm', 'md', 'lg', 'xl'], base.toolsIconSize),
    elementStyles: normalizeExperienceElementStyles(record.elementStyles ?? base.elementStyles),
    entryFrame,
    storyFrame,
    detailsFrame,
  };
}

/**
 * Maps legacy About-embedded experience fields into a standalone Experience section.
 */
export function migrateExperienceFromLegacyAbout(aboutRecord: unknown): PortfolioExperienceSectionSettings {
  const defaults: PortfolioExperienceSectionSettings = {
    enabled: true,
    title: 'Experience',
    subtitle: 'Roles, milestones, and the path that shaped my craft.',
    ...DEFAULT_EXPERIENCE_PRESENTATION,
  };

  if (!aboutRecord || typeof aboutRecord !== 'object') return defaults;
  const record = aboutRecord as Record<string, unknown>;

  const headingPreset = record.experienceHeadingPreset;
  let titlePreset: PortfolioExperienceTitlePreset = defaults.titlePreset;
  let titleCustom = defaults.titleCustom;
  let title = defaults.title;

  if (
    headingPreset === 'experience' ||
    headingPreset === 'career-path' ||
    headingPreset === 'work-history' ||
    headingPreset === 'professional-journey' ||
    headingPreset === 'custom'
  ) {
    titlePreset = headingPreset;
  } else if (headingPreset === 'default') {
    titlePreset = 'custom';
  }

  if (typeof record.experienceHeadingCustom === 'string' && record.experienceHeadingCustom.trim()) {
    titleCustom = record.experienceHeadingCustom.trim();
  }
  if (typeof record.experienceHeading === 'string' && record.experienceHeading.trim()) {
    title = record.experienceHeading.trim();
    if (titlePreset === 'custom' && !titleCustom) titleCustom = title;
  }

  const presentationPatch: Record<string, unknown> = {
    titlePreset,
    titleCustom,
    experienceDesign: record.experienceDesign,
    accentColor: record.accentColor,
    yearsPreset: record.experienceYearsPreset,
    yearsCustom: record.experienceYearsCustom,
    yearsFont: record.experienceYearsFont,
    yearsSize: record.experienceYearsSize,
    yearsColor: record.experienceYearsColor,
    yearsHighlightColor: record.experienceYearsHighlightColor,
    yearsBoldYears: record.experienceYearsBoldYears,
    yearsItalic: record.experienceYearsItalic,
    yearsAlignment: record.experienceYearsAlignment,
    showYears:
      typeof record.showExperienceYears === 'boolean' ? record.showExperienceYears : defaults.showYears,
    titleFont: record.experienceHeadingFont,
    titleColor: record.experienceHeadingColor,
    titleUppercase: record.experienceHeadingUppercase,
    headerAlignment: record.experienceHeadingAlignment,
  };

  return {
    enabled: typeof record.showExperience === 'boolean' ? record.showExperience : defaults.enabled,
    title,
    subtitle: defaults.subtitle,
    ...mergeExperiencePresentation(defaults, presentationPatch),
  };
}
