import { resolveSectionOrder } from '@/components/portfolio/portfolio-global-settings';
import type { PortfolioNavSectionKey } from '@/components/portfolio/portfolio-nav-items';
import type {
  PortfolioServicesBlockSettings,
  PortfolioServicesBlockScope,
  PortfolioServicesDistinctHeaderSettings,
  PortfolioServicesPresentationSettings,
  PortfolioServicesSectionOrganization,
  PortfolioServicesSectionSettings,
} from '@/components/portfolio/portfolio-services-settings';

export type { PortfolioServicesBlockScope };

export function servicesUsesSplitBlockConfig(
  organization: PortfolioServicesSectionOrganization
): boolean {
  return organization === 'separated' || organization === 'distinct';
}

export function servicesUsesDistinctSections(
  organization: PortfolioServicesSectionOrganization
): boolean {
  return organization === 'distinct';
}

export function resolveServicesBlockPresentation(
  presentation: PortfolioServicesPresentationSettings,
  kind: PortfolioServicesBlockScope
): PortfolioServicesPresentationSettings {
  const block = kind === 'skills' ? presentation.skillsBlock : presentation.servicesBlock;
  const split = servicesUsesSplitBlockConfig(presentation.sectionOrganization);

  // Combined mode: section-level design/frame is the source of truth (settings panel writes there).
  // Only keep per-block alternation so Noir can still do skills uniform / services alternate.
  if (!split) {
    return {
      ...presentation,
      cardBackgroundAlternation: block.cardBackgroundAlternation,
    };
  }

  return {
    ...presentation,
    ...(kind === 'skills'
      ? {
          skillsGalleryLayout: block.galleryLayout,
          skillsColumns: block.columns,
          skillsContentAlignment: block.contentAlignment,
          skillsIconPlacement: block.iconPlacement,
          displayMode: block.displayMode,
        }
      : {
          servicesGalleryLayout: block.galleryLayout,
          servicesColumns: block.columns,
          servicesContentAlignment: block.contentAlignment,
          servicesPricePlacement: block.pricePlacement,
          displayMode: block.displayMode,
        }),
    cardDesign: block.cardDesign,
    cardDesignIntensities: block.cardDesignIntensities,
    cardDesignTints: block.cardDesignTints,
    cardAccentColor: block.cardAccentColor,
    stageDesign: block.stageDesign,
    stageBackgroundEnabled: block.stageBackgroundEnabled,
    stageBackgroundColor: block.stageBackgroundColor,
    stageBackgroundOpacity: block.stageBackgroundOpacity,
    stageBorder: block.stageBorder,
    stageBorderColor: block.stageBorderColor,
    stageBorderRadius: block.stageBorderRadius,
    stagePadding: block.stagePadding,
    stagePattern: block.stagePattern,
    stagePatternColor: block.stagePatternColor,
    stagePatternOpacity: block.stagePatternOpacity,
    cardBorder: block.cardBorder,
    cardBorderColor: block.cardBorderColor,
    cardBackgroundEnabled: block.cardBackgroundEnabled,
    cardBackgroundColor: block.cardBackgroundColor,
    cardBorderRadius: block.cardBorderRadius,
    cardPadding: block.cardPadding,
    cardBackgroundAlternation: block.cardBackgroundAlternation,
    cardDecorEnabled: block.cardDecorEnabled,
    cardDecorShape: block.cardDecorShape,
    cardDecorColor: block.cardDecorColor,
    cardDecorOpacity: block.cardDecorOpacity,
    cardDecorSize: block.cardDecorSize,
    cardDecorX: block.cardDecorX,
    cardDecorY: block.cardDecorY,
    cardDecorRotation: block.cardDecorRotation,
    cardDecorAlternation: block.cardDecorAlternation,
    cardBackgroundFill: block.cardBackgroundFill,
    cardBackgroundColorA: block.cardBackgroundColorA,
    cardBackgroundColorB: block.cardBackgroundColorB,
    cardBackgroundSplitAxis: block.cardBackgroundSplitAxis,
    cardBackgroundSplitPosition: block.cardBackgroundSplitPosition,
    cardDividerEnabled: block.cardDividerEnabled,
    cardDividerShape: block.cardDividerShape,
    cardDividerAngle: block.cardDividerAngle,
    cardDividerCurveDepth: block.cardDividerCurveDepth,
    cardDividerColor: block.cardDividerColor,
    cardDividerThickness: block.cardDividerThickness,
    cardDividerOpacity: block.cardDividerOpacity,
  };
}

