'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { PortfolioThemeId } from '@/components/portfolio/portfolio-themes';
import {
  portfolioThemeCssVars,
  portfolioUsesMonochromeChrome,
} from '@/components/portfolio/portfolio-themes';
import type { PortfolioCustomTheme } from '@/components/portfolio/portfolio-custom-themes';
import { customThemeToPickerTheme } from '@/components/portfolio/portfolio-custom-themes';
import {
  globalBodyFontRootStyle,
  type PortfolioGlobalBodyFont,
} from '@/components/portfolio/portfolio-global-settings';

export function PortfolioThemeRoot({
  themeId,
  customThemes = [],
  monochromeUi = false,
  bodyFont,
  globalStyle,
  fixedBackgroundStyle,
  patternBackgroundStyle,
  suppressDefaultBackground = false,
  children,
}: {
  themeId: PortfolioThemeId;
  customThemes?: PortfolioCustomTheme[];
  /** Persist monochrome chrome across Noir / Blanc duplicates. */
  monochromeUi?: boolean;
  /** Site-wide portfolio typeface (Google Font / default). */
  bodyFont?: PortfolioGlobalBodyFont;
  globalStyle?: CSSProperties;
  /** Fixed viewport background image layer (insets applied via top/right/bottom/left). */
  fixedBackgroundStyle?: CSSProperties;
  /** Fixed repeating motif layer painted above the page fill / wallpaper. */
  patternBackgroundStyle?: CSSProperties;
  /** When true, skip the default white page fill (solid color and/or fixed image active). */
  suppressDefaultBackground?: boolean;
  children: ReactNode;
}) {
  const pickerThemes = customThemes.map(customThemeToPickerTheme);
  const mono = portfolioUsesMonochromeChrome(themeId, monochromeUi);
  const useCustomBackground =
    Boolean(globalStyle) || suppressDefaultBackground || Boolean(fixedBackgroundStyle);

  /**
   * Keep the solid page color on its own layer (not on the root), so the
   * pattern can sit above the fill and still stay behind all content.
   * Stack (back → front): solid → fixed image → pattern → children.
   */
  const { backgroundColor: solidPageColor, ...rootGlobalStyle } = globalStyle ?? {};
  const hasSolidPageColor =
    typeof solidPageColor === 'string' && solidPageColor.trim().length > 0;
  const bodyFontStyle = globalBodyFontRootStyle(bodyFont);

  return (
    <div
      className={`pf-theme-root relative isolate min-h-screen min-h-[100dvh] overflow-x-clip ${useCustomBackground ? '' : 'bg-white'}`}
      data-portfolio-theme={themeId}
      data-portfolio-mono={mono ? 'true' : undefined}
      data-portfolio-body-font={bodyFont ?? 'plusJakarta'}
      style={{
        ...portfolioThemeCssVars(themeId, pickerThemes, monochromeUi),
        ...bodyFontStyle,
        ...rootGlobalStyle,
      }}
    >
      {hasSolidPageColor ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-30"
          style={{ backgroundColor: solidPageColor }}
        />
      ) : null}
      {fixedBackgroundStyle ? (
        <div
          aria-hidden
          className="pointer-events-none fixed -z-20 bg-no-repeat"
          style={fixedBackgroundStyle}
        />
      ) : null}
      {patternBackgroundStyle ? (
        <div
          aria-hidden
          className="pointer-events-none fixed -z-10"
          style={patternBackgroundStyle}
        />
      ) : null}
      <div className="relative z-0">{children}</div>
    </div>
  );
}
