'use client';

import { useState, type ReactNode } from 'react';
import {
  PORTFOLIO_WORK_CARD_ALIGNMENT_OPTIONS,
  PORTFOLIO_WORK_CARD_BORDER_OPTIONS,
  PORTFOLIO_WORK_CARD_CONTENT_ALIGNMENT_OPTIONS,
  PORTFOLIO_WORK_CARD_DESIGN_OPTIONS,
  PORTFOLIO_WORK_CARD_GAP_OPTIONS,
  PORTFOLIO_WORK_CARD_MAX_WIDTH_OPTIONS,
  PORTFOLIO_WORK_CARD_PADDING_OPTIONS,
  PORTFOLIO_WORK_CARD_RADIUS_OPTIONS,
  PORTFOLIO_WORK_CONTENT_FRAME_GAP_OPTIONS,
  PORTFOLIO_WORK_CATEGORY_DESIGN_OPTIONS,
  PORTFOLIO_WORK_CATEGORY_MODE_OPTIONS,
  PORTFOLIO_WORK_CONTENT_PLACEMENT_OPTIONS,
  PORTFOLIO_WORK_NO_MEDIA_INFO_LAYOUT_OPTIONS,
  PORTFOLIO_WORK_CTA_ALIGNMENT_OPTIONS,
  PORTFOLIO_WORK_CTA_BORDER_RADIUS_OPTIONS,
  PORTFOLIO_WORK_CTA_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_WORK_CTA_DESIGN_OPTIONS,
  PORTFOLIO_WORK_GALLERY_LAYOUT_OPTIONS,
  PORTFOLIO_WORK_HEADER_FONT_OPTIONS,
  PORTFOLIO_WORK_ITEMS_PER_ROW_OPTIONS,
  PORTFOLIO_WORK_OVERLAY_CELL_OPTIONS,
  PORTFOLIO_WORK_OVERLAY_LAYOUT_MODE_OPTIONS,
  PORTFOLIO_WORK_STYLE_TARGET_OPTIONS,
  PORTFOLIO_WORK_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_WORK_TITLE_PRESET_OPTIONS,
  PORTFOLIO_WORK_TOOLS_DISPLAY_OPTIONS,
  normalizeWorkElementStyles,
  patchWorkElementChrome,
  patchWorkElementStyle,
  workGalleryLayoutSettingsPatch,
  DEFAULT_WORK_ELEMENT_CHROMES,
  type PortfolioWorkElementChromeId,
  type PortfolioWorkItemsPerRow,
  type PortfolioWorkOverlayCellPlacement,
  type PortfolioWorkOverlayElementId,
  type PortfolioWorkSectionSettings,
  type PortfolioWorkStyleTarget,
  workCardIsStacked,
  workGallerySupportsItemsPerRow,
  workItemsPerRowResponsiveHint,
} from '@/components/portfolio/portfolio-work-settings';
import { PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS } from '@/components/portfolio/portfolio-element-text-style';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  LIGHT_HERO_PALETTE,
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
import {
  applyWorkPaletteToSettings,
  DARK_WORK_PALETTE,
  DEFAULT_WORK_COLOR_BINDINGS,
  DEFAULT_WORK_PALETTE,
  mergeWorkColorBindings,
  mergeWorkPalette,
  patchWorkColorBinding,
  patchWorkColorField,
  patchWorkColorFieldManual,
  patchWorkPalette,
  PORTFOLIO_WORK_COLOR_SLOT_OPTIONS,
  WORK_STYLE_TARGET_COLOR_SLOT,
  type WorkColorSlot,
} from '@/components/portfolio/portfolio-work-palette-settings';

export type WorkSettingsSubSection =
  | 'general'
  | 'header'
  | 'categories'
  | 'cards'
  | 'title'
  | 'description'
  | 'tools'
  | 'cta'
  | 'background'
  | 'palette'
  /** @deprecated Prefer title / description / tools / cta */
  | 'style';

const WORK_SETTINGS_SUB_SECTIONS: {
  id: Exclude<WorkSettingsSubSection, 'style'>;
  label: string;
  description: string;
}[] = [
  { id: 'general', label: 'General', description: 'Section visibility and marketplace link.' },
  { id: 'header', label: 'Header', description: 'Title and subtitle presets, fonts, and colors.' },
  {
    id: 'categories',
    label: 'Categories',
    description: 'Filter chips, category on cards, placement, and typography.',
  },
  {
    id: 'cards',
    label: 'Cards',
    description: 'Gallery layout, media, frame, and overlay disposition mode.',
  },
  {
    id: 'title',
    label: 'Titre',
    description: 'Project title visibility, overlay placement, and typography.',
  },
  {
    id: 'description',
    label: 'Description',
    description: 'Description visibility, overlay placement, and typography.',
  },
  {
    id: 'tools',
    label: 'Outils',
    description: 'Tools row, icons, overlay placement, and typography.',
  },
  {
    id: 'cta',
    label: 'CTA',
    description: 'View project button design, placement, and typography.',
  },
  { id: 'background', label: 'Background', description: 'Section fill, gradients, and opacity.' },
  {
    id: 'palette',
    label: 'Palette',
    description: 'Semantic tokens and color bindings for the whole section.',
  },
];

/** Map legacy subsection ids (saved UI state / search) to the new element menus. */
export function normalizeWorkSettingsSubSection(value: string | undefined): WorkSettingsSubSection {
  if (value === 'style') return 'title';
  if (
    value === 'general' ||
    value === 'header' ||
    value === 'categories' ||
    value === 'cards' ||
    value === 'title' ||
    value === 'description' ||
    value === 'tools' ||
    value === 'cta' ||
    value === 'background' ||
    value === 'palette'
  ) {
    return value;
  }
  return 'header';
}

