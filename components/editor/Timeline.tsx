'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Clip, TrackType } from '@/types/composition';
import {
  buildBackgroundLanesForTimeline,
  getClipBackgroundLane,
  getLane0Clips,
  type BackgroundTimelineLane,
  PRIMARY_BACKGROUND_LANE,
} from '@/lib/backgroundLanes';
import {
  buildTextLanesForTimeline,
  getClipTextLane,
  type TextTimelineLane,
  PRIMARY_TEXT_LANE,
} from '@/lib/textLanes';
import {
  buildOverlayLanesForTimeline,
  getClipOverlayLane,
  type OverlayTimelineLane,
  PRIMARY_OVERLAY_LANE,
} from '@/lib/overlayLanes';
import {
  buildAudioLanesForTimeline,
  getClipAudioLane,
  type AudioTimelineLane,
  PRIMARY_AUDIO_LANE,
} from '@/lib/audioLanes';
import {
  buildVoiceoverLanesForTimeline,
  getClipVoiceoverLane,
  type VoiceoverTimelineLane,
  PRIMARY_VOICEOVER_LANE,
} from '@/lib/voiceoverLanes';
import {
  buildBackgroundDragPreview,
  clampBackgroundDragPointer,
  resolveBackgroundLaneForDrag,
  type BackgroundDragGhost,
  type BackgroundDragPreview,
} from '@/lib/timelineBackgroundDrag';
import {
  buildTextDragPreview,
  clampTextDragPointer,
  resolveTextLaneForDrag,
  type TextDragGhost,
  type TextDragPreview,
} from '@/lib/timelineTextDrag';
import {
  buildOverlayDragPreview,
  clampOverlayDragPointer,
  resolveOverlayLaneForDrag,
  type OverlayDragGhost,
  type OverlayDragPreview,
} from '@/lib/timelineOverlayDrag';
import {
  buildAudioDragPreview,
  clampAudioDragPointer,
  resolveAudioLaneForDrag,
  type AudioDragGhost,
  type AudioDragPreview,
} from '@/lib/timelineAudioDrag';
import {
  buildVoiceoverDragPreview,
  clampVoiceoverDragPointer,
  resolveVoiceoverLaneForDrag,
  type VoiceoverDragGhost,
  type VoiceoverDragPreview,
} from '@/lib/timelineVoiceoverDrag';
import { useCompositionStore } from '@/stores/compositionStore';
import { TransitionMarker } from '@/components/editor/TransitionMarker';
import { findLane0Junctions } from '@/lib/transitionApply';
import { AudioWaveform } from '@/components/editor/AudioWaveform';
import {
  IconLock,
  IconUnlock,
  IconEye,
  IconEyeOff,
  IconVolume,
  IconVolumeMute,
  IconClipDiamond,
  IconClipText,
  IconClipFilm,
  IconClipMusic,
  IconClipMic,
} from '@/components/editor/TimelineIcons';
import { CapCutContextMenu } from '@/components/editor/CapCutContextMenu';
import { buildTimelineClipMenuItems } from '@/lib/timelineClipMenu';
import { buildTimelinePasteOnlyMenu } from '@/lib/timelinePasteMenu';
import { TimelineTrimHandle } from '@/components/editor/TimelineTrimHandle';
import {
  TIMELINE_LIGHT,
  CLIP_DROP_TRACE,
  CLIP_SELECTION,
  LANE_GAP,
  LABEL_COL_WIDTH,
  TRIM_JUNCTION_INSET_PX,
  RULER_HEIGHT,
  PLAYHEAD,
  getClipStyleForTrack,
  getClipIconWidth,
  getLaneHeight,
  getLaneClipInsetY,
  getLaneDragStep,
  getBackgroundLaneDragStep,
  isCompactLane,
  LANE_HEADER_LABEL_WIDTH,
  LANE_HEADER_BTN_PX,
  trackSupportsLaneMute,
  laneStripBackground,
  type ClipTrackStyle,
} from '@/lib/timelineTheme';

// ──────────────────────────────────────────────────────────────────────────────
// Track type metadata — CapCut order: overlay → text → background → audio → voiceover
// ──────────────────────────────────────────────────────────────────────────────

const TRACK_ORDER: TrackType[] = ['overlay', 'text', 'background', 'audio', 'voiceover'];

const TRACK_INFO: Record<TrackType, { short: string; long: string }> = {
  overlay: { short: 'OV', long: 'Overlay' },
  text: { short: 'T', long: 'Texte' },
  background: { short: 'V', long: 'Vidéo' },
  audio: { short: 'A', long: 'Audio' },
  voiceover: { short: 'VO', long: 'Voix off' },
};

// ──────────────────────────────────────────────────────────────────────────────
// Lane allocation — greedy: assign each clip to the first lane where no other
// clip overlaps in time. Overlapping clips end up in separate lanes (CapCut
// "vertical stacking" behavior).
// ──────────────────────────────────────────────────────────────────────────────

