'use client';

import { useState } from 'react';
import {
  PORTFOLIO_EXPERIENCE_ASIDE_PLACEMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_CONTENT_ALIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_ELEMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS,
  PORTFOLIO_EXPERIENCE_ITEM_DENSITY_OPTIONS,
  PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_ITEMS_PER_ROW_OPTIONS,
  PORTFOLIO_EXPERIENCE_LIST_MAX_WIDTH_OPTIONS,
  PORTFOLIO_EXPERIENCE_LIST_PLACEMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_EXPERIENCE_TITLE_PRESET_OPTIONS,
  PORTFOLIO_EXPERIENCE_SKILLS_TAG_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_STYLE_TARGET_OPTIONS,
  PORTFOLIO_EXPERIENCE_TEXT_SIZE_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_DISPLAY_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_ENTRY_SIDE_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_ICON_SIZE_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_ZONE_OPTIONS,
  PORTFOLIO_EXPERIENCE_YEARS_PRESET_OPTIONS,
  PORTFOLIO_EXPERIENCE_YEARS_SIZE_OPTIONS,
  experienceDesignSupportsItemsPerRow,
  experienceLayerToCardFrameSettings,
  moveExperienceElementOrder,
  moveExperienceElementToCardZone,
  normalizeExperienceElementOrder,
  normalizeExperienceElementStyles,
  normalizeExperienceElementZones,
  patchExperienceElementStyle,
  patchExperienceLayerFrame,
  resolveExperienceElementZone,
  type PortfolioExperienceItemsPerRow,
  type PortfolioExperienceLayerFrame,
  type PortfolioExperienceSectionSettings,
  type PortfolioExperienceStyleTarget,
} from '@/components/portfolio/portfolio-experience-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { PortfolioCardFrameSettingsFields } from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';

type ExperienceSubSection = 'general' | 'header' | 'years' | 'content' | 'style' | 'frame' | 'background';
type ExperienceFrameLayer = 'entry' | 'story' | 'details';

const EXPERIENCE_SUB_SECTIONS: { id: ExperienceSubSection; label: string; description: string }[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Section visibility, item design, list width, spacing, and accent.',
  },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
  { id: 'years', label: 'Years', description: 'Years summary phrase and typography.' },
  {
    id: 'content',
    label: 'Content',
    description: 'Visible fields, move blocks between cards, labels, and display order.',
  },
  {
    id: 'style',
    label: 'Style',
    description: 'Color, font, size, and weight for every entry element.',
  },
  {
    id: 'frame',
    label: 'Frame',
    description: 'Separate controls for entry background, story card, and details card.',
  },
  { id: 'background', label: 'Background', description: 'Optional fill behind this section.' },
];

const FRAME_LAYER_OPTIONS: { id: ExperienceFrameLayer; label: string; description: string }[] = [
  {
    id: 'entry',
    label: 'Entry background',
    description: 'Outer shell around the whole experience entry (the gray background).',
  },
  {
    id: 'story',
    label: 'Story card',
    description: 'Inner frame for title, organization, meta, and description.',
  },
  {
    id: 'details',
    label: 'Details card',
    description: 'Inner frame for tasks, tools, proof, note, and skills.',
  },
];

