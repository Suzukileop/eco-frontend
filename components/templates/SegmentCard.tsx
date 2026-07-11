'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  generateSegmentVideo,
  getAnalysis,
  regenerateSegmentImages,
} from '@/lib/templates';
import { getApiErrorMessage } from '@/lib/api-error';
import { downloadFromUrl, extensionFromUrl } from '@/lib/download';
import type {
  AudioSuggestion,
  SegmentResponse,
  VideoAnalysisResponse,
  VideoDurationSeconds,
} from '@/types/templates';
import { CREDITS_GENERATE_VIDEO, CREDITS_REGENERATE_IMAGES } from '@/types/templates';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import {
  templatesEyebrowClass,
  templatesSecondaryBtnClass,
  templatesSectionClass,
} from '@/components/templates/templates-section-ui';

function formatTimeMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function isLikelyUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function SectionHeaderWithDownload({
  title,
  downloadUrl,
  downloadFilename,
}: {
  title: string;
  downloadUrl?: string | null;
  downloadFilename: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className={templatesEyebrowClass}>{title}</p>
      {downloadUrl && (
        <button
          type="button"
          onClick={() => void downloadFromUrl(downloadUrl, downloadFilename)}
          className={`${templatesSecondaryBtnClass} px-3 py-1.5 text-xs hover:border-orange-300 hover:text-orange-700 dark:hover:border-orange-500/40 dark:hover:text-orange-300`}
        >
          ⬇ Télécharger
        </button>
      )}
    </div>
  );
}

