import type { Composition } from '@/types/composition';
import { patchTightTextClipBox } from '@/lib/studio/textBoundsMeasure';

/** Réaligne les clips texte legacy (boxWidthPct ~85 %) sur la largeur réelle du contenu. */
export function normalizeStudioTextClips(
  composition: Composition,
  canvasWidth: number,
  canvasHeight: number
): Composition {
  if (canvasWidth < 8 || canvasHeight < 8) return composition;

  let changed = false;
  const text = composition.tracks.text.map((clip) => {
    const patch = patchTightTextClipBox(clip, canvasWidth, canvasHeight);
    if (!patch) return clip;
    changed = true;
    return { ...clip, ...patch };
  });

  if (!changed) return composition;
  return {
    ...composition,
    tracks: { ...composition.tracks, text },
  };
}
