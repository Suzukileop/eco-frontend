'use client';

import type { CSSProperties } from 'react';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FlashToastHost } from '@/components/ui/FlashToastHost';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopHeader } from '@/components/layout/DashboardTopHeader';
import { MarketplacePatternBackground } from '@/components/marketplace/ProductDetailHalftoneBackground';
import { isContentCreatorsPath, isMarketplaceCreatorProfilePath } from '@/lib/marketplace-nav';
import { isEditorPath } from '@/stores/editorUiStore';

function isTemplatesHubPath(pathname: string): boolean {
  if (!pathname.startsWith('/dashboard/templates')) return false;
  return !pathname.includes('/studio');
}

function isCreatorStudioPath(pathname: string): boolean {
  if (!pathname.startsWith('/dashboard/creator')) return false;
  // Sub-pages (new/edit) keep the default dashboard shell
  if (pathname.includes('/new') || pathname.includes('/edit')) return false;
  return true;
}

function SessionErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-neutral-950">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl dark:bg-orange-500/10">
        ⚠️
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          Server temporarily unavailable
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Could not verify your session. Your connection may be rate-limited.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 active:scale-95 transition"
      >
        Try again
      </button>
    </div>
  );
}

export function DashboardShell({
  children,
  transparentContent = false,
  transparentHeader = false,
}: {
  children: React.ReactNode;
  transparentContent?: boolean;
  transparentHeader?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, user, sessionStatus, restoreSession } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const editorMode = isEditorPath(pathname);
  const creatorStudioPattern = isCreatorStudioPath(pathname);
  const templatesHubPattern = isTemplatesHubPath(pathname);
  const contentCreatorsPattern = isContentCreatorsPath(pathname);
  const usePatternBackground =
    transparentContent || creatorStudioPattern || templatesHubPattern || contentCreatorsPattern;
  const useTransparentHeader =
    transparentHeader || creatorStudioPattern || templatesHubPattern || contentCreatorsPattern;
  const compactContentTop = isMarketplaceCreatorProfilePath(pathname);
  const discussionsLayout = pathname.startsWith('/dashboard/discussions');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('ecosystem-geo-bg', pathname === '/dashboard/ecosystem');
    return () => {
      document.documentElement.classList.remove('ecosystem-geo-bg');
    };
  }, [pathname]);

  // Only redirect to /login when the session is definitively gone.
  // 'error' (rate-limit / network) must NOT trigger a redirect because
  // the middleware would immediately bounce the user back to /dashboard,
  // creating an infinite loop that exhausts the rate limit even further.
  useEffect(() => {
    if (sessionStatus !== 'unauthenticated') return;
    if (!pathname.startsWith('/dashboard')) return;
    router.replace('/login');
  }, [sessionStatus, pathname, router]);

  const handleRetry = useCallback(async () => {
    await restoreSession();
  }, [restoreSession]);

  // Show retry screen when session restore hit a transient error (429, network)
  if (!isLoading && sessionStatus === 'error' && !user) {
    return <SessionErrorScreen onRetry={handleRetry} />;
  }

  if (editorMode) {
    if (isLoading || !user) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-neutral-950">
        {children}
        <Suspense fallback={null}>
          <FlashToastHost />
        </Suspense>
      </div>
    );
  }

  const shellBg = usePatternBackground
    ? 'bg-transparent'
    : discussionsLayout
      ? 'bg-white dark:bg-black'
      : 'bg-white dark:bg-neutral-950';

  return (
    <>
      {(creatorStudioPattern || templatesHubPattern) && (
        <MarketplacePatternBackground variant="hub" />
      )}
      <div
        className={`flex min-h-screen ${shellBg}`}
        style={{ '--dash-sidebar-w': sidebarCollapsed ? '4.5rem' : '16rem' } as CSSProperties}
      >
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
      />
      <div
        data-dashboard-main
        className={`flex min-w-0 flex-1 flex-col ${discussionsLayout ? 'h-screen max-h-screen overflow-hidden' : ''} ${shellBg}`}
      >
        {!focusMode ? <DashboardTopHeader transparent={useTransparentHeader} /> : null}
        <div
          data-dashboard-content
          className={`relative z-10 min-w-0 flex-1 px-6 ${
            discussionsLayout
              ? 'flex min-h-0 flex-col overflow-hidden pb-4 pt-4'
              : `overflow-x-hidden pb-6 ${compactContentTop || focusMode ? 'pt-2' : 'pt-6'}`
          } ${shellBg}`}
        >
          {children}
        </div>
      </div>
    </div>
      <Suspense fallback={null}>
        <FlashToastHost />
      </Suspense>
    </>
  );
}
