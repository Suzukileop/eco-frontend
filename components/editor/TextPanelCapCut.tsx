'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import type { Clip, TextAlign, TextPreset } from '@/types/composition';
import {
  TEXT_STYLE_GROUP_LABELS,
  TEXT_STYLE_QUICK_IDS,
  getTextPresetPreviewStyle,
  getTextStylePresetDef,
  isColorLockedTextPreset,
  presetsByGroup,
  type TextStyleGroup,
} from '@/lib/textStyleCatalog';
import {
  COLOR_PRESETS,
  FONT_FAMILIES,
  FONT_SIZE_OPTIONS,
} from '@/lib/editor/textPanelConstants';
import { TextTransformerSection } from '@/components/editor/TextTransformerSection';
import {
  STUDIO_TEXT_FONT_SIZE_MAX,
  STUDIO_TEXT_FONT_SIZE_MIN,
} from '@/lib/studio/textZone/textZoneGeometry';
import {
  applyTextCaseMode,
  TEXT_CASE_OPTIONS,
  type TextCaseMode,
} from '@/lib/editor/textCase';
import { BasicAdvancedModeSwitch, type PanelBasicAdvancedMode } from '@/components/editor/BasicAdvancedModeSwitch';

const TEXT_STYLE_GROUPS: TextStyleGroup[] = ['basique', 'tendance', 'classique'];

interface TextPanelCapCutProps {
  textClip: Clip;
  canEdit: boolean;
  upd: (patch: Partial<Clip>) => void;
  editableClip?: Clip;
}

function ResetIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

const INPUT_BG = 'bg-[#1a1a1a]';
const SECTION = 'border-t border-[#2a2a2a] bg-black';

const SCROLL_HIDE = '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

