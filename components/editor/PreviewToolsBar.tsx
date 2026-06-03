'use client';

import type { PreviewTool } from '@/stores/editorUiStore';
import { useEditorUiStore } from '@/stores/editorUiStore';

function IconCursor() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5.5 3.21l12.28 9.54-5.08.72L8.4 20.79 5.5 3.21z" />
    </svg>
  );
}

function IconHand() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V8a2 2 0 114 0v1M11 10V7a2 2 0 114 0v2M15 9V7a2 2 0 114 0v5M7 11v5a5 5 0 0010 0v-2" />
    </svg>
  );
}

const TOOLS: { id: PreviewTool; label: string; icon: React.ReactNode }[] = [
  { id: 'select', label: 'Sélection', icon: <IconCursor /> },
  { id: 'hand', label: 'Main (déplacer la vue)', icon: <IconHand /> },
];

export function PreviewToolsBar() {
  const previewTool = useEditorUiStore((s) => s.previewTool);
  const setPreviewTool = useEditorUiStore((s) => s.setPreviewTool);

  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-neutral-200 bg-white p-0.5"
      role="toolbar"
      aria-label="Outils aperçu"
    >
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          title={`${t.label}${t.id === 'hand' ? ' (Ctrl+H)' : ''}`}
          aria-label={t.label}
          aria-pressed={previewTool === t.id}
          onClick={() => setPreviewTool(t.id)}
          className={`flex h-7 w-8 items-center justify-center rounded transition-colors ${
            previewTool === t.id
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
