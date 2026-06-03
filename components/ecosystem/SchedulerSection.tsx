'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getScheduledConfig, updateScheduledConfig } from '@/lib/ecosystem';
import { ECOSYSTEM_DAY_LABELS, type NicheRequestResponse, type PublicationSlotDto } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

/** Ordre d’affichage Lun → Dim ; valeurs 1–6 puis 0 (dimanche), aligné README backend. */
const WEEK_DAY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: ECOSYSTEM_DAY_LABELS[1]! },
  { value: 2, label: ECOSYSTEM_DAY_LABELS[2]! },
  { value: 3, label: ECOSYSTEM_DAY_LABELS[3]! },
  { value: 4, label: ECOSYSTEM_DAY_LABELS[4]! },
  { value: 5, label: ECOSYSTEM_DAY_LABELS[5]! },
  { value: 6, label: ECOSYSTEM_DAY_LABELS[6]! },
  { value: 0, label: ECOSYSTEM_DAY_LABELS[0]! },
];

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: '#E1306C',
  TIKTOK: '#000000',
  YOUTUBE: '#FF0000',
  FACEBOOK: '#1877F2',
  TWITTER: '#000000',
};

const DEFAULT_TIME_PALETTE = [
  '08:00',
  '12:00',
  '18:00',
  '09:00',
  '14:00',
  '21:00',
  '10:00',
  '16:00',
  '20:00',
  '11:00',
  '15:00',
  '19:00',
  '13:00',
];

/** Données API : pas de padding — au plus `nb` entrées. */
function normalizeSlotsFromApi(raw: PublicationSlotDto[] | undefined | null, nb: number): PublicationSlotDto[] {
  if (!raw?.length) return [];
  const sorted = [...raw].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time)
  );
  if (sorted.length > nb) {
    return sorted.slice(0, nb).map((s) => ({ dayOfWeek: s.dayOfWeek, time: s.time }));
  }
  return sorted.map((s) => ({ dayOfWeek: s.dayOfWeek, time: s.time }));
}

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure invalide (HH:mm).'),
});

function buildWeekSummary(slots: PublicationSlotDto[] | undefined): {
  day: number;
  label: string;
  entries: { time: string; slotIndex: number }[];
}[] {
  const list = slots ?? [];
  return WEEK_DAY_OPTIONS.map(({ value: day, label }) => {
    const entries = list
      .map((s, slotIndex) => ({ s, slotIndex }))
      .filter(({ s }) => s.dayOfWeek === day)
      .map(({ s, slotIndex }) => ({ time: s.time, slotIndex }))
      .sort((a, b) => a.time.localeCompare(b.time) || a.slotIndex - b.slotIndex);
    return { day, label, entries };
  });
}

function countOnDay(slots: PublicationSlotDto[], day: number): number {
  return slots.filter((s) => s.dayOfWeek === day).length;
}

function suggestNewTime(slots: PublicationSlotDto[], day: number, ignoreIndices: Set<number>): string {
  const used = new Set(
    slots
      .map((s, i) => (s.dayOfWeek === day && !ignoreIndices.has(i) ? s.time : null))
      .filter((x): x is string => x != null)
  );
  for (const t of DEFAULT_TIME_PALETTE) {
    if (!used.has(t)) return t;
  }
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      if (!used.has(t)) return t;
    }
  }
  return '09:00';
}

function healDuplicates(slots: PublicationSlotDto[]): PublicationSlotDto[] {
  const seen = new Set<string>();
  const next = slots.map((s) => ({ ...s }));
  for (let i = 0; i < next.length; i++) {
    let key = `${next[i]!.dayOfWeek}|${next[i]!.time}`;
    while (seen.has(key)) {
      const t = suggestNewTime(next, next[i]!.dayOfWeek, new Set([i]));
      next[i] = { dayOfWeek: next[i]!.dayOfWeek, time: t };
      key = `${next[i]!.dayOfWeek}|${next[i]!.time}`;
    }
    seen.add(key);
  }
  return next;
}

