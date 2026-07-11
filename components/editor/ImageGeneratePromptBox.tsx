'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Format } from '@/types/composition';
import type { SegmentResponse } from '@/types/templates';
import { generateSegmentImages } from '@/lib/templates';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  buildImagePromptWithStyle,
  compositionFormatToAspectRatio,
  creditsForImageGeneration,
  IMAGE_COUNT_OPTIONS,
  IMAGE_FORMAT_PICKER,
  IMAGE_GENERATION_STYLES,
  IMAGE_PROMPT_MAX_LENGTH,
  type ImageCountOption,
  type ImageGenerationStyleId,
} from '@/lib/imageGenerationFormats';

interface ImageGeneratePromptBoxProps {
  segmentId: string;
  segment?: SegmentResponse;
  compositionFormat: Format;
  customAspectW?: number;
  customAspectH?: number;
  onSegmentUpdate: (segment: SegmentResponse) => void;
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1l1.2 3.8L13 6l-3.8 1.2L8 11 6.8 7.2 3 6l3.8-1.2L8 1zm4 7l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9L9.5 10l1.9-.6.6-1.9z" />
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

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 2a6 6 0 0 0 0 12h1a1.5 1.5 0 0 0 0-3H7a1 1 0 0 1 0-2h1.5A2.5 2.5 0 0 0 11 6.5 6 6 0 0 0 8 2zM5 6.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm2-2a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm4 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm-1 3a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
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

function StyleIcon({ id, className }: { id: ImageGenerationStyleId; className?: string }) {
  switch (id) {
    case 'creative':
      return <SparkleIcon className={className} />;
    case 'realistic':
      return <LandscapeIcon className={className} />;
    case 'artistic':
      return <PaletteIcon className={className} />;
    case '3d':
      return <CubeIcon className={className} />;
  }
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
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

const pillBase =
  'flex w-full min-w-0 items-center justify-center gap-1.5 rounded-full border px-2 py-2.5 text-[11px] font-medium transition-colors';
const pillActive = 'border-transparent bg-[#d4c8f0] text-[#1a1625]';
const pillInactive =
  'border-[#4a4a50] bg-transparent text-neutral-300 hover:border-neutral-400 hover:text-neutral-100';

export function ImageGeneratePromptBox({
  segmentId,
  segment,
  compositionFormat,
  customAspectW,
  customAspectH,
  onSegmentUpdate,
}: ImageGeneratePromptBoxProps) {
  const defaultAspect = useMemo(
    () => compositionFormatToAspectRatio(compositionFormat, customAspectW, customAspectH),
    [compositionFormat, customAspectW, customAspectH]
  );

  const [prompt, setPrompt] = useState(segment?.imagePrompt ?? '');
  const [aspectRatio, setAspectRatio] = useState(defaultAspect);
  const [styleId, setStyleId] = useState<ImageGenerationStyleId>('creative');
  const [imageCount, setImageCount] = useState<ImageCountOption>(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const styleLabel =
    IMAGE_GENERATION_STYLES.find((s) => s.id === styleId)?.label ?? 'Créatif';

  useEffect(() => {
    setPrompt(segment?.imagePrompt ?? '');
  }, [segment?.imagePrompt, segmentId]);

  useEffect(() => {
    const inPicker = IMAGE_FORMAT_PICKER.some((f) => f.aspectRatio === defaultAspect);
    setAspectRatio(inPicker ? defaultAspect : '9:16');
  }, [defaultAspect, segmentId]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, 112);
    el.style.height = `${Math.max(56, next)}px`;
  }, [prompt]);

  const creditCost = creditsForImageGeneration(imageCount);
  const charCount = prompt.length;

  const cycleImageCount = () => {
    setImageCount((prev) => {
      const idx = IMAGE_COUNT_OPTIONS.indexOf(prev);
      return IMAGE_COUNT_OPTIONS[(idx + 1) % IMAGE_COUNT_OPTIONS.length];
    });
  };

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError('Décrivez l’image à générer.');
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const fullPrompt = buildImagePromptWithStyle(trimmed, styleId);
      const updated = await generateSegmentImages(segmentId, {
        prompt: fullPrompt,
        aspectRatio,
        imageCount,
      });
      onSegmentUpdate(updated);
      window.dispatchEvent(new Event('credits-updated'));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de générer les images.'));
    } finally {
      setGenerating(false);
    }
  }, [prompt, styleId, aspectRatio, imageCount, segmentId, onSegmentUpdate]);

  return (
    <div className="flex w-full min-w-0 max-w-full shrink-0 flex-col gap-5 overflow-hidden rounded-xl border border-[#3d3d42] bg-[#18181a] p-4">
      {/* Prompt */}
      <div className="relative overflow-hidden rounded-lg border border-[#45454b] bg-[#121214] px-3.5 pt-3 pb-8">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) =>
            setPrompt(e.target.value.slice(0, IMAGE_PROMPT_MAX_LENGTH))
          }
          disabled={generating}
          rows={2}
          placeholder="Décrivez votre image…"
          className="block w-full resize-none overflow-hidden bg-transparent text-[12px] leading-relaxed text-neutral-100 placeholder:text-neutral-500 focus:outline-none disabled:opacity-50"
          aria-label="Prompt de génération d’image"
        />
        <span className="pointer-events-none absolute bottom-2 right-2.5 text-[10px] tabular-nums text-neutral-500">
          {charCount}/{IMAGE_PROMPT_MAX_LENGTH}
        </span>
      </div>

      {/* Style + format — repliable */}
      <div className="min-w-0">
        <button
          type="button"
          disabled={generating}
          onClick={() => setOptionsOpen((v) => !v)}
          aria-expanded={optionsOpen}
          aria-controls="image-gen-options-panel"
          className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-[#45454b] bg-[#1e1e22] px-3 py-2.5 text-left transition-colors hover:border-neutral-500 hover:bg-[#252528] disabled:opacity-50"
        >
          <span className="flex min-w-0 items-center gap-2">
            <StyleIcon id={styleId} className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate text-[11px] font-medium text-neutral-200">
              {optionsOpen ? 'Style et format' : `${styleLabel} · ${aspectRatio}`}
            </span>
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 ${
              optionsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {optionsOpen ? (
          <div
            id="image-gen-options-panel"
            className="mt-3 flex flex-col gap-5"
          >
            <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(5.25rem,1fr))] gap-2">
              {IMAGE_GENERATION_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  disabled={generating}
                  onClick={() => setStyleId(style.id)}
                  className={`${pillBase} ${styleId === style.id ? pillActive : pillInactive}`}
                >
                  <StyleIcon id={style.id} className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{style.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Format
              </p>
              <div className="grid min-w-0 grid-cols-[repeat(4,minmax(0,1fr))] gap-1.5">
                {IMAGE_FORMAT_PICKER.map((fmt) => {
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
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 border-t border-[#2e2e30] pt-4">
        <p className="mr-auto min-w-0 text-[10px] text-neutral-500">
          <span className="font-medium text-[#e8dcc8]">{creditCost} crédits</span>
          {' · '}
          <button
            type="button"
            disabled={generating}
            onClick={cycleImageCount}
            className="text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline disabled:opacity-50"
            title="Changer le nombre d’images"
          >
            × {imageCount} image{imageCount > 1 ? 's' : ''}
          </button>
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
