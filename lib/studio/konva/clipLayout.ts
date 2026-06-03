import type { Clip } from '@/types/composition';
import { measureKonvaEditorTextFrame } from '@/lib/studio/konva/textFrameMeasure';
import { mediaFrameHeightPx } from '@/lib/studio/mediaDimensions';

export interface ClipLayoutPx {
  clipId: string;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  isText: boolean;
}

/** Position / taille en cours de drag ou transform (avant commit store). */
export interface KonvaLiveClipLayout {
  centerX: number;
  centerY: number;
  width?: number;
  height?: number;
  rotation?: number;
  fontSize?: number;
}

export function applyLiveClipLayout(
  base: ClipLayoutPx,
  live?: KonvaLiveClipLayout | null
): ClipLayoutPx {
  if (!live) return base;
  const width = live.width ?? base.width;
  const height = live.height ?? base.height;
  const centerX = live.centerX;
  const centerY = live.centerY;
  return {
    ...base,
    centerX,
    centerY,
    width,
    height,
    left: centerX - width / 2,
    top: centerY - height / 2,
    right: centerX + width / 2,
    bottom: centerY + height / 2,
  };
}

export function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}

export function pctToPx(pct: number, axis: number): number {
  return (pct / 100) * axis;
}

export function pxToPct(px: number, axis: number): number {
  if (axis <= 0) return 50;
  return clampPct((px / axis) * 100);
}

/** Hauteur texte (Konva measure côté client, fallback simple en SSR). */
export function estimateTextBoxHeight(clip: Clip, widthPx: number, canvasWidth: number): number {
  void widthPx;
  return measureKonvaEditorTextFrame(clip, canvasWidth).heightPx;
}

export function getClipLayout(clip: Clip, stageW: number, stageH: number): ClipLayoutPx {
  const isText = clip.trackType === 'text' || clip.type === 'text';
  const width = Math.max(
    24,
    pctToPx(clip.boxWidthPct ?? (isText ? 42 : 100), stageW)
  );
  const height = isText
    ? measureKonvaEditorTextFrame(clip, stageW).heightPx
    : mediaFrameHeightPx(width, clip);
  const centerX = pctToPx(clip.x ?? 50, stageW);
  const centerY = pctToPx(clip.y ?? 50, stageH);

  return {
    clipId: clip.id,
    centerX,
    centerY,
    width,
    height,
    left: centerX - width / 2,
    top: centerY - height / 2,
    right: centerX + width / 2,
    bottom: centerY + height / 2,
    isText,
  };
}

export function layoutToClipPatch(
  layout: ClipLayoutPx,
  stageW: number,
  stageH: number,
  extra?: Partial<Clip>
): Partial<Clip> {
  return {
    x: pxToPct(layout.centerX, stageW),
    y: pxToPct(layout.centerY, stageH),
    boxWidthPct: pxToPct(layout.width, stageW),
    ...extra,
  };
}
