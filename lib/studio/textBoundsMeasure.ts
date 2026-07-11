import type { Clip } from '@/types/composition';
import { buildClassicTextContentStyle } from '@/lib/studio/textContentStyle';
import { resolveClipRenderFontSizePx } from '@/lib/studio/textZone/textZoneGeometry';
import { centerFromFixedCorner } from '@/lib/studio/canvasPointer';
import { positionToY } from '@/lib/textPosition';

export interface TextFramePx {
  widthPx: number;
  heightPx: number;
  widthPct: number;
  centerX: number;
  centerY: number;
  userExpandedFrame: boolean;
}

const LEGACY_WIDE_BOX_PCT = 72;
const MANUAL_FRAME_TOLERANCE_PX = 3;

function naturalTextWidthPct(clip: Clip, canvasWidth: number): number {
  const natural = measureTextElementNatural(clip);
  if (canvasWidth <= 0) return clip.boxWidthPct ?? 85;
  return Math.min(96, Math.max(8, Math.round(((natural.width / canvasWidth) * 100) * 10) / 10));
}

function hasManualTextFrame(clip: Clip, canvasWidth: number): boolean {
  const storedPct = clip.boxWidthPct ?? 85;
  if (storedPct >= LEGACY_WIDE_BOX_PCT) return false;
  const storedPx = (canvasWidth * storedPct) / 100;
  const naturalPx = measureTextElementNatural(clip).width;
  return Math.abs(storedPx - naturalPx) > MANUAL_FRAME_TOLERANCE_PX;
}

function applyCssToElement(el: HTMLElement, style: Record<string, string | number | undefined>) {
  for (const [key, value] of Object.entries(style)) {
    if (value === undefined) continue;
    const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    el.style.setProperty(cssKey, String(value));
  }
}

/**
 * Mesure serrée : largeur = ligne la plus longue (getClientRects), hauteur = bloc de lignes.
 * Évite le faux « padding » quand le texte revient à la ligne dans une colonne large.
 */
/** Mesure sans césure auto : uniquement les retours ligne explicites (\\n). */
export function measureTextElementNatural(
  clip: Clip,
  canvasHeight?: number
): { width: number; height: number } {
  return measureTextElementTight(clip, undefined, { allowWordWrap: false, canvasHeight });
}

export function measureTextElementTight(
  clip: Clip,
  maxWrapPx?: number,
  options?: { allowWordWrap?: boolean; canvasHeight?: number }
): { width: number; height: number } {
  const allowWordWrap = options?.allowWordWrap !== false;
  const canvasHeight = options?.canvasHeight;
  if (typeof document === 'undefined') {
    const fs =
      canvasHeight != null && canvasHeight > 0
        ? resolveClipRenderFontSizePx(clip, canvasHeight)
        : clip.fontSize ?? 24;
    const lh = clip.lineHeight ?? 1.1;
    return { width: 120, height: Math.ceil(fs * lh * 2) };
  }

  const el = document.createElement('div');
  const base = buildClassicTextContentStyle(clip, canvasHeight);
  const raw = clip.content ?? '';
  const content = raw.length > 0 ? raw : '\u00A0';

  applyCssToElement(el, {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    left: '-99999px',
    top: '0',
    display: 'block',
    width: maxWrapPx != null ? `${maxWrapPx}px` : 'max-content',
    maxWidth: maxWrapPx != null ? `${maxWrapPx}px` : 'none',
    height: 'auto',
    margin: '0',
    padding: (base.padding as string | undefined) ?? '0',
    fontFamily: base.fontFamily as string,
    fontSize: base.fontSize as number,
    fontWeight: base.fontWeight as string,
    fontStyle: base.fontStyle as string,
    textDecoration: base.textDecoration as string,
    letterSpacing: base.letterSpacing as string,
    lineHeight: base.lineHeight as number,
    textAlign: clip.textAlign ?? 'center',
    whiteSpace: allowWordWrap ? 'pre-wrap' : 'pre',
    wordBreak: allowWordWrap ? 'break-word' : 'normal',
    overflowWrap: allowWordWrap ? 'break-word' : 'normal',
    boxSizing: 'content-box',
    textTransform: base.textTransform as string,
    backgroundColor: (base.backgroundColor as string | undefined) ?? 'transparent',
    border: 'none',
  });

  el.textContent = content;
  document.body.appendChild(el);

  const height = Math.max(1, Math.ceil(el.scrollHeight));

  if (maxWrapPx != null) {
    document.body.removeChild(el);
    return { width: Math.round(maxWrapPx), height };
  }

  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = Array.from(range.getClientRects());

  let width: number;
  if (rects.length > 0) {
    let left = Infinity;
    let right = -Infinity;
    for (const r of rects) {
      if (r.width < 0.5) continue;
      left = Math.min(left, r.left);
      right = Math.max(right, r.right);
    }
    width = Math.max(1, Math.ceil(right - left));
  } else {
    width = Math.max(1, Math.ceil(el.scrollWidth));
  }

  document.body.removeChild(el);
  return { width, height };
}

