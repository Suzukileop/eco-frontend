'use client';

import { useEffect, useId, useRef, useState } from 'react';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { normalizeSpringPage } from '@/lib/ecosystem';
import type { SpringPageRaw } from '@/types/ecosystem';
import type { TaggedUserRef } from '@/types/creator-content';
import { CONTENT_MOODS, type ContentMood } from '@/components/creator/creator-content-enrichments';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type CreatorContentComposeToolsProps = {
  locale?: 'fr' | 'en';
  moodLabel: string | null;
  moodEmoji: string | null;
  taggedUsers: TaggedUserRef[];
  onMoodChange: (mood: ContentMood | null) => void;
  onTaggedUsersChange: (users: TaggedUserRef[]) => void;
  onMediaPick: () => void;
  mediaUploading?: boolean;
  hasMedia?: boolean;
};

type Panel = 'mood' | 'tag' | null;

function ToolChip({
  label,
  onClick,
  active,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
        active
          ? 'border-orange-300/80 bg-orange-50 text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300'
          : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
      }`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export function CreatorContentComposeTools({
  locale = 'en',
  moodLabel,
  moodEmoji,
  taggedUsers,
  onMoodChange,
  onTaggedUsersChange,
  onMediaPick,
  mediaUploading,
  hasMedia,
}: CreatorContentComposeToolsProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [tagQuery, setTagQuery] = useState('');
  const [tagResults, setTagResults] = useState<TaggedUserRef[]>([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  const copy =
    locale === 'fr'
      ? {
          media: hasMedia ? 'Remplacer le média' : 'Ajouter un média',
          tag: 'Collaborateurs',
          mood: 'Ambiance',
          searchUsers: 'Rechercher…',
          noUsers: 'Aucun utilisateur.',
          removeMood: 'Retirer',
        }
      : {
          media: hasMedia ? 'Replace media' : 'Add media',
          tag: 'Collaborators',
          mood: 'Mood',
          searchUsers: 'Search…',
          noUsers: 'No users found.',
          removeMood: 'Remove',
        };

  useEffect(() => {
    if (panel !== 'tag') return;
    const q = tagQuery.trim();
    if (q.length < 2) {
      setTagResults([]);
      setTagError(null);
      return;
    }
    const timer = window.setTimeout(() => {
      void (async () => {
        setTagLoading(true);
        setTagError(null);
        try {
          const res = await api.get<SpringPageRaw<Record<string, unknown>>>(
            '/api/creator/content/users/search',
            { params: { q, page: 0, size: 8 } }
          );
          const page = normalizeSpringPage(res.data);
          const users = page.content.map((row) => ({
            id: String(row.id ?? ''),
            fullName: String(row.fullName ?? 'User'),
            avatarUrl: row.avatarUrl != null ? String(row.avatarUrl) : null,
          }));
          setTagResults(users.filter((u) => !taggedUsers.some((t) => t.id === u.id)));
        } catch (e) {
          setTagError(getApiErrorMessage(e, 'Search failed.'));
          setTagResults([]);
        } finally {
          setTagLoading(false);
        }
      })();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [panel, tagQuery, taggedUsers]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPanel(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const toggle = (next: Panel) => setPanel((p) => (p === next ? null : next));

  const addTaggedUser = (user: TaggedUserRef) => {
    if (taggedUsers.length >= 5) return;
    if (taggedUsers.some((u) => u.id === user.id)) return;
    onTaggedUsersChange([...taggedUsers, user]);
    setTagQuery('');
    setTagResults([]);
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <ToolChip label={copy.media} onClick={onMediaPick} active={hasMedia} disabled={mediaUploading}>
          {mediaUploading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </ToolChip>

        <ToolChip
          label={copy.tag}
          onClick={() => toggle('tag')}
          active={panel === 'tag' || taggedUsers.length > 0}
        >
          <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </ToolChip>

        <ToolChip label={copy.mood} onClick={() => toggle('mood')} active={panel === 'mood' || Boolean(moodLabel)}>
          <span className="text-base leading-none" aria-hidden>
            {moodEmoji ?? '✦'}
          </span>
        </ToolChip>
      </div>

      {panel && (
        <div
          id={panelId}
          className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
        >
          {panel === 'mood' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {CONTENT_MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => {
                      onMoodChange(mood);
                      setPanel(null);
                    }}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      moodLabel === mood.label ? 'bg-orange-50 dark:bg-orange-500/10' : ''
                    }`}
                  >
                    <span aria-hidden>{mood.emoji}</span>
                    <span className="capitalize">{mood.label}</span>
                  </button>
                ))}
              </div>
              {moodLabel && (
                <button
                  type="button"
                  onClick={() => {
                    onMoodChange(null);
                    setPanel(null);
                  }}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  {copy.removeMood}
                </button>
              )}
            </div>
          )}

          {panel === 'tag' && (
            <div className="space-y-2">
              <input
                type="search"
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder={copy.searchUsers}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
              {taggedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {taggedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-800 dark:bg-violet-500/10 dark:text-violet-300"
                    >
                      {user.fullName}
                      <button
                        type="button"
                        onClick={() => onTaggedUsersChange(taggedUsers.filter((u) => u.id !== user.id))}
                        className="text-violet-600 hover:text-violet-800"
                        aria-label={`Remove ${user.fullName}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {tagLoading && (
                <div className="flex justify-center py-2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              {tagError && <p className="text-xs text-red-600">{tagError}</p>}
              {!tagLoading && tagQuery.trim().length >= 2 && tagResults.length === 0 && !tagError && (
                <p className="text-xs text-neutral-500">{copy.noUsers}</p>
              )}
              <ul className="max-h-40 space-y-1 overflow-y-auto">
                {tagResults.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => addTaggedUser(user)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold dark:bg-neutral-700">
                          {user.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{user.fullName}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
