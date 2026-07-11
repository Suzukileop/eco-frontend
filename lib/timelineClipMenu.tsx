'use client';

import type { Clip } from '@/types/composition';
import type { CapCutMenuItem } from '@/components/editor/CapCutContextMenu';
import { getClipBackgroundLane } from '@/lib/backgroundLanes';
import { getClipTextLane } from '@/lib/textLanes';
import { getClipOverlayLane } from '@/lib/overlayLanes';
import { getClipAudioLane } from '@/lib/audioLanes';
import { getClipVoiceoverLane } from '@/lib/voiceoverLanes';
import { downloadFromUrl, extensionFromUrl } from '@/lib/download';
import {
  IconCopy,
  IconCut,
  IconDownload,
  IconDuplicate,
  IconPaste,
  IconSplit,
  IconTrash,
} from '@/components/editor/TimelineIcons';
import { isBackgroundClipboardClip } from '@/lib/backgroundPaste';
import { isTextClipboardClip } from '@/lib/textPaste';
import { isOverlayClipboardClip } from '@/lib/overlayPaste';
import { isAudioClipboardClip } from '@/lib/audioPaste';
import { isVoiceoverClipboardClip } from '@/lib/voiceoverPaste';
import { useCompositionStore } from '@/stores/compositionStore';

type LaneManagedTrack = 'background' | 'text' | 'overlay' | 'audio' | 'voiceover';

function findClip(clipId: string): Clip | undefined {
  const composition = useCompositionStore.getState().composition;
  if (!composition) return undefined;
  return [
    ...composition.tracks.background,
    ...composition.tracks.text,
    ...composition.tracks.audio,
    ...composition.tracks.overlay,
    ...composition.tracks.voiceover,
  ].find((c) => c.id === clipId);
}

function findClipsByIds(ids: string[]): Clip[] {
  const composition = useCompositionStore.getState().composition;
  if (!composition) return [];
  const all = [
    ...composition.tracks.background,
    ...composition.tracks.text,
    ...composition.tracks.audio,
    ...composition.tracks.overlay,
    ...composition.tracks.voiceover,
  ];
  const set = new Set(ids);
  return all.filter((c) => set.has(c.id));
}

function defaultExtensionForClip(clip: Clip): string {
  if (clip.type === 'video') return 'mp4';
  if (clip.type === 'audio') return 'mp3';
  if (clip.type === 'image') return 'png';
  return 'bin';
}

function buildDownloadFilename(clip: Clip): string {
  const fromUrl = clip.url?.split('/').pop()?.split('?')[0];
  if (fromUrl && fromUrl.includes('.')) return fromUrl;
  const base =
    clip.sequenceLabel?.replace(/[^\w.-]+/g, '_') ||
    fromUrl ||
    `clip-${clip.id.slice(0, 8)}`;
  const ext = clip.url
    ? extensionFromUrl(clip.url, defaultExtensionForClip(clip))
    : defaultExtensionForClip(clip);
  return base.includes('.') ? base : `${base}.${ext}`;
}

async function downloadTimelineClip(clip: Clip): Promise<void> {
  if (!clip.url) return;
  await downloadFromUrl(clip.url, buildDownloadFilename(clip));
}

function getLaneTrackType(clip: Clip | undefined): LaneManagedTrack | null {
  if (
    clip?.trackType === 'background' ||
    clip?.trackType === 'text' ||
    clip?.trackType === 'overlay' ||
    clip?.trackType === 'audio' ||
    clip?.trackType === 'voiceover'
  ) {
    return clip.trackType;
  }
  return null;
}

function getSelectedIdsForTrack(
  state: ReturnType<typeof useCompositionStore.getState>,
  trackType: LaneManagedTrack
): string[] {
  if (trackType === 'background') return state.getSelectedBackgroundClipIds();
  if (trackType === 'text') return state.getSelectedTextClipIds();
  if (trackType === 'overlay') return state.getSelectedOverlayClipIds();
  if (trackType === 'audio') return state.getSelectedAudioClipIds();
  return state.getSelectedVoiceoverClipIds();
}

function copySelectedForTrack(
  state: ReturnType<typeof useCompositionStore.getState>,
  trackType: LaneManagedTrack
): void {
  if (trackType === 'background') {
    state.copySelectedBackgroundClips();
  } else if (trackType === 'text') {
    state.copySelectedTextClips();
  } else if (trackType === 'overlay') {
    state.copySelectedOverlayClips();
  } else if (trackType === 'audio') {
    state.copySelectedAudioClips();
  } else {
    state.copySelectedVoiceoverClips();
  }
}

