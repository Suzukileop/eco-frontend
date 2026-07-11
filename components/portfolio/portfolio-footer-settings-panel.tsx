'use client';

import { useState } from 'react';
import {
  PORTFOLIO_FOOTER_CTA_BUTTON_BORDER_OPTIONS,
  PORTFOLIO_FOOTER_CTA_BUTTON_PADDING_OPTIONS,
  PORTFOLIO_FOOTER_CTA_BUTTON_RADIUS_OPTIONS,
  PORTFOLIO_FOOTER_DESCRIPTION_SOURCE_OPTIONS,
  PORTFOLIO_FOOTER_DESIGN_OPTIONS,
  PORTFOLIO_FOOTER_PATTERN_OPTIONS,
  footerColorLuminance,
  footerContrastingPrimary,
  isFooterBackgroundLight,
  type PortfolioFooterSectionSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';

type FooterSubSection = 'general' | 'content' | 'background';

const FOOTER_SUB_SECTIONS: { id: FooterSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Visibility, design, and colors.' },
  {
    id: 'content',
    label: 'Content',
    description: 'Brand, description, contact details, links, and credit.',
  },
  {
    id: 'background',
    label: 'Background',
    description: 'Fill, gradient, and pattern motifs behind this section.',
  },
];

function FooterToggleRow({
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

function FooterOptionGrid<T extends string>({
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

function FooterColorField({
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

export function FooterSettingsPanel({
  footer,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
}) {
  const [subSection, setSubSection] = useState<FooterSubSection>('general');
  const activeMeta = FOOTER_SUB_SECTIONS.find((section) => section.id === subSection) ?? FOOTER_SUB_SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Footer subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as FooterSubSection)}
          className="min-w-[12rem] flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:max-w-xs"
        >
          {FOOTER_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <FooterToggleRow
            label="Show section"
            description="Display the footer on your public portfolio."
            checked={footer.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <FooterOptionGrid
            label="Design"
            options={PORTFOLIO_FOOTER_DESIGN_OPTIONS}
            value={footer.design}
            onChange={(design) => onChange({ design })}
            columns={2}
          />
          {footer.design === 'minimal' ? (
            <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Contact CTA</p>
              <FooterToggleRow
                label="Show CTA band"
                description="“Have a project in mind?” block with Contact me button."
                checked={footer.showContactCta}
                onChange={(showContactCta) => onChange({ showContactCta })}
              />
              {footer.showContactCta ? (
                <>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">CTA title</span>
                    <input
                      type="text"
                      value={footer.ctaTitle}
                      onChange={(event) => onChange({ ctaTitle: event.target.value })}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                      Subtitle (empty = auto)
                    </span>
                    <input
                      type="text"
                      value={footer.ctaSubtitle}
                      onChange={(event) => onChange({ ctaSubtitle: event.target.value })}
                      placeholder="Available this week · response within 24h"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                      Button label
                    </span>
                    <input
                      type="text"
                      value={footer.ctaButtonLabel}
                      onChange={(event) => onChange({ ctaButtonLabel: event.target.value })}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FooterColorField
                      label="CTA title color"
                      value={footer.ctaTitleColor ?? '#ffffff'}
                      onChange={(ctaTitleColor) => onChange({ ctaTitleColor })}
                    />
                    <FooterColorField
                      label="CTA subtitle color"
                      value={footer.ctaSubtitleColor ?? '#ffffff'}
                      onChange={(ctaSubtitleColor) => onChange({ ctaSubtitleColor })}
                    />
                  </div>
                  <p className="text-sm text-neutral-500">
                    Band background uses the <span className="font-semibold text-neutral-700">Marketplace link / CTA band</span>{' '}
                    color below. On a light band, pick dark title/subtitle colors.
                  </p>

                  <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white/80 p-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">Contact me button</p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Background, text, border, radius, and size of the CTA button.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FooterColorField
                        label="Button background"
                        value={footer.ctaButtonBackgroundColor ?? '#ffffff'}
                        onChange={(ctaButtonBackgroundColor) => onChange({ ctaButtonBackgroundColor })}
                      />
                      <FooterColorField
                        label="Button text"
                        value={footer.ctaButtonTextColor ?? '#0a0a0a'}
                        onChange={(ctaButtonTextColor) => onChange({ ctaButtonTextColor })}
                      />
                    </div>
                    <FooterOptionGrid
                      label="Border"
                      options={PORTFOLIO_FOOTER_CTA_BUTTON_BORDER_OPTIONS}
                      value={footer.ctaButtonBorder ?? 'none'}
                      onChange={(ctaButtonBorder) => onChange({ ctaButtonBorder })}
                      columns={3}
                    />
                    {(footer.ctaButtonBorder ?? 'none') !== 'none' ? (
                      <FooterColorField
                        label="Border color"
                        value={footer.ctaButtonBorderColor ?? '#e5e5e5'}
                        onChange={(ctaButtonBorderColor) => onChange({ ctaButtonBorderColor })}
                      />
                    ) : null}
                    <FooterOptionGrid
                      label="Radius"
                      options={PORTFOLIO_FOOTER_CTA_BUTTON_RADIUS_OPTIONS}
                      value={footer.ctaButtonRadius ?? 'md'}
                      onChange={(ctaButtonRadius) => onChange({ ctaButtonRadius })}
                      columns={3}
                    />
                    <FooterOptionGrid
                      label="Padding"
                      options={PORTFOLIO_FOOTER_CTA_BUTTON_PADDING_OPTIONS}
                      value={footer.ctaButtonPadding ?? 'md'}
                      onChange={(ctaButtonPadding) => onChange({ ctaButtonPadding })}
                      columns={3}
                    />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
          <FooterToggleRow
            label="Top border"
            description="Separator line above the footer."
            checked={footer.showTopBorder}
            onChange={(showTopBorder) => onChange({ showTopBorder })}
          />
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Colors</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FooterColorField
                label="Primary text"
                value={footer.primaryColor}
                onChange={(primaryColor) => onChange({ primaryColor })}
              />
              <FooterColorField
                label="Muted text"
                value={footer.textColor}
                onChange={(textColor) => onChange({ textColor })}
              />
              <FooterColorField
                label="Icons"
                value={footer.iconColor}
                onChange={(iconColor) => onChange({ iconColor })}
              />
              <FooterColorField
                label="Marketplace link / CTA band"
                value={footer.accentColor}
                onChange={(accentColor) => onChange({ accentColor })}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                onChange({
                  primaryColor: footerContrastingPrimary(footer),
                  textColor: isFooterBackgroundLight(footer) ? '#737373' : '#a3a3a3',
                  iconColor: isFooterBackgroundLight(footer) ? '#525252' : '#737373',
                })
              }
              className="text-sm font-semibold text-neutral-700 underline-offset-2 hover:underline"
            >
              Auto-contrast from background
            </button>
          </div>
        </div>
      ) : null}

      {subSection === 'content' ? (
        <div className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Brand</p>
            <FooterToggleRow
              label="Name / brand"
              description="Show your name as the footer brand."
              checked={footer.showBrand}
              onChange={(showBrand) => onChange({ showBrand })}
            />
            <FooterToggleRow
              label="Avatar / logo"
              description="Use your profile photo as a small logo."
              checked={footer.showAvatar}
              onChange={(showAvatar) => onChange({ showAvatar })}
            />
            <FooterToggleRow
              label="Description"
              description="Short bio or why-me blurb under the brand."
              checked={footer.showDescription}
              onChange={(showDescription) => onChange({ showDescription })}
            />
            {footer.showDescription ? (
              <>
                <FooterOptionGrid
                  label="Description source"
                  options={PORTFOLIO_FOOTER_DESCRIPTION_SOURCE_OPTIONS}
                  value={footer.descriptionSource}
                  onChange={(descriptionSource) => onChange({ descriptionSource })}
                  columns={3}
                />
                {footer.descriptionSource === 'custom' ? (
                  <textarea
                    value={footer.descriptionCustom}
                    onChange={(event) => onChange({ descriptionCustom: event.target.value })}
                    rows={3}
                    placeholder="A short line about you or your studio…"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                ) : null}
              </>
            ) : null}
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Contact</p>
            <FooterToggleRow
              label="Email"
              checked={footer.showEmail}
              onChange={(showEmail) => onChange({ showEmail })}
            />
            <FooterToggleRow
              label="Phone"
              checked={footer.showPhone}
              onChange={(showPhone) => onChange({ showPhone })}
            />
            <FooterToggleRow
              label="Location"
              checked={footer.showLocation}
              onChange={(showLocation) => onChange({ showLocation })}
            />
            <FooterToggleRow
              label="Availability / hours"
              checked={footer.showHours}
              onChange={(showHours) => onChange({ showHours })}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Links & credit</p>
            <FooterToggleRow
              label="Social / contact links"
              description="Website and social shortcuts."
              checked={footer.showContactLinks}
              onChange={(showContactLinks) => onChange({ showContactLinks })}
            />
            <FooterToggleRow
              label="Copyright"
              description="© year and creator name."
              checked={footer.showCopyright}
              onChange={(showCopyright) => onChange({ showCopyright })}
            />
            <FooterToggleRow
              label="Marketplace link"
              description="Link to your NoProbleme marketplace profile."
              checked={footer.showMarketplaceLink}
              onChange={(showMarketplaceLink) => onChange({ showMarketplaceLink })}
            />
            <FooterToggleRow
              label="Profile visits"
              description="Public visit counter when available."
              checked={footer.showProfileVisits}
              onChange={(showProfileVisits) => onChange({ showProfileVisits })}
            />
            <FooterToggleRow
              label="Design credit"
              description="“Design by NoProbleme” line."
              checked={footer.showDesignCredit}
              onChange={(showDesignCredit) => onChange({ showDesignCredit })}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-6">
          <SectionBackgroundSettingsFields
            settings={footer}
            onChange={(patch) => {
              const next = { ...footer, ...patch };
              const shouldFlipPrimary =
                isFooterBackgroundLight(next) && footerColorLuminance(footer.primaryColor) > 0.85;
              onChange({
                ...patch,
                ...(shouldFlipPrimary
                  ? {
                      primaryColor: footerContrastingPrimary(next),
                      textColor: '#737373',
                      iconColor: '#525252',
                    }
                  : {}),
              });
            }}
          />
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Background pattern
            </p>
            <FooterOptionGrid
              label="Motif"
              options={PORTFOLIO_FOOTER_PATTERN_OPTIONS}
              value={footer.pattern}
              onChange={(pattern) => onChange({ pattern })}
              columns={2}
            />
            {footer.pattern !== 'none' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FooterColorField
                  label="Pattern color"
                  value={footer.patternColor}
                  onChange={(patternColor) => onChange({ patternColor })}
                />
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                    Pattern opacity · {footer.patternOpacity}%
                  </span>
                  <input
                    type="range"
                    min={4}
                    max={60}
                    step={1}
                    value={footer.patternOpacity}
                    onChange={(event) => onChange({ patternOpacity: Number(event.target.value) })}
                    className="mt-3 w-full accent-neutral-900"
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