export function resolveDistinctBlockSectionTitle(
  settings: PortfolioServicesSectionSettings,
  kind: PortfolioServicesBlockScope
): string {
  const header = kind === 'skills' ? settings.skillsHeader : settings.servicesHeader;

  if (kind === 'skills') {
    switch (header.titlePreset) {
      case 'expertise':
        return 'EXPERTISE';
      case 'skills-services':
        return 'SKILLS & SERVICES';
      case 'custom':
        return header.titleCustom.trim() || 'SKILLS & TOOLS';
      default:
        return 'SKILLS & TOOLS';
    }
  }

  switch (header.titlePreset) {
    case 'what-i-offer':
      return 'WHAT I OFFER';
    case 'expertise':
      return 'EXPERTISE';
    case 'skills-services':
      return 'SERVICES';
    case 'custom':
      return header.titleCustom.trim() || 'SERVICES';
    default:
      return 'SERVICES';
  }
}

export function resolveDistinctBlockSectionSubtitle(
  settings: PortfolioServicesSectionSettings,
  kind: PortfolioServicesBlockScope
): string {
  const header = kind === 'skills' ? settings.skillsHeader : settings.servicesHeader;

  if (kind === 'skills') {
    switch (header.subtitlePreset) {
      case 'minimal':
        return '';
      case 'short':
        return 'Software, plugins, and workflow essentials I rely on every day.';
      case 'craft':
        return 'Hands-on expertise across the tools and technologies behind my work.';
      case 'custom':
        return header.subtitleCustom.trim();
      default:
        return '';
    }
  }

  switch (header.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return 'Clear packages, pricing, and delivery — built around your project.';
    case 'collaboration':
      return 'Tailored support from brief to delivery — built around your goals.';
    case 'craft':
      return 'Reliable services and deliverables you can count on.';
    case 'custom':
      return header.subtitleCustom.trim();
    default:
      return '';
  }
}

export function patchServicesBlockSettings(
  services: PortfolioServicesSectionSettings,
  scope: PortfolioServicesBlockScope,
  patch: Partial<PortfolioServicesBlockSettings>
): Partial<PortfolioServicesSectionSettings> {
  if (!servicesUsesSplitBlockConfig(services.sectionOrganization)) {
    return patch as Partial<PortfolioServicesSectionSettings>;
  }

  const key = scope === 'skills' ? 'skillsBlock' : 'servicesBlock';
  return {
    [key]: {
      ...services[key],
      ...patch,
    },
  };
}

export function patchServicesDistinctHeader(
  services: PortfolioServicesSectionSettings,
  scope: PortfolioServicesBlockScope,
  patch: Partial<PortfolioServicesDistinctHeaderSettings>
): Partial<PortfolioServicesSectionSettings> {
  const key = scope === 'skills' ? 'skillsHeader' : 'servicesHeader';
  return {
    [key]: {
      ...services[key],
      ...patch,
    },
  };
}

type BlockFieldRootMap = Partial<
  Record<keyof PortfolioServicesBlockSettings, keyof PortfolioServicesSectionSettings>
>;