function pasteClipboardForTrack(
  state: ReturnType<typeof useCompositionStore.getState>,
  trackType: LaneManagedTrack,
  preferredLane: number
): void {
  if (trackType === 'background') {
    state.pasteBackgroundClipboard(preferredLane);
  } else if (trackType === 'text') {
    state.pasteTextClipboard(preferredLane);
  } else if (trackType === 'overlay') {
    state.pasteOverlayClipboard(preferredLane);
  } else if (trackType === 'audio') {
    state.pasteAudioClipboard(preferredLane);
  } else {
    state.pasteVoiceoverClipboard(preferredLane);
  }
}

function duplicateForTrack(
  state: ReturnType<typeof useCompositionStore.getState>,
  trackType: LaneManagedTrack,
  clips: Clip[]
): void {
  if (trackType === 'background') {
    state.duplicateBackgroundClips(clips);
  } else if (trackType === 'text') {
    state.duplicateTextClips(clips);
  } else if (trackType === 'overlay') {
    state.duplicateOverlayClips(clips);
  } else if (trackType === 'audio') {
    state.duplicateAudioClips(clips);
  } else {
    state.duplicateVoiceoverClips(clips);
  }
}

function clearSelectionForTrack(
  state: ReturnType<typeof useCompositionStore.getState>,
  trackType: LaneManagedTrack
): void {
  if (trackType === 'background') {
    state.clearBackgroundClipSelection();
  } else if (trackType === 'text') {
    state.clearTextClipSelection();
  } else if (trackType === 'overlay') {
    state.clearOverlayClipSelection();
  } else if (trackType === 'audio') {
    state.clearAudioClipSelection();
  } else {
    state.clearVoiceoverClipSelection();
  }
}

function hasClipboardForTrack(
  state: ReturnType<typeof useCompositionStore.getState>,
  trackType: LaneManagedTrack
): boolean {
  if (trackType === 'background') {
    return (
      isBackgroundClipboardClip(state.clipboard) ||
      (state.clipboardMulti != null &&
        state.clipboardMulti.length > 0 &&
        state.clipboardMulti[0]?.trackType === 'background')
    );
  }
  if (trackType === 'text') {
    return (
      isTextClipboardClip(state.clipboard) ||
      (state.clipboardMulti != null &&
        state.clipboardMulti.length > 0 &&
        state.clipboardMulti[0]?.trackType === 'text')
    );
  }
  if (trackType === 'overlay') {
    return (
      isOverlayClipboardClip(state.clipboard) ||
      (state.clipboardMulti != null &&
        state.clipboardMulti.length > 0 &&
        state.clipboardMulti[0]?.trackType === 'overlay')
    );
  }
  if (trackType === 'audio') {
    return (
      isAudioClipboardClip(state.clipboard) ||
      (state.clipboardMulti != null &&
        state.clipboardMulti.length > 0 &&
        state.clipboardMulti[0]?.trackType === 'audio')
    );
  }
  return (
    isVoiceoverClipboardClip(state.clipboard) ||
    (state.clipboardMulti != null &&
      state.clipboardMulti.length > 0 &&
      state.clipboardMulti[0]?.trackType === 'voiceover')
  );
}

function preferredLaneForClip(clip: Clip): number {
  if (clip.trackType === 'text') return getClipTextLane(clip);
  if (clip.trackType === 'overlay') return getClipOverlayLane(clip);
  if (clip.trackType === 'audio') return getClipAudioLane(clip);
  if (clip.trackType === 'voiceover') return getClipVoiceoverLane(clip);
  return getClipBackgroundLane(clip);
}

