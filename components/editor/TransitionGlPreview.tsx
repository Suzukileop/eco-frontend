'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createGlRenderer, loadMediaSource } from '@/lib/glTransitionRenderer';
import { isCustomGlTransitionName } from '@/lib/customGlTransitions';
import { isCutTransitionName } from '@/lib/glTransitions';

const PREVIEW_W = 280;
const PREVIEW_H = 158;

export function TransitionGlPreview({
  fromUrl,
  toUrl,
  glTransitionName,
  duration,
  disabled,
}: {
  fromUrl?: string;
  toUrl?: string;
  glTransitionName: string | null;
  duration: number;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createGlRenderer> | null>(null);
  const rafRef = useRef<number | null>(null);
  const sourcesRef = useRef<{ from: TexImageSource; to: TexImageSource } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isCut = isCutTransitionName(glTransitionName);
  const canRender = !disabled && !isCut && !!glTransitionName && !!fromUrl && !!toUrl;

  const drawAt = useCallback(
    (p: number) => {
      const renderer = rendererRef.current;
      const sources = sourcesRef.current;
      const canvas = canvasRef.current;
      if (!renderer || !sources || !canvas || !glTransitionName || isCut) return;
      renderer.draw(p, glTransitionName, sources.from, sources.to, PREVIEW_W, PREVIEW_H);
      setProgress(p);
    },
    [glTransitionName, isCut]
  );

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setReady(false);
    setLoadError(null);
    sourcesRef.current = null;

    if (!canRender) return;

    let cancelled = false;
    (async () => {
      try {
        const [from, to] = await Promise.all([
          loadMediaSource(fromUrl!),
          loadMediaSource(toUrl!),
        ]);
        if (cancelled) return;
        sourcesRef.current = { from, to };
        const canvas = canvasRef.current;
        if (!canvas) return;
        rendererRef.current?.dispose();
        rendererRef.current = createGlRenderer(canvas);
        setReady(!!rendererRef.current);
        drawAt(0);
      } catch {
        if (!cancelled) setLoadError('Impossible de charger les images du raccord.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canRender, fromUrl, toUrl, drawAt]);

  useEffect(() => {
    if (!ready || isCut) return;
    drawAt(progress);
  }, [glTransitionName, ready, isCut, drawAt, progress]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  const stopPlay = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (!canRender || !ready) return;
    stopPlay();
    setPlaying(true);
    const start = performance.now();
    const dur = Math.max(0.2, duration) * 1000;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      drawAt(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        stopPlay();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [canRender, ready, duration, drawAt, stopPlay]);

  const playRef = useRef(play);
  playRef.current = play;

  useEffect(() => {
    if (!ready || !canRender || !glTransitionName) return;
    if (!isCustomGlTransitionName(glTransitionName)) return;
    const id = window.setTimeout(() => playRef.current(), 450);
    return () => clearTimeout(id);
  }, [ready, canRender, glTransitionName, fromUrl, toUrl]);

  return (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-md border border-[#333333] bg-black"
        style={{ width: PREVIEW_W, height: PREVIEW_H }}
      >
        <canvas
          ref={canvasRef}
          width={PREVIEW_W}
          height={PREVIEW_H}
          className="block h-full w-full"
        />
        {(!canRender || loadError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]/90 px-3 text-center text-[10px] text-neutral-500">
            {loadError ??
              (isCut
                ? 'Coupe sèche — pas d’aperçu'
                : disabled
                  ? 'Sélectionnez un raccord'
                  : 'Images manquantes pour l’aperçu')}
          </div>
        )}
      </div>

      {canRender && ready && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={playing ? stopPlay : play}
            className="rounded-md border border-[#404040] bg-[#2a2a2a] px-2.5 py-1 text-[10px] font-semibold text-neutral-200 hover:bg-[#353535]"
          >
            {playing ? '■ Stop' : '▶ Aperçu'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={progress}
            onChange={(e) => {
              stopPlay();
              drawAt(parseFloat(e.target.value));
            }}
            className="min-w-0 flex-1 h-1.5 accent-cyan-500 cursor-pointer"
            aria-label="Progression transition"
          />
          <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-neutral-500">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
