'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getMyAnalyses } from '@/lib/templates';

function pickLatestDoneAnalysis(
  items: Awaited<ReturnType<typeof getMyAnalyses>>['content']
) {
  return items
    .filter((row) => row.status === 'DONE')
    .sort((a, b) => {
      const left = a.updatedAt ?? a.createdAt ?? '';
      const right = b.updatedAt ?? b.createdAt ?? '';
      return right.localeCompare(left);
    })[0];
}

export default function VideoEditorPage() {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      try {
        const res = await getMyAnalyses(0, 50);
        const latest = pickLatestDoneAnalysis(res.content);
        if (latest) {
          router.replace(`/dashboard/templates/${latest.id}/studio`);
          return;
        }
      } catch {
        // Fall through to standalone editor.
      }
      router.replace('/dashboard/editor/studio');
    })();
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
