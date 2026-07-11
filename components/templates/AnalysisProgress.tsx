'use client';

import type { AnalysisStatus, ProcessingStage, VideoAnalysisResponse } from '@/types/templates';
import { templatesSectionClass } from '@/components/templates/templates-section-ui';

const STEPS: { id: ProcessingStage; label: string }[] = [
  { id: 'FETCHING_MEDIA', label: 'Récupération de la vidéo' },
  { id: 'GROK_ANALYSIS', label: 'Analyse Grok séquence par séquence' },
  { id: 'GENERATING_IMAGES', label: 'Génération des fonds Nano Banana' },
  { id: 'FINALIZING', label: 'Finalisation' },
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
      className={`${templatesSectionClass} border-orange-200/50 bg-gradient-to-br from-orange-50/80 to-white/90 dark:border-orange-500/20 dark:from-orange-500/10 dark:to-neutral-900/85`}
      aria-live="polite"
      aria-busy={analysis.status !== 'DONE'}
    >
      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Analyse en cours</h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Cela peut prendre plusieurs minutes selon la durée de la vidéo.
      </p>
      <ol className="mt-6 space-y-4">
        {STEPS.map((step, index) => {
          const state = stepState(index, active, analysis.status);
          return (
            <li key={step.id} className="flex items-start gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  state === 'done'
                    ? 'bg-orange-500 text-white'
                    : state === 'active'
                      ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-500 dark:bg-orange-500/20 dark:text-orange-200'
                      : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                }`}
                aria-hidden
              >
                {state === 'done' ? '✓' : index + 1}
              </span>
              <span
                className={`flex-1 pt-1 text-sm ${
                  state === 'active'
                    ? 'font-semibold text-orange-900 dark:text-orange-200'
                    : state === 'done'
                      ? 'text-neutral-700 dark:text-neutral-300'
                      : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                {step.label}
                {state === 'active' && (
                  <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent align-middle" />
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {typeof analysis.segmentsCount === 'number' && analysis.segmentsCount > 0 && (
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          {analysis.segmentsCount} séquence{analysis.segmentsCount > 1 ? 's' : ''} détectée
          {analysis.segmentsCount > 1 ? 's' : ''} jusqu&apos;ici…
        </p>
      )}
    </section>
  );
}
