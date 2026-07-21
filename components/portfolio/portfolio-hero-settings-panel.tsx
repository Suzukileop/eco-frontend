'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  PORTFOLIO_HERO_AVAILABILITY_DESIGN_OPTIONS,
  PORTFOLIO_HERO_AVAILABILITY_PLACEMENT_OPTIONS,
  PORTFOLIO_HERO_AVAILABILITY_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_HERO_AVAILABILITY_BORDER_RADIUS_OPTIONS,
  PORTFOLIO_HERO_AVAILABILITY_DOT_SIZE_OPTIONS,
  PORTFOLIO_HERO_CTA_DESIGN_OPTIONS,
  PORTFOLIO_HERO_CTA_PLACEMENT_OPTIONS,
  PORTFOLIO_HERO_SECONDARY_CTA_TARGET_OPTIONS,
  PORTFOLIO_HERO_HEADLINE_FONT_OPTIONS,
  PORTFOLIO_HERO_HEADLINE_PREFIX_OPTIONS,
  PORTFOLIO_HERO_HEADLINE_VALUE_OPTIONS,
  PORTFOLIO_HERO_BACKGROUND_FILL_OPTIONS,
  PORTFOLIO_HERO_BACKGROUND_GRADIENT_TYPE_OPTIONS,
  PORTFOLIO_HERO_DESKTOP_ALIGN_OPTIONS,
  PORTFOLIO_HERO_MOBILE_ALIGN_OPTIONS,
  PORTFOLIO_HERO_MOTIF_OPTIONS,
  PORTFOLIO_HERO_STYLE_TARGET_OPTIONS,
  patchHeroElementStyle,
  resolveHeroVisualFreeCell,
  resolveMotifPoints,
  type PortfolioHeroStyleTarget,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MAX,
  HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MIN,
  HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MAX,
  HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MIN,
  HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MAX,
  HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MIN,
  HERO_COPY_ELEMENT_MARGIN_PX_MAX,
  HERO_COPY_ELEMENT_MARGIN_PX_MIN,
  PORTFOLIO_HERO_COPY_STATS_SIDE_OPTIONS,
  patchHeroCopyElementLayout,
  resolveHeroCopyElementsLayout,
  type HeroCopyElementId,
  type HeroCopyElementLayout,
} from '@/components/portfolio/portfolio-hero-copy-element-layout';
import {
  applyHeroLayoutDivision,
  defaultHeroMotifTransformForDivision,
  HERO_VERTICAL_FRAME_GAP_PX_MAX,
  HERO_VERTICAL_FRAME_GAP_PX_MIN,
  isVerticalHeroDivision,
  PORTFOLIO_HERO_LAYOUT_DIVISION_OPTIONS,
  resetHeroMotifToDivisionDefault,
  resolveHeroLayoutDivision,
  resolveHeroVerticalFrameGapPx,
  type HeroLayoutDivision,
} from '@/components/portfolio/portfolio-hero-layout-division';
import {
  applyHeroUltraWideColumns,
  autoPlaceHeroUltraWideSlots,
  HERO_COPY_COLUMN_SLOT_OPTIONS,
  HERO_VISUAL_COLUMN_SLOT_OPTIONS,
  PORTFOLIO_HERO_ULTRAWIDE_COLUMN_OPTIONS,
  resolveHeroUltraWideColumnLayout,
  type HeroColumnIndex,
  type HeroCopyColumnSlot,
  type HeroUltraWideColumnCount,
  type HeroVisualColumnSlot,
} from '@/components/portfolio/portfolio-hero-ultrawide-columns';
import { defaultHeroCopyPositionForLayout } from '@/components/portfolio/portfolio-hero-copy-settings';
import { PortfolioHeroCopyPositionEditor } from '@/components/portfolio/PortfolioHeroCopyPositionEditor';
import {
  PORTRAIT_CAPTION_BAR_HEIGHT_MAX,
  PORTRAIT_FRAME_PADDING_MAX,
  PORTFOLIO_HERO_CAPTION_LAYOUT_OPTIONS,
  PORTFOLIO_HERO_FRAME_WIDTH_OPTIONS,
  PORTFOLIO_HERO_IN_FRAME_BAR_EDGE_OPTIONS,
  PORTFOLIO_HERO_IN_FRAME_TEXT_PLACEMENT_OPTIONS,
  PORTFOLIO_HERO_OBJECT_FIT_OPTIONS,
  PORTFOLIO_HERO_PORTRAIT_RADIUS_OPTIONS,
  PORTFOLIO_HERO_PORTRAIT_SIZE_OPTIONS,
  isValidProfileHexColor,
  resolvePortraitVerticalCell,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  HERO_VERTICAL_CELL_PLACEMENT_OPTIONS,
  heroVerticalCellToPosition,
  type HeroVerticalCellPlacement,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';
import {
  PORTFOLIO_HERO_PORTRAIT_DESIGNS,
  resetPortraitDesign,
  selectPortraitDesign,
  syncActivePortraitDesignOverride,
  type PortraitDesignId,
} from '@/components/portfolio/portfolio-hero-portrait-designs';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import {
  normalizeHeroElementStyles,
  syncHeroLegacyTypographyFromElementStyles,
} from '@/components/portfolio/portfolio-hero-element-styles';
import {
  applyHeroPaletteToPresentation,
  DEFAULT_HERO_COLOR_BINDINGS,
  DEFAULT_HERO_PALETTE,
  heroStyleTargetColorSlot,
  LIGHT_HERO_PALETTE,
  mergeHeroColorBindings,
  patchHeroColorBinding,
  patchHeroPalette,
  patchHeroSlotColor,
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  type HeroColorSlot,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioHeroSectionSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  DEFAULT_LEFT_CUSTOM_MOTIF_POINTS,
  PORTFOLIO_HERO_LEFT_MOTIF_OPTIONS,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';
import {
  createGeometricMotif,
  createPatternMotif,
  MAX_HERO_MOTIFS,
  syncLegacyFieldsFromHeroMotifs,
  updateHeroMotifInList,
  type HeroMotifInstance,
} from '@/components/portfolio/portfolio-hero-motifs-settings';
import {
  DEFAULT_CUSTOM_MOTIF_POINTS,
  getMotifTemplatePoints,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import { PortfolioHeroMotifCanvasEditor } from '@/components/portfolio/PortfolioHeroMotifCanvasEditor';
import { isPresetHeroHeadlinePrefix } from '@/components/portfolio/portfolio-hero-headline-settings';
import {
  heroMotifPanelFillStyle,
  heroSectionBackgroundStyle,
  PORTFOLIO_HERO_BACKGROUND_DIVIDER_SHAPE_OPTIONS,
  PORTFOLIO_HERO_BACKGROUND_SPLIT_AXIS_OPTIONS,
  PORTFOLIO_HERO_SECTION_BACKGROUND_FILL_OPTIONS,
} from '@/components/portfolio/portfolio-hero-background-settings';
import type { HeroBackgroundFill } from '@/components/portfolio/portfolio-hero-background-settings';
import type {
  PortfolioServicesCardDividerShape,
  PortfolioServicesCardSplitAxis,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import { servicesCardSplitBackgroundLayerStyle } from '@/components/portfolio/portfolio-services-card-background-settings';
import { PortfolioHeroProfilePositionEditor } from '@/components/portfolio/PortfolioHeroProfilePositionEditor';
import { PortfolioHeroMetaPositionEditor } from '@/components/portfolio/PortfolioHeroMetaPositionEditor';
import {
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS,
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-global-settings';
import { PortfolioBackgroundImageUpload } from '@/components/portfolio/portfolio-background-image-upload';
import { usePortfolioBackgroundLibrary } from '@/components/portfolio/portfolio-background-library-context';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
import {
  applyDarkMetaStatSurface,
  DARK_META_LABEL_COLOR,
  DEFAULT_META_YEARS_ACCENT,
  META_CARD_GAP_PX_MAX,
  META_CARD_GAP_PX_MIN,
  metaSpreadGapPx,
  PORTFOLIO_HERO_META_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_HERO_META_DISPLAY_OPTIONS,
  PORTFOLIO_HERO_META_FRAME_SHAPE_MODE_OPTIONS,
  PORTFOLIO_HERO_META_FRAME_SHAPE_OPTIONS,
  PORTFOLIO_HERO_META_INNER_LAYOUT_OPTIONS,
  PORTFOLIO_HERO_META_LOCATION_CONTENT_OPTIONS,
  PORTFOLIO_HERO_META_CARDS_ORIENTATION_OPTIONS,
  PORTFOLIO_HERO_META_PADDING_OPTIONS,
  PORTFOLIO_HERO_META_PLACEMENT_OPTIONS,
  PORTFOLIO_HERO_META_SPREAD_OPTIONS,
  resolveMetaCardGapPx,
  resolveMetaCardsFillWidth,
  resolveMetaCardsOrientation,
  resolveMetaVerticalCell,
} from '@/components/portfolio/portfolio-hero-meta-settings';

export type HeroSettingsSubSection =
  | 'general'
  | 'palette'
  | 'background'
  | 'motifs'
  | 'availability'
  | 'title'
  | 'description'
  | 'tools'
  | 'cta'
  | 'portrait'
  | 'stats'
  /** @deprecated Prefer title / cta / tools / availability */
  | 'text'
  /** @deprecated Prefer per-element menus */
  | 'typography';

const HERO_SETTINGS_SUB_SECTIONS: {
  id: Exclude<HeroSettingsSubSection, 'text' | 'typography'>;
  label: string;
  description: string;
}[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Section visibility, titles, and screen division (copy vs visual groups).',
  },
  {
    id: 'palette',
    label: 'Palette',
    description: 'Semantic Hero colors — elements bind to these tokens.',
  },
  {
    id: 'background',
    label: 'Fond & panneau',
    description: 'Section fill, gradients, opacity, and right motif surface.',
  },
  {
    id: 'motifs',
    label: 'Motifs',
    description: 'Shapes and patterns — add several, place freely, show on mobile and/or desktop.',
  },
  {
    id: 'availability',
    label: 'Disponibilité',
    description: 'Availability badge: content, chrome, typography, and placement.',
  },
  {
    id: 'title',
    label: 'Titre',
    description: 'Headline content, placement, and typography.',
  },
  {
    id: 'description',
    label: 'Description',
    description: 'Pitch paragraph alignment and typography.',
  },
  {
    id: 'tools',
    label: 'Outils',
    description: 'Tools row, label, icon chips, and typography.',
  },
  {
    id: 'cta',
    label: 'CTA',
    description: 'Contact button design, surface, and typography.',
  },
  {
    id: 'portrait',
    label: 'Portrait',
    description: 'Photo, frame, caption, and creator name typography.',
  },
  {
    id: 'stats',
    label: 'Stats',
    description: 'Years, projects, location cards — surface and typography.',
  },
];

/** Map legacy subsection ids (saved UI state / search) to the new element menus. */
export function normalizeHeroSettingsSubSection(value: string | undefined): HeroSettingsSubSection {
  if (value === 'text' || value === 'typography') return 'title';
  if (
    value === 'general' ||
    value === 'palette' ||
    value === 'background' ||
    value === 'motifs' ||
    value === 'availability' ||
    value === 'title' ||
    value === 'description' ||
    value === 'tools' ||
    value === 'cta' ||
    value === 'portrait' ||
    value === 'stats'
  ) {
    return value;
  }
  return 'general';
}

function HeroDesktopOnlyCanvas({
  children,
  label = 'Free placement editor',
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <>
      <p className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 lg:hidden">
        {label} is available on large screens. On phone, use the options above — the live portfolio already
        uses the simplified mobile layout.
      </p>
      <div className="hidden lg:block">{children}</div>
    </>
  );
}

function HeroSubSectionDropdown({
  value,
  onChange,
}: {
  value: HeroSettingsSubSection;
  onChange: (value: HeroSettingsSubSection) => void;
}) {
  return (
    <div className="relative w-full min-w-0 sm:w-auto sm:shrink-0">
      <label htmlFor="hero-settings-subsection" className="sr-only">
        Hero settings section
      </label>
      <select
        id="hero-settings-subsection"
        value={normalizeHeroSettingsSubSection(value)}
        onChange={(event) => onChange(event.target.value as HeroSettingsSubSection)}
        className="min-h-11 w-full appearance-none rounded-full border border-neutral-300 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-neutral-900 shadow-sm transition hover:border-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 sm:w-auto"
      >
        {HERO_SETTINGS_SUB_SECTIONS.map((section) => (
          <option key={section.id} value={section.id}>
            {section.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

function HeroToggleRow({
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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-900">{label}</span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
      />
    </label>
  );
}

function HeroColorField({
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

function HeroOptionGrid<T extends string>({
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

/** Compact 3×3 snap grid for vertical screen-division placement. */
function HeroVerticalCellPicker({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: HeroVerticalCellPlacement;
  onChange: (value: HeroVerticalCellPlacement) => void;
}) {
  const activeLabel =
    HERO_VERTICAL_CELL_PLACEMENT_OPTIONS.find((option) => option.value === value)?.label ?? value;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      <div className="mt-3 inline-grid grid-cols-3 gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3">
        {HERO_VERTICAL_CELL_PLACEMENT_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                active
                  ? 'border-neutral-900 bg-neutral-950 text-white shadow-sm'
                  : 'border-neutral-300 bg-white text-neutral-400 hover:border-neutral-500 hover:text-neutral-700'
              }`}
            >
              <span
                className={`block h-2.5 w-2.5 rounded-full ${
                  active ? 'bg-orange-400' : 'bg-current'
                }`}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm font-semibold text-neutral-800">{activeLabel}</p>
    </div>
  );
}

/** Visual 2×2 picker matching the four screen-division sketches. */
function HeroLayoutDivisionPicker({
  value,
  onChange,
}: {
  value: HeroLayoutDivision;
  onChange: (value: HeroLayoutDivision) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PORTFOLIO_HERO_LAYOUT_DIVISION_OPTIONS.map((option) => {
        const active = option.value === value;
        const horizontal =
          option.value === 'horizontal-copy-left' ||
          option.value === 'horizontal-copy-right';
        const copyFirst =
          option.value === 'horizontal-copy-left' ||
          option.value === 'vertical-copy-top';

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border p-3 text-left transition ${
              active
                ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
            }`}
          >
            <div
              className={`flex h-20 w-full gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 p-2 ${
                horizontal ? 'flex-row' : 'flex-col'
              }`}
            >
              <div
                className={`flex flex-1 items-center justify-center rounded-lg bg-neutral-900/80 ${
                  copyFirst ? 'order-1' : 'order-2'
                }`}
              >
                <span className="h-5 w-8 rounded-full bg-white/90" />
              </div>
              <div
                className={`flex flex-1 items-center justify-center rounded-lg bg-neutral-300 ${
                  copyFirst ? 'order-2' : 'order-1'
                }`}
              >
                <span className="h-8 w-8 rounded-md bg-neutral-500/80" />
              </div>
            </div>
            <p className="mt-2.5 text-sm font-semibold text-neutral-950">{option.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}

function HeroOpacitySlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <span className="text-sm font-semibold text-neutral-700">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
        aria-label={label}
      />
    </div>
  );
}

function HeroPxSlider({
  label,
  value,
  onChange,
  max,
  min = 0,
  unit = 'px',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  unit?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <span className="text-sm font-semibold text-neutral-700">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
        aria-label={label}
      />
    </div>
  );
}

/** Margins + optional above/below-stats placement for a hero copy element. */
function HeroCopyElementLayoutControls({
  hero,
  elementId,
  onChange,
  showStatsSide = true,
}: {
  hero: PortfolioHeroSectionSettings;
  elementId: HeroCopyElementId;
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
  showStatsSide?: boolean;
}) {
  const vertical = isVerticalHeroDivision(resolveHeroLayoutDivision(hero));
  const current = resolveHeroCopyElementsLayout(hero)[elementId];

  const patchLayout = (patch: Partial<HeroCopyElementLayout>) => {
    const next = patchHeroCopyElementLayout(hero.heroCopyElementsLayout, elementId, patch);
    const out: Partial<PortfolioHeroSectionSettings> = { heroCopyElementsLayout: next };
    if (elementId === 'availability') {
      if (patch.marginTopPx !== undefined) out.availabilityMarginTopPx = patch.marginTopPx;
      if (patch.marginBottomPx !== undefined) out.availabilityMarginBottomPx = patch.marginBottomPx;
    }
    if (elementId === 'cta' && patch.statsSide) {
      if (patch.statsSide === 'above-stats') out.ctaPlacement = 'above-stats';
      else if (patch.statsSide === 'below-stats') out.ctaPlacement = 'below-stats';
      else if (patch.statsSide === 'free-zone') out.ctaPlacement = 'free-zone';
      else if (
        hero.ctaPlacement === 'above-stats' ||
        hero.ctaPlacement === 'below-stats' ||
        hero.ctaPlacement === 'free-zone'
      ) {
        out.ctaPlacement = 'below-tools';
      }
    }
    onChange(out);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <p className="text-sm font-semibold text-neutral-950">Spacing &amp; stats position</p>
      {showStatsSide && vertical ? (
        <HeroOptionGrid
          label="Position vs stats"
          options={PORTFOLIO_HERO_COPY_STATS_SIDE_OPTIONS}
          value={current.statsSide}
          onChange={(statsSide) => patchLayout({ statsSide })}
          columns={2}
        />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <HeroPxSlider
          label="Margin top"
          value={current.marginTopPx}
          min={HERO_COPY_ELEMENT_MARGIN_PX_MIN}
          max={HERO_COPY_ELEMENT_MARGIN_PX_MAX}
          onChange={(marginTopPx) => patchLayout({ marginTopPx })}
        />
        <HeroPxSlider
          label="Margin bottom"
          value={current.marginBottomPx}
          min={HERO_COPY_ELEMENT_MARGIN_PX_MIN}
          max={HERO_COPY_ELEMENT_MARGIN_PX_MAX}
          onChange={(marginBottomPx) => patchLayout({ marginBottomPx })}
        />
      </div>
      <div className="border-t border-neutral-200/80 pt-4">
        <HeroToggleRow
          label="Element background"
          description="Independent background that follows this element between the copy, stats, and free zones."
          checked={current.backgroundEnabled}
          onChange={(backgroundEnabled) => patchLayout({ backgroundEnabled })}
        />
        {current.backgroundEnabled ? (
          <div className="mt-4 space-y-4">
            <HeroColorField
              label="Background color"
              value={current.backgroundColor}
              onChange={(backgroundColor) => patchLayout({ backgroundColor })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroPxSlider
                label="Background opacity"
                value={current.backgroundOpacity}
                min={HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MIN}
                max={HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MAX}
                onChange={(backgroundOpacity) => patchLayout({ backgroundOpacity })}
              />
              <HeroPxSlider
                label="Inner padding"
                value={current.backgroundPaddingPx}
                min={HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MIN}
                max={HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MAX}
                onChange={(backgroundPaddingPx) => patchLayout({ backgroundPaddingPx })}
              />
              <HeroPxSlider
                label="Corner radius"
                value={current.backgroundRadiusPx}
                min={HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MIN}
                max={HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MAX}
                onChange={(backgroundRadiusPx) => patchLayout({ backgroundRadiusPx })}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HeroBackgroundFillControls({
  title,
  description,
  fill,
  onFillChange,
  solidColor,
  onSolidColorChange,
  opacity,
  onOpacityChange,
  gradientType,
  onGradientTypeChange,
  gradientFrom,
  onGradientFromChange,
  gradientTo,
  onGradientToChange,
  gradientAngle,
  onGradientAngleChange,
  previewStyle,
  fillOptions = PORTFOLIO_HERO_BACKGROUND_FILL_OPTIONS,
  imageUrl,
  onImageUrlChange,
  imageSize,
  onImageSizeChange,
  imagePosition,
  onImagePositionChange,
  splitColorA,
  onSplitColorAChange,
  splitColorB,
  onSplitColorBChange,
  splitAxis,
  onSplitAxisChange,
  splitPosition,
  onSplitPositionChange,
  dividerEnabled,
  onDividerEnabledChange,
  dividerShape,
  onDividerShapeChange,
  dividerAngle,
  onDividerAngleChange,
  dividerCurveDepth,
  onDividerCurveDepthChange,
  dividerColor,
  onDividerColorChange,
  dividerThickness,
  onDividerThicknessChange,
  dividerOpacity,
  onDividerOpacityChange,
}: {
  title: string;
  description: string;
  fill: HeroBackgroundFill;
  onFillChange: (fill: HeroBackgroundFill) => void;
  solidColor: string;
  onSolidColorChange: (color: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  gradientType: 'linear' | 'radial';
  onGradientTypeChange: (type: 'linear' | 'radial') => void;
  gradientFrom: string;
  onGradientFromChange: (color: string) => void;
  gradientTo: string;
  onGradientToChange: (color: string) => void;
  gradientAngle: number;
  onGradientAngleChange: (angle: number) => void;
  previewStyle: CSSProperties;
  fillOptions?: { value: HeroBackgroundFill; label: string; description: string }[];
  imageUrl?: string;
  onImageUrlChange?: (url: string) => void;
  imageSize?: 'cover' | 'contain' | 'fill';
  onImageSizeChange?: (size: 'cover' | 'contain' | 'fill') => void;
  imagePosition?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  onImagePositionChange?: (
    position:
      | 'center'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
  ) => void;
  splitColorA?: string;
  onSplitColorAChange?: (color: string) => void;
  splitColorB?: string;
  onSplitColorBChange?: (color: string) => void;
  splitAxis?: PortfolioServicesCardSplitAxis;
  onSplitAxisChange?: (axis: PortfolioServicesCardSplitAxis) => void;
  splitPosition?: number;
  onSplitPositionChange?: (position: number) => void;
  dividerEnabled?: boolean;
  onDividerEnabledChange?: (enabled: boolean) => void;
  dividerShape?: PortfolioServicesCardDividerShape;
  onDividerShapeChange?: (shape: PortfolioServicesCardDividerShape) => void;
  dividerAngle?: number;
  onDividerAngleChange?: (angle: number) => void;
  dividerCurveDepth?: number;
  onDividerCurveDepthChange?: (depth: number) => void;
  dividerColor?: string;
  onDividerColorChange?: (color: string) => void;
  dividerThickness?: number;
  onDividerThicknessChange?: (thickness: number) => void;
  dividerOpacity?: number;
  onDividerOpacityChange?: (opacity: number) => void;
}) {
  const libraryContext = usePortfolioBackgroundLibrary();
  const supportsSplit =
    Boolean(onSplitColorAChange) &&
    Boolean(onSplitColorBChange) &&
    Boolean(onSplitAxisChange) &&
    Boolean(onSplitPositionChange);

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-950">{title}</p>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        </div>
        <span
          className="h-14 w-24 shrink-0 rounded-xl border border-neutral-200/80 shadow-inner"
          style={previewStyle}
          aria-hidden
        />
      </div>

      <HeroOptionGrid
        label="Fill type"
        options={fillOptions}
        value={fill}
        onChange={onFillChange}
        columns={fillOptions.length >= 3 ? 3 : 2}
      />

      {fill === 'solid' ? (
        <HeroColorField label="Color" value={solidColor} onChange={onSolidColorChange} />
      ) : null}

      {fill === 'gradient' ? (
        <>
          <HeroOptionGrid
            label="Gradient type"
            options={PORTFOLIO_HERO_BACKGROUND_GRADIENT_TYPE_OPTIONS}
            value={gradientType}
            onChange={onGradientTypeChange}
            columns={2}
          />
          <HeroColorField label="Gradient start" value={gradientFrom} onChange={onGradientFromChange} />
          <HeroColorField label="Gradient end" value={gradientTo} onChange={onGradientToChange} />
          {gradientType === 'linear' ? (
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Angle</p>
                <span className="text-sm font-semibold text-neutral-700">{gradientAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={359}
                step={1}
                value={gradientAngle}
                onChange={(event) => onGradientAngleChange(Number(event.target.value))}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Gradient angle"
              />
            </div>
          ) : null}
        </>
      ) : null}

      {fill === 'split' && supportsSplit ? (
        <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-white/70 p-4">
          <div>
            <p className="text-sm font-semibold text-neutral-950">Fond divisé X / Y</p>
            <p className="mt-1 text-sm text-neutral-500">
              Deux couleurs de zone séparées par une ligne géométrique — comme sur les cartes.
            </p>
          </div>

          <HeroOptionGrid
            label="Axe de séparation"
            options={PORTFOLIO_HERO_BACKGROUND_SPLIT_AXIS_OPTIONS}
            value={splitAxis ?? 'y'}
            onChange={onSplitAxisChange!}
            columns={2}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <HeroColorField
              label={(splitAxis ?? 'y') === 'y' ? 'Couleur zone haut' : 'Couleur zone gauche'}
              value={splitColorA ?? '#ffffff'}
              onChange={onSplitColorAChange!}
            />
            <HeroColorField
              label={(splitAxis ?? 'y') === 'y' ? 'Couleur zone bas' : 'Couleur zone droite'}
              value={splitColorB ?? '#f5f5f5'}
              onChange={onSplitColorBChange!}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Position de la séparation
              </p>
              <span className="text-sm font-semibold text-neutral-700">{splitPosition ?? 50}%</span>
            </div>
            <input
              type="range"
              min={8}
              max={92}
              step={1}
              value={splitPosition ?? 50}
              onChange={(event) => onSplitPositionChange!(Number(event.target.value))}
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="Position de la séparation"
            />
          </div>

          <div
            className="h-24 overflow-hidden rounded-2xl border border-neutral-200/80 shadow-inner"
            style={servicesCardSplitBackgroundLayerStyle({
              cardBackgroundFill: 'split',
              cardBackgroundColorA: splitColorA ?? '#ffffff',
              cardBackgroundColorB: splitColorB ?? '#f5f5f5',
              cardBackgroundSplitAxis: splitAxis ?? 'y',
              cardBackgroundSplitPosition: splitPosition ?? 50,
              cardDividerEnabled: dividerEnabled ?? false,
              cardDividerShape: dividerShape ?? 'straight',
              cardDividerAngle: dividerAngle ?? 135,
              cardDividerCurveDepth: dividerCurveDepth ?? 14,
              cardDividerColor: dividerColor ?? '#d4d4d4',
              cardDividerThickness: dividerThickness ?? 2,
              cardDividerOpacity: dividerOpacity ?? 85,
            })}
            aria-hidden
          />

          {onDividerEnabledChange ? (
            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-neutral-950">Ligne de séparation</span>
                <span className="mt-1 block text-sm text-neutral-500">
                  Afficher une ligne entre les deux zones de couleur.
                </span>
              </span>
              <input
                type="checkbox"
                checked={dividerEnabled ?? false}
                onChange={(event) => onDividerEnabledChange(event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900"
              />
            </label>
          ) : null}

          {onDividerShapeChange ? (
            <HeroOptionGrid
              label="Forme de la ligne"
              options={PORTFOLIO_HERO_BACKGROUND_DIVIDER_SHAPE_OPTIONS}
              value={dividerShape ?? 'straight'}
              onChange={onDividerShapeChange}
              columns={2}
            />
          ) : null}

          {dividerShape === 'diagonal' && onDividerAngleChange ? (
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Angle</p>
                <span className="text-sm font-semibold text-neutral-700">{dividerAngle ?? 135}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={359}
                step={1}
                value={dividerAngle ?? 135}
                onChange={(event) => onDividerAngleChange(Number(event.target.value))}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Angle de la diagonale"
              />
            </div>
          ) : (dividerShape === 'curve' || dividerShape === 'wave') && onDividerCurveDepthChange ? (
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  {dividerShape === 'curve' ? 'Courbure' : 'Amplitude vague'}
                </p>
                <span className="text-sm font-semibold text-neutral-700">{dividerCurveDepth ?? 14}%</span>
              </div>
              <input
                type="range"
                min={4}
                max={40}
                step={1}
                value={dividerCurveDepth ?? 14}
                onChange={(event) => onDividerCurveDepthChange(Number(event.target.value))}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Profondeur de courbe"
              />
            </div>
          ) : null}

          {dividerEnabled && onDividerColorChange ? (
            <div className="space-y-4">
              <HeroColorField
                label="Couleur de la ligne"
                value={dividerColor ?? '#d4d4d4'}
                onChange={onDividerColorChange}
              />
              {onDividerThicknessChange ? (
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Épaisseur</p>
                    <span className="text-sm font-semibold text-neutral-700">{dividerThickness ?? 2}px</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={dividerThickness ?? 2}
                    onChange={(event) => onDividerThicknessChange(Number(event.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                    aria-label="Épaisseur de la ligne"
                  />
                </div>
              ) : null}
              {onDividerOpacityChange ? (
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Opacité ligne
                    </p>
                    <span className="text-sm font-semibold text-neutral-700">{dividerOpacity ?? 85}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={dividerOpacity ?? 85}
                    onChange={(event) => onDividerOpacityChange(Number(event.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                    aria-label="Opacité de la ligne"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {fill === 'image' && onImageUrlChange ? (
        <>
          <PortfolioBackgroundImageUpload
            url={imageUrl ?? ''}
            onChange={onImageUrlChange}
            library={libraryContext?.library}
            onLibraryChange={libraryContext?.onLibraryChange}
            helperText="Overrides the Global wallpaper for Hero only."
          />
          {onImageSizeChange && imageSize ? (
            <HeroOptionGrid
              label="Image size"
              options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS}
              value={imageSize}
              onChange={onImageSizeChange}
              columns={3}
            />
          ) : null}
          {onImagePositionChange && imagePosition ? (
            <HeroOptionGrid
              label="Image position"
              options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS}
              value={imagePosition}
              onChange={onImagePositionChange}
              columns={3}
            />
          ) : null}
        </>
      ) : null}

      {fill !== 'none' && fill !== 'transparent' ? (
        <HeroOpacitySlider label="Opacity" value={opacity} onChange={onOpacityChange} />
      ) : fill === 'transparent' ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Nothing is painted here — the Global page color and background pattern stay fully
          visible through this section.
        </p>
      ) : (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Hero has no local fill — the Global fixed background image shows through this section.
        </p>
      )}
    </div>
  );
}

/** Inline single-element typography editor — reused across per-element menus (no target picker). */
function HeroInlineTypography({
  hero,
  target,
  onChange,
  title = 'Typography',
  extra,
}: {
  hero: PortfolioHeroSectionSettings;
  target: PortfolioHeroStyleTarget;
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
  title?: string;
  extra?: ReactNode;
}) {
  const elementStyles = normalizeHeroElementStyles(hero.elementStyles, hero);
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <PortfolioElementStyleFields
        targets={PORTFOLIO_HERO_STYLE_TARGET_OPTIONS}
        activeTarget={target}
        onTargetChange={() => {}}
        hideTargetPicker
        title={title}
        style={elementStyles[target]}
        onStyleChange={(patch) => {
          // Palette mode: color edits update the bound token (same as Fond solid fill).
          const colorSlot =
            hero.useHeroPalette !== false && typeof patch.color === 'string'
              ? heroStyleTargetColorSlot(target)
              : null;
          if (colorSlot && typeof patch.color === 'string') {
            const { color, ...rest } = patch;
            let next = patchHeroSlotColor(hero, colorSlot, color);
            if (Object.keys(rest).length > 0) {
              const styles = normalizeHeroElementStyles(
                (next.elementStyles as typeof elementStyles | undefined) ?? elementStyles,
                { ...hero, ...next }
              );
              const nextStyles = patchHeroElementStyle(styles, target, rest, {
                ...hero,
                ...next,
              });
              next = {
                ...next,
                elementStyles: nextStyles,
                ...syncHeroLegacyTypographyFromElementStyles(nextStyles),
              };
            }
            onChange(next);
            return;
          }
          const nextStyles = patchHeroElementStyle(elementStyles, target, patch, hero);
          onChange({
            elementStyles: nextStyles,
            ...syncHeroLegacyTypographyFromElementStyles(nextStyles),
          });
        }}
        extra={extra}
      />
    </div>
  );
}

/** Same Use-color-palette control as Fond & panneau — shown in every Hero subsection. */
function HeroUsePaletteToggle({
  hero,
  onChange,
  description,
  enabledHint,
  disabledHint,
}: {
  hero: PortfolioHeroSectionSettings;
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
  description: string;
  enabledHint?: string;
  disabledHint?: string;
}) {
  return (
    <SectionHeroPaletteToggle
      enabled={hero.useHeroPalette !== false}
      onChange={(useHeroPalette) =>
        onChange(
          useHeroPalette
            ? { useHeroPalette, ...applyHeroPaletteToPresentation(hero) }
            : { useHeroPalette }
        )
      }
      title="Use color palette"
      description={description}
      enabledHint={
        enabledHint ??
        'Palette mode — colors follow tokens. Edit them under Hero → Palette, or turn this off for free hex pickers.'
      }
      disabledHint={
        disabledHint ??
        'Manual mode — color pickers below set hex values directly and are no longer overwritten by the palette.'
      }
    />
  );
}

function HeroColorSlotBinding({
  slot,
  label,
  hero,
  onChange,
  onSelectToken,
}: {
  slot: HeroColorSlot;
  label: string;
  hero: PortfolioHeroSectionSettings;
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
  /** Optional override — used when several slots must stay on the same token. */
  onSelectToken?: (token: (typeof PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS)[number]['value']) => void;
}) {
  // Manual mode: token bindings are inert — hide the pickers so only hex fields drive colors.
  if (hero.useHeroPalette === false) return null;
  const bindings = mergeHeroColorBindings(
    hero.colorBindings ?? DEFAULT_HERO_COLOR_BINDINGS,
    hero.colorBindings
  );
  const active = bindings[slot];
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => {
          const selected = active === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onSelectToken
                  ? onSelectToken(option.value)
                  : onChange(patchHeroColorBinding(hero, slot, option.value))
              }
              className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                selected
                  ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300'
              }`}
            >
              <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function HeroSettingsPanel({
  hero,
  availableTools,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  hero: PortfolioHeroSectionSettings;
  availableTools: string[];
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
  subSection?: HeroSettingsSubSection;
  onSubSectionChange?: (value: HeroSettingsSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<HeroSettingsSubSection>('general');
  const subSection = normalizeHeroSettingsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: HeroSettingsSubSection) => {
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };
  const activeMeta =
    HERO_SETTINGS_SUB_SECTIONS.find((section) => section.id === subSection) ?? HERO_SETTINGS_SUB_SECTIONS[0];

  const normalizedTools = Array.from(
    new Set(availableTools.map((item) => item.trim()).filter(Boolean))
  );
  const selectedTools =
    hero.selectedTools.length > 0
      ? hero.selectedTools.filter((tool) => normalizedTools.includes(tool))
      : normalizedTools;

  /** Persist portrait fine-tunes into the active reusable template. */
  const patchPortrait = (patch: Partial<PortfolioHeroSectionSettings>) => {
    onChange(syncActivePortraitDesignOverride(hero, patch));
  };

  const toggleTool = (tool: string) => {
    const base = hero.selectedTools.length > 0 ? selectedTools : normalizedTools;
    const next = base.includes(tool) ? base.filter((item) => item !== tool) : [...base, tool];
    onChange({ selectedTools: next });
  };

  const motifs = hero.heroMotifs ?? [];

  const applyMotifs = (nextMotifs: HeroMotifInstance[]) => {
    onChange({
      heroMotifs: nextMotifs,
      ...syncLegacyFieldsFromHeroMotifs(nextMotifs),
    });
  };

  const patchMotif = (id: string, patch: Partial<HeroMotifInstance>) => {
    applyMotifs(updateHeroMotifInList(motifs, id, patch));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200/80 pb-5">
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-950">{activeMeta.label}</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <HeroSubSectionDropdown value={subSection} onChange={setSubSection} />
      </div>

      {subSection === 'general' ? (
        <div className="space-y-5">
          <HeroToggleRow
            label="Show section"
            description="Display the hero block on your public portfolio."
            checked={hero.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />

          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, Hero colors follow the semantic palette (Principal, Fond, Bordure…). Turn off to set each color manually in Fond & panneau, Titre, CTA, etc."
            enabledHint="Palette mode — edit tokens under Hero → Palette, or turn this off for free hex pickers."
            disabledHint="Manual mode — color pickers edit each field directly. Other sections can still sync to the Hero palette tokens."
          />

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Section title</p>
            <input
              type="text"
              value={hero.title}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="Hero"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Section subtitle</p>
            <textarea
              rows={3}
              value={hero.subtitle}
              onChange={(event) => onChange({ subtitle: event.target.value })}
              placeholder="Optional supporting line under the title"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Screen division</p>
              <p className="mt-1 text-sm text-neutral-500">
                Group left (copy) and right (portrait, motif, stats), then place the two groups
                side-by-side or stacked. In vertical mode the top block shrinks to its content,
                then a tunable gap before the visual block.
              </p>
            </div>
            <HeroLayoutDivisionPicker
              value={resolveHeroLayoutDivision(hero)}
              onChange={(heroLayoutDivision) =>
                onChange(applyHeroLayoutDivision(hero, heroLayoutDivision))
              }
            />
            {isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
              <>
                <HeroPxSlider
                  label="Gap between frames"
                  value={resolveHeroVerticalFrameGapPx(hero)}
                  min={HERO_VERTICAL_FRAME_GAP_PX_MIN}
                  max={HERO_VERTICAL_FRAME_GAP_PX_MAX}
                  onChange={(heroVerticalFrameGapPx) => onChange({ heroVerticalFrameGapPx })}
                />
                <HeroVerticalCellPicker
                  label="Free zone position"
                  description='Anchor for elements set to "Free zone (other part)" — they move into the empty area of the visual frame (e.g. top right beside the stats).'
                  value={resolveHeroVisualFreeCell(hero)}
                  onChange={(heroVisualFreeCell) => onChange({ heroVisualFreeCell })}
                />
              </>
            ) : null}
          </div>

          {isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  Desktop columns (xl+)
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Split each unit (copy / visual) into 1, 2, or 3 columns and place
                  elements left / center / right per column. Changing the count
                  auto-positions elements.
                </p>
              </div>

              {(() => {
                const ultraWide = resolveHeroUltraWideColumnLayout(hero);
                const setColumns = (columns: HeroUltraWideColumnCount) => {
                  onChange({
                    heroUltraWideColumns: applyHeroUltraWideColumns(
                      hero.heroUltraWideColumns,
                      columns
                    ),
                  });
                };
                const patchCopySlot = (slot: HeroCopyColumnSlot, column: HeroColumnIndex) => {
                  const next = resolveHeroUltraWideColumnLayout(hero);
                  onChange({
                    heroUltraWideColumns: {
                      ...next,
                      copySlots: { ...next.copySlots, [slot]: column },
                    },
                  });
                };
                const patchVisualSlot = (
                  slot: HeroVisualColumnSlot,
                  column: HeroColumnIndex
                ) => {
                  const next = resolveHeroUltraWideColumnLayout(hero);
                  onChange({
                    heroUltraWideColumns: {
                      ...next,
                      visualSlots: { ...next.visualSlots, [slot]: column },
                    },
                  });
                };
                const columnChoices = Array.from(
                  { length: ultraWide.columns },
                  (_, i) => (i + 1) as HeroColumnIndex
                );

                return (
                  <>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {PORTFOLIO_HERO_ULTRAWIDE_COLUMN_OPTIONS.map((option) => {
                        const active = ultraWide.columns === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setColumns(option.value)}
                            className={`rounded-2xl border px-3 py-3 text-left transition ${
                              active
                                ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <p className="text-sm font-bold text-neutral-950">{option.label}</p>
                            <p className="mt-1 text-xs text-neutral-500">{option.description}</p>
                          </button>
                        );
                      })}
                    </div>

                    {ultraWide.columns > 1 ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Element columns
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              onChange({
                                heroUltraWideColumns: autoPlaceHeroUltraWideSlots(
                                  ultraWide.columns
                                ),
                              })
                            }
                            className="inline-flex min-h-9 items-center rounded-full border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                          >
                            Auto-place elements
                          </button>
                        </div>

                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                          <p className="text-sm font-semibold text-neutral-950">Copy unit</p>
                          <div className="mt-3 space-y-2">
                            {HERO_COPY_COLUMN_SLOT_OPTIONS.map((slot) => (
                              <div
                                key={slot.value}
                                className="flex flex-wrap items-center justify-between gap-2"
                              >
                                <span className="text-sm text-neutral-700">{slot.label}</span>
                                <div className="flex gap-1">
                                  {columnChoices.map((col) => (
                                    <button
                                      key={col}
                                      type="button"
                                      onClick={() => patchCopySlot(slot.value, col)}
                                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                                        ultraWide.copySlots[slot.value] === col
                                          ? 'bg-neutral-950 text-white'
                                          : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                                      }`}
                                    >
                                      {col}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                          <p className="text-sm font-semibold text-neutral-950">Visual unit</p>
                          <div className="mt-3 space-y-2">
                            {HERO_VISUAL_COLUMN_SLOT_OPTIONS.map((slot) => (
                              <div
                                key={slot.value}
                                className="flex flex-wrap items-center justify-between gap-2"
                              >
                                <span className="text-sm text-neutral-700">{slot.label}</span>
                                <div className="flex gap-1">
                                  {columnChoices.map((col) => (
                                    <button
                                      key={col}
                                      type="button"
                                      onClick={() => patchVisualSlot(slot.value, col)}
                                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                                        ultraWide.visualSlots[slot.value] === col
                                          ? 'bg-neutral-950 text-white'
                                          : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                                      }`}
                                    >
                                      {col}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                );
              })()}
            </div>
          ) : null}
        </div>
      ) : null}

      {subSection === 'palette' ? (
        <div className="space-y-6">
          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, Hero colors follow these eight tokens. Turn off to edit colors manually in Fond & panneau and each element menu."
            enabledHint="Change a token below to restyle everything bound to it. Other sections can opt in via their General → Use Hero color palette toggle."
            disabledHint="Palette tokens are kept for other sections, but Hero itself uses manual hex colors until you turn this back on."
          />

          <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
            Headline, CTA, availability badge, tools, stats, and portrait frame all bind to these eight
            semantic tokens. Change a token here to restyle everything bound to it at once.
          </p>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Palette presets
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Dark mode is the validated palette for the black site (brand orange / teal, light text,
              dark surfaces). Light mode is the validated light counterpart: same hue family with
              darkened accents so everything stays readable on the off-white background.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  if (hero.useHeroPalette === false) {
                    onChange({ palette: { ...DEFAULT_HERO_PALETTE } });
                    return;
                  }
                  onChange(patchHeroPalette(hero, DEFAULT_HERO_PALETTE));
                }}
                className="rounded-2xl border border-neutral-200 bg-neutral-950 px-4 py-3 text-left transition hover:border-neutral-400"
              >
                <span className="text-sm font-bold text-white">Dark mode palette</span>
                <span className="mt-1 block text-xs text-neutral-400">
                  Fond noir, texte clair, orange #ff5a1f / teal #00e5a0.
                </span>
                <span className="mt-2 flex gap-1.5">
                  {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                    <span
                      key={token.value}
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: DEFAULT_HERO_PALETTE[token.value] }}
                      title={token.label}
                    />
                  ))}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange(
                    hero.useHeroPalette !== false
                      ? patchHeroPalette(hero, LIGHT_HERO_PALETTE)
                      : { palette: { ...LIGHT_HERO_PALETTE } }
                  )
                }
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left transition hover:border-neutral-400"
              >
                <span className="text-sm font-bold text-neutral-900">Light mode palette</span>
                <span className="mt-1 block text-xs text-neutral-500">
                  Fond blanc cassé, texte quasi-noir, orange #c2410c / teal #00875f.
                </span>
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
              <HeroColorField
                key={token.value}
                label={token.label}
                description={token.description}
                value={hero.palette?.[token.value] ?? DEFAULT_HERO_PALETTE[token.value]}
                onChange={(color) =>
                  onChange(
                    hero.useHeroPalette !== false
                      ? patchHeroPalette(hero, { [token.value]: color })
                      : // Manual mode: store the token for other sections without
                        // overwriting the Hero's manual hex fields.
                        {
                          palette: {
                            ...DEFAULT_HERO_PALETTE,
                            ...hero.palette,
                            [token.value]: color,
                          },
                        }
                  )
                }
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => onChange(applyHeroPaletteToPresentation(hero))}
            className="inline-flex w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
          >
            Apply palette to all bound colors
          </button>

          <p className="text-sm text-neutral-500">
            Elements bind to a token rather than a fixed hex — edit bindings per element from that
            element&apos;s own menu (e.g. Titre, CTA, Disponibilité, Stats, Portrait).
          </p>
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-6">
          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, section fill and motif follow palette tokens (Fond / Bordure). Turn off to pick colors freely below."
            enabledHint="Solid fill updates the Fond token; motif color updates the Motif token only."
            disabledHint="Manual mode — the color pickers below set hex values directly and are no longer overwritten by the palette."
          />

          <HeroBackgroundFillControls
            title="Section background"
            description="Base fill behind the entire hero. Use Global wallpaper to show the Global fixed image, or Image to override it for Hero only."
            fill={hero.heroSectionBackgroundFill}
            onFillChange={(heroSectionBackgroundFill) => onChange({ heroSectionBackgroundFill })}
            solidColor={hero.heroSectionBackgroundColor}
            onSolidColorChange={(heroSectionBackgroundColor) =>
              hero.useHeroPalette !== false
                ? onChange(
                    patchHeroPalette(hero, {
                      [mergeHeroColorBindings(DEFAULT_HERO_COLOR_BINDINGS, hero.colorBindings)
                        .sectionBackground]: heroSectionBackgroundColor,
                    })
                  )
                : onChange({ heroSectionBackgroundColor })
            }
            opacity={hero.heroSectionBackgroundOpacity}
            onOpacityChange={(heroSectionBackgroundOpacity) => onChange({ heroSectionBackgroundOpacity })}
            gradientType={hero.heroSectionBackgroundGradientType}
            onGradientTypeChange={(heroSectionBackgroundGradientType) => onChange({ heroSectionBackgroundGradientType })}
            gradientFrom={hero.heroSectionBackgroundGradientFrom}
            onGradientFromChange={(heroSectionBackgroundGradientFrom) => onChange({ heroSectionBackgroundGradientFrom })}
            gradientTo={hero.heroSectionBackgroundGradientTo}
            onGradientToChange={(heroSectionBackgroundGradientTo) => onChange({ heroSectionBackgroundGradientTo })}
            gradientAngle={hero.heroSectionBackgroundGradientAngle}
            onGradientAngleChange={(heroSectionBackgroundGradientAngle) => onChange({ heroSectionBackgroundGradientAngle })}
            previewStyle={heroSectionBackgroundStyle(hero) ?? {}}
            fillOptions={PORTFOLIO_HERO_SECTION_BACKGROUND_FILL_OPTIONS}
            imageUrl={hero.heroSectionBackgroundImageUrl}
            onImageUrlChange={(heroSectionBackgroundImageUrl) => onChange({ heroSectionBackgroundImageUrl })}
            imageSize={hero.heroSectionBackgroundImageSize}
            onImageSizeChange={(heroSectionBackgroundImageSize) => onChange({ heroSectionBackgroundImageSize })}
            imagePosition={hero.heroSectionBackgroundImagePosition}
            onImagePositionChange={(heroSectionBackgroundImagePosition) =>
              onChange({ heroSectionBackgroundImagePosition })
            }
            splitColorA={hero.heroSectionBackgroundColorA}
            onSplitColorAChange={(heroSectionBackgroundColorA) => onChange({ heroSectionBackgroundColorA })}
            splitColorB={hero.heroSectionBackgroundColorB}
            onSplitColorBChange={(heroSectionBackgroundColorB) => onChange({ heroSectionBackgroundColorB })}
            splitAxis={hero.heroSectionBackgroundSplitAxis}
            onSplitAxisChange={(heroSectionBackgroundSplitAxis) => onChange({ heroSectionBackgroundSplitAxis })}
            splitPosition={hero.heroSectionBackgroundSplitPosition}
            onSplitPositionChange={(heroSectionBackgroundSplitPosition) =>
              onChange({ heroSectionBackgroundSplitPosition })
            }
            dividerEnabled={hero.heroSectionBackgroundDividerEnabled}
            onDividerEnabledChange={(heroSectionBackgroundDividerEnabled) =>
              onChange({ heroSectionBackgroundDividerEnabled })
            }
            dividerShape={hero.heroSectionBackgroundDividerShape}
            onDividerShapeChange={(heroSectionBackgroundDividerShape) =>
              onChange({ heroSectionBackgroundDividerShape })
            }
            dividerAngle={hero.heroSectionBackgroundDividerAngle}
            onDividerAngleChange={(heroSectionBackgroundDividerAngle) =>
              onChange({ heroSectionBackgroundDividerAngle })
            }
            dividerCurveDepth={hero.heroSectionBackgroundDividerCurveDepth}
            onDividerCurveDepthChange={(heroSectionBackgroundDividerCurveDepth) =>
              onChange({ heroSectionBackgroundDividerCurveDepth })
            }
            dividerColor={hero.heroSectionBackgroundDividerColor}
            onDividerColorChange={(heroSectionBackgroundDividerColor) =>
              onChange({ heroSectionBackgroundDividerColor })
            }
            dividerThickness={hero.heroSectionBackgroundDividerThickness}
            onDividerThicknessChange={(heroSectionBackgroundDividerThickness) =>
              onChange({ heroSectionBackgroundDividerThickness })
            }
            dividerOpacity={hero.heroSectionBackgroundDividerOpacity}
            onDividerOpacityChange={(heroSectionBackgroundDividerOpacity) =>
              onChange({ heroSectionBackgroundDividerOpacity })
            }
          />

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Motif color token
            </p>
            <p className="text-sm text-neutral-500">
              Controls the right geometric shape and left pattern layers only — independent from
              the portrait frame and stats.
            </p>
            {hero.useHeroPalette !== false ? (
              <HeroColorSlotBinding
                slot="motif"
                label="Motif token"
                hero={hero}
                onChange={onChange}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
                Palette is off — set motif colors with the pickers below. Turn the palette back on to
                bind them to a token.
              </p>
            )}
          </div>

          <HeroBackgroundFillControls
            title="Right motif surface"
            description="Fill inside the geometric shape — solid color or gradient."
            fill={hero.heroMotifFill}
            onFillChange={(fill) => {
              if (fill === 'solid' || fill === 'gradient') onChange({ heroMotifFill: fill });
            }}
            solidColor={hero.motifColor}
            onSolidColorChange={(motifColor) =>
              hero.useHeroPalette !== false
                ? onChange(patchHeroSlotColor(hero, 'motif', motifColor))
                : onChange({ motifColor })
            }
            opacity={hero.heroMotifOpacity}
            onOpacityChange={(heroMotifOpacity) => onChange({ heroMotifOpacity })}
            gradientType={hero.heroMotifGradientType}
            onGradientTypeChange={(heroMotifGradientType) => onChange({ heroMotifGradientType })}
            gradientFrom={hero.motifColor}
            onGradientFromChange={(motifColor) => onChange({ motifColor })}
            gradientTo={hero.heroMotifGradientTo}
            onGradientToChange={(heroMotifGradientTo) => onChange({ heroMotifGradientTo })}
            gradientAngle={hero.heroMotifGradientAngle}
            onGradientAngleChange={(heroMotifGradientAngle) => onChange({ heroMotifGradientAngle })}
            previewStyle={{
              ...heroMotifPanelFillStyle(hero, hero.motifColor),
              clipPath: 'polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%)',
            }}
          />
        </div>
      ) : null}

      {subSection === 'availability' ? (
        <div className="space-y-6">
          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, badge colors follow palette tokens. Turn off to set text, frame, and dot colors freely below."
          />

          <HeroToggleRow
            label="Show availability badge"
            description="Status pill (available / unavailable) above the headline."
            checked={hero.showAvailabilityBadge}
            onChange={(showAvailabilityBadge) => onChange({ showAvailabilityBadge })}
          />

          <HeroOptionGrid
            label="Availability badge design"
            options={PORTFOLIO_HERO_AVAILABILITY_DESIGN_OPTIONS}
            value={hero.availabilityDesign}
            onChange={(availabilityDesign) => onChange({ availabilityDesign })}
            columns={2}
          />

          <HeroOptionGrid
            label="Desktop placement"
            options={PORTFOLIO_HERO_AVAILABILITY_PLACEMENT_OPTIONS}
            value={hero.availabilityPlacement}
            onChange={(availabilityPlacement) => onChange({ availabilityPlacement })}
            columns={2}
          />

          {hero.showAvailabilityBadge && !isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <HeroOptionGrid
              label="Desktop alignment"
              options={PORTFOLIO_HERO_DESKTOP_ALIGN_OPTIONS}
              value={hero.desktopAvailabilityAlign}
              onChange={(desktopAvailabilityAlign) => onChange({ desktopAvailabilityAlign })}
              columns={2}
            />
          ) : null}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Mobile & tablet placement</p>
              <p className="mt-1 text-sm text-neutral-500">
                Where the badge sits below the desktop breakpoint (stacked hero).
              </p>
            </div>
            <HeroOptionGrid
              label="Placement"
              options={PORTFOLIO_HERO_AVAILABILITY_PLACEMENT_OPTIONS}
              value={hero.mobileAvailabilityPlacement ?? hero.availabilityPlacement}
              onChange={(mobileAvailabilityPlacement) => onChange({ mobileAvailabilityPlacement })}
              columns={2}
            />
            {hero.showAvailabilityBadge ? (
              <HeroOptionGrid
                label="Alignment"
                options={PORTFOLIO_HERO_MOBILE_ALIGN_OPTIONS}
                value={hero.mobileAvailabilityAlign}
                onChange={(mobileAvailabilityAlign) => onChange({ mobileAvailabilityAlign })}
                columns={3}
              />
            ) : null}
            {hero.showAvailabilityBadge ? (
              <HeroCopyElementLayoutControls
                hero={hero}
                elementId="availability"
                onChange={onChange}
              />
            ) : null}
          </div>

          {hero.showAvailabilityBadge ? null : (
            <p className="rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
              Availability badge is hidden. Turn on “Show availability badge” above to edit design and
              content.
            </p>
          )}

          <div className={`space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4 ${hero.showAvailabilityBadge ? '' : 'pointer-events-none opacity-50'}`}>
            <p className="text-sm font-semibold text-neutral-950">Availability badge content</p>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Available phrase
              </span>
              <input
                type="text"
                value={hero.availabilityLabel}
                onChange={(event) => onChange({ availabilityLabel: event.target.value })}
                placeholder="Available for work"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Unavailable phrase
              </span>
              <input
                type="text"
                value={hero.availabilityUnavailableLabel}
                onChange={(event) => onChange({ availabilityUnavailableLabel: event.target.value })}
                placeholder="Currently unavailable"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroColorField
                label="Unavailable text"
                value={hero.availabilityUnavailableTextColor}
                onChange={(availabilityUnavailableTextColor) =>
                  onChange({ availabilityUnavailableTextColor })
                }
              />
              <HeroColorField
                label="Unavailable background"
                value={hero.availabilityUnavailableBackgroundColor}
                onChange={(availabilityUnavailableBackgroundColor) =>
                  onChange({ availabilityUnavailableBackgroundColor })
                }
              />
              <HeroColorField
                label="Unavailable border"
                value={hero.availabilityUnavailableBorderColor}
                onChange={(availabilityUnavailableBorderColor) =>
                  onChange({ availabilityUnavailableBorderColor })
                }
              />
              <HeroColorField
                label="Unavailable dot"
                value={hero.availabilityUnavailableDotColor}
                onChange={(availabilityUnavailableDotColor) =>
                  onChange({ availabilityUnavailableDotColor })
                }
              />
            </div>
            <HeroToggleRow
              label="Temps de réponse sur le badge"
              description="Affiche « · replies … » à côté de la phrase."
              checked={hero.showAvailabilityResponseTime}
              onChange={(showAvailabilityResponseTime) => onChange({ showAvailabilityResponseTime })}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Availability badge frame</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroColorField
                label="Text color"
                description="Linked to the blinking dot color — updating it recolors both."
                value={hero.availabilityTextColor}
                onChange={(availabilityTextColor) =>
                  onChange(
                    hero.useHeroPalette !== false
                      ? patchHeroPalette(hero, {
                          [mergeHeroColorBindings(DEFAULT_HERO_COLOR_BINDINGS, hero.colorBindings)
                            .availabilityDot]: availabilityTextColor,
                        })
                      : { availabilityTextColor }
                  )
                }
              />
              <HeroColorField
                label="Background"
                value={hero.availabilityBackgroundColor}
                onChange={(availabilityBackgroundColor) =>
                  onChange(
                    hero.useHeroPalette !== false
                      ? patchHeroSlotColor(hero, 'availabilityBackground', availabilityBackgroundColor)
                      : { availabilityBackgroundColor }
                  )
                }
              />
              <HeroColorField
                label="Border color"
                value={hero.availabilityBorderColor}
                onChange={(availabilityBorderColor) =>
                  onChange(
                    hero.useHeroPalette !== false
                      ? patchHeroSlotColor(hero, 'availabilityBorder', availabilityBorderColor)
                      : { availabilityBorderColor }
                  )
                }
              />
            </div>
            <HeroOptionGrid
              label="Border width"
              options={PORTFOLIO_HERO_AVAILABILITY_BORDER_WIDTH_OPTIONS}
              value={hero.availabilityBorderWidth}
              onChange={(availabilityBorderWidth) => onChange({ availabilityBorderWidth })}
              columns={2}
            />
            <HeroOptionGrid
              label="Corner radius"
              options={PORTFOLIO_HERO_AVAILABILITY_BORDER_RADIUS_OPTIONS}
              value={hero.availabilityBorderRadius}
              onChange={(availabilityBorderRadius) => onChange({ availabilityBorderRadius })}
              columns={3}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Status dot</p>
            <HeroToggleRow
              label="Show status dot"
              description="Small circle before the availability phrase."
              checked={hero.availabilityShowDot}
              onChange={(availabilityShowDot) => onChange({ availabilityShowDot })}
            />
            {hero.availabilityShowDot ? (
              <>
                <HeroColorField
                  label="Dot color"
                  description="Shared with the availability text color."
                  value={hero.availabilityDotColor}
                  onChange={(availabilityDotColor) =>
                    onChange(
                      hero.useHeroPalette !== false
                        ? patchHeroPalette(hero, {
                            [mergeHeroColorBindings(DEFAULT_HERO_COLOR_BINDINGS, hero.colorBindings)
                              .availabilityDot]: availabilityDotColor,
                          })
                        : { availabilityDotColor }
                    )
                  }
                />
                <HeroOptionGrid
                  label="Dot size"
                  options={PORTFOLIO_HERO_AVAILABILITY_DOT_SIZE_OPTIONS}
                  value={hero.availabilityDotSize}
                  onChange={(availabilityDotSize) => onChange({ availabilityDotSize })}
                  columns={3}
                />
                <HeroToggleRow
                  label="Pulse animation"
                  description="Animated ping on the status dot (live indicator)."
                  checked={hero.availabilityDotPulse}
                  onChange={(availabilityDotPulse) => onChange({ availabilityDotPulse })}
                />
              </>
            ) : null}
          </div>

          <HeroInlineTypography
            hero={hero}
            target="availabilityText"
            onChange={onChange}
            title="Availability text typography"
            extra={
              <div className="space-y-4">
                <HeroColorSlotBinding
                  slot="availabilityText"
                  label="Text token"
                  hero={hero}
                  onChange={onChange}
                />
                <HeroColorSlotBinding
                  slot="availabilityBackground"
                  label="Background token"
                  hero={hero}
                  onChange={onChange}
                />
                <HeroColorSlotBinding
                  slot="availabilityBorder"
                  label="Border token"
                  hero={hero}
                  onChange={onChange}
                />
                <HeroColorSlotBinding
                  slot="availabilityDot"
                  label="Dot token"
                  hero={hero}
                  onChange={onChange}
                />
              </div>
            }
          />
        </div>
      ) : null}

      {subSection === 'title' ? (
        <div className="space-y-6">
          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, headline colors follow palette tokens. Turn off to edit prefix / accent / headline colors freely."
          />

          <HeroOptionGrid
            label={
              isVerticalHeroDivision(resolveHeroLayoutDivision(hero))
                ? 'Headline alignment'
                : 'Headline mobile alignment'
            }
            options={PORTFOLIO_HERO_MOBILE_ALIGN_OPTIONS}
            value={hero.mobileAlignHeadline}
            onChange={(mobileAlignHeadline) => onChange({ mobileAlignHeadline })}
            columns={3}
          />

          {!isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <HeroOptionGrid
              label="Headline desktop alignment"
              options={PORTFOLIO_HERO_DESKTOP_ALIGN_OPTIONS}
              value={hero.desktopAlignHeadline}
              onChange={(desktopAlignHeadline) => onChange({ desktopAlignHeadline })}
              columns={2}
            />
          ) : null}

          <HeroCopyElementLayoutControls hero={hero} elementId="headline" onChange={onChange} />

          <HeroOptionGrid
            label="Headline accent"
            options={PORTFOLIO_HERO_HEADLINE_VALUE_OPTIONS}
            value={hero.heroHeadlineValue}
            onChange={(heroHeadlineValue) => onChange({ heroHeadlineValue })}
            columns={2}
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Headline prefix</p>
              <p className="mt-1 text-sm text-neutral-500">
                Text before the accent line — e.g. &quot;Hi, I&apos;m&quot; or &quot;Hello, I&apos;m&quot;.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {PORTFOLIO_HERO_HEADLINE_PREFIX_OPTIONS.map((option) => {
                const active = hero.heroHeadlinePrefix === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange({ heroHeadlinePrefix: option.value })}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
                  </button>
                );
              })}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-950">
                {isPresetHeroHeadlinePrefix(hero.heroHeadlinePrefix) ? 'Custom prefix' : 'Custom prefix (active)'}
              </label>
              <input
                type="text"
                value={hero.heroHeadlinePrefix}
                onChange={(event) => onChange({ heroHeadlinePrefix: event.target.value })}
                placeholder="Hi, I'm"
                maxLength={80}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-neutral-950">Free text placement</span>
                <span className="mt-1 block text-sm text-neutral-500">
                  Drag the headline, pitch, and contact button anywhere on the hero (desktop).
                </span>
              </span>
              <input
                type="checkbox"
                checked={hero.heroCopyPlacementMode === 'free'}
                onChange={(event) =>
                  onChange({
                    heroCopyPlacementMode: event.target.checked ? 'free' : 'flow',
                    ...(event.target.checked
                      ? { heroCopyPosition: defaultHeroCopyPositionForLayout(hero.heroLayoutFlipped) }
                      : {}),
                  })
                }
                className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
              />
            </label>

            {hero.heroCopyPlacementMode === 'free' ? (
              <HeroDesktopOnlyCanvas label="Copy free placement">
                <PortfolioHeroCopyPositionEditor
                  position={hero.heroCopyPosition}
                  layoutFlipped={hero.heroLayoutFlipped}
                  onChange={(heroCopyPosition) => onChange({ heroCopyPosition })}
                />
              </HeroDesktopOnlyCanvas>
            ) : null}
          </div>

          <HeroInlineTypography
            hero={hero}
            target="headlinePrefix"
            onChange={onChange}
            title="Prefix typography"
            extra={
              <HeroColorSlotBinding
                slot="headlinePrefix"
                label="Palette token"
                hero={hero}
                onChange={onChange}
              />
            }
          />
          <HeroInlineTypography
            hero={hero}
            target="headlineAccent"
            onChange={onChange}
            title="Accent typography"
            extra={
              <HeroColorSlotBinding
                slot="headlineAccent"
                label="Palette token"
                hero={hero}
                onChange={onChange}
              />
            }
          />
          <HeroInlineTypography
            hero={hero}
            target="headline"
            onChange={onChange}
            title="Headline typography"
            extra={
              <HeroColorSlotBinding
                slot="headline"
                label="Palette token"
                hero={hero}
                onChange={onChange}
              />
            }
          />

          <HeroOptionGrid
            label="Headline display font"
            options={PORTFOLIO_HERO_HEADLINE_FONT_OPTIONS}
            value={hero.headlineFont}
            onChange={(headlineFont) => onChange({ headlineFont })}
            columns={3}
          />
        </div>
      ) : null}

      {subSection === 'description' ? (
        <div className="space-y-6">
          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, description color follows its palette token. Turn off to pick the text color freely."
          />

          <HeroOptionGrid
            label={
              isVerticalHeroDivision(resolveHeroLayoutDivision(hero))
                ? 'Description alignment'
                : 'Description mobile alignment'
            }
            options={PORTFOLIO_HERO_MOBILE_ALIGN_OPTIONS}
            value={hero.mobileAlignDescription}
            onChange={(mobileAlignDescription) => onChange({ mobileAlignDescription })}
            columns={3}
          />

          {!isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <HeroOptionGrid
              label="Description desktop alignment"
              options={PORTFOLIO_HERO_DESKTOP_ALIGN_OPTIONS}
              value={hero.desktopAlignDescription}
              onChange={(desktopAlignDescription) => onChange({ desktopAlignDescription })}
              columns={2}
            />
          ) : null}

          <HeroCopyElementLayoutControls
            hero={hero}
            elementId="description"
            onChange={onChange}
          />

          <HeroInlineTypography
            hero={hero}
            target="description"
            onChange={onChange}
            title="Description typography"
            extra={
              <HeroColorSlotBinding
                slot="description"
                label="Palette token"
                hero={hero}
                onChange={onChange}
              />
            }
          />
        </div>
      ) : null}

      {subSection === 'tools' ? (
        <div className="space-y-6">
          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, tools label and icon surface colors follow palette tokens. Turn off to set them freely below."
          />

          <HeroToggleRow
            label="Show tools row"
            description="Display software icons under the hero pitch."
            checked={hero.showTools}
            onChange={(showTools) => onChange({ showTools })}
          />
          {hero.showTools ? (
            <>
              <HeroToggleRow
                label="Show tools label"
                description="Caption above the icon row — e.g. “Preferred tools”."
                checked={hero.showToolsLabel}
                onChange={(showToolsLabel) => onChange({ showToolsLabel })}
              />
              {hero.showToolsLabel ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Tools label text
                  </p>
                  <input
                    type="text"
                    value={hero.toolsLabelText}
                    placeholder="Preferred tools"
                    maxLength={80}
                    onChange={(event) => onChange({ toolsLabelText: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              ) : null}
            </>
          ) : null}

          <HeroOptionGrid
            label={
              isVerticalHeroDivision(resolveHeroLayoutDivision(hero))
                ? 'Tools row alignment'
                : 'Tools row mobile alignment'
            }
            options={PORTFOLIO_HERO_MOBILE_ALIGN_OPTIONS}
            value={hero.mobileAlignTools}
            onChange={(mobileAlignTools) => onChange({ mobileAlignTools })}
            columns={3}
          />

          {!isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <HeroOptionGrid
              label="Tools row desktop alignment"
              options={PORTFOLIO_HERO_DESKTOP_ALIGN_OPTIONS}
              value={hero.desktopAlignTools}
              onChange={(desktopAlignTools) => onChange({ desktopAlignTools })}
              columns={2}
            />
          ) : null}

          <HeroCopyElementLayoutControls hero={hero} elementId="tools" onChange={onChange} />

          {normalizedTools.length > 0 ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Tool icons</p>
              <p className="mt-1 text-sm text-neutral-500">
                Choose which software icons appear under the hero. Leave all selected to show your full list.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {normalizedTools.map((tool) => {
                  const active = selectedTools.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-950 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <CreatorToolLogo label={tool} size={22} />
                      {tool}
                    </button>
                  );
                })}
              </div>
              {hero.selectedTools.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onChange({ selectedTools: [] })}
                  className="mt-3 text-sm font-semibold text-neutral-500 hover:text-neutral-800"
                >
                  Reset to all tools
                </button>
              ) : null}
            </div>
          ) : null}

          <HeroInlineTypography
            hero={hero}
            target="toolsLabel"
            onChange={onChange}
            title="Tools label typography"
            extra={
              <div className="space-y-4">
                <HeroColorSlotBinding
                  slot="toolsLabel"
                  label="Label token"
                  hero={hero}
                  onChange={onChange}
                />
                <HeroColorSlotBinding
                  slot="toolsIconBackground"
                  label="Icon background token"
                  hero={hero}
                  onChange={onChange}
                />
                <HeroColorSlotBinding
                  slot="toolsIconBorder"
                  label="Icon border token"
                  hero={hero}
                  onChange={onChange}
                />
              </div>
            }
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Tools icon surface
            </p>
            <HeroColorField
              label="Background"
              value={hero.toolsIconBackgroundColor}
              onChange={(toolsIconBackgroundColor) =>
                onChange(
                  hero.useHeroPalette !== false
                    ? patchHeroSlotColor(hero, 'toolsIconBackground', toolsIconBackgroundColor)
                    : { toolsIconBackgroundColor }
                )
              }
            />
            <HeroColorField
              label="Border"
              value={hero.toolsIconBorderColor}
              onChange={(toolsIconBorderColor) =>
                onChange(
                  hero.useHeroPalette !== false
                    ? patchHeroSlotColor(hero, 'toolsIconBorder', toolsIconBorderColor)
                    : { toolsIconBorderColor }
                )
              }
            />
            <HeroOptionGrid
              label="Border width"
              options={PORTFOLIO_HERO_AVAILABILITY_BORDER_WIDTH_OPTIONS}
              value={hero.toolsIconBorderWidth}
              onChange={(toolsIconBorderWidth) => onChange({ toolsIconBorderWidth })}
              columns={2}
            />
            <HeroOptionGrid
              label="Corner radius"
              options={PORTFOLIO_HERO_AVAILABILITY_BORDER_RADIUS_OPTIONS}
              value={hero.toolsIconBorderRadius}
              onChange={(toolsIconBorderRadius) => onChange({ toolsIconBorderRadius })}
              columns={3}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'cta' ? (
        <div className="space-y-6">
          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, contact button colors follow palette tokens. Turn off to set text, fill, and border freely."
          />

          <HeroToggleRow
            label="Show contact button"
            description='Primary "Contact me" button in the hero.'
            checked={hero.showContactCta}
            onChange={(showContactCta) => onChange({ showContactCta })}
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <HeroToggleRow
              label="Secondary button beside contact"
              description='Extra link next to “Contact me” (e.g. “View my work”). Choose which section it opens.'
              checked={Boolean(hero.showSecondaryCta)}
              onChange={(showSecondaryCta) =>
                onChange({
                  showSecondaryCta,
                  secondaryCtaLabel: hero.secondaryCtaLabel || 'View my work',
                  secondaryCtaTarget: hero.secondaryCtaTarget || 'work',
                  secondaryCtaDesign: hero.secondaryCtaDesign || 'text-arrow',
                })
              }
            />
            {hero.showSecondaryCta ? (
              <>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Secondary button label
                  </span>
                  <input
                    type="text"
                    value={hero.secondaryCtaLabel ?? 'View my work'}
                    onChange={(event) => onChange({ secondaryCtaLabel: event.target.value })}
                    placeholder="View my work"
                    maxLength={80}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </label>
                <HeroOptionGrid
                  label="Points to section"
                  options={PORTFOLIO_HERO_SECONDARY_CTA_TARGET_OPTIONS}
                  value={hero.secondaryCtaTarget ?? 'work'}
                  onChange={(secondaryCtaTarget) => onChange({ secondaryCtaTarget })}
                  columns={2}
                />
                <HeroOptionGrid
                  label="Secondary button design"
                  options={PORTFOLIO_HERO_CTA_DESIGN_OPTIONS}
                  value={hero.secondaryCtaDesign ?? 'text-arrow'}
                  onChange={(secondaryCtaDesign) => onChange({ secondaryCtaDesign })}
                  columns={2}
                />
              </>
            ) : null}
          </div>

          <HeroOptionGrid
            label="Contact button design"
            options={PORTFOLIO_HERO_CTA_DESIGN_OPTIONS}
            value={hero.ctaDesign}
            onChange={(ctaDesign) => onChange({ ctaDesign })}
            columns={2}
          />

          <HeroOptionGrid
            label="Contact button placement"
            options={
              isVerticalHeroDivision(resolveHeroLayoutDivision(hero))
                ? PORTFOLIO_HERO_CTA_PLACEMENT_OPTIONS.filter(
                    (option) =>
                      option.value !== 'above-stats' && option.value !== 'below-stats'
                  )
                : PORTFOLIO_HERO_CTA_PLACEMENT_OPTIONS
            }
            value={
              hero.ctaPlacement === 'above-stats' ||
              hero.ctaPlacement === 'below-stats' ||
              hero.ctaPlacement === 'free-zone'
                ? 'below-tools'
                : hero.ctaPlacement
            }
            onChange={(ctaPlacement) => onChange({ ctaPlacement })}
            columns={3}
          />

          <HeroCopyElementLayoutControls hero={hero} elementId="cta" onChange={onChange} />

          <HeroOptionGrid
            label={
              isVerticalHeroDivision(resolveHeroLayoutDivision(hero))
                ? 'Contact button alignment'
                : 'Contact button mobile alignment'
            }
            options={PORTFOLIO_HERO_MOBILE_ALIGN_OPTIONS}
            value={hero.mobileAlignCta}
            onChange={(mobileAlignCta) => onChange({ mobileAlignCta })}
            columns={3}
          />

          {!isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <HeroOptionGrid
              label="Contact button desktop alignment"
              options={PORTFOLIO_HERO_DESKTOP_ALIGN_OPTIONS}
              value={hero.desktopAlignCta}
              onChange={(desktopAlignCta) => onChange({ desktopAlignCta })}
              columns={2}
            />
          ) : null}

          <HeroInlineTypography
            hero={hero}
            target="cta"
            onChange={onChange}
            title="Contact button typography"
            extra={
              <div className="space-y-4">
                <HeroColorSlotBinding slot="ctaText" label="Text token" hero={hero} onChange={onChange} />
                <HeroColorSlotBinding
                  slot="ctaBackground"
                  label="Background token"
                  hero={hero}
                  onChange={onChange}
                />
                <HeroColorSlotBinding
                  slot="ctaBorder"
                  label="Border token"
                  hero={hero}
                  onChange={onChange}
                />
              </div>
            }
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Contact CTA surface
            </p>
            <HeroToggleRow
              label="Background"
              description="Paint a fill behind the Contact me label."
              checked={hero.ctaBackgroundEnabled}
              onChange={(ctaBackgroundEnabled) => onChange({ ctaBackgroundEnabled })}
            />
            {hero.ctaBackgroundEnabled ? (
              <HeroColorField
                label="Background color"
                description="Linked to the headline specialty accent — updating it recolors both."
                value={hero.ctaBackgroundColor}
                onChange={(ctaBackgroundColor) =>
                  onChange(
                    hero.useHeroPalette !== false
                      ? patchHeroPalette(hero, {
                          [mergeHeroColorBindings(DEFAULT_HERO_COLOR_BINDINGS, hero.colorBindings)
                            .headlineAccent]: ctaBackgroundColor,
                        })
                      : { ctaBackgroundColor }
                  )
                }
              />
            ) : null}
            <HeroToggleRow
              label="Border"
              description="Outline around the Contact me control."
              checked={hero.ctaBorderEnabled}
              onChange={(ctaBorderEnabled) => onChange({ ctaBorderEnabled })}
            />
            {hero.ctaBorderEnabled ? (
              <>
                <HeroColorField
                  label="Border color"
                  value={hero.ctaBorderColor}
                  onChange={(ctaBorderColor) =>
                    onChange(
                      hero.useHeroPalette !== false
                        ? patchHeroSlotColor(hero, 'ctaBorder', ctaBorderColor)
                        : { ctaBorderColor }
                    )
                  }
                />
                <HeroOptionGrid
                  label="Border width"
                  options={PORTFOLIO_HERO_AVAILABILITY_BORDER_WIDTH_OPTIONS}
                  value={hero.ctaBorderWidth}
                  onChange={(ctaBorderWidth) => onChange({ ctaBorderWidth })}
                  columns={2}
                />
              </>
            ) : null}
            <HeroOptionGrid
              label="Corner radius"
              options={PORTFOLIO_HERO_AVAILABILITY_BORDER_RADIUS_OPTIONS}
              value={hero.ctaBorderRadius}
              onChange={(ctaBorderRadius) => onChange({ ctaBorderRadius })}
              columns={3}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'motifs' ? (
        <div className="space-y-5">
          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, motif colors follow the Motif palette token. Turn off to set each layer’s color freely."
          />

          <p className="text-sm text-neutral-500">
            Add one or more shapes and patterns. Place them anywhere — each motif can show on
            mobile/tablet, desktop, or both.
          </p>

          {isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <p className="rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-950">
              Vertical stack mode: left/right side motifs stay off by default. Use{' '}
              <span className="font-semibold">Reset to frame start</span> so a motif fills the
              content-width frame (respects Global content width &amp; side margins) without outer
              empty gutters.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={motifs.length >= MAX_HERO_MOTIFS}
              onClick={() => {
                const division = resolveHeroLayoutDivision(hero);
                const defaults = defaultHeroMotifTransformForDivision(division, 'geometric');
                applyMotifs([
                  ...motifs,
                  createGeometricMotif({
                    label: `Shape ${motifs.filter((m) => m.kind === 'geometric').length + 1}`,
                    position: defaults.position,
                    size: defaults.size,
                    ...(isVerticalHeroDivision(division)
                      ? { enabled: true, visibility: { mobile: false, desktop: true } }
                      : {}),
                  }),
                ]);
              }}
              className="inline-flex min-h-10 items-center rounded-full border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add shape
            </button>
            <button
              type="button"
              disabled={motifs.length >= MAX_HERO_MOTIFS}
              onClick={() => {
                const division = resolveHeroLayoutDivision(hero);
                const defaults = defaultHeroMotifTransformForDivision(division, 'pattern');
                applyMotifs([
                  ...motifs,
                  createPatternMotif({
                    label: `Pattern ${motifs.filter((m) => m.kind === 'pattern').length + 1}`,
                    position: defaults.position,
                    size: defaults.size,
                    ...(isVerticalHeroDivision(division)
                      ? { enabled: true, visibility: { mobile: false, desktop: true } }
                      : {}),
                  }),
                ]);
              }}
              className="inline-flex min-h-10 items-center rounded-full border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add pattern
            </button>
            {motifs.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  const division = resolveHeroLayoutDivision(hero);
                  applyMotifs(
                    motifs.map((motif) => resetHeroMotifToDivisionDefault(motif, division))
                  );
                }}
                className="inline-flex min-h-10 items-center rounded-full border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
              >
                Reset all to frame start
              </button>
            ) : null}
          </div>

          {motifs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-8 text-center text-sm text-neutral-500">
              No motifs yet. Add a shape or pattern to decorate the hero.
            </div>
          ) : null}

          <div className="space-y-4">
            {motifs.map((motif, index) => (
              <div
                key={motif.id}
                className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-950">
                      {motif.label || `${motif.kind === 'geometric' ? 'Shape' : 'Pattern'} ${index + 1}`}
                    </p>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
                      {motif.kind === 'geometric' ? 'Geometric shape' : 'Pattern fill'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-700">
                      <input
                        type="checkbox"
                        checked={motif.enabled}
                        onChange={(event) => patchMotif(motif.id, { enabled: event.target.checked })}
                        className="h-4 w-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
                      />
                      On
                    </label>
                    <button
                      type="button"
                      onClick={() => applyMotifs(motifs.filter((item) => item.id !== motif.id))}
                      className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {motif.enabled ? (
                  <div className="mt-4 space-y-4 border-t border-neutral-100 pt-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Visibility
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            patchMotif(motif.id, {
                              visibility: {
                                ...motif.visibility,
                                mobile: !motif.visibility.mobile,
                              },
                            })
                          }
                          className={`inline-flex min-h-10 items-center rounded-full px-3.5 text-sm font-semibold transition ${
                            motif.visibility.mobile
                              ? 'bg-neutral-950 text-white'
                              : 'border border-neutral-300 bg-white text-neutral-700'
                          }`}
                        >
                          Mobile / tablet
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            patchMotif(motif.id, {
                              visibility: {
                                ...motif.visibility,
                                desktop: !motif.visibility.desktop,
                              },
                            })
                          }
                          className={`inline-flex min-h-10 items-center rounded-full px-3.5 text-sm font-semibold transition ${
                            motif.visibility.desktop
                              ? 'bg-neutral-950 text-white'
                              : 'border border-neutral-300 bg-white text-neutral-700'
                          }`}
                        >
                          Desktop
                        </button>
                      </div>
                    </div>

                    {motif.kind === 'geometric' ? (
                      <HeroOptionGrid
                        label="Shape"
                        options={PORTFOLIO_HERO_MOTIF_OPTIONS}
                        value={motif.shape}
                        onChange={(shape) =>
                          patchMotif(motif.id, {
                            shape,
                            ...(shape === 'custom' && motif.points.length < 3
                              ? {
                                  points: DEFAULT_CUSTOM_MOTIF_POINTS.map((point) => ({
                                    ...point,
                                  })),
                                }
                              : {}),
                          })
                        }
                        columns={3}
                      />
                    ) : (
                      <HeroOptionGrid
                        label="Pattern"
                        options={PORTFOLIO_HERO_LEFT_MOTIF_OPTIONS.filter(
                          (option) => option.value !== 'none'
                        )}
                        value={motif.pattern}
                        onChange={(pattern) => {
                          if (pattern === 'none') return;
                          patchMotif(motif.id, {
                            pattern,
                            ...(pattern === 'custom' && motif.points.length < 3
                              ? {
                                  points: DEFAULT_LEFT_CUSTOM_MOTIF_POINTS.map((point) => ({
                                    ...point,
                                  })),
                                }
                              : {}),
                          });
                        }}
                        columns={2}
                      />
                    )}

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Placement & size
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Drag the center to move, corners to resize. Coordinates are relative to the
                        content-width frame (Global width + side margins).
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          patchMotif(
                            motif.id,
                            resetHeroMotifToDivisionDefault(
                              motif,
                              resolveHeroLayoutDivision(hero)
                            )
                          )
                        }
                        className="mt-3 inline-flex min-h-10 items-center rounded-full border border-neutral-300 bg-white px-3.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                      >
                        Reset to frame start
                      </button>
                      <div className="mt-3">
                        <PortfolioHeroMotifCanvasEditor
                          side={
                            motif.kind === 'geometric'
                              ? motif.position.x < 50
                                ? 'left'
                                : 'right'
                              : 'left'
                          }
                          points={
                            motif.kind === 'geometric'
                              ? resolveMotifPoints(
                                  motif.shape,
                                  motif.points,
                                  motif.position.x < 50 ? 'left' : 'right'
                                )
                              : motif.pattern === 'custom'
                                ? motif.points
                                : getMotifTemplatePoints('rectangle', 'left')
                          }
                          color={motif.color}
                          position={motif.position}
                          size={motif.size}
                          showTemplates={
                            motif.kind === 'geometric'
                              ? motif.shape === 'custom'
                              : motif.pattern === 'custom'
                          }
                          onChangePoints={(points) =>
                            patchMotif(motif.id, {
                              points,
                              ...(motif.kind === 'geometric'
                                ? { shape: 'custom' }
                                : { pattern: 'custom' }),
                            })
                          }
                          onChangeTransform={({ position, size }) =>
                            patchMotif(motif.id, {
                              ...(position ? { position } : {}),
                              ...(size ? { size } : {}),
                            })
                          }
                        />
                      </div>
                    </div>

                    <HeroColorField
                      label="Color"
                      description={
                        hero.useHeroPalette !== false
                          ? 'Follows the Motif token above — independent from the portrait frame.'
                          : undefined
                      }
                      value={motif.color}
                      onChange={(color) =>
                        hero.useHeroPalette !== false
                          ? onChange(patchHeroSlotColor(hero, 'motif', color))
                          : patchMotif(motif.id, { color })
                      }
                    />

                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                          Opacity
                        </p>
                        <span className="text-sm font-semibold text-neutral-700">
                          {motif.opacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={1}
                        value={motif.opacity}
                        onChange={(event) =>
                          patchMotif(motif.id, { opacity: Number(event.target.value) })
                        }
                        className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                        aria-label={`${motif.label} opacity`}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {subSection === 'portrait' ? (
        <div className="space-y-5">
        <HeroUsePaletteToggle
          hero={hero}
          onChange={onChange}
          description="When on, frame / mat / caption colors follow palette tokens. Turn off to set them freely below."
        />

        <HeroToggleRow
          label="Show portrait"
          description="Photo in the hero — mobile stack and desktop floating portrait."
          checked={hero.showPortrait}
          onChange={(showPortrait) => onChange({ showPortrait })}
        />

        {hero.showPortrait ? (
        <>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Portrait designs
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Noir / snow cards matching the padded reference — photo inset, gap, then name + specialty
            inside the frame. Re-select a template to load the latest factory.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PORTFOLIO_HERO_PORTRAIT_DESIGNS.map((design) => {
              const active = hero.activePortraitDesignId === design.id;
              return (
              <button
                key={design.id}
                type="button"
                onClick={() => onChange(selectPortraitDesign(design.id as PortraitDesignId, hero))}
                className={`rounded-2xl border p-3 text-left transition ${
                  active
                    ? 'border-neutral-900 bg-neutral-950 text-white'
                    : 'border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50/80'
                }`}
              >
                <div
                  className={`relative mx-auto aspect-[4/5] w-full max-w-[140px] overflow-hidden rounded-xl p-2 ${design.preview.shell}`}
                >
                  {design.preview.header && design.preview.specialty ? (
                    <div
                      className="mb-1 flex items-center justify-center rounded-sm py-1"
                      style={{
                        backgroundColor: design.preview.bar?.color ?? '#0A0A0A',
                      }}
                    >
                      <span
                        className="text-[7px] font-semibold tracking-widest"
                        style={{ color: design.preview.specialty.color }}
                      >
                        SPECIALTY
                      </span>
                    </div>
                  ) : null}
                  <div className={`relative h-full w-full overflow-hidden ${design.preview.photo}`}>
                    {design.preview.bar && !design.preview.header ? (
                      <div
                        className={`absolute inset-x-0 ${
                          design.preview.bar.edge === 'top' ? 'top-0' : 'bottom-0'
                        }`}
                        style={{
                          height: `${design.preview.bar.heightPct}%`,
                          backgroundColor: design.preview.bar.color,
                        }}
                      />
                    ) : null}
                    {!design.preview.footer ? (
                      <>
                        <span
                          className={`absolute text-[9px] font-bold leading-none ${
                            design.preview.name.placement.includes('right')
                              ? 'right-1.5'
                              : design.preview.name.placement.includes('center')
                                ? 'left-1/2 -translate-x-1/2'
                                : 'left-1.5'
                          } ${
                            design.preview.name.placement.includes('top')
                              ? 'top-1.5'
                              : 'bottom-1.5'
                          }`}
                          style={{ color: design.preview.name.color }}
                        >
                          Name
                        </span>
                        {design.preview.specialty && !design.preview.header ? (
                          <span
                            className={`absolute text-[8px] leading-none ${
                              design.preview.specialty.placement.includes('right')
                                ? 'right-1.5'
                                : design.preview.specialty.placement.includes('center')
                                  ? 'left-1/2 -translate-x-1/2'
                                  : 'left-1.5'
                            } ${
                              design.preview.specialty.placement.includes('top')
                                ? 'top-1.5'
                                : 'bottom-3.5'
                            }`}
                            style={{ color: design.preview.specialty.color }}
                          >
                            Specialty
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                  {design.preview.footer ? (
                    <div
                      className={`mt-1.5 flex flex-col gap-0.5 ${
                        design.preview.name.placement.includes('center')
                          ? 'items-center text-center'
                          : design.preview.name.placement.includes('right')
                            ? 'items-end text-right'
                            : 'items-start text-left'
                      }`}
                    >
                      <span
                        className="text-[9px] font-bold leading-none"
                        style={{ color: design.preview.name.color }}
                      >
                        Name
                      </span>
                      {design.preview.specialty ? (
                        <span
                          className="text-[8px] leading-none"
                          style={{ color: design.preview.specialty.color }}
                        >
                          Specialty
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <p className={`mt-3 text-sm font-semibold ${active ? 'text-white' : 'text-neutral-950'}`}>
                  {design.label}
                </p>
                <p className={`mt-1 text-xs leading-relaxed ${active ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {design.ergonomics}
                </p>
              </button>
            );
            })}
          </div>
          {hero.activePortraitDesignId ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 px-4 py-3">
              <p className="text-sm text-neutral-600">
                Configuring{' '}
                <span className="font-semibold text-neutral-950">
                  {PORTFOLIO_HERO_PORTRAIT_DESIGNS.find((d) => d.id === hero.activePortraitDesignId)
                    ?.label ?? hero.activePortraitDesignId}
                </span>
                — fine-tunes below are saved to this template.
              </p>
              <button
                type="button"
                onClick={() =>
                  onChange(
                    resetPortraitDesign(hero.activePortraitDesignId as PortraitDesignId, hero)
                  )
                }
                className="rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Reset template
              </button>
            </div>
          ) : null}
        </div>

        <div>
          {isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <HeroVerticalCellPicker
              label="Portrait placement"
              description="Snap inside the visual half. Top row sits flush under the division line (no empty gap)."
              value={resolvePortraitVerticalCell(hero)}
              onChange={(portraitVerticalCell) => {
                onChange({
                  portraitVerticalCell,
                  portraitPositionVertical: heroVerticalCellToPosition(portraitVerticalCell),
                });
              }}
            />
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Portrait placement
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Drag freely on the preview — same controls as the custom motif editor.
              </p>
              <div className="mt-3">
                <HeroDesktopOnlyCanvas label="Portrait placement">
                  <PortfolioHeroProfilePositionEditor
                    position={hero.portraitPosition}
                    motifColor={hero.motifColor}
                    motifShape={hero.motifShape}
                    customMotifPoints={hero.customMotifPoints}
                    onChange={(portraitPosition) => {
                      patchPortrait({ portraitPosition });
                    }}
                  />
                </HeroDesktopOnlyCanvas>
              </div>
            </>
          )}
        </div>

        <HeroToggleRow
          label="Show portrait frame"
          description="Border, mat fill, and padding around the photo — disable for a frameless look."
          checked={hero.showPortraitFrame}
          onChange={(showPortraitFrame) => patchPortrait({ showPortraitFrame })}
        />

        {hero.showPortraitFrame ? (
          <>
            <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Portrait color tokens
              </p>
              <p className="text-sm text-neutral-500">
                Frame border, mat fill, and caption plate each have their own token — independent
                from the motif and from each other.
              </p>
              {hero.useHeroPalette !== false ? (
                <div className="space-y-4">
                  <HeroColorSlotBinding
                    slot="portraitFrame"
                    label="Frame border token"
                    hero={hero}
                    onChange={onChange}
                  />
                  <HeroColorSlotBinding
                    slot="portraitMat"
                    label="Mat fill token"
                    hero={hero}
                    onChange={onChange}
                  />
                  <HeroColorSlotBinding
                    slot="portraitCaptionBar"
                    label="Caption plate token"
                    hero={hero}
                    onChange={onChange}
                  />
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
                  Palette is off — set frame, mat, and caption colors with the pickers below.
                </p>
              )}
            </div>

            <HeroColorField
              label="Frame border color"
              value={hero.portraitFrameColor}
              onChange={(portraitFrameColor) =>
                patchPortrait(
                  hero.useHeroPalette !== false
                    ? patchHeroSlotColor(hero, 'portraitFrame', portraitFrameColor)
                    : { portraitFrameColor }
                )
              }
            />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Frame border width</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PORTFOLIO_HERO_FRAME_WIDTH_OPTIONS.map((option) => {
                  const active = hero.portraitFrameWidth === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => patchPortrait({ portraitFrameWidth: option.value })}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-950 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <HeroPxSlider
                  label="Custom border width"
                  value={hero.portraitFrameWidth}
                  max={24}
                  onChange={(portraitFrameWidth) => patchPortrait({ portraitFrameWidth })}
                />
              </div>
            </div>

            <HeroOpacitySlider
              label="Border opacity"
              value={hero.portraitFrameBorderOpacity}
              onChange={(portraitFrameBorderOpacity) =>
                patchPortrait({ portraitFrameBorderOpacity })
              }
            />

            <HeroColorField
              label="Frame background"
              value={hero.portraitFrameBackgroundColor}
              onChange={(portraitFrameBackgroundColor) =>
                patchPortrait(
                  hero.useHeroPalette !== false
                    ? patchHeroSlotColor(hero, 'portraitMat', portraitFrameBackgroundColor)
                    : { portraitFrameBackgroundColor }
                )
              }
            />

            <HeroOpacitySlider
              label="Background opacity"
              value={hero.portraitFrameBackgroundOpacity}
              onChange={(portraitFrameBackgroundOpacity) =>
                patchPortrait({ portraitFrameBackgroundOpacity })
              }
            />

            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Frame padding
              </p>
              <HeroPxSlider
                label="Padding top"
                value={hero.portraitFramePaddingTop}
                max={PORTRAIT_FRAME_PADDING_MAX}
                onChange={(portraitFramePaddingTop) => patchPortrait({ portraitFramePaddingTop })}
              />
              <HeroPxSlider
                label="Padding bottom"
                value={hero.portraitFramePaddingBottom}
                max={PORTRAIT_FRAME_PADDING_MAX}
                onChange={(portraitFramePaddingBottom) =>
                  patchPortrait({ portraitFramePaddingBottom })
                }
              />
              <HeroPxSlider
                label="Padding left"
                value={hero.portraitFramePaddingLeft}
                max={PORTRAIT_FRAME_PADDING_MAX}
                onChange={(portraitFramePaddingLeft) => patchPortrait({ portraitFramePaddingLeft })}
              />
              <HeroPxSlider
                label="Padding right"
                value={hero.portraitFramePaddingRight}
                max={PORTRAIT_FRAME_PADDING_MAX}
                onChange={(portraitFramePaddingRight) =>
                  patchPortrait({ portraitFramePaddingRight })
                }
              />
            </div>
          </>
        ) : null}

        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Photo autofit
          </p>
          <p className="text-sm text-neutral-500">
            Auto-resize and reframe the profile photo inside the template window.
          </p>
          <HeroOptionGrid
            label="Fit mode"
            options={PORTFOLIO_HERO_OBJECT_FIT_OPTIONS}
            value={hero.portraitObjectFit}
            onChange={(portraitObjectFit) => patchPortrait({ portraitObjectFit })}
            columns={2}
          />
          <HeroPxSlider
            label="Focus X"
            value={hero.portraitFocusX}
            min={0}
            max={100}
            unit="%"
            onChange={(portraitFocusX) => patchPortrait({ portraitFocusX })}
          />
          <HeroPxSlider
            label="Focus Y"
            value={hero.portraitFocusY}
            min={0}
            max={100}
            unit="%"
            onChange={(portraitFocusY) => patchPortrait({ portraitFocusY })}
          />
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Zoom</p>
              <span className="text-sm font-semibold text-neutral-700">{hero.portraitImageScale}%</span>
            </div>
            <input
              type="range"
              min={100}
              max={160}
              step={1}
              value={hero.portraitImageScale}
              onChange={(event) =>
                patchPortrait({ portraitImageScale: Number(event.target.value) })
              }
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="Zoom"
            />
          </div>
        </div>

        <HeroOptionGrid
          label="Portrait size"
          options={PORTFOLIO_HERO_PORTRAIT_SIZE_OPTIONS}
          value={hero.portraitSize}
          onChange={(portraitSize) => patchPortrait({ portraitSize })}
          columns={3}
        />

        <HeroOptionGrid
          label="Portrait corners"
          options={PORTFOLIO_HERO_PORTRAIT_RADIUS_OPTIONS}
          value={hero.portraitRadius}
          onChange={(portraitRadius) => patchPortrait({ portraitRadius })}
          columns={2}
        />

        <HeroOptionGrid
          label="Caption layout"
          options={PORTFOLIO_HERO_CAPTION_LAYOUT_OPTIONS}
          value={hero.portraitCaptionLayout}
          onChange={(portraitCaptionLayout) => patchPortrait({ portraitCaptionLayout })}
          columns={3}
        />

        <HeroToggleRow
          label="Show creator name"
          description="Show your name with the portrait — below it, on the photo, or in the mat footer."
          checked={hero.showCreatorName}
          onChange={(showCreatorName) => patchPortrait({ showCreatorName })}
        />

        {hero.showCreatorName ? (
          <>
            {hero.portraitCaptionLayout === 'on-photo' ||
            hero.portraitCaptionLayout === 'mat-header' ? (
              <HeroToggleRow
                label="Name inside portrait frame"
                description="Place the name on the photo (bottom or top anchors). When off, the name stays below the portrait."
                checked={hero.creatorNameInFrame}
                onChange={(creatorNameInFrame) => patchPortrait({ creatorNameInFrame })}
              />
            ) : null}
            {(hero.portraitCaptionLayout === 'mat-footer' ||
              hero.portraitCaptionLayout === 'mat-header' ||
              hero.creatorNameInFrame) ? (
              <HeroOptionGrid
                label="Name position"
                options={PORTFOLIO_HERO_IN_FRAME_TEXT_PLACEMENT_OPTIONS}
                value={hero.creatorNameFramePlacement}
                onChange={(creatorNameFramePlacement) =>
                  patchPortrait({ creatorNameFramePlacement })
                }
                columns={3}
              />
            ) : null}
            <HeroInlineTypography
              hero={hero}
              target="creatorName"
              onChange={onChange}
              title="Creator name typography"
              extra={
                <div className="space-y-4">
                  <HeroColorSlotBinding
                    slot="creatorName"
                    label="Name token"
                    hero={hero}
                    onChange={onChange}
                  />
                  <HeroColorSlotBinding
                    slot="portraitFrame"
                    label="Frame border token"
                    hero={hero}
                    onChange={onChange}
                  />
                  <HeroColorSlotBinding
                    slot="portraitMat"
                    label="Mat token"
                    hero={hero}
                    onChange={onChange}
                  />
                  <HeroColorSlotBinding
                    slot="portraitCaptionBar"
                    label="Caption bar token"
                    hero={hero}
                    onChange={onChange}
                  />
                </div>
              }
            />
          </>
        ) : null}

        <HeroToggleRow
          label="Show specialty in frame"
          description={
            hero.portraitCaptionLayout === 'mat-footer'
              ? 'Show specialty under the photo inside the mat, stacked with the name.'
              : hero.portraitCaptionLayout === 'mat-header'
                ? 'Show specialty in the magazine band above the photo.'
                : 'Overlay your profile specialty on the photo. Can share a corner with the name (stacked).'
          }
          checked={hero.showSpecialtyInFrame}
          onChange={(showSpecialtyInFrame) => patchPortrait({ showSpecialtyInFrame })}
        />

        {hero.showSpecialtyInFrame && hero.portraitCaptionLayout === 'on-photo' ? (
          <HeroOptionGrid
            label="Specialty position"
            options={PORTFOLIO_HERO_IN_FRAME_TEXT_PLACEMENT_OPTIONS}
            value={hero.specialtyFramePlacement}
            onChange={(specialtyFramePlacement) => patchPortrait({ specialtyFramePlacement })}
            columns={3}
          />
        ) : null}

        {hero.showSpecialtyInFrame ? (
          <HeroToggleRow
            label="Specialty uppercase"
            description="Force specialty to ALL CAPS to match magazine templates."
            checked={hero.portraitSpecialtyUppercase}
            onChange={(portraitSpecialtyUppercase) =>
              patchPortrait({ portraitSpecialtyUppercase })
            }
          />
        ) : null}

        <HeroToggleRow
          label="Caption bar in frame"
          description="Filled rectangle for the caption band (separate from the photo)."
          checked={hero.portraitCaptionBarEnabled}
          onChange={(portraitCaptionBarEnabled) => patchPortrait({ portraitCaptionBarEnabled })}
        />

        {hero.portraitCaptionBarEnabled ? (
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            {hero.portraitCaptionLayout === 'on-photo' ? (
              <HeroOptionGrid
                label="Bar edge"
                options={PORTFOLIO_HERO_IN_FRAME_BAR_EDGE_OPTIONS}
                value={hero.portraitCaptionBarEdge}
                onChange={(portraitCaptionBarEdge) => patchPortrait({ portraitCaptionBarEdge })}
                columns={2}
              />
            ) : null}
            <HeroColorField
              label="Bar color"
              description="Inner caption plate — uses its own token (independent from the frame border and motif)."
              value={hero.portraitCaptionBarColor}
              onChange={(portraitCaptionBarColor) =>
                patchPortrait(
                  hero.useHeroPalette !== false
                    ? patchHeroSlotColor(hero, 'portraitCaptionBar', portraitCaptionBarColor)
                    : { portraitCaptionBarColor }
                )
              }
            />
            <HeroPxSlider
              label="Bar height"
              value={hero.portraitCaptionBarHeight}
              max={PORTRAIT_CAPTION_BAR_HEIGHT_MAX}
              onChange={(portraitCaptionBarHeight) =>
                patchPortrait({ portraitCaptionBarHeight })
              }
            />
            <HeroToggleRow
              label="Show status dot"
              description="Blinking dot on the right of the plate — same color and pulse as the availability badge."
              checked={hero.portraitCaptionShowDot}
              onChange={(portraitCaptionShowDot) => patchPortrait({ portraitCaptionShowDot })}
            />
          </div>
        ) : null}
        </>
        ) : null}
        </div>
      ) : null}

      {subSection === 'stats' ? (
        <div className="space-y-5">
        <HeroUsePaletteToggle
          hero={hero}
          onChange={onChange}
          description="When on, stat card and accent colors follow palette tokens. Turn off to set them freely below."
        />

        <HeroToggleRow
          label="Show years of experience"
          checked={hero.showYearsCard}
          onChange={(showYearsCard) => onChange({ showYearsCard })}
        />
        <HeroToggleRow
          label="Show projects count"
          checked={hero.showProjectsCard}
          onChange={(showProjectsCard) => onChange({ showProjectsCard })}
        />
        <HeroToggleRow
          label="Show location"
          checked={hero.showLocationCard}
          onChange={(showLocationCard) => onChange({ showLocationCard })}
        />

        {hero.showLocationCard ? (
          <HeroOptionGrid
            label="Location text"
            options={PORTFOLIO_HERO_META_LOCATION_CONTENT_OPTIONS}
            value={hero.metaLocationContent}
            onChange={(metaLocationContent) => onChange({ metaLocationContent })}
            columns={3}
          />
        ) : null}

        <HeroToggleRow
          label="Show frame"
          description="Disable for a frameless look — typography and icons only."
          checked={hero.showMetaFrame}
          onChange={(showMetaFrame) =>
            onChange({
              showMetaFrame,
              // Restore a visible outline when re-enabling (disable stores width 0).
              metaFrameBorderWidth: showMetaFrame
                ? hero.metaFrameBorderWidth > 0
                  ? hero.metaFrameBorderWidth
                  : 1
                : 0,
            })
          }
        />

        {hero.showMetaFrame ? (
          <>
            <HeroOptionGrid
              label="Frame shape mode"
              options={PORTFOLIO_HERO_META_FRAME_SHAPE_MODE_OPTIONS}
              value={hero.metaFrameShapeMode}
              onChange={(metaFrameShapeMode) => onChange({ metaFrameShapeMode })}
              columns={2}
            />

            {hero.metaFrameShapeMode === 'uniform' ? (
              <HeroOptionGrid
                label="Frame shape"
                options={PORTFOLIO_HERO_META_FRAME_SHAPE_OPTIONS}
                value={hero.metaFrameShape}
                onChange={(metaFrameShape) => onChange({ metaFrameShape })}
                columns={2}
              />
            ) : (
              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Per-card frame shape</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Round, rounded, square, or pill — independently for each badge.
                  </p>
                </div>
                {hero.showYearsCard ? (
                  <HeroOptionGrid
                    label="Years experience"
                    options={PORTFOLIO_HERO_META_FRAME_SHAPE_OPTIONS}
                    value={hero.metaYearsFrameShape}
                    onChange={(metaYearsFrameShape) => onChange({ metaYearsFrameShape })}
                    columns={2}
                  />
                ) : null}
                {hero.showProjectsCard ? (
                  <HeroOptionGrid
                    label="Projects"
                    options={PORTFOLIO_HERO_META_FRAME_SHAPE_OPTIONS}
                    value={hero.metaProjectsFrameShape}
                    onChange={(metaProjectsFrameShape) => onChange({ metaProjectsFrameShape })}
                    columns={2}
                  />
                ) : null}
                {hero.showLocationCard ? (
                  <HeroOptionGrid
                    label="Location"
                    options={PORTFOLIO_HERO_META_FRAME_SHAPE_OPTIONS}
                    value={hero.metaLocationFrameShape}
                    onChange={(metaLocationFrameShape) => onChange({ metaLocationFrameShape })}
                    columns={2}
                  />
                ) : null}
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Frame border width</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PORTFOLIO_HERO_META_BORDER_WIDTH_OPTIONS.map((option) => {
                  const active = hero.metaFrameBorderWidth === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange({ metaFrameBorderWidth: option.value })}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-950 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <HeroOptionGrid
              label="Display design"
              options={PORTFOLIO_HERO_META_DISPLAY_OPTIONS}
              value={hero.metaDisplayDesign}
              onChange={(metaDisplayDesign) => {
                if (metaDisplayDesign === 'dark') {
                  onChange({
                    ...applyDarkMetaStatSurface(),
                    elementStyles: {
                      ...normalizeHeroElementStyles(hero.elementStyles, hero),
                      metaLabel: {
                        ...normalizeHeroElementStyles(hero.elementStyles, hero).metaLabel,
                        color: DARK_META_LABEL_COLOR,
                      },
                    },
                  });
                  return;
                }
                onChange({ metaDisplayDesign });
              }}
              columns={2}
            />
            {hero.metaDisplayDesign === 'dark' ? (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...applyDarkMetaStatSurface(),
                    elementStyles: {
                      ...normalizeHeroElementStyles(hero.elementStyles, hero),
                      metaLabel: {
                        ...normalizeHeroElementStyles(hero.elementStyles, hero).metaLabel,
                        color: DARK_META_LABEL_COLOR,
                      },
                      metaValue: {
                        ...normalizeHeroElementStyles(hero.elementStyles, hero).metaValue,
                        color: DEFAULT_META_YEARS_ACCENT,
                      },
                    },
                  })
                }
                className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Apply dark spit stats recipe
              </button>
            ) : null}
          </>
        ) : null}

        <HeroOptionGrid
          label="Inner layout"
          options={PORTFOLIO_HERO_META_INNER_LAYOUT_OPTIONS}
          value={hero.metaInnerLayout}
          onChange={(metaInnerLayout) => onChange({ metaInnerLayout })}
          columns={2}
        />

        <HeroOptionGrid
          label="Card padding"
          options={PORTFOLIO_HERO_META_PADDING_OPTIONS}
          value={hero.metaCardPadding}
          onChange={(metaCardPadding) => onChange({ metaCardPadding })}
          columns={3}
        />

        <HeroInlineTypography
          hero={hero}
          target="metaValue"
          onChange={onChange}
          title="Stat value typography"
          extra={
            <HeroColorSlotBinding slot="metaValue" label="Palette token" hero={hero} onChange={onChange} />
          }
        />
        <HeroInlineTypography
          hero={hero}
          target="metaLabel"
          onChange={onChange}
          title="Stat label typography"
          extra={
            <div className="space-y-4">
              <HeroColorSlotBinding
                slot="metaLabel"
                label="Label token"
                hero={hero}
                onChange={onChange}
              />
              <HeroColorSlotBinding
                slot="metaCardBackground"
                label="Card background token"
                hero={hero}
                onChange={onChange}
              />
              <HeroColorSlotBinding
                slot="metaFrameBorder"
                label="Card border token"
                hero={hero}
                onChange={onChange}
              />
            </div>
          }
        />

        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Stat card surface
          </p>
          <p className="text-sm text-neutral-500">
            Background and border apply only to the years / projects / location circles — not the
            portrait frame or motif.
          </p>
          <HeroColorField
            label="Background"
            value={hero.metaCardBackgroundColor ?? DEFAULT_HERO_PALETTE.neutre}
            onChange={(metaCardBackgroundColor) =>
              onChange(
                hero.useHeroPalette !== false
                  ? patchHeroSlotColor(hero, 'metaCardBackground', metaCardBackgroundColor)
                  : { metaCardBackgroundColor }
              )
            }
          />
          <HeroColorField
            label="Border"
            description="Stats cards only — independent from the portrait frame and motif."
            value={hero.metaFrameBorderColor ?? DEFAULT_HERO_PALETTE.bordure}
            onChange={(metaFrameBorderColor) =>
              onChange(
                hero.useHeroPalette !== false
                  ? patchHeroSlotColor(hero, 'metaFrameBorder', metaFrameBorderColor)
                  : { metaFrameBorderColor }
              )
            }
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Border width
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PORTFOLIO_HERO_META_BORDER_WIDTH_OPTIONS.map((option) => {
                const active = hero.metaFrameBorderWidth === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange({ metaFrameBorderWidth: option.value })}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-950 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 border-t border-neutral-200/80 pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Accent rhythm
            </p>
            <p className="text-sm text-neutral-500">
              Orange / teal alternation for icons and primary values on each circle.
            </p>
            <HeroToggleRow
              label="Value follows card accent"
              description="Numbers use each circle’s accent (not one flat color)."
              checked={hero.metaValueUsesCardAccent !== false}
              onChange={(metaValueUsesCardAccent) => onChange({ metaValueUsesCardAccent })}
            />
            <HeroColorField
              label="Years accent"
              value={hero.metaYearsAccentColor ?? '#ea580c'}
              onChange={(metaYearsAccentColor) =>
                onChange(
                  hero.useHeroPalette !== false
                    ? patchHeroSlotColor(hero, 'metaAccentYears', metaYearsAccentColor)
                    : { metaYearsAccentColor }
                )
              }
            />
            <HeroColorField
              label="Projects accent"
              value={hero.metaProjectsAccentColor ?? '#14b8a6'}
              onChange={(metaProjectsAccentColor) =>
                onChange(
                  hero.useHeroPalette !== false
                    ? patchHeroSlotColor(hero, 'metaAccentProjects', metaProjectsAccentColor)
                    : { metaProjectsAccentColor }
                )
              }
            />
            <HeroColorField
              label="Location accent"
              value={hero.metaLocationAccentColor ?? '#ea580c'}
              onChange={(metaLocationAccentColor) =>
                onChange(
                  hero.useHeroPalette !== false
                    ? patchHeroSlotColor(hero, 'metaAccentLocation', metaLocationAccentColor)
                    : { metaLocationAccentColor }
                )
              }
            />
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...applyDarkMetaStatSurface(),
                  elementStyles: {
                    ...normalizeHeroElementStyles(hero.elementStyles, hero),
                    metaLabel: {
                      ...normalizeHeroElementStyles(hero.elementStyles, hero).metaLabel,
                      color: DARK_META_LABEL_COLOR,
                    },
                  },
                })
              }
              className="inline-flex w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Apply dark spit stats recipe
            </button>
          </div>
        </div>

        <HeroToggleRow
          label="Show labels"
          description={'Display "Years exp." and "Projects" captions under values.'}
          checked={hero.metaShowLabels}
          onChange={(metaShowLabels) => onChange({ metaShowLabels })}
        />

        <HeroOptionGrid
          label="Placement mode"
          options={PORTFOLIO_HERO_META_PLACEMENT_OPTIONS}
          value={hero.metaPlacementMode}
          onChange={(metaPlacementMode) => onChange({ metaPlacementMode })}
          columns={2}
        />

        <HeroOptionGrid
          label="Cards orientation"
          options={PORTFOLIO_HERO_META_CARDS_ORIENTATION_OPTIONS}
          value={resolveMetaCardsOrientation(hero)}
          onChange={(metaCardsOrientation) => onChange({ metaCardsOrientation })}
          columns={2}
        />

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Card spacing</p>
          <div className="mt-3">
            <HeroToggleRow
              label="Fill section width"
              description="Stats stretch across the whole cell; spacing between cards is computed automatically."
              checked={resolveMetaCardsFillWidth(hero)}
              onChange={(metaCardsFillWidth) => onChange({ metaCardsFillWidth })}
            />
          </div>
          {resolveMetaCardsFillWidth(hero) ? null : (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {PORTFOLIO_HERO_META_SPREAD_OPTIONS.map((option) => {
                  const presetGap = metaSpreadGapPx(option.value);
                  const active = resolveMetaCardGapPx(hero) === presetGap;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onChange({
                          metaSpread: option.value,
                          metaCardGapPx: presetGap,
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-950 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <HeroPxSlider
                  label="Exact gap between stats"
                  value={resolveMetaCardGapPx(hero)}
                  min={META_CARD_GAP_PX_MIN}
                  max={META_CARD_GAP_PX_MAX}
                  onChange={(metaCardGapPx) => {
                    const matched = PORTFOLIO_HERO_META_SPREAD_OPTIONS.find(
                      (option) => metaSpreadGapPx(option.value) === metaCardGapPx
                    );
                    onChange({
                      metaCardGapPx,
                      ...(matched ? { metaSpread: matched.value } : {}),
                    });
                  }}
                />
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                  In horizontal mode the gap shrinks automatically if the stats cell is too narrow,
                  so the row always stays on one line.
                </p>
              </div>
            </>
          )}
        </div>

        <div>
          {isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <HeroVerticalCellPicker
              label="Stats cell position"
              description="Snap inside the visual half. Top row sits flush under the division line (no empty gap)."
              value={resolveMetaVerticalCell(hero)}
              onChange={(metaVerticalCell) => {
                onChange({
                  metaVerticalCell,
                  metaPositionVertical: heroVerticalCellToPosition(metaVerticalCell),
                });
              }}
            />
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                {hero.metaPlacementMode === 'free'
                  ? 'Free placement'
                  : 'Row position (horizontal + edge offset)'}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {hero.metaPlacementMode === 'free'
                  ? 'Drag the row anywhere on the hero panel.'
                  : 'Adjust the horizontal center — cards stay straddling the motif bottom edge.'}
              </p>
              <div className="mt-3">
                <HeroDesktopOnlyCanvas label="Meta cards placement">
                  <PortfolioHeroMetaPositionEditor
                    position={hero.metaPosition}
                    spread={hero.metaSpread}
                    visibleCount={
                      [hero.showYearsCard, hero.showProjectsCard, hero.showLocationCard].filter(
                        Boolean
                      ).length
                    }
                    motifColor={hero.motifColor}
                    motifShape={hero.motifShape}
                    customMotifPoints={hero.customMotifPoints}
                    onChange={(metaPosition) => {
                      onChange({ metaPosition });
                    }}
                  />
                </HeroDesktopOnlyCanvas>
              </div>
            </>
          )}
        </div>

        <HeroToggleRow
          label="Show icons"
          description="Orange clock, grid, and pin icons on each card."
          checked={hero.showMetaIcons}
          onChange={(showMetaIcons) => onChange({ showMetaIcons })}
        />

        {hero.showMetaIcons ? (
          <HeroColorField
            label="Icon accent color"
            value={hero.metaAccentColor}
            onChange={(metaAccentColor) => onChange({ metaAccentColor })}
          />
        ) : null}
        </div>
      ) : null}

      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Content for this section is edited in Creator Studio → Information. These settings control visibility and
        presentation on the portfolio page.
      </p>
    </div>
  );
}

export function HeroPresentationPanel(props: {
  hero: PortfolioHeroSectionSettings;
  availableTools: string[];
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
}) {
  return <HeroSettingsPanel {...props} />;
}
