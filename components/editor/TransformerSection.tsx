'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Clip, Format } from '@/types/composition';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { getAspectRatio } from '@/lib/formatPresets';
import {
  applyEffectiveScalePct,
  applyPositionPx,
  clipToEffectiveScalePct,
  clipToPositionPx,
} from '@/lib/mediaTransform';
import { buildCenteredNativeMediaLayout } from '@/lib/studio/mediaDimensions';
import { panelClasses as P, textSectionBoxStyle } from '@/lib/rightPanelTheme';

const ROW_LABEL = 'text-[12px] text-neutral-400 leading-none';
const FIELD_H = 'h-9';
const FIELD_SHELL =
  'flex items-center rounded-lg border border-[#484848] bg-[#353535] transition-[border-color,box-shadow] focus-within:border-cyan-400/80 focus-within:shadow-[0_0_0_1px_rgba(34,211,238,0.35)]';

function SectionBox({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${P.cardSection} space-y-4`} style={textSectionBoxStyle}>
      {children}
    </div>
  );
}

function ResetIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function StepperChevron({ up }: { up: boolean }) {
  return (
    <svg
      width="7"
      height="4"
      viewBox="0 0 8 5"
      fill="currentColor"
      className={`text-neutral-500 ${up ? '' : 'rotate-180'}`}
      aria-hidden
    >
      <path d="M4 0L8 5H0z" />
    </svg>
  );
}

/** Champ CapCut : valeur à gauche, libellé (X/Y/°) à droite ; libellé masqué au focus ; molette + flèches. */
function CapCutStepperField({
  value,
  onChange,
  min,
  max,
  step = 1,
  trailingLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  /** X, Y, °, % — disparaît pendant l’édition */
  trailingLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n)));

  const applyValue = (n: number) => {
    const c = clamp(n);
    onChange(c);
    setDraft(String(c));
  };

  const bump = (dir: 1 | -1) => applyValue(value + dir * step);

  const handleFocus = () => {
    setFocused(true);
    setDraft(String(value));
  };

  const handleBlur = () => {
    setFocused(false);
    const n = parseFloat(draft.replace(',', '.'));
    if (!Number.isNaN(n)) applyValue(n);
    else setDraft(String(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      bump(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      bump(-1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    bump(e.deltaY < 0 ? 1 : -1);
  };

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  useEffect(() => {
    if (focused) inputRef.current?.focus();
  }, [focused]);

  return (
    <div
      className={`${FIELD_SHELL} ${FIELD_H} min-w-0 flex-1 overflow-hidden ${
        focused ? 'border-cyan-400/80 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]' : ''
      }`}
      onWheel={handleWheel}
    >
      <div
        className="flex min-w-0 flex-1 cursor-text items-center"
        onClick={() => setFocused(true)}
        role="presentation"
      >
        {focused ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={draft}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              const raw = e.target.value.trim();
              setDraft(raw);
              const n = parseFloat(raw.replace(',', '.'));
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
            className="h-full w-full min-w-0 bg-transparent pl-2.5 pr-1 text-left text-[13px] text-neutral-100 tabular-nums focus:outline-none"
            aria-label={trailingLabel ? `Valeur ${trailingLabel}` : 'Valeur'}
          />
        ) : (
          <div className="flex w-full min-w-0 items-center justify-between gap-3 px-2.5">
            <span className="truncate text-left text-[13px] tabular-nums text-neutral-100">
              {value}
            </span>
            {trailingLabel ? (
              <span className="shrink-0 text-[12px] font-medium text-neutral-500 select-none">
                {trailingLabel}
              </span>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex w-[20px] shrink-0 flex-col self-stretch border-l border-[#484848]">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => bump(1)}
          className="flex flex-1 items-center justify-center hover:bg-[#454545]"
          aria-label="Augmenter"
        >
          <StepperChevron up />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => bump(-1)}
          className="flex flex-1 items-center justify-center border-t border-[#484848] hover:bg-[#454545]"
          aria-label="Diminuer"
        >
          <StepperChevron up={false} />
        </button>
      </div>
    </div>
  );
}

function CapCutScaleRow({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <span className={ROW_LABEL}>Échelle</span>
      <div className="flex items-center gap-2.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#505050] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
        />
        <div className="w-[6.25rem] shrink-0">
          <CapCutStepperField
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            trailingLabel="%"
          />
        </div>
      </div>
    </div>
  );
}

function CapCutRotationDial({
  rotation,
  onChange,
}: {
  rotation: number;
  onChange: (deg: number) => void;
}) {
  const dialRef = useRef<HTMLDivElement>(null);
  const clamp = (n: number) => Math.max(-180, Math.min(180, Math.round(n)));

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      const el = dialRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const startAngle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
      const startRot = rotation;

      const onMove = (ev: MouseEvent) => {
        const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
        let d = startRot + (angle - startAngle);
        while (d > 180) d -= 360;
        while (d < -180) d += 360;
        onChange(clamp(d));
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [onChange, rotation]
  );

  return (
    <div
      ref={dialRef}
      role="slider"
      aria-label="Cadran rotation"
      aria-valuenow={rotation}
      tabIndex={0}
      className={`relative ${FIELD_H} w-9 shrink-0 cursor-grab rounded-full border border-[#505050] bg-[#3a3a3a] active:cursor-grabbing`}
      onMouseDown={(e) => {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
      }}
    >
      <div className="absolute left-1/2 top-[3px] h-[5px] w-[2px] -translate-x-1/2 rounded-full bg-cyan-400" />
      <div className="absolute inset-[6px] rounded-full bg-[#454545]">
        <div
          className="absolute left-1/2 top-1/2 h-[2px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-500"
          style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
        />
      </div>
    </div>
  );
}

export function TransformerSection({
  clip,
  format,
}: {
  clip: Clip;
  format: Format;
}) {
  const updateClip = useCompositionStore((s) => s.updateClip);
  const previewCanvasSize = useEditorUiStore((s) => s.previewCanvasSize);
  const composition = useCompositionStore((s) => s.composition);

  const aspect = getAspectRatio(
    format,
    composition?.customAspectW,
    composition?.customAspectH
  );

  const scalePct = clipToEffectiveScalePct(clip);
  const position = clipToPositionPx(clip, previewCanvasSize, aspect.w, aspect.h);
  const rotation = Math.round(clip.mediaRotation ?? 0);

  const posMinX = -Math.round(previewCanvasSize.width);
  const posMaxX = Math.round(previewCanvasSize.width);
  const posMinY = -Math.round(previewCanvasSize.height);
  const posMaxY = Math.round(previewCanvasSize.height);

  const reset = () => {
    const nw = clip.mediaNaturalWidth;
    const nh = clip.mediaNaturalHeight;
    if (nw && nh && nw > 0 && nh > 0 && previewCanvasSize.width > 0 && previewCanvasSize.height > 0) {
      updateClip(
        clip.id,
        buildCenteredNativeMediaLayout(nw, nh, previewCanvasSize.width, previewCanvasSize.height)
      );
      return;
    }
    updateClip(clip.id, {
      x: 50,
      y: 50,
      boxWidthPct: 100,
      mediaScale: 1,
      mediaOffsetX: 0,
      mediaOffsetY: 0,
      mediaRotation: 0,
    });
  };

  return (
    <SectionBox>
      <div className="flex items-center justify-between">
        <p className={P.sectionTitle}>Transformer</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-[#333333] hover:text-cyan-400"
          title="Réinitialiser"
          aria-label="Réinitialiser"
        >
          <ResetIcon />
        </button>
      </div>

      <CapCutScaleRow
        value={scalePct}
        min={1}
        max={500}
        step={1}
        onChange={(v) => updateClip(clip.id, applyEffectiveScalePct(v, clip))}
      />

      <div className="space-y-2">
        <span className={ROW_LABEL}>Position</span>
        <div className="flex items-center gap-2.5">
          <CapCutStepperField
            value={position.x}
            onChange={(v) =>
              updateClip(clip.id, applyPositionPx('x', v, clip, previewCanvasSize, aspect.w, aspect.h))
            }
            min={posMinX}
            max={posMaxX}
            trailingLabel="X"
          />
          <CapCutStepperField
            value={position.y}
            onChange={(v) =>
              updateClip(clip.id, applyPositionPx('y', v, clip, previewCanvasSize, aspect.w, aspect.h))
            }
            min={posMinY}
            max={posMaxY}
            trailingLabel="Y"
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className={ROW_LABEL}>Pivoter</span>
        <div className="flex items-center gap-2.5">
          <div className="w-[6.25rem] shrink-0">
            <CapCutStepperField
              value={rotation}
              onChange={(v) => updateClip(clip.id, { mediaRotation: v })}
              min={-180}
              max={180}
              trailingLabel="°"
            />
          </div>
          <CapCutRotationDial
            rotation={rotation}
            onChange={(v) => updateClip(clip.id, { mediaRotation: v })}
          />
        </div>
      </div>
    </SectionBox>
  );
}
