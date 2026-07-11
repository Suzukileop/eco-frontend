'use client';

import { useEffect, useState } from 'react';
import { ContentVisibilityToggle } from '@/components/creator/ContentVisibilityToggle';
import { ContentCommentsToggle } from '@/components/creator/ContentCommentsToggle';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import { ContentPostSidePanel } from '@/components/creator/ContentPostSidePanel';
import { ContentPostSocialBar } from '@/components/creator/ContentPostSocialBar';
import { ContentPostStudioHeader } from '@/components/creator/ContentPostStudioHeader';
import { ContentPostOverflowMenu } from '@/components/creator/studio/ContentPostOverflowMenu';
import {
  archiveContent,
  moveContentToTrash,
  permanentDeleteContent,
  pinContent,
  restoreContent,
  unarchiveContent,
  unpinContent,
  updateContentCommentsEnabled,
  updateContentVisibility,
} from '@/lib/creator-content-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { listComments } from '@/lib/marketplace-api';
import { useAuth } from '@/context/AuthContext';
import type { ContentPostBucket, CreatorContentItemDto } from '@/types/creator-content';

type CreatorContentPostCardProps = {
  post: CreatorContentItemDto;
  bucket: ContentPostBucket;
  creatorName: string;
  onChanged: () => void;
  onError: (message: string) => void;
  className?: string;
};

