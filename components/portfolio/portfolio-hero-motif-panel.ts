import type { CSSProperties } from 'react';

export type MotifPanelPosition = { x: number; y: number };

export type MotifPanelSize = { width: number; height: number };

export type MotifPanelTransform = {
  position: MotifPanelPosition;
  size: MotifPanelSize;
};

export const DEFAULT_RIGHT_MOTIF_POSITION: MotifPanelPosition = { x: 75, y: 50 };

/**
 * Wide enough that center at 75% places the right edge flush with the content frame
 * (start of the right side margin / content-width bound).
 */
export const DEFAULT_RIGHT_MOTIF_SIZE: MotifPanelSize = { width: 50, height: 76 };

export const DEFAULT_RIGHT_MOTIF_TRANSFORM: MotifPanelTransform = {
  position: { ...DEFAULT_RIGHT_MOTIF_POSITION },
  size: { ...DEFAULT_RIGHT_MOTIF_SIZE },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampMotifPanelPosition(
  position: MotifPanelPosition,
  side: 'left' | 'right',
  size?: MotifPanelSize
): MotifPanelPosition {
  const halfW = (size?.width ?? 30) / 2;
  const halfH = (size?.height ?? 30) / 2;
  const minX = halfW;
  const maxX = 100 - halfW;
  const minY = halfH;
  const maxY = 100 - halfH;

  if (side === 'left') {
    return {
      x: clamp(position.x, minX, maxX),
      y: clamp(position.y, minY, maxY),
    };
  }
  return {
    x: clamp(position.x, minX, maxX),
    y: clamp(position.y, minY, maxY),
  };
}

export function clampMotifPanelSize(size: MotifPanelSize, side: 'left' | 'right'): MotifPanelSize {
  if (side === 'left') {
    return {
      width: clamp(size.width, 10, 100),
      height: clamp(size.height, 10, 100),
    };
  }
  return {
    width: clamp(size.width, 14, 100),
    height: clamp(size.height, 14, 100),
  };
}

export function sanitizeMotifPanelPosition(
  value: unknown,
  base: MotifPanelPosition,
  side: 'left' | 'right',
  size?: MotifPanelSize
): MotifPanelPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampMotifPanelPosition({ x, y }, side, size);
}

export function sanitizeMotifPanelSize(
  value: unknown,
  base: MotifPanelSize,
  side: 'left' | 'right'
): MotifPanelSize {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const width = typeof record.width === 'number' ? record.width : base.width;
  const height = typeof record.height === 'number' ? record.height : base.height;
  return clampMotifPanelSize({ width, height }, side);
}

export function motifPanelContainerStyle(
  position: MotifPanelPosition,
  size: MotifPanelSize,
  opacity = 1,
  /** Use `%` when the panel lives inside the editorial content inset; `vw` for full-bleed layers. */
  horizontalUnit: 'vw' | '%' = 'vw'
): CSSProperties {
  if (horizontalUnit === '%') {
    const halfW = size.width / 2;
    const minX = halfW;
    const maxX = 100 - halfW;
    const centerX = Math.min(Math.max(position.x, minX), maxX);
    // right: 0 when center is at maxX → flush with content-frame right edge (side-margin start).
    const rightOffset = Math.max(0, 100 - centerX - halfW);

    return {
      right: `${rightOffset}%`,
      left: 'auto',
      top: `${position.y}%`,
      width: `${size.width}%`,
      height: `${size.height}%`,
      transform: 'translateY(-50%)',
      ...(opacity >= 1 ? {} : { opacity, willChange: 'opacity' }),
    };
  }

  return {
    left: `${position.x}vw`,
    top: `${position.y}vh`,
    width: `${size.width}vw`,
    height: `${size.height}vh`,
    transform: 'translate(-50%, -50%)',
    ...(opacity >= 1 ? {} : { opacity, willChange: 'opacity' }),
  };
}

/** Map hero vw/vh to editor viewBox (0–100). */
export function heroToEditorPoint(position: MotifPanelPosition): MotifPanelPosition {
  return { x: position.x, y: position.y };
}

export function editorToHeroPoint(point: MotifPanelPosition, side: 'left' | 'right'): MotifPanelPosition {
  return clampMotifPanelPosition(point, side);
}

export function getMotifPanelDefaultsForLayout(
  layout: 'centered' | 'full'
): MotifPanelTransform {
  if (layout === 'full') {
    return {
      position: { x: 75, y: 50 },
      size: { width: 50, height: 96 },
    };
  }
  return {
    position: { ...DEFAULT_RIGHT_MOTIF_POSITION },
    size: { ...DEFAULT_RIGHT_MOTIF_SIZE },
  };
}

/**
 * Keep a motif inside the content frame. Soft-snap flush to the given edge when
 * already near that margin (copy Contact edge / visual portrait edge).
 */
export function normalizeMotifPositionForContentFrame(
  position: MotifPanelPosition,
  size: MotifPanelSize,
  edge: 'left' | 'right' = 'right'
): MotifPanelPosition {
  const halfW = size.width / 2;
  const minX = halfW;
  const maxX = 100 - halfW;
  const x = Math.min(Math.max(position.x, minX), maxX);

  if (edge === 'left') {
    const leftEdge = x - halfW;
    // Near the left margin → snap flush to content-frame left (side-margin start).
    if (leftEdge >= -0.5 && leftEdge < 12) {
      return { x: minX, y: position.y };
    }
    return { x, y: position.y };
  }

  const rightEdge = x + halfW;
  // Near the right margin → snap flush to content-frame right (Contact / copy edge).
  if (rightEdge > 88 && rightEdge <= 100.5) {
    return { x: maxX, y: position.y };
  }
  return { x, y: position.y };
}

/** @deprecated Prefer normalizeMotifPositionForContentFrame(..., 'right') */
export function normalizeRightMotifPositionForContentFrame(
  position: MotifPanelPosition,
  size: MotifPanelSize
): MotifPanelPosition {
  return normalizeMotifPositionForContentFrame(position, size, 'right');
}
