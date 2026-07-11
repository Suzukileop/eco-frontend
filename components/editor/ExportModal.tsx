'use client';

import { useState, useCallback } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { exportComposition, getExportStatus, saveComposition } from '@/lib/compositions';
import { getApiErrorMessage } from '@/lib/api-error';

interface ExportModalProps {
  compositionId: string;
  onClose: () => void;
}

type Step = 'confirm' | 'exporting' | 'done' | 'failed';

const EXPORT_MESSAGES = [
  '📋 Composition envoyée…',
  '⚙️ FFmpeg en cours de rendu…',
  '☁️ Upload vers R2…',
];

export function ExportModal({ compositionId, onClose }: ExportModalProps) {
  const { composition } = useCompositionStore();
  const [step, setStep] = useState<Step>('confirm');
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);

  const handleExport = useCallback(async () => {
    setStep('exporting');
    setMsgIdx(0);

    try {
      // Flush latest composition state to backend before triggering render
      if (composition) {
        await saveComposition(compositionId, {
          title: composition.title ?? 'Export',
          compositionJson: composition,
          format: composition.format ?? '9:16',
          durationSeconds: composition.duration ?? 0,
        });
      }

      await exportComposition(compositionId);
      window.dispatchEvent(new Event('credits-updated'));

      // Cycle through messages while polling
      const msgInterval = setInterval(() => {
        setMsgIdx((i) => Math.min(i + 1, EXPORT_MESSAGES.length - 1));
      }, 4000);

      // Poll for status
      for (let i = 0; i < 120; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const status = await getExportStatus(compositionId);
        if (status.status === 'done' && status.exportUrl) {
          clearInterval(msgInterval);
          setExportUrl(status.exportUrl);
          setStep('done');
          return;
        }
        if (status.status === 'failed') {
          clearInterval(msgInterval);
          setError('L\'export a échoué. Vos crédits ont été remboursés.');
          setStep('failed');
          return;
        }
      }

      clearInterval(msgInterval);
      setError('Délai d\'attente dépassé. Veuillez réessayer.');
      setStep('failed');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de lancer l\'export.'));
      setStep('failed');
    }
  }, [compositionId, composition]);

  const clipCount =
    (composition?.tracks.background.length ?? 0) +
    (composition?.tracks.text.length ?? 0) +
    (composition?.tracks.audio.length ?? 0) +
    (composition?.tracks.overlay.length ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          ✕
        </button>

        {step === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Exporter la composition</h2>
            <div className="rounded-xl bg-gray-700/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Durée</span>
                <span className="text-white font-semibold">{Math.round(composition?.duration ?? 0)}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Format</span>
                <span className="text-white font-semibold">{composition?.format}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Clips</span>
                <span className="text-white font-semibold">{clipCount}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-600 pt-2 mt-2">
                <span className="text-amber-400 font-semibold">Coût</span>
                <span className="text-amber-400 font-bold">-30 crédits</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleExport()}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
            >
              Confirmer l&apos;export
            </button>
          </div>
        )}

        {step === 'exporting' && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
            <div>
              <p className="text-white font-semibold">{EXPORT_MESSAGES[msgIdx]}</p>
              <p className="text-xs text-gray-400 mt-1">Cela peut prendre quelques minutes…</p>
            </div>
          </div>
        )}

        {step === 'done' && exportUrl && (
          <div className="space-y-4 text-center">
            <p className="text-3xl">✅</p>
            <h2 className="text-lg font-bold text-white">Vidéo prête !</h2>
            <video controls src={exportUrl} className="w-full rounded-xl border border-gray-600">
              <track kind="captions" />
            </video>
            <div className="flex gap-2">
              <a
                href={exportUrl}
                download
                className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-500 text-center transition-colors"
              >
                📥 Télécharger
              </a>
              <button
                type="button"
                onClick={() => { void navigator.clipboard.writeText(exportUrl); }}
                className="flex-1 rounded-xl bg-gray-700 py-2 text-sm font-bold text-white hover:bg-gray-600 transition-colors"
              >
                📱 Copier le lien
              </button>
            </div>
          </div>
        )}

        {step === 'failed' && (
          <div className="space-y-4 text-center">
            <p className="text-3xl">❌</p>
            <h2 className="text-lg font-bold text-white">Échec de l&apos;export</h2>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-gray-700 py-2 text-sm font-bold text-white hover:bg-gray-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
