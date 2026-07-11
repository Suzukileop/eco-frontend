'use client';

/**
 * Zone texte studio — moteur identique à text-zone-simulator.html
 * (DOM impératif pendant drag, commit au mouseup uniquement).
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { buildClassicTextContentStyle } from '@/lib/studio/textContentStyle';
import { clipToTextZoneModel, getTextScaleBaseFontSize, isCornerTextResizeDir, resolveClipRenderFontSizePx, scalePctFromCornerResizeDrag, textZoneClipPatchChanged, textZoneModelToClipPatch } from '@/lib/studio/textZone/textZoneGeometry';
import { collectActiveClipLayouts } from '@/lib/studio/textZone/textZoneSnap';
import {
  applyZoneLayoutFromModel,
  getPointerDragCursor,
  lockPointerDragCursor,
  readModelFromDom,
  runAutoHeight,
  startMoveDrag,
  startResizeDrag,
  startRotateDrag as beginRotateDragSession,
  syncFormatContentClip,
  syncZoneTypography,
  unlockPointerDragCursor,
  type TextZoneDomRefs,
  type TextZonePointerDrag,
  pointerMove,
} from '@/lib/studio/textZone/textZoneSimulator';
import type { TextZoneHandleDir } from '@/lib/studio/textZone/types';
import type { TextZoneClipProps } from '@/lib/studio/textZone/TextZoneClipProps';

const HANDLE_CORNERS: TextZoneHandleDir[] = ['tl', 'tr', 'bl', 'br'];
const HANDLE_SIDES: TextZoneHandleDir[] = ['ml', 'mr'];

export function TextZoneClip({
  clip,
  canvasWidth,
  canvasHeight,
  pointerScale,
  interactionState,
  isPrimary,
  seedChar,
  interactive,
  onSelect,
  onEnterEdit,
  onExitEdit,
  onCommit,
  onSaveHistory,
  onSeedConsumed,
}: TextZoneClipProps) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const baseModel = useMemo(
    () => clipToTextZoneModel(clip, canvasWidth, canvasHeight),
    [clip, canvasWidth, canvasHeight]
  );

  const [draft, setDraft] = useState(baseModel.content);
  const [pointerDragging, setPointerDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const composition = useCompositionStore((s) => s.composition);
  const currentTime = useCompositionStore((s) => s.currentTime);
  const snapEnabled = useCompositionStore((s) => s.snapEnabled);
  const setKonvaSnapGuides = useEditorUiStore((s) => s.setKonvaSnapGuides);
  const clearKonvaSnapGuides = useEditorUiStore((s) => s.clearKonvaSnapGuides);
  const setTextScaleDragPreview = useEditorUiStore((s) => s.setTextScaleDragPreview);

  const clipRef = useRef(clip);
  clipRef.current = clip;

  const snapLayouts = useMemo(() => {
    if (!composition) return [];
    return collectActiveClipLayouts(composition, currentTime, canvasWidth, canvasHeight);
  }, [composition, currentTime, canvasWidth, canvasHeight]);
  const snapLayoutsRef = useRef(snapLayouts);
  snapLayoutsRef.current = snapLayouts;

  const dragRef = useRef<TextZonePointerDrag | null>(null);
  const fontSizeRef = useRef(baseModel.fontSize);
  const rotationRef = useRef(baseModel.rotationDeg);
  const draftRef = useRef(draft);
  const prevInteractionRef = useRef(interactionState);
  const interactionStateRef = useRef(interactionState);
  interactionStateRef.current = interactionState;
  /** Évite d'écraser le DOM post-drag avec un baseModel encore stale (régression warp). */
  const skipStoreLayoutRef = useRef(false);
  const prevBaseModelRef = useRef(baseModel);
  const initialDomMeasureRef = useRef<string | null>(null);
  const wasEditingRef = useRef(false);

  draftRef.current = draft;
  if (!dragRef.current && !pointerDragging) {
    fontSizeRef.current = baseModel.fontSize;
    rotationRef.current = baseModel.rotationDeg;
  }

  const selected = interactionState === 'selected' || interactionState === 'editing';
  const editing = interactionState === 'editing';
  const showHoverBorder =
    interactive && hovered && interactionState === 'normal' && !pointerDragging;

  useEffect(() => {
    if (interactionState !== 'normal') setHovered(false);
  }, [interactionState]);

  const getRefs = useCallback((): TextZoneDomRefs | null => {
    const zone = zoneRef.current;
    const content = contentRef.current;
    const display = displayRef.current;
    const textarea = textareaRef.current;
    if (!zone || !content || !display || !textarea) return null;
    return { zone, content, display, textarea };
  }, []);

  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const commitFromDom = useCallback(
    (options?: { textScalePct?: number }) => {
      const refs = getRefs();
      if (!refs) return;
      const currentClip = clipRef.current;
      const model = readModelFromDom(refs, draftRef.current, fontSizeRef.current);
      const patch = textZoneModelToClipPatch(
        model,
        currentClip,
        canvasWidth,
        canvasHeight,
        options
      );
      if (textZoneClipPatchChanged(currentClip, patch)) {
        onCommitRef.current(patch);
      }
    },
    [canvasWidth, canvasHeight, getRefs]
  );

  useEffect(() => {
    if (editing) return;
    setDraft(baseModel.content);
  }, [baseModel.content, clip.id, editing]);

  useLayoutEffect(() => {
    if (pointerDragging || dragRef.current || editing) return;
    const refs = getRefs();
    if (!refs) return;

    if (skipStoreLayoutRef.current) {
      skipStoreLayoutRef.current = false;
      syncFormatContentClip(refs, canvasWidth, canvasHeight);
      prevBaseModelRef.current = baseModel;
      return;
    }

    prevBaseModelRef.current = baseModel;

    const needsInitialDomMeasure =
      clip.textFrameHeightPx == null && initialDomMeasureRef.current !== clip.id;

    // Comme le simulateur : autoHeight dans tous les états (normal, sélectionné, édition).
    applyZoneLayoutFromModel(refs, baseModel, draft, canvasWidth, canvasHeight, {
      proportionalFrame: false,
      clip,
    });
    syncFormatContentClip(refs, canvasWidth, canvasHeight);

    // Mesure initiale uniquement (insertion) — pas de resync hauteur en boucle.
    if (needsInitialDomMeasure) {
      initialDomMeasureRef.current = clip.id;
      const measured = readModelFromDom(refs, draft, baseModel.fontSize);
      const patch = textZoneModelToClipPatch(measured, clip, canvasWidth, canvasHeight);
      if (textZoneClipPatchChanged(clip, patch)) {
        onCommitRef.current(patch);
      }
    }
  }, [
    baseModel,
    draft,
    pointerDragging,
    editing,
    clip,
    getRefs,
    canvasWidth,
    canvasHeight,
  ]);

  useEffect(() => {
    const prev = prevInteractionRef.current;
    prevInteractionRef.current = interactionState;
    if (prev === 'editing' && interactionState !== 'editing' && !pointerDragging) {
      const refs = getRefs();
      if (refs) {
        runAutoHeight(refs, draftRef.current, { clip });
        syncFormatContentClip(refs, canvasWidth, canvasHeight);
        commitFromDom();
      }
    }
  }, [interactionState, pointerDragging, getRefs, commitFromDom, clip, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (!editing || !interactive) {
      wasEditingRef.current = false;
      textareaRef.current?.blur();
      return;
    }

    const refs = getRefs();
    if (!refs) return;
    syncZoneTypography(refs, fontSizeRef.current);

    const justEnteredEdit = !wasEditingRef.current;
    wasEditingRef.current = true;
    if (!justEnteredEdit) return;

    runAutoHeight(refs, draftRef.current, { clip });
    const id = requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    });
    return () => cancelAnimationFrame(id);
  }, [editing, interactive, clip, getRefs]);

  useEffect(() => {
    if (!seedChar || !isPrimary || !selected) return;
    const next = `${draftRef.current}${seedChar}`;
    setDraft(next);
    draftRef.current = next;
    const refs = getRefs();
    if (refs) {
      runAutoHeight(refs, next, { clip });
      syncFormatContentClip(refs, canvasWidth, canvasHeight);
    }
    commitFromDom();
    onEnterEdit();
    onSeedConsumed();
  }, [
    seedChar,
    isPrimary,
    selected,
    onSeedConsumed,
    onEnterEdit,
    getRefs,
    commitFromDom,
    clip,
    canvasWidth,
    canvasHeight,
  ]);

  useEffect(() => {
    const scale = pointerScale > 0 ? pointerScale : 1;

    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      const refs = getRefs();
      if (!drag || !refs) return;
      lockPointerDragCursor(drag);
      const moveSnap =
        drag.type === 'move'
          ? {
              clipId: clip.id,
              widthPx: drag.startWidthPx,
              heightPx: drag.startHeightPx,
              otherLayouts: snapLayoutsRef.current,
              canvasWidth,
              canvasHeight,
              snapEnabled,
            }
          : undefined;
      const nextFs = pointerMove(
        drag,
        e.clientX,
        e.clientY,
        scale,
        refs,
        draftRef.current,
        canvasWidth,
        canvasHeight,
        fontSizeRef.current,
        getTextScaleBaseFontSize(clipRef.current),
        moveSnap,
        setKonvaSnapGuides,
        clipRef.current
      );
      fontSizeRef.current = nextFs;
      if (drag.type === 'resize' && isCornerTextResizeDir(drag.dir)) {
        const pct = scalePctFromCornerResizeDrag(clipRef.current, drag, canvasHeight);
        setTextScaleDragPreview({ clipId: clipRef.current.id, pct });
      }
    };

    const onUp = () => {
      clearKonvaSnapGuides();
      setTextScaleDragPreview(null);
      if (!dragRef.current) {
        setPointerDragging(false);
        return;
      }
      const drag = dragRef.current;
      const dragKind = drag.type;
      const cornerScaleCommit =
        drag.type === 'resize' && isCornerTextResizeDir(drag.dir);
      let textScalePct: number | undefined;
      if (cornerScaleCommit) {
        fontSizeRef.current = drag.fontSizePx;
        textScalePct = scalePctFromCornerResizeDrag(clipRef.current, drag, canvasHeight);
      }
      commitFromDom(textScalePct != null ? { textScalePct } : undefined);
      dragRef.current = null;
      unlockPointerDragCursor();
      skipStoreLayoutRef.current = true;
      setPointerDragging(false);
      if (
        (dragKind === 'resize' || dragKind === 'rotate') &&
        textareaRef.current &&
        interactionStateRef.current === 'editing'
      ) {
        requestAnimationFrame(() => textareaRef.current?.focus());
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('pointerup', onUp);
      clearKonvaSnapGuides();
      setTextScaleDragPreview(null);
    };
  }, [
    pointerScale,
    canvasWidth,
    canvasHeight,
    clip.id,
    snapEnabled,
    getRefs,
    commitFromDom,
    setKonvaSnapGuides,
    clearKonvaSnapGuides,
    setTextScaleDragPreview,
  ]);

  const onRotateHandleMouseDown = (e: React.MouseEvent) => {
    if (!interactive || !selected) return;
    e.stopPropagation();
    e.preventDefault();
    const refs = getRefs();
    if (!refs) return;
    const drag = beginRotateDragSession(e.clientX, e.clientY, refs, rotationRef.current);
    dragRef.current = drag;
    onSaveHistory();
    lockPointerDragCursor(drag);
    capturePointer(e.currentTarget as HTMLElement, e.nativeEvent);
    setPointerDragging(true);
  };

  const startHandleDrag = (dir: TextZoneHandleDir, e: React.MouseEvent) => {
    if (!interactive || !selected) return;
    e.stopPropagation();
    e.preventDefault();
    const refs = getRefs();
    if (!refs) return;
    const domFs = parseFloat(refs.display.style.fontSize);
    const renderFs =
      Number.isFinite(domFs) && domFs > 0
        ? domFs
        : resolveClipRenderFontSizePx(clipRef.current, canvasHeight);
    fontSizeRef.current = renderFs;
    syncZoneTypography(refs, renderFs);
    const drag = startResizeDrag(dir, e.clientX, e.clientY, refs, renderFs);
    dragRef.current = drag;
    onSaveHistory();
    lockPointerDragCursor(drag);
    capturePointer(e.currentTarget as HTMLElement, e.nativeEvent);
    setPointerDragging(true);
  };

  const onZoneMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    if ((e.target as HTMLElement).dataset.textHandle) return;
    e.stopPropagation();
    if (editing) return;

    const isLeft = e.button === 0;
    const isRight = e.button === 2;
    if (!isLeft && !isRight) return;

    if (interactionState === 'normal' && isLeft) {
      onSelect();
      return;
    }

    if (isRight) {
      e.preventDefault();
      if (interactionState === 'normal') onSelect();
    }

    const refs = getRefs();
    if (!refs) return;
    const drag = startMoveDrag(e.clientX, e.clientY, refs);
    dragRef.current = drag;
    onSaveHistory();
    lockPointerDragCursor(drag);
    if (zoneRef.current) capturePointer(zoneRef.current, e.nativeEvent);
    setPointerDragging(true);
    e.preventDefault();
  };

  const onZoneContextMenu = (e: React.MouseEvent) => {
    if (!interactive || editing) return;
    e.preventDefault();
  };

  const onZoneDoubleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    if (!editing) onEnterEdit();
  };

  const style = buildClassicTextContentStyle(clip, canvasHeight);
  const textColor = (style.color as string | undefined) ?? clip.fontColor ?? '#ffffff';
  const bgAlpha = clip.backgroundOpacity ?? 0;
  const hasTextBg = Boolean(clip.backgroundColor && bgAlpha > 0);
  const textAlign = (clip.textAlign ?? 'center') as 'left' | 'center' | 'right';

  const sharedTypography: CSSProperties = {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textDecoration: style.textDecoration,
    textTransform: style.textTransform,
    color: textColor,
    WebkitTextFillColor: style.WebkitTextFillColor,
    backgroundImage: style.backgroundImage,
    WebkitBackgroundClip: style.WebkitBackgroundClip,
    backgroundClip: style.backgroundClip,
  };

  /** Ombre / contour sur textarea masquent le caret en Chromium — réservés au div d’affichage. */
  const displayTextStyle: CSSProperties = {
    ...sharedTypography,
    textAlign,
    textShadow: style.textShadow as string | undefined,
    WebkitTextStroke: style.WebkitTextStroke as string | undefined,
    ...(hasTextBg
      ? {
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          display: 'inline-block',
          width: 'fit-content',
          maxWidth: '100%',
        }
      : {
          display: 'block',
          width: '100%',
        }),
  };

  const editTextStyle: CSSProperties = {
    ...sharedTypography,
    textAlign,
    ...(hasTextBg
      ? {
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
        }
      : {}),
  };

  const borderClass =
    'border-[1.5px] border-cyan-400 shadow-[0_0_0_3px_rgba(34,211,238,0.15)]';

  return (
    <div
      ref={zoneRef}
      data-text-zone
      data-clip-id={clip.id}
      className="pointer-events-auto absolute touch-none cursor-default overflow-visible"
      style={{
        zIndex: selected ? 48 : 44,
        cursor:
          pointerDragging && dragRef.current
            ? getPointerDragCursor(dragRef.current)
            : 'default',
      }}
      onMouseDown={onZoneMouseDown}
      onContextMenu={onZoneContextMenu}
      onDoubleClick={onZoneDoubleClick}
      onMouseEnter={() => {
        if (interactive && interactionState === 'normal' && !pointerDragging) {
          setHovered(true);
        }
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Texte clippé au format — le cadre / poignées restent visibles hors cadre (CapCut). */}
      <div
        ref={contentRef}
        className="relative h-full w-full cursor-default"
        data-text-zone-content
        style={{
          opacity: (style.opacity as number) ?? 1,
          textAlign,
        }}
      >
        <div
          ref={displayRef}
          className="relative cursor-default select-none whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
          style={{
            ...displayTextStyle,
            display: editing ? 'none' : displayTextStyle.display,
          }}
        >
          {draft || 'Votre texte'}
        </div>

        <textarea
          ref={textareaRef}
          data-clip-id={clip.id}
          rows={1}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          readOnly={!editing}
          tabIndex={editing ? 0 : -1}
          value={draft}
          className={`relative block w-full resize-none break-words border-none outline-none [overflow-wrap:anywhere] whitespace-pre-wrap ${
            hasTextBg ? '' : 'bg-transparent'
          } ${editing ? 'cursor-text' : 'pointer-events-none'}`}
          style={{
            ...editTextStyle,
            display: editing ? 'block' : 'none',
            caretColor: textColor,
            WebkitTextFillColor: 'currentColor',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
          }}
          onClick={() => {
            if (editing) textareaRef.current?.focus();
          }}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            draftRef.current = v;
            const refs = getRefs();
            if (refs) {
              runAutoHeight(refs, v, { clip });
              syncFormatContentClip(refs, canvasWidth, canvasHeight);
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onBlur={(e) => {
            if (!editing) return;
            const next = e.relatedTarget as Node | null;
            if (next && zoneRef.current?.contains(next)) return;
            window.setTimeout(() => {
              const zone = zoneRef.current;
              const active = document.activeElement;
              if (zone?.contains(active)) return;
              if (interactionStateRef.current === 'editing') onExitEdit();
            }, 0);
          }}
        />
      </div>

      {showHoverBorder && (
        <div
          className="pointer-events-none absolute inset-0 overflow-visible rounded-sm border border-cyan-400/90"
          aria-hidden
        />
      )}

      {selected && (
        <div
          className={`pointer-events-none absolute inset-0 overflow-visible rounded-sm ${borderClass}`}
          aria-hidden
        />
      )}

      {selected && (
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          {HANDLE_CORNERS.map((dir) => (
            <span
              key={dir}
              data-text-handle={dir}
              className={`${CAPCUT_HANDLE_CORNER} ${handleCornerClass(dir)}`}
              onMouseDown={(e) => startHandleDrag(dir, e)}
            />
          ))}
          {HANDLE_SIDES.map((dir) => (
            <span
              key={dir}
              data-text-handle={dir}
              className={`${CAPCUT_HANDLE_SIDE} ${handleSideClass(dir)}`}
              onMouseDown={(e) => startHandleDrag(dir, e)}
            />
          ))}
          <span
            data-text-handle="rotate"
            role="button"
            tabIndex={-1}
            aria-label="Rotation"
            className={`${CAPCUT_HANDLE_ROTATE} cursor-grab active:cursor-grabbing`}
            onMouseDown={onRotateHandleMouseDown}
          >
            <TextZoneRotateIcon />
          </span>
        </div>
      )}
    </div>
  );
}

/** Style CapCut : disques blancs aux coins, pilules sur les côtés. */
const CAPCUT_HANDLE_CORNER =
  'pointer-events-auto absolute z-20 h-4 w-4 rounded-full border border-slate-300/90 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-transform hover:scale-110';
const CAPCUT_HANDLE_SIDE =
  'pointer-events-auto absolute z-20 h-6 w-2 rounded-full border border-slate-300/90 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-transform hover:scale-110';
const CAPCUT_HANDLE_ROTATE =
  'pointer-events-auto absolute left-1/2 top-[calc(100%+28px)] z-20 flex h-[22px] w-[22px] -translate-x-1/2 items-center justify-center rounded-full border border-slate-300/90 bg-white text-slate-600 shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-transform hover:scale-105';

function TextZoneRotateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4V2M12 4C16.4183 4 20 7.58172 20 12M12 20V22M12 20C7.58172 20 4 16.4183 4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 7L20 4L17 4M4 17L4 20L7 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function capturePointer(el: HTMLElement, nativeEvent: MouseEvent): void {
  const pointerId = (nativeEvent as PointerEvent).pointerId;
  if (pointerId != null && el.setPointerCapture) {
    el.setPointerCapture(pointerId);
  }
}

function handleCornerClass(dir: TextZoneHandleDir): string {
  switch (dir) {
    case 'tl':
      return '-left-2 -top-2 cursor-nwse-resize';
    case 'tr':
      return '-right-2 -top-2 cursor-nesw-resize';
    case 'bl':
      return '-bottom-2 -left-2 cursor-nesw-resize';
    case 'br':
      return '-bottom-2 -right-2 cursor-nwse-resize';
    default:
      return '';
  }
}

function handleSideClass(dir: TextZoneHandleDir): string {
  switch (dir) {
    case 'ml':
      return 'top-1/2 -left-1 -translate-y-1/2 cursor-ew-resize';
    case 'mr':
      return 'top-1/2 -right-1 -translate-y-1/2 cursor-ew-resize';
    default:
      return '';
  }
}
