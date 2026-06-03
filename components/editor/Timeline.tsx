'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Clip, TrackType } from '@/types/composition';
import {
  buildBackgroundLanesForTimeline,
  getClipBackgroundLane,
  getLane0Clips,
  type BackgroundTimelineLane,
} from '@/lib/backgroundLanes';
import {
  buildBackgroundDragPreview,
  clampBackgroundDragPointer,
  resolveBackgroundLaneForDrag,
  type BackgroundDragGhost,
  type BackgroundDragPreview,
} from '@/lib/timelineBackgroundDrag';
import { PRIMARY_BACKGROUND_LANE } from '@/lib/backgroundLanes';
import { useCompositionStore } from '@/stores/compositionStore';
import { TransitionMarker } from '@/components/editor/TransitionMarker';
import { AudioWaveform } from '@/components/editor/AudioWaveform';
import {
  IconLock,
  IconUnlock,
  IconEye,
  IconEyeOff,
  IconVolume,
  IconVolumeMute,
  IconSplit,
  IconCopy,
  IconDuplicate,
  IconTrash,
  IconClipDiamond,
  IconClipText,
  IconClipFilm,
  IconClipMusic,
  IconClipMic,
} from '@/components/editor/TimelineIcons';
import { TimelineTrimHandle } from '@/components/editor/TimelineTrimHandle';
import {
  TIMELINE_LIGHT,
  CLIP_DROP_TRACE,
  CLIP_SELECTION,
  CLIP_ICON_WIDTH,
  LANE_HEIGHT,
  LANE_GAP,
  LABEL_COL_WIDTH,
  LANE_CLIP_INSET_Y,
  TRANSITION_RAIL_HEIGHT,
  TRIM_JUNCTION_INSET_PX,
  RULER_HEIGHT,
  PLAYHEAD,
  getClipStyleForTrack,
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

function assignLanes(clips: Clip[]): Lane[] {
  const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
  const lanes: Clip[][] = [];
  for (const clip of sorted) {
    let placed = false;
    for (const lane of lanes) {
      const last = lane[lane.length - 1];
      if (last.endTime <= clip.startTime + 0.001) {
        lane.push(clip);
        placed = true;
        break;
      }
    }
    if (!placed) lanes.push([clip]);
  }
  return lanes.map((c, i) => ({ index: i, clips: c }));
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

interface CtxMenu { clipId: string; x: number; y: number; }

function ClipContextMenu({ menu, onClose }: { menu: CtxMenu; onClose: () => void }) {
  const { removeClip, addClip, splitClip, setClipboard, composition, currentTime } =
    useCompositionStore();

  const findClip = (): Clip | undefined => {
    if (!composition) return;
    return [
      ...composition.tracks.background,
      ...composition.tracks.text,
      ...composition.tracks.audio,
      ...composition.tracks.overlay,
      ...composition.tracks.voiceover,
    ].find((c) => c.id === menu.clipId);
  };

  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [onClose]);

  const items: {
    label: string;
    icon: React.ReactNode;
    action: () => void;
    danger?: boolean;
  }[] = [
    {
      label: 'Couper au playhead',
      icon: <IconSplit />,
      action: () => {
        splitClip(menu.clipId, currentTime);
        onClose();
      },
    },
    {
      label: 'Copier',
      icon: <IconCopy />,
      action: () => {
        const c = findClip();
        if (c) setClipboard(c);
        onClose();
      },
    },
    {
      label: 'Dupliquer',
      icon: <IconDuplicate />,
      action: () => {
        const c = findClip();
        if (!c) return;
        const d = c.endTime - c.startTime;
        addClip({
          ...c,
          id: `${c.id}-dup-${Date.now()}`,
          startTime: c.endTime,
          endTime: c.endTime + d,
        });
        onClose();
      },
    },
    {
      label: 'Supprimer',
      icon: <IconTrash />,
      action: () => {
        removeClip(menu.clipId);
        onClose();
      },
      danger: true,
    },
  ];

  return (
    <div
      className="fixed z-[200] rounded-lg border border-neutral-200 bg-white shadow-lg py-1 min-w-[180px]"
      style={{ left: menu.x, top: menu.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.action}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-neutral-800 transition-colors hover:bg-neutral-100"
        >
          <span className="shrink-0 text-neutral-500">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Single clip block
// ──────────────────────────────────────────────────────────────────────────────

export type { BackgroundDragPreview };

/** Miniature qui suit le curseur partout (preview / canvas / timeline). */
function TimelineBackgroundDragGhost({
  clip,
  ghost,
}: {
  clip: Clip;
  ghost: BackgroundDragGhost;
}) {
  const style = getClipStyleForTrack('background');
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
function TimelineMediaTrace({
  clip,
  traceStart,
  traceEnd,
  pps,
}: {
  clip: Clip;
  traceStart: number;
  traceEnd: number;
  pps: number;
}) {
  const left = traceStart * pps;
  const width = Math.max(12, (traceEnd - traceStart) * pps);
  const style = getClipStyleForTrack('background');
  const label =
    clip.sequenceLabel ??
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
  clipBackgroundLane?: number;
  bgDragPreview?: BackgroundDragPreview | null;
  onBackgroundDragStart?: (
    clip: Clip,
    e: React.MouseEvent,
    sourceLane: number,
    sourceRect: DOMRect
  ) => void;
  trimLeftInset?: number;
  trimRightInset?: number;
  onContextMenu: (clipId: string, x: number, y: number) => void;
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

function ClipIconBadge({ trackType, style }: { trackType: TrackType; style: ClipTrackStyle }) {
  return (
    <div
      className="relative z-20 flex shrink-0 items-center justify-center"
      style={{
        width: CLIP_ICON_WIDTH,
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
  clipBackgroundLane = 0,
  bgDragPreview = null,
  onBackgroundDragStart,
  trimLeftInset = 0,
  trimRightInset = 0,
  onContextMenu,
}: TimelineClipProps) {
  const {
    selectedClipId, snapEnabled, laneLocked,
    setSelectedClip, moveClip, resizeClip, saveToHistory, updateClip,
  } = useCompositionStore();

  const isSelected = selectedClipId === clip.id;
  const isLocked = laneLocked[laneKey] ?? false;

  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragStartTime = useRef<number>(0);

  const isBackgroundTrack = trackType === 'background';
  const isDraggedClip = bgDragPreview?.clipId === clip.id;
  const hideWhileDragging = isBackgroundTrack && isDraggedClip;

  const left = clip.startTime * pps;
  const width = Math.max(12, (clip.endTime - clip.startTime) * pps);

  const handleDragMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    if (isLocked) { setSelectedClip(clip.id); return; }
    if ((e.target as HTMLElement).dataset.resizeHandle) return;
    setSelectedClip(clip.id);

    if (isBackgroundTrack && onBackgroundDragStart) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      onBackgroundDragStart(clip, e, clipBackgroundLane, rect);
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
    saveToHistory,
    moveClip,
    isLocked,
    isBackgroundTrack,
    onBackgroundDragStart,
    clipBackgroundLane,
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
      onClick={() => setSelectedClip(clip.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!isLocked) onContextMenu(clip.id, e.clientX, e.clientY);
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
        <ClipIconBadge trackType={trackType} style={style} />

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
              widthPx={Math.max(12, width - CLIP_ICON_WIDTH)}
              trimStart={clip.trimStart ?? 0}
              visibleDuration={clipDuration}
              baseColor={style.waveColor ?? '#2d6b4f'}
            />
          )}

          <div
            className={`relative flex items-center gap-1 truncate leading-tight ${
              isAudioTrack
                ? 'h-[14px] pl-1 pr-1.5 text-[9px] font-medium'
                : 'px-1.5 py-0.5 text-[10px] font-semibold'
            }`}
            style={{
              color: style.labelColor,
              backgroundColor: style.labelBgColor,
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
  bgDragPreview?: BackgroundDragPreview | null;
  onBackgroundDragStart?: (
    clip: Clip,
    e: React.MouseEvent,
    sourceLane: number,
    sourceRect: DOMRect
  ) => void;
  onContextMenu: (clipId: string, x: number, y: number) => void;
}

function LaneRow({
  trackType,
  laneIndex,
  clips,
  pps,
  totalWidth,
  isPreviewLane = false,
  bgDragPreview = null,
  onBackgroundDragStart,
  onContextMenu,
}: LaneRowProps) {
  const info = TRACK_INFO[trackType];
  const showHeader = trackType === 'background' ? laneIndex === 0 : laneIndex === 0;
  const selectedClipId = useCompositionStore((s) => s.selectedClipId);
  const { laneHidden, laneLocked, toggleLaneHidden, toggleLaneLocked } = useCompositionStore();
  const composition = useCompositionStore((s) => s.composition);
  const bgClips = composition?.tracks.background ?? [];
  const bgFirstLane = trackType === 'background' && laneIndex === 0;

  const displayClips = useMemo(() => {
    if (!bgDragPreview || trackType !== 'background') return clips;

    if (
      laneIndex === bgDragPreview.targetLane &&
      bgDragPreview.laneRippleLayout
    ) {
      return bgDragPreview.laneRippleLayout;
    }

    return clips.filter((c) => c.id !== bgDragPreview.clipId);
  }, [clips, bgDragPreview, trackType, laneIndex]);

  const traceDraggedClip = useMemo(() => {
    if (!bgDragPreview) return null;
    return bgClips.find((c) => c.id === bgDragPreview.clipId) ?? null;
  }, [bgDragPreview, bgClips]);

  const showDropTrace =
    traceDraggedClip != null &&
    bgDragPreview != null &&
    laneIndex === bgDragPreview.targetLane;

  // Per-lane key, e.g. "background-1"
  // Each lane has its own key and its own independent state — no coupling to track-level state
  const laneKey    = `${trackType}-${laneIndex}`;
  const isHidden   = laneHidden[laneKey] ?? false;
  const isLocked   = laneLocked[laneKey] ?? false;
  const laneHasSelection =
    !!selectedClipId && displayClips.some((c) => c.id === selectedClipId);
  const stripBg = isPreviewLane
    ? 'repeating-linear-gradient(-45deg, #e8eaef 0, #e8eaef 6px, #f4f5f7 6px, #f4f5f7 12px)'
    : laneStripBackground(laneHasSelection, isLocked);

  return (
    <div
      className="flex relative shrink-0"
      style={{ height: LANE_HEIGHT }}
      data-background-lane-index={
        trackType === 'background' ? laneIndex : undefined
      }
    >
      {/* En-tête piste — toujours blanc (début sans couleur, ref. CapCut) */}
      <div
        className={`shrink-0 flex items-center justify-between gap-1.5 px-2 border-r border-neutral-200/50 bg-white ${
          isLocked ? 'opacity-60' : ''
        }`}
        style={{ width: LABEL_COL_WIDTH }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-px shrink-0 self-stretch bg-neutral-300" aria-hidden />
          <span
            className={`text-[11px] font-semibold truncate ${
              showHeader ? 'text-neutral-800' : 'text-neutral-500'
            }`}
          >
            {info.short}
            {laneIndex + 1}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => toggleLaneLocked(laneKey)}
            title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              isLocked
                ? 'bg-white/70 text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:bg-white/50 hover:text-neutral-900'
            }`}
          >
            {isLocked ? <IconLock /> : <IconUnlock />}
          </button>
          <button
            type="button"
            onClick={() => toggleLaneHidden(laneKey)}
            title={isHidden ? 'Afficher' : 'Masquer'}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              isHidden
                ? 'text-neutral-400'
                : 'text-neutral-600 hover:bg-white/50'
            }`}
          >
            {isHidden ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
      </div>

      {/* Zone clips — fond gris dès 0 s (sans bande blanche) */}
      <div
        className={`relative flex-1 ${isHidden ? 'opacity-25 pointer-events-none' : ''}`}
        style={{ minWidth: totalWidth }}
      >
        <div
          className="absolute inset-0 transition-[background] duration-150"
          style={{ background: stripBg }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${pps - 1}px, ${TIMELINE_LIGHT.gridLine} ${pps - 1}px, ${TIMELINE_LIGHT.gridLine} ${pps}px)`,
          }}
        />

        {/* Rail transitions — au-dessus des clips (z-60, pas de conflit trim) */}
        {bgFirstLane && (
          <div
            className="absolute left-0 right-0 z-[60] pointer-events-none"
            style={{
              top: Math.max(0, LANE_CLIP_INSET_Y - TRANSITION_RAIL_HEIGHT),
              height: TRANSITION_RAIL_HEIGHT,
            }}
          >
            {getLane0Clips(bgClips).slice(0, -1).map((clip, i, lane0) => {
              const next = lane0[i + 1];
              if (!next) return null;
              if (!clips.includes(clip) || !clips.includes(next)) return null;
              const gap = next.startTime - clip.endTime;
              if (gap > 0.05) return null;
              return (
                <TransitionMarker key={`tr-${clip.id}`} fromClip={clip} toClip={next} pps={pps} />
              );
            })}
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{ top: LANE_CLIP_INSET_Y, bottom: LANE_CLIP_INSET_Y }}
        >
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
                clipBackgroundLane={laneIndex}
                bgDragPreview={bgDragPreview}
                onBackgroundDragStart={onBackgroundDragStart}
                trimLeftInset={touchesPrev ? TRIM_JUNCTION_INSET_PX : 0}
                trimRightInset={touchesNext ? TRIM_JUNCTION_INSET_PX : 0}
                onContextMenu={onContextMenu}
              />
            );
          })}
          {showDropTrace && traceDraggedClip && (
            <TimelineMediaTrace
              clip={traceDraggedClip}
              traceStart={bgDragPreview.displayTraceStart}
              traceEnd={bgDragPreview.displayTraceEnd}
              pps={pps}
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

function TimelinePlayhead({
  currentTime,
  pps,
  scrollLeft,
  rulerHeight,
  tracksHeight,
  onDrag,
}: {
  currentTime: number;
  pps: number;
  scrollLeft: number;
  rulerHeight: number;
  tracksHeight: number;
  onDrag: (t: number) => void;
}) {
  const centerX = LABEL_COL_WIDTH + currentTime * pps - scrollLeft;
  const totalHeight = rulerHeight + tracksHeight;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startTime = currentTime;
      const onMove = (me: MouseEvent) =>
        onDrag(Math.max(0, startTime + (me.clientX - startX) / pps));
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [currentTime, pps, onDrag]
  );

  return (
    <div
      className="absolute top-0 flex flex-col items-center pointer-events-none"
      style={{
        left: centerX,
        transform: 'translateX(-50%)',
        height: totalHeight,
        width: Math.max(PLAYHEAD.headWidthPx + 8, 20),
        zIndex: PLAYHEAD.zIndex,
      }}
      role="slider"
      aria-label="Tête de lecture"
      aria-valuenow={currentTime}
    >
      {/* Poignée — seule zone cliquable (le trait ne bloque plus les clips) */}
      <div
        className="pointer-events-auto shrink-0 cursor-ew-resize rounded-[3px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)]"
        style={{
          width: PLAYHEAD.headWidthPx,
          height: PLAYHEAD.headHeightPx,
          marginTop: Math.max(0, (rulerHeight - PLAYHEAD.headHeightPx) / 2),
          border: `${PLAYHEAD.headBorderPx}px solid ${TIMELINE_LIGHT.playheadLine}`,
        }}
        onMouseDown={handleMouseDown}
      />
      <div
        className="flex-1 min-h-0 pointer-events-none"
        style={{
          width: PLAYHEAD.lineWidthPx,
          backgroundColor: TIMELINE_LIGHT.playheadLine,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.35)',
        }}
      />
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
    undo,
  } = useCompositionStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<CtxMenu | null>(null);
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0);
  const [bgDragPreview, setBgDragPreview] = useState<BackgroundDragPreview | null>(
    null
  );
  const [bgDragGhost, setBgDragGhost] = useState<BackgroundDragGhost | null>(null);
  const bgDragPreviewRef = useRef<BackgroundDragPreview | null>(null);
  const bgDragRafRef = useRef<number | null>(null);
  const bgDragClipIdRef = useRef<string | null>(null);
  const bgDragGrabRef = useRef({
    grabDx: 0,
    grabDy: 0,
    width: 80,
    height: LANE_HEIGHT - LANE_CLIP_INSET_Y * 2,
  });
  const bgDragSourceLaneRef = useRef(0);
  const bgDragStartClientYRef = useRef(0);
  const rowStepPx = LANE_HEIGHT + LANE_GAP;

  const pps = 80 * zoom;

  const draggedBgClip = useMemo(() => {
    if (!bgDragPreview) return null;
    const bg = composition?.tracks.background ?? [];
    return bg.find((c) => c.id === bgDragPreview.clipId) ?? null;
  }, [bgDragPreview, composition]);

  const beginBackgroundDrag = useCallback(
    (clip: Clip, e: React.MouseEvent, sourceLane: number, sourceRect: DOMRect) => {
      saveToHistory();
      setSelectedClip(clip.id);
      bgDragClipIdRef.current = clip.id;
      bgDragSourceLaneRef.current = sourceLane;
      bgDragStartClientYRef.current = e.clientY;
      bgDragPreviewRef.current = null;
      setBgDragPreview(null);
      bgDragGrabRef.current = {
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

        const allBg =
          useCompositionStore.getState().composition?.tracks.background ?? [];
        const current = allBg.find((c) => c.id === clip.id);
        if (!current) return;

        const snap = useCompositionStore.getState().snapEnabled;
        const comp = useCompositionStore.getState().composition;
        const duration = Math.max(0.1, current.endTime - current.startTime);
        const totalDur = Math.max(comp?.duration ?? 0, 10);
        const maxGhostStart = Math.max(0, totalDur - duration);

        const clamped = clampBackgroundDragPointer(
          clientX,
          clientY,
          bgDragGrabRef.current.grabDx,
          bgDragGrabRef.current.grabDy,
          bgDragGrabRef.current.height,
          scrollEl,
          pps,
          maxGhostStart
        );

        let ghostTime = clamped.ghostStartTime;
        if (snap) ghostTime = Math.round(ghostTime * 10) / 10;

        const targetLane = resolveBackgroundLaneForDrag(
          clamped.clientY,
          bgDragSourceLaneRef.current,
          bgDragStartClientYRef.current,
          rowStepPx
        );
        const preview = buildBackgroundDragPreview(
          current,
          allBg,
          targetLane,
          ghostTime,
          { pinnedToTimelineStart: clamped.pinnedToTimelineStart }
        );
        bgDragPreviewRef.current = preview;
        setBgDragPreview(preview);
        setBgDragGhost({
          clipId: clip.id,
          clientX: clamped.clientX,
          clientY: clamped.clientY,
          ...bgDragGrabRef.current,
        });
      };

      const onMove = (me: MouseEvent) => {
        if (bgDragRafRef.current != null) return;
        bgDragRafRef.current = requestAnimationFrame(() => {
          bgDragRafRef.current = null;
          tick(me.clientX, me.clientY);
        });
      };

      const onUp = (me: MouseEvent) => {
        if (bgDragRafRef.current != null) {
          cancelAnimationFrame(bgDragRafRef.current);
          bgDragRafRef.current = null;
        }
        tick(me.clientX, me.clientY);

        const preview = bgDragPreviewRef.current;
        const clipId = bgDragClipIdRef.current;
        if (clipId && preview?.clipId === clipId) {
          commitBackgroundDragPreview(preview);
        } else {
          undo();
        }

        bgDragPreviewRef.current = null;
        bgDragClipIdRef.current = null;
        setBgDragPreview(null);
        setBgDragGhost(null);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      tick(e.clientX, e.clientY);
    },
    [pps, rowStepPx, saveToHistory, setSelectedClip, commitBackgroundDragPreview, undo]
  );

  const totalDuration = Math.max(composition?.duration ?? 0, 10);
  const totalWidth = totalDuration * pps;

  const previewLaneForRows = useMemo(() => {
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

  const lanesByTrack = useMemo(() => {
    const result: Partial<Record<TrackType, Lane[]>> = {};
    for (const tt of TRACK_ORDER) {
      const clips = composition?.tracks[tt] ?? [];
      if (tt === 'background') {
        const laneGroups = buildBackgroundLanesForTimeline(
          clips,
          previewLaneForRows
        );
        result[tt] = laneGroups.map((l: BackgroundTimelineLane) => ({
          index: l.index,
          clips: l.clips,
          isPreview: l.isPreview,
        }));
      } else {
        result[tt] = assignLanes(clips);
      }
    }
    return result as Record<TrackType, Lane[]>;
  }, [composition, previewLaneForRows]);

  const totalLaneCount = useMemo(() => {
    let n = 0;
    for (const tt of TRACK_ORDER) {
      n += Math.max(1, lanesByTrack[tt].length);
    }
    return n;
  }, [lanesByTrack]);

  const totalHeight =
    totalLaneCount * LANE_HEIGHT + Math.max(0, totalLaneCount - 1) * LANE_GAP;

  const handleContextMenu = useCallback((clipId: string, x: number, y: number) => {
    setContextMenu({ clipId, x, y });
  }, []);

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
                  bgDragPreview={
                    trackType === 'background' ? bgDragPreview : null
                  }
                  onBackgroundDragStart={
                    trackType === 'background' ? beginBackgroundDrag : undefined
                  }
                  onContextMenu={handleContextMenu}
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
          tracksHeight={totalHeight}
          onDrag={setCurrentTime}
        />
      </div>

      {contextMenu && (
        <ClipContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
      )}

      {bgDragGhost && draggedBgClip && (
        <TimelineBackgroundDragGhost clip={draggedBgClip} ghost={bgDragGhost} />
      )}
    </div>
  );
}
