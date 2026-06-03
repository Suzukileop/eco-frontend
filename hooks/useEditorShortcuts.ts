'use client';

import { useEffect } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { PREVIEW_ZOOM_STEP, useEditorUiStore } from '@/stores/editorUiStore';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

export function useEditorShortcuts() {
  const selectedClipId = useCompositionStore((s) => s.selectedClipId);
  const removeClip = useCompositionStore((s) => s.removeClip);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        useEditorUiStore.getState().togglePreviewTool();
        return;
      }

      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedClipId &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        removeClip(selectedClipId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedClipId, removeClip]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (!e.target || !(e.target instanceof Element)) return;

      const inPreview = e.target.closest('[data-editor-preview-zone]');
      const inTimeline = e.target.closest('[data-editor-timeline-zone]');
      if (!inPreview && !inTimeline) return;

      e.preventDefault();

      if (inPreview) {
        const { previewZoom, setPreviewZoom } = useEditorUiStore.getState();
        const direction = e.deltaY < 0 ? 1 : -1;
        const step = e.shiftKey ? PREVIEW_ZOOM_STEP * 2 : PREVIEW_ZOOM_STEP;
        setPreviewZoom(previewZoom + direction * step);
        return;
      }

      const { zoom, setZoom } = useCompositionStore.getState();
      const direction = e.deltaY < 0 ? 1 : -1;
      const factor = 1 + direction * 0.15;
      setZoom(Math.min(10, Math.max(0.3, zoom * factor)));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);
}
