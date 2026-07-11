'use client';

import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import { PortfolioHeroEditorial } from '@/components/portfolio/hero-variants/PortfolioHeroEditorial';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialShellClass,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  PortfolioHeroGeometricBackground,
  PortfolioHeroGeometricOverlay,
} from '@/components/portfolio/portfolio-hero-geometric';
import { usePortfolioHeroGeomFade } from '@/components/portfolio/use-portfolio-hero-geom-fade';
import {
  PortfolioHeroEditorialMetaLayer,
  PortfolioHeroEditorialPortraitLayer,
} from '@/components/portfolio/portfolio-hero-shared';
import { PortfolioHeroLeftMotif } from '@/components/portfolio/PortfolioHeroLeftMotif';
import { PortfolioHeroEditorialCopyLayer } from '@/components/portfolio/portfolio-hero-editorial-copy';
import { heroSectionBackgroundStyle } from '@/components/portfolio/portfolio-hero-background-settings';

export function PortfolioHeroSection(heroData: PortfolioHeroData) {
  const { sectionRef, opacity: geomOpacity } = usePortfolioHeroGeomFade(
    heroData.geomFadeEnabled ?? false
  );
  const { motifShape, motifColor, motifLayout, customMotifPoints, motifPosition, motifPanelSize } =
    heroData.presentation;
  const contentGutter = heroData.contentGutter ?? DEFAULT_CONTENT_GUTTER;

  const backgroundStyle = heroData.suppressBackground
    ? heroData.globalBackgroundStyle
    : heroSectionBackgroundStyle(heroData.presentation);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative isolate min-h-[100dvh] min-h-screen overflow-x-clip"
    >
      {backgroundStyle ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 left-1/2 -z-10 w-screen -translate-x-1/2"
          style={backgroundStyle}
        />
      ) : null}
      <PortfolioHeroLeftMotif settings={heroData.presentation} />
      <PortfolioHeroEditorialCopyLayer data={heroData} />
      <PortfolioHeroGeometricBackground
        fadeOpacity={geomOpacity}
        motifShape={motifShape}
        motifColor={motifColor}
        customMotifPoints={customMotifPoints}
        motifPosition={motifPosition}
        motifPanelSize={motifPanelSize}
        background={heroData.presentation}
        contentGutter={contentGutter}
      />
      <div
        className={`relative ${portfolioEditorialShellClass(contentGutter)} pb-10 pt-20 sm:pb-12 sm:pt-24 lg:pb-0 lg:pt-28`}
      >
        <PortfolioHeroEditorial data={heroData} />
      </div>
      <PortfolioHeroGeometricOverlay
        fadeOpacity={geomOpacity}
        motifShape={motifShape}
        customMotifPoints={customMotifPoints}
        motifPosition={motifPosition}
        motifPanelSize={motifPanelSize}
        contentGutter={contentGutter}
      />
      <PortfolioHeroEditorialPortraitLayer
        fullName={heroData.fullName}
        avatarUrl={heroData.avatarUrl}
        fadeOpacity={geomOpacity}
        motifLayout={motifLayout}
        profile={heroData.presentation}
        contentGutter={contentGutter}
      />
      <PortfolioHeroEditorialMetaLayer
        yearsOfExperience={heroData.yearsOfExperience}
        workCount={heroData.workCount}
        locationLabel={heroData.locationLabel}
        fadeOpacity={geomOpacity}
        motifLayout={motifLayout}
        meta={heroData.presentation}
        contentGutter={contentGutter}
      />
    </section>
  );
}
