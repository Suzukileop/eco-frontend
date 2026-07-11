'use client';

import { useState } from 'react';
import { generateTextVariants } from '@/lib/templates';
import { getApiErrorMessage } from '@/lib/api-error';
import type { VideoAnalysisResponse } from '@/types/templates';
import { CREDITS_PER_TEXT_VARIANT } from '@/types/templates';
import {
  templatesEyebrowClass,
  templatesInputClass,
  templatesPrimaryBtnClass,
  templatesSectionClass,
} from '@/components/templates/templates-section-ui';
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
    <section className={templatesSectionClass}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className={templatesEyebrowClass}>Texte global (toutes les séquences)</h2>
          <pre className="mt-2 max-h-64 overflow-y-auto rounded-xl bg-neutral-100 p-4 text-sm text-neutral-800 whitespace-pre-wrap dark:bg-neutral-950 dark:text-neutral-200">
            {globalText}
          </pre>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-72">
          <div>
            <label htmlFor="text-theme" className={templatesEyebrowClass}>
              Thème (optionnel)
            </label>
            <input
              id="text-theme"
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={generating}
              placeholder="ex. motivation sombre, humour…"
              className={templatesInputClass}
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Si vide, l&apos;IA propose des variantes du texte global sans thème imposé.
            </p>
          </div>

          <div>
            <label htmlFor="variant-count" className={templatesEyebrowClass}>
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
              className={templatesInputClass}
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {CREDITS_PER_TEXT_VARIANT} crédits par variante · total : {cost} crédits
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generating || variantCount < 1}
            className={templatesPrimaryBtnClass}
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
        <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <h3 className={templatesEyebrowClass}>Variantes générées ({variants.length})</h3>
          <ol className="mt-3 space-y-3">
            {variants.map((variant, index) => (
              <li
                key={`${index}-${variant.slice(0, 24)}`}
                className="rounded-xl border border-orange-200/60 bg-orange-50/40 p-4 dark:border-orange-500/25 dark:bg-orange-500/8"
              >
                <span className="text-xs font-bold text-orange-800 dark:text-orange-300">#{index + 1}</span>
                <pre className="mt-1 text-sm text-neutral-800 whitespace-pre-wrap dark:text-neutral-200">{variant}</pre>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
