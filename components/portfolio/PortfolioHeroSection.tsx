'use client';

import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import { PortfolioHeroEditorial } from '@/components/portfolio/hero-variants/PortfolioHeroEditorial';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialShellClass,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  PortfolioHeroMotifsLayer,
  PortfolioHeroPrimaryMotifOverlay,
} from '@/components/portfolio/PortfolioHeroMotifsLayer';
import { usePortfolioHeroGeomFade } from '@/components/portfolio/use-portfolio-hero-geom-fade';
import {
  PortfolioHeroEditorialMetaLayer,
  PortfolioHeroEditorialPortraitLayer,
} from '@/components/portfolio/portfolio-hero-shared';
import { PortfolioHeroEditorialCopyLayer } from '@/components/portfolio/portfolio-hero-editorial-copy';
import { heroSectionBackgroundStyle } from '@/components/portfolio/portfolio-hero-background-settings';
import { portfolioHeroTopClearancePaddingClass } from '@/components/portfolio/portfolio-nav-top-clearance';
import {
  isVerticalHeroDivision,
  resolveHeroLayoutDivision,
} from '@/components/portfolio/portfolio-hero-layout-division';

export function PortfolioHeroSection(heroData: PortfolioHeroData) {
  const { sectionRef, opacity: geomOpacity } = usePortfolioHeroGeomFade(
    heroData.geomFadeEnabled ?? false
  );
  const { motifLayout, heroMotifs } = heroData.presentation;
  const contentGutter = heroData.contentGutter ?? DEFAULT_CONTENT_GUTTER;
  const contentWidthClass = heroData.contentWidthClass ?? 'max-w-[90rem]';
  const layoutDivision = resolveHeroLayoutDivision(heroData.presentation);
  const verticalDivision = isVerticalHeroDivision(layoutDivision);
  const visualEdge =
    layoutDivision === 'horizontal-copy-right' ? 'left' : 'right';

  // Section wins: an explicit hero fill always paints on top of the global solid
  // color (same rule as the other sections). Fill "none" = show the Global page fill.
  // Fill "transparent" = paint strictly nothing, so the global color AND pattern
  // layers (below the section) stay visible through the hero.
  const transparentFill = heroData.presentation.heroSectionBackgroundFill === 'transparent';
  const ownBackgroundStyle = heroSectionBackgroundStyle(heroData.presentation);
  const backgroundStyle = transparentFill
    ? undefined
    : ownBackgroundStyle ??
      (heroData.suppressBackground ? heroData.globalBackgroundStyle : undefined);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative isolate min-h-[100dvh] min-h-screen overflow-x-clip"
    >
      {backgroundStyle ? (
        <>
          {(heroData.presentation.heroSectionBackgroundOpacity ?? 100) >= 100 &&
          heroData.presentation.heroSectionBackgroundFill !== 'none' ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2 bg-white"
            />
          ) : null}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
            style={backgroundStyle}
          />
        </>
      ) : null}
      <PortfolioHeroMotifsLayer
        motifs={heroMotifs ?? []}
        fadeOpacity={geomOpacity}
        background={heroData.presentation}
        contentGutter={contentGutter}
        contentWidthClass={contentWidthClass}
        visualEdge={visualEdge}
      />
      {/* Free copy is section-wide only for horizontal; vertical keeps copy inside its frame. */}
      {!verticalDivision ? <PortfolioHeroEditorialCopyLayer data={heroData} /> : null}
      <div
        className={`relative z-[1] mx-auto ${contentWidthClass} ${portfolioEditorialShellClass(contentGutter)} pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] sm:pb-32 xl:pb-0 ${portfolioHeroTopClearancePaddingClass()}`}
      >
        <PortfolioHeroEditorial data={heroData} />
      </div>
      {!verticalDivision ? (
        <PortfolioHeroPrimaryMotifOverlay
          motifs={heroMotifs ?? []}
          fadeOpacity={geomOpacity}
          contentGutter={contentGutter}
          contentWidthClass={contentWidthClass}
          visualEdge={visualEdge}
        />
      ) : null}
      {/* Horizontal only: absolute portrait/stats. Vertical: placed inside visual frame. */}
      {!verticalDivision && heroData.presentation.showPortrait ? (
        <PortfolioHeroEditorialPortraitLayer
          fullName={heroData.fullName}
          avatarUrl={heroData.avatarUrl}
          specialite={heroData.specialite}
          fadeOpacity={geomOpacity}
          motifLayout={motifLayout}
          profile={heroData.presentation}
          contentGutter={contentGutter}
          contentWidthClass={contentWidthClass}
          verticalDivision={false}
          layoutDivision={layoutDivision}
        />
      ) : null}
      {!verticalDivision ? (
        <PortfolioHeroEditorialMetaLayer
          yearsOfExperience={heroData.yearsOfExperience}
          workCount={heroData.workCount}
          locationLabel={heroData.locationLabel}
          fadeOpacity={geomOpacity}
          motifLayout={motifLayout}
          meta={heroData.presentation}
          contentGutter={contentGutter}
          contentWidthClass={contentWidthClass}
          verticalDivision={false}
          layoutDivision={layoutDivision}
        />
      ) : null}
    </section>
  );
}