function AudioSuggestionsList({ suggestions }: { suggestions: AudioSuggestion[] }) {
  return (
    <ul className="mt-2 max-h-80 space-y-2 overflow-y-auto pr-1">
      {suggestions.map((item, i) => {
        const key = `${item.source}-${item.title}-${i}`;
        const label = [item.title, item.source].filter(Boolean).join(' — ');
        return (
          <li
            key={key}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800/60"
          >
            {item.url && isLikelyUrl(item.url) ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-orange-700 underline hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {label}
              </a>
            ) : (
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{label}</span>
            )}
            {item.description && (
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{item.description}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ResourceLinks({ resources }: { resources: string[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {resources.map((item, i) => {
        const trimmed = item.trim();
        if (isLikelyUrl(trimmed)) {
          return (
            <li key={`${trimmed}-${i}`}>
              <a
                href={trimmed}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-700 underline hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {trimmed}
              </a>
            </li>
          );
        }
        return (
          <li key={`${i}-${trimmed.slice(0, 24)}`} className="text-sm text-neutral-600 dark:text-neutral-400">
            {trimmed}
          </li>
        );
      })}
    </ul>
  );
}

type SegmentCardProps = {
  segment: SegmentResponse;
  analysisId: string;
  onSegmentUpdate: (segment: SegmentResponse) => void;
};

export function SegmentCard({ segment, analysisId, onSegmentUpdate }: SegmentCardProps) {
  const [local, setLocal] = useState(segment);
  const [imageIndex, setImageIndex] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(segment.videoGenerating ?? false);
  const [videoDuration, setVideoDuration] = useState<VideoDurationSeconds>(
    segment.videoDurationSeconds === 10 ? 10 : 6
  );
  const [error, setError] = useState<string | null>(segment.videoGenerationError ?? null);

  useEffect(() => {
    setLocal(segment);
    if (segment.videoGenerationError) {
      setError(segment.videoGenerationError);
    }
    if (segment.videoGenerating) {
      setGeneratingVideo(true);
    }
    if (segment.videoDurationSeconds === 6 || segment.videoDurationSeconds === 10) {
      setVideoDuration(segment.videoDurationSeconds);
    }
  }, [segment]);

  const images = local.generatedImages ?? [];
  const safeImageIndex = images.length > 0 ? imageIndex % images.length : 0;

  const pollForVideo = useCallback(async () => {
    const maxAttempts = 80;
    for (let i = 0; i < maxAttempts; i += 1) {
      await new Promise((r) => setTimeout(r, 3000));
      const analysis: VideoAnalysisResponse = await getAnalysis(analysisId);
      const updated = analysis.segments?.find((s) => s.id === local.id);
      if (!updated) continue;
      if (updated.generatedVideoUrl) {
        setLocal(updated);
        onSegmentUpdate(updated);
        window.dispatchEvent(new Event('credits-updated'));
        return;
      }
      if (updated.videoGenerationError) {
        setLocal(updated);
        onSegmentUpdate(updated);
        throw new Error(updated.videoGenerationError);
      }
      if (!updated.videoGenerating && !updated.generatedVideoUrl) {
        throw new Error('La génération vidéo s’est arrêtée sans résultat.');
      }
    }
    throw new Error('Délai dépassé : la vidéo n’est pas encore disponible.');
  }, [analysisId, local.id, onSegmentUpdate]);

  useEffect(() => {
    if (!generatingVideo || local.generatedVideoUrl) return;
    let cancelled = false;

    const run = async () => {
      try {
        await pollForVideo();
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, 'Impossible de générer la vidéo.'));
        }
      } finally {
        if (!cancelled) {
          setGeneratingVideo(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [generatingVideo, local.generatedVideoUrl, pollForVideo]);

  const handleRegenerate = async () => {
    setError(null);
    setRegenerating(true);
    try {
      const updated = await regenerateSegmentImages(local.id);
      setLocal(updated);
      setImageIndex(0);
      onSegmentUpdate(updated);
      window.dispatchEvent(new Event('credits-updated'));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de régénérer les images.'));
    } finally {
      setRegenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    setError(null);
    setGeneratingVideo(true);
    try {
      const updated = await generateSegmentVideo(local.id, { durationSeconds: videoDuration });
      setLocal(updated);
      onSegmentUpdate(updated);
      if (updated.generatedVideoUrl) {
        setGeneratingVideo(false);
        window.dispatchEvent(new Event('credits-updated'));
        return;
      }
      if (updated.videoGenerationError) {
        throw new Error(updated.videoGenerationError);
      }
    } catch (e) {
      setGeneratingVideo(false);
      setError(getApiErrorMessage(e, 'Impossible de lancer la génération vidéo.'));
    }
  };

  return (
    <article className={templatesSectionClass}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          [S{local.seqNumber}] {formatTimeMs(local.startTimeMs)} → {formatTimeMs(local.endTimeMs)}
        </h3>
        {local.transitionToNext && (
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800">
            {local.transitionToNext}
          </span>
        )}
      </header>

      {error && (
        <div>
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="mt-4 space-y-4">
        {local.backgroundDesc && (
          <div>
            <p className={templatesEyebrowClass}>Fond</p>
            <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">{local.backgroundDesc}</p>
          </div>
        )}

        {local.intention && (
          <p className="text-sm italic text-neutral-500 dark:text-neutral-400">{local.intention}</p>
        )}

        {images.length > 0 && (
          <div>
            <SectionHeaderWithDownload
              title="Images générées (Nano Banana)"
              downloadUrl={images[safeImageIndex]}
              downloadFilename={`segment-s${local.seqNumber}-image-${safeImageIndex + 1}.${extensionFromUrl(images[safeImageIndex], 'png')}`}
            />
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[safeImageIndex]}
                  alt={`Fond séquence ${local.seqNumber} — variation ${safeImageIndex + 1}`}
                  className="max-h-64 w-full object-contain"
                />
                {images.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/50 to-transparent p-2">
                    <button
                      type="button"
                      onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                      className="rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-white"
                      aria-label="Image précédente"
                    >
                      ‹
                    </button>
                    <span className="self-center text-xs text-white">
                      {safeImageIndex + 1} / {images.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                      className="rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-white"
                      aria-label="Image suivante"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleRegenerate()}
                disabled={regenerating}
                className="shrink-0 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800 hover:bg-orange-100 disabled:opacity-60 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200 dark:hover:bg-orange-500/20"
              >
                {regenerating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                    Régénération…
                  </span>
                ) : (
                  `🔄 Régénérer (-${CREDITS_REGENERATE_IMAGES} crédits)`
                )}
              </button>
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              Aucune image Nano Banana n&apos;a pu être générée pour ce segment. Vous pouvez réessayer
              ci-dessous.
            </p>
            <button
              type="button"
              onClick={() => void handleRegenerate()}
              disabled={regenerating}
              className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800 hover:bg-orange-100 disabled:opacity-60 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200 dark:hover:bg-orange-500/20"
            >
              {regenerating ? 'Génération…' : `🔄 Générer les images (-${CREDITS_REGENERATE_IMAGES} crédits)`}
            </button>
          </div>
        )}

        {local.capCutEffects && local.capCutEffects.length > 0 && (
          <div>
            <p className={templatesEyebrowClass}>Effets CapCut</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {local.capCutEffects.map((fx) => (
                <span
                  key={fx}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {fx}
                </span>
              ))}
            </div>
          </div>
        )}

        {(local.audioDesc || (local.audioSuggestions && local.audioSuggestions.length > 0)) && (
          <div>
            <p className={templatesEyebrowClass}>Audio</p>
            {local.audioDesc && (
              <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">{local.audioDesc}</p>
            )}
            {local.audioSuggestions && local.audioSuggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Musiques &amp; instrumentaux suggérés ({local.audioSuggestions.length})
                </p>
                <AudioSuggestionsList suggestions={local.audioSuggestions} />
              </div>
            )}
          </div>
        )}

        {local.resources && local.resources.length > 0 && (
          <div>
            <p className={templatesEyebrowClass}>Ressources suggérées</p>
            <ResourceLinks resources={local.resources} />
          </div>
        )}

        {local.generatedVideoUrl ? (
          <div>
            <SectionHeaderWithDownload
              title={`Fond vidéo animé${local.videoDurationSeconds ? ` (${local.videoDurationSeconds}s)` : ''}`}
              downloadUrl={local.generatedVideoUrl}
              downloadFilename={`segment-s${local.seqNumber}-fond-video.${extensionFromUrl(local.generatedVideoUrl, 'mp4')}`}
            />
            <video
              src={local.generatedVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="mt-2 max-h-72 w-full rounded-xl bg-black object-contain"
            >
              <track kind="captions" />
            </video>
          </div>
        ) : (
          <div>
            <p className={templatesEyebrowClass}>Durée du fond vidéo</p>
            <div className="mt-2 flex gap-2">
              {([6, 10] as const).map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  disabled={generatingVideo}
                  onClick={() => setVideoDuration(seconds)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                    videoDuration === seconds
                      ? 'border-orange-600 bg-orange-600 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-orange-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-orange-500/40'
                  } disabled:opacity-60`}
                >
                  {seconds}s
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void handleGenerateVideo()}
              disabled={generatingVideo}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-orange-600 disabled:opacity-60 sm:w-auto"
            >
              {generatingVideo ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Génération vidéo en cours… ({videoDuration}s)
                </span>
              ) : (
                `🎬 Générer fond vidéo animé (-${CREDITS_GENERATE_VIDEO} crédits)`
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
