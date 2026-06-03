'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
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

function statusClasses(status: AnalysisStatus): string {
  switch (status) {
    case 'DONE':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'PROCESSING':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-700';
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
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-teal-600 hover:text-teal-800">
              ← Tableau de bord
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Analyses Templates IA</h1>
            <p className="text-sm text-gray-600">Historique de vos analyses vidéo Grok.</p>
          </div>
          <Link
            href="/dashboard/templates/new"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Nouvelle analyse
          </Link>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-gray-600">Aucune analyse pour le moment.</p>
              <Link
                href="/dashboard/templates/new"
                className="text-sm font-semibold text-teal-600 hover:text-teal-800"
              >
                Lancer votre première analyse
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Statut
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Séquences
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Crédits
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses(row.status)}`}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.segmentsCount ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{row.creditsUsed ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/templates/${row.id}`}
                          className="font-semibold text-teal-600 hover:text-teal-800"
                        >
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
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="self-center text-sm text-gray-600">
              Page {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </DashboardHomeShell>
  );
}
