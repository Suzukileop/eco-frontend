'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  PORTFOLIO_FLOATING_CHROME,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  PORTFOLIO_SETTINGS_SECTIONS,
  type PortfolioNavSettings,
  type PortfolioSettings,
  type PortfolioSettingsSectionId,
  type PortfolioSettingsSectionMeta,
} from '@/components/portfolio/portfolio-settings-types';
import {
  PORTFOLIO_NAV_ACTIVE_OPTIONS,
  PORTFOLIO_NAV_BAR_DESIGN_OPTIONS,
  PORTFOLIO_NAV_BAR_PADDING_OPTIONS,
  PORTFOLIO_NAV_BAR_THICKNESS_OPTIONS,
  PORTFOLIO_NAV_BAR_WIDTH_OPTIONS,
  PORTFOLIO_NAV_BUTTON_DESIGN_OPTIONS,
  PORTFOLIO_NAV_CONTENT_MODE_OPTIONS,
  PORTFOLIO_NAV_DISPLAY_OPTIONS,
  PORTFOLIO_NAV_EDGE_OFFSET_OPTIONS,
  PORTFOLIO_NAV_ITEM_GAP_OPTIONS,
  PORTFOLIO_NAV_LABEL_CASE_OPTIONS,
  PORTFOLIO_NAV_MODE_OPTIONS,
  PORTFOLIO_NAV_PLACEMENT_OPTIONS,
} from '@/components/portfolio/portfolio-nav-settings';
import { PortfolioNavIcon } from '@/components/portfolio/portfolio-nav-icons';
import {
  PORTFOLIO_NAV_ICON_OPTIONS,
  PORTFOLIO_NAV_LABEL_PRESETS,
  PORTFOLIO_NAV_SECTION_META,
  type PortfolioNavIconVariant,
  type PortfolioNavItemIcons,
  type PortfolioNavItemLabels,
  type PortfolioNavSectionKey,
} from '@/components/portfolio/portfolio-nav-items';
import { AboutSettingsPanel } from '@/components/portfolio/portfolio-about-settings-panel';
import { ExperienceSettingsPanel } from '@/components/portfolio/portfolio-experience-settings-panel';
import { HeroSettingsPanel } from '@/components/portfolio/portfolio-hero-settings-panel';
import { WorkSettingsPanel } from '@/components/portfolio/portfolio-work-settings-panel';
import { ServicesSettingsPanel } from '@/components/portfolio/portfolio-services-settings-panel';
import { FaqSettingsPanel } from '@/components/portfolio/portfolio-faq-settings-panel';
import { ContactSettingsPanel } from '@/components/portfolio/portfolio-contact-settings-panel';
import { FooterSettingsPanel } from '@/components/portfolio/portfolio-footer-settings-panel';
import { PORTFOLIO_THEMES, isCustomPortfolioThemeId, type PortfolioBuiltinThemeId, type PortfolioThemeId } from '@/components/portfolio/portfolio-themes';
import { customThemeToPickerTheme, customThemeHasPendingChanges, type PortfolioCustomTheme } from '@/components/portfolio/portfolio-custom-themes';
import {
  DEFAULT_GLOBAL_HIGHLIGHT_COLOR,
  DEFAULT_GLOBAL_SUBTITLE_COLOR,
  DEFAULT_GLOBAL_TITLE_COLOR,
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS,
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS,
  PORTFOLIO_GLOBAL_CONTENT_GUTTER_OPTIONS,
  PORTFOLIO_GLOBAL_CONTENT_WIDTH_OPTIONS,
  PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS,
  PORTFOLIO_GLOBAL_SECTION_TOP_SPACING_OPTIONS,
  PORTFOLIO_GLOBAL_SUBTITLE_SIZE_OPTIONS,
  PORTFOLIO_GLOBAL_TEXT_DECORATION_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_ALIGNMENT_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_CHROME_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_CHROME_PADDING_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_CHROME_RADIUS_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_ORIENTATION_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_SCROLL_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_SIZE_OPTIONS,
  PORTFOLIO_GLOBAL_TYPOGRAPHY_SCOPE_OPTIONS,
  moveSectionInOrder,
  type PortfolioGlobalSettings,
  type PortfolioGlobalSettingsPatch,
  type PortfolioGlobalSubtitleTypography,
  type PortfolioGlobalTitleOrientationTargets,
  type PortfolioGlobalTitleChrome,
  type PortfolioGlobalTitleTypography,
} from '@/components/portfolio/portfolio-global-settings';
import { resolvePortfolioContentSectionOrder } from '@/components/portfolio/portfolio-services-block-settings';
import type { PortfolioServicesSectionOrganization } from '@/components/portfolio/portfolio-services-settings';
import { PORTFOLIO_GLOBAL_MOTION_PROFILE_OPTIONS } from '@/components/portfolio/portfolio-motion-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { PortfolioBackgroundImageUpload } from '@/components/portfolio/portfolio-background-image-upload';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';

const MODAL_OPACITY_STORAGE_KEY = 'portfolio-settings-modal-opacity';

function readStoredModalOpacity(): number {
  if (typeof window === 'undefined') return 100;
  const stored = window.localStorage.getItem(MODAL_OPACITY_STORAGE_KEY);
  if (!stored) return 100;
  const value = Number(stored);
  if (!Number.isFinite(value)) return 100;
  return Math.min(100, Math.max(35, value));
}

function ModalPreviewTransparencyControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="hidden w-[min(100%,14rem)] shrink-0 sm:block">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">Preview transparency</p>
        <span className="text-xs font-semibold tabular-nums text-neutral-600">{value}%</span>
      </div>
      <input
        type="range"
        min={35}
        max={100}
        step={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer accent-neutral-900"
        aria-label="Settings panel transparency"
      />
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      />
    </svg>
  );
}

