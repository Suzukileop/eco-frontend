import { z } from 'zod';
import type { ContactVisibilitySettings } from '@/lib/contact-visibility';
import { dedupeSpokenLanguages } from '@/lib/spoken-languages';
import { CREATOR_GENDER_VALUES } from '@/lib/creator-gender';

export const platformEnum = z.enum([
  'INSTAGRAM',
  'YOUTUBE',
  'TIKTOK',
  'TWITTER',
  'LINKEDIN',
  'GITHUB',
  'OTHER',
]);

export const linkTypeEnum = z.enum(['WEBSITE', 'CTA', 'CUSTOM', 'SOCIAL']);

export const profileLinkSchema = z.object({
  id: z.string().uuid(),
  type: linkTypeEnum.or(z.string()),
  label: z.string().min(1, 'Label is required.').max(100),
  url: z.string().min(1, 'URL required.').url('Invalid URL.'),
  sortOrder: z.number().int().min(0),
  platform: platformEnum.nullable().optional(),
});

export const profileServiceSchema = z.object({
  id: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  title: z.string().min(1, 'Title is required.').max(120),
  description: z.string().max(2000).optional().or(z.literal('')),
  basePriceCents: z.number().int().min(0).nullable().optional(),
  deadline: z.string().max(80).optional().or(z.literal('')).nullable(),
});

export const faqItemSchema = z.object({
  id: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  question: z.string().min(1, 'Question is required.').max(300),
  answer: z.string().min(1, 'Answer is required.').max(2000),
});

export const subtitleItemSchema = z.object({
  value: z.string().max(500),
});

export const taskItemSchema = z.object({
  value: z.string().max(300),
});

export const strengthItemSchema = z.object({
  value: z.string().min(1, 'Strength is required.').max(80),
  /** Optional portfolio card blurb — empty keeps the auto-generated description. */
  description: z.string().max(280).optional().or(z.literal('')),
});

export const experienceStatusEnum = z.enum(['ONGOING', 'FINISHED']);

export const experienceEmploymentTypeEnum = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'FREELANCE',
  'INTERNSHIP',
]);

export const experienceProofPlatformEnum = z.enum([
  'GITHUB',
  'FACEBOOK',
  'LINKEDIN',
  'INSTAGRAM',
  'YOUTUBE',
  'WEBSITE',
  'OTHER',
]);

export const experienceProofLinkSchema = z.object({
  id: z.string().uuid(),
  label: z.string().max(100),
  url: z.string().max(500),
  platform: experienceProofPlatformEnum.nullable().optional(),
  sortOrder: z.number().int().min(0),
});

export const profileMediaBlockSchema = z.object({
  id: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  text: z.string().min(1, 'Text is required.').max(4000),
  mediaUrl: z.string().optional().or(z.literal('')),
  mediaType: z.enum(['IMAGE', 'VIDEO']).nullable().optional(),
  title: z.string().max(200).optional().or(z.literal('')),
  organization: z.string().max(120).optional().or(z.literal('')),
  period: z.string().max(80).optional().or(z.literal('')),
  subtitles: z.array(subtitleItemSchema).max(10),
  status: experienceStatusEnum.nullable().optional(),
  tasks: z.array(taskItemSchema).max(12),
  tools: z.array(strengthItemSchema).max(8),
  links: z.array(experienceProofLinkSchema).max(5),
  remarks: z.string().max(500).optional().or(z.literal('')),
  location: z.string().max(120).optional().or(z.literal('')),
  employmentType: experienceEmploymentTypeEnum.nullable().optional(),
});

export const spokenLanguageSchema = z.object({
  value: z.string().min(1, 'Language is required.').max(80),
});

