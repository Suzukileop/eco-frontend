'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { NicheRequestResponse } from '@/types/ecosystem';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EcosystemNicheFullDetailsSection } from '@/components/ecosystem/EcosystemNicheFullDetailsSection';
import { EcosystemAgentContentSection } from '@/components/ecosystem/EcosystemAgentContentSection';
import { EcosystemConsultSkeleton } from '@/components/ecosystem/EcosystemSkeleton';
import { NotificationHighlightTarget } from '@/components/notifications/NotificationHighlightTarget';
import { NOTIFICATION_TARGET } from '@/lib/notification-highlight';
import { getRequestDetail } from '@/lib/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';

function EcosystemConsultInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const hasContentTarget = searchParams.get('highlight') === NOTIFICATION_TARGET.CONTENT_ITEM;

  const [request, setRequest] = useState<NicheRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getRequestDetail(id);
      if (String(data.status) !== 'ACTIVE') {
        router.replace(`/dashboard/ecosystem/${id}`);
        return;
      }
      setRequest(data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load this niche.'));
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DashboardHomeShell wide>
      {error && <ErrorAlert message={error} />}

      {loading ? (
        <EcosystemConsultSkeleton />
      ) : (
        <div className="space-y-6">
          <div>
            <Link
              href="/dashboard/ecosystem"
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to requests
            </Link>
            {request && (
              <h1 className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">{request.nicheTheme}</h1>
            )}
          </div>

          {!request ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-950">
              <p className="text-neutral-600 dark:text-neutral-400">Request not found or access denied.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <EcosystemNicheFullDetailsSection request={request} />
              <NotificationHighlightTarget
                id={NOTIFICATION_TARGET.AGENT_CONTENT}
                ready={!!request && !hasContentTarget}
              >
                <EcosystemAgentContentSection
                  request={request}
                  syncContentId={searchParams.get('contentId')}
                />
              </NotificationHighlightTarget>
            </div>
          )}
        </div>
      )}
    </DashboardHomeShell>
  );
}

export default function EcosystemConsultPage() {
  return (
    <Suspense fallback={<EcosystemConsultSkeleton />}>
      <EcosystemConsultInner />
    </Suspense>
  );
}
