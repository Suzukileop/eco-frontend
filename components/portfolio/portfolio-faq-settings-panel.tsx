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
import { PortfolioCardFrameSettingsFields } from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';

type FaqSubSection = 'general' | 'header' | 'frame' | 'items' | 'style' | 'background';

const FAQ_SUB_SECTIONS: { id: FaqSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility, item design, spacing, and accent color.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
  { id: 'frame', label: 'Frame', description: 'Complete card frame controls (border, split background, radius).' },
  { id: 'items', label: 'Items', description: 'Alignment, visibility toggles, icons, and accent colors.' },
  { id: 'style', label: 'Style', description: 'Color, font, size, and weight for question, answer, and number.' },
  { id: 'background', label: 'Background', description: 'Optional fill behind this section.' },
];

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
      <div className={`mt-3 grid gap-2 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
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

function FaqColorField({
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

export function FaqSettingsPanel({
  faq,
  onChange,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
}) {
  const [subSection, setSubSection] = useState<FaqSubSection>('header');
  const [styleTarget, setStyleTarget] = useState<PortfolioFaqStyleTarget>('question');
  const activeMeta = FAQ_SUB_SECTIONS.find((section) => section.id === subSection) ?? FAQ_SUB_SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">FAQ subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as FaqSubSection)}
          className="min-w-[12rem] flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:max-w-xs"
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
          <FaqColorField
            label="Accent color"
            value={faq.accentColor}
            onChange={(accentColor) => onChange({ accentColor })}
          />
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            FAQ entries are edited in Creator Studio → Information. These settings control visibility and presentation.
          </p>
        </div>
      ) : null}

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
            <FaqColorField label="Title color" value={faq.titleColor} onChange={(titleColor) => onChange({ titleColor })} />
            <FaqColorField
              label="Subtitle color"
              value={faq.subtitleColor}
              onChange={(subtitleColor) => onChange({ subtitleColor })}
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
              label="Answer border color"
              value={faq.answerAccentBorderColor}
              onChange={(answerAccentBorderColor) => onChange({ answerAccentBorderColor })}
            />
            <FaqOptionGrid
              label="Expand icon style"
              options={PORTFOLIO_FAQ_EXPAND_ICON_OPTIONS}
              value={faq.expandIconStyle}
              onChange={(expandIconStyle) => onChange({ expandIconStyle })}
              columns={2}
            />
            <FaqColorField
              label="Expand icon color"
              value={faq.expandIconColor}
              onChange={(expandIconColor) => onChange({ expandIconColor })}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'style' ? (
        <PortfolioElementStyleFields
          targets={PORTFOLIO_FAQ_STYLE_TARGET_OPTIONS}
          activeTarget={styleTarget}
          onTargetChange={(value) => setStyleTarget(value as PortfolioFaqStyleTarget)}
          style={faq.elementStyles[styleTarget]}
          onStyleChange={(patch) =>
            onChange({ elementStyles: patchFaqElementStyle(faq.elementStyles, styleTarget, patch) })
          }
        />
      ) : null}

      {subSection === 'background' ? (
        <SectionBackgroundSettingsFields settings={faq} onChange={onChange} />
      ) : null}
    </div>
  );
}
