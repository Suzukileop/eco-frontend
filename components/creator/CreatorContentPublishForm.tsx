'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/AuthContext';
import { ContentTitleField } from '@/components/creator/ContentTitleField';
import { ContentVisibilityToggle } from '@/components/creator/ContentVisibilityToggle';
import { ContentCommentsToggle } from '@/components/creator/ContentCommentsToggle';
import { CreatorContentComposeTools } from '@/components/creator/CreatorContentComposeTools';
import {
  ContentMediaPreview,
  useContentMediaUpload,
} from '@/components/creator/creator-content-media';
import {
  CREATOR_CONTENT_GENRES,
  creatorContentPublishDefaults,
  creatorContentPublishSchema,
  creatorContentPublishStep1Schema,
  type CreatorContentPublishFormValues,
} from '@/components/creator/creator-content-form';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { CreatorContentCreateBody } from '@/types/creator-content';

type CreatorContentPublishFormProps = {
  formId: string;
  onCancel: () => void;
  onSuccess: () => void;
  onSubmittingChange?: (submitting: boolean) => void;
  submitError: string | null;
  onSubmitError: (message: string | null) => void;
  onUploadErrorChange?: (message: string | null) => void;
  onStepChange?: (step: 1 | 2) => void;
};

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

export function CreatorContentPublishForm({
  formId,
  onCancel,
  onSuccess,
  onSubmittingChange,
  submitError,
  onSubmitError,
  onUploadErrorChange,
  onStepChange,
}: CreatorContentPublishFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreatorContentPublishFormValues>({
    resolver: zodResolver(creatorContentPublishSchema),
    defaultValues: creatorContentPublishDefaults,
    mode: 'onTouched',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'toolsUsed' });
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({ control, name: 'tags' });
  const mediaUrl = watch('mediaUrl');
  const mediaType = watch('mediaType');
  const title = watch('title');
  const moodLabel = watch('moodLabel');
  const moodEmoji = watch('moodEmoji');
  const taggedUsers = watch('taggedUsers');
  const isPublic = watch('isPublic');
  const commentsEnabled = watch('commentsEnabled');

  const media = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => {
      setValue('mediaUrl', url, { shouldValidate: true });
      setValue('mediaType', 'FILE', { shouldValidate: true });
    },
  });

  useEffect(() => {
    onUploadErrorChange?.(media.uploadError);
  }, [media.uploadError, onUploadErrorChange]);

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  const hasMedia = Boolean(mediaUrl?.trim());

  const goToStep2 = async () => {
    onSubmitError(null);
    const values = getValues();
    const parsed = creatorContentPublishStep1Schema.safeParse({
      title: values.title,
      mediaUrl: values.mediaUrl,
      mediaType: values.mediaType,
      moodLabel: values.moodLabel,
      moodEmoji: values.moodEmoji,
      taggedUsers: values.taggedUsers,
    });
    if (!parsed.success) {
      await trigger(['mediaUrl']);
      return;
    }
    setStep(2);
  };

  const goToStep1 = () => {
    onSubmitError(null);
    setStep(1);
  };

  const publishContent = async (data: CreatorContentPublishFormValues) => {
    onSubmitError(null);
    onSubmittingChange?.(true);
    const tools = data.toolsUsed.map((t) => t.value.trim()).filter(Boolean);
    const tags = data.tags.map((t) => t.value.trim()).filter(Boolean);
    const body: CreatorContentCreateBody = {
      title: data.title?.trim() || null,
      genre: data.genre?.trim() || null,
      description: data.description?.trim() || null,
      mediaUrl: data.mediaUrl.trim(),
      mediaType: data.mediaType ?? 'FILE',
      moodLabel: data.moodLabel ?? null,
      moodEmoji: data.moodEmoji ?? null,
      taggedUserIds: data.taggedUsers.map((u) => u.id),
      priceInfo: data.priceInfo?.trim() || null,
      toolsUsed: tools,
      tags,
      isPublic: data.isPublic,
      commentsEnabled: data.commentsEnabled,
    };
    try {
      await api.post('/api/creator/content', body);
      onSuccess();
    } catch (e) {
      onSubmitError(getApiErrorMessage(e, 'Unable to publish content.'));
    } finally {
      onSubmittingChange?.(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      void goToStep2();
      return;
    }
    void handleSubmit(publishContent)(e);
  };

  const fieldClass =
    'mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white';

  const labelClass = 'text-[11px] font-semibold uppercase tracking-wider text-neutral-500';

  const creatorName = user?.fullName ?? 'You';

  return (
    <div className={step === 2 ? 'flex min-h-0 flex-1 flex-col' : 'flex flex-col'}>
      {submitError && (
        <div className="mb-3 shrink-0">
          <ErrorAlert message={submitError} onDismiss={() => onSubmitError(null)} />
        </div>
      )}

      <form
        id={formId}
        className={step === 2 ? 'flex min-h-0 flex-1 flex-col' : 'flex flex-col'}
        onSubmit={onFormSubmit}
        noValidate
      >
        <input
          ref={media.inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,.pdf"
          className="sr-only"
          onChange={(e) => void media.onFileChange(e)}
        />

        {step === 1 ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-11 w-11 rounded-xl object-cover ring-2 ring-white dark:ring-neutral-800"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-sm">
                      {userInitials(creatorName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">{creatorName}</p>
                    <p className="text-xs text-neutral-500">Creator Studio</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ContentVisibilityToggle
                    value={isPublic}
                    onChange={(v) => setValue('isPublic', v, { shouldValidate: true })}
                  />
                  <ContentCommentsToggle
                    value={commentsEnabled}
                    onChange={(v) => setValue('commentsEnabled', v, { shouldValidate: true })}
                  />
                </div>
              </div>

              {(moodLabel || taggedUsers.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {moodLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                      {moodEmoji} <span className="capitalize">{moodLabel}</span>
                    </span>
                  )}
                  {taggedUsers.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 dark:bg-violet-500/10 dark:text-violet-300"
                    >
                      @{u.fullName}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-neutral-200/60 bg-white/80 px-3 py-2.5 dark:border-neutral-700/60 dark:bg-neutral-950/50">
                <ContentTitleField
                  id="content-title"
                  value={title ?? ''}
                  onChange={(v) => setValue('title', v, { shouldValidate: true })}
                  placeholder="Post headline"
                  error={errors.title?.message}
                  rows={2}
                />
              </div>

              {hasMedia && (
                <div className="mt-4">
                  <ContentMediaPreview
                    fluid
                    hideWhenEmpty
                    locale="en"
                    mediaUrl={mediaUrl ?? ''}
                    fileName={media.fileName}
                    mediaType={mediaType}
                  />
                </div>
              )}
              {errors.mediaUrl && (
                <p className="mt-2 text-xs text-red-600">{errors.mediaUrl.message}</p>
              )}

              <div className="mt-4">
                <CreatorContentComposeTools
                  locale="en"
                  moodLabel={moodLabel ?? null}
                  moodEmoji={moodEmoji ?? null}
                  taggedUsers={taggedUsers}
                  hasMedia={hasMedia}
                  onMoodChange={(mood) => {
                    setValue('moodLabel', mood?.label ?? null, { shouldValidate: true });
                    setValue('moodEmoji', mood?.emoji ?? null, { shouldValidate: true });
                  }}
                  onTaggedUsersChange={(users) => setValue('taggedUsers', users, { shouldValidate: true })}
                  onMediaPick={() => media.pickFile()}
                  mediaUploading={media.uploading}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
            <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Optional details for{' '}
              <span className="font-semibold text-neutral-900 dark:text-white">
                {title?.trim() || 'your publication'}
              </span>
              .
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="content-genre" className={labelClass}>
                  Category <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </label>
                <input
                  id="content-genre"
                  list="content-genre-options"
                  className={fieldClass}
                  placeholder="e.g. Branding, Motion, Tech…"
                  {...register('genre')}
                />
                <datalist id="content-genre-options">
                  {CREATOR_CONTENT_GENRES.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="content-price" className={labelClass}>
                  Price to recreate this edit{' '}
                  <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </label>
                <input
                  id="content-price"
                  className={fieldClass}
                  placeholder="e.g. €500 for a similar edit"
                  {...register('priceInfo')}
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  What you would charge to produce the same montage again.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="content-description" className={labelClass}>
                Description <span className="font-normal normal-case text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="content-description"
                rows={4}
                className={fieldClass}
                placeholder="Describe your content for buyers…"
                {...register('description')}
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
              <div className="flex items-center justify-between gap-4">
                <p className={labelClass}>
                  Tags <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </p>
                <button
                  type="button"
                  disabled={tagFields.length >= 10}
                  onClick={() => appendTag({ value: '' })}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400"
                >
                  + Add tag
                </button>
              </div>
              {tagFields.length > 0 && (
                <div className="mt-3 space-y-2">
                  {tagFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        className={`${fieldClass} mt-0`}
                        placeholder="Tag"
                        {...register(`tags.${index}.value` as const)}
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="shrink-0 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-white dark:border-neutral-700 dark:text-neutral-400"
                        aria-label="Remove tag"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
              <div className="flex items-center justify-between gap-4">
                <p className={labelClass}>
                  Tools used <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </p>
                <button
                  type="button"
                  disabled={fields.length >= 10}
                  onClick={() => append({ value: '' })}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400"
                >
                  + Add tool
                </button>
              </div>
              {fields.length > 0 && (
                <div className="mt-3 space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        className={`${fieldClass} mt-0`}
                        placeholder="Tool name"
                        {...register(`toolsUsed.${index}.value` as const)}
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="shrink-0 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-white dark:border-neutral-700 dark:text-neutral-400"
                        aria-label="Remove tool"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.toolsUsed && <p className="mt-2 text-xs text-red-600">{errors.toolsUsed.message}</p>}
            </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex shrink-0 flex-col gap-2.5 border-t border-neutral-100 pt-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step === 2 ? (
              <button
                type="button"
                onClick={goToStep1}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : (
              <p className="text-xs text-neutral-500">
                {isPublic ? 'Visible sur le marketplace' : 'Visible uniquement par vous'}
                {commentsEnabled ? ' · Commentaires activés' : ' · Commentaires désactivés'}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                type="submit"
                aria-label="Continue to details"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm transition hover:bg-orange-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Publishing…</span>
                  </>
                ) : (
                  'Publish'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
