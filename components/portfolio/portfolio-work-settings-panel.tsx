'use client';

import { useState } from 'react';
import {
  PORTFOLIO_WORK_CARD_BORDER_OPTIONS,
  PORTFOLIO_WORK_CARD_CONTENT_ALIGNMENT_OPTIONS,
  PORTFOLIO_WORK_CARD_DESIGN_OPTIONS,
  PORTFOLIO_WORK_CARD_GAP_OPTIONS,
  PORTFOLIO_WORK_CARD_PADDING_OPTIONS,
  PORTFOLIO_WORK_CARD_RADIUS_OPTIONS,
  PORTFOLIO_WORK_CATEGORY_DESIGN_OPTIONS,
  PORTFOLIO_WORK_CATEGORY_MODE_OPTIONS,
  PORTFOLIO_WORK_CONTENT_PLACEMENT_OPTIONS,
  PORTFOLIO_WORK_CTA_ALIGNMENT_OPTIONS,
  PORTFOLIO_WORK_CTA_DESIGN_OPTIONS,
  PORTFOLIO_WORK_GALLERY_LAYOUT_OPTIONS,
  PORTFOLIO_WORK_HEADER_FONT_OPTIONS,
  PORTFOLIO_WORK_ITEMS_PER_ROW_OPTIONS,
  PORTFOLIO_WORK_STYLE_TARGET_OPTIONS,
  PORTFOLIO_WORK_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_WORK_TITLE_PRESET_OPTIONS,
  PORTFOLIO_WORK_TOOLS_DISPLAY_OPTIONS,
  normalizeWorkElementStyles,
  patchWorkElementStyle,
  type PortfolioWorkItemsPerRow,
  type PortfolioWorkSectionSettings,
  type PortfolioWorkStyleTarget,
  workCardIsStacked,
  workGallerySupportsItemsPerRow,
  workItemsPerRowResponsiveHint,
} from '@/components/portfolio/portfolio-work-settings';
import { PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS } from '@/components/portfolio/portfolio-element-text-style';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';

export type WorkSettingsSubSection =
  | 'general'
  | 'header'
  | 'categories'
  | 'cards'
  | 'style'
  | 'cta'
  | 'background';

const WORK_SETTINGS_SUB_SECTIONS: {
  id: WorkSettingsSubSection;
  label: string;
  description: string;
}[] = [
  { id: 'general', label: 'General', description: 'Section visibility and marketplace link.' },
  { id: 'header', label: 'Header', description: 'Title and subtitle presets, fonts, and colors.' },
  {
    id: 'categories',
    label: 'Categories',
    description: 'Filter and group projects by content category.',
  },
  { id: 'cards', label: 'Cards', description: 'Layout, design, placement, and element visibility.' },
  {
    id: 'style',
    label: 'Style',
    description: 'Color, font, size, and weight for every card text element.',
  },
  { id: 'cta', label: 'CTA & tools', description: 'View project button and tool logos display.' },
  { id: 'background', label: 'Background', description: 'Section fill, gradients, and opacity.' },
];

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