export const profileSchema = z
  .object({
    fullName: z.string().min(1, 'Name is required.').max(150),
    bio: z.string().max(8000).optional(),
    specialite: z.string().max(150).optional(),
    gender: z.enum(CREATOR_GENDER_VALUES).optional().or(z.literal('')),
    spokenLanguages: z.array(spokenLanguageSchema).max(20),
    locationCity: z.string().optional(),
    locationCountry: z.string().optional(),
    locationLat: z.number().nullable().optional(),
    locationLng: z.number().nullable().optional(),
    timezoneId: z.string().optional(),
    contactAddress: z.string().max(300).optional(),
    contactPhone: z.string().max(50).optional(),
    contactEmail: z.string().email('Invalid email.').optional().or(z.literal('')),
    availabilityHours: z.string().max(200).optional(),
    isAvailable: z.boolean(),
    profileLinks: z.array(profileLinkSchema).max(10),
    serviceOffers: z.array(profileServiceSchema).max(8),
    faqItems: z.array(faqItemSchema).max(5),
    whyMeBlocks: z.array(profileMediaBlockSchema).max(50),
    experienceBlocks: z.array(profileMediaBlockSchema).max(50),
    yearsOfExperience: z.number().int().min(0).max(80).nullable().optional(),
    strengthsTools: z.array(strengthItemSchema).max(12),
  })
  .superRefine((data, ctx) => {
    if (data.locationLat == null || data.locationLng == null || !data.timezoneId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enable device location — required for city and timezone detection.',
        path: ['timezoneId'],
      });
    }
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ProfileMediaBlockForm = z.infer<typeof profileMediaBlockSchema>;
export type ProfileLinkForm = z.infer<typeof profileLinkSchema>;
export type ProfileServiceForm = z.infer<typeof profileServiceSchema>;
export type FaqItemForm = z.infer<typeof faqItemSchema>;

export function createEmptyProfileBlock(sortOrder: number): ProfileMediaBlockForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    text: '',
    mediaUrl: '',
    mediaType: null,
    title: '',
    organization: '',
    period: '',
    subtitles: [],
    status: null,
    tasks: [],
    tools: [],
    links: [],
    remarks: '',
    location: '',
    employmentType: null,
  };
}

export function createEmptyExperienceProofLink(sortOrder: number) {
  return {
    id: crypto.randomUUID(),
    label: '',
    url: '',
    platform: null as z.infer<typeof experienceProofPlatformEnum> | null,
    sortOrder,
  };
}

export function createEmptyProfileLink(sortOrder: number): ProfileLinkForm {
  return {
    id: crypto.randomUUID(),
    type: 'CUSTOM',
    label: '',
    url: '',
    sortOrder,
    platform: null,
  };
}

export function createEmptyProfileService(sortOrder: number): ProfileServiceForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    title: '',
    description: '',
    basePriceCents: null,
    deadline: '',
  };
}

export function createEmptyFaqItem(sortOrder: number): FaqItemForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    question: '',
    answer: '',
  };
}

export function parseSubtitleItems(raw: unknown): Array<{ value: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return { value: item.trim() };
      if (item && typeof item === 'object' && 'value' in item) {
        return { value: String((item as { value: unknown }).value).trim() };
      }
      return null;
    })
    .filter((item): item is { value: string } => Boolean(item?.value));
}

export function parseSpokenLanguages(raw: unknown, legacyLanguages?: string | null): Array<{ value: string }> {
  let parsed: string[] = [];

  if (Array.isArray(raw) && raw.length > 0) {
    parsed = raw
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object' && 'value' in item) {
          return String((item as { value: unknown }).value).trim();
        }
        return '';
      })
      .filter(Boolean);
  } else {
    const legacy = legacyLanguages?.trim();
    if (legacy) {
      parsed = legacy
        .split(/[,;|/]+/)
        .map((part) => part.trim())
        .filter(Boolean);
    }
  }

  return dedupeSpokenLanguages(parsed).map((value) => ({ value }));
}

