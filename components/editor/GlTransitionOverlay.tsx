'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Clip } from '@/types/composition';
import type { TransitionWindow } from '@/lib/transitionApply';
import { createGlRenderer } from '@/lib/glTransitionRenderer';
import {
  isTransitionPairWarmed,
  warmTransitionVideoPair,
} from '@/lib/glTransitionMedia';
import { computePreviewTransitionFramePx } from '@/lib/studio/mediaDimensions';
import { isCutTransitionName } from '@/lib/glTransitions';

export function GlTransitionOverlay({
  fromClip,
  toClip,
  glTransitionName,
  progress,
  currentTime,
  window,
  width,
  height,
  displayActive = true,
  onCoverReady,
}: {
  fromClip: Clip;
  toClip: Clip;
  glTransitionName: string | null;
  progress: number;
  currentTime: number;
  window: TransitionWindow;
  width: number;
  height: number;
  /** false = pré-chauffe invisible (M1 continue sous Remotion sans pause). */
  displayActive?: boolean;
  onCoverReady?: (ready: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createGlRenderer> | null>(null);
  const videoPairRef = useRef<Awaited<ReturnType<typeof warmTransitionVideoPair>> | null>(null);
  const glNameRef = useRef<string | null>(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const pendingRef = useRef<{ progress: number; timeSec: number } | null>(null);
  const fromRef = useRef(fromClip);
  const toRef = useRef(toClip);
  const windowRef = useRef(window);
  const progressRef = useRef(progress);
  const currentTimeRef = useRef(currentTime);
  fromRef.current = fromClip;
  toRef.current = toClip;
  windowRef.current = window;
  progressRef.current = progress;
  currentTimeRef.current = currentTime;

  const canRender =
    !isCutTransitionName(glTransitionName) &&
    !!glTransitionName &&
    width > 0 &&
    height > 0;

  const flushDraw = async () => {
    if (drawingRef.current) return;
    const renderer = rendererRef.current;
    const pair = videoPairRef.current;
    const canvas = canvasRef.current;
    const name = glNameRef.current;
    if (!renderer || !pair || !canvas || !name) return;

    drawingRef.current = true;
    try {
      while (pendingRef.current) {
        const { progress: p, timeSec } = pendingRef.current;
        pendingRef.current = null;

        const sources = await pair.seekToTime(
          fromRef.current,
          toRef.current,
          windowRef.current,
          timeSec
        );
        const frame = computePreviewTransitionFramePx(width, height);
        const cw = Math.max(1, Math.round(frame.width));
        const ch = Math.max(1, Math.round(frame.height));
        renderer.draw(p, name, sources.from, sources.to, cw, ch);

        if (!hasDrawnRef.current) {
          hasDrawnRef.current = true;
          onCoverReady?.(true);
        }
      }
    } finally {
      drawingRef.current = false;
      if (pendingRef.current) void flushDraw();
    }
  };

  const scheduleDraw = useCallback((p: number, timeSec: number) => {
    pendingRef.current = { progress: p, timeSec };
    void flushDraw();
    // flushDraw lit les refs — deps volontairement stables pour le cycle WebGL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!canRender || !glTransitionName) return;

    let cancelled = false;
    const alreadyWarm = isTransitionPairWarmed(
      fromClip.id,
      toClip.id,
      window.startTime
    );

    if (!alreadyWarm) {
      hasDrawnRef.current = false;
    }

    glNameRef.current = glTransitionName;

    (async () => {
      try {
        const pair = await warmTransitionVideoPair(fromClip, toClip, window);
        if (cancelled) return;
        videoPairRef.current = pair;

        if (!rendererRef.current) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          rendererRef.current = createGlRenderer(canvas);
        }

        scheduleDraw(progressRef.current, currentTimeRef.current);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
      videoPairRef.current = null;
    };
  }, [canRender, fromClip, toClip, glTransitionName, window, scheduleDraw]);

  useEffect(() => {
    if (!canRender || !glTransitionName || glNameRef.current !== glTransitionName) return;
    if (!rendererRef.current || !videoPairRef.current) return;
    scheduleDraw(progress, currentTime);
  }, [progress, currentTime, glTransitionName, width, height, canRender, scheduleDraw]);

  useEffect(() => {
    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!displayActive) return;
    if (!hasDrawnRef.current || !rendererRef.current || !videoPairRef.current) return;
    scheduleDraw(progressRef.current, currentTimeRef.current);
  }, [displayActive, scheduleDraw]);

  if (!canRender) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0 z-[25] h-full w-full"
      style={{
        opacity: displayActive ? 1 : 0,
        visibility: displayActive ? 'visible' : 'hidden',
      }}
      aria-hidden
    />
  );
}
