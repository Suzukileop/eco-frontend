'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { fetchTarifUnitaireCents, submitNicheRequest, uploadRefFile } from '@/lib/ecosystem';
import type { EcosystemPlatform, NicheRequestFormData, RefType } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';

const LANGUAGES = ['FR', 'EN', 'ES', 'AR', 'DE', 'PT', 'IT'] as const;

const PLATFORMS: { id: EcosystemPlatform; label: string; color: string }[] = [
  { id: 'INSTAGRAM', label: 'Instagram', color: '#E1306C' },
  { id: 'TIKTOK', label: 'TikTok', color: '#000000' },
  { id: 'YOUTUBE', label: 'YouTube', color: '#FF0000' },
  { id: 'FACEBOOK', label: 'Facebook', color: '#1877F2' },
  { id: 'TWITTER', label: 'X / Twitter', color: '#000000' },
];

const REF_URL_PLATFORMS: EcosystemPlatform[] = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK'];

const schema = z
  .object({
    nicheTheme: z.string().min(1, 'Requis.').max(200),
    description: z.string().min(1, 'Requis.').max(3000),
    language: z.enum(LANGUAGES),
    nbPostsPerWeek: z.preprocess(
      (v) => (typeof v === 'string' ? Number(v) : v),
      z.number().int().min(1).max(14)
    ),
    platforms: z.array(z.enum(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER'])).min(1, 'Choisissez au moins une plateforme.'),
    refMode: z.enum(['NONE', 'MCT', 'URL', 'MP4']),
    refMctCode: z.string().optional(),
    refExternalUrl: z.string().optional(),
    refSourcePlatform: z.preprocess(
      (v) => (v === '' || v === undefined ? undefined : v),
      z.enum(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER']).optional()
    ),
  })
  .superRefine((data, ctx) => {
    if (data.refMode === 'MCT') {
      const ok = /^MCT-[A-Z0-9]{4}$/.test((data.refMctCode ?? '').trim());
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Format attendu : MCT-XXXX (majuscules et chiffres).',
          path: ['refMctCode'],
        });
      }
    }
    if (data.refMode === 'URL') {
      const u = data.refExternalUrl?.trim() ?? '';
      if (!u) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'URL requise.',
          path: ['refExternalUrl'],
        });
      } else {
        try {
          // eslint-disable-next-line no-new
          new URL(u);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'URL invalide.',
            path: ['refExternalUrl'],
          });
        }
      }
      if (!data.refSourcePlatform) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Choisissez la plateforme source.',
          path: ['refSourcePlatform'],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

function mapFormToPayload(values: FormValues): NicheRequestFormData {
  let refType: RefType | null | undefined;
  let refMctCode: string | null | undefined;
  let refExternalUrl: string | null | undefined;
  let refSourcePlatform: EcosystemPlatform | null | undefined;

  if (values.refMode === 'MCT') {
    refType = 'MCT';
    refMctCode = values.refMctCode?.trim() ?? '';
  } else if (values.refMode === 'URL') {
    refType = 'URL';
    refExternalUrl = values.refExternalUrl?.trim() ?? '';
    refSourcePlatform = values.refSourcePlatform;
  } else if (values.refMode === 'MP4') {
    refType = 'MP4';
  } else {
    refType = undefined;
  }

  return {
    nicheTheme: values.nicheTheme.trim(),
    description: values.description.trim(),
    language: values.language,
    nbPostsPerWeek: values.nbPostsPerWeek,
    platforms: values.platforms as EcosystemPlatform[],
    refType: refType ?? null,
    refMctCode: refMctCode ?? null,
    refExternalUrl: refExternalUrl ?? null,
    refSourcePlatform: refSourcePlatform ?? null,
  };
}

