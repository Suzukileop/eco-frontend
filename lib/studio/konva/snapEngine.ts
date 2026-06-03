import type { ClipLayoutPx } from '@/lib/studio/konva/clipLayout';

export interface SnapGuides {
  vertical: number[];
  horizontal: number[];
}

export interface SnapResult {
  x: number;
  y: number;
  guides: SnapGuides;
  snapped: boolean;
}

const SNAP_PX = 8;

function uniqueSorted(values: number[]): number[] {
  return Array.from(new Set(values.map((v) => Math.round(v)))).sort((a, b) => a - b);
}

function snapAxis(
  value: number,
  targets: number[],
  threshold: number
): { value: number; hit: number | null } {
  let best = value;
  let bestDist = threshold + 1;
  let hit: number | null = null;
  for (const t of targets) {
    const d = Math.abs(value - t);
    if (d <= threshold && d < bestDist) {
      best = t;
      bestDist = d;
      hit = t;
    }
  }
  return { value: best, hit };
}

export function snapClipCenter(
  centerX: number,
  centerY: number,
  moving: ClipLayoutPx,
  others: ClipLayoutPx[],
  stageW: number,
  stageH: number,
  enabled: boolean
): SnapResult {
  if (!enabled) {
    return { x: centerX, y: centerY, guides: { vertical: [], horizontal: [] }, snapped: false };
  }

  const verticalTargets: number[] = [stageW / 2, 0, stageW];
  const horizontalTargets: number[] = [stageH / 2, 0, stageH];

  for (const o of others) {
    if (o.clipId === moving.clipId) continue;
    verticalTargets.push(o.centerX, o.left, o.right);
    horizontalTargets.push(o.centerY, o.top, o.bottom);
  }

  const halfW = moving.width / 2;
  const halfH = moving.height / 2;

  const sx = snapAxis(centerX, verticalTargets, SNAP_PX);
  const sy = snapAxis(centerY, horizontalTargets, SNAP_PX);

  const edgeLeft = snapAxis(centerX - halfW, verticalTargets, SNAP_PX);
  const edgeRight = snapAxis(centerX + halfW, verticalTargets, SNAP_PX);
  const edgeTop = snapAxis(centerY - halfH, horizontalTargets, SNAP_PX);
  const edgeBottom = snapAxis(centerY + halfH, horizontalTargets, SNAP_PX);

  let nextX = sx.value;
  let nextY = sy.value;

  if (edgeLeft.hit != null) nextX = edgeLeft.hit + halfW;
  if (edgeRight.hit != null) nextX = edgeRight.hit - halfW;
  if (edgeTop.hit != null) nextY = edgeTop.hit + halfH;
  if (edgeBottom.hit != null) nextY = edgeBottom.hit - halfH;

  const vGuides: number[] = [];
  const hGuides: number[] = [];
  if (sx.hit != null) vGuides.push(sx.hit);
  if (sy.hit != null) hGuides.push(sy.hit);
  if (edgeLeft.hit != null) vGuides.push(edgeLeft.hit);
  if (edgeRight.hit != null) vGuides.push(edgeRight.hit);
  if (edgeTop.hit != null) hGuides.push(edgeTop.hit);
  if (edgeBottom.hit != null) hGuides.push(edgeBottom.hit);

  const snapped =
    nextX !== centerX ||
    nextY !== centerY ||
    sx.hit != null ||
    sy.hit != null ||
    edgeLeft.hit != null ||
    edgeRight.hit != null ||
    edgeTop.hit != null ||
    edgeBottom.hit != null;

  return {
    x: nextX,
    y: nextY,
    guides: {
      vertical: uniqueSorted(vGuides),
      horizontal: uniqueSorted(hGuides),
    },
    snapped,
  };
}
