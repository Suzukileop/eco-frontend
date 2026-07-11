/**
 * Loading placeholder that mirrors the default editorial hero:
 * left copy column, right geometric motif + circular portrait + meta cards.
 */
function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-neutral-200/90 ${className}`.trim()} />;
}

function HeroCopySkeleton() {
  return (
    <div className="flex w-full min-w-0 max-w-[44rem] flex-col items-start gap-8 sm:gap-10 lg:gap-12">
      <Bone className="h-8 w-40 rounded-full" />
      <div className="w-full space-y-3">
        <Bone className="h-3 w-28 rounded" />
        <Bone className="h-14 w-[92%] max-w-xl sm:h-16 lg:h-[4.5rem]" />
        <Bone className="h-14 w-[78%] max-w-lg sm:h-16 lg:h-[4.5rem]" />
      </div>
      <div className="w-full max-w-2xl space-y-2.5">
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-[94%]" />
        <Bone className="h-4 w-[72%]" />
      </div>
      <Bone className="h-12 w-40 rounded-full" />
      <div className="flex flex-wrap items-center gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Bone key={index} className="h-11 w-11 rounded-full" />
        ))}
      </div>
    </div>
  );
}

function HeroPortraitSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`.trim()}>
      <div className="aspect-square w-full animate-pulse rounded-full bg-neutral-300 ring-[14px] ring-white" />
      <Bone className="mx-auto mt-4 h-4 w-32" />
    </div>
  );
}

function HeroMetaCardsSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-5 sm:gap-7 lg:justify-start">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="min-w-[7.5rem] rounded-2xl border border-neutral-200/80 bg-white px-4 py-3 shadow-sm"
        >
          <Bone className="h-3 w-8" />
          <Bone className="mt-2 h-7 w-14" />
          <Bone className="mt-1.5 h-2.5 w-16" />
        </div>
      ))}
    </div>
  );
}

function WorkSectionSkeleton() {
  return (
    <div className="space-y-10 pt-16 sm:pt-20">
      <div className="space-y-3">
        <Bone className="h-3 w-24" />
        <Bone className="h-8 w-48" />
        <Bone className="h-4 w-full max-w-md" />
      </div>
      <div className="flex flex-col gap-10">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center"
          >
            <Bone className="aspect-[16/10] w-full rounded-2xl" />
            <div className="space-y-4">
              <Bone className="h-3 w-20" />
              <Bone className="h-8 w-3/4" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-5/6" />
              <div className="flex gap-2.5 pt-2">
                {Array.from({ length: 4 }).map((__, toolIndex) => (
                  <Bone key={toolIndex} className="h-11 w-11 rounded-full" />
                ))}
              </div>
              <Bone className="mt-2 h-11 w-36 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicCreatorPortfolioSkeleton() {
  return (
    <div className="min-h-screen bg-white text-neutral-950" aria-busy="true" aria-label="Loading portfolio">
      <section className="relative isolate min-h-[100dvh] min-h-screen overflow-x-clip">
        {/* Right geometric motif — default panel ~75% / 50%, 50×76 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
          <div className="relative mx-auto h-full w-full px-24 sm:px-28 lg:px-40 xl:px-48">
            <div
              className="absolute top-1/2 h-[76%] w-[50%] -translate-x-1/2 -translate-y-1/2 bg-neutral-200"
              style={{
                left: '75%',
                clipPath: 'polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%)',
              }}
            />
          </div>
        </div>

        <div className="relative z-10 w-full px-24 pb-10 pt-20 sm:px-28 sm:pb-12 sm:pt-24 lg:px-40 lg:pb-0 lg:pt-28 xl:px-48">
          <div className="grid items-start gap-12 lg:block">
            <HeroCopySkeleton />

            <div className="flex w-full flex-col lg:hidden">
              <div className="mx-auto w-full max-w-sm">
                <HeroPortraitSkeleton />
              </div>
              <div className="mt-10 flex w-full justify-center">
                <HeroMetaCardsSkeleton />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop portrait + meta — defaults ~80%/44% and ~80%/88% */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
          <div className="relative mx-auto h-full w-full px-24 sm:px-28 lg:px-40 xl:px-48">
            <div
              className="absolute w-[min(22rem,28%)] -translate-x-1/2 -translate-y-1/2"
              style={{ left: '80%', top: '44%' }}
            >
              <HeroPortraitSkeleton />
            </div>
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: '80%', top: '88%' }}
            >
              <HeroMetaCardsSkeleton />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full px-24 pb-16 sm:px-28 sm:pb-20 lg:px-40 xl:px-48">
        <WorkSectionSkeleton />
      </main>
    </div>
  );
}
