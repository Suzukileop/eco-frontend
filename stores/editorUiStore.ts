import { create } from 'zustand';
import type { KonvaLiveClipLayout } from '@/lib/studio/konva/clipLayout';

/** Zoom de l’aperçu (1 = 100 %, affecte le cadre et tout son contenu). */
export const PREVIEW_ZOOM_MIN = 0.25;
export const PREVIEW_ZOOM_MAX = 3;
export const PREVIEW_ZOOM_STEP = 0.05;

export type PreviewTool = 'select' | 'hand';

export interface PreviewCanvasSize {
  width: number;
  height: number;
}

interface EditorUiState {
  focusMode: boolean;
  /** Plein écran navigateur (double-clic focus) — masque onglets / barre d’adresse. */
  deepFocusMode: boolean;
  /** Plein écran aperçu (lecture) — fond noir, comme CapCut. */
  previewFullscreen: boolean;
  /** Zoom du cadre d’aperçu (1 = taille « fit » calculée). */
  previewZoom: number;
  /** Outil aperçu : sélection ou main (panoramique). */
  previewTool: PreviewTool;
  /** Dimensions logiques du cadre format (px, avant zoom d’affichage). */
  previewCanvasSize: PreviewCanvasSize;
  setFocusMode: (value: boolean) => void;
  setDeepFocusMode: (value: boolean) => void;
  setPreviewFullscreen: (value: boolean) => void;
  togglePreviewFullscreen: () => void;
  setPreviewZoom: (value: number) => void;
  setPreviewTool: (tool: PreviewTool) => void;
  setPreviewCanvasSize: (size: PreviewCanvasSize) => void;
  togglePreviewTool: () => void;
  toggleFocusMode: () => void;

  konvaSelectedIds: string[];
  setKonvaSelectedIds: (ids: string[]) => void;
  toggleKonvaClipSelection: (clipId: string, additive: boolean) => void;

  /** Zone texte qui a le focus clavier (caret), pas un mode d’affichage. */
  konvaFocusedTextClipId: string | null;
  setKonvaFocusedTextClipId: (clipId: string | null) => void;
  /** Premier caractère saisi au clavier sur une zone texte sélectionnée. */
  konvaEditSeedChar: string | null;
  setKonvaEditSeedChar: (ch: string | null) => void;

  konvaSnapGuides: { vertical: number[]; horizontal: number[] };
  setKonvaSnapGuides: (guides: { vertical: number[]; horizontal: number[] }) => void;
  clearKonvaSnapGuides: () => void;

  /** Layout transient pendant drag / transform Konva (sync overlay HTML). */
  konvaLiveLayouts: Record<string, KonvaLiveClipLayout>;
  setKonvaLiveLayout: (clipId: string, layout: KonvaLiveClipLayout | null) => void;
  clearKonvaLiveLayouts: () => void;
}

function clampPreviewZoom(z: number): number {
  return Math.min(PREVIEW_ZOOM_MAX, Math.max(PREVIEW_ZOOM_MIN, z));
}

export const useEditorUiStore = create<EditorUiState>((set, get) => ({
  focusMode: false,
  deepFocusMode: false,
  previewFullscreen: false,
  previewZoom: 1,
  previewTool: 'select',
  previewCanvasSize: { width: 0, height: 0 },
  setFocusMode: (value) => set({ focusMode: value }),
  setDeepFocusMode: (value) => set({ deepFocusMode: value }),
  setPreviewFullscreen: (value) => set({ previewFullscreen: value }),
  togglePreviewFullscreen: () =>
    set((s) => ({ previewFullscreen: !s.previewFullscreen })),
  setPreviewZoom: (value) => set({ previewZoom: clampPreviewZoom(value) }),
  setPreviewTool: (tool) => set({ previewTool: tool }),
  setPreviewCanvasSize: (size) => set({ previewCanvasSize: size }),
  togglePreviewTool: () =>
    set((s) => ({ previewTool: s.previewTool === 'hand' ? 'select' : 'hand' })),
  toggleFocusMode: () => {
    const { focusMode, deepFocusMode } = get();
    if (deepFocusMode || document.fullscreenElement) {
      void exitBrowserFullscreen();
      set({ focusMode: false, deepFocusMode: false });
      return;
    }
    set({ focusMode: !focusMode });
  },

  konvaSelectedIds: [],
  setKonvaSelectedIds: (ids) => set({ konvaSelectedIds: ids }),
  toggleKonvaClipSelection: (clipId, additive) =>
    set((s) => {
      if (!additive) return { konvaSelectedIds: [clipId] };
      const has = s.konvaSelectedIds.includes(clipId);
      if (has) {
        const next = s.konvaSelectedIds.filter((id) => id !== clipId);
        return { konvaSelectedIds: next.length > 0 ? next : [clipId] };
      }
      return { konvaSelectedIds: [...s.konvaSelectedIds, clipId] };
    }),

  konvaFocusedTextClipId: null,
  setKonvaFocusedTextClipId: (clipId) =>
    set({ konvaFocusedTextClipId: clipId, ...(clipId == null ? { konvaEditSeedChar: null } : {}) }),
  konvaEditSeedChar: null,
  setKonvaEditSeedChar: (ch) => set({ konvaEditSeedChar: ch }),

  konvaSnapGuides: { vertical: [], horizontal: [] },
  setKonvaSnapGuides: (guides) => set({ konvaSnapGuides: guides }),
  clearKonvaSnapGuides: () => set({ konvaSnapGuides: { vertical: [], horizontal: [] } }),

  konvaLiveLayouts: {},
  setKonvaLiveLayout: (clipId, layout) =>
    set((s) => {
      if (!layout) {
        const { [clipId]: _removed, ...rest } = s.konvaLiveLayouts;
        return { konvaLiveLayouts: rest };
      }
      return { konvaLiveLayouts: { ...s.konvaLiveLayouts, [clipId]: layout } };
    }),
  clearKonvaLiveLayouts: () => set({ konvaLiveLayouts: {} }),
}));

export async function enterBrowserFullscreen(): Promise<void> {
  const el = document.documentElement;
  if (!document.fullscreenElement && el.requestFullscreen) {
    await el.requestFullscreen();
  }
}

export async function exitBrowserFullscreen(): Promise<void> {
  if (document.fullscreenElement && document.exitFullscreen) {
    await document.exitFullscreen();
  }
}

export function isEditorPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return /\/dashboard\/templates\/[^/]+\/(editor|studio)$/.test(pathname);
}
