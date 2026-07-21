'use client';

import {
  heroMotifContentFrameStyle,
  heroMotifInnerStyle,
  heroMotifShellStyle,
  motifVisibilityClass,
  type HeroMotifInstance,
} from '@/components/portfolio/portfolio-hero-motifs-settings';
import type { PortfolioHeroBackgroundSettings } from '@/components/portfolio/portfolio-hero-background-settings';
import { resolveMotifClipPath } from '@/components/portfolio/portfolio-hero-settings';
import {
  motifPanelContainerStyle,
  normalizeMotifPositionForContentFrame,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import {
  HeroEditorialLayerFrame,
} from '@/components/portfolio/portfolio-hero-geometric';
import {
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

function HeroMotifItem({
  motif,
  fadeOpacity,
  background,
  layout = 'section',
  visualEdge = 'right',
}: {
  motif: HeroMotifInstance;
  fadeOpacity: number;
  background?: PortfolioHeroBackgroundSettings;
  /** `frame` = desktop content-width box; `section` = full hero (mobile). */
  layout?: 'section' | 'frame';
  /** Which content-frame edge the geometric (visual-group) motif hugs. */
  visualEdge?: 'left' | 'right';
}) {
  if (!motif.enabled) return null;
  if (!motif.visibility.mobile && !motif.visibility.desktop) return null;

  // Pattern follows the copy column (opposite of the visual/portrait edge).
  const frameEdge: 'left' | 'right' =
    motif.kind === 'geometric'
      ? visualEdge
      : visualEdge === 'right'
        ? 'left'
        : 'right';

  const shellStyle =
    layout === 'frame'
      ? heroMotifContentFrameStyle(
          {
            ...motif,
            position: normalizeMotifPositionForContentFrame(
              motif.position,
              motif.size,
              frameEdge
            ),
          },
          fadeOpacity,
          frameEdge
        )
      : heroMotifShellStyle(motif, fadeOpacity);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${motifVisibilityClass(motif.visibility)}`}
      style={{ zIndex: motif.zIndex }}
    >
      <div className="pointer-events-none absolute overflow-hidden" style={shellStyle}>
        <div
          className="absolute inset-0"
          style={heroMotifInnerStyle(motif, background, frameEdge)}
        />
      </div>
    </div>
  );
}

function renderMotifItems(
  motifs: HeroMotifInstance[],
  fadeOpacity: number,
  background: PortfolioHeroBackgroundSettings | undefined,
  layout: 'section' | 'frame',
  visualEdge: 'left' | 'right'
) {
  return motifs.map((motif) => (
    <HeroMotifItem
      key={motif.id}
      motif={motif}
      fadeOpacity={fadeOpacity}
      background={background}
      layout={layout}
      visualEdge={visualEdge}
    />
  ));
}

/** Renders all hero motifs with per-item mobile/desktop visibility. */
export function PortfolioHeroMotifsLayer({
  motifs,
  fadeOpacity = 1,
  background,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = 'max-w-[90rem]',
  visualEdge = 'right',
}: {
  motifs: HeroMotifInstance[];
  fadeOpacity?: number;
  background?: PortfolioHeroBackgroundSettings;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
  /** Geometric motifs follow the visual group: right (default) or left when flipped. */
  visualEdge?: 'left' | 'right';
}) {
  if (!motifs.length) return null;

  return (
    <>
      {/* Below xl: full section (stacked hero). */}
      <div className="pointer-events-none absolute inset-0 overflow-x-clip xl:hidden">
        {renderMotifItems(motifs, fadeOpacity, background, 'section', visualEdge)}
      </div>
      {/* xl+: same content-width + side-margin frame as copy / portrait / stats. */}
      <HeroEditorialLayerFrame
        gutter={contentGutter}
        contentWidthClass={contentWidthClass}
        className="z-0 overflow-hidden"
      >
        {renderMotifItems(motifs, fadeOpacity, background, 'frame', visualEdge)}
      </HeroEditorialLayerFrame>
    </>
  );
}

/**
 * Desaturate overlay for the primary desktop geometric motif (legacy look).
 * Only on xl+ to match the previous right-motif overlay.
 */
export function PortfolioHeroPrimaryMotifOverlay({
  motifs,
  fadeOpacity = 1,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = 'max-w-[90rem]',
  visualEdge = 'right',
}: {
  motifs: HeroMotifInstance[];
  fadeOpacity?: number;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
  visualEdge?: 'left' | 'right';
}) {
  const primary =
    motifs.find(
      (m) => m.kind === 'geometric' && m.enabled && m.visibility.desktop
    ) ?? null;
  if (!primary) return null;

  const position = normalizeMotifPositionForContentFrame(
    primary.position,
    primary.size,
    visualEdge
  );
  const clipStyle = {
    clipPath: resolveMotifClipPath(
      primary.shape,
      primary.points,
      visualEdge
    ),
  };
  // Overlay follows the motif opacity slider, same as the fill layer.
  const overlayOpacity = (Math.min(Math.max(primary.opacity, 0), 100) / 100) * fadeOpacity;

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-20 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute overflow-hidden"
        style={motifPanelContainerStyle(position, primary.size, overlayOpacity, '%')}
      >
        <div className="portfolio-hero-geom-overlay absolute inset-0" style={clipStyle} />
      </div>
    </HeroEditorialLayerFrame>
  );
}
