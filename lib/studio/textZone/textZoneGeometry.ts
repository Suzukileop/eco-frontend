import type { Clip } from '@/types/composition';
import { pxToPct } from '@/lib/studio/konva/clipLayout';
import { measureKonvaEditorTextFrame } from '@/lib/studio/konva/textFrameMeasure';
import type { TextZoneModel } from '@/lib/studio/textZone/types';

export const TEXT_ZONE_MIN_WIDTH_PX = 80;
/** Taille nominale CapCut (panneau TEXTE) — unités UI, pas des px canvas. */
export const STUDIO_TEXT_BASE_FONT_SIZE_MIN = 5;
export const STUDIO_TEXT_BASE_FONT_SIZE_MAX = 32;
/** Hauteur canvas de référence pour convertir nominal → px (aligné preview ~640 px). */
export const STUDIO_TEXT_CANVAS_REF_HEIGHT = 368;
/** Taille rendue à l’écran (nominal × échelle, converti en px canvas). */
export const STUDIO_TEXT_RENDERED_FONT_SIZE_MIN = 1;
export const STUDIO_TEXT_RENDERED_FONT_SIZE_MAX = 900;
/** @deprecated Utiliser STUDIO_TEXT_BASE_* ou STUDIO_TEXT_RENDERED_* selon le contexte. */
export const STUDIO_TEXT_FONT_SIZE_MIN = STUDIO_TEXT_RENDERED_FONT_SIZE_MIN;
/** @deprecated Utiliser STUDIO_TEXT_BASE_* ou STUDIO_TEXT_RENDERED_* selon le contexte. */
export const STUDIO_TEXT_FONT_SIZE_MAX = STUDIO_TEXT_RENDERED_FONT_SIZE_MAX;
export const STUDIO_TEXT_DEFAULT_FONT_SIZE = 24;

export function clampTextBaseFontSize(size: number): number {
  return Math.max(
    STUDIO_TEXT_BASE_FONT_SIZE_MIN,
    Math.min(STUDIO_TEXT_BASE_FONT_SIZE_MAX, Math.round(size))
  );
}

export function clampTextRenderedFontSize(size: number): number {
  return Math.max(
    STUDIO_TEXT_RENDERED_FONT_SIZE_MIN,
    Math.min(STUDIO_TEXT_RENDERED_FONT_SIZE_MAX, Math.round(size))
  );
}

/** Échelle Transformer — pourcentage relatif à `textScaleBaseFontSize` du clip. */
export const STUDIO_TEXT_SCALE_MIN_PCT = 10;
export const STUDIO_TEXT_SCALE_MAX_PCT = 500;

function clampTextScalePct(pct: number): number {
  return Math.max(
    STUDIO_TEXT_SCALE_MIN_PCT,
    Math.min(STUDIO_TEXT_SCALE_MAX_PCT, Math.round(pct))
  );
}

/** Nominal CapCut → px CSS sur le canvas courant. */
export function nominalFontSizeToCanvasPx(
  nominal: number,
  canvasHeight: number
): number {
  if (canvasHeight <= 0) return clampTextRenderedFontSize(nominal);
  const px = Math.round(
    (clampTextBaseFontSize(nominal) * canvasHeight) / STUDIO_TEXT_CANVAS_REF_HEIGHT
  );
  return clampTextRenderedFontSize(px);
}

export function getTextScaleBaseFontSize(
  clip: Pick<Clip, 'textScaleBaseFontSize' | 'fontSize' | 'textScalePct'>,
  canvasHeight = STUDIO_TEXT_CANVAS_REF_HEIGHT
): number {
  if (clip.textScaleBaseFontSize != null) {
    return clampTextBaseFontSize(clip.textScaleBaseFontSize);
  }
  if (clip.fontSize != null && canvasHeight > 0) {
    const pct = clip.textScalePct ?? 100;
    const nominal =
      (clip.fontSize * STUDIO_TEXT_CANVAS_REF_HEIGHT * 100) /
      (canvasHeight * Math.max(pct, 1));
    return clampTextBaseFontSize(nominal);
  }
  return STUDIO_TEXT_DEFAULT_FONT_SIZE;
}

export function getTextScalePct(
  clip: Pick<Clip, 'textScalePct' | 'fontSize' | 'textScaleBaseFontSize'>,
  canvasHeight = STUDIO_TEXT_CANVAS_REF_HEIGHT
): number {
  if (clip.textScalePct != null) {
    return clampTextScalePct(clip.textScalePct);
  }
  const base = getTextScaleBaseFontSize(clip, canvasHeight);
  const basePx = nominalFontSizeToCanvasPx(base, canvasHeight);
  const rendered = clip.fontSize ?? basePx;
  if (basePx <= 0) return 100;
  return clampTextScalePct(Math.round((rendered / basePx) * 100));
}

/** Alias historique. */
export function textClipScalePct(
  clip: Pick<Clip, 'fontSize' | 'textScaleBaseFontSize' | 'textScalePct'>,
  canvasHeight = STUDIO_TEXT_CANVAS_REF_HEIGHT
): number {
  return getTextScalePct(clip, canvasHeight);
}

