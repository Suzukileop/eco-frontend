import type { Clip, Format } from '@/types/composition';
import { resolveTextFramePx } from '@/lib/studio/textBoundsMeasure';
import { mediaFrameHeightPx } from '@/lib/studio/mediaDimensions';

export interface KonvaClipBounds {
  clipId: string;
  trackType: Clip['trackType'];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
}

/** Convertit un clip actif en repère Konva (coords canvas px, centre = x/y). */
export function clipToKonvaBounds(
  clip: Clip,
  canvasWidth: number,
  canvasHeight: number,
  _format: Format = '9:16', // eslint-disable-line @typescript-eslint/no-unused-vars
  _customAspectW?: number,  // eslint-disable-line @typescript-eslint/no-unused-vars
  _customAspectH?: number   // eslint-disable-line @typescript-eslint/no-unused-vars
): KonvaClipBounds {
  const isText = clip.trackType === 'text' || clip.type === 'text';

  if (isText) {
    const frame = resolveTextFramePx(clip, canvasWidth, canvasHeight);
    return {
      clipId: clip.id,
      trackType: clip.trackType,
      x: frame.centerX,
      y: frame.centerY,
      width: frame.widthPx,
      height: frame.heightPx,
      rotation: clip.mediaRotation ?? 0,
      label: clip.content?.slice(0, 32) ?? 'Texte',
    };
  }

  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? 50;
  const boxWidthPct = clip.boxWidthPct ?? 100;
  const width = (canvasWidth * boxWidthPct) / 100;
  const height = mediaFrameHeightPx(width, clip);

  return {
    clipId: clip.id,
    trackType: clip.trackType,
    x: (canvasWidth * xPct) / 100,
    y: (canvasHeight * yPct) / 100,
    width,
    height,
    rotation: clip.mediaRotation ?? 0,
    label:
      clip.content?.slice(0, 24) ??
      (clip.type === 'video' ? 'Vidéo' : clip.type === 'image' ? 'Image' : 'Clip'),
  };
}

export function konvaBoundsToClipPatch(
  bounds: KonvaClipBounds,
  canvasWidth: number,
  canvasHeight: number
): Partial<Clip> {
  const x = canvasWidth > 0 ? (bounds.x / canvasWidth) * 100 : 50;
  const y = canvasHeight > 0 ? (bounds.y / canvasHeight) * 100 : 50;
  const boxWidthPct = canvasWidth > 0 ? (bounds.width / canvasWidth) * 100 : 85;

  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
    boxWidthPct: Math.min(100, Math.max(8, boxWidthPct)),
    mediaRotation: bounds.rotation,
  };
}
