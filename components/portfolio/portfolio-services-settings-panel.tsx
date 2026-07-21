'use client';

import { useState, type ReactNode } from 'react';
import {
  PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS,
  PORTFOLIO_SERVICES_CARD_BACKGROUND_ALTERNATION_OPTIONS,
  PORTFOLIO_SERVICES_CARD_DESIGN_INTENSITY_HINTS,
  PORTFOLIO_SERVICES_CARD_DESIGN_TINT_HINTS,
  PORTFOLIO_SERVICES_CARD_DESIGN_OPTIONS,
  PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS,
  PORTFOLIO_SERVICES_CARD_RADIUS_OPTIONS,
  PORTFOLIO_SERVICES_COLUMNS_OPTIONS,
  PORTFOLIO_SERVICES_CONTENT_ALIGNMENT_OPTIONS,
  PORTFOLIO_SERVICES_DISPLAY_MODE_OPTIONS,
  PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS,
  PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS,
  PORTFOLIO_SERVICES_ICON_PLACEMENT_OPTIONS,
  PORTFOLIO_SERVICES_PRICE_PLACEMENT_OPTIONS,
  PORTFOLIO_SERVICES_SECTION_ORGANIZATION_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_BORDER_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_DESIGN_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_PADDING_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_PATTERN_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_RADIUS_OPTIONS,
  PORTFOLIO_SERVICES_STYLE_TARGET_OPTIONS,
  PORTFOLIO_SERVICES_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_DISTINCT_SERVICES_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_DISTINCT_SERVICES_TITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_DISTINCT_SKILLS_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_DISTINCT_SKILLS_TITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_TITLE_PRESET_OPTIONS,
  normalizeServicesElementStyles,
  patchServicesElementStyle,
  servicesCardDesignIntensityStyle,
  servicesCardDesignOwnsBackground,
  servicesCardDesignSupportsTint,
  servicesMarqueeActiveFor,
  resolveServicesSectionSubtitle,
  resolveServicesSectionTitle,
  snapshotServicesBlocksFromSection,
  snapshotServicesHeadersFromSection,
  stageChromePresetForDesign,
  type PortfolioServicesCardDesign,
  type PortfolioServicesCardDesignIntensities,
  type PortfolioServicesCardDesignTints,
  type PortfolioServicesSectionSettings,
} from '@/components/portfolio/portfolio-services-settings';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS } from '@/components/portfolio/portfolio-element-text-style';
import {
  PORTFOLIO_SERVICES_CARD_BACKGROUND_FILL_OPTIONS,
  PORTFOLIO_SERVICES_CARD_DIVIDER_SHAPE_OPTIONS,
  PORTFOLIO_SERVICES_CARD_SPLIT_AXIS_OPTIONS,
  servicesCardSplitBackgroundLayerStyle,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  PORTFOLIO_SERVICES_CARD_DECOR_ALTERNATION_OPTIONS,
  PORTFOLIO_SERVICES_CARD_DECOR_SHAPE_OPTIONS,
  servicesCardDecorShellStyle,
} from '@/components/portfolio/portfolio-services-card-decor-settings';
import {
  patchServicesBlockSettings,
  patchServicesDistinctHeader,
  readServicesBlockField,
  resolveDistinctBlockSectionSubtitle,
  resolveDistinctBlockSectionTitle,
  resolveServicesBlockPresentation,
  servicesUsesDistinctSections,
  servicesUsesSplitBlockConfig,
  type PortfolioServicesBlockScope,
} from '@/components/portfolio/portfolio-services-block-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  LIGHT_HERO_PALETTE,
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  applyServicesPaletteToSettings,
  DARK_SERVICES_PALETTE,
  DEFAULT_SERVICES_COLOR_BINDINGS,
  DEFAULT_SERVICES_PALETTE,
  mergeServicesColorBindings,
  mergeServicesPalette,
  patchServicesColorBinding,
  patchServicesColorField,
  patchServicesPalette,
  PORTFOLIO_SERVICES_COLOR_SLOT_OPTIONS,
  SERVICES_STYLE_TARGET_COLOR_SLOT,
  type ServicesColorSlot,
} from '@/components/portfolio/portfolio-services-palette-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';

export type ServicesSubSection =
  | 'general'
  | 'header'
  | 'layout'
  | 'frame'
  | 'ergonomics'
  | 'content'
  | 'skills'
  | 'servicesText'
  | 'background'
  | 'palette'
  /** @deprecated Prefer skills / servicesText */
  | 'style';

const SERVICES_SUB_SECTIONS: {
  id: Exclude<ServicesSubSection, 'style'>;
  label: string;
  description: string;
}[] = [
  { id: 'general', label: 'General', description: 'Visibility, layout mode, and block order.' },
  { id: 'header', label: 'Header', description: 'Titre et sous-titre — combiné ou par section.' },
  { id: 'layout', label: 'Designs & grille', description: 'Design services/skills et nombre par ligne.' },
  { id: 'frame', label: 'Cadre carte', description: 'Bordure, fond uni/divisé, alternance, arrondi et padding des cartes Tools & Services.' },
  {
    id: 'ergonomics',
    label: 'Ergonomie',
    description: 'Alignement et emplacement des éléments dans chaque carte.',
  },
  { id: 'content', label: 'Card content', description: 'Show or hide elements on skill and service cards.' },
  {
    id: 'skills',
    label: 'Skills',
    description: 'Skill title/body typography and tool icon size.',
  },
  {
    id: 'servicesText',
    label: 'Services',
    description: 'Card title/body/price/delivery typography and block subheadings.',
  },
  { id: 'background', label: 'Background', description: 'Section fill, gradients, and opacity.' },
  {
    id: 'palette',
    label: 'Palette',
    description: 'Semantic tokens and color bindings for the whole section.',
  },
];

const SERVICES_SKILLS_STYLE_TARGETS = PORTFOLIO_SERVICES_STYLE_TARGET_OPTIONS.filter(
  (option) => option.value === 'skillTitle' || option.value === 'skillBody'
);

const SERVICES_TEXT_STYLE_TARGETS = PORTFOLIO_SERVICES_STYLE_TARGET_OPTIONS.filter(
  (option) =>
    option.value === 'blockSubheading' ||
    option.value === 'cardTitle' ||
    option.value === 'cardBody' ||
    option.value === 'price' ||
    option.value === 'delivery'
);

/** Map legacy subsection ids (saved UI state / search) to the new element menus. */
export function normalizeServicesSubSection(value: string | undefined): ServicesSubSection {
  if (value === 'style') return 'skills';
  if (
    value === 'general' ||
    value === 'header' ||
    value === 'layout' ||
    value === 'frame' ||
    value === 'ergonomics' ||
    value === 'content' ||
    value === 'skills' ||
    value === 'servicesText' ||
    value === 'background' ||
    value === 'palette'
  ) {
    return value;
  }
  return 'header';
}

const SERVICES_BACKGROUND_LABEL_SLOTS: Record<string, ServicesColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

function asServicesPatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioServicesSectionSettings> {
  return patch as Partial<PortfolioServicesSectionSettings>;
}