interface Lane {
  index: number;
  clips: Clip[];
  isPreview?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Time formatting (MM:SS or HH:MM:SS, with frame ticks at high zoom)
// ──────────────────────────────────────────────────────────────────────────────

function formatRulerTime(t: number): string {
  const hours = Math.floor(t / 3600);
  const minutes = Math.floor((t % 3600) / 60);
  const seconds = Math.floor(t % 60);
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Context menu
// ──────────────────────────────────────────────────────────────────────────────

type LaneManagedTrack = 'background' | 'text' | 'overlay' | 'audio' | 'voiceover';
type LaneDragPreview =
  | BackgroundDragPreview
  | TextDragPreview
  | OverlayDragPreview
  | AudioDragPreview
  | VoiceoverDragPreview;
type LaneDragGhost =
  | BackgroundDragGhost
  | TextDragGhost
  | OverlayDragGhost
  | AudioDragGhost
  | VoiceoverDragGhost;

interface CtxMenu {
  x: number;
  y: number;
  clipId?: string;
  backgroundLane?: number;
  textLane?: number;
  overlayLane?: number;
  audioLane?: number;
  voiceoverLane?: number;
  laneTrackType?: LaneManagedTrack;
  /** Temps sur le clip au clic droit (pour Diviser). */
  splitTimeAtPointer?: number;
}

function ClipContextMenu({ menu, onClose }: { menu: CtxMenu; onClose: () => void }) {
  const items =
    menu.clipId != null
      ? buildTimelineClipMenuItems(
          menu.clipId,
          menu.splitTimeAtPointer,
          onClose
        )
      : buildTimelinePasteOnlyMenu(
          menu.laneTrackType ?? 'background',
          menu.backgroundLane ??
            menu.textLane ??
            menu.overlayLane ??
            menu.audioLane ??
            menu.voiceoverLane ??
            0,
          onClose
        );
  return (
    <CapCutContextMenu
      anchorX={menu.x}
      anchorY={menu.y}
      items={items}
      onClose={onClose}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Single clip block
// ──────────────────────────────────────────────────────────────────────────────

export type { BackgroundDragPreview };

/** Miniature qui suit le curseur partout (preview / canvas / timeline). */
function TimelineLaneDragGhost({
  clip,
  ghost,
  trackType,
}: {
  clip: Clip;
  ghost: LaneDragGhost;
  trackType: LaneManagedTrack;
}) {
  const style = getClipStyleForTrack(trackType);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none overflow-hidden rounded-md"
      style={{
        position: 'fixed',
        left: ghost.clientX - ghost.grabDx,
        top: ghost.clientY - ghost.grabDy,
        width: ghost.width,
        height: ghost.height,
        zIndex: 10000,
        borderWidth: CLIP_SELECTION.borderWidthPx,
        borderStyle: 'solid',
        borderColor: CLIP_SELECTION.borderColor,
        borderRadius: CLIP_SELECTION.borderRadiusPx,
        backgroundColor: style.bgColor,
        opacity: 0.94,
        boxShadow: '0 10px 24px rgba(15,23,42,0.32)',
        transform: 'scale(1.02)',
      }}
      aria-hidden
    >
      {clip.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={clip.thumbnail}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>,
    document.body
  );
}

/** Ombre CapCut : cadre en pointillés à la position de dépôt. */
function TimelineLaneDropTrace({
  clip,
  traceStart,
  traceEnd,
  pps,
  trackType,
}: {
  clip: Clip;
  traceStart: number;
  traceEnd: number;
  pps: number;
  trackType: LaneManagedTrack;
}) {
  const left = traceStart * pps;
  const width = Math.max(12, (traceEnd - traceStart) * pps);
  const style = getClipStyleForTrack(trackType);
  const label =
    trackType === 'text'
      ? (clip.content ?? 'Texte').slice(0, 48)
      : trackType === 'overlay'
        ? (clip.content ?? clip.sequenceLabel ?? 'Overlay').slice(0, 48)
        : trackType === 'audio'
          ? (clip.sequenceLabel ??
              (clip.url ? clip.url.split('/').pop()?.slice(0, 24) : 'Audio'))
          : trackType === 'voiceover'
            ? (clip.content ?? clip.sequenceLabel ?? 'Voix off').slice(0, 48)
            : clip.sequenceLabel ??
              (clip.url ? clip.url.split('/').pop()?.slice(0, 24) : 'Média');

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none overflow-hidden rounded-md"
      style={{
        left,
        width,
        zIndex: CLIP_DROP_TRACE.zIndex,
        borderWidth: CLIP_DROP_TRACE.borderWidthPx,
        borderStyle: 'dashed',
        borderColor: CLIP_DROP_TRACE.borderColor,
        borderRadius: CLIP_DROP_TRACE.borderRadiusPx,
        backgroundColor: CLIP_DROP_TRACE.fillColor,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
      }}
      aria-hidden
    >
      {clip.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={clip.thumbnail}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
      )}
      <div
        className="relative z-10 flex h-full min-w-0 items-center px-1.5"
        style={{ color: style.labelColor }}
      >
        <span className="truncate text-[10px] font-medium opacity-80">{label}</span>
      </div>
    </div>
  );
}

interface TimelineClipProps {
  clip: Clip;
  pps: number;
  trackType: TrackType;
  laneKey: string;
  clipLane?: number;
  laneDragPreview?: LaneDragPreview | null;
  onLaneDragStart?: (
    clip: Clip,
    e: React.MouseEvent,
    sourceLane: number,
    sourceRect: DOMRect
  ) => void;
  trimLeftInset?: number;
  trimRightInset?: number;
  onContextMenu: (
    clipId: string,
    x: number,
    y: number,
    splitTimeAtPointer: number
  ) => void;
}

function ClipTypeIcon({ trackType, className }: { trackType: TrackType; className: string }) {
  const iconProps = { width: 14, height: 14, className };
  switch (trackType) {
    case 'overlay':
      return <IconClipDiamond {...iconProps} />;
    case 'text':
      return <IconClipText {...iconProps} />;
    case 'background':
      return <IconClipFilm {...iconProps} />;
    case 'audio':
      return <IconClipMusic {...iconProps} />;
    case 'voiceover':
      return <IconClipMic {...iconProps} />;
    default:
      return null;
  }
}

function ClipIconBadge({
  trackType,
  style,
  iconWidth,
}: {
  trackType: TrackType;
  style: ClipTrackStyle;
  iconWidth: number;
}) {
  return (
    <div
      className="relative z-20 flex shrink-0 items-center justify-center"
      style={{
        width: iconWidth,
        backgroundColor: style.iconBadgeColor,
        color: style.iconColor,
      }}
      aria-hidden
    >
      <ClipTypeIcon trackType={trackType} className="" />
    </div>
  );
}

function TimelineClip({
  clip,
  pps,
  trackType,
  laneKey,
  clipLane = 0,
  laneDragPreview = null,
  onLaneDragStart,
  trimLeftInset = 0,
  trimRightInset = 0,
  onContextMenu,
}: TimelineClipProps) {
  const {
    selectedClipId,
    selectedClipIds,
    selectedClipTrackType,
    snapEnabled,
    laneLocked,
    setSelectedClip,
    toggleBackgroundClipSelection,
    toggleTextClipSelection,
    toggleOverlayClipSelection,
    toggleAudioClipSelection,
    toggleVoiceoverClipSelection,
    clearBackgroundClipSelection,
    clearTextClipSelection,
    clearOverlayClipSelection,
    clearAudioClipSelection,
    clearVoiceoverClipSelection,
    moveClip,
    resizeClip,
    saveToHistory,
    updateClip,
  } = useCompositionStore();

  const isLaneManagedTrack =
    trackType === 'background' ||
    trackType === 'text' ||
    trackType === 'overlay' ||
    trackType === 'audio' ||
    trackType === 'voiceover';
  const isInMultiSelect =
    isLaneManagedTrack &&
    selectedClipTrackType === trackType &&
    selectedClipIds.includes(clip.id);
  const isSelected = selectedClipId === clip.id || isInMultiSelect;
  const isLocked = laneLocked[laneKey] ?? false;

  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragStartTime = useRef<number>(0);

  const isDraggedClip = laneDragPreview?.clipId === clip.id;
  const hideWhileDragging = isLaneManagedTrack && isDraggedClip;

  const left = clip.startTime * pps;
  const width = Math.max(12, (clip.endTime - clip.startTime) * pps);

  const handleDragMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    if (isLocked) { setSelectedClip(clip.id); return; }
    if ((e.target as HTMLElement).dataset.resizeHandle) return;

    // Shift+click → multi-select toggle
    if (e.shiftKey && isLaneManagedTrack) {
      const store = useCompositionStore.getState();
      const sameTrack =
        store.selectedClipTrackType === trackType ||
        store.selectedClipIds.length === 0;
      if (
        sameTrack &&
        store.selectedClipId &&
        store.selectedClipTrackType === trackType &&
        !store.selectedClipIds.includes(store.selectedClipId)
      ) {
        if (trackType === 'background') {
          store.toggleBackgroundClipSelection(store.selectedClipId);
        } else if (trackType === 'text') {
          store.toggleTextClipSelection(store.selectedClipId);
        } else if (trackType === 'overlay') {
          store.toggleOverlayClipSelection(store.selectedClipId);
        } else if (trackType === 'audio') {
          store.toggleAudioClipSelection(store.selectedClipId);
        } else {
          store.toggleVoiceoverClipSelection(store.selectedClipId);
        }
      }
      if (trackType !== 'background') store.clearBackgroundClipSelection();
      if (trackType !== 'text') store.clearTextClipSelection();
      if (trackType !== 'overlay') store.clearOverlayClipSelection();
      if (trackType !== 'audio') store.clearAudioClipSelection();
      if (trackType !== 'voiceover') store.clearVoiceoverClipSelection();
      if (trackType === 'background') {
        toggleBackgroundClipSelection(clip.id);
      } else if (trackType === 'text') {
        toggleTextClipSelection(clip.id);
      } else if (trackType === 'overlay') {
        toggleOverlayClipSelection(clip.id);
      } else if (trackType === 'audio') {
        toggleAudioClipSelection(clip.id);
      } else {
        toggleVoiceoverClipSelection(clip.id);
      }
      return;
    }

    // Normal click → clear multi-select and select this clip
    clearBackgroundClipSelection();
    clearTextClipSelection();
    clearOverlayClipSelection();
    clearAudioClipSelection();
    clearVoiceoverClipSelection();
    setSelectedClip(clip.id);

    if (isLaneManagedTrack && onLaneDragStart) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      onLaneDragStart(clip, e, clipLane, rect);
      return;
    }

    saveToHistory();
    dragStartX.current = e.clientX;
    dragStartTime.current = clip.startTime;
    setIsDragging(true);

    const onMove = (me: MouseEvent) => {
      if (dragStartX.current === null) return;
      const delta = (me.clientX - dragStartX.current) / pps;
      let newStart = dragStartTime.current + delta;
      if (snapEnabled) newStart = Math.round(newStart * 10) / 10;
      moveClip(clip.id, Math.max(0, newStart));
    };
    const onUp = () => {
      dragStartX.current = null;
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [
    clip,
    pps,
    snapEnabled,
    setSelectedClip,
    toggleBackgroundClipSelection,
    toggleTextClipSelection,
    toggleOverlayClipSelection,
    toggleAudioClipSelection,
    toggleVoiceoverClipSelection,
    clearBackgroundClipSelection,
    clearTextClipSelection,
    clearOverlayClipSelection,
    clearAudioClipSelection,
    clearVoiceoverClipSelection,
    saveToHistory,
    moveClip,
    isLocked,
    isLaneManagedTrack,
    onLaneDragStart,
    clipLane,
    trackType,
  ]);

  const resizeRightStartX = useRef<number | null>(null);
  const resizeRightStartEnd = useRef<number>(0);

  const handleResizeRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLocked) return;
    saveToHistory();
    resizeRightStartX.current    = e.clientX;
    resizeRightStartEnd.current  = clip.endTime;
    setIsDragging(true);

    const onMove = (me: MouseEvent) => {
      if (resizeRightStartX.current === null) return;
      const delta = (me.clientX - resizeRightStartX.current) / pps;
      let newEnd = resizeRightStartEnd.current + delta;
      if (snapEnabled) newEnd = Math.round(newEnd * 10) / 10;
      resizeClip(clip.id, clip.startTime, Math.max(clip.startTime + 0.1, newEnd));
    };
    const onUp = () => {
      resizeRightStartX.current = null;
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [clip.id, clip.startTime, clip.endTime, pps, snapEnabled, saveToHistory, resizeClip, isLocked]);

  const resizeLeftStartX = useRef<number | null>(null);
  const resizeLeftStartStart = useRef<number>(0);

