'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Layer, Line, Rect, Stage, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { Clip } from '@/types/composition';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { getClipLayout, pxToPct } from '@/lib/studio/konva/clipLayout';
import { snapClipCenter } from '@/lib/studio/konva/snapEngine';
import { KonvaSnapGuidesLayer } from '@/components/studio/konva/KonvaSnapGuidesLayer';
import { StudioKonvaClipNode } from '@/components/studio/konva/StudioKonvaClipNode';
import { styleKonvaTransformerAnchor } from '@/lib/studio/konva/konvaTransformerStyle';
import { MEDIA_TRANSFORM_ANCHORS } from '@/lib/studio/konva/transformAnchors';
import { isDomMediaClip } from '@/lib/studio/mediaDimensions';

interface StudioKonvaEditorProps {
  width: number;
  height: number;
  interactive: boolean;
}

function isActive(clip: Clip, t: number): boolean {
  return clip.startTime <= t && clip.endTime > t;
}

function isTextClip(clip: Clip): boolean {
  return clip.trackType === 'text' || clip.type === 'text';
}

export function StudioKonvaEditor({ width, height, interactive }: StudioKonvaEditorProps) {
  const composition = useCompositionStore((s) => s.composition);
  const currentTime = useCompositionStore((s) => s.currentTime);
  const selectedClipId = useCompositionStore((s) => s.selectedClipId);
  const setSelectedClip = useCompositionStore((s) => s.setSelectedClip);
  const updateClip = useCompositionStore((s) => s.updateClip);
  const removeClip = useCompositionStore((s) => s.removeClip);
  const saveToHistory = useCompositionStore((s) => s.saveToHistory);
  const snapEnabled = useCompositionStore((s) => s.snapEnabled);

  const konvaSelectedIds = useEditorUiStore((s) => s.konvaSelectedIds);
  const setKonvaSelectedIds = useEditorUiStore((s) => s.setKonvaSelectedIds);
  const setKonvaLiveLayout = useEditorUiStore((s) => s.setKonvaLiveLayout);
  const clearKonvaLiveLayouts = useEditorUiStore((s) => s.clearKonvaLiveLayouts);
  const setKonvaSnapGuides = useEditorUiStore((s) => s.setKonvaSnapGuides);
  const clearKonvaSnapGuides = useEditorUiStore((s) => s.clearKonvaSnapGuides);

  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Group | null>>({});
  const dragStartPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const marqueeRef = useRef<{ startX: number; startY: number } | null>(null);

  const [marquee, setMarquee] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [hoveredClipId, setHoveredClipId] = useState<string | null>(null);
  const allActiveClips = useMemo(() => {
    if (!composition) return [] as Clip[];
    const all = [
      ...composition.tracks.background,
      ...composition.tracks.text,
      ...composition.tracks.overlay,
    ];
    return all.filter((c) => isActive(c, currentTime));
  }, [composition, currentTime]);

  /** Konva : médias / stickers uniquement — le texte est en DOM (StudioTextClipLayer). */
  const mediaClips = useMemo(
    () => allActiveClips.filter((c) => !isTextClip(c)),
    [allActiveClips]
  );

  const layouts = useMemo(
    () => allActiveClips.map((c) => getClipLayout(c, width, height)),
    [allActiveClips, width, height]
  );

  const applySelection = useCallback(
    (ids: string[]) => {
      setKonvaSelectedIds(ids);
      setSelectedClip(ids.length > 0 ? ids[ids.length - 1] : null);
      if (!ids.length) {
        useEditorUiStore.getState().setKonvaFocusedTextClipId(null);
      }
    },
    [setKonvaSelectedIds, setSelectedClip]
  );

  useEffect(() => {
    if (selectedClipId && !konvaSelectedIds.includes(selectedClipId)) {
      setKonvaSelectedIds([selectedClipId]);
    }
  }, [selectedClipId, konvaSelectedIds, setKonvaSelectedIds]);

  const syncTransformer = useCallback(() => {
    const tr = transformerRef.current;
    const layer = tr?.getLayer();
    if (!tr || !layer) return;
    const nodes = konvaSelectedIds
      .filter((id) => {
        const clip = mediaClips.find((c) => c.id === id);
        return clip && !isDomMediaClip(clip);
      })
      .map((id) => nodeRefs.current[id])
      .filter((n): n is Konva.Group => Boolean(n));
    tr.nodes(nodes);
    tr.moveToTop();
    layer.batchDraw();
  }, [konvaSelectedIds, mediaClips]);

  useLayoutEffect(() => {
    syncTransformer();
    const raf = requestAnimationFrame(syncTransformer);
    return () => cancelAnimationFrame(raf);
  }, [syncTransformer, mediaClips, width, height]);

  const singleSelection = konvaSelectedIds.length === 1;


  useEffect(() => {
    if (!interactive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (konvaSelectedIds.length === 0) return;
        e.preventDefault();
        saveToHistory();
        for (const id of konvaSelectedIds) removeClip(id);
        applySelection([]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [interactive, konvaSelectedIds, removeClip, saveToHistory, applySelection]);

  const snapDrag = useCallback(
    (clipId: string, centerX: number, centerY: number, showGuides = true) => {
      const moving = layouts.find((l) => l.clipId === clipId);
      if (!moving) return { x: centerX, y: centerY };
      const others = layouts.filter((l) => l.clipId !== clipId);
      const result = snapClipCenter(
        centerX,
        centerY,
        moving,
        others,
        width,
        height,
        snapEnabled
      );
      if (showGuides) {
        setKonvaSnapGuides(result.guides);
      }
      return { x: result.x, y: result.y };
    },
    [layouts, width, height, snapEnabled, setKonvaSnapGuides]
  );

  const handleClipDragStart = useCallback(() => {
    saveToHistory();
    const positions: Record<string, { x: number; y: number }> = {};
    for (const id of konvaSelectedIds) {
      const node = nodeRefs.current[id];
      if (node) positions[id] = { x: node.x(), y: node.y() };
    }
    dragStartPositionsRef.current = positions;
  }, [konvaSelectedIds, saveToHistory]);

  const publishLiveLayout = useCallback(
    (id: string) => {
      const node = nodeRefs.current[id];
      if (!node) return;
      setKonvaLiveLayout(id, {
        centerX: node.x(),
        centerY: node.y(),
        rotation: node.rotation(),
      });
    },
    [setKonvaLiveLayout]
  );

  const handleClipDragMove = useCallback(
    (clipId: string, centerX: number, centerY: number) => {
      const snapped = snapDrag(clipId, centerX, centerY);
      const node = nodeRefs.current[clipId];
      if (!node) return;

      const start = dragStartPositionsRef.current[clipId];
      if (!start || konvaSelectedIds.length <= 1) {
        node.position({ x: snapped.x, y: snapped.y });
        publishLiveLayout(clipId);
        return;
      }

      const dx = snapped.x - start.x;
      const dy = snapped.y - start.y;
      node.position({ x: snapped.x, y: snapped.y });
      publishLiveLayout(clipId);

      for (const id of konvaSelectedIds) {
        if (id === clipId) continue;
        const other = nodeRefs.current[id];
        const otherStart = dragStartPositionsRef.current[id];
        if (!other || !otherStart) continue;
        other.position({ x: otherStart.x + dx, y: otherStart.y + dy });
        publishLiveLayout(id);
      }
    },
    [konvaSelectedIds, snapDrag, publishLiveLayout]
  );

  const handleClipDragEnd = useCallback(
    (clipId: string, centerX: number, centerY: number) => {
      const snapped = snapDrag(clipId, centerX, centerY, false);
      const start = dragStartPositionsRef.current[clipId];
      const dx = start ? snapped.x - start.x : 0;
      const dy = start ? snapped.y - start.y : 0;

      const idsToMove =
        konvaSelectedIds.length > 1 && konvaSelectedIds.includes(clipId)
          ? konvaSelectedIds
          : [clipId];

      for (const id of idsToMove) {
        const node = nodeRefs.current[id];
        if (!node) continue;
        const base = dragStartPositionsRef.current[id] ?? { x: node.x(), y: node.y() };
        const cx = konvaSelectedIds.length > 1 ? base.x + dx : snapped.x;
        const cy = konvaSelectedIds.length > 1 ? base.y + dy : snapped.y;
        updateClip(id, {
          x: pxToPct(cx, width),
          y: pxToPct(cy, height),
        });
      }
      dragStartPositionsRef.current = {};
      clearKonvaLiveLayouts();
      clearKonvaSnapGuides();
    },
    [
      clearKonvaLiveLayouts,
      clearKonvaSnapGuides,
      konvaSelectedIds,
      snapDrag,
      updateClip,
      width,
      height,
    ]
  );

  if (!composition || width < 8 || height < 8) return null;

  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={(e) => {
        if (!interactive) return;
        const stage = e.target.getStage();
        if (!stage) return;

        if (e.target !== stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        marqueeRef.current = { startX: pos.x, startY: pos.y };
        setMarquee({ x: pos.x, y: pos.y, w: 0, h: 0 });
        if (!e.evt.shiftKey) applySelection([]);
        setHoveredClipId(null);
        clearKonvaSnapGuides();
      }}
      onMouseMove={(e) => {
        if (!marqueeRef.current) return;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;
        const { startX, startY } = marqueeRef.current;
        setMarquee({
          x: Math.min(startX, pos.x),
          y: Math.min(startY, pos.y),
          w: Math.abs(pos.x - startX),
          h: Math.abs(pos.y - startY),
        });
      }}
      onMouseUp={(e) => {
        if (!marqueeRef.current) return;
        const box = marquee;
        marqueeRef.current = null;
        setMarquee(null);
        clearKonvaSnapGuides();
        if (!box || box.w < 4 || box.h < 4) return;

        const hitIds = layouts
          .filter((l) => {
            const intersects =
              l.right >= box.x &&
              l.left <= box.x + box.w &&
              l.bottom >= box.y &&
              l.top <= box.y + box.h;
            return intersects;
          })
          .map((l) => l.clipId);

        if (hitIds.length > 0) {
          applySelection(
            e.evt.shiftKey
              ? Array.from(new Set([...konvaSelectedIds, ...hitIds]))
              : hitIds
          );
        }
      }}
      listening={interactive}
    >
      <Layer>
        <Line
          points={[centerX, 0, centerX, height]}
          stroke="rgba(56,189,248,0.2)"
          strokeWidth={1}
          listening={false}
        />
        <Line
          points={[0, centerY, width, centerY]}
          stroke="rgba(56,189,248,0.2)"
          strokeWidth={1}
          listening={false}
        />

        <KonvaSnapGuidesLayer canvasWidth={width} canvasHeight={height} />

        {mediaClips.map((clip) => (
          <StudioKonvaClipNode
            key={clip.id}
            clip={clip}
            stageWidth={width}
            stageHeight={height}
            interactive={interactive && !isDomMediaClip(clip)}
            selected={konvaSelectedIds.includes(clip.id)}
            hovered={hoveredClipId === clip.id}
            bindRef={(node) => {
              nodeRefs.current[clip.id] = node;
            }}
            onHoverStart={() => setHoveredClipId(clip.id)}
            onHoverEnd={() =>
              setHoveredClipId((current) => (current === clip.id ? null : current))
            }
            onSelect={(additive) => {
              const current = useEditorUiStore.getState().konvaSelectedIds;
              if (additive) {
                const has = current.includes(clip.id);
                const next = has
                  ? current.filter((id) => id !== clip.id)
                  : [...current, clip.id];
                applySelection(next.length > 0 ? next : [clip.id]);
                return;
              }
              applySelection([clip.id]);
            }}
            onTransformStart={() => {
              saveToHistory();
            }}
            onDragStart={handleClipDragStart}
            onDragMove={(cx, cy) => handleClipDragMove(clip.id, cx, cy)}
            onDragEnd={(cx, cy) => handleClipDragEnd(clip.id, cx, cy)}
            onLiveLayoutChange={(live) => setKonvaLiveLayout(clip.id, live)}
            onLiveLayoutClear={() => setKonvaLiveLayout(clip.id, null)}
            onCommit={(patch) => {
              updateClip(clip.id, patch);
              setKonvaLiveLayout(clip.id, null);
            }}
          />
        ))}

        {marquee && (
          <Rect
            x={marquee.x}
            y={marquee.y}
            width={marquee.w}
            height={marquee.h}
            fill="rgba(34,211,238,0.12)"
            stroke="#22d3ee"
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
        )}

        <Transformer
          ref={transformerRef}
          rotateEnabled={singleSelection}
          enabledAnchors={singleSelection ? [...MEDIA_TRANSFORM_ANCHORS] : []}
          borderStroke="#22d3ee"
          borderStrokeWidth={1}
          anchorStroke="#22d3ee"
          anchorFill="#ffffff"
          anchorSize={10}
          anchorCornerRadius={5}
          padding={4}
          rotateAnchorOffset={28}
          ignoreStroke
          shouldOverdrawWholeArea={false}
          centeredScaling={false}
          flipEnabled={false}
          keepRatio={singleSelection}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 24 || newBox.height < 16) return oldBox;
            return newBox;
          }}
          anchorStyleFunc={styleKonvaTransformerAnchor}
          onTransformStart={() => {
            saveToHistory();
          }}
          onTransformEnd={() => {
            clearKonvaSnapGuides();
            clearKonvaLiveLayouts();
          }}
        />
      </Layer>
    </Stage>
  );
}
