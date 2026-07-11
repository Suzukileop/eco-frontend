'use client';

import type { AudioSuggestion } from '@/types/templates';

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2l1.09 3.36L16.45 6.5 13.09 7.64 12 11l-1.09-3.36L7.55 6.5l3.36-1.14L12 2Zm7 7 1.09 3.36L23.45 13.5l-3.36 1.14L19 18l-1.09-3.36L14.55 13.5l3.36-1.14L19 9ZM5 9l1.09 3.36L9.45 13.5 6.09 14.64 5 18l-1.09-3.36L.55 13.5l3.36-1.14L5 9Z" />
    </svg>
  );
}

/** Suggestions IA — pastilles simples (liens externes), sans preview play/pause. */
export function AudioSuggestionsPanel({
  suggestions,
  onAdd,
}: {
  suggestions: AudioSuggestion[];
  onAdd: (url: string, title: string) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-1 opacity-55">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        <SparkleIcon className="h-3 w-3 text-emerald-500/80" />
        Suggestions IA
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={`${s.title}-${s.source}-${i}`}
            type="button"
            disabled={!s.url}
            onClick={() => {
              if (s.url) onAdd(s.url, s.title);
            }}
            title={s.url ? `Ajouter « ${s.title} » à la timeline` : 'URL indisponible'}
            className="rounded-full border border-[#3a3a3a] bg-[#1a1a1c] px-3 py-1.5 text-[11px] text-neutral-400 transition-colors hover:border-neutral-500 hover:bg-[#252528] hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}
