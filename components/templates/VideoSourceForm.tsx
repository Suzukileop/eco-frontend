'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getMyRequests } from '@/lib/ecosystem';
import { analyzeVideoByUpload, analyzeVideoByUrl } from '@/lib/templates';
import { getApiErrorMessage } from '@/lib/api-error';
import type { NicheRequestResponse } from '@/types/ecosystem';
import {
  ANALYSIS_BASE_CREDITS,
  CREDITS_PER_IMAGE,
  DEFAULT_SEGMENT_ESTIMATE,
  estimateAnalysisCredits,
  estimateAnalysisCreditsMax,
  IMAGES_PER_SEGMENT_ESTIMATE,
} from '@/types/templates';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

const MAX_BYTES = 500 * 1024 * 1024;

const R2_HOST_PATTERN = /\.r2\.dev$/i;

const schema = z
  .object({
    sourceMode: z.enum(['R2', 'EXTERNAL', 'UPLOAD']),
    videoUrl: z.string().optional(),
    segmentEstimate: z.preprocess(
      (v) => (typeof v === 'string' ? Number(v) : v),
      z.number().int().min(1).max(50)
    ),
  })
  .superRefine((data, ctx) => {
    if (data.sourceMode === 'UPLOAD') return;
    const url = data.videoUrl?.trim() ?? '';
    if (!url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL requise.',
        path: ['videoUrl'],
      });
      return;
    }
    try {
      const parsed = new URL(url);
      if (data.sourceMode === 'R2') {
        if (!R2_HOST_PATTERN.test(parsed.hostname)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'L’URL doit pointer vers un hôte *.r2.dev.',
            path: ['videoUrl'],
          });
        }
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL invalide.',
        path: ['videoUrl'],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

function validateMp4File(file: File): string | null {
  const isMp4 =
    file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');
  if (!isMp4) return 'Seuls les fichiers MP4 sont acceptés.';
  if (file.size > MAX_BYTES) return 'Le fichier dépasse 500 Mo.';
  return null;
}

