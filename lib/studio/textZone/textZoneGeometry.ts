import type { Clip } from '@/types/composition';
import { pxToPct } from '@/lib/studio/konva/clipLayout';
import { measureKonvaEditorTextFrame } from '@/lib/studio/konva/textFrameMeasure';
import type { TextZoneModel } from '@/lib/studio/textZone/types';

export const TEXT_ZONE_MIN_WIDTH_PX = 80;
/** Plage du slider « Taille » (panneau droit) — doit couvrir les valeurs du resize coin. */
export const STUDIO_TEXT_FONT_SIZE_MIN = 8;
export const STUDIO_TEXT_FONT_SIZE_MAX = 200;
export const TEXT_ZONE_PADDING_X = 12;
export const TEXT_ZONE_PADDING_Y = 8;

export function clipToTextZoneModel(clip: Clip, canvasWidth: number, canvasHeight: number): TextZoneModel {
  const measured = measureKonvaEditorTextFrame(clip, canvasWidth);
  const widthPx = measured.widthPx;
  const heightPx = clip.textFrameHeightPx ?? measured.heightPx;
  const centerX = ((clip.x ?? 50) / 100) * canvasWidth;
  const centerY = ((clip.y ?? 50) / 100) * canvasHeight;
  return {
    leftPx: centerX - widthPx / 2,
    topPx: centerY - heightPx / 2,
    widthPx,
    heightPx,
    fontSize: clip.fontSize ?? 24,
    content: clip.content ?? '',
    rotationDeg: clip.textRotation ?? 0,
  };
}

export function textZoneModelToClipPatch(
  model: TextZoneModel,
  canvasWidth: number,
  canvasHeight: number
): Partial<Clip> {
  const centerX = model.leftPx + model.widthPx / 2;
  const centerY = model.topPx + model.heightPx / 2;
  return {
    x: pxToPct(centerX, canvasWidth),
    y: pxToPct(centerY, canvasHeight),
    boxWidthPct: pxToPct(model.widthPx, canvasWidth),
    fontSize: Math.round(model.fontSize),
    textFrameHeightPx: model.heightPx,
    content: model.content,
    textAnchorCorner: undefined,
    textAnchorXPx: undefined,
    textAnchorYPx: undefined,
    textRotation: model.rotationDeg,
  };
}

/** Évite updateClip si le patch n’apporte rien (anti-boucle React). */
export function textZoneClipPatchChanged(clip: Clip, patch: Partial<Clip>): boolean {
  for (const key of Object.keys(patch) as (keyof Clip)[]) {
    const next = patch[key];
    const prev = clip[key];
    if (next === undefined) continue;
    if (typeof next === 'number' && typeof prev === 'number') {
      const tol = key === 'fontSize' || key === 'textFrameHeightPx' ? 1 : 0.05;
      if (Math.abs(next - prev) > tol) return true;
      continue;
    }
    if (prev !== next) return true;
  }
  return false;
}

/**
 * Masque le texte au bord du format (CapCut) — la zone / poignées restent visibles hors cadre.
 */
export function formatContentClipPath(
  leftPx: number,
  topPx: number,
  widthPx: number,
  heightPx: number,
  canvasWidth: number,
  canvasHeight: number
): string | undefined {
  const clipL = Math.max(0, Math.round(-leftPx));
  const clipT = Math.max(0, Math.round(-topPx));
  const clipR = Math.max(0, Math.round(leftPx + widthPx - canvasWidth));
  const clipB = Math.max(0, Math.round(topPx + heightPx - canvasHeight));
  if (clipL === 0 && clipT === 0 && clipR === 0 && clipB === 0) return undefined;
  return `inset(${clipT}px ${clipR}px ${clipB}px ${clipL}px)`;
}

export function measureTextareaContentHeight(
  el: HTMLTextAreaElement,
  widthPx: number,
  minHeightPx = 24
): number {
  const prevH = el.style.height;
  const prevW = el.style.width;
  const prevMin = el.style.minHeight;
  el.style.width = `${widthPx}px`;
  el.style.height = '0px';
  el.style.minHeight = '0px';
  const h = Math.ceil(el.scrollHeight);
  el.style.height = prevH;
  el.style.width = prevW;
  el.style.minHeight = prevMin;
  return Math.max(minHeightPx, h);
}
