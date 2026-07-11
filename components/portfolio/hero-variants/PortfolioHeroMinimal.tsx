'use client';

import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  HeroAvailabilityBadge,
  HeroCtas,
  HeroSpecialite,
  HeroPortrait,
  HeroSideNav,
  HeroStatsRow,
  HeroTitle,
} from '@/components/portfolio/portfolio-hero-shared';

export function PortfolioHeroMinimal({ data }: { data: PortfolioHeroData }) {
  return (
    <div className="portfolio-hero-enter lg:grid lg:grid-cols-[1fr_auto] lg:gap-16">
      <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-none lg:text-left">
        <div className="mb-6 flex justify-center lg:justify-start">
          <HeroAvailabilityBadge
            isAvailable={data.isAvailable}
            responseTimeLabel={data.responseTimeLabel}
          />
        </div>

        <div className="portfolio-hero-image-enter mx-auto mb-8 w-24 sm:w-28 lg:mx-0">
          <HeroPortrait
            fullName={data.fullName}
            avatarUrl={data.avatarUrl}
            className="aspect-square w-full object-cover"
            wrapperClass="w-full"
          />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-400">
          Créateur · Portfolio
        </p>

        <div className="mt-3">
          <HeroTitle
            fullName={data.fullName}
            nameLead={data.nameLead}
            nameAccent={data.nameAccent}
            isVerified={data.isVerified}
            accentClass="text-orange-600 dark:text-orange-400"
            sizeClass="text-3xl sm:text-4xl lg:text-5xl"
          />
        </div>

        <HeroSpecialite specialite={data.specialite} />

        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-neutral-600 dark:text-neutral-300 lg:mx-0">
          {data.description}
        </p>

        <div className="mt-8 flex justify-center lg:justify-start">
          <HeroCtas
            creatorId={data.creatorId}
            fullName={data.fullName}
            showWorkCta={data.showWorkCta}
            showContactCta={data.showContactCta}
          />
        </div>

        <HeroStatsRow
          stats={data.stats}
          className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-neutral-200/80 pt-8 dark:border-neutral-800 lg:mx-0"
        />
      </div>

      <div className="mt-12 lg:mt-0 lg:pt-8">
        <HeroSideNav items={data.navItems} />
      </div>
    </div>
  );
}
