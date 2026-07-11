'use client';

import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  HeroAvailabilityBadge,
  HeroToolsGrid,
} from '@/components/portfolio/portfolio-hero-shared';
import { ArrowUpRight } from '@/components/portfolio/portfolio-section-primitives';
import {
  heroCtaClassName,
  heroHeadlineClassName,
  heroHeadlineFontStyle,
  heroHeadlineSizeClass,
  heroHeadlineUsesSplitLayout,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  heroCopyPositionStyle,
  type HeroCopyPlacementMode,
} from '@/components/portfolio/portfolio-hero-copy-settings';
import { resolveHeroSectionMinHeightVh } from '@/components/portfolio/portfolio-hero-settings';
import {
  resolveHeroHeadlineAccent,
  resolveHeroHeadlinePrefix,
} from '@/components/portfolio/portfolio-hero-headline-settings';

function buildHeadline(data: PortfolioHeroData): string {
  const { presentation } = data;
  return resolveHeroHeadlineAccent({
    specialite: data.specialite,
    fullName: data.fullName,
    nameAccent: data.nameAccent,
    valueSource: presentation.heroHeadlineValue,
  });
}

function HeroContactCta({
  href,
  design,
}: {
  href: string;
  design: PortfolioHeroData['presentation']['ctaDesign'];
}) {
  return (
    <a href={href} className={heroCtaClassName(design)}>
      Contact me
      {design === 'text-arrow' ? <ArrowUpRight className="h-4 w-4" /> : null}
    </a>
  );
}

export function HeroEditorialCopyBlock({
  data,
  align = 'start',
  className = '',
}: {
  data: PortfolioHeroData;
  align?: 'start' | 'end';
  className?: string;
}) {
  const { presentation } = data;
  const flipped = presentation.heroLayoutFlipped;
  const effectiveAlign = align === 'end' || flipped ? 'end' : 'start';
  const showCta = data.showContactCta;
  const hasTools = data.tools.length > 0;
  const headline = buildHeadline(data);
  const headlinePrefix = resolveHeroHeadlinePrefix(presentation.heroHeadlinePrefix);

  const headlineSizeClass = heroHeadlineSizeClass(presentation.headlineFont);
  const splitHeadline = heroHeadlineUsesSplitLayout(presentation.headlineFont);

  const availabilityBadge = (
    <HeroAvailabilityBadge
      isAvailable={data.isAvailable}
      responseTimeLabel={data.responseTimeLabel}
      showResponseTime={presentation.showAvailabilityResponseTime}
      design={presentation.availabilityDesign}
      placement={presentation.availabilityPlacement}
      layoutFlipped={flipped}
      placementContext="inline"
    />
  );

  const contactCta = showCta ? (
    <HeroContactCta href={data.contactHref} design={presentation.ctaDesign} />
  ) : null;

  return (
    <div
      className={`flex w-full min-w-0 flex-col gap-8 sm:gap-10 lg:gap-12 ${
        effectiveAlign === 'end' ? 'items-end text-right' : 'items-start text-left'
      } ${className}`.trim()}
    >
      {presentation.availabilityPlacement === 'top-right' ? (
        <div className={`flex w-full ${effectiveAlign === 'end' ? 'justify-start' : 'justify-end'}`}>
          {availabilityBadge}
        </div>
      ) : null}

      {presentation.availabilityPlacement === 'above-headline' ? availabilityBadge : null}

      <h1
        className={`w-full max-w-full leading-[0.92] text-neutral-950 dark:text-white ${headlineSizeClass} ${heroHeadlineClassName(presentation.headlineFont)}`}
        style={heroHeadlineFontStyle(presentation.headlineFont)}
      >
        {splitHeadline ? (
          <>
            <span className="block text-[0.42em] font-bold tracking-[0.2em] text-neutral-500">{headlinePrefix}</span>
            <span className="mt-2 block break-words text-orange-600 dark:text-orange-400">{headline}</span>
          </>
        ) : (
          <>
            {headlinePrefix}{' '}
            <span className="break-words text-orange-600 dark:text-orange-400">
              {headline}
              {data.isVerified ? (
                <sup className="ml-1 align-super text-[0.42em] font-bold leading-none text-neutral-400 dark:text-neutral-500">
                  ©
                </sup>
              ) : null}
            </span>
          </>
        )}
      </h1>

      {presentation.availabilityPlacement === 'below-headline' ? availabilityBadge : null}

      {showCta && presentation.ctaPlacement === 'after-headline' ? contactCta : null}

      <p className="max-w-2xl text-lg leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-xl">
        {data.description}
      </p>

      {showCta && presentation.ctaPlacement === 'below-pitch' ? contactCta : null}

      {hasTools || (showCta && presentation.ctaPlacement === 'with-tools') ? (
        <div
          className={`flex flex-wrap items-center gap-4 ${
            effectiveAlign === 'end' ? 'justify-end' : 'justify-start'
          }`}
        >
          {hasTools ? <HeroToolsGrid tools={data.tools} layout="row" onDark /> : null}
          {showCta && presentation.ctaPlacement === 'with-tools' ? contactCta : null}
        </div>
      ) : null}

      {showCta && presentation.ctaPlacement === 'below-tools' ? contactCta : null}
    </div>
  );
}

export function PortfolioHeroEditorialCopyLayer({ data }: { data: PortfolioHeroData }) {
  const { heroCopyPlacementMode, heroCopyPosition } = data.presentation;

  if (heroCopyPlacementMode !== 'free') return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[12] hidden lg:block"
      style={{ minHeight: `${resolveHeroSectionMinHeightVh(data.presentation)}vh` }}
    >
      <div
        className="pointer-events-auto absolute w-[min(44rem,46vw)]"
        style={heroCopyPositionStyle(heroCopyPosition)}
      >
        <HeroEditorialCopyBlock data={data} />
      </div>
    </div>
  );
}

export function isHeroCopyFreeMode(mode: HeroCopyPlacementMode): boolean {
  return mode === 'free';
}
