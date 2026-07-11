'use client';

import type { ReactNode } from 'react';
import {
  PORTFOLIO_ELEMENT_FONT_OPTIONS,
  PORTFOLIO_ELEMENT_TEXT_SIZE_OPTIONS,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

function StyleToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5">
      <span className="text-sm font-semibold text-neutral-950">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900"
      />
    </label>
  );
}

function StyleOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300'
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

function StyleColorField({
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
      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={isValidProfileHexColor(value) ? value : '#525252'}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 font-mono text-sm text-neutral-900"
        />
      </div>
    </div>
  );
}

export function PortfolioElementStyleFields({
  targets,
  activeTarget,
  onTargetChange,
  style,
  onStyleChange,
  extra,
}: {
  targets: { value: string; label: string; description: string }[];
  activeTarget: string;
  onTargetChange: (value: string) => void;
  style: PortfolioElementTextStyle;
  onStyleChange: (patch: Partial<PortfolioElementTextStyle>) => void;
  extra?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Element</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {targets.map((target) => {
            const active = activeTarget === target.value;
            return (
              <button
                key={target.value}
                type="button"
                onClick={() => onTargetChange(target.value)}
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

      <StyleColorField label="Color" value={style.color} onChange={(color) => onStyleChange({ color })} />

      <div className="grid gap-4 sm:grid-cols-2">
        <StyleOptionGrid
          label="Font"
          options={PORTFOLIO_ELEMENT_FONT_OPTIONS}
          value={style.font}
          onChange={(font) => onStyleChange({ font })}
        />
        <StyleOptionGrid
          label="Size"
          options={PORTFOLIO_ELEMENT_TEXT_SIZE_OPTIONS}
          value={style.size}
          onChange={(size) => onStyleChange({ size })}
        />
      </div>

      <div className="space-y-2">
        <StyleToggleRow label="Bold" checked={style.bold} onChange={(bold) => onStyleChange({ bold })} />
        <StyleToggleRow label="Italic" checked={style.italic} onChange={(italic) => onStyleChange({ italic })} />
        <StyleToggleRow
          label="Uppercase"
          checked={style.uppercase}
          onChange={(uppercase) => onStyleChange({ uppercase })}
        />
      </div>

      {extra}
    </div>
  );
}
