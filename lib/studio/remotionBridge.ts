import type { Composition, Format } from '@/types/composition';
import { getAspectRatio } from '@/lib/formatPresets';

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
}

export function compositionToRemotionInput(
  composition: Composition
): StudioCompositionInputProps {
  return { composition };
}
