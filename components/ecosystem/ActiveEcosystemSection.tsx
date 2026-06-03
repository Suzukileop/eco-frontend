'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyScheduledPosts, getScheduledConfig } from '@/lib/ecosystem';
import { ECOSYSTEM_DAY_LABELS, type NicheRequestResponse, type PublicationSlotDto } from '@/types/ecosystem';
import type { ScheduledPostDto } from '@/types/scheduler';
import { SchedulePostModal, type PrefillNiche } from '@/components/SchedulePostModal';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

type Props = {
  request: NicheRequestResponse;
};

export function ActiveEcosystemSection({ request }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [posts, setPosts] = useState<ScheduledPostDto[]>([]);
  const [configSlots, setConfigSlots] = useState<PublicationSlotDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const prefill: PrefillNiche = useMemo(
    () => ({ nicheCode: request.uniqueCode, nicheTheme: request.nicheTheme }),
    [request.uniqueCode, request.nicheTheme]
  );

  const load = useCallback(async () => {
    try {
      setError(null);
      const [page, cfg] = await Promise.all([
        getMyScheduledPosts(0, 20),
        getScheduledConfig(request.id).catch(() => null),
      ]);
      const nichePosts = page.content.filter(
        (p) => p.nicheRef && p.nicheRef.trim().toUpperCase() === request.uniqueCode.trim().toUpperCase()
      );
      setPosts(nichePosts.slice(0, 5));
      if (cfg?.publicationSlots?.length) {
        setConfigSlots(
          [...cfg.publicationSlots].sort(
            (a, b) => a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time)
          )
        );
      } else {
        setConfigSlots([]);
      }
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger les publications récentes.'));
    }
  }, [request.id, request.uniqueCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const scheduleByDay = useMemo(() => {
    const order = [1, 2, 3, 4, 5, 6, 0] as const;
    return order
      .map((d) => {
        const times = configSlots
          .filter((s) => s.dayOfWeek === d)
          .map((s) => s.time)
          .sort((a, b) => a.localeCompare(b));
        if (times.length === 0) return null;
        return { day: d, label: ECOSYSTEM_DAY_LABELS[d] ?? '?', times };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);
  }, [configSlots]);

  const nextPost = useMemo(() => {
    const now = Date.now();
    const upcoming = posts
      .filter((p) => p.status === 'SCHEDULED' || p.status === 'DRAFT')
      .map((p) => ({ ...p, t: new Date(p.scheduledAt).getTime() }))
      .filter((p) => !Number.isNaN(p.t) && p.t > now)
      .sort((a, b) => a.t - b.t);
    return upcoming[0] ?? null;
  }, [posts]);

  const activated = request.activatedAt ? new Date(request.activatedAt) : null;

  return (
    <section className="space-y-6">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      <SchedulePostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onScheduled={() => void load()}
        prefillNiche={prefill}
      />

      <div className="rounded-2xl border border-green-200 bg-green-50/80 p-6 shadow-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-900">
          🟢 Actif
          {activated && (
            <span className="font-normal text-green-800">
              depuis {activated.toLocaleDateString('fr-FR')}
            </span>
          )}
        </span>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Résumé</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Niche</dt>
            <dd className="font-medium text-gray-900">{request.nicheTheme}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Code</dt>
            <dd className="font-mono font-medium text-gray-900">{request.uniqueCode}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Publications / semaine</dt>
            <dd className="font-medium text-gray-900">{request.nbPostsPerWeek}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Abonnement</dt>
            <dd className="font-medium text-gray-900">{request.monthlyAmountFormatted} / mois</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Planning configuré</h3>
            {configSlots.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">Aucun créneau chargé.</p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {scheduleByDay.map(({ day, label, times }) => (
                  <div key={day} className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900">{label}</span>
                      <span className="shrink-0 text-[11px] text-gray-500">
                        {times.length} envoi{times.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-gray-700">{times.join(' · ')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500">Réglages dans cette page et vos notifications.</span>
        </div>
        <p className="mt-4 text-sm text-gray-700">
          Prochain post prévu :{' '}
          {nextPost ? (
            <strong>
              {new Date(nextPost.scheduledAt).toLocaleString('fr-FR')} — {String(nextPost.platform)}
            </strong>
          ) : (
            <span className="text-gray-500">aucune publication planifiée à venir pour cette niche</span>
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Publications récentes</h3>
        <ul className="mt-4 divide-y divide-gray-100">
          {posts.length === 0 ? (
            <li className="py-6 text-center text-sm text-gray-500">Aucune publication listée pour ce code niche.</li>
          ) : (
            posts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-medium text-gray-900">{String(p.platform)}</span>
                <span className="text-gray-600">{new Date(p.scheduledAt).toLocaleString('fr-FR')}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800">{p.status}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
      >
        Planifier un post maintenant
      </button>
    </section>
  );
}
