'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { SchedulePostModal } from '@/components/SchedulePostModal';
import type { PrefillNiche } from '@/components/SchedulePostModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { ScheduledPostDto, ScheduledPostsPage, SchedulerPostStatus, ValidatedNicheDto } from '@/types/scheduler';

type TabId = 'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';

const TAB_LABELS: Record<TabId, string> = {
  ALL: 'Toutes',
  SCHEDULED: 'Planifiées',
  PUBLISHED: 'Publiées',
  FAILED: 'Échouées',
  CANCELLED: 'Annulées',
};

const EMPTY_MESSAGES: Record<TabId, string> = {
  ALL: 'Aucune publication planifiée pour le moment.',
  SCHEDULED: 'Aucune publication en attente.',
  PUBLISHED: 'Aucune publication réussie pour cette vue.',
  FAILED: 'Aucune publication échouée.',
  CANCELLED: 'Aucune publication annulée.',
};

function tabToQuery(tab: TabId): string | undefined {
  if (tab === 'ALL') return undefined;
  return tab;
}

function platformIcon(platform: string) {
  const p = platform.toUpperCase();
  if (p.includes('INSTAGRAM')) return '📸';
  if (p.includes('TIKTOK')) return '🎵';
  if (p.includes('YOUTUBE')) return '▶️';
  if (p.includes('FACEBOOK')) return '👍';
  return '📱';
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return `${s.slice(0, n)}…`;
}

function StatusBadge({ status }: { status: SchedulerPostStatus }) {
  const st = String(status).toUpperCase();
  let cls = 'bg-gray-100 text-gray-700';
  if (st === 'SCHEDULED') cls = 'bg-blue-100 text-blue-800';
  if (st === 'PUBLISHED') cls = 'bg-green-100 text-green-800';
  if (st === 'FAILED') cls = 'bg-red-100 text-red-800';
  if (st === 'CANCELLED') cls = 'bg-amber-100 text-amber-900';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>
  );
}

function SchedulerPageContent() {
  const searchParams = useSearchParams();
  const nicheFromUrl = searchParams.get('niche');

  const [tab, setTab] = useState<TabId>('ALL');
  const [posts, setPosts] = useState<ScheduledPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [niches, setNiches] = useState<ValidatedNicheDto[]>([]);
  const [nichesLoading, setNichesLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<PrefillNiche | undefined>(undefined);
  const [page] = useState(0);

  const loadPosts = useCallback(async () => {
    try {
      setError(null);
      const statusParam = tabToQuery(tab);
      const res = await api.get<ScheduledPostsPage>('/api/scheduler/posts', {
        params: {
          page,
          size: 50,
          ...(statusParam ? { status: statusParam } : {}),
        },
      });
      setPosts(res.data.content ?? []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger les publications.'));
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  const loadNiches = useCallback(async () => {
    try {
      setNichesLoading(true);
      const res = await api.get<ValidatedNicheDto[]>('/api/scheduler/niches-validated');
      const list = Array.isArray(res.data) ? res.data : [];
      setNiches(list.slice(0, 3));
    } catch {
      setNiches([]);
    } finally {
      setNichesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNiches();
  }, [loadNiches]);

  useEffect(() => {
    setLoading(true);
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadPosts();
    }, 30_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') void loadPosts();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [loadPosts]);

  useEffect(() => {
    if (!nicheFromUrl || niches.length === 0) return;
    const match = niches.find((n) => n.nicheCode === nicheFromUrl);
    if (match) {
      setPrefill({ nicheCode: match.nicheCode, nicheTheme: match.nicheTheme });
      setModalOpen(true);
    }
  }, [nicheFromUrl, niches]);

  const openPlan = (n?: ValidatedNicheDto) => {
    if (n) setPrefill({ nicheCode: n.nicheCode, nicheTheme: n.nicheTheme });
    else setPrefill(undefined);
    setModalOpen(true);
  };

  const cancelPost = async (id: string) => {
    if (!window.confirm('Annuler cette publication planifiée ?')) return;
    try {
      await api.delete(`/api/scheduler/posts/${id}`);
      await loadPosts();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Annulation impossible.'));
    }
  };

  const showSkeleton = loading && posts.length === 0;

  const tabs = useMemo(() => Object.keys(TAB_LABELS) as TabId[], []);

  return (
    <DashboardHomeShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planificateur</h1>
          <p className="mt-1 text-sm text-gray-600">
            Planifiez vos publications sur les réseaux sociaux.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Vos niches validées</h2>
          {nichesLoading ? (
            <div className="mt-4 flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 flex-1 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : niches.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">
              Commencez par définir votre niche dans{' '}
              <Link href="/dashboard/ecosystem/new" className="font-semibold text-indigo-600 hover:text-indigo-800">
                l&apos;écosystème
              </Link>
              .
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {niches.map((n) => (
                <div
                  key={n.nicheCode}
                  className="flex flex-col justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"
                >
                  <div>
                    <p className="font-mono text-xs text-indigo-700">{n.nicheCode}</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{n.nicheTheme}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openPlan(n)}
                    className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Planifier
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {showSkeleton ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600">{EMPTY_MESSAGES[tab]}</p>
            <button
              type="button"
              onClick={() => openPlan()}
              className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Planifier une publication
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Plateforme</th>
                  <th className="px-4 py-3">Légende</th>
                  <th className="px-4 py-3">Planifiée le</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <span className="text-lg" title={p.platform}>
                        {platformIcon(p.platform)}
                      </span>{' '}
                      <span className="text-gray-700">{p.platform}</span>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-gray-800">{truncate(p.caption, 60)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {new Date(p.scheduledAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {String(p.status).toUpperCase() === 'SCHEDULED' && (
                        <button
                          type="button"
                          onClick={() => void cancelPost(p.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="button"
          onClick={() => openPlan()}
          className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
        >
          + Planifier
        </button>

        <SchedulePostModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onScheduled={() => void loadPosts()}
          prefillNiche={prefill}
        />
      </div>
    </DashboardHomeShell>
  );
}

export default function SchedulerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center px-4 py-20">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <SchedulerPageContent />
    </Suspense>
  );
}
