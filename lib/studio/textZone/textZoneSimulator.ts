/**
 * Logique pointer calquée à l’identique sur text-zone-simulator.html
 * (manipulation DOM directe, commit unique au mouseup).
 */

import {
  formatContentClipPath,
  TEXT_ZONE_PADDING_X,
  TEXT_ZONE_PADDING_Y,
} from '@/lib/studio/textZone/textZoneGeometry';
import type { TextZoneHandleDir, TextZoneModel, TextZoneRect } from '@/lib/studio/textZone/types';
import { resolveSnappedMovePosition, type TextZoneMoveSnapContext } from '@/lib/studio/textZone/textZoneSnap';
import type { SnapGuides } from '@/lib/studio/konva/snapEngine';
import type { Clip } from '@/types/composition';
import { resolveTextZoneContentPadding } from '@/lib/studio/textContentStyle';

export const SIM_MIN_WIDTH_PX = 80;
export const SIM_MIN_FRAME_HEIGHT_PX = 24;

export interface TextZoneDomRefs {
  zone: HTMLDivElement;
  /** Contenu texte (clippé au format). */
  content: HTMLDivElement;
  display: HTMLDivElement;
  textarea: HTMLTextAreaElement;
}

/** Applique le masque format sur le texte uniquement (pas sur le cadre / poignées). */
export function syncFormatContentClip(
  refs: TextZoneDomRefs,
  canvasWidth: number,
  canvasHeight: number
): void {
  const r = readZoneRect(refs.zone);
  const path = formatContentClipPath(
    r.leftPx,
    r.topPx,
    r.widthPx,
    r.heightPx,
    canvasWidth,
    canvasHeight
  );
  refs.content.style.clipPath = path ?? 'none';
}

export interface TextZoneMoveDrag {
  type: 'move';
  startClientX: number;
  startClientY: number;
  startLeftPx: number;
  startTopPx: number;
  startWidthPx: number;
  startHeightPx: number;
}

export interface TextZoneRotateDrag {
  type: 'rotate';
  startRotationDeg: number;
  startPointerAngleRad: number;
}

export interface TextZoneResizeDrag {
  type: 'resize';
  dir: TextZoneHandleDir;
  startClientX: number;
  startClientY: number;
  startLeftPx: number;
  startTopPx: number;
  startWidthPx: number;
  startHeightPx: number;
  startFontSizePx: number;
  anchorXPx: number;
  anchorYPx: number;
  /** Taille police courante pendant le drag (comme variable fontSize du simulateur). */
  fontSizePx: number;
}

export type TextZonePointerDrag = TextZoneMoveDrag | TextZoneResizeDrag | TextZoneRotateDrag;

const DRAG_CURSOR_LOCK_CLASS = 'text-zone-pointer-lock';
const DRAG_CURSOR_STYLE_ID = 'text-zone-drag-cursor-style';

/** Curseur à conserver pendant tout le drag (même hors poignée). */
export function getPointerDragCursor(drag: TextZonePointerDrag): string {
  if (drag.type === 'move') return 'move';
  if (drag.type === 'rotate') return 'grabbing';
  switch (drag.dir) {
    case 'ml':
    case 'mr':
      return 'ew-resize';
    case 'tl':
    case 'br':
      return 'nwse-resize';
    case 'tr':
    case 'bl':
      return 'nesw-resize';
  }
}

function ensureDragCursorStyleSheet(cursor: string): void {
  let el = document.getElementById(DRAG_CURSOR_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = DRAG_CURSOR_STYLE_ID;
    document.head.appendChild(el);
  }
  // Valeur littérale (pas de var CSS) + canvas Konva : le stage réécrit souvent cursor au survol.
  el.textContent = `
html.${DRAG_CURSOR_LOCK_CLASS},
html.${DRAG_CURSOR_LOCK_CLASS} *,
html.${DRAG_CURSOR_LOCK_CLASS} canvas {
  cursor: ${cursor} !important;
}
html.${DRAG_CURSOR_LOCK_CLASS} [data-studio-konva-surface],
html.${DRAG_CURSOR_LOCK_CLASS} [data-studio-konva-surface] * {
  pointer-events: none !important;
}
`;
}

/** Verrouille le curseur jusqu'à unlockPointerDragCursor (réappliquer au mousemove si besoin). */
export function lockPointerDragCursor(drag: TextZonePointerDrag): void {
  const cursor = getPointerDragCursor(drag);
  ensureDragCursorStyleSheet(cursor);
  document.documentElement.classList.add(DRAG_CURSOR_LOCK_CLASS);
  document.body.classList.add(DRAG_CURSOR_LOCK_CLASS);
  document.documentElement.style.setProperty('cursor', cursor, 'important');
  document.body.style.setProperty('cursor', cursor, 'important');
  document.body.style.userSelect = 'none';
}

