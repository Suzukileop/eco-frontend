'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CreatorProfileViewTracker } from '@/components/marketplace/CreatorProfileViewTracker';
import { formatAvailabilityHours, parseAvailabilityHours } from '@/lib/availabilityHours';
import {
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import {
  portfolioUsesMonochromeChrome,
  portfolioMonochromeSocialBrandClass,
} from '@/components/portfolio/portfolio-themes';
import { SOCIAL_PLATFORMS } from '@/types/ecosystem';
import type { MarketplaceContentItem, MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { PortfolioHeroSection } from '@/components/portfolio/PortfolioHeroSection';
import { PortfolioSectionShell } from '@/components/portfolio/PortfolioSectionShell';
import { PortfolioSettingsButton, PortfolioSettingsModal } from '@/components/portfolio/PortfolioSettingsModal';
import { PortfolioThemeRoot } from '@/components/portfolio/PortfolioThemeRoot';
import { usePortfolioSettings } from '@/components/portfolio/use-portfolio-settings';
import {
  EditorialContactSection,
  EditorialExperienceList,
  EditorialExperienceYears,
  EditorialFaqList,
  EditorialPortfolioFooter,
  EditorialSectionStickyHeader,
  EditorialServicesSkillsSection,
  EditorialServicesCarousel,
  EditorialSkillShowcase,
  EditorialSideInfoPanel,
  EditorialStatGrid,
  EditorialWhyMeHeading,
  EditorialWhyMeList,
  EditorialWorkGallery,
  MarketplaceProfileLink,
  portfolioEditorialShellClass,
  PortfolioFloatingNav,
  PortfolioPerPageNav,
  SIDE_INFO_ICONS,
} from '@/components/portfolio/portfolio-section-primitives';

import { pickHeroPresentationSettings, resolveHeroTools } from '@/components/portfolio/portfolio-hero-settings';
import {
  pickWorkPresentationSettings,
  resolveWorkSectionSubtitle,
  resolveWorkSectionTitle,
  workHeaderFontClass,
  workHeaderFontStyle,
  workSubtitleColorStyle,
  workTitleColorStyle,
} from '@/components/portfolio/portfolio-work-settings';
import {
  aboutHeaderFontClass,
  aboutHeaderFontStyle,
  aboutMainGridClass,
  aboutSubtitleColorStyle,
  aboutTitleColorStyle,
  filterAboutStats,
  isAboutSideInfoItemVisible,
  pickAboutPresentationSettings,
  resolveAboutSectionSubtitle,
  resolveAboutSectionTitle,
} from '@/components/portfolio/portfolio-about-settings';
import {
  pickServicesPresentationSettings,
  resolveServicesSectionSubtitle,
  resolveServicesSectionTitle,
  servicesHeaderFontClass,
  servicesHeaderFontStyle,
  servicesSubtitleColorStyle,
  servicesTitleColorStyle,
} from '@/components/portfolio/portfolio-services-settings';
import {
  resolveDistinctBlockSectionSubtitle,
  resolveDistinctBlockSectionTitle,
  resolvePortfolioContentSectionOrder,
  resolveServicesBlockPresentation,
  servicesUsesDistinctSections,
} from '@/components/portfolio/portfolio-services-block-settings';
import {
  pickFaqPresentationSettings,
  resolveFaqSectionSubtitle,
  resolveFaqSectionTitle,
  faqHeaderFontClass,
  faqHeaderFontStyle,
  faqListPlacementClass,
  faqListMaxWidthClass,
  faqSubtitleColorStyle,
  faqTitleColorStyle,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  pickExperiencePresentationSettings,
  resolveExperienceSectionSubtitle,
  resolveExperienceSectionTitle,
  experienceHeaderFontClass,
  experienceHeaderFontStyle,
  experienceSubtitleColorStyle,
  experienceTitleColorStyle,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  pickContactPresentationSettings,
  resolveContactSectionSubtitle,
  resolveContactSectionTitle,
  contactHeaderFontClass,
  contactHeaderFontStyle,
  contactSubtitleColorStyle,
  contactTitleColorStyle,
} from '@/components/portfolio/portfolio-contact-settings';
import { pickFooterPresentationSettings } from '@/components/portfolio/portfolio-footer-settings';
import {
  resolveNavItemLabel,
  type PortfolioNavSectionKey,
  type PortfolioNavIconVariant,
} from '@/components/portfolio/portfolio-nav-items';
import {
  globalBackgroundStyle,
  globalContentWidthClass,
  globalFixedBackgroundImageStyle,
  globalSectionTitleTopClass,
  hasGlobalPageBackground,
  hasGlobalSolidBackground,
  resolveGlobalSectionSubtitleTypography,
  resolveGlobalSectionTitleChrome,
  resolveGlobalSectionTitleTypography,
  resolveSectionHeaderAlign,
  resolveSectionTitleOrientation,
} from '@/components/portfolio/portfolio-global-settings';
import { motionProfileEnablesHeroGeomFade } from '@/components/portfolio/portfolio-motion-settings';

type PublicCreatorPortfolioPageProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
  isAuthenticated: boolean;
  locationLabel: string | null;
  portfolioPosts?: MarketplaceContentItem[];
};

function socialLabel(platform: string): string {
  return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}

function formatMemberSince(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function splitDisplayName(name: string): { lead: string; accent: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { lead: name.trim(), accent: '' };
  const accent = parts.pop() ?? '';
  return { lead: parts.join(' '), accent };
}

function resolvePrimaryLink(profile: MarketplaceCreatorPublicProfile): { label: string; url: string } | null {
  const first = profile.profileLinks?.[0];
  if (first?.url?.trim()) {
    return { label: first.label?.trim() || 'Contact me', url: first.url.trim() };
  }
  if (profile.ctaUrl?.trim()) {
    return { label: profile.ctaLabel?.trim() || 'Contact me', url: profile.ctaUrl.trim() };
  }
  if (profile.contactEmail?.trim()) {
    return { label: 'Start a project', url: `mailto:${profile.contactEmail.trim()}` };
  }
  return null;
}

function resolveDisplayLinks(profile: MarketplaceCreatorPublicProfile) {
  if (profile.profileLinks && profile.profileLinks.length > 0) {
    return profile.profileLinks.filter((link) => link.url.trim());
  }
  const legacy: Array<{ id: string; label: string; url: string; type: string; platform?: string | null }> = [];
  if (profile.websiteUrl?.trim()) {
    legacy.push({ id: 'website', label: 'Website', url: profile.websiteUrl.trim(), type: 'WEBSITE' });
  }
  if (profile.ctaUrl?.trim()) {
    legacy.push({
      id: 'cta',
      label: profile.ctaLabel?.trim() || 'Contact me',
      url: profile.ctaUrl.trim(),
      type: 'CTA',
    });
  }
  if (profile.socialLinks) {
    for (const [platform, url] of Object.entries(profile.socialLinks)) {
      if (url.trim()) {
        legacy.push({ id: platform, label: socialLabel(platform), url, type: 'SOCIAL', platform });
      }
    }
  }
  return legacy;
}

function normalizeContactUrl(url: string): string {
  return url.trim().toLowerCase().replace(/\/$/, '');
}

function dedupeContactLinks(links: ReturnType<typeof resolveDisplayLinks>) {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = normalizeContactUrl(link.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildHeroDescription(
  profile: MarketplaceCreatorPublicProfile,
  locationLabel: string | null
): string {
  if (profile.bio?.trim()) {
    const text = profile.bio.trim().replace(/\s+/g, ' ');
    return text.length > 240 ? `${text.slice(0, 237)}…` : text;
  }

  const parts: string[] = [];
  if (profile.yearsOfExperience != null && profile.yearsOfExperience > 0) {
    parts.push(
      `${profile.yearsOfExperience} an${profile.yearsOfExperience > 1 ? 's' : ''} d'expérience`
    );
  }
  if (locationLabel) parts.push(`basé à ${locationLabel}`);
  return parts.join(' · ') || 'Découvrez mon travail et contactez-moi pour collaborer.';
}

function resolveHeroSocialLinks(
  profile: MarketplaceCreatorPublicProfile,
  displayLinks: ReturnType<typeof resolveDisplayLinks>
) {
  const fromProfileLinks = displayLinks
    .filter((link) => link.type === 'SOCIAL' && link.url.trim())
    .map((link) => ({
      id: link.id,
      platform: ('platform' in link ? link.platform : link.label) ?? link.label,
      url: link.url.trim(),
      label: link.label,
    }));

  if (fromProfileLinks.length > 0) return fromProfileLinks;

  if (!profile.socialLinks) return [];

  return Object.entries(profile.socialLinks)
    .filter(([, url]) => url?.trim())
    .map(([platform, url]) => ({
      id: platform,
      platform,
      url: url.trim(),
      label: socialLabel(platform),
    }));
}

function resolveExactContentCount(profile: MarketplaceCreatorPublicProfile): number | null {
  if (profile.contentCount != null && profile.contentCount > 0) {
    return profile.contentCount;
  }
  return null;
}

function buildHeroStats(
  profile: MarketplaceCreatorPublicProfile,
  languageCount: number
): Array<{ value: string; label: string }> {
  const stats: Array<{ value: string; label: string }> = [];
  if (profile.yearsOfExperience != null && profile.yearsOfExperience > 0) {
    stats.push({ value: `${profile.yearsOfExperience}+`, label: 'Years exp.' });
  }
  const contentCount = resolveExactContentCount(profile);
  if (contentCount != null && contentCount > 0) {
    stats.push({ value: String(contentCount), label: 'Projects' });
  }
  if (languageCount > 0) {
    stats.push({ value: String(languageCount), label: 'Languages' });
  } else if (profile.followerCount != null && profile.followerCount > 0) {
    stats.push({ value: `${profile.followerCount}+`, label: 'Followers' });
  } else if (profile.averageRating != null) {
    stats.push({ value: profile.averageRating.toFixed(1), label: 'Rating' });
  }
  return stats.slice(0, 3);
}

function buildStats(
  profile: MarketplaceCreatorPublicProfile,
  languageCount: number
): Array<{ value: string; label: string }> {
  const stats: Array<{ value: string; label: string }> = [];
  if (profile.yearsOfExperience != null && profile.yearsOfExperience > 0) {
    stats.push({ value: `${profile.yearsOfExperience}+`, label: 'Years' });
  }
  const contentCount = resolveExactContentCount(profile);
  if (contentCount != null && contentCount > 0) {
    stats.push({ value: String(contentCount), label: 'Content' });
  }
  if (languageCount > 0) {
    stats.push({ value: String(languageCount), label: 'Languages' });
  }
  if (profile.averageRating != null) {
    stats.push({ value: profile.averageRating.toFixed(1), label: 'Rating' });
  }
  return stats;
}

export function PublicCreatorPortfolioPage({
  creatorId,
  profile,
  isAuthenticated,
  locationLabel,
  portfolioPosts,
}: PublicCreatorPortfolioPageProps) {
  const { user, isLoading: authLoading } = useAuth();
  const isPortfolioOwner = !authLoading && user?.id === creatorId;
  const [profileVisits, setProfileVisits] = useState<number>(profile.profileVisits ?? 0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    settings,
    updateSection,
    resetSettings,
    resetBuiltinTheme,
    setThemeId,
    updateNavigation,
    updateGlobal,
    flushPendingSave,
    saveCustomTheme,
    renameCustomTheme,
    duplicateTheme,
    deleteCustomTheme,
  } =
    usePortfolioSettings(creatorId, {
      initialSettings: profile.portfolioSettings,
      canEdit: isPortfolioOwner,
    });

  const workItems = portfolioPosts ?? profile.portfolioPosts ?? [];
  const whyMeBlocks = profile.whyMeBlocks ?? [];
  const experienceBlocks = profile.experienceBlocks ?? [];
  const strengths = useMemo(
    () => profile.strengthsToolsMastered ?? [],
    [profile.strengthsToolsMastered]
  );
  const services = profile.profileServices ?? [];
  const faqItems = profile.faqItems ?? [];
  const displayLinks = resolveDisplayLinks(profile);
  const uniqueContactLinks = useMemo(() => dedupeContactLinks(displayLinks), [displayLinks]);
  const primaryLink = resolvePrimaryLink(profile);
  const legacyLanguages = profile.languages?.trim();
  const memberSinceLabel = formatMemberSince(profile.memberSince);
  const availabilityDisplay = profile.availabilityHours?.trim()
    ? formatAvailabilityHours(parseAvailabilityHours(profile.availabilityHours), profile.timezoneId)
    : null;
  const languageList = useMemo(() => {
    const spokenLanguages = profile.spokenLanguages ?? [];
    return spokenLanguages.length > 0
      ? spokenLanguages
      : legacyLanguages
        ? legacyLanguages.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
  }, [profile.spokenLanguages, legacyLanguages]);
  const languageCount = languageList.length;

  const { lead: nameLead, accent: nameAccent } = splitDisplayName(profile.fullName);
  const heroDescription = buildHeroDescription(profile, locationLabel);
  const heroStats = buildHeroStats(profile, languageCount);
  const rawAboutStats = buildStats(profile, languageCount);

  const hasServicesSection = services.length > 0 || strengths.length > 0;
  const hasAboutSection = Boolean(
    whyMeBlocks.length > 0 ||
      rawAboutStats.length > 0 ||
      languageCount > 0 ||
      profile.gender?.trim() ||
      memberSinceLabel ||
      profile.responseTimeLabel?.trim() ||
      locationLabel
  );
  const hasExperienceSection = experienceBlocks.length > 0 || profile.yearsOfExperience != null;
  const hasFaqSection = faqItems.length > 0;
  const hasContactSection = Boolean(
    profile.contactEmail?.trim() ||
      profile.phone?.trim() ||
      locationLabel ||
      displayLinks.length > 0 ||
      primaryLink
  );

  const socialLinks = useMemo(
    () => resolveHeroSocialLinks(profile, displayLinks),
    [profile, displayLinks]
  );

  const showWorkSection = workItems.length > 0 && settings.work.enabled;
  const showServicesSection = hasServicesSection && settings.services.enabled;
  const showAboutSection = hasAboutSection && settings.about.enabled;
  const showExperienceSection = hasExperienceSection && settings.experience.enabled;
  const showFaqSection = hasFaqSection && settings.faq.enabled;
  const showContactSectionResolved = hasContactSection && settings.contact.enabled;

  const heroTools = useMemo(
    () => resolveHeroTools(strengths, settings.hero.selectedTools),
    [strengths, settings.hero.selectedTools]
  );

  const heroPresentation = useMemo(
    () => pickHeroPresentationSettings(settings.hero),
    [settings.hero]
  );
  const workPresentation = useMemo(
    () => pickWorkPresentationSettings(settings.work),
    [settings.work]
  );
  const workSectionTitle = useMemo(
    () => resolveWorkSectionTitle(settings.work),
    [settings.work]
  );
  const workSectionSubtitle = useMemo(
    () => resolveWorkSectionSubtitle(settings.work),
    [settings.work]
  );
  const aboutPresentation = useMemo(
    () => pickAboutPresentationSettings(settings.about),
    [settings.about]
  );
  const stats = useMemo(
    () => filterAboutStats(rawAboutStats, aboutPresentation),
    [rawAboutStats, aboutPresentation]
  );
  const aboutSectionTitle = useMemo(
    () => resolveAboutSectionTitle(settings.about),
    [settings.about]
  );
  const aboutSectionSubtitle = useMemo(
    () => resolveAboutSectionSubtitle(settings.about),
    [settings.about]
  );
  const experiencePresentation = useMemo(
    () => pickExperiencePresentationSettings(settings.experience),
    [settings.experience]
  );
  const experienceSectionTitle = useMemo(
    () => resolveExperienceSectionTitle(settings.experience),
    [settings.experience]
  );
  const experienceSectionSubtitle = useMemo(
    () => resolveExperienceSectionSubtitle(settings.experience),
    [settings.experience]
  );
  const servicesPresentation = useMemo(
    () => pickServicesPresentationSettings(settings.services),
    [settings.services]
  );
  const isDistinctServicesOrganization = servicesUsesDistinctSections(
    servicesPresentation.sectionOrganization
  );
  const contentSectionOrder = useMemo(
    () =>
      resolvePortfolioContentSectionOrder(
        settings.global.sectionOrder,
        servicesPresentation.sectionOrganization
      ),
    [settings.global.sectionOrder, servicesPresentation.sectionOrganization]
  );
  const sectionVisibility = useMemo(
    () => ({
      work: showWorkSection,
      services:
        showServicesSection &&
        (!isDistinctServicesOrganization || servicesPresentation.showServices),
      skills:
        showServicesSection &&
        isDistinctServicesOrganization &&
        servicesPresentation.showSkills &&
        strengths.length > 0,
      about: showAboutSection,
      experience: showExperienceSection,
      faq: showFaqSection,
      contact: showContactSectionResolved,
    }),
    [
      showWorkSection,
      showServicesSection,
      isDistinctServicesOrganization,
      servicesPresentation.showServices,
      servicesPresentation.showSkills,
      strengths.length,
      showAboutSection,
      showExperienceSection,
      showFaqSection,
      showContactSectionResolved,
    ]
  );
  const servicesSectionTitle = useMemo(
    () => resolveServicesSectionTitle(settings.services),
    [settings.services]
  );
  const servicesSectionSubtitle = useMemo(
    () => resolveServicesSectionSubtitle(settings.services),
    [settings.services]
  );
  const faqPresentation = useMemo(() => pickFaqPresentationSettings(settings.faq), [settings.faq]);
  const faqSectionTitle = useMemo(() => resolveFaqSectionTitle(settings.faq), [settings.faq]);
  const faqSectionSubtitle = useMemo(() => resolveFaqSectionSubtitle(settings.faq), [settings.faq]);
  const contactPresentation = useMemo(
    () => pickContactPresentationSettings(settings.contact),
    [settings.contact]
  );
  const contactSectionTitle = useMemo(
    () => resolveContactSectionTitle(settings.contact),
    [settings.contact]
  );
  const contactSectionSubtitle = useMemo(
    () => resolveContactSectionSubtitle(settings.contact, profile.responseTimeLabel),
    [settings.contact, profile.responseTimeLabel]
  );
  const footerPresentation = useMemo(
    () => pickFooterPresentationSettings(settings.footer),
    [settings.footer]
  );
  const navItems = useMemo(
    () =>
      contentSectionOrder
        .map((sectionKey) => {
          if (!sectionVisibility[sectionKey]) return null;

          return {
            id: sectionKey,
            label: resolveNavItemLabel(sectionKey, settings.navigation.itemLabels),
            icon: settings.navigation.itemIcons[sectionKey],
          };
        })
        .filter(Boolean) as { id: PortfolioNavSectionKey; label: string; icon: PortfolioNavIconVariant }[],
    [
      contentSectionOrder,
      sectionVisibility,
      settings.navigation.itemLabels,
      settings.navigation.itemIcons,
    ]
  );

  const perPageNavItems = useMemo(() => {
    const pages: { id: string; label: string; icon: PortfolioNavIconVariant }[] = [];
    if (settings.hero.enabled) {
      pages.push({ id: 'hero', label: 'Home', icon: 'grid' });
    }
    pages.push(...navItems);
    return pages;
  }, [navItems, settings.hero.enabled]);

  const navMode = settings.navigation.navMode ?? 'default';
  const isPagesMode = navMode === 'pages';
  const [activePageId, setActivePageId] = useState(() => perPageNavItems[0]?.id ?? 'hero');

  useEffect(() => {
    if (!isPagesMode || perPageNavItems.length === 0) return;
    if (!perPageNavItems.some((item) => item.id === activePageId)) {
      setActivePageId(perPageNavItems[0].id);
    }
  }, [isPagesMode, perPageNavItems, activePageId]);

  useEffect(() => {
    if (!isPagesMode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isPagesMode]);

  const lastContentPageId = navItems[navItems.length - 1]?.id;
  const shouldShowFooterOnPage = (pageId: string) => {
    if (!settings.footer.enabled) return false;
    if (sectionVisibility.contact) return pageId === 'contact';
    return Boolean(lastContentPageId) && pageId === lastContentPageId;
  };

  const contactCtaHref =
    primaryLink?.url ??
    (profile.contactEmail?.trim() ? `mailto:${profile.contactEmail.trim()}` : '#footer');
  const heroContactHref = '#footer';

  const isEditorialLayout = true;

  const hasGlobalBg = useMemo(() => hasGlobalPageBackground(settings.global), [settings.global]);
  /** Only a global solid color suppresses per-section backgrounds (image wallpaper does not). */
  const suppressSectionBackgrounds = useMemo(
    () => hasGlobalSolidBackground(settings.global),
    [settings.global]
  );
  const globalBgStyle = useMemo(() => globalBackgroundStyle(settings.global), [settings.global]);
  const globalFixedBgStyle = useMemo(
    () => globalFixedBackgroundImageStyle(settings.global),
    [settings.global]
  );
  const globalWidthClass = useMemo(
    () => globalContentWidthClass(settings.global.contentWidth),
    [settings.global.contentWidth]
  );
  const editorialShellClass = useMemo(
    () => portfolioEditorialShellClass(settings.global.contentGutter),
    [settings.global.contentGutter]
  );
  const titleScrollBehavior = settings.global.titleScroll;
  const motionProfile = settings.global.motionProfile;
  const titleChrome = useMemo(
    () => resolveGlobalSectionTitleChrome(settings.global),
    [settings.global]
  );
  const sectionTopSpacingClass = useMemo(
    () => globalSectionTitleTopClass(settings.global.sectionTitleTopSpacing),
    [settings.global.sectionTitleTopSpacing]
  );

  const workHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.work.headerAlignment),
    [settings.global, settings.work.headerAlignment]
  );
  const servicesHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.services.headerAlignment),
    [settings.global, settings.services.headerAlignment]
  );
  const skillsHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.services.skillsHeader.headerAlignment),
    [settings.global, settings.services.skillsHeader.headerAlignment]
  );
  const distinctServicesHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.services.servicesHeader.headerAlignment),
    [settings.global, settings.services.servicesHeader.headerAlignment]
  );
  const aboutHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.about.headerAlignment),
    [settings.global, settings.about.headerAlignment]
  );
  const faqHeaderAlign = useMemo(() => {
    if (settings.faq.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    const sectionAlign = settings.faq.headerAlignment === 'center' ? 'center' : 'left';
    return resolveSectionHeaderAlign(settings.global, sectionAlign);
  }, [settings.global, settings.faq.headerAlignment]);
  const experienceHeaderAlign = useMemo(() => {
    if (settings.experience.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    const sectionAlign = settings.experience.headerAlignment === 'center' ? 'center' : 'left';
    return resolveSectionHeaderAlign(settings.global, sectionAlign);
  }, [settings.global, settings.experience.headerAlignment]);
  const contactHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.contact.headerAlignment),
    [settings.global, settings.contact.headerAlignment]
  );

  const workHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(settings.global, {
      fontClass: workHeaderFontClass(settings.work.titleFont, 'title'),
      fontStyle: workHeaderFontStyle(settings.work.titleFont),
      colorStyle: workTitleColorStyle(settings.work.titleColor),
    });
    const subtitle = resolveGlobalSectionSubtitleTypography(settings.global, {
      fontClass: workHeaderFontClass(settings.work.subtitleFont, 'subtitle'),
      fontStyle: workHeaderFontStyle(settings.work.subtitleFont),
      colorStyle: workSubtitleColorStyle(settings.work.subtitleColor),
    });
    return { title, subtitle };
  }, [settings.global, settings.work]);

  const servicesHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(settings.global, {
      fontClass: servicesHeaderFontClass(settings.services.titleFont, 'title'),
      fontStyle: servicesHeaderFontStyle(settings.services.titleFont),
      colorStyle: servicesTitleColorStyle(settings.services.titleColor),
    });
    const subtitle = resolveGlobalSectionSubtitleTypography(settings.global, {
      fontClass: servicesHeaderFontClass(settings.services.subtitleFont, 'subtitle'),
      fontStyle: servicesHeaderFontStyle(settings.services.subtitleFont),
      colorStyle: servicesSubtitleColorStyle(settings.services.subtitleColor),
    });
    return { title, subtitle };
  }, [settings.global, settings.services]);

  const skillsHeaderTypography = useMemo(() => {
    const header = settings.services.skillsHeader;
    const title = resolveGlobalSectionTitleTypography(settings.global, {
      fontClass: servicesHeaderFontClass(header.titleFont, 'title'),
      fontStyle: servicesHeaderFontStyle(header.titleFont),
      colorStyle: servicesTitleColorStyle(header.titleColor),
    });
    const subtitle = resolveGlobalSectionSubtitleTypography(settings.global, {
      fontClass: servicesHeaderFontClass(header.subtitleFont, 'subtitle'),
      fontStyle: servicesHeaderFontStyle(header.subtitleFont),
      colorStyle: servicesSubtitleColorStyle(header.subtitleColor),
    });
    return { title, subtitle };
  }, [settings.global, settings.services.skillsHeader]);

  const distinctServicesHeaderTypography = useMemo(() => {
    const header = settings.services.servicesHeader;
    const title = resolveGlobalSectionTitleTypography(settings.global, {
      fontClass: servicesHeaderFontClass(header.titleFont, 'title'),
      fontStyle: servicesHeaderFontStyle(header.titleFont),
      colorStyle: servicesTitleColorStyle(header.titleColor),
    });
    const subtitle = resolveGlobalSectionSubtitleTypography(settings.global, {
      fontClass: servicesHeaderFontClass(header.subtitleFont, 'subtitle'),
      fontStyle: servicesHeaderFontStyle(header.subtitleFont),
      colorStyle: servicesSubtitleColorStyle(header.subtitleColor),
    });
    return { title, subtitle };
  }, [settings.global, settings.services.servicesHeader]);

  const aboutHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(settings.global, {
      fontClass: aboutHeaderFontClass(settings.about.titleFont, 'title'),
      fontStyle: aboutHeaderFontStyle(settings.about.titleFont, settings.about.subtitleSerif, 'title'),
      colorStyle: aboutTitleColorStyle(settings.about.titleColor),
    });
    const subtitle = resolveGlobalSectionSubtitleTypography(settings.global, {
      fontClass: aboutHeaderFontClass(settings.about.subtitleFont, 'subtitle'),
      fontStyle: aboutHeaderFontStyle(settings.about.subtitleFont, settings.about.subtitleSerif, 'subtitle'),
      colorStyle: aboutSubtitleColorStyle(settings.about.subtitleColor),
    });
    return { title, subtitle };
  }, [settings.global, settings.about]);

  const experienceHeaderTypography = useMemo(() => {
    const titleClass = [
      experienceHeaderFontClass(settings.experience.titleFont, 'title'),
      settings.experience.titleUppercase && settings.experience.titleFont !== 'display' ? 'uppercase' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const subtitleClass = [
      experienceHeaderFontClass(settings.experience.subtitleFont, 'subtitle'),
      settings.experience.subtitleUppercase && settings.experience.subtitleFont !== 'display' ? 'uppercase' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const title = resolveGlobalSectionTitleTypography(settings.global, {
      fontClass: titleClass,
      fontStyle: experienceHeaderFontStyle(settings.experience.titleFont),
      colorStyle: experienceTitleColorStyle(settings.experience.titleColor),
    });
    const subtitle = resolveGlobalSectionSubtitleTypography(settings.global, {
      fontClass: subtitleClass,
      fontStyle: experienceHeaderFontStyle(settings.experience.subtitleFont),
      colorStyle: experienceSubtitleColorStyle(settings.experience.subtitleColor),
    });
    return { title, subtitle };
  }, [settings.global, settings.experience]);

  const faqHeaderTypography = useMemo(() => {
    const titleClass = [
      faqHeaderFontClass(settings.faq.titleFont, 'title'),
      settings.faq.titleUppercase && settings.faq.titleFont !== 'display' ? 'uppercase' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const subtitleClass = [
      faqHeaderFontClass(settings.faq.subtitleFont, 'subtitle'),
      settings.faq.subtitleUppercase && settings.faq.subtitleFont !== 'display' ? 'uppercase' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const title = resolveGlobalSectionTitleTypography(settings.global, {
      fontClass: titleClass,
      fontStyle: faqHeaderFontStyle(settings.faq.titleFont),
      colorStyle: faqTitleColorStyle(settings.faq.titleColor),
    });
    const subtitle = resolveGlobalSectionSubtitleTypography(settings.global, {
      fontClass: subtitleClass,
      fontStyle: faqHeaderFontStyle(settings.faq.subtitleFont),
      colorStyle: faqSubtitleColorStyle(settings.faq.subtitleColor),
    });
    return { title, subtitle };
  }, [settings.global, settings.faq]);

  const contactHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(settings.global, {
      fontClass: contactHeaderFontClass(settings.contact.titleFont, 'title'),
      fontStyle: contactHeaderFontStyle(settings.contact.titleFont, settings.contact.subtitleSerif, 'title'),
      colorStyle: contactTitleColorStyle(settings.contact.titleColor),
    });
    const subtitle = resolveGlobalSectionSubtitleTypography(settings.global, {
      fontClass: contactHeaderFontClass(settings.contact.subtitleFont, 'subtitle'),
      fontStyle: contactHeaderFontStyle(
        settings.contact.subtitleFont,
        settings.contact.subtitleSerif,
        'subtitle'
      ),
      colorStyle: contactSubtitleColorStyle(settings.contact.subtitleColor),
    });
    return { title, subtitle };
  }, [settings.global, settings.contact]);

  const aboutSideInfoItems = useMemo(() => {
    const items = [];

    if (locationLabel && isAboutSideInfoItemVisible('location', settings.about)) {
      items.push({
        id: 'location',
        icon: SIDE_INFO_ICONS.location,
        label: 'Location',
        title: locationLabel,
        subtitle:
          profile.timezoneId
            ? `${profile.timezoneId.replace(/_/g, ' ')}${availabilityDisplay ? ' · Available remotely' : ''}`
            : availabilityDisplay
              ? 'Available remotely'
              : undefined,
      });
    }

    if (languageCount > 0 && isAboutSideInfoItemVisible('languages', settings.about)) {
      items.push({
        id: 'languages',
        icon: SIDE_INFO_ICONS.languages,
        label: 'Languages',
        title: languageList.join(' · '),
      });
    }

    if (profile.gender?.trim() && isAboutSideInfoItemVisible('gender', settings.about)) {
      items.push({
        id: 'gender',
        icon: SIDE_INFO_ICONS.gender,
        label: 'Gender',
        title: profile.gender,
      });
    }

    if (memberSinceLabel && isAboutSideInfoItemVisible('member-since', settings.about)) {
      items.push({
        id: 'member-since',
        icon: SIDE_INFO_ICONS.memberSince,
        label: 'Member since',
        title: memberSinceLabel,
      });
    }

    if (
      (profile.isAvailable === false || availabilityDisplay) &&
      isAboutSideInfoItemVisible('availability', settings.about)
    ) {
      items.push({
        id: 'availability',
        icon: SIDE_INFO_ICONS.availability,
        label: 'Availability',
        title: profile.isAvailable === false ? 'Currently unavailable' : (availabilityDisplay ?? ''),
        subtitle:
          profile.isAvailable !== false &&
          profile.responseTimeLabel?.trim() &&
          settings.about.showSidePanelResponseTime
            ? `Reply ${profile.responseTimeLabel.toLowerCase()}`
            : undefined,
      });
    }

    return items;
  }, [
    availabilityDisplay,
    languageCount,
    languageList,
    locationLabel,
    memberSinceLabel,
    profile.gender,
    profile.isAvailable,
    profile.responseTimeLabel,
    profile.timezoneId,
    settings.about,
  ]);

  function renderContentSection(sectionKey: PortfolioNavSectionKey) {
    if (!sectionVisibility[sectionKey]) return null;

    switch (sectionKey) {
      case 'work':
        return (
          <PortfolioSectionShell
            id="work"
            background={workPresentation}
            suppressBackground={suppressSectionBackgrounds}
            topSpacingClass={sectionTopSpacingClass}
            header={
              <EditorialSectionStickyHeader
                title={workSectionTitle}
                subtitle={workSectionSubtitle || undefined}
                trailing={
                  settings.work.showMarketplaceLink ? (
                    <MarketplaceProfileLink creatorId={creatorId} />
                  ) : null
                }
                editorialLayout={isEditorialLayout}
                centered={workHeaderAlign.centered}
                alignRight={workHeaderAlign.alignRight}
                alwaysCentered={workHeaderAlign.alwaysCentered}
                titleTypographyClass={workHeaderTypography.title.className}
                titleTypographyStyle={workHeaderTypography.title.style}
                titleDecorationStyle={workHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={workHeaderTypography.title.customSizing}
                subtitleTypographyClass={workHeaderTypography.subtitle.className}
                subtitleTypographyStyle={workHeaderTypography.subtitle.style}
                subtitleDecorationStyle={workHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={workHeaderTypography.subtitle.customSizing}
                scrollBehavior={titleScrollBehavior}
                orientation={resolveSectionTitleOrientation(settings.global, 'work')}
              />
            }
          >
            <EditorialWorkGallery items={workItems} presentation={workPresentation} motionProfile={motionProfile} />
          </PortfolioSectionShell>
        );
      case 'skills':
        return (
          <PortfolioSectionShell
            id="skills"
            background={servicesPresentation}
            suppressBackground={suppressSectionBackgrounds}
            topSpacingClass={sectionTopSpacingClass}
            header={
              <EditorialSectionStickyHeader
                title={resolveDistinctBlockSectionTitle(settings.services, 'skills')}
                subtitle={resolveDistinctBlockSectionSubtitle(settings.services, 'skills') || undefined}
                editorialLayout={isEditorialLayout}
                centered={skillsHeaderAlign.centered}
                alignRight={skillsHeaderAlign.alignRight}
                alwaysCentered={skillsHeaderAlign.alwaysCentered}
                titleTypographyClass={skillsHeaderTypography.title.className}
                titleTypographyStyle={skillsHeaderTypography.title.style}
                titleDecorationStyle={skillsHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={skillsHeaderTypography.title.customSizing}
                subtitleTypographyClass={skillsHeaderTypography.subtitle.className}
                subtitleTypographyStyle={skillsHeaderTypography.subtitle.style}
                subtitleDecorationStyle={skillsHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={skillsHeaderTypography.subtitle.customSizing}
                scrollBehavior={titleScrollBehavior}
                orientation={resolveSectionTitleOrientation(settings.global, 'skills')}
              />
            }
          >
            <EditorialSkillShowcase
              skills={strengths}
              presentation={resolveServicesBlockPresentation(servicesPresentation, 'skills')}
              motionProfile={motionProfile}
            />
          </PortfolioSectionShell>
        );
      case 'services':
        return (
          <PortfolioSectionShell
            id="services"
            background={servicesPresentation}
            suppressBackground={suppressSectionBackgrounds}
            topSpacingClass={sectionTopSpacingClass}
            header={
              <EditorialSectionStickyHeader
                title={
                  isDistinctServicesOrganization
                    ? resolveDistinctBlockSectionTitle(settings.services, 'services')
                    : servicesSectionTitle
                }
                subtitle={
                  (isDistinctServicesOrganization
                    ? resolveDistinctBlockSectionSubtitle(settings.services, 'services')
                    : servicesSectionSubtitle) || undefined
                }
                trailing={
                  !isDistinctServicesOrganization &&
                  servicesPresentation.showResponseTime &&
                  profile.responseTimeLabel?.trim() ? (
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      Typically replies {profile.responseTimeLabel.toLowerCase()}
                    </p>
                  ) : undefined
                }
                editorialLayout={isEditorialLayout}
                centered={
                  isDistinctServicesOrganization
                    ? distinctServicesHeaderAlign.centered
                    : servicesHeaderAlign.centered
                }
                alignRight={
                  isDistinctServicesOrganization
                    ? distinctServicesHeaderAlign.alignRight
                    : servicesHeaderAlign.alignRight
                }
                alwaysCentered={
                  isDistinctServicesOrganization
                    ? distinctServicesHeaderAlign.alwaysCentered
                    : servicesHeaderAlign.alwaysCentered
                }
                titleTypographyClass={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).title.className
                }
                titleTypographyStyle={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).title.style
                }
                titleDecorationStyle={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).title.decorationStyle
                }
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).title.customSizing
                }
                subtitleTypographyClass={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).subtitle.className
                }
                subtitleTypographyStyle={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).subtitle.style
                }
                subtitleDecorationStyle={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).subtitle.decorationStyle
                }
                customSubtitleSizing={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).subtitle.customSizing
                }
                scrollBehavior={titleScrollBehavior}
                orientation={resolveSectionTitleOrientation(settings.global, 'services')}
              />
            }
          >
            {isDistinctServicesOrganization ? (
              <>
                <EditorialServicesCarousel
                  services={services}
                  presentation={resolveServicesBlockPresentation(servicesPresentation, 'services')}
                  motionProfile={motionProfile}
                />
                {services.length === 0 ? (
                  <p className="mt-8 text-base leading-relaxed text-neutral-500">
                    Contact me to discuss a custom engagement.
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <EditorialServicesSkillsSection
                  skills={strengths}
                  services={services}
                  presentation={servicesPresentation}
                  motionProfile={motionProfile}
                />

                {services.length === 0 && strengths.length > 0 && servicesPresentation.showSkills ? (
                  <p className="mt-8 text-base leading-relaxed text-neutral-500">
                    Contact me to discuss a custom engagement.
                  </p>
                ) : null}
              </>
            )}
          </PortfolioSectionShell>
        );
      case 'about':
        return (
          <PortfolioSectionShell
            id="about"
            background={aboutPresentation}
            suppressBackground={suppressSectionBackgrounds}
            topSpacingClass={sectionTopSpacingClass}
            header={
              <EditorialSectionStickyHeader
                title={aboutSectionTitle}
                subtitle={aboutSectionSubtitle || undefined}
                subtitleSerif={settings.about.subtitleSerif}
                editorialLayout={isEditorialLayout}
                centered={aboutHeaderAlign.centered}
                alignRight={aboutHeaderAlign.alignRight}
                alwaysCentered={aboutHeaderAlign.alwaysCentered}
                titleTypographyClass={aboutHeaderTypography.title.className}
                titleTypographyStyle={aboutHeaderTypography.title.style}
                titleDecorationStyle={aboutHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={aboutHeaderTypography.title.customSizing}
                subtitleTypographyClass={aboutHeaderTypography.subtitle.className}
                subtitleTypographyStyle={aboutHeaderTypography.subtitle.style}
                subtitleDecorationStyle={aboutHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={aboutHeaderTypography.subtitle.customSizing}
                scrollBehavior={titleScrollBehavior}
                orientation={resolveSectionTitleOrientation(settings.global, 'about')}
              />
            }
          >
            {(() => {
              const showPanel = settings.about.showSidePanel && aboutSideInfoItems.length > 0;
              const isFullWidth = settings.about.layoutMode === 'full-width';
              const hasSidebar = showPanel && !isFullWidth;
              const gridClass = aboutMainGridClass(settings.about.layoutMode, hasSidebar);
              const panelPlacement = settings.about.fullWidthPanelPlacement;
              const statsBlockSpacing = settings.about.showStats && stats.length > 0 ? 'mt-14' : 'mt-10';

              const mainColumn = (
                <div className="space-y-12">
                  {settings.about.showWhyMe && whyMeBlocks.length > 0 ? (
                    <div>
                      <EditorialWhyMeHeading presentation={aboutPresentation} />
                      <EditorialWhyMeList blocks={whyMeBlocks} presentation={aboutPresentation} />
                    </div>
                  ) : null}
                </div>
              );

              const sidePanelColumn = showPanel ? (
                <aside className={hasSidebar ? 'lg:sticky lg:top-24 lg:self-start xl:top-24' : undefined}>
                  <EditorialSideInfoPanel
                    items={aboutSideInfoItems}
                    presentation={aboutPresentation}
                    layoutMode={settings.about.layoutMode}
                  />
                </aside>
              ) : null;

              const renderFullWidthPanel = (position: typeof panelPlacement) =>
                isFullWidth && sidePanelColumn && panelPlacement === position ? (
                  <div className={statsBlockSpacing}>{sidePanelColumn}</div>
                ) : null;

              if (isFullWidth) {
                const statsTopSpacing =
                  showPanel && panelPlacement === 'above-stats' ? 'mt-14' : undefined;

                return (
                  <>
                    {renderFullWidthPanel('above-stats')}
                    {settings.about.showStats && stats.length > 0 ? (
                      <div className={statsTopSpacing}>
                        <EditorialStatGrid stats={stats} presentation={aboutPresentation} motionProfile={motionProfile} />
                      </div>
                    ) : null}
                    {renderFullWidthPanel('below-stats')}
                    <div className={statsBlockSpacing}>{mainColumn}</div>
                    {renderFullWidthPanel('below-content')}
                  </>
                );
              }

              return (
                <>
                  {settings.about.showStats && stats.length > 0 ? (
                    <EditorialStatGrid stats={stats} presentation={aboutPresentation} motionProfile={motionProfile} />
                  ) : null}
                  <div className={`grid gap-10 ${gridClass}${statsBlockSpacing ? ` ${statsBlockSpacing}` : ''}`}>
                    {settings.about.layoutMode === 'sidebar-left' ? (
                      <>
                        {sidePanelColumn}
                        {mainColumn}
                      </>
                    ) : (
                      <>
                        {mainColumn}
                        {sidePanelColumn}
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </PortfolioSectionShell>
        );
      case 'experience':
        return (
          <PortfolioSectionShell
            id="experience"
            background={experiencePresentation}
            fitContent
            suppressBackground={suppressSectionBackgrounds}
            topSpacingClass={sectionTopSpacingClass}
            header={
              <EditorialSectionStickyHeader
                title={experienceSectionTitle}
                subtitle={experienceSectionSubtitle || undefined}
                editorialLayout={isEditorialLayout}
                centered={experienceHeaderAlign.centered}
                alignRight={experienceHeaderAlign.alignRight}
                alwaysCentered={experienceHeaderAlign.alwaysCentered}
                className="mb-10 lg:mb-12"
                titleTypographyClass={experienceHeaderTypography.title.className}
                titleTypographyStyle={experienceHeaderTypography.title.style}
                titleDecorationStyle={experienceHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={experienceHeaderTypography.title.customSizing}
                subtitleTypographyClass={experienceHeaderTypography.subtitle.className}
                subtitleTypographyStyle={experienceHeaderTypography.subtitle.style}
                subtitleDecorationStyle={experienceHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={experienceHeaderTypography.subtitle.customSizing}
                scrollBehavior={titleScrollBehavior}
                orientation={resolveSectionTitleOrientation(settings.global, 'experience')}
              />
            }
          >
            {settings.experience.showYears &&
            profile.yearsOfExperience != null &&
            profile.yearsOfExperience > 0 ? (
              <EditorialExperienceYears years={profile.yearsOfExperience} presentation={experiencePresentation} />
            ) : null}
            <EditorialExperienceList blocks={experienceBlocks} presentation={experiencePresentation} />
          </PortfolioSectionShell>
        );
      case 'faq':
        return (
          <PortfolioSectionShell
            id="faq"
            background={faqPresentation}
            fitContent
            suppressBackground={suppressSectionBackgrounds}
            topSpacingClass={sectionTopSpacingClass}
            header={
              <EditorialSectionStickyHeader
                title={faqSectionTitle}
                subtitle={faqSectionSubtitle || undefined}
                editorialLayout={isEditorialLayout}
                centered={faqHeaderAlign.centered}
                alignRight={faqHeaderAlign.alignRight}
                alwaysCentered={faqHeaderAlign.alwaysCentered}
                className="mb-10 lg:mb-12"
                titleTypographyClass={faqHeaderTypography.title.className}
                titleTypographyStyle={faqHeaderTypography.title.style}
                titleDecorationStyle={faqHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={faqHeaderTypography.title.customSizing}
                subtitleTypographyClass={faqHeaderTypography.subtitle.className}
                subtitleTypographyStyle={faqHeaderTypography.subtitle.style}
                subtitleDecorationStyle={faqHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={faqHeaderTypography.subtitle.customSizing}
                scrollBehavior={titleScrollBehavior}
                orientation={resolveSectionTitleOrientation(settings.global, 'faq')}
              />
            }
          >
            <div
              className={`${faqListPlacementClass(faqPresentation.listPlacement)} ${faqListMaxWidthClass(
                faqPresentation.listMaxWidth
              )}`}
            >
              <EditorialFaqList items={faqItems} presentation={faqPresentation} motionProfile={motionProfile} />
            </div>
          </PortfolioSectionShell>
        );
      case 'contact':
        return (
          <EditorialContactSection
            email={profile.contactEmail}
            phone={profile.phone}
            locationLabel={locationLabel}
            links={uniqueContactLinks}
            ctaHref={contactCtaHref}
            responseTimeLabel={profile.responseTimeLabel}
            sectionTitle={contactSectionTitle}
            sectionSubtitle={contactSectionSubtitle || undefined}
            presentation={contactPresentation}
            motionProfile={motionProfile}
            topSpacingClass={sectionTopSpacingClass}
            titleTypographyClass={contactHeaderTypography.title.className}
            titleTypographyStyle={contactHeaderTypography.title.style}
            titleDecorationStyle={contactHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={contactHeaderTypography.title.customSizing}
            subtitleTypographyClass={contactHeaderTypography.subtitle.className}
            subtitleTypographyStyle={contactHeaderTypography.subtitle.style}
            subtitleDecorationStyle={contactHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={contactHeaderTypography.subtitle.customSizing}
            centered={contactHeaderAlign.centered}
            alignRight={contactHeaderAlign.alignRight}
            alwaysCentered={contactHeaderAlign.alwaysCentered}
            suppressBackground={suppressSectionBackgrounds}
            scrollBehavior={titleScrollBehavior}
            orientation={resolveSectionTitleOrientation(settings.global, 'contact')}
            renderSocialIcon={(platform, className) => (
              <SocialPlatformIcon platform={platform} className={className} />
            )}
            socialBrandClass={
              portfolioUsesMonochromeChrome(settings.themeId, settings.global.monochromeUi)
                ? portfolioMonochromeSocialBrandClass
                : socialPlatformBrandClass
            }
            editorialLayout={isEditorialLayout}
            membersOnlyNode={
              !isAuthenticated && profile.membersOnlyContactAvailable ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/portfolio/${creatorId}`)}`}
                    className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  >
                    Sign in
                  </Link>{' '}
                  to see more contact details.
                </p>
              ) : null
            }
          />
        );
      default:
        return null;
    }
  }

  return (
    <PortfolioThemeRoot
      themeId={settings.themeId}
      customThemes={settings.customThemes}
      monochromeUi={settings.global.monochromeUi}
      globalStyle={globalBgStyle}
      fixedBackgroundStyle={globalFixedBgStyle}
      suppressDefaultBackground={hasGlobalBg}
    >
      <CreatorProfileViewTracker creatorId={creatorId} onVisitRecorded={setProfileVisits} />
      {navMode === 'per-page' ? (
        <PortfolioPerPageNav items={perPageNavItems} settings={settings.navigation} />
      ) : (
        <PortfolioFloatingNav
          items={isPagesMode ? perPageNavItems : navItems}
          settings={settings.navigation}
          activeId={isPagesMode ? activePageId : undefined}
          onNavigate={isPagesMode ? setActivePageId : undefined}
        />
      )}

      <div className="pointer-events-none fixed right-4 top-4 z-[60] sm:right-6 sm:top-5">
        {isPortfolioOwner ? (
          <div className="pointer-events-auto">
            <PortfolioSettingsButton onClick={() => setSettingsOpen(true)} />
          </div>
        ) : null}
      </div>

      {isPortfolioOwner ? (
        <PortfolioSettingsModal
          open={settingsOpen}
          onClose={() => {
            flushPendingSave();
            setSettingsOpen(false);
          }}
          settings={settings}
          onChange={updateSection}
          onThemeChange={setThemeId}
          onNavigationChange={updateNavigation}
          onGlobalChange={updateGlobal}
          onSaveCustomTheme={saveCustomTheme}
          onRenameCustomTheme={renameCustomTheme}
          onDuplicateTheme={duplicateTheme}
          onResetBuiltinTheme={resetBuiltinTheme}
          onDeleteCustomTheme={deleteCustomTheme}
          onReset={resetSettings}
          availableTools={strengths}
        />
      ) : null}

      {isPagesMode ? (
        <div className="relative h-[100dvh] overflow-hidden">
          {settings.hero.enabled ? (
            <div
              className={`h-full overflow-y-auto overscroll-contain ${
                activePageId === 'hero' ? '' : 'hidden'
              }`}
              aria-hidden={activePageId !== 'hero'}
            >
              <PortfolioHeroSection
                creatorId={creatorId}
                fullName={profile.fullName}
                nameLead={nameLead}
                nameAccent={nameAccent}
                specialite={profile.specialite}
                description={heroDescription}
                avatarUrl={profile.avatarUrl}
                isVerified={profile.isVerified}
                isAvailable={profile.isAvailable}
                responseTimeLabel={profile.responseTimeLabel}
                yearsOfExperience={profile.yearsOfExperience}
                workCount={resolveExactContentCount(profile) ?? undefined}
                locationLabel={locationLabel}
                stats={heroStats}
                socialLinks={socialLinks}
                tools={settings.hero.showTools ? heroTools : []}
                contactHref={heroContactHref}
                showWorkCta={showWorkSection}
                showContactCta={settings.hero.showContactCta}
                navItems={navItems}
                presentation={heroPresentation}
                suppressBackground={suppressSectionBackgrounds}
                globalBackgroundStyle={globalBgStyle}
                geomFadeEnabled={motionProfileEnablesHeroGeomFade(motionProfile)}
                contentGutter={settings.global.contentGutter}
              />
            </div>
          ) : null}

          {contentSectionOrder.map((sectionKey) => {
            if (!sectionVisibility[sectionKey]) return null;
            const active = activePageId === sectionKey;
            return (
              <div
                key={sectionKey}
                className={`h-full overflow-y-auto overscroll-contain ${active ? '' : 'hidden'}`}
                aria-hidden={!active}
              >
                <main
                  className={`${editorialShellClass} mx-auto w-full space-y-0 pb-16 sm:pb-20 ${
                    hasGlobalBg ? '' : 'bg-white'
                  } ${globalWidthClass ?? ''}`}
                >
                  {renderContentSection(sectionKey)}
                </main>
                {shouldShowFooterOnPage(sectionKey) ? (
                  <EditorialPortfolioFooter
                    creatorName={profile.fullName}
                    creatorId={creatorId}
                    avatarUrl={profile.avatarUrl}
                    bio={profile.bio}
                    whyMeText={whyMeBlocks[0]?.text ?? null}
                    email={profile.contactEmail}
                    phone={profile.phone}
                    locationLabel={locationLabel}
                    hoursLabel={availabilityDisplay}
                    profileVisits={profileVisits}
                    links={uniqueContactLinks}
                    contentClassName={editorialShellClass}
                    presentation={footerPresentation}
                    transparentBase={hasGlobalBg}
                    isAvailable={profile.isAvailable}
                    responseTimeLabel={profile.responseTimeLabel}
                    contactHref={
                      profile.contactEmail?.trim()
                        ? `mailto:${profile.contactEmail.trim()}`
                        : heroContactHref
                    }
                    stackOnContact={
                      hasGlobalBg ||
                      (showContactSectionResolved && contactPresentation.sectionBackgroundEnabled)
                    }
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {settings.hero.enabled ? (
            <PortfolioHeroSection
              creatorId={creatorId}
              fullName={profile.fullName}
              nameLead={nameLead}
              nameAccent={nameAccent}
              specialite={profile.specialite}
              description={heroDescription}
              avatarUrl={profile.avatarUrl}
              isVerified={profile.isVerified}
              isAvailable={profile.isAvailable}
              responseTimeLabel={profile.responseTimeLabel}
              yearsOfExperience={profile.yearsOfExperience}
              workCount={resolveExactContentCount(profile) ?? undefined}
              locationLabel={locationLabel}
              stats={heroStats}
              socialLinks={socialLinks}
              tools={settings.hero.showTools ? heroTools : []}
              contactHref={heroContactHref}
              showWorkCta={showWorkSection}
              showContactCta={settings.hero.showContactCta}
              navItems={navItems}
              presentation={heroPresentation}
              suppressBackground={suppressSectionBackgrounds}
              globalBackgroundStyle={globalBgStyle}
              geomFadeEnabled={motionProfileEnablesHeroGeomFade(motionProfile)}
              contentGutter={settings.global.contentGutter}
            />
          ) : null}

          <main
            className={`${editorialShellClass} mx-auto w-full space-y-0 pb-16 sm:pb-20 ${
              hasGlobalBg ? '' : 'bg-white'
            } ${globalWidthClass ?? ''}`}
          >
            {contentSectionOrder.map((sectionKey) => (
              <Fragment key={sectionKey}>{renderContentSection(sectionKey)}</Fragment>
            ))}
          </main>

          {settings.footer.enabled ? (
            <EditorialPortfolioFooter
              creatorName={profile.fullName}
              creatorId={creatorId}
              avatarUrl={profile.avatarUrl}
              bio={profile.bio}
              whyMeText={whyMeBlocks[0]?.text ?? null}
              email={profile.contactEmail}
              phone={profile.phone}
              locationLabel={locationLabel}
              hoursLabel={availabilityDisplay}
              profileVisits={profileVisits}
              links={uniqueContactLinks}
              contentClassName={editorialShellClass}
              presentation={footerPresentation}
              transparentBase={hasGlobalBg}
              isAvailable={profile.isAvailable}
              responseTimeLabel={profile.responseTimeLabel}
              contactHref={
                profile.contactEmail?.trim()
                  ? `mailto:${profile.contactEmail.trim()}`
                  : heroContactHref
              }
              stackOnContact={
                hasGlobalBg ||
                (showContactSectionResolved && contactPresentation.sectionBackgroundEnabled)
              }
            />
          ) : null}
        </>
      )}
    </PortfolioThemeRoot>
  );
}
