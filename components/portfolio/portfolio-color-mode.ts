import {
  applyHeroPaletteToPresentation,
  DEFAULT_HERO_PALETTE,
  LIGHT_HERO_PALETTE,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { patchNavPalette } from '@/components/portfolio/portfolio-nav-palette-settings';
import { patchWorkPalette } from '@/components/portfolio/portfolio-work-palette-settings';
import {
  applyHeroPaletteToAbout,
  applyHeroPaletteToContact,
  applyHeroPaletteToExperience,
  applyHeroPaletteToFaq,
  applyHeroPaletteToFooter,
  applyHeroPaletteToServices,
} from '@/components/portfolio/portfolio-section-palette';
import type { PortfolioSettings } from '@/components/portfolio/portfolio-settings-types';

/** Site-wide appearance driven from Global → Theme. */
export type PortfolioColorMode = 'dark' | 'light';

export const PORTFOLIO_COLOR_MODE_OPTIONS: {
  value: PortfolioColorMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'dark',
    label: 'Dark mode',
    description: 'Fond noir, texte clair — palette Hero / Nav sombre.',
  },
  {
    value: 'light',
    label: 'Light mode',
    description: 'Fond blanc cassé, texte sombre — palette Hero / Nav claire.',
  },
];

export function resolveColorModePalette(mode: PortfolioColorMode): PortfolioHeroPalette {
  return mode === 'light' ? { ...LIGHT_HERO_PALETTE } : { ...DEFAULT_HERO_PALETTE };
}

/**
 * Apply dark / light across the whole portfolio:
 * - Hero semantic palette (and every bound hex field)
 * - Navigation palette (same tokens)
 * - Work palette mirror + every other section’s concrete hex fields
 * - Global page fill from Fond (unless a fixed wallpaper is active)
 */
export function applyPortfolioColorMode(
  settings: PortfolioSettings,
  mode: PortfolioColorMode
): PortfolioSettings {
  const palette = resolveColorModePalette(mode);
  const heroBase = {
    ...settings.hero,
    useHeroPalette: true,
    palette,
  };
  const hero = {
    ...heroBase,
    ...applyHeroPaletteToPresentation(heroBase),
    useHeroPalette: true,
  };

  const navigation = {
    ...settings.navigation,
    ...patchNavPalette(settings.navigation, palette),
    useNavPalette: true,
  };

  const global = {
    ...settings.global,
    colorMode: mode,
    backgroundColor: palette.fond,
    // Keep a fixed wallpaper if the creator chose one; otherwise paint Fond.
    ...(settings.global.backgroundImageEnabled
      ? {}
      : { backgroundEnabled: true, backgroundImageEnabled: false }),
  };

  return {
    ...settings,
    global,
    navigation,
    hero,
    work: {
      ...settings.work,
      ...(patchWorkPalette(settings.work, palette) as Partial<(typeof settings)['work']>),
      useHeroPalette: true,
    },
    // Paint concrete hexes immediately — flipping the flag alone left stale light/dark ink on cards.
    services: {
      ...settings.services,
      ...applyHeroPaletteToServices({ ...settings.services, useHeroPalette: true }, palette),
    },
    about: {
      ...settings.about,
      ...applyHeroPaletteToAbout({ ...settings.about, useHeroPalette: true }, palette),
    },
    experience: {
      ...settings.experience,
      ...applyHeroPaletteToExperience({ ...settings.experience, useHeroPalette: true }, palette),
    },
    faq: {
      ...settings.faq,
      ...applyHeroPaletteToFaq({ ...settings.faq, useHeroPalette: true }, palette),
    },
    contact: {
      ...settings.contact,
      ...applyHeroPaletteToContact({ ...settings.contact, useHeroPalette: true }, palette),
    },
    footer: {
      ...settings.footer,
      ...applyHeroPaletteToFooter({ ...settings.footer, useHeroPalette: true }, palette),
    },
  };
}
