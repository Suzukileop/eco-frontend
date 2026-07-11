'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Clip } from '@/types/composition';
import { getQuickGlTransitions } from '@/lib/glTransitions';
import { TransitionGlThumbnail } from '@/components/editor/TransitionGlThumbnail';
import { resolveClipMediaUrl } from '@/lib/glTransitionMedia';

const PICKER_Z = 320;
const PICKER_EST_HEIGHT = 280;

export function TransitionQuickPicker({
  anchorRect,
  selectedGlName,
  fromClip,
  toClip,
  onSelectGlName,
  onOpenFullCatalog,
  onClose,
}: {
  anchorRect: DOMRect;
  selectedGlName: string;
  fromClip?: Clip;
  toClip?: Clip;
  onSelectGlName: (glName: string) => void;
  onOpenFullCatalog: () => void;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const presets = getQuickGlTransitions();
  const [mounted, setMounted] = useState(false);
  const [placement, setPlacement] = useState<'above' | 'below'>('above');

  const previewFromUrl = fromClip ? resolveClipMediaUrl(fromClip) : undefined;
  const previewToUrl = toClip ? resolveClipMediaUrl(toClip) : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const spaceAbove = anchorRect.top;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    setPlacement(
      spaceAbove >= PICKER_EST_HEIGHT || spaceAbove >= spaceBelow ? 'above' : 'below'
    );
  }, [anchorRect.top, anchorRect.bottom]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  const centerX = anchorRect.left + anchorRect.width / 2;
  const style: React.CSSProperties =
    placement === 'above'
      ? {
          position: 'fixed',
          left: centerX,
          top: anchorRect.top,
          transform: 'translate(-50%, calc(-100% - 10px))',
          zIndex: PICKER_Z,
        }
      : {
          position: 'fixed',
          left: centerX,
          top: anchorRect.bottom,
          transform: 'translate(-50%, 10px)',
          zIndex: PICKER_Z,
        };

  return createPortal(
    <div
      ref={rootRef}
      style={style}
      className="pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Choisir une transition"
    >
      <div className="w-[min(92vw,360px)] overflow-hidden rounded-xl border border-[#3a3a3a] bg-[#141414]/98 shadow-2xl shadow-black/60 backdrop-blur-md">
        <div className="border-b border-[#2a2a2a] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/90">
            Choisir une transition
          </p>
          <p className="mt-0.5 text-[9px] text-neutral-500">
            Aperçus WebGL · identiques à la bibliothèque
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 p-2.5 sm:grid-cols-4">
          {presets.map((preset) => (
            <TransitionGlThumbnail
              key={preset.name}
              glName={preset.name}
              label={preset.label}
              fromUrl={previewFromUrl}
              toUrl={previewToUrl}
              selected={selectedGlName === preset.name}
              onSelect={() => onSelectGlName(preset.name)}
            />
          ))}
        </div>

        <div className="border-t border-[#2a2a2a] p-2">
          <button
            type="button"
            onClick={onOpenFullCatalog}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#404040] bg-[#1e1e1e] py-2 text-[10px] font-semibold text-cyan-300 transition-colors hover:border-cyan-500/40 hover:bg-[#252528]"
          >
            <span>Tous les effets</span>
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