export function buildTimelineClipMenuItems(
  clipId: string,
  splitTimeAtPointer: number | undefined,
  onClose: () => void
): CapCutMenuItem[] {
  const state = useCompositionStore.getState();
  const clip = findClip(clipId);
  const laneTrack = getLaneTrackType(clip);
  const isLaneClip = laneTrack != null;

  const multiIds = laneTrack ? getSelectedIdsForTrack(state, laneTrack) : [];
  const isMultiSelect = multiIds.length > 1 && multiIds.includes(clipId);
  const selectedClips = isMultiSelect ? findClipsByIds(multiIds) : [];

  const hasClipboard = laneTrack ? hasClipboardForTrack(state, laneTrack) : false;

  const splitTime =
    splitTimeAtPointer ??
    (clip
      ? Math.max(
          clip.startTime + 0.05,
          Math.min(clip.endTime - 0.05, state.currentTime)
        )
      : state.currentTime);

  const canSplit =
    !isMultiSelect &&
    !!clip &&
    splitTime > clip.startTime + 0.05 &&
    splitTime < clip.endTime - 0.05;
  const canDownload = !isMultiSelect && !!clip?.url;

  const closeAnd = (fn: () => void) => () => {
    fn();
    onClose();
  };

  if (!isLaneClip || !laneTrack) {
    return [
      {
        id: 'delete',
        label: 'Supprimer',
        icon: <IconTrash />,
        shortcut: ['Suppr'],
        disabled: !clip,
        action: closeAnd(() => state.removeClip(clipId)),
      },
    ];
  }

  // ── Single-clip actions ──────────────────────────────────────────────────────
  if (!isMultiSelect) {
    return [
      {
        id: 'split',
        label: 'Diviser',
        icon: <IconSplit />,
        shortcut: ['Ctrl', 'B'],
        disabled: !canSplit,
        action: closeAnd(() => state.splitClip(clipId, splitTime)),
      },
      {
        id: 'copy',
        label: 'Copier',
        icon: <IconCopy />,
        shortcut: ['Ctrl', 'C'],
        action: closeAnd(() => copySelectedForTrack(state, laneTrack)),
      },
      {
        id: 'cut',
        label: 'Couper',
        icon: <IconCut />,
        shortcut: ['Ctrl', 'X'],
        action: closeAnd(() => {
          state.saveToHistory();
          copySelectedForTrack(state, laneTrack);
          const ids = getSelectedIdsForTrack(state, laneTrack);
          if (ids.length > 1) {
            state.removeClips(ids);
            clearSelectionForTrack(state, laneTrack);
          } else if (ids.length === 1) {
            state.removeClip(ids[0]);
          } else {
            state.removeClip(clipId);
          }
        }),
      },
      {
        id: 'paste',
        label: 'Coller',
        icon: <IconPaste />,
        shortcut: ['Ctrl', 'V'],
        disabled: !hasClipboard,
        action: closeAnd(() => {
          pasteClipboardForTrack(
            state,
            laneTrack,
            clip ? preferredLaneForClip(clip) : 0
          );
        }),
      },
      {
        id: 'duplicate',
        label: 'Dupliquer',
        icon: <IconDuplicate />,
        shortcut: ['Ctrl', 'D'],
        action: closeAnd(() => {
          if (!clip) return;
          duplicateForTrack(state, laneTrack, [clip]);
        }),
      },
      {
        id: 'delete',
        label: 'Supprimer',
        icon: <IconTrash />,
        shortcut: ['Suppr'],
        disabled: !clip,
        action: closeAnd(() => state.removeClip(clipId)),
      },
      {
        id: 'download',
        label: 'Télécharger le clip',
        icon: <IconDownload />,
        separatorBefore: true,
        disabled: !canDownload,
        action: closeAnd(() => {
          if (clip) void downloadTimelineClip(clip);
        }),
      },
    ];
  }

  // ── Multi-select actions ─────────────────────────────────────────────────────
  return [
    {
      id: 'copy-multi',
      label: 'Copier',
      icon: <IconCopy />,
      shortcut: ['Ctrl', 'C'],
      action: closeAnd(() => copySelectedForTrack(state, laneTrack)),
    },
    {
      id: 'cut-multi',
      label: 'Couper',
      icon: <IconCut />,
      shortcut: ['Ctrl', 'X'],
      action: closeAnd(() => {
        copySelectedForTrack(state, laneTrack);
        state.removeClips(multiIds);
        clearSelectionForTrack(state, laneTrack);
      }),
    },
    {
      id: 'paste',
      label: 'Coller',
      icon: <IconPaste />,
      shortcut: ['Ctrl', 'V'],
      disabled: !hasClipboard,
      action: closeAnd(() => pasteClipboardForTrack(state, laneTrack, 0)),
    },
    {
      id: 'duplicate-multi',
      label: 'Dupliquer',
      icon: <IconDuplicate />,
      shortcut: ['Ctrl', 'D'],
      action: closeAnd(() => duplicateForTrack(state, laneTrack, selectedClips)),
    },
    {
      id: 'delete-multi',
      label: 'Supprimer',
      icon: <IconTrash />,
      shortcut: ['Suppr'],
      action: closeAnd(() => {
        state.removeClips(multiIds);
        clearSelectionForTrack(state, laneTrack);
      }),
    },
  ];
}
