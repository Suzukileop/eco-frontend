'use client';

import { useCallback, useMemo } from 'react';
import type { Clip } from '@/types/composition';
import { useCompositionStore } from '@/stores/compositionStore';
import {
  MovableCanvasZone,
  defaultOverlayBoxWidthPct,
  type CanvasDragGuide,
} from '@/components/editor/MovableCanvasZone';
import { MediaRotationHandle } from '@/components/editor/MediaRotationHandle';
import { resolveMediaAspectRatio, isDomMediaClip } from '@/lib/studio/mediaDimensions';
import { getLane0Clips, getClipBackgroundLane } from '@/lib/backgroundLanes';
import { getClipOverlayLane } from '@/lib/overlayLanes';
import { buildOverlayContentStyle } from '@/lib/previewTextLayout';
import { useEditorUiStore } from '@/stores/editorUiStore';

function mediaAspectStyle(clip: Clip): { aspectRatio: string } {
  const ratio = resolveMediaAspectRatio(clip);
  const nw = clip.mediaNaturalWidth ?? Math.round(ratio * 1000);
  const nh = clip.mediaNaturalHeight ?? 1000;
  return { aspectRatio: `${nw} / ${nh}` };
}

function isClipActive(clip: Clip, currentTime: number): boolean {
  return clip.startTime <= currentTime && clip.endTime > currentTime;
}

function getLaneIndexForClip(trackType: 'background' | 'overlay', clip: Clip): number {
  return trackType === 'background'
    ? getClipBackgroundLane(clip)
    : getClipOverlayLane(clip);
}

interface StudioOverlayHitZoneProps {
  clip: Clip;
  canvasWidth: number;
  canvasHeight: number;
  pointerScale: number;
  isSelected: boolean;
  isLaneLocked: boolean;
  stackIndex: number;
  onSelect: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragGuide: (guide: CanvasDragGuide) => void;
}

/** Overlay : affichage + sélection sur l’aperçu ; déplacement temporel uniquement via la timeline. */
function StudioOverlayHitZone({
  clip,
  isSelected,
  isLaneLocked,
  stackIndex,
  onSelect,
  onContextMenu,
}: StudioOverlayHitZoneProps) {
  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? 50;
  const boxWidthPct = clip.boxWidthPct ?? defaultOverlayBoxWidthPct(clip.content);
  const overlayStyle = buildOverlayContentStyle(clip);
  const zIndex = isSelected ? 38 : 24 + stackIndex;

  return (
    <div
      data-canvas-zone
      className={`pointer-events-auto rounded-sm ${
        isSelected
          ? 'ring-2 ring-cyan-400 ring-offset-0 ring-offset-transparent'
          : ''
      }`}
      style={{
        position: 'absolute',
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: 'translate(-50%, -50%)',
        width: `${boxWidthPct}%`,
        minWidth: 8,
        zIndex,
        cursor: isLaneLocked ? 'not-allowed' : 'pointer',
      }}
      onMouseDown={(e) => {
        if (isLaneLocked) return;
        e.preventDefault();
        e.stopPropagation();
        onSelect();
      }}
      onContextMenu={onContextMenu}
    >
      <div style={overlayStyle}>{(clip.content ?? '').trim() || '\u00A0'}</div>
    </div>
  );
}

interface StudioMediaChromeProps {
  clip: Clip;
  canvasWidth: number;
  canvasHeight: number;
  pointerScale: number;
  isSelected: boolean;
  isLaneLocked: boolean;
  zIndex: number;
  onSelect: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragGuide: (guide: CanvasDragGuide) => void;
}

