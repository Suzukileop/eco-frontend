'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { getRequestDetail, skipModelValidation } from '@/lib/ecosystem';
import type { NicheRequestResponse } from '@/types/ecosystem';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { PopularNichesPanel } from '@/components/ecosystem/PopularNichesPanel';
import { StatusStepper } from '@/components/ecosystem/StatusStepper';
import { StepActionsLockedBanner } from '@/components/ecosystem/StepActionsLockedBanner';
import { EcosystemFormReviewSection } from '@/components/ecosystem/EcosystemFormReviewSection';
import { stepIndexForNextStep, viewStepForIndex } from '@/lib/ecosystem-steps';
import { WaitingAgentSection } from '@/components/ecosystem/WaitingAgentSection';
import { RejectedSection } from '@/components/ecosystem/RejectedSection';
import { EcosystemDetailSkeleton } from '@/components/ecosystem/EcosystemSkeleton';
import { getApiErrorMessage } from '@/lib/api-error';
import { NotificationHighlightTarget } from '@/components/notifications/NotificationHighlightTarget';
import {
  HIGHLIGHT_TO_STEP_INDEX,
  NOTIFICATION_TARGET,
  type NotificationTargetId,
} from '@/lib/notification-highlight';

const sectionPulse = (
  <div className="h-48 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" aria-hidden />
);

const BotChatSection = dynamic(
  () => import('@/components/ecosystem/BotChatSection').then((m) => ({ default: m.BotChatSection })),
  { loading: () => sectionPulse, ssr: false }
);

const PaymentSection = dynamic(
  () => import('@/components/ecosystem/PaymentSection').then((m) => ({ default: m.PaymentSection })),
  { loading: () => <div className="h-24 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" aria-hidden />, ssr: false }
);

const SchedulerSection = dynamic(
  () => import('@/components/ecosystem/SchedulerSection').then((m) => ({ default: m.SchedulerSection })),
  { loading: () => sectionPulse, ssr: false }
);

const ActiveEcosystemSection = dynamic(
  () =>
    import('@/components/ecosystem/ActiveEcosystemSection').then((m) => ({
      default: m.ActiveEcosystemSection,
    })),
  { loading: () => <div className="h-32 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" aria-hidden />, ssr: false }
);

function EcosystemRequestDetailInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const highlight = searchParams.get('highlight');

  const [request, setRequest] = useState<NicheRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewStepIndex, setViewStepIndex] = useState<number | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!id) return;
    const silent = opts?.silent ?? false;
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const data = await getRequestDetail(id);
      setRequest(data);
    } catch (e) {
      if (!silent) {
        setError(getApiErrorMessage(e, 'Unable to load this request.'));
        setRequest(null);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setViewStepIndex(null);
  }, [request?.nextStep]);

  useEffect(() => {
    if (!request || !highlight) return;
    const step = HIGHLIGHT_TO_STEP_INDEX[highlight as NotificationTargetId];
    if (step != null) {
      setViewStepIndex(step);
    }
  }, [request, highlight]);

  /** Rafraîchissement léger des statuts sans skeleton (évite de faire disparaître le chat). */
  useEffect(() => {
    const t = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      void load({ silent: true });
    }, 90000);
    return () => window.clearInterval(t);
  }, [load]);

  const refreshRequest = useCallback(async () => {
    await load();
  }, [load]);

  const handleSkipWaiting = useCallback(async () => {
    if (!id) return;
    try {
      const data = await skipModelValidation(id);
      setRequest(data);
      setViewStepIndex(null);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to skip to payment.'));
    }
  }, [id]);

  const currentStepIndex = request ? stepIndexForNextStep(request.nextStep) : 0;
  const selectedIndex = viewStepIndex ?? currentStepIndex;
  const actionsLocked = selectedIndex !== currentStepIndex;

  const renderMain = () => {
    if (!request) return null;

    if (request.status === 'CANCELLED') {
      return <RejectedSection request={request} variant="cancelled" />;
    }
    if (request.status === 'REJECTED') {
      return <RejectedSection request={request} variant="rejected" />;
    }

    const viewStep = viewStepForIndex(selectedIndex);

    switch (viewStep) {
      case 'FORM':
        return <EcosystemFormReviewSection request={request} />;
      case 'BOT_CHAT':
        return (
          <BotChatSection
            request={request}
            onRefreshRequest={refreshRequest}
            actionsLocked={actionsLocked}
          />
        );
      case 'WAITING_AGENT':
        return (
          <NotificationHighlightTarget
            id={NOTIFICATION_TARGET.WAITING_AGENT}
            alsoMatch={[NOTIFICATION_TARGET.VALIDATION_MODEL]}
            ready={!!request}
          >
            <WaitingAgentSection
              request={request}
              onCancelled={() => void load()}
              onSkip={handleSkipWaiting}
              onValidated={() => void load()}
              actionsLocked={actionsLocked}
            />
          </NotificationHighlightTarget>
        );
      case 'PAYMENT':
        return (
          <NotificationHighlightTarget id={NOTIFICATION_TARGET.PAYMENT} ready={!!request}>
            <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-gray-100" aria-hidden />}>
              <PaymentSection request={request} onRefresh={refreshRequest} actionsLocked={actionsLocked} />
            </Suspense>
          </NotificationHighlightTarget>
        );
      case 'SCHEDULER':
        return (
          <NotificationHighlightTarget id={NOTIFICATION_TARGET.SCHEDULER} ready={!!request}>
            <SchedulerSection
              key={`${request.id}-${request.nbPostsPerWeek}`}
              request={request}
              onSaved={() => {
                void load();
              }}
              actionsLocked={actionsLocked}
            />
          </NotificationHighlightTarget>
        );
      case 'ACTIVE':
        return (
          <NotificationHighlightTarget id={NOTIFICATION_TARGET.ACTIVE} ready={!!request}>
            <ActiveEcosystemSection request={request} />
          </NotificationHighlightTarget>
        );
      default:
        return (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900">
            Step &quot;{viewStep}&quot; — workflow update in progress. This page refreshes automatically.
          </div>
        );
    }
  };

  return (
    <DashboardHomeShell wide>
      {error && <ErrorAlert message={error} />}

      {loading ? (
        <EcosystemDetailSkeleton />
      ) : (
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1 space-y-6">
            {!request ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-950">
                <p className="text-neutral-600 dark:text-neutral-400">Request not found or access denied.</p>
              </div>
            ) : (
              <>
                {request.status !== 'CANCELLED' && request.status !== 'REJECTED' && (
                  <StatusStepper
                    nextStep={request.nextStep}
                    selectedIndex={selectedIndex}
                    onStepSelect={(index) => {
                      setViewStepIndex(index === currentStepIndex ? null : index);
                    }}
                  />
                )}
                {actionsLocked && (
                  <StepActionsLockedBanner
                    currentStepIndex={currentStepIndex}
                    selectedIndex={selectedIndex}
                    onReturnToCurrent={() => setViewStepIndex(null)}
                  />
                )}
                {renderMain()}
              </>
            )}
          </div>

          <PopularNichesPanel className="hidden h-[min(800px,calc(100vh-8rem))] w-full shrink-0 xl:block xl:w-72 xl:sticky xl:top-24" />
        </div>
      )}
    </DashboardHomeShell>
  );
}

export default function EcosystemRequestDetailPage() {
  return (
    <Suspense fallback={<EcosystemDetailSkeleton />}>
      <EcosystemRequestDetailInner />
    </Suspense>
  );
}