export function VideoSourceForm() {
  const router = useRouter();
  const [mp4File, setMp4File] = useState<File | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [nicheDemos, setNicheDemos] = useState<NicheRequestResponse[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      sourceMode: 'R2',
      videoUrl: '',
      segmentEstimate: DEFAULT_SEGMENT_ESTIMATE,
    },
  });

  const sourceMode = watch('sourceMode');
  const segmentEstimate = watch('segmentEstimate');
  const lowEstimate = estimateAnalysisCredits(segmentEstimate);
  const highEstimate = estimateAnalysisCreditsMax(segmentEstimate);

  useEffect(() => {
    void getMyRequests(undefined, 0, 50)
      .then((page) => {
        const withDemo = page.content.filter(
          (r): r is NicheRequestResponse =>
            typeof r === 'object' &&
            r !== null &&
            'demoContentUrl' in r &&
            typeof (r as NicheRequestResponse).demoContentUrl === 'string' &&
            Boolean((r as NicheRequestResponse).demoContentUrl)
        );
        setNicheDemos(withDemo);
      })
      .catch(() => {
        /* liste optionnelle */
      });
  }, []);

  const onDrop = useCallback((file: File | null) => {
    if (!file) {
      setMp4File(null);
      return;
    }
    const err = validateMp4File(file);
    if (err) {
      setSubmitError(err);
      setMp4File(null);
      return;
    }
    setSubmitError(null);
    setMp4File(file);
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setUploadPercent(0);

    try {
      let result;
      if (values.sourceMode === 'UPLOAD') {
        if (!mp4File) {
          setSubmitError('Choisissez un fichier MP4 à envoyer.');
          return;
        }
        const fileErr = validateMp4File(mp4File);
        if (fileErr) {
          setSubmitError(fileErr);
          return;
        }
        result = await analyzeVideoByUpload(mp4File, setUploadPercent);
      } else {
        result = await analyzeVideoByUrl(values.videoUrl?.trim() ?? '');
      }
      router.push(`/dashboard/templates/${result.id}`);
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Impossible de lancer l’analyse.'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Source de la vidéo</h2>
        <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label="Source vidéo">
          {(
            [
              { id: 'R2' as const, label: 'URL R2 modèle agent' },
              { id: 'EXTERNAL' as const, label: 'URL externe' },
              { id: 'UPLOAD' as const, label: 'Upload MP4' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={sourceMode === opt.id}
              onClick={() => setValue('sourceMode', opt.id)}
              className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold ${
                sourceMode === opt.id
                  ? 'border-teal-600 bg-teal-50 text-teal-900'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {sourceMode === 'R2' && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-600">
              Entrez l&apos;URL de la vidéo modèle fournie par votre agent (hébergement Cloudflare R2).
              Vous pouvez la copier depuis votre demande niche (
              <code className="rounded bg-gray-100 px-1 text-xs">demoContentUrl</code>
              ).
            </p>
            {nicheDemos.length > 0 && (
              <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3">
                <p className="text-xs font-semibold text-teal-900">Démos disponibles</p>
                <ul className="mt-2 space-y-2">
                  {nicheDemos.map((req) => (
                    <li key={req.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-gray-800">{req.nicheTheme}</span>
                      <button
                        type="button"
                        className="text-teal-700 underline hover:text-teal-900"
                        onClick={() =>
                          setValue('videoUrl', req.demoContentUrl ?? '', { shouldValidate: true })
                        }
                      >
                        Utiliser cette URL
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <label htmlFor="videoUrlR2" className="block text-sm font-medium text-gray-700">
              URL vidéo (*.r2.dev)
            </label>
            <input
              id="videoUrlR2"
              type="url"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="https://….r2.dev/models/…/video.mp4"
              {...register('videoUrl')}
            />
          </div>
        )}

        {sourceMode === 'EXTERNAL' && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-600">
              YouTube, TikTok ou autre lien direct. Assurez-vous que la vidéo est publiquement accessible.
            </p>
            <label htmlFor="videoUrlExt" className="block text-sm font-medium text-gray-700">
              URL externe
            </label>
            <input
              id="videoUrlExt"
              type="url"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="https://www.youtube.com/watch?v=…"
              {...register('videoUrl')}
            />
          </div>
        )}

        {sourceMode === 'UPLOAD' && (
          <div className="mt-6">
            <label
              htmlFor="mp4-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center hover:bg-gray-100"
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(e.dataTransfer.files?.[0] ?? null);
              }}
            >
              <input
                id="mp4-upload"
                ref={fileInputRef}
                type="file"
                accept="video/mp4,.mp4"
                className="hidden"
                onChange={(e) => onDrop(e.target.files?.[0] ?? null)}
              />
              <span className="text-sm font-medium text-gray-800">
                Glissez votre MP4 ici ou cliquez pour sélectionner
              </span>
              <span className="mt-1 text-xs text-gray-500">Maximum 500 Mo</span>
              {mp4File && (
                <span className="mt-2 text-xs text-gray-600">
                  {mp4File.name} — {(mp4File.size / (1024 * 1024)).toFixed(2)} Mo
                </span>
              )}
            </label>
            {(isSubmitting || uploadPercent > 0) && sourceMode === 'UPLOAD' && (
              <div
                className="mt-4"
                role="progressbar"
                aria-valuenow={uploadPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progression de l’upload"
              >
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-teal-600 transition-all duration-300"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600">{uploadPercent} %</p>
              </div>
            )}
          </div>
        )}

        {errors.videoUrl && (
          <p className="mt-2 text-sm text-red-600">{errors.videoUrl.message}</p>
        )}
      </section>

      <section className="rounded-2xl border border-teal-100 bg-teal-50/60 p-6">
        <h2 className="text-lg font-semibold text-teal-900">Coût en crédits</h2>
        <p className="mt-2 text-sm text-teal-800">
          Cette analyse coûte {ANALYSIS_BASE_CREDITS} crédits (+ {CREDITS_PER_IMAGE} crédits par image
          générée).
        </p>
        <div className="mt-4">
          <label htmlFor="segmentEstimate" className="block text-sm font-medium text-teal-900">
            Estimation — nombre de séquences attendues : {segmentEstimate}
          </label>
          <input
            id="segmentEstimate"
            type="range"
            min={1}
            max={30}
            className="mt-2 w-full accent-teal-600"
            {...register('segmentEstimate', { valueAsNumber: true })}
          />
          <p className="mt-2 text-sm font-semibold text-teal-900">
            Estimation totale : ~{lowEstimate} crédits (jusqu&apos;à ~{highEstimate} si{' '}
            {IMAGES_PER_SEGMENT_ESTIMATE} images par séquence)
          </p>
        </div>
      </section>

      <div className="flex justify-end pb-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {sourceMode === 'UPLOAD' ? 'Envoi et analyse…' : 'Lancement…'}
            </>
          ) : (
            '🔍 Lancer l’analyse Grok'
          )}
        </button>
      </div>
    </form>
  );
}
