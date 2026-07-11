'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PublicContentPostCard } from '@/components/home/PublicContentPostCard';
import { HomeNewsFeedSkeleton } from '@/components/home/HomeNewsSkeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getApiErrorMessage } from '@/lib/api-error';
import { listPublicContentFeed } from '@/lib/marketplace-api';
import type { PublicContentFeedItem } from '@/types/marketplace';

export function HomeNewsFeed() {
  const [items, setItems] = useState<PublicContentFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (pageIndex: number, append: boolean) => {
    try {
      setError(null);
      if (append) setLoadingMore(true);
      else setLoading(true);

      const result = await listPublicContentFeed({ page: pageIndex, size: 10 });
      setItems((prev) => (append ? [...prev, ...result.content] : result.content));
      setPage(pageIndex);
      setHasMore(!result.last);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger les actualités.'));
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(0, false);
  }, [loadPage]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadPage(page + 1, true);
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadPage, page]);

  if (loading) {
    return <HomeNewsFeedSkeleton />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">
            Aucune publication pour le moment. Revenez bientôt !
          </p>
        </div>
      ) : (
        <div className="snap-y snap-proximity">
          {items.map((post) => (
            <section
              key={post.id}
              className="flex min-h-0 snap-center snap-always scroll-mt-6 items-center justify-center pb-10 pt-2 lg:h-[80vh] lg:min-h-[80vh]"
            >
              <PublicContentPostCard post={post} className="w-full" />
            </section>
          ))}
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden />}
      {loadingMore && (
        <section className="pb-10 pt-2">
          <HomeNewsFeedSkeleton count={1} />
        </section>
      )}
    </div>
  );
}
