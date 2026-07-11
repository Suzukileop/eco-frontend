'use client';

import type { CapCutMenuItem } from '@/components/editor/CapCutContextMenu';
import { isBackgroundClipboardClip } from '@/lib/backgroundPaste';
import { isTextClipboardClip } from '@/lib/textPaste';
import { isOverlayClipboardClip } from '@/lib/overlayPaste';
import { isAudioClipboardClip } from '@/lib/audioPaste';
import { isVoiceoverClipboardClip } from '@/lib/voiceoverPaste';
import { IconPaste } from '@/components/editor/TimelineIcons';
import { useCompositionStore } from '@/stores/compositionStore';

/** Menu CapCut « Coller » seul (clic droit sur piste vide). */
export function buildTimelinePasteOnlyMenu(
  laneTrackType: 'background' | 'text' | 'overlay' | 'audio' | 'voiceover',
  preferredLane: number,
  onClose: () => void
): CapCutMenuItem[] {
  const state = useCompositionStore.getState();
  const canPasteBg =
    isBackgroundClipboardClip(state.clipboard) ||
    (state.clipboardMulti != null &&
      state.clipboardMulti.length > 0 &&
      state.clipboardMulti[0]?.trackType === 'background');
  const canPasteText =
    isTextClipboardClip(state.clipboard) ||
    (state.clipboardMulti != null &&
      state.clipboardMulti.length > 0 &&
      state.clipboardMulti[0]?.trackType === 'text');
  const canPasteOverlay =
    isOverlayClipboardClip(state.clipboard) ||
    (state.clipboardMulti != null &&
      state.clipboardMulti.length > 0 &&
      state.clipboardMulti[0]?.trackType === 'overlay');
  const canPasteAudio =
    isAudioClipboardClip(state.clipboard) ||
    (state.clipboardMulti != null &&
      state.clipboardMulti.length > 0 &&
      state.clipboardMulti[0]?.trackType === 'audio');
  const canPasteVoiceover =
    isVoiceoverClipboardClip(state.clipboard) ||
    (state.clipboardMulti != null &&
      state.clipboardMulti.length > 0 &&
      state.clipboardMulti[0]?.trackType === 'voiceover');
  const canPaste =
    laneTrackType === 'background'
      ? canPasteBg
      : laneTrackType === 'text'
        ? canPasteText
        : laneTrackType === 'overlay'
          ? canPasteOverlay
          : laneTrackType === 'audio'
            ? canPasteAudio
            : canPasteVoiceover;

  return [
    {
      id: 'paste',
      label: 'Coller',
      icon: <IconPaste />,
      shortcut: ['Ctrl', 'V'],
      disabled: !canPaste,
      action: () => {
        if (!canPaste) return;
        if (laneTrackType === 'background') {
          state.pasteBackgroundClipboard(preferredLane);
        } else if (laneTrackType === 'text') {
          state.pasteTextClipboard(preferredLane);
        } else if (laneTrackType === 'overlay') {
          state.pasteOverlayClipboard(preferredLane);
        } else if (laneTrackType === 'audio') {
          state.pasteAudioClipboard(preferredLane);
        } else {
          state.pasteVoiceoverClipboard(preferredLane);
        }
        onClose();
      },
    },
  ];
}