export function unlockPointerDragCursor(): void {
  document.documentElement.classList.remove(DRAG_CURSOR_LOCK_CLASS);
  document.body.classList.remove(DRAG_CURSOR_LOCK_CLASS);
  document.documentElement.style.removeProperty('cursor');
  document.body.style.removeProperty('cursor');
  document.body.style.userSelect = '';
  document.getElementById(DRAG_CURSOR_STYLE_ID)?.remove();
}

export function readRotationDegFromZone(zone: HTMLElement): number {
  const transform = zone.style.transform;
  if (!transform || transform === 'none') return 0;
  const match = transform.match(/rotate\(([-\d.]+)deg\)/);
  return match ? parseFloat(match[1]) : 0;
}

export function applyZoneRotation(zone: HTMLElement, rotationDeg: number): void {
  zone.style.transformOrigin = '50% 50%';
  if (Math.abs(rotationDeg) < 0.01) {
    zone.style.transform = '';
  } else {
    zone.style.transform = `rotate(${rotationDeg}deg)`;
  }
}

export function readZoneRect(zone: HTMLElement): TextZoneRect {
  return {
    leftPx: zone.offsetLeft,
    topPx: zone.offsetTop,
    widthPx: zone.offsetWidth,
    heightPx: zone.offsetHeight,
  };
}

export interface RunAutoHeightOptions {
  /** Garde le centre vertical du cadre après mesure (évite un saut si textFrameHeightPx est obsolète). */
  anchorCenterYPx?: number;
  /** Padding proportionnel au resize coin (zoom uniforme). */
  paddingScale?: number;
  /** Styles fond / padding selon le clip. */
  clip?: Pick<Clip, 'backgroundColor' | 'backgroundOpacity'>;
}

/** Retour à la ligne y compris chaînes longues sans espaces (dddd…). */
export function applyTextWrapStyles(refs: TextZoneDomRefs): void {
  for (const el of [refs.display, refs.textarea]) {
    el.style.wordBreak = 'break-word';
    el.style.overflowWrap = 'anywhere';
  }
}

/** autoHeight() du simulateur — tous états (normal / sélectionné / édition / resize coin). */
export function runAutoHeight(
  refs: TextZoneDomRefs,
  content: string,
  options?: RunAutoHeightOptions
): void {
  const padScale = options?.paddingScale ?? 1;
  const pad = options?.clip
    ? resolveTextZoneContentPadding(options.clip, padScale)
    : {
        x: Math.max(6, Math.round(TEXT_ZONE_PADDING_X * padScale)),
        y: Math.max(4, Math.round(TEXT_ZONE_PADDING_Y * padScale)),
      };
  const padCss = `${pad.y}px ${pad.x}px`;
  refs.display.style.padding = padCss;
  refs.textarea.style.padding = padCss;
  applyTextWrapStyles(refs);
  refs.display.style.minHeight = '';
  refs.zone.style.height = '';
  refs.textarea.style.height = '0';
  refs.textarea.style.height = `${refs.textarea.scrollHeight}px`;
  refs.display.textContent = content || ' ';

  const centerY = options?.anchorCenterYPx;
  if (centerY != null) {
    refs.zone.style.top = `${centerY - refs.zone.offsetHeight / 2}px`;
  }
}

export function syncZoneTypography(refs: TextZoneDomRefs, fontSizePx: number): void {
  const fs = `${fontSizePx}px`;
  refs.display.style.fontSize = fs;
  refs.textarea.style.fontSize = fs;
}

/**
 * Cadre explicite w×h + fontSize — resize coin (zoom uniforme, pas de reflow).
 * `uniformScale` ajuste aussi le padding pour garder le même nombre de lignes.
 */
