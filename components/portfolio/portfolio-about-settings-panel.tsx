'use client';

import { useState } from 'react';
import {
  PORTFOLIO_ABOUT_FULL_WIDTH_PANEL_PLACEMENT_OPTIONS,
  PORTFOLIO_ABOUT_HEADER_FONT_OPTIONS,
  PORTFOLIO_ABOUT_LAYOUT_MODE_OPTIONS,
  PORTFOLIO_ABOUT_SIDE_PANEL_DESIGN_OPTIONS,
  PORTFOLIO_ABOUT_SIDE_PANEL_FULL_WIDTH_LAYOUT_OPTIONS,
  PORTFOLIO_ABOUT_STATS_DESIGN_OPTIONS,
  PORTFOLIO_ABOUT_STATS_GROUP_MODE_OPTIONS,
  PORTFOLIO_ABOUT_STATS_ICON_SIZE_OPTIONS,
  PORTFOLIO_ABOUT_STATS_LABEL_SIZE_OPTIONS,
  PORTFOLIO_ABOUT_STATS_LABEL_TRACKING_OPTIONS,
  PORTFOLIO_ABOUT_STATS_LABEL_WEIGHT_OPTIONS,
  PORTFOLIO_ABOUT_STATS_VALUE_SIZE_OPTIONS,
  PORTFOLIO_ABOUT_STATS_VALUE_WEIGHT_OPTIONS,
  PORTFOLIO_ABOUT_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_ABOUT_TITLE_PRESET_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_CONTENT_ALIGN_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_GAP_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_HEADING_PRESET_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_HEADING_SIZE_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_MEDIA_PLACEMENT_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_DESIGN_OPTIONS,
  PORTFOLIO_ABOUT_STYLE_TARGET_OPTIONS,
  patchAboutWhyMeFromCardFrame,
  aboutWhyMeToCardFrameSettings,
  aboutWhyMeCardDecorSettings,
  patchAboutSidePanelFromCardFrame,
  aboutSidePanelToCardFrameSettings,
  patchAboutElementStyle,
  type PortfolioAboutSectionSettings,
  type PortfolioAboutStyleTarget,
} from '@/components/portfolio/portfolio-about-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { PortfolioCardFrameSettingsFields } from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import {
  PORTFOLIO_SERVICES_CARD_DECOR_ALTERNATION_OPTIONS,
  PORTFOLIO_SERVICES_CARD_DECOR_SHAPE_OPTIONS,
  servicesCardDecorShellStyle,
} from '@/components/portfolio/portfolio-services-card-decor-settings';

type AboutSubSection =
  | 'general'
  | 'header'
  | 'layout'
  | 'frame'
  | 'statsStyle'
  | 'sidePanel'
  | 'whyMe'
  | 'style'
  | 'content'
  | 'background';

const ABOUT_SUB_SECTIONS: { id: AboutSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility and stats / sidebar toggles.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
  { id: 'layout', label: 'Layout', description: 'Sidebar position and block designs.' },
  { id: 'frame', label: 'Cadre stats', description: 'Bordure, fond X/Y, arrondi et padding des cartes stats.' },
  {
    id: 'statsStyle',
    label: 'Style stats',
    description: 'Couleurs, polices, tailles et graisse des chiffres, libellés et icônes.',
  },
  {
    id: 'sidePanel',
    label: 'Panneau profil',
    description: 'Cadre, fond X/Y et disposition pleine largeur du panneau sidebar.',
  },
  {
    id: 'whyMe',
    label: 'Why me',
    description: 'Designs, cadre, décor géométrique, média et titre Why work with me.',
  },
  {
    id: 'style',
    label: 'Style',
    description: 'Color, font, size, and weight for Why me text and side panel rows.',
  },
  { id: 'content', label: 'Content blocks', description: 'Show or hide each about subsection.' },
  { id: 'background', label: 'Background', description: 'Section fill, gradients, and opacity.' },
];

