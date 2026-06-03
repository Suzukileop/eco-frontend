'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { cancelRequest, getChatHistoryPage } from '@/lib/ecosystem';
import type { NicheRequestResponse } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: '#E1306C',
  TIKTOK: '#000000',
  YOUTUBE: '#FF0000',
  FACEBOOK: '#1877F2',
  TWITTER: '#000000',
};

type Props = {
  request: NicheRequestResponse;
  onCancelled: () => void;
};

export function WaitingAgentSection({ request, onCancelled }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChat, setHasChat] = useState(false);

  /* Aligné sur le backend : ChatMessage.room_id = "niche-" + niche_request.id (UUID) */
  const roomId = `niche-${request.id}`;

  const checkChat = useCallback(async () => {
    try {
      const page = await getChatHistoryPage(roomId, 0, 1);
      setHasChat((page.totalElements ?? page.content.length) > 0);
    } catch {
      setHasChat(false);
    }
  }, [roomId]);

  useEffect(() => {
    void checkChat();
  }, [checkChat]);

  const onConfirmCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await cancelRequest(request.id);
      setConfirmOpen(false);
      onCancelled();
    } catch (e) {
      setError(getApiErrorMessage(e, "Impossible d'annuler la demande."));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <section className="space-y-6">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden />
            En attente de votre agent
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-700">
          Votre modèle de validation sera prêt sous <strong>24–48h</strong> en moyenne.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Résumé de la demande</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Niche</dt>
            <dd className="font-medium text-gray-900">{request.nicheTheme}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Code</dt>
            <dd className="font-mono font-medium text-gray-900">{request.uniqueCode}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Plateformes</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {request.platforms.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium"
                  style={{ borderColor: PLATFORM_COLORS[p] ?? '#ccc' }}
                >
                  {p}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Publications / semaine</dt>
            <dd className="font-medium text-gray-900">{request.nbPostsPerWeek}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Estimation mensuelle</dt>
            <dd className="font-medium text-gray-900">{request.monthlyAmountFormatted}</dd>
          </div>
        </dl>
      </div>

      {hasChat && (
        <p className="text-sm text-gray-700">
          <Link href={`#chat-${request.id}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
            Aller au chat avec votre agent
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Annuler la demande
        </button>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="cancel-title" className="text-lg font-semibold text-gray-900">
              Annuler cette demande ?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Cette action est définitive pour ce dossier. Vous pourrez créer une nouvelle demande ensuite.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setConfirmOpen(false)}
              >
                Retour
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => void onConfirmCancel()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? 'Annulation…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
