'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { AnalysisProgress } from '@/components/templates/AnalysisProgress';
import { GlobalTextSection } from '@/components/templates/GlobalTextSection';
import { SegmentCard } from '@/components/templates/SegmentCard';
import { TemplatesPageHeader } from '@/components/templates/TemplatesPageHeader';
import {
  templatesLinkClass,
  templatesPrimaryBtnClass,
  templatesSectionClass,
} from '@/components/templates/templates-section-ui';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getAnalysis } from '@/lib/templates';
import { getApiErrorMessage } from '@/lib/api-error';
import type { SegmentResponse, VideoAnalysisResponse } from '@/types/templates';

const POLL_MS = 3000;

function isInProgress(status: VideoAnalysisResponse['status']): boolean {
  return status === 'PENDING' || status === 'PROCESSING';
}

export default function TemplateAnalysisDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [analysis, setAnalysis] = useState<VideoAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!id) return null;
    const data = await getAnalysis(id);
    setAnalysis(data);
    return data;
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Identifiant d’analyse invalide.');
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setError(null);
        const data = await fetchAnalysis();
        if (!cancelled && data) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, 'Impossible de charger l’analyse.'));
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, fetchAnalysis]);

  const analysisStatus = analysis?.status;

  useEffect(() => {
    if (!id || !analysisStatus || !isInProgress(analysisStatus)) return;

    const interval = window.setInterval(() => {
      void fetchAnalysis()
        .then((data) => {
          if (data && (data.status === 'DONE' || data.status === 'FAILED')) {
            window.dispatchEvent(new Event('credits-updated'));
          }
        })
        .catch((e) => {
          setError(getApiErrorMessage(e, 'Erreur lors du rafraîchissement.'));
        });
    }, POLL_MS);

    return () => window.clearInterval(interval);
  }, [id, analysisStatus, fetchAnalysis]);

  const handleSegmentUpdate = (updated: SegmentResponse) => {
    setAnalysis((prev) => {
      if (!prev?.segments) return prev;
      return {
        ...prev,
        segments: prev.segments.map((s) => (s.id === updated.id ? updated : s)),
      };
    });
  };

  if (loading) {
    return (
      <DashboardHomeShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardHomeShell>
    );
  }

  if (error && !analysis) {
    return (
      <DashboardHomeShell>
        <div className="space-y-4">
          <Link href="/dashboard/templates" className={templatesLinkClass}>
            ← Mes analyses
          </Link>
          <ErrorAlert message={error} />
        </div>
      </DashboardHomeShell>
    );
  }

  if (!analysis) return null;

  const segments = [...(analysis.segments ?? [])].sort((a, b) => a.seqNumber - b.seqNumber);

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <TemplatesPageHeader
          title="Analyse vidéo"
          subtitle={analysis.videoUrl ?? undefined}
          breadcrumbs={[{ href: '/dashboard/templates', label: '← Mes analyses' }]}
        />

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {isInProgress(analysis.status) && <AnalysisProgress analysis={analysis} />}

        {analysis.status === 'FAILED' && (
          <section className="rounded-2xl border border-red-200 bg-red-50/80 p-6 dark:border-red-500/30 dark:bg-red-500/10">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200">Analyse échouée</h2>
            <p className="mt-2 text-sm text-red-800 dark:text-red-300">
              {analysis.errorMessage ?? 'Une erreur est survenue pendant le traitement.'}
            </p>
            <Link href="/dashboard/templates/new" className={`${templatesLinkClass} mt-4 inline-block`}>
              Réessayer avec une nouvelle vidéo →
            </Link>
          </section>
        )}

        {analysis.status === 'DONE' && (
          <>
            <section className={templatesSectionClass}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <dl className="grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">Séquences</dt>
                    <dd className="font-semibold text-neutral-900 dark:text-white">
                      {analysis.segmentsCount ?? segments.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">Crédits utilisés</dt>
                    <dd className="font-semibold text-neutral-900 dark:text-white">{analysis.creditsUsed ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">Durée traitement</dt>
                    <dd className="font-semibold text-neutral-900 dark:text-white">
                      {analysis.processingMs != null
                        ? `${(analysis.processingMs / 1000).toFixed(1)} s`
                        : '—'}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/dashboard/templates/${analysis.id}/studio`}
                  className={templatesPrimaryBtnClass}
                >
                  Ouvrir l&apos;éditeur
                </Link>
              </div>
            </section>

            <GlobalTextSection analysis={analysis} onAnalysisUpdate={setAnalysis} />

            <div className="space-y-6">
              {segments.length === 0 ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Aucun segment retourné.</p>
              ) : (
                segments.map((seg) => (
                  <SegmentCard
                    key={seg.id}
                    segment={seg}
                    analysisId={analysis.id}
                    onSegmentUpdate={handleSegmentUpdate}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </DashboardHomeShell>
  );
}
