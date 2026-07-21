'use client';

import { useState } from 'react';
import {
  PORTFOLIO_FAQ_CONTENT_ALIGN_OPTIONS,
  PORTFOLIO_FAQ_EXPAND_ICON_OPTIONS,
  PORTFOLIO_FAQ_HEADER_FONT_OPTIONS,
  PORTFOLIO_FAQ_ITEM_DESIGN_OPTIONS,
  PORTFOLIO_FAQ_ITEM_GAP_OPTIONS,
  PORTFOLIO_FAQ_LIST_MAX_WIDTH_OPTIONS,
  PORTFOLIO_FAQ_LIST_PLACEMENT_OPTIONS,
  PORTFOLIO_FAQ_STYLE_TARGET_OPTIONS,
  PORTFOLIO_FAQ_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_FAQ_TITLE_PRESET_OPTIONS,
  patchFaqElementStyle,
  type PortfolioFaqSectionSettings,
  type PortfolioFaqStyleTarget,
} from '@/components/portfolio/portfolio-faq-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  LIGHT_HERO_PALETTE,
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  applyFaqPaletteToSettings,
  DARK_FAQ_PALETTE,
  DEFAULT_FAQ_COLOR_BINDINGS,
  DEFAULT_FAQ_PALETTE,
  FAQ_STYLE_TARGET_COLOR_SLOT,
  mergeFaqColorBindings,
  mergeFaqPalette,
  patchFaqColorBinding,
  patchFaqColorField,
  patchFaqPalette,
  PORTFOLIO_FAQ_COLOR_SLOT_OPTIONS,
  type FaqColorSlot,
} from '@/components/portfolio/portfolio-faq-palette-settings';
import {
  PortfolioCardFrameSettingsFields,
  type PortfolioCardFrameColorFieldKey,
} from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';

const FAQ_BACKGROUND_LABEL_SLOTS: Record<string, FaqColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

const FAQ_FRAME_SLOTS: Record<PortfolioCardFrameColorFieldKey, FaqColorSlot> = {
  cardBorderColor: 'cardBorder',
  cardBackgroundColor: 'cardBackground',
  cardBackgroundColorA: 'cardBackgroundA',
  cardBackgroundColorB: 'cardBackgroundB',
  cardDividerColor: 'cardDivider',
};

export type FaqSubSection =
  | 'general'
  | 'palette'
  | 'header'
  | 'frame'
  | 'items'
  | 'styleQuestion'
  | 'styleAnswer'
  | 'styleNumber'
  | 'background';