function CapCutSelect({
  value,
  onChange,
  disabled,
  className = '',
  style,
  children,
}: {
  value: string | number;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={style}
      className={`h-9 rounded-[10px] ${INPUT_BG} px-2.5 text-[13px] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {children}
    </select>
  );
}

/** Liste taille CapCut — hauteur limitée, scroll molette, barre masquée. */
function CapCutFontSizePicker({
  value,
  onChange,
  disabled,
  options,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  options: number[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const items = useMemo(() => {
    const rounded = Math.round(value);
    const set = new Set(options);
    if (!set.has(rounded)) set.add(rounded);
    return Array.from(set).sort((a, b) => a - b);
  }, [options, value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      selectedRef.current?.scrollIntoView({ block: 'nearest' });
    });
    return () => cancelAnimationFrame(id);
  }, [open, value]);

  const pick = (size: number) => {
    const clamped = Math.max(STUDIO_TEXT_FONT_SIZE_MIN, Math.min(STUDIO_TEXT_FONT_SIZE_MAX, size));
    onChange(clamped);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-[4.25rem] shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex h-9 w-full items-center justify-between gap-0.5 rounded-[10px] ${INPUT_BG} pl-2.5 pr-1.5 text-[13px] tabular-nums text-neutral-100 transition-colors hover:bg-[#252525] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-45`}
      >
        <span>{Math.round(value)}</span>
        <svg
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="currentColor"
          className={`shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      {open ? (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Taille de police"
          className={`absolute right-0 top-[calc(100%+4px)] z-[60] max-h-[11.5rem] w-full overflow-y-auto overscroll-contain rounded-xl border border-[#333] ${INPUT_BG} py-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${SCROLL_HIDE}`}
        >
          {items.map((size) => {
            const active = Math.round(value) === size;
            return (
              <button
                key={size}
                ref={active ? selectedRef : undefined}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => pick(size)}
                className={`flex w-full items-center justify-center px-2 py-1.5 text-[13px] tabular-nums transition-colors ${
                  active
                    ? 'bg-cyan-500/20 font-medium text-cyan-300'
                    : 'text-neutral-300 hover:bg-white/5'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ToolBtn({
  active,
  onClick,
  disabled,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-400 hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

const ColorChip = forwardRef(function ColorChip(
  {
    color,
    active,
    disabled,
    onClick,
    none,
  }: {
    color?: string;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    none?: boolean;
  },
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative h-7 w-7 shrink-0 overflow-hidden rounded-md border transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'border-cyan-500 ring-1 ring-cyan-400/50' : 'border-[#404040]'
      }`}
      style={none ? undefined : { backgroundColor: color }}
    >
      {none ? (
        <span className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
          <span className="block h-[120%] w-px rotate-45 bg-red-400" />
        </span>
      ) : null}
    </button>
  );
});

function StyleRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[36px] items-center justify-between gap-3">
      <span className="text-[13px] text-neutral-400">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

const ALIGN_LINE_WIDTHS = [10, 7, 5] as const;

function AlignIcon({ align }: { align: TextAlign }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      {ALIGN_LINE_WIDTHS.map((w, i) => {
        const y = 3.5 + i * 4;
        const x =
          align === 'left' ? 2 : align === 'right' ? 14 - w : (16 - w) / 2;
        return (
          <rect key={i} x={x} y={y} width={w} height={1.75} rx="0.75" fill="currentColor" />
        );
      })}
    </svg>
  );
}

function useAnchorPopover(
  open: boolean,
  onClose: () => void,
  anchorRef: React.RefObject<HTMLElement | null>
) {
  const popRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose, anchorRef]);
  return popRef;
}

/** Popover ancré au bouton — portal + position fixed (évite le clip overflow du panneau). */
function CapCutAnchorPopover({
  open,
  onClose,
  anchorRef,
  children,
  align = 'start',
  side = 'bottom',
  estimatedWidth = 224,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  align?: 'start' | 'end';
  /** `left` = vers l'intérieur (panneau droit) ; `bottom` = sous l'ancre. */
  side?: 'bottom' | 'left';
  estimatedWidth?: number;
  className?: string;
}) {
  const popRef = useAnchorPopover(open, onClose, anchorRef);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const popW = pop?.offsetWidth || estimatedWidth;
    const popH = pop?.offsetHeight ?? 0;
    const gap = 6;
    const pad = 8;

    let left: number;
    let top: number;

    if (side === 'left') {
      left = rect.left - popW - gap;
      top = rect.top;
    } else if (align === 'end') {
      left = rect.right - popW;
      top = rect.bottom + gap;
    } else {
      left = rect.left;
      top = rect.bottom + gap;
    }

    left = Math.max(pad, Math.min(left, window.innerWidth - popW - pad));
    if (popH > 0) {
      top = Math.max(pad, Math.min(top, window.innerHeight - popH - pad));
    }

    setCoords({ top, left });
  }, [align, side, estimatedWidth, anchorRef, popRef]);

  useEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const id = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(id);
  }, [open, updatePosition, children]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={popRef}
      role="presentation"
      style={
        coords
          ? { position: 'fixed', top: coords.top, left: coords.left, zIndex: 9999 }
          : { position: 'fixed', top: -9999, left: -9999, zIndex: 9999, visibility: 'hidden' as const }
      }
      className={className}
    >
      {children}
    </div>,
    document.body
  );
}

function GridIconBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
        active ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-400 hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

const ALIGN_GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 2rem)',
  gap: '2px',
};

function AlignGridPopover({
  open,
  onClose,
  anchorRef,
  textClip,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  textClip: Clip;
  onSelect: (align: TextAlign) => void;
}) {
  return (
    <CapCutAnchorPopover open={open} onClose={onClose} anchorRef={anchorRef} side="left" estimatedWidth={110}>
      <div
        role="menu"
        aria-label="Alignement"
        className="rounded-xl border border-[#333] bg-[#1a1a1a] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
      >
        <div style={ALIGN_GRID_STYLE}>
          {(['left', 'center', 'right'] as const).map((a) => (
            <GridIconBtn
              key={a}
              active={(textClip.textAlign ?? 'center') === a}
              title={a === 'left' ? 'Gauche' : a === 'center' ? 'Centre' : 'Droite'}
              onClick={() => onSelect(a)}
            >
              <AlignIcon align={a} />
            </GridIconBtn>
          ))}
        </div>
      </div>
    </CapCutAnchorPopover>
  );
}

