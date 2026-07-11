const block = 'animate-pulse rounded bg-neutral-200 dark:bg-neutral-700';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

function HomeNewsPostCardSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
      <article className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:h-full lg:w-[calc((100%-1.5rem)/2)] lg:max-w-[calc((100%-1.5rem)/2)]">
        <div className="shrink-0 p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 shrink-0 rounded-full ${block}`} />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine className="h-4 w-36" />
              <SkeletonLine className="h-3 w-24" />
            </div>
          </div>
        </div>

        <div className={`relative mx-4 mb-4 min-h-[min(60vw,20rem)] flex-1 rounded-xl lg:min-h-0 ${block}`} />

        <div className="shrink-0 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <SkeletonLine className="h-8 w-14 rounded-lg" />
            <SkeletonLine className="h-8 w-14 rounded-lg" />
            <SkeletonLine className="ml-auto h-4 w-20" />
          </div>
        </div>
      </article>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/80 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/60 lg:h-full">
        <div className="min-h-0 flex-1 space-y-4 p-5">
          <SkeletonLine className="h-7 w-2/3 max-w-xs" />
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-5/6" />
          <div className="rounded-xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-700/80 dark:bg-neutral-900/80">
            <SkeletonLine className="h-3 w-56" />
            <SkeletonLine className="mt-3 h-7 w-24" />
          </div>
          <div className="flex flex-wrap gap-2">
            <SkeletonLine className="h-8 w-20 rounded-full" />
            <SkeletonLine className="h-8 w-24 rounded-full" />
          </div>
        </div>
        <div className="mt-auto shrink-0 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <SkeletonLine className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function HomeNewsHeaderSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <SkeletonLine className="h-7 w-32" />
      <SkeletonLine className="h-4 w-full max-w-md" />
    </div>
  );
}

export function HomeNewsFeedSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="snap-y snap-proximity" aria-busy="true" aria-label="Chargement des actualités">
      {Array.from({ length: count }, (_, index) => (
        <section
          key={index}
          className="flex min-h-0 snap-center snap-always scroll-mt-6 items-center justify-center pb-10 pt-2 lg:h-[80vh] lg:min-h-[80vh]"
        >
          <HomeNewsPostCardSkeleton />
        </section>
      ))}
    </div>
  );
}

export function HomeNewsPageSkeleton() {
  return (
    <>
      <HomeNewsHeaderSkeleton />
      <HomeNewsFeedSkeleton />
    </>
  );
}
