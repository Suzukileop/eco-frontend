'use client';

import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  HeroAvailabilityBadge,
  HeroCtas,
  HeroSpecialite,
  HeroPortrait,
  HeroStatsRow,
  HeroTitle,
} from '@/components/portfolio/portfolio-hero-shared';

export function PortfolioHeroCinematic({ data }: { data: PortfolioHeroData }) {
  return (
    <div className="portfolio-hero-enter overflow-hidden border border-neutral-200 dark:border-neutral-800 lg:grid lg:grid-cols-[42%_58%]">
      <div className="portfolio-hero-image-enter relative min-h-[280px] lg:min-h-[520px]">
        <HeroPortrait
          fullName={data.fullName}
          avatarUrl={data.avatarUrl}
          className="absolute inset-0 h-full w-full object-cover"
          wrapperClass="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/20" />
        {data.stats.length > 0 ? (
          <div className="absolute bottom-0 left-0 right-0 flex gap-6 border-t border-white/10 bg-black/40 px-6 py-4 backdrop-blur-sm lg:hidden">
            {data.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col justify-center bg-neutral-950 px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-14">
        <div className="mb-6">
          <HeroAvailabilityBadge
            isAvailable={data.isAvailable}
            responseTimeLabel={data.responseTimeLabel}
          />
        </div>

        <HeroTitle
          fullName={data.fullName}
          nameLead={data.nameLead}
          nameAccent={data.nameAccent}
          isVerified={data.isVerified}
          accentClass="text-orange-400"
          sizeClass="text-4xl sm:text-5xl lg:text-[3.25rem]"
          darkSurface
        />

        <HeroSpecialite specialite={data.specialite} darkSurface />

        <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-300 sm:text-lg">
          {data.description}
        </p>

        <div className="mt-8">
          <HeroCtas
            creatorId={data.creatorId}
            fullName={data.fullName}
            showWorkCta={data.showWorkCta}
            showContactCta={data.showContactCta}
            primaryClass="inline-flex items-center gap-2 bg-orange-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
            secondaryClass="inline-flex items-center gap-2 border border-white/25 bg-transparent px-6 py-3.5 text-sm font-bold text-white transition hover:border-white/50"
          />
        </div>

        <HeroStatsRow
          stats={data.stats}
          className="mt-10 hidden gap-8 border-t border-white/10 pt-8 lg:grid lg:grid-cols-3"
          valueClass="text-2xl font-bold text-white sm:text-3xl"
          labelClass="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50"
        />
      </div>
    </div>
  );
}
