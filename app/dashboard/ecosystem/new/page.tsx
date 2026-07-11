'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { MultiSelectDropdown } from '@/components/ui/MultiSelectDropdown';
import { PopularNichesPanel } from '@/components/ecosystem/PopularNichesPanel';
import { ECOSYSTEM_PLATFORMS, PlatformLogoIcon } from '@/components/ecosystem/PlatformLogoIcon';
import { brandSolidBg } from '@/components/landing/landingBrand';
import { fetchTarifUnitaireCents, submitNicheRequest, uploadRefFile } from '@/lib/ecosystem';
import type { EcosystemPlatform, NicheRequestFormData, RefType } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';

const LANGUAGES = [
  { code: 'FR', label: 'French' },
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Spanish' },
  { code: 'AR', label: 'Arabic' },
  { code: 'DE', label: 'German' },
  { code: 'PT', label: 'Portuguese' },
  { code: 'IT', label: 'Italian' },
] as const;

const LANGUAGE_CODES = ['FR', 'EN', 'ES', 'AR', 'DE', 'PT', 'IT'] as const;

const LANGUAGE_OPTIONS = LANGUAGES.map((l) => ({ value: l.code, label: l.label }));
const MAX_LANGUAGES = 3;

const REF_URL_PLATFORMS: EcosystemPlatform[] = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK'];

const fieldClass =
  'ecosystem-form-field w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-[#F97316]/50 focus:ring-2 focus:ring-[#F97316]/15 dark:border-neutral-700 dark:text-white';

const fieldBgClass = 'bg-neutral-50 dark:bg-neutral-800/60';

const fieldEmptyClass = 'bg-white dark:bg-neutral-900';
const fieldFilledClass = 'bg-neutral-100 dark:bg-neutral-800';

const formSurfaceClass =
  'rounded-2xl border border-neutral-200 bg-neutral-100 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900';

const innerCardClass =
  'rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60';

const labelClass = 'block text-sm font-semibold text-neutral-700 dark:text-neutral-300';

function filledFieldClass(value: string | undefined) {
  return value?.trim() ? fieldFilledClass : fieldEmptyClass;
}

