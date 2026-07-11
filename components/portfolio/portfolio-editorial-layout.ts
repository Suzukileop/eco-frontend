/**
 * Equal left/right editorial gutters — shared by hero content and all sections below
 * (footer may opt out). Keep hero absolute layers in sync with these values.
 */

export type PortfolioContentGutter = 'none' | 'wide' | 'medium' | 'narrow';

export const DEFAULT_CONTENT_GUTTER: PortfolioContentGutter = 'medium';

const GUTTER_PADDING_X: Record<PortfolioContentGutter, string> = {
  none: 'px-0',
  /** Slightly less inset than medium — content feels a bit wider. */
  wide: 'px-14 sm:px-16 lg:px-28 xl:px-32',
  /** Current editorial gutters. */
  medium: 'px-24 sm:px-28 lg:px-40 xl:px-48',
  /** Slightly more inset than medium — content feels a bit narrower. */
  narrow: 'px-32 sm:px-36 lg:px-52 xl:px-64',
};

const GUTTER_LAYER_INSET: Record<PortfolioContentGutter, string> = {
  none: 'left-0 right-0',
  wide: 'left-14 right-14 sm:left-16 sm:right-16 lg:left-28 lg:right-28 xl:left-32 xl:right-32',
  medium: 'left-24 right-24 sm:left-28 sm:right-28 lg:left-40 lg:right-40 xl:left-48 xl:right-48',
  narrow: 'left-32 right-32 sm:left-36 sm:right-36 lg:left-52 lg:right-52 xl:left-64 xl:right-64',
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
