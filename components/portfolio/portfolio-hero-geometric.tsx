import type { CSSProperties, ReactNode } from 'react';
import type { PortfolioHeroMotifLayout, PortfolioHeroMotifShape } from '@/components/portfolio/portfolio-hero-settings';
import {
  DEFAULT_HERO_MOTIF_COLOR,
  resolveMotifClipPath,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  heroMotifPanelFillStyle,
  DEFAULT_HERO_BACKGROUND_SETTINGS,
  type PortfolioHeroBackgroundSettings,
} from '@/components/portfolio/portfolio-hero-background-settings';
import {
  motifPanelContainerStyle,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import type { MotifPoint } from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioHeroLayerInset,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

/** Full-height frame matching section gutters — children position with % of this box. */
export function heroContentLayerFrame(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return `pointer-events-none absolute inset-y-0 hidden lg:block ${portfolioHeroLayerInset(gutter)}`;
}

/** @deprecated Prefer heroContentLayerFrame(gutter) */
export const HERO_CONTENT_LAYER_FRAME = heroContentLayerFrame(DEFAULT_CONTENT_GUTTER);

export const HERO_GEOM_LAYER_SHELL = `${HERO_CONTENT_LAYER_FRAME} overflow-hidden`;

/** Portrait layer — overflow visible so free placement is not clipped at panel edges. */
export function heroPortraitLayerShell(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return `${heroContentLayerFrame(gutter)} overflow-visible`;
}

/** @deprecated Prefer heroPortraitLayerShell(gutter) */
export const HERO_PORTRAIT_LAYER_SHELL = heroPortraitLayerShell(DEFAULT_CONTENT_GUTTER);

export { heroGeomLayerPositionStyle } from '@/components/portfolio/portfolio-hero-settings';

type GeomFadeProps = {
  fadeOpacity?: number;
  motifShape?: PortfolioHeroMotifShape;
  motifLayout?: PortfolioHeroMotifLayout;
  motifColor?: string;
  customMotifPoints?: MotifPoint[];
  motifPosition?: MotifPanelPosition;
  motifPanelSize?: MotifPanelSize;
  background?: PortfolioHeroBackgroundSettings;
  contentGutter?: PortfolioContentGutter;
};

function motifPanelShellStyle(
  fadeOpacity = 1,
  position: MotifPanelPosition,
  size: MotifPanelSize
): CSSProperties {
  return motifPanelContainerStyle(position, size, fadeOpacity, '%');
}

function motifPanelStyle(
  shape: PortfolioHeroMotifShape,
  color: string,
  customMotifPoints: MotifPoint[],
  background: PortfolioHeroBackgroundSettings = DEFAULT_HERO_BACKGROUND_SETTINGS
): CSSProperties {
  return {
    clipPath: resolveMotifClipPath(shape, customMotifPoints),
    ...heroMotifPanelFillStyle(background, color),
  };
}

function motifClipStyle(shape: PortfolioHeroMotifShape, customMotifPoints: MotifPoint[]): CSSProperties {
  return { clipPath: resolveMotifClipPath(shape, customMotifPoints) };
}

/** Solid geometric shape behind hero content. */
export function PortfolioHeroGeometricBackground({
  fadeOpacity = 1,
  motifShape = 'diagonal',
  motifColor = DEFAULT_HERO_MOTIF_COLOR,
  customMotifPoints = [],
  motifPosition,
  motifPanelSize,
  background,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: GeomFadeProps) {
  if (!motifPosition || !motifPanelSize) return null;

  return (
    <div aria-hidden className={`${heroContentLayerFrame(contentGutter)} z-0 overflow-visible`}>
      <div
        className="pointer-events-none absolute overflow-visible"
        style={motifPanelShellStyle(fadeOpacity, motifPosition, motifPanelSize)}
      >
        <div
          className="absolute inset-0"
          style={motifPanelStyle(motifShape, motifColor, customMotifPoints, background)}
        />
      </div>
    </div>
  );
}

/** Transparent layer above content — backdrop-filter desaturates everything underneath in zone Y. */
export function PortfolioHeroGeometricOverlay({
  fadeOpacity = 1,
  motifShape = 'diagonal',
  customMotifPoints = [],
  motifPosition,
  motifPanelSize,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: Pick<
  GeomFadeProps,
  | 'fadeOpacity'
  | 'motifShape'
  | 'customMotifPoints'
  | 'motifPosition'
  | 'motifPanelSize'
  | 'contentGutter'
>) {
  if (!motifPosition || !motifPanelSize) return null;

  const clipStyle = motifClipStyle(motifShape, customMotifPoints);

  return (
    <div aria-hidden className={`${heroContentLayerFrame(contentGutter)} z-20 overflow-visible`}>
      <div
        className="pointer-events-none absolute overflow-visible"
        style={motifPanelShellStyle(fadeOpacity, motifPosition, motifPanelSize)}
      >
        <div className="portfolio-hero-geom-overlay absolute inset-0" style={clipStyle} />
      </div>
    </div>
  );
}

/** Inside zone Y — legacy clipped bar (prefer PortfolioHeroEditorialMetaLayer). */
export function PortfolioHeroMetaGeomBar({
  children,
  fadeOpacity = 1,
  motifShape = 'diagonal',
  customMotifPoints = [],
  motifPosition,
  motifPanelSize,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: GeomFadeProps & { children: ReactNode }) {
  if (!motifPosition || !motifPanelSize) return null;

  const clipStyle = motifClipStyle(motifShape, customMotifPoints);

  return (
    <div aria-hidden className={`${heroContentLayerFrame(contentGutter)} z-[15] overflow-visible`}>
      <div
        className="pointer-events-none absolute overflow-visible"
        style={motifPanelShellStyle(fadeOpacity, motifPosition, motifPanelSize)}
      >
        <div className="pointer-events-auto absolute inset-0" style={clipStyle}>
          <div className="absolute inset-x-0 bottom-28 xl:bottom-32 2xl:bottom-36">
            <div className="absolute left-[75%] flex w-[min(42rem,46%)] -translate-x-1/2 justify-between px-4 sm:px-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