const schema = z
  .object({
    nicheTheme: z.string().min(1, 'Required.').max(200),
    description: z.string().min(1, 'Required.').max(3000),
    languages: z
      .array(z.enum(LANGUAGE_CODES))
      .min(1, 'Select at least one language.')
      .max(MAX_LANGUAGES, `Maximum ${MAX_LANGUAGES} languages.`),
    nbPostsPerWeek: z.preprocess(
      (v) => (typeof v === 'string' ? Number(v) : v),
      z.number().int().min(1).max(14)
    ),
    platforms: z.array(z.enum(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER'])).min(1, 'Select at least one platform.'),
    refMode: z.enum(['NONE', 'MCT', 'URL', 'MP4']),
    refMctCode: z.string().optional(),
    refExternalUrl: z.string().optional(),
    refSourcePlatform: z.preprocess(
      (v) => (v === '' || v === undefined ? undefined : v),
      z.enum(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER']).optional()
    ),
  })
  .superRefine((data, ctx) => {
    if (data.languages.join(',').length > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Too many languages selected.',
        path: ['languages'],
      });
    }
    if (data.refMode === 'MCT') {
      const ok = /^MCT-[A-Z0-9]{4}$/.test((data.refMctCode ?? '').trim());
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expected format: MCT-XXXX (uppercase letters and digits).',
          path: ['refMctCode'],
        });
      }
    }
    if (data.refMode === 'URL') {
      const u = data.refExternalUrl?.trim() ?? '';
      if (!u) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'URL is required.',
          path: ['refExternalUrl'],
        });
      } else {
        try {
          // eslint-disable-next-line no-new
          new URL(u);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid URL.',
            path: ['refExternalUrl'],
          });
        }
      }
      if (!data.refSourcePlatform) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select the source platform.',
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
    language: values.languages.join(','),
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
  const [tarifCents, setTarifCents] = useState<number>(1000);
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
      languages: ['EN'],
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
  const refMctCode = watch('refMctCode');
  const refExternalUrl = watch('refExternalUrl');
  const refSourcePlatform = watch('refSourcePlatform');
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
        setSubmitError('Choose an MP4 file or switch to another reference option.');
        return;
      }
      const maxBytes = 500 * 1024 * 1024;
      if (mp4File.size > maxBytes) {
        setSubmitError('File exceeds 500 MB.');
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
      setSubmitError(getApiErrorMessage(e, 'Unable to submit the request.'));
    }
  };

  return (
    <DashboardHomeShell wide>
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          {submitError && (
            <div className="mb-6">
              <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />
            </div>
          )}

          <Link
            href="/dashboard/ecosystem"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            ← Back to Ecosystem
          </Link>

          <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            New request
          </h1>

          <form onSubmit={handleSubmit(onSubmit)}>
          <div className={formSurfaceClass}>
            <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <div className="flex h-full flex-col gap-6">
                <div>
                  <label htmlFor="nicheTheme" className={labelClass}>
                    Theme <span className="text-[#F97316]">*</span>
                  </label>
                  <input
                    id="nicheTheme"
                    className={`mt-1.5 ${fieldClass} ${fieldBgClass}`}
                    placeholder="e.g. Fitness coach for active women"
                    {...register('nicheTheme')}
                  />
                  {errors.nicheTheme && (
                    <p className="mt-1 text-sm text-red-600">{errors.nicheTheme.message}</p>
                  )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                  <label htmlFor="description" className={labelClass}>
                    Description <span className="text-[#F97316]">*</span>
                  </label>
                  <textarea
                    id="description"
                    className={`mt-1.5 min-h-[7.5rem] flex-1 w-full resize-none ${fieldClass} ${fieldBgClass}`}
                    placeholder="Describe your audience, tone, and goals..."
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className={`shrink-0 ${innerCardClass}`}>
                  <p className={labelClass}>Target platforms</p>
                  <Controller
                    name="platforms"
                    control={control}
                    render={({ field }) => (
                      <div className="mt-4 grid w-full grid-cols-5 gap-4 sm:gap-6">
                        {ECOSYSTEM_PLATFORMS.map((p) => {
                          const checked = field.value.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              title={p.label}
                              aria-label={p.label}
                              aria-pressed={checked}
                              onClick={() => togglePlatform(p.id, field.value)}
                              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white transition dark:bg-neutral-900 ${
                                checked
                                  ? 'border-[#F97316] shadow-[0_0_0_3px_rgba(249,115,22,0.15)]'
                                  : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                              }`}
                            >
                              <PlatformLogoIcon platform={p.id} className="h-6 w-6" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.platforms && (
                    <p className="mt-2 text-sm text-red-600">{errors.platforms.message}</p>
                  )}
                </div>
              </div>

              <div className="flex h-full flex-col gap-6">
                <div>
                  <label htmlFor="languages" className={labelClass}>
                    Primary content language
                  </label>
                  <div className="mt-1.5">
                    <Controller
                      name="languages"
                      control={control}
                      render={({ field }) => (
                        <MultiSelectDropdown
                          id="languages"
                          options={LANGUAGE_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select languages"
                          maxSelections={MAX_LANGUAGES}
                          aria-label="Content languages"
                          triggerClassName={fieldBgClass}
                        />
                      )}
                    />
                  </div>
                  {errors.languages && (
                    <p className="mt-1 text-sm text-red-600">{errors.languages.message}</p>
                  )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                  <label htmlFor="nbPosts" className={labelClass}>
                    Frequency & budget
                  </label>
                  <div className="mt-1.5 flex min-h-0 flex-1 flex-col rounded-xl border border-neutral-200 bg-gradient-to-br from-[#FFF7ED]/50 via-white to-white p-5 dark:border-neutral-700 dark:from-[#F97316]/10 dark:via-neutral-950 dark:to-neutral-950">
                    <div className="flex justify-end">
                      <span className="shrink-0 rounded-full bg-[#FFF7ED] px-2.5 py-1 text-xs font-semibold text-[#EA580C] ring-1 ring-[#F97316]/15 dark:bg-[#F97316]/10">
                        {(tarifCents / 100).toFixed(0)} € / post
                      </span>
                    </div>

                    <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-bold leading-none tabular-nums text-neutral-900 dark:text-white">
                      {nb}
                    </span>
                    <span className="pb-1 text-sm text-neutral-500">posts / week</span>
                  </div>

                  <div className="mt-5">
                    <input
                      id="nbPosts"
                      type="range"
                      min={1}
                      max={14}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#F97316] dark:bg-neutral-700 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#F97316] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F97316]"
                      {...register('nbPostsPerWeek', { valueAsNumber: true })}
                    />
                    <div className="mt-1.5 flex justify-between text-[11px] font-medium text-neutral-400">
                      <span>1 / wk</span>
                      <span>14 / wk</span>
                    </div>
                  </div>

                  <div className="mt-auto rounded-xl border border-[#F97316]/15 bg-white/90 p-4 shadow-sm dark:border-[#F97316]/20 dark:bg-neutral-900/80">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      Monthly estimate
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-[#EA580C]">
                      {estimateEuros.toFixed(2)} €
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {nb} posts × 4 weeks × {(tarifCents / 100).toFixed(2)} €
                    </p>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-6 min-h-[10rem] ${innerCardClass}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={labelClass}>Reference (optional)</p>
                {refMode !== 'NONE' && (
                  <button
                    type="button"
                    onClick={clearReference}
                    className="text-xs font-medium text-neutral-500 underline hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(['NONE', 'MCT', 'URL', 'MP4'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setValue('refMode', mode)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      refMode === mode
                        ? 'border-[#F97316] bg-[#FFF7ED] text-[#EA580C]'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400'
                    }`}
                  >
                    {mode === 'NONE' && 'No reference'}
                    {mode === 'MCT' && 'Platform template'}
                    {mode === 'URL' && 'External URL'}
                    {mode === 'MP4' && 'MP4 file'}
                  </button>
                ))}
              </div>

              {refMode === 'MCT' && (
                <div className="mt-4">
                  <input
                    id="refMctCode"
                    className={`${fieldClass} ${filledFieldClass(refMctCode)}`}
                    placeholder="MCT-XXXX"
                    {...register('refMctCode')}
                  />
                  {errors.refMctCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.refMctCode.message}</p>
                  )}
                </div>
              )}

              {refMode === 'URL' && (
                <div className="mt-4 space-y-3">
                  <input
                    id="refExternalUrl"
                    type="url"
                    className={`${fieldClass} ${filledFieldClass(refExternalUrl)}`}
                    placeholder="https://..."
                    {...register('refExternalUrl')}
                  />
                  {errors.refExternalUrl && (
                    <p className="text-sm text-red-600">{errors.refExternalUrl.message}</p>
                  )}
                  <select
                    id="refSourcePlatform"
                    className={`${fieldClass} ${refSourcePlatform ? fieldFilledClass : fieldEmptyClass}`}
                    {...register('refSourcePlatform')}
                  >
                    <option value="">Source platform</option>
                    {REF_URL_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {ECOSYSTEM_PLATFORMS.find((x) => x.id === p)?.label ?? p}
                      </option>
                    ))}
                  </select>
                  {errors.refSourcePlatform && (
                    <p className="text-sm text-red-600">{errors.refSourcePlatform.message}</p>
                  )}
                </div>
              )}

              {refMode === 'MP4' && (
                <div className="mt-4">
                  <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-8 text-center transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/50">
                    <input
                      type="file"
                      accept="video/mp4"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setMp4File(f ?? null);
                      }}
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Drag and drop your MP4 file or click to browse
                    </span>
                    {mp4File && (
                      <span className="mt-2 text-xs text-neutral-500">
                        {mp4File.name} — {(mp4File.size / (1024 * 1024)).toFixed(2)} MB (max 500 MB)
                      </span>
                    )}
                  </label>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-center pb-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${brandSolidBg}`}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
          </form>
        </div>

        <PopularNichesPanel className="hidden h-[min(800px,calc(100vh-8rem))] w-full shrink-0 xl:block xl:w-72 xl:sticky xl:top-24" />
      </div>
    </DashboardHomeShell>
  );
}
