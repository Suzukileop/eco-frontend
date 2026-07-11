'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { VideoAnalysisResponse } from '@/types/templates';
import { CREDITS_GENERATE_VIDEO } from '@/types/templates';
import { generateSegmentVideo, getAnalysis } from '@/lib/templates';
import { getApiErrorMessage } from '@/lib/api-error';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { buildCenteredNativeMediaLayoutFromUrl } from '@/lib/studio/mediaDimensions';
import {
  buildVideoPrompt,
  CAMERA_MOVEMENTS,
  type CameraMovementId,
  mapAspectRatioToFal,
  mapToSupportedDuration,
  VIDEO_DURATION_OPTIONS,
  type VideoDurationOption,
  VIDEO_FORMAT_PICKER,
  VIDEO_PROMPT_MAX_LENGTH,
  VIDEO_STYLES,
  type VideoStyleId,
} from '@/lib/videoGenerationFormats';

interface VideoGeneratePromptBoxProps {
  segmentId: string;
  analysis: VideoAnalysisResponse;
  onAnalysisUpdate: (a: VideoAnalysisResponse) => void;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M2 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2zm0 1h2v2H2V4zm3 0h6v8H5V4zm7 0h2v2h-2V4zM2 7h2v2H2V7zm12 0h2v2h-2V7zm-12 3h2v2H2v-2zm12 0h2v2h-2v-2z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2c-1.5 2-2 3.8-2 6s.5 4 2 6M8 2c1.5 2 2 3.8 2 6s-.5 4-2 6M2 8h12" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1l1.2 3.8L13 6l-3.8 1.2L8 11 6.8 7.2 3 6l3.8-1.2L8 1zm4 7l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9L9.5 10l1.9-.6.6-1.9z" />
    </svg>
  );
}

function CubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M8 2.5 12.5 5v6L8 14 3.5 11V5L8 2.5z" />
      <path d="M8 2.5v11.5M3.5 5 8 7.5 12.5 5" />
    </svg>
  );
}

function LandscapeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="4" width="12" height="8" rx="1" />
      <circle cx="5.5" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function VideoStyleIcon({ id, className }: { id: VideoStyleId; className?: string }) {
  switch (id) {
    case 'cinematic':
      return <FilmIcon className={className} />;
    case 'realistic':
      return <LandscapeIcon className={className} />;
    case 'animated':
      return <SparkleIcon className={className} />;
    case '3d':
      return <CubeIcon className={className} />;
    case 'documentary':
      return <GlobeIcon className={className} />;
  }
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FormatShape({ ratio }: { ratio: string }) {
  const shapes: Record<string, string> = {
    '1:1': 'h-5 w-5 rounded-sm',
    '9:16': 'h-6 w-3.5 rounded-sm',
    '16:9': 'h-3.5 w-6 rounded-sm',
    '4:5': 'h-5 w-4 rounded-sm',
  };
  return (
    <div
      className={`border border-current opacity-80 ${shapes[ratio] ?? 'h-5 w-5 rounded-sm'}`}
      aria-hidden
    />
  );
}

// ─── Pill styles ─────────────────────────────────────────────────────────────

const pillBase =
  'flex w-full min-w-0 items-center justify-center gap-1.5 rounded-full border px-2 py-2.5 text-[11px] font-medium transition-colors';
const pillActive = 'border-transparent bg-[#d4c8f0] text-[#1a1625]';
const pillInactive =
  'border-[#4a4a50] bg-transparent text-neutral-300 hover:border-neutral-400 hover:text-neutral-100';

const durationBase =
  'flex min-w-0 items-center justify-center rounded-lg border px-2 py-2.5 text-[11px] font-medium transition-colors';
const durationActive = 'border-transparent bg-[#d4c8f0] text-[#1a1625]';
const durationInactive =
  'border-[#45454b] bg-[#1e1e22] text-neutral-400 hover:border-neutral-500';

// ─── Component ───────────────────────────────────────────────────────────────

export function VideoGeneratePromptBox({
  segmentId,
  analysis,
  onAnalysisUpdate,
}: VideoGeneratePromptBoxProps) {
  const { insertClipAtPlayhead, currentTime, composition } = useCompositionStore();
  const segment = analysis.segments?.find((s) => s.id === segmentId);

  const [prompt, setPrompt] = useState(segment?.imagePrompt ?? '');
  const [styleId, setStyleId] = useState<VideoStyleId>('cinematic');
  const [cameraId, setCameraId] = useState<CameraMovementId>('static');
  const [duration, setDuration] = useState<VideoDurationOption>(5);
  const [quality, setQuality] = useState(50);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = prompt.length;
  const selectedStyle = VIDEO_STYLES.find((s) => s.id === styleId);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, 112);
    el.style.height = `${Math.max(56, next)}px`;
  }, [prompt]);

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError('Décrivez la vidéo à générer.');
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const fullPrompt = buildVideoPrompt(trimmed, styleId, cameraId, quality);
      const supportedDuration = mapToSupportedDuration(duration);
      await generateSegmentVideo(segmentId, {
        durationSeconds: supportedDuration,
        videoPrompt: fullPrompt,
        aspectRatio: mapAspectRatioToFal(aspectRatio),
      });

      for (let i = 0; i < 80; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const updated = await getAnalysis(analysis.id);
        const seg = updated.segments?.find((s) => s.id === segmentId);
        if (seg?.generatedVideoUrl) {
          onAnalysisUpdate(updated);
          const layout = await buildCenteredNativeMediaLayoutFromUrl(
            seg.generatedVideoUrl,
            'video',
            composition ?? null,
            useEditorUiStore.getState().previewCanvasSize
          );
          insertClipAtPlayhead({
            id: `vid-ai-${Date.now()}`,
            trackType: 'background',
            type: 'video',
            startTime: currentTime,
            endTime: currentTime + (seg.videoDurationSeconds ?? supportedDuration),
            url: seg.generatedVideoUrl,
            segmentId,
            isFromAI: true,
            ...layout,
          });
          window.dispatchEvent(new Event('credits-updated'));
          return;
        }
        if (seg?.videoGenerationError) {
          throw new Error(seg.videoGenerationError);
        }
      }
      throw new Error('Délai dépassé');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de générer la vidéo.'));
    } finally {
      setGenerating(false);
    }
  }, [
    prompt,
    styleId,
    cameraId,
    duration,
    quality,
    aspectRatio,
    segmentId,
    analysis.id,
    currentTime,
    insertClipAtPlayhead,
    onAnalysisUpdate,
    composition,
  ]);

  return (
    <div className="flex w-full min-w-0 max-w-full shrink-0 flex-col gap-5 overflow-hidden rounded-xl border border-[#3d3d42] bg-[#18181a] p-4">
      {/* Description de la vidéo */}
      <div className="relative overflow-hidden rounded-lg border border-[#45454b] bg-[#121214] px-3.5 pt-3 pb-8">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, VIDEO_PROMPT_MAX_LENGTH))}
          disabled={generating}
          rows={2}
          placeholder="Décrivez votre vidéo… ex : Drone survolant une forêt tropicale au coucher du soleil, ambiance cinématique, 4K."
          className="block w-full resize-none overflow-hidden bg-transparent text-[12px] leading-relaxed text-neutral-100 placeholder:text-neutral-500 focus:outline-none disabled:opacity-50"
          aria-label="Description de la vidéo à générer"
        />
        <span className="pointer-events-none absolute bottom-2 right-2.5 text-[10px] tabular-nums text-neutral-500">
          {charCount}/{VIDEO_PROMPT_MAX_LENGTH}
        </span>
      </div>

      {/* Style et paramètres — repliable */}
      <div className="min-w-0">
        <button
          type="button"
          disabled={generating}
          onClick={() => setOptionsOpen((v) => !v)}
          aria-expanded={optionsOpen}
          aria-controls="video-gen-options-panel"
          className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-[#45454b] bg-[#1e1e22] px-3 py-2.5 text-left transition-colors hover:border-neutral-500 hover:bg-[#252528] disabled:opacity-50"
        >
          <span className="flex min-w-0 items-center gap-2">
            <VideoStyleIcon id={styleId} className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate text-[11px] font-medium text-neutral-200">
              {optionsOpen ? 'Style et paramètres' : `${selectedStyle?.label ?? ''} · ${duration}s`}
            </span>
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 ${
              optionsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {optionsOpen ? (
          <div id="video-gen-options-panel" className="mt-3 flex flex-col gap-5">
            {/* Style visuel */}
            <div className="space-y-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Style visuel
              </p>
              <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-2">
                {VIDEO_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    disabled={generating}
                    onClick={() => setStyleId(style.id)}
                    className={`${pillBase} ${styleId === style.id ? pillActive : pillInactive}`}
                  >
                    <VideoStyleIcon id={style.id} className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mouvement de caméra */}
            <div className="space-y-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Mouvement de caméra
              </p>
              <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(4.5rem,1fr))] gap-2">
                {CAMERA_MOVEMENTS.map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    disabled={generating}
                    onClick={() => setCameraId(cam.id)}
                    className={`${pillBase} ${cameraId === cam.id ? pillActive : pillInactive}`}
                  >
                    <span className="truncate">{cam.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Format
              </p>
              <div className="grid min-w-0 grid-cols-[repeat(4,minmax(0,1fr))] gap-1.5">
                {VIDEO_FORMAT_PICKER.map((fmt) => {
                  const selected = aspectRatio === fmt.aspectRatio;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      disabled={generating}
                      onClick={() => setAspectRatio(fmt.aspectRatio)}
                      className={`flex min-w-0 flex-col items-center gap-2 rounded-lg border py-3 transition-colors ${
                        selected
                          ? 'border-[#d4c8f0]/80 bg-[#d4c8f0] text-[#1a1625]'
                          : 'border-[#45454b] bg-[#1e1e22] text-neutral-400 hover:border-neutral-500'
                      }`}
                    >
                      <FormatShape ratio={fmt.aspectRatio} />
                      <span className="text-[10px] font-medium">{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Durée */}
            <div className="space-y-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Durée
              </p>
              <div className="grid min-w-0 grid-cols-4 gap-1.5">
                {VIDEO_DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={generating}
                    onClick={() => setDuration(d)}
                    className={`${durationBase} ${duration === d ? durationActive : durationInactive}`}
                  >
                    {d} s
                  </button>
                ))}
              </div>
            </div>

            {/* Qualité et vitesse */}
            <div className="space-y-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Qualité et vitesse
              </p>
              <div className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-[10px] text-neutral-400">Qualité</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={50}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={generating}
                  className="min-w-0 flex-1 accent-[#d4c8f0] disabled:opacity-50"
                  aria-label="Qualité de la vidéo"
                />
                <span className="w-14 shrink-0 text-right text-[10px] text-neutral-400">
                  {quality === 0 ? 'Rapide' : quality === 100 ? 'Haute' : 'Standard'}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 border-t border-[#2e2e30] pt-4">
        <p className="mr-auto min-w-0 text-[10px] text-neutral-500">
          <span className="font-medium text-[#e8dcc8]">{CREDITS_GENERATE_VIDEO} crédits</span>
          {' · ×1 vidéo'}
        </p>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating || !prompt.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#5c5c62] bg-[#252528] px-4 py-2 text-[12px] font-medium text-neutral-100 transition-colors hover:border-neutral-400 hover:bg-[#2e2e32] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {generating ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent" />
          ) : (
            <>
              Générer
              <span aria-hidden>→</span>
            </>
          )}
        </button>
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
