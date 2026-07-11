import type { Clip, Composition, Format, TrackType } from '@/types/composition';
import { getAspectRatio } from '@/lib/formatPresets';
import { getClipBackgroundLane } from '@/lib/backgroundLanes';
import { getClipTextLane } from '@/lib/textLanes';
import { getClipOverlayLane } from '@/lib/overlayLanes';

export const STUDIO_COMPOSITION_ID = 'StudioComposition';

/** Dimensions Remotion (px) — bord long 1920. */
export function getRemotionDimensions(
  format: Format,
  customW?: number,
  customH?: number
): { width: number; height: number } {
  const { w, h } = getAspectRatio(format, customW, customH);
  const longEdge = 1920;
  if (h >= w) {
    return { width: Math.round((longEdge * w) / h), height: longEdge };
  }
  return { width: longEdge, height: Math.round((longEdge * h) / w) };
}

export function timeToFrame(timeSec: number, fps: number): number {
  return Math.max(0, Math.round(timeSec * fps));
}

export function frameToTime(frame: number, fps: number): number {
  return frame / fps;
}

export function getCompositionDurationFrames(composition: Composition): number {
  const fps = composition.fps ?? 30;
  const durationSec = Math.max(composition.duration ?? 1, 0.1);
  return Math.max(1, Math.ceil(durationSec * fps));
}

export interface StudioCompositionInputProps {
  composition: Composition;
  laneMuted?: Record<string, boolean>;
  laneHidden?: Record<string, boolean>;
  trackHidden?: Partial<Record<TrackType, boolean>>;
  /** Preview navigateur : l’overlay WebGL gère les transitions, pas le fallback CSS. */
  skipCssTransitions?: boolean;
  /** Preview : masquer les clips V1 seulement quand l’overlay GL a rendu au moins une frame. */
  v1GlCoverReady?: boolean;
}

export function getClipLaneIndex(clip: Clip, trackType: TrackType): number {
  if (trackType === 'background') return getClipBackgroundLane(clip);
  if (trackType === 'text') return getClipTextLane(clip);
  if (trackType === 'overlay') return getClipOverlayLane(clip);
  return 0;
}

/** Vérifie si un clip est visible selon les toggles timeline (œil piste / lane). */
export function isClipLaneVisible(
  clip: Clip,
  trackType: TrackType,
  laneHidden: Record<string, boolean> = {},
  trackHidden: Partial<Record<TrackType, boolean>> = {}
): boolean {
  if (trackHidden[trackType]) return false;
  const laneIdx = getClipLaneIndex(clip, trackType);
  return !(laneHidden[`${trackType}-${laneIdx}`] ?? false);
}

export function compositionToRemotionInput(
  composition: Composition,
  laneMuted?: Record<string, boolean>,
  laneHidden?: Record<string, boolean>,
  trackHidden?: Partial<Record<TrackType, boolean>>,
  skipCssTransitions?: boolean,
  v1GlCoverReady?: boolean
): StudioCompositionInputProps {
  return { composition, laneMuted, laneHidden, trackHidden, skipCssTransitions, v1GlCoverReady };
}
