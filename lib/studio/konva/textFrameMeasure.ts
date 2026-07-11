import type { Clip } from '@/types/composition';
import { measureTextContentFrame } from '@/lib/studio/textBoundsMeasure';

const MIN_FRAME_PX = 24;
/** Marge pour ombres / contour qui dépassent la boîte de ligne. */
const EFFECT_PAD_PX = 4;

/**
 * Mesure du cadre texte alignée sur le rendu DOM (textarea / preview),
 * pas sur Konva.Text seul (évite cadre trop petit et texte masqué).
 */
export function measureKonvaEditorTextFrame(
  clip: Clip,
  canvasWidth: number,
  canvasHeight?: number,
  contentOverride?: string
): { widthPx: number; heightPx: number } {
  const measuredClip =
    contentOverride !== undefined ? { ...clip, content: contentOverride } : clip;
  const frame = measureTextContentFrame(measuredClip, canvasWidth, canvasHeight);
  return {
    widthPx: frame.widthPx,
    heightPx: Math.max(MIN_FRAME_PX, frame.heightPx + EFFECT_PAD_PX),
  };
}

/** Hauteur réelle d’un textarea (réinitialise height/minHeight pour permettre le rétrécissement). */
export function measureTextareaScrollHeight(
  el: HTMLTextAreaElement,
  widthPx?: number
): number {
  const prevHeight = el.style.height;
  const prevMinHeight = el.style.minHeight;
  const prevWidth = el.style.width;
  el.style.height = '0px';
  el.style.minHeight = '0px';
  if (widthPx != null) el.style.width = `${widthPx}px`;
  const h = Math.ceil(el.scrollHeight);
  el.style.height = prevHeight;
  el.style.minHeight = prevMinHeight;
  el.style.width = prevWidth;
  return Math.max(MIN_FRAME_PX, h);
}

export function resolveEditorTextFrameHeight(
  clip: Clip,
  canvasWidth: number,
  content: string,
  domEl?: HTMLTextAreaElement | null,
  widthPx?: number
): number {
  const fromCss = measureKonvaEditorTextFrame(clip, canvasWidth, undefined, content).heightPx;
  if (!domEl) return fromCss;
  const fromDom = measureTextareaScrollHeight(domEl, widthPx);
  // Pendant l’édition, le DOM fait foi (permet de rétrécir après suppression de \\n vides).
  return Math.max(MIN_FRAME_PX, fromDom);
}
