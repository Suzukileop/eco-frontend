import type { Clip } from '@/types/composition';

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

/** Hauteur du cadre média (px) à partir de la largeur, en conservant le ratio source. */
export function mediaFrameHeightPx(
  boxWidthPx: number,
  clip: Pick<Clip, 'mediaNaturalWidth' | 'mediaNaturalHeight'>,
  fallbackAspect = 9 / 16
): number {
  const nw = clip.mediaNaturalWidth;
  const nh = clip.mediaNaturalHeight;
  if (nw && nh && nw > 0 && nh > 0) {
    return Math.max(1, boxWidthPx * (nh / nw));
  }
  return Math.max(1, boxWidthPx * fallbackAspect);
}

export function resolveMediaAspectRatio(
  clip: Pick<Clip, 'mediaNaturalWidth' | 'mediaNaturalHeight'>,
  fallback = 9 / 16
): number {
  const nw = clip.mediaNaturalWidth;
  const nh = clip.mediaNaturalHeight;
  if (nw && nh && nw > 0 && nh > 0) return nw / nh;
  return fallback;
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
