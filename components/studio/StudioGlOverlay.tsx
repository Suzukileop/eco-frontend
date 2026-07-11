'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { GlTransitionOverlay } from '@/components/editor/GlTransitionOverlay';
import { useCompositionStore } from '@/stores/compositionStore';
import {
  findActiveTransitionBlend,
  findLane0Junctions,
  findTransitionBetween,
  findTransitionPrefetchContext,
  firstBackgroundLane,
  resolveTransitionWindow,
} from '@/lib/transitionApply';
import { getClipBackgroundLane } from '@/lib/backgroundLanes';
import { warmTransitionVideoPair } from '@/lib/glTransitionMedia';
import { isCutTransitionName, resolveGlTransitionName } from '@/lib/glTransitions';

interface StudioGlOverlayProps {
  width: number;
  height: number;
}

export function StudioGlOverlay({ width, height }: StudioGlOverlayProps) {
  const composition = useCompositionStore((s) => s.composition);
  const currentTime = useCompositionStore((s) => s.currentTime);
  const laneHidden = useCompositionStore((s) => s.laneHidden);
  const trackHidden = useCompositionStore((s) => s.trackHidden);
  const setV1GlCoverReady = useCompositionStore((s) => s.setV1GlCoverReady);

  const fps = composition?.fps ?? 30;
  const tailSec = 1 / fps;

  const bg = useMemo(
    () => composition?.tracks.background ?? [],
    [composition?.tracks.background]
  );
  const lane0 = useMemo(() => firstBackgroundLane(bg), [bg]);

  const v1Hidden =
    (trackHidden?.background ?? false) || (laneHidden?.['background-0'] ?? false);

  const isLaneVisible = useCallback(
    (clipId: string) => {
      if (v1Hidden) return false;
      const clip = bg.find((c) => c.id === clipId);
      if (!clip) return false;
      const lane = getClipBackgroundLane(clip);
      return !(laneHidden[`background-${lane}`] ?? false);
    },
    [v1Hidden, bg, laneHidden]
  );

  const blend = useMemo(
    () =>
      findActiveTransitionBlend(
        composition?.transitions ?? [],
        lane0,
        currentTime,
        isLaneVisible,
        tailSec
      ),
    [composition?.transitions, lane0, currentTime, isLaneVisible, tailSec]
  );

  const prefetch = useMemo(
    () =>
      blend
        ? null
        : findTransitionPrefetchContext(
            composition?.transitions ?? [],
            lane0,
            currentTime,
            isLaneVisible
          ),
    [blend, composition?.transitions, lane0, currentTime, isLaneVisible]
  );

  const activeFromId = blend?.fromId ?? prefetch?.fromId;
  const activeToId = blend?.toId ?? prefetch?.toId;

  const transition = useMemo(
    () =>
      activeFromId && activeToId
        ? composition?.transitions?.find(
            (t) => t.fromClipId === activeFromId && t.toClipId === activeToId
          )
        : undefined,
    [composition?.transitions, activeFromId, activeToId]
  );

  const glName = transition ? resolveGlTransitionName(transition) : null;
  const fromClip = activeFromId ? bg.find((c) => c.id === activeFromId) : undefined;
  const toClip = activeToId ? bg.find((c) => c.id === activeToId) : undefined;

  const blendWindow = useMemo(() => {
    const window = blend?.startTime != null
      ? {
          junction: blend.junction,
          duration: blend.duration,
          startTime: blend.startTime,
          endTime: blend.endTime,
        }
      : prefetch?.window;
    return window ?? null;
  }, [blend, prefetch]);

  const renderProgress = blend?.p ?? prefetch?.previewProgress ?? 0;
  const renderTime = blend ? currentTime : prefetch?.previewTime ?? currentTime;
  const displayActive = Boolean(blend);

  // Pré-chauffe en tâche de fond dès que les raccords V1 sont connus (sans overlay visible).
  useEffect(() => {
    if (v1Hidden || !composition?.transitions?.length) return;

    const warmAll = () => {
      for (const { from, to } of findLane0Junctions(lane0)) {
        const tr = findTransitionBetween(composition.transitions, from.id, to.id);
        if (!tr || tr.type === 'cut') continue;
        const window = resolveTransitionWindow(tr, from, to);
        if (!window) continue;
        void warmTransitionVideoPair(from, to, window).catch(() => undefined);
      }
    };

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 80));
    const id = idle(warmAll);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
    };
  }, [composition?.transitions, lane0, v1Hidden]);

  useEffect(() => {
    if (!blend && !prefetch) {
      setV1GlCoverReady(false);
    }
  }, [blend, prefetch, setV1GlCoverReady]);

  const handleCoverReady = useCallback(
    (ready: boolean) => {
      setV1GlCoverReady(ready);
    },
    [setV1GlCoverReady]
  );

  if (
    !blendWindow ||
    !glName ||
    isCutTransitionName(glName) ||
    !fromClip ||
    !toClip
  ) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[25]"
      style={{ width, height }}
    >
      <GlTransitionOverlay
        fromClip={fromClip}
        toClip={toClip}
        glTransitionName={glName}
        progress={renderProgress}
        currentTime={renderTime}
        window={blendWindow}
        width={width}
        height={height}
        displayActive={displayActive}
        onCoverReady={handleCoverReady}
      />
    </div>
  );
}
