import type { ClipLayoutPx } from '@/lib/studio/konva/clipLayout';

export type AlignH = 'left' | 'center' | 'right';
export type AlignV = 'top' | 'middle' | 'bottom';
export type DistributeAxis = 'horizontal' | 'vertical';

export interface LayoutPositionPatch {
  clipId: string;
  centerX: number;
  centerY: number;
}

function bbox(layouts: ClipLayoutPx[]) {
  const left = Math.min(...layouts.map((l) => l.left));
  const right = Math.max(...layouts.map((l) => l.right));
  const top = Math.min(...layouts.map((l) => l.top));
  const bottom = Math.max(...layouts.map((l) => l.bottom));
  return { left, right, top, bottom, centerX: (left + right) / 2, centerY: (top + bottom) / 2 };
}

export function alignLayouts(
  layouts: ClipLayoutPx[],
  horizontal?: AlignH,
  vertical?: AlignV
): LayoutPositionPatch[] {
  if (layouts.length < 2) return [];
  const box = bbox(layouts);

  return layouts.map((l) => {
    let centerX = l.centerX;
    let centerY = l.centerY;

    if (horizontal === 'left') centerX = box.left + l.width / 2;
    if (horizontal === 'center') centerX = box.centerX;
    if (horizontal === 'right') centerX = box.right - l.width / 2;

    if (vertical === 'top') centerY = box.top + l.height / 2;
    if (vertical === 'middle') centerY = box.centerY;
    if (vertical === 'bottom') centerY = box.bottom - l.height / 2;

    return { clipId: l.clipId, centerX, centerY };
  });
}

export function distributeLayouts(
  layouts: ClipLayoutPx[],
  axis: DistributeAxis
): LayoutPositionPatch[] {
  if (layouts.length < 3) return [];

  const sorted = [...layouts].sort((a, b) =>
    axis === 'horizontal' ? a.centerX - b.centerX : a.centerY - b.centerY
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const span =
    axis === 'horizontal'
      ? last.centerX - first.centerX
      : last.centerY - first.centerY;

  const step = span / (sorted.length - 1);

  return sorted.map((l, i) => {
    if (i === 0 || i === sorted.length - 1) {
      return { clipId: l.clipId, centerX: l.centerX, centerY: l.centerY };
    }
    if (axis === 'horizontal') {
      return { clipId: l.clipId, centerX: first.centerX + step * i, centerY: l.centerY };
    }
    return { clipId: l.clipId, centerX: l.centerX, centerY: first.centerY + step * i };
  });
}