function ServicesBlockScopeTabs({
  scope,
  onChange,
}: {
  scope: PortfolioServicesBlockScope;
  onChange: (scope: PortfolioServicesBlockScope) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(
        [
          { id: 'skills', label: 'Tools / Skills' },
          { id: 'services', label: 'Services' },
        ] as const
      ).map((option) => {
        const active = scope === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ServicesHeaderPreview({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  alignment,
}: {
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  alignment: 'left' | 'center';
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200/80 bg-neutral-50/50 px-5 py-4 ${
        alignment === 'center' ? 'text-center' : 'text-left'
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Aperçu en direct</p>
      <p className="mt-3 text-2xl font-bold uppercase tracking-[0.12em]" style={{ color: titleColor }}>
        {title || '—'}
      </p>
      {subtitle ? (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: subtitleColor }}>
          {subtitle}
        </p>
      ) : (
        <p className="mt-2 text-sm italic text-neutral-400">Aucun sous-titre</p>
      )}
    </div>
  );
}

function ServicesHeaderConfigSection({
  heading,
  description,
  children,
}: {
  heading: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-neutral-950">{heading}</p>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ServicesDistinctHeaderPanel({
  services,
  blockScope,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  blockScope: PortfolioServicesBlockScope;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const header = blockScope === 'skills' ? services.skillsHeader : services.servicesHeader;
  const patchHeader = (patch: Parameters<typeof patchServicesDistinctHeader>[2]) =>
    onChange(patchServicesDistinctHeader(services, blockScope, patch));

  const titlePreview = resolveDistinctBlockSectionTitle(services, blockScope);
  const subtitlePreview = resolveDistinctBlockSectionSubtitle(services, blockScope);
  const titleOptions =
    blockScope === 'skills'
      ? PORTFOLIO_SERVICES_DISTINCT_SKILLS_TITLE_PRESET_OPTIONS
      : PORTFOLIO_SERVICES_DISTINCT_SERVICES_TITLE_PRESET_OPTIONS;
  const subtitleOptions =
    blockScope === 'skills'
      ? PORTFOLIO_SERVICES_DISTINCT_SKILLS_SUBTITLE_PRESET_OPTIONS
      : PORTFOLIO_SERVICES_DISTINCT_SERVICES_SUBTITLE_PRESET_OPTIONS;

  return (
    <>
      <ServicesHeaderPreview
        title={titlePreview}
        subtitle={subtitlePreview}
        titleColor={header.titleColor}
        subtitleColor={header.subtitleColor}
        alignment={header.headerAlignment}
      />

      <ServicesHeaderConfigSection
        heading="Titre principal"
        description="Grand titre en haut de la section — affiché en capitales sur le portfolio."
      >
        <ServicesOptionGrid
          label="Preset du titre"
          options={titleOptions}
          value={header.titlePreset}
          onChange={(titlePreset) => patchHeader({ titlePreset })}
        />
        {header.titlePreset === 'custom' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Texte du titre
            </label>
            <input
              type="text"
              value={header.titleCustom}
              onChange={(event) => patchHeader({ titleCustom: event.target.value })}
              placeholder="Ex. MY TOOLKIT"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
            />
          </div>
        ) : null}
        <ServicesOptionGrid
          label="Police du titre"
          options={PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS}
          value={header.titleFont}
          onChange={(titleFont) => patchHeader({ titleFont })}
        />
        <ServicesColorField
          services={services}
          onChange={onChange}
          slot="title"
          label="Couleur du titre"
          value={header.titleColor}
          manualFallback={(titleColor) => patchHeader({ titleColor })}
        />
      </ServicesHeaderConfigSection>

      <ServicesHeaderConfigSection
        heading="Sous-titre"
        description="Ligne descriptive plus petite, sous le titre principal — optionnelle."
      >
        <ServicesOptionGrid
          label="Preset du sous-titre"
          options={subtitleOptions}
          value={header.subtitlePreset}
          onChange={(subtitlePreset) => patchHeader({ subtitlePreset })}
        />
        {header.subtitlePreset === 'custom' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Texte du sous-titre
            </label>
            <textarea
              value={header.subtitleCustom}
              onChange={(event) => patchHeader({ subtitleCustom: event.target.value })}
              rows={2}
              placeholder="Une phrase d'introduction sous le titre…"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
            />
          </div>
        ) : null}
        <ServicesOptionGrid
          label="Police du sous-titre"
          options={PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS}
          value={header.subtitleFont}
          onChange={(subtitleFont) => patchHeader({ subtitleFont })}
        />
        <ServicesColorField
          services={services}
          onChange={onChange}
          slot="subtitle"
          label="Couleur du sous-titre"
          value={header.subtitleColor}
          manualFallback={(subtitleColor) => patchHeader({ subtitleColor })}
        />
      </ServicesHeaderConfigSection>

      <ServicesHeaderConfigSection
        heading="Alignement"
        description="Position du titre et du sous-titre dans la section."
      >
        <ServicesOptionGrid
          label="Alignement horizontal"
          options={[
            { value: 'left', label: 'Gauche', description: 'Alignement éditorial par défaut.' },
            { value: 'center', label: 'Centré', description: 'Titre et sous-titre centrés.' },
          ]}
          value={header.headerAlignment}
          onChange={(headerAlignment) => patchHeader({ headerAlignment })}
        />
      </ServicesHeaderConfigSection>
    </>
  );
}

function ServicesCombinedHeaderPanel({
  services,
  onChange,
  mode,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  mode: 'combined' | 'separated';
}) {
  const isSeparated = mode === 'separated';

  return (
    <>
      {isSeparated ? (
        <p className="rounded-2xl border border-blue-200/80 bg-blue-50/50 px-4 py-3 text-sm text-neutral-600">
          <span className="font-semibold text-neutral-900">Titre combiné de section</span> — un seul en-tête
          pour Skills et Services dans la même section. Les blocs ont des cadres séparés (Layout / Cadre) mais
          partagent ce titre.
        </p>
      ) : null}

      <ServicesHeaderPreview
        title={resolveServicesSectionTitle(services)}
        subtitle={resolveServicesSectionSubtitle(services)}
        titleColor={services.titleColor}
        subtitleColor={services.subtitleColor}
        alignment={services.headerAlignment}
      />

      <ServicesHeaderConfigSection
        heading="Titre principal"
        description={
          isSeparated
            ? 'Titre affiché une fois au-dessus des deux blocs.'
            : 'Grand titre en haut de la section combinée Services & skills.'
        }
      >
        <ServicesOptionGrid
          label="Preset du titre"
          options={PORTFOLIO_SERVICES_TITLE_PRESET_OPTIONS}
          value={services.titlePreset}
          onChange={(titlePreset) => onChange({ titlePreset })}
        />
        {services.titlePreset === 'custom' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Texte du titre
            </label>
            <input
              type="text"
              value={services.titleCustom}
              onChange={(event) => onChange({ titleCustom: event.target.value })}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
            />
          </div>
        ) : null}
        <ServicesOptionGrid
          label="Police du titre"
          options={PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS}
          value={services.titleFont}
          onChange={(titleFont) => onChange({ titleFont })}
        />
        <ServicesColorField
          services={services}
          onChange={onChange}
          slot="title"
          label="Couleur du titre"
          value={services.titleColor}
        />
      </ServicesHeaderConfigSection>

      <ServicesHeaderConfigSection
        heading="Sous-titre"
        description="Ligne descriptive sous le titre — distincte et plus petite."
      >
        <ServicesOptionGrid
          label="Preset du sous-titre"
          options={PORTFOLIO_SERVICES_SUBTITLE_PRESET_OPTIONS}
          value={services.subtitlePreset}
          onChange={(subtitlePreset) => onChange({ subtitlePreset })}
        />
        {services.subtitlePreset === 'custom' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Texte du sous-titre
            </label>
            <textarea
              value={services.subtitleCustom}
              onChange={(event) => onChange({ subtitleCustom: event.target.value })}
              rows={2}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
            />
          </div>
        ) : null}
        {services.subtitlePreset === 'default' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Texte du sous-titre (preset Default)
            </label>
            <textarea
              value={services.subtitle}
              onChange={(event) => onChange({ subtitle: event.target.value })}
              rows={2}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
            />
          </div>
        ) : null}
        <ServicesOptionGrid
          label="Police du sous-titre"
          options={PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS}
          value={services.subtitleFont}
          onChange={(subtitleFont) => onChange({ subtitleFont })}
        />
        <ServicesColorField
          services={services}
          onChange={onChange}
          slot="subtitle"
          label="Couleur du sous-titre"
          value={services.subtitleColor}
        />
      </ServicesHeaderConfigSection>

      <ServicesHeaderConfigSection
        heading="Alignement"
        description="Position du titre et du sous-titre."
      >
        <ServicesOptionGrid
          label="Alignement horizontal"
          options={[
            { value: 'left', label: 'Gauche', description: 'Alignement éditorial par défaut.' },
            { value: 'center', label: 'Centré', description: 'Titre et sous-titre centrés.' },
          ]}
          value={services.headerAlignment}
          onChange={(headerAlignment) => onChange({ headerAlignment })}
        />
      </ServicesHeaderConfigSection>
    </>
  );
}

function ServicesToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-950">{label}</span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900"
      />
    </label>
  );
}

function ServicesOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className={`mt-3 grid gap-2 ${columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
              }`}
            >
              <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const CARD_DESIGN_PREVIEW_BASE: Record<PortfolioServicesCardDesign, string> = {
  editorial: 'relative overflow-hidden rounded-xl bg-white',
  minimal: 'rounded-lg bg-white',
  compact: 'rounded-lg',
  glass: 'rounded-xl',
  frost: 'rounded-xl',
  accent: 'rounded-lg bg-white',
};

function ServicesCardDesignGrid({
  value,
  intensities,
  tints,
  accentColor,
  onChange,
  onIntensityChange,
  onTintChange,
}: {
  value: PortfolioServicesCardDesign;
  intensities: PortfolioServicesCardDesignIntensities;
  tints: PortfolioServicesCardDesignTints;
  accentColor: string;
  onChange: (value: PortfolioServicesCardDesign) => void;
  onIntensityChange: (intensity: number) => void;
  onTintChange: (tint: number) => void;
}) {
  const intensityHints = PORTFOLIO_SERVICES_CARD_DESIGN_INTENSITY_HINTS[value];
  const tintHints = PORTFOLIO_SERVICES_CARD_DESIGN_TINT_HINTS[value];
  const currentIntensity = intensities[value];
  const currentTint = tints[value];
  const supportsTint = servicesCardDesignSupportsTint(value);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Card design (style)</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PORTFOLIO_SERVICES_CARD_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            const previewIntensity = intensities[option.value];
            const previewTint = tints[option.value];
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                    : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                }`}
              >
                <div
                  className={`mb-3 h-12 w-full ${CARD_DESIGN_PREVIEW_BASE[option.value]}`}
                  style={servicesCardDesignIntensityStyle(
                    option.value,
                    previewIntensity,
                    accentColor,
                    previewTint
                  )}
                  aria-hidden
                />
                <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{intensityHints.label}</p>
          <span className="text-sm font-semibold text-neutral-700">{currentIntensity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={currentIntensity}
          onChange={(event) => onIntensityChange(Number(event.target.value))}
          className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
          aria-label={intensityHints.label}
        />
        <div className="mt-2 flex justify-between gap-4 text-xs text-neutral-500">
          <span>{intensityHints.low}</span>
          <span className="text-right">{intensityHints.high}</span>
        </div>
      </div>

      {supportsTint ? (
        <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{tintHints.label}</p>
            <span className="text-sm font-semibold text-neutral-700">{currentTint}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={currentTint}
            onChange={(event) => onTintChange(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
            aria-label={tintHints.label}
          />
          <div className="mt-2 flex justify-between gap-4 text-xs text-neutral-500">
            <span>{tintHints.low}</span>
            <span className="text-right">{tintHints.high}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ServicesManualColorField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-mono text-neutral-900"
          aria-label={`${label} hex`}
        />
        <span
          className="h-11 w-20 rounded-xl border border-neutral-200/80 shadow-inner"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function ServicesUsePaletteToggle({
  services,
  onChange,
  description,
  enabledHint,
  disabledHint,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  description: string;
  enabledHint?: string;
  disabledHint?: string;
}) {
  return (
    <SectionHeroPaletteToggle
      enabled={services.useHeroPalette !== false}
      onChange={(useHeroPalette) =>
        onChange(
          asServicesPatch(
            useHeroPalette
              ? { useHeroPalette, ...applyServicesPaletteToSettings(services) }
              : { useHeroPalette }
          )
        )
      }
      title="Use color palette"
      description={description}
      enabledHint={
        enabledHint ??
        'Palette mode — pick which token each color uses (or edit tokens under Portfolio → Palette). Free hex pickers stay locked.'
      }
      disabledHint={
        disabledHint ??
        'Manual mode — color pickers set hex values directly and are no longer overwritten by the palette.'
      }
    />
  );
}

function ServicesColorField({
  services,
  onChange,
  slot,
  label,
  description,
  value,
  manualFallback,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  slot: ServicesColorSlot;
  label: string;
  description?: string;
  value: string;
  /** When palette is off, route manual edits (e.g. distinct block headers). */
  manualFallback?: (hex: string) => void;
}) {
  const paletteOn = services.useHeroPalette !== false;

  if (!paletteOn) {
    return (
      <ServicesManualColorField
        label={label}
        description={description}
        value={value}
        onChange={(hex) => {
          if (manualFallback) {
            manualFallback(hex);
            return;
          }
          onChange(asServicesPatch(patchServicesColorField(services, slot, hex)));
        }}
      />
    );
  }

  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  const bindings = mergeServicesColorBindings(
    DEFAULT_SERVICES_COLOR_BINDINGS,
    services.servicesColorBindings
  );
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
          {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
        </div>
        <span
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-neutral-200"
          style={{ backgroundColor: resolved }}
          title={resolved}
          aria-hidden
        />
      </div>
      <select
        value={token}
        onChange={(event) =>
          onChange(
            asServicesPatch(
              patchServicesColorBinding(services, slot, event.target.value as HeroPaletteTokenId)
            )
          )
        }
        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
        aria-label={`${label} palette token`}
      >
        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-neutral-500">
        Bound to token · edit hex under{' '}
        <span className="font-semibold text-neutral-700">Palette</span>
      </p>
    </div>
  );
}

function ServicesFrameColorField({
  services,
  onChange,
  slot,
  label,
  value,
  onManualChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  slot: ServicesColorSlot;
  label: string;
  value: string;
  onManualChange: (hex: string) => void;
}) {
  if (services.useHeroPalette !== false) {
    return (
      <ServicesColorField
        services={services}
        onChange={onChange}
        slot={slot}
        label={label}
        value={value}
      />
    );
  }
  return (
    <ServicesManualColorField label={label} value={value} onChange={onManualChange} />
  );
}

function ServicesPalettePanel({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  const bindings = mergeServicesColorBindings(
    DEFAULT_SERVICES_COLOR_BINDINGS,
    services.servicesColorBindings
  );
  const paletteOn = services.useHeroPalette !== false;

  return (
    <div className="space-y-6">
      <ServicesUsePaletteToggle
        services={services}
        onChange={onChange}
        description="When on, Portfolio colors follow these eight tokens. Turn off to edit colors manually in Header, Frame, Skills, Services, and Background."
        enabledHint="Change a token below to restyle everything bound to it — titles, cards, stage chrome, and section fill."
        disabledHint="Palette tokens are kept, but Portfolio uses manual hex colors until you turn this back on."
      />

      <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
        Section title, card chrome, stage frame, typography, and section background all bind to these
        eight semantic tokens. Same system as Hero, Work, and Navigation.
      </p>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Palette presets</p>
        <p className="mt-1 text-sm text-neutral-500">
          Same dark / light palettes as Hero and Global → Light mode.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              onChange(
                asServicesPatch(
                  paletteOn
                    ? { ...patchServicesPalette(services, DARK_SERVICES_PALETTE), useHeroPalette: true }
                    : { servicesPalette: { ...DARK_SERVICES_PALETTE } }
                )
              )
            }
            className="rounded-2xl border border-neutral-200 bg-neutral-950 px-4 py-3 text-left transition hover:border-neutral-400"
          >
            <span className="text-sm font-bold text-white">Dark mode palette</span>
            <span className="mt-2 flex gap-1.5">
              {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                <span
                  key={token.value}
                  className="h-4 w-4 rounded-full border border-white/20"
                  style={{ backgroundColor: DARK_SERVICES_PALETTE[token.value] }}
                  title={token.label}
                />
              ))}
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              onChange(
                asServicesPatch(
                  paletteOn
                    ? { ...patchServicesPalette(services, LIGHT_HERO_PALETTE), useHeroPalette: true }
                    : { servicesPalette: { ...LIGHT_HERO_PALETTE } }
                )
              )
            }
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left transition hover:border-neutral-400"
          >
            <span className="text-sm font-bold text-neutral-900">Light mode palette</span>
            <span className="mt-2 flex gap-1.5">
              {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                <span
                  key={token.value}
                  className="h-4 w-4 rounded-full border border-neutral-200"
                  style={{ backgroundColor: LIGHT_HERO_PALETTE[token.value] }}
                  title={token.label}
                />
              ))}
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
          <ServicesManualColorField
            key={token.value}
            label={token.label}
            description={token.description}
            value={palette[token.value]}
            onChange={(color) =>
              onChange(
                asServicesPatch(
                  paletteOn
                    ? patchServicesPalette(services, { [token.value]: color })
                    : {
                        servicesPalette: {
                          ...mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette),
                          [token.value]: color,
                        },
                      }
                )
              )
            }
          />
        ))}
      </div>

      {paletteOn ? (
        <>
          <button
            type="button"
            onClick={() => onChange(asServicesPatch(applyServicesPaletteToSettings(services)))}
            className="inline-flex w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
          >
            Apply palette to all bound colors
          </button>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Color bindings
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Pick which token each portfolio color uses. Hex fields in other tabs update automatically.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PORTFOLIO_SERVICES_COLOR_SLOT_OPTIONS.map((slot) => {
                const resolved = resolveHeroPaletteColor(palette, bindings[slot.value]);
                return (
                  <div
                    key={slot.value}
                    className="rounded-2xl border border-neutral-200/80 bg-white px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-neutral-800">{slot.label}</span>
                      <span
                        className="h-5 w-5 shrink-0 rounded-full border border-neutral-200"
                        style={{ backgroundColor: resolved }}
                        aria-hidden
                      />
                    </div>
                    <select
                      value={bindings[slot.value]}
                      onChange={(event) =>
                        onChange(
                          asServicesPatch(
                            patchServicesColorBinding(
                              services,
                              slot.value,
                              event.target.value as HeroPaletteTokenId
                            )
                          )
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
                    >
                      {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                        <option key={token.value} value={token.value}>
                          {token.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-neutral-500">{slot.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
          Palette is off — slot bindings are hidden. Turn it back on to bind colors to tokens, or edit
          hex fields under Header / Frame / Skills / Services / Background.
        </p>
      )}
    </div>
  );
}

export function ServicesSettingsPanel({
  services,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  subSection?: ServicesSubSection;
  onSubSectionChange?: (value: ServicesSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ServicesSubSection>('header');
  const subSection = normalizeServicesSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: ServicesSubSection) => {
    const next = normalizeServicesSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const activeMeta =
    SERVICES_SUB_SECTIONS.find((item) => item.id === subSection) ?? SERVICES_SUB_SECTIONS[0];
  const [blockScope, setBlockScope] = useState<PortfolioServicesBlockScope>('skills');
  const [skillsStyleTarget, setSkillsStyleTarget] = useState<'skillTitle' | 'skillBody'>('skillTitle');
  const [servicesTextStyleTarget, setServicesTextStyleTarget] = useState<
    'blockSubheading' | 'cardTitle' | 'cardBody' | 'price' | 'delivery'
  >('cardTitle');
  const usesSplitBlocks = servicesUsesSplitBlockConfig(services.sectionOrganization);
  const usesDistinctSections = servicesUsesDistinctSections(services.sectionOrganization);

  const elementStyles = normalizeServicesElementStyles(services.elementStyles);

  const patchBlock = (patch: Parameters<typeof patchServicesBlockSettings>[2]) =>
    onChange(patchServicesBlockSettings(services, blockScope, patch));

  /** Combined mode writes section + both blocks so design/frame stay in sync with the preview. */
  const patchFrame = (patch: Parameters<typeof patchServicesBlockSettings>[2]) => {
    if (usesSplitBlocks) {
      patchBlock(patch);
      return;
    }
    onChange({
      ...patch,
      skillsBlock: { ...services.skillsBlock, ...patch },
      servicesBlock: { ...services.servicesBlock, ...patch },
    });
  };

  const readBlock = <K extends keyof import('@/components/portfolio/portfolio-services-settings').PortfolioServicesBlockSettings>(
    field: K
  ) => readServicesBlockField(services, blockScope, field);

  const activeFrameSettings = usesSplitBlocks
    ? services[blockScope === 'skills' ? 'skillsBlock' : 'servicesBlock']
    : services;
  const activeCardDesign = readBlock('cardDesign');

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Sub-section
        </label>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as ServicesSubSection)}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
        >
          {SERVICES_SUB_SECTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-neutral-500">{activeMeta.description}</p>
      </div>

      {subSection === 'general' ? (
        <>
          <ServicesToggleRow
            label="Show section"
            description="Display the services & skills block on your public portfolio."
            checked={services.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <ServicesUsePaletteToggle
            services={services}
            onChange={onChange}
            description="When on, section colors follow palette tokens synced with Hero. Turn off to pick hex values freely in each tab."
          />
          <ServicesToggleRow
            label="Show skills"
            description="Display tool / skill cards from your profile strengths."
            checked={services.showSkills}
            onChange={(showSkills) => onChange({ showSkills })}
          />
          <ServicesToggleRow
            label="Show services"
            description="Display your listed services and pricing."
            checked={services.showServices}
            onChange={(showServices) => onChange({ showServices })}
          />
          <ServicesToggleRow
            label="Show response time"
            description="Typically replies label in the section header."
            checked={services.showResponseTime}
            onChange={(showResponseTime) => onChange({ showResponseTime })}
          />
          <ServicesOptionGrid
            label="Organisation de la section"
            options={PORTFOLIO_SERVICES_SECTION_ORGANIZATION_OPTIONS}
            value={services.sectionOrganization}
            onChange={(sectionOrganization) => {
              if (sectionOrganization === 'separated') {
                onChange({
                  sectionOrganization,
                  layoutMode: 'separated',
                  ...snapshotServicesBlocksFromSection(services),
                  showSkillsSubheading: false,
                  showServicesSubheading: false,
                });
                return;
              }
              if (sectionOrganization === 'distinct') {
                onChange({
                  sectionOrganization,
                  layoutMode: 'separated',
                  ...snapshotServicesBlocksFromSection(services),
                  ...snapshotServicesHeadersFromSection(services),
                });
                return;
              }
              onChange({ sectionOrganization, layoutMode: 'combined' });
            }}
          />
          {services.sectionOrganization === 'combined' ? (
            <ServicesOptionGrid
              label="Ordre des blocs"
              options={[
                { value: 'skills-first', label: 'Skills first', description: 'Tools row above services.' },
                { value: 'services-first', label: 'Services first', description: 'Services row above skills.' },
              ]}
              value={services.stackOrder}
              onChange={(stackOrder) => onChange({ stackOrder })}
            />
          ) : (
            <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
              {usesDistinctSections
                ? 'Deux sections portfolio indépendantes — réordonnez Skills et Services dans Global → Section order.'
                : 'Blocs séparés dans la même section — cadre, design et stage configurables indépendamment (onglets Tools / Services dans Layout et Cadre).'}
            </p>
          )}
        </>
      ) : null}

      {subSection === 'header' ? (
        <>
          {usesDistinctSections ? (
            <>
              <p className="rounded-2xl border border-violet-200/80 bg-violet-50/40 px-4 py-3 text-sm text-neutral-600">
                <span className="font-semibold text-neutral-900">Sections distinctes</span> — chaque section a
                son propre titre et sous-titre. Configurez-les séparément ci-dessous.
              </p>
              <ServicesBlockScopeTabs scope={blockScope} onChange={setBlockScope} />
              <p className="text-sm text-neutral-500">
                En-tête de la section{' '}
                <span className="font-semibold text-neutral-800">
                  {blockScope === 'skills' ? 'Skills & tools' : 'Services'}
                </span>
              </p>
              <ServicesDistinctHeaderPanel
                services={services}
                blockScope={blockScope}
                onChange={onChange}
              />
            </>
          ) : services.sectionOrganization === 'separated' ? (
            <ServicesCombinedHeaderPanel services={services} onChange={onChange} mode="separated" />
          ) : (
            <ServicesCombinedHeaderPanel services={services} onChange={onChange} mode="combined" />
          )}
        </>
      ) : null}

      {subSection === 'layout' ? (
        <>
          {usesSplitBlocks ? (
            <>
              <ServicesBlockScopeTabs scope={blockScope} onChange={setBlockScope} />
              <p className="text-sm text-neutral-500">
                Design, stage et cadre pour le bloc{' '}
                {blockScope === 'skills' ? 'Tools / Skills' : 'Services'} uniquement.
              </p>
              <ServicesOptionGrid
                label={blockScope === 'skills' ? 'Design des outils / skills' : 'Design des services'}
                options={PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS}
                value={readBlock('galleryLayout')}
                onChange={(galleryLayout) => patchBlock({ galleryLayout })}
                columns={2}
              />
              <ServicesOptionGrid
                label={blockScope === 'skills' ? 'Colonnes tools (écran large)' : 'Colonnes services (écran large)'}
                options={PORTFOLIO_SERVICES_COLUMNS_OPTIONS}
                value={readBlock('columns')}
                onChange={(columns) => patchBlock({ columns })}
                columns={2}
              />

              <ServicesOptionGrid
                label="Mode d'affichage"
                options={PORTFOLIO_SERVICES_DISPLAY_MODE_OPTIONS}
                value={readBlock('displayMode')}
                onChange={(displayMode) => patchBlock({ displayMode })}
                columns={3}
              />

              {readBlock('displayMode') === 'marquee' ? (
                <div className="space-y-3 rounded-2xl border border-orange-200/80 bg-orange-50/50 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-950">Carrousel infini</p>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    Animation pour{' '}
                    <span className="font-semibold">
                      {blockScope === 'skills' ? 'Tools / Skills' : 'Services'}
                    </span>{' '}
                    — nécessite le design <span className="font-semibold">Carte verticale</span>.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        servicesMarqueeActiveFor(
                          resolveServicesBlockPresentation(services, blockScope),
                          blockScope
                        )
                          ? 'bg-emerald-500'
                          : 'bg-neutral-300'
                      }`}
                      aria-hidden
                    />
                    {readBlock('galleryLayout') === 'card' ? (
                      <span className="font-medium text-emerald-700">animé</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => patchBlock({ galleryLayout: 'card' })}
                        className="font-medium text-orange-600 underline-offset-2 hover:underline"
                      >
                        passer en Carte verticale
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
                  Carrousel : choisissez <span className="font-semibold text-neutral-700">Carrousel infini</span>{' '}
                  puis <span className="font-semibold text-neutral-700">Carte verticale</span> pour ce bloc.
                </p>
              )}
            </>
          ) : (
            <>
          <ServicesOptionGrid
            label="Design des services"
            options={PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS}
            value={services.servicesGalleryLayout}
            onChange={(servicesGalleryLayout) => onChange({ servicesGalleryLayout })}
            columns={2}
          />

          <ServicesOptionGrid
            label="Colonnes services (écran large)"
            options={PORTFOLIO_SERVICES_COLUMNS_OPTIONS}
            value={services.servicesColumns}
            onChange={(servicesColumns) => onChange({ servicesColumns })}
            columns={2}
          />

          <ServicesOptionGrid
            label="Design des outils / skills"
            options={PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS}
            value={services.skillsGalleryLayout}
            onChange={(skillsGalleryLayout) => onChange({ skillsGalleryLayout })}
            columns={2}
          />

          <ServicesOptionGrid
            label="Colonnes tools (écran large)"
            options={PORTFOLIO_SERVICES_COLUMNS_OPTIONS}
            value={services.skillsColumns}
            onChange={(skillsColumns) => onChange({ skillsColumns })}
            columns={2}
          />

          <ServicesOptionGrid
            label="Mode d'affichage"
            options={PORTFOLIO_SERVICES_DISPLAY_MODE_OPTIONS}
            value={services.displayMode}
            onChange={(displayMode) => onChange({ displayMode })}
            columns={3}
          />

          {services.displayMode === 'marquee' ? (
            <div className="space-y-3 rounded-2xl border border-orange-200/80 bg-orange-50/50 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-950">Carrousel infini</p>
              <p className="text-sm leading-relaxed text-neutral-600">
                L&apos;animation de défilement s&apos;applique bloc par bloc, uniquement quand le design est{' '}
                <span className="font-semibold">Carte verticale</span>.
              </p>
              <ul className="space-y-1.5 text-sm text-neutral-700">
                <li className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      servicesMarqueeActiveFor(services, 'services') ? 'bg-emerald-500' : 'bg-neutral-300'
                    }`}
                    aria-hidden
                  />
                  Services —{' '}
                  {services.servicesGalleryLayout === 'card' ? (
                    <span className="font-medium text-emerald-700">animé</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChange({ servicesGalleryLayout: 'card' })}
                      className="font-medium text-orange-600 underline-offset-2 hover:underline"
                    >
                      passer en Carte verticale
                    </button>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      servicesMarqueeActiveFor(services, 'skills') ? 'bg-emerald-500' : 'bg-neutral-300'
                    }`}
                    aria-hidden
                  />
                  Tools / skills —{' '}
                  {services.skillsGalleryLayout === 'card' ? (
                    <span className="font-medium text-emerald-700">animé</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChange({ skillsGalleryLayout: 'card' })}
                      className="font-medium text-orange-600 underline-offset-2 hover:underline"
                    >
                      passer en Carte verticale
                    </button>
                  )}
                </li>
              </ul>
            </div>
          ) : (
            <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
              Pour retrouver l&apos;effet carrousel, choisissez{' '}
              <span className="font-semibold text-neutral-700">Carrousel infini</span> ci-dessus, puis le design{' '}
              <span className="font-semibold text-neutral-700">Carte verticale</span> pour les blocs à animer.
            </p>
          )}
            </>
          )}

          <ServicesOptionGrid
            label="Stage frame"
            options={PORTFOLIO_SERVICES_STAGE_DESIGN_OPTIONS}
            value={readBlock('stageDesign')}
            onChange={(stageDesign) =>
              patchFrame({
                stageDesign,
                ...stageChromePresetForDesign(stageDesign),
              })
            }
          />

          {readBlock('stageDesign') === 'open' || readBlock('stageDesign') === 'none' ? (
            <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
              Open / None n&apos;ajoutent pas de cadre par défaut. Activez un fond, une bordure ou un
              motif ci-dessous pour en créer un.
            </p>
          ) : null}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Chrome du stage</p>
              <p className="mt-1 text-sm text-neutral-500">
                Fond, bordure, arrondi, padding et motif du panneau autour des cartes (Soft panel,
                Framed, ou Open personnalisé).
              </p>
            </div>

            <ServicesToggleRow
              label="Fond du stage"
              description="Couleur de fond derrière les carrousels (ex. Soft panel gris)."
              checked={readBlock('stageBackgroundEnabled')}
              onChange={(stageBackgroundEnabled) => patchFrame({ stageBackgroundEnabled })}
            />

            {readBlock('stageBackgroundEnabled') ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <ServicesFrameColorField
                  services={services}
                  onChange={onChange}
                  slot="stageBackground"
                  label="Couleur de fond"
                  value={readBlock('stageBackgroundColor')}
                  onManualChange={(stageBackgroundColor) =>
                    patchFrame({ stageBackgroundColor, stageBackgroundEnabled: true })
                  }
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-neutral-800">
                    Opacité fond — {readBlock('stageBackgroundOpacity')}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={readBlock('stageBackgroundOpacity')}
                    onChange={(event) =>
                      patchFrame({ stageBackgroundOpacity: Number(event.target.value) })
                    }
                    className="w-full accent-neutral-900"
                  />
                </label>
              </div>
            ) : null}

            <ServicesOptionGrid
              label="Bordure du stage"
              options={PORTFOLIO_SERVICES_STAGE_BORDER_OPTIONS}
              value={readBlock('stageBorder')}
              onChange={(stageBorder) => patchFrame({ stageBorder })}
              columns={3}
            />

            {readBlock('stageBorder') !== 'none' ? (
              <ServicesFrameColorField
                services={services}
                onChange={onChange}
                slot="stageBorder"
                label="Couleur de bordure"
                value={readBlock('stageBorderColor')}
                onManualChange={(stageBorderColor) => patchFrame({ stageBorderColor })}
              />
            ) : null}

            <ServicesOptionGrid
              label="Arrondi"
              options={PORTFOLIO_SERVICES_STAGE_RADIUS_OPTIONS}
              value={readBlock('stageBorderRadius')}
              onChange={(stageBorderRadius) => patchFrame({ stageBorderRadius })}
            />

            <ServicesOptionGrid
              label="Padding"
              options={PORTFOLIO_SERVICES_STAGE_PADDING_OPTIONS}
              value={readBlock('stagePadding')}
              onChange={(stagePadding) => patchFrame({ stagePadding })}
            />

            <ServicesOptionGrid
              label="Motif de fond"
              options={PORTFOLIO_SERVICES_STAGE_PATTERN_OPTIONS}
              value={readBlock('stagePattern')}
              onChange={(stagePattern) => patchFrame({ stagePattern })}
              columns={2}
            />

            {readBlock('stagePattern') !== 'none' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <ServicesFrameColorField
                  services={services}
                  onChange={onChange}
                  slot="stagePattern"
                  label="Couleur du motif"
                  value={readBlock('stagePatternColor')}
                  onManualChange={(stagePatternColor) => patchFrame({ stagePatternColor })}
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-neutral-800">
                    Opacité motif — {readBlock('stagePatternOpacity')}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={readBlock('stagePatternOpacity')}
                    onChange={(event) =>
                      patchFrame({ stagePatternOpacity: Number(event.target.value) })
                    }
                    className="w-full accent-neutral-900"
                  />
                </label>
              </div>
            ) : null}
          </div>

          <ServicesCardDesignGrid
            value={activeCardDesign}
            intensities={readBlock('cardDesignIntensities')}
            tints={readBlock('cardDesignTints')}
            accentColor={readBlock('cardAccentColor')}
            onChange={(cardDesign) => patchFrame({ cardDesign })}
            onIntensityChange={(intensity) => {
              const intensities = readBlock('cardDesignIntensities');
              patchFrame({
                cardDesignIntensities: {
                  ...intensities,
                  [activeCardDesign]: intensity,
                },
              });
            }}
            onTintChange={(tint) => {
              const tints = readBlock('cardDesignTints');
              patchFrame({
                cardDesignTints: {
                  ...tints,
                  [activeCardDesign]: tint,
                },
              });
            }}
          />
          {activeCardDesign === 'accent' ||
          readBlock('cardBorder') === 'accent' ||
          servicesCardDesignSupportsTint(activeCardDesign) ? (
            <ServicesFrameColorField
              services={services}
              onChange={onChange}
              slot="cardAccent"
              label="Couleur de teinte / accent"
              value={readBlock('cardAccentColor')}
              onManualChange={(cardAccentColor) => patchFrame({ cardAccentColor })}
            />
          ) : null}
        </>
      ) : null}

      {subSection === 'frame' ? (
        <div className="space-y-6">
          {usesSplitBlocks ? (
            <>
              <ServicesBlockScopeTabs scope={blockScope} onChange={setBlockScope} />
              <p className="text-sm text-neutral-500">
                Cadre et fond du bloc {blockScope === 'skills' ? 'Tools / Skills' : 'Services'}.
              </p>
            </>
          ) : null}
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Cadre & fond</p>
              <p className="mt-1 text-sm text-neutral-500">
                {usesSplitBlocks
                  ? 'Bordure, couleur, fond, arrondi et padding pour les cartes du bloc actif.'
                  : 'Bordure, couleur, fond, arrondi et padding pour toutes les cartes services et tools.'}
              </p>
            </div>

            <ServicesOptionGrid
              label="Bordure"
              options={PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS}
              value={activeFrameSettings.cardBorder}
              onChange={(cardBorder) => patchFrame({ cardBorder })}
              columns={2}
            />

            {servicesCardDesignOwnsBackground(activeCardDesign) ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Le design <span className="font-semibold">{activeCardDesign}</span> gère son propre fond
                (compact / glass). Changez de design carte pour appliquer les couleurs de cadre
                ci-dessous.
              </p>
            ) : null}

            <ServicesOptionGrid
              label="Type de fond"
              options={PORTFOLIO_SERVICES_CARD_BACKGROUND_FILL_OPTIONS}
              value={activeFrameSettings.cardBackgroundFill}
              onChange={(cardBackgroundFill) => {
                if (cardBackgroundFill === 'solid') {
                  patchFrame({
                    cardBackgroundFill,
                    cardBackgroundEnabled: true,
                    cardBackgroundColor:
                      activeFrameSettings.cardBackgroundColor ||
                      activeFrameSettings.cardBackgroundColorA,
                  });
                  return;
                }
                patchFrame({
                  cardBackgroundFill,
                  // Split and alternation conflict — keep uniform when switching to split.
                  cardBackgroundAlternation: 'uniform',
                });
              }}
              columns={2}
            />

            {activeFrameSettings.cardBackgroundFill === 'solid' ? (
              <>
                <ServicesOptionGrid
                  label="Alternance de fond"
                  options={PORTFOLIO_SERVICES_CARD_BACKGROUND_ALTERNATION_OPTIONS}
                  value={activeFrameSettings.cardBackgroundAlternation}
                  onChange={(cardBackgroundAlternation) =>
                    patchFrame({
                      cardBackgroundAlternation,
                      cardBackgroundEnabled: true,
                    })
                  }
                  columns={2}
                />

                <ServicesToggleRow
                  label="Fond du cadre"
                  description="Appliquer une couleur de fond derrière le contenu de la carte (Tools et Services)."
                  checked={
                    activeFrameSettings.cardBackgroundEnabled ||
                    activeFrameSettings.cardBackgroundAlternation === 'alternate'
                  }
                  onChange={(cardBackgroundEnabled) => patchFrame({ cardBackgroundEnabled })}
                />

                {activeFrameSettings.cardBackgroundEnabled ||
                activeFrameSettings.cardBackgroundAlternation === 'alternate' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ServicesFrameColorField
                      services={services}
                      onChange={onChange}
                      slot="cardBackground"
                      label={
                        activeFrameSettings.cardBackgroundAlternation === 'alternate'
                          ? 'Couleur cartes claires'
                          : 'Couleur de fond'
                      }
                      value={activeFrameSettings.cardBackgroundColor}
                      onManualChange={(cardBackgroundColor) =>
                        patchFrame({
                          cardBackgroundColor,
                          cardBackgroundColorA: cardBackgroundColor,
                          cardBackgroundEnabled: true,
                        })
                      }
                    />
                    {activeFrameSettings.cardBackgroundAlternation === 'alternate' ? (
                      <ServicesFrameColorField
                        services={services}
                        onChange={onChange}
                        slot="cardAccent"
                        label="Couleur cartes alternées"
                        value={activeFrameSettings.cardBackgroundColorB}
                        onManualChange={(cardBackgroundColorB) => patchFrame({ cardBackgroundColorB })}
                      />
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-white/70 p-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Fond divisé</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Deux zones de couleur sur chaque carte. L’alternance carte à carte est désactivée
                    en mode divisé.
                  </p>
                </div>

                <ServicesOptionGrid
                  label="Forme de séparation"
                  options={PORTFOLIO_SERVICES_CARD_DIVIDER_SHAPE_OPTIONS}
                  value={activeFrameSettings.cardDividerShape}
                  onChange={(cardDividerShape) => patchFrame({ cardDividerShape })}
                  columns={2}
                />

                {activeFrameSettings.cardDividerShape === 'diagonal' ? (
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Angle de la diagonale
                      </p>
                      <span className="text-sm font-semibold text-neutral-700">
                        {activeFrameSettings.cardDividerAngle}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={359}
                      step={1}
                      value={activeFrameSettings.cardDividerAngle}
                      onChange={(event) =>
                        patchFrame({ cardDividerAngle: Number(event.target.value) })
                      }
                      className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                      aria-label="Angle de la diagonale"
                    />
                  </div>
                ) : (
                  <ServicesOptionGrid
                    label="Axe de séparation"
                    options={PORTFOLIO_SERVICES_CARD_SPLIT_AXIS_OPTIONS}
                    value={activeFrameSettings.cardBackgroundSplitAxis}
                    onChange={(cardBackgroundSplitAxis) => patchFrame({ cardBackgroundSplitAxis })}
                    columns={2}
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <ServicesFrameColorField
                    services={services}
                    onChange={onChange}
                    slot="cardBackground"
                    label={
                      activeFrameSettings.cardDividerShape === 'diagonal'
                        ? 'Couleur zone A'
                        : activeFrameSettings.cardBackgroundSplitAxis === 'y'
                          ? 'Couleur zone haut'
                          : 'Couleur zone gauche'
                    }
                    value={activeFrameSettings.cardBackgroundColorA}
                    onManualChange={(cardBackgroundColorA) => patchFrame({ cardBackgroundColorA })}
                  />
                  <ServicesFrameColorField
                    services={services}
                    onChange={onChange}
                    slot="cardAccent"
                    label={
                      activeFrameSettings.cardDividerShape === 'diagonal'
                        ? 'Couleur zone B'
                        : activeFrameSettings.cardBackgroundSplitAxis === 'y'
                          ? 'Couleur zone bas'
                          : 'Couleur zone droite'
                    }
                    value={activeFrameSettings.cardBackgroundColorB}
                    onManualChange={(cardBackgroundColorB) => patchFrame({ cardBackgroundColorB })}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Position de la séparation
                    </p>
                    <span className="text-sm font-semibold text-neutral-700">
                      {activeFrameSettings.cardBackgroundSplitPosition}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={92}
                    step={1}
                    value={activeFrameSettings.cardBackgroundSplitPosition}
                    onChange={(event) =>
                      patchFrame({ cardBackgroundSplitPosition: Number(event.target.value) })
                    }
                    className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                    aria-label="Position de la séparation"
                  />
                </div>

                <div
                  className="h-16 w-full overflow-hidden rounded-xl border border-neutral-200/80"
                  style={servicesCardSplitBackgroundLayerStyle(activeFrameSettings)}
                  aria-hidden
                />

                <ServicesToggleRow
                  label="Ligne de séparation"
                  description="Afficher un trait sur la frontière entre les deux zones."
                  checked={activeFrameSettings.cardDividerEnabled}
                  onChange={(cardDividerEnabled) => patchFrame({ cardDividerEnabled })}
                />

                {activeFrameSettings.cardDividerEnabled ? (
                  <div className="space-y-4">
                    {activeFrameSettings.cardDividerShape === 'curve' ||
                    activeFrameSettings.cardDividerShape === 'wave' ? (
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            {activeFrameSettings.cardDividerShape === 'curve'
                              ? 'Courbure'
                              : 'Amplitude vague'}
                          </p>
                          <span className="text-xs font-semibold text-neutral-600">
                            {activeFrameSettings.cardDividerCurveDepth}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={40}
                          step={1}
                          value={activeFrameSettings.cardDividerCurveDepth}
                          onChange={(event) =>
                            patchFrame({ cardDividerCurveDepth: Number(event.target.value) })
                          }
                          className="w-full accent-neutral-900"
                          aria-label="Profondeur de courbe"
                        />
                      </div>
                    ) : null}

                    <ServicesFrameColorField
                      services={services}
                      onChange={onChange}
                      slot="cardBorder"
                      label="Couleur du trait"
                      value={activeFrameSettings.cardDividerColor}
                      onManualChange={(cardDividerColor) => patchFrame({ cardDividerColor })}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Épaisseur
                          </p>
                          <span className="text-xs font-semibold text-neutral-600">
                            {activeFrameSettings.cardDividerThickness}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={8}
                          step={1}
                          value={activeFrameSettings.cardDividerThickness}
                          onChange={(event) =>
                            patchFrame({ cardDividerThickness: Number(event.target.value) })
                          }
                          className="w-full accent-neutral-900"
                        />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Opacité
                          </p>
                          <span className="text-xs font-semibold text-neutral-600">
                            {activeFrameSettings.cardDividerOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={1}
                          value={activeFrameSettings.cardDividerOpacity}
                          onChange={(event) =>
                            patchFrame({ cardDividerOpacity: Number(event.target.value) })
                          }
                          className="w-full accent-neutral-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-white/70 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Décor géométrique</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Teinte ou forme placée librement dans le cadre — redimensionnable, avec séquence
                  d’apparition optionnelle.
                </p>
              </div>

              <ServicesToggleRow
                label="Activer le décor"
                description="Affiche une forme ou teinte décorative derrière le contenu de la carte."
                checked={activeFrameSettings.cardDecorEnabled}
                onChange={(cardDecorEnabled) => patchFrame({ cardDecorEnabled })}
              />

              {activeFrameSettings.cardDecorEnabled ? (
                <>
                  <ServicesOptionGrid
                    label="Forme"
                    options={PORTFOLIO_SERVICES_CARD_DECOR_SHAPE_OPTIONS}
                    value={activeFrameSettings.cardDecorShape}
                    onChange={(cardDecorShape) => patchFrame({ cardDecorShape })}
                    columns={2}
                  />

                  <ServicesFrameColorField
                    services={services}
                    onChange={onChange}
                    slot="cardAccent"
                    label="Couleur / teinte"
                    value={activeFrameSettings.cardDecorColor}
                    onManualChange={(cardDecorColor) => patchFrame({ cardDecorColor })}
                  />

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Opacité
                      </p>
                      <span className="text-xs font-semibold text-neutral-600">
                        {activeFrameSettings.cardDecorOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={activeFrameSettings.cardDecorOpacity}
                      onChange={(event) =>
                        patchFrame({ cardDecorOpacity: Number(event.target.value) })
                      }
                      className="w-full accent-neutral-900"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Taille
                      </p>
                      <span className="text-xs font-semibold text-neutral-600">
                        {activeFrameSettings.cardDecorSize}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={160}
                      step={1}
                      value={activeFrameSettings.cardDecorSize}
                      onChange={(event) => patchFrame({ cardDecorSize: Number(event.target.value) })}
                      className="w-full accent-neutral-900"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                          Position X
                        </p>
                        <span className="text-xs font-semibold text-neutral-600">
                          {activeFrameSettings.cardDecorX}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={activeFrameSettings.cardDecorX}
                        onChange={(event) => patchFrame({ cardDecorX: Number(event.target.value) })}
                        className="w-full accent-neutral-900"
                      />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                          Position Y
                        </p>
                        <span className="text-xs font-semibold text-neutral-600">
                          {activeFrameSettings.cardDecorY}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={activeFrameSettings.cardDecorY}
                        onChange={(event) => patchFrame({ cardDecorY: Number(event.target.value) })}
                        className="w-full accent-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Rotation
                      </p>
                      <span className="text-xs font-semibold text-neutral-600">
                        {activeFrameSettings.cardDecorRotation}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={activeFrameSettings.cardDecorRotation}
                      onChange={(event) =>
                        patchFrame({ cardDecorRotation: Number(event.target.value) })
                      }
                      className="w-full accent-neutral-900"
                    />
                  </div>

                  <ServicesOptionGrid
                    label="Séquence d’alternance"
                    options={PORTFOLIO_SERVICES_CARD_DECOR_ALTERNATION_OPTIONS}
                    value={activeFrameSettings.cardDecorAlternation}
                    onChange={(cardDecorAlternation) => patchFrame({ cardDecorAlternation })}
                    columns={2}
                  />

                  <div className="relative h-28 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                    <div
                      className="absolute inset-0"
                      style={servicesCardDecorShellStyle(activeFrameSettings)}
                      aria-hidden
                    />
                    <p className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                      Aperçu position
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            {activeFrameSettings.cardBorder === 'soft' || activeFrameSettings.cardBorder === 'solid' ? (
              <ServicesFrameColorField
                services={services}
                onChange={onChange}
                slot="cardBorder"
                label="Couleur de bordure"
                value={activeFrameSettings.cardBorderColor}
                onManualChange={(cardBorderColor) => patchFrame({ cardBorderColor })}
              />
            ) : null}

            <ServicesOptionGrid
              label="Arrondi"
              options={PORTFOLIO_SERVICES_CARD_RADIUS_OPTIONS}
              value={activeFrameSettings.cardBorderRadius}
              onChange={(cardBorderRadius) => patchFrame({ cardBorderRadius })}
              columns={3}
            />

            <ServicesOptionGrid
              label="Padding carte"
              options={PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS}
              value={activeFrameSettings.cardPadding}
              onChange={(cardPadding) => patchFrame({ cardPadding })}
              columns={2}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'ergonomics' ? (
        <div className="space-y-6">
          {usesSplitBlocks ? (
            <>
              <ServicesBlockScopeTabs scope={blockScope} onChange={setBlockScope} />
              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    {blockScope === 'skills' ? 'Tools / skills' : 'Services'} — placement
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Alignement du contenu
                    {blockScope === 'services' ? ' et emplacement du prix / livraison' : " et position de l'icône"}.
                  </p>
                </div>
                <ServicesOptionGrid
                  label="Alignement contenu"
                  options={PORTFOLIO_SERVICES_CONTENT_ALIGNMENT_OPTIONS}
                  value={readBlock('contentAlignment')}
                  onChange={(contentAlignment) => patchBlock({ contentAlignment })}
                  columns={3}
                />
                {blockScope === 'services' ? (
                  <ServicesOptionGrid
                    label="Emplacement prix"
                    options={PORTFOLIO_SERVICES_PRICE_PLACEMENT_OPTIONS}
                    value={readBlock('pricePlacement')}
                    onChange={(pricePlacement) => patchBlock({ pricePlacement })}
                    columns={3}
                  />
                ) : (
                  <ServicesOptionGrid
                    label="Emplacement icône"
                    options={PORTFOLIO_SERVICES_ICON_PLACEMENT_OPTIONS}
                    value={readBlock('iconPlacement')}
                    onChange={(iconPlacement) => patchBlock({ iconPlacement })}
                    columns={2}
                  />
                )}
              </div>
            </>
          ) : (
            <>
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Services — placement</p>
              <p className="mt-1 text-sm text-neutral-500">
                Alignement du contenu et emplacement du prix / livraison dans chaque design.
              </p>
            </div>
            <ServicesOptionGrid
              label="Alignement contenu"
              options={PORTFOLIO_SERVICES_CONTENT_ALIGNMENT_OPTIONS}
              value={services.servicesContentAlignment}
              onChange={(servicesContentAlignment) => onChange({ servicesContentAlignment })}
              columns={3}
            />
            <ServicesOptionGrid
              label="Emplacement prix"
              options={PORTFOLIO_SERVICES_PRICE_PLACEMENT_OPTIONS}
              value={services.servicesPricePlacement}
              onChange={(servicesPricePlacement) => onChange({ servicesPricePlacement })}
              columns={3}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Tools / skills — placement</p>
              <p className="mt-1 text-sm text-neutral-500">
                Alignement et position de l&apos;icône outil dans chaque design.
              </p>
            </div>
            <ServicesOptionGrid
              label="Alignement contenu"
              options={PORTFOLIO_SERVICES_CONTENT_ALIGNMENT_OPTIONS}
              value={services.skillsContentAlignment}
              onChange={(skillsContentAlignment) => onChange({ skillsContentAlignment })}
              columns={3}
            />
            <ServicesOptionGrid
              label="Emplacement icône"
              options={PORTFOLIO_SERVICES_ICON_PLACEMENT_OPTIONS}
              value={services.skillsIconPlacement}
              onChange={(skillsIconPlacement) => onChange({ skillsIconPlacement })}
              columns={2}
            />
          </div>
            </>
          )}
        </div>
      ) : null}

      {subSection === 'content' ? (
        <>
          {usesSplitBlocks ? (
            <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
              Les sous-labels « Skills & tools » / « Services » sont désactivés en mode séparé — chaque bloc a
              son propre cadre ou sa propre section avec titre dédié (onglet Header).
            </p>
          ) : (
            <>
              <ServicesToggleRow
                label="Skills subheading"
                description="Small label above the skills block."
                checked={services.showSkillsSubheading}
                onChange={(showSkillsSubheading) => onChange({ showSkillsSubheading })}
              />
              <ServicesToggleRow
                label="Services subheading"
                description="Small label above the services block."
                checked={services.showServicesSubheading}
                onChange={(showServicesSubheading) => onChange({ showServicesSubheading })}
              />
            </>
          )}
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Skill cards</p>
          <ServicesToggleRow
            label="Tool icon"
            checked={services.showSkillIcon}
            onChange={(showSkillIcon) => onChange({ showSkillIcon })}
          />
          <ServicesToggleRow
            label="Skill title"
            checked={services.showSkillTitle}
            onChange={(showSkillTitle) => onChange({ showSkillTitle })}
          />
          <ServicesToggleRow
            label="Skill description"
            checked={services.showSkillDescription}
            onChange={(showSkillDescription) => onChange({ showSkillDescription })}
          />
          <p className="pt-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Service cards</p>
          <ServicesToggleRow
            label="Service title"
            checked={services.showServiceTitle}
            onChange={(showServiceTitle) => onChange({ showServiceTitle })}
          />
          <ServicesToggleRow
            label="Service description"
            checked={services.showServiceDescription}
            onChange={(showServiceDescription) => onChange({ showServiceDescription })}
          />
          <ServicesToggleRow
            label="Price"
            checked={services.showServicePrice}
            onChange={(showServicePrice) => onChange({ showServicePrice })}
          />
          <ServicesToggleRow
            label="Delivery time"
            checked={services.showServiceDelivery}
            onChange={(showServiceDelivery) => onChange({ showServiceDelivery })}
          />
        </>
      ) : null}

      {subSection === 'skills' ? (
        <PortfolioElementStyleFields
          targets={SERVICES_SKILLS_STYLE_TARGETS}
          activeTarget={skillsStyleTarget}
          onTargetChange={(value) => setSkillsStyleTarget(value as 'skillTitle' | 'skillBody')}
          style={elementStyles[skillsStyleTarget]}
          onStyleChange={(patch) =>
            onChange({
              elementStyles: patchServicesElementStyle(elementStyles, skillsStyleTarget, patch),
            })
          }
          renderColorField={({ label, value }) => (
            <ServicesColorField
              services={services}
              onChange={onChange}
              slot={SERVICES_STYLE_TARGET_COLOR_SLOT[skillsStyleTarget]}
              label={label}
              value={value}
            />
          )}
          extra={
            skillsStyleTarget === 'skillTitle' ? (
              <ServicesOptionGrid
                label="Skill / tool icon size"
                options={PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS}
                value={services.skillsIconSize}
                onChange={(skillsIconSize) => onChange({ skillsIconSize })}
                columns={2}
              />
            ) : undefined
          }
        />
      ) : null}

      {subSection === 'servicesText' ? (
        <PortfolioElementStyleFields
          targets={SERVICES_TEXT_STYLE_TARGETS}
          activeTarget={servicesTextStyleTarget}
          onTargetChange={(value) =>
            setServicesTextStyleTarget(
              value as 'blockSubheading' | 'cardTitle' | 'cardBody' | 'price' | 'delivery'
            )
          }
          style={elementStyles[servicesTextStyleTarget]}
          onStyleChange={(patch) =>
            onChange({
              elementStyles: patchServicesElementStyle(elementStyles, servicesTextStyleTarget, patch),
            })
          }
          renderColorField={({ label, value }) => (
            <ServicesColorField
              services={services}
              onChange={onChange}
              slot={SERVICES_STYLE_TARGET_COLOR_SLOT[servicesTextStyleTarget]}
              label={label}
              value={value}
            />
          )}
          extra={
            servicesTextStyleTarget === 'blockSubheading' ? (
              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Skills subheading label
                  </label>
                  <input
                    type="text"
                    value={services.skillsSubheadingLabel}
                    onChange={(event) => onChange({ skillsSubheadingLabel: event.target.value })}
                    placeholder="Skills & tools"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Services subheading label
                  </label>
                  <input
                    type="text"
                    value={services.servicesSubheadingLabel}
                    onChange={(event) => onChange({ servicesSubheadingLabel: event.target.value })}
                    placeholder="Services"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              </div>
            ) : undefined
          }
        />
      ) : null}

      {subSection === 'palette' ? (
        <ServicesPalettePanel services={services} onChange={onChange} />
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-6">
          <ServicesUsePaletteToggle
            services={services}
            onChange={onChange}
            description="When on, section fill colors follow palette tokens. Turn off to pick them freely below."
          />

          <SectionBackgroundSettingsFields
            settings={services}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onBgColorChange }) => {
              const slot = SERVICES_BACKGROUND_LABEL_SLOTS[label];
              if (!slot) {
                return (
                  <ServicesManualColorField
                    label={label}
                    value={value}
                    onChange={onBgColorChange}
                  />
                );
              }
              return (
                <ServicesColorField
                  services={services}
                  onChange={onChange}
                  slot={slot}
                  label={label}
                  value={value}
                />
              );
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
