'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import type { CreatorContentCreateBody } from '@/types/creator-content';

const GENRES = ['Tech', 'Lifestyle', 'Business', 'Art', 'Sport', 'Musique', 'Autre'] as const;

const schema = z
  .object({
    title: z.string().min(1, 'Titre requis.').max(200),
    genre: z.string().min(1, 'Genre requis.'),
    description: z.string().min(1, 'Description requise.').max(5000),
    mediaUrl: z.string().url('URL média invalide.'),
    thumbnailUrl: z.string(),
    priceInfo: z.string().min(1, 'Indiquez un prix ou une fourchette.'),
    toolsUsed: z.array(z.object({ value: z.string().min(1, 'Champ vide.') })).max(10),
    externalRef: z.string(),
    isPublic: z.boolean(),
  })
  .superRefine((val, ctx) => {
    const t = val.thumbnailUrl?.trim() ?? '';
    if (t !== '' && !/^https?:\/\//i.test(t)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL de miniature invalide.',
        path: ['thumbnailUrl'],
      });
    }
    const ref = val.externalRef?.trim() ?? '';
    if (ref !== '' && !/^MCT-[A-Z0-9]{4}$/.test(ref)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Format attendu : MCT-XXXX.',
        path: ['externalRef'],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export default function NewCreatorContentPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      genre: GENRES[0],
      description: '',
      mediaUrl: '',
      thumbnailUrl: '',
      priceInfo: '',
      toolsUsed: [],
      externalRef: '',
      isPublic: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'toolsUsed' });

  const mediaUrl = watch('mediaUrl');

  if (!hasRole('ROLE_CREATOR')) {
    return (
      <DashboardHomeShell>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900">
          L&apos;accès à cette section est réservé aux comptes créateur.
        </div>
      </DashboardHomeShell>
    );
  }

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    const tools = data.toolsUsed.map((t) => t.value.trim()).filter(Boolean);
    const thumb = data.thumbnailUrl?.trim();
    const ext = data.externalRef?.trim();
    const body: CreatorContentCreateBody = {
      title: data.title,
      genre: data.genre,
      description: data.description,
      mediaUrl: data.mediaUrl,
      ...(thumb ? { thumbnailUrl: thumb } : {}),
      priceInfo: data.priceInfo,
      toolsUsed: tools,
      ...(ext ? { externalRef: ext } : {}),
      isPublic: data.isPublic,
    };
    try {
      await api.post('/api/creator/content', body);
      router.push('/dashboard/creator/content');
      router.refresh();
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Publication impossible.'));
    }
  };

  const previewOk = /^https?:\/\//i.test(mediaUrl ?? '');

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <Link href="/dashboard/creator/content" className="text-sm text-indigo-600 hover:text-indigo-800">
            ← Mes contenus
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Publier un contenu</h1>
        </div>

        {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

        <form className="space-y-10" onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Informations</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  id="title"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="genre" className="text-sm font-medium text-gray-700">
                  Genre
                </label>
                <select
                  id="genre"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  {...register('genre')}
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.genre && (
                  <p className="mt-1 text-xs text-red-600">{errors.genre.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Médias</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="mediaUrl" className="text-sm font-medium text-gray-700">
                  URL du média principal
                </label>
                <input
                  id="mediaUrl"
                  type="url"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  {...register('mediaUrl')}
                />
                {errors.mediaUrl && (
                  <p className="mt-1 text-xs text-red-600">{errors.mediaUrl.message}</p>
                )}
              </div>
              {previewOk && (
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <p className="border-b border-gray-100 px-3 py-2 text-xs text-gray-500">Aperçu</p>
                  <div className="aspect-video w-full max-w-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="thumbnailUrl" className="text-sm font-medium text-gray-700">
                  URL miniature (optionnel)
                </label>
                <input
                  id="thumbnailUrl"
                  type="url"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  {...register('thumbnailUrl')}
                />
                {errors.thumbnailUrl && (
                  <p className="mt-1 text-xs text-red-600">{errors.thumbnailUrl.message}</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Détails & visibilité</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="priceInfo" className="text-sm font-medium text-gray-700">
                  Prix / budget affiché
                </label>
                <input
                  id="priceInfo"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  {...register('priceInfo')}
                />
                {errors.priceInfo && (
                  <p className="mt-1 text-xs text-red-600">{errors.priceInfo.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-gray-700">Outils utilisés</p>
                  <button
                    type="button"
                    disabled={fields.length >= 10}
                    onClick={() => append({ value: '' })}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
                  >
                    + Ajouter un outil
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        {...register(`toolsUsed.${index}.value` as const)}
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        aria-label="Retirer cet outil"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {errors.toolsUsed && (
                  <p className="mt-1 text-xs text-red-600">{errors.toolsUsed.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="externalRef" className="text-sm font-medium text-gray-700">
                  Référence externe (optionnel)
                </label>
                <input
                  id="externalRef"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="MCT-XXXX"
                  {...register('externalRef')}
                />
                {errors.externalRef && (
                  <p className="mt-1 text-xs text-red-600">{errors.externalRef.message}</p>
                )}
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-800">
                <input type="checkbox" className="rounded border-gray-300" {...register('isPublic')} />
                Visible sur la marketplace
              </label>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/dashboard/creator/content"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Publication…</span>
                </>
              ) : (
                'Publier'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardHomeShell>
  );
}
