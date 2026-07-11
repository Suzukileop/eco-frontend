import type { Clip, Composition } from '@/types/composition';
import { getRemotionDimensions } from '@/lib/studio/remotionBridge';

/** Charge les dimensions naturelles d'une image (URL). */
export function probeMediaDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({
        width: img.naturalWidth > 0 ? img.naturalWidth : 640,
        height: img.naturalHeight > 0 ? img.naturalHeight : 360,
      });
    };
    img.onerror = () => resolve({ width: 16, height: 9 });
    img.src = url;
  });
}

/** Charge les dimensions naturelles d'une vidéo (URL). */
export function probeVideoDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth > 0 ? video.videoWidth : 640,
        height: video.videoHeight > 0 ? video.videoHeight : 360,
      });
    };
    video.onerror = () => resolve({ width: 16, height: 9 });
    video.src = url;
  });
}

export function probeMediaDimensionsForClip(
  url: string,
  type: 'image' | 'video'
): Promise<{ width: number; height: number }> {
  return type === 'video' ? probeVideoDimensions(url) : probeMediaDimensions(url);
}

export function resolvePreviewCanvasPx(
  composition: Composition | null,
  previewCanvasSize: { width: number; height: number }
): { width: number; height: number } {
  if (previewCanvasSize.width > 0 && previewCanvasSize.height > 0) {
    return previewCanvasSize;
  }
  if (composition) {
    return getRemotionDimensions(
      composition.format,
      composition.customAspectW,
      composition.customAspectH
    );
  }
  return { width: 1080, height: 1920 };
}

/**
 * Largeur (% du canvas) pour afficher le média en « contain » :
 * ratio source conservé, centré dans la zone preview.
 */
export function computeContainBoxWidthPct(
  mediaWidth: number,
  mediaHeight: number,
  canvasWidth: number,
  canvasHeight: number
): number {
  if (mediaWidth <= 0 || mediaHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return 100;
  }

  const mediaAspect = mediaWidth / mediaHeight;
  const canvasAspect = canvasWidth / canvasHeight;

  let displayW: number;
  if (canvasAspect > mediaAspect) {
    displayW = canvasHeight * mediaAspect;
  } else {
    displayW = canvasWidth;
  }

  return Math.min(100, Math.max(8, (displayW / canvasWidth) * 100));
}

/** Placement par défaut : format natif, centré dans le canvas preview. */
export function buildCenteredNativeMediaLayout(
  mediaWidth: number,
  mediaHeight: number,
  canvasWidth: number,
  canvasHeight: number
): Pick<
  Clip,
  | 'x'
  | 'y'
  | 'boxWidthPct'
  | 'mediaNaturalWidth'
  | 'mediaNaturalHeight'
  | 'mediaScale'
  | 'mediaOffsetX'
  | 'mediaOffsetY'
  | 'mediaRotation'
> {
  return {
    x: 50,
    y: 50,
    boxWidthPct: computeContainBoxWidthPct(
      mediaWidth,
      mediaHeight,
      canvasWidth,
      canvasHeight
    ),
    mediaNaturalWidth: mediaWidth,
    mediaNaturalHeight: mediaHeight,
    mediaScale: 1,
    mediaOffsetX: 0,
    mediaOffsetY: 0,
    mediaRotation: 0,
  };
}

export async function buildCenteredNativeMediaLayoutFromUrl(
  url: string,
  type: 'image' | 'video',
  composition: Composition | null,
  previewCanvasSize: { width: number; height: number }
): Promise<
  Pick<
    Clip,
    | 'x'
    | 'y'
    | 'boxWidthPct'
    | 'mediaNaturalWidth'
    | 'mediaNaturalHeight'
    | 'mediaScale'
    | 'mediaOffsetX'
    | 'mediaOffsetY'
    | 'mediaRotation'
  >
> {
  const { width, height } = await probeMediaDimensionsForClip(url, type);
  const canvas = resolvePreviewCanvasPx(composition, previewCanvasSize);
  return buildCenteredNativeMediaLayout(width, height, canvas.width, canvas.height);
}

/** Hauteur du cadre média (px) à partir de la largeur, en conservant le ratio source. */
export function mediaFrameHeightPx(
  boxWidthPx: number,
  clip: Pick<Clip, 'mediaNaturalWidth' | 'mediaNaturalHeight'>,
  /** hauteur/largeur si dimensions source inconnues */
  fallbackHeightOverWidth = 1
): number {
  const nw = clip.mediaNaturalWidth;
  const nh = clip.mediaNaturalHeight;
  if (nw && nh && nw > 0 && nh > 0) {
    return Math.max(1, boxWidthPx * (nh / nw));
  }
  return Math.max(1, boxWidthPx * fallbackHeightOverWidth);
}

/** Taille d'affichage « contain » d'une image dans son cadre (px). */
export function containedMediaSizePx(
  boxWidthPx: number,
  boxHeightPx: number,
  naturalWidth: number,
  naturalHeight: number
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: boxWidthPx, height: boxHeightPx };
  }
  const scale = Math.min(boxWidthPx / naturalWidth, boxHeightPx / naturalHeight);
  return {
    width: naturalWidth * scale,
    height: naturalHeight * scale,
  };
}

export function resolveMediaAspectRatio(
  clip: Pick<Clip, 'mediaNaturalWidth' | 'mediaNaturalHeight'>,
  fallback = 1
): number {
  const nw = clip.mediaNaturalWidth;
  const nh = clip.mediaNaturalHeight;
  if (nw && nh && nw > 0 && nh > 0) return nw / nh;
  return fallback;
}

export interface MediaFrameRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Cadre média en px — même géométrie que RemotionBackgroundClip / Konva. */
export function computeClipMediaFramePx(
  canvasW: number,
  canvasH: number,
  clip: Pick<Clip, 'x' | 'y' | 'boxWidthPct' | 'mediaNaturalWidth' | 'mediaNaturalHeight'>
): MediaFrameRect {
  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? 50;
  const boxWidthPct = clip.boxWidthPct ?? 100;
  const width = (canvasW * boxWidthPct) / 100;
  const height = mediaFrameHeightPx(width, clip);
  return {
    left: (canvasW * xPct) / 100 - width / 2,
    top: (canvasH * yPct) / 100 - height / 2,
    width,
    height,
  };
}

/** Cadre transition = format global du preview (canvas entier, constant). */
export function computePreviewTransitionFramePx(
  canvasW: number,
  canvasH: number
): MediaFrameRect {
  return { left: 0, top: 0, width: canvasW, height: canvasH };
}

/** Médias background manipulés via overlay DOM (poignées hors cadre). */
export function isDomMediaClip(
  clip: Pick<Clip, 'trackType' | 'type' | 'url'>
): boolean {
  return (
    clip.trackType === 'background' &&
    (clip.type === 'image' || clip.type === 'video' || Boolean(clip.url))
  );
}