export function CreatorContentPostCard({
  post,
  bucket,
  creatorName,
  onChanged,
  onError,
  className = '',
}: CreatorContentPostCardProps) {
  const { user } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState<number | undefined>(undefined);
  const [visibilityBusy, setVisibilityBusy] = useState(false);
  const [commentsBusy, setCommentsBusy] = useState(false);
  const [isPublic, setIsPublic] = useState(post.isPublic);
  const [commentsEnabled, setCommentsEnabled] = useState(post.commentsEnabled !== false);

  useEffect(() => {
    setIsPublic(post.isPublic);
    setCommentsEnabled(post.commentsEnabled !== false);
  }, [post.id, post.isPublic, post.commentsEnabled]);

  useEffect(() => {
    setCommentsOpen(false);
    setCommentCount(undefined);
  }, [post.id]);

  useEffect(() => {
    if (bucket === 'trash' || !commentsEnabled) return;
    let cancelled = false;
    void listComments('POST', post.id, 0, 1)
      .then((page) => {
        if (!cancelled) setCommentCount(page.totalElements);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [post.id, bucket, commentsEnabled]);

  const handleCommentsEnabled = async (next: boolean) => {
    if (commentsBusy || bucket === 'trash' || next === commentsEnabled) return;
    const previous = commentsEnabled;
    setCommentsEnabled(next);
    setCommentsBusy(true);
    try {
      await updateContentCommentsEnabled(post.id, next);
      if (!next) {
        setCommentsOpen(false);
        setCommentCount(0);
      }
    } catch (e) {
      setCommentsEnabled(previous);
      onError(getApiErrorMessage(e, 'Impossible de modifier les commentaires.'));
    } finally {
      setCommentsBusy(false);
    }
  };

  const handleVisibility = async (next: boolean) => {
    if (visibilityBusy || bucket === 'trash' || next === isPublic) return;
    const previous = isPublic;
    setIsPublic(next);
    setVisibilityBusy(true);
    try {
      await updateContentVisibility(post.id, next);
    } catch (e) {
      setIsPublic(previous);
      onError(getApiErrorMessage(e, 'Unable to update visibility.'));
    } finally {
      setVisibilityBusy(false);
    }
  };

  const confirmAndRun = async (message: string, action: () => Promise<void>) => {
    if (!window.confirm(message)) return;
    try {
      await action();
      onChanged();
    } catch (e) {
      onError(getApiErrorMessage(e, 'Action failed.'));
    }
  };

  const cardControls = (
    <div className="flex flex-row items-center gap-1.5">
      {bucket !== 'trash' && (
        <div className="opacity-50 transition-opacity duration-200 hover:opacity-100">
          <ContentVisibilityToggle
            variant="icon"
            value={isPublic}
            onChange={(v) => void handleVisibility(v)}
            disabled={visibilityBusy}
          />
        </div>
      )}
      {bucket !== 'trash' && (
        <div className="opacity-50 transition-opacity duration-200 hover:opacity-100">
          <ContentCommentsToggle
            value={commentsEnabled}
            onChange={(v) => void handleCommentsEnabled(v)}
            disabled={commentsBusy}
            overlay
          />
        </div>
      )}
      <div className="opacity-50 transition-opacity duration-200 hover:opacity-100">
        <ContentPostOverflowMenu
        postId={post.id}
        bucket={bucket}
        pinned={Boolean(post.pinned)}
        onPin={() =>
          void confirmAndRun('Pin this content to the top of your portfolio?', async () => {
            await pinContent(post.id);
          })
        }
        onUnpin={() =>
          void confirmAndRun('Remove pin from this content?', async () => {
            await unpinContent(post.id);
          })
        }
        onArchive={() =>
          void confirmAndRun(
            'Archive this content? It will be hidden from the marketplace.',
            async () => {
              await archiveContent(post.id);
            }
          )
        }
        onUnarchive={() =>
          void confirmAndRun('Restore this content to your published list?', async () => {
            await unarchiveContent(post.id);
          })
        }
        onMoveToTrash={() =>
          void confirmAndRun('Move this content to trash? You can restore it later.', async () => {
            await moveContentToTrash(post.id);
          })
        }
        onRestore={() =>
          void confirmAndRun('Restore this content from trash?', async () => {
            await restoreContent(post.id);
          })
        }
        onPermanentDelete={() =>
          void confirmAndRun('Delete this content permanently? This cannot be undone.', async () => {
            await permanentDeleteContent(post.id);
          })
        }
        />
      </div>
    </div>
  );

  return (
    <div
      className={`flex h-full min-h-0 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6 ${className}`}
    >
      <article className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:h-full lg:w-[calc((100%-1.5rem)/2)] lg:max-w-[calc((100%-1.5rem)/2)]">
        <div className="relative shrink-0 p-4">
          <div className="absolute right-3 top-3">{cardControls}</div>
          <div className="pr-36">
            <ContentPostStudioHeader
              creatorName={creatorName}
              avatarUrl={user?.avatarUrl}
              moodLabel={post.moodLabel}
              moodEmoji={post.moodEmoji}
              taggedUsers={post.taggedUsers}
              profileHref={
                user?.id ? `/marketplace/${user.id}` : '/dashboard/creator?tab=profile'
              }
            />
          </div>
        </div>

        <div className="relative flex min-h-[min(60vw,20rem)] flex-1 items-center justify-center bg-black lg:min-h-0">
          {post.mediaUrl ? (
            <ContentPostFeedMediaFrame
              mediaUrl={post.mediaUrl}
              mediaType={post.mediaType}
              layout="fill"
            />
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center bg-neutral-100 text-xs text-neutral-400 dark:bg-neutral-900">
              No preview
            </div>
          )}

          {post.pinned && bucket === 'active' && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                <path d="M10 2l1.5 4.5H16l-3.7 2.7 1.4 4.3L10 11.8 6.3 13.5l1.4-4.3L4 6.5h4.5L10 2z" />
              </svg>
              Pinned
            </span>
          )}
        </div>

        <div className="shrink-0 p-4">
          {bucket !== 'trash' && (
            <ContentPostSocialBar
              postId={post.id}
              initialLikes={post.likes}
              createdAt={post.createdAt}
              commentsOpen={commentsOpen}
              onCommentsToggle={setCommentsOpen}
              commentCount={commentCount}
              hideCommentsButton
            />
          )}
        </div>
      </article>

      <ContentPostSidePanel
        post={post}
        bucket={bucket}
        commentCount={commentCount}
        commentsEnabled={commentsEnabled}
        moderationMode
        onCommentsToggle={setCommentsOpen}
        onCountChange={setCommentCount}
        loginRedirect="/dashboard/creator?tab=content"
        isAuthenticated
        className="min-h-0 flex-1 lg:h-full"
      />
    </div>
  );
}