export function applyProportionalContentFrame(
  refs: TextZoneDomRefs,
  widthPx: number,
  heightPx: number,
  fontSizePx: number,
  content: string,
  uniformScale = 1,
  clip?: Pick<Clip, 'backgroundColor' | 'backgroundOpacity'>
): void {
  const pad = clip
    ? resolveTextZoneContentPadding(clip, uniformScale)
    : {
        x: Math.max(6, Math.round(TEXT_ZONE_PADDING_X * uniformScale)),
        y: Math.max(4, Math.round(TEXT_ZONE_PADDING_Y * uniformScale)),
      };
  const frameH = Math.max(SIM_MIN_FRAME_HEIGHT_PX, heightPx);
  const innerH = Math.max(SIM_MIN_FRAME_HEIGHT_PX, frameH - pad.y * 2);
  const padCss = `${pad.y}px ${pad.x}px`;

  refs.zone.style.width = `${widthPx}px`;
  refs.zone.style.height = `${frameH}px`;
  syncZoneTypography(refs, fontSizePx);
  refs.display.textContent = content || ' ';
  refs.display.style.padding = padCss;
  refs.display.style.minHeight = `${innerH}px`;
  refs.textarea.style.padding = padCss;
  refs.textarea.style.height = `${innerH}px`;
  applyTextWrapStyles(refs);
}

export function getResizeAnchors(dir: TextZoneHandleDir, rect: TextZoneRect): {
  anchorXPx: number;
  anchorYPx: number;
} {
  const right = rect.leftPx + rect.widthPx;
  const bottom = rect.topPx + rect.heightPx;
  switch (dir) {
    case 'tl':
      return { anchorXPx: right, anchorYPx: bottom };
    case 'tr':
      return { anchorXPx: rect.leftPx, anchorYPx: bottom };
    case 'bl':
      return { anchorXPx: right, anchorYPx: rect.topPx };
    case 'br':
      return { anchorXPx: rect.leftPx, anchorYPx: rect.topPx };
    case 'ml':
      return { anchorXPx: right, anchorYPx: rect.topPx };
    case 'mr':
      return { anchorXPx: rect.leftPx, anchorYPx: rect.topPx };
  }
}

export function startResizeDrag(
  dir: TextZoneHandleDir,
  clientX: number,
  clientY: number,
  refs: TextZoneDomRefs,
  fontSizePx: number
): TextZoneResizeDrag {
  const rect = readZoneRect(refs.zone);
  const anchor = getResizeAnchors(dir, rect);
  return {
    type: 'resize',
    dir,
    startClientX: clientX,
    startClientY: clientY,
    startLeftPx: rect.leftPx,
    startTopPx: rect.topPx,
    startWidthPx: rect.widthPx,
    startHeightPx: rect.heightPx,
    startFontSizePx: fontSizePx,
    anchorXPx: anchor.anchorXPx,
    anchorYPx: anchor.anchorYPx,
    fontSizePx,
  };
}

export function startRotateDrag(
  clientX: number,
  clientY: number,
  refs: TextZoneDomRefs,
  rotationDeg: number
): TextZoneRotateDrag {
  const box = refs.zone.getBoundingClientRect();
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  return {
    type: 'rotate',
    startRotationDeg: rotationDeg,
    startPointerAngleRad: Math.atan2(clientY - cy, clientX - cx),
  };
}

export function startMoveDrag(
  clientX: number,
  clientY: number,
  refs: TextZoneDomRefs
): TextZoneMoveDrag {
  const rect = readZoneRect(refs.zone);
  return {
    type: 'move',
    startClientX: clientX,
    startClientY: clientY,
    startLeftPx: rect.leftPx,
    startTopPx: rect.topPx,
    startWidthPx: rect.widthPx,
    startHeightPx: rect.heightPx,
  };
}

