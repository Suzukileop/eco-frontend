'use client';

import { useMemo, useState } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  CREATOR_TOOL_PRESETS,
  findCreatorToolPreset,
  getCreatorToolCategories,
  type CreatorToolPreset,
} from '@/components/creator/studio/creator-profile-tools-catalog';
import type { ProfileFormValues } from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
  profileSectionSubheadingClass,
} from '@/components/creator/studio/profile-section-ui';
import { getSkillUsageDescription } from '@/components/portfolio/skill-usage-descriptions';

type ToolCategoryId = CreatorToolPreset['category'];

const MAX_STRENGTHS = 12;
const MAX_DESCRIPTION = 280;

type StrengthFormItem = { value: string; description?: string };

type ProfileStrengthsFieldProps = {
  control: Control<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  readOnly?: boolean;
  values?: StrengthFormItem[];
};

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
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
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
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-300 dark:border-orange-500/50 dark:bg-orange-500/10 dark:ring-orange-500/30'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-neutral-600 dark:hover:bg-neutral-900'
      }`}
    >
      <CreatorToolLogo label={preset.name} preset={preset} size={24} />
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

export function ProfileStrengthsField({
  control,
  setValue,
  readOnly = false,
  values = [],
}: ProfileStrengthsFieldProps) {
  const watchedStrengths = useWatch({ control, name: 'strengthsTools' });
  const [customDraft, setCustomDraft] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<ToolCategoryId>>(() => new Set());

  const formItems = useMemo((): StrengthFormItem[] => {
    if (readOnly) return values;
    return watchedStrengths ?? [];
  }, [readOnly, values, watchedStrengths]);

  const selectedValues = useMemo(
    () => normalizeSelected(formItems.map((item) => item.value)),
    [formItems]
  );

  const selectedKeys = useMemo(
    () => new Set(selectedValues.map((value) => value.toLowerCase())),
    [selectedValues]
  );

  const descriptionByLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of formItems) {
      map.set(item.value.toLowerCase(), item.description ?? '');
    }
    return map;
  }, [formItems]);

  const syncSelectedValues = (nextValues: string[]) => {
    const previous = new Map(
      (watchedStrengths ?? []).map((item) => [item.value.toLowerCase(), item.description ?? ''])
    );
    setValue(
      'strengthsTools',
      normalizeSelected(nextValues).map((value) => ({
        value,
        description: previous.get(value.toLowerCase()) ?? '',
      })),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const updateDescription = (label: string, description: string) => {
    const next = (watchedStrengths ?? []).map((item) =>
      item.value === label ? { ...item, description } : item
    );
    setValue('strengthsTools', next, { shouldDirty: true, shouldValidate: true });
  };

  const isPresetSelected = (preset: CreatorToolPreset): boolean =>
    selectedKeys.has(preset.name.toLowerCase()) ||
    (preset.aliases?.some((alias) => selectedKeys.has(alias.toLowerCase())) ?? false);

  const togglePreset = (preset: CreatorToolPreset) => {
    if (isPresetSelected(preset)) {
      const next = selectedValues.filter((value) => {
        const presetMatch = findCreatorToolPreset(value);
        return presetMatch?.id !== preset.id;
      });
      syncSelectedValues(next);
      return;
    }
    if (selectedValues.length >= MAX_STRENGTHS) return;
    syncSelectedValues([...selectedValues, preset.name]);
  };

  const addCustomTool = () => {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    if (selectedValues.some((value) => value.toLowerCase() === trimmed.toLowerCase())) {
      setCustomDraft('');
      return;
    }
    if (selectedValues.length >= MAX_STRENGTHS) return;
    syncSelectedValues([...selectedValues, trimmed]);
    setCustomDraft('');
  };

  const toggleCategory = (categoryId: ToolCategoryId) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const countSelectedInCategory = (categoryId: ToolCategoryId) =>
    CREATOR_TOOL_PRESETS.filter((preset) => preset.category === categoryId && isPresetSelected(preset))
      .length;

  if (readOnly) {
    if (selectedValues.length === 0) {
      return <p className={profileSectionEmptyClass}>No strengths added yet.</p>;
    }
    return (
      <div className="space-y-3">
        {selectedValues.map((item) => {
          const custom = descriptionByLabel.get(item.toLowerCase())?.trim() ?? '';
          const body = custom || getSkillUsageDescription(item);
          return (
            <div
              key={item}
              className="rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 dark:border-neutral-700 dark:bg-neutral-950"
            >
              <div className="flex items-center gap-2.5">
                <CreatorToolLogo label={item} size={28} />
                <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">{item}</p>
              </div>
              <p className={`mt-2 text-sm leading-relaxed ${profileSectionMutedTextClass}`}>{body}</p>
            </div>
          );
        })}
      </div>
    );
  }

  const categories = getCreatorToolCategories();

  return (
    <div className="space-y-5">
      {selectedValues.length > 0 && (
        <div className="space-y-3">
          <div>
            <p className={`mb-1 ${profileSectionSubheadingClass}`}>Selected</p>
            <p className={profileSectionMutedTextClass}>
              Edit each tool description for the portfolio cards. Leave blank to keep the automatic
              blurb.
            </p>
          </div>
          {selectedValues.map((label) => {
            const description = descriptionByLabel.get(label.toLowerCase()) ?? '';
            const autoPreview = getSkillUsageDescription(label);
            return (
              <div
                key={label}
                className="rounded-2xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-700 dark:bg-neutral-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <CreatorToolLogo label={label} size={28} />
                    <p className="truncate text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">
                      {label}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      syncSelectedValues(selectedValues.filter((value) => value !== label))
                    }
                    className="shrink-0 rounded-full px-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
                <label className="mt-3 block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    Description
                  </span>
                  <textarea
                    rows={2}
                    maxLength={MAX_DESCRIPTION}
                    value={description}
                    onChange={(event) => updateDescription(label, event.target.value)}
                    placeholder={autoPreview}
                    className={`mt-1.5 ${profileFormInputClass} min-h-[4.5rem] resize-y`}
                  />
                </label>
                <p className={`mt-1.5 text-xs ${profileSectionMutedTextClass}`}>
                  {description.trim()
                    ? `${description.trim().length}/${MAX_DESCRIPTION}`
                    : `Auto: ${autoPreview}`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">Popular tools</p>
          <p className={`mt-1 ${profileSectionMutedTextClass}`}>
            Tap to add or remove. {selectedValues.length}/{MAX_STRENGTHS} selected.
          </p>
        </div>

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
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
              >
                <CategoryChevron expanded={expanded} />
                <span className={profileSectionSubheadingClass}>{category.label}</span>
                <span className={`ml-auto ${profileSectionMutedTextClass}`}>
                  {selectedCount > 0 ? `${selectedCount} added · ` : ''}
                  {presets.length} tools
                </span>
              </button>
              {expanded ? (
                <div className="grid grid-cols-1 gap-2 border-t border-neutral-200 p-3 dark:border-neutral-700 sm:grid-cols-2 xl:grid-cols-3">
                  {presets.map((preset) => (
                    <PresetToolButton
                      key={preset.id}
                      preset={preset}
                      selected={isPresetSelected(preset)}
                      disabled={!isPresetSelected(preset) && selectedValues.length >= MAX_STRENGTHS}
                      onToggle={() => togglePreset(preset)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-200 p-4 dark:border-neutral-700">
        <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">Custom tool</p>
        <p className={`mt-1 ${profileSectionMutedTextClass}`}>Add anything that is not in the list above.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
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
            placeholder="Tool name"
            className={profileFormInputClass}
          />
          <button
            type="button"
            onClick={addCustomTool}
            disabled={!customDraft.trim() || selectedValues.length >= MAX_STRENGTHS}
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