function StudioMediaChrome({
  clip,
  canvasWidth,
  canvasHeight,
  pointerScale,
  isSelected,
  isLaneLocked,
  zIndex,
  onSelect,
  onContextMenu,
  onDragGuide,
}: StudioMediaChromeProps) {
  const { updateClip, saveToHistory } = useCompositionStore();
  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? 50;
  const boxWidthPct = clip.boxWidthPct ?? 100;
  const mediaRotation = clip.mediaRotation ?? 0;
  const scalePct = Math.round((clip.mediaScale ?? 1) * 100);

  if (!isSelected) return null;

  return (
    <MovableCanvasZone
      xPct={xPct}
      yPct={yPct}
      boxWidthPct={boxWidthPct}
      fontSize={scalePct}
      rotationDeg={mediaRotation}
      isSelected
      disabled={isLaneLocked}
      canvasWidth={canvasWidth}
      canvasHeight={canvasHeight}
      pointerScale={pointerScale}
      zIndex={zIndex}
      zIndexWhenSelected={zIndex + 8}
      ringSelectedClass="ring-2 ring-cyan-400 ring-offset-0 ring-offset-transparent"
      clipChildren
      handleLayout="capcut"
      minBoxWidthPct={8}
      minWidthPx={24}
      minFontSize={15}
      maxFontSize={500}
      resizeMode="frame"
      overflowVisible
      freeTransform
      maxBoxWidthPct={280}
      selectionAddon={
        !isLaneLocked ? (
          <MediaRotationHandle
            rotation={mediaRotation}
            disabled={isLaneLocked}
            onInteractionStart={saveToHistory}
            onRotationChange={(deg) => updateClip(clip.id, { mediaRotation: deg })}
          />
        ) : undefined
      }
      onSelect={onSelect}
      onContextMenu={onContextMenu}
      onDragGuide={onDragGuide}
      onPositionChange={(x, y) => updateClip(clip.id, { x, y })}
      onResize={(w) => updateClip(clip.id, { boxWidthPct: w })}
    >
      <div className="relative h-full w-full" style={mediaAspectStyle(clip)} aria-hidden />
    </MovableCanvasZone>
  );
}

interface StudioMediaSelectZoneProps {
  clip: Clip;
  isSelected: boolean;
  isLaneLocked: boolean;
  zIndex: number;
  onSelect: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

/** Zone cliquable sur le média (sélection en un clic, sans bloquer le cadre bleu). */
function StudioMediaSelectZone({
  clip,
  isSelected,
  isLaneLocked,
  zIndex,
  onSelect,
  onContextMenu,
}: StudioMediaSelectZoneProps) {
  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? 50;
  const boxWidthPct = clip.boxWidthPct ?? 100;
  const mediaRotation = clip.mediaRotation ?? 0;
  const zoneTransform =
    mediaRotation !== 0
      ? `translate(-50%, -50%) rotate(${mediaRotation}deg)`
      : 'translate(-50%, -50%)';

  if (isSelected) return null;

  return (
    <div
      data-canvas-zone
      className="pointer-events-auto absolute cursor-grab"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: zoneTransform,
        zIndex,
        width: `${boxWidthPct}%`,
        minWidth: 24,
        touchAction: 'none',
      }}
      onMouseDown={(e) => {
        if (isLaneLocked) return;
        e.preventDefault();
        e.stopPropagation();
        onSelect();
      }}
      onContextMenu={(e) => {
        if (isLaneLocked || !onContextMenu) return;
        e.preventDefault();
        e.stopPropagation();
        onSelect();
        onContextMenu(e);
      }}
    >
      <div
        className="relative w-full rounded-sm"
        style={mediaAspectStyle(clip)}
        aria-hidden
      />
    </div>
  );
}

export interface StudioCanvasOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  pointerScale: number;
  interactive: boolean;
  onDragGuide: (guide: CanvasDragGuide) => void;
  onContextMenu: (clipId: string, e: MouseEvent) => void;
}