function CaseChangePopover({
  open,
  onClose,
  anchorRef,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  onSelect: (mode: TextCaseMode) => void;
}) {
  return (
    <CapCutAnchorPopover open={open} onClose={onClose} anchorRef={anchorRef} side="left" estimatedWidth={176}>
      <div
        role="menu"
        aria-label="Changement de casse"
        className="min-w-[11rem] rounded-xl border border-[#333] bg-[#1a1a1a] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
      >
        <p className="px-3 py-1.5 text-[11px] font-medium text-neutral-500">Change case</p>
        {TEXT_CASE_OPTIONS.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            role="menuitem"
            onClick={() => onSelect(mode)}
            className="block w-full px-3 py-2 text-left text-[13px] text-neutral-200 transition-colors hover:bg-white/5"
          >
            {label}
          </button>
        ))}
      </div>
    </CapCutAnchorPopover>
  );
}

function DetailPopover({
  open,
  onClose,
  children,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <CapCutAnchorPopover open={open} onClose={onClose} anchorRef={anchorRef} side="left">
      <div className="w-56 rounded-xl border border-[#333] bg-[#1a1a1a] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.55)] space-y-2">
        {children}
      </div>
    </CapCutAnchorPopover>
  );
}

function MiniSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(value * 10) / 10}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#333] accent-cyan-500"
      />
    </div>
  );
}

function TextEffectButton({
  presetId,
  label,
  active,
  disabled,
  onClick,
}: {
  presetId: TextPreset;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      className={`rounded-lg border py-1.5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
          : 'border-[#333] bg-[#252525] text-neutral-400 hover:border-[#444]'
      }`}
    >
      <span className="block text-sm font-bold leading-none" style={getTextPresetPreviewStyle(presetId)}>
        T
      </span>
      <span className="mt-0.5 block text-[8px] leading-tight">{label}</span>
    </button>
  );
}

