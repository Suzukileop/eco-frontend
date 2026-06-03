'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { validateModel } from '@/lib/ecosystem';
import type { NicheRequestResponse } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

function mediaKind(url: string): 'video' | 'image' | 'other' {
  const lower = url.split('?')[0]?.toLowerCase() ?? '';
  if (/\.(mp4|webm|ogg)$/i.test(lower)) return 'video';
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(lower)) return 'image';
  return 'other';
}

/** URLs sans extension (S3, CDN signées…) : essai vidéo → image → lien. */
function UnknownDemoMedia({ url }: { url: string }) {
  const [step, setStep] = useState(0);
  if (step === 0) {
    return (
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className="max-h-80 w-full bg-black"
        onError={() => setStep(1)}
      >
        <track kind="captions" />
      </video>
    );
  }
  if (step === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="Aperçu démo"
        className="max-h-80 w-full object-contain"
        onError={() => setStep(2)}
      />
    );
  }
  return (
    <div className="p-6">
      <p className="text-sm text-gray-600">
        Impossible d&apos;afficher l&apos;aperçu ici (format, en-têtes du serveur ou lien expiré).
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex font-semibold text-indigo-600 hover:text-indigo-800"
      >
        Ouvrir la démo dans un nouvel onglet →
      </a>
    </div>
  );
}

function DemoPreview({ demoUrl }: { demoUrl: string }) {
  const kind = mediaKind(demoUrl);
  if (kind === 'video') {
    return (
      <video src={demoUrl} controls playsInline preload="metadata" className="max-h-80 w-full bg-black">
        <track kind="captions" />
      </video>
    );
  }
  if (kind === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={demoUrl} alt="Aperçu du modèle proposé" className="max-h-80 w-full object-contain" />
    );
  }
  return <UnknownDemoMedia url={demoUrl} />;
}

const refuseSchema = z.object({
  rejectionReason: z.string().max(500).optional(),
});

type RefuseForm = z.infer<typeof refuseSchema>;

type Props = {
  request: NicheRequestResponse;
};

export function ValidateModelSection({ request }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const demoUrl = request.demoContentUrl?.trim() ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RefuseForm>({
    resolver: zodResolver(refuseSchema),
    defaultValues: { rejectionReason: '' },
  });

  const onAccept = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await validateModel(request.id, { accepted: true });
      const checkout = res.stripeCheckoutUrl?.trim();
      if (checkout) {
        window.location.href = checkout;
        return;
      }
      router.refresh();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Validation impossible.'));
    } finally {
      setBusy(false);
    }
  };

  const onRefuseSubmit = handleSubmit(async (data) => {
    setBusy(true);
    setError(null);
    try {
      await validateModel(request.id, {
        accepted: false,
        rejectionReason: data.rejectionReason?.trim() || 'Refusé par le client',
      });
      setModalOpen(false);
      reset();
      router.push('/dashboard/requests');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Action impossible.'));
    } finally {
      setBusy(false);
    }
  });

  return (
    <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">Votre modèle de validation est prêt !</h2>
      {request.agentNotes && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-800">
          <p className="font-semibold text-gray-900">Notes de l&apos;agent</p>
          <p className="mt-2 whitespace-pre-wrap">{request.agentNotes}</p>
        </div>
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700">Aperçu du contenu de démo</p>
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-black/5">
          {!demoUrl ? (
            <p className="p-6 text-sm text-gray-600">Aucune URL de démo fournie pour le moment.</p>
          ) : (
            <DemoPreview demoUrl={demoUrl} />
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onAccept()}
          className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {busy ? 'Validation…' : '✅ Valider ce modèle'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setModalOpen(true)}
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60"
        >
          ❌ Refuser et annuler
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="refuse-title"
        >
          <form onSubmit={onRefuseSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="refuse-title" className="text-lg font-semibold text-gray-900">
              Refuser la proposition ?
            </h2>
            <label htmlFor="rejectionReason" className="mt-4 block text-sm font-medium text-gray-700">
              Raison du refus (optionnel)
            </label>
            <textarea
              id="rejectionReason"
              rows={4}
              {...register('rejectionReason')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.rejectionReason && (
              <p className="mt-1 text-sm text-red-600">{errors.rejectionReason.message}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setModalOpen(false)}
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? 'Envoi…' : 'Confirmer le refus'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
