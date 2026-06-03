import type { Composition } from '@/types/composition';
import type { ClipLayoutPx } from '@/lib/studio/konva/clipLayout';
import { getClipLayout } from '@/lib/studio/konva/clipLayout';
import { snapClipCenter, type SnapGuides } from '@/lib/studio/konva/snapEngine';

function isClipActive(clip: { startTime: number; endTime: number }, t: number): boolean {
  return clip.startTime <= t && clip.endTime > t;
}

export function collectActiveClipLayouts(
  composition: Composition,
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number
): ClipLayoutPx[] {
  const all = [
    ...composition.tracks.background,
    ...composition.tracks.text,
    ...composition.tracks.overlay,
  ].filter((c) => isClipActive(c, currentTime));
  return all.map((c) => getClipLayout(c, canvasWidth, canvasHeight));
}

export interface TextZoneMoveSnapContext {
  clipId: string;
  widthPx: number;
  heightPx: number;
  otherLayouts: ClipLayoutPx[];
  canvasWidth: number;
  canvasHeight: number;
  snapEnabled: boolean;
}

export function resolveSnappedMovePosition(
  leftPx: number,
  topPx: number,
  ctx: TextZoneMoveSnapContext
): { leftPx: number; topPx: number; guides: SnapGuides } {
  const moving: ClipLayoutPx = {
    clipId: ctx.clipId,
    centerX: leftPx + ctx.widthPx / 2,
    centerY: topPx + ctx.heightPx / 2,
    width: ctx.widthPx,
    height: ctx.heightPx,
    left: leftPx,
    top: topPx,
    right: leftPx + ctx.widthPx,
    bottom: topPx + ctx.heightPx,
    isText: true,
  };
  const others = ctx.otherLayouts.filter((l) => l.clipId !== ctx.clipId);
  const result = snapClipCenter(
    moving.centerX,
    moving.centerY,
    moving,
    others,
    ctx.canvasWidth,
    ctx.canvasHeight,
    ctx.snapEnabled
  );
  return {
    leftPx: result.x - ctx.widthPx / 2,
    topPx: result.y - ctx.heightPx / 2,
    guides: result.guides,
  };
}
