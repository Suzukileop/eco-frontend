import type { Format } from '@/types/composition';
import { getAspectRatio } from '@/lib/formatPresets';

/** Ratios réels des formats (largeur × hauteur du cadre export). */
export const PREVIEW_FORMAT_RATIOS: Record<
  Exclude<Format, 'custom'>,
  { w: number; h: number; label: string }
> = {
  '9:16': { w: 9, h: 16, label: '9:16 — vertical' },
  '16:9': { w: 16, h: 9, label: '16:9 — horizontal' },
  '1:1': { w: 1, h: 1, label: '1:1 — carré' },
  '4:5': { w: 4, h: 5, label: '4:5 — vertical court' },
};

/**
 * Repères affichés dans CapCut (unités UI, pas des pixels d’export).
 * Seul le ratio compte pour l’export ; ces valeurs sont indicatives.
 */
export const CAPCUT_REFERENCE_FRAME: Record<
  Exclude<Format, 'custom'>,
  { width: number; height: number }
> = {
  '9:16': { width: 7.5, height: 13.5 },
  '16:9': { width: 13.5, height: 7.5 },
  '1:1': { width: 10, height: 10 },
  '4:5': { width: 8, height: 10 },
};

export const PREVIEW_PLAYBACK_BAR_H = 44;
export const PREVIEW_DEFAULT_TIMELINE_H = 280;

/** Hauteur de référence lecture + timeline (zone non recouverte pour le calcul du fit). */
export const PREVIEW_REFERENCE_DOCK_H =
  PREVIEW_PLAYBACK_BAR_H + PREVIEW_DEFAULT_TIMELINE_H;

/**
 * Marge légère autour du cadre (scroll gère l’espace gris supplémentaire).
 */
export const PREVIEW_CANVAS_PADDING = 16;

/** Marge autour du cadre format pour manipuler hors du canvas (style CapCut). */
export const PREVIEW_MANIPULATION_MARGIN = 200;

/**
 * Calcule la taille d’affichage du cadre en conservant le ratio du format
 * (letterbox / pillarbox dans la zone disponible).
 */
export function computePreviewCanvasDimensions(
  containerWidth: number,
  containerHeight: number,
  format: Format,
  padding = PREVIEW_CANVAS_PADDING,
  customAspectW?: number,
  customAspectH?: number
): { width: number; height: number } {
  const spec = getAspectRatio(format, customAspectW, customAspectH);
  const availW = Math.max(0, containerWidth - padding * 2);
  const availH = Math.max(0, containerHeight - padding * 2);

  if (availW < 8 || availH < 8) {
    return { width: 0, height: 0 };
  }

  const ratioVal = spec.w / spec.h;

  if (availW / availH > ratioVal) {
    const height = availH;
    return { width: Math.round(height * ratioVal), height: Math.round(height) };
  }

  const width = availW;
  return { width: Math.round(width), height: Math.round(width / ratioVal) };
}

/**
 * Espace vide au-dessus / en dessous du cadre pour le scroll vertical (style CapCut).
 * Plus de marge en bas pour continuer à scroller sous le cadre.
 */
export function computePreviewScrollPadding(
  viewportHeight: number,
  canvasHeight: number,
  manipulationMargin = PREVIEW_MANIPULATION_MARGIN,
  paddingScale = 1
): { top: number; bottom: number } {
  if (viewportHeight <= 0 || canvasHeight <= 0) {
    const baseTop = 480 * paddingScale;
    const baseBottom = 560 * paddingScale;
    return { top: baseTop, bottom: baseBottom };
  }
  const extra = manipulationMargin + Math.round(viewportHeight * 0.35);
  const top = Math.max(
    420 * paddingScale,
    Math.round((viewportHeight * 0.72 + extra * 0.5) * paddingScale)
  );
  const bottom = Math.max(
    520 * paddingScale,
    Math.round((viewportHeight * 0.85 + extra * 0.65) * paddingScale)
  );
  return { top, bottom };
}
