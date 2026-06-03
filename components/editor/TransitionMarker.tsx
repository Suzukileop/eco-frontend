'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Clip } from '@/types/composition';
import { useCompositionStore } from '@/stores/compositionStore';
import {
  GL_TRANSITION_CUT,
  formatGlTransitionLabel,
  resolveGlTransitionName,
} from '@/lib/glTransitions';
import {
  applyGlTransitionToJunction,
  firstBackgroundLane,
} from '@/lib/transitionApply';
import { TransitionQuickPicker } from '@/components/editor/TransitionQuickPicker';

/** Icône transition (deux traits) — au-dessus des clips, priorité clic sur le trim. */
function TransitionIcon() {
  return (
    <span className="flex h-3.5 w-3.5 items-center justify-center gap-[2px] rounded-sm border border-neutral-400/80 bg-white shadow-sm">
      <span className="h-2 w-[2px] rounded-full bg-neutral-500" aria-hidden />
      <span className="h-2 w-[2px] rounded-full bg-neutral-500" aria-hidden />
    </span>
  );
}

export function TransitionMarker({
  fromClip,
  toClip,
  pps,
}: {
  fromClip: Clip;
  toClip: Clip;
  pps: number;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const composition = useCompositionStore((s) => s.composition);
  const selectedTransitionJunction = useCompositionStore((s) => s.selectedTransitionJunction);
  const openTransitionsPanelForClipPair = useCompositionStore((s) => s.openTransitionsPanelForClipPair);
  const { addTransition, updateTransition, removeTransition, setCurrentTime } = useCompositionStore();

  const left = fromClip.endTime * pps;
  const isSelected =
    selectedTransitionJunction?.fromClipId === fromClip.id &&
    selectedTransitionJunction?.toClipId === toClip.id;

  const existing = composition?.transitions.find(
    (t) => t.fromClipId === fromClip.id && t.toClipId === toClip.id
  );
  const glName = existing ? resolveGlTransitionName(existing) : null;
  const resolvedSelectedName =
    !existing || existing.type === 'cut' ? GL_TRANSITION_CUT : glName ?? GL_TRANSITION_CUT;
  const markerLabel = formatGlTransitionLabel(resolvedSelectedName);

  const syncAnchor = useCallback(() => {
    if (buttonRef.current) setAnchorRect(buttonRef.current.getBoundingClientRect());
  }, []);

  const handleMarkerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openTransitionsPanelForClipPair(fromClip.id, toClip.id);
    setCurrentTime(Math.max(0, fromClip.endTime - 0.08));
    syncAnchor();
    setPickerOpen(true);
  };

  useEffect(() => {
    if (!pickerOpen) return;
    syncAnchor();
    const onScrollOrResize = () => syncAnchor();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [pickerOpen, syncAnchor]);

  const applyGlName = (name: string) => {
    const lane0 = firstBackgroundLane(composition?.tracks.background ?? []);
    applyGlTransitionToJunction(fromClip, toClip, lane0, name, composition, {
      addTransition,
      updateTransition,
      removeTransition,
    });
    setPickerOpen(false);
  };

  return (
    <>
      <div
        className="absolute z-[60] flex items-center justify-center pointer-events-auto"
        style={{ left, top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={handleMarkerClick}
          onMouseDown={(e) => e.stopPropagation()}
          className={`rounded-md p-0.5 transition-all ${
            isSelected
              ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-white scale-110'
              : !existing || existing.type === 'cut'
                ? 'opacity-90 hover:opacity-100 hover:scale-105'
                : 'scale-105 ring-1 ring-neutral-500/40'
          }`}
          title={`${markerLabel} — transition entre les clips`}
          aria-pressed={isSelected}
          aria-label={`Transition : ${markerLabel}`}
        >
          <TransitionIcon />
        </button>
      </div>
      {pickerOpen && anchorRect && (
        <TransitionQuickPicker
          anchorRect={anchorRect}
          selectedGlName={resolvedSelectedName}
          onSelectGlName={applyGlName}
          onOpenFullCatalog={() => setPickerOpen(false)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
