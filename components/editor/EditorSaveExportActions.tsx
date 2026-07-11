'use client';

import type { Ref } from 'react';
import type { ExportPhase } from '@/hooks/useCompositionExport';

interface EditorSaveExportActionsProps {
  onSave: () => Promise<void>;
  onExport: () => void;
  exportButtonRef?: Ref<HTMLButtonElement>;
  lastSaved: Date | null;
  saving: boolean;
  exportUrl?: string | null;
  exportProgress?: number;
  exportPhase?: ExportPhase;
  variant?: 'light' | 'dark';
  exportDisabled?: boolean;
  saveDisabled?: boolean;
}

function ExportProgressRing({ progress }: { progress: number }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="-rotate-90 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" opacity={0.25} />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-150"
      />
    </svg>
  );
}

export function EditorSaveExportActions({
  onSave,
  onExport,
  exportButtonRef,
  lastSaved,
  saving,
  exportUrl,
  exportProgress = 0,
  exportPhase = 'idle',
  variant = 'light',
  exportDisabled = false,
  saveDisabled = false,
}: EditorSaveExportActionsProps) {
  const timeSince = lastSaved
    ? Math.round((Date.now() - lastSaved.getTime()) / 1000)
    : null;

  const savedLabel =
    saving
      ? 'Sauvegarde…'
      : timeSince !== null
        ? timeSince < 5
          ? 'Sauvegardé ✓'
          : `Sauvegardé il y a ${timeSince}s`
        : null;

  const isLight = variant === 'light';
  const isExporting = exportPhase === 'exporting';
  const isDone = exportPhase === 'done';

  return (
    <div className="flex items-center gap-2 shrink-0">
      {savedLabel && (
        <span
          className={`text-xs hidden xl:block whitespace-nowrap ${
            isLight ? 'text-neutral-500' : 'text-neutral-400'
          }`}
        >
          {savedLabel}
        </span>
      )}

      {exportUrl && !isExporting && (
        <a
          href={exportUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className={
            isLight
              ? 'rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-200 transition-colors'
              : 'rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-100 hover:bg-neutral-700 transition-colors'
          }
        >
          ⬇ Télécharger
        </a>
      )}

      <button
        type="button"
        onClick={() => void onSave()}
        disabled={saving || isExporting || saveDisabled}
        className={
          isLight
            ? 'rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60 transition-colors'
            : 'rounded-lg border border-neutral-600 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-100 hover:bg-neutral-800 disabled:opacity-60 transition-colors'
        }
      >
        Sauvegarder
      </button>

      <button
        ref={exportButtonRef}
        type="button"
        onClick={onExport}
        disabled={isExporting || exportDisabled}
        className={`relative min-w-[6.5rem] overflow-hidden rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
          isExporting || isDone
            ? 'bg-cyan-500 text-white shadow-sm'
            : isLight
              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
              : 'bg-white text-neutral-900 hover:bg-neutral-100'
        } disabled:cursor-default`}
        aria-busy={isExporting}
      >
        {isExporting && (
          <span
            className="absolute inset-y-0 left-0 bg-cyan-600/40 transition-[width] duration-150 ease-linear"
            style={{ width: `${exportProgress}%` }}
            aria-hidden
          />
        )}
        <span className="relative z-[1] inline-flex items-center justify-center gap-1.5">
          {isExporting ? (
            <>
              <ExportProgressRing progress={exportProgress} />
              <span className="tabular-nums">{exportProgress}%</span>
            </>
          ) : isDone ? (
            <>✓ Exporté</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 3v12M7 8l5 5 5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Exporter
            </>
          )}
        </span>
      </button>
    </div>
  );
}
