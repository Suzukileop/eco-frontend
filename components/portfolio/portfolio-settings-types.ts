import {
  DEFAULT_HERO_PRESENTATION,
  mergeHeroPresentation,
  type PortfolioHeroPresentationSettings,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  DEFAULT_WORK_PRESENTATION,
  mergeWorkPresentation,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_ABOUT_PRESENTATION,
  isIllegibleDarkAboutStatsCard,
  isLegacyDefaultAboutStatsCard,
  mergeAboutPresentation,
  withDefaultAboutStatsCardColors,
  withNoirReadableAboutStatsColors,
  type PortfolioAboutPresentationSettings,
} from '@/components/portfolio/portfolio-about-settings';
import {
  DEFAULT_SERVICES_PRESENTATION,
  mergeServicesPresentation,
  type PortfolioServicesSectionSettings,
} from '@/components/portfolio/portfolio-services-settings';
import {
  DEFAULT_FAQ_PRESENTATION,
  mergeFaqPresentation,
  type PortfolioFaqSectionSettings,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  DEFAULT_EXPERIENCE_PRESENTATION,
  mergeExperiencePresentation,
  migrateExperienceFromLegacyAbout,
  type PortfolioExperienceSectionSettings,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_CONTACT_PRESENTATION,
  mergeContactPresentation,
  type PortfolioContactSectionSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import {
  DEFAULT_FOOTER_PRESENTATION,
  mergeFooterPresentation,
  type PortfolioFooterSectionSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  DEFAULT_PORTFOLIO_THEME_ID,
  type PortfolioThemeId,
} from '@/components/portfolio/portfolio-themes';
import {
  mergeCustomThemes,
  resolvePortfolioThemeId,
  type PortfolioCustomTheme,
} from '@/components/portfolio/portfolio-custom-themes';
import {
  DEFAULT_GLOBAL_SETTINGS,
  mergeGlobalSettings,
  type PortfolioGlobalSettings,
} from '@/components/portfolio/portfolio-global-settings';
import {
  DEFAULT_PORTFOLIO_NAV_ITEM_ICONS,
  DEFAULT_PORTFOLIO_NAV_ITEM_LABELS,
  mergeNavItemIcons,
  mergeNavItemLabels,
  type PortfolioNavItemIcons,
  type PortfolioNavItemLabels,
} from '@/components/portfolio/portfolio-nav-items';

export type PortfolioSettingsSectionId =
  | 'theme'
  | 'navigation'
  | 'hero'
  | 'work'
  | 'services'
  | 'about'
  | 'experience'
  | 'faq'
  | 'contact'
  | 'footer';

export type PortfolioNavPlacement =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-center'
  | 'right-center';

export type PortfolioNavBarDesign = 'classic' | 'rail' | 'dock';

export type PortfolioNavContentMode = 'icons' | 'text' | 'both';

export type PortfolioNavActiveStyle = 'filled-pill' | 'underline' | 'outline' | 'accent-text';

export type PortfolioNavButtonDesign = 'clean' | 'outlined' | 'soft' | 'glow';

export type PortfolioNavDisplayMode = 'always' | 'on-scroll' | 'after-hero';

export type PortfolioNavLabelCase = 'uppercase' | 'titlecase' | 'normal';

/** How wide the nav background stretches. */
export type PortfolioNavBarWidth = 'hug' | 'medium' | 'wide' | 'full';

/** Padding / height of the nav bar shell and items. */
export type PortfolioNavBarThickness = 'sm' | 'md' | 'lg' | 'xl';

/** Distance from the viewport edge (top/bottom/side depending on placement). */
export type PortfolioNavEdgeOffset = 'sm' | 'md' | 'lg' | 'xl';

/** Spacing between nav items. */
export type PortfolioNavItemGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'spread';

/** Inner padding of the nav bar shell (around items). */
export type PortfolioNavBarPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioNavSettings = {
  enabled: boolean;
  /** Default = floating + scroll; per-page = dots pager; pages = one section at a time via nav bar only. */
  navMode: 'default' | 'per-page' | 'pages';
  placement: PortfolioNavPlacement;
  barDesign: PortfolioNavBarDesign;
  contentMode: PortfolioNavContentMode;
  buttonDesign: PortfolioNavButtonDesign;
  activeStyle: PortfolioNavActiveStyle;
  displayMode: PortfolioNavDisplayMode;
  labelCase: PortfolioNavLabelCase;
  barWidth: PortfolioNavBarWidth;
  barThickness: PortfolioNavBarThickness;
  barPadding: PortfolioNavBarPadding;
  edgeOffset: PortfolioNavEdgeOffset;
  itemGap: PortfolioNavItemGap;
  /** Nav bar shell background (classic / rail). */
  barBackgroundColor: string;
  /** Nav bar shell border color (classic / rail). */
  barBorderColor: string;
  /** Nav item icon color. */
  itemIconColor: string;
  /** Nav item label text color. */
  itemTextColor: string;
  /** Nav item button background. */
  itemBackgroundColor: string;
  /** Nav item button border. */
  itemBorderColor: string;
  glassEffect: boolean;
  compactOnMobile: boolean;
  hideWhenSingle: boolean;
  itemLabels: PortfolioNavItemLabels;
  itemIcons: PortfolioNavItemIcons;
};

export type PortfolioSectionCopy = {
  enabled: boolean;
  title: string;
  subtitle: string;
};

export type PortfolioHeroSectionSettings = PortfolioSectionCopy & {
  showTools: boolean;
  showContactCta: boolean;
} & PortfolioHeroPresentationSettings;

export type PortfolioAboutSectionSettings = PortfolioSectionCopy & PortfolioAboutPresentationSettings;

export type PortfolioWorkSectionSettings = PortfolioSectionCopy & PortfolioWorkPresentationSettings;

export type { PortfolioServicesSectionSettings, PortfolioFaqSectionSettings, PortfolioContactSectionSettings, PortfolioExperienceSectionSettings };

export type { PortfolioGlobalSettings };

export type PortfolioFooterSettings = PortfolioFooterSectionSettings;

export type PortfolioSettings = {
  themeId: PortfolioThemeId;
  /** User-created themes (draft + saved). Only these can be deleted. */
  customThemes: PortfolioCustomTheme[];
  global: PortfolioGlobalSettings;
  navigation: PortfolioNavSettings;
  hero: PortfolioHeroSectionSettings;
  work: PortfolioWorkSectionSettings;
  services: PortfolioServicesSectionSettings;
  about: PortfolioAboutSectionSettings;
  experience: PortfolioExperienceSectionSettings;
  faq: PortfolioFaqSectionSettings;
  contact: PortfolioContactSectionSettings;
  footer: PortfolioFooterSettings;
};

export type PortfolioSettingsSectionMeta = {
  id: PortfolioSettingsSectionId;
  label: string;
  description: string;
};

export const PORTFOLIO_SETTINGS_SECTIONS: PortfolioSettingsSectionMeta[] = [
  {
    id: 'theme',
    label: 'Global',
    description: 'Theme palette, page background, section order, title alignment, and layout width.',
  },
  {
    id: 'navigation',
    label: 'Navigation',
    description: 'Floating section menu — placement, bar design, icons vs text, and visibility.',
  },
  {
    id: 'hero',
    label: 'Hero',
    description: 'Opening section — headline, pitch, tools, and primary contact button.',
  },
  {
    id: 'work',
    label: 'Portfolio',
    description: 'Featured projects shown as large editorial work cards.',
  },
  {
    id: 'services',
    label: 'Services & skills',
    description: 'Skills marquee and services carousel.',
  },
  {
    id: 'about',
    label: 'About',
    description: 'Stats, why work with me, and profile details.',
  },
  {
    id: 'experience',
    label: 'Experience',
    description: 'Career timeline, years summary, and role entries.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'Accordion with common questions and answers.',
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Email, phone, social links, and project CTA.',
  },
  {
    id: 'footer',
    label: 'Footer',
    description: 'Copyright, marketplace link, and quick contact links.',
  },
];

export const PORTFOLIO_SETTINGS_STORAGE_KEY = 'portfolio-section-settings-v1';

export function createDefaultPortfolioSettings(): PortfolioSettings {
  return {
    themeId: DEFAULT_PORTFOLIO_THEME_ID,
    customThemes: [],
    global: { ...DEFAULT_GLOBAL_SETTINGS },
    navigation: {
      enabled: true,
      navMode: 'default',
      placement: 'top-center',
      barDesign: 'classic',
      contentMode: 'icons',
      buttonDesign: 'clean',
      activeStyle: 'filled-pill',
      displayMode: 'always',
      labelCase: 'uppercase',
      barWidth: 'hug',
      barThickness: 'md',
      barPadding: 'md',
      edgeOffset: 'md',
      itemGap: 'sm',
      barBackgroundColor: '#ffffff',
      barBorderColor: '#e5e5e5',
      itemIconColor: '#525252',
      itemTextColor: '#525252',
      itemBackgroundColor: '#ffffff',
      itemBorderColor: '#e5e5e5',
      glassEffect: true,
      compactOnMobile: false,
      hideWhenSingle: true,
      itemLabels: { ...DEFAULT_PORTFOLIO_NAV_ITEM_LABELS },
      itemIcons: { ...DEFAULT_PORTFOLIO_NAV_ITEM_ICONS },
    },
    hero: {
      enabled: true,
      title: 'Hero',
      subtitle: '',
      showTools: true,
      showContactCta: true,
      ...DEFAULT_HERO_PRESENTATION,
    },
    work: {
      enabled: true,
      title: 'PORTFOLIO',
      subtitle:
        'A selection of projects that showcase my work, process, and the tools I use to bring ideas to life.',
      ...DEFAULT_WORK_PRESENTATION,
    },
    services: {
      enabled: true,
      title: 'Services & skills',
      subtitle:
        'Hands-on expertise and tailored services — built to take your ideas from brief to something you\u2019re proud to share.',
      ...DEFAULT_SERVICES_PRESENTATION,
    },
    about: {
      enabled: true,
      title: 'About',
      subtitle: 'Strengths, background, and the practical details behind how I work.',
      ...DEFAULT_ABOUT_PRESENTATION,
    },
    experience: {
      enabled: true,
      title: 'Experience',
      subtitle: 'Roles, milestones, and the path that shaped my craft.',
      ...DEFAULT_EXPERIENCE_PRESENTATION,
    },
    faq: {
      enabled: true,
      title: 'FAQ',
      subtitle: 'Quick answers to common questions before we start working together.',
      ...DEFAULT_FAQ_PRESENTATION,
    },
    contact: {
      enabled: true,
      title: 'Contact',
      subtitle:
        'Should you have a project in mind, I would be pleased to hear from you to discuss your objectives.',
      ...DEFAULT_CONTACT_PRESENTATION,
    },
    footer: {
      enabled: true,
      ...DEFAULT_FOOTER_PRESENTATION,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mergeSectionCopy(
  base: PortfolioSectionCopy,
  patch: unknown
): PortfolioSectionCopy {
  if (!isRecord(patch)) return base;
  return {
    enabled: typeof patch.enabled === 'boolean' ? patch.enabled : base.enabled,
    title: typeof patch.title === 'string' ? patch.title : base.title,
    subtitle: typeof patch.subtitle === 'string' ? patch.subtitle : base.subtitle,
  };
}

function migrateNavBarDesign(stored: Record<string, unknown>): PortfolioNavBarDesign | undefined {
  if (stored.barDesign === 'classic' || stored.barDesign === 'rail' || stored.barDesign === 'dock') {
    return stored.barDesign;
  }
  const legacy = stored.containerStyle;
  if (legacy === 'pill') return 'classic';
  if (legacy === 'bar') return 'rail';
  if (legacy === 'minimal') return 'dock';
  return undefined;
}

function mergeNavSettings(base: PortfolioNavSettings, patch: unknown): PortfolioNavSettings {
  if (!isRecord(patch)) return base;

  const placement = patch.placement;
  const barDesign = patch.barDesign ?? (isRecord(patch) ? migrateNavBarDesign(patch) : undefined);
  const contentMode = patch.contentMode;
  const buttonDesign = patch.buttonDesign;
  const activeStyle = patch.activeStyle;
  const displayMode = patch.displayMode;
  const labelCase = patch.labelCase;
  const barWidth = patch.barWidth;
  const barThickness = patch.barThickness;
  const barPadding = patch.barPadding;
  const edgeOffset = patch.edgeOffset;
  const itemGap = patch.itemGap;

  return {
    enabled: typeof patch.enabled === 'boolean' ? patch.enabled : base.enabled,
    navMode:
      patch.navMode === 'default' || patch.navMode === 'per-page' || patch.navMode === 'pages'
        ? patch.navMode
        : base.navMode ?? 'default',
    placement:
      placement === 'top-center' ||
      placement === 'top-left' ||
      placement === 'top-right' ||
      placement === 'bottom-center' ||
      placement === 'bottom-left' ||
      placement === 'bottom-right' ||
      placement === 'left-center' ||
      placement === 'right-center'
        ? placement
        : base.placement,
    barDesign:
      barDesign === 'classic' || barDesign === 'rail' || barDesign === 'dock' ? barDesign : base.barDesign,
    contentMode:
      contentMode === 'icons' || contentMode === 'text' || contentMode === 'both'
        ? contentMode
        : isRecord(patch) && !('contentMode' in patch) && Object.keys(patch).length > 0
          ? 'text'
          : base.contentMode,
    buttonDesign:
      buttonDesign === 'clean' ||
      buttonDesign === 'outlined' ||
      buttonDesign === 'soft' ||
      buttonDesign === 'glow'
        ? buttonDesign
        : base.buttonDesign,
    activeStyle:
      activeStyle === 'filled-pill' ||
      activeStyle === 'underline' ||
      activeStyle === 'outline' ||
      activeStyle === 'accent-text'
        ? activeStyle
        : base.activeStyle,
    displayMode:
      displayMode === 'always' || displayMode === 'on-scroll' || displayMode === 'after-hero'
        ? displayMode
        : base.displayMode,
    labelCase:
      labelCase === 'uppercase' || labelCase === 'titlecase' || labelCase === 'normal'
        ? labelCase
        : base.labelCase,
    barWidth:
      barWidth === 'hug' || barWidth === 'medium' || barWidth === 'wide' || barWidth === 'full'
        ? barWidth
        : base.barWidth,
    barThickness:
      barThickness === 'sm' || barThickness === 'md' || barThickness === 'lg' || barThickness === 'xl'
        ? barThickness
        : base.barThickness,
    barPadding:
      barPadding === 'none' ||
      barPadding === 'sm' ||
      barPadding === 'md' ||
      barPadding === 'lg' ||
      barPadding === 'xl'
        ? barPadding
        : base.barPadding,
    edgeOffset:
      edgeOffset === 'sm' || edgeOffset === 'md' || edgeOffset === 'lg' || edgeOffset === 'xl'
        ? edgeOffset
        : base.edgeOffset,
    itemGap:
      itemGap === 'none' ||
      itemGap === 'sm' ||
      itemGap === 'md' ||
      itemGap === 'lg' ||
      itemGap === 'xl' ||
      itemGap === 'spread'
        ? itemGap
        : base.itemGap,
    barBackgroundColor:
      typeof patch.barBackgroundColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.barBackgroundColor.trim())
        ? patch.barBackgroundColor.trim()
        : base.barBackgroundColor,
    barBorderColor:
      typeof patch.barBorderColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.barBorderColor.trim())
        ? patch.barBorderColor.trim()
        : base.barBorderColor,
    itemIconColor:
      typeof patch.itemIconColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.itemIconColor.trim())
        ? patch.itemIconColor.trim()
        : base.itemIconColor,
    itemTextColor:
      typeof patch.itemTextColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.itemTextColor.trim())
        ? patch.itemTextColor.trim()
        : base.itemTextColor,
    itemBackgroundColor:
      typeof patch.itemBackgroundColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.itemBackgroundColor.trim())
        ? patch.itemBackgroundColor.trim()
        : base.itemBackgroundColor,
    itemBorderColor:
      typeof patch.itemBorderColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.itemBorderColor.trim())
        ? patch.itemBorderColor.trim()
        : base.itemBorderColor,
    glassEffect: typeof patch.glassEffect === 'boolean' ? patch.glassEffect : base.glassEffect,
    compactOnMobile:
      typeof patch.compactOnMobile === 'boolean' ? patch.compactOnMobile : base.compactOnMobile,
    hideWhenSingle:
      typeof patch.hideWhenSingle === 'boolean' ? patch.hideWhenSingle : base.hideWhenSingle,
    itemLabels: mergeNavItemLabels(base.itemLabels, patch.itemLabels),
    itemIcons: mergeNavItemIcons(base.itemIcons, patch.itemIcons),
  };
}

