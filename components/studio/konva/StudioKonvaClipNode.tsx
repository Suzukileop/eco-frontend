'use client';

import { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text, Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import type { Clip } from '@/types/composition';
import {
  getClipLayout,
  pxToPct,
  type KonvaLiveClipLayout,
} from '@/lib/studio/konva/clipLayout';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { applyKonvaMediaFrame } from '@/lib/studio/konva/konvaClipFrame';
import {
  applyCssFilterToImage,
  resolveMediaFilterCss,
} from '@/lib/studio/mediaFilterPresets';
import {
  buildCenteredNativeMediaLayout,
  containedMediaSizePx,
} from '@/lib/studio/mediaDimensions';

function useHtmlImage(url?: string, filterPreset?: string): HTMLImageElement | null {
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [displayImg, setDisplayImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!url) {
      setBaseImg(null);
      return;
    }
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    image.onload = () => setBaseImg(image);
    image.onerror = () => setBaseImg(null);
  }, [url]);

  useEffect(() => {
    if (!baseImg) {
      setDisplayImg(null);
      return;
    }
    const css = resolveMediaFilterCss(filterPreset);
    if (!css) {
      setDisplayImg(baseImg);
      return;
    }
    let cancelled = false;
    void applyCssFilterToImage(baseImg, css).then((img) => {
      if (!cancelled) setDisplayImg(img);
    });
    return () => {
      cancelled = true;
    };
  }, [baseImg, filterPreset]);

  return displayImg;
}

export interface TransformSession {
  anchorName: string;
  startWidth: number;
  startHeight: number;
  startFont: number;
}

export interface StudioKonvaClipNodeProps {
  clip: Clip;
  stageWidth: number;
  stageHeight: number;
  interactive: boolean;
  selected: boolean;
  hovered: boolean;
  bindRef: (node: Konva.Group | null) => void;
  onSelect: (additive: boolean) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onTransformStart: (session: TransformSession | null) => void;
  onDragStart: () => void;
  onDragMove: (centerX: number, centerY: number) => void;
  onDragEnd: (centerX: number, centerY: number) => void;
  onLiveLayoutChange?: (layout: KonvaLiveClipLayout) => void;
  onLiveLayoutClear?: () => void;
  onCommit: (patch: Partial<Clip>) => void;
}

/** Nœud Konva pour médias / stickers — le texte est géré par TextZoneClip (DOM). */
export function StudioKonvaClipNode({
  clip,
  stageWidth,
  stageHeight,
  interactive,
  selected,
  hovered: _hovered, // eslint-disable-line @typescript-eslint/no-unused-vars
  bindRef,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onTransformStart,
  onDragStart,
  onDragMove,
  onDragEnd,
  onLiveLayoutChange,
  onLiveLayoutClear,
  onCommit,
}: StudioKonvaClipNodeProps) {
  const ref = useRef<Konva.Group>(null);
  const image = useHtmlImage(clip.url, clip.filterPreset);

  const liveLayout = useEditorUiStore((s) => s.konvaLiveLayouts[clip.id]);
  const layout = getClipLayout(clip, stageWidth, stageHeight);
  const boxWidth = layout.width;
  const boxHeight = layout.height;
  const centerX = liveLayout?.centerX ?? layout.centerX;
  const centerY = liveLayout?.centerY ?? layout.centerY;
  const displayWidth = liveLayout?.width ?? boxWidth;
  const displayHeight = liveLayout?.height ?? boxHeight;
  const rotation = liveLayout?.rotation ?? clip.mediaRotation ?? 0;
  const naturalW = clip.mediaNaturalWidth ?? image?.naturalWidth ?? 0;
  const naturalH = clip.mediaNaturalHeight ?? image?.naturalHeight ?? 0;
  const contained = containedMediaSizePx(
    displayWidth,
    displayHeight,
    naturalW,
    naturalH
  );

  useEffect(() => {
    bindRef(ref.current);
    return () => bindRef(null);
  }, [bindRef]);

  useEffect(() => {
    if (!image) return;
    const nw = image.naturalWidth;
    const nh = image.naturalHeight;
    if (nw <= 0 || nh <= 0) return;
    if (clip.mediaNaturalWidth && clip.mediaNaturalHeight) return;
    onCommit(
      buildCenteredNativeMediaLayout(nw, nh, stageWidth, stageHeight)
    );
  }, [image, clip.mediaNaturalWidth, clip.mediaNaturalHeight, onCommit, stageWidth, stageHeight]);

  const handleTransformStart = () => {
    onTransformStart({
      anchorName: '',
      startWidth: boxWidth,
      startHeight: boxHeight,
      startFont: 0,
    });
  };

  const publishLiveLayout = () => {
    const node = ref.current;
    if (!node || !onLiveLayoutChange) return;
    onLiveLayoutChange({
      centerX: node.x(),
      centerY: node.y(),
      rotation: node.rotation(),
      width: boxWidth * node.scaleX(),
      height: boxHeight * node.scaleY(),
    });
  };

  const handleTransformEnd = () => {
    const node = ref.current;
    if (!node) return;

    const rot = node.rotation();
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const nx = pxToPct(node.x(), stageWidth);
    const ny = pxToPct(node.y(), stageHeight);
    const newW = Math.max(24, boxWidth * scaleX);
    const newH = Math.max(16, boxHeight * scaleY);

    applyKonvaMediaFrame(node, newW, newH);
    onCommit({
      x: nx,
      y: ny,
      boxWidthPct: pxToPct(newW, stageWidth),
      mediaRotation: rot,
    });
    onLiveLayoutClear?.();
  };

  return (
    <Group
      ref={ref}
      name={clip.id}
      x={centerX}
      y={centerY}
      rotation={rotation}
      opacity={1}
      draggable={interactive && selected}
      onDragStart={(e) => {
        e.cancelBubble = true;
        onDragStart();
      }}
      onDragMove={(e) => onDragMove(e.target.x(), e.target.y())}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformStart={handleTransformStart}
      onTransform={publishLiveLayout}
      onTransformEnd={handleTransformEnd}
    >
      {image ? (
        <KonvaImage
          image={image}
          x={-contained.width / 2}
          y={-contained.height / 2}
          width={contained.width}
          height={contained.height}
          listening={false}
        />
      ) : (
        <Rect
          name="frame"
          x={-boxWidth / 2}
          y={-boxHeight / 2}
          width={boxWidth}
          height={boxHeight}
          fill="rgba(17,24,39,0.82)"
          stroke={selected ? 'transparent' : 'rgba(255,255,255,0.22)'}
          strokeWidth={selected ? 0 : 1}
          cornerRadius={4}
          listening={false}
        />
      )}
      <Text
        x={-boxWidth / 2}
        y={-12}
        width={boxWidth}
        text={clip.type === 'sticker' ? clip.content ?? 'Sticker' : clip.sequenceLabel ?? 'Clip'}
        fill="#ffffff"
        fontSize={12}
        align="center"
        listening={false}
      />
      <Rect
        name="hit"
        x={-boxWidth / 2}
        y={-boxHeight / 2}
        width={displayWidth}
        height={displayHeight}
        fill="rgba(0,0,0,0.002)"
        listening={interactive}
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect(Boolean(e.evt.shiftKey));
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect(false);
        }}
        onMouseEnter={() => onHoverStart()}
        onMouseLeave={() => onHoverEnd()}
      />
    </Group>
  );
}