function buildSchema(nbPosts: number) {
  return z
    .object({
      publicationSlots: z.array(slotSchema),
    })
    .superRefine((data, ctx) => {
      const n = data.publicationSlots.length;
      if (n < nbPosts) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Il manque ${nbPosts - n} créneau(x) : vous en avez ${n} sur ${nbPosts} attendues pour vos publications par semaine. Complétez la liste avant d'enregistrer.`,
          path: ['publicationSlots'],
        });
      }
      if (n > nbPosts) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Trop de créneaux (${n}) : la niche prévoit ${nbPosts} publication(s) par semaine.`,
          path: ['publicationSlots'],
        });
      }
      const seen = new Set<string>();
      data.publicationSlots.forEach((s, i) => {
        const key = `${s.dayOfWeek}|${s.time}`;
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Deux créneaux identiques (même jour et même heure). Modifiez l’un des deux.',
            path: ['publicationSlots', i, 'time'],
          });
        }
        seen.add(key);
      });
    });
}

type Props = {
  request: NicheRequestResponse;
  onSaved: () => void;
};

export function SchedulerSection({ request, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [draftTime, setDraftTime] = useState('09:00');
  const [draftError, setDraftError] = useState<string | null>(null);
  const nb = request.nbPostsPerWeek;

  const schema = useMemo(() => buildSchema(nb), [nb]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      publicationSlots: [],
    },
  });

  const applySlots = useCallback(
    (next: PublicationSlotDto[]) => {
      const healed = healDuplicates(next);
      reset({ publicationSlots: healed });
    },
    [reset]
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const cfg = await getScheduledConfig(request.id);
        if (cancelled) return;
        const slots = normalizeSlotsFromApi(cfg.publicationSlots, nb);
        reset({ publicationSlots: slots });
        const first = DAY_ORDER.find((d) => countOnDay(slots, d) > 0) ?? 1;
        setActiveDay(first);
      } catch (e) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(e, 'Impossible de charger la configuration.'));
          reset({ publicationSlots: [] });
          setActiveDay(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [request.id, nb, reset]);

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await updateScheduledConfig(request.id, {
        nicheRequestId: request.id,
        publicationSlots: data.publicationSlots,
      });
      onSaved();
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Enregistrement impossible.'));
    }
  });

  const pubSlotsErr = errors.publicationSlots;
  const slotsError =
    pubSlotsErr &&
    typeof pubSlotsErr === 'object' &&
    'message' in pubSlotsErr &&
    typeof pubSlotsErr.message === 'string'
      ? pubSlotsErr.message
      : null;

  const watchedSlots = watch('publicationSlots');
  const slotCount = watchedSlots?.length ?? 0;
  const missingCount = Math.max(0, nb - slotCount);

  const weekSummary = useMemo(() => buildWeekSummary(watchedSlots), [watchedSlots]);
  const daysWithSlots = useMemo(
    () => weekSummary.filter((d) => d.entries.length > 0).length,
    [weekSummary]
  );
  const hasAnySlot = slotCount > 0;

  const indicesForActiveDay = useMemo(() => {
    const slots = watchedSlots ?? [];
    const idx = slots
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => s.dayOfWeek === activeDay)
      .map(({ i }) => i);
    idx.sort((a, b) => slots[a]!.time.localeCompare(slots[b]!.time) || a - b);
    return idx;
  }, [watchedSlots, activeDay]);

  const onThisDay = countOnDay(watchedSlots ?? [], activeDay);
  const canAppendSlot = slotCount < nb;
  const canRemoveThisDay = onThisDay > 0;

  const appendSlotForActiveDay = useCallback(() => {
    setDraftError(null);
    const slots = getValues('publicationSlots');
    if (slots.length >= nb) {
      setDraftError(`Vous ne pouvez pas dépasser ${nb} créneau(x) (publications / semaine).`);
      return;
    }
    const t = draftTime.trim();
    if (!TIME_REGEX.test(t)) {
      setDraftError('Heure invalide (format HH:mm, ex. 09:00).');
      return;
    }
    if (slots.some((s) => s.dayOfWeek === activeDay && s.time === t)) {
      setDraftError('Cette heure existe déjà pour ce jour.');
      return;
    }
    applySlots([...slots, { dayOfWeek: activeDay, time: t }]);
  }, [activeDay, applySlots, draftTime, getValues, nb]);

  const removeTimeAt = useCallback(
    (flatIndex: number) => {
      const slots = getValues('publicationSlots');
      applySlots(slots.filter((_, i) => i !== flatIndex));
    },
    [applySlots, getValues]
  );

  const removeDayFromPlanning = useCallback(
    (dayToRemove: number) => {
      const slots = getValues('publicationSlots');
      const next = slots.filter((s) => s.dayOfWeek !== dayToRemove);
      const healed = healDuplicates(next);
      applySlots(healed);
      const first = DAY_ORDER.find((d) => countOnDay(healed, d) > 0);
      setActiveDay(first !== undefined ? first : 1);
    },
    [applySlots, getValues]
  );

  useEffect(() => {
    setDraftError(null);
  }, [activeDay]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
        <div className="h-6 w-1/3 rounded bg-gray-200" />
        <div className="h-32 rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Planifier vos publications</h2>
      <p className="mt-1 text-sm text-gray-600">
        Cette niche prévoit <strong>{nb} publication(s) par semaine</strong>. Ajoutez les créneaux un par un (jour +
        heure) : rien n&apos;est pré-rempli. L&apos;aperçu se met à jour au fur et à mesure. L&apos;enregistrement
        n&apos;est possible que lorsque la liste est complète ({nb} créneaux), sans doublon jour + heure.
      </p>

      {loadError && <ErrorAlert message={loadError} />}
      {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

      {missingCount > 0 && (
        <div
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <strong className="font-semibold">Créneaux incomplets.</strong> Il manque encore{' '}
          <strong>{missingCount}</strong> créneau{missingCount > 1 ? 'x' : ''} sur {nb}. Vous en avez défini{' '}
          <strong>{slotCount}</strong>. Complétez la liste pour pouvoir enregistrer.
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Plateformes (rappel)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {request.platforms.map((p) => (
            <span
              key={p}
              className="rounded-md border px-2 py-0.5 text-xs font-medium text-gray-800"
              style={{ borderColor: PLATFORM_COLORS[p] ?? '#ccc' }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 to-white p-5 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-indigo-950">Aperçu par jour</h3>
            <p className="text-xs text-indigo-800/85">
              {daysWithSlots} jour{daysWithSlots > 1 ? 's' : ''} utilisé{daysWithSlots > 1 ? 's' : ''} ·{' '}
              <strong>
                {slotCount} / {nb}
              </strong>{' '}
              créneau{nb > 1 ? 'x' : ''} défini{slotCount > 1 ? 's' : ''}
            </p>
          </div>
          <p className="mt-1 text-xs text-indigo-900/70">
            Les numéros <span className="font-mono text-indigo-700">#n</span> correspondent à la position du créneau
            dans la liste complète (tous jours confondus).
          </p>
          {!hasAnySlot ? (
            <p className="mt-4 rounded-lg border border-dashed border-indigo-200 bg-white/60 px-4 py-6 text-center text-sm text-indigo-900/80">
              Aucun créneau pour l&apos;instant. Utilisez la zone ci-dessous pour ajouter des heures jour par jour.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {weekSummary.map(({ day, label, entries }) =>
                entries.length === 0 ? null : (
                  <div
                    key={day}
                    className="rounded-xl border border-indigo-100/80 bg-white/90 p-3 shadow-sm ring-1 ring-indigo-50"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-indigo-50 pb-2">
                      <span className="text-sm font-semibold text-gray-900">{label}</span>
                      <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-900">
                        {entries.length} envoi{entries.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {entries.map(({ time, slotIndex }) => (
                        <li
                          key={`${day}-${slotIndex}-${time}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50/80 px-2 py-1 font-mono text-xs text-indigo-950"
                        >
                          <span>{time}</span>
                          <span className="text-[10px] font-normal text-indigo-500">#{slotIndex + 1}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900">Configurer les heures</p>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Choisissez le <strong>jour à configurer</strong>, saisissez une heure puis cliquez sur{' '}
            <strong>Ajouter</strong> pour l&apos;insérer à ce jour. Chaque ligne existante peut être modifiée ou
            retirée.
          </p>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="min-w-[14rem] flex-1">
                <label
                  htmlFor="active-day-select"
                  className="block text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  Jour à configurer
                </label>
                <select
                  id="active-day-select"
                  className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={activeDay}
                  onChange={(e) => setActiveDay(Number(e.target.value))}
                >
                  {WEEK_DAY_OPTIONS.map((d) => {
                    const c = countOnDay(watchedSlots ?? [], d.value);
                    return (
                      <option key={d.value} value={d.value}>
                        {d.label}
                        {c > 0 ? ` — ${c} heure${c > 1 ? 's' : ''}` : ' — (vide)'}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeDayFromPlanning(activeDay)}
                disabled={!canRemoveThisDay}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Retirer ce jour
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 sm:p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-900/80">Nouveau créneau ce jour</p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <div className="min-w-[8rem] flex-1">
                  <label htmlFor="draft-time" className="block text-xs text-gray-600">
                    Heure
                  </label>
                  <input
                    id="draft-time"
                    type="time"
                    value={draftTime}
                    onChange={(e) => setDraftTime(e.target.value)}
                    disabled={!canAppendSlot}
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => appendSlotForActiveDay()}
                    disabled={!canAppendSlot}
                    title={!canAppendSlot ? `Quota atteint (${nb} créneaux).` : undefined}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftTime('09:00');
                      setDraftError(null);
                    }}
                    className="rounded-xl border border-red-100 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    title="Effacer l&apos;heure saisie (sans toucher aux créneaux déjà ajoutés)"
                  >
                    Retirer
                  </button>
                </div>
              </div>
              {draftError && <p className="mt-2 text-sm text-red-600">{draftError}</p>}
              {!canAppendSlot && (
                <p className="mt-2 text-xs text-gray-600">
                  Vous avez atteint les {nb} créneau(x) prévus. Retirez un créneau pour en ajouter un autre.
                </p>
              )}
            </div>

            {indicesForActiveDay.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-center text-sm text-gray-600">
                Aucune heure pour <strong>{ECOSYSTEM_DAY_LABELS[activeDay] ?? 'ce jour'}</strong>. Saisissez une heure
                ci-dessus puis <strong>Ajouter</strong>.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {indicesForActiveDay.map((flatIdx) => (
                  <li
                    key={flatIdx}
                    className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white"
                      title={`Créneau n°${flatIdx + 1} (liste globale)`}
                      aria-label={`Créneau n°${flatIdx + 1} (liste globale)`}
                    >
                      {flatIdx + 1}
                    </span>
                    <div className="min-w-[8rem] flex-1">
                      <label
                        htmlFor={`slot-time-${flatIdx}`}
                        className="block text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Heure
                      </label>
                      <input
                        id={`slot-time-${flatIdx}`}
                        type="time"
                        className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        {...register(`publicationSlots.${flatIdx}.time`)}
                      />
                      {errors.publicationSlots?.[flatIdx]?.time && (
                        <p className="mt-1 text-xs text-red-600">{errors.publicationSlots[flatIdx]?.time?.message}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => removeTimeAt(flatIdx)}
                        className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        Retirer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {slotsError && <p className="mt-3 text-sm text-red-600">{slotsError}</p>}
        </div>

        <p className="text-xs text-gray-500">
          Astuce : concentrez vos heures sur les jours où votre audience est la plus active.
        </p>

        <button
          type="submit"
          disabled={isSubmitting || missingCount > 0}
          title={missingCount > 0 ? 'Complétez tous les créneaux avant d’enregistrer.' : undefined}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer le planning'}
        </button>
      </form>
    </section>
  );
}