export function parseProfileLinks(raw: unknown): ProfileLinkForm[] {
  if (!Array.isArray(raw)) return [];
  const links: ProfileLinkForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const link = item as Record<string, unknown>;
    const typeRaw = link.type != null ? String(link.type).toUpperCase() : 'CUSTOM';
    const typeParsed = linkTypeEnum.safeParse(typeRaw);
    const platformRaw = link.platform != null ? String(link.platform).toUpperCase() : null;
    const platformParsed = platformRaw ? platformEnum.safeParse(platformRaw) : null;
    links.push({
      id: link.id != null ? String(link.id) : crypto.randomUUID(),
      type: typeParsed.success ? typeParsed.data : 'CUSTOM',
      label: link.label != null ? String(link.label) : '',
      url: link.url != null ? String(link.url) : '',
      sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : index,
      platform: platformParsed?.success ? platformParsed.data : null,
    });
  });
  return links.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function parseProfileServices(raw: unknown): ProfileServiceForm[] {
  if (!Array.isArray(raw)) return [];
  const services: ProfileServiceForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const service = item as Record<string, unknown>;
    services.push({
      id: service.id != null ? String(service.id) : crypto.randomUUID(),
      sortOrder: typeof service.sortOrder === 'number' ? service.sortOrder : index,
      title: service.title != null ? String(service.title) : '',
      description: service.description != null ? String(service.description) : '',
      basePriceCents:
        service.basePriceCents != null && service.basePriceCents !== ''
          ? Number(service.basePriceCents)
          : null,
      deadline: service.deadline != null ? String(service.deadline) : '',
    });
  });
  return services.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function parseFaqItems(raw: unknown): FaqItemForm[] {
  if (!Array.isArray(raw)) return [];
  const faqItems: FaqItemForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const faq = item as Record<string, unknown>;
    faqItems.push({
      id: faq.id != null ? String(faq.id) : crypto.randomUUID(),
      sortOrder: typeof faq.sortOrder === 'number' ? faq.sortOrder : index,
      question: faq.question != null ? String(faq.question) : '',
      answer: faq.answer != null ? String(faq.answer) : '',
    });
  });
  return faqItems.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function buildProfileLinksFromLegacy(p: {
  profileLinks?: Array<{
    id: string;
    type: string;
    label: string;
    url: string;
    sortOrder: number;
    platform?: string | null;
  }> | null;
  websiteUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  socialLinks?: Record<string, string> | string | null;
}): ProfileLinkForm[] {
  const fromApi = parseProfileLinks(p.profileLinks);
  if (fromApi.length > 0) return fromApi;

  const links: ProfileLinkForm[] = [];
  let order = 0;

  const website = p.websiteUrl?.trim();
  if (website) {
    links.push({
      id: crypto.randomUUID(),
      type: 'WEBSITE',
      label: 'Site web',
      url: website,
      sortOrder: order++,
      platform: null,
    });
  }

  const ctaUrl = p.ctaUrl?.trim();
  if (ctaUrl) {
    links.push({
      id: crypto.randomUUID(),
      type: 'CTA',
      label: p.ctaLabel?.trim() || 'En savoir plus',
      url: ctaUrl,
      sortOrder: order++,
      platform: null,
    });
  }

  let socialRecord: Record<string, string> | null = null;
  if (p.socialLinks) {
    if (typeof p.socialLinks === 'string') {
      try {
        socialRecord = JSON.parse(p.socialLinks) as Record<string, string>;
      } catch {
        socialRecord = null;
      }
    } else {
      socialRecord = p.socialLinks;
    }
  }

  if (socialRecord) {
    for (const [platform, url] of Object.entries(socialRecord)) {
      if (!url.trim()) continue;
      const platformParsed = platformEnum.safeParse(platform.toUpperCase());
      links.push({
        id: crypto.randomUUID(),
        type: 'SOCIAL',
        label: platform,
        url,
        sortOrder: order++,
        platform: platformParsed.success ? platformParsed.data : 'OTHER',
      });
    }
  }

  return links;
}

export function parseDemoSubtitles(
  subtitles?: string[] | null,
  legacyDescription?: string | null
): Array<{ value: string }> {
  const parsed = parseSubtitleItems(subtitles);
  if (parsed.length > 0) return parsed;
  const legacy = legacyDescription?.trim();
  return legacy ? [{ value: legacy }] : [];
}

export function parseProfileBlocks(raw: unknown): ProfileMediaBlockForm[] {
  if (!Array.isArray(raw)) return [];
  const blocks: ProfileMediaBlockForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const block = item as Record<string, unknown>;
    const mediaUrl = block.mediaUrl != null ? String(block.mediaUrl) : '';
    const mediaTypeRaw = block.mediaType != null ? String(block.mediaType).toUpperCase() : null;
    const mediaType = mediaTypeRaw === 'VIDEO' ? 'VIDEO' : mediaTypeRaw === 'IMAGE' ? 'IMAGE' : null;
    const statusRaw = block.status != null ? String(block.status).toUpperCase() : null;
    const status =
      statusRaw === 'ONGOING' || statusRaw === 'FINISHED' ? statusRaw : null;
    const employmentRaw =
      block.employmentType != null ? String(block.employmentType).toUpperCase() : null;
    const employmentType =
      employmentRaw === 'FULL_TIME' ||
      employmentRaw === 'PART_TIME' ||
      employmentRaw === 'CONTRACT' ||
      employmentRaw === 'FREELANCE' ||
      employmentRaw === 'INTERNSHIP'
        ? employmentRaw
        : null;
    blocks.push({
      id: block.id != null ? String(block.id) : crypto.randomUUID(),
      sortOrder: typeof block.sortOrder === 'number' ? block.sortOrder : index,
      title: block.title != null ? String(block.title) : '',
      organization: block.organization != null ? String(block.organization) : '',
      text: block.text != null ? String(block.text) : '',
      mediaUrl,
      mediaType: mediaUrl ? mediaType ?? inferProfileMediaType(mediaUrl) : null,
      period: block.period != null ? String(block.period) : '',
      subtitles: parseSubtitleItems(block.subtitles),
      status,
      tasks: parseSubtitleItems(block.tasks).map((item) => ({
        value: item.value.slice(0, 300),
      })),
      tools: parseStrengthsTools(block.tools).slice(0, 8),
      links: parseExperienceProofLinks(block.links),
      remarks: block.remarks != null ? String(block.remarks) : '',
      location: block.location != null ? String(block.location) : '',
      employmentType,
    });
  });
  return blocks.sort((a, b) => a.sortOrder - b.sortOrder);
}