export function StudioCanvasOverlay({
  canvasWidth,
  canvasHeight,
  pointerScale,
  interactive,
  onDragGuide,
  onContextMenu,
}: StudioCanvasOverlayProps) {
  const {
    composition,
    currentTime,
    laneHidden,
    laneLocked,
    selectedClipId,
    setSelectedClip,
  } = useCompositionStore();

  const bgClips = useMemo(
    () => composition?.tracks.background ?? [],
    [composition?.tracks.background]
  );
  const overlayClips = useMemo(
    () => composition?.tracks.overlay ?? [],
    [composition?.tracks.overlay]
  );

  const isLaneVisible = useCallback(
    (trackType: 'background' | 'overlay', clip: Clip) => {
      const laneIdx = getLaneIndexForClip(trackType, clip);
      return !(laneHidden[`${trackType}-${laneIdx}`] ?? false);
    },
    [laneHidden]
  );

  const activeBgClips = useMemo(
    () =>
      bgClips.filter(
        (c) =>
          isClipActive(c, currentTime) &&
          isLaneVisible('background', c) &&
          isDomMediaClip(c)
      ),
    [bgClips, currentTime, isLaneVisible]
  );

  const activeOverlayClips = useMemo(
    () =>
      overlayClips.filter(
        (c) =>
          isClipActive(c, currentTime) && isLaneVisible('overlay', c)
      ),
    [overlayClips, currentTime, isLaneVisible]
  );

  const bgLaneLocked = useCallback(
    (clip: Clip) => {
      const idx = getClipBackgroundLane(clip);
      return laneLocked[`background-${idx}`] ?? false;
    },
    [laneLocked]
  );

  const overlayLaneLocked = useCallback(
    (clip: Clip) => {
      const idx = getClipOverlayLane(clip);
      return laneLocked[`overlay-${idx}`] ?? false;
    },
    [laneLocked]
  );

  if (!interactive || canvasWidth < 8 || canvasHeight < 8 || !composition) {
    return null;
  }

  const ctx = (clipId: string, locked: boolean) =>
    locked
      ? undefined
      : (e: React.MouseEvent) => onContextMenu(clipId, e.nativeEvent);

  const lane0 = getLane0Clips(bgClips);

  return (
    <>
      {activeBgClips.map((clip, idx) => {
        const locked = bgLaneLocked(clip);
        const isSelected = selectedClipId === clip.id;
        const z = 10 + idx;
        const onSelect = () => {
          setSelectedClip(clip.id);
          useEditorUiStore.getState().setKonvaSelectedIds([clip.id]);
          useCompositionStore.getState().requestEditorPanelTab(
            clip.type === 'video' ? 'VIDÉO' : 'IMAGE'
          );
        };
        return (
          <div key={clip.id}>
            <StudioMediaSelectZone
              clip={clip}
              isSelected={isSelected}
              isLaneLocked={locked}
              zIndex={z}
              onSelect={onSelect}
              onContextMenu={ctx(clip.id, locked)}
            />
            <StudioMediaChrome
              clip={clip}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              pointerScale={pointerScale}
              isSelected={isSelected}
              isLaneLocked={locked}
              zIndex={z}
              onSelect={onSelect}
              onContextMenu={ctx(clip.id, locked)}
              onDragGuide={onDragGuide}
            />
          </div>
        );
      })}

      {activeOverlayClips.map((clip, stackIndex) => (
        <StudioOverlayHitZone
          key={clip.id}
          clip={clip}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          pointerScale={pointerScale}
          isSelected={selectedClipId === clip.id}
          isLaneLocked={overlayLaneLocked(clip)}
          stackIndex={stackIndex}
          onSelect={() => {
            setSelectedClip(clip.id);
            useEditorUiStore.getState().setKonvaSelectedIds([clip.id]);
            useCompositionStore.getState().requestEditorPanelTab('OV');
          }}
          onContextMenu={ctx(clip.id, overlayLaneLocked(clip))}
          onDragGuide={onDragGuide}
        />
      ))}

      {lane0.length > 0 && (
        <div
          className="pointer-events-none absolute top-2 left-2 z-[40] rounded bg-black/40 px-2 py-0.5 text-[10px] text-white/80"
          aria-hidden
        >
          {lane0[0]?.sequenceLabel ?? 'Séquence'}
        </div>
      )}
    </>
  );
}
