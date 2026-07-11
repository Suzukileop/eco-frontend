'use client';

import { useState, type CSSProperties } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  PORTFOLIO_HERO_AVAILABILITY_DESIGN_OPTIONS,
  PORTFOLIO_HERO_AVAILABILITY_PLACEMENT_OPTIONS,
  PORTFOLIO_HERO_CTA_DESIGN_OPTIONS,
  PORTFOLIO_HERO_CTA_PLACEMENT_OPTIONS,
  PORTFOLIO_HERO_HEADLINE_FONT_OPTIONS,
  PORTFOLIO_HERO_HEADLINE_PREFIX_OPTIONS,
  PORTFOLIO_HERO_HEADLINE_VALUE_OPTIONS,
  PORTFOLIO_HERO_BACKGROUND_FILL_OPTIONS,
  PORTFOLIO_HERO_BACKGROUND_GRADIENT_TYPE_OPTIONS,
  PORTFOLIO_HERO_MOTIF_LAYOUT_OPTIONS,
  PORTFOLIO_HERO_MOTIF_OPTIONS,
  resolveMotifPoints,
} from '@/components/portfolio/portfolio-hero-settings';
import { flipHeroLayoutPresentation } from '@/components/portfolio/portfolio-hero-layout-flip';
import { defaultHeroCopyPositionForLayout } from '@/components/portfolio/portfolio-hero-copy-settings';
import { PortfolioHeroCopyPositionEditor } from '@/components/portfolio/PortfolioHeroCopyPositionEditor';
import {
  PORTFOLIO_HERO_CREATOR_NAME_FONT_OPTIONS,
  PORTFOLIO_HERO_CREATOR_NAME_SIZE_OPTIONS,
  PORTFOLIO_HERO_FRAME_WIDTH_OPTIONS,
  PORTFOLIO_HERO_PORTRAIT_RADIUS_OPTIONS,
  PORTFOLIO_HERO_PORTRAIT_SIZE_OPTIONS,
  isValidProfileHexColor,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import type { PortfolioHeroSectionSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  DEFAULT_LEFT_CUSTOM_MOTIF_POINTS,
  PORTFOLIO_HERO_LEFT_MOTIF_OPTIONS,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';
import {
  DEFAULT_CUSTOM_MOTIF_POINTS,
  getMotifTemplatePoints,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import { PortfolioHeroMotifCanvasEditor } from '@/components/portfolio/PortfolioHeroMotifCanvasEditor';
import { getMotifPanelDefaultsForLayout } from '@/components/portfolio/portfolio-hero-motif-panel';
import { isPresetHeroHeadlinePrefix } from '@/components/portfolio/portfolio-hero-headline-settings';
import {
  heroMotifPanelFillStyle,
  heroSectionBackgroundStyle,
  PORTFOLIO_HERO_SECTION_BACKGROUND_FILL_OPTIONS,
} from '@/components/portfolio/portfolio-hero-background-settings';
import type { HeroBackgroundFill } from '@/components/portfolio/portfolio-hero-background-settings';
import { PortfolioHeroProfilePositionEditor } from '@/components/portfolio/PortfolioHeroProfilePositionEditor';
import { PortfolioHeroMetaPositionEditor } from '@/components/portfolio/PortfolioHeroMetaPositionEditor';
import {
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS,
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-global-settings';
import { PortfolioBackgroundImageUpload } from '@/components/portfolio/portfolio-background-image-upload';
import {
  PORTFOLIO_HERO_META_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_HERO_META_DISPLAY_OPTIONS,
  PORTFOLIO_HERO_META_FRAME_SHAPE_OPTIONS,
  PORTFOLIO_HERO_META_INNER_LAYOUT_OPTIONS,
  PORTFOLIO_HERO_META_PADDING_OPTIONS,
  PORTFOLIO_HERO_META_PLACEMENT_OPTIONS,
  PORTFOLIO_HERO_META_SPREAD_OPTIONS,
  PORTFOLIO_HERO_META_VALUE_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-hero-meta-settings';

export type HeroSettingsSubSection =
  | 'general'
  | 'background'
  | 'text'
  | 'right-motif'
  | 'left-motif'
  | 'portrait'
  | 'stats';

const HERO_SETTINGS_SUB_SECTIONS: {
  id: HeroSettingsSubSection;
  label: string;
  description: string;
}[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Section visibility, titles, and global layout flip.',
  },
  {
    id: 'background',
    label: 'Background',
    description: 'Section fill, gradients, opacity, and right motif surface.',
  },
  {
    id: 'text',
    label: 'Text & buttons',
    description: 'Headline, pitch placement, contact button, availability badge, and tools.',
  },
  {
    id: 'right-motif',
    label: 'Right motif',
    description: 'Dark geometric shape — height, form, placement, and color.',
  },
  {
    id: 'left-motif',
    label: 'Left motif',
    description: 'Decorative pattern behind the text column.',
  },
  {
    id: 'portrait',
    label: 'Portrait',
    description: 'Photo position, frame, size, and creator name on the motif.',
  },
  {
    id: 'stats',
    label: 'Stat cards',
    description: 'Years, projects, and location badges at the bottom of the hero.',
  },
];

function HeroSubSectionDropdown({
  value,
  onChange,
}: {
  value: HeroSettingsSubSection;
  onChange: (value: HeroSettingsSubSection) => void;
}) {
  return (
    <div className="relative shrink-0">
      <label htmlFor="hero-settings-subsection" className="sr-only">
        Hero settings section
      </label>
      <select
        id="hero-settings-subsection"
        value={value}
        onChange={(event) => onChange(event.target.value as HeroSettingsSubSection)}
        className="appearance-none rounded-full border border-neutral-300 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-neutral-900 shadow-sm transition hover:border-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
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
}) {
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

      {fill === 'image' && onImageUrlChange ? (
        <>
          <PortfolioBackgroundImageUpload url={imageUrl ?? ''} onChange={onImageUrlChange} />
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

      <HeroOpacitySlider label="Opacity" value={opacity} onChange={onOpacityChange} />
    </div>
  );
}

export function HeroSettingsPanel({
  hero,
  availableTools,
  onChange,
}: {
  hero: PortfolioHeroSectionSettings;
  availableTools: string[];
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
}) {
  const [subSection, setSubSection] = useState<HeroSettingsSubSection>('general');
  const activeMeta =
    HERO_SETTINGS_SUB_SECTIONS.find((section) => section.id === subSection) ?? HERO_SETTINGS_SUB_SECTIONS[0];

  const normalizedTools = Array.from(
    new Set(availableTools.map((item) => item.trim()).filter(Boolean))
  );
  const selectedTools =
    hero.selectedTools.length > 0
      ? hero.selectedTools.filter((tool) => normalizedTools.includes(tool))
      : normalizedTools;

  const toggleTool = (tool: string) => {
    const base = hero.selectedTools.length > 0 ? selectedTools : normalizedTools;
    const next = base.includes(tool) ? base.filter((item) => item !== tool) : [...base, tool];
    onChange({ selectedTools: next });
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

          <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-950">Flip hero layout</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Swap left and right columns — text, portrait, and motifs mirror together.
                </p>
                {hero.heroLayoutFlipped ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-orange-600">
                    Flipped layout active
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onChange(flipHeroLayoutPresentation(hero))}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Flip layout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-6">
          <HeroBackgroundFillControls
            title="Section background"
            description="Base fill behind the entire hero — solid, gradient, or uploaded image."
            fill={hero.heroSectionBackgroundFill}
            onFillChange={(heroSectionBackgroundFill) => onChange({ heroSectionBackgroundFill })}
            solidColor={hero.heroSectionBackgroundColor}
            onSolidColorChange={(heroSectionBackgroundColor) => onChange({ heroSectionBackgroundColor })}
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
            previewStyle={heroSectionBackgroundStyle(hero)}
            fillOptions={PORTFOLIO_HERO_SECTION_BACKGROUND_FILL_OPTIONS}
            imageUrl={hero.heroSectionBackgroundImageUrl}
            onImageUrlChange={(heroSectionBackgroundImageUrl) => onChange({ heroSectionBackgroundImageUrl })}
            imageSize={hero.heroSectionBackgroundImageSize}
            onImageSizeChange={(heroSectionBackgroundImageSize) => onChange({ heroSectionBackgroundImageSize })}
            imagePosition={hero.heroSectionBackgroundImagePosition}
            onImagePositionChange={(heroSectionBackgroundImagePosition) =>
              onChange({ heroSectionBackgroundImagePosition })
            }
          />

          <HeroBackgroundFillControls
            title="Right motif surface"
            description="Fill inside the dark geometric shape — solid color or gradient."
            fill={hero.heroMotifFill}
            onFillChange={(fill) => {
              if (fill === 'solid' || fill === 'gradient') onChange({ heroMotifFill: fill });
            }}
            solidColor={hero.motifColor}
            onSolidColorChange={(motifColor) => onChange({ motifColor })}
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

      {subSection === 'text' ? (
        <div className="space-y-6">
          <HeroToggleRow
            label="Show tools row"
            description="Display software icons under the hero pitch."
            checked={hero.showTools}
            onChange={(showTools) => onChange({ showTools })}
          />
          <HeroToggleRow
            label="Show contact button"
            description='Primary "Contact me" button in the hero.'
            checked={hero.showContactCta}
            onChange={(showContactCta) => onChange({ showContactCta })}
          />

          <HeroOptionGrid
            label="Headline font style"
            options={PORTFOLIO_HERO_HEADLINE_FONT_OPTIONS}
            value={hero.headlineFont}
            onChange={(headlineFont) => onChange({ headlineFont })}
            columns={3}
          />

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
              <PortfolioHeroCopyPositionEditor
                position={hero.heroCopyPosition}
                layoutFlipped={hero.heroLayoutFlipped}
                onChange={(heroCopyPosition) => onChange({ heroCopyPosition })}
              />
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
            options={PORTFOLIO_HERO_CTA_PLACEMENT_OPTIONS}
            value={hero.ctaPlacement}
            onChange={(ctaPlacement) => onChange({ ctaPlacement })}
            columns={3}
          />

          <HeroOptionGrid
            label="Availability badge design"
            options={PORTFOLIO_HERO_AVAILABILITY_DESIGN_OPTIONS}
            value={hero.availabilityDesign}
            onChange={(availabilityDesign) => onChange({ availabilityDesign })}
            columns={2}
          />

          <HeroOptionGrid
            label="Availability badge placement"
            options={PORTFOLIO_HERO_AVAILABILITY_PLACEMENT_OPTIONS}
            value={hero.availabilityPlacement}
            onChange={(availabilityPlacement) => onChange({ availabilityPlacement })}
            columns={3}
          />

          <HeroToggleRow
            label="Temps de réponse sur le badge"
            description="Affiche « · replies … » à côté de Available for work."
            checked={hero.showAvailabilityResponseTime}
            onChange={(showAvailabilityResponseTime) => onChange({ showAvailabilityResponseTime })}
          />

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
        </div>
      ) : null}

      {subSection === 'right-motif' ? (
        <div className="space-y-6">
      <HeroOptionGrid
        label="Motif height"
        options={PORTFOLIO_HERO_MOTIF_LAYOUT_OPTIONS}
        value={hero.motifLayout}
        onChange={(motifLayout) => {
          const { position, size } = getMotifPanelDefaultsForLayout(motifLayout);
          onChange({
            motifLayout,
            motifPosition: position,
            motifPanelSize: size,
          });
        }}
        columns={2}
      />

      <HeroOptionGrid
        label="Background motif shape"
        options={PORTFOLIO_HERO_MOTIF_OPTIONS}
        value={hero.motifShape}
        onChange={(motifShape) =>
          onChange({
            motifShape,
            ...(motifShape === 'custom' && hero.customMotifPoints.length < 3
              ? { customMotifPoints: DEFAULT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point })) }
              : {}),
          })
        }
        columns={3}
      />

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Right motif placement</p>
        <p className="mt-1 text-sm text-neutral-500">
          Move (orange center), resize (corners), or edit shape — works for presets and custom.
        </p>
        <div className="mt-3">
          <PortfolioHeroMotifCanvasEditor
            side="right"
            points={resolveMotifPoints(hero.motifShape, hero.customMotifPoints)}
            color={hero.motifColor}
            position={hero.motifPosition}
            size={hero.motifPanelSize}
            showTemplates={hero.motifShape === 'custom'}
            onChangePoints={(customMotifPoints) => onChange({ customMotifPoints, motifShape: 'custom' })}
            onChangeTransform={({ position, size }) =>
              onChange({
                ...(position ? { motifPosition: position } : {}),
                ...(size ? { motifPanelSize: size } : {}),
              })
            }
          />
        </div>
      </div>
        </div>
      ) : null}

      {subSection === 'left-motif' ? (
        <div className="space-y-5">
        <HeroToggleRow
          label="Enable left motif"
          description="Show a background pattern under the left content area."
          checked={hero.leftMotifEnabled}
          onChange={(leftMotifEnabled) => onChange({ leftMotifEnabled })}
        />

        {hero.leftMotifEnabled ? (
          <>
            <HeroOptionGrid
              label="Pattern"
              options={PORTFOLIO_HERO_LEFT_MOTIF_OPTIONS.filter((option) => option.value !== 'none')}
              value={hero.leftMotifPattern === 'none' ? 'dots' : hero.leftMotifPattern}
              onChange={(leftMotifPattern) =>
                onChange({
                  leftMotifPattern,
                  ...(leftMotifPattern === 'custom' && hero.leftCustomMotifPoints.length < 3
                    ? {
                        leftCustomMotifPoints: DEFAULT_LEFT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point })),
                      }
                    : {}),
                })
              }
              columns={2}
            />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Left motif placement</p>
              <p className="mt-1 text-sm text-neutral-500">
                Move (orange center), resize (corners), or edit shape — patterns and custom shapes.
              </p>
              <div className="mt-3">
                <PortfolioHeroMotifCanvasEditor
                  side="left"
                  points={
                    hero.leftMotifPattern === 'custom'
                      ? hero.leftCustomMotifPoints
                      : getMotifTemplatePoints('rectangle', 'left')
                  }
                  color={hero.leftMotifColor}
                  position={hero.leftMotifPosition}
                  size={hero.leftMotifSize}
                  showTemplates={hero.leftMotifPattern === 'custom'}
                  onChangePoints={(leftCustomMotifPoints) =>
                    onChange({ leftCustomMotifPoints, leftMotifPattern: 'custom' })
                  }
                  onChangeTransform={({ position, size }) =>
                    onChange({
                      ...(position ? { leftMotifPosition: position } : {}),
                      ...(size ? { leftMotifSize: size } : {}),
                    })
                  }
                />
              </div>
            </div>

            <HeroColorField
              label="Pattern color"
              value={hero.leftMotifColor}
              onChange={(leftMotifColor) => onChange({ leftMotifColor })}
            />

            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Opacity</p>
                <span className="text-sm font-semibold text-neutral-700">{hero.leftMotifOpacity}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={hero.leftMotifOpacity}
                onChange={(event) => onChange({ leftMotifOpacity: Number(event.target.value) })}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Left motif opacity"
              />
            </div>

          </>
        ) : null}
        </div>
      ) : null}

      {subSection === 'portrait' ? (
        <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Portrait placement</p>
          <p className="mt-1 text-sm text-neutral-500">
            Drag freely on the preview — same controls as the custom motif editor.
          </p>
          <div className="mt-3">
            <PortfolioHeroProfilePositionEditor
              position={hero.portraitPosition}
              motifColor={hero.motifColor}
              motifShape={hero.motifShape}
              customMotifPoints={hero.customMotifPoints}
              onChange={(portraitPosition) => onChange({ portraitPosition })}
            />
          </div>
        </div>

        <HeroToggleRow
          label="Show portrait frame"
          description="White border around the photo — disable for a frameless look."
          checked={hero.showPortraitFrame}
          onChange={(showPortraitFrame) => onChange({ showPortraitFrame })}
        />

        {hero.showPortraitFrame ? (
          <>
            <HeroColorField
              label="Frame color"
              value={hero.portraitFrameColor}
              onChange={(portraitFrameColor) => onChange({ portraitFrameColor })}
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
                      onClick={() =>
                        onChange({
                          portraitFrameWidth: option.value,
                          showPortraitFrame: option.value > 0,
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
            </div>
          </>
        ) : null}

        <HeroOptionGrid
          label="Portrait size"
          options={PORTFOLIO_HERO_PORTRAIT_SIZE_OPTIONS}
          value={hero.portraitSize}
          onChange={(portraitSize) => onChange({ portraitSize })}
          columns={3}
        />

        <HeroOptionGrid
          label="Portrait corners"
          options={PORTFOLIO_HERO_PORTRAIT_RADIUS_OPTIONS}
          value={hero.portraitRadius}
          onChange={(portraitRadius) => onChange({ portraitRadius })}
          columns={2}
        />

        <HeroToggleRow
          label="Show creator name"
          description="Display your name below the portrait on the motif panel."
          checked={hero.showCreatorName}
          onChange={(showCreatorName) => onChange({ showCreatorName })}
        />

        {hero.showCreatorName ? (
          <>
            <HeroColorField
              label="Creator name color"
              description="Pick a light color on dark motifs for readability."
              value={hero.creatorNameColor}
              onChange={(creatorNameColor) => onChange({ creatorNameColor })}
            />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Creator name size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PORTFOLIO_HERO_CREATOR_NAME_SIZE_OPTIONS.map((option) => {
                  const active = hero.creatorNameSize === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange({ creatorNameSize: option.value })}
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
              label="Creator name font style"
              options={PORTFOLIO_HERO_CREATOR_NAME_FONT_OPTIONS}
              value={hero.creatorNameFont}
              onChange={(creatorNameFont) => onChange({ creatorNameFont })}
              columns={3}
            />
          </>
        ) : null}
        </div>
      ) : null}

      {subSection === 'stats' ? (
        <div className="space-y-5">
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

        <HeroToggleRow
          label="Show frame"
          description="Disable for a frameless look — typography and icons only."
          checked={hero.showMetaFrame}
          onChange={(showMetaFrame) =>
            onChange({
              showMetaFrame,
              ...(showMetaFrame ? {} : { metaFrameBorderWidth: 0 }),
            })
          }
        />

        {hero.showMetaFrame ? (
          <>
            <HeroOptionGrid
              label="Frame shape"
              options={PORTFOLIO_HERO_META_FRAME_SHAPE_OPTIONS}
              value={hero.metaFrameShape}
              onChange={(metaFrameShape) => onChange({ metaFrameShape })}
              columns={2}
            />

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
              onChange={(metaDisplayDesign) => onChange({ metaDisplayDesign })}
              columns={2}
            />
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

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Value size</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PORTFOLIO_HERO_META_VALUE_SIZE_OPTIONS.map((option) => {
              const active = hero.metaValueSize === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ metaValueSize: option.value })}
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

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Card spacing</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PORTFOLIO_HERO_META_SPREAD_OPTIONS.map((option) => {
              const active = hero.metaSpread === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ metaSpread: option.value })}
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

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            {hero.metaPlacementMode === 'free' ? 'Free placement' : 'Row position (horizontal + edge offset)'}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {hero.metaPlacementMode === 'free'
              ? 'Drag the row anywhere on the hero panel.'
              : 'Adjust the horizontal center — cards stay straddling the motif bottom edge.'}
          </p>
          <div className="mt-3">
            <PortfolioHeroMetaPositionEditor
              position={hero.metaPosition}
              spread={hero.metaSpread}
              visibleCount={
                [hero.showYearsCard, hero.showProjectsCard, hero.showLocationCard].filter(Boolean).length
              }
              motifColor={hero.motifColor}
              motifShape={hero.motifShape}
              customMotifPoints={hero.customMotifPoints}
              onChange={(metaPosition) => onChange({ metaPosition })}
            />
          </div>
        </div>

        <HeroColorField
          label="Value color"
          description="Numbers and location text — 5+, 5, Madagascar / Fianarantsoa."
          value={hero.metaValueColor}
          onChange={(metaValueColor) => onChange({ metaValueColor })}
        />

        <HeroColorField
          label="Label color"
          description={'Captions such as "Years exp." and "Projects".'}
          value={hero.metaLabelColor}
          onChange={(metaLabelColor) => onChange({ metaLabelColor })}
        />

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
