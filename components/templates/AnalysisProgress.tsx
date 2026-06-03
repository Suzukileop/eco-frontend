'use client';

import type { AnalysisStatus, ProcessingStage, VideoAnalysisResponse } from '@/types/templates';

const STEPS: { id: ProcessingStage; label: string }[] = [
  { id: 'FETCHING_MEDIA', label: '🔗 Récupération de la vidéo...' },
  { id: 'GROK_ANALYSIS', label: '🤖 Grok analyse la vidéo séquence par séquence...' },
  { id: 'GENERATING_IMAGES', label: '🎨 Nano Banana génère les fonds pour chaque séquence...' },
  { id: 'FINALIZING', label: '✅ Finalisation...' },
];

function activeStepIndex(analysis: VideoAnalysisResponse): number {
  if (analysis.processingStage) {
    const idx = STEPS.findIndex((s) => s.id === analysis.processingStage);
    if (idx >= 0) return idx;
  }
  if (analysis.status === 'PENDING') return 0;
  if (analysis.status === 'PROCESSING') {
    if ((analysis.segmentsCount ?? 0) > 0) return 2;
    return 1;
  }
  return 3;
}

function stepState(
  index: number,
  active: number,
  status: AnalysisStatus
): 'done' | 'active' | 'pending' {
  if (status === 'DONE') return 'done';
  if (index < active) return 'done';
  if (index === active) return 'active';
  return 'pending';
}

export function AnalysisProgress({ analysis }: { analysis: VideoAnalysisResponse }) {
  const active = activeStepIndex(analysis);

  return (
    <section
      className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm"
      aria-live="polite"
      aria-busy={analysis.status !== 'DONE'}
    >
      <h2 className="text-lg font-semibold text-gray-900">Analyse en cours</h2>
      <p className="mt-1 text-sm text-gray-600">
        Cela peut prendre plusieurs minutes selon la durée de la vidéo.
      </p>
      <ol className="mt-6 space-y-4">
        {STEPS.map((step, index) => {
          const state = stepState(index, active, analysis.status);
          return (
            <li key={step.id} className="flex items-start gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                  state === 'done'
                    ? 'bg-teal-600 text-white'
                    : state === 'active'
                      ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-500'
                      : 'bg-gray-100 text-gray-400'
                }`}
                aria-hidden
              >
                {state === 'done' ? '✓' : index + 1}
              </span>
              <span
                className={`flex-1 text-sm ${
                  state === 'active'
                    ? 'font-semibold text-teal-900'
                    : state === 'done'
                      ? 'text-gray-700'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
                {state === 'active' && (
                  <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent align-middle" />
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {typeof analysis.segmentsCount === 'number' && analysis.segmentsCount > 0 && (
        <p className="mt-4 text-xs text-gray-500">
          {analysis.segmentsCount} séquence{analysis.segmentsCount > 1 ? 's' : ''} détectée
          {analysis.segmentsCount > 1 ? 's' : ''} jusqu&apos;ici…
        </p>
      )}
    </section>
  );
}
