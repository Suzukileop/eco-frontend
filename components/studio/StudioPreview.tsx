'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import {
  computePreviewCanvasDimensions,
  computePreviewScrollPadding,
  PREVIEW_MANIPULATION_MARGIN,
} from '@/lib/previewLayout';
import { formatDisplayLabel } from '@/lib/formatPresets';
import { StudioGlOverlay } from '@/components/studio/StudioGlOverlay';
import { StudioKonvaEditor } from '@/components/studio/StudioKonvaEditor';
import { StudioTextClipLayer } from '@/components/studio/StudioTextClipLayer';
import { StudioCanvasOverlay } from '@/components/studio/StudioCanvasOverlay';
import { KonvaMultiSelectToolbar } from '@/components/studio/konva/KonvaMultiSelectToolbar';

const StudioPlayer = dynamic(
  () => import('@/components/studio/StudioPlayer').then((m) => m.StudioPlayer),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-900 animate-pulse" /> }
);

/** Marge scroll verticale plus généreuse (style éditeur classique, déplacement horizontal facilité). */
const STUDIO_SCROLL_PADDING_SCALE = 1.35;

interface StudioPreviewProps {
  fitBounds?: { width: number; height: number };
}

export function StudioPreview({ fitBounds }: StudioPreviewProps) {
  const composition = useCompositionStore((s) => s.composition);
  const format = useCompositionStore((s) => s.format);
  const isPlaying = useCompositionStore((s) => s.isPlaying);
  const previewZoom = useEditorUiStore((s) => s.previewZoom);
  const previewTool = useEditorUiStore((s) => s.previewTool);
  const isHandTool = previewTool === 'hand';
  const scrollRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [draggingHand, setDraggingHand] = useState(false);

  const applyFit = useCallback(() => {
    let w = 0;
    let h = 0;
    if (fitBounds && fitBounds.width > 0 && fitBounds.height > 0) {
      w = fitBounds.width;
      h = fitBounds.height;
    } else if (scrollRef.current) {
      const rect = scrollRef.current.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
    }
    if (w > 0 && h > 0) {
      const dims = computePreviewCanvasDimensions(
        w,
        h,
        format,
        undefined,
        composition?.customAspectW,
        composition?.customAspectH
      );
      setDimensions(dims);
      useEditorUiStore.getState().setPreviewCanvasSize(dims);
    }
  }, [fitBounds, format, composition?.customAspectW, composition?.customAspectH]);

  useEffect(() => {
    applyFit();
    if (fitBounds?.width && fitBounds?.height) return;
    const el = scrollRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => applyFit());
    obs.observe(el);
    return () => obs.disconnect();
  }, [applyFit, fitBounds?.width, fitBounds?.height]);

  const scaledW = Math.round(dimensions.width * previewZoom);
  const scaledH = Math.round(dimensions.height * previewZoom);
  const manipMargin = Math.round(PREVIEW_MANIPULATION_MARGIN * previewZoom);
  const viewportHeight = fitBounds?.height ?? 0;
  const scrollPadding = useMemo(
    () =>
      computePreviewScrollPadding(
        viewportHeight,
        scaledH,
        manipMargin,
        STUDIO_SCROLL_PADDING_SCALE
      ),
    [viewportHeight, scaledH, manipMargin]
  );
  const stageH = scaledH + manipMargin * 2;
  /** Konva visible en pause ; interactions clip désactivées seulement en mode main. */
  const showKonvaEditor = !isPlaying;
  const konvaInteractive = !isPlaying && !isHandTool;

  const centerPreviewScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || stageH <= 0) return;
    const target = scrollPadding.top - (el.clientHeight - stageH) / 2;
    el.scrollTop = Math.max(0, target);
  }, [scrollPadding.top, stageH]);

  useEffect(() => {
    centerPreviewScroll();
  }, [centerPreviewScroll, format, previewZoom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => centerPreviewScroll());
    obs.observe(el);
    return () => obs.disconnect();
  }, [centerPreviewScroll]);

  useEffect(() => {
    if (!konvaInteractive) return;
    const clear = () => useEditorUiStore.getState().clearKonvaSnapGuides();
    window.addEventListener('mouseup', clear);
    window.addEventListener('pointerup', clear);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('mouseup', clear);
      window.removeEventListener('pointerup', clear);
      window.removeEventListener('blur', clear);
    };
  }, [konvaInteractive]);

  const deselectCanvasZoneIfOutside = useCallback((e: React.MouseEvent) => {
    if (isHandTool) return;
    if ((e.target as HTMLElement).closest('[data-text-zone]')) return;
    if ((e.target as HTMLElement).closest('[data-canvas-zone]')) return;
    useCompositionStore.getState().setSelectedClip(null);
    useEditorUiStore.getState().setKonvaSelectedIds([]);
    useEditorUiStore.getState().setKonvaFocusedTextClipId(null);
    useEditorUiStore.getState().clearKonvaSnapGuides();
  }, [isHandTool]);

  const handlePreviewPanStart = useCallback(
    (e: React.MouseEvent) => {
      if (!isHandTool || e.button !== 0) return;
      const el = scrollRef.current;
      if (!el) return;
      panRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startScrollLeft: el.scrollLeft,
        startScrollTop: el.scrollTop,
      };
      e.preventDefault();
      setDraggingHand(true);
    },
    [isHandTool]
  );

  useEffect(() => {
    if (!isHandTool) return;
    const onMove = (e: MouseEvent) => {
      if (!panRef.current.active) return;
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = panRef.current.startScrollTop - (e.clientY - panRef.current.startY);
      el.scrollLeft = panRef.current.startScrollLeft - (e.clientX - panRef.current.startX);
    };
    const onUp = () => {
      panRef.current.active = false;
      setDraggingHand(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isHandTool]);

  const canvasBg = composition?.canvasBackgroundColor ?? '#000000';
  const frameBorderW = composition?.frameBorderWidth ?? 0;
  const frameBorderColor = composition?.frameBorderColor ?? '#ffffff';

  const surface = (
    <div
      className="relative shrink-0 overflow-visible"
      style={{
        width: scaledW + manipMargin * 2,
        minHeight: scaledH + manipMargin * 2,
      }}
      onMouseDown={isHandTool ? undefined : deselectCanvasZoneIfOutside}
    >
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl ${
          showKonvaEditor ? 'overflow-visible' : 'overflow-hidden'
        }`}
        style={{ width: scaledW, height: scaledH }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: canvasBg }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] ring-1 ring-inset ring-white/15"
          aria-hidden
        />
        <div
          data-preview-surface
          data-studio-surface
          className="absolute left-0 top-0 origin-top-left overflow-visible"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: `scale(${previewZoom})`,
            boxShadow:
              frameBorderW > 0
                ? `inset 0 0 0 ${frameBorderW}px ${frameBorderColor}`
                : undefined,
          }}
        >
          {showKonvaEditor ? (
            <>
              <div
                data-studio-konva-surface
                className="pointer-events-auto absolute inset-0 z-[40] overflow-visible"
              >
                <StudioKonvaEditor
                  width={dimensions.width}
                  height={dimensions.height}
                  interactive={konvaInteractive}
                />
                <KonvaMultiSelectToolbar
                  canvasWidth={dimensions.width}
                  canvasHeight={dimensions.height}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 z-[45] overflow-visible">
                <StudioCanvasOverlay
                  canvasWidth={dimensions.width}
                  canvasHeight={dimensions.height}
                  pointerScale={previewZoom}
                  interactive={konvaInteractive}
                  onDragGuide={() => {}}
                  onContextMenu={() => {}}
                />
              </div>
              <StudioTextClipLayer
                canvasWidth={dimensions.width}
                canvasHeight={dimensions.height}
                interactive={konvaInteractive}
                pointerScale={previewZoom}
              />
            </>
          ) : (
            <div className="absolute inset-0 z-[10] overflow-hidden">
              <StudioPlayer width={dimensions.width} height={dimensions.height} />
              <StudioGlOverlay width={dimensions.width} height={dimensions.height} />
            </div>
          )}
        </div>

        {dimensions.width > 0 && (
          <div
            className="pointer-events-none absolute bottom-2 left-1/2 z-[41] -translate-x-1/2 rounded bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white/90 tabular-nums"
          >
            {formatDisplayLabel(format, composition?.customAspectW, composition?.customAspectH)}
            <span className="ml-1 text-white/60">
              · {dimensions.width}×{dimensions.height}
            </span>
          </div>
        )}

        {!showKonvaEditor && (
          <div className="pointer-events-none absolute bottom-2 right-2 z-[41] rounded bg-black/60 px-2 py-0.5 text-[10px] text-violet-200">
            Lecture — pause pour éditer
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={scrollRef}
        data-editor-preview-zone
        className={`h-full w-full overflow-y-auto overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isHandTool ? (draggingHand ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
        style={{ background: '#f0f1f4' }}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('canvas')) return;
          handlePreviewPanStart(e);
          deselectCanvasZoneIfOutside(e);
        }}
      >
        <div
          className="flex w-full flex-col items-center"
          style={{
            paddingTop: scrollPadding.top,
            paddingBottom: scrollPadding.bottom,
            minHeight: '100%',
          }}
        >
          {surface}
        </div>
      </div>
    </>
  );
}