function ExperienceToggleRow({
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

function ExperienceOptionGrid<T extends string>({
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

function ExperienceColorField({
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

export function ExperienceSettingsPanel({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const [subSection, setSubSection] = useState<ExperienceSubSection>('general');
  const [frameLayer, setFrameLayer] = useState<ExperienceFrameLayer>('entry');
  const [styleTarget, setStyleTarget] = useState<PortfolioExperienceStyleTarget>('title');
  const activeMeta =
    EXPERIENCE_SUB_SECTIONS.find((section) => section.id === subSection) ?? EXPERIENCE_SUB_SECTIONS[0];

  const activeFrame: PortfolioExperienceLayerFrame =
    frameLayer === 'entry'
      ? experience.entryFrame
      : frameLayer === 'story'
        ? experience.storyFrame
        : experience.detailsFrame;

  const patchActiveFrame = (patch: Partial<PortfolioExperienceLayerFrame>) => {
    const key =
      frameLayer === 'entry' ? 'entryFrame' : frameLayer === 'story' ? 'storyFrame' : 'detailsFrame';
    onChange({ [key]: patchExperienceLayerFrame(activeFrame, patch) });
  };

  const elementOrder = normalizeExperienceElementOrder(experience.elementOrder);
  const elementZones = normalizeExperienceElementZones(experience.elementZones);
  const elementStyles = normalizeExperienceElementStyles(experience.elementStyles);
  const activeTextStyle = elementStyles[styleTarget];
  const patchActiveTextStyle = (patch: Partial<typeof activeTextStyle>) => {
    onChange({ elementStyles: patchExperienceElementStyle(elementStyles, styleTarget, patch) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Experience subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as ExperienceSubSection)}
          className="min-w-[12rem] flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:max-w-xs"
        >
          {EXPERIENCE_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <ExperienceToggleRow
            label="Show section"
            description="Display the experience block on your public portfolio."
            checked={experience.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <ExperienceOptionGrid
            label="Item design"
            options={PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS}
            value={experience.experienceDesign}
            onChange={(experienceDesign) => onChange({ experienceDesign })}
            columns={2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceOptionGrid
              label="List width"
              options={PORTFOLIO_EXPERIENCE_LIST_MAX_WIDTH_OPTIONS}
              value={experience.listMaxWidth}
              onChange={(listMaxWidth) => onChange({ listMaxWidth })}
              columns={2}
            />
            <ExperienceOptionGrid
              label="List placement"
              options={PORTFOLIO_EXPERIENCE_LIST_PLACEMENT_OPTIONS}
              value={experience.listPlacement}
              onChange={(listPlacement) => onChange({ listPlacement })}
              columns={3}
            />
          </div>
          {experienceDesignSupportsItemsPerRow(experience.experienceDesign) ? (
            <ExperienceOptionGrid
              label="Items per row"
              options={PORTFOLIO_EXPERIENCE_ITEMS_PER_ROW_OPTIONS}
              value={String(experience.itemsPerRow ?? 1) as '1' | '2' | '3'}
              onChange={(value) =>
                onChange({ itemsPerRow: Number(value) as PortfolioExperienceItemsPerRow })
              }
              columns={3}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Items per row applies to <span className="font-semibold text-neutral-700">Panel cards</span>,{' '}
              <span className="font-semibold text-neutral-700">Stepped cards</span>, and{' '}
              <span className="font-semibold text-neutral-700">Bento</span>. Timeline rails stay one column for
              readability.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceOptionGrid
              label="Entry spacing"
              options={PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS}
              value={experience.itemGap}
              onChange={(itemGap) => onChange({ itemGap })}
              columns={3}
            />
            <ExperienceOptionGrid
              label="Inner density"
              options={PORTFOLIO_EXPERIENCE_ITEM_DENSITY_OPTIONS}
              value={experience.itemDensity}
              onChange={(itemDensity) => onChange({ itemDensity })}
              columns={2}
            />
          </div>
          <ExperienceColorField
            label="Accent color"
            value={experience.accentColor}
            onChange={(accentColor) => onChange({ accentColor })}
          />
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Experience entries are edited in Creator Studio → Information. Use Content and Frame to control what
            shows and how each entry is framed.
          </p>
        </div>
      ) : null}

      {subSection === 'content' ? (
        <div className="space-y-6">
          <ExperienceOptionGrid
            label="Details placement"
            options={PORTFOLIO_EXPERIENCE_ASIDE_PLACEMENT_OPTIONS}
            value={experience.asidePlacement}
            onChange={(asidePlacement) => onChange({ asidePlacement })}
            columns={2}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceOptionGrid
              label="Tools placement"
              options={PORTFOLIO_EXPERIENCE_TOOLS_ZONE_OPTIONS}
              value={experience.toolsZone}
              onChange={(toolsZone) =>
                onChange({
                  toolsZone,
                  elementZones:
                    toolsZone === 'story' || toolsZone === 'details'
                      ? { ...elementZones, tools: toolsZone }
                      : elementZones,
                })
              }
              columns={2}
            />
            <ExperienceOptionGrid
              label="Tools display"
              options={PORTFOLIO_EXPERIENCE_TOOLS_DISPLAY_OPTIONS}
              value={experience.toolsDisplay}
              onChange={(toolsDisplay) => onChange({ toolsDisplay })}
              columns={2}
            />
          </div>
          {experience.toolsZone === 'entry' ? (
            <ExperienceOptionGrid
              label="Outside position"
              options={PORTFOLIO_EXPERIENCE_TOOLS_ENTRY_SIDE_OPTIONS}
              value={experience.toolsEntrySide}
              onChange={(toolsEntrySide) => onChange({ toolsEntrySide })}
              columns={2}
            />
          ) : null}

          <ExperienceOptionGrid
            label="Tools icon size"
            options={PORTFOLIO_EXPERIENCE_TOOLS_ICON_SIZE_OPTIONS}
            value={experience.toolsIconSize}
            onChange={(toolsIconSize) => onChange({ toolsIconSize })}
            columns={2}
          />

          <ExperienceOptionGrid
            label="Skills tag style"
            options={PORTFOLIO_EXPERIENCE_SKILLS_TAG_STYLE_OPTIONS}
            value={experience.skillsTagStyle}
            onChange={(skillsTagStyle) => onChange({ skillsTagStyle })}
            columns={2}
          />

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Block labels</p>
            <p className="text-sm text-neutral-500">
              Rename Tasks, Proof, Note, Skills, and Tools. Leave blank to keep the default English label.
            </p>
            <ExperienceToggleRow
              label="Show block labels"
              description="Hide the small uppercase headings above each block."
              checked={experience.showBlockLabels}
              onChange={(showBlockLabels) => onChange({ showBlockLabels })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { key: 'tasksLabel', label: 'Tasks', placeholder: 'Tasks' },
                  { key: 'proofLabel', label: 'Proof', placeholder: 'Proof' },
                  { key: 'noteLabel', label: 'Note', placeholder: 'Note' },
                  { key: 'skillsLabel', label: 'Skills', placeholder: 'Skills' },
                  { key: 'toolsLabel', label: 'Tools', placeholder: 'Tools' },
                ] as const
              ).map((field) => (
                <div key={field.key}>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    {field.label}
                  </p>
                  <input
                    type="text"
                    value={experience[field.key]}
                    placeholder={field.placeholder}
                    onChange={(event) => onChange({ [field.key]: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Display order</p>
            <p className="text-sm text-neutral-500">
              Reorder elements, and move any block between the Story card and the Details card.
            </p>
            <div className="space-y-2">
              {elementOrder.map((id, index) => {
                const meta = PORTFOLIO_EXPERIENCE_ELEMENT_OPTIONS.find((option) => option.value === id);
                const resolvedZone = resolveExperienceElementZone(id, elementZones, experience.toolsZone);
                const zoneLabel =
                  resolvedZone === 'entry'
                    ? experience.toolsEntrySide === 'right'
                      ? 'Outside · bottom right'
                      : 'Outside · bottom left'
                    : resolvedZone === 'story'
                      ? 'Story card'
                      : 'Details card';
                const otherCardZone = resolvedZone === 'story' ? 'details' : 'story';
                const canMoveBetweenCards = resolvedZone === 'story' || resolvedZone === 'details';
                return (
                  <div
                    key={id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  >
                    <span className="w-6 text-center text-xs font-bold tabular-nums text-neutral-400">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-neutral-950">
                        {meta?.label ?? id}
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                        {zoneLabel}
                      </span>
                    </span>
                    <div className="flex shrink-0 flex-wrap gap-1">
                      {canMoveBetweenCards ? (
                        <button
                          type="button"
                          onClick={() =>
                            onChange(
                              moveExperienceElementToCardZone(
                                elementZones,
                                id,
                                otherCardZone,
                                experience.toolsZone
                              )
                            )
                          }
                          className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700"
                        >
                          → {otherCardZone === 'story' ? 'Story' : 'Details'}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() =>
                          onChange({ elementOrder: moveExperienceElementOrder(elementOrder, index, -1) })
                        }
                        className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700 disabled:opacity-30"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        disabled={index === elementOrder.length - 1}
                        onClick={() =>
                          onChange({ elementOrder: moveExperienceElementOrder(elementOrder, index, 1) })
                        }
                        className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700 disabled:opacity-30"
                      >
                        Down
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Visible elements</p>
            <p className="text-sm text-neutral-500">
              Toggle every block inside an experience entry. Applies to all designs.
            </p>
            <div className="space-y-2">
              <ExperienceToggleRow
                label="Period"
                description="Year or date range badge."
                checked={experience.showPeriod}
                onChange={(showPeriod) => onChange({ showPeriod })}
              />
              <ExperienceToggleRow
                label="Job title"
                checked={experience.showTitle}
                onChange={(showTitle) => onChange({ showTitle })}
              />
              <ExperienceToggleRow
                label="Organization"
                checked={experience.showOrganization}
                onChange={(showOrganization) => onChange({ showOrganization })}
              />
              <ExperienceToggleRow
                label="Description"
                checked={experience.showDescription}
                onChange={(showDescription) => onChange({ showDescription })}
              />
              <ExperienceToggleRow
                label="Meta chips"
                description="Status, employment type, location."
                checked={experience.showMeta}
                onChange={(showMeta) => onChange({ showMeta })}
              />
              <ExperienceToggleRow
                label="Tasks"
                checked={experience.showTasks}
                onChange={(showTasks) => onChange({ showTasks })}
              />
              <ExperienceToggleRow
                label="Tools"
                checked={experience.showTools}
                onChange={(showTools) => onChange({ showTools })}
              />
              <ExperienceToggleRow
                label="Proof links"
                checked={experience.showProof}
                onChange={(showProof) => onChange({ showProof })}
              />
              <ExperienceToggleRow
                label="Note / remarks"
                checked={experience.showNote}
                onChange={(showNote) => onChange({ showNote })}
              />
              <ExperienceToggleRow
                label="Skills tags"
                checked={experience.showSkills}
                onChange={(showSkills) => onChange({ showSkills })}
              />
            </div>
          </div>
        </div>
      ) : null}

      {subSection === 'style' ? (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Element</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PORTFOLIO_EXPERIENCE_STYLE_TARGET_OPTIONS.map((target) => {
                const active = styleTarget === target.value;
                return (
                  <button
                    key={target.value}
                    type="button"
                    onClick={() => setStyleTarget(target.value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-950">{target.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">{target.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <ExperienceColorField
            label="Color"
            value={activeTextStyle.color}
            onChange={(color) => patchActiveTextStyle({ color })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceOptionGrid
              label="Font"
              options={PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS}
              value={activeTextStyle.font}
              onChange={(font) => patchActiveTextStyle({ font })}
              columns={2}
            />
            <ExperienceOptionGrid
              label="Size"
              options={PORTFOLIO_EXPERIENCE_TEXT_SIZE_OPTIONS}
              value={activeTextStyle.size}
              onChange={(size) => patchActiveTextStyle({ size })}
              columns={2}
            />
          </div>

          <div className="space-y-2">
            <ExperienceToggleRow
              label="Bold"
              checked={activeTextStyle.bold}
              onChange={(bold) => patchActiveTextStyle({ bold })}
            />
            <ExperienceToggleRow
              label="Italic"
              checked={activeTextStyle.italic}
              onChange={(italic) => patchActiveTextStyle({ italic })}
            />
            <ExperienceToggleRow
              label="Uppercase"
              checked={activeTextStyle.uppercase}
              onChange={(uppercase) => patchActiveTextStyle({ uppercase })}
            />
          </div>

          {styleTarget === 'skills' ? (
            <ExperienceOptionGrid
              label="Skills tag chrome"
              options={PORTFOLIO_EXPERIENCE_SKILLS_TAG_STYLE_OPTIONS}
              value={experience.skillsTagStyle}
              onChange={(skillsTagStyle) => onChange({ skillsTagStyle })}
              columns={2}
            />
          ) : null}

          {styleTarget === 'tools' ? (
            <ExperienceOptionGrid
              label="Tools icon size"
              options={PORTFOLIO_EXPERIENCE_TOOLS_ICON_SIZE_OPTIONS}
              value={experience.toolsIconSize}
              onChange={(toolsIconSize) => onChange({ toolsIconSize })}
              columns={2}
            />
          ) : null}
        </div>
      ) : null}

      {subSection === 'frame' ? (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Layer</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {FRAME_LAYER_OPTIONS.map((layer) => {
                const active = frameLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setFrameLayer(layer.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-950">{layer.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">{layer.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <ExperienceToggleRow
            label={
              frameLayer === 'entry'
                ? 'Show entry background'
                : frameLayer === 'story'
                  ? 'Show story card frame'
                  : 'Show details card frame'
            }
            description={
              frameLayer === 'entry'
                ? 'Outer background around both columns. Card designs keep a shell even when off; turn on for timeline Magazine / rails.'
                : 'Independent border, fill, radius, and padding for this inner card.'
            }
            checked={activeFrame.enabled}
            onChange={(enabled) => patchActiveFrame({ enabled })}
          />

          <PortfolioCardFrameSettingsFields
            settings={experienceLayerToCardFrameSettings(activeFrame)}
            onChange={patchActiveFrame}
            heading={FRAME_LAYER_OPTIONS.find((layer) => layer.id === frameLayer)?.label ?? 'Frame'}
            description="Border, fill, radius, and padding for this layer only."
          />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <ExperienceOptionGrid
            label="Title preset"
            options={PORTFOLIO_EXPERIENCE_TITLE_PRESET_OPTIONS}
            value={experience.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
            columns={2}
          />
          {experience.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={experience.titleCustom || experience.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <ExperienceOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_EXPERIENCE_SUBTITLE_PRESET_OPTIONS}
            value={experience.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
            columns={2}
          />
          {experience.subtitlePreset === 'custom' || experience.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Subtitle text</p>
              <textarea
                rows={3}
                value={
                  experience.subtitlePreset === 'custom'
                    ? experience.subtitleCustom || experience.subtitle
                    : experience.subtitle
                }
                onChange={(event) =>
                  onChange(
                    experience.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceOptionGrid
              label="Title font"
              options={PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS}
              value={experience.titleFont}
              onChange={(titleFont) => onChange({ titleFont })}
              columns={2}
            />
            <ExperienceOptionGrid
              label="Subtitle font"
              options={PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS}
              value={experience.subtitleFont}
              onChange={(subtitleFont) => onChange({ subtitleFont })}
              columns={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceColorField
              label="Title color"
              value={experience.titleColor}
              onChange={(titleColor) => onChange({ titleColor })}
            />
            <ExperienceColorField
              label="Subtitle color"
              value={experience.subtitleColor}
              onChange={(subtitleColor) => onChange({ subtitleColor })}
            />
          </div>

          <ExperienceOptionGrid
            label="Header alignment"
            options={[
              { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
              { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
              { value: 'right' as const, label: 'Right', description: 'Align header to the right.' },
            ]}
            value={experience.headerAlignment}
            onChange={(headerAlignment) => onChange({ headerAlignment })}
            columns={3}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceToggleRow
              label="Uppercase title"
              checked={experience.titleUppercase}
              onChange={(titleUppercase) => onChange({ titleUppercase })}
            />
            <ExperienceToggleRow
              label="Uppercase subtitle"
              checked={experience.subtitleUppercase}
              onChange={(subtitleUppercase) => onChange({ subtitleUppercase })}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'years' ? (
        <div className="space-y-6">
          <ExperienceToggleRow
            label="Show years line"
            description="Display the years-of-experience summary above the list."
            checked={experience.showYears}
            onChange={(showYears) => onChange({ showYears })}
          />
          {experience.showYears ? (
            <>
              <ExperienceOptionGrid
                label="Phrase preset"
                options={PORTFOLIO_EXPERIENCE_YEARS_PRESET_OPTIONS}
                value={experience.yearsPreset}
                onChange={(yearsPreset) => onChange({ yearsPreset })}
              />
              {experience.yearsPreset === 'custom' ? (
                <>
                  <input
                    type="text"
                    value={experience.yearsCustom}
                    onChange={(event) => onChange({ yearsCustom: event.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                  />
                  <p className="text-xs text-neutral-500">
                    Use {'{years}'} for the count — e.g. {'{years}+ years of hands-on experience in my field.'}
                  </p>
                </>
              ) : null}
              <ExperienceOptionGrid
                label="Phrase font"
                options={PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS}
                value={experience.yearsFont}
                onChange={(yearsFont) => onChange({ yearsFont })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Phrase size"
                options={PORTFOLIO_EXPERIENCE_YEARS_SIZE_OPTIONS.map((option) => ({
                  ...option,
                  description: option.label,
                }))}
                value={experience.yearsSize}
                onChange={(yearsSize) => onChange({ yearsSize })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Phrase alignment"
                options={PORTFOLIO_EXPERIENCE_CONTENT_ALIGN_OPTIONS}
                value={experience.yearsAlignment}
                onChange={(yearsAlignment) => onChange({ yearsAlignment })}
                columns={3}
              />
              <ExperienceColorField
                label="Phrase color"
                value={experience.yearsColor}
                onChange={(yearsColor) => onChange({ yearsColor })}
              />
              <ExperienceColorField
                label="Years count color"
                value={experience.yearsHighlightColor}
                onChange={(yearsHighlightColor) => onChange({ yearsHighlightColor })}
              />
              <ExperienceToggleRow
                label="Bold years count"
                checked={experience.yearsBoldYears}
                onChange={(yearsBoldYears) => onChange({ yearsBoldYears })}
              />
              <ExperienceToggleRow
                label="Italic phrase"
                checked={experience.yearsItalic}
                onChange={(yearsItalic) => onChange({ yearsItalic })}
              />
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <SectionBackgroundSettingsFields settings={experience} onChange={onChange} />
      ) : null}
    </div>
  );
}
