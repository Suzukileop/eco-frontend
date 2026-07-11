'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { parseCreatorProductFlash } from '@/lib/flash-feedback';
import { pushFlashFeedback, useFlashFeedbackStore } from '@/stores/flashFeedbackStore';

const VARIANT_STYLES = {
  success: {
    container:
      'border-orange-200/80 bg-white shadow-lg shadow-orange-500/10 dark:border-orange-500/30 dark:bg-neutral-900',
    icon: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    bar: 'bg-orange-500',
    title: 'text-neutral-900 dark:text-white',
    description: 'text-neutral-600 dark:text-neutral-400',
  },
  error: {
    container:
      'border-red-200/80 bg-white shadow-lg shadow-red-500/10 dark:border-red-500/30 dark:bg-neutral-900',
    icon: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    bar: 'bg-red-500',
    title: 'text-neutral-900 dark:text-white',
    description: 'text-neutral-600 dark:text-neutral-400',
  },
  info: {
    container:
      'border-sky-200/80 bg-white shadow-lg shadow-sky-500/10 dark:border-sky-500/30 dark:bg-neutral-900',
    icon: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    bar: 'bg-sky-500',
    title: 'text-neutral-900 dark:text-white',
    description: 'text-neutral-600 dark:text-neutral-400',
  },
  neutral: {
    container:
      'border-neutral-200/90 bg-white shadow-lg shadow-neutral-900/5 dark:border-neutral-700 dark:bg-neutral-900',
    icon: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    bar: 'bg-neutral-400',
    title: 'text-neutral-900 dark:text-white',
    description: 'text-neutral-600 dark:text-neutral-400',
  },
} as const;

function FlashIcon({ variant }: { variant: keyof typeof VARIANT_STYLES }) {
  if (variant === 'error') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (variant === 'info' || variant === 'neutral') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FlashToastItem({
  toast,
  onDismiss,
}: {
  toast: ReturnType<typeof useFlashFeedbackStore.getState>['toasts'][number];
  onDismiss: (id: string) => void;
}) {
  const styles = VARIANT_STYLES[toast.variant];
  const durationMs = toast.durationMs ?? 6000;
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = window.setTimeout(() => dismissRef.current(toast.id), durationMs);
    return () => window.clearTimeout(timer);
  }, [toast.id, durationMs]);

  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border ${styles.container}`}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
        >
          <FlashIcon variant={toast.variant} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${styles.title}`}>{toast.title}</p>
          {toast.description && (
            <p className={`mt-1 text-sm leading-relaxed ${styles.description}`}>{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Dismiss notification"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
      <motion.div
        className={`h-1 ${styles.bar}`}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: durationMs / 1000, ease: 'linear' }}
        style={{ transformOrigin: 'left center' }}
        aria-hidden
      />
    </motion.div>
  );
}

export function FlashToastHost() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toasts = useFlashFeedbackStore((state) => state.toasts);
  const dismiss = useFlashFeedbackStore((state) => state.dismiss);
  const consumedFlashRef = useRef<string | null>(null);

  const consumeUrlFlash = useCallback(() => {
    const flash = searchParams.get('flash');
    const flashTitle = searchParams.get('flashTitle');
    if (!flash) return;

    const signature = `${pathname}?${searchParams.toString()}`;
    if (consumedFlashRef.current === signature) return;
    consumedFlashRef.current = signature;

    const parsed = parseCreatorProductFlash(flash, flashTitle);
    if (parsed) {
      pushFlashFeedback(parsed);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('flash');
    params.delete('flashTitle');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    consumeUrlFlash();
  }, [consumeUrlFlash]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed top-5 right-5 z-[300] flex w-[min(100vw-2.5rem,24rem)] flex-col gap-3"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <FlashToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
