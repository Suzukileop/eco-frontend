'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PREVIEW_ZOOM_MAX,
  PREVIEW_ZOOM_MIN,
  PREVIEW_ZOOM_STEP,
  useEditorUiStore,
} from '@/stores/editorUiStore';

const PRESETS: { label: string; value: number | 'fit'; shortcut: string }[] = [
  { label: 'Zoom ajusté', value: 'fit', shortcut: 'Shift+ F' },
  { label: 'Zoomer à 50%', value: 0.5, shortcut: 'Shift+ 0' },
  { label: 'Zoomer à 100%', value: 1, shortcut: 'Shift+ 1' },
  { label: 'Zoomer à 200%', value: 2, shortcut: 'Shift+ 2' },
];

export function PreviewZoomMenu() {
  const previewZoom = useEditorUiStore((s) => s.previewZoom);
  const setPreviewZoom = useEditorUiStore((s) => s.setPreviewZoom);
  const [open, setOpen] = useState(false);
  const [draggingSlider, setDraggingSlider] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const zoomFillPct =
    ((previewZoom - PREVIEW_ZOOM_MIN) / (PREVIEW_ZOOM_MAX - PREVIEW_ZOOM_MIN)) * 100;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const applyPreset = useCallback(
    (value: number | 'fit') => {
      setPreviewZoom(value === 'fit' ? 1 : value);
      setOpen(false);
    },
    [setPreviewZoom]
  );

  const pct = Math.round(previewZoom * 100);

  const isPresetActive = (value: number | 'fit') => {
    if (value === 'fit') return Math.abs(previewZoom - 1) < 0.01;
    return Math.abs(previewZoom - value) < 0.01;
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Taille de l’aperçu"
        className={`flex h-8 min-w-[4.5rem] items-center justify-center gap-1 rounded-md px-2.5 text-[13px] font-medium transition-colors ${
          open
            ? 'bg-[#f0f0f0] text-neutral-900'
            : 'bg-[#f0f0f0] text-neutral-800 hover:bg-[#e8e8e8]'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {pct}%
        <span
          className={`text-[10px] leading-none text-neutral-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          ▴
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-[60] mt-1.5 w-[248px] -translate-x-1/2 overflow-hidden rounded-lg border border-[#ebebeb] bg-white py-3 shadow-[0_4px_18px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)]"
        >
          <p className="px-4 pb-2 text-[12px] font-normal text-neutral-500">Taille</p>

          <div className="flex items-center gap-3 px-4 pb-3">
            <div
              className={`preview-zoom-slider-wrap ${draggingSlider ? 'is-active' : ''}`}
              style={{ '--zoom-fill': `${zoomFillPct}%` } as React.CSSProperties}
            >
              <div className="preview-zoom-slider-rail" aria-hidden />
              <div className="preview-zoom-slider-fill" aria-hidden />
              <input
                type="range"
                min={PREVIEW_ZOOM_MIN}
                max={PREVIEW_ZOOM_MAX}
                step={PREVIEW_ZOOM_STEP}
                value={previewZoom}
                onChange={(e) => setPreviewZoom(Number(e.target.value))}
                onPointerDown={() => setDraggingSlider(true)}
                onPointerUp={() => setDraggingSlider(false)}
                onPointerCancel={() => setDraggingSlider(false)}
                onBlur={() => setDraggingSlider(false)}
                className={`preview-zoom-slider appearance-none ${
                  draggingSlider ? 'is-dragging' : ''
                }`}
                aria-label="Zoom aperçu"
              />
            </div>
            <span className="min-w-[44px] shrink-0 rounded-md bg-[#f3f3f3] px-2 py-1 text-center text-[12px] font-medium tabular-nums text-neutral-700">
              {pct}%
            </span>
          </div>

          <ul className="border-t border-[#ebebeb] py-1">
            {PRESETS.map((p) => {
              const active = isPresetActive(p.value);
              return (
                <li key={p.label}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => applyPreset(p.value)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-[#f5f5f5]"
                  >
                    <span
                      className={`text-[13px] ${
                        active ? 'font-semibold text-neutral-900' : 'font-semibold text-neutral-800'
                      }`}
                    >
                      {p.label}
                    </span>
                    <span className="shrink-0 text-[12px] font-normal text-neutral-400">
                      {p.shortcut}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
