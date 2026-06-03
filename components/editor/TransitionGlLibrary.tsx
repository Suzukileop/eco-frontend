'use client';

import { useMemo, useRef, useState } from 'react';
import {
  GL_TRANSITION_CUT,
  formatGlTransitionLabel,
  getAllGlTransitions,
  getCustomGlTransitions,
} from '@/lib/glTransitions';
import {
  GL_TRANSITION_CATEGORIES,
  buildCategoryCounts,
  filterTransitionsByCategory,
  type GlTransitionCategoryId,
} from '@/lib/glTransitionCategories';
import { TransitionGlThumbnail } from '@/components/editor/TransitionGlThumbnail';

export function TransitionGlLibrary({
  selectedName,
  disabled,
  onSelectName,
  previewFromUrl,
  previewToUrl,
}: {
  selectedName: string;
  disabled?: boolean;
  onSelectName: (glName: string) => void;
  /** Miniatures avec les médias du raccord si disponibles. */
  previewFromUrl?: string;
  previewToUrl?: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GlTransitionCategoryId>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const all = useMemo(() => getAllGlTransitions(), []);
  const customOnly = useMemo(() => getCustomGlTransitions(), []);
  const counts = useMemo(() => buildCategoryCounts(all), [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = filterTransitionsByCategory(all, category);
    if (q) {
      list = list.filter((t) => {
        const label = formatGlTransitionLabel(t.name);
        return (
          t.name.toLowerCase().includes(q) || label.toLowerCase().includes(q)
        );
      });
    }
    return list.map((t) => ({
      name: t.name,
      label: formatGlTransitionLabel(t.name),
    }));
  }, [all, category, query]);

  const useJunctionMedia = Boolean(previewFromUrl && previewToUrl);

  return (
    <div className="space-y-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une transition…"
        disabled={disabled}
        className="w-full rounded-md border border-[#404040] bg-[#252525] px-2 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-600 disabled:opacity-40"
      />

      <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
        {GL_TRANSITION_CATEGORIES.map((cat) => {
          const count = counts[cat.id];
          if (cat.id !== 'all' && count === 0) return null;
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setCategory(cat.id);
                scrollRef.current?.scrollTo({ top: 0 });
              }}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                active
                  ? 'bg-cyan-500/25 text-cyan-200 ring-1 ring-cyan-400/50'
                  : 'bg-[#2a2a2a] text-neutral-400 hover:bg-[#353535] hover:text-neutral-200'
              } disabled:opacity-35`}
            >
              {cat.label}
              <span className="ml-1 tabular-nums text-neutral-500">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={scrollRef}
        className="max-h-[300px] overflow-y-auto rounded-md border border-[#333333]/80 bg-[#1a1a1a]/60 p-1.5 [scrollbar-width:thin]"
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectName(GL_TRANSITION_CUT)}
          className={`mb-2 flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors ${
            selectedName === GL_TRANSITION_CUT
              ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200'
              : 'border-[#333333] text-neutral-300 hover:bg-[#2a2a2a]'
          } disabled:opacity-35`}
        >
          <span
            className="flex h-9 w-14 shrink-0 items-center justify-center rounded bg-[#252525] text-[9px] text-neutral-500"
            aria-hidden
          >
            CUT
          </span>
          <span className="text-[11px]">Coupe sèche</span>
        </button>

        {customOnly.length > 0 && category !== 'custom' && !query.trim() && (
          <div className="mb-2 space-y-1">
            <p className="px-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-400/90">
              Sur mesure (test)
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {customOnly.map((t) => (
                <TransitionGlThumbnail
                  key={t.name}
                  glName={t.name}
                  label={formatGlTransitionLabel(t.name)}
                  fromUrl={useJunctionMedia ? previewFromUrl : undefined}
                  toUrl={useJunctionMedia ? previewToUrl : undefined}
                  selected={selectedName === t.name}
                  disabled={disabled}
                  onSelect={() => onSelectName(t.name)}
                />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-[10px] text-neutral-600">Aucun résultat</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {filtered.map((t) => (
              <TransitionGlThumbnail
                key={t.name}
                glName={t.name}
                label={t.label}
                fromUrl={useJunctionMedia ? previewFromUrl : undefined}
                toUrl={useJunctionMedia ? previewToUrl : undefined}
                selected={selectedName === t.name}
                disabled={disabled}
                onSelect={() => onSelectName(t.name)}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-[9px] text-neutral-600">
        {all.length} transitions WebGL
        {useJunctionMedia ? ' · miniatures du raccord' : ' · miniatures démo'}
        {filtered.length < all.length && category !== 'all' && (
          <span> · {filtered.length} affichée{filtered.length > 1 ? 's' : ''}</span>
        )}
      </p>
    </div>
  );
}
