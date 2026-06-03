'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { FormatPickerExpandable } from '@/components/editor/FormatPickerExpandable';
import { PreviewToolsBar } from '@/components/editor/PreviewToolsBar';
import { PreviewZoomMenu } from '@/components/editor/PreviewZoomMenu';
import {
  enterBrowserFullscreen,
  exitBrowserFullscreen,
  useEditorUiStore,
} from '@/stores/editorUiStore';

interface EditorTopBarProps {
  analysisId: string;
  onSave: () => Promise<void>;
  onExport: () => void;
  lastSaved: Date | null;
  saving: boolean;
}

export function EditorTopBar({
  analysisId,
  onSave,
  onExport,
  lastSaved,
  saving,
}: EditorTopBarProps) {
  const {
    composition,
    currentTime,
    selectedClipId,
    exportUrl,
    splitClip,
    addTextClip,
  } = useCompositionStore();
  const focusMode = useEditorUiStore((s) => s.focusMode);
  const deepFocusMode = useEditorUiStore((s) => s.deepFocusMode);
  const setFocusMode = useEditorUiStore((s) => s.setFocusMode);
  const setDeepFocusMode = useEditorUiStore((s) => s.setDeepFocusMode);
  const toggleFocusMode = useEditorUiStore((s) => s.toggleFocusMode);
  const focusClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editingTitle, setEditingTitle] = useState(false);

  const handleFocusClick = () => {
    if (focusClickTimer.current) clearTimeout(focusClickTimer.current);
    focusClickTimer.current = setTimeout(() => {
      toggleFocusMode();
      focusClickTimer.current = null;
    }, 280);
  };

  const handleFocusDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (focusClickTimer.current) {
      clearTimeout(focusClickTimer.current);
      focusClickTimer.current = null;
    }
    void (async () => {
      if (deepFocusMode || document.fullscreenElement) {
        await exitBrowserFullscreen();
        setDeepFocusMode(false);
        setFocusMode(false);
        return;
      }
      setFocusMode(true);
      setDeepFocusMode(true);
      try {
        await enterBrowserFullscreen();
      } catch {
        setDeepFocusMode(false);
      }
    })();
  };
  const [titleValue, setTitleValue] = useState(composition?.title ?? 'Ma composition');

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (composition && titleValue.trim()) {
      useCompositionStore.getState().setComposition({ ...composition, title: titleValue.trim() });
    }
  };

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

  const handleSplit = () => {
    if (selectedClipId) {
      splitClip(selectedClipId, currentTime);
    } else {
      const allC = [
        ...(composition?.tracks.background ?? []),
        ...(composition?.tracks.text ?? []),
        ...(composition?.tracks.audio ?? []),
        ...(composition?.tracks.overlay ?? []),
      ];
      const active = allC.find(
        (c) => c.startTime < currentTime && c.endTime > currentTime
      );
      if (active) splitClip(active.id, currentTime);
    }
  };

  return (
    <div className="flex h-12 items-center justify-between border-b border-neutral-200 bg-white px-3 gap-2 shadow-sm">
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <Link
          href={`/dashboard/templates/${analysisId}`}
          className="shrink-0 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          ← Retour
        </Link>
        <span className="shrink-0 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Éditeur
        </span>
        {editingTitle ? (
          <input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleBlur(); }}
            className="bg-neutral-50 text-neutral-900 text-sm font-semibold rounded-md px-2 py-0.5 border border-neutral-300 focus:outline-none focus:border-neutral-500 w-36"
          />
        ) : (
          <button
            type="button"
            onClick={() => { setTitleValue(composition?.title ?? 'Ma composition'); setEditingTitle(true); }}
            className="text-sm font-semibold text-neutral-900 hover:text-neutral-600 truncate max-w-36"
            title="Cliquer pour renommer"
          >
            {composition?.title ?? 'Ma composition'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-1.5 py-1 border border-neutral-200">
        <FormatPickerExpandable />

        <button
          type="button"
          onClick={() => addTextClip(currentTime, currentTime + 5)}
          title="Nouveau texte Konva"
          className="flex h-8 min-w-[2.5rem] items-center justify-center rounded-md px-2 text-xs font-bold text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
        >
          T+
        </button>
        <button
          type="button"
          onClick={handleSplit}
          title="Couper le clip au playhead (S)"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
          aria-label="Couper au playhead"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 4v16" />
            <path d="M18 4v16" />
            <path d="M6 12h12" />
          </svg>
        </button>

        <span className="mx-0.5 h-5 w-px bg-neutral-300" aria-hidden />

        <PreviewToolsBar />

        <PreviewZoomMenu />
      </div>

      <button
        type="button"
        onClick={handleFocusClick}
        onDoubleClick={handleFocusDoubleClick}
        title={
          deepFocusMode
            ? 'Double-clic : quitter le plein écran'
            : focusMode
              ? 'Clic : quitter le focus · Double-clic : plein écran total'
              : 'Clic : masquer la navigation · Double-clic : plein écran total'
        }
        aria-label={
          deepFocusMode ? 'Quitter le plein écran' : focusMode ? 'Quitter le mode focus' : 'Mode focus'
        }
        aria-pressed={focusMode || deepFocusMode}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
          deepFocusMode || focusMode
            ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm'
            : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-800'
        }`}
      >
        {focusMode ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L5 5M5 5v3M5 5h3M15 9l4-4m0 0v3m0-3h-3M9 15l-4 4m0 0h3m-3 0v-3M15 15l4 4m0 0h-3m3 0v-3" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        )}
      </button>

      <div className="flex items-center gap-2 shrink-0">
        {savedLabel && (
          <span className="text-xs text-neutral-500 hidden xl:block">{savedLabel}</span>
        )}

        {exportUrl && (
          <a
            href={exportUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-200 transition-colors"
          >
            ⬇ Télécharger
          </a>
        )}

        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60 transition-colors"
        >
          Sauvegarder
        </button>
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
        >
          Exporter
        </button>
      </div>
    </div>
  );
}
