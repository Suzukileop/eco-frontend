import type { Clip } from '@/types/composition';

export interface PreviewCanvasSize {
  width: number;
  height: number;
}

export function getFrameBoxSize(
  canvasW: number,
  canvasH: number,
  boxWidthPct: number,
  aspectW: number,
  aspectH: number
): { boxW: number; boxH: number } {
  const boxW = (canvasW * boxWidthPct) / 100;
  const boxH = boxW * (aspectH / aspectW);
  return { boxW: Math.max(1, boxW), boxH: Math.max(1, boxH) };
}

/** Position CapCut : pixels depuis le centre du cadre format. */
export function clipToPositionPx(
  clip: Clip,
  canvas: PreviewCanvasSize,
  aspectW: number,
  aspectH: number
): { x: number; y: number } {
  if (canvas.width <= 0 || canvas.height <= 0) {
    return { x: 0, y: 0 };
  }
  const { boxW, boxH } = getFrameBoxSize(
    canvas.width,
    canvas.height,
    clip.boxWidthPct ?? 100,
    aspectW,
    aspectH
  );
  const framePxX = (((clip.x ?? 50) - 50) / 100) * canvas.width;
  const framePxY = (((clip.y ?? 50) - 50) / 100) * canvas.height;
  const mediaPxX = ((clip.mediaOffsetX ?? 0) / 100) * boxW;
  const mediaPxY = ((clip.mediaOffsetY ?? 0) / 100) * boxH;
  return {
    x: Math.round(framePxX + mediaPxX),
    y: Math.round(framePxY + mediaPxY),
  };
}

export function applyPositionPx(
  axis: 'x' | 'y',
  valuePx: number,
  clip: Clip,
  canvas: PreviewCanvasSize,
  aspectW: number,
  aspectH: number
): Pick<Clip, 'mediaOffsetX' | 'mediaOffsetY'> {
  const { boxW, boxH } = getFrameBoxSize(
    canvas.width,
    canvas.height,
    clip.boxWidthPct ?? 100,
    aspectW,
    aspectH
  );
  if (axis === 'x') {
    const framePxX = (((clip.x ?? 50) - 50) / 100) * canvas.width;
    const mediaPxX = valuePx - framePxX;
    return { mediaOffsetX: (mediaPxX / boxW) * 100 };
  }
  const framePxY = (((clip.y ?? 50) - 50) / 100) * canvas.height;
  const mediaPxY = valuePx - framePxY;
  return { mediaOffsetY: (mediaPxY / boxH) * 100 };
}

/** Échelle affichée = zoom média × largeur du cadre (%). */
export function clipToEffectiveScalePct(clip: Clip): number {
  const scale = clip.mediaScale ?? 1;
  const box = clip.boxWidthPct ?? 100;
  return Math.max(1, Math.min(500, Math.round(scale * box)));
}

export function applyEffectiveScalePct(valuePct: number, clip: Clip): Pick<Clip, 'mediaScale'> {
  const box = Math.max(1, clip.boxWidthPct ?? 100);
  const mediaScale = Math.max(0.15, Math.min(5, valuePct / box));
  return { mediaScale: Math.round(mediaScale * 1000) / 1000 };
}
