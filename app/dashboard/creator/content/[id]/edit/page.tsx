'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { getCreatorContentById } from '@/lib/marketplace-api';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { CreatorContentMediaFields } from '@/components/creator/CreatorContentMediaFields';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CreatorStudioContentFormSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import type { CreatorContentCreateBody } from '@/types/creator-content';

const GENRES = ['Tech', 'Lifestyle', 'Business', 'Art', 'Sport', 'Music', 'Other'] as const;

const schema = z.object({
  title: z.string().max(200).optional(),
  genre: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  mediaUrl: z.string().min(1, 'Upload a media file.'),
  priceInfo: z.string().max(200).optional(),
  toolsUsed: z.array(z.object({ value: z.string() })).max(10),
  tags: z.array(z.object({ value: z.string() })).max(10),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function EditCreatorContentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrichment, setEnrichment] = useState<Pick<
    CreatorContentCreateBody,
    'mediaType' | 'textColor' | 'moodLabel' | 'moodEmoji' | 'taggedUserIds'
  >>({
    mediaType: 'FILE',
    textColor: null,
    moodLabel: null,
    moodEmoji: null,
    taggedUserIds: [],
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      genre: '',
      description: '',
      mediaUrl: '',
      priceInfo: '',
      toolsUsed: [],
      tags: [],
      isPublic: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'toolsUsed' });
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({ control, name: 'tags' });
  const mediaUrl = watch('mediaUrl');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const item = await getCreatorContentById(params.id);
      reset({
        title: item.title ?? '',
        genre: item.genre ?? '',
        description: item.description ?? '',
        mediaUrl: item.mediaUrl ?? '',
        priceInfo: item.priceInfo ?? '',
        toolsUsed: item.toolsUsed.map((v) => ({ value: v })),
        tags: (item.tags ?? []).map((v) => ({ value: v })),
        isPublic: item.isPublic,
      });
      setEnrichment({
        mediaType: item.mediaType ?? 'FILE',
        textColor: item.textColor ?? null,
        moodLabel: item.moodLabel ?? null,
        moodEmoji: item.moodEmoji ?? null,
        taggedUserIds: item.taggedUsers?.map((u) => u.id) ?? [],
      });
    } catch (e) {
      setLoadError(getApiErrorMessage(e, 'Unable to load this content.'));
    } finally {
      setLoading(false);
    }
  }, [params.id, reset]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasRole('ROLE_CREATOR')) {
    return (
      <DashboardHomeShell>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900">
          This section is reserved for creator accounts.
        </div>
      </DashboardHomeShell>
    );
  }

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    const tools = data.toolsUsed.map((t) => t.value.trim()).filter(Boolean);
    const tags = data.tags.map((t) => t.value.trim()).filter(Boolean);
    const body: CreatorContentCreateBody = {
      title: data.title?.trim() || null,
      genre: data.genre?.trim() || null,
      description: data.description?.trim() || null,
      mediaUrl: data.mediaUrl.trim(),
      priceInfo: data.priceInfo?.trim() || null,
      toolsUsed: tools,
      tags,
      isPublic: data.isPublic,
      ...enrichment,
    };
    try {
      await api.put(`/api/creator/content/${encodeURIComponent(params.id)}`, body);
      router.push('/dashboard/creator?tab=content');
      router.refresh();
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Update failed.'));
    }
  };

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <Link href="/dashboard/creator?tab=content" className="text-sm text-orange-600 hover:text-orange-700">
            ← My content
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Edit content</h1>
        </div>

        {loadError && <ErrorAlert message={loadError} onDismiss={() => setLoadError(null)} />}
        {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

        {loading ? (
          <CreatorStudioContentFormSkeleton />
        ) : (
          !loadError && (
            <form className="space-y-10" onSubmit={handleSubmit(onSubmit)} noValidate>
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900">Information</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Title <span className="text-gray-400">(optional)</span>
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
                      Category
                    </label>
                    <input
                      id="genre"
                      list="genre-options"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="e.g. Branding, Motion, Tech…"
                      {...register('genre')}
                    />
                    <datalist id="genre-options">
                      {GENRES.map((g) => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>
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
                <h2 className="text-sm font-semibold text-gray-900">Media</h2>
                <div className="mt-4">
                  <CreatorContentMediaFields
                    locale="en"
                    mediaUrl={mediaUrl ?? ''}
                    mediaError={errors.mediaUrl?.message}
                    onMediaUrlChange={(url) => setValue('mediaUrl', url, { shouldValidate: true })}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900">Details & visibility</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="priceInfo" className="text-sm font-medium text-gray-700">
                      Price to recreate this edit <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      id="priceInfo"
                      placeholder="e.g. €500 for a similar edit"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      {...register('priceInfo')}
                    />
                    {errors.priceInfo && (
                      <p className="mt-1 text-xs text-red-600">{errors.priceInfo.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-gray-700">Tags (optional)</p>
                      <button
                        type="button"
                        disabled={tagFields.length >= 10}
                        onClick={() => appendTag({ value: '' })}
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40"
                      >
                        + Add tag
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {tagFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <input
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Tag"
                            {...register(`tags.${index}.value` as const)}
                          />
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            aria-label="Remove tag"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-gray-700">Tools used (optional)</p>
                      <button
                        type="button"
                        disabled={fields.length >= 10}
                        onClick={() => append({ value: '' })}
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40"
                      >
                        + Add tool
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
                            aria-label="Remove tool"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-sm text-gray-800">
                    <input type="checkbox" className="rounded border-gray-300" {...register('isPublic')} />
                    Visible on the marketplace
                  </label>
                </div>
              </section>

              <div className="flex justify-end gap-3">
                <Link
                  href="/dashboard/creator?tab=content"
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Saving…</span>
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </DashboardHomeShell>
  );
}
