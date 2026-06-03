'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type OrderCreatorCtaProps = {
  creatorId: string;
  isAuthenticated: boolean;
};

export function OrderCreatorCta({ creatorId, isAuthenticated }: OrderCreatorCtaProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(pathname || `/marketplace/${creatorId}`);
    return (
      <Link
        href={`/login?redirect=${redirect}`}
        className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 sm:w-auto"
      >
        Connectez-vous pour commander
      </Link>
    );
  }

  const onNotify = () => {
    setFeedback(
      email.trim()
        ? `Merci ! Nous enregistrons ${email} pour la file d’attente (Sprint 5).`
        : 'Merci pour votre intérêt — la commande en ligne arrive très bientôt !'
    );
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setFeedback(null);
        }}
        className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 sm:w-auto"
      >
        Commander ce créateur
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-[101] w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-gray-900">Bientôt disponible</h2>
            <p className="mt-2 text-sm text-gray-600">
              Fonctionnalité disponible très bientôt ! Vous pourrez initier une commande directement
              depuis ce profil.
            </p>
            <label htmlFor="notify-email" className="mt-4 block text-sm font-medium text-gray-700">
              Être notifié quand c&apos;est disponible (optionnel)
            </label>
            <input
              id="notify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="vous@exemple.com"
            />
            {feedback && (
              <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{feedback}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => onNotify()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
