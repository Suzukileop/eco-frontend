'use client';

import { useMemo } from 'react';
import { GlTransitionOverlay } from '@/components/editor/GlTransitionOverlay';
import { useCompositionStore } from '@/stores/compositionStore';
import {
  findActiveTransitionBlend,
  firstBackgroundLane,
} from '@/lib/transitionApply';
import { isCutTransitionName, resolveGlTransitionName } from '@/lib/glTransitions';
import type { Clip } from '@/types/composition';

function computeLaneIndex(clips: Clip[], clipId: string): number {
  const lanes: Clip[][] = [];
  for (const c of clips) {
    let placed = false;
    for (const lane of lanes) {
      const last = lane[lane.length - 1];
      if (last.endTime <= c.startTime) {
        lane.push(c);
        placed = true;
        break;
      }
    }
    if (!placed) lanes.push([c]);
  }
  for (let i = 0; i < lanes.length; i++) {
    if (lanes[i].some((c) => c.id === clipId)) return i;
  }
  return 0;
}

interface StudioGlOverlayProps {
  width: number;
  height: number;
}

export function StudioGlOverlay({ width, height }: StudioGlOverlayProps) {
  const composition = useCompositionStore((s) => s.composition);
  const currentTime = useCompositionStore((s) => s.currentTime);
  const laneHidden = useCompositionStore((s) => s.laneHidden);

  const bg = useMemo(
    () => composition?.tracks.background ?? [],
    [composition?.tracks.background]
  );
  const lane0 = useMemo(() => firstBackgroundLane(bg), [bg]);

  const isLaneVisible = (clipId: string) => {
    const idx = computeLaneIndex(bg, clipId);
    return !(laneHidden[`background-${idx}`] ?? false);
  };

  const blend = findActiveTransitionBlend(
    composition?.transitions ?? [],
    lane0,
    currentTime,
    isLaneVisible
  );

  if (!blend) return null;

  const transition = composition?.transitions?.find(
    (t) => t.fromClipId === blend.fromId && t.toClipId === blend.toId
  );
  const glName = transition ? resolveGlTransitionName(transition) : null;
  if (!glName || isCutTransitionName(glName)) return null;

  const fromClip = bg.find((c) => c.id === blend.fromId);
  const toClip = bg.find((c) => c.id === blend.toId);
  if (!fromClip || !toClip) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[25]"
      style={{ width, height }}
    >
      <GlTransitionOverlay
        fromUrl={fromClip.thumbnail ?? fromClip.url}
        toUrl={toClip.thumbnail ?? toClip.url}
        glTransitionName={glName}
        progress={blend.p}
        width={width}
        height={height}
      />
    </div>
  );
}
