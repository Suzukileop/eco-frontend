'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Clip } from '@/types/composition';
import { createGlRenderer } from '@/lib/glTransitionRenderer';
import { TransitionVideoPair } from '@/lib/glTransitionMedia';
import { computePreviewTransitionFramePx } from '@/lib/studio/mediaDimensions';
import {
  resolveTransitionWindow,
  transitionJunction,
  type TransitionWindow,
} from '@/lib/transitionApply';
import { isCutTransitionName } from '@/lib/glTransitions';

const PREVIEW_W = 280;
const PREVIEW_H = 158;
/** Même progression que les miniatures de la bibliothèque GL. */
const THUMB_MATCH_PROGRESS = 0.5;

function buildPreviewWindow(
  fromClip: Clip,
  toClip: Clip,
  duration: number
): TransitionWindow {
  return (
    resolveTransitionWindow(
      { id: 'preview', fromClipId: fromClip.id, toClipId: toClip.id, type: 'fade', duration },
      fromClip,
      toClip
    ) ?? {
      junction: transitionJunction(fromClip, toClip),
      duration,
      startTime: transitionJunction(fromClip, toClip) - duration / 2,
      endTime: transitionJunction(fromClip, toClip) + duration / 2,
    }
  );
}

export function TransitionGlPreview({
  fromClip,
  toClip,
  glTransitionName,
  duration,
  disabled,
}: {
  fromClip?: Clip;
  toClip?: Clip;
  glTransitionName: string | null;
  duration: number;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createGlRenderer> | null>(null);
  const videoPairRef = useRef<TransitionVideoPair | null>(null);
  const rafRef = useRef<number | null>(null);
  const glNameRef = useRef<string | null>(null);
  const drawingRef = useRef(false);
  const progressRef = useRef(THUMB_MATCH_PROGRESS);
  const fromRef = useRef(fromClip);
  const toRef = useRef(toClip);
  const windowRef = useRef<TransitionWindow | null>(null);
  fromRef.current = fromClip;
  toRef.current = toClip;

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(THUMB_MATCH_PROGRESS);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isCut = isCutTransitionName(glTransitionName);
  const canRender = !disabled && !isCut && !!glTransitionName && !!fromClip && !!toClip;

  const transitionWindow = useMemo(() => {
    if (!fromClip || !toClip) return null;
    return buildPreviewWindow(fromClip, toClip, duration);
  }, [fromClip, toClip, duration]);
  windowRef.current = transitionWindow;

  const drawAt = useCallback(async (p: number) => {
    const renderer = rendererRef.current;
    const canvas = canvasRef.current;
    const name = glNameRef.current;
    const window = windowRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    const pair = videoPairRef.current;
    if (!renderer || !canvas || !name || !window || !from || !to || !pair || drawingRef.current) {
      return;
    }

    drawingRef.current = true;
    try {
      const currentTime = window.startTime + p * window.duration;
      const sources = await pair.seekToTime(from, to, window, currentTime);

      const frame = computePreviewTransitionFramePx(PREVIEW_W, PREVIEW_H);
      const cw = Math.max(1, Math.round(frame.width));
      const ch = Math.max(1, Math.round(frame.height));

      canvas.width = cw;
      canvas.height = ch;
      canvas.style.width = `${PREVIEW_W}px`;
      canvas.style.height = `${PREVIEW_H}px`;

      renderer.draw(p, name, sources.from, sources.to, cw, ch);

      progressRef.current = p;
      setProgress(p);
    } finally {
      drawingRef.current = false;
    }
  }, []);

  useEffect(() => {
    setPlaying(false);
    progressRef.current = THUMB_MATCH_PROGRESS;
    setProgress(THUMB_MATCH_PROGRESS);
    setReady(false);
    setLoadError(null);
    glNameRef.current = null;
    rendererRef.current?.dispose();
    rendererRef.current = null;
    videoPairRef.current?.dispose();
    videoPairRef.current = null;

    if (!canRender || !fromClip || !toClip || !glTransitionName || !transitionWindow) return;

    let cancelled = false;

    (async () => {
      try {
        glNameRef.current = glTransitionName;
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        rendererRef.current = createGlRenderer(canvas);

        const pair = new TransitionVideoPair();
        await pair.load(fromClip, toClip);
        if (cancelled) {
          pair.dispose();
          return;
        }
        videoPairRef.current = pair;

        await drawAt(THUMB_MATCH_PROGRESS);
        if (cancelled) return;
        setReady(true);
      } catch {
        if (!cancelled) setLoadError('Impossible de charger les images du raccord.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canRender, fromClip, toClip, glTransitionName, transitionWindow, drawAt]);

  useEffect(() => {
    if (!ready || isCut || !glTransitionName) return;
    glNameRef.current = glTransitionName;
    void drawAt(progressRef.current);
  }, [glTransitionName, ready, isCut, drawAt]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rendererRef.current?.dispose();
      rendererRef.current = null;
      videoPairRef.current?.dispose();
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
    if (!canRender || !ready || !transitionWindow) return;

    stopPlay();
    setPlaying(true);

    const start = performance.now();
    const dur = Math.max(0.2, transitionWindow.duration) * 1000;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      void drawAt(p).then(() => {
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          stopPlay();
        }
      });
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [canRender, ready, transitionWindow, drawAt, stopPlay]);

  return (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-md border border-[#333333] bg-black"
        style={{ width: PREVIEW_W, height: PREVIEW_H }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ background: 'transparent' }}
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
              void drawAt(parseFloat(e.target.value));
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