export default function NewEcosystemRequestPage() {
  const router = useRouter();
  const [tarifCents, setTarifCents] = useState<number>(2500);
  const [mp4File, setMp4File] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    void fetchTarifUnitaireCents().then(setTarifCents);
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      nicheTheme: '',
      description: '',
      language: 'FR',
      nbPostsPerWeek: 3,
      platforms: [],
      refMode: 'NONE',
      refMctCode: '',
      refExternalUrl: '',
      refSourcePlatform: undefined,
    },
  });

  const nb = watch('nbPostsPerWeek');
  const refMode = watch('refMode');
  const estimateEuros =
    Math.round(((nb * 4 * tarifCents) / 100 + Number.EPSILON) * 100) / 100;

  const togglePlatform = (p: EcosystemPlatform, current: EcosystemPlatform[]) => {
    if (current.includes(p)) {
      setValue(
        'platforms',
        current.filter((x) => x !== p),
        { shouldValidate: true }
      );
    } else {
      setValue('platforms', [...current, p], { shouldValidate: true });
    }
  };

  const clearReference = () => {
    setMp4File(null);
    setValue('refMode', 'NONE');
    setValue('refMctCode', '');
    setValue('refExternalUrl', '');
    setValue('refSourcePlatform', undefined);
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    if (values.refMode === 'MP4') {
      if (!mp4File) {
        setSubmitError('Choisissez un fichier MP4 ou passez à une autre option de référence.');
        return;
      }
      const maxBytes = 500 * 1024 * 1024;
      if (mp4File.size > maxBytes) {
        setSubmitError('Le fichier dépasse 500 Mo.');
        return;
      }
    }

    try {
      const payload = mapFormToPayload(values);
      const created = await submitNicheRequest(payload);
      if (values.refMode === 'MP4' && mp4File) {
        await uploadRefFile(created.id, mp4File);
      }
      router.push(`/dashboard/ecosystem/${created.id}`);
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Impossible de soumettre la demande.'));
    }
  };

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-3xl space-y-10">
        <div>
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800">
            ← Tableau de bord
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Nouvelle demande écosystème</h1>
          <p className="mt-2 text-sm text-gray-600">
            Décrivez votre niche, votre rythme et vos plateformes. Référence média optionnelle.
          </p>
        </div>

        {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          {/* SECTION A */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Votre niche</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="nicheTheme" className="block text-sm font-medium text-gray-700">
                  Thème <span className="text-red-500">*</span>
                </label>
                <input
                  id="nicheTheme"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="ex: Coach fitness pour femmes actives"
                  {...register('nicheTheme')}
                />
                {errors.nicheTheme && (
                  <p className="mt-1 text-sm text-red-600">{errors.nicheTheme.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Décrivez votre audience, votre ton, vos objectifs..."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Langue principale de vos contenus
                </label>
                <select
                  id="language"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  {...register('language')}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* SECTION B */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Fréquence & budget</h2>
            <div className="mt-6">
              <label htmlFor="nbPosts" className="block text-sm font-medium text-gray-700">
                {nb} publications / semaine
              </label>
              <input
                id="nbPosts"
                type="range"
                min={1}
                max={14}
                className="mt-3 w-full accent-indigo-600"
                {...register('nbPostsPerWeek', { valueAsNumber: true })}
              />
              <p className="mt-4 text-lg font-semibold text-gray-900">
                Estimation : {estimateEuros.toFixed(2)} € / mois
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Basé sur {nb} × 4 semaines × {(tarifCents / 100).toFixed(2)} € (tarif unitaire). Le montant final
                sera confirmé après validation de votre modèle.
              </p>
            </div>
          </section>

          {/* SECTION C */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Plateformes cibles</h2>
            <Controller
              name="platforms"
              control={control}
              render={({ field }) => (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {PLATFORMS.map((p) => {
                    const checked = field.value.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id, field.value)}
                        className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition ${
                          checked ? 'shadow-md' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          borderColor: checked ? p.color : undefined,
                          backgroundColor: checked ? `${p.color}10` : undefined,
                        }}
                      >
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.label.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-semibold text-gray-900">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.platforms && (
              <p className="mt-2 text-sm text-red-600">{errors.platforms.message}</p>
            )}
          </section>

          {/* SECTION D */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Référence (optionnel)</h2>
              <button
                type="button"
                onClick={clearReference}
                className="text-sm font-medium text-gray-600 underline hover:text-gray-900"
              >
                Aucune référence
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {(['NONE', 'MCT', 'URL', 'MP4'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setValue('refMode', mode)}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold ${
                    refMode === mode
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {mode === 'NONE' && 'Sans référence'}
                  {mode === 'MCT' && 'Modèle plateforme'}
                  {mode === 'URL' && 'URL externe'}
                  {mode === 'MP4' && 'Fichier MP4'}
                </button>
              ))}
            </div>

            {refMode === 'MCT' && (
              <div className="mt-6">
                <label htmlFor="refMctCode" className="block text-sm font-medium text-gray-700">
                  Code MCT
                </label>
                <input
                  id="refMctCode"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 font-mono text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="MCT-XXXX"
                  {...register('refMctCode')}
                />
                {errors.refMctCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.refMctCode.message}</p>
                )}
              </div>
            )}

            {refMode === 'URL' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="refExternalUrl" className="block text-sm font-medium text-gray-700">
                    URL de référence
                  </label>
                  <input
                    id="refExternalUrl"
                    type="url"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://..."
                    {...register('refExternalUrl')}
                  />
                  {errors.refExternalUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.refExternalUrl.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="refSourcePlatform" className="block text-sm font-medium text-gray-700">
                    Plateforme source
                  </label>
                  <select
                    id="refSourcePlatform"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    {...register('refSourcePlatform')}
                  >
                    <option value="">—</option>
                    {REF_URL_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.refSourcePlatform && (
                    <p className="mt-1 text-sm text-red-600">{errors.refSourcePlatform.message}</p>
                  )}
                </div>
              </div>
            )}

            {refMode === 'MP4' && (
              <div className="mt-6">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center hover:bg-gray-100">
                  <input
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setMp4File(f ?? null);
                    }}
                  />
                  <span className="text-sm font-medium text-gray-800">
                    Glissez votre fichier MP4 ici ou cliquez pour sélectionner
                  </span>
                  {mp4File && (
                    <span className="mt-2 text-xs text-gray-600">
                      {mp4File.name} — {(mp4File.size / (1024 * 1024)).toFixed(2)} Mo (max 500 Mo)
                    </span>
                  )}
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  L&apos;upload vers le stockage est déclenché après soumission du formulaire.
                </p>
              </div>
            )}
          </section>

          <div className="flex justify-end pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Envoi en cours...
                </>
              ) : (
                'Soumettre ma demande →'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardHomeShell>
  );
}
