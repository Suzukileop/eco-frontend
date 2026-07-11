import type { Clip, Composition, Transition } from '@/types/composition';
import { getLane0Clips } from '@/lib/backgroundLanes';
import {
  resolveTransitionWindow,
  type TransitionWindow,
} from '@/lib/transitionApply';

function consecutiveOnLane(lane: Clip[], from: Clip, to: Clip): boolean {
  const i = lane.findIndex((c) => c.id === from.id);
  return i >= 0 && lane[i + 1]?.id === to.id;
}

export type TransitionFamily = 'fade' | 'slide' | 'zoom' | 'glitch';
export type TransitionDirection = 'left' | 'right' | 'up' | 'down';

export interface ResolvedV1Transition {
  id: string;
  fromClip: Clip;
  toClip: Clip;
  window: TransitionWindow;
  /** Frame de début (= junction - durée/2). */
  startFrame: number;
  /** Frame de jonction (centre, progress = 0.5). */
  junctionFrame: number;
  /** Frame de fin (= junction + durée/2). */
  endFrame: number;
  durationFrames: number;
  family: TransitionFamily;
  direction: TransitionDirection;
}

const CUT_NAME = 'basic-cut';

function resolveName(tr: Transition): string | null {
  if (tr.type === 'cut') return null;
  const name = tr.glTransitionName ?? tr.presetId ?? tr.type;
  if (!name || name === CUT_NAME || name === 'cut') return null;
  return name;
}

function familyFromName(glName: string): TransitionFamily {
  const n = glName.toLowerCase();
  if (n.includes('glitch')) return 'glitch';
  if (n.includes('slide') || n.includes('warp') || n.includes('swipe') || n.startsWith('np-'))
    return 'slide';
  if (n.includes('zoom') || n.includes('cube') || n.includes('rotate') || n.includes('scale'))
    return 'zoom';
  return 'fade';
}

function directionFromName(glName: string): TransitionDirection {
  const n = glName.toLowerCase();
  if (n.includes('up')) return 'up';
  if (n.includes('down')) return 'down';
  if (n.includes('left')) return 'left';
  if (n.includes('right')) return 'right';
  return 'right';
}

/**
 * Transitions V1 — fenêtre CapCut centrée sur la jonction
 * `[junction - d/2, junction + d/2]`, moitié sur M1, moitié sur M2.
 */
export function resolveV1Transitions(
  composition: Composition,
  fps: number
): ResolvedV1Transition[] {
  const transitions = composition.transitions ?? [];
  if (transitions.length === 0) return [];

  const lane0 = getLane0Clips(composition.tracks.background ?? []);
  const result: ResolvedV1Transition[] = [];

  for (const tr of transitions) {
    const glName = resolveName(tr);
    if (!glName) continue;

    const from = lane0.find((c) => c.id === tr.fromClipId);
    const to = lane0.find((c) => c.id === tr.toClipId);
    if (!from || !to) continue;
    if (!consecutiveOnLane(lane0, from, to)) continue;

    const window = resolveTransitionWindow(tr, from, to);
    if (!window) continue;

    const startFrame = Math.max(0, Math.round(window.startTime * fps));
    const endFrame = Math.max(startFrame + 1, Math.round(window.endTime * fps));
    const junctionFrame = Math.round(window.junction * fps);
    const durationFrames = endFrame - startFrame;
    if (durationFrames <= 0) continue;

    result.push({
      id: tr.id,
      fromClip: from,
      toClip: to,
      window,
      startFrame,
      junctionFrame,
      endFrame,
      durationFrames,
      family: familyFromName(glName),
      direction: directionFromName(glName),
    });
  }

  return result;
}
