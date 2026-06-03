'use client';

import { useCallback, type ReactNode } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { isNearCanvasCenter, snapToCanvasCenter } from '@/lib/textPosition';
import {
  clientToStudioCanvasPx,
  computeProportionalCornerFrame,
  DRAGGED_TO_FIXED_CORNER,
  fixedCornerPoint,
  type CornerResizeEdge,
} from '@/lib/studio/canvasPointer';

export type CanvasDragGuide = { x: number; y: number; nearCenter: boolean } | null;

type ResizeEdge = 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

const CORNER_POS: Record<'nw' | 'ne' | 'sw' | 'se', string> = {
  nw: '-top-2.5 -left-2.5 cursor-nwse-resize',
  ne: '-top-2.5 -right-2.5 cursor-nesw-resize',
  sw: '-bottom-2.5 -left-2.5 cursor-nesw-resize',
  se: '-bottom-2.5 -right-2.5 cursor-nwse-resize',
};

function CornerResizeHandle({
  corner,
  onMouseDown,
}: {
  corner: 'nw' | 'ne' | 'sw' | 'se';
  onMouseDown: (e: React.MouseEvent, edge: ResizeEdge) => void;
}) {
  return (
    <div
      data-resize-handle={corner}
      className={`absolute z-[60] h-3.5 w-3.5 rounded-full border-2 border-white bg-white shadow-md transition-shadow hover:shadow-lg hover:ring-2 hover:ring-cyan-400/80 ${CORNER_POS[corner]}`}
      onMouseDown={(e) => onMouseDown(e, corner)}
      title="Redimensionner"
    />
  );
}

function SideResizeHandle({
  side,
  onMouseDown,
}: {
  side: 'w' | 'e';
  onMouseDown: (e: React.MouseEvent, edge: ResizeEdge) => void;
}) {
  const pos =
    side === 'e'
      ? 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize'
      : 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize';
  return (
    <div
      data-resize-handle={side}
      className={`absolute z-[60] h-4 w-2 rounded-full border-2 border-white bg-white shadow-md transition-shadow hover:shadow-lg hover:ring-2 hover:ring-cyan-400/80 ${pos}`}
      onMouseDown={(e) => onMouseDown(e, side)}
      title="Ajuster la largeur"
    />
  );
}

function CapCutResizeHandles({
  onMouseDown,
}: {
  onMouseDown: (e: React.MouseEvent, edge: ResizeEdge) => void;
}) {
  return (
    <>
      {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
        <CornerResizeHandle key={corner} corner={corner} onMouseDown={onMouseDown} />
      ))}
      <SideResizeHandle side="w" onMouseDown={onMouseDown} />
      <SideResizeHandle side="e" onMouseDown={onMouseDown} />
    </>
  );
}

interface MovableCanvasZoneProps {
  xPct: number;
  yPct: number;
  boxWidthPct: number;
  fontSize: number;
  isSelected: boolean;
  disabled?: boolean;
  canvasWidth: number;
  canvasHeight: number;
  zIndex: number;
  zIndexWhenSelected?: number;
  ringSelectedClass?: string;
  minBoxWidthPct?: number;
  minWidthPx?: number;
  minFontSize?: number;
  maxFontSize?: number;
  maxBoxWidthPct?: number;
  resizeMode?: 'uniform' | 'split' | 'frame';
  handleLayout?: 'capcut' | 'legacy';
  overflowVisible?: boolean;
  maxWidthCss?: string;
  selectionAddon?: ReactNode;
  freeTransform?: boolean;
  clipChildren?: boolean;
  /** Cadre épouse le contenu (max = boxWidthPct %), sans marge interne vide. */
  shrinkToContent?: boolean;
  /** Largeur + hauteur fixes en px (cadre texte serré sur les glyphes). */
  tightWidthPx?: number;
  tightHeightPx?: number;
  pointerScale?: number;
  /** Hauteur du contenu à une largeur donnée (wrap texte). Active le resize ancré. */
  getHeightAtWidthPx?: (widthPx: number) => number;
  onSelect: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragGuide: (guide: CanvasDragGuide) => void;
  onPositionChange: (x: number, y: number) => void;
  onResize: (boxWidthPct: number, fontSize: number) => void;
  /** Resize latéral : wrap + hauteur dynamique, côté opposé fixe. */
  onAnchorFrameResize?: (payload: {
    widthPct: number;
    xPct: number;
    yPct: number;
    clearTextAnchor?: boolean;
  }) => void;
  /** Resize coin : scale uniforme (police + cadre), coin diagonal opposé fixe. */
  onAnchorCornerScale?: (payload: {
    widthPct: number;
    fontSize: number;
    frameHeightPx: number;
    uniformScale: number;
    textAnchorCorner: CornerResizeEdge;
    textAnchorXPx: number;
    textAnchorYPx: number;
  }) => void;
  /** Fin du drag coin : remesure optionnelle sur le contenu. */
  onAnchorCornerScaleEnd?: () => void;
  onDoubleClick?: () => void;
  /** Rotation du cadre (deg), appliquée sur le wrapper absolu. */
  rotationDeg?: number;
  children: ReactNode;
}

