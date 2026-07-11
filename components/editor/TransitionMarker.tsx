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
  transitionJunction,
} from '@/lib/transitionApply';
import { TransitionQuickPicker } from '@/components/editor/TransitionQuickPicker';

/** Icône transition CapCut (◆) — chevauche M1 et M2. */
function TransitionIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-cyan-400/70 bg-white text-[11px] font-bold leading-none text-cyan-600 shadow-md">
      ◆
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

  const junction = transitionJunction(fromClip, toClip);
  const junctionCenterPx = junction * pps;

  const existing = composition?.transitions.find(
    (t) => t.fromClipId === fromClip.id && t.toClipId === toClip.id
  );
  const transitionDuration =
    existing && existing.type !== 'cut' ? existing.duration ?? 0.55 : 0.55;
  const spanPx = Math.max(28, transitionDuration * pps);
  const spanLeft = junctionCenterPx - spanPx / 2;

  const isSelected =
    selectedTransitionJunction?.fromClipId === fromClip.id &&
    selectedTransitionJunction?.toClipId === toClip.id;

  const glName = existing ? resolveGlTransitionName(existing) : null;
  const resolvedSelectedName =
    !existing || existing.type === 'cut' ? GL_TRANSITION_CUT : glName ?? GL_TRANSITION_CUT;
  const markerLabel = formatGlTransitionLabel(resolvedSelectedName);
  const hasActiveTransition = Boolean(existing && existing.type !== 'cut' && glName);

  const syncAnchor = useCallback(() => {
    if (buttonRef.current) setAnchorRect(buttonRef.current.getBoundingClientRect());
  }, []);

  const handleMarkerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openTransitionsPanelForClipPair(fromClip.id, toClip.id);
    setCurrentTime(Math.max(0, junction - transitionDuration * 0.25));
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

  const showAlways = isSelected || hasActiveTransition;

  return (
    <>
      {/* Zone CapCut : chevauche la fin de M1 et le début de M2 */}
      <div
        className="group/tr-junction pointer-events-auto absolute top-0 bottom-0 z-[65] flex items-center justify-center"
        style={{
          left: spanLeft,
          width: spanPx,
        }}
      >
        {hasActiveTransition && (
          <div
            className="pointer-events-none absolute inset-x-1 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-cyan-400/35"
            aria-hidden
          />
        )}
        <button
          ref={buttonRef}
          type="button"
          onClick={handleMarkerClick}
          onMouseDown={(e) => e.stopPropagation()}
          className={`relative z-[1] rounded-md p-0.5 transition-all duration-150 ${
            showAlways
              ? 'opacity-100 scale-110 ring-2 ring-cyan-400 ring-offset-1 ring-offset-white'
              : 'opacity-0 scale-95 group-hover/tr-junction:opacity-100 group-hover/tr-junction:scale-105'
          } ${hasActiveTransition && !isSelected ? 'ring-1 ring-cyan-400/50' : ''}`}
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
          fromClip={fromClip}
          toClip={toClip}
          onSelectGlName={applyGlName}
          onOpenFullCatalog={() => setPickerOpen(false)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
