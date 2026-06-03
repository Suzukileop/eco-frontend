'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { StudioPreview } from '@/components/studio/StudioPreview';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';

const FULLSCREEN_BAR_H = 52;

function formatTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function FullscreenPlaybackBar({ onExit }: { onExit: () => void }) {
  const { currentTime, isPlaying, composition, setIsPlaying } = useCompositionStore();
  const totalDuration = composition?.duration ?? 0;

  return (
    <div
      className="flex shrink-0 items-center justify-between border-t border-neutral-800 bg-neutral-950/95 px-4 text-white"
      style={{ height: FULLSCREEN_BAR_H }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-900 hover:bg-neutral-200 transition-colors"
          title={isPlaying ? 'Pause' : 'Lecture'}
          aria-label={isPlaying ? 'Pause' : 'Lecture'}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <span className="font-mono text-xs tabular-nums text-neutral-300">
          <span className="text-white font-medium">{formatTimecode(currentTime)}</span>
          <span className="mx-2 text-neutral-600">|</span>
          {formatTimecode(totalDuration)}
        </span>
      </div>

      <button
        type="button"
        onClick={onExit}
        className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
        title="Quitter le plein écran (Échap)"
        aria-label="Quitter le plein écran"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L5 19M5 19v-4M5 19h4M15 9l4-4m0 0V5m0 4h-4M9 15l-4 4m0 0v-4m-4 4h4M15 9l4-4m0 0h4m-4 0V5" />
        </svg>
      </button>
    </div>
  );
}

export function PreviewFullscreen() {
  const open = useEditorUiStore((s) => s.previewFullscreen);
  const setPreviewFullscreen = useEditorUiStore((s) => s.setPreviewFullscreen);
  const [fitBounds, setFitBounds] = useState<{ width: number; height: number } | undefined>();

  const updateBounds = useCallback(() => {
    setFitBounds({
      width: window.innerWidth,
      height: Math.max(200, window.innerHeight - FULLSCREEN_BAR_H),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [open, updateBounds]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setPreviewFullscreen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[250] flex flex-col bg-black">
      <div className="relative min-h-0 flex-1">
        <StudioPreview fitBounds={fitBounds} />
      </div>
      <FullscreenPlaybackBar onExit={() => setPreviewFullscreen(false)} />
    </div>,
    document.body
  );
}
