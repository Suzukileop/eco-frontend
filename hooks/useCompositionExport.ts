'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { exportComposition, getExportStatus, saveComposition } from '@/lib/compositions';
import { getApiErrorMessage } from '@/lib/api-error';
import type { ExportSettings } from '@/lib/exportSettings';
import { sanitizeExportFileName } from '@/lib/exportSettings';

export type ExportPhase = 'idle' | 'exporting' | 'done' | 'failed';

const PROGRESS_TICK_MS = 100;

export function useCompositionExport(compositionId: string | null) {
  const composition = useCompositionStore((s) => s.composition);
  const setExportStatus = useCompositionStore((s) => s.setExportStatus);
  const setExportUrl = useCompositionStore((s) => s.setExportUrl);

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportPhase, setExportPhase] = useState<ExportPhase>('idle');
  const [exportError, setExportError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const creepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetProgressRef = useRef(1);
  const pendingDoneUrlRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const stopProgressAnimation = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (creepRef.current) {
      clearInterval(creepRef.current);
      creepRef.current = null;
    }
  }, []);

  const startProgressAnimation = useCallback(() => {
    stopProgressAnimation();
    targetProgressRef.current = 1;
    pendingDoneUrlRef.current = null;
    setExportProgress(1);

    tickRef.current = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) return 100;
        const target = targetProgressRef.current;
        return prev < target ? prev + 1 : prev;
      });
    }, PROGRESS_TICK_MS);

    creepRef.current = setInterval(() => {
      if (targetProgressRef.current < 95) {
        targetProgressRef.current += 1;
      }
    }, 2000);
  }, [stopProgressAnimation]);

  const finishExport = useCallback((exportUrl: string) => {
    pendingDoneUrlRef.current = exportUrl;
    targetProgressRef.current = 100;
  }, []);

  useEffect(() => {
    if (exportProgress < 100 || !pendingDoneUrlRef.current) return;

    const exportUrl = pendingDoneUrlRef.current;
    pendingDoneUrlRef.current = null;
    stopProgressAnimation();
    setExportPhase('done');
    setExportStatus('done');
    setExportUrl(exportUrl);
    const resetTimer = window.setTimeout(() => {
      setExportPhase('idle');
      setExportProgress(0);
    }, 2500);
    return () => window.clearTimeout(resetTimer);
  }, [exportProgress, setExportStatus, setExportUrl, stopProgressAnimation]);

  useEffect(() => {
    return () => {
      stopPolling();
      stopProgressAnimation();
    };
  }, [stopPolling, stopProgressAnimation]);

  const openExportPanel = useCallback(() => {
    if (exportPhase === 'exporting') return;
    setExportError(null);
    setShowExportPanel(true);
  }, [exportPhase]);

  const closeExportPanel = useCallback(() => {
    if (exportPhase === 'exporting') return;
    setShowExportPanel(false);
  }, [exportPhase]);

  const startExport = useCallback(
    async (settings: ExportSettings) => {
      if (!compositionId || !composition) return;

      setShowExportPanel(false);
      setExportPhase('exporting');
      setExportError(null);
      setExportStatus('exporting');
      setExportUrl(null);
      stopPolling();
      startProgressAnimation();

      const fileName = sanitizeExportFileName(settings.fileName);

      try {
        await saveComposition(compositionId, {
          title: composition.title ?? fileName,
          compositionJson: composition,
          format: composition.format ?? '9:16',
          durationSeconds: composition.duration ?? 0,
        });

        await exportComposition(compositionId, {
          fileName,
          resolution: settings.resolution,
          quality: settings.quality,
          fps: settings.fps,
          format: settings.format,
        });

        window.dispatchEvent(new Event('credits-updated'));

        pollRef.current = setInterval(async () => {
          try {
            const status = await getExportStatus(compositionId);
            const serverProgress = Math.max(1, Math.min(99, status.progress ?? 1));
            targetProgressRef.current = Math.max(targetProgressRef.current, serverProgress);

            if (status.status === 'done' && status.exportUrl) {
              stopPolling();
              finishExport(status.exportUrl);
            } else if (status.status === 'failed') {
              stopPolling();
              stopProgressAnimation();
              setExportPhase('failed');
              setExportStatus('failed');
              setExportError("L'export a échoué. Vos crédits ont été remboursés.");
              setExportProgress(0);
            }
          } catch {
            /* ignore poll errors */
          }
        }, 2500);

        const status = await getExportStatus(compositionId);
        targetProgressRef.current = Math.max(
          targetProgressRef.current,
          Math.max(1, Math.min(99, status.progress ?? 1))
        );
      } catch (e) {
        stopPolling();
        stopProgressAnimation();
        setExportPhase('failed');
        setExportStatus('failed');
        setExportError(getApiErrorMessage(e, "Impossible de lancer l'export."));
        setExportProgress(0);
      }
    },
    [
      compositionId,
      composition,
      setExportStatus,
      setExportUrl,
      stopPolling,
      startProgressAnimation,
      stopProgressAnimation,
      finishExport,
    ]
  );

  return {
    showExportPanel,
    openExportPanel,
    closeExportPanel,
    startExport,
    exportProgress,
    exportPhase,
    exportError,
    clearExportError: () => setExportError(null),
  };
}
