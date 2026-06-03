'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyRequests } from '@/lib/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import type { NicheRequestResponse, ServiceRequestDto } from '@/types/ecosystem';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ServiceRequestStatusBadge } from '@/components/ui/ServiceRequestStatusBadge';
import { NicheStatusBadge } from '@/components/ecosystem/NicheStatusBadge';

function isNicheResponse(row: unknown): row is NicheRequestResponse {
  return typeof row === 'object' && row !== null && 'nicheTheme' in row && 'nextStep' in row;
}

function nextStepLabel(step: string): string {
  switch (step) {
    case 'BOT_CHAT':
      return '💬 Chat bot';
    case 'WAITING_AGENT':
      return '⏳ En attente agent';
    case 'VALIDATE_MODEL':
      return '👀 Validation modèle';
    case 'PAYMENT':
      return '💳 Paiement requis';
    case 'SCHEDULER':
      return '📅 Planification';
    case 'ACTIVE':
      return '✅ Actif';
    default:
      return step;
  }
}

export default function MyRequestsPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{
    content: unknown[];
    totalPages: number;
    last: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const size = 10;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyRequests(undefined, page, size);
      setData(res);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger vos demandes.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <DashboardHomeShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800">
              ← Tableau de bord
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Mes demandes</h1>
            <p className="text-sm text-gray-600">Suivi de vos dossiers écosystème.</p>
          </div>
          <Link
            href="/dashboard/ecosystem/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Nouvelle demande
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
              <div className="text-5xl" aria-hidden>
                📋
              </div>
              <p className="text-gray-600">Aucune demande pour le moment.</p>
              <Link href="/dashboard/ecosystem/new" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                Créer votre première demande
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Code
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Niche / type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Statut
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Étape
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Montant
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-700">
                      Détail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => {
                    if (isNicheResponse(row)) {
                      return (
                        <tr key={row.id} className="hover:bg-gray-50/80">
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 font-mono text-xs font-semibold text-purple-900 ring-1 ring-purple-200">
                              {row.uniqueCode}
                            </span>
                          </td>
                          <td className="max-w-[200px] truncate px-4 py-3 text-gray-900">{row.nicheTheme}</td>
                          <td className="px-4 py-3">
                            <NicheStatusBadge status={row.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-700">{nextStepLabel(row.nextStep)}</td>
                          <td className="px-4 py-3 text-gray-800">{row.monthlyAmountFormatted}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(row.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/dashboard/ecosystem/${row.id}`}
                              className="font-medium text-indigo-600 hover:text-indigo-800"
                            >
                              Voir
                            </Link>
                          </td>
                        </tr>
                      );
                    }
                    const legacy = row as ServiceRequestDto;
                    return (
                      <tr key={legacy.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 font-mono text-xs font-semibold text-purple-900 ring-1 ring-purple-200">
                            {legacy.uniqueCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800">{legacy.type}</td>
                        <td className="px-4 py-3">
                          <ServiceRequestStatusBadge status={legacy.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-500">—</td>
                        <td className="px-4 py-3 text-gray-500">—</td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(legacy.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/ecosystem/${legacy.id}`}
                            className="font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Voir
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-gray-600">
              Page {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={data?.last ?? true}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Suivant
            </button>
          </nav>
        )}
      </div>
    </DashboardHomeShell>
  );
}
