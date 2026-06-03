'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { listAgentNicheRequests } from '@/lib/ecosystem';
import type { NicheRequestResponse } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NicheStatusBadge } from '@/components/ecosystem/NicheStatusBadge';

function nextStepLabel(step: string): string {
  switch (step) {
    case 'BOT_CHAT':
      return '💬 Bot';
    case 'WAITING_AGENT':
      return '⏳ En attente agent';
    case 'VALIDATE_MODEL':
      return '👀 Validation';
    case 'PAYMENT':
      return '💳 Paiement';
    case 'SCHEDULER':
      return '📅 Planification';
    case 'ACTIVE':
      return '✅ Actif';
    default:
      return step;
  }
}

export default function AgentQueuePage() {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ content: NicheRequestResponse[]; totalPages: number; last: boolean } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const size = 10;

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_AGENT')) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, hasRole, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listAgentNicheRequests(page, size);
      setData(res);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger la file agent.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!user || !hasRole('ROLE_AGENT')) return;
    void load();
  }, [load, user, hasRole]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasRole('ROLE_AGENT')) {
    return null;
  }

  const rows = (data?.content ?? []).filter((r) => {
    if (r.status !== 'PENDING') return false;
    const confirmed = r.botConfirmed;
    return confirmed === true || confirmed === undefined;
  });

  return (
    <DashboardHomeShell>
      <div className="space-y-8">
        <div>
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800">
            ← Tableau de bord
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">File agent — niches prêtes</h1>
          <p className="text-sm text-gray-600">
            Demandes en statut « En attente » avec confirmation bot (ou dossiers hérités sans indicateur).
          </p>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p>Aucune demande à traiter pour le moment.</p>
              <p className="mt-2 text-sm text-gray-400">Les dossiers apparaissent après confirmation du bot client.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Thème</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Étape</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Créée</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.nicheTheme}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.uniqueCode}</td>
                      <td className="px-4 py-3">
                        <span className="mr-2 inline-block">
                          <NicheStatusBadge status={row.status} />
                        </span>
                        <span className="text-gray-600">{nextStepLabel(row.nextStep)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(row.createdAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/agent/${row.id}`}
                          className="font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Préparer le modèle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {data && data.totalPages > 1 && (
          <nav className="flex items-center justify-between text-sm" aria-label="Pagination agent">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-gray-600">
              Page {page + 1} / {data.totalPages}
            </span>
            <button
              type="button"
              disabled={data.last}
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
