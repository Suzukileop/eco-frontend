'use client';

/**
 * Couche texte studio — référence unique : text-zone-simulator.html
 * Pas de Konva, pas de MovableCanvasZone pour les clips texte.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { TextZoneClip } from '@/lib/studio/textZone/TextZoneClip';
import { TextZoneSnapGuidesOverlay } from '@/components/studio/textZone/TextZoneSnapGuidesOverlay';
import type { TextZoneInteractionState } from '@/lib/studio/textZone/types';
import type { Clip } from '@/types/composition';

interface StudioTextClipLayerProps {
  canvasWidth: number;
  canvasHeight: number;
  interactive: boolean;
  pointerScale: number;
}

function isActiveTextClip(clip: Clip, t: number): boolean {
  return (
    (clip.trackType === 'text' || clip.type === 'text') &&
    clip.startTime <= t &&
    clip.endTime > t
  );
}

export function StudioTextClipLayer({
  canvasWidth,
  canvasHeight,
  interactive,
  pointerScale,
}: StudioTextClipLayerProps) {
  const composition = useCompositionStore((s) => s.composition);
  const currentTime = useCompositionStore((s) => s.currentTime);
  const updateClip = useCompositionStore((s) => s.updateClip);
  const removeClip = useCompositionStore((s) => s.removeClip);
  const saveToHistory = useCompositionStore((s) => s.saveToHistory);
  const setSelectedClip = useCompositionStore((s) => s.setSelectedClip);

  const konvaSelectedIds = useEditorUiStore((s) => s.konvaSelectedIds);
  const setKonvaSelectedIds = useEditorUiStore((s) => s.setKonvaSelectedIds);
  const konvaFocusedTextClipId = useEditorUiStore((s) => s.konvaFocusedTextClipId);
  const setKonvaFocusedTextClipId = useEditorUiStore((s) => s.setKonvaFocusedTextClipId);
  const seedChar = useEditorUiStore((s) => s.konvaEditSeedChar);
  const setKonvaEditSeedChar = useEditorUiStore((s) => s.setKonvaEditSeedChar);

  const textClips = useMemo(() => {
    if (!composition) return [] as Clip[];
    return composition.tracks.text.filter((c) => isActiveTextClip(c, currentTime));
  }, [composition, currentTime]);

  const primaryId =
    konvaSelectedIds.length > 0 ? konvaSelectedIds[konvaSelectedIds.length - 1] : null;

  const getInteractionState = useCallback(
    (clipId: string): TextZoneInteractionState => {
      if (!konvaSelectedIds.includes(clipId)) return 'normal';
      if (konvaFocusedTextClipId === clipId) return 'editing';
      return 'selected';
    },
    [konvaSelectedIds, konvaFocusedTextClipId]
  );

  const selectClip = useCallback(
    (clipId: string) => {
      setKonvaSelectedIds([clipId]);
      setSelectedClip(clipId);
      setKonvaFocusedTextClipId(null);
    },
    [setKonvaSelectedIds, setSelectedClip, setKonvaFocusedTextClipId]
  );

  const onSeedConsumed = useCallback(() => setKonvaEditSeedChar(null), [setKonvaEditSeedChar]);

  useEffect(() => {
    if (!interactive || !primaryId) return;
    const primary = textClips.find((c) => c.id === primaryId);
    if (!primary) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) {
        const clipId = (e.target as HTMLTextAreaElement).dataset.clipId;
        if (clipId) setKonvaFocusedTextClipId(clipId);
        if (e.key === 'Escape') {
          e.preventDefault();
          setKonvaFocusedTextClipId(null);
        }
        return;
      }

      const state = getInteractionState(primaryId);

      if (state === 'editing') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setKonvaFocusedTextClipId(null);
        }
        return;
      }

      if (state === 'selected') {
        if (e.key === 'Escape') {
          setKonvaSelectedIds([]);
          setSelectedClip(null);
          setKonvaFocusedTextClipId(null);
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          saveToHistory();
          removeClip(primaryId);
          setKonvaSelectedIds([]);
          setSelectedClip(null);
        }
        return;
      }

      if (
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        konvaSelectedIds.includes(primaryId)
      ) {
        e.preventDefault();
        setKonvaFocusedTextClipId(primaryId);
        setKonvaEditSeedChar(e.key);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    interactive,
    primaryId,
    textClips,
    getInteractionState,
    konvaSelectedIds,
    removeClip,
    saveToHistory,
    setKonvaEditSeedChar,
    setKonvaFocusedTextClipId,
    setKonvaSelectedIds,
    setSelectedClip,
  ]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[46] overflow-visible">
      <TextZoneSnapGuidesOverlay canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
      {textClips.map((clip) => (
        <TextZoneClip
          key={clip.id}
          clip={clip}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          pointerScale={pointerScale}
          interactionState={getInteractionState(clip.id)}
          isPrimary={clip.id === primaryId}
          seedChar={clip.id === primaryId ? seedChar : null}
          interactive={interactive}
          onSelect={() => selectClip(clip.id)}
          onEnterEdit={() => {
            selectClip(clip.id);
            setKonvaFocusedTextClipId(clip.id);
          }}
          onExitEdit={() => setKonvaFocusedTextClipId(null)}
          onCommit={(patch) => updateClip(clip.id, patch)}
          onSaveHistory={saveToHistory}
          onSeedConsumed={onSeedConsumed}
        />
      ))}
    </div>
  );
}
