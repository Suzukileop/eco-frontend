'use client';

import { useLayoutEffect, useMemo, useState, type RefObject } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { resolveClipMediaUrl } from '@/lib/glTransitionMedia';
import {
  defaultExportSettings,
  EXPORT_FORMAT_OPTIONS,
  EXPORT_FPS_OPTIONS,
  EXPORT_QUALITY_OPTIONS,
  EXPORT_RESOLUTION_OPTIONS,
  sanitizeExportFileName,
  type ExportSettings,
} from '@/lib/exportSettings';

interface ExportSettingsPanelProps {
  anchorRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExportSettingsPanel({ anchorRef, onClose, onExport }: ExportSettingsPanelProps) {
  const composition = useCompositionStore((s) => s.composition);
  const currentTime = useCompositionStore((s) => s.currentTime);
  const [settings, setSettings] = useState<ExportSettings>(() =>
    defaultExportSettings(composition?.title)
  );
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const coverSrc = useMemo(() => {
    const bg = composition?.tracks.background ?? [];
    const atPlayhead = bg.find((c) => c.startTime <= currentTime && c.endTime > currentTime);
    const clip = atPlayhead ?? bg[0];
    if (!clip) return undefined;
    return resolveClipMediaUrl(clip) ?? clip.thumbnail ?? clip.url;
  }, [composition, currentTime]);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const panelWidth = Math.min(360, window.innerWidth * 0.92);
      const left = Math.max(8, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 8));
      setPanelStyle({
        top: rect.bottom + 8,
        left,
        width: panelWidth,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef]);

  const patch = (partial: Partial<ExportSettings>) => {
    setSettings((s) => ({ ...s, ...partial }));
  };

  const handleSubmit = () => {
    onExport({
      ...settings,
      fileName: sanitizeExportFileName(settings.fileName),
    });
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[90] bg-black/20"
        aria-label="Fermer les paramètres d'export"
        onClick={onClose}
      />
      <div
        className="fixed z-[91] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-black/15"
        style={panelStyle}
        role="dialog"
        aria-labelledby="export-settings-title"
      >
        <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
            aria-label="Retour"
          >
            <ChevronLeftIcon />
          </button>
          <h2 id="export-settings-title" className="text-base font-semibold text-neutral-900">
            Paramètres d&apos;exportation
          </h2>
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto px-4 py-3 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-neutral-700">Photo de couverture de la vidéo</span>
            <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
              {coverSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[9px] text-neutral-400">
                  —
                </div>
              )}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm text-neutral-700">Nom</span>
            <input
              type="text"
              value={settings.fileName}
              onChange={(e) => patch({ fileName: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-neutral-700">Résolution</span>
            <select
              value={settings.resolution}
              onChange={(e) => patch({ resolution: e.target.value as ExportSettings['resolution'] })}
              className="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-cyan-400"
            >
              {EXPORT_RESOLUTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-neutral-700">Qualité</span>
            <select
              value={settings.quality}
              onChange={(e) => patch({ quality: e.target.value as ExportSettings['quality'] })}
              className="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-cyan-400"
            >
              {EXPORT_QUALITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-neutral-700">Fréquence d&apos;images</span>
            <select
              value={settings.fps}
              onChange={(e) => patch({ fps: Number(e.target.value) as ExportSettings['fps'] })}
              className="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-cyan-400"
            >
              {EXPORT_FPS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-neutral-700">Format</span>
            <select
              value={settings.format}
              onChange={(e) => patch({ format: e.target.value as ExportSettings['format'] })}
              className="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-cyan-400"
            >
              {EXPORT_FORMAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <p className="text-[11px] text-neutral-500 border-t border-neutral-100 pt-2">
            Durée {Math.round(composition?.duration ?? 0)}s · format projet {composition?.format ?? '9:16'} ·
            coût estimé <span className="font-semibold text-amber-600">30 crédits</span>
          </p>
        </div>

        <div className="border-t border-neutral-100 p-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-400"
          >
            Exporter
          </button>
        </div>
      </div>
    </>
  );
}
