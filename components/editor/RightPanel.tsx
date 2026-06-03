'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SegmentResponse, VideoAnalysisResponse } from '@/types/templates';
import type { Clip, TransitionType, Composition } from '@/types/composition';
import { defaultOverlayBoxWidthPct } from '@/components/editor/MovableCanvasZone';
import { TransformerSection } from '@/components/editor/TransformerSection';
import { TextPanelCapCut } from '@/components/editor/TextPanelCapCut';
import { TEXT_PANEL_DEFAULTS } from '@/lib/editor/textPanelConstants';
import { TransitionGlPreview } from '@/components/editor/TransitionGlPreview';
import { TransitionGlLibrary } from '@/components/editor/TransitionGlLibrary';
import {
  GL_TRANSITION_CUT,
  formatGlTransitionLabel,
  resolveGlTransitionName,
} from '@/lib/glTransitions';
import { findClipInComposition } from '@/lib/editorPanelRouting';
import {
  applyGlTransitionToJunction,
  findLane0Junctions,
  findTransitionBetween,
  firstBackgroundLane,
  formatJunctionClipLabel,
  transitionConsecutiveOnLane,
} from '@/lib/transitionApply';
import { useCompositionStore } from '@/stores/compositionStore';
import { generateSegmentVideo, getAnalysis } from '@/lib/templates';
import { getApiErrorMessage } from '@/lib/api-error';
import { uploadCompositionAsset } from '@/lib/compositions';
import {
  MEDIA_FILTER_PRESET_IDS,
  MEDIA_FILTER_UI_LABELS,
} from '@/lib/studio/mediaFilterPresets';
import { probeMediaDimensions } from '@/lib/studio/mediaDimensions';
import { ImageGalleryPanel, galleryItemFromUrl, type GalleryImageItem } from '@/components/editor/ImageGalleryPanel';
import { ImageGeneratePromptBox } from '@/components/editor/ImageGeneratePromptBox';
import { BasicAdvancedModeSwitch, type PanelBasicAdvancedMode } from '@/components/editor/BasicAdvancedModeSwitch';
import { CREDITS_GENERATE_VIDEO } from '@/types/templates';
import { PANEL, panelClasses as P, textSectionBoxStyle } from '@/lib/rightPanelTheme';

// ── Transitions (piste V, clips consécutifs) ─────────────────────────────────