function TextEffectsSection({
  textClip,
  canEdit,
  onApply,
}: {
  textClip: Clip;
  canEdit: boolean;
  onApply: (presetId: TextPreset) => void;
}) {
  const activePreset = textClip.textPreset ?? 'none';
  const activeLabel = getTextStylePresetDef(activePreset)?.label ?? 'Aucun';

  return (
    <div className={`${SECTION} px-4 py-3 space-y-3`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[15px] font-semibold text-neutral-100">Effets de texte</p>
          <p className="text-[11px] text-neutral-500">
            Actif : <span className="text-neutral-300">{activeLabel}</span>
          </p>
        </div>
        {activePreset !== 'none' ? (
          <button
            type="button"
            disabled={!canEdit}
            onClick={() => onApply('none')}
            className="shrink-0 rounded-md px-2 py-1 text-[11px] text-neutral-400 hover:bg-white/5 hover:text-neutral-200 disabled:opacity-40"
          >
            Retirer
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {TEXT_STYLE_QUICK_IDS.map((id) => {
          const def = getTextStylePresetDef(id);
          return (
            <TextEffectButton
              key={id}
              presetId={id}
              label={def?.label ?? id}
              active={activePreset === id}
              disabled={!canEdit}
              onClick={() => onApply(id)}
            />
          );
        })}
      </div>

      <div className={`max-h-52 space-y-2 overflow-y-auto pr-0.5 ${SCROLL_HIDE}`}>
        {TEXT_STYLE_GROUPS.map((group) => {
          const items = presetsByGroup(group).filter((p) => !TEXT_STYLE_QUICK_IDS.includes(p.id));
          if (items.length === 0) return null;
          return (
            <div key={group}>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                {TEXT_STYLE_GROUP_LABELS[group]}
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {items.map((p) => (
                  <TextEffectButton
                    key={p.id}
                    presetId={p.id}
                    label={p.label}
                    active={activePreset === p.id}
                    disabled={!canEdit}
                    onClick={() => onApply(p.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TextPanelCapCut({ textClip, canEdit, upd, editableClip }: TextPanelCapCutProps) {
  const [panelMode, setPanelMode] = useState<PanelBasicAdvancedMode>('basic');
  const [alignOpen, setAlignOpen] = useState(false);
  const [caseOpen, setCaseOpen] = useState(false);
  const [spacingOpen, setSpacingOpen] = useState(false);
  const [strokeOpen, setStrokeOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const [shadowOpen, setShadowOpen] = useState(false);
  const [fillColorOpen, setFillColorOpen] = useState(false);

  const alignBtnRef = useRef<HTMLButtonElement>(null);
  const caseBtnRef = useRef<HTMLButtonElement>(null);
  const spacingBtnRef = useRef<HTMLButtonElement>(null);
  const strokeBtnRef = useRef<HTMLButtonElement>(null);
  const bgBtnRef = useRef<HTMLButtonElement>(null);
  const shadowBtnRef = useRef<HTMLButtonElement>(null);
  const fillColorBtnRef = useRef<HTMLButtonElement>(null);

  const textAlign = (textClip.textAlign ?? 'center') as TextAlign;
  const hasBg = (textClip.backgroundOpacity ?? 0) > 0;
  const hasStroke = (textClip.strokeWidth ?? 0) > 0;
  const hasShadow = textClip.textShadow ?? false;
  const opacityPct = Math.round((textClip.opacity ?? 1) * 100);
  const glowOn = hasShadow && (textClip.textShadowBlur ?? 0) >= 8;

  const applyTextPreset = (presetId: TextPreset) => {
    if (!canEdit) return;
    if (presetId === 'none') {
      upd({ textPreset: 'none' });
      return;
    }
    const def = getTextStylePresetDef(presetId);
    upd({
      textPreset: presetId,
      textShadow: false,
      ...(def?.patch ?? {}),
    });
  };

  const resetStyle = () => {
    upd({
      fontColor: '#ffffff',
      strokeWidth: 0,
      backgroundOpacity: 0,
      textShadow: false,
      opacity: 1,
      textPreset: 'none',
    });
  };

  const resetOpacity = () => upd({ opacity: 1 });

  const handleFontColorChange = (color: string) => {
    const patch: Partial<Clip> = { fontColor: color };
    if (isColorLockedTextPreset(textClip.textPreset)) {
      patch.textPreset = 'none';
    }
    upd(patch);
  };

  const closeAllPopovers = () => {
    setAlignOpen(false);
    setCaseOpen(false);
    setSpacingOpen(false);
    setStrokeOpen(false);
    setBgOpen(false);
    setShadowOpen(false);
    setFillColorOpen(false);
  };

  return (
    <div className={`bg-black ${!canEdit ? 'opacity-60' : ''}`}>
      <BasicAdvancedModeSwitch
        mode={panelMode}
        disabled={!canEdit}
        ariaLabel="Mode d'édition texte"
        onChange={(mode) => {
          closeAllPopovers();
          setPanelMode(mode);
        }}
      />

      {panelMode === 'basic' ? (
        <>
      {/* ── Zone saisie + police + barre d'outils ── */}
      <div className="space-y-3 bg-black px-3 pb-3 pt-3">
        <textarea
          value={textClip.content ?? ''}
          onChange={(e) => upd({ content: e.target.value })}
          disabled={!canEdit}
          rows={4}
          placeholder="Saisissez votre texte…"
          className={`w-full resize-none rounded-xl ${INPUT_BG} px-3 py-2.5 text-[14px] leading-relaxed text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:cursor-not-allowed`}
        />

        <div className="flex gap-2">
          <CapCutSelect
            value={textClip.fontFamily ?? 'inherit'}
            onChange={(v) => upd({ fontFamily: v })}
            disabled={!canEdit}
            className="min-w-0 flex-1 truncate"
            style={{ fontFamily: textClip.fontFamily ?? 'inherit' }}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </CapCutSelect>
          <CapCutFontSizePicker
            value={textClip.fontSize ?? 24}
            onChange={(v) => upd({ fontSize: v })}
            disabled={!canEdit}
            options={FONT_SIZE_OPTIONS}
          />
        </div>

        <div className="flex items-center gap-0.5">
          <ToolBtn
            active={(textClip.fontWeight ?? 'bold') === 'bold'}
            disabled={!canEdit}
            title="Gras"
            onClick={() => upd({ fontWeight: textClip.fontWeight === 'bold' ? 'normal' : 'bold' })}
          >
            <strong>B</strong>
          </ToolBtn>
          <ToolBtn
            active={(textClip.fontStyle ?? 'normal') === 'italic'}
            disabled={!canEdit}
            title="Italique"
            onClick={() => upd({ fontStyle: textClip.fontStyle === 'italic' ? 'normal' : 'italic' })}
          >
            <em>I</em>
          </ToolBtn>
          <ToolBtn
            active={textClip.textDecoration === 'underline'}
            disabled={!canEdit}
            title="Souligné"
            onClick={() => upd({ textDecoration: textClip.textDecoration === 'underline' ? 'none' : 'underline' })}
          >
            <span className="underline">U</span>
          </ToolBtn>

          <span className="mx-1 h-5 w-px bg-[#2a2a2a]" aria-hidden />

          <div className="relative">
            <button
              ref={alignBtnRef}
              type="button"
              disabled={!canEdit}
              onClick={() => { closeAllPopovers(); setAlignOpen((v) => !v); }}
              className={`flex h-8 items-center gap-0.5 rounded-lg px-1.5 transition-colors disabled:opacity-40 ${
                alignOpen ? 'bg-cyan-500/15 text-cyan-300' : 'text-neutral-400 hover:bg-white/5'
              }`}
              title="Alignement"
            >
              <AlignIcon align={textAlign} />
              <svg
                width="8"
                height="5"
                viewBox="0 0 8 5"
                fill="currentColor"
                className={`text-neutral-500 transition-transform ${alignOpen ? 'rotate-180' : ''}`}
                aria-hidden
              >
                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
            <AlignGridPopover
              open={alignOpen}
              onClose={() => setAlignOpen(false)}
              anchorRef={alignBtnRef}
              textClip={textClip}
              onSelect={(align) => upd({ textAlign: align })}
            />
          </div>

          <div className="relative">
            <button
              ref={caseBtnRef}
              type="button"
              disabled={!canEdit}
              onClick={() => { closeAllPopovers(); setCaseOpen((v) => !v); }}
              className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-1.5 text-[13px] font-semibold transition-colors disabled:opacity-40 ${
                caseOpen ? 'bg-cyan-500/15 text-cyan-300' : 'text-neutral-400 hover:bg-white/5'
              }`}
              title="Changement de casse"
            >
              Aa
            </button>
            <CaseChangePopover
              open={caseOpen}
              onClose={() => setCaseOpen(false)}
              anchorRef={caseBtnRef}
              onSelect={(mode) => {
                upd({
                  content: applyTextCaseMode(textClip.content ?? '', mode),
                  textTransform: undefined,
                });
                setCaseOpen(false);
              }}
            />
          </div>

          <div className="relative">
            <button
              ref={spacingBtnRef}
              type="button"
              disabled={!canEdit}
              onClick={() => { closeAllPopovers(); setSpacingOpen((v) => !v); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/5 disabled:opacity-40"
              title="Espacement"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" />
              </svg>
            </button>
            <DetailPopover open={spacingOpen} onClose={() => setSpacingOpen(false)} anchorRef={spacingBtnRef}>
              <MiniSlider
                label="Espacement des lettres"
                value={textClip.letterSpacing ?? 0}
                min={-5}
                max={30}
                step={0.5}
                unit="px"
                onChange={(v) => upd({ letterSpacing: v })}
              />
              <MiniSlider
                label="Interligne"
                value={textClip.lineHeight ?? 1.3}
                min={0.8}
                max={3}
                step={0.1}
                onChange={(v) => upd({ lineHeight: v })}
              />
              <ToolBtn
                active={textClip.textDecoration === 'line-through'}
                disabled={!canEdit}
                title="Barré"
                onClick={() => upd({ textDecoration: textClip.textDecoration === 'line-through' ? 'none' : 'line-through' })}
              >
                <span className="line-through text-[13px]">S</span>
              </ToolBtn>
            </DetailPopover>
          </div>
        </div>
      </div>

      {/* ── Style ── */}
      <div className={`${SECTION} px-4 py-3 space-y-2`}>
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-neutral-100">Style</p>
          <button type="button" onClick={resetStyle} disabled={!canEdit} className="rounded-md p-1 text-neutral-500 hover:bg-white/5 hover:text-neutral-300 disabled:opacity-40" title="Réinitialiser le style">
            <ResetIcon />
          </button>
        </div>

        <StyleRow label="Couleur">
          <ColorChip
            ref={fillColorBtnRef}
            color={textClip.fontColor ?? '#ffffff'}
            active
            disabled={!canEdit}
            onClick={() => {
              closeAllPopovers();
              setFillColorOpen((v) => !v);
            }}
          />
          <DetailPopover
            open={fillColorOpen}
            onClose={() => setFillColorOpen(false)}
            anchorRef={fillColorBtnRef}
          >
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.slice(0, 8).map((c) => (
                <ColorChip
                  key={c}
                  color={c}
                  active={(textClip.fontColor ?? '#ffffff') === c}
                  onClick={() => handleFontColorChange(c)}
                />
              ))}
            </div>
            <label className="flex items-center gap-2 text-[12px] text-neutral-400">
              Couleur
              <input
                type="color"
                value={textClip.fontColor ?? '#ffffff'}
                onChange={(e) => handleFontColorChange(e.target.value)}
                className="h-6 w-6 cursor-pointer rounded border-0"
              />
            </label>
          </DetailPopover>
        </StyleRow>

        <StyleRow label="Trait">
          <ColorChip
            none={!hasStroke}
            color={textClip.strokeColor ?? '#000000'}
            active={hasStroke}
            disabled={!canEdit}
            onClick={() => upd({ strokeWidth: hasStroke ? 0 : 2, strokeColor: textClip.strokeColor ?? '#000000' })}
          />
          <div className="relative">
            <button
              ref={strokeBtnRef}
              type="button"
              disabled={!canEdit}
              onClick={() => { closeAllPopovers(); setStrokeOpen((v) => !v); }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-white/5 disabled:opacity-40"
              aria-label="Options contour"
            >
              ···
            </button>
            <DetailPopover open={strokeOpen} onClose={() => setStrokeOpen(false)} anchorRef={strokeBtnRef}>
              <label className="flex items-center gap-2 text-[12px] text-neutral-400">
                Couleur
                <input type="color" value={textClip.strokeColor ?? '#000000'} onChange={(e) => upd({ strokeColor: e.target.value, strokeWidth: Math.max(1, textClip.strokeWidth ?? 2) })} className="h-6 w-6 cursor-pointer rounded border-0" />
              </label>
              <MiniSlider label="Épaisseur" value={textClip.strokeWidth ?? 2} min={1} max={10} step={0.5} unit="px" onChange={(v) => upd({ strokeWidth: v })} />
            </DetailPopover>
          </div>
        </StyleRow>

        <StyleRow label="Arrière-plan">
          <ColorChip
            none={!hasBg}
            color={textClip.backgroundColor ?? '#000000'}
            active={hasBg}
            disabled={!canEdit}
            onClick={() => upd({ backgroundOpacity: hasBg ? 0 : 0.7, backgroundColor: textClip.backgroundColor ?? '#000000' })}
          />
          <div className="relative">
            <button
              ref={bgBtnRef}
              type="button"
              disabled={!canEdit}
              onClick={() => { closeAllPopovers(); setBgOpen((v) => !v); }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-white/5 disabled:opacity-40"
              aria-label="Options arrière-plan"
            >
              ···
            </button>
            <DetailPopover open={bgOpen} onClose={() => setBgOpen(false)} anchorRef={bgBtnRef}>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.slice(0, 8).map((c) => (
                  <ColorChip key={c} color={c} active={(textClip.backgroundColor ?? '#000000') === c} onClick={() => upd({ backgroundColor: c, backgroundOpacity: Math.max(0.05, textClip.backgroundOpacity ?? 0.7) })} />
                ))}
              </div>
              <label className="flex items-center gap-2 text-[12px] text-neutral-400">
                Couleur
                <input type="color" value={textClip.backgroundColor ?? '#000000'} onChange={(e) => upd({ backgroundColor: e.target.value, backgroundOpacity: Math.max(0.05, textClip.backgroundOpacity ?? 0.7) })} className="h-6 w-6 cursor-pointer rounded border-0" />
              </label>
              <MiniSlider label="Opacité fond" value={(textClip.backgroundOpacity ?? 0.7) * 100} min={5} max={100} step={5} unit="%" onChange={(v) => upd({ backgroundOpacity: v / 100 })} />
            </DetailPopover>
          </div>
        </StyleRow>

        <StyleRow label="Ombre">
          <ColorChip
            none={!hasShadow}
            color={textClip.textShadowColor ?? '#000000'}
            active={hasShadow}
            disabled={!canEdit}
            onClick={() => upd({ textShadow: !hasShadow, textShadowColor: textClip.textShadowColor ?? '#000000' })}
          />
          <div className="relative">
            <button
              ref={shadowBtnRef}
              type="button"
              disabled={!canEdit}
              onClick={() => { closeAllPopovers(); setShadowOpen((v) => !v); }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-white/5 disabled:opacity-40"
              aria-label="Options ombre"
            >
              ···
            </button>
            <DetailPopover open={shadowOpen} onClose={() => setShadowOpen(false)} anchorRef={shadowBtnRef}>
              <label className="flex items-center gap-2 text-[12px] text-neutral-400">
                Couleur
                <input type="color" value={textClip.textShadowColor ?? '#000000'} onChange={(e) => upd({ textShadow: true, textShadowColor: e.target.value })} className="h-6 w-6 cursor-pointer rounded border-0" />
              </label>
              <MiniSlider label="Flou" value={textClip.textShadowBlur ?? 4} min={0} max={30} step={1} unit="px" onChange={(v) => upd({ textShadow: true, textShadowBlur: v })} />
              <MiniSlider label="Décal. X" value={textClip.textShadowX ?? 2} min={-20} max={20} step={1} unit="px" onChange={(v) => upd({ textShadow: true, textShadowX: v })} />
              <MiniSlider label="Décal. Y" value={textClip.textShadowY ?? 2} min={-20} max={20} step={1} unit="px" onChange={(v) => upd({ textShadow: true, textShadowY: v })} />
            </DetailPopover>
          </div>
        </StyleRow>
      </div>

          {/* ── Lueur ── */}
          <div className={`flex items-center justify-between ${SECTION} px-4 py-3`}>
            <span className="text-[13px] text-neutral-400">Lueur</span>
            <button
              type="button"
              disabled={!canEdit}
              role="switch"
              aria-checked={glowOn}
              onClick={() => {
                if (glowOn) {
                  upd({ textShadow: false });
                } else {
                  upd({
                    textShadow: true,
                    textShadowColor: textClip.fontColor ?? '#ffffff',
                    textShadowBlur: 16,
                    textShadowX: 0,
                    textShadowY: 0,
                  });
                }
              }}
              className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-40 ${glowOn ? 'bg-cyan-500' : 'bg-[#404040]'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${glowOn ? 'left-[1.35rem]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* ── Opacité ── */}
          <div className={`${SECTION} px-4 py-3 space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-neutral-400">Opacité</span>
              <button type="button" onClick={resetOpacity} disabled={!canEdit} className="rounded-md p-1 text-neutral-500 hover:bg-white/5 disabled:opacity-40" title="Réinitialiser opacité">
                <ResetIcon />
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                disabled={!canEdit}
                value={opacityPct}
                onChange={(e) => upd({ opacity: parseFloat(e.target.value) / 100 })}
                className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#333] disabled:opacity-40 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
              />
              <div className={`flex h-9 w-[4.5rem] shrink-0 items-center justify-center rounded-[10px] ${INPUT_BG} text-[13px] tabular-nums text-neutral-100`}>
                {opacityPct}%
              </div>
            </div>
          </div>

          {editableClip ? (
            <TextTransformerSection clip={editableClip} disabled={!canEdit} />
          ) : null}
        </>
      ) : (
        <TextEffectsSection textClip={textClip} canEdit={canEdit} onApply={applyTextPreset} />
      )}
    </div>
  );
}
