/**
 * Equal left/right editorial gutters — shared by hero content and all sections below
 * (footer may opt out). Keep hero absolute layers in sync with these values.
 */

export type PortfolioContentGutter = 'none' | 'wide' | 'medium' | 'narrow';

export const DEFAULT_CONTENT_GUTTER: PortfolioContentGutter = 'medium';

const GUTTER_PADDING_X: Record<PortfolioContentGutter, string> = {
  none: 'px-0',
  /** Slightly less inset than medium — content feels a bit wider. */
  wide: 'px-5 sm:px-8 lg:px-16 xl:px-28 2xl:px-32',
  /** Current editorial gutters from xl up; phone/tablet-safe floor below. */
  medium: 'px-5 sm:px-10 md:px-16 lg:px-20 xl:px-40 2xl:px-48',
  /** Slightly more inset than medium — content feels a bit narrower. */
  narrow: 'px-6 sm:px-12 md:px-20 lg:px-28 xl:px-52 2xl:px-64',
};

const GUTTER_LAYER_INSET: Record<PortfolioContentGutter, string> = {
  none: 'left-0 right-0',
  wide: 'left-5 right-5 sm:left-8 sm:right-8 lg:left-16 lg:right-16 xl:left-28 xl:right-28 2xl:left-32 2xl:right-32',
  medium:
    'left-5 right-5 sm:left-10 sm:right-10 md:left-16 md:right-16 lg:left-20 lg:right-20 xl:left-40 xl:right-40 2xl:left-48 2xl:right-48',
  narrow:
    'left-6 right-6 sm:left-12 sm:right-12 md:left-20 md:right-20 lg:left-28 lg:right-28 xl:left-52 xl:right-52 2xl:left-64 2xl:right-64',
};

export function portfolioEditorialGutterX(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return GUTTER_PADDING_X[gutter] ?? GUTTER_PADDING_X.medium;
}

export function portfolioHeroLayerInset(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return GUTTER_LAYER_INSET[gutter] ?? GUTTER_LAYER_INSET.medium;
}

export function portfolioEditorialShellClass(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return `w-full ${portfolioEditorialGutterX(gutter)}`;
}

/** @deprecated Prefer portfolioEditorialGutterX(settings) — medium default. */
export const PORTFOLIO_EDITORIAL_GUTTER_X = GUTTER_PADDING_X.medium;

/** @deprecated Prefer portfolioHeroLayerInset(settings) — medium default. */
export const PORTFOLIO_HERO_LAYER_INSET = GUTTER_LAYER_INSET.medium;
