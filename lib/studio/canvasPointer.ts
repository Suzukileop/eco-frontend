/** Convertit une position souris écran en coordonnées canvas studio (px logiques). */
export function clientToStudioCanvasPx(
  clientX: number,
  clientY: number,
  pointerScale: number
): { x: number; y: number } | null {
  if (typeof document === 'undefined') return null;
  const surface = document.querySelector('[data-studio-surface]');
  if (!surface) return null;
  const rect = surface.getBoundingClientRect();
  const mul = pointerScale > 0 ? pointerScale : 1;
  return {
    x: (clientX - rect.left) / mul,
    y: (clientY - rect.top) / mul,
  };
}

export type CornerResizeEdge = 'nw' | 'ne' | 'sw' | 'se';

/** Coin opposé immobile pendant un drag sur le coin symétrique. */
export const DRAGGED_TO_FIXED_CORNER: Record<CornerResizeEdge, CornerResizeEdge> = {
  ne: 'sw',
  sw: 'ne',
  se: 'nw',
  nw: 'se',
};

export function fixedCornerPoint(
  corner: CornerResizeEdge,
  bounds: { left: number; top: number; right: number; bottom: number }
): { x: number; y: number } {
  switch (corner) {
    case 'sw':
      return { x: bounds.left, y: bounds.bottom };
    case 'ne':
      return { x: bounds.right, y: bounds.top };
    case 'nw':
      return { x: bounds.left, y: bounds.top };
    case 'se':
      return { x: bounds.right, y: bounds.bottom };
  }
}

/** Centre du cadre pour que le coin `fixed` reste à (anchorX, anchorY) en px canvas. */
export function centerFromFixedCorner(
  fixed: CornerResizeEdge,
  anchorX: number,
  anchorY: number,
  widthPx: number,
  heightPx: number
): { centerX: number; centerY: number } {
  switch (fixed) {
    case 'sw':
      return { centerX: anchorX + widthPx / 2, centerY: anchorY - heightPx / 2 };
    case 'ne':
      return { centerX: anchorX - widthPx / 2, centerY: anchorY + heightPx / 2 };
    case 'nw':
      return { centerX: anchorX + widthPx / 2, centerY: anchorY + heightPx / 2 };
    case 'se':
      return { centerX: anchorX - widthPx / 2, centerY: anchorY - heightPx / 2 };
  }
}

export interface AnchoredCornerFrame {
  widthPx: number;
  heightPx: number;
  centerXPx: number;
  centerYPx: number;
}

/**
 * Cadre rectangle depuis le coin opposé ancré (px canvas) jusqu'à la souris.
 * Le coin diagonal opposé ne bouge jamais.
 */
export function computeAnchoredCornerFrame(
  edge: CornerResizeEdge,
  anchor: { left: number; top: number; right: number; bottom: number },
  mouseX: number,
  mouseY: number,
  minWidthPx: number,
  minHeightPx: number
): AnchoredCornerFrame {
  const minW = Math.max(8, minWidthPx);
  const minH = Math.max(8, minHeightPx);

  let left: number;
  let top: number;
  let right: number;
  let bottom: number;

  switch (edge) {
    case 'ne':
      left = anchor.left;
      bottom = anchor.bottom;
      right = Math.max(left + minW, mouseX);
      top = Math.min(bottom - minH, mouseY);
      break;
    case 'sw':
      right = anchor.right;
      top = anchor.top;
      left = Math.min(right - minW, mouseX);
      bottom = Math.max(top + minH, mouseY);
      break;
    case 'se':
      left = anchor.left;
      top = anchor.top;
      right = Math.max(left + minW, mouseX);
      bottom = Math.max(top + minH, mouseY);
      break;
    case 'nw':
      right = anchor.right;
      bottom = anchor.bottom;
      left = Math.min(right - minW, mouseX);
      top = Math.min(bottom - minH, mouseY);
      break;
  }

  const widthPx = Math.max(minW, right - left);
  const heightPx = Math.max(minH, bottom - top);

  return {
    widthPx,
    heightPx,
    centerXPx: left + widthPx / 2,
    centerYPx: top + heightPx / 2,
  };
}

export interface ProportionalCornerFrame {
  widthPx: number;
  heightPx: number;
  scale: number;
}

/**
 * Resize coin : largeur et hauteur toujours synchronisées (même facteur d'échelle).
 * Un mouvement sur X seul entraîne aussi un changement sur Y (et inversement).
 */
export function computeProportionalCornerFrame(
  edge: CornerResizeEdge,
  anchor: { left: number; top: number; right: number; bottom: number },
  mouseX: number,
  mouseY: number,
  startWidthPx: number,
  startHeightPx: number,
  minWidthPx: number,
  minHeightPx: number
): ProportionalCornerFrame {
  const raw = computeAnchoredCornerFrame(
    edge,
    anchor,
    mouseX,
    mouseY,
    minWidthPx,
    minHeightPx
  );

  const scaleX = startWidthPx > 0 ? raw.widthPx / startWidthPx : 1;
  const scaleY = startHeightPx > 0 ? raw.heightPx / startHeightPx : 1;

  const scale =
    scaleX >= 1 || scaleY >= 1 ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

  const widthPx = Math.max(minWidthPx, startWidthPx * scale);
  const heightPx = Math.max(minHeightPx, startHeightPx * scale);

  return { widthPx, heightPx, scale };
}
