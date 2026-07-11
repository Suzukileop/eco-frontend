'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import {
  applyCapcutFormatMenuItem,
  CAPCUT_FORMAT_MENU,
  formatDisplayLabel,
  getActiveCapcutMenuId,
  getAspectRatio,
  type CapcutFormatMenuItem,
} from '@/lib/formatPresets';
import type { Format } from '@/types/composition';

/** Bleu coche CapCut */
const CAPCUT_CHECK = '#00cae0';

/** Survol zones format — teinte fond preview (voir globals.css) */
const FORMAT_ZONE_HOVER = 'preview-workspace-hover rounded-[6px] transition-colors';

/** Icône cadre ratio (réf. CapCut) */
function CapcutAspectIcon({
  w,
  h,
  box = 22,
}: {
  w: number;
  h: number;
  box?: number;
}) {
  const ratio = w / h;
  let innerW = box - 4;
  let innerH = box - 4;
  if (ratio > 1) {
    innerH = innerW / ratio;
  } else {
    innerW = innerH * ratio;
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: box, height: box }}
      aria-hidden
    >
      <span
        className="rounded-[1px] border border-neutral-400/60 bg-transparent"
        style={{ width: innerW, height: innerH }}
      />
    </span>
  );
}

function SocialIcon({ id, size = 14 }: { id: NonNullable<CapcutFormatMenuItem['social']>; size?: number }) {
  const cls = 'shrink-0 text-neutral-800';
  const s = size;
  if (id === 'tiktok') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.16 8.16 0 0 0 4.77 1.52V6.6a4.85 4.85 0 0 1-1-.09z" />
      </svg>
    );
  }
  if (id === 'youtube') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .6 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.3.6 9.3.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    );
  }
  if (id === 'instagram') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    );
  }
  if (id === 'linkedin') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 4.126 0 2.062 2.062 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.02 10.13 11.9v-8.41H7.08v-3.49h3.05V9.41c0-3.01 1.79-4.68 4.53-4.68 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.41C19.61 23.09 24 18.09 24 12.07z" />
    </svg>
  );
}

function triggerSocialForFormat(format: Format, customW?: number, customH?: number) {
  const id = getActiveCapcutMenuId(format, customW, customH);
  if (!id) return null;
  return CAPCUT_FORMAT_MENU.find((m) => m.id === id)?.social ?? null;
}

function CapcutCheckIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <path
        d="M5 13l4.5 4.5L19.5 7"
        stroke={CAPCUT_CHECK}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Sélecteur format CapCut — fixé en haut à gauche de la zone preview (hors scroll).
 * Parent : overlay `absolute inset-0` dans StudioPreview.
 */
export function PreviewFormatPicker() {
  const { format, composition, setFormat, setCustomAspect } = useCompositionStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeId = getActiveCapcutMenuId(format, composition?.customAspectW, composition?.customAspectH);
  const { w: aspectW, h: aspectH } = getAspectRatio(
    format,
    composition?.customAspectW,
    composition?.customAspectH
  );
  const label = formatDisplayLabel(format, composition?.customAspectW, composition?.customAspectH);
  const triggerSocial = triggerSocialForFormat(
    format,
    composition?.customAspectW,
    composition?.customAspectH
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selectItem = useCallback(
    (item: CapcutFormatMenuItem) => {
      applyCapcutFormatMenuItem(item, setFormat, setCustomAspect);
      setOpen(false);
    },
    [setFormat, setCustomAspect]
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-auto absolute left-2 top-2 z-[50]"
      data-preview-format-picker
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Pastille déclencheur CapCut : zone format (hover gris) + logo en bas */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex min-w-[56px] flex-col rounded-[10px] bg-white p-2 shadow-[0_1px_6px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_2px_10px_rgba(0,0,0,0.12)] ${
          open ? 'ring-1 ring-neutral-200' : ''
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Format du cadre"
      >
        <span
          className={`flex w-full flex-col items-center px-1.5 pb-1 pt-1.5 ${FORMAT_ZONE_HOVER}`}
        >
          <CapcutAspectIcon w={aspectW} h={aspectH} box={24} />
          <span className="mt-1 text-[13px] font-bold leading-tight tracking-tight text-neutral-900">
            {label}
          </span>
        </span>
        {triggerSocial ? (
          <span className="flex w-full justify-center px-1.5 pb-1 pt-4">
            <SocialIcon id={triggerSocial} size={13} />
          </span>
        ) : (
          <span className="h-[13px] pb-1" aria-hidden />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-full top-0 z-[60] ml-2 w-[252px] overflow-hidden rounded-[10px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.14)]"
        >
          <div className="border-b border-neutral-100 px-4 py-2">
            <div
              className={`flex items-center gap-3 px-1 py-2 ${FORMAT_ZONE_HOVER}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border border-dashed border-neutral-300/90 bg-white">
                <CapcutAspectIcon w={aspectW} h={aspectH} box={18} />
              </span>
              <span className="text-[13px] font-medium leading-tight text-neutral-700">
                Format d&apos;origine
              </span>
            </div>
          </div>

          <ul className="max-h-[min(420px,calc(100vh-12rem))] overflow-y-auto px-3 pb-2.5 pt-1.5">
            {CAPCUT_FORMAT_MENU.map((item) => {
              const active = activeId === item.id;
              return (
                <li key={item.id} className="py-0.5">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => selectItem(item)}
                    className={`flex w-full items-center gap-3 px-3 py-[11px] text-left ${FORMAT_ZONE_HOVER}`}
                  >
                    <CapcutAspectIcon w={item.aspectW} h={item.aspectH} box={24} />
                    <div className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold leading-snug text-neutral-900">
                        {item.ratioLabel}
                      </span>
                      {item.subtitle ? (
                        <span className="mt-0.5 block truncate text-[12px] leading-snug text-neutral-400">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </div>
                    {active ? <CapcutCheckIcon /> : <span className="w-4 shrink-0" aria-hidden />}
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
