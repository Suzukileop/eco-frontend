'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PREVIEW_ZOOM_MAX,
  PREVIEW_ZOOM_MIN,
  PREVIEW_ZOOM_STEP,
  useEditorUiStore,
} from '@/stores/editorUiStore';

const PRESETS: { label: string; value: number | 'fit' }[] = [
  { label: 'Zoom ajusté', value: 'fit' },
  { label: '50 %', value: 0.5 },
  { label: '100 %', value: 1 },
  { label: '200 %', value: 2 },
];

export function PreviewZoomMenu() {
  const previewZoom = useEditorUiStore((s) => s.previewZoom);
  const setPreviewZoom = useEditorUiStore((s) => s.setPreviewZoom);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Zoom de l’aperçu"
        className={`flex h-8 min-w-[3.25rem] items-center justify-center gap-0.5 rounded-md px-2 text-xs font-semibold transition-colors ${
          open
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {pct}%
        <span className="text-[10px] opacity-70" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-[60] mt-1.5 w-52 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg"
        >
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Taille aperçu
          </p>
          <div className="px-3 pb-2">
            <input
              type="range"
              min={PREVIEW_ZOOM_MIN}
              max={PREVIEW_ZOOM_MAX}
              step={PREVIEW_ZOOM_STEP}
              value={previewZoom}
              onChange={(e) => setPreviewZoom(Number(e.target.value))}
              className="w-full h-1.5 cursor-pointer accent-neutral-900"
              aria-label="Zoom aperçu"
            />
            <p className="mt-1 text-center text-[10px] tabular-nums text-neutral-500">{pct} %</p>
          </div>
          <ul className="border-t border-neutral-100 py-1">
            {PRESETS.map((p) => (
              <li key={p.label}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => applyPreset(p.value)}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-neutral-100 ${
                    (p.value === 'fit' && previewZoom === 1) ||
                    (typeof p.value === 'number' && Math.abs(previewZoom - p.value) < 0.01)
                      ? 'font-semibold text-neutral-900'
                      : 'text-neutral-600'
                  }`}
                >
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