function AboutToggleRow({
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

function AboutOptionGrid<T extends string>({
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

function AboutColorField({
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

export function AboutSettingsPanel({
  about,
  onChange,
}: {
  about: PortfolioAboutSectionSettings;
  onChange: (patch: Partial<PortfolioAboutSectionSettings>) => void;
}) {
  const [subSection, setSubSection] = useState<AboutSubSection>('header');
  const [styleTarget, setStyleTarget] = useState<PortfolioAboutStyleTarget>('whyMeBody');
  const activeMeta = ABOUT_SUB_SECTIONS.find((section) => section.id === subSection) ?? ABOUT_SUB_SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">About subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as AboutSubSection)}
          className="min-w-[12rem] flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:max-w-xs"
        >
          {ABOUT_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-4">
          <AboutToggleRow
            label="Show section"
            description="Display the about block on your public portfolio."
            checked={about.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <AboutToggleRow
            label="Afficher la section stats"
            description="Masque ou affiche la rangée Years / Content / Languages / Rating."
            checked={about.showStats}
            onChange={(showStats) => onChange({ showStats })}
          />
          {about.showStats ? (
            <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Stats visibles</p>
              <AboutToggleRow label="Years" checked={about.showStatYears} onChange={(showStatYears) => onChange({ showStatYears })} />
              <AboutToggleRow label="Content" checked={about.showStatContent} onChange={(showStatContent) => onChange({ showStatContent })} />
              <AboutToggleRow label="Languages" checked={about.showStatLanguages} onChange={(showStatLanguages) => onChange({ showStatLanguages })} />
              <AboutToggleRow label="Rating" checked={about.showStatRating} onChange={(showStatRating) => onChange({ showStatRating })} />
            </div>
          ) : null}
          <AboutToggleRow
            label="Show profile sidebar"
            description="Location, languages, gender, and availability."
            checked={about.showSidePanel}
            onChange={(showSidePanel) => onChange({ showSidePanel })}
          />
          <AboutColorField
            label="Accent color"
            value={about.accentColor}
            onChange={(accentColor) => onChange({ accentColor })}
          />
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Content is edited in Creator Studio → Information. These settings control visibility and presentation.
          </p>
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <AboutOptionGrid
            label="Title preset"
            options={PORTFOLIO_ABOUT_TITLE_PRESET_OPTIONS}
            value={about.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
          />
          {about.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={about.titleCustom || about.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <AboutOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_ABOUT_SUBTITLE_PRESET_OPTIONS}
            value={about.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
          />
          {about.subtitlePreset === 'custom' || about.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Subtitle text</p>
              <textarea
                rows={3}
                value={about.subtitlePreset === 'custom' ? about.subtitleCustom || about.subtitle : about.subtitle}
                onChange={(event) =>
                  onChange(
                    about.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutOptionGrid
              label="Title font"
              options={PORTFOLIO_ABOUT_HEADER_FONT_OPTIONS}
              value={about.titleFont}
              onChange={(titleFont) => onChange({ titleFont })}
              columns={2}
            />
            <AboutOptionGrid
              label="Subtitle font"
              options={PORTFOLIO_ABOUT_HEADER_FONT_OPTIONS}
              value={about.subtitleFont}
              onChange={(subtitleFont) => onChange({ subtitleFont })}
              columns={2}
            />
          </div>

          <AboutToggleRow
            label="Serif subtitle"
            description="Use Playfair Display for the subtitle (editorial default)."
            checked={about.subtitleSerif}
            onChange={(subtitleSerif) => onChange({ subtitleSerif })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutColorField label="Title color" value={about.titleColor} onChange={(titleColor) => onChange({ titleColor })} />
            <AboutColorField
              label="Subtitle color"
              value={about.subtitleColor}
              onChange={(subtitleColor) => onChange({ subtitleColor })}
            />
          </div>

          <AboutOptionGrid
            label="Header alignment"
            options={[
              { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
              { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
            ]}
            value={about.headerAlignment}
            onChange={(headerAlignment) => onChange({ headerAlignment })}
          />
        </div>
      ) : null}

      {subSection === 'layout' ? (
        <div className="space-y-6">
          <AboutOptionGrid
            label="Page layout"
            options={PORTFOLIO_ABOUT_LAYOUT_MODE_OPTIONS}
            value={about.layoutMode}
            onChange={(layoutMode) => onChange({ layoutMode })}
          />
          {about.layoutMode === 'full-width' && about.showSidePanel ? (
            <AboutOptionGrid
              label="Position du panneau profil"
              options={PORTFOLIO_ABOUT_FULL_WIDTH_PANEL_PLACEMENT_OPTIONS}
              value={about.fullWidthPanelPlacement}
              onChange={(fullWidthPanelPlacement) => onChange({ fullWidthPanelPlacement })}
            />
          ) : null}
          <AboutOptionGrid
            label="Design des stats"
            options={PORTFOLIO_ABOUT_STATS_DESIGN_OPTIONS}
            value={about.statsDesign}
            onChange={(statsDesign) => onChange({ statsDesign })}
          />
          <AboutOptionGrid
            label="Sidebar design"
            options={PORTFOLIO_ABOUT_SIDE_PANEL_DESIGN_OPTIONS}
            value={about.sidePanelDesign}
            onChange={(sidePanelDesign) => onChange({ sidePanelDesign })}
          />
          {about.layoutMode === 'full-width' ? (
            <AboutOptionGrid
              label="Disposition pleine largeur"
              options={PORTFOLIO_ABOUT_SIDE_PANEL_FULL_WIDTH_LAYOUT_OPTIONS}
              value={about.sidePanelFullWidthLayout}
              onChange={(sidePanelFullWidthLayout) => onChange({ sidePanelFullWidthLayout })}
            />
          ) : null}
        </div>
      ) : null}

      {subSection === 'whyMe' ? (
        <div className="space-y-6">
          <AboutOptionGrid
            label="Design des blocs"
            options={PORTFOLIO_ABOUT_WHY_ME_DESIGN_OPTIONS}
            value={about.whyMeDesign}
            onChange={(whyMeDesign) => onChange({ whyMeDesign })}
          />

          <AboutOptionGrid
            label="Placement du média"
            options={PORTFOLIO_ABOUT_WHY_ME_MEDIA_PLACEMENT_OPTIONS}
            value={about.whyMeMediaPlacement}
            onChange={(whyMeMediaPlacement) => onChange({ whyMeMediaPlacement })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutOptionGrid
              label="Alignement du contenu"
              options={PORTFOLIO_ABOUT_WHY_ME_CONTENT_ALIGN_OPTIONS}
              value={about.whyMeContentAlign}
              onChange={(whyMeContentAlign) => onChange({ whyMeContentAlign })}
              columns={2}
            />
            <AboutOptionGrid
              label="Espacement entre blocs"
              options={PORTFOLIO_ABOUT_WHY_ME_GAP_OPTIONS}
              value={about.whyMeGap}
              onChange={(whyMeGap) => onChange({ whyMeGap })}
              columns={2}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Titre de section</p>
            <AboutToggleRow
              label="Afficher le titre"
              checked={about.showWhyMeHeading}
              onChange={(showWhyMeHeading) => onChange({ showWhyMeHeading })}
            />
            {about.showWhyMeHeading ? (
              <>
                <AboutOptionGrid
                  label="Preset du titre"
                  options={PORTFOLIO_ABOUT_WHY_ME_HEADING_PRESET_OPTIONS}
                  value={about.whyMeHeadingPreset}
                  onChange={(whyMeHeadingPreset) => onChange({ whyMeHeadingPreset })}
                />
                {about.whyMeHeadingPreset === 'default' || about.whyMeHeadingPreset === 'custom' ? (
                  <input
                    type="text"
                    value={
                      about.whyMeHeadingPreset === 'custom'
                        ? about.whyMeHeadingCustom || about.whyMeHeading
                        : about.whyMeHeading
                    }
                    onChange={(event) =>
                      onChange(
                        about.whyMeHeadingPreset === 'custom'
                          ? { whyMeHeadingCustom: event.target.value, whyMeHeading: event.target.value }
                          : { whyMeHeading: event.target.value }
                      )
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                  />
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <AboutOptionGrid
                    label="Alignement titre"
                    options={PORTFOLIO_ABOUT_WHY_ME_CONTENT_ALIGN_OPTIONS}
                    value={about.whyMeHeadingAlignment}
                    onChange={(whyMeHeadingAlignment) => onChange({ whyMeHeadingAlignment })}
                    columns={2}
                  />
                  <AboutOptionGrid
                    label="Taille titre"
                    options={PORTFOLIO_ABOUT_WHY_ME_HEADING_SIZE_OPTIONS.map((option) => ({
                      ...option,
                      description: '',
                    }))}
                    value={about.whyMeHeadingSize}
                    onChange={(whyMeHeadingSize) => onChange({ whyMeHeadingSize })}
                    columns={3}
                  />
                </div>
                <AboutOptionGrid
                  label="Police du titre"
                  options={PORTFOLIO_ABOUT_HEADER_FONT_OPTIONS}
                  value={about.whyMeHeadingFont}
                  onChange={(whyMeHeadingFont) => onChange({ whyMeHeadingFont })}
                  columns={2}
                />
                <AboutColorField
                  label="Couleur du titre"
                  value={about.whyMeHeadingColor}
                  onChange={(whyMeHeadingColor) => onChange({ whyMeHeadingColor })}
                />
                <AboutToggleRow
                  label="Titre en majuscules"
                  checked={about.whyMeHeadingUppercase}
                  onChange={(whyMeHeadingUppercase) => onChange({ whyMeHeadingUppercase })}
                />
              </>
            ) : null}
          </div>

          <PortfolioCardFrameSettingsFields
            settings={aboutWhyMeToCardFrameSettings(about)}
            onChange={(patch) => onChange(patchAboutWhyMeFromCardFrame(patch))}
            heading="Cadre des blocs"
            description="Bordure, fond uni ou divisé X/Y, arrondi et padding pour chaque bloc Why me."
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Décor géométrique</p>
              <p className="mt-1 text-sm text-neutral-500">
                Teinte ou forme placée librement dans le cadre — redimensionnable, avec séquence
                d’apparition optionnelle.
              </p>
            </div>

            <AboutToggleRow
              label="Activer le décor"
              description="Affiche une forme ou teinte décorative derrière le contenu du bloc."
              checked={about.whyMeDecorEnabled}
              onChange={(whyMeDecorEnabled) => onChange({ whyMeDecorEnabled })}
            />

            {about.whyMeDecorEnabled ? (
              <>
                <AboutOptionGrid
                  label="Forme"
                  options={PORTFOLIO_SERVICES_CARD_DECOR_SHAPE_OPTIONS}
                  value={about.whyMeDecorShape}
                  onChange={(whyMeDecorShape) => onChange({ whyMeDecorShape })}
                  columns={2}
                />

                <AboutColorField
                  label="Couleur / teinte"
                  value={about.whyMeDecorColor}
                  onChange={(whyMeDecorColor) => onChange({ whyMeDecorColor })}
                />

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Opacité
                    </p>
                    <span className="text-xs font-semibold text-neutral-600">
                      {about.whyMeDecorOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={1}
                    value={about.whyMeDecorOpacity}
                    onChange={(event) => onChange({ whyMeDecorOpacity: Number(event.target.value) })}
                    className="w-full accent-neutral-900"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Taille
                    </p>
                    <span className="text-xs font-semibold text-neutral-600">
                      {about.whyMeDecorSize}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={160}
                    step={1}
                    value={about.whyMeDecorSize}
                    onChange={(event) => onChange({ whyMeDecorSize: Number(event.target.value) })}
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
                        {about.whyMeDecorX}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={about.whyMeDecorX}
                      onChange={(event) => onChange({ whyMeDecorX: Number(event.target.value) })}
                      className="w-full accent-neutral-900"
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Position Y
                      </p>
                      <span className="text-xs font-semibold text-neutral-600">
                        {about.whyMeDecorY}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={about.whyMeDecorY}
                      onChange={(event) => onChange({ whyMeDecorY: Number(event.target.value) })}
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
                      {about.whyMeDecorRotation}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={about.whyMeDecorRotation}
                    onChange={(event) => onChange({ whyMeDecorRotation: Number(event.target.value) })}
                    className="w-full accent-neutral-900"
                  />
                </div>

                <AboutOptionGrid
                  label="Séquence d’alternance"
                  options={PORTFOLIO_SERVICES_CARD_DECOR_ALTERNATION_OPTIONS}
                  value={about.whyMeDecorAlternation}
                  onChange={(whyMeDecorAlternation) => onChange({ whyMeDecorAlternation })}
                  columns={2}
                />

                <div className="relative h-28 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <div
                    className="absolute inset-0"
                    style={servicesCardDecorShellStyle(aboutWhyMeCardDecorSettings(about))}
                    aria-hidden
                  />
                  <p className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    Aperçu position
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {subSection === 'frame' ? (
        <div className="space-y-6">
          <p className="text-sm text-neutral-500">
            Cadre et fond des cartes stats — bande unifiée, stat en vedette ou liste éditoriale.
          </p>

          {about.statsDesign === 'unified-band' ? (
            <AboutOptionGrid
              label="Disposition des stats"
              options={PORTFOLIO_ABOUT_STATS_GROUP_MODE_OPTIONS}
              value={about.statsGroupMode}
              onChange={(statsGroupMode) => onChange({ statsGroupMode })}
            />
          ) : null}

          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Espacement entre les cadres
              </p>
              <span className="text-sm font-semibold text-neutral-700">{about.statsGap}px</span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Marge entre chaque cadre stat — horizontal et vertical.
            </p>
            <input
              type="range"
              min={0}
              max={48}
              step={2}
              value={about.statsGap}
              onChange={(event) => onChange({ statsGap: Number(event.target.value) })}
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="Espacement entre les cadres stats"
            />
          </div>

          <PortfolioCardFrameSettingsFields
            settings={about}
            onChange={onChange}
            heading="Cadre des stats"
            description="Bordure, fond uni ou divisé X/Y, arrondi et padding pour chaque carte stat."
          />
        </div>
      ) : null}

      {subSection === 'statsStyle' ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <AboutColorField
              label="Couleur des chiffres"
              value={about.statsValueColor}
              onChange={(statsValueColor) => onChange({ statsValueColor })}
            />
            <AboutColorField
              label="Couleur des libellés"
              value={about.statsLabelColor}
              onChange={(statsLabelColor) => onChange({ statsLabelColor })}
            />
            <AboutColorField
              label="Couleur des icônes"
              value={about.statsIconColor}
              onChange={(statsIconColor) => onChange({ statsIconColor })}
            />
          </div>

          <AboutToggleRow
            label="Accent sur le rating"
            description="Colorer la note / rating avec la couleur accent de la section."
            checked={about.statsUseAccentForRating}
            onChange={(statsUseAccentForRating) => onChange({ statsUseAccentForRating })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutOptionGrid
              label="Police des chiffres"
              options={PORTFOLIO_ABOUT_HEADER_FONT_OPTIONS}
              value={about.statsValueFont}
              onChange={(statsValueFont) => onChange({ statsValueFont })}
              columns={2}
            />
            <AboutOptionGrid
              label="Police des libellés"
              options={PORTFOLIO_ABOUT_HEADER_FONT_OPTIONS}
              value={about.statsLabelFont}
              onChange={(statsLabelFont) => onChange({ statsLabelFont })}
              columns={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutOptionGrid
              label="Taille des chiffres"
              options={PORTFOLIO_ABOUT_STATS_VALUE_SIZE_OPTIONS}
              value={about.statsValueSize}
              onChange={(statsValueSize) => onChange({ statsValueSize })}
              columns={2}
            />
            <AboutOptionGrid
              label="Taille des libellés"
              options={PORTFOLIO_ABOUT_STATS_LABEL_SIZE_OPTIONS}
              value={about.statsLabelSize}
              onChange={(statsLabelSize) => onChange({ statsLabelSize })}
              columns={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutOptionGrid
              label="Graisse des chiffres"
              options={PORTFOLIO_ABOUT_STATS_VALUE_WEIGHT_OPTIONS.map((option) => ({
                ...option,
                description: '',
              }))}
              value={about.statsValueWeight}
              onChange={(statsValueWeight) => onChange({ statsValueWeight })}
              columns={2}
            />
            <AboutOptionGrid
              label="Graisse des libellés"
              options={PORTFOLIO_ABOUT_STATS_LABEL_WEIGHT_OPTIONS.map((option) => ({
                ...option,
                description: '',
              }))}
              value={about.statsLabelWeight}
              onChange={(statsLabelWeight) => onChange({ statsLabelWeight })}
              columns={2}
            />
          </div>

          <AboutOptionGrid
            label="Espacement des libellés"
            options={PORTFOLIO_ABOUT_STATS_LABEL_TRACKING_OPTIONS}
            value={about.statsLabelTracking}
            onChange={(statsLabelTracking) => onChange({ statsLabelTracking })}
            columns={2}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutToggleRow
              label="Centrage automatique"
              description="Centre les chiffres quand la rangée est incomplète."
              checked={about.statsAutoCenter}
              onChange={(statsAutoCenter) => onChange({ statsAutoCenter })}
            />
            <AboutToggleRow
              label="Libellés en majuscules"
              description="YEARS, CONTENT… — désactiver pour un style phrase."
              checked={about.statsLabelUppercase}
              onChange={(statsLabelUppercase) => onChange({ statsLabelUppercase })}
            />
          </div>
          <AboutOptionGrid
            label="Taille des icônes"
            options={PORTFOLIO_ABOUT_STATS_ICON_SIZE_OPTIONS.map((option) => ({
              ...option,
              description: '',
            }))}
            value={about.statsIconSize}
            onChange={(statsIconSize) => onChange({ statsIconSize })}
            columns={3}
          />
        </div>
      ) : null}

      {subSection === 'sidePanel' ? (
        <div className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Infos visibles</p>
            <AboutToggleRow
              label="Location"
              checked={about.showSidePanelLocation}
              onChange={(showSidePanelLocation) => onChange({ showSidePanelLocation })}
            />
            <AboutToggleRow
              label="Languages"
              checked={about.showSidePanelLanguages}
              onChange={(showSidePanelLanguages) => onChange({ showSidePanelLanguages })}
            />
            <AboutToggleRow
              label="Gender"
              checked={about.showSidePanelGender}
              onChange={(showSidePanelGender) => onChange({ showSidePanelGender })}
            />
            <AboutToggleRow
              label="Member since"
              checked={about.showSidePanelMemberSince}
              onChange={(showSidePanelMemberSince) => onChange({ showSidePanelMemberSince })}
            />
            <AboutToggleRow
              label="Availability"
              checked={about.showSidePanelAvailability}
              onChange={(showSidePanelAvailability) => onChange({ showSidePanelAvailability })}
            />
            <AboutToggleRow
              label="Temps de réponse"
              description="Ligne « Reply… » sous la disponibilité."
              checked={about.showSidePanelResponseTime}
              onChange={(showSidePanelResponseTime) => onChange({ showSidePanelResponseTime })}
            />
          </div>

          <AboutToggleRow
            label="Centrage automatique des cadres"
            description="Centre le panneau ou les cartes quand la grille est incomplète."
            checked={about.sidePanelAutoCenter}
            onChange={(sidePanelAutoCenter) => onChange({ sidePanelAutoCenter })}
          />

          <p className="text-sm text-neutral-500">
            Cadre et fond du panneau profil (location, langues, disponibilité…). En pleine largeur, combinez avec
            une disposition ergonomique dans Layout.
          </p>
          <PortfolioCardFrameSettingsFields
            settings={aboutSidePanelToCardFrameSettings(about)}
            onChange={(patch) => onChange(patchAboutSidePanelFromCardFrame(patch))}
            heading="Cadre du panneau profil"
            description="Bordure, fond uni ou divisé X/Y, arrondi et padding — même logique que les stats."
          />
        </div>
      ) : null}

      {subSection === 'style' ? (
        <PortfolioElementStyleFields
          targets={PORTFOLIO_ABOUT_STYLE_TARGET_OPTIONS}
          activeTarget={styleTarget}
          onTargetChange={(value) => setStyleTarget(value as PortfolioAboutStyleTarget)}
          style={about.elementStyles[styleTarget]}
          onStyleChange={(patch) =>
            onChange({ elementStyles: patchAboutElementStyle(about.elementStyles, styleTarget, patch) })
          }
        />
      ) : null}

      {subSection === 'content' ? (
        <div className="space-y-4">
          <AboutToggleRow label="Why work with me" checked={about.showWhyMe} onChange={(showWhyMe) => onChange({ showWhyMe })} />
        </div>
      ) : null}

      {subSection === 'background' ? (
        <SectionBackgroundSettingsFields settings={about} onChange={onChange} />
      ) : null}
    </div>
  );
}
