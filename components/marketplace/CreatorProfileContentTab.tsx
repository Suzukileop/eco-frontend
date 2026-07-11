'use client';

import { useCallback, useEffect, useState } from 'react';
import { PublicCreatorProfileContentTabSkeleton } from '@/components/marketplace/PublicCreatorProfileSkeleton';
import { PublicContentPostCard } from '@/components/home/PublicContentPostCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getApiErrorMessage } from '@/lib/api-error';
import { listPublicContentFeed } from '@/lib/marketplace-api';
import type { PublicContentFeedItem } from '@/types/marketplace';

function formatContentCountLabel(count: number, creatorName: string): string {
  if (count === 0) {
    return `Aucun contenu public publié par ${creatorName}.`;
  }
  if (count === 1) {
    return `1 contenu public publié par ${creatorName}.`;
  }
  return `${count} contenus publics publiés par ${creatorName}.`;
}

type CreatorProfileContentTabProps = {
  creatorId: string;
  creatorName: string;
};

export function CreatorProfileContentTab({ creatorId, creatorName }: CreatorProfileContentTabProps) {
  const [items, setItems] = useState<PublicContentFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listPublicContentFeed({ creatorId, page: 0, size: 50 });
      setItems(result.content);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger les contenus.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <PublicCreatorProfileContentTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Contenu</h2>
        <p className="mt-1 text-sm text-neutral-500">{formatContentCountLabel(items.length, creatorName)}</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">Aucun contenu public pour le moment.</p>
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
    </div>
  );
}
