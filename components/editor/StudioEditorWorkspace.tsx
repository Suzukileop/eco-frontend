'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import {
  exitBrowserFullscreen,
  useEditorUiStore,
} from '@/stores/editorUiStore';
import { EditorTopBar } from '@/components/editor/EditorTopBar';
import { StudioPreview } from '@/components/studio/StudioPreview';
import { PlaybackControls } from '@/components/editor/PlaybackControls';
import { Timeline } from '@/components/editor/Timeline';
import { RightPanel } from '@/components/editor/RightPanel';
import { ExportSettingsPanel } from '@/components/editor/ExportSettingsPanel';
import { useCompositionExport } from '@/hooks/useCompositionExport';
import { PreviewFullscreen } from '@/components/editor/PreviewFullscreen';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getAnalysis } from '@/lib/templates';
import { createComposition, listCompositions } from '@/lib/compositions';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import type { VideoAnalysisResponse } from '@/types/templates';
import type { Composition } from '@/types/composition';
import { PREVIEW_PLAYBACK_BAR_H } from '@/lib/previewLayout';
import {
  STANDALONE_EDITOR_ANALYSIS_ID,
  createBlankComposition,
  createBlankEditorAnalysis,
} from '@/lib/studio/blankEditor';

const EDITOR_TOP_BAR_H = 48;
const PLAYBACK_BAR_H = PREVIEW_PLAYBACK_BAR_H;
const MIN_TIMELINE_H = 120;

type StudioEditorWorkspaceProps = {
  analysisId?: string;
  standalone?: boolean;
};