export function MovableCanvasZone({
  xPct,
  yPct,
  boxWidthPct,
  fontSize,
  isSelected,
  disabled = false,
  canvasWidth,
  canvasHeight,
  zIndex,
  zIndexWhenSelected = zIndex + 6,
  ringSelectedClass = 'ring-2 ring-cyan-400 ring-offset-0 ring-offset-transparent',
  minBoxWidthPct = 12,
  minWidthPx = 32,
  minFontSize = 10,
  maxFontSize = 160,
  maxBoxWidthPct = 96,
  resizeMode = 'split',
  handleLayout = 'capcut',
  overflowVisible = false,
  maxWidthCss,
  selectionAddon,
  freeTransform = false,
  clipChildren = false,
  shrinkToContent = false,
  tightWidthPx,
  tightHeightPx,
  pointerScale = 1,
  getHeightAtWidthPx,
  onSelect,
  onContextMenu,
  onDragGuide,
  onPositionChange,
  onResize,
  onAnchorFrameResize,
  onAnchorCornerScale,
  onAnchorCornerScaleEnd,
  onDoubleClick,
  rotationDeg = 0,
  children,
}: MovableCanvasZoneProps) {
  const zoneTransform =
    rotationDeg !== 0
      ? `translate(-50%, -50%) rotate(${rotationDeg}deg)`
      : 'translate(-50%, -50%)';
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !onContextMenu) return;
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e);
    },
    [disabled, onContextMenu]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      if ((e.target as HTMLElement).dataset.resizeHandle) return;
      if ((e.target as HTMLElement).closest('[data-media-pan]')) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect();

      const startX = e.clientX;
      const startY = e.clientY;
      const startXPct = xPct;
      const startYPct = yPct;

      onDragGuide({
        x: startXPct,
        y: startYPct,
        nearCenter: isNearCanvasCenter(startXPct, startYPct),
      });

      const scale = pointerScale > 0 ? pointerScale : 1;
      const onMove = (me: MouseEvent) => {
        const dxPct = ((me.clientX - startX) / (canvasWidth * scale)) * 100;
        const dyPct = ((me.clientY - startY) / (canvasHeight * scale)) * 100;
        const minP = freeTransform ? -40 : 5;
        const maxP = freeTransform ? 140 : 95;
        const nx = Math.max(minP, Math.min(maxP, startXPct + dxPct));
        const ny = Math.max(minP, Math.min(maxP, startYPct + dyPct));
        const snapped = snapToCanvasCenter(nx, ny);
        onDragGuide({ x: snapped.x, y: snapped.y, nearCenter: snapped.snapped });
        onPositionChange(snapped.x, snapped.y);
      };

      const onUp = () => {
        onDragGuide(null);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [
      disabled,
      xPct,
      yPct,
      canvasWidth,
      canvasHeight,
      onSelect,
      onDragGuide,
      onPositionChange,
      freeTransform,
      pointerScale,
    ]
  );

  const effectiveMaxBox = freeTransform ? Math.max(maxBoxWidthPct, 280) : maxBoxWidthPct;

  const clampWidth = useCallback(
    (w: number) => Math.max(minBoxWidthPct, Math.min(effectiveMaxBox, w)),
    [minBoxWidthPct, effectiveMaxBox]
  );

  const computeFontSize = useCallback(
    (startW: number, startFont: number, newW: number, edge: ResizeEdge) => {
      if (resizeMode === 'frame') return startFont;
      if (resizeMode === 'uniform') {
        const ratio = startW > 0 ? newW / startW : 1;
        return Math.round(startFont * ratio);
      }
      const scaleFactor = edge === 'se' || edge === 'ne' ? 1 : 0.55;
      return Math.round(startFont + (newW - startW) * 0.35 * scaleFactor);
    },
    [resizeMode]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, edge: ResizeEdge) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      useCompositionStore.getState().saveToHistory();

      const startX = e.clientX;
      const startW = boxWidthPct;
      const startFont = fontSize;
      const startXPct = xPct;
      const startYPct = yPct;
      const pointerMul = pointerScale > 0 ? pointerScale : 1;
      const isSideEdge = edge === 'w' || edge === 'e';
      const isCornerEdge = edge === 'nw' || edge === 'ne' || edge === 'sw' || edge === 'se';
      const widthMul = isSideEdge ? 1 : 1.15;

      const useTextAnchor =
        shrinkToContent &&
        tightWidthPx != null &&
        tightWidthPx > 0 &&
        (onAnchorFrameResize != null || onAnchorCornerScale != null);

      let anchorLeftPx = 0;
      let anchorRightPx = 0;
      let anchorTopPx = 0;
      let anchorBottomPx = 0;
      let startWidthPx = 0;
      let startHeightPx = 0;

      const boundsAtStart = { left: 0, top: 0, right: 0, bottom: 0 };
      let fixedAnchorCorner: CornerResizeEdge | null = null;
      let fixedAnchorX = 0;
      let fixedAnchorY = 0;

      if (useTextAnchor) {
        startWidthPx = tightWidthPx;
        startHeightPx =
          getHeightAtWidthPx?.(startWidthPx) ??
          (tightHeightPx != null && tightHeightPx > 0 ? tightHeightPx : startWidthPx * 0.5);
        const centerXPx = (canvasWidth * startXPct) / 100;
        const centerYPx = (canvasHeight * startYPct) / 100;
        anchorLeftPx = centerXPx - startWidthPx / 2;
        anchorRightPx = centerXPx + startWidthPx / 2;
        anchorTopPx = centerYPx - startHeightPx / 2;
        anchorBottomPx = centerYPx + startHeightPx / 2;
        boundsAtStart.left = anchorLeftPx;
        boundsAtStart.top = anchorTopPx;
        boundsAtStart.right = anchorRightPx;
        boundsAtStart.bottom = anchorBottomPx;

        if (isCornerEdge) {
          fixedAnchorCorner = DRAGGED_TO_FIXED_CORNER[edge as CornerResizeEdge];
          const pt = fixedCornerPoint(fixedAnchorCorner, boundsAtStart);
          fixedAnchorX = pt.x;
          fixedAnchorY = pt.y;
        }
      }

      let rafId = 0;
      let lastEvent: MouseEvent | null = null;
      let cornerDragActive = false;

      const clampWidthPx = (wPx: number) =>
        Math.max(
          minWidthPx,
          Math.min((canvasWidth * effectiveMaxBox) / 100, wPx)
        );

      const applyResize = () => {
        rafId = 0;
        const me = lastEvent;
        if (!me) return;

        if (
          useTextAnchor &&
          isCornerEdge &&
          onAnchorCornerScale &&
          fixedAnchorCorner != null
        ) {
          cornerDragActive = true;
          const pointer = clientToStudioCanvasPx(me.clientX, me.clientY, pointerMul);
          if (!pointer) return;

          const minHeightPx = Math.max(16, minWidthPx * 0.35);
          const proportional = computeProportionalCornerFrame(
            edge as CornerResizeEdge,
            boundsAtStart,
            pointer.x,
            pointer.y,
            startWidthPx,
            startHeightPx,
            minWidthPx,
            minHeightPx
          );

          const newWidthPx = clampWidthPx(proportional.widthPx);
          const newHeightPx = proportional.heightPx;
          const uniformScale =
            startWidthPx > 0 ? newWidthPx / startWidthPx : proportional.scale;
          const newFontSize = Math.max(
            minFontSize,
            Math.min(maxFontSize, startFont * uniformScale)
          );

          const newWPct = Math.max(
            minBoxWidthPct,
            Math.min(effectiveMaxBox, (newWidthPx / canvasWidth) * 100)
          );

          onAnchorCornerScale({
            widthPct: newWPct,
            fontSize: newFontSize,
            frameHeightPx: newHeightPx,
            uniformScale,
            textAnchorCorner: fixedAnchorCorner,
            textAnchorXPx: fixedAnchorX,
            textAnchorYPx: fixedAnchorY,
          });
          return;
        }

        if (useTextAnchor && isSideEdge && getHeightAtWidthPx && onAnchorFrameResize) {
          const pointer = clientToStudioCanvasPx(me.clientX, me.clientY, pointerMul);
          if (!pointer) return;

          let newWidthPx = startWidthPx;
          if (edge === 'e') {
            newWidthPx = pointer.x - anchorLeftPx;
          } else {
            newWidthPx = anchorRightPx - pointer.x;
          }

          newWidthPx = clampWidthPx(newWidthPx);
          const newHeightPx = getHeightAtWidthPx(newWidthPx);

          let newCenterXPx = (canvasWidth * startXPct) / 100;
          let newCenterYPx = (canvasHeight * startYPct) / 100;

          if (edge === 'e') {
            newCenterXPx = anchorLeftPx + newWidthPx / 2;
            newCenterYPx = anchorTopPx + newHeightPx / 2;
          } else {
            newCenterXPx = anchorRightPx - newWidthPx / 2;
            newCenterYPx = anchorTopPx + newHeightPx / 2;
          }

          const newXPct = Math.max(0, Math.min(100, (newCenterXPx / canvasWidth) * 100));
          const newYPct = Math.max(0, Math.min(100, (newCenterYPx / canvasHeight) * 100));
          const newWPct = Math.max(
            minBoxWidthPct,
            Math.min(effectiveMaxBox, (newWidthPx / canvasWidth) * 100)
          );

          onAnchorFrameResize({
            widthPct: newWPct,
            xPct: newXPct,
            yPct: newYPct,
            clearTextAnchor: true,
          });
          return;
        }

        const dxPct = ((me.clientX - startX) / (canvasWidth * pointerMul)) * 100;
        let newW = startW;
        let newX = startXPct;

        if (edge === 'e' || edge === 'se' || edge === 'ne') {
          const left = startXPct - startW / 2;
          newW = clampWidth(startW + dxPct * widthMul);
          newX = left + newW / 2;
        } else {
          const right = startXPct + startW / 2;
          newW = clampWidth(startW - dxPct * widthMul);
          newX = right - newW / 2;
        }

        if (Math.abs(newX - startXPct) > 0.01) {
          onPositionChange(newX, startYPct);
        }

        const nextFont =
          resizeMode === 'frame' || isSideEdge
            ? startFont
            : Math.max(
                minFontSize,
                Math.min(maxFontSize, computeFontSize(startW, startFont, newW, edge))
              );
        onResize(newW, nextFont);
      };

      const onMove = (me: MouseEvent) => {
        lastEvent = me;
        if (rafId) return;
        rafId = window.requestAnimationFrame(applyResize);
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        if (lastEvent) applyResize();
        if (cornerDragActive) {
          cornerDragActive = false;
          onAnchorCornerScaleEnd?.();
        }
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [
      disabled,
      boxWidthPct,
      fontSize,
      xPct,
      yPct,
      canvasWidth,
      canvasHeight,
      minFontSize,
      maxFontSize,
      clampWidth,
      computeFontSize,
      onSelect,
      onPositionChange,
      onResize,
      onAnchorFrameResize,
      onAnchorCornerScale,
      onAnchorCornerScaleEnd,
      pointerScale,
      shrinkToContent,
      tightWidthPx,
      tightHeightPx,
      getHeightAtWidthPx,
      minWidthPx,
      minBoxWidthPct,
      effectiveMaxBox,
      resizeMode,
    ]
  );

  const chromeHandles =
    isSelected && !disabled && handleLayout === 'capcut' ? (
      <CapCutResizeHandles onMouseDown={handleResizeMouseDown} />
    ) : isSelected && !disabled && handleLayout === 'legacy' ? (
      <>
        {resizeMode === 'frame' ? (
          (['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
            <CornerResizeHandle key={corner} corner={corner} onMouseDown={handleResizeMouseDown} />
          ))
        ) : (
          <>
            <SideResizeHandle side="e" onMouseDown={handleResizeMouseDown} />
            <CornerResizeHandle corner="se" onMouseDown={handleResizeMouseDown} />
          </>
        )}
      </>
    ) : null;

  const boxClass = isSelected
    ? `${ringSelectedClass} rounded-sm`
    : 'rounded-sm hover:ring-1 hover:ring-white/30';

  const tightFrame =
    shrinkToContent && tightWidthPx != null && tightWidthPx > 0
      ? {
          width: tightWidthPx,
          height: tightHeightPx != null ? tightHeightPx : undefined,
        }
      : null;

  const zoneWidthStyle = shrinkToContent
    ? tightFrame
      ? {
          minWidth: minWidthPx,
          width: tightFrame.width,
          height: tightFrame.height,
          boxSizing: 'content-box' as const,
        }
      : {
          width: 'max-content' as const,
          maxWidth: `${boxWidthPct}%`,
          minWidth: minWidthPx,
        }
    : {
        width: `${boxWidthPct}%`,
        minWidth: minWidthPx,
        maxWidth:
          maxWidthCss ?? (freeTransform ? 'none' : resizeMode === 'frame' ? '100%' : '96%'),
      };

  if (clipChildren) {
    return (
      <div
        data-canvas-zone
        className="pointer-events-auto"
        style={{
          position: 'absolute',
          left: `${xPct}%`,
          top: `${yPct}%`,
          transform: zoneTransform,
          zIndex: isSelected ? zIndexWhenSelected : zIndex,
          ...zoneWidthStyle,
          touchAction: 'none',
          overflow: 'visible',
        }}
        onContextMenu={handleContextMenu}
      >
        <div className="relative w-full overflow-hidden">{children}</div>
        {isSelected && !disabled && (
          <div
            className={`absolute inset-0 overflow-visible ${boxClass}`}
            style={{ cursor: disabled ? 'not-allowed' : 'grab' }}
            onMouseDown={handleMouseDown}
            onDoubleClick={onDoubleClick}
            onContextMenu={handleContextMenu}
          >
            {chromeHandles}
            {selectionAddon}
          </div>
        )}
        {!isSelected && (
          <div
            className={`absolute inset-0 ${boxClass}`}
            style={{ cursor: disabled ? 'not-allowed' : 'grab' }}
            onMouseDown={handleMouseDown}
            onDoubleClick={onDoubleClick}
            onContextMenu={handleContextMenu}
          />
        )}
      </div>
    );
  }

  return (
    <div
      data-canvas-zone
      className="pointer-events-auto"
      style={{
        position: 'absolute',
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: zoneTransform,
        zIndex: isSelected ? zIndexWhenSelected : zIndex,
        ...zoneWidthStyle,
        touchAction: 'none',
        overflow: overflowVisible ? 'visible' : undefined,
      }}
      onContextMenu={handleContextMenu}
    >
      <div
        className={`relative overflow-visible ${boxClass}`}
        style={{
          cursor: disabled ? 'not-allowed' : 'grab',
          margin: 0,
          padding: 0,
          boxSizing: 'content-box',
          ...tightFrame,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {children}
        {isSelected && !disabled && selectionAddon}
        {chromeHandles}
      </div>
    </div>
  );
}

export function defaultOverlayBoxWidthPct(content: string | undefined): number {
  const len = (content ?? '').length;
  if (len <= 3) return 18;
  if (len <= 12) return 32;
  return 48;
}