function parseExperienceProofLinks(raw: unknown): z.infer<typeof experienceProofLinkSchema>[] {
  if (!Array.isArray(raw)) return [];
  const links: z.infer<typeof experienceProofLinkSchema>[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const link = item as Record<string, unknown>;
    const url = link.url != null ? String(link.url).trim() : '';
    const label = link.label != null ? String(link.label).trim() : '';
    if (!url && !label) return;
    const platformRaw = link.platform != null ? String(link.platform).toUpperCase() : null;
    const platform =
      platformRaw === 'GITHUB' ||
      platformRaw === 'FACEBOOK' ||
      platformRaw === 'LINKEDIN' ||
      platformRaw === 'INSTAGRAM' ||
      platformRaw === 'YOUTUBE' ||
      platformRaw === 'WEBSITE' ||
      platformRaw === 'OTHER'
        ? platformRaw
        : null;
    links.push({
      id: link.id != null ? String(link.id) : crypto.randomUUID(),
      label,
      url,
      platform,
      sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : index,
    });
  });
  return links.sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 5);
}

/** Experience blocks: migrate legacy data into dedicated fields. */
export function parseExperienceBlocks(raw: unknown): ProfileMediaBlockForm[] {
  return parseProfileBlocks(raw).map((block) => {
    let period = block.period?.trim() ?? '';
    let title = block.title?.trim() ?? '';
    const organization = block.organization?.trim() ?? '';
    let text = block.text?.trim() ?? '';
    let subtitles = [...block.subtitles];

    if (!period && subtitles[0]?.value?.trim()) {
      period = subtitles[0].value.trim();
      subtitles = subtitles.slice(1);
    }

    if (!title && text.includes('\n')) {
      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length > 1) {
        title = lines[0];
        text = lines.slice(1).join('\n');
      }
    }

    return {
      ...block,
      period,
      title,
      organization,
      text,
      subtitles,
    };
  });
}

export function parseStrengthsTools(raw: unknown): Array<{ value: string; description?: string }> {
  if (!Array.isArray(raw)) return [];
  const parsed: Array<{ value: string; description?: string }> = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const value = item.trim();
      if (value) parsed.push({ value, description: '' });
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const value = String(record.value ?? record.name ?? '').trim();
    if (!value) continue;
    const description =
      typeof record.description === 'string' ? record.description.trim() : '';
    parsed.push({ value, description });
  }
  return parsed;
}

export function inferProfileMediaType(url: string): 'IMAGE' | 'VIDEO' {
  const probe = url.toLowerCase();
  if (/\.(mp4|webm|mov)(\?|$)/i.test(probe) || probe.includes('video/')) {
    return 'VIDEO';
  }
  return 'IMAGE';
}

