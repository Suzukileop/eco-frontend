'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { CreatorCard } from '@/components/CreatorCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { MarketplaceCreatorsPage, MarketplaceCreatorSummary } from '@/types/marketplace';

const GENRES = ['', 'Tech', 'Lifestyle', 'Business', 'Art', 'Sport', 'Musique'];

function MarketplaceSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const verifiedOnly = searchParams.get('verified') === '1';
  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0);

  const [localQ, setLocalQ] = useState(q);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<MarketplaceCreatorsPage | null>(null);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  const pushParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === '') params.delete(k);
      else params.set(k, v);
    });
    router.push(`/marketplace?${params.toString()}`);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const trimmed = q.trim();
      const res = trimmed
        ? await api.get<MarketplaceCreatorsPage>('/api/marketplace/creators/search', {
            params: { q: trimmed, page, size: 12 },
          })
        : await api.get<MarketplaceCreatorsPage>('/api/marketplace/creators', {
            params: {
              page,
              size: 12,
              ...(genre ? { niche: genre } : {}),
              ...(verifiedOnly ? { verified: true } : {}),
            },
          });
      setPageData(res.data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger la marketplace.'));
      setPageData(null);
    } finally {
      setLoading(false);
    }
  }, [q, genre, verifiedOnly, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const creators: MarketplaceCreatorSummary[] = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  const emptyIllustrated = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
        <svg
          className="mb-6 h-28 w-28 text-indigo-200"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="4" />
          <path
            d="M35 78c8-14 18-22 25-22s17 8 25 22"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="45" cy="48" r="6" fill="currentColor" />
          <circle cx="75" cy="48" r="6" fill="currentColor" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Aucun créateur trouvé</h2>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Essayez un autre mot-clé ou élargissez vos filtres.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Devenir créateur
        </Link>
      </div>
    ),
    []
  );

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ q: localQ.trim() || undefined, page: '0' });
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketplace créateurs</h1>
        <p className="mt-2 text-sm text-gray-600">
          Explorez les profils publics et leurs portfolios.
        </p>
      </div>

      <form
        onSubmit={onSearchSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-end"
      >
        <div className="flex-1">
          <label htmlFor="mq" className="text-sm font-medium text-gray-700">
            Recherche
          </label>
          <input
            id="mq"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Nom, niche…"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="genre" className="text-sm font-medium text-gray-700">
            Genre
          </label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => pushParams({ genre: e.target.value || undefined, page: '0' })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:w-48"
          >
            {GENRES.map((g) => (
              <option key={g || 'all'} value={g}>
                {g || 'Tous'}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => pushParams({ verified: e.target.checked ? '1' : undefined, page: '0' })}
          />
          Vérifiés seulement
        </label>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Rechercher
        </button>
      </form>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : creators.length === 0 ? (
        emptyIllustrated
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {creators.map((c) => (
              <CreatorCard
                key={c.id ?? c.userId ?? c.fullName}
                id={c.id}
                userId={c.userId}
                fullName={c.fullName}
                avatarUrl={c.avatarUrl}
                niche={c.niche}
                isVerified={c.isVerified}
                portfolioCount={c.portfolioCount}
                averageRating={c.averageRating}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600">
              Page {page + 1}
              {totalPages > 0 ? ` / ${totalPages}` : ''}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => pushParams({ page: String(page - 1) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                type="button"
                disabled={totalPages > 0 && page >= totalPages - 1}
                onClick={() => pushParams({ page: String(page + 1) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center px-4 py-20">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <MarketplaceSearchContent />
    </Suspense>
  );
}
