import type { Clip, TextPosition } from '@/types/composition';

/** Centre géométrique du cadre vidéo (repère fixe dans l’aperçu). */
export const CANVAS_CENTER = { x: 50, y: 50 } as const;

export function positionToY(position?: string): number {
  if (position === 'top') return 10;
  if (position === 'center') return CANVAS_CENTER.y;
  return 80;
}

export const TEXT_POSITION_COORDS: Record<TextPosition, { x: number; y: number }> = {
  top: { x: 50, y: 10 },
  center: { x: CANVAS_CENTER.x, y: CANVAS_CENTER.y },
  bottom: { x: 50, y: 80 },
};

/** Déduit top / center / bottom depuis y (pour les boutons du panneau). */
export function inferTextPosition(clip: Pick<Clip, 'y' | 'position'>): TextPosition {
  const y = clip.y ?? positionToY(clip.position);
  if (y < 28) return 'top';
  if (y > 62) return 'bottom';
  return 'center';
}

const SNAP_THRESHOLD_PCT = 3.5;

export function isNearCanvasCenter(x: number, y: number): boolean {
  return (
    Math.abs(x - CANVAS_CENTER.x) <= SNAP_THRESHOLD_PCT &&
    Math.abs(y - CANVAS_CENTER.y) <= SNAP_THRESHOLD_PCT
  );
}

/** Accrochage doux au centre quand le curseur passe à proximité. */
export function snapToCanvasCenter(x: number, y: number): { x: number; y: number; snapped: boolean } {
  if (!isNearCanvasCenter(x, y)) return { x, y, snapped: false };
  return { x: CANVAS_CENTER.x, y: CANVAS_CENTER.y, snapped: true };
}