function TransitionSection() {
  const composition = useCompositionStore((s) => s.composition);
  const { addTransition, updateTransition, removeTransition, setCurrentTime } = useCompositionStore();
  const transitionEditorFocusPair = useCompositionStore((s) => s.transitionEditorFocusPair);
  const selectedTransitionJunction = useCompositionStore((s) => s.selectedTransitionJunction);
  const selectTransitionJunction = useCompositionStore((s) => s.selectTransitionJunction);
  const clearTransitionEditorFocusPair = useCompositionStore((s) => s.clearTransitionEditorFocusPair);
  const bg = useMemo(
    () => composition?.tracks.background ?? [],
    [composition?.tracks.background]
  );
  const lane0 = useMemo(() => firstBackgroundLane(bg), [bg]);
  const lane0Junctions = useMemo(() => findLane0Junctions(lane0), [lane0]);

  useEffect(() => {
    if (!transitionEditorFocusPair) return;
    const { from } =
      lane0Junctions.find(
        (j) =>
          j.from.id === transitionEditorFocusPair.fromClipId &&
          j.to.id === transitionEditorFocusPair.toClipId
      ) ?? {};
    if (from) setCurrentTime(Math.max(0, from.endTime - 0.08));
    clearTransitionEditorFocusPair();
  }, [transitionEditorFocusPair, lane0Junctions, setCurrentTime, clearTransitionEditorFocusPair]);

  const junctionIdx = selectedTransitionJunction
    ? lane0Junctions.findIndex(
        (j) =>
          j.from.id === selectedTransitionJunction.fromClipId &&
          j.to.id === selectedTransitionJunction.toClipId
      )
    : -1;

  const junctionReady = junctionIdx >= 0;
  const activePair = junctionReady ? lane0Junctions[junctionIdx] : undefined;
  const activeFrom = activePair?.from;
  const activeTo = activePair?.to;
  const activeOk =
    junctionReady &&
    !!activeFrom &&
    !!activeTo &&
    transitionConsecutiveOnLane(lane0, activeFrom, activeTo);

  const activeTr =
    activeFrom && activeTo
      ? findTransitionBetween(composition?.transitions, activeFrom.id, activeTo.id)
      : undefined;
  const currentType: TransitionType = activeTr?.type ?? 'cut';
  const duration = activeTr?.duration ?? 0.5;

  const resolvedGlName = !activeOk
    ? GL_TRANSITION_CUT
    : resolveGlTransitionName(activeTr) ?? GL_TRANSITION_CUT;

  const onSelectGlName = (glName: string) => {
    if (!activeFrom || !activeTo || !activeOk) return;
    applyGlTransitionToJunction(activeFrom, activeTo, lane0, glName, composition, {
      addTransition,
      updateTransition,
      removeTransition,
    });
  };

  const fromMediaUrl = activeFrom?.thumbnail ?? activeFrom?.url;
  const toMediaUrl = activeTo?.thumbnail ?? activeTo?.url;

  const setDuration = (d: number) => {
    if (!activeFrom || !activeTo || !activeOk) return;
    const nextId = `tr-${activeFrom.id}-${activeTo.id}`;
    if (activeTr) updateTransition(activeTr.id, { duration: d });
    else
      addTransition({
        id: nextId,
        fromClipId: activeFrom.id,
        toClipId: activeTo.id,
        type: 'fade',
        duration: d,
        presetId: 'fade',
        glTransitionName: 'fade',
      });
  };

  const fromIdx = activeFrom ? lane0.findIndex((c) => c.id === activeFrom.id) : -1;
  const toIdx = activeTo ? lane0.findIndex((c) => c.id === activeTo.id) : -1;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-lg border border-[#333333]/60 bg-[#1a1a1a]/40 p-2.5">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            junctionReady ? 'bg-cyan-500 text-white' : 'bg-[#2b2b2b] text-neutral-300'
          }`}
        >
          1
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Sur la timeline, cliquez le marqueur <span className="text-cyan-300 font-semibold">◆</span> entre deux clips
          sur <span className="text-cyan-400 font-semibold">V1</span>. Un menu rapide s’ouvre ; vous pouvez aussi
          choisir ci-dessous.
        </p>
      </div>

      <div className="flex gap-2 rounded-lg border border-[#333333]/60 bg-[#1a1a1a]/40 p-2.5">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            junctionReady ? 'bg-cyan-500 text-white' : 'bg-[#252525] text-neutral-500'
          }`}
        >
          2
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          {junctionReady
            ? 'Choisissez un effet GL ci-dessous (aperçu WebGL + lecture).'
            : 'La bibliothèque s’active après avoir sélectionné un raccord (étape 1).'}
        </p>
      </div>

      <div className="rounded-lg border border-[#333333]/60 bg-[#1a1a1a]/50 p-3 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Raccord sur V1</p>
        {lane0Junctions.length === 0 ? (
          <p className="text-xs text-neutral-500">
            Aucun raccord : placez au moins <strong className="text-neutral-300">deux clips vidéo bord à bord</strong> sur
            la première ligne V.
          </p>
        ) : !junctionReady ? (
          <p className="text-xs text-amber-100/90">
            {lane0Junctions.length === 1
              ? 'Un raccord est disponible — cliquez le ◆ sur la timeline pour le sélectionner.'
              : `${lane0Junctions.length} raccords — cliquez un ◆ ou choisissez dans la liste :`}
          </p>
        ) : null}
        {lane0Junctions.length > 1 && (
          <div className="flex flex-col gap-1.5">
            {lane0Junctions.map((j, i) => (
              <label
                key={`${j.from.id}-${j.to.id}`}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs ${
                  junctionIdx === i ? 'border-cyan-400/70 bg-cyan-500/10' : 'border-[#333333]/80 bg-[#252525]/40'
                }`}
              >
                <input
                  type="radio"
                  name="v1-junction"
                  checked={junctionIdx === i}
                  onChange={() => selectTransitionJunction(j.from.id, j.to.id)}
                />
                <span className="text-neutral-200">
                  {formatJunctionClipLabel(j.from, i)} → {formatJunctionClipLabel(j.to, i + 1)}
                </span>
              </label>
            ))}
          </div>
        )}
        {junctionReady && activeFrom && activeTo && (
          <p className="text-xs text-neutral-300 border-t border-[#333333]/50 pt-2">
            <span className="text-neutral-500">Sélectionné : </span>
            <span className="font-semibold text-cyan-300">
              {formatJunctionClipLabel(activeFrom, fromIdx >= 0 ? fromIdx : 0)}
            </span>
            <span className="text-neutral-500"> → </span>
            <span className="font-semibold text-cyan-300">
              {formatJunctionClipLabel(activeTo, toIdx >= 0 ? toIdx : 1)}
            </span>
          </p>
        )}
      </div>

      {junctionReady && activeFrom && activeTo && (
        <div className="rounded-lg border border-[#333333]/60 bg-[#1a1a1a]/50 p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
            Aperçu transition
          </p>
          <p className="text-[10px] text-neutral-500">
            {formatGlTransitionLabel(resolvedGlName)}
            {resolvedGlName !== GL_TRANSITION_CUT && (
              <span className="text-neutral-600"> · {resolvedGlName}</span>
            )}
          </p>
          <TransitionGlPreview
            fromUrl={fromMediaUrl}
            toUrl={toMediaUrl}
            glTransitionName={resolvedGlName}
            duration={duration}
            disabled={!activeOk}
          />
        </div>
      )}

      <div className="rounded-lg border border-[#333333]/60 bg-[#1a1a1a]/50 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
          Bibliothèque GL
        </p>
        {!junctionReady && lane0Junctions.length > 0 && (
          <p className="mb-2 text-[10px] text-neutral-500">Sélectionnez d’abord un raccord (étape 1).</p>
        )}
        <TransitionGlLibrary
          selectedName={resolvedGlName}
          disabled={!activeOk}
          onSelectName={onSelectGlName}
          previewFromUrl={fromMediaUrl}
          previewToUrl={toMediaUrl}
        />
      </div>

      {activeOk && activeFrom && activeTo && (
        <div className="rounded-lg border border-[#333333]/60 bg-[#1a1a1a]/50 p-3 space-y-3">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-neutral-500">Durée (aperçu)</p>
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="range"
              min={0.2}
              max={2.5}
              step={0.05}
              value={Math.min(2.5, Math.max(0.2, duration))}
              disabled={currentType === 'cut'}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="min-w-0 flex-1 h-1.5 accent-cyan-500 cursor-pointer disabled:opacity-35"
            />
            <span className="text-[10px] text-neutral-400 w-10 shrink-0 text-right tabular-nums">
              {duration.toFixed(2)}s
            </span>
          </div>
          {currentType === 'cut' && (
            <p className="text-[9px] text-neutral-600">Coupe sèche : pas de fondu sur la durée.</p>
          )}
          {activeTr && (
            <button
              type="button"
              onClick={() => removeTransition(activeTr.id)}
              className="w-full rounded-md border border-red-900/50 py-1.5 text-[10px] font-semibold text-red-300 hover:bg-red-950/40"
            >
              Retirer la transition (coupe par défaut)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components (canvas / autres sections) ────────────────────────────────

function TextPanelSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${P.cardSection} ${className}`.trim()} style={textSectionBoxStyle}>
      {children}
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 min-h-[26px]">
      <span className={`${P.sectionLabel} w-16`}>{label}</span>
      <div className="flex-1 flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function ColorSwatch({
  color,
  active,
  disabled = false,
  onClick,
}: {
  color: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 ${
        active ? 'border-white scale-110' : 'border-transparent'
      }`}
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  color,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
  color?: string;
  disabled?: boolean;
}) {
  const sliderValue = Math.min(max, Math.max(min, value));
  return (
    <ControlRow label={label}>
      <input
        type="range"
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-45"
        style={{ accentColor: color ?? PANEL.accent }}
      />
      <span className={P.value}>
        {Math.round(value)}
        {unit}
      </span>
    </ControlRow>
  );
}

// ── Section: TEXTE ───────────────────────────────────────────────────────────

function resolveEditableTextClip(
  composition: Composition,
  segmentId: string,
  selectedClipId: string | null,
  currentTime: number
): Clip | undefined {
  const texts = composition.tracks.text;
  if (selectedClipId) {
    const selectedText = texts.find((c) => c.id === selectedClipId);
    if (selectedText) return selectedText;
    if (findClipInComposition(composition, selectedClipId)) return undefined;
  }
  const atPlayhead = texts.find(
    (c) => c.startTime <= currentTime && c.endTime > currentTime
  );
  if (atPlayhead) return atPlayhead;
  return texts.find((c) => c.segmentId === segmentId);
}

function TextSection({ segmentId }: { segmentId: string }) {
  const composition = useCompositionStore((s) => s.composition);
  const selectedClipId = useCompositionStore((s) => s.selectedClipId);
  const currentTime = useCompositionStore((s) => s.currentTime);
  const updateClip = useCompositionStore((s) => s.updateClip);

  const editableClip =
    composition && resolveEditableTextClip(composition, segmentId, selectedClipId, currentTime);
  const canEdit = !!editableClip;
  const textClip = editableClip ?? TEXT_PANEL_DEFAULTS;
  const hasTextClips = (composition?.tracks.text.length ?? 0) > 0;

  const upd = (patch: Parameters<typeof updateClip>[1]) => {
    if (editableClip) updateClip(editableClip.id, patch);
  };

  return (
    <div className="space-y-3">
      {!canEdit && (
        <div className="rounded-lg border border-dashed border-[#333] bg-[#0a0a0a] px-2.5 py-2 space-y-2">
          <p className="text-[11px] text-neutral-400 leading-snug">
            {selectedClipId && !editableClip
              ? 'Un autre élément est sélectionné. Cliquez un clip texte sur la timeline pour modifier.'
              : hasTextClips
                ? 'Sélectionnez un clip texte sur la timeline ou placez la tête de lecture sur un texte.'
                : 'Aucun texte sur cette composition (les textes viennent des séquences ou d’une importation).'}
          </p>
        </div>
      )}

      <TextPanelCapCut
        textClip={textClip}
        canEdit={canEdit}
        upd={upd}
        editableClip={editableClip ?? undefined}
      />
    </div>
  );
}

// ── Éditeur d’un clip audio (musique ou voix off) ─────────────────────────────

function AudioOrVoClipEditor({
  clip,
  emoji,
  isSelected = false,
}: {
  clip: Clip;
  emoji: string;
  isSelected?: boolean;
}) {
  const { updateClip, removeClip } = useCompositionStore();
  return (
    <li
      className={`rounded-lg border px-2 py-1.5 space-y-1.5 ${
        isSelected
          ? 'border-cyan-500/70 bg-cyan-950/25 ring-1 ring-cyan-500/40'
          : clip.muted
            ? 'border-[#3a3a3a] bg-[#252525]/30 opacity-60'
            : 'border-[#333333] bg-[#2b2b2b]/60'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-neutral-200 truncate flex-1">
          {emoji} {clip.content ?? 'Audio'}
        </span>
        <button
          type="button"
          onClick={() => updateClip(clip.id, { muted: !clip.muted })}
          title={clip.muted ? 'Réactiver' : 'Muet'}
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
            clip.muted ? 'bg-[#404040] text-neutral-400' : 'bg-[#2b2b2b] text-neutral-300 hover:bg-[#404040]'
          }`}
        >
          {clip.muted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          onClick={() => removeClip(clip.id)}
          className="shrink-0 rounded px-1 py-0.5 text-[10px] text-red-400 hover:bg-red-900/40"
          title="Supprimer"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-500 w-12 shrink-0">Volume</span>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={clip.volume ?? 0.8}
          onChange={(e) => updateClip(clip.id, { volume: parseFloat(e.target.value) })}
          className="flex-1 h-1 accent-green-500 cursor-pointer"
        />
        <span className="text-[10px] text-neutral-400 w-8 text-right tabular-nums">
          {Math.round((clip.volume ?? 0.8) * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-500 w-12 shrink-0">Vitesse</span>
        <input
          type="range"
          min={0.25}
          max={2}
          step={0.05}
          value={clip.playbackRate ?? 1}
          onChange={(e) => updateClip(clip.id, { playbackRate: parseFloat(e.target.value) })}
          className="flex-1 h-1 accent-cyan-500 cursor-pointer"
        />
        <span className="text-[10px] text-neutral-400 w-8 text-right tabular-nums">
          {(clip.playbackRate ?? 1).toFixed(2)}x
        </span>
      </div>

      <div className="flex flex-col gap-1.5 pt-0.5 border-t border-[#3a3a3a]/40">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-neutral-500">Fondu</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-cyan-400/90 shrink-0 w-14">Fade in</span>
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={clip.fadeIn ?? 0}
              onChange={(e) => updateClip(clip.id, { fadeIn: parseFloat(e.target.value) })}
              className="min-w-0 flex-1 h-1.5 accent-cyan-500 cursor-pointer"
              title="Fade in"
            />
            <span className="text-[10px] text-neutral-400 w-9 shrink-0 text-right tabular-nums">
              {(clip.fadeIn ?? 0).toFixed(1)}s
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-orange-400/90 shrink-0 w-14">Fade out</span>
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={clip.fadeOut ?? 0}
              onChange={(e) => updateClip(clip.id, { fadeOut: parseFloat(e.target.value) })}
              className="min-w-0 flex-1 h-1.5 accent-orange-500 cursor-pointer"
              title="Fade out"
            />
            <span className="text-[10px] text-neutral-400 w-9 shrink-0 text-right tabular-nums">
              {(clip.fadeOut ?? 0).toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-neutral-600">
        <span>{clip.startTime.toFixed(1)}s → {clip.endTime.toFixed(1)}s</span>
      </div>
    </li>
  );
}

// ── Section: AUDIO ───────────────────────────────────────────────────────────

function AudioSection({
  segmentId,
  analysis,
  compositionId,
}: {
  segmentId: string;
  analysis: VideoAnalysisResponse;
  compositionId: string | null;
}) {
  const segment = analysis.segments?.find((s) => s.id === segmentId);
  const { addClip, currentTime, composition } = useCompositionStore();
  const selectedClipId = useCompositionStore((s) => s.selectedClipId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const segBgClip = composition?.tracks.background.find((c) => c.segmentId === segmentId);
  const segDuration = segBgClip ? segBgClip.endTime - segBgClip.startTime : 5;
  const segStart = segBgClip?.startTime ?? currentTime;

  // All audio clips currently on the track
  const allAudioClips = composition?.tracks.audio ?? [];
  const allVoiceoverClips = composition?.tracks.voiceover ?? [];

  const voFileRef = useRef<HTMLInputElement>(null);
  const [voUploading, setVoUploading] = useState(false);
  const [voUploadPct, setVoUploadPct] = useState(0);
  const [voUploadError, setVoUploadError] = useState<string | null>(null);

  const voEnd = segBgClip ? segBgClip.endTime : segStart + segDuration;

  const handleAddSuggestion = useCallback(
    (url: string | null, title: string) => {
      if (!url) return;
      addClip({
        id: `audio-${Date.now()}`,
        trackType: 'audio',
        type: 'audio',
        startTime: segStart,
        endTime: segStart + segDuration,
        url,
        volume: 0.8,
        fadeIn: 0.5,
        fadeOut: 0.5,
        content: title,
        segmentId,
      });
    },
    [addClip, segStart, segDuration, segmentId]
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!compositionId) {
        setUploadError('Composition non initialisée — rechargez la page.');
        return;
      }
      setUploading(true);
      setUploadPct(0);
      setUploadError(null);
      try {
        const { assetUrl } = await uploadCompositionAsset(compositionId, file, setUploadPct);
        addClip({
          id: `audio-upload-${Date.now()}`,
          trackType: 'audio',
          type: 'audio',
          startTime: currentTime,
          endTime: currentTime + 30,
          url: assetUrl,
          volume: 0.8,
          content: file.name,
        });
      } catch (e) {
        setUploadError(getApiErrorMessage(e, 'Impossible d\'importer l\'audio.'));
      } finally {
        setUploading(false);
      }
    },
    [compositionId, addClip, currentTime]
  );

  const handleVoUpload = useCallback(
    async (file: File) => {
      if (!compositionId) {
        setVoUploadError('Composition non initialisée — rechargez la page.');
        return;
      }
      setVoUploading(true);
      setVoUploadPct(0);
      setVoUploadError(null);
      try {
        const { assetUrl } = await uploadCompositionAsset(compositionId, file, setVoUploadPct);
        addClip({
          id: `vo-upload-${Date.now()}`,
          trackType: 'voiceover',
          type: 'audio',
          startTime: segStart,
          endTime: voEnd,
          url: assetUrl,
          volume: 1,
          fadeIn: 0.15,
          fadeOut: 0.15,
          content: file.name,
          segmentId,
        });
      } catch (e) {
        setVoUploadError(getApiErrorMessage(e, 'Impossible d\'importer la voix off.'));
      } finally {
        setVoUploading(false);
      }
    },
    [compositionId, addClip, segStart, voEnd, segmentId]
  );

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Audio</p>

      {uploadError && <p className="text-[10px] text-red-400">{uploadError}</p>}

      {/* ── Musique de fond (piste A) ── */}
      {allAudioClips.length > 0 && (
        <div>
          <p className="text-[10px] text-neutral-500 mb-1">Musique / fond sonore (A)</p>
          <ul className="space-y-2">
            {allAudioClips.map((clip) => (
              <AudioOrVoClipEditor
                key={clip.id}
                clip={clip}
                emoji="🎵"
                isSelected={clip.id === selectedClipId}
              />
            ))}
          </ul>
        </div>
      )}

      {segment?.audioSuggestions && segment.audioSuggestions.length > 0 && (
        <div>
          <p className="text-[10px] text-neutral-500 mb-1">Suggestions IA</p>
          <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {segment.audioSuggestions.map((s, i) => (
              <li key={`${s.title}-${i}`} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddSuggestion(s.url ?? null, s.title)}
                  disabled={!s.url}
                  className="shrink-0 rounded bg-green-700 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-green-600 disabled:opacity-40"
                  title="Ajouter à la timeline"
                >
                  + Ajouter
                </button>
                <span className="text-xs text-neutral-300 truncate">{s.title}</span>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[10px] text-cyan-400 hover:text-cyan-300"
                  >
                    ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-[10px] text-neutral-500 mb-1">Votre audio (mp3/wav/aac)</p>
        <input
          ref={fileRef}
          type="file"
          accept="audio/mp3,audio/mpeg,audio/wav,audio/aac,.mp3,.wav,.aac"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f); }}
        />
        {uploading ? (
          <div className="rounded bg-[#2b2b2b] h-2 overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${uploadPct}%` }} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-lg border border-dashed border-[#3a3a3a] py-2 text-xs text-neutral-400 hover:border-neutral-400 hover:text-neutral-200 transition-colors"
          >
            📎 Choisir un fichier audio
          </button>
        )}
      </div>

      {/* ── Voix off (VO) — piste timeline séparée sous la musique ── */}
      <div className="rounded-lg border border-pink-900/40 bg-pink-950/20 p-2.5 space-y-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-pink-400">Voix off (VO)</p>
          <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">
            Narration, commentaire ou enregistrement par-dessus la musique. Les clips apparaissent sur la piste{' '}
            <span className="text-pink-300 font-semibold">VO1, VO2…</span> sous la piste <span className="text-emerald-400">A</span>.
            Même outils que la musique : volume, vitesse, fade, coupe sur la timeline.
          </p>
        </div>
        {voUploadError && <p className="text-[10px] text-red-400">{voUploadError}</p>}
        {allVoiceoverClips.length > 0 && (
          <div>
            <p className="text-[10px] text-neutral-500 mb-1">Clips voix off sur la composition</p>
            <ul className="space-y-2">
              {allVoiceoverClips.map((clip) => (
                <AudioOrVoClipEditor
                  key={clip.id}
                  clip={clip}
                  emoji="🎙️"
                  isSelected={clip.id === selectedClipId}
                />
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="text-[10px] text-neutral-500 mb-1">Importer une voix off</p>
          <input
            ref={voFileRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/aac,audio/webm,.mp3,.wav,.aac,.m4a,.webm"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleVoUpload(f);
              e.target.value = '';
            }}
          />
          {voUploading ? (
            <div className="rounded bg-[#2b2b2b] h-2 overflow-hidden">
              <div className="h-full bg-pink-500 transition-all" style={{ width: `${voUploadPct}%` }} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => voFileRef.current?.click()}
              className="w-full rounded-lg border border-dashed border-pink-600/50 py-2 text-xs text-pink-200/90 hover:border-pink-400 hover:bg-pink-900/20 transition-colors"
            >
              🎙️ Choisir un fichier voix off
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Cadre format (fond + bordure) ─────────────────────────────────────────────

const FRAME_COLOR_PRESETS = [
  '#000000', '#ffffff', '#1a1a1a', '#f0f1f4', '#22d3ee', '#ff6b00', '#a855f7',
];

function FrameCanvasPanel() {
  const composition = useCompositionStore((s) => s.composition);
  const updateCompositionFrame = useCompositionStore((s) => s.updateCompositionFrame);

  if (!composition) return null;

  const bg = composition.canvasBackgroundColor ?? '#000000';
  const borderColor = composition.frameBorderColor ?? '#ffffff';
  const borderW = composition.frameBorderWidth ?? 0;

  return (
    <TextPanelSection>
      <p className={P.sectionTitle}>Cadre format</p>
      <p className={`${P.sectionLabel} mb-1`}>Fond du cadre</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {FRAME_COLOR_PRESETS.map((c) => (
          <ColorSwatch
            key={c}
            color={c}
            active={bg === c}
            onClick={() => updateCompositionFrame({ canvasBackgroundColor: c })}
          />
        ))}
        <label className="relative w-5 h-5 rounded-full cursor-pointer border-2 border-dashed border-[#505050] hover:border-neutral-300 overflow-hidden flex items-center justify-center">
          <span className="text-[8px] text-neutral-400">+</span>
          <input
            type="color"
            value={bg}
            onChange={(e) => updateCompositionFrame({ canvasBackgroundColor: e.target.value })}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>
      <p className={`${P.sectionLabel} mb-1`}>Bordure</p>
      <SliderRow
        label="Épaisseur"
        value={borderW}
        min={0}
        max={12}
        step={1}
        onChange={(v) => updateCompositionFrame({ frameBorderWidth: v })}
        unit="px"
      />
      <div className="flex flex-wrap gap-1.5 mt-1">
        {FRAME_COLOR_PRESETS.map((c) => (
          <ColorSwatch
            key={`b-${c}`}
            color={c}
            active={borderColor === c}
            onClick={() => updateCompositionFrame({ frameBorderColor: c })}
          />
        ))}
        <label className="relative w-5 h-5 rounded-full cursor-pointer border-2 border-dashed border-[#505050] hover:border-neutral-300 overflow-hidden flex items-center justify-center">
          <span className="text-[8px] text-neutral-400">+</span>
          <input
            type="color"
            value={borderColor}
            onChange={(e) => updateCompositionFrame({ frameBorderColor: e.target.value })}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>
    </TextPanelSection>
  );
}

// ── Section: IMAGE ───────────────────────────────────────────────────────────

type ImagePanelMode = PanelBasicAdvancedMode;

function ImageSection({
  segmentId,
  analysis,
  compositionId,
  onAnalysisUpdate,
}: {
  segmentId: string;
  analysis: VideoAnalysisResponse;
  compositionId: string | null;
  onAnalysisUpdate: (analysis: VideoAnalysisResponse) => void;
}) {
  const segment = analysis.segments?.find((s) => s.id === segmentId);
  const { insertClipAtPlayhead, currentTime, composition, format } = useCompositionStore();
  const selectedClipId = useCompositionStore((s) => s.selectedClipId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadedGallery, setUploadedGallery] = useState<GalleryImageItem[]>([]);
  const [panelMode, setPanelMode] = useState<ImagePanelMode>('basic');
  const activeImageClip = useMemo(() => {
    const bg = composition?.tracks.background ?? [];
    if (selectedClipId) {
      const sel = bg.find((c) => c.id === selectedClipId && c.type === 'image');
      if (sel) return sel;
    }
    return bg.find(
      (c) =>
        c.type === 'image' &&
        c.startTime <= currentTime &&
        c.endTime > currentTime
    );
  }, [composition, selectedClipId, currentTime]);

  const aiGeneratedUrls = segment?.generatedImages ?? [];

  const handleAddImage = useCallback(
    (url: string) => {
      void (async () => {
        const fromAi = aiGeneratedUrls.includes(url);
        const { width, height } = await probeMediaDimensions(url);
        insertClipAtPlayhead({
          id: `img-${Date.now()}`,
          trackType: 'background',
          type: 'image',
          startTime: currentTime,
          endTime: currentTime + 5,
          url,
          thumbnail: url,
          isFromAI: fromAi,
          segmentId,
          x: 50,
          y: 50,
          boxWidthPct: 100,
          mediaNaturalWidth: width,
          mediaNaturalHeight: height,
          mediaScale: 1,
          mediaOffsetX: 0,
          mediaOffsetY: 0,
          mediaRotation: 0,
        });
      })();
    },
    [insertClipAtPlayhead, currentTime, segmentId, aiGeneratedUrls]
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!compositionId) return;
      setUploading(true);
      setUploadPct(0);
      try {
        const { assetUrl } = await uploadCompositionAsset(compositionId, file, setUploadPct);
        setUploadedGallery((prev) => {
          if (prev.some((i) => i.url === assetUrl)) return prev;
          return [
            ...prev,
            {
              id: `upload-${Date.now()}`,
              url: assetUrl,
              name: file.name,
            },
          ];
        });
        if (fileRef.current) fileRef.current.value = '';
      } catch {
        // ignore
      } finally {
        setUploading(false);
      }
    },
    [compositionId]
  );

  const aiImages = useMemo(
    () =>
      aiGeneratedUrls.map((url, i) =>
        galleryItemFromUrl(url, `ai-${i}-${url}`, `image-ia-${i + 1}.png`)
      ),
    [aiGeneratedUrls]
  );

  const timelineImageUrlCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of composition?.tracks.background ?? []) {
      if (c.type === 'image' && c.url) {
        counts.set(c.url, (counts.get(c.url) ?? 0) + 1);
      }
    }
    return counts;
  }, [composition?.tracks.background]);

  const uploadedImages = useMemo(() => {
    const aiSet = new Set(aiGeneratedUrls);
    const byUrl = new Map<string, GalleryImageItem>();
    for (const item of uploadedGallery) {
      byUrl.set(item.url, item);
    }
    for (const c of composition?.tracks.background ?? []) {
      if (c.type !== 'image' || !c.url || aiSet.has(c.url)) continue;
      if (!byUrl.has(c.url)) {
        byUrl.set(
          c.url,
          galleryItemFromUrl(c.url, `clip-${c.id}`, 'image-importée.png')
        );
      }
    }
    return Array.from(byUrl.values());
  }, [uploadedGallery, composition?.tracks.background, aiGeneratedUrls]);

  const handleSegmentImagesUpdate = useCallback(
    (updated: SegmentResponse) => {
      if (!analysis.segments) return;
      onAnalysisUpdate({
        ...analysis,
        segments: analysis.segments.map((s) => (s.id === updated.id ? updated : s)),
      });
    },
    [analysis, onAnalysisUpdate]
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <BasicAdvancedModeSwitch
        mode={panelMode}
        ariaLabel="Mode d'édition image"
        onChange={setPanelMode}
      />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {panelMode === 'basic' ? (
          <>
            <div className="pt-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
              {uploading ? (
                <div className="rounded-xl bg-[#2a2b2e] px-4 py-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#1a1a1c]">
                    <div
                      className="h-full bg-cyan-400 transition-all"
                      style={{ width: `${uploadPct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2a2b2e] px-4 py-3 text-sm font-medium text-cyan-400 transition-colors hover:bg-[#33353a]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M12 13V7" />
                    <path d="m9 10 3-3 3 3" />
                    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
                  </svg>
                  Upload
                </button>
              )}
            </div>

            <ImageGalleryPanel
              aiImages={aiImages}
              uploadedImages={uploadedImages}
              timelineUrlCounts={timelineImageUrlCounts}
              onAdd={handleAddImage}
            />
          </>
        ) : (
          <div className="space-y-4 pb-2">
            <FrameCanvasPanel />
            <FilterPicker
              targetClip={activeImageClip}
              emptyHint="Sélectionnez une image sur la timeline pour appliquer un filtre."
            />
          </div>
        )}
      </div>

      {panelMode === 'basic' && (
        <div className="mt-auto shrink-0 border-t border-[#2e2e30] px-3 pb-1 pt-4">
          <ImageGeneratePromptBox
            segmentId={segmentId}
            segment={segment}
            compositionFormat={format}
            customAspectW={composition?.customAspectW}
            customAspectH={composition?.customAspectH}
            onSegmentUpdate={handleSegmentImagesUpdate}
          />
        </div>
      )}
    </div>
  );
}

// ── Filter picker (shared by Image and Video sections) ───────────────────────

function FilterPicker({
  targetClip,
  emptyHint = 'Sélectionnez un média sur la timeline pour appliquer un filtre.',
}: {
  targetClip?: Clip;
  emptyHint?: string;
}) {
  const updateClip = useCompositionStore((s) => s.updateClip);
  const locked = !targetClip;
  const current = targetClip?.filterPreset ?? 'none';

  return (
    <div className={locked ? 'opacity-45' : undefined}>
      <p className="text-[10px] text-neutral-500 mb-1.5">Filtre visuel</p>
      {locked ? (
        <p className="rounded-lg border border-dashed border-[#333] bg-[#141414] px-2 py-2 text-[10px] leading-snug text-neutral-500">
          {emptyHint}
        </p>
      ) : (
        <div className="grid grid-cols-5 gap-1">
          {MEDIA_FILTER_PRESET_IDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => updateClip(targetClip.id, { filterPreset: value })}
              className={`rounded py-1 px-0.5 text-center text-[9px] leading-tight transition-colors border ${
                current === value
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-semibold'
                  : 'border-[#333333] bg-[#252525] text-neutral-400 hover:border-[#505050] hover:text-neutral-200'
              }`}
            >
              {MEDIA_FILTER_UI_LABELS[value]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section: VIDEO ───────────────────────────────────────────────────────────

function VideoSection({
  segmentId,
  analysis,
  compositionId,
  onAnalysisUpdate,
}: {
  segmentId: string;
  analysis: VideoAnalysisResponse;
  compositionId: string | null;
  onAnalysisUpdate: (a: VideoAnalysisResponse) => void;
}) {
  const segment = analysis.segments?.find((s) => s.id === segmentId);
  const { insertClipAtPlayhead, currentTime, composition } = useCompositionStore();
  const selectedClipId = useCompositionStore((s) => s.selectedClipId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const activeVideoClip = useMemo(() => {
    const bg = composition?.tracks.background ?? [];
    if (selectedClipId) {
      const sel = bg.find((c) => c.id === selectedClipId && c.type === 'video');
      if (sel) return sel;
    }
    return bg.find(
      (c) =>
        c.type === 'video' &&
        c.startTime <= currentTime &&
        c.endTime > currentTime
    );
  }, [composition, selectedClipId, currentTime]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      await generateSegmentVideo(segmentId, { durationSeconds: 6 });
      // Poll
      for (let i = 0; i < 80; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const updated = await getAnalysis(analysis.id);
        const seg = updated.segments?.find((s) => s.id === segmentId);
        if (seg?.generatedVideoUrl) {
          onAnalysisUpdate(updated);
          insertClipAtPlayhead({
            id: `vid-ai-${Date.now()}`,
            trackType: 'background',
            type: 'video',
            startTime: currentTime,
            endTime: currentTime + (seg.videoDurationSeconds ?? 6),
            url: seg.generatedVideoUrl,
            segmentId,
            isFromAI: true,
            x: 50,
            y: 50,
            boxWidthPct: 100,
            mediaScale: 1,
            mediaOffsetX: 0,
            mediaOffsetY: 0,
            mediaRotation: 0,
          });
          window.dispatchEvent(new Event('credits-updated'));
          return;
        }
        if (seg?.videoGenerationError) {
          throw new Error(seg.videoGenerationError);
        }
      }
      throw new Error('Délai dépassé');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Échec de la génération.'));
    } finally {
      setGenerating(false);
    }
  }, [segmentId, analysis.id, currentTime, insertClipAtPlayhead, onAnalysisUpdate]);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!compositionId) return;
      setUploading(true);
      try {
        const { assetUrl } = await uploadCompositionAsset(compositionId, file, setUploadPct);
        insertClipAtPlayhead({
          id: `vid-upload-${Date.now()}`,
          trackType: 'background',
          type: 'video',
          startTime: currentTime,
          endTime: currentTime + 10,
          url: assetUrl,
          trimStart: 0,
          segmentId,
          x: 50,
          y: 50,
          boxWidthPct: 100,
          mediaScale: 1,
          mediaOffsetX: 0,
          mediaOffsetY: 0,
          mediaRotation: 0,
        });
      } catch {
        // ignore
      } finally {
        setUploading(false);
      }
    },
    [compositionId, insertClipAtPlayhead, currentTime, segmentId]
  );

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Vidéo</p>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {segment?.generatedVideoUrl ? (
        <div>
          <p className="text-[10px] text-neutral-500 mb-1">Fond vidéo IA</p>
          <video
            src={segment.generatedVideoUrl}
            muted
            loop
            autoPlay
            playsInline
            className="w-full rounded border border-[#3a3a3a]"
            style={{ maxHeight: 100 }}
          >
            <track kind="captions" />
          </video>
          <button
            type="button"
            onClick={() =>
              insertClipAtPlayhead({
                id: `vid-ai-${Date.now()}`,
                trackType: 'background',
                type: 'video',
                startTime: currentTime,
                endTime: currentTime + (segment.videoDurationSeconds ?? 6),
                url: segment.generatedVideoUrl!,
                segmentId,
                isFromAI: true,
                x: 50,
                y: 50,
                boxWidthPct: 100,
                mediaScale: 1,
                mediaOffsetX: 0,
                mediaOffsetY: 0,
                mediaRotation: 0,
              })
            }
            className="mt-1 w-full rounded-lg bg-[#2b2b2b] px-2 py-1 text-xs font-semibold text-white hover:bg-[#404040]"
          >
            + Ajouter à la timeline
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating}
          className="w-full rounded-lg bg-gradient-to-r from-teal-700 to-teal-600 py-2 text-xs font-semibold text-white hover:from-teal-600 hover:to-teal-500 disabled:opacity-60"
        >
          {generating ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Génération…
            </span>
          ) : (
            `🎬 Générer fond vidéo (-${CREDITS_GENERATE_VIDEO} crédits)`
          )}
        </button>
      )}

      <div>
        <p className="text-[10px] text-neutral-500 mb-1">Votre vidéo (mp4/mov/webm)</p>
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f); }}
        />
        {uploading ? (
          <div className="rounded bg-[#2b2b2b] h-2 overflow-hidden">
            <div className="h-full bg-teal-500 transition-all" style={{ width: `${uploadPct}%` }} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-lg border border-dashed border-[#3a3a3a] py-2 text-xs text-neutral-400 hover:border-neutral-400 hover:text-neutral-200 transition-colors"
          >
            📎 Choisir une vidéo
          </button>
        )}
      </div>

      <FilterPicker
        targetClip={activeVideoClip}
        emptyHint="Sélectionnez une vidéo sur la timeline pour appliquer un filtre."
      />

      {activeVideoClip && (
        <TransformerSection clip={activeVideoClip} format={composition?.format ?? '9:16'} />
      )}
    </div>
  );
}

// ── Overlay (OV) — stickers, effets CapCut, sous-titres courts ───────────────

const STICKER_PRESETS = [
  '🔥', '⭐', '💯', '🎯', '✨', '👑', '🚀', '💪', '❤️', '🎬',
  '📌', '⚡', '🏆', '💎', '🎵', '👀', '🙌', '💥', '🌟', '✅',
];

const SHORT_SUBTITLE_PRESETS = [
  'POV :',
  'Wait for it…',
  'No cap',
  'Link in bio',
  'Follow 👆',
  'Swipe →',
  'Part 1',
  'Before / After',
  'Results only',
  'They deliver.',
];

const DEFAULT_CAPCUT_EFFECTS = [
  'Monochrome',
  'VHS noise',
  'Auto beat sync',
  'Glitch',
  'Flash cut',
  'Zoom pulse',
  'Film grain',
  'RGB split',
];

/** Durée par défaut des overlays (stickers / icônes) — bloc très court sur la timeline. */
const OVERLAY_DEFAULT_DURATION_SEC = 0.4;

function addOverlayToTimeline(opts: {
  content: string;
  segmentId: string;
  startTime: number;
  endTime?: number;
  x?: number;
  y?: number;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: 'normal' | 'bold';
  backgroundColor?: string;
  backgroundOpacity?: number;
  sequenceLabel?: string;
}) {
  const { insertClipAtPlayhead } = useCompositionStore.getState();
  const id = `ov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const endTime =
    opts.endTime ?? opts.startTime + OVERLAY_DEFAULT_DURATION_SEC;
  insertClipAtPlayhead({
    id,
    trackType: 'overlay',
    type: 'sticker',
    startTime: opts.startTime,
    endTime,
    content: opts.content,
    segmentId: opts.segmentId,
    x: opts.x ?? 50,
    y: opts.y ?? 50,
    boxWidthPct: defaultOverlayBoxWidthPct(opts.content),
    fontSize: opts.fontSize ?? 40,
    fontColor: opts.fontColor,
    fontWeight: opts.fontWeight,
    backgroundColor: opts.backgroundColor,
    backgroundOpacity: opts.backgroundOpacity,
    opacity: 1,
    sequenceLabel: opts.sequenceLabel,
  });
}

function OverlaySection({
  segmentId,
  capCutEffects,
}: {
  segmentId: string;
  capCutEffects?: string[] | null;
}) {
  const { composition, currentTime } = useCompositionStore();

  const overlayOnSegment = (composition?.tracks.overlay ?? []).filter(
    (c) => c.segmentId === segmentId
  );

  const allEffects = [...(capCutEffects ?? []), ...DEFAULT_CAPCUT_EFFECTS];
  const effects = allEffects.filter((fx, i) => allEffects.indexOf(fx) === i);

  const place = (
    content: string,
    extra?: Partial<Parameters<typeof addOverlayToTimeline>[0]>
  ) => {
    addOverlayToTimeline({
      content,
      segmentId,
      startTime: currentTime,
      ...extra,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-700/40 bg-amber-900/20 p-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
          Piste OV (Overlay)
        </p>
        <p className="text-[11px] text-neutral-400 leading-snug">
          Éléments au-dessus du fond : stickers, effets CapCut, sous-titres courts.
          Ajoutés au curseur (playhead) ; déplacez-les sur la piste{' '}
          <span className="text-amber-400 font-bold">OV</span> dans la timeline.
        </p>
      </div>

      {/* Stickers */}
      <div className="rounded-lg border border-[#333333] bg-[#252525]/50 p-2 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Stickers</p>
        <div className="grid grid-cols-5 gap-1.5">
          {STICKER_PRESETS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              title={`Ajouter ${emoji}`}
              onClick={() =>
                place(emoji, {
                  fontSize: 48,
                  x: 75 + Math.random() * 15,
                  y: 10 + Math.random() * 20,
                  sequenceLabel: 'Sticker',
                })
              }
              className="rounded-lg bg-[#2b2b2b]/80 py-2 text-xl hover:bg-amber-700/40 hover:ring-1 hover:ring-amber-500 transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Effets CapCut */}
      <div className="rounded-lg border border-[#333333] bg-[#252525]/50 p-2 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Effets CapCut
        </p>
        <p className="text-[10px] text-neutral-500">
          {capCutEffects?.length
            ? 'Effets suggérés par l’analyse + bibliothèque.'
            : 'Bibliothèque d’effets (analyse sans effets listés).'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {effects.map((fx) => (
            <button
              key={fx}
              type="button"
              onClick={() =>
                place(fx, {
                  fontSize: 12,
                  fontColor: '#fbbf24',
                  fontWeight: 'bold',
                  backgroundColor: '#000000',
                  backgroundOpacity: 0.7,
                  x: 50,
                  y: 8,
                  sequenceLabel: 'Effet',
                })
              }
              className="rounded-full bg-amber-700/50 px-2.5 py-1 text-[10px] font-semibold text-amber-100 hover:bg-amber-600/70 transition-colors"
            >
              {fx}
            </button>
          ))}
        </div>
      </div>

      {/* Sous-titres courts */}
      <div className="rounded-lg border border-[#333333] bg-[#252525]/50 p-2 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Sous-titres courts
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SHORT_SUBTITLE_PRESETS.map((line) => (
            <button
              key={line}
              type="button"
              onClick={() =>
                place(line, {
                  fontSize: 18,
                  fontColor: '#ffffff',
                  fontWeight: 'bold',
                  backgroundColor: '#000000',
                  backgroundOpacity: 0.55,
                  x: 50,
                  y: 88,
                  sequenceLabel: 'Sous-titre',
                })
              }
              className="rounded-md bg-[#2b2b2b] px-2 py-1 text-[10px] text-neutral-200 hover:bg-[#404040] hover:text-white transition-colors"
            >
              {line}
            </button>
          ))}
        </div>
      </div>

      {/* Exemple rapide */}
      <button
        type="button"
        onClick={() => {
          addOverlayToTimeline({
            content: '✨ Exemple OV',
            segmentId,
            startTime: currentTime,
            endTime: currentTime + 3,
            x: 50,
            y: 20,
            fontSize: 22,
            fontColor: '#fbbf24',
            fontWeight: 'bold',
            backgroundColor: '#1a1a1a',
            backgroundOpacity: 0.8,
            sequenceLabel: 'Démo',
          });
        }}
        className="w-full rounded-lg border border-dashed border-amber-600/60 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/30 transition-colors"
      >
        + Ajouter un exemple sur OV1 (3 s)
      </button>

      {/* Clips overlay actifs sur cette séquence */}
      {overlayOnSegment.length > 0 && (
        <div className="rounded-lg border border-[#333333] bg-[#252525]/50 p-2 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Sur cette séquence ({overlayOnSegment.length})
          </p>
          {overlayOnSegment.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 rounded bg-[#2b2b2b]/60 px-2 py-1 text-[10px] text-neutral-300"
            >
              <span className="truncate">{c.content ?? c.sequenceLabel ?? 'Overlay'}</span>
              <button
                type="button"
                onClick={() => useCompositionStore.getState().removeClip(c.id)}
                className="shrink-0 text-red-400 hover:text-red-300"
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── RightPanel ────────────────────────────────────────────────────────────────

interface RightPanelProps {
  analysis: VideoAnalysisResponse;
  compositionId: string | null;
  onAnalysisUpdate: (a: VideoAnalysisResponse) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SECTION_TABS = ['TEXTE', 'AUDIO', 'IMAGE', 'VIDÉO', 'OV', 'TRANS'] as const;
type SectionTab = typeof SECTION_TABS[number];

export function RightPanel({
  analysis,
  compositionId,
  onAnalysisUpdate,
  isOpen = true,
  onToggle,
}: RightPanelProps) {
  const { activeSequence, setActiveSequence, composition, setCurrentTime } =
    useCompositionStore();
  const editorRequestedPanelTab = useCompositionStore((s) => s.editorRequestedPanelTab);
  const consumeEditorPanelTabRequest = useCompositionStore((s) => s.consumeEditorPanelTabRequest);
  const [tab, setTab] = useState<SectionTab>('TEXTE');

  useEffect(() => {
    if (
      editorRequestedPanelTab &&
      SECTION_TABS.includes(editorRequestedPanelTab as SectionTab)
    ) {
      setTab(editorRequestedPanelTab as SectionTab);
      consumeEditorPanelTabRequest();
    }
  }, [editorRequestedPanelTab, consumeEditorPanelTabRequest]);

  // ── Collapsed mode: thin strip with toggle button ───────────────────────────
  if (!isOpen) {
    return (
      <div className={P.collapsed}>
        <button
          type="button"
          onClick={onToggle}
          title="Ouvrir le panneau"
          className={P.collapseBtn}
        >
          ◀
        </button>
        <div className="flex flex-col items-center gap-2 text-[10px] text-neutral-500 tracking-wider [writing-mode:vertical-rl] rotate-180 mt-2">
          <span>OUTILS</span>
        </div>
      </div>
    );
  }

  const segments = (analysis.segments ?? []).slice().sort((a, b) => a.seqNumber - b.seqNumber);
  const segCount = segments.length;
  const activeSegment = segments[activeSequence];

  const handlePrev = () => {
    const next = Math.max(0, activeSequence - 1);
    setActiveSequence(next);
    const clip = composition?.tracks.background.find(
      (c) => c.segmentId === segments[next]?.id
    );
    if (clip) setCurrentTime(clip.startTime);
  };

  const handleNext = () => {
    const next = Math.min(segCount - 1, activeSequence + 1);
    setActiveSequence(next);
    const clip = composition?.tracks.background.find(
      (c) => c.segmentId === segments[next]?.id
    );
    if (clip) setCurrentTime(clip.startTime);
  };

  if (!activeSegment) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
        Aucune séquence
      </div>
    );
  }

  return (
    <div className={P.shell}>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          title="Réduire le panneau"
          className={P.floatCollapse}
        >
          ▶
        </button>
      )}

      <div className={P.seqNav}>
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeSequence === 0}
          className={P.navBtn}
        >
          ‹
        </button>
        <span className="text-xs font-semibold text-white tracking-wide">
          Séquence {activeSequence + 1} / {segCount}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={activeSequence >= segCount - 1}
          className={P.navBtn}
        >
          ›
        </button>
      </div>

      <div className={P.tabs}>
        {SECTION_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={tab === t ? P.tabActive : P.tabInactive}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        className={
          tab === 'IMAGE'
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden bg-black px-3 pb-3'
            : P.scroll
        }
      >
        {tab === 'TEXTE' && (
          <TextSection segmentId={activeSegment.id} />
        )}
        {tab === 'AUDIO' && (
          <AudioSection
            segmentId={activeSegment.id}
            analysis={analysis}
            compositionId={compositionId}
          />
        )}
        {tab === 'IMAGE' && (
          <ImageSection
            segmentId={activeSegment.id}
            analysis={analysis}
            compositionId={compositionId}
            onAnalysisUpdate={onAnalysisUpdate}
          />
        )}
        {tab === 'VIDÉO' && (
          <VideoSection
            segmentId={activeSegment.id}
            analysis={analysis}
            compositionId={compositionId}
            onAnalysisUpdate={onAnalysisUpdate}
          />
        )}
        {tab === 'OV' && (
          <OverlaySection
            segmentId={activeSegment.id}
            capCutEffects={activeSegment.capCutEffects}
          />
        )}
        {tab === 'TRANS' && (
          <TransitionSection />
        )}
      </div>
    </div>
  );
}
