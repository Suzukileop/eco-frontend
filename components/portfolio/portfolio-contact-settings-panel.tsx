'use client';

import { useState } from 'react';
import {
  PORTFOLIO_CONTACT_BLOCK_ORDER_OPTIONS,
  PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS,
  PORTFOLIO_CONTACT_CARD_MAX_WIDTH_OPTIONS,
  PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS,
  PORTFOLIO_CONTACT_CTA_DESIGN_OPTIONS,
  PORTFOLIO_CONTACT_HEADER_FONT_OPTIONS,
  PORTFOLIO_CONTACT_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_CONTACT_TITLE_PRESET_OPTIONS,
  type PortfolioContactSectionSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { PortfolioCardFrameSettingsFields } from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';

type ContactSubSection = 'general' | 'header' | 'frame' | 'content' | 'background';

const CONTACT_SUB_SECTIONS: { id: ContactSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility, card design, and CTA styling.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
  { id: 'frame', label: 'Card frame', description: 'Border, split background, radius, and inner spacing.' },
  { id: 'content', label: 'Content', description: 'Show or hide contact channels and CTA.' },
  { id: 'background', label: 'Background', description: 'Optional fill behind this section.' },
];

function ContactToggleRow({
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

function ContactOptionGrid<T extends string>({
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

function ContactColorField({
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

export function ContactSettingsPanel({
  contact,
  onChange,
}: {
  contact: PortfolioContactSectionSettings;
  onChange: (patch: Partial<PortfolioContactSectionSettings>) => void;
}) {
  const [subSection, setSubSection] = useState<ContactSubSection>('header');
  const activeMeta = CONTACT_SUB_SECTIONS.find((section) => section.id === subSection) ?? CONTACT_SUB_SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Contact subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as ContactSubSection)}
          className="min-w-[12rem] flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:max-w-xs"
        >
          {CONTACT_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <ContactToggleRow
            label="Show section"
            description="Display the contact block on your public portfolio."
            checked={contact.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <ContactOptionGrid
            label="Card design"
            options={PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS}
            value={contact.cardDesign}
            onChange={(cardDesign) => onChange({ cardDesign })}
            columns={2}
          />
          <ContactOptionGrid
            label="Block order"
            options={PORTFOLIO_CONTACT_BLOCK_ORDER_OPTIONS}
            value={contact.blockOrder}
            onChange={(blockOrder) => onChange({ blockOrder })}
            columns={2}
          />
          <ContactOptionGrid
            label="Card max width"
            options={PORTFOLIO_CONTACT_CARD_MAX_WIDTH_OPTIONS}
            value={contact.cardMaxWidth}
            onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
            columns={2}
          />
          <ContactOptionGrid
            label="Card placement"
            options={PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS}
            value={contact.cardPlacement}
            onChange={(cardPlacement) => onChange({ cardPlacement })}
            columns={3}
          />
          <ContactOptionGrid
            label="CTA design"
            options={PORTFOLIO_CONTACT_CTA_DESIGN_OPTIONS}
            value={contact.ctaDesign}
            onChange={(ctaDesign) => onChange({ ctaDesign })}
            columns={2}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">CTA label</p>
            <input
              type="text"
              value={contact.ctaLabel}
              onChange={(event) => onChange({ ctaLabel: event.target.value })}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <ContactColorField
            label="CTA color"
            value={contact.ctaColor}
            onChange={(ctaColor) => onChange({ ctaColor })}
          />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <ContactOptionGrid
            label="Title preset"
            options={PORTFOLIO_CONTACT_TITLE_PRESET_OPTIONS}
            value={contact.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
            columns={2}
          />
          {contact.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={contact.titleCustom || contact.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <ContactOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_CONTACT_SUBTITLE_PRESET_OPTIONS}
            value={contact.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
            columns={2}
          />
          {contact.subtitlePreset === 'custom' || contact.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Subtitle text</p>
              <textarea
                rows={3}
                value={
                  contact.subtitlePreset === 'custom' ? contact.subtitleCustom || contact.subtitle : contact.subtitle
                }
                onChange={(event) =>
                  onChange(
                    contact.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <ContactOptionGrid
              label="Title font"
              options={PORTFOLIO_CONTACT_HEADER_FONT_OPTIONS}
              value={contact.titleFont}
              onChange={(titleFont) => onChange({ titleFont })}
              columns={2}
            />
            <ContactOptionGrid
              label="Subtitle font"
              options={PORTFOLIO_CONTACT_HEADER_FONT_OPTIONS}
              value={contact.subtitleFont}
              onChange={(subtitleFont) => onChange({ subtitleFont })}
              columns={2}
            />
          </div>

          <ContactToggleRow
            label="Serif subtitle"
            description="Use Playfair Display for the subtitle (editorial default)."
            checked={contact.subtitleSerif}
            onChange={(subtitleSerif) => onChange({ subtitleSerif })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ContactColorField
              label="Title color"
              value={contact.titleColor}
              onChange={(titleColor) => onChange({ titleColor })}
            />
            <ContactColorField
              label="Subtitle color"
              value={contact.subtitleColor}
              onChange={(subtitleColor) => onChange({ subtitleColor })}
            />
          </div>

          <ContactOptionGrid
            label="Header alignment"
            options={[
              { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
              { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
            ]}
            value={contact.headerAlignment}
            onChange={(headerAlignment) => onChange({ headerAlignment })}
            columns={2}
          />
        </div>
      ) : null}

      {subSection === 'frame' ? (
        <PortfolioCardFrameSettingsFields
          settings={contact}
          onChange={onChange}
          heading="Contact card frame"
          description="Complete frame controls, including split X/Y background."
        />
      ) : null}

      {subSection === 'content' ? (
        <div className="space-y-4">
          <ContactToggleRow
            label="Email"
            description="Show email address channel."
            checked={contact.showEmail}
            onChange={(showEmail) => onChange({ showEmail })}
          />
          <ContactToggleRow
            label="Phone"
            description="Show phone number channel."
            checked={contact.showPhone}
            onChange={(showPhone) => onChange({ showPhone })}
          />
          <ContactToggleRow
            label="Location"
            description="Show city or region."
            checked={contact.showLocation}
            onChange={(showLocation) => onChange({ showLocation })}
          />
          <ContactToggleRow
            label="Social links"
            description="Instagram, LinkedIn, and other profiles."
            checked={contact.showSocialLinks}
            onChange={(showSocialLinks) => onChange({ showSocialLinks })}
          />
          <ContactToggleRow
            label="CTA button"
            description="Primary action button below channels."
            checked={contact.showCta}
            onChange={(showCta) => onChange({ showCta })}
          />
          <ContactToggleRow
            label="Response time in subtitle"
            description="Include typical reply speed when using the response-time preset."
            checked={contact.showResponseTimeInSubtitle}
            onChange={(showResponseTimeInSubtitle) => onChange({ showResponseTimeInSubtitle })}
          />
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Contact details are edited in Creator Studio → Information. These settings control visibility and presentation.
          </p>
        </div>
      ) : null}

      {subSection === 'background' ? (
        <SectionBackgroundSettingsFields settings={contact} onChange={onChange} />
      ) : null}
    </div>
  );
}
