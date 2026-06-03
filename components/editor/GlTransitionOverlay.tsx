'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createGlRenderer, loadMediaSource } from '@/lib/glTransitionRenderer';
import { isCutTransitionName } from '@/lib/glTransitions';

export function GlTransitionOverlay({
  fromUrl,
  toUrl,
  glTransitionName,
  progress,
  width,
  height,
}: {
  fromUrl?: string;
  toUrl?: string;
  glTransitionName: string | null;
  progress: number;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createGlRenderer> | null>(null);
  const sourcesRef = useRef<{ from: TexImageSource; to: TexImageSource } | null>(null);

  const canRender =
    !isCutTransitionName(glTransitionName) &&
    !!glTransitionName &&
    !!fromUrl &&
    !!toUrl &&
    width > 0 &&
    height > 0;

  const drawAt = useCallback(
    (p: number) => {
      const renderer = rendererRef.current;
      const sources = sourcesRef.current;
      const canvas = canvasRef.current;
      if (!renderer || !sources || !canvas || !glTransitionName) return;
      renderer.draw(p, glTransitionName, sources.from, sources.to, width, height);
    },
    [glTransitionName, width, height]
  );

  useEffect(() => {
    sourcesRef.current = null;
    rendererRef.current?.dispose();
    rendererRef.current = null;
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
        rendererRef.current = createGlRenderer(canvas);
        drawAt(progress);
      } catch {
        /* ignore — fallback CSS layers remain visible */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canRender, fromUrl, toUrl, drawAt, progress]);

  useEffect(() => {
    drawAt(progress);
  }, [progress, glTransitionName, width, height, drawAt]);

  useEffect(() => {
    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  if (!canRender) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0 z-[25] h-full w-full"
      aria-hidden
    />
  );
}
