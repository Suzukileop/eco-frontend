'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ContentPostDetailsBlock,
  type ContentPostDetailsPost,
} from '@/components/creator/ContentPostDetailsBlock';
import { ContentPostCommentsButton } from '@/components/creator/ContentPostSocialBar';
import { CommentThread } from '@/components/marketplace/CommentThread';
import type { ContentPostBucket } from '@/types/creator-content';

const FADE_MS = 280;

type ContentPostSidePanelProps = {
  post: ContentPostDetailsPost & { id: string };
  bucket?: ContentPostBucket;
  commentCount?: number;
  commentsEnabled?: boolean;
  moderationMode?: boolean;
  onCommentsToggle: (open: boolean) => void;
  onCountChange: (count: number) => void;
  loginRedirect?: string;
  isAuthenticated?: boolean;
  className?: string;
};

export function ContentPostSidePanel({
  post,
  bucket = 'active',
  commentCount,
  commentsEnabled = true,
  moderationMode = false,
  onCommentsToggle,
  onCountChange,
  loginRedirect = '/login',
  isAuthenticated = true,
  className = '',
}: ContentPostSidePanelProps) {
  type PanelFace = 'details' | 'comments';

  const [renderedFace, setRenderedFace] = useState<PanelFace>('details');
  const [panelOpacity, setPanelOpacity] = useState(1);
  const renderedFaceRef = useRef<PanelFace>('details');
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  renderedFaceRef.current = renderedFace;

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setRenderedFace('details');
    renderedFaceRef.current = 'details';
    setPanelOpacity(1);
  }, [post.id]);

  const transitionTo = useCallback(
    (open: boolean) => {
      if (bucket === 'trash') return;

      const nextFace: PanelFace = open ? 'comments' : 'details';
      if (nextFace === renderedFaceRef.current) {
        onCommentsToggle(open);
        return;
      }

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setPanelOpacity(0);

      fadeTimerRef.current = setTimeout(() => {
        setRenderedFace(nextFace);
        onCommentsToggle(open);
        requestAnimationFrame(() => setPanelOpacity(1));
      }, FADE_MS);
    },
    [bucket, onCommentsToggle]
  );

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/80 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/60 ${className}`}
    >
      <div
        className="flex h-full min-h-0 flex-1 flex-col transition-opacity duration-300 ease-in-out motion-reduce:transition-none"
        style={{ opacity: panelOpacity }}
      >
        {renderedFace === 'details' ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <ContentPostDetailsBlock post={post} bucket={bucket} variant="sidebar" />
            </div>
            {bucket !== 'trash' && commentsEnabled && (
              <div className="mt-auto shrink-0 border-t border-neutral-200 p-4 dark:border-neutral-800">
                <ContentPostCommentsButton
                  commentCount={commentCount}
                  commentsOpen={false}
                  onToggle={() => transitionTo(true)}
                />
              </div>
            )}
            {bucket !== 'trash' && !commentsEnabled && (
              <div className="mt-auto shrink-0 border-t border-neutral-200 p-4 text-center text-sm text-neutral-500 dark:border-neutral-800">
                Commentaires désactivés pour ce contenu.
              </div>
            )}
          </>
        ) : (
          <CommentThread
            variant="panel"
            targetType="POST"
            targetId={post.id}
            isAuthenticated={isAuthenticated}
            loginRedirect={loginRedirect}
            commentsEnabled={commentsEnabled}
            moderationMode={moderationMode}
            onClose={() => transitionTo(false)}
            onCountChange={onCountChange}
            className="flex h-full min-h-0 flex-1 flex-col rounded-none border-0 bg-transparent shadow-none"
          />
        )}
      </div>
    </div>
  );
}