function WorkColorField({
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

export function WorkSettingsPanel({
  work,
  onChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
}) {
  const [subSection, setSubSection] = useState<WorkSettingsSubSection>('header');
  const [styleTarget, setStyleTarget] = useState<PortfolioWorkStyleTarget>('cardTitle');
  const activeMeta =
    WORK_SETTINGS_SUB_SECTIONS.find((section) => section.id === subSection) ?? WORK_SETTINGS_SUB_SECTIONS[0];
  const elementStyles = normalizeWorkElementStyles(work.elementStyles);

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
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Project content is edited in Creator Studio → Information. These settings control visibility and
            presentation on the portfolio page.
          </p>
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
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
            <WorkColorField label="Title color" value={work.titleColor} onChange={(titleColor) => onChange({ titleColor })} />
            <WorkColorField
              label="Subtitle color"
              value={work.subtitleColor}
              onChange={(subtitleColor) => onChange({ subtitleColor })}
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
                  label="Active category"
                  value={work.categoryActiveColor}
                  onChange={(categoryActiveColor) => onChange({ categoryActiveColor })}
                />
                <WorkColorField
                  label="Muted category"
                  value={work.categoryMutedColor}
                  onChange={(categoryMutedColor) => onChange({ categoryMutedColor })}
                />
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'cards' ? (
        <div className="space-y-6">
          <WorkOptionGrid
            label="Disposition de la galerie"
            options={PORTFOLIO_WORK_GALLERY_LAYOUT_OPTIONS}
            value={work.galleryLayout}
            onChange={(galleryLayout) => onChange({ galleryLayout })}
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
            label="Alignement du contenu"
            options={PORTFOLIO_WORK_CARD_CONTENT_ALIGNMENT_OPTIONS}
            value={work.cardContentAlignment}
            onChange={(cardContentAlignment) => onChange({ cardContentAlignment })}
            columns={3}
          />

          {work.galleryLayout === 'stack' ? (
            <WorkOptionGrid
              label="Content placement"
              options={PORTFOLIO_WORK_CONTENT_PLACEMENT_OPTIONS}
              value={work.contentPlacement}
              onChange={(contentPlacement) => onChange({ contentPlacement })}
              columns={3}
            />
          ) : null}

          {work.galleryLayout === 'stack' ? (
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  {workCardIsStacked(work.cardDesign, work.contentPlacement)
                    ? 'Hauteur du média'
                    : 'Largeur du média'}
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
                {workCardIsStacked(work.cardDesign, work.contentPlacement)
                  ? 'Ajuste la hauteur de l’image par rapport au contenu texte.'
                  : 'Redimensionne l’aperçu média par rapport à la colonne texte sur desktop.'}
              </p>
            </div>
          ) : null}

          {work.galleryLayout === 'stack' ? (
            <WorkOptionGrid
              label="Card design"
              options={PORTFOLIO_WORK_CARD_DESIGN_OPTIONS}
              value={work.cardDesign}
              onChange={(cardDesign) => onChange({ cardDesign })}
              columns={2}
            />
          ) : null}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Cadre & espacement</p>
              <p className="mt-1 text-sm text-neutral-500">
                Bordure, couleur, arrondi, marge intérieure et espace entre les projets.
              </p>
            </div>

            <WorkOptionGrid
              label="Card border"
              options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
              value={work.cardBorder}
              onChange={(cardBorder) => onChange({ cardBorder })}
              columns={2}
            />

            {work.cardBorder === 'soft' || work.cardBorder === 'solid' ? (
              <WorkColorField
                label="Border color"
                value={work.cardBorderColor}
                onChange={(cardBorderColor) => onChange({ cardBorderColor })}
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
                label="Couleur de fond"
                value={work.cardBackgroundColor}
                onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
              />
            ) : null}

            <WorkOptionGrid
              label="Corner radius"
              options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
              value={work.cardBorderRadius}
              onChange={(cardBorderRadius) => onChange({ cardBorderRadius })}
              columns={3}
            />

            <WorkOptionGrid
              label="Card padding"
              options={PORTFOLIO_WORK_CARD_PADDING_OPTIONS}
              value={work.cardPadding}
              onChange={(cardPadding) => onChange({ cardPadding })}
              columns={2}
            />

            <WorkOptionGrid
              label="Space between projects"
              options={PORTFOLIO_WORK_CARD_GAP_OPTIONS}
              value={work.cardGap}
              onChange={(cardGap) => onChange({ cardGap })}
              columns={2}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Visible elements</p>
            <p className="text-sm text-neutral-500">Choose which parts appear on each project card.</p>
            <div className="space-y-2">
              <WorkToggleRow
                label="Project title"
                checked={work.showCardTitle}
                onChange={(showCardTitle) => onChange({ showCardTitle })}
              />
              <WorkToggleRow
                label="Description"
                checked={work.showCardDescription}
                onChange={(showCardDescription) => onChange({ showCardDescription })}
              />
              <WorkToggleRow
                label="Tools block"
                checked={work.showCardTools}
                onChange={(showCardTools) => onChange({ showCardTools })}
              />
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
            </div>
          </div>
        </div>
      ) : null}

      {subSection === 'style' ? (
        <PortfolioElementStyleFields
          targets={PORTFOLIO_WORK_STYLE_TARGET_OPTIONS}
          activeTarget={styleTarget}
          onTargetChange={(value) => setStyleTarget(value as PortfolioWorkStyleTarget)}
          style={elementStyles[styleTarget]}
          onStyleChange={(patch) =>
            onChange({ elementStyles: patchWorkElementStyle(elementStyles, styleTarget, patch) })
          }
          extra={
            styleTarget === 'toolsLabel' ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Label text</p>
                  <input
                    type="text"
                    value={work.toolsLabelText}
                    placeholder="Tools to use"
                    onChange={(event) => onChange({ toolsLabelText: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
                <WorkOptionGrid
                  label="Tools icon size"
                  options={PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS}
                  value={work.toolsIconSize}
                  onChange={(toolsIconSize) => onChange({ toolsIconSize })}
                  columns={2}
                />
              </div>
            ) : styleTarget === 'cta' ? (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                The <span className="font-semibold text-neutral-700">CTA &amp; tools</span> tab’s button accent
                color still controls the pill background/border. This color drives the CTA text itself when set.
              </p>
            ) : null
          }
        />
      ) : null}

      {subSection === 'cta' ? (
        <div className="space-y-6">
          <WorkToggleRow
            label="Show view project button"
            checked={work.showCardCta}
            onChange={(showCardCta) => onChange({ showCardCta })}
          />

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Button label</p>
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

          <WorkColorField label="Button accent color" value={work.ctaColor} onChange={(ctaColor) => onChange({ ctaColor })} />

          <WorkOptionGrid
            label="Emplacement du bouton"
            options={PORTFOLIO_WORK_CTA_ALIGNMENT_OPTIONS}
            value={work.ctaAlignment}
            onChange={(ctaAlignment) => onChange({ ctaAlignment })}
            columns={3}
          />

          <WorkOptionGrid
            label="Tools display"
            options={PORTFOLIO_WORK_TOOLS_DISPLAY_OPTIONS}
            value={work.toolsDisplay}
            onChange={(toolsDisplay) => onChange({ toolsDisplay })}
            columns={2}
          />

          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Max tools shown</p>
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
              Tool logos appear when they exist in the NoProbleme library for each project&apos;s tools.
            </p>
          </div>
        </div>
      ) : null}

      {subSection === 'background' ? (
        <SectionBackgroundSettingsFields settings={work} onChange={onChange} />
      ) : null}
    </div>
  );
}
