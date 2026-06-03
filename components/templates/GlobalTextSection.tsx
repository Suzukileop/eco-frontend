'use client';

import { useState } from 'react';
import { generateTextVariants } from '@/lib/templates';
import { getApiErrorMessage } from '@/lib/api-error';
import type { VideoAnalysisResponse } from '@/types/templates';
import { CREDITS_PER_TEXT_VARIANT } from '@/types/templates';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

type GlobalTextSectionProps = {
  analysis: VideoAnalysisResponse;
  onAnalysisUpdate: (analysis: VideoAnalysisResponse) => void;
};

export function GlobalTextSection({ analysis, onAnalysisUpdate }: GlobalTextSectionProps) {
  const [theme, setTheme] = useState(analysis.textVariantTheme ?? '');
  const [variantCount, setVariantCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const globalText = analysis.globalText?.trim() ?? '';
  const variants = analysis.textVariants ?? [];
  const cost = variantCount * CREDITS_PER_TEXT_VARIANT;

  if (!globalText) {
    return null;
  }

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      const updated = await generateTextVariants(analysis.id, {
        variantCount,
        theme: theme.trim() || undefined,
      });
      onAnalysisUpdate(updated);
      window.dispatchEvent(new Event('credits-updated'));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de générer les variantes.'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Texte global (toutes les séquences)
          </h2>
          <pre className="mt-2 max-h-64 overflow-y-auto rounded-xl bg-gray-100 p-4 text-sm text-gray-800 whitespace-pre-wrap">
            {globalText}
          </pre>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-72">
          <div>
            <label htmlFor="text-theme" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Thème (optionnel)
            </label>
            <input
              id="text-theme"
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={generating}
              placeholder="ex. motivation sombre, humour…"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-gray-500">
              Si vide, l&apos;IA propose des variantes du texte global sans thème imposé.
            </p>
          </div>

          <div>
            <label htmlFor="variant-count" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Nombre de variantes
            </label>
            <input
              id="variant-count"
              type="number"
              min={1}
              max={20}
              value={variantCount}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!Number.isNaN(n)) {
                  setVariantCount(Math.min(20, Math.max(1, n)));
                }
              }}
              disabled={generating}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-gray-500">
              {CREDITS_PER_TEXT_VARIANT} crédits par variante · total : {cost} crédits
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generating || variantCount < 1}
            className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 text-sm font-semibold text-white hover:from-teal-500 hover:to-teal-600 disabled:opacity-60"
          >
            {generating ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Génération…
              </span>
            ) : (
              `Variantes (-${cost} crédits)`
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {variants.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Variantes générées ({variants.length})
          </h3>
          <ol className="mt-3 space-y-3">
            {variants.map((variant, index) => (
              <li
                key={`${index}-${variant.slice(0, 24)}`}
                className="rounded-xl border border-teal-100 bg-teal-50/50 p-4"
              >
                <span className="text-xs font-bold text-teal-800">#{index + 1}</span>
                <pre className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{variant}</pre>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
