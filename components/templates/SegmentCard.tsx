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
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      {downloadUrl && (
        <button
          type="button"
          onClick={() => void downloadFromUrl(downloadUrl, downloadFilename)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:border-teal-300 hover:text-teal-800"
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
            className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
          >
            {item.url && isLikelyUrl(item.url) ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-700 underline hover:text-teal-900"
              >
                {label}
              </a>
            ) : (
              <span className="font-medium text-gray-900">{label}</span>
            )}
            {item.description && (
              <p className="mt-1 text-xs text-gray-600">{item.description}</p>
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
                className="text-sm text-teal-700 underline hover:text-teal-900"
              >
                {trimmed}
              </a>
            </li>
          );
        }
        return (
          <li key={`${i}-${trimmed.slice(0, 24)}`} className="text-sm text-gray-600">
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
    <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-gray-900">
          [S{local.seqNumber}] {formatTimeMs(local.startTimeMs)} → {formatTimeMs(local.endTimeMs)}
        </h3>
        {local.transitionToNext && (
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
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
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fond</p>
            <p className="mt-1 text-sm text-gray-800">{local.backgroundDesc}</p>
          </div>
        )}

        {local.intention && (
          <p className="text-sm italic text-gray-500">{local.intention}</p>
        )}

        {images.length > 0 && (
          <div>
            <SectionHeaderWithDownload
              title="Images générées (Nano Banana)"
              downloadUrl={images[safeImageIndex]}
              downloadFilename={`segment-s${local.seqNumber}-image-${safeImageIndex + 1}.${extensionFromUrl(images[safeImageIndex], 'png')}`}
            />
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
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
                className="shrink-0 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100 disabled:opacity-60"
              >
                {regenerating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
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
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              Aucune image Nano Banana n&apos;a pu être générée pour ce segment. Vous pouvez réessayer
              ci-dessous.
            </p>
            <button
              type="button"
              onClick={() => void handleRegenerate()}
              disabled={regenerating}
              className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100 disabled:opacity-60"
            >
              {regenerating ? 'Génération…' : `🔄 Générer les images (-${CREDITS_REGENERATE_IMAGES} crédits)`}
            </button>
          </div>
        )}

        {local.capCutEffects && local.capCutEffects.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Effets CapCut</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {local.capCutEffects.map((fx) => (
                <span
                  key={fx}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {fx}
                </span>
              ))}
            </div>
          </div>
        )}

        {(local.audioDesc || (local.audioSuggestions && local.audioSuggestions.length > 0)) && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Audio</p>
            {local.audioDesc && (
              <p className="mt-1 text-sm text-gray-800">{local.audioDesc}</p>
            )}
            {local.audioSuggestions && local.audioSuggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600">
                  Musiques &amp; instrumentaux suggérés ({local.audioSuggestions.length})
                </p>
                <AudioSuggestionsList suggestions={local.audioSuggestions} />
              </div>
            )}
          </div>
        )}

        {local.resources && local.resources.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ressources suggérées</p>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Durée du fond vidéo</p>
            <div className="mt-2 flex gap-2">
              {([6, 10] as const).map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  disabled={generatingVideo}
                  onClick={() => setVideoDuration(seconds)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                    videoDuration === seconds
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
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
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 text-sm font-semibold text-white hover:from-teal-500 hover:to-teal-600 disabled:opacity-60 sm:w-auto"
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