export function mergePortfolioSettings(stored: unknown): PortfolioSettings {
  const defaults = createDefaultPortfolioSettings();
  if (!isRecord(stored)) return defaults;

  const customThemes = mergeCustomThemes(stored.customThemes).map((theme) => ({
    ...theme,
    // Re-normalize nested snapshot so old drafts stay compatible.
    snapshot: (() => {
      const nested = mergePortfolioSettings({
        ...theme.snapshot,
        themeId: theme.id,
        customThemes: [],
      });
      const { themeId, customThemes, ...rest } = nested;
      void themeId;
      void customThemes;
      return rest;
    })(),
  }));

  const themeId = resolvePortfolioThemeId(stored.themeId, customThemes);
  const merged: PortfolioSettings = {
    themeId,
    customThemes,
    global: (() => {
      const nextGlobal = mergeGlobalSettings(defaults.global, stored.global);
      const storedGlobal = isRecord(stored.global) ? stored.global : null;
      // Legacy: vertical mode saved before per-section picker existed → all sections targeted once.
      if (
        storedGlobal &&
        storedGlobal.titleOrientation === 'vertical' &&
        storedGlobal.titleOrientationTargets == null
      ) {
        return {
          ...nextGlobal,
          titleOrientationTargets: {
            work: true,
            services: true,
            skills: true,
            about: true,
            experience: true,
            faq: true,
            contact: true,
          },
        };
      }
      return nextGlobal;
    })(),
    navigation: mergeNavSettings(defaults.navigation, stored.navigation),
    hero: {
      ...mergeSectionCopy(defaults.hero, stored.hero),
      showTools: isRecord(stored.hero) && typeof stored.hero.showTools === 'boolean'
        ? stored.hero.showTools
        : defaults.hero.showTools,
      showContactCta: isRecord(stored.hero) && typeof stored.hero.showContactCta === 'boolean'
        ? stored.hero.showContactCta
        : defaults.hero.showContactCta,
      ...mergeHeroPresentation(defaults.hero, stored.hero),
    },
    work: {
      ...mergeSectionCopy(defaults.work, stored.work),
      ...mergeWorkPresentation(defaults.work, stored.work),
    },
    services: {
      ...mergeSectionCopy(defaults.services, stored.services),
      ...mergeServicesPresentation(defaults.services, stored.services),
    },
    about: {
      ...mergeSectionCopy(defaults.about, stored.about),
      ...mergeAboutPresentation(defaults.about, stored.about),
    },
    experience: (() => {
      if (isRecord(stored.experience)) {
        return {
          ...mergeSectionCopy(defaults.experience, stored.experience),
          ...mergeExperiencePresentation(defaults.experience, stored.experience),
        };
      }
      return migrateExperienceFromLegacyAbout(stored.about);
    })(),
    faq: {
      ...mergeSectionCopy(defaults.faq, stored.faq),
      ...mergeFaqPresentation(defaults.faq, stored.faq),
    },
    contact: {
      ...mergeSectionCopy(defaults.contact, stored.contact),
      ...mergeContactPresentation(defaults.contact, stored.contact),
    },
    footer: {
      enabled: isRecord(stored.footer) && typeof stored.footer.enabled === 'boolean'
        ? stored.footer.enabled
        : defaults.footer.enabled,
      ...mergeFooterPresentation(defaults.footer, stored.footer),
    },
  };

  // Editorial (and non-mono) portfolios: migrate old black stats cards → gray + black text.
  // Skip Noir / monochrome copies so their ink cards stay intentional.
  if (!merged.global.monochromeUi && isLegacyDefaultAboutStatsCard(merged.about)) {
    merged.about = withDefaultAboutStatsCardColors(merged.about);
  }

  // Noir / mono: fix dark-on-dark stats (e.g. rating accent #171717 on ink cards).
  if (
    (merged.global.monochromeUi || themeId === 'noir') &&
    isIllegibleDarkAboutStatsCard(merged.about)
  ) {
    merged.about = withNoirReadableAboutStatsColors(merged.about);
  }

  return merged;
}

export function portfolioSettingsStorageKey(creatorId: string): string {
  return `${PORTFOLIO_SETTINGS_STORAGE_KEY}:${creatorId}`;
}