export function StudioEditorWorkspace({
  analysisId = '',
  standalone = false,
}: StudioEditorWorkspaceProps) {
  const { initFromAnalysis, setComposition, setCompositionId, compositionId } =
    useCompositionStore();
  const editorRequestExpandRightPanel = useCompositionStore((s) => s.editorRequestExpandRightPanel);
  const consumeEditorRequestExpandRightPanel = useCompositionStore(
    (s) => s.consumeEditorRequestExpandRightPanel
  );

  const [analysis, setAnalysis] = useState<VideoAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    showExportPanel,
    openExportPanel,
    closeExportPanel,
    startExport,
    exportProgress,
    exportPhase,
    exportError,
    clearExportError,
  } = useCompositionExport(standalone ? null : compositionId);
  const focusMode = useEditorUiStore((s) => s.focusMode);
  const deepFocusMode = useEditorUiStore((s) => s.deepFocusMode);
  const setFocusMode = useEditorUiStore((s) => s.setFocusMode);
  const setDeepFocusMode = useEditorUiStore((s) => s.setDeepFocusMode);
  const previewFullscreen = useEditorUiStore((s) => s.previewFullscreen);

  useEffect(() => {
    return () => {
      setFocusMode(false);
      setDeepFocusMode(false);
      void exitBrowserFullscreen();
    };
  }, [setFocusMode, setDeepFocusMode]);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setDeepFocusMode(false);
        setFocusMode(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [setFocusMode, setDeepFocusMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (document.fullscreenElement) {
        void exitBrowserFullscreen();
        return;
      }
      if (focusMode || deepFocusMode) {
        setDeepFocusMode(false);
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusMode, deepFocusMode, setFocusMode, setDeepFocusMode]);

  useEffect(() => {
    document.body.style.overflow = focusMode || deepFocusMode ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [focusMode, deepFocusMode]);

  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const maxTimelineHeightRef = useRef(400);
  const [workspaceSize, setWorkspaceSize] = useState({ width: 0, height: 0 });
  const [timelineHeight, setTimelineHeight] = useState(280);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(360);
  const resizeStartY = useRef<number | null>(null);
  const resizeStartHeight = useRef<number>(0);
  const rightResizeStartX = useRef<number | null>(null);
  const rightResizeStartW = useRef<number>(360);

  const syncWorkspaceMetrics = useCallback(() => {
    const el = workspaceRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (h <= 0) return;
    setWorkspaceSize({ width: w, height: h });
    const maxTimeline = Math.max(MIN_TIMELINE_H, Math.floor(h * 0.5) - PLAYBACK_BAR_H);
    maxTimelineHeightRef.current = maxTimeline;
    setTimelineHeight((prev) => Math.min(prev, maxTimeline));
  }, []);

  const previewFitBounds =
    workspaceSize.width > 0 && workspaceSize.height > 0
      ? { width: workspaceSize.width, height: workspaceSize.height }
      : undefined;

  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;
    syncWorkspaceMetrics();
    const ro = new ResizeObserver(() => syncWorkspaceMetrics());
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncWorkspaceMetrics]);

  const handleTimelineResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = timelineHeight;

    const onMove = (ev: MouseEvent) => {
      if (resizeStartY.current == null) return;
      const delta = resizeStartY.current - ev.clientY;
      const next = Math.max(
        MIN_TIMELINE_H,
        Math.min(maxTimelineHeightRef.current, resizeStartHeight.current + delta)
      );
      setTimelineHeight(next);
    };
    const onUp = () => {
      resizeStartY.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [timelineHeight]);

  const dockHeight = PLAYBACK_BAR_H + timelineHeight;

  const handleRightPanelResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!rightPanelOpen) return;
      e.preventDefault();
      rightResizeStartX.current = e.clientX;
      rightResizeStartW.current = rightPanelWidth;

      const onMove = (ev: MouseEvent) => {
        if (rightResizeStartX.current == null) return;
        const delta = ev.clientX - rightResizeStartX.current;
        const minW = 260;
        const maxW = Math.min(560, Math.floor(window.innerWidth * 0.52));
        const next = Math.max(minW, Math.min(maxW, rightResizeStartW.current + delta));
        setRightPanelWidth(next);
      };
      const onUp = () => {
        rightResizeStartX.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [rightPanelOpen, rightPanelWidth]
  );

  const { save, saving, lastSaved } = useAutoSave(standalone ? null : compositionId);
  useAudioEngine();
  useEditorShortcuts();

  useEffect(() => {
    if (!editorRequestExpandRightPanel) return;
    setRightPanelOpen(true);
    consumeEditorRequestExpandRightPanel();
  }, [editorRequestExpandRightPanel, consumeEditorRequestExpandRightPanel]);

  useEffect(() => {
    if (standalone) {
      setAnalysis(createBlankEditorAnalysis());
      setComposition(createBlankComposition());
      setCompositionId(null);
      setLoading(false);
      return;
    }

    if (!analysisId) return;

    const init = async () => {
      try {
        const a = await getAnalysis(analysisId);
        setAnalysis(a);

        let comp: Awaited<ReturnType<typeof createComposition>> | null = null;
        try {
          const existing = await listCompositions();
          comp = existing.find((c) => c.analysisId === analysisId) ?? null;
        } catch {
          // list may fail
        }

        if (!comp) {
          comp = await createComposition({
            analysisId,
            title: 'Ma composition',
            format: '9:16',
          });
        }

        setCompositionId(comp.id);

        const saved = comp.compositionJson as Composition | null;
        if (saved?.tracks?.background?.length) {
          setComposition(saved);
        } else {
          initFromAnalysis(a);
        }
      } catch {
        setError("Impossible de charger l'éditeur Pro.");
      } finally {
        setLoading(false);
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId, standalone]);

  const handleAnalysisUpdate = useCallback((updated: VideoAnalysisResponse) => {
    setAnalysis(updated);
  }, []);

  const resolvedAnalysisId = standalone ? STANDALONE_EDITOR_ANALYSIS_ID : analysisId;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 p-8">
        <ErrorAlert message={error ?? 'Analyse introuvable.'} />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen items-center justify-center bg-gray-950 lg:hidden">
        <div className="text-center px-8">
          <p className="text-4xl mb-4">🖥️</p>
          <p className="text-white font-semibold text-lg">
            L&apos;éditeur Pro n&apos;est disponible que sur desktop
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Ouvrez cette page sur un écran de 1024px ou plus.
          </p>
        </div>
      </div>

      <div
        className={`hidden lg:grid bg-gray-950 overflow-hidden transition-all duration-300 ease-in-out ${
          focusMode || deepFocusMode ? 'fixed inset-0 z-40 h-[100dvh]' : 'h-screen'
        }`}
        style={{
          gridTemplateRows: `${EDITOR_TOP_BAR_H}px minmax(0, 1fr)`,
          gridTemplateColumns: `${rightPanelOpen ? rightPanelWidth : 36}px 1fr`,
        }}
      >
        <div
          className="relative min-h-0 min-w-0"
          style={{ gridRow: '1 / -1', gridColumn: 1 }}
        >
          <RightPanel
            analysis={analysis}
            compositionId={compositionId}
            onAnalysisUpdate={handleAnalysisUpdate}
            isOpen={rightPanelOpen}
            onToggle={() => setRightPanelOpen((o) => !o)}
            standalone={standalone}
          />
          {rightPanelOpen && (
            <button
              type="button"
              aria-label="Redimensionner le panneau latéral"
              title="Glisser vers la droite pour élargir, vers la gauche pour réduire"
              onMouseDown={handleRightPanelResizeStart}
              className="group absolute right-0 top-0 bottom-0 z-50 w-3 translate-x-1/2 cursor-col-resize border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80"
            >
              <span className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full bg-gray-600/90 shadow-sm transition-colors group-hover:bg-violet-500" />
            </button>
          )}
        </div>

        <div style={{ gridRow: 1, gridColumn: 2 }} className="min-w-0">
          <EditorTopBar
            analysisId={resolvedAnalysisId}
            backHref={standalone ? '/dashboard/home' : `/dashboard/templates/${analysisId}`}
            onSave={save}
            onExport={openExportPanel}
            exportButtonRef={exportButtonRef}
            lastSaved={lastSaved}
            saving={saving}
            exportProgress={exportProgress}
            exportPhase={exportPhase}
            exportDisabled={standalone}
            saveDisabled={standalone}
          />
        </div>

        <div
          ref={workspaceRef}
          className="relative min-h-0 min-w-0 overflow-hidden"
          style={{ gridRow: 2, gridColumn: 2 }}
        >
          {!previewFullscreen && (
            <div className="absolute inset-0 z-0">
              <StudioPreview fitBounds={previewFitBounds} />
            </div>
          )}

          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex flex-col overflow-hidden shadow-[0_-6px_28px_rgba(0,0,0,0.14)]"
            style={{ height: dockHeight }}
          >
            <PlaybackControls />
            <div className="min-h-0 flex-1 overflow-hidden">
              <Timeline onResizeStart={handleTimelineResizeStart} />
            </div>
          </div>
        </div>
      </div>

      {showExportPanel && (
        <ExportSettingsPanel
          anchorRef={exportButtonRef}
          onClose={closeExportPanel}
          onExport={(settings) => void startExport(settings)}
        />
      )}

      {exportError && (
        <div className="fixed bottom-6 right-6 z-[92] max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-red-700">Export échoué</p>
          <p className="mt-1 text-xs text-red-600">{exportError}</p>
          <button
            type="button"
            onClick={clearExportError}
            className="mt-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Fermer
          </button>
        </div>
      )}

      <PreviewFullscreen />
    </>
  );
}
