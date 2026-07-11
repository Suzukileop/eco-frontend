'use client';

import type { Clip, Composition } from '@/types/composition';
import { getClipBackgroundLane } from '@/lib/backgroundLanes';
import { isBackgroundClipboardClip } from '@/lib/backgroundPaste';
import { useCompositionStore } from '@/stores/compositionStore';
import type { CapCutMenuItem } from '@/components/editor/CapCutContextMenu';
import {
  IconCopy,
  IconCut,
  IconDuplicate,
  IconPaste,
  IconSplit,
  IconTrash,
} from '@/components/editor/TimelineIcons';

export function findClipInComposition(
  composition: Composition | null,
  clipId: string
): Clip | undefined {
  if (!composition) return undefined;
  return [
    ...composition.tracks.background,
    ...composition.tracks.text,
    ...composition.tracks.audio,
    ...composition.tracks.overlay,
    ...composition.tracks.voiceover,
  ].find((c) => c.id === clipId);
}

export function buildPreviewClipMenuItems(
  clipId: string,
  onClose: () => void
): CapCutMenuItem[] {
  const state = useCompositionStore.getState();
  const clip = findClipInComposition(state.composition, clipId);
  const isBg = clip?.trackType === 'background';
  const hasClipboard = isBackgroundClipboardClip(state.clipboard);
  const canSplit =
    !!clip &&
    state.currentTime > clip.startTime + 0.05 &&
    state.currentTime < clip.endTime - 0.05;

  const closeAnd = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return [
    {
      id: 'split',
      label: 'Diviser',
      icon: <IconSplit />,
      shortcut: ['Ctrl', 'B'],
      disabled: !canSplit || !isBg,
      action: closeAnd(() => state.splitClip(clipId, state.currentTime)),
    },
    {
      id: 'copy',
      label: 'Copier',
      icon: <IconCopy />,
      shortcut: ['Ctrl', 'C'],
      disabled: !isBg,
      action: closeAnd(() => {
        if (clip) state.setClipboard(clip);
      }),
    },
    {
      id: 'cut',
      label: 'Couper',
      icon: <IconCut />,
      shortcut: ['Ctrl', 'X'],
      disabled: !isBg,
      action: closeAnd(() => {
        if (!clip) return;
        state.saveToHistory();
        state.setClipboard(clip);
        state.removeClip(clipId);
      }),
    },
    {
      id: 'paste',
      label: 'Coller',
      icon: <IconPaste />,
      shortcut: ['Ctrl', 'V'],
      disabled: !hasClipboard,
      action: closeAnd(() =>
        state.pasteClip(clip ? getClipBackgroundLane(clip) : 0)
      ),
    },
    {
      id: 'duplicate',
      label: 'Dupliquer',
      icon: <IconDuplicate />,
      shortcut: ['Ctrl', 'D'],
      disabled: !isBg,
      action: closeAnd(() => {
        if (!clip || !state.composition) return;
        state.saveToHistory();
        const dur = clip.endTime - clip.startTime;
        state.addClip({
          ...clip,
          id: `${clip.id}-dup-${Date.now()}`,
          startTime: clip.endTime,
          endTime: clip.endTime + dur,
        });
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
  ];
}
