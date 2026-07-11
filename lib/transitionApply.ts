import type { CSSProperties } from 'react';
import type { Clip, Composition, Transition } from '@/types/composition';
import { inferTransitionTypeFromGlName, isCutTransitionName } from '@/lib/glTransitions';

export interface ActiveTransitionBlend {
  fromId: string;
  toId: string;
  p: number;
  duration: number;
  junction: number;
  startTime: number;
  endTime: number;
}

export type TransitionLayerMods = {
  opacityScale: number;
  syncTime?: number;
  transitionStyle?: CSSProperties;
};

const NEUTRAL_LAYER_MODS: TransitionLayerMods = { opacityScale: 1 };

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** Fenêtre CapCut : moitié sur M1, moitié sur M2, centrée sur la jonction. */
export interface TransitionWindow {
  junction: number;
  duration: number;
  /** = junction - duration/2 */
  startTime: number;
  /** = junction + duration/2 */
  endTime: number;
}

export function clampTransitionDuration(
  tr: Pick<Transition, 'duration'>,
  from: Clip,
  to: Clip
): number {
  const maxD = Math.min(
    tr.duration,
    Math.max(0.15, from.endTime - from.startTime - 0.05),
    Math.max(0.15, to.endTime - to.startTime - 0.05)
  );
  return Math.max(0.15, Math.min(maxD, 2.5));
}

/** Jonction temporelle entre deux clips V1 contigus. */
export function transitionJunction(from: Clip, to: Clip): number {
  return (from.endTime + to.startTime) / 2;
}

export function resolveTransitionWindow(
  tr: Transition,
  from: Clip,
  to: Clip
): TransitionWindow | null {
  if (tr.type === 'cut') return null;
  if (Math.abs(from.endTime - to.startTime) > 0.15) return null;
  const duration = clampTransitionDuration(tr, from, to);
  const junction = transitionJunction(from, to);
  const half = duration / 2;
  return {
    junction,
    duration,
    startTime: Math.max(from.startTime, junction - half),
    endTime: Math.min(to.endTime, junction + half),
  };
}

export function transitionProgressAt(
  currentTime: number,
  window: TransitionWindow,
  tailSec = 0
): number | null {
  const end = window.endTime + Math.max(0, tailSec);
  if (currentTime < window.startTime || currentTime >= end) return null;
  return clamp01((currentTime - window.startTime) / window.duration);
}

/** Pré-charge ~1,2 s avant le début — invisible, sans bloquer la lecture M1. */
export const TRANSITION_GL_PREFETCH_SEC = 1.2;

export interface TransitionPrefetchContext {
  fromId: string;
  toId: string;
  window: TransitionWindow;
  previewTime: number;
  previewProgress: number;
}

export function findTransitionPrefetchContext(
  transitions: Transition[],
  lane0: Clip[],
  currentTime: number,
  clipAllowed: (clipId: string) => boolean
): TransitionPrefetchContext | null {
  for (const tr of transitions) {
    if (tr.type === 'cut') continue;
    const from = lane0.find((c) => c.id === tr.fromClipId);
    const to = lane0.find((c) => c.id === tr.toClipId);
    if (!from || !to) continue;
    if (!clipAllowed(from.id) || !clipAllowed(to.id)) continue;
    if (!transitionConsecutiveOnLane(lane0, from, to)) continue;

    const window = resolveTransitionWindow(tr, from, to);
    if (!window) continue;

    const lead = window.startTime - currentTime;
    if (lead <= 0 || lead > TRANSITION_GL_PREFETCH_SEC) continue;

    return {
      fromId: from.id,
      toId: to.id,
      window,
      previewTime: window.startTime,
      previewProgress: 0,
    };
  }
  return null;
}

/** Temps local dans le clip (secondes) pour la frame à afficher pendant la transition. */
export function clipLocalTimeAtTransition(
  clip: Clip,
  role: 'from' | 'to',
  window: TransitionWindow,
  currentTime: number
): number {
  const trimStart = clip.trimStart ?? 0;
  const visibleDuration = Math.max(0.1, clip.endTime - clip.startTime);
  const { junction } = window;

  if (role === 'from') {
    if (currentTime >= junction) {
      return trimStart + visibleDuration;
    }
    return trimStart + visibleDuration - Math.max(0, junction - currentTime);
  }

  if (currentTime <= junction) {
    return trimStart;
  }
  return trimStart + Math.max(0, currentTime - junction);
}