const FAQ_SUB_SECTIONS: { id: FaqSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility, item design, spacing, and accent color.' },
  { id: 'palette', label: 'Palette', description: 'Eight semantic tokens and color slot bindings.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
  { id: 'frame', label: 'Frame', description: 'Complete card frame controls (border, split background, radius).' },
  { id: 'items', label: 'Items', description: 'Alignment, visibility toggles, icons, and accent colors.' },
  { id: 'styleQuestion', label: 'Style question', description: 'Color, font, size, and weight for question text.' },
  { id: 'styleAnswer', label: 'Style answer', description: 'Color, font, size, and weight for answer text.' },
  { id: 'styleNumber', label: 'Style number', description: 'Color, font, size, and weight for item numbers.' },
  { id: 'background', label: 'Background', description: 'Optional fill behind this section.' },
];

/** Legacy saved UI id `style` → Style question. */
export function normalizeFaqSubSection(value: string | undefined): FaqSubSection {
  if (value === 'style') return 'styleQuestion';
  if (FAQ_SUB_SECTIONS.some((section) => section.id === value)) return value as FaqSubSection;
  return 'header';
}

const FAQ_STYLE_BY_SUBSECTION: Record<
  Extract<FaqSubSection, 'styleQuestion' | 'styleAnswer' | 'styleNumber'>,
  PortfolioFaqStyleTarget
> = {
  styleQuestion: 'question',
  styleAnswer: 'answer',
  styleNumber: 'number',
};

function asFaqPatch(patch: Record<string, unknown> | object): Partial<PortfolioFaqSectionSettings> {
  return patch as Partial<PortfolioFaqSectionSettings>;
}

function FaqToggleRow({
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

function FaqOptionGrid<T extends string>({
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

function FaqManualColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-mono text-neutral-900"
        />
      </div>
    </div>
  );
}

function FaqColorField({
  faq,
  onChange,
  slot,
  label,
  value,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
  slot: FaqColorSlot;
  label: string;
  value: string;
}) {
  if (faq.useHeroPalette === false) {
    return (
      <FaqManualColorField
        label={label}
        value={value}
        onChange={(hex) => onChange(asFaqPatch(patchFaqColorField(faq, slot, hex)))}
      />
    );
  }

  const palette = mergeFaqPalette(DEFAULT_FAQ_PALETTE, faq.faqPalette);
  const bindings = mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, faq.faqColorBindings);
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
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
          onChange(asFaqPatch(patchFaqColorBinding(faq, slot, event.target.value as HeroPaletteTokenId)))
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
    </div>
  );
}

function FaqPalettePanel({
  faq,
  onChange,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
}) {
  const palette = mergeFaqPalette(DEFAULT_FAQ_PALETTE, faq.faqPalette);
  const bindings = mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, faq.faqColorBindings);
  const paletteOn = faq.useHeroPalette !== false;

  return (
    <div className="space-y-6">
      <SectionHeroPaletteToggle
        enabled={paletteOn}
        onChange={(useHeroPalette) =>
          onChange(
            asFaqPatch(
              useHeroPalette ? { useHeroPalette, ...applyFaqPaletteToSettings(faq) } : { useHeroPalette }
            )
          )
        }
        title="Use color palette"
        description="When on, FAQ colors follow these eight tokens. Turn off to edit colors manually in other tabs."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            onChange(
              asFaqPatch(
                paletteOn
                  ? { ...patchFaqPalette(faq, DARK_FAQ_PALETTE), useHeroPalette: true }
                  : { faqPalette: { ...DARK_FAQ_PALETTE } }
              )
            )
          }
          className="rounded-2xl border border-neutral-200 bg-neutral-950 px-4 py-3 text-left text-sm font-bold text-white"
        >
          Dark mode palette
        </button>
        <button
          type="button"
          onClick={() =>
            onChange(
              asFaqPatch(
                paletteOn
                  ? { ...patchFaqPalette(faq, LIGHT_HERO_PALETTE), useHeroPalette: true }
                  : { faqPalette: { ...LIGHT_HERO_PALETTE } }
              )
            )
          }
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm font-bold text-neutral-900"
        >
          Light mode palette
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
          <FaqManualColorField
            key={token.value}
            label={token.label}
            value={palette[token.value]}
            onChange={(color) =>
              onChange(
                asFaqPatch(
                  paletteOn
                    ? patchFaqPalette(faq, { [token.value]: color })
                    : {
                        faqPalette: {
                          ...mergeFaqPalette(DEFAULT_FAQ_PALETTE, faq.faqPalette),
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
            onClick={() => onChange(asFaqPatch(applyFaqPaletteToSettings(faq)))}
            className="inline-flex w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
          >
            Apply palette to all bound colors
          </button>
          <div className="grid gap-3 sm:grid-cols-2">
            {PORTFOLIO_FAQ_COLOR_SLOT_OPTIONS.map((slot) => (
              <div key={slot.value} className="rounded-2xl border border-neutral-200/80 bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-800">{slot.label}</span>
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-neutral-200"
                    style={{ backgroundColor: resolveHeroPaletteColor(palette, bindings[slot.value]) }}
                    aria-hidden
                  />
                </div>
                <select
                  value={bindings[slot.value]}
                  onChange={(event) =>
                    onChange(
                      asFaqPatch(
                        patchFaqColorBinding(faq, slot.value, event.target.value as HeroPaletteTokenId)
                      )
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800"
                >
                  {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                    <option key={token.value} value={token.value}>
                      {token.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function FaqSettingsPanel({
  faq,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
  subSection?: FaqSubSection;
  onSubSectionChange?: (value: FaqSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<FaqSubSection>('header');
  const subSection = normalizeFaqSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: FaqSubSection) => {
    const next = normalizeFaqSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const activeMeta = FAQ_SUB_SECTIONS.find((section) => section.id === subSection) ?? FAQ_SUB_SECTIONS[0];

  const styleSubsection = subSection === 'styleQuestion' || subSection === 'styleAnswer' || subSection === 'styleNumber'
    ? subSection
    : null;
  const styleTarget = styleSubsection ? FAQ_STYLE_BY_SUBSECTION[styleSubsection] : 'question';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">FAQ subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as FaqSubSection)}
          className="w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:min-w-[12rem] sm:max-w-xs sm:flex-1"
        >
          {FAQ_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <FaqToggleRow
            label="Show section"
            description="Display the FAQ block on your public portfolio."
            checked={faq.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionHeroPaletteToggle
            enabled={faq.useHeroPalette !== false}
            onChange={(useHeroPalette) =>
              onChange(
                asFaqPatch(
                  useHeroPalette ? { useHeroPalette, ...applyFaqPaletteToSettings(faq) } : { useHeroPalette }
                )
              )
            }
          />
          <FaqOptionGrid
            label="Item design"
            options={PORTFOLIO_FAQ_ITEM_DESIGN_OPTIONS}
            value={faq.itemDesign}
            onChange={(itemDesign) => onChange({ itemDesign })}
            columns={2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FaqOptionGrid
              label="Item spacing"
              options={PORTFOLIO_FAQ_ITEM_GAP_OPTIONS}
              value={faq.itemGap}
              onChange={(itemGap) => onChange({ itemGap })}
              columns={2}
            />
            <FaqOptionGrid
              label="List width"
              options={PORTFOLIO_FAQ_LIST_MAX_WIDTH_OPTIONS}
              value={faq.listMaxWidth}
              onChange={(listMaxWidth) => onChange({ listMaxWidth })}
              columns={2}
            />
          </div>
          <FaqOptionGrid
            label="List placement"
            options={PORTFOLIO_FAQ_LIST_PLACEMENT_OPTIONS}
            value={faq.listPlacement}
            onChange={(listPlacement) => onChange({ listPlacement })}
            columns={3}
          />
          <FaqColorField faq={faq} onChange={onChange} slot="accent" label="Accent color" value={faq.accentColor} />
        </div>
      ) : null}

      {subSection === 'palette' ? <FaqPalettePanel faq={faq} onChange={onChange} /> : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <FaqOptionGrid
            label="Title preset"
            options={PORTFOLIO_FAQ_TITLE_PRESET_OPTIONS}
            value={faq.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
            columns={2}
          />
          {faq.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={faq.titleCustom || faq.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <FaqOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_FAQ_SUBTITLE_PRESET_OPTIONS}
            value={faq.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
            columns={2}
          />
          {faq.subtitlePreset === 'custom' || faq.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Subtitle text</p>
              <textarea
                rows={3}
                value={faq.subtitlePreset === 'custom' ? faq.subtitleCustom || faq.subtitle : faq.subtitle}
                onChange={(event) =>
                  onChange(
                    faq.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FaqOptionGrid
              label="Title font"
              options={PORTFOLIO_FAQ_HEADER_FONT_OPTIONS}
              value={faq.titleFont}
              onChange={(titleFont) => onChange({ titleFont })}
              columns={2}
            />
            <FaqOptionGrid
              label="Subtitle font"
              options={PORTFOLIO_FAQ_HEADER_FONT_OPTIONS}
              value={faq.subtitleFont}
              onChange={(subtitleFont) => onChange({ subtitleFont })}
              columns={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FaqColorField faq={faq} onChange={onChange} slot="title" label="Title color" value={faq.titleColor} />
            <FaqColorField
              faq={faq}
              onChange={onChange}
              slot="subtitle"
              label="Subtitle color"
              value={faq.subtitleColor}
            />
          </div>

          <FaqOptionGrid
            label="Header alignment"
            options={[
              { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
              { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
              { value: 'right' as const, label: 'Right', description: 'Align header to the right.' },
            ]}
            value={faq.headerAlignment}
            onChange={(headerAlignment) => onChange({ headerAlignment })}
            columns={3}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FaqToggleRow
              label="Uppercase title"
              checked={faq.titleUppercase}
              onChange={(titleUppercase) => onChange({ titleUppercase })}
            />
            <FaqToggleRow
              label="Uppercase subtitle"
              checked={faq.subtitleUppercase}
              onChange={(subtitleUppercase) => onChange({ subtitleUppercase })}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'frame' ? (
        <PortfolioCardFrameSettingsFields
          settings={faq}
          onChange={onChange}
          heading="FAQ frame"
          description="Border color, full frame background, split X/Y, radius, and item shell spacing."
          renderColorField={({ field, label, value }) => (
            <FaqColorField
              faq={faq}
              onChange={onChange}
              slot={FAQ_FRAME_SLOTS[field]}
              label={label}
              value={value}
            />
          )}
        />
      ) : null}

      {subSection === 'items' ? (
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Visibility</p>
            <FaqToggleRow
              label="Item numbers"
              description="Show numbered labels before each question."
              checked={faq.showItemNumbers}
              onChange={(showItemNumbers) => onChange({ showItemNumbers })}
            />
            <FaqToggleRow
              label="Answer accent border"
              description="Left border on expanded answers."
              checked={faq.showAnswerAccentBorder}
              onChange={(showAnswerAccentBorder) => onChange({ showAnswerAccentBorder })}
            />
            <FaqToggleRow
              label="Expand icon"
              description="Plus or chevron icon on each question row."
              checked={faq.showExpandIcon}
              onChange={(showExpandIcon) => onChange({ showExpandIcon })}
            />
          </div>

          <FaqOptionGrid
            label="Content alignment"
            options={PORTFOLIO_FAQ_CONTENT_ALIGN_OPTIONS}
            value={faq.itemAlign}
            onChange={(itemAlign) => onChange({ itemAlign })}
            columns={3}
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Accents & icon</p>
            <FaqColorField
              faq={faq}
              onChange={onChange}
              slot="answerAccentBorder"
              label="Answer border color"
              value={faq.answerAccentBorderColor}
            />
            <FaqOptionGrid
              label="Expand icon style"
              options={PORTFOLIO_FAQ_EXPAND_ICON_OPTIONS}
              value={faq.expandIconStyle}
              onChange={(expandIconStyle) => onChange({ expandIconStyle })}
              columns={2}
            />
            <FaqColorField
              faq={faq}
              onChange={onChange}
              slot="expandIcon"
              label="Expand icon color"
              value={faq.expandIconColor}
            />
          </div>
        </div>
      ) : null}

      {styleSubsection ? (
        <PortfolioElementStyleFields
          targets={PORTFOLIO_FAQ_STYLE_TARGET_OPTIONS.filter((option) => option.value === styleTarget)}
          activeTarget={styleTarget}
          onTargetChange={() => undefined}
          style={faq.elementStyles[styleTarget]}
          onStyleChange={(patch) => {
            const next = patchFaqElementStyle(faq.elementStyles, styleTarget, patch);
            const slot = FAQ_STYLE_TARGET_COLOR_SLOT[styleTarget];
            onChange(
              asFaqPatch(
                faq.useHeroPalette !== false && patch.color
                  ? { elementStyles: next, ...patchFaqColorField(faq, slot, patch.color) }
                  : { elementStyles: next }
              )
            );
          }}
          renderColorField={({ label, value }) => (
            <FaqColorField
              faq={faq}
              onChange={onChange}
              slot={FAQ_STYLE_TARGET_COLOR_SLOT[styleTarget]}
              label={label}
              value={value}
            />
          )}
        />
      ) : null}

      {subSection === 'background' ? (
        <SectionBackgroundSettingsFields
          settings={faq}
          onChange={onChange}
          renderColorField={({ label, value, onChange: onBgColorChange }) => {
            const slot = FAQ_BACKGROUND_LABEL_SLOTS[label];
            if (!slot) {
              return <FaqManualColorField label={label} value={value} onChange={onBgColorChange} />;
            }
            return (
              <FaqColorField faq={faq} onChange={onChange} slot={slot} label={label} value={value} />
            );
          }}
        />
      ) : null}
    </div>
  );
}
