'use client';

import type { Clip, Composition } from '@/types/composition';
import { useCompositionStore } from '@/stores/compositionStore';
import {
  IconCopy,
  IconCut,
  IconDuplicate,
  IconPaste,
  IconTrash,
} from '@/components/editor/TimelineIcons';
import type { PreviewCtxMenuItem } from '@/components/editor/PreviewClipContextMenu';

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
): PreviewCtxMenuItem[] {
  const state = useCompositionStore.getState();
  const clip = findClipInComposition(state.composition, clipId);
  const hasClipboard = Boolean(state.clipboard);

  const closeAnd = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return [
    {
      id: 'copy',
      label: 'Copier',
      icon: <IconCopy />,
      disabled: !clip,
      action: closeAnd(() => {
        if (clip) state.setClipboard(clip);
      }),
    },
    {
      id: 'cut',
      label: 'Couper',
      icon: <IconCut />,
      disabled: !clip,
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
      disabled: !hasClipboard,
      action: closeAnd(() => {
        state.pasteClip();
      }),
    },
    {
      id: 'duplicate',
      label: 'Dupliquer',
      icon: <IconDuplicate />,
      disabled: !clip,
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
      danger: true,
      disabled: !clip,
      action: closeAnd(() => {
        state.removeClip(clipId);
      }),
    },
  ];
}