/** Raccord actif sur la piste V0 — fenêtre centrée sur la jonction (CapCut). */
export function findActiveTransitionBlend(
  transitions: Transition[],
  lane0: Clip[],
  currentTime: number,
  clipAllowed: (clipId: string) => boolean,
  tailSec = 0
): ActiveTransitionBlend | null {
  for (const tr of transitions) {
    if (tr.type === 'cut') continue;
    const from = lane0.find((c) => c.id === tr.fromClipId);
    const to = lane0.find((c) => c.id === tr.toClipId);
    if (!from || !to) continue;
    if (!clipAllowed(from.id) || !clipAllowed(to.id)) continue;
    if (!transitionConsecutiveOnLane(lane0, from, to)) continue;

    const window = resolveTransitionWindow(tr, from, to);
    if (!window) continue;

    const p = transitionProgressAt(currentTime, window, tailSec);
    if (p == null) continue;

    return {
      fromId: from.id,
      toId: to.id,
      p,
      duration: window.duration,
      junction: window.junction,
      startTime: window.startTime,
      endTime: window.endTime,
    };
  }
  return null;
}

/** Secours si le rendu WebGL n’est pas disponible : fondu simple entre les deux clips. */
export function getTransitionLayerMods(
  clip: Clip,
  blend: ActiveTransitionBlend | null,
  useGlRenderer: boolean
): TransitionLayerMods {
  if (!blend || useGlRenderer) return NEUTRAL_LAYER_MODS;
  if (clip.id === blend.fromId) return { opacityScale: 1 - blend.p };
  if (clip.id === blend.toId) return { opacityScale: blend.p };
  return NEUTRAL_LAYER_MODS;
}

export {
  assignBackgroundLanes,
  firstBackgroundLane,
  getLane0Clips,
} from '@/lib/backgroundLanes';

export function transitionConsecutiveOnLane(lane: Clip[], from: Clip, to: Clip): boolean {
  const i = lane.findIndex((c) => c.id === from.id);
  return i >= 0 && lane[i + 1]?.id === to.id;
}

export function findLane0Junctions(lane0: Clip[]): { from: Clip; to: Clip }[] {
  if (lane0.length < 2) return [];
  const pairs: { from: Clip; to: Clip }[] = [];
  for (let i = 0; i < lane0.length - 1; i++) {
    const from = lane0[i];
    const to = lane0[i + 1];
    const gap = to.startTime - from.endTime;
    if (gap >= -0.05 && gap <= 0.25) pairs.push({ from, to });
  }
  return pairs;
}

export function findTransitionBetween(
  transitions: Transition[] | undefined,
  fromClipId: string,
  toClipId: string
): Transition | undefined {
  return transitions?.find((t) => t.fromClipId === fromClipId && t.toClipId === toClipId);
}

/** Libellé lisible pour un clip (évite « S1 → S1 » quand les labels sont identiques). */
export function formatJunctionClipLabel(clip: Clip, laneIndex: number): string {
  if (clip.sequenceLabel && clip.sequenceLabel.trim()) {
    return `${clip.sequenceLabel} (${laneIndex + 1})`;
  }
  const start = clip.startTime;
  const m = Math.floor(start / 60);
  const s = Math.floor(start % 60);
  return `Plan ${laneIndex + 1} · ${m}:${s.toString().padStart(2, '0')}`;
}

export function applyGlTransitionToJunction(
  fromClip: Clip,
  toClip: Clip,
  lane0: Clip[],
  glName: string,
  composition: Composition | null,
  actions: {
    addTransition: (t: Transition) => void;
    updateTransition: (
      id: string,
      updates: Partial<Pick<Transition, 'type' | 'duration' | 'presetId' | 'glTransitionName'>>
    ) => void;
    removeTransition: (id: string) => void;
  },
  duration = 0.55
): boolean {
  if (!transitionConsecutiveOnLane(lane0, fromClip, toClip)) return false;
  const tr = findTransitionBetween(composition?.transitions, fromClip.id, toClip.id);
  const nextId = `tr-${fromClip.id}-${toClip.id}`;

  if (isCutTransitionName(glName)) {
    if (tr) actions.removeTransition(tr.id);
    return true;
  }

  const type = inferTransitionTypeFromGlName(glName);
  const payload = {
    type,
    presetId: glName,
    glTransitionName: glName,
  };

  if (tr) {
    actions.updateTransition(tr.id, { ...payload, duration: tr.duration ?? duration });
  } else {
    actions.addTransition({
      id: nextId,
      fromClipId: fromClip.id,
      toClipId: toClip.id,
      type,
      duration,
      presetId: glName,
      glTransitionName: glName,
    });
  }
  return true;
}
