'use client';

import { useMemo } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { getClipLayout, pxToPct } from '@/lib/studio/konva/clipLayout';
import {
  alignLayouts,
  distributeLayouts,
  type AlignH,
  type AlignV,
  type DistributeAxis,
} from '@/lib/studio/konva/multiSelectAlign';

interface KonvaMultiSelectToolbarProps {
  canvasWidth: number;
  canvasHeight: number;
}

function AlignBtn({
  label,
  title,
  onClick,
}: {
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-[11px] font-medium text-white/90 hover:bg-white/15"
    >
      {label}
    </button>
  );
}

export function KonvaMultiSelectToolbar({
  canvasWidth,
  canvasHeight,
}: KonvaMultiSelectToolbarProps) {
  const composition = useCompositionStore((s) => s.composition);
  const currentTime = useCompositionStore((s) => s.currentTime);
  const updateClip = useCompositionStore((s) => s.updateClip);
  const saveToHistory = useCompositionStore((s) => s.saveToHistory);

  const konvaSelectedIds = useEditorUiStore((s) => s.konvaSelectedIds);

  const selectedLayouts = useMemo(() => {
    if (!composition || konvaSelectedIds.length < 2) return [];
    const all = [
      ...composition.tracks.background,
      ...composition.tracks.text,
      ...composition.tracks.overlay,
    ];
    return konvaSelectedIds
      .map((id) => all.find((c) => c.id === id))
      .filter(
        (c): c is NonNullable<typeof c> =>
          c != null && c.startTime <= currentTime && c.endTime > currentTime
      )
      .map((c) => getClipLayout(c, canvasWidth, canvasHeight));
  }, [composition, konvaSelectedIds, currentTime, canvasWidth, canvasHeight]);

  if (selectedLayouts.length < 2) return null;

  const applyPatches = (patches: ReturnType<typeof alignLayouts>) => {
    saveToHistory();
    for (const p of patches) {
      updateClip(p.clipId, {
        x: pxToPct(p.centerX, canvasWidth),
        y: pxToPct(p.centerY, canvasHeight),
      });
    }
  };

  const runAlign = (h?: AlignH, v?: AlignV) => {
    applyPatches(alignLayouts(selectedLayouts, h, v));
  };

  const runDistribute = (axis: DistributeAxis) => {
    applyPatches(distributeLayouts(selectedLayouts, axis));
  };

  return (
    <div
      className="pointer-events-auto absolute left-1/2 top-2 z-[55] flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-white/10 bg-gray-900/92 px-1 py-0.5 shadow-lg backdrop-blur-sm"
      role="toolbar"
      aria-label="Alignement multi-sélection"
    >
      <span className="px-1.5 text-[10px] text-cyan-300/90 tabular-nums">
        {selectedLayouts.length} sélectionnés
      </span>
      <span className="mx-0.5 h-4 w-px bg-white/15" aria-hidden />
      <AlignBtn label="⫷" title="Aligner à gauche" onClick={() => runAlign('left')} />
      <AlignBtn label="⫿" title="Centrer horizontalement" onClick={() => runAlign('center')} />
      <AlignBtn label="⫸" title="Aligner à droite" onClick={() => runAlign('right')} />
      <span className="mx-0.5 h-4 w-px bg-white/15" aria-hidden />
      <AlignBtn label="⫠" title="Aligner en haut" onClick={() => runAlign(undefined, 'top')} />
      <AlignBtn label="⫟" title="Centrer verticalement" onClick={() => runAlign(undefined, 'middle')} />
      <AlignBtn label="⫡" title="Aligner en bas" onClick={() => runAlign(undefined, 'bottom')} />
      <span className="mx-0.5 h-4 w-px bg-white/15" aria-hidden />
      <AlignBtn label="⇹" title="Distribuer horizontalement" onClick={() => runDistribute('horizontal')} />
      <AlignBtn label="⇕" title="Distribuer verticalement" onClick={() => runDistribute('vertical')} />
    </div>
  );
}