export function PortfolioSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto inline-flex h-11 w-11 items-center justify-center text-neutral-700 transition hover:text-neutral-950 ${PORTFOLIO_FLOATING_CHROME}`}
      aria-label="Portfolio settings"
    >
      <SettingsIcon className="h-5 w-5" />
    </button>
  );
}

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

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const className =
    'mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200';

  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
    </label>
  );
}

function GlobalColorField({
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

function GlobalHeaderTypographyBlock({
  label,
  typography,
  sizeOptions,
  defaultColor,
  defaultHighlightColor,
  onChange,
}: {
  label: string;
  typography: PortfolioGlobalTitleTypography | PortfolioGlobalSubtitleTypography;
  sizeOptions: { value: string; label: string; description: string }[];
  defaultColor: string;
  defaultHighlightColor: string;
  onChange: (
    next: PortfolioGlobalTitleTypography | PortfolioGlobalSubtitleTypography
  ) => void;
}) {
  type Typography = PortfolioGlobalTitleTypography | PortfolioGlobalSubtitleTypography;
  const patch = (partial: Partial<Typography>) =>
    onChange({ ...typography, ...partial } as Typography);

  const globalActive = typography.scope === 'global';

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <p className="mt-1 text-sm text-neutral-500">
          Color, size, font, underline, highlight, and emphasis for every section header.
        </p>
      </div>

      <OptionGrid
        label="Style source"
        options={PORTFOLIO_GLOBAL_TYPOGRAPHY_SCOPE_OPTIONS}
        value={typography.scope}
        onChange={(scope) => patch({ scope })}
        columns={2}
      />

      {globalActive ? (
        <>
          <OptionGrid
            label="Font"
            options={PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS}
            value={typography.font}
            onChange={(font) => patch({ font })}
            columns={3}
          />

          <OptionGrid
            label="Size"
            options={sizeOptions}
            value={typography.size}
            onChange={(size) => patch({ size: size as Typography['size'] })}
            columns={sizeOptions.length === 4 ? 2 : 3}
          />

          <GlobalColorField
            label="Text color"
            value={typography.color}
            onChange={(color) => patch({ color })}
          />

          <OptionGrid
            label="Decoration"
            options={PORTFOLIO_GLOBAL_TEXT_DECORATION_OPTIONS}
            value={typography.decoration}
            onChange={(decoration) => patch({ decoration })}
            columns={3}
          />

          {typography.decoration === 'highlight' ? (
            <GlobalColorField
              label="Highlight color"
              description="Marker-style background behind the text."
              value={typography.highlightColor}
              onChange={(highlightColor) => patch({ highlightColor })}
            />
          ) : null}

          <ToggleRow
            label="Italic"
            description="Apply italic styling to the text."
            checked={typography.italic}
            onChange={(italic) => patch({ italic })}
          />

          {typography.font !== 'display' ? (
            <ToggleRow
              label="Uppercase"
              description="Transform text to all caps."
              checked={typography.uppercase}
              onChange={(uppercase) => patch({ uppercase })}
            />
          ) : null}

          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">Preview</p>
            <p
              className={`mt-2 font-extrabold tracking-[-0.04em] ${
                typography.font === 'serif'
                  ? 'font-serif'
                  : typography.font === 'display'
                    ? 'font-sans uppercase tracking-[0.12em]'
                    : 'font-sans'
              } ${typography.italic ? 'italic' : ''} ${
                typography.uppercase && typography.font !== 'display' ? 'uppercase' : ''
              }`}
              style={{
                color: typography.color || defaultColor,
                fontSize:
                  typography.size === 'xl'
                    ? '2rem'
                    : typography.size === 'lg'
                      ? '1.5rem'
                      : typography.size === 'sm'
                        ? '0.875rem'
                        : '1.125rem',
              }}
            >
              <span
                style={
                  typography.decoration === 'underline'
                    ? {
                        textDecoration: 'underline',
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '0.18em',
                      }
                    : typography.decoration === 'highlight'
                      ? {
                          display: 'inline',
                          backgroundImage: `linear-gradient(transparent 58%, ${typography.highlightColor || defaultHighlightColor}8c 58%)`,
                          backgroundRepeat: 'no-repeat',
                          boxDecorationBreak: 'clone',
                          WebkitBoxDecorationBreak: 'clone',
                          padding: '0 0.08em',
                          margin: '0 -0.08em',
                        }
                      : undefined
                }
              >
                {label === 'Section titles' ? 'PROJECTS' : 'A selection of recent work.'}
              </span>
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

function GlobalTitleChromeBlock({
  chrome,
  onChange,
}: {
  chrome: PortfolioGlobalTitleChrome;
  onChange: (next: PortfolioGlobalTitleChrome) => void;
}) {
  const patch = (partial: Partial<PortfolioGlobalTitleChrome>) => onChange({ ...chrome, ...partial });
  const globalActive = chrome.scope === 'global';

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Section title box</p>
        <p className="mt-1 text-sm text-neutral-500">
          Background, border, and padding around section titles.
        </p>
      </div>

      <OptionGrid
        label="Style source"
        options={PORTFOLIO_GLOBAL_TYPOGRAPHY_SCOPE_OPTIONS}
        value={chrome.scope}
        onChange={(scope) => patch({ scope })}
        columns={2}
      />

      {globalActive ? (
        <>
          <ToggleRow
            label="Title background"
            description="Fill a solid color behind the title text."
            checked={chrome.backgroundEnabled}
            onChange={(backgroundEnabled) => patch({ backgroundEnabled })}
          />
          {chrome.backgroundEnabled ? (
            <GlobalColorField
              label="Background color"
              value={chrome.backgroundColor}
              onChange={(backgroundColor) => patch({ backgroundColor })}
            />
          ) : null}

          <ToggleRow
            label="Title border"
            description="Draw a stroke around the title box."
            checked={chrome.borderEnabled}
            onChange={(borderEnabled) => patch({ borderEnabled })}
          />
          {chrome.borderEnabled ? (
            <>
              <GlobalColorField
                label="Border color"
                value={chrome.borderColor}
                onChange={(borderColor) => patch({ borderColor })}
              />
              <OptionGrid
                label="Border width"
                options={PORTFOLIO_GLOBAL_TITLE_CHROME_BORDER_WIDTH_OPTIONS}
                value={chrome.borderWidth}
                onChange={(borderWidth) => patch({ borderWidth })}
                columns={2}
              />
            </>
          ) : null}

          <OptionGrid
            label="Title padding"
            options={PORTFOLIO_GLOBAL_TITLE_CHROME_PADDING_OPTIONS}
            value={chrome.padding}
            onChange={(padding) => patch({ padding })}
            columns={2}
          />

          <OptionGrid
            label="Corner radius"
            options={PORTFOLIO_GLOBAL_TITLE_CHROME_RADIUS_OPTIONS}
            value={chrome.borderRadius}
            onChange={(borderRadius) => patch({ borderRadius })}
            columns={3}
          />
        </>
      ) : null}
    </div>
  );
}

function GlobalOrientationTargets({
  targets,
  onChange,
}: {
  targets: PortfolioGlobalTitleOrientationTargets;
  onChange: (targets: PortfolioGlobalTitleOrientationTargets) => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
        Vertical title sections
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Choose which section titles use the vertical floating rail. Only selected sections are affected.
      </p>
      <div className="mt-4 space-y-2">
        {PORTFOLIO_NAV_SECTION_META.map((section) => {
          const checked = targets[section.key];
          return (
            <label
              key={section.key}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-neutral-200/80 bg-white px-4 py-3"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-neutral-900">{section.title}</span>
                <span className="mt-0.5 block text-xs text-neutral-500">{section.description}</span>
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  onChange({ ...targets, [section.key]: event.target.checked })
                }
                className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function GlobalSectionRevealBlock({
  motionProfile,
  onChange,
}: {
  motionProfile: PortfolioGlobalSettings['motionProfile'];
  onChange: (motionProfile: PortfolioGlobalSettings['motionProfile']) => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <OptionGrid
        label="Profil de motion"
        options={PORTFOLIO_GLOBAL_MOTION_PROFILE_OPTIONS}
        value={motionProfile}
        onChange={onChange}
        columns={2}
      />
      <p className="text-sm text-neutral-500">
        Les cartes et éléments apparaissent un par un au scroll. Le titre de section et la navigation sticky ne sont
        pas affectés — plus stable avec toutes vos personnalisations.
      </p>
    </div>
  );
}

function GlobalSectionOrderBlock({
  sectionOrder,
  servicesSectionOrganization,
  onChange,
}: {
  sectionOrder: PortfolioNavSectionKey[];
  servicesSectionOrganization: PortfolioServicesSectionOrganization;
  onChange: (sectionOrder: PortfolioNavSectionKey[]) => void;
}) {
  const orderedSections = resolvePortfolioContentSectionOrder(sectionOrder, servicesSectionOrganization);
  const sectionLabels = Object.fromEntries(
    PORTFOLIO_NAV_SECTION_META.map((section) => [section.key, section.title])
  ) as Record<PortfolioNavSectionKey, string>;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Section display order</p>
      <p className="mt-2 text-sm text-neutral-500">
        Hero stays at the top and Footer at the bottom. Reorder the content sections in between.
      </p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-200/70 text-neutral-500">
            <LockIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-neutral-700">Hero</span>
            <span className="mt-0.5 block text-xs text-neutral-500">Always first</span>
          </span>
        </div>

        {orderedSections.map((sectionKey, index) => {
          const label = sectionLabels[sectionKey] ?? sectionKey;
          const canMoveUp = index > 0;
          const canMoveDown = index < orderedSections.length - 1;

          return (
            <div
              key={sectionKey}
              className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white px-4 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold tabular-nums text-neutral-500">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-neutral-900">{label}</span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChange(moveSectionInOrder(orderedSections, sectionKey, 'up'))}
                  disabled={!canMoveUp}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={`Move ${label} up`}
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(moveSectionInOrder(orderedSections, sectionKey, 'down'))}
                  disabled={!canMoveDown}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={`Move ${label} down`}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-200/70 text-neutral-500">
            <LockIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-neutral-700">Footer</span>
            <span className="mt-0.5 block text-xs text-neutral-500">Always last</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 11V8a5 5 0 0110 0v3M6 11h12v10H6V11z"
      />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function GlobalSettingsPanel({
  themeId,
  customThemes,
  settings,
  global,
  servicesSectionOrganization,
  onThemeChange,
  onGlobalChange,
  onSaveCustomTheme,
  onRenameCustomTheme,
  onDuplicateTheme,
  onResetBuiltinTheme,
  onDeleteCustomTheme,
}: {
  themeId: PortfolioThemeId;
  customThemes: PortfolioCustomTheme[];
  settings: PortfolioSettings;
  global: PortfolioGlobalSettings;
  servicesSectionOrganization: PortfolioServicesSectionOrganization;
  onThemeChange: (themeId: PortfolioThemeId) => void;
  onGlobalChange: (patch: PortfolioGlobalSettingsPatch) => void;
  onSaveCustomTheme: (themeId: string, name?: string) => boolean;
  onRenameCustomTheme: (themeId: string, name: string) => boolean;
  onDuplicateTheme: (themeId: PortfolioThemeId) => void;
  onResetBuiltinTheme: (themeId: PortfolioBuiltinThemeId) => void;
  onDeleteCustomTheme: (themeId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Theme palette</p>
        <div className="mt-3">
          <ThemePickerPanel
            themeId={themeId}
            customThemes={customThemes}
            settings={settings}
            onChange={onThemeChange}
            onSaveCustomTheme={onSaveCustomTheme}
            onRenameCustomTheme={onRenameCustomTheme}
            onDuplicateTheme={onDuplicateTheme}
            onResetBuiltinTheme={onResetBuiltinTheme}
            onDeleteCustomTheme={onDeleteCustomTheme}
          />
        </div>
        <div className="mt-3 flex gap-3 rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white px-4 py-3.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
            <ThemeInfoIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900">Editorial Warm reste intact</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500">
              Seul Editorial Warm est verrouillé : toute personnalisation crée automatiquement une
              copie. Noir / Blanc se modifie directement. Les copies (ex. « Noir / Blanc copie »)
              restent indépendantes.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
        <ToggleRow
          label="Custom page background"
          description="Solid page color. When enabled, it replaces per-section background fills so the color shows through."
          checked={global.backgroundEnabled}
          onChange={(backgroundEnabled) => onGlobalChange({ backgroundEnabled })}
        />
        {global.backgroundEnabled ? (
          <GlobalColorField
            label="Background color"
            value={global.backgroundColor}
            onChange={(backgroundColor) => onGlobalChange({ backgroundColor })}
          />
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
        <ToggleRow
          label="Fixed background image"
          description="Viewport wallpaper behind the portfolio. Section backgrounds (color, gradient, or image) still work on top."
          checked={global.backgroundImageEnabled}
          onChange={(backgroundImageEnabled) => onGlobalChange({ backgroundImageEnabled })}
        />
        {global.backgroundImageEnabled ? (
          <>
            <PortfolioBackgroundImageUpload
              url={global.backgroundImageUrl}
              onChange={(backgroundImageUrl) => onGlobalChange({ backgroundImageUrl })}
            />

            <OptionGrid
              label="Image size"
              options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS}
              value={global.backgroundImageSize}
              onChange={(backgroundImageSize) => onGlobalChange({ backgroundImageSize })}
              columns={3}
            />

            <OptionGrid
              label="Image position"
              options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS}
              value={global.backgroundImagePosition}
              onChange={(backgroundImagePosition) => onGlobalChange({ backgroundImagePosition })}
              columns={3}
            />

            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Image opacity
                </p>
                <span className="text-xs font-semibold tabular-nums text-neutral-600">
                  {global.backgroundImageOpacity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={global.backgroundImageOpacity}
                onChange={(event) =>
                  onGlobalChange({ backgroundImageOpacity: Number(event.target.value) })
                }
                className="mt-2 h-1.5 w-full cursor-pointer accent-neutral-900"
                aria-label="Background image opacity"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Insets from edges
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Pull the image in from each side of the screen (px).
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(
                  [
                    ['Top', 'backgroundImageInsetTop', global.backgroundImageInsetTop],
                    ['Right', 'backgroundImageInsetRight', global.backgroundImageInsetRight],
                    ['Bottom', 'backgroundImageInsetBottom', global.backgroundImageInsetBottom],
                    ['Left', 'backgroundImageInsetLeft', global.backgroundImageInsetLeft],
                  ] as const
                ).map(([label, key, value]) => (
                  <label key={key} className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {label}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={240}
                      step={4}
                      value={value}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        onGlobalChange({
                          [key]: Number.isFinite(next)
                            ? Math.min(240, Math.max(0, Math.round(next)))
                            : 0,
                        });
                      }}
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm tabular-nums text-neutral-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </label>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <GlobalSectionOrderBlock
        sectionOrder={global.sectionOrder}
        servicesSectionOrganization={servicesSectionOrganization}
        onChange={(sectionOrder) => onGlobalChange({ sectionOrder })}
      />

      <OptionGrid
        label="Section titles alignment"
        options={PORTFOLIO_GLOBAL_TITLE_ALIGNMENT_OPTIONS}
        value={global.titleAlignment}
        onChange={(titleAlignment) => onGlobalChange({ titleAlignment })}
      />

      <OptionGrid
        label="Section title orientation"
        options={PORTFOLIO_GLOBAL_TITLE_ORIENTATION_OPTIONS}
        value={global.titleOrientation}
        onChange={(titleOrientation) => onGlobalChange({ titleOrientation })}
        columns={2}
      />

      {global.titleOrientation === 'vertical' ? (
        <GlobalOrientationTargets
          targets={global.titleOrientationTargets}
          onChange={(titleOrientationTargets) => onGlobalChange({ titleOrientationTargets })}
        />
      ) : null}

      <OptionGrid
        label="Section title scroll behavior"
        options={PORTFOLIO_GLOBAL_TITLE_SCROLL_OPTIONS}
        value={global.titleScroll}
        onChange={(titleScroll) => onGlobalChange({ titleScroll })}
      />

      <GlobalSectionRevealBlock
        motionProfile={global.motionProfile}
        onChange={(motionProfile) => onGlobalChange({ motionProfile })}
      />

      <OptionGrid
        label="Space above section titles"
        options={PORTFOLIO_GLOBAL_SECTION_TOP_SPACING_OPTIONS}
        value={global.sectionTitleTopSpacing}
        onChange={(sectionTitleTopSpacing) => onGlobalChange({ sectionTitleTopSpacing })}
        columns={2}
      />

      <OptionGrid
        label="Content width"
        options={PORTFOLIO_GLOBAL_CONTENT_WIDTH_OPTIONS}
        value={global.contentWidth}
        onChange={(contentWidth) => onGlobalChange({ contentWidth })}
        columns={3}
      />

      <OptionGrid
        label="Side margins"
        options={PORTFOLIO_GLOBAL_CONTENT_GUTTER_OPTIONS}
        value={global.contentGutter}
        onChange={(contentGutter) => onGlobalChange({ contentGutter })}
        columns={2}
      />

      <GlobalHeaderTypographyBlock
        label="Section titles"
        typography={global.titleTypography}
        sizeOptions={PORTFOLIO_GLOBAL_TITLE_SIZE_OPTIONS}
        defaultColor={DEFAULT_GLOBAL_TITLE_COLOR}
        defaultHighlightColor={DEFAULT_GLOBAL_HIGHLIGHT_COLOR}
        onChange={(titleTypography) => onGlobalChange({ titleTypography: titleTypography as PortfolioGlobalTitleTypography })}
      />

      <GlobalHeaderTypographyBlock
        label="Section subtitles"
        typography={global.subtitleTypography}
        sizeOptions={PORTFOLIO_GLOBAL_SUBTITLE_SIZE_OPTIONS}
        defaultColor={DEFAULT_GLOBAL_SUBTITLE_COLOR}
        defaultHighlightColor="#fef3c7"
        onChange={(subtitleTypography) =>
          onGlobalChange({ subtitleTypography: subtitleTypography as PortfolioGlobalSubtitleTypography })
        }
      />

      <GlobalTitleChromeBlock
        chrome={global.titleChrome}
        onChange={(titleChrome) => onGlobalChange({ titleChrome })}
      />
    </div>
  );
}

function ThemePickerPanel({
  themeId,
  customThemes,
  settings,
  onChange,
  onSaveCustomTheme,
  onRenameCustomTheme,
  onDuplicateTheme,
  onResetBuiltinTheme,
  onDeleteCustomTheme,
}: {
  themeId: PortfolioThemeId;
  customThemes: PortfolioCustomTheme[];
  settings: PortfolioSettings;
  onChange: (themeId: PortfolioThemeId) => void;
  onSaveCustomTheme: (themeId: string, name?: string) => boolean;
  onRenameCustomTheme: (themeId: string, name: string) => boolean;
  onDuplicateTheme: (themeId: PortfolioThemeId) => void;
  onResetBuiltinTheme: (themeId: PortfolioBuiltinThemeId) => void;
  onDeleteCustomTheme: (themeId: string) => void;
}) {
  const [nameEditor, setNameEditor] = useState<{
    id: string;
    mode: 'save' | 'rename';
    value: string;
  } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const builtin = PORTFOLIO_THEMES;
  const customs = customThemes.map(customThemeToPickerTheme);

  const openNameEditor = (id: string, mode: 'save' | 'rename', currentName: string) => {
    setPendingDeleteId(null);
    setNameEditor({ id, mode, value: currentName });
  };

  const closeNameEditor = () => setNameEditor(null);

  const commitNameEditor = () => {
    if (!nameEditor) return;
    const name = nameEditor.value.trim();
    if (!name) return;

    if (nameEditor.mode === 'save') {
      const changed = onSaveCustomTheme(nameEditor.id, name);
      if (changed) {
        pushFlashFeedback({
          variant: 'success',
          title: 'Thème enregistré',
          description: `« ${name} » a été sauvegardé avec toutes vos personnalisations.`,
          durationMs: 4500,
        });
      }
    } else {
      const changed = onRenameCustomTheme(nameEditor.id, name);
      if (changed) {
        pushFlashFeedback({
          variant: 'success',
          title: 'Thème renommé',
          description: `Le thème s’appelle maintenant « ${name} ».`,
          durationMs: 4000,
        });
      }
      // Same name → close quietly, no toast (nothing happened).
    }
    setNameEditor(null);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {builtin.map((theme) => {
        const active = theme.id === themeId;
        const badge = theme.id === 'editorial' ? 'Default' : 'Editable';
        return (
          <div
            key={theme.id}
            className={`rounded-2xl border p-4 text-left transition ${
              active
                ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
            }`}
          >
            <button type="button" onClick={() => onChange(theme.id)} className="w-full text-left">
              <div className="mb-4 flex gap-1.5">
                {theme.swatches.map((color) => (
                  <span
                    key={`${theme.id}-${color}`}
                    className="h-8 flex-1 rounded-lg border border-black/5"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                ))}
              </div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-neutral-950">{theme.label}</p>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                  {badge}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{theme.description}</p>
              {active ? (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Active</p>
              ) : null}
            </button>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-3">
              <ThemeActionButton
                label="Dupliquer"
                onClick={() => {
                  onDuplicateTheme(theme.id);
                  pushFlashFeedback({
                    variant: 'success',
                    title: 'Thème dupliqué',
                    description: `Une copie personnalisable a été créée à partir de « ${theme.label} ».`,
                    durationMs: 4000,
                  });
                }}
                icon={<ThemeCopyIcon className="h-3.5 w-3.5" />}
              />
              {theme.id === 'noir' ? (
                <ThemeActionButton
                  label="Réinitialiser"
                  onClick={() => {
                    onResetBuiltinTheme('noir');
                    pushFlashFeedback({
                      variant: 'success',
                      title: 'Noir / Blanc réinitialisé',
                      description: 'Le thème a été restauré à ses réglages d’usine.',
                      durationMs: 4000,
                    });
                  }}
                  icon={<ThemeResetIcon className="h-3.5 w-3.5" />}
                />
              ) : null}
            </div>
          </div>
        );
      })}

      {customs.map((theme) => {
        const active = theme.id === themeId;
        const source = customThemes.find((item) => item.id === theme.id);
        const editorOpen = nameEditor?.id === theme.id;
        const deletePending = pendingDeleteId === theme.id;
        const statusLabel = source?.saved
          ? active
            ? 'Actif · Enregistré'
            : 'Enregistré'
          : active
            ? 'Actif · Brouillon'
            : 'Brouillon';
        const hasPendingChanges = source
          ? customThemeHasPendingChanges(source, settings)
          : false;

        return (
          <div
            key={theme.id}
            className={`rounded-2xl border p-4 text-left transition ${
              active
                ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/15'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
            }`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (editorOpen || deletePending) return;
                onChange(theme.id);
              }}
              onKeyDown={(event) => {
                if (editorOpen || deletePending) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onChange(theme.id);
                }
              }}
              className="w-full cursor-pointer text-left"
            >
              <div className="mb-4 flex gap-1.5">
                {theme.swatches.map((color) => (
                  <span
                    key={`${theme.id}-${color}`}
                    className="h-8 flex-1 rounded-lg border border-black/5"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-neutral-950">{theme.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{theme.description}</p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
                {statusLabel}
              </p>
            </div>

            {editorOpen ? (
              <div
                className="mt-3 rounded-xl border border-neutral-200 bg-white p-2.5 shadow-sm"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  {nameEditor.mode === 'save' ? 'Nommer et enregistrer' : 'Renommer le thème'}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    value={nameEditor.value}
                    onChange={(event) =>
                      setNameEditor((prev) => (prev ? { ...prev, value: event.target.value } : prev))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitNameEditor();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        closeNameEditor();
                      }
                    }}
                    placeholder="Nom du thème"
                    className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-950 outline-none ring-orange-500/30 focus:border-orange-400 focus:ring-2"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={commitNameEditor}
                    disabled={!nameEditor.value.trim()}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-950 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Valider"
                    title="Valider"
                  >
                    <ThemeCheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeNameEditor}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50"
                    aria-label="Annuler"
                    title="Annuler"
                  >
                    <ThemeCloseIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : deletePending ? (
              <div
                className="mt-3 rounded-xl border border-red-200 bg-red-50/70 p-2.5"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="text-xs font-medium text-red-700">
                  Supprimer « {source?.name || theme.label} » ?
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const deletedName = source?.name || theme.label;
                      onDeleteCustomTheme(theme.id);
                      setPendingDeleteId(null);
                      pushFlashFeedback({
                        variant: 'info',
                        title: 'Thème supprimé',
                        description: `« ${deletedName} » a été retiré de votre palette.`,
                        durationMs: 4000,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-red-500"
                  >
                    <ThemeTrashIcon className="h-3.5 w-3.5" />
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(null)}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-600 transition hover:bg-neutral-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-3">
                {!source?.saved ? (
                  <ThemeActionButton
                    label="Enregistrer"
                    tone="primary"
                    onClick={() => openNameEditor(theme.id, 'save', source?.name || theme.label)}
                    icon={<ThemeSaveIcon className="h-3.5 w-3.5" />}
                  />
                ) : (
                  <ThemeActionButton
                    label={hasPendingChanges ? 'Mettre à jour' : 'À jour'}
                    disabled={!hasPendingChanges}
                    onClick={() => {
                      const changed = onSaveCustomTheme(theme.id);
                      if (!changed) return;
                      pushFlashFeedback({
                        variant: 'success',
                        title: 'Thème mis à jour',
                        description: `« ${source?.name || theme.label} » a été synchronisé avec vos réglages actuels.`,
                        durationMs: 4500,
                      });
                    }}
                    icon={<ThemeSaveIcon className="h-3.5 w-3.5" />}
                  />
                )}
                <ThemeActionButton
                  label="Renommer"
                  onClick={() => openNameEditor(theme.id, 'rename', source?.name || theme.label)}
                  icon={<ThemePencilIcon className="h-3.5 w-3.5" />}
                />
                <ThemeActionButton
                  label="Dupliquer"
                  onClick={() => {
                    onDuplicateTheme(theme.id);
                    pushFlashFeedback({
                      variant: 'success',
                      title: 'Thème dupliqué',
                      description: `Une copie de « ${source?.name || theme.label} » a été créée.`,
                      durationMs: 4000,
                    });
                  }}
                  icon={<ThemeCopyIcon className="h-3.5 w-3.5" />}
                />
                {isCustomPortfolioThemeId(theme.id) ? (
                  <ThemeActionButton
                    label="Supprimer"
                    tone="danger"
                    onClick={() => {
                      setNameEditor(null);
                      setPendingDeleteId(theme.id);
                    }}
                    icon={<ThemeTrashIcon className="h-3.5 w-3.5" />}
                  />
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ThemeActionButton({
  label,
  onClick,
  icon,
  tone = 'neutral',
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  tone?: 'neutral' | 'primary' | 'danger';
  disabled?: boolean;
}) {
  const toneClass =
    tone === 'primary'
      ? 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
      : tone === 'danger'
        ? 'border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:border-neutral-100 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:hover:bg-neutral-50 ${toneClass}`}
      title={disabled ? 'Aucune modification à enregistrer' : label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ThemeInfoIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function ThemeSaveIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h11l3 3v11H5V5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v5h7V5M8 19v-6h8v6" />
    </svg>
  );
}

function ThemePencilIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.5l3 3" />
    </svg>
  );
}

function ThemeCopyIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15V5a2 2 0 012-2h10" />
    </svg>
  );
}

function ThemeResetIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 0114.95-4.05M20 12a8 8 0 01-14.95 4.05" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5v5h5M20 19v-5h-5" />
    </svg>
  );
}

function ThemeTrashIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12" />
    </svg>
  );
}

function ThemeCheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
    </svg>
  );
}

function ThemeCloseIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
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

function NavItemCustomizer({
  sectionKey,
  title,
  description,
  label,
  icon,
  onLabelChange,
  onIconChange,
}: {
  sectionKey: PortfolioNavSectionKey;
  title: string;
  description: string;
  label: string;
  icon: PortfolioNavIconVariant;
  onLabelChange: (label: string) => void;
  onIconChange: (icon: PortfolioNavIconVariant) => void;
}) {
  const labelPresets = PORTFOLIO_NAV_LABEL_PRESETS[sectionKey];
  const iconOptions = PORTFOLIO_NAV_ICON_OPTIONS[sectionKey];

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-950">{title}</p>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-800 shadow-sm">
          <PortfolioNavIcon variant={icon} className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Display word</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {labelPresets.map((preset) => {
              const active = label === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onLabelChange(preset.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-neutral-950 text-white'
                      : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Icon</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {iconOptions.map((option) => {
              const active = icon === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onIconChange(option.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition ${
                    active
                      ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                  }`}
                >
                  <PortfolioNavIcon variant={option.value} className="h-5 w-5 text-neutral-800" />
                  <span className="text-[10px] font-semibold text-neutral-600">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationLabelsIconsPanel({
  itemLabels,
  itemIcons,
  onChange,
}: {
  itemLabels: PortfolioNavItemLabels;
  itemIcons: PortfolioNavItemIcons;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Menu labels & icons</p>
        <p className="mt-1 text-sm text-neutral-500">
          Pick an alternative word and icon for each navigation destination.
        </p>
      </div>
      {PORTFOLIO_NAV_SECTION_META.map((section) => (
        <NavItemCustomizer
          key={section.key}
          sectionKey={section.key}
          title={section.title}
          description={section.description}
          label={itemLabels[section.key]}
          icon={itemIcons[section.key]}
          onLabelChange={(label) =>
            onChange({ itemLabels: { ...itemLabels, [section.key]: label } })
          }
          onIconChange={(icon) =>
            onChange({ itemIcons: { ...itemIcons, [section.key]: icon } })
          }
        />
      ))}
    </div>
  );
}

function NavigationPanel({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const navMode = navigation.navMode ?? 'default';
  const usesFloatingNavChrome = navMode === 'default' || navMode === 'pages';

  return (
    <div className="space-y-6">
      <ToggleRow
        label="Show navigation"
        description="Menu that jumps between portfolio sections."
        checked={navigation.enabled}
        onChange={(enabled) => onChange({ enabled })}
      />

      <OptionGrid
        label="Navigation type"
        options={PORTFOLIO_NAV_MODE_OPTIONS}
        value={navMode}
        onChange={(nextMode) => onChange({ navMode: nextMode })}
        columns={3}
      />

      {navMode === 'pages' ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Pages mode shows one section at a time. Use the nav bar buttons to switch pages — there is no
          scrolling between sections. Bar design options below still apply.
        </p>
      ) : null}

      {navMode === 'per-page' ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Per page mode shows dots and previous / next controls to move one section at a time while
          scrolling. Labels below still apply.
        </p>
      ) : null}

      {usesFloatingNavChrome ? (
        <>
      <OptionGrid
        label="Placement"
        options={PORTFOLIO_NAV_PLACEMENT_OPTIONS}
        value={navigation.placement}
        onChange={(placement) => onChange({ placement })}
        columns={3}
      />

      <OptionGrid
        label="Bar width"
        options={PORTFOLIO_NAV_BAR_WIDTH_OPTIONS}
        value={navigation.barWidth}
        onChange={(barWidth) => onChange({ barWidth })}
        columns={2}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <OptionGrid
          label="Thickness"
          options={PORTFOLIO_NAV_BAR_THICKNESS_OPTIONS}
          value={navigation.barThickness}
          onChange={(barThickness) => onChange({ barThickness })}
          columns={2}
        />
        <OptionGrid
          label="Padding"
          options={PORTFOLIO_NAV_BAR_PADDING_OPTIONS}
          value={navigation.barPadding ?? 'md'}
          onChange={(barPadding) => onChange({ barPadding })}
          columns={2}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <OptionGrid
          label="Edge offset"
          options={PORTFOLIO_NAV_EDGE_OFFSET_OPTIONS}
          value={navigation.edgeOffset}
          onChange={(edgeOffset) => onChange({ edgeOffset })}
          columns={2}
        />
        <OptionGrid
          label="Item spacing"
          options={PORTFOLIO_NAV_ITEM_GAP_OPTIONS}
          value={navigation.itemGap}
          onChange={(itemGap) => onChange({ itemGap })}
          columns={3}
        />
      </div>

      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Left/right placement aligns the items inside the bar — bar width, spacing, and other options stay
        available. Full width spans edge-to-edge; use placement to shift the links left, center, or right.
      </p>

      {navigation.barDesign !== 'dock' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <GlobalColorField
            label="Background color"
            description="Fill color of the navigation bar."
            value={navigation.barBackgroundColor}
            onChange={(barBackgroundColor) => onChange({ barBackgroundColor })}
          />
          <GlobalColorField
            label="Border color"
            description="Outline color around the navigation bar."
            value={navigation.barBorderColor}
            onChange={(barBorderColor) => onChange({ barBorderColor })}
          />
        </div>
      ) : (
        <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
          Background and border colors apply to Classic pill and Editorial rail. Icon dock uses separate
          button chrome.
        </p>
      )}

      <OptionGrid
        label="Bar design"
        options={PORTFOLIO_NAV_BAR_DESIGN_OPTIONS}
        value={navigation.barDesign}
        onChange={(barDesign) => onChange({ barDesign })}
        columns={3}
      />

      <OptionGrid
        label="Button content"
        options={PORTFOLIO_NAV_CONTENT_MODE_OPTIONS}
        value={navigation.contentMode}
        onChange={(contentMode) => onChange({ contentMode })}
        columns={3}
      />

      <OptionGrid
        label="Button design"
        options={PORTFOLIO_NAV_BUTTON_DESIGN_OPTIONS}
        value={navigation.buttonDesign}
        onChange={(buttonDesign) => onChange({ buttonDesign })}
        columns={2}
      />

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Button colors</p>
        <p className="mt-1 text-sm text-neutral-500">
          Colors for inactive items. The active link keeps its own highlight style.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <GlobalColorField
            label="Icon color"
            description="Color of the navigation icons."
            value={navigation.itemIconColor ?? '#525252'}
            onChange={(itemIconColor) => onChange({ itemIconColor })}
          />
          <GlobalColorField
            label="Text color"
            description="Color of the navigation labels."
            value={navigation.itemTextColor ?? '#525252'}
            onChange={(itemTextColor) => onChange({ itemTextColor })}
          />
          <GlobalColorField
            label="Button background"
            description="Fill color behind each nav item."
            value={navigation.itemBackgroundColor ?? '#ffffff'}
            onChange={(itemBackgroundColor) => onChange({ itemBackgroundColor })}
          />
          <GlobalColorField
            label="Button border"
            description="Outline color around each nav item."
            value={navigation.itemBorderColor ?? '#e5e5e5'}
            onChange={(itemBorderColor) => onChange({ itemBorderColor })}
          />
        </div>
      </div>

      {navigation.barDesign === 'classic' ? (
        <OptionGrid
          label="Active link style"
          options={PORTFOLIO_NAV_ACTIVE_OPTIONS}
          value={navigation.activeStyle}
          onChange={(activeStyle) => onChange({ activeStyle })}
          columns={2}
        />
      ) : (
        <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
          Active state styling is built into the{' '}
          <strong className="font-semibold text-neutral-700">
            {navigation.barDesign === 'rail' ? 'Editorial rail' : 'Icon dock'}
          </strong>{' '}
          design.
        </p>
      )}

      <div className="space-y-3">
        <ToggleRow
          label="Glass effect"
          description="Frosted translucent background with backdrop blur on the container."
          checked={navigation.glassEffect}
          onChange={(glassEffect) => onChange({ glassEffect })}
        />
        <ToggleRow
          label="Compact on mobile"
          description="Smaller padding and text size on narrow screens."
          checked={navigation.compactOnMobile}
          onChange={(compactOnMobile) => onChange({ compactOnMobile })}
        />
      </div>
        </>
      ) : null}

      <NavigationLabelsIconsPanel
        itemLabels={navigation.itemLabels}
        itemIcons={navigation.itemIcons}
        onChange={onChange}
      />

      <OptionGrid
        label="Visibility"
        options={PORTFOLIO_NAV_DISPLAY_OPTIONS}
        value={navigation.displayMode}
        onChange={(displayMode) => onChange({ displayMode })}
        columns={3}
      />

      {(navigation.contentMode === 'text' ||
        navigation.contentMode === 'both' ||
        navMode === 'per-page' ||
        navMode === 'pages') ? (
        <OptionGrid
          label="Label casing"
          options={PORTFOLIO_NAV_LABEL_CASE_OPTIONS}
          value={navigation.labelCase}
          onChange={(labelCase) => onChange({ labelCase })}
          columns={3}
        />
      ) : null}

      <ToggleRow
        label="Hide when only one section"
        description="Do not show the menu if a single destination is available."
        checked={navigation.hideWhenSingle}
        onChange={(hideWhenSingle) => onChange({ hideWhenSingle })}
      />

      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Menu items are built automatically from visible sections. Reorder or rename them via each section&apos;s
        settings and Creator Studio content.
      </p>
    </div>
  );
}

function SectionPanel({
  section,
  settings,
  onChange,
  onThemeChange,
  onGlobalChange,
  onNavigationChange,
  onSaveCustomTheme,
  onRenameCustomTheme,
  onDuplicateTheme,
  onResetBuiltinTheme,
  onDeleteCustomTheme,
  availableTools,
}: {
  section: PortfolioSettingsSectionMeta;
  settings: PortfolioSettings;
  onChange: (sectionId: Exclude<PortfolioSettingsSectionId, 'theme' | 'navigation'>, patch: Partial<PortfolioSettings[Exclude<PortfolioSettingsSectionId, 'theme' | 'navigation'>]>) => void;
  onThemeChange: (themeId: PortfolioThemeId) => void;
  onGlobalChange: (patch: PortfolioGlobalSettingsPatch) => void;
  onNavigationChange: (patch: Partial<PortfolioNavSettings>) => void;
  onSaveCustomTheme: (themeId: string, name?: string) => boolean;
  onRenameCustomTheme: (themeId: string, name: string) => boolean;
  onDuplicateTheme: (themeId: PortfolioThemeId) => void;
  onResetBuiltinTheme: (themeId: PortfolioBuiltinThemeId) => void;
  onDeleteCustomTheme: (themeId: string) => void;
  availableTools: string[];
}) {
  const sectionId = section.id;

  if (sectionId === 'theme') {
    return (
      <GlobalSettingsPanel
        themeId={settings.themeId}
        customThemes={settings.customThemes}
        settings={settings}
        global={settings.global}
        servicesSectionOrganization={settings.services.sectionOrganization}
        onThemeChange={onThemeChange}
        onGlobalChange={onGlobalChange}
        onSaveCustomTheme={onSaveCustomTheme}
        onRenameCustomTheme={onRenameCustomTheme}
        onDuplicateTheme={onDuplicateTheme}
        onResetBuiltinTheme={onResetBuiltinTheme}
        onDeleteCustomTheme={onDeleteCustomTheme}
      />
    );
  }

  if (sectionId === 'navigation') {
    return <NavigationPanel navigation={settings.navigation} onChange={onNavigationChange} />;
  }

  if (sectionId === 'footer') {
    return <FooterSettingsPanel footer={settings.footer} onChange={(patch) => onChange('footer', patch)} />;
  }

  const copy = settings[sectionId];

  if (sectionId === 'hero') {
    return (
      <HeroSettingsPanel
        hero={settings.hero}
        availableTools={availableTools}
        onChange={(patch) => onChange('hero', patch)}
      />
    );
  }

  if (sectionId === 'work') {
    return <WorkSettingsPanel work={settings.work} onChange={(patch) => onChange('work', patch)} />;
  }

  if (sectionId === 'services') {
    return (
      <ServicesSettingsPanel services={settings.services} onChange={(patch) => onChange('services', patch)} />
    );
  }

  if (sectionId === 'about') {
    return <AboutSettingsPanel about={settings.about} onChange={(patch) => onChange('about', patch)} />;
  }

  if (sectionId === 'experience') {
    return (
      <ExperienceSettingsPanel
        experience={settings.experience}
        onChange={(patch) => onChange('experience', patch)}
      />
    );
  }

  if (sectionId === 'faq') {
    return <FaqSettingsPanel faq={settings.faq} onChange={(patch) => onChange('faq', patch)} />;
  }

  if (sectionId === 'contact') {
    return (
      <ContactSettingsPanel contact={settings.contact} onChange={(patch) => onChange('contact', patch)} />
    );
  }

  return (
    <div className="space-y-5">
      <ToggleRow
        label="Show section"
        description={`Display the ${section.label.toLowerCase()} block on your public portfolio.`}
        checked={copy.enabled}
        onChange={(enabled) => onChange(sectionId, { enabled })}
      />

      {'title' in copy ? (
        <TextField
          label="Section title"
          value={copy.title}
          onChange={(title) => onChange(sectionId, { title })}
          placeholder={section.label}
        />
      ) : null}

      {'subtitle' in copy ? (
        <TextField
          label="Section subtitle"
          value={copy.subtitle}
          onChange={(subtitle) => onChange(sectionId, { subtitle })}
          placeholder="Optional supporting line under the title"
          multiline
        />
      ) : null}

      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Content for this section is edited in Creator Studio → Information. These settings control visibility and
        presentation on the portfolio page.
      </p>
    </div>
  );
}

type PortfolioSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  settings: PortfolioSettings;
  onChange: (sectionId: Exclude<PortfolioSettingsSectionId, 'theme' | 'navigation'>, patch: Partial<PortfolioSettings[Exclude<PortfolioSettingsSectionId, 'theme' | 'navigation'>]>) => void;
  onThemeChange: (themeId: PortfolioThemeId) => void;
  onGlobalChange: (patch: PortfolioGlobalSettingsPatch) => void;
  onNavigationChange: (patch: Partial<PortfolioNavSettings>) => void;
  onSaveCustomTheme: (themeId: string, name?: string) => boolean;
  onRenameCustomTheme: (themeId: string, name: string) => boolean;
  onDuplicateTheme: (themeId: PortfolioThemeId) => void;
  onResetBuiltinTheme: (themeId: PortfolioBuiltinThemeId) => void;
  onDeleteCustomTheme: (themeId: string) => void;
  onReset: () => void;
  availableTools: string[];
};

export function PortfolioSettingsModal({
  open,
  onClose,
  settings,
  onChange,
  onThemeChange,
  onGlobalChange,
  onNavigationChange,
  onSaveCustomTheme,
  onRenameCustomTheme,
  onDuplicateTheme,
  onResetBuiltinTheme,
  onDeleteCustomTheme,
  onReset,
  availableTools,
}: PortfolioSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<PortfolioSettingsSectionId>('theme');
  const [panelOpacity, setPanelOpacity] = useState(100);

  useEffect(() => {
    setMounted(true);
    setPanelOpacity(readStoredModalOpacity());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(MODAL_OPACITY_STORAGE_KEY, String(panelOpacity));
  }, [mounted, panelOpacity]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, handleClose]);

  if (!open || !mounted) return null;

  const activeMeta =
    PORTFOLIO_SETTINGS_SECTIONS.find((section) => section.id === activeSection) ??
    PORTFOLIO_SETTINGS_SECTIONS[0];

  const previewMode = panelOpacity < 98;
  const backdropAlpha = previewMode ? 0.04 + (panelOpacity / 100) * 0.22 : 0.6;
  const backdropBlur = previewMode ? Math.max(2, Math.round((panelOpacity / 100) * 8)) : 4;
  const panelAlpha = panelOpacity / 100;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-sm transition-[background-color,backdrop-filter] duration-200"
        style={{
          backgroundColor: `rgba(10, 10, 10, ${backdropAlpha})`,
          backdropFilter: `blur(${backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${backdropBlur}px)`,
        }}
        aria-label="Close settings"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-settings-title"
        className="relative z-10 flex h-[min(82vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-neutral-200/80 shadow-2xl transition-[background-color,backdrop-filter] duration-200"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${panelAlpha})`,
          ...(previewMode
            ? {
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
              }
            : {}),
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200/80 px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id="portfolio-settings-title" className="text-xl font-extrabold tracking-tight text-neutral-950">
              Portfolio settings
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Customize each section from hero to footer. Changes sync to your account.
            </p>
            <div className="mt-3 sm:hidden">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">Preview transparency</p>
                <span className="text-xs font-semibold tabular-nums text-neutral-600">{panelOpacity}%</span>
              </div>
              <input
                type="range"
                min={35}
                max={100}
                step={5}
                value={panelOpacity}
                onChange={(event) => setPanelOpacity(Number(event.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer accent-neutral-900"
                aria-label="Settings panel transparency"
              />
            </div>
          </div>
          <ModalPreviewTransparencyControl value={panelOpacity} onChange={setPanelOpacity} />
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav
            className={`border-b border-neutral-200/80 p-3 lg:border-b-0 lg:border-r lg:overflow-y-auto ${
              previewMode ? 'bg-neutral-50/35' : 'bg-neutral-50/50'
            }`}
            aria-label="Portfolio sections"
          >
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
              {PORTFOLIO_SETTINGS_SECTIONS.map((section) => {
                const active = section.id === activeSection;
                return (
                  <li key={section.id} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? 'bg-white font-semibold text-neutral-950 shadow-sm ring-1 ring-neutral-200/80'
                          : 'font-medium text-neutral-600 hover:bg-white/70 hover:text-neutral-900'
                      }`}
                    >
                      {section.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            {activeSection !== 'hero' ? (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-neutral-950">{activeMeta.label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{activeMeta.description}</p>
              </div>
            ) : null}
            <SectionPanel
              section={activeMeta}
              settings={settings}
              onChange={onChange}
              onThemeChange={onThemeChange}
              onGlobalChange={onGlobalChange}
              onNavigationChange={onNavigationChange}
              onSaveCustomTheme={onSaveCustomTheme}
              onRenameCustomTheme={onRenameCustomTheme}
              onDuplicateTheme={onDuplicateTheme}
              onResetBuiltinTheme={onResetBuiltinTheme}
              onDeleteCustomTheme={onDeleteCustomTheme}
              availableTools={availableTools}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200/80 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-semibold text-neutral-500 transition hover:text-neutral-800"
          >
            Reset defaults
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
