'use client';

import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  HeroPortrait,
  HeroProfileMeta,
} from '@/components/portfolio/portfolio-hero-shared';
import {
  HeroEditorialCopyBlock,
  isHeroCopyFreeMode,
} from '@/components/portfolio/portfolio-hero-editorial-copy';

export function PortfolioHeroEditorial({ data }: { data: PortfolioHeroData }) {
  const { presentation } = data;
  const flipped = presentation.heroLayoutFlipped;
  const copyFree = isHeroCopyFreeMode(presentation.heroCopyPlacementMode);

  return (
    <div className="portfolio-hero-enter relative flex flex-col">
      <div className="grid items-start gap-12 lg:block lg:gap-0">
        <div
          className={`relative z-10 w-full lg:max-w-[44rem] ${flipped ? 'lg:ml-auto' : ''} ${
            copyFree ? 'lg:hidden' : ''
          }`}
        >
          <div
            className={`flex min-h-[400px] w-full min-w-0 flex-col justify-center gap-10 sm:gap-12 lg:gap-14 ${
              flipped ? 'items-start lg:items-end lg:text-right' : 'items-start'
            }`}
          >
            <HeroEditorialCopyBlock data={data} />
          </div>
        </div>

        <div className="portfolio-hero-image-enter flex w-full flex-col lg:hidden">
          <div className="flex w-full justify-center pt-0 lg:pr-0">
            <HeroPortrait
              fullName={data.fullName}
              avatarUrl={data.avatarUrl}
              className="aspect-[4/5] w-full object-cover"
              profile={presentation}
            />
          </div>

          <div className="relative z-30 mt-auto flex w-full justify-center pt-10 lg:pt-12">
            <HeroProfileMeta
              editorial
              meta={presentation}
              yearsOfExperience={data.yearsOfExperience}
              workCount={data.workCount}
              locationLabel={data.locationLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