/** Cadre toujours dérivé du contenu à la largeur courante (jamais de hauteur pré-calculée stockée). */
export function measureTextContentFrame(
  clip: Clip,
  canvasWidth: number,
  canvasHeight?: number,
  fontSizeOverride?: number
): { widthPx: number; heightPx: number } {
  const minPx = 24;
  const canvasCapPx = Math.max(minPx, Math.floor(canvasWidth * 0.96));
  const measuredClip =
    fontSizeOverride != null ? { ...clip, fontSize: fontSizeOverride } : clip;
  const natural = measureTextElementNatural(measuredClip, canvasHeight);

  const storedPct = measuredClip.boxWidthPct ?? 85;
  const storedPx = (canvasWidth * storedPct) / 100;
  const isLegacyWide = storedPct >= LEGACY_WIDE_BOX_PCT;

  const widthPx = isLegacyWide
    ? Math.max(minPx, natural.width)
    : Math.round(Math.max(minPx, Math.min(canvasCapPx, storedPx)));

  const needsWordWrap = widthPx < natural.width - MANUAL_FRAME_TOLERANCE_PX;
  const heightPx = Math.max(
    minPx,
    needsWordWrap
      ? measureTextElementTight(measuredClip, widthPx, {
          allowWordWrap: true,
          canvasHeight,
        }).height
      : natural.height
  );

  return { widthPx, heightPx };
}

export function resolveTextFramePx(
  clip: Clip,
  canvasWidth: number,
  canvasHeight: number
): TextFramePx {
  const { widthPx, heightPx } = measureTextContentFrame(clip, canvasWidth, canvasHeight);
  const natural = measureTextElementNatural(clip, canvasHeight);
  const storedPct = clip.boxWidthPct ?? 85;
  const isLegacyWide = storedPct >= LEGACY_WIDE_BOX_PCT;

  const userExpandedFrame =
    !isLegacyWide && widthPx > natural.width + MANUAL_FRAME_TOLERANCE_PX;
  const hasManualFrame =
    !isLegacyWide && Math.abs(widthPx - natural.width) > MANUAL_FRAME_TOLERANCE_PX;

  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? positionToY(clip.position);

  return {
    widthPx,
    heightPx,
    widthPct: canvasWidth > 0 ? (widthPx / canvasWidth) * 100 : storedPct,
    centerX: (canvasWidth * xPct) / 100,
    centerY: (canvasHeight * yPct) / 100,
    userExpandedFrame: userExpandedFrame || hasManualFrame,
  };
}

export function patchTightTextClipBox(
  clip: Clip,
  canvasWidth: number,
  _canvasHeight: number
): Partial<Clip> | null {
  void _canvasHeight;
  if (clip.trackType !== 'text' && clip.type !== 'text') return null;
  const storedPct = clip.boxWidthPct ?? 85;

  if (storedPct >= LEGACY_WIDE_BOX_PCT) {
    const nextPct = naturalTextWidthPct(clip, canvasWidth);
    if (Math.abs(nextPct - storedPct) < 0.5) return null;
    return { boxWidthPct: nextPct };
  }

  if (hasManualTextFrame(clip, canvasWidth)) return null;

  const nextPct = naturalTextWidthPct(clip, canvasWidth);
  if (Math.abs(nextPct - storedPct) < 0.5) return null;
  return { boxWidthPct: nextPct };
}

export function patchLegacyTextClipBox(
  clip: Clip,
  canvasWidth: number,
  canvasHeight: number
): Partial<Clip> | null {
  return patchTightTextClipBox(clip, canvasWidth, canvasHeight);
}

/** Supprime les dimensions figées obsolètes ; le cadre vit dans measureTextContentFrame. */
export function patchClearStaleTextFrameStorage(clip: Clip): Partial<Clip> | null {
  if (clip.trackType !== 'text' && clip.type !== 'text') return null;
  if (clip.textFrameHeightPx == null) return null;
  return { textFrameHeightPx: undefined };
}

/** Recalcule x/y depuis l’ancre coin (dimensions cadre explicites ou mesure contenu). */
export function patchTextPositionFromAnchor(
  clip: Clip,
  canvasWidth: number,
  canvasHeight: number,
  frameSize?: { widthPx: number; heightPx: number }
): Partial<Clip> | null {
  if (clip.trackType !== 'text' && clip.type !== 'text') return null;
  if (
    !clip.textAnchorCorner ||
    clip.textAnchorXPx == null ||
    clip.textAnchorYPx == null ||
    canvasWidth <= 0 ||
    canvasHeight <= 0
  ) {
    return null;
  }

  const measured = measureTextContentFrame(clip, canvasWidth, canvasHeight);
  const widthPx = frameSize?.widthPx ?? measured.widthPx;
  const heightPx = frameSize?.heightPx ?? measured.heightPx;
  const { centerX, centerY } = centerFromFixedCorner(
    clip.textAnchorCorner,
    clip.textAnchorXPx,
    clip.textAnchorYPx,
    widthPx,
    heightPx
  );

  const x = (centerX / canvasWidth) * 100;
  const y = (centerY / canvasHeight) * 100;
  if (
    Math.abs((clip.x ?? 50) - x) < 0.05 &&
    Math.abs((clip.y ?? positionToY(clip.position)) - y) < 0.05
  ) {
    return null;
  }

  return { x, y };
}
