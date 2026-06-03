'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import type { CreatorAnalyticsDto } from '@/types/analytics';
import type { CreatorContentItemDto } from '@/types/creator-content';

export default function CreatorContentListPage() {
  const { hasRole } = useAuth();
  const [analytics, setAnalytics] = useState<CreatorAnalyticsDto | null>(null);
  const [items, setItems] = useState<CreatorContentItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [a, list] = await Promise.all([
        api.get<CreatorAnalyticsDto>('/api/analytics/creator'),
        api.get<CreatorContentItemDto[]>('/api/creator/content'),
      ]);
      setAnalytics(a.data);
      setItems(Array.isArray(list.data) ? list.data : []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger vos contenus.'));
      setAnalytics(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    if (!window.confirm('Supprimer définitivement ce contenu ?')) return;
    try {
      await api.delete(`/api/creator/content/${id}`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Suppression impossible.'));
    }
  };

  if (!hasRole('ROLE_CREATOR')) {
    return (
      <DashboardHomeShell>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900">
          L&apos;accès à cette section est réservé aux comptes créateur.
        </div>
      </DashboardHomeShell>
    );
  }

  return (
    <DashboardHomeShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes contenus</h1>
            <p className="mt-1 text-sm text-gray-600">Portfolio et statistiques.</p>
          </div>
          <Link
            href="/dashboard/creator/content/new"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Publier un contenu
          </Link>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Contenus" value={String(analytics?.portfolioCount ?? items.length)} />
              <StatCard label="Vues" value={String(analytics?.totalViews ?? 0)} />
              <StatCard label="Likes" value={String(analytics?.totalLikes ?? 0)} />
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
                <p className="text-gray-700">
                  Vous n&apos;avez pas encore publié de contenu — commencez maintenant !
                </p>
                <Link
                  href="/dashboard/creator/content/new"
                  className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Publier un contenu
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((post) => (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {post.thumbnailUrl || post.mediaUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.thumbnailUrl ?? post.mediaUrl ?? ''}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            Pas d&apos;aperçu
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-semibold text-gray-900">{post.title}</h2>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {post.genre && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                              {post.genre}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 ${
                              post.isPublic ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {post.isPublic ? 'Public' : 'Privé'}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {post.views} vues · {post.likes} likes ·{' '}
                          {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                        <button
                          type="button"
                          onClick={() => void remove(post.id)}
                          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardHomeShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