export function serializeProfileBlocks(blocks: ProfileMediaBlockForm[]) {
  return blocks
    .filter((block) => block.text.trim().length > 0)
    .map((block, index) => {
      const mediaUrl = block.mediaUrl?.trim() || null;
      const title = block.title?.trim() || null;
      const organization = block.organization?.trim() || null;
      const period = block.period?.trim() || null;
      const remarks = block.remarks?.trim() || null;
      const location = block.location?.trim() || null;
      return {
        id: block.id,
        sortOrder: index,
        title,
        organization,
        text: block.text.trim(),
        mediaUrl,
        mediaType: mediaUrl ? block.mediaType ?? inferProfileMediaType(mediaUrl) : null,
        period,
        subtitles: block.subtitles?.map((item) => item.value.trim()).filter(Boolean) ?? [],
        status: block.status ?? null,
        tasks: block.tasks?.map((item) => item.value.trim()).filter(Boolean) ?? [],
        tools: block.tools?.map((item) => item.value.trim()).filter(Boolean) ?? [],
        links: (block.links ?? [])
          .filter((link) => link.url.trim().length > 0 && link.label.trim().length > 0)
          .map((link, linkIndex) => ({
            id: link.id,
            label: link.label.trim(),
            url: link.url.trim(),
            platform: link.platform ?? null,
            sortOrder: linkIndex,
          })),
        remarks,
        location,
        employmentType: block.employmentType ?? null,
      };
    });
}

export function serializeProfileLinks(links: ProfileLinkForm[]) {
  return links
    .filter((link) => link.url.trim().length > 0 && link.label.trim().length > 0)
    .map((link, index) => ({
      id: link.id,
      type: link.type,
      label: link.label.trim(),
      url: link.url.trim(),
      sortOrder: index,
      platform: link.type === 'SOCIAL' ? link.platform ?? null : null,
    }));
}

export function serializeProfileServices(services: ProfileServiceForm[]) {
  return services
    .filter((service) => service.title.trim().length > 0)
    .map((service, index) => ({
      id: service.id,
      sortOrder: index,
      title: service.title.trim(),
      description: service.description?.trim() ?? '',
      basePriceCents: service.basePriceCents ?? null,
      deadline: service.deadline?.trim() ? service.deadline.trim() : null,
    }));
}

export function serializeFaqItems(items: FaqItemForm[]) {
  return items
    .filter((item) => item.question.trim().length > 0 && item.answer.trim().length > 0)
    .map((item, index) => ({
      id: item.id,
      sortOrder: index,
      question: item.question.trim(),
      answer: item.answer.trim(),
    }));
}

function trimOptional(value?: string | null): string {
  return value?.trim() ?? '';
}

function normalizeProfileComparable(values: ProfileFormValues, availabilityHours: string) {
  return {
    fullName: trimOptional(values.fullName),
    bio: trimOptional(values.bio),
    specialite: trimOptional(values.specialite),
    gender: trimOptional(values.gender),
    spokenLanguages: dedupeSpokenLanguages(
      values.spokenLanguages.map((item) => trimOptional(item.value)).filter(Boolean)
    ).sort(),
    locationCity: trimOptional(values.locationCity),
    locationCountry: trimOptional(values.locationCountry),
    locationLat: values.locationLat ?? null,
    locationLng: values.locationLng ?? null,
    timezoneId: trimOptional(values.timezoneId),
    contactAddress: trimOptional(values.contactAddress),
    contactPhone: trimOptional(values.contactPhone),
    contactEmail: trimOptional(values.contactEmail),
    availabilityHours: trimOptional(availabilityHours),
    isAvailable: values.isAvailable,
    profileLinks: serializeProfileLinks(values.profileLinks),
    serviceOffers: serializeProfileServices(values.serviceOffers),
    faqItems: serializeFaqItems(values.faqItems),
    whyMeBlocks: serializeProfileBlocks(values.whyMeBlocks),
    experienceBlocks: serializeProfileBlocks(values.experienceBlocks),
    yearsOfExperience: values.yearsOfExperience ?? null,
    strengthsTools: values.strengthsTools
      .map((item) => ({
        value: trimOptional(item.value),
        description: trimOptional(item.description ?? ''),
      }))
      .filter((item) => Boolean(item.value))
      .sort((a, b) => a.value.localeCompare(b.value)),
  };
}

export function hasProfileFormChanges(
  current: ProfileFormValues,
  saved: ProfileFormValues,
  currentAvailabilityHours: string,
  savedAvailabilityHours: string,
  currentVisibility: ContactVisibilitySettings,
  savedVisibility: ContactVisibilitySettings
): boolean {
  if (JSON.stringify(currentVisibility) !== JSON.stringify(savedVisibility)) {
    return true;
  }
  return (
    JSON.stringify(normalizeProfileComparable(current, currentAvailabilityHours)) !==
    JSON.stringify(normalizeProfileComparable(saved, savedAvailabilityHours))
  );
}