const WORK_BACKGROUND_LABEL_SLOTS: Record<string, WorkColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

function asWorkPatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioWorkSectionSettings> {
  return patch as Partial<PortfolioWorkSectionSettings>;
}

function WorkUsePaletteToggle({
  work,
  onChange,
  description,
  enabledHint,
  disabledHint,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  description: string;
  enabledHint?: string;
  disabledHint?: string;
}) {
  return (
    <SectionHeroPaletteToggle
      enabled={work.useHeroPalette !== false}
      onChange={(useHeroPalette) =>
        onChange(
          asWorkPatch(
            useHeroPalette
              ? { useHeroPalette, ...applyWorkPaletteToSettings(work) }
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

function WorkColorField({
  work,
  onChange,
  slot,
  label,
  description,
  value,
  allowManualHex = false,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  slot: WorkColorSlot;
  label: string;
  description?: string;
  value: string;
  /** When palette is on, also show a hex picker that overrides the token until rebound. */
  allowManualHex?: boolean;
}) {
  const paletteOn = work.useHeroPalette !== false;
  const isManualOverride =
    (slot === 'contentFrameBackground' && work.contentFrameBackgroundManual) ||
    (slot === 'contentFrameBorder' && work.contentFrameBorderManual);

  if (!paletteOn) {
    return (
      <WorkManualColorField
        label={label}
        description={description}
        value={value}
        onChange={(hex) => onChange(asWorkPatch(patchWorkColorField(work, slot, hex)))}
      />
    );
  }

  const palette = mergeWorkPalette(DEFAULT_WORK_PALETTE, work.workPalette);
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, work.workColorBindings);
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
            {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
          </div>
          <span
            className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-neutral-200"
            style={{ backgroundColor: isManualOverride ? value : resolved }}
            title={isManualOverride ? value : resolved}
            aria-hidden
          />
        </div>
        <select
          value={token}
          onChange={(event) =>
            onChange(
              asWorkPatch(
                patchWorkColorBinding(work, slot, event.target.value as HeroPaletteTokenId)
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
        {!allowManualHex ? (
          <p className="text-xs text-neutral-500">
            Bound to token · edit hex under{' '}
            <span className="font-semibold text-neutral-700">Palette</span>
          </p>
        ) : (
          <p className="text-xs text-neutral-500">
            Token palette{isManualOverride ? ' · override manuel actif' : ''} · changez le token pour
            resynchroniser.
          </p>
        )}
      </div>

      {allowManualHex ? (
        <WorkManualColorField
          label="Couleur manuelle"
          description="Hex indépendant du token. Changer le token ci-dessus annule l’override."
          value={value}
          onChange={(hex) => onChange(asWorkPatch(patchWorkColorFieldManual(work, slot, hex)))}
        />
      ) : null}
    </div>
  );
}

function WorkManualColorField({
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

function WorkPalettePanel({
  work,
  onChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
}) {
  const palette = mergeWorkPalette(DEFAULT_WORK_PALETTE, work.workPalette);
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, work.workColorBindings);
  const paletteOn = work.useHeroPalette !== false;

  return (
    <div className="space-y-6">
      <WorkUsePaletteToggle
        work={work}
        onChange={onChange}
        description="When on, Portfolio colors follow these eight tokens. Turn off to edit colors manually in Header, Cards, Style, and Background."
        enabledHint="Change a token below to restyle everything bound to it — title, cards, categories, CTA, and section fill."
        disabledHint="Palette tokens are kept, but Portfolio uses manual hex colors until you turn this back on."
      />

      <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
        Title, subtitle, card chrome, category chips, CTA accent, and section background all bind to
        these eight semantic tokens. Same system as Hero and Navigation.
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
                asWorkPatch(
                  paletteOn
                    ? { ...patchWorkPalette(work, DARK_WORK_PALETTE), useHeroPalette: true }
                    : { workPalette: { ...DARK_WORK_PALETTE } }
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
                  style={{ backgroundColor: DARK_WORK_PALETTE[token.value] }}
                  title={token.label}
                />
              ))}
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              onChange(
                asWorkPatch(
                  paletteOn
                    ? { ...patchWorkPalette(work, LIGHT_HERO_PALETTE), useHeroPalette: true }
                    : { workPalette: { ...LIGHT_HERO_PALETTE } }
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
          <WorkManualColorField
            key={token.value}
            label={token.label}
            description={token.description}
            value={palette[token.value]}
            onChange={(color) =>
              onChange(
                asWorkPatch(
                  paletteOn
                    ? patchWorkPalette(work, { [token.value]: color })
                    : {
                        workPalette: {
                          ...mergeWorkPalette(DEFAULT_WORK_PALETTE, work.workPalette),
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
            onClick={() => onChange(asWorkPatch(applyWorkPaletteToSettings(work)))}
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
              {PORTFOLIO_WORK_COLOR_SLOT_OPTIONS.map((slot) => {
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
                          asWorkPatch(
                            patchWorkColorBinding(
                              work,
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
          hex fields under Header / Cards / Style / Background.
        </p>
      )}
    </div>
  );
}

function WorkToggleRow({
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

const WORK_ELEMENT_CHROME_COLOR_SLOTS: Record<
  PortfolioWorkElementChromeId,
  { background: WorkColorSlot; border: WorkColorSlot }
> = {
  categoryOnCard: {
    background: 'categoryChromeBackground',
    border: 'categoryChromeBorder',
  },
  cardTitle: {
    background: 'titleChromeBackground',
    border: 'titleChromeBorder',
  },
  cardDescription: {
    background: 'descriptionChromeBackground',
    border: 'descriptionChromeBorder',
  },
  tools: {
    background: 'toolsChromeBackground',
    border: 'toolsChromeBorder',
  },
};

function WorkElementChromeControls({
  work,
  chromeId,
  onChange,
  title = 'Fond de l’élément',
  description = 'Ajoute un fond derrière cet élément — padding, marge, couleur et bordure.',
}: {
  work: PortfolioWorkSectionSettings;
  chromeId: PortfolioWorkElementChromeId;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  title?: string;
  description?: string;
}) {
  const chrome = work.elementChromes?.[chromeId] ?? DEFAULT_WORK_ELEMENT_CHROMES[chromeId];
  const slots = WORK_ELEMENT_CHROME_COLOR_SLOTS[chromeId];

  const patchChrome = (patch: Partial<typeof chrome>) => {
    onChange({
      elementChromes: patchWorkElementChrome(
        work.elementChromes ?? DEFAULT_WORK_ELEMENT_CHROMES,
        chromeId,
        patch
      ),
    });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-neutral-950">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      <WorkToggleRow
        label="Activer le fond"
        description="Encadre cet élément avec un fond et optionnellement une bordure."
        checked={chrome.enabled}
        onChange={(enabled) => patchChrome({ enabled })}
      />
      {chrome.enabled ? (
        <>
          <WorkToggleRow
            label="Remplissage"
            description="Couleur de fond derrière le texte / les icônes."
            checked={chrome.backgroundEnabled}
            onChange={(backgroundEnabled) => patchChrome({ backgroundEnabled })}
          />
          {chrome.backgroundEnabled ? (
            <WorkColorField
              work={work}
              onChange={onChange}
              slot={slots.background}
              label="Couleur de fond"
              value={chrome.backgroundColor}
            />
          ) : null}
          <WorkOptionGrid
            label="Bordure"
            options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
            value={chrome.border}
            onChange={(border) => patchChrome({ border })}
            columns={2}
          />
          {chrome.border === 'soft' || chrome.border === 'solid' ? (
            <WorkColorField
              work={work}
              onChange={onChange}
              slot={slots.border}
              label="Couleur de bordure"
              value={chrome.borderColor}
            />
          ) : null}
          <WorkOptionGrid
            label="Coins"
            options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
            value={chrome.borderRadius}
            onChange={(borderRadius) => patchChrome({ borderRadius })}
            columns={2}
          />
          <WorkOptionGrid
            label="Padding (intérieur)"
            options={PORTFOLIO_WORK_CARD_PADDING_OPTIONS}
            value={chrome.padding}
            onChange={(padding) => patchChrome({ padding })}
            columns={2}
          />
          <WorkOptionGrid
            label="Marge (extérieur)"
            options={PORTFOLIO_WORK_CARD_PADDING_OPTIONS}
            value={chrome.margin}
            onChange={(margin) => patchChrome({ margin })}
            columns={2}
          />
        </>
      ) : null}
    </div>
  );
}

function WorkOptionGrid<T extends string>({
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

/** Compact 3×3 snap grid for overlay immersive free placement (desktop). */
function WorkOverlayCellPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioWorkOverlayCellPlacement;
  onChange: (value: PortfolioWorkOverlayCellPlacement) => void;
}) {
  const activeLabel =
    PORTFOLIO_WORK_OVERLAY_CELL_OPTIONS.find((option) => option.value === value)?.label ?? value;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="mt-2 inline-grid grid-cols-3 gap-1.5 rounded-xl border border-neutral-200 bg-white p-2">
        {PORTFOLIO_WORK_OVERLAY_CELL_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={`${label}: ${option.label}`}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                active
                  ? 'border-neutral-900 bg-neutral-950 text-white shadow-sm'
                  : 'border-neutral-300 bg-white text-neutral-400 hover:border-neutral-500 hover:text-neutral-700'
              }`}
            >
              <span
                className={`block h-2 w-2 rounded-full ${active ? 'bg-orange-400' : 'bg-current'}`}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs font-medium text-neutral-600">{activeLabel}</p>
    </div>
  );
}

/** Per-element overlay free placement — mirrors Hero’s per-element layout block. */
function WorkOverlayElementPlacementControls({
  work,
  elementId,
  onChange,
}: {
  work: PortfolioWorkSectionSettings;
  elementId: PortfolioWorkOverlayElementId;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
}) {
  if (work.galleryLayout !== 'overlay') {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Le placement libre 3×3 est disponible uniquement avec la disposition{' '}
        <span className="font-semibold text-neutral-700">Overlay immersif</span> (onglet Cards).
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-neutral-950">Placement (grand écran)</p>
        <p className="mt-1 text-sm text-neutral-500">
          Sur mobile / tablette, cet élément reste dans la pile basse. Sur grand écran, place-le dans
          une cellule 3×3.
        </p>
      </div>

      {work.overlayLayoutMode !== 'free' ? (
        <WorkToggleRow
          label="Activer le placement libre"
          description="Passe la carte overlay en disposition libre (desktop). Les autres éléments restent configurables dans leur sous-section."
          checked={false}
          onChange={(enabled) => {
            if (enabled) onChange({ overlayLayoutMode: 'free' });
          }}
        />
      ) : (
        <WorkOverlayCellPicker
          label="Cellule 3×3"
          value={work.overlayElementPlacements[elementId]}
          onChange={(cell) =>
            onChange({
              overlayElementPlacements: {
                ...work.overlayElementPlacements,
                [elementId]: cell,
              },
            })
          }
        />
      )}
    </div>
  );
}

function WorkInlineTypography({
  work,
  target,
  onChange,
  title = 'Typography',
  extra,
}: {
  work: PortfolioWorkSectionSettings;
  target: PortfolioWorkStyleTarget;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  title?: string;
  extra?: ReactNode;
}) {
  const elementStyles = normalizeWorkElementStyles(work.elementStyles);
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <PortfolioElementStyleFields
        targets={PORTFOLIO_WORK_STYLE_TARGET_OPTIONS}
        activeTarget={target}
        onTargetChange={() => {}}
        hideTargetPicker
        title={title}
        style={elementStyles[target]}
        onStyleChange={(patch) =>
          onChange({ elementStyles: patchWorkElementStyle(elementStyles, target, patch) })
        }
        renderColorField={({ label, value }) => (
          <WorkColorField
            work={work}
            onChange={onChange}
            slot={WORK_STYLE_TARGET_COLOR_SLOT[target]}
            label={label}
            value={value}
          />
        )}
        extra={extra}
      />
    </div>
  );
}

export function WorkSettingsPanel({
  work,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  subSection?: WorkSettingsSubSection;
  onSubSectionChange?: (value: WorkSettingsSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<WorkSettingsSubSection>('header');
  const subSection = normalizeWorkSettingsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: WorkSettingsSubSection) => {
    const next = normalizeWorkSettingsSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const activeMeta =
    WORK_SETTINGS_SUB_SECTIONS.find((section) => section.id === subSection) ?? WORK_SETTINGS_SUB_SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Portfolio subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <label className="min-w-[12rem] flex-1 sm:max-w-xs">
          <span className="sr-only">Portfolio settings subsection</span>
          <select
            value={subSection}
            onChange={(event) => setSubSection(event.target.value as WorkSettingsSubSection)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900"
          >
            {WORK_SETTINGS_SUB_SECTIONS.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-4">
          <WorkToggleRow
            label="Show section"
            description="Display the portfolio block on your public portfolio."
            checked={work.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <WorkToggleRow
            label="Show marketplace link"
            description='“View all projects” link under the section header.'
            checked={work.showMarketplaceLink}
            onChange={(showMarketplaceLink) => onChange({ showMarketplaceLink })}
          />
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, Portfolio colors follow the semantic palette (Principal, Fond, Bordure…). Turn off to set each color manually in the other tabs."
          />
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Project content is edited in Creator Studio → Information. These settings control visibility and
            presentation on the portfolio page.
          </p>
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, title and subtitle colors follow palette tokens. Turn off to pick them freely below."
          />

          <WorkOptionGrid
            label="Title preset"
            options={PORTFOLIO_WORK_TITLE_PRESET_OPTIONS}
            value={work.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
            columns={2}
          />
          {work.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={work.titleCustom || work.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                placeholder="PORTFOLIO"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
              />
            </div>
          ) : null}

          <WorkOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_WORK_SUBTITLE_PRESET_OPTIONS}
            value={work.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
            columns={2}
          />
          {work.subtitlePreset === 'custom' || work.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                {work.subtitlePreset === 'custom' ? 'Custom subtitle' : 'Subtitle text'}
              </p>
              <textarea
                rows={3}
                value={work.subtitlePreset === 'custom' ? work.subtitleCustom || work.subtitle : work.subtitle}
                onChange={(event) =>
                  onChange(
                    work.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                placeholder="A selection of projects that showcase my work..."
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <WorkOptionGrid
              label="Title font"
              options={PORTFOLIO_WORK_HEADER_FONT_OPTIONS}
              value={work.titleFont}
              onChange={(titleFont) => onChange({ titleFont })}
              columns={2}
            />
            <WorkOptionGrid
              label="Subtitle font"
              options={PORTFOLIO_WORK_HEADER_FONT_OPTIONS}
              value={work.subtitleFont}
              onChange={(subtitleFont) => onChange({ subtitleFont })}
              columns={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <WorkColorField
              work={work}
              onChange={onChange}
              slot="title"
              label="Title color"
              value={work.titleColor}
            />
            <WorkColorField
              work={work}
              onChange={onChange}
              slot="subtitle"
              label="Subtitle color"
              value={work.subtitleColor}
            />
          </div>

          <WorkOptionGrid
            label="Header alignment"
            options={[
              { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
              { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
            ]}
            value={work.headerAlignment}
            onChange={(headerAlignment) => onChange({ headerAlignment })}
            columns={2}
          />
        </div>
      ) : null}

      {subSection === 'categories' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, category chip colors follow palette tokens. Turn off to pick them freely below."
          />

          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Categories come from each content’s <span className="font-semibold text-neutral-700">Category</span>{' '}
            field (set when you publish). Projects without one appear under “Other”.
          </p>
          <WorkOptionGrid
            label="Category mode"
            options={PORTFOLIO_WORK_CATEGORY_MODE_OPTIONS}
            value={work.categoryMode}
            onChange={(categoryMode) => onChange({ categoryMode })}
            columns={2}
          />
          {work.categoryMode !== 'off' ? (
            <>
              <WorkOptionGrid
                label="Filter design"
                options={PORTFOLIO_WORK_CATEGORY_DESIGN_OPTIONS}
                value={work.categoryDesign}
                onChange={(categoryDesign) => onChange({ categoryDesign })}
                columns={2}
              />
              <WorkToggleRow
                label="Show category on cards"
                description="Display the category name above each project title."
                checked={work.showCategoryOnCard}
                onChange={(showCategoryOnCard) => onChange({ showCategoryOnCard })}
              />
              {work.showCategoryOnCard ? (
                <>
                  <WorkOverlayElementPlacementControls
                    work={work}
                    elementId="category"
                    onChange={onChange}
                  />
                  <WorkElementChromeControls
                    work={work}
                    chromeId="categoryOnCard"
                    onChange={onChange}
                    title="Fond de la catégorie"
                    description="Fond derrière le label TECH / catégorie sur la carte."
                  />
                  <WorkInlineTypography
                    work={work}
                    target="categoryOnCard"
                    onChange={onChange}
                    title="Category on card typography"
                  />
                </>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    “All” label
                  </p>
                  <input
                    type="text"
                    value={work.categoryAllLabel}
                    onChange={(event) => onChange({ categoryAllLabel: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Uncategorized label
                  </p>
                  <input
                    type="text"
                    value={work.categoryUncategorizedLabel}
                    onChange={(event) => onChange({ categoryUncategorizedLabel: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot="categoryActive"
                  label="Active category"
                  value={work.categoryActiveColor}
                />
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot="categoryMuted"
                  label="Muted category"
                  value={work.categoryMutedColor}
                />
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'cards' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, card border and background colors follow palette tokens. Turn off to pick them freely below."
          />

          <WorkOptionGrid
            label="Disposition de la galerie"
            options={PORTFOLIO_WORK_GALLERY_LAYOUT_OPTIONS}
            value={work.galleryLayout}
            onChange={(galleryLayout) => onChange(workGalleryLayoutSettingsPatch(galleryLayout))}
            columns={2}
          />

          {workGallerySupportsItemsPerRow(work.galleryLayout) ? (
            <div className="space-y-3">
              <WorkOptionGrid
                label="Cadres par ligne"
                options={PORTFOLIO_WORK_ITEMS_PER_ROW_OPTIONS}
                value={String(
                  work.itemsPerRow === 2 || work.itemsPerRow === 3 || work.itemsPerRow === 4
                    ? work.itemsPerRow
                    : 1
                ) as '1' | '2' | '3' | '4'}
                onChange={(value) =>
                  onChange({ itemsPerRow: Number(value) as PortfolioWorkItemsPerRow })
                }
                columns={2}
              />
              {(() => {
                const perRow = (
                  work.itemsPerRow === 2 || work.itemsPerRow === 3 || work.itemsPerRow === 4
                    ? work.itemsPerRow
                    : 1
                ) as PortfolioWorkItemsPerRow;
                const hint = workItemsPerRowResponsiveHint(perRow);
                if (!hint) return null;
                return (
                  <p
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      perRow >= 3
                        ? 'border-amber-200 bg-amber-50 text-amber-900'
                        : 'border-dashed border-neutral-200 bg-white text-neutral-500'
                    }`}
                  >
                    {hint}
                  </p>
                );
              })()}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Le nombre de cadres par ligne s’applique à{' '}
              <span className="font-semibold text-neutral-700">Grille portfolio</span>,{' '}
              <span className="font-semibold text-neutral-700">Grille compacte</span> et{' '}
              <span className="font-semibold text-neutral-700">Overlay</span>. Liste et accordéon restent
              sur une seule colonne.
            </p>
          )}

          <WorkOptionGrid
            label="Largeur de la carte"
            options={PORTFOLIO_WORK_CARD_MAX_WIDTH_OPTIONS}
            value={work.cardMaxWidth}
            onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
            columns={2}
          />
          {work.cardMaxWidth !== 'full' ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Largeur plafonnée — la carte garde une forme verticale (média + infos) au lieu de s’étirer
              sur toute la colonne. Combine avec{' '}
              <span className="font-semibold text-neutral-700">Cadres par ligne</span> pour la grille.
            </p>
          ) : null}

          <WorkOptionGrid
            label="Alignement de la carte"
            options={PORTFOLIO_WORK_CARD_ALIGNMENT_OPTIONS}
            value={work.cardAlignment}
            onChange={(cardAlignment) => onChange({ cardAlignment })}
            columns={3}
          />
          <p className="text-sm text-neutral-500">
            Positionne le <span className="font-semibold text-neutral-700">cadre</span> dans la colonne
            (quand la largeur est plafonnée). N’aligne pas le texte à l’intérieur.
            {work.categoryMode !== 'off'
              ? ' Les filtres catégories suivent aussi cet alignement.'
              : ''}
          </p>

          <WorkOptionGrid
            label="Alignement du contenu"
            options={PORTFOLIO_WORK_CARD_CONTENT_ALIGNMENT_OPTIONS}
            value={work.cardContentAlignment}
            onChange={(cardContentAlignment) => onChange({ cardContentAlignment })}
            columns={3}
          />
          <p className="text-sm text-neutral-500">
            Aligne uniquement les éléments <span className="font-semibold text-neutral-700">à l’intérieur</span> de
            la carte (titre, description, outils…). Le bouton CTA a son propre alignement dans la sous-section CTA.
          </p>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Cadre & espacement</p>
              <p className="mt-1 text-sm text-neutral-500">
                Bordure, coins arrondis, fond, marge intérieure et espace entre les projets — s’applique à
                toutes les dispositions de galerie, indépendamment du card design.
              </p>
            </div>

            <WorkOptionGrid
              label="Bordure"
              options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
              value={work.cardBorder}
              onChange={(cardBorder) => onChange({ cardBorder })}
              columns={2}
            />

            {work.cardBorder === 'soft' || work.cardBorder === 'solid' ? (
              <WorkColorField
                work={work}
                onChange={onChange}
                slot="cardBorder"
                label="Couleur de bordure"
                value={work.cardBorderColor}
              />
            ) : null}

            <WorkToggleRow
              label="Fond du cadre"
              description="Appliquer une couleur de fond derrière le contenu de la carte."
              checked={work.cardBackgroundEnabled}
              onChange={(cardBackgroundEnabled) => onChange({ cardBackgroundEnabled })}
            />

            {work.cardBackgroundEnabled ? (
              <WorkColorField
                work={work}
                onChange={onChange}
                slot="cardBackground"
                label="Couleur de fond"
                value={work.cardBackgroundColor}
              />
            ) : null}

            <WorkOptionGrid
              label="Coins arrondis"
              options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
              value={work.cardBorderRadius}
              onChange={(cardBorderRadius) => onChange({ cardBorderRadius })}
              columns={3}
            />

            <WorkOptionGrid
              label="Marge intérieure"
              options={PORTFOLIO_WORK_CARD_PADDING_OPTIONS}
              value={work.cardPadding}
              onChange={(cardPadding) => onChange({ cardPadding })}
              columns={2}
            />

            <WorkOptionGrid
              label="Espace entre projets"
              options={PORTFOLIO_WORK_CARD_GAP_OPTIONS}
              value={work.cardGap}
              onChange={(cardGap) => onChange({ cardGap })}
              columns={2}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Cadre des informations</p>
              <p className="mt-1 text-sm text-neutral-500">
                Encadre le bloc titre / description / outils / CTA à côté ou sous le média. Couleurs
                liées à la palette (tokens) avec override hex manuel pour le fond et la bordure.
              </p>
            </div>

            <WorkToggleRow
              label="Activer le cadre info"
              description="Ajoute un panneau distinct autour des informations du projet."
              checked={work.contentFrameEnabled}
              onChange={(contentFrameEnabled) => onChange({ contentFrameEnabled })}
            />

            {work.contentFrameEnabled ? (
              <>
                <WorkOptionGrid
                  label="Bordure"
                  options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
                  value={work.contentFrameBorder}
                  onChange={(contentFrameBorder) => onChange({ contentFrameBorder })}
                  columns={2}
                />

                {work.contentFrameBorder === 'soft' || work.contentFrameBorder === 'solid' ? (
                  <WorkColorField
                    work={work}
                    onChange={onChange}
                    slot="contentFrameBorder"
                    label="Couleur de bordure"
                    value={work.contentFrameBorderColor}
                    allowManualHex
                  />
                ) : null}

                <WorkToggleRow
                  label="Fond du cadre info"
                  description="Couleur de fond derrière les informations."
                  checked={work.contentFrameBackgroundEnabled}
                  onChange={(contentFrameBackgroundEnabled) =>
                    onChange({ contentFrameBackgroundEnabled })
                  }
                />

                {work.contentFrameBackgroundEnabled ? (
                  <WorkColorField
                    work={work}
                    onChange={onChange}
                    slot="contentFrameBackground"
                    label="Couleur de fond"
                    value={work.contentFrameBackgroundColor}
                    allowManualHex
                  />
                ) : null}

                <WorkOptionGrid
                  label="Coins arrondis"
                  options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
                  value={work.contentFrameBorderRadius}
                  onChange={(contentFrameBorderRadius) => onChange({ contentFrameBorderRadius })}
                  columns={3}
                />

                <WorkOptionGrid
                  label="Marge intérieure"
                  options={PORTFOLIO_WORK_CARD_PADDING_OPTIONS}
                  value={work.contentFramePadding}
                  onChange={(contentFramePadding) => onChange({ contentFramePadding })}
                  columns={2}
                />

                <WorkOptionGrid
                  label="Espace vertical entre blocs"
                  options={PORTFOLIO_WORK_CONTENT_FRAME_GAP_OPTIONS}
                  value={work.contentFrameGap}
                  onChange={(contentFrameGap) => onChange({ contentFrameGap })}
                  columns={2}
                />
              </>
            ) : null}
          </div>

          {work.showCardMedia && work.galleryLayout === 'stack' ? (
            <WorkOptionGrid
              label="Content placement"
              options={PORTFOLIO_WORK_CONTENT_PLACEMENT_OPTIONS}
              value={work.contentPlacement}
              onChange={(contentPlacement) => onChange({ contentPlacement })}
              columns={3}
            />
          ) : null}

          {work.showCardMedia &&
          (work.galleryLayout === 'stack' ||
            work.galleryLayout === 'overlay' ||
            work.galleryLayout === 'grid') ? (
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  {work.galleryLayout === 'stack' &&
                  workCardIsStacked(work.cardDesign, work.contentPlacement)
                    ? 'Hauteur du média'
                    : 'Ratio média'}
                </p>
                <span className="text-sm font-semibold text-neutral-700">{work.mediaRatio}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={70}
                step={1}
                value={work.mediaRatio}
                onChange={(event) => onChange({ mediaRatio: Number(event.target.value) })}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Media size ratio"
              />
              <p className="mt-2 text-sm text-neutral-500">
                {work.galleryLayout === 'overlay'
                  ? 'Ajuste la hauteur des cartes overlay immersives.'
                  : work.galleryLayout === 'grid'
                    ? 'Ajuste la hauteur du média au-dessus du texte en grille compacte.'
                    : workCardIsStacked(work.cardDesign, work.contentPlacement)
                      ? 'Ajuste la hauteur de l’image par rapport au contenu texte.'
                      : 'Redimensionne l’aperçu média par rapport à la colonne texte sur desktop.'}
              </p>
            </div>
          ) : null}

          {work.galleryLayout === 'stack' ? (
            <div className="space-y-3">
              <WorkOptionGrid
                label="Card design"
                options={PORTFOLIO_WORK_CARD_DESIGN_OPTIONS.filter(
                  (option) => option.value !== 'compact' && option.value !== 'overlay'
                )}
                value={
                  work.cardDesign === 'compact' || work.cardDesign === 'overlay'
                    ? 'editorial'
                    : work.cardDesign
                }
                onChange={(cardDesign) => onChange({ cardDesign })}
                columns={2}
              />
              <p className="text-sm text-neutral-500">
                Espacement, ombres et densité uniquement — la bordure et les coins se règlent dans{' '}
                <span className="font-semibold text-neutral-700">Cadre & espacement</span>.
              </p>
            </div>
          ) : work.galleryLayout === 'grid' ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Grille compacte force le design{' '}
              <span className="font-semibold text-neutral-700">Compact</span> : médias plus bas,
              typo serrée, descriptions coupées, espacement densifié. La{' '}
              <span className="font-semibold text-neutral-700">Grille portfolio</span> garde des
              cartes éditoriales plus spacieuses.
            </p>
          ) : work.galleryLayout === 'overlay' ? (
            <div className="space-y-4">
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                Overlay immersif force le design{' '}
                <span className="font-semibold text-neutral-700">Overlay</span> — texte superposé sur le
                média. Place chaque élément (titre, description, outils, CTA…) dans sa propre
                sous-section.
              </p>

              <WorkOptionGrid
                label="Disposition des éléments"
                options={PORTFOLIO_WORK_OVERLAY_LAYOUT_MODE_OPTIONS}
                value={work.overlayLayoutMode}
                onChange={(overlayLayoutMode) => onChange({ overlayLayoutMode })}
                columns={2}
              />

              {work.overlayLayoutMode === 'free' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Mode libre actif — ouvre{' '}
                  <span className="font-semibold text-neutral-700">Titre</span>,{' '}
                  <span className="font-semibold text-neutral-700">Description</span>,{' '}
                  <span className="font-semibold text-neutral-700">Outils</span>,{' '}
                  <span className="font-semibold text-neutral-700">CTA</span> ou{' '}
                  <span className="font-semibold text-neutral-700">Categories</span> pour placer chaque
                  élément dans la grille 3×3 (grand écran uniquement).
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Media</p>
            <p className="text-sm text-neutral-500">
              Titre, description, outils et CTA se règlent dans leurs sous-sections dédiées.
            </p>
            <WorkToggleRow
              label="Project media"
              description="Show the project image / video preview on cards, list rows, and accordion."
              checked={work.showCardMedia}
              onChange={(showCardMedia) => onChange({ showCardMedia })}
            />
            {!work.showCardMedia ? (
              <div className="space-y-3 border-t border-neutral-200/80 pt-3">
                <WorkOptionGrid
                  label="Info layout without media"
                  options={PORTFOLIO_WORK_NO_MEDIA_INFO_LAYOUT_OPTIONS}
                  value={work.noMediaInfoLayout}
                  onChange={(noMediaInfoLayout) => onChange({ noMediaInfoLayout })}
                  columns={3}
                />
                <p className="text-sm text-neutral-500">
                  Sans média, le contenu remonte pour remplir la carte. Choisis la largeur et
                  l’alignement du bloc d’informations.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {subSection === 'title' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, project title color follows its palette token. Turn off to pick the text color freely."
          />
          <WorkToggleRow
            label="Show project title"
            description="Display the project name on each card."
            checked={work.showCardTitle}
            onChange={(showCardTitle) => onChange({ showCardTitle })}
          />
          {work.showCardTitle ? (
            <>
              <WorkOverlayElementPlacementControls work={work} elementId="title" onChange={onChange} />
              <WorkElementChromeControls
                work={work}
                chromeId="cardTitle"
                onChange={onChange}
                title="Fond du titre"
                description="Fond derrière le titre du projet sur la carte."
              />
              <WorkInlineTypography
                work={work}
                target="cardTitle"
                onChange={onChange}
                title="Title typography"
              />
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'description' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, description color follows its palette token. Turn off to pick the text color freely."
          />
          <WorkToggleRow
            label="Show description"
            description="Display the project description under the title."
            checked={work.showCardDescription}
            onChange={(showCardDescription) => onChange({ showCardDescription })}
          />
          {work.showCardDescription ? (
            <>
              <WorkOverlayElementPlacementControls
                work={work}
                elementId="description"
                onChange={onChange}
              />
              <WorkElementChromeControls
                work={work}
                chromeId="cardDescription"
                onChange={onChange}
                title="Fond de la description"
                description="Fond derrière le texte de description sur la carte."
              />
              <WorkInlineTypography
                work={work}
                target="cardDescription"
                onChange={onChange}
                title="Description typography"
              />
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'tools' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, tools label and list colors follow palette tokens. Turn off to set them freely below."
          />
          <WorkToggleRow
            label="Show tools block"
            description="Display tools used on each project card."
            checked={work.showCardTools}
            onChange={(showCardTools) => onChange({ showCardTools })}
          />
          {work.showCardTools ? (
            <>
              <WorkToggleRow
                label="Tool icons"
                checked={work.showCardToolIcons}
                onChange={(showCardToolIcons) => onChange({ showCardToolIcons })}
              />
              <WorkToggleRow
                label="Tool text list"
                checked={work.showCardToolList}
                onChange={(showCardToolList) => onChange({ showCardToolList })}
              />
              <WorkToggleRow
                label="“Tools to use” label"
                checked={work.showToolsLabel}
                onChange={(showToolsLabel) => onChange({ showToolsLabel })}
              />
              {work.showToolsLabel ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Label text
                  </p>
                  <input
                    type="text"
                    value={work.toolsLabelText}
                    placeholder="Tools to use"
                    onChange={(event) => onChange({ toolsLabelText: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              ) : null}

              <WorkOptionGrid
                label="Tools display"
                options={PORTFOLIO_WORK_TOOLS_DISPLAY_OPTIONS}
                value={work.toolsDisplay}
                onChange={(toolsDisplay) => onChange({ toolsDisplay })}
                columns={2}
              />

              <WorkOptionGrid
                label="Tools icon size"
                options={PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS}
                value={work.toolsIconSize}
                onChange={(toolsIconSize) => onChange({ toolsIconSize })}
                columns={2}
              />

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Max tools shown
                  </p>
                  <span className="text-sm font-semibold text-neutral-700">{work.maxToolsShown}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={work.maxToolsShown}
                  onChange={(event) => onChange({ maxToolsShown: Number(event.target.value) })}
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                />
                <p className="mt-2 text-sm text-neutral-500">
                  Tool logos appear when they exist in the NoProbleme library for each project&apos;s
                  tools.
                </p>
              </div>

              <WorkOverlayElementPlacementControls work={work} elementId="tools" onChange={onChange} />

              <WorkElementChromeControls
                work={work}
                chromeId="tools"
                onChange={onChange}
                title="Fond des outils"
                description="Fond commun derrière le label « Tools to use » et les icônes."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot="toolsIconBackground"
                  label="Icon background"
                  value={work.toolsIconBackgroundColor}
                />
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot="toolsIconBorder"
                  label="Icon border"
                  value={work.toolsIconBorderColor}
                />
              </div>

              {work.showToolsLabel ? (
                <WorkInlineTypography
                  work={work}
                  target="toolsLabel"
                  onChange={onChange}
                  title="Tools label typography"
                />
              ) : null}
              {work.showCardToolList ? (
                <WorkInlineTypography
                  work={work}
                  target="toolsList"
                  onChange={onChange}
                  title="Tools list typography"
                />
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'cta' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, CTA accent and text colors follow palette tokens. Turn off to pick them freely below."
          />

          <WorkToggleRow
            label="Show view project button"
            checked={work.showCardCta}
            onChange={(showCardCta) => onChange({ showCardCta })}
          />

          {work.showCardCta ? (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Button label
                </p>
                <input
                  type="text"
                  value={work.ctaLabel}
                  onChange={(event) => onChange({ ctaLabel: event.target.value })}
                  placeholder="View project"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                />
              </div>

              <WorkOptionGrid
                label="Button style"
                options={PORTFOLIO_WORK_CTA_DESIGN_OPTIONS}
                value={work.ctaDesign}
                onChange={(ctaDesign) => onChange({ ctaDesign })}
                columns={2}
              />

              <WorkOptionGrid
                label="Épaisseur de bordure"
                options={PORTFOLIO_WORK_CTA_BORDER_WIDTH_OPTIONS}
                value={work.ctaBorderWidth}
                onChange={(ctaBorderWidth) => onChange({ ctaBorderWidth })}
                columns={2}
              />

              <WorkOptionGrid
                label="Coins arrondis (CTA)"
                options={PORTFOLIO_WORK_CTA_BORDER_RADIUS_OPTIONS}
                value={work.ctaBorderRadius}
                onChange={(ctaBorderRadius) => onChange({ ctaBorderRadius })}
                columns={3}
              />
              {(work.ctaDesign === 'circle-icon' || work.ctaDesign === 'text-arrow') && (
                <p className="text-sm text-neutral-500">
                  Le rayon s’applique aux styles <span className="font-semibold text-neutral-700">pill</span>.
                  Circle icon garde un cercle ; Text + arrow n’a pas de boîte.
                </p>
              )}

              <WorkColorField
                work={work}
                onChange={onChange}
                slot="ctaAccent"
                label="Button accent (fill / outline)"
                value={work.ctaColor}
              />

              <WorkColorField
                work={work}
                onChange={onChange}
                slot="ctaBorder"
                label="Button border"
                value={work.ctaBorderColor}
              />

              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Effet au survol</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Comme la Navigation — couleurs de fond, texte et bordure au hover, liées à la
                    palette.
                  </p>
                </div>

                <WorkToggleRow
                  label="Activer le hover"
                  description="Au survol, le bouton bascule vers les couleurs ci-dessous."
                  checked={work.ctaHoverEnabled}
                  onChange={(ctaHoverEnabled) => onChange({ ctaHoverEnabled })}
                />

                {work.ctaHoverEnabled ? (
                  <>
                    <WorkColorField
                      work={work}
                      onChange={onChange}
                      slot="ctaHoverBackground"
                      label="Fond au survol"
                      value={work.ctaHoverBackgroundColor}
                    />
                    <WorkColorField
                      work={work}
                      onChange={onChange}
                      slot="ctaHoverText"
                      label="Texte au survol"
                      value={work.ctaHoverTextColor}
                    />
                    <WorkColorField
                      work={work}
                      onChange={onChange}
                      slot="ctaHoverBorder"
                      label="Bordure au survol"
                      value={work.ctaHoverBorderColor}
                    />
                  </>
                ) : null}
              </div>

              <WorkOptionGrid
                label="Emplacement du bouton (pile)"
                options={PORTFOLIO_WORK_CTA_ALIGNMENT_OPTIONS}
                value={work.ctaAlignment}
                onChange={(ctaAlignment) => onChange({ ctaAlignment })}
                columns={3}
              />

              <WorkOverlayElementPlacementControls work={work} elementId="cta" onChange={onChange} />

              <WorkInlineTypography
                work={work}
                target="cta"
                onChange={onChange}
                title="CTA typography"
                extra={
                  <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                    Sur les pills remplies, le texte suit le <span className="font-semibold text-neutral-700">fond de page</span>{' '}
                    (token fond) — pas un blanc fixe. Outline / circle / text utilisent « CTA text »
                    (texteFort). Le hover suit les tokens ci-dessus.
                  </p>
                }
              />
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, section fill colors follow palette tokens. Turn off to pick them freely below."
          />

          <SectionBackgroundSettingsFields
            settings={work}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onBgColorChange }) => {
              const slot = WORK_BACKGROUND_LABEL_SLOTS[label];
              if (!slot) {
                return (
                  <WorkManualColorField
                    label={label}
                    value={value}
                    onChange={onBgColorChange}
                  />
                );
              }
              return (
                <WorkColorField
                  work={work}
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

      {subSection === 'palette' ? <WorkPalettePanel work={work} onChange={onChange} /> : null}
    </div>
  );
}