/** Px CSS affichés (preview ou export Remotion). */
export function resolveClipRenderFontSizePx(
  clip: Pick<Clip, 'fontSize' | 'textScaleBaseFontSize' | 'textScalePct'>,
  canvasHeight: number
): number {
  const base = getTextScaleBaseFontSize(clip, canvasHeight);
  const pct = getTextScalePct(clip, canvasHeight);
  const basePx = nominalFontSizeToCanvasPx(base, canvasHeight);
  return clampTextRenderedFontSize(Math.round((basePx * pct) / 100));
}

export function applyTextScalePctChange(valuePct: number): Pick<Clip, 'textScalePct'> {
  return { textScalePct: clampTextScalePct(valuePct) };
}

/** Bornes px pour le resize coin, relatives à la base nominale du clip. */
export function fontSizeBoundsForTextScale(
  baseNominal: number,
  canvasHeight: number
): { min: number; max: number } {
  const basePx = nominalFontSizeToCanvasPx(baseNominal, canvasHeight);
  return {
    min: clampTextRenderedFontSize(
      Math.round((basePx * STUDIO_TEXT_SCALE_MIN_PCT) / 100)
    ),
    max: clampTextRenderedFontSize(
      Math.round((basePx * STUDIO_TEXT_SCALE_MAX_PCT) / 100)
    ),
  };
}

export function scalePctFromCornerResizeDrag(
  clip: Pick<Clip, 'textScalePct' | 'textScaleBaseFontSize' | 'fontSize'>,
  drag: { startFontSizePx: number; fontSizePx: number },
  canvasHeight: number
): number {
  if (drag.startFontSizePx <= 0) {
    return getTextScalePct(clip, canvasHeight);
  }
  const currentPct = getTextScalePct(clip, canvasHeight);
  const ratio = drag.fontSizePx / drag.startFontSizePx;
  return clampTextScalePct(Math.round(currentPct * ratio));
}

export function isCornerTextResizeDir(
  dir: string
): dir is 'tl' | 'tr' | 'bl' | 'br' {
  return dir === 'tl' || dir === 'tr' || dir === 'bl' || dir === 'br';
}

/** Panneau style : met à jour la taille nominale, conserve l’échelle %. */
export function applyTextPanelFontSizeChange(
  clip: Pick<Clip, 'fontSize' | 'textScaleBaseFontSize' | 'textScalePct'>,
  nextBaseFontSize: number
): Pick<Clip, 'textScaleBaseFontSize'> {
  void clip;
  return { textScaleBaseFontSize: clampTextBaseFontSize(nextBaseFontSize) };
}

export const TEXT_ZONE_PADDING_X = 12;
export const TEXT_ZONE_PADDING_Y = 8;

export function clipToTextZoneModel(clip: Clip, canvasWidth: number, canvasHeight: number): TextZoneModel {
  const measured = measureKonvaEditorTextFrame(clip, canvasWidth, canvasHeight);
  const widthPx = measured.widthPx;
  const heightPx = clip.textFrameHeightPx ?? measured.heightPx;
  const centerX = ((clip.x ?? 50) / 100) * canvasWidth;
  const centerY = ((clip.y ?? 50) / 100) * canvasHeight;
  return {
    leftPx: centerX - widthPx / 2,
    topPx: centerY - heightPx / 2,
    widthPx,
    heightPx,
    fontSize: resolveClipRenderFontSizePx(clip, canvasHeight),
    content: clip.content ?? '',
    rotationDeg: clip.textRotation ?? 0,
  };
}

export function textZoneModelToClipPatch(
  model: TextZoneModel,
  clip: Clip,
  canvasWidth: number,
  canvasHeight: number,
  options?: { textScalePct?: number }
): Partial<Clip> {
  const centerX = model.leftPx + model.widthPx / 2;
  const centerY = model.topPx + model.heightPx / 2;
  const patch: Partial<Clip> = {
    x: pxToPct(centerX, canvasWidth),
    y: pxToPct(centerY, canvasHeight),
    boxWidthPct: pxToPct(model.widthPx, canvasWidth),
    textFrameHeightPx: model.heightPx,
    content: model.content,
    textAnchorCorner: undefined,
    textAnchorXPx: undefined,
    textAnchorYPx: undefined,
    textRotation: model.rotationDeg,
  };
  if (options?.textScalePct != null) {
    patch.textScalePct = clampTextScalePct(options.textScalePct);
  }
  return patch;
}

/** Évite updateClip si le patch n’apporte rien (anti-boucle React). */
export function textZoneClipPatchChanged(clip: Clip, patch: Partial<Clip>): boolean {
  for (const key of Object.keys(patch) as (keyof Clip)[]) {
    const next = patch[key];
    const prev = clip[key];
    if (next === undefined) continue;
    if (typeof next === 'number' && typeof prev === 'number') {
      const tol =
        key === 'fontSize' || key === 'textFrameHeightPx' || key === 'textScalePct' ? 1 : 0.05;
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
