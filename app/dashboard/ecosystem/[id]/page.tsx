'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getRequestDetail } from '@/lib/ecosystem';
import type { NextStep, NicheRequestResponse } from '@/types/ecosystem';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { StatusStepper } from '@/components/ecosystem/StatusStepper';
import { BotChatSection } from '@/components/ecosystem/BotChatSection';
import { WaitingAgentSection } from '@/components/ecosystem/WaitingAgentSection';
import { ValidateModelSection } from '@/components/ecosystem/ValidateModelSection';
import { PaymentSection } from '@/components/ecosystem/PaymentSection';
import { SchedulerSection } from '@/components/ecosystem/SchedulerSection';
import { ActiveEcosystemSection } from '@/components/ecosystem/ActiveEcosystemSection';
import { RejectedSection } from '@/components/ecosystem/RejectedSection';
import { getApiErrorMessage } from '@/lib/api-error';

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-2/3 rounded-lg bg-gray-200" />
      <div className="h-24 rounded-2xl bg-gray-100" />
      <div className="h-48 rounded-2xl bg-gray-100" />
    </div>
  );
}

function EcosystemRequestDetailInner() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [request, setRequest] = useState<NicheRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(getApiErrorMessage(e, 'Impossible de charger cette demande.'));
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

  const renderMain = () => {
    if (!request) return null;

    if (request.status === 'CANCELLED') {
      return <RejectedSection request={request} variant="cancelled" />;
    }
    if (request.status === 'REJECTED') {
      return <RejectedSection request={request} variant="rejected" />;
    }

    const step = request.nextStep as NextStep | string;

    switch (step) {
      case 'BOT_CHAT':
        return <BotChatSection request={request} onRefreshRequest={refreshRequest} />;
      case 'WAITING_AGENT':
        return <WaitingAgentSection request={request} onCancelled={() => void load()} />;
      case 'VALIDATE_MODEL':
        return <ValidateModelSection request={request} />;
      case 'PAYMENT':
        return (
          <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-gray-100" aria-hidden />}>
            <PaymentSection request={request} onRefresh={refreshRequest} />
          </Suspense>
        );
      case 'SCHEDULER':
        return (
          <SchedulerSection
            key={`${request.id}-${request.nbPostsPerWeek}`}
            request={request}
            onSaved={() => {
              void load();
            }}
          />
        );
      case 'ACTIVE':
        return <ActiveEcosystemSection request={request} />;
      default:
        return (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900">
            Étape « {step} » — mise à jour du parcours en cours. Cette page se rafraîchit automatiquement.
          </div>
        );
    }
  };

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Link href="/dashboard/requests" className="text-sm text-indigo-600 hover:text-indigo-800">
            ← Mes demandes
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Votre dossier écosystème</h1>
          {request && (
            <p className="mt-2 font-mono text-sm text-purple-900">{request.uniqueCode}</p>
          )}
        </div>

        {error && <ErrorAlert message={error} />}

        {loading ? (
          <DetailSkeleton />
        ) : !request ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <p className="text-gray-600">Demande introuvable ou accès refusé.</p>
          </div>
        ) : (
          <>
            {request.status !== 'CANCELLED' && request.status !== 'REJECTED' && (
              <StatusStepper nextStep={request.nextStep} />
            )}
            {renderMain()}
          </>
        )}
      </div>
    </DashboardHomeShell>
  );
}

export default function EcosystemRequestDetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <EcosystemRequestDetailInner />
    </Suspense>
  );
}
