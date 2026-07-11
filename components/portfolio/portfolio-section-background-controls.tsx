'use client';

import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_SECTION_BACKGROUND_FILL_OPTIONS,
  PORTFOLIO_SECTION_BACKGROUND_GRADIENT_TYPE_OPTIONS,
  sectionBackgroundStyle,
  type PortfolioSectionBackgroundFill,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { HeroBackgroundGradientType } from '@/components/portfolio/portfolio-hero-background-settings';
import {
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS,
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-global-settings';
import { PortfolioBackgroundImageUpload } from '@/components/portfolio/portfolio-background-image-upload';

function ToggleRow({
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

function ColorField({
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
        <span className="h-11 w-20 rounded-xl border border-neutral-200/80 shadow-inner" style={{ backgroundColor: value }} />
      </div>
    </div>
  );
}

function OptionGrid<T extends string>({
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

function OpacitySlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
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
      />
    </div>
  );
}

export function SectionBackgroundFillControls({
  title,
  description,
  settings,
  onChange,
}: {
  title: string;
  description: string;
  settings: PortfolioSectionBackgroundSettings;
  onChange: (patch: Partial<PortfolioSectionBackgroundSettings>) => void;
}) {
  const previewStyle: CSSProperties =
    sectionBackgroundStyle({ ...settings, sectionBackgroundEnabled: true }) ?? {};

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-950">{title}</p>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        </div>
        <span className="h-14 w-24 shrink-0 rounded-xl border border-neutral-200/80 shadow-inner" style={previewStyle} />
      </div>

      <OptionGrid
        label="Fill type"
        options={PORTFOLIO_SECTION_BACKGROUND_FILL_OPTIONS}
        value={settings.sectionBackgroundFill}
        onChange={(sectionBackgroundFill) => onChange({ sectionBackgroundFill })}
        columns={3}
      />

      {settings.sectionBackgroundFill === 'solid' ? (
        <ColorField
          label="Color"
          value={settings.sectionBackgroundColor}
          onChange={(sectionBackgroundColor) => onChange({ sectionBackgroundColor })}
        />
      ) : null}

      {settings.sectionBackgroundFill === 'gradient' ? (
        <>
          <OptionGrid
            label="Gradient type"
            options={PORTFOLIO_SECTION_BACKGROUND_GRADIENT_TYPE_OPTIONS}
            value={settings.sectionBackgroundGradientType}
            onChange={(sectionBackgroundGradientType) =>
              onChange({ sectionBackgroundGradientType: sectionBackgroundGradientType as HeroBackgroundGradientType })
            }
          />
          <ColorField
            label="Gradient start"
            value={settings.sectionBackgroundGradientFrom}
            onChange={(sectionBackgroundGradientFrom) => onChange({ sectionBackgroundGradientFrom })}
          />
          <ColorField
            label="Gradient end"
            value={settings.sectionBackgroundGradientTo}
            onChange={(sectionBackgroundGradientTo) => onChange({ sectionBackgroundGradientTo })}
          />
          {settings.sectionBackgroundGradientType === 'linear' ? (
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Angle</p>
                <span className="text-sm font-semibold text-neutral-700">
                  {settings.sectionBackgroundGradientAngle}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={359}
                step={1}
                value={settings.sectionBackgroundGradientAngle}
                onChange={(event) =>
                  onChange({ sectionBackgroundGradientAngle: Number(event.target.value) })
                }
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              />
            </div>
          ) : null}
        </>
      ) : null}

      {settings.sectionBackgroundFill === 'image' ? (
        <>
          <PortfolioBackgroundImageUpload
            url={settings.sectionBackgroundImageUrl}
            onChange={(sectionBackgroundImageUrl) => onChange({ sectionBackgroundImageUrl })}
          />
          <OptionGrid
            label="Image size"
            options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS}
            value={settings.sectionBackgroundImageSize}
            onChange={(sectionBackgroundImageSize) => onChange({ sectionBackgroundImageSize })}
            columns={3}
          />
          <OptionGrid
            label="Image position"
            options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS}
            value={settings.sectionBackgroundImagePosition}
            onChange={(sectionBackgroundImagePosition) => onChange({ sectionBackgroundImagePosition })}
            columns={3}
          />
        </>
      ) : null}

      <OpacitySlider
        label="Opacity"
        value={settings.sectionBackgroundOpacity}
        onChange={(sectionBackgroundOpacity) => onChange({ sectionBackgroundOpacity })}
      />
    </div>
  );
}

export function SectionBackgroundSettingsFields({
  settings,
  onChange,
  title = 'Section background',
  description = 'Optional fill behind this section — solid color, gradient, or image.',
}: {
  settings: PortfolioSectionBackgroundSettings;
  onChange: (patch: Partial<PortfolioSectionBackgroundSettings>) => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="space-y-4">
      <ToggleRow
        label="Enable section background"
        description="Apply a custom background fill to this section."
        checked={settings.sectionBackgroundEnabled}
        onChange={(sectionBackgroundEnabled) => onChange({ sectionBackgroundEnabled })}
      />
      {settings.sectionBackgroundEnabled ? (
        <SectionBackgroundFillControls
          title={title}
          description={description}
          settings={settings}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}

export type { PortfolioSectionBackgroundFill };
