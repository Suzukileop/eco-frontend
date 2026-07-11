'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { PortfolioThemeId } from '@/components/portfolio/portfolio-themes';
import {
  portfolioThemeCssVars,
  portfolioUsesMonochromeChrome,
} from '@/components/portfolio/portfolio-themes';
import type { PortfolioCustomTheme } from '@/components/portfolio/portfolio-custom-themes';
import { customThemeToPickerTheme } from '@/components/portfolio/portfolio-custom-themes';

export function PortfolioThemeRoot({
  themeId,
  customThemes = [],
  monochromeUi = false,
  globalStyle,
  fixedBackgroundStyle,
  suppressDefaultBackground = false,
  children,
}: {
  themeId: PortfolioThemeId;
  customThemes?: PortfolioCustomTheme[];
  /** Persist monochrome chrome across Noir / Blanc duplicates. */
  monochromeUi?: boolean;
  globalStyle?: CSSProperties;
  /** Fixed viewport background image layer (insets applied via top/right/bottom/left). */
  fixedBackgroundStyle?: CSSProperties;
  /** When true, skip the default white page fill (solid color and/or fixed image active). */
  suppressDefaultBackground?: boolean;
  children: ReactNode;
}) {
  const pickerThemes = customThemes.map(customThemeToPickerTheme);
  const mono = portfolioUsesMonochromeChrome(themeId, monochromeUi);
  const useCustomBackground = Boolean(globalStyle) || suppressDefaultBackground || Boolean(fixedBackgroundStyle);

  return (
    <div
      className={`pf-theme-root relative isolate min-h-screen overflow-x-clip ${useCustomBackground ? '' : 'bg-white'}`}
      data-portfolio-theme={themeId}
      data-portfolio-mono={mono ? 'true' : undefined}
      style={{ ...portfolioThemeCssVars(themeId, pickerThemes, monochromeUi), ...globalStyle }}
    >
      {fixedBackgroundStyle ? (
        <div
          aria-hidden
          className="pointer-events-none fixed -z-10 bg-no-repeat"
          style={fixedBackgroundStyle}
        />
      ) : null}
      {children}
    </div>
  );
}
