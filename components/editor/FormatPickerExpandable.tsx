'use client';

import { useState } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { SOCIAL_FORMAT_PRESETS, STANDARD_FORMATS } from '@/lib/formatPresets';

function SocialIcon({ id }: { id: 'tiktok' | 'youtube' | 'facebook' }) {
  if (id === 'tiktok') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.16 8.16 0 0 0 4.77 1.52V6.6a4.85 4.85 0 0 1-1-.09z" />
      </svg>
    );
  }
  if (id === 'youtube') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .6 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.3.6 9.3.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.02 10.13 11.9v-8.41H7.08v-3.49h3.05V9.41c0-3.01 1.79-4.68 4.53-4.68 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.41C19.61 23.09 24 18.09 24 12.07z" />
    </svg>
  );
}

export function FormatPickerExpandable() {
  const { format, composition, setFormat, setCustomAspect } = useCompositionStore();
  const [open, setOpen] = useState(false);
  const [customW, setCustomW] = useState(String(composition?.customAspectW ?? 9));
  const [customH, setCustomH] = useState(String(composition?.customAspectH ?? 16));

  const applyCustom = () => {
    const w = parseInt(customW, 10);
    const h = parseInt(customH, 10);
    if (w > 0 && h > 0) setCustomAspect(w, h);
  };

  return (
    <div className="relative flex items-center gap-0.5">
      {STANDARD_FORMATS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => setFormat(f.value)}
          className={`min-w-[2.5rem] rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            format === f.value
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'
          }`}
        >
          {f.label}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 min-w-[2rem] items-center justify-center gap-0.5 rounded-md px-1.5 text-xs font-semibold transition-colors ${
          open || format === 'custom'
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'
        }`}
        title="Format libre et réseaux sociaux"
        aria-expanded={open}
      >
        <span>+</span>
        <span className="text-[9px]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[240px] rounded-lg border border-neutral-200 bg-white p-2.5 shadow-lg">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Format libre
            </p>
            <div className="mb-3 flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={10000}
                value={customW}
                onChange={(e) => setCustomW(e.target.value)}
                className="w-14 rounded border border-neutral-300 px-1.5 py-1 text-xs text-neutral-900"
                aria-label="Largeur ratio"
              />
              <span className="text-xs text-neutral-400">:</span>
              <input
                type="number"
                min={1}
                max={10000}
                value={customH}
                onChange={(e) => setCustomH(e.target.value)}
                className="w-14 rounded border border-neutral-300 px-1.5 py-1 text-xs text-neutral-900"
                aria-label="Hauteur ratio"
              />
              <button
                type="button"
                onClick={() => {
                  applyCustom();
                  setOpen(false);
                }}
                className="rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-semibold text-white"
              >
                OK
              </button>
            </div>

            <div className="rounded-md bg-neutral-100 px-3 py-2.5">
              <div className="flex items-center justify-center gap-4">
                {SOCIAL_FORMAT_PRESETS.map((s) => {
                  const active = format === s.format;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      title={s.hint}
                      aria-label={`${s.label} — ${s.hint}`}
                      onClick={() => {
                        setFormat(s.format);
                        setOpen(false);
                      }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        active
                          ? 'border-neutral-400 bg-white text-neutral-900 shadow-sm'
                          : 'border-neutral-200/80 bg-white/90 text-neutral-600 hover:border-neutral-300 hover:bg-white hover:text-neutral-900'
                      }`}
                    >
                      <SocialIcon id={s.id} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