export function pointerMove(
  drag: TextZonePointerDrag,
  clientX: number,
  clientY: number,
  scale: number,
  refs: TextZoneDomRefs,
  content: string,
  canvasWidth: number,
  canvasHeight: number,
  currentFontSizePx: number,
  moveSnap?: TextZoneMoveSnapContext,
  onSnapGuides?: (guides: SnapGuides) => void,
  clip?: Pick<Clip, 'backgroundColor' | 'backgroundOpacity'>
): number {
  const { zone } = refs;

  if (drag.type === 'rotate') {
    const box = zone.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const angle = Math.atan2(clientY - cy, clientX - cx);
    const deltaDeg = ((angle - drag.startPointerAngleRad) * 180) / Math.PI;
    applyZoneRotation(zone, drag.startRotationDeg + deltaDeg);
    syncFormatContentClip(refs, canvasWidth, canvasHeight);
    return currentFontSizePx;
  }

  const dx = (clientX - drag.startClientX) / scale;
  const dy = (clientY - drag.startClientY) / scale;

  if (drag.type === 'move') {
    let nx = drag.startLeftPx + dx;
    let ny = drag.startTopPx + dy;
    if (moveSnap) {
      const snapped = resolveSnappedMovePosition(nx, ny, {
        ...moveSnap,
        widthPx: drag.startWidthPx,
        heightPx: drag.startHeightPx,
      });
      nx = snapped.leftPx;
      ny = snapped.topPx;
      onSnapGuides?.(snapped.guides);
    } else {
      onSnapGuides?.({ vertical: [], horizontal: [] });
    }
    zone.style.left = `${nx}px`;
    zone.style.top = `${ny}px`;
    syncFormatContentClip(refs, canvasWidth, canvasHeight);
    return currentFontSizePx;
  }

  onSnapGuides?.({ vertical: [], horizontal: [] });

  const dir = drag.dir;
  const isCorner = dir === 'tl' || dir === 'tr' || dir === 'bl' || dir === 'br';

  if (isCorner) {
    let newW: number;
    let newLeft: number | undefined;
    const topAnchor = dir === 'tl' || dir === 'tr';

    if (dir === 'br') {
      newW = Math.max(SIM_MIN_WIDTH_PX, drag.startWidthPx + dx);
    } else if (dir === 'bl') {
      newW = Math.max(SIM_MIN_WIDTH_PX, drag.startWidthPx - dx);
      newLeft = drag.anchorXPx - newW;
    } else if (dir === 'tr') {
      newW = Math.max(SIM_MIN_WIDTH_PX, drag.startWidthPx + dx);
    } else {
      newW = Math.max(SIM_MIN_WIDTH_PX, drag.startWidthPx - dx);
      newLeft = drag.anchorXPx - newW;
    }

    const uniformScale = drag.startWidthPx > 0 ? newW / drag.startWidthPx : 1;
    const newFs = drag.startFontSizePx * uniformScale;
    drag.fontSizePx = newFs;

    if (newLeft !== undefined) zone.style.left = `${newLeft}px`;
    zone.style.width = `${newW}px`;
    syncZoneTypography(refs, newFs);
    // Comme le simulateur : largeur + fontSize proportionnels, hauteur = contenu wrapé.
    runAutoHeight(refs, content, { paddingScale: uniformScale, clip });

    if (topAnchor) {
      zone.style.top = `${drag.anchorYPx - zone.offsetHeight}px`;
    }

    syncFormatContentClip(refs, canvasWidth, canvasHeight);
    return newFs;
  }

  let newW: number;
  let newLeft: number | undefined;
  if (dir === 'mr') {
    newW = Math.max(SIM_MIN_WIDTH_PX, drag.startWidthPx + dx);
  } else {
    newW = Math.max(SIM_MIN_WIDTH_PX, drag.startWidthPx - dx);
    newLeft = drag.anchorXPx - newW;
  }
  zone.style.width = `${newW}px`;
  if (newLeft !== undefined) zone.style.left = `${newLeft}px`;
  runAutoHeight(refs, content, { clip });
  syncFormatContentClip(refs, canvasWidth, canvasHeight);
  return drag.fontSizePx;
}

export interface ApplyZoneLayoutOptions {
  /**
   * true = cadre w×h×font figé (uniquement pendant resize coin en drag).
   * false = autoHeight (simulateur) — normal, sélectionné, édition, ml/mr.
   */
  proportionalFrame?: boolean;
  clip?: Pick<Clip, 'backgroundColor' | 'backgroundOpacity'>;
}

export function applyZoneLayoutFromModel(
  refs: TextZoneDomRefs,
  model: Pick<TextZoneModel, 'leftPx' | 'topPx' | 'widthPx' | 'heightPx' | 'fontSize' | 'rotationDeg'>,
  content: string,
  canvasWidth: number,
  canvasHeight: number,
  options?: ApplyZoneLayoutOptions
): void {
  const centerY = model.topPx + model.heightPx / 2;
  refs.zone.style.left = `${model.leftPx}px`;
  refs.zone.style.top = `${model.topPx}px`;
  refs.zone.style.width = `${model.widthPx}px`;
  syncZoneTypography(refs, model.fontSize);

  if (options?.proportionalFrame && model.heightPx > 0) {
    applyProportionalContentFrame(
      refs,
      model.widthPx,
      model.heightPx,
      model.fontSize,
      content,
      1,
      options.clip
    );
  } else {
    runAutoHeight(refs, content, { anchorCenterYPx: centerY, clip: options?.clip });
  }
  applyZoneRotation(refs.zone, model.rotationDeg);
  syncFormatContentClip(refs, canvasWidth, canvasHeight);
}

export function readModelFromDom(
  refs: TextZoneDomRefs,
  content: string,
  fontSizePx: number
): TextZoneModel {
  const rect = readZoneRect(refs.zone);
  return {
    ...rect,
    fontSize: fontSizePx,
    content,
    rotationDeg: readRotationDegFromZone(refs.zone),
  };
}
