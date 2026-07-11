'use client';

import { useMemo, useState } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  CREATOR_TOOL_PRESETS,
  findCreatorToolPreset,
  getCreatorToolCategories,
  type CreatorToolPreset,
} from '@/components/creator/studio/creator-profile-tools-catalog';
import {
  profileFormInputClass,
  profileSectionMutedTextClass,
  profileSectionSubheadingClass,
} from '@/components/creator/studio/profile-section-ui';

type ToolCategoryId = CreatorToolPreset['category'];

function normalizeSelected(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function ToolChip({
  label,
  onRemove,
  readOnly = false,
}: {
  label: string;
  onRemove?: () => void;
  readOnly?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white py-1.5 pl-1.5 pr-2.5 text-xs font-medium text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-50">
      <CreatorToolLogo label={label} size={22} />
      <span className="max-w-[12rem] truncate">{label}</span>
      {!readOnly && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full px-1 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}

function CategoryChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PresetToolButton({
  preset,
  selected,
  disabled,
  onToggle,
}: {
  preset: CreatorToolPreset;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-300 dark:border-orange-500/50 dark:bg-orange-500/10 dark:ring-orange-500/30'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-neutral-600 dark:hover:bg-neutral-900'
      }`}
    >
      <CreatorToolLogo label={preset.name} preset={preset} size={22} />
      <span className="min-w-0 flex-1 text-xs font-medium leading-snug text-neutral-800 dark:text-neutral-100">
        {preset.name}
      </span>
      {selected ? (
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">
          Added
        </span>
      ) : null}
    </button>
  );
}

type CreatorToolsPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  readOnly?: boolean;
  allowCustom?: boolean;
  emptyLabel?: string;
};

export function CreatorToolsPicker({
  value,
  onChange,
  max = 8,
  readOnly = false,
  allowCustom = true,
  emptyLabel = 'No tools selected yet.',
}: CreatorToolsPickerProps) {
  const [customDraft, setCustomDraft] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<ToolCategoryId>>(() => new Set());

  const selectedValues = useMemo(() => normalizeSelected(value), [value]);
  const selectedKeys = useMemo(
    () => new Set(selectedValues.map((item) => item.toLowerCase())),
    [selectedValues]
  );

  const syncSelectedValues = (nextValues: string[]) => {
    onChange(normalizeSelected(nextValues).slice(0, max));
  };

  const isPresetSelected = (preset: CreatorToolPreset): boolean =>
    selectedKeys.has(preset.name.toLowerCase()) ||
    selectedKeys.has(preset.id.toLowerCase()) ||
    (preset.aliases?.some((alias) => selectedKeys.has(alias.toLowerCase())) ?? false);

  const togglePreset = (preset: CreatorToolPreset) => {
    if (isPresetSelected(preset)) {
      const next = selectedValues.filter((item) => {
        const match = findCreatorToolPreset(item);
        return match?.id !== preset.id;
      });
      syncSelectedValues(next);
      return;
    }
    if (selectedValues.length >= max) return;
    syncSelectedValues([...selectedValues, preset.name]);
  };

  const addCustomTool = () => {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    if (selectedValues.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setCustomDraft('');
      return;
    }
    if (selectedValues.length >= max) return;
    syncSelectedValues([...selectedValues, trimmed]);
    setCustomDraft('');
  };

  const toggleCategory = (categoryId: ToolCategoryId) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const countSelectedInCategory = (categoryId: ToolCategoryId) =>
    CREATOR_TOOL_PRESETS.filter((preset) => preset.category === categoryId && isPresetSelected(preset))
      .length;

  if (readOnly) {
    if (selectedValues.length === 0) {
      return <p className="text-xs text-neutral-500 dark:text-neutral-400">{emptyLabel}</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {selectedValues.map((item) => (
          <ToolChip key={item} label={item} readOnly />
        ))}
      </div>
    );
  }

  const categories = getCreatorToolCategories();

  return (
    <div className="space-y-4">
      {selectedValues.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((label) => (
            <ToolChip
              key={label}
              label={label}
              onRemove={() => syncSelectedValues(selectedValues.filter((item) => item !== label))}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-3 text-xs text-neutral-500 dark:border-neutral-700">
          {emptyLabel}
        </p>
      )}

      <div>
        <p className={`mb-2 ${profileSectionMutedTextClass}`}>
          Pick from the catalog. {selectedValues.length}/{max} selected.
        </p>
        <div className="space-y-2">
          {categories.map((category) => {
            const expanded = expandedCategories.has(category.id);
            const presets = CREATOR_TOOL_PRESETS.filter((preset) => preset.category === category.id);
            const selectedCount = countSelectedInCategory(category.id);

            return (
              <div
                key={category.id}
                className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
                >
                  <CategoryChevron expanded={expanded} />
                  <span className={profileSectionSubheadingClass}>{category.label}</span>
                  <span className={`ml-auto ${profileSectionMutedTextClass}`}>
                    {selectedCount > 0 ? `${selectedCount} · ` : ''}
                    {presets.length}
                  </span>
                </button>
                {expanded ? (
                  <div className="grid grid-cols-1 gap-2 border-t border-neutral-200 p-2.5 dark:border-neutral-700 sm:grid-cols-2">
                    {presets.map((preset) => (
                      <PresetToolButton
                        key={preset.id}
                        preset={preset}
                        selected={isPresetSelected(preset)}
                        disabled={!isPresetSelected(preset) && selectedValues.length >= max}
                        onToggle={() => togglePreset(preset)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {allowCustom ? (
        <div className="rounded-xl border border-dashed border-neutral-200 p-3 dark:border-neutral-700">
          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">Custom tool</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={customDraft}
              onChange={(event) => setCustomDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addCustomTool();
                }
              }}
              placeholder="Not in the list…"
              className={`${profileFormInputClass} mt-0 min-w-0 flex-1`}
            />
            <button
              type="button"
              onClick={addCustomTool}
              disabled={!customDraft.trim() || selectedValues.length >= max}
              className="inline-flex shrink-0 justify-center rounded-full border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              Add
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
