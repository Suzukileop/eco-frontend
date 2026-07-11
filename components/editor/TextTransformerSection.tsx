'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Clip } from '@/types/composition';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import {
  applyTextScalePctChange,
  getTextScalePct,
  STUDIO_TEXT_SCALE_MAX_PCT,
  STUDIO_TEXT_SCALE_MIN_PCT,
} from '@/lib/studio/textZone/textZoneGeometry';

const ROW_LABEL = 'text-[12px] text-neutral-500 leading-none';
const FIELD_H = 'h-9';
const FIELD_SHELL =
  'flex items-center rounded-[10px] bg-[#1a1a1a] transition-[box-shadow] focus-within:ring-2 focus-within:ring-cyan-400/40';

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
    <svg width="7" height="4" viewBox="0 0 8 5" fill="currentColor" className={`text-neutral-500 ${up ? '' : 'rotate-180'}`} aria-hidden>
      <path d="M4 0L8 5H0z" />
    </svg>
  );
}

function CapCutDarkStepperField({
  value,
  onChange,
  min,
  max,
  step = 1,
  trailingLabel,
  disabled = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  trailingLabel?: string;
  disabled?: boolean;
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

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <div className={`${FIELD_SHELL} ${FIELD_H} min-w-0 flex-1 overflow-hidden ${disabled ? 'opacity-45 pointer-events-none' : ''}`}>
      <div className="flex min-w-0 flex-1 cursor-text items-center" onClick={() => !disabled && setFocused(true)} role="presentation">
        {focused ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={draft}
            autoFocus
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              const n = parseFloat(draft.replace(',', '.'));
              if (!Number.isNaN(n)) applyValue(n);
              else setDraft(String(value));
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') { e.preventDefault(); bump(1); }
              else if (e.key === 'ArrowDown') { e.preventDefault(); bump(-1); }
            }}
            onChange={(e) => {
              const raw = e.target.value.trim();
              setDraft(raw);
              const n = parseFloat(raw.replace(',', '.'));
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
            className="h-full w-full min-w-0 bg-transparent pl-2.5 pr-1 text-left text-[13px] text-neutral-100 tabular-nums focus:outline-none"
          />
        ) : (
          <div className="flex w-full min-w-0 items-center justify-between gap-2 px-2.5">
            <span className="truncate text-[13px] tabular-nums text-neutral-100">
              {value}{trailingLabel === '%' ? '%' : ''}{trailingLabel === '°' ? '°' : ''}
            </span>
            {trailingLabel && trailingLabel !== '%' && trailingLabel !== '°' ? (
              <span className="shrink-0 text-[12px] text-neutral-500">{trailingLabel}</span>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex w-[20px] shrink-0 flex-col self-stretch border-l border-[#333]">
        <button type="button" tabIndex={-1} onClick={() => bump(1)} className="flex flex-1 items-center justify-center hover:bg-[#252525]" aria-label="Augmenter">
          <StepperChevron up />
        </button>
        <button type="button" tabIndex={-1} onClick={() => bump(-1)} className="flex flex-1 items-center justify-center border-t border-[#333] hover:bg-[#252525]" aria-label="Diminuer">
          <StepperChevron up={false} />
        </button>
      </div>
    </div>
  );
}

function CapCutRotationDial({ rotation, onChange, disabled }: { rotation: number; onChange: (deg: number) => void; disabled?: boolean }) {
  const dialRef = useRef<HTMLDivElement>(null);
  const clamp = (n: number) => Math.max(-180, Math.min(180, Math.round(n)));

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      const el = dialRef.current;
      if (!el || disabled) return;
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
    [onChange, disabled, rotation]
  );

  return (
    <div
      ref={dialRef}
      role="slider"
      aria-valuenow={rotation}
      className={`relative ${FIELD_H} w-9 shrink-0 rounded-full border border-[#404040] bg-[#1a1a1a] ${disabled ? 'opacity-45 pointer-events-none' : 'cursor-grab active:cursor-grabbing'}`}
      onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
    >
      <div className="absolute left-1/2 top-[3px] h-[5px] w-[2px] -translate-x-1/2 rounded-full bg-cyan-400" />
      <div className="absolute inset-[6px] rounded-full bg-[#252525]">
        <div
          className="absolute left-1/2 top-1/2 h-[2px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-500"
          style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
        />
      </div>
    </div>
  );
}

function textClipToPositionPx(clip: Clip, canvasW: number, canvasH: number) {
  return {
    x: Math.round((((clip.x ?? 50) - 50) / 100) * canvasW),
    y: Math.round((((clip.y ?? 50) - 50) / 100) * canvasH),
  };
}

function applyTextPositionPx(axis: 'x' | 'y', valuePx: number, canvasW: number, canvasH: number): Pick<Clip, 'x' | 'y'> {
  if (canvasW <= 0 || canvasH <= 0) return {};
  if (axis === 'x') return { x: Math.max(0, Math.min(100, ((valuePx / canvasW) + 0.5) * 100)) };
  return { y: Math.max(0, Math.min(100, ((valuePx / canvasH) + 0.5) * 100)) };
}

function applyTextScalePct(valuePct: number): Pick<Clip, 'textScalePct'> {
  return applyTextScalePctChange(valuePct);
}

/** Transformer CapCut pour clips texte (position, échelle, rotation). */
export function TextTransformerSection({ clip, disabled = false }: { clip: Clip; disabled?: boolean }) {
  const updateClip = useCompositionStore((s) => s.updateClip);
  const previewCanvasSize = useEditorUiStore((s) => s.previewCanvasSize);
  const textScaleDragPreview = useEditorUiStore((s) => s.textScaleDragPreview);

  const position = textClipToPositionPx(clip, previewCanvasSize.width, previewCanvasSize.height);
  const rotation = Math.round(clip.textRotation ?? 0);
  const scalePct =
    textScaleDragPreview?.clipId === clip.id
      ? textScaleDragPreview.pct
      : getTextScalePct(
          clip,
          previewCanvasSize.height > 0 ? previewCanvasSize.height : undefined
        );

  const posMinX = -Math.round(previewCanvasSize.width);
  const posMaxX = Math.round(previewCanvasSize.width);
  const posMinY = -Math.round(previewCanvasSize.height);
  const posMaxY = Math.round(previewCanvasSize.height);

  const reset = () =>
    updateClip(clip.id, {
      x: 50,
      y: 50,
      textRotation: 0,
      textScalePct: 100,
    });

  const upd = (patch: Partial<Clip>) => {
    if (!disabled) updateClip(clip.id, patch);
  };

  return (
    <div className={`border-t border-[#2a2a2a] bg-black px-4 py-3 space-y-4 ${disabled ? 'opacity-50 pointer-events-none select-none' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-neutral-100">Transformer</p>
        <button type="button" onClick={reset} className="rounded-md p-1 text-neutral-500 hover:bg-white/5 hover:text-neutral-300" title="Réinitialiser" aria-label="Réinitialiser">
          <ResetIcon />
        </button>
      </div>

      <div className="space-y-2">
        <span className={ROW_LABEL}>Échelle</span>
        <div className="flex items-center gap-2.5">
          <input
            type="range"
            min={STUDIO_TEXT_SCALE_MIN_PCT}
            max={STUDIO_TEXT_SCALE_MAX_PCT}
            step={1}
            value={scalePct}
            onChange={(e) => upd(applyTextScalePct(parseFloat(e.target.value)))}
            className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#333] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
          />
          <div className="w-[6.25rem] shrink-0">
            <CapCutDarkStepperField
              value={scalePct}
              onChange={(v) => upd(applyTextScalePct(v))}
              min={STUDIO_TEXT_SCALE_MIN_PCT}
              max={STUDIO_TEXT_SCALE_MAX_PCT}
              trailingLabel="%"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className={ROW_LABEL}>Position</span>
        <div className="flex items-center gap-2.5">
          <CapCutDarkStepperField
            value={position.x}
            onChange={(v) => upd(applyTextPositionPx('x', v, previewCanvasSize.width, previewCanvasSize.height))}
            min={posMinX}
            max={posMaxX}
            trailingLabel="X"
          />
          <CapCutDarkStepperField
            value={position.y}
            onChange={(v) => upd(applyTextPositionPx('y', v, previewCanvasSize.width, previewCanvasSize.height))}
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
            <CapCutDarkStepperField
              value={rotation}
              onChange={(v) => upd({ textRotation: v })}
              min={-180}
              max={180}
              trailingLabel="°"
            />
          </div>
          <CapCutRotationDial rotation={rotation} onChange={(v) => upd({ textRotation: v })} />
        </div>
      </div>
    </div>
  );
}
