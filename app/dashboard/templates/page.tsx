'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { TemplatesEmptyState } from '@/components/templates/TemplatesEmptyState';
import { TemplatesPageHeader } from '@/components/templates/TemplatesPageHeader';
import {
  templatesLinkClass,
  templatesPanelClass,
  templatesPrimaryBtnClass,
  templatesSecondaryBtnClass,
  templatesStatusBadgeClass,
  templatesTableHeadClass,
  templatesTableRowHoverClass,
} from '@/components/templates/templates-section-ui';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getMyAnalyses } from '@/lib/templates';
import { getApiErrorMessage } from '@/lib/api-error';
import type { AnalysisStatus, VideoAnalysisResponse } from '@/types/templates';

function statusLabel(status: AnalysisStatus): string {
  switch (status) {
    case 'PENDING':
      return 'En attente';
    case 'PROCESSING':
      return 'En cours';
    case 'DONE':
      return 'Terminée';
    case 'FAILED':
      return 'Échouée';
    default:
      return status;
  }
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function TemplatesListPage() {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<VideoAnalysisResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const size = 10;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyAnalyses(page, size);
      setRows(res.content);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger vos analyses.'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <TemplatesPageHeader
          title="Analyses Templates IA"
          subtitle="Historique de vos décompositions vidéo Grok et générations Nano Banana."
          breadcrumbs={[{ href: '/dashboard', label: '← Tableau de bord' }]}
          action={
            <Link href="/dashboard/templates/new" className={templatesPrimaryBtnClass}>
              Nouvelle analyse
            </Link>
          }
        />

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <div className={templatesPanelClass}>
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : rows.length === 0 ? (
            <TemplatesEmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                <thead className={templatesTableHeadClass}>
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Statut
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Séquences
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Crédits
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {rows.map((row) => (
                    <tr key={row.id} className={templatesTableRowHoverClass}>
                      <td className="px-4 py-3 text-neutral-800 dark:text-neutral-200">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={templatesStatusBadgeClass(row.status)}>{statusLabel(row.status)}</span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{row.segmentsCount ?? '—'}</td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{row.creditsUsed ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/dashboard/templates/${row.id}`} className={templatesLinkClass}>
                          Ouvrir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
              className={`${templatesSecondaryBtnClass} disabled:opacity-50`}
            >
              Précédent
            </button>
            <span className="self-center text-sm text-neutral-600 dark:text-neutral-400">
              Page {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className={`${templatesSecondaryBtnClass} disabled:opacity-50`}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </DashboardHomeShell>
  );
}