export function readServicesBlockField<K extends keyof PortfolioServicesBlockSettings>(
  services: PortfolioServicesSectionSettings,
  scope: PortfolioServicesBlockScope,
  field: K
): PortfolioServicesBlockSettings[K] {
  if (servicesUsesSplitBlockConfig(services.sectionOrganization)) {
    return services[scope === 'skills' ? 'skillsBlock' : 'servicesBlock'][field];
  }

  const rootMap: BlockFieldRootMap = {
    galleryLayout: scope === 'skills' ? 'skillsGalleryLayout' : 'servicesGalleryLayout',
    columns: scope === 'skills' ? 'skillsColumns' : 'servicesColumns',
    displayMode: 'displayMode',
    contentAlignment: scope === 'skills' ? 'skillsContentAlignment' : 'servicesContentAlignment',
    pricePlacement: 'servicesPricePlacement',
    iconPlacement: 'skillsIconPlacement',
    cardDesign: 'cardDesign',
    cardDesignIntensities: 'cardDesignIntensities',
    cardDesignTints: 'cardDesignTints',
    cardAccentColor: 'cardAccentColor',
    stageDesign: 'stageDesign',
    stageBackgroundEnabled: 'stageBackgroundEnabled',
    stageBackgroundColor: 'stageBackgroundColor',
    stageBackgroundOpacity: 'stageBackgroundOpacity',
    stageBorder: 'stageBorder',
    stageBorderColor: 'stageBorderColor',
    stageBorderRadius: 'stageBorderRadius',
    stagePadding: 'stagePadding',
    stagePattern: 'stagePattern',
    stagePatternColor: 'stagePatternColor',
    stagePatternOpacity: 'stagePatternOpacity',
    cardBorder: 'cardBorder',
    cardBorderColor: 'cardBorderColor',
    cardBackgroundEnabled: 'cardBackgroundEnabled',
    cardBackgroundColor: 'cardBackgroundColor',
    cardBorderRadius: 'cardBorderRadius',
    cardPadding: 'cardPadding',
    cardBackgroundAlternation: 'cardBackgroundAlternation',
    cardDecorEnabled: 'cardDecorEnabled',
    cardDecorShape: 'cardDecorShape',
    cardDecorColor: 'cardDecorColor',
    cardDecorOpacity: 'cardDecorOpacity',
    cardDecorSize: 'cardDecorSize',
    cardDecorX: 'cardDecorX',
    cardDecorY: 'cardDecorY',
    cardDecorRotation: 'cardDecorRotation',
    cardDecorAlternation: 'cardDecorAlternation',
    cardBackgroundFill: 'cardBackgroundFill',
    cardBackgroundColorA: 'cardBackgroundColorA',
    cardBackgroundColorB: 'cardBackgroundColorB',
    cardBackgroundSplitAxis: 'cardBackgroundSplitAxis',
    cardBackgroundSplitPosition: 'cardBackgroundSplitPosition',
    cardDividerEnabled: 'cardDividerEnabled',
    cardDividerShape: 'cardDividerShape',
    cardDividerAngle: 'cardDividerAngle',
    cardDividerCurveDepth: 'cardDividerCurveDepth',
    cardDividerColor: 'cardDividerColor',
    cardDividerThickness: 'cardDividerThickness',
    cardDividerOpacity: 'cardDividerOpacity',
  };

  const rootKey = rootMap[field];
  if (!rootKey) {
    return services[scope === 'skills' ? 'skillsBlock' : 'servicesBlock'][field];
  }
  return services[rootKey] as unknown as PortfolioServicesBlockSettings[K];
}

export function resolvePortfolioContentSectionOrder(
  order: PortfolioNavSectionKey[] | undefined,
  sectionOrganization: PortfolioServicesSectionOrganization
): PortfolioNavSectionKey[] {
  const resolved = resolveSectionOrder(order);

  if (sectionOrganization !== 'distinct') {
    return resolved.filter((key) => key !== 'skills');
  }

  if (resolved.includes('skills')) {
    return resolved;
  }

  const servicesIndex = resolved.indexOf('services');
  if (servicesIndex === -1) {
    return resolveSectionOrder([...resolved, 'skills', 'services']);
  }

  const next = [...resolved];
  next.splice(servicesIndex, 0, 'skills');
  return resolveSectionOrder(next);
}
