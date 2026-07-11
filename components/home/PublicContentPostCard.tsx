'use client';

import { useEffect, useState } from 'react';
import { ContentPostSidePanel } from '@/components/creator/ContentPostSidePanel';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import { ContentPostSocialBar } from '@/components/creator/ContentPostSocialBar';
import { ContentPostStudioHeader } from '@/components/creator/ContentPostStudioHeader';
import { listComments } from '@/lib/marketplace-api';
import { useAuth } from '@/context/AuthContext';
import type { PublicContentFeedItem } from '@/types/marketplace';

type PublicContentPostCardProps = {
  post: PublicContentFeedItem;
  className?: string;
};

export function PublicContentPostCard({ post, className = '' }: PublicContentPostCardProps) {
  const { isAuthenticated } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    setCommentsOpen(false);
    setCommentCount(undefined);
  }, [post.id]);

  useEffect(() => {
    if (post.commentsEnabled === false) return;
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
  }, [post.id, post.commentsEnabled]);

  const profileHref = post.creator.id
    ? `/marketplace/${post.creator.id}`
    : '/marketplace';

  return (
    <div
      className={`flex h-full min-h-0 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6 ${className}`}
    >
      <article className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:h-full lg:w-[calc((100%-1.5rem)/2)] lg:max-w-[calc((100%-1.5rem)/2)]">
        <div className="relative shrink-0 p-4">
          <ContentPostStudioHeader
            creatorName={post.creator.fullName}
            avatarUrl={post.creator.avatarUrl}
            moodLabel={post.moodLabel}
            moodEmoji={post.moodEmoji}
            taggedUsers={post.taggedUsers}
            profileHref={profileHref}
          />
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
              Aucun aperçu
            </div>
          )}

          {post.pinned && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                <path d="M10 2l1.5 4.5H16l-3.7 2.7 1.4 4.3L10 11.8 6.3 13.5l1.4-4.3L4 6.5h4.5L10 2z" />
              </svg>
              Épinglé
            </span>
          )}
        </div>

        <div className="shrink-0 p-4">
          <ContentPostSocialBar
            postId={post.id}
            initialLikes={post.likes}
            createdAt={post.createdAt}
            commentsOpen={commentsOpen}
            onCommentsToggle={setCommentsOpen}
            commentCount={commentCount}
            hideCommentsButton
          />
        </div>
      </article>

      <ContentPostSidePanel
        post={post}
        commentCount={commentCount}
        commentsEnabled={post.commentsEnabled !== false}
        onCommentsToggle={setCommentsOpen}
        onCountChange={setCommentCount}
        loginRedirect="/login?redirect=/dashboard/home"
        isAuthenticated={isAuthenticated}
        className="min-h-0 flex-1 lg:h-full"
      />
    </div>
  );
}