  const handleResizeLeftMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLocked) return;
    saveToHistory();
    resizeLeftStartX.current    = e.clientX;
    resizeLeftStartStart.current = clip.startTime;
    setIsDragging(true);

    const onMove = (me: MouseEvent) => {
      if (resizeLeftStartX.current === null) return;
      const delta = (me.clientX - resizeLeftStartX.current) / pps;
      let newStart = resizeLeftStartStart.current + delta;
      if (snapEnabled) newStart = Math.round(newStart * 10) / 10;
      resizeClip(clip.id, Math.max(0, newStart), clip.endTime);
    };
    const onUp = () => {
      resizeLeftStartX.current = null;
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [clip.id, clip.startTime, clip.endTime, pps, snapEnabled, saveToHistory, resizeClip, isLocked]);

  const styleTrack = (clip.trackType ?? trackType) as TrackType;
  const style = getClipStyleForTrack(styleTrack);
  const isAudioTrack = styleTrack === 'audio' || styleTrack === 'voiceover';
  const clipIconWidth = getClipIconWidth(styleTrack, clipLane);
  const compactClip = isCompactLane(styleTrack, clipLane);

  const label = clip.type === 'text'
    ? (clip.content ?? '').slice(0, 60)
    : isAudioTrack
    ? (clip.content ?? (styleTrack === 'voiceover' ? 'Voix off' : 'Audio')).slice(0, 56)
    : styleTrack === 'overlay' || clip.type === 'sticker'
    ? (clip.content ?? clip.sequenceLabel ?? 'Overlay').slice(0, 48)
    : clip.sequenceLabel ?? '';

  const clipDuration = clip.endTime - clip.startTime;
  const dimmed = clip.muted;

  if (hideWhileDragging) return null;

  return (
    <div
      data-timeline-clip
      className={`absolute top-0 bottom-0 select-none border-solid
        ${isLocked ? 'cursor-not-allowed' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${isLocked ? 'grayscale' : ''}
        ${isDragging ? '' : 'transition-[border-color]'}
        group ${isSelected ? 'overflow-visible' : 'overflow-hidden rounded-md'}`}
      style={{
        left,
        width,
        backgroundColor: style.bgColor,
        borderWidth: isSelected ? CLIP_SELECTION.borderWidthPx : 1,
        borderColor: isSelected ? CLIP_SELECTION.borderColor : style.borderColor,
        borderRadius: isSelected ? CLIP_SELECTION.borderRadiusPx : 6,
        opacity: dimmed ? 0.45 : isDragging ? 0.92 : 1,
        transition: isDragging ? 'none' : undefined,
        willChange: isDragging ? 'left, width' : undefined,
        zIndex: isDragging ? 50 : isSelected ? 40 : undefined,
      }}
      onMouseDown={handleDragMouseDown}
      onDragStart={(e) => e.preventDefault()}
      onClick={(e) => {
        if (e.shiftKey && isLaneManagedTrack) return;
        setSelectedClip(clip.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!isLocked) {
          const timeAtPointer = clip.startTime + (e.clientX - e.currentTarget.getBoundingClientRect().left) / pps;
          const splitTime = Math.max(
            clip.startTime + 0.05,
            Math.min(clip.endTime - 0.05, timeAtPointer)
          );
          onContextMenu(clip.id, e.clientX, e.clientY, splitTime);
        }
      }}
    >
      {/* Video/image thumbnail — draggable=false blocks the browser's native
          image-drag ghost which would swallow mousemove events */}
      <div
        className={`relative z-10 flex h-full min-w-0 ${
          isSelected ? 'overflow-hidden' : ''
        }`}
        style={isSelected ? { borderRadius: CLIP_SELECTION.borderRadiusPx - 2 } : undefined}
      >
        <ClipIconBadge trackType={trackType} style={style} iconWidth={clipIconWidth} />

        <div className="relative min-w-0 flex-1 overflow-hidden">
          {clip.thumbnail && trackType === 'background' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clip.thumbnail}
              alt=""
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute inset-0 h-full w-full object-cover opacity-85 pointer-events-none"
            />
          )}

          <div
            className="absolute top-0 right-0 h-[2px]"
            style={{ left: 0, backgroundColor: style.barColor }}
            aria-hidden
          />

          {isAudioTrack && (
            <AudioWaveform
              clipId={clip.id}
              url={clip.url}
              widthPx={Math.max(12, width - clipIconWidth)}
              trimStart={clip.trimStart ?? 0}
              visibleDuration={clipDuration}
              baseColor={style.waveColor ?? '#2d6b4f'}
            />
          )}

          <div
            className={`relative flex items-center gap-1 truncate leading-tight ${
              isAudioTrack
                ? 'pl-1 pr-1.5 text-[9px] font-medium'
                : compactClip
                  ? 'px-1 py-0 text-[9px] font-semibold'
                  : 'px-1.5 py-0.5 text-[10px] font-semibold'
            }`}
            style={{
              color: style.labelColor,
              backgroundColor: style.labelBgColor,
              ...(isAudioTrack ? { height: compactClip ? 12 : 14 } : {}),
            }}
          >
            {clip.muted && (
              <span className="shrink-0 opacity-90" title="Muet">
                <IconVolumeMute width={11} height={11} />
              </span>
            )}
            <span className="truncate drop-shadow-sm">{label}</span>
          </div>
        </div>
      </div>

      {/* Lock badge */}
      {isLocked && (
        <div className="absolute top-1 left-1 z-20 text-neutral-600" title="Piste verrouillée">
          <IconLock width={12} height={12} />
        </div>
      )}

      {/* Mute rapide (audio) au survol */}
      {!isLocked && (trackType === 'audio' || trackType === 'voiceover') && (
        <div className="absolute top-1 right-1 z-20 hidden group-hover:flex items-center">
          <button
            type="button"
            title={clip.muted ? 'Réactiver le son' : 'Couper le son'}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              updateClip(clip.id, { muted: !clip.muted });
            }}
            className="flex h-5 w-5 items-center justify-center rounded bg-white/90 text-neutral-700 shadow-sm hover:bg-white"
          >
            {clip.muted ? (
              <IconVolume width={12} height={12} />
            ) : (
              <IconVolumeMute width={12} height={12} />
            )}
          </button>
        </div>
      )}

      {/* Poignées trim — bobine à deux fils (réf. CapCut) */}
      {!isLocked && (
        <>
          <TimelineTrimHandle
            side="left"
            visible={isSelected}
            junctionInset={trimLeftInset}
            onMouseDown={handleResizeLeftMouseDown}
          />
          <TimelineTrimHandle
            side="right"
            visible={isSelected}
            junctionInset={trimRightInset}
            onMouseDown={handleResizeRightMouseDown}
          />
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// One lane row (a horizontal strip of non-overlapping clips of one track type)
// ──────────────────────────────────────────────────────────────────────────────

interface LaneRowProps {
  trackType: TrackType;
  laneIndex: number;
  clips: Clip[];
  pps: number;
  totalWidth: number;
  isPreviewLane?: boolean;
  laneDragPreview?: LaneDragPreview | null;
  onLaneDragStart?: (
    clip: Clip,
    e: React.MouseEvent,
    sourceLane: number,
    sourceRect: DOMRect
  ) => void;
  onContextMenu: (
    clipId: string,
    x: number,
    y: number,
    splitTimeAtPointer: number
  ) => void;
  onLaneContextMenu?: (
    e: React.MouseEvent,
    laneIndex: number,
    laneTrackType: LaneManagedTrack
  ) => void;
}

function LaneRow({
  trackType,
  laneIndex,
  clips,
  pps,
  totalWidth,
  isPreviewLane = false,
  laneDragPreview = null,
  onLaneDragStart,
  onContextMenu,
  onLaneContextMenu,
}: LaneRowProps) {
  const info = TRACK_INFO[trackType];
  /** Seule la piste principale (index 0) affiche le préfixe T1, OV1, V1… */
  const showLaneLabel = laneIndex === 0;
  const selectedClipId = useCompositionStore((s) => s.selectedClipId);
  const selectedClipIds = useCompositionStore((s) => s.selectedClipIds);
  const selectedClipTrackType = useCompositionStore((s) => s.selectedClipTrackType);
  const { laneHidden, laneLocked, laneMuted, toggleLaneHidden, toggleLaneLocked, toggleLaneMuted } =
    useCompositionStore();
  const composition = useCompositionStore((s) => s.composition);
  const bgClips = useMemo(
    () => composition?.tracks.background ?? [],
    [composition?.tracks.background]
  );
  const textClips = useMemo(
    () => composition?.tracks.text ?? [],
    [composition?.tracks.text]
  );
  const overlayClips = useMemo(
    () => composition?.tracks.overlay ?? [],
    [composition?.tracks.overlay]
  );
  const audioClips = useMemo(
    () => composition?.tracks.audio ?? [],
    [composition?.tracks.audio]
  );
  const voiceoverClips = useMemo(
    () => composition?.tracks.voiceover ?? [],
    [composition?.tracks.voiceover]
  );
  const bgFirstLane = trackType === 'background' && laneIndex === 0;
  const isLaneManaged =
    trackType === 'background' ||
    trackType === 'text' ||
    trackType === 'overlay' ||
    trackType === 'audio' ||
    trackType === 'voiceover';

  const displayClips = useMemo(() => {
    if (!laneDragPreview || !isLaneManaged) return clips;

    const primaryLane =
      trackType === 'background'
        ? PRIMARY_BACKGROUND_LANE
        : trackType === 'text'
          ? PRIMARY_TEXT_LANE
          : trackType === 'overlay'
            ? PRIMARY_OVERLAY_LANE
            : trackType === 'audio'
              ? PRIMARY_AUDIO_LANE
              : PRIMARY_VOICEOVER_LANE;

    if (
      laneIndex === primaryLane &&
      laneDragPreview.sourceLaneRippleLayout
    ) {
      return laneDragPreview.sourceLaneRippleLayout;
    }

    if (
      laneIndex === laneDragPreview.targetLane &&
      laneDragPreview.laneRippleLayout
    ) {
      return laneDragPreview.laneRippleLayout;
    }

    return clips.filter((c) => c.id !== laneDragPreview.clipId);
  }, [clips, laneDragPreview, trackType, laneIndex, isLaneManaged]);

  const traceDraggedClip = useMemo(() => {
    if (!laneDragPreview) return null;
    const pool =
      trackType === 'background'
        ? bgClips
        : trackType === 'text'
          ? textClips
          : trackType === 'overlay'
            ? overlayClips
            : trackType === 'audio'
              ? audioClips
              : voiceoverClips;
    return pool.find((c) => c.id === laneDragPreview.clipId) ?? null;
  }, [laneDragPreview, bgClips, textClips, overlayClips, audioClips, voiceoverClips, trackType]);

  const showDropTrace =
    traceDraggedClip != null &&
    laneDragPreview != null &&
    isLaneManaged &&
    laneIndex === laneDragPreview.targetLane;

  // Per-lane key, e.g. "background-1"
  // Each lane has its own key and its own independent state — no coupling to track-level state
  const laneKey    = `${trackType}-${laneIndex}`;
  const isHidden   = laneHidden[laneKey] ?? false;
  const isLocked   = laneLocked[laneKey] ?? false;
  const isMuted    = laneMuted[laneKey] ?? false;
  const showMuteControl = trackSupportsLaneMute(trackType);
  const laneHasSelection =
    (!!selectedClipId && displayClips.some((c) => c.id === selectedClipId)) ||
    (selectedClipTrackType === trackType &&
      selectedClipIds.length > 0 &&
      displayClips.some((c) => selectedClipIds.includes(c.id)));
  const hasLaneContent =
    isPreviewLane || showDropTrace || displayClips.length > 0;
  const stripBg = !hasLaneContent
    ? 'transparent'
    : isPreviewLane
      ? `repeating-linear-gradient(-45deg, ${TIMELINE_LIGHT.laneLockedBg} 0, ${TIMELINE_LIGHT.laneLockedBg} 6px, ${TIMELINE_LIGHT.previewWorkspaceBg} 6px, ${TIMELINE_LIGHT.previewWorkspaceBg} 12px)`
      : laneStripBackground(laneHasSelection, isLocked);

  const laneHeight = getLaneHeight(trackType, laneIndex);
  const laneClipInsetY = getLaneClipInsetY(trackType, laneIndex);

  return (
    <div
      className="flex relative shrink-0"
      style={{ height: laneHeight }}
      data-background-lane-index={
        trackType === 'background' ? laneIndex : undefined
      }
      data-text-lane-index={trackType === 'text' ? laneIndex : undefined}
      data-overlay-lane-index={trackType === 'overlay' ? laneIndex : undefined}
      data-audio-lane-index={trackType === 'audio' ? laneIndex : undefined}
      data-voiceover-lane-index={trackType === 'voiceover' ? laneIndex : undefined}
    >
      {/* En-tête piste — colonnes fixes (libellé / cadenas / œil alignés sur toutes les lignes). */}
      <div
        className={`shrink-0 flex items-center gap-1 border-r border-neutral-200/50 bg-white px-1.5 ${
          isLocked ? 'opacity-60' : ''
        }`}
        style={{ width: LABEL_COL_WIDTH, height: laneHeight }}
      >
        <span className="w-px shrink-0 self-stretch bg-neutral-300" aria-hidden />
        <span
          className="shrink-0 font-semibold tabular-nums text-[10px] text-neutral-800"
          style={{ width: LANE_HEADER_LABEL_WIDTH }}
        >
          {showLaneLabel ? `${info.short}${laneIndex + 1}` : ''}
        </span>
        <span className="min-w-0 flex-1" aria-hidden />

        {showMuteControl ? (
          <button
            type="button"
            onClick={() => toggleLaneMuted(laneKey)}
            title={isMuted ? 'Réactiver le son de la piste' : 'Couper le son de la piste'}
            className={`flex shrink-0 items-center justify-center rounded-md transition-colors ${
              isMuted
                ? 'bg-cyan-100 text-cyan-700'
                : 'text-neutral-600 hover:bg-white/50 hover:text-neutral-900'
            }`}
            style={{ width: LANE_HEADER_BTN_PX, height: LANE_HEADER_BTN_PX }}
          >
            {isMuted ? (
              <IconVolumeMute width={14} height={14} />
            ) : (
              <IconVolume width={14} height={14} />
            )}
          </button>
        ) : (
          <span
            className="shrink-0"
            style={{ width: LANE_HEADER_BTN_PX, height: LANE_HEADER_BTN_PX }}
            aria-hidden
          />
        )}

        <button
          type="button"
          onClick={() => toggleLaneLocked(laneKey)}
          title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
          className={`flex shrink-0 items-center justify-center rounded-md transition-colors ${
            isLocked
              ? 'bg-white/70 text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:bg-white/50 hover:text-neutral-900'
          }`}
          style={{ width: LANE_HEADER_BTN_PX, height: LANE_HEADER_BTN_PX }}
        >
          {isLocked ? (
            <IconLock width={12} height={12} />
          ) : (
            <IconUnlock width={12} height={12} />
          )}
        </button>
        <button
          type="button"
          onClick={() => toggleLaneHidden(laneKey)}
          title={isHidden ? 'Afficher' : 'Masquer'}
          className={`flex shrink-0 items-center justify-center rounded-md transition-colors ${
            isHidden ? 'text-neutral-400' : 'text-neutral-600 hover:bg-white/50'
          }`}
          style={{ width: LANE_HEADER_BTN_PX, height: LANE_HEADER_BTN_PX }}
        >
          {isHidden ? (
            <IconEyeOff width={12} height={12} />
          ) : (
            <IconEye width={12} height={12} />
          )}
        </button>
      </div>

      {/* Zone clips — fond gris dès 0 s (sans bande blanche) */}
      <div
        className={`relative flex-1 ${isHidden ? 'opacity-25 pointer-events-none' : ''}`}
        style={{ minWidth: totalWidth }}
        onContextMenu={(e) => {
          if (!isLaneManaged || isLocked || isHidden) return;
          if ((e.target as HTMLElement).closest('[data-timeline-clip]')) return;
          e.preventDefault();
          e.stopPropagation();
          onLaneContextMenu?.(e, laneIndex, trackType as LaneManagedTrack);
        }}
      >
        <div
          className="absolute inset-0 transition-[background] duration-150"
          style={{ background: stripBg }}
        />
        {hasLaneContent ? (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${pps - 1}px, ${TIMELINE_LIGHT.gridLine} ${pps - 1}px, ${TIMELINE_LIGHT.gridLine} ${pps}px)`,
            }}
          />
        ) : null}

        <div
          className="absolute inset-0"
          style={{ top: laneClipInsetY, bottom: laneClipInsetY }}
        >
          {/* Marqueurs ◆ de transition V1 — zone de survol à la jonction entre clips */}
          {bgFirstLane && (
            <div className="pointer-events-none absolute inset-0 z-[65]">
              {findLane0Junctions(getLane0Clips(bgClips))
                .filter(({ from, to }) => {
                  const clipIds = new Set(clips.map((c) => c.id));
                  return clipIds.has(from.id) && clipIds.has(to.id);
                })
                .map(({ from, to }) => (
                  <TransitionMarker
                    key={`tr-${from.id}-${to.id}`}
                    fromClip={from}
                    toClip={to}
                    pps={pps}
                  />
                ))}
            </div>
          )}

          {displayClips.map((clip, clipIdx) => {
            const prev = clipIdx > 0 ? displayClips[clipIdx - 1] : null;
            const next =
              clipIdx < displayClips.length - 1 ? displayClips[clipIdx + 1] : null;
            const touchesPrev =
              prev != null && Math.abs(prev.endTime - clip.startTime) < 0.05;
            const touchesNext =
              next != null && Math.abs(clip.endTime - next.startTime) < 0.05;
            return (
              <TimelineClip
                key={clip.id}
                clip={clip}
                pps={pps}
                trackType={trackType}
                laneKey={laneKey}
                clipLane={laneIndex}
                laneDragPreview={laneDragPreview}
                onLaneDragStart={onLaneDragStart}
                trimLeftInset={touchesPrev ? TRIM_JUNCTION_INSET_PX : 0}
                trimRightInset={touchesNext ? TRIM_JUNCTION_INSET_PX : 0}
                onContextMenu={onContextMenu}
              />
            );
          })}
          {showDropTrace && traceDraggedClip && laneDragPreview && (
            <TimelineLaneDropTrace
              clip={traceDraggedClip}
              traceStart={laneDragPreview.displayTraceStart}
              traceEnd={laneDragPreview.displayTraceEnd}
              pps={pps}
              trackType={trackType as LaneManagedTrack}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Ruler with HH:MM:SS labels + minor ticks
// ──────────────────────────────────────────────────────────────────────────────

function TimelineRuler({
  totalDuration, pps, zoom, onClickTime,
}: {
  totalDuration: number;
  pps: number;
  zoom: number;
  onClickTime: (t: number) => void;
}) {
  // Choose major/minor step based on zoom level
  let major = 5;
  let minor = 1;
  if (zoom >= 8)      { major = 0.5; minor = 0.1; }
  else if (zoom >= 4) { major = 1;   minor = 0.2; }
  else if (zoom >= 2) { major = 2;   minor = 0.5; }
  else if (zoom >= 1) { major = 5;   minor = 1;   }
  else                { major = 10;  minor = 2;   }

  const majors: number[] = [];
  const minors: number[] = [];
  for (let t = 0; t <= totalDuration + major; t += major) {
    majors.push(Math.round(t * 100) / 100);
  }
  for (let t = 0; t <= totalDuration + minor; t += minor) {
    const rounded = Math.round(t * 100) / 100;
    if (rounded % major > 0.001) minors.push(rounded);
  }

  return (
    <div
      className="relative flex flex-1 cursor-pointer select-none bg-white"
      style={{ height: RULER_HEIGHT }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onClickTime(Math.max(0, (e.clientX - rect.left) / pps));
      }}
    >
      {minors.map((t) => (
        <div key={`m-${t}`} className="absolute top-4 w-px bg-neutral-300" style={{ left: t * pps, height: 5 }} />
      ))}
      {majors.map((t) => (
        <div key={`M-${t}`} className="absolute flex flex-col items-start" style={{ left: t * pps, top: 0 }}>
          <span className="text-[10px] text-neutral-500 ml-1 tabular-nums font-medium select-none">
            {formatRulerTime(t)}
          </span>
          <div className="h-3 w-px bg-neutral-400" />
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Playhead CapCut — tête sur la règle + trait épais au-dessus de tout
// ──────────────────────────────────────────────────────────────────────────────

function PlayheadHeadSvg({ filled }: { filled: boolean }) {
  const stroke = TIMELINE_LIGHT.playheadLine;
  const fill = filled ? stroke : '#ffffff';
  const w = PLAYHEAD.headWidthPx;
  const h = PLAYHEAD.headHeightPx;
  const r = PLAYHEAD.headRadiusPx;
  const inset = PLAYHEAD.headBorderPx / 2;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="block shrink-0"
      aria-hidden
    >
      <rect
        x={inset}
        y={inset}
        width={w - PLAYHEAD.headBorderPx}
        height={h - PLAYHEAD.headBorderPx}
        rx={r}
        ry={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={PLAYHEAD.headBorderPx}
      />
    </svg>
  );
}

function TimelinePlayhead({
  currentTime,
  pps,
  scrollLeft,
  rulerHeight,
  onDrag,
}: {
  currentTime: number;
  pps: number;
  scrollLeft: number;
  rulerHeight: number;
  onDrag: (t: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const centerX = LABEL_COL_WIDTH + currentTime * pps - scrollLeft;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      const startX = e.clientX;
      const startTime = currentTime;
      const onMove = (me: MouseEvent) =>
        onDrag(Math.max(0, startTime + (me.clientX - startX) / pps));
      const onUp = () => {
        setDragging(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [currentTime, pps, onDrag]
  );

  const headTop = Math.max(0, (rulerHeight - PLAYHEAD.headHeightPx) / 2);
  const lineTop = headTop + PLAYHEAD.headHeightPx;

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{
        left: centerX,
        transform: 'translateX(-50%)',
        width: Math.max(PLAYHEAD.headWidthPx + 12, 24),
        zIndex: PLAYHEAD.zIndex,
      }}
      role="slider"
      aria-label="Tête de lecture"
      aria-valuenow={currentTime}
    >
      {/* Trait vertical sous la tête — réf. CapCut */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: lineTop,
          width: PLAYHEAD.lineWidthPx,
          backgroundColor: TIMELINE_LIGHT.playheadLine,
        }}
      />
      <button
        type="button"
        className="pointer-events-auto absolute left-1/2 -translate-x-1/2 cursor-ew-resize border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/80"
        style={{ top: headTop, width: PLAYHEAD.headWidthPx, height: PLAYHEAD.headHeightPx }}
        onMouseDown={handleMouseDown}
        aria-label="Déplacer la tête de lecture"
      >
        <PlayheadHeadSvg filled={dragging} />
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Timeline (main)
// ──────────────────────────────────────────────────────────────────────────────

interface TimelineProps {
  /** Optional: parent supplies a callback to resize the timeline pane vertically */
  onResizeStart?: (e: React.MouseEvent) => void;
}

const TIMELINE_DRAG_EDGE_PX = 48;
const TIMELINE_DRAG_SCROLL_STEP = 14;

export function Timeline({ onResizeStart }: TimelineProps = {}) {
  const {
    composition,
    currentTime,
    zoom,
    setCurrentTime,
    setSelectedClip,
    saveToHistory,
    commitBackgroundDragPreview,
    commitTextDragPreview,
    commitOverlayDragPreview,
    commitAudioDragPreview,
    commitVoiceoverDragPreview,
    undo,
  } = useCompositionStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<CtxMenu | null>(null);
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0);
  const [bgDragPreview, setBgDragPreview] = useState<BackgroundDragPreview | null>(null);
  const [bgDragGhost, setBgDragGhost] = useState<BackgroundDragGhost | null>(null);
  const [textDragPreview, setTextDragPreview] = useState<TextDragPreview | null>(null);
  const [textDragGhost, setTextDragGhost] = useState<TextDragGhost | null>(null);
  const [overlayDragPreview, setOverlayDragPreview] = useState<OverlayDragPreview | null>(null);
  const [overlayDragGhost, setOverlayDragGhost] = useState<OverlayDragGhost | null>(null);
  const [audioDragPreview, setAudioDragPreview] = useState<AudioDragPreview | null>(null);
  const [audioDragGhost, setAudioDragGhost] = useState<AudioDragGhost | null>(null);
  const [voiceoverDragPreview, setVoiceoverDragPreview] =
    useState<VoiceoverDragPreview | null>(null);
  const [voiceoverDragGhost, setVoiceoverDragGhost] =
    useState<VoiceoverDragGhost | null>(null);

  // Global marquee (rubber-band) selection — viewport coordinates for fixed overlay
  const [marquee, setMarquee] = useState<{
    startCX: number; startCY: number;
    curCX: number; curCY: number;
  } | null>(null);
  const laneDragPreviewRef = useRef<LaneDragPreview | null>(null);
  const laneDragRafRef = useRef<number | null>(null);
  const laneDragClipIdRef = useRef<string | null>(null);
  const laneDragTrackRef = useRef<LaneManagedTrack>('background');
  const laneDragGrabRef = useRef({
    grabDx: 0,
    grabDy: 0,
    width: 80,
    height: getLaneHeight('background', 0) - getLaneClipInsetY('background', 0) * 2,
  });
  const laneDragSourceLaneRef = useRef(0);
  const laneDragStartClientYRef = useRef(0);

  const pps = 80 * zoom;

  const draggedBgClip = useMemo(() => {
    if (!bgDragPreview) return null;
    const bg = composition?.tracks.background ?? [];
    return bg.find((c) => c.id === bgDragPreview.clipId) ?? null;
  }, [bgDragPreview, composition]);

  const draggedTextClip = useMemo(() => {
    if (!textDragPreview) return null;
    const text = composition?.tracks.text ?? [];
    return text.find((c) => c.id === textDragPreview.clipId) ?? null;
  }, [textDragPreview, composition]);

  const draggedOverlayClip = useMemo(() => {
    if (!overlayDragPreview) return null;
    const overlay = composition?.tracks.overlay ?? [];
    return overlay.find((c) => c.id === overlayDragPreview.clipId) ?? null;
  }, [overlayDragPreview, composition]);

  const draggedAudioClip = useMemo(() => {
    if (!audioDragPreview) return null;
    const audio = composition?.tracks.audio ?? [];
    return audio.find((c) => c.id === audioDragPreview.clipId) ?? null;
  }, [audioDragPreview, composition]);

  const draggedVoiceoverClip = useMemo(() => {
    if (!voiceoverDragPreview) return null;
    const voiceover = composition?.tracks.voiceover ?? [];
    return voiceover.find((c) => c.id === voiceoverDragPreview.clipId) ?? null;
  }, [voiceoverDragPreview, composition]);

  const beginLaneDrag = useCallback(
    (
      laneTrack: LaneManagedTrack,
      clip: Clip,
      e: React.MouseEvent,
      sourceLane: number,
      sourceRect: DOMRect
    ) => {
      saveToHistory();
      setSelectedClip(clip.id);
      laneDragClipIdRef.current = clip.id;
      laneDragTrackRef.current = laneTrack;
      laneDragSourceLaneRef.current = sourceLane;
      laneDragStartClientYRef.current = e.clientY;
      laneDragPreviewRef.current = null;
      setBgDragPreview(null);
      setBgDragGhost(null);
      setTextDragPreview(null);
      setTextDragGhost(null);
      setOverlayDragPreview(null);
      setOverlayDragGhost(null);
      setAudioDragPreview(null);
      setAudioDragGhost(null);
      setVoiceoverDragPreview(null);
      setVoiceoverDragGhost(null);
      laneDragGrabRef.current = {
        grabDx: e.clientX - sourceRect.left,
        grabDy: e.clientY - sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
      };
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      const tick = (clientX: number, clientY: number) => {
        const scrollEl = scrollRef.current;
        if (scrollEl) {
          const rect = scrollEl.getBoundingClientRect();
          if (clientX > rect.right - TIMELINE_DRAG_EDGE_PX) {
            scrollEl.scrollLeft += TIMELINE_DRAG_SCROLL_STEP;
          } else if (clientX < rect.left + LABEL_COL_WIDTH + TIMELINE_DRAG_EDGE_PX) {
            scrollEl.scrollLeft = Math.max(
              0,
              scrollEl.scrollLeft - TIMELINE_DRAG_SCROLL_STEP
            );
          }
        }

        const comp = useCompositionStore.getState().composition;
        const pool =
          laneTrack === 'background'
            ? comp?.tracks.background ?? []
            : laneTrack === 'text'
              ? comp?.tracks.text ?? []
              : laneTrack === 'overlay'
                ? comp?.tracks.overlay ?? []
                : laneTrack === 'audio'
                  ? comp?.tracks.audio ?? []
                  : comp?.tracks.voiceover ?? [];
        const current = pool.find((c) => c.id === clip.id);
        if (!current) return;

        const dragStep =
          laneTrack === 'background'
            ? getBackgroundLaneDragStep()
            : getLaneDragStep(laneTrack, laneDragSourceLaneRef.current);

        const targetLane =
          laneTrack === 'background'
            ? resolveBackgroundLaneForDrag(
                clientY,
                laneDragSourceLaneRef.current,
                laneDragStartClientYRef.current,
                dragStep
              )
            : laneTrack === 'text'
              ? resolveTextLaneForDrag(
                  clientY,
                  laneDragSourceLaneRef.current,
                  laneDragStartClientYRef.current,
                  dragStep
                )
              : laneTrack === 'overlay'
                ? resolveOverlayLaneForDrag(
                    clientY,
                    laneDragSourceLaneRef.current,
                    laneDragStartClientYRef.current,
                    dragStep
                  )
                : laneTrack === 'audio'
                  ? resolveAudioLaneForDrag(
                      clientY,
                      laneDragSourceLaneRef.current,
                      laneDragStartClientYRef.current,
                      dragStep
                    )
                  : resolveVoiceoverLaneForDrag(
                      clientY,
                      laneDragSourceLaneRef.current,
                      laneDragStartClientYRef.current,
                      dragStep
                    );

        const clamped =
          laneTrack === 'background'
            ? clampBackgroundDragPointer(
                clientX,
                clientY,
                laneDragGrabRef.current.grabDx,
                laneDragGrabRef.current.grabDy,
                laneDragGrabRef.current.height,
                scrollEl,
                pps,
                null
              )
            : laneTrack === 'text'
              ? clampTextDragPointer(
                  clientX,
                  clientY,
                  laneDragGrabRef.current.grabDx,
                  laneDragGrabRef.current.grabDy,
                  laneDragGrabRef.current.height,
                  scrollEl,
                  pps,
                  null
                )
              : laneTrack === 'overlay'
                ? clampOverlayDragPointer(
                    clientX,
                    clientY,
                    laneDragGrabRef.current.grabDx,
                    laneDragGrabRef.current.grabDy,
                    laneDragGrabRef.current.height,
                    scrollEl,
                    pps,
                    null
                  )
                : laneTrack === 'audio'
                  ? clampAudioDragPointer(
                      clientX,
                      clientY,
                      laneDragGrabRef.current.grabDx,
                      laneDragGrabRef.current.grabDy,
                      laneDragGrabRef.current.height,
                      scrollEl,
                      pps,
                      null
                    )
                  : clampVoiceoverDragPointer(
                      clientX,
                      clientY,
                      laneDragGrabRef.current.grabDx,
                      laneDragGrabRef.current.grabDy,
                      laneDragGrabRef.current.height,
                      scrollEl,
                      pps,
                      null
                    );

        let ghostTime = clamped.ghostStartTime;
        const snap = useCompositionStore.getState().snapEnabled;
        if (snap) ghostTime = Math.round(ghostTime * 10) / 10;

        const preview =
          laneTrack === 'background'
            ? buildBackgroundDragPreview(
                current,
                pool,
                targetLane,
                ghostTime,
                { pinnedToTimelineStart: clamped.pinnedToTimelineStart }
              )
            : laneTrack === 'text'
              ? buildTextDragPreview(
                  current,
                  pool,
                  targetLane,
                  ghostTime,
                  { pinnedToTimelineStart: clamped.pinnedToTimelineStart }
                )
              : laneTrack === 'overlay'
                ? buildOverlayDragPreview(
                    current,
                    pool,
                    targetLane,
                    ghostTime,
                    { pinnedToTimelineStart: clamped.pinnedToTimelineStart }
                  )
                : laneTrack === 'audio'
                  ? buildAudioDragPreview(
                      current,
                      pool,
                      targetLane,
                      ghostTime,
                      { pinnedToTimelineStart: clamped.pinnedToTimelineStart }
                    )
                  : buildVoiceoverDragPreview(
                      current,
                      pool,
                      targetLane,
                      ghostTime,
                      { pinnedToTimelineStart: clamped.pinnedToTimelineStart }
                    );

        laneDragPreviewRef.current = preview;
        const ghost = {
          clipId: clip.id,
          clientX: clamped.clientX,
          clientY: clamped.clientY,
          ...laneDragGrabRef.current,
        };
        setBgDragPreview(laneTrack === 'background' ? preview : null);
        setBgDragGhost(laneTrack === 'background' ? ghost : null);
        setTextDragPreview(laneTrack === 'text' ? preview : null);
        setTextDragGhost(laneTrack === 'text' ? ghost : null);
        setOverlayDragPreview(laneTrack === 'overlay' ? preview : null);
        setOverlayDragGhost(laneTrack === 'overlay' ? ghost : null);
        setAudioDragPreview(laneTrack === 'audio' ? preview : null);
        setAudioDragGhost(laneTrack === 'audio' ? ghost : null);
        setVoiceoverDragPreview(laneTrack === 'voiceover' ? preview : null);
        setVoiceoverDragGhost(laneTrack === 'voiceover' ? ghost : null);
      };

      const onMove = (me: MouseEvent) => {
        if (laneDragRafRef.current != null) return;
        laneDragRafRef.current = requestAnimationFrame(() => {
          laneDragRafRef.current = null;
          tick(me.clientX, me.clientY);
        });
      };

      const onUp = (me: MouseEvent) => {
        if (laneDragRafRef.current != null) {
          cancelAnimationFrame(laneDragRafRef.current);
          laneDragRafRef.current = null;
        }
        tick(me.clientX, me.clientY);

        const preview = laneDragPreviewRef.current;
        const clipId = laneDragClipIdRef.current;
        if (clipId && preview?.clipId === clipId) {
          if (laneDragTrackRef.current === 'background') {
            commitBackgroundDragPreview(preview);
          } else if (laneDragTrackRef.current === 'text') {
            commitTextDragPreview(preview);
          } else if (laneDragTrackRef.current === 'overlay') {
            commitOverlayDragPreview(preview);
          } else if (laneDragTrackRef.current === 'audio') {
            commitAudioDragPreview(preview);
          } else {
            commitVoiceoverDragPreview(preview);
          }
        } else {
          undo();
        }

        laneDragPreviewRef.current = null;
        laneDragClipIdRef.current = null;
        setBgDragPreview(null);
        setBgDragGhost(null);
        setTextDragPreview(null);
        setTextDragGhost(null);
        setOverlayDragPreview(null);
        setOverlayDragGhost(null);
        setAudioDragPreview(null);
        setAudioDragGhost(null);
        setVoiceoverDragPreview(null);
        setVoiceoverDragGhost(null);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      tick(e.clientX, e.clientY);
    },
    [
      pps,
      saveToHistory,
      setSelectedClip,
      commitBackgroundDragPreview,
      commitTextDragPreview,
      commitOverlayDragPreview,
      commitAudioDragPreview,
      commitVoiceoverDragPreview,
      undo,
    ]
  );

  const beginBackgroundDrag = useCallback(
    (clip: Clip, e: React.MouseEvent, sourceLane: number, sourceRect: DOMRect) => {
      beginLaneDrag('background', clip, e, sourceLane, sourceRect);
    },
    [beginLaneDrag]
  );

  const beginTextDrag = useCallback(
    (clip: Clip, e: React.MouseEvent, sourceLane: number, sourceRect: DOMRect) => {
      beginLaneDrag('text', clip, e, sourceLane, sourceRect);
    },
    [beginLaneDrag]
  );

  const beginOverlayDrag = useCallback(
    (clip: Clip, e: React.MouseEvent, sourceLane: number, sourceRect: DOMRect) => {
      beginLaneDrag('overlay', clip, e, sourceLane, sourceRect);
    },
    [beginLaneDrag]
  );

  const beginAudioDrag = useCallback(
    (clip: Clip, e: React.MouseEvent, sourceLane: number, sourceRect: DOMRect) => {
      beginLaneDrag('audio', clip, e, sourceLane, sourceRect);
    },
    [beginLaneDrag]
  );

  const beginVoiceoverDrag = useCallback(
    (clip: Clip, e: React.MouseEvent, sourceLane: number, sourceRect: DOMRect) => {
      beginLaneDrag('voiceover', clip, e, sourceLane, sourceRect);
    },
    [beginLaneDrag]
  );

  const totalDuration = useMemo(() => {
    let d = Math.max(composition?.duration ?? 0, 10);
    if (bgDragPreview) {
      d = Math.max(d, bgDragPreview.displayTraceEnd + 2);
    }
    if (textDragPreview) {
      d = Math.max(d, textDragPreview.displayTraceEnd + 2);
    }
    if (overlayDragPreview) {
      d = Math.max(d, overlayDragPreview.displayTraceEnd + 2);
    }
    if (audioDragPreview) {
      d = Math.max(d, audioDragPreview.displayTraceEnd + 2);
    }
    if (voiceoverDragPreview) {
      d = Math.max(d, voiceoverDragPreview.displayTraceEnd + 2);
    }
    return d;
  }, [
    composition?.duration,
    bgDragPreview,
    textDragPreview,
    overlayDragPreview,
    audioDragPreview,
    voiceoverDragPreview,
  ]);
  const totalWidth = totalDuration * pps;

  const previewBgLaneForRows = useMemo(() => {
    if (!bgDragPreview) return null;
    const target = bgDragPreview.targetLane;
    if (target <= PRIMARY_BACKGROUND_LANE) return null;

    const bg = composition?.tracks.background ?? [];
    const others = bg.filter((c) => c.id !== bgDragPreview.clipId);
    const maxUsedLane = others.reduce(
      (max, c) => Math.max(max, getClipBackgroundLane(c)),
      PRIMARY_BACKGROUND_LANE
    );
    if (target <= maxUsedLane) return null;

    return target;
  }, [bgDragPreview, composition]);

  const previewTextLaneForRows = useMemo(() => {
    if (!textDragPreview) return null;
    const target = textDragPreview.targetLane;
    if (target <= PRIMARY_TEXT_LANE) return null;

    const text = composition?.tracks.text ?? [];
    const others = text.filter((c) => c.id !== textDragPreview.clipId);
    const maxUsedLane = others.reduce(
      (max, c) => Math.max(max, getClipTextLane(c)),
      PRIMARY_TEXT_LANE
    );
    if (target <= maxUsedLane) return null;

    return target;
  }, [textDragPreview, composition]);

  const previewOverlayLaneForRows = useMemo(() => {
    if (!overlayDragPreview) return null;
    const target = overlayDragPreview.targetLane;
    if (target <= PRIMARY_OVERLAY_LANE) return null;

    const overlay = composition?.tracks.overlay ?? [];
    const others = overlay.filter((c) => c.id !== overlayDragPreview.clipId);
    const maxUsedLane = others.reduce(
      (max, c) => Math.max(max, getClipOverlayLane(c)),
      PRIMARY_OVERLAY_LANE
    );
    if (target <= maxUsedLane) return null;

    return target;
  }, [overlayDragPreview, composition]);

  const previewAudioLaneForRows = useMemo(() => {
    if (!audioDragPreview) return null;
    const target = audioDragPreview.targetLane;
    if (target <= PRIMARY_AUDIO_LANE) return null;

    const audio = composition?.tracks.audio ?? [];
    const others = audio.filter((c) => c.id !== audioDragPreview.clipId);
    const maxUsedLane = others.reduce(
      (max, c) => Math.max(max, getClipAudioLane(c)),
      PRIMARY_AUDIO_LANE
    );
    if (target <= maxUsedLane) return null;

    return target;
  }, [audioDragPreview, composition]);

  const previewVoiceoverLaneForRows = useMemo(() => {
    if (!voiceoverDragPreview) return null;
    const target = voiceoverDragPreview.targetLane;
    if (target <= PRIMARY_VOICEOVER_LANE) return null;

    const voiceover = composition?.tracks.voiceover ?? [];
    const others = voiceover.filter((c) => c.id !== voiceoverDragPreview.clipId);
    const maxUsedLane = others.reduce(
      (max, c) => Math.max(max, getClipVoiceoverLane(c)),
      PRIMARY_VOICEOVER_LANE
    );
    if (target <= maxUsedLane) return null;

    return target;
  }, [voiceoverDragPreview, composition]);

  const lanesByTrack = useMemo(() => {
    const result: Partial<Record<TrackType, Lane[]>> = {};
    for (const tt of TRACK_ORDER) {
      const clips = composition?.tracks[tt] ?? [];
      if (tt === 'background') {
        const laneGroups = buildBackgroundLanesForTimeline(
          clips,
          previewBgLaneForRows
        );
        result[tt] = laneGroups.map((l: BackgroundTimelineLane) => ({
          index: l.index,
          clips: l.clips,
          isPreview: l.isPreview,
        }));
      } else if (tt === 'text') {
        const laneGroups = buildTextLanesForTimeline(clips, previewTextLaneForRows);
        result[tt] = laneGroups.map((l: TextTimelineLane) => ({
          index: l.index,
          clips: l.clips,
          isPreview: l.isPreview,
        }));
      } else if (tt === 'overlay') {
        const laneGroups = buildOverlayLanesForTimeline(clips, previewOverlayLaneForRows);
        result[tt] = laneGroups.map((l: OverlayTimelineLane) => ({
          index: l.index,
          clips: l.clips,
          isPreview: l.isPreview,
        }));
      } else if (tt === 'audio') {
        const laneGroups = buildAudioLanesForTimeline(clips, previewAudioLaneForRows);
        result[tt] = laneGroups.map((l: AudioTimelineLane) => ({
          index: l.index,
          clips: l.clips,
          isPreview: l.isPreview,
        }));
      } else if (tt === 'voiceover') {
        const laneGroups = buildVoiceoverLanesForTimeline(
          clips,
          previewVoiceoverLaneForRows
        );
        result[tt] = laneGroups.map((l: VoiceoverTimelineLane) => ({
          index: l.index,
          clips: l.clips,
          isPreview: l.isPreview,
        }));
      }
    }
    return result as Record<TrackType, Lane[]>;
  }, [
    composition,
    previewBgLaneForRows,
    previewTextLaneForRows,
    previewOverlayLaneForRows,
    previewAudioLaneForRows,
    previewVoiceoverLaneForRows,
  ]);

  const handleContextMenu = useCallback(
    (clipId: string, x: number, y: number, splitTimeAtPointer: number) => {
      setContextMenu({ clipId, x, y, splitTimeAtPointer });
    },
    []
  );

  const clearTimelineSelection = useCallback(() => {
    const { clearLaneClipSelection, setSelectedClip } = useCompositionStore.getState();
    clearLaneClipSelection();
    setSelectedClip(null);
  }, []);

  const handleLaneContextMenu = useCallback(
    (e: React.MouseEvent, laneIndex: number, laneTrackType: LaneManagedTrack) => {
      clearTimelineSelection();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        laneTrackType,
        ...(laneTrackType === 'background'
          ? { backgroundLane: laneIndex }
          : laneTrackType === 'text'
            ? { textLane: laneIndex }
            : laneTrackType === 'overlay'
              ? { overlayLane: laneIndex }
              : laneTrackType === 'audio'
                ? { audioLane: laneIndex }
                : { voiceoverLane: laneIndex }),
      });
    },
    [clearTimelineSelection]
  );

  const handleEmptyAreaContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-timeline-clip]')) return;
      if (target.closest('button')) return;
      e.preventDefault();
      clearTimelineSelection();
    },
    [clearTimelineSelection]
  );

  // Global marquee selection — fires from any empty area in the scroll content
  const handleScrollContentMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      // Ignore clicks on clips, ruler, labels, or lock/eye buttons
      const target = e.target as HTMLElement;
      if (target.closest('[data-timeline-clip]')) return;
      if (target.closest('button')) return;

      const startCX = e.clientX;
      const startCY = e.clientY;

      // Clear selection immediately on plain click (no shift)
      if (!e.shiftKey) {
        clearTimelineSelection();
      }

      setMarquee({ startCX, startCY, curCX: startCX, curCY: startCY });

      const onMove = (me: MouseEvent) => {
        setMarquee((prev) =>
          prev ? { ...prev, curCX: me.clientX, curCY: me.clientY } : null
        );
      };

      const onUp = (me: MouseEvent) => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);

        const dragDist = Math.abs(me.clientX - startCX);
        if (dragDist > 4) {
          const scrollEl = scrollRef.current;
          if (scrollEl) {
            const scrollRect = scrollEl.getBoundingClientRect();
            const sl = scrollEl.scrollLeft;
            // Convert viewport X → content time, accounting for label column
            const toTime = (cx: number) =>
              (cx - scrollRect.left - LABEL_COL_WIDTH + sl) / pps;

            const selStartTime = Math.min(toTime(startCX), toTime(me.clientX));
            const selEndTime   = Math.max(toTime(startCX), toTime(me.clientX));

            const store = useCompositionStore.getState();
            const comp = store.composition;
            if (!comp) return;

            const marqueeTop = Math.min(startCY, me.clientY);
            const marqueeBottom = Math.max(startCY, me.clientY);
            const trackRows = Array.from(
              document.querySelectorAll<HTMLElement>(
                '[data-background-lane-index], [data-text-lane-index], [data-overlay-lane-index], [data-audio-lane-index], [data-voiceover-lane-index]'
              )
            );

            let laneTrackType: LaneManagedTrack | null = null;
            for (const row of trackRows) {
              const rect = row.getBoundingClientRect();
              const mid = (rect.top + rect.bottom) / 2;
              if (mid >= marqueeTop && mid <= marqueeBottom) {
                if (row.dataset.backgroundLaneIndex != null) {
                  laneTrackType = 'background';
                } else if (row.dataset.textLaneIndex != null) {
                  laneTrackType = 'text';
                } else if (row.dataset.overlayLaneIndex != null) {
                  laneTrackType = 'overlay';
                } else if (row.dataset.audioLaneIndex != null) {
                  laneTrackType = 'audio';
                } else {
                  laneTrackType = 'voiceover';
                }
                break;
              }
            }

            if (!laneTrackType) return;

            const pool =
              laneTrackType === 'background'
                ? comp.tracks.background
                : laneTrackType === 'text'
                  ? comp.tracks.text
                  : laneTrackType === 'overlay'
                    ? comp.tracks.overlay
                    : laneTrackType === 'audio'
                      ? comp.tracks.audio
                      : comp.tracks.voiceover;
            const hit = pool
              .filter((c) => c.startTime < selEndTime && c.endTime > selStartTime)
              .map((c) => c.id);

            if (hit.length > 0) {
              const prev =
                store.selectedClipTrackType === laneTrackType
                  ? store.selectedClipIds
                  : [];
              const merged = me.shiftKey
                ? Array.from(new Set([...prev, ...hit]))
                : hit;
              if (laneTrackType === 'background') {
                store.setBackgroundClipSelection(merged);
              } else if (laneTrackType === 'text') {
                store.setTextClipSelection(merged);
              } else if (laneTrackType === 'overlay') {
                store.setOverlayClipSelection(merged);
              } else if (laneTrackType === 'audio') {
                store.setAudioClipSelection(merged);
              } else {
                store.setVoiceoverClipSelection(merged);
              }
            }
          }
        }

        setMarquee(null);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [pps, clearTimelineSelection]
  );

  // Ctrl/Cmd + molette : zoom timeline (voir useEditorShortcuts, zone data-editor-timeline-zone)

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const syncScroll = () => setTimelineScrollLeft(el.scrollLeft);
    syncScroll();
    el.addEventListener('scroll', syncScroll, { passive: true });
    return () => el.removeEventListener('scroll', syncScroll);
  }, []);

  return (
    <div
      ref={wrapRef}
      data-editor-timeline-zone
      className={`flex flex-col border-t border-neutral-200 overflow-hidden h-full relative ${TIMELINE_LIGHT.surfaceBg}`}
    >
      {/* Vertical resize handle — parent supplies the handler */}
      {onResizeStart && (
        <div
          onMouseDown={onResizeStart}
          className="absolute top-0 left-0 right-0 h-1 z-40 cursor-row-resize bg-transparent hover:bg-neutral-400/40 transition-colors"
          title="Glisser pour redimensionner la timeline"
        />
      )}

      <div className="relative flex flex-1 flex-col min-h-0">
        <div
          className="flex shrink-0 border-b border-neutral-200/80 bg-white"
          style={{ height: RULER_HEIGHT }}
        >
          <div
            className="shrink-0 border-r border-neutral-200/60 bg-white"
            style={{ width: LABEL_COL_WIDTH }}
            aria-hidden
          />
          <TimelineRuler
            totalDuration={totalDuration}
            pps={pps}
            zoom={zoom}
            onClickTime={setCurrentTime}
          />
        </div>

        <div
          ref={scrollRef}
          className="relative flex-1 overflow-x-auto overflow-y-auto"
        >
          <div
            className="flex flex-col"
            style={{ minWidth: totalWidth + LABEL_COL_WIDTH, gap: LANE_GAP }}
            onMouseDown={handleScrollContentMouseDown}
            onContextMenu={handleEmptyAreaContextMenu}
          >
            {TRACK_ORDER.map((trackType) => {
              const lanes = lanesByTrack[trackType];
              const safeLanes: Lane[] = lanes.length > 0 ? lanes : [{ index: 0, clips: [] }];

              return safeLanes.map((lane) => (
                <LaneRow
                  key={`${trackType}-${lane.index}${lane.isPreview ? '-preview' : ''}`}
                  trackType={trackType}
                  laneIndex={lane.index}
                  clips={lane.clips}
                  pps={pps}
                  totalWidth={totalWidth}
                  isPreviewLane={lane.isPreview}
                  laneDragPreview={
                    trackType === 'background'
                      ? bgDragPreview
                      : trackType === 'text'
                        ? textDragPreview
                        : trackType === 'overlay'
                          ? overlayDragPreview
                          : trackType === 'audio'
                            ? audioDragPreview
                            : trackType === 'voiceover'
                              ? voiceoverDragPreview
                              : null
                  }
                  onLaneDragStart={
                    trackType === 'background'
                      ? beginBackgroundDrag
                      : trackType === 'text'
                        ? beginTextDrag
                        : trackType === 'overlay'
                          ? beginOverlayDrag
                          : trackType === 'audio'
                            ? beginAudioDrag
                            : trackType === 'voiceover'
                              ? beginVoiceoverDrag
                              : undefined
                  }
                  onContextMenu={handleContextMenu}
                  onLaneContextMenu={
                    trackType === 'background' ||
                    trackType === 'text' ||
                    trackType === 'overlay' ||
                    trackType === 'audio' ||
                    trackType === 'voiceover'
                      ? handleLaneContextMenu
                      : undefined
                  }
                />
              ));
            })}
          </div>
        </div>

        <TimelinePlayhead
          currentTime={currentTime}
          pps={pps}
          scrollLeft={timelineScrollLeft}
          rulerHeight={RULER_HEIGHT}
          onDrag={setCurrentTime}
        />
      </div>

      {contextMenu && (
        <ClipContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
      )}

      {bgDragGhost && draggedBgClip && (
        <TimelineLaneDragGhost
          clip={draggedBgClip}
          ghost={bgDragGhost}
          trackType="background"
        />
      )}
      {textDragGhost && draggedTextClip && (
        <TimelineLaneDragGhost
          clip={draggedTextClip}
          ghost={textDragGhost}
          trackType="text"
        />
      )}
      {overlayDragGhost && draggedOverlayClip && (
        <TimelineLaneDragGhost
          clip={draggedOverlayClip}
          ghost={overlayDragGhost}
          trackType="overlay"
        />
      )}
      {audioDragGhost && draggedAudioClip && (
        <TimelineLaneDragGhost
          clip={draggedAudioClip}
          ghost={audioDragGhost}
          trackType="audio"
        />
      )}
      {voiceoverDragGhost && draggedVoiceoverClip && (
        <TimelineLaneDragGhost
          clip={draggedVoiceoverClip}
          ghost={voiceoverDragGhost}
          trackType="voiceover"
        />
      )}

      {/* Global marquee overlay — fixed so it spans across all lanes regardless of scroll */}
      {marquee &&
        Math.abs(marquee.curCX - marquee.startCX) > 4 && (
          <div
            className="pointer-events-none"
            style={{
              position: 'fixed',
              left: Math.min(marquee.startCX, marquee.curCX),
              top: Math.min(marquee.startCY, marquee.curCY),
              width: Math.abs(marquee.curCX - marquee.startCX),
              height: Math.abs(marquee.curCY - marquee.startCY),
              backgroundColor: 'rgba(34, 211, 238, 0.10)',
              border: '1.5px solid rgba(34, 211, 238, 0.80)',
              borderRadius: 4,
              zIndex: 9999,
            }}
          />
        )}
    </div>
  );
}
