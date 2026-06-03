'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createCheckoutSession, getRequestDetail } from '@/lib/ecosystem';
import type { NicheRequestResponse } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

type Props = {
  request: NicheRequestResponse;
  onRefresh: () => Promise<void>;
};

export function PaymentSection({ request, onRefresh }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const payment = searchParams.get('payment');
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (payment !== 'success') return;

    const poll = async () => {
      try {
        const fresh = await getRequestDetail(request.id);
        if (fresh.nextStep === 'SCHEDULER' || fresh.nextStep === 'ACTIVE') {
          if (pollRef.current) clearInterval(pollRef.current);
          await onRefresh();
          router.replace(`/dashboard/ecosystem/${request.id}`);
        }
      } catch {
        /* retry */
      }
    };

    void poll();
    pollRef.current = setInterval(() => {
      void poll();
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [payment, request.id, onRefresh, router]);

  const startCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);
    try {
      const { checkoutUrl } = await createCheckoutSession(request.id);
      window.location.href = checkoutUrl;
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de démarrer le paiement.'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (payment === 'success') {
    return (
      <section className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-green-900">✅ Paiement confirmé !</p>
        <p className="mt-2 text-sm text-green-800">
          Configuration de votre écosystème en cours… Cette page se mettra à jour automatiquement.
        </p>
      </section>
    );
  }

  if (payment === 'cancelled') {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        <p className="font-medium text-amber-900">Paiement annulé. Vous pouvez réessayer quand vous voulez.</p>
        <button
          type="button"
          onClick={() => void startCheckout()}
          disabled={checkoutLoading}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {checkoutLoading ? 'Redirection…' : 'Procéder au paiement →'}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      <h2 className="text-lg font-semibold text-gray-900">Paiement de l&apos;abonnement écosystème</h2>
      <p className="mt-2 text-sm text-gray-600">
        Récapitulatif : <strong>{request.nicheTheme}</strong> — plateformes{' '}
        {request.platforms.join(', ')}.
      </p>
      <p className="mt-4 text-2xl font-bold text-gray-900">{request.monthlyAmountFormatted}</p>
      <p className="mt-1 text-xs text-gray-500">Montant mensuel récurrent (Stripe).</p>
      <button
        type="button"
        onClick={() => void startCheckout()}
        disabled={checkoutLoading}
        className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
      >
        {checkoutLoading
          ? 'Redirection vers Stripe…'
          : `Procéder au paiement → ${request.monthlyAmountFormatted}/mois`}
      </button>
      <p className="mt-4 text-xs text-gray-500">Paiement 100% sécurisé par Stripe.</p>
    </section>
  );
}
